<script lang="ts">
  import { onMount, tick } from "svelte";

  import type { AgentOption } from "../models/common";
  import type { ResourceAgentBindingModel, ResourceAgentProfileModel } from "../models/detail";
  import Icon from "./Icon.svelte";

  let {
    value,
    profiles,
    agents,
    disabled = false,
    ariaLabel = "Agent binding",
    onSelect,
  }: {
    value: ResourceAgentBindingModel;
    profiles: ResourceAgentProfileModel[];
    agents: AgentOption[];
    disabled?: boolean;
    ariaLabel?: string;
    onSelect: (value: ResourceAgentBindingModel) => void;
  } = $props();

  interface BindingOption {
    value: ResourceAgentBindingModel;
    label: string;
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
    const target = menu.querySelector<HTMLElement>('[aria-selected="true"]') ?? menu.querySelector<HTMLElement>(".agent-binding-option");
    void tick().then(() => target?.focus());
  });

  onMount(() => {
    const outside = (event: MouseEvent) => {
      if (open && event.target instanceof Node && !root?.contains(event.target)) open = false;
    };
    document.addEventListener("mousedown", outside);
    return () => document.removeEventListener("mousedown", outside);
  });

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
    }));
    if (value.kind === "profile" && !profiles.some((profile) => normalize(profile.key) === normalize(value.name))) {
      options.unshift({ value, label: `${value.name} (missing profile)` });
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
      };
    });
    if (value.kind === "agent" && !agents.some((agent) => normalize(agent.id) === normalize(value.name))) {
      options.unshift({ value, label: `${value.name} (missing agent)` });
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

<span class="agent-binding" bind:this={root}>
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
              <span class="agent-binding-option-label">{option.label}</span>
              {#if serialize(option.value) === selectedValue}<Icon name="check" className="agent-binding-check" />{/if}
            </button>
          {/each}
        </div>
      {/if}
      {#if agentOptions.length}
        <div class="agent-binding-group" role="group" aria-label="Agents">
          <div class="agent-binding-group-title">Agents</div>
          {#each agentOptions as option (serialize(option.value))}
            <button type="button" class="agent-binding-option" role="option" aria-selected={serialize(option.value) === selectedValue} data-binding={serialize(option.value)} onclick={() => choose(option)}>
              <span class="agent-binding-option-label">{option.label}</span>
              {#if serialize(option.value) === selectedValue}<Icon name="check" className="agent-binding-check" />{/if}
            </button>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</span>
