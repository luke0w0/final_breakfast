import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        
        // 檢查是否已登入
        if (!session) {
            return NextResponse.json(
                { error: "未登入" },
                { status: 401 }
            );
        }

        // 檢查是否為管理員
        if (session.user.role !== "OWNER") {
            return NextResponse.json(
                { error: "沒有權限執行此操作" },
                { status: 403 }
            );
        }

        // 確保 params 已經被解析
        const id = params?.id;
        if (!id) {
            return NextResponse.json(
                { error: "缺少用戶 ID" },
                { status: 400 }
            );
        }

        const { role } = await request.json();

        // 驗證角色
        const validRoles = ["CUSTOMER", "STAFF", "CHEF", "OWNER"];
        if (!validRoles.includes(role)) {
            return NextResponse.json(
                { error: "無效的角色" },
                { status: 400 }
            );
        }

        // 更新使用者角色
        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error("更新使用者角色時發生錯誤:", error);
        return NextResponse.json(
            { error: "更新使用者角色時發生錯誤" },
            { status: 500 }
        );
    }
} 