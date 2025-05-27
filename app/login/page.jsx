"use client";

import { useFormState, useFormStatus } from "react-dom";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

// import { authenticate } from "@/app/auth/actions";

export default function LoginPage() {
    // const [errorMessage, dispatch] = useFormState(authenticate, undefined);
    const [errorMessage, dispatch] = [null, null];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 via-pink-400 to-red-400 px-4">
            <div className="bg-white/80 backdrop-blur-lg p-8 rounded-xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">登入帳號</h1>

                <form action={dispatch} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            電子郵件
                        </label>
                        <input
                            id="email"
                            type="email"
                            name="email"
                            required
                            placeholder="your@email.com"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            密碼
                        </label>
                        <input
                            id="password"
                            type="password"
                            name="password"
                            required
                            placeholder="請輸入密碼"
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                        />
                    </div>

                    <LoginButton />

                    {errorMessage && (
                        <p className="text-red-600 text-sm mt-2 animate-fade-in">
                            {errorMessage}
                        </p>
                    )}
                </form>

                <div className="mt-6">
                    <div className="flex items-center justify-center">
                        <div className="w-full border-t border-gray-300"></div>
                        <span className="px-3 text-gray-500 text-sm">或</span>
                        <div className="w-full border-t border-gray-300"></div>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => signIn("google")}
                            className="w-full bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 shadow hover:bg-gray-50 transition duration-300"
                        >
                            <Image
                                src="/google.png"
                                alt="Google"
                                width={24}
                                height={24}
                            />
                            使用 Google 登入
                        </button>
                    </div>
                </div>

                <div className="mt-6 text-center">
                    <Link href="/register" className="text-pink-600 hover:underline font-medium">
                        還沒有帳號？立即註冊
                    </Link>
                </div>
            </div>
        </div>
    );
}

function LoginButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            aria-disabled={pending}
            className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white py-2 px-4 rounded-md font-semibold shadow hover:opacity-90 transition duration-300 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-2"
        >
            {pending ? "登入中..." : "登入"}
        </button>
    );
}
