// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DEFAULT_THEME_ID,
  applyThemePreference,
  createThemeController,
  normalizeThemePreference,
  readStoredThemePreference,
  themeOptions
} from "../../src/controllers/theme-controller";
import { MemoryStorage } from "../fixtures/memory-storage";

const STORAGE_KEY = "pua.web.themePreference";

describe("theme controller", () => {
  beforeEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it("exposes a registry that always contains the default theme", () => {
    const options = themeOptions();
    expect(options.length).toBeGreaterThan(0);
    expect(options[0].id).toBe(DEFAULT_THEME_ID);
    expect(options.map((option) => option.id)).toEqual([DEFAULT_THEME_ID, "slate", "riso"]);
    expect(options.every((option) => option.label && option.description)).toBe(true);
  });

  it("normalizes unknown or missing preferences back to the default theme", () => {
    expect(normalizeThemePreference(undefined)).toBe(DEFAULT_THEME_ID);
    expect(normalizeThemePreference(null)).toBe(DEFAULT_THEME_ID);
    expect(normalizeThemePreference("bogus")).toBe(DEFAULT_THEME_ID);
    expect(normalizeThemePreference(DEFAULT_THEME_ID)).toBe(DEFAULT_THEME_ID);
    expect(normalizeThemePreference("slate")).toBe("slate");
    expect(normalizeThemePreference("riso")).toBe("riso");
  });

  it("reads the stored preference defensively", () => {
    expect(readStoredThemePreference(null)).toBe(DEFAULT_THEME_ID);
    const bogus = new MemoryStorage();
    bogus.setItem(STORAGE_KEY, "bogus");
    expect(readStoredThemePreference(bogus)).toBe(DEFAULT_THEME_ID);
    const stored = new MemoryStorage();
    stored.setItem(STORAGE_KEY, DEFAULT_THEME_ID);
    expect(readStoredThemePreference(stored)).toBe(DEFAULT_THEME_ID);
    const throwing = { getItem: () => { throw new Error("denied"); } } as unknown as Storage;
    expect(readStoredThemePreference(throwing)).toBe(DEFAULT_THEME_ID);
  });

  it("applies the theme to the root element dataset", () => {
    applyThemePreference(DEFAULT_THEME_ID);
    expect(document.documentElement.dataset.theme).toBe(DEFAULT_THEME_ID);
    applyThemePreference("bogus");
    expect(document.documentElement.dataset.theme).toBe(DEFAULT_THEME_ID);
  });

  it("initializes from storage and applies the stored theme", () => {
    const storage = new MemoryStorage();
    storage.setItem(STORAGE_KEY, DEFAULT_THEME_ID);
    const controller = createThemeController(vi.fn(), storage);
    controller.initialize();
    expect(controller.theme()).toBe(DEFAULT_THEME_ID);
    expect(document.documentElement.dataset.theme).toBe(DEFAULT_THEME_ID);
  });

  it("persists selection changes and notifies listeners", () => {
    const storage = new MemoryStorage();
    const onChange = vi.fn();
    const controller = createThemeController(onChange, storage);
    controller.initialize();
    controller.setTheme("riso");
    expect(storage.getItem(STORAGE_KEY)).toBe("riso");
    expect(document.documentElement.dataset.theme).toBe("riso");
    expect(onChange).toHaveBeenCalledTimes(1);
    controller.setTheme(DEFAULT_THEME_ID);
    expect(storage.getItem(STORAGE_KEY)).toBe(DEFAULT_THEME_ID);
    expect(document.documentElement.dataset.theme).toBe(DEFAULT_THEME_ID);
  });

  it("ignores unregistered themes on set", () => {
    const storage = new MemoryStorage();
    const controller = createThemeController(vi.fn(), storage);
    controller.initialize();
    controller.setTheme("bogus");
    expect(controller.theme()).toBe(DEFAULT_THEME_ID);
    expect(storage.getItem(STORAGE_KEY)).toBe(DEFAULT_THEME_ID);
  });
});
