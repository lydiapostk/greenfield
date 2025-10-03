"use client";
import { useEffect } from "react";

interface PopupModalProps {
    children: React.ReactElement | React.ReactElement[];
    onClose: () => void;
    onConfirm: () => void;
}

export default function PopupModal({
    children,
    onClose,
    onConfirm,
}: PopupModalProps) {
    // close modal on escape
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscapeKey);
        return () => {
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [onClose]);

    // confirm on enter
    useEffect(() => {
        const handleEnterKey = (e: KeyboardEvent) => {
            if (e.key === "Enter") onConfirm();
        };
        document.addEventListener("keydown", handleEnterKey);
        return () => {
            document.removeEventListener("keydown", handleEnterKey);
        };
    }, [onConfirm]);

    return (
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 max-h-full">
            <div className="bg-white rounded-2xl shadow-lg p-6 min-w-96 w-fit max-h-[80vh] overflow-y-auto">
                {children}
            </div>
        </div>
    );
}
