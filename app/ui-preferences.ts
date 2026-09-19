import type { UiVersion, V2Mode } from "./flow/types";

export const UI_PREFERENCES_KEY = "f1-ui-preferences:v1";

export type UiPreferences = {
  uiVersion: UiVersion;
  v2Mode: V2Mode;
};

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  uiVersion: "v2",
  v2Mode: "giorno",
};

/**
 * Safe localStorage access. iOS Safari throws a SecurityError on every
 * localStorage call when "Block All Cookies" is on (and other browsers do the
 * same in locked-down or quota-exhausted contexts). A throw inside a React
 * initialiser or effect takes the whole page down, so every read and write
 * goes through these helpers and degrades to in-memory state instead.
 */
export const readStorage = (key: string): string | null => {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStorage = (key: string, value: string): boolean => {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

export const loadUiPreferences = (): UiPreferences => {
  const stored = readStorage(UI_PREFERENCES_KEY);
  if (!stored) return DEFAULT_UI_PREFERENCES;

  try {
    const parsed = JSON.parse(stored) as Partial<UiPreferences>;
    return {
      uiVersion: parsed.uiVersion === "v1" ? "v1" : "v2",
      v2Mode: parsed.v2Mode === "notte" ? "notte" : "giorno",
    };
  } catch {
    return DEFAULT_UI_PREFERENCES;
  }
};

export const saveUiPreferences = (preferences: UiPreferences) => {
  if (typeof window === "undefined") return;

  writeStorage(UI_PREFERENCES_KEY, JSON.stringify(preferences));
  document.documentElement.dataset.uiVersion = preferences.uiVersion;
  document.documentElement.dataset.v2Mode = preferences.v2Mode;
};
