import NavButton from "@/components/nav-button";
import React from "react";

const lookupNavItem = (
    <NavButton title="Lookup" key="lookup" href="/lookup" mode="dark" />
);
const browseNavItem = (
    <NavButton title="Browse" key="browse" href="/browse" mode="light" />
);

export const navItems: React.ReactNode[] = [lookupNavItem, browseNavItem];
