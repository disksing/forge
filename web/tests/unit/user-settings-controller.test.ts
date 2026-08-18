import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createUserSettingsController, decodeStoredUserName, sanitizeUserNameInput, validateUserName } from "../../src/controllers/user-settings-controller";
import { ResourceScope } from "../../src/runtime/resource-scope";

const storedValues = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storedValues.get(key) ?? null,
  setItem: (key: string, value: string) => { storedValues.set(key, value); },
  removeItem: (key: string) => { storedValues.delete(key); },
  clear: () => storedValues.clear(),
  key: (index: number) => [...storedValues.keys()][index] ?? null,
  get length() { return storedValues.size; },
} satisfies Storage;

beforeEach(() => {
  Object.defineProperty(window, "localStorage", { configurable: true, value: localStorageMock });
});

afterEach(() => storedValues.clear());

describe("user settings validation", () => {
  it("keeps only filesystem-safe identifier characters in the input", () => {
    expect(sanitizeUserNameInput("Alice 张/.._2-test")).toBe("Alice_2-test");
  });

  it("uses User for an empty name and rejects non-identifier names", () => {
    expect(validateUserName("")).toBe("User");
    expect(() => validateUserName("two words")).toThrow("only letters");
    expect(() => validateUserName("name.dot")).toThrow("only letters");
    expect(validateUserName("User_2-test")).toBe("User_2-test");
  });

  it("persists User when saving an empty name", () => {
    const scope = new ResourceScope();
    const controller = createUserSettingsController(scope, () => undefined);

    expect(controller.save("")).toBe("User");
    expect(JSON.parse(window.localStorage.getItem("pua.web.user.v1")!)).toMatchObject({ version: 1, name: "User" });

    scope.dispose();
  });

  it("falls back to User for legacy invalid browser values", () => {
    expect(decodeStoredUserName(JSON.stringify({ version: 1, name: "Old User" }))).toBe("User");
  });
});
