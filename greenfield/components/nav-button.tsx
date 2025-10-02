interface NavButtonProps {
    title: string;
    href: string;
    mode?: "light" | "dark" | "pop";
    className?: string;
}

const colourCSS = {
    light: "text-black bg-emerald-100/65 hover:bg-emerald-100/85",
    dark: "text-white bg-indigo-800/65 hover:bg-indigo-800/85",
    pop: "text-white bg-violet-800/65 hover:bg-violet-800/85",
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
            className={`${colourCSS[mode]} rounded-full transition delay-100 duration-300 shadow-md shadow-slate-500/40 hover:shadow-slate-500/25 hover:shadow-sm flex items-center justify-center font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px] ${className}`}
        >
            {title}
        </a>
    );
}
