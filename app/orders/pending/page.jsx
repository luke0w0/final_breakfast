"use client";
import { OrderWithItems } from "@/types";
import { useEffect, useState } from "react";
import { updateOrderStatus, confirmPayment } from "@/app/orders/actions";

export default function PendingOrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetch("/api/orders/pending")
            .then((res) => res.json())
            .then((data) => setOrders(data));
    }, []);

    const handleStatusChange = async (orderId, status) => {
        try {
            await updateOrderStatus(orderId, status);
            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        } catch (error) {
            console.error("Failed to update order status:", error);
        }
    };

    const handlePaymentConfirm = async (orderId) => {
        try {
            await confirmPayment(orderId);
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId
                        ? { ...order, paymentStatus: true }
                        : order
                )
            );
        } catch (error) {
            console.error("Failed to confirm payment:", error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Pending Orders</h1>

            {orders.length === 0 ? (
                <p className="text-gray-500">
                    No pending orders at the moment.
                </p>
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
                                <div className="flex items-center space-x-2">
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                                            order.paymentStatus
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {order.paymentStatus
                                            ? "Paid"
                                            : "Unpaid"}
                                    </span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <p className="font-medium">
                                    Total: ${order.totalAmount.toFixed(2)}
                                </p>
                                <p>Customer: {order.customer.name}</p>
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

                            <div className="mt-4 flex justify-between">
                                <div>
                                    {!order.paymentStatus && (
                                        <button
                                            onClick={() =>
                                                handlePaymentConfirm(order.id)
                                            }
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mr-2"
                                        >
                                            Confirm Payment
                                        </button>
                                    )}
                                </div>

                                <div>
                                    <button
                                        onClick={() =>
                                            handleStatusChange(
                                                order.id,
                                                "PREPARING"
                                            )
                                        }
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Mark as Preparing
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
