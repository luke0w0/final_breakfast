import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

export async function GET(request) {
    try {
        // 檢查用戶是否已登入
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "未授權的訪問" },
                { status: 401 }
            );
        }

        // 從 URL 獲取查詢參數
        const { searchParams } = new URL(request.url);
        const status = searchParams.get("status");
        const customerId = searchParams.get("customerId");

        // 構建查詢條件
        const where = {};
        if (status) {
            where.status = status;
        }
        if (customerId) {
            where.customerId = customerId;
        }

        // 從資料庫獲取訂單
        const orders = await prisma.order.findMany({
            where,
            include: {
                items: {
                    include: {
                        menuItem: {
                            select: {
                                id: true,
                                name: true,
                                description: true,
                                price: true,
                                imageUrl: true,
                                isAvailable: true
                            }
                        }
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
                createdAt: "desc"
            }
        });

        // 檢查是否找到訂單
        if (!orders || orders.length === 0) {
            console.log("未找到訂單，查詢條件:", where);
            return NextResponse.json([]);
        }

        console.log(`找到 ${orders.length} 筆訂單`);
        return NextResponse.json(orders);
    } catch (error) {
        console.error("獲取訂單時發生錯誤:", error);
        return NextResponse.json(
            { error: "獲取訂單失敗", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

export async function POST(request) {
    try {
        // 檢查用戶是否已登入
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "未授權的訪問" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { items, customerId, totalAmount } = body;

        // 創建新訂單
        const order = await prisma.order.create({
            data: {
                customerId,
                totalAmount,
                status: "PENDING",
                items: {
                    create: items.map(item => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        specialRequest: item.specialRequest
                    }))
                }
            },
            include: {
                items: {
                    include: {
                        menuItem: true
                    }
                }
            }
        });

        // 創建通知
        await prisma.notification.create({
            data: {
                userId: customerId,
                orderId: order.id,
                message: "您的訂單已成功建立",
                isRead: false
            }
        });

        return NextResponse.json(order);
    } catch (error) {
        console.error("創建訂單時發生錯誤:", error);
        return NextResponse.json(
            { error: "創建訂單失敗" },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 