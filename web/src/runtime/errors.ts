export function errorMessage(error: unknown, fallback = "Unexpected error"): string {
	if (error instanceof Error && error.message) return error.message;
	if (error && typeof error === "object" && "message" in error) return String(error.message || fallback);
	return String(error || fallback);
}
