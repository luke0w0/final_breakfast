"use client";

import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
    return (
        <SessionProvider
            refetchInterval={0}
            refetchOnWindowFocus={false}
            refetchWhenOffline={false}
            refetchOnMount={true}
        >
            {children}
        </SessionProvider>
    );
} 