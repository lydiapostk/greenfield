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
        <div className="flex-1 w-full flex flex-col justify-start items-center">
            <Navbar
                leftIcon={
                    <a href={"/"}>
                        <ScoutIcon className="text-xl" />
                    </a>
                }
                navItems={inactiveNavItems(currPath as ValidInternalPaths)}
                className=""
            />
            <div className="w-full flex-1 flex">{children}</div>
        </div>
    );
}
