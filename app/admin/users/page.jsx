"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AdminUsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [session, setSession] = useState(null);

    const roleLabels = {
        OWNER: "老闆",
        STAFF: "員工",
        CHEF: "廚師",
        CUSTOMER: "顧客"
    };

    const roleOrder = {
        OWNER: 0,
        STAFF: 1,
        CHEF: 2,
        CUSTOMER: 3
    };

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch("/api/auth/session");
                if (!response.ok) {
                    throw new Error("獲取 session 失敗");
                }
                const data = await response.json();
                setSession(data);
            } catch (error) {
                console.error("獲取 session 時發生錯誤:", error);
            }
        };

        fetchSession();
    }, []);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const response = await fetch("/api/users");
                if (!response.ok) {
                    throw new Error("獲取使用者失敗");
                }
                const data = await response.json();
                setUsers(data);
            } catch (error) {
                console.error("獲取使用者時發生錯誤:", error);
                alert(error.message);
            } finally {
                setLoading(false);
            }
        };
        getUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        try {
            const response = await fetch(`/api/users/${userId}/role`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                throw new Error("更新角色失敗");
            }

            const updatedUser = await response.json();
            setUsers(prev => prev.map(user => 
                user.id === userId ? updatedUser : user
            ));
        } catch (error) {
            console.error("更新角色時發生錯誤:", error);
            alert(error.message);
        }
    };

    const filteredUsers = users
        .filter(user => 
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);

    const UserCard = ({ user, onRoleChange, session }) => {
        const [isUploading, setIsUploading] = useState(false);
        const [imageUrl, setImageUrl] = useState(user.image);

        const handleImageUpload = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                setIsUploading(true);
                const formData = new FormData();
                formData.append("file", file);

                // 上傳圖片
                const uploadResponse = await fetch("/api/image/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!uploadResponse.ok) {
                    throw new Error("圖片上傳失敗");
                }

                const { url } = await uploadResponse.json();

                // 更新用戶圖片
                const updateResponse = await fetch(`/api/users/${user.id}/image`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ imageUrl: url }),
                });

                if (!updateResponse.ok) {
                    throw new Error("更新用戶圖片失敗");
                }

                setImageUrl(url);
            } catch (error) {
                console.error("上傳圖片時發生錯誤:", error);
                alert("上傳圖片失敗");
            } finally {
                setIsUploading(false);
            }
        };

        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-md p-6"
            >
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {imageUrl ? (
                            <img
                                src={imageUrl}
                                alt={user.name}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-2xl text-gray-500">
                                    {user.name?.charAt(0) || "?"}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold">{user.name}</h3>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    建立時間：{new Date(user.createdAt).toLocaleDateString()}
                </p>
                {session?.user?.role === "OWNER" && (
                    <div className="mt-4 space-y-3">
                        <label className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer transition-colors w-full justify-center">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageUpload}
                                disabled={isUploading}
                            />
                            {isUploading ? (
                                <span className="text-sm">上傳中...</span>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 mr-2"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    <span className="text-sm">新增頭像</span>
                                </>
                            )}
                        </label>
                        <select
                            value={user.role}
                            onChange={(e) => onRoleChange(user.id, e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={user.role === "OWNER"}
                        >
                            {Object.entries(roleLabels).map(([value, label]) => (
                                <option key={value} value={value}>
                                    {label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </motion.div>
        );
    };

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (session.user.role !== "OWNER") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">無權訪問</h1>
                    <p className="text-gray-600">只有老闆可以訪問此頁面</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-orange-100 via-pink-100 to-red-100">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    👥 使用者管理
                </h1>

                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="搜尋名稱或 Email..."
                    className="w-full mb-6 px-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-pink-400"
                />

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="animate-pulse h-20 bg-white rounded-lg shadow"
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-8">
                        {Object.entries(roleLabels).map(([role, label]) => {
                            const roleUsers = filteredUsers.filter(user => user.role === role);
                            if (roleUsers.length === 0) return null;

                            return (
                                <div key={role} className="space-y-4">
                                    <h2 className="text-xl font-semibold text-gray-700">
                                        {label} ({roleUsers.length})
                                    </h2>
                                    <motion.div
                                        layout
                                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                    >
                                        {roleUsers.map((user) => (
                                            <UserCard
                                                key={user.id}
                                                user={user}
                                                onRoleChange={handleRoleChange}
                                                session={session}
                                            />
                                        ))}
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
