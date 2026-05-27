import { useEffect } from "react";
import { actions, useStore } from "@/lib/store";

export function ThemeApplier() {
  const theme = useStore((s) => s.theme);
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [theme]);
  return null;
}

export function ThemeToggle() {
  const theme = useStore((s) => s.theme);
  return (
    <button
      onClick={() => actions.setProfile({ theme: theme === "dark" ? "light" : "dark" })}
      className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold"
    >
      {theme === "dark" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
