//go:build !embed_frontend

package web

import (
	"embed"
	"io/fs"
)

// Assets contains the source-controlled static skeleton for ordinary Go
// builds and tests. Generated frontend assets are optional in this mode so a
// clean checkout can compile without Node.
//
//go:embed static fallback
var defaultAssets embed.FS

type fallbackAssetFS struct {
	primary  embed.FS
	fallback fs.FS
}

func (f fallbackAssetFS) Open(name string) (fs.File, error) {
	file, err := f.primary.Open(name)
	if err == nil {
		return file, nil
	}
	return f.fallback.Open(name)
}

func (f fallbackAssetFS) ReadFile(name string) ([]byte, error) {
	data, err := f.primary.ReadFile(name)
	if err == nil {
		return data, nil
	}
	return fs.ReadFile(f.fallback, name)
}

func defaultFallbackAssets() fs.FS {
	assets, err := fs.Sub(defaultAssets, "fallback")
	if err != nil {
		panic(err)
	}
	return assets
}

var Assets AssetFS = fallbackAssetFS{primary: defaultAssets, fallback: defaultFallbackAssets()}
