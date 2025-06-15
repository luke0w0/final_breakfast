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

    if (session.user.role !== "OWNER") {
      return NextResponse.json(
        { error: "只有老闆可以更新用戶圖片" },
        { status: 403 }
      );
    }

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { error: "缺少用戶 ID" },
        { status: 400 }
      );
    }

    const { imageUrl } = await request.json();
    if (!imageUrl) {
      return NextResponse.json(
        { error: "缺少圖片 URL" },
        { status: 400 }
      );
    }

    console.log("更新用戶圖片:", {
      userId: id,
      imageUrl: imageUrl
    });

    // 使用原始 SQL 查詢更新用戶圖片
    const updatedUser = await prisma.$executeRaw`
      UPDATE "User"
      SET "image" = ${imageUrl}
      WHERE id = ${id}
      RETURNING id, name, email, role, "image", "createdAt", "updatedAt"
    `;

    if (!updatedUser) {
      return NextResponse.json(
        { error: "找不到用戶" },
        { status: 404 }
      );
    }

    console.log("用戶圖片更新成功");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("更新用戶圖片時發生錯誤:", error);
    return NextResponse.json(
      { 
        error: "更新用戶圖片失敗", 
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
} 