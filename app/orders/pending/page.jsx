"use client";

import { useEffect, useState } from "react";
import { useMqttClient } from "@/hooks/useMqttClient";

export default function PendingOrdersPage() {
    const [orders, setOrders] = useState([]);
    // 顧客下單的
    const [topic, setTopic] = useState();

    const { messages, publishMessage } = useMqttClient({
        subscribeTopics: topic ? [topic] : [],
    });

    useEffect(() => {
        // TODO: 設定 MQTT 主題
        setTopic(null);

        const getPendingOrders = async () => {
            try {
                const response = await fetch(`/api/orders/pending`);
                if (!response.ok) {
                    alert("獲取待處理訂單失敗");
                    return;
                }
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error(err);
            }
        };
        getPendingOrders();
    }, []);

    // 當收到 MQTT 訊息時，更新訂單狀態
    useEffect(() => {
        if (messages.length === 0) return;

        const lastMessage = messages[messages.length - 1];

        try {
            const newOrder = JSON.parse(lastMessage.payload);
            setOrders((prev) => {
                // 檢查是否已存在相同 ID 的訂單
                const exists = prev.some((order) => order.id === newOrder.id);
                return exists ? prev : [newOrder, ...prev];
            });
        } catch (err) {
            console.error("無法解析 MQTT 訊息:", err);
        }
    }, [messages]);

    const handleAcceptOrder = async (orderId) => {
        try {
            // 接受訂單
            let response = await fetch(`/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: "PREPARING" }),
            });
            if (!response.ok) {
                alert("修改訂單狀態失敗");
                return;
            }
            setOrders((prev) => prev.filter((order) => order.id !== orderId));

            // 傳送通知
            const customerId = orders.find(
                (order) => order.id === orderId
            ).customerId;

            response = await fetch(`/api/notifications/users/${customerId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    message: `訂單 ${orderId.slice(0, 8)} 正在製作中`,
                }),
            });

            // MQTT
            // 接受訂單，傳送通知給使用者
            const topic = ""; // TODO: 設定 MQTT 主題
            const notificationRes = await response.json();

            if (notificationRes && notificationRes.id) {
                // TODO: 準備 MQTT 訊息

                // TODO: 發布 MQTT 訊息(通知)
            }

            // 發布訂單資料到廚房
            const kitchenTopic = ""; // TODO: 設定 MQTT 主題
            // TODO: 準備廚房訂單資料

            // TODO: 發布廚房訂單資料到 MQTT

            if (!response.ok) {
                alert("傳送通知失敗");
                return;
            }
        } catch (error) {
            console.error("Failed to update order status:", error);
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
