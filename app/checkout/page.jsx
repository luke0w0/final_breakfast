"use client";
import { createOrder } from "@/app/orders/actions";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [specialRequests, setSpecialRequests] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) setCart(JSON.parse(savedCart));

        fetch("/api/menu")
            .then((res) => res.json())
            .then((data) => setMenuItems(data));
    }, []);

    const getTotalPrice = () => {
        return cart.reduce((total, cartItem) => {
            const menuItem = menuItems.find((item) => item.id === cartItem.id);
            return total + (menuItem?.price || 0) * cartItem.quantity;
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const orderItems = cart.map((item) => ({
                menuItemId: item.id,
                quantity: item.quantity,
                specialRequest: specialRequests[item.id] || "",
            }));

            await createOrder(orderItems, getTotalPrice());
            localStorage.removeItem("cart");
            router.push("/orders");
        } catch (error) {
            console.error("Failed to create order:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Checkout</h1>

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
                <div className="bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                    <ul className="mb-6 space-y-4">
                        {cart.map((cartItem) => {
                            const menuItem = menuItems.find(
                                (item) => item.id === cartItem.id
                            );
                            if (!menuItem) return null;

                            return (
                                <li key={cartItem.id} className="border-b pb-4">
                                    <div className="flex justify-between mb-1">
                                        <span className="font-medium">
                                            {menuItem.name} x{cartItem.quantity}
                                        </span>
                                        <span>
                                            $
                                            {(
                                                menuItem.price *
                                                cartItem.quantity
                                            ).toFixed(2)}
                                        </span>
                                    </div>

                                    <div className="mt-2">
                                        <label
                                            htmlFor={`special-request-${cartItem.id}`}
                                            className="block text-sm text-gray-600 mb-1"
                                        >
                                            Special Requests (optional)
                                        </label>
                                        <input
                                            type="text"
                                            id={`special-request-${cartItem.id}`}
                                            value={
                                                specialRequests[cartItem.id] ||
                                                ""
                                            }
                                            onChange={(e) =>
                                                setSpecialRequests((prev) => ({
                                                    ...prev,
                                                    [cartItem.id]:
                                                        e.target.value,
                                                }))
                                            }
                                            className="w-full p-2 border rounded"
                                        />
                                    </div>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="border-t pt-4">
                        <div className="flex justify-between font-bold text-lg mb-6">
                            <span>Total:</span>
                            <span>${getTotalPrice().toFixed(2)}</span>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting || cart.length === 0}
                            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Placing Order..." : "Place Order"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
