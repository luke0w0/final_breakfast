import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// 獲取單個菜單項目
export async function GET(request, { params }) {
    try {
        const { id } = params;
        const menuItem = await prisma.menuItem.findUnique({
            where: { id }
        });

        if (!menuItem) {
            return NextResponse.json(
                { error: "找不到此菜單項目" },
                { status: 404 }
            );
        }

        return NextResponse.json(menuItem);
    } catch (error) {
        console.error("獲取菜單項目時發生錯誤:", error);
        return NextResponse.json(
            { error: "獲取菜單項目時發生錯誤" },
            { status: 500 }
        );
    }
}

// 更新菜單項目
export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json(
                { error: "未授權的訪問" },
                { status: 401 }
            );
        }

        // 檢查用戶是否為 STAFF 或 OWNER
        if (!["STAFF", "OWNER"].includes(session.user.role)) {
            return NextResponse.json(
                { error: "權限不足" },
                { status: 403 }
            );
        }

        // 使用 Promise.resolve 來確保 params 被正確處理
        const { id } = await Promise.resolve(params);
        const body = await request.json();
        const { name, description, price, isAvailable, imageUrl } = body;

        // 驗證必填欄位
        if (!name || !price) {
            return NextResponse.json(
                { error: "名稱和價格為必填欄位" },
                { status: 400 }
            );
        }

        // 更新菜單項目
        const updatedMenuItem = await prisma.menuItem.update({
            where: { id },
            data: {
                name,
                description: description || "",
                price: parseFloat(price),
                isAvailable: isAvailable ?? true,
                imageUrl: imageUrl || ""
            }
        });

        return NextResponse.json(updatedMenuItem);
    } catch (error) {
        console.error("更新菜單項目時發生錯誤:", error);
        return NextResponse.json(
            { error: "更新菜單項目時發生錯誤" },
            { status: 500 }
        );
    }
}

// 刪除菜單項目
export async function DELETE(request, { params }) {
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

        const { id } = params;

        // 刪除菜單項目
        await prisma.menuItem.delete({
            where: { id }
        });

        return NextResponse.json({ message: "菜單項目已刪除" });
    } catch (error) {
        console.error("刪除菜單項目時發生錯誤:", error);
        return NextResponse.json(
            { error: "刪除菜單項目時發生錯誤" },
            { status: 500 }
        );
    }
} 