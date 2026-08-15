package app

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

var scheduleIDPattern = regexp.MustCompile(`^schedule-[0-9a-f]{24}$`)

const (
	SchedulerResourceID         = "scheduler"
	schedulerDir                = "scheduler"
	schedulerJSONFile           = "scheduler.json"
	schedulerMarkdownFile       = "scheduler.md"
	schedulerSchemaVersion      = 1
	defaultSchedulerWakeMinutes = 30
	minimumSchedulerWakeMinutes = 1
	maximumSchedulerWakeMinutes = 7 * 24 * 60
	maximumScheduleTextLength   = 64 * 1024
)

// SchedulerConfig is the portable, Workspace-owned configuration and natural
// language schedule list for the special Scheduler resource.
type SchedulerConfig struct {
	SchemaVersion       int          `json:"schemaVersion"`
	AgentBinding        AgentBinding `json:"agentBinding"`
	WakeIntervalMinutes int          `json:"wakeIntervalMinutes"`
	Schedules           []Schedule   `json:"schedules"`
}

// Schedule deliberately contains no execution projection. The Scheduler Agent
// interprets Condition and keeps optional execution context in scheduler.md.
type Schedule struct {
	ID          string `json:"id"`
	Description string `json:"description"`
	Condition   string `json:"condition"`
	Target      string `json:"target"`
	CreatedAt   string `json:"createdAt"`
	UpdatedAt   string `json:"updatedAt"`
}

type CreateScheduleInput struct {
	Description string
	Condition   string
	Target      string
}

type UpdateScheduleInput struct {
	ID          string
	Description *string
	Condition   *string
	Target      *string
}

type SchedulerSettingsInput struct {
	AgentBinding        AgentBinding
	WakeIntervalMinutes int
}

func defaultSchedulerConfig() SchedulerConfig {
	return SchedulerConfig{
		SchemaVersion:       schedulerSchemaVersion,
		AgentBinding:        AgentBinding{Kind: "profile", Name: "default"},
		WakeIntervalMinutes: defaultSchedulerWakeMinutes,
		Schedules:           []Schedule{},
	}
}

func schedulerPath(root string) string {
	return filepath.Join(root, schedulerDir)
}

func schedulerJSONPath(root string) string {
	return filepath.Join(schedulerPath(root), schedulerJSONFile)
}

// IsSchedulerPath reports whether start is the Scheduler directory or one of
// its descendants. It is used only for CLI provenance/resource selection.
func (w *Workspace) IsSchedulerPath(start string) (bool, error) {
	if err := w.require(); err != nil {
		return false, err
	}
	start = strings.TrimSpace(start)
	if start == "" {
		return false, errors.New("selection start path is required")
	}
	abs, err := filepath.Abs(start)
	if err != nil {
		return false, err
	}
	info, err := os.Stat(abs)
	if err != nil {
		return false, err
	}
	if !info.IsDir() {
		abs = filepath.Dir(abs)
	}
	abs, err = filepath.EvalSymlinks(abs)
	if err != nil {
		return false, err
	}
	base, err := filepath.EvalSymlinks(schedulerPath(w.root))
	if err != nil {
		return false, err
	}
	rel, err := filepath.Rel(base, abs)
	if err != nil {
		return false, err
	}
	return rel == "." || (rel != ".." && !strings.HasPrefix(rel, ".."+string(filepath.Separator))), nil
}

// EnsureScheduler non-destructively creates or validates the Scheduler
// resource files and refreshes only the Forge-managed AGENTS.md block.
func (w *Workspace) EnsureScheduler() (SchedulerConfig, error) {
	if err := w.require(); err != nil {
		return SchedulerConfig{}, err
	}
	var result SchedulerConfig
	err := withWorkspaceMutationLock(w.root, func() error {
		cfg, err := readWorkspaceConfig(w.root)
		if err != nil {
			return err
		}
		result, err = ensureSchedulerLocked(w.root, cfg.Language)
		return err
	})
	if err != nil {
		return SchedulerConfig{}, &APIError{Operation: "ensure Scheduler", Kind: "scheduler", Workspace: w.root, Err: err}
	}
	return result, nil
}

