import type { DoctorSnapshotModel } from "../models/shell";

export function doctorSnapshotForWorkspace(snapshot: DoctorSnapshotModel, workspaceId: string): DoctorSnapshotModel {
  const workspaces = snapshot.workspaces || [];
  const workspace = workspaces.find((item) => item.id === workspaceId);
  return {
    ...snapshot,
    complete: workspace?.report.complete ?? (snapshot.complete && workspaces.length === 0),
    summary: workspace?.report.summary ?? { errors: 0, warnings: 0 },
    workspaces: workspace ? [workspace] : [],
  };
}
