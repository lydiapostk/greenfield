const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
};

export type sizeStyleOptions = keyof typeof sizeMap | number;

export const sizeStyle = (size: keyof typeof sizeMap | number) => {
    return typeof size == "number" ? `w-${size} h-${size}` : sizeMap[size];
};
