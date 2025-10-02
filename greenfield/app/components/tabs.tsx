import NavButton from "@/components/nav-button";
import React from "react";

const lookupNavItem = (className?: string) => (
    <NavButton
        title="Lookup"
        key="lookup"
        href="/lookup"
        mode="dark"
        className={className}
    />
);
const browseNavItem = (className?: string) => (
    <NavButton
        title="Browse"
        key="browse"
        href="/browse"
        mode="light"
        className={className}
    />
);
const anaylseNavItem = (className?: string) => (
    <NavButton
        title="Analyse"
        key="analyse"
        href="/analyse"
        mode="pop"
        className={className}
    />
);

export type ValidInternalPaths = "/browse" | "/lookup" | "/analyse" | string;

export const navItems = (className?: string) => [
    lookupNavItem(className),
    browseNavItem(className),
    anaylseNavItem(className),
];

export const inactiveNavItems = (
    currPath: ValidInternalPaths,
    className?: string
) => {
    switch (currPath) {
        case "/browse":
            return [lookupNavItem(className), anaylseNavItem(className)];
        case "/lookup":
            return [browseNavItem(className), anaylseNavItem(className)];
        case "/analyse":
            return [lookupNavItem(className), browseNavItem(className)];
        default:
            return navItems(className);
    }
};
