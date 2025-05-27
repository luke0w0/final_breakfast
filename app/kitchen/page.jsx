"use client";

import { useEffect, useState } from "react";
// import { updateOrderStatus } from "@/app/orders/actions";

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);

    const ordersData = [
        {
            "id": "ord001",
            "createdAt": "2025-05-28T08:00:00Z",
            "status": "PREPARING",
            "totalAmount": 138,
            "items": [
                {
                    "id": "itm001",
                    "quantity": 2,
                    "specialRequest": "去冰、少糖",
                    "menuItem": {
                        "id": "m001",
                        "name": "珍珠奶茶",
                        "price": 35
                    }
                },
                {
                    "id": "itm002",
                    "quantity": 1,
                    "specialRequest": "",
                    "menuItem": {
                        "id": "m002",
                        "name": "火腿蛋吐司",
                        "price": 40
                    }
                },
                {
                    "id": "itm003",
                    "quantity": 1,
                    "specialRequest": "加辣",
                    "menuItem": {
                        "id": "m003",
                        "name": "蘿蔔糕",
                        "price": 28
                    }
                }
            ]
        },
        {
            "id": "ord002",
            "createdAt": "2025-05-28T08:15:00Z",
            "status": "PREPARING",
            "totalAmount": 90,
            "items": [
                {
                    "id": "itm004",
                    "quantity": 2,
                    "specialRequest": "不要美乃滋",
                    "menuItem": {
                        "id": "m004",
                        "name": "雞腿堡",
                        "price": 45
                    }
                }
            ]
        },
        {
            "id": "ord003",
            "createdAt": "2025-05-28T08:30:00Z",
            "status": "PREPARING",
            "totalAmount": 65,
            "items": [
                {
                    "id": "itm005",
                    "quantity": 1,
                    "specialRequest": "加蛋",
                    "menuItem": {
                        "id": "m005",
                        "name": "蔥抓餅",
                        "price": 40
                    }
                },
                {
                    "id": "itm006",
                    "quantity": 1,
                    "specialRequest": "",
                    "menuItem": {
                        "id": "m006",
                        "name": "紅茶",
                        "price": 25
                    }
                }
            ]
        }
    ];

    useEffect(() => {
        // fetch("/api/orders/kitchen")
        //     .then((res) => res.json())
        //     .then((data) => setOrders(data));

        setOrders(ordersData);
    }, []);

    const handleCompleteOrder = async (orderId) => {
        try {
            await updateOrderStatus(orderId, "READY");
            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        } catch (error) {
            console.error("Failed to complete order:", error);
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
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-white rounded-2xl shadow-md hover:shadow-lg transition duration-200 p-6 border border-gray-100"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        訂單 #{order.id.slice(0, 8)}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {new Date(order.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <span className="text-xs font-medium px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                                    {order.status}
                                </span>
                            </div>

                            <div className="mb-3 text-right text-sm text-gray-600">
                                💰 NT$ {order.totalAmount.toFixed(2)}
                            </div>

                            <div className="border-t pt-4">
                                <h3 className="font-semibold text-gray-700 mb-2">
                                    餐點明細
                                </h3>
                                <ul className="space-y-2 text-sm">
                                    {order.items.map((item) => (
                                        <li key={item.id}>
                                            <div className="flex justify-between items-start">
                                                <span className="font-medium">
                                                    {item.menuItem.name} × {item.quantity}
                                                </span>
                                                <span className="text-gray-600">
                                                    NT$ {(item.menuItem.price * item.quantity).toFixed(2)}
                                                </span>
                                            </div>
                                            {item.specialRequest && (
                                                <div className="mt-1 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
                                                    <strong>備註：</strong> {item.specialRequest}
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
