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
    allowInherit = false,
    inheritLabel = "Inherit",
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
    // Project Task defaults can inherit the Workspace default; an empty
    // binding name means "inherit" and adds the pseudo option to the menu.
    allowInherit?: boolean;
    inheritLabel?: string;
    onSelect: (value: ResourceAgentBindingModel) => void;
  } = $props();

  interface BindingOption {
    value: ResourceAgentBindingModel;
    label: string;
    primary: string;
    secondary: string;
  }

  interface MenuOption extends BindingOption {
    key: string;
  }

  const profileOptions = $derived(profileSelections());
  const agentOptions = $derived(agentSelections());
  const inheritSelected = $derived(allowInherit && !value.name);
  const selectedValue = $derived(inheritSelected ? "inherit" : serialize(value));
  const selectedLabel = $derived(
    inheritSelected ? inheritLabel : [...profileOptions, ...agentOptions].find((option) => serialize(option.value) === selectedValue)?.label || value.name || "Unavailable"
  );
  const menuOptions = $derived(buildMenuOptions());

  // The composer sits at the bottom of the viewport, where a native select
  // popup anchors on the selected option and clips everything below it. Use a
  // custom menu that opens upward with its own scrolling instead.
  let open = $state(false);
  let root: HTMLSpanElement | undefined = $state();
  let menu: HTMLDivElement | undefined = $state();
  let button: HTMLButtonElement | undefined = $state();
  let activeKey = $state("");
  let placementUp = $state(true);

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
      if (open && event.target instanceof Node && !root?.contains(event.target)) closeMenu();
    };
    const onResize = () => {
      if (open) fitMenuToViewport();
    };
    // The menu is position:fixed to escape clipping ancestors, so it no
    // longer follows the button automatically when a scroll container moves
    // it. Reposition on any scroll (capture phase catches nested scrollers
    // like the detail panel) instead of closing the menu mid-interaction.
    const onScroll = () => {
      if (open) fitMenuToViewport();
    };
    document.addEventListener("mousedown", outside);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      document.removeEventListener("mousedown", outside);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  });

  // The menu is position:fixed because absolutely positioned menus get
  // clipped by ancestors with overflow:hidden (e.g. the settings list card)
  // or overflow:auto (the detail panel scroll container), leaving only a
  // slice of the options visible and unreachable. Anchor the fixed menu to
  // the button rect and cap its height against the free space on the opening
  // side: upward menus (composer at the bottom of the viewport) measure the
  // distance to the top, downward menus (settings panel) measure the
  // distance to the bottom, minus a small margin. Grow the menu up to that
  // space instead of a fixed cap so long agent lists stay visible instead of
  // being clipped into a small scroll area. If the preferred direction would
  // cover another binding trigger, use the other side so a visible selector
  // remains the topmost click target.
  function fitMenuToViewport(): void {
    if (!root || !menu) return;
    const rect = root.getBoundingClientRect();
    // Keep the menu's right edge aligned with the button, at least 12px from
    // the viewport edge; max-width in CSS keeps the left edge on screen. Pin
    // the minimum width to the button so narrow content never collapses the
    // menu below the control that opened it (percentage min-width no longer
    // works now that the containing block is the viewport).
    menu.style.right = `${Math.max(12, Math.floor(window.innerWidth - rect.right))}px`;
    menu.style.minWidth = `${Math.ceil(rect.width)}px`;

    const directions = [placementUp, !placementUp];
    for (const opensUp of directions) {
      const available = opensUp ? rect.top - 14 : window.innerHeight - rect.bottom - 14;
      menu.style.maxHeight = `${Math.max(120, Math.floor(available))}px`;
      if (opensUp) {
        menu.style.top = "auto";
        menu.style.bottom = `${Math.floor(window.innerHeight - rect.top) + 6}px`;
      } else {
        menu.style.bottom = "auto";
        menu.style.top = `${Math.floor(rect.bottom) + 6}px`;
      }

      if (!overlapsBindingTrigger(menu.getBoundingClientRect())) {
        placementUp = opensUp;
        return;
      }
    }

    // If both sides are crowded, keep the requested/current side and let the
    // menu scroll within its measured viewport space. Pointer routing below
    // still prevents a covered selector from committing this menu's option.
    const available = placementUp ? rect.top - 14 : window.innerHeight - rect.bottom - 14;
    menu.style.maxHeight = `${Math.max(120, Math.floor(available))}px`;
    if (placementUp) {
      menu.style.top = "auto";
      menu.style.bottom = `${Math.floor(window.innerHeight - rect.top) + 6}px`;
    } else {
      menu.style.bottom = "auto";
      menu.style.top = `${Math.floor(rect.bottom) + 6}px`;
    }
  }

  function overlapsBindingTrigger(menuRect: DOMRect): boolean {
    const buttons = document.querySelectorAll<HTMLElement>('[data-component-owner="agent-binding-selector"] .agent-binding-button');
    return Array.from(buttons).some((candidate) => {
      if (candidate === button) return false;
      const rect = candidate.getBoundingClientRect();
      return menuRect.left < rect.right && menuRect.right > rect.left && menuRect.top < rect.bottom && menuRect.bottom > rect.top;
    });
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
    if (value.name && value.kind === "profile" && !profiles.some((profile) => normalize(profile.key) === normalize(value.name))) {
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
    if (value.name && value.kind === "agent" && !agents.some((agent) => normalize(agent.id) === normalize(value.name))) {
      options.unshift({ value, label: `${value.name} (missing agent)`, primary: value.name, secondary: "missing agent" });
    }
    return options;
  }

  function serialize(binding: ResourceAgentBindingModel): string {
    return `${binding.kind}:${encodeURIComponent(binding.name)}`;
  }

  function buildMenuOptions(): MenuOption[] {
    const options: MenuOption[] = [];
    if (allowInherit) {
      options.push({ key: "inherit", value: { kind: "profile", name: "" }, label: inheritLabel, primary: inheritLabel, secondary: "" });
    }
    for (const option of profileOptions) options.push({ key: serialize(option.value), ...option });
    for (const option of agentOptions) options.push({ key: serialize(option.value), ...option });
    return options;
  }

  function closeMenu(): void {
    open = false;
    button?.focus();
  }

  function choose(option: BindingOption): void {
    closeMenu();
    const optionKey = allowInherit && !option.value.name ? "inherit" : serialize(option.value);
    if (optionKey === selectedValue) return;
    onSelect(option.value);
  }

  // A fixed menu can still be painted over another selector when both sides
  // are crowded. Inspect the element below a pointer click after temporarily
  // making the menu hit-transparent; forward that click to the covered
  // binding trigger instead of committing whichever option happened to be on
  // top. Other controls remain owned by the open menu while it is visible.
  function underlyingInteractiveTarget(event: MouseEvent): HTMLElement | null {
    if (event.detail === 0 || !menu || typeof document.elementFromPoint !== "function") return null;
    const previousPointerEvents = menu.style.pointerEvents;
    menu.style.pointerEvents = "none";
    let element: Element | null = null;
    try {
      element = document.elementFromPoint(event.clientX, event.clientY);
    } finally {
      menu.style.pointerEvents = previousPointerEvents;
    }
    if (!(element instanceof Element) || root?.contains(element)) return null;
    const target = element.closest('[data-component-owner="agent-binding-selector"] .agent-binding-button');
    return target instanceof HTMLElement && target !== button ? target : null;
  }

  function selectOption(event: MouseEvent, option: BindingOption): void {
    const target = underlyingInteractiveTarget(event);
    if (target) {
      event.preventDefault();
      event.stopPropagation();
      closeMenu();
      target.click();
      target.focus();
      return;
    }
    choose(option);
  }

  function optionElements(): HTMLButtonElement[] {
    return Array.from(menu?.querySelectorAll<HTMLButtonElement>('[role="option"]:not([disabled])') ?? []);
  }

  function commitOption(key: string): void {
    const option = menuOptions.find((candidate) => candidate.key === key);
    if (option) choose(option);
  }

  function keydown(event: KeyboardEvent): void {
    const options = optionElements();
    if (!options.length) return;
    let index = options.findIndex((el) => el.dataset.binding === activeKey);
    if (index < 0) index = options.findIndex((el) => el.dataset.binding === selectedValue);
    if (index < 0) index = 0;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        index = (index + 1) % options.length;
        break;
      case "ArrowUp":
        event.preventDefault();
        index = (index - 1 + options.length) % options.length;
        break;
      case "Home":
        event.preventDefault();
        index = 0;
        break;
      case "End":
        event.preventDefault();
        index = options.length - 1;
        break;
      case "Enter":
      case " ": {
        event.preventDefault();
        event.stopPropagation();
        const key = options[index]?.dataset.binding;
        if (key !== undefined) commitOption(key);
        return;
      }
      case "Escape":
        event.preventDefault();
        event.stopPropagation();
        closeMenu();
        return;
      default:
        return;
    }
    event.stopPropagation();
    const option = options[index];
    if (option) {
      activeKey = option.dataset.binding ?? selectedValue;
      option.focus();
    }
  }
