"use client";

import { useEffect, useRef, useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import useUser from "@/hooks/useUser";
import { deleteNotification } from "@/app/actions/notification";

export default function NotifyButton() {
    const [showNotify, setShowNotify] = useState(false);
    const { user, loading } = useUser();
    const { notifications, unreadCount, setNotifications, refetch } = useNotifications();
    const wrapperRef = useRef(null);

    useEffect(() => {
        if (loading) {
            return;
        }

        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setShowNotify(false);
            }
        };

        if (showNotify) {
            document.addEventListener("mousedown", handleClickOutside);
        } else {
            document.removeEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [showNotify, loading]);

    // 當組件掛載或更新時重新獲取通知
    useEffect(() => {
        if (!loading) {
            refetch();
        }
    }, [loading, refetch]);

    const handelClickNotificationButton = async () => {
        // 先顯示通知面板
        setShowNotify(true);
        
        // 如果有未讀通知，則更新已讀狀態
        if (notifications.length > 0 && unreadCount > 0) {
            try {
                const response = await fetch(
                    `/api/notifications/users/${user.id}/isRead`,
                    {
                        method: "PATCH",
                    }
                );
                if (!response.ok) {
                    throw new Error("切換已讀通知失敗");
                }
                
                // 更新本地狀態
                setNotifications(
                    notifications.map((n) => ({
                        ...n,
                        isRead: true
                    }))
                );
                
                // 重新獲取通知列表
                await refetch();
            } catch (err) {
                console.error("切換已讀通知錯誤:", err);
            }
        }
    };

    const handleDeleteNotification = async (nId) => {
        try {
            const response = await fetch(`/api/notifications/${nId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "刪除通知失敗");
            }

            // 從本地狀態中移除通知
            setNotifications(notifications.filter((n) => n.id !== nId));
            
            // 重新獲取通知列表以更新未讀數量
            await refetch();
        } catch (error) {
            console.error("刪除通知錯誤:", error);
            alert(error.message);
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                aria-label="查看通知"
                className="relative focus:outline-none"
                onClick={handelClickNotificationButton}
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-400 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
                        {unreadCount}
                    </span>
                )}
            </button>

            {showNotify && (
                <div className="fixed right-1/12 top-16 w-80 bg-white/90 backdrop-blur-md text-black rounded-xl shadow-2xl border border-gray-200 z-[9999]">
                    {notifications.length > 0 ? (
                        <ul className="divide-y divide-gray-100 max-h-64 overflow-y-auto">
                            {notifications.map((n) => (
                                <li
                                    key={n.id}
                                    className="px-4 py-3 hover:bg-gray-100 transition"
                                >
                                    <div className="font-semibold flex justify-between text-gray-800">
                                        <p className="whitespace-pre-wrap">{n.message}</p>
                                        <button
                                            onClick={() => handleDeleteNotification(n.id)}
                                            style={{
                                                width: "32px",
                                                height: "32px",
                                                borderRadius: "50%",
                                            }}
                                            className="flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-gray-200 border border-gray-300 transition cursor-pointer shadow-sm"
                                            aria-label="刪除通知"
                                            title="刪除"
                                        >
                                            X
                                        </button>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatTime(n.createdAt)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-5 text-center text-gray-500 text-sm">
                            目前沒有通知
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
