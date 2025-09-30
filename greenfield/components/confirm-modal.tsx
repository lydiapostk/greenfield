"use client";
import { ReactNode, useEffect } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    title?: string;
    message?: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    onClose: () => void;
    onConfirm: () => void;
}

export default function ConfirmModal({
    isOpen,
    title = "Are you sure?",
    message = "This action cannot be undone.",
    confirmText = "Confirm",
    cancelText = "Cancel",
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
                <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
                <div className="mt-2 text-gray-600 text-sm">{message}</div>

                <div className="mt-6 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-stone-200 text-stone-700 hover:bg-stone-300"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className="px-4 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
