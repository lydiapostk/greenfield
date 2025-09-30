"use client";

import Icon from "@/components/icon/icon";
import { ReactElement, useEffect, useState } from "react";

export interface SideDrawerProp {
    onClose: () => void;
    onDel?: () => void;
    inFullScreen?: boolean;
    children: ReactElement | ReactElement[];
}

export default function SideDrawer({
    onClose,
    inFullScreen = false,
    children,
}: SideDrawerProp) {
    const [isClosing, setIsClosing] = useState(false);

    // Trigger slide-out animation before closing
    const triggerClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            onClose();
        }, 200); // match CSS animation duration
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                triggerClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [triggerClose]);

    return (
        <div className="fixed inset-0 flex justify-end bg-black/40">
            <div
                className={`${
                    inFullScreen ? "w-full" : "lg:w-5/12 md:w-3/5 sm:w-full"
                } bg-stone-100/95 text-gray-900 shadow-2xl h-full p-6 overflow-y-auto ${
                    isClosing ? "animate-slideOut" : "animate-slideIn"
                }`}
            >
                <Icon
                    onClick={triggerClose}
                    name={"close"}
                    size="lg"
                    className="stroke-indigo-600 hover:stroke-[2]"
                />
                {children}
            </div>
        </div>
    );
}
