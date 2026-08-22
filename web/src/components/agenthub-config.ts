import type { AgentHubConfigAgent, AgentHubConfigProvider } from "./models";

export interface AgentHubOptionField {
  key: string;
  label: string;
  kind: "text" | "select";
  options?: string[];
}

export interface AgentHubConfigError {
  index: number;
  field: string;
  message: string;
}

const providerFields: Record<string, AgentHubOptionField[]> = {
  codex: [
    { key: "model", label: "Model", kind: "text" },
    { key: "sandbox", label: "Sandbox", kind: "select", options: ["read-only", "workspace-write", "danger-full-access"] },
    { key: "approval", label: "Approval", kind: "select", options: ["untrusted", "on-failure", "on-request", "never"] },
    { key: "reasoning_effort", label: "Reasoning effort", kind: "select", options: ["low", "medium", "high", "xhigh", "max", "ultra"] },
  ],
  kimi: [
    { key: "model", label: "Model", kind: "text" },
    { key: "mode", label: "Mode", kind: "select", options: ["build", "plan"] },
  ],
  opencode: [
    { key: "model", label: "Model", kind: "text" },
    { key: "mode", label: "Mode", kind: "select", options: ["build", "plan"] },
  ],
  pi: [{ key: "model", label: "Model", kind: "text" }],
};

export function providerOptionFields(type: string): AgentHubOptionField[] {
  return providerFields[String(type || "").trim().toLowerCase()] || [];
}

export function cloneAgentHubProvider(provider: AgentHubConfigProvider): AgentHubConfigProvider {
  return { ...provider };
}

export function cloneAgentHubAgent(agent: AgentHubConfigAgent): AgentHubConfigAgent {
  return {
    ...agent,
    options: agent.options ? { ...agent.options } : undefined,
    environment: agent.environment ? { ...agent.environment } : undefined,
  };
}

export function normalizeAgentOptions(type: string, options: Record<string, string> | undefined): Record<string, string> | undefined {
  const fields = providerOptionFields(type);
  if (!fields.length) {
    const copied = Object.fromEntries(Object.entries(options || {}).filter(([key, value]) => String(key).trim() && String(value).trim()).map(([key, value]) => [String(key).trim(), String(value).trim()]));
    return Object.keys(copied).length ? copied : undefined;
  }
  const allowed = new Map(fields.map((field) => [field.key, field]));
  const normalized: Record<string, string> = {};
  for (const [rawKey, rawValue] of Object.entries(options || {})) {
    const key = String(rawKey).trim();
    const value = String(rawValue ?? "").trim();
    const field = allowed.get(key);
    if (!field || !value) continue;
    if (field.kind === "select" && !field.options?.includes(value)) continue;
    normalized[key] = value;
  }
  return Object.keys(normalized).length ? normalized : undefined;
}

export function uniqueAgentName(base: string, existing: string[]): string {
  const seed = String(base || "Agent").trim() || "Agent";
  const used = new Set(existing.map((name) => String(name || "").trim().toLocaleLowerCase()));
  if (!used.has(seed.toLocaleLowerCase())) return seed;
  for (let suffix = 2; suffix < 10000; suffix += 1) {
    const candidate = `${seed} ${suffix}`;
    if (!used.has(candidate.toLocaleLowerCase())) return candidate;
  }
  return `${seed} ${existing.length + 1}`;
}

export function summarizeAgentOptions(options: Record<string, string> | undefined): string[] {
  return Object.entries(options || {}).map(([key, value]) => `${key}: ${value}`);
}

export function validateAgentHubAgents(agents: AgentHubConfigAgent[], providers: AgentHubConfigProvider[]): AgentHubConfigError[] {
  const errors: AgentHubConfigError[] = [];
  const providerIDs = new Set(providers.map((provider) => provider.id));
  const names = new Map<string, number>();
  agents.forEach((agent, index) => {
    const name = String(agent.name || "").trim();
    const normalizedName = name.toLocaleLowerCase();
    if (!name) errors.push({ index, field: "name", message: "Agent name is required." });
    else if ([...name].length > 80) errors.push({ index, field: "name", message: "Agent name must be 80 characters or fewer." });
    else if (names.has(normalizedName)) errors.push({ index, field: "name", message: "Agent names must be unique." });
    else names.set(normalizedName, index);

    if (!String(agent.providerId || "").trim()) errors.push({ index, field: "providerId", message: "Choose a provider." });
    else if (!providerIDs.has(agent.providerId)) errors.push({ index, field: "providerId", message: "Choose a configured provider." });

    for (const [key, value] of Object.entries(agent.environment || {})) {
      if (!String(key).trim() || key.includes("=") || key.includes("\0")) errors.push({ index, field: "environment", message: "Environment variable names cannot be empty, contain =, or contain NUL." });
      if (String(value).includes("\0")) errors.push({ index, field: "environment", message: "Environment variable values cannot contain NUL." });
    }
  });
  return errors;
}
