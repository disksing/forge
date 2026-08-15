<script lang="ts">
  import "./MarkdownEditor.css";

  import { onDestroy, tick } from "svelte";
  import { minimalSetup } from "codemirror";
  import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
  import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
  import { EditorState, MapMode, StateEffect, StateField } from "@codemirror/state";
  import { Decoration, EditorView, highlightActiveLine, highlightActiveLineGutter, lineNumbers, type DecorationSet } from "@codemirror/view";
  import { tags } from "@lezer/highlight";

  import Icon from "./Icon.svelte";
  import { markdownEditorSessions, type ReviewAnnotation } from "./markdown-editor-session";
  import type { FilePreviewModel } from "./models";

  const replaceAnnotations = StateEffect.define<ReviewAnnotation[]>();
  const annotationField = StateField.define<ReviewAnnotation[]>({
    create: () => [],
    update(value, transaction) {
      let next = value;
      if (transaction.docChanged) {
        next = value.map((annotation) => {
          const from = transaction.changes.mapPos(annotation.from, 1, MapMode.TrackAfter);
          const to = transaction.changes.mapPos(annotation.to, -1, MapMode.TrackBefore);
          if (from == null || to == null || to <= from) {
            const anchor = transaction.changes.mapPos(annotation.from, 1);
            return { ...annotation, from: anchor, to: anchor, stale: true };
          }
          const quote = transaction.newDoc.sliceString(from, to);
          return { ...annotation, from, to, quote: quote || annotation.quote, stale: !quote };
        });
      }
      for (const effect of transaction.effects) {
        if (effect.is(replaceAnnotations)) next = effect.value;
      }
      return next;
    },
    provide: (field) => EditorView.decorations.from(field, annotationDecorations),
  });

  function annotationDecorations(annotations: ReviewAnnotation[]): DecorationSet {
    return Decoration.set(annotations.filter((annotation) => !annotation.stale && annotation.to > annotation.from).map((annotation) =>
      Decoration.mark({ class: "cm-review-annotation", attributes: { "data-annotation-id": annotation.id } }).range(annotation.from, annotation.to)
    ), true);
  }

  const markdownHighlight = HighlightStyle.define([
    { tag: tags.heading1, fontSize: "1.55em", fontWeight: "750", color: "#182433" },
    { tag: tags.heading2, fontSize: "1.35em", fontWeight: "730", color: "#1d2b3b" },
    { tag: tags.heading3, fontSize: "1.18em", fontWeight: "700", color: "#263647" },
    { tag: [tags.heading4, tags.heading5, tags.heading6], fontWeight: "700", color: "#304254" },
    { tag: tags.strong, fontWeight: "750" },
    { tag: tags.emphasis, fontStyle: "italic" },
    { tag: tags.quote, color: "#66788a", fontStyle: "italic" },
    { tag: tags.link, color: "#1769aa", textDecoration: "underline" },
    { tag: tags.monospace, color: "#8c3b2d", backgroundColor: "#f4f1ed" },
  ]);

  let { identity, file, onSave, onDone, onToast, onIconsChanged }: {
    identity: string;
    file: FilePreviewModel;
    onSave: (content: string, expectedContentHash: string) => Promise<FilePreviewModel>;
    onDone: () => void;
    onToast: (message: string) => void;
    onIconsChanged: () => void;
  } = $props();

  let host = $state<HTMLDivElement>();
  let manualCopy = $state<HTMLTextAreaElement>();
  let view: EditorView | null = null;
  let currentIdentity = $state("");
  let baseline = $state("");
  let baselineHash = $state("");
  let incomingHash = $state("");
  let draft = $state("");
  let annotations = $state<ReviewAnnotation[]>([]);
  let selectionFrom = $state(0);
  let selectionTo = $state(0);
  let saving = $state(false);
  let error = $state("");
  let copyFallback = $state("");
  let annotationCounter = 0;
  const dirty = $derived(draft !== baseline);
  const localWork = $derived(dirty || annotations.length > 0);
  const conflict = $derived(Boolean(localWork && incomingHash && baselineHash && incomingHash !== baselineHash));
  const canAnnotate = $derived(selectionTo > selectionFrom);

  $effect(() => {
    if (!host) return;
    const nextIdentity = identity;
    const nextContent = file.content || "";
    const nextHash = file.contentHash || "";
    incomingHash = nextHash;
    if (!view || nextIdentity !== currentIdentity) {
      currentIdentity = nextIdentity;
      const session = markdownEditorSessions.get(nextIdentity);
      baseline = session?.baseline ?? nextContent;
      baselineHash = session?.baselineHash ?? nextHash;
      draft = session?.draft ?? nextContent;
      annotations = session?.annotations.map((annotation) => ({ ...annotation })) ?? [];
      error = "";
      copyFallback = "";
      createEditor(draft, annotations);
    } else if (!localWork && nextHash !== baselineHash) {
      baseline = nextContent;
      baselineHash = nextHash;
      replaceEditorContent(nextContent);
    }
  });

  onDestroy(() => {
    persistSession();
    view?.destroy();
  });

  function createEditor(content: string, initialAnnotations: ReviewAnnotation[] = []): void {
    view?.destroy();
    if (!host) return;
    const lineSeparator = content.includes("\r\n") ? "\r\n" : "\n";
    view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: content,
        extensions: [
          minimalSetup,
          lineNumbers(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          EditorState.lineSeparator.of(lineSeparator),
          markdown({ base: markdownLanguage }),
          syntaxHighlighting(markdownHighlight),
          annotationField,
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({ spellcheck: "true", "aria-label": `Markdown editor for ${file.path}` }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) draft = update.state.doc.toString();
            const selection = update.state.selection.main;
            selectionFrom = selection.from;
            selectionTo = selection.to;
            annotations = update.state.field(annotationField).map((annotation) => ({ ...annotation }));
            if (update.docChanged || update.transactions.some((transaction) => transaction.effects.length > 0)) persistSession();
          }),
        ],
      }),
    });
    selectionFrom = view.state.selection.main.from;
    selectionTo = view.state.selection.main.to;
    if (initialAnnotations.length) view.dispatch({ effects: replaceAnnotations.of(initialAnnotations) });
    queueMicrotask(onIconsChanged);
  }

  function replaceEditorContent(content: string): void {
    if (!view) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: content },
      effects: replaceAnnotations.of([]),
    });
    draft = content;
  }

  function setAnnotationList(next: ReviewAnnotation[]): void {
    if (!view) return;
    view.dispatch({ effects: replaceAnnotations.of(next) });
    annotations = next.map((annotation) => ({ ...annotation }));
    persistSession();
  }

  function persistSession(): void {
    if (!currentIdentity) return;
    if (draft === baseline && annotations.length === 0) {
      markdownEditorSessions.delete(currentIdentity);
      return;
    }
    markdownEditorSessions.set(currentIdentity, {
      baseline,
      baselineHash,
      draft,
      annotations: annotations.map((annotation) => ({ ...annotation })),
    });
  }

  function addAnnotation(): void {
    if (!view || !canAnnotate) return;
    const quote = view.state.doc.sliceString(selectionFrom, selectionTo);
    const annotation: ReviewAnnotation = {
      id: `annotation-${Date.now()}-${++annotationCounter}`,
      from: selectionFrom,
      to: selectionTo,
      quote,
      comment: "",
      stale: false,
    };
    setAnnotationList([...annotations, annotation]);
    queueMicrotask(() => document.querySelector<HTMLTextAreaElement>(`[data-comment-for="${annotation.id}"]`)?.focus());
  }

  function updateAnnotation(id: string, comment: string): void {
    setAnnotationList(annotations.map((annotation) => annotation.id === id ? { ...annotation, comment } : annotation));
  }

  function removeAnnotation(id: string): void {
    setAnnotationList(annotations.filter((annotation) => annotation.id !== id));
  }

  function focusAnnotation(annotation: ReviewAnnotation): void {
    if (!view || annotation.stale) return;
    view.dispatch({ selection: { anchor: annotation.from, head: annotation.to }, scrollIntoView: true });
    view.focus();
  }

  function annotationLocation(annotation: ReviewAnnotation): string {
    if (!view || annotation.stale) return "Selection removed";
    const start = view.state.doc.lineAt(annotation.from);
    const end = view.state.doc.lineAt(annotation.to);
    const startColumn = annotation.from - start.from + 1;
    const endColumn = annotation.to - end.from + 1;
    return `L${start.number}:C${startColumn}–L${end.number}:C${endColumn}`;
  }

  async function save(): Promise<void> {
    if (saving || !dirty) return;
    saving = true;
    error = "";
    try {
      const saved = await onSave(draft, baselineHash);
      baseline = saved.content ?? draft;
      baselineHash = saved.contentHash || "";
      incomingHash = baselineHash;
      if (baseline !== draft) replaceEditorContent(baseline);
      persistSession();
      onToast(`${file.name || "Markdown file"} saved.`);
    } catch (reason) {
      error = reason instanceof Error ? reason.message : String(reason);
    } finally {
      saving = false;
      queueMicrotask(onIconsChanged);
    }
  }

  function reviewExport(): string {
    const version = baselineHash ? `sha256:${baselineHash}` : "unknown";
    const lines = [`文件：${file.path}`, `基础版本：${version}`];
    if (dirty) lines.push("状态：包含未保存修改");
    lines.push("");
    annotations.forEach((annotation, index) => {
      const quote = annotation.stale ? `[选区已删除] ${annotation.quote}` : annotation.quote;
      lines.push(`${index + 1}. 位置：${annotationLocation(annotation)}`, "   原文：");
      for (const line of quote.split("\n")) lines.push(`   > ${line}`);
      lines.push("", `   批注：${annotation.comment.trim() || "（未填写）"}`, "");
    });
    return lines.join("\n").trimEnd() + "\n";
  }

  async function copyAnnotations(): Promise<void> {
    if (!annotations.length) return;
    const output = reviewExport();
    copyFallback = "";
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(output);
        onToast("Annotations copied to the clipboard.");
        return;
      }
    } catch {
      // The production Forge origin is plain LAN HTTP, where Async Clipboard
      // is commonly unavailable. Continue to the synchronous fallback.
    }
    const temporary = document.createElement("textarea");
    temporary.value = output;
    temporary.setAttribute("readonly", "");
    temporary.style.position = "fixed";
    temporary.style.opacity = "0";
    document.body.appendChild(temporary);
    temporary.select();
    const copied = typeof document.execCommand === "function" && document.execCommand("copy");
    temporary.remove();
    if (copied) {
      onToast("Annotations copied to the clipboard.");
      return;
    }
    copyFallback = output;
    await tick();
    manualCopy?.focus();
    manualCopy?.select();
    onToast("Automatic clipboard access is unavailable. Press Cmd/Ctrl+C to copy the selected text.");
  }

  function done(): void {
    persistSession();
    onDone();
  }
