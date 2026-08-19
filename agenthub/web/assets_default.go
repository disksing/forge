//go:build !embed_frontend

package web

import (
	"embed"
	"io/fs"
)

// Assets contains the source-controlled placeholder for ordinary Go builds
// and tests. Generated frontend assets are optional in this mode so a clean
// checkout can compile without Node.
//
//go:embed static
var defaultAssets embed.FS

var Assets fs.FS = defaultAssets
