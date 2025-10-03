import Icon from "@/components/icon/icon";
import { colourCSS } from "@/components/style";

interface CreateButtonProps {
    onClick: () => void;
    showIcon?: boolean;
    showText?: boolean;
    createText?: string;
    disabled?: boolean;
}

export default function CreateButton({
    onClick,
    showIcon = true,
    showText = false,
    createText = "Add",
    disabled = false,
}: CreateButtonProps) {
    return (
        <div
            className={`inline-flex  rounded-2xl px-3 py-1.5 mb-6 self-end stroke-2 
                gap-1 transition ease-in cursor-pointer w-fit font-medium ${
                    disabled ? "cursor-default opacity-0" : "cursor-pointer"
                } ${colourCSS["pop"]}`}
            onClick={disabled ? undefined : onClick}
        >
            {showIcon && (
                <Icon
                    name={"add"}
                    size="md"
                    className="stroke-stone-200 hover:stroke-[2]"
                />
            )}
            {showText && createText}
        </div>
    );
}
