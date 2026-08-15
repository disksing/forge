<script lang="ts">
  import { onMount, tick } from "svelte";

  import "./AgentBindingSelector.css";

  import type { AgentOption } from "../models/common";
  import type { ResourceAgentBindingModel, ResourceAgentProfileModel } from "../models/detail";
  import Icon from "./Icon.svelte";

  let {
    value,
    profiles,
    agents,
    disabled = false,
    ariaLabel = "Agent binding",
    openUp = true,
    onSelect,
  }: {
    value: ResourceAgentBindingModel;
    profiles: ResourceAgentProfileModel[];
    agents: AgentOption[];
    disabled?: boolean;
    ariaLabel?: string;
    // The composer sits at the bottom of the viewport, so by default the menu
    // opens upward. Settings panels pass openUp=false to open downward.
    openUp?: boolean;
    onSelect: (value: ResourceAgentBindingModel) => void;
  } = $props();

  interface BindingOption {
    value: ResourceAgentBindingModel;
    label: string;
    primary: string;
    secondary: string;
  }

  const profileOptions = $derived(profileSelections());
  const agentOptions = $derived(agentSelections());
  const selectedValue = $derived(serialize(value));
  const selectedLabel = $derived(
    [...profileOptions, ...agentOptions].find((option) => serialize(option.value) === selectedValue)?.label || value.name || "Unavailable"
  );

  // The composer sits at the bottom of the viewport, where a native select
  // popup anchors on the selected option and clips everything below it. Use a
  // custom menu that opens upward with its own scrolling instead.
  let open = $state(false);
  let root: HTMLSpanElement | undefined = $state();
  let menu: HTMLDivElement | undefined = $state();

  $effect(() => {
    if (!open || !menu) return;
    // Subscribe to the option lists so column widths are re-measured when the
    // profile or agent data changes while the menu is open (e.g. a settings
    // refresh adds a longer name); stale fixed columns would truncate it.
    void profileOptions;
    void agentOptions;
    fitMenuToViewport();
    alignOptionColumns();
    const target = menu.querySelector<HTMLElement>('[aria-selected="true"]') ?? menu.querySelector<HTMLElement>(".agent-binding-option");
    void tick().then(() => target?.focus());
  });

  onMount(() => {
    const outside = (event: MouseEvent) => {
      if (open && event.target instanceof Node && !root?.contains(event.target)) open = false;
    };
    const onResize = () => {
      if (open) fitMenuToViewport();
    };
    document.addEventListener("mousedown", outside);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", outside);
      window.removeEventListener("resize", onResize);
    };
  });

  // Size the menu against the free space on its opening side: upward menus
  // (composer at the bottom of the viewport) measure the distance to the top,
  // downward menus (settings panel) measure the distance to the bottom, minus
  // a small margin. Grow the menu up to that space instead of a fixed cap so
  // long agent lists stay visible instead of being clipped into a small
  // scroll area.
  function fitMenuToViewport(): void {
    if (!root || !menu) return;
    const rect = root.getBoundingClientRect();
    const available = openUp ? rect.top - 14 : window.innerHeight - rect.bottom - 14;
    menu.style.maxHeight = `${Math.max(120, Math.floor(available))}px`;
  }

  // Size the menu as a two-column table: every primary label shares the width
  // of the longest one and every secondary the width of the longest one, so
  // the gap between the columns is uniform instead of varying per row.
  // scrollWidth rounds to whole pixels and can round down (124.328px -> 124),
  // which visibly truncates the longest label, so measure with fractional
  // getBoundingClientRect widths instead. Clear the pinned widths first so a
  // re-measure sees natural, unclipped widths even while the menu stays open.
  function alignOptionColumns(): void {
    if (!menu) return;
    menu.style.removeProperty("--binding-primary-width");
    menu.style.removeProperty("--binding-secondary-width");
    let primary = 0;
    let secondary = 0;
    menu.querySelectorAll<HTMLElement>(".agent-binding-option-primary").forEach((el) => {
      primary = Math.max(primary, el.getBoundingClientRect().width);
    });
    menu.querySelectorAll<HTMLElement>(".agent-binding-option-secondary").forEach((el) => {
      secondary = Math.max(secondary, el.getBoundingClientRect().width);
    });
    if (primary > 0) menu.style.setProperty("--binding-primary-width", `${Math.ceil(primary)}px`);
    if (secondary > 0) menu.style.setProperty("--binding-secondary-width", `${Math.ceil(secondary)}px`);
  }

  function normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  function agentLabel(name: string): string {
    const match = agents.find((agent) => normalize(agent.id) === normalize(name));
    return match?.label || name || "Unavailable";
  }

  function profileSelections(): BindingOption[] {
    const options = profiles.map((profile) => ({
      value: { kind: "profile", name: profile.key } as ResourceAgentBindingModel,
      label: `${profile.key} (current: ${agentLabel(profile.agentName || "")})`,
      primary: profile.key,
      secondary: agentLabel(profile.agentName || ""),
    }));
    if (value.kind === "profile" && !profiles.some((profile) => normalize(profile.key) === normalize(value.name))) {
      options.unshift({ value, label: `${value.name} (missing profile)`, primary: value.name, secondary: "missing profile" });
    }
    return options;
  }

  function agentSelections(): BindingOption[] {
    const options = agents.map((agent) => {
      const routes = profiles
        .filter((profile) => normalize(profile.agentName || "") === normalize(agent.id))
        .map((profile) => profile.key);
      return {
        value: { kind: "agent", name: agent.id } as ResourceAgentBindingModel,
        label: routes.length ? `${agent.label} (${routes.join(", ")})` : agent.label,
        primary: agent.label,
        secondary: routes.join(", "),
      };
    });
    if (value.kind === "agent" && !agents.some((agent) => normalize(agent.id) === normalize(value.name))) {
      options.unshift({ value, label: `${value.name} (missing agent)`, primary: value.name, secondary: "missing agent" });
    }
    return options;
  }

  function serialize(binding: ResourceAgentBindingModel): string {
    return `${binding.kind}:${encodeURIComponent(binding.name)}`;
  }

  function choose(option: BindingOption): void {
    open = false;
    if (serialize(option.value) === selectedValue) return;
    onSelect(option.value);
  }

  function keydown(event: KeyboardEvent): void {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    open = false;
  }
