import { ReactNode } from "react";

export interface InputFieldType<T>
    extends React.InputHTMLAttributes<HTMLInputElement> {
    setValue?: (value: T) => void;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}
