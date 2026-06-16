// Lightweight theme helper — class-based dark mode on <html>.
// The initial theme is applied before paint by the inline script in index.html;
// these helpers keep React state and localStorage in sync after that.

export const getTheme = () => {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
};

export const applyTheme = (theme) => {
  const dark = theme === "dark";
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    /* ignore storage errors (private mode, etc.) */
  }
  return dark ? "dark" : "light";
};

export const toggleTheme = () => applyTheme(getTheme() === "dark" ? "light" : "dark");
