export function typingEffect(
    setText: (text: string) => void,
    fullText: string,
    typingSpeed: number = 300
) {
    let i = 0;
    const interval = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) clearInterval(interval);
    }, typingSpeed);
}
