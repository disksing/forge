package main

import (
	"fmt"
	"os"

	"github.com/disksing/forge/internal/forge"
)

func main() {
	if err := forge.Run(os.Args[1:]); err != nil {
		fmt.Fprintf(os.Stderr, "forge: %v\n", err)
		if exitErr, ok := err.(interface{ ExitCode() int }); ok {
			os.Exit(exitErr.ExitCode())
		}
		os.Exit(1)
	}
}
