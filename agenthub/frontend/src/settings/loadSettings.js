// Configuration is the critical settings resource. Provider probes and quota
// are supplemental: a slow or unavailable auxiliary endpoint must not keep
// the settings dialog in its initial loading state.

export const SETTINGS_REQUEST_TIMEOUT_MS = 5000;

function timeoutMessage(path, timeoutMs) {
  return `Timed out loading ${path} after ${timeoutMs}ms`;
}

// A browser fetch has no default response deadline. Bound every settings
// request and abort fetch-backed requests when the deadline expires so a
// stalled tab can surface the existing error/retry UI instead of loading
// forever.
export function requestWithTimeout(request, path, timeoutMs = SETTINGS_REQUEST_TIMEOUT_MS) {
  const controller = typeof AbortController === "function" ? new AbortController() : null;
  let timer;
  const options = controller ? { signal: controller.signal } : undefined;
  const pending = Promise.resolve().then(() => request(path, options));
  const deadline = new Promise((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(timeoutMessage(path, timeoutMs)));
      controller?.abort();
    }, timeoutMs);
  });
  return Promise.race([pending, deadline]).finally(() => clearTimeout(timer));
}

export function loadSettingsConfig(request, timeoutMs = SETTINGS_REQUEST_TIMEOUT_MS) {
  return requestWithTimeout(request, "/v1/config", timeoutMs);
}

function optionalFailure(value, fallback) {
  return value && typeof value.message === "string" ? value.message : fallback;
}

// These requests intentionally settle independently. The caller can render
// the configuration as soon as the critical request succeeds, while a slow
// probe/quota endpoint falls back to an empty section after its own deadline.
export async function loadSettingsAuxiliary(request, timeoutMs = SETTINGS_REQUEST_TIMEOUT_MS) {
  const [agentsResult, quotaResult] = await Promise.all([
    requestWithTimeout(request, "/v1/agents", timeoutMs)
      .then((value) => ({ value }))
      .catch((error) => ({ error: new Error(optionalFailure(error, "Failed to load agents")) })),
    requestWithTimeout(request, "/v1/quota", timeoutMs)
      .then((value) => ({ value }))
      .catch((error) => ({ error: new Error(optionalFailure(error, "Failed to load quota")) })),
  ]);
  return {
    agentsBody: agentsResult.value || { probes: [], error: agentsResult.error?.message || "Failed to load agents" },
    quotaBody: quotaResult.value || { quota: { providers: [], error: quotaResult.error?.message || "Failed to load quota" } },
  };
}
