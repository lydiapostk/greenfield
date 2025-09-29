"use client";
import { ReactElement, useState } from "react";

export default function CollapsibleSection(
    children: ReactElement | ReactElement[] | string,
    expandableSectionRef?: React.RefObject<(() => void) | null>
) {
    const [isCollapsing, setIsCollapsing] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Trigger fade-out animation before collapsing
    const _collapseSection = () => {
        setIsCollapsing(true);
        if (expandableSectionRef) expandableSectionRef.current = null;
        setTimeout(() => {
            setIsCollapsing(false);
            setIsExpanded(false);
        }, 200); // match CSS animation duration
    };

    const _expandSection = () => {
        if (expandableSectionRef)
            expandableSectionRef.current = _collapseSection;
        setTimeout(() => {
            setIsExpanded(true);
        }, 200);
    };

    const controlFn = () => {
        if (expandableSectionRef?.current) {
            expandableSectionRef.current();
        }
        if (isExpanded) _collapseSection();
        else _expandSection();
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
