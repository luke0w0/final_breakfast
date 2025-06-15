import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "未授權的訪問" }, { status: 401 });
        }
        if (!["OWNER"].includes(session.user.role)) {
            return NextResponse.json({ error: "權限不足" }, { status: 403 });
        }

        // 直接使用 Prisma 查詢
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                image: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 100
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("獲取使用者列表時發生錯誤:", error);
        return NextResponse.json(
            { error: "獲取使用者列表失敗", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 