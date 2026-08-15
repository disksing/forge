import type { DoctorSnapshotModel } from "../models/shell";

export function doctorSnapshotForWorkspace(snapshot: DoctorSnapshotModel, workspaceId: string): DoctorSnapshotModel {
  const workspace = snapshot.workspaces.find((item) => item.id === workspaceId);
  return {
    ...snapshot,
    complete: workspace?.report.complete ?? (snapshot.complete && snapshot.workspaces.length === 0),
    summary: workspace?.report.summary ?? { errors: 0, warnings: 0 },
    workspaces: workspace ? [workspace] : [],
  };
}
