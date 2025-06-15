import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: "未授權的訪問" }, { status: 401 });
        }

        const { id: userId } = params;
        if (!userId) {
            return NextResponse.json({ error: "缺少使用者 ID" }, { status: 400 });
        }

        // 更新該使用者的所有未讀通知為已讀
        await prisma.notification.updateMany({
            where: {
                userId: userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("更新通知已讀狀態時發生錯誤:", error);
        return NextResponse.json(
            { error: "更新通知已讀狀態失敗", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 