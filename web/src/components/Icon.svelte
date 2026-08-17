<script lang="ts">
  // Icon renders lucide icons as Svelte-owned SVG. The previous implementation
  // emitted an <i data-lucide> marker that the global lucide.createIcons pass
  // replaced with an <svg> via replaceChild; Svelte kept tracking the detached
  // marker, so re-rendered icons accumulated orphaned SVGs in the DOM. Resolving
  // the icon data here keeps the whole subtree under Svelte's control.
  type IconNodeChild = [tag: string, attrs: Record<string, unknown>, children?: IconNodeChild[]];

  let { name, className = "" }: { name: string; className?: string } = $props();

  function pascalCase(iconName: string): string {
    return iconName.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  const children = $derived.by((): IconNodeChild[] => {
    const node = window.lucide?.icons?.[pascalCase(name)];
    return (node?.[2] as IconNodeChild[] | undefined) || [];
  });
</script>

{#snippet renderNode([tag, attrs, nested]: IconNodeChild)}
  <svelte:element this={tag} {...attrs}>{#each nested || [] as child}{@render renderNode(child)}{/each}</svelte:element>
{/snippet}

<svg
  xmlns="http://www.w3.org/2000/svg"
  width="24"
  height="24"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  data-lucide={name}
  class={`lucide lucide-${name}${className ? ` ${className}` : ""}`}
  aria-hidden="true"
>{#each children as child}{@render renderNode(child)}{/each}</svg>
