const THEME_PREFERENCE_KEY = "pua.web.themePreference";

export interface ThemeOption {
	id: string;
	label: string;
	description: string;
}

export const DEFAULT_THEME_ID = "default";

// Theme registry. Each theme is a set of CSS overrides scoped under
// `body[data-theme="<id>"]`; the default theme is the unmodified baseline and
// intentionally ships no overrides. Add new themes here plus a matching
// stylesheet block (see web/src/styles/tokens.css for the token contract).
const THEME_OPTIONS: readonly ThemeOption[] = Object.freeze([
	{ id: DEFAULT_THEME_ID, label: "Default", description: "Minimal light surfaces with a restrained blue accent" },
	{ id: "slate", label: "Slate", description: "The original PUA look: dark slate sidebar, red accent" },
	{ id: "riso", label: "Riso", description: "Risograph print: spot inks, grain and stencil edges" }
]);

export function themeOptions(): ThemeOption[] {
	return [...THEME_OPTIONS];
}

export function normalizeThemePreference(value: unknown): string {
	return THEME_OPTIONS.some((option) => option.id === value) ? value as string : DEFAULT_THEME_ID;
}

export function readStoredThemePreference(storage: Storage | null): string {
	try {
		return normalizeThemePreference(storage?.getItem(THEME_PREFERENCE_KEY));
	} catch (_) {
		return DEFAULT_THEME_ID;
	}
}

export function applyThemePreference(theme: string, target: HTMLElement | null = typeof document !== "undefined" ? document.body : null): void {
	if (target) target.dataset.theme = normalizeThemePreference(theme);
}

export function createThemeController(onChange: () => void, storage: Storage | null = typeof window !== "undefined" ? window.localStorage : null) {
	let theme = DEFAULT_THEME_ID;

	function initialize(): void {
		theme = readStoredThemePreference(storage);
		applyThemePreference(theme);
	}

	function setTheme(next: unknown): void {
		theme = normalizeThemePreference(next);
		try {
			storage?.setItem(THEME_PREFERENCE_KEY, theme);
		} catch (_) {}
		applyThemePreference(theme);
		onChange();
	}

	return {
		initialize,
		setTheme,
		theme: () => theme,
		options: themeOptions
	};
}
