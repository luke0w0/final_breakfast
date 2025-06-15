import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json(
                { error: "未授權的訪問" },
                { status: 401 }
            );
        }

        // 檢查用戶是否為 STAFF、CHEF 或 OWNER
        if (!["STAFF", "CHEF", "OWNER"].includes(session.user.role)) {
            return NextResponse.json(
                { error: "權限不足" },
                { status: 403 }
            );
        }

        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: "缺少訂單 ID" },
                { status: 400 }
            );
        }

        const { status } = await request.json();
        if (!status) {
            return NextResponse.json(
                { error: "缺少狀態參數" },
                { status: 400 }
            );
        }

        // 檢查訂單是否存在
        const order = await prisma.order.findUnique({
            where: { id }
        });

        if (!order) {
            return NextResponse.json(
                { error: "找不到訂單" },
                { status: 404 }
            );
        }

        // 更新訂單狀態
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
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

        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error("更新訂單狀態時發生錯誤:", error);
        return NextResponse.json(
            { 
                error: "更新訂單狀態失敗", 
                details: error.message 
            },
            { status: 500 }
        );
    }
} 