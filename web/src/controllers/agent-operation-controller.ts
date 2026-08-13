export type AgentOperationKind =
	| "turn-stop";

export interface AgentOperationLease {
	kind: AgentOperationKind;
	key: string;
	generation: number;
}

export function createAgentOperationController(onChange: () => void) {
	let generation = 0;
	const active = new Map<AgentOperationKind, AgentOperationLease>();
	const sending = new Set<string>();

	function begin(kind: AgentOperationKind, key = ""): AgentOperationLease | null {
		if (active.has(kind)) return null;
		const lease = { kind, key, generation: ++generation };
		active.set(kind, lease);
		onChange();
		return lease;
	}

	function finish(lease: AgentOperationLease | null): boolean {
		if (!lease || active.get(lease.kind)?.generation !== lease.generation) return false;
		active.delete(lease.kind);
		onChange();
		return true;
	}

	function startSending(key: string): boolean {
		if (!key || sending.has(key)) return false;
		sending.add(key);
		onChange();
		return true;
	}

	function stopSending(key: string): void {
		if (!sending.delete(key)) return;
		onChange();
	}

	function reset(): void {
		if (!active.size && !sending.size) return;
		active.clear();
		sending.clear();
		generation++;
		onChange();
	}

	return {
		begin,
		finish,
		reset,
		active: (kind: AgentOperationKind) => active.has(kind),
		key: (kind: AgentOperationKind) => active.get(kind)?.key || "",
		startSending,
		stopSending,
		isSending: (key: string) => sending.has(key)
	};
}
