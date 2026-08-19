import assert from "node:assert/strict";
import test from "node:test";
import {
  loadSettingsAuxiliary,
  loadSettingsConfig,
  requestWithTimeout,
} from "../src/settings/loadSettings.js";

function configResponse() {
  return { config: { version: 1, agentProviders: [], agents: [] } };
}

test("two concurrent settings loads do not wait for a stalled auxiliary request", async () => {
  const calls = [];
  const request = async (path) => {
    calls.push(path);
    if (path === "/v1/config") return configResponse();
    return new Promise(() => {});
  };

  const [first, second] = await Promise.all([
    loadSettingsConfig(request, 20),
    loadSettingsConfig(request, 20),
  ]);

  assert.deepEqual(first, configResponse());
  assert.deepEqual(second, configResponse());
  assert.deepEqual(calls, ["/v1/config", "/v1/config"]);
});

test("auxiliary settings requests time out independently and keep empty fallbacks", async () => {
  const request = async (path) => {
    if (path === "/v1/agents") return { probes: [{ providerId: "codex", available: true }] };
    return new Promise(() => {});
  };

  const result = await loadSettingsAuxiliary(request, 20);

  assert.deepEqual(result.agentsBody, { probes: [{ providerId: "codex", available: true }] });
  assert.deepEqual(result.quotaBody.quota.providers, []);
  assert.match(result.quotaBody.quota.error, /Timed out loading \/v1\/quota after 20ms/);
});

test("requestWithTimeout aborts a fetch-backed request when it stalls", async () => {
  let aborted = false;
  const request = (_path, options) => new Promise((_resolve, reject) => {
    options.signal.addEventListener("abort", () => {
      aborted = true;
      reject(new Error("aborted"));
    }, { once: true });
  });

  await assert.rejects(requestWithTimeout(request, "/v1/config", 20), /Timed out loading \/v1\/config after 20ms/);
  assert.equal(aborted, true);
});
