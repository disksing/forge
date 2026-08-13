package serve

import "path/filepath"

func frontendSourcePath(parts ...string) string {
	path := append([]string{"..", "..", "web"}, parts...)
	return filepath.Join(path...)
}
