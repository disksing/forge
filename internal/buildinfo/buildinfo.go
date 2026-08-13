package buildinfo

import (
	"fmt"
	"runtime/debug"
	"strings"
)

// Branch and SHA are intended to be set by release builds via -ldflags.
var (
	Branch = "unknown"
	SHA    = "unknown"
)

type Info struct {
	Branch string
	SHA    string
}

func Current() Info {
	info := Info{
		Branch: clean(Branch),
		SHA:    clean(SHA),
	}
	if info.SHA == "unknown" {
		if revision := vcsRevision(); revision != "" {
			info.SHA = revision
		}
	}
	return info
}

func Text(program string) string {
	info := Current()
	return fmt.Sprintf("%s branch=%s sha=%s\n", program, info.Branch, info.SHA)
}

func clean(value string) string {
	value = strings.TrimSpace(value)
	if value == "" {
		return "unknown"
	}
	return value
}

func vcsRevision() string {
	build, ok := debug.ReadBuildInfo()
	if !ok {
		return ""
	}
	for _, setting := range build.Settings {
		if setting.Key == "vcs.revision" {
			return strings.TrimSpace(setting.Value)
		}
	}
	return ""
}
