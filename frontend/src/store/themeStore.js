import { create } from "zustand";

/**
 * Zustand store for Theme configuration.
 * Persists theme preference to localStorage.
 */
const getSystemTheme = () => 
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const getSavedTheme = () => {
  return localStorage.getItem("oceanwatch-theme") || "system";
};

const useThemeStore = create((set, get) => ({
  theme: getSavedTheme(), // 'light', 'dark', or 'system'

  setTheme: (newTheme) => {
    localStorage.setItem("oceanwatch-theme", newTheme);
    set({ theme: newTheme });
    get().applyTheme(newTheme);
  },

  applyTheme: (themeToApply) => {
    const root = document.documentElement;
    const isDark = themeToApply === "system" 
      ? window.matchMedia("(prefers-color-scheme: dark)").matches 
      : themeToApply === "dark";
      
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  },
  
  initTheme: () => {
    get().applyTheme(get().theme);
    
    // Listen for system theme changes if set to system
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
      if (get().theme === "system") {
        const root = document.documentElement;
        if (e.matches) root.classList.add("dark");
        else root.classList.remove("dark");
      }
    });
  }
}));

export default useThemeStore;
