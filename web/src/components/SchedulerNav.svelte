<script lang="ts">
  import "./SchedulerNav.css";

  import Icon from "./Icon.svelte";
  import StatusPresentation from "./StatusPresentation.svelte";
  import type { ShellResourceItem } from "./models";

  let { item, onSelect, onToast }: {
    item: ShellResourceItem | null;
    onSelect: (id: string) => Promise<void>;
    onToast: (message: string) => void;
  } = $props();

  async function activate(): Promise<void> {
    if (!item) return;
    try {
      await onSelect(item.id);
    } catch (reason) {
      onToast(reason instanceof Error ? reason.message : String(reason));
    }
  }
</script>

<section class="scheduler-nav" data-component-owner="scheduler-nav">
  <button type="button" class:active={item?.active} disabled={!item} title={item?.statusLabel || "Workspace Scheduler"} onclick={activate}>
    {#if item}<StatusPresentation status={item.status} />{/if}
    <Icon name="clock-3" className="scheduler-nav-icon" />
    <span><strong>Scheduler</strong><small>Natural-language schedules</small></span>
    <Icon name="chevron-right" className="scheduler-nav-chevron" />
  </button>
</section>