func ensureSchedulerLocked(root, language string) (SchedulerConfig, error) {
	dir := schedulerPath(root)
	info, err := os.Lstat(dir)
	switch {
	case os.IsNotExist(err):
		if err := os.Mkdir(dir, 0o755); err != nil {
			return SchedulerConfig{}, err
		}
	case err != nil:
		return SchedulerConfig{}, err
	case info.Mode()&os.ModeSymlink != 0:
		return SchedulerConfig{}, fmt.Errorf("Scheduler path must not be a symbolic link: %s", dir)
	case !info.IsDir():
		return SchedulerConfig{}, fmt.Errorf("Scheduler path is not a directory: %s", dir)
	}

	jsonPath := schedulerJSONPath(root)
	if err := requireRegularOrMissing(jsonPath); err != nil {
		return SchedulerConfig{}, err
	}
	var config SchedulerConfig
	if _, err := os.Stat(jsonPath); os.IsNotExist(err) {
		config = defaultSchedulerConfig()
		if err := writeSchedulerJSON(jsonPath, config); err != nil {
			return SchedulerConfig{}, err
		}
	} else if err != nil {
		return SchedulerConfig{}, err
	} else {
		config, err = readSchedulerJSON(jsonPath)
		if err != nil {
			return SchedulerConfig{}, err
		}
	}

	markdownPath := filepath.Join(dir, schedulerMarkdownFile)
	if err := createTextFileIfMissing(markdownPath, defaultSchedulerMarkdown(language)); err != nil {
		return SchedulerConfig{}, err
	}
	agentsPath := filepath.Join(dir, "AGENTS.md")
	if err := requireRegularOrMissing(agentsPath); err != nil {
		return SchedulerConfig{}, err
	}
	if err := updateAgentsMDWithBlock(agentsPath, schedulerAgentsBlock(language)); err != nil {
		return SchedulerConfig{}, err
	}
	if err := syncDirectory(dir); err != nil {
		return SchedulerConfig{}, err
	}
	return config, nil
}

func requireRegularOrMissing(path string) error {
	info, err := os.Lstat(path)
	if os.IsNotExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if info.Mode()&os.ModeSymlink != 0 || !info.Mode().IsRegular() {
		return fmt.Errorf("Scheduler file must be a regular file: %s", path)
	}
	return nil
}

func createTextFileIfMissing(path, content string) error {
	if err := requireRegularOrMissing(path); err != nil {
		return err
	}
	file, err := os.OpenFile(path, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if os.IsExist(err) {
		return nil
	}
	if err != nil {
		return err
	}
	if _, err := io.WriteString(file, content); err != nil {
		file.Close()
		return err
	}
	if err := file.Sync(); err != nil {
		file.Close()
		return err
	}
	return file.Close()
}

func readSchedulerJSON(path string) (SchedulerConfig, error) {
	file, err := os.Open(path)
	if err != nil {
		return SchedulerConfig{}, err
	}
	defer file.Close()
	decoder := json.NewDecoder(file)
	decoder.DisallowUnknownFields()
	var config SchedulerConfig
	if err := decoder.Decode(&config); err != nil {
		return SchedulerConfig{}, fmt.Errorf("read Scheduler configuration: %w", err)
	}
	if err := ensureJSONEOF(decoder); err != nil {
		return SchedulerConfig{}, fmt.Errorf("read Scheduler configuration: %w", err)
	}
	if err := validateSchedulerConfig(config); err != nil {
		return SchedulerConfig{}, err
	}
	return config, nil
}

func ensureJSONEOF(decoder *json.Decoder) error {
	var extra any
	if err := decoder.Decode(&extra); err == io.EOF {
		return nil
	} else if err != nil {
		return err
	}
	return errors.New("unexpected data after JSON document")
}

func validateSchedulerConfig(config SchedulerConfig) error {
	if config.SchemaVersion != schedulerSchemaVersion {
		return fmt.Errorf("unsupported Scheduler schemaVersion %d; expected %d", config.SchemaVersion, schedulerSchemaVersion)
	}
	if _, err := NormalizeAgentBinding(config.AgentBinding); err != nil {
		return fmt.Errorf("invalid Scheduler agent binding: %w", err)
	}
	if config.WakeIntervalMinutes < minimumSchedulerWakeMinutes || config.WakeIntervalMinutes > maximumSchedulerWakeMinutes {
		return fmt.Errorf("Scheduler wake interval must be between %d and %d minutes", minimumSchedulerWakeMinutes, maximumSchedulerWakeMinutes)
	}
	seen := make(map[string]bool, len(config.Schedules))
	for _, schedule := range config.Schedules {
		if err := validateSchedule(schedule); err != nil {
			return fmt.Errorf("invalid schedule %q: %w", schedule.ID, err)
		}
		if seen[schedule.ID] {
			return fmt.Errorf("duplicate schedule id %q", schedule.ID)
		}
		seen[schedule.ID] = true
	}
	return nil
}

func validateSchedule(schedule Schedule) error {
	if !scheduleIDPattern.MatchString(schedule.ID) {
		return errors.New("id must be a stable schedule-* identifier")
	}
	for name, value := range map[string]string{
		"description": schedule.Description,
		"condition":   schedule.Condition,
		"target":      schedule.Target,
		"createdAt":   schedule.CreatedAt,
		"updatedAt":   schedule.UpdatedAt,
	} {
		value = strings.TrimSpace(value)
		if value == "" {
			return fmt.Errorf("%s is required", name)
		}
		if len(value) > maximumScheduleTextLength || strings.ContainsRune(value, '\x00') {
			return fmt.Errorf("%s is invalid", name)
		}
	}
	if _, err := time.Parse(time.RFC3339Nano, schedule.CreatedAt); err != nil {
		return errors.New("createdAt must be RFC3339")
	}
	if _, err := time.Parse(time.RFC3339Nano, schedule.UpdatedAt); err != nil {
		return errors.New("updatedAt must be RFC3339")
	}
	return nil
}

func writeSchedulerJSON(path string, config SchedulerConfig) error {
	if config.Schedules == nil {
		config.Schedules = []Schedule{}
	}
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}
	data = append(data, '\n')
	dir := filepath.Dir(path)
	tmp, err := os.CreateTemp(dir, ".scheduler-*.tmp")
	if err != nil {
		return err
	}
	tmpPath := tmp.Name()
	remove := true
	defer func() {
		if remove {
			_ = os.Remove(tmpPath)
		}
	}()
	if err := tmp.Chmod(0o644); err != nil {
		tmp.Close()
		return err
	}
	if _, err := tmp.Write(data); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Sync(); err != nil {
		tmp.Close()
		return err
	}
	if err := tmp.Close(); err != nil {
		return err
	}
	if err := os.Rename(tmpPath, path); err != nil {
		return err
	}
	remove = false
	return syncDirectory(dir)
}

