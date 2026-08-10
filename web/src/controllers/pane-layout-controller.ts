const PANE_SIZE_KEY = "forge.gui.paneSizes";
const MOBILE_IMMERSIVE_KEY = "forge.gui.mobileImmersive";
const PANE_HANDLE_WIDTH = 8;
const SIDEBAR_MIN_WIDTH = 220;
const DETAILS_MIN_WIDTH = 360;
const CHAT_MIN_WIDTH = 320;
const PANE_MAX_SIZE = 10_000;

export interface PaneSizes {
	sidebarWidth: number;
	chatWidth: number;
	sidebarSessionHeight: number;
}

export interface MobilePaneState {
	sidebarOpen: boolean;
	view: "details" | "chat";
	immersive: boolean;
}

export type PaneName = keyof PaneSizes;

const PANE_DEFAULTS: PaneSizes = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarSessionHeight: 210
});

const PANE_CSS_VARIABLES: Record<PaneName, string> = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarSessionHeight: "--sidebar-session-height"
});

function clamp(value: number, min: number, max: number): number {
	return Math.min(max, Math.max(min, value));
}

function finiteSize(value: unknown): value is number {
	return typeof value === "number" && Number.isFinite(value);
}

export function normalizePaneSizes(raw: unknown, availableWorkspaceWidth = 0): PaneSizes {
	const source = raw && typeof raw === "object" ? raw as Partial<PaneSizes> & { detailsWidth?: unknown } : {};
	const sizes = { ...PANE_DEFAULTS };
	if (finiteSize(source.sidebarWidth)) sizes.sidebarWidth = clamp(source.sidebarWidth, SIDEBAR_MIN_WIDTH, PANE_MAX_SIZE);
	if (finiteSize(source.chatWidth)) sizes.chatWidth = clamp(source.chatWidth, CHAT_MIN_WIDTH, PANE_MAX_SIZE);
	else if (finiteSize(source.detailsWidth) && availableWorkspaceWidth >= 688) {
		const detailsWidth = clamp(source.detailsWidth, DETAILS_MIN_WIDTH, availableWorkspaceWidth - PANE_HANDLE_WIDTH - CHAT_MIN_WIDTH);
		sizes.chatWidth = clamp(availableWorkspaceWidth - PANE_HANDLE_WIDTH - detailsWidth, CHAT_MIN_WIDTH, PANE_MAX_SIZE);
	}
	if (finiteSize(source.sidebarSessionHeight)) sizes.sidebarSessionHeight = clamp(source.sidebarSessionHeight, 84, PANE_MAX_SIZE);
	return sizes;
}

export function createPaneLayoutController(onChange: () => void, storage: Storage | null = window.localStorage) {
	let paneSizes = { ...PANE_DEFAULTS };
	let mobile: MobilePaneState = { sidebarOpen: false, view: "details", immersive: false };
	const mobileQuery = window.matchMedia("(max-width: 980px)");

	function readStoredPaneSizes(): Record<string, unknown> {
		if (!storage) return {};
		try {
			const saved = JSON.parse(storage.getItem(PANE_SIZE_KEY) || "{}");
			return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
		} catch (_) {
			return {};
		}
	}

	function workspacePanelWidth(): number {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}

	function setCSSPixels(name: string, value: number): void {
		document.documentElement.style.setProperty(name, `${Math.round(value)}px`);
	}

	function setPaneSize(name: string, value: number): void {
		if (!Object.hasOwn(PANE_CSS_VARIABLES, name) || !Number.isFinite(value)) return;
		const paneName = name as PaneName;
		const minimum = paneName === "sidebarWidth" ? SIDEBAR_MIN_WIDTH : paneName === "chatWidth" ? CHAT_MIN_WIDTH : 84;
		const next = Math.round(clamp(value, minimum, PANE_MAX_SIZE));
		paneSizes[paneName] = next;
		setCSSPixels(PANE_CSS_VARIABLES[paneName], next);
	}

	function applyPaneSizes(): void {
		for (const name of Object.keys(PANE_CSS_VARIABLES) as PaneName[]) setPaneSize(name, paneSizes[name]);
	}

	function saveAllPaneSizes(): void {
		storage?.setItem(PANE_SIZE_KEY, JSON.stringify(paneSizes));
	}

	function initialize(): void {
		const raw = readStoredPaneSizes();
		paneSizes = normalizePaneSizes(raw, 0);
		applyPaneSizes();
		if (finiteSize(raw.detailsWidth) && !finiteSize(raw.chatWidth) && !mobileQuery.matches) {
			paneSizes = normalizePaneSizes(raw, workspacePanelWidth());
			applyPaneSizes();
			saveAllPaneSizes();
		}
		try {
			mobile.immersive = storage?.getItem(MOBILE_IMMERSIVE_KEY) === "1";
		} catch (_) {
			mobile.immersive = false;
		}
		document.body.classList.toggle("chat-immersive", mobile.immersive);
	}

	function commitPane(name: string): void {
		if (!Object.hasOwn(PANE_CSS_VARIABLES, name) || !storage) return;
		const paneName = name as PaneName;
		const saved = readStoredPaneSizes();
		delete saved.detailsWidth;
		for (const candidate of Object.keys(PANE_CSS_VARIABLES) as PaneName[]) {
			if (!finiteSize(saved[candidate])) saved[candidate] = paneSizes[candidate];
		}
		saved[paneName] = paneSizes[paneName];
		storage.setItem(PANE_SIZE_KEY, JSON.stringify(saved));
	}

	function syncViewport(): void {
		if (mobileQuery.matches) return;
		const raw = readStoredPaneSizes();
		if (!finiteSize(raw.detailsWidth) || finiteSize(raw.chatWidth)) return;
		paneSizes = normalizePaneSizes(raw, workspacePanelWidth());
		applyPaneSizes();
		saveAllPaneSizes();
	}

	function setMobileSidebar(open: boolean): void {
		mobile.sidebarOpen = Boolean(open);
		document.body.classList.toggle("mobile-sidebar-open", mobile.sidebarOpen);
		onChange();
	}

	function setMobileView(view: string): void {
		mobile.view = view === "chat" ? "chat" : "details";
		document.body.classList.toggle("mobile-chat-active", mobile.view === "chat");
		onChange();
	}

	function setMobileImmersive(immersive: boolean): void {
		mobile.immersive = Boolean(immersive);
		document.body.classList.toggle("chat-immersive", mobile.immersive);
		try {
			storage?.setItem(MOBILE_IMMERSIVE_KEY, mobile.immersive ? "1" : "0");
		} catch (_) {}
		onChange();
	}

	return {
		initialize,
		previewPane: setPaneSize,
		commitPane,
		syncViewport,
		setMobileSidebar,
		setMobileView,
		setMobileImmersive,
		snapshot: () => ({ paneSizes: { ...paneSizes }, mobile: { ...mobile } })
	};
}
