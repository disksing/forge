package serve

import (
	"github.com/disksing/forge/internal/app"
)

func workspaceTreeFromApp(tree app.WorkspaceTree) workspaceTree {
	result := workspaceTree{
		Root:      tree.Root,
		Creator:   tree.Creator,
		Scheduler: resourceSnapshotFromApp(tree.Scheduler),
		Projects:  make([]resourceSnapshot, 0, len(tree.Projects)),
		Wiki:      workspaceWiki{Exists: tree.Wiki.Exists, Entries: fileTreeEntriesFromApp(tree.Wiki.Entries), Error: tree.Wiki.Error},
	}
	for _, project := range tree.Projects {
		result.Projects = append(result.Projects, resourceSnapshotFromApp(project))
	}
	return result
}

func resourceSnapshotFromApp(resource app.ResourceTreeView) resourceSnapshot {
	result := resourceSnapshot{ID: resource.ID, Type: resource.Type, Title: resource.Title, Path: resource.Path, Archived: resource.Archived, Creator: resource.Creator, AgentBinding: resource.AgentBinding}
	for _, child := range resource.Children {
		result.Children = append(result.Children, resourceSnapshotFromApp(child))
	}
	return result
}

func fileTreeEntriesFromApp(entries []app.FileTreeEntry) []fileTreeEntry {
	result := make([]fileTreeEntry, 0, len(entries))
	for _, entry := range entries {
		converted := fileTreeEntry{Name: entry.Name, Path: entry.Path, Type: entry.Type, Size: entry.Size, Modified: entry.Modified}
		converted.Children = fileTreeEntriesFromApp(entry.Children)
		result = append(result, converted)
	}
	return result
}
