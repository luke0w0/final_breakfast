"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState([]);
    const [cart, setCart] = useState([]);

    useEffect(() => {
        fetch("/api/menu")
            .then((res) => res.json())
            .then((data) => setMenuItems(data));
    }, []);

    const addToCart = (itemId) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === itemId);
            if (existing) {
                return prev.map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { id: itemId, quantity: 1 }];
        });
    };

    const removeFromCart = (itemId) => {
        setCart((prev) => {
            const existing = prev.find((item) => item.id === itemId);
            if (existing && existing.quantity > 1) {
                return prev.map((item) =>
                    item.id === itemId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter((item) => item.id !== itemId);
        });
    };

    const getCartItemCount = (itemId) => {
        return cart.find((item) => item.id === itemId)?.quantity || 0;
    };

    const getTotalItems = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return cart.reduce((total, cartItem) => {
            const menuItem = menuItems.find((item) => item.id === cartItem.id);
            return total + (menuItem?.price || 0) * cartItem.quantity;
        }, 0);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Menu</h1>

            <div className="flex justify-between">
                <div className="w-3/4 pr-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {menuItems
                            .filter((item) => item.isAvailable)
                            .map((item) => (
                                <div
                                    key={item.id}
                                    className="border rounded-lg p-4 shadow-sm"
                                >
                                    {item.imageUrl && (
                                        <img
                                            src={item.imageUrl}
                                            alt={item.name}
                                            className="w-full h-48 object-cover rounded-md mb-3"
                                        />
                                    )}
                                    <h3 className="font-bold text-lg">
                                        {item.name}
                                    </h3>
                                    <p className="text-gray-600 mb-2">
                                        {item.description}
                                    </p>
                                    <p className="font-bold text-blue-600">
                                        ${item.price.toFixed(2)}
                                    </p>

                                    <div className="flex items-center mt-3">
                                        <button
                                            onClick={() =>
                                                removeFromCart(item.id)
                                            }
                                            className="bg-gray-200 px-3 py-1 rounded-l"
                                            disabled={
                                                getCartItemCount(item.id) === 0
                                            }
                                        >
                                            -
                                        </button>
                                        <span className="bg-gray-100 px-3 py-1">
                                            {getCartItemCount(item.id)}
                                        </span>
                                        <button
                                            onClick={() => addToCart(item.id)}
                                            className="bg-gray-200 px-3 py-1 rounded-r"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                <div className="w-1/4 bg-gray-50 p-4 rounded-lg sticky top-4 h-fit">
                    <h2 className="text-xl font-bold mb-4">Your Order</h2>

                    {cart.length === 0 ? (
                        <p className="text-gray-500">Your cart is empty</p>
                    ) : (
                        <>
                            <ul className="mb-4">
                                {cart.map((cartItem) => {
                                    const menuItem = menuItems.find(
                                        (item) => item.id === cartItem.id
                                    );
                                    if (!menuItem) return null;

                                    return (
                                        <li
                                            key={cartItem.id}
                                            className="flex justify-between mb-2"
                                        >
                                            <span>
                                                {menuItem.name} x
                                                {cartItem.quantity}
                                            </span>
                                            <span>
                                                $
                                                {(
                                                    menuItem.price *
                                                    cartItem.quantity
                                                ).toFixed(2)}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>

                            <div className="border-t pt-3">
                                <div className="flex justify-between font-bold mb-4">
                                    <span>Total:</span>
                                    <span>${getTotalPrice().toFixed(2)}</span>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700"
                                >
                                    Checkout ({getTotalItems()} items)
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
