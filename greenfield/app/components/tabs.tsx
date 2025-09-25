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

export type ValidInternalPaths = "/browse" | "/lookup";

export const navItems = (className?: string) => [
    lookupNavItem(className),
    browseNavItem(className),
];

export const inactiveNavItems = (
    currPath: ValidInternalPaths,
    className?: string
) => {
    switch (currPath) {
        case "/browse":
            return [lookupNavItem(className)];
        case "/lookup":
            return [browseNavItem(className)];
    }
};
