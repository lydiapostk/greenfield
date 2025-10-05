import Icon, { IconName } from "@/components/icon/icon";
import { colourCSS } from "@/components/style";

interface IconButtonProps {
    onClick: () => void;
    text: string;
    iconName: IconName;
    showIcon?: boolean;
    showText?: boolean;
    disabled?: boolean;
    className?: string;
    iconClassName?: string;
    hideWhenDisabled?: boolean;
}

export default function IconButton({
    onClick,
    text,
    iconName,
    showIcon = true,
    showText = false,
    disabled = false,
    className = colourCSS["pop"],
    hideWhenDisabled = true,
    iconClassName = "stroke-stone-200 hover:stroke-[2] ",
}: IconButtonProps) {
    return (
        <div
            className={`inline-flex  rounded-2xl px-3 py-1.5 stroke-2 
                gap-1 transition ease-in cursor-pointer w-fit font-medium ${
                    disabled && hideWhenDisabled
                        ? "cursor-default opacity-0"
                        : "cursor-pointer"
                } ${className}`}
            onClick={disabled ? undefined : onClick}
        >
            {showIcon && (
                <Icon
                    name={iconName}
                    size="md"
                    className={`${iconClassName}`}
                />
            )}
            {showText && text}
        </div>
    );
}
