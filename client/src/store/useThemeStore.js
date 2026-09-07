import { create } from "zustand";
import { THEMES } from "../constants";

export const useThemeStore = create((set) => ({
  theme: THEMES.some(({ id }) => id === localStorage.getItem("chat-theme"))
    ? localStorage.getItem("chat-theme")
    : THEMES[0].id,
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
