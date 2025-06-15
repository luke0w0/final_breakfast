"use client";

import { useEffect, useState } from "react";
import useUser from "@/hooks/useUser";
import { editOrderStatus, getCustomerOrder } from "@/app/actions/order";
import { subscribeToTopic, publishMessage } from "@/app/utils/mqtt";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: userLoading } = useUser();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                if (user) {
                    // 直接使用 API 獲取訂單
                    const response = await fetch(`/api/orders?customerId=${user.id}`);
                    if (!response.ok) {
                        throw new Error('獲取訂單失敗');
                    }
                    const data = await response.json();
                    console.log('獲取到的訂單:', data); // 用於調試
                    setOrders(data || []);
                }
            } catch (error) {
                console.error("獲取訂單時發生錯誤:", error);
            } finally {
                setLoading(false);
            }
        };

        if (!userLoading) {
            // 初始獲取訂單
            fetchOrders();

            // 訂閱 MQTT 訊息
            subscribeToTopic((message) => {
                console.log("收到 MQTT 訊息:", message);
                
                // 處理新訂單
                if (message.type === "NEW_ORDER" && message.status === "PENDING") {
                    console.log("收到新訂單通知，重新獲取訂單列表");
                    // 立即重新獲取訂單列表
                    fetchOrders();
                }
                
                // 處理訂單狀態更新
                if (message.type === "ORDER_STATUS_UPDATE") {
                    console.log("收到訂單狀態更新通知，重新獲取訂單列表");
                    // 立即重新獲取訂單列表
                    fetchOrders();
                }

                // 處理訂單取消
                if (message.type === "ORDER_STATUS_UPDATE" && message.status === "CANCELLED") {
                    console.log("收到訂單取消通知，重新獲取訂單列表");
                    // 立即重新獲取訂單列表
                    fetchOrders();
                }
            });

            // 清理函數
            return () => {
                // 這裡可以添加清理邏輯，如果需要
                console.log("清理 MQTT 訂閱");
            };
        }
    }, [user, userLoading]);

    const handleCancelOrder = async (orderId) => {
        try {
            setLoading(true); // 開始載入
            // 先更新資料庫
            let data = await editOrderStatus({ status: "CANCELLED" }, orderId);
            
            if (!data) {
                // 如果 action 失敗，使用 API
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "CANCELLED" }),
                });
                
                if (!response.ok) {
                    throw new Error("取消訂單失敗");
                }
                data = await response.json();
            }

            // 確保資料庫更新成功後，發送 MQTT 通知
            if (data) {
                console.log('準備發送取消訂單的 MQTT 通知:', data);
                publishMessage({
                    type: "ORDER_STATUS_UPDATE",
                    orderId: orderId,
                    status: "CANCELLED",
                    timestamp: new Date().toISOString(),
                    order: data
                });
                console.log('取消訂單的 MQTT 通知已發送');
            }

            // 更新本地狀態
            setOrders(prev => prev.filter(order => order.id !== orderId));
            
        } catch (error) {
            console.error("取消訂單時發生錯誤:", error);
            alert("取消訂單失敗：" + error.message);
        } finally {
            setLoading(false); // 結束載入
        }
    };

    if (loading || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">請先登入</h1>
                    <p className="text-gray-600">您需要登入才能查看訂單</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    📋 我的訂單
                </h1>

                {orders.length === 0 ? (
                    <div className="text-center py-10">
                        <p className="text-gray-600">您還沒有任何訂單</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-md p-6"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">
                                            訂單 #{order.id.slice(0, 8)}
                                        </h2>
                                        <p className="text-gray-600">
                                            建立時間：{new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                            order.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                                            order.status === "PREPARING" ? "bg-blue-100 text-blue-800" :
                                            order.status === "READY" ? "bg-green-100 text-green-800" :
                                            order.status === "COMPLETED" ? "bg-gray-100 text-gray-800" :
                                            "bg-red-100 text-red-800"
                                        }`}>
                                            {order.status === "PENDING" ? "待處理" :
                                             order.status === "PREPARING" ? "製作中" :
                                             order.status === "READY" ? "已完成" :
                                             order.status === "COMPLETED" ? "已取餐" :
                                             "已取消"}
                                        </span>
                                        {order.status === "PENDING" && (
                                            <button
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                                            >
                                                取消訂單
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex justify-between items-center"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-16 relative">
                                                    <img
                                                        src={item.menuItem.imageUrl || "/placeholder.png"}
                                                        alt={item.menuItem.name}
                                                        className="rounded-lg object-cover w-full h-full"
                                                    />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-800">
                                                        {item.menuItem.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        數量：{item.quantity}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="font-medium text-gray-800">
                                                ${item.menuItem.price * item.quantity}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">總計</span>
                                        <span className="text-xl font-bold text-gray-800">
                                            ${order.totalAmount}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
