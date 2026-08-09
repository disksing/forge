package serve

import "path/filepath"

func frontendAssetPath(parts ...string) string {
	path := append([]string{"..", "..", "web", "static"}, parts...)
	return filepath.Join(path...)
}
