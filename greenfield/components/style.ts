const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
};

export type sizeStyleOptions = keyof typeof sizeMap | number;

export const sizeStyle = (size: keyof typeof sizeMap | number) => {
    return typeof size == "number" ? `w-${size} h-${size}` : sizeMap[size];
};

export const colourCSS = {
    light: "text-black bg-emerald-100/65 hover:bg-emerald-100/85",
    dark: "text-white bg-indigo-800/65 hover:bg-indigo-800/85",
    pop: "text-white bg-violet-800/65 hover:bg-violet-800/85",
};
