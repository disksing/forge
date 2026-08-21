import { describe, expect, it } from "vitest";

import { doctorSnapshotForWorkspace } from "../../src/controllers/doctor-projection";
import type { DoctorSnapshotModel } from "../../src/models/shell";

describe("Doctor projection", () => {
  it("reports only the active Workspace while preserving global scan state", () => {
    const snapshot: DoctorSnapshotModel = {
      checkedAt: "2026-08-16T00:00:00Z",
      checking: false,
      complete: false,
      summary: { errors: 4, warnings: 2 },
      workspaces: [
        { id: "workspace-a", name: "A", path: "/a", report: { complete: true, summary: { errors: 0, warnings: 1 }, issues: [{ severity: "warning", code: "a", message: "A warning" }] } },
        { id: "workspace-b", name: "B", path: "/b", report: { complete: false, summary: { errors: 4, warnings: 1 }, issues: [{ severity: "error", code: "b", message: "B error" }] } },
      ],
    };

    expect(doctorSnapshotForWorkspace(snapshot, "workspace-a")).toEqual({
      ...snapshot,
      complete: true,
      summary: { errors: 0, warnings: 1 },
      workspaces: [snapshot.workspaces[0]],
    });
  });

  it("does not surface another Workspace when the active Workspace is absent", () => {
    const snapshot: DoctorSnapshotModel = {
      checking: false,
      complete: true,
      summary: { errors: 1, warnings: 0 },
      workspaces: [{ id: "workspace-b", name: "B", path: "/b", report: { complete: true, summary: { errors: 1, warnings: 0 }, issues: [{ severity: "error", code: "b", message: "B error" }] } }],
    };

    expect(doctorSnapshotForWorkspace(snapshot, "workspace-a")).toMatchObject({
      summary: { errors: 0, warnings: 0 },
      workspaces: [],
    });
  });

  it("treats a legacy null Workspace list as empty", () => {
    const snapshot = {
      checking: false,
      complete: true,
      summary: { errors: 0, warnings: 0 },
      workspaces: null,
    } as unknown as DoctorSnapshotModel;

    expect(doctorSnapshotForWorkspace(snapshot, "")).toMatchObject({
      complete: true,
      summary: { errors: 0, warnings: 0 },
      workspaces: [],
    });
  });
});
