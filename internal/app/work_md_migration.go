package app

import (
	"bytes"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
)

const (
	legacyWorkMDFileName = "work.md"
	// workMigrationMarkerPrefix is written by new migrations. The legacy
	// forge-branded prefix is still recognized so files migrated before the
	// rebrand are not migrated again.
	workMigrationMarkerPrefix      = "<!-- pua:migration:work-md:v1 "
	forgeWorkMigrationMarkerPrefix = "<!-- forge:migration:work-md:v1 "
	workMigrationMarkerPattern     = `(?m)^<!-- (?:pua|forge):migration:work-md:v1 source=work\.md digest=(sha256:[0-9a-f]{64}) -->[ \t]*$`
)

var workMigrationMarkerRE = regexp.MustCompile(workMigrationMarkerPattern)

// These are the exact explanatory blocks emitted by PUA before work.md was
// retired. Only exact known blocks are removed. Anything that differs is
// retained so a user edit cannot be mistaken for a template.
var legacyWorkTemplateComments = []string{
	`<!--
Optional modules. Copy only useful modules below this comment, keep them current, and delete empty modules.
Do not restate the task background, scope, acceptance criteria, or stable decisions here; keep those in task.md.

## Todo
Use for short-term actions needed by the next agent. Put completed history in log.jsonl.
- [ ] Next concrete action.

## Blockers
Use only when work cannot continue without user input or an external change.
- Blocker: what is blocked, what is needed, and who or what can resolve it.

## Active Work
Use when there is an in-progress implementation, investigation, or review thread with local state worth preserving.
- Focus: current thread.
- Files: relevant paths.
- Notes: state needed to resume.

## Paused Work
Use when temporarily switching away from unfinished work.
- Paused thread: where to resume, why it paused, and what should happen next.

## Resume Plan
Use after interruption or handoff when order matters.
1. First recovery step.
2. Next recovery step.

## Context
Use for useful transient context that is not durable enough for task.md.
- Fact, assumption, or constraint relevant to resuming.

## Resources
Use for unpredictable links and external ids that do not belong in task.json.
- PR: URL or id.
- CI: run id or URL.
- Image: tag.
- Deployment: URL.
- Related task: id.

## Verification
Use for checks already run or still needed when that helps the next agent.
- [x] Command or check that passed.
- [ ] Command or check not run yet.

## Notes
Use sparingly for recovery notes that do not fit another module.
- Note.
-->`,
	`<!--
以下模块均为可选项。只保留当前有用的模块，并随执行进展更新；删除空模块。
不要在此重复任务背景、范围、验收标准或稳定决策；这些内容应保存在 task.md 中。

## 待办
用于记录下一位 agent 需要执行的短期行动。已完成的历史应写入 log.jsonl。
- [ ] 下一项具体行动。

## 阻塞
仅在缺少用户输入或外部状态变化，导致工作无法继续时使用。
- 阻塞原因：说明卡点、所需条件，以及由谁或什么来解决。

## 进行中的工作
用于记录值得保留的实现、调查或评审现场。
- 重点：当前工作线索。
- 文件：相关路径。
- 说明：恢复工作所需的状态。

## 暂停的工作
用于临时切换到其他事项时记录未完成工作。
- 暂停事项：从哪里恢复、为何暂停、下一步应做什么。

## 恢复计划
用于中断或交接后需要按顺序恢复的情况。
1. 第一个恢复步骤。
2. 下一个恢复步骤。

## 上下文
记录有助于恢复、但不适合写入长期任务约定的信息。
- 与恢复相关的事实、假设或约束。

## 资源
记录不适合放入 task.json 的链接和外部 ID。
- PR：URL 或 ID。
- CI：运行 ID 或 URL。
- 图片：标签。
- 部署：URL。
- 相关任务：ID。

## 验证
记录已执行或仍需执行的检查。
- [x] 已通过的命令或检查。
- [ ] 尚未执行的命令或检查。

## 备注
谨慎使用，仅记录不适合上述模块的恢复信息。
- 备注。
-->`,
}

type legacyTaskWorkEntry struct {
	task       Task
	path       string
	sourcePath string
	taskMDPath string
}

