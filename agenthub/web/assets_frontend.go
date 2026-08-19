//go:build embed_frontend

package web

import (
	"embed"
	"io/fs"
)

//go:embed static
var builtAssets embed.FS

// The release build must fail rather than ship without the generated AgentHub
// application entrypoint.
//
//go:embed static/index.html
var _ embed.FS

var Assets fs.FS = builtAssets
