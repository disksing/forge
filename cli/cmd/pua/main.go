package main

import (
	"fmt"
	"os"

	"github.com/disksing/pua/internal/pua"
)

func main() {
	if err := pua.Run(os.Args[1:]); err != nil {
		fmt.Fprintf(os.Stderr, "pua: %v\n", err)
		if exitErr, ok := err.(interface{ ExitCode() int }); ok {
			os.Exit(exitErr.ExitCode())
		}
		os.Exit(1)
	}
}