</script>

<section class="markdown-editor-shell" data-component-owner="markdown-editor" data-editor-identity={identity}>
  <div class="markdown-editor-toolbar">
    <div class="markdown-editor-primary-actions">
      <button type="button" class="secondary-button" disabled={!canAnnotate} onclick={addAnnotation}><Icon name="message-square-plus" /><span>Add annotation</span></button>
      <button type="button" class="secondary-button" disabled={!annotations.length} onclick={copyAnnotations}><Icon name="copy" /><span>Copy annotations</span></button>
    </div>
    <div class="markdown-editor-save-actions">
      <button type="button" class="secondary-button" onclick={done}>Done</button>
      <button type="button" class:busy={saving} disabled={saving || !dirty} onclick={save}><Icon name={saving ? "loader-circle" : "save"} /><span>{saving ? "Saving" : "Save"}</span></button>
    </div>
  </div>
  {#if conflict}<p class="markdown-editor-alert" role="alert">This file changed on disk while you were editing. Your draft and annotations are preserved; saving will report a conflict.</p>{/if}
  {#if error}<p class="markdown-editor-alert" role="alert">{error}</p>{/if}
  <div class:with-annotations={annotations.length > 0} class="markdown-editor-layout">
    <div class="markdown-editor-host" bind:this={host}></div>
    {#if annotations.length}
      <aside class="markdown-annotation-panel" aria-label="Annotations">
        <header><strong>Annotations</strong><span>{annotations.length}</span></header>
        {#each annotations as annotation (annotation.id)}
          <article class:stale={annotation.stale}>
            <div class="markdown-annotation-heading"><button type="button" class="annotation-location" disabled={annotation.stale} onclick={() => focusAnnotation(annotation)}>{annotationLocation(annotation)}</button><button type="button" class="icon-button" title="Remove annotation" aria-label="Remove annotation" onclick={() => removeAnnotation(annotation.id)}><Icon name="trash-2" /></button></div>
            <blockquote>{annotation.stale ? `[Selection removed] ${annotation.quote}` : annotation.quote}</blockquote>
            <textarea rows="3" value={annotation.comment} data-comment-for={annotation.id} aria-label={`Comment for ${annotationLocation(annotation)}`} placeholder="Add a comment…" oninput={(event) => updateAnnotation(annotation.id, event.currentTarget.value)}></textarea>
          </article>
        {/each}
      </aside>
    {/if}
  </div>
  {#if copyFallback}
    <div class="markdown-copy-fallback" role="status"><strong>Copy annotations manually</strong><span>Press Cmd/Ctrl+C; the complete text is selected.</span><textarea readonly rows="10" bind:this={manualCopy} value={copyFallback}></textarea></div>
  {/if}
</section>