</script>

<span class="agent-binding" data-component-owner="agent-binding-selector" data-placement={openUp ? "up" : "down"} bind:this={root}>
  <button type="button" class="agent-binding-button" {disabled} aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onclick={() => { open = !open; }}>
    <span class="agent-binding-label">{selectedLabel}</span>
    <Icon name="chevrons-up-down" className="agent-binding-icon" />
  </button>
  {#if open}
    <div class="agent-binding-menu" role="listbox" aria-label={ariaLabel} tabindex="-1" bind:this={menu} onkeydown={keydown}>
      {#if profileOptions.length}
        <div class="agent-binding-group" role="group" aria-label="Profiles">
          <div class="agent-binding-group-title">Profiles</div>
          {#each profileOptions as option (serialize(option.value))}
            <button type="button" class="agent-binding-option" role="option" aria-selected={serialize(option.value) === selectedValue} data-binding={serialize(option.value)} onclick={() => choose(option)}>
              <span class="agent-binding-option-primary">{option.primary}</span>
              <span class="agent-binding-option-secondary">{option.secondary}</span>
              <Icon name="check" className={serialize(option.value) === selectedValue ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden"} />
            </button>
          {/each}
        </div>
      {/if}
      {#if agentOptions.length}
        {#if profileOptions.length}<div class="agent-binding-divider"></div>{/if}
        <div class="agent-binding-group" role="group" aria-label="Agents">
          <div class="agent-binding-group-title">Agents</div>
          {#each agentOptions as option (serialize(option.value))}
            <button type="button" class="agent-binding-option" role="option" aria-selected={serialize(option.value) === selectedValue} data-binding={serialize(option.value)} onclick={() => choose(option)}>
              <span class="agent-binding-option-primary">{option.primary}</span>
              <span class="agent-binding-option-secondary">{option.secondary}</span>
              <Icon name="check" className={serialize(option.value) === selectedValue ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden"} />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</span>
