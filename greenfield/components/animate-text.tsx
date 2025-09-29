function _resetTypingInterval(
    typingIntervalRef: React.RefObject<ReturnType<typeof setInterval> | null>
) {
    if (!typingIntervalRef.current) return;
    clearInterval(typingIntervalRef.current);
    typingIntervalRef.current = null;
}

export function typingEffect(
    setText: (text: string) => void,
    fullText: string,
    typingIntervalRef: React.RefObject<ReturnType<typeof setInterval> | null>,
    typingSpeed: number = 300
) {
    _resetTypingInterval(typingIntervalRef);
    let i = 0;
    typingIntervalRef.current = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) {
            _resetTypingInterval(typingIntervalRef);
        }
    }, typingSpeed);
}
