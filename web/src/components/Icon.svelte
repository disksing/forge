<script lang="ts">
  // Icon renders lucide icons as Svelte-owned SVG. The previous implementation
  // emitted an <i data-lucide> marker that the global lucide.createIcons pass
  // replaced with an <svg> via replaceChild; Svelte kept tracking the detached
  // marker, so re-rendered icons accumulated orphaned SVGs in the DOM. Resolving
  // the icon data here keeps the whole subtree under Svelte's control.
  //
  // Children are appended imperatively with createElementNS: <svelte:element>
  // inside a snippet is compiled in the HTML namespace, which browsers do not
  // render inside <svg>. Svelte owns the <svg> itself (including data-lucide and
  // class updates); only the icon glyph children are managed here.
  type IconNodeChild = [tag: string, attrs: Record<string, unknown>, children?: IconNodeChild[]];

  const SVG_NS = "http://www.w3.org/2000/svg";

  let { name, className = "" }: { name: string; className?: string } = $props();

  let svg = $state<SVGSVGElement>();

  function pascalCase(iconName: string): string {
    return iconName.split("-").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join("");
  }

  function buildNode([tag, attrs, nested]: IconNodeChild): SVGElement {
    const element = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs || {})) element.setAttribute(key, String(value));
    for (const child of nested || []) element.appendChild(buildNode(child));
    return element;
  }

  $effect(() => {
    if (!svg) return;
    const node = window.lucide?.icons?.[pascalCase(name)];
    const children = (node?.[2] as IconNodeChild[] | undefined) || [];
    svg.replaceChildren(...children.map(buildNode));
  });
</script>

<svg
  bind:this={svg}
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
></svg>
