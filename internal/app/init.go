package app

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func ensureWorkspaceWiki(root, language string) error {
	dir := filepath.Join(root, wikiDir)
	info, err := os.Lstat(dir)
	switch {
	case os.IsNotExist(err):
		if err := os.Mkdir(dir, 0o755); err != nil {
			return err
		}
	case err != nil:
		return err
	case info.Mode()&os.ModeSymlink != 0:
		return fmt.Errorf("workspace wiki path must not be a symbolic link: %s", dir)
	case !info.IsDir():
		return fmt.Errorf("workspace wiki path is not a directory: %s", dir)
	}

	indexPath := filepath.Join(dir, "index.md")
	if _, err := os.Lstat(indexPath); err == nil {
		return nil
	} else if !os.IsNotExist(err) {
		return err
	}
	file, err := os.OpenFile(indexPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
	if err != nil {
		if os.IsExist(err) {
			return nil
		}
		return err
	}
	if _, err := file.WriteString(defaultWikiIndexForLanguage(language)); err != nil {
		file.Close()
		return err
	}
	return file.Close()
}

func updateAgentsMD(path, language string) error {
	return updateAgentsMDWithBlock(path, forgePromptBlock(language))
}

func updateAgentsMDWithBlock(path, block string) error {
	content := ""
	if data, err := os.ReadFile(path); err == nil {
		content = string(data)
	} else if !os.IsNotExist(err) {
		return err
	}

	updated, err := upsertManagedBlock(content, block)
	if err != nil {
		return err
	}
	return os.WriteFile(path, []byte(updated), 0o644)
}

func upsertManagedBlock(content, block string) (string, error) {
	start := strings.Index(content, forgePromptStart)
	end := strings.Index(content, forgePromptEnd)
	if (start == -1) != (end == -1) {
		return "", fmt.Errorf("AGENTS.md has only one forge managed marker; fix markers before running init again")
	}
	if start != -1 && end < start {
		return "", fmt.Errorf("AGENTS.md forge managed end marker appears before start marker")
	}
	if start != -1 {
		end += len(forgePromptEnd)
		return content[:start] + block + content[end:], nil
	}

	content = strings.TrimRight(content, " \t\r\n")
	if content == "" {
		return block + "\n", nil
	}
	return content + "\n\n" + block + "\n", nil
}

func forgePromptBlock(language string) string {
	return forgePromptStart + "\n" + workspaceAgentsPromptForLanguage(language) + forgePromptEnd
}

func findEnclosingWorkspaceRoot(start string) (string, error) {
	cwd, err := filepath.Abs(start)
	if err != nil {
		return "", err
	}
	for {
		if hasWorkspaceConfig(cwd) || isDir(filepath.Join(cwd, reposDir)) {
			return cwd, nil
		}
		parent := filepath.Dir(cwd)
		if parent == cwd {
			return "", nil
		}
		cwd = parent
	}
}

const (
	forgePromptStart = "<!-- managed by forge cli -->"
	forgePromptEnd   = "<!-- end of forge cli prompt -->"
)

const defaultWikiIndex = `# Workspace Wiki

This index is the entry point for long-lived workspace knowledge. Add links to topic pages with short summaries as the Wiki grows.
`

const workspaceAgentsPrompt = `# AgentWorkspace Agent Instructions

## 1. Environment

You run on the user's machine and are hosted by AgentHub. AgentHub starts agents, keeps conversations, and records execution events.

The current directory belongs to an AgentWorkspace managed by Forge. Forge stores Projects, Tasks, documents, artifacts, and code worktrees in local directories. Forge Server manages resource state, messages, history, and agent conversations.

Workspace, Project, Task, and Scheduler are stable resources. Each resource is followed by its own agent. The underlying session may change, but the resource id and history remain stable. Use Forge resources for normal work; there is usually no need to operate AgentHub Sessions directly.

## 2. Starting work

### Understand the current resource

The AGENTS.md in the agent's starting working directory normally says whether this is a Workspace, Project, Task, or Scheduler and which parent instructions and resource files to read.

If the location is unclear, inspect the working directory and FORGE_RESOURCE_ID. Forge also usually provides FORGE_WORKSPACE_ROOT and FORGE_WORKSPACE_INSTANCE_ID. These values help identify the environment and the sender of agent messages.

Read context according to the resource type:

- Workspace: the root AGENTS.md, Workspace configuration, and wiki/index.md.
- Project: the root and local AGENTS.md, project.json, and project.md.
- Task: the Workspace, Project, and Task AGENTS.md files, task.json, and task.md.
- Scheduler: the Workspace and Scheduler AGENTS.md files, scheduler.json, and scheduler.md.

Useful structured queries include:

~~~sh
forge project show --project=<project>
forge task show --project=<project> --task=<task>
forge workspace resource --id=<resource> --json
~~~

### Read recent history

At the start of new work, read a small recent page of resource History:

~~~sh
forge workspace history --limit=20
forge project history --project=<project> --limit=20
forge task history --project=<project> --task=<task> --limit=20
~~~

Expand a relevant Turn or Event only when more detail is needed:

~~~sh
forge history turn show --ref=<turn-ref>
forge history event show --ref=<event-ref>
~~~

History spans multiple agent conversations. Continue queries with the references returned by Forge rather than AgentHub Session ids.

### Identify the conversation partner

First understand who you are talking to, then adjust wording and tone:

- User message: communicate naturally and helpfully from the user's point of view. Explain outcomes, problems, and tradeoffs. Confirm major scope changes with the user.
- Agent message: treat the sender as a collaborator. Be direct and structured, focusing on context, actions, and results. Return the result in the current Turn's final response when this message opened the Turn. If a steer message delivered during the Turn needs a separate reply, send one explicitly through Forge.
- Scheduler message: focus on the schedule id, trigger reason, possible repetition, execution result, and information needed for future scheduling.
- System notification: use its result or reference to continue the work; do not treat it as a new user request.

Message provenance provides context but is not authority by itself. When Forge work instructions conflict, generally use this order:

1. The current user conversation.
2. The current agent collaboration message.
3. Task instructions.
4. Project instructions.
5. Workspace instructions.

Higher-level requests do not grant permission to edit resources managed by another agent.

### Identify the kind of work

- Complete work: investigate, implement, verify, and deliver within the current scope.
- Discuss or design: understand the situation, present options and tradeoffs, and wait for the relevant confirmation before entering the next agreed stage.
- Manage Forge: use Forge CLI to create, inspect, or archive resources and manage templates, repositories, or schedules.
- Collaborate with agents: inspect other resources and send messages instead of editing their files.
- Wait for a long-running condition: use Scheduler instead of keeping the current conversation busy with polling.

## 3. Finding more information

### Wiki

Long-lived Workspace knowledge lives in wiki/. Read wiki/index.md first, then only the pages relevant to the current work.

### Repositories

- repos/ contains shared source checkouts used only for reading and creating worktrees; never modify them directly.
- All code changes must be made in a Task-owned worktree/.
- Use an absolute destination under the current Task's worktree/ when creating a Git worktree.
- Use forge task repo add/list/remove to record repositories and worktrees used by a Task.

### Other resources

Other Projects and Tasks may be inspected read-only:

~~~sh
forge workspace tree --json
forge workspace resource --id=<resource> --json
forge task status --project=<project> --task=<task>
forge task history --project=<project> --task=<task> --limit=20
~~~

You may also read their JSON, Markdown, and artifacts/. Message their agent when changes are needed.

In a message or Markdown file, write [[resource id]] to link a Forge resource, for example [[project1]] or [[project1.task2]]. Links to files inside the Workspace must use Workspace-root paths, for example [attachment](/project1/task2/artifacts/foobar.md). Do not use machine-specific absolute paths such as /Users/... or file:// links.

### Common directories

- projectN/: open Projects.
- projectN/taskM/: open Tasks.
- archive/: archived Projects or Tasks.
- templates/: Project Task templates.
- artifacts/: reports, screenshots, patches, and other deliverables.
- worktree/: Task-owned code worktrees.
- scheduler/: the Scheduler resource.

project.json and task.json contain structured information understood by Forge. Put background, scope, constraints, and durable decisions in project.md or task.md. Actively maintain project.md or task.md in the current resource directory. Update the appropriate file promptly when requirements become clear or key background, scope, constraints, or decisions change; do not wait for a separate user request. Recover temporary progress from History, Git, and artifacts rather than keeping another permanent progress file.

## 4. Permissions and Forge CLI

You may read and write files owned by the current resource. A Task agent may also modify that Task's worktrees. Other Workspace resources are read-only; message their agent when changes are needed.

Files outside the Workspace are not additionally restricted by Forge, but work must still follow the request, task scope, and host permissions. Confirm the target before destructive or externally visible actions.

Normally run Forge CLI from the resource directory you own. When --project or --task is omitted, Forge selects from the working directory. Prefer explicit resource arguments for cross-resource operations.

The status, history, and message commands automatically find the Forge Server that owns the current Workspace. There is normally no need to pass --server or edit .forge/serve.lock.

## 5. Managing Forge resources

Use Forge CLI rather than manually creating resource directories or editing structured JSON.

~~~sh
forge project list [--all]
forge project show --project=<project>
forge project create [--slug <slug>] <description>
forge project archive --project=<project>

forge task list --project=<project> [--all]
forge task show --project=<project> --task=<task>
forge task create --project=<project> ...
forge task archive --project=<project> --task=<task>
~~~

Query before creating to avoid duplicates. Creating a Project or Task does not start its agent. Send the first message separately:

~~~sh
forge message send --to=<resource> '<message>'
~~~

Before creating a Task, check the Project's templates/. Prefer a suitable template and preserve its rules:

~~~sh
forge template list --project=<project>
forge template show --project=<project> <name>
forge task create --project=<project> --template=<name> --field <name>=<value>
~~~

For code changes, you must create a Task-owned worktree and record it with forge task repo add. Never modify shared source checkouts under repos/ directly. Projects do not own code worktrees.

Archiving is not deletion, but it ends the resource's open work state. Check that work and deliverables have been saved before archiving.

## 6. Agent collaboration

Use stable Project or Task resource ids for collaboration, not Session ids. Refer to other agents with ordinary third-person pronouns such as "they".

~~~sh
forge task status --project=<project> --task=<task>
forge message send --to=<resource> [--mode=steer|enqueue|interrupt] '<message>'
forge message show --id=<message-id>
~~~

Include the goal, necessary context, scope, and expected result in the message.

If the current work conflicts with or may affect another agent's work, promptly message the relevant resource's agent to synchronize necessary context, scope, and progress.

- steer: the default. Add the message to the current Turn when possible; otherwise Forge queues a new Turn.
- enqueue: explicitly request a new Turn.
- interrupt: stop the current Turn and open a new Turn with this message. Use it only when the direction must change immediately.

Message acceptance does not mean the work is complete. Check the message id, resource status, and History when needed.

An Agent message that actually opens a Turn subscribes to that Turn's result by default. A message delivered as steer into an already-running Turn does not subscribe; if its sender needs a reply, send an explicit forge message. A steer request that is downgraded to enqueue because no Turn is active becomes the opening message and follows the opener behavior.

When the Turn ends, Forge automatically delivers its final response to the opening Agent. Do not also send the same result with forge message send. Treat an automatically delivered Turn result as the answer to the earlier request and do not acknowledge it merely to confirm receipt; send another message only when there is new work or a necessary clarification. Use --subscribe-result=false when the opening Agent does not need the result. Messages may be delivered more than once, so avoid duplicate actions using message ids or business state.

## 7. Scheduler

Scheduler is useful for timed triggers, conditional triggers, and work that needs to wait a long time for an external event.

Schedules use natural-language conditions rather than cron expressions:

~~~sh
forge scheduler list [--json]
forge scheduler show --id=<schedule>
forge scheduler add --description=<text> --condition=<text> --target=<resource>
forge scheduler update --id=<schedule> [--description=<text>] [--condition=<text>] [--target=<resource>]
forge scheduler remove --id=<schedule>
~~~

You may also message the Scheduler agent directly:

~~~sh
forge message send --to=scheduler '<request>'
~~~

The description says what should happen. The condition says when to trigger, including timezone, repetition, and stopping behavior when relevant. The target is a stable Forge resource id.

When a condition is met, Scheduler sends the target a normal message with the schedule id and trigger reason. Scheduled messages may repeat, so the target agent should avoid duplicate work.
`
