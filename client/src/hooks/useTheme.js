import { useState, useEffect } from "react";

export const useTheme = () => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem("chat_theme");
        return saved ? saved === "dark" : true; // dark default
    });

    useEffect(() => {
        localStorage.setItem("chat_theme", isDark ? "dark" : "light");
        // ✅ class روی body بذار تا CSS global هم بتونه ازش استفاده کنه
        document.body.classList.toggle("dark-mode", isDark);
        document.body.classList.toggle("light-mode", !isDark);
    }, [isDark]);

    const toggleTheme = () => setIsDark((prev) => !prev);

    return { isDark, toggleTheme };
};
