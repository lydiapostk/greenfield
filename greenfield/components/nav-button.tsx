import { Link } from "react-router-dom";

interface NavButtonProps {
    title: string;
    href: string;
    mode?: "light" | "dark";
    className?: string;
}

const colourCSS = {
    light: "text-black bg-teal-100/25 hover:bg-teal-100/50",
    dark: "text-white bg-indigo-800/25 hover:bg-indigo-800/75",
};

export default function NavButton({
    title,
    href,
    className,
    mode = "light",
}: NavButtonProps) {
    return (
        <a
            href={href}
            className={`${colourCSS[mode]} rounded-full shadow-md shadow-slate-500/40 hover:shadow-slate-500/25 flex items-center justify-center font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px] ${className}`}
        >
            {title}
        </a>
    );
}
