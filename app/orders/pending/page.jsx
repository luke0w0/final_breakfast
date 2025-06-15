"use client";

import { useEffect, useState } from "react";
import { editOrderStatus, getPendingOrders } from "@/app/actions/order";
import { addNotification } from "@/app/actions/notification";
import { subscribeToTopic, publishMessage } from "@/app/utils/mqtt";

export default function PendingOrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const getOrders = async () => {
            try {
                // action
                let data = await getPendingOrders();
                if (!data) {
                    const response = await fetch(`/api/orders/pending`);
                    if (!response.ok) {
                        alert("獲取待處理訂單失敗");
                        return;
                    }
                    data = await response.json();
                }
                setOrders(data);
            } catch (err) {
                alert("獲取待處理訂單失敗");
            }
        };

        // 初始獲取訂單
        getOrders();

        // 訂閱 MQTT 訊息
        subscribeToTopic((message) => {
            console.log("收到 MQTT 訊息:", message);
            
            // 處理新訂單
            if (message.type === "NEW_ORDER" && message.status === "PENDING") {
                console.log("收到新訂單通知，重新獲取訂單列表");
                // 立即重新獲取訂單列表
                getOrders();
            }
            
            // 處理訂單狀態更新
            if (message.type === "ORDER_STATUS_UPDATE") {
                console.log("收到訂單狀態更新通知，重新獲取訂單列表");
                // 立即重新獲取訂單列表
                getOrders();
            }

            // 處理訂單取消
            if (message.type === "ORDER_STATUS_UPDATE" && message.status === "CANCELLED") {
                console.log("收到訂單取消通知，重新獲取訂單列表");
                // 立即重新獲取訂單列表
                getOrders();
            }
        });

        // 清理函數
        return () => {
            console.log("清理 MQTT 訂閱");
        };
    }, []);

    const handleAcceptOrder = async (orderId) => {
        try {
            let response;
            // action
            let data = await editOrderStatus({ status: "PREPARING" }, orderId);

            if (!data) {
                // api
                response = await fetch(`/api/orders/${orderId}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "PREPARING" }),
                });
                if (!response.ok) {
                    alert("修改訂單狀態失敗");
                    return;
                }
                data = await response.json();
            }

            // 確保資料庫更新成功後，發送 MQTT 通知
            if (data) {
                console.log('準備發送接受訂單的 MQTT 通知:', data);
                publishMessage({
                    type: "ORDER_STATUS_UPDATE",
                    orderId: orderId,
                    status: "PREPARING",
                    timestamp: new Date().toISOString(),
                    order: data
                });
                console.log('接受訂單的 MQTT 通知已發送');
            }

            setOrders((prev) => prev.filter((order) => order.id !== orderId));

            // 傳送通知
            const customerId = orders.find(
                (order) => order.id === orderId
            ).customerId;

            // action
            let notificationRes = await addNotification(
                {
                    orderId,
                    message: `訂單 ${orderId.slice(0, 8)} 正在製作中`,
                },
                customerId
            );
            if (!notificationRes) {
                // api
                response = await fetch(
                    `/api/notifications/users/${customerId}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            orderId,
                            message: `訂單 ${orderId.slice(0, 8)} 正在製作中`,
                        }),
                    }
                );
                if (!response.ok) {
                    alert("傳送通知失敗");
                    return;
                }
                notificationRes = await response.json();
            }

        } catch (error) {
            console.error("Failed to update order status:", error);
            alert("更新訂單狀態失敗：" + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-6 py-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center sm:text-left text-gray-800">
                    待處理訂單
                </h1>

                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center sm:text-left">
                        目前沒有待處理訂單。
                    </p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order, idx) => (
                            <div
                                key={`${order.id}-${idx}`}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            訂單 #{order.id.slice(0, 8)}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <div></div>
                                </div>

                                <div className="mb-3 space-y-1">
                                    <p className="text-gray-700">
                                        <strong>總金額：</strong> $
                                        {order.totalAmount.toFixed(2)}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>顧客：</strong>{" "}
                                        {order.customer.name}
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold mb-2 text-gray-700">
                                        餐點內容：
                                    </h4>
                                    <ul className="space-y-2">
                                        {order.items.map((item, idx) => (
                                            <li
                                                key={`${item.id}-${idx}`}
                                                className="flex justify-between text-sm text-gray-600"
                                            >
                                                <span>
                                                    {item.menuItem.name} ×{" "}
                                                    {item.quantity}
                                                    {item.specialRequest && (
                                                        <span className="block text-xs text-gray-400">
                                                            備註：
                                                            {
                                                                item.specialRequest
                                                            }
                                                        </span>
                                                    )}
                                                </span>
                                                <span>
                                                    $
                                                    {(
                                                        item.menuItem.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                                    {order.status === "PENDING" && (
                                        <button
                                            onClick={() =>
                                                handleAcceptOrder(order.id)
                                            }
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                        >
                                            接受訂單
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
