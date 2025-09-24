import { icons } from "@/components/icon/icon-svgs";

type IconName = keyof typeof icons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
    size?: "sm" | "md" | "lg" | number;
    color?: string;
}

const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
};

export default function Icon({
    name,
    size = 24,
    className,
    color = "currentColor",
    ...props
}: IconProps) {
    const SvgIcon = icons[name];
    // width={size} height={size}

    return (
        <SvgIcon
            className={`${
                typeof size === "number" ? `w-${size} h-${size}` : sizeMap[size]
            } ${className ?? ""}`}
            stroke={color}
            {...props}
        />
    );
}
