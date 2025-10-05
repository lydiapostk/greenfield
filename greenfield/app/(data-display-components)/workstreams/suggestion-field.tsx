"use client";

import IconButton from "@/components/icon-button";
import Icon from "@/components/icon/icon";
import { useState } from "react";

interface SuggestionFieldProps {
    suggestion: string | string[];
    onApply: (newValue: string | string[]) => void;
    onCancel?: () => void;
}

export default function SuggestionField({
    suggestion,
    onApply,
    onCancel = () => {},
}: SuggestionFieldProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleApplyClick = () => {
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        onApply(suggestion);
        setShowConfirm(false);
    };

    const handleCancel = () => {
        setShowConfirm(false);
        onCancel();
    };

    return (
        <div className="w-full max-w-md lg:max-w-lg space-y-3">
            <div className="rounded-lg border border-dashed border-blue-300 bg-violet-50 p-3 flex flex-col text-sm text-slate-600 gap-2">
                <div className="inline-flex font-medium items-center gap-2">
                    <Icon name={"lightBulb"} />
                    <span className="">Suggestion:</span>
                </div>
                “{suggestion}”
                <IconButton
                    onClick={handleApplyClick}
                    text={"Apply Suggestion"}
                    iconName={"tick"}
                    showText={true}
                    showIcon={false}
                    className="bg-indigo-300 hover:bg-indigo-200 text-slate-800 mb-0"
                    iconClassName="stroke-slate-800"
                />
            </div>

            {/* Confirmation prompt */}
            <div
                className={`transition-all duration-200 ${
                    showConfirm
                        ? "opacity-100 max-h-24 mt-2"
                        : "opacity-0 max-h-0 overflow-hidden"
                }`}
            >
                <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 shadow-sm">
                    <p className="text-sm text-gray-700">
                        Replace current value with suggestion?
                    </p>
                    <div className="flex gap-2 flex-row h-full items-bottom">
                        <IconButton
                            onClick={handleConfirm}
                            text={"Yes"}
                            iconName={"tick"}
                            showText={true}
                            className="bg-blue-300 hover:bg-blue-200 text-slate-800"
                            iconClassName="stroke-slate-800"
                        />
                        <IconButton
                            onClick={handleCancel}
                            text={"No"}
                            iconName={"cross"}
                            showText={true}
                            className="bg-fuchsia-300 hover:bg-fuchsia-200 text-slate-800"
                            iconClassName="stroke-slate-800"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
