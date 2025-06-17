import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from '@/lib/prisma';

// 獲取特定訂單
export async function GET(request, { params }) {
    try {
        // 檢查用戶是否已登入
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "未授權的訪問" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // 從資料庫獲取特定訂單
        const order = await prisma.order.findUnique({
            where: { id },
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
            }
        });

        if (!order) {
            return NextResponse.json(
                { error: "訂單不存在" },
                { status: 404 }
            );
        }

        return NextResponse.json(order);
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

// 更新訂單
export async function PUT(request, { params }) {
    try {
        // 檢查用戶是否已登入
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "未授權的訪問" },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { status, items, totalAmount } = body;

        // 更新訂單
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: {
                status,
                totalAmount,
                items: {
                    deleteMany: {},
                    create: items?.map(item => ({
                        menuItemId: item.menuItemId,
                        quantity: item.quantity,
                        specialRequest: item.specialRequest
                    })) || []
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

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("更新訂單時發生錯誤:", error);
        return NextResponse.json(
            { error: "更新訂單失敗", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
}

// 刪除訂單
export async function DELETE(request, { params }) {
    try {
        // 檢查用戶是否已登入
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "未授權的訪問" },
                { status: 401 }
            );
        }

        const { id } = await params;

        // 刪除訂單（會自動刪除相關的訂單項目）
        await prisma.order.delete({
            where: { id }
        });

        return NextResponse.json({ message: "訂單已成功刪除" });
    } catch (error) {
        console.error("刪除訂單時發生錯誤:", error);
        return NextResponse.json(
            { error: "刪除訂單失敗", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 