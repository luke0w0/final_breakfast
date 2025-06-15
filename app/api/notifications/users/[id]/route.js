import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "未授權的訪問" }, { status: 401 });
        }

        // 使用 Promise.resolve 來確保 params 被正確處理
        const { id: userId } = await Promise.resolve(params);
        if (!userId) {
            return NextResponse.json({ error: "缺少使用者 ID" }, { status: 400 });
        }

        // 檢查使用者是否存在
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
        }

        // 獲取使用者的所有通知
        const notifications = await prisma.notification.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 50,
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        totalAmount: true,
                        items: {
                            include: {
                                menuItem: true
                            }
                        }
                    }
                }
            }
        });

        console.log('API 返回的通知:', notifications);

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("獲取使用者通知時發生錯誤:", error);
        return NextResponse.json(
            { error: "獲取使用者通知失敗", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "未授權的訪問" }, { status: 401 });
        }

        // 使用 Promise.resolve 來確保 params 被正確處理
        const { id: userId } = await Promise.resolve(params);
        if (!userId) {
            return NextResponse.json({ error: "缺少使用者 ID" }, { status: 400 });
        }

        const body = await request.json();
        const { message, orderId } = body;

        if (!message) {
            return NextResponse.json({ error: "缺少通知訊息" }, { status: 400 });
        }

        // 檢查使用者是否存在
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });

        if (!user) {
            return NextResponse.json({ error: "找不到使用者" }, { status: 404 });
        }

        // 創建通知
        const notification = await prisma.notification.create({
            data: {
                userId: userId,
                message,
                orderId,
                isRead: false
            },
            include: {
                order: {
                    select: {
                        id: true,
                        status: true,
                        totalAmount: true,
                        items: {
                            include: {
                                menuItem: true
                            }
                        }
                    }
                }
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error("創建通知時發生錯誤:", error);
        return NextResponse.json(
            { error: "創建通知失敗", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 