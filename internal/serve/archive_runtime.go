package serve

import "github.com/disksing/forge/internal/app"

// archiveResourceIDs snapshots the stable resource addresses affected by a
// directory move. A Project archive moves its entire subtree, so every child
// mailbox must receive the same durable archive terminal treatment as the
// Project mailbox. The snapshot is best effort; the filesystem move remains
// the single archive commit point and the caller records enumeration failures
// as warnings.
func archiveResourceIDs(workspace *app.Workspace, resourceID string) ([]string, error) {
	resourceID = normalizedResourceID(resourceID)
	value, err := workspace.ResourceValue(resourceID)
	if err != nil {
		return []string{resourceID}, err
	}
	ids := []string{resourceID}
	if value.Project == nil {
		return ids, nil
	}
	tasks, err := workspace.Tasks(app.TaskListOptions{ProjectID: resourceID, IncludeArchived: true})
	if err != nil {
		return ids, err
	}
	for _, entry := range tasks.Tasks {
		if entry.Task.ID == "" {
			continue
		}
		ids = append(ids, entry.Task.ID)
	}
	return ids, nil
}
