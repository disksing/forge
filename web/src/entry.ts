import { mount, unmount } from "svelte";

import "./app.css";

import ForgeApp from "./ForgeApp.svelte";
import { createForgeAppChannels } from "./app-channels";
import { startForgeApp, stopForgeApp, type ForgeViewPublisher } from "./app-controller";

const channels = createForgeAppChannels();
const publisher: ForgeViewPublisher = {
  renderAppShell: channels.appShell.publish,
  renderCreateDialog: channels.create.publish,
  renderSettings: channels.settings.publish,
  renderUploadDialog: channels.upload.publish,
  renderComposer: channels.composer.publish,
  renderEventTimeline: channels.timeline.publish,
  renderDetailPanel: channels.detail.publish,
  renderToast: channels.toast.publish,
};

let application: ReturnType<typeof mount> | null = null;

async function mountApplication(): Promise<void> {
  if (application) return;
  const target = document.getElementById("app");
  if (!target) throw new Error("Forge application root is unavailable.");
  target.dataset.componentOwner = "app-shell";
  application = mount(ForgeApp, { target, props: { channels } });
  startForgeApp(publisher);
}

async function unmountApplication(): Promise<void> {
  stopForgeApp();
  if (!application) return;
  const mounted = application;
  application = null;
  await unmount(mounted);
  document.getElementById("app")?.removeAttribute("data-component-owner");
}

window.addEventListener("pagehide", () => void unmountApplication());
window.addEventListener("pageshow", (event) => {
  if (event.persisted) void mountApplication();
});

void mountApplication().catch((error) => console.error("Failed to start the Forge application", error));
