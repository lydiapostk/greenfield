"use client";

import Icon from "@/components/icon/icon";
import { StartupType } from "./startup-data-type";
import { useEffect, useState } from "react";
import StartupView from "./startup_view";

export interface StartupDrawerProp {
    startup: StartupType;
    onClose: () => void;
    onDel?: () => void;
    fullScreen?: boolean;
}

export default function StartupDrawer({
    startup,
    onClose,
    onDel,
    fullScreen = false,
}: StartupDrawerProp) {
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
                    fullScreen ? "w-full" : "w-2/5"
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
                <div className="flex flex-row w-full justify-start items-center gap-2 mt-10">
                    <a href={startup.id ? `/browse/${startup.id}` : undefined}>
                        <Icon
                            name={"edit"}
                            size="md"
                            className="stroke-indigo-600 hover:stroke-[2]"
                        />
                    </a>
                    {onDel && (
                        <Icon
                            name={"delete"}
                            size="md"
                            className="stroke-rose-600 hover:stroke-[2]"
                            onClick={onDel}
                        />
                    )}
                </div>
                <StartupView startup={startup} />
            </div>
        </div>
    );
}
