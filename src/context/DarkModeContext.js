import React, { createContext, useContext, useState, useEffect } from "react";

const DarkModeContext = createContext();

export const useDarkMode = () => {
  const context = useContext(DarkModeContext);
  if (!context) {
    throw new Error("useDarkMode must be used within a DarkModeProvider");
  }
  return context;
};

const getInitialDarkMode = () => {
  try {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) return savedMode === "true";
  } catch (e) {
    // localStorage can be unavailable (private mode / SSR) — fall through.
  }
  // No explicit choice yet: follow the OS preference.
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
};

export const DarkModeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(getInitialDarkMode);

  // Keep the <html> element, native color-scheme (form controls, date pickers,
  // scrollbars) and the browser theme color in sync with the theme.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isDarkMode);
    root.style.colorScheme = isDarkMode ? "dark" : "light";

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", isDarkMode ? "#111827" : "#ffffff");

    try {
      localStorage.setItem("darkMode", isDarkMode.toString());
    } catch (e) {
      // Ignore storage failures.
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <DarkModeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </DarkModeContext.Provider>
  );
};
