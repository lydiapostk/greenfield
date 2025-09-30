import { icons } from "@/components/icon/icon-svgs";
import { sizeStyle, sizeStyleOptions } from "../size-box";

type IconName = keyof typeof icons;

interface IconProps extends React.SVGProps<SVGSVGElement> {
    name: IconName;
    size?: sizeStyleOptions;
    color?: string;
    active?: boolean;
}

export default function Icon({
    name,
    size = "sm",
    className,
    color = "currentColor",
    strokeWidth = 1.5,
    ...props
}: IconProps) {
    const SvgIcon = icons[name];

    return (
        <SvgIcon
            className={`${sizeStyle(size)} ${className ?? ""}`}
            stroke={color}
            strokeWidth={strokeWidth}
            {...props}
        />
    );
}
