import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
// @ts-ignore
import type { NextAuthConfig } from "next-auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const params = {
    prompt: "consent",
    access_type: "offline",
    response_type: "code",
};

const authOptions = {
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID,
            clientSecret: process.env.GITHUB_CLIENT_SECRET,
            authorization: {
                params: params,
            },
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: params,
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            try {
                if (account?.provider === "google") {
                    // 設定基本用戶資料
                    user.role = "CUSTOMER";
                    user.emailVerified = new Date();
                    
                    // 檢查用戶是否已存在
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email }
                    });

                    if (!existingUser) {
                        // 創建新用戶，只包含必要的欄位
                        await prisma.user.create({
                            data: {
                                email: user.email,
                                name: user.name,
                                role: "CUSTOMER"
                            }
                        });
                    }
                }
                return true;
            } catch (error) {
                console.error("登入過程中發生錯誤:", error);
                return false;
            }
        },
        async jwt({ token, user, account }) {
            if (user) {
                token.role = user.role;
                token.emailVerified = user.emailVerified;
                token.id = user.id;
            }
            if (account) {
                token.provider = account.provider;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
                session.user.provider = token.provider;
                session.user.emailVerified = token.emailVerified;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    debug: process.env.NODE_ENV === "development"
};

export default authOptions as NextAuthConfig;
