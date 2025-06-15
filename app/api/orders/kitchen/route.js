import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "未授權的訪問" },
                { status: 401 }
            );
        }

        // 檢查用戶是否為 CHEF 或 OWNER
        if (!["CHEF", "OWNER"].includes(session.user.role)) {
            return NextResponse.json(
                { error: "權限不足" },
                { status: 403 }
            );
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

        return NextResponse.json(kitchenOrders);
    } catch (error) {
        console.error("獲取廚房訂單時發生錯誤:", error);
        return NextResponse.json(
            { 
                error: "獲取廚房訂單失敗", 
                details: error.message 
            },
            { status: 500 }
        );
    }
} 