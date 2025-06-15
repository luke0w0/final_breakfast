"use client";

import Image from "next/image";
import Link from "next/link";
import useUser from "@/hooks/useUser";

export default function Home() {
    const { user, loading } = useUser();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-6 py-12 text-gray-800">
            <main className="text-center flex flex-col items-center gap-8 max-w-xl">
                <Image
                    src="/breakfast-icon.png"
                    alt="早餐訂餐系統 Logo"
                    width={172}
                    height={172}
                    priority
                />

                <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                    網路早餐訂餐系統
                </h1>

                <p className="text-lg sm:text-xl text-gray-700">
                    提供一站式早晨美味解決方案
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    {!loading && user?.role === "CUSTOMER" ? (
                        <>
                            <Link
                                href="/menu"
                                className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:opacity-90 transition duration-300"
                            >
                                開始訂餐
                            </Link>
                            <Link
                                href="/orders"
                                className="border border-gray-300 text-gray-800 px-6 py-3 rounded-full font-medium hover:bg-white hover:shadow transition duration-300"
                            >
                                查看我的訂單
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="bg-gradient-to-r from-orange-400 via-pink-500 to-red-500 text-white px-6 py-3 rounded-full font-semibold shadow-md hover:opacity-90 transition duration-300"
                        >
                            歡迎使用本系統
                        </Link>
                    )}
                </div>
            </main>
        </div>
    );
}
