"use client";

import Icon from "@/components/icon/icon";
import { StartupType } from "./startup-data-type";
import { useEffect, useState } from "react";

export interface UserDrawerProp {
    startup: StartupType;
    onClose: () => void;
}

export default function StartupDrawer({ startup, onClose }: UserDrawerProp) {
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
                className={`w-2/5 bg-stone-100/95 text-gray-900 shadow-2xl h-full p-6 overflow-y-auto ${
                    isClosing ? "animate-slideOut" : "animate-slideIn"
                }`}
            >
                <div className="flex flex-col justify-start items-start mb-4 gap-4">
                    <Icon
                        onClick={triggerClose}
                        name={"close"}
                        size="lg"
                        className="stroke-indigo-600 hover:stroke-[2]"
                    />
                    <h2 className="text-3xl font-bold pb-10">
                        {startup.company_name}
                    </h2>
                </div>
                <p>
                    <span className="font-bold">Website:</span>{" "}
                    {startup.company_website}
                </p>

                <div className="mt-6">
                    <h3 className="font-bold text-lg mb-2">About</h3>
                    <p className="text-gray-700">
                        This is where you can display extra details about the
                        user, such as bio, recent activity, or notes.
                    </p>
                </div>
            </div>
        </div>
    );
}