type legacyTaskWorkPlan struct {
	entry      legacyTaskWorkEntry
	source     []byte
	digest     string
	cleaned    string
	taskMD     []byte
	markerSeen bool
}

func (w *Workspace) migrateLegacyTaskWorkFiles(language string) error {
	plans, err := planLegacyTaskWorkMigrations(w.root)
	if err != nil {
		return err
	}
	for _, plan := range plans {
		if err := applyLegacyTaskWorkMigration(w.root, plan, language); err != nil {
			return err
		}
	}
	return nil
}

func planLegacyTaskWorkMigrations(root string) ([]legacyTaskWorkPlan, error) {
	projects, err := legacyProjectDirectories(root)
	if err != nil {
		return nil, err
	}
	var plans []legacyTaskWorkPlan
	for _, projectPath := range projects {
		if err := ensureMigrationMetadataFiles(root, "", projectPath); err != nil {
			return nil, err
		}
		project, err := readResourceAtDir(projectPath)
		if err != nil {
			return nil, migrationPathError(root, "", projectPath, fmt.Errorf("read project metadata: %w", err))
		}
		if _, ok := project.(*Project); !ok {
			return nil, migrationPathError(root, "", projectPath, fmt.Errorf("resource is not a project"))
		}
		tasks, err := legacyTaskDirectories(root, projectPath)
		if err != nil {
			return nil, err
		}
		for _, taskPath := range tasks {
			if err := ensureMigrationMetadataFiles(root, "", taskPath); err != nil {
				return nil, err
			}
			var task Task
			if err := readTaskAtDir(taskPath, &task); err != nil {
				return nil, migrationPathError(root, "", taskPath, fmt.Errorf("read task metadata: %w", err))
			}
			entry := legacyTaskWorkEntry{
				task:       task,
				path:       taskPath,
				sourcePath: filepath.Join(taskPath, legacyWorkMDFileName),
				taskMDPath: filepath.Join(taskPath, taskMDFile),
			}
			plan, exists, err := prepareLegacyTaskWorkPlan(root, entry)
			if err != nil {
				return nil, err
			}
			if exists {
				plans = append(plans, plan)
			}
		}
	}
	sort.Slice(plans, func(i, j int) bool {
		if plans[i].entry.task.ID != plans[j].entry.task.ID {
			return plans[i].entry.task.ID < plans[j].entry.task.ID
		}
		return plans[i].entry.path < plans[j].entry.path
	})
	return plans, nil
}

func legacyProjectDirectories(root string) ([]string, error) {
	parents := []string{root, filepath.Join(root, archiveDir)}
	var projects []string
	for _, parent := range parents {
		entries, err := readMigrationDirectory(parent, parent == filepath.Join(root, archiveDir))
		if err != nil {
			return nil, migrationPathError(root, "", parent, err)
		}
		for _, entry := range entries {
			if !topProjectDirName.MatchString(entry.Name()) {
				continue
			}
			path := filepath.Join(parent, entry.Name())
			if entry.Type()&os.ModeSymlink != 0 {
				return nil, migrationPathError(root, "", path, fmt.Errorf("resource directory must not be a symbolic link"))
			}
			if !entry.IsDir() {
				continue
			}
			if err := ensureMigrationDirectory(path); err != nil {
				return nil, migrationPathError(root, "", path, err)
			}
			projects = append(projects, path)
		}
	}
	sort.Strings(projects)
	return projects, nil
}

func legacyTaskDirectories(root, projectPath string) ([]string, error) {
	parents := []string{projectPath, filepath.Join(projectPath, archiveDir)}
	var tasks []string
	for _, parent := range parents {
		entries, err := readMigrationDirectory(parent, parent == filepath.Join(projectPath, archiveDir))
		if err != nil {
			return nil, migrationPathError(root, "", parent, err)
		}
		for _, entry := range entries {
			if !taskDirName.MatchString(entry.Name()) {
				continue
			}
			path := filepath.Join(parent, entry.Name())
			if entry.Type()&os.ModeSymlink != 0 {
				return nil, migrationPathError(root, "", path, fmt.Errorf("resource directory must not be a symbolic link"))
			}
			if !entry.IsDir() {
				continue
			}
			if err := ensureMigrationDirectory(path); err != nil {
				return nil, migrationPathError(root, "", path, err)
			}
			tasks = append(tasks, path)
		}
	}
	sort.Strings(tasks)
	return tasks, nil
}

