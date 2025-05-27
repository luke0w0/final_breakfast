"use client";

// import { signOut } from "@/auth";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function Navbar() {
    const { data: session } = useSession();
    const user = session?.user;

    const getRoleLinks = () => {
        if (!user) return [];

        switch (user.role) {
            case "CUSTOMER":
                return [
                    { href: "/menu", name: "Menu" },
                    { href: "/orders", name: "My Orders" },
                ];
            case "STAFF":
                return [
                    { href: "/orders/pending", name: "Pending Orders" },
                    { href: "/orders/ready", name: "Ready Orders" },
                ];
            case "CHEF":
                return [{ href: "/kitchen", name: "Kitchen Orders" }];
            case "OWNER":
                return [
                    { href: "/admin/menu", name: "Menu Management" },
                    { href: "/admin/users", name: "User Management" },
                    { href: "/orders/pending", name: "Pending Orders" },
                    { href: "/orders/ready", name: "Ready Orders" },
                    { href: "/kitchen", name: "Kitchen Orders" },
                ];
            default:
                return [];
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-blue-600 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
                <Link href="/" className="text-xl font-bold">
                    Breakfast Express
                </Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <div className="flex space-x-4">
                                {getRoleLinks().map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="hover:underline"
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                            <span className="mr-2">Hello, {user.name}</span>
                            <form
                                action={async () => {
                                    await signOut();
                                }}
                            >
                                <button
                                    type="submit"
                                    className="bg-red-500 hover:bg-red-700 px-3 py-1 rounded"
                                >
                                    Sign Out
                                </button>
                            </form>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-white text-blue-600 px-3 py-1 rounded hover:bg-gray-100"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
