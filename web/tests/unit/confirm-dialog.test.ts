import { mount, unmount } from "svelte";
import { afterEach, describe, expect, it, vi } from "vitest";

import ConfirmDialog from "../../src/components/ConfirmDialog.svelte";
import { createConfirmDialogController } from "../../src/controllers/confirm-dialog-controller";

const cleanups: Array<() => Promise<void>> = [];
afterEach(async () => {
  while (cleanups.length) await cleanups.pop()?.();
  document.body.replaceChildren();
});

describe("confirm dialog controller", () => {
  it("publishes an open model and resolves true when confirmed", async () => {
    const controller = createConfirmDialogController();
    const pending = controller.confirm({ title: "Delete artifact", message: "Delete it?", confirmLabel: "Delete", danger: true });
    const model = controller.channel.current();
    expect(model.open).toBe(true);
    expect(model.title).toBe("Delete artifact");
    expect(model.message).toBe("Delete it?");
    expect(model.confirmLabel).toBe("Delete");
    expect(model.cancelLabel).toBe("Cancel");
    expect(model.danger).toBe(true);
    model.onResult(true);
    await expect(pending).resolves.toBe(true);
    expect(controller.channel.current().open).toBe(false);
  });

  it("resolves false when cancelled and applies default labels", async () => {
    const controller = createConfirmDialogController();
    const pending = controller.confirm({ message: "Continue?" });
    const model = controller.channel.current();
    expect(model.title).toBe("Please confirm");
    expect(model.confirmLabel).toBe("Confirm");
    expect(model.danger).toBe(false);
    model.onResult(false);
    await expect(pending).resolves.toBe(false);
  });

  it("cancels a previous pending confirmation when a new one opens", async () => {
    const controller = createConfirmDialogController();
    const first = controller.confirm({ message: "First?" });
    const second = controller.confirm({ message: "Second?" });
    await expect(first).resolves.toBe(false);
    expect(controller.channel.current().message).toBe("Second?");
    controller.channel.current().onResult(true);
    await expect(second).resolves.toBe(true);
  });
});

describe("ConfirmDialog", () => {
  function mountDialog() {
    const controller = createConfirmDialogController();
    const target = document.body.appendChild(document.createElement("div"));
    const owner = document.createElement("div");
    owner.dataset.componentOwner = "confirm-dialog";
    document.body.appendChild(owner).appendChild(target);
    const component = mount(ConfirmDialog, { target, props: { channel: controller.channel } });
    cleanups.push(() => unmount(component));
    return controller;
  }

  it("renders the dialog when open and confirms via the confirm button", async () => {
    const controller = mountDialog();
    expect(document.querySelector(".confirm-dialog")).toBeNull();
    const pending = controller.confirm({ title: "Remove schedule", message: "Remove schedule s1?", confirmLabel: "Remove", danger: true });
    await vi.waitFor(() => expect(document.querySelector(".confirm-dialog")).not.toBeNull());
    expect(document.querySelector(".confirm-dialog-header strong")?.textContent).toBe("Remove schedule");
    expect(document.querySelector(".confirm-dialog-content p")?.textContent).toBe("Remove schedule s1?");
    const confirm = document.querySelector<HTMLButtonElement>(".confirm-dialog-footer .primary-button");
    expect(confirm?.textContent).toBe("Remove");
    expect(confirm?.classList.contains("danger-button")).toBe(true);
    confirm?.click();
    await expect(pending).resolves.toBe(true);
    await vi.waitFor(() => expect(document.querySelector(".confirm-dialog")).toBeNull());
  });

  it("cancels via the cancel button, the backdrop and the Escape key", async () => {
    const controller = mountDialog();
    const first = controller.confirm({ message: "One?" });
    await vi.waitFor(() => expect(document.querySelector(".confirm-dialog")).not.toBeNull());
    document.querySelector<HTMLButtonElement>(".confirm-dialog-footer .secondary-button")?.click();
    await expect(first).resolves.toBe(false);

    const second = controller.confirm({ message: "Two?" });
    await vi.waitFor(() => expect(document.querySelector(".confirm-dialog")).not.toBeNull());
    document.querySelector<HTMLButtonElement>(".confirm-dialog-backdrop")?.click();
    await expect(second).resolves.toBe(false);

    const third = controller.confirm({ message: "Three?" });
    await vi.waitFor(() => expect(document.querySelector(".confirm-dialog")).not.toBeNull());
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await expect(third).resolves.toBe(false);
  });

  it("confirms via the Enter key", async () => {
    const controller = mountDialog();
    const pending = controller.confirm({ message: "Enter?" });
    await vi.waitFor(() => expect(document.querySelector(".confirm-dialog")).not.toBeNull());
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }));
    await expect(pending).resolves.toBe(true);
  });
});
