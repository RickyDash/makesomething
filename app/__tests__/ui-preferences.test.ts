import { afterEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_UI_PREFERENCES,
  UI_PREFERENCES_KEY,
  loadUiPreferences,
  readStorage,
  saveUiPreferences,
  writeStorage,
} from "../ui-preferences";

type StorageStub = Pick<Storage, "getItem" | "setItem">;

const installWindow = (storage: StorageStub) => {
  vi.stubGlobal("window", { localStorage: storage });
  vi.stubGlobal("document", { documentElement: { dataset: {} } });
};

const throwingStorage = (): StorageStub => ({
  getItem: () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  },
  setItem: () => {
    throw new DOMException("The operation is insecure.", "SecurityError");
  },
});

const memoryStorage = (): StorageStub & { data: Map<string, string> } => {
  const data = new Map<string, string>();
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
};

describe("storage helpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("return null / false without a window (server render)", () => {
    expect(readStorage("anything")).toBeNull();
    expect(writeStorage("anything", "1")).toBe(false);
    expect(loadUiPreferences()).toEqual(DEFAULT_UI_PREFERENCES);
  });

  it("swallow SecurityError from blocked storage instead of throwing", () => {
    installWindow(throwingStorage());

    expect(() => readStorage("f1-best-reaction-ms")).not.toThrow();
    expect(readStorage("f1-best-reaction-ms")).toBeNull();
    expect(writeStorage("f1-best-reaction-ms", "222")).toBe(false);
    expect(loadUiPreferences()).toEqual(DEFAULT_UI_PREFERENCES);
    expect(() =>
      saveUiPreferences({ uiVersion: "v1", v2Mode: "notte", difficulty: "regular" }),
    ).not.toThrow();
    expect(document.documentElement.dataset).toEqual({
      uiVersion: "v1",
      v2Mode: "notte",
      difficulty: "regular",
    });
  });

  it("round-trip values and preferences through a working storage", () => {
    const storage = memoryStorage();
    installWindow(storage);

    expect(writeStorage("f1-best-score", "5")).toBe(true);
    expect(readStorage("f1-best-score")).toBe("5");

    saveUiPreferences({ uiVersion: "v1", v2Mode: "notte", difficulty: "regular" });
    expect(JSON.parse(storage.data.get(UI_PREFERENCES_KEY) ?? "{}")).toEqual({
      uiVersion: "v1",
      v2Mode: "notte",
      difficulty: "regular",
    });
    expect(loadUiPreferences()).toEqual({ uiVersion: "v1", v2Mode: "notte", difficulty: "regular" });
  });

  it("loads older saved preferences with beginner difficulty", () => {
    const storage = memoryStorage();
    storage.data.set(
      UI_PREFERENCES_KEY,
      JSON.stringify({ uiVersion: "v2", v2Mode: "notte" }),
    );
    installWindow(storage);
    expect(loadUiPreferences()).toEqual({
      uiVersion: "v2",
      v2Mode: "notte",
      difficulty: "beginner",
    });
  });

  it("fall back to defaults on corrupt preference JSON", () => {
    const storage = memoryStorage();
    storage.data.set(UI_PREFERENCES_KEY, "{not json");
    installWindow(storage);

    expect(loadUiPreferences()).toEqual(DEFAULT_UI_PREFERENCES);
  });
});
