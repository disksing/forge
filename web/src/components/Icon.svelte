<script lang="ts">
  let { name, className = "" }: { name: string; className?: string } = $props();
</script>

<i data-lucide={name} class={className}></i>
