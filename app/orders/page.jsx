"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch("/api/orders")
            .then((res) => res.json())
            .then((data) => setOrders(data));
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">My Orders</h1>

            {orders.length === 0 ? (
                <p className="text-gray-500">You have no orders yet.</p>
            ) : (
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="border rounded-lg p-4 shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold">
                                        Order #{order.id.slice(0, 8)}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(
                                            order.createdAt
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        order.status
                                    )}`}
                                >
                                    {order.status}
                                </span>
                            </div>

                            <div className="mb-3">
                                <p className="font-medium">
                                    Total: ${order.totalAmount.toFixed(2)}
                                </p>
                                <p
                                    className={
                                        order.paymentStatus
                                            ? "text-green-600"
                                            : "text-red-600"
                                    }
                                >
                                    Payment:{" "}
                                    {order.paymentStatus ? "Paid" : "Pending"}
                                </p>
                            </div>

                            <div className="border-t pt-3">
                                <h4 className="font-medium mb-2">Items:</h4>
                                <ul className="space-y-2">
                                    {order.items.map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex justify-between"
                                        >
                                            <span>
                                                {item.menuItem.name} x
                                                {item.quantity}
                                                {item.specialRequest && (
                                                    <span className="text-sm text-gray-500 block">
                                                        Note:{" "}
                                                        {item.specialRequest}
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

                            {order.status === "READY" && !order.completedAt && (
                                <div className="mt-4">
                                    <Link
                                        href={`/orders/${order.id}/complete`}
                                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                    >
                                        Confirm Pickup
                                    </Link>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
