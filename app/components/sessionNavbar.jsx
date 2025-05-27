"use client";

import { SessionProvider } from "next-auth/react";
import React from "react";
import Navbar from "./navbar";

export default function SessionNavbar() {
    return (
        <SessionProvider>
            <Navbar />
        </SessionProvider>
    );
}
