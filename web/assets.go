// Package web contains the embedded PUA web application assets.
package web

import "io/fs"

// AssetFS is the filesystem contract used by the server and its static asset
// tests. embed.FS implements both methods.
type AssetFS interface {
	fs.FS
	ReadFile(name string) ([]byte, error)
}
