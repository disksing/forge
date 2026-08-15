import { A as e, B as t, C as n, D as r, E as i, F as a, G as o, H as s, I as c, J as l, K as u, L as d, M as f, N as p, O as m, P as h, R as g, S as _, T as v, U as y, V as b, W as x, X as S, Y as C, Z as w, _ as T, a as E, b as D, c as O, d as k, f as A, g as j, h as M, i as N, j as P, k as F, l as I, m as L, n as R, o as z, p as B, q as V, r as H, s as U, t as W, u as G, v as K, w as q, x as J, y as ee, z as Y } from "./Icon-DhNPRoAS.js";
//#region src/components/DoctorDialog.svelte
var te = P("<div class=\"doctor-global-error\"><strong>Doctor could not run</strong><span> </span></div>"), ne = P("<div class=\"doctor-empty\"><!><span>Checking configured Workspaces…</span></div>"), re = P("<div class=\"doctor-empty\"><!><span>No configured Workspace problems.</span></div>"), ie = P("<code> </code>"), ae = P("<p> </p>"), oe = P("<article><div class=\"doctor-issue-icon\"><!></div> <div class=\"doctor-issue-copy\"><div class=\"doctor-issue-title\"><strong> </strong><span> </span></div> <!> <!></div></article>"), se = P("<section class=\"doctor-workspace\"><div class=\"doctor-workspace-heading\"><div><h3> </h3><code> </code></div> <span> </span></div> <div class=\"doctor-issues\"></div></section>"), ce = P("<div data-component-owner=\"doctor-dialog\" class=\"doctor-backdrop\" role=\"presentation\"><div class=\"doctor-dialog\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"doctorTitle\"><header><div><h2 id=\"doctorTitle\">Workspace problems</h2> <p> </p></div> <div class=\"doctor-header-actions\"><button type=\"button\" class=\"doctor-refresh\" aria-label=\"Refresh workspace checks\"><!> Refresh</button> <button type=\"button\" class=\"doctor-close\" aria-label=\"Close workspace problems\"><!></button></div></header> <div class=\"doctor-content\"><!> <!></div></div></div>");
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
	Y(() => {
		i.snapshot, queueMicrotask(i.onIconsChanged);
	});
	var f = ce(), p = t(f), m = t(p), _ = t(m), v = s(t(_), 2), y = t(v);
	w(v), w(_);
	var T = s(_, 2), E = t(T), D = t(E);
	{
		let e = u(() => c(a) || i.snapshot.checking ? "loader-circle" : "refresh-cw");
		W(D, { get name() {
			return c(e);
		} });
	}
	S(), w(E);
	var O = s(E, 2), k = t(O);
	W(k, { name: "x" }), w(O), w(T), w(m);
	var A = s(m, 2), M = t(A), N = (e) => {
		var n = te(), a = s(t(n)), o = t(a, !0);
		w(a), w(n), g(() => r(o, i.snapshot.error)), F(e, n);
	};
	q(M, (e) => {
		i.snapshot.error && e(N);
	});
	var P = s(M, 2), I = (e) => {
		var n = ne(), r = t(n);
		W(r, { name: "loader-circle" }), S(), w(n), F(e, n);
	}, L = (e) => {
		var n = re(), r = t(n);
		W(r, { name: "circle-check" }), S(), w(n), F(e, n);
	}, R = (n) => {
		var a = e(), o = b(a);
		J(o, 17, () => i.snapshot.workspaces, (e) => e.id, (n, i) => {
			var a = e(), o = b(a), l = (e) => {
				var n = se(), a = t(n), o = t(a), l = t(o), d = t(l, !0);
				w(l);
				var f = s(l), p = t(f, !0);
				w(f), w(o);
				var m = s(o, 2), h = t(m, !0);
				w(m), w(a);
				var _ = s(a, 2);
				J(_, 23, () => c(i).report.issues, (e, t) => `${e.code}:${e.path || ""}:${e.resourceId || ""}:${t}`, (e, n) => {
					var i = oe();
					let a;
					var o = t(i), l = t(o);
					{
						let e = u(() => c(n).severity === "error" ? "circle-x" : "triangle-alert");
						W(l, { get name() {
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
					q(v, (e) => {
						c(n).path && e(y);
					});
					var b = s(v, 2), x = (e) => {
						var i = ae(), a = t(i, !0);
						w(i), g(() => r(a, c(n).suggestion)), F(e, i);
					};
					q(b, (e) => {
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
			q(o, (e) => {
				c(i).report.issues.length > 0 && e(l);
			}), F(n, a);
		}), F(n, a);
	};
	q(P, (e) => {
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
		J(n, 21, () => r.status.statuses, (e) => e.key, (e, n) => {
			var r = ue(), i = t(r);
			W(i, {
				get name() {
					return c(n).iconName;
				},
				className: "task-status-icon"
			}), w(r), g(() => j(r, 1, `task-status-indicator ${c(n).className} ${c(n).recentOutput ? "task-status-fresh" : ""}`)), F(e, r);
		}), w(n), g(() => j(n, 1, `task-status-slot ${i()} ${r.status.slotClassName}`)), F(e, n);
	};
	q(o, (e) => {
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
		W(r, { name: "message-square" }), S(), w(n), F(e, n);
	}, D = (n) => {
		var l = e(), y = b(l);
		J(y, 17, () => i.items, (e) => e.id, (e, n) => {
			var i = ge(), l = t(i), y = t(l), b = t(y);
			{
				let e = u(() => o(c(n)));
				W(b, {
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
				W(a, { name: "star" }), w(r), g(() => {
					i = j(r, 1, "attention-star", null, i, { followed: c(n).followed }), I(r, "aria-label", c(n).followed ? `Unfollow ${c(n).title}` : `Follow ${c(n).title}`), I(r, "title", c(n).followed ? "Unfollow" : "Follow");
				}), h("click", r, (e) => m(e, c(n))), h("keydown", r, (e) => v(e, (e) => m(e, c(n)))), F(e, r);
			}, M = u(() => d(c(n)));
			q(k, (e) => {
				c(M) && e(A);
			});
			var N = s(k, 2), P = (e) => {
				var r = he(), i = t(r);
				W(i, { name: "x" }), w(r), g(() => I(r, "aria-label", `Dismiss ${c(n).title}`)), h("click", r, (e) => _(e, c(n))), h("keydown", r, (e) => v(e, (e) => _(e, c(n)))), F(e, r);
			};
			q(N, (e) => {
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
	q(T, (e) => {
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
	W(o, { name: "menu" }), w(a);
	var c = s(a, 2), u = t(c), d = s(u, 2);
	w(c);
	var f = s(c, 2);
	let p;
	var m = t(f), _ = t(m);
	W(_, { name: "minimize-2" }), w(m);
	var v = s(m), y = t(v);
	W(y, { name: "maximize-2" }), w(v), w(f), w(i);
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
	Y(() => {
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
	W(L, { name: "plus" }), w(P), w(N);
	var z = s(N, 2), B = t(z), V = (e) => {
		var n = Ce(), r = t(n);
		W(r, {
			name: "loader-circle",
			className: "empty-state-icon"
		}), S(2), w(n), F(e, n);
	}, H = (e) => {
		var n = we(), a = t(n);
		W(a, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var o = s(a, 2), c = t(o, !0);
		w(o), w(n), g(() => r(c, i.error)), F(e, n);
	}, U = (e) => {
		var n = Te(), r = t(n);
		W(r, {
			name: "folder-search",
			className: "empty-state-icon"
		}), S(2), w(n), F(e, n);
	}, G = (n) => {
		var o = e(), l = b(o);
		J(l, 17, () => i.projects, (e) => e.id, (e, n) => {
			var i = ke(), o = b(i), l = t(o);
			let d;
			var f = t(l), _ = (e) => {
				W(e, { name: "chevron-right" });
			};
			q(f, (e) => {
				c(n).children.length && e(_);
			}), w(l);
			var y = s(l, 2);
			fe(y, { get status() {
				return c(n).status;
			} });
			var x = s(y, 2);
			W(x, {
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
			q(L, (e) => {
				c(n).summary && !c(n).expanded && e(R);
			}), w(S);
			var z = s(S, 2);
			let B;
			var V = t(z);
			W(V, { name: "star" }), w(z);
			var H = s(z, 2), U = t(H);
			W(U, {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), w(H), w(o);
			var G = s(o, 2), K = (e) => {
				var i = Oe();
				J(i, 21, () => c(n).children, (e) => e.id, (e, i) => {
					var o = De(), l = s(t(o), 2);
					fe(l, { get status() {
						return c(i).status;
					} });
					var d = s(l, 2);
					W(d, {
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
					W(M, { name: "star" }), w(S);
					var N = s(S, 2), P = t(N);
					W(P, {
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
			q(G, (e) => {
				c(n).expanded && e(K);
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
			})), h("click", z, (e) => k(e, c(n))), h("keydown", z, (e) => A(e, c(n))), a("dragstart", H, (e) => v(e, {
				kind: "project",
				id: c(n).id,
				projectId: ""
			})), a("dragend", H, D), F(e, i);
		}), F(n, o);
	};
	q(B, (e) => {
		i.loading ? e(V) : i.error ? e(H, 1) : i.projects.length === 0 ? e(U, 2) : e(G, -1);
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
	q(c, (e) => {
		n.item && e(u);
	});
	var d = s(c, 2);
	W(d, {
		name: "clock-3",
		className: "scheduler-nav-icon"
	});
	var f = s(d, 4);
	W(f, {
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
	Y(() => {
		n.identity !== c(d) && (x(d, n.identity, !0), x(i, !1), x(a, ""));
	}), H(() => {
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
	W(A, {
		name: "chevrons-up-down",
		className: "select-icon"
	}), w(k);
	var M = s(k), N = t(M);
	W(N, {
		name: "loader-circle",
		className: "select-icon"
	}), w(M), w(v);
	var P = s(v, 2), L = (e) => {
		var o = Fe(), l = s(t(o), 2);
		J(l, 17, () => n.workspaces, (e) => e.id, (e, i) => {
			var o = Pe(), l = t(o), u = t(l);
			w(l);
			var d = s(l, 2), f = t(d), m = t(f, !0);
			w(f);
			var _ = s(f), v = t(_, !0);
			w(_), w(d);
			var y = s(d, 2), b = (e) => {
				W(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			q(y, (e) => {
				c(i).id === n.activeWorkspaceId && e(b);
			}), w(o), g((e) => {
				I(o, "aria-selected", c(i).id === n.activeWorkspaceId), I(o, "data-workspace-id", c(i).id), o.disabled = e, I(u, "src", c(i).iconSrc), r(m, c(i).name || c(i).id), r(v, c(i).path);
			}, [() => !!c(a)]), h("click", o, () => p(c(i).id)), F(e, o);
		});
		var u = s(l, 2), d = t(u), f = t(d);
		W(f, { name: "plus" }), S(), w(d), w(u), w(o), h("click", d, () => {
			x(i, !1), n.onAdd();
		}), F(e, o);
	};
	q(P, (e) => {
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
var Re = P("<button id=\"doctorButton\" type=\"button\" title=\"Workspace problems\"><!><span> </span></button>"), ze = P("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><!><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div class=\"tty-panel\"><!><div id=\"ttyLog\" class=\"tty-log\" data-component-owner=\"event-timeline\"><!></div><div id=\"ttyComposer\" class=\"tty-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div> <!>", 1);
function Be(n, i) {
	C(i, !0);
	let a = o(y(i.channel.current())), d = o(0), f = o(!1);
	H(() => {
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
	}), Y(() => {
		document.body.classList.toggle("mobile-sidebar-open", c(a).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", c(a).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", c(a).mobile.immersive);
	}), Y(() => {
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
			W(o, { get name() {
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
	q(O, (e) => {
		(c(a).doctor.summary.errors + c(a).doctor.summary.warnings > 0 || c(a).doctor.error) && e(k);
	});
	var A = s(O), M = t(A);
	W(M, { name: "settings" }), w(A), w(S);
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
	var B = s(z, 2), V = t(B), U = t(V), G = t(U);
	W(G, { name: "menu" }), w(U), w(V);
	var K = s(V, 2), J = t(K), te = t(J), ne = s(te, 2);
	w(J), w(K);
	var re = s(K, 2), ie = t(re), ae = (t) => {
		var n = e(), r = b(n);
		ee(r, () => i.details), F(t, n);
	};
	q(ie, (e) => {
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
		ee(r, () => i.agentHeader), F(t, n);
	};
	q(ue, (e) => {
		i.agentHeader && e(de);
	});
	var fe = s(ue), pe = t(fe), me = (t) => {
		var n = e(), r = b(n);
		ee(r, () => i.timeline), F(t, n);
	};
	q(pe, (e) => {
		i.timeline && e(me);
	}), w(fe);
	var he = s(fe), ge = t(he), _e = (t) => {
		var n = e(), r = b(n);
		ee(r, () => i.composer), F(t, n);
	};
	q(ge, (e) => {
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
	q(ye, (e) => {
		c(f) && e(xe);
	}), g(() => {
		r(D, c(a).version), I(U, "aria-expanded", c(a).mobile.sidebarOpen), I(te, "aria-selected", c(a).mobile.view === "details"), I(ne, "aria-selected", c(a).mobile.view === "chat");
	}), h("click", A, () => {
		c(a).onMobileSidebar(!1), c(a).onOpenSettings();
	}), h("click", U, () => c(a).onMobileSidebar(!0)), h("click", te, () => c(a).onMobileView("details")), h("click", ne, () => c(a).onMobileView("chat")), F(n, p), l();
}
p(["click"]);
//#endregion
//#region src/components/AgentPanelHeader.svelte
var Ve = P("<span class=\"agent-header-queued\"> </span>"), He = P("<span class=\"agent-header-model\"> </span>"), Ue = P("<span class=\"agent-header-turn\"> </span>"), We = P("<header class=\"agent-panel-header\" data-component-owner=\"agent-panel-header\"><div class=\"agent-header-left\"><span class=\"agent-status-dot\" aria-hidden=\"true\"></span> <span class=\"agent-header-name\"> </span> <span class=\"agent-header-state\"> </span> <!></div> <div class=\"agent-header-right\"><!> <!></div></header>");
function Ge(e, n) {
	C(n, !0);
	let i = o(y(n.channel.current())), a = o(y(Date.now()));
	H(() => n.channel.subscribe((e) => {
		x(i, e, !0);
	}));
	let d = u(() => c(i).resourceId ? c(i).submitting ? "submitting" : c(i).status?.state || "loading" : "empty"), f = u(() => c(d) === "submitting" ? "Submitting" : c(d) === "working" ? "Working" : c(d) === "idle" ? "Idle" : c(d) === "attention_required" ? "Attention required" : c(d) === "unavailable" ? "Unavailable" : c(d) === "archived" ? "Archived" : c(d) === "loading" ? "Loading" : "No resource selected"), p = u(() => c(i).status?.waitingMessages?.length || 0), m = u(() => Date.parse(c(i).turnStartedAt || "")), h = u(() => c(d) === "working" && Number.isFinite(c(m)));
	Y(() => {
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
	q(A, (e) => {
		c(p) > 0 && e(j);
	}), w(T);
	var M = s(T, 2), N = t(M), P = (e) => {
		var n = He(), a = t(n, !0);
		w(n), g(() => r(a, c(i).modelSummary)), F(e, n);
	};
	q(N, (e) => {
		c(i).modelSummary && e(P);
	});
	var L = s(N, 2), R = (e) => {
		var n = Ue(), i = t(n, !0);
		w(n), g(() => r(i, c(b))), F(e, n);
	};
	q(L, (e) => {
		c(b) && e(R);
	}), w(M), w(S), g(() => {
		I(S, "data-state", c(d)), r(D, c(i).agentName), r(k, c(f));
	}), F(e, S), l();
}
//#endregion
//#region src/components/AgentBindingSelector.svelte
var Ke = P("<button type=\"button\" class=\"agent-binding-option\" role=\"option\"><span class=\"agent-binding-option-primary\"> </span> <span class=\"agent-binding-option-secondary\"> </span> <!></button>"), qe = P("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Profiles\"><div class=\"agent-binding-group-title\">Profiles</div> <!></div>"), Je = P("<div class=\"agent-binding-divider\"></div>"), Ye = P("<!> <div class=\"agent-binding-group\" role=\"group\" aria-label=\"Agents\"><div class=\"agent-binding-group-title\">Agents</div> <!></div>", 1), Xe = P("<div class=\"agent-binding-menu\" role=\"listbox\" tabindex=\"-1\"><!> <!></div>"), Ze = P("<span class=\"agent-binding\" data-component-owner=\"agent-binding-selector\"><button type=\"button\" class=\"agent-binding-button\" aria-haspopup=\"listbox\"><span class=\"agent-binding-label\"> </span> <!></button> <!></span>");
function Qe(e, n) {
	C(n, !0);
	let i = N(n, "disabled", 3, !1), a = N(n, "ariaLabel", 3, "Agent binding"), f = N(n, "openUp", 3, !0), p = u(j), m = u(M), _ = u(() => P(n.value)), v = u(() => [...c(p), ...c(m)].find((e) => P(e.value) === c(_))?.label || n.value.name || "Unavailable"), y = o(!1), S = o(void 0), T = o(void 0);
	Y(() => {
		if (!c(y) || !c(T)) return;
		c(p), c(m), D(), O();
		let e = c(T).querySelector("[aria-selected=\"true\"]") ?? c(T).querySelector(".agent-binding-option");
		d().then(() => e?.focus());
	}), H(() => {
		let e = (e) => {
			c(y) && e.target instanceof Node && !c(S)?.contains(e.target) && x(y, !1);
		}, t = () => {
			c(y) && D();
		};
		return document.addEventListener("mousedown", e), window.addEventListener("resize", t), () => {
			document.removeEventListener("mousedown", e), window.removeEventListener("resize", t);
		};
	});
	function D() {
		if (!c(S) || !c(T)) return;
		let e = c(S).getBoundingClientRect(), t = f() ? e.top - 14 : window.innerHeight - e.bottom - 14;
		c(T).style.maxHeight = `${Math.max(120, Math.floor(t))}px`;
	}
	function O() {
		if (!c(T)) return;
		c(T).style.removeProperty("--binding-primary-width"), c(T).style.removeProperty("--binding-secondary-width");
		let e = 0, t = 0;
		c(T).querySelectorAll(".agent-binding-option-primary").forEach((t) => {
			e = Math.max(e, t.getBoundingClientRect().width);
		}), c(T).querySelectorAll(".agent-binding-option-secondary").forEach((e) => {
			t = Math.max(t, e.getBoundingClientRect().width);
		}), e > 0 && c(T).style.setProperty("--binding-primary-width", `${Math.ceil(e)}px`), t > 0 && c(T).style.setProperty("--binding-secondary-width", `${Math.ceil(t)}px`);
	}
	function k(e) {
		return e.trim().toLowerCase();
	}
	function A(e) {
		return n.agents.find((t) => k(t.id) === k(e))?.label || e || "Unavailable";
	}
	function j() {
		let e = n.profiles.map((e) => ({
			value: {
				kind: "profile",
				name: e.key
			},
			label: `${e.key} (current: ${A(e.agentName || "")})`,
			primary: e.key,
			secondary: A(e.agentName || "")
		}));
		return n.value.kind === "profile" && !n.profiles.some((e) => k(e.key) === k(n.value.name)) && e.unshift({
			value: n.value,
			label: `${n.value.name} (missing profile)`,
			primary: n.value.name,
			secondary: "missing profile"
		}), e;
	}
	function M() {
		let e = n.agents.map((e) => {
			let t = n.profiles.filter((t) => k(t.agentName || "") === k(e.id)).map((e) => e.key);
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
		return n.value.kind === "agent" && !n.agents.some((e) => k(e.id) === k(n.value.name)) && e.unshift({
			value: n.value,
			label: `${n.value.name} (missing agent)`,
			primary: n.value.name,
			secondary: "missing agent"
		}), e;
	}
	function P(e) {
		return `${e.kind}:${encodeURIComponent(e.name)}`;
	}
	function L(e) {
		x(y, !1), P(e.value) !== c(_) && n.onSelect(e.value);
	}
	function R(e) {
		e.key === "Escape" && (e.stopPropagation(), x(y, !1));
	}
	var z = Ze(), B = t(z), V = t(B), U = t(V, !0);
	w(V);
	var G = s(V, 2);
	W(G, {
		name: "chevrons-up-down",
		className: "agent-binding-icon"
	}), w(B);
	var K = s(B, 2), ee = (e) => {
		var n = Xe(), i = t(n), o = (e) => {
			var n = qe(), i = s(t(n), 2);
			J(i, 17, () => c(p), (e) => P(e.value), (e, n) => {
				var i = Ke(), a = t(i), o = t(a, !0);
				w(a);
				var l = s(a, 2), d = t(l, !0);
				w(l);
				var f = s(l, 2);
				{
					let e = u(() => P(c(n).value) === c(_) ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden");
					W(f, {
						name: "check",
						get className() {
							return c(e);
						}
					});
				}
				w(i), g((e, t) => {
					I(i, "aria-selected", e), I(i, "data-binding", t), r(o, c(n).primary), r(d, c(n).secondary);
				}, [() => P(c(n).value) === c(_), () => P(c(n).value)]), h("click", i, () => L(c(n))), F(e, i);
			}), w(n), F(e, n);
		};
		q(i, (e) => {
			c(p).length && e(o);
		});
		var l = s(i, 2), d = (e) => {
			var n = Ye(), i = b(n), a = (e) => {
				var t = Je();
				F(e, t);
			};
			q(i, (e) => {
				c(p).length && e(a);
			});
			var o = s(i, 2), l = s(t(o), 2);
			J(l, 17, () => c(m), (e) => P(e.value), (e, n) => {
				var i = Ke(), a = t(i), o = t(a, !0);
				w(a);
				var l = s(a, 2), d = t(l, !0);
				w(l);
				var f = s(l, 2);
				{
					let e = u(() => P(c(n).value) === c(_) ? "agent-binding-check" : "agent-binding-check agent-binding-check-hidden");
					W(f, {
						name: "check",
						get className() {
							return c(e);
						}
					});
				}
				w(i), g((e, t) => {
					I(i, "aria-selected", e), I(i, "data-binding", t), r(o, c(n).primary), r(d, c(n).secondary);
				}, [() => P(c(n).value) === c(_), () => P(c(n).value)]), h("click", i, () => L(c(n))), F(e, i);
			}), w(o), F(e, n);
		};
		q(l, (e) => {
			c(m).length && e(d);
		}), w(n), E(n, (e) => x(T, e), () => c(T)), g(() => I(n, "aria-label", a())), h("keydown", n, R), F(e, n);
	};
	q(K, (e) => {
		c(y) && e(ee);
	}), w(z), E(z, (e) => x(S, e), () => c(S)), g(() => {
		I(z, "data-placement", f() ? "up" : "down"), B.disabled = i(), I(B, "aria-expanded", c(y)), I(B, "aria-label", a()), r(U, c(v));
	}), h("click", B, () => {
		x(y, !c(y));
	}), F(e, z), l();
}
p(["click", "keydown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var $e = P("<div class=\"tty-turn-stop-notice\" role=\"status\"><span> </span> <button type=\"button\" class=\"tty-turn-stop-dismiss\" aria-label=\"Dismiss turn stop notice\">Dismiss</button></div>"), et = P("<div class=\"tty-message-item\"><span class=\"tty-message-text\"> </span> <span class=\"tty-message-mode\"> </span> <button type=\"button\" class=\"tty-message-steer\"><!> <span>Insert now</span></button></div>"), tt = P("<div class=\"tty-message-queue-error\" role=\"alert\"> </div>"), nt = P("<section class=\"tty-message-queue\" aria-label=\"Waiting messages\"><div class=\"tty-message-queue-header\"><span>Waiting messages</span><span class=\"tty-message-count\"> </span></div> <div class=\"tty-message-list\"></div> <!></section>"), rt = P("<div class=\"tty-send-feedback\" data-send-state=\"submitting\" role=\"status\" aria-live=\"polite\"><!> <span class=\"tty-send-feedback-content\"><strong>Submitting</strong><span class=\"tty-send-feedback-text\"> </span></span></div>"), it = P("<button type=\"button\" id=\"agentEndTurnButton\" title=\"End current turn\" aria-label=\"End current turn\"><span class=\"tty-composer-icon tty-composer-icon-idle\"><!></span><span class=\"tty-composer-icon tty-composer-icon-busy\"><!></span></button>"), at = P("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), ot = P("<!> <!> <!> <form id=\"ttyForm\" class=\"tty-input\"><textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <div class=\"tty-composer-bar\"><button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button> <div class=\"tty-composer-options\"><span class=\"tty-agent-binding\"><!></span> <!> <button type=\"submit\"><span class=\"tty-composer-icon tty-composer-icon-idle\"><!></span><span class=\"tty-composer-icon tty-composer-icon-busy\"><!></span></button></div></div></form> <!>", 1);
function st(e, n) {
	C(n, !0);
	let i = n.channel.current(), f = o(y(i)), p = o(y(i.identity)), m = o(y(i.draftResetVersion)), _ = o(y(i.draft)), v = o(!1), T = o(""), D = o(""), O = o(""), A = o(!1), M = o(void 0), N = u(() => !!c(f).unavailableReason || c(v) || c(f).sending);
	H(() => n.channel.subscribe((e) => {
		c(f), x(f, e, !0), e.identity === c(p) ? e.draftResetVersion !== c(m) && (x(m, e.draftResetVersion, !0), x(_, e.draft, !0), x(D, "")) : (x(p, e.identity, !0), x(m, e.draftResetVersion, !0), x(_, e.draft, !0), x(v, !1), x(T, ""), x(D, ""), x(O, ""), x(A, !1)), queueMicrotask(e.onIconsChanged);
	})), Y(() => {
		c(_), d().then(U);
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
	function U() {
		if (!c(M)) return;
		c(M).style.height = "auto";
		let e = Math.min(c(M).scrollHeight, 160);
		c(M).style.height = `${e}px`, c(M).style.overflowY = c(M).scrollHeight > 160 ? "auto" : "hidden";
	}
	function G(e) {
		c(f).onSaveAgentBinding(e);
	}
	var K = ot(), ee = b(K), te = (e) => {
		var n = $e(), i = t(n), a = t(i, !0);
		w(i);
		var o = s(i, 2);
		w(n), g(() => r(a, c(f).stopNotice)), h("click", o, function(...e) {
			c(f).onDismissStopNotice?.apply(this, e);
		}), F(e, n);
	};
	q(ee, (e) => {
		c(f).stopNotice && e(te);
	});
	var ne = s(ee, 2), re = (e) => {
		var n = nt(), i = t(n), a = s(t(i)), o = t(a, !0);
		w(a), w(i);
		var l = s(i, 2);
		J(l, 21, () => c(f).waitingMessages, (e) => e.messageId, (e, n) => {
			var i = et(), a = t(i), o = t(a, !0);
			w(a);
			var l = s(a, 2), u = t(l, !0);
			w(l);
			var d = s(l, 2), p = t(d), m = (e) => {
				W(e, { name: "loader-circle" });
			}, _ = (e) => {
				W(e, { name: "corner-up-left" });
			};
			q(p, (e) => {
				c(f).steeringMessageId === c(n).messageId ? e(m) : e(_, -1);
			}), S(2), w(d), w(i), g((e) => {
				I(i, "data-message-id", c(n).messageId), I(a, "title", c(n).text), r(o, c(n).text), r(u, c(n).actualMode || c(n).requestedMode), d.disabled = e, I(d, "title", c(f).canSteerWaiting ? "Insert this waiting message into the current turn" : "Available when the current turn supports steer"), I(d, "aria-label", `Insert waiting message into current turn: ${c(n).text}`);
			}, [() => !c(f).canSteerWaiting || !!c(f).steeringMessageId]), h("click", d, () => z(c(n).messageId)), F(e, i);
		}), w(l);
		var u = s(l, 2), d = (e) => {
			var n = tt(), i = t(n, !0);
			w(n), g(() => r(i, c(O))), F(e, n);
		};
		q(u, (e) => {
			c(O) && e(d);
		}), w(n), g(() => r(o, c(f).waitingMessages.length)), F(e, n);
	};
	q(ne, (e) => {
		c(f).waitingMessages.length && e(re);
	});
	var ie = s(ne, 2), ae = (e) => {
		var n = rt(), i = t(n);
		W(i, { name: "loader-circle" });
		var a = s(i, 2), o = s(t(a)), l = t(o, !0);
		w(o), w(a), w(n), g(() => r(l, c(T))), F(e, n);
	};
	q(ie, (e) => {
		c(T) && e(ae);
	});
	var oe = s(ie, 2), se = t(oe);
	V(se), E(se, (e) => x(M, e), () => c(M));
	var ce = s(se, 2), le = t(ce), ue = t(le);
	W(ue, { name: "plus" }), w(le);
	var de = s(le, 2), fe = t(de), pe = t(fe);
	{
		let e = u(() => c(N) || c(f).bindingSaving);
		Qe(pe, {
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
			onSelect: G
		});
	}
	w(fe);
	var me = s(fe, 2), he = (e) => {
		var n = it();
		let r;
		var i = t(n), a = t(i);
		W(a, { name: "pause" }), w(i);
		var o = s(i), l = t(o);
		W(l, { name: "loader-circle" }), w(o), w(n), g(() => {
			r = j(n, 1, "tty-composer-action tty-end-turn-button", null, r, { busy: c(f).endingTurn }), n.disabled = c(f).endingTurn;
		}), h("click", n, function(...e) {
			c(f).onEndTurn?.apply(this, e);
		}), F(e, n);
	};
	q(me, (e) => {
		c(f).canEndTurn && e(he);
	});
	var ge = s(me, 2);
	let _e;
	var ve = t(ge), ye = t(ve);
	W(ye, { name: "send" }), w(ve);
	var be = s(ve), xe = t(be);
	W(xe, { name: "loader-circle" }), w(be), w(ge), w(de), w(ce), w(oe);
	var Se = s(oe, 2), Ce = (e) => {
		var n = at(), i = t(n), a = t(i, !0);
		w(i);
		var o = s(i);
		w(n), g(() => {
			r(a, c(D)), o.disabled = c(v);
		}), h("click", o, () => R()), F(e, n);
	};
	q(Se, (e) => {
		c(D) && e(Ce);
	}), g((e) => {
		I(se, "data-agent-draft-key", c(f).draftKey), I(se, "placeholder", c(f).unavailableReason || "Message this resource"), se.disabled = c(N), k(se, c(_)), le.disabled = e, _e = j(ge, 1, "tty-send-button", null, _e, { busy: c(v) }), I(ge, "title", c(v) ? "Sending..." : c(f).unavailableReason || "Send input"), I(ge, "aria-label", c(v) ? "Sending..." : c(f).unavailableReason || "Send input"), ge.disabled = c(N);
	}, [() => !!c(f).unavailableReason]), a("submit", oe, R), h("input", se, (e) => L(e.currentTarget.value)), h("keydown", se, B), h("click", le, function(...e) {
		c(f).onOpenUpload?.apply(this, e);
	}), F(e, K), l();
}
p([
	"click",
	"input",
	"keydown"
]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var ct = P("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function lt(e, n) {
	C(n, !0);
	let r = N(n, "draft", 7);
	var i = ct(), a = t(i);
	V(a);
	var o = s(a, 2);
	O(o), w(i), g(() => {
		k(a, r().description), k(o, r().slug);
	}), h("input", a, (e) => r().description = e.currentTarget.value), h("input", o, (e) => r().slug = e.currentTarget.value), F(e, i), l();
}
p(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var ut = P("<button type=\"button\" class=\"secondary compact\"> </button>"), dt = P("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), ft = P("<p class=\"create-task-preview-hint\">Updating preview...</p>"), pt = P("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), mt = P("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), ht = P("<small> </small>"), gt = P("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), _t = P("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), vt = P("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), yt = P("<!> <!> <!>", 1), bt = P("<p class=\"create-task-blank-detail\"> </p>"), xt = P("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), St = P("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), Ct = P("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function wt(e, n) {
	C(n, !0);
	let i = N(n, "draft", 7), a = o(y(i().editedMarkdown ?? "")), d = null, f = u(() => !!n.preview && c(a) !== n.preview?.markdown);
	Y(() => {
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
	var _ = Ct(), v = t(_), S = s(t(v), 2), T = (e) => {
		var i = ut(), a = t(i, !0);
		w(i), g(() => {
			i.disabled = n.previewing || n.submitting, r(a, n.previewing ? "Rendering..." : "Refresh");
		}), h("click", i, function(...e) {
			n.onRefresh?.apply(this, e);
		}), F(e, i);
	};
	q(S, (e) => {
		n.selectedTemplate && e(T);
	}), w(v);
	var E = s(v, 2), D = (e) => {
		var o = yt(), l = b(o), u = (e) => {
			var i = dt(), a = t(i, !0);
			w(i), g(() => r(a, n.previewError)), F(e, i);
		};
		q(l, (e) => {
			n.previewError && e(u);
		});
		var d = s(l, 2), _ = (e) => {
			var t = ft();
			F(e, t);
		};
		q(d, (e) => {
			!n.previewError && n.stale && n.preview && e(_);
		});
		var v = s(d, 2), y = (e) => {
			var o = gt(), l = t(o), u = t(l, !0);
			w(l);
			var d = s(l, 2);
			V(d);
			var _ = s(d, 2), v = (e) => {
				var n = pt(), r = s(t(n), 2);
				w(n), h("click", r, m), F(e, n);
			}, y = (e) => {
				var t = mt();
				F(e, t);
			};
			q(_, (e) => {
				c(f) ? e(v) : e(y, -1);
			});
			var b = s(_, 2), x = (e) => {
				var i = ht(), a = t(i);
				w(i), g(() => r(a, `Slug: ${n.preview.slug ?? ""}`)), F(e, i);
			};
			q(b, (e) => {
				n.preview.slug && e(x);
			});
			var S = s(b, 2), C = (e) => {
				var a = ht(), o = t(a);
				w(a), g(() => r(o, `Template ${i().templateName ?? ""} · ${n.templateDigest ?? ""}`)), F(e, a);
			};
			q(S, (e) => {
				n.templateDigest && e(C);
			}), w(o), g(() => {
				r(u, n.preview.title), k(d, c(a));
			}), h("input", d, (e) => p(e.currentTarget.value)), F(e, o);
		}, x = (e) => {
			var t = _t();
			F(e, t);
		}, S = (e) => {
			var t = vt();
			F(e, t);
		};
		q(v, (e) => {
			n.preview ? e(y) : n.previewing ? e(x, 1) : n.previewError || e(S, 2);
		}), F(e, o);
	}, O = (e) => {
		var n = St(), a = t(n), o = t(a, !0);
		w(a);
		var l = s(a, 2), d = (e) => {
			var n = bt(), a = t(n, !0);
			w(n), g(() => r(a, i().detail)), F(e, n);
		}, f = u(() => i().detail.trim()), p = (e) => {
			var t = xt();
			F(e, t);
		};
		q(l, (e) => {
			c(f) ? e(d) : e(p, -1);
		});
		var m = s(l, 2), h = (e) => {
			var n = ht(), a = t(n);
			w(n), g((e) => r(a, `Slug: ${e ?? ""}`), [() => i().slug.trim()]), F(e, n);
		}, _ = u(() => i().slug.trim());
		q(m, (e) => {
			c(_) && e(h);
		}), w(n), g((e) => r(o, e), [() => i().title.trim() || "Untitled task"]), F(e, n);
	};
	q(E, (e) => {
		n.selectedTemplate ? e(D) : e(O, -1);
	}), w(_), F(e, _), l();
}
p(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var Tt = P("<input type=\"checkbox\"/><span> </span>", 1), Et = P("<span> </span>"), Dt = P("<textarea></textarea>"), Ot = P("<option> </option>"), kt = P("<select><option>Select...</option><!></select>"), At = P("<input/>"), jt = P("<small> </small>"), Mt = P("<label><!> <!> <!> <!> <!></label>"), Nt = P("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function Pt(e, n) {
	C(n, !0);
	function i(e, t) {
		let r = t.currentTarget;
		n.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var a = Nt();
	J(a, 21, () => n.fields, (e) => e.name, (e, a) => {
		var o = Mt();
		let l;
		var u = t(o), d = (e) => {
			var o = Tt(), l = b(o);
			O(l);
			var u = s(l), d = t(u);
			w(u), g(() => {
				G(l, n.values[c(a).name] === !0), r(d, `${c(a).label ?? ""}${c(a).required ? " *" : ""}`);
			}), h("change", l, (e) => i(c(a), e)), F(e, o);
		}, f = (e) => {
			var n = Et(), i = t(n);
			w(n), g(() => r(i, `${c(a).label ?? ""}${c(a).required ? " *" : ""}`)), F(e, n);
		};
		q(u, (e) => {
			c(a).type === "boolean" ? e(d) : e(f, -1);
		});
		var p = s(u, 2), m = (e) => {
			var t = Dt();
			V(t), g((e) => {
				t.required = c(a).required, I(t, "placeholder", c(a).placeholder || ""), k(t, e);
			}, [() => String(n.values[c(a).name] ?? "")]), h("input", t, (e) => i(c(a), e)), F(e, t);
		};
		q(p, (e) => {
			c(a).type === "textarea" && e(m);
		});
		var v = s(p, 2), y = (e) => {
			var o = kt(), l = t(o);
			l.value = l.__value = "";
			var u = s(l);
			J(u, 17, () => c(a).options || [], _, (e, n) => {
				var i = Ot(), a = t(i, !0);
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
		q(v, (e) => {
			c(a).type === "select" && e(y);
		});
		var x = s(v, 2), S = (e) => {
			var t = At();
			O(t), g((e) => {
				t.required = c(a).required, I(t, "placeholder", c(a).placeholder || ""), k(t, e);
			}, [() => String(n.values[c(a).name] ?? "")]), h("input", t, (e) => i(c(a), e)), F(e, t);
		};
		q(x, (e) => {
			c(a).type === "text" && e(S);
		});
		var C = s(x, 2), T = (e) => {
			var n = jt(), i = t(n, !0);
			w(n), g(() => r(i, c(a).description)), F(e, n);
		};
		q(C, (e) => {
			c(a).description && e(T);
		}), w(o), g(() => l = j(o, 1, "", null, l, { "template-boolean": c(a).type === "boolean" })), F(e, o);
	}), w(a), g(() => I(a, "aria-label", n.label)), F(e, a), l();
}
p(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var Ft = P("<small> </small>"), It = P("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), Lt = P("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function Rt(e, n) {
	C(n, !0);
	function i(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var a = Lt(), o = s(t(a), 2), u = t(o);
	let d;
	var f = s(t(u), 4), p = t(f);
	W(p, { name: "check" }), w(f), w(u);
	var m = s(u, 2);
	J(m, 17, () => n.templates, (e) => e.name, (e, a) => {
		var o = It();
		let l;
		var u = t(o), d = t(u, !0);
		w(u);
		var f = s(u, 2), p = (e) => {
			var n = Ft(), i = t(n, !0);
			w(n), g(() => r(i, c(a).description)), F(e, n);
		};
		q(f, (e) => {
			c(a).description && e(p);
		});
		var m = s(f, 2), _ = t(m);
		W(_, { name: "check" }), w(m), w(o), g((e) => {
			I(o, "aria-selected", n.selectedName === c(a).name), l = j(o, 1, "template-card", null, l, { selected: n.selectedName === c(a).name }), o.disabled = !c(a).valid || n.disabled, r(d, e);
		}, [() => i(c(a))]), h("click", o, () => n.onSelect(c(a).name)), F(e, o);
	}), w(o), w(a), g(() => {
		I(u, "aria-selected", n.selectedName === ""), d = j(u, 1, "template-card", null, d, { selected: n.selectedName === "" }), u.disabled = n.disabled;
	}), h("click", u, () => n.onSelect("")), F(e, a), l();
}
p(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var zt = P("<small>(generated by template)</small>"), Bt = P("<small class=\"create-required\">*</small>"), Vt = P("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), Ht = P("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), Ut = P("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), Wt = P("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function Gt(e, n) {
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
	function b(e) {
		if (n.model.submitting || e === r().templateName || (Object.values(r().templateFields).some((e) => !!e) || r().titleOverride || r().editedMarkdown != null) && !n.model.onConfirmTemplateSwitch()) return;
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
	var D = Wt(), A = t(D), j = t(A), M = (e) => {
		Rt(e, {
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
	q(j, (e) => {
		n.model.templates.length && e(M);
	});
	var P = s(j, 2), L = s(t(P), 2), z = t(L), B = t(z), H = s(t(B)), U = (e) => {
		var t = zt();
		F(e, t);
	}, W = (e) => {
		var t = Bt();
		F(e, t);
	};
	q(H, (e) => {
		c(a)?.taskTitle && !r().titleOverride ? e(U) : e(W, -1);
	}), w(B);
	var G = s(B, 2), K = t(G);
	O(K);
	var J = s(K, 2), ee = (e) => {
		var t = Vt();
		h("click", t, T), F(e, t);
	};
	q(J, (e) => {
		c(a)?.taskTitle && r().titleOverride && e(ee);
	}), w(G), w(z);
	var Y = s(z, 2), te = s(t(Y), 2), ne = s(t(te), 2);
	O(ne), w(te), w(Y), w(L), w(P);
	var re = s(P, 2), ie = (e) => {
		var n = Ht(), i = s(t(n), 2), a = (e) => {
			Pt(e, {
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
		q(i, (e) => {
			c(f).length && e(a);
		});
		var o = s(i, 2), l = (e) => {
			Pt(e, {
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
		q(o, (e) => {
			c(p).length && e(l);
		}), w(n), F(e, n);
	}, ae = (e) => {
		var n = Ut(), i = s(t(n), 2);
		V(i), w(n), g(() => k(i, r().detail)), h("input", i, (e) => r().detail = e.currentTarget.value), F(e, n);
	};
	q(re, (e) => {
		c(a) ? e(ie) : e(ae, -1);
	}), w(A), wt(s(A, 2), {
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
		K.required = !c(a)?.taskTitle, k(K, c(a)?.taskTitle ? c(d) : r().title), I(K, "placeholder", c(a)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), k(ne, r().slug);
	}), h("input", K, (e) => S(e.currentTarget.value)), h("input", ne, (e) => {
		r().slug = e.currentTarget.value, y();
	}), F(e, D), l();
}
p(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var Kt = P("<span> </span>"), qt = P("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function Jt(i, d) {
	C(d, !0);
	let f = o(y(d.channel.current())), p = o(y(S(c(f).draft))), m = o(""), _ = o(void 0), v = u(() => c(p).type === "task");
	H(() => d.channel.subscribe((e) => {
		x(f, e, !0), e.identity !== c(m) && (x(m, e.identity, !0), x(p, S(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), H(() => {
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
		var o = qt(), l = t(o), u = s(l, 2);
		let d;
		var m = t(u), y = t(m), S = t(y), C = t(S, !0);
		w(S);
		var D = s(S, 2), O = (e) => {
			var n = Kt(), i = t(n, !0);
			w(n), g(() => r(i, c(p).projectId)), F(e, n);
		};
		q(D, (e) => {
			c(v) && e(O);
		}), w(y);
		var k = s(y, 2), A = t(k);
		W(A, { name: "x" }), w(k), w(m);
		var M = s(m, 2), N = t(M);
		n(N, () => c(f).identity, (t) => {
			var n = e(), r = b(n), i = (e) => {
				Gt(e, {
					get draft() {
						return c(p);
					},
					get model() {
						return c(f);
					}
				});
			}, a = (e) => {
				lt(e, { get draft() {
					return c(p);
				} });
			};
			q(r, (e) => {
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
	q(O, (e) => {
		c(f).open && e(k);
	}), F(i, D), l();
}
p(["click"]);
//#endregion
//#region src/api/client.ts
var Yt = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, Xt = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, Zt = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new Xt(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new Xt(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new Xt(e.scope));
		this.active.clear();
	}
}, Qt = class {
	requests = new Zt();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: en(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: en(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof Xt) ? new Xt(n) : e;
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
			let n = $t(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new Yt(e.status, r, n);
		}
		return t;
	}
};
function $t(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function en(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
//#endregion
//#region src/components/DiffModal.svelte
var tn = P("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), nn = P("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), rn = P("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), an = P("<div class=\"diff-viewer\"></div>"), on = P("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function sn(n, i) {
	C(i, !0);
	let a = o(null), f = o(!1), p = o(""), m = o(void 0), _ = u(() => `detail-diff:${i.workspaceId}:${i.resourceId}`);
	Y(() => {
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
	}), Y(() => {
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
		var n = on(), o = t(n), l = s(o, 2), d = t(l), _ = t(d), v = t(_), y = t(v, !0);
		w(v);
		var b = s(v), C = t(b);
		w(b), w(_);
		var T = s(_), D = t(T);
		W(D, { name: "x" }), w(T), w(d);
		var O = s(d, 2), k = (e) => {
			var n = tn(), a = t(n);
			W(a, { name: "loader-circle" });
			var o = s(a, 2), c = t(o, !0);
			w(o), w(n), g(() => r(c, i.repo.worktreePath || "")), F(e, n);
		}, A = (e) => {
			var n = nn(), i = t(n);
			W(i, { name: "triangle-alert" });
			var a = s(i, 2), o = t(a, !0);
			w(a), w(n), g(() => r(o, c(p))), F(e, n);
		}, j = (e) => {
			var n = rn(), r = t(n);
			W(r, { name: "check-circle-2" }), S(2), w(n), F(e, n);
		}, M = u(() => !c(a)?.hasChanges || !c(a).diff?.trim()), N = (e) => {
			var t = an();
			E(t, (e) => x(m, e), () => c(m)), F(e, t);
		};
		q(O, (e) => {
			c(f) ? e(k) : c(p) ? e(A, 1) : c(M) ? e(j, 2) : e(N, -1);
		}), w(l), w(n), g(() => {
			r(y, c(a)?.branch || i.repo.branch || i.repo.name || "Diff"), r(C, `${(i.repo.worktreePath || "") ?? ""}${i.repo.targetBranch || i.repo.baseBranch ? ` · base ${i.repo.targetBranch || i.repo.baseBranch}` : ""}`);
		}), h("click", o, function(...e) {
			i.onClose?.apply(this, e);
		}), h("click", T, function(...e) {
			i.onClose?.apply(this, e);
		}), F(e, n);
	};
	q(T, (e) => {
		i.repo && e(D);
	}), F(n, y), l();
}
p(["click"]);
//#endregion
//#region src/controllers/route-controller.ts
function cn(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function ln(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: cn(t[1]),
		resourceId: t[2] === "r" ? cn(t[3]) : "workspace"
	} : {};
}
function un(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function dn(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = un(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => ln(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/components/markdown.ts
var fn = "[A-Za-z0-9][A-Za-z0-9._-]{0,159}", pn = RegExp(`^\\[\\[(${fn})\\]\\]`), mn = null, hn = null;
function gn(e, t) {
	if (!window.marked || !window.DOMPurify) return `<pre>${En(e)}</pre>`;
	let n = bn();
	return n ? window.DOMPurify.sanitize(n.parse(String(e ?? ""), {
		breaks: !0,
		gfm: !0,
		forgeMarkdownContext: t
	})) : (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? ""))));
}
function _n(e, t) {
	if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !(e.target instanceof Element)) return;
	let n = e.currentTarget;
	if (!(n instanceof Node)) return;
	let r = e.target.closest("a[data-forge-resource-id]");
	if (r && n.contains(r) && (!r.target || r.target === "_self")) {
		let n = r.dataset.forgeResourceId || "";
		if (Tn(n) && t.resolveResourceTitle(n)) {
			e.preventDefault(), t.onNavigate(n);
			return;
		}
	}
	if (!t.onOpenFile) return;
	let i = e.target.closest("a[href^='/']");
	if (!i || !n.contains(i) || i.target && i.target !== "_self") return;
	let a = vn(i.getAttribute("href") || "");
	a != null && (e.preventDefault(), t.onOpenFile(a));
}
function vn(e) {
	if (!e.startsWith("/") || e.startsWith("//") || e.startsWith("/w/") || e.startsWith("/api/")) return null;
	let t = e.slice(1);
	if (!t || t === "." || t === "..") return null;
	try {
		return decodeURIComponent(t);
	} catch {
		return t;
	}
}
function yn(e, t) {
	let n = t, r = (e) => _n(e, n);
	return e.addEventListener("click", r), {
		update(e) {
			n = e;
		},
		destroy() {
			e.removeEventListener("click", r);
		}
	};
}
function bn() {
	let e = window.marked;
	if (!e?.Marked) return null;
	if (hn && mn === e) return hn;
	let t = new e.Marked();
	return t.use({ extensions: [{
		name: "forgeProtectedLink",
		level: "inline",
		tokenizer(e) {
			if (this.lexer.state.inLink || this.lexer.state.inRawBlock) return;
			let t = xn(e);
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
			let t = pn.exec(e);
			if (t) return {
				type: "forgeResource",
				raw: t[0],
				resourceId: t[1]
			};
		},
		renderer(e) {
			let t = this.parser.options.forgeMarkdownContext, n = t?.resolveResourceTitle(e.resourceId);
			if (!t || !n) return En(e.raw);
			let r = un(t.workspaceId, e.resourceId);
			return r ? `<a class="forge-resource-reference" href="${En(r)}" data-forge-resource-id="${En(e.resourceId)}">${En(n)}</a>` : En(e.raw);
		}
	}] }), mn = e, hn = t, t;
}
function xn(e) {
	let t = e.startsWith("![") ? 1 : e.startsWith("[") ? 0 : -1;
	if (t < 0) return null;
	let n = Sn(e, t, "[", "]");
	if (n < 0 || e[n + 1] !== "(") return null;
	let r = Sn(e, n + 1, "(", ")");
	if (r < 0) return null;
	let i = e.slice(t + 1, n), a = Cn(i);
	return a === i ? null : {
		raw: e.slice(0, r + 1),
		markdown: `${e.slice(0, t + 1)}${a}${e.slice(n, r + 1)}`
	};
}
function Sn(e, t, n, r) {
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
			let t = wn(e, o, "`"), n = e.indexOf("`".repeat(t), o + t);
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
function Cn(e) {
	let t = "", n = 0;
	for (; n < e.length;) {
		if (e[n] === "\\") {
			t += e.slice(n, n + 2), n += 2;
			continue;
		}
		if (e[n] === "`") {
			let r = wn(e, n, "`"), i = e.indexOf("`".repeat(r), n + r);
			if (i >= 0) {
				t += e.slice(n, i + r), n = i + r;
				continue;
			}
		}
		let r = pn.exec(e.slice(n));
		if (r) {
			t += `\\[\\[${r[1]}\\]\\]`, n += r[0].length;
			continue;
		}
		t += e[n++];
	}
	return t;
}
function wn(e, t, n) {
	let r = 0;
	for (; e[t + r] === n;) r++;
	return r;
}
function Tn(e) {
	return RegExp(`^${fn}$`).test(e);
}
function En(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/detail.ts
function Dn(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function On(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function kn(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...kn(a.children || [], t, n, r + 1));
	return i;
}
//#endregion
//#region src/components/FileBrowser.svelte
var An = P("<h3><!><span> </span></h3>"), jn = P("<span class=\"artifact-folder-icon\"><!><!></span>"), Mn = P("<span class=\"artifact-delete\" role=\"button\" tabindex=\"0\"><!></span>"), Nn = P("<a class=\"artifact-download\"><!></a><!>", 1), Pn = P("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), Fn = P("<div class=\"empty-list-row\"><!><span> </span></div>"), In = P("<div class=\"content-section\" data-component-owner=\"file-browser\"><!> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function Ln(n, i) {
	C(i, !0);
	let a = N(i, "entries", 19, () => []), o = N(i, "emptyMessage", 3, "No files."), d = N(i, "activePath", 3, ""), f = N(i, "showHeading", 3, !0), p = u(() => kn(a(), i.expanded, i.title)), m = u(() => i.title === "Wiki" ? "book-open" : "paperclip");
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
	var v = In(), y = t(v), x = (e) => {
		var n = An(), a = t(n);
		W(a, { get name() {
			return c(m);
		} });
		var o = s(a), l = t(o, !0);
		w(o), w(n), g(() => r(l, i.title)), F(e, n);
	};
	q(y, (e) => {
		f() && e(x);
	});
	var S = s(y, 2), T = t(S), E = t(T), D = (n) => {
		var a = e(), o = b(a);
		J(o, 17, () => c(p), (e) => `${i.title}:${e.entry.path}`, (e, n) => {
			let a = u(() => c(n).entry.type === "directory"), o = u(() => i.expanded.has(`${i.title}:${c(n).entry.path}`));
			var l = Pn(), f = t(l);
			let p;
			var m = t(f), v = t(m), y = t(v), x = (e) => {
				W(e, { name: "chevron-right" });
			};
			q(y, (e) => {
				c(a) && e(x);
			}), w(v);
			var S = s(v), C = (e) => {
				var n = jn(), r = t(n);
				W(r, {
					name: "folder",
					className: "artifact-icon artifact-icon-dir"
				});
				var i = s(r);
				W(i, {
					name: "folder-open",
					className: "artifact-icon artifact-icon-dir"
				}), w(n), F(e, n);
			}, T = (e) => {
				{
					let t = u(() => _(c(n).entry.name));
					W(e, {
						get name() {
							return c(t);
						},
						className: "artifact-icon"
					});
				}
			};
			q(S, (e) => {
				c(a) ? e(C) : e(T, -1);
			});
			var E = s(S), D = t(E, !0);
			w(E), w(m);
			var O = s(m, 2), k = t(O), A = (e) => {
				var r = Nn(), a = b(r), o = t(a);
				W(o, {
					name: "download",
					className: "artifact-download-icon"
				}), w(a);
				var l = s(a), u = (e) => {
					var r = Mn(), a = t(r);
					W(a, {
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
				q(l, (e) => {
					i.onDelete && e(u);
				}), g((e) => {
					I(a, "href", e), I(a, "download", c(n).entry.name), I(a, "title", `Download ${c(n).entry.name}`), I(a, "aria-label", `Download ${c(n).entry.name}`);
				}, [() => i.rawURL(i.title, c(n).entry.path, !0)]), h("click", a, (e) => e.stopPropagation()), F(e, r);
			};
			q(k, (e) => {
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
			}, [() => c(a) ? `${(c(n).entry.children || []).length} items` : On(c(n).entry.size || 0)]), h("click", f, () => c(a) ? i.onToggle(`${i.title}:${c(n).entry.path}`) : i.onPreview(i.title, c(n).entry.path)), F(e, l);
		}), F(n, a);
	}, O = (e) => {
		var n = Fn(), a = t(n);
		{
			let e = u(() => i.title === "Artifacts" ? "archive" : "inbox");
			W(a, { get name() {
				return c(e);
			} });
		}
		var l = s(a), d = t(l, !0);
		w(l), w(n), g(() => r(d, o())), F(e, n);
	};
	q(E, (e) => {
		c(p).length ? e(D) : e(O, -1);
	}), w(T), w(S), w(v), F(n, v), l();
}
p(["click", "keydown"]);
//#endregion
//#region src/components/LazyMarkdownEditor.svelte
var Rn = P("<div class=\"file-modal-empty error-preview\"><strong>Markdown editor unavailable</strong><span> </span></div>"), zn = P("<div class=\"file-modal-empty\"><strong>Loading Markdown editor…</strong></div>");
function Bn(n, i) {
	let a = import("./MarkdownEditor-ND7YQBDp.js");
	var o = e(), l = b(o);
	v(l, () => a, (e) => {
		var t = zn();
		F(e, t);
	}, (t, n) => {
		var r = e(), a = b(r);
		K(a, () => c(n).default, (e, t) => {
			t(e, {
				get identity() {
					return i.identity;
				},
				get file() {
					return i.file;
				},
				get onSave() {
					return i.onSave;
				},
				get onDone() {
					return i.onDone;
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
		var i = Rn(), a = s(t(i)), o = t(a, !0);
		w(a), w(i), g((e) => r(o, e), [() => c(n) instanceof Error ? c(n).message : String(c(n))]), F(e, i);
	}), F(n, o);
}
//#endregion
//#region src/components/FilePreviewModal.svelte
var Vn = P("<button class=\"secondary-button\" type=\"button\"><!><span> </span></button>"), Hn = P("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), Un = P("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), Wn = P("<div class=\"modal-markdown-editor\"><!></div>"), Gn = P("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), Kn = P("<div class=\"file-modal-empty\"><!><strong>Preview unavailable</strong><span> </span><a class=\"secondary-button file-modal-download\" title=\"Download file\"><!><span>Download</span></a></div>"), qn = P("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Jn = P("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), Yn = P("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><!><a class=\"secondary-button file-modal-download\" title=\"Download file\"><!><span>Download</span></a><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Xn(n, i) {
	C(i, !0);
	let a = o(null), d = o(!1), f = o(""), p = o(!1), m = u(() => `detail-preview:${i.workspaceId}:${i.resourceId}`), _ = u(() => i.selection ? `${i.workspaceId}:${i.resourceId}:${i.selection.section}:${i.selection.path}` : ""), v = u(() => i.selection ? `/api/workspaces/${encodeURIComponent(i.workspaceId)}/files/raw?path=${encodeURIComponent(i.selection.path)}` : ""), y = u(() => i.selection ? `/api/workspaces/${encodeURIComponent(i.workspaceId)}/files/raw?path=${encodeURIComponent(i.selection.path)}&download=1` : ""), E = "";
	Y(() => {
		let e = i.selection, t = c(m), n = c(_);
		if (n !== E) {
			if (E = n, x(a, null), x(f, ""), x(p, !1), !e) {
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
	var k = e(), A = b(k), j = (e) => {
		var n = Yn(), o = t(n), l = s(o, 2), m = t(l), _ = t(m), b = t(_), C = t(b, !0);
		w(b);
		var E = s(b), k = t(E);
		w(E), w(_);
		var A = s(_), j = t(A), M = (e) => {
			var n = Vn(), i = t(n);
			{
				let e = u(() => c(p) ? "eye" : "pencil");
				W(i, { get name() {
					return c(e);
				} });
			}
			var a = s(i), o = t(a, !0);
			w(a), w(n), g(() => r(o, c(p) ? "Preview" : "Edit / Annotate")), h("click", n, () => x(p, !c(p))), F(e, n);
		}, N = u(() => i.editable && c(a) && !c(a).truncated && !c(a).binary && Dn(c(a).path || i.selection.path));
		q(j, (e) => {
			c(N) && e(M);
		});
		var P = s(j), L = t(P);
		W(L, { name: "download" }), S(), w(P);
		var R = s(P), z = t(R);
		W(z, { name: "external-link" }), S(), w(R);
		var B = s(R), V = t(B);
		W(V, { name: "x" }), w(B), w(A), w(m);
		var H = s(m, 2), U = (e) => {
			var n = Hn(), a = t(n);
			W(a, { name: "loader-circle" });
			var o = s(a, 2), c = t(o, !0);
			w(o), w(n), g(() => r(c, i.selection.path)), F(e, n);
		}, G = (e) => {
			var n = Un(), i = t(n);
			W(i, { name: "triangle-alert" });
			var a = s(i, 2), o = t(a, !0);
			w(a), w(n), g(() => r(o, c(f))), F(e, n);
		}, K = (e) => {
			var n = Wn(), r = t(n);
			{
				let e = u(() => `${i.workspaceId}:${i.resourceId}:${i.selection.path}`);
				Bn(r, {
					get identity() {
						return c(e);
					},
					get file() {
						return c(a);
					},
					onSave: O,
					onDone: () => x(p, !1),
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
			var n = Gn(), r = t(n);
			w(n), g(() => {
				I(r, "src", c(v)), I(r, "alt", c(a).name || i.selection.path);
			}), F(e, n);
		}, ee = (e) => {
			var n = Kn(), o = t(n);
			W(o, { name: "file-warning" });
			var l = s(o, 2), u = t(l);
			w(l);
			var d = s(l), f = t(d);
			W(f, { name: "download" }), S(), w(d), w(n), g((e) => {
				r(u, `${(c(a).name || i.selection.path) ?? ""} · Binary file, ${e ?? ""}.`), I(d, "href", c(y));
			}, [() => On(c(a).size || 0)]), F(e, n);
		}, Y = (e) => {
			var t = qn();
			D(t, () => gn(c(a)?.content || "", {
				workspaceId: i.workspaceId,
				resolveResourceTitle: i.resolveResourceTitle
			}), !0), w(t), T(t, (e, t) => yn?.(e, t), () => ({
				resolveResourceTitle: i.resolveResourceTitle,
				onNavigate: i.onNavigate,
				onOpenFile: i.onOpenFile
			})), F(e, t);
		}, te = u(() => Dn(c(a)?.path || i.selection.path)), ne = (e) => {
			var n = Jn(), i = t(n, !0);
			w(n), g(() => r(i, c(a)?.content || "")), F(e, n);
		};
		q(H, (e) => {
			c(d) ? e(U) : c(f) ? e(G, 1) : c(a) && c(p) ? e(K, 2) : c(a)?.image ? e(J, 3) : c(a)?.binary ? e(ee, 4) : c(te) ? e(Y, 5) : e(ne, -1);
		}), w(l), w(n), g((e, t) => {
			I(l, "data-preview-identity", `${i.workspaceId}:${i.resourceId}:${i.selection.section}:${i.selection.path}:${c(a)?.contentHash || "pending"}`), r(C, e), r(k, `${i.selection.path ?? ""}${t ?? ""}${c(a)?.truncated ? " · truncated" : ""}`), I(P, "href", c(y)), I(R, "href", c(v));
		}, [() => c(a)?.name || i.selection.path.split("/").pop() || "File preview", () => c(a)?.size == null ? "" : ` · ${On(c(a).size)}`]), h("click", o, function(...e) {
			i.onClose?.apply(this, e);
		}), h("click", B, function(...e) {
			i.onClose?.apply(this, e);
		}), F(e, n);
	};
	q(A, (e) => {
		i.selection && e(j);
	}), F(n, k), l();
}
p(["click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var Zn = P("<p class=\"approval-question\"> </p>"), Qn = P("<p> </p>"), $n = P("<button> </button>"), er = P("<div class=\"approval-options\"></div>"), tr = P("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), nr = P("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), rr = P("<!> <!>", 1), ir = P("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function ar(e, n) {
	C(n, !0);
	let i = o(""), u = o(!1), d = o(y(f()));
	Y(() => {
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
	var _ = ir(), v = t(_), T = t(v);
	W(T, { name: "shield-question" });
	var E = s(T), D = t(E, !0);
	w(E), w(v);
	var k = s(v, 2), A = (e) => {
		var i = Zn(), a = t(i, !0);
		w(i), g(() => r(a, n.item.question)), F(e, i);
	};
	q(k, (e) => {
		n.item.question && e(A);
	});
	var M = s(k, 2), N = (e) => {
		var i = Qn(), a = t(i, !0);
		w(i), g(() => r(a, n.item.detail)), F(e, i);
	};
	q(M, (e) => {
		n.item.detail && e(N);
	});
	var P = s(M, 2), I = (e) => {
		var o = rr(), l = b(o), d = (e) => {
			var i = er();
			J(i, 21, () => n.item.options, (e) => e.optionId, (e, n) => {
				var i = $n();
				let a;
				var o = t(i, !0);
				w(i), g((e, t) => {
					i.disabled = c(u), a = j(i, 1, "", null, a, e), r(o, t);
				}, [() => ({ "secondary-button": String(c(n).kind || "").startsWith("reject") }), () => m(c(n))]), h("click", i, () => p({ optionId: c(n).optionId })), F(e, i);
			}), w(i), F(e, i);
		}, f = (e) => {
			var n = tr(), r = t(n), i = t(r);
			W(i, { name: "check" }), S(), w(r);
			var a = s(r), o = t(a);
			W(o, { name: "x" }), S(), w(a), w(n), g(() => {
				r.disabled = c(u), a.disabled = c(u);
			}), h("click", r, () => p({ decision: "accept" })), h("click", a, () => p({ decision: "decline" })), F(e, n);
		};
		q(l, (e) => {
			n.item.options?.length ? e(d) : e(f, -1);
		});
		var _ = s(l, 2), v = (e) => {
			var n = nr(), r = t(n);
			O(r);
			var o = s(r);
			w(n), g((e) => o.disabled = e, [() => !c(i).trim() || c(u)]), a("submit", n, (e) => {
				e.preventDefault(), c(i).trim() && p({ text: c(i).trim() });
			}), U(r, () => c(i), (e) => x(i, e)), F(e, n);
		};
		q(_, (e) => {
			n.item.question && e(v);
		}), F(e, o);
	}, L = (e) => {
		var i = Qn(), a = t(i);
		w(i), g(() => r(a, `${(n.item.decision || (n.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${n.item.reply ? `: ${n.item.reply}` : ""}`)), F(e, i);
	};
	q(P, (e) => {
		n.item.status === "pending" ? e(I) : e(L, -1);
	}), w(_), g(() => r(D, n.item.title || "Approval requested")), F(e, _), l();
}
p(["click"]);
//#endregion
//#region vendor/agenthub-event-timeline/index.mjs
var or = 400, sr = 12e3;
function cr(e, t = or) {
	let n = String(e ?? "");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function lr(e) {
	if (e == null) return "";
	try {
		return cr(JSON.stringify(e));
	} catch {
		return "";
	}
}
function ur(e) {
	let t = String(e || "").replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function dr(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string").join(" ") : typeof e == "string" ? e : "";
}
function X(...e) {
	for (let t of e) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
var fr = /* @__PURE__ */ new Set([
	"user",
	"system",
	"agent",
	"assistant"
]);
function pr(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return;
	let t = {};
	for (let n of [
		"id",
		"name",
		"sessionId"
	]) typeof e[n] == "string" && e[n].trim() && (t[n] = e[n].trim());
	return Object.keys(t).length ? t : void 0;
}
function mr(e) {
	let t = typeof e == "string" ? e.trim().toLowerCase() : "";
	return fr.has(t) ? t : "user";
}
function hr(e) {
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
function gr(e) {
	if (!Array.isArray(e)) return "";
	let t = [];
	for (let n of e) typeof n?.text == "string" ? t.push(n.text) : typeof n?.content?.text == "string" ? t.push(n.content.text) : n?.type === "diff" && typeof n?.path == "string" && t.push(`Edit ${n.path}`);
	return t.filter(Boolean).join("\n");
}
function _r(e) {
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
		let a = X(e.id, r.itemId), o = ur(t) || "Tool", s = "", c = "", l = "";
		t === "commandExecution" ? (o = "Command", s = dr(e.command) || X(e.cmd), c = X(e.aggregatedOutput, e.output), typeof e.exitCode == "number" && e.exitCode !== 0 && (l = `Exit code ${e.exitCode}`)) : t === "fileChange" ? (o = "File change", s = (Array.isArray(e.changes) ? e.changes.map((e) => e?.path).filter(Boolean) : []).join(", ")) : t === "mcpToolCall" ? (o = "MCP", s = [e.server, e.tool].filter((e) => typeof e == "string" && e).join(" / "), c = typeof e.result == "string" ? e.result : lr(e.result), l = X(e.error?.message, typeof e.error == "string" ? e.error : "")) : t === "webSearch" ? (o = "Web search", s = X(e.query)) : (s = X(e.title, e.name, dr(e.command), e.path), c = X(e.output, e.aggregatedOutput));
		let u = hr(e.status);
		return n === "item/started" && (u = "running"), n === "item/completed" && u === "running" && (u = "completed"), l && u === "completed" && (u = "failed"), {
			callId: a,
			method: n,
			time: i,
			name: o,
			status: u,
			error: l,
			summary: cr(s.replace(/\s+/g, " ").trim(), 120),
			output: cr(c, sr)
		};
	}
	let a = r.update && typeof r.update == "object" ? r.update : r, o = X(a.sessionUpdate);
	if (o === "tool_call" || o === "tool_call_update") {
		let e = X(a.toolCallId, a.id), t = a.rawInput && typeof a.rawInput == "object" ? a.rawInput : {}, r = X(a.title, dr(t.command), t.path, t.filePath, ur(a.kind));
		return {
			callId: e,
			method: n,
			time: i,
			name: ur(a.kind) || "Tool",
			status: hr(a.status || (o === "tool_call" ? "in_progress" : "")),
			summary: cr(r.replace(/\s+/g, " ").trim(), 120),
			output: cr(gr(a.content), sr),
			error: ""
		};
	}
	if (n === "tool_execution_start" || n === "tool_execution_end") {
		let e = X(r.toolName, r.name, r.tool), t = r.args && typeof r.args == "object" ? r.args : {}, a = X(dr(t.command), t.path, t.filePath, ""), o = r.isError === !0 || !!X(r.error);
		return {
			callId: X(r.toolCallId, r.callId, e),
			method: n,
			time: i,
			name: ur(e) || "Tool",
			status: n === "tool_execution_start" ? "running" : o ? "failed" : "completed",
			summary: cr(a.replace(/\s+/g, " ").trim(), 120),
			output: cr(X(typeof r.result == "string" ? r.result : "", gr(r.result?.content)), sr),
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
function vr(e) {
	let t = e?.data ?? {}, n = X(t.method), r = t.params && typeof t.params == "object" ? t.params : {}, i = Array.isArray(r.options) ? r.options.map((e) => ({
		optionId: X(e?.optionId),
		name: X(e?.name),
		kind: X(e?.kind)
	})).filter((e) => e.optionId) : [], a = dr(r.command) || dr(r?.rawInput?.command);
	if (a) return {
		title: "Run command",
		detail: cr(a, 160),
		question: "",
		options: i
	};
	let o = Array.isArray(r.changes) ? r.changes.map((e) => e?.path).filter(Boolean) : [];
	if (r.toolCall && typeof r.toolCall == "object") {
		let e = X(r.toolCall.title, r.toolCall.kind && ur(r.toolCall.kind)), t = gr(r.toolCall.content);
		return {
			title: e || "Permission requested",
			detail: "",
			question: t,
			options: i
		};
	}
	return o.length ? {
		title: "Apply file changes",
		detail: cr(o.join(", "), 160),
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
var yr = {
	accept: "Allowed",
	acceptForSession: "Allowed for this session",
	decline: "Declined",
	cancel: "Cancelled"
}, br = {
	failed: "Session failed",
	stopping: "Stopping provider",
	stopped: "Session stopped",
	archived: "Session archived"
}, xr = {
	requested: "requested",
	completed: "provider completed",
	provider_error: "provider error",
	startup_error: "startup error",
	daemon_recovery: "daemon recovery"
};
function Sr(e) {
	return e === "message.delivery" || e === "provider.event" || e === "provider.metadata" || e === "plan.event" || e === "provider.stderr" || e === "provider.turn.started" || e === "provider.turn.completed" || e.startsWith("provider.process.");
}
function Cr(e, t) {
	let n = { ...e };
	return t.name && (n.name = t.name), t.summary && (n.summary = t.summary), t.status && (n.status = t.status), t.error && (n.error = t.error), t.deltaOnly ? n.output = cr((n.output || "") + (t.output || ""), sr) : t.output && (n.output = t.output), n.time = t.time || e.time, n.key = e.key, n;
}
function wr(e, t) {
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
		rawPreview: lr(t?.data?.raw)
	};
}
function Tr(e) {
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
					role: mr(o.role),
					key: a.id,
					time: s,
					steer: o.steer === !0,
					text: typeof o.text == "string" ? o.text : ""
				};
				a.turnId && (e.turnId = a.turnId);
				let n = pr(o.sender);
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
				let e = _r(a);
				if (!e) break;
				let n = t.at(-1), i = n?.kind === "tools" ? n : null, o = e.callId ? r.get(e.callId) : null;
				if (o) Object.assign(o.call, Cr(o.call, e)), o.group.time = s, o.call.status !== "running" && r.delete(e.callId);
				else {
					if (e.deltaOnly) break;
					let n = i || {
						kind: "tools",
						key: a.id,
						calls: [],
						time: s
					}, o = wr(e, a);
					n.calls.push(o), n.time = s, i || t.push(n), o.callId && o.status === "running" && r.set(o.callId, {
						call: o,
						group: n
					});
				}
				break;
			}
			case "approval.requested": {
				let { title: e, detail: r, question: i, options: c } = vr(a), l = {
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
				let e = X(o.approvalId), r = X(o.decision) || "decline", i = X(o.optionId), c = X(o.text), l = e ? n.get(e) : null, u = (e) => r === "text" ? "Replied" : i ? `Answered: ${e?.options?.find((e) => e.optionId === i)?.name || i}` : yr[r] || ur(r), d = r === "accept" || r === "acceptForSession" || r === "text";
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
				let e = br[o.state];
				o.state === "failed" ? i("failed", s) : o.state === "stopped" && i(o.reason === "completed" ? "completed" : "failed", s), o.state === "stopped" && xr[o.reason] && (e += ` · ${xr[o.reason]}`);
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
				if (Sr(e)) break;
				t.push({
					kind: "unknown",
					key: a.id,
					time: s,
					type: e || "unknown",
					preview: lr(o)
				});
		}
	}
	let a = t.at(-1);
	return a?.kind === "thinking" && (a.active = !0), t;
}
//#endregion
//#region src/components/timeline-events.ts
var Er = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment",
	"turn.started",
	"turn.completed"
]), Dr = /* @__PURE__ */ new Set([
	...Er,
	"Session created",
	"Turn started",
	"Turn completed"
]);
function Or(e, t) {
	let n = new Set(e.filter((e) => Er.has(e.type)).map((e) => String(e.id)));
	return t.filter((e) => e.key === void 0 || !n.has(String(e.key)));
}
function kr(e) {
	let t = e || [], n = Or(t, Tr(t)), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function Ar(e) {
	let t = String(e || "");
	return Dr.has(t) || t === "Agent connected" || t.startsWith("Agent connected ·");
}
function jr(e) {
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
function Mr(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? Br(r, n) : Vr(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function Nr(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) Pr(n, e);
	return n;
}
function Pr(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, Vr(t));
		return;
	}
	e[a] = Br(e[a], t);
}
function Fr(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = Ir(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? Lr(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function Ir(e) {
	if (e.type !== "tool.event") return "";
	let t = Rr(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? Rr(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? zr(n.toolCallId) || zr(n.id) : "";
}
function Lr(e, t) {
	let n = e.data || {}, r = t.data || {}, i = Rr(n.raw), a = Rr(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? Rr(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? Rr(a.update) : a;
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
function Rr(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function zr(e) {
	return typeof e == "string" ? e.trim() : "";
}
function Br(e, t) {
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
function Vr(e) {
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
function Hr(e, t) {
	let n = Number(e);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : Math.max(0, Math.floor(Number(t) || 0));
}
function Ur(e) {
	return e.compact ? Hr(e.toolCallCount, e.calls?.length || 0) : e.calls?.length || 0;
}
function Wr(e) {
	let t = Hr(e, 0);
	return `${t} tool ${t === 1 ? "call" : "calls"}`;
}
function Gr(e) {
	return e.rangeStartEventId && e.rangeStartEventId > 0 ? String(e.rangeStartEventId) : String(e.key ?? e.time ?? "tools");
}
//#endregion
//#region src/components/chat-state.ts
var Kr = 20, qr = 250, Jr = 80, Yr = 2e3, Xr = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment"
]), Zr = class {
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
		this.api = e.api ?? new Qt(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? Jr), this.statusSyncIntervalMs = Math.max(1, e.statusSyncIntervalMs ?? Yr), this.realtime = e.realtime !== !1;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t, n) {
		if (this.disposed) return;
		let r = ei(e, t), i = this.activeKey !== r;
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
			let r = await this.api.latest(ai(e, n), { scope: ri(e, "older") });
			return this.isCurrent(e, t) ? (this.mergePage(e, r), r.segments.some((e) => e.turns?.length || e.gap)) : !1;
		} catch (n) {
			return n instanceof Xt || !this.isCurrent(e, t) || (e.error = hi(n)), !1;
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
			let r = await this.api.latest(oi(t, e), { scope: ri(t, `turn:${e}`) });
			if (!this.isCurrent(t, n)) return;
			if (t.details.set(e, r), !r.turn.closed && r.turn.generation.generationId === t.generationId) {
				let i = await this.loadTurnRange(t, r, n);
				if (!this.isCurrent(t, n)) return;
				t.liveEvents.set(e, i);
			}
			this.realtime && this.connect(t);
		} catch (r) {
			if (r instanceof Xt || !this.isCurrent(t, n)) return;
			t.detailErrors.set(e, hi(r));
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
		this.isCurrent(r, o) && (r.liveEvents.set(i, Fr(Mr([...r.liveEvents.get(i) || [], ...s]))), this.emit());
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
		} : gi();
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
			key: ei(e, t),
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
			let n = await this.api.latest(ai(e), { scope: ri(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			e.segments.clear(), e.details.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), this.mergePage(e, n), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof Xt || !this.isCurrent(e, t)) return;
			e.error = hi(n);
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
			n && (e.liveEvents.set(t.reference, Fr(Mr([...e.liveEvents.get(t.reference) || [], ...n]))), e.orphanEvents.delete(t.turnId));
		}
		e.nextCursor = String(t.page?.nextCursor || ""), e.hasMoreBefore = !!(t.page?.hasMore && e.nextCursor);
	}
	blocks(e) {
		let t = [], n = [...e.segments.values()].sort((e, t) => e.generation.generation - t.generation.generation), r = n.find((t) => t.generation.generationId === e.generationId)?.generation || ci(e), i = r ? this.orphanEventBlocks(e, r) : [];
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
					items: i && !a ? Qr(i, r.generation.generationId) : void 0,
					events: a?.filter((e) => !Xr.has(e.type)),
					loading: e.detailLoading.has(t.reference),
					error: e.detailErrors.get(t.reference)
				});
			}
			r.generation.generationId === e.generationId && n.push(...i), n.sort((e, t) => ni(e) - ni(t)), t.push(...n);
		}
		return i.length && !n.some((t) => t.generation.generationId === e.generationId) && t.push(...i), t;
	}
	orphanEventBlocks(e, t) {
		let n = [];
		for (let [r, i] of e.orphanEvents) {
			let a = i.filter((e) => !Xr.has(e.type)), o = [];
			for (let i of a) o.length && Number(i.id) !== Number(o[o.length - 1].id) + 1 && (n.push(ti(e, r, t, o)), o = []), o.push(i);
			o.length && n.push(ti(e, r, t, o));
		}
		return n.sort((e, t) => ni(e) - ni(t));
	}
	connect(e) {
		if (!this.realtime || !this.isActive(e) || e.stream || !e.generationId || !di(e.status)) return;
		let t = si(e), n = new URLSearchParams({ generationId: e.generationId });
		t && n.set("after", String(t));
		let r = ++e.streamGeneration, i = this.eventSourceFactory(`${ii(e)}/stream?${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.resourceId, n), this.scheduleEventFlush(e), fi(n) && this.materializeTerminalTurn(e, String(n.turnId || ""), r);
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
			let n = await this.api.latest(`${ii(e)}/status`, { scope: ri(e, "status") });
			if (!this.isCurrent(e, t) || !n.generation?.generationId) return;
			let r = String(n.generation.generationId);
			if (r !== e.generationId && (e.generationId || e.loaded)) {
				this.activate(e.workspaceId, e.resourceId, n);
				return;
			}
			let i = e.generationId, a = String(e.status?.session?.id || "");
			e.status = n, e.generationId = r, e.stream && (!di(n) || a && a !== String(n.session?.id || "")) && this.closeStream(e), !e.loaded && !e.loading ? this.loadInitial(e) : e.stream || this.connect(e), i !== r && this.emit();
		} catch (n) {
			if (n instanceof Xt || !this.isCurrent(e, t)) return;
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
				limit: String(qr)
			}), l = await this.api.latest(`${ii(e)}/events?${c}`, { scope: ri(e, a) });
			if (!this.isCurrent(e, i)) return [];
			let u = li(l.events).filter((t) => this.eventBelongsToContext(e, t));
			s = Mr([...s, ...u]);
			let d = Number(l.page?.nextAfter) || ui(u);
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
					let i = await this.api.latest(ai(e), { scope: ri(e, `terminal-head:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.mergePage(e, i);
					let a = this.findTurnById(e, r, t);
					if (!a?.closed) throw Error("Turn projection is not closed yet");
					let o = await this.api.latest(oi(e, a.reference), { scope: ri(e, `terminal:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.flushEvents(e, !1), e.details.set(a.reference, o), e.liveEvents.delete(a.reference), this.emit();
					return;
				} catch (t) {
					if (t instanceof Xt || !e.stream || !this.isActiveStream(e, e.stream, n)) return;
					if (i === 2) {
						e.error = hi(t), this.emit();
						return;
					}
					await pi(50 * (i + 1));
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
			let n = await this.api.latest(ai(e), { scope: ri(e, "stream-head") });
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
		e.notices.some((e) => mi(e) === mi(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
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
			if (n) e.liveEvents.set(n, Fr(Nr(e.liveEvents.get(n) || [], [t])));
			else {
				let n = String(t.turnId || "current");
				e.orphanEvents.set(n, Fr(Nr(e.orphanEvents.get(n) || [], [t]))), fi(t) || this.refreshHead(e);
			}
		}
		t && this.isActive(e) && this.emit();
	}
	closeStream(e) {
		e.streamGeneration++, e.stream?.close(), e.stream = null;
	}
	resetForGeneration(e) {
		e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, e.pendingEvents = [], e.requestGeneration++, this.closeStream(e), this.api.requests.abort(ri(e, "initial")), this.api.requests.abort(ri(e, "older")), this.api.requests.abort(ri(e, "status")), e.segments.clear(), e.details.clear(), e.detailLoading.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), e.nextCursor = "", e.hasMoreBefore = !1, e.loading = !1, e.loadingOlder = !1, e.loaded = !1, e.error = "", e.headRefreshing = !1, e.terminalMaterializing.clear();
	}
	deactivate(e) {
		e && (e.statusSyncTimer && clearInterval(e.statusSyncTimer), e.statusSyncTimer = null, e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.requestGeneration++, this.closeStream(e), e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(ri(e, "initial")), this.api.requests.abort(ri(e, "older")), this.api.requests.abort(ri(e, "status")));
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
function Qr(e, t) {
	return (e.items || []).flatMap((e) => $r(e, t));
}
function $r(e, t) {
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
			let t = Hr(e.count, 1);
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
					summary: `${Wr(t)} · details omitted`,
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
		case "lifecycle": return e.text && !Ar(e.text) ? [{
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
function ei(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function ti(e, t, n, r) {
	let i = r[0]?.id ?? 0;
	return {
		kind: "turn",
		key: `${e.generationId}:${t || "current"}:${i}`,
		generation: n,
		events: r
	};
}
function ni(e) {
	if (e.turn) return Number(e.turn.startEventId) || 0;
	let t = e.events?.[0];
	return t && Number(t.id) || 0;
}
function ri(e, t) {
	return `resource-chat:${e.key}:${t}`;
}
function ii(e) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/resources/${encodeURIComponent(e.resourceId)}`;
}
function ai(e, t = "") {
	let n = new URLSearchParams({ limit: String(Kr) });
	return t && n.set("cursor", t), `${ii(e)}/history/turns?${n}`;
}
function oi(e, t) {
	return `${ii(e)}/history/turns/${encodeURIComponent(t)}`;
}
function si(e) {
	let t = [...e.segments.values()].filter((t) => t.generation.generationId === e.generationId).flatMap((e) => e.turns || []), n = [...e.liveEvents.values()].flat();
	return Math.max(0, ...t.map((e) => Number(e.lastEventId) || 0), ...n.map((e) => Number(e.id) || 0));
}
function ci(e) {
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
function li(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function ui(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function di(e) {
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
function fi(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function pi(e) {
	return new Promise((t) => setTimeout(t, e));
}
function mi(e) {
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
function hi(e) {
	return e instanceof Error ? e.message : String(e);
}
function gi() {
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
var _i = P("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function vi(e, n) {
	C(n, !0);
	let i = u(() => n.item.tone === "ok" ? "check-circle" : n.item.tone === "danger" ? "triangle-alert" : n.item.tone === "info" ? "info" : "clock");
	function a() {
		let e = new Date(n.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var o = _i(), d = t(o);
	W(d, { get name() {
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
var yi = P("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function bi(e, n) {
	C(n, !0);
	let i = N(n, "onExpand", 3, () => {}), u = o(y(!!n.item.active)), d = !!n.item.active;
	Y(() => {
		let e = !!n.item.active;
		e !== d && (d = e, x(u, e, !0));
	});
	function f() {
		if (n.item.active) return "Thinking…";
		if (!n.item.startTime || !n.item.time) return "Thought";
		let e = Math.round((new Date(n.item.time).getTime() - new Date(n.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var p = yi(), m = t(p), h = t(m);
	W(h, { name: "brain-circuit" });
	var _ = s(h), v = t(_, !0);
	w(_);
	var b = s(_), S = t(b);
	W(S, { name: "chevron-right" }), w(b), w(m);
	var T = s(m, 2), E = t(T, !0);
	w(T), w(p), g((e) => {
		p.open = c(u), r(v, e), r(E, n.item.text || "");
	}, [() => f()]), a("toggle", p, (e) => {
		x(u, e.currentTarget.open, !0), e.currentTarget.open && i()();
	}), F(e, p), l();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var xi = P("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), Si = P("<span class=\"agent-message-tag\">steer</span>"), Ci = P("<span class=\"agent-message-source\"> </span>"), wi = P("<div class=\"agent-message-content markdown-rendered\"></div>"), Ti = P("<p> </p>"), Ei = P("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function Di(e, n) {
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
		return !window.marked || !window.DOMPurify ? _(e).replaceAll("\n", "<br>") : gn(e, {
			workspaceId: i(),
			resolveResourceTitle: a()
		});
	}
	function _(e) {
		return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
	}
	var v = Ei(), y = t(v), b = t(y), x = t(b), S = t(x, !0);
	w(x);
	var E = s(x, 2), O = (e) => {
		var n = xi(), i = t(n, !0);
		w(n), g(() => r(i, c(d))), F(e, n);
	};
	q(E, (e) => {
		c(d) !== "assistant" && e(O);
	});
	var k = s(E, 2), A = (e) => {
		var t = Si();
		F(e, t);
	};
	q(k, (e) => {
		n.item.steer && e(A);
	});
	var M = s(k, 2), P = (e) => {
		var i = Ci(), a = t(i);
		w(i), g(() => {
			I(i, "title", n.item.sender.sessionId), r(a, `from session ${n.item.sender.sessionId ?? ""}`);
		}), F(e, i);
	};
	q(M, (e) => {
		c(d) === "agent" && n.item.sender?.sessionId && e(P);
	});
	var L = s(M, 2), R = t(L, !0);
	w(L), w(b);
	var z = s(b, 2), B = t(z), V = (e) => {
		var t = wi();
		D(t, h, !0), w(t), T(t, (e, t) => yn?.(e, t), () => ({
			resolveResourceTitle: a(),
			onNavigate: o()
		})), F(e, t);
	}, H = (e) => {
		var i = Ti(), a = t(i, !0);
		w(i), g(() => r(a, n.item.text || "")), F(e, i);
	};
	q(B, (e) => {
		c(d) === "assistant" || c(d) === "agent" ? e(V) : e(H, -1);
	}), w(z), w(y), w(v), g((e, t) => {
		j(v, 1, `agent-message-row ${c(f)}`), r(S, e), r(R, t);
	}, [() => p(), () => m()]), F(e, v), l();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var Oi = P("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function ki(e, n) {
	let i = N(n, "error", 3, !1), a = N(n, "alert", 3, !1);
	var o = Oi();
	let l;
	var d = t(o), f = t(d);
	{
		let e = u(() => i() ? "triangle-alert" : "info");
		W(f, { get name() {
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
var Ai = P("<pre> </pre>"), ji = P("<details data-component-owner=\"event-timeline\"><summary><span class=\"tool-status-icon tool-status-icon-running\"><!></span><span class=\"tool-status-icon tool-status-icon-failed\"><!></span><span class=\"tool-status-icon tool-status-icon-completed\"><!></span><span> </span><small> </small></summary> <!></details>");
function Mi(e, n) {
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
	var o = ji(), d = t(o), f = t(d), p = t(f);
	W(p, { name: "loader-circle" }), w(f);
	var m = s(f), h = t(m);
	W(h, { name: "x-circle" }), w(m);
	var _ = s(m), v = t(_);
	W(v, { name: "check-circle" }), w(_);
	var y = s(_), b = t(y, !0);
	w(y);
	var x = s(y), S = t(x, !0);
	w(x), w(d);
	var T = s(d, 2), E = (e) => {
		var n = Ai(), i = t(n, !0);
		w(n), g((e) => r(i, e), [() => a()]), F(e, n);
	}, D = u(() => a());
	q(T, (e) => {
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
var Ni = P("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function Pi(e, n) {
	C(n, !0);
	let i = u(() => n.item.calls || []), o = u(() => Ur(n.item)), d = u(() => c(i).map(f));
	function f(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var p = Ni(), m = t(p), h = t(m), _ = t(h);
	W(_, { name: "wrench" }), w(h);
	var v = s(h), y = t(v, !0);
	w(v);
	var b = s(v), x = t(b);
	w(b);
	var S = s(b), T = t(S);
	W(T, { name: "chevron-right" }), w(S), w(m);
	var E = s(m, 2);
	J(E, 21, () => c(i), (e) => String(e.callId || e.key), (e, t) => {
		Mi(e, { get call() {
			return c(t);
		} });
	}), w(E), w(p), g((e, t, i) => {
		I(p, "data-tool-group-key", e), p.open = n.open, r(y, t), r(x, `${i ?? ""}${c(d).length > 2 ? ` · +${c(d).length - 2} more` : ""}`);
	}, [
		() => `${n.generationId}:${Gr(n.item)}`,
		() => Wr(c(o)),
		() => c(d).slice(0, 2).join(" · ")
	]), a("toggle", p, (e) => n.onToggle(e.currentTarget.open)), F(e, p), l();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var Fi = P("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function Ii(e, n) {
	C(n, !0);
	var i = Fi(), a = t(i), o = t(a);
	W(o, { name: "info" });
	var c = s(o), u = t(c);
	w(c), w(a);
	var d = s(a), f = t(d, !0);
	w(d), w(i), g(() => {
		r(u, `Unhandled event: ${(n.item.type || n.item.kind) ?? ""}`), r(f, n.item.preview || "This event carries no payload.");
	}), F(e, i), l();
}
//#endregion
//#region src/components/HistoryTimeline.svelte
var Li = P("<div class=\"history-state\"><!><span>Loading resource History...</span></div>"), Ri = P("<div class=\"history-state history-error\"><!><strong>History unavailable</strong><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), zi = P("<button type=\"button\" class=\"secondary-button history-load-older\"><!> </button>"), Bi = P("<div class=\"history-legacy\"><!><span><strong>Legacy history</strong><small>Conversation history from before resource History was available was migrated to Artifacts.</small></span><button type=\"button\" class=\"secondary-button\">Open legacy history</button></div>"), Vi = P("<div class=\"history-state\"><!><span>No resource History yet.</span></div>"), Hi = P("<button type=\"button\" class=\"secondary-button\">Retry</button>"), Ui = P("<div class=\"history-gap\"><!><span><strong>History gap</strong> </span><!></div>"), Wi = P("<span class=\"history-turn-trigger\"><span class=\"history-turn-trigger-label\">Trigger</span><span class=\"history-turn-trigger-text\"> </span></span>"), Gi = P("<div class=\"history-detail-state\"><!>Loading Turn detail...</div>"), Ki = P("<div class=\"history-detail-state history-error\"><!> </div>"), qi = P("<div class=\"history-item\"><!></div>"), Ji = P("<div class=\"history-items\"></div>"), Yi = P("<section><span class=\"history-turn-dot\"></span> <button type=\"button\" class=\"history-turn-header\"><span class=\"history-turn-meta\"><span class=\"history-turn-time\"> </span> <span class=\"history-status-pill\"> </span> <span class=\"history-turn-duration\"> </span> <span class=\"history-turn-count\"> <span><!></span></span></span> <!> <span> </span></button> <!> <!> <!></section>"), Xi = P("<div class=\"history-generation\"><span class=\"history-generation-label\"> </span> <strong> </strong> <span class=\"history-generation-meta\"><span> </span> <span> </span> <span class=\"history-status-pill\"> </span></span></div> <div class=\"history-track\"></div>", 1), Zi = P("<!> <!> <!> <!>", 1), Qi = P("<div data-component-owner=\"history-timeline\" class=\"history-timeline-root\"><!></div>");
function $i(n, i) {
	C(i, !0);
	let a = N(i, "artifacts", 19, () => []), d = o(y(T())), f, p = o(""), m = o(y(/* @__PURE__ */ new Map())), _ = o(y(/* @__PURE__ */ new Set())), v = u(() => E(a(), "legacy-log.md"));
	H(() => {
		f = new Zr({ realtime: !1 });
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
		return c(_).has(te(e)) && R(e);
	}
	function B(e) {
		let t = te(e);
		if (c(_).has(t)) {
			let e = new Set(c(_));
			e.delete(t), x(_, e, !0);
			return;
		}
		x(_, new Set(c(_)).add(t), !0), L(e);
	}
	function V(e) {
		return jr(e.events ? kr(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || []);
	}
	function U(e) {
		let t = e.kind === "tools" ? Gr(e) : String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event");
		return `${e.generationId || c(d).generationId}:${e.kind}:${t}`;
	}
	function G(e) {
		return c(m).get(U(e)) ?? !1;
	}
	function K(e, t) {
		x(m, new Map(c(m)).set(U(e), t), !0), t && ee(e);
	}
	function ee(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return f?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function Y() {
		return Promise.reject(/* @__PURE__ */ Error("This is a read-only History view. Answer pending approvals from the Chat tab."));
	}
	function te(e) {
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
	var ce = Qi(), le = t(ce), ue = (e) => {
		var n = Li(), r = t(n);
		W(r, {
			name: "loader-circle",
			className: "spin"
		}), S(), w(n), F(e, n);
	}, de = (e) => {
		var n = Ri(), i = t(n);
		W(i, { name: "triangle-alert" });
		var a = s(i, 2), o = t(a, !0);
		w(a);
		var l = s(a);
		w(n), g(() => r(o, c(d).error)), h("click", l, () => f?.retryHistory()), F(e, n);
	}, fe = (n) => {
		var a = Zi(), o = b(a), l = (e) => {
			var n = zi(), i = t(n);
			W(i, { name: "chevrons-up" });
			var a = s(i, 1, !0);
			w(n), g(() => {
				n.disabled = c(d).loadingOlder, r(a, c(d).loadingOlder ? "Loading older History..." : "Load older History");
			}), h("click", n, () => f?.loadOlder()), F(e, n);
		};
		q(o, (e) => {
			c(d).hasMoreBefore && e(l);
		});
		var m = s(o, 2), _ = (e) => {
			ki(e, {
				title: "History",
				get text() {
					return c(p);
				},
				error: !0
			});
		};
		q(m, (e) => {
			c(p) && e(_);
		});
		var y = s(m, 2), C = (e) => {
			var n = Bi(), r = t(n);
			W(r, { name: "archive-restore" });
			var a = s(r, 2);
			w(n), h("click", a, () => i.onOpenLegacy(c(v))), F(e, n);
		}, T = (e) => {
			var n = Vi(), r = t(n);
			W(r, { name: "history" }), S(), w(n), F(e, n);
		};
		q(y, (e) => {
			c(d).loaded && !c(d).blocks.length && c(v) ? e(C) : c(d).loaded && !c(d).blocks.length && e(T, 1);
		});
		var E = s(y, 2);
		J(E, 17, () => c(oe), (e) => e.generation.generationId, (n, a) => {
			var o = Xi(), l = b(o), m = t(l), _ = t(m);
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
			J(R, 21, () => c(a).blocks, (e) => e.key, (n, a) => {
				var o = e(), l = b(o), m = (e) => {
					var n = Ui(), i = t(n);
					W(i, { name: "triangle-alert" });
					var o = s(i), l = s(t(o));
					w(o);
					var u = s(o), d = (e) => {
						var t = Hi();
						h("click", t, () => f?.retryHistory()), F(e, t);
					};
					q(u, (e) => {
						c(a).gap?.retryable && e(d);
					}), w(n), g(() => {
						I(n, "data-timeline-key", c(a).key), r(l, ` — ${(c(a).gap?.message || "This generation could not be read.") ?? ""}`);
					}), F(e, n);
				}, _ = (e) => {
					var n = Yi();
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
					W(N, { name: "chevron-down" }), w(A), w(E), w(m);
					var L = s(m, 2), R = (e) => {
						var n = Wi(), i = s(t(n)), o = t(i, !0);
						w(i), w(n), g((e) => r(o, e), [() => ie(c(a))]), F(e, n);
					}, H = u(() => ie(c(a)));
					q(L, (e) => {
						c(H) && e(R);
					});
					var oe = s(L, 2);
					let se;
					var ce = t(oe, !0);
					w(oe), w(f);
					var le = s(f, 2), ue = (e) => {
						var n = Gi(), r = t(n);
						W(r, {
							name: "loader-circle",
							className: "spin"
						}), S(), w(n), F(e, n);
					};
					q(le, (e) => {
						c(a).loading && e(ue);
					});
					var de = s(le, 2), fe = (e) => {
						var n = Ki(), i = t(n);
						W(i, { name: "triangle-alert" });
						var o = s(i, 1, !0);
						w(n), g(() => r(o, c(a).error)), F(e, n);
					};
					q(de, (e) => {
						c(a).error && e(fe);
					});
					var pe = s(de, 2), me = (e) => {
						var n = Ji();
						J(n, 21, () => V(c(a)), (e) => U(e), (e, n) => {
							var r = qi(), o = t(r), s = (e) => {
								{
									let t = u(() => c(a).generation.agentName || c(a).generation.resolvedProfile || c(a).generation.binding?.name || "Agent");
									Di(e, {
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
										}
									});
								}
							}, l = (e) => {
								bi(e, {
									get item() {
										return c(n);
									},
									onExpand: () => ee(c(n))
								});
							}, f = (e) => {
								{
									let t = u(() => G(c(n)));
									Pi(e, {
										get item() {
											return c(n);
										},
										get generationId() {
											return c(a).generation.generationId;
										},
										get open() {
											return c(t);
										},
										onToggle: (e) => K(c(n), e)
									});
								}
							}, m = (e) => {
								ar(e, {
									get item() {
										return c(n);
									},
									get generationId() {
										return c(a).generation.generationId;
									},
									get contextIdentity() {
										return c(d).identity;
									},
									onApproval: Y,
									onToast: (e) => x(p, e, !0)
								});
							}, h = (e) => {
								vi(e, { get item() {
									return c(n);
								} });
							}, _ = (e) => {
								{
									let t = u(() => c(n).text || "");
									ki(e, {
										title: "Provider error",
										get text() {
											return c(t);
										},
										error: !0
									});
								}
							}, v = (e) => {
								Ii(e, { get item() {
									return c(n);
								} });
							};
							q(o, (e) => {
								c(n).kind === "message" ? e(s) : c(n).kind === "thinking" ? e(l, 1) : c(n).kind === "tools" ? e(f, 2) : c(n).kind === "approval" ? e(m, 3) : c(n).kind === "lifecycle" ? e(h, 4) : c(n).kind === "error" ? e(_, 5) : e(v, -1);
							}), w(r), g(() => I(r, "data-history-kind", c(n).kind)), F(e, r);
						}), w(n), F(e, n);
					}, he = u(() => z(c(a)));
					q(pe, (e) => {
						c(he) && e(me);
					}), w(n), g((e, t, i, s, u, d, p, m, h, g) => {
						o = j(n, 1, "history-turn", null, o, { "history-turn-loading": c(a).loading }), I(n, "data-timeline-key", e), I(l, "data-tone", t), I(f, "aria-expanded", i), r(v, s), I(y, "data-tone", u), r(b, d), r(T, p), r(k, `${c(a).turn.eventCount ?? ""} events · ${c(a).turn.toolEventCount ?? ""} tools `), M = j(A, 1, "history-turn-chevron", null, M, m), se = j(oe, 1, "history-turn-preview", null, se, h), r(ce, g);
					}, [
						() => te(c(a)),
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
				q(l, (e) => {
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
	q(le, (e) => {
		c(d).loading && !c(d).loaded ? e(ue) : c(d).error && !c(d).loaded ? e(de, 1) : e(fe, -1);
	}), w(ce), F(n, ce), l();
}
p(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var ea = P("<button type=\"button\" class=\"secondary-button\"><!><span>Edit / Annotate</span></button>"), ta = P("<div class=\"markdown-document-actions\"><!><a class=\"secondary-button markdown-open-file\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a></div><div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>", 1), na = P("<pre class=\"markdown-view\"> </pre>"), ra = P("<div class=\"content-section\" data-component-owner=\"markdown-document\"><!></div>");
function ia(e, n) {
	C(n, !0);
	let i = N(n, "editable", 3, !1), a = N(n, "onSave", 3, async (e) => ({ path: e })), d = N(n, "onToast", 3, () => void 0), f = N(n, "onIconsChanged", 3, () => void 0), p = u(() => Dn(n.file.name)), m = u(() => `/api/workspaces/${encodeURIComponent(n.workspaceId)}/files/raw?path=${encodeURIComponent(n.file.path || n.file.name)}`), _ = o(!1), v = o("");
	Y(() => {
		let e = `${n.workspaceId}:${n.file.path || n.file.name}`;
		c(v) && c(v) !== e && x(_, !1), x(v, e);
	});
	var y = ra(), E = t(y), O = (e) => {
		{
			let t = u(() => ({
				...n.file,
				path: n.file.path || n.file.name
			}));
			Bn(e, {
				get identity() {
					return c(v);
				},
				get file() {
					return c(t);
				},
				onSave: (e, t) => a()(n.file.path || n.file.name, e, t),
				onDone: () => x(_, !1),
				get onToast() {
					return d();
				},
				get onIconsChanged() {
					return f();
				}
			});
		}
	}, k = (e) => {
		var r = ta(), a = b(r), o = t(a), l = (e) => {
			var n = ea(), r = t(n);
			W(r, { name: "pencil" }), S(), w(n), h("click", n, () => x(_, !0)), F(e, n);
		};
		q(o, (e) => {
			i() && e(l);
		});
		var u = s(o), d = t(u);
		W(d, { name: "external-link" }), S(), w(u), w(a);
		var f = s(a), p = t(f);
		D(p, () => gn(n.file.content || "", {
			workspaceId: n.workspaceId,
			resolveResourceTitle: n.resolveResourceTitle
		}), !0), w(p), T(p, (e, t) => yn?.(e, t), () => ({
			resolveResourceTitle: n.resolveResourceTitle,
			onNavigate: n.onNavigate,
			onOpenFile: n.onOpenFile
		})), w(f), g(() => {
			I(u, "href", c(m)), I(u, "aria-label", `Open ${n.file.name} in new window`);
		}), F(e, r);
	}, A = (e) => {
		var i = na(), a = t(i, !0);
		w(i), g(() => r(a, n.file.content || "")), F(e, i);
	};
	q(E, (e) => {
		c(p) && c(_) ? e(O) : c(p) ? e(k, 1) : e(A, -1);
	}), w(y), g(() => {
		I(y, "data-doc-file", n.file.name), I(y, "data-document-identity", `${n.workspaceId}:${n.file.path || n.file.name}:preview:${n.file.contentHash || "unversioned"}`);
	}), F(e, y), l();
}
p(["click"]);
//#endregion
//#region src/components/SchedulerPanel.svelte
var aa = P("<button type=\"button\" class=\"secondary-button\">Cancel edit</button>"), oa = P("<article><header><div><strong> </strong><code> </code></div><div><button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button><button type=\"button\" class=\"secondary-button danger\"><!><span>Remove</span></button></div></header> <dl><div><dt>Condition</dt><dd> </dd></div><div><dt>Target</dt><dd><code> </code></dd></div></dl></article>"), sa = P("<div class=\"empty-list-row\"><!><span>No schedules. The Server will not create empty Scheduler Turns.</span></div>"), ca = P("<div class=\"scheduler-settings-card\"><div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div> <label><input type=\"number\" min=\"1\" max=\"10080\" step=\"1\" aria-label=\"Scheduler wake interval in minutes\"/><span>minutes</span></label> <button type=\"button\" class=\"secondary-button\"><!><span>Save</span></button></div> <div class=\"schedule-editor\"><div class=\"schedule-editor-heading\"><div><strong> </strong><span>Conditions are natural language interpreted by the Scheduler Agent.</span></div><!></div> <label><span>Description</span><input placeholder=\"What should the Scheduler understand?\"/></label> <label><span>Condition</span><textarea rows=\"3\" placeholder=\"For example: when the release branch is green after 09:00 Shanghai time\"></textarea></label> <label><span>Target resource ID</span><input placeholder=\"workspace, scheduler, project1, or project1.task1\"/></label> <button type=\"button\"><span class=\"schedule-icon schedule-icon-busy\"><!></span><span class=\"schedule-icon schedule-icon-editing\"><!></span><span class=\"schedule-icon schedule-icon-add\"><!></span><span> </span></button></div> <div class=\"schedule-list\"><!></div>", 1);
function la(n, i) {
	C(i, !0);
	let a = new Qt();
	R(() => a.dispose());
	let u = o(""), d = o(""), f = o(""), p = o("workspace"), m = o(30), _ = o(!1);
	Y(() => {
		x(m, i.config.wakeIntervalMinutes, !0);
	});
	function v(e) {
		x(u, e.id, !0), x(d, e.description, !0), x(f, e.condition, !0), x(p, e.target, !0);
	}
	function y() {
		x(u, ""), x(d, ""), x(f, ""), x(p, "workspace");
	}
	async function T() {
		if (!c(d).trim() || !c(f).trim() || !c(p).trim() || c(_)) return;
		x(_, !0);
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
			}), y(), await i.onChanged(), i.onToast(e ? "Schedule updated." : "Schedule added.");
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		} finally {
			x(_, !1);
		}
	}
	async function E(e) {
		if (window.confirm(`Remove schedule ${e.id}?`)) try {
			await a.request(`/api/workspaces/${encodeURIComponent(i.workspaceId)}/scheduler/${encodeURIComponent(e.id)}`, { method: "DELETE" }), c(u) === e.id && y(), await i.onChanged(), i.onToast("Schedule removed.");
		} catch (e) {
			i.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function D() {
		if (!(!Number.isInteger(c(m)) || c(m) < 1 || c(m) > 10080 || c(_))) {
			x(_, !0);
			try {
				await a.request(`/api/workspaces/${encodeURIComponent(i.workspaceId)}/scheduler/settings`, {
					method: "PUT",
					body: JSON.stringify({
						agentBinding: i.config.agentBinding,
						wakeIntervalMinutes: c(m)
					})
				}), await i.onChanged(), i.onToast("Scheduler interval saved.");
			} catch (e) {
				i.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				x(_, !1);
			}
		}
	}
	var k = ca(), A = b(k), M = s(t(A), 2), N = t(M);
	O(N), S(), w(M);
	var P = s(M, 2), I = t(P);
	W(I, { name: "save" }), S(), w(P), w(A);
	var L = s(A, 2), z = t(L), B = t(z), H = t(B), G = t(H, !0);
	w(H), S(), w(B);
	var K = s(B), ee = (e) => {
		var t = aa();
		h("click", t, y), F(e, t);
	};
	q(K, (e) => {
		c(u) && e(ee);
	}), w(z);
	var te = s(z, 2), ne = s(t(te));
	O(ne), w(te);
	var re = s(te, 2), ie = s(t(re));
	V(ie), w(re);
	var ae = s(re, 2), oe = s(t(ae));
	O(oe), w(ae);
	var se = s(ae, 2);
	let ce;
	var le = t(se), ue = t(le);
	W(ue, { name: "loader-circle" }), w(le);
	var de = s(le), fe = t(de);
	W(fe, { name: "save" }), w(de);
	var pe = s(de), me = t(pe);
	W(me, { name: "plus" }), w(pe);
	var he = s(pe), ge = t(he, !0);
	w(he), w(se), w(L);
	var _e = s(L, 2), ve = t(_e), ye = (n) => {
		var a = e(), o = b(a);
		J(o, 17, () => i.config.schedules, (e) => e.id, (e, n) => {
			var i = oa();
			let a;
			var o = t(i), l = t(o), d = t(l), f = t(d, !0);
			w(d);
			var p = s(d), m = t(p, !0);
			w(p), w(l);
			var _ = s(l), y = t(_), b = t(y);
			W(b, { name: "pencil" }), S(), w(y);
			var x = s(y), C = t(x);
			W(C, { name: "trash-2" }), S(), w(x), w(_), w(o);
			var T = s(o, 2), D = t(T), O = s(t(D)), k = t(O, !0);
			w(O), w(D);
			var A = s(D), M = s(t(A)), N = t(M), P = t(N, !0);
			w(N), w(M), w(A), w(T), w(i), g(() => {
				a = j(i, 1, "", null, a, { editing: c(u) === c(n).id }), r(f, c(n).description), r(m, c(n).id), r(k, c(n).condition), r(P, c(n).target);
			}), h("click", y, () => v(c(n))), h("click", x, () => E(c(n))), F(e, i);
		}), F(n, a);
	}, be = (e) => {
		var n = sa(), r = t(n);
		W(r, { name: "calendar-clock" }), S(), w(n), F(e, n);
	};
	q(ve, (e) => {
		i.config.schedules.length ? e(ye) : e(be, -1);
	}), w(_e), g((e, t) => {
		P.disabled = c(_) || c(m) === i.config.wakeIntervalMinutes, r(G, c(u) ? "Edit schedule" : "Add schedule"), se.disabled = e, ce = j(se, 1, "", null, ce, t), r(ge, c(u) ? "Update schedule" : "Add schedule");
	}, [() => c(_) || !c(d).trim() || !c(f).trim() || !c(p).trim(), () => ({
		busy: c(_),
		editing: !!c(u)
	})]), U(N, () => c(m), (e) => x(m, e)), h("click", P, D), U(ne, () => c(d), (e) => x(d, e)), U(ie, () => c(f), (e) => x(f, e)), U(oe, () => c(p), (e) => x(p, e)), h("click", se, T), F(n, k), l();
}
p(["click"]);
//#endregion
//#region src/components/DetailPanel.svelte
var ua = P("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), da = P("<button type=\"button\" role=\"tab\"><!><span> </span></button>"), fa = P("<div class=\"content-section\"><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>AGENTS.md unavailable</strong><span> </span></div></div>"), pa = P("<div class=\"content-section\"><div class=\"file-modal-empty wiki-status\"><!><strong>Loading AGENTS.md...</strong></div></div>"), ma = P("<div class=\"content-section\"><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), ha = P("<div class=\"content-section\"><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), ga = P("<div class=\"details-header\"><h1 class=\"details-title\"> </h1></div> <div class=\"details-tabs\" role=\"tablist\" aria-label=\"Workspace details\"></div> <div id=\"detailsContent\" class=\"details-content\"><div><!></div> <div><!></div></div>", 1), _a = P("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), va = P("<code class=\"resource-ref-badge\"> </code>"), ya = P("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), ba = P("<button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button>"), xa = P("<div class=\"details-actions\"><!><!></div>"), Sa = P("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), Ca = P("<div><!></div>"), wa = P("<div class=\"content-section\"><div class=\"file-modal-empty detail-missing\"><!><strong>Project brief is missing</strong><span>project.md was not found in this project directory.</span></div></div>"), Ta = P("<div class=\"content-section\"><div class=\"file-modal-empty detail-missing\"><!><strong>Task brief is missing</strong><span>task.md was not found in this task directory.</span></div></div>"), Ea = P("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), Da = P("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), Oa = P("<div class=\"content-section\"><div class=\"template-list\"><!></div></div>"), ka = P("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), Aa = P("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), ja = P("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!> <!> <!> <div><!></div> <!> <div><!></div> <div><div class=\"content-section\"><div class=\"worktree-list\"><!></div></div></div></div>", 1), Ma = P("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!></nav> <h1 class=\"details-title\"> <!></h1><!></div> <!>", 1), Na = P("<!> <!> <!>", 1);
function Pa(i, a) {
	C(a, !0);
	let f = o(y(a.channel.current())), p = o(""), m = o(""), _ = o(y(/* @__PURE__ */ new Set())), v = o(null), T = o(null), E = /* @__PURE__ */ new Map(), D = new Qt(), O = 0, k = u(() => (c(f).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), A = u(() => new Set(c(k).map((e) => e.name))), M = u(() => c(f).workspaceAgents && !c(f).workspaceAgents.error ? {
		name: "AGENTS.md",
		path: c(f).workspaceAgents.path || "AGENTS.md",
		content: c(f).workspaceAgents.content || "",
		contentHash: c(f).workspaceAgents.contentHash
	} : null), N = u(z), P = u(() => c(v) ? `${c(v).section}:${c(v).path}` : "");
	H(() => a.channel.subscribe((e) => {
		let t = ie(), n = ++O;
		if (x(f, e, !0), e.identity !== c(p)) {
			c(p) && c(m) && E.set(c(p), c(m)), x(p, e.identity, !0), x(v, null), x(T, null), x(_, /* @__PURE__ */ new Set(), !0);
			let t = E.get(c(p));
			x(m, t && t !== "work" ? t : L(e), !0);
			let n = document.getElementById("detailsContent");
			n && (n.scrollTop = 0);
		} else c(N).length && !c(N).some((e) => e.id === c(m)) && x(m, c(N)[0].id, !0);
		d().then(() => {
			n === O && ae(t), e.onIconsChanged();
		});
	})), H(() => {
		let e = (e) => {
			e.key === "Escape" && (c(T) ? (e.preventDefault(), x(T, null)) : c(v) && (e.preventDefault(), x(v, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), R(() => D.dispose());
	function L(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "workspace" ? "agents" : e.resourceType === "scheduler" ? "schedules" : e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "history";
	}
	function z() {
		if (c(f).resourceType === "workspace") return [{
			id: "agents",
			label: "AGENTS.md",
			icon: "file-text"
		}, {
			id: "wiki",
			label: "Wiki",
			icon: "book-open"
		}];
		if (!c(f).detail) return [];
		if (c(f).resourceType === "scheduler") return [{
			id: "schedules",
			label: "Schedules",
			icon: "calendar-clock"
		}, {
			id: "context",
			label: "Context",
			icon: "file-text"
		}];
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
		}), e;
	}
	function B(e) {
		return e.name === "scheduler.md" ? "context" : e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : c(N).find((e) => ["project", "task"].includes(e.id))?.id || "";
	}
	function V(e) {
		x(m, e, !0), E.set(c(p), e);
	}
	function U(e) {
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function G(e) {
		let t = new Set(c(_));
		t.has(e) ? t.delete(e) : t.add(e), x(_, t, !0), queueMicrotask(c(f).onIconsChanged);
	}
	function K(e, t, n = !1) {
		let r = n ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(c(f).workspaceId)}/files/raw?path=${encodeURIComponent(t)}${r}`;
	}
	function ee(e, t) {
		x(v, {
			section: e,
			path: t
		}, !0);
	}
	function Y(e) {
		ee("Files", e);
	}
	function te(e) {
		let t = e.split("/").pop() || e;
		window.confirm(`Delete artifact "${t}"? This cannot be undone.`) && c(f).onDeleteArtifact(e).then(() => {
			c(v) && c(v).section === "Artifacts" && c(v).path === e && x(v, null);
		}).catch((e) => oe(e instanceof Error ? e.message : String(e)));
	}
	function ne(e, t, n) {
		return c(f).onSaveWorkspaceAgents(t, n);
	}
	function re(e) {
		return `${e.section}:${e.path}`;
	}
	function ie() {
		if (!c(v)) return null;
		let e = document.querySelector("[data-preview-scroll]");
		return e ? {
			key: re(c(v)),
			scrollTop: e.scrollTop,
			scrollLeft: e.scrollLeft
		} : null;
	}
	function ae(e) {
		if (!e || !c(v) || e.key !== re(c(v))) return;
		let t = document.querySelector("[data-preview-scroll]");
		t && (t.scrollTop = e.scrollTop, t.scrollLeft = e.scrollLeft);
	}
	function oe(e) {
		e && c(f).onToast(e);
	}
	var se = Na(), ce = b(se), le = (e) => {
		var n = ua(), r = t(n), i = t(r);
		W(i, {
			name: "folder-search",
			className: "empty-state-icon"
		}), S(2), w(r), w(n), F(e, n);
	}, ue = (e) => {
		var n = ga(), i = b(n), a = t(i), o = t(a, !0);
		w(a), w(i);
		var l = s(i, 2);
		J(l, 21, () => c(N), (e) => e.id, (e, n) => {
			var i = da();
			let a;
			var o = t(i);
			W(o, { get name() {
				return c(n).icon;
			} });
			var l = s(o), u = t(l, !0);
			w(l), w(i), g(() => {
				a = j(i, 1, "details-tab", null, a, { active: c(m) === c(n).id }), I(i, "aria-selected", c(m) === c(n).id), r(u, c(n).label);
			}), h("click", i, () => V(c(n).id)), F(e, i);
		}), w(l);
		var d = s(l, 2), p = t(d), v = t(p), y = (e) => {
			ia(e, {
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
				onSave: ne,
				get onToast() {
					return c(f).onToast;
				},
				get onIconsChanged() {
					return c(f).onIconsChanged;
				}
			});
		}, x = (e) => {
			var n = fa(), i = t(n), a = t(i);
			W(a, { name: "triangle-alert" });
			var o = s(a, 2), l = t(o, !0);
			w(o), w(i), w(n), g(() => r(l, c(f).workspaceAgents.error)), F(e, n);
		}, C = (e) => {
			var n = pa(), r = t(n), i = t(r);
			W(i, { name: "loader-circle" }), S(), w(r), w(n), F(e, n);
		};
		q(v, (e) => {
			c(M) ? e(y) : c(f).workspaceAgents?.error ? e(x, 1) : e(C, -1);
		}), w(p);
		var T = s(p, 2), E = t(T), D = (e) => {
			var n = ma(), i = t(n), a = t(i);
			W(a, { name: "triangle-alert" });
			var o = s(a, 2), l = t(o, !0);
			w(o), w(i), w(n), g(() => r(l, c(f).wiki.error)), F(e, n);
		}, O = (e) => {
			var n = ha(), r = t(n), i = t(r);
			W(i, { name: "book-open" }), S(2), w(r), w(n), F(e, n);
		}, k = (e) => {
			{
				let t = u(() => c(f).wiki.entries || []);
				Ln(e, {
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
					onPreview: ee,
					rawURL: K,
					showHeading: !1
				});
			}
		};
		q(E, (e) => {
			c(f).wiki?.error ? e(D) : c(f).wiki?.exists ? e(k, -1) : e(O, 1);
		}), w(T), w(d), g(() => {
			r(o, c(f).workspaceName), I(p, "hidden", c(m) !== "agents"), I(T, "hidden", c(m) !== "wiki");
		}), F(e, n);
	}, de = (i) => {
		var a = Ma(), o = b(a), l = t(o), d = t(l), p = t(d, !0);
		w(d);
		var v = s(d, 2), y = (e) => {
			var n = _a(), i = s(b(n)), a = t(i, !0);
			w(i), g(() => r(a, c(f).parent.title)), h("click", i, () => c(f).onNavigate(c(f).parent?.id || "workspace")), F(e, n);
		};
		q(v, (e) => {
			c(f).parent && e(y);
		}), w(l);
		var C = s(l, 2), E = t(C, !0), D = s(E), O = (e) => {
			var n = va(), i = t(n, !0);
			w(n), g((e) => r(i, e), [() => U(c(f).resourceId)]), F(e, n);
		};
		q(D, (e) => {
			c(f).resourceType !== "scheduler" && e(O);
		}), w(C);
		var M = s(C), L = (e) => {
			var n = xa(), r = t(n), i = (e) => {
				var n = ya(), r = t(n);
				W(r, { name: "plus" }), S(), w(n), h("click", n, () => c(f).onCreateTask(c(f).resourceId)), F(e, n);
			};
			q(r, (e) => {
				c(f).resourceType === "project" && e(i);
			});
			var a = s(r), o = (e) => {
				var n = ba(), r = t(n);
				W(r, { name: "archive" }), S(), w(n), h("click", n, () => c(f).onArchive(c(f).resourceId)), F(e, n);
			};
			q(a, (e) => {
				c(f).resourceType !== "scheduler" && e(o);
			}), w(n), F(e, n);
		};
		q(M, (e) => {
			c(f).detail && e(L);
		}), w(o);
		var R = s(o, 2), z = (e) => {
			var n = Sa(), r = t(n), i = t(r);
			W(i, {
				name: "loader-circle",
				className: "empty-state-icon"
			}), S(), w(r), w(n), F(e, n);
		}, H = (i) => {
			var a = ja(), o = b(a);
			J(o, 21, () => c(N), (e) => e.id, (e, n) => {
				var i = da();
				let a;
				var o = t(i);
				W(o, { get name() {
					return c(n).icon;
				} });
				var l = s(o), u = t(l, !0);
				w(l), w(i), g(() => {
					a = j(i, 1, "details-tab", null, a, { active: c(m) === c(n).id }), I(i, "aria-selected", c(m) === c(n).id), r(u, c(n).label);
				}), h("click", i, () => V(c(n).id)), F(e, i);
			}), w(o);
			var l = s(o, 2), d = t(l);
			J(d, 17, () => c(k), (e) => e.path || e.name, (e, n) => {
				var r = Ca(), i = t(r);
				{
					let e = u(() => !c(f).detail.archived);
					ia(i, {
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
						get onSave() {
							return c(f).onSaveMarkdownFile;
						},
						get onToast() {
							return c(f).onToast;
						},
						get onIconsChanged() {
							return c(f).onIconsChanged;
						}
					});
				}
				w(r), g((e) => I(r, "hidden", e), [() => c(m) !== B(c(n))]), F(e, r);
			});
			var p = s(d, 2), v = (e) => {
				var n = wa(), r = t(n), i = t(r);
				W(i, { name: "file-text" }), S(2), w(r), w(n), g(() => I(n, "hidden", c(m) !== "project")), F(e, n);
			}, y = u(() => c(f).resourceType === "project" && !c(A).has("project.md"));
			q(p, (e) => {
				c(y) && e(v);
			});
			var C = s(p, 2), E = (e) => {
				var n = Ta(), r = t(n), i = t(r);
				W(i, { name: "file-text" }), S(2), w(r), w(n), g(() => I(n, "hidden", c(m) !== "task")), F(e, n);
			}, D = u(() => c(f).resourceType === "task" && !c(A).has("task.md"));
			q(C, (e) => {
				c(D) && e(E);
			});
			var O = s(C, 2), M = (e) => {
				var n = Ca(), r = t(n);
				{
					let e = u(() => c(f).onRefreshScheduler || (async () => void 0));
					la(r, {
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
			q(O, (e) => {
				c(f).resourceType === "scheduler" && c(f).detail.scheduler && e(M);
			});
			var L = s(O, 2), R = t(L), z = (n) => {
				var i = Oa(), a = t(i), o = t(a), l = (n) => {
					var i = e(), a = b(i);
					J(a, 17, () => c(f).detail.templates, (e) => e.name, (e, n) => {
						var i = Ea();
						let a;
						var o = t(i);
						W(o, { name: "file-text" });
						var l = s(o), u = t(l), d = t(u, !0);
						w(u);
						var f = s(u), p = t(f);
						w(f), w(l);
						var m = s(l);
						W(m, { name: "chevron-right" }), w(i), g(() => {
							a = j(i, 1, "template-row", null, a, { invalid: !c(n).valid }), r(d, c(n).title || c(n).name), r(p, `${c(n).name ?? ""} · v${(c(n).schemaVersion || "?") ?? ""} · ${c(n).valid ? `${(c(n).fields || []).length} fields` : `invalid${c(n).errors?.[0]?.message ? `: ${c(n).errors[0].message}` : ""}`}${c(n).legacy ? " · legacy" : ""}`);
						}), h("click", i, () => c(n).path && ee("Templates", c(n).path)), F(e, i);
					}), F(n, i);
				}, u = (e) => {
					var n = Da(), r = t(n);
					W(r, { name: "layout-template" }), S(), w(n), F(e, n);
				};
				q(o, (e) => {
					c(f).detail.templates?.length ? e(l) : e(u, -1);
				}), w(a), w(i), F(n, i);
			};
			q(R, (e) => {
				c(f).resourceType === "project" && e(z);
			}), w(L);
			var H = s(L, 2), U = (t) => {
				var r = e(), i = b(r);
				n(i, () => c(f).identity, (e) => {
					{
						let t = u(() => c(f).detail.artifacts || []);
						$i(e, {
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
							onOpenLegacy: (e) => ee("Artifacts", e),
							get onIconsChanged() {
								return c(f).onIconsChanged;
							}
						});
					}
				}), F(t, r);
			};
			q(H, (e) => {
				c(m) === "history" && e(U);
			});
			var ne = s(H, 2), re = t(ne);
			{
				let e = u(() => c(f).detail.artifacts || []), t = u(() => c(f).detail.archived ? void 0 : te);
				Ln(re, {
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
					onPreview: ee,
					rawURL: K,
					get onDelete() {
						return c(t);
					},
					showHeading: !1
				});
			}
			w(ne);
			var ie = s(ne, 2), ae = t(ie), oe = t(ae), se = t(oe), ce = (n) => {
				var i = e(), a = b(i);
				J(a, 17, () => c(f).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, n) => {
					var i = ka(), a = t(i), o = t(a);
					W(o, {
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
					W(y, { name: "git-compare-arrows" }), S(), w(v), w(i), g(() => {
						r(d, c(n).branch || "HEAD"), r(p, `${(c(n).name || "repository") ?? ""}${c(n).targetBranch || c(n).baseBranch ? ` · base ${c(n).targetBranch || c(n).baseBranch}` : ""}`), r(_, c(n).worktreePath || "");
					}), h("click", v, () => x(T, c(n), !0)), F(e, i);
				}), F(n, i);
			}, le = (e) => {
				var n = Aa(), r = t(n);
				W(r, { name: "git-branch" }), S(), w(n), F(e, n);
			};
			q(se, (e) => {
				c(f).detail.repos?.length ? e(ce) : e(le, -1);
			}), w(oe), w(ae), w(ie), w(l), g(() => {
				I(L, "hidden", c(m) !== "template"), I(ne, "hidden", c(m) !== "artifacts"), I(ie, "hidden", c(m) !== "worktrees");
			}), F(i, a);
		};
		q(R, (e) => {
			c(f).loading || !c(f).detail ? e(z) : e(H, -1);
		}), g(() => {
			r(p, c(f).workspaceName), r(E, c(f).resourceTitle);
		}), h("click", d, () => c(f).onNavigate("workspace")), F(i, a);
	};
	q(ce, (e) => {
		c(f).workspaceId ? c(f).resourceType === "workspace" ? e(ue, 1) : e(de, -1) : e(le);
	});
	var fe = s(ce, 2);
	{
		let e = u(() => !c(f).detail?.archived && (c(f).resourceType === "project" || c(f).resourceType === "task"));
		Xn(fe, {
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
				return c(e);
			},
			get resolveResourceTitle() {
				return c(f).resolveResourceTitle;
			},
			get onNavigate() {
				return c(f).onNavigate;
			},
			onOpenFile: Y,
			get onSaveMarkdown() {
				return c(f).onSaveMarkdownFile;
			},
			onClose: () => x(v, null),
			onError: oe,
			get onIconsChanged() {
				return c(f).onIconsChanged;
			}
		});
	}
	sn(s(fe, 2), {
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
		onError: oe,
		get onIconsChanged() {
			return c(f).onIconsChanged;
		}
	}), F(i, se), l();
}
p(["click"]);
//#endregion
//#region src/components/generation-status.ts
var Fa = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"stopping",
	"recovering"
]), Ia = /* @__PURE__ */ new Set([
	"idle",
	"idle-suspended",
	"stopped",
	"failed",
	"archived"
]);
function La(e) {
	return String(e || "").trim();
}
function Ra(e, t) {
	let n = La(e.generation.status) || "unknown", r = t?.generation;
	if (!r || r.generationId !== e.generation.generationId) return n;
	let i = La(r.status);
	if (!t?.state) return i || n;
	switch (t.state) {
		case "working": return Fa.has(i) ? i : "running";
		case "attention_required": return i === "waiting_approval" ? i : "waiting_approval";
		case "idle": return Ia.has(i) ? i : "idle";
		case "archived": return "archived";
		case "unavailable": return i === "failed" || i === "recovering" ? i : "failed";
		default: return i || n;
	}
}
//#endregion
//#region src/components/EventTimeline.svelte
var za = P("<button type=\"button\"><span class=\"load-older-icon load-older-icon-idle\"><!></span><span class=\"load-older-icon load-older-icon-busy\"><!></span><span> </span></button>"), Ba = P("<div class=\"conversation-generation\"><span> </span><strong> </strong><small> </small></div>"), Va = P("<button type=\"button\" class=\"secondary-button\">Retry</button>"), Ha = P("<div class=\"conversation-gap\"><!><span><strong>History unavailable</strong><small> </small></span><!></div>"), Ua = P("<div class=\"turn-summary-preview\"> </div>"), Wa = P("<div><!></div>"), Ga = P("<div class=\"turn-loading\"><!><span>Loading turn details</span></div>"), Ka = P("<section><!> <!> <!> <!></section>"), qa = P("<!> <!>", 1), Ja = P("<div class=\"turn-working-indicator\" role=\"status\" aria-live=\"polite\" data-timeline-key=\"turn-working\"><!><span>working...</span></div>"), Ya = P("<div class=\"tty-empty\"><!><strong>Loading resource history</strong></div>"), Xa = P("<div class=\"tty-empty\"><!><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>"), Za = P("<!> <!> <!> <!> <!> <!> <!>", 1), Qa = P("<div class=\"tty-empty\"><!><strong>No resource selected</strong></div>"), $a = P("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div>");
function eo(e, n) {
	C(n, !0);
	let i = o(y(n.channel.current())), a = o(y(n.channel.current().project)), f = o(y(ie())), p = o(void 0), m, _ = null, v = !1, D = !1, O = /* @__PURE__ */ new Map(), k = o(y(/* @__PURE__ */ new Map()));
	H(() => {
		let e = G();
		m = new Zr({
			onEvent: (e, t, n) => c(i).onEvent(e, t, n),
			onNotice: (e, t, n) => c(i).onNotice(e, t, n)
		});
		let t = m.subscribe(A), r = n.channel.subscribe((e) => {
			let t = c(i).identity, n = Y(c(i).status) !== Y(e.status) && ee(G());
			x(i, e, !0), e.project !== c(a) && x(a, e.project, !0), e.identity !== t && (D = !0, _ = null, x(k, new Map(O.get(e.identity) ?? []), !0)), m?.activate(e.workspaceId, e.resourceId, e.status), d().then(() => {
				n && !K() && te(), e.onIconsChanged();
			});
		}), o = () => {
			if (!_ || K()) return;
			let e = _;
			_ = null, M(e);
		};
		return document.addEventListener("selectionchange", o), () => {
			t(), r(), document.removeEventListener("selectionchange", o), m?.dispose(), m = void 0, e && e.removeAttribute("data-agent-resource-id");
		};
	});
	function A(e) {
		if (c(f).identity && e.identity === c(f).identity && K()) {
			_ = e;
			return;
		}
		M(e);
	}
	function M(e) {
		let t = G();
		v = e.identity !== c(f).identity || D || ee(t), D = !1, x(f, e, !0), t && (t.dataset.agentResourceId = e.resourceId), d().then(() => {
			v && !K() && te(), c(i).onIconsChanged(), e.loaded && e.hasMoreBefore && R(e.identity);
		});
	}
	function N(e, t) {
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
			root: G(),
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
	function P(e) {
		return jr(e.events ? c(a)(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || []);
	}
	function L(e) {
		return e.generation.agentName || e.generation.resolvedProfile || e.generation.binding?.name || c(i).agentName || "Agent";
	}
	async function R(e) {
		let t = 0;
		for (; t < 16 && c(f).identity === e && c(f).hasMoreBefore;) {
			let e = G();
			if (!e || e.scrollHeight > e.clientHeight + 160 || K() || !await m?.loadOlder()) return;
			t++, await d(), te();
		}
	}
	async function z() {
		let e = G();
		if (!e || c(f).loadingOlder) return;
		let t = ne(e), n = t?.getBoundingClientRect().top ?? 0, r = e.scrollHeight, a = e.scrollTop, o = c(f).identity;
		await m?.loadOlder(), await d(), c(f).identity === o && (e.scrollTop = t?.isConnected ? a + (t.getBoundingClientRect().top - n) : a + (e.scrollHeight - r), c(i).onIconsChanged());
	}
	function B(e, t) {
		let n = re(e);
		x(k, new Map(c(k)).set(n, t), !0), O.set(c(f).identity, new Map(c(k))), t && V(e);
	}
	function V(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return m?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function U(e) {
		return c(k).get(re(e)) ?? !1;
	}
	function G() {
		return c(p)?.parentElement ?? null;
	}
	function K() {
		let e = G(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function ee(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function Y(e) {
		return e?.session?.state === "running" && !!e.session.currentTurnId;
	}
	function te() {
		let e = G();
		e && (e.scrollTop = e.scrollHeight);
	}
	function ne(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function re(e) {
		let t = e.kind === "tools" ? Gr(e) : String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event");
		return `${e.generationId || c(f).generationId}:${e.kind}:${t}`;
	}
	function ie() {
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
	var ae = $a(), oe = t(ae), se = (e) => {
		var n = Za(), a = b(n), o = (e) => {
			var n = za();
			let i;
			var a = t(n), o = t(a);
			W(o, { name: "chevrons-up" }), w(a);
			var l = s(a), u = t(l);
			W(u, { name: "loader-circle" }), w(l);
			var d = s(l), p = t(d, !0);
			w(d), w(n), g(() => {
				i = j(n, 1, "load-older-events", null, i, { busy: c(f).loadingOlder }), n.disabled = c(f).loadingOlder, r(p, c(f).loadingOlder ? "Loading..." : "Load older messages");
			}), h("click", n, z), F(e, n);
		};
		q(a, (e) => {
			c(f).hasMoreBefore && e(o);
		});
		var l = s(a, 2);
		J(l, 19, () => c(f).blocks, (e) => e.key, (e, n, a) => {
			var o = qa(), l = b(o), d = (e) => {
				var a = Ba(), o = t(a), l = t(o);
				w(o);
				var u = s(o), d = t(u, !0);
				w(u);
				var f = s(u), p = t(f, !0);
				w(f), w(a), g((e, t) => {
					I(a, "data-generation-id", c(n).generation.generationId), r(l, `Generation ${c(n).generation.generation ?? ""}`), r(d, c(n).generation.agentName || c(n).generation.resolvedProfile || c(n).generation.binding?.name || "Agent"), I(f, "data-generation-status", e), r(p, t);
				}, [() => Ra(c(n), c(i).status), () => Ra(c(n), c(i).status)]), F(e, a);
			};
			q(l, (e) => {
				(c(a) === 0 || c(f).blocks[c(a) - 1].generation.generationId !== c(n).generation.generationId) && e(d);
			});
			var p = s(l, 2), _ = (e) => {
				var i = Ha(), a = t(i);
				W(a, { name: "triangle-alert" });
				var o = s(a), l = s(t(o)), u = t(l, !0);
				w(l), w(o);
				var d = s(o), f = (e) => {
					var t = Va();
					h("click", t, () => m?.retryHistory()), F(e, t);
				};
				q(d, (e) => {
					c(n).gap?.retryable && e(f);
				}), w(i), g(() => {
					I(i, "data-timeline-key", c(n).key), r(u, c(n).gap?.message || "This generation could not be read.");
				}), F(e, i);
			}, v = (e) => {
				var a = Ka();
				let o;
				var l = t(a), d = (e) => {
					var i = Ua(), a = t(i, !0);
					w(i), g(() => r(a, c(n).turn.triggerPreview)), F(e, i);
				};
				q(l, (e) => {
					c(n).turn?.triggerPreview && !c(n).items && !c(n).events && e(d);
				});
				var p = s(l, 2);
				J(p, 17, () => P(c(n)), (e) => re(e), (e, r) => {
					var a = Wa(), o = t(a), s = (e) => {
						{
							let t = u(() => L(c(n)));
							Di(e, {
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
								}
							});
						}
					}, l = (e) => {
						bi(e, {
							get item() {
								return c(r);
							},
							onExpand: () => V(c(r))
						});
					}, d = (e) => {
						{
							let t = u(() => U(c(r)));
							Pi(e, {
								get item() {
									return c(r);
								},
								get generationId() {
									return c(n).generation.generationId;
								},
								get open() {
									return c(t);
								},
								onToggle: (e) => B(c(r), e)
							});
						}
					}, p = (e) => {
						ar(e, {
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
						vi(e, { get item() {
							return c(r);
						} });
					}, h = (e) => {
						{
							let t = u(() => c(r).text || "");
							ki(e, {
								title: "Provider error",
								get text() {
									return c(t);
								},
								error: !0
							});
						}
					}, _ = (e) => {
						Ii(e, { get item() {
							return c(r);
						} });
					};
					q(o, (e) => {
						c(r).kind === "message" ? e(s) : c(r).kind === "thinking" ? e(l, 1) : c(r).kind === "tools" ? e(d, 2) : c(r).kind === "approval" ? e(p, 3) : c(r).kind === "lifecycle" ? e(m, 4) : c(r).kind === "error" ? e(h, 5) : e(_, -1);
					}), w(a), g((e) => I(a, "data-timeline-key", e), [() => re(c(r))]), F(e, a);
				});
				var m = s(p, 2), h = (e) => {
					var n = Ga(), r = t(n);
					W(r, { name: "loader-circle" }), S(), w(n), F(e, n);
				};
				q(m, (e) => {
					c(n).loading && !c(n).items && !c(n).events && e(h);
				});
				var _ = s(m, 2), v = (e) => {
					ki(e, {
						title: "Turn unavailable",
						get text() {
							return c(n).error;
						},
						error: !0
					});
				};
				q(_, (e) => {
					c(n).error && e(v);
				}), w(a), T(a, (e, t) => N?.(e, t), () => c(n).turn?.reference || ""), g(() => {
					o = j(a, 1, "conversation-turn", null, o, { "conversation-turn-loading": c(n).loading }), I(a, "data-timeline-key", c(n).key);
				}), F(e, a);
			};
			q(p, (e) => {
				c(n).kind === "gap" ? e(_) : e(v, -1);
			}), F(e, o);
		});
		var d = s(l, 2);
		J(d, 19, () => c(f).notices, (e, t) => `notice:${c(f).identity}:${t}:${String(e.data?.text || "")}`, (e, n, r) => {
			var i = Wa(), a = t(i);
			{
				let e = u(() => String(c(n).data?.text || "")), t = u(() => c(n).data?.level === "error");
				ki(a, {
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
			ki(e, {
				title: "Timeline error",
				get text() {
					return c(f).error;
				},
				error: !0,
				alert: !0
			});
		};
		q(p, (e) => {
			c(f).error && e(_);
		});
		var v = s(p, 2), y = (e) => {
			var n = Ja(), r = t(n);
			W(r, { name: "loader-circle" }), S(), w(n), F(e, n);
		}, x = u(() => Y(c(i).status));
		q(v, (e) => {
			c(x) && e(y);
		});
		var C = s(v, 2), E = (e) => {
			var n = Ya(), r = t(n);
			W(r, { name: "loader-circle" }), S(), w(n), F(e, n);
		};
		q(C, (e) => {
			c(f).loading && !c(f).blocks.length && e(E);
		});
		var D = s(C, 2), O = (e) => {
			var n = Xa(), r = t(n);
			W(r, { name: "bot" }), S(2), w(n), F(e, n);
		}, k = u(() => c(f).loaded && !c(f).loading && !c(f).blocks.length && !c(f).notices.length && !Y(c(i).status));
		q(D, (e) => {
			c(k) && e(O);
		}), F(e, n);
	}, ce = (e) => {
		var n = Qa(), r = t(n);
		W(r, { name: "bot" }), S(), w(n), F(e, n);
	};
	q(oe, (e) => {
		c(f).resourceId ? e(se) : e(ce, -1);
	}), w(ae), E(ae, (e) => x(p, e), () => c(p)), g(() => I(ae, "data-chat-context", c(f).identity)), F(e, ae), l();
}
p(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function to() {
	return {
		kind: "profile",
		name: "default"
	};
}
function no(e) {
	return {
		tab: e.initialTab,
		workspacePath: "",
		createWorkspace: !1,
		userName: e.userName,
		endpoint: e.agentHub.configuredEndpoint || "http://127.0.0.1:4646",
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: {
			workspace: e.agentHub.resourceDefaults?.workspace ? { ...e.agentHub.resourceDefaults.workspace } : to(),
			project: e.agentHub.resourceDefaults?.project ? { ...e.agentHub.resourceDefaults.project } : to(),
			task: e.agentHub.resourceDefaults?.task ? { ...e.agentHub.resourceDefaults.task } : to()
		},
		newProfile: {
			key: "",
			description: "",
			agentName: e.agents[0]?.id || ""
		},
		dirty: !1
	};
}
function ro(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: {
			workspace: { ...e.resourceDefaults.workspace },
			project: { ...e.resourceDefaults.project },
			task: { ...e.resourceDefaults.task }
		},
		newProfile: { ...e.newProfile }
	};
}
function io(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var ao = P("<span class=\"settings-pill\"> </span>"), oo = P("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), so = P("<div class=\"settings-empty\">No AgentHub agents available.</div>"), co = P("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function lo(e, n) {
	C(n, !0);
	let i = N(n, "draft", 15), a = N(n, "pending", 15);
	async function o() {
		if (!(!i().dirty || a())) {
			a("agenthub");
			try {
				await n.onSaveAgentHub(ro(i())), i(i().dirty = !1, !0);
			} catch (e) {
				n.onToast(io(e));
			} finally {
				a("");
			}
		}
	}
	var u = co(), d = s(t(u), 2), f = t(d), p = s(t(f)), m = t(p, !0);
	w(p), w(f);
	var v = s(f, 2), y = s(t(v));
	O(y), w(v);
	var b = s(v, 2), x = t(b, !0);
	w(b);
	var T = s(b, 2);
	J(T, 21, () => n.agentHub.capabilities, _, (e, n) => {
		var i = ao(), a = t(i, !0);
		w(i), g(() => r(a, c(n))), F(e, i);
	}), w(T), w(d);
	var E = s(d, 2), D = t(E), k = s(t(D)), A = t(k);
	w(k), w(D);
	var M = s(D, 2);
	J(M, 21, () => n.agentHub.agents, (e) => e.name, (e, n) => {
		var i = oo(), a = t(i), o = t(a), l = t(o, !0);
		w(o);
		var u = s(o), d = t(u), f = t(d, !0);
		w(d);
		var p = s(d), m = t(p);
		w(p), w(u), w(a), w(i), g((e) => {
			r(l, e), r(f, c(n).name), r(m, `${(c(n).providerId || "") ?? ""} · ${(c(n).available === !1 ? c(n).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (c(n).name || "A").slice(0, 1).toUpperCase()]), F(e, i);
	}, (e) => {
		var t = so();
		F(e, t);
	}), w(M), w(E);
	var P = s(E, 2), I = t(P);
	let L;
	var R = t(I, !0);
	w(I);
	var z = s(I), B = t(z);
	W(B, { name: "save" }), S(), w(z), w(P), w(u), g((e) => {
		r(m, n.agentHub.connected && n.agentHub.compatible ? "Compatible" : n.agentHub.connected ? "Incompatible" : "Unavailable"), r(x, n.agentHub.error || `API ${n.agentHub.apiVersion || "unknown"} · AgentHub ${n.agentHub.version || "unknown"}`), r(A, `${n.agentHub.agents.length ?? ""} agents · ${n.agentHub.providers.length ?? ""} providers`), L = j(I, 1, "settings-save-hint", null, L, { visible: i().dirty }), r(R, i().dirty ? "Unsaved changes" : ""), z.disabled = e;
	}, [() => !i().dirty || !!a()]), h("input", y, function(...e) {
		n.onDirty?.apply(this, e);
	}), U(y, () => i().endpoint, (e) => i(i().endpoint = e, !0)), h("click", z, o), F(e, u), l();
}
p(["input", "click"]);
//#endregion
//#region src/components/AppearanceSettingsPanel.svelte
var uo = f("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), fo = f("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), po = f("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"80\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-strong\" x=\"40\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect><rect class=\"d-outline\" x=\"74\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect></svg>"), mo = f("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-light\" x=\"6\" y=\"8\" width=\"70\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"82\" y=\"8\" width=\"32\" height=\"56\" rx=\"3\"></rect></svg>"), ho = P("<button type=\"button\" role=\"radio\"><span class=\"layout-diagram\"><!></span> <span class=\"layout-option-text\"><strong> </strong><small> </small></span></button>"), go = P("<div class=\"font-scale-row\"><span class=\"font-scale-label\"> </span> <input type=\"range\" min=\"80\" max=\"140\" step=\"5\"/> <span class=\"font-scale-value\"> </span></div>"), _o = P("<div class=\"settings-panel\" data-component-owner=\"appearance-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Appearance</h2><p>Choose the workspace layout and the text size of each column. Everything applies immediately and is stored only in this browser.</p></div> <section class=\"appearance-section\" aria-label=\"Layout\"><div class=\"settings-section-heading\"><h3>Layout</h3></div> <div class=\"layout-options\" role=\"radiogroup\" aria-label=\"Workspace layout\"></div></section> <section class=\"appearance-section\" aria-label=\"Text size\"><div class=\"settings-section-heading\"><h3>Text size</h3><button type=\"button\" class=\"appearance-reset\"><!><span>Reset</span></button></div> <div class=\"font-scale-rows\"></div> <small class=\"appearance-hint\">Scales the text of each column independently from 80% to 140%.</small></section></div>");
function vo(e, n) {
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
	var f = _o(), p = s(t(f), 2), m = s(t(p), 2);
	J(m, 21, () => i, (e) => e.id, (e, i) => {
		var a = ho();
		let o;
		var l = t(a), u = t(l), d = (e) => {
			var t = uo();
			F(e, t);
		}, f = (e) => {
			var t = fo();
			F(e, t);
		}, p = (e) => {
			var t = po();
			F(e, t);
		}, m = (e) => {
			var t = mo();
			F(e, t);
		};
		q(u, (e) => {
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
	W(b, { name: "rotate-ccw" }), S(), w(y), w(v);
	var x = s(v, 2);
	J(x, 21, () => a, (e) => e.id, (e, i) => {
		var a = go(), l = t(a), u = t(l, !0);
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
var yo = P("<small class=\"settings-notification-help\"> </small>"), bo = P("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function xo(e, n) {
	C(n, !0);
	var i = bo(), a = s(t(i), 2), o = t(a), c = s(t(o), 2);
	O(c), w(o);
	var u = s(o, 2), d = (e) => {
		var i = yo(), a = t(i, !0);
		w(i), g(() => r(a, n.notifications.permissionError)), F(e, i);
	};
	q(u, (e) => {
		n.notifications.permissionError && e(d);
	}), w(a);
	var f = s(a, 2), p = t(f), m = s(t(p), 2);
	O(m), w(p);
	var _ = s(p, 2), v = t(_, !0);
	w(_), w(f), w(i), g(() => {
		G(c, n.notifications.browser), G(m, n.notifications.sound), r(v, n.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), h("change", c, (e) => n.onBrowserNotifications(e.currentTarget.checked)), h("change", m, (e) => n.onCompletionSound(e.currentTarget.checked)), F(e, i), l();
}
p(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var So = P("<label><span> </span><!></label>"), Co = P("<option> </option>"), wo = P("<span class=\"settings-profile-system-label\">System</span>"), To = P("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), Eo = P("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), Do = P("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>New Resource Defaults</h3><span>Applied once at creation</span></div> <div class=\"settings-resource-defaults\"></div> <p class=\"settings-resource-default-note\">Existing resources keep their explicit binding. Changing a profile route replaces its referenced resource generations at a safe turn boundary.</p></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function Oo(e, n) {
	C(n, !0);
	let i = N(n, "draft", 15), a = N(n, "pending", 15), o = /* @__PURE__ */ new Set([
		"default",
		"fast",
		"reasoning"
	]);
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
	function v(e, t) {
		i(i().resourceDefaults[e] = t, !0), n.onDirty();
	}
	async function y() {
		if (!(!i().dirty || a())) {
			a("agenthub");
			try {
				await n.onSaveAgentHub(ro(i())), i(i().dirty = !1, !0);
			} catch (e) {
				n.onToast(io(e));
			} finally {
				a("");
			}
		}
	}
	var b = Do(), x = s(t(b), 2), T = s(t(x), 2);
	J(T, 20, () => [
		["workspace", "Workspace"],
		["project", "Project"],
		["task", "Task"]
	], _, (e, a) => {
		let o = u(() => a[0]);
		var l = So(), d = t(l), f = t(d, !0);
		w(d);
		var p = s(d);
		{
			let e = u(() => `${a[1]} default binding`);
			Qe(p, {
				get value() {
					return i().resourceDefaults[c(o)];
				},
				get profiles() {
					return i().profiles;
				},
				get agents() {
					return n.agents;
				},
				openUp: !1,
				get ariaLabel() {
					return c(e);
				},
				onSelect: (e) => v(c(o), e)
			});
		}
		w(l), g(() => r(f, a[1])), F(e, l);
	}), w(T), S(2), w(x);
	var E = s(x, 2), D = t(E), M = s(t(D)), P = t(M);
	w(M), w(D);
	var I = s(D, 2), R = s(t(I), 2);
	J(R, 17, () => i().profiles, _, (e, n, i) => {
		let a = u(() => o.has(c(n).key.trim().toLowerCase()));
		var l = Eo();
		let f;
		var v = t(l);
		O(v);
		var y = s(v, 2);
		O(y);
		var b = s(y, 2);
		J(b, 21, () => m(c(n).agentName), _, (e, n) => {
			var i = Co(), a = t(i, !0);
			w(i);
			var o = {};
			g(() => {
				r(a, c(n).label), o !== (o = c(n).id) && (i.value = (i.__value = c(n).id) ?? "");
			}), F(e, i);
		}), w(b);
		var x;
		B(b);
		var S = s(b, 2), C = (e) => {
			var t = wo();
			F(e, t);
		}, T = (e) => {
			var n = To(), r = t(n);
			W(r, { name: "trash-2" }), w(n), h("click", n, () => p(i)), F(e, n);
		};
		q(S, (e) => {
			c(a) ? e(C) : e(T, -1);
		}), w(l), g(() => {
			f = j(l, 1, "settings-profile-row", null, f, { "settings-profile-system": c(a) }), k(v, c(n).key), v.disabled = c(a), k(y, c(n).description), y.disabled = c(a), x !== (x = c(n).agentName) && (b.value = (b.__value = c(n).agentName) ?? "", L(b, c(n).agentName));
		}), h("input", v, (e) => d(i, "key", e.currentTarget.value)), h("input", y, (e) => d(i, "description", e.currentTarget.value)), h("change", b, (e) => d(i, "agentName", e.currentTarget.value)), F(e, l);
	});
	var z = s(R, 2), V = t(z);
	O(V);
	var H = s(V, 2);
	O(H);
	var G = s(H, 2);
	J(G, 21, () => n.agents, _, (e, n) => {
		var i = Co(), a = t(i, !0);
		w(i);
		var o = {};
		g(() => {
			r(a, c(n).label), o !== (o = c(n).id) && (i.value = (i.__value = c(n).id) ?? "");
		}), F(e, i);
	}), w(G);
	var K = s(G, 2), ee = t(K);
	W(ee, { name: "plus" }), S(), w(K), w(z), w(I), w(E);
	var Y = s(E, 2), te = t(Y);
	let ne;
	var re = t(te, !0);
	w(te);
	var ie = s(te), ae = t(ie);
	W(ae, { name: "save" }), S(), w(ie), w(Y), w(b), g((e) => {
		r(P, `${i().profiles.length ?? ""} routes`), G.disabled = !n.agents.length, K.disabled = !n.agents.length, ne = j(te, 1, "settings-save-hint", null, ne, { visible: i().dirty }), r(re, i().dirty ? "Unsaved changes" : ""), ie.disabled = e;
	}, [() => !i().dirty || !!a()]), U(V, () => i().newProfile.key, (e) => i(i().newProfile.key = e, !0)), U(H, () => i().newProfile.description, (e) => i(i().newProfile.description = e, !0)), A(G, () => i().newProfile.agentName, (e) => i(i().newProfile.agentName = e, !0)), h("click", K, f), h("click", ie, y), F(e, b), l();
}
p([
	"input",
	"change",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var ko = P("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), Ao = P("<button type=\"button\"><!> <span> </span> <!></button>"), jo = P("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function Mo(e, n) {
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
	var a = jo(), o = s(t(a), 2);
	J(o, 17, () => i, (e) => e.id, (e, i) => {
		var a = Ao();
		let o;
		var l = t(a);
		W(l, { get name() {
			return c(i).icon;
		} });
		var u = s(l, 2), d = t(u, !0);
		w(u);
		var f = s(u, 2), p = (e) => {
			var t = ko();
			F(e, t);
		};
		q(f, (e) => {
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
var No = P("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function Po(e, n) {
	C(n, !0);
	let r = N(n, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n.onUserNameInput(await n.onSaveUser(n.userName));
			} catch (e) {
				n.onToast(io(e));
			} finally {
				r("");
			}
		}
	}
	var o = No(), c = s(t(o), 2), u = t(c), d = s(t(u), 2);
	O(d), S(2), w(u);
	var f = s(u, 2), p = t(f), m = t(p);
	W(m, { name: "save" }), S(), w(p), w(f), w(c), w(o), g(() => {
		k(d, n.userName), p.disabled = r() === "user";
	}), a("submit", c, i), h("input", d, (e) => n.onUserNameInput(e.currentTarget.value)), F(e, o), l();
}
p(["input"]);
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var Fo = P("<span class=\"settings-pill\">Active</span>"), Io = P("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), Lo = P("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Ro = P("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), zo = P("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Bo = P("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function Vo(e, n) {
	C(n, !0);
	let i = N(n, "draft", 15), d = N(n, "pending", 15), f = o("");
	async function p(e) {
		if (e.preventDefault(), !(!i().workspacePath.trim() || d())) {
			d("workspace");
			try {
				await n.onAddWorkspace(ro(i())), i(i().workspacePath = "", !0), i(i().createWorkspace = !1, !0);
			} catch (e) {
				n.onToast(io(e));
			} finally {
				d("");
			}
		}
	}
	async function m(e) {
		if (!d()) {
			d(`remove:${e}`);
			try {
				await n.onRemoveWorkspace(e, ro(i()));
			} catch (e) {
				n.onToast(io(e));
			} finally {
				d("");
			}
		}
	}
	async function _(e, t) {
		if (!d()) {
			d(`icon:${e}`), x(f, "");
			try {
				await n.onWorkspaceIcon(e, t, ro(i()));
			} catch (e) {
				n.onToast(io(e));
			} finally {
				d("");
			}
		}
	}
	function v(e) {
		let t = n.workspaces.find((t) => t.id === e);
		return n.workspaceIcons.find((e) => e.id === (t?.icon || "")) || n.workspaceIcons[0];
	}
	var y = Bo(), b = s(t(y), 2), T = t(b);
	O(T);
	var E = s(T, 2), D = t(E);
	O(D), S(2), w(E);
	var k = s(E, 2), A = t(k);
	W(A, { name: "plus" });
	var M = s(A), P = t(M, !0);
	w(M), w(k), w(b);
	var L = s(b, 2);
	J(L, 21, () => n.workspaces, (e) => e.id, (e, i) => {
		let a = u(() => v(c(i).id));
		var o = Ro(), l = t(o), p = t(l), y = t(p), b = t(y);
		w(y);
		var S = s(y, 2), C = t(S), T = t(C, !0);
		w(C);
		var E = s(C), D = t(E, !0);
		w(E), w(S), w(p);
		var O = s(p, 2), k = t(O), A = (e) => {
			var t = Fo();
			F(e, t);
		};
		q(k, (e) => {
			c(i).id === n.activeWorkspaceId && e(A);
		});
		var M = s(k, 2), N = t(M), P = s(N, 2), L = t(P, !0);
		w(P);
		var R = s(P, 2);
		W(R, { name: "chevron-down" }), w(M);
		var z = s(M, 2), B = t(z);
		W(B, { name: "trash-2" }), w(z), w(O), w(l);
		var V = s(l, 2), H = (e) => {
			var o = Lo();
			J(o, 21, () => n.workspaceIcons, (e) => e.id, (e, n) => {
				var o = Io();
				let l;
				var u = t(o), d = s(u), f = t(d, !0);
				w(d);
				var p = s(d), m = (e) => {
					W(e, { name: "check" });
				};
				q(p, (e) => {
					c(n).id === c(a).id && e(m);
				}), w(o), g(() => {
					I(o, "aria-checked", c(n).id === c(a).id), I(o, "title", c(n).label), l = j(o, 1, "", null, l, { selected: c(n).id === c(a).id }), I(u, "src", c(n).src), r(f, c(n).label);
				}), h("click", o, () => _(c(i).id, c(n).id)), F(e, o);
			}), w(o), g(() => I(o, "aria-label", `Icon for ${c(i).name}`)), F(e, o);
		};
		q(V, (e) => {
			c(f) === c(i).id && e(H);
		}), w(o), g((e, t) => {
			I(b, "src", c(a).src), r(T, c(i).name), r(D, c(i).path), I(M, "aria-expanded", c(f) === c(i).id), M.disabled = e, I(N, "src", c(a).src), r(L, d() === `icon:${c(i).id}` ? "Saving..." : c(a).label), z.disabled = t;
		}, [() => !!d(), () => !!d()]), h("click", M, () => x(f, c(f) === c(i).id ? "" : c(i).id, !0)), h("click", z, () => m(c(i).id)), F(e, o);
	}, (e) => {
		var t = zo();
		F(e, t);
	}), w(L), w(y), g((e) => {
		k.disabled = e, r(P, i().createWorkspace ? "Create" : "Add");
	}, [() => !!d()]), a("submit", b, p), U(T, () => i().workspacePath, (e) => i(i().workspacePath = e, !0)), z(D, () => i().createWorkspace, (e) => i(i().createWorkspace = e, !0)), F(e, y), l();
}
p(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var Ho = P("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function Uo(n, r) {
	C(r, !0);
	let i = o(y(r.channel.current())), a = o(""), u = o(-1), d = o(y(no(c(i)))), f = o(y(c(i).userName)), p = o("");
	H(() => r.channel.subscribe((e) => {
		let t = c(i);
		if (x(i, e, !0), e.identity !== c(a)) x(a, e.identity, !0), x(u, e.dataVersion, !0), x(d, no(e), !0), x(f, e.userName, !0), x(p, "");
		else if (e.dataVersion !== c(u) && !c(d).dirty) {
			let n = c(d).tab, r = c(f) !== t.userName;
			x(u, e.dataVersion, !0), x(d, no(e), !0), c(d).tab = n, r ? c(d).userName = c(f) : x(f, e.userName, !0);
		}
		queueMicrotask(e.onIconsChanged);
	})), H(() => {
		let e = (e) => {
			c(i).open && e.key === "Escape" && (e.preventDefault(), c(i).onClose(c(d).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function m() {
		c(d).dirty = !0;
	}
	var g = e(), _ = b(g), v = (e) => {
		var n = Ho(), r = b(n), a = s(r, 2), o = t(a);
		Mo(o, {
			get activeTab() {
				return c(d).tab;
			},
			get dirty() {
				return c(d).dirty;
			},
			onSelect: (e) => c(d).tab = e
		});
		var l = s(o, 2), u = t(l), g = t(u);
		W(g, { name: "x" }), w(u);
		var _ = s(u, 2), v = (e) => {
			Vo(e, {
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
			Po(e, {
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
			vo(e, {
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
			lo(e, {
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
			Oo(e, {
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
			xo(e, {
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
		q(_, (e) => {
			c(d).tab === "workspace" ? e(v) : c(d).tab === "user" ? e(y, 1) : c(d).tab === "appearance" ? e(S, 2) : c(d).tab === "agenthub" ? e(C, 3) : c(d).tab === "profiles" ? e(T, 4) : e(E, -1);
		}), w(l), w(a), h("click", r, () => c(i).onClose(c(d).dirty)), h("click", u, () => c(i).onClose(c(d).dirty)), F(e, n);
	};
	q(_, (e) => {
		c(i).open && e(v);
	}), F(n, g), l();
}
p(["click"]);
//#endregion
//#region src/components/Toast.svelte
var Wo = P("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function Go(e, n) {
	C(n, !0);
	let i = o(y(n.channel.current())), a = o(!1), s = null;
	H(() => {
		let e = n.channel.subscribe((e) => {
			x(i, e, !0), x(a, !!e.message, !0), s !== null && window.clearTimeout(s), c(a) && (s = window.setTimeout(() => {
				x(a, !1), s = null;
			}, 2800));
		});
		return () => {
			e(), s !== null && window.clearTimeout(s);
		};
	});
	var u = Wo(), d = t(u, !0);
	w(u), g(() => {
		I(u, "hidden", !c(a)), r(d, c(i).message);
	}), F(e, u), l();
}
//#endregion
//#region src/components/UploadDialog.svelte
var Ko = P("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), qo = P("<small class=\"upload-result-path\"> </small>"), Jo = P("<small class=\"upload-error\"> </small>"), Yo = P("<div><div class=\"upload-item-heading\"><span class=\"upload-item-status-icon\"><span class=\"upload-item-status upload-item-status-queued\"><!></span><span class=\"upload-item-status upload-item-status-uploading\"><!></span><span class=\"upload-item-status upload-item-status-success\"><!></span><span class=\"upload-item-status upload-item-status-error\"><!></span></span><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), Xo = P("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this resource's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function Zo(n, i) {
	C(i, !0);
	let d = o(y(i.channel.current())), f = o(""), p = o(y([])), m = 1, _ = o(void 0), v = /* @__PURE__ */ new Map(), T = u(() => c(p).some((e) => e.status === "queued" || e.status === "uploading")), D = u(() => c(p).filter((e) => e.status === "success").length), O = u(() => c(p).filter((e) => e.status === "error").length);
	H(() => {
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
	function V(e) {
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
	var U = e(), G = b(U), K = (e) => {
		var n = Xo(), i = t(n), o = s(i, 2), l = t(o), d = s(t(l), 2), f = t(d);
		W(f, { name: "x" }), w(d), w(l);
		var m = s(l, 2), v = t(m);
		E(v, (e) => x(_, e), () => c(_));
		var y = s(v, 2), b = t(y);
		W(b, { name: "clipboard-paste" });
		var C = s(b, 4), k = t(C);
		W(k, { name: "folder-open" }), S(), w(C), w(y);
		var A = s(y, 2), N = t(A), L = (e) => {
			var t = Ko();
			F(e, t);
		};
		q(N, (e) => {
			c(p).length || e(L);
		});
		var R = s(N, 2);
		J(R, 17, () => c(p), (e) => e.id, (e, n) => {
			let i = u(() => V(c(n)));
			var a = Yo();
			let o;
			var l = t(a), d = t(l), f = t(d), p = t(f);
			W(p, { name: "clock-3" }), w(f);
			var m = s(f), h = t(m);
			W(h, { name: "loader-circle" }), w(m);
			var _ = s(m), v = t(_);
			W(v, { name: "circle-check" }), w(_);
			var y = s(_), b = t(y);
			W(b, { name: "triangle-alert" }), w(y), w(d);
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
				var i = qo(), a = t(i, !0);
				w(i), g(() => r(a, c(n).path)), F(e, i);
			};
			q(P, (e) => {
				c(n).status === "success" && e(L);
			});
			var R = s(P, 2), z = (e) => {
				var i = Jo(), a = t(i, !0);
				w(i), g(() => r(a, c(n).error || "Upload failed")), F(e, i);
			};
			q(R, (e) => {
				c(n).status === "error" && e(z);
			}), w(a), g((e) => {
				o = j(a, 1, "upload-item", null, o, {
					"upload-item-success": c(n).status === "success",
					"upload-item-error": c(n).status === "error",
					"upload-item-uploading": c(n).status === "uploading"
				}), r(C, c(n).name), r(E, e), r(O, c(i).label), I(k, "aria-label", c(n).name), I(k, "aria-valuenow", c(n).progress), N = M(A, "", N, { width: `${c(n).progress}%` });
			}, [() => B(c(n).size)]), F(e, a);
		}), w(A), w(m);
		var H = s(m, 2), U = t(H), G = t(U, !0);
		w(U);
		var K = s(U, 2);
		w(H), w(o), w(n), g(() => {
			d.disabled = c(T), r(G, c(T) ? "Wait for uploads to finish before closing." : c(p).length ? `${c(D)} uploaded${c(O) ? ` · ${c(O)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), K.disabled = c(T);
		}), h("click", i, z), h("click", d, z), h("change", v, () => c(_).files && P(c(_).files)), a("dragover", y, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), a("dragleave", y, (e) => e.currentTarget.classList.remove("dragging")), a("drop", y, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && P(e.dataTransfer.files);
		}), h("keydown", y, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), c(_).click());
		}), h("click", C, () => c(_).click()), h("click", K, z), F(e, n);
	};
	q(G, (e) => {
		c(d).open && e(K);
	}), F(n, U), l();
}
p([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var Qo = P("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div>", 1);
function $o(e, n) {
	C(n, !0);
	var r = Qo(), i = b(r);
	Be(i, {
		get channel() {
			return n.channels.appShell;
		},
		details: (e) => {
			Pa(e, { get channel() {
				return n.channels.detail;
			} });
		},
		timeline: (e) => {
			eo(e, { get channel() {
				return n.channels.timeline;
			} });
		},
		composer: (e) => {
			st(e, { get channel() {
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
	Go(t(a), { get channel() {
		return n.channels.toast;
	} }), w(a);
	var o = s(a, 2);
	Zo(t(o), { get channel() {
		return n.channels.upload;
	} }), w(o);
	var c = s(o, 2);
	Jt(t(c), { get channel() {
		return n.channels.create;
	} }), w(c);
	var u = s(c, 2);
	Uo(t(u), { get channel() {
		return n.channels.settings;
	} }), w(u), F(e, r), l();
}
//#endregion
//#region src/components/model-channel.ts
function es(e) {
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
//#region src/app-channels.ts
var Z = () => void 0, ts = async () => void 0;
function ns() {
	return {
		appShell: es({
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
			onSwitchWorkspace: ts,
			onAddWorkspace: Z,
			onCreateProject: Z,
			onOpenSettings: Z,
			onRefreshDoctor: ts,
			onToggleProject: ts,
			onSelectResource: ts,
			onReorder: ts,
			onDragState: Z,
			onToggleAttention: ts,
			onDismissAttention: ts,
			onPanePreview: Z,
			onPaneCommit: Z,
			onPaneViewport: Z,
			onMobileSidebar: Z,
			onMobileView: Z,
			onMobileImmersive: Z,
			onToast: Z,
			onIconsChanged: Z,
			onHistoryNavigation: ts
		}),
		create: es({
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
			onPreview: ts,
			onSubmit: ts,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: () => !0,
			onIconsChanged: Z
		}),
		settings: es({
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
				agents: [],
				resourceDefaults: {
					workspace: {
						kind: "profile",
						name: "default"
					},
					project: {
						kind: "profile",
						name: "default"
					},
					task: {
						kind: "profile",
						name: "default"
					}
				}
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
			onAddWorkspace: ts,
			onRemoveWorkspace: ts,
			onWorkspaceIcon: ts,
			onSaveUser: async (e) => e,
			onSaveAgentHub: ts,
			onLayoutPreference: Z,
			onFontScale: Z,
			onResetFontScales: Z,
			onBrowserNotifications: Z,
			onCompletionSound: Z,
			onToast: Z,
			onIconsChanged: Z
		}),
		upload: es({
			open: !1,
			identity: "",
			workspaceId: "",
			resourceId: "",
			onDone: Z,
			onIconsChanged: Z
		}),
		composer: es({
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
			onDismissStopNotice: Z,
			onSteerWaiting: ts,
			onSaveAgentBinding: ts,
			onIconsChanged: Z
		}),
		detail: es({
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
			onDeleteArtifact: ts,
			onSaveAgentBinding: ts,
			onToast: Z,
			onIconsChanged: Z
		}),
		timeline: es({
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
			onApproval: ts,
			onToast: Z,
			onIconsChanged: Z
		}),
		agentHeader: es({
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
		toast: es({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var rs = "forge.gui.agentDraft.v2", is = 2, as = 50, os = 7776e6;
function ss(e) {
	return encodeURIComponent(String(e || "").trim());
}
function cs(e) {
	return String(e || "").trim() || "workspace";
}
function ls(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? as, r = e.maxAgeMs ?? os;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function a(e, t) {
		let n = String(e || "").trim(), r = cs(t);
		return !n || !r ? "" : `${rs}.resource.${ss(n)}.${ss(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== is || typeof t.text != "string" ? null : {
				version: is,
				text: t.text,
				updatedAt: Number(t.updatedAt) || 0,
				workspaceId: String(t.workspaceId || ""),
				resourceId: cs(t.resourceId),
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
				version: is,
				text: n,
				updatedAt: t(),
				workspaceId: r.workspaceId,
				resourceId: cs(r.resourceId),
				generationId: String(r.generationId || "") || void 0
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = cs(a);
		if (!c || !u) return;
		let f = `${rs}.resource.${ss(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || cs(n.resourceId) !== d || o.has(t))) {
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
function us(e) {
	let t = ls(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForResource(r, cs(n));
	}
	function i(e, t) {
		let r = /* @__PURE__ */ new Set();
		return n.ttyDraftWorkspaceId === e && n.ttyDraftResourceId === t && n.ttyDraftKey && r.add(n.ttyDraftKey), r;
	}
	function a(r = e.workspaceId(), a = n.ttyDraftResourceId) {
		let o = r.trim(), s = cs(a);
		o && t.prune(o, s, i(o, s));
	}
	function o() {
		if (!n.ttyDraftKey) return;
		let e = {
			workspaceId: n.ttyDraftWorkspaceId,
			resourceId: n.ttyDraftResourceId
		};
		t.write(n.ttyDraftKey, n.ttyDraft, e), a(e.workspaceId, e.resourceId);
	}
	function s(e, t = !0) {
		let r = String(e ?? "");
		n.ttyDraft !== r && (n.ttyDraft = r, n.ttyDraftVersion++), n.ttyMultiline = r.includes("\n"), t && o();
	}
	function c() {
		n.ttyDraft = "", n.ttyMultiline = !1, n.ttyDraftKey = "", n.ttyDraftWorkspaceId = "", n.ttyDraftResourceId = "", n.ttyDraftVersion++;
	}
	function l(i, o = e.workspaceId(), s = "") {
		let l = cs(i), u = r(l, o);
		if (!u) return c();
		n.ttyDraftKey !== u && (n.ttyDraftKey = u, n.ttyDraftWorkspaceId = o.trim(), n.ttyDraftResourceId = l, n.ttyDraft = t.read(u), n.ttyMultiline = n.ttyDraft.includes("\n"), n.ttyDraftVersion++, a(n.ttyDraftWorkspaceId, n.ttyDraftResourceId));
	}
	function u(r) {
		return e.workspaceId() !== r.workspaceId || n.ttyDraftResourceId !== cs(r.resourceId) || n.ttyDraftKey !== r.key || n.ttyDraft !== r.text || n.ttyDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
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
function ds(e) {
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
function fs(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function ps(e) {
	let t = String(e?.id || "").trim();
	if (!t) throw Error("The created resource did not return an id.");
	return t;
}
function ms(e) {
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
function hs(e) {
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
function gs(e) {
	let t = 0, n = ms(t), r = 0, i = null, a = "";
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
			previewRequestKey: (e) => JSON.stringify(hs({
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
			...ms(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = ms(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = hs({
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
			n.previewError = fs(e);
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
			if (n.type === "project") r = ps(await e.request(`/api/workspaces/${i}/projects`, {
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
					t = hs(n);
				}
				r = ps(await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				})), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1;
			let s = ++t;
			n.identity = s, await e.reloadTree(), i === e.workspaceId() && n.identity === s && await e.selectResource(r);
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(fs(t)));
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
function _s(e, t) {
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
function vs() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function ys(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.generationId}`;
}
function bs(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function xs(e) {
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
		if (!(!e.settings().browser || vs() !== "granted")) try {
			let n = new window.Notification(ys(t), {
				body: bs(t),
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
		n.browser && vs() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = vs();
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
			permission: vs(),
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
var Ss = "forge.gui.notifications.v1", Cs = `${Ss}.settings`;
function ws(e) {
	return e && typeof e == "object" ? e : null;
}
function Ts(e) {
	let t = ws(e);
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
function Es() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function Ds(e) {
	let t = ws(e);
	if (!t || t.version !== 1) return Es();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = ws(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(Ts).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(Ts).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = ws(e);
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
function Os(e) {
	let t = e.trim();
	return t ? `${Ss}.state.${encodeURIComponent(t)}` : "";
}
function ks(e) {
	function t(t) {
		let n = Os(t);
		if (!e || !n) return Es();
		try {
			let t = e.getItem(n);
			if (!t) return Es();
			let r = Ds(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return Es();
		}
	}
	function n(t, n) {
		let r = Ds(n), i = Os(t);
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
			let t = ws(JSON.parse(e.getItem(Cs) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(Cs);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(Cs, JSON.stringify({
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
function As(e) {
	let t = String(e.completionMarker || "").trim();
	if (t) return t;
	let n = String(e.generationId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function js(e) {
	return String(e.generationId || e.id || "").trim();
}
function Ms(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function Ns(e, t) {
	let n = String(e.resourceId || "").trim(), r = t.findResource(n), i = js(e);
	return !n || !i ? null : Ts({
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
function Ps(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function Fs(e) {
	let t = ks(Ps(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= Es(), n.store;
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
			a.request(`forge.gui.notification.${n.workspaceId}.${d(e, t)}`, { ifAvailable: !0 }, (e) => {
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
	let g = xs({
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
			let r = new t(`${Ss}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), vs() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
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
			let n = Ts(t.record);
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
		let a = As(t);
		if (!a || !n.workspaceId) return !1;
		let s = Ns(t, {
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
		for (let t of e) As(t) && x(t, t.completionState || "");
	}
	function C(e, t) {
		let n = Ms(e);
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
			r.key === Os(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.refreshIcons()), r.key === Cs && (n.settings = t.readSettings(), vs() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
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
var Is = "forge.gui.paneSizes", Ls = "forge.gui.mobileImmersive", Rs = "forge.gui.layoutPreference", zs = "forge.gui.fontScales", Bs = 8, Vs = 220, Hs = 360, Us = 320, Ws = 1e4, Gs = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarAttentionHeight: 210
}), Ks = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarAttentionHeight: "--sidebar-attention-height"
});
function qs(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function Js(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var Ys = [
	"auto",
	"three",
	"two",
	"split"
];
function Xs(e) {
	return Ys.includes(e) ? e : "auto";
}
var Zs = .8, Qs = 1.4, $s = 1, ec = [
	"sidebar",
	"details",
	"chat"
], tc = Object.freeze({
	sidebar: "--sidebar-font-scale",
	details: "--details-font-scale",
	chat: "--chat-font-scale"
});
function nc(e) {
	return Js(e) ? Math.round(qs(e, Zs, Qs) * 100) / 100 : $s;
}
function rc(e) {
	let t = e && typeof e == "object" ? e : {};
	return {
		sidebar: nc(t.sidebar),
		details: nc(t.details),
		chat: nc(t.chat)
	};
}
function ic(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...Gs };
	if (Js(n.sidebarWidth) && (r.sidebarWidth = qs(n.sidebarWidth, Vs, Ws)), Js(n.chatWidth)) r.chatWidth = qs(n.chatWidth, Us, Ws);
	else if (Js(n.detailsWidth) && t >= 688) {
		let e = qs(n.detailsWidth, Hs, t - Bs - Us);
		r.chatWidth = qs(t - Bs - e, Us, Ws);
	}
	let i = Js(n.sidebarAttentionHeight) ? n.sidebarAttentionHeight : n.sidebarSessionHeight;
	return Js(i) && (r.sidebarAttentionHeight = qs(i, 84, Ws)), r;
}
function ac(e, t = window.localStorage) {
	let n = { ...Gs }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = rc(null), o = window.matchMedia("(max-width: 980px)"), s = window.matchMedia("(max-width: 1440px)");
	function c() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Is) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function l() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(zs) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function u(e) {
		document.documentElement.style.setProperty(tc[e], String(a[e]));
	}
	function d() {
		for (let e of ec) u(e);
	}
	function f() {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}
	function p(e, t) {
		document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
	}
	function m(e, t) {
		if (!Object.hasOwn(Ks, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(qs(t, r === "sidebarWidth" ? Vs : r === "chatWidth" ? Us : 84, Ws));
		n[r] = i, p(Ks[r], i);
	}
	function h() {
		for (let e of Object.keys(Ks)) m(e, n[e]);
	}
	function g() {
		t?.setItem(Is, JSON.stringify(n));
	}
	function _() {
		let u = c();
		n = ic(u, 0), h();
		let p = Js(u.sidebarSessionHeight) && !Js(u.sidebarAttentionHeight);
		Js(u.detailsWidth) && !Js(u.chatWidth) && !o.matches && (n = ic(u, f()), h(), p = !0), p && g();
		try {
			r.immersive = t?.getItem(Ls) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = Xs(t?.getItem(Rs));
		} catch {
			i = "auto";
		}
		x(), a = rc(l()), d();
		let m = () => {
			x(), e();
		};
		o.addEventListener?.("change", m), s.addEventListener?.("change", m);
	}
	function v(e) {
		if (!Object.hasOwn(Ks, e) || !t) return;
		let r = e, i = c();
		delete i.detailsWidth, delete i.sidebarSessionHeight;
		for (let e of Object.keys(Ks)) Js(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(Is, JSON.stringify(i));
	}
	function y() {
		if (o.matches) return;
		let e = c();
		!Js(e.detailsWidth) || Js(e.chatWidth) || (n = ic(e, f()), h(), g());
	}
	function b() {
		return o.matches ? "single" : i === "auto" ? s.matches ? "two" : "three" : i;
	}
	function x() {
		document.body.dataset.layout = b();
	}
	function S(n) {
		i = Xs(n);
		try {
			t?.setItem(Rs, i);
		} catch {}
		x(), e();
	}
	function C(n, r) {
		if (Object.hasOwn(tc, n)) {
			a[n] = nc(r), u(n);
			try {
				t?.setItem(zs, JSON.stringify(a));
			} catch {}
			e();
		}
	}
	function w() {
		a = rc(null), d();
		try {
			t?.removeItem(zs);
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
			t?.setItem(Ls, r.immersive ? "1" : "0");
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
function oc(e) {
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
function sc(e) {
	if (e && typeof e == "object") return {
		kind: e.kind === "agent" ? "agent" : "profile",
		name: e.name || "default"
	};
	let t = typeof e == "string" ? e.trim() : "";
	return t ? {
		kind: "profile",
		name: t
	} : {
		kind: "profile",
		name: "default"
	};
}
function cc() {
	return {
		workspace: sc(void 0),
		project: sc(void 0),
		task: sc(void 0)
	};
}
function lc(e, t) {
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
function uc(e) {
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
				agents: l.agents || [],
				resourceDefaults: {
					workspace: sc(o.config?.resourceDefaults?.workspace),
					project: sc(o.config?.resourceDefaults?.project),
					task: sc(o.config?.resourceDefaults?.task)
				}
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
	function a(e = n.agentDirty) {
		n.open && e && !window.confirm("Discard unsaved agent settings changes?") || (n.open = !1, n.identity = ++t, n.agentDirty = !1, r());
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
				configuredEndpoint: String(e.endpoint || ""),
				config: {
					...n.data?.agentHub?.config,
					resourceDefaults: { ...e.resourceDefaults }
				}
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
				agentProfiles: (n.data?.agentProfiles || []).map((e) => ({ ...e })),
				resourceDefaults: n.data?.agentHub?.config?.resourceDefaults || cc()
			})
		}), await o(), e.setConfig(lc(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: lc
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var dc = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering",
	"stopping"
]), fc = 6e4;
function pc(e) {
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
		if (Number.isFinite(n)) return t() - n <= fc;
		if (!dc.has(e.status || "")) return !1;
		let r = new Date(e.updatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= fc;
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
		let t = (e.children || []).filter((e) => e.archived !== !0), n = t.filter((e) => dc.has(e.runtime?.status || "")).length, r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n} working`;
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
var mc = "forge.gui.user.v1", hc = 1, gc = 80;
function _c(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, gc).join("") || "User";
}
function vc(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== hc ? "User" : _c(t.name);
	} catch {
		return "User";
	}
}
function yc(e, t) {
	let n = r();
	function r() {
		try {
			return vc(window.localStorage.getItem(mc));
		} catch {
			return "User";
		}
	}
	function i(e) {
		let t = _c(e);
		try {
			window.localStorage.setItem(mc, JSON.stringify({
				version: hc,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return n = t, n;
	}
	return e.listen(window, "storage", (e) => {
		e.key === mc && (n = vc(e.newValue), t());
	}), {
		current: () => n,
		save: i
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var bc = class {
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
}, xc, Sc = null, Q = {
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
		ttyDraft: "",
		ttyMultiline: !1,
		ttyDraftKey: "",
		ttyDraftWorkspaceId: "",
		ttyDraftResourceId: "",
		ttyDraftVersion: 0,
		ttyDraftResetVersion: 0,
		skipTTYDraftSync: !1,
		agentName: "",
		optionsOpen: !1,
		historyOpen: !1,
		toolGroupOpen: /* @__PURE__ */ new Map(),
		approvalDrafts: /* @__PURE__ */ new Map(),
		renderDeferredForSelection: !1
	},
	tty: [{
		type: "system",
		text: "Forge GUI initialized."
	}, {
		type: "system",
		text: "Workspace data is loaded through forge CLI."
	}]
};
function Cc() {
	for (let e of Object.keys(Q.details)) delete Q.details[e];
}
var wc = us({
	runtime: Q.agent,
	workspaceId: () => Q.activeWorkspaceId
}), Tc = wc.clearResourceAfterAccepted, Ec = wc.clearMemory, Dc = wc.flush, Oc = wc.restoreResource, kc = wc.update, Ac = ds(() => {
	td && (ru(), Gu());
}), jc = ac(() => Al()), Mc = dn(() => Al()), Nc = oc({
	details: Q.details,
	context: () => ({
		workspaceId: Q.activeWorkspaceId,
		navigationVersion: Q.navigationVersion,
		selectedId: Q.selectedId,
		detailRequestVersion: Q.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++Q.detailRequestVersion,
	isCurrentWorkspace: (e, t) => Sl(e, t),
	request: (e, t) => $(e, t)
}), Pc = gs({
	workspaceId: () => Q.activeWorkspaceId,
	templates: (e) => Q.details[e]?.templates || [],
	request: (e, t) => $(e, t),
	publish: (e) => xc.renderCreateDialog(e),
	toast: Wu,
	reloadTree: () => ul(),
	selectResource: (e) => Nl(e),
	onOpen: () => {
		Q.modalEnter = "create";
	},
	onIconsChanged: Gu,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
}), Fc = (e) => document.getElementById(e), Ic = 5e3, Lc = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, Rc = [
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
], zc = new Map(Rc.map((e) => [e.id, e])), { applyCustomOrder: Bc, archiveRedirectTarget: Vc, moveIdInList: Hc, projectTaskSummary: Uc, resourceRefText: Wc, statusModel: Gc, taskOperationalState: Kc, taskOperationalStateKey: qc } = pc({
	tree: () => Q.tree,
	findResource: (e) => Tu(e),
	agentName: (e) => (Q.config?.agents || []).find((t) => t.id === e)?.name || e || "Forge GUI"
}), Jc = 0, Yc = uc({
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
	publish: (e) => xc.renderSettings(e),
	agentOptions: Xc,
	workspaceIcons: [Lc, ...Rc],
	userName: ol,
	saveUser: (e) => {
		if (!$c) throw Error("User settings are unavailable.");
		return $c.save(e);
	},
	appearance: () => {
		let e = jc.snapshot();
		return {
			layout: e.layout.preference,
			fontScales: e.fontScales
		};
	},
	setLayoutPreference: (e) => jc.setLayoutPreference(e),
	setFontScale: (e, t) => jc.setFontScale(e, t),
	resetFontScales: () => jc.resetFontScales(),
	notificationPreferences: () => Qc?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => Qc?.setBrowserEnabled(e),
	setCompletionSound: (e) => Qc?.setSoundEnabled(e),
	flushDraft: Dc,
	resetAgentState: Zl,
	reloadWorkspaceContext: async () => {
		await gl(), await ul();
	},
	clearWorkspaceContext: () => {
		Q.tree = null, Cc(), bl();
	},
	renderWorkspace: El,
	renderAgentViews: () => {
		Fu(), ou();
	},
	toast: Wu,
	onIconsChanged: Gu
});
function Xc() {
	return Lu().map((e) => ({
		id: e.id || "",
		label: su(e),
		summary: eu(e)
	}));
}
function Zc() {
	Al(), Ll(), Cu(), mu(), ou(), ru(), cu();
}
var Qc = null, $c = null;
function el(e) {
	Qc?.initialize(e);
}
function tl() {
	Qc?.establishBaseline();
}
function nl(e = Q.tree) {
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
function rl(e) {
	Qc?.observeProjections(e);
}
function il(e, t) {
	t && Qc?.observeEvent(e, t);
}
function al(e) {
	Qc?.clearResource(e);
}
function ol() {
	return $c?.current() || "User";
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
		throw new Yt(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function sl() {
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
			error: fs(e),
			workspaces: []
		};
	}
}
async function cl() {
	if (Q.doctor.checking) return;
	Q.doctor = {
		...Q.doctor,
		checking: !0
	}, Al();
	let e = await fetch("/api/doctor", { method: "POST" });
	e.ok || (Q.doctor = {
		...Q.doctor,
		checking: !1,
		error: `${e.status} ${e.statusText}`
	}, Al());
}
async function ll() {
	let e = ju(), [t, n, r] = await Promise.all([
		$("/api/workspaces"),
		$("/api/settings/agenthub"),
		sl()
	]);
	Q.config = Vu(t, n), Q.doctor = r, Fu(), Q.activeWorkspaceId = Mu(e.workspaceId) ? e.workspaceId || "" : Q.config?.activeId || Q.config?.workspaces[0]?.id || "", Q.selectedId = e.resourceId || "workspace", El(), Q.activeWorkspaceId ? (el(Q.activeWorkspaceId), await gl(), !e.resourceId && Q.lastResourceId && (Q.selectedId = Q.lastResourceId), await ul({ replaceURL: !0 })) : (Q.navigationLoading = !1, Q.tree = null, Cc(), Q.workspaceAgents = null, Q.diff = null, Zl(), bl());
}
async function ul(e = {}) {
	if (!Q.activeWorkspaceId) return;
	let t = Q.activeWorkspaceId, n = Q.navigationVersion, r = ++Q.treeRequestVersion;
	Q.navigationLoading = !0, Q.navigationError = "", Al(), Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let i;
	try {
		i = await $(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw Sl(t, n, r) && (Q.navigationLoading = !1, Q.navigationError = fs(e), Al()), e;
	}
	Sl(t, n, r) && (Q.tree = i, Cc(), Q.workspaceAgents = null, Q.diff = null, Du(), Au(!1), Q.selectedId === "workspace" ? await hl() : Q.selectedId && await dl(Q.selectedId), Sl(t, n, r) && (await ql(t, vu()), Sl(t, n, r) && (tl(), Q.navigationLoading = !1, Q.navigationError = "", bl(), e.updateURL !== !1 && Nu({ replace: !!e.replaceURL }))));
}
async function dl(e, t = {}) {
	return Nc.load(e, t);
}
function fl(e, t = Q.activeWorkspaceId, n = {}) {
	return Nc.fetch(e, t);
}
function pl(e) {
	return Nc.snapshot(e);
}
function ml(e) {
	return Nc.apply(e);
}
async function hl(e = {}) {
	if (!Q.activeWorkspaceId || Q.workspaceAgents && !e.force) return;
	let t = Q.activeWorkspaceId, n = Q.navigationVersion, r = ++Q.workspaceAgentsRequestVersion;
	try {
		let e = await $(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!Sl(t, n) || r !== Q.workspaceAgentsRequestVersion) return null;
		Q.workspaceAgents = e;
	} catch (e) {
		if (!Sl(t, n) || r !== Q.workspaceAgentsRequestVersion) return null;
		Q.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: fs(e)
		};
	}
	return Q.workspaceAgents;
}
async function gl(e = Q.activeWorkspaceId, t = Q.navigationVersion) {
	let n = await $(`/api/workspaces/${e}/ui-state`);
	return Sl(e, t) ? (Q.expandedProjects = new Set(n.expandedProjects || []), Q.lastResourceId = n.lastResourceId || "", Q.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], Q.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, !0) : !1;
}
async function _l() {
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
	}), Sl(e, t) && (Q.lastResourceId = n);
}
function vl() {
	Q.autoRefreshTimer ||= Sc?.interval(() => {
		yl().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, Ic) ?? null;
}
async function yl() {
	if (!Q.activeWorkspaceId || Q.autoRefreshInFlight || Q.listDrag) return;
	let e = Q.autoRefreshVersion, t = Q.activeWorkspaceId, n = Q.navigationVersion, r = Q.selectedId;
	Q.autoRefreshInFlight = !0;
	try {
		let [i, a] = await Promise.all([Ul(t), sl()]);
		if (!i || !Cl(t, n, e)) return;
		let o = !Hu(Q.tree, i);
		o && (Q.tree = i), Hu(Q.doctor, a) || (Q.doctor = a, o = !0), rl(nl(i)), Du() && (Nu({ replace: !0 }), o = !0, r = Q.selectedId);
		let s = Q.expandedProjects.size;
		if (Au(!1), o ||= s !== Q.expandedProjects.size, Q.selectedId === "workspace") {
			let r = Q.workspaceAgents;
			if (await hl({ force: !0 }), !Cl(t, n, e)) return;
			Hu(r, Q.workspaceAgents) || (o = !0);
		} else if (r) {
			let i = ++Q.detailRequestVersion, a = await fl(r, t);
			if (!Cl(t, n, e) || Q.selectedId !== r || i !== Q.detailRequestVersion) return;
			let s = pl(r);
			ml(a), Hu(s, pl(r)) || (o = !0);
		}
		rl(nl(i)), await ql(t, vu()) && (o = !0), qc() !== Q.taskOperationalStateKey && (o = !0), o && bl();
	} finally {
		Q.autoRefreshInFlight = !1;
	}
}
function bl() {
	Al(), Ll(), ru(), Gu(), Cu(), cu();
}
function xl() {
	Al(), Ll(), ru(), Gu(), Cu();
}
function Sl(e, t, n = null) {
	return e === Q.activeWorkspaceId && t === Q.navigationVersion && (n == null || n === Q.treeRequestVersion);
}
function Cl(e, t, n) {
	return Sl(e, t) && n === Q.autoRefreshVersion;
}
function wl(e) {
	return zc.get(String(e?.icon || "").trim()) || Lc;
}
function Tl(e) {
	let t = wl(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function El() {
	let e = Q.config?.workspaces?.find((e) => e.id === Q.activeWorkspaceId);
	Tl(e), Al();
}
function Dl(e, t, n = "") {
	let r = Kc(e), i = t === "project" && ku(e.id), a = t === "project" ? Uc(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: Wc(e.id),
		active: Q.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: Gc(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? Bc(e.children || [], Q.taskOrder[e.id]).map((t) => Dl(t, "task", e.id)) : [],
		projectId: n,
		followed: !!e.attention?.followed
	};
}
function Ol(e) {
	if (!e) return null;
	let t = Kc(e);
	return {
		id: e.id || "scheduler",
		type: "scheduler",
		title: e.title || "Scheduler",
		ref: "",
		active: Q.selectedId === (e.id || "scheduler"),
		expanded: !1,
		ariaLabel: ["Scheduler", t.label].filter(Boolean).join(". "),
		statusLabel: t.label || "Workspace Scheduler",
		status: Gc(t.statusPresentation),
		summary: null,
		children: []
	};
}
function kl(e) {
	let t = Kc(e), n = e.type === "scheduler" || e.type === "project" || e.type === "task" ? e.type : "workspace", r = e.title || e.id;
	return {
		id: e.id,
		type: n,
		title: r,
		ref: n === "project" || n === "task" ? Wc(e.id) : "",
		selected: Q.selectedId === e.id,
		activeTurn: !!e.runtime?.activeTurn,
		followed: !!e.attention?.followed,
		turnNumber: Number(e.runtime?.turnNumber) || 0,
		agentName: String(e.runtime?.agentName || "").trim(),
		statusLabel: t.label || (e.attention?.followed ? "Focused resource" : "Active turn"),
		status: Gc(t.statusPresentation)
	};
}
function Al() {
	let e = Q.tree ? Bc(Q.tree.projects || [], Q.projectOrder).map((e) => Dl(e, "project")) : [], t = Q.tree?.attentionList?.map((e) => kl(e)) || [];
	Q.tree && (Q.taskOperationalStateKey = qc()), xc.renderAppShell({
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
			iconSrc: wl(e).src
		})),
		scheduler: Ol(Q.tree?.scheduler),
		projects: e,
		attentionList: t,
		doctor: _s(Q.doctor, Q.activeWorkspaceId),
		...jc.snapshot(),
		route: Mc.projection(),
		onSwitchWorkspace: (e) => jl(e),
		onAddWorkspace: () => Bu("workspace").catch((e) => Wu(e.message)),
		onCreateProject: () => yu(),
		onOpenSettings: () => Bu().catch((e) => Wu(e.message)),
		onRefreshDoctor: cl,
		onToggleProject: (e) => Pl(e),
		onSelectResource: (e) => Nl(e),
		onReorder: (e, t, n) => Ml(e, t, n),
		onDragState: (e) => {
			Q.listDrag = e;
		},
		onToggleAttention: (e, t) => Gl(e, t),
		onDismissAttention: (e) => Kl(e),
		onPanePreview: (e, t) => Ju(e, t),
		onPaneCommit: (e) => Yu(e),
		onPaneViewport: () => Xu(),
		onMobileSidebar: (e) => Zu(e),
		onMobileView: (e) => Qu(e),
		onMobileImmersive: (e) => $u(e),
		onHistoryNavigation: (e) => ad(e),
		onToast: Wu,
		onIconsChanged: Gu
	});
}
async function jl(e) {
	if (!Mu(e)) return;
	if (Q.workspaceMenuOpen = !1, e === Q.activeWorkspaceId) {
		El();
		return;
	}
	Zu(!1), Dc(), Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let t = Q.navigationVersion;
	await _l().catch((e) => console.warn("failed to save UI state", e)), Q.activeWorkspaceId = e, Q.selectedId = "workspace", Q.tree = null, Q.navigationLoading = !0, Q.navigationError = "", Cc(), el(e), Su(), Zl(), El(), await gl(e, t) && (Q.selectedId = Q.lastResourceId || "workspace", await ul());
}
async function Ml(e, t, n) {
	let r = {
		projectOrder: [...Q.projectOrder],
		taskOrder: Object.fromEntries(Object.entries(Q.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []]))
	};
	if (e.kind === "task") {
		let r = Tu(e.projectId);
		if (!r) return;
		let i = Bc(r.children || [], Q.taskOrder[e.projectId]);
		Q.taskOrder = {
			...Q.taskOrder,
			[e.projectId]: Hc(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") Q.projectOrder = Hc(Bc(Q.tree?.projects || [], Q.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	Al();
	try {
		await _l();
	} catch (e) {
		throw Q.projectOrder = r.projectOrder, Q.taskOrder = r.taskOrder, Al(), e;
	}
}
async function Nl(e, t = {}) {
	let n = Q.selectedId !== e;
	t.clearUnread !== !1 && al(e);
	let r = n || !!t.forceDetail;
	r && (Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++, e !== "workspace" && Nc.reset(e)), n && (Dc(), fu(), Q.diff = null, Ec(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.steeringMessageId = ""), Q.selectedId = e, Zu(!1), Au(!1), Nu(), _l().catch((e) => console.warn("failed to save UI state", e)), xl(), await Promise.all([e === "workspace" ? hl({ force: !!t.forceDetail }) : dl(e, { force: r }), ql(Q.activeWorkspaceId, e)]), Sl(Q.activeWorkspaceId, Q.navigationVersion) && xl();
}
async function Pl(e) {
	Q.expandedProjects.has(e) ? Q.expandedProjects.delete(e) : Q.expandedProjects.add(e), Al();
	try {
		await _l();
	} catch (t) {
		throw Q.expandedProjects.has(e) ? Q.expandedProjects.delete(e) : Q.expandedProjects.add(e), Al(), t;
	}
}
function Fl() {
	let e = Q.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${Q.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: Pu(),
		resourceId: Q.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		parent: null,
		loading: !1,
		detail: null,
		wiki: Q.tree?.wiki || null,
		workspaceAgents: Q.workspaceAgents,
		agentBinding: Q.selectedId === "workspace" ? Q.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : Tu(Q.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: (Q.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: Xc(),
		resolveResourceTitle: Eu,
		onNavigate: (e) => Rl(e).catch((e) => Wu(fs(e))),
		onCreateTask: (e) => bu(e),
		onArchive: (e) => wu(e).catch((e) => Wu(fs(e))),
		onSaveWorkspaceAgents: (e, t) => zl(e, t),
		onSaveMarkdownFile: (e, t, n) => Bl(e, t, n),
		onDeleteArtifact: (e) => Vl(e),
		onSaveAgentBinding: async (t) => {
			let n = Q.selectedId || "workspace";
			await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await ul({ updateURL: !1 }), n !== "workspace" && await dl(n, { force: !0 }), bl(), Wu("Resource agent binding saved.");
		},
		onRefreshScheduler: async () => {
			await ul({ updateURL: !1 }), Q.selectedId === "scheduler" && await dl("scheduler", { force: !0 }), bl();
		},
		onToast: Wu,
		onIconsChanged: Gu
	};
	if (!Q.tree) return t;
	if (Q.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Pu()
	};
	let n = Tu(Q.selectedId) || Q.tree.scheduler || Q.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Pu()
	};
	let r = Q.details[n.id] || null, i = Ou(n.id);
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
		detail: Il(r)
	};
}
function Il(e) {
	return !e || e.type !== "scheduler" && e.type !== "project" && e.type !== "task" ? null : {
		...e,
		type: e.type,
		title: e.title || e.id,
		path: e.path || ""
	};
}
function Ll() {
	xc.renderDetailPanel(Fl());
}
async function Rl(e) {
	await Nl(e, { forceDetail: e === Q.selectedId && e !== "workspace" });
}
async function zl(e, t) {
	if (!Q.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = Q.activeWorkspaceId, r = Q.navigationVersion, i = await $(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!Sl(n, r) || Q.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return Q.workspaceAgents = i, bl(), i;
}
async function Bl(e, t, n) {
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
	if (!Sl(r, a) || Q.selectedId !== i) throw Error("The resource changed before the Markdown file finished saving.");
	return await dl(i, { force: !0 }), bl(), o;
}
async function Vl(e) {
	let t = Q.activeWorkspaceId, n = Q.selectedId;
	if (!t || !n || n === "workspace" || n === "scheduler") throw Error("No editable resource is selected.");
	let r = Q.navigationVersion;
	if (await $(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(n)}/artifacts?path=${encodeURIComponent(e)}`, { method: "DELETE" }), !Sl(t, r) || Q.selectedId !== n) throw Error("The resource changed before the artifact finished deleting.");
	await dl(n, { force: !0 }), bl(), Wu("Artifact deleted.");
}
function Hl() {
	Q.diffRequestVersion++, Q.diff = null, bl();
}
async function Ul(e = Q.activeWorkspaceId) {
	let t = ++Q.treeRequestVersion, n = Q.navigationVersion, r = await $(`/api/workspaces/${e}/tree`);
	return Sl(e, n, t) ? r : null;
}
async function Wl() {
	if (!Q.activeWorkspaceId || !Q.tree) return;
	let e = await Ul(Q.activeWorkspaceId);
	e && (Q.tree = e);
}
async function Gl(e, t) {
	let n = Q.activeWorkspaceId;
	!n || !e || (await $(`/api/workspaces/${encodeURIComponent(n)}/resources/${encodeURIComponent(e)}/attention`, {
		method: "PUT",
		body: JSON.stringify({ followed: t })
	}), await Wl(), bl());
}
async function Kl(e) {
	let t = Q.activeWorkspaceId;
	!t || !e || (await $(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(e)}/attention/dismiss`, { method: "POST" }), await Wl(), bl());
}
async function ql(e = Q.activeWorkspaceId, t = vu()) {
	if (!e || !t) return !1;
	let n = ++Q.messageStatusRequestVersion, r = `${e}:${t}`, i = await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/status`);
	if (n !== Q.messageStatusRequestVersion || e !== Q.activeWorkspaceId || t !== vu()) return !1;
	let a = Q.messageStatusKey !== r || !Hu(Q.messageStatus, i);
	return Q.messageStatusKey = r, Q.messageStatus = i, a;
}
function Jl() {
	Q.stopNotice = null, ou();
}
async function Yl(e) {
	if (!e || Q.steeringMessageId) return;
	let t = Q.activeWorkspaceId, n = vu();
	Q.steeringMessageId = e, ou();
	try {
		await $(`/api/workspaces/${encodeURIComponent(t)}/messages/${encodeURIComponent(e)}/steer`, { method: "POST" }), await ql(t, n), t === Q.activeWorkspaceId && n === vu() && (bl(), Wu("Message inserted into the current turn."));
	} catch (e) {
		try {
			await ql(t, n);
		} catch {}
		throw e;
	} finally {
		Q.steeringMessageId === e && (Q.steeringMessageId = "", ou());
	}
}
async function Xl() {
	Dc(), Ac.reset(), Ec(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.stopNotice = null, await ql();
}
function Zl() {
	Dc(), fu(), Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, Ec(), Ac.reset(), Q.messageStatus = null, Q.messageStatusKey = "", Q.messageStatusRequestVersion++, Q.steeringMessageId = "", Q.stopNotice = null, Q.agent.toolGroupOpen.clear(), Q.agent.approvalDrafts.clear(), Q.agent.renderDeferredForSelection = !1, $l();
}
function Ql(e, t, n) {
	if (e !== Q.activeWorkspaceId || t !== vu() || !n) return;
	let r = Tu(t)?.runtime || Q.messageStatus?.generation;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && il(n, r?.generationId ? {
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
	].includes(n.type) && ql().then(bl).catch((e) => console.warn("agent refresh failed", e));
}
function $l() {
	Q.agent.renderTimer && window.clearTimeout(Q.agent.renderTimer), Q.agent.renderTimer = null;
}
function eu(e) {
	if (!e) return "";
	let t = [tu(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function tu(e) {
	return (Q.config?.agentHubProviders || Yc.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function nu(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function ru(e = {}) {
	ou();
	let t = vu(), n = Q.messageStatusKey === `${Q.activeWorkspaceId}:${t}` ? Q.messageStatus : null, r = (Q.config?.agents || []).find((e) => e.id === n?.resolvedAgent) || Iu(), i = Tu(t)?.runtime;
	xc.renderAgentPanelHeader({
		identity: `${Q.activeWorkspaceId}:${t}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		status: n,
		submitting: Ac.isSending(iu(Q.activeWorkspaceId, t)),
		agentName: su(r),
		modelSummary: eu(r),
		turnNumber: Number(n?.generation?.turnNumber) || Number(i?.turnNumber) || 0,
		turnStartedAt: String(i?.turnStartedAt || ""),
		onIconsChanged: Gu
	}), xc.renderEventTimeline({
		identity: `${Q.activeWorkspaceId}:${t}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: su(r),
		resolveResourceTitle: Eu,
		onNavigate: (e) => Nl(e).catch((e) => Wu(fs(e))),
		project: kr,
		onEvent: Ql,
		onNotice: () => {},
		onApproval: gu,
		onToast: Wu,
		onIconsChanged: Gu
	});
}
function iu(e, t) {
	return `${e || "workspace"}:${t || "resource"}`;
}
var au = "";
function ou(e = {}) {
	Q.agent.skipTTYDraftSync = !1;
	let t = vu();
	Q.activeWorkspaceId && t && Oc(t);
	let n = Ac.active("turn-stop") && Ac.key("turn-stop") === t, r = Q.messageStatusKey === `${Q.activeWorkspaceId}:${t}` ? Q.messageStatus : null, i = Q.activeWorkspaceId, a = `${i}:${t}`;
	xc.renderComposer({
		identity: `${Q.activeWorkspaceId}:${t}:${Q.agent.ttyDraftKey || ""}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: t,
		draft: Q.agent.ttyDraft || "",
		draftKey: Q.agent.ttyDraftKey || "",
		draftResetVersion: Q.agent.ttyDraftResetVersion || 0,
		unavailableReason: r ? r.acceptsMessages ? "" : r.archived ? "This resource is archived." : r.configError || "This resource cannot accept messages." : "Loading work status.",
		sending: Ac.isSending(iu(Q.activeWorkspaceId, t)),
		canEndTurn: !!(n || ["running", "waiting_approval"].includes(String(r?.session?.state || ""))),
		endingTurn: n,
		stopNotice: Q.stopNotice?.key === a ? Q.stopNotice.text : "",
		waitingMessages: r?.waitingMessages || [],
		canSteerWaiting: !!r?.canSteerWaiting,
		steeringMessageId: Q.steeringMessageId,
		agentBinding: t === "workspace" ? Q.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : Tu(t)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: (Q.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: Xc(),
		bindingSaving: au === t,
		onDraft: (e, t) => lu(e, t),
		onSend: _u,
		onOpenUpload: uu,
		onEndTurn: () => hu().catch((e) => Wu(e.message)),
		onDismissStopNotice: Jl,
		onSteerWaiting: Yl,
		onSaveAgentBinding: async (e) => {
			if (t === vu()) {
				au = t, ou();
				try {
					await $(`/api/workspaces/${encodeURIComponent(i)}/resources/${encodeURIComponent(t)}/agent-binding`, {
						method: "PUT",
						body: JSON.stringify(e)
					}), await ul({ updateURL: !1 }), t !== "workspace" && await dl(t, { force: !0 }), bl(), Wu("Resource agent binding saved.");
				} catch (e) {
					Wu(fs(e));
				} finally {
					au = "", ou();
				}
			}
		},
		onIconsChanged: Gu
	});
}
function su(e) {
	return e?.name || e?.id || "Agent";
}
function cu() {
	Yc.render();
}
function lu(e, t) {
	!t || t.workspaceId !== Q.activeWorkspaceId || t.resourceId !== vu() || t.draftKey !== Q.agent.ttyDraftKey || kc(e);
}
function uu() {
	let e = vu();
	if (!e || Q.messageStatus?.archived) {
		Wu("Select an active resource before uploading files.");
		return;
	}
	let t = Fc("ttyInput");
	t && kc(t.value), Q.modalEnter = "upload", Q.uploadDialog = {
		open: !0,
		identity: ++Jc,
		resourceId: e,
		items: [],
		nextId: 1
	}, mu();
}
function du(e = [], t = {}) {
	if (!Q.uploadDialog.open) return;
	let n = Q.uploadDialog.resourceId === vu(), r = !t.workspaceId || t.workspaceId === Q.activeWorkspaceId, i = e.length > 0 && r && n;
	i && (kc(pu(Q.agent.ttyDraft, e)), Q.agent.ttyDraftResetVersion++), fu();
	let a = Fc("ttyComposer");
	a && delete a.dataset.composerKey, ou({ skipDraftSync: i }), Fc("ttyInput")?.focus({ preventScroll: !0 }), Gu();
}
function fu() {
	Q.uploadDialog = {
		open: !1,
		identity: ++Jc,
		resourceId: "",
		items: [],
		nextId: 1
	}, mu();
}
function pu(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function mu() {
	let e = Q.uploadDialog;
	xc.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${Q.activeWorkspaceId}:${e.resourceId || ""}`,
		workspaceId: Q.activeWorkspaceId,
		resourceId: e.resourceId || "",
		onDone: du,
		onIconsChanged: Gu
	});
}
async function hu() {
	let e = Q.activeWorkspaceId, t = vu(), n = Q.messageStatus?.generation?.generationId || "", r = Ac.begin("turn-stop", t);
	if (r) try {
		let r = n ? `?generationId=${encodeURIComponent(n)}` : "", i = await $(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/turn/end${r}`, { method: "POST" }), a = Math.max(0, Number(i.cancelledPendingSteerCount || 0)), o = a === 1 ? "Turn stopped. 1 pending steer was cancelled and will not affect the next turn." : a > 1 ? `Turn stopped. ${a} pending steers were cancelled and will not affect the next turn.` : "Turn stopped. No pending steer remained; any steer already delivered to this turn was not changed.";
		i.pendingSteerCancellationError && (o += ` Pending steer cancellation needs attention: ${i.pendingSteerCancellationError}`), Q.stopNotice = {
			key: `${e}:${t}`,
			text: o
		}, await ql(e, t), bl();
	} finally {
		Ac.finish(r);
	}
}
async function gu(e, t, n) {
	let r = Q.activeWorkspaceId, i = vu();
	await $(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/approval?generationId=${encodeURIComponent(e)}`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), await ql(r, i), bl();
}
async function _u(e, t) {
	if (!e.trim() || t.workspaceId !== Q.activeWorkspaceId || t.resourceId !== vu() || t.draftKey !== Q.agent.ttyDraftKey) return {
		accepted: !1,
		clear: !1
	};
	let n = iu(t.workspaceId, t.resourceId);
	if (!Ac.startSending(n)) return {
		accepted: !1,
		clear: !1
	};
	let r = Q.agent.ttyDraftVersion;
	try {
		await $(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/resources/${encodeURIComponent(t.resourceId)}/messages`, {
			method: "POST",
			body: JSON.stringify({
				text: e,
				role: "user",
				sender: { name: ol() }
			})
		});
		let n = Tc({
			workspaceId: t.workspaceId,
			resourceId: t.resourceId,
			key: t.draftKey,
			text: e,
			version: r
		});
		return n && Q.agent.ttyDraftResetVersion++, n && Q.stopNotice?.key === `${t.workspaceId}:${t.resourceId}` && (Q.stopNotice = null), await Promise.all([ql(t.workspaceId, t.resourceId), Wl()]), bl(), {
			accepted: !0,
			clear: n
		};
	} finally {
		Ac.stopSending(n);
	}
}
function vu() {
	return Q.selectedId === "workspace" ? "workspace" : Tu(Q.selectedId)?.id || "";
}
function yu() {
	xu("project");
}
function bu(e) {
	xu("task", e);
}
function xu(e, t = "") {
	Pc.open(e === "task" ? "task" : "project", t);
}
function Su() {
	Pc.close();
}
function Cu() {
	Pc.render();
}
async function wu(e) {
	let t = Vc(e, Q.projectOrder, Q.taskOrder), n = (await $(`/api/workspaces/${Q.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	})).warnings || [];
	Wu(n.length > 0 ? ["Archived.", ...n.map((e) => `Warning: ${e.message}`)].join("\n") : "Archived."), Q.selectedId = t, await ul();
}
function Tu(e) {
	if (!Q.tree) return null;
	if (Q.tree.scheduler?.id === e) return Q.tree.scheduler;
	for (let t of Q.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function Eu(e) {
	if (e === "workspace") return Pu();
	let t = Tu(e);
	return t ? String(t.title || t.id).trim() || t.id : null;
}
function Du() {
	return Q.selectedId === "workspace" || Tu(Q.selectedId) ? !1 : (Q.selectedId = "workspace", !0);
}
function Ou(e) {
	if (!Q.tree) return null;
	for (let t of Q.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function ku(e) {
	return Q.expandedProjects.has(e);
}
function Au(e = !1) {
	let t = Ou(Q.selectedId);
	!t || t.id === Q.selectedId || Q.expandedProjects.has(t.id) || (Q.expandedProjects.add(t.id), e && _l().catch((e) => Wu(e.message)));
}
function ju(e = window.location.pathname) {
	return Mc.parse(e);
}
function Mu(e) {
	return !!(e && Q.config?.workspaces.some((t) => t.id === e));
}
function Nu(e = {}) {
	Mc.project(Q.activeWorkspaceId, Q.selectedId, e);
}
function Pu() {
	return Q.config?.workspaces.find((e) => e.id === Q.activeWorkspaceId)?.name || "Workspace";
}
function Fu() {
	let e = Lu(), t = Ru();
	e.some((e) => e.id === Q.agent.agentName) || (Q.agent.agentName = t);
}
function Iu() {
	let e = Lu(), t = Q.agent.agentName || Ru();
	return e.find((e) => e.id === t) || e[0] || null;
}
function Lu() {
	return (Q.config?.agents || []).filter((e) => e.available !== !1);
}
function Ru() {
	let e = Lu();
	return zu(Q.config?.agentProfiles, "default") || zu(Yc.profiles(), "default") || e[0]?.id || "";
}
function zu(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function Bu(e = "workspace") {
	return Yc.open(e);
}
function Vu(e, t) {
	return Yc.withAgentHubCatalog(e, t);
}
function Hu(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var Uu = 0;
function Wu(e) {
	xc.renderToast({
		message: String(e || ""),
		revision: ++Uu
	});
}
function Gu() {
	let e = window.lucide;
	!e || Q.iconRefreshScheduled || (Q.iconRefreshScheduled = !0, Sc?.animationFrame(() => {
		Q.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function Ku(e) {
	Gu(), e === "markdown" && window.marked && window.DOMPurify && (Ll(), Gu()), e === "diff" && Ll();
}
window.forgeAssetLoaded = Ku;
function qu() {
	jc.initialize();
}
function Ju(e, t) {
	jc.previewPane(e, t);
}
function Yu(e) {
	jc.commitPane(e);
}
function Xu() {
	jc.syncViewport();
}
function Zu(e) {
	jc.setMobileSidebar(e);
}
function Qu(e) {
	jc.setMobileView(e);
}
function $u(e) {
	jc.setMobileImmersive(e);
}
function ed() {
	Sc?.listen(document, "selectionchange", () => {
		if (!Q.agent.renderDeferredForSelection) return;
		let e = Fc("ttyLog");
		e && nu(e) || (Q.agent.renderDeferredForSelection = !1, ru(), Gu());
	}), Sc?.listen(document, "keydown", (e) => {
		e.key === "Escape" && Q.diff ? Hl() : e.key === "Escape" && (Q.agent.optionsOpen || Q.agent.historyOpen) && (Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, ou(), Gu());
	}), Sc?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Rl(n.dataset.breadcrumbResource || "workspace").catch((e) => Wu(fs(e)));
			return;
		}
		(Q.agent.optionsOpen || Q.agent.historyOpen) && t && !t.closest(".tty-composer") && (Q.agent.optionsOpen = !1, Q.agent.historyOpen = !1, ou(), Gu()), Gu();
	}), Sc?.listen(window, "beforeunload", rd), Sc?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && rd();
	});
}
var td = !1;
function nd(e) {
	if (xc = e, td) {
		Zc();
		return;
	}
	td = !0;
	let t = new bc();
	Sc = t, Qc = Fs({
		scope: t,
		selectedResourceId: () => Q.selectedId,
		resourceProjections: () => nl(),
		hasTree: () => !!Q.tree,
		findResource: Tu,
		selectResource: Nl,
		notificationsSettingsVisible: () => Yc.isOpenTab("notifications"),
		renderSettings: cu,
		refreshIcons: Gu,
		flushDraft: rd
	}), $c = yc(t, () => {
		Yc.isOpenTab("user") && cu();
	}), ed(), qu(), Qc.install(), Al(), ll().catch((e) => {
		Q.navigationLoading = !1, Q.navigationError = e.message, Wu(e.message), bl();
	}), vl();
}
function rd() {
	Dc();
}
function id() {
	td && (rd(), td = !1, Qc?.dispose(), Qc = null, $c = null, Ac.reset(), $l(), Pc.dispose(), Sc?.dispose(), Sc = null, Q.autoRefreshTimer = null);
}
async function ad(e) {
	let t = ju(e);
	if (!Mu(t.workspaceId)) {
		Nu({ replace: !0 });
		return;
	}
	let n = Q.activeWorkspaceId !== t.workspaceId, r = Q.selectedId;
	Dc(), Q.navigationVersion++, Q.autoRefreshVersion++, Q.treeRequestVersion++, Q.detailRequestVersion++, Q.workspaceAgentsRequestVersion++, Q.diffRequestVersion++;
	let i = Q.navigationVersion;
	if (Q.activeWorkspaceId = t.workspaceId || "", Q.selectedId = t.resourceId || "workspace", !n && r !== Q.selectedId && Q.selectedId !== "workspace" && (Nc.reset(Q.selectedId), delete Q.details[Q.selectedId]), Q.diff = null, n && (Q.tree = null, Q.navigationLoading = !0, Q.navigationError = "", Su(), el(Q.activeWorkspaceId)), n && Zl(), El(), n) {
		if (!await gl(t.workspaceId || "", i)) return;
		!t.resourceId && Q.lastResourceId && (Q.selectedId = Q.lastResourceId), await ul({ updateURL: !1 }), Sl(t.workspaceId || "", i) && Nu({ replace: !0 });
	} else {
		let e = Du();
		if (Q.selectedId === "workspace" ? await hl() : (Au(!1), await dl(Q.selectedId)), !Sl(t.workspaceId || "", i)) return;
		r !== Q.selectedId && await Xl(), bl(), e && Nu({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var od = ns(), sd = {
	renderAppShell: od.appShell.publish,
	renderCreateDialog: od.create.publish,
	renderSettings: od.settings.publish,
	renderUploadDialog: od.upload.publish,
	renderComposer: od.composer.publish,
	renderEventTimeline: od.timeline.publish,
	renderAgentPanelHeader: od.agentHeader.publish,
	renderDetailPanel: od.detail.publish,
	renderToast: od.toast.publish
}, cd = null;
async function ld() {
	if (cd) return;
	let e = document.getElementById("app");
	if (!e) throw Error("Forge application root is unavailable.");
	e.dataset.componentOwner = "app-shell", cd = i($o, {
		target: e,
		props: { channels: od }
	}), nd(sd);
}
async function ud() {
	if (id(), !cd) return;
	let e = cd;
	cd = null, await m(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void ud()), window.addEventListener("pageshow", (e) => {
	e.persisted && ld();
}), ld().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