// Scheduler returns the validated Scheduler configuration.
func (w *Workspace) Scheduler() (SchedulerConfig, error) {
	if err := w.require(); err != nil {
		return SchedulerConfig{}, err
	}
	config, err := readSchedulerJSON(schedulerJSONPath(w.root))
	if err != nil {
		return SchedulerConfig{}, &APIError{Operation: "read Scheduler", Kind: "scheduler", Workspace: w.root, Path: schedulerDir + "/" + schedulerJSONFile, Err: err}
	}
	return config, nil
}

func (w *Workspace) schedulerResourceDetail() (ResourceDetailView, error) {
	config, err := w.Scheduler()
	if err != nil {
		return ResourceDetailView{}, err
	}
	dir := schedulerPath(w.root)
	info, err := os.Stat(schedulerJSONPath(w.root))
	if err != nil {
		return ResourceDetailView{}, &APIError{Operation: "read Scheduler detail", Kind: "scheduler", Workspace: w.root, Err: err}
	}
	timestamp := info.ModTime().Format(time.RFC3339)
	files := make([]ResourceFile, 0, 2)
	for _, name := range []string{schedulerMarkdownFile, "AGENTS.md"} {
		path := filepath.Join(dir, name)
		data, readErr := os.ReadFile(path)
		if readErr != nil {
			continue
		}
		files = append(files, ResourceFile{Name: name, Path: relPath(w.root, path), Content: string(data), ContentHash: markdownContentHash(data)})
	}
	return ResourceDetailView{
		ID: SchedulerResourceID, Type: SchedulerResourceID, Title: "Scheduler",
		CreatedAt: timestamp, UpdatedAt: timestamp, Path: schedulerDir,
		AgentBinding: config.AgentBinding, Files: files,
		Artifacts: []FileTreeEntry{}, Worktrees: []FileTreeEntry{}, Scheduler: &config,
	}, nil
}

func (w *Workspace) AddSchedule(input CreateScheduleInput) (Schedule, error) {
	if err := w.require(); err != nil {
		return Schedule{}, err
	}
	var created Schedule
	err := withWorkspaceMutationLock(w.root, func() error {
		config, err := readSchedulerJSON(schedulerJSONPath(w.root))
		if err != nil {
			return err
		}
		description, condition, target, err := w.normalizeScheduleFields(input.Description, input.Condition, input.Target)
		if err != nil {
			return err
		}
		id, err := newScheduleID()
		if err != nil {
			return err
		}
		now := time.Now().Format(time.RFC3339Nano)
		created = Schedule{ID: id, Description: description, Condition: condition, Target: target, CreatedAt: now, UpdatedAt: now}
		config.Schedules = append(config.Schedules, created)
		return writeSchedulerJSON(schedulerJSONPath(w.root), config)
	})
	if err != nil {
		return Schedule{}, &APIError{Operation: "add schedule", Kind: "scheduler", Workspace: w.root, Err: err}
	}
	return created, nil
}

