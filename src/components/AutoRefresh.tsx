    // File: components/AutoRefresh.tsx
    "use client";

    import { useEffect } from "react";

    interface AutoRefreshProps {
    interval?: number;
    }

    export default function AutoRefresh({ interval = 30 }: AutoRefreshProps) {
    useEffect(() => {
        const timer = setInterval(() => {
        window.location.reload();
        }, interval * 1000);

        return () => clearInterval(timer);
    }, [interval]);

    return null;
    }