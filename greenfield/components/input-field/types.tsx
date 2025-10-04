import { ReactNode } from "react";

export interface DictionaryEntry {
    key: string;
    value?: string;
}

export interface InputFieldType<
    T extends string | number | readonly string[] | undefined
> extends React.InputHTMLAttributes<HTMLInputElement> {
    setValue?: (value: T) => void;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
}

export interface EditableInputFieldType<
    T extends string | number | readonly string[] | undefined,
    V
> extends InputFieldType<T> {
    onSave: (
        field: V,
        value: T,
        setIsEditing: (isEditing: boolean) => void
    ) => void;
    label: string;
    field_key: V;
    value?: T;
    fontStyle?: string;
    showLabel?: boolean;
    searchable?: boolean;
}

export interface EditableCustomFieldType<T, V> {
    onSave: (
        field: V,
        value: T,
        setIsEditing: (isEditing: boolean) => void
    ) => void;
    label: string;
    field_key: V;
    value?: T;
    fontStyle?: string;
    showLabel?: boolean;
    searchable?: boolean;
    placeholder?: string;
    setValue?: (value: T) => void;
    error?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    disabled?: boolean;
}