func (w *Workspace) UpdateSchedule(input UpdateScheduleInput) (Schedule, error) {
	if err := w.require(); err != nil {
		return Schedule{}, err
	}
	input.ID = strings.TrimSpace(input.ID)
	if input.ID == "" || (input.Description == nil && input.Condition == nil && input.Target == nil) {
		return Schedule{}, &APIError{Operation: "update schedule", Kind: "scheduler", Workspace: w.root, Err: errors.New("schedule id and at least one updated field are required")}
	}
	var updated Schedule
	err := withWorkspaceMutationLock(w.root, func() error {
		config, err := readSchedulerJSON(schedulerJSONPath(w.root))
		if err != nil {
			return err
		}
		index := scheduleIndex(config.Schedules, input.ID)
		if index < 0 {
			return fmt.Errorf("schedule not found: %s", input.ID)
		}
		updated = config.Schedules[index]
		description, condition, target := updated.Description, updated.Condition, updated.Target
		if input.Description != nil {
			description = *input.Description
		}
		if input.Condition != nil {
			condition = *input.Condition
		}
		if input.Target != nil {
			target = *input.Target
		}
		description, condition, target, err = w.normalizeScheduleFields(description, condition, target)
		if err != nil {
			return err
		}
		updated.Description, updated.Condition, updated.Target = description, condition, target
		updated.UpdatedAt = time.Now().Format(time.RFC3339Nano)
		config.Schedules[index] = updated
		return writeSchedulerJSON(schedulerJSONPath(w.root), config)
	})
	if err != nil {
		return Schedule{}, &APIError{Operation: "update schedule", Kind: "scheduler", Workspace: w.root, Err: err}
	}
	return updated, nil
}

func (w *Workspace) RemoveSchedule(id string) (Schedule, error) {
	if err := w.require(); err != nil {
		return Schedule{}, err
	}
	id = strings.TrimSpace(id)
	var removed Schedule
	err := withWorkspaceMutationLock(w.root, func() error {
		config, err := readSchedulerJSON(schedulerJSONPath(w.root))
		if err != nil {
			return err
		}
		index := scheduleIndex(config.Schedules, id)
		if index < 0 {
			return fmt.Errorf("schedule not found: %s", id)
		}
		removed = config.Schedules[index]
		config.Schedules = append(config.Schedules[:index], config.Schedules[index+1:]...)
		return writeSchedulerJSON(schedulerJSONPath(w.root), config)
	})
	if err != nil {
		return Schedule{}, &APIError{Operation: "remove schedule", Kind: "scheduler", Workspace: w.root, Err: err}
	}
	return removed, nil
}

func (w *Workspace) SetSchedulerSettings(input SchedulerSettingsInput) (SchedulerConfig, error) {
	if err := w.require(); err != nil {
		return SchedulerConfig{}, err
	}
	binding, err := NormalizeAgentBinding(input.AgentBinding)
	if err != nil {
		return SchedulerConfig{}, err
	}
	if input.WakeIntervalMinutes < minimumSchedulerWakeMinutes || input.WakeIntervalMinutes > maximumSchedulerWakeMinutes {
		return SchedulerConfig{}, fmt.Errorf("Scheduler wake interval must be between %d and %d minutes", minimumSchedulerWakeMinutes, maximumSchedulerWakeMinutes)
	}
	var result SchedulerConfig
	err = withWorkspaceMutationLock(w.root, func() error {
		config, err := readSchedulerJSON(schedulerJSONPath(w.root))
		if err != nil {
			return err
		}
		config.AgentBinding = binding
		config.WakeIntervalMinutes = input.WakeIntervalMinutes
		if err := writeSchedulerJSON(schedulerJSONPath(w.root), config); err != nil {
			return err
		}
		result = config
		return nil
	})
	return result, err
}

