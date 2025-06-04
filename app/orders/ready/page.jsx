"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function ReadyOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setOrders([
                {
                    id: 101,
                    customerName: "陳小美",
                    items: ["總匯三明治", "豆漿"],
                    pickupTime: "2025-05-28 08:30",
                },
                {
                    id: 102,
                    customerName: "張家豪",
                    items: ["漢堡", "奶茶"],
                    pickupTime: "2025-05-28 08:45",
                },
                {
                    id: 103,
                    customerName: "林曉恩",
                    items: ["培根蛋餅", "紅茶"],
                    pickupTime: "2025-05-28 09:00",
                },
            ]);
            setLoading(false);
        }, 800);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-pink-50 to-red-50 py-10 px-6">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">🍱 完成的訂單</h1>

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
                                    訂單 #{order.id}
                                </h2>
                                <p className="text-gray-800 font-medium mb-1">
                                    顧客：{order.customerName}
                                </p>
                                <ul className="text-sm text-gray-600 list-disc pl-5 mb-2">
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                                <p className="text-xs text-gray-500">
                                    預計取餐時間：{order.pickupTime}
                                </p>
                                <button
                                    className="mt-4 w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-md font-semibold transition"
                                    onClick={() => alert(`確認訂單 ${order.id} 已交付`)}
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
