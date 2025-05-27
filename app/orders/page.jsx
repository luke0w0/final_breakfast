"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);

    const ordersData = [
        {
            "id": "order001",
            "status": "PENDING",
            "paymentStatus": false,
            "totalAmount": 85,
            "createdAt": "2025-05-28T07:45:00Z",
            "completedAt": null,
            "items": [
                {
                    "id": "item-001",
                    "menuItem": {
                        "name": "經典蛋餅",
                        "price": 35
                    },
                    "quantity": 1,
                    "specialRequest": "不要加胡椒"
                },
                {
                    "id": "item-002",
                    "menuItem": {
                        "name": "奶茶（中杯）",
                        "price": 25
                    },
                    "quantity": 2,
                    "specialRequest": ""
                }
            ]
        },
        {
            "id": "order002",
            "status": "READY",
            "paymentStatus": true,
            "totalAmount": 55,
            "createdAt": "2025-05-28T08:20:00Z",
            "completedAt": null,
            "items": [
                {
                    "id": "item-003",
                    "menuItem": {
                        "name": "火腿起司三明治",
                        "price": 45
                    },
                    "quantity": 1,
                    "specialRequest": "加辣"
                },
                {
                    "id": "item-004",
                    "menuItem": {
                        "name": "紅茶（大杯）",
                        "price": 10
                    },
                    "quantity": 1,
                    "specialRequest": ""
                }
            ]
        },
        {
            "id": "order003",
            "status": "COMPLETED",
            "paymentStatus": true,
            "totalAmount": 40,
            "createdAt": "2025-05-27T22:30:00Z",
            "completedAt": "2025-05-27T23:00:00Z",
            "items": [
                {
                    "id": "item-005",
                    "menuItem": {
                        "name": "蘿蔔糕套餐",
                        "price": 40
                    },
                    "quantity": 1,
                    "specialRequest": ""
                }
            ]
        }
    ];

    useEffect(() => {
        // fetch("/api/orders")
        //     .then((res) => res.json())
        //     .then((data) => setOrders(data));

        setOrders(ordersData);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case "PENDING":
                return "bg-yellow-100 text-yellow-800";
            case "PREPARING":
                return "bg-blue-100 text-blue-800";
            case "READY":
                return "bg-green-100 text-green-800";
            case "COMPLETED":
                return "bg-gray-100 text-gray-800";
            case "CANCELLED":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-6 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center sm:text-left text-gray-800">
                    我的訂單
                </h1>

                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center sm:text-left">
                        您目前沒有任何訂單。
                    </p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            訂單 #{order.id.slice(0, 8)}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(order.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`mt-2 sm:mt-0 px-3 py-2 rounded-full text-xs font-medium ${getStatusColor(
                                            order.status
                                        )}`}
                                    >
                                        {order.status}
                                    </span>
                                </div>

                                <div className="mb-3 space-y-1">
                                    <p className="text-gray-700">
                                        <strong>總金額：</strong> ${order.totalAmount.toFixed(2)}
                                    </p>
                                    <p
                                        className={
                                            order.paymentStatus
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }
                                    >
                                        <strong>付款狀態：</strong>{" "}
                                        {order.paymentStatus ? "已付款" : "未付款"}
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold mb-2 text-gray-700">餐點內容：</h4>
                                    <ul className="space-y-2">
                                        {order.items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex justify-between text-sm text-gray-600"
                                            >
                                                <span>
                                                    {item.menuItem.name} × {item.quantity}
                                                    {item.specialRequest && (
                                                        <span className="block text-xs text-gray-400">
                                                            備註：{item.specialRequest}
                                                        </span>
                                                    )}
                                                </span>
                                                <span>
                                                    ${(
                                                    item.menuItem.price * item.quantity
                                                ).toFixed(2)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {order.status === "READY" && !order.completedAt && (
                                    <div className="mt-4 text-center sm:text-right">
                                        <Link
                                            href={`/orders/${order.id}/complete`}
                                            className="inline-block bg-gradient-to-r from-green-500 to-green-700 text-white px-5 py-2 rounded-md hover:opacity-90 transition"
                                        >
                                            確認取餐
                                        </Link>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}