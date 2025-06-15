"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import useUser from "@/hooks/useUser";
import { editOrderStatus, getReadyOrders } from "@/app/actions/order";
import { subscribeToTopic, publishMessage } from "@/app/utils/mqtt";

export default function ReadyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, loading: userLoading } = useUser();

    useEffect(() => {
        if (userLoading) {
            return;
        }

        const getOrders = async () => {
            try {
                // action
                let data = await getReadyOrders();
                if (!data) {
                    // api
                    const response = await fetch(`/api/orders/ready`);
                    if (!response.ok) {
                        alert("獲取完成訂單失敗");
                        return;
                    }
                    data = await response.json();
                }
                setOrders(data);
                setLoading(false);
            } catch (err) {
                alert("獲取完成訂單失敗");
            }
        };
        getOrders();

        // 訂閱 MQTT 訊息
        subscribeToTopic((message) => {
            console.log("收到 MQTT 訊息:", message);
            
            // 處理訂單狀態更新
            if (message.type === "ORDER_STATUS_UPDATE") {
                console.log("收到訂單狀態更新通知，重新獲取訂單列表");
                // 立即重新獲取訂單列表
                getOrders();
            }
        });

        // 清理函數
        return () => {
            console.log("清理 MQTT 訂閱");
        };
    }, [userLoading]);

    const handleCompleteButton = async (orderId) => {
        try {
            setLoading(true);
            // 先嘗試使用 action
            let data = await editOrderStatus({ status: "COMPLETED" }, orderId);
            
            // 如果 action 失敗，使用 API
            if (!data) {
                const response = await fetch(`/api/orders/${orderId}/status`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "COMPLETED" }),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || "修改訂單狀態失敗");
                }
                
                data = await response.json();
            }

            // 確保資料庫更新成功後，發送 MQTT 通知
            if (data) {
                console.log('準備發送訂單完成的 MQTT 通知:', data);
                try {
                    await publishMessage({
                        type: "ORDER_STATUS_UPDATE",
                        orderId: orderId,
                        status: "COMPLETED",
                        timestamp: new Date().toISOString(),
                        order: data
                    });
                    console.log('訂單完成的 MQTT 通知已發送');
                } catch (mqttError) {
                    console.error('MQTT 發送失敗:', mqttError);
                    // 即使 MQTT 發送失敗，我們仍然繼續流程
                }
            }

            // 從列表中移除已完成的訂單
            setOrders(prev => prev.filter(order => order.id !== orderId));
            
            // 顯示成功訊息
            //alert("訂單已標記為已交付");
        } catch (error) {
            console.error("完成訂單時發生錯誤:", error);
            alert("完成訂單失敗：" + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
            </div>
        );
    }

    if (!user || !["STAFF", "OWNER"].includes(user.role)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">權限不足</h1>
                    <p className="text-gray-600">您需要適當的權限才能查看此頁面</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50 py-10 px-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">
                    🍱 完成的訂單
                </h1>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse h-24 bg-white rounded-lg shadow"
                            />
                        ))}
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center text-gray-500 mt-20 text-lg">
                        🎉 目前沒有完成的訂單
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                    >
                        {orders.map((order) => (
                            <motion.div
                                key={order.id}
                                layout
                                className="bg-white rounded-xl shadow-md p-5 hover:shadow-xl transition-shadow duration-300"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-xl font-bold text-pink-600 mb-2">
                                    訂單 #{order.id.slice(0, 8)}
                                </h2>
                                <p className="text-gray-800 font-medium mb-1">
                                    顧客：{order.customer?.name}
                                </p>
                                <ul className="text-sm list-disc pl-5 mb-2 space-y-1">
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            {item.menuItem.name} × {item.quantity}
                                            {item.specialRequest && (
                                                <p className="text-xs text-gray-500 ml-4">
                                                    備註：{item.specialRequest}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>

                                <p className="text-xs text-gray-500 mb-1">
                                    訂單建立時間：{new Date(order.createdAt).toLocaleString()}
                                </p>
                                <p className="text-sm font-semibold text-pink-600 mb-2">
                                    總金額：${order.totalAmount.toFixed(2)}
                                </p>
                                <button
                                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-semibold transition"
                                    onClick={() => handleCompleteButton(order.id)}
                                >
                                    ✅ 已交付
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
