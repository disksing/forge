<script lang="ts">
  import { onMount, tick } from "svelte";

  import type { ModelChannel } from "./model-channel";
  import Icon from "./Icon.svelte";
  import type { ComposerModel } from "./models";

  let { channel }: { channel: ModelChannel<ComposerModel> } = $props();
  // svelte-ignore state_referenced_locally
  let model = $state(channel.current());
  let identity = $state("");
  let resetVersion = $state(-1);
  let draft = $state("");
  let sending = $state(false);
  let error = $state("");
  let multiline = $state(false);
  let input: HTMLTextAreaElement | undefined = $state();

  const blocked = $derived(Boolean(model.unavailableReason) || sending || model.sending);
  const newSessionTitle = $derived(model.sessionStarting ? "Creating a new AgentHub session..." : model.agents.length ? "Choose an Agent to start a new session." : "No enabled agents are available. Configure an AgentHub Agent in Settings.");

  onMount(() => channel.subscribe((next) => {
    model = next;
    if (next.identity !== identity) {
      identity = next.identity;
      resetVersion = next.draftResetVersion;
      draft = next.draft;
      sending = false;
      error = "";
      multiline = false;
    } else if (next.draftResetVersion !== resetVersion) {
      resetVersion = next.draftResetVersion;
      draft = next.draft;
      error = "";
    }
    queueMicrotask(next.onIconsChanged);
  }));

  $effect(() => {
    draft;
    void tick().then(resize);
  });

  function context() {
    return { workspaceId: model.workspaceId, resourceId: model.resourceId, runId: model.runId, draftKey: model.draftKey };
  }

  function updateDraft(value: string): void {
    draft = value;
    error = "";
    model.onDraft(value, context());
  }

  async function send(event?: SubmitEvent): Promise<void> {
    event?.preventDefault();
    const text = draft;
    if (blocked || !text.trim() || !model.runId) return;
    const requestIdentity = identity;
    const requestContext = context();
    sending = true;
    error = "";
    try {
      const result = await model.onSend(text, requestContext);
      if (identity === requestIdentity && result.accepted && result.clear && draft === text) updateDraft("");
    } catch (reason) {
      if (identity === requestIdentity) error = reason instanceof Error ? reason.message : String(reason);
    } finally {
      if (identity === requestIdentity) {
        sending = false;
        await tick();
        input?.focus({ preventScroll: true });
      }
    }
  }

  function keydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.isComposing || event.keyCode === 229) return;
    if (event.metaKey || event.ctrlKey) {
      event.preventDefault();
      void send();
      return;
    }
    if (event.shiftKey) {
      multiline = true;
      return;
    }
    if (multiline) return;
    event.preventDefault();
    void send();
  }

  function resize(): void {
    if (!input) return;
    input.style.height = "auto";
    const nextHeight = Math.min(input.scrollHeight, 160);
    input.style.height = `${nextHeight}px`;
    input.style.overflowY = input.scrollHeight > 160 ? "auto" : "hidden";
  }
</script>

