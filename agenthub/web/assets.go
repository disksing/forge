// Package web contains the embedded AgentHub web application assets.
package web

import "embed"

// Assets is the complete frontend asset tree used by both the standalone
// AgentHub binary and PUA's embedded AgentHub service.
//
//go:embed static
var Assets embed.FS

// A standard build generates the embedded entrypoint before compiling Go.
// Requiring it explicitly prevents shipping a binary with only the placeholder.
//
//go:embed static/index.html
var _ embed.FS
