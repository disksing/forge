import { A as e, B as t, C as n, D as r, E as i, F as a, G as o, H as s, I as c, J as l, K as u, L as d, M as f, N as p, O as m, P as h, R as g, S as _, T as v, U as y, V as b, W as x, X as S, Y as C, Z as w, _ as T, a as E, b as D, c as O, d as k, f as A, g as j, h as M, i as N, j as P, k as F, l as I, m as L, n as R, o as z, p as B, q as ee, r as V, s as H, t as U, u as W, v as G, w as K, x as q, y as te, z as J } from "./Icon-qM-gEmE6.js";
//#region src/components/DoctorDialog.svelte
var Y = P("<div class=\"doctor-global-error\"><strong>Doctor could not run</strong><span> </span></div>"), ne = P("<div class=\"doctor-empty\"><!><span>Checking configured Workspaces…</span></div>"), re = P("<div class=\"doctor-empty\"><!><span>No configured Workspace problems.</span></div>"), ie = P("<code> </code>"), ae = P("<p> </p>"), oe = P("<article><div class=\"doctor-issue-icon\"><!></div> <div class=\"doctor-issue-copy\"><div class=\"doctor-issue-title\"><strong> </strong><span> </span></div> <!> <!></div></article>"), se = P("<section class=\"doctor-workspace\"><div class=\"doctor-workspace-heading\"><div><h3> </h3><code> </code></div> <span> </span></div> <div class=\"doctor-issues\"></div></section>"), ce = P("<div data-component-owner=\"doctor-dialog\" class=\"doctor-backdrop\" role=\"presentation\"><div class=\"doctor-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"doctorTitle\"><header><div><h2 id=\"doctorTitle\">Workspace problems</h2> <p> </p></div> <div class=\"doctor-header-actions\"><button type=\"button\" class=\"doctor-refresh\" aria-label=\"Refresh workspace checks\"><!> Refresh</button> <button type=\"button\" class=\"doctor-close\" aria-label=\"Close workspace problems\"><!></button></div></header> <div class=\"doctor-content\"><!> <!></div></div></div>");
function le(n, i) {
	C(i, !0);
	let a = o(!1);
	async function d() {
		if (!c(a)) {
			x(a, !0);
			try {
				await i.onRefresh();
			} finally {
				x(a, !1);
			}
		}
	}
	J(() => {
		i.snapshot, queueMicrotask(i.onIconsChanged);
	});
	var f = ce(), p = t(f), m = t(p), _ = t(m), v = s(t(_), 2), y = t(v);
	w(v), w(_);
	var T = s(_, 2), E = t(T), D = t(E);
	{
		let e = u(() => c(a) || i.snapshot.checking ? "loader-circle" : "refresh-cw");
		U(D, { get name() {
			return c(e);
		} });
	}
	S(), w(E);
	var O = s(E, 2), k = t(O);
	U(k, { name: "x" }), w(O), w(T), w(m);
	var A = s(m, 2), M = t(A), N = (e) => {
		var n = Y(), a = s(t(n)), o = t(a, !0);
		w(a), w(n), g(() => r(o, i.snapshot.error)), F(e, n);
	};
	K(M, (e) => {
		i.snapshot.error && e(N);
	});
	var P = s(M, 2), I = (e) => {
		var n = ne(), r = t(n);
		U(r, { name: "loader-circle" }), S(), w(n), F(e, n);
	}, L = (e) => {
		var n = re(), r = t(n);
		U(r, { name: "circle-check" }), S(), w(n), F(e, n);
	}, R = (n) => {
		var a = e(), o = b(a);
		q(o, 17, () => i.snapshot.workspaces, (e) => e.id, (n, i) => {
			var a = e(), o = b(a), l = (e) => {
				var n = se(), a = t(n), o = t(a), l = t(o), d = t(l, !0);
				w(l);
				var f = s(l), p = t(f, !0);
				w(f), w(o);
				var m = s(o, 2), h = t(m, !0);
				w(m), w(a);
				var _ = s(a, 2);
				q(_, 23, () => c(i).report.issues, (e, t) => `${e.code}:${e.path || ""}:${e.resourceId || ""}:${t}`, (e, n) => {
					var i = oe();
					let a;
					var o = t(i), l = t(o);
					{
						let e = u(() => c(n).severity === "error" ? "circle-x" : "triangle-alert");
						U(l, { get name() {
							return c(e);
						} });
					}
					w(o);
					var d = s(o, 2), f = t(d), p = t(f), m = t(p, !0);
					w(p);
					var h = s(p), _ = t(h, !0);
					w(h), w(f);
					var v = s(f, 2), y = (e) => {
						var i = ie(), a = t(i, !0);
						w(i), g(() => r(a, c(n).path)), F(e, i);
					};
					K(v, (e) => {
						c(n).path && e(y);
					});
					var b = s(v, 2), x = (e) => {
						var i = ae(), a = t(i, !0);
						w(i), g(() => r(a, c(n).suggestion)), F(e, i);
					};
					K(b, (e) => {
						c(n).suggestion && e(x);
					}), w(d), w(i), g(() => {
						a = j(i, 1, "", null, a, {
							error: c(n).severity === "error",
							warning: c(n).severity !== "error"
						}), r(m, c(n).message), r(_, c(n).code);
					}), F(e, i);
				}), w(_), w(n), g(() => {
					r(d, c(i).name || c(i).id), r(p, c(i).path), r(h, c(i).report.summary.errors + c(i).report.summary.warnings);
				}), F(e, n);
			};
			K(o, (e) => {
				c(i).report.issues.length > 0 && e(l);
			}), F(n, a);
		}), F(n, a);
	};
	K(P, (e) => {
		i.snapshot.checking && !i.snapshot.checkedAt ? e(I) : i.snapshot.workspaces.length === 0 ? e(L, 1) : e(R, -1);
	}), w(A), w(p), w(f), g(() => {
		r(y, `${i.snapshot.summary.errors ?? ""} errors · ${i.snapshot.summary.warnings ?? ""} warnings`), E.disabled = c(a) || i.snapshot.checking;
	}), h("click", f, (e) => {
		e.target === e.currentTarget && i.onClose();
	}), h("click", E, () => void d()), h("click", O, function(...e) {
		i.onClose?.apply(this, e);
	}), F(n, f), l();
}
p(["click"]);
//#endregion
//#region src/components/StatusPresentation.svelte
var ue = P("<span><!></span>"), de = P("<span data-component-owner=\"status-presentation\" aria-hidden=\"true\"></span>");
function fe(n, r) {
	C(r, !0);
	let i = N(r, "className", 3, "");
	var a = e(), o = b(a), s = (e) => {
		var n = de();
		q(n, 21, () => r.status.statuses, (e) => e.key, (e, n) => {
			var r = ue(), i = t(r);
			U(i, {
				get name() {
					return c(n).iconName;
				},
				className: "task-status-icon"
			}), w(r), g(() => j(r, 1, `task-status-indicator ${c(n).className} ${c(n).recentOutput ? "task-status-fresh" : ""}`)), F(e, r);
		}), w(n), g(() => j(n, 1, `task-status-slot ${i()} ${r.status.slotClassName}`)), F(e, n);
	};
	K(o, (e) => {
		r.status.hasTaskState && e(s);
	}), F(n, a), l();
}
//#endregion
//#region src/components/AttentionList.svelte
var pe = P("<div class=\"activity-row empty-attention\"><!><div><strong>No activity</strong><span>Follow a resource or start a turn.</span></div></div>"), me = P("<span role=\"button\" tabindex=\"0\"><!></span>"), he = P("<span class=\"attention-dismiss\" role=\"button\" tabindex=\"0\" title=\"Dismiss\"><!></span>"), ge = P("<button type=\"button\"><span class=\"activity-status\" aria-hidden=\"true\"><span class=\"activity-status-fallback-slot\"><!></span> <span class=\"activity-status-runtime-slot\"><!></span></span> <span class=\"activity-title\"><strong> </strong><span class=\"activity-meta\"> </span></span> <span class=\"activity-actions\"><!> <!></span></button>"), _e = P("<section class=\"attention-section\" data-component-owner=\"attention-list\"><div class=\"section-title\"><span>Activity</span></div> <nav class=\"attention-list\" aria-label=\"Activity list\"><!></nav></section>");
function ve(n, i) {
	C(i, !0);
	function a(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function o(e) {
		return e.type === "project" ? "folder" : e.type === "task" ? "file-text" : e.type === "scheduler" ? "calendar-clock" : "home";
	}
	function d(e) {
		return e.type === "project" || e.type === "task";
	}
	function f(e) {
		return [
			e.ref || e.id,
			e.agentName ? `Agent ${e.agentName}` : "",
			e.turnNumber > 0 ? `Turn ${e.turnNumber}` : "No turns",
			e.statusLabel
		].filter(Boolean).join(" · ");
	}
	async function p(e) {
		try {
			await i.onSelect(e.id);
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function m(e, t) {
		e.preventDefault(), e.stopPropagation(), e instanceof MouseEvent && e.currentTarget?.blur();
		try {
			await i.onToggleAttention(t.id, !t.followed);
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function _(e, t) {
		e.preventDefault(), e.stopPropagation();
		try {
			await i.onDismiss(t.id);
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function v(e, t) {
		(e.key === "Enter" || e.key === " ") && t(e);
	}
	var y = _e(), x = s(t(y), 2), T = t(x), E = (e) => {
		var n = pe(), r = t(n);
		U(r, { name: "message-square" }), S(), w(n), F(e, n);
	}, D = (n) => {
		var l = e(), y = b(l);
		q(y, 17, () => i.items, (e) => e.id, (e, n) => {
			var i = ge(), l = t(i), y = t(l), b = t(y);
			{
				let e = u(() => o(c(n)));
				U(b, {
					get name() {
						return c(e);
					},
					className: "activity-status-fallback"
				});
			}
			w(y);
			var x = s(y, 2);
			fe(t(x), {
				get status() {
					return c(n).status;
				},
				className: "activity-status-icon"
			}), w(x), w(l);
			var S = s(l, 2), C = t(S), T = t(C, !0);
			w(C);
			var E = s(C), D = t(E, !0);
			w(E), w(S);
			var O = s(S, 2), k = t(O), A = (e) => {
				var r = me();
				let i;
				var a = t(r);
				U(a, { name: "star" }), w(r), g(() => {
					i = j(r, 1, "attention-star", null, i, { followed: c(n).followed }), I(r, "aria-label", c(n).followed ? `Unfollow ${c(n).title}` : `Follow ${c(n).title}`), I(r, "title", c(n).followed ? "Unfollow" : "Follow");
				}), h("click", r, (e) => m(e, c(n))), h("keydown", r, (e) => v(e, (e) => m(e, c(n)))), F(e, r);
			}, M = u(() => d(c(n)));
			K(k, (e) => {
				c(M) && e(A);
			});
			var N = s(k, 2), P = (e) => {
				var r = he(), i = t(r);
				U(i, { name: "x" }), w(r), g(() => I(r, "aria-label", `Dismiss ${c(n).title}`)), h("click", r, (e) => _(e, c(n))), h("keydown", r, (e) => v(e, (e) => _(e, c(n)))), F(e, r);
			};
			K(N, (e) => {
				c(n).activeTurn || e(P);
			}), w(O), w(i), g((e, t, a) => {
				j(i, 1, e), I(i, "aria-current", c(n).selected ? "page" : void 0), I(i, "data-active-turn", c(n).activeTurn || void 0), I(i, "aria-label", t), I(i, "title", c(n).statusLabel || void 0), I(y, "hidden", c(n).status.hasTaskState), I(x, "hidden", !c(n).status.hasTaskState), r(T, c(n).title), r(D, a);
			}, [
				() => `activity-row ${a(c(n).status)} ${c(n).selected ? "selected" : ""}`,
				() => `${c(n).title}. ${f(c(n))}`,
				() => f(c(n))
			]), h("click", i, () => p(c(n))), F(e, i);
		}), F(n, l);
	};
	K(T, (e) => {
		i.items.length === 0 ? e(E) : e(D, -1);
	}), w(x), w(y), F(n, y), l();
}
p(["click", "keydown"]);
//#endregion
//#region src/components/MobileToolbar.svelte
var ye = P("<header class=\"mobile-toolbar\" data-component-owner=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" type=\"button\" aria-label=\"Toggle immersive chat\"><span class=\"mobile-immersive-icon mobile-immersive-icon-collapse\"><!></span><span class=\"mobile-immersive-icon mobile-immersive-icon-expand\"><!></span></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" data-component-owner=\"mobile-toolbar\" type=\"button\" aria-label=\"Close navigation\"></button>", 1);
function be(e, n) {
	C(n, !0);
	var r = ye(), i = b(r), a = t(i), o = t(a);
	U(o, { name: "menu" }), w(a);
	var c = s(a, 2), u = t(c), d = s(u, 2);
	w(c);
	var f = s(c, 2);
	let p;
	var m = t(f), _ = t(m);
	U(_, { name: "minimize-2" }), w(m);
	var v = s(m), y = t(v);
	U(y, { name: "maximize-2" }), w(v), w(f), w(i);
	var x = s(i, 2);
	g(() => {
		I(a, "aria-expanded", n.sidebarOpen), I(u, "aria-selected", n.view === "details"), I(d, "aria-selected", n.view === "chat"), p = j(f, 1, "mobile-icon-button mobile-immersive-button", null, p, { immersive: n.immersive }), I(f, "aria-pressed", n.immersive);
	}), h("click", a, () => n.onSidebar(!n.sidebarOpen)), h("click", u, () => n.onView("details")), h("click", d, () => n.onView("chat")), h("click", f, () => n.onImmersive(!n.immersive)), h("click", x, () => n.onSidebar(!1)), F(e, r), l();
}
p(["click"]);
//#endregion
//#region src/components/PaneResizeHandle.svelte
var xe = P("<div data-component-owner=\"pane-resize-handle\" role=\"separator\"></div>");
function Se(e, t) {
	C(t, !0);
	let n = null;
	R(() => n?.());
	function r(e) {
		if (window.matchMedia("(max-width: 980px)").matches) return;
		e.preventDefault(), n?.();
		let r = e.currentTarget, i = document.getElementById("app"), a = document.getElementById("mobileSidebar"), o = document.querySelector(".workspace-panel"), s = document.getElementById("agentPanel"), c = document.querySelector(".attention-section");
		if (!i || !a || !o || !s || !c) return;
		let l = document.body.dataset.layout === "two", u = e.clientX, d = e.clientY, f = a.getBoundingClientRect().width, p = s.getBoundingClientRect().width, m = c.getBoundingClientRect().height, h = t.kind === "sidebarAttentionHeight" ? "resizing-y" : "resizing-x";
		r.classList.add("dragging"), document.body.classList.add(h);
		let g = (e) => {
			if (t.kind === "sidebarWidth") {
				let n = l ? 360 : 368 + Math.max(320, s.getBoundingClientRect().width), r = Math.max(220, i.getBoundingClientRect().width - 8 - n);
				t.onPreview(t.kind, Math.min(r, Math.max(220, f + e.clientX - u)));
			} else if (t.kind === "chatWidth") {
				let n = Math.max(320, o.getBoundingClientRect().width - 360 - 8);
				t.onPreview(t.kind, Math.min(n, Math.max(320, p - (e.clientX - u))));
			} else {
				let n = Math.max(120, a.getBoundingClientRect().height - 250);
				t.onPreview(t.kind, Math.min(n, Math.max(84, m - (e.clientY - d))));
			}
		}, _ = () => {
			r.classList.remove("dragging"), document.body.classList.remove(h), window.removeEventListener("pointermove", g), window.removeEventListener("pointerup", _), window.removeEventListener("pointercancel", _), n = null, t.onCommit(t.kind);
		};
		n = _, window.addEventListener("pointermove", g), window.addEventListener("pointerup", _, { once: !0 }), window.addEventListener("pointercancel", _, { once: !0 });
	}
	var i = xe();
	g(() => {
		I(i, "id", t.id), j(i, 1, `resize-handle ${t.className}`), I(i, "aria-orientation", t.kind === "sidebarAttentionHeight" ? "horizontal" : "vertical"), I(i, "aria-label", t.label);
	}), h("pointerdown", i, r), F(e, i), l();
}
p(["pointerdown"]);
//#endregion
//#region src/components/ProjectTree.svelte
var Ce = P("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), we = P("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Te = P("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Ee = P("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), De = P("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Oe = P("<div class=\"task-group\"></div>"), ke = P("<button type=\"button\"><span><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), Ae = P("<section class=\"tree-section\" data-component-owner=\"project-tree\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section>");
function je(n, i) {
	C(i, !0);
	let u = o(null), d = o(null), f = o(y(i.identity));
	J(() => {
		i.identity !== c(f) && (x(f, i.identity, !0), D());
	}), R(D);
	function p(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function m(e) {
		return !c(d) || c(d).id !== e ? "" : c(d).after ? "drop-after" : "drop-before";
	}
	function _(e) {
		return !c(u) || c(u).id === e.id || c(u).kind !== e.kind ? !1 : e.kind !== "task" || c(u).projectId === e.projectId;
	}
	function v(e, t) {
		e.stopPropagation(), x(u, t, !0), x(d, null), i.onDragState(t), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", t.id));
	}
	function T(e, t) {
		if (!_(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		x(d, {
			id: t.id,
			after: e.clientY > n.top + n.height / 2
		}, !0);
	}
	async function E(e, t) {
		if (e.preventDefault(), !c(u) || !_(t)) return;
		let n = c(u), r = c(d)?.id === t.id && c(d).after;
		D();
		try {
			await i.onReorder(n, t, r);
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function D() {
		c(u) && i.onDragState(null), x(u, null), x(d, null);
	}
	async function O(e, t) {
		let n = e.target instanceof Element ? e.target : null;
		if (!n?.closest(".drag-handle")) try {
			t.type === "project" && n?.closest("[data-project-toggle]") ? (e.currentTarget?.blur(), await i.onToggle(t.id)) : (e.detail > 0 && e.currentTarget?.blur(), await i.onSelect(t.id));
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function k(e, t) {
		e.preventDefault(), e.stopPropagation(), e instanceof MouseEvent && e.currentTarget?.blur();
		try {
			await i.onToggleAttention(t.id, !t.followed);
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function A(e, t) {
		(e.key === "Enter" || e.key === " ") && k(e, t);
	}
	var M = Ae(), N = t(M), P = s(t(N)), L = t(P);
	U(L, { name: "plus" }), w(P), w(N);
	var z = s(N, 2), B = t(z), ee = (e) => {
		var n = Ce(), r = t(n);
		U(r, {
			name: "loader-circle",
			className: "empty-state-icon"
		}), S(2), w(n), F(e, n);
	}, V = (e) => {
		var n = we(), a = t(n);
		U(a, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var o = s(a, 2), c = t(o, !0);
		w(o), w(n), g(() => r(c, i.error)), F(e, n);
	}, H = (e) => {
		var n = Te(), r = t(n);
		U(r, {
			name: "folder-search",
			className: "empty-state-icon"
		}), S(2), w(n), F(e, n);
	}, W = (n) => {
		var o = e(), l = b(o);
		q(l, 17, () => i.projects, (e) => e.id, (e, n) => {
			var i = ke(), o = b(i), l = t(o);
			let d;
			var f = t(l), _ = (e) => {
				U(e, { name: "chevron-right" });
			};
			K(f, (e) => {
				c(n).children.length && e(_);
			}), w(l);
			var y = s(l, 2);
			fe(y, { get status() {
				return c(n).status;
			} });
			var x = s(y, 2);
			U(x, {
				name: "folder",
				className: "tree-icon"
			});
			var S = s(x, 2), C = t(S), M = t(C, !0);
			w(C);
			var N = s(C), P = t(N, !0);
			w(N);
			var L = s(N), R = (e) => {
				var i = Ee(), a = t(i), o = t(a, !0);
				w(a);
				var l = s(a, 2), u = t(l, !0);
				w(l), w(i), g(() => {
					r(o, c(n).summary.taskLabel), r(u, c(n).summary.runningLabel);
				}), F(e, i);
			};
			K(L, (e) => {
				c(n).summary && !c(n).expanded && e(R);
			}), w(S);
			var z = s(S, 2);
			let B;
			var ee = t(z);
			U(ee, { name: "star" }), w(z);
			var V = s(z, 2), H = t(V);
			U(H, {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), w(V), w(o);
			var W = s(o, 2), G = (e) => {
				var i = Oe();
				q(i, 21, () => c(n).children, (e) => e.id, (e, i) => {
					var o = De(), l = s(t(o), 2);
					fe(l, { get status() {
						return c(i).status;
					} });
					var d = s(l, 2);
					U(d, {
						name: "file-text",
						className: "tree-icon"
					});
					var f = s(d), _ = t(f), y = t(_, !0);
					w(_);
					var b = s(_), x = t(b, !0);
					w(b), w(f);
					var S = s(f, 2);
					let C;
					var M = t(S);
					U(M, { name: "star" }), w(S);
					var N = s(S, 2), P = t(N);
					U(P, {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), w(N), w(o), g((e) => {
						j(o, 1, e), I(o, "aria-label", c(i).ariaLabel || void 0), I(o, "title", c(i).statusLabel || void 0), r(y, c(i).title), r(x, c(i).ref), C = j(S, 1, "attention-star", null, C, { followed: c(i).followed }), I(S, "aria-checked", c(i).followed), I(S, "aria-label", c(i).followed ? `Unfollow ${c(i).title}` : `Follow ${c(i).title}`), I(S, "title", c(i).followed ? "Unfollow" : "Follow");
					}, [() => `tree-item task-item ${p(c(i).status)} ${c(i).active ? "active" : ""} ${c(u)?.id === c(i).id ? "drag-source" : ""} ${m(c(i).id)}`]), h("click", o, (e) => O(e, c(i))), a("dragover", o, (e) => T(e, {
						kind: "task",
						id: c(i).id,
						projectId: c(n).id
					})), a("drop", o, (e) => E(e, {
						kind: "task",
						id: c(i).id,
						projectId: c(n).id
					})), h("click", S, (e) => k(e, c(i))), h("keydown", S, (e) => A(e, c(i))), a("dragstart", N, (e) => v(e, {
						kind: "task",
						id: c(i).id,
						projectId: c(n).id
					})), a("dragend", N, D), F(e, o);
				}), w(i), F(e, i);
			};
			K(W, (e) => {
				c(n).expanded && e(G);
			}), g((e) => {
				j(o, 1, e), I(o, "aria-label", c(n).ariaLabel || void 0), I(o, "title", c(n).statusLabel || void 0), d = j(l, 1, "chevron", null, d, { expanded: c(n).expanded }), I(l, "data-project-toggle", c(n).children.length ? c(n).id : void 0), r(M, c(n).title), r(P, c(n).ref), B = j(z, 1, "attention-star", null, B, { followed: c(n).followed }), I(z, "aria-checked", c(n).followed), I(z, "aria-label", c(n).followed ? `Unfollow ${c(n).title}` : `Follow ${c(n).title}`), I(z, "title", c(n).followed ? "Unfollow" : "Follow");
			}, [() => `tree-item ${p(c(n).status)} ${c(n).active ? "active" : ""} ${c(u)?.id === c(n).id ? "drag-source" : ""} ${m(c(n).id)}`]), h("click", o, (e) => O(e, c(n))), a("dragover", o, (e) => T(e, {
				kind: "project",
				id: c(n).id,
				projectId: ""
			})), a("drop", o, (e) => E(e, {
				kind: "project",
				id: c(n).id,
				projectId: ""
			})), h("click", z, (e) => k(e, c(n))), h("keydown", z, (e) => A(e, c(n))), a("dragstart", V, (e) => v(e, {
				kind: "project",
				id: c(n).id,
				projectId: ""
			})), a("dragend", V, D), F(e, i);
		}), F(n, o);
	};
	K(B, (e) => {
		i.loading ? e(ee) : i.error ? e(V, 1) : i.projects.length === 0 ? e(H, 2) : e(W, -1);
	}), w(z), w(M), g(() => I(z, "data-navigation-identity", i.identity)), h("click", P, function(...e) {
		i.onCreate?.apply(this, e);
	}), F(n, M), l();
}
p(["click", "keydown"]);
//#endregion
//#region src/components/SchedulerNav.svelte
var Me = P("<section class=\"scheduler-nav\" data-component-owner=\"scheduler-nav\"><button type=\"button\"><!> <!> <span><strong>Scheduler</strong><small>Natural-language schedules</small></span> <!></button></section>");
function Ne(e, n) {
	C(n, !0);
	async function r() {
		if (n.item) try {
			await n.onSelect(n.item.id);
		} catch (e) {
			n.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var i = Me(), a = t(i);
	let o;
	var c = t(a), u = (e) => {
		fe(e, { get status() {
			return n.item.status;
		} });
	};
	K(c, (e) => {
		n.item && e(u);
	});
	var d = s(c, 2);
	U(d, {
		name: "clock-3",
		className: "scheduler-nav-icon"
	});
	var f = s(d, 4);
	U(f, {
		name: "chevron-right",
		className: "scheduler-nav-chevron"
	}), w(a), w(i), g(() => {
		a.disabled = !n.item, I(a, "title", n.item?.statusLabel || "Workspace Scheduler"), o = j(a, 1, "", null, o, { active: n.item?.active });
	}), h("click", a, r), F(e, i), l();
}
p(["click"]);
//#endregion
//#region src/components/WorkspaceSwitcher.svelte
var Pe = P("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), Fe = P("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), Ie = P("<section class=\"workspace-switcher\" data-component-owner=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <span class=\"workspace-switcher-icon workspace-switcher-icon-idle\"><!></span><span class=\"workspace-switcher-icon workspace-switcher-icon-busy\"><!></span></button> <!></div></section>");
function Le(e, n) {
	C(n, !0);
	let i = o(!1), a = o(""), d = o(y(n.identity)), f = u(() => n.workspaces.find((e) => e.id === n.activeWorkspaceId) ?? null);
	J(() => {
		n.identity !== c(d) && (x(d, n.identity, !0), x(i, !1), x(a, ""));
	}), V(() => {
		let e = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			c(i) && !t?.closest(".workspace-select-row") && x(i, !1);
		}, t = (e) => {
			e.key === "Escape" && !n.mobileSidebarOpen && x(i, !1);
		};
		return document.addEventListener("mousedown", e), document.addEventListener("keydown", t), () => {
			document.removeEventListener("mousedown", e), document.removeEventListener("keydown", t);
		};
	});
	async function p(e) {
		if (!(!e || c(a))) {
			x(a, e, !0), x(i, !1);
			try {
				await n.onSwitch(e);
			} catch (e) {
				n.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				x(a, "");
			}
		}
	}
	var m = Ie(), _ = t(m), v = t(_);
	let b;
	var T = t(v), E = t(T);
	w(T);
	var D = s(T, 2), O = t(D, !0);
	w(D);
	var k = s(D, 2), A = t(k);
	U(A, {
		name: "chevrons-up-down",
		className: "select-icon"
	}), w(k);
	var M = s(k), N = t(M);
	U(N, {
		name: "loader-circle",
		className: "select-icon"
	}), w(M), w(v);
	var P = s(v, 2), L = (e) => {
		var o = Fe(), l = s(t(o), 2);
		q(l, 17, () => n.workspaces, (e) => e.id, (e, i) => {
			var o = Pe(), l = t(o), u = t(l);
			w(l);
			var d = s(l, 2), f = t(d), m = t(f, !0);
			w(f);
			var _ = s(f), v = t(_, !0);
			w(_), w(d);
			var y = s(d, 2), b = (e) => {
				U(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			K(y, (e) => {
				c(i).id === n.activeWorkspaceId && e(b);
			}), w(o), g((e) => {
				I(o, "aria-selected", c(i).id === n.activeWorkspaceId), I(o, "data-workspace-id", c(i).id), o.disabled = e, I(u, "src", c(i).iconSrc), r(m, c(i).name || c(i).id), r(v, c(i).path);
			}, [() => !!c(a)]), h("click", o, () => p(c(i).id)), F(e, o);
		});
		var u = s(l, 2), d = t(u), f = t(d);
		U(f, { name: "plus" }), S(), w(d), w(u), w(o), h("click", d, () => {
			x(i, !1), n.onAdd();
		}), F(e, o);
	};
	K(P, (e) => {
		c(i) && e(L);
	}), w(_), w(m), g((e) => {
		b = j(v, 1, "workspace-switcher-button", null, b, e), I(v, "aria-expanded", c(i)), I(E, "src", c(f)?.iconSrc || "/favicon.svg"), r(O, c(f)?.name || "Workspace");
	}, [() => ({ busy: !!c(a) })]), h("click", v, (e) => {
		e.stopPropagation(), x(i, !c(i));
	}), F(e, m), l();
}
p(["click"]);
//#endregion
//#region src/components/AppShell.svelte
var Re = P("<button id=\"doctorButton\" type=\"button\" title=\"Workspace problems\"><!><span> </span></button>"), ze = P("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><!><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div class=\"chat-panel\"><!><div id=\"chatTimeline\" class=\"chat-timeline\" data-component-owner=\"event-timeline\"><!></div><div id=\"chatComposer\" class=\"chat-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div> <!>", 1);
function Be(n, i) {
	C(i, !0);
	let a = o(y(i.channel.current())), d = o(0), f = o(!1);
	V(() => {
		let e = i.channel.subscribe((e) => {
			x(a, e, !0), queueMicrotask(e.onIconsChanged);
		}), t = (e) => {
			e.key === "Escape" && c(a).mobile.sidebarOpen && c(a).onMobileSidebar(!1);
		}, n = () => {
			c(a).onHistoryNavigation(window.location.pathname).catch((e) => {
				c(a).onToast(e instanceof Error ? e.message : String(e));
			});
		}, r = window.visualViewport, o = /* @__PURE__ */ new Set(), s = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 980px)") : {
			matches: !1,
			addEventListener: () => void 0,
			removeEventListener: () => void 0
		}, l = () => {
			let e = document.documentElement;
			if (!s.matches || !r) {
				e.style.removeProperty("--app-viewport-height"), e.style.removeProperty("--app-viewport-offset-top"), e.style.removeProperty("--app-viewport-offset-left");
				return;
			}
			e.style.setProperty("--app-viewport-height", `${r.height}px`), e.style.setProperty("--app-viewport-offset-top", `${r.offsetTop}px`), e.style.setProperty("--app-viewport-offset-left", `${r.offsetLeft}px`);
		}, u = () => {
			(window.scrollX !== 0 || window.scrollY !== 0) && window.scrollTo(0, 0), l();
		}, d = () => {
			for (let e of o) window.clearTimeout(e);
			o.clear();
		}, f = (e) => {
			let t = window.setTimeout(() => {
				o.delete(t), u();
			}, e);
			o.add(t);
		}, p = () => {
			d(), f(0), f(300);
		}, m = () => {
			c(a).onPaneViewport(), l();
		};
		return document.addEventListener("keydown", t), document.addEventListener("focusout", p), window.addEventListener("resize", m), window.addEventListener("orientationchange", p), window.addEventListener("popstate", n), r?.addEventListener("resize", l), r?.addEventListener("scroll", l), s.addEventListener?.("change", m), l(), () => {
			e(), document.removeEventListener("keydown", t), document.removeEventListener("focusout", p), window.removeEventListener("resize", m), window.removeEventListener("orientationchange", p), window.removeEventListener("popstate", n), r?.removeEventListener("resize", l), r?.removeEventListener("scroll", l), s.removeEventListener?.("change", m), d(), document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
		};
	}), J(() => {
		document.body.classList.toggle("mobile-sidebar-open", c(a).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", c(a).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", c(a).mobile.immersive);
	}), J(() => {
		let e = c(a).route;
		!e.path || e.revision <= c(d) || (x(d, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	var p = ze(), m = b(p), _ = t(m);
	be(_, {
		get sidebarOpen() {
			return c(a).mobile.sidebarOpen;
		},
		get view() {
			return c(a).mobile.view;
		},
		get immersive() {
			return c(a).mobile.immersive;
		},
		get onSidebar() {
			return c(a).onMobileSidebar;
		},
		get onView() {
			return c(a).onMobileView;
		},
		get onImmersive() {
			return c(a).onMobileImmersive;
		}
	});
	var v = s(_, 2), S = t(v), T = s(t(S)), E = s(t(T)), D = t(E, !0);
	w(E), w(T);
	var O = s(T), k = (e) => {
		var n = Re();
		let i;
		var o = t(n);
		{
			let e = u(() => c(a).doctor.summary.errors > 0 ? "circle-alert" : "triangle-alert");
			U(o, { get name() {
				return c(e);
			} });
		}
		var l = s(o), d = t(l, !0);
		w(l), w(n), g(() => {
			i = j(n, 1, "brand-doctor", null, i, { "has-errors": c(a).doctor.summary.errors > 0 }), I(n, "aria-label", `${c(a).doctor.summary.errors} errors and ${c(a).doctor.summary.warnings} warnings`), r(d, c(a).doctor.summary.errors + c(a).doctor.summary.warnings);
		}), h("click", n, () => {
			c(a).onMobileSidebar(!1), x(f, !0);
		}), F(e, n);
	};
	K(O, (e) => {
		(c(a).doctor.summary.errors + c(a).doctor.summary.warnings > 0 || c(a).doctor.error) && e(k);
	});
	var A = s(O), M = t(A);
	U(M, { name: "settings" }), w(A), w(S);
	var N = s(S, 2);
	Le(N, {
		get identity() {
			return c(a).identity;
		},
		get mobileSidebarOpen() {
			return c(a).mobile.sidebarOpen;
		},
		get activeWorkspaceId() {
			return c(a).activeWorkspaceId;
		},
		get workspaces() {
			return c(a).workspaces;
		},
		get onSwitch() {
			return c(a).onSwitchWorkspace;
		},
		get onAdd() {
			return c(a).onAddWorkspace;
		},
		get onToast() {
			return c(a).onToast;
		}
	});
	var P = s(N, 2);
	{
		let e = u(() => c(a).scheduler || null);
		Ne(P, {
			get item() {
				return c(e);
			},
			get onSelect() {
				return c(a).onSelectResource;
			},
			get onToast() {
				return c(a).onToast;
			}
		});
	}
	var L = s(P, 2);
	je(L, {
		get identity() {
			return c(a).identity;
		},
		get loading() {
			return c(a).loading;
		},
		get error() {
			return c(a).error;
		},
		get projects() {
			return c(a).projects;
		},
		get onCreate() {
			return c(a).onCreateProject;
		},
		get onToggle() {
			return c(a).onToggleProject;
		},
		get onSelect() {
			return c(a).onSelectResource;
		},
		get onReorder() {
			return c(a).onReorder;
		},
		get onDragState() {
			return c(a).onDragState;
		},
		get onToggleAttention() {
			return c(a).onToggleAttention;
		},
		get onToast() {
			return c(a).onToast;
		}
	});
	var R = s(L, 2);
	Se(R, {
		id: "activityResize",
		kind: "sidebarAttentionHeight",
		className: "horizontal-resize sidebar-activity-resize",
		label: "Resize activity panel",
		get onPreview() {
			return c(a).onPanePreview;
		},
		get onCommit() {
			return c(a).onPaneCommit;
		}
	}), ve(s(R, 2), {
		get items() {
			return c(a).attentionList;
		},
		get onSelect() {
			return c(a).onSelectResource;
		},
		get onToggleAttention() {
			return c(a).onToggleAttention;
		},
		get onDismiss() {
			return c(a).onDismissAttention;
		},
		get onToast() {
			return c(a).onToast;
		}
	}), w(v);
	var z = s(v, 2);
	Se(z, {
		id: "sidebarResize",
		kind: "sidebarWidth",
		className: "sidebar-resize",
		label: "Resize sidebar",
		get onPreview() {
			return c(a).onPanePreview;
		},
		get onCommit() {
			return c(a).onPaneCommit;
		}
	});
	var B = s(z, 2), ee = t(B), H = t(ee), W = t(H);
	U(W, { name: "menu" }), w(H), w(ee);
	var G = s(ee, 2), q = t(G), Y = t(q), ne = s(Y, 2);
	w(q), w(G);
	var re = s(G, 2), ie = t(re), ae = (t) => {
		var n = e(), r = b(n);
		te(r, () => i.details), F(t, n);
	};
	K(ie, (e) => {
		i.details && e(ae);
	}), w(re);
	var oe = s(re, 2);
	Se(oe, {
		id: "detailsResize",
		kind: "chatWidth",
		className: "details-resize",
		label: "Resize chat panel",
		get onPreview() {
			return c(a).onPanePreview;
		},
		get onCommit() {
			return c(a).onPaneCommit;
		}
	});
	var se = s(oe, 2), ce = t(se), ue = t(ce), de = (t) => {
		var n = e(), r = b(n);
		te(r, () => i.agentHeader), F(t, n);
	};
	K(ue, (e) => {
		i.agentHeader && e(de);
	});
	var fe = s(ue), pe = t(fe), me = (t) => {
		var n = e(), r = b(n);
		te(r, () => i.timeline), F(t, n);
	};
	K(pe, (e) => {
		i.timeline && e(me);
	}), w(fe);
	var he = s(fe), ge = t(he), _e = (t) => {
		var n = e(), r = b(n);
		te(r, () => i.composer), F(t, n);
	};
	K(ge, (e) => {
		i.composer && e(_e);
	}), w(he), w(ce), w(se), w(B), w(m);
	var ye = s(m, 2), xe = (e) => {
		le(e, {
			get snapshot() {
				return c(a).doctor;
			},
			onClose: () => {
				x(f, !1);
			},
			get onRefresh() {
				return c(a).onRefreshDoctor;
			},
			get onIconsChanged() {
				return c(a).onIconsChanged;
			}
		});
	};
	K(ye, (e) => {
		c(f) && e(xe);
	}), g(() => {
		r(D, c(a).version), I(H, "aria-expanded", c(a).mobile.sidebarOpen), I(Y, "aria-selected", c(a).mobile.view === "details"), I(ne, "aria-selected", c(a).mobile.view === "chat");
	}), h("click", A, () => {
		c(a).onMobileSidebar(!1), c(a).onOpenSettings();
	}), h("click", H, () => c(a).onMobileSidebar(!0)), h("click", Y, () => c(a).onMobileView("details")), h("click", ne, () => c(a).onMobileView("chat")), F(n, p), l();
}
p(["click"]);
//#endregion
//#region src/components/AgentPanelHeader.svelte
var Ve = P("<span class=\"agent-header-queued\"> </span>"), He = P("<span class=\"agent-header-model\"> </span>"), Ue = P("<span class=\"agent-header-turn\"> </span>"), We = P("<header class=\"agent-panel-header\" data-component-owner=\"agent-panel-header\"><div class=\"agent-header-left\"><span class=\"agent-status-dot\" aria-hidden=\"true\"></span> <span class=\"agent-header-name\"> </span> <span class=\"agent-header-state\"> </span> <!></div> <div class=\"agent-header-right\"><!> <!></div></header>");
function Ge(e, n) {
	C(n, !0);
	let i = o(y(n.channel.current())), a = o(y(Date.now()));
	V(() => n.channel.subscribe((e) => {
		x(i, e, !0);
	}));
	let d = u(() => c(i).resourceId ? c(i).submitting ? "submitting" : c(i).status?.state || "loading" : "empty"), f = u(() => c(d) === "submitting" ? "Submitting" : c(d) === "working" ? "Working" : c(d) === "idle" ? "Idle" : c(d) === "attention_required" ? "Attention required" : c(d) === "unavailable" ? "Unavailable" : c(d) === "archived" ? "Archived" : c(d) === "loading" ? "Loading" : "No resource selected"), p = u(() => c(i).status?.waitingMessages?.length || 0), m = u(() => Date.parse(c(i).turnStartedAt || "")), h = u(() => c(d) === "working" && Number.isFinite(c(m)));
	J(() => {
		if (!c(h)) return;
		x(a, Date.now(), !0);
		let e = window.setInterval(() => {
			x(a, Date.now(), !0);
		}, 1e3);
		return () => window.clearInterval(e);
	});
	function _(e) {
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
	let b = u(() => {
		let e = c(i).turnNumber;
		if (c(d) === "submitting") return "Message pending";
		if (c(d) === "idle") {
			if (e <= 0) return "";
			let t = v(String(c(i).status?.generation?.completionState || "").trim().toLowerCase());
			return `Idle · Turn ${e} ${t}${t !== "completed" && c(i).status?.generation?.completionHasFinalReply === !1 ? " · no final reply" : ""}`;
		}
		if (c(d) === "empty" || c(d) === "loading") return "";
		if (Number.isFinite(c(m))) {
			let t = _(Math.floor((c(a) - c(m)) / 1e3));
			return e > 0 ? `Turn ${e} · ${t}` : t;
		}
		return e > 0 ? `Turn ${e}` : "";
	});
	var S = We(), T = t(S), E = s(t(T), 2), D = t(E, !0);
	w(E);
	var O = s(E, 2), k = t(O, !0);
	w(O);
	var A = s(O, 2), j = (e) => {
		var n = Ve(), i = t(n);
		w(n), g(() => r(i, `· ${c(p) ?? ""} queued`)), F(e, n);
	};
	K(A, (e) => {
		c(p) > 0 && e(j);
	}), w(T);
	var M = s(T, 2), N = t(M), P = (e) => {
		var n = He(), a = t(n, !0);
		w(n), g(() => r(a, c(i).modelSummary)), F(e, n);
	};
	K(N, (e) => {
		c(i).modelSummary && e(P);
	});
	var L = s(N, 2), R = (e) => {
		var n = Ue(), i = t(n, !0);
		w(n), g(() => r(i, c(b))), F(e, n);
	};
	K(L, (e) => {
		c(b) && e(R);
	}), w(M), w(S), g(() => {
		I(S, "data-state", c(d)), r(D, c(i).agentName), r(k, c(f));
	}), F(e, S), l();
}
//#endregion
//#region src/components/AgentBindingSelector.svelte
var Ke = P("<div class=\"agent-binding-divider\"></div>"), qe = P("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Inherit\"><button type=\"button\" class=\"agent-binding-option\" role=\"option\" data-binding=\"inherit\"><span class=\"agent-binding-option-primary\"> </span> <span class=\"agent-binding-option-secondary\"></span> <!></button></div> <!>", 1), Je = P("<button type=\"button\" class=\"agent-binding-option\" role=\"option\"><span class=\"agent-binding-option-primary\"> </span> <span class=\"agent-binding-option-secondary\"> </span> <!></button>"), Ye = P("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Profiles\"><div class=\"agent-binding-group-title\">Profiles</div> <!></div>"), Xe = P("<!> <div class=\"agent-binding-group\" role=\"group\" aria-label=\"Agents\"><div class=\"agent-binding-group-title\">Agents</div> <!></div>", 1), Ze = P("<div class=\"agent-binding-menu\" role=\"listbox\" tabindex=\"-1\"><!> <!> <!></div>"), Qe = P("<span class=\"agent-binding\" data-component-owner=\"agent-binding-selector\"><button type=\"button\" class=\"agent-binding-button\" aria-haspopup=\"listbox\"><span class=\"agent-binding-label\"> </span> <!></button> <!></span>");
function $e(e, n) {
	C(n, !0);
	let i = N(n, "disabled", 3, !1), a = N(n, "ariaLabel", 3, "Agent binding"), f = N(n, "openUp", 3, !0), p = N(n, "allowInherit", 3, !1), m = N(n, "inheritLabel", 3, "Inherit"), _ = u(L), v = u(R), y = u(() => p() && !n.value.name), S = u(() => c(y) ? "inherit" : z(n.value)), T = u(() => c(y) ? m() : [...c(_), ...c(v)].find((e) => z(e.value) === c(S))?.label || n.value.name || "Unavailable"), D = o(!1), O = o(void 0), k = o(void 0);
	J(() => {
		if (!c(D) || !c(k)) return;
		c(_), c(v), A(), j();
		let e = c(k).querySelector("[aria-selected=\"true\"]") ?? c(k).querySelector(".agent-binding-option");
		d().then(() => e?.focus());
	}), V(() => {
		let e = (e) => {
			c(D) && e.target instanceof Node && !c(O)?.contains(e.target) && x(D, !1);
		}, t = () => {
			c(D) && A();
		};
		return document.addEventListener("mousedown", e), window.addEventListener("resize", t), () => {
			document.removeEventListener("mousedown", e), window.removeEventListener("resize", t);
		};
	});
	function A() {
		if (!c(O) || !c(k)) return;
		let e = c(O).getBoundingClientRect(), t = f() ? e.top - 14 : window.innerHeight - e.bottom - 14;
		c(k).style.maxHeight = `${Math.max(120, Math.floor(t))}px`;
	}
	function j() {
		if (!c(k)) return;
		c(k).style.removeProperty("--binding-primary-width"), c(k).style.removeProperty("--binding-secondary-width");
		let e = 0, t = 0;
		c(k).querySelectorAll(".agent-binding-option-primary").forEach((t) => {
			e = Math.max(e, t.getBoundingClientRect().width);
		}), c(k).querySelectorAll(".agent-binding-option-secondary").forEach((e) => {
			t = Math.max(t, e.getBoundingClientRect().width);
		}), e > 0 && c(k).style.setProperty("--binding-primary-width", `${Math.ceil(e)}px`), t > 0 && c(k).style.setProperty("--binding-secondary-width", `${Math.ceil(t)}px`);
	}
	function M(e) {
		return e.trim().toLowerCase();
	}
	function P(e) {
		return n.agents.find((t) => M(t.id) === M(e))?.label || e || "Unavailable";
	}
	function L() {
		let e = n.profiles.map((e) => ({
			value: {
				kind: "profile",
				name: e.key
			},
			label: `${e.key} (current: ${P(e.agentName || "")})`,
			primary: e.key,
			secondary: P(e.agentName || "")
		}));
		return n.value.name && n.value.kind === "profile" && !n.profiles.some((e) => M(e.key) === M(n.value.name)) && e.unshift({
			value: n.value,
			label: `${n.value.name} (missing profile)`,
			primary: n.value.name,
			secondary: "missing profile"
		}), e;
	}
	function R() {
		let e = n.agents.map((e) => {
			let t = n.profiles.filter((t) => M(t.agentName || "") === M(e.id)).map((e) => e.key);
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
		return n.value.name && n.value.kind === "agent" && !n.agents.some((e) => M(e.id) === M(n.value.name)) && e.unshift({
			value: n.value,
			label: `${n.value.name} (missing agent)`,
			primary: n.value.name,
			secondary: "missing agent"
		}), e;
	}
	function z(e) {
		return `${e.kind}:${encodeURIComponent(e.name)}`;
	}
	function B(e) {
		x(D, !1), (p() && !e.value.name ? "inherit" : z(e.value)) !== c(S) && n.onSelect(e.value);
	}
	function ee(e) {
		e.key === "Escape" && (e.stopPropagation(), x(D, !1));
	}
	var H = Qe(), W = t(H), G = t(W), te = t(G, !0);
	w(G);
	var Y = s(G, 2);
	U(Y, {
		name: "chevrons-up-down",
		className: "agent-binding-icon"
	}), w(W);
	var ne = s(W, 2), re = (e) => {
		var n = Ze(), i = t(n), o = (e) => {
			var n = qe(), i = b(n), a = t(i), o = t(a), l = t(o, !0);
			w(o);
			var d = s(o, 4);
			{
				let e = u(() => c(y) ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden");
				U(d, {
					name: "check",
					get className() {
						return c(e);
					}
				});
			}
			w(a), w(i);
			var f = s(i, 2), p = (e) => {
				var t = Ke();
				F(e, t);
			};
			K(f, (e) => {
				(c(_).length || c(v).length) && e(p);
			}), g(() => {
				I(a, "aria-selected", c(y)), r(l, m());
			}), h("click", a, () => B({
				value: {
					kind: "profile",
					name: ""
				},
				label: m(),
				primary: m(),
				secondary: ""
			})), F(e, n);
		};
		K(i, (e) => {
			p() && e(o);
		});
		var l = s(i, 2), d = (e) => {
			var n = Ye(), i = s(t(n), 2);
			q(i, 17, () => c(_), (e) => z(e.value), (e, n) => {
				var i = Je(), a = t(i), o = t(a, !0);
				w(a);
				var l = s(a, 2), d = t(l, !0);
				w(l);
				var f = s(l, 2);
				{
					let e = u(() => z(c(n).value) === c(S) ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden");
					U(f, {
						name: "check",
						get className() {
							return c(e);
						}
					});
				}
				w(i), g((e, t) => {
					I(i, "aria-selected", e), I(i, "data-binding", t), r(o, c(n).primary), r(d, c(n).secondary);
				}, [() => z(c(n).value) === c(S), () => z(c(n).value)]), h("click", i, () => B(c(n))), F(e, i);
			}), w(n), F(e, n);
		};
		K(l, (e) => {
			c(_).length && e(d);
		});
		var f = s(l, 2), C = (e) => {
			var n = Xe(), i = b(n), a = (e) => {
				var t = Ke();
				F(e, t);
			};
			K(i, (e) => {
				c(_).length && e(a);
			});
			var o = s(i, 2), l = s(t(o), 2);
			q(l, 17, () => c(v), (e) => z(e.value), (e, n) => {
				var i = Je(), a = t(i), o = t(a, !0);
				w(a);
				var l = s(a, 2), d = t(l, !0);
				w(l);
				var f = s(l, 2);
				{
					let e = u(() => z(c(n).value) === c(S) ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden");
					U(f, {
						name: "check",
						get className() {
							return c(e);
						}
					});
				}
				w(i), g((e, t) => {
					I(i, "aria-selected", e), I(i, "data-binding", t), r(o, c(n).primary), r(d, c(n).secondary);
				}, [() => z(c(n).value) === c(S), () => z(c(n).value)]), h("click", i, () => B(c(n))), F(e, i);
			}), w(o), F(e, n);
		};
		K(f, (e) => {
			c(v).length && e(C);
		}), w(n), E(n, (e) => x(k, e), () => c(k)), g(() => I(n, "aria-label", a())), h("keydown", n, ee), F(e, n);
	};
	K(ne, (e) => {
		c(D) && e(re);
	}), w(H), E(H, (e) => x(O, e), () => c(O)), g(() => {
		I(H, "data-placement", f() ? "up" : "down"), W.disabled = i(), I(W, "aria-expanded", c(D)), I(W, "aria-label", a()), r(te, c(T));
	}), h("click", W, () => {
		x(D, !c(D));
	}), F(e, H), l();
}
p(["click", "keydown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var et = P("<div class=\"chat-turn-stop-notice\" role=\"status\"><span> </span> <button type=\"button\" class=\"chat-turn-stop-dismiss\" aria-label=\"Dismiss turn stop notice\">Dismiss</button></div>"), tt = P("<div class=\"chat-message-item\"><span class=\"chat-message-text\"> </span> <span class=\"chat-message-mode\"> </span> <button type=\"button\" class=\"chat-message-steer\"><!> <span>Insert now</span></button></div>"), nt = P("<div class=\"chat-message-queue-error\" role=\"alert\"> </div>"), rt = P("<section class=\"chat-message-queue\" aria-label=\"Waiting messages\"><div class=\"chat-message-queue-header\"><span>Waiting messages</span><span class=\"chat-message-count\"> </span></div> <div class=\"chat-message-list\"></div> <!></section>"), it = P("<div class=\"chat-send-feedback\" data-send-state=\"submitting\" role=\"status\" aria-live=\"polite\"><!> <span class=\"chat-send-feedback-content\"><strong>Submitting</strong><span class=\"chat-send-feedback-text\"> </span></span></div>"), at = P("<button type=\"button\" id=\"agentEndTurnButton\" title=\"End current turn\" aria-label=\"End current turn\"><span class=\"chat-composer-icon chat-composer-icon-idle\"><!></span><span class=\"chat-composer-icon chat-composer-icon-busy\"><!></span></button>"), ot = P("<button type=\"button\" id=\"agentEndGenerationButton\" title=\"End current generation\" aria-label=\"End current generation\"><span class=\"chat-composer-icon chat-composer-icon-idle\"><!></span><span class=\"chat-composer-icon chat-composer-icon-busy\"><!></span></button>"), st = P("<div class=\"chat-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), ct = P("<!> <!> <!> <form id=\"chatForm\" class=\"chat-input\"><textarea id=\"chatInput\" rows=\"1\" autocomplete=\"off\"></textarea> <div class=\"chat-composer-bar\"><button type=\"button\" id=\"agentUploadButton\" class=\"chat-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button> <div class=\"chat-composer-options\"><span class=\"chat-agent-binding\"><!></span> <!> <button type=\"submit\"><span class=\"chat-composer-icon chat-composer-icon-idle\"><!></span><span class=\"chat-composer-icon chat-composer-icon-busy\"><!></span></button></div></div></form> <!>", 1);
function lt(e, n) {
	C(n, !0);
	let i = n.channel.current(), f = o(y(i)), p = o(y(i.identity)), m = o(y(i.draftResetVersion)), _ = o(y(i.draft)), v = o(!1), T = o(""), D = o(""), O = o(""), A = o(!1), M = o(void 0), N = u(() => !!c(f).unavailableReason || c(v) || c(f).sending);
	V(() => n.channel.subscribe((e) => {
		c(f), x(f, e, !0), e.identity === c(p) ? e.draftResetVersion !== c(m) && (x(m, e.draftResetVersion, !0), x(_, e.draft, !0), x(D, "")) : (x(p, e.identity, !0), x(m, e.draftResetVersion, !0), x(_, e.draft, !0), x(v, !1), x(T, ""), x(D, ""), x(O, ""), x(A, !1)), queueMicrotask(e.onIconsChanged);
	})), J(() => {
		c(_), d().then(H);
	});
	function P() {
		return {
			workspaceId: c(f).workspaceId,
			resourceId: c(f).resourceId,
			draftKey: c(f).draftKey
		};
	}
	function L(e) {
		x(_, e, !0), x(D, ""), c(f).onDraft(e, P());
	}
	async function R(e) {
		e?.preventDefault();
		let t = c(_);
		if (c(N) || !t.trim() || !c(f).workspaceId || !c(f).resourceId) return;
		let n = c(p), r = P();
		x(v, !0), x(T, t, !0), x(D, "");
		try {
			let e = await c(f).onSend(t, r);
			if (c(p) !== n) return;
			if (!e.accepted) {
				x(T, ""), x(D, "Message was not accepted. Please try again.");
				return;
			}
			e.clear && c(_) === t && L(""), x(T, "");
		} catch (e) {
			c(p) === n && (x(T, ""), x(D, e instanceof Error ? e.message : String(e), !0));
		} finally {
			c(p) === n && (x(v, !1), await d(), c(M)?.focus({ preventScroll: !0 }));
		}
	}
	async function z(e) {
		if (!(!c(f).canSteerWaiting || c(f).steeringMessageId)) {
			x(O, "");
			try {
				await c(f).onSteerWaiting(e);
			} catch (e) {
				x(O, e instanceof Error ? e.message : String(e), !0);
			}
		}
	}
	function B(e) {
		if (!(e.key !== "Enter" || e.isComposing || e.keyCode === 229)) {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault(), R();
				return;
			}
			if (e.shiftKey) {
				x(A, !0);
				return;
			}
			c(A) || (e.preventDefault(), R());
		}
	}
	function H() {
		if (!c(M)) return;
		c(M).style.height = "auto";
		let e = Math.min(c(M).scrollHeight, 160);
		c(M).style.height = `${e}px`, c(M).style.overflowY = c(M).scrollHeight > 160 ? "auto" : "hidden";
	}
	function W(e) {
		c(f).onSaveAgentBinding(e);
	}
	var G = ct(), te = b(G), Y = (e) => {
		var n = et(), i = t(n), a = t(i, !0);
		w(i);
		var o = s(i, 2);
		w(n), g(() => r(a, c(f).stopNotice)), h("click", o, function(...e) {
			c(f).onDismissStopNotice?.apply(this, e);
		}), F(e, n);
	};
	K(te, (e) => {
		c(f).stopNotice && e(Y);
	});
	var ne = s(te, 2), re = (e) => {
		var n = rt(), i = t(n), a = s(t(i)), o = t(a, !0);
		w(a), w(i);
		var l = s(i, 2);
		q(l, 21, () => c(f).waitingMessages, (e) => e.messageId, (e, n) => {
			var i = tt(), a = t(i), o = t(a, !0);
			w(a);
			var l = s(a, 2), u = t(l, !0);
			w(l);
			var d = s(l, 2), p = t(d), m = (e) => {
				U(e, { name: "loader-circle" });
			}, _ = (e) => {
				U(e, { name: "corner-up-left" });
			};
			K(p, (e) => {
				c(f).steeringMessageId === c(n).messageId ? e(m) : e(_, -1);
			}), S(2), w(d), w(i), g((e) => {
				I(i, "data-message-id", c(n).messageId), I(a, "title", c(n).text), r(o, c(n).text), r(u, c(n).actualMode || c(n).requestedMode), d.disabled = e, I(d, "title", c(f).canSteerWaiting ? "Insert this waiting message into the current turn" : "Available when the current turn supports steer"), I(d, "aria-label", `Insert waiting message into current turn: ${c(n).text}`);
			}, [() => !c(f).canSteerWaiting || !!c(f).steeringMessageId]), h("click", d, () => z(c(n).messageId)), F(e, i);
		}), w(l);
		var u = s(l, 2), d = (e) => {
			var n = nt(), i = t(n, !0);
			w(n), g(() => r(i, c(O))), F(e, n);
		};
		K(u, (e) => {
			c(O) && e(d);
		}), w(n), g(() => r(o, c(f).waitingMessages.length)), F(e, n);
	};
	K(ne, (e) => {
		c(f).waitingMessages.length && e(re);
	});
	var ie = s(ne, 2), ae = (e) => {
		var n = it(), i = t(n);
		U(i, { name: "loader-circle" });
		var a = s(i, 2), o = s(t(a)), l = t(o, !0);
		w(o), w(a), w(n), g(() => r(l, c(T))), F(e, n);
	};
	K(ie, (e) => {
		c(T) && e(ae);
	});
	var oe = s(ie, 2), se = t(oe);
	ee(se), E(se, (e) => x(M, e), () => c(M));
	var ce = s(se, 2), le = t(ce), ue = t(le);
	U(ue, { name: "plus" }), w(le);
	var de = s(le, 2), fe = t(de), pe = t(fe);
	{
		let e = u(() => c(N) || c(f).bindingSaving);
		$e(pe, {
			get value() {
				return c(f).agentBinding;
			},
			get profiles() {
				return c(f).agentProfiles;
			},
			get agents() {
				return c(f).agents;
			},
			get disabled() {
				return c(e);
			},
			ariaLabel: "Binding target",
			onSelect: W
		});
	}
	w(fe);
	var me = s(fe, 2), he = (e) => {
		var n = at();
		let r;
		var i = t(n), a = t(i);
		U(a, { name: "pause" }), w(i);
		var o = s(i), l = t(o);
		U(l, { name: "loader-circle" }), w(o), w(n), g(() => {
			r = j(n, 1, "chat-composer-action chat-end-turn-button", null, r, { busy: c(f).endingTurn }), n.disabled = c(f).endingTurn;
		}), h("click", n, function(...e) {
			c(f).onEndTurn?.apply(this, e);
		}), F(e, n);
	}, ge = (e) => {
		var n = ot();
		let r;
		var i = t(n), a = t(i);
		U(a, { name: "archive" }), w(i);
		var o = s(i), l = t(o);
		U(l, { name: "loader-circle" }), w(o), w(n), g(() => {
			r = j(n, 1, "chat-composer-action chat-end-generation-button", null, r, { busy: c(f).endingGeneration }), n.disabled = c(f).endingGeneration;
		}), h("click", n, function(...e) {
			c(f).onEndGeneration?.apply(this, e);
		}), F(e, n);
	};
	K(me, (e) => {
		c(f).canEndTurn ? e(he) : c(f).canEndGeneration && e(ge, 1);
	});
	var _e = s(me, 2);
	let ve;
	var ye = t(_e), be = t(ye);
	U(be, { name: "send" }), w(ye);
	var xe = s(ye), Se = t(xe);
	U(Se, { name: "loader-circle" }), w(xe), w(_e), w(de), w(ce), w(oe);
	var Ce = s(oe, 2), we = (e) => {
		var n = st(), i = t(n), a = t(i, !0);
		w(i);
		var o = s(i);
		w(n), g(() => {
			r(a, c(D)), o.disabled = c(v);
		}), h("click", o, () => R()), F(e, n);
	};
	K(Ce, (e) => {
		c(D) && e(we);
	}), g((e) => {
		I(se, "data-agent-draft-key", c(f).draftKey), I(se, "placeholder", c(f).unavailableReason || "Message this resource"), se.disabled = c(N), k(se, c(_)), le.disabled = e, ve = j(_e, 1, "chat-send-button", null, ve, { busy: c(v) }), I(_e, "title", c(v) ? "Sending..." : c(f).unavailableReason || "Send input"), I(_e, "aria-label", c(v) ? "Sending..." : c(f).unavailableReason || "Send input"), _e.disabled = c(N);
	}, [() => !!c(f).unavailableReason]), a("submit", oe, R), h("input", se, (e) => L(e.currentTarget.value)), h("keydown", se, B), h("click", le, function(...e) {
		c(f).onOpenUpload?.apply(this, e);
	}), F(e, G), l();
}
p([
	"click",
	"input",
	"keydown"
]);
//#endregion
//#region src/components/ConfirmDialog.svelte
var ut = P("<div class=\"confirm-dialog-layer\" role=\"presentation\"><button class=\"confirm-dialog-backdrop modal-enter\" type=\"button\"></button> <div class=\"confirm-dialog modal-enter\" role=\"alertdialog\" aria-modal=\"true\"><header class=\"confirm-dialog-header\"><span><!></span> <strong> </strong></header> <div class=\"confirm-dialog-content\"><p> </p></div> <footer class=\"confirm-dialog-footer\"><button type=\"button\" class=\"secondary-button\"> </button> <button type=\"button\"> </button></footer></div></div>");
function dt(n, i) {
	C(i, !0);
	let a = o(y(i.channel.current())), d = o(void 0);
	V(() => {
		let e = i.channel.subscribe((e) => {
			let t = c(a).open;
			x(a, e, !0), e.open && !t && queueMicrotask(() => {
				c(d)?.focus({ preventScroll: !0 }), window.lucide?.createIcons({ attrs: { "stroke-width": 2 } });
			});
		}), t = (e) => {
			c(a).open && (e.key === "Escape" ? (e.preventDefault(), c(a).onResult(!1)) : e.key === "Enter" && (e.preventDefault(), c(a).onResult(!0)));
		};
		return document.addEventListener("keydown", t), () => {
			e(), document.removeEventListener("keydown", t);
		};
	});
	var f = e(), p = b(f), m = (e) => {
		var n = ut(), i = t(n), o = s(i, 2), l = t(o), f = t(l);
		let p;
		var m = t(f);
		{
			let e = u(() => c(a).danger ? "triangle-alert" : "circle-help");
			U(m, { get name() {
				return c(e);
			} });
		}
		w(f);
		var _ = s(f, 2), v = t(_, !0);
		w(_), w(l);
		var y = s(l, 2), b = t(y), S = t(b, !0);
		w(b), w(y);
		var C = s(y, 2), T = t(C), D = t(T, !0);
		w(T);
		var O = s(T, 2);
		let k;
		var A = t(O, !0);
		w(O), E(O, (e) => x(d, e), () => c(d)), w(C), w(o), w(n), g(() => {
			I(i, "aria-label", c(a).cancelLabel), I(o, "aria-label", c(a).title), p = j(f, 1, "confirm-dialog-icon", null, p, { "confirm-dialog-icon-danger": c(a).danger }), r(v, c(a).title), r(S, c(a).message), r(D, c(a).cancelLabel), k = j(O, 1, "confirm-dialog-confirm", null, k, { "confirm-dialog-confirm-danger": c(a).danger }), r(A, c(a).confirmLabel);
		}), h("click", i, () => c(a).onResult(!1)), h("click", T, () => c(a).onResult(!1)), h("click", O, () => c(a).onResult(!0)), F(e, n);
	};
	K(p, (e) => {
		c(a).open && e(m);
	}), F(n, f), l();
}
p(["click"]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var ft = P("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function pt(e, n) {
	C(n, !0);
	let r = N(n, "draft", 7);
	var i = ft(), a = t(i);
	ee(a);
	var o = s(a, 2);
	O(o), w(i), g(() => {
		k(a, r().description), k(o, r().slug);
	}), h("input", a, (e) => r().description = e.currentTarget.value), h("input", o, (e) => r().slug = e.currentTarget.value), F(e, i), l();
}
p(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var mt = P("<button type=\"button\" class=\"secondary compact\"> </button>"), ht = P("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), gt = P("<p class=\"create-task-preview-hint\">Updating preview...</p>"), _t = P("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), vt = P("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), yt = P("<small> </small>"), bt = P("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), xt = P("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), St = P("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Ct = P("<!> <!> <!>", 1), wt = P("<p class=\"create-task-blank-detail\"> </p>"), Tt = P("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), Et = P("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), Dt = P("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function Ot(e, n) {
	C(n, !0);
	let i = N(n, "draft", 7), a = o(y(i().editedMarkdown ?? "")), d = null, f = u(() => !!n.preview && c(a) !== n.preview?.markdown);
	J(() => {
		let e = n.preview?.markdown ?? null;
		if (e === d) return;
		let t = i().editedMarkdown == null || i().editedMarkdown === d;
		d = e, t && (x(a, e ?? "", !0), i().editedMarkdown = e);
	});
	function p(e) {
		x(a, e, !0), i().editedMarkdown = e;
	}
	function m() {
		x(a, n.preview?.markdown ?? "", !0), i().editedMarkdown = n.preview?.markdown ?? null;
	}
	var _ = Dt(), v = t(_), S = s(t(v), 2), T = (e) => {
		var i = mt(), a = t(i, !0);
		w(i), g(() => {
			i.disabled = n.previewing || n.submitting, r(a, n.previewing ? "Rendering..." : "Refresh");
		}), h("click", i, function(...e) {
			n.onRefresh?.apply(this, e);
		}), F(e, i);
	};
	K(S, (e) => {
		n.selectedTemplate && e(T);
	}), w(v);
	var E = s(v, 2), D = (e) => {
		var o = Ct(), l = b(o), u = (e) => {
			var i = ht(), a = t(i, !0);
			w(i), g(() => r(a, n.previewError)), F(e, i);
		};
		K(l, (e) => {
			n.previewError && e(u);
		});
		var d = s(l, 2), _ = (e) => {
			var t = gt();
			F(e, t);
		};
		K(d, (e) => {
			!n.previewError && n.stale && n.preview && e(_);
		});
		var v = s(d, 2), y = (e) => {
			var o = bt(), l = t(o), u = t(l, !0);
			w(l);
			var d = s(l, 2);
			ee(d);
			var _ = s(d, 2), v = (e) => {
				var n = _t(), r = s(t(n), 2);
				w(n), h("click", r, m), F(e, n);
			}, y = (e) => {
				var t = vt();
				F(e, t);
			};
			K(_, (e) => {
				c(f) ? e(v) : e(y, -1);
			});
			var b = s(_, 2), x = (e) => {
				var i = yt(), a = t(i);
				w(i), g(() => r(a, `Slug: ${n.preview.slug ?? ""}`)), F(e, i);
			};
			K(b, (e) => {
				n.preview.slug && e(x);
			});
			var S = s(b, 2), C = (e) => {
				var a = yt(), o = t(a);
				w(a), g(() => r(o, `Template ${i().templateName ?? ""} · ${n.templateDigest ?? ""}`)), F(e, a);
			};
			K(S, (e) => {
				n.templateDigest && e(C);
			}), w(o), g(() => {
				r(u, n.preview.title), k(d, c(a));
			}), h("input", d, (e) => p(e.currentTarget.value)), F(e, o);
		}, x = (e) => {
			var t = xt();
			F(e, t);
		}, S = (e) => {
			var t = St();
			F(e, t);
		};
		K(v, (e) => {
			n.preview ? e(y) : n.previewing ? e(x, 1) : n.previewError || e(S, 2);
		}), F(e, o);
	}, O = (e) => {
		var n = Et(), a = t(n), o = t(a, !0);
		w(a);
		var l = s(a, 2), d = (e) => {
			var n = wt(), a = t(n, !0);
			w(n), g(() => r(a, i().detail)), F(e, n);
		}, f = u(() => i().detail.trim()), p = (e) => {
			var t = Tt();
			F(e, t);
		};
		K(l, (e) => {
			c(f) ? e(d) : e(p, -1);
		});
		var m = s(l, 2), h = (e) => {
			var n = yt(), a = t(n);
			w(n), g((e) => r(a, `Slug: ${e ?? ""}`), [() => i().slug.trim()]), F(e, n);
		}, _ = u(() => i().slug.trim());
		K(m, (e) => {
			c(_) && e(h);
		}), w(n), g((e) => r(o, e), [() => i().title.trim() || "Untitled task"]), F(e, n);
	};
	K(E, (e) => {
		n.selectedTemplate ? e(D) : e(O, -1);
	}), w(_), F(e, _), l();
}
p(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var kt = P("<input type=\"checkbox\"/><span> </span>", 1), At = P("<span> </span>"), jt = P("<textarea></textarea>"), Mt = P("<option> </option>"), Nt = P("<select><option>Select...</option><!></select>"), Pt = P("<input/>"), Ft = P("<small> </small>"), It = P("<label><!> <!> <!> <!> <!></label>"), Lt = P("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function Rt(e, n) {
	C(n, !0);
	function i(e, t) {
		let r = t.currentTarget;
		n.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var a = Lt();
	q(a, 21, () => n.fields, (e) => e.name, (e, a) => {
		var o = It();
		let l;
		var u = t(o), d = (e) => {
			var o = kt(), l = b(o);
			O(l);
			var u = s(l), d = t(u);
			w(u), g(() => {
				W(l, n.values[c(a).name] === !0), r(d, `${c(a).label ?? ""}${c(a).required ? " *" : ""}`);
			}), h("change", l, (e) => i(c(a), e)), F(e, o);
		}, f = (e) => {
			var n = At(), i = t(n);
			w(n), g(() => r(i, `${c(a).label ?? ""}${c(a).required ? " *" : ""}`)), F(e, n);
		};
		K(u, (e) => {
			c(a).type === "boolean" ? e(d) : e(f, -1);
		});
		var p = s(u, 2), m = (e) => {
			var t = jt();
			ee(t), g((e) => {
				t.required = c(a).required, I(t, "placeholder", c(a).placeholder || ""), k(t, e);
			}, [() => String(n.values[c(a).name] ?? "")]), h("input", t, (e) => i(c(a), e)), F(e, t);
		};
		K(p, (e) => {
			c(a).type === "textarea" && e(m);
		});
		var v = s(p, 2), y = (e) => {
			var o = Nt(), l = t(o);
			l.value = l.__value = "";
			var u = s(l);
			q(u, 17, () => c(a).options || [], _, (e, n) => {
				var i = Mt(), a = t(i, !0);
				w(i);
				var o = {};
				g(() => {
					r(a, c(n)), o !== (o = c(n)) && (i.value = (i.__value = c(n)) ?? "");
				}), F(e, i);
			}), w(o);
			var d;
			B(o), g((e) => {
				o.required = c(a).required, d !== (d = e) && (o.value = (o.__value = e) ?? "", L(o, e));
			}, [() => String(n.values[c(a).name] ?? "")]), h("change", o, (e) => i(c(a), e)), F(e, o);
		};
		K(v, (e) => {
			c(a).type === "select" && e(y);
		});
		var x = s(v, 2), S = (e) => {
			var t = Pt();
			O(t), g((e) => {
				t.required = c(a).required, I(t, "placeholder", c(a).placeholder || ""), k(t, e);
			}, [() => String(n.values[c(a).name] ?? "")]), h("input", t, (e) => i(c(a), e)), F(e, t);
		};
		K(x, (e) => {
			c(a).type === "text" && e(S);
		});
		var C = s(x, 2), T = (e) => {
			var n = Ft(), i = t(n, !0);
			w(n), g(() => r(i, c(a).description)), F(e, n);
		};
		K(C, (e) => {
			c(a).description && e(T);
		}), w(o), g(() => l = j(o, 1, "", null, l, { "template-boolean": c(a).type === "boolean" })), F(e, o);
	}), w(a), g(() => I(a, "aria-label", n.label)), F(e, a), l();
}
p(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var zt = P("<small> </small>"), Bt = P("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), Vt = P("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function Ht(e, n) {
	C(n, !0);
	function i(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var a = Vt(), o = s(t(a), 2), u = t(o);
	let d;
	var f = s(t(u), 4), p = t(f);
	U(p, { name: "check" }), w(f), w(u);
	var m = s(u, 2);
	q(m, 17, () => n.templates, (e) => e.name, (e, a) => {
		var o = Bt();
		let l;
		var u = t(o), d = t(u, !0);
		w(u);
		var f = s(u, 2), p = (e) => {
			var n = zt(), i = t(n, !0);
			w(n), g(() => r(i, c(a).description)), F(e, n);
		};
		K(f, (e) => {
			c(a).description && e(p);
		});
		var m = s(f, 2), _ = t(m);
		U(_, { name: "check" }), w(m), w(o), g((e) => {
			I(o, "aria-selected", n.selectedName === c(a).name), l = j(o, 1, "template-card", null, l, { selected: n.selectedName === c(a).name }), o.disabled = !c(a).valid || n.disabled, r(d, e);
		}, [() => i(c(a))]), h("click", o, () => n.onSelect(c(a).name)), F(e, o);
	}), w(o), w(a), g(() => {
		I(u, "aria-selected", n.selectedName === ""), d = j(u, 1, "template-card", null, d, { selected: n.selectedName === "" }), u.disabled = n.disabled;
	}), h("click", u, () => n.onSelect("")), F(e, a), l();
}
p(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var Ut = P("<small>(generated by template)</small>"), Wt = P("<small class=\"create-required\">*</small>"), Gt = P("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), Kt = P("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), qt = P("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), Jt = P("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function Yt(e, n) {
	C(n, !0);
	let r = N(n, "draft", 7), i, a = u(() => n.model.templates.find((e) => e.name === r().templateName)), o = u(() => n.model.preview?.title || ""), d = u(() => r().titleOverride ? r().title : c(o)), f = u(() => (c(a)?.fields || []).filter((e) => e.required)), p = u(() => (c(a)?.fields || []).filter((e) => !e.required)), m = u(() => !n.model.preview || n.model.previewKey !== n.model.previewRequestKey(r()));
	R(() => {
		i && clearTimeout(i);
	});
	function _() {
		return {
			...r(),
			templateFields: { ...r().templateFields }
		};
	}
	function v(e) {
		return e.hasDefault ? e.default ?? "" : e.type !== "boolean" && "";
	}
	function y(e = 450) {
		i && clearTimeout(i), i = setTimeout(() => {
			i = void 0, r().templateName && c(m) && !n.model.submitting && n.model.onPreview(_());
		}, e);
	}
	async function b(e) {
		if (n.model.submitting || e === r().templateName || (Object.values(r().templateFields).some((e) => !!e) || r().titleOverride || r().editedMarkdown != null) && !await n.model.onConfirmTemplateSwitch()) return;
		let t = n.model.templates.find((t) => t.name === e);
		r().templateName = e, r().templateFields = {};
		for (let e of t?.fields || []) r().templateFields[e.name] = v(e);
		r().title = "", r().titleOverride = !1, r().editedMarkdown = null, y(150);
	}
	function x(e, t) {
		r().templateFields[e.name] = t, y();
	}
	function S(e) {
		r().title = e, r().templateName && (r().titleOverride = !0), y();
	}
	function T() {
		r().title = "", r().titleOverride = !1, y();
	}
	async function E() {
		!n.model.previewing && !n.model.submitting && await n.model.onPreview(_());
	}
	var D = Jt(), A = t(D), j = t(A), M = (e) => {
		Ht(e, {
			get templates() {
				return n.model.templates;
			},
			get selectedName() {
				return r().templateName;
			},
			get disabled() {
				return n.model.submitting;
			},
			onSelect: b
		});
	};
	K(j, (e) => {
		n.model.templates.length && e(M);
	});
	var P = s(j, 2), L = s(t(P), 2), z = t(L), B = t(z), V = s(t(B)), H = (e) => {
		var t = Ut();
		F(e, t);
	}, U = (e) => {
		var t = Wt();
		F(e, t);
	};
	K(V, (e) => {
		c(a)?.taskTitle && !r().titleOverride ? e(H) : e(U, -1);
	}), w(B);
	var W = s(B, 2), G = t(W);
	O(G);
	var q = s(G, 2), te = (e) => {
		var t = Gt();
		h("click", t, T), F(e, t);
	};
	K(q, (e) => {
		c(a)?.taskTitle && r().titleOverride && e(te);
	}), w(W), w(z);
	var J = s(z, 2), Y = s(t(J), 2), ne = s(t(Y), 2);
	O(ne), w(Y), w(J), w(L), w(P);
	var re = s(P, 2), ie = (e) => {
		var n = Kt(), i = s(t(n), 2), a = (e) => {
			Rt(e, {
				get fields() {
					return c(f);
				},
				get values() {
					return r().templateFields;
				},
				label: "Required template fields",
				onChange: x
			});
		};
		K(i, (e) => {
			c(f).length && e(a);
		});
		var o = s(i, 2), l = (e) => {
			Rt(e, {
				get fields() {
					return c(p);
				},
				get values() {
					return r().templateFields;
				},
				label: "Optional template fields",
				onChange: x
			});
		};
		K(o, (e) => {
			c(p).length && e(l);
		}), w(n), F(e, n);
	}, ae = (e) => {
		var n = qt(), i = s(t(n), 2);
		ee(i), w(n), g(() => k(i, r().detail)), h("input", i, (e) => r().detail = e.currentTarget.value), F(e, n);
	};
	K(re, (e) => {
		c(a) ? e(ie) : e(ae, -1);
	}), w(A), Ot(s(A, 2), {
		get draft() {
			return r();
		},
		get selectedTemplate() {
			return c(a);
		},
		get preview() {
			return n.model.preview;
		},
		get previewing() {
			return n.model.previewing;
		},
		get previewError() {
			return n.model.previewError;
		},
		get stale() {
			return c(m);
		},
		get templateDigest() {
			return n.model.templateDigest;
		},
		get submitting() {
			return n.model.submitting;
		},
		onRefresh: E
	}), w(D), g(() => {
		G.required = !c(a)?.taskTitle, k(G, c(a)?.taskTitle ? c(d) : r().title), I(G, "placeholder", c(a)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), k(ne, r().slug);
	}), h("input", G, (e) => S(e.currentTarget.value)), h("input", ne, (e) => {
		r().slug = e.currentTarget.value, y();
	}), F(e, D), l();
}
p(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var Xt = P("<span> </span>"), Zt = P("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function Qt(i, d) {
	C(d, !0);
	let f = o(y(d.channel.current())), p = o(y(S(c(f).draft))), m = o(""), _ = o(void 0), v = u(() => c(p).type === "task");
	V(() => d.channel.subscribe((e) => {
		x(f, e, !0), e.identity !== c(m) && (x(m, e.identity, !0), x(p, S(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), V(() => {
		let e = (e) => {
			if (!c(f).open) return;
			if (e.key === "Escape" && !c(f).submitting) {
				e.preventDefault(), c(f).onClose();
				return;
			}
			if (e.key !== "Tab" || !c(_)) return;
			let t = [...c(_).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
			if (!t.length) return;
			let n = t[0], r = t[t.length - 1];
			e.shiftKey && document.activeElement === n ? (e.preventDefault(), r.focus()) : !e.shiftKey && document.activeElement === r && (e.preventDefault(), n.focus());
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function S(e) {
		return {
			...e,
			templateFields: { ...e.templateFields }
		};
	}
	async function T(e) {
		e.preventDefault(), c(f).submitting || await c(f).onSubmit(S(c(p)));
	}
	var D = e(), O = b(D), k = (i) => {
		var o = Zt(), l = t(o), u = s(l, 2);
		let d;
		var m = t(u), y = t(m), S = t(y), C = t(S, !0);
		w(S);
		var D = s(S, 2), O = (e) => {
			var n = Xt(), i = t(n, !0);
			w(n), g(() => r(i, c(p).projectId)), F(e, n);
		};
		K(D, (e) => {
			c(v) && e(O);
		}), w(y);
		var k = s(y, 2), A = t(k);
		U(A, { name: "x" }), w(k), w(m);
		var M = s(m, 2), N = t(M);
		n(N, () => c(f).identity, (t) => {
			var n = e(), r = b(n), i = (e) => {
				Yt(e, {
					get draft() {
						return c(p);
					},
					get model() {
						return c(f);
					}
				});
			}, a = (e) => {
				pt(e, { get draft() {
					return c(p);
				} });
			};
			K(r, (e) => {
				c(v) ? e(i) : e(a, -1);
			}), F(t, n);
		});
		var P = s(N, 2), L = t(P), R = t(L, !0);
		w(L);
		var z = s(L, 2);
		w(P), w(M), w(u), E(u, (e) => x(_, e), () => c(_)), w(o), g(() => {
			d = j(u, 1, "create-dialog modal-enter", null, d, { "create-task-dialog": c(v) }), I(u, "aria-label", c(v) ? "Create task" : "Create project"), r(C, c(v) ? "Create task" : "Create project"), k.disabled = c(f).submitting, L.disabled = c(f).submitting, r(R, c(f).submitting ? "Creating..." : "Create"), z.disabled = c(f).submitting;
		}), h("click", l, function(...e) {
			c(f).onClose?.apply(this, e);
		}), h("click", k, function(...e) {
			c(f).onClose?.apply(this, e);
		}), a("submit", M, T), h("click", z, function(...e) {
			c(f).onClose?.apply(this, e);
		}), F(i, o);
	};
	K(O, (e) => {
		c(f).open && e(k);
	}), F(i, D), l();
}
p(["click"]);
//#endregion
//#region src/api/client.ts
var $t = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, en = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, tn = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new en(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new en(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new en(e.scope));
		this.active.clear();
	}
}, nn = class {
	requests = new tn();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: an(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: an(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof en) ? new en(n) : e;
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
			let n = rn(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new $t(e.status, r, n);
		}
		return t;
	}
};
function rn(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function an(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
//#endregion
//#region src/components/model-channel.ts
function on(e) {
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
var sn = () => void 0;
function cn() {
	let e = on({
		open: !1,
		revision: 0,
		title: "",
		message: "",
		confirmLabel: "Confirm",
		cancelLabel: "Cancel",
		danger: !1,
		onResult: sn
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
var ln = cn(), un = ln.channel;
function dn(e) {
	return ln.confirm(e);
}
//#endregion
//#region src/components/DiffModal.svelte
var fn = P("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), pn = P("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), mn = P("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), hn = P("<div class=\"diff-viewer\"></div>"), gn = P("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function _n(n, i) {
	C(i, !0);
	let a = o(null), f = o(!1), p = o(""), m = o(void 0), _ = u(() => `detail-diff:${i.workspaceId}:${i.resourceId}`);
	J(() => {
		let e = i.repo, t = c(_);
		if (x(a, null), x(p, ""), !e) {
			i.client.requests.abort(t);
			return;
		}
		x(f, !0);
		let n = e.worktreePath || "", r = e.targetBranch || e.baseBranch || "", o = new URLSearchParams({ path: n });
		r && o.set("base", r), i.client.latest(`/api/workspaces/${encodeURIComponent(i.workspaceId)}/diff?${o}`, { scope: t }).then(async (t) => {
			i.repo === e && (x(a, t, !0), await d(), v());
		}).catch((t) => {
			i.repo === e && t?.name !== "StaleResponseError" && (x(p, t instanceof Error ? t.message : String(t), !0), i.onError(c(p)));
		}).finally(() => {
			i.repo === e && (x(f, !1), queueMicrotask(i.onIconsChanged));
		});
	}), J(() => {
		c(a)?.diff, c(m), v();
	}), R(() => i.client.requests.abort(c(_)));
	function v() {
		!c(m) || !c(a)?.diff || !window.Diff2Html || (c(m).innerHTML = window.Diff2Html.html(c(a).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var y = e(), T = b(y), D = (e) => {
		var n = gn(), o = t(n), l = s(o, 2), d = t(l), _ = t(d), v = t(_), y = t(v, !0);
		w(v);
		var b = s(v), C = t(b);
		w(b), w(_);
		var T = s(_), D = t(T);
		U(D, { name: "x" }), w(T), w(d);
		var O = s(d, 2), k = (e) => {
			var n = fn(), a = t(n);
			U(a, { name: "loader-circle" });
			var o = s(a, 2), c = t(o, !0);
			w(o), w(n), g(() => r(c, i.repo.worktreePath || "")), F(e, n);
		}, A = (e) => {
			var n = pn(), i = t(n);
			U(i, { name: "triangle-alert" });
			var a = s(i, 2), o = t(a, !0);
			w(a), w(n), g(() => r(o, c(p))), F(e, n);
		}, j = (e) => {
			var n = mn(), r = t(n);
			U(r, { name: "check-circle-2" }), S(2), w(n), F(e, n);
		}, M = u(() => !c(a)?.hasChanges || !c(a).diff?.trim()), N = (e) => {
			var t = hn();
			E(t, (e) => x(m, e), () => c(m)), F(e, t);
		};
		K(O, (e) => {
			c(f) ? e(k) : c(p) ? e(A, 1) : c(M) ? e(j, 2) : e(N, -1);
		}), w(l), w(n), g(() => {
			r(y, c(a)?.branch || i.repo.branch || i.repo.name || "Diff"), r(C, `${(i.repo.worktreePath || "") ?? ""}${i.repo.targetBranch || i.repo.baseBranch ? ` · base ${i.repo.targetBranch || i.repo.baseBranch}` : ""}`);
		}), h("click", o, function(...e) {
			i.onClose?.apply(this, e);
		}), h("click", T, function(...e) {
			i.onClose?.apply(this, e);
		}), F(e, n);
	};
	K(T, (e) => {
		i.repo && e(D);
	}), F(n, y), l();
}
p(["click"]);
//#endregion
//#region src/controllers/route-controller.ts
function vn(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function yn(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: vn(t[1]),
		resourceId: t[2] === "r" ? vn(t[3]) : "workspace"
	} : {};
}
function bn(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function xn(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = bn(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => yn(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/components/markdown.ts
var Sn = "[A-Za-z0-9][A-Za-z0-9._-]{0,159}", Cn = RegExp(`^\\[\\[(${Sn})\\]\\]`), wn = null, Tn = null;
function En(e, t) {
	if (!window.marked || !window.DOMPurify) return `<pre>${In(e)}</pre>`;
	let n = An();
	return n ? window.DOMPurify.sanitize(n.parse(String(e ?? ""), {
		breaks: !0,
		gfm: !0,
		forgeMarkdownContext: t
	})) : (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? ""))));
}
function Dn(e, t) {
	if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !(e.target instanceof Element)) return;
	let n = e.currentTarget;
	if (!(n instanceof Node)) return;
	let r = e.target.closest("a[data-forge-resource-id]");
	if (r && n.contains(r) && (!r.target || r.target === "_self")) {
		let n = r.dataset.forgeResourceId || "";
		if (Fn(n) && t.resolveResourceTitle(n)) {
			e.preventDefault(), t.onNavigate(n);
			return;
		}
	}
	if (!t.onOpenFile) return;
	let i = e.target.closest("a[href^='/']");
	if (!i || !n.contains(i) || i.target && i.target !== "_self") return;
	let a = On(i.getAttribute("href") || "");
	a != null && (e.preventDefault(), t.onOpenFile(a));
}
function On(e) {
	if (!e.startsWith("/") || e.startsWith("//") || e.startsWith("/w/") || e.startsWith("/api/")) return null;
	let t = e.slice(1);
	if (!t || t === "." || t === "..") return null;
	try {
		return decodeURIComponent(t);
	} catch {
		return t;
	}
}
function kn(e, t) {
	let n = t, r = (e) => Dn(e, n);
	return e.addEventListener("click", r), {
		update(e) {
			n = e;
		},
		destroy() {
			e.removeEventListener("click", r);
		}
	};
}
function An() {
	let e = window.marked;
	if (!e?.Marked) return null;
	if (Tn && wn === e) return Tn;
	let t = new e.Marked();
	return t.use({ extensions: [{
		name: "forgeProtectedLink",
		level: "inline",
		tokenizer(e) {
			if (this.lexer.state.inLink || this.lexer.state.inRawBlock) return;
			let t = jn(e);
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
			let t = Cn.exec(e);
			if (t) return {
				type: "forgeResource",
				raw: t[0],
				resourceId: t[1]
			};
		},
		renderer(e) {
			let t = this.parser.options.forgeMarkdownContext, n = t?.resolveResourceTitle(e.resourceId);
			if (!t || !n) return In(e.raw);
			let r = bn(t.workspaceId, e.resourceId);
			return r ? `<a class="forge-resource-reference" href="${In(r)}" data-forge-resource-id="${In(e.resourceId)}">${In(n)}</a>` : In(e.raw);
		}
	}] }), wn = e, Tn = t, t;
}
function jn(e) {
	let t = e.startsWith("![") ? 1 : e.startsWith("[") ? 0 : -1;
	if (t < 0) return null;
	let n = Mn(e, t, "[", "]");
	if (n < 0 || e[n + 1] !== "(") return null;
	let r = Mn(e, n + 1, "(", ")");
	if (r < 0) return null;
	let i = e.slice(t + 1, n), a = Nn(i);
	return a === i ? null : {
		raw: e.slice(0, r + 1),
		markdown: `${e.slice(0, t + 1)}${a}${e.slice(n, r + 1)}`
	};
}
function Mn(e, t, n, r) {
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
			let t = Pn(e, o, "`"), n = e.indexOf("`".repeat(t), o + t);
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
function Nn(e) {
	let t = "", n = 0;
	for (; n < e.length;) {
		if (e[n] === "\\") {
			t += e.slice(n, n + 2), n += 2;
			continue;
		}
		if (e[n] === "`") {
			let r = Pn(e, n, "`"), i = e.indexOf("`".repeat(r), n + r);
			if (i >= 0) {
				t += e.slice(n, i + r), n = i + r;
				continue;
			}
		}
		let r = Cn.exec(e.slice(n));
		if (r) {
			t += `\\[\\[${r[1]}\\]\\]`, n += r[0].length;
			continue;
		}
		t += e[n++];
	}
	return t;
}
function Pn(e, t, n) {
	let r = 0;
	for (; e[t + r] === n;) r++;
	return r;
}
function Fn(e) {
	return RegExp(`^${Sn}$`).test(e);
}
function In(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/detail.ts
function Ln(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function Rn(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function zn(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...zn(a.children || [], t, n, r + 1));
	return i;
}
//#endregion
//#region src/components/FileBrowser.svelte
var Bn = P("<h3><!><span> </span></h3>"), Vn = P("<span class=\"artifact-folder-icon\"><!><!></span>"), Hn = P("<span class=\"artifact-delete\" role=\"button\" tabindex=\"0\"><!></span>"), Un = P("<a class=\"artifact-download\"><!></a><!>", 1), Wn = P("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), Gn = P("<div class=\"empty-list-row\"><!><span> </span></div>"), Kn = P("<div class=\"content-section\" data-component-owner=\"file-browser\"><!> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function qn(n, i) {
	C(i, !0);
	let a = N(i, "entries", 19, () => []), o = N(i, "emptyMessage", 3, "No files."), d = N(i, "activePath", 3, ""), f = N(i, "showHeading", 3, !0), p = u(() => zn(a(), i.expanded, i.title)), m = u(() => i.title === "Wiki" ? "book-open" : "paperclip");
	function _(e) {
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
	var v = Kn(), y = t(v), x = (e) => {
		var n = Bn(), a = t(n);
		U(a, { get name() {
			return c(m);
		} });
		var o = s(a), l = t(o, !0);
		w(o), w(n), g(() => r(l, i.title)), F(e, n);
	};
	K(y, (e) => {
		f() && e(x);
	});
	var S = s(y, 2), T = t(S), E = t(T), D = (n) => {
		var a = e(), o = b(a);
		q(o, 17, () => c(p), (e) => `${i.title}:${e.entry.path}`, (e, n) => {
			let a = u(() => c(n).entry.type === "directory"), o = u(() => i.expanded.has(`${i.title}:${c(n).entry.path}`));
			var l = Wn(), f = t(l);
			let p;
			var m = t(f), v = t(m), y = t(v), x = (e) => {
				U(e, { name: "chevron-right" });
			};
			K(y, (e) => {
				c(a) && e(x);
			}), w(v);
			var S = s(v), C = (e) => {
				var n = Vn(), r = t(n);
				U(r, {
					name: "folder",
					className: "artifact-icon artifact-icon-dir"
				});
				var i = s(r);
				U(i, {
					name: "folder-open",
					className: "artifact-icon artifact-icon-dir"
				}), w(n), F(e, n);
			}, T = (e) => {
				{
					let t = u(() => _(c(n).entry.name));
					U(e, {
						get name() {
							return c(t);
						},
						className: "artifact-icon"
					});
				}
			};
			K(S, (e) => {
				c(a) ? e(C) : e(T, -1);
			});
			var E = s(S), D = t(E, !0);
			w(E), w(m);
			var O = s(m, 2), k = t(O), A = (e) => {
				var r = Un(), a = b(r), o = t(a);
				U(o, {
					name: "download",
					className: "artifact-download-icon"
				}), w(a);
				var l = s(a), u = (e) => {
					var r = Hn(), a = t(r);
					U(a, {
						name: "trash-2",
						className: "artifact-delete-icon"
					}), w(r), g(() => {
						I(r, "title", `Delete ${c(n).entry.name}`), I(r, "aria-label", `Delete ${c(n).entry.name}`);
					}), h("click", r, (e) => {
						e.preventDefault(), e.stopPropagation(), i.onDelete(c(n).entry.path);
					}), h("keydown", r, (e) => {
						(e.key === "Enter" || e.key === " ") && (e.preventDefault(), e.stopPropagation(), i.onDelete(c(n).entry.path));
					}), F(e, r);
				};
				K(l, (e) => {
					i.onDelete && e(u);
				}), g((e) => {
					I(a, "href", e), I(a, "download", c(n).entry.name), I(a, "title", `Download ${c(n).entry.name}`), I(a, "aria-label", `Download ${c(n).entry.name}`);
				}, [() => i.rawURL(i.title, c(n).entry.path, !0)]), h("click", a, (e) => e.stopPropagation()), F(e, r);
			};
			K(k, (e) => {
				c(a) || e(A);
			});
			var N = s(k), P = t(N, !0);
			w(N), w(O), w(f), w(l), g((e) => {
				p = j(f, 1, "artifact-row", null, p, {
					directory: c(a),
					file: !c(a),
					active: d() === `${i.title}:${c(n).entry.path}`,
					open: c(a) && c(o)
				}), M(f, `--depth: ${c(n).depth}`), I(E, "title", c(n).entry.path), r(D, c(n).entry.name), r(P, e);
			}, [() => c(a) ? `${(c(n).entry.children || []).length} items` : Rn(c(n).entry.size || 0)]), h("click", f, () => c(a) ? i.onToggle(`${i.title}:${c(n).entry.path}`) : i.onPreview(i.title, c(n).entry.path)), F(e, l);
		}), F(n, a);
	}, O = (e) => {
		var n = Gn(), a = t(n);
		{
			let e = u(() => i.title === "Artifacts" ? "archive" : "inbox");
			U(a, { get name() {
				return c(e);
			} });
		}
		var l = s(a), d = t(l, !0);
		w(l), w(n), g(() => r(d, o())), F(e, n);
	};
	K(E, (e) => {
		c(p).length ? e(D) : e(O, -1);
	}), w(T), w(S), w(v), F(n, v), l();
}
p(["click", "keydown"]);
//#endregion
//#region src/components/LazyMarkdownEditor.svelte
var Jn = P("<div class=\"file-modal-empty error-preview\"><strong>Markdown editor unavailable</strong><span> </span></div>"), Yn = P("<div class=\"file-modal-empty\"><strong>Loading Markdown editor…</strong></div>");
function Xn(n, i) {
	let a = import("./MarkdownEditor-BE2A1DVn.js");
	var o = e(), l = b(o);
	v(l, () => a, (e) => {
		var t = Yn();
		F(e, t);
	}, (t, n) => {
		var r = e(), a = b(r);
		G(a, () => c(n).default, (e, t) => {
			t(e, {
				get identity() {
					return i.identity;
				},
				get file() {
					return i.file;
				},
				get mode() {
					return i.mode;
				},
				get onSave() {
					return i.onSave;
				},
				get onToast() {
					return i.onToast;
				},
				get onIconsChanged() {
					return i.onIconsChanged;
				}
			});
		}), F(t, r);
	}, (e, n) => {
		var i = Jn(), a = s(t(i)), o = t(a, !0);
		w(a), w(i), g((e) => r(o, e), [() => c(n) instanceof Error ? c(n).message : String(c(n))]), F(e, i);
	}), F(n, o);
}
//#endregion
//#region src/components/FilePreviewModal.svelte
var Zn = P("<button class=\"secondary-button\" type=\"button\"><!><span>Edit</span></button><button class=\"secondary-button\" type=\"button\"><!><span>Annotate</span></button>", 1), Qn = P("<button class=\"secondary-button\" type=\"button\"><!><span>Preview</span></button><button class=\"secondary-button\" type=\"button\"><!><span>Annotate</span></button>", 1), $n = P("<button class=\"secondary-button\" type=\"button\"><!><span>Preview</span></button><button class=\"secondary-button\" type=\"button\"><!><span>Edit</span></button>", 1), er = P("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), tr = P("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), nr = P("<div class=\"modal-markdown-editor\"><!></div>"), rr = P("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), ir = P("<div class=\"file-modal-empty\"><!><strong>Preview unavailable</strong><span> </span><a class=\"secondary-button file-modal-download\" title=\"Download file\"><!><span>Download</span></a></div>"), ar = P("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), or = P("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), sr = P("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><!><a class=\"secondary-button file-modal-download\" title=\"Download file\"><!><span>Download</span></a><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function cr(n, i) {
	C(i, !0);
	let a = o(null), d = o(!1), f = o(""), p = o("preview"), m = u(() => `detail-preview:${i.workspaceId}:${i.resourceId}`), _ = u(() => i.selection ? `${i.workspaceId}:${i.resourceId}:${i.selection.section}:${i.selection.path}` : ""), v = u(() => i.selection ? `/api/workspaces/${encodeURIComponent(i.workspaceId)}/files/raw?path=${encodeURIComponent(i.selection.path)}` : ""), y = u(() => i.selection ? `/api/workspaces/${encodeURIComponent(i.workspaceId)}/files/raw?path=${encodeURIComponent(i.selection.path)}&download=1` : ""), E = "";
	J(() => {
		let e = i.selection, t = c(m), n = c(_);
		if (n !== E) {
			if (E = n, x(a, null), x(f, ""), x(p, i.editable && e?.mode === "annotate" ? "annotate" : i.editable && e?.mode === "edit" ? "edit" : "preview", !0), !e) {
				i.client.requests.abort(t);
				return;
			}
			x(d, !0), i.client.latest(`/api/workspaces/${encodeURIComponent(i.workspaceId)}/files?path=${encodeURIComponent(e.path)}`, { scope: t }).then((t) => {
				i.selection?.section === e.section && i.selection.path === e.path && x(a, t, !0);
			}).catch((t) => {
				i.selection?.section === e.section && i.selection.path === e.path && t?.name !== "StaleResponseError" && (x(f, t instanceof Error ? t.message : String(t), !0), i.onError(c(f)));
			}).finally(() => {
				i.selection?.section === e.section && i.selection.path === e.path && (x(d, !1), queueMicrotask(i.onIconsChanged));
			});
		}
	}), R(() => i.client.requests.abort(c(m)));
	async function O(e, t) {
		if (!i.selection) throw Error("No Markdown file is selected.");
		let n = await i.onSaveMarkdown(c(a)?.path || i.selection.path, e, t);
		return x(a, n, !0), n;
	}
	var k = e(), A = b(k), j = (n) => {
		var o = sr(), l = t(o), m = s(l, 2), _ = t(m), C = t(_), E = t(C), k = t(E, !0);
		w(E);
		var A = s(E), j = t(A);
		w(A), w(C);
		var M = s(C), N = t(M), P = (n) => {
			var r = e(), i = b(r), a = (e) => {
				var n = Zn(), r = b(n), i = t(r);
				U(i, { name: "pencil" }), S(), w(r);
				var a = s(r), o = t(a);
				U(o, { name: "message-square-plus" }), S(), w(a), h("click", r, () => x(p, "edit")), h("click", a, () => x(p, "annotate")), F(e, n);
			}, o = (e) => {
				var n = Qn(), r = b(n), i = t(r);
				U(i, { name: "eye" }), S(), w(r);
				var a = s(r), o = t(a);
				U(o, { name: "message-square-plus" }), S(), w(a), h("click", r, () => x(p, "preview")), h("click", a, () => x(p, "annotate")), F(e, n);
			}, l = (e) => {
				var n = $n(), r = b(n), i = t(r);
				U(i, { name: "eye" }), S(), w(r);
				var a = s(r), o = t(a);
				U(o, { name: "pencil" }), S(), w(a), h("click", r, () => x(p, "preview")), h("click", a, () => x(p, "edit")), F(e, n);
			};
			K(i, (e) => {
				c(p) === "preview" ? e(a) : c(p) === "edit" ? e(o, 1) : e(l, -1);
			}), F(n, r);
		}, L = u(() => i.editable && c(a) && !c(a).truncated && !c(a).binary && Ln(c(a).path || i.selection.path));
		K(N, (e) => {
			c(L) && e(P);
		});
		var R = s(N), z = t(R);
		U(z, { name: "download" }), S(), w(R);
		var B = s(R), ee = t(B);
		U(ee, { name: "external-link" }), S(), w(B);
		var V = s(B), H = t(V);
		U(H, { name: "x" }), w(V), w(M), w(_);
		var W = s(_, 2), G = (e) => {
			var n = er(), a = t(n);
			U(a, { name: "loader-circle" });
			var o = s(a, 2), c = t(o, !0);
			w(o), w(n), g(() => r(c, i.selection.path)), F(e, n);
		}, q = (e) => {
			var n = tr(), i = t(n);
			U(i, { name: "triangle-alert" });
			var a = s(i, 2), o = t(a, !0);
			w(a), w(n), g(() => r(o, c(f))), F(e, n);
		}, te = (e) => {
			var n = nr(), r = t(n);
			{
				let e = u(() => `${i.workspaceId}:${i.resourceId}:${i.selection.path}:edit`);
				Xn(r, {
					get identity() {
						return c(e);
					},
					get file() {
						return c(a);
					},
					mode: "edit",
					onSave: O,
					get onToast() {
						return i.onError;
					},
					get onIconsChanged() {
						return i.onIconsChanged;
					}
				});
			}
			w(n), F(e, n);
		}, J = (e) => {
			var n = nr(), r = t(n);
			{
				let e = u(() => `${i.workspaceId}:${i.resourceId}:${i.selection.path}:annotate`);
				Xn(r, {
					get identity() {
						return c(e);
					},
					get file() {
						return c(a);
					},
					mode: "annotate",
					onSave: O,
					get onToast() {
						return i.onError;
					},
					get onIconsChanged() {
						return i.onIconsChanged;
					}
				});
			}
			w(n), F(e, n);
		}, Y = (e) => {
			var n = rr(), r = t(n);
			w(n), g(() => {
				I(r, "src", c(v)), I(r, "alt", c(a).name || i.selection.path);
			}), F(e, n);
		}, ne = (e) => {
			var n = ir(), o = t(n);
			U(o, { name: "file-warning" });
			var l = s(o, 2), u = t(l);
			w(l);
			var d = s(l), f = t(d);
			U(f, { name: "download" }), S(), w(d), w(n), g((e) => {
				r(u, `${(c(a).name || i.selection.path) ?? ""} · Binary file, ${e ?? ""}.`), I(d, "href", c(y));
			}, [() => Rn(c(a).size || 0)]), F(e, n);
		}, re = (e) => {
			var t = ar();
			D(t, () => En(c(a)?.content || "", {
				workspaceId: i.workspaceId,
				resolveResourceTitle: i.resolveResourceTitle
			}), !0), w(t), T(t, (e, t) => kn?.(e, t), () => ({
				resolveResourceTitle: i.resolveResourceTitle,
				onNavigate: i.onNavigate,
				onOpenFile: i.onOpenFile
			})), F(e, t);
		}, ie = u(() => Ln(c(a)?.path || i.selection.path)), ae = (e) => {
			var n = or(), i = t(n, !0);
			w(n), g(() => r(i, c(a)?.content || "")), F(e, n);
		};
		K(W, (e) => {
			c(d) ? e(G) : c(f) ? e(q, 1) : c(a) && c(p) === "edit" ? e(te, 2) : c(a) && c(p) === "annotate" ? e(J, 3) : c(a)?.image ? e(Y, 4) : c(a)?.binary ? e(ne, 5) : c(ie) ? e(re, 6) : e(ae, -1);
		}), w(m), w(o), g((e, t) => {
			I(m, "data-preview-identity", `${i.workspaceId}:${i.resourceId}:${i.selection.section}:${i.selection.path}:${c(a)?.contentHash || "pending"}`), r(k, e), r(j, `${i.selection.path ?? ""}${t ?? ""}${c(a)?.truncated ? " · truncated" : ""}`), I(R, "href", c(y)), I(B, "href", c(v));
		}, [() => c(a)?.name || i.selection.path.split("/").pop() || "File preview", () => c(a)?.size == null ? "" : ` · ${Rn(c(a).size)}`]), h("click", l, function(...e) {
			i.onClose?.apply(this, e);
		}), h("click", V, function(...e) {
			i.onClose?.apply(this, e);
		}), F(n, o);
	};
	K(A, (e) => {
		i.selection && e(j);
	}), F(n, k), l();
}
p(["click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var lr = P("<p class=\"approval-question\"> </p>"), ur = P("<p> </p>"), dr = P("<button> </button>"), fr = P("<div class=\"approval-options\"></div>"), pr = P("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), mr = P("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), hr = P("<!> <!>", 1), gr = P("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function _r(e, n) {
	C(n, !0);
	let i = o(""), u = o(!1), d = o(y(f()));
	J(() => {
		let e = f();
		e !== c(d) && (x(d, e, !0), x(i, ""), x(u, !1));
	});
	function f() {
		return `${n.contextIdentity}:${String(n.item.approvalId || "")}`;
	}
	async function p(e) {
		let t = String(n.item.approvalId || "");
		if (!(!t || c(u))) {
			x(u, !0);
			try {
				await n.onApproval(n.generationId, t, e), x(i, "");
			} catch (e) {
				n.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				x(u, !1);
			}
		}
	}
	function m(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	var _ = gr(), v = t(_), T = t(v);
	U(T, { name: "shield-question" });
	var E = s(T), D = t(E, !0);
	w(E), w(v);
	var k = s(v, 2), A = (e) => {
		var i = lr(), a = t(i, !0);
		w(i), g(() => r(a, n.item.question)), F(e, i);
	};
	K(k, (e) => {
		n.item.question && e(A);
	});
	var M = s(k, 2), N = (e) => {
		var i = ur(), a = t(i, !0);
		w(i), g(() => r(a, n.item.detail)), F(e, i);
	};
	K(M, (e) => {
		n.item.detail && e(N);
	});
	var P = s(M, 2), I = (e) => {
		var o = hr(), l = b(o), d = (e) => {
			var i = fr();
			q(i, 21, () => n.item.options, (e) => e.optionId, (e, n) => {
				var i = dr();
				let a;
				var o = t(i, !0);
				w(i), g((e, t) => {
					i.disabled = c(u), a = j(i, 1, "", null, a, e), r(o, t);
				}, [() => ({ "secondary-button": String(c(n).kind || "").startsWith("reject") }), () => m(c(n))]), h("click", i, () => p({ optionId: c(n).optionId })), F(e, i);
			}), w(i), F(e, i);
		}, f = (e) => {
			var n = pr(), r = t(n), i = t(r);
			U(i, { name: "check" }), S(), w(r);
			var a = s(r), o = t(a);
			U(o, { name: "x" }), S(), w(a), w(n), g(() => {
				r.disabled = c(u), a.disabled = c(u);
			}), h("click", r, () => p({ decision: "accept" })), h("click", a, () => p({ decision: "decline" })), F(e, n);
		};
		K(l, (e) => {
			n.item.options?.length ? e(d) : e(f, -1);
		});
		var _ = s(l, 2), v = (e) => {
			var n = mr(), r = t(n);
			O(r);
			var o = s(r);
			w(n), g((e) => o.disabled = e, [() => !c(i).trim() || c(u)]), a("submit", n, (e) => {
				e.preventDefault(), c(i).trim() && p({ text: c(i).trim() });
			}), H(r, () => c(i), (e) => x(i, e)), F(e, n);
		};
		K(_, (e) => {
			n.item.question && e(v);
		}), F(e, o);
	}, L = (e) => {
		var i = ur(), a = t(i);
		w(i), g(() => r(a, `${(n.item.decision || (n.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${n.item.reply ? `: ${n.item.reply}` : ""}`)), F(e, i);
	};
	K(P, (e) => {
		n.item.status === "pending" ? e(I) : e(L, -1);
	}), w(_), g(() => r(D, n.item.title || "Approval requested")), F(e, _), l();
}
p(["click"]);
//#endregion
//#region vendor/agenthub-event-timeline/index.mjs
var vr = 400, yr = 12e3;
function br(e, t = vr) {
	let n = String(e ?? "");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function xr(e) {
	if (e == null) return "";
	try {
		return br(JSON.stringify(e));
	} catch {
		return "";
	}
}
function Sr(e) {
	let t = String(e || "").replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function Cr(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string").join(" ") : typeof e == "string" ? e : "";
}
function X(...e) {
	for (let t of e) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
var wr = /* @__PURE__ */ new Set([
	"user",
	"system",
	"agent",
	"assistant"
]);
function Tr(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return;
	let t = {};
	for (let n of [
		"id",
		"name",
		"sessionId"
	]) typeof e[n] == "string" && e[n].trim() && (t[n] = e[n].trim());
	return Object.keys(t).length ? t : void 0;
}
function Er(e) {
	let t = typeof e == "string" ? e.trim().toLowerCase() : "";
	return wr.has(t) ? t : "user";
}
function Dr(e) {
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
function Or(e) {
	if (!Array.isArray(e)) return "";
	let t = [];
	for (let n of e) typeof n?.text == "string" ? t.push(n.text) : typeof n?.content?.text == "string" ? t.push(n.content.text) : n?.type === "diff" && typeof n?.path == "string" && t.push(`Edit ${n.path}`);
	return t.filter(Boolean).join("\n");
}
function kr(e) {
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
		let a = X(e.id, r.itemId), o = Sr(t) || "Tool", s = "", c = "", l = "";
		t === "commandExecution" ? (o = "Command", s = Cr(e.command) || X(e.cmd), c = X(e.aggregatedOutput, e.output), typeof e.exitCode == "number" && e.exitCode !== 0 && (l = `Exit code ${e.exitCode}`)) : t === "fileChange" ? (o = "File change", s = (Array.isArray(e.changes) ? e.changes.map((e) => e?.path).filter(Boolean) : []).join(", ")) : t === "mcpToolCall" ? (o = "MCP", s = [e.server, e.tool].filter((e) => typeof e == "string" && e).join(" / "), c = typeof e.result == "string" ? e.result : xr(e.result), l = X(e.error?.message, typeof e.error == "string" ? e.error : "")) : t === "webSearch" ? (o = "Web search", s = X(e.query)) : (s = X(e.title, e.name, Cr(e.command), e.path), c = X(e.output, e.aggregatedOutput));
		let u = Dr(e.status);
		return n === "item/started" && (u = "running"), n === "item/completed" && u === "running" && (u = "completed"), l && u === "completed" && (u = "failed"), {
			callId: a,
			method: n,
			time: i,
			name: o,
			status: u,
			error: l,
			summary: br(s.replace(/\s+/g, " ").trim(), 120),
			output: br(c, yr)
		};
	}
	let a = r.update && typeof r.update == "object" ? r.update : r, o = X(a.sessionUpdate);
	if (o === "tool_call" || o === "tool_call_update") {
		let e = X(a.toolCallId, a.id), t = a.rawInput && typeof a.rawInput == "object" ? a.rawInput : {}, r = X(a.title, Cr(t.command), t.path, t.filePath, Sr(a.kind));
		return {
			callId: e,
			method: n,
			time: i,
			name: Sr(a.kind) || "Tool",
			status: Dr(a.status || (o === "tool_call" ? "in_progress" : "")),
			summary: br(r.replace(/\s+/g, " ").trim(), 120),
			output: br(Or(a.content), yr),
			error: ""
		};
	}
	if (n === "tool_execution_start" || n === "tool_execution_end") {
		let e = X(r.toolName, r.name, r.tool), t = r.args && typeof r.args == "object" ? r.args : {}, a = X(Cr(t.command), t.path, t.filePath, ""), o = r.isError === !0 || !!X(r.error);
		return {
			callId: X(r.toolCallId, r.callId, e),
			method: n,
			time: i,
			name: Sr(e) || "Tool",
			status: n === "tool_execution_start" ? "running" : o ? "failed" : "completed",
			summary: br(a.replace(/\s+/g, " ").trim(), 120),
			output: br(X(typeof r.result == "string" ? r.result : "", Or(r.result?.content)), yr),
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
function Ar(e) {
	let t = e?.data ?? {}, n = X(t.method), r = t.params && typeof t.params == "object" ? t.params : {}, i = Array.isArray(r.options) ? r.options.map((e) => ({
		optionId: X(e?.optionId),
		name: X(e?.name),
		kind: X(e?.kind)
	})).filter((e) => e.optionId) : [], a = Cr(r.command) || Cr(r?.rawInput?.command);
	if (a) return {
		title: "Run command",
		detail: br(a, 160),
		question: "",
		options: i
	};
	let o = Array.isArray(r.changes) ? r.changes.map((e) => e?.path).filter(Boolean) : [];
	if (r.toolCall && typeof r.toolCall == "object") {
		let e = X(r.toolCall.title, r.toolCall.kind && Sr(r.toolCall.kind)), t = Or(r.toolCall.content);
		return {
			title: e || "Permission requested",
			detail: "",
			question: t,
			options: i
		};
	}
	return o.length ? {
		title: "Apply file changes",
		detail: br(o.join(", "), 160),
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
var jr = {
	accept: "Allowed",
	acceptForSession: "Allowed for this session",
	decline: "Declined",
	cancel: "Cancelled"
}, Mr = {
	failed: "Session failed",
	stopping: "Stopping provider",
	stopped: "Session stopped",
	archived: "Session archived"
}, Nr = {
	requested: "requested",
	completed: "provider completed",
	provider_error: "provider error",
	startup_error: "startup error",
	daemon_recovery: "daemon recovery"
};
function Pr(e) {
	return e === "message.delivery" || e === "provider.event" || e === "provider.metadata" || e === "plan.event" || e === "provider.stderr" || e === "provider.turn.started" || e === "provider.turn.completed" || e.startsWith("provider.process.");
}
function Fr(e, t) {
	let n = { ...e };
	return t.name && (n.name = t.name), t.summary && (n.summary = t.summary), t.status && (n.status = t.status), t.error && (n.error = t.error), t.deltaOnly ? n.output = br((n.output || "") + (t.output || ""), yr) : t.output && (n.output = t.output), n.time = t.time || e.time, n.key = e.key, n;
}
function Ir(e, t) {
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
		rawPreview: xr(t?.data?.raw)
	};
}
function Lr(e) {
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
					role: Er(o.role),
					key: a.id,
					time: s,
					steer: o.steer === !0,
					text: typeof o.text == "string" ? o.text : ""
				};
				a.turnId && (e.turnId = a.turnId);
				let n = Tr(o.sender);
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
				let e = kr(a);
				if (!e) break;
				let n = t.at(-1), i = n?.kind === "tools" ? n : null, o = e.callId ? r.get(e.callId) : null;
				if (o) Object.assign(o.call, Fr(o.call, e)), o.group.time = s, o.call.status !== "running" && r.delete(e.callId);
				else {
					if (e.deltaOnly) break;
					let n = i || {
						kind: "tools",
						key: a.id,
						calls: [],
						time: s
					}, o = Ir(e, a);
					n.calls.push(o), n.time = s, i || t.push(n), o.callId && o.status === "running" && r.set(o.callId, {
						call: o,
						group: n
					});
				}
				break;
			}
			case "approval.requested": {
				let { title: e, detail: r, question: i, options: c } = Ar(a), l = {
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
				let e = X(o.approvalId), r = X(o.decision) || "decline", i = X(o.optionId), c = X(o.text), l = e ? n.get(e) : null, u = (e) => r === "text" ? "Replied" : i ? `Answered: ${e?.options?.find((e) => e.optionId === i)?.name || i}` : jr[r] || Sr(r), d = r === "accept" || r === "acceptForSession" || r === "text";
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
				let e = Mr[o.state];
				o.state === "failed" ? i("failed", s) : o.state === "stopped" && i(o.reason === "completed" ? "completed" : "failed", s), o.state === "stopped" && Nr[o.reason] && (e += ` · ${Nr[o.reason]}`);
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
				if (Pr(e)) break;
				t.push({
					kind: "unknown",
					key: a.id,
					time: s,
					type: e || "unknown",
					preview: xr(o)
				});
		}
	}
	let a = t.at(-1);
	return a?.kind === "thinking" && (a.active = !0), t;
}
//#endregion
//#region src/components/timeline-events.ts
var Rr = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment",
	"turn.started",
	"turn.completed"
]), zr = /* @__PURE__ */ new Set([
	...Rr,
	"Session created",
	"Turn started",
	"Turn completed"
]);
function Br(e, t) {
	let n = new Set(e.filter((e) => Rr.has(e.type)).map((e) => String(e.id)));
	return t.filter((e) => e.key === void 0 || !n.has(String(e.key)));
}
function Vr(e) {
	let t = e || [], n = Br(t, Lr(t)), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function Hr(e) {
	let t = String(e || "");
	return zr.has(t) || t === "Agent connected" || t.startsWith("Agent connected ·");
}
function Ur(e) {
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
function Wr(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? Qr(r, n) : $r(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function Gr(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) Kr(n, e);
	return n;
}
function Kr(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, $r(t));
		return;
	}
	e[a] = Qr(e[a], t);
}
function qr(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = Jr(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? Yr(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function Jr(e) {
	if (e.type !== "tool.event") return "";
	let t = Xr(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? Xr(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? Zr(n.toolCallId) || Zr(n.id) : "";
}
function Yr(e, t) {
	let n = e.data || {}, r = t.data || {}, i = Xr(n.raw), a = Xr(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? Xr(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? Xr(a.update) : a;
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
function Xr(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Zr(e) {
	return typeof e == "string" ? e.trim() : "";
}
function Qr(e, t) {
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
function $r(e) {
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
function ei(e, t) {
	let n = Number(e);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : Math.max(0, Math.floor(Number(t) || 0));
}
function ti(e) {
	return e.compact ? ei(e.toolCallCount, e.calls?.length || 0) : e.calls?.length || 0;
}
function ni(e) {
	let t = ei(e, 0);
	return `${t} tool ${t === 1 ? "call" : "calls"}`;
}
function ri(e) {
	return e.rangeStartEventId && e.rangeStartEventId > 0 ? String(e.rangeStartEventId) : String(e.key ?? e.time ?? "tools");
}
//#endregion
//#region src/components/chat-state.ts
var ii = 20, ai = 250, oi = 80, si = 2e3, ci = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment"
]), li = class {
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
		this.api = e.api ?? new nn(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? oi), this.statusSyncIntervalMs = Math.max(1, e.statusSyncIntervalMs ?? si), this.realtime = e.realtime !== !1;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t, n) {
		if (this.disposed) return;
		let r = fi(e, t), i = this.activeKey !== r;
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
			let r = await this.api.latest(_i(e, n), { scope: hi(e, "older") });
			return this.isCurrent(e, t) ? (this.mergePage(e, r), r.segments.some((e) => e.turns?.length || e.gap)) : !1;
		} catch (n) {
			return n instanceof en || !this.isCurrent(e, t) || (e.error = Di(n)), !1;
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
			let r = await this.api.latest(vi(t, e), { scope: hi(t, `turn:${e}`) });
			if (!this.isCurrent(t, n)) return;
			if (t.details.set(e, r), !r.turn.closed && r.turn.generation.generationId === t.generationId) {
				let i = await this.loadTurnRange(t, r, n);
				if (!this.isCurrent(t, n)) return;
				t.liveEvents.set(e, i);
			}
			this.realtime && this.connect(t);
		} catch (r) {
			if (r instanceof en || !this.isCurrent(t, n)) return;
			t.detailErrors.set(e, Di(r));
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
		this.isCurrent(r, o) && (r.liveEvents.set(i, qr(Wr([...r.liveEvents.get(i) || [], ...s]))), this.emit());
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
		} : Oi();
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
			key: fi(e, t),
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
			let n = await this.api.latest(_i(e), { scope: hi(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			e.segments.clear(), e.details.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), this.mergePage(e, n), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof en || !this.isCurrent(e, t)) return;
			e.error = Di(n);
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
			n && (e.liveEvents.set(t.reference, qr(Wr([...e.liveEvents.get(t.reference) || [], ...n]))), e.orphanEvents.delete(t.turnId));
		}
		e.nextCursor = String(t.page?.nextCursor || ""), e.hasMoreBefore = !!(t.page?.hasMore && e.nextCursor);
	}
	blocks(e) {
		let t = [], n = [...e.segments.values()].sort((e, t) => e.generation.generation - t.generation.generation), r = n.find((t) => t.generation.generationId === e.generationId)?.generation || bi(e), i = r ? this.orphanEventBlocks(e, r) : [];
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
					items: i && !a ? ui(i, r.generation.generationId) : void 0,
					events: a?.filter((e) => !ci.has(e.type)),
					loading: e.detailLoading.has(t.reference),
					error: e.detailErrors.get(t.reference)
				});
			}
			r.generation.generationId === e.generationId && n.push(...i), n.sort((e, t) => mi(e) - mi(t)), t.push(...n);
		}
		return i.length && !n.some((t) => t.generation.generationId === e.generationId) && t.push(...i), t;
	}
	orphanEventBlocks(e, t) {
		let n = [];
		for (let [r, i] of e.orphanEvents) {
			let a = i.filter((e) => !ci.has(e.type)), o = [];
			for (let i of a) o.length && Number(i.id) !== Number(o[o.length - 1].id) + 1 && (n.push(pi(e, r, t, o)), o = []), o.push(i);
			o.length && n.push(pi(e, r, t, o));
		}
		return n.sort((e, t) => mi(e) - mi(t));
	}
	connect(e) {
		if (!this.realtime || !this.isActive(e) || e.stream || !e.generationId || !Ci(e.status)) return;
		let t = yi(e), n = new URLSearchParams({ generationId: e.generationId });
		t && n.set("after", String(t));
		let r = ++e.streamGeneration, i = this.eventSourceFactory(`${gi(e)}/stream?${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.resourceId, n), this.scheduleEventFlush(e), wi(n) && this.materializeTerminalTurn(e, String(n.turnId || ""), r);
			} catch {
				e.error = "An Agent event could not be decoded.", this.emit();
			}
		}, i.addEventListener("forge.notice", (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				this.flushEvents(e, !1), this.appendNotice(e, n), this.onNotice?.(e.workspaceId, e.resourceId, n), this.emit();
			} catch {
				e.error = "A Forge notice could not be decoded.", this.emit();
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
			let n = await this.api.latest(`${gi(e)}/status`, { scope: hi(e, "status") });
			if (!this.isCurrent(e, t) || !n.generation?.generationId) return;
			let r = String(n.generation.generationId);
			if (r !== e.generationId && (e.generationId || e.loaded)) {
				this.activate(e.workspaceId, e.resourceId, n);
				return;
			}
			let i = e.generationId, a = String(e.status?.session?.id || "");
			e.status = n, e.generationId = r, e.stream && (!Ci(n) || a && a !== String(n.session?.id || "")) && this.closeStream(e), !e.loaded && !e.loading ? this.loadInitial(e) : e.stream || this.connect(e), i !== r && this.emit();
		} catch (n) {
			if (n instanceof en || !this.isCurrent(e, t)) return;
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
				limit: String(ai)
			}), l = await this.api.latest(`${gi(e)}/events?${c}`, { scope: hi(e, a) });
			if (!this.isCurrent(e, i)) return [];
			let u = xi(l.events).filter((t) => this.eventBelongsToContext(e, t));
			s = Wr([...s, ...u]);
			let d = Number(l.page?.nextAfter) || Si(u);
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
					let i = await this.api.latest(_i(e), { scope: hi(e, `terminal-head:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.mergePage(e, i);
					let a = this.findTurnById(e, r, t);
					if (!a?.closed) throw Error("Turn projection is not closed yet");
					let o = await this.api.latest(vi(e, a.reference), { scope: hi(e, `terminal:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.flushEvents(e, !1), e.details.set(a.reference, o), e.liveEvents.delete(a.reference), this.emit();
					return;
				} catch (t) {
					if (t instanceof en || !e.stream || !this.isActiveStream(e, e.stream, n)) return;
					if (i === 2) {
						e.error = Di(t), this.emit();
						return;
					}
					await Ti(50 * (i + 1));
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
			let n = await this.api.latest(_i(e), { scope: hi(e, "stream-head") });
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
		e.notices.some((e) => Ei(e) === Ei(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
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
			if (n) e.liveEvents.set(n, qr(Gr(e.liveEvents.get(n) || [], [t])));
			else {
				let n = String(t.turnId || "current");
				e.orphanEvents.set(n, qr(Gr(e.orphanEvents.get(n) || [], [t]))), wi(t) || this.refreshHead(e);
			}
		}
		t && this.isActive(e) && this.emit();
	}
	closeStream(e) {
		e.streamGeneration++, e.stream?.close(), e.stream = null;
	}
	resetForGeneration(e) {
		e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, e.pendingEvents = [], e.requestGeneration++, this.closeStream(e), this.api.requests.abort(hi(e, "initial")), this.api.requests.abort(hi(e, "older")), this.api.requests.abort(hi(e, "status")), e.segments.clear(), e.details.clear(), e.detailLoading.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), e.nextCursor = "", e.hasMoreBefore = !1, e.loading = !1, e.loadingOlder = !1, e.loaded = !1, e.error = "", e.headRefreshing = !1, e.terminalMaterializing.clear();
	}
	deactivate(e) {
		e && (e.statusSyncTimer && clearInterval(e.statusSyncTimer), e.statusSyncTimer = null, e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.requestGeneration++, this.closeStream(e), e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(hi(e, "initial")), this.api.requests.abort(hi(e, "older")), this.api.requests.abort(hi(e, "status")));
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
function ui(e, t) {
	return (e.items || []).flatMap((e) => di(e, t));
}
function di(e, t) {
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
			let t = ei(e.count, 1);
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
					summary: `${ni(t)} · details omitted`,
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
		case "lifecycle": return e.text && !Hr(e.text) ? [{
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
function fi(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function pi(e, t, n, r) {
	let i = r[0]?.id ?? 0;
	return {
		kind: "turn",
		key: `${e.generationId}:${t || "current"}:${i}`,
		generation: n,
		events: r
	};
}
function mi(e) {
	if (e.turn) return Number(e.turn.startEventId) || 0;
	let t = e.events?.[0];
	return t && Number(t.id) || 0;
}
function hi(e, t) {
	return `resource-chat:${e.key}:${t}`;
}
function gi(e) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/resources/${encodeURIComponent(e.resourceId)}`;
}
function _i(e, t = "") {
	let n = new URLSearchParams({ limit: String(ii) });
	return t && n.set("cursor", t), `${gi(e)}/history/turns?${n}`;
}
function vi(e, t) {
	return `${gi(e)}/history/turns/${encodeURIComponent(t)}`;
}
function yi(e) {
	let t = [...e.segments.values()].filter((t) => t.generation.generationId === e.generationId).flatMap((e) => e.turns || []), n = [...e.liveEvents.values()].flat();
	return Math.max(0, ...t.map((e) => Number(e.lastEventId) || 0), ...n.map((e) => Number(e.id) || 0));
}
function bi(e) {
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
function xi(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function Si(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function Ci(e) {
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
function wi(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function Ti(e) {
	return new Promise((t) => setTimeout(t, e));
}
function Ei(e) {
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
function Di(e) {
	return e instanceof Error ? e.message : String(e);
}
function Oi() {
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
var ki = P("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function Ai(e, n) {
	C(n, !0);
	let i = u(() => n.item.tone === "ok" ? "check-circle" : n.item.tone === "danger" ? "triangle-alert" : n.item.tone === "info" ? "info" : "clock");
	function a() {
		let e = new Date(n.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var o = ki(), d = t(o);
	U(d, { get name() {
		return c(i);
	} });
	var f = s(d), p = t(f, !0);
	w(f);
	var m = s(f), h = t(m, !0);
	w(m), w(o), g((e) => {
		j(o, 1, `agent-system-note agent-lifecycle-${n.item.tone || "muted"}`), r(p, n.item.text || ""), r(h, e);
	}, [() => a()]), F(e, o), l();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var ji = P("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function Mi(e, n) {
	C(n, !0);
	let i = N(n, "onExpand", 3, () => {}), u = o(y(!!n.item.active)), d = !!n.item.active;
	J(() => {
		let e = !!n.item.active;
		e !== d && (d = e, x(u, e, !0));
	});
	function f() {
		if (n.item.active) return "Thinking…";
		if (!n.item.startTime || !n.item.time) return "Thought";
		let e = Math.round((new Date(n.item.time).getTime() - new Date(n.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var p = ji(), m = t(p), h = t(m);
	U(h, { name: "brain-circuit" });
	var _ = s(h), v = t(_, !0);
	w(_);
	var b = s(_), S = t(b);
	U(S, { name: "chevron-right" }), w(b), w(m);
	var T = s(m, 2), E = t(T, !0);
	w(T), w(p), g((e) => {
		p.open = c(u), r(v, e), r(E, n.item.text || "");
	}, [() => f()]), a("toggle", p, (e) => {
		x(u, e.currentTarget.open, !0), e.currentTarget.open && i()();
	}), F(e, p), l();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var Ni = P("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), Pi = P("<span class=\"agent-message-tag\">steer</span>"), Fi = P("<span class=\"agent-message-source\"> </span>"), Ii = P("<div class=\"agent-message-content markdown-rendered\"></div>"), Li = P("<p> </p>"), Ri = P("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function zi(e, n) {
	C(n, !0);
	let i = N(n, "workspaceId", 3, ""), a = N(n, "resolveResourceTitle", 3, () => null), o = N(n, "onNavigate", 3, () => {}), d = u(() => [
		"assistant",
		"system",
		"agent"
	].includes(String(n.item.role)) ? String(n.item.role) : "user"), f = u(() => c(d) === "assistant" ? n.item.turnFinal === !1 ? "assistant" : "assistant final" : c(d));
	function p() {
		return n.item.role === "assistant" ? n.agentName || "Agent" : String(n.item.sender?.name || n.item.sender?.id || "").trim() || (n.item.role === "system" ? "System" : n.item.role === "agent" ? "Agent" : "User");
	}
	function m() {
		let e = new Date(n.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function h() {
		let e = String(n.item.text || "");
		return !window.marked || !window.DOMPurify ? _(e).replaceAll("\n", "<br>") : En(e, {
			workspaceId: i(),
			resolveResourceTitle: a()
		});
	}
	function _(e) {
		return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
	}
	var v = Ri(), y = t(v), b = t(y), x = t(b), S = t(x, !0);
	w(x);
	var E = s(x, 2), O = (e) => {
		var n = Ni(), i = t(n, !0);
		w(n), g(() => r(i, c(d))), F(e, n);
	};
	K(E, (e) => {
		c(d) !== "assistant" && e(O);
	});
	var k = s(E, 2), A = (e) => {
		var t = Pi();
		F(e, t);
	};
	K(k, (e) => {
		n.item.steer && e(A);
	});
	var M = s(k, 2), P = (e) => {
		var i = Fi(), a = t(i);
		w(i), g(() => {
			I(i, "title", n.item.sender.sessionId), r(a, `from session ${n.item.sender.sessionId ?? ""}`);
		}), F(e, i);
	};
	K(M, (e) => {
		c(d) === "agent" && n.item.sender?.sessionId && e(P);
	});
	var L = s(M, 2), R = t(L, !0);
	w(L), w(b);
	var z = s(b, 2), B = t(z), ee = (e) => {
		var t = Ii();
		D(t, h, !0), w(t), T(t, (e, t) => kn?.(e, t), () => ({
			resolveResourceTitle: a(),
			onNavigate: o(),
			onOpenFile: n.onOpenFile
		})), F(e, t);
	}, V = (e) => {
		var i = Li(), a = t(i, !0);
		w(i), g(() => r(a, n.item.text || "")), F(e, i);
	};
	K(B, (e) => {
		c(d) === "assistant" || c(d) === "agent" ? e(ee) : e(V, -1);
	}), w(z), w(y), w(v), g((e, t) => {
		j(v, 1, `agent-message-row ${c(f)}`), r(S, e), r(R, t);
	}, [() => p(), () => m()]), F(e, v), l();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var Bi = P("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function Vi(e, n) {
	let i = N(n, "error", 3, !1), a = N(n, "alert", 3, !1);
	var o = Bi();
	let l;
	var d = t(o), f = t(d);
	{
		let e = u(() => i() ? "triangle-alert" : "info");
		U(f, { get name() {
			return c(e);
		} });
	}
	var p = s(f), m = t(p, !0);
	w(p), w(d);
	var h = s(d, 2), _ = t(h, !0);
	w(h), w(o), g(() => {
		l = j(o, 1, "timeline-notice", null, l, { "timeline-notice-error": i() }), I(o, "role", a() ? "alert" : void 0), r(m, n.title), r(_, n.text);
	}), F(e, o);
}
//#endregion
//#region src/components/ToolItem.svelte
var Hi = P("<pre> </pre>"), Ui = P("<details data-component-owner=\"event-timeline\"><summary><span class=\"tool-status-icon tool-status-icon-running\"><!></span><span class=\"tool-status-icon tool-status-icon-failed\"><!></span><span class=\"tool-status-icon tool-status-icon-completed\"><!></span><span> </span><small> </small></summary> <!></details>");
function Wi(e, n) {
	C(n, !0);
	function i() {
		return [n.call.name, n.call.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	function a() {
		return [
			n.call.error,
			n.call.output,
			n.call.rawPreview
		].filter(Boolean).join("\n\n");
	}
	var o = Ui(), d = t(o), f = t(d), p = t(f);
	U(p, { name: "loader-circle" }), w(f);
	var m = s(f), h = t(m);
	U(h, { name: "x-circle" }), w(m);
	var _ = s(m), v = t(_);
	U(v, { name: "check-circle" }), w(_);
	var y = s(_), b = t(y, !0);
	w(y);
	var x = s(y), S = t(x, !0);
	w(x), w(d);
	var T = s(d, 2), E = (e) => {
		var n = Hi(), i = t(n, !0);
		w(n), g((e) => r(i, e), [() => a()]), F(e, n);
	}, D = u(() => a());
	K(T, (e) => {
		c(D) && e(E);
	}), w(o), g((e, t, n) => {
		j(o, 1, e), r(b, t), r(S, n);
	}, [
		() => `agent-tool-item agent-tool-${String(n.call.status || "completed")}`,
		() => i(),
		() => String(n.call.method || "tool")
	]), F(e, o), l();
}
//#endregion
//#region src/components/ToolGroup.svelte
var Gi = P("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function Ki(e, n) {
	C(n, !0);
	let i = u(() => n.item.calls || []), o = u(() => ti(n.item)), d = u(() => c(i).map(f));
	function f(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var p = Gi(), m = t(p), h = t(m), _ = t(h);
	U(_, { name: "wrench" }), w(h);
	var v = s(h), y = t(v, !0);
	w(v);
	var b = s(v), x = t(b);
	w(b);
	var S = s(b), T = t(S);
	U(T, { name: "chevron-right" }), w(S), w(m);
	var E = s(m, 2);
	q(E, 21, () => c(i), (e) => String(e.callId || e.key), (e, t) => {
		Wi(e, { get call() {
			return c(t);
		} });
	}), w(E), w(p), g((e, t, i) => {
		I(p, "data-tool-group-key", e), p.open = n.open, r(y, t), r(x, `${i ?? ""}${c(d).length > 2 ? ` · +${c(d).length - 2} more` : ""}`);
	}, [
		() => `${n.generationId}:${ri(n.item)}`,
		() => ni(c(o)),
		() => c(d).slice(0, 2).join(" · ")
	]), a("toggle", p, (e) => n.onToggle(e.currentTarget.open)), F(e, p), l();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var qi = P("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function Ji(e, n) {
	C(n, !0);
	var i = qi(), a = t(i), o = t(a);
	U(o, { name: "info" });
	var c = s(o), u = t(c);
	w(c), w(a);
	var d = s(a), f = t(d, !0);
	w(d), w(i), g(() => {
		r(u, `Unhandled event: ${(n.item.type || n.item.kind) ?? ""}`), r(f, n.item.preview || "This event carries no payload.");
	}), F(e, i), l();
}
//#endregion
//#region src/components/HistoryTimeline.svelte
var Yi = P("<div class=\"history-state\"><!><span>Loading resource History...</span></div>"), Xi = P("<div class=\"history-state history-error\"><!><strong>History unavailable</strong><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), Zi = P("<button type=\"button\" class=\"secondary-button history-load-older\"><!> </button>"), Qi = P("<div class=\"history-legacy\"><!><span><strong>Legacy history</strong><small>Conversation history from before resource History was available was migrated to Artifacts.</small></span><button type=\"button\" class=\"secondary-button\">Open legacy history</button></div>"), $i = P("<div class=\"history-state\"><!><span>No resource History yet.</span></div>"), ea = P("<button type=\"button\" class=\"secondary-button\">Retry</button>"), ta = P("<div class=\"history-gap\"><!><span><strong>History gap</strong> </span><!></div>"), na = P("<span class=\"history-turn-trigger\"><span class=\"history-turn-trigger-label\">Trigger</span><span class=\"history-turn-trigger-text\"> </span></span>"), ra = P("<div class=\"history-detail-state\"><!>Loading Turn detail...</div>"), ia = P("<div class=\"history-detail-state history-error\"><!> </div>"), aa = P("<div class=\"history-item\"><!></div>"), oa = P("<div class=\"history-items\"></div>"), sa = P("<section><span class=\"history-turn-dot\"></span> <button type=\"button\" class=\"history-turn-header\"><span class=\"history-turn-meta\"><span class=\"history-turn-time\"> </span> <span class=\"history-status-pill\"> </span> <span class=\"history-turn-duration\"> </span> <span class=\"history-turn-count\"> <span><!></span></span></span> <!> <span> </span></button> <!> <!> <!></section>"), ca = P("<div class=\"history-generation\"><span class=\"history-generation-label\"> </span> <strong> </strong> <span class=\"history-generation-meta\"><span> </span> <span> </span> <span class=\"history-status-pill\"> </span></span></div> <div class=\"history-track\"></div>", 1), la = P("<!> <!> <!> <!>", 1), ua = P("<div data-component-owner=\"history-timeline\" class=\"history-timeline-root\"><!></div>");
function da(n, i) {
	C(i, !0);
	let a = N(i, "artifacts", 19, () => []), d = o(y(T())), f, p = o(""), m = o(y(/* @__PURE__ */ new Map())), _ = o(y(/* @__PURE__ */ new Set())), v = u(() => E(a(), "legacy-log.md"));
	V(() => {
		f = new li({ realtime: !1 });
		let e = f.subscribe((e) => {
			x(d, e, !0), queueMicrotask(i.onIconsChanged);
		});
		return f.activate(i.workspaceId, i.resourceId, null), () => {
			e(), f?.dispose(), f = void 0;
		};
	});
	function T() {
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
	function E(e, t) {
		for (let n of e || []) {
			if (n.type === "file" && n.name === t) return n.path;
			let e = E(n.children || [], t);
			if (e) return e;
		}
		return "";
	}
	function D(e) {
		if (!e) return "Unknown time";
		let t = new Date(e);
		return Number.isNaN(t.getTime()) ? e : t.toLocaleString(void 0, {
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function O(e) {
		let t = Math.max(0, Math.round(Number(e || 0) / 1e3));
		return t ? t < 60 ? `${t}s` : `${Math.floor(t / 60)}m ${t % 60}s` : "<1s";
	}
	function k(e, t) {
		return e?.trim() || `Unknown ${t}`;
	}
	let A = /* @__PURE__ */ new Set([
		"starting",
		"running",
		"waiting_approval",
		"stopping",
		"recovering",
		"active"
	]), M = /* @__PURE__ */ new Set([
		"cancelled",
		"canceled",
		"interrupted"
	]);
	function P(e) {
		let t = (e || "").trim().toLowerCase();
		return t === "completed" || t === "stopped" ? "completed" : A.has(t) ? "active" : M.has(t) ? "cancelled" : t === "failed" ? "failed" : "neutral";
	}
	function L(e) {
		e.kind === "turn" && e.turn?.reference && f?.loadTurn(e.turn.reference);
	}
	function R(e) {
		return !!(e.items || e.events);
	}
	function z(e) {
		return c(_).has(Y(e)) && R(e);
	}
	function B(e) {
		let t = Y(e);
		if (c(_).has(t)) {
			let e = new Set(c(_));
			e.delete(t), x(_, e, !0);
			return;
		}
		x(_, new Set(c(_)).add(t), !0), L(e);
	}
	function ee(e) {
		return Ur(e.events ? Vr(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || []);
	}
	function H(e) {
		let t = e.kind === "tools" ? ri(e) : String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event");
		return `${e.generationId || c(d).generationId}:${e.kind}:${t}`;
	}
	function W(e) {
		return c(m).get(H(e)) ?? !1;
	}
	function G(e, t) {
		x(m, new Map(c(m)).set(H(e), t), !0), t && te(e);
	}
	function te(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return f?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function J() {
		return Promise.reject(/* @__PURE__ */ Error("This is a read-only History view. Answer pending approvals from the Chat tab."));
	}
	function Y(e) {
		return e.turn?.reference || e.key;
	}
	function ne(e) {
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
	function re(e) {
		let t = e.turn;
		if (!t) return "unknown";
		let n = t.status || "unknown";
		return ne(e) ? `${n} · no final reply` : n;
	}
	function ie(e) {
		return e.turn?.triggerPreview?.trim() || "";
	}
	function ae(e) {
		return ne(e) ? "No final reply" : e.turn?.finalReplyPreview?.trim() || "Select to load conversation detail";
	}
	let oe = u(() => se(c(d).blocks));
	function se(e) {
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
	var ce = ua(), le = t(ce), ue = (e) => {
		var n = Yi(), r = t(n);
		U(r, {
			name: "loader-circle",
			className: "spin"
		}), S(), w(n), F(e, n);
	}, de = (e) => {
		var n = Xi(), i = t(n);
		U(i, { name: "triangle-alert" });
		var a = s(i, 2), o = t(a, !0);
		w(a);
		var l = s(a);
		w(n), g(() => r(o, c(d).error)), h("click", l, () => f?.retryHistory()), F(e, n);
	}, fe = (n) => {
		var a = la(), o = b(a), l = (e) => {
			var n = Zi(), i = t(n);
			U(i, { name: "chevrons-up" });
			var a = s(i, 1, !0);
			w(n), g(() => {
				n.disabled = c(d).loadingOlder, r(a, c(d).loadingOlder ? "Loading older History..." : "Load older History");
			}), h("click", n, () => f?.loadOlder()), F(e, n);
		};
		K(o, (e) => {
			c(d).hasMoreBefore && e(l);
		});
		var m = s(o, 2), _ = (e) => {
			Vi(e, {
				title: "History",
				get text() {
					return c(p);
				},
				error: !0
			});
		};
		K(m, (e) => {
			c(p) && e(_);
		});
		var y = s(m, 2), C = (e) => {
			var n = Qi(), r = t(n);
			U(r, { name: "archive-restore" });
			var a = s(r, 2);
			w(n), h("click", a, () => i.onOpenLegacy(c(v))), F(e, n);
		}, T = (e) => {
			var n = $i(), r = t(n);
			U(r, { name: "history" }), S(), w(n), F(e, n);
		};
		K(y, (e) => {
			c(d).loaded && !c(d).blocks.length && c(v) ? e(C) : c(d).loaded && !c(d).blocks.length && e(T, 1);
		});
		var E = s(y, 2);
		q(E, 17, () => c(oe), (e) => e.generation.generationId, (n, a) => {
			var o = ca(), l = b(o), m = t(l), _ = t(m);
			w(m);
			var v = s(m, 2), y = t(v, !0);
			w(v);
			var C = s(v, 2), T = t(C), E = t(T, !0);
			w(T);
			var A = s(T, 2), M = t(A, !0);
			w(A);
			var N = s(A, 2), L = t(N, !0);
			w(N), w(C), w(l);
			var R = s(l, 2);
			q(R, 21, () => c(a).blocks, (e) => e.key, (n, a) => {
				var o = e(), l = b(o), m = (e) => {
					var n = ta(), i = t(n);
					U(i, { name: "triangle-alert" });
					var o = s(i), l = s(t(o));
					w(o);
					var u = s(o), d = (e) => {
						var t = ea();
						h("click", t, () => f?.retryHistory()), F(e, t);
					};
					K(u, (e) => {
						c(a).gap?.retryable && e(d);
					}), w(n), g(() => {
						I(n, "data-timeline-key", c(a).key), r(l, ` — ${(c(a).gap?.message || "This generation could not be read.") ?? ""}`);
					}), F(e, n);
				}, _ = (e) => {
					var n = sa();
					let o;
					var l = t(n), f = s(l, 2), m = t(f), _ = t(m), v = t(_, !0);
					w(_);
					var y = s(_, 2), b = t(y, !0);
					w(y);
					var C = s(y, 2), T = t(C, !0);
					w(C);
					var E = s(C, 2), k = t(E), A = s(k);
					let M;
					var N = t(A);
					U(N, { name: "chevron-down" }), w(A), w(E), w(m);
					var L = s(m, 2), R = (e) => {
						var n = na(), i = s(t(n)), o = t(i, !0);
						w(i), w(n), g((e) => r(o, e), [() => ie(c(a))]), F(e, n);
					}, V = u(() => ie(c(a)));
					K(L, (e) => {
						c(V) && e(R);
					});
					var oe = s(L, 2);
					let se;
					var ce = t(oe, !0);
					w(oe), w(f);
					var le = s(f, 2), ue = (e) => {
						var n = ra(), r = t(n);
						U(r, {
							name: "loader-circle",
							className: "spin"
						}), S(), w(n), F(e, n);
					};
					K(le, (e) => {
						c(a).loading && e(ue);
					});
					var de = s(le, 2), fe = (e) => {
						var n = ia(), i = t(n);
						U(i, { name: "triangle-alert" });
						var o = s(i, 1, !0);
						w(n), g(() => r(o, c(a).error)), F(e, n);
					};
					K(de, (e) => {
						c(a).error && e(fe);
					});
					var pe = s(de, 2), me = (e) => {
						var n = oa();
						q(n, 21, () => ee(c(a)), (e) => H(e), (e, n) => {
							var r = aa(), o = t(r), s = (e) => {
								{
									let t = u(() => c(a).generation.agentName || c(a).generation.resolvedProfile || c(a).generation.binding?.name || "Agent");
									zi(e, {
										get item() {
											return c(n);
										},
										get agentName() {
											return c(t);
										},
										get workspaceId() {
											return i.workspaceId;
										},
										get resolveResourceTitle() {
											return i.resolveResourceTitle;
										},
										get onNavigate() {
											return i.onNavigate;
										},
										get onOpenFile() {
											return i.onOpenFile;
										}
									});
								}
							}, l = (e) => {
								Mi(e, {
									get item() {
										return c(n);
									},
									onExpand: () => te(c(n))
								});
							}, f = (e) => {
								{
									let t = u(() => W(c(n)));
									Ki(e, {
										get item() {
											return c(n);
										},
										get generationId() {
											return c(a).generation.generationId;
										},
										get open() {
											return c(t);
										},
										onToggle: (e) => G(c(n), e)
									});
								}
							}, m = (e) => {
								_r(e, {
									get item() {
										return c(n);
									},
									get generationId() {
										return c(a).generation.generationId;
									},
									get contextIdentity() {
										return c(d).identity;
									},
									onApproval: J,
									onToast: (e) => x(p, e, !0)
								});
							}, h = (e) => {
								Ai(e, { get item() {
									return c(n);
								} });
							}, _ = (e) => {
								{
									let t = u(() => c(n).text || "");
									Vi(e, {
										title: "Provider error",
										get text() {
											return c(t);
										},
										error: !0
									});
								}
							}, v = (e) => {
								Ji(e, { get item() {
									return c(n);
								} });
							};
							K(o, (e) => {
								c(n).kind === "message" ? e(s) : c(n).kind === "thinking" ? e(l, 1) : c(n).kind === "tools" ? e(f, 2) : c(n).kind === "approval" ? e(m, 3) : c(n).kind === "lifecycle" ? e(h, 4) : c(n).kind === "error" ? e(_, 5) : e(v, -1);
							}), w(r), g(() => I(r, "data-history-kind", c(n).kind)), F(e, r);
						}), w(n), F(e, n);
					}, he = u(() => z(c(a)));
					K(pe, (e) => {
						c(he) && e(me);
					}), w(n), g((e, t, i, s, u, d, p, m, h, g) => {
						o = j(n, 1, "history-turn", null, o, { "history-turn-loading": c(a).loading }), I(n, "data-timeline-key", e), I(l, "data-tone", t), I(f, "aria-expanded", i), r(v, s), I(y, "data-tone", u), r(b, d), r(T, p), r(k, `${c(a).turn.eventCount ?? ""} events · ${c(a).turn.toolEventCount ?? ""} tools `), M = j(A, 1, "history-turn-chevron", null, M, m), se = j(oe, 1, "history-turn-preview", null, se, h), r(ce, g);
					}, [
						() => Y(c(a)),
						() => P(c(a).turn.status),
						() => z(c(a)),
						() => D(c(a).turn.startedAt),
						() => P(c(a).turn.status),
						() => re(c(a)),
						() => O(c(a).turn.durationMs),
						() => ({ expanded: z(c(a)) }),
						() => ({ "history-turn-preview-empty": ne(c(a)) }),
						() => ae(c(a))
					]), h("click", f, () => B(c(a))), F(e, n);
				};
				K(l, (e) => {
					c(a).kind === "gap" ? e(m) : c(a).turn && e(_, 1);
				}), F(n, o);
			}), w(R), g((e, t, n, i) => {
				I(l, "data-generation-id", c(a).generation.generationId), r(_, `Generation ${c(a).generation.generation ?? ""}`), r(y, e), r(E, t), r(M, n), I(N, "data-tone", i), r(L, c(a).generation.status || "unknown");
			}, [
				() => k(c(a).generation.agentName, "agent"),
				() => k(c(a).generation.provider || c(a).generation.providerId, "provider"),
				() => k(c(a).generation.model, "model"),
				() => P(c(a).generation.status)
			]), F(n, o);
		}), F(n, a);
	};
	K(le, (e) => {
		c(d).loading && !c(d).loaded ? e(ue) : c(d).error && !c(d).loaded ? e(de, 1) : e(fe, -1);
	}), w(ce), F(n, ce), l();
}
p(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var fa = P("<button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button>"), pa = P("<button type=\"button\" class=\"secondary-button\"><!><span>Annotate</span></button>"), ma = P("<div class=\"markdown-preview\"><div class=\"markdown-document-actions\"><!><!></div><div class=\"markdown-view markdown-rendered\"></div></div>"), ha = P("<pre class=\"markdown-view\"> </pre>"), ga = P("<div class=\"content-section\" data-component-owner=\"markdown-document\"><!></div>");
function _a(e, n) {
	C(n, !0);
	let i = N(n, "editable", 3, !1), a = u(() => Ln(n.file.name));
	var o = ga(), d = t(o), f = (e) => {
		var r = ma(), a = t(r), o = t(a), c = (e) => {
			var r = fa(), i = t(r);
			U(i, { name: "pencil" }), S(), w(r), h("click", r, () => n.onEdit(n.file.path || n.file.name)), F(e, r);
		};
		K(o, (e) => {
			i() && n.onEdit && e(c);
		});
		var l = s(o), u = (e) => {
			var r = pa(), i = t(r);
			U(i, { name: "message-square-plus" }), S(), w(r), h("click", r, () => n.onAnnotate(n.file.path || n.file.name)), F(e, r);
		};
		K(l, (e) => {
			i() && n.onAnnotate && e(u);
		}), w(a);
		var d = s(a);
		D(d, () => En(n.file.content || "", {
			workspaceId: n.workspaceId,
			resolveResourceTitle: n.resolveResourceTitle
		}), !0), w(d), T(d, (e, t) => kn?.(e, t), () => ({
			resolveResourceTitle: n.resolveResourceTitle,
			onNavigate: n.onNavigate,
			onOpenFile: n.onOpenFile
		})), w(r), F(e, r);
	}, p = (e) => {
		var i = ha(), a = t(i, !0);
		w(i), g(() => r(a, n.file.content || "")), F(e, i);
	};
	K(d, (e) => {
		c(a) ? e(f) : e(p, -1);
	}), w(o), g(() => {
		I(o, "data-doc-file", n.file.name), I(o, "data-document-identity", `${n.workspaceId}:${n.file.path || n.file.name}:preview:${n.file.contentHash || "unversioned"}`);
	}), F(e, o), l();
}
p(["click"]);
//#endregion
//#region src/components/SchedulerPanel.svelte
var va = P("<button type=\"button\" class=\"secondary-button\">Cancel edit</button>"), ya = P("<article><header><div><strong> </strong><code> </code></div><div><button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button><button type=\"button\" class=\"secondary-button danger\"><!><span>Remove</span></button></div></header> <dl><div><dt>Condition</dt><dd> </dd></div><div><dt>Target</dt><dd><code> </code></dd></div></dl></article>"), ba = P("<div class=\"empty-list-row\"><!><span>No schedules. The Server will not create empty Scheduler Turns.</span></div>"), xa = P("<div class=\"schedule-editor\"><div class=\"schedule-editor-heading\"><div><strong> </strong><span>Conditions are natural language interpreted by the Scheduler Agent.</span></div><!></div> <label><span>Description</span><input placeholder=\"What should the Scheduler understand?\"/></label> <label><span>Condition</span><textarea rows=\"3\" placeholder=\"For example: when the release branch is green after 09:00 Shanghai time\"></textarea></label> <label><span>Target resource ID</span><input placeholder=\"workspace, scheduler, project1, or project1.task1\"/></label> <button type=\"button\"><span class=\"schedule-icon schedule-icon-busy\"><!></span><span class=\"schedule-icon schedule-icon-editing\"><!></span><span class=\"schedule-icon schedule-icon-add\"><!></span><span> </span></button></div> <div class=\"schedule-list\"><!></div>", 1);
function Sa(n, i) {
	C(i, !0);
	let a = new nn();
	R(() => a.dispose());
	let u = o(""), d = o(""), f = o(""), p = o("workspace"), m = o(!1);
	function _(e) {
		x(u, e.id, !0), x(d, e.description, !0), x(f, e.condition, !0), x(p, e.target, !0);
	}
	function v() {
		x(u, ""), x(d, ""), x(f, ""), x(p, "workspace");
	}
	async function y() {
		if (!c(d).trim() || !c(f).trim() || !c(p).trim() || c(m)) return;
		x(m, !0);
		let e = !!c(u);
		try {
			let t = `/api/workspaces/${encodeURIComponent(i.workspaceId)}/scheduler${c(u) ? `/${encodeURIComponent(c(u))}` : ""}`;
			await a.request(t, {
				method: c(u) ? "PUT" : "POST",
				body: JSON.stringify({
					description: c(d),
					condition: c(f),
					target: c(p)
				})
			}), v(), await i.onChanged(), i.onToast(e ? "Schedule updated." : "Schedule added.");
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		} finally {
			x(m, !1);
		}
	}
	async function T(e) {
		if (await dn({
			title: "Remove schedule",
			message: `Remove schedule ${e.id}?`,
			confirmLabel: "Remove",
			danger: !0
		})) try {
			await a.request(`/api/workspaces/${encodeURIComponent(i.workspaceId)}/scheduler/${encodeURIComponent(e.id)}`, { method: "DELETE" }), c(u) === e.id && v(), await i.onChanged(), i.onToast("Schedule removed.");
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var E = xa(), D = b(E), k = t(D), A = t(k), M = t(A), N = t(M, !0);
	w(M), S(), w(A);
	var P = s(A), I = (e) => {
		var t = va();
		h("click", t, v), F(e, t);
	};
	K(P, (e) => {
		c(u) && e(I);
	}), w(k);
	var L = s(k, 2), z = s(t(L));
	O(z), w(L);
	var B = s(L, 2), V = s(t(B));
	ee(V), w(B);
	var W = s(B, 2), G = s(t(W));
	O(G), w(W);
	var te = s(W, 2);
	let J;
	var Y = t(te), ne = t(Y);
	U(ne, { name: "loader-circle" }), w(Y);
	var re = s(Y), ie = t(re);
	U(ie, { name: "save" }), w(re);
	var ae = s(re), oe = t(ae);
	U(oe, { name: "plus" }), w(ae);
	var se = s(ae), ce = t(se, !0);
	w(se), w(te), w(D);
	var le = s(D, 2), ue = t(le), de = (n) => {
		var a = e(), o = b(a);
		q(o, 17, () => i.config.schedules, (e) => e.id, (e, n) => {
			var i = ya();
			let a;
			var o = t(i), l = t(o), d = t(l), f = t(d, !0);
			w(d);
			var p = s(d), m = t(p, !0);
			w(p), w(l);
			var v = s(l), y = t(v), b = t(y);
			U(b, { name: "pencil" }), S(), w(y);
			var x = s(y), C = t(x);
			U(C, { name: "trash-2" }), S(), w(x), w(v), w(o);
			var E = s(o, 2), D = t(E), O = s(t(D)), k = t(O, !0);
			w(O), w(D);
			var A = s(D), M = s(t(A)), N = t(M), P = t(N, !0);
			w(N), w(M), w(A), w(E), w(i), g(() => {
				a = j(i, 1, "", null, a, { editing: c(u) === c(n).id }), r(f, c(n).description), r(m, c(n).id), r(k, c(n).condition), r(P, c(n).target);
			}), h("click", y, () => _(c(n))), h("click", x, () => T(c(n))), F(e, i);
		}), F(n, a);
	}, fe = (e) => {
		var n = ba(), r = t(n);
		U(r, { name: "calendar-clock" }), S(), w(n), F(e, n);
	};
	K(ue, (e) => {
		i.config.schedules.length ? e(de) : e(fe, -1);
	}), w(le), g((e, t) => {
		r(N, c(u) ? "Edit schedule" : "Add schedule"), te.disabled = e, J = j(te, 1, "", null, J, t), r(ce, c(u) ? "Update schedule" : "Add schedule");
	}, [() => c(m) || !c(d).trim() || !c(f).trim() || !c(p).trim(), () => ({
		busy: c(m),
		editing: !!c(u)
	})]), H(z, () => c(d), (e) => x(d, e)), H(V, () => c(f), (e) => x(f, e)), H(G, () => c(p), (e) => x(p, e)), h("click", te, y), F(n, E), l();
}
p(["click"]);
//#endregion
//#region src/components/ResourceSettingsPanel.svelte
var Ca = P("<section class=\"resource-settings-card\"><div><strong>Workspace Agent</strong><span>Runs the Workspace Agent itself. Matches the selector in the chat composer.</span></div> <!></section> <section class=\"resource-settings-card\"><div><strong>New Project default</strong><span>Applied once when a Project is created in this Workspace.</span></div> <!></section> <section class=\"resource-settings-card\"><div><strong>New Task default</strong><span>Applied once when a Task is created, unless its Project overrides it.</span></div> <!></section>", 1), wa = P("<section class=\"resource-settings-card\"><div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div> <div class=\"resource-settings-interval\"><label><input type=\"number\" min=\"1\" max=\"10080\" step=\"1\" aria-label=\"Scheduler wake interval in minutes\"/><span>minutes</span></label> <button type=\"button\" class=\"secondary-button\"><!><span>Save</span></button></div></section>"), Ta = P("<section class=\"resource-settings-card\"><div><strong>Scheduler Agent</strong><span>Runs Scheduler wake-up Turns. Matches the selector in the chat composer.</span></div> <!></section> <!>", 1), Ea = P("<section class=\"resource-settings-card\"><div><strong>Project Agent</strong><span>Runs the Project Agent itself. Matches the selector in the chat composer.</span></div> <!></section> <section class=\"resource-settings-card\"><div><strong>New Task default</strong><span>Applied once when a Task is created in this Project. Inherit uses the Workspace default.</span></div> <!></section>", 1), Da = P("<section class=\"resource-settings-card\"><div><strong>Task Agent</strong><span>Runs the Task Agent itself. Matches the selector in the chat composer.</span></div> <!></section>"), Oa = P("<div class=\"resource-settings\" data-component-owner=\"resource-settings-panel\"><!></div>");
function ka(e, n) {
	C(n, !0);
	let r = new nn(), i = o(""), a = o(30);
	J(() => {
		let e = n.model.detail?.scheduler?.wakeIntervalMinutes;
		typeof e == "number" && x(a, e, !0);
	});
	let d = u(() => n.model.detail?.scheduler), f = u(() => n.model.detail?.taskDefault?.name ? {
		kind: n.model.detail.taskDefault.kind,
		name: n.model.detail.taskDefault.name
	} : {
		kind: "profile",
		name: ""
	});
	async function p(e, t) {
		if (!c(i)) {
			x(i, e, !0);
			try {
				await t();
			} catch (e) {
				n.model.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				x(i, "");
			}
		}
	}
	function m(e) {
		p("binding", () => n.model.onSaveAgentBinding(e));
	}
	function _(e, t) {
		let r = {
			...n.model.workspaceDefaults,
			[e]: t
		};
		p(`default:${e}`, () => n.model.onSaveWorkspaceDefaults(r));
	}
	function v(e) {
		p("taskDefault", () => n.model.onSaveTaskDefault(n.model.resourceId, e.name ? e : null));
	}
	function y() {
		let e = c(d);
		!e || !Number.isInteger(c(a)) || c(a) < 1 || c(a) > 10080 || p("interval", async () => {
			await r.request(`/api/workspaces/${encodeURIComponent(n.model.workspaceId)}/scheduler/settings`, {
				method: "PUT",
				body: JSON.stringify({
					agentBinding: e.agentBinding,
					wakeIntervalMinutes: c(a)
				})
			}), await n.model.onRefreshScheduler?.(), n.model.onToast("Scheduler interval saved.");
		});
	}
	var T = Oa(), E = t(T), D = (e) => {
		var r = Ca(), a = b(r), o = s(t(a), 2);
		{
			let e = u(() => !!c(i));
			$e(o, {
				get value() {
					return n.model.agentBinding;
				},
				get profiles() {
					return n.model.agentProfiles;
				},
				get agents() {
					return n.model.agents;
				},
				get disabled() {
					return c(e);
				},
				openUp: !1,
				ariaLabel: "Workspace Agent binding",
				onSelect: m
			});
		}
		w(a);
		var l = s(a, 2), d = s(t(l), 2);
		{
			let e = u(() => !!c(i));
			$e(d, {
				get value() {
					return n.model.workspaceDefaults.project;
				},
				get profiles() {
					return n.model.agentProfiles;
				},
				get agents() {
					return n.model.agents;
				},
				get disabled() {
					return c(e);
				},
				openUp: !1,
				ariaLabel: "New Project default binding",
				onSelect: (e) => _("project", e)
			});
		}
		w(l);
		var f = s(l, 2), p = s(t(f), 2);
		{
			let e = u(() => !!c(i));
			$e(p, {
				get value() {
					return n.model.workspaceDefaults.task;
				},
				get profiles() {
					return n.model.agentProfiles;
				},
				get agents() {
					return n.model.agents;
				},
				get disabled() {
					return c(e);
				},
				openUp: !1,
				ariaLabel: "New Task default binding",
				onSelect: (e) => _("task", e)
			});
		}
		w(f), F(e, r);
	}, k = (e) => {
		var r = Ta(), o = b(r), l = s(t(o), 2);
		{
			let e = u(() => !!c(i));
			$e(l, {
				get value() {
					return n.model.agentBinding;
				},
				get profiles() {
					return n.model.agentProfiles;
				},
				get agents() {
					return n.model.agents;
				},
				get disabled() {
					return c(e);
				},
				openUp: !1,
				ariaLabel: "Scheduler Agent binding",
				onSelect: m
			});
		}
		w(o);
		var f = s(o, 2), p = (e) => {
			var n = wa(), r = s(t(n), 2), o = t(r), l = t(o);
			O(l), S(), w(o);
			var u = s(o, 2), f = t(u);
			U(f, { name: "save" }), S(), w(u), w(r), w(n), g((e) => u.disabled = e, [() => !!c(i) || c(a) === c(d).wakeIntervalMinutes]), H(l, () => c(a), (e) => x(a, e)), h("click", u, y), F(e, n);
		};
		K(f, (e) => {
			c(d) && e(p);
		}), F(e, r);
	}, A = (e) => {
		var r = Ea(), a = b(r), o = s(t(a), 2);
		{
			let e = u(() => !!c(i));
			$e(o, {
				get value() {
					return n.model.agentBinding;
				},
				get profiles() {
					return n.model.agentProfiles;
				},
				get agents() {
					return n.model.agents;
				},
				get disabled() {
					return c(e);
				},
				openUp: !1,
				ariaLabel: "Project Agent binding",
				onSelect: m
			});
		}
		w(a);
		var l = s(a, 2), d = s(t(l), 2);
		{
			let e = u(() => !!c(i));
			$e(d, {
				get value() {
					return c(f);
				},
				get profiles() {
					return n.model.agentProfiles;
				},
				get agents() {
					return n.model.agents;
				},
				get disabled() {
					return c(e);
				},
				openUp: !1,
				allowInherit: !0,
				inheritLabel: "Inherit (Workspace default)",
				ariaLabel: "New Task default binding",
				onSelect: v
			});
		}
		w(l), F(e, r);
	}, j = (e) => {
		var r = Da(), a = s(t(r), 2);
		{
			let e = u(() => !!c(i));
			$e(a, {
				get value() {
					return n.model.agentBinding;
				},
				get profiles() {
					return n.model.agentProfiles;
				},
				get agents() {
					return n.model.agents;
				},
				get disabled() {
					return c(e);
				},
				openUp: !1,
				ariaLabel: "Task Agent binding",
				onSelect: m
			});
		}
		w(r), F(e, r);
	};
	K(E, (e) => {
		n.model.resourceType === "workspace" ? e(D) : n.model.resourceType === "scheduler" ? e(k, 1) : n.model.resourceType === "project" ? e(A, 2) : n.model.resourceType === "task" && e(j, 3);
	}), w(T), F(e, T), l();
}
p(["click"]);
//#endregion
//#region src/components/DetailPanel.svelte
var Aa = P("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), ja = P("<button type=\"button\" role=\"tab\"><!><span> </span></button>"), Ma = P("<div class=\"content-section\"><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>AGENTS.md unavailable</strong><span> </span></div></div>"), Na = P("<div class=\"content-section\"><div class=\"file-modal-empty wiki-status\"><!><strong>Loading AGENTS.md...</strong></div></div>"), Pa = P("<div class=\"content-section\"><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), Fa = P("<div class=\"content-section\"><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), Ia = P("<div class=\"details-header\"><h1 class=\"details-title\"> </h1></div> <div class=\"details-tabs\" role=\"tablist\" aria-label=\"Workspace details\"></div> <div id=\"detailsContent\" class=\"details-content\"><div><!></div> <div><!></div> <div><!></div></div>", 1), La = P("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), Ra = P("<code class=\"resource-ref-badge\"> </code>"), za = P("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), Ba = P("<button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button>"), Va = P("<div class=\"details-actions\"><!><!></div>"), Ha = P("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), Ua = P("<div><!></div>"), Wa = P("<div class=\"content-section\"><div class=\"file-modal-empty detail-missing\"><!><strong>Project brief is missing</strong><span>project.md was not found in this project directory.</span></div></div>"), Ga = P("<div class=\"content-section\"><div class=\"file-modal-empty detail-missing\"><!><strong>Task brief is missing</strong><span>task.md was not found in this task directory.</span></div></div>"), Ka = P("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), qa = P("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), Ja = P("<div class=\"content-section\"><div class=\"template-list\"><!></div></div>"), Ya = P("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), Xa = P("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), Za = P("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!> <!> <!> <div><!></div> <div><!></div> <!> <div><!></div> <div><div class=\"content-section\"><div class=\"worktree-list\"><!></div></div></div></div>", 1), Qa = P("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!></nav> <h1 class=\"details-title\"> <!></h1><!></div> <!>", 1), $a = P("<!> <!> <!>", 1);
function eo(i, a) {
	C(a, !0);
	let f = o(y(a.channel.current())), p = o(""), m = o(""), _ = o(y(/* @__PURE__ */ new Set())), v = o(null), T = o(null), E = /* @__PURE__ */ new Map(), D = new nn(), O = 0, k = u(() => (c(f).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), A = u(() => new Set(c(k).map((e) => e.name))), M = u(() => c(f).workspaceAgents && !c(f).workspaceAgents.error ? {
		name: "AGENTS.md",
		path: c(f).workspaceAgents.path || "AGENTS.md",
		content: c(f).workspaceAgents.content || "",
		contentHash: c(f).workspaceAgents.contentHash
	} : null), N = u(B), P = u(() => c(v) ? `${c(v).section}:${c(v).path}` : ""), L = u(() => c(f).resourceType === "workspace" ? !!(c(v) && (c(v).path === "AGENTS.md" || c(v).path === "")) : !c(f).detail?.archived && (c(f).resourceType === "project" || c(f).resourceType === "task"));
	V(() => a.channel.subscribe((e) => {
		let t = se(), n = ++O;
		if (x(f, e, !0), e.identity !== c(p)) {
			c(p) && c(m) && E.set(c(p), c(m)), x(p, e.identity, !0), x(v, null), x(T, null), x(_, /* @__PURE__ */ new Set(), !0);
			let t = E.get(c(p));
			x(m, t && t !== "work" ? t : z(e), !0);
			let n = document.getElementById("detailsContent");
			n && (n.scrollTop = 0);
		} else c(N).length && !c(N).some((e) => e.id === c(m)) && x(m, c(N)[0].id, !0);
		d().then(() => {
			n === O && ce(t), e.onIconsChanged();
		});
	})), V(() => {
		let e = (e) => {
			e.key === "Escape" && (c(T) ? (e.preventDefault(), x(T, null)) : c(v) && (e.preventDefault(), x(v, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), R(() => D.dispose());
	function z(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "workspace" ? "agents" : e.resourceType === "scheduler" ? "schedules" : e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "history";
	}
	function B() {
		if (c(f).resourceType === "workspace") return [
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
		if (!c(f).detail) return [];
		if (c(f).resourceType === "scheduler") return [
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
		return c(f).resourceType === "project" && e.push({
			id: "project",
			label: "Project",
			icon: "file-text"
		}), c(f).resourceType === "task" && e.push({
			id: "task",
			label: "Task",
			icon: "file-text"
		}), c(f).resourceType === "project" && e.push({
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
		}), c(f).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees",
			icon: "folder-git-2"
		}), e.push({
			id: "settings",
			label: "Settings",
			icon: "settings"
		}), e;
	}
	function ee(e) {
		return e.name === "scheduler.md" ? "context" : e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : c(N).find((e) => ["project", "task"].includes(e.id))?.id || "";
	}
	function H(e) {
		x(m, e, !0), E.set(c(p), e);
	}
	function W(e) {
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function G(e) {
		let t = new Set(c(_));
		t.has(e) ? t.delete(e) : t.add(e), x(_, t, !0), queueMicrotask(c(f).onIconsChanged);
	}
	function te(e, t, n = !1) {
		let r = n ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(c(f).workspaceId)}/files/raw?path=${encodeURIComponent(t)}${r}`;
	}
	function J(e, t, n) {
		x(v, {
			section: e,
			path: t,
			mode: n
		}, !0);
	}
	function Y(e) {
		J("Files", e);
	}
	function ne(e) {
		J("Files", e, "edit");
	}
	function re(e) {
		J("Files", e, "annotate");
	}
	function ie(e) {
		dn({
			title: "Delete artifact",
			message: `Delete artifact "${e.split("/").pop() || e}"? This cannot be undone.`,
			confirmLabel: "Delete",
			danger: !0
		}).then(async (t) => {
			if (t) try {
				await c(f).onDeleteArtifact(e), c(v) && c(v).section === "Artifacts" && c(v).path === e && x(v, null);
			} catch (e) {
				le(e instanceof Error ? e.message : String(e));
			}
		});
	}
	function ae(e, t, n) {
		return c(f).resourceType === "workspace" && (e === "AGENTS.md" || e === "") ? c(f).onSaveWorkspaceAgents(t, n) : c(f).onSaveMarkdownFile(e, t, n);
	}
	function oe(e) {
		return `${e.section}:${e.path}`;
	}
	function se() {
		if (!c(v)) return null;
		let e = document.querySelector("[data-preview-scroll]");
		return e ? {
			key: oe(c(v)),
			scrollTop: e.scrollTop,
			scrollLeft: e.scrollLeft
		} : null;
	}
	function ce(e) {
		if (!e || !c(v) || e.key !== oe(c(v))) return;
		let t = document.querySelector("[data-preview-scroll]");
		t && (t.scrollTop = e.scrollTop, t.scrollLeft = e.scrollLeft);
	}
	function le(e) {
		e && c(f).onToast(e);
	}
	var ue = $a(), de = b(ue), fe = (e) => {
		var n = Aa(), r = t(n), i = t(r);
		U(i, {
			name: "folder-search",
			className: "empty-state-icon"
		}), S(2), w(r), w(n), F(e, n);
	}, pe = (e) => {
		var n = Ia(), i = b(n), a = t(i), o = t(a, !0);
		w(a), w(i);
		var l = s(i, 2);
		q(l, 21, () => c(N), (e) => e.id, (e, n) => {
			var i = ja();
			let a;
			var o = t(i);
			U(o, { get name() {
				return c(n).icon;
			} });
			var l = s(o), u = t(l, !0);
			w(l), w(i), g(() => {
				a = j(i, 1, "details-tab", null, a, { active: c(m) === c(n).id }), I(i, "aria-selected", c(m) === c(n).id), r(u, c(n).label);
			}), h("click", i, () => H(c(n).id)), F(e, i);
		}), w(l);
		var d = s(l, 2), p = t(d), v = t(p), y = (e) => {
			_a(e, {
				get file() {
					return c(M);
				},
				get workspaceId() {
					return c(f).workspaceId;
				},
				editable: !0,
				get resolveResourceTitle() {
					return c(f).resolveResourceTitle;
				},
				get onNavigate() {
					return c(f).onNavigate;
				},
				onOpenFile: Y,
				onEdit: ne,
				onAnnotate: re
			});
		}, x = (e) => {
			var n = Ma(), i = t(n), a = t(i);
			U(a, { name: "triangle-alert" });
			var o = s(a, 2), l = t(o, !0);
			w(o), w(i), w(n), g(() => r(l, c(f).workspaceAgents.error)), F(e, n);
		}, C = (e) => {
			var n = Na(), r = t(n), i = t(r);
			U(i, { name: "loader-circle" }), S(), w(r), w(n), F(e, n);
		};
		K(v, (e) => {
			c(M) ? e(y) : c(f).workspaceAgents?.error ? e(x, 1) : e(C, -1);
		}), w(p);
		var T = s(p, 2), E = t(T), D = (e) => {
			var n = Pa(), i = t(n), a = t(i);
			U(a, { name: "triangle-alert" });
			var o = s(a, 2), l = t(o, !0);
			w(o), w(i), w(n), g(() => r(l, c(f).wiki.error)), F(e, n);
		}, O = (e) => {
			var n = Fa(), r = t(n), i = t(r);
			U(i, { name: "book-open" }), S(2), w(r), w(n), F(e, n);
		}, k = (e) => {
			{
				let t = u(() => c(f).wiki.entries || []);
				qn(e, {
					title: "Wiki",
					get entries() {
						return c(t);
					},
					emptyMessage: "No Wiki files yet.",
					get expanded() {
						return c(_);
					},
					get activePath() {
						return c(P);
					},
					onToggle: G,
					onPreview: J,
					rawURL: te,
					showHeading: !1
				});
			}
		};
		K(E, (e) => {
			c(f).wiki?.error ? e(D) : c(f).wiki?.exists ? e(k, -1) : e(O, 1);
		}), w(T);
		var A = s(T, 2);
		ka(t(A), { get model() {
			return c(f);
		} }), w(A), w(d), g(() => {
			r(o, c(f).workspaceName), I(p, "hidden", c(m) !== "agents"), I(T, "hidden", c(m) !== "wiki"), I(A, "hidden", c(m) !== "settings");
		}), F(e, n);
	}, me = (i) => {
		var a = Qa(), o = b(a), l = t(o), d = t(l), p = t(d, !0);
		w(d);
		var v = s(d, 2), y = (e) => {
			var n = La(), i = s(b(n)), a = t(i, !0);
			w(i), g(() => r(a, c(f).parent.title)), h("click", i, () => c(f).onNavigate(c(f).parent?.id || "workspace")), F(e, n);
		};
		K(v, (e) => {
			c(f).parent && e(y);
		}), w(l);
		var C = s(l, 2), E = t(C, !0), D = s(E), O = (e) => {
			var n = Ra(), i = t(n, !0);
			w(n), g((e) => r(i, e), [() => W(c(f).resourceId)]), F(e, n);
		};
		K(D, (e) => {
			c(f).resourceType !== "scheduler" && e(O);
		}), w(C);
		var M = s(C), L = (e) => {
			var n = Va(), r = t(n), i = (e) => {
				var n = za(), r = t(n);
				U(r, { name: "plus" }), S(), w(n), h("click", n, () => c(f).onCreateTask(c(f).resourceId)), F(e, n);
			};
			K(r, (e) => {
				c(f).resourceType === "project" && e(i);
			});
			var a = s(r), o = (e) => {
				var n = Ba(), r = t(n);
				U(r, { name: "archive" }), S(), w(n), h("click", n, () => c(f).onArchive(c(f).resourceId)), F(e, n);
			};
			K(a, (e) => {
				c(f).resourceType !== "scheduler" && e(o);
			}), w(n), F(e, n);
		};
		K(M, (e) => {
			c(f).detail && e(L);
		}), w(o);
		var R = s(o, 2), z = (e) => {
			var n = Ha(), r = t(n), i = t(r);
			U(i, {
				name: "loader-circle",
				className: "empty-state-icon"
			}), S(), w(r), w(n), F(e, n);
		}, B = (i) => {
			var a = Za(), o = b(a);
			q(o, 21, () => c(N), (e) => e.id, (e, n) => {
				var i = ja();
				let a;
				var o = t(i);
				U(o, { get name() {
					return c(n).icon;
				} });
				var l = s(o), u = t(l, !0);
				w(l), w(i), g(() => {
					a = j(i, 1, "details-tab", null, a, { active: c(m) === c(n).id }), I(i, "aria-selected", c(m) === c(n).id), r(u, c(n).label);
				}), h("click", i, () => H(c(n).id)), F(e, i);
			}), w(o);
			var l = s(o, 2), d = t(l);
			q(d, 17, () => c(k), (e) => e.path || e.name, (e, n) => {
				var r = Ua(), i = t(r);
				{
					let e = u(() => !c(f).detail.archived && (c(f).resourceType === "project" || c(f).resourceType === "task"));
					_a(i, {
						get file() {
							return c(n);
						},
						get workspaceId() {
							return c(f).workspaceId;
						},
						get editable() {
							return c(e);
						},
						get resolveResourceTitle() {
							return c(f).resolveResourceTitle;
						},
						get onNavigate() {
							return c(f).onNavigate;
						},
						onOpenFile: Y,
						onEdit: ne,
						onAnnotate: re
					});
				}
				w(r), g((e) => I(r, "hidden", e), [() => c(m) !== ee(c(n))]), F(e, r);
			});
			var p = s(d, 2), v = (e) => {
				var n = Wa(), r = t(n), i = t(r);
				U(i, { name: "file-text" }), S(2), w(r), w(n), g(() => I(n, "hidden", c(m) !== "project")), F(e, n);
			}, y = u(() => c(f).resourceType === "project" && !c(A).has("project.md"));
			K(p, (e) => {
				c(y) && e(v);
			});
			var C = s(p, 2), E = (e) => {
				var n = Ga(), r = t(n), i = t(r);
				U(i, { name: "file-text" }), S(2), w(r), w(n), g(() => I(n, "hidden", c(m) !== "task")), F(e, n);
			}, D = u(() => c(f).resourceType === "task" && !c(A).has("task.md"));
			K(C, (e) => {
				c(D) && e(E);
			});
			var O = s(C, 2), M = (e) => {
				var n = Ua(), r = t(n);
				{
					let e = u(() => c(f).onRefreshScheduler || (async () => void 0));
					Sa(r, {
						get workspaceId() {
							return c(f).workspaceId;
						},
						get config() {
							return c(f).detail.scheduler;
						},
						get onChanged() {
							return c(e);
						},
						get onToast() {
							return c(f).onToast;
						}
					});
				}
				w(n), g(() => I(n, "hidden", c(m) !== "schedules")), F(e, n);
			};
			K(O, (e) => {
				c(f).resourceType === "scheduler" && c(f).detail.scheduler && e(M);
			});
			var L = s(O, 2);
			ka(t(L), { get model() {
				return c(f);
			} }), w(L);
			var R = s(L, 2), z = t(R), B = (n) => {
				var i = Ja(), a = t(i), o = t(a), l = (n) => {
					var i = e(), a = b(i);
					q(a, 17, () => c(f).detail.templates, (e) => e.name, (e, n) => {
						var i = Ka();
						let a;
						var o = t(i);
						U(o, { name: "file-text" });
						var l = s(o), u = t(l), d = t(u, !0);
						w(u);
						var f = s(u), p = t(f);
						w(f), w(l);
						var m = s(l);
						U(m, { name: "chevron-right" }), w(i), g(() => {
							a = j(i, 1, "template-row", null, a, { invalid: !c(n).valid }), r(d, c(n).title || c(n).name), r(p, `${c(n).name ?? ""} · v${(c(n).schemaVersion || "?") ?? ""} · ${c(n).valid ? `${(c(n).fields || []).length} fields` : `invalid${c(n).errors?.[0]?.message ? `: ${c(n).errors[0].message}` : ""}`}${c(n).legacy ? " · legacy" : ""}`);
						}), h("click", i, () => c(n).path && J("Templates", c(n).path)), F(e, i);
					}), F(n, i);
				}, u = (e) => {
					var n = qa(), r = t(n);
					U(r, { name: "layout-template" }), S(), w(n), F(e, n);
				};
				K(o, (e) => {
					c(f).detail.templates?.length ? e(l) : e(u, -1);
				}), w(a), w(i), F(n, i);
			};
			K(z, (e) => {
				c(f).resourceType === "project" && e(B);
			}), w(R);
			var V = s(R, 2), W = (t) => {
				var r = e(), i = b(r);
				n(i, () => c(f).identity, (e) => {
					{
						let t = u(() => c(f).detail.artifacts || []);
						da(e, {
							get workspaceId() {
								return c(f).workspaceId;
							},
							get resourceId() {
								return c(f).resourceId;
							},
							get artifacts() {
								return c(t);
							},
							get resolveResourceTitle() {
								return c(f).resolveResourceTitle;
							},
							get onNavigate() {
								return c(f).onNavigate;
							},
							onOpenFile: Y,
							onOpenLegacy: (e) => J("Artifacts", e),
							get onIconsChanged() {
								return c(f).onIconsChanged;
							}
						});
					}
				}), F(t, r);
			};
			K(V, (e) => {
				c(m) === "history" && e(W);
			});
			var ae = s(V, 2), oe = t(ae);
			{
				let e = u(() => c(f).detail.artifacts || []), t = u(() => c(f).detail.archived ? void 0 : ie);
				qn(oe, {
					title: "Artifacts",
					get entries() {
						return c(e);
					},
					emptyMessage: "No artifacts.",
					get expanded() {
						return c(_);
					},
					get activePath() {
						return c(P);
					},
					onToggle: G,
					onPreview: J,
					rawURL: te,
					get onDelete() {
						return c(t);
					},
					showHeading: !1
				});
			}
			w(ae);
			var se = s(ae, 2), ce = t(se), le = t(ce), ue = t(le), de = (n) => {
				var i = e(), a = b(i);
				q(a, 17, () => c(f).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, n) => {
					var i = Ya(), a = t(i), o = t(a);
					U(o, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var l = s(o), u = t(l), d = t(u, !0);
					w(u);
					var f = s(u), p = t(f);
					w(f);
					var m = s(f), _ = t(m, !0);
					w(m), w(l), w(a);
					var v = s(a), y = t(v);
					U(y, { name: "git-compare-arrows" }), S(), w(v), w(i), g(() => {
						r(d, c(n).branch || "HEAD"), r(p, `${(c(n).name || "repository") ?? ""}${c(n).targetBranch || c(n).baseBranch ? ` · base ${c(n).targetBranch || c(n).baseBranch}` : ""}`), r(_, c(n).worktreePath || "");
					}), h("click", v, () => x(T, c(n), !0)), F(e, i);
				}), F(n, i);
			}, fe = (e) => {
				var n = Xa(), r = t(n);
				U(r, { name: "git-branch" }), S(), w(n), F(e, n);
			};
			K(ue, (e) => {
				c(f).detail.repos?.length ? e(de) : e(fe, -1);
			}), w(le), w(ce), w(se), w(l), g(() => {
				I(L, "hidden", c(m) !== "settings"), I(R, "hidden", c(m) !== "template"), I(ae, "hidden", c(m) !== "artifacts"), I(se, "hidden", c(m) !== "worktrees");
			}), F(i, a);
		};
		K(R, (e) => {
			c(f).loading || !c(f).detail ? e(z) : e(B, -1);
		}), g(() => {
			r(p, c(f).workspaceName), r(E, c(f).resourceTitle);
		}), h("click", d, () => c(f).onNavigate("workspace")), F(i, a);
	};
	K(de, (e) => {
		c(f).workspaceId ? c(f).resourceType === "workspace" ? e(pe, 1) : e(me, -1) : e(fe);
	});
	var he = s(de, 2);
	cr(he, {
		get client() {
			return D;
		},
		get workspaceId() {
			return c(f).workspaceId;
		},
		get resourceId() {
			return c(f).resourceId;
		},
		get selection() {
			return c(v);
		},
		get editable() {
			return c(L);
		},
		get resolveResourceTitle() {
			return c(f).resolveResourceTitle;
		},
		get onNavigate() {
			return c(f).onNavigate;
		},
		onOpenFile: Y,
		onSaveMarkdown: ae,
		onClose: () => x(v, null),
		onError: le,
		get onIconsChanged() {
			return c(f).onIconsChanged;
		}
	}), _n(s(he, 2), {
		get client() {
			return D;
		},
		get workspaceId() {
			return c(f).workspaceId;
		},
		get resourceId() {
			return c(f).resourceId;
		},
		get repo() {
			return c(T);
		},
		onClose: () => x(T, null),
		onError: le,
		get onIconsChanged() {
			return c(f).onIconsChanged;
		}
	}), F(i, ue), l();
}
p(["click"]);
//#endregion
//#region src/components/generation-status.ts
var to = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"stopping",
	"recovering"
]), no = /* @__PURE__ */ new Set([
	"idle",
	"idle-suspended",
	"stopped",
	"failed",
	"archived"
]);
function ro(e) {
	return String(e || "").trim();
}
function io(e, t) {
	let n = ro(e.generation.status) || "unknown", r = t?.generation;
	if (!r || r.generationId !== e.generation.generationId) return n;
	let i = ro(r.status);
	if (!t?.state) return i || n;
	switch (t.state) {
		case "working": return to.has(i) ? i : "running";
		case "attention_required": return i === "waiting_approval" ? i : "waiting_approval";
		case "idle": return no.has(i) ? i : "idle";
		case "archived": return "archived";
		case "unavailable": return i === "failed" || i === "recovering" ? i : "failed";
		default: return i || n;
	}
}
//#endregion
//#region src/components/EventTimeline.svelte
var ao = P("<button type=\"button\"><span class=\"load-older-icon load-older-icon-idle\"><!></span><span class=\"load-older-icon load-older-icon-busy\"><!></span><span> </span></button>"), oo = P("<div class=\"conversation-generation\"><span> </span><strong> </strong><small> </small></div>"), so = P("<button type=\"button\" class=\"secondary-button\">Retry</button>"), co = P("<div class=\"conversation-gap\"><!><span><strong>History unavailable</strong><small> </small></span><!></div>"), lo = P("<div class=\"turn-summary-preview\"> </div>"), uo = P("<div><!></div>"), fo = P("<div class=\"turn-loading\"><!><span>Loading turn details</span></div>"), po = P("<section><!> <!> <!> <!></section>"), mo = P("<!> <!>", 1), ho = P("<div class=\"turn-working-indicator\" role=\"status\" aria-live=\"polite\" data-timeline-key=\"turn-working\"><!><span>working...</span></div>"), go = P("<div class=\"chat-timeline-empty\"><!><strong>Loading resource history</strong></div>"), _o = P("<div class=\"chat-timeline-empty\"><!><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>"), vo = P("<!> <!> <!> <!> <!> <!> <!>", 1), yo = P("<div class=\"chat-timeline-empty\"><!><strong>No resource selected</strong></div>"), bo = P("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div> <!>", 1);
function xo(e, n) {
	C(n, !0);
	let i = o(y(n.channel.current())), a = o(y(n.channel.current().project)), f = o(y(ue())), p = o(void 0), m, _ = null, v = !1, D = !1, O = !0, k = o(null), A = new nn(), M = /* @__PURE__ */ new Map(), N = o(y(/* @__PURE__ */ new Map()));
	V(() => {
		let e = re(), t = () => {
			O = ae(re());
		};
		e?.addEventListener("scroll", t, { passive: !0 });
		let r = typeof ResizeObserver > "u" || !e ? null : new ResizeObserver(() => {
			O && !ie() && se();
		});
		e && r && r.observe(e), m = new li({
			onEvent: (e, t, n) => c(i).onEvent(e, t, n),
			onNotice: (e, t, n) => c(i).onNotice(e, t, n)
		});
		let o = m.subscribe(P), s = n.channel.subscribe((e) => {
			let t = c(i).identity, n = oe(c(i).status) !== oe(e.status) && O;
			x(i, e, !0), e.project !== c(a) && x(a, e.project, !0), e.identity !== t && (D = !0, _ = null, x(k, null), x(N, new Map(M.get(e.identity) ?? []), !0)), m?.activate(e.workspaceId, e.resourceId, e.status), d().then(() => {
				n && !ie() && se(), e.onIconsChanged();
			});
		}), l = () => {
			if (!_ || ie()) return;
			let e = _;
			_ = null, L(e);
		}, u = (e) => {
			e.key !== "Escape" || !c(k) || (e.preventDefault(), x(k, null));
		};
		return document.addEventListener("selectionchange", l), document.addEventListener("keydown", u), () => {
			o(), s(), document.removeEventListener("selectionchange", l), document.removeEventListener("keydown", u), e?.removeEventListener("scroll", t), r?.disconnect(), m?.dispose(), m = void 0, e && e.removeAttribute("data-agent-resource-id");
		};
	}), R(() => A.dispose());
	function P(e) {
		if (c(f).identity && e.identity === c(f).identity && ie()) {
			_ = e;
			return;
		}
		L(e);
	}
	function L(e) {
		let t = re();
		(e.identity !== c(f).identity || D) && (O = !0), v = O, D = !1, x(f, e, !0), t && (t.dataset.agentResourceId = e.resourceId), d().then(() => {
			v && !ie() && se(), c(i).onIconsChanged(), e.loaded && e.hasMoreBefore && H(e.identity);
		});
	}
	function z(e, t) {
		let n = t;
		if (typeof IntersectionObserver > "u") return n && m?.loadTurn(n), {
			update(e) {
				n = e, n && m?.loadTurn(n);
			},
			destroy() {}
		};
		let r = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && n && m?.loadTurn(n);
		}, {
			root: re(),
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
	function B(e) {
		return Ur(e.events ? c(a)(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || []);
	}
	function ee(e) {
		return e.generation.agentName || e.generation.resolvedProfile || e.generation.binding?.name || c(i).agentName || "Agent";
	}
	async function H(e) {
		let t = 0;
		for (; t < 16 && c(f).identity === e && c(f).hasMoreBefore;) {
			let e = re();
			if (!e || e.scrollHeight > e.clientHeight + 160 || ie() || !await m?.loadOlder()) return;
			t++, await d(), se();
		}
	}
	async function W() {
		let e = re();
		if (!e || c(f).loadingOlder) return;
		let t = ce(e), n = t?.getBoundingClientRect().top ?? 0, r = e.scrollHeight, a = e.scrollTop, o = c(f).identity;
		await m?.loadOlder(), await d(), c(f).identity === o && (e.scrollTop = t?.isConnected ? a + (t.getBoundingClientRect().top - n) : a + (e.scrollHeight - r), c(i).onIconsChanged());
	}
	function G(e, t) {
		let n = le(e);
		x(N, new Map(c(N)).set(n, t), !0), M.set(c(f).identity, new Map(c(N))), t && te(e);
	}
	function te(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return m?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function J(e) {
		return c(N).get(le(e)) ?? !1;
	}
	function Y(e) {
		x(k, {
			section: "Files",
			path: e
		}, !0);
	}
	function ne() {
		return Promise.reject(/* @__PURE__ */ Error("Chat file previews are read-only."));
	}
	function re() {
		return c(p)?.parentElement ?? null;
	}
	function ie() {
		let e = re(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function ae(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function oe(e) {
		return e?.session?.state === "running" && !!e.session.currentTurnId;
	}
	function se() {
		let e = re();
		e && (e.scrollTop = e.scrollHeight);
	}
	function ce(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function le(e) {
		let t = e.kind === "tools" ? ri(e) : String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event");
		return `${e.generationId || c(f).generationId}:${e.kind}:${t}`;
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
	var de = bo(), fe = b(de), pe = t(fe), me = (e) => {
		var n = vo(), a = b(n), o = (e) => {
			var n = ao();
			let i;
			var a = t(n), o = t(a);
			U(o, { name: "chevrons-up" }), w(a);
			var l = s(a), u = t(l);
			U(u, { name: "loader-circle" }), w(l);
			var d = s(l), p = t(d, !0);
			w(d), w(n), g(() => {
				i = j(n, 1, "load-older-events", null, i, { busy: c(f).loadingOlder }), n.disabled = c(f).loadingOlder, r(p, c(f).loadingOlder ? "Loading..." : "Load older messages");
			}), h("click", n, W), F(e, n);
		};
		K(a, (e) => {
			c(f).hasMoreBefore && e(o);
		});
		var l = s(a, 2);
		q(l, 19, () => c(f).blocks, (e) => e.key, (e, n, a) => {
			var o = mo(), l = b(o), d = (e) => {
				var a = oo(), o = t(a), l = t(o);
				w(o);
				var u = s(o), d = t(u, !0);
				w(u);
				var f = s(u), p = t(f, !0);
				w(f), w(a), g((e, t) => {
					I(a, "data-generation-id", c(n).generation.generationId), r(l, `Generation ${c(n).generation.generation ?? ""}`), r(d, c(n).generation.agentName || c(n).generation.resolvedProfile || c(n).generation.binding?.name || "Agent"), I(f, "data-generation-status", e), r(p, t);
				}, [() => io(c(n), c(i).status), () => io(c(n), c(i).status)]), F(e, a);
			};
			K(l, (e) => {
				(c(a) === 0 || c(f).blocks[c(a) - 1].generation.generationId !== c(n).generation.generationId) && e(d);
			});
			var p = s(l, 2), _ = (e) => {
				var i = co(), a = t(i);
				U(a, { name: "triangle-alert" });
				var o = s(a), l = s(t(o)), u = t(l, !0);
				w(l), w(o);
				var d = s(o), f = (e) => {
					var t = so();
					h("click", t, () => m?.retryHistory()), F(e, t);
				};
				K(d, (e) => {
					c(n).gap?.retryable && e(f);
				}), w(i), g(() => {
					I(i, "data-timeline-key", c(n).key), r(u, c(n).gap?.message || "This generation could not be read.");
				}), F(e, i);
			}, v = (e) => {
				var a = po();
				let o;
				var l = t(a), d = (e) => {
					var i = lo(), a = t(i, !0);
					w(i), g(() => r(a, c(n).turn.triggerPreview)), F(e, i);
				};
				K(l, (e) => {
					c(n).turn?.triggerPreview && !c(n).items && !c(n).events && e(d);
				});
				var p = s(l, 2);
				q(p, 17, () => B(c(n)), (e) => le(e), (e, r) => {
					var a = uo(), o = t(a), s = (e) => {
						{
							let t = u(() => ee(c(n)));
							zi(e, {
								get item() {
									return c(r);
								},
								get agentName() {
									return c(t);
								},
								get workspaceId() {
									return c(i).workspaceId;
								},
								get resolveResourceTitle() {
									return c(i).resolveResourceTitle;
								},
								get onNavigate() {
									return c(i).onNavigate;
								},
								onOpenFile: Y
							});
						}
					}, l = (e) => {
						Mi(e, {
							get item() {
								return c(r);
							},
							onExpand: () => te(c(r))
						});
					}, d = (e) => {
						{
							let t = u(() => J(c(r)));
							Ki(e, {
								get item() {
									return c(r);
								},
								get generationId() {
									return c(n).generation.generationId;
								},
								get open() {
									return c(t);
								},
								onToggle: (e) => G(c(r), e)
							});
						}
					}, p = (e) => {
						_r(e, {
							get item() {
								return c(r);
							},
							get generationId() {
								return c(n).generation.generationId;
							},
							get contextIdentity() {
								return c(f).identity;
							},
							get onApproval() {
								return c(i).onApproval;
							},
							get onToast() {
								return c(i).onToast;
							}
						});
					}, m = (e) => {
						Ai(e, { get item() {
							return c(r);
						} });
					}, h = (e) => {
						{
							let t = u(() => c(r).text || "");
							Vi(e, {
								title: "Provider error",
								get text() {
									return c(t);
								},
								error: !0
							});
						}
					}, _ = (e) => {
						Ji(e, { get item() {
							return c(r);
						} });
					};
					K(o, (e) => {
						c(r).kind === "message" ? e(s) : c(r).kind === "thinking" ? e(l, 1) : c(r).kind === "tools" ? e(d, 2) : c(r).kind === "approval" ? e(p, 3) : c(r).kind === "lifecycle" ? e(m, 4) : c(r).kind === "error" ? e(h, 5) : e(_, -1);
					}), w(a), g((e) => I(a, "data-timeline-key", e), [() => le(c(r))]), F(e, a);
				});
				var m = s(p, 2), h = (e) => {
					var n = fo(), r = t(n);
					U(r, { name: "loader-circle" }), S(), w(n), F(e, n);
				};
				K(m, (e) => {
					c(n).loading && !c(n).items && !c(n).events && e(h);
				});
				var _ = s(m, 2), v = (e) => {
					Vi(e, {
						title: "Turn unavailable",
						get text() {
							return c(n).error;
						},
						error: !0
					});
				};
				K(_, (e) => {
					c(n).error && e(v);
				}), w(a), T(a, (e, t) => z?.(e, t), () => c(n).turn?.reference || ""), g(() => {
					o = j(a, 1, "conversation-turn", null, o, { "conversation-turn-loading": c(n).loading }), I(a, "data-timeline-key", c(n).key);
				}), F(e, a);
			};
			K(p, (e) => {
				c(n).kind === "gap" ? e(_) : e(v, -1);
			}), F(e, o);
		});
		var d = s(l, 2);
		q(d, 19, () => c(f).notices, (e, t) => `notice:${c(f).identity}:${t}:${String(e.data?.text || "")}`, (e, n, r) => {
			var i = uo(), a = t(i);
			{
				let e = u(() => String(c(n).data?.text || "")), t = u(() => c(n).data?.level === "error");
				Vi(a, {
					title: "Forge",
					get text() {
						return c(e);
					},
					get error() {
						return c(t);
					}
				});
			}
			w(i), g(() => I(i, "data-timeline-key", `notice:${c(r)}`)), F(e, i);
		});
		var p = s(d, 2), _ = (e) => {
			Vi(e, {
				title: "Timeline error",
				get text() {
					return c(f).error;
				},
				error: !0,
				alert: !0
			});
		};
		K(p, (e) => {
			c(f).error && e(_);
		});
		var v = s(p, 2), y = (e) => {
			var n = ho(), r = t(n);
			U(r, { name: "loader-circle" }), S(), w(n), F(e, n);
		}, x = u(() => oe(c(i).status));
		K(v, (e) => {
			c(x) && e(y);
		});
		var C = s(v, 2), E = (e) => {
			var n = go(), r = t(n);
			U(r, { name: "loader-circle" }), S(), w(n), F(e, n);
		};
		K(C, (e) => {
			c(f).loading && !c(f).blocks.length && e(E);
		});
		var D = s(C, 2), O = (e) => {
			var n = _o(), r = t(n);
			U(r, { name: "bot" }), S(2), w(n), F(e, n);
		}, k = u(() => c(f).loaded && !c(f).loading && !c(f).blocks.length && !c(f).notices.length && !oe(c(i).status));
		K(D, (e) => {
			c(k) && e(O);
		}), F(e, n);
	}, he = (e) => {
		var n = yo(), r = t(n);
		U(r, { name: "bot" }), S(), w(n), F(e, n);
	};
	K(pe, (e) => {
		c(f).resourceId ? e(me) : e(he, -1);
	}), w(fe), E(fe, (e) => x(p, e), () => c(p)), cr(s(fe, 2), {
		get client() {
			return A;
		},
		get workspaceId() {
			return c(i).workspaceId;
		},
		get resourceId() {
			return c(i).resourceId;
		},
		get selection() {
			return c(k);
		},
		editable: !1,
		get resolveResourceTitle() {
			return c(i).resolveResourceTitle;
		},
		get onNavigate() {
			return c(i).onNavigate;
		},
		onOpenFile: Y,
		onSaveMarkdown: ne,
		onClose: () => x(k, null),
		get onError() {
			return c(i).onToast;
		},
		get onIconsChanged() {
			return c(i).onIconsChanged;
		}
	}), g(() => I(fe, "data-chat-context", c(f).identity)), F(e, de), l();
}
p(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function So(e) {
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
function Co(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		newProfile: { ...e.newProfile }
	};
}
function wo(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var To = P("<span class=\"settings-pill\"> </span>"), Eo = P("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), Do = P("<div class=\"settings-empty\">No AgentHub agents available.</div>"), Oo = P("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function ko(e, n) {
	C(n, !0);
	let i = N(n, "draft", 15), a = N(n, "pending", 15);
	async function o() {
		if (!(!i().dirty || a())) {
			a("agenthub");
			try {
				await n.onSaveAgentHub(Co(i())), i(i().dirty = !1, !0);
			} catch (e) {
				n.onToast(wo(e));
			} finally {
				a("");
			}
		}
	}
	var u = Oo(), d = s(t(u), 2), f = t(d), p = s(t(f)), m = t(p, !0);
	w(p), w(f);
	var v = s(f, 2), y = s(t(v));
	O(y), w(v);
	var b = s(v, 2), x = t(b, !0);
	w(b);
	var T = s(b, 2);
	q(T, 21, () => n.agentHub.capabilities, _, (e, n) => {
		var i = To(), a = t(i, !0);
		w(i), g(() => r(a, c(n))), F(e, i);
	}), w(T), w(d);
	var E = s(d, 2), D = t(E), k = s(t(D)), A = t(k);
	w(k), w(D);
	var M = s(D, 2);
	q(M, 21, () => n.agentHub.agents, (e) => e.name, (e, n) => {
		var i = Eo(), a = t(i), o = t(a), l = t(o, !0);
		w(o);
		var u = s(o), d = t(u), f = t(d, !0);
		w(d);
		var p = s(d), m = t(p);
		w(p), w(u), w(a), w(i), g((e) => {
			r(l, e), r(f, c(n).name), r(m, `${(c(n).providerId || "") ?? ""} · ${(c(n).available === !1 ? c(n).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (c(n).name || "A").slice(0, 1).toUpperCase()]), F(e, i);
	}, (e) => {
		var t = Do();
		F(e, t);
	}), w(M), w(E);
	var P = s(E, 2), I = t(P);
	let L;
	var R = t(I, !0);
	w(I);
	var z = s(I), B = t(z);
	U(B, { name: "save" }), S(), w(z), w(P), w(u), g((e) => {
		r(m, n.agentHub.connected && n.agentHub.compatible ? "Compatible" : n.agentHub.connected ? "Incompatible" : "Unavailable"), r(x, n.agentHub.error || `API ${n.agentHub.apiVersion || "unknown"} · AgentHub ${n.agentHub.version || "unknown"}`), r(A, `${n.agentHub.agents.length ?? ""} agents · ${n.agentHub.providers.length ?? ""} providers`), L = j(I, 1, "settings-save-hint", null, L, { visible: i().dirty }), r(R, i().dirty ? "Unsaved changes" : ""), z.disabled = e;
	}, [() => !i().dirty || !!a()]), h("input", y, function(...e) {
		n.onDirty?.apply(this, e);
	}), H(y, () => i().endpoint, (e) => i(i().endpoint = e, !0)), h("click", z, o), F(e, u), l();
}
p(["input", "click"]);
//#endregion
//#region src/components/AppearanceSettingsPanel.svelte
var Ao = f("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), jo = f("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), Mo = f("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"80\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-strong\" x=\"40\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect><rect class=\"d-outline\" x=\"74\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect></svg>"), No = f("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-light\" x=\"6\" y=\"8\" width=\"70\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"82\" y=\"8\" width=\"32\" height=\"56\" rx=\"3\"></rect></svg>"), Po = P("<button type=\"button\" role=\"radio\"><span class=\"layout-diagram\"><!></span> <span class=\"layout-option-text\"><strong> </strong><small> </small></span></button>"), Fo = P("<div class=\"font-scale-row\"><span class=\"font-scale-label\"> </span> <input type=\"range\" min=\"80\" max=\"140\" step=\"5\"/> <span class=\"font-scale-value\"> </span></div>"), Io = P("<div class=\"settings-panel\" data-component-owner=\"appearance-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Appearance</h2><p>Choose the workspace layout and the text size of each column. Everything applies immediately and is stored only in this browser.</p></div> <section class=\"appearance-section\" aria-label=\"Layout\"><div class=\"settings-section-heading\"><h3>Layout</h3></div> <div class=\"layout-options\" role=\"radiogroup\" aria-label=\"Workspace layout\"></div></section> <section class=\"appearance-section\" aria-label=\"Text size\"><div class=\"settings-section-heading\"><h3>Text size</h3><button type=\"button\" class=\"appearance-reset\"><!><span>Reset</span></button></div> <div class=\"font-scale-rows\"></div> <small class=\"appearance-hint\">Scales the text of each column independently from 80% to 140%.</small></section></div>");
function Lo(e, n) {
	C(n, !0);
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
	], o = (e) => `${Math.round(e * 100)}%`, d = u(() => a.every((e) => n.appearance.fontScales[e.id] === 1));
	var f = Io(), p = s(t(f), 2), m = s(t(p), 2);
	q(m, 21, () => i, (e) => e.id, (e, i) => {
		var a = Po();
		let o;
		var l = t(a), u = t(l), d = (e) => {
			var t = Ao();
			F(e, t);
		}, f = (e) => {
			var t = jo();
			F(e, t);
		}, p = (e) => {
			var t = Mo();
			F(e, t);
		}, m = (e) => {
			var t = No();
			F(e, t);
		};
		K(u, (e) => {
			c(i).id === "auto" ? e(d) : c(i).id === "three" ? e(f, 1) : c(i).id === "two" ? e(p, 2) : e(m, -1);
		}), w(l);
		var _ = s(l, 2), v = t(_), y = t(v, !0);
		w(v);
		var b = s(v), x = t(b, !0);
		w(b), w(_), w(a), g(() => {
			o = j(a, 1, "layout-option", null, o, { active: n.appearance.layout === c(i).id }), I(a, "aria-checked", n.appearance.layout === c(i).id), r(y, c(i).label), r(x, c(i).description);
		}), h("click", a, () => n.onLayoutPreference(c(i).id)), F(e, a);
	}), w(m), w(p);
	var _ = s(p, 2), v = t(_), y = s(t(v)), b = t(y);
	U(b, { name: "rotate-ccw" }), S(), w(y), w(v);
	var x = s(v, 2);
	q(x, 21, () => a, (e) => e.id, (e, i) => {
		var a = Fo(), l = t(a), u = t(l, !0);
		w(l);
		var d = s(l, 2);
		O(d);
		var f = s(d, 2), p = t(f, !0);
		w(f), w(a), g((e, t) => {
			r(u, c(i).label), k(d, e), I(d, "aria-label", `${c(i).label} text size`), r(p, t);
		}, [() => Math.round(n.appearance.fontScales[c(i).id] * 100), () => o(n.appearance.fontScales[c(i).id])]), h("input", d, (e) => n.onFontScale(c(i).id, Number(e.currentTarget.value) / 100)), F(e, a);
	}), w(x), S(2), w(_), w(f), g(() => y.disabled = c(d)), h("click", y, function(...e) {
		n.onResetFontScales?.apply(this, e);
	}), F(e, f), l();
}
p(["click", "input"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var Ro = P("<small class=\"settings-notification-help\"> </small>"), zo = P("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function Bo(e, n) {
	C(n, !0);
	var i = zo(), a = s(t(i), 2), o = t(a), c = s(t(o), 2);
	O(c), w(o);
	var u = s(o, 2), d = (e) => {
		var i = Ro(), a = t(i, !0);
		w(i), g(() => r(a, n.notifications.permissionError)), F(e, i);
	};
	K(u, (e) => {
		n.notifications.permissionError && e(d);
	}), w(a);
	var f = s(a, 2), p = t(f), m = s(t(p), 2);
	O(m), w(p);
	var _ = s(p, 2), v = t(_, !0);
	w(_), w(f), w(i), g(() => {
		W(c, n.notifications.browser), W(m, n.notifications.sound), r(v, n.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), h("change", c, (e) => n.onBrowserNotifications(e.currentTarget.checked)), h("change", m, (e) => n.onCompletionSound(e.currentTarget.checked)), F(e, i), l();
}
p(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var Vo = P("<option> </option>"), Ho = P("<span class=\"settings-profile-system-label\">System</span>"), Uo = P("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), Wo = P("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), Go = P("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. The default profile is reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function Ko(e, n) {
	C(n, !0);
	let i = N(n, "draft", 15), a = N(n, "pending", 15), o = /* @__PURE__ */ new Set(["default"]);
	function d(e, t, r) {
		i(i().profiles[e][t] = r, !0), n.onDirty();
	}
	function f() {
		let e = i().newProfile.key.trim().toLowerCase();
		if (!e) return n.onToast("Profile key is required.");
		if (o.has(e)) return n.onToast(`${e} is a reserved system profile.`);
		if (i().profiles.some((t) => t.key.trim().toLowerCase() === e)) return n.onToast(`Profile ${e} already exists.`);
		i(i().profiles = [...i().profiles, {
			key: e,
			description: i().newProfile.description.trim(),
			agentName: i().newProfile.agentName
		}], !0), i(i().newProfile = {
			key: "",
			description: "",
			agentName: n.agents[0]?.id || ""
		}, !0), n.onDirty();
	}
	function p(e) {
		let t = i().profiles[e];
		if (!t || o.has(t.key.trim().toLowerCase())) return n.onToast("System profiles cannot be deleted.");
		i(i().profiles = i().profiles.filter((t, n) => e !== n), !0), n.onDirty();
	}
	function m(e) {
		let t = n.agents.map((e) => ({
			id: e.id,
			label: e.label
		}));
		return e && !t.some((t) => t.id === e) ? [{
			id: e,
			label: `${e} (Unavailable)`
		}, ...t] : t;
	}
	async function v() {
		if (!(!i().dirty || a())) {
			a("agenthub");
			try {
				await n.onSaveAgentHub(Co(i())), i(i().dirty = !1, !0);
			} catch (e) {
				n.onToast(wo(e));
			} finally {
				a("");
			}
		}
	}
	var y = Go(), b = s(t(y), 2), x = t(b), T = s(t(x)), E = t(T);
	w(T), w(x);
	var D = s(x, 2), M = s(t(D), 2);
	q(M, 17, () => i().profiles, _, (e, n, i) => {
		let a = u(() => o.has(c(n).key.trim().toLowerCase()));
		var l = Wo();
		let f;
		var v = t(l);
		O(v);
		var y = s(v, 2);
		O(y);
		var b = s(y, 2);
		q(b, 21, () => m(c(n).agentName), _, (e, n) => {
			var i = Vo(), a = t(i, !0);
			w(i);
			var o = {};
			g(() => {
				r(a, c(n).label), o !== (o = c(n).id) && (i.value = (i.__value = c(n).id) ?? "");
			}), F(e, i);
		}), w(b);
		var x;
		B(b);
		var S = s(b, 2), C = (e) => {
			var t = Ho();
			F(e, t);
		}, T = (e) => {
			var n = Uo(), r = t(n);
			U(r, { name: "trash-2" }), w(n), h("click", n, () => p(i)), F(e, n);
		};
		K(S, (e) => {
			c(a) ? e(C) : e(T, -1);
		}), w(l), g(() => {
			f = j(l, 1, "settings-profile-row", null, f, { "settings-profile-system": c(a) }), k(v, c(n).key), v.disabled = c(a), k(y, c(n).description), y.disabled = c(a), x !== (x = c(n).agentName) && (b.value = (b.__value = c(n).agentName) ?? "", L(b, c(n).agentName));
		}), h("input", v, (e) => d(i, "key", e.currentTarget.value)), h("input", y, (e) => d(i, "description", e.currentTarget.value)), h("change", b, (e) => d(i, "agentName", e.currentTarget.value)), F(e, l);
	});
	var P = s(M, 2), I = t(P);
	O(I);
	var R = s(I, 2);
	O(R);
	var z = s(R, 2);
	q(z, 21, () => n.agents, _, (e, n) => {
		var i = Vo(), a = t(i, !0);
		w(i);
		var o = {};
		g(() => {
			r(a, c(n).label), o !== (o = c(n).id) && (i.value = (i.__value = c(n).id) ?? "");
		}), F(e, i);
	}), w(z);
	var ee = s(z, 2), V = t(ee);
	U(V, { name: "plus" }), S(), w(ee), w(P), w(D), w(b);
	var W = s(b, 2), G = t(W);
	let te;
	var J = t(G, !0);
	w(G);
	var Y = s(G), ne = t(Y);
	U(ne, { name: "save" }), S(), w(Y), w(W), w(y), g((e) => {
		r(E, `${i().profiles.length ?? ""} routes`), z.disabled = !n.agents.length, ee.disabled = !n.agents.length, te = j(G, 1, "settings-save-hint", null, te, { visible: i().dirty }), r(J, i().dirty ? "Unsaved changes" : ""), Y.disabled = e;
	}, [() => !i().dirty || !!a()]), H(I, () => i().newProfile.key, (e) => i(i().newProfile.key = e, !0)), H(R, () => i().newProfile.description, (e) => i(i().newProfile.description = e, !0)), A(z, () => i().newProfile.agentName, (e) => i(i().newProfile.agentName = e, !0)), h("click", ee, f), h("click", Y, v), F(e, y), l();
}
p([
	"input",
	"change",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var qo = P("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), Jo = P("<button type=\"button\"><!> <span> </span> <!></button>"), Yo = P("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function Xo(e, n) {
	C(n, !0);
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
	var a = Yo(), o = s(t(a), 2);
	q(o, 17, () => i, (e) => e.id, (e, i) => {
		var a = Jo();
		let o;
		var l = t(a);
		U(l, { get name() {
			return c(i).icon;
		} });
		var u = s(l, 2), d = t(u, !0);
		w(u);
		var f = s(u, 2), p = (e) => {
			var t = qo();
			F(e, t);
		};
		K(f, (e) => {
			c(i).sharesAgentDraft && e(p);
		}), w(a), g(() => {
			o = j(a, 1, "settings-tab", null, o, {
				active: n.activeTab === c(i).id,
				dirty: n.dirty && c(i).sharesAgentDraft
			}), I(a, "aria-current", n.activeTab === c(i).id ? "page" : void 0), r(d, c(i).label);
		}), h("click", a, () => n.onSelect(c(i).id)), F(e, a);
	}), w(a), F(e, a), l();
}
p(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var Zo = P("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function Qo(e, n) {
	C(n, !0);
	let r = N(n, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n.onUserNameInput(await n.onSaveUser(n.userName));
			} catch (e) {
				n.onToast(wo(e));
			} finally {
				r("");
			}
		}
	}
	var o = Zo(), c = s(t(o), 2), u = t(c), d = s(t(u), 2);
	O(d), S(2), w(u);
	var f = s(u, 2), p = t(f), m = t(p);
	U(m, { name: "save" }), S(), w(p), w(f), w(c), w(o), g(() => {
		k(d, n.userName), p.disabled = r() === "user";
	}), a("submit", c, i), h("input", d, (e) => n.onUserNameInput(e.currentTarget.value)), F(e, o), l();
}
p(["input"]);
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var $o = P("<span class=\"settings-pill\">Active</span>"), es = P("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), ts = P("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), ns = P("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), rs = P("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), is = P("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function as(e, n) {
	C(n, !0);
	let i = N(n, "draft", 15), d = N(n, "pending", 15), f = o("");
	async function p(e) {
		if (e.preventDefault(), !(!i().workspacePath.trim() || d())) {
			d("workspace");
			try {
				await n.onAddWorkspace(Co(i())), i(i().workspacePath = "", !0), i(i().createWorkspace = !1, !0);
			} catch (e) {
				n.onToast(wo(e));
			} finally {
				d("");
			}
		}
	}
	async function m(e) {
		if (!d()) {
			d(`remove:${e}`);
			try {
				await n.onRemoveWorkspace(e, Co(i()));
			} catch (e) {
				n.onToast(wo(e));
			} finally {
				d("");
			}
		}
	}
	async function _(e, t) {
		if (!d()) {
			d(`icon:${e}`), x(f, "");
			try {
				await n.onWorkspaceIcon(e, t, Co(i()));
			} catch (e) {
				n.onToast(wo(e));
			} finally {
				d("");
			}
		}
	}
	function v(e) {
		let t = n.workspaces.find((t) => t.id === e);
		return n.workspaceIcons.find((e) => e.id === (t?.icon || "")) || n.workspaceIcons[0];
	}
	var y = is(), b = s(t(y), 2), T = t(b);
	O(T);
	var E = s(T, 2), D = t(E);
	O(D), S(2), w(E);
	var k = s(E, 2), A = t(k);
	U(A, { name: "plus" });
	var M = s(A), P = t(M, !0);
	w(M), w(k), w(b);
	var L = s(b, 2);
	q(L, 21, () => n.workspaces, (e) => e.id, (e, i) => {
		let a = u(() => v(c(i).id));
		var o = ns(), l = t(o), p = t(l), y = t(p), b = t(y);
		w(y);
		var S = s(y, 2), C = t(S), T = t(C, !0);
		w(C);
		var E = s(C), D = t(E, !0);
		w(E), w(S), w(p);
		var O = s(p, 2), k = t(O), A = (e) => {
			var t = $o();
			F(e, t);
		};
		K(k, (e) => {
			c(i).id === n.activeWorkspaceId && e(A);
		});
		var M = s(k, 2), N = t(M), P = s(N, 2), L = t(P, !0);
		w(P);
		var R = s(P, 2);
		U(R, { name: "chevron-down" }), w(M);
		var z = s(M, 2), B = t(z);
		U(B, { name: "trash-2" }), w(z), w(O), w(l);
		var ee = s(l, 2), V = (e) => {
			var o = ts();
			q(o, 21, () => n.workspaceIcons, (e) => e.id, (e, n) => {
				var o = es();
				let l;
				var u = t(o), d = s(u), f = t(d, !0);
				w(d);
				var p = s(d), m = (e) => {
					U(e, { name: "check" });
				};
				K(p, (e) => {
					c(n).id === c(a).id && e(m);
				}), w(o), g(() => {
					I(o, "aria-checked", c(n).id === c(a).id), I(o, "title", c(n).label), l = j(o, 1, "", null, l, { selected: c(n).id === c(a).id }), I(u, "src", c(n).src), r(f, c(n).label);
				}), h("click", o, () => _(c(i).id, c(n).id)), F(e, o);
			}), w(o), g(() => I(o, "aria-label", `Icon for ${c(i).name}`)), F(e, o);
		};
		K(ee, (e) => {
			c(f) === c(i).id && e(V);
		}), w(o), g((e, t) => {
			I(b, "src", c(a).src), r(T, c(i).name), r(D, c(i).path), I(M, "aria-expanded", c(f) === c(i).id), M.disabled = e, I(N, "src", c(a).src), r(L, d() === `icon:${c(i).id}` ? "Saving..." : c(a).label), z.disabled = t;
		}, [() => !!d(), () => !!d()]), h("click", M, () => x(f, c(f) === c(i).id ? "" : c(i).id, !0)), h("click", z, () => m(c(i).id)), F(e, o);
	}, (e) => {
		var t = rs();
		F(e, t);
	}), w(L), w(y), g((e) => {
		k.disabled = e, r(P, i().createWorkspace ? "Create" : "Add");
	}, [() => !!d()]), a("submit", b, p), H(T, () => i().workspacePath, (e) => i(i().workspacePath = e, !0)), z(D, () => i().createWorkspace, (e) => i(i().createWorkspace = e, !0)), F(e, y), l();
}
p(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var os = P("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function ss(n, r) {
	C(r, !0);
	let i = o(y(r.channel.current())), a = o(""), u = o(-1), d = o(y(So(c(i)))), f = o(y(c(i).userName)), p = o("");
	V(() => r.channel.subscribe((e) => {
		let t = c(i);
		if (x(i, e, !0), e.identity !== c(a)) x(a, e.identity, !0), x(u, e.dataVersion, !0), x(d, So(e), !0), x(f, e.userName, !0), x(p, "");
		else if (e.dataVersion !== c(u) && !c(d).dirty) {
			let n = c(d).tab, r = c(f) !== t.userName;
			x(u, e.dataVersion, !0), x(d, So(e), !0), c(d).tab = n, r ? c(d).userName = c(f) : x(f, e.userName, !0);
		}
		queueMicrotask(e.onIconsChanged);
	})), V(() => {
		let e = (e) => {
			c(i).open && e.key === "Escape" && (e.preventDefault(), c(i).onClose(c(d).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function m() {
		c(d).dirty = !0;
	}
	var g = e(), _ = b(g), v = (e) => {
		var n = os(), r = b(n), a = s(r, 2), o = t(a);
		Xo(o, {
			get activeTab() {
				return c(d).tab;
			},
			get dirty() {
				return c(d).dirty;
			},
			onSelect: (e) => c(d).tab = e
		});
		var l = s(o, 2), u = t(l), g = t(u);
		U(g, { name: "x" }), w(u);
		var _ = s(u, 2), v = (e) => {
			as(e, {
				get workspaces() {
					return c(i).workspaces;
				},
				get activeWorkspaceId() {
					return c(i).activeWorkspaceId;
				},
				get workspaceIcons() {
					return c(i).workspaceIcons;
				},
				get onAddWorkspace() {
					return c(i).onAddWorkspace;
				},
				get onRemoveWorkspace() {
					return c(i).onRemoveWorkspace;
				},
				get onWorkspaceIcon() {
					return c(i).onWorkspaceIcon;
				},
				get onToast() {
					return c(i).onToast;
				},
				get draft() {
					return c(d);
				},
				set draft(e) {
					x(d, e, !0);
				},
				get pending() {
					return c(p);
				},
				set pending(e) {
					x(p, e, !0);
				}
			});
		}, y = (e) => {
			Qo(e, {
				get userName() {
					return c(f);
				},
				onUserNameInput: (e) => {
					x(f, e, !0), c(d).userName = e;
				},
				get onSaveUser() {
					return c(i).onSaveUser;
				},
				get onToast() {
					return c(i).onToast;
				},
				get pending() {
					return c(p);
				},
				set pending(e) {
					x(p, e, !0);
				}
			});
		}, S = (e) => {
			Lo(e, {
				get appearance() {
					return c(i).appearance;
				},
				get onLayoutPreference() {
					return c(i).onLayoutPreference;
				},
				get onFontScale() {
					return c(i).onFontScale;
				},
				get onResetFontScales() {
					return c(i).onResetFontScales;
				}
			});
		}, C = (e) => {
			ko(e, {
				get agentHub() {
					return c(i).agentHub;
				},
				onDirty: m,
				get onSaveAgentHub() {
					return c(i).onSaveAgentHub;
				},
				get onToast() {
					return c(i).onToast;
				},
				get draft() {
					return c(d);
				},
				set draft(e) {
					x(d, e, !0);
				},
				get pending() {
					return c(p);
				},
				set pending(e) {
					x(p, e, !0);
				}
			});
		}, T = (e) => {
			Ko(e, {
				get agents() {
					return c(i).agents;
				},
				onDirty: m,
				get onSaveAgentHub() {
					return c(i).onSaveAgentHub;
				},
				get onToast() {
					return c(i).onToast;
				},
				get draft() {
					return c(d);
				},
				set draft(e) {
					x(d, e, !0);
				},
				get pending() {
					return c(p);
				},
				set pending(e) {
					x(p, e, !0);
				}
			});
		}, E = (e) => {
			Bo(e, {
				get notifications() {
					return c(i).notifications;
				},
				get onBrowserNotifications() {
					return c(i).onBrowserNotifications;
				},
				get onCompletionSound() {
					return c(i).onCompletionSound;
				}
			});
		};
		K(_, (e) => {
			c(d).tab === "workspace" ? e(v) : c(d).tab === "user" ? e(y, 1) : c(d).tab === "appearance" ? e(S, 2) : c(d).tab === "agenthub" ? e(C, 3) : c(d).tab === "profiles" ? e(T, 4) : e(E, -1);
		}), w(l), w(a), h("click", r, () => c(i).onClose(c(d).dirty)), h("click", u, () => c(i).onClose(c(d).dirty)), F(e, n);
	};
	K(_, (e) => {
		c(i).open && e(v);
	}), F(n, g), l();
}
p(["click"]);
//#endregion
//#region src/components/Toast.svelte
var cs = P("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function ls(e, n) {
	C(n, !0);
	let i = o(y(n.channel.current())), a = o(!1), s = null;
	V(() => {
		let e = n.channel.subscribe((e) => {
			x(i, e, !0), x(a, !!e.message, !0), s !== null && window.clearTimeout(s), c(a) && (s = window.setTimeout(() => {
				x(a, !1), s = null;
			}, 2800));
		});
		return () => {
			e(), s !== null && window.clearTimeout(s);
		};
	});
	var u = cs(), d = t(u, !0);
	w(u), g(() => {
		I(u, "hidden", !c(a)), r(d, c(i).message);
	}), F(e, u), l();
}
//#endregion
//#region src/components/UploadDialog.svelte
var us = P("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), ds = P("<small class=\"upload-result-path\"> </small>"), fs = P("<small class=\"upload-error\"> </small>"), ps = P("<div><div class=\"upload-item-heading\"><span class=\"upload-item-status-icon\"><span class=\"upload-item-status upload-item-status-queued\"><!></span><span class=\"upload-item-status upload-item-status-uploading\"><!></span><span class=\"upload-item-status upload-item-status-success\"><!></span><span class=\"upload-item-status upload-item-status-error\"><!></span></span><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), ms = P("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this resource's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function hs(n, i) {
	C(i, !0);
	let d = o(y(i.channel.current())), f = o(""), p = o(y([])), m = 1, _ = o(void 0), v = /* @__PURE__ */ new Map(), T = u(() => c(p).some((e) => e.status === "queued" || e.status === "uploading")), D = u(() => c(p).filter((e) => e.status === "success").length), O = u(() => c(p).filter((e) => e.status === "error").length);
	V(() => {
		let e = i.channel.subscribe((e) => {
			x(d, e, !0), e.identity !== c(f) && (k(), x(f, e.identity, !0), x(p, [], !0), m = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
		}), t = (e) => {
			if (!c(d).open) return;
			let t = A(e.clipboardData);
			t.length && (e.preventDefault(), P(t));
		};
		document.addEventListener("paste", t);
		let n = (e) => {
			c(d).open && e.key === "Escape" && !c(T) && (e.preventDefault(), z());
		};
		return document.addEventListener("keydown", n), () => {
			e(), document.removeEventListener("paste", t), document.removeEventListener("keydown", n), k();
		};
	});
	function k() {
		for (let e of v.values()) e.abort();
		v.clear();
	}
	function A(e) {
		let t = Array.from(e?.items || []).filter((e) => e.kind === "file").map((e) => e.getAsFile()).filter((e) => !!e);
		return t.length ? t : Array.from(e?.files || []);
	}
	function N(e, t) {
		return `clipboard-${Date.now()}-${t + 1}.${{
			"image/png": "png",
			"image/jpeg": "jpg",
			"image/gif": "gif",
			"image/webp": "webp",
			"application/pdf": "pdf"
		}[e.type] || "bin"}`;
	}
	function P(e) {
		let t = Array.from(e || []);
		if (!c(d).open || !t.length) return;
		let n = t.map((e, t) => ({
			id: m++,
			file: e,
			name: e.name || N(e, t),
			size: e.size || 0,
			progress: 0,
			status: "queued",
			path: "",
			error: ""
		}));
		x(p, [...c(p), ...n], !0);
		for (let e of n) R(e, c(d).identity, c(d).workspaceId, c(d).resourceId);
	}
	function L(e, t) {
		x(p, c(p).map((n) => n.id === e ? {
			...n,
			...t
		} : n), !0);
	}
	function R(e, t, n, r) {
		L(e.id, { status: "uploading" });
		let i = new XMLHttpRequest();
		v.set(e.id, i), i.open("POST", `/api/workspaces/${encodeURIComponent(n)}/resources/${encodeURIComponent(r)}/uploads`), i.responseType = "json", i.upload.addEventListener("progress", (n) => {
			c(d).identity !== t || !n.lengthComputable || L(e.id, { progress: Math.min(99, Math.round(n.loaded / n.total * 100)) });
		}), i.addEventListener("load", () => {
			if (v.delete(e.id), c(d).identity !== t || c(d).workspaceId !== n || c(d).resourceId !== r) return;
			let a = i.response || {};
			i.status >= 200 && i.status < 300 ? L(e.id, {
				status: "success",
				progress: 100,
				path: a.path || "",
				name: a.name || e.name
			}) : L(e.id, {
				status: "error",
				error: a.error || `${i.status} ${i.statusText}`
			});
		}), i.addEventListener("error", () => {
			v.delete(e.id), c(d).identity === t && L(e.id, {
				status: "error",
				error: "Network error while uploading."
			});
		});
		let a = new FormData();
		a.append("file", e.file, e.name), i.send(a);
	}
	function z() {
		c(T) || c(d).onDone(c(p).filter((e) => e.status === "success" && e.path).map((e) => e.path), {
			workspaceId: c(d).workspaceId,
			resourceId: c(d).resourceId
		});
	}
	function B(e) {
		return e < 1024 ? `${e} B` : e < 1048576 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1024 / 1024).toFixed(1)} MB`;
	}
	function ee(e) {
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
	var H = e(), W = b(H), G = (e) => {
		var n = ms(), i = t(n), o = s(i, 2), l = t(o), d = s(t(l), 2), f = t(d);
		U(f, { name: "x" }), w(d), w(l);
		var m = s(l, 2), v = t(m);
		E(v, (e) => x(_, e), () => c(_));
		var y = s(v, 2), b = t(y);
		U(b, { name: "clipboard-paste" });
		var C = s(b, 4), k = t(C);
		U(k, { name: "folder-open" }), S(), w(C), w(y);
		var A = s(y, 2), N = t(A), L = (e) => {
			var t = us();
			F(e, t);
		};
		K(N, (e) => {
			c(p).length || e(L);
		});
		var R = s(N, 2);
		q(R, 17, () => c(p), (e) => e.id, (e, n) => {
			let i = u(() => ee(c(n)));
			var a = ps();
			let o;
			var l = t(a), d = t(l), f = t(d), p = t(f);
			U(p, { name: "clock-3" }), w(f);
			var m = s(f), h = t(m);
			U(h, { name: "loader-circle" }), w(m);
			var _ = s(m), v = t(_);
			U(v, { name: "circle-check" }), w(_);
			var y = s(_), b = t(y);
			U(b, { name: "triangle-alert" }), w(y), w(d);
			var x = s(d), S = t(x), C = t(S, !0);
			w(S);
			var T = s(S), E = t(T, !0);
			w(T), w(x);
			var D = s(x), O = t(D, !0);
			w(D), w(l);
			var k = s(l, 2), A = t(k);
			let N;
			w(k);
			var P = s(k, 2), L = (e) => {
				var i = ds(), a = t(i, !0);
				w(i), g(() => r(a, c(n).path)), F(e, i);
			};
			K(P, (e) => {
				c(n).status === "success" && e(L);
			});
			var R = s(P, 2), z = (e) => {
				var i = fs(), a = t(i, !0);
				w(i), g(() => r(a, c(n).error || "Upload failed")), F(e, i);
			};
			K(R, (e) => {
				c(n).status === "error" && e(z);
			}), w(a), g((e) => {
				o = j(a, 1, "upload-item", null, o, {
					"upload-item-success": c(n).status === "success",
					"upload-item-error": c(n).status === "error",
					"upload-item-uploading": c(n).status === "uploading"
				}), r(C, c(n).name), r(E, e), r(O, c(i).label), I(k, "aria-label", c(n).name), I(k, "aria-valuenow", c(n).progress), N = M(A, "", N, { width: `${c(n).progress}%` });
			}, [() => B(c(n).size)]), F(e, a);
		}), w(A), w(m);
		var V = s(m, 2), H = t(V), W = t(H, !0);
		w(H);
		var G = s(H, 2);
		w(V), w(o), w(n), g(() => {
			d.disabled = c(T), r(W, c(T) ? "Wait for uploads to finish before closing." : c(p).length ? `${c(D)} uploaded${c(O) ? ` · ${c(O)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), G.disabled = c(T);
		}), h("click", i, z), h("click", d, z), h("change", v, () => c(_).files && P(c(_).files)), a("dragover", y, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), a("dragleave", y, (e) => e.currentTarget.classList.remove("dragging")), a("drop", y, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && P(e.dataTransfer.files);
		}), h("keydown", y, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), c(_).click());
		}), h("click", C, () => c(_).click()), h("click", G, z), F(e, n);
	};
	K(W, (e) => {
		c(d).open && e(G);
	}), F(n, H), l();
}
p([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var gs = P("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div> <div data-component-owner=\"confirm-dialog\" style=\"display: contents\"><!></div>", 1);
function _s(e, n) {
	C(n, !0);
	var r = gs(), i = b(r);
	Be(i, {
		get channel() {
			return n.channels.appShell;
		},
		details: (e) => {
			eo(e, { get channel() {
				return n.channels.detail;
			} });
		},
		timeline: (e) => {
			xo(e, { get channel() {
				return n.channels.timeline;
			} });
		},
		composer: (e) => {
			lt(e, { get channel() {
				return n.channels.composer;
			} });
		},
		agentHeader: (e) => {
			Ge(e, { get channel() {
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
	var a = s(i, 2);
	ls(t(a), { get channel() {
		return n.channels.toast;
	} }), w(a);
	var o = s(a, 2);
	hs(t(o), { get channel() {
		return n.channels.upload;
	} }), w(o);
	var c = s(o, 2);
	Qt(t(c), { get channel() {
		return n.channels.create;
	} }), w(c);
	var u = s(c, 2);
	ss(t(u), { get channel() {
		return n.channels.settings;
	} }), w(u);
	var d = s(u, 2);
	dt(t(d), { get channel() {
		return un;
	} }), w(d), F(e, r), l();
}
//#endregion
//#region src/app-channels.ts
var Z = () => void 0, vs = async () => void 0;
function ys() {
	return {
		appShell: on({
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
			onSwitchWorkspace: vs,
			onAddWorkspace: Z,
			onCreateProject: Z,
			onOpenSettings: Z,
			onRefreshDoctor: vs,
			onToggleProject: vs,
			onSelectResource: vs,
			onReorder: vs,
			onDragState: Z,
			onToggleAttention: vs,
			onDismissAttention: vs,
			onPanePreview: Z,
			onPaneCommit: Z,
			onPaneViewport: Z,
			onMobileSidebar: Z,
			onMobileView: Z,
			onMobileImmersive: Z,
			onToast: Z,
			onIconsChanged: Z,
			onHistoryNavigation: vs
		}),
		create: on({
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
			onPreview: vs,
			onSubmit: vs,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: async () => !0,
			onIconsChanged: Z
		}),
		settings: on({
			open: !1,
			identity: "",
			dataVersion: 0,
			initialTab: "workspace",
			workspaces: [],
			activeWorkspaceId: "",
			workspaceIcons: [{
				id: "",
				label: "Forge default",
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
			onAddWorkspace: vs,
			onRemoveWorkspace: vs,
			onWorkspaceIcon: vs,
			onSaveUser: async (e) => e,
			onSaveAgentHub: vs,
			onLayoutPreference: Z,
			onFontScale: Z,
			onResetFontScales: Z,
			onBrowserNotifications: Z,
			onCompletionSound: Z,
			onToast: Z,
			onIconsChanged: Z
		}),
		upload: on({
			open: !1,
			identity: "",
			workspaceId: "",
			resourceId: "",
			onDone: Z,
			onIconsChanged: Z
		}),
		composer: on({
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
			onSteerWaiting: vs,
			onSaveAgentBinding: vs,
			onIconsChanged: Z
		}),
		detail: on({
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
			onDeleteArtifact: vs,
			onSaveAgentBinding: vs,
			onSaveWorkspaceDefaults: vs,
			onSaveTaskDefault: vs,
			onToast: Z,
			onIconsChanged: Z
		}),
		timeline: on({
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
			onApproval: vs,
			onToast: Z,
			onIconsChanged: Z
		}),
		agentHeader: on({
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
		toast: on({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/storage-migration.ts
function bs(e, t, n) {
	if (!(!e || t === n)) try {
		let r = e.getItem(t);
		if (r === null) return;
		e.getItem(n) === null && e.setItem(n, r), e.removeItem(t);
	} catch {}
}
function xs(e, t, n) {
	if (!(!e || t === n)) try {
		let r = [];
		for (let i = 0; i < e.length; i++) {
			let a = e.key(i);
			a && a.startsWith(t) && r.push([a, n + a.slice(t.length)]);
		}
		for (let [t, n] of r) bs(e, t, n);
	} catch {}
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var Ss = "forge.web.agentDraft.v2", Cs = "forge.gui.agentDraft.v2", ws = 2, Ts = 50, Es = 7776e6;
function Ds(e) {
	return encodeURIComponent(String(e || "").trim());
}
function Os(e) {
	return String(e || "").trim() || "workspace";
}
function ks(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? Ts, r = e.maxAgeMs ?? Es;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	xs(i(), Cs, Ss);
	function a(e, t) {
		let n = String(e || "").trim(), r = Os(t);
		return !n || !r ? "" : `${Ss}.resource.${Ds(n)}.${Ds(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== ws || typeof t.text != "string" ? null : {
				version: ws,
				text: t.text,
				updatedAt: Number(t.updatedAt) || 0,
				workspaceId: String(t.workspaceId || ""),
				resourceId: Os(t.resourceId),
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
				version: ws,
				text: n,
				updatedAt: t(),
				workspaceId: r.workspaceId,
				resourceId: Os(r.resourceId),
				generationId: String(r.generationId || "") || void 0
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = Os(a);
		if (!c || !u) return;
		let f = `${Ss}.resource.${Ds(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || Os(n.resourceId) !== d || o.has(t))) {
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
function As(e) {
	let t = ks(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForResource(r, Os(n));
	}
	function i(e, t) {
		let r = /* @__PURE__ */ new Set();
		return n.chatDraftWorkspaceId === e && n.chatDraftResourceId === t && n.chatDraftKey && r.add(n.chatDraftKey), r;
	}
	function a(r = e.workspaceId(), a = n.chatDraftResourceId) {
		let o = r.trim(), s = Os(a);
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
		let l = Os(i), u = r(l, o);
		if (!u) return c();
		n.chatDraftKey !== u && (n.chatDraftKey = u, n.chatDraftWorkspaceId = o.trim(), n.chatDraftResourceId = l, n.chatDraft = t.read(u), n.chatMultiline = n.chatDraft.includes("\n"), n.chatDraftVersion++, a(n.chatDraftWorkspaceId, n.chatDraftResourceId));
	}
	function u(r) {
		return e.workspaceId() !== r.workspaceId || n.chatDraftResourceId !== Os(r.resourceId) || n.chatDraftKey !== r.key || n.chatDraft !== r.text || n.chatDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
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
function js(e) {
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
function Ms(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function Ns(e) {
	let t = String(e?.id || "").trim();
	if (!t) throw Error("The created resource did not return an id.");
	return t;
}
function Ps(e) {
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
function Fs(e) {
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
function Is(e) {
	let t = 0, n = Ps(t), r = 0, i = null, a = "";
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
			previewRequestKey: (e) => JSON.stringify(Fs({
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
			...Ps(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = Ps(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = Fs({
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
			n.previewError = Ms(e);
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
			if (n.type === "project") r = Ns(await e.request(`/api/workspaces/${i}/projects`, {
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
					t = Fs(n);
				}
				r = Ns(await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				})), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1;
			let s = ++t;
			n.identity = s, await e.reloadTree(), i === e.workspaceId() && n.identity === s && await e.selectResource(r);
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(Ms(t)));
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
function Ls(e, t) {
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
function Rs() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function zs(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.generationId}`;
}
function Bs(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function Vs(e) {
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
		if (!(!e.settings().browser || Rs() !== "granted")) try {
			let n = new window.Notification(zs(t), {
				body: Bs(t),
				tag: `forge-${t.marker}`,
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
		n.browser && Rs() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = Rs();
		if (n === "unsupported") return e.updateSettings({
			...t,
			browser: !1
		}), r = "Browser notifications are not supported here.", e.settingsChanged(), n;
		if (n === "denied") return e.updateSettings({
			...t,
			browser: !1
		}), r = "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically.", e.settingsChanged(), n;
		let i = n;
		if (n === "default") try {
			i = await window.Notification.requestPermission();
		} catch (e) {
			r = "Chrome could not request notification permission.", console.warn("notification permission request failed", e);
		}
		return e.updateSettings({
			...t,
			browser: i === "granted"
		}), r = i === "granted" ? "" : i === "denied" ? "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically." : "Notification permission is still pending.", e.settingsChanged(), i;
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
			permission: Rs(),
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
var Hs = "forge.web.notifications.v1", Us = "forge.gui.notifications.v1", Ws = `${Hs}.settings`;
function Gs(e) {
	return e && typeof e == "object" ? e : null;
}
function Ks(e) {
	let t = Gs(e);
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
function qs() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function Js(e) {
	let t = Gs(e);
	if (!t || t.version !== 1) return qs();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = Gs(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(Ks).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(Ks).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = Gs(e);
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
function Ys(e) {
	let t = e.trim();
	return t ? `${Hs}.state.${encodeURIComponent(t)}` : "";
}
function Xs(e) {
	xs(e, Us, Hs);
	function t(t) {
		let n = Ys(t);
		if (!e || !n) return qs();
		try {
			let t = e.getItem(n);
			if (!t) return qs();
			let r = Js(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return qs();
		}
	}
	function n(t, n) {
		let r = Js(n), i = Ys(t);
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
			let t = Gs(JSON.parse(e.getItem(Ws) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(Ws);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(Ws, JSON.stringify({
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
function Zs(e) {
	let t = String(e.completionMarker || "").trim();
	if (t) return t;
	let n = String(e.generationId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function Qs(e) {
	return String(e.generationId || e.id || "").trim();
}
function $s(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function ec(e, t) {
	let n = String(e.resourceId || "").trim(), r = t.findResource(n), i = Qs(e);
	return !n || !i ? null : Ks({
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
function tc(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function nc(e) {
	let t = Xs(tc(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= qs(), n.store;
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
			a.request(`forge.web.notification.${n.workspaceId}.${d(e, t)}`, { ifAvailable: !0 }, (e) => {
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
	let g = Vs({
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
			let r = new t(`${Hs}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), Rs() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
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
			let n = Ks(t.record);
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
		let a = Zs(t);
		if (!a || !n.workspaceId) return !1;
		let s = ec(t, {
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
		for (let t of e) Zs(t) && x(t, t.completionState || "");
	}
	function C(e, t) {
		let n = $s(e);
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
			r.key === Ys(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.refreshIcons()), r.key === Ws && (n.settings = t.readSettings(), Rs() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
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
var rc = "forge.web.paneSizes", ic = "forge.web.mobileImmersive", ac = "forge.web.layoutPreference", oc = "forge.web.fontScales", sc = [
	["forge.gui.paneSizes", rc],
	["forge.gui.mobileImmersive", ic],
	["forge.gui.layoutPreference", ac],
	["forge.gui.fontScales", oc]
], cc = 8, lc = 220, uc = 360, dc = 320, fc = 1e4, pc = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarAttentionHeight: 210
}), mc = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarAttentionHeight: "--sidebar-attention-height"
});
function hc(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function gc(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var _c = [
	"auto",
	"three",
	"two",
	"split"
];
function vc(e) {
	return _c.includes(e) ? e : "auto";
}
var yc = .8, bc = 1.4, xc = 1, Sc = [
	"sidebar",
	"details",
	"chat"
], Cc = Object.freeze({
	sidebar: "--sidebar-font-scale",
	details: "--details-font-scale",
	chat: "--chat-font-scale"
});
function wc(e) {
	return gc(e) ? Math.round(hc(e, yc, bc) * 100) / 100 : xc;
}
function Tc(e) {
	let t = e && typeof e == "object" ? e : {};
	return {
		sidebar: wc(t.sidebar),
		details: wc(t.details),
		chat: wc(t.chat)
	};
}
function Ec(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...pc };
	if (gc(n.sidebarWidth) && (r.sidebarWidth = hc(n.sidebarWidth, lc, fc)), gc(n.chatWidth)) r.chatWidth = hc(n.chatWidth, dc, fc);
	else if (gc(n.detailsWidth) && t >= 688) {
		let e = hc(n.detailsWidth, uc, t - cc - dc);
		r.chatWidth = hc(t - cc - e, dc, fc);
	}
	let i = gc(n.sidebarAttentionHeight) ? n.sidebarAttentionHeight : n.sidebarSessionHeight;
	return gc(i) && (r.sidebarAttentionHeight = hc(i, 84, fc)), r;
}
function Dc(e, t = window.localStorage) {
	let n = { ...pc }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = Tc(null), o = window.matchMedia("(max-width: 980px)"), s = window.matchMedia("(max-width: 1440px)");
	function c() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(rc) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function l() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(oc) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function u(e) {
		document.documentElement.style.setProperty(Cc[e], String(a[e]));
	}
	function d() {
		for (let e of Sc) u(e);
	}
	function f() {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}
	function p(e, t) {
		document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
	}
	function m(e, t) {
		if (!Object.hasOwn(mc, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(hc(t, r === "sidebarWidth" ? lc : r === "chatWidth" ? dc : 84, fc));
		n[r] = i, p(mc[r], i);
	}
	function h() {
		for (let e of Object.keys(mc)) m(e, n[e]);
	}
	function g() {
		t?.setItem(rc, JSON.stringify(n));
	}
	function _() {
		for (let [e, n] of sc) bs(t, e, n);
		let u = c();
		n = Ec(u, 0), h();
		let p = gc(u.sidebarSessionHeight) && !gc(u.sidebarAttentionHeight);
		gc(u.detailsWidth) && !gc(u.chatWidth) && !o.matches && (n = Ec(u, f()), h(), p = !0), p && g();
		try {
			r.immersive = t?.getItem(ic) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = vc(t?.getItem(ac));
		} catch {
			i = "auto";
		}
		x(), a = Tc(l()), d();
		let m = () => {
			x(), e();
		};
		o.addEventListener?.("change", m), s.addEventListener?.("change", m);
	}
	function v(e) {
		if (!Object.hasOwn(mc, e) || !t) return;
		let r = e, i = c();
		delete i.detailsWidth, delete i.sidebarSessionHeight;
		for (let e of Object.keys(mc)) gc(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(rc, JSON.stringify(i));
	}
	function y() {
		if (o.matches) return;
		let e = c();
		!gc(e.detailsWidth) || gc(e.chatWidth) || (n = Ec(e, f()), h(), g());
	}
	function b() {
		return o.matches ? "single" : i === "auto" ? s.matches ? "two" : "three" : i;
	}
	function x() {
		document.body.dataset.layout = b();
	}
	function S(n) {
		i = vc(n);
		try {
			t?.setItem(ac, i);
		} catch {}
		x(), e();
	}
	function C(n, r) {
		if (Object.hasOwn(Cc, n)) {
			a[n] = wc(r), u(n);
			try {
				t?.setItem(oc, JSON.stringify(a));
			} catch {}
			e();
		}
	}
	function w() {
		a = Tc(null), d();
		try {
			t?.removeItem(oc);
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
			t?.setItem(ic, r.immersive ? "1" : "0");
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
function Oc(e) {
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
function kc(e, t) {
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
function Ac(e) {
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
		n.open && e && !await dn({
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
		await l(), r(), e.toast("Workspace removed from Forge GUI.");
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
				}, e.renderWorkspace(), e.toast(i ? "Workspace icon saved." : "Workspace icon reset to the Forge default.");
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
		}), await o(), e.setConfig(kc(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: kc
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var jc = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering",
	"stopping"
]), Mc = 6e4;
function Nc(e) {
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
		if (Number.isFinite(n)) return t() - n <= Mc;
		if (!jc.has(e.status || "")) return !1;
		let r = new Date(e.updatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= Mc;
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
		let t = (e.children || []).filter((e) => e.archived !== !0), n = t.filter((e) => jc.has(e.runtime?.status || "")).length, r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n} working`;
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
var Pc = "forge.web.user.v1", Fc = "forge.gui.user.v1", Ic = 1, Lc = 80;
function Rc(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, Lc).join("") || "User";
}
function zc(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Ic ? "User" : Rc(t.name);
	} catch {
		return "User";
	}
}
function Bc(e, t) {
	let n = null;
	try {
		n = window.localStorage;
	} catch {}
	bs(n, Fc, Pc);
	let r = i();
	function i() {
		try {
			return zc(window.localStorage.getItem(Pc));
		} catch {
			return "User";
		}
	}
	function a(e) {
		let t = Rc(e);
		try {
			window.localStorage.setItem(Pc, JSON.stringify({
				version: Ic,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return r = t, r;
	}
	return e.listen(window, "storage", (e) => {
		e.key === Pc && (r = zc(e.newValue), t());
	}), {
		current: () => r,
		save: a
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var Vc = class {
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
}, Hc, Uc = null, Q = {
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
function Wc() {
	for (let e of Object.keys(Q.details)) delete Q.details[e];
}
var Gc = As({
	runtime: Q.agent,
	workspaceId: () => Q.activeWorkspaceId
}), Kc = Gc.clearResourceAfterAccepted, qc = Gc.clearMemory, Jc = Gc.flush, Yc = Gc.restoreResource, Xc = Gc.update, Zc = js(() => {
	Cd && (wu(), pd());
}), Qc = Dc(() => Zl()), $c = xn(() => Zl()), el = Oc({
	details: Q.details,
	context: () => ({
		workspaceId: Q.activeWorkspaceId,
		navigationVersion: Q.navigationVersion,
		selectedId: Q.selectedId,
		detailRequestVersion: Q.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++Q.detailRequestVersion,
	isCurrentWorkspace: (e, t) => Ul(e, t),
	request: (e, t) => $(e, t)
}), tl = Is({
	workspaceId: () => Q.activeWorkspaceId,
	templates: (e) => Q.details[e]?.templates || [],
	request: (e, t) => $(e, t),
	publish: (e) => Hc.renderCreateDialog(e),
	toast: fd,
	reloadTree: () => jl(),
	selectResource: (e) => eu(e),
	onOpen: () => {
		Q.modalEnter = "create";
	},
	onIconsChanged: pd,
	confirmTemplateSwitch: () => dn({
		title: "Switch template",
		message: "Discard edited template fields and switch templates?",
		confirmLabel: "Discard",
		danger: !0
	})
}), nl = (e) => document.getElementById(e), rl = 5e3, il = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, al = [
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
], ol = new Map(al.map((e) => [e.id, e])), { applyCustomOrder: sl, archiveRedirectTarget: cl, moveIdInList: ll, projectTaskSummary: ul, resourceRefText: dl, statusModel: fl, taskOperationalState: pl, taskOperationalStateKey: ml } = Nc({
	tree: () => Q.tree,
	findResource: (e) => qu(e),
	agentName: (e) => (Q.config?.agents || []).find((t) => t.id === e)?.name || e || "Forge GUI"
}), hl = 0, gl = Ac({
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
	publish: (e) => Hc.renderSettings(e),
	agentOptions: _l,
	workspaceIcons: [il, ...al],
	userName: Dl,
	saveUser: (e) => {
		if (!bl) throw Error("User settings are unavailable.");
		return bl.save(e);
	},
	appearance: () => {
		let e = Qc.snapshot();
		return {
			layout: e.layout.preference,
			fontScales: e.fontScales
		};
	},
	setLayoutPreference: (e) => Qc.setLayoutPreference(e),
	setFontScale: (e, t) => Qc.setFontScale(e, t),
	resetFontScales: () => Qc.resetFontScales(),
	notificationPreferences: () => yl?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => yl?.setBrowserEnabled(e),
	setCompletionSound: (e) => yl?.setSoundEnabled(e),
	flushDraft: Jc,
	resetAgentState: vu,
	reloadWorkspaceContext: async () => {
		await Ll(), await jl();
	},
	clearWorkspaceContext: () => {
		Q.tree = null, Wc(), Vl();
	},
	renderWorkspace: ql,
	renderAgentViews: () => {
		rd(), Du();
	},
	toast: fd,
	onIconsChanged: pd
});
function _l() {
	return ad().map((e) => ({
		id: e.id || "",
		label: Ou(e),
		summary: xu(e)
	}));
}
function vl() {
	Zl(), iu(), Gu(), Fu(), Du(), wu(), ku();
}
var yl = null, bl = null;
function xl(e) {
	yl?.initialize(e);
}
function Sl() {
	yl?.establishBaseline();
}
function Cl(e = Q.tree) {
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
function wl(e) {
	yl?.observeProjections(e);
}
function Tl(e, t) {
	t && yl?.observeEvent(e, t);
}
function El(e) {
	yl?.clearResource(e);
}
function Dl() {
	return bl?.current() || "User";
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
		throw new $t(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function Ol() {
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
			error: Ms(e),
			workspaces: []
		};
	}
}
async function kl() {
	if (Q.doctor.checking) return;
	Q.doctor = {
		...Q.doctor,
		checking: !0
	}, Zl();
	let e = await fetch("/api/doctor", { method: "POST" });
	e.ok || (Q.doctor = {
		...Q.doctor,
		checking: !1,
		error: `${e.status} ${e.statusText}`
	}, Zl());
}
async function Al() {
	let e = $u(), [t, n, r] = await Promise.all([
		$("/api/workspaces"),
		$("/api/settings/agenthub"),
		Ol()
	]);
	Q.config = ld(t, n), Q.doctor = r, rd(), Q.activeWorkspaceId = ed(e.workspaceId) ? e.workspaceId || "" : Q.config?.activeId || Q.config?.workspaces[0]?.id || "", Q.selectedId = e.resourceId || "workspace", ql(), Q.activeWorkspaceId ? (xl(Q.activeWorkspaceId), await Ll(), !e.resourceId && Q.lastResourceId && (Q.selectedId = Q.lastResourceId), await jl({ replaceURL: !0 })) : (Q.navigationLoading = !1, Q.tree = null, Wc(), Q.workspaceAgents = null, Q.diff = null, vu(), Vl());
}
async function jl(e = {}) {
	if (!Q.activeWorkspaceId) return;
	let t = Q.activeWorkspaceId, n = Q.navigationVersion, r = ++Q.treeRequestVersion;
	Q.navigationLoading = !0, Q.navigationError = "", Zl(), Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let i;
	try {
		i = await $(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw Ul(t, n, r) && (Q.navigationLoading = !1, Q.navigationError = Ms(e), Zl()), e;
	}
	Ul(t, n, r) && (Q.tree = i, Wc(), Q.workspaceAgents = null, Q.diff = null, Yu(), Qu(!1), Q.selectedId === "workspace" ? await Il() : Q.selectedId && await Ml(Q.selectedId), Ul(t, n, r) && (await mu(t, Bu()), Ul(t, n, r) && (Sl(), Q.navigationLoading = !1, Q.navigationError = "", Vl(), e.updateURL !== !1 && td({ replace: !!e.replaceURL }))));
}
async function Ml(e, t = {}) {
	return el.load(e, t);
}
function Nl(e, t = Q.activeWorkspaceId, n = {}) {
	return el.fetch(e, t);
}
function Pl(e) {
	return el.snapshot(e);
}
function Fl(e) {
	return el.apply(e);
}
async function Il(e = {}) {
	if (!Q.activeWorkspaceId || Q.workspaceAgents && !e.force) return;
	let t = Q.activeWorkspaceId, n = Q.navigationVersion, r = ++Q.workspaceAgentsRequestVersion;
	try {
		let e = await $(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!Ul(t, n) || r !== Q.workspaceAgentsRequestVersion) return null;
		Q.workspaceAgents = e;
	} catch (e) {
		if (!Ul(t, n) || r !== Q.workspaceAgentsRequestVersion) return null;
		Q.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: Ms(e)
		};
	}
	return Q.workspaceAgents;
}
async function Ll(e = Q.activeWorkspaceId, t = Q.navigationVersion) {
	let n = await $(`/api/workspaces/${e}/ui-state`);
	return Ul(e, t) ? (Q.expandedProjects = new Set(n.expandedProjects || []), Q.lastResourceId = n.lastResourceId || "", Q.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], Q.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, !0) : !1;
}
async function Rl() {
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
	}), Ul(e, t) && (Q.lastResourceId = n);
}
function zl() {
	Q.autoRefreshTimer ||= Uc?.interval(() => {
		Bl().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, rl) ?? null;
}
async function Bl() {
	if (!Q.activeWorkspaceId || Q.autoRefreshInFlight || Q.listDrag) return;
	let e = Q.autoRefreshVersion, t = Q.activeWorkspaceId, n = Q.navigationVersion, r = Q.selectedId;
	Q.autoRefreshInFlight = !0;
	try {
		let [i, a] = await Promise.all([uu(t), Ol()]);
		if (!i || !Wl(t, n, e)) return;
		let o = !ud(Q.tree, i);
		o && (Q.tree = i), ud(Q.doctor, a) || (Q.doctor = a, o = !0), wl(Cl(i)), Yu() && (td({ replace: !0 }), o = !0, r = Q.selectedId);
		let s = Q.expandedProjects.size;
		if (Qu(!1), o ||= s !== Q.expandedProjects.size, Q.selectedId === "workspace") {
			let r = Q.workspaceAgents;
			if (await Il({ force: !0 }), !Wl(t, n, e)) return;
			ud(r, Q.workspaceAgents) || (o = !0);
		} else if (r) {
			let i = ++Q.detailRequestVersion, a = await Nl(r, t);
			if (!Wl(t, n, e) || Q.selectedId !== r || i !== Q.detailRequestVersion) return;
			let s = Pl(r);
			Fl(a), ud(s, Pl(r)) || (o = !0);
		}
		wl(Cl(i)), await mu(t, Bu()) && (o = !0), ml() !== Q.taskOperationalStateKey && (o = !0), o && Vl();
	} finally {
		Q.autoRefreshInFlight = !1;
	}
}
function Vl() {
	Zl(), iu(), wu(), pd(), Gu(), ku();
}
function Hl() {
	Zl(), iu(), wu(), pd(), Gu();
}
function Ul(e, t, n = null) {
	return e === Q.activeWorkspaceId && t === Q.navigationVersion && (n == null || n === Q.treeRequestVersion);
}
function Wl(e, t, n) {
	return Ul(e, t) && n === Q.autoRefreshVersion;
}
function Gl(e) {
	return ol.get(String(e?.icon || "").trim()) || il;
}
function Kl(e) {
	let t = Gl(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function ql() {
	let e = Q.config?.workspaces?.find((e) => e.id === Q.activeWorkspaceId);
	Kl(e), Zl();
}
function Jl(e, t, n = "") {
	let r = pl(e), i = t === "project" && Zu(e.id), a = t === "project" ? ul(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: dl(e.id),
		active: Q.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: fl(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? sl(e.children || [], Q.taskOrder[e.id]).map((t) => Jl(t, "task", e.id)) : [],
		projectId: n,
		followed: !!e.attention?.followed
	};
}
function Yl(e) {
	if (!e) return null;
	let t = pl(e);
	return {
		id: e.id || "scheduler",
		type: "scheduler",
		title: e.title || "Scheduler",
		ref: "",
		active: Q.selectedId === (e.id || "scheduler"),
		expanded: !1,
		ariaLabel: ["Scheduler", t.label].filter(Boolean).join(". "),
		statusLabel: t.label || "Workspace Scheduler",
		status: fl(t.statusPresentation),
		summary: null,
		children: []
	};
}
function Xl(e) {
	let t = pl(e), n = e.type === "scheduler" || e.type === "project" || e.type === "task" ? e.type : "workspace", r = e.title || e.id;
	return {
		id: e.id,
		type: n,
		title: r,
		ref: n === "project" || n === "task" ? dl(e.id) : "",
		selected: Q.selectedId === e.id,
		activeTurn: !!e.runtime?.activeTurn,
		followed: !!e.attention?.followed,
		turnNumber: Number(e.runtime?.turnNumber) || 0,
		agentName: String(e.runtime?.agentName || "").trim(),
		statusLabel: t.label || (e.attention?.followed ? "Focused resource" : "Active turn"),
		status: fl(t.statusPresentation)
	};
}
function Zl() {
	let e = Q.tree ? sl(Q.tree.projects || [], Q.projectOrder).map((e) => Jl(e, "project")) : [], t = Q.tree?.attentionList?.map((e) => Xl(e)) || [];
	Q.tree && (Q.taskOperationalStateKey = ml()), Hc.renderAppShell({
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
			iconSrc: Gl(e).src
		})),
		scheduler: Yl(Q.tree?.scheduler),
		projects: e,
		attentionList: t,
		doctor: Ls(Q.doctor, Q.activeWorkspaceId),
		...Qc.snapshot(),
		route: $c.projection(),
		onSwitchWorkspace: (e) => Ql(e),
		onAddWorkspace: () => cd("workspace").catch((e) => fd(e.message)),
		onCreateProject: () => Vu(),
		onOpenSettings: () => cd().catch((e) => fd(e.message)),
		onRefreshDoctor: kl,
		onToggleProject: (e) => tu(e),
		onSelectResource: (e) => eu(e),
		onReorder: (e, t, n) => $l(e, t, n),
		onDragState: (e) => {
			Q.listDrag = e;
		},
		onToggleAttention: (e, t) => fu(e, t),
		onDismissAttention: (e) => pu(e),
		onPanePreview: (e, t) => gd(e, t),
		onPaneCommit: (e) => _d(e),
		onPaneViewport: () => vd(),
		onMobileSidebar: (e) => yd(e),
		onMobileView: (e) => bd(e),
		onMobileImmersive: (e) => xd(e),
		onHistoryNavigation: (e) => Dd(e),
		onToast: fd,
		onIconsChanged: pd
	});
}
async function Ql(e) {
	if (!ed(e)) return;
	if (Q.workspaceMenuOpen = !1, e === Q.activeWorkspaceId) {
		ql();
		return;
	}
	yd(!1), Jc(), Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let t = Q.navigationVersion;
	await Rl().catch((e) => console.warn("failed to save UI state", e)), Q.activeWorkspaceId = e, Q.selectedId = "workspace", Q.tree = null, Q.navigationLoading = !0, Q.navigationError = "", Wc(), xl(e), Wu(), vu(), ql(), await Ll(e, t) && (Q.selectedId = Q.lastResourceId || "workspace", await jl());
}
async function $l(e, t, n) {
	let r = {
		projectOrder: [...Q.projectOrder],
		taskOrder: Object.fromEntries(Object.entries(Q.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []]))
	};
	if (e.kind === "task") {
		let r = qu(e.projectId);
		if (!r) return;
		let i = sl(r.children || [], Q.taskOrder[e.projectId]);
		Q.taskOrder = {
			...Q.taskOrder,
			[e.projectId]: ll(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") Q.projectOrder = ll(sl(Q.tree?.projects || [], Q.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	Zl();
	try {
		await Rl();
	} catch (e) {
		throw Q.projectOrder = r.projectOrder, Q.taskOrder = r.taskOrder, Zl(), e;
	}
}
async function eu(e, t = {}) {
	let n = Q.selectedId !== e;
	t.clearUnread !== !1 && El(e);
	let r = n || !!t.forceDetail;
	r && (Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++, e !== "workspace" && el.reset(e)), n && (Jc(), Nu(), Q.diff = null, qc(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.steeringMessageId = ""), Q.selectedId = e, yd(!1), Qu(!1), td(), Rl().catch((e) => console.warn("failed to save UI state", e)), Hl(), await Promise.all([e === "workspace" ? Il({ force: !!t.forceDetail }) : Ml(e, { force: r }), mu(Q.activeWorkspaceId, e)]), Ul(Q.activeWorkspaceId, Q.navigationVersion) && Hl();
}
async function tu(e) {
	Q.expandedProjects.has(e) ? Q.expandedProjects.delete(e) : Q.expandedProjects.add(e), Zl();
	try {
		await Rl();
	} catch (t) {
		throw Q.expandedProjects.has(e) ? Q.expandedProjects.delete(e) : Q.expandedProjects.add(e), Zl(), t;
	}
}
function nu() {
	let e = Q.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${Q.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: nd(),
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
		} : qu(Q.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: (Q.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: _l(),
		resolveResourceTitle: Ju,
		onNavigate: (e) => au(e).catch((e) => fd(Ms(e))),
		onCreateTask: (e) => Hu(e),
		onArchive: (e) => Ku(e).catch((e) => fd(Ms(e))),
		onSaveWorkspaceAgents: (e, t) => ou(e, t),
		onSaveMarkdownFile: (e, t, n) => su(e, t, n),
		onDeleteArtifact: (e) => cu(e),
		onSaveAgentBinding: async (t) => {
			let n = Q.selectedId || "workspace";
			await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await jl({ updateURL: !1 }), n !== "workspace" && await Ml(n, { force: !0 }), Vl(), fd("Resource agent binding saved.");
		},
		onSaveWorkspaceDefaults: async (t) => {
			await $(`/api/workspaces/${encodeURIComponent(e)}/defaults`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await jl({ updateURL: !1 }), Vl(), fd("Workspace default bindings saved.");
		},
		onSaveTaskDefault: async (t, n) => {
			await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/task-default`, {
				method: "PUT",
				body: JSON.stringify(n || {})
			}), await jl({ updateURL: !1 }), await Ml(t, { force: !0 }), Vl(), fd(n ? "Project Task default saved." : "Project Task default reset to inherit.");
		},
		onRefreshScheduler: async () => {
			await jl({ updateURL: !1 }), Q.selectedId === "scheduler" && await Ml("scheduler", { force: !0 }), Vl();
		},
		onToast: fd,
		onIconsChanged: pd
	};
	if (!Q.tree) return t;
	if (Q.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: nd()
	};
	let n = qu(Q.selectedId) || Q.tree.scheduler || Q.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: nd()
	};
	let r = Q.details[n.id] || null, i = Xu(n.id);
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
		detail: ru(r)
	};
}
function ru(e) {
	return !e || e.type !== "scheduler" && e.type !== "project" && e.type !== "task" ? null : {
		...e,
		type: e.type,
		title: e.title || e.id,
		path: e.path || ""
	};
}
function iu() {
	Hc.renderDetailPanel(nu());
}
async function au(e) {
	await eu(e, { forceDetail: e === Q.selectedId && e !== "workspace" });
}
async function ou(e, t) {
	if (!Q.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = Q.activeWorkspaceId, r = Q.navigationVersion, i = await $(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!Ul(n, r) || Q.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return Q.workspaceAgents = i, Vl(), i;
}
async function su(e, t, n) {
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
	if (!Ul(r, a) || Q.selectedId !== i) throw Error("The resource changed before the Markdown file finished saving.");
	return await Ml(i, { force: !0 }), Vl(), o;
}
async function cu(e) {
	let t = Q.activeWorkspaceId, n = Q.selectedId;
	if (!t || !n || n === "workspace" || n === "scheduler") throw Error("No editable resource is selected.");
	let r = Q.navigationVersion;
	if (await $(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(n)}/artifacts?path=${encodeURIComponent(e)}`, { method: "DELETE" }), !Ul(t, r) || Q.selectedId !== n) throw Error("The resource changed before the artifact finished deleting.");
	await Ml(n, { force: !0 }), Vl(), fd("Artifact deleted.");
}
function lu() {
	Q.diffRequestVersion++, Q.diff = null, Vl();
}
async function uu(e = Q.activeWorkspaceId) {
	let t = ++Q.treeRequestVersion, n = Q.navigationVersion, r = await $(`/api/workspaces/${e}/tree`);
	return Ul(e, n, t) ? r : null;
}
async function du() {
	if (!Q.activeWorkspaceId || !Q.tree) return;
	let e = await uu(Q.activeWorkspaceId);
	e && (Q.tree = e);
}
async function fu(e, t) {
	let n = Q.activeWorkspaceId;
	!n || !e || (await $(`/api/workspaces/${encodeURIComponent(n)}/resources/${encodeURIComponent(e)}/attention`, {
		method: "PUT",
		body: JSON.stringify({ followed: t })
	}), await du(), Vl());
}
async function pu(e) {
	let t = Q.activeWorkspaceId;
	!t || !e || (await $(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(e)}/attention/dismiss`, { method: "POST" }), await du(), Vl());
}
async function mu(e = Q.activeWorkspaceId, t = Bu()) {
	if (!e || !t) return !1;
	let n = ++Q.messageStatusRequestVersion, r = `${e}:${t}`, i = await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/status`);
	if (n !== Q.messageStatusRequestVersion || e !== Q.activeWorkspaceId || t !== Bu()) return !1;
	let a = Q.messageStatusKey !== r || !ud(Q.messageStatus, i);
	return Q.messageStatusKey = r, Q.messageStatus = i, a;
}
function hu() {
	Q.stopNotice = null, Du();
}
async function gu(e) {
	if (!e || Q.steeringMessageId) return;
	let t = Q.activeWorkspaceId, n = Bu();
	Q.steeringMessageId = e, Du();
	try {
		await $(`/api/workspaces/${encodeURIComponent(t)}/messages/${encodeURIComponent(e)}/steer`, { method: "POST" }), await mu(t, n), t === Q.activeWorkspaceId && n === Bu() && (Vl(), fd("Message inserted into the current turn."));
	} catch (e) {
		try {
			await mu(t, n);
		} catch {}
		throw e;
	} finally {
		Q.steeringMessageId === e && (Q.steeringMessageId = "", Du());
	}
}
async function _u() {
	Jc(), Zc.reset(), qc(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.stopNotice = null, await mu();
}
function vu() {
	Jc(), Nu(), Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, qc(), Zc.reset(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.steeringMessageId = "", Q.stopNotice = null, Q.agent.toolGroupOpen.clear(), Q.agent.approvalDrafts.clear(), Q.agent.renderDeferredForSelection = !1, bu();
}
function yu(e, t, n) {
	if (e !== Q.activeWorkspaceId || t !== Bu() || !n) return;
	let r = qu(t)?.runtime || Q.messageStatus?.generation;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && Tl(n, r?.generationId ? {
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
	].includes(n.type) && mu().then(Vl).catch((e) => console.warn("agent refresh failed", e));
}
function bu() {
	Q.agent.renderTimer && window.clearTimeout(Q.agent.renderTimer), Q.agent.renderTimer = null;
}
function xu(e) {
	if (!e) return "";
	let t = [Su(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function Su(e) {
	return (Q.config?.agentHubProviders || gl.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function Cu(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function wu(e = {}) {
	Du();
	let t = Bu(), n = Q.messageStatusKey === `${Q.activeWorkspaceId}:${t}` ? Q.messageStatus : null, r = (Q.config?.agents || []).find((e) => e.id === n?.resolvedAgent) || id(), i = qu(t)?.runtime;
	Hc.renderAgentPanelHeader({
		identity: `${Q.activeWorkspaceId}:${t}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		status: n,
		submitting: Zc.isSending(Tu(Q.activeWorkspaceId, t)),
		agentName: Ou(r),
		modelSummary: xu(r),
		turnNumber: Number(n?.generation?.turnNumber) || Number(i?.turnNumber) || 0,
		turnStartedAt: String(i?.turnStartedAt || ""),
		onIconsChanged: pd
	}), Hc.renderEventTimeline({
		identity: `${Q.activeWorkspaceId}:${t}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: Ou(r),
		resolveResourceTitle: Ju,
		onNavigate: (e) => eu(e).catch((e) => fd(Ms(e))),
		project: Vr,
		onEvent: yu,
		onNotice: () => {},
		onApproval: Ru,
		onToast: fd,
		onIconsChanged: pd
	});
}
function Tu(e, t) {
	return `${e || "workspace"}:${t || "resource"}`;
}
var Eu = "";
function Du(e = {}) {
	Q.agent.skipChatDraftSync = !1;
	let t = Bu();
	Q.activeWorkspaceId && t && Yc(t);
	let n = Zc.active("turn-stop") && Zc.key("turn-stop") === t, r = Zc.active("generation-end") && Zc.key("generation-end") === t, i = Q.messageStatusKey === `${Q.activeWorkspaceId}:${t}` ? Q.messageStatus : null, a = Q.activeWorkspaceId, o = `${a}:${t}`, s = !!(n || ["running", "waiting_approval"].includes(String(i?.session?.state || "")));
	Hc.renderComposer({
		identity: `${Q.activeWorkspaceId}:${t}:${Q.agent.chatDraftKey || ""}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		draft: Q.agent.chatDraft || "",
		draftKey: Q.agent.chatDraftKey || "",
		draftResetVersion: Q.agent.chatDraftResetVersion || 0,
		unavailableReason: i ? i.acceptsMessages ? "" : i.archived ? "This resource is archived." : i.configError || "This resource cannot accept messages." : "Loading work status.",
		sending: Zc.isSending(Tu(Q.activeWorkspaceId, t)),
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
		} : qu(t)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: (Q.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: _l(),
		bindingSaving: Eu === t,
		onDraft: (e, t) => Au(e, t),
		onSend: zu,
		onOpenUpload: ju,
		onEndTurn: () => Iu().catch((e) => fd(e.message)),
		onEndGeneration: () => Lu().catch((e) => fd(e.message)),
		onDismissStopNotice: hu,
		onSteerWaiting: gu,
		onSaveAgentBinding: async (e) => {
			if (t === Bu()) {
				Eu = t, Du();
				try {
					await $(`/api/workspaces/${encodeURIComponent(a)}/resources/${encodeURIComponent(t)}/agent-binding`, {
						method: "PUT",
						body: JSON.stringify(e)
					}), await jl({ updateURL: !1 }), t !== "workspace" && await Ml(t, { force: !0 }), Vl(), fd("Resource agent binding saved.");
				} catch (e) {
					fd(Ms(e));
				} finally {
					Eu = "", Du();
				}
			}
		},
		onIconsChanged: pd
	});
}
function Ou(e) {
	return e?.name || e?.id || "Agent";
}
function ku() {
	gl.render();
}
function Au(e, t) {
	!t || t.workspaceId !== Q.activeWorkspaceId || t.resourceId !== Bu() || t.draftKey !== Q.agent.chatDraftKey || Xc(e);
}
function ju() {
	let e = Bu();
	if (!e || Q.messageStatus?.archived) {
		fd("Select an active resource before uploading files.");
		return;
	}
	let t = nl("chatInput");
	t && Xc(t.value), Q.modalEnter = "upload", Q.uploadDialog = {
		open: !0,
		identity: ++hl,
		resourceId: e,
		items: [],
		nextId: 1
	}, Fu();
}
function Mu(e = [], t = {}) {
	if (!Q.uploadDialog.open) return;
	let n = Q.uploadDialog.resourceId === Bu(), r = !t.workspaceId || t.workspaceId === Q.activeWorkspaceId, i = e.length > 0 && r && n;
	i && (Xc(Pu(Q.agent.chatDraft, e)), Q.agent.chatDraftResetVersion++), Nu();
	let a = nl("chatComposer");
	a && delete a.dataset.composerKey, Du({ skipDraftSync: i }), nl("chatInput")?.focus({ preventScroll: !0 }), pd();
}
function Nu() {
	Q.uploadDialog = {
		open: !1,
		identity: ++hl,
		resourceId: "",
		items: [],
		nextId: 1
	}, Fu();
}
function Pu(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function Fu() {
	let e = Q.uploadDialog;
	Hc.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${Q.activeWorkspaceId}:${e.resourceId || ""}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: e.resourceId || "",
		onDone: Mu,
		onIconsChanged: pd
	});
}
async function Iu() {
	let e = Q.activeWorkspaceId, t = Bu(), n = Q.messageStatus?.generation?.generationId || "", r = Zc.begin("turn-stop", t);
	if (r) try {
		let r = n ? `?generationId=${encodeURIComponent(n)}` : "", i = await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/turn/end${r}`, { method: "POST" }), a = Math.max(0, Number(i.cancelledPendingSteerCount || 0)), o = a === 1 ? "Turn stopped. 1 pending steer was cancelled and will not affect the next turn." : a > 1 ? `Turn stopped. ${a} pending steers were cancelled and will not affect the next turn.` : "Turn stopped. No pending steer remained; any steer already delivered to this turn was not changed.";
		i.pendingSteerCancellationError && (o += ` Pending steer cancellation needs attention: ${i.pendingSteerCancellationError}`), Q.stopNotice = {
			key: `${e}:${t}`,
			text: o
		}, await mu(e, t), Vl();
	} finally {
		Zc.finish(r);
	}
}
async function Lu() {
	let e = Q.activeWorkspaceId, t = Bu(), n = Q.messageStatus?.generation?.generationId || "";
	if (!e || !t || !n || !window.confirm("End this generation? Its AgentHub session will be stopped and archived. Your next message will start a new generation.")) return;
	let r = Zc.begin("generation-end", t);
	if (r) try {
		await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/generation/end?generationId=${encodeURIComponent(n)}`, { method: "POST" }), await Promise.all([mu(e, t), du()]), Vl(), fd("Generation is ending. Your next message will start a new generation.");
	} finally {
		Zc.finish(r);
	}
}
async function Ru(e, t, n) {
	let r = Q.activeWorkspaceId, i = Bu();
	await $(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/approval?generationId=${encodeURIComponent(e)}`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), await mu(r, i), Vl();
}
async function zu(e, t) {
	if (!e.trim() || t.workspaceId !== Q.activeWorkspaceId || t.resourceId !== Bu() || t.draftKey !== Q.agent.chatDraftKey) return {
		accepted: !1,
		clear: !1
	};
	let n = Tu(t.workspaceId, t.resourceId);
	if (!Zc.startSending(n)) return {
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
				sender: { name: Dl() }
			})
		});
		let n = Kc({
			workspaceId: t.workspaceId,
			resourceId: t.resourceId,
			key: t.draftKey,
			text: e,
			version: r
		});
		return n && Q.agent.chatDraftResetVersion++, n && Q.stopNotice?.key === `${t.workspaceId}:${t.resourceId}` && (Q.stopNotice = null), await Promise.all([mu(t.workspaceId, t.resourceId), du()]), Vl(), {
			accepted: !0,
			clear: n
		};
	} finally {
		Zc.stopSending(n);
	}
}
function Bu() {
	return Q.selectedId === "workspace" ? "workspace" : qu(Q.selectedId)?.id || "";
}
function Vu() {
	Uu("project");
}
function Hu(e) {
	Uu("task", e);
}
function Uu(e, t = "") {
	tl.open(e === "task" ? "task" : "project", t);
}
function Wu() {
	tl.close();
}
function Gu() {
	tl.render();
}
async function Ku(e) {
	let t = cl(e, Q.projectOrder, Q.taskOrder), n = (await $(`/api/workspaces/${Q.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	})).warnings || [];
	fd(n.length > 0 ? ["Archived.", ...n.map((e) => `Warning: ${e.message}`)].join("\n") : "Archived."), Q.selectedId = t, await jl();
}
function qu(e) {
	if (!Q.tree) return null;
	if (Q.tree.scheduler?.id === e) return Q.tree.scheduler;
	for (let t of Q.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function Ju(e) {
	if (e === "workspace") return nd();
	let t = qu(e);
	return t ? String(t.title || t.id).trim() || t.id : null;
}
function Yu() {
	return Q.selectedId === "workspace" || qu(Q.selectedId) ? !1 : (Q.selectedId = "workspace", !0);
}
function Xu(e) {
	if (!Q.tree) return null;
	for (let t of Q.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function Zu(e) {
	return Q.expandedProjects.has(e);
}
function Qu(e = !1) {
	let t = Xu(Q.selectedId);
	!t || t.id === Q.selectedId || Q.expandedProjects.has(t.id) || (Q.expandedProjects.add(t.id), e && Rl().catch((e) => fd(e.message)));
}
function $u(e = window.location.pathname) {
	return $c.parse(e);
}
function ed(e) {
	return !!(e && Q.config?.workspaces.some((t) => t.id === e));
}
function td(e = {}) {
	$c.project(Q.activeWorkspaceId, Q.selectedId, e);
}
function nd() {
	return Q.config?.workspaces.find((e) => e.id === Q.activeWorkspaceId)?.name || "Workspace";
}
function rd() {
	let e = ad(), t = od();
	e.some((e) => e.id === Q.agent.agentName) || (Q.agent.agentName = t);
}
function id() {
	let e = ad(), t = Q.agent.agentName || od();
	return e.find((e) => e.id === t) || e[0] || null;
}
function ad() {
	return (Q.config?.agents || []).filter((e) => e.available !== !1);
}
function od() {
	let e = ad();
	return sd(Q.config?.agentProfiles, "default") || sd(gl.profiles(), "default") || e[0]?.id || "";
}
function sd(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function cd(e = "workspace") {
	return gl.open(e);
}
function ld(e, t) {
	return gl.withAgentHubCatalog(e, t);
}
function ud(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var dd = 0;
function fd(e) {
	Hc.renderToast({
		message: String(e || ""),
		revision: ++dd
	});
}
function pd() {
	let e = window.lucide;
	!e || Q.iconRefreshScheduled || (Q.iconRefreshScheduled = !0, Uc?.animationFrame(() => {
		Q.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function md(e) {
	pd(), e === "markdown" && window.marked && window.DOMPurify && (iu(), pd()), e === "diff" && iu();
}
window.forgeAssetLoaded = md;
function hd() {
	Qc.initialize();
}
function gd(e, t) {
	Qc.previewPane(e, t);
}
function _d(e) {
	Qc.commitPane(e);
}
function vd() {
	Qc.syncViewport();
}
function yd(e) {
	Qc.setMobileSidebar(e);
}
function bd(e) {
	Qc.setMobileView(e);
}
function xd(e) {
	Qc.setMobileImmersive(e);
}
function Sd() {
	Uc?.listen(document, "selectionchange", () => {
		if (!Q.agent.renderDeferredForSelection) return;
		let e = nl("chatTimeline");
		e && Cu(e) || (Q.agent.renderDeferredForSelection = !1, wu(), pd());
	}), Uc?.listen(document, "keydown", (e) => {
		e.key === "Escape" && Q.diff ? lu() : e.key === "Escape" && (Q.agent.optionsOpen || Q.agent.historyOpen) && (Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, Du(), pd());
	}), Uc?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			au(n.dataset.breadcrumbResource || "workspace").catch((e) => fd(Ms(e)));
			return;
		}
		(Q.agent.optionsOpen || Q.agent.historyOpen) && t && !t.closest(".chat-composer") && (Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, Du(), pd()), pd();
	}), Uc?.listen(window, "beforeunload", Td), Uc?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && Td();
	});
}
var Cd = !1;
function wd(e) {
	if (Hc = e, Cd) {
		vl();
		return;
	}
	Cd = !0;
	let t = new Vc();
	Uc = t, yl = nc({
		scope: t,
		selectedResourceId: () => Q.selectedId,
		resourceProjections: () => Cl(),
		hasTree: () => !!Q.tree,
		findResource: qu,
		selectResource: eu,
		notificationsSettingsVisible: () => gl.isOpenTab("notifications"),
		renderSettings: ku,
		refreshIcons: pd,
		flushDraft: Td
	}), bl = Bc(t, () => {
		gl.isOpenTab("user") && ku();
	}), Sd(), hd(), yl.install(), Zl(), Al().catch((e) => {
		Q.navigationLoading = !1, Q.navigationError = e.message, fd(e.message), Vl();
	}), zl();
}
function Td() {
	Jc();
}
function Ed() {
	Cd && (Td(), Cd = !1, yl?.dispose(), yl = null, bl = null, Zc.reset(), bu(), tl.dispose(), Uc?.dispose(), Uc = null, Q.autoRefreshTimer = null);
}
async function Dd(e) {
	let t = $u(e);
	if (!ed(t.workspaceId)) {
		td({ replace: !0 });
		return;
	}
	let n = Q.activeWorkspaceId !== t.workspaceId, r = Q.selectedId;
	Jc(), Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let i = Q.navigationVersion;
	if (Q.activeWorkspaceId = t.workspaceId || "", Q.selectedId = t.resourceId || "workspace", !n && r !== Q.selectedId && Q.selectedId !== "workspace" && (el.reset(Q.selectedId), delete Q.details[Q.selectedId]), Q.diff = null, n && (Q.tree = null, Q.navigationLoading = !0, Q.navigationError = "", Wu(), xl(Q.activeWorkspaceId)), n && vu(), ql(), n) {
		if (!await Ll(t.workspaceId || "", i)) return;
		!t.resourceId && Q.lastResourceId && (Q.selectedId = Q.lastResourceId), await jl({ updateURL: !1 }), Ul(t.workspaceId || "", i) && td({ replace: !0 });
	} else {
		let e = Yu();
		if (Q.selectedId === "workspace" ? await Il() : (Qu(!1), await Ml(Q.selectedId)), !Ul(t.workspaceId || "", i)) return;
		r !== Q.selectedId && await _u(), Vl(), e && td({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var Od = ys(), kd = {
	renderAppShell: Od.appShell.publish,
	renderCreateDialog: Od.create.publish,
	renderSettings: Od.settings.publish,
	renderUploadDialog: Od.upload.publish,
	renderComposer: Od.composer.publish,
	renderEventTimeline: Od.timeline.publish,
	renderAgentPanelHeader: Od.agentHeader.publish,
	renderDetailPanel: Od.detail.publish,
	renderToast: Od.toast.publish
}, Ad = null;
async function jd() {
	if (Ad) return;
	let e = document.getElementById("app");
	if (!e) throw Error("Forge application root is unavailable.");
	e.dataset.componentOwner = "app-shell", Ad = i(_s, {
		target: e,
		props: { channels: Od }
	}), wd(kd);
}
async function Md() {
	if (Ed(), !Ad) return;
	let e = Ad;
	Ad = null, await m(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void Md()), window.addEventListener("pageshow", (e) => {
	e.persisted && jd();
}), jd().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
