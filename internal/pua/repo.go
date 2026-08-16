package pua

import (
	"fmt"
	"strings"
)

type repoAddOptions struct {
	name string
	url  string
	bare bool
}

func repoAdd(args []string) error {
	opts, err := parseRepoAdd(args)
	if err != nil {
		return err
	}
	return applicationRepoAdd(opts.name, opts.url, opts.bare)
}

func parseRepoAdd(args []string) (repoAddOptions, error) {
	opts := repoAddOptions{}
	for _, arg := range args {
		switch arg {
		case "--bare":
			opts.bare = true
		default:
			if strings.HasPrefix(arg, "--") {
				return repoAddOptions{}, fmt.Errorf("unknown repo add option %q", arg)
			}
			if opts.name == "" {
				opts.name = arg
			} else if opts.url == "" {
				opts.url = arg
			} else {
				return repoAddOptions{}, fmt.Errorf("unexpected positional argument %q", arg)
			}
		}
	}
	if opts.name == "" || opts.url == "" {
		return repoAddOptions{}, fmt.Errorf("usage: pua repo add [--bare] <name> <url>")
	}
	return opts, nil
}

func repoList() error {
	return applicationRepoList()
}
