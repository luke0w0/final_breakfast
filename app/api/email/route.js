import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request) {
    try {
        const { to, subject, message } = await request.json();

        // 創建郵件傳輸器
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        // 郵件選項
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            text: message,
        };

        // 發送郵件
        await transporter.sendMail(mailOptions);

        return NextResponse.json(
            { message: "郵件發送成功" },
            { status: 200 }
        );
    } catch (error) {
        console.error("發送郵件時發生錯誤:", error);
        return NextResponse.json(
            { error: "發送郵件失敗" },
            { status: 500 }
        );
    }
}