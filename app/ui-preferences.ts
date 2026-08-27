import type { Difficulty, UiVersion, V2Mode } from "./flow/types";

export const UI_PREFERENCES_KEY = "f1-ui-preferences:v1";

export type UiPreferences = {
  uiVersion: UiVersion;
  v2Mode: V2Mode;
  difficulty: Difficulty;
};

export const DEFAULT_UI_PREFERENCES: UiPreferences = {
  uiVersion: "v2",
  v2Mode: "giorno",
  difficulty: "beginner",
};

export const loadUiPreferences = (): UiPreferences => {
  if (typeof window === "undefined") return DEFAULT_UI_PREFERENCES;

  try {
    const stored = window.localStorage.getItem(UI_PREFERENCES_KEY);
    if (!stored) return DEFAULT_UI_PREFERENCES;

    const parsed = JSON.parse(stored) as Partial<UiPreferences>;
    return {
      uiVersion: parsed.uiVersion === "v1" ? "v1" : "v2",
      v2Mode: parsed.v2Mode === "notte" ? "notte" : "giorno",
      difficulty: parsed.difficulty === "regular" ? "regular" : "beginner",
    };
  } catch {
    return DEFAULT_UI_PREFERENCES;
  }
};

export const saveUiPreferences = (preferences: UiPreferences) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(UI_PREFERENCES_KEY, JSON.stringify(preferences));
    document.documentElement.dataset.uiVersion = preferences.uiVersion;
    document.documentElement.dataset.v2Mode = preferences.v2Mode;
    document.documentElement.dataset.difficulty = preferences.difficulty;
  } catch {
    // Device storage can be unavailable in private browsing. The quiz still works in memory.
  }
};
