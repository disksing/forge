// Package web contains the embedded PUA web application assets.
package web

import "embed"

// Assets is the complete frontend asset tree used by the PUA server.
//
// The exported filesystem lets the server keep frontend files outside its
// implementation package while still shipping a single self-contained binary.
//
//go:embed static
var Assets embed.FS
