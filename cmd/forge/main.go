package main

import (
	"fmt"
	"os"

	"github.com/disksing/forge/internal/forge"
)

func main() {
	if err := forge.Run(os.Args[1:]); err != nil {
		fmt.Fprintf(os.Stderr, "forge: %v\n", err)
		os.Exit(1)
	}
}