func readMigrationDirectory(path string, optional bool) ([]os.DirEntry, error) {
	info, err := os.Lstat(path)
	if os.IsNotExist(err) && optional {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	if info.Mode()&os.ModeSymlink != 0 {
		return nil, fmt.Errorf("directory must not be a symbolic link: %s", path)
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("path is not a directory: %s", path)
	}
	return os.ReadDir(path)
}

func ensureMigrationDirectory(path string) error {
	info, err := os.Lstat(path)
	if err != nil {
		return err
	}
	if info.Mode()&os.ModeSymlink != 0 {
		return fmt.Errorf("directory must not be a symbolic link: %s", path)
	}
	if !info.IsDir() {
		return fmt.Errorf("path is not a directory: %s", path)
	}
	return nil
}

func ensureMigrationMetadataFiles(root, resourceID, dir string) error {
	for _, name := range []string{projectJSONFile, taskJSONFile} {
		path := filepath.Join(dir, name)
		info, err := os.Lstat(path)
		if os.IsNotExist(err) {
			continue
		}
		if err != nil {
			return migrationPathError(root, resourceID, path, err)
		}
		if info.Mode()&os.ModeSymlink != 0 {
			return migrationPathError(root, resourceID, path, fmt.Errorf("resource metadata must not be a symbolic link"))
		}
		if !info.Mode().IsRegular() {
			return migrationPathError(root, resourceID, path, fmt.Errorf("resource metadata is not a regular file"))
		}
	}
	return nil
}

func prepareLegacyTaskWorkPlan(root string, entry legacyTaskWorkEntry) (legacyTaskWorkPlan, bool, error) {
	info, err := os.Lstat(entry.sourcePath)
	if os.IsNotExist(err) {
		return legacyTaskWorkPlan{}, false, nil
	}
	if err != nil {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.sourcePath, err)
	}
	if info.Mode()&os.ModeSymlink != 0 {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.sourcePath, fmt.Errorf("legacy file must not be a symbolic link"))
	}
	if !info.Mode().IsRegular() {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.sourcePath, fmt.Errorf("legacy file is not a regular file"))
	}
	source, err := os.ReadFile(entry.sourcePath)
	if err != nil {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.sourcePath, err)
	}
	taskInfo, err := os.Lstat(entry.taskMDPath)
	if err != nil {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.taskMDPath, err)
	}
	if taskInfo.Mode()&os.ModeSymlink != 0 {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.taskMDPath, fmt.Errorf("task Markdown file must not be a symbolic link"))
	}
	if !taskInfo.Mode().IsRegular() {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.taskMDPath, fmt.Errorf("task Markdown path is not a regular file"))
	}
	taskMD, err := os.ReadFile(entry.taskMDPath)
	if err != nil {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.taskMDPath, err)
	}
	digest := legacyWorkDigest(source)
	markerDigest, markerSeen, err := existingWorkMigrationMarker(string(taskMD))
	if err != nil {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.taskMDPath, err)
	}
	if markerSeen && markerDigest != digest {
		return legacyTaskWorkPlan{}, false, migrationPathError(root, entry.task.ID, entry.sourcePath, fmt.Errorf("migration marker digest conflict: task.md has %s, source is %s", markerDigest, digest))
	}
	return legacyTaskWorkPlan{
		entry:      entry,
		source:     source,
		digest:     digest,
		cleaned:    cleanLegacyWorkContent(string(source), entry.task.ID),
		taskMD:     taskMD,
		markerSeen: markerSeen,
	}, true, nil
}

