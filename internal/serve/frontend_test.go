package serve

import "path/filepath"

func frontendAssetPath(parts ...string) string {
	path := append([]string{"..", "..", "web", "static"}, parts...)
	return filepath.Join(path...)
}

func frontendSourcePath(parts ...string) string {
	path := append([]string{"..", "..", "web"}, parts...)
	return filepath.Join(path...)
}
