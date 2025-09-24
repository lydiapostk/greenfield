"use client";
import { Sora } from "next/font/google";
import { useEffect, useState } from "react";

const sora = Sora({
    variable: "--sans-serif",
    subsets: ["latin"],
});

export function ScoutIcon({
    className,
    showAnimation = false,
}: {
    className?: string;
    showAnimation?: boolean;
}) {
    const [text, setText] = useState("");
    const fullText = "scout.";

    useEffect(() => {
        if (showAnimation) {
            let i = 0;
            const interval = setInterval(() => {
                setText(fullText.slice(0, i + 1));
                i++;
                if (i === fullText.length) clearInterval(interval);
            }, 300); // typing speed
            return () => clearInterval(interval);
        } else {
            setText(fullText);
        }
    }, []);

    return (
        <div
            className={`${sora.variable} text-stone-200 font-bold ${className}`}
        >
            {text}
            {showAnimation ? <span className="animate-pulse">|</span> : <></>}
        </div>
    );
}