func applyLegacyTaskWorkMigration(root string, plan legacyTaskWorkPlan, language string) error {
	if plan.markerSeen {
		return removeLegacyWorkFile(root, plan)
	}
	if plan.cleaned != "" {
		if err := verifyLegacyWorkSource(root, plan); err != nil {
			return err
		}
		currentTaskMD, err := os.ReadFile(plan.entry.taskMDPath)
		if err != nil {
			return migrationPathError(root, plan.entry.task.ID, plan.entry.taskMDPath, err)
		}
		if !bytes.Equal(currentTaskMD, plan.taskMD) {
			return migrationPathError(root, plan.entry.task.ID, plan.entry.taskMDPath, fmt.Errorf("task Markdown file changed during migration; source retained"))
		}
		updated := appendMigrationChapter(plan.taskMD, plan.cleaned, plan.digest, language)
		info, err := os.Lstat(plan.entry.taskMDPath)
		if err != nil {
			return migrationPathError(root, plan.entry.task.ID, plan.entry.taskMDPath, err)
		}
		if info.Mode()&os.ModeSymlink != 0 || !info.Mode().IsRegular() {
			return migrationPathError(root, plan.entry.task.ID, plan.entry.taskMDPath, fmt.Errorf("task Markdown path changed during migration"))
		}
		if err := writeFileAtomically(plan.entry.taskMDPath, updated, info.Mode().Perm()); err != nil {
			return migrationPathError(root, plan.entry.task.ID, plan.entry.taskMDPath, err)
		}
		written, err := os.ReadFile(plan.entry.taskMDPath)
		if err != nil {
			return migrationPathError(root, plan.entry.task.ID, plan.entry.taskMDPath, err)
		}
		markerDigest, markerSeen, err := existingWorkMigrationMarker(string(written))
		if err != nil || !markerSeen || markerDigest != plan.digest {
			if err == nil {
				err = fmt.Errorf("migration marker verification failed")
			}
			return migrationPathError(root, plan.entry.task.ID, plan.entry.taskMDPath, err)
		}
	}
	return removeLegacyWorkFile(root, plan)
}

func removeLegacyWorkFile(root string, plan legacyTaskWorkPlan) error {
	if err := verifyLegacyWorkSource(root, plan); err != nil {
		return err
	}
	if err := os.Remove(plan.entry.sourcePath); err != nil {
		return migrationPathError(root, plan.entry.task.ID, plan.entry.sourcePath, err)
	}
	if err := syncDirectory(plan.entry.path); err != nil {
		return migrationPathError(root, plan.entry.task.ID, plan.entry.path, err)
	}
	return nil
}

func verifyLegacyWorkSource(root string, plan legacyTaskWorkPlan) error {
	info, err := os.Lstat(plan.entry.sourcePath)
	if err != nil {
		return migrationPathError(root, plan.entry.task.ID, plan.entry.sourcePath, err)
	}
	if info.Mode()&os.ModeSymlink != 0 || !info.Mode().IsRegular() {
		return migrationPathError(root, plan.entry.task.ID, plan.entry.sourcePath, fmt.Errorf("legacy file changed to a non-regular file during migration; source retained"))
	}
	current, err := os.ReadFile(plan.entry.sourcePath)
	if err != nil {
		return migrationPathError(root, plan.entry.task.ID, plan.entry.sourcePath, err)
	}
	if legacyWorkDigest(current) != plan.digest {
		return migrationPathError(root, plan.entry.task.ID, plan.entry.sourcePath, fmt.Errorf("legacy file changed during migration; source retained"))
	}
	return nil
}

func existingWorkMigrationMarker(content string) (string, bool, error) {
	if !strings.Contains(content, workMigrationMarkerPrefix) && !strings.Contains(content, forgeWorkMigrationMarkerPrefix) {
		return "", false, nil
	}
	matches := workMigrationMarkerRE.FindAllStringSubmatch(content, -1)
	if len(matches) != 1 {
		return "", false, fmt.Errorf("malformed or duplicate work migration marker")
	}
	return matches[0][1], true, nil
}

func appendMigrationChapter(taskMD []byte, cleaned, digest, language string) []byte {
	result := append([]byte(nil), taskMD...)
	if len(result) > 0 && result[len(result)-1] != '\n' {
		result = append(result, '\n')
	}
	if len(result) > 0 && (len(result) < 2 || result[len(result)-2] != '\n') {
		result = append(result, '\n')
	}
	heading := "## Historical work record (migrated from work.md)"
	if language == languageSimplifiedChinese {
		heading = "## 历史工作记录（由 work.md 迁移）"
	}
	result = append(result, []byte(workMigrationMarker(digest)+"\n"+heading+"\n\n")...)
	result = append(result, []byte(cleaned)...)
	if len(result) == 0 || result[len(result)-1] != '\n' {
		result = append(result, '\n')
	}
	return result
}

