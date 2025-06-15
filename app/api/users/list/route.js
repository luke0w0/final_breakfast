import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // 使用原生 SQL 查詢
        const users = await prisma.$executeRaw`
            SELECT 
                id, 
                email, 
                name, 
                role, 
                image,
                "createdAt", 
                "updatedAt"
            FROM "User"
            ORDER BY "createdAt" DESC
            LIMIT 100
        `;

        return NextResponse.json(users);
    } catch (error) {
        console.error("資料庫查詢錯誤:", error);
        return NextResponse.json(
            { error: "資料庫查詢失敗", details: error.message },
            { status: 500 }
        );
    } finally {
        await prisma.$disconnect();
    }
} 