"use client";
import { useEffect } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    children: React.ReactElement | React.ReactElement[];
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmModal({
    isOpen,
    children,
    onClose,
    onConfirm,
}: ConfirmModalProps) {
    if (!isOpen) return null;
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg p-6 w-96">
                {children}
            </div>
        </div>
    );
}
