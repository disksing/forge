import { mount, unmount } from "svelte";

import "./app.css";

import PUAApp from "./PUAApp.svelte";
import FilePreviewFullscreen from "./components/FilePreviewFullscreen.svelte";
import { createPUAAppChannels } from "./app-channels";
import { startPUAApp, stopPUAApp, type PUAViewPublisher } from "./app-controller";

const channels = createPUAAppChannels();
const publisher: PUAViewPublisher = {
  renderAppShell: channels.appShell.publish,
  renderCreateDialog: channels.create.publish,
  renderSettings: channels.settings.publish,
  renderUploadDialog: channels.upload.publish,
  renderComposer: channels.composer.publish,
  renderEventTimeline: channels.timeline.publish,
  renderAgentPanelHeader: channels.agentHeader.publish,
  renderDetailPanel: channels.detail.publish,
  renderToast: channels.toast.publish,
};

let application: ReturnType<typeof mount> | null = null;

async function mountApplication(): Promise<void> {
  if (application) return;
  const target = document.getElementById("app");
  if (!target) throw new Error("PUA application root is unavailable.");
  if (window.location.pathname === "/file") {
    target.dataset.componentOwner = "file-preview-fullscreen";
    application = mount(FilePreviewFullscreen, { target });
    return;
  }
  target.dataset.componentOwner = "app-shell";
  application = mount(PUAApp, { target, props: { channels } });
  startPUAApp(publisher);
}

async function unmountApplication(): Promise<void> {
  stopPUAApp();
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

void mountApplication().catch((error) => console.error("Failed to start the PUA application", error));
