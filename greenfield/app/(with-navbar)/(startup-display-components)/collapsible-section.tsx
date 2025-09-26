"use client";
import { ReactElement, useState } from "react";

export default function ExpandableSection(
    children: ReactElement | ReactElement[] | string
) {
    const [isCollapsing, setIsCollapsing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Trigger fade-out animation before collapsing
    const controlFn = () => {
        if (isExpanded) {
            setIsCollapsing(true);
            setTimeout(() => {
                setIsCollapsing(false);
                setIsExpanded(false);
            }, 200); // match CSS animation duration
        } else setIsExpanded(true);
    };

    return {
        component: (
            <div className="border-t pt-4">
                {isExpanded && (
                    <div
                        className={`text-gray-700 ${
                            isCollapsing ? "animate-fadeOut" : "animate-fadeIn"
                        }`}
                    >
                        {children}
                    </div>
                )}
            </div>
        ),
        controlFn: controlFn,
    };
}
