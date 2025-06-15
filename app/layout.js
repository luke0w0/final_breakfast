import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "早餐店點餐系統",
    description: "一個簡單的早餐店點餐系統",
};

export default function RootLayout({ children }) {
    return (
        <html lang="zh-TW">
            <body className={inter.className}>
                <Providers>
                    <main className="min-h-screen">{children}</main>
                </Providers>
            </body>
        </html>
    );
} 