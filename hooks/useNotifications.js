"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

export const useNotifications = () => {
    const { data: session, status } = useSession();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotifications = useCallback(async () => {
        if (!session?.user?.id || status !== "authenticated") return;

        try {
            setLoading(true);
            setError(null);
            const response = await fetch(`/api/notifications/users/${session.user.id}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('獲取到的通知:', data);
            setNotifications(data);
        } catch (err) {
            console.error('獲取通知失敗:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [session?.user?.id, status]);

    // 初始載入
    useEffect(() => {
        if (status === "authenticated" && session?.user?.id) {
            fetchNotifications();
        }
    }, [session?.user?.id, status, fetchNotifications]);

    // 計算未讀通知數量
    const unreadCount = notifications.filter(n => !n.isRead).length;
    console.log('未讀通知數量:', unreadCount, '通知列表:', notifications);

    return {
        notifications,
        setNotifications,
        loading,
        error,
        unreadCount,
        refetch: fetchNotifications
    };
};
