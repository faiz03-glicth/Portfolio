"use client";

import { Moon, Sun } from "lucide-react";
import type { ThemeMode } from "@/config/theme";
import { theme } from "@/config/theme";
import { IconButton } from "@/components/ui/icon-button";
import { THEME_STORAGE_KEY } from "./theme-script";

function currentMode(): ThemeMode {
  const explicit = document.documentElement.getAttribute("data-theme");
  return explicit === "light" || explicit === "dark"
    ? explicit
    : theme.defaultMode;
}

/**
 * Two-state light/dark switch.
 *
 * Holds no React state at all. `ThemeScript` has already written the resolved
 * mode onto `<html>`, so the DOM is the source of truth and both icons render
 * with CSS deciding which is visible. That keeps the control correct on the
 * very first paint, with no hydration mismatch and no icon swap.
 */
export function ThemeToggle() {
  function toggle() {
    const next: ThemeMode = currentMode() === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Private mode or blocked storage: the choice simply will not persist.
    }
  }

  return (
    <IconButton label="Toggle colour theme" onClick={toggle} size="sm">
      <Sun className="hidden dark:block" />
      <Moon className="block dark:hidden" />
    </IconButton>
  );
}
