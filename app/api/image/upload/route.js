import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createClient } from "@supabase/supabase-js";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("缺少環境變數: NEXT_PUBLIC_SUPABASE_URL");
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("缺少環境變數: NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
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
                { error: "只有老闆可以上傳圖片" },
                { status: 403 }
            );
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file) {
            return NextResponse.json(
                { error: "未找到檔案" },
                { status: 400 }
            );
        }

        console.log("開始上傳檔案:", {
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const fileExtension = file.name.split(".").pop();
        const fileName = `${timestamp}-${randomNum}.${fileExtension}`;

        console.log("準備上傳到 Supabase:", {
            fileName,
            fileType: file.type
        });

        const { data, error } = await supabase.storage
            .from("uploads")
            .upload(fileName, buffer, {
                contentType: file.type,
            });

        if (error) {
            console.error("上傳到 Supabase 時發生錯誤:", error);
            return NextResponse.json(
                { error: "上傳失敗", details: error.message },
                { status: 500 }
            );
        }

        console.log("檔案上傳成功:", data);

        const { data: { publicUrl } } = supabase.storage
            .from("uploads")
            .getPublicUrl(fileName);

        console.log("獲取公開 URL 成功:", publicUrl);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error("上傳圖片時發生錯誤:", error);
        return NextResponse.json(
            { error: "上傳失敗", details: error.message },
            { status: 500 }
        );
    }
} 