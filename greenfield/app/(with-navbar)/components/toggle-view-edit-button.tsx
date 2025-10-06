import Icon from "@/components/icon/icon";

interface ToggleViewEditButtonProps {
    inEditMode: boolean;
    setInEditMode: (value: boolean) => void;
}

export default function ToggleViewEditButton({
    inEditMode,
    setInEditMode,
}: ToggleViewEditButtonProps) {
    return (
        <div
            className={`inline-flex w-fit rounded-2xl px-3 py-1.5 self-end 
                            stroke-2 gap-1 transition ease-in cursor-pointer 
                            ${
                                inEditMode
                                    ? "bg-violet-200  hover:bg-violet-100 text-stone-700"
                                    : "bg-violet-600  hover:bg-violet-700 text-stone-200"
                            } font-medium`}
            onClick={() => setInEditMode(!inEditMode)}
        >
            {!inEditMode && (
                <Icon
                    name={"edit"}
                    size="md"
                    className="stroke-stone-200 hover:stroke-[2]"
                />
            )}
            {inEditMode ? "Exit edit mode" : "Edit"}
        </div>
    );
}
