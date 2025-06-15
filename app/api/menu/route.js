import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 處理圖片路徑的輔助函數
const formatImageUrl = (url) => {
    if (!url) return null;
    return url.trim();
};

export async function GET() {
    try {
        const menuItems = await prisma.menuItem.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });
        return NextResponse.json(menuItems);
    } catch (error) {
        console.error("獲取菜單時發生錯誤:", error);
        return NextResponse.json([]);
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        
        // 驗證必要欄位
        if (!data.name || !data.price) {
            return NextResponse.json(
                { error: "名稱和價格為必填欄位" },
                { status: 400 }
            );
        }

        // 創建菜單項目
        const menuItem = await prisma.menuItem.create({
            data: {
                name: data.name,
                description: data.description || "",
                price: parseFloat(data.price),
                imageUrl: data.imageUrl || null,
                isAvailable: data.isAvailable ?? true
            }
        });

        return NextResponse.json(menuItem);
    } catch (error) {
        console.error("創建菜單項目時發生錯誤:", error);
        return NextResponse.json(
            { error: "創建菜單項目失敗" },
            { status: 500 }
        );
    }
} 