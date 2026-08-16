import { $ as e, A as t, B as n, C as r, D as i, E as a, F as o, G as s, H as c, I as l, J as u, K as d, L as f, M as p, N as m, O as h, P as g, Q as _, R as v, S as y, T as b, U as x, V as S, W as C, X as w, Y as T, Z as E, _ as D, a as O, b as k, c as A, d as j, et as M, f as N, g as P, h as F, i as I, j as L, k as R, l as z, m as B, n as V, o as H, p as U, q as W, r as G, s as K, t as ee, tt as q, u as te, v as ne, w as re, x as ie, y as ae, z as J } from "./markdown-editor-session-tW-EHpVy.js";
//#region src/components/DoctorDialog.svelte
var oe = o("<div class=\"doctor-global-error\"><strong>Doctor could not run</strong><span> </span></div>"), se = o("<div class=\"doctor-empty\"><!><span>Checking configured Workspaces…</span></div>"), Y = o("<div class=\"doctor-empty\"><!><span>No configured Workspace problems.</span></div>"), ce = o("<code> </code>"), le = o("<p> </p>"), ue = o("<article><div class=\"doctor-issue-icon\"><!></div> <div class=\"doctor-issue-copy\"><div class=\"doctor-issue-title\"><strong> </strong><span> </span></div> <!> <!></div></article>"), de = o("<section class=\"doctor-workspace\"><div class=\"doctor-workspace-heading\"><div><h3> </h3><code> </code></div> <span> </span></div> <div class=\"doctor-issues\"></div></section>"), fe = o("<div data-component-owner=\"doctor-dialog\" class=\"doctor-backdrop\" role=\"presentation\"><div class=\"doctor-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"doctorTitle\"><header><div><h2 id=\"doctorTitle\">Workspace problems</h2> <p> </p></div> <div class=\"doctor-header-actions\"><button type=\"button\" class=\"doctor-refresh\" aria-label=\"Refresh workspace checks\"><!> Refresh</button> <button type=\"button\" class=\"doctor-close\" aria-label=\"Close workspace problems\"><!></button></div></header> <div class=\"doctor-content\"><!> <!></div></div></div>");
function pe(t, r) {
	e(r, !0);
	let i = T(!1);
	async function a() {
		if (!n(i)) {
			u(i, !0);
			try {
				await r.onRefresh();
			} finally {
				u(i, !1);
			}
		}
	}
	x(() => {
		r.snapshot, queueMicrotask(r.onIconsChanged);
	});
	var o = fe(), l = C(o), f = C(l), p = C(f), y = d(C(p), 2), S = C(y);
	q(y), q(p);
	var E = d(p, 2), D = C(E), A = C(D);
	{
		let e = w(() => n(i) || r.snapshot.checking ? "loader-circle" : "refresh-cw");
		O(A, { get name() {
			return n(e);
		} });
	}
	M(), q(D);
	var j = d(D, 2), N = C(j);
	O(N, { name: "x" }), q(j), q(E), q(f);
	var P = d(f, 2), F = C(P), I = (e) => {
		var t = oe(), n = d(C(t)), i = C(n, !0);
		q(n), q(t), c(() => L(i, r.snapshot.error)), m(e, t);
	};
	h(F, (e) => {
		r.snapshot.error && e(I);
	});
	var R = d(F, 2), z = (e) => {
		var t = se(), n = C(t);
		O(n, { name: "loader-circle" }), M(), q(t), m(e, t);
	}, B = (e) => {
		var t = Y(), n = C(t);
		O(n, { name: "circle-check" }), M(), q(t), m(e, t);
	}, V = (e) => {
		var t = g(), i = s(t);
		b(i, 17, () => r.snapshot.workspaces, (e) => e.id, (e, t) => {
			var r = g(), i = s(r), a = (e) => {
				var r = de(), i = C(r), a = C(i), o = C(a), s = C(o, !0);
				q(o);
				var l = d(o), u = C(l, !0);
				q(l), q(a);
				var f = d(a, 2), p = C(f, !0);
				q(f), q(i);
				var g = d(i, 2);
				b(g, 23, () => n(t).report.issues, (e, t) => `${e.code}:${e.path || ""}:${e.resourceId || ""}:${t}`, (e, t) => {
					var r = ue();
					let i;
					var a = C(r), o = C(a);
					{
						let e = w(() => n(t).severity === "error" ? "circle-x" : "triangle-alert");
						O(o, { get name() {
							return n(e);
						} });
					}
					q(a);
					var s = d(a, 2), l = C(s), u = C(l), f = C(u, !0);
					q(u);
					var p = d(u), g = C(p, !0);
					q(p), q(l);
					var _ = d(l, 2), v = (e) => {
						var r = ce(), i = C(r, !0);
						q(r), c(() => L(i, n(t).path)), m(e, r);
					};
					h(_, (e) => {
						n(t).path && e(v);
					});
					var y = d(_, 2), b = (e) => {
						var r = le(), i = C(r, !0);
						q(r), c(() => L(i, n(t).suggestion)), m(e, r);
					};
					h(y, (e) => {
						n(t).suggestion && e(b);
					}), q(s), q(r), c(() => {
						i = k(r, 1, "", null, i, {
							error: n(t).severity === "error",
							warning: n(t).severity !== "error"
						}), L(f, n(t).message), L(g, n(t).code);
					}), m(e, r);
				}), q(g), q(r), c(() => {
					L(s, n(t).name || n(t).id), L(u, n(t).path), L(p, n(t).report.summary.errors + n(t).report.summary.warnings);
				}), m(e, r);
			};
			h(i, (e) => {
				n(t).report.issues.length > 0 && e(a);
			}), m(e, r);
		}), m(e, t);
	};
	h(R, (e) => {
		r.snapshot.checking && !r.snapshot.checkedAt ? e(z) : r.snapshot.workspaces.length === 0 ? e(B, 1) : e(V, -1);
	}), q(P), q(l), q(o), c(() => {
		L(S, `${r.snapshot.summary.errors ?? ""} errors · ${r.snapshot.summary.warnings ?? ""} warnings`), D.disabled = n(i) || r.snapshot.checking;
	}), v("click", o, (e) => {
		e.target === e.currentTarget && r.onClose();
	}), v("click", D, () => void a()), v("click", j, function(...e) {
		r.onClose?.apply(this, e);
	}), m(t, o), _();
}
f(["click"]);
//#endregion
//#region src/components/StatusPresentation.svelte
var me = o("<span><!></span>"), he = o("<span data-component-owner=\"status-presentation\" aria-hidden=\"true\"></span>");
function ge(t, r) {
	e(r, !0);
	let i = A(r, "className", 3, "");
	var a = g(), o = s(a), l = (e) => {
		var t = he();
		b(t, 21, () => r.status.statuses, (e) => e.key, (e, t) => {
			var r = me(), i = C(r);
			O(i, {
				get name() {
					return n(t).iconName;
				},
				className: "task-status-icon"
			}), q(r), c(() => k(r, 1, `task-status-indicator ${n(t).className} ${n(t).recentOutput ? "task-status-fresh" : ""}`)), m(e, r);
		}), q(t), c(() => k(t, 1, `task-status-slot ${i()} ${r.status.slotClassName}`)), m(e, t);
	};
	h(o, (e) => {
		r.status.hasTaskState && e(l);
	}), m(t, a), _();
}
//#endregion
//#region src/components/AttentionList.svelte
var _e = o("<div class=\"activity-row empty-attention\"><!><div><strong>No activity</strong><span>Follow a resource or start a turn.</span></div></div>"), ve = o("<span role=\"button\" tabindex=\"0\"><!></span>"), ye = o("<span class=\"attention-dismiss\" role=\"button\" tabindex=\"0\" title=\"Dismiss\"><!></span>"), be = o("<button type=\"button\"><span class=\"activity-status\" aria-hidden=\"true\"><span class=\"activity-status-fallback-slot\"><!></span> <span class=\"activity-status-runtime-slot\"><!></span></span> <span class=\"activity-title\"><strong> </strong><span class=\"activity-meta\"> </span></span> <span class=\"activity-actions\"><!> <!></span></button>"), xe = o("<section class=\"attention-section\" data-component-owner=\"attention-list\"><div class=\"section-title\"><span>Activity</span></div> <nav class=\"attention-list\" aria-label=\"Activity list\"><!></nav></section>");
function Se(t, r) {
	e(r, !0);
	function i(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function a(e) {
		return e.type === "project" ? "folder" : e.type === "task" ? "file-text" : e.type === "scheduler" ? "calendar-clock" : "home";
	}
	function o(e) {
		return e.type === "project" || e.type === "task";
	}
	function l(e) {
		return [
			e.ref || e.id,
			e.agentName ? `Agent ${e.agentName}` : "",
			e.turnNumber > 0 ? `Turn ${e.turnNumber}` : "No turns",
			e.statusLabel
		].filter(Boolean).join(" · ");
	}
	async function u(e) {
		try {
			await r.onSelect(e.id);
		} catch (e) {
			r.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function f(e, t) {
		e.preventDefault(), e.stopPropagation(), e instanceof MouseEvent && e.currentTarget?.blur();
		try {
			await r.onToggleAttention(t.id, !t.followed);
		} catch (e) {
			r.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function p(e, t) {
		e.preventDefault(), e.stopPropagation();
		try {
			await r.onDismiss(t.id);
		} catch (e) {
			r.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function y(e, t) {
		(e.key === "Enter" || e.key === " ") && t(e);
	}
	var x = xe(), S = d(C(x), 2), T = C(S), E = (e) => {
		var t = _e(), n = C(t);
		O(n, { name: "message-square" }), M(), q(t), m(e, t);
	}, D = (e) => {
		var t = g(), _ = s(t);
		b(_, 17, () => r.items, (e) => e.id, (e, t) => {
			var r = be(), s = C(r), g = C(s), _ = C(g);
			{
				let e = w(() => a(n(t)));
				O(_, {
					get name() {
						return n(e);
					},
					className: "activity-status-fallback"
				});
			}
			q(g);
			var b = d(g, 2);
			ge(C(b), {
				get status() {
					return n(t).status;
				},
				className: "activity-status-icon"
			}), q(b), q(s);
			var x = d(s, 2), S = C(x), T = C(S, !0);
			q(S);
			var E = d(S), D = C(E, !0);
			q(E), q(x);
			var A = d(x, 2), j = C(A), M = (e) => {
				var r = ve();
				let i;
				var a = C(r);
				O(a, { name: "star" }), q(r), c(() => {
					i = k(r, 1, "attention-star", null, i, { followed: n(t).followed }), U(r, "aria-label", n(t).followed ? `Unfollow ${n(t).title}` : `Follow ${n(t).title}`), U(r, "title", n(t).followed ? "Unfollow" : "Follow");
				}), v("click", r, (e) => f(e, n(t))), v("keydown", r, (e) => y(e, (e) => f(e, n(t)))), m(e, r);
			}, N = w(() => o(n(t)));
			h(j, (e) => {
				n(N) && e(M);
			});
			var P = d(j, 2), F = (e) => {
				var r = ye(), i = C(r);
				O(i, { name: "x" }), q(r), c(() => U(r, "aria-label", `Dismiss ${n(t).title}`)), v("click", r, (e) => p(e, n(t))), v("keydown", r, (e) => y(e, (e) => p(e, n(t)))), m(e, r);
			};
			h(P, (e) => {
				n(t).activeTurn || e(F);
			}), q(A), q(r), c((e, i, a) => {
				k(r, 1, e), U(r, "aria-current", n(t).selected ? "page" : void 0), U(r, "data-active-turn", n(t).activeTurn || void 0), U(r, "aria-label", i), U(r, "title", n(t).statusLabel || void 0), U(g, "hidden", n(t).status.hasTaskState), U(b, "hidden", !n(t).status.hasTaskState), L(T, n(t).title), L(D, a);
			}, [
				() => `activity-row ${i(n(t).status)} ${n(t).selected ? "selected" : ""}`,
				() => `${n(t).title}. ${l(n(t))}`,
				() => l(n(t))
			]), v("click", r, () => u(n(t))), m(e, r);
		}), m(e, t);
	};
	h(T, (e) => {
		r.items.length === 0 ? e(E) : e(D, -1);
	}), q(S), q(x), m(t, x), _();
}
f(["click", "keydown"]);
//#endregion
//#region src/components/MobileToolbar.svelte
var Ce = o("<header class=\"mobile-toolbar\" data-component-owner=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" type=\"button\" aria-label=\"Toggle immersive chat\"><span class=\"mobile-immersive-icon mobile-immersive-icon-collapse\"><!></span><span class=\"mobile-immersive-icon mobile-immersive-icon-expand\"><!></span></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" data-component-owner=\"mobile-toolbar\" type=\"button\" aria-label=\"Close navigation\"></button>", 1);
function we(t, n) {
	e(n, !0);
	var r = Ce(), i = s(r), a = C(i), o = C(a);
	O(o, { name: "menu" }), q(a);
	var l = d(a, 2), u = C(l), f = d(u, 2);
	q(l);
	var p = d(l, 2);
	let h;
	var g = C(p), y = C(g);
	O(y, { name: "minimize-2" }), q(g);
	var b = d(g), x = C(b);
	O(x, { name: "maximize-2" }), q(b), q(p), q(i);
	var S = d(i, 2);
	c(() => {
		U(a, "aria-expanded", n.sidebarOpen), U(u, "aria-selected", n.view === "details"), U(f, "aria-selected", n.view === "chat"), h = k(p, 1, "mobile-icon-button mobile-immersive-button", null, h, { immersive: n.immersive }), U(p, "aria-pressed", n.immersive);
	}), v("click", a, () => n.onSidebar(!n.sidebarOpen)), v("click", u, () => n.onView("details")), v("click", f, () => n.onView("chat")), v("click", p, () => n.onImmersive(!n.immersive)), v("click", S, () => n.onSidebar(!1)), m(t, r), _();
}
f(["click"]);
//#endregion
//#region src/components/PaneResizeHandle.svelte
var Te = o("<div data-component-owner=\"pane-resize-handle\" role=\"separator\"></div>");
function Ee(t, n) {
	e(n, !0);
	let r = null;
	H(() => r?.());
	function i(e) {
		if (window.matchMedia("(max-width: 980px)").matches) return;
		e.preventDefault(), r?.();
		let t = e.currentTarget, i = document.getElementById("app"), a = document.getElementById("mobileSidebar"), o = document.querySelector(".workspace-panel"), s = document.getElementById("agentPanel"), c = document.querySelector(".attention-section");
		if (!i || !a || !o || !s || !c) return;
		let l = document.body.dataset.layout === "two", u = e.clientX, d = e.clientY, f = a.getBoundingClientRect().width, p = s.getBoundingClientRect().width, m = c.getBoundingClientRect().height, h = n.kind === "sidebarAttentionHeight" ? "resizing-y" : "resizing-x";
		t.classList.add("dragging"), document.body.classList.add(h);
		let g = (e) => {
			if (n.kind === "sidebarWidth") {
				let t = l ? 360 : 368 + Math.max(320, s.getBoundingClientRect().width), r = Math.max(220, i.getBoundingClientRect().width - 8 - t);
				n.onPreview(n.kind, Math.min(r, Math.max(220, f + e.clientX - u)));
			} else if (n.kind === "chatWidth") {
				let t = Math.max(320, o.getBoundingClientRect().width - 360 - 8);
				n.onPreview(n.kind, Math.min(t, Math.max(320, p - (e.clientX - u))));
			} else {
				let t = Math.max(120, a.getBoundingClientRect().height - 250);
				n.onPreview(n.kind, Math.min(t, Math.max(84, m - (e.clientY - d))));
			}
		}, _ = () => {
			t.classList.remove("dragging"), document.body.classList.remove(h), window.removeEventListener("pointermove", g), window.removeEventListener("pointerup", _), window.removeEventListener("pointercancel", _), r = null, n.onCommit(n.kind);
		};
		r = _, window.addEventListener("pointermove", g), window.addEventListener("pointerup", _, { once: !0 }), window.addEventListener("pointercancel", _, { once: !0 });
	}
	var a = Te();
	c(() => {
		U(a, "id", n.id), k(a, 1, `resize-handle ${n.className}`), U(a, "aria-orientation", n.kind === "sidebarAttentionHeight" ? "horizontal" : "vertical"), U(a, "aria-label", n.label);
	}), v("pointerdown", a, i), m(t, a), _();
}
f(["pointerdown"]);
//#endregion
//#region src/components/ProjectTree.svelte
var De = o("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), Oe = o("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), ke = o("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Ae = o("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), je = o("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Me = o("<div class=\"task-group\"></div>"), Ne = o("<button type=\"button\"><span><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), Pe = o("<section class=\"tree-section\" data-component-owner=\"project-tree\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section>");
function Fe(t, r) {
	e(r, !0);
	let i = T(null), a = T(null), o = T(W(r.identity));
	x(() => {
		r.identity !== n(o) && (u(o, r.identity, !0), E());
	}), H(E);
	function l(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function f(e) {
		return !n(a) || n(a).id !== e ? "" : n(a).after ? "drop-after" : "drop-before";
	}
	function p(e) {
		return !n(i) || n(i).id === e.id || n(i).kind !== e.kind ? !1 : e.kind !== "task" || n(i).projectId === e.projectId;
	}
	function y(e, t) {
		e.stopPropagation(), u(i, t, !0), u(a, null), r.onDragState(t), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", t.id));
	}
	function S(e, t) {
		if (!p(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		u(a, {
			id: t.id,
			after: e.clientY > n.top + n.height / 2
		}, !0);
	}
	async function w(e, t) {
		if (e.preventDefault(), !n(i) || !p(t)) return;
		let o = n(i), s = n(a)?.id === t.id && n(a).after;
		E();
		try {
			await r.onReorder(o, t, s);
		} catch (e) {
			r.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function E() {
		n(i) && r.onDragState(null), u(i, null), u(a, null);
	}
	async function D(e, t) {
		let n = e.target instanceof Element ? e.target : null;
		if (!n?.closest(".drag-handle")) try {
			t.type === "project" && n?.closest("[data-project-toggle]") ? (e.currentTarget?.blur(), await r.onToggle(t.id)) : (e.detail > 0 && e.currentTarget?.blur(), await r.onSelect(t.id));
		} catch (e) {
			r.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function A(e, t) {
		e.preventDefault(), e.stopPropagation(), e instanceof MouseEvent && e.currentTarget?.blur();
		try {
			await r.onToggleAttention(t.id, !t.followed);
		} catch (e) {
			r.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function j(e, t) {
		(e.key === "Enter" || e.key === " ") && A(e, t);
	}
	var N = Pe(), P = C(N), F = d(C(P)), I = C(F);
	O(I, { name: "plus" }), q(F), q(P);
	var R = d(P, 2), z = C(R), B = (e) => {
		var t = De(), n = C(t);
		O(n, {
			name: "loader-circle",
			className: "empty-state-icon"
		}), M(2), q(t), m(e, t);
	}, V = (e) => {
		var t = Oe(), n = C(t);
		O(n, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = d(n, 2), a = C(i, !0);
		q(i), q(t), c(() => L(a, r.error)), m(e, t);
	}, G = (e) => {
		var t = ke(), n = C(t);
		O(n, {
			name: "folder-search",
			className: "empty-state-icon"
		}), M(2), q(t), m(e, t);
	}, K = (e) => {
		var t = g(), a = s(t);
		b(a, 17, () => r.projects, (e) => e.id, (e, t) => {
			var r = Ne(), a = s(r), o = C(a);
			let u;
			var p = C(o), g = (e) => {
				O(e, { name: "chevron-right" });
			};
			h(p, (e) => {
				n(t).children.length && e(g);
			}), q(o);
			var _ = d(o, 2);
			ge(_, { get status() {
				return n(t).status;
			} });
			var x = d(_, 2);
			O(x, {
				name: "folder",
				className: "tree-icon"
			});
			var T = d(x, 2), M = C(T), N = C(M, !0);
			q(M);
			var P = d(M), F = C(P, !0);
			q(P);
			var I = d(P), R = (e) => {
				var r = Ae(), i = C(r), a = C(i, !0);
				q(i);
				var o = d(i, 2), s = C(o, !0);
				q(o), q(r), c(() => {
					L(a, n(t).summary.taskLabel), L(s, n(t).summary.runningLabel);
				}), m(e, r);
			};
			h(I, (e) => {
				n(t).summary && !n(t).expanded && e(R);
			}), q(T);
			var z = d(T, 2);
			let B;
			var V = C(z);
			O(V, { name: "star" }), q(z);
			var H = d(z, 2), W = C(H);
			O(W, {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), q(H), q(a);
			var G = d(a, 2), K = (e) => {
				var r = Me();
				b(r, 21, () => n(t).children, (e) => e.id, (e, r) => {
					var a = je(), o = d(C(a), 2);
					ge(o, { get status() {
						return n(r).status;
					} });
					var s = d(o, 2);
					O(s, {
						name: "file-text",
						className: "tree-icon"
					});
					var u = d(s), p = C(u), h = C(p, !0);
					q(p);
					var g = d(p), _ = C(g, !0);
					q(g), q(u);
					var b = d(u, 2);
					let x;
					var T = C(b);
					O(T, { name: "star" }), q(b);
					var M = d(b, 2), N = C(M);
					O(N, {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), q(M), q(a), c((e) => {
						k(a, 1, e), U(a, "aria-label", n(r).ariaLabel || void 0), U(a, "title", n(r).statusLabel || void 0), L(h, n(r).title), L(_, n(r).ref), x = k(b, 1, "attention-star", null, x, { followed: n(r).followed }), U(b, "aria-checked", n(r).followed), U(b, "aria-label", n(r).followed ? `Unfollow ${n(r).title}` : `Follow ${n(r).title}`), U(b, "title", n(r).followed ? "Unfollow" : "Follow");
					}, [() => `tree-item task-item ${l(n(r).status)} ${n(r).active ? "active" : ""} ${n(i)?.id === n(r).id ? "drag-source" : ""} ${f(n(r).id)}`]), v("click", a, (e) => D(e, n(r))), J("dragover", a, (e) => S(e, {
						kind: "task",
						id: n(r).id,
						projectId: n(t).id
					})), J("drop", a, (e) => w(e, {
						kind: "task",
						id: n(r).id,
						projectId: n(t).id
					})), v("click", b, (e) => A(e, n(r))), v("keydown", b, (e) => j(e, n(r))), J("dragstart", M, (e) => y(e, {
						kind: "task",
						id: n(r).id,
						projectId: n(t).id
					})), J("dragend", M, E), m(e, a);
				}), q(r), m(e, r);
			};
			h(G, (e) => {
				n(t).expanded && e(K);
			}), c((e) => {
				k(a, 1, e), U(a, "aria-label", n(t).ariaLabel || void 0), U(a, "title", n(t).statusLabel || void 0), u = k(o, 1, "chevron", null, u, { expanded: n(t).expanded }), U(o, "data-project-toggle", n(t).children.length ? n(t).id : void 0), L(N, n(t).title), L(F, n(t).ref), B = k(z, 1, "attention-star", null, B, { followed: n(t).followed }), U(z, "aria-checked", n(t).followed), U(z, "aria-label", n(t).followed ? `Unfollow ${n(t).title}` : `Follow ${n(t).title}`), U(z, "title", n(t).followed ? "Unfollow" : "Follow");
			}, [() => `tree-item ${l(n(t).status)} ${n(t).active ? "active" : ""} ${n(i)?.id === n(t).id ? "drag-source" : ""} ${f(n(t).id)}`]), v("click", a, (e) => D(e, n(t))), J("dragover", a, (e) => S(e, {
				kind: "project",
				id: n(t).id,
				projectId: ""
			})), J("drop", a, (e) => w(e, {
				kind: "project",
				id: n(t).id,
				projectId: ""
			})), v("click", z, (e) => A(e, n(t))), v("keydown", z, (e) => j(e, n(t))), J("dragstart", H, (e) => y(e, {
				kind: "project",
				id: n(t).id,
				projectId: ""
			})), J("dragend", H, E), m(e, r);
		}), m(e, t);
	};
	h(z, (e) => {
		r.loading ? e(B) : r.error ? e(V, 1) : r.projects.length === 0 ? e(G, 2) : e(K, -1);
	}), q(R), q(N), c(() => U(R, "data-navigation-identity", r.identity)), v("click", F, function(...e) {
		r.onCreate?.apply(this, e);
	}), m(t, N), _();
}
f(["click", "keydown"]);
//#endregion
//#region src/components/SchedulerNav.svelte
var Ie = o("<section class=\"scheduler-nav\" data-component-owner=\"scheduler-nav\"><button type=\"button\"><!> <!> <span><strong>Scheduler</strong><small>Natural-language schedules</small></span> <!></button></section>");
function Le(t, n) {
	e(n, !0);
	async function r() {
		if (n.item) try {
			await n.onSelect(n.item.id);
		} catch (e) {
			n.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var i = Ie(), a = C(i);
	let o;
	var s = C(a), l = (e) => {
		ge(e, { get status() {
			return n.item.status;
		} });
	};
	h(s, (e) => {
		n.item && e(l);
	});
	var u = d(s, 2);
	O(u, {
		name: "clock-3",
		className: "scheduler-nav-icon"
	});
	var f = d(u, 4);
	O(f, {
		name: "chevron-right",
		className: "scheduler-nav-chevron"
	}), q(a), q(i), c(() => {
		a.disabled = !n.item, U(a, "title", n.item?.statusLabel || "Workspace Scheduler"), o = k(a, 1, "", null, o, { active: n.item?.active });
	}), v("click", a, r), m(t, i), _();
}
f(["click"]);
//#endregion
//#region src/components/WorkspaceSwitcher.svelte
var Re = o("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), ze = o("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), Be = o("<section class=\"workspace-switcher\" data-component-owner=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <span class=\"workspace-switcher-icon workspace-switcher-icon-idle\"><!></span><span class=\"workspace-switcher-icon workspace-switcher-icon-busy\"><!></span></button> <!></div></section>");
function Ve(t, r) {
	e(r, !0);
	let i = T(!1), a = T(""), o = T(W(r.identity)), s = w(() => r.workspaces.find((e) => e.id === r.activeWorkspaceId) ?? null);
	x(() => {
		r.identity !== n(o) && (u(o, r.identity, !0), u(i, !1), u(a, ""));
	}), K(() => {
		let e = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			n(i) && !t?.closest(".workspace-select-row") && u(i, !1);
		}, t = (e) => {
			e.key === "Escape" && !r.mobileSidebarOpen && u(i, !1);
		};
		return document.addEventListener("mousedown", e), document.addEventListener("keydown", t), () => {
			document.removeEventListener("mousedown", e), document.removeEventListener("keydown", t);
		};
	});
	async function l(e) {
		if (!(!e || n(a))) {
			u(a, e, !0), u(i, !1);
			try {
				await r.onSwitch(e);
			} catch (e) {
				r.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				u(a, "");
			}
		}
	}
	var f = Be(), p = C(f), g = C(p);
	let y;
	var S = C(g), E = C(S);
	q(S);
	var D = d(S, 2), A = C(D, !0);
	q(D);
	var j = d(D, 2), N = C(j);
	O(N, {
		name: "chevrons-up-down",
		className: "select-icon"
	}), q(j);
	var P = d(j), F = C(P);
	O(F, {
		name: "loader-circle",
		className: "select-icon"
	}), q(P), q(g);
	var I = d(g, 2), R = (e) => {
		var t = ze(), o = d(C(t), 2);
		b(o, 17, () => r.workspaces, (e) => e.id, (e, t) => {
			var i = Re(), o = C(i), s = C(o);
			q(o);
			var u = d(o, 2), f = C(u), p = C(f, !0);
			q(f);
			var g = d(f), _ = C(g, !0);
			q(g), q(u);
			var y = d(u, 2), b = (e) => {
				O(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			h(y, (e) => {
				n(t).id === r.activeWorkspaceId && e(b);
			}), q(i), c((e) => {
				U(i, "aria-selected", n(t).id === r.activeWorkspaceId), U(i, "data-workspace-id", n(t).id), i.disabled = e, U(s, "src", n(t).iconSrc), L(p, n(t).name || n(t).id), L(_, n(t).path);
			}, [() => !!n(a)]), v("click", i, () => l(n(t).id)), m(e, i);
		});
		var s = d(o, 2), f = C(s), p = C(f);
		O(p, { name: "plus" }), M(), q(f), q(s), q(t), v("click", f, () => {
			u(i, !1), r.onAdd();
		}), m(e, t);
	};
	h(I, (e) => {
		n(i) && e(R);
	}), q(p), q(f), c((e) => {
		y = k(g, 1, "workspace-switcher-button", null, y, e), U(g, "aria-expanded", n(i)), U(E, "src", n(s)?.iconSrc || "/favicon.svg"), L(A, n(s)?.name || "Workspace");
	}, [() => ({ busy: !!n(a) })]), v("click", g, (e) => {
		e.stopPropagation(), u(i, !n(i));
	}), m(t, f), _();
}
f(["click"]);
//#endregion
//#region src/components/AppShell.svelte
var He = o("<button id=\"doctorButton\" type=\"button\" title=\"Workspace problems\"><!><span> </span></button>"), Ue = o("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">P</div><div class=\"brand-copy\"><strong>PUA</strong><span> </span></div><!><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div class=\"chat-panel\"><!><div id=\"chatTimeline\" class=\"chat-timeline\" data-component-owner=\"event-timeline\"><!></div><div id=\"chatComposer\" class=\"chat-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div> <!>", 1);
function We(t, i) {
	e(i, !0);
	let a = T(W(i.channel.current())), o = T(0), l = T(!1);
	K(() => {
		let e = i.channel.subscribe((e) => {
			u(a, e, !0), queueMicrotask(e.onIconsChanged);
		}), t = (e) => {
			e.key === "Escape" && n(a).mobile.sidebarOpen && n(a).onMobileSidebar(!1);
		}, r = () => {
			n(a).onHistoryNavigation(window.location.pathname).catch((e) => {
				n(a).onToast(e instanceof Error ? e.message : String(e));
			});
		}, o = window.visualViewport, s = /* @__PURE__ */ new Set(), c = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 980px)") : {
			matches: !1,
			addEventListener: () => void 0,
			removeEventListener: () => void 0
		}, l = () => {
			let e = document.documentElement;
			if (!c.matches || !o) {
				e.style.removeProperty("--app-viewport-height"), e.style.removeProperty("--app-viewport-offset-top"), e.style.removeProperty("--app-viewport-offset-left");
				return;
			}
			e.style.setProperty("--app-viewport-height", `${o.height}px`), e.style.setProperty("--app-viewport-offset-top", `${o.offsetTop}px`), e.style.setProperty("--app-viewport-offset-left", `${o.offsetLeft}px`);
		}, d = () => {
			(window.scrollX !== 0 || window.scrollY !== 0) && window.scrollTo(0, 0), l();
		}, f = () => {
			for (let e of s) window.clearTimeout(e);
			s.clear();
		}, p = (e) => {
			let t = window.setTimeout(() => {
				s.delete(t), d();
			}, e);
			s.add(t);
		}, m = () => {
			f(), p(0), p(300);
		}, h = () => {
			n(a).onPaneViewport(), l();
		};
		return document.addEventListener("keydown", t), document.addEventListener("focusout", m), window.addEventListener("resize", h), window.addEventListener("orientationchange", m), window.addEventListener("popstate", r), o?.addEventListener("resize", l), o?.addEventListener("scroll", l), c.addEventListener?.("change", h), l(), () => {
			e(), document.removeEventListener("keydown", t), document.removeEventListener("focusout", m), window.removeEventListener("resize", h), window.removeEventListener("orientationchange", m), window.removeEventListener("popstate", r), o?.removeEventListener("resize", l), o?.removeEventListener("scroll", l), c.removeEventListener?.("change", h), f(), document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
		};
	}), x(() => {
		document.body.classList.toggle("mobile-sidebar-open", n(a).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", n(a).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", n(a).mobile.immersive);
	}), x(() => {
		let e = n(a).route;
		!e.path || e.revision <= n(o) || (u(o, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	var f = Ue(), p = s(f), y = C(p);
	we(y, {
		get sidebarOpen() {
			return n(a).mobile.sidebarOpen;
		},
		get view() {
			return n(a).mobile.view;
		},
		get immersive() {
			return n(a).mobile.immersive;
		},
		get onSidebar() {
			return n(a).onMobileSidebar;
		},
		get onView() {
			return n(a).onMobileView;
		},
		get onImmersive() {
			return n(a).onMobileImmersive;
		}
	});
	var b = d(y, 2), S = C(b), E = d(C(S)), D = d(C(E)), A = C(D, !0);
	q(D), q(E);
	var j = d(E), M = (e) => {
		var t = He();
		let r;
		var i = C(t);
		{
			let e = w(() => n(a).doctor.summary.errors > 0 ? "circle-alert" : "triangle-alert");
			O(i, { get name() {
				return n(e);
			} });
		}
		var o = d(i), s = C(o, !0);
		q(o), q(t), c(() => {
			r = k(t, 1, "brand-doctor", null, r, { "has-errors": n(a).doctor.summary.errors > 0 }), U(t, "aria-label", `${n(a).doctor.summary.errors} errors and ${n(a).doctor.summary.warnings} warnings`), L(s, n(a).doctor.summary.errors + n(a).doctor.summary.warnings);
		}), v("click", t, () => {
			n(a).onMobileSidebar(!1), u(l, !0);
		}), m(e, t);
	};
	h(j, (e) => {
		(n(a).doctor.summary.errors + n(a).doctor.summary.warnings > 0 || n(a).doctor.error) && e(M);
	});
	var N = d(j), P = C(N);
	O(P, { name: "settings" }), q(N), q(S);
	var F = d(S, 2);
	Ve(F, {
		get identity() {
			return n(a).identity;
		},
		get mobileSidebarOpen() {
			return n(a).mobile.sidebarOpen;
		},
		get activeWorkspaceId() {
			return n(a).activeWorkspaceId;
		},
		get workspaces() {
			return n(a).workspaces;
		},
		get onSwitch() {
			return n(a).onSwitchWorkspace;
		},
		get onAdd() {
			return n(a).onAddWorkspace;
		},
		get onToast() {
			return n(a).onToast;
		}
	});
	var I = d(F, 2);
	{
		let e = w(() => n(a).scheduler || null);
		Le(I, {
			get item() {
				return n(e);
			},
			get onSelect() {
				return n(a).onSelectResource;
			},
			get onToast() {
				return n(a).onToast;
			}
		});
	}
	var R = d(I, 2);
	Fe(R, {
		get identity() {
			return n(a).identity;
		},
		get loading() {
			return n(a).loading;
		},
		get error() {
			return n(a).error;
		},
		get projects() {
			return n(a).projects;
		},
		get onCreate() {
			return n(a).onCreateProject;
		},
		get onToggle() {
			return n(a).onToggleProject;
		},
		get onSelect() {
			return n(a).onSelectResource;
		},
		get onReorder() {
			return n(a).onReorder;
		},
		get onDragState() {
			return n(a).onDragState;
		},
		get onToggleAttention() {
			return n(a).onToggleAttention;
		},
		get onToast() {
			return n(a).onToast;
		}
	});
	var z = d(R, 2);
	Ee(z, {
		id: "activityResize",
		kind: "sidebarAttentionHeight",
		className: "horizontal-resize sidebar-activity-resize",
		label: "Resize activity panel",
		get onPreview() {
			return n(a).onPanePreview;
		},
		get onCommit() {
			return n(a).onPaneCommit;
		}
	}), Se(d(z, 2), {
		get items() {
			return n(a).attentionList;
		},
		get onSelect() {
			return n(a).onSelectResource;
		},
		get onToggleAttention() {
			return n(a).onToggleAttention;
		},
		get onDismiss() {
			return n(a).onDismissAttention;
		},
		get onToast() {
			return n(a).onToast;
		}
	}), q(b);
	var B = d(b, 2);
	Ee(B, {
		id: "sidebarResize",
		kind: "sidebarWidth",
		className: "sidebar-resize",
		label: "Resize sidebar",
		get onPreview() {
			return n(a).onPanePreview;
		},
		get onCommit() {
			return n(a).onPaneCommit;
		}
	});
	var V = d(B, 2), H = C(V), G = C(H), ee = C(G);
	O(ee, { name: "menu" }), q(G), q(H);
	var te = d(H, 2), ne = C(te), re = C(ne), ie = d(re, 2);
	q(ne), q(te);
	var ae = d(te, 2), J = C(ae), oe = (e) => {
		var t = g(), n = s(t);
		r(n, () => i.details), m(e, t);
	};
	h(J, (e) => {
		i.details && e(oe);
	}), q(ae);
	var se = d(ae, 2);
	Ee(se, {
		id: "detailsResize",
		kind: "chatWidth",
		className: "details-resize",
		label: "Resize chat panel",
		get onPreview() {
			return n(a).onPanePreview;
		},
		get onCommit() {
			return n(a).onPaneCommit;
		}
	});
	var Y = d(se, 2), ce = C(Y), le = C(ce), ue = (e) => {
		var t = g(), n = s(t);
		r(n, () => i.agentHeader), m(e, t);
	};
	h(le, (e) => {
		i.agentHeader && e(ue);
	});
	var de = d(le), fe = C(de), me = (e) => {
		var t = g(), n = s(t);
		r(n, () => i.timeline), m(e, t);
	};
	h(fe, (e) => {
		i.timeline && e(me);
	}), q(de);
	var he = d(de), ge = C(he), _e = (e) => {
		var t = g(), n = s(t);
		r(n, () => i.composer), m(e, t);
	};
	h(ge, (e) => {
		i.composer && e(_e);
	}), q(he), q(ce), q(Y), q(V), q(p);
	var ve = d(p, 2), ye = (e) => {
		pe(e, {
			get snapshot() {
				return n(a).doctor;
			},
			onClose: () => {
				u(l, !1);
			},
			get onRefresh() {
				return n(a).onRefreshDoctor;
			},
			get onIconsChanged() {
				return n(a).onIconsChanged;
			}
		});
	};
	h(ve, (e) => {
		n(l) && e(ye);
	}), c(() => {
		L(A, n(a).version), U(G, "aria-expanded", n(a).mobile.sidebarOpen), U(re, "aria-selected", n(a).mobile.view === "details"), U(ie, "aria-selected", n(a).mobile.view === "chat");
	}), v("click", N, () => {
		n(a).onMobileSidebar(!1), n(a).onOpenSettings();
	}), v("click", G, () => n(a).onMobileSidebar(!0)), v("click", re, () => n(a).onMobileView("details")), v("click", ie, () => n(a).onMobileView("chat")), m(t, f), _();
}
f(["click"]);
//#endregion
//#region src/components/AgentPanelHeader.svelte
var Ge = o("<span class=\"agent-header-queued\"> </span>"), Ke = o("<span class=\"agent-header-model\"> </span>"), qe = o("<span class=\"agent-header-turn\"> </span>"), Je = o("<header class=\"agent-panel-header\" data-component-owner=\"agent-panel-header\"><div class=\"agent-header-left\"><span class=\"agent-status-dot\" aria-hidden=\"true\"></span> <span class=\"agent-header-name\"> </span> <span class=\"agent-header-state\"> </span> <!></div> <div class=\"agent-header-right\"><!> <!></div></header>");
function Ye(t, r) {
	e(r, !0);
	let i = T(W(r.channel.current())), a = T(W(Date.now()));
	K(() => r.channel.subscribe((e) => {
		u(i, e, !0);
	}));
	let o = w(() => n(i).resourceId ? n(i).submitting ? "submitting" : n(i).status?.state || "loading" : "empty"), s = w(() => n(o) === "submitting" ? "Submitting" : n(o) === "working" ? "Working" : n(o) === "idle" ? "Idle" : n(o) === "attention_required" ? "Attention required" : n(o) === "unavailable" ? "Unavailable" : n(o) === "archived" ? "Archived" : n(o) === "loading" ? "Loading" : "No resource selected"), l = w(() => n(i).status?.waitingMessages?.length || 0), f = w(() => Date.parse(n(i).turnStartedAt || "")), p = w(() => n(o) === "working" && Number.isFinite(n(f)));
	x(() => {
		if (!n(p)) return;
		u(a, Date.now(), !0);
		let e = window.setInterval(() => {
			u(a, Date.now(), !0);
		}, 1e3);
		return () => window.clearInterval(e);
	});
	function g(e) {
		let t = Math.max(0, e), n = Math.floor(t / 3600), r = Math.floor(t % 3600 / 60), i = t % 60, a = (e) => String(e).padStart(2, "0");
		return n > 0 ? `${n}:${a(r)}:${a(i)}` : `${a(r)}:${a(i)}`;
	}
	function v(e) {
		switch (e) {
			case "cancelled":
			case "canceled": return "cancelled";
			case "interrupted": return "interrupted";
			case "failed": return "failed";
			default: return "completed";
		}
	}
	let y = w(() => {
		let e = n(i).turnNumber;
		if (n(o) === "submitting") return "Message pending";
		if (n(o) === "idle") {
			if (e <= 0) return "";
			let t = v(String(n(i).status?.generation?.completionState || "").trim().toLowerCase());
			return `Idle · Turn ${e} ${t}${t !== "completed" && n(i).status?.generation?.completionHasFinalReply === !1 ? " · no final reply" : ""}`;
		}
		if (n(o) === "empty" || n(o) === "loading") return "";
		if (Number.isFinite(n(f))) {
			let t = g(Math.floor((n(a) - n(f)) / 1e3));
			return e > 0 ? `Turn ${e} · ${t}` : t;
		}
		return e > 0 ? `Turn ${e}` : "";
	});
	var b = Je(), S = C(b), E = d(C(S), 2), D = C(E, !0);
	q(E);
	var O = d(E, 2), k = C(O, !0);
	q(O);
	var A = d(O, 2), j = (e) => {
		var t = Ge(), r = C(t);
		q(t), c(() => L(r, `· ${n(l) ?? ""} queued`)), m(e, t);
	};
	h(A, (e) => {
		n(l) > 0 && e(j);
	}), q(S);
	var M = d(S, 2), N = C(M), P = (e) => {
		var t = Ke(), r = C(t, !0);
		q(t), c(() => L(r, n(i).modelSummary)), m(e, t);
	};
	h(N, (e) => {
		n(i).modelSummary && e(P);
	});
	var F = d(N, 2), I = (e) => {
		var t = qe(), r = C(t, !0);
		q(t), c(() => L(r, n(y))), m(e, t);
	};
	h(F, (e) => {
		n(y) && e(I);
	}), q(M), q(b), c(() => {
		U(b, "data-state", n(o)), L(D, n(i).agentName), L(k, n(s));
	}), m(t, b), _();
}
//#endregion
//#region src/components/AgentBindingSelector.svelte
var Xe = o("<div class=\"agent-binding-divider\"></div>"), Ze = o("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Inherit\"><button type=\"button\" class=\"agent-binding-option\" role=\"option\" data-binding=\"inherit\"><span class=\"agent-binding-option-primary\"> </span> <span class=\"agent-binding-option-secondary\"></span> <!></button></div> <!>", 1), Qe = o("<button type=\"button\" class=\"agent-binding-option\" role=\"option\"><span class=\"agent-binding-option-primary\"> </span> <span class=\"agent-binding-option-secondary\"> </span> <!></button>"), $e = o("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Profiles\"><div class=\"agent-binding-group-title\">Profiles</div> <!></div>"), et = o("<!> <div class=\"agent-binding-group\" role=\"group\" aria-label=\"Agents\"><div class=\"agent-binding-group-title\">Agents</div> <!></div>", 1), tt = o("<div class=\"agent-binding-menu\" role=\"listbox\" tabindex=\"-1\"><!> <!> <!></div>"), nt = o("<span class=\"agent-binding\" data-component-owner=\"agent-binding-selector\"><button type=\"button\" class=\"agent-binding-button\" aria-haspopup=\"listbox\"><span class=\"agent-binding-label\"> </span> <!></button> <!></span>");
function rt(t, r) {
	e(r, !0);
	let i = A(r, "disabled", 3, !1), a = A(r, "ariaLabel", 3, "Agent binding"), o = A(r, "openUp", 3, !0), l = A(r, "allowInherit", 3, !1), f = A(r, "inheritLabel", 3, "Inherit"), p = w(R), g = w(B), y = w(() => l() && !r.value.name), E = w(() => n(y) ? "inherit" : V(r.value)), D = w(() => n(y) ? f() : [...n(p), ...n(g)].find((e) => V(e.value) === n(E))?.label || r.value.name || "Unavailable"), k = T(!1), j = T(void 0), M = T(void 0);
	x(() => {
		if (!n(k) || !n(M)) return;
		n(p), n(g), N(), P();
		let e = n(M).querySelector("[aria-selected=\"true\"]") ?? n(M).querySelector(".agent-binding-option");
		S().then(() => e?.focus());
	}), K(() => {
		let e = (e) => {
			n(k) && e.target instanceof Node && !n(j)?.contains(e.target) && u(k, !1);
		}, t = () => {
			n(k) && N();
		};
		return document.addEventListener("mousedown", e), window.addEventListener("resize", t), () => {
			document.removeEventListener("mousedown", e), window.removeEventListener("resize", t);
		};
	});
	function N() {
		if (!n(j) || !n(M)) return;
		let e = n(j).getBoundingClientRect(), t = o() ? e.top - 14 : window.innerHeight - e.bottom - 14;
		n(M).style.maxHeight = `${Math.max(120, Math.floor(t))}px`;
	}
	function P() {
		if (!n(M)) return;
		n(M).style.removeProperty("--binding-primary-width"), n(M).style.removeProperty("--binding-secondary-width");
		let e = 0, t = 0;
		n(M).querySelectorAll(".agent-binding-option-primary").forEach((t) => {
			e = Math.max(e, t.getBoundingClientRect().width);
		}), n(M).querySelectorAll(".agent-binding-option-secondary").forEach((e) => {
			t = Math.max(t, e.getBoundingClientRect().width);
		}), e > 0 && n(M).style.setProperty("--binding-primary-width", `${Math.ceil(e)}px`), t > 0 && n(M).style.setProperty("--binding-secondary-width", `${Math.ceil(t)}px`);
	}
	function F(e) {
		return e.trim().toLowerCase();
	}
	function I(e) {
		return r.agents.find((t) => F(t.id) === F(e))?.label || e || "Unavailable";
	}
	function R() {
		let e = r.profiles.map((e) => ({
			value: {
				kind: "profile",
				name: e.key
			},
			label: `${e.key} (current: ${I(e.agentName || "")})`,
			primary: e.key,
			secondary: I(e.agentName || "")
		}));
		return r.value.name && r.value.kind === "profile" && !r.profiles.some((e) => F(e.key) === F(r.value.name)) && e.unshift({
			value: r.value,
			label: `${r.value.name} (missing profile)`,
			primary: r.value.name,
			secondary: "missing profile"
		}), e;
	}
	function B() {
		let e = r.agents.map((e) => {
			let t = r.profiles.filter((t) => F(t.agentName || "") === F(e.id)).map((e) => e.key);
			return {
				value: {
					kind: "agent",
					name: e.id
				},
				label: t.length ? `${e.label} (${t.join(", ")})` : e.label,
				primary: e.label,
				secondary: t.join(", ")
			};
		});
		return r.value.name && r.value.kind === "agent" && !r.agents.some((e) => F(e.id) === F(r.value.name)) && e.unshift({
			value: r.value,
			label: `${r.value.name} (missing agent)`,
			primary: r.value.name,
			secondary: "missing agent"
		}), e;
	}
	function V(e) {
		return `${e.kind}:${encodeURIComponent(e.name)}`;
	}
	function H(e) {
		u(k, !1), (l() && !e.value.name ? "inherit" : V(e.value)) !== n(E) && r.onSelect(e.value);
	}
	function W(e) {
		e.key === "Escape" && (e.stopPropagation(), u(k, !1));
	}
	var G = nt(), ee = C(G), te = C(ee), ne = C(te, !0);
	q(te);
	var re = d(te, 2);
	O(re, {
		name: "chevrons-up-down",
		className: "agent-binding-icon"
	}), q(ee);
	var ie = d(ee, 2), ae = (e) => {
		var t = tt(), r = C(t), i = (e) => {
			var t = Ze(), r = s(t), i = C(r), a = C(i), o = C(a, !0);
			q(a);
			var l = d(a, 4);
			{
				let e = w(() => n(y) ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden");
				O(l, {
					name: "check",
					get className() {
						return n(e);
					}
				});
			}
			q(i), q(r);
			var u = d(r, 2), _ = (e) => {
				var t = Xe();
				m(e, t);
			};
			h(u, (e) => {
				(n(p).length || n(g).length) && e(_);
			}), c(() => {
				U(i, "aria-selected", n(y)), L(o, f());
			}), v("click", i, () => H({
				value: {
					kind: "profile",
					name: ""
				},
				label: f(),
				primary: f(),
				secondary: ""
			})), m(e, t);
		};
		h(r, (e) => {
			l() && e(i);
		});
		var o = d(r, 2), _ = (e) => {
			var t = $e(), r = d(C(t), 2);
			b(r, 17, () => n(p), (e) => V(e.value), (e, t) => {
				var r = Qe(), i = C(r), a = C(i, !0);
				q(i);
				var o = d(i, 2), s = C(o, !0);
				q(o);
				var l = d(o, 2);
				{
					let e = w(() => V(n(t).value) === n(E) ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden");
					O(l, {
						name: "check",
						get className() {
							return n(e);
						}
					});
				}
				q(r), c((e, i) => {
					U(r, "aria-selected", e), U(r, "data-binding", i), L(a, n(t).primary), L(s, n(t).secondary);
				}, [() => V(n(t).value) === n(E), () => V(n(t).value)]), v("click", r, () => H(n(t))), m(e, r);
			}), q(t), m(e, t);
		};
		h(o, (e) => {
			n(p).length && e(_);
		});
		var x = d(o, 2), S = (e) => {
			var t = et(), r = s(t), i = (e) => {
				var t = Xe();
				m(e, t);
			};
			h(r, (e) => {
				n(p).length && e(i);
			});
			var a = d(r, 2), o = d(C(a), 2);
			b(o, 17, () => n(g), (e) => V(e.value), (e, t) => {
				var r = Qe(), i = C(r), a = C(i, !0);
				q(i);
				var o = d(i, 2), s = C(o, !0);
				q(o);
				var l = d(o, 2);
				{
					let e = w(() => V(n(t).value) === n(E) ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden");
					O(l, {
						name: "check",
						get className() {
							return n(e);
						}
					});
				}
				q(r), c((e, i) => {
					U(r, "aria-selected", e), U(r, "data-binding", i), L(a, n(t).primary), L(s, n(t).secondary);
				}, [() => V(n(t).value) === n(E), () => V(n(t).value)]), v("click", r, () => H(n(t))), m(e, r);
			}), q(a), m(e, t);
		};
		h(x, (e) => {
			n(g).length && e(S);
		}), q(t), z(t, (e) => u(M, e), () => n(M)), c(() => U(t, "aria-label", a())), v("keydown", t, W), m(e, t);
	};
	h(ie, (e) => {
		n(k) && e(ae);
	}), q(G), z(G, (e) => u(j, e), () => n(j)), c(() => {
		U(G, "data-placement", o() ? "up" : "down"), ee.disabled = i(), U(ee, "aria-expanded", n(k)), U(ee, "aria-label", a()), L(ne, n(D));
	}), v("click", ee, () => {
		u(k, !n(k));
	}), m(t, G), _();
}
f(["click", "keydown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var it = o("<div class=\"chat-turn-stop-notice\" role=\"status\"><span> </span> <button type=\"button\" class=\"chat-turn-stop-dismiss\" aria-label=\"Dismiss turn stop notice\">Dismiss</button></div>"), at = o("<div class=\"chat-message-item\"><span class=\"chat-message-text\"> </span> <span class=\"chat-message-mode\"> </span> <button type=\"button\" class=\"chat-message-steer\"><!> <span>Insert now</span></button></div>"), ot = o("<div class=\"chat-message-queue-error\" role=\"alert\"> </div>"), st = o("<section class=\"chat-message-queue\" aria-label=\"Waiting messages\"><div class=\"chat-message-queue-header\"><span>Waiting messages</span><span class=\"chat-message-count\"> </span></div> <div class=\"chat-message-list\"></div> <!></section>"), ct = o("<div class=\"chat-send-feedback\" data-send-state=\"submitting\" role=\"status\" aria-live=\"polite\"><!> <span class=\"chat-send-feedback-content\"><strong>Submitting</strong><span class=\"chat-send-feedback-text\"> </span></span></div>"), lt = o("<button type=\"button\" id=\"agentEndTurnButton\" title=\"End current turn\" aria-label=\"End current turn\"><span class=\"chat-composer-icon chat-composer-icon-idle\"><!></span><span class=\"chat-composer-icon chat-composer-icon-busy\"><!></span></button>"), ut = o("<button type=\"button\" id=\"agentEndGenerationButton\" title=\"End current generation\" aria-label=\"End current generation\"><span class=\"chat-composer-icon chat-composer-icon-idle\"><!></span><span class=\"chat-composer-icon chat-composer-icon-busy\"><!></span></button>"), dt = o("<div class=\"chat-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), ft = o("<!> <!> <!> <form id=\"chatForm\" class=\"chat-input\"><textarea id=\"chatInput\" rows=\"1\" autocomplete=\"off\"></textarea> <div class=\"chat-composer-bar\"><button type=\"button\" id=\"agentUploadButton\" class=\"chat-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button> <div class=\"chat-composer-options\"><span class=\"chat-agent-binding\"><!></span> <!> <button type=\"submit\"><span class=\"chat-composer-icon chat-composer-icon-idle\"><!></span><span class=\"chat-composer-icon chat-composer-icon-busy\"><!></span></button></div></div></form> <!>", 1);
function pt(t, r) {
	e(r, !0);
	let i = r.channel.current(), a = T(W(i)), o = T(W(i.identity)), l = T(W(i.draftResetVersion)), f = T(W(i.draft)), p = T(!1), g = T(""), y = T(""), D = T(""), A = T(!1), j = T(void 0), N = w(() => !!n(a).unavailableReason || n(p) || n(a).sending);
	K(() => r.channel.subscribe((e) => {
		n(a), u(a, e, !0), e.identity === n(o) ? e.draftResetVersion !== n(l) && (u(l, e.draftResetVersion, !0), u(f, e.draft, !0), u(y, "")) : (u(o, e.identity, !0), u(l, e.draftResetVersion, !0), u(f, e.draft, !0), u(p, !1), u(g, ""), u(y, ""), u(D, ""), u(A, !1)), queueMicrotask(e.onIconsChanged);
	})), x(() => {
		n(f), S().then(H);
	});
	function P() {
		return {
			workspaceId: n(a).workspaceId,
			resourceId: n(a).resourceId,
			draftKey: n(a).draftKey
		};
	}
	function I(e) {
		u(f, e, !0), u(y, ""), n(a).onDraft(e, P());
	}
	async function R(e) {
		e?.preventDefault();
		let t = n(f);
		if (n(N) || !t.trim() || !n(a).workspaceId || !n(a).resourceId) return;
		let r = n(o), i = P();
		u(p, !0), u(g, t, !0), u(y, "");
		try {
			let e = await n(a).onSend(t, i);
			if (n(o) !== r) return;
			if (!e.accepted) {
				u(g, ""), u(y, "Message was not accepted. Please try again.");
				return;
			}
			e.clear && n(f) === t && I(""), u(g, "");
		} catch (e) {
			n(o) === r && (u(g, ""), u(y, e instanceof Error ? e.message : String(e), !0));
		} finally {
			n(o) === r && (u(p, !1), await S(), n(j)?.focus({ preventScroll: !0 }));
		}
	}
	async function B(e) {
		if (!(!n(a).canSteerWaiting || n(a).steeringMessageId)) {
			u(D, "");
			try {
				await n(a).onSteerWaiting(e);
			} catch (e) {
				u(D, e instanceof Error ? e.message : String(e), !0);
			}
		}
	}
	function V(e) {
		if (!(e.key !== "Enter" || e.isComposing || e.keyCode === 229)) {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault(), R();
				return;
			}
			if (e.shiftKey) {
				u(A, !0);
				return;
			}
			n(A) || (e.preventDefault(), R());
		}
	}
	function H() {
		if (!n(j)) return;
		n(j).style.height = "auto";
		let e = Math.min(n(j).scrollHeight, 160);
		n(j).style.height = `${e}px`, n(j).style.overflowY = n(j).scrollHeight > 160 ? "auto" : "hidden";
	}
	function G(e) {
		n(a).onSaveAgentBinding(e);
	}
	var ee = ft(), te = s(ee), ne = (e) => {
		var t = it(), r = C(t), i = C(r, !0);
		q(r);
		var o = d(r, 2);
		q(t), c(() => L(i, n(a).stopNotice)), v("click", o, function(...e) {
			n(a).onDismissStopNotice?.apply(this, e);
		}), m(e, t);
	};
	h(te, (e) => {
		n(a).stopNotice && e(ne);
	});
	var re = d(te, 2), ie = (e) => {
		var t = st(), r = C(t), i = d(C(r)), o = C(i, !0);
		q(i), q(r);
		var s = d(r, 2);
		b(s, 21, () => n(a).waitingMessages, (e) => e.messageId, (e, t) => {
			var r = at(), i = C(r), o = C(i, !0);
			q(i);
			var s = d(i, 2), l = C(s, !0);
			q(s);
			var u = d(s, 2), f = C(u), p = (e) => {
				O(e, { name: "loader-circle" });
			}, g = (e) => {
				O(e, { name: "corner-up-left" });
			};
			h(f, (e) => {
				n(a).steeringMessageId === n(t).messageId ? e(p) : e(g, -1);
			}), M(2), q(u), q(r), c((e) => {
				U(r, "data-message-id", n(t).messageId), U(i, "title", n(t).text), L(o, n(t).text), L(l, n(t).actualMode || n(t).requestedMode), u.disabled = e, U(u, "title", n(a).canSteerWaiting ? "Insert this waiting message into the current turn" : "Available when the current turn supports steer"), U(u, "aria-label", `Insert waiting message into current turn: ${n(t).text}`);
			}, [() => !n(a).canSteerWaiting || !!n(a).steeringMessageId]), v("click", u, () => B(n(t).messageId)), m(e, r);
		}), q(s);
		var l = d(s, 2), u = (e) => {
			var t = ot(), r = C(t, !0);
			q(t), c(() => L(r, n(D))), m(e, t);
		};
		h(l, (e) => {
			n(D) && e(u);
		}), q(t), c(() => L(o, n(a).waitingMessages.length)), m(e, t);
	};
	h(re, (e) => {
		n(a).waitingMessages.length && e(ie);
	});
	var ae = d(re, 2), oe = (e) => {
		var t = ct(), r = C(t);
		O(r, { name: "loader-circle" });
		var i = d(r, 2), a = d(C(i)), o = C(a, !0);
		q(a), q(i), q(t), c(() => L(o, n(g))), m(e, t);
	};
	h(ae, (e) => {
		n(g) && e(oe);
	});
	var se = d(ae, 2), Y = C(se);
	E(Y), z(Y, (e) => u(j, e), () => n(j));
	var ce = d(Y, 2), le = C(ce), ue = C(le);
	O(ue, { name: "plus" }), q(le);
	var de = d(le, 2), fe = C(de), pe = C(fe);
	{
		let e = w(() => n(N) || n(a).bindingSaving);
		rt(pe, {
			get value() {
				return n(a).agentBinding;
			},
			get profiles() {
				return n(a).agentProfiles;
			},
			get agents() {
				return n(a).agents;
			},
			get disabled() {
				return n(e);
			},
			ariaLabel: "Binding target",
			onSelect: G
		});
	}
	q(fe);
	var me = d(fe, 2), he = (e) => {
		var t = lt();
		let r;
		var i = C(t), o = C(i);
		O(o, { name: "pause" }), q(i);
		var s = d(i), l = C(s);
		O(l, { name: "loader-circle" }), q(s), q(t), c(() => {
			r = k(t, 1, "chat-composer-action chat-end-turn-button", null, r, { busy: n(a).endingTurn }), t.disabled = n(a).endingTurn;
		}), v("click", t, function(...e) {
			n(a).onEndTurn?.apply(this, e);
		}), m(e, t);
	}, ge = (e) => {
		var t = ut();
		let r;
		var i = C(t), o = C(i);
		O(o, { name: "archive" }), q(i);
		var s = d(i), l = C(s);
		O(l, { name: "loader-circle" }), q(s), q(t), c(() => {
			r = k(t, 1, "chat-composer-action chat-end-generation-button", null, r, { busy: n(a).endingGeneration }), t.disabled = n(a).endingGeneration;
		}), v("click", t, function(...e) {
			n(a).onEndGeneration?.apply(this, e);
		}), m(e, t);
	};
	h(me, (e) => {
		n(a).canEndTurn ? e(he) : n(a).canEndGeneration && e(ge, 1);
	});
	var _e = d(me, 2);
	let ve;
	var ye = C(_e), be = C(ye);
	O(be, { name: "send" }), q(ye);
	var xe = d(ye), Se = C(xe);
	O(Se, { name: "loader-circle" }), q(xe), q(_e), q(de), q(ce), q(se);
	var Ce = d(se, 2), we = (e) => {
		var t = dt(), r = C(t), i = C(r, !0);
		q(r);
		var a = d(r);
		q(t), c(() => {
			L(i, n(y)), a.disabled = n(p);
		}), v("click", a, () => R()), m(e, t);
	};
	h(Ce, (e) => {
		n(y) && e(we);
	}), c((e) => {
		U(Y, "data-agent-draft-key", n(a).draftKey), U(Y, "placeholder", n(a).unavailableReason || "Message this resource"), Y.disabled = n(N), F(Y, n(f)), le.disabled = e, ve = k(_e, 1, "chat-send-button", null, ve, { busy: n(p) }), U(_e, "title", n(p) ? "Sending..." : n(a).unavailableReason || "Send input"), U(_e, "aria-label", n(p) ? "Sending..." : n(a).unavailableReason || "Send input"), _e.disabled = n(N);
	}, [() => !!n(a).unavailableReason]), J("submit", se, R), v("input", Y, (e) => I(e.currentTarget.value)), v("keydown", Y, V), v("click", le, function(...e) {
		n(a).onOpenUpload?.apply(this, e);
	}), m(t, ee), _();
}
f([
	"click",
	"input",
	"keydown"
]);
//#endregion
//#region src/components/ConfirmDialog.svelte
var mt = o("<div class=\"confirm-dialog-layer\" role=\"presentation\"><button class=\"confirm-dialog-backdrop modal-enter\" type=\"button\"></button> <div class=\"confirm-dialog modal-enter\" role=\"alertdialog\" aria-modal=\"true\"><header class=\"confirm-dialog-header\"><span><!></span> <strong> </strong></header> <div class=\"confirm-dialog-content\"><p> </p></div> <footer class=\"confirm-dialog-footer\"><button type=\"button\" class=\"secondary-button\"> </button> <button type=\"button\"> </button></footer></div></div>");
function ht(t, r) {
	e(r, !0);
	let i = T(W(r.channel.current())), a = T(void 0);
	K(() => {
		let e = r.channel.subscribe((e) => {
			let t = n(i).open;
			u(i, e, !0), e.open && !t && queueMicrotask(() => {
				n(a)?.focus({ preventScroll: !0 }), window.lucide?.createIcons({ attrs: { "stroke-width": 2 } });
			});
		}), t = (e) => {
			n(i).open && (e.key === "Escape" ? (e.preventDefault(), n(i).onResult(!1)) : e.key === "Enter" && (e.preventDefault(), n(i).onResult(!0)));
		};
		return document.addEventListener("keydown", t), () => {
			e(), document.removeEventListener("keydown", t);
		};
	});
	var o = g(), l = s(o), f = (e) => {
		var t = mt(), r = C(t), o = d(r, 2), s = C(o), l = C(s);
		let f;
		var p = C(l);
		{
			let e = w(() => n(i).danger ? "triangle-alert" : "circle-help");
			O(p, { get name() {
				return n(e);
			} });
		}
		q(l);
		var h = d(l, 2), g = C(h, !0);
		q(h), q(s);
		var _ = d(s, 2), y = C(_), b = C(y, !0);
		q(y), q(_);
		var x = d(_, 2), S = C(x), T = C(S, !0);
		q(S);
		var E = d(S, 2);
		let D;
		var A = C(E, !0);
		q(E), z(E, (e) => u(a, e), () => n(a)), q(x), q(o), q(t), c(() => {
			U(r, "aria-label", n(i).cancelLabel), U(o, "aria-label", n(i).title), f = k(l, 1, "confirm-dialog-icon", null, f, { "confirm-dialog-icon-danger": n(i).danger }), L(g, n(i).title), L(b, n(i).message), L(T, n(i).cancelLabel), D = k(E, 1, "confirm-dialog-confirm", null, D, { "confirm-dialog-confirm-danger": n(i).danger }), L(A, n(i).confirmLabel);
		}), v("click", r, () => n(i).onResult(!1)), v("click", S, () => n(i).onResult(!1)), v("click", E, () => n(i).onResult(!0)), m(e, t);
	};
	h(l, (e) => {
		n(i).open && e(f);
	}), m(t, o), _();
}
f(["click"]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var gt = o("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function _t(t, n) {
	e(n, !0);
	let r = A(n, "draft", 7);
	var i = gt(), a = C(i);
	E(a);
	var o = d(a, 2);
	N(o), q(i), c(() => {
		F(a, r().description), F(o, r().slug);
	}), v("input", a, (e) => r().description = e.currentTarget.value), v("input", o, (e) => r().slug = e.currentTarget.value), m(t, i), _();
}
f(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var vt = o("<button type=\"button\" class=\"secondary compact\"> </button>"), yt = o("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), bt = o("<p class=\"create-task-preview-hint\">Updating preview...</p>"), xt = o("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), St = o("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Ct = o("<small> </small>"), wt = o("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), Tt = o("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), Et = o("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Dt = o("<!> <!> <!>", 1), Ot = o("<p class=\"create-task-blank-detail\"> </p>"), kt = o("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), At = o("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), jt = o("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function Mt(t, r) {
	e(r, !0);
	let i = A(r, "draft", 7), a = T(W(i().editedMarkdown ?? "")), o = null, l = w(() => !!r.preview && n(a) !== r.preview?.markdown);
	x(() => {
		let e = r.preview?.markdown ?? null;
		if (e === o) return;
		let t = i().editedMarkdown == null || i().editedMarkdown === o;
		o = e, t && (u(a, e ?? "", !0), i().editedMarkdown = e);
	});
	function f(e) {
		u(a, e, !0), i().editedMarkdown = e;
	}
	function p() {
		u(a, r.preview?.markdown ?? "", !0), i().editedMarkdown = r.preview?.markdown ?? null;
	}
	var g = jt(), y = C(g), b = d(C(y), 2), S = (e) => {
		var t = vt(), n = C(t, !0);
		q(t), c(() => {
			t.disabled = r.previewing || r.submitting, L(n, r.previewing ? "Rendering..." : "Refresh");
		}), v("click", t, function(...e) {
			r.onRefresh?.apply(this, e);
		}), m(e, t);
	};
	h(b, (e) => {
		r.selectedTemplate && e(S);
	}), q(y);
	var D = d(y, 2), O = (e) => {
		var t = Dt(), o = s(t), u = (e) => {
			var t = yt(), n = C(t, !0);
			q(t), c(() => L(n, r.previewError)), m(e, t);
		};
		h(o, (e) => {
			r.previewError && e(u);
		});
		var g = d(o, 2), _ = (e) => {
			var t = bt();
			m(e, t);
		};
		h(g, (e) => {
			!r.previewError && r.stale && r.preview && e(_);
		});
		var y = d(g, 2), b = (e) => {
			var t = wt(), o = C(t), s = C(o, !0);
			q(o);
			var u = d(o, 2);
			E(u);
			var g = d(u, 2), _ = (e) => {
				var t = xt(), n = d(C(t), 2);
				q(t), v("click", n, p), m(e, t);
			}, y = (e) => {
				var t = St();
				m(e, t);
			};
			h(g, (e) => {
				n(l) ? e(_) : e(y, -1);
			});
			var b = d(g, 2), x = (e) => {
				var t = Ct(), n = C(t);
				q(t), c(() => L(n, `Slug: ${r.preview.slug ?? ""}`)), m(e, t);
			};
			h(b, (e) => {
				r.preview.slug && e(x);
			});
			var S = d(b, 2), w = (e) => {
				var t = Ct(), n = C(t);
				q(t), c(() => L(n, `Template ${i().templateName ?? ""} · ${r.templateDigest ?? ""}`)), m(e, t);
			};
			h(S, (e) => {
				r.templateDigest && e(w);
			}), q(t), c(() => {
				L(s, r.preview.title), F(u, n(a));
			}), v("input", u, (e) => f(e.currentTarget.value)), m(e, t);
		}, x = (e) => {
			var t = Tt();
			m(e, t);
		}, S = (e) => {
			var t = Et();
			m(e, t);
		};
		h(y, (e) => {
			r.preview ? e(b) : r.previewing ? e(x, 1) : r.previewError || e(S, 2);
		}), m(e, t);
	}, k = (e) => {
		var t = At(), r = C(t), a = C(r, !0);
		q(r);
		var o = d(r, 2), s = (e) => {
			var t = Ot(), n = C(t, !0);
			q(t), c(() => L(n, i().detail)), m(e, t);
		}, l = w(() => i().detail.trim()), u = (e) => {
			var t = kt();
			m(e, t);
		};
		h(o, (e) => {
			n(l) ? e(s) : e(u, -1);
		});
		var f = d(o, 2), p = (e) => {
			var t = Ct(), n = C(t);
			q(t), c((e) => L(n, `Slug: ${e ?? ""}`), [() => i().slug.trim()]), m(e, t);
		}, g = w(() => i().slug.trim());
		h(f, (e) => {
			n(g) && e(p);
		}), q(t), c((e) => L(a, e), [() => i().title.trim() || "Untitled task"]), m(e, t);
	};
	h(D, (e) => {
		r.selectedTemplate ? e(O) : e(k, -1);
	}), q(g), m(t, g), _();
}
f(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var Nt = o("<input type=\"checkbox\"/><span> </span>", 1), Pt = o("<span> </span>"), Ft = o("<textarea></textarea>"), It = o("<option> </option>"), Lt = o("<select><option>Select...</option><!></select>"), Rt = o("<input/>"), zt = o("<small> </small>"), Bt = o("<label><!> <!> <!> <!> <!></label>"), Vt = o("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function Ht(t, r) {
	e(r, !0);
	function i(e, t) {
		let n = t.currentTarget;
		r.onChange(e, e.type === "boolean" && n instanceof HTMLInputElement ? n.checked : n.value);
	}
	var o = Vt();
	b(o, 21, () => r.fields, (e) => e.name, (e, t) => {
		var o = Bt();
		let l;
		var u = C(o), f = (e) => {
			var a = Nt(), o = s(a);
			N(o);
			var l = d(o), u = C(l);
			q(l), c(() => {
				B(o, r.values[n(t).name] === !0), L(u, `${n(t).label ?? ""}${n(t).required ? " *" : ""}`);
			}), v("change", o, (e) => i(n(t), e)), m(e, a);
		}, p = (e) => {
			var r = Pt(), i = C(r);
			q(r), c(() => L(i, `${n(t).label ?? ""}${n(t).required ? " *" : ""}`)), m(e, r);
		};
		h(u, (e) => {
			n(t).type === "boolean" ? e(f) : e(p, -1);
		});
		var g = d(u, 2), _ = (e) => {
			var a = Ft();
			E(a), c((e) => {
				a.required = n(t).required, U(a, "placeholder", n(t).placeholder || ""), F(a, e);
			}, [() => String(r.values[n(t).name] ?? "")]), v("input", a, (e) => i(n(t), e)), m(e, a);
		};
		h(g, (e) => {
			n(t).type === "textarea" && e(_);
		});
		var y = d(g, 2), x = (e) => {
			var o = Lt(), s = C(o);
			s.value = s.__value = "";
			var l = d(s);
			b(l, 17, () => n(t).options || [], a, (e, t) => {
				var r = It(), i = C(r, !0);
				q(r);
				var a = {};
				c(() => {
					L(i, n(t)), a !== (a = n(t)) && (r.value = (r.__value = n(t)) ?? "");
				}), m(e, r);
			}), q(o);
			var u;
			D(o), c((e) => {
				o.required = n(t).required, u !== (u = e) && (o.value = (o.__value = e) ?? "", ne(o, e));
			}, [() => String(r.values[n(t).name] ?? "")]), v("change", o, (e) => i(n(t), e)), m(e, o);
		};
		h(y, (e) => {
			n(t).type === "select" && e(x);
		});
		var S = d(y, 2), w = (e) => {
			var a = Rt();
			N(a), c((e) => {
				a.required = n(t).required, U(a, "placeholder", n(t).placeholder || ""), F(a, e);
			}, [() => String(r.values[n(t).name] ?? "")]), v("input", a, (e) => i(n(t), e)), m(e, a);
		};
		h(S, (e) => {
			n(t).type === "text" && e(w);
		});
		var T = d(S, 2), O = (e) => {
			var r = zt(), i = C(r, !0);
			q(r), c(() => L(i, n(t).description)), m(e, r);
		};
		h(T, (e) => {
			n(t).description && e(O);
		}), q(o), c(() => l = k(o, 1, "", null, l, { "template-boolean": n(t).type === "boolean" })), m(e, o);
	}), q(o), c(() => U(o, "aria-label", r.label)), m(t, o), _();
}
f(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var Ut = o("<small> </small>"), Wt = o("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), Gt = o("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function Kt(t, r) {
	e(r, !0);
	function i(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var a = Gt(), o = d(C(a), 2), s = C(o);
	let l;
	var u = d(C(s), 4), f = C(u);
	O(f, { name: "check" }), q(u), q(s);
	var p = d(s, 2);
	b(p, 17, () => r.templates, (e) => e.name, (e, t) => {
		var a = Wt();
		let o;
		var s = C(a), l = C(s, !0);
		q(s);
		var u = d(s, 2), f = (e) => {
			var r = Ut(), i = C(r, !0);
			q(r), c(() => L(i, n(t).description)), m(e, r);
		};
		h(u, (e) => {
			n(t).description && e(f);
		});
		var p = d(u, 2), g = C(p);
		O(g, { name: "check" }), q(p), q(a), c((e) => {
			U(a, "aria-selected", r.selectedName === n(t).name), o = k(a, 1, "template-card", null, o, { selected: r.selectedName === n(t).name }), a.disabled = !n(t).valid || r.disabled, L(l, e);
		}, [() => i(n(t))]), v("click", a, () => r.onSelect(n(t).name)), m(e, a);
	}), q(o), q(a), c(() => {
		U(s, "aria-selected", r.selectedName === ""), l = k(s, 1, "template-card", null, l, { selected: r.selectedName === "" }), s.disabled = r.disabled;
	}), v("click", s, () => r.onSelect("")), m(t, a), _();
}
f(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var qt = o("<small>(generated by template)</small>"), Jt = o("<small class=\"create-required\">*</small>"), Yt = o("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), Xt = o("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), Zt = o("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), Qt = o("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function $t(t, r) {
	e(r, !0);
	let i = A(r, "draft", 7), a, o = w(() => r.model.templates.find((e) => e.name === i().templateName)), s = w(() => r.model.preview?.title || ""), l = w(() => i().titleOverride ? i().title : n(s)), u = w(() => (n(o)?.fields || []).filter((e) => e.required)), f = w(() => (n(o)?.fields || []).filter((e) => !e.required)), p = w(() => !r.model.preview || r.model.previewKey !== r.model.previewRequestKey(i()));
	H(() => {
		a && clearTimeout(a);
	});
	function g() {
		return {
			...i(),
			templateFields: { ...i().templateFields }
		};
	}
	function y(e) {
		return e.hasDefault ? e.default ?? "" : e.type !== "boolean" && "";
	}
	function b(e = 450) {
		a && clearTimeout(a), a = setTimeout(() => {
			a = void 0, i().templateName && n(p) && !r.model.submitting && r.model.onPreview(g());
		}, e);
	}
	async function x(e) {
		if (r.model.submitting || e === i().templateName || (Object.values(i().templateFields).some((e) => !!e) || i().titleOverride || i().editedMarkdown != null) && !await r.model.onConfirmTemplateSwitch()) return;
		let t = r.model.templates.find((t) => t.name === e);
		i().templateName = e, i().templateFields = {};
		for (let e of t?.fields || []) i().templateFields[e.name] = y(e);
		i().title = "", i().titleOverride = !1, i().editedMarkdown = null, b(150);
	}
	function S(e, t) {
		i().templateFields[e.name] = t, b();
	}
	function T(e) {
		i().title = e, i().templateName && (i().titleOverride = !0), b();
	}
	function D() {
		i().title = "", i().titleOverride = !1, b();
	}
	async function O() {
		!r.model.previewing && !r.model.submitting && await r.model.onPreview(g());
	}
	var k = Qt(), j = C(k), M = C(j), P = (e) => {
		Kt(e, {
			get templates() {
				return r.model.templates;
			},
			get selectedName() {
				return i().templateName;
			},
			get disabled() {
				return r.model.submitting;
			},
			onSelect: x
		});
	};
	h(M, (e) => {
		r.model.templates.length && e(P);
	});
	var I = d(M, 2), L = d(C(I), 2), R = C(L), z = C(R), B = d(C(z)), V = (e) => {
		var t = qt();
		m(e, t);
	}, W = (e) => {
		var t = Jt();
		m(e, t);
	};
	h(B, (e) => {
		n(o)?.taskTitle && !i().titleOverride ? e(V) : e(W, -1);
	}), q(z);
	var G = d(z, 2), K = C(G);
	N(K);
	var ee = d(K, 2), te = (e) => {
		var t = Yt();
		v("click", t, D), m(e, t);
	};
	h(ee, (e) => {
		n(o)?.taskTitle && i().titleOverride && e(te);
	}), q(G), q(R);
	var ne = d(R, 2), re = d(C(ne), 2), ie = d(C(re), 2);
	N(ie), q(re), q(ne), q(L), q(I);
	var ae = d(I, 2), J = (e) => {
		var t = Xt(), r = d(C(t), 2), a = (e) => {
			Ht(e, {
				get fields() {
					return n(u);
				},
				get values() {
					return i().templateFields;
				},
				label: "Required template fields",
				onChange: S
			});
		};
		h(r, (e) => {
			n(u).length && e(a);
		});
		var o = d(r, 2), s = (e) => {
			Ht(e, {
				get fields() {
					return n(f);
				},
				get values() {
					return i().templateFields;
				},
				label: "Optional template fields",
				onChange: S
			});
		};
		h(o, (e) => {
			n(f).length && e(s);
		}), q(t), m(e, t);
	}, oe = (e) => {
		var t = Zt(), n = d(C(t), 2);
		E(n), q(t), c(() => F(n, i().detail)), v("input", n, (e) => i().detail = e.currentTarget.value), m(e, t);
	};
	h(ae, (e) => {
		n(o) ? e(J) : e(oe, -1);
	}), q(j), Mt(d(j, 2), {
		get draft() {
			return i();
		},
		get selectedTemplate() {
			return n(o);
		},
		get preview() {
			return r.model.preview;
		},
		get previewing() {
			return r.model.previewing;
		},
		get previewError() {
			return r.model.previewError;
		},
		get stale() {
			return n(p);
		},
		get templateDigest() {
			return r.model.templateDigest;
		},
		get submitting() {
			return r.model.submitting;
		},
		onRefresh: O
	}), q(k), c(() => {
		K.required = !n(o)?.taskTitle, F(K, n(o)?.taskTitle ? n(l) : i().title), U(K, "placeholder", n(o)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), F(ie, i().slug);
	}), v("input", K, (e) => T(e.currentTarget.value)), v("input", ie, (e) => {
		i().slug = e.currentTarget.value, b();
	}), m(t, k), _();
}
f(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var en = o("<span> </span>"), tn = o("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function nn(t, r) {
	e(r, !0);
	let a = T(W(r.channel.current())), o = T(W(y(n(a).draft))), l = T(""), f = T(void 0), p = w(() => n(o).type === "task");
	K(() => r.channel.subscribe((e) => {
		u(a, e, !0), e.identity !== n(l) && (u(l, e.identity, !0), u(o, y(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), K(() => {
		let e = (e) => {
			if (!n(a).open) return;
			if (e.key === "Escape" && !n(a).submitting) {
				e.preventDefault(), n(a).onClose();
				return;
			}
			if (e.key !== "Tab" || !n(f)) return;
			let t = [...n(f).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
			if (!t.length) return;
			let r = t[0], i = t[t.length - 1];
			e.shiftKey && document.activeElement === r ? (e.preventDefault(), i.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r.focus());
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function y(e) {
		return {
			...e,
			templateFields: { ...e.templateFields }
		};
	}
	async function b(e) {
		e.preventDefault(), n(a).submitting || await n(a).onSubmit(y(n(o)));
	}
	var x = g(), S = s(x), E = (e) => {
		var t = tn(), r = C(t), l = d(r, 2);
		let _;
		var y = C(l), x = C(y), S = C(x), w = C(S, !0);
		q(S);
		var T = d(S, 2), E = (e) => {
			var t = en(), r = C(t, !0);
			q(t), c(() => L(r, n(o).projectId)), m(e, t);
		};
		h(T, (e) => {
			n(p) && e(E);
		}), q(x);
		var D = d(x, 2), A = C(D);
		O(A, { name: "x" }), q(D), q(y);
		var j = d(y, 2), M = C(j);
		i(M, () => n(a).identity, (e) => {
			var t = g(), r = s(t), i = (e) => {
				$t(e, {
					get draft() {
						return n(o);
					},
					get model() {
						return n(a);
					}
				});
			}, c = (e) => {
				_t(e, { get draft() {
					return n(o);
				} });
			};
			h(r, (e) => {
				n(p) ? e(i) : e(c, -1);
			}), m(e, t);
		});
		var N = d(M, 2), P = C(N), F = C(P, !0);
		q(P);
		var I = d(P, 2);
		q(N), q(j), q(l), z(l, (e) => u(f, e), () => n(f)), q(t), c(() => {
			_ = k(l, 1, "create-dialog modal-enter", null, _, { "create-task-dialog": n(p) }), U(l, "aria-label", n(p) ? "Create task" : "Create project"), L(w, n(p) ? "Create task" : "Create project"), D.disabled = n(a).submitting, P.disabled = n(a).submitting, L(F, n(a).submitting ? "Creating..." : "Create"), I.disabled = n(a).submitting;
		}), v("click", r, function(...e) {
			n(a).onClose?.apply(this, e);
		}), v("click", D, function(...e) {
			n(a).onClose?.apply(this, e);
		}), J("submit", j, b), v("click", I, function(...e) {
			n(a).onClose?.apply(this, e);
		}), m(e, t);
	};
	h(S, (e) => {
		n(a).open && e(E);
	}), m(t, x), _();
}
f(["click"]);
//#endregion
//#region src/api/client.ts
var rn = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, an = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, on = class {
	generation = 0;
	active = /* @__PURE__ */ new Map();
	begin(e) {
		this.abort(e);
		let t = {
			scope: e,
			generation: ++this.generation,
			controller: new AbortController()
		};
		return this.active.set(e, t), t;
	}
	assertCurrent(e) {
		if (this.active.get(e.scope)?.generation !== e.generation) throw new an(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new an(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new an(e.scope));
		this.active.clear();
	}
}, sn = class {
	requests = new on();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: ln(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: ln(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof an) ? new an(n) : e;
		} finally {
			this.requests.finish(i);
		}
	}
	dispose() {
		this.requests.dispose();
	}
	resolve(e) {
		return !this.baseURL || /^https?:\/\//.test(e) ? e : new URL(e, this.baseURL).toString();
	}
	async decode(e) {
		if (e.status === 204) return null;
		let t = (e.headers.get("content-type") ?? "").includes("application/json") ? await e.json() : await e.text();
		if (!e.ok) {
			let n = cn(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new rn(e.status, r, n);
		}
		return t;
	}
};
function cn(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function ln(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
//#endregion
//#region src/components/model-channel.ts
function un(e) {
	let t = e, n = /* @__PURE__ */ new Set();
	return {
		current: () => t,
		publish(e) {
			t = e;
			for (let t of n) t(e);
		},
		subscribe(e) {
			return n.add(e), e(t), () => n.delete(e);
		}
	};
}
//#endregion
//#region src/controllers/confirm-dialog-controller.ts
var dn = () => void 0;
function fn() {
	let e = un({
		open: !1,
		revision: 0,
		title: "",
		message: "",
		confirmLabel: "Confirm",
		cancelLabel: "Cancel",
		danger: !1,
		onResult: dn
	}), t = null;
	function n(n) {
		let r = t;
		t = null;
		let i = e.current();
		i.open && e.publish({
			...i,
			open: !1
		}), r && r(n);
	}
	function r(r) {
		return n(!1), new Promise((i) => {
			t = i, e.publish({
				open: !0,
				revision: e.current().revision + 1,
				title: r.title?.trim() || "Please confirm",
				message: r.message,
				confirmLabel: r.confirmLabel?.trim() || "Confirm",
				cancelLabel: r.cancelLabel?.trim() || "Cancel",
				danger: !!r.danger,
				onResult: n
			});
		});
	}
	return {
		channel: e,
		confirm: r
	};
}
var pn = fn(), mn = pn.channel;
function hn(e) {
	return pn.confirm(e);
}
//#endregion
//#region src/components/DiffModal.svelte
var gn = o("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), _n = o("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), vn = o("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), yn = o("<div class=\"diff-viewer\"></div>"), bn = o("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function xn(t, r) {
	e(r, !0);
	let i = T(null), a = T(!1), o = T(""), l = T(void 0), f = w(() => `detail-diff:${r.workspaceId}:${r.resourceId}`);
	x(() => {
		let e = r.repo, t = n(f);
		if (u(i, null), u(o, ""), !e) {
			r.client.requests.abort(t);
			return;
		}
		u(a, !0);
		let s = e.worktreePath || "", c = e.targetBranch || e.baseBranch || "", l = new URLSearchParams({ path: s });
		c && l.set("base", c), r.client.latest(`/api/workspaces/${encodeURIComponent(r.workspaceId)}/diff?${l}`, { scope: t }).then(async (t) => {
			r.repo === e && (u(i, t, !0), await S(), p());
		}).catch((t) => {
			r.repo === e && t?.name !== "StaleResponseError" && (u(o, t instanceof Error ? t.message : String(t), !0), r.onError(n(o)));
		}).finally(() => {
			r.repo === e && (u(a, !1), queueMicrotask(r.onIconsChanged));
		});
	}), x(() => {
		n(i)?.diff, n(l), p();
	}), H(() => r.client.requests.abort(n(f)));
	function p() {
		!n(l) || !n(i)?.diff || !window.Diff2Html || (n(l).innerHTML = window.Diff2Html.html(n(i).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var y = g(), b = s(y), E = (e) => {
		var t = bn(), s = C(t), f = d(s, 2), p = C(f), g = C(p), _ = C(g), y = C(_, !0);
		q(_);
		var b = d(_), x = C(b);
		q(b), q(g);
		var S = d(g), T = C(S);
		O(T, { name: "x" }), q(S), q(p);
		var E = d(p, 2), D = (e) => {
			var t = gn(), n = C(t);
			O(n, { name: "loader-circle" });
			var i = d(n, 2), a = C(i, !0);
			q(i), q(t), c(() => L(a, r.repo.worktreePath || "")), m(e, t);
		}, k = (e) => {
			var t = _n(), r = C(t);
			O(r, { name: "triangle-alert" });
			var i = d(r, 2), a = C(i, !0);
			q(i), q(t), c(() => L(a, n(o))), m(e, t);
		}, A = (e) => {
			var t = vn(), n = C(t);
			O(n, { name: "check-circle-2" }), M(2), q(t), m(e, t);
		}, j = w(() => !n(i)?.hasChanges || !n(i).diff?.trim()), N = (e) => {
			var t = yn();
			z(t, (e) => u(l, e), () => n(l)), m(e, t);
		};
		h(E, (e) => {
			n(a) ? e(D) : n(o) ? e(k, 1) : n(j) ? e(A, 2) : e(N, -1);
		}), q(f), q(t), c(() => {
			L(y, n(i)?.branch || r.repo.branch || r.repo.name || "Diff"), L(x, `${(r.repo.worktreePath || "") ?? ""}${r.repo.targetBranch || r.repo.baseBranch ? ` · base ${r.repo.targetBranch || r.repo.baseBranch}` : ""}`);
		}), v("click", s, function(...e) {
			r.onClose?.apply(this, e);
		}), v("click", S, function(...e) {
			r.onClose?.apply(this, e);
		}), m(e, t);
	};
	h(b, (e) => {
		r.repo && e(E);
	}), m(t, y), _();
}
f(["click"]);
//#endregion
//#region src/controllers/route-controller.ts
function Sn(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function Cn(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: Sn(t[1]),
		resourceId: t[2] === "r" ? Sn(t[3]) : "workspace"
	} : {};
}
function wn(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function Tn(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = wn(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => Cn(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/components/markdown.ts
var En = "[A-Za-z0-9][A-Za-z0-9._-]{0,159}", Dn = RegExp(`^\\[\\[(${En})\\]\\]`), On = null, kn = null;
function An(e, t) {
	if (!window.marked || !window.DOMPurify) return `<pre>${Bn(e)}</pre>`;
	let n = Pn();
	return n ? window.DOMPurify.sanitize(n.parse(String(e ?? ""), {
		breaks: !0,
		gfm: !0,
		forgeMarkdownContext: t
	})) : (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? ""))));
}
function jn(e, t) {
	if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !(e.target instanceof Element)) return;
	let n = e.currentTarget;
	if (!(n instanceof Node)) return;
	let r = e.target.closest("a[data-forge-resource-id]");
	if (r && n.contains(r) && (!r.target || r.target === "_self")) {
		let n = r.dataset.forgeResourceId || "";
		if (zn(n) && t.resolveResourceTitle(n)) {
			e.preventDefault(), t.onNavigate(n);
			return;
		}
	}
	if (!t.onOpenFile) return;
	let i = e.target.closest("a[href^='/']");
	if (!i || !n.contains(i) || i.target && i.target !== "_self") return;
	let a = Mn(i.getAttribute("href") || "");
	a != null && (e.preventDefault(), t.onOpenFile(a));
}
function Mn(e) {
	if (!e.startsWith("/") || e.startsWith("//") || e.startsWith("/w/") || e.startsWith("/api/")) return null;
	let t = e.slice(1);
	if (!t || t === "." || t === "..") return null;
	try {
		return decodeURIComponent(t);
	} catch {
		return t;
	}
}
function Nn(e, t) {
	let n = t, r = (e) => jn(e, n);
	return e.addEventListener("click", r), {
		update(e) {
			n = e;
		},
		destroy() {
			e.removeEventListener("click", r);
		}
	};
}
function Pn() {
	let e = window.marked;
	if (!e?.Marked) return null;
	if (kn && On === e) return kn;
	let t = new e.Marked();
	return t.use({ extensions: [{
		name: "forgeProtectedLink",
		level: "inline",
		tokenizer(e) {
			if (this.lexer.state.inLink || this.lexer.state.inRawBlock) return;
			let t = Fn(e);
			if (t) return {
				type: "forgeProtectedLink",
				raw: t.raw,
				tokens: this.lexer.inlineTokens(t.markdown)
			};
		},
		renderer(e) {
			return this.parser.parseInline(e.tokens);
		},
		childTokens: ["tokens"]
	}, {
		name: "forgeResource",
		level: "inline",
		start(e) {
			return e.indexOf("[[");
		},
		tokenizer(e) {
			if (this.lexer.state.inLink || this.lexer.state.inRawBlock) return;
			let t = Dn.exec(e);
			if (t) return {
				type: "forgeResource",
				raw: t[0],
				resourceId: t[1]
			};
		},
		renderer(e) {
			let t = this.parser.options.forgeMarkdownContext, n = t?.resolveResourceTitle(e.resourceId);
			if (!t || !n) return Bn(e.raw);
			let r = wn(t.workspaceId, e.resourceId);
			return r ? `<a class="forge-resource-reference" href="${Bn(r)}" data-forge-resource-id="${Bn(e.resourceId)}">${Bn(n)}</a>` : Bn(e.raw);
		}
	}] }), On = e, kn = t, t;
}
function Fn(e) {
	let t = e.startsWith("![") ? 1 : e.startsWith("[") ? 0 : -1;
	if (t < 0) return null;
	let n = In(e, t, "[", "]");
	if (n < 0 || e[n + 1] !== "(") return null;
	let r = In(e, n + 1, "(", ")");
	if (r < 0) return null;
	let i = e.slice(t + 1, n), a = Ln(i);
	return a === i ? null : {
		raw: e.slice(0, r + 1),
		markdown: `${e.slice(0, t + 1)}${a}${e.slice(n, r + 1)}`
	};
}
function In(e, t, n, r) {
	let i = 0, a = "";
	for (let o = t; o < e.length; o++) {
		let t = e[o];
		if (t === "\n") return -1;
		if (t === "\\") {
			o++;
			continue;
		}
		if (a) {
			t === a && (a = "");
			continue;
		}
		if (n === "(" && i === 1 && (t === "\"" || t === "'")) {
			a = t;
			continue;
		}
		if (t === "`") {
			let t = Rn(e, o, "`"), n = e.indexOf("`".repeat(t), o + t);
			if (n >= 0) {
				o = n + t - 1;
				continue;
			}
		}
		if (t === n) i++;
		else if (t === r && --i === 0) return o;
	}
	return -1;
}
function Ln(e) {
	let t = "", n = 0;
	for (; n < e.length;) {
		if (e[n] === "\\") {
			t += e.slice(n, n + 2), n += 2;
			continue;
		}
		if (e[n] === "`") {
			let r = Rn(e, n, "`"), i = e.indexOf("`".repeat(r), n + r);
			if (i >= 0) {
				t += e.slice(n, i + r), n = i + r;
				continue;
			}
		}
		let r = Dn.exec(e.slice(n));
		if (r) {
			t += `\\[\\[${r[1]}\\]\\]`, n += r[0].length;
			continue;
		}
		t += e[n++];
	}
	return t;
}
function Rn(e, t, n) {
	let r = 0;
	for (; e[t + r] === n;) r++;
	return r;
}
function zn(e) {
	return RegExp(`^${En}$`).test(e);
}
function Bn(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/detail.ts
function Vn(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function Hn(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function Un(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...Un(a.children || [], t, n, r + 1));
	return i;
}
//#endregion
//#region src/components/FileBrowser.svelte
var Wn = o("<h3><!><span> </span></h3>"), Gn = o("<span class=\"artifact-folder-icon\"><!><!></span>"), Kn = o("<span class=\"artifact-delete\" role=\"button\" tabindex=\"0\"><!></span>"), qn = o("<a class=\"artifact-download\"><!></a><!>", 1), Jn = o("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), Yn = o("<div class=\"empty-list-row\"><!><span> </span></div>"), Xn = o("<div class=\"content-section\" data-component-owner=\"file-browser\"><!> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function Zn(t, r) {
	e(r, !0);
	let i = A(r, "entries", 19, () => []), a = A(r, "emptyMessage", 3, "No files."), o = A(r, "activePath", 3, ""), l = A(r, "showHeading", 3, !0), u = w(() => Un(i(), r.expanded, r.title)), f = w(() => r.title === "Wiki" ? "book-open" : "paperclip");
	function p(e) {
		let t = e.includes(".") && e.split(".").pop()?.toLowerCase() || "";
		return [
			"js",
			"jsx",
			"ts",
			"tsx",
			"go",
			"py",
			"rs",
			"html",
			"css",
			"svelte",
			"json",
			"yaml",
			"yml",
			"toml"
		].includes(t) ? "file-code" : [
			"md",
			"markdown",
			"txt",
			"rst",
			"pdf",
			"log"
		].includes(t) ? "file-text" : [
			"png",
			"jpg",
			"jpeg",
			"gif",
			"svg",
			"webp",
			"ico",
			"avif"
		].includes(t) ? "image" : [
			"zip",
			"tar",
			"gz",
			"tgz",
			"7z"
		].includes(t) ? "archive" : "file";
	}
	var y = Xn(), x = C(y), S = (e) => {
		var t = Wn(), i = C(t);
		O(i, { get name() {
			return n(f);
		} });
		var a = d(i), o = C(a, !0);
		q(a), q(t), c(() => L(o, r.title)), m(e, t);
	};
	h(x, (e) => {
		l() && e(S);
	});
	var T = d(x, 2), E = C(T), D = C(E), j = (e) => {
		var t = g(), i = s(t);
		b(i, 17, () => n(u), (e) => `${r.title}:${e.entry.path}`, (e, t) => {
			let i = w(() => n(t).entry.type === "directory"), a = w(() => r.expanded.has(`${r.title}:${n(t).entry.path}`));
			var l = Jn(), u = C(l);
			let f;
			var g = C(u), _ = C(g), y = C(_), b = (e) => {
				O(e, { name: "chevron-right" });
			};
			h(y, (e) => {
				n(i) && e(b);
			}), q(_);
			var x = d(_), S = (e) => {
				var t = Gn(), n = C(t);
				O(n, {
					name: "folder",
					className: "artifact-icon artifact-icon-dir"
				});
				var r = d(n);
				O(r, {
					name: "folder-open",
					className: "artifact-icon artifact-icon-dir"
				}), q(t), m(e, t);
			}, T = (e) => {
				{
					let r = w(() => p(n(t).entry.name));
					O(e, {
						get name() {
							return n(r);
						},
						className: "artifact-icon"
					});
				}
			};
			h(x, (e) => {
				n(i) ? e(S) : e(T, -1);
			});
			var E = d(x), D = C(E, !0);
			q(E), q(g);
			var A = d(g, 2), j = C(A), M = (e) => {
				var i = qn(), a = s(i), o = C(a);
				O(o, {
					name: "download",
					className: "artifact-download-icon"
				}), q(a);
				var l = d(a), u = (e) => {
					var i = Kn(), a = C(i);
					O(a, {
						name: "trash-2",
						className: "artifact-delete-icon"
					}), q(i), c(() => {
						U(i, "title", `Delete ${n(t).entry.name}`), U(i, "aria-label", `Delete ${n(t).entry.name}`);
					}), v("click", i, (e) => {
						e.preventDefault(), e.stopPropagation(), r.onDelete(n(t).entry.path);
					}), v("keydown", i, (e) => {
						(e.key === "Enter" || e.key === " ") && (e.preventDefault(), e.stopPropagation(), r.onDelete(n(t).entry.path));
					}), m(e, i);
				};
				h(l, (e) => {
					r.onDelete && e(u);
				}), c((e) => {
					U(a, "href", e), U(a, "download", n(t).entry.name), U(a, "title", `Download ${n(t).entry.name}`), U(a, "aria-label", `Download ${n(t).entry.name}`);
				}, [() => r.rawURL(r.title, n(t).entry.path, !0)]), v("click", a, (e) => e.stopPropagation()), m(e, i);
			};
			h(j, (e) => {
				n(i) || e(M);
			});
			var N = d(j), P = C(N, !0);
			q(N), q(A), q(u), q(l), c((e) => {
				f = k(u, 1, "artifact-row", null, f, {
					directory: n(i),
					file: !n(i),
					active: o() === `${r.title}:${n(t).entry.path}`,
					open: n(i) && n(a)
				}), ae(u, `--depth: ${n(t).depth}`), U(E, "title", n(t).entry.path), L(D, n(t).entry.name), L(P, e);
			}, [() => n(i) ? `${(n(t).entry.children || []).length} items` : Hn(n(t).entry.size || 0)]), v("click", u, () => n(i) ? r.onToggle(`${r.title}:${n(t).entry.path}`) : r.onPreview(r.title, n(t).entry.path)), m(e, l);
		}), m(e, t);
	}, M = (e) => {
		var t = Yn(), i = C(t);
		{
			let e = w(() => r.title === "Artifacts" ? "archive" : "inbox");
			O(i, { get name() {
				return n(e);
			} });
		}
		var o = d(i), s = C(o, !0);
		q(o), q(t), c(() => L(s, a())), m(e, t);
	};
	h(D, (e) => {
		n(u).length ? e(j) : e(M, -1);
	}), q(E), q(T), q(y), m(t, y), _();
}
f(["click", "keydown"]);
//#endregion
//#region src/components/LazyMarkdownEditor.svelte
var Qn = o("<div class=\"file-modal-empty error-preview\"><strong>Markdown editor unavailable</strong><span> </span></div>"), $n = o("<div class=\"file-modal-empty\"><strong>Loading Markdown editor…</strong></div>");
function er(e, t) {
	let r = import("./MarkdownEditor-DMept7rK.js");
	var i = g(), a = s(i);
	R(a, () => r, (e) => {
		var t = $n();
		m(e, t);
	}, (e, r) => {
		var i = g(), a = s(i);
		y(a, () => n(r).default, (e, n) => {
			n(e, {
				get identity() {
					return t.identity;
				},
				get file() {
					return t.file;
				},
				get mode() {
					return t.mode;
				},
				get onSave() {
					return t.onSave;
				},
				get onToast() {
					return t.onToast;
				},
				get onIconsChanged() {
					return t.onIconsChanged;
				}
			});
		}), m(e, i);
	}, (e, t) => {
		var r = Qn(), i = d(C(r)), a = C(i, !0);
		q(i), q(r), c((e) => L(a, e), [() => n(t) instanceof Error ? n(t).message : String(n(t))]), m(e, r);
	}), m(e, i);
}
//#endregion
//#region src/components/FilePreviewModal.svelte
var tr = o("<button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button>"), nr = o("<button class=\"secondary-button\" type=\"button\"><!><span>Edit</span></button><button class=\"secondary-button\" type=\"button\"><!><span>Annotate</span></button>", 1), rr = o("<button class=\"secondary-button\" type=\"button\"><!><span>Preview</span></button><button class=\"secondary-button\" type=\"button\"><!><span>Annotate</span></button>", 1), ir = o("<button class=\"secondary-button\" type=\"button\"><!><span>Preview</span></button><button class=\"secondary-button\" type=\"button\"><!><span>Edit</span></button>", 1), ar = o("<button class=\"secondary-button file-modal-open\" type=\"button\" title=\"Open file full screen\" aria-label=\"Open file full screen\"><!><span>Full screen</span></button>"), or = o("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), sr = o("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), cr = o("<div class=\"modal-markdown-editor\"><!></div>"), lr = o("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), ur = o("<div class=\"file-modal-empty\"><!><strong>Preview unavailable</strong><span> </span></div>"), dr = o("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), fr = o("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), pr = o("<div data-component-owner=\"file-preview-modal\" role=\"presentation\"><!> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><!><!><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function mr(t, r) {
	e(r, !0);
	let i = A(r, "fullscreen", 3, !1), a = T(null), o = T(!1), l = T(""), f = T("preview"), p = w(() => `detail-preview:${r.workspaceId}:${r.resourceId}`), y = w(() => r.selection ? `${r.workspaceId}:${r.resourceId}:${r.selection.section}:${r.selection.path}` : ""), b = w(() => r.selection ? `/api/workspaces/${encodeURIComponent(r.workspaceId)}/files/raw?path=${encodeURIComponent(r.selection.path)}` : ""), S = "";
	x(() => {
		let e = r.selection, t = n(p), i = n(y);
		if (i !== S) {
			if (S = i, u(a, null), u(l, ""), u(f, r.editable && e?.mode === "annotate" ? "annotate" : r.editable && e?.mode === "edit" ? "edit" : "preview", !0), !e) {
				r.client.requests.abort(t);
				return;
			}
			u(o, !0), r.client.latest(`/api/workspaces/${encodeURIComponent(r.workspaceId)}/files?path=${encodeURIComponent(e.path)}`, { scope: t }).then((t) => {
				r.selection?.section === e.section && r.selection.path === e.path && u(a, t, !0);
			}).catch((t) => {
				r.selection?.section === e.section && r.selection.path === e.path && t?.name !== "StaleResponseError" && (u(l, t instanceof Error ? t.message : String(t), !0), r.onError(n(l)));
			}).finally(() => {
				r.selection?.section === e.section && r.selection.path === e.path && (u(o, !1), queueMicrotask(r.onIconsChanged));
			});
		}
	}), H(() => r.client.requests.abort(n(p)));
	async function E(e, t) {
		if (!r.selection) throw Error("No Markdown file is selected.");
		let i = await r.onSaveMarkdown(n(a)?.path || r.selection.path, e, t);
		return u(a, i, !0), i;
	}
	function D() {
		if (!r.selection) return;
		let e = n(f), t = e === "edit" || e === "annotate" ? `${r.workspaceId}:${r.resourceId}:${r.selection.path}:${e}` : "", i = t ? G.get(t) : void 0, a = {
			version: 1,
			workspaceId: r.workspaceId,
			resourceId: r.resourceId,
			section: r.selection.section,
			path: r.selection.path,
			mode: e,
			savedAt: Date.now(),
			...i ? {
				baseline: i.baseline,
				baselineHash: i.baselineHash,
				draft: i.draft,
				annotations: i.annotations.map((e) => ({ ...e }))
			} : {}
		};
		try {
			localStorage.setItem(ee, JSON.stringify(a));
		} catch {}
		let o = new URLSearchParams({
			workspaceId: r.workspaceId,
			resourceId: r.resourceId,
			section: r.selection.section,
			path: r.selection.path,
			mode: e,
			editable: r.editable ? "1" : "0"
		});
		window.open(`/file?${o.toString()}`, "_blank", "noopener,noreferrer");
	}
	var j = g(), N = s(j), P = (e) => {
		var t = pr();
		let p;
		var _ = C(t), y = (e) => {
			var t = tr();
			v("click", t, function(...e) {
				r.onClose?.apply(this, e);
			}), m(e, t);
		};
		h(_, (e) => {
			i() || e(y);
		});
		var x = d(_, 2), S = C(x), T = C(S), A = C(T), j = C(A, !0);
		q(A);
		var N = d(A), P = C(N);
		q(N), q(T);
		var F = d(T), I = C(F), R = (e) => {
			var t = g(), r = s(t), i = (e) => {
				var t = nr(), n = s(t), r = C(n);
				O(r, { name: "pencil" }), M(), q(n);
				var i = d(n), a = C(i);
				O(a, { name: "message-square-plus" }), M(), q(i), v("click", n, () => u(f, "edit")), v("click", i, () => u(f, "annotate")), m(e, t);
			}, a = (e) => {
				var t = rr(), n = s(t), r = C(n);
				O(r, { name: "eye" }), M(), q(n);
				var i = d(n), a = C(i);
				O(a, { name: "message-square-plus" }), M(), q(i), v("click", n, () => u(f, "preview")), v("click", i, () => u(f, "annotate")), m(e, t);
			}, o = (e) => {
				var t = ir(), n = s(t), r = C(n);
				O(r, { name: "eye" }), M(), q(n);
				var i = d(n), a = C(i);
				O(a, { name: "pencil" }), M(), q(i), v("click", n, () => u(f, "preview")), v("click", i, () => u(f, "edit")), m(e, t);
			};
			h(r, (e) => {
				n(f) === "preview" ? e(i) : n(f) === "edit" ? e(a, 1) : e(o, -1);
			}), m(e, t);
		}, z = w(() => r.editable && n(a) && !n(a).truncated && !n(a).binary && Vn(n(a).path || r.selection.path));
		h(I, (e) => {
			n(z) && e(R);
		});
		var B = d(I), V = (e) => {
			var t = ar(), n = C(t);
			O(n, { name: "maximize-2" }), M(), q(t), v("click", t, D), m(e, t);
		};
		h(B, (e) => {
			i() || e(V);
		});
		var H = d(B), W = C(H);
		O(W, { name: "x" }), q(H), q(F), q(S);
		var G = d(S, 2), K = (e) => {
			var t = or(), n = C(t);
			O(n, { name: "loader-circle" });
			var i = d(n, 2), a = C(i, !0);
			q(i), q(t), c(() => L(a, r.selection.path)), m(e, t);
		}, ee = (e) => {
			var t = sr(), r = C(t);
			O(r, { name: "triangle-alert" });
			var i = d(r, 2), a = C(i, !0);
			q(i), q(t), c(() => L(a, n(l))), m(e, t);
		}, te = (e) => {
			var t = cr(), i = C(t);
			{
				let e = w(() => `${r.workspaceId}:${r.resourceId}:${r.selection.path}:edit`);
				er(i, {
					get identity() {
						return n(e);
					},
					get file() {
						return n(a);
					},
					mode: "edit",
					onSave: E,
					get onToast() {
						return r.onError;
					},
					get onIconsChanged() {
						return r.onIconsChanged;
					}
				});
			}
			q(t), m(e, t);
		}, ne = (e) => {
			var t = cr(), i = C(t);
			{
				let e = w(() => `${r.workspaceId}:${r.resourceId}:${r.selection.path}:annotate`);
				er(i, {
					get identity() {
						return n(e);
					},
					get file() {
						return n(a);
					},
					mode: "annotate",
					onSave: E,
					get onToast() {
						return r.onError;
					},
					get onIconsChanged() {
						return r.onIconsChanged;
					}
				});
			}
			q(t), m(e, t);
		}, ae = (e) => {
			var t = lr(), i = C(t);
			q(t), c(() => {
				U(i, "src", n(b)), U(i, "alt", n(a).name || r.selection.path);
			}), m(e, t);
		}, J = (e) => {
			var t = ur(), i = C(t);
			O(i, { name: "file-warning" });
			var o = d(i, 2), s = C(o);
			q(o), q(t), c((e) => L(s, `${(n(a).name || r.selection.path) ?? ""} · Binary file, ${e ?? ""}.`), [() => Hn(n(a).size || 0)]), m(e, t);
		}, oe = (e) => {
			var t = dr();
			re(t, () => An(n(a)?.content || "", {
				workspaceId: r.workspaceId,
				resolveResourceTitle: r.resolveResourceTitle
			}), !0), q(t), ie(t, (e, t) => Nn?.(e, t), () => ({
				resolveResourceTitle: r.resolveResourceTitle,
				onNavigate: r.onNavigate,
				onOpenFile: r.onOpenFile
			})), m(e, t);
		}, se = w(() => Vn(n(a)?.path || r.selection.path)), Y = (e) => {
			var t = fr(), r = C(t, !0);
			q(t), c(() => L(r, n(a)?.content || "")), m(e, t);
		};
		h(G, (e) => {
			n(o) ? e(K) : n(l) ? e(ee, 1) : n(a) && n(f) === "edit" ? e(te, 2) : n(a) && n(f) === "annotate" ? e(ne, 3) : n(a)?.image ? e(ae, 4) : n(a)?.binary ? e(J, 5) : n(se) ? e(oe, 6) : e(Y, -1);
		}), q(x), q(t), c((e, o) => {
			p = k(t, 1, "file-modal-layer", null, p, { fullscreen: i() }), U(x, "data-preview-identity", `${r.workspaceId}:${r.resourceId}:${r.selection.section}:${r.selection.path}:${n(a)?.contentHash || "pending"}`), L(j, e), L(P, `${r.selection.path ?? ""}${o ?? ""}${n(a)?.truncated ? " · truncated" : ""}`);
		}, [() => n(a)?.name || r.selection.path.split("/").pop() || "File preview", () => n(a)?.size == null ? "" : ` · ${Hn(n(a).size)}`]), v("click", H, function(...e) {
			r.onClose?.apply(this, e);
		}), m(e, t);
	};
	h(N, (e) => {
		r.selection && e(P);
	}), m(t, j), _();
}
f(["click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var hr = o("<p class=\"approval-question\"> </p>"), gr = o("<p> </p>"), _r = o("<button> </button>"), vr = o("<div class=\"approval-options\"></div>"), yr = o("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), br = o("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), xr = o("<!> <!>", 1), Sr = o("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function Cr(t, r) {
	e(r, !0);
	let i = T(""), a = T(!1), o = T(W(l()));
	x(() => {
		let e = l();
		e !== n(o) && (u(o, e, !0), u(i, ""), u(a, !1));
	});
	function l() {
		return `${r.contextIdentity}:${String(r.item.approvalId || "")}`;
	}
	async function f(e) {
		let t = String(r.item.approvalId || "");
		if (!(!t || n(a))) {
			u(a, !0);
			try {
				await r.onApproval(r.generationId, t, e), u(i, "");
			} catch (e) {
				r.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				u(a, !1);
			}
		}
	}
	function p(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	var g = Sr(), y = C(g), S = C(y);
	O(S, { name: "shield-question" });
	var w = d(S), E = C(w, !0);
	q(w), q(y);
	var D = d(y, 2), A = (e) => {
		var t = hr(), n = C(t, !0);
		q(t), c(() => L(n, r.item.question)), m(e, t);
	};
	h(D, (e) => {
		r.item.question && e(A);
	});
	var P = d(D, 2), F = (e) => {
		var t = gr(), n = C(t, !0);
		q(t), c(() => L(n, r.item.detail)), m(e, t);
	};
	h(P, (e) => {
		r.item.detail && e(F);
	});
	var I = d(P, 2), R = (e) => {
		var t = xr(), o = s(t), l = (e) => {
			var t = vr();
			b(t, 21, () => r.item.options, (e) => e.optionId, (e, t) => {
				var r = _r();
				let i;
				var o = C(r, !0);
				q(r), c((e, t) => {
					r.disabled = n(a), i = k(r, 1, "", null, i, e), L(o, t);
				}, [() => ({ "secondary-button": String(n(t).kind || "").startsWith("reject") }), () => p(n(t))]), v("click", r, () => f({ optionId: n(t).optionId })), m(e, r);
			}), q(t), m(e, t);
		}, g = (e) => {
			var t = yr(), r = C(t), i = C(r);
			O(i, { name: "check" }), M(), q(r);
			var o = d(r), s = C(o);
			O(s, { name: "x" }), M(), q(o), q(t), c(() => {
				r.disabled = n(a), o.disabled = n(a);
			}), v("click", r, () => f({ decision: "accept" })), v("click", o, () => f({ decision: "decline" })), m(e, t);
		};
		h(o, (e) => {
			r.item.options?.length ? e(l) : e(g, -1);
		});
		var _ = d(o, 2), y = (e) => {
			var t = br(), r = C(t);
			N(r);
			var o = d(r);
			q(t), c((e) => o.disabled = e, [() => !n(i).trim() || n(a)]), J("submit", t, (e) => {
				e.preventDefault(), n(i).trim() && f({ text: n(i).trim() });
			}), j(r, () => n(i), (e) => u(i, e)), m(e, t);
		};
		h(_, (e) => {
			r.item.question && e(y);
		}), m(e, t);
	}, z = (e) => {
		var t = gr(), n = C(t);
		q(t), c(() => L(n, `${(r.item.decision || (r.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${r.item.reply ? `: ${r.item.reply}` : ""}`)), m(e, t);
	};
	h(I, (e) => {
		r.item.status === "pending" ? e(R) : e(z, -1);
	}), q(g), c(() => L(E, r.item.title || "Approval requested")), m(t, g), _();
}
f(["click"]);
//#endregion
//#region vendor/agenthub-event-timeline/index.mjs
var wr = 400, Tr = 12e3;
function Er(e, t = wr) {
	let n = String(e ?? "");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Dr(e) {
	if (e == null) return "";
	try {
		return Er(JSON.stringify(e));
	} catch {
		return "";
	}
}
function Or(e) {
	let t = String(e || "").replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function kr(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string").join(" ") : typeof e == "string" ? e : "";
}
function X(...e) {
	for (let t of e) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
var Ar = /* @__PURE__ */ new Set([
	"user",
	"system",
	"agent",
	"assistant"
]);
function jr(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return;
	let t = {};
	for (let n of [
		"id",
		"name",
		"sessionId"
	]) typeof e[n] == "string" && e[n].trim() && (t[n] = e[n].trim());
	return Object.keys(t).length ? t : void 0;
}
function Mr(e) {
	let t = typeof e == "string" ? e.trim().toLowerCase() : "";
	return Ar.has(t) ? t : "user";
}
function Nr(e) {
	let t = String(e || "").toLowerCase();
	return [
		"completed",
		"complete",
		"done",
		"success",
		"succeeded"
	].includes(t) ? "completed" : [
		"failed",
		"failure",
		"error",
		"declined",
		"denied",
		"cancelled",
		"canceled"
	].includes(t) ? "failed" : "running";
}
function Pr(e) {
	if (!Array.isArray(e)) return "";
	let t = [];
	for (let n of e) typeof n?.text == "string" ? t.push(n.text) : typeof n?.content?.text == "string" ? t.push(n.content.text) : n?.type === "diff" && typeof n?.path == "string" && t.push(`Edit ${n.path}`);
	return t.filter(Boolean).join("\n");
}
function Fr(e) {
	let t = e?.data ?? {}, n = typeof t.method == "string" ? t.method : "", r = t.raw && typeof t.raw == "object" ? t.raw : {}, i = e?.time || "";
	if (n.startsWith("item/") || n.startsWith("command/")) {
		if (n === "item/commandExecution/outputDelta" || n === "command/exec/outputDelta") {
			let e = X(r.itemId, r.callId, r.id);
			return e ? {
				callId: e,
				method: n,
				time: i,
				deltaOnly: !0,
				output: typeof r.delta == "string" ? r.delta : ""
			} : null;
		}
		let e = r.item && typeof r.item == "object" ? r.item : r, t = X(e.type);
		if ([
			"userMessage",
			"agentMessage",
			"reasoning"
		].includes(t)) return null;
		let a = X(e.id, r.itemId), o = Or(t) || "Tool", s = "", c = "", l = "";
		t === "commandExecution" ? (o = "Command", s = kr(e.command) || X(e.cmd), c = X(e.aggregatedOutput, e.output), typeof e.exitCode == "number" && e.exitCode !== 0 && (l = `Exit code ${e.exitCode}`)) : t === "fileChange" ? (o = "File change", s = (Array.isArray(e.changes) ? e.changes.map((e) => e?.path).filter(Boolean) : []).join(", ")) : t === "mcpToolCall" ? (o = "MCP", s = [e.server, e.tool].filter((e) => typeof e == "string" && e).join(" / "), c = typeof e.result == "string" ? e.result : Dr(e.result), l = X(e.error?.message, typeof e.error == "string" ? e.error : "")) : t === "webSearch" ? (o = "Web search", s = X(e.query)) : (s = X(e.title, e.name, kr(e.command), e.path), c = X(e.output, e.aggregatedOutput));
		let u = Nr(e.status);
		return n === "item/started" && (u = "running"), n === "item/completed" && u === "running" && (u = "completed"), l && u === "completed" && (u = "failed"), {
			callId: a,
			method: n,
			time: i,
			name: o,
			status: u,
			error: l,
			summary: Er(s.replace(/\s+/g, " ").trim(), 120),
			output: Er(c, Tr)
		};
	}
	let a = r.update && typeof r.update == "object" ? r.update : r, o = X(a.sessionUpdate);
	if (o === "tool_call" || o === "tool_call_update") {
		let e = X(a.toolCallId, a.id), t = a.rawInput && typeof a.rawInput == "object" ? a.rawInput : {}, r = X(a.title, kr(t.command), t.path, t.filePath, Or(a.kind));
		return {
			callId: e,
			method: n,
			time: i,
			name: Or(a.kind) || "Tool",
			status: Nr(a.status || (o === "tool_call" ? "in_progress" : "")),
			summary: Er(r.replace(/\s+/g, " ").trim(), 120),
			output: Er(Pr(a.content), Tr),
			error: ""
		};
	}
	if (n === "tool_execution_start" || n === "tool_execution_end") {
		let e = X(r.toolName, r.name, r.tool), t = r.args && typeof r.args == "object" ? r.args : {}, a = X(kr(t.command), t.path, t.filePath, ""), o = r.isError === !0 || !!X(r.error);
		return {
			callId: X(r.toolCallId, r.callId, e),
			method: n,
			time: i,
			name: Or(e) || "Tool",
			status: n === "tool_execution_start" ? "running" : o ? "failed" : "completed",
			summary: Er(a.replace(/\s+/g, " ").trim(), 120),
			output: Er(X(typeof r.result == "string" ? r.result : "", Pr(r.result?.content)), Tr),
			error: X(r.error)
		};
	}
	return {
		callId: X(r.toolCallId, r.itemId, r.id),
		method: n,
		time: i,
		name: "Tool",
		status: n.includes("start") ? "running" : "completed",
		summary: n,
		output: "",
		error: ""
	};
}
function Ir(e) {
	let t = e?.data ?? {}, n = X(t.method), r = t.params && typeof t.params == "object" ? t.params : {}, i = Array.isArray(r.options) ? r.options.map((e) => ({
		optionId: X(e?.optionId),
		name: X(e?.name),
		kind: X(e?.kind)
	})).filter((e) => e.optionId) : [], a = kr(r.command) || kr(r?.rawInput?.command);
	if (a) return {
		title: "Run command",
		detail: Er(a, 160),
		question: "",
		options: i
	};
	let o = Array.isArray(r.changes) ? r.changes.map((e) => e?.path).filter(Boolean) : [];
	if (r.toolCall && typeof r.toolCall == "object") {
		let e = X(r.toolCall.title, r.toolCall.kind && Or(r.toolCall.kind)), t = Pr(r.toolCall.content);
		return {
			title: e || "Permission requested",
			detail: "",
			question: t,
			options: i
		};
	}
	return o.length ? {
		title: "Apply file changes",
		detail: Er(o.join(", "), 160),
		question: "",
		options: i
	} : n.includes("permissions") ? {
		title: "Grant permissions",
		detail: X(r.reason),
		question: "",
		options: i
	} : n.includes("fileChange") ? {
		title: "Apply file changes",
		detail: X(r.reason),
		question: "",
		options: i
	} : {
		title: "Approval requested",
		detail: X(r.reason, n),
		question: "",
		options: i
	};
}
var Lr = {
	accept: "Allowed",
	acceptForSession: "Allowed for this session",
	decline: "Declined",
	cancel: "Cancelled"
}, Rr = {
	failed: "Session failed",
	stopping: "Stopping provider",
	stopped: "Session stopped",
	archived: "Session archived"
}, zr = {
	requested: "requested",
	completed: "provider completed",
	provider_error: "provider error",
	startup_error: "startup error",
	daemon_recovery: "daemon recovery"
};
function Br(e) {
	return e === "message.delivery" || e === "provider.event" || e === "provider.metadata" || e === "plan.event" || e === "provider.stderr" || e === "provider.turn.started" || e === "provider.turn.completed" || e.startsWith("provider.process.");
}
function Vr(e, t) {
	let n = { ...e };
	return t.name && (n.name = t.name), t.summary && (n.summary = t.summary), t.status && (n.status = t.status), t.error && (n.error = t.error), t.deltaOnly ? n.output = Er((n.output || "") + (t.output || ""), Tr) : t.output && (n.output = t.output), n.time = t.time || e.time, n.key = e.key, n;
}
function Hr(e, t) {
	return {
		key: t.id,
		callId: e.callId || "",
		name: e.name || "Tool",
		summary: e.summary || "",
		status: e.status || "completed",
		output: e.output || "",
		error: e.error || "",
		method: e.method || "",
		time: e.time || t.time || "",
		rawPreview: Dr(t?.data?.raw)
	};
}
function Ur(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Map(), i = (e, t) => {
		for (let { call: n, group: i } of r.values()) n.status = e, n.time = t || n.time, i.time = t || i.time;
		r.clear();
	};
	for (let a of e || []) {
		let e = a?.type || "", o = a?.data ?? {}, s = a?.time || "";
		switch (e) {
			case "message.input": {
				let e = {
					kind: "message",
					role: Mr(o.role),
					key: a.id,
					time: s,
					steer: o.steer === !0,
					text: typeof o.text == "string" ? o.text : ""
				};
				a.turnId && (e.turnId = a.turnId);
				let n = jr(o.sender);
				n && (e.sender = n), t.push(e);
				break;
			}
			case "message.user":
			case "message.user.steer":
				t.push({
					kind: "message",
					role: "user",
					key: a.id,
					time: s,
					steer: e === "message.user.steer",
					text: typeof o.text == "string" ? o.text : ""
				});
				break;
			case "message.assistant.delta": {
				let e = t.at(-1), n = typeof o.text == "string" ? o.text : "", r = a.turnId || "";
				e?.kind === "message" && e.role === "assistant" && e.turnId === r ? (e.text += n, e.time = s) : n && t.push({
					kind: "message",
					role: "assistant",
					key: a.id,
					turnId: r,
					text: n,
					time: s
				});
				break;
			}
			case "message.reasoning.delta": {
				let e = t.at(-1), n = typeof o.text == "string" ? o.text : "";
				e?.kind === "thinking" && e.turnId === (a.turnId || "") ? (e.text += n, e.time = s) : n && t.push({
					kind: "thinking",
					key: a.id,
					turnId: a.turnId || "",
					text: n,
					time: s,
					startTime: a.startTime || s,
					active: !1
				});
				break;
			}
			case "tool.event": {
				let e = Fr(a);
				if (!e) break;
				let n = t.at(-1), i = n?.kind === "tools" ? n : null, o = e.callId ? r.get(e.callId) : null;
				if (o) Object.assign(o.call, Vr(o.call, e)), o.group.time = s, o.call.status !== "running" && r.delete(e.callId);
				else {
					if (e.deltaOnly) break;
					let n = i || {
						kind: "tools",
						key: a.id,
						calls: [],
						time: s
					}, o = Hr(e, a);
					n.calls.push(o), n.time = s, i || t.push(n), o.callId && o.status === "running" && r.set(o.callId, {
						call: o,
						group: n
					});
				}
				break;
			}
			case "approval.requested": {
				let { title: e, detail: r, question: i, options: c } = Ir(a), l = {
					kind: "approval",
					key: a.id,
					time: s,
					approvalId: X(o.approvalId),
					title: e,
					detail: r,
					question: i,
					options: c,
					status: "pending",
					decision: "",
					reply: ""
				};
				l.approvalId && n.set(l.approvalId, l), t.push(l);
				break;
			}
			case "approval.resolved": {
				let e = X(o.approvalId), r = X(o.decision) || "decline", i = X(o.optionId), c = X(o.text), l = e ? n.get(e) : null, u = (e) => r === "text" ? "Replied" : i ? `Answered: ${e?.options?.find((e) => e.optionId === i)?.name || i}` : Lr[r] || Or(r), d = r === "accept" || r === "acceptForSession" || r === "text";
				l ? (l.status = d ? "accepted" : "declined", l.decision = u(l), l.reply = r === "text" ? c : "", l.time = s) : t.push({
					kind: "approval",
					key: a.id,
					time: s,
					approvalId: e,
					title: "Approval resolved",
					detail: "",
					question: "",
					options: [],
					status: d ? "accepted" : "declined",
					decision: u(null),
					reply: r === "text" ? c : ""
				});
				break;
			}
			case "provider.error":
				{
					let e = X(o.message, "The provider reported an error"), n = X(o.details), r = n && n !== e ? `${e} · ${n}` : e;
					o.willRetry === !0 ? t.push({
						kind: "lifecycle",
						tone: "info",
						key: a.id,
						time: s,
						text: r
					}) : t.push({
						kind: "error",
						key: a.id,
						time: s,
						text: r
					});
				}
				break;
			case "turn.started":
				t.push({
					kind: "lifecycle",
					tone: "muted",
					key: a.id,
					time: s,
					text: "Turn started"
				});
				break;
			case "turn.completed":
				i("completed", s), t.push({
					kind: "lifecycle",
					tone: "ok",
					key: a.id,
					time: s,
					text: "Turn completed"
				});
				break;
			case "turn.failed":
				i("failed", s), t.push({
					kind: "lifecycle",
					tone: "danger",
					key: a.id,
					time: s,
					text: `Turn failed${X(o.error, o.message) ? `: ${X(o.error, o.message)}` : ""}`
				});
				break;
			case "turn.cancelled":
				i("failed", s), t.push({
					kind: "lifecycle",
					tone: "muted",
					key: a.id,
					time: s,
					text: "Turn interrupted"
				});
				break;
			case "session.created":
				t.push({
					kind: "lifecycle",
					tone: "muted",
					key: a.id,
					time: s,
					text: "Session created"
				});
				break;
			case "session.provider": {
				let e = X(o.agentName), n = X(o.provider), r = ["Agent connected"];
				e && r.push(e), n && r.push(`via ${n}`), t.push({
					kind: "lifecycle",
					tone: "muted",
					key: a.id,
					time: s,
					text: r.join(" · ")
				});
				break;
			}
			case "session.state": {
				let e = Rr[o.state];
				o.state === "failed" ? i("failed", s) : o.state === "stopped" && i(o.reason === "completed" ? "completed" : "failed", s), o.state === "stopped" && zr[o.reason] && (e += ` · ${zr[o.reason]}`);
				let n = o.state === "failed" || o.reason === "provider_error" || o.reason === "startup_error";
				e && t.push({
					kind: "lifecycle",
					tone: n ? "danger" : "muted",
					key: a.id,
					time: s,
					text: e
				});
				break;
			}
			case "session.archived":
				t.push({
					kind: "lifecycle",
					tone: "muted",
					key: a.id,
					time: s,
					text: "Session archived"
				});
				break;
			default:
				if (Br(e)) break;
				t.push({
					kind: "unknown",
					key: a.id,
					time: s,
					type: e || "unknown",
					preview: Dr(o)
				});
		}
	}
	let a = t.at(-1);
	return a?.kind === "thinking" && (a.active = !0), t;
}
//#endregion
//#region src/components/timeline-events.ts
var Wr = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment",
	"turn.started",
	"turn.completed"
]), Gr = /* @__PURE__ */ new Set([
	...Wr,
	"Session created",
	"Turn started",
	"Turn completed"
]);
function Kr(e, t) {
	let n = new Set(e.filter((e) => Wr.has(e.type)).map((e) => String(e.id)));
	return t.filter((e) => e.key === void 0 || !n.has(String(e.key)));
}
function qr(e) {
	let t = e || [], n = Kr(t, Ur(t)), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function Jr(e) {
	let t = String(e || "");
	return Gr.has(t) || t === "Agent connected" || t.startsWith("Agent connected ·");
}
function Yr(e) {
	let t = -1;
	for (let n = e.length - 1; n >= 0; n--) if (e[n]?.kind === "message" && e[n]?.role === "assistant") {
		t = n;
		break;
	}
	return e.map((e, n) => {
		if (e.kind !== "message" || e.role !== "assistant") return e;
		let r = n === t;
		return e.turnFinal === r ? e : {
			...e,
			turnFinal: r
		};
	});
}
function Xr(e) {
	let t = new Date(e || "");
	return Number.isNaN(t.valueOf()) ? "" : t.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function Zr(e) {
	let t = !1;
	return e.map((e) => e.kind === "thinking" || e.kind === "tools" || e.kind === "approval" || e.kind === "message" && e.role === "assistant" ? t ? !e.agentStart && e.agentContinuation ? e : {
		...e,
		agentStart: !1,
		agentContinuation: !0
	} : (t = !0, e.agentStart && !e.agentContinuation ? e : {
		...e,
		agentStart: !0,
		agentContinuation: !1
	}) : (t = !1, e.agentStart || e.agentContinuation ? {
		...e,
		agentStart: !1,
		agentContinuation: !1
	} : e));
}
function Qr(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? oi(r, n) : si(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function $r(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) ei(n, e);
	return n;
}
function ei(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, si(t));
		return;
	}
	e[a] = oi(e[a], t);
}
function ti(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = ni(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? ri(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function ni(e) {
	if (e.type !== "tool.event") return "";
	let t = ii(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? ii(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? ai(n.toolCallId) || ai(n.id) : "";
}
function ri(e, t) {
	let n = e.data || {}, r = t.data || {}, i = ii(n.raw), a = ii(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? ii(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? ii(a.update) : a;
	return {
		...e,
		...t,
		data: {
			...n,
			...r,
			raw: {
				...i,
				...a,
				update: {
					...o,
					...s
				}
			}
		}
	};
}
function ii(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function ai(e) {
	return typeof e == "string" ? e.trim() : "";
}
function oi(e, t) {
	if (t.data?.append !== !0) return {
		...t,
		startTime: t.startTime || e.startTime
	};
	let n = typeof e.data?.text == "string" ? e.data.text : "", r = typeof t.data.text == "string" ? t.data.text : "";
	return {
		...e,
		...t,
		startTime: t.startTime || e.startTime,
		data: {
			...e.data,
			...t.data,
			append: !1,
			text: n + r
		}
	};
}
function si(e) {
	return e.data?.append === !0 ? {
		...e,
		data: {
			...e.data,
			append: !1
		}
	} : e;
}
//#endregion
//#region src/components/tool-group.ts
function ci(e, t) {
	let n = Number(e);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : Math.max(0, Math.floor(Number(t) || 0));
}
function li(e) {
	return e.compact ? ci(e.toolCallCount, e.calls?.length || 0) : e.calls?.length || 0;
}
function ui(e) {
	let t = ci(e, 0);
	return `${t} tool ${t === 1 ? "call" : "calls"}`;
}
function di(e) {
	return e.rangeStartEventId && e.rangeStartEventId > 0 ? String(e.rangeStartEventId) : String(e.key ?? e.time ?? "tools");
}
//#endregion
//#region src/components/chat-state.ts
var fi = 20, pi = 250, mi = 80, hi = 2e3, gi = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment"
]), _i = class {
	api;
	eventSourceFactory;
	contexts = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	onEvent;
	onNotice;
	streamBatchWindowMs;
	statusSyncIntervalMs;
	realtime;
	activeKey = "";
	disposed = !1;
	constructor(e = {}) {
		this.api = e.api ?? new sn(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? mi), this.statusSyncIntervalMs = Math.max(1, e.statusSyncIntervalMs ?? hi), this.realtime = e.realtime !== !1;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t, n) {
		if (this.disposed) return;
		let r = bi(e, t), i = this.activeKey !== r;
		if (this.activeKey && i && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !r) {
			this.emit();
			return;
		}
		let a = this.contexts.get(r) ?? this.createContext(e, t), o = String(n?.generation?.generationId || "");
		if (this.isStaleStatus(a, n, o)) {
			this.startStatusSync(a), i && this.emit();
			return;
		}
		this.startStatusSync(a);
		let s = !!(a.generationId && o && a.generationId !== o);
		a.status = n, a.generationId = o, s ? (this.resetForGeneration(a), this.loadInitial(a)) : !a.loaded && !a.loading ? this.loadInitial(a) : this.realtime && this.connect(a), (i || s) && this.emit();
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.nextCursor) return !1;
		let t = e.requestGeneration, n = e.nextCursor;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest(Ti(e, n), { scope: Ci(e, "older") });
			return this.isCurrent(e, t) ? (this.mergePage(e, r), r.segments.some((e) => e.turns?.length || e.gap)) : !1;
		} catch (n) {
			return n instanceof an || !this.isCurrent(e, t) || (e.error = Fi(n)), !1;
		} finally {
			this.isCurrent(e, t) && (e.loadingOlder = !1, this.emit());
		}
	}
	retryHistory() {
		let e = this.activeContext();
		!e || e.loading || (e.loaded = !1, e.nextCursor = "", e.hasMoreBefore = !1, this.loadInitial(e));
	}
	async loadTurn(e) {
		let t = this.activeContext();
		if (!t || !e || t.details.has(e) || t.detailLoading.has(e) || !this.findTurn(t, e)) return;
		let n = t.requestGeneration;
		t.detailLoading.add(e), t.detailErrors.delete(e), this.emit();
		try {
			let r = await this.api.latest(Ei(t, e), { scope: Ci(t, `turn:${e}`) });
			if (!this.isCurrent(t, n)) return;
			if (t.details.set(e, r), !r.turn.closed && r.turn.generation.generationId === t.generationId) {
				let i = await this.loadTurnRange(t, r, n);
				if (!this.isCurrent(t, n)) return;
				t.liveEvents.set(e, i);
			}
			this.realtime && this.connect(t);
		} catch (r) {
			if (r instanceof an || !this.isCurrent(t, n)) return;
			t.detailErrors.set(e, Fi(r));
		} finally {
			this.isCurrent(t, n) && (t.detailLoading.delete(e), this.emit());
		}
	}
	async expandRange(e, t, n) {
		let r = this.activeContext();
		if (!r || !e || t <= 0 || n < t) return;
		let i = this.turnReferenceForEvent(r, e, t), a = i ? this.findTurn(r, i) : void 0;
		if (!i || !a || n > a.lastEventId) return;
		let o = r.requestGeneration, s = await this.fetchEventRange(r, e, a.startEventId, a.lastEventId, o, `range:${t}:${n}`);
		this.isCurrent(r, o) && (r.liveEvents.set(i, ti(Qr([...r.liveEvents.get(i) || [], ...s]))), this.emit());
	}
	snapshot() {
		let e = this.activeContext();
		return e ? {
			identity: e.key,
			workspaceId: e.workspaceId,
			resourceId: e.resourceId,
			generationId: e.generationId,
			blocks: this.blocks(e),
			notices: [...e.notices],
			hasMoreBefore: e.hasMoreBefore,
			loading: e.loading,
			loadingOlder: e.loadingOlder,
			loaded: e.loaded,
			error: e.error
		} : Ii();
	}
	dispose() {
		if (!this.disposed) {
			this.disposed = !0;
			for (let e of this.contexts.values()) this.deactivate(e);
			this.api.dispose(), this.contexts.clear(), this.listeners.clear(), this.activeKey = "";
		}
	}
	createContext(e, t) {
		let n = {
			key: bi(e, t),
			workspaceId: e,
			resourceId: t,
			status: null,
			generationId: "",
			requestGeneration: 1,
			streamGeneration: 0,
			segments: /* @__PURE__ */ new Map(),
			details: /* @__PURE__ */ new Map(),
			detailLoading: /* @__PURE__ */ new Set(),
			detailErrors: /* @__PURE__ */ new Map(),
			liveEvents: /* @__PURE__ */ new Map(),
			orphanEvents: /* @__PURE__ */ new Map(),
			notices: [],
			nextCursor: "",
			hasMoreBefore: !1,
			loading: !1,
			loadingOlder: !1,
			loaded: !1,
			error: "",
			stream: null,
			pendingEvents: [],
			headRefreshing: !1,
			terminalMaterializing: /* @__PURE__ */ new Set(),
			flushTimer: null,
			statusSyncTimer: null,
			statusSyncInFlight: !1
		};
		return this.contexts.set(n.key, n), n;
	}
	async loadInitial(e) {
		if (e.loading) return;
		let t = e.requestGeneration;
		e.loading = !0, e.error = "", this.emit();
		try {
			let n = await this.api.latest(Ti(e), { scope: Ci(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			e.segments.clear(), e.details.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), this.mergePage(e, n), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof an || !this.isCurrent(e, t)) return;
			e.error = Fi(n);
		} finally {
			this.isCurrent(e, t) && (e.loading = !1, this.emit());
		}
	}
	mergePage(e, t) {
		for (let n of t.segments || []) {
			let t = n.generation.generationId, r = e.segments.get(t);
			if (!r) {
				e.segments.set(t, {
					...n,
					turns: [...n.turns || []]
				});
				continue;
			}
			let i = new Map(r.turns.map((e) => [e.reference, e]));
			for (let e of n.turns || []) i.set(e.reference, e);
			r.turns = [...i.values()].sort((e, t) => e.startEventId - t.startEventId), r.generation = n.generation, r.gap = n.gap || r.gap;
		}
		for (let n of t.segments || []) for (let t of n.turns || []) {
			let n = e.orphanEvents.get(t.turnId);
			n && (e.liveEvents.set(t.reference, ti(Qr([...e.liveEvents.get(t.reference) || [], ...n]))), e.orphanEvents.delete(t.turnId));
		}
		e.nextCursor = String(t.page?.nextCursor || ""), e.hasMoreBefore = !!(t.page?.hasMore && e.nextCursor);
	}
	blocks(e) {
		let t = [], n = [...e.segments.values()].sort((e, t) => e.generation.generation - t.generation.generation), r = n.find((t) => t.generation.generationId === e.generationId)?.generation || Oi(e), i = r ? this.orphanEventBlocks(e, r) : [];
		for (let r of n) {
			if (r.gap) {
				t.push({
					kind: "gap",
					key: `gap:${r.generation.generationId}`,
					generation: r.generation,
					gap: r.gap
				});
				continue;
			}
			let n = [];
			for (let t of [...r.turns || []].sort((e, t) => e.startEventId - t.startEventId)) {
				let i = e.details.get(t.reference), a = e.liveEvents.get(t.reference);
				n.push({
					kind: "turn",
					key: `${r.generation.generationId}:${t.turnId}`,
					generation: r.generation,
					turn: t,
					items: i && !a ? vi(i, r.generation.generationId) : void 0,
					events: a?.filter((e) => !gi.has(e.type)),
					loading: e.detailLoading.has(t.reference),
					error: e.detailErrors.get(t.reference)
				});
			}
			r.generation.generationId === e.generationId && n.push(...i), n.sort((e, t) => Si(e) - Si(t)), t.push(...n);
		}
		return i.length && !n.some((t) => t.generation.generationId === e.generationId) && t.push(...i), t;
	}
	orphanEventBlocks(e, t) {
		let n = [];
		for (let [r, i] of e.orphanEvents) {
			let a = i.filter((e) => !gi.has(e.type)), o = [];
			for (let i of a) o.length && Number(i.id) !== Number(o[o.length - 1].id) + 1 && (n.push(xi(e, r, t, o)), o = []), o.push(i);
			o.length && n.push(xi(e, r, t, o));
		}
		return n.sort((e, t) => Si(e) - Si(t));
	}
	connect(e) {
		if (!this.realtime || !this.isActive(e) || e.stream || !e.generationId || !ji(e.status)) return;
		let t = Di(e), n = new URLSearchParams({ generationId: e.generationId });
		t && n.set("after", String(t));
		let r = ++e.streamGeneration, i = this.eventSourceFactory(`${wi(e)}/stream?${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.resourceId, n), this.scheduleEventFlush(e), Mi(n) && this.materializeTerminalTurn(e, String(n.turnId || ""), r);
			} catch {
				e.error = "An Agent event could not be decoded.", this.emit();
			}
		}, i.addEventListener("forge.notice", (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				this.flushEvents(e, !1), this.appendNotice(e, n), this.onNotice?.(e.workspaceId, e.resourceId, n), this.emit();
			} catch {
				e.error = "A PUA notice could not be decoded.", this.emit();
			}
		}), i.onerror = () => {
			if (!this.isActiveStream(e, i, r)) {
				i.close();
				return;
			}
			i.readyState === 2 && (e.stream = null, e.streamGeneration++, this.refreshCurrentStatus(e));
		};
	}
	startStatusSync(e) {
		!this.realtime || e.statusSyncTimer || (e.statusSyncTimer = setInterval(() => void this.refreshCurrentStatus(e), this.statusSyncIntervalMs));
	}
	isStaleStatus(e, t, n) {
		if (!e.generationId) return !1;
		if (!n) return !0;
		let r = Number(e.status?.generation?.generation), i = Number(t?.generation?.generation);
		return Number.isFinite(r) && Number.isFinite(i) && i < r;
	}
	async refreshCurrentStatus(e) {
		if (e.statusSyncInFlight || !this.isActive(e)) return;
		e.statusSyncInFlight = !0;
		let t = e.requestGeneration;
		try {
			let n = await this.api.latest(`${wi(e)}/status`, { scope: Ci(e, "status") });
			if (!this.isCurrent(e, t) || !n.generation?.generationId) return;
			let r = String(n.generation.generationId);
			if (r !== e.generationId && (e.generationId || e.loaded)) {
				this.activate(e.workspaceId, e.resourceId, n);
				return;
			}
			let i = e.generationId, a = String(e.status?.session?.id || "");
			e.status = n, e.generationId = r, e.stream && (!ji(n) || a && a !== String(n.session?.id || "")) && this.closeStream(e), !e.loaded && !e.loading ? this.loadInitial(e) : e.stream || this.connect(e), i !== r && this.emit();
		} catch (n) {
			if (n instanceof an || !this.isCurrent(e, t)) return;
		} finally {
			e.statusSyncInFlight = !1;
		}
	}
	async loadTurnRange(e, t, n) {
		let r = Math.max(1, Number(t.turn.startEventId) || 1), i = Math.max(r, Number(t.turn.lastEventId) || 0, Number(t.latestEventId) || 0);
		return this.fetchEventRange(e, t.turn.generation.generationId || e.generationId, r, i, n, `live-turn:${t.turn.reference}`);
	}
	async fetchEventRange(e, t, n, r, i, a) {
		let o = n - 1, s = [];
		for (; o < r;) {
			let c = new URLSearchParams({
				generationId: t,
				start: String(n),
				end: String(r),
				after: String(o),
				limit: String(pi)
			}), l = await this.api.latest(`${wi(e)}/events?${c}`, { scope: Ci(e, a) });
			if (!this.isCurrent(e, i)) return [];
			let u = ki(l.events).filter((t) => this.eventBelongsToContext(e, t));
			s = Qr([...s, ...u]);
			let d = Number(l.page?.nextAfter) || Ai(u);
			if (!l.page?.hasMore || !d || d <= o) break;
			o = d;
		}
		return s;
	}
	async materializeTerminalTurn(e, t, n) {
		if (!t) return;
		let r = e.generationId, i = `${r}:${t}`;
		if (!e.terminalMaterializing.has(i)) {
			e.terminalMaterializing.add(i);
			try {
				this.flushEvents(e, !1);
				let i = this.findTurnById(e, r, t);
				if (i?.closed && e.details.has(i.reference)) {
					e.liveEvents.delete(i.reference);
					return;
				}
				for (let i = 0; i < 3; i++) try {
					let i = await this.api.latest(Ti(e), { scope: Ci(e, `terminal-head:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.mergePage(e, i);
					let a = this.findTurnById(e, r, t);
					if (!a?.closed) throw Error("Turn projection is not closed yet");
					let o = await this.api.latest(Ei(e, a.reference), { scope: Ci(e, `terminal:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.flushEvents(e, !1), e.details.set(a.reference, o), e.liveEvents.delete(a.reference), this.emit();
					return;
				} catch (t) {
					if (t instanceof an || !e.stream || !this.isActiveStream(e, e.stream, n)) return;
					if (i === 2) {
						e.error = Fi(t), this.emit();
						return;
					}
					await Ni(50 * (i + 1));
				}
			} finally {
				e.terminalMaterializing.delete(i);
			}
		}
	}
	async refreshHead(e) {
		if (e.headRefreshing) return;
		e.headRefreshing = !0;
		let t = e.requestGeneration;
		try {
			let n = await this.api.latest(Ti(e), { scope: Ci(e, "stream-head") });
			this.isCurrent(e, t) && (this.mergePage(e, n), this.emit());
		} catch {} finally {
			e.headRefreshing = !1;
		}
	}
	findTurn(e, t) {
		return [...e.segments.values()].flatMap((e) => e.turns || []).find((e) => e.reference === t);
	}
	findTurnById(e, t, n) {
		return [...e.segments.values()].flatMap((e) => e.turns || []).find((e) => e.turnId === n && e.generation.generationId === t);
	}
	turnReferenceForEvent(e, t, n) {
		return [...e.segments.values()].filter((e) => e.generation.generationId === t).flatMap((e) => e.turns || []).find((e) => n >= e.startEventId && n <= e.lastEventId)?.reference || "";
	}
	openTurnReferenceForEvent(e, t) {
		let n = String(t.turnId || "");
		if (!n) return "";
		let r = this.findTurnById(e, e.generationId, n);
		return r && !r.closed ? r.reference : "";
	}
	eventBelongsToContext(e, t) {
		let n = String(t.sessionId || "");
		return !n || !e.status?.session?.id || n === e.status.session.id;
	}
	appendNotice(e, t) {
		e.notices.some((e) => Pi(e) === Pi(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
	}
	scheduleEventFlush(e) {
		e.flushTimer ||= setTimeout(() => {
			e.flushTimer = null, this.isActive(e) && this.flushEvents(e, !0);
		}, this.streamBatchWindowMs);
	}
	flushEvents(e, t) {
		if (!e.pendingEvents.length) return;
		let n = e.pendingEvents;
		e.pendingEvents = [];
		for (let t of n) {
			let n = this.turnReferenceForEvent(e, e.generationId, Number(t.id)) || this.openTurnReferenceForEvent(e, t);
			if (n) e.liveEvents.set(n, ti($r(e.liveEvents.get(n) || [], [t])));
			else {
				let n = String(t.turnId || "current");
				e.orphanEvents.set(n, ti($r(e.orphanEvents.get(n) || [], [t]))), Mi(t) || this.refreshHead(e);
			}
		}
		t && this.isActive(e) && this.emit();
	}
	closeStream(e) {
		e.streamGeneration++, e.stream?.close(), e.stream = null;
	}
	resetForGeneration(e) {
		e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, e.pendingEvents = [], e.requestGeneration++, this.closeStream(e), this.api.requests.abort(Ci(e, "initial")), this.api.requests.abort(Ci(e, "older")), this.api.requests.abort(Ci(e, "status")), e.segments.clear(), e.details.clear(), e.detailLoading.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), e.nextCursor = "", e.hasMoreBefore = !1, e.loading = !1, e.loadingOlder = !1, e.loaded = !1, e.error = "", e.headRefreshing = !1, e.terminalMaterializing.clear();
	}
	deactivate(e) {
		e && (e.statusSyncTimer && clearInterval(e.statusSyncTimer), e.statusSyncTimer = null, e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.requestGeneration++, this.closeStream(e), e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(Ci(e, "initial")), this.api.requests.abort(Ci(e, "older")), this.api.requests.abort(Ci(e, "status")));
	}
	isCurrent(e, t) {
		return !this.disposed && this.isActive(e) && e.requestGeneration === t;
	}
	isActive(e) {
		return this.activeKey === e.key;
	}
	isActiveStream(e, t, n) {
		return !this.disposed && this.isActive(e) && e.stream === t && e.streamGeneration === n;
	}
	activeContext() {
		return this.activeKey ? this.contexts.get(this.activeKey) : void 0;
	}
	emit() {
		let e = this.snapshot();
		for (let t of this.listeners) t(e);
	}
};
function vi(e, t) {
	return (e.items || []).flatMap((e) => yi(e, t));
}
function yi(e, t) {
	let n = `${t}:${e.startEventId}:${e.type}`, r = {
		key: n,
		time: e.endedAt || e.startedAt,
		startTime: e.startedAt,
		generationId: t
	}, i = e.data && typeof e.data == "object" ? e.data : {};
	switch (e.type) {
		case "message": return [{
			...r,
			kind: "message",
			role: e.role || "user",
			sender: e.sender,
			steer: e.steer,
			text: e.text || ""
		}];
		case "thinking": return [{
			...r,
			kind: "thinking",
			text: `Reasoning details omitted from compact history · ${Math.max(1, Number(e.count) || 1)} update(s)`,
			compact: !0,
			rangeStartEventId: e.startEventId,
			rangeEndEventId: e.endEventId
		}];
		case "tool": {
			let t = ci(e.count, 1);
			return [{
				...r,
				kind: "tools",
				compact: !0,
				toolCallCount: t,
				rangeStartEventId: e.startEventId,
				rangeEndEventId: e.endEventId,
				calls: [{
					key: n,
					callId: n,
					name: "Tool activity",
					summary: `${ui(t)} · details omitted`,
					status: "completed"
				}]
			}];
		}
		case "approval": return [{
			...r,
			kind: "approval",
			approvalId: String(i.requestId || i.approvalId || n),
			title: String(i.title || "Approval"),
			question: String(i.question || ""),
			status: String(i.status || (i.decision ? "resolved" : "pending")),
			decision: String(i.decision || "")
		}];
		case "error": return [{
			...r,
			kind: "error",
			text: e.text || String(i.message || "Provider error")
		}];
		case "lifecycle": return e.text && !Jr(e.text) ? [{
			...r,
			kind: "lifecycle",
			type: e.text,
			text: e.text
		}] : [];
		default: return [{
			...r,
			kind: "unknown",
			type: e.type,
			text: e.text || ""
		}];
	}
}
function bi(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function xi(e, t, n, r) {
	let i = r[0]?.id ?? 0;
	return {
		kind: "turn",
		key: `${e.generationId}:${t || "current"}:${i}`,
		generation: n,
		events: r
	};
}
function Si(e) {
	if (e.turn) return Number(e.turn.startEventId) || 0;
	let t = e.events?.[0];
	return t && Number(t.id) || 0;
}
function Ci(e, t) {
	return `resource-chat:${e.key}:${t}`;
}
function wi(e) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/resources/${encodeURIComponent(e.resourceId)}`;
}
function Ti(e, t = "") {
	let n = new URLSearchParams({ limit: String(fi) });
	return t && n.set("cursor", t), `${wi(e)}/history/turns?${n}`;
}
function Ei(e, t) {
	return `${wi(e)}/history/turns/${encodeURIComponent(t)}`;
}
function Di(e) {
	let t = [...e.segments.values()].filter((t) => t.generation.generationId === e.generationId).flatMap((e) => e.turns || []), n = [...e.liveEvents.values()].flat();
	return Math.max(0, ...t.map((e) => Number(e.lastEventId) || 0), ...n.map((e) => Number(e.id) || 0));
}
function Oi(e) {
	let t = e.status?.generation;
	return t?.generationId ? {
		generation: t.generation,
		generationId: t.generationId,
		title: "Current generation",
		status: t.status,
		createdAt: "",
		updatedAt: "",
		agentName: e.status?.resolvedAgent,
		resolvedProfile: e.status?.resolvedProfile,
		replacementPending: t.replacementPending
	} : null;
}
function ki(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function Ai(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function ji(e) {
	let t = e?.generation;
	return !!(t?.generationId && e?.session?.id && ([
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(t.status || "")) || ["idle-suspended", "stopped"].includes(String(t.status || "")) && t.resumable === !0));
}
function Mi(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function Ni(e) {
	return new Promise((t) => setTimeout(t, e));
}
function Pi(e) {
	let t = e.data || {};
	return [
		e.type,
		t.method,
		t.kind,
		t.lifecycle,
		t.resourceId,
		t.text
	].map((e) => String(e ?? "")).join(":");
}
function Fi(e) {
	return e instanceof Error ? e.message : String(e);
}
function Ii() {
	return {
		identity: "",
		workspaceId: "",
		resourceId: "",
		generationId: "",
		blocks: [],
		notices: [],
		hasMoreBefore: !1,
		loading: !1,
		loadingOlder: !1,
		loaded: !1,
		error: ""
	};
}
//#endregion
//#region src/components/LifecycleNotice.svelte
var Li = o("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function Ri(t, r) {
	e(r, !0);
	let i = w(() => r.item.tone === "ok" ? "check-circle" : r.item.tone === "danger" ? "triangle-alert" : r.item.tone === "info" ? "info" : "clock");
	function a() {
		let e = new Date(r.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var o = Li(), s = C(o);
	O(s, { get name() {
		return n(i);
	} });
	var l = d(s), u = C(l, !0);
	q(l);
	var f = d(l), p = C(f, !0);
	q(f), q(o), c((e) => {
		k(o, 1, `agent-system-note agent-lifecycle-${r.item.tone || "muted"}`), L(u, r.item.text || ""), L(p, e);
	}, [() => a()]), m(t, o), _();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var zi = o("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function Bi(t, r) {
	e(r, !0);
	let i = A(r, "onExpand", 3, () => {}), a = T(W(!!r.item.active)), o = !!r.item.active;
	x(() => {
		let e = !!r.item.active;
		e !== o && (o = e, u(a, e, !0));
	});
	function s() {
		if (r.item.active) return "Thinking…";
		if (!r.item.startTime || !r.item.time) return "Thought";
		let e = Math.round((new Date(r.item.time).getTime() - new Date(r.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var l = zi(), f = C(l), p = C(f);
	O(p, { name: "brain-circuit" });
	var h = d(p), g = C(h, !0);
	q(h);
	var v = d(h), y = C(v);
	O(y, { name: "chevron-right" }), q(v), q(f);
	var b = d(f, 2), S = C(b, !0);
	q(b), q(l), c((e) => {
		l.open = n(a), L(g, e), L(S, r.item.text || "");
	}, [() => s()]), J("toggle", l, (e) => {
		u(a, e.currentTarget.open, !0), e.currentTarget.open && i()();
	}), m(t, l), _();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var Vi = o("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), Hi = o("<span class=\"agent-message-tag\">steer</span>"), Ui = o("<span class=\"agent-message-source\"> </span>"), Wi = o("<div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div>"), Gi = o("<div class=\"agent-message-content markdown-rendered\"></div>"), Ki = o("<p> </p>"), qi = o("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><!> <div class=\"agent-message-bubble\"><!></div></div></div>");
function Ji(t, r) {
	e(r, !0);
	let i = A(r, "workspaceId", 3, ""), a = A(r, "resolveResourceTitle", 3, () => null), o = A(r, "onNavigate", 3, () => {}), s = w(() => [
		"assistant",
		"system",
		"agent"
	].includes(String(r.item.role)) ? String(r.item.role) : "user"), l = w(() => n(s) === "assistant" ? r.item.turnFinal === !1 ? "assistant" : "assistant final" : n(s));
	function u() {
		return r.item.role === "assistant" ? r.agentName || "Agent" : String(r.item.sender?.name || r.item.sender?.id || "").trim() || (r.item.role === "system" ? "System" : r.item.role === "agent" ? "Agent" : "User");
	}
	function f() {
		return Xr(r.item.time);
	}
	function p() {
		let e = String(r.item.text || "");
		return !window.marked || !window.DOMPurify ? g(e).replaceAll("\n", "<br>") : An(e, {
			workspaceId: i(),
			resolveResourceTitle: a()
		});
	}
	function g(e) {
		return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
	}
	var v = qi(), y = C(v), b = C(y), x = (e) => {
		var t = Wi(), i = C(t), a = C(i, !0);
		q(i);
		var o = d(i, 2), l = (e) => {
			var t = Vi(), r = C(t, !0);
			q(t), c(() => L(r, n(s))), m(e, t);
		};
		h(o, (e) => {
			n(s) !== "assistant" && e(l);
		});
		var p = d(o, 2), g = (e) => {
			var t = Hi();
			m(e, t);
		};
		h(p, (e) => {
			r.item.steer && e(g);
		});
		var _ = d(p, 2), v = (e) => {
			var t = Ui(), n = C(t);
			q(t), c(() => {
				U(t, "title", r.item.sender.sessionId), L(n, `from session ${r.item.sender.sessionId ?? ""}`);
			}), m(e, t);
		};
		h(_, (e) => {
			n(s) === "agent" && r.item.sender?.sessionId && e(v);
		});
		var y = d(_, 2), b = C(y, !0);
		q(y), q(t), c((e, t) => {
			L(a, e), L(b, t);
		}, [() => u(), () => f()]), m(e, t);
	};
	h(b, (e) => {
		(n(s) !== "assistant" || !r.item.agentContinuation) && e(x);
	});
	var S = d(b, 2), T = C(S), E = (e) => {
		var t = Gi();
		re(t, p, !0), q(t), ie(t, (e, t) => Nn?.(e, t), () => ({
			resolveResourceTitle: a(),
			onNavigate: o(),
			onOpenFile: r.onOpenFile
		})), m(e, t);
	}, D = (e) => {
		var t = Ki(), n = C(t, !0);
		q(t), c(() => L(n, r.item.text || "")), m(e, t);
	};
	h(T, (e) => {
		n(s) === "assistant" || n(s) === "agent" ? e(E) : e(D, -1);
	}), q(S), q(y), q(v), c(() => k(v, 1, `agent-message-row ${n(l)}`)), m(t, v), _();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var Yi = o("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function Xi(e, t) {
	let r = A(t, "error", 3, !1), i = A(t, "alert", 3, !1);
	var a = Yi();
	let o;
	var s = C(a), l = C(s);
	{
		let e = w(() => r() ? "triangle-alert" : "info");
		O(l, { get name() {
			return n(e);
		} });
	}
	var u = d(l), f = C(u, !0);
	q(u), q(s);
	var p = d(s, 2), h = C(p, !0);
	q(p), q(a), c(() => {
		o = k(a, 1, "timeline-notice", null, o, { "timeline-notice-error": r() }), U(a, "role", i() ? "alert" : void 0), L(f, t.title), L(h, t.text);
	}), m(e, a);
}
//#endregion
//#region src/components/ToolItem.svelte
var Zi = o("<pre> </pre>"), Qi = o("<details data-component-owner=\"event-timeline\"><summary><span class=\"tool-status-icon tool-status-icon-running\"><!></span><span class=\"tool-status-icon tool-status-icon-failed\"><!></span><span class=\"tool-status-icon tool-status-icon-completed\"><!></span><span> </span><small> </small></summary> <!></details>");
function $i(t, r) {
	e(r, !0);
	function i() {
		return [r.call.name, r.call.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	function a() {
		return [
			r.call.error,
			r.call.output,
			r.call.rawPreview
		].filter(Boolean).join("\n\n");
	}
	var o = Qi(), s = C(o), l = C(s), u = C(l);
	O(u, { name: "loader-circle" }), q(l);
	var f = d(l), p = C(f);
	O(p, { name: "x-circle" }), q(f);
	var g = d(f), v = C(g);
	O(v, { name: "check-circle" }), q(g);
	var y = d(g), b = C(y, !0);
	q(y);
	var x = d(y), S = C(x, !0);
	q(x), q(s);
	var T = d(s, 2), E = (e) => {
		var t = Zi(), n = C(t, !0);
		q(t), c((e) => L(n, e), [() => a()]), m(e, t);
	}, D = w(() => a());
	h(T, (e) => {
		n(D) && e(E);
	}), q(o), c((e, t, n) => {
		k(o, 1, e), L(b, t), L(S, n);
	}, [
		() => `agent-tool-item agent-tool-${String(r.call.status || "completed")}`,
		() => i(),
		() => String(r.call.method || "tool")
	]), m(t, o), _();
}
//#endregion
//#region src/components/ToolGroup.svelte
var ea = o("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function ta(t, r) {
	e(r, !0);
	let i = w(() => r.item.calls || []), a = w(() => li(r.item)), o = w(() => n(i).map(s));
	function s(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var l = ea(), u = C(l), f = C(u), p = C(f);
	O(p, { name: "wrench" }), q(f);
	var h = d(f), g = C(h, !0);
	q(h);
	var v = d(h), y = C(v);
	q(v);
	var x = d(v), S = C(x);
	O(S, { name: "chevron-right" }), q(x), q(u);
	var T = d(u, 2);
	b(T, 21, () => n(i), (e) => String(e.callId || e.key), (e, t) => {
		$i(e, { get call() {
			return n(t);
		} });
	}), q(T), q(l), c((e, t, i) => {
		U(l, "data-tool-group-key", e), l.open = r.open, L(g, t), L(y, `${i ?? ""}${n(o).length > 2 ? ` · +${n(o).length - 2} more` : ""}`);
	}, [
		() => `${r.generationId}:${di(r.item)}`,
		() => ui(n(a)),
		() => n(o).slice(0, 2).join(" · ")
	]), J("toggle", l, (e) => r.onToggle(e.currentTarget.open)), m(t, l), _();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var na = o("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function ra(t, n) {
	e(n, !0);
	var r = na(), i = C(r), a = C(i);
	O(a, { name: "info" });
	var o = d(a), s = C(o);
	q(o), q(i);
	var l = d(i), u = C(l, !0);
	q(l), q(r), c(() => {
		L(s, `Unhandled event: ${(n.item.type || n.item.kind) ?? ""}`), L(u, n.item.preview || "This event carries no payload.");
	}), m(t, r), _();
}
//#endregion
//#region src/components/HistoryTimeline.svelte
var ia = o("<div class=\"history-state\"><!><span>Loading resource History...</span></div>"), aa = o("<div class=\"history-state history-error\"><!><strong>History unavailable</strong><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), oa = o("<button type=\"button\" class=\"secondary-button history-load-older\"><!> </button>"), sa = o("<div class=\"history-legacy\"><!><span><strong>Legacy history</strong><small>Conversation history from before resource History was available was migrated to Artifacts.</small></span><button type=\"button\" class=\"secondary-button\">Open legacy history</button></div>"), ca = o("<div class=\"history-state\"><!><span>No resource History yet.</span></div>"), la = o("<button type=\"button\" class=\"secondary-button\">Retry</button>"), ua = o("<div class=\"history-gap\"><!><span><strong>History gap</strong> </span><!></div>"), da = o("<span class=\"history-turn-trigger\"><span class=\"history-turn-trigger-label\">Trigger</span><span class=\"history-turn-trigger-text\"> </span></span>"), fa = o("<div class=\"history-detail-state\"><!>Loading Turn detail...</div>"), pa = o("<div class=\"history-detail-state history-error\"><!> </div>"), ma = o("<span> </span>"), ha = o("<div data-component-owner=\"event-timeline\" class=\"agent-run-header\"><strong> </strong><!></div>"), ga = o("<div class=\"history-item\"><!> <!></div>"), _a = o("<div class=\"history-items\"></div>"), va = o("<section><span class=\"history-turn-dot\"></span> <button type=\"button\" class=\"history-turn-header\"><span class=\"history-turn-meta\"><span class=\"history-turn-time\"> </span> <span class=\"history-status-pill\"> </span> <span class=\"history-turn-duration\"> </span> <span class=\"history-turn-count\"> <span><!></span></span></span> <!> <span> </span></button> <!> <!> <!></section>"), ya = o("<div class=\"history-generation\"><span class=\"history-generation-label\"> </span> <strong> </strong> <span class=\"history-generation-meta\"><span> </span> <span> </span> <span class=\"history-status-pill\"> </span></span></div> <div class=\"history-track\"></div>", 1), ba = o("<!> <!> <!> <!>", 1), xa = o("<div data-component-owner=\"history-timeline\" class=\"history-timeline-root\"><!></div>");
function Sa(t, r) {
	e(r, !0);
	let i = A(r, "artifacts", 19, () => []), a = T(W(x())), o, l = T(""), f = T(W(/* @__PURE__ */ new Map())), p = T(W(/* @__PURE__ */ new Set())), y = w(() => S(i(), "legacy-log.md"));
	K(() => {
		o = new _i({ realtime: !1 });
		let e = o.subscribe((e) => {
			u(a, e, !0), queueMicrotask(r.onIconsChanged);
		});
		return o.activate(r.workspaceId, r.resourceId, null), () => {
			e(), o?.dispose(), o = void 0;
		};
	});
	function x() {
		return {
			identity: "",
			workspaceId: "",
			resourceId: "",
			generationId: "",
			blocks: [],
			notices: [],
			hasMoreBefore: !1,
			loading: !1,
			loadingOlder: !1,
			loaded: !1,
			error: ""
		};
	}
	function S(e, t) {
		for (let n of e || []) {
			if (n.type === "file" && n.name === t) return n.path;
			let e = S(n.children || [], t);
			if (e) return e;
		}
		return "";
	}
	function E(e) {
		if (!e) return "Unknown time";
		let t = new Date(e);
		return Number.isNaN(t.getTime()) ? e : t.toLocaleString(void 0, {
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function D(e) {
		let t = Math.max(0, Math.round(Number(e || 0) / 1e3));
		return t ? t < 60 ? `${t}s` : `${Math.floor(t / 60)}m ${t % 60}s` : "<1s";
	}
	function j(e, t) {
		return e?.trim() || `Unknown ${t}`;
	}
	let N = /* @__PURE__ */ new Set([
		"starting",
		"running",
		"waiting_approval",
		"stopping",
		"recovering",
		"active"
	]), P = /* @__PURE__ */ new Set([
		"cancelled",
		"canceled",
		"interrupted"
	]);
	function F(e) {
		let t = (e || "").trim().toLowerCase();
		return t === "completed" || t === "stopped" ? "completed" : N.has(t) ? "active" : P.has(t) ? "cancelled" : t === "failed" ? "failed" : "neutral";
	}
	function I(e) {
		e.kind === "turn" && e.turn?.reference && o?.loadTurn(e.turn.reference);
	}
	function R(e) {
		return !!(e.items || e.events);
	}
	function z(e) {
		return n(p).has(ie(e)) && R(e);
	}
	function B(e) {
		let t = ie(e);
		if (n(p).has(t)) {
			let e = new Set(n(p));
			e.delete(t), u(p, e, !0);
			return;
		}
		u(p, new Set(n(p)).add(t), !0), I(e);
	}
	function V(e) {
		return Zr(Yr(e.events ? qr(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || []));
	}
	function H(e) {
		return e.generation.agentName || e.generation.resolvedProfile || e.generation.binding?.name || "Agent";
	}
	function G(e) {
		let t = e.kind === "tools" ? di(e) : String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event");
		return `${e.generationId || n(a).generationId}:${e.kind}:${t}`;
	}
	function ee(e) {
		return n(f).get(G(e)) ?? !1;
	}
	function te(e, t) {
		u(f, new Map(n(f)).set(G(e), t), !0), t && ne(e);
	}
	function ne(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return o?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function re() {
		return Promise.reject(/* @__PURE__ */ Error("This is a read-only History view. Answer pending approvals from the Chat tab."));
	}
	function ie(e) {
		return e.turn?.reference || e.key;
	}
	function ae(e) {
		let t = e.turn;
		if (!t) return !1;
		let n = (t.status || "").toLowerCase();
		return [
			"cancelled",
			"canceled",
			"interrupted",
			"failed"
		].includes(n) && !t.finalReplyPreview?.trim();
	}
	function J(e) {
		let t = e.turn;
		if (!t) return "unknown";
		let n = t.status || "unknown";
		return ae(e) ? `${n} · no final reply` : n;
	}
	function oe(e) {
		return e.turn?.triggerPreview?.trim() || "";
	}
	function se(e) {
		return ae(e) ? "No final reply" : e.turn?.finalReplyPreview?.trim() || "Select to load conversation detail";
	}
	let Y = w(() => ce(n(a).blocks));
	function ce(e) {
		let t = [];
		for (let n of e) {
			let e = t[t.length - 1];
			e && e.generation.generationId === n.generation.generationId ? e.blocks.push(n) : t.push({
				generation: n.generation,
				blocks: [n]
			});
		}
		return t;
	}
	var le = xa(), ue = C(le), de = (e) => {
		var t = ia(), n = C(t);
		O(n, {
			name: "loader-circle",
			className: "spin"
		}), M(), q(t), m(e, t);
	}, fe = (e) => {
		var t = aa(), r = C(t);
		O(r, { name: "triangle-alert" });
		var i = d(r, 2), s = C(i, !0);
		q(i);
		var l = d(i);
		q(t), c(() => L(s, n(a).error)), v("click", l, () => o?.retryHistory()), m(e, t);
	}, pe = (e) => {
		var t = ba(), i = s(t), f = (e) => {
			var t = oa(), r = C(t);
			O(r, { name: "chevrons-up" });
			var i = d(r, 1, !0);
			q(t), c(() => {
				t.disabled = n(a).loadingOlder, L(i, n(a).loadingOlder ? "Loading older History..." : "Load older History");
			}), v("click", t, () => o?.loadOlder()), m(e, t);
		};
		h(i, (e) => {
			n(a).hasMoreBefore && e(f);
		});
		var p = d(i, 2), _ = (e) => {
			Xi(e, {
				title: "History",
				get text() {
					return n(l);
				},
				error: !0
			});
		};
		h(p, (e) => {
			n(l) && e(_);
		});
		var x = d(p, 2), S = (e) => {
			var t = sa(), i = C(t);
			O(i, { name: "archive-restore" });
			var a = d(i, 2);
			q(t), v("click", a, () => r.onOpenLegacy(n(y))), m(e, t);
		}, T = (e) => {
			var t = ca(), n = C(t);
			O(n, { name: "history" }), M(), q(t), m(e, t);
		};
		h(x, (e) => {
			n(a).loaded && !n(a).blocks.length && n(y) ? e(S) : n(a).loaded && !n(a).blocks.length && e(T, 1);
		});
		var A = d(x, 2);
		b(A, 17, () => n(Y), (e) => e.generation.generationId, (e, t) => {
			var i = ya(), f = s(i), p = C(f), _ = C(p);
			q(p);
			var y = d(p, 2), x = C(y, !0);
			q(y);
			var S = d(y, 2), T = C(S), A = C(T, !0);
			q(T);
			var N = d(T, 2), P = C(N, !0);
			q(N);
			var I = d(N, 2), R = C(I, !0);
			q(I), q(S), q(f);
			var W = d(f, 2);
			b(W, 21, () => n(t).blocks, (e) => e.key, (e, t) => {
				var i = g(), f = s(i), p = (e) => {
					var r = ua(), i = C(r);
					O(i, { name: "triangle-alert" });
					var a = d(i), s = d(C(a));
					q(a);
					var l = d(a), u = (e) => {
						var t = la();
						v("click", t, () => o?.retryHistory()), m(e, t);
					};
					h(l, (e) => {
						n(t).gap?.retryable && e(u);
					}), q(r), c(() => {
						U(r, "data-timeline-key", n(t).key), L(s, ` — ${(n(t).gap?.message || "This generation could not be read.") ?? ""}`);
					}), m(e, r);
				}, _ = (e) => {
					var i = va();
					let o;
					var s = C(i), f = d(s, 2), p = C(f), g = C(p), _ = C(g, !0);
					q(g);
					var y = d(g, 2), x = C(y, !0);
					q(y);
					var S = d(y, 2), T = C(S, !0);
					q(S);
					var A = d(S, 2), j = C(A), N = d(j);
					let P;
					var I = C(N);
					O(I, { name: "chevron-down" }), q(N), q(A), q(p);
					var R = d(p, 2), W = (e) => {
						var r = da(), i = d(C(r)), a = C(i, !0);
						q(i), q(r), c((e) => L(a, e), [() => oe(n(t))]), m(e, r);
					}, K = w(() => oe(n(t)));
					h(R, (e) => {
						n(K) && e(W);
					});
					var Y = d(R, 2);
					let ce;
					var le = C(Y, !0);
					q(Y), q(f);
					var ue = d(f, 2), de = (e) => {
						var t = fa(), n = C(t);
						O(n, {
							name: "loader-circle",
							className: "spin"
						}), M(), q(t), m(e, t);
					};
					h(ue, (e) => {
						n(t).loading && e(de);
					});
					var fe = d(ue, 2), pe = (e) => {
						var r = pa(), i = C(r);
						O(i, { name: "triangle-alert" });
						var a = d(i, 1, !0);
						q(r), c(() => L(a, n(t).error)), m(e, r);
					};
					h(fe, (e) => {
						n(t).error && e(pe);
					});
					var me = d(fe, 2), he = (e) => {
						var i = _a();
						b(i, 21, () => V(n(t)), (e) => G(e), (e, i) => {
							var o = ga(), s = C(o), f = (e) => {
								var r = ha(), a = C(r), o = C(a, !0);
								q(a);
								var s = d(a), l = (e) => {
									var t = ma(), r = C(t, !0);
									q(t), c((e) => L(r, e), [() => Xr(n(i).time)]), m(e, t);
								}, u = w(() => Xr(n(i).time));
								h(s, (e) => {
									n(u) && e(l);
								}), q(r), c((e) => L(o, e), [() => H(n(t))]), m(e, r);
							};
							h(s, (e) => {
								n(i).agentStart && n(i).kind !== "message" && e(f);
							});
							var p = d(s, 2), g = (e) => {
								{
									let a = w(() => H(n(t)));
									Ji(e, {
										get item() {
											return n(i);
										},
										get agentName() {
											return n(a);
										},
										get workspaceId() {
											return r.workspaceId;
										},
										get resolveResourceTitle() {
											return r.resolveResourceTitle;
										},
										get onNavigate() {
											return r.onNavigate;
										},
										get onOpenFile() {
											return r.onOpenFile;
										}
									});
								}
							}, _ = (e) => {
								Bi(e, {
									get item() {
										return n(i);
									},
									onExpand: () => ne(n(i))
								});
							}, v = (e) => {
								{
									let r = w(() => ee(n(i)));
									ta(e, {
										get item() {
											return n(i);
										},
										get generationId() {
											return n(t).generation.generationId;
										},
										get open() {
											return n(r);
										},
										onToggle: (e) => te(n(i), e)
									});
								}
							}, y = (e) => {
								Cr(e, {
									get item() {
										return n(i);
									},
									get generationId() {
										return n(t).generation.generationId;
									},
									get contextIdentity() {
										return n(a).identity;
									},
									onApproval: re,
									onToast: (e) => u(l, e, !0)
								});
							}, b = (e) => {
								Ri(e, { get item() {
									return n(i);
								} });
							}, x = (e) => {
								{
									let t = w(() => n(i).text || "");
									Xi(e, {
										title: "Provider error",
										get text() {
											return n(t);
										},
										error: !0
									});
								}
							}, S = (e) => {
								ra(e, { get item() {
									return n(i);
								} });
							};
							h(p, (e) => {
								n(i).kind === "message" ? e(g) : n(i).kind === "thinking" ? e(_, 1) : n(i).kind === "tools" ? e(v, 2) : n(i).kind === "approval" ? e(y, 3) : n(i).kind === "lifecycle" ? e(b, 4) : n(i).kind === "error" ? e(x, 5) : e(S, -1);
							}), q(o), c(() => U(o, "data-history-kind", n(i).kind)), m(e, o);
						}), q(i), m(e, i);
					}, ge = w(() => z(n(t)));
					h(me, (e) => {
						n(ge) && e(he);
					}), q(i), c((e, r, a, c, l, u, d, p, m, h) => {
						o = k(i, 1, "history-turn", null, o, { "history-turn-loading": n(t).loading }), U(i, "data-timeline-key", e), U(s, "data-tone", r), U(f, "aria-expanded", a), L(_, c), U(y, "data-tone", l), L(x, u), L(T, d), L(j, `${n(t).turn.eventCount ?? ""} events · ${n(t).turn.toolEventCount ?? ""} tools `), P = k(N, 1, "history-turn-chevron", null, P, p), ce = k(Y, 1, "history-turn-preview", null, ce, m), L(le, h);
					}, [
						() => ie(n(t)),
						() => F(n(t).turn.status),
						() => z(n(t)),
						() => E(n(t).turn.startedAt),
						() => F(n(t).turn.status),
						() => J(n(t)),
						() => D(n(t).turn.durationMs),
						() => ({ expanded: z(n(t)) }),
						() => ({ "history-turn-preview-empty": ae(n(t)) }),
						() => se(n(t))
					]), v("click", f, () => B(n(t))), m(e, i);
				};
				h(f, (e) => {
					n(t).kind === "gap" ? e(p) : n(t).turn && e(_, 1);
				}), m(e, i);
			}), q(W), c((e, r, i, a) => {
				U(f, "data-generation-id", n(t).generation.generationId), L(_, `Generation ${n(t).generation.generation ?? ""}`), L(x, e), L(A, r), L(P, i), U(I, "data-tone", a), L(R, n(t).generation.status || "unknown");
			}, [
				() => j(n(t).generation.agentName, "agent"),
				() => j(n(t).generation.provider || n(t).generation.providerId, "provider"),
				() => j(n(t).generation.model, "model"),
				() => F(n(t).generation.status)
			]), m(e, i);
		}), m(e, t);
	};
	h(ue, (e) => {
		n(a).loading && !n(a).loaded ? e(de) : n(a).error && !n(a).loaded ? e(fe, 1) : e(pe, -1);
	}), q(le), m(t, le), _();
}
f(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var Ca = o("<button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button>"), wa = o("<button type=\"button\" class=\"secondary-button\"><!><span>Annotate</span></button>"), Ta = o("<div class=\"markdown-preview\"><div class=\"markdown-document-actions\"><!><!></div><div class=\"markdown-view markdown-rendered\"></div></div>"), Ea = o("<pre class=\"markdown-view\"> </pre>"), Da = o("<div class=\"content-section\" data-component-owner=\"markdown-document\"><!></div>");
function Oa(t, r) {
	e(r, !0);
	let i = A(r, "editable", 3, !1), a = w(() => Vn(r.file.name));
	var o = Da(), s = C(o), l = (e) => {
		var t = Ta(), n = C(t), a = C(n), o = (e) => {
			var t = Ca(), n = C(t);
			O(n, { name: "pencil" }), M(), q(t), v("click", t, () => r.onEdit(r.file.path || r.file.name)), m(e, t);
		};
		h(a, (e) => {
			i() && r.onEdit && e(o);
		});
		var s = d(a), c = (e) => {
			var t = wa(), n = C(t);
			O(n, { name: "message-square-plus" }), M(), q(t), v("click", t, () => r.onAnnotate(r.file.path || r.file.name)), m(e, t);
		};
		h(s, (e) => {
			i() && r.onAnnotate && e(c);
		}), q(n);
		var l = d(n);
		re(l, () => An(r.file.content || "", {
			workspaceId: r.workspaceId,
			resolveResourceTitle: r.resolveResourceTitle
		}), !0), q(l), ie(l, (e, t) => Nn?.(e, t), () => ({
			resolveResourceTitle: r.resolveResourceTitle,
			onNavigate: r.onNavigate,
			onOpenFile: r.onOpenFile
		})), q(t), m(e, t);
	}, u = (e) => {
		var t = Ea(), n = C(t, !0);
		q(t), c(() => L(n, r.file.content || "")), m(e, t);
	};
	h(s, (e) => {
		n(a) ? e(l) : e(u, -1);
	}), q(o), c(() => {
		U(o, "data-doc-file", r.file.name), U(o, "data-document-identity", `${r.workspaceId}:${r.file.path || r.file.name}:preview:${r.file.contentHash || "unversioned"}`);
	}), m(t, o), _();
}
f(["click"]);
//#endregion
//#region src/components/SchedulerPanel.svelte
var ka = o("<button type=\"button\" class=\"secondary-button\">Cancel edit</button>"), Aa = o("<article><header><div><strong> </strong><code> </code></div><div><button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button><button type=\"button\" class=\"secondary-button danger\"><!><span>Remove</span></button></div></header> <dl><div><dt>Condition</dt><dd> </dd></div><div><dt>Target</dt><dd><code> </code></dd></div></dl></article>"), ja = o("<div class=\"empty-list-row\"><!><span>No schedules. The Server will not create empty Scheduler Turns.</span></div>"), Ma = o("<div class=\"schedule-editor\"><div class=\"schedule-editor-heading\"><div><strong> </strong><span>Conditions are natural language interpreted by the Scheduler Agent.</span></div><!></div> <label><span>Description</span><input placeholder=\"What should the Scheduler understand?\"/></label> <label><span>Condition</span><textarea rows=\"3\" placeholder=\"For example: when the release branch is green after 09:00 Shanghai time\"></textarea></label> <label><span>Target resource ID</span><input placeholder=\"workspace, scheduler, project1, or project1.task1\"/></label> <button type=\"button\"><span class=\"schedule-icon schedule-icon-busy\"><!></span><span class=\"schedule-icon schedule-icon-editing\"><!></span><span class=\"schedule-icon schedule-icon-add\"><!></span><span> </span></button></div> <div class=\"schedule-list\"><!></div>", 1);
function Na(t, r) {
	e(r, !0);
	let i = new sn();
	H(() => i.dispose());
	let a = T(""), o = T(""), l = T(""), f = T("workspace"), p = T(!1);
	function y(e) {
		u(a, e.id, !0), u(o, e.description, !0), u(l, e.condition, !0), u(f, e.target, !0);
	}
	function x() {
		u(a, ""), u(o, ""), u(l, ""), u(f, "workspace");
	}
	async function S() {
		if (!n(o).trim() || !n(l).trim() || !n(f).trim() || n(p)) return;
		u(p, !0);
		let e = !!n(a);
		try {
			let t = `/api/workspaces/${encodeURIComponent(r.workspaceId)}/scheduler${n(a) ? `/${encodeURIComponent(n(a))}` : ""}`;
			await i.request(t, {
				method: n(a) ? "PUT" : "POST",
				body: JSON.stringify({
					description: n(o),
					condition: n(l),
					target: n(f)
				})
			}), x(), await r.onChanged(), r.onToast(e ? "Schedule updated." : "Schedule added.");
		} catch (e) {
			r.onToast(e instanceof Error ? e.message : String(e));
		} finally {
			u(p, !1);
		}
	}
	async function w(e) {
		if (await hn({
			title: "Remove schedule",
			message: `Remove schedule ${e.id}?`,
			confirmLabel: "Remove",
			danger: !0
		})) try {
			await i.request(`/api/workspaces/${encodeURIComponent(r.workspaceId)}/scheduler/${encodeURIComponent(e.id)}`, { method: "DELETE" }), n(a) === e.id && x(), await r.onChanged(), r.onToast("Schedule removed.");
		} catch (e) {
			r.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var D = Ma(), A = s(D), P = C(A), F = C(P), I = C(F), R = C(I, !0);
	q(I), M(), q(F);
	var z = d(F), B = (e) => {
		var t = ka();
		v("click", t, x), m(e, t);
	};
	h(z, (e) => {
		n(a) && e(B);
	}), q(P);
	var V = d(P, 2), U = d(C(V));
	N(U), q(V);
	var W = d(V, 2), G = d(C(W));
	E(G), q(W);
	var K = d(W, 2), ee = d(C(K));
	N(ee), q(K);
	var te = d(K, 2);
	let ne;
	var re = C(te), ie = C(re);
	O(ie, { name: "loader-circle" }), q(re);
	var ae = d(re), J = C(ae);
	O(J, { name: "save" }), q(ae);
	var oe = d(ae), se = C(oe);
	O(se, { name: "plus" }), q(oe);
	var Y = d(oe), ce = C(Y, !0);
	q(Y), q(te), q(A);
	var le = d(A, 2), ue = C(le), de = (e) => {
		var t = g(), i = s(t);
		b(i, 17, () => r.config.schedules, (e) => e.id, (e, t) => {
			var r = Aa();
			let i;
			var o = C(r), s = C(o), l = C(s), u = C(l, !0);
			q(l);
			var f = d(l), p = C(f, !0);
			q(f), q(s);
			var h = d(s), g = C(h), _ = C(g);
			O(_, { name: "pencil" }), M(), q(g);
			var b = d(g), x = C(b);
			O(x, { name: "trash-2" }), M(), q(b), q(h), q(o);
			var S = d(o, 2), T = C(S), E = d(C(T)), D = C(E, !0);
			q(E), q(T);
			var A = d(T), j = d(C(A)), N = C(j), P = C(N, !0);
			q(N), q(j), q(A), q(S), q(r), c(() => {
				i = k(r, 1, "", null, i, { editing: n(a) === n(t).id }), L(u, n(t).description), L(p, n(t).id), L(D, n(t).condition), L(P, n(t).target);
			}), v("click", g, () => y(n(t))), v("click", b, () => w(n(t))), m(e, r);
		}), m(e, t);
	}, fe = (e) => {
		var t = ja(), n = C(t);
		O(n, { name: "calendar-clock" }), M(), q(t), m(e, t);
	};
	h(ue, (e) => {
		r.config.schedules.length ? e(de) : e(fe, -1);
	}), q(le), c((e, t) => {
		L(R, n(a) ? "Edit schedule" : "Add schedule"), te.disabled = e, ne = k(te, 1, "", null, ne, t), L(ce, n(a) ? "Update schedule" : "Add schedule");
	}, [() => n(p) || !n(o).trim() || !n(l).trim() || !n(f).trim(), () => ({
		busy: n(p),
		editing: !!n(a)
	})]), j(U, () => n(o), (e) => u(o, e)), j(G, () => n(l), (e) => u(l, e)), j(ee, () => n(f), (e) => u(f, e)), v("click", te, S), m(t, D), _();
}
f(["click"]);
//#endregion
//#region src/components/ResourceSettingsPanel.svelte
var Pa = o("<section class=\"resource-settings-card\"><div><strong>Workspace Agent</strong><span>Runs the Workspace Agent itself. Matches the selector in the chat composer.</span></div> <!></section> <section class=\"resource-settings-card\"><div><strong>New Project default</strong><span>Applied once when a Project is created in this Workspace.</span></div> <!></section> <section class=\"resource-settings-card\"><div><strong>New Task default</strong><span>Applied once when a Task is created, unless its Project overrides it.</span></div> <!></section>", 1), Fa = o("<section class=\"resource-settings-card\"><div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div> <div class=\"resource-settings-interval\"><label><input type=\"number\" min=\"1\" max=\"10080\" step=\"1\" aria-label=\"Scheduler wake interval in minutes\"/><span>minutes</span></label> <button type=\"button\" class=\"secondary-button\"><!><span>Save</span></button></div></section>"), Ia = o("<section class=\"resource-settings-card\"><div><strong>Scheduler Agent</strong><span>Runs Scheduler wake-up Turns. Matches the selector in the chat composer.</span></div> <!></section> <!>", 1), La = o("<section class=\"resource-settings-card\"><div><strong>Project Agent</strong><span>Runs the Project Agent itself. Matches the selector in the chat composer.</span></div> <!></section> <section class=\"resource-settings-card\"><div><strong>New Task default</strong><span>Applied once when a Task is created in this Project. Inherit uses the Workspace default.</span></div> <!></section>", 1), Ra = o("<section class=\"resource-settings-card\"><div><strong>Task Agent</strong><span>Runs the Task Agent itself. Matches the selector in the chat composer.</span></div> <!></section>"), za = o("<div class=\"resource-settings\" data-component-owner=\"resource-settings-panel\"><!></div>");
function Ba(t, r) {
	e(r, !0);
	let i = new sn(), a = T(""), o = T(30);
	x(() => {
		let e = r.model.detail?.scheduler?.wakeIntervalMinutes;
		typeof e == "number" && u(o, e, !0);
	});
	let l = w(() => r.model.detail?.scheduler), f = w(() => r.model.detail?.taskDefault?.name ? {
		kind: r.model.detail.taskDefault.kind,
		name: r.model.detail.taskDefault.name
	} : {
		kind: "profile",
		name: ""
	});
	async function p(e, t) {
		if (!n(a)) {
			u(a, e, !0);
			try {
				await t();
			} catch (e) {
				r.model.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				u(a, "");
			}
		}
	}
	function g(e) {
		p("binding", () => r.model.onSaveAgentBinding(e));
	}
	function y(e, t) {
		let n = {
			...r.model.workspaceDefaults,
			[e]: t
		};
		p(`default:${e}`, () => r.model.onSaveWorkspaceDefaults(n));
	}
	function b(e) {
		p("taskDefault", () => r.model.onSaveTaskDefault(r.model.resourceId, e.name ? e : null));
	}
	function S() {
		let e = n(l);
		!e || !Number.isInteger(n(o)) || n(o) < 1 || n(o) > 10080 || p("interval", async () => {
			await i.request(`/api/workspaces/${encodeURIComponent(r.model.workspaceId)}/scheduler/settings`, {
				method: "PUT",
				body: JSON.stringify({
					agentBinding: e.agentBinding,
					wakeIntervalMinutes: n(o)
				})
			}), await r.model.onRefreshScheduler?.(), r.model.onToast("Scheduler interval saved.");
		});
	}
	var E = za(), D = C(E), k = (e) => {
		var t = Pa(), i = s(t), o = d(C(i), 2);
		{
			let e = w(() => !!n(a));
			rt(o, {
				get value() {
					return r.model.agentBinding;
				},
				get profiles() {
					return r.model.agentProfiles;
				},
				get agents() {
					return r.model.agents;
				},
				get disabled() {
					return n(e);
				},
				openUp: !1,
				ariaLabel: "Workspace Agent binding",
				onSelect: g
			});
		}
		q(i);
		var c = d(i, 2), l = d(C(c), 2);
		{
			let e = w(() => !!n(a));
			rt(l, {
				get value() {
					return r.model.workspaceDefaults.project;
				},
				get profiles() {
					return r.model.agentProfiles;
				},
				get agents() {
					return r.model.agents;
				},
				get disabled() {
					return n(e);
				},
				openUp: !1,
				ariaLabel: "New Project default binding",
				onSelect: (e) => y("project", e)
			});
		}
		q(c);
		var u = d(c, 2), f = d(C(u), 2);
		{
			let e = w(() => !!n(a));
			rt(f, {
				get value() {
					return r.model.workspaceDefaults.task;
				},
				get profiles() {
					return r.model.agentProfiles;
				},
				get agents() {
					return r.model.agents;
				},
				get disabled() {
					return n(e);
				},
				openUp: !1,
				ariaLabel: "New Task default binding",
				onSelect: (e) => y("task", e)
			});
		}
		q(u), m(e, t);
	}, A = (e) => {
		var t = Ia(), i = s(t), f = d(C(i), 2);
		{
			let e = w(() => !!n(a));
			rt(f, {
				get value() {
					return r.model.agentBinding;
				},
				get profiles() {
					return r.model.agentProfiles;
				},
				get agents() {
					return r.model.agents;
				},
				get disabled() {
					return n(e);
				},
				openUp: !1,
				ariaLabel: "Scheduler Agent binding",
				onSelect: g
			});
		}
		q(i);
		var p = d(i, 2), _ = (e) => {
			var t = Fa(), r = d(C(t), 2), i = C(r), s = C(i);
			N(s), M(), q(i);
			var f = d(i, 2), p = C(f);
			O(p, { name: "save" }), M(), q(f), q(r), q(t), c((e) => f.disabled = e, [() => !!n(a) || n(o) === n(l).wakeIntervalMinutes]), j(s, () => n(o), (e) => u(o, e)), v("click", f, S), m(e, t);
		};
		h(p, (e) => {
			n(l) && e(_);
		}), m(e, t);
	}, P = (e) => {
		var t = La(), i = s(t), o = d(C(i), 2);
		{
			let e = w(() => !!n(a));
			rt(o, {
				get value() {
					return r.model.agentBinding;
				},
				get profiles() {
					return r.model.agentProfiles;
				},
				get agents() {
					return r.model.agents;
				},
				get disabled() {
					return n(e);
				},
				openUp: !1,
				ariaLabel: "Project Agent binding",
				onSelect: g
			});
		}
		q(i);
		var c = d(i, 2), l = d(C(c), 2);
		{
			let e = w(() => !!n(a));
			rt(l, {
				get value() {
					return n(f);
				},
				get profiles() {
					return r.model.agentProfiles;
				},
				get agents() {
					return r.model.agents;
				},
				get disabled() {
					return n(e);
				},
				openUp: !1,
				allowInherit: !0,
				inheritLabel: "Inherit (Workspace default)",
				ariaLabel: "New Task default binding",
				onSelect: b
			});
		}
		q(c), m(e, t);
	}, F = (e) => {
		var t = Ra(), i = d(C(t), 2);
		{
			let e = w(() => !!n(a));
			rt(i, {
				get value() {
					return r.model.agentBinding;
				},
				get profiles() {
					return r.model.agentProfiles;
				},
				get agents() {
					return r.model.agents;
				},
				get disabled() {
					return n(e);
				},
				openUp: !1,
				ariaLabel: "Task Agent binding",
				onSelect: g
			});
		}
		q(t), m(e, t);
	};
	h(D, (e) => {
		r.model.resourceType === "workspace" ? e(k) : r.model.resourceType === "scheduler" ? e(A, 1) : r.model.resourceType === "project" ? e(P, 2) : r.model.resourceType === "task" && e(F, 3);
	}), q(E), m(t, E), _();
}
f(["click"]);
//#endregion
//#region src/components/DetailPanel.svelte
var Va = o("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), Ha = o("<button type=\"button\" role=\"tab\"><!><span> </span></button>"), Ua = o("<div class=\"content-section\"><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>AGENTS.md unavailable</strong><span> </span></div></div>"), Wa = o("<div class=\"content-section\"><div class=\"file-modal-empty wiki-status\"><!><strong>Loading AGENTS.md...</strong></div></div>"), Ga = o("<div class=\"content-section\"><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), Ka = o("<div class=\"content-section\"><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run pua migrate to create wiki/index.md.</span></div></div>"), qa = o("<div class=\"details-header\"><h1 class=\"details-title\"> </h1></div> <div class=\"details-tabs\" role=\"tablist\" aria-label=\"Workspace details\"></div> <div id=\"detailsContent\" class=\"details-content\"><div><!></div> <div><!></div> <div><!></div></div>", 1), Ja = o("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), Ya = o("<code class=\"resource-ref-badge\"> </code>"), Xa = o("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), Za = o("<button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button>"), Qa = o("<div class=\"details-actions\"><!><!></div>"), $a = o("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), eo = o("<div><!></div>"), to = o("<div class=\"content-section\"><div class=\"file-modal-empty detail-missing\"><!><strong>Project brief is missing</strong><span>project.md was not found in this project directory.</span></div></div>"), no = o("<div class=\"content-section\"><div class=\"file-modal-empty detail-missing\"><!><strong>Task brief is missing</strong><span>task.md was not found in this task directory.</span></div></div>"), ro = o("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), io = o("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), ao = o("<div class=\"content-section\"><div class=\"template-list\"><!></div></div>"), oo = o("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), so = o("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), co = o("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!> <!> <!> <div><!></div> <div><!></div> <!> <div><!></div> <div><div class=\"content-section\"><div class=\"worktree-list\"><!></div></div></div></div>", 1), lo = o("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!></nav> <h1 class=\"details-title\"> <!></h1><!></div> <!>", 1), uo = o("<!> <!> <!>", 1);
function fo(t, r) {
	e(r, !0);
	let a = T(W(r.channel.current())), o = T(""), l = T(""), f = T(W(/* @__PURE__ */ new Set())), p = T(null), y = T(null), x = /* @__PURE__ */ new Map(), E = new sn(), D = 0, A = w(() => (n(a).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), j = w(() => new Set(n(A).map((e) => e.name))), N = w(() => n(a).workspaceAgents && !n(a).workspaceAgents.error ? {
		name: "AGENTS.md",
		path: n(a).workspaceAgents.path || "AGENTS.md",
		content: n(a).workspaceAgents.content || "",
		contentHash: n(a).workspaceAgents.contentHash
	} : null), P = w(z), F = w(() => n(p) ? `${n(p).section}:${n(p).path}` : ""), I = w(() => n(a).resourceType === "workspace" ? !!(n(p) && (n(p).path === "AGENTS.md" || n(p).path === "")) : !n(a).detail?.archived && (n(a).resourceType === "project" || n(a).resourceType === "task"));
	K(() => r.channel.subscribe((e) => {
		let t = Y(), r = ++D;
		if (u(a, e, !0), e.identity !== n(o)) {
			n(o) && n(l) && x.set(n(o), n(l)), u(o, e.identity, !0), u(p, null), u(y, null), u(f, /* @__PURE__ */ new Set(), !0);
			let t = x.get(n(o));
			u(l, t && t !== "work" ? t : R(e), !0);
			let r = document.getElementById("detailsContent");
			r && (r.scrollTop = 0);
		} else n(P).length && !n(P).some((e) => e.id === n(l)) && u(l, n(P)[0].id, !0);
		S().then(() => {
			r === D && ce(t), e.onIconsChanged();
		});
	})), K(() => {
		let e = (e) => {
			e.key === "Escape" && (n(y) ? (e.preventDefault(), u(y, null)) : n(p) && (e.preventDefault(), u(p, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), H(() => E.dispose());
	function R(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "workspace" ? "agents" : e.resourceType === "scheduler" ? "schedules" : e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "history";
	}
	function z() {
		if (n(a).resourceType === "workspace") return [
			{
				id: "agents",
				label: "AGENTS.md",
				icon: "file-text"
			},
			{
				id: "wiki",
				label: "Wiki",
				icon: "book-open"
			},
			{
				id: "settings",
				label: "Settings",
				icon: "settings"
			}
		];
		if (!n(a).detail) return [];
		if (n(a).resourceType === "scheduler") return [
			{
				id: "schedules",
				label: "Schedules",
				icon: "calendar-clock"
			},
			{
				id: "context",
				label: "Context",
				icon: "file-text"
			},
			{
				id: "settings",
				label: "Settings",
				icon: "settings"
			}
		];
		let e = [];
		return n(a).resourceType === "project" && e.push({
			id: "project",
			label: "Project",
			icon: "file-text"
		}), n(a).resourceType === "task" && e.push({
			id: "task",
			label: "Task",
			icon: "file-text"
		}), n(a).resourceType === "project" && e.push({
			id: "template",
			label: "Template",
			icon: "layout-template"
		}), e.push({
			id: "history",
			label: "History",
			icon: "history"
		}, {
			id: "artifacts",
			label: "Artifacts",
			icon: "paperclip"
		}), n(a).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees",
			icon: "folder-git-2"
		}), e.push({
			id: "settings",
			label: "Settings",
			icon: "settings"
		}), e;
	}
	function B(e) {
		return e.name === "scheduler.md" ? "context" : e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : n(P).find((e) => ["project", "task"].includes(e.id))?.id || "";
	}
	function V(e) {
		u(l, e, !0), x.set(n(o), e);
	}
	function G(e) {
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function ee(e) {
		let t = new Set(n(f));
		t.has(e) ? t.delete(e) : t.add(e), u(f, t, !0), queueMicrotask(n(a).onIconsChanged);
	}
	function te(e, t, r = !1) {
		let i = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(n(a).workspaceId)}/files/raw?path=${encodeURIComponent(t)}${i}`;
	}
	function ne(e, t, n) {
		u(p, {
			section: e,
			path: t,
			mode: n
		}, !0);
	}
	function re(e) {
		ne("Files", e);
	}
	function ie(e) {
		ne("Files", e, "edit");
	}
	function ae(e) {
		ne("Files", e, "annotate");
	}
	function J(e) {
		hn({
			title: "Delete artifact",
			message: `Delete artifact "${e.split("/").pop() || e}"? This cannot be undone.`,
			confirmLabel: "Delete",
			danger: !0
		}).then(async (t) => {
			if (t) try {
				await n(a).onDeleteArtifact(e), n(p) && n(p).section === "Artifacts" && n(p).path === e && u(p, null);
			} catch (e) {
				le(e instanceof Error ? e.message : String(e));
			}
		});
	}
	function oe(e, t, r) {
		return n(a).resourceType === "workspace" && (e === "AGENTS.md" || e === "") ? n(a).onSaveWorkspaceAgents(t, r) : n(a).onSaveMarkdownFile(e, t, r);
	}
	function se(e) {
		return `${e.section}:${e.path}`;
	}
	function Y() {
		if (!n(p)) return null;
		let e = document.querySelector("[data-preview-scroll]");
		return e ? {
			key: se(n(p)),
			scrollTop: e.scrollTop,
			scrollLeft: e.scrollLeft
		} : null;
	}
	function ce(e) {
		if (!e || !n(p) || e.key !== se(n(p))) return;
		let t = document.querySelector("[data-preview-scroll]");
		t && (t.scrollTop = e.scrollTop, t.scrollLeft = e.scrollLeft);
	}
	function le(e) {
		e && n(a).onToast(e);
	}
	var ue = uo(), de = s(ue), fe = (e) => {
		var t = Va(), n = C(t), r = C(n);
		O(r, {
			name: "folder-search",
			className: "empty-state-icon"
		}), M(2), q(n), q(t), m(e, t);
	}, pe = (e) => {
		var t = qa(), r = s(t), i = C(r), o = C(i, !0);
		q(i), q(r);
		var u = d(r, 2);
		b(u, 21, () => n(P), (e) => e.id, (e, t) => {
			var r = Ha();
			let i;
			var a = C(r);
			O(a, { get name() {
				return n(t).icon;
			} });
			var o = d(a), s = C(o, !0);
			q(o), q(r), c(() => {
				i = k(r, 1, "details-tab", null, i, { active: n(l) === n(t).id }), U(r, "aria-selected", n(l) === n(t).id), L(s, n(t).label);
			}), v("click", r, () => V(n(t).id)), m(e, r);
		}), q(u);
		var p = d(u, 2), g = C(p), _ = C(g), y = (e) => {
			Oa(e, {
				get file() {
					return n(N);
				},
				get workspaceId() {
					return n(a).workspaceId;
				},
				editable: !0,
				get resolveResourceTitle() {
					return n(a).resolveResourceTitle;
				},
				get onNavigate() {
					return n(a).onNavigate;
				},
				onOpenFile: re,
				onEdit: ie,
				onAnnotate: ae
			});
		}, x = (e) => {
			var t = Ua(), r = C(t), i = C(r);
			O(i, { name: "triangle-alert" });
			var o = d(i, 2), s = C(o, !0);
			q(o), q(r), q(t), c(() => L(s, n(a).workspaceAgents.error)), m(e, t);
		}, S = (e) => {
			var t = Wa(), n = C(t), r = C(n);
			O(r, { name: "loader-circle" }), M(), q(n), q(t), m(e, t);
		};
		h(_, (e) => {
			n(N) ? e(y) : n(a).workspaceAgents?.error ? e(x, 1) : e(S, -1);
		}), q(g);
		var T = d(g, 2), E = C(T), D = (e) => {
			var t = Ga(), r = C(t), i = C(r);
			O(i, { name: "triangle-alert" });
			var o = d(i, 2), s = C(o, !0);
			q(o), q(r), q(t), c(() => L(s, n(a).wiki.error)), m(e, t);
		}, A = (e) => {
			var t = Ka(), n = C(t), r = C(n);
			O(r, { name: "book-open" }), M(2), q(n), q(t), m(e, t);
		}, j = (e) => {
			{
				let t = w(() => n(a).wiki.entries || []);
				Zn(e, {
					title: "Wiki",
					get entries() {
						return n(t);
					},
					emptyMessage: "No Wiki files yet.",
					get expanded() {
						return n(f);
					},
					get activePath() {
						return n(F);
					},
					onToggle: ee,
					onPreview: ne,
					rawURL: te,
					showHeading: !1
				});
			}
		};
		h(E, (e) => {
			n(a).wiki?.error ? e(D) : n(a).wiki?.exists ? e(j, -1) : e(A, 1);
		}), q(T);
		var I = d(T, 2);
		Ba(C(I), { get model() {
			return n(a);
		} }), q(I), q(p), c(() => {
			L(o, n(a).workspaceName), U(g, "hidden", n(l) !== "agents"), U(T, "hidden", n(l) !== "wiki"), U(I, "hidden", n(l) !== "settings");
		}), m(e, t);
	}, me = (e) => {
		var t = lo(), r = s(t), o = C(r), p = C(o), _ = C(p, !0);
		q(p);
		var x = d(p, 2), S = (e) => {
			var t = Ja(), r = d(s(t)), i = C(r, !0);
			q(r), c(() => L(i, n(a).parent.title)), v("click", r, () => n(a).onNavigate(n(a).parent?.id || "workspace")), m(e, t);
		};
		h(x, (e) => {
			n(a).parent && e(S);
		}), q(o);
		var T = d(o, 2), E = C(T, !0), D = d(E), N = (e) => {
			var t = Ya(), r = C(t, !0);
			q(t), c((e) => L(r, e), [() => G(n(a).resourceId)]), m(e, t);
		};
		h(D, (e) => {
			n(a).resourceType !== "scheduler" && e(N);
		}), q(T);
		var I = d(T), R = (e) => {
			var t = Qa(), r = C(t), i = (e) => {
				var t = Xa(), r = C(t);
				O(r, { name: "plus" }), M(), q(t), v("click", t, () => n(a).onCreateTask(n(a).resourceId)), m(e, t);
			};
			h(r, (e) => {
				n(a).resourceType === "project" && e(i);
			});
			var o = d(r), s = (e) => {
				var t = Za(), r = C(t);
				O(r, { name: "archive" }), M(), q(t), v("click", t, () => n(a).onArchive(n(a).resourceId)), m(e, t);
			};
			h(o, (e) => {
				n(a).resourceType !== "scheduler" && e(s);
			}), q(t), m(e, t);
		};
		h(I, (e) => {
			n(a).detail && e(R);
		}), q(r);
		var z = d(r, 2), H = (e) => {
			var t = $a(), n = C(t), r = C(n);
			O(r, {
				name: "loader-circle",
				className: "empty-state-icon"
			}), M(), q(n), q(t), m(e, t);
		}, W = (e) => {
			var t = co(), r = s(t);
			b(r, 21, () => n(P), (e) => e.id, (e, t) => {
				var r = Ha();
				let i;
				var a = C(r);
				O(a, { get name() {
					return n(t).icon;
				} });
				var o = d(a), s = C(o, !0);
				q(o), q(r), c(() => {
					i = k(r, 1, "details-tab", null, i, { active: n(l) === n(t).id }), U(r, "aria-selected", n(l) === n(t).id), L(s, n(t).label);
				}), v("click", r, () => V(n(t).id)), m(e, r);
			}), q(r);
			var o = d(r, 2), p = C(o);
			b(p, 17, () => n(A), (e) => e.path || e.name, (e, t) => {
				var r = eo(), i = C(r);
				{
					let e = w(() => !n(a).detail.archived && (n(a).resourceType === "project" || n(a).resourceType === "task"));
					Oa(i, {
						get file() {
							return n(t);
						},
						get workspaceId() {
							return n(a).workspaceId;
						},
						get editable() {
							return n(e);
						},
						get resolveResourceTitle() {
							return n(a).resolveResourceTitle;
						},
						get onNavigate() {
							return n(a).onNavigate;
						},
						onOpenFile: re,
						onEdit: ie,
						onAnnotate: ae
					});
				}
				q(r), c((e) => U(r, "hidden", e), [() => n(l) !== B(n(t))]), m(e, r);
			});
			var _ = d(p, 2), x = (e) => {
				var t = to(), r = C(t), i = C(r);
				O(i, { name: "file-text" }), M(2), q(r), q(t), c(() => U(t, "hidden", n(l) !== "project")), m(e, t);
			}, S = w(() => n(a).resourceType === "project" && !n(j).has("project.md"));
			h(_, (e) => {
				n(S) && e(x);
			});
			var T = d(_, 2), E = (e) => {
				var t = no(), r = C(t), i = C(r);
				O(i, { name: "file-text" }), M(2), q(r), q(t), c(() => U(t, "hidden", n(l) !== "task")), m(e, t);
			}, D = w(() => n(a).resourceType === "task" && !n(j).has("task.md"));
			h(T, (e) => {
				n(D) && e(E);
			});
			var N = d(T, 2), I = (e) => {
				var t = eo(), r = C(t);
				{
					let e = w(() => n(a).onRefreshScheduler || (async () => void 0));
					Na(r, {
						get workspaceId() {
							return n(a).workspaceId;
						},
						get config() {
							return n(a).detail.scheduler;
						},
						get onChanged() {
							return n(e);
						},
						get onToast() {
							return n(a).onToast;
						}
					});
				}
				q(t), c(() => U(t, "hidden", n(l) !== "schedules")), m(e, t);
			};
			h(N, (e) => {
				n(a).resourceType === "scheduler" && n(a).detail.scheduler && e(I);
			});
			var R = d(N, 2);
			Ba(C(R), { get model() {
				return n(a);
			} }), q(R);
			var z = d(R, 2), H = C(z), W = (e) => {
				var t = ao(), r = C(t), i = C(r), o = (e) => {
					var t = g(), r = s(t);
					b(r, 17, () => n(a).detail.templates, (e) => e.name, (e, t) => {
						var r = ro();
						let i;
						var a = C(r);
						O(a, { name: "file-text" });
						var o = d(a), s = C(o), l = C(s, !0);
						q(s);
						var u = d(s), f = C(u);
						q(u), q(o);
						var p = d(o);
						O(p, { name: "chevron-right" }), q(r), c(() => {
							i = k(r, 1, "template-row", null, i, { invalid: !n(t).valid }), L(l, n(t).title || n(t).name), L(f, `${n(t).name ?? ""} · v${(n(t).schemaVersion || "?") ?? ""} · ${n(t).valid ? `${(n(t).fields || []).length} fields` : `invalid${n(t).errors?.[0]?.message ? `: ${n(t).errors[0].message}` : ""}`}${n(t).legacy ? " · legacy" : ""}`);
						}), v("click", r, () => n(t).path && ne("Templates", n(t).path)), m(e, r);
					}), m(e, t);
				}, l = (e) => {
					var t = io(), n = C(t);
					O(n, { name: "layout-template" }), M(), q(t), m(e, t);
				};
				h(i, (e) => {
					n(a).detail.templates?.length ? e(o) : e(l, -1);
				}), q(r), q(t), m(e, t);
			};
			h(H, (e) => {
				n(a).resourceType === "project" && e(W);
			}), q(z);
			var G = d(z, 2), K = (e) => {
				var t = g(), r = s(t);
				i(r, () => n(a).identity, (e) => {
					{
						let t = w(() => n(a).detail.artifacts || []);
						Sa(e, {
							get workspaceId() {
								return n(a).workspaceId;
							},
							get resourceId() {
								return n(a).resourceId;
							},
							get artifacts() {
								return n(t);
							},
							get resolveResourceTitle() {
								return n(a).resolveResourceTitle;
							},
							get onNavigate() {
								return n(a).onNavigate;
							},
							onOpenFile: re,
							onOpenLegacy: (e) => ne("Artifacts", e),
							get onIconsChanged() {
								return n(a).onIconsChanged;
							}
						});
					}
				}), m(e, t);
			};
			h(G, (e) => {
				n(l) === "history" && e(K);
			});
			var oe = d(G, 2), se = C(oe);
			{
				let e = w(() => n(a).detail.artifacts || []), t = w(() => n(a).detail.archived ? void 0 : J);
				Zn(se, {
					title: "Artifacts",
					get entries() {
						return n(e);
					},
					emptyMessage: "No artifacts.",
					get expanded() {
						return n(f);
					},
					get activePath() {
						return n(F);
					},
					onToggle: ee,
					onPreview: ne,
					rawURL: te,
					get onDelete() {
						return n(t);
					},
					showHeading: !1
				});
			}
			q(oe);
			var Y = d(oe, 2), ce = C(Y), le = C(ce), ue = C(le), de = (e) => {
				var t = g(), r = s(t);
				b(r, 17, () => n(a).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var r = oo(), i = C(r), a = C(i);
					O(a, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var o = d(a), s = C(o), l = C(s, !0);
					q(s);
					var f = d(s), p = C(f);
					q(f);
					var h = d(f), g = C(h, !0);
					q(h), q(o), q(i);
					var _ = d(i), b = C(_);
					O(b, { name: "git-compare-arrows" }), M(), q(_), q(r), c(() => {
						L(l, n(t).branch || "HEAD"), L(p, `${(n(t).name || "repository") ?? ""}${n(t).targetBranch || n(t).baseBranch ? ` · base ${n(t).targetBranch || n(t).baseBranch}` : ""}`), L(g, n(t).worktreePath || "");
					}), v("click", _, () => u(y, n(t), !0)), m(e, r);
				}), m(e, t);
			}, fe = (e) => {
				var t = so(), n = C(t);
				O(n, { name: "git-branch" }), M(), q(t), m(e, t);
			};
			h(ue, (e) => {
				n(a).detail.repos?.length ? e(de) : e(fe, -1);
			}), q(le), q(ce), q(Y), q(o), c(() => {
				U(R, "hidden", n(l) !== "settings"), U(z, "hidden", n(l) !== "template"), U(oe, "hidden", n(l) !== "artifacts"), U(Y, "hidden", n(l) !== "worktrees");
			}), m(e, t);
		};
		h(z, (e) => {
			n(a).loading || !n(a).detail ? e(H) : e(W, -1);
		}), c(() => {
			L(_, n(a).workspaceName), L(E, n(a).resourceTitle);
		}), v("click", p, () => n(a).onNavigate("workspace")), m(e, t);
	};
	h(de, (e) => {
		n(a).workspaceId ? n(a).resourceType === "workspace" ? e(pe, 1) : e(me, -1) : e(fe);
	});
	var he = d(de, 2);
	mr(he, {
		get client() {
			return E;
		},
		get workspaceId() {
			return n(a).workspaceId;
		},
		get resourceId() {
			return n(a).resourceId;
		},
		get selection() {
			return n(p);
		},
		get editable() {
			return n(I);
		},
		get resolveResourceTitle() {
			return n(a).resolveResourceTitle;
		},
		get onNavigate() {
			return n(a).onNavigate;
		},
		onOpenFile: re,
		onSaveMarkdown: oe,
		onClose: () => u(p, null),
		onError: le,
		get onIconsChanged() {
			return n(a).onIconsChanged;
		}
	}), xn(d(he, 2), {
		get client() {
			return E;
		},
		get workspaceId() {
			return n(a).workspaceId;
		},
		get resourceId() {
			return n(a).resourceId;
		},
		get repo() {
			return n(y);
		},
		onClose: () => u(y, null),
		onError: le,
		get onIconsChanged() {
			return n(a).onIconsChanged;
		}
	}), m(t, ue), _();
}
f(["click"]);
//#endregion
//#region src/components/generation-status.ts
var po = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"stopping",
	"recovering"
]), mo = /* @__PURE__ */ new Set([
	"idle",
	"idle-suspended",
	"stopped",
	"failed",
	"archived"
]);
function ho(e) {
	return String(e || "").trim();
}
function go(e, t) {
	let n = ho(e.generation.status) || "unknown", r = t?.generation;
	if (!r || r.generationId !== e.generation.generationId) return n;
	let i = ho(r.status);
	if (!t?.state) return i || n;
	switch (t.state) {
		case "working": return po.has(i) ? i : "running";
		case "attention_required": return i === "waiting_approval" ? i : "waiting_approval";
		case "idle": return mo.has(i) ? i : "idle";
		case "archived": return "archived";
		case "unavailable": return i === "failed" || i === "recovering" ? i : "failed";
		default: return i || n;
	}
}
//#endregion
//#region src/components/EventTimeline.svelte
var _o = o("<button type=\"button\"><span class=\"load-older-icon load-older-icon-idle\"><!></span><span class=\"load-older-icon load-older-icon-busy\"><!></span><span> </span></button>"), vo = o("<div class=\"conversation-generation\"><span> </span><strong> </strong><small> </small></div>"), yo = o("<button type=\"button\" class=\"secondary-button\">Retry</button>"), bo = o("<div class=\"conversation-gap\"><!><span><strong>History unavailable</strong><small> </small></span><!></div>"), xo = o("<div class=\"turn-summary-preview\"> </div>"), So = o("<span> </span>"), Co = o("<div data-component-owner=\"event-timeline\" class=\"agent-run-header\"><strong> </strong><!></div>"), wo = o("<div><!> <!></div>"), To = o("<div class=\"turn-loading\"><!><span>Loading turn details</span></div>"), Eo = o("<section><!> <!> <!> <!></section>"), Do = o("<!> <!>", 1), Oo = o("<div><!></div>"), ko = o("<div class=\"turn-working-indicator\" role=\"status\" aria-live=\"polite\" data-timeline-key=\"turn-working\"><!><span>working...</span></div>"), Ao = o("<div class=\"chat-timeline-empty\"><!><strong>Loading resource history</strong></div>"), jo = o("<div class=\"chat-timeline-empty\"><!><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>"), Mo = o("<!> <!> <!> <!> <!> <!> <!>", 1), No = o("<div class=\"chat-timeline-empty\"><!><strong>No resource selected</strong></div>"), Po = o("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div> <!>", 1);
function Fo(t, r) {
	e(r, !0);
	let i = T(W(r.channel.current())), a = T(W(r.channel.current().project)), o = T(W(ue())), l = T(void 0), f, p = null, g = !1, y = !1, x = !0, E = T(null), D = new sn(), A = /* @__PURE__ */ new Map(), j = T(W(/* @__PURE__ */ new Map()));
	K(() => {
		let e = ae(), t = () => {
			x = oe(ae());
		};
		e?.addEventListener("scroll", t, { passive: !0 });
		let o = typeof ResizeObserver > "u" || !e ? null : new ResizeObserver(() => {
			x && !J() && Y();
		});
		e && o && o.observe(e), f = new _i({
			onEvent: (e, t, r) => n(i).onEvent(e, t, r),
			onNotice: (e, t, r) => n(i).onNotice(e, t, r)
		});
		let s = f.subscribe(N), c = r.channel.subscribe((e) => {
			let t = n(i).identity, r = se(n(i).status) !== se(e.status) && x;
			u(i, e, !0), e.project !== n(a) && u(a, e.project, !0), e.identity !== t && (y = !0, p = null, u(E, null), u(j, new Map(A.get(e.identity) ?? []), !0)), f?.activate(e.workspaceId, e.resourceId, e.status), S().then(() => {
				r && !J() && Y(), e.onIconsChanged();
			});
		}), l = () => {
			if (!p || J()) return;
			let e = p;
			p = null, P(e);
		}, d = (e) => {
			e.key !== "Escape" || !n(E) || (e.preventDefault(), u(E, null));
		};
		return document.addEventListener("selectionchange", l), document.addEventListener("keydown", d), () => {
			s(), c(), document.removeEventListener("selectionchange", l), document.removeEventListener("keydown", d), e?.removeEventListener("scroll", t), o?.disconnect(), f?.dispose(), f = void 0, e && e.removeAttribute("data-agent-resource-id");
		};
	}), H(() => D.dispose());
	function N(e) {
		if (n(o).identity && e.identity === n(o).identity && J()) {
			p = e;
			return;
		}
		P(e);
	}
	function P(e) {
		let t = ae();
		(e.identity !== n(o).identity || y) && (x = !0), g = x, y = !1, u(o, e, !0), t && (t.dataset.agentResourceId = e.resourceId), S().then(() => {
			g && !J() && Y(), n(i).onIconsChanged(), e.loaded && e.hasMoreBefore && B(e.identity);
		});
	}
	function F(e, t) {
		let n = t;
		if (typeof IntersectionObserver > "u") return n && f?.loadTurn(n), {
			update(e) {
				n = e, n && f?.loadTurn(n);
			},
			destroy() {}
		};
		let r = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && n && f?.loadTurn(n);
		}, {
			root: ae(),
			rootMargin: "240px 0px"
		});
		return r.observe(e), {
			update(e) {
				n = e;
			},
			destroy() {
				r.disconnect();
			}
		};
	}
	function I(e) {
		return Zr(Yr(e.events ? n(a)(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || []));
	}
	function R(e) {
		return e.generation.agentName || e.generation.resolvedProfile || e.generation.binding?.name || n(i).agentName || "Agent";
	}
	async function B(e) {
		let t = 0;
		for (; t < 16 && n(o).identity === e && n(o).hasMoreBefore;) {
			let e = ae();
			if (!e || e.scrollHeight > e.clientHeight + 160 || J() || !await f?.loadOlder()) return;
			t++, await S(), Y();
		}
	}
	async function V() {
		let e = ae();
		if (!e || n(o).loadingOlder) return;
		let t = ce(e), r = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = n(o).identity;
		await f?.loadOlder(), await S(), n(o).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - r) : s + (e.scrollHeight - a), n(i).onIconsChanged());
	}
	function G(e, t) {
		let r = le(e);
		u(j, new Map(n(j)).set(r, t), !0), A.set(n(o).identity, new Map(n(j))), t && ee(e);
	}
	function ee(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return f?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function te(e) {
		return n(j).get(le(e)) ?? !1;
	}
	function ne(e) {
		u(E, {
			section: "Files",
			path: e
		}, !0);
	}
	function re() {
		return Promise.reject(/* @__PURE__ */ Error("Chat file previews are read-only."));
	}
	function ae() {
		return n(l)?.parentElement ?? null;
	}
	function J() {
		let e = ae(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function oe(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function se(e) {
		return e?.session?.state === "running" && !!e.session.currentTurnId;
	}
	function Y() {
		let e = ae();
		e && (e.scrollTop = e.scrollHeight);
	}
	function ce(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function le(e) {
		let t = e.kind === "tools" ? di(e) : String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event");
		return `${e.generationId || n(o).generationId}:${e.kind}:${t}`;
	}
	function ue() {
		return {
			identity: "",
			workspaceId: "",
			resourceId: "",
			generationId: "",
			blocks: [],
			notices: [],
			hasMoreBefore: !1,
			loading: !1,
			loadingOlder: !1,
			loaded: !1,
			error: ""
		};
	}
	var de = Po(), fe = s(de), pe = C(fe), me = (e) => {
		var t = Mo(), r = s(t), a = (e) => {
			var t = _o();
			let r;
			var i = C(t), a = C(i);
			O(a, { name: "chevrons-up" }), q(i);
			var s = d(i), l = C(s);
			O(l, { name: "loader-circle" }), q(s);
			var u = d(s), f = C(u, !0);
			q(u), q(t), c(() => {
				r = k(t, 1, "load-older-events", null, r, { busy: n(o).loadingOlder }), t.disabled = n(o).loadingOlder, L(f, n(o).loadingOlder ? "Loading..." : "Load older messages");
			}), v("click", t, V), m(e, t);
		};
		h(r, (e) => {
			n(o).hasMoreBefore && e(a);
		});
		var l = d(r, 2);
		b(l, 19, () => n(o).blocks, (e) => e.key, (e, t, r) => {
			var a = Do(), l = s(a), u = (e) => {
				var r = vo(), a = C(r), o = C(a);
				q(a);
				var s = d(a), l = C(s, !0);
				q(s);
				var u = d(s), f = C(u, !0);
				q(u), q(r), c((e, i) => {
					U(r, "data-generation-id", n(t).generation.generationId), L(o, `Generation ${n(t).generation.generation ?? ""}`), L(l, n(t).generation.agentName || n(t).generation.resolvedProfile || n(t).generation.binding?.name || "Agent"), U(u, "data-generation-status", e), L(f, i);
				}, [() => go(n(t), n(i).status), () => go(n(t), n(i).status)]), m(e, r);
			};
			h(l, (e) => {
				(n(r) === 0 || n(o).blocks[n(r) - 1].generation.generationId !== n(t).generation.generationId) && e(u);
			});
			var p = d(l, 2), g = (e) => {
				var r = bo(), i = C(r);
				O(i, { name: "triangle-alert" });
				var a = d(i), o = d(C(a)), s = C(o, !0);
				q(o), q(a);
				var l = d(a), u = (e) => {
					var t = yo();
					v("click", t, () => f?.retryHistory()), m(e, t);
				};
				h(l, (e) => {
					n(t).gap?.retryable && e(u);
				}), q(r), c(() => {
					U(r, "data-timeline-key", n(t).key), L(s, n(t).gap?.message || "This generation could not be read.");
				}), m(e, r);
			}, _ = (e) => {
				var r = Eo();
				let a;
				var s = C(r), l = (e) => {
					var r = xo(), i = C(r, !0);
					q(r), c(() => L(i, n(t).turn.triggerPreview)), m(e, r);
				};
				h(s, (e) => {
					n(t).turn?.triggerPreview && !n(t).items && !n(t).events && e(l);
				});
				var u = d(s, 2);
				b(u, 17, () => I(n(t)), (e) => le(e), (e, r) => {
					var a = wo(), s = C(a), l = (e) => {
						var i = Co(), a = C(i), o = C(a, !0);
						q(a);
						var s = d(a), l = (e) => {
							var t = So(), i = C(t, !0);
							q(t), c((e) => L(i, e), [() => Xr(n(r).time)]), m(e, t);
						}, u = w(() => Xr(n(r).time));
						h(s, (e) => {
							n(u) && e(l);
						}), q(i), c((e) => L(o, e), [() => R(n(t))]), m(e, i);
					};
					h(s, (e) => {
						n(r).agentStart && n(r).kind !== "message" && e(l);
					});
					var u = d(s, 2), f = (e) => {
						{
							let a = w(() => R(n(t)));
							Ji(e, {
								get item() {
									return n(r);
								},
								get agentName() {
									return n(a);
								},
								get workspaceId() {
									return n(i).workspaceId;
								},
								get resolveResourceTitle() {
									return n(i).resolveResourceTitle;
								},
								get onNavigate() {
									return n(i).onNavigate;
								},
								onOpenFile: ne
							});
						}
					}, p = (e) => {
						Bi(e, {
							get item() {
								return n(r);
							},
							onExpand: () => ee(n(r))
						});
					}, g = (e) => {
						{
							let i = w(() => te(n(r)));
							ta(e, {
								get item() {
									return n(r);
								},
								get generationId() {
									return n(t).generation.generationId;
								},
								get open() {
									return n(i);
								},
								onToggle: (e) => G(n(r), e)
							});
						}
					}, _ = (e) => {
						Cr(e, {
							get item() {
								return n(r);
							},
							get generationId() {
								return n(t).generation.generationId;
							},
							get contextIdentity() {
								return n(o).identity;
							},
							get onApproval() {
								return n(i).onApproval;
							},
							get onToast() {
								return n(i).onToast;
							}
						});
					}, v = (e) => {
						Ri(e, { get item() {
							return n(r);
						} });
					}, y = (e) => {
						{
							let t = w(() => n(r).text || "");
							Xi(e, {
								title: "Provider error",
								get text() {
									return n(t);
								},
								error: !0
							});
						}
					}, b = (e) => {
						ra(e, { get item() {
							return n(r);
						} });
					};
					h(u, (e) => {
						n(r).kind === "message" ? e(f) : n(r).kind === "thinking" ? e(p, 1) : n(r).kind === "tools" ? e(g, 2) : n(r).kind === "approval" ? e(_, 3) : n(r).kind === "lifecycle" ? e(v, 4) : n(r).kind === "error" ? e(y, 5) : e(b, -1);
					}), q(a), c((e) => U(a, "data-timeline-key", e), [() => le(n(r))]), m(e, a);
				});
				var f = d(u, 2), p = (e) => {
					var t = To(), n = C(t);
					O(n, { name: "loader-circle" }), M(), q(t), m(e, t);
				};
				h(f, (e) => {
					n(t).loading && !n(t).items && !n(t).events && e(p);
				});
				var g = d(f, 2), _ = (e) => {
					Xi(e, {
						title: "Turn unavailable",
						get text() {
							return n(t).error;
						},
						error: !0
					});
				};
				h(g, (e) => {
					n(t).error && e(_);
				}), q(r), ie(r, (e, t) => F?.(e, t), () => n(t).turn?.reference || ""), c(() => {
					a = k(r, 1, "conversation-turn", null, a, { "conversation-turn-loading": n(t).loading }), U(r, "data-timeline-key", n(t).key);
				}), m(e, r);
			};
			h(p, (e) => {
				n(t).kind === "gap" ? e(g) : e(_, -1);
			}), m(e, a);
		});
		var u = d(l, 2);
		b(u, 19, () => n(o).notices, (e, t) => `notice:${n(o).identity}:${t}:${String(e.data?.text || "")}`, (e, t, r) => {
			var i = Oo(), a = C(i);
			{
				let e = w(() => String(n(t).data?.text || "")), r = w(() => n(t).data?.level === "error");
				Xi(a, {
					title: "PUA",
					get text() {
						return n(e);
					},
					get error() {
						return n(r);
					}
				});
			}
			q(i), c(() => U(i, "data-timeline-key", `notice:${n(r)}`)), m(e, i);
		});
		var p = d(u, 2), g = (e) => {
			Xi(e, {
				title: "Timeline error",
				get text() {
					return n(o).error;
				},
				error: !0,
				alert: !0
			});
		};
		h(p, (e) => {
			n(o).error && e(g);
		});
		var _ = d(p, 2), y = (e) => {
			var t = ko(), n = C(t);
			O(n, { name: "loader-circle" }), M(), q(t), m(e, t);
		}, x = w(() => se(n(i).status));
		h(_, (e) => {
			n(x) && e(y);
		});
		var S = d(_, 2), T = (e) => {
			var t = Ao(), n = C(t);
			O(n, { name: "loader-circle" }), M(), q(t), m(e, t);
		};
		h(S, (e) => {
			n(o).loading && !n(o).blocks.length && e(T);
		});
		var E = d(S, 2), D = (e) => {
			var t = jo(), n = C(t);
			O(n, { name: "bot" }), M(2), q(t), m(e, t);
		}, A = w(() => n(o).loaded && !n(o).loading && !n(o).blocks.length && !n(o).notices.length && !se(n(i).status));
		h(E, (e) => {
			n(A) && e(D);
		}), m(e, t);
	}, he = (e) => {
		var t = No(), n = C(t);
		O(n, { name: "bot" }), M(), q(t), m(e, t);
	};
	h(pe, (e) => {
		n(o).resourceId ? e(me) : e(he, -1);
	}), q(fe), z(fe, (e) => u(l, e), () => n(l)), mr(d(fe, 2), {
		get client() {
			return D;
		},
		get workspaceId() {
			return n(i).workspaceId;
		},
		get resourceId() {
			return n(i).resourceId;
		},
		get selection() {
			return n(E);
		},
		editable: !1,
		get resolveResourceTitle() {
			return n(i).resolveResourceTitle;
		},
		get onNavigate() {
			return n(i).onNavigate;
		},
		onOpenFile: ne,
		onSaveMarkdown: re,
		onClose: () => u(E, null),
		get onError() {
			return n(i).onToast;
		},
		get onIconsChanged() {
			return n(i).onIconsChanged;
		}
	}), c(() => U(fe, "data-chat-context", n(o).identity)), m(t, de), _();
}
f(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function Io(e) {
	return {
		tab: e.initialTab,
		workspacePath: "",
		createWorkspace: !1,
		userName: e.userName,
		endpoint: e.agentHub.configuredEndpoint || "http://127.0.0.1:4646",
		profiles: e.profiles.map((e) => ({ ...e })),
		newProfile: {
			key: "",
			description: "",
			agentName: e.agents[0]?.id || ""
		},
		dirty: !1
	};
}
function Lo(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		newProfile: { ...e.newProfile }
	};
}
function Ro(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var zo = o("<span class=\"settings-pill\"> </span>"), Bo = o("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), Vo = o("<div class=\"settings-empty\">No AgentHub agents available.</div>"), Ho = o("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>PUA connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function Uo(t, r) {
	e(r, !0);
	let i = A(r, "draft", 15), o = A(r, "pending", 15);
	async function s() {
		if (!(!i().dirty || o())) {
			o("agenthub");
			try {
				await r.onSaveAgentHub(Lo(i())), i(i().dirty = !1, !0);
			} catch (e) {
				r.onToast(Ro(e));
			} finally {
				o("");
			}
		}
	}
	var l = Ho(), u = d(C(l), 2), f = C(u), p = d(C(f)), h = C(p, !0);
	q(p), q(f);
	var g = d(f, 2), y = d(C(g));
	N(y), q(g);
	var x = d(g, 2), S = C(x, !0);
	q(x);
	var w = d(x, 2);
	b(w, 21, () => r.agentHub.capabilities, a, (e, t) => {
		var r = zo(), i = C(r, !0);
		q(r), c(() => L(i, n(t))), m(e, r);
	}), q(w), q(u);
	var T = d(u, 2), E = C(T), D = d(C(E)), P = C(D);
	q(D), q(E);
	var F = d(E, 2);
	b(F, 21, () => r.agentHub.agents, (e) => e.name, (e, t) => {
		var r = Bo(), i = C(r), a = C(i), o = C(a, !0);
		q(a);
		var s = d(a), l = C(s), u = C(l, !0);
		q(l);
		var f = d(l), p = C(f);
		q(f), q(s), q(i), q(r), c((e) => {
			L(o, e), L(u, n(t).name), L(p, `${(n(t).providerId || "") ?? ""} · ${(n(t).available === !1 ? n(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (n(t).name || "A").slice(0, 1).toUpperCase()]), m(e, r);
	}, (e) => {
		var t = Vo();
		m(e, t);
	}), q(F), q(T);
	var I = d(T, 2), R = C(I);
	let z;
	var B = C(R, !0);
	q(R);
	var V = d(R), H = C(V);
	O(H, { name: "save" }), M(), q(V), q(I), q(l), c((e) => {
		L(h, r.agentHub.connected && r.agentHub.compatible ? "Compatible" : r.agentHub.connected ? "Incompatible" : "Unavailable"), L(S, r.agentHub.error || `API ${r.agentHub.apiVersion || "unknown"} · AgentHub ${r.agentHub.version || "unknown"}`), L(P, `${r.agentHub.agents.length ?? ""} agents · ${r.agentHub.providers.length ?? ""} providers`), z = k(R, 1, "settings-save-hint", null, z, { visible: i().dirty }), L(B, i().dirty ? "Unsaved changes" : ""), V.disabled = e;
	}, [() => !i().dirty || !!o()]), v("input", y, function(...e) {
		r.onDirty?.apply(this, e);
	}), j(y, () => i().endpoint, (e) => i(i().endpoint = e, !0)), v("click", V, s), m(t, l), _();
}
f(["input", "click"]);
//#endregion
//#region src/components/AppearanceSettingsPanel.svelte
var Wo = l("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), Go = l("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), Ko = l("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"80\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-strong\" x=\"40\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect><rect class=\"d-outline\" x=\"74\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect></svg>"), qo = l("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-light\" x=\"6\" y=\"8\" width=\"70\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"82\" y=\"8\" width=\"32\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"18\" height=\"56\" rx=\"3\"></rect></svg>"), Jo = o("<button type=\"button\" role=\"radio\"><span class=\"layout-diagram\"><!></span> <span class=\"layout-option-text\"><strong> </strong><small> </small></span></button>"), Yo = o("<div class=\"font-scale-row\"><span class=\"font-scale-label\"> </span> <input type=\"range\" min=\"80\" max=\"140\" step=\"5\"/> <span class=\"font-scale-value\"> </span></div>"), Xo = o("<div class=\"settings-panel\" data-component-owner=\"appearance-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Appearance</h2><p>Choose the workspace layout and the text size of each column. Everything applies immediately and is stored only in this browser.</p></div> <section class=\"appearance-section\" aria-label=\"Layout\"><div class=\"settings-section-heading\"><h3>Layout</h3></div> <div class=\"layout-options\" role=\"radiogroup\" aria-label=\"Workspace layout\"></div></section> <section class=\"appearance-section\" aria-label=\"Text size\"><div class=\"settings-section-heading\"><h3>Text size</h3><button type=\"button\" class=\"appearance-reset\"><!><span>Reset</span></button></div> <div class=\"font-scale-rows\"></div> <small class=\"appearance-hint\">Scales the text of each column independently from 80% to 140%.</small></section></div>");
function Zo(t, r) {
	e(r, !0);
	let i = [
		{
			id: "auto",
			label: "Auto",
			description: "Follows the window width"
		},
		{
			id: "three",
			label: "Three columns",
			description: "Sidebar, details, and chat side by side"
		},
		{
			id: "two",
			label: "Two columns",
			description: "Details and chat share one column behind tabs"
		},
		{
			id: "split",
			label: "Split",
			description: "Sidebar collapsed into a drawer"
		}
	], a = [
		{
			id: "sidebar",
			label: "Sidebar"
		},
		{
			id: "details",
			label: "Details"
		},
		{
			id: "chat",
			label: "Chat"
		}
	], o = (e) => `${Math.round(e * 100)}%`, s = w(() => a.every((e) => r.appearance.fontScales[e.id] === 1));
	var l = Xo(), u = d(C(l), 2), f = d(C(u), 2);
	b(f, 21, () => i, (e) => e.id, (e, t) => {
		var i = Jo();
		let a;
		var o = C(i), s = C(o), l = (e) => {
			var t = Wo();
			m(e, t);
		}, u = (e) => {
			var t = Go();
			m(e, t);
		}, f = (e) => {
			var t = Ko();
			m(e, t);
		}, p = (e) => {
			var t = qo();
			m(e, t);
		};
		h(s, (e) => {
			n(t).id === "auto" ? e(l) : n(t).id === "three" ? e(u, 1) : n(t).id === "two" ? e(f, 2) : e(p, -1);
		}), q(o);
		var g = d(o, 2), _ = C(g), y = C(_, !0);
		q(_);
		var b = d(_), x = C(b, !0);
		q(b), q(g), q(i), c(() => {
			a = k(i, 1, "layout-option", null, a, { active: r.appearance.layout === n(t).id }), U(i, "aria-checked", r.appearance.layout === n(t).id), L(y, n(t).label), L(x, n(t).description);
		}), v("click", i, () => r.onLayoutPreference(n(t).id)), m(e, i);
	}), q(f), q(u);
	var p = d(u, 2), g = C(p), y = d(C(g)), x = C(y);
	O(x, { name: "rotate-ccw" }), M(), q(y), q(g);
	var S = d(g, 2);
	b(S, 21, () => a, (e) => e.id, (e, t) => {
		var i = Yo(), a = C(i), s = C(a, !0);
		q(a);
		var l = d(a, 2);
		N(l);
		var u = d(l, 2), f = C(u, !0);
		q(u), q(i), c((e, r) => {
			L(s, n(t).label), F(l, e), U(l, "aria-label", `${n(t).label} text size`), L(f, r);
		}, [() => Math.round(r.appearance.fontScales[n(t).id] * 100), () => o(r.appearance.fontScales[n(t).id])]), v("input", l, (e) => r.onFontScale(n(t).id, Number(e.currentTarget.value) / 100)), m(e, i);
	}), q(S), M(2), q(p), q(l), c(() => y.disabled = n(s)), v("click", y, function(...e) {
		r.onResetFontScales?.apply(this, e);
	}), m(t, l), _();
}
f(["click", "input"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var Qo = o("<small class=\"settings-notification-help\"> </small>"), $o = o("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function es(t, n) {
	e(n, !0);
	var r = $o(), i = d(C(r), 2), a = C(i), o = d(C(a), 2);
	N(o), q(a);
	var s = d(a, 2), l = (e) => {
		var t = Qo(), r = C(t, !0);
		q(t), c(() => L(r, n.notifications.permissionError)), m(e, t);
	};
	h(s, (e) => {
		n.notifications.permissionError && e(l);
	}), q(i);
	var u = d(i, 2), f = C(u), p = d(C(f), 2);
	N(p), q(f);
	var g = d(f, 2), y = C(g, !0);
	q(g), q(u), q(r), c(() => {
		B(o, n.notifications.browser), B(p, n.notifications.sound), L(y, n.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), v("change", o, (e) => n.onBrowserNotifications(e.currentTarget.checked)), v("change", p, (e) => n.onCompletionSound(e.currentTarget.checked)), m(t, r), _();
}
f(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var ts = o("<option> </option>"), ns = o("<span class=\"settings-profile-system-label\">System</span>"), rs = o("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), is = o("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), as = o("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map PUA workflows to AgentHub agents. The default profile is reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function os(t, r) {
	e(r, !0);
	let i = A(r, "draft", 15), o = A(r, "pending", 15), s = /* @__PURE__ */ new Set(["default"]);
	function l(e, t, n) {
		i(i().profiles[e][t] = n, !0), r.onDirty();
	}
	function u() {
		let e = i().newProfile.key.trim().toLowerCase();
		if (!e) return r.onToast("Profile key is required.");
		if (s.has(e)) return r.onToast(`${e} is a reserved system profile.`);
		if (i().profiles.some((t) => t.key.trim().toLowerCase() === e)) return r.onToast(`Profile ${e} already exists.`);
		i(i().profiles = [...i().profiles, {
			key: e,
			description: i().newProfile.description.trim(),
			agentName: i().newProfile.agentName
		}], !0), i(i().newProfile = {
			key: "",
			description: "",
			agentName: r.agents[0]?.id || ""
		}, !0), r.onDirty();
	}
	function f(e) {
		let t = i().profiles[e];
		if (!t || s.has(t.key.trim().toLowerCase())) return r.onToast("System profiles cannot be deleted.");
		i(i().profiles = i().profiles.filter((t, n) => e !== n), !0), r.onDirty();
	}
	function p(e) {
		let t = r.agents.map((e) => ({
			id: e.id,
			label: e.label
		}));
		return e && !t.some((t) => t.id === e) ? [{
			id: e,
			label: `${e} (Unavailable)`
		}, ...t] : t;
	}
	async function g() {
		if (!(!i().dirty || o())) {
			o("agenthub");
			try {
				await r.onSaveAgentHub(Lo(i())), i(i().dirty = !1, !0);
			} catch (e) {
				r.onToast(Ro(e));
			} finally {
				o("");
			}
		}
	}
	var y = as(), x = d(C(y), 2), S = C(x), T = d(C(S)), E = C(T);
	q(T), q(S);
	var I = d(S, 2), R = d(C(I), 2);
	b(R, 17, () => i().profiles, a, (e, t, r) => {
		let i = w(() => s.has(n(t).key.trim().toLowerCase()));
		var o = is();
		let u;
		var g = C(o);
		N(g);
		var _ = d(g, 2);
		N(_);
		var y = d(_, 2);
		b(y, 21, () => p(n(t).agentName), a, (e, t) => {
			var r = ts(), i = C(r, !0);
			q(r);
			var a = {};
			c(() => {
				L(i, n(t).label), a !== (a = n(t).id) && (r.value = (r.__value = n(t).id) ?? "");
			}), m(e, r);
		}), q(y);
		var x;
		D(y);
		var S = d(y, 2), T = (e) => {
			var t = ns();
			m(e, t);
		}, E = (e) => {
			var t = rs(), n = C(t);
			O(n, { name: "trash-2" }), q(t), v("click", t, () => f(r)), m(e, t);
		};
		h(S, (e) => {
			n(i) ? e(T) : e(E, -1);
		}), q(o), c(() => {
			u = k(o, 1, "settings-profile-row", null, u, { "settings-profile-system": n(i) }), F(g, n(t).key), g.disabled = n(i), F(_, n(t).description), _.disabled = n(i), x !== (x = n(t).agentName) && (y.value = (y.__value = n(t).agentName) ?? "", ne(y, n(t).agentName));
		}), v("input", g, (e) => l(r, "key", e.currentTarget.value)), v("input", _, (e) => l(r, "description", e.currentTarget.value)), v("change", y, (e) => l(r, "agentName", e.currentTarget.value)), m(e, o);
	});
	var z = d(R, 2), B = C(z);
	N(B);
	var V = d(B, 2);
	N(V);
	var H = d(V, 2);
	b(H, 21, () => r.agents, a, (e, t) => {
		var r = ts(), i = C(r, !0);
		q(r);
		var a = {};
		c(() => {
			L(i, n(t).label), a !== (a = n(t).id) && (r.value = (r.__value = n(t).id) ?? "");
		}), m(e, r);
	}), q(H);
	var U = d(H, 2), W = C(U);
	O(W, { name: "plus" }), M(), q(U), q(z), q(I), q(x);
	var G = d(x, 2), K = C(G);
	let ee;
	var te = C(K, !0);
	q(K);
	var re = d(K), ie = C(re);
	O(ie, { name: "save" }), M(), q(re), q(G), q(y), c((e) => {
		L(E, `${i().profiles.length ?? ""} routes`), H.disabled = !r.agents.length, U.disabled = !r.agents.length, ee = k(K, 1, "settings-save-hint", null, ee, { visible: i().dirty }), L(te, i().dirty ? "Unsaved changes" : ""), re.disabled = e;
	}, [() => !i().dirty || !!o()]), j(B, () => i().newProfile.key, (e) => i(i().newProfile.key = e, !0)), j(V, () => i().newProfile.description, (e) => i(i().newProfile.description = e, !0)), P(H, () => i().newProfile.agentName, (e) => i(i().newProfile.agentName = e, !0)), v("click", U, u), v("click", re, g), m(t, y), _();
}
f([
	"input",
	"change",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var ss = o("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), cs = o("<button type=\"button\"><!> <span> </span> <!></button>"), ls = o("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function us(t, r) {
	e(r, !0);
	let i = [
		{
			id: "workspace",
			icon: "hard-drive",
			label: "Workspace",
			sharesAgentDraft: !1
		},
		{
			id: "user",
			icon: "user-round",
			label: "User",
			sharesAgentDraft: !1
		},
		{
			id: "appearance",
			icon: "palette",
			label: "Appearance",
			sharesAgentDraft: !1
		},
		{
			id: "agenthub",
			icon: "network",
			label: "AgentHub",
			sharesAgentDraft: !0
		},
		{
			id: "profiles",
			icon: "route",
			label: "Profiles",
			sharesAgentDraft: !0
		},
		{
			id: "notifications",
			icon: "bell",
			label: "Notifications",
			sharesAgentDraft: !1
		}
	];
	var a = ls(), o = d(C(a), 2);
	b(o, 17, () => i, (e) => e.id, (e, t) => {
		var i = cs();
		let a;
		var o = C(i);
		O(o, { get name() {
			return n(t).icon;
		} });
		var s = d(o, 2), l = C(s, !0);
		q(s);
		var u = d(s, 2), f = (e) => {
			var t = ss();
			m(e, t);
		};
		h(u, (e) => {
			n(t).sharesAgentDraft && e(f);
		}), q(i), c(() => {
			a = k(i, 1, "settings-tab", null, a, {
				active: r.activeTab === n(t).id,
				dirty: r.dirty && n(t).sharesAgentDraft
			}), U(i, "aria-current", r.activeTab === n(t).id ? "page" : void 0), L(l, n(t).label);
		}), v("click", i, () => r.onSelect(n(t).id)), m(e, i);
	}), q(a), m(t, a), _();
}
f(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var ds = o("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function fs(t, n) {
	e(n, !0);
	let r = A(n, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n.onUserNameInput(await n.onSaveUser(n.userName));
			} catch (e) {
				n.onToast(Ro(e));
			} finally {
				r("");
			}
		}
	}
	var a = ds(), o = d(C(a), 2), s = C(o), l = d(C(s), 2);
	N(l), M(2), q(s);
	var u = d(s, 2), f = C(u), p = C(f);
	O(p, { name: "save" }), M(), q(f), q(u), q(o), q(a), c(() => {
		F(l, n.userName), f.disabled = r() === "user";
	}), J("submit", o, i), v("input", l, (e) => n.onUserNameInput(e.currentTarget.value)), m(t, a), _();
}
f(["input"]);
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var ps = o("<span class=\"settings-pill\">Active</span>"), ms = o("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), hs = o("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), gs = o("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), _s = o("<div class=\"settings-empty\">No workspaces managed by PUA GUI.</div>"), vs = o("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new PUA workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run pua init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function ys(t, r) {
	e(r, !0);
	let i = A(r, "draft", 15), a = A(r, "pending", 15), o = T("");
	async function s(e) {
		if (e.preventDefault(), !(!i().workspacePath.trim() || a())) {
			a("workspace");
			try {
				await r.onAddWorkspace(Lo(i())), i(i().workspacePath = "", !0), i(i().createWorkspace = !1, !0);
			} catch (e) {
				r.onToast(Ro(e));
			} finally {
				a("");
			}
		}
	}
	async function l(e) {
		if (!a()) {
			a(`remove:${e}`);
			try {
				await r.onRemoveWorkspace(e, Lo(i()));
			} catch (e) {
				r.onToast(Ro(e));
			} finally {
				a("");
			}
		}
	}
	async function f(e, t) {
		if (!a()) {
			a(`icon:${e}`), u(o, "");
			try {
				await r.onWorkspaceIcon(e, t, Lo(i()));
			} catch (e) {
				r.onToast(Ro(e));
			} finally {
				a("");
			}
		}
	}
	function p(e) {
		let t = r.workspaces.find((t) => t.id === e);
		return r.workspaceIcons.find((e) => e.id === (t?.icon || "")) || r.workspaceIcons[0];
	}
	var g = vs(), y = d(C(g), 2), x = C(y);
	N(x);
	var S = d(x, 2), E = C(S);
	N(E), M(2), q(S);
	var D = d(S, 2), P = C(D);
	O(P, { name: "plus" });
	var F = d(P), I = C(F, !0);
	q(F), q(D), q(y);
	var R = d(y, 2);
	b(R, 21, () => r.workspaces, (e) => e.id, (e, t) => {
		let i = w(() => p(n(t).id));
		var s = gs(), g = C(s), _ = C(g), y = C(_), x = C(y);
		q(y);
		var S = d(y, 2), T = C(S), E = C(T, !0);
		q(T);
		var D = d(T), A = C(D, !0);
		q(D), q(S), q(_);
		var j = d(_, 2), M = C(j), N = (e) => {
			var t = ps();
			m(e, t);
		};
		h(M, (e) => {
			n(t).id === r.activeWorkspaceId && e(N);
		});
		var P = d(M, 2), F = C(P), I = d(F, 2), R = C(I, !0);
		q(I);
		var z = d(I, 2);
		O(z, { name: "chevron-down" }), q(P);
		var B = d(P, 2), V = C(B);
		O(V, { name: "trash-2" }), q(B), q(j), q(g);
		var H = d(g, 2), W = (e) => {
			var a = hs();
			b(a, 21, () => r.workspaceIcons, (e) => e.id, (e, r) => {
				var a = ms();
				let o;
				var s = C(a), l = d(s), u = C(l, !0);
				q(l);
				var p = d(l), g = (e) => {
					O(e, { name: "check" });
				};
				h(p, (e) => {
					n(r).id === n(i).id && e(g);
				}), q(a), c(() => {
					U(a, "aria-checked", n(r).id === n(i).id), U(a, "title", n(r).label), o = k(a, 1, "", null, o, { selected: n(r).id === n(i).id }), U(s, "src", n(r).src), L(u, n(r).label);
				}), v("click", a, () => f(n(t).id, n(r).id)), m(e, a);
			}), q(a), c(() => U(a, "aria-label", `Icon for ${n(t).name}`)), m(e, a);
		};
		h(H, (e) => {
			n(o) === n(t).id && e(W);
		}), q(s), c((e, r) => {
			U(x, "src", n(i).src), L(E, n(t).name), L(A, n(t).path), U(P, "aria-expanded", n(o) === n(t).id), P.disabled = e, U(F, "src", n(i).src), L(R, a() === `icon:${n(t).id}` ? "Saving..." : n(i).label), B.disabled = r;
		}, [() => !!a(), () => !!a()]), v("click", P, () => u(o, n(o) === n(t).id ? "" : n(t).id, !0)), v("click", B, () => l(n(t).id)), m(e, s);
	}, (e) => {
		var t = _s();
		m(e, t);
	}), q(R), q(g), c((e) => {
		D.disabled = e, L(I, i().createWorkspace ? "Create" : "Add");
	}, [() => !!a()]), J("submit", y, s), j(x, () => i().workspacePath, (e) => i(i().workspacePath = e, !0)), te(E, () => i().createWorkspace, (e) => i(i().createWorkspace = e, !0)), m(t, g), _();
}
f(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var bs = o("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function xs(t, r) {
	e(r, !0);
	let i = T(W(r.channel.current())), a = T(""), o = T(-1), c = T(W(Io(n(i)))), l = T(W(n(i).userName)), f = T("");
	K(() => r.channel.subscribe((e) => {
		let t = n(i);
		if (u(i, e, !0), e.identity !== n(a)) u(a, e.identity, !0), u(o, e.dataVersion, !0), u(c, Io(e), !0), u(l, e.userName, !0), u(f, "");
		else if (e.dataVersion !== n(o) && !n(c).dirty) {
			let r = n(c).tab, i = n(l) !== t.userName;
			u(o, e.dataVersion, !0), u(c, Io(e), !0), n(c).tab = r, i ? n(c).userName = n(l) : u(l, e.userName, !0);
		}
		queueMicrotask(e.onIconsChanged);
	})), K(() => {
		let e = (e) => {
			n(i).open && e.key === "Escape" && (e.preventDefault(), n(i).onClose(n(c).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function p() {
		n(c).dirty = !0;
	}
	var y = g(), b = s(y), x = (e) => {
		var t = bs(), r = s(t), a = d(r, 2), o = C(a);
		us(o, {
			get activeTab() {
				return n(c).tab;
			},
			get dirty() {
				return n(c).dirty;
			},
			onSelect: (e) => n(c).tab = e
		});
		var g = d(o, 2), _ = C(g), y = C(_);
		O(y, { name: "x" }), q(_);
		var b = d(_, 2), x = (e) => {
			ys(e, {
				get workspaces() {
					return n(i).workspaces;
				},
				get activeWorkspaceId() {
					return n(i).activeWorkspaceId;
				},
				get workspaceIcons() {
					return n(i).workspaceIcons;
				},
				get onAddWorkspace() {
					return n(i).onAddWorkspace;
				},
				get onRemoveWorkspace() {
					return n(i).onRemoveWorkspace;
				},
				get onWorkspaceIcon() {
					return n(i).onWorkspaceIcon;
				},
				get onToast() {
					return n(i).onToast;
				},
				get draft() {
					return n(c);
				},
				set draft(e) {
					u(c, e, !0);
				},
				get pending() {
					return n(f);
				},
				set pending(e) {
					u(f, e, !0);
				}
			});
		}, S = (e) => {
			fs(e, {
				get userName() {
					return n(l);
				},
				onUserNameInput: (e) => {
					u(l, e, !0), n(c).userName = e;
				},
				get onSaveUser() {
					return n(i).onSaveUser;
				},
				get onToast() {
					return n(i).onToast;
				},
				get pending() {
					return n(f);
				},
				set pending(e) {
					u(f, e, !0);
				}
			});
		}, w = (e) => {
			Zo(e, {
				get appearance() {
					return n(i).appearance;
				},
				get onLayoutPreference() {
					return n(i).onLayoutPreference;
				},
				get onFontScale() {
					return n(i).onFontScale;
				},
				get onResetFontScales() {
					return n(i).onResetFontScales;
				}
			});
		}, T = (e) => {
			Uo(e, {
				get agentHub() {
					return n(i).agentHub;
				},
				onDirty: p,
				get onSaveAgentHub() {
					return n(i).onSaveAgentHub;
				},
				get onToast() {
					return n(i).onToast;
				},
				get draft() {
					return n(c);
				},
				set draft(e) {
					u(c, e, !0);
				},
				get pending() {
					return n(f);
				},
				set pending(e) {
					u(f, e, !0);
				}
			});
		}, E = (e) => {
			os(e, {
				get agents() {
					return n(i).agents;
				},
				onDirty: p,
				get onSaveAgentHub() {
					return n(i).onSaveAgentHub;
				},
				get onToast() {
					return n(i).onToast;
				},
				get draft() {
					return n(c);
				},
				set draft(e) {
					u(c, e, !0);
				},
				get pending() {
					return n(f);
				},
				set pending(e) {
					u(f, e, !0);
				}
			});
		}, D = (e) => {
			es(e, {
				get notifications() {
					return n(i).notifications;
				},
				get onBrowserNotifications() {
					return n(i).onBrowserNotifications;
				},
				get onCompletionSound() {
					return n(i).onCompletionSound;
				}
			});
		};
		h(b, (e) => {
			n(c).tab === "workspace" ? e(x) : n(c).tab === "user" ? e(S, 1) : n(c).tab === "appearance" ? e(w, 2) : n(c).tab === "agenthub" ? e(T, 3) : n(c).tab === "profiles" ? e(E, 4) : e(D, -1);
		}), q(g), q(a), v("click", r, () => n(i).onClose(n(c).dirty)), v("click", _, () => n(i).onClose(n(c).dirty)), m(e, t);
	};
	h(b, (e) => {
		n(i).open && e(x);
	}), m(t, y), _();
}
f(["click"]);
//#endregion
//#region src/components/Toast.svelte
var Ss = o("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function Cs(t, r) {
	e(r, !0);
	let i = T(W(r.channel.current())), a = T(!1), o = null;
	K(() => {
		let e = r.channel.subscribe((e) => {
			u(i, e, !0), u(a, !!e.message, !0), o !== null && window.clearTimeout(o), n(a) && (o = window.setTimeout(() => {
				u(a, !1), o = null;
			}, 2800));
		});
		return () => {
			e(), o !== null && window.clearTimeout(o);
		};
	});
	var s = Ss(), l = C(s, !0);
	q(s), c(() => {
		U(s, "hidden", !n(a)), L(l, n(i).message);
	}), m(t, s), _();
}
//#endregion
//#region src/components/UploadDialog.svelte
var ws = o("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), Ts = o("<small class=\"upload-result-path\"> </small>"), Es = o("<small class=\"upload-error\"> </small>"), Ds = o("<div><div class=\"upload-item-heading\"><span class=\"upload-item-status-icon\"><span class=\"upload-item-status upload-item-status-queued\"><!></span><span class=\"upload-item-status upload-item-status-uploading\"><!></span><span class=\"upload-item-status upload-item-status-success\"><!></span><span class=\"upload-item-status upload-item-status-error\"><!></span></span><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), Os = o("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this resource's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function ks(t, r) {
	e(r, !0);
	let i = T(W(r.channel.current())), a = T(""), o = T(W([])), l = 1, f = T(void 0), p = /* @__PURE__ */ new Map(), y = w(() => n(o).some((e) => e.status === "queued" || e.status === "uploading")), x = w(() => n(o).filter((e) => e.status === "success").length), S = w(() => n(o).filter((e) => e.status === "error").length);
	K(() => {
		let e = r.channel.subscribe((e) => {
			u(i, e, !0), e.identity !== n(a) && (E(), u(a, e.identity, !0), u(o, [], !0), l = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
		}), t = (e) => {
			if (!n(i).open) return;
			let t = D(e.clipboardData);
			t.length && (e.preventDefault(), j(t));
		};
		document.addEventListener("paste", t);
		let s = (e) => {
			n(i).open && e.key === "Escape" && !n(y) && (e.preventDefault(), F());
		};
		return document.addEventListener("keydown", s), () => {
			e(), document.removeEventListener("paste", t), document.removeEventListener("keydown", s), E();
		};
	});
	function E() {
		for (let e of p.values()) e.abort();
		p.clear();
	}
	function D(e) {
		let t = Array.from(e?.items || []).filter((e) => e.kind === "file").map((e) => e.getAsFile()).filter((e) => !!e);
		return t.length ? t : Array.from(e?.files || []);
	}
	function A(e, t) {
		return `clipboard-${Date.now()}-${t + 1}.${{
			"image/png": "png",
			"image/jpeg": "jpg",
			"image/gif": "gif",
			"image/webp": "webp",
			"application/pdf": "pdf"
		}[e.type] || "bin"}`;
	}
	function j(e) {
		let t = Array.from(e || []);
		if (!n(i).open || !t.length) return;
		let r = t.map((e, t) => ({
			id: l++,
			file: e,
			name: e.name || A(e, t),
			size: e.size || 0,
			progress: 0,
			status: "queued",
			path: "",
			error: ""
		}));
		u(o, [...n(o), ...r], !0);
		for (let e of r) P(e, n(i).identity, n(i).workspaceId, n(i).resourceId);
	}
	function N(e, t) {
		u(o, n(o).map((n) => n.id === e ? {
			...n,
			...t
		} : n), !0);
	}
	function P(e, t, r, a) {
		N(e.id, { status: "uploading" });
		let o = new XMLHttpRequest();
		p.set(e.id, o), o.open("POST", `/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(a)}/uploads`), o.responseType = "json", o.upload.addEventListener("progress", (r) => {
			n(i).identity !== t || !r.lengthComputable || N(e.id, { progress: Math.min(99, Math.round(r.loaded / r.total * 100)) });
		}), o.addEventListener("load", () => {
			if (p.delete(e.id), n(i).identity !== t || n(i).workspaceId !== r || n(i).resourceId !== a) return;
			let s = o.response || {};
			o.status >= 200 && o.status < 300 ? N(e.id, {
				status: "success",
				progress: 100,
				path: s.path || "",
				name: s.name || e.name
			}) : N(e.id, {
				status: "error",
				error: s.error || `${o.status} ${o.statusText}`
			});
		}), o.addEventListener("error", () => {
			p.delete(e.id), n(i).identity === t && N(e.id, {
				status: "error",
				error: "Network error while uploading."
			});
		});
		let s = new FormData();
		s.append("file", e.file, e.name), o.send(s);
	}
	function F() {
		n(y) || n(i).onDone(n(o).filter((e) => e.status === "success" && e.path).map((e) => e.path), {
			workspaceId: n(i).workspaceId,
			resourceId: n(i).resourceId
		});
	}
	function I(e) {
		return e < 1024 ? `${e} B` : e < 1048576 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1024 / 1024).toFixed(1)} MB`;
	}
	function R(e) {
		return e.status === "queued" ? {
			icon: "clock-3",
			label: "Queued"
		} : e.status === "uploading" ? {
			icon: "loader-circle",
			label: `Uploading ${e.progress}%`
		} : e.status === "success" ? {
			icon: "circle-check",
			label: "Uploaded"
		} : {
			icon: "triangle-alert",
			label: "Failed"
		};
	}
	var B = g(), V = s(B), H = (e) => {
		var t = Os(), r = C(t), i = d(r, 2), a = C(i), s = d(C(a), 2), l = C(s);
		O(l, { name: "x" }), q(s), q(a);
		var p = d(a, 2), g = C(p);
		z(g, (e) => u(f, e), () => n(f));
		var _ = d(g, 2), T = C(_);
		O(T, { name: "clipboard-paste" });
		var E = d(T, 4), D = C(E);
		O(D, { name: "folder-open" }), M(), q(E), q(_);
		var A = d(_, 2), N = C(A), P = (e) => {
			var t = ws();
			m(e, t);
		};
		h(N, (e) => {
			n(o).length || e(P);
		});
		var B = d(N, 2);
		b(B, 17, () => n(o), (e) => e.id, (e, t) => {
			let r = w(() => R(n(t)));
			var i = Ds();
			let a;
			var o = C(i), s = C(o), l = C(s), u = C(l);
			O(u, { name: "clock-3" }), q(l);
			var f = d(l), p = C(f);
			O(p, { name: "loader-circle" }), q(f);
			var g = d(f), _ = C(g);
			O(_, { name: "circle-check" }), q(g);
			var v = d(g), y = C(v);
			O(y, { name: "triangle-alert" }), q(v), q(s);
			var b = d(s), x = C(b), S = C(x, !0);
			q(x);
			var T = d(x), E = C(T, !0);
			q(T), q(b);
			var D = d(b), A = C(D, !0);
			q(D), q(o);
			var j = d(o, 2), M = C(j);
			let N;
			q(j);
			var P = d(j, 2), F = (e) => {
				var r = Ts(), i = C(r, !0);
				q(r), c(() => L(i, n(t).path)), m(e, r);
			};
			h(P, (e) => {
				n(t).status === "success" && e(F);
			});
			var z = d(P, 2), B = (e) => {
				var r = Es(), i = C(r, !0);
				q(r), c(() => L(i, n(t).error || "Upload failed")), m(e, r);
			};
			h(z, (e) => {
				n(t).status === "error" && e(B);
			}), q(i), c((e) => {
				a = k(i, 1, "upload-item", null, a, {
					"upload-item-success": n(t).status === "success",
					"upload-item-error": n(t).status === "error",
					"upload-item-uploading": n(t).status === "uploading"
				}), L(S, n(t).name), L(E, e), L(A, n(r).label), U(j, "aria-label", n(t).name), U(j, "aria-valuenow", n(t).progress), N = ae(M, "", N, { width: `${n(t).progress}%` });
			}, [() => I(n(t).size)]), m(e, i);
		}), q(A), q(p);
		var V = d(p, 2), H = C(V), W = C(H, !0);
		q(H);
		var G = d(H, 2);
		q(V), q(i), q(t), c(() => {
			s.disabled = n(y), L(W, n(y) ? "Wait for uploads to finish before closing." : n(o).length ? `${n(x)} uploaded${n(S) ? ` · ${n(S)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), G.disabled = n(y);
		}), v("click", r, F), v("click", s, F), v("change", g, () => n(f).files && j(n(f).files)), J("dragover", _, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), J("dragleave", _, (e) => e.currentTarget.classList.remove("dragging")), J("drop", _, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && j(e.dataTransfer.files);
		}), v("keydown", _, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), n(f).click());
		}), v("click", E, () => n(f).click()), v("click", G, F), m(e, t);
	};
	h(V, (e) => {
		n(i).open && e(H);
	}), m(t, B), _();
}
f([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var As = o("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div> <div data-component-owner=\"confirm-dialog\" style=\"display: contents\"><!></div>", 1);
function js(t, n) {
	e(n, !0);
	var r = As(), i = s(r);
	We(i, {
		get channel() {
			return n.channels.appShell;
		},
		details: (e) => {
			fo(e, { get channel() {
				return n.channels.detail;
			} });
		},
		timeline: (e) => {
			Fo(e, { get channel() {
				return n.channels.timeline;
			} });
		},
		composer: (e) => {
			pt(e, { get channel() {
				return n.channels.composer;
			} });
		},
		agentHeader: (e) => {
			Ye(e, { get channel() {
				return n.channels.agentHeader;
			} });
		},
		$$slots: {
			details: !0,
			timeline: !0,
			composer: !0,
			agentHeader: !0
		}
	});
	var a = d(i, 2);
	Cs(C(a), { get channel() {
		return n.channels.toast;
	} }), q(a);
	var o = d(a, 2);
	ks(C(o), { get channel() {
		return n.channels.upload;
	} }), q(o);
	var c = d(o, 2);
	nn(C(c), { get channel() {
		return n.channels.create;
	} }), q(c);
	var l = d(c, 2);
	xs(C(l), { get channel() {
		return n.channels.settings;
	} }), q(l);
	var u = d(l, 2);
	ht(C(u), { get channel() {
		return mn;
	} }), q(u), m(t, r), _();
}
//#endregion
//#region src/components/FilePreviewFullscreen.svelte
var Ms = o("<div class=\"file-fullscreen-state\" data-component-owner=\"file-preview-fullscreen\"><div class=\"file-modal-empty error-preview\"><!><strong>File preview unavailable</strong><span>Missing workspace or file parameters in the full-screen URL.</span><a class=\"secondary-button\" href=\"/\">Back to PUA</a></div></div>");
function Ns(t, r) {
	e(r, !0);
	let i = new URLSearchParams(window.location.search), a = i.get("workspaceId") || "", o = i.get("resourceId") || "", c = i.get("section") || "Files", l = i.get("path") || "", d = i.get("mode"), f = i.get("editable"), p = f == null ? o === "workspace" ? l === "AGENTS.md" || l === "" : o !== "scheduler" : f === "1", v = I(), y = d ?? v?.mode ?? "preview";
	if (v && v.workspaceId === a && v.resourceId === o && v.section === c && v.path === l && (y === "edit" || y === "annotate")) {
		let e = `${a}:${o}:${l}:${y}`;
		typeof v.baseline == "string" && typeof v.draft == "string" ? G.set(e, {
			baseline: v.baseline,
			baselineHash: v.baselineHash || "",
			draft: v.draft,
			annotations: (v.annotations || []).map((e) => ({ ...e }))
		}) : y === "annotate" && v.annotations?.length && G.set(e, {
			baseline: "",
			baselineHash: "",
			draft: "",
			annotations: v.annotations.map((e) => ({ ...e }))
		});
	}
	V();
	let b = new sn(), x = T(W(a && l ? {
		section: c,
		path: l,
		mode: y === "edit" || y === "annotate" ? y : void 0
	} : null)), S = w(() => !a || !l || !n(x)), E = !1;
	function D() {
		let e = window.lucide;
		!e || E || (E = !0, requestAnimationFrame(() => {
			E = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
		}));
	}
	function k() {
		let e = n(x);
		return `/file?${new URLSearchParams({
			workspaceId: a,
			resourceId: o,
			section: e?.section || "Files",
			path: e?.path || "",
			mode: "preview"
		}).toString()}`;
	}
	function A(e) {
		u(x, {
			section: "Files",
			path: e
		}, !0), history.replaceState(null, "", k()), queueMicrotask(D);
	}
	function j(e) {
		let t = wn(a, e);
		t && window.location.assign(t);
	}
	async function N(e, t, n) {
		if (o === "workspace" && (e === "AGENTS.md" || e === "")) return b.request(`/api/workspaces/${encodeURIComponent(a)}/files?path=AGENTS.md`, {
			method: "PUT",
			body: JSON.stringify({
				content: t,
				expectedContentHash: n
			})
		});
		if (e.includes("/templates/")) {
			let n = e.split("/").pop()?.replace(/\.(md|markdown|mdown|mkdn)$/i, "") || "template", r = await b.request(`/api/workspaces/${encodeURIComponent(a)}/templates/validate`, {
				method: "POST",
				body: JSON.stringify({
					name: n,
					content: t
				})
			});
			if (!r.valid) throw Error(r.errors?.[0]?.message || "The task template is invalid.");
		}
		return b.request(`/api/workspaces/${encodeURIComponent(a)}/resources/${encodeURIComponent(o)}/documents?path=${encodeURIComponent(e)}`, {
			method: "PUT",
			body: JSON.stringify({
				content: t,
				expectedContentHash: n
			})
		});
	}
	var P = g(), F = s(P), L = (e) => {
		var t = Ms(), n = C(t), r = C(n);
		O(r, { name: "triangle-alert" }), M(3), q(n), q(t), m(e, t);
	}, R = (e) => {
		mr(e, {
			get client() {
				return b;
			},
			get workspaceId() {
				return a;
			},
			get resourceId() {
				return o;
			},
			get selection() {
				return n(x);
			},
			get editable() {
				return p;
			},
			fullscreen: !0,
			resolveResourceTitle: (e) => e,
			onNavigate: j,
			onOpenFile: A,
			onSaveMarkdown: N,
			onClose: () => window.close(),
			onError: (e) => console.warn("Full-screen preview:", e),
			onIconsChanged: D
		});
	};
	h(F, (e) => {
		n(S) ? e(L) : e(R, -1);
	}), m(t, P), _();
}
//#endregion
//#region src/app-channels.ts
var Z = () => void 0, Ps = async () => void 0;
function Fs() {
	return {
		appShell: un({
			identity: "",
			loading: !0,
			error: "",
			version: "v0.1.0",
			activeWorkspaceId: "",
			workspaces: [],
			projects: [],
			attentionList: [],
			doctor: {
				checking: !0,
				complete: !1,
				summary: {
					errors: 0,
					warnings: 0
				},
				workspaces: []
			},
			paneSizes: {
				sidebarWidth: 280,
				chatWidth: 420,
				sidebarAttentionHeight: 210
			},
			mobile: {
				sidebarOpen: !1,
				view: "details",
				immersive: !1
			},
			layout: {
				preference: "auto",
				effective: "three"
			},
			route: {
				path: "",
				revision: 0,
				replace: !0
			},
			onSwitchWorkspace: Ps,
			onAddWorkspace: Z,
			onCreateProject: Z,
			onOpenSettings: Z,
			onRefreshDoctor: Ps,
			onToggleProject: Ps,
			onSelectResource: Ps,
			onReorder: Ps,
			onDragState: Z,
			onToggleAttention: Ps,
			onDismissAttention: Ps,
			onPanePreview: Z,
			onPaneCommit: Z,
			onPaneViewport: Z,
			onMobileSidebar: Z,
			onMobileView: Z,
			onMobileImmersive: Z,
			onToast: Z,
			onIconsChanged: Z,
			onHistoryNavigation: Ps
		}),
		create: un({
			open: !1,
			identity: "",
			workspaceId: "",
			draft: {
				type: "project",
				projectId: "",
				templateName: "",
				templateFields: {},
				title: "",
				titleOverride: !1,
				description: "",
				detail: "",
				slug: "",
				activeTab: "edit",
				editedMarkdown: null,
				showOptions: !1
			},
			templates: [],
			preview: null,
			previewKey: "",
			previewing: !1,
			previewError: "",
			templateDigest: "",
			submitting: !1,
			onClose: Z,
			onPreview: Ps,
			onSubmit: Ps,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: async () => !0,
			onIconsChanged: Z
		}),
		settings: un({
			open: !1,
			identity: "",
			dataVersion: 0,
			initialTab: "workspace",
			workspaces: [],
			activeWorkspaceId: "",
			workspaceIcons: [{
				id: "",
				label: "PUA default",
				src: "/favicon.svg"
			}],
			workspaceIconSavingId: "",
			userName: "User",
			appearance: {
				layout: "auto",
				fontScales: {
					sidebar: 1,
					details: 1,
					chat: 1
				}
			},
			agentHub: {
				configuredEndpoint: "",
				connected: !1,
				compatible: !1,
				error: "",
				apiVersion: "",
				version: "",
				capabilities: [],
				providers: [],
				agents: []
			},
			profiles: [],
			agents: [],
			notifications: {
				browser: !1,
				sound: !1,
				permission: "default",
				permissionError: "",
				soundError: ""
			},
			onClose: Z,
			onAddWorkspace: Ps,
			onRemoveWorkspace: Ps,
			onWorkspaceIcon: Ps,
			onSaveUser: async (e) => e,
			onSaveAgentHub: Ps,
			onLayoutPreference: Z,
			onFontScale: Z,
			onResetFontScales: Z,
			onBrowserNotifications: Z,
			onCompletionSound: Z,
			onToast: Z,
			onIconsChanged: Z
		}),
		upload: un({
			open: !1,
			identity: "",
			workspaceId: "",
			resourceId: "",
			onDone: Z,
			onIconsChanged: Z
		}),
		composer: un({
			identity: "",
			workspaceId: "",
			resourceId: "",
			draft: "",
			draftKey: "",
			draftResetVersion: 0,
			unavailableReason: "Loading work status.",
			sending: !1,
			canEndTurn: !1,
			endingTurn: !1,
			canEndGeneration: !1,
			endingGeneration: !1,
			stopNotice: "",
			waitingMessages: [],
			canSteerWaiting: !1,
			steeringMessageId: "",
			agentBinding: {
				kind: "profile",
				name: "default"
			},
			agentProfiles: [],
			agents: [],
			bindingSaving: !1,
			onDraft: Z,
			onSend: async () => ({
				accepted: !1,
				clear: !1
			}),
			onOpenUpload: Z,
			onEndTurn: Z,
			onEndGeneration: Z,
			onDismissStopNotice: Z,
			onSteerWaiting: Ps,
			onSaveAgentBinding: Ps,
			onIconsChanged: Z
		}),
		detail: un({
			identity: "",
			workspaceId: "",
			workspaceName: "",
			resourceId: "",
			resourceType: "",
			resourceTitle: "",
			parent: null,
			loading: !1,
			detail: null,
			wiki: null,
			workspaceAgents: null,
			workspaceDefaults: {
				project: {
					kind: "profile",
					name: "default"
				},
				task: {
					kind: "profile",
					name: "default"
				}
			},
			agentBinding: {
				kind: "profile",
				name: "default"
			},
			agentProfiles: [],
			agents: [],
			resolveResourceTitle: () => null,
			onNavigate: Z,
			onCreateTask: Z,
			onArchive: Z,
			onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
			onSaveMarkdownFile: async (e) => ({ path: e }),
			onDeleteArtifact: Ps,
			onSaveAgentBinding: Ps,
			onSaveWorkspaceDefaults: Ps,
			onSaveTaskDefault: Ps,
			onToast: Z,
			onIconsChanged: Z
		}),
		timeline: un({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			agentName: "Agent",
			resolveResourceTitle: () => null,
			onNavigate: Z,
			project: () => [],
			onEvent: Z,
			onNotice: Z,
			onApproval: Ps,
			onToast: Z,
			onIconsChanged: Z
		}),
		agentHeader: un({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			submitting: !1,
			agentName: "Agent",
			modelSummary: "",
			turnNumber: 0,
			turnStartedAt: "",
			onIconsChanged: Z
		}),
		toast: un({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/storage-migration.ts
function Is(e, t, n) {
	if (!(!e || t === n)) try {
		let r = e.getItem(t);
		if (r === null) return;
		e.getItem(n) === null && e.setItem(n, r), e.removeItem(t);
	} catch {}
}
function Ls(e, t, n) {
	if (!(!e || t === n)) try {
		let r = [];
		for (let i = 0; i < e.length; i++) {
			let a = e.key(i);
			a && a.startsWith(t) && r.push([a, n + a.slice(t.length)]);
		}
		for (let [t, n] of r) Is(e, t, n);
	} catch {}
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var Rs = "pua.web.agentDraft.v2", zs = ["forge.web.agentDraft.v2", "forge.gui.agentDraft.v2"], Bs = 2, Vs = 50, Hs = 7776e6;
function Us(e) {
	return encodeURIComponent(String(e || "").trim());
}
function Ws(e) {
	return String(e || "").trim() || "workspace";
}
function Gs(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? Vs, r = e.maxAgeMs ?? Hs;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	for (let e of zs) Ls(i(), e, Rs);
	function a(e, t) {
		let n = String(e || "").trim(), r = Ws(t);
		return !n || !r ? "" : `${Rs}.resource.${Us(n)}.${Us(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== Bs || typeof t.text != "string" ? null : {
				version: Bs,
				text: t.text,
				updatedAt: Number(t.updatedAt) || 0,
				workspaceId: String(t.workspaceId || ""),
				resourceId: Ws(t.resourceId),
				generationId: String(t.generationId || "") || void 0
			};
		} catch {
			return null;
		}
	}
	function s(e) {
		let t = i();
		if (!t || !e) return null;
		let n = null;
		try {
			n = t.getItem(e);
		} catch {
			return null;
		}
		return o(n) || (n && l(e), null);
	}
	function c(e) {
		let t = s(e);
		return t?.text ? t.text : (t && l(e), "");
	}
	function l(e) {
		let t = i();
		if (!(!t || !e)) try {
			t.removeItem(e);
		} catch {}
	}
	function u(e, n, r) {
		if (!e) return;
		if (!n) {
			l(e);
			return;
		}
		let a = i();
		if (a) try {
			a.setItem(e, JSON.stringify({
				version: Bs,
				text: n,
				updatedAt: t(),
				workspaceId: r.workspaceId,
				resourceId: Ws(r.resourceId),
				generationId: String(r.generationId || "") || void 0
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = Ws(a);
		if (!c || !u) return;
		let f = `${Rs}.resource.${Us(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || Ws(n.resourceId) !== d || o.has(t))) {
					if (!n.text || n.updatedAt > 0 && m - n.updatedAt > r) {
						l(t);
						continue;
					}
					p.push({
						key: t,
						updatedAt: n.updatedAt
					});
				}
			}
			for (p.sort((e, t) => e.updatedAt - t.updatedAt); p.length > n;) {
				let e = p.shift();
				e && l(e.key);
			}
		} catch {}
	}
	return {
		keyForResource: a,
		read: c,
		remove: l,
		write: u,
		prune: d
	};
}
//#endregion
//#region src/controllers/agent-draft-controller.ts
function Ks(e) {
	let t = Gs(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForResource(r, Ws(n));
	}
	function i(e, t) {
		let r = /* @__PURE__ */ new Set();
		return n.chatDraftWorkspaceId === e && n.chatDraftResourceId === t && n.chatDraftKey && r.add(n.chatDraftKey), r;
	}
	function a(r = e.workspaceId(), a = n.chatDraftResourceId) {
		let o = r.trim(), s = Ws(a);
		o && t.prune(o, s, i(o, s));
	}
	function o() {
		if (!n.chatDraftKey) return;
		let e = {
			workspaceId: n.chatDraftWorkspaceId,
			resourceId: n.chatDraftResourceId
		};
		t.write(n.chatDraftKey, n.chatDraft, e), a(e.workspaceId, e.resourceId);
	}
	function s(e, t = !0) {
		let r = String(e ?? "");
		n.chatDraft !== r && (n.chatDraft = r, n.chatDraftVersion++), n.chatMultiline = r.includes("\n"), t && o();
	}
	function c() {
		n.chatDraft = "", n.chatMultiline = !1, n.chatDraftKey = "", n.chatDraftWorkspaceId = "", n.chatDraftResourceId = "", n.chatDraftVersion++;
	}
	function l(i, o = e.workspaceId(), s = "") {
		let l = Ws(i), u = r(l, o);
		if (!u) return c();
		n.chatDraftKey !== u && (n.chatDraftKey = u, n.chatDraftWorkspaceId = o.trim(), n.chatDraftResourceId = l, n.chatDraft = t.read(u), n.chatMultiline = n.chatDraft.includes("\n"), n.chatDraftVersion++, a(n.chatDraftWorkspaceId, n.chatDraftResourceId));
	}
	function u(r) {
		return e.workspaceId() !== r.workspaceId || n.chatDraftResourceId !== Ws(r.resourceId) || n.chatDraftKey !== r.key || n.chatDraft !== r.text || n.chatDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
	}
	return {
		clearResourceAfterAccepted: u,
		clearMemory: c,
		flush: o,
		restoreResource: l,
		update: s
	};
}
//#endregion
//#region src/controllers/agent-operation-controller.ts
function qs(e) {
	let t = 0, n = /* @__PURE__ */ new Map(), r = /* @__PURE__ */ new Set();
	function i(r, i = "") {
		if (n.has(r)) return null;
		let a = {
			kind: r,
			key: i,
			generation: ++t
		};
		return n.set(r, a), e(), a;
	}
	function a(t) {
		return !t || n.get(t.kind)?.generation !== t.generation ? !1 : (n.delete(t.kind), e(), !0);
	}
	function o(t) {
		return !t || r.has(t) ? !1 : (r.add(t), e(), !0);
	}
	function s(t) {
		r.delete(t) && e();
	}
	function c() {
		!n.size && !r.size || (n.clear(), r.clear(), t++, e());
	}
	return {
		begin: i,
		finish: a,
		reset: c,
		active: (e) => n.has(e),
		key: (e) => n.get(e)?.key || "",
		startSending: o,
		stopSending: s,
		isSending: (e) => r.has(e)
	};
}
//#endregion
//#region src/runtime/errors.ts
function Js(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function Ys(e) {
	let t = String(e?.id || "").trim();
	if (!t) throw Error("The created resource did not return an id.");
	return t;
}
function Xs(e) {
	return {
		open: !1,
		identity: e,
		type: "project",
		projectId: "",
		templateName: "",
		templateFields: {},
		templateDirty: !1,
		titleOverride: !1,
		templateDigest: "",
		preview: null,
		previewing: !1,
		previewError: "",
		previewKey: "",
		activeTab: "edit",
		editedMarkdown: null,
		showOptions: !1,
		title: "",
		description: "",
		detail: "",
		slug: "",
		submitting: !1
	};
}
function Zs(e) {
	return {
		project: e.projectId,
		title: e.templateName ? e.titleOverride ? e.title : "" : e.title,
		...e.templateName ? {
			templateName: e.templateName,
			templateFields: e.templateFields,
			...e.templateDigest ? { expectedTemplateDigest: e.templateDigest } : {}
		} : { detail: e.detail },
		slug: e.slug
	};
}
function Qs(e) {
	let t = 0, n = Xs(t), r = 0, i = null, a = "";
	function o(e = n) {
		return {
			type: e.type === "task" ? "task" : "project",
			projectId: e.projectId,
			templateName: e.templateName,
			templateFields: { ...e.templateFields },
			title: e.title,
			titleOverride: e.titleOverride,
			description: e.description,
			detail: e.detail,
			slug: e.slug,
			activeTab: e.activeTab,
			editedMarkdown: e.editedMarkdown,
			showOptions: e.showOptions
		};
	}
	function s(e) {
		return {
			...e,
			templateFields: { ...e.templateFields }
		};
	}
	function c() {
		r++, i?.abort(), i = null, a = "";
	}
	function l(e) {
		!e || !n.open || (e.templateName !== n.templateName && (n.preview = null, n.templateDigest = "", n.previewError = "", n.previewKey = "", n.previewing = !1, c()), Object.assign(n, s(e)));
	}
	function u() {
		let t = n;
		e.publish({
			open: t.open,
			identity: `${t.identity}:${t.type}:${t.projectId}`,
			workspaceId: e.workspaceId(),
			draft: o(),
			templates: t.type === "task" ? e.templates(t.projectId) : [],
			preview: t.preview,
			previewKey: t.previewKey,
			previewing: t.previewing,
			previewError: t.previewError,
			templateDigest: t.templateDigest,
			submitting: t.submitting,
			onClose: f,
			onPreview: p,
			onSubmit: m,
			previewRequestKey: (e) => JSON.stringify(Zs({
				...t,
				...s(e),
				templateDigest: ""
			})),
			onConfirmTemplateSwitch: e.confirmTemplateSwitch,
			onIconsChanged: e.onIconsChanged
		});
	}
	function d(r, i = "") {
		c(), n = {
			...Xs(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = Xs(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = Zs({
			...n,
			templateDigest: ""
		}), s = JSON.stringify(o);
		if (n.previewing) {
			if (s === a) return;
			c(), n.previewing = !1;
		}
		let d = e.templates(n.projectId).find((e) => e.name === n.templateName);
		if (d && !d.taskTitle && (!n.titleOverride || !n.title.trim())) {
			n.previewError = "This template does not generate a title. Enter a task title to render the preview.", u();
			return;
		}
		n.previewing = !0, n.previewError = "";
		let f = e.workspaceId(), p = n.identity, m = ++r;
		i?.abort();
		let h = new AbortController();
		i = h, a = s, u();
		try {
			let t = await e.request(`/api/workspaces/${f}/tasks/preview`, {
				method: "POST",
				body: JSON.stringify(o),
				signal: h.signal
			});
			if (m !== r || p !== n.identity || f !== e.workspaceId()) return;
			n.preview = t, n.templateDigest = t.template?.digest || "", n.previewKey = s;
		} catch (e) {
			if (h.signal.aborted || m !== r || p !== n.identity) return;
			n.previewError = Js(e);
		} finally {
			m === r && p === n.identity && (n.previewing = !1, i === h && (i = null), a === s && (a = ""), u());
		}
	}
	async function m(r) {
		if (!n.open || n.submitting) return;
		l(r);
		let i = e.workspaceId(), a = n.identity;
		n.submitting = !0, u();
		try {
			let r = "";
			if (n.type === "project") r = Ys(await e.request(`/api/workspaces/${i}/projects`, {
				method: "POST",
				body: JSON.stringify({
					description: n.description,
					slug: n.slug
				})
			})), e.toast("Project created.");
			else {
				let t, a = n.templateName && n.editedMarkdown != null && n.editedMarkdown !== n.preview?.markdown ? n.editedMarkdown : null;
				if (a != null) {
					let e = String(n.titleOverride ? n.title : n.preview?.title || "").trim();
					if (!e) throw Error("Task title is required when creating from edited preview content.");
					t = {
						project: n.projectId,
						title: e,
						taskMarkdown: a,
						slug: n.slug
					};
				} else {
					if (n.templateName && !n.templateDigest && (await p(o()), !n.templateDigest)) throw Error(n.previewError || "Could not render the selected template.");
					t = Zs(n);
				}
				r = Ys(await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				})), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1;
			let s = ++t;
			n.identity = s, await e.reloadTree(), i === e.workspaceId() && n.identity === s && await e.selectResource(r);
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(Js(t)));
		}
	}
	return {
		open: d,
		close: f,
		render: u,
		dispose: c
	};
}
//#endregion
//#region src/controllers/doctor-projection.ts
function $s(e, t) {
	let n = e.workspaces.find((e) => e.id === t);
	return {
		...e,
		complete: n?.report.complete ?? (e.complete && e.workspaces.length === 0),
		summary: n?.report.summary ?? {
			errors: 0,
			warnings: 0
		},
		workspaces: n ? [n] : []
	};
}
//#endregion
//#region src/controllers/notification-delivery.ts
function ec() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function tc(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.generationId}`;
}
function nc(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function rc(e) {
	let t = null, n = "", r = "";
	function i() {
		if (!e.settings().sound) return;
		let r = window.AudioContext || window.webkitAudioContext;
		if (typeof r != "function") {
			n = "Audio is unavailable in this browser.", e.settingsChanged();
			return;
		}
		try {
			let i = t || new r();
			t = i;
			let a = () => {
				let e = i.createOscillator(), t = i.createGain();
				e.type = "sine", e.frequency.setValueAtTime(880, i.currentTime), e.frequency.exponentialRampToValueAtTime(660, i.currentTime + .12), t.gain.setValueAtTime(1e-4, i.currentTime), t.gain.exponentialRampToValueAtTime(.08, i.currentTime + .01), t.gain.exponentialRampToValueAtTime(1e-4, i.currentTime + .16), e.connect(t), t.connect(i.destination), e.start(), e.stop(i.currentTime + .18);
			};
			i.state === "suspended" ? i.resume().then(a).catch((t) => {
				n = "Chrome blocked completion sound until audio is enabled by the page.", console.warn("completion sound unavailable", t), e.settingsChanged();
			}) : a();
		} catch (t) {
			n = "Completion sound is unavailable right now.", console.warn("completion sound unavailable", t), e.settingsChanged();
		}
	}
	function a(t) {
		if (!(!e.settings().browser || ec() !== "granted")) try {
			let n = new window.Notification(tc(t), {
				body: nc(t),
				tag: `pua-${t.marker}`,
				icon: "/favicon.svg"
			});
			n.onclick = () => {
				try {
					window.focus();
				} catch {}
				e.navigate(t).catch((e) => console.warn("notification navigation failed", e));
			};
		} catch (e) {
			console.warn("browser notification unavailable", e);
		}
	}
	function o(t) {
		let n = e.settings();
		n.browser && ec() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = ec();
		if (n === "unsupported") return e.updateSettings({
			...t,
			browser: !1
		}), r = "Browser notifications are not supported here.", e.settingsChanged(), n;
		if (n === "denied") return e.updateSettings({
			...t,
			browser: !1
		}), r = "Chrome denied permission. Restore it in Chrome site settings; PUA will not ask again automatically.", e.settingsChanged(), n;
		let i = n;
		if (n === "default") try {
			i = await window.Notification.requestPermission();
		} catch (e) {
			r = "Chrome could not request notification permission.", console.warn("notification permission request failed", e);
		}
		return e.updateSettings({
			...t,
			browser: i === "granted"
		}), r = i === "granted" ? "" : i === "denied" ? "Chrome denied permission. Restore it in Chrome site settings; PUA will not ask again automatically." : "Notification permission is still pending.", e.settingsChanged(), i;
	}
	function c(t) {
		let n = e.settings();
		if (!t) {
			e.updateSettings({
				...n,
				browser: !1
			}), r = "", e.settingsChanged();
			return;
		}
		s().catch((t) => {
			e.updateSettings({
				...e.settings(),
				browser: !1
			}), r = "Chrome could not request notification permission.", console.warn("notification permission request failed", t), e.settingsChanged();
		});
	}
	async function l() {
		let r = window.AudioContext || window.webkitAudioContext;
		if (typeof r != "function") return n = "Audio is unavailable in this browser.", e.settingsChanged(), !1;
		try {
			return t ||= new r(), await t.resume?.(), n = "", e.settingsChanged(), !0;
		} catch (t) {
			return n = "Chrome may block sound until the page receives an audio gesture.", console.warn("completion audio initialization failed", t), e.settingsChanged(), !1;
		}
	}
	function u(t) {
		e.updateSettings({
			...e.settings(),
			sound: t
		}), n = "", e.settingsChanged(), t && l();
	}
	function d() {
		return {
			...e.settings(),
			permission: ec(),
			permissionError: r,
			soundError: n
		};
	}
	function f() {
		try {
			t?.close();
		} catch {}
		t = null;
	}
	return {
		deliver: o,
		dispose: f,
		preferences: d,
		setBrowserEnabled: c,
		setSoundEnabled: u
	};
}
//#endregion
//#region src/controllers/notification-store.ts
var ic = "pua.web.notifications.v1", ac = ["forge.web.notifications.v1", "forge.gui.notifications.v1"], oc = `${ic}.settings`;
function sc(e) {
	return e && typeof e == "object" ? e : null;
}
function cc(e) {
	let t = sc(e);
	if (!t) return null;
	let n = String(t.marker || "").trim(), r = String(t.generationId || "").trim();
	return !n || !r ? null : {
		workspaceId: String(t.workspaceId || "").trim(),
		generationId: r,
		resourceId: String(t.resourceId || "").trim(),
		marker: n,
		completionState: String(t.completionState || "completed").trim(),
		title: String(t.title || "").trim(),
		resourceType: String(t.resourceType || "").trim(),
		resourceTitle: String(t.resourceTitle || "").trim(),
		at: Number(t.at) || Date.now()
	};
}
function lc() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function uc(e) {
	let t = sc(e);
	if (!t || t.version !== 1) return lc();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = sc(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(cc).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(cc).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = sc(e);
		return {
			key: String(t?.key || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.key) : [];
	return {
		version: 1,
		seen: n.slice(-2e3),
		pending: r.slice(-200),
		unread: i.slice(-200),
		effects: a.slice(-2e3)
	};
}
function dc(e) {
	let t = e.trim();
	return t ? `${ic}.state.${encodeURIComponent(t)}` : "";
}
function fc(e) {
	for (let t of ac) Ls(e, t, ic);
	function t(t) {
		let n = dc(t);
		if (!e || !n) return lc();
		try {
			let t = e.getItem(n);
			if (!t) return lc();
			let r = uc(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return lc();
		}
	}
	function n(t, n) {
		let r = uc(n), i = dc(t);
		if (e && i) try {
			e.setItem(i, JSON.stringify(r));
		} catch {}
		return r;
	}
	function r() {
		if (!e) return {
			browser: !1,
			sound: !1
		};
		try {
			let t = sc(JSON.parse(e.getItem(oc) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(oc);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(oc, JSON.stringify({
				version: 1,
				...t
			}));
		} catch {}
	}
	return {
		readStore: t,
		writeStore: n,
		readSettings: r,
		writeSettings: i
	};
}
//#endregion
//#region src/controllers/notification-projection.ts
function pc(e) {
	let t = String(e.completionMarker || "").trim();
	if (t) return t;
	let n = String(e.generationId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function mc(e) {
	return String(e.generationId || e.id || "").trim();
}
function hc(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function gc(e, t) {
	let n = String(e.resourceId || "").trim(), r = t.findResource(n), i = mc(e);
	return !n || !i ? null : cc({
		workspaceId: t.workspaceId,
		generationId: i,
		resourceId: n,
		marker: t.marker,
		completionState: t.completionState || e.completionState || "completed",
		title: r?.title || e.title || i,
		resourceType: r?.type || "",
		resourceTitle: r?.title || "",
		at: t.now?.() ?? Date.now()
	});
}
//#endregion
//#region src/controllers/notification-controller.ts
function _c(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function vc(e) {
	let t = fc(_c(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= lc(), n.store;
	}
	function i() {
		return n.settings ||= t.readSettings(), n.settings;
	}
	function a(e) {
		n.settings = e;
	}
	function o() {
		!n.workspaceId || !n.store || (n.store = t.writeStore(n.workspaceId, n.store));
	}
	function s() {
		t.writeSettings(i()), e.notificationsSettingsVisible() && e.renderSettings();
	}
	function c() {
		let e = document.visibilityState ? document.visibilityState === "visible" : !document.hidden, t = typeof document.hasFocus != "function" || document.hasFocus();
		return e && !document.hidden && t;
	}
	function l(t) {
		return !!(t.resourceId && e.selectedResourceId() === t.resourceId && c());
	}
	function u(e) {
		try {
			n.channel?.postMessage({
				...e,
				workspaceId: n.workspaceId,
				sourceTabId: n.tabId
			});
		} catch {}
	}
	function d(e, t) {
		return `${e.marker}:${t}`;
	}
	function f() {
		let e = t.readStore(n.workspaceId), i = r();
		i.effects = [...new Map([...e.effects, ...i.effects].map((e) => [e.key, e])).values()].slice(-2e3);
	}
	function p(e, t) {
		let n = d(e, t), i = r();
		return !i.effects.some((e) => e.key === n) && (i.effects.push({
			key: n,
			at: Date.now()
		}), o(), u({
			type: "effect",
			effectKey: n,
			at: Date.now()
		}), !0);
	}
	function m(e, t, r) {
		let i = () => {
			f(), p(e, t) && r();
		}, a = typeof navigator < "u" ? navigator.locks : null;
		if (!a || typeof a.request != "function") return i();
		try {
			a.request(`pua.web.notification.${n.workspaceId}.${d(e, t)}`, { ifAvailable: !0 }, (e) => {
				e && i();
			}).catch((e) => {
				console.warn("notification effect lock unavailable", e), i();
			});
		} catch (e) {
			console.warn("notification effect lock unavailable", e), i();
		}
	}
	async function h(t) {
		if (t.resourceId) try {
			await e.selectResource(t.resourceId, {
				clearUnread: !1,
				forceDetail: !0
			});
		} finally {
			T(t.marker);
		}
	}
	let g = rc({
		settings: i,
		updateSettings: a,
		settingsChanged: s,
		claim: m,
		navigate: h
	});
	function _() {
		try {
			n.channel?.close();
		} catch {}
		n.channel = null;
	}
	function v(e) {
		let t = window.BroadcastChannel || globalThis.BroadcastChannel;
		if (typeof t == "function") try {
			let r = new t(`${ic}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), ec() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
	}
	function b(t) {
		if (!t || t.workspaceId !== n.workspaceId || t.sourceTabId === n.tabId) return;
		let i = r();
		if (t.type === "effect" && t.effectKey) {
			i.effects.some((e) => e.key === t.effectKey) || (i.effects.push({
				key: t.effectKey,
				at: Number(t.at) || Date.now()
			}), o());
			return;
		}
		if (t.type === "record" && t.record) {
			let n = cc(t.record);
			if (!n) return;
			i.seen.some((e) => e.marker === n.marker) || i.seen.push({
				marker: n.marker,
				at: n.at
			}), l(n) ? (i.unread = i.unread.filter((e) => e.marker !== n.marker), i.pending = i.pending.filter((e) => e.marker !== n.marker), o(), u({
				type: "clear-resource",
				resourceId: n.resourceId
			})) : (i.unread.some((e) => e.marker === n.marker) || i.unread.push(n), o(), e.hasTree() && e.refreshIcons());
			return;
		}
		if (t.type === "clear-marker" && t.marker) i.unread = i.unread.filter((e) => e.marker !== t.marker), i.pending = i.pending.filter((e) => e.marker !== t.marker);
		else if (t.type === "clear-resource" && t.resourceId) i.unread = i.unread.filter((e) => e.resourceId !== t.resourceId), i.pending = i.pending.filter((e) => e.resourceId !== t.resourceId);
		else return;
		o(), e.hasTree() && e.refreshIcons();
	}
	function x(t, i = "") {
		let a = pc(t);
		if (!a || !n.workspaceId) return !1;
		let s = gc(t, {
			workspaceId: n.workspaceId,
			marker: a,
			completionState: i,
			findResource: e.findResource
		});
		if (!s) return !1;
		let c = r(), d = c.seen.some((e) => e.marker === a), f = c.pending.findIndex((e) => e.marker === a);
		return n.ready ? d && f < 0 ? !1 : (d || c.seen.push({
			marker: a,
			at: Date.now()
		}), c.pending = c.pending.filter((e) => e.marker !== a), l(s) ? (o(), !1) : (c.unread = c.unread.filter((e) => e.marker !== a), c.unread.push(s), o(), u({
			type: "record",
			record: s
		}), g.deliver(s), e.hasTree() && e.refreshIcons(), !0)) : (d || c.seen.push({
			marker: a,
			at: Date.now()
		}), c.pending = c.pending.filter((e) => e.marker !== a), o(), !1);
	}
	function S(e) {
		for (let t of e) pc(t) && x(t, t.completionState || "");
	}
	function C(e, t) {
		let n = hc(e);
		!n || !Number(e.id) || x({
			...t,
			completionMarker: `${t.generationId || e.sessionId || "generation"}:${e.id}`,
			completionState: n
		}, n);
	}
	function w() {
		n.ready || (S(e.resourceProjections()), n.ready = !0, o());
	}
	function T(t) {
		let n = t.trim();
		if (!n) return;
		let i = r();
		(i.unread.some((e) => e.marker === n) || i.pending.some((e) => e.marker === n)) && (i.unread = i.unread.filter((e) => e.marker !== n), i.pending = i.pending.filter((e) => e.marker !== n), o(), u({
			type: "clear-marker",
			marker: n
		}), e.hasTree() && e.refreshIcons());
	}
	function E(t) {
		let n = t.trim();
		if (!n) return;
		let i = r();
		(i.unread.some((e) => e.resourceId === n) || i.pending.some((e) => e.resourceId === n)) && (i.unread = i.unread.filter((e) => e.resourceId !== n), i.pending = i.pending.filter((e) => e.resourceId !== n), o(), u({
			type: "clear-resource",
			resourceId: n
		}), e.hasTree() && e.refreshIcons());
	}
	function D() {
		e.scope.listen(window, "storage", (r) => {
			r.key === dc(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.refreshIcons()), r.key === oc && (n.settings = t.readSettings(), ec() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
		}), e.scope.listen(document, "visibilitychange", () => {
			e.flushDraft(), c() && E(e.selectedResourceId());
		}), e.scope.listen(window, "focus", () => E(e.selectedResourceId()));
	}
	function O() {
		return i(), g.preferences();
	}
	function k() {
		_(), g.dispose();
	}
	return {
		initialize: y,
		install: D,
		dispose: k,
		establishBaseline: w,
		observeProjections: S,
		observeEvent: C,
		clearResource: E,
		preferences: O,
		setBrowserEnabled: g.setBrowserEnabled,
		setSoundEnabled: g.setSoundEnabled
	};
}
//#endregion
//#region src/controllers/pane-layout-controller.ts
var yc = "pua.web.paneSizes", bc = "pua.web.mobileImmersive", xc = "pua.web.layoutPreference", Sc = "pua.web.fontScales", Cc = [
	["forge.gui.paneSizes", yc],
	["forge.gui.mobileImmersive", bc],
	["forge.gui.layoutPreference", xc],
	["forge.gui.fontScales", Sc],
	["forge.web.paneSizes", yc],
	["forge.web.mobileImmersive", bc],
	["forge.web.layoutPreference", xc],
	["forge.web.fontScales", Sc]
], wc = 8, Tc = 220, Ec = 360, Dc = 320, Oc = 1e4, kc = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarAttentionHeight: 210
}), Ac = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarAttentionHeight: "--sidebar-attention-height"
});
function jc(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function Mc(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var Nc = [
	"auto",
	"three",
	"two",
	"split"
];
function Pc(e) {
	return Nc.includes(e) ? e : "auto";
}
var Fc = .8, Ic = 1.4, Lc = 1, Rc = [
	"sidebar",
	"details",
	"chat"
], zc = Object.freeze({
	sidebar: "--sidebar-font-scale",
	details: "--details-font-scale",
	chat: "--chat-font-scale"
});
function Bc(e) {
	return Mc(e) ? Math.round(jc(e, Fc, Ic) * 100) / 100 : Lc;
}
function Vc(e) {
	let t = e && typeof e == "object" ? e : {};
	return {
		sidebar: Bc(t.sidebar),
		details: Bc(t.details),
		chat: Bc(t.chat)
	};
}
function Hc(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...kc };
	if (Mc(n.sidebarWidth) && (r.sidebarWidth = jc(n.sidebarWidth, Tc, Oc)), Mc(n.chatWidth)) r.chatWidth = jc(n.chatWidth, Dc, Oc);
	else if (Mc(n.detailsWidth) && t >= 688) {
		let e = jc(n.detailsWidth, Ec, t - wc - Dc);
		r.chatWidth = jc(t - wc - e, Dc, Oc);
	}
	let i = Mc(n.sidebarAttentionHeight) ? n.sidebarAttentionHeight : n.sidebarSessionHeight;
	return Mc(i) && (r.sidebarAttentionHeight = jc(i, 84, Oc)), r;
}
function Uc(e, t = window.localStorage) {
	let n = { ...kc }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = Vc(null), o = window.matchMedia("(max-width: 980px)"), s = window.matchMedia("(max-width: 1440px)");
	function c() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(yc) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function l() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Sc) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function u(e) {
		document.documentElement.style.setProperty(zc[e], String(a[e]));
	}
	function d() {
		for (let e of Rc) u(e);
	}
	function f() {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}
	function p(e, t) {
		document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
	}
	function m(e, t) {
		if (!Object.hasOwn(Ac, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(jc(t, r === "sidebarWidth" ? Tc : r === "chatWidth" ? Dc : 84, Oc));
		n[r] = i, p(Ac[r], i);
	}
	function h() {
		for (let e of Object.keys(Ac)) m(e, n[e]);
	}
	function g() {
		t?.setItem(yc, JSON.stringify(n));
	}
	function _() {
		for (let [e, n] of Cc) Is(t, e, n);
		let u = c();
		n = Hc(u, 0), h();
		let p = Mc(u.sidebarSessionHeight) && !Mc(u.sidebarAttentionHeight);
		Mc(u.detailsWidth) && !Mc(u.chatWidth) && !o.matches && (n = Hc(u, f()), h(), p = !0), p && g();
		try {
			r.immersive = t?.getItem(bc) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = Pc(t?.getItem(xc));
		} catch {
			i = "auto";
		}
		x(), a = Vc(l()), d();
		let m = () => {
			x(), e();
		};
		o.addEventListener?.("change", m), s.addEventListener?.("change", m);
	}
	function v(e) {
		if (!Object.hasOwn(Ac, e) || !t) return;
		let r = e, i = c();
		delete i.detailsWidth, delete i.sidebarSessionHeight;
		for (let e of Object.keys(Ac)) Mc(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(yc, JSON.stringify(i));
	}
	function y() {
		if (o.matches) return;
		let e = c();
		!Mc(e.detailsWidth) || Mc(e.chatWidth) || (n = Hc(e, f()), h(), g());
	}
	function b() {
		return o.matches ? "single" : i === "auto" ? s.matches ? "two" : "three" : i;
	}
	function x() {
		document.body.dataset.layout = b();
	}
	function S(n) {
		i = Pc(n);
		try {
			t?.setItem(xc, i);
		} catch {}
		x(), e();
	}
	function C(n, r) {
		if (Object.hasOwn(zc, n)) {
			a[n] = Bc(r), u(n);
			try {
				t?.setItem(Sc, JSON.stringify(a));
			} catch {}
			e();
		}
	}
	function w() {
		a = Vc(null), d();
		try {
			t?.removeItem(Sc);
		} catch {}
		e();
	}
	function T(t) {
		r.sidebarOpen = !!t, document.body.classList.toggle("mobile-sidebar-open", r.sidebarOpen), e();
	}
	function E(t) {
		r.view = t === "chat" ? "chat" : "details", document.body.classList.toggle("mobile-chat-active", r.view === "chat"), e();
	}
	function D(n) {
		r.immersive = !!n, document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			t?.setItem(bc, r.immersive ? "1" : "0");
		} catch {}
		e();
	}
	return {
		initialize: _,
		previewPane: m,
		commitPane: v,
		syncViewport: y,
		setLayoutPreference: S,
		setFontScale: C,
		resetFontScales: w,
		setMobileSidebar: T,
		setMobileView: E,
		setMobileImmersive: D,
		snapshot: () => ({
			paneSizes: { ...n },
			mobile: { ...r },
			layout: {
				preference: i,
				effective: b()
			},
			fontScales: { ...a }
		})
	};
}
//#endregion
//#region src/controllers/resource-detail-controller.ts
function Wc(e) {
	function t(t) {
		t && delete e.details[t];
	}
	function n(t) {
		return { detail: e.details[t] || null };
	}
	function r(t) {
		return t?.id ? (e.details[t.id] = t, t) : null;
	}
	function i(t, n = e.context().workspaceId) {
		return e.request(`/api/workspaces/${n}/resources/${encodeURIComponent(t)}`);
	}
	async function a(n, a = {}) {
		if (!n || n === "workspace" || e.details[n] && !a.force) return;
		a.force && t(n);
		let o = e.context(), s = e.nextDetailRequestVersion(), c = await i(n, o.workspaceId), l = e.context();
		return !e.isCurrentWorkspace(o.workspaceId, o.navigationVersion) || l.selectedId !== n || s !== l.detailRequestVersion ? null : r(c);
	}
	return {
		reset: t,
		snapshot: n,
		apply: r,
		fetch: i,
		load: a
	};
}
//#endregion
//#region src/controllers/settings-controller.ts
function Gc(e, t) {
	let n = t?.catalog || {}, r = (n.agents || []).map((e) => ({
		...e,
		id: e.name
	}));
	return {
		...e,
		agents: r,
		agentHubProviders: n.providers || [],
		agentProfiles: t.config?.agentProfiles || []
	};
}
function Kc(e) {
	let t = 0, n = {
		open: !1,
		identity: 0,
		dataVersion: 0,
		tab: "workspace",
		data: null,
		agentDirty: !1,
		workspacePath: "",
		createWorkspace: !1,
		workspaceIconSavingId: ""
	};
	function r() {
		let t = e.config(), i = n.data || {
			workspaces: t.workspaces,
			activeId: e.activeWorkspaceId(),
			agents: t.agents,
			agentProfiles: t.agentProfiles
		}, o = i.agentHub || {}, c = o.status || {}, l = o.catalog || {};
		e.publish({
			open: n.open,
			identity: `${n.identity}`,
			dataVersion: n.dataVersion,
			initialTab: n.tab,
			workspaces: i.workspaces || [],
			activeWorkspaceId: e.activeWorkspaceId(),
			workspaceIcons: e.workspaceIcons,
			workspaceIconSavingId: n.workspaceIconSavingId,
			userName: e.userName(),
			appearance: e.appearance(),
			agentHub: {
				configuredEndpoint: o.configuredEndpoint || "http://127.0.0.1:4646",
				connected: !!o.connected,
				compatible: !!o.compatible,
				error: o.error || "",
				apiVersion: c.apiVersion || "",
				version: c.version || "",
				capabilities: c.capabilities || [],
				providers: l.providers || [],
				agents: l.agents || []
			},
			profiles: (i.agentProfiles || []).map((e) => ({ ...e })),
			agents: e.agentOptions(),
			notifications: e.notificationPreferences(),
			onClose: a,
			onAddWorkspace: async (e) => {
				s(e), await u();
			},
			onRemoveWorkspace: async (e, t) => {
				s(t), await d(e);
			},
			onWorkspaceIcon: async (e, t, n) => {
				s(n), await f(e, t);
			},
			onSaveUser: async (t) => {
				let n = e.saveUser(t);
				return e.toast(n === "User" ? "User name reset to User." : `User name saved as ${n}.`), n;
			},
			onLayoutPreference: (t) => {
				e.setLayoutPreference(t), r();
			},
			onFontScale: (t, n) => {
				e.setFontScale(t, n), r();
			},
			onResetFontScales: () => {
				e.resetFontScales(), r();
			},
			onSaveAgentHub: async (e) => {
				s(e), await p();
			},
			onBrowserNotifications: e.setBrowserNotifications,
			onCompletionSound: e.setCompletionSound,
			onToast: e.toast,
			onIconsChanged: e.onIconsChanged
		});
	}
	async function i(e = "workspace") {
		n.open = !0, n.identity = ++t, n.tab = e, n.agentDirty = !1, n.workspaceIconSavingId = "", r(), await o(), r();
	}
	async function a(e = n.agentDirty) {
		n.open && e && !await hn({
			title: "Discard changes",
			message: "Discard unsaved agent settings changes?",
			confirmLabel: "Discard",
			danger: !0
		}) || (n.open = !1, n.identity = ++t, n.agentDirty = !1, r());
	}
	async function o() {
		let [t, r] = await Promise.all([e.request("/api/workspaces"), e.request("/api/settings/agenthub")]);
		n.data = {
			...t,
			agentHub: r
		}, n.dataVersion++;
	}
	function s(e) {
		!e || !n.open || (n.tab = e.tab || n.tab, n.workspacePath = String(e.workspacePath || ""), n.createWorkspace = !!e.createWorkspace, n.agentDirty = !!e.dirty, n.data = {
			...n.data,
			agentHub: {
				...n.data?.agentHub,
				configuredEndpoint: String(e.endpoint || "")
			},
			agentProfiles: (e.profiles || []).map((e) => ({ ...e }))
		});
	}
	function c() {
		return {
			agents: n.data?.agents || [],
			agentProfiles: n.data?.agentProfiles || []
		};
	}
	async function l() {
		let e = n.agentDirty ? c() : null;
		await o(), e && (n.data = {
			...n.data,
			...e
		});
	}
	async function u() {
		let t = n.workspacePath.trim();
		if (!t) throw Error("Workspace path is required.");
		let i = n.createWorkspace, a = await e.request("/api/workspaces", {
			method: "POST",
			body: JSON.stringify({
				path: t,
				create: i
			})
		});
		e.flushDraft(), n.workspacePath = "", n.createWorkspace = !1, e.setConfig(await e.request("/api/workspaces")), e.setActiveWorkspaceId(a.id), e.resetAgentState(), e.renderWorkspace(), await e.reloadWorkspaceContext(), await l(), r(), e.toast(i ? "Workspace created." : "Workspace added.");
	}
	async function d(t) {
		if (!t) return;
		e.flushDraft(), await e.request(`/api/workspaces/${encodeURIComponent(t)}`, { method: "DELETE" });
		let n = await e.request("/api/workspaces");
		if (e.setConfig(n), e.activeWorkspaceId() === t) {
			let t = n.activeId || n.workspaces[0]?.id || "";
			e.setActiveWorkspaceId(t), e.selectWorkspaceResource(), e.resetAgentState(), t ? await e.reloadWorkspaceContext() : e.clearWorkspaceContext();
		} else e.renderWorkspace();
		await l(), r(), e.toast("Workspace removed from PUA GUI.");
	}
	async function f(t, i) {
		if (!(!t || n.workspaceIconSavingId)) {
			n.workspaceIconSavingId = t, r();
			try {
				let r = await e.request(`/api/workspaces/${encodeURIComponent(t)}`, {
					method: "PUT",
					body: JSON.stringify({ icon: i || "" })
				}), a = (e = []) => e.map((e) => e.id === r.id ? r : e);
				e.setConfig({
					...e.config(),
					workspaces: a(e.config().workspaces)
				}), n.data = {
					...n.data,
					workspaces: a(n.data?.workspaces)
				}, e.renderWorkspace(), e.toast(i ? "Workspace icon saved." : "Workspace icon reset to the PUA default.");
			} finally {
				n.workspaceIconSavingId = "", r();
			}
		}
	}
	async function p() {
		await e.request("/api/settings/agenthub", {
			method: "PUT",
			body: JSON.stringify({
				endpoint: n.data?.agentHub?.configuredEndpoint || "http://127.0.0.1:4646",
				agentProfiles: (n.data?.agentProfiles || []).map((e) => ({ ...e }))
			})
		}), await o(), e.setConfig(Gc(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: Gc
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var qc = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering",
	"stopping"
]), Jc = 6e4;
function Yc(e) {
	let t = e.now || Date.now;
	function n(e) {
		if (!e) return "";
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function r(e) {
		return {
			hasTaskState: e.hasTaskState,
			className: e.className,
			layoutClassName: e.layoutClassName,
			slotClassName: e.slotClassName,
			statuses: e.statuses.map((e, t) => ({
				key: `${e.kind || e.iconName || "status"}:${t}`,
				className: e.className,
				iconName: e.iconName || "circle",
				recentOutput: e.recentOutput
			}))
		};
	}
	function i(e, t) {
		if (!t?.length) return e;
		let n = /* @__PURE__ */ new Map();
		return t.forEach((e, t) => {
			n.has(e) || n.set(e, t);
		}), e.map((e, t) => ({
			item: e,
			index: t
		})).sort((e, t) => {
			let r = n.get(e.item.id) ?? n.size + e.index, i = n.get(t.item.id) ?? n.size + t.index;
			return r === i ? e.index - t.index : r - i;
		}).map((e) => e.item);
	}
	function a(e, t, n, r) {
		if (t === n) return e;
		let i = e.filter((e) => e !== t), a = i.indexOf(n);
		return a < 0 ? e : (r && (a += 1), i.splice(a, 0, t), i);
	}
	function o(e) {
		let n = new Date(e.lastOutputAt || "").getTime();
		if (Number.isFinite(n)) return t() - n <= Jc;
		if (!qc.has(e.status || "")) return !1;
		let r = new Date(e.updatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= Jc;
	}
	function s(e) {
		if (!e?.status || e.status === "archived") return null;
		let t = o(e);
		switch (e.status) {
			case "running": return {
				kind: "resource-running",
				className: "task-status-session-running",
				iconName: "loader-circle",
				label: "Resource working",
				recentOutput: t
			};
			case "waiting_approval": return {
				kind: "resource-approval",
				className: "task-status-attention",
				iconName: "shield-question",
				label: "Resource waiting for approval",
				recentOutput: t
			};
			case "starting":
			case "stopping":
			case "recovering":
			case "idle":
			case "idle-suspended":
			case "stopped": return null;
			default: return {
				kind: "resource-active",
				className: "task-status-neutral",
				iconName: "circle-dot",
				label: `Resource ${e.status}`,
				recentOutput: t
			};
		}
	}
	function c(e) {
		let t = e.filter((e) => !!e), n = t.length > 0;
		return {
			statuses: t,
			hasTaskState: n,
			className: t.map((e) => e.className).filter(Boolean).join(" "),
			layoutClassName: n ? t.length > 1 ? "has-task-status-dual" : "has-task-status" : "",
			slotClassName: [t.length === 1 ? "task-status-single" : "", t.length > 1 ? "task-status-dual" : ""].filter(Boolean).join(" ")
		};
	}
	function l(e) {
		let t = s(e.runtime), n = t?.label || "", r = c(t ? [t] : []);
		return {
			session: t,
			statusPresentation: r,
			className: r.className,
			label: n
		};
	}
	function u() {
		return {
			session: null,
			className: "",
			label: "",
			statusPresentation: c([])
		};
	}
	function d(e) {
		let t = (e.children || []).filter((e) => e.archived !== !0), n = t.filter((e) => qc.has(e.runtime?.status || "")).length, r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n} working`;
		return {
			taskCount: t.length,
			runningCount: n,
			taskLabel: r,
			runningLabel: i,
			text: `${r} · ${i}`,
			ariaLabel: `Open tasks: ${r}; ${i}`
		};
	}
	function f(e) {
		return e ? `${e.kind}:${e.iconName}:${e.recentOutput}` : "none";
	}
	function p() {
		let t = e.tree();
		if (!t) return "";
		let n = [];
		if (t.scheduler) {
			let e = l(t.scheduler);
			n.push(`scheduler:resource=${f(e.session)}:${e.label}`);
		}
		for (let e of t.projects) {
			let t = l(e), r = d(e);
			n.push(`${e.id}:resource=${f(t.session)}:${t.label}:tasks=${r.taskCount}:${r.runningCount}`);
			for (let t of e.children || []) {
				let e = l(t);
				n.push(`${t.id}:resource=${f(e.session)}:${e.label}`);
			}
		}
		return n.join("|");
	}
	function m(t, n, r) {
		let a = e.tree();
		if (!a) return "workspace";
		let o = i(a.projects || [], n);
		for (let e of o) {
			let n = i(e.children || [], r[e.id]), a = n.findIndex((e) => e.id === t);
			if (!(a < 0)) return a + 1 < n.length ? n[a + 1].id : a - 1 >= 0 ? n[a - 1].id : e.id;
		}
		let s = o.findIndex((e) => e.id === t);
		if (s >= 0) {
			if (s + 1 < o.length) return o[s + 1].id;
			if (s - 1 >= 0) return o[s - 1].id;
		}
		return "workspace";
	}
	return {
		applyCustomOrder: i,
		archiveRedirectTarget: m,
		moveIdInList: a,
		noTaskOperationalState: u,
		operationalStatusPresentation: c,
		projectTaskSummary: d,
		resourceRefText: n,
		resourceStatusState: s,
		statusModel: r,
		taskOperationalState: l,
		taskOperationalStateKey: p
	};
}
//#endregion
//#region src/controllers/user-settings-controller.ts
var Xc = "pua.web.user.v1", Zc = ["forge.web.user.v1", "forge.gui.user.v1"], Qc = 1, $c = 80;
function el(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, $c).join("") || "User";
}
function tl(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Qc ? "User" : el(t.name);
	} catch {
		return "User";
	}
}
function nl(e, t) {
	let n = null;
	try {
		n = window.localStorage;
	} catch {}
	for (let e of Zc) Is(n, e, Xc);
	let r = i();
	function i() {
		try {
			return tl(window.localStorage.getItem(Xc));
		} catch {
			return "User";
		}
	}
	function a(e) {
		let t = el(e);
		try {
			window.localStorage.setItem(Xc, JSON.stringify({
				version: Qc,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return r = t, r;
	}
	return e.listen(window, "storage", (e) => {
		e.key === Xc && (r = tl(e.newValue), t());
	}), {
		current: () => r,
		save: a
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var rl = class {
	cleanups = /* @__PURE__ */ new Set();
	disposed = !1;
	get activeCount() {
		return this.cleanups.size;
	}
	add(e) {
		return this.disposed ? (e(), e) : (this.cleanups.add(e), () => {
			this.cleanups.delete(e) && e();
		});
	}
	listen(e, t, n, r) {
		return e.addEventListener(t, n, r), this.add(() => e.removeEventListener(t, n, r));
	}
	interval(e, t) {
		let n = window.setInterval(e, t);
		return this.add(() => window.clearInterval(n)), n;
	}
	animationFrame(e) {
		let t = () => void 0, n = window.requestAnimationFrame((n) => {
			t(), e(n);
		});
		return t = this.add(() => window.cancelAnimationFrame(n)), n;
	}
	dispose() {
		if (!this.disposed) {
			this.disposed = !0;
			for (let e of [...this.cleanups].reverse()) e();
			this.cleanups.clear();
		}
	}
}, il, al = null, Q = {
	config: null,
	doctor: {
		checking: !0,
		complete: !1,
		summary: {
			errors: 0,
			warnings: 0
		},
		workspaces: []
	},
	tree: null,
	details: {},
	workspaceAgents: null,
	activeWorkspaceId: "",
	navigationLoading: !0,
	navigationError: "",
	workspaceMenuOpen: !1,
	selectedId: "",
	lastResourceId: "",
	expandedProjects: /* @__PURE__ */ new Set(),
	projectOrder: [],
	taskOrder: {},
	listDrag: null,
	expandedPaths: /* @__PURE__ */ new Set(),
	diff: null,
	modalEnter: "",
	taskOperationalStateKey: "",
	uploadDialog: {
		open: !1,
		identity: 0,
		resourceId: "",
		items: [],
		nextId: 1
	},
	autoRefreshTimer: null,
	autoRefreshInFlight: !1,
	autoRefreshVersion: 0,
	treeRequestVersion: 0,
	navigationVersion: 0,
	detailRequestVersion: 0,
	workspaceAgentsRequestVersion: 0,
	diffRequestVersion: 0,
	messageStatus: null,
	messageStatusKey: "",
	messageStatusRequestVersion: 0,
	steeringMessageId: "",
	stopNotice: null,
	iconRefreshScheduled: !1,
	agent: {
		renderTimer: null,
		draftPrompt: "",
		chatDraft: "",
		chatMultiline: !1,
		chatDraftKey: "",
		chatDraftWorkspaceId: "",
		chatDraftResourceId: "",
		chatDraftVersion: 0,
		chatDraftResetVersion: 0,
		skipChatDraftSync: !1,
		agentName: "",
		optionsOpen: !1,
		historyOpen: !1,
		toolGroupOpen: /* @__PURE__ */ new Map(),
		approvalDrafts: /* @__PURE__ */ new Map(),
		renderDeferredForSelection: !1
	}
};
function ol() {
	for (let e of Object.keys(Q.details)) delete Q.details[e];
}
var sl = Ks({
	runtime: Q.agent,
	workspaceId: () => Q.activeWorkspaceId
}), cl = sl.clearResourceAfterAccepted, ll = sl.clearMemory, ul = sl.flush, dl = sl.restoreResource, fl = sl.update, pl = qs(() => {
	zd && (Bu(), kd());
}), ml = Uc(() => pu()), hl = Tn(() => pu()), gl = Wc({
	details: Q.details,
	context: () => ({
		workspaceId: Q.activeWorkspaceId,
		navigationVersion: Q.navigationVersion,
		selectedId: Q.selectedId,
		detailRequestVersion: Q.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++Q.detailRequestVersion,
	isCurrentWorkspace: (e, t) => au(e, t),
	request: (e, t) => $(e, t)
}), _l = Qs({
	workspaceId: () => Q.activeWorkspaceId,
	templates: (e) => Q.details[e]?.templates || [],
	request: (e, t) => $(e, t),
	publish: (e) => il.renderCreateDialog(e),
	toast: Od,
	reloadTree: () => ql(),
	selectResource: (e) => gu(e),
	onOpen: () => {
		Q.modalEnter = "create";
	},
	onIconsChanged: kd,
	confirmTemplateSwitch: () => hn({
		title: "Switch template",
		message: "Discard edited template fields and switch templates?",
		confirmLabel: "Discard",
		danger: !0
	})
}), vl = (e) => document.getElementById(e), yl = 5e3, bl = {
	id: "",
	label: "PUA default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, xl = [
	{
		id: "home-base",
		label: "Home base",
		src: "/workspace-icons/01-home-base.png"
	},
	{
		id: "personal-tasks",
		label: "Personal tasks",
		src: "/workspace-icons/02-personal-tasks.png"
	},
	{
		id: "product-roadmap",
		label: "Product roadmap",
		src: "/workspace-icons/03-product-roadmap.png"
	},
	{
		id: "software-engineering",
		label: "Software engineering",
		src: "/workspace-icons/04-software-engineering.png"
	},
	{
		id: "design-studio",
		label: "Design studio",
		src: "/workspace-icons/05-design-studio.png"
	},
	{
		id: "marketing-campaign",
		label: "Marketing campaign",
		src: "/workspace-icons/06-marketing-campaign.png"
	},
	{
		id: "sales-pipeline",
		label: "Sales pipeline",
		src: "/workspace-icons/07-sales-pipeline.png"
	},
	{
		id: "operations",
		label: "Operations",
		src: "/workspace-icons/08-operations.png"
	},
	{
		id: "finance",
		label: "Finance",
		src: "/workspace-icons/09-finance.png"
	},
	{
		id: "research-lab",
		label: "Research lab",
		src: "/workspace-icons/10-research-lab.png"
	},
	{
		id: "learning-education",
		label: "Learning and education",
		src: "/workspace-icons/11-learning-education.png"
	},
	{
		id: "customer-support",
		label: "Customer support",
		src: "/workspace-icons/12-customer-support.png"
	},
	{
		id: "events-calendar",
		label: "Events and calendar",
		src: "/workspace-icons/13-events-calendar.png"
	},
	{
		id: "documentation-knowledge",
		label: "Documentation and knowledge",
		src: "/workspace-icons/14-documentation-knowledge.png"
	},
	{
		id: "analytics",
		label: "Analytics",
		src: "/workspace-icons/15-analytics.png"
	},
	{
		id: "community-team",
		label: "Community and team",
		src: "/workspace-icons/16-community-team.png"
	}
], Sl = new Map(xl.map((e) => [e.id, e])), { applyCustomOrder: Cl, archiveRedirectTarget: wl, moveIdInList: Tl, projectTaskSummary: El, resourceRefText: Dl, statusModel: Ol, taskOperationalState: kl, taskOperationalStateKey: Al } = Yc({
	tree: () => Q.tree,
	findResource: (e) => ld(e),
	agentName: (e) => (Q.config?.agents || []).find((t) => t.id === e)?.name || e || "PUA GUI"
}), jl = 0, Ml = Kc({
	config: () => Q.config || {
		workspaces: [],
		agents: [],
		agentProfiles: []
	},
	setConfig: (e) => {
		Q.config = e;
	},
	activeWorkspaceId: () => Q.activeWorkspaceId,
	setActiveWorkspaceId: (e) => {
		Q.activeWorkspaceId = e;
	},
	selectWorkspaceResource: () => {
		Q.selectedId = "workspace";
	},
	request: (e, t) => $(e, t),
	publish: (e) => il.renderSettings(e),
	agentOptions: Nl,
	workspaceIcons: [bl, ...xl],
	userName: Ul,
	saveUser: (e) => {
		if (!Il) throw Error("User settings are unavailable.");
		return Il.save(e);
	},
	appearance: () => {
		let e = ml.snapshot();
		return {
			layout: e.layout.preference,
			fontScales: e.fontScales
		};
	},
	setLayoutPreference: (e) => ml.setLayoutPreference(e),
	setFontScale: (e, t) => ml.setFontScale(e, t),
	resetFontScales: () => ml.resetFontScales(),
	notificationPreferences: () => Fl?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => Fl?.setBrowserEnabled(e),
	setCompletionSound: (e) => Fl?.setSoundEnabled(e),
	flushDraft: ul,
	resetAgentState: Pu,
	reloadWorkspaceContext: async () => {
		await $l(), await ql();
	},
	clearWorkspaceContext: () => {
		Q.tree = null, ol(), ru();
	},
	renderWorkspace: lu,
	renderAgentViews: () => {
		yd(), Uu();
	},
	toast: Od,
	onIconsChanged: kd
});
function Nl() {
	return xd().map((e) => ({
		id: e.id || "",
		label: Wu(e),
		summary: Lu(e)
	}));
}
function Pl() {
	pu(), bu(), sd(), Zu(), Uu(), Bu(), Gu();
}
var Fl = null, Il = null;
function Ll(e) {
	Fl?.initialize(e);
}
function Rl() {
	Fl?.establishBaseline();
}
function zl(e = Q.tree) {
	if (!e) return [];
	let t = [], n = (e) => {
		let n = e?.runtime;
		!e || !n?.generationId || !n.completionMarker || t.push({
			id: n.generationId,
			resourceId: e.id,
			title: e.title || e.id,
			generationId: n.generationId,
			completionMarker: n.completionMarker,
			completionState: n.completionState || "completed",
			completionAt: n.completionAt,
			status: n.status
		});
	};
	n(e.scheduler);
	for (let t of e.projects || []) {
		n(t);
		for (let e of t.children || []) n(e);
	}
	return t;
}
function Bl(e) {
	Fl?.observeProjections(e);
}
function Vl(e, t) {
	t && Fl?.observeEvent(e, t);
}
function Hl(e) {
	Fl?.clearResource(e);
}
function Ul() {
	return Il?.current() || "User";
}
async function $(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		throw new rn(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function Wl() {
	try {
		return await $("/api/doctor");
	} catch (e) {
		return {
			checking: !1,
			complete: !1,
			summary: {
				errors: 0,
				warnings: 0
			},
			error: Js(e),
			workspaces: []
		};
	}
}
async function Gl() {
	if (Q.doctor.checking) return;
	Q.doctor = {
		...Q.doctor,
		checking: !0
	}, pu();
	let e = await fetch("/api/doctor", { method: "POST" });
	e.ok || (Q.doctor = {
		...Q.doctor,
		checking: !1,
		error: `${e.status} ${e.statusText}`
	}, pu());
}
async function Kl() {
	let e = hd(), [t, n, r] = await Promise.all([
		$("/api/workspaces"),
		$("/api/settings/agenthub"),
		Wl()
	]);
	Q.config = Td(t, n), Q.doctor = r, yd(), Q.activeWorkspaceId = gd(e.workspaceId) ? e.workspaceId || "" : Q.config?.activeId || Q.config?.workspaces[0]?.id || "", Q.selectedId = e.resourceId || "workspace", lu(), Q.activeWorkspaceId ? (Ll(Q.activeWorkspaceId), await $l(), !e.resourceId && Q.lastResourceId && (Q.selectedId = Q.lastResourceId), await ql({ replaceURL: !0 })) : (Q.navigationLoading = !1, Q.tree = null, ol(), Q.workspaceAgents = null, Q.diff = null, Pu(), ru());
}
async function ql(e = {}) {
	if (!Q.activeWorkspaceId) return;
	let t = Q.activeWorkspaceId, n = Q.navigationVersion, r = ++Q.treeRequestVersion;
	Q.navigationLoading = !0, Q.navigationError = "", pu(), Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let i;
	try {
		i = await $(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw au(t, n, r) && (Q.navigationLoading = !1, Q.navigationError = Js(e), pu()), e;
	}
	au(t, n, r) && (Q.tree = i, ol(), Q.workspaceAgents = null, Q.diff = null, dd(), md(!1), Q.selectedId === "workspace" ? await Ql() : Q.selectedId && await Jl(Q.selectedId), au(t, n, r) && (await Au(t, nd()), au(t, n, r) && (Rl(), Q.navigationLoading = !1, Q.navigationError = "", ru(), e.updateURL !== !1 && _d({ replace: !!e.replaceURL }))));
}
async function Jl(e, t = {}) {
	return gl.load(e, t);
}
function Yl(e, t = Q.activeWorkspaceId, n = {}) {
	return gl.fetch(e, t);
}
function Xl(e) {
	return gl.snapshot(e);
}
function Zl(e) {
	return gl.apply(e);
}
async function Ql(e = {}) {
	if (!Q.activeWorkspaceId || Q.workspaceAgents && !e.force) return;
	let t = Q.activeWorkspaceId, n = Q.navigationVersion, r = ++Q.workspaceAgentsRequestVersion;
	try {
		let e = await $(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!au(t, n) || r !== Q.workspaceAgentsRequestVersion) return null;
		Q.workspaceAgents = e;
	} catch (e) {
		if (!au(t, n) || r !== Q.workspaceAgentsRequestVersion) return null;
		Q.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: Js(e)
		};
	}
	return Q.workspaceAgents;
}
async function $l(e = Q.activeWorkspaceId, t = Q.navigationVersion) {
	let n = await $(`/api/workspaces/${e}/ui-state`);
	return au(e, t) ? (Q.expandedProjects = new Set(n.expandedProjects || []), Q.lastResourceId = n.lastResourceId || "", Q.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], Q.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, !0) : !1;
}
async function eu() {
	if (!Q.activeWorkspaceId) return;
	let e = Q.activeWorkspaceId, t = Q.navigationVersion, n = Q.selectedId;
	await $(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...Q.expandedProjects],
			lastResourceId: n,
			projectOrder: Q.projectOrder,
			taskOrder: Q.taskOrder
		})
	}), au(e, t) && (Q.lastResourceId = n);
}
function tu() {
	Q.autoRefreshTimer ||= al?.interval(() => {
		nu().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, yl) ?? null;
}
async function nu() {
	if (!Q.activeWorkspaceId || Q.autoRefreshInFlight || Q.listDrag) return;
	let e = Q.autoRefreshVersion, t = Q.activeWorkspaceId, n = Q.navigationVersion, r = Q.selectedId;
	Q.autoRefreshInFlight = !0;
	try {
		let [i, a] = await Promise.all([Eu(t), Wl()]);
		if (!i || !ou(t, n, e)) return;
		let o = !Ed(Q.tree, i);
		o && (Q.tree = i), Ed(Q.doctor, a) || (Q.doctor = a, o = !0), Bl(zl(i)), dd() && (_d({ replace: !0 }), o = !0, r = Q.selectedId);
		let s = Q.expandedProjects.size;
		if (md(!1), o ||= s !== Q.expandedProjects.size, Q.selectedId === "workspace") {
			let r = Q.workspaceAgents;
			if (await Ql({ force: !0 }), !ou(t, n, e)) return;
			Ed(r, Q.workspaceAgents) || (o = !0);
		} else if (r) {
			let i = ++Q.detailRequestVersion, a = await Yl(r, t);
			if (!ou(t, n, e) || Q.selectedId !== r || i !== Q.detailRequestVersion) return;
			let s = Xl(r);
			Zl(a), Ed(s, Xl(r)) || (o = !0);
		}
		Bl(zl(i)), await Au(t, nd()) && (o = !0), Al() !== Q.taskOperationalStateKey && (o = !0), o && ru();
	} finally {
		Q.autoRefreshInFlight = !1;
	}
}
function ru() {
	pu(), bu(), Bu(), kd(), sd(), Gu();
}
function iu() {
	pu(), bu(), Bu(), kd(), sd();
}
function au(e, t, n = null) {
	return e === Q.activeWorkspaceId && t === Q.navigationVersion && (n == null || n === Q.treeRequestVersion);
}
function ou(e, t, n) {
	return au(e, t) && n === Q.autoRefreshVersion;
}
function su(e) {
	return Sl.get(String(e?.icon || "").trim()) || bl;
}
function cu(e) {
	let t = su(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function lu() {
	let e = Q.config?.workspaces?.find((e) => e.id === Q.activeWorkspaceId);
	cu(e), pu();
}
function uu(e, t, n = "") {
	let r = kl(e), i = t === "project" && pd(e.id), a = t === "project" ? El(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: Dl(e.id),
		active: Q.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: Ol(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? Cl(e.children || [], Q.taskOrder[e.id]).map((t) => uu(t, "task", e.id)) : [],
		projectId: n,
		followed: !!e.attention?.followed
	};
}
function du(e) {
	if (!e) return null;
	let t = kl(e);
	return {
		id: e.id || "scheduler",
		type: "scheduler",
		title: e.title || "Scheduler",
		ref: "",
		active: Q.selectedId === (e.id || "scheduler"),
		expanded: !1,
		ariaLabel: ["Scheduler", t.label].filter(Boolean).join(". "),
		statusLabel: t.label || "Workspace Scheduler",
		status: Ol(t.statusPresentation),
		summary: null,
		children: []
	};
}
function fu(e) {
	let t = kl(e), n = e.type === "scheduler" || e.type === "project" || e.type === "task" ? e.type : "workspace", r = e.title || e.id;
	return {
		id: e.id,
		type: n,
		title: r,
		ref: n === "project" || n === "task" ? Dl(e.id) : "",
		selected: Q.selectedId === e.id,
		activeTurn: !!e.runtime?.activeTurn,
		followed: !!e.attention?.followed,
		turnNumber: Number(e.runtime?.turnNumber) || 0,
		agentName: String(e.runtime?.agentName || "").trim(),
		statusLabel: t.label || (e.attention?.followed ? "Focused resource" : "Active turn"),
		status: Ol(t.statusPresentation)
	};
}
function pu() {
	let e = Q.tree ? Cl(Q.tree.projects || [], Q.projectOrder).map((e) => uu(e, "project")) : [], t = Q.tree?.attentionList?.map((e) => fu(e)) || [];
	Q.tree && (Q.taskOperationalStateKey = Al()), il.renderAppShell({
		identity: Q.activeWorkspaceId || "no-workspace",
		loading: !!Q.navigationLoading,
		error: Q.navigationError || "",
		version: "v0.1.0",
		activeWorkspaceId: Q.activeWorkspaceId,
		workspaces: (Q.config?.workspaces || []).map((e) => ({
			id: e.id,
			name: e.name || e.id,
			path: e.path || "",
			icon: e.icon || "",
			iconSrc: su(e).src
		})),
		scheduler: du(Q.tree?.scheduler),
		projects: e,
		attentionList: t,
		doctor: $s(Q.doctor, Q.activeWorkspaceId),
		...ml.snapshot(),
		route: hl.projection(),
		onSwitchWorkspace: (e) => mu(e),
		onAddWorkspace: () => wd("workspace").catch((e) => Od(e.message)),
		onCreateProject: () => rd(),
		onOpenSettings: () => wd().catch((e) => Od(e.message)),
		onRefreshDoctor: Gl,
		onToggleProject: (e) => _u(e),
		onSelectResource: (e) => gu(e),
		onReorder: (e, t, n) => hu(e, t, n),
		onDragState: (e) => {
			Q.listDrag = e;
		},
		onToggleAttention: (e, t) => Ou(e, t),
		onDismissAttention: (e) => ku(e),
		onPanePreview: (e, t) => Md(e, t),
		onPaneCommit: (e) => Nd(e),
		onPaneViewport: () => Pd(),
		onMobileSidebar: (e) => Fd(e),
		onMobileView: (e) => Id(e),
		onMobileImmersive: (e) => Ld(e),
		onHistoryNavigation: (e) => Ud(e),
		onToast: Od,
		onIconsChanged: kd
	});
}
async function mu(e) {
	if (!gd(e)) return;
	if (Q.workspaceMenuOpen = !1, e === Q.activeWorkspaceId) {
		lu();
		return;
	}
	Fd(!1), ul(), Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let t = Q.navigationVersion;
	await eu().catch((e) => console.warn("failed to save UI state", e)), Q.activeWorkspaceId = e, Q.selectedId = "workspace", Q.tree = null, Q.navigationLoading = !0, Q.navigationError = "", ol(), Ll(e), od(), Pu(), lu(), await $l(e, t) && (Q.selectedId = Q.lastResourceId || "workspace", await ql());
}
async function hu(e, t, n) {
	let r = {
		projectOrder: [...Q.projectOrder],
		taskOrder: Object.fromEntries(Object.entries(Q.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []]))
	};
	if (e.kind === "task") {
		let r = ld(e.projectId);
		if (!r) return;
		let i = Cl(r.children || [], Q.taskOrder[e.projectId]);
		Q.taskOrder = {
			...Q.taskOrder,
			[e.projectId]: Tl(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") Q.projectOrder = Tl(Cl(Q.tree?.projects || [], Q.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	pu();
	try {
		await eu();
	} catch (e) {
		throw Q.projectOrder = r.projectOrder, Q.taskOrder = r.taskOrder, pu(), e;
	}
}
async function gu(e, t = {}) {
	let n = Q.selectedId !== e;
	t.clearUnread !== !1 && Hl(e);
	let r = n || !!t.forceDetail;
	r && (Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++, e !== "workspace" && gl.reset(e)), n && (ul(), Yu(), Q.diff = null, ll(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.steeringMessageId = ""), Q.selectedId = e, Fd(!1), md(!1), _d(), eu().catch((e) => console.warn("failed to save UI state", e)), iu(), await Promise.all([e === "workspace" ? Ql({ force: !!t.forceDetail }) : Jl(e, { force: r }), Au(Q.activeWorkspaceId, e)]), au(Q.activeWorkspaceId, Q.navigationVersion) && iu();
}
async function _u(e) {
	Q.expandedProjects.has(e) ? Q.expandedProjects.delete(e) : Q.expandedProjects.add(e), pu();
	try {
		await eu();
	} catch (t) {
		throw Q.expandedProjects.has(e) ? Q.expandedProjects.delete(e) : Q.expandedProjects.add(e), pu(), t;
	}
}
function vu() {
	let e = Q.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${Q.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: vd(),
		resourceId: Q.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		parent: null,
		loading: !1,
		detail: null,
		wiki: Q.tree?.wiki || null,
		workspaceAgents: Q.workspaceAgents,
		workspaceDefaults: {
			project: Q.tree?.resourceDefaults?.project || {
				kind: "profile",
				name: "default"
			},
			task: Q.tree?.resourceDefaults?.task || {
				kind: "profile",
				name: "default"
			}
		},
		agentBinding: Q.selectedId === "workspace" ? Q.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : ld(Q.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: (Q.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: Nl(),
		resolveResourceTitle: ud,
		onNavigate: (e) => xu(e).catch((e) => Od(Js(e))),
		onCreateTask: (e) => id(e),
		onArchive: (e) => cd(e).catch((e) => Od(Js(e))),
		onSaveWorkspaceAgents: (e, t) => Su(e, t),
		onSaveMarkdownFile: (e, t, n) => Cu(e, t, n),
		onDeleteArtifact: (e) => wu(e),
		onSaveAgentBinding: async (t) => {
			let n = Q.selectedId || "workspace";
			await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await ql({ updateURL: !1 }), n !== "workspace" && await Jl(n, { force: !0 }), ru(), Od("Resource agent binding saved.");
		},
		onSaveWorkspaceDefaults: async (t) => {
			await $(`/api/workspaces/${encodeURIComponent(e)}/defaults`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await ql({ updateURL: !1 }), ru(), Od("Workspace default bindings saved.");
		},
		onSaveTaskDefault: async (t, n) => {
			await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/task-default`, {
				method: "PUT",
				body: JSON.stringify(n || {})
			}), await ql({ updateURL: !1 }), await Jl(t, { force: !0 }), ru(), Od(n ? "Project Task default saved." : "Project Task default reset to inherit.");
		},
		onRefreshScheduler: async () => {
			await ql({ updateURL: !1 }), Q.selectedId === "scheduler" && await Jl("scheduler", { force: !0 }), ru();
		},
		onToast: Od,
		onIconsChanged: kd
	};
	if (!Q.tree) return t;
	if (Q.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: vd()
	};
	let n = ld(Q.selectedId) || Q.tree.scheduler || Q.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: vd()
	};
	let r = Q.details[n.id] || null, i = fd(n.id);
	return {
		...t,
		identity: `${e}:${n.id}:${n.type}`,
		resourceId: n.id,
		resourceType: n.type === "scheduler" || n.type === "project" || n.type === "task" ? n.type : "",
		resourceTitle: r?.title || n.title || n.id,
		parent: i && i.id !== n.id ? {
			id: i.id,
			title: i.title || i.id
		} : null,
		loading: !r,
		detail: yu(r)
	};
}
function yu(e) {
	return !e || e.type !== "scheduler" && e.type !== "project" && e.type !== "task" ? null : {
		...e,
		type: e.type,
		title: e.title || e.id,
		path: e.path || ""
	};
}
function bu() {
	il.renderDetailPanel(vu());
}
async function xu(e) {
	await gu(e, { forceDetail: e === Q.selectedId && e !== "workspace" });
}
async function Su(e, t) {
	if (!Q.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = Q.activeWorkspaceId, r = Q.navigationVersion, i = await $(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!au(n, r) || Q.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return Q.workspaceAgents = i, ru(), i;
}
async function Cu(e, t, n) {
	let r = Q.activeWorkspaceId, i = Q.selectedId;
	if (!r || !i || i === "workspace" || i === "scheduler") throw Error("No editable resource is selected.");
	let a = Q.navigationVersion;
	if (e.includes("/templates/")) {
		let n = e.split("/").pop()?.replace(/\.(md|markdown|mdown|mkdn)$/i, "") || "template", i = await $(`/api/workspaces/${encodeURIComponent(r)}/templates/validate`, {
			method: "POST",
			body: JSON.stringify({
				name: n,
				content: t
			})
		});
		if (!i.valid) throw Error(i.errors?.[0]?.message || "The task template is invalid.");
	}
	let o = await $(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/documents?path=${encodeURIComponent(e)}`, {
		method: "PUT",
		body: JSON.stringify({
			content: t,
			expectedContentHash: n
		})
	});
	if (!au(r, a) || Q.selectedId !== i) throw Error("The resource changed before the Markdown file finished saving.");
	return await Jl(i, { force: !0 }), ru(), o;
}
async function wu(e) {
	let t = Q.activeWorkspaceId, n = Q.selectedId;
	if (!t || !n || n === "workspace" || n === "scheduler") throw Error("No editable resource is selected.");
	let r = Q.navigationVersion;
	if (await $(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(n)}/artifacts?path=${encodeURIComponent(e)}`, { method: "DELETE" }), !au(t, r) || Q.selectedId !== n) throw Error("The resource changed before the artifact finished deleting.");
	await Jl(n, { force: !0 }), ru(), Od("Artifact deleted.");
}
function Tu() {
	Q.diffRequestVersion++, Q.diff = null, ru();
}
async function Eu(e = Q.activeWorkspaceId) {
	let t = ++Q.treeRequestVersion, n = Q.navigationVersion, r = await $(`/api/workspaces/${e}/tree`);
	return au(e, n, t) ? r : null;
}
async function Du() {
	if (!Q.activeWorkspaceId || !Q.tree) return;
	let e = await Eu(Q.activeWorkspaceId);
	e && (Q.tree = e);
}
async function Ou(e, t) {
	let n = Q.activeWorkspaceId;
	!n || !e || (await $(`/api/workspaces/${encodeURIComponent(n)}/resources/${encodeURIComponent(e)}/attention`, {
		method: "PUT",
		body: JSON.stringify({ followed: t })
	}), await Du(), ru());
}
async function ku(e) {
	let t = Q.activeWorkspaceId;
	!t || !e || (await $(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(e)}/attention/dismiss`, { method: "POST" }), await Du(), ru());
}
async function Au(e = Q.activeWorkspaceId, t = nd()) {
	if (!e || !t) return !1;
	let n = ++Q.messageStatusRequestVersion, r = `${e}:${t}`, i = await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/status`);
	if (n !== Q.messageStatusRequestVersion || e !== Q.activeWorkspaceId || t !== nd()) return !1;
	let a = Q.messageStatusKey !== r || !Ed(Q.messageStatus, i);
	return Q.messageStatusKey = r, Q.messageStatus = i, a;
}
function ju() {
	Q.stopNotice = null, Uu();
}
async function Mu(e) {
	if (!e || Q.steeringMessageId) return;
	let t = Q.activeWorkspaceId, n = nd();
	Q.steeringMessageId = e, Uu();
	try {
		await $(`/api/workspaces/${encodeURIComponent(t)}/messages/${encodeURIComponent(e)}/steer`, { method: "POST" }), await Au(t, n), t === Q.activeWorkspaceId && n === nd() && (ru(), Od("Message inserted into the current turn."));
	} catch (e) {
		try {
			await Au(t, n);
		} catch {}
		throw e;
	} finally {
		Q.steeringMessageId === e && (Q.steeringMessageId = "", Uu());
	}
}
async function Nu() {
	ul(), pl.reset(), ll(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.stopNotice = null, await Au();
}
function Pu() {
	ul(), Yu(), Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, ll(), pl.reset(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.steeringMessageId = "", Q.stopNotice = null, Q.agent.toolGroupOpen.clear(), Q.agent.approvalDrafts.clear(), Q.agent.renderDeferredForSelection = !1, Iu();
}
function Fu(e, t, n) {
	if (e !== Q.activeWorkspaceId || t !== nd() || !n) return;
	let r = ld(t)?.runtime || Q.messageStatus?.generation;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && Vl(n, r?.generationId ? {
		id: r.generationId,
		resourceId: t,
		generationId: r.generationId,
		completionState: n.type === "turn.failed" ? "failed" : n.type === "turn.cancelled" ? "cancelled" : "completed"
	} : null), [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(n.type) && Au().then(ru).catch((e) => console.warn("agent refresh failed", e));
}
function Iu() {
	Q.agent.renderTimer && window.clearTimeout(Q.agent.renderTimer), Q.agent.renderTimer = null;
}
function Lu(e) {
	if (!e) return "";
	let t = [Ru(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function Ru(e) {
	return (Q.config?.agentHubProviders || Ml.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function zu(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function Bu(e = {}) {
	Uu();
	let t = nd(), n = Q.messageStatusKey === `${Q.activeWorkspaceId}:${t}` ? Q.messageStatus : null, r = (Q.config?.agents || []).find((e) => e.id === n?.resolvedAgent) || bd(), i = ld(t)?.runtime;
	il.renderAgentPanelHeader({
		identity: `${Q.activeWorkspaceId}:${t}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		status: n,
		submitting: pl.isSending(Vu(Q.activeWorkspaceId, t)),
		agentName: Wu(r),
		modelSummary: Lu(r),
		turnNumber: Number(n?.generation?.turnNumber) || Number(i?.turnNumber) || 0,
		turnStartedAt: String(i?.turnStartedAt || ""),
		onIconsChanged: kd
	}), il.renderEventTimeline({
		identity: `${Q.activeWorkspaceId}:${t}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: Wu(r),
		resolveResourceTitle: ud,
		onNavigate: (e) => gu(e).catch((e) => Od(Js(e))),
		project: qr,
		onEvent: Fu,
		onNotice: () => {},
		onApproval: ed,
		onToast: Od,
		onIconsChanged: kd
	});
}
function Vu(e, t) {
	return `${e || "workspace"}:${t || "resource"}`;
}
var Hu = "";
function Uu(e = {}) {
	Q.agent.skipChatDraftSync = !1;
	let t = nd();
	Q.activeWorkspaceId && t && dl(t);
	let n = pl.active("turn-stop") && pl.key("turn-stop") === t, r = pl.active("generation-end") && pl.key("generation-end") === t, i = Q.messageStatusKey === `${Q.activeWorkspaceId}:${t}` ? Q.messageStatus : null, a = Q.activeWorkspaceId, o = `${a}:${t}`, s = !!(n || ["running", "waiting_approval"].includes(String(i?.session?.state || "")));
	il.renderComposer({
		identity: `${Q.activeWorkspaceId}:${t}:${Q.agent.chatDraftKey || ""}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		draft: Q.agent.chatDraft || "",
		draftKey: Q.agent.chatDraftKey || "",
		draftResetVersion: Q.agent.chatDraftResetVersion || 0,
		unavailableReason: i ? i.acceptsMessages ? "" : i.archived ? "This resource is archived." : i.configError || "This resource cannot accept messages." : "Loading work status.",
		sending: pl.isSending(Vu(Q.activeWorkspaceId, t)),
		canEndTurn: s,
		endingTurn: n,
		canEndGeneration: !!(i?.acceptsMessages && i?.generation?.generationId && !s),
		endingGeneration: !!(r || i?.generation?.replacementPending),
		stopNotice: Q.stopNotice?.key === o ? Q.stopNotice.text : "",
		waitingMessages: i?.waitingMessages || [],
		canSteerWaiting: !!i?.canSteerWaiting,
		steeringMessageId: Q.steeringMessageId,
		agentBinding: t === "workspace" ? Q.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : ld(t)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: (Q.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: Nl(),
		bindingSaving: Hu === t,
		onDraft: (e, t) => Ku(e, t),
		onSend: td,
		onOpenUpload: qu,
		onEndTurn: () => Qu().catch((e) => Od(e.message)),
		onEndGeneration: () => $u().catch((e) => Od(e.message)),
		onDismissStopNotice: ju,
		onSteerWaiting: Mu,
		onSaveAgentBinding: async (e) => {
			if (t === nd()) {
				Hu = t, Uu();
				try {
					await $(`/api/workspaces/${encodeURIComponent(a)}/resources/${encodeURIComponent(t)}/agent-binding`, {
						method: "PUT",
						body: JSON.stringify(e)
					}), await ql({ updateURL: !1 }), t !== "workspace" && await Jl(t, { force: !0 }), ru(), Od("Resource agent binding saved.");
				} catch (e) {
					Od(Js(e));
				} finally {
					Hu = "", Uu();
				}
			}
		},
		onIconsChanged: kd
	});
}
function Wu(e) {
	return e?.name || e?.id || "Agent";
}
function Gu() {
	Ml.render();
}
function Ku(e, t) {
	!t || t.workspaceId !== Q.activeWorkspaceId || t.resourceId !== nd() || t.draftKey !== Q.agent.chatDraftKey || fl(e);
}
function qu() {
	let e = nd();
	if (!e || Q.messageStatus?.archived) {
		Od("Select an active resource before uploading files.");
		return;
	}
	let t = vl("chatInput");
	t && fl(t.value), Q.modalEnter = "upload", Q.uploadDialog = {
		open: !0,
		identity: ++jl,
		resourceId: e,
		items: [],
		nextId: 1
	}, Zu();
}
function Ju(e = [], t = {}) {
	if (!Q.uploadDialog.open) return;
	let n = Q.uploadDialog.resourceId === nd(), r = !t.workspaceId || t.workspaceId === Q.activeWorkspaceId, i = e.length > 0 && r && n;
	i && (fl(Xu(Q.agent.chatDraft, e)), Q.agent.chatDraftResetVersion++), Yu();
	let a = vl("chatComposer");
	a && delete a.dataset.composerKey, Uu({ skipDraftSync: i }), vl("chatInput")?.focus({ preventScroll: !0 }), kd();
}
function Yu() {
	Q.uploadDialog = {
		open: !1,
		identity: ++jl,
		resourceId: "",
		items: [],
		nextId: 1
	}, Zu();
}
function Xu(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function Zu() {
	let e = Q.uploadDialog;
	il.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${Q.activeWorkspaceId}:${e.resourceId || ""}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: e.resourceId || "",
		onDone: Ju,
		onIconsChanged: kd
	});
}
async function Qu() {
	let e = Q.activeWorkspaceId, t = nd(), n = Q.messageStatus?.generation?.generationId || "", r = pl.begin("turn-stop", t);
	if (r) try {
		let r = n ? `?generationId=${encodeURIComponent(n)}` : "", i = await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/turn/end${r}`, { method: "POST" }), a = Math.max(0, Number(i.cancelledPendingSteerCount || 0)), o = a === 1 ? "Turn stopped. 1 pending steer was cancelled and will not affect the next turn." : a > 1 ? `Turn stopped. ${a} pending steers were cancelled and will not affect the next turn.` : "Turn stopped. No pending steer remained; any steer already delivered to this turn was not changed.";
		i.pendingSteerCancellationError && (o += ` Pending steer cancellation needs attention: ${i.pendingSteerCancellationError}`), Q.stopNotice = {
			key: `${e}:${t}`,
			text: o
		}, await Au(e, t), ru();
	} finally {
		pl.finish(r);
	}
}
async function $u() {
	let e = Q.activeWorkspaceId, t = nd(), n = Q.messageStatus?.generation?.generationId || "";
	if (!e || !t || !n || !window.confirm("End this generation? Its AgentHub session will be stopped and archived. Your next message will start a new generation.")) return;
	let r = pl.begin("generation-end", t);
	if (r) try {
		await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/generation/end?generationId=${encodeURIComponent(n)}`, { method: "POST" }), await Promise.all([Au(e, t), Du()]), ru(), Od("Generation is ending. Your next message will start a new generation.");
	} finally {
		pl.finish(r);
	}
}
async function ed(e, t, n) {
	let r = Q.activeWorkspaceId, i = nd();
	await $(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/approval?generationId=${encodeURIComponent(e)}`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), await Au(r, i), ru();
}
async function td(e, t) {
	if (!e.trim() || t.workspaceId !== Q.activeWorkspaceId || t.resourceId !== nd() || t.draftKey !== Q.agent.chatDraftKey) return {
		accepted: !1,
		clear: !1
	};
	let n = Vu(t.workspaceId, t.resourceId);
	if (!pl.startSending(n)) return {
		accepted: !1,
		clear: !1
	};
	let r = Q.agent.chatDraftVersion;
	try {
		await $(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/resources/${encodeURIComponent(t.resourceId)}/messages`, {
			method: "POST",
			body: JSON.stringify({
				text: e,
				role: "user",
				sender: { name: Ul() }
			})
		});
		let n = cl({
			workspaceId: t.workspaceId,
			resourceId: t.resourceId,
			key: t.draftKey,
			text: e,
			version: r
		});
		return n && Q.agent.chatDraftResetVersion++, n && Q.stopNotice?.key === `${t.workspaceId}:${t.resourceId}` && (Q.stopNotice = null), await Promise.all([Au(t.workspaceId, t.resourceId), Du()]), ru(), {
			accepted: !0,
			clear: n
		};
	} finally {
		pl.stopSending(n);
	}
}
function nd() {
	return Q.selectedId === "workspace" ? "workspace" : ld(Q.selectedId)?.id || "";
}
function rd() {
	ad("project");
}
function id(e) {
	ad("task", e);
}
function ad(e, t = "") {
	_l.open(e === "task" ? "task" : "project", t);
}
function od() {
	_l.close();
}
function sd() {
	_l.render();
}
async function cd(e) {
	let t = wl(e, Q.projectOrder, Q.taskOrder), n = (await $(`/api/workspaces/${Q.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	})).warnings || [];
	Od(n.length > 0 ? ["Archived.", ...n.map((e) => `Warning: ${e.message}`)].join("\n") : "Archived."), Q.selectedId = t, await ql();
}
function ld(e) {
	if (!Q.tree) return null;
	if (Q.tree.scheduler?.id === e) return Q.tree.scheduler;
	for (let t of Q.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function ud(e) {
	if (e === "workspace") return vd();
	let t = ld(e);
	return t ? String(t.title || t.id).trim() || t.id : null;
}
function dd() {
	return Q.selectedId === "workspace" || ld(Q.selectedId) ? !1 : (Q.selectedId = "workspace", !0);
}
function fd(e) {
	if (!Q.tree) return null;
	for (let t of Q.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function pd(e) {
	return Q.expandedProjects.has(e);
}
function md(e = !1) {
	let t = fd(Q.selectedId);
	!t || t.id === Q.selectedId || Q.expandedProjects.has(t.id) || (Q.expandedProjects.add(t.id), e && eu().catch((e) => Od(e.message)));
}
function hd(e = window.location.pathname) {
	return hl.parse(e);
}
function gd(e) {
	return !!(e && Q.config?.workspaces.some((t) => t.id === e));
}
function _d(e = {}) {
	hl.project(Q.activeWorkspaceId, Q.selectedId, e);
}
function vd() {
	return Q.config?.workspaces.find((e) => e.id === Q.activeWorkspaceId)?.name || "Workspace";
}
function yd() {
	let e = xd(), t = Sd();
	e.some((e) => e.id === Q.agent.agentName) || (Q.agent.agentName = t);
}
function bd() {
	let e = xd(), t = Q.agent.agentName || Sd();
	return e.find((e) => e.id === t) || e[0] || null;
}
function xd() {
	return (Q.config?.agents || []).filter((e) => e.available !== !1);
}
function Sd() {
	let e = xd();
	return Cd(Q.config?.agentProfiles, "default") || Cd(Ml.profiles(), "default") || e[0]?.id || "";
}
function Cd(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function wd(e = "workspace") {
	return Ml.open(e);
}
function Td(e, t) {
	return Ml.withAgentHubCatalog(e, t);
}
function Ed(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var Dd = 0;
function Od(e) {
	il.renderToast({
		message: String(e || ""),
		revision: ++Dd
	});
}
function kd() {
	let e = window.lucide;
	!e || Q.iconRefreshScheduled || (Q.iconRefreshScheduled = !0, al?.animationFrame(() => {
		Q.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function Ad(e) {
	kd(), e === "markdown" && window.marked && window.DOMPurify && (bu(), kd()), e === "diff" && bu();
}
window.puaAssetLoaded = Ad;
function jd() {
	ml.initialize();
}
function Md(e, t) {
	ml.previewPane(e, t);
}
function Nd(e) {
	ml.commitPane(e);
}
function Pd() {
	ml.syncViewport();
}
function Fd(e) {
	ml.setMobileSidebar(e);
}
function Id(e) {
	ml.setMobileView(e);
}
function Ld(e) {
	ml.setMobileImmersive(e);
}
function Rd() {
	al?.listen(document, "selectionchange", () => {
		if (!Q.agent.renderDeferredForSelection) return;
		let e = vl("chatTimeline");
		e && zu(e) || (Q.agent.renderDeferredForSelection = !1, Bu(), kd());
	}), al?.listen(document, "keydown", (e) => {
		e.key === "Escape" && Q.diff ? Tu() : e.key === "Escape" && (Q.agent.optionsOpen || Q.agent.historyOpen) && (Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, Uu(), kd());
	}), al?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			xu(n.dataset.breadcrumbResource || "workspace").catch((e) => Od(Js(e)));
			return;
		}
		(Q.agent.optionsOpen || Q.agent.historyOpen) && t && !t.closest(".chat-composer") && (Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, Uu(), kd()), kd();
	}), al?.listen(window, "beforeunload", Vd), al?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && Vd();
	});
}
var zd = !1;
function Bd(e) {
	if (il = e, zd) {
		Pl();
		return;
	}
	zd = !0;
	let t = new rl();
	al = t, Fl = vc({
		scope: t,
		selectedResourceId: () => Q.selectedId,
		resourceProjections: () => zl(),
		hasTree: () => !!Q.tree,
		findResource: ld,
		selectResource: gu,
		notificationsSettingsVisible: () => Ml.isOpenTab("notifications"),
		renderSettings: Gu,
		refreshIcons: kd,
		flushDraft: Vd
	}), Il = nl(t, () => {
		Ml.isOpenTab("user") && Gu();
	}), Rd(), jd(), Fl.install(), pu(), Kl().catch((e) => {
		Q.navigationLoading = !1, Q.navigationError = e.message, Od(e.message), ru();
	}), tu();
}
function Vd() {
	ul();
}
function Hd() {
	zd && (Vd(), zd = !1, Fl?.dispose(), Fl = null, Il = null, pl.reset(), Iu(), _l.dispose(), al?.dispose(), al = null, Q.autoRefreshTimer = null);
}
async function Ud(e) {
	let t = hd(e);
	if (!gd(t.workspaceId)) {
		_d({ replace: !0 });
		return;
	}
	let n = Q.activeWorkspaceId !== t.workspaceId, r = Q.selectedId;
	ul(), Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let i = Q.navigationVersion;
	if (Q.activeWorkspaceId = t.workspaceId || "", Q.selectedId = t.resourceId || "workspace", !n && r !== Q.selectedId && Q.selectedId !== "workspace" && (gl.reset(Q.selectedId), delete Q.details[Q.selectedId]), Q.diff = null, n && (Q.tree = null, Q.navigationLoading = !0, Q.navigationError = "", od(), Ll(Q.activeWorkspaceId)), n && Pu(), lu(), n) {
		if (!await $l(t.workspaceId || "", i)) return;
		!t.resourceId && Q.lastResourceId && (Q.selectedId = Q.lastResourceId), await ql({ updateURL: !1 }), au(t.workspaceId || "", i) && _d({ replace: !0 });
	} else {
		let e = dd();
		if (Q.selectedId === "workspace" ? await Ql() : (md(!1), await Jl(Q.selectedId)), !au(t.workspaceId || "", i)) return;
		r !== Q.selectedId && await Nu(), ru(), e && _d({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var Wd = Fs(), Gd = {
	renderAppShell: Wd.appShell.publish,
	renderCreateDialog: Wd.create.publish,
	renderSettings: Wd.settings.publish,
	renderUploadDialog: Wd.upload.publish,
	renderComposer: Wd.composer.publish,
	renderEventTimeline: Wd.timeline.publish,
	renderAgentPanelHeader: Wd.agentHeader.publish,
	renderDetailPanel: Wd.detail.publish,
	renderToast: Wd.toast.publish
}, Kd = null;
async function qd() {
	if (Kd) return;
	let e = document.getElementById("app");
	if (!e) throw Error("PUA application root is unavailable.");
	if (window.location.pathname === "/file") {
		e.dataset.componentOwner = "file-preview-fullscreen", Kd = t(Ns, { target: e });
		return;
	}
	e.dataset.componentOwner = "app-shell", Kd = t(js, {
		target: e,
		props: { channels: Wd }
	}), Bd(Gd);
}
async function Jd() {
	if (Hd(), !Kd) return;
	let e = Kd;
	Kd = null, await p(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void Jd()), window.addEventListener("pageshow", (e) => {
	e.persisted && qd();
}), qd().catch((e) => console.error("Failed to start the PUA application", e));
//#endregion
