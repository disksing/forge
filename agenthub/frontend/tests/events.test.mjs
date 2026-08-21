import assert from "node:assert/strict";
import test from "node:test";
import {
  EventCursorGapError,
  catchUpFrames,
  flattenFrames,
  mergeIncomingFrames,
  projectLiveFrame,
} from "../src/events.js";

const semanticEvent = (cursor, type = "provider.unknown", data = { cursor }) => ({
  id: `sem_${cursor}_0`, sourceEventId: cursor, index: 0, type, data,
});

const frame = (cursor, type = "provider.unknown", data = { cursor }, mode = "replace") => ({
  schema: "agenthub.semantic-events.v1",
  cursor,
  mode,
  source: { eventId: cursor, type, sessionId: "ses_test" },
  events: [semanticEvent(cursor, type, data)],
});

const page = (frames, latestCursor) => ({ schema: "agenthub.semantic-events.v1", frames, latestCursor });

test("catchUpFrames pages through the first durable high-water mark", async () => {
  const calls = [];
  const request = async (path) => {
    calls.push(path);
    const after = Number(new URL(path, "http://agenthub.test").searchParams.get("after"));
    const latestCursor = calls.length === 1 ? 2500 : 2600;
    const end = Math.min(after + 1000, 2600);
    return page(Array.from({ length: end - after }, (_, index) => frame(after + index + 1)), latestCursor);
  };
  const result = await catchUpFrames("ses_test", 0, request);
  assert.equal(result.cursor, 2500);
  assert.equal(result.frames.length, 2500);
  assert.deepEqual(result.frames.slice(-2).map(({ cursor }) => cursor), [2499, 2500]);
  assert.equal(calls.length, 3);
});

test("a live cursor gap stops projection and catches up through REST", async () => {
  const actions = [];
  const projected = [];
  const request = async () => {
    actions.push("catch-up");
    return page([frame(2), frame(3), frame(4)], 4);
  };
  const cursor = await projectLiveFrame({
    sessionId: "ses_test",
    cursor: 1,
    frame: frame(4),
    request,
    project(frames) {
      actions.push("project");
      projected.push(...frames);
    },
  });
  assert.equal(cursor, 4);
  assert.deepEqual(actions, ["catch-up", "project"]);
  assert.deepEqual(projected.map((value) => value.cursor), [2, 3, 4]);
});

test("catch-up refuses a non-contiguous REST page", async () => {
  await assert.rejects(
    catchUpFrames("ses_test", 1, async () => page([frame(2), frame(4)], 4)),
    (error) => error instanceof EventCursorGapError && error.expected === 3 && error.got === 4,
  );
});

test("same-cursor live frames are projected again", async () => {
  const projected = [];
  const replacementCursor = await projectLiveFrame({
    sessionId: "ses_test",
    cursor: 5,
    frame: frame(5, "message.assistant.delta", { text: " there" }, "append"),
    project: (frames) => projected.push(...frames),
  });
  assert.equal(replacementCursor, 5);
  const nextCursor = await projectLiveFrame({
    sessionId: "ses_test",
    cursor: replacementCursor,
    frame: frame(6, "future.event.type"),
    project: (frames) => projected.push(...frames),
  });
  assert.equal(nextCursor, 6);
  assert.deepEqual(projected.map((value) => [value.cursor, value.mode]), [[5, "append"], [6, "replace"]]);
});

test("mergeIncomingFrames appends semantic deltas, replaces snapshots, and keeps empty cursors", () => {
  const stored = [
    frame(1, "turn.started"),
    frame(2, "message.assistant.delta", { text: "Hello" }),
  ];

  const patched = mergeIncomingFrames(stored, [
    frame(2, "message.assistant.delta", { text: ", " }, "append"),
    frame(2, "message.assistant.delta", { text: "world" }, "append"),
  ]);
  assert.equal(patched.length, 2);
  assert.equal(patched[1].events[0].data.text, "Hello, world");
  assert.equal(patched[1].mode, "replace");
  assert.equal(stored[1].events[0].data.text, "Hello");

  const healed = mergeIncomingFrames(patched, [frame(2, "message.assistant.delta", { text: "Hello, world!" })]);
  assert.equal(healed[1].events[0].data.text, "Hello, world!");

  const empty = { ...frame(3), events: [] };
  const appended = mergeIncomingFrames(healed, [empty]);
  assert.equal(appended.length, 3);
  assert.deepEqual(flattenFrames(appended).map((event) => event.type), ["turn.started", "message.assistant.delta"]);
});

test("tool output append patches are merged without exposing transport fields", () => {
  const started = frame(7, "tool.call", { callId: "call-1", phase: "updated", output: { text: "one", mode: "replace" } });
  const patch = frame(7, "tool.call", { callId: "call-1", phase: "updated", output: { text: " two", mode: "append" } }, "append");
  const [merged] = mergeIncomingFrames([started], [patch]);
  assert.deepEqual(merged.events[0].data.output, { text: "one two", mode: "replace" });
});