func (w *Workspace) normalizeScheduleFields(description, condition, target string) (string, string, string, error) {
	description = strings.TrimSpace(description)
	condition = strings.TrimSpace(condition)
	target = strings.TrimSpace(target)
	if description == "" || condition == "" || target == "" {
		return "", "", "", errors.New("description, condition, and target are required")
	}
	if len(description) > maximumScheduleTextLength || len(condition) > maximumScheduleTextLength || len(target) > 200 ||
		strings.ContainsRune(description, '\x00') || strings.ContainsRune(condition, '\x00') || strings.ContainsRune(target, '\x00') {
		return "", "", "", errors.New("schedule field is invalid")
	}
	if target != "workspace" && target != SchedulerResourceID {
		if _, _, err := loadOpenResource(w.root, target); err != nil {
			return "", "", "", fmt.Errorf("target must be an open resource in the current Workspace: %w", err)
		}
	}
	return description, condition, target, nil
}

func scheduleIndex(schedules []Schedule, id string) int {
	for index := range schedules {
		if schedules[index].ID == id {
			return index
		}
	}
	return -1
}

func newScheduleID() (string, error) {
	var value [12]byte
	if _, err := rand.Read(value[:]); err != nil {
		return "", err
	}
	return "schedule-" + hex.EncodeToString(value[:]), nil
}

func defaultSchedulerMarkdown(language string) string {
	if language == languageSimplifiedChinese {
		return "# Scheduler 上下文\n\n由 Scheduler Agent 维护后续调度判断所需的最小上下文，不作为长期历史记录。具体调度项保存在 scheduler.json 中，并通过 Forge CLI 修改。\n"
	}
	return "# Scheduler Context\n\nMaintained by the Scheduler Agent as the minimum context needed for future scheduling decisions, not as long-term history. Schedules live in scheduler.json and are changed through the Forge CLI.\n"
}

func schedulerAgentsBlock(language string) string {
	return forgePromptStart + "\n" + schedulerAgentsPrompt(language) + "\n" + forgePromptEnd
}

func schedulerAgentsPrompt(language string) string {
	if language == languageSimplifiedChinese {
		return `# Scheduler Agent 指引

你正在 AgentWorkspace 的特殊 Scheduler 资源目录中工作。

- 总是读取 workspace 根目录的 AGENTS.md（../AGENTS.md）、scheduler.json 和 scheduler.md。
- 将 scheduler/ 视为当前资源边界；Workspace 其他资源只读，不得修改其他 Agent 管理的文件。
- scheduler.json 是 Forge 管理的结构化调度项列表。必须使用 forge scheduler list/show/add/update/remove 修改，不得直接覆写。
- scheduler.md 只用于维护完成后续调度判断所需的最小上下文。不要把它当作长期历史；仅在会影响后续判断时保留上次检查、触发、补跑、重复或时区信息，并及时删除已不再必要的内容。
- 每个 schedule 的 condition 是自然语言。结合当前时间、环境、资源状态和 scheduler.md 判断是否满足。
- 条件满足时，使用普通 forge message send 向 schedule.target 发送消息。消息至少包含 schedule ID、description 和本次判断满足条件的原因。
- 消息允许重复；接收 Agent 负责结合 schedule ID 自行判断。发送前重新读取 scheduler.json，尽量避免执行已经删除的调度项。
- 一次性调度触发后通常删除；重复调度通常保留。根据 description 和 condition 具体判断，不使用固定 cron、occurrence 或结果协议。
- 调度项结构化变化是允许的跨资源操作，不授予你写入目标资源文件的权限。
`
	}
	return `# Scheduler Agent Instructions

You are working in the special Scheduler resource directory of an AgentWorkspace.

- Always read the workspace root AGENTS.md (../AGENTS.md), scheduler.json, and scheduler.md.
- Treat scheduler/ as the current resource boundary. Other Workspace resources are read-only; do not modify files managed by other agents.
- scheduler.json is the Forge-managed structured schedule list. Use forge scheduler list/show/add/update/remove and never overwrite it directly.
- Use scheduler.md only for the minimum context needed to make future scheduling decisions. Do not keep it as long-term history; retain prior checks, triggers, catch-up, repetition, or timezone details only while they affect future decisions, and remove them when no longer needed.
- Each schedule condition is natural language. Judge it using the current time, environment, resource state, and scheduler.md.
- When a condition is satisfied, use ordinary forge message send to schedule.target. Include at least the schedule id, description, and why the condition is satisfied.
- Messages may repeat; the receiving Agent uses the schedule id to decide. Re-read scheduler.json before sending to avoid acting on a removed schedule when practical.
- Usually remove one-time schedules after triggering and retain repeating schedules. Decide from description and condition; there is no fixed cron, occurrence, or result protocol.
- Structured schedule mutation is an allowed cross-resource operation and does not grant write access to the target resource files.
`
}
