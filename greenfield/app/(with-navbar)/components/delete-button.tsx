import Icon from "@/components/icon/icon";

interface DeleteButtonProps {
    onClick: () => void;
    showIcon?: boolean;
    showText?: boolean;
    deleteText?: string;
    disabled?: boolean;
}

export default function DeleteButton({
    onClick,
    showIcon = true,
    showText = false,
    deleteText = "Delete",
    disabled = false,
}: DeleteButtonProps) {
    return (
        <div
            className={`inline-flex bg-rose-600 rounded-2xl px-3 py-1.5 mb-6
                        hover:bg-rose-700 stroke-2 gap-1 transition ease-in cursor-pointer 
                        w-fit text-stone-200 font-medium ${
                            disabled
                                ? "cursor-default opacity-0"
                                : "cursor-pointer"
                        }`}
            onClick={disabled ? undefined : onClick}
        >
            {showIcon && (
                <Icon
                    name={"delete"}
                    size="md"
                    className="stroke-stone-200 hover:stroke-[2]"
                />
            )}
            {showText && deleteText}
        </div>
    );
}
