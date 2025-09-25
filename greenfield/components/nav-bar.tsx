"use client";

import { JSX, useState } from "react";

interface NavbarProps {
    leftIcon: React.ReactNode;
    navItems: JSX.Element[];
    className?: string;
}

export function Navbar({ leftIcon, navItems, className }: NavbarProps) {
    const [open, setOpen] = useState(false);

    const firstTwoNavItems = navItems.slice(0, 2);
    const remainingNavItems = navItems.slice(2);

    return (
        <nav
            className={`flex flex-row w-full items-center px-10 justify-between bg-stone-200/25 text-stone-200 ${className}`}
        >
            {/* Left icon/logo */}
            <div className="flex items-center">{leftIcon}</div>

            {/* Right side nav */}
            <div className="flex items-center gap-6">
                {/* First two links */}
                {firstTwoNavItems}

                {/* Dropdown for remaining */}
                {remainingNavItems.length > 0 && (
                    <div className="">
                        <button
                            onClick={() => setOpen((o) => !o)}
                            className="hover:text-stone-400 transition-colors"
                        >
                            More ▾
                        </button>
                        {open && remainingNavItems}
                    </div>
                )}
            </div>
        </nav>
    );
}
