<script lang="ts">
  let { version = "v0.1.0" }: { version?: string } = $props();
</script>

<span data-svelte-owned="brand-version">{version}</span>
