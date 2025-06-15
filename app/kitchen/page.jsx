"use client";

import { useEffect, useState } from "react";
import { editOrderStatus, getKitchenOrders } from "@/app/actions/order";
import { addNotification } from "@/app/actions/notification";
import { subscribeToTopic, publishMessage } from "@/app/utils/mqtt";

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                let data = await getKitchenOrders();
                if (!data) {
                    const response = await fetch("/api/orders/kitchen");
                    if (!response.ok) {
                        alert("取得廚房訂單失敗");
                        return;
                    }
                    data = await response.json();
                }

                setOrders(data);
            } catch (err) {
                alert("取得廚房訂單失敗");
            }
        };

        // 初始獲取訂單
        fetchOrders();

        // 訂閱 MQTT 訊息
        subscribeToTopic((message) => {
            console.log("收到 MQTT 訊息:", message);
            
            // 處理新訂單
            if (message.type === "NEW_ORDER" && message.status === "PENDING") {
                console.log("收到新訂單通知，重新獲取訂單列表");
                setTimeout(fetchOrders, 1000);
            }
            
            // 處理訂單狀態更新
            if (message.type === "ORDER_STATUS_UPDATE" && message.status === "PREPARING") {
                console.log("收到訂單狀態更新通知，重新獲取訂單列表");
                setTimeout(fetchOrders, 1000);
            }
        });
        
    }, []);

    const handleCompleteOrder = async (orderId) => {
        try {
            // action
            let data = await editOrderStatus(
                {
                    status: "READY",
                },
                orderId
            );
            let response;
            if (!data) {
                // api
                response = await fetch(`/api/orders/${orderId}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        status: "READY",
                    }),
                });
                if (!response.ok) {
                    alert("完成訂單失敗");
                    return;
                }
                data = await response.json();
            }

            // 發送 MQTT 通知
            if (data) {
                publishMessage({
                    type: "ORDER_STATUS_UPDATE",
                    orderId: orderId,
                    status: "READY",
                    timestamp: new Date().toISOString(),
                    order: data
                });
            }

            setOrders((prev) => prev.filter((order) => order.id !== orderId));

            // 準備通知訊息
            const order = orders.find((order) => order.id === orderId);
            if (!order) return;

            // 構建餐點內容字串
            const itemsList = order.items.map(item => 
                `${item.menuItem.name} × ${item.quantity}`
            ).join('\n');

            // 構建完整通知訊息
            const notificationMessage = `您的餐點：\n${itemsList}\n總共：$${order.totalAmount.toFixed(2)}\n已製作完成請前往取餐`;

            // 傳送通知
            const customerId = order.customerId;

            let notificationRes = await addNotification(
                {
                    orderId,
                    message: notificationMessage,
                },
                customerId
            );
            if (!notificationRes) {
                response = await fetch(
                    `/api/notifications/users/${customerId}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderId,
                            message: notificationMessage,
                        }),
                    }
                );
                if (!response.ok) {
                    console.error("傳送通知失敗");
                    return;
                }
            }

            // 發送 email
            try {
                const emailResponse = await fetch('/api/email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        to: order.customer.email,
                        subject: '您的餐點已準備完成',
                        message: notificationMessage,
                    }),
                });

                if (!emailResponse.ok) {
                    console.error('發送 email 失敗');
                }
            } catch (emailError) {
                console.error('發送 email 時發生錯誤:', emailError);
            }

        } catch (error) {
            console.error("完成訂單失敗:", error);
            alert("完成訂單失敗：" + error.message);
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-extrabold mb-6 text-gray-800">
                👨‍🍳 廚房訂單看板
            </h1>

            {orders.length === 0 ? (
                <div className="text-center text-gray-500 mt-12 text-lg">
                    暫無待處理訂單 🍳
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {orders.map((order, idx) => (
                        <div
                            key={`${order.id}-${idx}`}
                            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 p-6 border border-gray-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        訂單 #{order.id.slice(0, 8)}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <div className="border-t pt-4">
                                <ul className="space-y-2 text-sm">
                                    {order.items.map((item, idx) => (
                                        <li key={`${item.id}-${idx}`}>
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium">
                                                    {item.menuItem.name} ×{" "}
                                                    {item.quantity}
                                                </span>
                                            </div>
                                            {item.specialRequest && (
                                                <div className="mt-1 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                                                    <strong>備註：</strong>{" "}
                                                    {item.specialRequest}
                                                </div>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => handleCompleteOrder(order.id)}
                                className="mt-5 w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                ✅ 標記為已完成
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
