import { useGameStore } from "../../store/gameStore";
import s from "./ThemeToggle.module.css";

export function ThemeToggle() {
  const { theme, setTheme } = useGameStore();
  return (
    <button
      className={s.toggle}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle theme"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
