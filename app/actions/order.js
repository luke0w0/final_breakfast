"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export const addOrder = async (body) => {
    return null;
};

export const getCustomerOrder = async (customerId) => {
    return null;
};

export async function editOrderStatus(data, orderId) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            throw new Error("未授權的訪問");
        }

        // 檢查訂單是否存在
        const order = await prisma.order.findUnique({
            where: { id: orderId }
        });

        if (!order) {
            throw new Error("找不到訂單");
        }

        // 檢查權限：如果是取消訂單，允許顧客取消自己的訂單
        if (data.status === "CANCELLED") {
            if (order.customerId !== session.user.id) {
                throw new Error("您只能取消自己的訂單");
            }
        } else {
            // 其他狀態變更需要 STAFF、CHEF 或 OWNER 權限
            if (!["STAFF", "CHEF", "OWNER"].includes(session.user.role)) {
                throw new Error("權限不足");
            }
        }

        // 更新訂單狀態
        const updatedOrder = await prisma.order.update({
            where: {
                id: orderId
            },
            data: {
                status: data.status
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        return updatedOrder;
    } catch (error) {
        console.error("更新訂單狀態時發生錯誤:", error);
        return null;
    }
}

export async function getPendingOrders() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            throw new Error("未授權的訪問");
        }

        // 檢查用戶是否為 STAFF、CHEF 或 OWNER
        if (!["STAFF", "CHEF", "OWNER"].includes(session.user.role)) {
            throw new Error("權限不足");
        }

        const pendingOrders = await prisma.order.findMany({
            where: {
                status: "PENDING"
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        return pendingOrders;
    } catch (error) {
        console.error("獲取待處理訂單時發生錯誤:", error);
        return null;
    }
}

export async function getKitchenOrders() {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            throw new Error("未授權的訪問");
        }

        // 檢查用戶是否為 CHEF 或 OWNER
        if (!["CHEF", "OWNER"].includes(session.user.role)) {
            throw new Error("權限不足");
        }

        const kitchenOrders = await prisma.order.findMany({
            where: {
                status: "PREPARING"
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        return kitchenOrders;
    } catch (error) {
        console.error("獲取廚房訂單時發生錯誤:", error);
        return null;
    }
}

export const getReadyOrders = async () => {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            throw new Error("未授權的訪問");
        }

        // 檢查用戶是否為 STAFF 或 OWNER
        if (!["STAFF", "OWNER"].includes(session.user.role)) {
            throw new Error("權限不足");
        }

        const readyOrders = await prisma.order.findMany({
            where: {
                status: "READY"
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                },
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            },
            orderBy: {
                createdAt: "asc"
            }
        });

        return readyOrders;
    } catch (error) {
        console.error("獲取完成訂單時發生錯誤:", error);
        return null;
    }
};

export const getOrderById = async () => {
    return null;
};
