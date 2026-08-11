<script lang="ts">
  import "./LayoutSwitcher.css";

  import Icon from "./Icon.svelte";

  type LayoutPreference = "auto" | "three" | "two" | "split";

  let { preference, tone = "light", onCycle }: {
    preference: LayoutPreference;
    tone?: "light" | "dark";
    onCycle: () => void;
  } = $props();

  const icons: Record<LayoutPreference, string> = {
    auto: "layout-grid",
    three: "columns-3",
    two: "columns-2",
    split: "panel-left-close",
  };
  const labels: Record<LayoutPreference, string> = {
    auto: "Auto (follows window width)",
    three: "Three columns",
    two: "Two columns with tabs",
    split: "Two columns, sidebar collapsed",
  };
</script>

<button type="button" class={`layout-switcher ${tone}`} data-component-owner="layout-switcher" title={`Layout: ${labels[preference]}`} aria-label={`Switch layout (current: ${labels[preference]})`} onclick={onCycle}><Icon name={icons[preference]} /></button>
