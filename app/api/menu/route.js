import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// export async function GET(request) {
//     let todos = await prisma.todo.findMany({ orderBy: [{ id: "asc" }] });

//     let filterString = request.nextUrl.searchParams.get("filter");
//     if (!filterString) {
//         return NextResponse.json(todos);
//     }

//     filterString = filterString.toLowerCase();
//     todos = todos.filter((todo) =>
//         todo.title.toLowerCase().includes(filterString)
//     );

//     if (todos.length === 0) {
//         return NextResponse.json(
//             { error: `No todo with "${filterString}" exists` },
//             { status: 404 }
//         );
//     }

//     return NextResponse.json(todos);
export async function POST(request) {
    try {
        const body = await request.json();

        // 手動檢查必要欄位
        if (!body.name || typeof body.name !== "string") {
            return new Response(
                JSON.stringify({ message: "name 是必填欄位" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        if (typeof body.price !== "number" || isNaN(body.price)) {
            return new Response(
                JSON.stringify({ message: "price 必須是數字" }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }

        const newMenu = await prisma.menuItem.create({
            data: {
                name: body.name,
                description: body.description || null,
                price: body.price,
                imageUrl: body.imageUrl || null,
                isAvailable:
                    typeof body.isAvailable === "boolean"
                        ? body.isAvailable
                        : true,
            },
        });

        return new Response(JSON.stringify(newMenu), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("後端錯誤:", error);
        return new Response(
            JSON.stringify({ message: "伺服器錯誤", error: String(error) }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            }
        );
    }
}
