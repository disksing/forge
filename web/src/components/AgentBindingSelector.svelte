<script lang="ts">
  import type { AgentOption } from "../models/common";
  import type { ResourceAgentBindingModel, ResourceAgentProfileModel } from "../models/detail";

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

  const profileOptions = $derived(profileSelections());
  const agentOptions = $derived(agentSelections());
  const selectedValue = $derived(serialize(value));

  function normalize(value: string): string {
    return value.trim().toLowerCase();
  }

  function agentLabel(name: string): string {
    const match = agents.find((agent) => normalize(agent.id) === normalize(name));
    return match?.label || name || "Unavailable";
  }

  function profileSelections(): Array<{ value: ResourceAgentBindingModel; label: string }> {
    const options = profiles.map((profile) => ({
      value: { kind: "profile", name: profile.key } as ResourceAgentBindingModel,
      label: `${profile.key} (current: ${agentLabel(profile.agentName || "")})`,
    }));
    if (value.kind === "profile" && !profiles.some((profile) => normalize(profile.key) === normalize(value.name))) {
      options.unshift({ value, label: `${value.name} (missing profile)` });
    }
    return options;
  }

  function agentSelections(): Array<{ value: ResourceAgentBindingModel; label: string }> {
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

  function select(event: Event): void {
    const element = event.currentTarget as HTMLSelectElement;
    const raw = element.value;
    // The binding save is asynchronous and may fail; keep the control
    // controlled by snapping back to the persisted value until the parent
    // publishes the updated binding.
    element.value = selectedValue;
    const separator = raw.indexOf(":");
    if (separator < 0) return;
    const kind = raw.slice(0, separator);
    if (kind !== "profile" && kind !== "agent") return;
    const binding = { kind, name: decodeURIComponent(raw.slice(separator + 1)) } as ResourceAgentBindingModel;
    if (serialize(binding) === selectedValue) return;
    onSelect(binding);
  }
</script>

<select {disabled} aria-label={ariaLabel} value={selectedValue} onchange={select}>
  {#if profileOptions.length}
    <optgroup label="Profiles">
      {#each profileOptions as option (serialize(option.value))}<option value={serialize(option.value)}>{option.label}</option>{/each}
    </optgroup>
  {/if}
  {#if agentOptions.length}
    <optgroup label="Agents">
      {#each agentOptions as option (serialize(option.value))}<option value={serialize(option.value)}>{option.label}</option>{/each}
    </optgroup>
  {/if}
</select>
