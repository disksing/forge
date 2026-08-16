import { describe, expect, it } from "vitest";

import { decodeStoredUserName, sanitizeUserNameInput, validateUserName } from "../../src/controllers/user-settings-controller";

describe("user settings validation", () => {
  it("keeps only filesystem-safe identifier characters in the input", () => {
    expect(sanitizeUserNameInput("Alice 张/.._2-test")).toBe("Alice_2-test");
  });

  it("rejects empty and non-identifier names", () => {
    expect(() => validateUserName("")).toThrow("required");
    expect(() => validateUserName("two words")).toThrow("only letters");
    expect(() => validateUserName("name.dot")).toThrow("only letters");
    expect(validateUserName("User_2-test")).toBe("User_2-test");
  });

  it("falls back to User for legacy invalid browser values", () => {
    expect(decodeStoredUserName(JSON.stringify({ version: 1, name: "Old User" }))).toBe("User");
  });
});
