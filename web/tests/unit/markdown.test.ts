import { readFileSync } from "node:fs";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { handleMarkdownResourceClick, markdownHTML, markdownResourceNavigation } from "../../src/components/markdown";

function loadVendor<T>(relativePath: string, globalName: string): T {
  const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
  return new Function("window", "globalThis", `const module=undefined,exports=undefined,define=undefined;${source}\nreturn globalThis[${JSON.stringify(globalName)}];`)(window, window) as T;
}

function context(titles: Record<string, string> = { "project1.task2": "Second task" }) {
  return {
    workspaceId: "workspace-a",
    resolveResourceTitle: (resourceId: string) => titles[resourceId] || null,
  };
}

beforeEach(() => {
  window.marked = loadVendor<NonNullable<Window["marked"]>>("../../static/vendor/marked/marked.min.js", "marked");
  window.DOMPurify = loadVendor<NonNullable<Window["DOMPurify"]>>("../../static/vendor/dompurify/purify.min.js", "DOMPurify");
});

afterEach(() => {
  delete window.marked;
  delete window.DOMPurify;
  document.body.replaceChildren();
});

describe("Forge Markdown resource references", () => {
  it("renders known resources with their current title and route", () => {
    const container = document.createElement("div");
    container.innerHTML = markdownHTML("See [[project1.task2]] here.", context());

    const link = container.querySelector<HTMLAnchorElement>("a[data-forge-resource-id]");
    expect(link?.textContent).toBe("Second task");
    expect(link?.dataset.forgeResourceId).toBe("project1.task2");
    expect(link?.getAttribute("href")).toBe("/w/workspace-a/r/project1.task2");
  });

  it("leaves unknown, invalid, escaped, and code references literal", () => {
    const html = markdownHTML([
      "Unknown [[project1.task404]] and invalid [[not a resource]].",
      "Escaped \\[[project1.task2]].",
      "Inline `[[project1.task2]]`.",
      "```",
      "[[project1.task2]]",
      "```",
    ].join("\n\n"), context());
    const container = document.createElement("div");
    container.innerHTML = html;

    expect(container.querySelector("a[data-forge-resource-id]")).toBeNull();
    expect(container.textContent).toContain("[[project1.task404]]");
    expect(container.textContent).toContain("[[not a resource]]");
    expect(container.textContent).toContain("Escaped [[project1.task2]]");
    const code = [...container.querySelectorAll("code")].map((node) => node.textContent || "");
    expect(code).toContain("[[project1.task2]]");
    expect(container.querySelector("pre code")?.textContent).toContain("[[project1.task2]]");
  });

  it("keeps resource syntax literal inside Markdown link and image labels", () => {
    const container = document.createElement("div");
    container.innerHTML = markdownHTML([
      `[label [[project1.task2]]](https://example.com "closing ) title")`,
      "![alt [[project1.task2]]](image.png)",
    ].join("\n\n"), context());

    const links = container.querySelectorAll("a");
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute("href")).toBe("https://example.com");
    expect(links[0].getAttribute("title")).toBe("closing ) title");
    expect(links[0].textContent).toBe("label [[project1.task2]]");
    expect(links[0].hasAttribute("data-forge-resource-id")).toBe(false);
    expect(container.querySelector("img")?.getAttribute("alt")).toBe("alt [[project1.task2]]");
  });

  it("escapes resolved titles and sanitizes untrusted Markdown HTML", () => {
    const container = document.createElement("div");
    container.innerHTML = markdownHTML("[[project1.task2]]<script>alert(1)</script>", context({ "project1.task2": `<img src=x onerror=alert(1)>` }));

    expect(container.querySelector("script")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("a")?.textContent).toBe("<img src=x onerror=alert(1)>");
  });

  it("uses SPA navigation for a plain click and preserves modified clicks", () => {
    const container = document.body.appendChild(document.createElement("div"));
    container.innerHTML = markdownHTML("[[project1.task2]]", context());
    const onNavigate = vi.fn();
    const navigation = { resolveResourceTitle: context().resolveResourceTitle, onNavigate };
    const action = markdownResourceNavigation(container, navigation);
    const link = container.querySelector("a")!;

    const plainClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    expect(link.dispatchEvent(plainClick)).toBe(false);
    expect(onNavigate).toHaveBeenCalledWith("project1.task2");

    const modifiedClick = new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true });
    Object.defineProperties(modifiedClick, { target: { value: link }, currentTarget: { value: container } });
    handleMarkdownResourceClick(modifiedClick, navigation);
    expect(modifiedClick.defaultPrevented).toBe(false);
    expect(onNavigate).toHaveBeenCalledTimes(1);

    (link as HTMLElement).dataset.forgeResourceId = "project1.task404";
    const tamperedClick = new MouseEvent("click", { bubbles: true, cancelable: true });
    Object.defineProperties(tamperedClick, { target: { value: link }, currentTarget: { value: container } });
    handleMarkdownResourceClick(tamperedClick, navigation);
    expect(tamperedClick.defaultPrevented).toBe(false);
    expect(onNavigate).toHaveBeenCalledTimes(1);
    action.destroy();
  });
});
