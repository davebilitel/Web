export const setupKeyboardShortcuts = () => {
    document.addEventListener('keydown', (e) => {
        // Alt + f: Focus font size control
        if (e.altKey && e.key === 'f') {
            e.preventDefault();
            document.querySelector('[aria-label="Font size"]')?.focus();
        }

        // Alt + a: Focus accessibility controls
        if (e.altKey && e.key === 'a') {
            e.preventDefault();
            document.querySelector('[aria-label="Accessibility controls"]')?.focus();
        }
    });
}; 