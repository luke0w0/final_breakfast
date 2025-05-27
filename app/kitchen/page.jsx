"use client";
import { OrderWithItems } from "@/types";
import { useEffect, useState } from "react";
import { updateOrderStatus } from "@/app/orders/actions";

export default function KitchenPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch("/api/orders/kitchen")
            .then((res) => res.json())
            .then((data) => setOrders(data));
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
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Kitchen Orders</h1>

            {orders.length === 0 ? (
                <p className="text-gray-500">
                    No orders to prepare at the moment.
                </p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                <div className="flex items-center space-x-2">
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <p className="font-medium">
                                    Total: ${order.totalAmount.toFixed(2)}
                                </p>
                            </div>

                            <div className="border-t pt-3">
                                <h4 className="font-medium mb-2">Items:</h4>
                                <ul className="space-y-2">
                                    {order.items.map((item) => (
                                        <li key={item.id}>
                                            <div className="flex justify-between">
                                                <span>
                                                    {item.menuItem.name} x
                                                    {item.quantity}
                                                </span>
                                                <span>
                                                    $
                                                    {(
                                                        item.menuItem.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </div>
                                            {item.specialRequest && (
                                                <p className="text-sm text-gray-500 bg-yellow-50 p-2 mt-1 rounded">
                                                    <span className="font-medium">
                                                        Note:
                                                    </span>{" "}
                                                    {item.specialRequest}
                                                </p>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-4">
                                <button
                                    onClick={() =>
                                        handleCompleteOrder(order.id)
                                    }
                                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                                >
                                    Mark as Ready
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
