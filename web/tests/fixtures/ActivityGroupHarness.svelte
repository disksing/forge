<script lang="ts">
  import ActivityGroup from "../../src/components/ActivityGroup.svelte";
  import type { TimelineItem } from "../../src/components/models";

  let { item, onExpand = () => {} }: { item: TimelineItem; onExpand?: () => void } = $props();
  // svelte-ignore state_referenced_locally
  let current = $state<TimelineItem>(item);

  export function replaceItem(next: TimelineItem): void {
    current = next;
  }
</script>

<ActivityGroup item={current} {onExpand} />
