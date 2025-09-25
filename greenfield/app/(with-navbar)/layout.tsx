"use client";

import { Navbar } from "@/components/nav-bar";
import { ScoutIcon } from "../components/logo";
import { inactiveNavItems, ValidInternalPaths } from "../components/tabs";
import { JSX } from "react";
import { usePathname } from "next/navigation";

export default function WithNavbarLayout({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    const currPath = usePathname();

    return (
        <div className="h-full w-full flex flex-col gap-10 justify-center items-center">
            <Navbar
                leftIcon={
                    <a href={"/"}>
                        <ScoutIcon className="text-xl" />
                    </a>
                }
                navItems={inactiveNavItems(currPath as ValidInternalPaths)}
                className="flex-[1]"
            />
            <div className="flex-[9] w-full h-full flex items-center">
                {children}
            </div>
        </div>
    );
}
