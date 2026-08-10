<script lang="ts">
  import "./Toast.css";

  import { onMount } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import type { ToastModel } from "./models";

  let { channel }: { channel: ModelChannel<ToastModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let visible = $state(false);
  let timer: number | null = null;

  onMount(() => {
    const unsubscribe = channel.subscribe((next) => {
      model = next;
      visible = Boolean(next.message);
      if (timer !== null) window.clearTimeout(timer);
      if (visible) timer = window.setTimeout(() => {
        visible = false;
        timer = null;
      }, 2800);
    });
    return () => {
      unsubscribe();
      if (timer !== null) window.clearTimeout(timer);
    };
  });
</script>

<div id="toast" class="toast" role="status" aria-live="polite" hidden={!visible}>{model.message}</div>