func workMigrationMarker(digest string) string {
	return workMigrationMarkerPrefix + "source=work.md digest=" + digest + " -->"
}

func legacyWorkDigest(data []byte) string {
	digest := sha256.Sum256(data)
	return "sha256:" + hex.EncodeToString(digest[:])
}

func cleanLegacyWorkContent(content, taskID string) string {
	content = stripKnownLegacyWorkComments(content)
	content = strings.TrimSpace(content)
	normalized := strings.TrimSpace(strings.ReplaceAll(content, "\r\n", "\n"))
	placeholders := []string{
		fmt.Sprintf("# Work\n\n## Focus\n\nTask %s has been created. Clarify the task contract in task.md, then record the current execution state and next action here.", taskID),
		fmt.Sprintf("# 工作记录\n\n## 当前重点\n\n任务 %s 已创建。先在 task.md 中明确任务约定，再在此记录当前执行状态和下一步行动。", taskID),
	}
	for _, placeholder := range placeholders {
		if normalized == placeholder {
			return ""
		}
	}
	return content
}

func stripKnownLegacyWorkComments(content string) string {
	lines := strings.SplitAfter(content, "\n")
	known := make(map[string]struct{}, len(legacyWorkTemplateComments))
	for _, comment := range legacyWorkTemplateComments {
		known[normalizeLegacyWorkComment(comment)] = struct{}{}
	}
	var result strings.Builder
	inFence := false
	for i := 0; i < len(lines); {
		trimmed := strings.TrimSpace(strings.TrimSuffix(strings.TrimSuffix(lines[i], "\n"), "\r"))
		if !inFence && strings.HasPrefix(trimmed, "<!--") {
			end := i
			foundEnd := false
			for ; end < len(lines); end++ {
				endTrimmed := strings.TrimSpace(strings.TrimSuffix(strings.TrimSuffix(lines[end], "\n"), "\r"))
				if strings.HasSuffix(endTrimmed, "-->") {
					foundEnd = true
					break
				}
			}
			if foundEnd {
				var comment strings.Builder
				for line := i; line <= end; line++ {
					comment.WriteString(lines[line])
				}
				if _, ok := known[normalizeLegacyWorkComment(comment.String())]; ok {
					i = end + 1
					continue
				}
				for line := i; line <= end; line++ {
					result.WriteString(lines[line])
				}
				i = end + 1
				continue
			}
		}
		result.WriteString(lines[i])
		if isMarkdownFence(trimmed) {
			inFence = !inFence
		}
		i++
	}
	return result.String()
}

func normalizeLegacyWorkComment(content string) string {
	return strings.TrimSpace(strings.ReplaceAll(content, "\r\n", "\n"))
}

func isMarkdownFence(line string) bool {
	if strings.HasPrefix(line, "```") || strings.HasPrefix(line, "~~~") {
		return true
	}
	return false
}

func writeFileAtomically(path string, data []byte, mode os.FileMode) error {
	dir := filepath.Dir(path)
	tmp, err := os.CreateTemp(dir, ".pua-migrate-*.tmp")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	defer os.Remove(tmpPath)
	if err := tmp.Chmod(mode.Perm()); err != nil {
		_ = tmp.Close()
		return err
	}
	if _, err := tmp.Write(data); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Sync(); err != nil {
		_ = tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	if err := os.Rename(tmpPath, path); err != nil {
		return err
	}
	return syncDirectory(dir)
}

func migrationPathError(root, resourceID, path string, err error) error {
	if root == "" {
		root = filepath.Dir(path)
	}
	rel := relPath(root, path)
	detail := fmt.Errorf("resource %s path %s: %w", resourceIDOrUnknown(resourceID), rel, err)
	return &APIError{Operation: "migrate legacy work file", Kind: "task_migration", Workspace: root, ResourceID: resourceID, Path: rel, Err: detail}
}

func resourceIDOrUnknown(id string) string {
	if strings.TrimSpace(id) == "" {
		return "unknown"
	}
	return id
}
