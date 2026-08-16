package serve

import (
	"fmt"
	"os"
	"strings"
)

func environmentOverride(primary, legacy string) (string, error) {
	primaryValue := strings.TrimSpace(os.Getenv(primary))
	legacyValue := strings.TrimSpace(os.Getenv(legacy))
	if primaryValue != "" && legacyValue != "" && primaryValue != legacyValue {
		return "", fmt.Errorf("%s and legacy %s are both set to different values", primary, legacy)
	}
	if primaryValue != "" {
		return primaryValue, nil
	}
	return legacyValue, nil
}
