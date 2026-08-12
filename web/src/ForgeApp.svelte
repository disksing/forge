<script lang="ts">
  import AppShell from "./components/AppShell.svelte";
  import ChatComposer from "./components/ChatComposer.svelte";
  import CreateDialog from "./components/CreateDialog.svelte";
  import DetailPanel from "./components/DetailPanel.svelte";
  import EventTimeline from "./components/EventTimeline.svelte";
  import SessionSwitcher from "./components/SessionSwitcher.svelte";
  import SettingsModal from "./components/SettingsModal.svelte";
  import Toast from "./components/Toast.svelte";
  import UploadDialog from "./components/UploadDialog.svelte";
  import type { ForgeAppChannels } from "./app-channels";

  let { channels }: { channels: ForgeAppChannels } = $props();
</script>

<AppShell channel={channels.appShell}>
  {#snippet details()}<DetailPanel channel={channels.detail} />{/snippet}
  {#snippet sessions()}<SessionSwitcher channel={channels.sessions} />{/snippet}
  {#snippet timeline()}<EventTimeline channel={channels.timeline} />{/snippet}
  {#snippet composer()}<ChatComposer channel={channels.composer} />{/snippet}
</AppShell>
<div data-component-owner="toast" style="display: contents"><Toast channel={channels.toast} /></div>
<div data-component-owner="upload-dialog" style="display: contents"><UploadDialog channel={channels.upload} /></div>
<div data-component-owner="create-dialog" style="display: contents"><CreateDialog channel={channels.create} /></div>
<div data-component-owner="settings" style="display: contents"><SettingsModal channel={channels.settings} /></div>
