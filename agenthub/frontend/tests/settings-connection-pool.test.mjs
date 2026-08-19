import assert from "node:assert/strict";
import http from "node:http";
import test from "node:test";

function listen(server) {
  return new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
}

function close(server) {
  server.closeAllConnections?.();
  return new Promise((resolve) => server.close(resolve));
}

function openStream(base, agent) {
  return new Promise((resolve, reject) => {
    const request = http.get(`${base}/stream`, { agent }, (response) => {
      response.on("data", () => {});
      resolve({ request, response });
    });
    request.on("error", reject);
  });
}

function getConfig(base, agent) {
  return new Promise((resolve, reject) => {
    const request = http.get(`${base}/config`, { agent }, (response) => {
      response.resume();
      resolve(response.statusCode);
    });
    request.on("error", reject);
  });
}

test("six long-lived HTTP/1.1 streams can queue Settings config", async () => {
  const server = http.createServer((request, response) => {
    if (request.url === "/stream") {
      response.writeHead(200, { "Content-Type": "text/event-stream" });
      response.write(": connected\n\n");
      return;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ config: {} }));
  });
  await listen(server);
  const base = `http://127.0.0.1:${server.address().port}`;
  const agent = new http.Agent({ maxSockets: 6 });
  const streams = [];
  try {
    streams.push(...await Promise.all(Array.from({ length: 6 }, () => openStream(base, agent))));
    const config = getConfig(base, agent);
    const beforeRelease = await Promise.race([
      config.then(() => "completed"),
      new Promise((resolve) => setTimeout(() => resolve("queued"), 50)),
    ]);
    assert.equal(beforeRelease, "queued");
    for (const { request } of streams) request.destroy();
    assert.equal(await config, 200);
  } finally {
    for (const { request } of streams) request.destroy();
    agent.destroy();
    await close(server);
  }
});