</script>

<span class="agent-binding" data-component-owner="agent-binding-selector" data-placement={placementUp ? "up" : "down"} bind:this={root}>
  <button type="button" class="agent-binding-button" bind:this={button} {disabled} aria-haspopup="listbox" aria-expanded={open} aria-label={ariaLabel} onclick={() => { if (open) closeMenu(); else { placementUp = openUp; open = true; activeKey = selectedValue; } }}>
    <span class="agent-binding-label">{selectedLabel}</span>
    <Icon name="chevrons-up-down" className="agent-binding-icon" />
  </button>
  {#if open}
    <div class="agent-binding-menu" role="listbox" aria-label={ariaLabel} tabindex="-1" bind:this={menu} onkeydown={keydown}>
      {#if allowInherit}
        <div class="agent-binding-group" role="group" aria-label="Inherit">
          <button type="button" class="agent-binding-option" role="option" aria-selected={activeKey === "inherit"} tabindex={activeKey === "inherit" ? 0 : -1} data-binding="inherit" onclick={(event) => selectOption(event, { value: { kind: "profile", name: "" }, label: inheritLabel, primary: inheritLabel, secondary: "" })}>
            <span class="agent-binding-option-primary">{inheritLabel}</span>
            <span class="agent-binding-option-secondary"></span>
            <Icon name="check" className={activeKey === "inherit" ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden"} />
          </button>
        </div>
        {#if profileOptions.length || agentOptions.length}<div class="agent-binding-divider"></div>{/if}
      {/if}
      {#if profileOptions.length}
        <div class="agent-binding-group" role="group" aria-label="Profiles">
          <div class="agent-binding-group-title">Profiles</div>
          {#each profileOptions as option (serialize(option.value))}
            <button type="button" class="agent-binding-option" role="option" aria-selected={serialize(option.value) === activeKey} tabindex={serialize(option.value) === activeKey ? 0 : -1} data-binding={serialize(option.value)} onclick={(event) => selectOption(event, option)}>
              <span class="agent-binding-option-primary">{option.primary}</span>
              <span class="agent-binding-option-secondary">{option.secondary}</span>
              <Icon name="check" className={serialize(option.value) === activeKey ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden"} />
            </button>
          {/each}
        </div>
      {/if}
      {#if agentOptions.length}
        {#if profileOptions.length}<div class="agent-binding-divider"></div>{/if}
        <div class="agent-binding-group" role="group" aria-label="Agents">
          <div class="agent-binding-group-title">Agents</div>
          {#each agentOptions as option (serialize(option.value))}
            <button type="button" class="agent-binding-option" role="option" aria-selected={serialize(option.value) === activeKey} tabindex={serialize(option.value) === activeKey ? 0 : -1} data-binding={serialize(option.value)} onclick={(event) => selectOption(event, option)}>
              <span class="agent-binding-option-primary">{option.primary}</span>
              <span class="agent-binding-option-secondary">{option.secondary}</span>
              <Icon name="check" className={serialize(option.value) === activeKey ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden"} />
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</span>