{#if model.live}
  <form id="ttyForm" class="tty-input" onsubmit={send}>
    <span>&gt;</span>
    <textarea id="ttyInput" bind:this={input} rows="1" autocomplete="off" data-agent-draft-key={model.draftKey} placeholder={model.unavailableReason || "Send input to the selected agent session"} disabled={blocked} value={draft} oninput={(event) => updateDraft(event.currentTarget.value)} onkeydown={keydown}></textarea>
    <span class="tty-composer-group">
      {#if !model.externalLocked}<button type="button" id="agentUploadButton" class="tty-upload-button" title="Upload files" aria-label="Upload files" onclick={model.onOpenUpload}><Icon name="plus" /></button>{/if}
      <button type="submit" class="tty-send-button" title={sending ? "Sending..." : model.unavailableReason || "Send input"} aria-label={sending ? "Sending..." : model.unavailableReason || "Send input"} disabled={blocked}><Icon name={sending ? "loader-circle" : "send"} /></button>
    </span>
    {#if model.canEndTurn || model.runId}
      <span class="tty-composer-divider" aria-hidden="true"></span>
      <span class="tty-composer-group">
        {#if model.canEndTurn}<button type="button" id="agentEndTurnButton" class="tty-composer-action tty-end-turn-button" disabled={model.endingTurn || model.closingSession || model.selfDrivingDisabling} title="End current turn; keep the Session open." aria-label="End current turn; keep the Session open." onclick={model.onEndTurn}><Icon name={model.endingTurn ? "loader-circle" : "pause"} /></button>{/if}
        <button type="button" id="agentCloseSessionButton" class="tty-composer-action tty-close-session-button" disabled={model.endingTurn || model.closingSession || model.selfDrivingDisabling} title={model.selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session."} aria-label={model.selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session."} onclick={model.onCloseSession}><Icon name={model.closingSession ? "loader-circle" : "square"} /></button>
      </span>
    {/if}
    {#if !model.internalLocked}
      <button type="button" id="agentActionsToggle" class="tty-actions-toggle" title="Session actions" aria-label="Session actions" aria-expanded={model.actionsOpen} onclick={model.onToggleActions}><Icon name="ellipsis" /></button>
    {/if}
  </form>
  {#if error}<div class="tty-composer-error" role="alert"><span>{error}</span><button type="button" class="secondary-button" disabled={sending} onclick={() => send()}>Retry</button></div>{/if}
  {#if model.actionsOpen && !model.internalLocked}
    <div class="tty-session-actions collapsible open">
      <div class="tty-new-session-control">
        <button type="button" id="agentStartButton" class="tty-new-session-button" title={newSessionTitle} aria-label={newSessionTitle} disabled={model.sessionStarting || !model.agents.length} aria-haspopup="menu" aria-controls="ttyAgentMenu" aria-expanded={model.chooserOpen} onclick={model.onToggleChooser}><Icon name={model.sessionStarting ? "loader-circle" : "plus"} /><span>{model.sessionStarting ? "Creating Session..." : "New Session"}</span></button>
        {#if model.chooserOpen}
          <div id="ttyAgentMenu" class="tty-agent-menu" role="menu" aria-label="Choose an Agent">
            {#each model.agents as agent (agent.id)}<button type="button" role="menuitem" class:active={agent.id === model.selectedAgentId} data-agent-choice={agent.id} onclick={() => model.onChooseAgent(agent.id)}><span>{agent.label}</span><small>{agent.summary}</small></button>{/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
{:else}
  <div class="tty-session-actions tty-standalone-actions open" role="toolbar" aria-label="Session actions">
    {#if model.externalLocked}<div class="external-resource-lock">This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.</div>{/if}
    {#if model.canResume}<button type="button" id="agentResumeButton" class="tty-primary-action" title="Resume Session" aria-label="Resume Session" onclick={model.onResume}><Icon name="rotate-ccw" /><span>Resume Session</span></button>{/if}
    {#if !model.internalLocked && !model.externalLocked}
      <div class="tty-new-session-control">
        <button type="button" id="agentStartButton" class="tty-new-session-button" title={newSessionTitle} aria-label={newSessionTitle} disabled={model.sessionStarting || !model.agents.length} aria-haspopup="menu" aria-controls="ttyAgentMenu" aria-expanded={model.chooserOpen} onclick={model.onToggleChooser}><Icon name={model.sessionStarting ? "loader-circle" : "plus"} /><span>{model.sessionStarting ? "Creating Session..." : "New Session"}</span></button>
        {#if model.chooserOpen}<div id="ttyAgentMenu" class="tty-agent-menu" role="menu" aria-label="Choose an Agent">{#each model.agents as agent (agent.id)}<button type="button" role="menuitem" class:active={agent.id === model.selectedAgentId} data-agent-choice={agent.id} onclick={() => model.onChooseAgent(agent.id)}><span>{agent.label}</span><small>{agent.summary}</small></button>{/each}</div>{/if}
      </div>
    {/if}
  </div>
{/if}
