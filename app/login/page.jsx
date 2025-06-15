"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-300 via-pink-400 to-red-400 px-4">
            <div className="max-w-md w-full bg-white/30 backdrop-blur-lg border border-white/30 shadow-2xl rounded-2xl p-8 transition-all">
                <h2 className="text-3xl font-extrabold text-center text-gray-700 drop-shadow mb-6">
                    登入帳號
                </h2>

                {error && (
                    <div className="mb-4 text-red-600 text-sm text-center font-medium bg-red-100 p-2 rounded-md shadow-sm">
                        ⚠️ {error}
                    </div>
                )}

                <div className="space-y-3">
                    <button
                        onClick={async () => {
                            try {
                                setIsSubmitting(true);
                                const result = await signIn("google", { 
                                    callbackUrl: "/"
                                });
                            } catch (error) {
                                console.error("Google 登入錯誤:", error);
                                setError("登入時發生錯誤，請稍後再試");
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        disabled={isSubmitting}
                        className="w-full bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 shadow hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Image
                            src="/google.png"
                            alt="Google"
                            width={24}
                            height={24}
                        />
                        {isSubmitting ? "登入中..." : "使用 Google 登入"}
                    </button>
                    <button
                        onClick={() => signIn("github", { callbackUrl: "/" })}
                        className="w-full bg-white text-gray-800 border border-gray-300 py-2 px-4 rounded-md flex items-center justify-center gap-2 shadow hover:bg-gray-50 transition"
                    >
                        <Image
                            src="/github.png"
                            alt="GitHub"
                            width={24}
                            height={24}
                        />
                        使用 GitHub 登入
                    </button>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        還沒有帳號？{" "}
                        <Link href="/register" className="text-pink-600 hover:text-pink-700">
                            立即註冊
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
