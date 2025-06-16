import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'

export async function DELETE(request, { params }) {
    try {
        const notificationId = params.id;
        if (!notificationId) {
            return NextResponse.json(
                { error: "缺少通知 ID" },
                { status: 400 }
            );
        }

        // 直接刪除通知
        await prisma.notification.delete({
            where: {
                id: notificationId
            }
        });

        return NextResponse.json(
            { message: "通知已成功刪除" },
            { status: 200 }
        );
    } catch (error) {
        console.error("刪除通知時發生錯誤:", error);
        return NextResponse.json(
            { error: "刪除通知失敗" },
            { status: 500 }
        );
    }
} 