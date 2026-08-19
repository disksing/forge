//go:build embed_frontend

package web

import (
	"embed"
)

//go:embed static
var builtAssets embed.FS

// The release build must fail rather than ship without the generated PUA
// application entrypoint.
//
//go:embed static/assets/pua-app.js
var _ embed.FS

var Assets AssetFS = builtAssets
