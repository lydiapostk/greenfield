import NavButton from "@/components/nav-button";
import { ScoutIcon } from "./components/logo";
import { navItems } from "./components/tabs";

export default function Home() {
    return (
        <div className="flex flex-col gap-10 justify-center self-center items-center h-full">
            <ScoutIcon showAnimation={true} className="text-7xl" />
            <div className="flex flex-row gap-10 justify-center items-center">
                {navItems}
            </div>
        </div>
    );
}
