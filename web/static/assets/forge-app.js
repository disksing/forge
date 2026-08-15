//#region node_modules/svelte/src/internal/shared/utils.js
var e = Array.isArray, t = Array.prototype.indexOf, n = Array.prototype.includes, r = Array.from, i = Object.defineProperty, a = Object.getOwnPropertyDescriptor, o = Object.getOwnPropertyDescriptors, s = Object.prototype, c = Array.prototype, l = Object.getPrototypeOf, u = Object.isExtensible, d = () => {};
function f(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function p() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, C = 1 << 20, w = 1 << 25, T = 65536, E = 1 << 21, ee = 1 << 22, te = 1 << 23, D = Symbol("$state"), ne = Symbol("legacy props"), re = Symbol(""), ie = Symbol("attributes"), ae = Symbol("class"), oe = Symbol("style"), se = Symbol("text"), ce = Symbol("form reset"), le = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), ue = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function de(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function fe() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function pe(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function me(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function he() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ge(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function _e() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ve(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function ye() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function be() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function xe() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Se() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var Ce = {}, we = Symbol("uninitialized"), Te = "http://www.w3.org/1999/xhtml", Ee = "http://www.w3.org/2000/svg", De = "http://www.w3.org/1998/Math/MathML";
function Oe() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function ke(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Ae() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function je() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var O = !1;
function Me(e) {
	O = e;
}
var Ne;
function Pe(e) {
	if (e === null) throw ke(), Ce;
	return Ne = e;
}
function Fe() {
	return Pe(/* @__PURE__ */ ln(Ne));
}
function k(e) {
	if (O) {
		if (/* @__PURE__ */ ln(Ne) !== null) throw ke(), Ce;
		Ne = e;
	}
}
function A(e = 1) {
	if (O) {
		for (var t = e, n = Ne; t--;) n = /* @__PURE__ */ ln(n);
		Ne = n;
	}
}
function Ie(e = !0) {
	for (var t = 0, n = Ne;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ ln(n);
		e && n.remove(), n = i;
	}
}
function Le(e) {
	if (!e || e.nodeType !== 8) throw ke(), Ce;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Re(e) {
	return e === this.v;
}
function ze(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Be(e) {
	return !ze(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var Ve = null;
function He(e) {
	Ve = e;
}
function j(e, t = !1, n) {
	Ve = {
		p: Ve,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: B,
		l: null
	};
}
function M(e) {
	var t = Ve, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) xn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ve = t.p, e ?? {};
}
function Ue() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var We = [];
function Ge() {
	var e = We;
	We = [], f(e);
}
function Ke(e) {
	if (We.length === 0 && !kt) {
		var t = We;
		queueMicrotask(() => {
			t === We && Ge();
		});
	}
	We.push(e);
}
function qe() {
	for (; We.length > 0;) Ge();
}
function Je(e) {
	var t = B;
	if (t === null) return Un.f |= te, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ye(e, t);
}
function Ye(e, t) {
	if (!(t !== null && t.f & 16384)) {
		for (; t !== null;) {
			if (t.f & 128) {
				if (!(t.f & 32768)) throw e;
				try {
					t.b.error(e);
					return;
				} catch (t) {
					e = t;
				}
			}
			t = t.parent;
		}
		throw e;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/status.js
var Xe = ~(h | g | m);
function Ze(e, t) {
	e.f = e.f & Xe | t;
}
function Qe(e) {
	e.f & 512 || e.deps === null ? Ze(e, m) : Ze(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function $e(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, $e(t.deps));
}
function et(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), $e(e.deps), Ze(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var tt = !1;
function nt(e) {
	var t = tt;
	try {
		return tt = !1, [e(), tt];
	} finally {
		tt = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function rt(e) {
	O && /* @__PURE__ */ cn(e) !== null && dn(e);
}
var it = !1;
function at() {
	it || (it = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ce]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ot(e) {
	var t = Un, n = B;
	Gn(null), Kn(null);
	try {
		return e();
	} finally {
		Gn(t), Kn(n);
	}
}
function st(e, t, n, r = n) {
	e.addEventListener(t, () => ot(n));
	let i = e[ce];
	e[ce] = i ? () => {
		i(), r(!0);
	} : () => r(!0), at();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ct(e) {
	let t = 0, n = Kt(0), r;
	return () => {
		vn() && (V(n), Tn(() => (t === 0 && (r = pr(() => e(() => Xt(n)))), t += 1, () => {
			Ke(() => {
				--t, t === 0 && (r?.(), r = void 0, Xt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var lt = x | S;
function ut(e, t, n, r) {
	new dt(e, t, n, r);
}
var dt = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = O ? Ne : null;
	#n;
	#r;
	#i;
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = 0;
	#u = 0;
	#d = !1;
	#f = /* @__PURE__ */ new Set();
	#p = /* @__PURE__ */ new Set();
	#m = null;
	#h = ct(() => (this.#m = Kt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = B;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = B.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = En(() => {
			if (O) {
				let e = this.#t;
				Fe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, lt), O && (this.#e = Ne);
	}
	#g() {
		try {
			this.#a = Dn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ke(r), t && (this.#s = Dn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				je();
				return;
			}
			t = !0, n && Se(), this.#s !== null && Pn(this.#s, () => {
				this.#s = null;
			}), this.#S(() => {
				this.#b();
			});
		};
		return {
			reset: r,
			invoke_onerror: () => {
				try {
					n = !0, this.#n.onerror?.(e, r), n = !1;
				} catch (e) {
					Ye(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = Dn(() => e(this.#e)), Ke(() => {
			var e = this.#c = document.createDocumentFragment(), t = sn();
			e.append(t), this.#a = this.#S(() => Dn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Pn(this.#o, () => {
				this.#o = null;
			}), this.#x(P));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = Dn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Rn(this.#a, e);
				let t = this.#n.pending;
				this.#o = Dn(() => t(this.#e));
			} else this.#x(P);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		et(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = B, n = Un, r = Ve;
		Kn(this.#i), Gn(this.#i), He(this.#i.ctx);
		try {
			return Ft.ensure(), e();
		} catch (e) {
			return Je(e), null;
		} finally {
			Kn(t), Gn(n), He(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Pn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ke(() => {
			this.#d = !1, this.#m && Jt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), V(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		P?.is_fork ? (this.#a && P.skip_effect(this.#a), this.#o && P.skip_effect(this.#o), this.#s && P.skip_effect(this.#s), P.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (jn(this.#a), null), this.#o &&= (jn(this.#o), null), this.#s &&= (jn(this.#s), null), O && (Pe(this.#t), A(), Pe(Ie()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return Dn(() => {
						var r = B;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Ye(e, this.#i.parent), null;
				}
			}));
		};
		Ke(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Ye(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Ye(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function ft(e, t, n, r) {
	let i = Ue() ? gt : yt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = B, c = pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ye(e, s);
			}
			mt();
		}
	}
	var d = ht();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ vt(e))).then(u).catch((e) => Ye(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), mt();
	}) : f();
}
function pt() {
	var e = B, t = Un, n = Ve, r = P;
	return function(i = !0) {
		Kn(e), Gn(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function mt(e = !0) {
	Kn(null), Gn(null), He(null), e && P?.deactivate();
}
function ht() {
	var e = B, t = e.b, n = P, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gt(e) {
	var t = 2 | h;
	return B !== null && (B.f |= S), {
		ctx: Ve,
		deps: null,
		effects: null,
		equals: Re,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: we,
		wv: 0,
		parent: B,
		ac: null
	};
}
var _t = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function vt(e, t, n) {
	let r = B;
	r === null && fe();
	var i = void 0, a = Kt(we), o = !Un, s = /* @__PURE__ */ new Set();
	return wn(() => {
		var t = B, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== le && n.reject(e);
			}).finally(mt);
		} catch (e) {
			n.reject(e), mt();
		}
		var c = P;
		if (o) {
			if (t.f & 32768) var l = ht();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(_t);
			else for (let e of s.values()) e.reject(_t);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== _t && (c.activate(), t ? (a.f |= te, Jt(a, t)) : (a.f & 8388608 && (a.f ^= te), Jt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), yn(() => {
		for (let e of s) e.reject(_t);
	}), new Promise((e) => {
		function t(n) {
			function r() {
				n === i ? e(a) : t(i);
			}
			n.then(r, r);
		}
		t(i);
	});
}
/*#__NO_SIDE_EFFECTS__*/
function N(e) {
	let t = /* @__PURE__ */ gt(e);
	return Jn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function yt(e) {
	let t = /* @__PURE__ */ gt(e);
	return t.equals = Be, t;
}
function bt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) jn(t[n]);
	}
}
function xt(e) {
	var t, n = B, r = e.parent;
	if (!Vn && r !== null && e.v !== we && r.f & 24576) return Oe(), e.v;
	Kn(r);
	try {
		e.f &= ~T, bt(e), t = or(e);
	} finally {
		Kn(n);
	}
	return t;
}
function St(e) {
	var t = xt(e);
	if (!e.equals(t) && (e.wv = rr(), (!P?.is_fork || e.deps === null) && (P === null ? e.v = t : (P.capture(e, t, !0), Et?.capture(e, t, !0)), e.deps === null))) {
		Ze(e, m);
		return;
	}
	Vn || (Dt === null ? Qe(e) : (vn() || P?.is_fork) && Dt.set(e, t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ot(() => {
		t.ac.abort(le), t.ac = null;
	}), t.fn !== null && (t.teardown = d), cr(t, 0), kn(t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && lr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Tt = null, P = null, Et = null, Dt = null, Ot = null, kt = !1, At = !1, jt = null, Mt = null, Nt = 0, Pt = 1, Ft = class e {
	id = Pt++;
	#e = !1;
	linked = !0;
	#t = null;
	#n = null;
	async_deriveds = /* @__PURE__ */ new Map();
	current = /* @__PURE__ */ new Map();
	previous = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = /* @__PURE__ */ new Set();
	#a = 0;
	#o = /* @__PURE__ */ new Map();
	#s = null;
	#c = [];
	#l = [];
	#u = /* @__PURE__ */ new Set();
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Map();
	#p = /* @__PURE__ */ new Set();
	is_fork = !1;
	#m = !1;
	constructor() {
		Tt === null ? Tt = this : (Tt.#n = this, this.#t = Tt), Tt = this;
	}
	#h() {
		if (this.is_fork) return !0;
		for (let n of this.#o.keys()) {
			for (var e = n, t = !1; e.parent !== null;) {
				if (this.#f.has(e)) {
					t = !0;
					break;
				}
				e = e.parent;
			}
			if (!t) return !0;
		}
		return !1;
	}
	skip_effect(e) {
		this.#f.has(e) || this.#f.set(e, {
			d: [],
			m: []
		}), this.#p.delete(e);
	}
	unskip_effect(e, t = (e) => this.schedule(e)) {
		var n = this.#f.get(e);
		if (n) {
			this.#f.delete(e);
			for (var r of n.d) Ze(r, h), t(r);
			for (r of n.m) Ze(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Nt++ > 1e3 && (this.#x(), Lt());
		for (let e of this.#u) this.#d.delete(e), Ze(e, h), this.schedule(e);
		for (let e of this.#d) Ze(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = jt = [], r = [], i = Mt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ht(e), this.#h() || this.discard(), t;
		}
		if (P = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (jt = null, Mt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Vt(e, t);
			i.length > 0 && P.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Et = this, zt(r), zt(n), Et = null, this.#s?.resolve();
		var s = P;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && s.#g();
	}
	#_(e, t, n) {
		e.f ^= m;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= m : i & 4 ? t.push(r) : ir(r) && (i & 16 && this.#d.add(r), lr(r));
				var o = r.first;
				if (o !== null) {
					r = o;
					continue;
				}
			}
			for (; r !== null;) {
				var s = r.next;
				if (s !== null) {
					r = s;
					break;
				}
				r = r.parent;
			}
		}
	}
	#v() {
		for (var e = this.#t; e !== null;) {
			if (!e.is_fork) {
				for (let [t, [, n]] of this.current) if (e.current.has(t) && !n) return e;
			}
			e = e.#t;
		}
		return null;
	}
	#y(e) {
		for (let [t, n] of e.current) !this.previous.has(t) && e.previous.has(t) && this.previous.set(t, e.previous.get(t)), this.current.set(t, n);
		for (let [t, n] of e.async_deriveds) {
			let e = this.async_deriveds.get(t);
			e && n.promise.then(e.resolve).catch(e.reject);
		}
		e.async_deriveds.clear(), this.transfer_effects(e.#u, e.#d);
		let t = (e) => {
			var n = e.reactions;
			if (n !== null && !(e.f & 2 && !(e.f & 6144))) for (let e of n) {
				var r = e.f;
				if (r & 2) t(e);
				else {
					var i = e;
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Ze(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), P = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) et(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== we && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Dt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		P = this;
	}
	deactivate() {
		P = null, Dt = null;
	}
	flush() {
		try {
			At = !0, P = this, this.#g();
		} finally {
			Nt = 0, Ot = null, jt = null, Mt = null, At = !1, P = null, Dt = null, Wt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(_t);
		this.#x(), this.#s?.resolve();
	}
	register_created_effect(e) {
		this.#l.push(e);
	}
	increment(e, t) {
		if (this.#a += 1, e) {
			let e = this.#o.get(t) ?? 0;
			this.#o.set(t, e + 1);
		}
	}
	decrement(e, t) {
		if (--this.#a, e) {
			let e = this.#o.get(t) ?? 0;
			e === 1 ? this.#o.delete(t) : this.#o.set(t, e - 1);
		}
		this.#m || (this.#m = !0, Ke(() => {
			this.#m = !1, this.linked && this.flush();
		}));
	}
	transfer_effects(e, t) {
		for (let t of e) this.#u.add(t);
		for (let e of t) this.#d.add(e);
		e.clear(), t.clear();
	}
	oncommit(e) {
		this.#r.add(e);
	}
	ondiscard(e) {
		this.#i.add(e);
	}
	settled() {
		return (this.#s ??= p()).promise;
	}
	static ensure() {
		if (P === null) {
			let t = P = new e();
			!At && !kt && Ke(() => {
				t.#e || t.flush();
			});
		}
		return P;
	}
	apply() {
		Dt = null;
	}
	schedule(e) {
		if (Ot = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (jt !== null && t === B && (Un === null || !(Un.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= m;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? Tt = e : t.#t = e, this.linked = !1;
		}
	}
};
function It(e) {
	var t = kt;
	kt = !0;
	try {
		var n;
		for (e && (P !== null && !P.is_fork && P.flush(), n = e());;) {
			if (qe(), P === null) return n;
			P.flush();
		}
	} finally {
		kt = t;
	}
}
function Lt() {
	try {
		_e();
	} catch (e) {
		Ye(e, Ot);
	}
}
var Rt = null;
function zt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && ir(r) && (Rt = /* @__PURE__ */ new Set(), lr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nn(r), Rt?.size > 0)) {
				Wt.clear();
				for (let e of Rt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Rt.has(n) && (Rt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || lr(n);
					}
				}
				Rt.clear();
			}
		}
		Rt = null;
	}
}
function Bt(e) {
	P.schedule(e);
}
function Vt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Ze(e, m);
		for (var n = e.first; n !== null;) Vt(n, t), n = n.next;
	}
}
function Ht(e) {
	Ze(e, m);
	for (var t = e.first; t !== null;) Ht(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Ut = /* @__PURE__ */ new Set(), Wt = /* @__PURE__ */ new Map(), Gt = !1;
function Kt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Re,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function F(e, t) {
	let n = Kt(e, t);
	return Jn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function qt(e, t = !1, n = !0) {
	let r = Kt(e);
	return t || (r.equals = Be), r;
}
function I(e, t, n = !1) {
	return Un !== null && (!Wn || Un.f & 131072) && Ue() && Un.f & 4325394 && (qn === null || !qn.has(e)) && xe(), Jt(e, n ? Qt(t) : t, Mt);
}
function Jt(e, t, n = null) {
	if (!e.equals(t)) {
		Wt.set(e, Vn ? t : e.v);
		var r = Ft.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && xt(t), Dt === null && Qe(t);
		}
		e.wv = rr(), Zt(e, h, n), Ue() && B !== null && B.f & 1024 && !(B.f & 96) && (Zn === null ? Qn([e]) : Zn.push(e)), !r.is_fork && Ut.size > 0 && !Gt && Yt();
	}
	return t;
}
function Yt() {
	Gt = !1;
	for (let e of Ut) {
		e.f & 1024 && Ze(e, g);
		let t;
		try {
			t = ir(e);
		} catch {
			t = !0;
		}
		t && lr(e);
	}
	Ut.clear();
}
function Xt(e) {
	I(e, e.v + 1);
}
function Zt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ue(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === B)) {
			var l = (c & h) === 0;
			if (l && Ze(s, t), c & 131072) Ut.add(s);
			else if (c & 2) {
				var u = s;
				Dt?.delete(u), c & 65536 || (c & 512 && (B === null || !(B.f & 2097152)) && (s.f |= T), Zt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Rt !== null && Rt.add(d), n === null ? Bt(d) : n.push(d);
			}
		}
	}
}
function Qt(t) {
	if (typeof t != "object" || !t || D in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ F(0), u = null, d = tr, f = (e) => {
		if (tr === d) return e();
		var t = Un, n = tr;
		Gn(null), nr(d);
		var r = e();
		return Gn(t), nr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ F(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ye();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ F(n.value, u);
				return r.set(t, e), e;
			}) : I(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ F(we, u));
					r.set(t, e), Xt(o);
				}
			} else I(n, we), Xt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === D) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ F(Qt(s ? e[n] : we), u)), r.set(n, o)), o !== void 0) {
				var c = V(o);
				return c === we ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = V(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== we) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === D) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== we || Reflect.has(e, t);
			return (n !== void 0 || B !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ F(i ? Qt(e[t]) : we, u)), r.set(t, n)), V(n) === we) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ F(we, u)), r.set(d + "", p)) : I(p, we);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ F(void 0, u)), I(c, Qt(n)), r.set(t, c));
			else {
				l = c.v !== we;
				var m = f(() => Qt(n));
				I(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && I(g, _ + 1);
				}
				Xt(o);
			}
			return !0;
		},
		ownKeys(e) {
			V(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== we;
			});
			for (var [n, i] of r) i.v !== we && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			be();
		}
	});
}
function $t(e) {
	try {
		if (typeof e == "object" && e && D in e) return e[D];
	} catch {}
	return e;
}
function en(e, t) {
	return Object.is($t(e), $t(t));
}
var tn, nn, rn, an;
function on() {
	if (tn === void 0) {
		tn = window, nn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		rn = a(t, "firstChild").get, an = a(t, "nextSibling").get, u(e) && (e[ae] = void 0, e[ie] = null, e[oe] = void 0, e.__e = void 0), u(n) && (n[se] = void 0);
	}
}
function sn(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function cn(e) {
	return rn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function ln(e) {
	return an.call(e);
}
function L(e, t) {
	if (!O) return /* @__PURE__ */ cn(e);
	var n = /* @__PURE__ */ cn(Ne);
	if (n === null) n = Ne.appendChild(sn());
	else if (t && n.nodeType !== 3) {
		var r = sn();
		return n?.before(r), Pe(r), r;
	}
	return t && mn(n), Pe(n), n;
}
function un(e, t = !1) {
	if (!O) {
		var n = /* @__PURE__ */ cn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
	}
	if (t) {
		if (Ne?.nodeType !== 3) {
			var r = sn();
			return Ne?.before(r), Pe(r), r;
		}
		mn(Ne);
	}
	return Ne;
}
function R(e, t = 1, n = !1) {
	let r = O ? Ne : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ ln(r);
	if (!O) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = sn();
			return r === null ? i?.after(a) : r.before(a), Pe(a), a;
		}
		mn(r);
	}
	return Pe(r), r;
}
function dn(e) {
	e.textContent = "";
}
function fn() {
	return !1;
}
function pn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function mn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function hn(e) {
	B === null && (Un === null && ge(e), he()), Vn && me(e);
}
function gn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function _n(e, t) {
	var n = B;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: Ve,
		deps: null,
		nodes: null,
		f: e | h | 512,
		first: null,
		fn: t,
		last: null,
		next: null,
		parent: n,
		b: n && n.b,
		prev: null,
		teardown: null,
		wv: 0,
		ac: null
	};
	P?.register_created_effect(r);
	var i = r;
	if (e & 4) jt === null ? Ft.ensure().schedule(r) : jt.push(r);
	else if (t !== null) {
		try {
			lr(r);
		} catch (e) {
			throw jn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && gn(i, n), Un !== null && Un.f & 2 && !(e & 64))) {
		var a = Un;
		(a.effects ??= []).push(i);
	}
	return r;
}
function vn() {
	return Un !== null && !Wn;
}
function yn(e) {
	let t = _n(8, null);
	return Ze(t, m), t.teardown = e, t;
}
function bn(e) {
	hn("$effect");
	var t = B.f;
	if (!Un && t & 32 && Ve !== null && !Ve.i) {
		var n = Ve;
		(n.e ??= []).push(e);
	} else return xn(e);
}
function xn(e) {
	return _n(4 | C, e);
}
function Sn(e) {
	Ft.ensure();
	let t = _n(64 | S, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Pn(t, () => {
			jn(t), n(void 0);
		}) : (jn(t), n(void 0));
	});
}
function Cn(e) {
	return _n(4, e);
}
function wn(e) {
	return _n(ee | S, e);
}
function Tn(e, t = 0) {
	return _n(8 | t, e);
}
function z(e, t = [], n = [], r = []) {
	ft(r, t, n, (t) => {
		_n(8, () => {
			e(...t.map(V));
		});
	});
}
function En(e, t = 0) {
	return _n(16 | t, e);
}
function Dn(e) {
	return _n(32 | S, e);
}
function On(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Vn, n = Un;
		Hn(!0), Gn(null);
		try {
			t.call(null);
		} finally {
			Hn(e), Gn(n);
		}
	}
}
function kn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ot(() => {
			e.abort(le);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : jn(n, t), n = r;
	}
}
function An(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || jn(t), t = n;
	}
}
function jn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Mn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, kn(e, t && !n), cr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	On(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && Nn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Mn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ ln(e);
		e.remove(), e = n;
	}
}
function Nn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Pn(e, t, n = !0) {
	var r = [];
	Fn(e, r, !0);
	var i = () => {
		n && jn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Fn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= _;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Fn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function In(e) {
	Ln(e, !0);
}
function Ln(e, t) {
	if (e.f & 8192) {
		e.f ^= _, e.f & 1024 || (Ze(e, h), Ft.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Ln(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Rn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ ln(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var zn = null, Bn = !1, Vn = !1;
function Hn(e) {
	Vn = e;
}
var Un = null, Wn = !1;
function Gn(e) {
	Un = e;
}
var B = null;
function Kn(e) {
	B = e;
}
var qn = null;
function Jn(e) {
	Un !== null && (qn ??= /* @__PURE__ */ new Set()).add(e);
}
var Yn = null, Xn = 0, Zn = null;
function Qn(e) {
	Zn = e;
}
var $n = 1, er = 0, tr = er;
function nr(e) {
	tr = e;
}
function rr() {
	return ++$n;
}
function ir(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (ir(a) && St(a), a.wv > e.wv) return !0;
		}
		t & 512 && Dt === null && Ze(e, m);
	}
	return !1;
}
function ar(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(qn !== null && qn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ar(a, t, !1) : t === a && (n ? Ze(a, h) : a.f & 1024 && Ze(a, g), Bt(a));
	}
}
function or(e) {
	var t = Yn, n = Xn, r = Zn, i = Un, a = qn, o = Ve, s = Wn, c = tr, l = e.f;
	Yn = null, Xn = 0, Zn = null, Un = l & 96 ? null : e, qn = null, He(e.ctx), Wn = !1, tr = ++er, e.ac !== null && (ot(() => {
		e.ac.abort(le);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = P?.is_fork;
		if (Yn !== null) {
			var m;
			if (p || cr(e, Xn), f !== null && Xn > 0) for (f.length = Xn + Yn.length, m = 0; m < Yn.length; m++) f[Xn + m] = Yn[m];
			else e.deps = f = Yn;
			if (vn() && e.f & 512) for (m = Xn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Xn < f.length && (cr(e, Xn), f.length = Xn);
		if (Ue() && Zn !== null && !Wn && f !== null && !(e.f & 6146)) for (m = 0; m < Zn.length; m++) ar(Zn[m], e);
		if (i !== null && i !== e) {
			if (er++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = er;
			if (t !== null) for (let e of t) e.rv = er;
			Zn !== null && (r === null ? r = Zn : r.push(...Zn));
		}
		return e.f & 8388608 && (e.f ^= te), d;
	} catch (e) {
		return Je(e);
	} finally {
		e.f ^= E, Yn = t, Xn = n, Zn = r, Un = i, qn = a, He(o), Wn = s, tr = c;
	}
}
function sr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Yn === null || !n.call(Yn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== we && Qe(s), s.ac !== null && ot(() => {
			s.ac.abort(le), s.ac = null, Ze(s, h);
		}), Ct(s), cr(s, 0);
	}
}
function cr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) sr(e, n[r]);
}
function lr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Ze(e, m);
		var n = B, r = Bn;
		B = e, Bn = !(t & 96);
		try {
			t & 16777232 ? An(e) : kn(e), On(e);
			var i = or(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = $n;
		} finally {
			Bn = r, B = n;
		}
	}
}
async function ur() {
	await Promise.resolve(), It();
}
function V(e) {
	var t = !!(e.f & 2);
	if (zn?.add(e), Un !== null && !Wn && !(B !== null && B.f & 16384) && (qn === null || !qn.has(e))) {
		var r = Un.deps;
		if (Un.f & 2097152) e.rv < er && (e.rv = er, Yn === null && r !== null && r[Xn] === e ? Xn++ : Yn === null ? Yn = [e] : Yn.push(e));
		else {
			Un.deps ??= [], n.call(Un.deps, e) || Un.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Un] : n.call(i, Un) || i.push(Un);
		}
	}
	if (Vn && Wt.has(e)) return Wt.get(e);
	if (t) {
		var a = e;
		if (Vn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || fr(a)) && (o = xt(a)), Wt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Wn && Un !== null && (Bn || !!(Un.f & 512)), c = (a.f & y) === 0;
		ir(a) && (s && (a.f |= 512), St(a)), s && !c && (wt(a), dr(a));
	}
	if (Dt?.has(e)) return Dt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function dr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (wt(t), dr(t));
}
function fr(e) {
	if (e.v === we) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Wt.has(t) || t.f & 2 && fr(t)) return !0;
	return !1;
}
function pr(e) {
	var t = Wn;
	try {
		return Wn = !0, e();
	} finally {
		Wn = t;
	}
}
function mr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (D in e) hr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && D in n && hr(n);
		}
	}
}
function hr(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			hr(e[n], t);
		} catch {}
		let n = l(e);
		if (n !== Object.prototype && n !== Array.prototype && n !== Map.prototype && n !== Set.prototype && n !== Date.prototype) {
			let t = o(n);
			for (let n in t) {
				let r = t[n].get;
				if (r) try {
					r.call(e);
				} catch {}
			}
		}
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var gr = ["touchstart", "touchmove"];
function _r(e) {
	return gr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var vr = Symbol("events"), yr = /* @__PURE__ */ new Set(), br = /* @__PURE__ */ new Set();
function xr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Tr.call(t, e), !e.cancelBubble) return ot(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ke(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function Sr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = xr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && yn(() => {
		t.removeEventListener(e, o, a);
	});
}
function H(e, t, n) {
	(t[vr] ??= {})[e] = n;
}
function Cr(e) {
	for (var t = 0; t < e.length; t++) yr.add(e[t]);
	for (var n of br) n(e);
}
var wr = null;
function Tr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	wr = e;
	var s = 0, c = wr === e && e[vr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[vr] = t;
			return;
		}
		var u = a.indexOf(t);
		if (u === -1) return;
		l <= u && (s = l);
	}
	if (o = a[s] || e.target, o !== t) {
		i(e, "currentTarget", {
			configurable: !0,
			get() {
				return o || n;
			}
		});
		var d = Un, f = B;
		Gn(null), Kn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[vr]?.[r];
					h != null && (!o.disabled || e.target === o) && h.call(o, e);
				} catch (e) {
					p ? m.push(e) : p = e;
				}
				if (e.cancelBubble) break;
				s++, o = s < a.length ? a[s] : null;
			}
			if (p) {
				for (let e of m) queueMicrotask(() => {
					throw e;
				});
				throw p;
			}
		} finally {
			e[vr] = t, delete e.currentTarget, Gn(d), Kn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Er = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Dr(e) {
	return Er?.createHTML(e) ?? e;
}
function Or(e) {
	var t = pn("template");
	return t.innerHTML = Dr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function kr(e, t) {
	var n = B;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function U(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (O) return kr(Ne, null), Ne;
		i === void 0 && (i = Or(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ cn(i)));
		var t = r || nn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ cn(t), s = t.lastChild;
			kr(o, s);
		} else kr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ar(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (O) return kr(Ne, null), Ne;
		if (!o) {
			var e = /* @__PURE__ */ cn(Or(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ cn(e);) o.appendChild(/* @__PURE__ */ cn(e));
			else o = /* @__PURE__ */ cn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ cn(t), r = t.lastChild;
			kr(n, r);
		} else kr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function jr(e, t) {
	return /* @__PURE__ */ Ar(e, t, "svg");
}
function Mr() {
	if (O) return kr(Ne, null), Ne;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = sn();
	return e.append(t, n), kr(t, n), e;
}
function W(e, t) {
	if (O) {
		var n = B;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = Ne), Fe();
		return;
	}
	e !== null && e.before(t);
}
function G(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[se] ??= e.nodeValue) && (e[se] = n, e.nodeValue = `${n}`);
}
function Nr(e, t) {
	return Fr(e, t);
}
var Pr = /* @__PURE__ */ new Map();
function Fr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	on();
	var l = void 0, u = Sn(() => {
		var s = n ?? t.appendChild(sn());
		ut(s, { pending: () => {} }, (t) => {
			j({});
			var n = Ve;
			if (o && (n.c = o), a && (i.$$events = a), O && kr(t, null), l = e(t, i) || {}, O && (B.nodes.end = Ne, Ne === null || Ne.nodeType !== 8 || Ne.data !== "]")) throw ke(), Ce;
			M();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = _r(r);
					for (let e of [t, document]) {
						var a = Pr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Pr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Tr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(yr)), br.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Pr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Tr), r.delete(e), r.size === 0 && Pr.delete(n)) : r.set(e, i);
			}
			br.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Ir.set(l, u), l;
}
var Ir = /* @__PURE__ */ new WeakMap();
function Lr(e, t) {
	let n = Ir.get(e);
	return n ? (Ir.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Rr = class {
	anchor;
	#e = /* @__PURE__ */ new Map();
	#t = /* @__PURE__ */ new Map();
	#n = /* @__PURE__ */ new Map();
	#r = /* @__PURE__ */ new Set();
	#i = !0;
	constructor(e, t = !0) {
		this.anchor = e, this.#i = t;
	}
	#a = (e) => {
		if (this.#e.has(e)) {
			var t = this.#e.get(e), n = this.#t.get(t);
			if (n) In(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (In(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (jn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Rn(r, t), t.append(sn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else jn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Pn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (jn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = P, r = fn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = sn();
				i.append(a), this.#n.set(e, {
					effect: Dn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, Dn(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else O && (this.anchor = Ne), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function K(e, t, n = !1) {
	var r;
	O && (r = Ne, Fe());
	var i = new Rr(e), a = n ? x : 0;
	function o(e, t) {
		if (O) {
			var n = Le(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ie();
				Pe(a), i.anchor = a, Me(!1), i.ensure(e, t), Me(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	En(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/key.js
var zr = Symbol("NaN");
function Br(e, t, n) {
	O && Fe();
	var r = new Rr(e), i = !Ue();
	En(() => {
		var e = t();
		e !== e && (e = zr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Vr(e, t) {
	return t;
}
function Hr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Pn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Ur(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null;
		if (l) {
			var u = n, d = u.parentNode;
			dn(d), d.append(u), e.items.clear();
		}
		Ur(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Ur(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= w, Rn(a, document.createDocumentFragment())) : jn(t[i], n);
	}
}
var Wr;
function q(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = O ? Pe(/* @__PURE__ */ cn(u)) : u.appendChild(sn());
	}
	O && Fe();
	var d = null, f = /* @__PURE__ */ yt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Kr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Jr(d, null, c)) : In(d) : Pn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: En(() => {
			p = V(f);
			var e = p.length;
			let t = !1;
			O && Le(c) === "[!" != (e === 0) && (c = Ie(), Pe(c), Me(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = P, v = fn(), y = 0; y < e; y += 1) {
				O && Ne.nodeType === 8 && Ne.data === "]" && (c = Ne, t = !0, Me(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Jt(S.v, b), S.i && Jt(S.i, y), v && u.unskip_effect(S.e)) : (S = qr(l, h ? c : Wr ??= sn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Dn(() => s(c)) : (d = Dn(() => s(Wr ??= sn())), d.f |= w)), e > r.size && pe("", "", ""), O && e > 0 && Pe(Ie()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Me(!0), V(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, O && (c = Ne);
}
function Gr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Kr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Gr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (In(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Jr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Yr(e, d, _), Yr(e, _, y), Jr(_, y, n), d = _, p = [], m = [], l = Gr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Jr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Yr(e, S.prev, C.next), Yr(e, d, S), Yr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Jr(_, l, n), Yr(e, _.prev, _.next), Yr(e, _, d === null ? e.effect.first : d.next), Yr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Gr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Gr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Ur(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Gr(l.next);
		var E = T.length;
		if (E > 0) {
			var ee = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Hr(e, T, ee);
		}
	}
	o && Ke(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function qr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Kt(n) : /* @__PURE__ */ qt(n, !1, !1) : null, l = o & 2 ? Kt(i) : null;
	return {
		v: c,
		i: l,
		e: Dn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Jr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ ln(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Yr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Xr(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		O && (o = Pe(/* @__PURE__ */ cn(c)));
	}
	z(() => {
		var e = B;
		if (s === (s = t() ?? "")) {
			O && Fe();
			return;
		}
		if (n && !O) {
			e.nodes = null, c.innerHTML = s, s !== "" && kr(/* @__PURE__ */ cn(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Mn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (O) {
				for (var a = Ne.data, l = Fe(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ ln(l);
				if (l === null) throw ke(), Ce;
				kr(Ne, u), o = Pe(l);
				return;
			}
			var d = pn(r ? "svg" : i ? "math" : "template", r ? Ee : i ? De : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (kr(/* @__PURE__ */ cn(f), f.lastChild), r || i) for (; /* @__PURE__ */ cn(f);) o.before(/* @__PURE__ */ cn(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function Zr(e, t, ...n) {
	var r = new Rr(e);
	En(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, x);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/actions.js
function Qr(e, t, n) {
	Cn(() => {
		var r = pr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			Tn(() => {
				var e = n();
				mr(e), i && ze(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function $r(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = $r(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function ei() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = $r(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function ti(e) {
	return typeof e == "object" ? ei(e) : e ?? "";
}
var ni = [..." 	\n\r\f\xA0\v﻿"];
function ri(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || ni.includes(r[o - 1])) && (s === r.length || ni.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ii(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ai(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function oi(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ai)), i && c.push(...Object.keys(i).map(ai));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ai(e.substring(l, u).trim());
							if (!c.includes(p)) {
								f !== ";" && d++;
								var m = e.substring(l, d).trim();
								n += " " + m + ";";
							}
						}
						l = d + 1, u = -1;
					}
				}
			}
		}
		return r && (n += ii(r)), i && (n += ii(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function J(e, t, n, r, i, a) {
	var o = e[ae];
	if (O || o !== n || o === void 0) {
		var s = ri(n, r, a);
		(!O || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ae] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function si(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ci(e, t, n, r) {
	var i = e[oe];
	if (O || i !== t) {
		var a = oi(t, r);
		(!O || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[oe] = t;
	} else r && (Array.isArray(r) ? (si(e, n?.[0], r[0]), si(e, n?.[1], r[1], "important")) : si(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function li(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ae();
		for (var i of t.options) i.selected = n.includes(fi(i));
		return;
	}
	for (i of t.options) if (en(fi(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function ui(e) {
	var t = new MutationObserver(() => {
		"__value" in e && li(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), yn(() => {
		t.disconnect();
	});
}
function di(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	st(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), fi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && fi(o);
		}
		n(a), e.__value = a, P !== null && r.add(P);
	}), Cn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = P;
			if (r.has(o)) return;
		}
		if (li(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = fi(s), n(a));
		}
		e.__value = a, i = !1;
	}), ui(e);
}
function fi(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var pi = Symbol("is custom element"), mi = Symbol("is html"), hi = ue ? "link" : "LINK", gi = ue ? "progress" : "PROGRESS";
function _i(e) {
	if (O) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Y(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Y(e, "checked", null), e.checked = r;
				}
			}
		};
		e[ce] = n, Ke(n), at();
	}
}
function vi(e, t) {
	var n = bi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === gi) && (e.value = t ?? "");
}
function yi(e, t) {
	var n = bi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Y(e, t, n, r) {
	var i = bi(e);
	O && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === hi) || i[t] !== (i[t] = n) && (t === "loading" && (e[re] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Si(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function bi(e) {
	return e[ie] ??= {
		[pi]: e.nodeName.includes("-"),
		[mi]: e.namespaceURI === Te
	};
}
var xi = /* @__PURE__ */ new Map();
function Si(e) {
	var t = e.getAttribute("is") || e.nodeName, n = xi.get(t);
	if (n) return n;
	xi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Ci(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	st(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Ti(e) ? Ei(a) : a, n(a), P !== null && r.add(P), await ur(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (O && e.defaultValue !== e.value || pr(t) == null && e.value) && (n(Ti(e) ? Ei(e.value) : e.value), P !== null && r.add(P)), Tn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = P;
			if (r.has(i)) return;
		}
		Ti(e) && n === Ei(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function wi(e, t, n = t) {
	st(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (O && e.defaultChecked !== e.checked || pr(t) == null) && n(e.checked), Tn(() => {
		e.checked = !!t();
	});
}
function Ti(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Ei(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Di(e, t) {
	return e === t || e?.[D] === t;
}
function Oi(e = {}, t, n, r) {
	var i = Ve.r, a = B;
	return Cn(() => {
		var o, s;
		return Tn(() => {
			o = s, s = r?.() || [], pr(() => {
				Di(n(...s), e) || (t(e, ...s), o && Di(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Di(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function ki(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ gt(r), V(u)) : (l && (l = !1, c = s ? pr(r) : r), c);
	let f;
	if (o) {
		var p = D in e || ne in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = nt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ve(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (l = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (c = void 0), n === void 0 ? c : n;
	};
	if (i && !(n & 4)) return g;
	if (f) {
		var _ = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || _ || h) && f(t ? g() : e), e) : g();
		});
	}
	var v = !1, y = (n & 1 ? gt : yt)(() => (v = !1, g()));
	o && V(y);
	var b = B;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? V(y) : i && o ? Qt(e) : e;
			return I(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Vn && v || b.f & 16384 ? y.v : V(y);
	});
}
function Ai(e) {
	Ve === null && de("onMount"), bn(() => {
		let t = pr(e);
		if (typeof t == "function") return t;
	});
}
function ji(e) {
	Ve === null && de("onDestroy"), Ai(() => () => pr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/components/Icon.svelte
var Mi = /* @__PURE__ */ U("<i></i>");
function X(e, t) {
	let n = ki(t, "className", 3, "");
	var r = Mi();
	z(() => {
		Y(r, "data-lucide", t.name), J(r, 1, ti(n()));
	}), W(e, r);
}
//#endregion
//#region src/components/StatusPresentation.svelte
var Ni = /* @__PURE__ */ U("<span><!></span>"), Pi = /* @__PURE__ */ U("<span data-component-owner=\"status-presentation\" aria-hidden=\"true\"></span>");
function Fi(e, t) {
	j(t, !0);
	let n = ki(t, "className", 3, "");
	var r = Mr(), i = un(r), a = (e) => {
		var r = Pi();
		q(r, 21, () => t.status.statuses, (e) => e.key, (e, t) => {
			var n = Ni();
			X(L(n), {
				get name() {
					return V(t).iconName;
				},
				className: "task-status-icon"
			}), k(n), z(() => J(n, 1, `task-status-indicator ${V(t).className} ${V(t).recentOutput ? "task-status-fresh" : ""}`)), W(e, n);
		}), k(r), z(() => J(r, 1, `task-status-slot ${n()} ${t.status.slotClassName}`)), W(e, r);
	};
	K(i, (e) => {
		t.status.hasTaskState && e(a);
	}), W(e, r), M();
}
//#endregion
//#region src/components/AttentionList.svelte
var Ii = /* @__PURE__ */ U("<div class=\"activity-row empty-attention\"><!><div><strong>No activity</strong><span>Follow a resource or start a turn.</span></div></div>"), Li = /* @__PURE__ */ U("<span role=\"button\" tabindex=\"0\"><!></span>"), Ri = /* @__PURE__ */ U("<span class=\"attention-dismiss\" role=\"button\" tabindex=\"0\" title=\"Dismiss\"><!></span>"), zi = /* @__PURE__ */ U("<button type=\"button\"><span class=\"activity-status\" aria-hidden=\"true\"><span class=\"activity-status-fallback-slot\"><!></span> <span class=\"activity-status-runtime-slot\"><!></span></span> <span class=\"activity-title\"><strong> </strong><span class=\"activity-meta\"> </span></span> <span class=\"activity-actions\"><!> <!></span></button>"), Bi = /* @__PURE__ */ U("<section class=\"attention-section\" data-component-owner=\"attention-list\"><div class=\"section-title\"><span>Activity</span></div> <nav class=\"attention-list\" aria-label=\"Activity list\"><!></nav></section>");
function Vi(e, t) {
	j(t, !0);
	function n(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function r(e) {
		return e.type === "project" ? "folder" : e.type === "task" ? "file-text" : e.type === "scheduler" ? "calendar-clock" : "home";
	}
	function i(e) {
		return e.type === "project" || e.type === "task";
	}
	function a(e) {
		return [
			e.ref || e.id,
			e.agentName ? `Agent ${e.agentName}` : "",
			e.turnNumber > 0 ? `Turn ${e.turnNumber}` : "No turns",
			e.statusLabel
		].filter(Boolean).join(" · ");
	}
	async function o(e) {
		try {
			await t.onSelect(e.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function s(e, n) {
		e.preventDefault(), e.stopPropagation(), e instanceof MouseEvent && e.currentTarget?.blur();
		try {
			await t.onToggleAttention(n.id, !n.followed);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function c(e, n) {
		e.preventDefault(), e.stopPropagation();
		try {
			await t.onDismiss(n.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function l(e, t) {
		(e.key === "Enter" || e.key === " ") && t(e);
	}
	var u = Bi(), d = R(L(u), 2), f = L(d), p = (e) => {
		var t = Ii();
		X(L(t), { name: "message-square" }), A(), k(t), W(e, t);
	}, m = (e) => {
		var u = Mr();
		q(un(u), 17, () => t.items, (e) => e.id, (e, t) => {
			var u = zi(), d = L(u), f = L(d), p = L(f);
			{
				let e = /* @__PURE__ */ N(() => r(V(t)));
				X(p, {
					get name() {
						return V(e);
					},
					className: "activity-status-fallback"
				});
			}
			k(f);
			var m = R(f, 2);
			Fi(L(m), {
				get status() {
					return V(t).status;
				},
				className: "activity-status-icon"
			}), k(m), k(d);
			var h = R(d, 2), g = L(h), _ = L(g, !0);
			k(g);
			var v = R(g), y = L(v, !0);
			k(v), k(h);
			var b = R(h, 2), x = L(b), S = (e) => {
				var n = Li();
				let r;
				X(L(n), { name: "star" }), k(n), z(() => {
					r = J(n, 1, "attention-star", null, r, { followed: V(t).followed }), Y(n, "aria-label", V(t).followed ? `Unfollow ${V(t).title}` : `Follow ${V(t).title}`), Y(n, "title", V(t).followed ? "Unfollow" : "Follow");
				}), H("click", n, (e) => s(e, V(t))), H("keydown", n, (e) => l(e, (e) => s(e, V(t)))), W(e, n);
			}, C = /* @__PURE__ */ N(() => i(V(t)));
			K(x, (e) => {
				V(C) && e(S);
			});
			var w = R(x, 2), T = (e) => {
				var n = Ri();
				X(L(n), { name: "x" }), k(n), z(() => Y(n, "aria-label", `Dismiss ${V(t).title}`)), H("click", n, (e) => c(e, V(t))), H("keydown", n, (e) => l(e, (e) => c(e, V(t)))), W(e, n);
			};
			K(w, (e) => {
				V(t).activeTurn || e(T);
			}), k(b), k(u), z((e, n, r) => {
				J(u, 1, e), Y(u, "aria-current", V(t).selected ? "page" : void 0), Y(u, "data-active-turn", V(t).activeTurn || void 0), Y(u, "aria-label", n), Y(u, "title", V(t).statusLabel || void 0), Y(f, "hidden", V(t).status.hasTaskState), Y(m, "hidden", !V(t).status.hasTaskState), G(_, V(t).title), G(y, r);
			}, [
				() => `activity-row ${n(V(t).status)} ${V(t).selected ? "selected" : ""}`,
				() => `${V(t).title}. ${a(V(t))}`,
				() => a(V(t))
			]), H("click", u, () => o(V(t))), W(e, u);
		}), W(e, u);
	};
	K(f, (e) => {
		t.items.length === 0 ? e(p) : e(m, -1);
	}), k(d), k(u), W(e, u), M();
}
Cr(["click", "keydown"]);
//#endregion
//#region src/components/MobileToolbar.svelte
var Hi = /* @__PURE__ */ U("<header class=\"mobile-toolbar\" data-component-owner=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" type=\"button\" aria-label=\"Toggle immersive chat\"><span class=\"mobile-immersive-icon mobile-immersive-icon-collapse\"><!></span><span class=\"mobile-immersive-icon mobile-immersive-icon-expand\"><!></span></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" data-component-owner=\"mobile-toolbar\" type=\"button\" aria-label=\"Close navigation\"></button>", 1);
function Ui(e, t) {
	j(t, !0);
	var n = Hi(), r = un(n), i = L(r);
	X(L(i), { name: "menu" }), k(i);
	var a = R(i, 2), o = L(a), s = R(o, 2);
	k(a);
	var c = R(a, 2);
	let l;
	var u = L(c);
	X(L(u), { name: "minimize-2" }), k(u);
	var d = R(u);
	X(L(d), { name: "maximize-2" }), k(d), k(c), k(r);
	var f = R(r, 2);
	z(() => {
		Y(i, "aria-expanded", t.sidebarOpen), Y(o, "aria-selected", t.view === "details"), Y(s, "aria-selected", t.view === "chat"), l = J(c, 1, "mobile-icon-button mobile-immersive-button", null, l, { immersive: t.immersive }), Y(c, "aria-pressed", t.immersive);
	}), H("click", i, () => t.onSidebar(!t.sidebarOpen)), H("click", o, () => t.onView("details")), H("click", s, () => t.onView("chat")), H("click", c, () => t.onImmersive(!t.immersive)), H("click", f, () => t.onSidebar(!1)), W(e, n), M();
}
Cr(["click"]);
//#endregion
//#region src/components/PaneResizeHandle.svelte
var Wi = /* @__PURE__ */ U("<div data-component-owner=\"pane-resize-handle\" role=\"separator\"></div>");
function Gi(e, t) {
	j(t, !0);
	let n = null;
	ji(() => n?.());
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
	var i = Wi();
	z(() => {
		Y(i, "id", t.id), J(i, 1, `resize-handle ${t.className}`), Y(i, "aria-orientation", t.kind === "sidebarAttentionHeight" ? "horizontal" : "vertical"), Y(i, "aria-label", t.label);
	}), H("pointerdown", i, r), W(e, i), M();
}
Cr(["pointerdown"]);
//#endregion
//#region src/components/ProjectTree.svelte
var Ki = /* @__PURE__ */ U("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), qi = /* @__PURE__ */ U("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Ji = /* @__PURE__ */ U("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Yi = /* @__PURE__ */ U("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), Xi = /* @__PURE__ */ U("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Zi = /* @__PURE__ */ U("<div class=\"task-group\"></div>"), Qi = /* @__PURE__ */ U("<button type=\"button\"><span><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), $i = /* @__PURE__ */ U("<section class=\"tree-section\" data-component-owner=\"project-tree\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section>");
function ea(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(null), i = /* @__PURE__ */ F(Qt(t.identity));
	bn(() => {
		t.identity !== V(i) && (I(i, t.identity, !0), d());
	}), ji(d);
	function a(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function o(e) {
		return !V(r) || V(r).id !== e ? "" : V(r).after ? "drop-after" : "drop-before";
	}
	function s(e) {
		return !V(n) || V(n).id === e.id || V(n).kind !== e.kind ? !1 : e.kind !== "task" || V(n).projectId === e.projectId;
	}
	function c(e, i) {
		e.stopPropagation(), I(n, i, !0), I(r, null), t.onDragState(i), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", i.id));
	}
	function l(e, t) {
		if (!s(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		I(r, {
			id: t.id,
			after: e.clientY > n.top + n.height / 2
		}, !0);
	}
	async function u(e, i) {
		if (e.preventDefault(), !V(n) || !s(i)) return;
		let a = V(n), o = V(r)?.id === i.id && V(r).after;
		d();
		try {
			await t.onReorder(a, i, o);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function d() {
		V(n) && t.onDragState(null), I(n, null), I(r, null);
	}
	async function f(e, n) {
		let r = e.target instanceof Element ? e.target : null;
		if (!r?.closest(".drag-handle")) try {
			n.type === "project" && r?.closest("[data-project-toggle]") ? await t.onToggle(n.id) : await t.onSelect(n.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function p(e, n) {
		e.preventDefault(), e.stopPropagation(), e instanceof MouseEvent && e.currentTarget?.blur();
		try {
			await t.onToggleAttention(n.id, !n.followed);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function m(e, t) {
		(e.key === "Enter" || e.key === " ") && p(e, t);
	}
	var h = $i(), g = L(h), _ = R(L(g));
	X(L(_), { name: "plus" }), k(_), k(g);
	var v = R(g, 2), y = L(v), b = (e) => {
		var t = Ki();
		X(L(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(2), k(t), W(e, t);
	}, x = (e) => {
		var n = qi(), r = L(n);
		X(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = R(r, 2), a = L(i, !0);
		k(i), k(n), z(() => G(a, t.error)), W(e, n);
	}, S = (e) => {
		var t = Ji();
		X(L(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(t), W(e, t);
	}, C = (e) => {
		var r = Mr();
		q(un(r), 17, () => t.projects, (e) => e.id, (e, t) => {
			var r = Qi(), i = un(r), s = L(i);
			let h;
			var g = L(s), _ = (e) => {
				X(e, { name: "chevron-right" });
			};
			K(g, (e) => {
				V(t).children.length && e(_);
			}), k(s);
			var v = R(s, 2);
			Fi(v, { get status() {
				return V(t).status;
			} });
			var y = R(v, 2);
			X(y, {
				name: "folder",
				className: "tree-icon"
			});
			var b = R(y, 2), x = L(b), S = L(x, !0);
			k(x);
			var C = R(x), w = L(C, !0);
			k(C);
			var T = R(C), E = (e) => {
				var n = Yi(), r = L(n), i = L(r, !0);
				k(r);
				var a = R(r, 2), o = L(a, !0);
				k(a), k(n), z(() => {
					G(i, V(t).summary.taskLabel), G(o, V(t).summary.runningLabel);
				}), W(e, n);
			};
			K(T, (e) => {
				V(t).summary && !V(t).expanded && e(E);
			}), k(b);
			var ee = R(b, 2);
			let te;
			X(L(ee), { name: "star" }), k(ee);
			var D = R(ee, 2);
			X(L(D), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), k(D), k(i);
			var ne = R(i, 2), re = (e) => {
				var r = Zi();
				q(r, 21, () => V(t).children, (e) => e.id, (e, r) => {
					var i = Xi(), s = R(L(i), 2);
					Fi(s, { get status() {
						return V(r).status;
					} });
					var h = R(s, 2);
					X(h, {
						name: "file-text",
						className: "tree-icon"
					});
					var g = R(h), _ = L(g), v = L(_, !0);
					k(_);
					var y = R(_), b = L(y, !0);
					k(y), k(g);
					var x = R(g, 2);
					let S;
					X(L(x), { name: "star" }), k(x);
					var C = R(x, 2);
					X(L(C), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), k(C), k(i), z((e) => {
						J(i, 1, e), Y(i, "aria-label", V(r).ariaLabel || void 0), Y(i, "title", V(r).statusLabel || void 0), G(v, V(r).title), G(b, V(r).ref), S = J(x, 1, "attention-star", null, S, { followed: V(r).followed }), Y(x, "aria-checked", V(r).followed), Y(x, "aria-label", V(r).followed ? `Unfollow ${V(r).title}` : `Follow ${V(r).title}`), Y(x, "title", V(r).followed ? "Unfollow" : "Follow");
					}, [() => `tree-item task-item ${a(V(r).status)} ${V(r).active ? "active" : ""} ${V(n)?.id === V(r).id ? "drag-source" : ""} ${o(V(r).id)}`]), H("click", i, (e) => f(e, V(r))), Sr("dragover", i, (e) => l(e, {
						kind: "task",
						id: V(r).id,
						projectId: V(t).id
					})), Sr("drop", i, (e) => u(e, {
						kind: "task",
						id: V(r).id,
						projectId: V(t).id
					})), H("click", x, (e) => p(e, V(r))), H("keydown", x, (e) => m(e, V(r))), Sr("dragstart", C, (e) => c(e, {
						kind: "task",
						id: V(r).id,
						projectId: V(t).id
					})), Sr("dragend", C, d), W(e, i);
				}), k(r), W(e, r);
			};
			K(ne, (e) => {
				V(t).expanded && e(re);
			}), z((e) => {
				J(i, 1, e), Y(i, "aria-label", V(t).ariaLabel || void 0), Y(i, "title", V(t).statusLabel || void 0), h = J(s, 1, "chevron", null, h, { expanded: V(t).expanded }), Y(s, "data-project-toggle", V(t).children.length ? V(t).id : void 0), G(S, V(t).title), G(w, V(t).ref), te = J(ee, 1, "attention-star", null, te, { followed: V(t).followed }), Y(ee, "aria-checked", V(t).followed), Y(ee, "aria-label", V(t).followed ? `Unfollow ${V(t).title}` : `Follow ${V(t).title}`), Y(ee, "title", V(t).followed ? "Unfollow" : "Follow");
			}, [() => `tree-item ${a(V(t).status)} ${V(t).active ? "active" : ""} ${V(n)?.id === V(t).id ? "drag-source" : ""} ${o(V(t).id)}`]), H("click", i, (e) => f(e, V(t))), Sr("dragover", i, (e) => l(e, {
				kind: "project",
				id: V(t).id,
				projectId: ""
			})), Sr("drop", i, (e) => u(e, {
				kind: "project",
				id: V(t).id,
				projectId: ""
			})), H("click", ee, (e) => p(e, V(t))), H("keydown", ee, (e) => m(e, V(t))), Sr("dragstart", D, (e) => c(e, {
				kind: "project",
				id: V(t).id,
				projectId: ""
			})), Sr("dragend", D, d), W(e, r);
		}), W(e, r);
	};
	K(y, (e) => {
		t.loading ? e(b) : t.error ? e(x, 1) : t.projects.length === 0 ? e(S, 2) : e(C, -1);
	}), k(v), k(h), z(() => Y(v, "data-navigation-identity", t.identity)), H("click", _, function(...e) {
		t.onCreate?.apply(this, e);
	}), W(e, h), M();
}
Cr(["click", "keydown"]);
//#endregion
//#region src/components/SchedulerNav.svelte
var ta = /* @__PURE__ */ U("<section class=\"scheduler-nav\" data-component-owner=\"scheduler-nav\"><button type=\"button\"><!> <!> <span><strong>Scheduler</strong><small>Natural-language schedules</small></span> <!></button></section>");
function na(e, t) {
	j(t, !0);
	async function n() {
		if (t.item) try {
			await t.onSelect(t.item.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var r = ta(), i = L(r);
	let a;
	var o = L(i), s = (e) => {
		Fi(e, { get status() {
			return t.item.status;
		} });
	};
	K(o, (e) => {
		t.item && e(s);
	});
	var c = R(o, 2);
	X(c, {
		name: "clock-3",
		className: "scheduler-nav-icon"
	}), X(R(c, 4), {
		name: "chevron-right",
		className: "scheduler-nav-chevron"
	}), k(i), k(r), z(() => {
		i.disabled = !t.item, Y(i, "title", t.item?.statusLabel || "Workspace Scheduler"), a = J(i, 1, "", null, a, { active: t.item?.active });
	}), H("click", i, n), W(e, r), M();
}
Cr(["click"]);
//#endregion
//#region src/components/WorkspaceSwitcher.svelte
var ra = /* @__PURE__ */ U("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), ia = /* @__PURE__ */ U("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), aa = /* @__PURE__ */ U("<section class=\"workspace-switcher\" data-component-owner=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <span class=\"workspace-switcher-icon workspace-switcher-icon-idle\"><!></span><span class=\"workspace-switcher-icon workspace-switcher-icon-busy\"><!></span></button> <!></div></section>");
function oa(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(!1), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(Qt(t.identity)), a = /* @__PURE__ */ N(() => t.workspaces.find((e) => e.id === t.activeWorkspaceId) ?? null);
	bn(() => {
		t.identity !== V(i) && (I(i, t.identity, !0), I(n, !1), I(r, ""));
	}), Ai(() => {
		let e = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			V(n) && !t?.closest(".workspace-select-row") && I(n, !1);
		}, r = (e) => {
			e.key === "Escape" && !t.mobileSidebarOpen && I(n, !1);
		};
		return document.addEventListener("mousedown", e), document.addEventListener("keydown", r), () => {
			document.removeEventListener("mousedown", e), document.removeEventListener("keydown", r);
		};
	});
	async function o(e) {
		if (!(!e || V(r))) {
			I(r, e, !0), I(n, !1);
			try {
				await t.onSwitch(e);
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				I(r, "");
			}
		}
	}
	var s = aa(), c = L(s), l = L(c);
	let u;
	var d = L(l), f = L(d);
	k(d);
	var p = R(d, 2), m = L(p, !0);
	k(p);
	var h = R(p, 2);
	X(L(h), {
		name: "chevrons-up-down",
		className: "select-icon"
	}), k(h);
	var g = R(h);
	X(L(g), {
		name: "loader-circle",
		className: "select-icon"
	}), k(g), k(l);
	var _ = R(l, 2), v = (e) => {
		var i = ia(), a = R(L(i), 2);
		q(a, 17, () => t.workspaces, (e) => e.id, (e, n) => {
			var i = ra(), a = L(i), s = L(a);
			k(a);
			var c = R(a, 2), l = L(c), u = L(l, !0);
			k(l);
			var d = R(l), f = L(d, !0);
			k(d), k(c);
			var p = R(c, 2), m = (e) => {
				X(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			K(p, (e) => {
				V(n).id === t.activeWorkspaceId && e(m);
			}), k(i), z((e) => {
				Y(i, "aria-selected", V(n).id === t.activeWorkspaceId), Y(i, "data-workspace-id", V(n).id), i.disabled = e, Y(s, "src", V(n).iconSrc), G(u, V(n).name || V(n).id), G(f, V(n).path);
			}, [() => !!V(r)]), H("click", i, () => o(V(n).id)), W(e, i);
		});
		var s = R(a, 2), c = L(s);
		X(L(c), { name: "plus" }), A(), k(c), k(s), k(i), H("click", c, () => {
			I(n, !1), t.onAdd();
		}), W(e, i);
	};
	K(_, (e) => {
		V(n) && e(v);
	}), k(c), k(s), z((e) => {
		u = J(l, 1, "workspace-switcher-button", null, u, e), Y(l, "aria-expanded", V(n)), Y(f, "src", V(a)?.iconSrc || "/favicon.svg"), G(m, V(a)?.name || "Workspace");
	}, [() => ({ busy: !!V(r) })]), H("click", l, (e) => {
		e.stopPropagation(), I(n, !V(n));
	}), W(e, s), M();
}
Cr(["click"]);
//#endregion
//#region src/components/AppShell.svelte
var sa = /* @__PURE__ */ U("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div class=\"tty-panel\"><!><div id=\"ttyLog\" class=\"tty-log\" data-component-owner=\"event-timeline\"><!></div><div id=\"ttyComposer\" class=\"tty-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div>");
function ca(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(0);
	Ai(() => {
		let e = t.channel.subscribe((e) => {
			I(n, e, !0), queueMicrotask(e.onIconsChanged);
		}), r = (e) => {
			e.key === "Escape" && V(n).mobile.sidebarOpen && V(n).onMobileSidebar(!1);
		}, i = () => {
			V(n).onHistoryNavigation(window.location.pathname).catch((e) => {
				V(n).onToast(e instanceof Error ? e.message : String(e));
			});
		}, a = window.visualViewport, o = /* @__PURE__ */ new Set(), s = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 980px)") : {
			matches: !1,
			addEventListener: () => void 0,
			removeEventListener: () => void 0
		}, c = () => {
			let e = document.documentElement;
			if (!s.matches || !a) {
				e.style.removeProperty("--app-viewport-height"), e.style.removeProperty("--app-viewport-offset-top"), e.style.removeProperty("--app-viewport-offset-left");
				return;
			}
			e.style.setProperty("--app-viewport-height", `${a.height}px`), e.style.setProperty("--app-viewport-offset-top", `${a.offsetTop}px`), e.style.setProperty("--app-viewport-offset-left", `${a.offsetLeft}px`);
		}, l = () => {
			(window.scrollX !== 0 || window.scrollY !== 0) && window.scrollTo(0, 0), c();
		}, u = () => {
			for (let e of o) window.clearTimeout(e);
			o.clear();
		}, d = (e) => {
			let t = window.setTimeout(() => {
				o.delete(t), l();
			}, e);
			o.add(t);
		}, f = () => {
			u(), d(0), d(300);
		}, p = () => {
			V(n).onPaneViewport(), c();
		};
		return document.addEventListener("keydown", r), document.addEventListener("focusout", f), window.addEventListener("resize", p), window.addEventListener("orientationchange", f), window.addEventListener("popstate", i), a?.addEventListener("resize", c), a?.addEventListener("scroll", c), s.addEventListener?.("change", p), c(), () => {
			e(), document.removeEventListener("keydown", r), document.removeEventListener("focusout", f), window.removeEventListener("resize", p), window.removeEventListener("orientationchange", f), window.removeEventListener("popstate", i), a?.removeEventListener("resize", c), a?.removeEventListener("scroll", c), s.removeEventListener?.("change", p), u(), document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
		};
	}), bn(() => {
		document.body.classList.toggle("mobile-sidebar-open", V(n).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", V(n).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", V(n).mobile.immersive);
	}), bn(() => {
		let e = V(n).route;
		!e.path || e.revision <= V(r) || (I(r, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	var i = sa(), a = L(i);
	Ui(a, {
		get sidebarOpen() {
			return V(n).mobile.sidebarOpen;
		},
		get view() {
			return V(n).mobile.view;
		},
		get immersive() {
			return V(n).mobile.immersive;
		},
		get onSidebar() {
			return V(n).onMobileSidebar;
		},
		get onView() {
			return V(n).onMobileView;
		},
		get onImmersive() {
			return V(n).onMobileImmersive;
		}
	});
	var o = R(a, 2), s = L(o), c = R(L(s)), l = R(L(c)), u = L(l, !0);
	k(l), k(c);
	var d = R(c);
	X(L(d), { name: "settings" }), k(d), k(s);
	var f = R(s, 2);
	oa(f, {
		get identity() {
			return V(n).identity;
		},
		get mobileSidebarOpen() {
			return V(n).mobile.sidebarOpen;
		},
		get activeWorkspaceId() {
			return V(n).activeWorkspaceId;
		},
		get workspaces() {
			return V(n).workspaces;
		},
		get onSwitch() {
			return V(n).onSwitchWorkspace;
		},
		get onAdd() {
			return V(n).onAddWorkspace;
		},
		get onToast() {
			return V(n).onToast;
		}
	});
	var p = R(f, 2);
	{
		let e = /* @__PURE__ */ N(() => V(n).scheduler || null);
		na(p, {
			get item() {
				return V(e);
			},
			get onSelect() {
				return V(n).onSelectResource;
			},
			get onToast() {
				return V(n).onToast;
			}
		});
	}
	var m = R(p, 2);
	ea(m, {
		get identity() {
			return V(n).identity;
		},
		get loading() {
			return V(n).loading;
		},
		get error() {
			return V(n).error;
		},
		get projects() {
			return V(n).projects;
		},
		get onCreate() {
			return V(n).onCreateProject;
		},
		get onToggle() {
			return V(n).onToggleProject;
		},
		get onSelect() {
			return V(n).onSelectResource;
		},
		get onReorder() {
			return V(n).onReorder;
		},
		get onDragState() {
			return V(n).onDragState;
		},
		get onToggleAttention() {
			return V(n).onToggleAttention;
		},
		get onToast() {
			return V(n).onToast;
		}
	});
	var h = R(m, 2);
	Gi(h, {
		id: "activityResize",
		kind: "sidebarAttentionHeight",
		className: "horizontal-resize sidebar-activity-resize",
		label: "Resize activity panel",
		get onPreview() {
			return V(n).onPanePreview;
		},
		get onCommit() {
			return V(n).onPaneCommit;
		}
	}), Vi(R(h, 2), {
		get items() {
			return V(n).attentionList;
		},
		get onSelect() {
			return V(n).onSelectResource;
		},
		get onToggleAttention() {
			return V(n).onToggleAttention;
		},
		get onDismiss() {
			return V(n).onDismissAttention;
		},
		get onToast() {
			return V(n).onToast;
		}
	}), k(o);
	var g = R(o, 2);
	Gi(g, {
		id: "sidebarResize",
		kind: "sidebarWidth",
		className: "sidebar-resize",
		label: "Resize sidebar",
		get onPreview() {
			return V(n).onPanePreview;
		},
		get onCommit() {
			return V(n).onPaneCommit;
		}
	});
	var _ = R(g, 2), v = L(_), y = L(v);
	X(L(y), { name: "menu" }), k(y), k(v);
	var b = R(v, 2), x = L(b), S = L(x), C = R(S, 2);
	k(x), k(b);
	var w = R(b, 2), T = L(w), E = (e) => {
		var n = Mr();
		Zr(un(n), () => t.details), W(e, n);
	};
	K(T, (e) => {
		t.details && e(E);
	}), k(w);
	var ee = R(w, 2);
	Gi(ee, {
		id: "detailsResize",
		kind: "chatWidth",
		className: "details-resize",
		label: "Resize chat panel",
		get onPreview() {
			return V(n).onPanePreview;
		},
		get onCommit() {
			return V(n).onPaneCommit;
		}
	});
	var te = R(ee, 2), D = L(te), ne = L(D), re = (e) => {
		var n = Mr();
		Zr(un(n), () => t.agentHeader), W(e, n);
	};
	K(ne, (e) => {
		t.agentHeader && e(re);
	});
	var ie = R(ne), ae = L(ie), oe = (e) => {
		var n = Mr();
		Zr(un(n), () => t.timeline), W(e, n);
	};
	K(ae, (e) => {
		t.timeline && e(oe);
	}), k(ie);
	var se = R(ie), ce = L(se), le = (e) => {
		var n = Mr();
		Zr(un(n), () => t.composer), W(e, n);
	};
	K(ce, (e) => {
		t.composer && e(le);
	}), k(se), k(D), k(te), k(_), k(i), z(() => {
		G(u, V(n).version), Y(y, "aria-expanded", V(n).mobile.sidebarOpen), Y(S, "aria-selected", V(n).mobile.view === "details"), Y(C, "aria-selected", V(n).mobile.view === "chat");
	}), H("click", d, () => {
		V(n).onMobileSidebar(!1), V(n).onOpenSettings();
	}), H("click", y, () => V(n).onMobileSidebar(!0)), H("click", S, () => V(n).onMobileView("details")), H("click", C, () => V(n).onMobileView("chat")), W(e, i), M();
}
Cr(["click"]);
//#endregion
//#region src/components/AgentPanelHeader.svelte
var la = /* @__PURE__ */ U("<span class=\"agent-header-queued\"> </span>"), ua = /* @__PURE__ */ U("<span class=\"agent-header-model\"> </span>"), da = /* @__PURE__ */ U("<span class=\"agent-header-turn\"> </span>"), fa = /* @__PURE__ */ U("<header class=\"agent-panel-header\" data-component-owner=\"agent-panel-header\"><div class=\"agent-header-left\"><span class=\"agent-status-dot\" aria-hidden=\"true\"></span> <span class=\"agent-header-name\"> </span> <span class=\"agent-header-state\"> </span> <!></div> <div class=\"agent-header-right\"><!> <!></div></header>");
function pa(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(Qt(Date.now()));
	Ai(() => t.channel.subscribe((e) => {
		I(n, e, !0);
	}));
	let i = /* @__PURE__ */ N(() => V(n).resourceId ? V(n).submitting ? "submitting" : V(n).status?.state || "loading" : "empty"), a = /* @__PURE__ */ N(() => V(i) === "submitting" ? "Submitting" : V(i) === "working" ? "Working" : V(i) === "idle" ? "Idle" : V(i) === "attention_required" ? "Attention required" : V(i) === "unavailable" ? "Unavailable" : V(i) === "archived" ? "Archived" : V(i) === "loading" ? "Loading" : "No resource selected"), o = /* @__PURE__ */ N(() => V(n).status?.waitingMessages?.length || 0), s = /* @__PURE__ */ N(() => Date.parse(V(n).turnStartedAt || "")), c = /* @__PURE__ */ N(() => V(i) === "working" && Number.isFinite(V(s)));
	bn(() => {
		if (!V(c)) return;
		I(r, Date.now(), !0);
		let e = window.setInterval(() => {
			I(r, Date.now(), !0);
		}, 1e3);
		return () => window.clearInterval(e);
	});
	function l(e) {
		let t = Math.max(0, e), n = Math.floor(t / 3600), r = Math.floor(t % 3600 / 60), i = t % 60, a = (e) => String(e).padStart(2, "0");
		return n > 0 ? `${n}:${a(r)}:${a(i)}` : `${a(r)}:${a(i)}`;
	}
	let u = /* @__PURE__ */ N(() => {
		let e = V(n).turnNumber;
		if (V(i) === "submitting") return "Message pending";
		if (V(i) === "idle") return e > 0 ? `Idle · Turn ${e} completed` : "";
		if (V(i) === "empty" || V(i) === "loading") return "";
		if (Number.isFinite(V(s))) {
			let t = l(Math.floor((V(r) - V(s)) / 1e3));
			return e > 0 ? `Turn ${e} · ${t}` : t;
		}
		return e > 0 ? `Turn ${e}` : "";
	});
	var d = fa(), f = L(d), p = R(L(f), 2), m = L(p, !0);
	k(p);
	var h = R(p, 2), g = L(h, !0);
	k(h);
	var _ = R(h, 2), v = (e) => {
		var t = la(), n = L(t);
		k(t), z(() => G(n, `· ${V(o) ?? ""} queued`)), W(e, t);
	};
	K(_, (e) => {
		V(o) > 0 && e(v);
	}), k(f);
	var y = R(f, 2), b = L(y), x = (e) => {
		var t = ua(), r = L(t, !0);
		k(t), z(() => G(r, V(n).modelSummary)), W(e, t);
	};
	K(b, (e) => {
		V(n).modelSummary && e(x);
	});
	var S = R(b, 2), C = (e) => {
		var t = da(), n = L(t, !0);
		k(t), z(() => G(n, V(u))), W(e, t);
	};
	K(S, (e) => {
		V(u) && e(C);
	}), k(y), k(d), z(() => {
		Y(d, "data-state", V(i)), G(m, V(n).agentName), G(g, V(a));
	}), W(e, d), M();
}
//#endregion
//#region src/components/AgentBindingSelector.svelte
var ma = /* @__PURE__ */ U("<button type=\"button\" class=\"agent-binding-option\" role=\"option\"><span class=\"agent-binding-option-label\"> </span> <!></button>"), ha = /* @__PURE__ */ U("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Profiles\"><div class=\"agent-binding-group-title\">Profiles</div> <!></div>"), ga = /* @__PURE__ */ U("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Agents\"><div class=\"agent-binding-group-title\">Agents</div> <!></div>"), _a = /* @__PURE__ */ U("<div class=\"agent-binding-menu\" role=\"listbox\" tabindex=\"-1\"><!> <!></div>"), va = /* @__PURE__ */ U("<span class=\"agent-binding\"><button type=\"button\" class=\"agent-binding-button\" aria-haspopup=\"listbox\"><span class=\"agent-binding-label\"> </span> <!></button> <!></span>");
function ya(e, t) {
	j(t, !0);
	let n = ki(t, "disabled", 3, !1), r = ki(t, "ariaLabel", 3, "Agent binding"), i = /* @__PURE__ */ N(m), a = /* @__PURE__ */ N(h), o = /* @__PURE__ */ N(() => g(t.value)), s = /* @__PURE__ */ N(() => [...V(i), ...V(a)].find((e) => g(e.value) === V(o))?.label || t.value.name || "Unavailable"), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(void 0), u = /* @__PURE__ */ F(void 0);
	bn(() => {
		if (!V(c) || !V(u)) return;
		d();
		let e = V(u).querySelector("[aria-selected=\"true\"]") ?? V(u).querySelector(".agent-binding-option");
		ur().then(() => e?.focus());
	}), Ai(() => {
		let e = (e) => {
			V(c) && e.target instanceof Node && !V(l)?.contains(e.target) && I(c, !1);
		}, t = () => {
			V(c) && d();
		};
		return document.addEventListener("mousedown", e), window.addEventListener("resize", t), () => {
			document.removeEventListener("mousedown", e), window.removeEventListener("resize", t);
		};
	});
	function d() {
		if (!V(l) || !V(u)) return;
		let e = V(l).getBoundingClientRect().top, t = Math.max(120, Math.floor(e - 14));
		V(u).style.maxHeight = `${t}px`;
	}
	function f(e) {
		return e.trim().toLowerCase();
	}
	function p(e) {
		return t.agents.find((t) => f(t.id) === f(e))?.label || e || "Unavailable";
	}
	function m() {
		let e = t.profiles.map((e) => ({
			value: {
				kind: "profile",
				name: e.key
			},
			label: `${e.key} (current: ${p(e.agentName || "")})`
		}));
		return t.value.kind === "profile" && !t.profiles.some((e) => f(e.key) === f(t.value.name)) && e.unshift({
			value: t.value,
			label: `${t.value.name} (missing profile)`
		}), e;
	}
	function h() {
		let e = t.agents.map((e) => {
			let n = t.profiles.filter((t) => f(t.agentName || "") === f(e.id)).map((e) => e.key);
			return {
				value: {
					kind: "agent",
					name: e.id
				},
				label: n.length ? `${e.label} (${n.join(", ")})` : e.label
			};
		});
		return t.value.kind === "agent" && !t.agents.some((e) => f(e.id) === f(t.value.name)) && e.unshift({
			value: t.value,
			label: `${t.value.name} (missing agent)`
		}), e;
	}
	function g(e) {
		return `${e.kind}:${encodeURIComponent(e.name)}`;
	}
	function _(e) {
		I(c, !1), g(e.value) !== V(o) && t.onSelect(e.value);
	}
	function v(e) {
		e.key === "Escape" && (e.stopPropagation(), I(c, !1));
	}
	var y = va(), b = L(y), x = L(b), S = L(x, !0);
	k(x), X(R(x, 2), {
		name: "chevrons-up-down",
		className: "agent-binding-icon"
	}), k(b);
	var C = R(b, 2), w = (e) => {
		var t = _a(), n = L(t), s = (e) => {
			var t = ha();
			q(R(L(t), 2), 17, () => V(i), (e) => g(e.value), (e, t) => {
				var n = ma(), r = L(n), i = L(r, !0);
				k(r);
				var a = R(r, 2), s = (e) => {
					X(e, {
						name: "check",
						className: "agent-binding-check"
					});
				}, c = /* @__PURE__ */ N(() => g(V(t).value) === V(o));
				K(a, (e) => {
					V(c) && e(s);
				}), k(n), z((e, r) => {
					Y(n, "aria-selected", e), Y(n, "data-binding", r), G(i, V(t).label);
				}, [() => g(V(t).value) === V(o), () => g(V(t).value)]), H("click", n, () => _(V(t))), W(e, n);
			}), k(t), W(e, t);
		};
		K(n, (e) => {
			V(i).length && e(s);
		});
		var c = R(n, 2), l = (e) => {
			var t = ga();
			q(R(L(t), 2), 17, () => V(a), (e) => g(e.value), (e, t) => {
				var n = ma(), r = L(n), i = L(r, !0);
				k(r);
				var a = R(r, 2), s = (e) => {
					X(e, {
						name: "check",
						className: "agent-binding-check"
					});
				}, c = /* @__PURE__ */ N(() => g(V(t).value) === V(o));
				K(a, (e) => {
					V(c) && e(s);
				}), k(n), z((e, r) => {
					Y(n, "aria-selected", e), Y(n, "data-binding", r), G(i, V(t).label);
				}, [() => g(V(t).value) === V(o), () => g(V(t).value)]), H("click", n, () => _(V(t))), W(e, n);
			}), k(t), W(e, t);
		};
		K(c, (e) => {
			V(a).length && e(l);
		}), k(t), Oi(t, (e) => I(u, e), () => V(u)), z(() => Y(t, "aria-label", r())), H("keydown", t, v), W(e, t);
	};
	K(C, (e) => {
		V(c) && e(w);
	}), k(y), Oi(y, (e) => I(l, e), () => V(l)), z(() => {
		b.disabled = n(), Y(b, "aria-expanded", V(c)), Y(b, "aria-label", r()), G(S, V(s));
	}), H("click", b, () => {
		I(c, !V(c));
	}), W(e, y), M();
}
Cr(["click", "keydown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var ba = /* @__PURE__ */ U("<div class=\"tty-turn-stop-notice\" role=\"status\"><span> </span> <button type=\"button\" class=\"tty-turn-stop-dismiss\" aria-label=\"Dismiss turn stop notice\">Dismiss</button></div>"), xa = /* @__PURE__ */ U("<div class=\"tty-message-item\"><span class=\"tty-message-text\"> </span> <span class=\"tty-message-mode\"> </span> <button type=\"button\" class=\"tty-message-steer\"><!> <span>Insert now</span></button></div>"), Sa = /* @__PURE__ */ U("<div class=\"tty-message-queue-error\" role=\"alert\"> </div>"), Ca = /* @__PURE__ */ U("<section class=\"tty-message-queue\" aria-label=\"Waiting messages\"><div class=\"tty-message-queue-header\"><span>Waiting messages</span><span class=\"tty-message-count\"> </span></div> <div class=\"tty-message-list\"></div> <!></section>"), wa = /* @__PURE__ */ U("<div class=\"tty-send-feedback\" data-send-state=\"submitting\" role=\"status\" aria-live=\"polite\"><!> <span class=\"tty-send-feedback-content\"><strong>Submitting</strong><span class=\"tty-send-feedback-text\"> </span></span></div>"), Ta = /* @__PURE__ */ U("<button type=\"button\" id=\"agentEndTurnButton\" title=\"End current turn\" aria-label=\"End current turn\"><span class=\"tty-composer-icon tty-composer-icon-idle\"><!></span><span class=\"tty-composer-icon tty-composer-icon-busy\"><!></span></button>"), Ea = /* @__PURE__ */ U("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), Da = /* @__PURE__ */ U("<!> <!> <!> <form id=\"ttyForm\" class=\"tty-input\"><textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <div class=\"tty-composer-bar\"><button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button> <div class=\"tty-composer-options\"><span class=\"tty-agent-binding\"><!></span> <!> <button type=\"submit\"><span class=\"tty-composer-icon tty-composer-icon-idle\"><!></span><span class=\"tty-composer-icon tty-composer-icon-busy\"><!></span></button></div></div></form> <!>", 1);
function Oa(e, t) {
	j(t, !0);
	let n = t.channel.current(), r = /* @__PURE__ */ F(Qt(n)), i = /* @__PURE__ */ F(Qt(n.identity)), a = /* @__PURE__ */ F(Qt(n.draftResetVersion)), o = /* @__PURE__ */ F(Qt(n.draft)), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F(""), u = /* @__PURE__ */ F(""), d = /* @__PURE__ */ F(!1), f = /* @__PURE__ */ F(void 0), p = /* @__PURE__ */ N(() => !!V(r).unavailableReason || V(s) || V(r).sending);
	Ai(() => t.channel.subscribe((e) => {
		V(r), I(r, e, !0), e.identity === V(i) ? e.draftResetVersion !== V(a) && (I(a, e.draftResetVersion, !0), I(o, e.draft, !0), I(l, "")) : (I(i, e.identity, !0), I(a, e.draftResetVersion, !0), I(o, e.draft, !0), I(s, !1), I(c, ""), I(l, ""), I(u, ""), I(d, !1)), queueMicrotask(e.onIconsChanged);
	})), bn(() => {
		V(o), ur().then(y);
	});
	function m() {
		return {
			workspaceId: V(r).workspaceId,
			resourceId: V(r).resourceId,
			draftKey: V(r).draftKey
		};
	}
	function h(e) {
		I(o, e, !0), I(l, ""), V(r).onDraft(e, m());
	}
	async function g(e) {
		e?.preventDefault();
		let t = V(o);
		if (V(p) || !t.trim() || !V(r).workspaceId || !V(r).resourceId) return;
		let n = V(i), a = m();
		I(s, !0), I(c, t, !0), I(l, "");
		try {
			let e = await V(r).onSend(t, a);
			if (V(i) !== n) return;
			if (!e.accepted) {
				I(c, ""), I(l, "Message was not accepted. Please try again.");
				return;
			}
			e.clear && V(o) === t && h(""), I(c, "");
		} catch (e) {
			V(i) === n && (I(c, ""), I(l, e instanceof Error ? e.message : String(e), !0));
		} finally {
			V(i) === n && (I(s, !1), await ur(), V(f)?.focus({ preventScroll: !0 }));
		}
	}
	async function _(e) {
		if (!(!V(r).canSteerWaiting || V(r).steeringMessageId)) {
			I(u, "");
			try {
				await V(r).onSteerWaiting(e);
			} catch (e) {
				I(u, e instanceof Error ? e.message : String(e), !0);
			}
		}
	}
	function v(e) {
		if (!(e.key !== "Enter" || e.isComposing || e.keyCode === 229)) {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault(), g();
				return;
			}
			if (e.shiftKey) {
				I(d, !0);
				return;
			}
			V(d) || (e.preventDefault(), g());
		}
	}
	function y() {
		if (!V(f)) return;
		V(f).style.height = "auto";
		let e = Math.min(V(f).scrollHeight, 160);
		V(f).style.height = `${e}px`, V(f).style.overflowY = V(f).scrollHeight > 160 ? "auto" : "hidden";
	}
	function b(e) {
		V(r).onSaveAgentBinding(e);
	}
	var x = Da(), S = un(x), C = (e) => {
		var t = ba(), n = L(t), i = L(n, !0);
		k(n);
		var a = R(n, 2);
		k(t), z(() => G(i, V(r).stopNotice)), H("click", a, function(...e) {
			V(r).onDismissStopNotice?.apply(this, e);
		}), W(e, t);
	};
	K(S, (e) => {
		V(r).stopNotice && e(C);
	});
	var w = R(S, 2), T = (e) => {
		var t = Ca(), n = L(t), i = R(L(n)), a = L(i, !0);
		k(i), k(n);
		var o = R(n, 2);
		q(o, 21, () => V(r).waitingMessages, (e) => e.messageId, (e, t) => {
			var n = xa(), i = L(n), a = L(i, !0);
			k(i);
			var o = R(i, 2), s = L(o, !0);
			k(o);
			var c = R(o, 2), l = L(c), u = (e) => {
				X(e, { name: "loader-circle" });
			}, d = (e) => {
				X(e, { name: "corner-up-left" });
			};
			K(l, (e) => {
				V(r).steeringMessageId === V(t).messageId ? e(u) : e(d, -1);
			}), A(2), k(c), k(n), z((e) => {
				Y(n, "data-message-id", V(t).messageId), Y(i, "title", V(t).text), G(a, V(t).text), G(s, V(t).actualMode || V(t).requestedMode), c.disabled = e, Y(c, "title", V(r).canSteerWaiting ? "Insert this waiting message into the current turn" : "Available when the current turn supports steer"), Y(c, "aria-label", `Insert waiting message into current turn: ${V(t).text}`);
			}, [() => !V(r).canSteerWaiting || !!V(r).steeringMessageId]), H("click", c, () => _(V(t).messageId)), W(e, n);
		}), k(o);
		var s = R(o, 2), c = (e) => {
			var t = Sa(), n = L(t, !0);
			k(t), z(() => G(n, V(u))), W(e, t);
		};
		K(s, (e) => {
			V(u) && e(c);
		}), k(t), z(() => G(a, V(r).waitingMessages.length)), W(e, t);
	};
	K(w, (e) => {
		V(r).waitingMessages.length && e(T);
	});
	var E = R(w, 2), ee = (e) => {
		var t = wa(), n = L(t);
		X(n, { name: "loader-circle" });
		var r = R(n, 2), i = R(L(r)), a = L(i, !0);
		k(i), k(r), k(t), z(() => G(a, V(c))), W(e, t);
	};
	K(E, (e) => {
		V(c) && e(ee);
	});
	var te = R(E, 2), D = L(te);
	rt(D), Oi(D, (e) => I(f, e), () => V(f));
	var ne = R(D, 2), re = L(ne);
	X(L(re), { name: "plus" }), k(re);
	var ie = R(re, 2), ae = L(ie), oe = L(ae);
	{
		let e = /* @__PURE__ */ N(() => V(p) || V(r).bindingSaving);
		ya(oe, {
			get value() {
				return V(r).agentBinding;
			},
			get profiles() {
				return V(r).agentProfiles;
			},
			get agents() {
				return V(r).agents;
			},
			get disabled() {
				return V(e);
			},
			ariaLabel: "Binding target",
			onSelect: b
		});
	}
	k(ae);
	var se = R(ae, 2), ce = (e) => {
		var t = Ta();
		let n;
		var i = L(t);
		X(L(i), { name: "pause" }), k(i);
		var a = R(i);
		X(L(a), { name: "loader-circle" }), k(a), k(t), z(() => {
			n = J(t, 1, "tty-composer-action tty-end-turn-button", null, n, { busy: V(r).endingTurn }), t.disabled = V(r).endingTurn;
		}), H("click", t, function(...e) {
			V(r).onEndTurn?.apply(this, e);
		}), W(e, t);
	};
	K(se, (e) => {
		V(r).canEndTurn && e(ce);
	});
	var le = R(se, 2);
	let ue;
	var de = L(le);
	X(L(de), { name: "send" }), k(de);
	var fe = R(de);
	X(L(fe), { name: "loader-circle" }), k(fe), k(le), k(ie), k(ne), k(te);
	var pe = R(te, 2), me = (e) => {
		var t = Ea(), n = L(t), r = L(n, !0);
		k(n);
		var i = R(n);
		k(t), z(() => {
			G(r, V(l)), i.disabled = V(s);
		}), H("click", i, () => g()), W(e, t);
	};
	K(pe, (e) => {
		V(l) && e(me);
	}), z((e) => {
		Y(D, "data-agent-draft-key", V(r).draftKey), Y(D, "placeholder", V(r).unavailableReason || "Message this resource"), D.disabled = V(p), vi(D, V(o)), re.disabled = e, ue = J(le, 1, "tty-send-button", null, ue, { busy: V(s) }), Y(le, "title", V(s) ? "Sending..." : V(r).unavailableReason || "Send input"), Y(le, "aria-label", V(s) ? "Sending..." : V(r).unavailableReason || "Send input"), le.disabled = V(p);
	}, [() => !!V(r).unavailableReason]), Sr("submit", te, g), H("input", D, (e) => h(e.currentTarget.value)), H("keydown", D, v), H("click", re, function(...e) {
		V(r).onOpenUpload?.apply(this, e);
	}), W(e, x), M();
}
Cr([
	"click",
	"input",
	"keydown"
]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var ka = /* @__PURE__ */ U("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function Aa(e, t) {
	j(t, !0);
	let n = ki(t, "draft", 7);
	var r = ka(), i = L(r);
	rt(i);
	var a = R(i, 2);
	_i(a), k(r), z(() => {
		vi(i, n().description), vi(a, n().slug);
	}), H("input", i, (e) => n().description = e.currentTarget.value), H("input", a, (e) => n().slug = e.currentTarget.value), W(e, r), M();
}
Cr(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var ja = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary compact\"> </button>"), Ma = /* @__PURE__ */ U("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), Na = /* @__PURE__ */ U("<p class=\"create-task-preview-hint\">Updating preview...</p>"), Pa = /* @__PURE__ */ U("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), Fa = /* @__PURE__ */ U("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Ia = /* @__PURE__ */ U("<small> </small>"), La = /* @__PURE__ */ U("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), Ra = /* @__PURE__ */ U("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), za = /* @__PURE__ */ U("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Ba = /* @__PURE__ */ U("<!> <!> <!>", 1), Va = /* @__PURE__ */ U("<p class=\"create-task-blank-detail\"> </p>"), Ha = /* @__PURE__ */ U("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), Ua = /* @__PURE__ */ U("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), Wa = /* @__PURE__ */ U("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function Ga(e, t) {
	j(t, !0);
	let n = ki(t, "draft", 7), r = /* @__PURE__ */ F(Qt(n().editedMarkdown ?? "")), i = null, a = /* @__PURE__ */ N(() => !!t.preview && V(r) !== t.preview?.markdown);
	bn(() => {
		let e = t.preview?.markdown ?? null;
		if (e === i) return;
		let a = n().editedMarkdown == null || n().editedMarkdown === i;
		i = e, a && (I(r, e ?? "", !0), n().editedMarkdown = e);
	});
	function o(e) {
		I(r, e, !0), n().editedMarkdown = e;
	}
	function s() {
		I(r, t.preview?.markdown ?? "", !0), n().editedMarkdown = t.preview?.markdown ?? null;
	}
	var c = Wa(), l = L(c), u = R(L(l), 2), d = (e) => {
		var n = ja(), r = L(n, !0);
		k(n), z(() => {
			n.disabled = t.previewing || t.submitting, G(r, t.previewing ? "Rendering..." : "Refresh");
		}), H("click", n, function(...e) {
			t.onRefresh?.apply(this, e);
		}), W(e, n);
	};
	K(u, (e) => {
		t.selectedTemplate && e(d);
	}), k(l);
	var f = R(l, 2), p = (e) => {
		var i = Ba(), c = un(i), l = (e) => {
			var n = Ma(), r = L(n, !0);
			k(n), z(() => G(r, t.previewError)), W(e, n);
		};
		K(c, (e) => {
			t.previewError && e(l);
		});
		var u = R(c, 2), d = (e) => {
			W(e, Na());
		};
		K(u, (e) => {
			!t.previewError && t.stale && t.preview && e(d);
		});
		var f = R(u, 2), p = (e) => {
			var i = La(), c = L(i), l = L(c, !0);
			k(c);
			var u = R(c, 2);
			rt(u);
			var d = R(u, 2), f = (e) => {
				var t = Pa(), n = R(L(t), 2);
				k(t), H("click", n, s), W(e, t);
			}, p = (e) => {
				W(e, Fa());
			};
			K(d, (e) => {
				V(a) ? e(f) : e(p, -1);
			});
			var m = R(d, 2), h = (e) => {
				var n = Ia(), r = L(n);
				k(n), z(() => G(r, `Slug: ${t.preview.slug ?? ""}`)), W(e, n);
			};
			K(m, (e) => {
				t.preview.slug && e(h);
			});
			var g = R(m, 2), _ = (e) => {
				var r = Ia(), i = L(r);
				k(r), z(() => G(i, `Template ${n().templateName ?? ""} · ${t.templateDigest ?? ""}`)), W(e, r);
			};
			K(g, (e) => {
				t.templateDigest && e(_);
			}), k(i), z(() => {
				G(l, t.preview.title), vi(u, V(r));
			}), H("input", u, (e) => o(e.currentTarget.value)), W(e, i);
		}, m = (e) => {
			W(e, Ra());
		}, h = (e) => {
			W(e, za());
		};
		K(f, (e) => {
			t.preview ? e(p) : t.previewing ? e(m, 1) : t.previewError || e(h, 2);
		}), W(e, i);
	}, m = (e) => {
		var t = Ua(), r = L(t), i = L(r, !0);
		k(r);
		var a = R(r, 2), o = (e) => {
			var t = Va(), r = L(t, !0);
			k(t), z(() => G(r, n().detail)), W(e, t);
		}, s = /* @__PURE__ */ N(() => n().detail.trim()), c = (e) => {
			W(e, Ha());
		};
		K(a, (e) => {
			V(s) ? e(o) : e(c, -1);
		});
		var l = R(a, 2), u = (e) => {
			var t = Ia(), r = L(t);
			k(t), z((e) => G(r, `Slug: ${e ?? ""}`), [() => n().slug.trim()]), W(e, t);
		}, d = /* @__PURE__ */ N(() => n().slug.trim());
		K(l, (e) => {
			V(d) && e(u);
		}), k(t), z((e) => G(i, e), [() => n().title.trim() || "Untitled task"]), W(e, t);
	};
	K(f, (e) => {
		t.selectedTemplate ? e(p) : e(m, -1);
	}), k(c), W(e, c), M();
}
Cr(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var Ka = /* @__PURE__ */ U("<input type=\"checkbox\"/><span> </span>", 1), qa = /* @__PURE__ */ U("<span> </span>"), Ja = /* @__PURE__ */ U("<textarea></textarea>"), Ya = /* @__PURE__ */ U("<option> </option>"), Xa = /* @__PURE__ */ U("<select><option>Select...</option><!></select>"), Za = /* @__PURE__ */ U("<input/>"), Qa = /* @__PURE__ */ U("<small> </small>"), $a = /* @__PURE__ */ U("<label><!> <!> <!> <!> <!></label>"), eo = /* @__PURE__ */ U("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function to(e, t) {
	j(t, !0);
	function n(e, n) {
		let r = n.currentTarget;
		t.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var r = eo();
	q(r, 21, () => t.fields, (e) => e.name, (e, r) => {
		var i = $a();
		let a;
		var o = L(i), s = (e) => {
			var i = Ka(), a = un(i);
			_i(a);
			var o = R(a), s = L(o);
			k(o), z(() => {
				yi(a, t.values[V(r).name] === !0), G(s, `${V(r).label ?? ""}${V(r).required ? " *" : ""}`);
			}), H("change", a, (e) => n(V(r), e)), W(e, i);
		}, c = (e) => {
			var t = qa(), n = L(t);
			k(t), z(() => G(n, `${V(r).label ?? ""}${V(r).required ? " *" : ""}`)), W(e, t);
		};
		K(o, (e) => {
			V(r).type === "boolean" ? e(s) : e(c, -1);
		});
		var l = R(o, 2), u = (e) => {
			var i = Ja();
			rt(i), z((e) => {
				i.required = V(r).required, Y(i, "placeholder", V(r).placeholder || ""), vi(i, e);
			}, [() => String(t.values[V(r).name] ?? "")]), H("input", i, (e) => n(V(r), e)), W(e, i);
		};
		K(l, (e) => {
			V(r).type === "textarea" && e(u);
		});
		var d = R(l, 2), f = (e) => {
			var i = Xa(), a = L(i);
			a.value = a.__value = "", q(R(a), 17, () => V(r).options || [], Vr, (e, t) => {
				var n = Ya(), r = L(n, !0);
				k(n);
				var i = {};
				z(() => {
					G(r, V(t)), i !== (i = V(t)) && (n.value = (n.__value = V(t)) ?? "");
				}), W(e, n);
			}), k(i);
			var o;
			ui(i), z((e) => {
				i.required = V(r).required, o !== (o = e) && (i.value = (i.__value = e) ?? "", li(i, e));
			}, [() => String(t.values[V(r).name] ?? "")]), H("change", i, (e) => n(V(r), e)), W(e, i);
		};
		K(d, (e) => {
			V(r).type === "select" && e(f);
		});
		var p = R(d, 2), m = (e) => {
			var i = Za();
			_i(i), z((e) => {
				i.required = V(r).required, Y(i, "placeholder", V(r).placeholder || ""), vi(i, e);
			}, [() => String(t.values[V(r).name] ?? "")]), H("input", i, (e) => n(V(r), e)), W(e, i);
		};
		K(p, (e) => {
			V(r).type === "text" && e(m);
		});
		var h = R(p, 2), g = (e) => {
			var t = Qa(), n = L(t, !0);
			k(t), z(() => G(n, V(r).description)), W(e, t);
		};
		K(h, (e) => {
			V(r).description && e(g);
		}), k(i), z(() => a = J(i, 1, "", null, a, { "template-boolean": V(r).type === "boolean" })), W(e, i);
	}), k(r), z(() => Y(r, "aria-label", t.label)), W(e, r), M();
}
Cr(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var no = /* @__PURE__ */ U("<small> </small>"), ro = /* @__PURE__ */ U("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), io = /* @__PURE__ */ U("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function ao(e, t) {
	j(t, !0);
	function n(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var r = io(), i = R(L(r), 2), a = L(i);
	let o;
	var s = R(L(a), 4);
	X(L(s), { name: "check" }), k(s), k(a), q(R(a, 2), 17, () => t.templates, (e) => e.name, (e, r) => {
		var i = ro();
		let a;
		var o = L(i), s = L(o, !0);
		k(o);
		var c = R(o, 2), l = (e) => {
			var t = no(), n = L(t, !0);
			k(t), z(() => G(n, V(r).description)), W(e, t);
		};
		K(c, (e) => {
			V(r).description && e(l);
		});
		var u = R(c, 2);
		X(L(u), { name: "check" }), k(u), k(i), z((e) => {
			Y(i, "aria-selected", t.selectedName === V(r).name), a = J(i, 1, "template-card", null, a, { selected: t.selectedName === V(r).name }), i.disabled = !V(r).valid || t.disabled, G(s, e);
		}, [() => n(V(r))]), H("click", i, () => t.onSelect(V(r).name)), W(e, i);
	}), k(i), k(r), z(() => {
		Y(a, "aria-selected", t.selectedName === ""), o = J(a, 1, "template-card", null, o, { selected: t.selectedName === "" }), a.disabled = t.disabled;
	}), H("click", a, () => t.onSelect("")), W(e, r), M();
}
Cr(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var oo = /* @__PURE__ */ U("<small>(generated by template)</small>"), so = /* @__PURE__ */ U("<small class=\"create-required\">*</small>"), co = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), lo = /* @__PURE__ */ U("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), uo = /* @__PURE__ */ U("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), fo = /* @__PURE__ */ U("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function po(e, t) {
	j(t, !0);
	let n = ki(t, "draft", 7), r, i = /* @__PURE__ */ N(() => t.model.templates.find((e) => e.name === n().templateName)), a = /* @__PURE__ */ N(() => t.model.preview?.title || ""), o = /* @__PURE__ */ N(() => n().titleOverride ? n().title : V(a)), s = /* @__PURE__ */ N(() => (V(i)?.fields || []).filter((e) => e.required)), c = /* @__PURE__ */ N(() => (V(i)?.fields || []).filter((e) => !e.required)), l = /* @__PURE__ */ N(() => !t.model.preview || t.model.previewKey !== t.model.previewRequestKey(n()));
	ji(() => {
		r && clearTimeout(r);
	});
	function u() {
		return {
			...n(),
			templateFields: { ...n().templateFields }
		};
	}
	function d(e) {
		return e.hasDefault ? e.default ?? "" : e.type !== "boolean" && "";
	}
	function f(e = 450) {
		r && clearTimeout(r), r = setTimeout(() => {
			r = void 0, n().templateName && V(l) && !t.model.submitting && t.model.onPreview(u());
		}, e);
	}
	function p(e) {
		if (t.model.submitting || e === n().templateName || (Object.values(n().templateFields).some((e) => !!e) || n().titleOverride || n().editedMarkdown != null) && !t.model.onConfirmTemplateSwitch()) return;
		let r = t.model.templates.find((t) => t.name === e);
		n().templateName = e, n().templateFields = {};
		for (let e of r?.fields || []) n().templateFields[e.name] = d(e);
		n().title = "", n().titleOverride = !1, n().editedMarkdown = null, f(150);
	}
	function m(e, t) {
		n().templateFields[e.name] = t, f();
	}
	function h(e) {
		n().title = e, n().templateName && (n().titleOverride = !0), f();
	}
	function g() {
		n().title = "", n().titleOverride = !1, f();
	}
	async function _() {
		!t.model.previewing && !t.model.submitting && await t.model.onPreview(u());
	}
	var v = fo(), y = L(v), b = L(y), x = (e) => {
		ao(e, {
			get templates() {
				return t.model.templates;
			},
			get selectedName() {
				return n().templateName;
			},
			get disabled() {
				return t.model.submitting;
			},
			onSelect: p
		});
	};
	K(b, (e) => {
		t.model.templates.length && e(x);
	});
	var S = R(b, 2), C = R(L(S), 2), w = L(C), T = L(w), E = R(L(T)), ee = (e) => {
		W(e, oo());
	}, te = (e) => {
		W(e, so());
	};
	K(E, (e) => {
		V(i)?.taskTitle && !n().titleOverride ? e(ee) : e(te, -1);
	}), k(T);
	var D = R(T, 2), ne = L(D);
	_i(ne);
	var re = R(ne, 2), ie = (e) => {
		var t = co();
		H("click", t, g), W(e, t);
	};
	K(re, (e) => {
		V(i)?.taskTitle && n().titleOverride && e(ie);
	}), k(D), k(w);
	var ae = R(w, 2), oe = R(L(ae), 2), se = R(L(oe), 2);
	_i(se), k(oe), k(ae), k(C), k(S);
	var ce = R(S, 2), le = (e) => {
		var t = lo(), r = R(L(t), 2), i = (e) => {
			to(e, {
				get fields() {
					return V(s);
				},
				get values() {
					return n().templateFields;
				},
				label: "Required template fields",
				onChange: m
			});
		};
		K(r, (e) => {
			V(s).length && e(i);
		});
		var a = R(r, 2), o = (e) => {
			to(e, {
				get fields() {
					return V(c);
				},
				get values() {
					return n().templateFields;
				},
				label: "Optional template fields",
				onChange: m
			});
		};
		K(a, (e) => {
			V(c).length && e(o);
		}), k(t), W(e, t);
	}, ue = (e) => {
		var t = uo(), r = R(L(t), 2);
		rt(r), k(t), z(() => vi(r, n().detail)), H("input", r, (e) => n().detail = e.currentTarget.value), W(e, t);
	};
	K(ce, (e) => {
		V(i) ? e(le) : e(ue, -1);
	}), k(y), Ga(R(y, 2), {
		get draft() {
			return n();
		},
		get selectedTemplate() {
			return V(i);
		},
		get preview() {
			return t.model.preview;
		},
		get previewing() {
			return t.model.previewing;
		},
		get previewError() {
			return t.model.previewError;
		},
		get stale() {
			return V(l);
		},
		get templateDigest() {
			return t.model.templateDigest;
		},
		get submitting() {
			return t.model.submitting;
		},
		onRefresh: _
	}), k(v), z(() => {
		ne.required = !V(i)?.taskTitle, vi(ne, V(i)?.taskTitle ? V(o) : n().title), Y(ne, "placeholder", V(i)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), vi(se, n().slug);
	}), H("input", ne, (e) => h(e.currentTarget.value)), H("input", se, (e) => {
		n().slug = e.currentTarget.value, f();
	}), W(e, v), M();
}
Cr(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var mo = /* @__PURE__ */ U("<span> </span>"), ho = /* @__PURE__ */ U("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function go(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(Qt(s(V(n).draft))), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(void 0), o = /* @__PURE__ */ N(() => V(r).type === "task");
	Ai(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity !== V(i) && (I(i, e.identity, !0), I(r, s(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), Ai(() => {
		let e = (e) => {
			if (!V(n).open) return;
			if (e.key === "Escape" && !V(n).submitting) {
				e.preventDefault(), V(n).onClose();
				return;
			}
			if (e.key !== "Tab" || !V(a)) return;
			let t = [...V(a).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
			if (!t.length) return;
			let r = t[0], i = t[t.length - 1];
			e.shiftKey && document.activeElement === r ? (e.preventDefault(), i.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r.focus());
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function s(e) {
		return {
			...e,
			templateFields: { ...e.templateFields }
		};
	}
	async function c(e) {
		e.preventDefault(), V(n).submitting || await V(n).onSubmit(s(V(r)));
	}
	var l = Mr(), u = un(l), d = (e) => {
		var t = ho(), i = L(t), s = R(i, 2);
		let l;
		var u = L(s), d = L(u), f = L(d), p = L(f, !0);
		k(f);
		var m = R(f, 2), h = (e) => {
			var t = mo(), n = L(t, !0);
			k(t), z(() => G(n, V(r).projectId)), W(e, t);
		};
		K(m, (e) => {
			V(o) && e(h);
		}), k(d);
		var g = R(d, 2);
		X(L(g), { name: "x" }), k(g), k(u);
		var _ = R(u, 2), v = L(_);
		Br(v, () => V(n).identity, (e) => {
			var t = Mr(), i = un(t), a = (e) => {
				po(e, {
					get draft() {
						return V(r);
					},
					get model() {
						return V(n);
					}
				});
			}, s = (e) => {
				Aa(e, { get draft() {
					return V(r);
				} });
			};
			K(i, (e) => {
				V(o) ? e(a) : e(s, -1);
			}), W(e, t);
		});
		var y = R(v, 2), b = L(y), x = L(b, !0);
		k(b);
		var S = R(b, 2);
		k(y), k(_), k(s), Oi(s, (e) => I(a, e), () => V(a)), k(t), z(() => {
			l = J(s, 1, "create-dialog modal-enter", null, l, { "create-task-dialog": V(o) }), Y(s, "aria-label", V(o) ? "Create task" : "Create project"), G(p, V(o) ? "Create task" : "Create project"), g.disabled = V(n).submitting, b.disabled = V(n).submitting, G(x, V(n).submitting ? "Creating..." : "Create"), S.disabled = V(n).submitting;
		}), H("click", i, function(...e) {
			V(n).onClose?.apply(this, e);
		}), H("click", g, function(...e) {
			V(n).onClose?.apply(this, e);
		}), Sr("submit", _, c), H("click", S, function(...e) {
			V(n).onClose?.apply(this, e);
		}), W(e, t);
	};
	K(u, (e) => {
		V(n).open && e(d);
	}), W(e, l), M();
}
Cr(["click"]);
//#endregion
//#region src/api/client.ts
var _o = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, vo = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, yo = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new vo(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new vo(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new vo(e.scope));
		this.active.clear();
	}
}, bo = class {
	requests = new yo();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: So(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: So(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof vo) ? new vo(n) : e;
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
			let n = xo(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new _o(e.status, r, n);
		}
		return t;
	}
};
function xo(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function So(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
//#endregion
//#region src/components/DiffModal.svelte
var Co = /* @__PURE__ */ U("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), wo = /* @__PURE__ */ U("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), To = /* @__PURE__ */ U("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), Eo = /* @__PURE__ */ U("<div class=\"diff-viewer\"></div>"), Do = /* @__PURE__ */ U("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function Oo(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(void 0), o = /* @__PURE__ */ N(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	bn(() => {
		let e = t.repo, a = V(o);
		if (I(n, null), I(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		I(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (I(n, r, !0), await ur(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (I(i, n instanceof Error ? n.message : String(n), !0), t.onError(V(i)));
		}).finally(() => {
			t.repo === e && (I(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), bn(() => {
		V(n)?.diff, V(a), s();
	}), ji(() => t.client.requests.abort(V(o)));
	function s() {
		!V(a) || !V(n)?.diff || !window.Diff2Html || (V(a).innerHTML = window.Diff2Html.html(V(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Mr(), l = un(c), u = (e) => {
		var o = Do(), s = L(o), c = R(s, 2), l = L(c), u = L(l), d = L(u), f = L(d, !0);
		k(d);
		var p = R(d), m = L(p);
		k(p), k(u);
		var h = R(u);
		X(L(h), { name: "x" }), k(h), k(l);
		var g = R(l, 2), _ = (e) => {
			var n = Co(), r = L(n);
			X(r, { name: "loader-circle" });
			var i = R(r, 2), a = L(i, !0);
			k(i), k(n), z(() => G(a, t.repo.worktreePath || "")), W(e, n);
		}, v = (e) => {
			var t = wo(), n = L(t);
			X(n, { name: "triangle-alert" });
			var r = R(n, 2), a = L(r, !0);
			k(r), k(t), z(() => G(a, V(i))), W(e, t);
		}, y = (e) => {
			var t = To();
			X(L(t), { name: "check-circle-2" }), A(2), k(t), W(e, t);
		}, b = /* @__PURE__ */ N(() => !V(n)?.hasChanges || !V(n).diff?.trim()), x = (e) => {
			var t = Eo();
			Oi(t, (e) => I(a, e), () => V(a)), W(e, t);
		};
		K(g, (e) => {
			V(r) ? e(_) : V(i) ? e(v, 1) : V(b) ? e(y, 2) : e(x, -1);
		}), k(c), k(o), z(() => {
			G(f, V(n)?.branch || t.repo.branch || t.repo.name || "Diff"), G(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), H("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), H("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), W(e, o);
	};
	K(l, (e) => {
		t.repo && e(u);
	}), W(e, c), M();
}
Cr(["click"]);
//#endregion
//#region src/controllers/route-controller.ts
function ko(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function Ao(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: ko(t[1]),
		resourceId: t[2] === "r" ? ko(t[3]) : "workspace"
	} : {};
}
function jo(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function Mo(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = jo(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => Ao(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/components/markdown.ts
var No = "[A-Za-z0-9][A-Za-z0-9._-]{0,159}", Po = RegExp(`^\\[\\[(${No})\\]\\]`), Fo = null, Io = null;
function Lo(e, t) {
	if (!window.marked || !window.DOMPurify) return `<pre>${Ko(e)}</pre>`;
	let n = Bo();
	return n ? window.DOMPurify.sanitize(n.parse(String(e ?? ""), {
		breaks: !0,
		gfm: !0,
		forgeMarkdownContext: t
	})) : (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? ""))));
}
function Ro(e, t) {
	if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !(e.target instanceof Element)) return;
	let n = e.target.closest("a[data-forge-resource-id]"), r = e.currentTarget;
	if (!n || !(r instanceof Node) || !r.contains(n) || n.target && n.target !== "_self") return;
	let i = n.dataset.forgeResourceId || "";
	!Go(i) || !t.resolveResourceTitle(i) || (e.preventDefault(), t.onNavigate(i));
}
function zo(e, t) {
	let n = t, r = (e) => Ro(e, n);
	return e.addEventListener("click", r), {
		update(e) {
			n = e;
		},
		destroy() {
			e.removeEventListener("click", r);
		}
	};
}
function Bo() {
	let e = window.marked;
	if (!e?.Marked) return null;
	if (Io && Fo === e) return Io;
	let t = new e.Marked();
	return t.use({ extensions: [{
		name: "forgeProtectedLink",
		level: "inline",
		tokenizer(e) {
			if (this.lexer.state.inLink || this.lexer.state.inRawBlock) return;
			let t = Vo(e);
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
			let t = Po.exec(e);
			if (t) return {
				type: "forgeResource",
				raw: t[0],
				resourceId: t[1]
			};
		},
		renderer(e) {
			let t = this.parser.options.forgeMarkdownContext, n = t?.resolveResourceTitle(e.resourceId);
			if (!t || !n) return Ko(e.raw);
			let r = jo(t.workspaceId, e.resourceId);
			return r ? `<a class="forge-resource-reference" href="${Ko(r)}" data-forge-resource-id="${Ko(e.resourceId)}">${Ko(n)}</a>` : Ko(e.raw);
		}
	}] }), Fo = e, Io = t, t;
}
function Vo(e) {
	let t = e.startsWith("![") ? 1 : e.startsWith("[") ? 0 : -1;
	if (t < 0) return null;
	let n = Ho(e, t, "[", "]");
	if (n < 0 || e[n + 1] !== "(") return null;
	let r = Ho(e, n + 1, "(", ")");
	if (r < 0) return null;
	let i = e.slice(t + 1, n), a = Uo(i);
	return a === i ? null : {
		raw: e.slice(0, r + 1),
		markdown: `${e.slice(0, t + 1)}${a}${e.slice(n, r + 1)}`
	};
}
function Ho(e, t, n, r) {
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
			let t = Wo(e, o, "`"), n = e.indexOf("`".repeat(t), o + t);
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
function Uo(e) {
	let t = "", n = 0;
	for (; n < e.length;) {
		if (e[n] === "\\") {
			t += e.slice(n, n + 2), n += 2;
			continue;
		}
		if (e[n] === "`") {
			let r = Wo(e, n, "`"), i = e.indexOf("`".repeat(r), n + r);
			if (i >= 0) {
				t += e.slice(n, i + r), n = i + r;
				continue;
			}
		}
		let r = Po.exec(e.slice(n));
		if (r) {
			t += `\\[\\[${r[1]}\\]\\]`, n += r[0].length;
			continue;
		}
		t += e[n++];
	}
	return t;
}
function Wo(e, t, n) {
	let r = 0;
	for (; e[t + r] === n;) r++;
	return r;
}
function Go(e) {
	return RegExp(`^${No}$`).test(e);
}
function Ko(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/detail.ts
function qo(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function Jo(e) {
	let t = "", n = 0;
	for (; n < e.length;) {
		let r = e.indexOf("<!-- managed by forge cli -->", n);
		if (r < 0) return (t + e.slice(n)).trim();
		let i = e.indexOf("<!-- end of forge cli prompt -->", r + 29);
		if (i < 0) return (t + e.slice(n)).trim();
		t += e.slice(n, r), n = i + 32;
	}
	return t.trim();
}
function Yo(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function Xo(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...Xo(a.children || [], t, n, r + 1));
	return i;
}
//#endregion
//#region src/components/FileBrowser.svelte
var Zo = /* @__PURE__ */ U("<h3><!><span> </span></h3>"), Qo = /* @__PURE__ */ U("<span class=\"artifact-folder-icon\"><!><!></span>"), $o = /* @__PURE__ */ U("<a class=\"artifact-download\"><!></a>"), es = /* @__PURE__ */ U("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), ts = /* @__PURE__ */ U("<div class=\"empty-list-row\"><!><span> </span></div>"), ns = /* @__PURE__ */ U("<div class=\"content-section\" data-component-owner=\"file-browser\"><!> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function rs(e, t) {
	j(t, !0);
	let n = ki(t, "entries", 19, () => []), r = ki(t, "emptyMessage", 3, "No files."), i = ki(t, "activePath", 3, ""), a = ki(t, "showHeading", 3, !0), o = /* @__PURE__ */ N(() => Xo(n(), t.expanded, t.title)), s = /* @__PURE__ */ N(() => t.title === "Wiki" ? "book-open" : "paperclip");
	function c(e) {
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
	var l = ns(), u = L(l), d = (e) => {
		var n = Zo(), r = L(n);
		X(r, { get name() {
			return V(s);
		} });
		var i = R(r), a = L(i, !0);
		k(i), k(n), z(() => G(a, t.title)), W(e, n);
	};
	K(u, (e) => {
		a() && e(d);
	});
	var f = R(u, 2), p = L(f), m = L(p), h = (e) => {
		var n = Mr();
		q(un(n), 17, () => V(o), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ N(() => V(n).entry.type === "directory"), a = /* @__PURE__ */ N(() => t.expanded.has(`${t.title}:${V(n).entry.path}`));
			var o = es(), s = L(o);
			let l;
			var u = L(s), d = L(u), f = L(d), p = (e) => {
				X(e, { name: "chevron-right" });
			};
			K(f, (e) => {
				V(r) && e(p);
			}), k(d);
			var m = R(d), h = (e) => {
				var t = Qo(), n = L(t);
				X(n, {
					name: "folder",
					className: "artifact-icon artifact-icon-dir"
				}), X(R(n), {
					name: "folder-open",
					className: "artifact-icon artifact-icon-dir"
				}), k(t), W(e, t);
			}, g = (e) => {
				{
					let t = /* @__PURE__ */ N(() => c(V(n).entry.name));
					X(e, {
						get name() {
							return V(t);
						},
						className: "artifact-icon"
					});
				}
			};
			K(m, (e) => {
				V(r) ? e(h) : e(g, -1);
			});
			var _ = R(m), v = L(_, !0);
			k(_), k(u);
			var y = R(u, 2), b = L(y), x = (e) => {
				var r = $o();
				X(L(r), {
					name: "download",
					className: "artifact-download-icon"
				}), k(r), z((e) => {
					Y(r, "href", e), Y(r, "download", V(n).entry.name), Y(r, "title", `Download ${V(n).entry.name}`), Y(r, "aria-label", `Download ${V(n).entry.name}`);
				}, [() => t.rawURL(t.title, V(n).entry.path, !0)]), H("click", r, (e) => e.stopPropagation()), W(e, r);
			};
			K(b, (e) => {
				V(r) || e(x);
			});
			var S = R(b), C = L(S, !0);
			k(S), k(y), k(s), k(o), z((e) => {
				l = J(s, 1, "artifact-row", null, l, {
					directory: V(r),
					file: !V(r),
					active: i() === `${t.title}:${V(n).entry.path}`,
					open: V(r) && V(a)
				}), ci(s, `--depth: ${V(n).depth}`), Y(_, "title", V(n).entry.path), G(v, V(n).entry.name), G(C, e);
			}, [() => V(r) ? `${(V(n).entry.children || []).length} items` : Yo(V(n).entry.size || 0)]), H("click", s, () => V(r) ? t.onToggle(`${t.title}:${V(n).entry.path}`) : t.onPreview(t.title, V(n).entry.path)), W(e, o);
		}), W(e, n);
	}, g = (e) => {
		var n = ts(), i = L(n);
		{
			let e = /* @__PURE__ */ N(() => t.title === "Artifacts" ? "archive" : "inbox");
			X(i, { get name() {
				return V(e);
			} });
		}
		var a = R(i), o = L(a, !0);
		k(a), k(n), z(() => G(o, r())), W(e, n);
	};
	K(m, (e) => {
		V(o).length ? e(h) : e(g, -1);
	}), k(p), k(f), k(l), W(e, l), M();
}
Cr(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var is = /* @__PURE__ */ U("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), as = /* @__PURE__ */ U("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), os = /* @__PURE__ */ U("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), ss = /* @__PURE__ */ U("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), cs = /* @__PURE__ */ U("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), ls = /* @__PURE__ */ U("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), us = /* @__PURE__ */ U("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function ds(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ N(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ N(() => t.selection ? `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}` : ""), s = /* @__PURE__ */ N(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : ""), c = "";
	bn(() => {
		let e = t.selection, s = V(a), l = V(o);
		if (l === c) return;
		if (c = l, I(n, null), I(i, ""), !e) {
			t.client.requests.abort(s);
			return;
		}
		I(r, !0);
		let u = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${u}?path=${encodeURIComponent(e.path)}`, { scope: s }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && I(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (I(i, n instanceof Error ? n.message : String(n), !0), t.onError(V(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (I(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), ji(() => t.client.requests.abort(V(a)));
	var l = Mr(), u = un(l), d = (e) => {
		var a = us(), o = L(a), c = R(o, 2), l = L(c), u = L(l), d = L(u), f = L(d, !0);
		k(d);
		var p = R(d), m = L(p);
		k(p), k(u);
		var h = R(u), g = L(h);
		X(L(g), { name: "external-link" }), A(), k(g);
		var _ = R(g);
		X(L(_), { name: "x" }), k(_), k(h), k(l);
		var v = R(l, 2), y = (e) => {
			var n = is(), r = L(n);
			X(r, { name: "loader-circle" });
			var i = R(r, 2), a = L(i, !0);
			k(i), k(n), z(() => G(a, t.selection.path)), W(e, n);
		}, b = (e) => {
			var t = as(), n = L(t);
			X(n, { name: "triangle-alert" });
			var r = R(n, 2), a = L(r, !0);
			k(r), k(t), z(() => G(a, V(i))), W(e, t);
		}, x = (e) => {
			var r = os(), i = L(r);
			k(r), z(() => {
				Y(i, "src", V(s)), Y(i, "alt", V(n).name || t.selection.path);
			}), W(e, r);
		}, S = (e) => {
			var r = ss(), i = L(r);
			X(i, { name: "file-warning" });
			var a = R(i), o = L(a, !0);
			k(a);
			var s = R(a), c = L(s);
			k(s), k(r), z((e) => {
				G(o, V(n).name || t.selection.path), G(c, `Binary file, ${e ?? ""}.`);
			}, [() => Yo(V(n).size || 0)]), W(e, r);
		}, C = (e) => {
			var r = cs();
			Xr(r, () => Lo(V(n)?.content || "", {
				workspaceId: t.workspaceId,
				resolveResourceTitle: t.resolveResourceTitle
			}), !0), k(r), Qr(r, (e, t) => zo?.(e, t), () => ({
				resolveResourceTitle: t.resolveResourceTitle,
				onNavigate: t.onNavigate
			})), W(e, r);
		}, w = /* @__PURE__ */ N(() => qo(V(n)?.path || t.selection.path)), T = (e) => {
			var t = ls(), r = L(t, !0);
			k(t), z(() => G(r, V(n)?.content || "")), W(e, t);
		};
		K(v, (e) => {
			V(r) ? e(y) : V(i) ? e(b, 1) : V(n)?.image ? e(x, 2) : V(n)?.binary ? e(S, 3) : V(w) ? e(C, 4) : e(T, -1);
		}), k(c), k(a), z((e, r) => {
			Y(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${V(n)?.contentHash || "pending"}`), G(f, e), G(m, `${t.selection.path ?? ""}${r ?? ""}${V(n)?.truncated ? " · truncated" : ""}`), Y(g, "href", V(s));
		}, [() => V(n)?.name || t.selection.path.split("/").pop() || "File preview", () => V(n)?.size == null ? "" : ` · ${Yo(V(n).size)}`]), H("click", o, function(...e) {
			t.onClose?.apply(this, e);
		}), H("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), W(e, a);
	};
	K(u, (e) => {
		t.selection && e(d);
	}), W(e, l), M();
}
Cr(["click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var fs = /* @__PURE__ */ U("<p class=\"approval-question\"> </p>"), ps = /* @__PURE__ */ U("<p> </p>"), ms = /* @__PURE__ */ U("<button> </button>"), hs = /* @__PURE__ */ U("<div class=\"approval-options\"></div>"), gs = /* @__PURE__ */ U("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), _s = /* @__PURE__ */ U("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), vs = /* @__PURE__ */ U("<!> <!>", 1), ys = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function bs(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(""), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(Qt(a()));
	bn(() => {
		let e = a();
		e !== V(i) && (I(i, e, !0), I(n, ""), I(r, !1));
	});
	function a() {
		return `${t.contextIdentity}:${String(t.item.approvalId || "")}`;
	}
	async function o(e) {
		let i = String(t.item.approvalId || "");
		if (!(!i || V(r))) {
			I(r, !0);
			try {
				await t.onApproval(t.generationId, i, e), I(n, "");
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				I(r, !1);
			}
		}
	}
	function s(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	var c = ys(), l = L(c), u = L(l);
	X(u, { name: "shield-question" });
	var d = R(u), f = L(d, !0);
	k(d), k(l);
	var p = R(l, 2), m = (e) => {
		var n = fs(), r = L(n, !0);
		k(n), z(() => G(r, t.item.question)), W(e, n);
	};
	K(p, (e) => {
		t.item.question && e(m);
	});
	var h = R(p, 2), g = (e) => {
		var n = ps(), r = L(n, !0);
		k(n), z(() => G(r, t.item.detail)), W(e, n);
	};
	K(h, (e) => {
		t.item.detail && e(g);
	});
	var _ = R(h, 2), v = (e) => {
		var i = vs(), a = un(i), c = (e) => {
			var n = hs();
			q(n, 21, () => t.item.options, (e) => e.optionId, (e, t) => {
				var n = ms();
				let i;
				var a = L(n, !0);
				k(n), z((e, t) => {
					n.disabled = V(r), i = J(n, 1, "", null, i, e), G(a, t);
				}, [() => ({ "secondary-button": String(V(t).kind || "").startsWith("reject") }), () => s(V(t))]), H("click", n, () => o({ optionId: V(t).optionId })), W(e, n);
			}), k(n), W(e, n);
		}, l = (e) => {
			var t = gs(), n = L(t);
			X(L(n), { name: "check" }), A(), k(n);
			var i = R(n);
			X(L(i), { name: "x" }), A(), k(i), k(t), z(() => {
				n.disabled = V(r), i.disabled = V(r);
			}), H("click", n, () => o({ decision: "accept" })), H("click", i, () => o({ decision: "decline" })), W(e, t);
		};
		K(a, (e) => {
			t.item.options?.length ? e(c) : e(l, -1);
		});
		var u = R(a, 2), d = (e) => {
			var t = _s(), i = L(t);
			_i(i);
			var a = R(i);
			k(t), z((e) => a.disabled = e, [() => !V(n).trim() || V(r)]), Sr("submit", t, (e) => {
				e.preventDefault(), V(n).trim() && o({ text: V(n).trim() });
			}), Ci(i, () => V(n), (e) => I(n, e)), W(e, t);
		};
		K(u, (e) => {
			t.item.question && e(d);
		}), W(e, i);
	}, y = (e) => {
		var n = ps(), r = L(n);
		k(n), z(() => G(r, `${(t.item.decision || (t.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${t.item.reply ? `: ${t.item.reply}` : ""}`)), W(e, n);
	};
	K(_, (e) => {
		t.item.status === "pending" ? e(v) : e(y, -1);
	}), k(c), z(() => G(f, t.item.title || "Approval requested")), W(e, c), M();
}
Cr(["click"]);
//#endregion
//#region vendor/agenthub-event-timeline/index.mjs
var xs = 400, Ss = 12e3;
function Cs(e, t = xs) {
	let n = String(e ?? "");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function ws(e) {
	if (e == null) return "";
	try {
		return Cs(JSON.stringify(e));
	} catch {
		return "";
	}
}
function Ts(e) {
	let t = String(e || "").replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function Es(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string").join(" ") : typeof e == "string" ? e : "";
}
function Z(...e) {
	for (let t of e) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
var Ds = /* @__PURE__ */ new Set([
	"user",
	"system",
	"agent",
	"assistant"
]);
function Os(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return;
	let t = {};
	for (let n of [
		"id",
		"name",
		"sessionId"
	]) typeof e[n] == "string" && e[n].trim() && (t[n] = e[n].trim());
	return Object.keys(t).length ? t : void 0;
}
function ks(e) {
	let t = typeof e == "string" ? e.trim().toLowerCase() : "";
	return Ds.has(t) ? t : "user";
}
function As(e) {
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
function js(e) {
	if (!Array.isArray(e)) return "";
	let t = [];
	for (let n of e) typeof n?.text == "string" ? t.push(n.text) : typeof n?.content?.text == "string" ? t.push(n.content.text) : n?.type === "diff" && typeof n?.path == "string" && t.push(`Edit ${n.path}`);
	return t.filter(Boolean).join("\n");
}
function Ms(e) {
	let t = e?.data ?? {}, n = typeof t.method == "string" ? t.method : "", r = t.raw && typeof t.raw == "object" ? t.raw : {}, i = e?.time || "";
	if (n.startsWith("item/") || n.startsWith("command/")) {
		if (n === "item/commandExecution/outputDelta" || n === "command/exec/outputDelta") {
			let e = Z(r.itemId, r.callId, r.id);
			return e ? {
				callId: e,
				method: n,
				time: i,
				deltaOnly: !0,
				output: typeof r.delta == "string" ? r.delta : ""
			} : null;
		}
		let e = r.item && typeof r.item == "object" ? r.item : r, t = Z(e.type);
		if ([
			"userMessage",
			"agentMessage",
			"reasoning"
		].includes(t)) return null;
		let a = Z(e.id, r.itemId), o = Ts(t) || "Tool", s = "", c = "", l = "";
		t === "commandExecution" ? (o = "Command", s = Es(e.command) || Z(e.cmd), c = Z(e.aggregatedOutput, e.output), typeof e.exitCode == "number" && e.exitCode !== 0 && (l = `Exit code ${e.exitCode}`)) : t === "fileChange" ? (o = "File change", s = (Array.isArray(e.changes) ? e.changes.map((e) => e?.path).filter(Boolean) : []).join(", ")) : t === "mcpToolCall" ? (o = "MCP", s = [e.server, e.tool].filter((e) => typeof e == "string" && e).join(" / "), c = typeof e.result == "string" ? e.result : ws(e.result), l = Z(e.error?.message, typeof e.error == "string" ? e.error : "")) : t === "webSearch" ? (o = "Web search", s = Z(e.query)) : (s = Z(e.title, e.name, Es(e.command), e.path), c = Z(e.output, e.aggregatedOutput));
		let u = As(e.status);
		return n === "item/started" && (u = "running"), n === "item/completed" && u === "running" && (u = "completed"), l && u === "completed" && (u = "failed"), {
			callId: a,
			method: n,
			time: i,
			name: o,
			status: u,
			error: l,
			summary: Cs(s.replace(/\s+/g, " ").trim(), 120),
			output: Cs(c, Ss)
		};
	}
	let a = r.update && typeof r.update == "object" ? r.update : r, o = Z(a.sessionUpdate);
	if (o === "tool_call" || o === "tool_call_update") {
		let e = Z(a.toolCallId, a.id), t = a.rawInput && typeof a.rawInput == "object" ? a.rawInput : {}, r = Z(a.title, Es(t.command), t.path, t.filePath, Ts(a.kind));
		return {
			callId: e,
			method: n,
			time: i,
			name: Ts(a.kind) || "Tool",
			status: As(a.status || (o === "tool_call" ? "in_progress" : "")),
			summary: Cs(r.replace(/\s+/g, " ").trim(), 120),
			output: Cs(js(a.content), Ss),
			error: ""
		};
	}
	if (n === "tool_execution_start" || n === "tool_execution_end") {
		let e = Z(r.toolName, r.name, r.tool), t = r.args && typeof r.args == "object" ? r.args : {}, a = Z(Es(t.command), t.path, t.filePath, ""), o = r.isError === !0 || !!Z(r.error);
		return {
			callId: Z(r.toolCallId, r.callId, e),
			method: n,
			time: i,
			name: Ts(e) || "Tool",
			status: n === "tool_execution_start" ? "running" : o ? "failed" : "completed",
			summary: Cs(a.replace(/\s+/g, " ").trim(), 120),
			output: Cs(Z(typeof r.result == "string" ? r.result : "", js(r.result?.content)), Ss),
			error: Z(r.error)
		};
	}
	return {
		callId: Z(r.toolCallId, r.itemId, r.id),
		method: n,
		time: i,
		name: "Tool",
		status: n.includes("start") ? "running" : "completed",
		summary: n,
		output: "",
		error: ""
	};
}
function Ns(e) {
	let t = e?.data ?? {}, n = Z(t.method), r = t.params && typeof t.params == "object" ? t.params : {}, i = Array.isArray(r.options) ? r.options.map((e) => ({
		optionId: Z(e?.optionId),
		name: Z(e?.name),
		kind: Z(e?.kind)
	})).filter((e) => e.optionId) : [], a = Es(r.command) || Es(r?.rawInput?.command);
	if (a) return {
		title: "Run command",
		detail: Cs(a, 160),
		question: "",
		options: i
	};
	let o = Array.isArray(r.changes) ? r.changes.map((e) => e?.path).filter(Boolean) : [];
	if (r.toolCall && typeof r.toolCall == "object") {
		let e = Z(r.toolCall.title, r.toolCall.kind && Ts(r.toolCall.kind)), t = js(r.toolCall.content);
		return {
			title: e || "Permission requested",
			detail: "",
			question: t,
			options: i
		};
	}
	return o.length ? {
		title: "Apply file changes",
		detail: Cs(o.join(", "), 160),
		question: "",
		options: i
	} : n.includes("permissions") ? {
		title: "Grant permissions",
		detail: Z(r.reason),
		question: "",
		options: i
	} : n.includes("fileChange") ? {
		title: "Apply file changes",
		detail: Z(r.reason),
		question: "",
		options: i
	} : {
		title: "Approval requested",
		detail: Z(r.reason, n),
		question: "",
		options: i
	};
}
var Ps = {
	accept: "Allowed",
	acceptForSession: "Allowed for this session",
	decline: "Declined",
	cancel: "Cancelled"
}, Fs = {
	failed: "Session failed",
	stopping: "Stopping provider",
	stopped: "Session stopped",
	archived: "Session archived"
}, Is = {
	requested: "requested",
	completed: "provider completed",
	provider_error: "provider error",
	startup_error: "startup error",
	daemon_recovery: "daemon recovery"
};
function Ls(e) {
	return e === "message.delivery" || e === "provider.event" || e === "provider.metadata" || e === "plan.event" || e === "provider.stderr" || e === "provider.turn.started" || e === "provider.turn.completed" || e.startsWith("provider.process.");
}
function Rs(e, t) {
	let n = { ...e };
	return t.name && (n.name = t.name), t.summary && (n.summary = t.summary), t.status && (n.status = t.status), t.error && (n.error = t.error), t.deltaOnly ? n.output = Cs((n.output || "") + (t.output || ""), Ss) : t.output && (n.output = t.output), n.time = t.time || e.time, n.key = e.key, n;
}
function zs(e, t) {
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
		rawPreview: ws(t?.data?.raw)
	};
}
function Bs(e) {
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
					role: ks(o.role),
					key: a.id,
					time: s,
					steer: o.steer === !0,
					text: typeof o.text == "string" ? o.text : ""
				};
				a.turnId && (e.turnId = a.turnId);
				let n = Os(o.sender);
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
				let e = Ms(a);
				if (!e) break;
				let n = t.at(-1), i = n?.kind === "tools" ? n : null, o = e.callId ? r.get(e.callId) : null;
				if (o) Object.assign(o.call, Rs(o.call, e)), o.group.time = s, o.call.status !== "running" && r.delete(e.callId);
				else {
					if (e.deltaOnly) break;
					let n = i || {
						kind: "tools",
						key: a.id,
						calls: [],
						time: s
					}, o = zs(e, a);
					n.calls.push(o), n.time = s, i || t.push(n), o.callId && o.status === "running" && r.set(o.callId, {
						call: o,
						group: n
					});
				}
				break;
			}
			case "approval.requested": {
				let { title: e, detail: r, question: i, options: c } = Ns(a), l = {
					kind: "approval",
					key: a.id,
					time: s,
					approvalId: Z(o.approvalId),
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
				let e = Z(o.approvalId), r = Z(o.decision) || "decline", i = Z(o.optionId), c = Z(o.text), l = e ? n.get(e) : null, u = (e) => r === "text" ? "Replied" : i ? `Answered: ${e?.options?.find((e) => e.optionId === i)?.name || i}` : Ps[r] || Ts(r), d = r === "accept" || r === "acceptForSession" || r === "text";
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
					let e = Z(o.message, "The provider reported an error"), n = Z(o.details), r = n && n !== e ? `${e} · ${n}` : e;
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
					text: `Turn failed${Z(o.error, o.message) ? `: ${Z(o.error, o.message)}` : ""}`
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
				let e = Z(o.agentName), n = Z(o.provider), r = ["Agent connected"];
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
				let e = Fs[o.state];
				o.state === "failed" ? i("failed", s) : o.state === "stopped" && i(o.reason === "completed" ? "completed" : "failed", s), o.state === "stopped" && Is[o.reason] && (e += ` · ${Is[o.reason]}`);
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
				if (Ls(e)) break;
				t.push({
					kind: "unknown",
					key: a.id,
					time: s,
					type: e || "unknown",
					preview: ws(o)
				});
		}
	}
	let a = t.at(-1);
	return a?.kind === "thinking" && (a.active = !0), t;
}
//#endregion
//#region src/components/timeline-events.ts
var Vs = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment",
	"turn.started",
	"turn.completed"
]), Hs = /* @__PURE__ */ new Set([
	...Vs,
	"Session created",
	"Turn started",
	"Turn completed"
]);
function Us(e, t) {
	let n = new Set(e.filter((e) => Vs.has(e.type)).map((e) => String(e.id)));
	return t.filter((e) => e.key === void 0 || !n.has(String(e.key)));
}
function Ws(e) {
	let t = e || [], n = Us(t, Bs(t)), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function Gs(e) {
	let t = String(e || "");
	return Hs.has(t) || t === "Agent connected" || t.startsWith("Agent connected ·");
}
function Ks(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? ec(r, n) : tc(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function qs(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) Js(n, e);
	return n;
}
function Js(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, tc(t));
		return;
	}
	e[a] = ec(e[a], t);
}
function Ys(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = Xs(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? Zs(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function Xs(e) {
	if (e.type !== "tool.event") return "";
	let t = Qs(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? Qs(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? $s(n.toolCallId) || $s(n.id) : "";
}
function Zs(e, t) {
	let n = e.data || {}, r = t.data || {}, i = Qs(n.raw), a = Qs(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? Qs(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? Qs(a.update) : a;
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
function Qs(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function $s(e) {
	return typeof e == "string" ? e.trim() : "";
}
function ec(e, t) {
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
function tc(e) {
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
function nc(e, t) {
	let n = Number(e);
	return Number.isFinite(n) && n > 0 ? Math.floor(n) : Math.max(0, Math.floor(Number(t) || 0));
}
function rc(e) {
	return e.compact ? nc(e.toolCallCount, e.calls?.length || 0) : e.calls?.length || 0;
}
function ic(e) {
	let t = nc(e, 0);
	return `${t} tool ${t === 1 ? "call" : "calls"}`;
}
function ac(e) {
	return e.rangeStartEventId && e.rangeStartEventId > 0 ? String(e.rangeStartEventId) : String(e.key ?? e.time ?? "tools");
}
//#endregion
//#region src/components/chat-state.ts
var oc = 20, sc = 250, cc = 80, lc = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment"
]), uc = class {
	api;
	eventSourceFactory;
	contexts = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	onEvent;
	onNotice;
	streamBatchWindowMs;
	realtime;
	activeKey = "";
	disposed = !1;
	constructor(e = {}) {
		this.api = e.api ?? new bo(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? cc), this.realtime = e.realtime !== !1;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t, n) {
		if (this.disposed) return;
		let r = pc(e, t), i = this.activeKey !== r;
		if (this.activeKey && i && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !r) {
			this.emit();
			return;
		}
		let a = this.contexts.get(r) ?? this.createContext(e, t);
		this.api.requests.abort(gc(a, "status"));
		let o = String(n?.generation?.generationId || ""), s = !!(a.generationId && o && a.generationId !== o);
		a.status = n, a.generationId = o, s ? (this.resetForGeneration(a), this.loadInitial(a)) : !a.loaded && !a.loading ? this.loadInitial(a) : this.realtime && this.connect(a), (i || s) && this.emit();
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.nextCursor) return !1;
		let t = e.requestGeneration, n = e.nextCursor;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest(vc(e, n), { scope: gc(e, "older") });
			return this.isCurrent(e, t) ? (this.mergePage(e, r), r.segments.some((e) => e.turns?.length || e.gap)) : !1;
		} catch (n) {
			return n instanceof vo || !this.isCurrent(e, t) || (e.error = Oc(n)), !1;
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
			let r = await this.api.latest(yc(t, e), { scope: gc(t, `turn:${e}`) });
			if (!this.isCurrent(t, n)) return;
			if (t.details.set(e, r), !r.turn.closed && r.turn.generation.generationId === t.generationId) {
				let i = await this.loadTurnRange(t, r, n);
				if (!this.isCurrent(t, n)) return;
				t.liveEvents.set(e, i);
			}
			this.realtime && this.connect(t);
		} catch (r) {
			if (r instanceof vo || !this.isCurrent(t, n)) return;
			t.detailErrors.set(e, Oc(r));
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
		this.isCurrent(r, o) && (r.liveEvents.set(i, Ys(Ks([...r.liveEvents.get(i) || [], ...s]))), this.emit());
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
		} : kc();
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
			key: pc(e, t),
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
			flushTimer: null
		};
		return this.contexts.set(n.key, n), n;
	}
	async loadInitial(e) {
		if (e.loading) return;
		let t = e.requestGeneration;
		e.loading = !0, e.error = "", this.emit();
		try {
			let n = await this.api.latest(vc(e), { scope: gc(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			e.segments.clear(), e.details.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), this.mergePage(e, n), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof vo || !this.isCurrent(e, t)) return;
			e.error = Oc(n);
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
			n && (e.liveEvents.set(t.reference, Ys(Ks([...e.liveEvents.get(t.reference) || [], ...n]))), e.orphanEvents.delete(t.turnId));
		}
		e.nextCursor = String(t.page?.nextCursor || ""), e.hasMoreBefore = !!(t.page?.hasMore && e.nextCursor);
	}
	blocks(e) {
		let t = [], n = [...e.segments.values()].sort((e, t) => e.generation.generation - t.generation.generation), r = n.find((t) => t.generation.generationId === e.generationId)?.generation || xc(e), i = r ? this.orphanEventBlocks(e, r) : [];
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
					items: i && !a ? dc(i, r.generation.generationId) : void 0,
					events: a?.filter((e) => !lc.has(e.type)),
					loading: e.detailLoading.has(t.reference),
					error: e.detailErrors.get(t.reference)
				});
			}
			r.generation.generationId === e.generationId && n.push(...i), n.sort((e, t) => hc(e) - hc(t)), t.push(...n);
		}
		return i.length && !n.some((t) => t.generation.generationId === e.generationId) && t.push(...i), t;
	}
	orphanEventBlocks(e, t) {
		let n = [];
		for (let [r, i] of e.orphanEvents) {
			let a = i.filter((e) => !lc.has(e.type)), o = [];
			for (let i of a) o.length && Number(i.id) !== Number(o[o.length - 1].id) + 1 && (n.push(mc(e, r, t, o)), o = []), o.push(i);
			o.length && n.push(mc(e, r, t, o));
		}
		return n.sort((e, t) => hc(e) - hc(t));
	}
	connect(e) {
		if (!this.realtime || !this.isActive(e) || e.stream || !e.generationId || !wc(e.status)) return;
		let t = bc(e), n = new URLSearchParams({ generationId: e.generationId });
		t && n.set("after", String(t));
		let r = ++e.streamGeneration, i = this.eventSourceFactory(`${_c(e)}/stream?${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.resourceId, n), this.scheduleEventFlush(e), Tc(n) && this.materializeTerminalTurn(e, String(n.turnId || ""), r);
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
			i.readyState === 2 && (e.stream = null, e.streamGeneration++, this.refreshAfterStreamFailure(e));
		};
	}
	async refreshAfterStreamFailure(e) {
		let t = e.requestGeneration;
		try {
			let n = await this.api.latest(`${_c(e)}/status`, { scope: gc(e, "status") });
			if (!this.isCurrent(e, t) || !n.generation?.generationId) return;
			if (String(n.generation.generationId) !== e.generationId) {
				this.activate(e.workspaceId, e.resourceId, n);
				return;
			}
			e.status = n, this.emit(), this.connect(e);
		} catch (n) {
			if (n instanceof vo || !this.isCurrent(e, t)) return;
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
				limit: String(sc)
			}), l = await this.api.latest(`${_c(e)}/events?${c}`, { scope: gc(e, a) });
			if (!this.isCurrent(e, i)) return [];
			let u = Sc(l.events).filter((t) => this.eventBelongsToContext(e, t));
			s = Ks([...s, ...u]);
			let d = Number(l.page?.nextAfter) || Cc(u);
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
					let i = await this.api.latest(vc(e), { scope: gc(e, `terminal-head:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.mergePage(e, i);
					let a = this.findTurnById(e, r, t);
					if (!a?.closed) throw Error("Turn projection is not closed yet");
					let o = await this.api.latest(yc(e, a.reference), { scope: gc(e, `terminal:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.flushEvents(e, !1), e.details.set(a.reference, o), e.liveEvents.delete(a.reference), this.emit();
					return;
				} catch (t) {
					if (t instanceof vo || !e.stream || !this.isActiveStream(e, e.stream, n)) return;
					if (i === 2) {
						e.error = Oc(t), this.emit();
						return;
					}
					await Ec(50 * (i + 1));
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
			let n = await this.api.latest(vc(e), { scope: gc(e, "stream-head") });
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
		e.notices.some((e) => Dc(e) === Dc(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
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
			if (n) e.liveEvents.set(n, Ys(qs(e.liveEvents.get(n) || [], [t])));
			else {
				let n = String(t.turnId || "current");
				e.orphanEvents.set(n, Ys(qs(e.orphanEvents.get(n) || [], [t]))), Tc(t) || this.refreshHead(e);
			}
		}
		t && this.isActive(e) && this.emit();
	}
	closeStream(e) {
		e.streamGeneration++, e.stream?.close(), e.stream = null;
	}
	resetForGeneration(e) {
		e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, e.pendingEvents = [], e.requestGeneration++, this.closeStream(e), this.api.requests.abort(gc(e, "initial")), this.api.requests.abort(gc(e, "older")), this.api.requests.abort(gc(e, "status")), e.segments.clear(), e.details.clear(), e.detailLoading.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), e.nextCursor = "", e.hasMoreBefore = !1, e.loading = !1, e.loadingOlder = !1, e.loaded = !1, e.error = "", e.headRefreshing = !1, e.terminalMaterializing.clear();
	}
	deactivate(e) {
		e && (e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.requestGeneration++, this.closeStream(e), e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(gc(e, "initial")), this.api.requests.abort(gc(e, "older")), this.api.requests.abort(gc(e, "status")));
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
function dc(e, t) {
	return (e.items || []).flatMap((e) => fc(e, t));
}
function fc(e, t) {
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
			let t = nc(e.count, 1);
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
					summary: `${ic(t)} · details omitted`,
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
		case "lifecycle": return e.text && !Gs(e.text) ? [{
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
function pc(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function mc(e, t, n, r) {
	let i = r[0]?.id ?? 0;
	return {
		kind: "turn",
		key: `${e.generationId}:${t || "current"}:${i}`,
		generation: n,
		events: r
	};
}
function hc(e) {
	if (e.turn) return Number(e.turn.startEventId) || 0;
	let t = e.events?.[0];
	return t && Number(t.id) || 0;
}
function gc(e, t) {
	return `resource-chat:${e.key}:${t}`;
}
function _c(e) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/resources/${encodeURIComponent(e.resourceId)}`;
}
function vc(e, t = "") {
	let n = new URLSearchParams({ limit: String(oc) });
	return t && n.set("cursor", t), `${_c(e)}/history/turns?${n}`;
}
function yc(e, t) {
	return `${_c(e)}/history/turns/${encodeURIComponent(t)}`;
}
function bc(e) {
	let t = [...e.segments.values()].filter((t) => t.generation.generationId === e.generationId).flatMap((e) => e.turns || []), n = [...e.liveEvents.values()].flat();
	return Math.max(0, ...t.map((e) => Number(e.lastEventId) || 0), ...n.map((e) => Number(e.id) || 0));
}
function xc(e) {
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
function Sc(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function Cc(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function wc(e) {
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
function Tc(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function Ec(e) {
	return new Promise((t) => setTimeout(t, e));
}
function Dc(e) {
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
function Oc(e) {
	return e instanceof Error ? e.message : String(e);
}
function kc() {
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
var Ac = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function jc(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => t.item.tone === "ok" ? "check-circle" : t.item.tone === "danger" ? "triangle-alert" : t.item.tone === "info" ? "info" : "clock");
	function r() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var i = Ac(), a = L(i);
	X(a, { get name() {
		return V(n);
	} });
	var o = R(a), s = L(o, !0);
	k(o);
	var c = R(o), l = L(c, !0);
	k(c), k(i), z((e) => {
		J(i, 1, `agent-system-note agent-lifecycle-${t.item.tone || "muted"}`), G(s, t.item.text || ""), G(l, e);
	}, [() => r()]), W(e, i), M();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var Mc = /* @__PURE__ */ U("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function Nc(e, t) {
	j(t, !0);
	let n = ki(t, "onExpand", 3, () => {}), r = /* @__PURE__ */ F(Qt(!!t.item.active)), i = !!t.item.active;
	bn(() => {
		let e = !!t.item.active;
		e !== i && (i = e, I(r, e, !0));
	});
	function a() {
		if (t.item.active) return "Thinking…";
		if (!t.item.startTime || !t.item.time) return "Thought";
		let e = Math.round((new Date(t.item.time).getTime() - new Date(t.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var o = Mc(), s = L(o), c = L(s);
	X(c, { name: "brain-circuit" });
	var l = R(c), u = L(l, !0);
	k(l);
	var d = R(l);
	X(L(d), { name: "chevron-right" }), k(d), k(s);
	var f = R(s, 2), p = L(f, !0);
	k(f), k(o), z((e) => {
		o.open = V(r), G(u, e), G(p, t.item.text || "");
	}, [() => a()]), Sr("toggle", o, (e) => {
		I(r, e.currentTarget.open, !0), e.currentTarget.open && n()();
	}), W(e, o), M();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var Pc = /* @__PURE__ */ U("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), Fc = /* @__PURE__ */ U("<span class=\"agent-message-tag\">steer</span>"), Ic = /* @__PURE__ */ U("<span class=\"agent-message-source\"> </span>"), Lc = /* @__PURE__ */ U("<div class=\"agent-message-content markdown-rendered\"></div>"), Rc = /* @__PURE__ */ U("<p> </p>"), zc = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function Bc(e, t) {
	j(t, !0);
	let n = ki(t, "workspaceId", 3, ""), r = ki(t, "resolveResourceTitle", 3, () => null), i = ki(t, "onNavigate", 3, () => {}), a = /* @__PURE__ */ N(() => [
		"assistant",
		"system",
		"agent"
	].includes(String(t.item.role)) ? String(t.item.role) : "user");
	function o() {
		return t.item.role === "assistant" ? t.agentName || "Agent" : String(t.item.sender?.name || t.item.sender?.id || "").trim() || (t.item.role === "system" ? "System" : t.item.role === "agent" ? "Agent" : "User");
	}
	function s() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function c() {
		let e = String(t.item.text || "");
		return !window.marked || !window.DOMPurify ? l(e).replaceAll("\n", "<br>") : Lo(e, {
			workspaceId: n(),
			resolveResourceTitle: r()
		});
	}
	function l(e) {
		return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
	}
	var u = zc(), d = L(u), f = L(d), p = L(f), m = L(p, !0);
	k(p);
	var h = R(p, 2), g = (e) => {
		var t = Pc(), n = L(t, !0);
		k(t), z(() => G(n, V(a))), W(e, t);
	};
	K(h, (e) => {
		V(a) !== "assistant" && e(g);
	});
	var _ = R(h, 2), v = (e) => {
		W(e, Fc());
	};
	K(_, (e) => {
		t.item.steer && e(v);
	});
	var y = R(_, 2), b = (e) => {
		var n = Ic(), r = L(n);
		k(n), z(() => {
			Y(n, "title", t.item.sender.sessionId), G(r, `from session ${t.item.sender.sessionId ?? ""}`);
		}), W(e, n);
	};
	K(y, (e) => {
		V(a) === "agent" && t.item.sender?.sessionId && e(b);
	});
	var x = R(y, 2), S = L(x, !0);
	k(x), k(f);
	var C = R(f, 2), w = L(C), T = (e) => {
		var t = Lc();
		Xr(t, c, !0), k(t), Qr(t, (e, t) => zo?.(e, t), () => ({
			resolveResourceTitle: r(),
			onNavigate: i()
		})), W(e, t);
	}, E = (e) => {
		var n = Rc(), r = L(n, !0);
		k(n), z(() => G(r, t.item.text || "")), W(e, n);
	};
	K(w, (e) => {
		V(a) === "assistant" || V(a) === "agent" ? e(T) : e(E, -1);
	}), k(C), k(d), k(u), z((e, t) => {
		J(u, 1, `agent-message-row ${V(a) === "assistant" ? "assistant final" : V(a)}`), G(m, e), G(S, t);
	}, [() => o(), () => s()]), W(e, u), M();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var Vc = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function Hc(e, t) {
	let n = ki(t, "error", 3, !1), r = ki(t, "alert", 3, !1);
	var i = Vc();
	let a;
	var o = L(i), s = L(o);
	{
		let e = /* @__PURE__ */ N(() => n() ? "triangle-alert" : "info");
		X(s, { get name() {
			return V(e);
		} });
	}
	var c = R(s), l = L(c, !0);
	k(c), k(o);
	var u = R(o, 2), d = L(u, !0);
	k(u), k(i), z(() => {
		a = J(i, 1, "timeline-notice", null, a, { "timeline-notice-error": n() }), Y(i, "role", r() ? "alert" : void 0), G(l, t.title), G(d, t.text);
	}), W(e, i);
}
//#endregion
//#region src/components/ToolItem.svelte
var Uc = /* @__PURE__ */ U("<pre> </pre>"), Wc = /* @__PURE__ */ U("<details data-component-owner=\"event-timeline\"><summary><span class=\"tool-status-icon tool-status-icon-running\"><!></span><span class=\"tool-status-icon tool-status-icon-failed\"><!></span><span class=\"tool-status-icon tool-status-icon-completed\"><!></span><span> </span><small> </small></summary> <!></details>");
function Gc(e, t) {
	j(t, !0);
	function n() {
		return [t.call.name, t.call.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	function r() {
		return [
			t.call.error,
			t.call.output,
			t.call.rawPreview
		].filter(Boolean).join("\n\n");
	}
	var i = Wc(), a = L(i), o = L(a);
	X(L(o), { name: "loader-circle" }), k(o);
	var s = R(o);
	X(L(s), { name: "x-circle" }), k(s);
	var c = R(s);
	X(L(c), { name: "check-circle" }), k(c);
	var l = R(c), u = L(l, !0);
	k(l);
	var d = R(l), f = L(d, !0);
	k(d), k(a);
	var p = R(a, 2), m = (e) => {
		var t = Uc(), n = L(t, !0);
		k(t), z((e) => G(n, e), [() => r()]), W(e, t);
	}, h = /* @__PURE__ */ N(() => r());
	K(p, (e) => {
		V(h) && e(m);
	}), k(i), z((e, t, n) => {
		J(i, 1, e), G(u, t), G(f, n);
	}, [
		() => `agent-tool-item agent-tool-${String(t.call.status || "completed")}`,
		() => n(),
		() => String(t.call.method || "tool")
	]), W(e, i), M();
}
//#endregion
//#region src/components/ToolGroup.svelte
var Kc = /* @__PURE__ */ U("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function qc(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => t.item.calls || []), r = /* @__PURE__ */ N(() => rc(t.item)), i = /* @__PURE__ */ N(() => V(n).map(a));
	function a(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var o = Kc(), s = L(o), c = L(s);
	X(L(c), { name: "wrench" }), k(c);
	var l = R(c), u = L(l, !0);
	k(l);
	var d = R(l), f = L(d);
	k(d);
	var p = R(d);
	X(L(p), { name: "chevron-right" }), k(p), k(s);
	var m = R(s, 2);
	q(m, 21, () => V(n), (e) => String(e.callId || e.key), (e, t) => {
		Gc(e, { get call() {
			return V(t);
		} });
	}), k(m), k(o), z((e, n, r) => {
		Y(o, "data-tool-group-key", e), o.open = t.open, G(u, n), G(f, `${r ?? ""}${V(i).length > 2 ? ` · +${V(i).length - 2} more` : ""}`);
	}, [
		() => `${t.generationId}:${ac(t.item)}`,
		() => ic(V(r)),
		() => V(i).slice(0, 2).join(" · ")
	]), Sr("toggle", o, (e) => t.onToggle(e.currentTarget.open)), W(e, o), M();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var Jc = /* @__PURE__ */ U("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function Yc(e, t) {
	j(t, !0);
	var n = Jc(), r = L(n), i = L(r);
	X(i, { name: "info" });
	var a = R(i), o = L(a);
	k(a), k(r);
	var s = R(r), c = L(s, !0);
	k(s), k(n), z(() => {
		G(o, `Unhandled event: ${(t.item.type || t.item.kind) ?? ""}`), G(c, t.item.preview || "This event carries no payload.");
	}), W(e, n), M();
}
//#endregion
//#region src/components/HistoryTimeline.svelte
var Xc = /* @__PURE__ */ U("<div class=\"history-state\"><!><span>Loading resource History...</span></div>"), Zc = /* @__PURE__ */ U("<div class=\"history-state history-error\"><!><strong>History unavailable</strong><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), Qc = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary-button history-load-older\"><!> </button>"), $c = /* @__PURE__ */ U("<div class=\"history-legacy\"><!><span><strong>Legacy history</strong><small>Conversation history from before resource History was available was migrated to Artifacts.</small></span><button type=\"button\" class=\"secondary-button\">Open legacy history</button></div>"), el = /* @__PURE__ */ U("<div class=\"history-state\"><!><span>No resource History yet.</span></div>"), tl = /* @__PURE__ */ U("<div class=\"history-generation\"><div><span> </span><strong> </strong></div> <div class=\"history-generation-meta\"><span> </span><span> </span><span> </span></div></div>"), nl = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary-button\">Retry</button>"), rl = /* @__PURE__ */ U("<div class=\"history-gap\"><!><span><strong>History gap</strong><small> </small></span><!></div>"), il = /* @__PURE__ */ U("<div class=\"history-detail-state\"><!>Loading Turn detail...</div>"), al = /* @__PURE__ */ U("<div class=\"history-detail-state history-error\"><!> </div>"), ol = /* @__PURE__ */ U("<div class=\"history-item\"><!></div>"), sl = /* @__PURE__ */ U("<div class=\"history-items\"></div>"), cl = /* @__PURE__ */ U("<section><button type=\"button\" class=\"history-turn-header\"><span class=\"history-turn-title\"><strong>Turn</strong><small> </small></span> <span class=\"history-turn-preview\"> </span> <span class=\"history-turn-count\"> <!></span></button> <!> <!> <!></section>"), ll = /* @__PURE__ */ U("<!> <!>", 1), ul = /* @__PURE__ */ U("<!> <!> <!> <!>", 1), dl = /* @__PURE__ */ U("<div data-component-owner=\"history-timeline\" class=\"history-timeline-root\"><!></div>");
function fl(e, t) {
	j(t, !0);
	let n = ki(t, "artifacts", 19, () => []), r = /* @__PURE__ */ F(Qt(c())), i, a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(Qt(/* @__PURE__ */ new Map())), s = /* @__PURE__ */ N(() => l(n(), "legacy-log.md"));
	Ai(() => {
		i = new uc({ realtime: !1 });
		let e = i.subscribe((e) => {
			I(r, e, !0), queueMicrotask(t.onIconsChanged);
		});
		return i.activate(t.workspaceId, t.resourceId, null), () => {
			e(), i?.dispose(), i = void 0;
		};
	});
	function c() {
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
	function l(e, t) {
		for (let n of e || []) {
			if (n.type === "file" && n.name === t) return n.path;
			let e = l(n.children || [], t);
			if (e) return e;
		}
		return "";
	}
	function u(e) {
		if (!e) return "Unknown time";
		let t = new Date(e);
		return Number.isNaN(t.getTime()) ? e : t.toLocaleString();
	}
	function d(e) {
		let t = Math.max(0, Math.round(Number(e || 0) / 1e3));
		return t ? t < 60 ? `${t}s` : `${Math.floor(t / 60)}m ${t % 60}s` : "<1s";
	}
	function f(e, t) {
		return e?.trim() || `Unknown ${t}`;
	}
	function p(e) {
		e.kind === "turn" && e.turn?.reference && i?.loadTurn(e.turn.reference);
	}
	function m(e) {
		return !!(e.items || e.events);
	}
	function h(e) {
		return e.events ? Ws(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || [];
	}
	function g(e) {
		let t = e.kind === "tools" ? ac(e) : String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event");
		return `${e.generationId || V(r).generationId}:${e.kind}:${t}`;
	}
	function _(e) {
		return V(o).get(g(e)) ?? !1;
	}
	function v(e, t) {
		I(o, new Map(V(o)).set(g(e), t), !0), t && y(e);
	}
	function y(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return i?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function b() {
		return Promise.reject(/* @__PURE__ */ Error("This is a read-only History view. Answer pending approvals from the Chat tab."));
	}
	function x(e) {
		return e.turn?.reference || e.key;
	}
	var S = dl(), C = L(S), w = (e) => {
		var t = Xc();
		X(L(t), {
			name: "loader-circle",
			className: "spin"
		}), A(), k(t), W(e, t);
	}, T = (e) => {
		var t = Zc(), n = L(t);
		X(n, { name: "triangle-alert" });
		var a = R(n, 2), o = L(a, !0);
		k(a);
		var s = R(a);
		k(t), z(() => G(o, V(r).error)), H("click", s, () => i?.retryHistory()), W(e, t);
	}, E = (e) => {
		var n = ul(), o = un(n), c = (e) => {
			var t = Qc(), n = L(t);
			X(n, { name: "chevrons-up" });
			var a = R(n, 1, !0);
			k(t), z(() => {
				t.disabled = V(r).loadingOlder, G(a, V(r).loadingOlder ? "Loading older History..." : "Load older History");
			}), H("click", t, () => i?.loadOlder()), W(e, t);
		};
		K(o, (e) => {
			V(r).hasMoreBefore && e(c);
		});
		var l = R(o, 2), S = (e) => {
			Hc(e, {
				title: "History",
				get text() {
					return V(a);
				},
				error: !0
			});
		};
		K(l, (e) => {
			V(a) && e(S);
		});
		var C = R(l, 2), w = (e) => {
			var n = $c(), r = L(n);
			X(r, { name: "archive-restore" });
			var i = R(r, 2);
			k(n), H("click", i, () => t.onOpenLegacy(V(s))), W(e, n);
		}, T = (e) => {
			var t = el();
			X(L(t), { name: "history" }), A(), k(t), W(e, t);
		};
		K(C, (e) => {
			V(r).loaded && !V(r).blocks.length && V(s) ? e(w) : V(r).loaded && !V(r).blocks.length && e(T, 1);
		}), q(R(C, 2), 19, () => V(r).blocks, (e) => e.key, (e, n, o) => {
			var s = ll(), c = un(s), l = (e) => {
				var t = tl(), r = L(t), i = L(r), a = L(i);
				k(i);
				var o = R(i), s = L(o, !0);
				k(o), k(r);
				var c = R(r, 2), l = L(c), u = L(l);
				k(l);
				var d = R(l), p = L(d);
				k(d);
				var m = R(d), h = L(m);
				k(m), k(c), k(t), z((e, r, i) => {
					Y(t, "data-generation-id", V(n).generation.generationId), G(a, `Generation ${V(n).generation.generation ?? ""}`), G(s, e), G(u, `Provider: ${r ?? ""}`), G(p, `Model: ${i ?? ""}`), G(h, `Status: ${(V(n).generation.status || "unknown") ?? ""}`);
				}, [
					() => f(V(n).generation.agentName, "agent"),
					() => f(V(n).generation.provider || V(n).generation.providerId, "provider"),
					() => f(V(n).generation.model, "model")
				]), W(e, t);
			};
			K(c, (e) => {
				(V(o) === 0 || V(r).blocks[V(o) - 1].generation.generationId !== V(n).generation.generationId) && e(l);
			});
			var S = R(c, 2), C = (e) => {
				var t = rl(), r = L(t);
				X(r, { name: "triangle-alert" });
				var a = R(r), o = R(L(a)), s = L(o, !0);
				k(o), k(a);
				var c = R(a), l = (e) => {
					var t = nl();
					H("click", t, () => i?.retryHistory()), W(e, t);
				};
				K(c, (e) => {
					V(n).gap?.retryable && e(l);
				}), k(t), z(() => {
					Y(t, "data-timeline-key", V(n).key), G(s, V(n).gap?.message || "This generation could not be read.");
				}), W(e, t);
			}, w = (e) => {
				var i = cl();
				let o;
				var s = L(i), c = L(s), l = R(L(c)), f = L(l);
				k(l), k(c);
				var S = R(c, 2), C = L(S, !0);
				k(S);
				var w = R(S, 2), T = L(w), E = R(T);
				{
					let e = /* @__PURE__ */ N(() => m(V(n)) ? "chevron-up" : "chevron-down");
					X(E, { get name() {
						return V(e);
					} });
				}
				k(w), k(s);
				var ee = R(s, 2), te = (e) => {
					var t = il();
					X(L(t), {
						name: "loader-circle",
						className: "spin"
					}), A(), k(t), W(e, t);
				};
				K(ee, (e) => {
					V(n).loading && e(te);
				});
				var D = R(ee, 2), ne = (e) => {
					var t = al(), r = L(t);
					X(r, { name: "triangle-alert" });
					var i = R(r, 1, !0);
					k(t), z(() => G(i, V(n).error)), W(e, t);
				};
				K(D, (e) => {
					V(n).error && e(ne);
				});
				var re = R(D, 2), ie = (e) => {
					var i = sl();
					q(i, 21, () => h(V(n)), (e) => g(e), (e, i) => {
						var o = ol(), s = L(o), c = (e) => {
							{
								let r = /* @__PURE__ */ N(() => V(n).generation.agentName || V(n).generation.resolvedProfile || V(n).generation.binding?.name || "Agent");
								Bc(e, {
									get item() {
										return V(i);
									},
									get agentName() {
										return V(r);
									},
									get workspaceId() {
										return t.workspaceId;
									},
									get resolveResourceTitle() {
										return t.resolveResourceTitle;
									},
									get onNavigate() {
										return t.onNavigate;
									}
								});
							}
						}, l = (e) => {
							Nc(e, {
								get item() {
									return V(i);
								},
								onExpand: () => y(V(i))
							});
						}, u = (e) => {
							{
								let t = /* @__PURE__ */ N(() => _(V(i)));
								qc(e, {
									get item() {
										return V(i);
									},
									get generationId() {
										return V(n).generation.generationId;
									},
									get open() {
										return V(t);
									},
									onToggle: (e) => v(V(i), e)
								});
							}
						}, d = (e) => {
							bs(e, {
								get item() {
									return V(i);
								},
								get generationId() {
									return V(n).generation.generationId;
								},
								get contextIdentity() {
									return V(r).identity;
								},
								onApproval: b,
								onToast: (e) => I(a, e, !0)
							});
						}, f = (e) => {
							jc(e, { get item() {
								return V(i);
							} });
						}, p = (e) => {
							{
								let t = /* @__PURE__ */ N(() => V(i).text || "");
								Hc(e, {
									title: "Provider error",
									get text() {
										return V(t);
									},
									error: !0
								});
							}
						}, m = (e) => {
							Yc(e, { get item() {
								return V(i);
							} });
						};
						K(s, (e) => {
							V(i).kind === "message" ? e(c) : V(i).kind === "thinking" ? e(l, 1) : V(i).kind === "tools" ? e(u, 2) : V(i).kind === "approval" ? e(d, 3) : V(i).kind === "lifecycle" ? e(f, 4) : V(i).kind === "error" ? e(p, 5) : e(m, -1);
						}), k(o), z(() => Y(o, "data-history-kind", V(i).kind)), W(e, o);
					}), k(i), W(e, i);
				}, ae = /* @__PURE__ */ N(() => m(V(n)));
				K(re, (e) => {
					V(ae) && e(ie);
				}), k(i), z((e, t, r, a) => {
					o = J(i, 1, "history-turn", null, o, { "history-turn-loading": V(n).loading }), Y(i, "data-timeline-key", e), Y(s, "aria-expanded", t), G(f, `${r ?? ""} · ${a ?? ""} · ${(V(n).turn.status || "unknown") ?? ""}`), G(C, V(n).turn.finalReplyPreview || V(n).turn.triggerPreview || "Select to load conversation detail"), G(T, `${V(n).turn.eventCount ?? ""} events · ${V(n).turn.toolEventCount ?? ""} tools `);
				}, [
					() => x(V(n)),
					() => m(V(n)),
					() => u(V(n).turn.startedAt),
					() => d(V(n).turn.durationMs)
				]), H("click", s, () => p(V(n))), W(e, i);
			};
			K(S, (e) => {
				V(n).kind === "gap" ? e(C) : V(n).turn && e(w, 1);
			}), W(e, s);
		}), W(e, n);
	};
	K(C, (e) => {
		V(r).loading && !V(r).loaded ? e(w) : V(r).error && !V(r).loaded ? e(T, 1) : e(E, -1);
	}), k(S), W(e, S), M();
}
Cr(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var pl = /* @__PURE__ */ U("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), ml = /* @__PURE__ */ U("<pre class=\"markdown-view\"> </pre>"), hl = /* @__PURE__ */ U("<div class=\"content-section\" data-component-owner=\"markdown-document\"><!></div>");
function gl(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => qo(t.file.name));
	var r = hl(), i = L(r), a = (e) => {
		var n = pl(), r = L(n);
		Xr(r, () => Lo(t.file.content || "", {
			workspaceId: t.workspaceId,
			resolveResourceTitle: t.resolveResourceTitle
		}), !0), k(r), Qr(r, (e, t) => zo?.(e, t), () => ({
			resolveResourceTitle: t.resolveResourceTitle,
			onNavigate: t.onNavigate
		})), k(n), W(e, n);
	}, o = (e) => {
		var n = ml(), r = L(n, !0);
		k(n), z(() => G(r, t.file.content || "")), W(e, n);
	};
	K(i, (e) => {
		V(n) ? e(a) : e(o, -1);
	}), k(r), z(() => {
		Y(r, "data-doc-file", t.file.name), Y(r, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`);
	}), W(e, r), M();
}
//#endregion
//#region src/components/SchedulerPanel.svelte
var _l = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary-button\">Cancel edit</button>"), vl = /* @__PURE__ */ U("<article><header><div><strong> </strong><code> </code></div><div><button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button><button type=\"button\" class=\"secondary-button danger\"><!><span>Remove</span></button></div></header> <dl><div><dt>Condition</dt><dd> </dd></div><div><dt>Target</dt><dd><code> </code></dd></div></dl></article>"), yl = /* @__PURE__ */ U("<div class=\"empty-list-row\"><!><span>No schedules. The Server will not create empty Scheduler Turns.</span></div>"), bl = /* @__PURE__ */ U("<div class=\"scheduler-settings-card\"><div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div> <label><input type=\"number\" min=\"1\" max=\"10080\" step=\"1\" aria-label=\"Scheduler wake interval in minutes\"/><span>minutes</span></label> <button type=\"button\" class=\"secondary-button\"><!><span>Save</span></button></div> <div class=\"schedule-editor\"><div class=\"schedule-editor-heading\"><div><strong> </strong><span>Conditions are natural language interpreted by the Scheduler Agent.</span></div><!></div> <label><span>Description</span><input placeholder=\"What should the Scheduler understand?\"/></label> <label><span>Condition</span><textarea rows=\"3\" placeholder=\"For example: when the release branch is green after 09:00 Shanghai time\"></textarea></label> <label><span>Target resource ID</span><input placeholder=\"workspace, scheduler, project1, or project1.task1\"/></label> <button type=\"button\"><span class=\"schedule-icon schedule-icon-busy\"><!></span><span class=\"schedule-icon schedule-icon-editing\"><!></span><span class=\"schedule-icon schedule-icon-add\"><!></span><span> </span></button></div> <div class=\"schedule-list\"><!></div>", 1);
function xl(e, t) {
	j(t, !0);
	let n = new bo();
	ji(() => n.dispose());
	let r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F("workspace"), s = /* @__PURE__ */ F(30), c = /* @__PURE__ */ F(!1);
	bn(() => {
		I(s, t.config.wakeIntervalMinutes, !0);
	});
	function l(e) {
		I(r, e.id, !0), I(i, e.description, !0), I(a, e.condition, !0), I(o, e.target, !0);
	}
	function u() {
		I(r, ""), I(i, ""), I(a, ""), I(o, "workspace");
	}
	async function d() {
		if (!V(i).trim() || !V(a).trim() || !V(o).trim() || V(c)) return;
		I(c, !0);
		let e = !!V(r);
		try {
			let s = `/api/workspaces/${encodeURIComponent(t.workspaceId)}/scheduler${V(r) ? `/${encodeURIComponent(V(r))}` : ""}`;
			await n.request(s, {
				method: V(r) ? "PUT" : "POST",
				body: JSON.stringify({
					description: V(i),
					condition: V(a),
					target: V(o)
				})
			}), u(), await t.onChanged(), t.onToast(e ? "Schedule updated." : "Schedule added.");
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		} finally {
			I(c, !1);
		}
	}
	async function f(e) {
		if (window.confirm(`Remove schedule ${e.id}?`)) try {
			await n.request(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/scheduler/${encodeURIComponent(e.id)}`, { method: "DELETE" }), V(r) === e.id && u(), await t.onChanged(), t.onToast("Schedule removed.");
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function p() {
		if (!(!Number.isInteger(V(s)) || V(s) < 1 || V(s) > 10080 || V(c))) {
			I(c, !0);
			try {
				await n.request(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/scheduler/settings`, {
					method: "PUT",
					body: JSON.stringify({
						agentBinding: t.config.agentBinding,
						wakeIntervalMinutes: V(s)
					})
				}), await t.onChanged(), t.onToast("Scheduler interval saved.");
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				I(c, !1);
			}
		}
	}
	var m = bl(), h = un(m), g = R(L(h), 2), _ = L(g);
	_i(_), A(), k(g);
	var v = R(g, 2);
	X(L(v), { name: "save" }), A(), k(v), k(h);
	var y = R(h, 2), b = L(y), x = L(b), S = L(x), C = L(S, !0);
	k(S), A(), k(x);
	var w = R(x), T = (e) => {
		var t = _l();
		H("click", t, u), W(e, t);
	};
	K(w, (e) => {
		V(r) && e(T);
	}), k(b);
	var E = R(b, 2), ee = R(L(E));
	_i(ee), k(E);
	var te = R(E, 2), D = R(L(te));
	rt(D), k(te);
	var ne = R(te, 2), re = R(L(ne));
	_i(re), k(ne);
	var ie = R(ne, 2);
	let ae;
	var oe = L(ie);
	X(L(oe), { name: "loader-circle" }), k(oe);
	var se = R(oe);
	X(L(se), { name: "save" }), k(se);
	var ce = R(se);
	X(L(ce), { name: "plus" }), k(ce);
	var le = R(ce), ue = L(le, !0);
	k(le), k(ie), k(y);
	var de = R(y, 2), fe = L(de), pe = (e) => {
		var n = Mr();
		q(un(n), 17, () => t.config.schedules, (e) => e.id, (e, t) => {
			var n = vl();
			let i;
			var a = L(n), o = L(a), s = L(o), c = L(s, !0);
			k(s);
			var u = R(s), d = L(u, !0);
			k(u), k(o);
			var p = R(o), m = L(p);
			X(L(m), { name: "pencil" }), A(), k(m);
			var h = R(m);
			X(L(h), { name: "trash-2" }), A(), k(h), k(p), k(a);
			var g = R(a, 2), _ = L(g), v = R(L(_)), y = L(v, !0);
			k(v), k(_);
			var b = R(_), x = R(L(b)), S = L(x), C = L(S, !0);
			k(S), k(x), k(b), k(g), k(n), z(() => {
				i = J(n, 1, "", null, i, { editing: V(r) === V(t).id }), G(c, V(t).description), G(d, V(t).id), G(y, V(t).condition), G(C, V(t).target);
			}), H("click", m, () => l(V(t))), H("click", h, () => f(V(t))), W(e, n);
		}), W(e, n);
	}, me = (e) => {
		var t = yl();
		X(L(t), { name: "calendar-clock" }), A(), k(t), W(e, t);
	};
	K(fe, (e) => {
		t.config.schedules.length ? e(pe) : e(me, -1);
	}), k(de), z((e, n) => {
		v.disabled = V(c) || V(s) === t.config.wakeIntervalMinutes, G(C, V(r) ? "Edit schedule" : "Add schedule"), ie.disabled = e, ae = J(ie, 1, "", null, ae, n), G(ue, V(r) ? "Update schedule" : "Add schedule");
	}, [() => V(c) || !V(i).trim() || !V(a).trim() || !V(o).trim(), () => ({
		busy: V(c),
		editing: !!V(r)
	})]), Ci(_, () => V(s), (e) => I(s, e)), H("click", v, p), Ci(ee, () => V(i), (e) => I(i, e)), Ci(D, () => V(a), (e) => I(a, e)), Ci(re, () => V(o), (e) => I(o, e)), H("click", ie, d), W(e, m), M();
}
Cr(["click"]);
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var Sl = /* @__PURE__ */ U("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), Cl = /* @__PURE__ */ U("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), wl = /* @__PURE__ */ U("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), Tl = /* @__PURE__ */ U("<p class=\"log-load-error\" role=\"alert\"> </p>"), El = /* @__PURE__ */ U("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><span class=\"workspace-agents-icon workspace-agents-icon-idle\"><!></span><span class=\"workspace-agents-icon workspace-agents-icon-busy\"><!></span><span> </span></button></div></form>"), Dl = /* @__PURE__ */ U("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function Ol(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(""), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(""), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ N(() => V(r) !== V(i)), u = /* @__PURE__ */ N(() => !!(V(l) && V(o) && V(a) && V(o) !== V(a)));
	bn(() => {
		let e = Jo(t.file?.content || ""), u = t.file?.contentHash || "";
		I(o, u, !0), t.identity === V(n) ? !V(l) && u !== V(a) && (I(r, e, !0), I(i, e, !0), I(a, u, !0)) : (I(n, t.identity, !0), I(r, e, !0), I(i, e, !0), I(a, u, !0), I(c, ""), I(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), V(s) || !V(l)) return;
		let u = V(n);
		I(s, !0), I(c, "");
		try {
			let e = await t.onSave(V(r), V(a));
			if (V(n) !== u) return;
			I(i, Jo(e.content || V(r)), !0), I(r, V(i), !0), I(a, e.contentHash || "", !0), I(o, V(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			V(n) === u && I(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			V(n) === u && (I(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = Dl(), p = L(f);
	X(L(p), { name: "file-text" }), A(), k(p);
	var m = R(p, 2), h = (e) => {
		var t = Sl();
		X(L(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(), k(t), W(e, t);
	}, g = (e) => {
		var n = Cl(), r = L(n);
		X(r, { name: "triangle-alert" });
		var i = R(r, 2), a = L(i, !0);
		k(i), k(n), z(() => G(a, t.file.error)), W(e, n);
	}, _ = (e) => {
		var t = El(), n = L(t);
		rt(n);
		var i = R(n, 2), a = (e) => {
			W(e, wl());
		};
		K(i, (e) => {
			V(u) && e(a);
		});
		var o = R(i, 2), f = (e) => {
			var t = Tl(), n = L(t, !0);
			k(t), z(() => G(n, V(c))), W(e, t);
		};
		K(o, (e) => {
			V(c) && e(f);
		});
		var p = R(o, 2), m = L(p);
		let h;
		var g = L(m);
		X(L(g), { name: "save" }), k(g);
		var _ = R(g);
		X(L(_), { name: "loader-circle" }), k(_);
		var v = R(_), y = L(v, !0);
		k(v), k(m), k(p), k(t), z(() => {
			n.disabled = V(s), m.disabled = V(s) || !V(l), h = J(m, 1, "", null, h, { busy: V(s) }), G(y, V(s) ? "Saving" : "Save");
		}), Sr("submit", t, d), Ci(n, () => V(r), (e) => I(r, e)), W(e, t);
	};
	K(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), k(f), W(e, f), M();
}
//#endregion
//#region src/components/DetailPanel.svelte
var kl = /* @__PURE__ */ U("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), Al = /* @__PURE__ */ U("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), jl = /* @__PURE__ */ U("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), Ml = /* @__PURE__ */ U("<div class=\"details-header\"><h1 class=\"details-title\"> </h1></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!></div>", 1), Nl = /* @__PURE__ */ U("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), Pl = /* @__PURE__ */ U("<code class=\"resource-ref-badge\"> </code>"), Fl = /* @__PURE__ */ U("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), Il = /* @__PURE__ */ U("<button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button>"), Ll = /* @__PURE__ */ U("<div class=\"details-actions\"><!><!></div>"), Rl = /* @__PURE__ */ U("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), zl = /* @__PURE__ */ U("<button type=\"button\" role=\"tab\"><!><span> </span></button>"), Bl = /* @__PURE__ */ U("<div><!></div>"), Vl = /* @__PURE__ */ U("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), Hl = /* @__PURE__ */ U("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), Ul = /* @__PURE__ */ U("<div class=\"content-section\"><div class=\"template-list\"><!></div></div>"), Wl = /* @__PURE__ */ U("<div class=\"content-section\"><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), Gl = /* @__PURE__ */ U("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), Kl = /* @__PURE__ */ U("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), ql = /* @__PURE__ */ U("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!> <div><!></div> <!> <div><!></div> <div><div class=\"content-section\"><div class=\"worktree-list\"><!></div></div></div></div>", 1), Jl = /* @__PURE__ */ U("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!></nav> <h1 class=\"details-title\"> <!></h1><!></div> <!>", 1), Yl = /* @__PURE__ */ U("<!> <!> <!>", 1);
function Xl(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(Qt(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ F(null), s = /* @__PURE__ */ F(null), c = /* @__PURE__ */ new Map(), l = new bo(), u = 0, d = /* @__PURE__ */ N(() => (V(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), f = /* @__PURE__ */ N(() => new Set(V(d).map((e) => e.name))), p = /* @__PURE__ */ N(g), m = /* @__PURE__ */ N(() => V(o) ? `${V(o).section}:${V(o).path}` : "");
	Ai(() => t.channel.subscribe((e) => {
		let t = w(), l = ++u;
		if (I(n, e, !0), e.identity !== V(r)) {
			V(r) && V(i) && c.set(V(r), V(i)), I(r, e.identity, !0), I(o, null), I(s, null), I(a, /* @__PURE__ */ new Set(), !0);
			let t = c.get(V(r));
			I(i, t && t !== "work" ? t : h(e), !0);
			let n = document.getElementById("detailsContent");
			n && (n.scrollTop = 0);
		} else V(p).length && !V(p).some((e) => e.id === V(i)) && I(i, V(p)[0].id, !0);
		ur().then(() => {
			l === u && T(t), e.onIconsChanged();
		});
	})), Ai(() => {
		let e = (e) => {
			e.key === "Escape" && (V(s) ? (e.preventDefault(), I(s, null)) : V(o) && (e.preventDefault(), I(o, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), ji(() => l.dispose());
	function h(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "scheduler" ? "schedules" : e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "history";
	}
	function g() {
		if (!V(n).detail) return [];
		if (V(n).resourceType === "scheduler") return [{
			id: "schedules",
			label: "Schedules",
			icon: "calendar-clock"
		}, {
			id: "context",
			label: "Context",
			icon: "file-text"
		}];
		let e = [];
		return V(f).has("project.md") && e.push({
			id: "project",
			label: "Project",
			icon: "file-text"
		}), V(f).has("task.md") && e.push({
			id: "task",
			label: "Task",
			icon: "file-text"
		}), (V(n).resourceType === "project" || V(n).detail.template) && e.push({
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
		}), V(n).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees",
			icon: "folder-git-2"
		}), e;
	}
	function _(e) {
		return e.name === "scheduler.md" ? "context" : e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : V(p).find((e) => ["project", "task"].includes(e.id))?.id || "";
	}
	function v(e) {
		I(i, e, !0), c.set(V(r), e);
	}
	function y(e) {
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function b(e) {
		let t = new Set(V(a));
		t.has(e) ? t.delete(e) : t.add(e), I(a, t, !0), queueMicrotask(V(n).onIconsChanged);
	}
	function x(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(V(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function S(e, t) {
		I(o, {
			section: e,
			path: t
		}, !0);
	}
	function C(e) {
		return `${e.section}:${e.path}`;
	}
	function w() {
		if (!V(o)) return null;
		let e = document.querySelector("[data-preview-scroll]");
		return e ? {
			key: C(V(o)),
			scrollTop: e.scrollTop,
			scrollLeft: e.scrollLeft
		} : null;
	}
	function T(e) {
		if (!e || !V(o) || e.key !== C(V(o))) return;
		let t = document.querySelector("[data-preview-scroll]");
		t && (t.scrollTop = e.scrollTop, t.scrollLeft = e.scrollLeft);
	}
	function E(e) {
		e && V(n).onToast(e);
	}
	var ee = Yl(), te = un(ee), D = (e) => {
		var t = kl(), n = L(t);
		X(L(n), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(n), k(t), W(e, t);
	}, ne = (e) => {
		var t = Ml(), r = un(t), i = L(r), o = L(i, !0);
		k(i), k(r);
		var s = R(r, 2), c = L(s);
		Ol(c, {
			get identity() {
				return V(n).identity;
			},
			get file() {
				return V(n).workspaceAgents;
			},
			get onSave() {
				return V(n).onSaveWorkspaceAgents;
			},
			get onToast() {
				return V(n).onToast;
			},
			get onIconsChanged() {
				return V(n).onIconsChanged;
			}
		});
		var l = R(c, 2), u = (e) => {
			var t = Al(), r = L(t);
			X(L(r), { name: "book-open" }), A(), k(r);
			var i = R(r), a = L(i);
			X(a, { name: "triangle-alert" });
			var o = R(a, 2), s = L(o, !0);
			k(o), k(i), k(t), z(() => G(s, V(n).wiki.error)), W(e, t);
		}, d = (e) => {
			var t = jl(), n = L(t);
			X(L(n), { name: "book-open" }), A(), k(n);
			var r = R(n);
			X(L(r), { name: "book-open" }), A(2), k(r), k(t), W(e, t);
		}, f = (e) => {
			{
				let t = /* @__PURE__ */ N(() => V(n).wiki.entries || []);
				rs(e, {
					title: "Wiki",
					get entries() {
						return V(t);
					},
					emptyMessage: "No Wiki files yet.",
					get expanded() {
						return V(a);
					},
					get activePath() {
						return V(m);
					},
					onToggle: b,
					onPreview: S,
					rawURL: x
				});
			}
		};
		K(l, (e) => {
			V(n).wiki?.error ? e(u) : V(n).wiki?.exists ? e(f, -1) : e(d, 1);
		}), k(s), z(() => G(o, V(n).workspaceName)), W(e, t);
	}, re = (e) => {
		var t = Jl(), r = un(t), o = L(r), c = L(o), l = L(c, !0);
		k(c);
		var u = R(c, 2), f = (e) => {
			var t = Nl(), r = R(un(t)), i = L(r, !0);
			k(r), z(() => G(i, V(n).parent.title)), H("click", r, () => V(n).onNavigate(V(n).parent?.id || "workspace")), W(e, t);
		};
		K(u, (e) => {
			V(n).parent && e(f);
		}), k(o);
		var h = R(o, 2), g = L(h, !0), C = R(g), w = (e) => {
			var t = Pl(), r = L(t, !0);
			k(t), z((e) => G(r, e), [() => y(V(n).resourceId)]), W(e, t);
		};
		K(C, (e) => {
			V(n).resourceType !== "scheduler" && e(w);
		}), k(h);
		var T = R(h), E = (e) => {
			var t = Ll(), r = L(t), i = (e) => {
				var t = Fl();
				X(L(t), { name: "plus" }), A(), k(t), H("click", t, () => V(n).onCreateTask(V(n).resourceId)), W(e, t);
			};
			K(r, (e) => {
				V(n).resourceType === "project" && e(i);
			});
			var a = R(r), o = (e) => {
				var t = Il();
				X(L(t), { name: "archive" }), A(), k(t), H("click", t, () => V(n).onArchive(V(n).resourceId)), W(e, t);
			};
			K(a, (e) => {
				V(n).resourceType !== "scheduler" && e(o);
			}), k(t), W(e, t);
		};
		K(T, (e) => {
			V(n).detail && e(E);
		}), k(r);
		var ee = R(r, 2), te = (e) => {
			var t = Rl(), n = L(t);
			X(L(n), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), A(), k(n), k(t), W(e, t);
		}, D = (e) => {
			var t = ql(), r = un(t);
			q(r, 21, () => V(p), (e) => e.id, (e, t) => {
				var n = zl();
				let r;
				var a = L(n);
				X(a, { get name() {
					return V(t).icon;
				} });
				var o = R(a), s = L(o, !0);
				k(o), k(n), z(() => {
					r = J(n, 1, "details-tab", null, r, { active: V(i) === V(t).id }), Y(n, "aria-selected", V(i) === V(t).id), G(s, V(t).label);
				}), H("click", n, () => v(V(t).id)), W(e, n);
			}), k(r);
			var o = R(r, 2), c = L(o);
			q(c, 17, () => V(d), (e) => e.path || e.name, (e, t) => {
				var r = Bl();
				gl(L(r), {
					get file() {
						return V(t);
					},
					get workspaceId() {
						return V(n).workspaceId;
					},
					get resolveResourceTitle() {
						return V(n).resolveResourceTitle;
					},
					get onNavigate() {
						return V(n).onNavigate;
					}
				}), k(r), z((e) => Y(r, "hidden", e), [() => V(i) !== _(V(t))]), W(e, r);
			});
			var l = R(c, 2), u = (e) => {
				var t = Bl(), r = L(t);
				{
					let e = /* @__PURE__ */ N(() => V(n).onRefreshScheduler || (async () => void 0));
					xl(r, {
						get workspaceId() {
							return V(n).workspaceId;
						},
						get config() {
							return V(n).detail.scheduler;
						},
						get onChanged() {
							return V(e);
						},
						get onToast() {
							return V(n).onToast;
						}
					});
				}
				k(t), z(() => Y(t, "hidden", V(i) !== "schedules")), W(e, t);
			};
			K(l, (e) => {
				V(n).resourceType === "scheduler" && V(n).detail.scheduler && e(u);
			});
			var f = R(l, 2), h = L(f), g = (e) => {
				var t = Ul(), r = L(t), i = L(r), a = (e) => {
					var t = Mr();
					q(un(t), 17, () => V(n).detail.templates, (e) => e.name, (e, t) => {
						var n = Vl();
						let r;
						var i = L(n);
						X(i, { name: "file-text" });
						var a = R(i), o = L(a), s = L(o, !0);
						k(o);
						var c = R(o), l = L(c);
						k(c), k(a), X(R(a), { name: "chevron-right" }), k(n), z(() => {
							r = J(n, 1, "template-row", null, r, { invalid: !V(t).valid }), G(s, V(t).title || V(t).name), G(l, `${V(t).name ?? ""} · v${(V(t).schemaVersion || "?") ?? ""} · ${V(t).valid ? `${(V(t).fields || []).length} fields` : `invalid${V(t).errors?.[0]?.message ? `: ${V(t).errors[0].message}` : ""}`}${V(t).legacy ? " · legacy" : ""}`);
						}), H("click", n, () => V(t).path && S("Templates", V(t).path)), W(e, n);
					}), W(e, t);
				}, o = (e) => {
					var t = Hl();
					X(L(t), { name: "layout-template" }), A(), k(t), W(e, t);
				};
				K(i, (e) => {
					V(n).detail.templates?.length ? e(a) : e(o, -1);
				}), k(r), k(t), W(e, t);
			}, y = (e) => {
				var t = Wl(), r = L(t), i = L(r), a = L(i);
				X(a, { name: "file-text" });
				var o = R(a), s = L(o), c = L(s, !0);
				k(s);
				var l = R(s), u = L(l);
				k(l), k(o), k(i), k(r), k(t), z(() => {
					G(c, V(n).detail.template.name), G(u, `Created from template · v${(V(n).detail.template.schemaVersion || "?") ?? ""} · ${(V(n).detail.template.digest || "") ?? ""}`);
				}), W(e, t);
			};
			K(h, (e) => {
				V(n).resourceType === "project" ? e(g) : V(n).detail.template && e(y, 1);
			}), k(f);
			var C = R(f, 2), w = (e) => {
				var t = Mr();
				Br(un(t), () => V(n).identity, (e) => {
					{
						let t = /* @__PURE__ */ N(() => V(n).detail.artifacts || []);
						fl(e, {
							get workspaceId() {
								return V(n).workspaceId;
							},
							get resourceId() {
								return V(n).resourceId;
							},
							get artifacts() {
								return V(t);
							},
							get resolveResourceTitle() {
								return V(n).resolveResourceTitle;
							},
							get onNavigate() {
								return V(n).onNavigate;
							},
							onOpenLegacy: (e) => S("Artifacts", e),
							get onIconsChanged() {
								return V(n).onIconsChanged;
							}
						});
					}
				}), W(e, t);
			};
			K(C, (e) => {
				V(i) === "history" && e(w);
			});
			var T = R(C, 2), E = L(T);
			{
				let e = /* @__PURE__ */ N(() => V(n).detail.artifacts || []);
				rs(E, {
					title: "Artifacts",
					get entries() {
						return V(e);
					},
					emptyMessage: "No artifacts.",
					get expanded() {
						return V(a);
					},
					get activePath() {
						return V(m);
					},
					onToggle: b,
					onPreview: S,
					rawURL: x,
					showHeading: !1
				});
			}
			k(T);
			var ee = R(T, 2), te = L(ee), D = L(te), ne = L(D), re = (e) => {
				var t = Mr();
				q(un(t), 17, () => V(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = Gl(), r = L(n), i = L(r);
					X(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = R(i), o = L(a), c = L(o, !0);
					k(o);
					var l = R(o), u = L(l);
					k(l);
					var d = R(l), f = L(d, !0);
					k(d), k(a), k(r);
					var p = R(r);
					X(L(p), { name: "git-compare-arrows" }), A(), k(p), k(n), z(() => {
						G(c, V(t).branch || "HEAD"), G(u, `${(V(t).name || "repository") ?? ""}${V(t).targetBranch || V(t).baseBranch ? ` · base ${V(t).targetBranch || V(t).baseBranch}` : ""}`), G(f, V(t).worktreePath || "");
					}), H("click", p, () => I(s, V(t), !0)), W(e, n);
				}), W(e, t);
			}, ie = (e) => {
				var t = Kl();
				X(L(t), { name: "git-branch" }), A(), k(t), W(e, t);
			};
			K(ne, (e) => {
				V(n).detail.repos?.length ? e(re) : e(ie, -1);
			}), k(D), k(te), k(ee), k(o), z(() => {
				Y(f, "hidden", V(i) !== "template"), Y(T, "hidden", V(i) !== "artifacts"), Y(ee, "hidden", V(i) !== "worktrees");
			}), W(e, t);
		};
		K(ee, (e) => {
			V(n).loading || !V(n).detail ? e(te) : e(D, -1);
		}), z(() => {
			G(l, V(n).workspaceName), G(g, V(n).resourceTitle);
		}), H("click", c, () => V(n).onNavigate("workspace")), W(e, t);
	};
	K(te, (e) => {
		V(n).workspaceId ? V(n).resourceType === "workspace" ? e(ne, 1) : e(re, -1) : e(D);
	});
	var ie = R(te, 2);
	ds(ie, {
		get client() {
			return l;
		},
		get workspaceId() {
			return V(n).workspaceId;
		},
		get resourceId() {
			return V(n).resourceId;
		},
		get selection() {
			return V(o);
		},
		get resolveResourceTitle() {
			return V(n).resolveResourceTitle;
		},
		get onNavigate() {
			return V(n).onNavigate;
		},
		onClose: () => I(o, null),
		onError: E,
		get onIconsChanged() {
			return V(n).onIconsChanged;
		}
	}), Oo(R(ie, 2), {
		get client() {
			return l;
		},
		get workspaceId() {
			return V(n).workspaceId;
		},
		get resourceId() {
			return V(n).resourceId;
		},
		get repo() {
			return V(s);
		},
		onClose: () => I(s, null),
		onError: E,
		get onIconsChanged() {
			return V(n).onIconsChanged;
		}
	}), W(e, ee), M();
}
Cr(["click"]);
//#endregion
//#region src/components/generation-status.ts
var Zl = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"stopping",
	"recovering"
]), Ql = /* @__PURE__ */ new Set([
	"idle",
	"idle-suspended",
	"stopped",
	"failed",
	"archived"
]);
function $l(e) {
	return String(e || "").trim();
}
function eu(e, t) {
	let n = $l(e.generation.status) || "unknown", r = t?.generation;
	if (!r || r.generationId !== e.generation.generationId) return n;
	let i = $l(r.status);
	if (!t?.state) return i || n;
	switch (t.state) {
		case "working": return Zl.has(i) ? i : "running";
		case "attention_required": return i === "waiting_approval" ? i : "waiting_approval";
		case "idle": return Ql.has(i) ? i : "idle";
		case "archived": return "archived";
		case "unavailable": return i === "failed" || i === "recovering" ? i : "failed";
		default: return i || n;
	}
}
//#endregion
//#region src/components/EventTimeline.svelte
var tu = /* @__PURE__ */ U("<button type=\"button\"><span class=\"load-older-icon load-older-icon-idle\"><!></span><span class=\"load-older-icon load-older-icon-busy\"><!></span><span> </span></button>"), nu = /* @__PURE__ */ U("<div class=\"conversation-generation\"><span> </span><strong> </strong><small> </small></div>"), ru = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary-button\">Retry</button>"), iu = /* @__PURE__ */ U("<div class=\"conversation-gap\"><!><span><strong>History unavailable</strong><small> </small></span><!></div>"), au = /* @__PURE__ */ U("<div class=\"turn-summary-preview\"> </div>"), ou = /* @__PURE__ */ U("<div><!></div>"), su = /* @__PURE__ */ U("<div class=\"turn-loading\"><!><span>Loading turn details</span></div>"), cu = /* @__PURE__ */ U("<section><!> <!> <!> <!></section>"), lu = /* @__PURE__ */ U("<!> <!>", 1), uu = /* @__PURE__ */ U("<div class=\"turn-working-indicator\" role=\"status\" aria-live=\"polite\" data-timeline-key=\"turn-working\"><!><span>working...</span></div>"), du = /* @__PURE__ */ U("<div class=\"tty-empty\"><!><strong>Loading resource history</strong></div>"), fu = /* @__PURE__ */ U("<div class=\"tty-empty\"><!><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>"), pu = /* @__PURE__ */ U("<!> <!> <!> <!> <!> <!> <!>", 1), mu = /* @__PURE__ */ U("<div class=\"tty-empty\"><!><strong>No resource selected</strong></div>"), hu = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div>");
function gu(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(Qt(t.channel.current().project)), i = /* @__PURE__ */ F(Qt(D())), a = /* @__PURE__ */ F(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ F(Qt(/* @__PURE__ */ new Map()));
	Ai(() => {
		let e = S();
		o = new uc({
			onEvent: (e, t, r) => V(n).onEvent(e, t, r),
			onNotice: (e, t, r) => V(n).onNotice(e, t, r)
		});
		let i = o.subscribe(f), a = t.channel.subscribe((e) => {
			let t = V(n).identity, i = T(V(n).status) !== T(e.status) && w(S());
			I(n, e, !0), e.project !== V(r) && I(r, e.project, !0), e.identity !== t && (l = !0, s = null, I(d, new Map(u.get(e.identity) ?? []), !0)), o?.activate(e.workspaceId, e.resourceId, e.status), ur().then(() => {
				i && !C() && E(), e.onIconsChanged();
			});
		}), c = () => {
			if (!s || C()) return;
			let e = s;
			s = null, p(e);
		};
		return document.addEventListener("selectionchange", c), () => {
			i(), a(), document.removeEventListener("selectionchange", c), o?.dispose(), o = void 0, e && e.removeAttribute("data-agent-resource-id");
		};
	});
	function f(e) {
		if (V(i).identity && e.identity === V(i).identity && C()) {
			s = e;
			return;
		}
		p(e);
	}
	function p(e) {
		let t = S();
		c = e.identity !== V(i).identity || l || w(t), l = !1, I(i, e, !0), t && (t.dataset.agentResourceId = e.resourceId), ur().then(() => {
			c && !C() && E(), V(n).onIconsChanged(), e.loaded && e.hasMoreBefore && _(e.identity);
		});
	}
	function m(e, t) {
		let n = t;
		if (typeof IntersectionObserver > "u") return n && o?.loadTurn(n), {
			update(e) {
				n = e, n && o?.loadTurn(n);
			},
			destroy() {}
		};
		let r = new IntersectionObserver((e) => {
			e.some((e) => e.isIntersecting) && n && o?.loadTurn(n);
		}, {
			root: S(),
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
	function h(e) {
		return e.events ? V(r)(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || [];
	}
	function g(e) {
		return e.generation.agentName || e.generation.resolvedProfile || e.generation.binding?.name || V(n).agentName || "Agent";
	}
	async function _(e) {
		let t = 0;
		for (; t < 16 && V(i).identity === e && V(i).hasMoreBefore;) {
			let e = S();
			if (!e || e.scrollHeight > e.clientHeight + 160 || C() || !await o?.loadOlder()) return;
			t++, await ur(), E();
		}
	}
	async function v() {
		let e = S();
		if (!e || V(i).loadingOlder) return;
		let t = ee(e), r = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = V(i).identity;
		await o?.loadOlder(), await ur(), V(i).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - r) : s + (e.scrollHeight - a), V(n).onIconsChanged());
	}
	function y(e, t) {
		let n = te(e);
		I(d, new Map(V(d)).set(n, t), !0), u.set(V(i).identity, new Map(V(d))), t && b(e);
	}
	function b(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return o?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function x(e) {
		return V(d).get(te(e)) ?? !1;
	}
	function S() {
		return V(a)?.parentElement ?? null;
	}
	function C() {
		let e = S(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function w(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function T(e) {
		return e?.session?.state === "running" && !!e.session.currentTurnId;
	}
	function E() {
		let e = S();
		e && (e.scrollTop = e.scrollHeight);
	}
	function ee(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function te(e) {
		let t = e.kind === "tools" ? ac(e) : String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event");
		return `${e.generationId || V(i).generationId}:${e.kind}:${t}`;
	}
	function D() {
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
	var ne = hu(), re = L(ne), ie = (e) => {
		var t = pu(), r = un(t), a = (e) => {
			var t = tu();
			let n;
			var r = L(t);
			X(L(r), { name: "chevrons-up" }), k(r);
			var a = R(r);
			X(L(a), { name: "loader-circle" }), k(a);
			var o = R(a), s = L(o, !0);
			k(o), k(t), z(() => {
				n = J(t, 1, "load-older-events", null, n, { busy: V(i).loadingOlder }), t.disabled = V(i).loadingOlder, G(s, V(i).loadingOlder ? "Loading..." : "Load older messages");
			}), H("click", t, v), W(e, t);
		};
		K(r, (e) => {
			V(i).hasMoreBefore && e(a);
		});
		var s = R(r, 2);
		q(s, 19, () => V(i).blocks, (e) => e.key, (e, t, r) => {
			var a = lu(), s = un(a), c = (e) => {
				var r = nu(), i = L(r), a = L(i);
				k(i);
				var o = R(i), s = L(o, !0);
				k(o);
				var c = R(o), l = L(c, !0);
				k(c), k(r), z((e, n) => {
					Y(r, "data-generation-id", V(t).generation.generationId), G(a, `Generation ${V(t).generation.generation ?? ""}`), G(s, V(t).generation.agentName || V(t).generation.resolvedProfile || V(t).generation.binding?.name || "Agent"), Y(c, "data-generation-status", e), G(l, n);
				}, [() => eu(V(t), V(n).status), () => eu(V(t), V(n).status)]), W(e, r);
			};
			K(s, (e) => {
				(V(r) === 0 || V(i).blocks[V(r) - 1].generation.generationId !== V(t).generation.generationId) && e(c);
			});
			var l = R(s, 2), u = (e) => {
				var n = iu(), r = L(n);
				X(r, { name: "triangle-alert" });
				var i = R(r), a = R(L(i)), s = L(a, !0);
				k(a), k(i);
				var c = R(i), l = (e) => {
					var t = ru();
					H("click", t, () => o?.retryHistory()), W(e, t);
				};
				K(c, (e) => {
					V(t).gap?.retryable && e(l);
				}), k(n), z(() => {
					Y(n, "data-timeline-key", V(t).key), G(s, V(t).gap?.message || "This generation could not be read.");
				}), W(e, n);
			}, d = (e) => {
				var r = cu();
				let a;
				var o = L(r), s = (e) => {
					var n = au(), r = L(n, !0);
					k(n), z(() => G(r, V(t).turn.triggerPreview)), W(e, n);
				};
				K(o, (e) => {
					V(t).turn?.triggerPreview && !V(t).items && !V(t).events && e(s);
				});
				var c = R(o, 2);
				q(c, 17, () => h(V(t)), (e) => te(e), (e, r) => {
					var a = ou(), o = L(a), s = (e) => {
						{
							let i = /* @__PURE__ */ N(() => g(V(t)));
							Bc(e, {
								get item() {
									return V(r);
								},
								get agentName() {
									return V(i);
								},
								get workspaceId() {
									return V(n).workspaceId;
								},
								get resolveResourceTitle() {
									return V(n).resolveResourceTitle;
								},
								get onNavigate() {
									return V(n).onNavigate;
								}
							});
						}
					}, c = (e) => {
						Nc(e, {
							get item() {
								return V(r);
							},
							onExpand: () => b(V(r))
						});
					}, l = (e) => {
						{
							let n = /* @__PURE__ */ N(() => x(V(r)));
							qc(e, {
								get item() {
									return V(r);
								},
								get generationId() {
									return V(t).generation.generationId;
								},
								get open() {
									return V(n);
								},
								onToggle: (e) => y(V(r), e)
							});
						}
					}, u = (e) => {
						bs(e, {
							get item() {
								return V(r);
							},
							get generationId() {
								return V(t).generation.generationId;
							},
							get contextIdentity() {
								return V(i).identity;
							},
							get onApproval() {
								return V(n).onApproval;
							},
							get onToast() {
								return V(n).onToast;
							}
						});
					}, d = (e) => {
						jc(e, { get item() {
							return V(r);
						} });
					}, f = (e) => {
						{
							let t = /* @__PURE__ */ N(() => V(r).text || "");
							Hc(e, {
								title: "Provider error",
								get text() {
									return V(t);
								},
								error: !0
							});
						}
					}, p = (e) => {
						Yc(e, { get item() {
							return V(r);
						} });
					};
					K(o, (e) => {
						V(r).kind === "message" ? e(s) : V(r).kind === "thinking" ? e(c, 1) : V(r).kind === "tools" ? e(l, 2) : V(r).kind === "approval" ? e(u, 3) : V(r).kind === "lifecycle" ? e(d, 4) : V(r).kind === "error" ? e(f, 5) : e(p, -1);
					}), k(a), z((e) => Y(a, "data-timeline-key", e), [() => te(V(r))]), W(e, a);
				});
				var l = R(c, 2), u = (e) => {
					var t = su();
					X(L(t), { name: "loader-circle" }), A(), k(t), W(e, t);
				};
				K(l, (e) => {
					V(t).loading && !V(t).items && !V(t).events && e(u);
				});
				var d = R(l, 2), f = (e) => {
					Hc(e, {
						title: "Turn unavailable",
						get text() {
							return V(t).error;
						},
						error: !0
					});
				};
				K(d, (e) => {
					V(t).error && e(f);
				}), k(r), Qr(r, (e, t) => m?.(e, t), () => V(t).turn?.reference || ""), z(() => {
					a = J(r, 1, "conversation-turn", null, a, { "conversation-turn-loading": V(t).loading }), Y(r, "data-timeline-key", V(t).key);
				}), W(e, r);
			};
			K(l, (e) => {
				V(t).kind === "gap" ? e(u) : e(d, -1);
			}), W(e, a);
		});
		var c = R(s, 2);
		q(c, 19, () => V(i).notices, (e, t) => `notice:${V(i).identity}:${t}:${String(e.data?.text || "")}`, (e, t, n) => {
			var r = ou(), i = L(r);
			{
				let e = /* @__PURE__ */ N(() => String(V(t).data?.text || "")), n = /* @__PURE__ */ N(() => V(t).data?.level === "error");
				Hc(i, {
					title: "Forge",
					get text() {
						return V(e);
					},
					get error() {
						return V(n);
					}
				});
			}
			k(r), z(() => Y(r, "data-timeline-key", `notice:${V(n)}`)), W(e, r);
		});
		var l = R(c, 2), u = (e) => {
			Hc(e, {
				title: "Timeline error",
				get text() {
					return V(i).error;
				},
				error: !0,
				alert: !0
			});
		};
		K(l, (e) => {
			V(i).error && e(u);
		});
		var d = R(l, 2), f = (e) => {
			var t = uu();
			X(L(t), { name: "loader-circle" }), A(), k(t), W(e, t);
		}, p = /* @__PURE__ */ N(() => T(V(n).status));
		K(d, (e) => {
			V(p) && e(f);
		});
		var _ = R(d, 2), S = (e) => {
			var t = du();
			X(L(t), { name: "loader-circle" }), A(), k(t), W(e, t);
		};
		K(_, (e) => {
			V(i).loading && !V(i).blocks.length && e(S);
		});
		var C = R(_, 2), w = (e) => {
			var t = fu();
			X(L(t), { name: "bot" }), A(2), k(t), W(e, t);
		}, E = /* @__PURE__ */ N(() => V(i).loaded && !V(i).loading && !V(i).blocks.length && !V(i).notices.length && !T(V(n).status));
		K(C, (e) => {
			V(E) && e(w);
		}), W(e, t);
	}, ae = (e) => {
		var t = mu();
		X(L(t), { name: "bot" }), A(), k(t), W(e, t);
	};
	K(re, (e) => {
		V(i).resourceId ? e(ie) : e(ae, -1);
	}), k(ne), Oi(ne, (e) => I(a, e), () => V(a)), z(() => Y(ne, "data-chat-context", V(i).identity)), W(e, ne), M();
}
Cr(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function _u(e) {
	return {
		tab: e.initialTab,
		workspacePath: "",
		createWorkspace: !1,
		userName: e.userName,
		endpoint: e.agentHub.configuredEndpoint || "http://127.0.0.1:4646",
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: {
			workspace: e.agentHub.resourceDefaults?.workspace || "default",
			project: e.agentHub.resourceDefaults?.project || "default",
			task: e.agentHub.resourceDefaults?.task || "default"
		},
		newProfile: {
			key: "",
			description: "",
			agentName: e.agents[0]?.id || ""
		},
		dirty: !1
	};
}
function vu(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: { ...e.resourceDefaults },
		newProfile: { ...e.newProfile }
	};
}
function yu(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var bu = /* @__PURE__ */ U("<span class=\"settings-pill\"> </span>"), xu = /* @__PURE__ */ U("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), Su = /* @__PURE__ */ U("<div class=\"settings-empty\">No AgentHub agents available.</div>"), Cu = /* @__PURE__ */ U("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function wu(e, t) {
	j(t, !0);
	let n = ki(t, "draft", 15), r = ki(t, "pending", 15);
	async function i() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(vu(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(yu(e));
			} finally {
				r("");
			}
		}
	}
	var a = Cu(), o = R(L(a), 2), s = L(o), c = R(L(s)), l = L(c, !0);
	k(c), k(s);
	var u = R(s, 2), d = R(L(u));
	_i(d), k(u);
	var f = R(u, 2), p = L(f, !0);
	k(f);
	var m = R(f, 2);
	q(m, 21, () => t.agentHub.capabilities, Vr, (e, t) => {
		var n = bu(), r = L(n, !0);
		k(n), z(() => G(r, V(t))), W(e, n);
	}), k(m), k(o);
	var h = R(o, 2), g = L(h), _ = R(L(g)), v = L(_);
	k(_), k(g);
	var y = R(g, 2);
	q(y, 21, () => t.agentHub.agents, (e) => e.name, (e, t) => {
		var n = xu(), r = L(n), i = L(r), a = L(i, !0);
		k(i);
		var o = R(i), s = L(o), c = L(s, !0);
		k(s);
		var l = R(s), u = L(l);
		k(l), k(o), k(r), k(n), z((e) => {
			G(a, e), G(c, V(t).name), G(u, `${(V(t).providerId || "") ?? ""} · ${(V(t).available === !1 ? V(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (V(t).name || "A").slice(0, 1).toUpperCase()]), W(e, n);
	}, (e) => {
		W(e, Su());
	}), k(y), k(h);
	var b = R(h, 2), x = L(b);
	let S;
	var C = L(x, !0);
	k(x);
	var w = R(x);
	X(L(w), { name: "save" }), A(), k(w), k(b), k(a), z((e) => {
		G(l, t.agentHub.connected && t.agentHub.compatible ? "Compatible" : t.agentHub.connected ? "Incompatible" : "Unavailable"), G(p, t.agentHub.error || `API ${t.agentHub.apiVersion || "unknown"} · AgentHub ${t.agentHub.version || "unknown"}`), G(v, `${t.agentHub.agents.length ?? ""} agents · ${t.agentHub.providers.length ?? ""} providers`), S = J(x, 1, "settings-save-hint", null, S, { visible: n().dirty }), G(C, n().dirty ? "Unsaved changes" : ""), w.disabled = e;
	}, [() => !n().dirty || !!r()]), H("input", d, function(...e) {
		t.onDirty?.apply(this, e);
	}), Ci(d, () => n().endpoint, (e) => n(n().endpoint = e, !0)), H("click", w, i), W(e, a), M();
}
Cr(["input", "click"]);
//#endregion
//#region src/components/AppearanceSettingsPanel.svelte
var Tu = /* @__PURE__ */ jr("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), Eu = /* @__PURE__ */ jr("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), Du = /* @__PURE__ */ jr("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"80\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-strong\" x=\"40\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect><rect class=\"d-outline\" x=\"74\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect></svg>"), Ou = /* @__PURE__ */ jr("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-light\" x=\"6\" y=\"8\" width=\"70\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"82\" y=\"8\" width=\"32\" height=\"56\" rx=\"3\"></rect></svg>"), ku = /* @__PURE__ */ U("<button type=\"button\" role=\"radio\"><span class=\"layout-diagram\"><!></span> <span class=\"layout-option-text\"><strong> </strong><small> </small></span></button>"), Au = /* @__PURE__ */ U("<div class=\"font-scale-row\"><span class=\"font-scale-label\"> </span> <input type=\"range\" min=\"80\" max=\"140\" step=\"5\"/> <span class=\"font-scale-value\"> </span></div>"), ju = /* @__PURE__ */ U("<div class=\"settings-panel\" data-component-owner=\"appearance-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Appearance</h2><p>Choose the workspace layout and the text size of each column. Everything applies immediately and is stored only in this browser.</p></div> <section class=\"appearance-section\" aria-label=\"Layout\"><div class=\"settings-section-heading\"><h3>Layout</h3></div> <div class=\"layout-options\" role=\"radiogroup\" aria-label=\"Workspace layout\"></div></section> <section class=\"appearance-section\" aria-label=\"Text size\"><div class=\"settings-section-heading\"><h3>Text size</h3><button type=\"button\" class=\"appearance-reset\"><!><span>Reset</span></button></div> <div class=\"font-scale-rows\"></div> <small class=\"appearance-hint\">Scales the text of each column independently from 80% to 140%.</small></section></div>");
function Mu(e, t) {
	j(t, !0);
	let n = [
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
	], r = [
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
	], i = (e) => `${Math.round(e * 100)}%`, a = /* @__PURE__ */ N(() => r.every((e) => t.appearance.fontScales[e.id] === 1));
	var o = ju(), s = R(L(o), 2), c = R(L(s), 2);
	q(c, 21, () => n, (e) => e.id, (e, n) => {
		var r = ku();
		let i;
		var a = L(r), o = L(a), s = (e) => {
			W(e, Tu());
		}, c = (e) => {
			W(e, Eu());
		}, l = (e) => {
			W(e, Du());
		}, u = (e) => {
			W(e, Ou());
		};
		K(o, (e) => {
			V(n).id === "auto" ? e(s) : V(n).id === "three" ? e(c, 1) : V(n).id === "two" ? e(l, 2) : e(u, -1);
		}), k(a);
		var d = R(a, 2), f = L(d), p = L(f, !0);
		k(f);
		var m = R(f), h = L(m, !0);
		k(m), k(d), k(r), z(() => {
			i = J(r, 1, "layout-option", null, i, { active: t.appearance.layout === V(n).id }), Y(r, "aria-checked", t.appearance.layout === V(n).id), G(p, V(n).label), G(h, V(n).description);
		}), H("click", r, () => t.onLayoutPreference(V(n).id)), W(e, r);
	}), k(c), k(s);
	var l = R(s, 2), u = L(l), d = R(L(u));
	X(L(d), { name: "rotate-ccw" }), A(), k(d), k(u);
	var f = R(u, 2);
	q(f, 21, () => r, (e) => e.id, (e, n) => {
		var r = Au(), a = L(r), o = L(a, !0);
		k(a);
		var s = R(a, 2);
		_i(s);
		var c = R(s, 2), l = L(c, !0);
		k(c), k(r), z((e, t) => {
			G(o, V(n).label), vi(s, e), Y(s, "aria-label", `${V(n).label} text size`), G(l, t);
		}, [() => Math.round(t.appearance.fontScales[V(n).id] * 100), () => i(t.appearance.fontScales[V(n).id])]), H("input", s, (e) => t.onFontScale(V(n).id, Number(e.currentTarget.value) / 100)), W(e, r);
	}), k(f), A(2), k(l), k(o), z(() => d.disabled = V(a)), H("click", d, function(...e) {
		t.onResetFontScales?.apply(this, e);
	}), W(e, o), M();
}
Cr(["click", "input"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var Nu = /* @__PURE__ */ U("<small class=\"settings-notification-help\"> </small>"), Pu = /* @__PURE__ */ U("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function Fu(e, t) {
	j(t, !0);
	var n = Pu(), r = R(L(n), 2), i = L(r), a = R(L(i), 2);
	_i(a), k(i);
	var o = R(i, 2), s = (e) => {
		var n = Nu(), r = L(n, !0);
		k(n), z(() => G(r, t.notifications.permissionError)), W(e, n);
	};
	K(o, (e) => {
		t.notifications.permissionError && e(s);
	}), k(r);
	var c = R(r, 2), l = L(c), u = R(L(l), 2);
	_i(u), k(l);
	var d = R(l, 2), f = L(d, !0);
	k(d), k(c), k(n), z(() => {
		yi(a, t.notifications.browser), yi(u, t.notifications.sound), G(f, t.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), H("change", a, (e) => t.onBrowserNotifications(e.currentTarget.checked)), H("change", u, (e) => t.onCompletionSound(e.currentTarget.checked)), W(e, n), M();
}
Cr(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var Iu = /* @__PURE__ */ U("<option> </option>"), Lu = /* @__PURE__ */ U("<label><span> </span><select></select></label>"), Ru = /* @__PURE__ */ U("<span class=\"settings-profile-system-label\">System</span>"), zu = /* @__PURE__ */ U("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), Bu = /* @__PURE__ */ U("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), Vu = /* @__PURE__ */ U("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>New Resource Defaults</h3><span>Applied once at creation</span></div> <div class=\"settings-resource-defaults\"></div> <p class=\"settings-resource-default-note\">Existing resources keep their explicit binding. Changing a profile route replaces its referenced resource generations at a safe turn boundary.</p></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function Hu(e, t) {
	j(t, !0);
	let n = ki(t, "draft", 15), r = ki(t, "pending", 15), i = /* @__PURE__ */ new Set([
		"default",
		"fast",
		"reasoning"
	]);
	function a(e, r, i) {
		n(n().profiles[e][r] = i, !0), t.onDirty();
	}
	function o() {
		let e = n().newProfile.key.trim().toLowerCase();
		if (!e) return t.onToast("Profile key is required.");
		if (i.has(e)) return t.onToast(`${e} is a reserved system profile.`);
		if (n().profiles.some((t) => t.key.trim().toLowerCase() === e)) return t.onToast(`Profile ${e} already exists.`);
		n(n().profiles = [...n().profiles, {
			key: e,
			description: n().newProfile.description.trim(),
			agentName: n().newProfile.agentName
		}], !0), n(n().newProfile = {
			key: "",
			description: "",
			agentName: t.agents[0]?.id || ""
		}, !0), t.onDirty();
	}
	function s(e) {
		let r = n().profiles[e];
		if (!r || i.has(r.key.trim().toLowerCase())) return t.onToast("System profiles cannot be deleted.");
		n(n().profiles = n().profiles.filter((t, n) => e !== n), !0), t.onDirty();
	}
	function c(e) {
		let n = t.agents.map((e) => ({
			id: e.id,
			label: e.label
		}));
		return e && !n.some((t) => t.id === e) ? [{
			id: e,
			label: `${e} (Unavailable)`
		}, ...n] : n;
	}
	function l(e, r) {
		n(n().resourceDefaults[e] = r, !0), t.onDirty();
	}
	function u(e) {
		let t = n().resourceDefaults[e];
		return t && !n().profiles.some((e) => e.key === t) ? [{
			key: t,
			description: "Missing Profile",
			agentName: ""
		}, ...n().profiles] : n().profiles;
	}
	async function d() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(vu(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(yu(e));
			} finally {
				r("");
			}
		}
	}
	var f = Vu(), p = R(L(f), 2), m = R(L(p), 2);
	q(m, 20, () => [
		["workspace", "Workspace"],
		["project", "Project"],
		["task", "Task"]
	], Vr, (e, t) => {
		let r = /* @__PURE__ */ N(() => t[0]);
		var i = Lu(), a = L(i), o = L(a, !0);
		k(a);
		var s = R(a);
		q(s, 21, () => u(V(r)), Vr, (e, t) => {
			var n = Iu(), r = L(n);
			k(n);
			var i = {};
			z(() => {
				G(r, `${V(t).key ?? ""}${V(t).agentName ? "" : " (Missing)"}`), i !== (i = V(t).key) && (n.value = (n.__value = V(t).key) ?? "");
			}), W(e, n);
		}), k(s);
		var c;
		ui(s), k(i), z(() => {
			G(o, t[1]), Y(s, "aria-label", `${t[1]} default profile`), c !== (c = n().resourceDefaults[V(r)]) && (s.value = (s.__value = n().resourceDefaults[V(r)]) ?? "", li(s, n().resourceDefaults[V(r)]));
		}), H("change", s, (e) => l(V(r), e.currentTarget.value)), W(e, i);
	}), k(m), A(2), k(p);
	var h = R(p, 2), g = L(h), _ = R(L(g)), v = L(_);
	k(_), k(g);
	var y = R(g, 2), b = R(L(y), 2);
	q(b, 17, () => n().profiles, Vr, (e, t, n) => {
		let r = /* @__PURE__ */ N(() => i.has(V(t).key.trim().toLowerCase()));
		var o = Bu();
		let l;
		var u = L(o);
		_i(u);
		var d = R(u, 2);
		_i(d);
		var f = R(d, 2);
		q(f, 21, () => c(V(t).agentName), Vr, (e, t) => {
			var n = Iu(), r = L(n, !0);
			k(n);
			var i = {};
			z(() => {
				G(r, V(t).label), i !== (i = V(t).id) && (n.value = (n.__value = V(t).id) ?? "");
			}), W(e, n);
		}), k(f);
		var p;
		ui(f);
		var m = R(f, 2), h = (e) => {
			W(e, Ru());
		}, g = (e) => {
			var t = zu();
			X(L(t), { name: "trash-2" }), k(t), H("click", t, () => s(n)), W(e, t);
		};
		K(m, (e) => {
			V(r) ? e(h) : e(g, -1);
		}), k(o), z(() => {
			l = J(o, 1, "settings-profile-row", null, l, { "settings-profile-system": V(r) }), vi(u, V(t).key), u.disabled = V(r), vi(d, V(t).description), d.disabled = V(r), p !== (p = V(t).agentName) && (f.value = (f.__value = V(t).agentName) ?? "", li(f, V(t).agentName));
		}), H("input", u, (e) => a(n, "key", e.currentTarget.value)), H("input", d, (e) => a(n, "description", e.currentTarget.value)), H("change", f, (e) => a(n, "agentName", e.currentTarget.value)), W(e, o);
	});
	var x = R(b, 2), S = L(x);
	_i(S);
	var C = R(S, 2);
	_i(C);
	var w = R(C, 2);
	q(w, 21, () => t.agents, Vr, (e, t) => {
		var n = Iu(), r = L(n, !0);
		k(n);
		var i = {};
		z(() => {
			G(r, V(t).label), i !== (i = V(t).id) && (n.value = (n.__value = V(t).id) ?? "");
		}), W(e, n);
	}), k(w);
	var T = R(w, 2);
	X(L(T), { name: "plus" }), A(), k(T), k(x), k(y), k(h);
	var E = R(h, 2), ee = L(E);
	let te;
	var D = L(ee, !0);
	k(ee);
	var ne = R(ee);
	X(L(ne), { name: "save" }), A(), k(ne), k(E), k(f), z((e) => {
		G(v, `${n().profiles.length ?? ""} routes`), w.disabled = !t.agents.length, T.disabled = !t.agents.length, te = J(ee, 1, "settings-save-hint", null, te, { visible: n().dirty }), G(D, n().dirty ? "Unsaved changes" : ""), ne.disabled = e;
	}, [() => !n().dirty || !!r()]), Ci(S, () => n().newProfile.key, (e) => n(n().newProfile.key = e, !0)), Ci(C, () => n().newProfile.description, (e) => n(n().newProfile.description = e, !0)), di(w, () => n().newProfile.agentName, (e) => n(n().newProfile.agentName = e, !0)), H("click", T, o), H("click", ne, d), W(e, f), M();
}
Cr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var Uu = /* @__PURE__ */ U("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), Wu = /* @__PURE__ */ U("<button type=\"button\"><!> <span> </span> <!></button>"), Gu = /* @__PURE__ */ U("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function Ku(e, t) {
	j(t, !0);
	let n = [
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
	var r = Gu();
	q(R(L(r), 2), 17, () => n, (e) => e.id, (e, n) => {
		var r = Wu();
		let i;
		var a = L(r);
		X(a, { get name() {
			return V(n).icon;
		} });
		var o = R(a, 2), s = L(o, !0);
		k(o);
		var c = R(o, 2), l = (e) => {
			W(e, Uu());
		};
		K(c, (e) => {
			V(n).sharesAgentDraft && e(l);
		}), k(r), z(() => {
			i = J(r, 1, "settings-tab", null, i, {
				active: t.activeTab === V(n).id,
				dirty: t.dirty && V(n).sharesAgentDraft
			}), Y(r, "aria-current", t.activeTab === V(n).id ? "page" : void 0), G(s, V(n).label);
		}), H("click", r, () => t.onSelect(V(n).id)), W(e, r);
	}), k(r), W(e, r), M();
}
Cr(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var qu = /* @__PURE__ */ U("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function Ju(e, t) {
	j(t, !0);
	let n = ki(t, "pending", 15);
	async function r(e) {
		if (e.preventDefault(), !n()) {
			n("user");
			try {
				t.onUserNameInput(await t.onSaveUser(t.userName));
			} catch (e) {
				t.onToast(yu(e));
			} finally {
				n("");
			}
		}
	}
	var i = qu(), a = R(L(i), 2), o = L(a), s = R(L(o), 2);
	_i(s), A(2), k(o);
	var c = R(o, 2), l = L(c);
	X(L(l), { name: "save" }), A(), k(l), k(c), k(a), k(i), z(() => {
		vi(s, t.userName), l.disabled = n() === "user";
	}), Sr("submit", a, r), H("input", s, (e) => t.onUserNameInput(e.currentTarget.value)), W(e, i), M();
}
Cr(["input"]);
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var Yu = /* @__PURE__ */ U("<span class=\"settings-pill\">Active</span>"), Xu = /* @__PURE__ */ U("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), Zu = /* @__PURE__ */ U("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Qu = /* @__PURE__ */ U("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), $u = /* @__PURE__ */ U("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), ed = /* @__PURE__ */ U("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function td(e, t) {
	j(t, !0);
	let n = ki(t, "draft", 15), r = ki(t, "pending", 15), i = /* @__PURE__ */ F("");
	async function a(e) {
		if (e.preventDefault(), !(!n().workspacePath.trim() || r())) {
			r("workspace");
			try {
				await t.onAddWorkspace(vu(n())), n(n().workspacePath = "", !0), n(n().createWorkspace = !1, !0);
			} catch (e) {
				t.onToast(yu(e));
			} finally {
				r("");
			}
		}
	}
	async function o(e) {
		if (!r()) {
			r(`remove:${e}`);
			try {
				await t.onRemoveWorkspace(e, vu(n()));
			} catch (e) {
				t.onToast(yu(e));
			} finally {
				r("");
			}
		}
	}
	async function s(e, a) {
		if (!r()) {
			r(`icon:${e}`), I(i, "");
			try {
				await t.onWorkspaceIcon(e, a, vu(n()));
			} catch (e) {
				t.onToast(yu(e));
			} finally {
				r("");
			}
		}
	}
	function c(e) {
		let n = t.workspaces.find((t) => t.id === e);
		return t.workspaceIcons.find((e) => e.id === (n?.icon || "")) || t.workspaceIcons[0];
	}
	var l = ed(), u = R(L(l), 2), d = L(u);
	_i(d);
	var f = R(d, 2), p = L(f);
	_i(p), A(2), k(f);
	var m = R(f, 2), h = L(m);
	X(h, { name: "plus" });
	var g = R(h), _ = L(g, !0);
	k(g), k(m), k(u);
	var v = R(u, 2);
	q(v, 21, () => t.workspaces, (e) => e.id, (e, n) => {
		let a = /* @__PURE__ */ N(() => c(V(n).id));
		var l = Qu(), u = L(l), d = L(u), f = L(d), p = L(f);
		k(f);
		var m = R(f, 2), h = L(m), g = L(h, !0);
		k(h);
		var _ = R(h), v = L(_, !0);
		k(_), k(m), k(d);
		var y = R(d, 2), b = L(y), x = (e) => {
			W(e, Yu());
		};
		K(b, (e) => {
			V(n).id === t.activeWorkspaceId && e(x);
		});
		var S = R(b, 2), C = L(S), w = R(C, 2), T = L(w, !0);
		k(w), X(R(w, 2), { name: "chevron-down" }), k(S);
		var E = R(S, 2);
		X(L(E), { name: "trash-2" }), k(E), k(y), k(u);
		var ee = R(u, 2), te = (e) => {
			var r = Zu();
			q(r, 21, () => t.workspaceIcons, (e) => e.id, (e, t) => {
				var r = Xu();
				let i;
				var o = L(r), c = R(o), l = L(c, !0);
				k(c);
				var u = R(c), d = (e) => {
					X(e, { name: "check" });
				};
				K(u, (e) => {
					V(t).id === V(a).id && e(d);
				}), k(r), z(() => {
					Y(r, "aria-checked", V(t).id === V(a).id), Y(r, "title", V(t).label), i = J(r, 1, "", null, i, { selected: V(t).id === V(a).id }), Y(o, "src", V(t).src), G(l, V(t).label);
				}), H("click", r, () => s(V(n).id, V(t).id)), W(e, r);
			}), k(r), z(() => Y(r, "aria-label", `Icon for ${V(n).name}`)), W(e, r);
		};
		K(ee, (e) => {
			V(i) === V(n).id && e(te);
		}), k(l), z((e, t) => {
			Y(p, "src", V(a).src), G(g, V(n).name), G(v, V(n).path), Y(S, "aria-expanded", V(i) === V(n).id), S.disabled = e, Y(C, "src", V(a).src), G(T, r() === `icon:${V(n).id}` ? "Saving..." : V(a).label), E.disabled = t;
		}, [() => !!r(), () => !!r()]), H("click", S, () => I(i, V(i) === V(n).id ? "" : V(n).id, !0)), H("click", E, () => o(V(n).id)), W(e, l);
	}, (e) => {
		W(e, $u());
	}), k(v), k(l), z((e) => {
		m.disabled = e, G(_, n().createWorkspace ? "Create" : "Add");
	}, [() => !!r()]), Sr("submit", u, a), Ci(d, () => n().workspacePath, (e) => n(n().workspacePath = e, !0)), wi(p, () => n().createWorkspace, (e) => n(n().createWorkspace = e, !0)), W(e, l), M();
}
Cr(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var nd = /* @__PURE__ */ U("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function rd(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(-1), a = /* @__PURE__ */ F(Qt(_u(V(n)))), o = /* @__PURE__ */ F(Qt(V(n).userName)), s = /* @__PURE__ */ F("");
	Ai(() => t.channel.subscribe((e) => {
		let t = V(n);
		if (I(n, e, !0), e.identity !== V(r)) I(r, e.identity, !0), I(i, e.dataVersion, !0), I(a, _u(e), !0), I(o, e.userName, !0), I(s, "");
		else if (e.dataVersion !== V(i) && !V(a).dirty) {
			let n = V(a).tab, r = V(o) !== t.userName;
			I(i, e.dataVersion, !0), I(a, _u(e), !0), V(a).tab = n, r ? V(a).userName = V(o) : I(o, e.userName, !0);
		}
		queueMicrotask(e.onIconsChanged);
	})), Ai(() => {
		let e = (e) => {
			V(n).open && e.key === "Escape" && (e.preventDefault(), V(n).onClose(V(a).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function c() {
		V(a).dirty = !0;
	}
	var l = Mr(), u = un(l), d = (e) => {
		var t = nd(), r = un(t), i = R(r, 2), l = L(i);
		Ku(l, {
			get activeTab() {
				return V(a).tab;
			},
			get dirty() {
				return V(a).dirty;
			},
			onSelect: (e) => V(a).tab = e
		});
		var u = R(l, 2), d = L(u);
		X(L(d), { name: "x" }), k(d);
		var f = R(d, 2), p = (e) => {
			td(e, {
				get workspaces() {
					return V(n).workspaces;
				},
				get activeWorkspaceId() {
					return V(n).activeWorkspaceId;
				},
				get workspaceIcons() {
					return V(n).workspaceIcons;
				},
				get onAddWorkspace() {
					return V(n).onAddWorkspace;
				},
				get onRemoveWorkspace() {
					return V(n).onRemoveWorkspace;
				},
				get onWorkspaceIcon() {
					return V(n).onWorkspaceIcon;
				},
				get onToast() {
					return V(n).onToast;
				},
				get draft() {
					return V(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return V(s);
				},
				set pending(e) {
					I(s, e, !0);
				}
			});
		}, m = (e) => {
			Ju(e, {
				get userName() {
					return V(o);
				},
				onUserNameInput: (e) => {
					I(o, e, !0), V(a).userName = e;
				},
				get onSaveUser() {
					return V(n).onSaveUser;
				},
				get onToast() {
					return V(n).onToast;
				},
				get pending() {
					return V(s);
				},
				set pending(e) {
					I(s, e, !0);
				}
			});
		}, h = (e) => {
			Mu(e, {
				get appearance() {
					return V(n).appearance;
				},
				get onLayoutPreference() {
					return V(n).onLayoutPreference;
				},
				get onFontScale() {
					return V(n).onFontScale;
				},
				get onResetFontScales() {
					return V(n).onResetFontScales;
				}
			});
		}, g = (e) => {
			wu(e, {
				get agentHub() {
					return V(n).agentHub;
				},
				onDirty: c,
				get onSaveAgentHub() {
					return V(n).onSaveAgentHub;
				},
				get onToast() {
					return V(n).onToast;
				},
				get draft() {
					return V(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return V(s);
				},
				set pending(e) {
					I(s, e, !0);
				}
			});
		}, _ = (e) => {
			Hu(e, {
				get agents() {
					return V(n).agents;
				},
				onDirty: c,
				get onSaveAgentHub() {
					return V(n).onSaveAgentHub;
				},
				get onToast() {
					return V(n).onToast;
				},
				get draft() {
					return V(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return V(s);
				},
				set pending(e) {
					I(s, e, !0);
				}
			});
		}, v = (e) => {
			Fu(e, {
				get notifications() {
					return V(n).notifications;
				},
				get onBrowserNotifications() {
					return V(n).onBrowserNotifications;
				},
				get onCompletionSound() {
					return V(n).onCompletionSound;
				}
			});
		};
		K(f, (e) => {
			V(a).tab === "workspace" ? e(p) : V(a).tab === "user" ? e(m, 1) : V(a).tab === "appearance" ? e(h, 2) : V(a).tab === "agenthub" ? e(g, 3) : V(a).tab === "profiles" ? e(_, 4) : e(v, -1);
		}), k(u), k(i), H("click", r, () => V(n).onClose(V(a).dirty)), H("click", d, () => V(n).onClose(V(a).dirty)), W(e, t);
	};
	K(u, (e) => {
		V(n).open && e(d);
	}), W(e, l), M();
}
Cr(["click"]);
//#endregion
//#region src/components/Toast.svelte
var id = /* @__PURE__ */ U("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function ad(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(!1), i = null;
	Ai(() => {
		let e = t.channel.subscribe((e) => {
			I(n, e, !0), I(r, !!e.message, !0), i !== null && window.clearTimeout(i), V(r) && (i = window.setTimeout(() => {
				I(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = id(), o = L(a, !0);
	k(a), z(() => {
		Y(a, "hidden", !V(r)), G(o, V(n).message);
	}), W(e, a), M();
}
//#endregion
//#region src/components/UploadDialog.svelte
var od = /* @__PURE__ */ U("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), sd = /* @__PURE__ */ U("<small class=\"upload-result-path\"> </small>"), cd = /* @__PURE__ */ U("<small class=\"upload-error\"> </small>"), ld = /* @__PURE__ */ U("<div><div class=\"upload-item-heading\"><span class=\"upload-item-status-icon\"><span class=\"upload-item-status upload-item-status-queued\"><!></span><span class=\"upload-item-status upload-item-status-uploading\"><!></span><span class=\"upload-item-status upload-item-status-success\"><!></span><span class=\"upload-item-status upload-item-status-error\"><!></span></span><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), ud = /* @__PURE__ */ U("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this resource's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function dd(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(Qt([])), a = 1, o = /* @__PURE__ */ F(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ N(() => V(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ N(() => V(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ N(() => V(i).filter((e) => e.status === "error").length);
	Ai(() => {
		let e = t.channel.subscribe((e) => {
			I(n, e, !0), e.identity !== V(r) && (d(), I(r, e.identity, !0), I(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			if (!V(n).open) return;
			let t = f(e.clipboardData);
			t.length && (e.preventDefault(), m(t));
		};
		document.addEventListener("paste", o);
		let s = (e) => {
			V(n).open && e.key === "Escape" && !V(c) && (e.preventDefault(), _());
		};
		return document.addEventListener("keydown", s), () => {
			e(), document.removeEventListener("paste", o), document.removeEventListener("keydown", s), d();
		};
	});
	function d() {
		for (let e of s.values()) e.abort();
		s.clear();
	}
	function f(e) {
		let t = Array.from(e?.items || []).filter((e) => e.kind === "file").map((e) => e.getAsFile()).filter((e) => !!e);
		return t.length ? t : Array.from(e?.files || []);
	}
	function p(e, t) {
		return `clipboard-${Date.now()}-${t + 1}.${{
			"image/png": "png",
			"image/jpeg": "jpg",
			"image/gif": "gif",
			"image/webp": "webp",
			"application/pdf": "pdf"
		}[e.type] || "bin"}`;
	}
	function m(e) {
		let t = Array.from(e || []);
		if (!V(n).open || !t.length) return;
		let r = t.map((e, t) => ({
			id: a++,
			file: e,
			name: e.name || p(e, t),
			size: e.size || 0,
			progress: 0,
			status: "queued",
			path: "",
			error: ""
		}));
		I(i, [...V(i), ...r], !0);
		for (let e of r) g(e, V(n).identity, V(n).workspaceId, V(n).resourceId);
	}
	function h(e, t) {
		I(i, V(i).map((n) => n.id === e ? {
			...n,
			...t
		} : n), !0);
	}
	function g(e, t, r, i) {
		h(e.id, { status: "uploading" });
		let a = new XMLHttpRequest();
		s.set(e.id, a), a.open("POST", `/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/uploads`), a.responseType = "json", a.upload.addEventListener("progress", (r) => {
			V(n).identity !== t || !r.lengthComputable || h(e.id, { progress: Math.min(99, Math.round(r.loaded / r.total * 100)) });
		}), a.addEventListener("load", () => {
			if (s.delete(e.id), V(n).identity !== t || V(n).workspaceId !== r || V(n).resourceId !== i) return;
			let o = a.response || {};
			a.status >= 200 && a.status < 300 ? h(e.id, {
				status: "success",
				progress: 100,
				path: o.path || "",
				name: o.name || e.name
			}) : h(e.id, {
				status: "error",
				error: o.error || `${a.status} ${a.statusText}`
			});
		}), a.addEventListener("error", () => {
			s.delete(e.id), V(n).identity === t && h(e.id, {
				status: "error",
				error: "Network error while uploading."
			});
		});
		let o = new FormData();
		o.append("file", e.file, e.name), a.send(o);
	}
	function _() {
		V(c) || V(n).onDone(V(i).filter((e) => e.status === "success" && e.path).map((e) => e.path), {
			workspaceId: V(n).workspaceId,
			resourceId: V(n).resourceId
		});
	}
	function v(e) {
		return e < 1024 ? `${e} B` : e < 1048576 ? `${(e / 1024).toFixed(1)} KB` : `${(e / 1024 / 1024).toFixed(1)} MB`;
	}
	function y(e) {
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
	var b = Mr(), x = un(b), S = (e) => {
		var t = ud(), n = L(t), r = R(n, 2), a = L(r), s = R(L(a), 2);
		X(L(s), { name: "x" }), k(s), k(a);
		var d = R(a, 2), f = L(d);
		Oi(f, (e) => I(o, e), () => V(o));
		var p = R(f, 2), h = L(p);
		X(h, { name: "clipboard-paste" });
		var g = R(h, 4);
		X(L(g), { name: "folder-open" }), A(), k(g), k(p);
		var b = R(p, 2), x = L(b), S = (e) => {
			W(e, od());
		};
		K(x, (e) => {
			V(i).length || e(S);
		}), q(R(x, 2), 17, () => V(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ N(() => y(V(t)));
			var r = ld();
			let i;
			var a = L(r), o = L(a), s = L(o);
			X(L(s), { name: "clock-3" }), k(s);
			var c = R(s);
			X(L(c), { name: "loader-circle" }), k(c);
			var l = R(c);
			X(L(l), { name: "circle-check" }), k(l);
			var u = R(l);
			X(L(u), { name: "triangle-alert" }), k(u), k(o);
			var d = R(o), f = L(d), p = L(f, !0);
			k(f);
			var m = R(f), h = L(m, !0);
			k(m), k(d);
			var g = R(d), _ = L(g, !0);
			k(g), k(a);
			var b = R(a, 2), x = L(b);
			let S;
			k(b);
			var C = R(b, 2), w = (e) => {
				var n = sd(), r = L(n, !0);
				k(n), z(() => G(r, V(t).path)), W(e, n);
			};
			K(C, (e) => {
				V(t).status === "success" && e(w);
			});
			var T = R(C, 2), E = (e) => {
				var n = cd(), r = L(n, !0);
				k(n), z(() => G(r, V(t).error || "Upload failed")), W(e, n);
			};
			K(T, (e) => {
				V(t).status === "error" && e(E);
			}), k(r), z((e) => {
				i = J(r, 1, "upload-item", null, i, {
					"upload-item-success": V(t).status === "success",
					"upload-item-error": V(t).status === "error",
					"upload-item-uploading": V(t).status === "uploading"
				}), G(p, V(t).name), G(h, e), G(_, V(n).label), Y(b, "aria-label", V(t).name), Y(b, "aria-valuenow", V(t).progress), S = ci(x, "", S, { width: `${V(t).progress}%` });
			}, [() => v(V(t).size)]), W(e, r);
		}), k(b), k(d);
		var C = R(d, 2), w = L(C), T = L(w, !0);
		k(w);
		var E = R(w, 2);
		k(C), k(r), k(t), z(() => {
			s.disabled = V(c), G(T, V(c) ? "Wait for uploads to finish before closing." : V(i).length ? `${V(l)} uploaded${V(u) ? ` · ${V(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), E.disabled = V(c);
		}), H("click", n, _), H("click", s, _), H("change", f, () => V(o).files && m(V(o).files)), Sr("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), Sr("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), Sr("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), H("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), V(o).click());
		}), H("click", g, () => V(o).click()), H("click", E, _), W(e, t);
	};
	K(x, (e) => {
		V(n).open && e(S);
	}), W(e, b), M();
}
Cr([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var fd = /* @__PURE__ */ U("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div>", 1);
function pd(e, t) {
	j(t, !0);
	var n = fd(), r = un(n);
	ca(r, {
		get channel() {
			return t.channels.appShell;
		},
		details: (e) => {
			Xl(e, { get channel() {
				return t.channels.detail;
			} });
		},
		timeline: (e) => {
			gu(e, { get channel() {
				return t.channels.timeline;
			} });
		},
		composer: (e) => {
			Oa(e, { get channel() {
				return t.channels.composer;
			} });
		},
		agentHeader: (e) => {
			pa(e, { get channel() {
				return t.channels.agentHeader;
			} });
		},
		$$slots: {
			details: !0,
			timeline: !0,
			composer: !0,
			agentHeader: !0
		}
	});
	var i = R(r, 2);
	ad(L(i), { get channel() {
		return t.channels.toast;
	} }), k(i);
	var a = R(i, 2);
	dd(L(a), { get channel() {
		return t.channels.upload;
	} }), k(a);
	var o = R(a, 2);
	go(L(o), { get channel() {
		return t.channels.create;
	} }), k(o);
	var s = R(o, 2);
	rd(L(s), { get channel() {
		return t.channels.settings;
	} }), k(s), W(e, n), M();
}
//#endregion
//#region src/components/model-channel.ts
function md(e) {
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
var Q = () => void 0, hd = async () => void 0;
function gd() {
	return {
		appShell: md({
			identity: "",
			loading: !0,
			error: "",
			version: "v0.1.0",
			activeWorkspaceId: "",
			workspaces: [],
			projects: [],
			attentionList: [],
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
			onSwitchWorkspace: hd,
			onAddWorkspace: Q,
			onCreateProject: Q,
			onOpenSettings: Q,
			onToggleProject: hd,
			onSelectResource: hd,
			onReorder: hd,
			onDragState: Q,
			onToggleAttention: hd,
			onDismissAttention: hd,
			onPanePreview: Q,
			onPaneCommit: Q,
			onPaneViewport: Q,
			onMobileSidebar: Q,
			onMobileView: Q,
			onMobileImmersive: Q,
			onToast: Q,
			onIconsChanged: Q,
			onHistoryNavigation: hd
		}),
		create: md({
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
			onClose: Q,
			onPreview: hd,
			onSubmit: hd,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: () => !0,
			onIconsChanged: Q
		}),
		settings: md({
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
					workspace: "default",
					project: "default",
					task: "default"
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
			onClose: Q,
			onAddWorkspace: hd,
			onRemoveWorkspace: hd,
			onWorkspaceIcon: hd,
			onSaveUser: async (e) => e,
			onSaveAgentHub: hd,
			onLayoutPreference: Q,
			onFontScale: Q,
			onResetFontScales: Q,
			onBrowserNotifications: Q,
			onCompletionSound: Q,
			onToast: Q,
			onIconsChanged: Q
		}),
		upload: md({
			open: !1,
			identity: "",
			workspaceId: "",
			resourceId: "",
			onDone: Q,
			onIconsChanged: Q
		}),
		composer: md({
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
			onDraft: Q,
			onSend: async () => ({
				accepted: !1,
				clear: !1
			}),
			onOpenUpload: Q,
			onEndTurn: Q,
			onDismissStopNotice: Q,
			onSteerWaiting: hd,
			onSaveAgentBinding: hd,
			onIconsChanged: Q
		}),
		detail: md({
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
			onNavigate: Q,
			onCreateTask: Q,
			onArchive: Q,
			onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
			onSaveAgentBinding: hd,
			onToast: Q,
			onIconsChanged: Q
		}),
		timeline: md({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			agentName: "Agent",
			resolveResourceTitle: () => null,
			onNavigate: Q,
			project: () => [],
			onEvent: Q,
			onNotice: Q,
			onApproval: hd,
			onToast: Q,
			onIconsChanged: Q
		}),
		agentHeader: md({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			submitting: !1,
			agentName: "Agent",
			modelSummary: "",
			turnNumber: 0,
			turnStartedAt: "",
			onIconsChanged: Q
		}),
		toast: md({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var _d = "forge.gui.agentDraft.v2", vd = 2, yd = 50, bd = 7776e6;
function xd(e) {
	return encodeURIComponent(String(e || "").trim());
}
function Sd(e) {
	return String(e || "").trim() || "workspace";
}
function Cd(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? yd, r = e.maxAgeMs ?? bd;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function a(e, t) {
		let n = String(e || "").trim(), r = Sd(t);
		return !n || !r ? "" : `${_d}.resource.${xd(n)}.${xd(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== vd || typeof t.text != "string" ? null : {
				version: vd,
				text: t.text,
				updatedAt: Number(t.updatedAt) || 0,
				workspaceId: String(t.workspaceId || ""),
				resourceId: Sd(t.resourceId),
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
				version: vd,
				text: n,
				updatedAt: t(),
				workspaceId: r.workspaceId,
				resourceId: Sd(r.resourceId),
				generationId: String(r.generationId || "") || void 0
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = Sd(a);
		if (!c || !u) return;
		let f = `${_d}.resource.${xd(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || Sd(n.resourceId) !== d || o.has(t))) {
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
function wd(e) {
	let t = Cd(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForResource(r, Sd(n));
	}
	function i(e, t) {
		let r = /* @__PURE__ */ new Set();
		return n.ttyDraftWorkspaceId === e && n.ttyDraftResourceId === t && n.ttyDraftKey && r.add(n.ttyDraftKey), r;
	}
	function a(r = e.workspaceId(), a = n.ttyDraftResourceId) {
		let o = r.trim(), s = Sd(a);
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
		let l = Sd(i), u = r(l, o);
		if (!u) return c();
		n.ttyDraftKey !== u && (n.ttyDraftKey = u, n.ttyDraftWorkspaceId = o.trim(), n.ttyDraftResourceId = l, n.ttyDraft = t.read(u), n.ttyMultiline = n.ttyDraft.includes("\n"), n.ttyDraftVersion++, a(n.ttyDraftWorkspaceId, n.ttyDraftResourceId));
	}
	function u(r) {
		return e.workspaceId() !== r.workspaceId || n.ttyDraftResourceId !== Sd(r.resourceId) || n.ttyDraftKey !== r.key || n.ttyDraft !== r.text || n.ttyDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
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
function Td(e) {
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
function Ed(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function Dd(e) {
	let t = String(e?.id || "").trim();
	if (!t) throw Error("The created resource did not return an id.");
	return t;
}
function Od(e) {
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
function kd(e) {
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
function Ad(e) {
	let t = 0, n = Od(t), r = 0, i = null, a = "";
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
			previewRequestKey: (e) => JSON.stringify(kd({
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
			...Od(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = Od(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = kd({
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
			n.previewError = Ed(e);
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
			if (n.type === "project") r = Dd(await e.request(`/api/workspaces/${i}/projects`, {
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
					t = kd(n);
				}
				r = Dd(await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				})), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1;
			let s = ++t;
			n.identity = s, await e.reloadTree(), i === e.workspaceId() && n.identity === s && await e.selectResource(r);
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(Ed(t)));
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
//#region src/controllers/notification-delivery.ts
function jd() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function Md(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.generationId}`;
}
function Nd(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function Pd(e) {
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
		if (!(!e.settings().browser || jd() !== "granted")) try {
			let n = new window.Notification(Md(t), {
				body: Nd(t),
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
		n.browser && jd() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = jd();
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
			permission: jd(),
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
var Fd = "forge.gui.notifications.v1", Id = `${Fd}.settings`;
function Ld(e) {
	return e && typeof e == "object" ? e : null;
}
function Rd(e) {
	let t = Ld(e);
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
function zd() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function Bd(e) {
	let t = Ld(e);
	if (!t || t.version !== 1) return zd();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = Ld(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(Rd).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(Rd).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = Ld(e);
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
function Vd(e) {
	let t = e.trim();
	return t ? `${Fd}.state.${encodeURIComponent(t)}` : "";
}
function Hd(e) {
	function t(t) {
		let n = Vd(t);
		if (!e || !n) return zd();
		try {
			let t = e.getItem(n);
			if (!t) return zd();
			let r = Bd(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return zd();
		}
	}
	function n(t, n) {
		let r = Bd(n), i = Vd(t);
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
			let t = Ld(JSON.parse(e.getItem(Id) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(Id);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(Id, JSON.stringify({
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
function Ud(e) {
	let t = String(e.completionMarker || "").trim();
	if (t) return t;
	let n = String(e.generationId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function Wd(e) {
	return String(e.generationId || e.id || "").trim();
}
function Gd(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function Kd(e, t) {
	let n = String(e.resourceId || "").trim(), r = t.findResource(n), i = Wd(e);
	return !n || !i ? null : Rd({
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
function qd(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function Jd(e) {
	let t = Hd(qd(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= zd(), n.store;
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
	let g = Pd({
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
			let r = new t(`${Fd}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), jd() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
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
			let n = Rd(t.record);
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
		let a = Ud(t);
		if (!a || !n.workspaceId) return !1;
		let s = Kd(t, {
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
		for (let t of e) Ud(t) && x(t, t.completionState || "");
	}
	function C(e, t) {
		let n = Gd(e);
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
	function ee() {
		e.scope.listen(window, "storage", (r) => {
			r.key === Vd(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.refreshIcons()), r.key === Id && (n.settings = t.readSettings(), jd() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
		}), e.scope.listen(document, "visibilitychange", () => {
			e.flushDraft(), c() && E(e.selectedResourceId());
		}), e.scope.listen(window, "focus", () => E(e.selectedResourceId()));
	}
	function te() {
		return i(), g.preferences();
	}
	function D() {
		_(), g.dispose();
	}
	return {
		initialize: y,
		install: ee,
		dispose: D,
		establishBaseline: w,
		observeProjections: S,
		observeEvent: C,
		clearResource: E,
		preferences: te,
		setBrowserEnabled: g.setBrowserEnabled,
		setSoundEnabled: g.setSoundEnabled
	};
}
//#endregion
//#region src/controllers/pane-layout-controller.ts
var Yd = "forge.gui.paneSizes", Xd = "forge.gui.mobileImmersive", Zd = "forge.gui.layoutPreference", Qd = "forge.gui.fontScales", $d = 8, ef = 220, tf = 360, nf = 320, rf = 1e4, af = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarAttentionHeight: 210
}), of = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarAttentionHeight: "--sidebar-attention-height"
});
function sf(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function cf(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var lf = [
	"auto",
	"three",
	"two",
	"split"
];
function uf(e) {
	return lf.includes(e) ? e : "auto";
}
var df = .8, ff = 1.4, pf = 1, mf = [
	"sidebar",
	"details",
	"chat"
], hf = Object.freeze({
	sidebar: "--sidebar-font-scale",
	details: "--details-font-scale",
	chat: "--chat-font-scale"
});
function gf(e) {
	return cf(e) ? Math.round(sf(e, df, ff) * 100) / 100 : pf;
}
function _f(e) {
	let t = e && typeof e == "object" ? e : {};
	return {
		sidebar: gf(t.sidebar),
		details: gf(t.details),
		chat: gf(t.chat)
	};
}
function vf(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...af };
	if (cf(n.sidebarWidth) && (r.sidebarWidth = sf(n.sidebarWidth, ef, rf)), cf(n.chatWidth)) r.chatWidth = sf(n.chatWidth, nf, rf);
	else if (cf(n.detailsWidth) && t >= 688) {
		let e = sf(n.detailsWidth, tf, t - $d - nf);
		r.chatWidth = sf(t - $d - e, nf, rf);
	}
	let i = cf(n.sidebarAttentionHeight) ? n.sidebarAttentionHeight : n.sidebarSessionHeight;
	return cf(i) && (r.sidebarAttentionHeight = sf(i, 84, rf)), r;
}
function yf(e, t = window.localStorage) {
	let n = { ...af }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = _f(null), o = window.matchMedia("(max-width: 980px)"), s = window.matchMedia("(max-width: 1440px)");
	function c() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Yd) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function l() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Qd) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function u(e) {
		document.documentElement.style.setProperty(hf[e], String(a[e]));
	}
	function d() {
		for (let e of mf) u(e);
	}
	function f() {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}
	function p(e, t) {
		document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
	}
	function m(e, t) {
		if (!Object.hasOwn(of, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(sf(t, r === "sidebarWidth" ? ef : r === "chatWidth" ? nf : 84, rf));
		n[r] = i, p(of[r], i);
	}
	function h() {
		for (let e of Object.keys(of)) m(e, n[e]);
	}
	function g() {
		t?.setItem(Yd, JSON.stringify(n));
	}
	function _() {
		let u = c();
		n = vf(u, 0), h();
		let p = cf(u.sidebarSessionHeight) && !cf(u.sidebarAttentionHeight);
		cf(u.detailsWidth) && !cf(u.chatWidth) && !o.matches && (n = vf(u, f()), h(), p = !0), p && g();
		try {
			r.immersive = t?.getItem(Xd) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = uf(t?.getItem(Zd));
		} catch {
			i = "auto";
		}
		x(), a = _f(l()), d();
		let m = () => {
			x(), e();
		};
		o.addEventListener?.("change", m), s.addEventListener?.("change", m);
	}
	function v(e) {
		if (!Object.hasOwn(of, e) || !t) return;
		let r = e, i = c();
		delete i.detailsWidth, delete i.sidebarSessionHeight;
		for (let e of Object.keys(of)) cf(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(Yd, JSON.stringify(i));
	}
	function y() {
		if (o.matches) return;
		let e = c();
		!cf(e.detailsWidth) || cf(e.chatWidth) || (n = vf(e, f()), h(), g());
	}
	function b() {
		return o.matches ? "single" : i === "auto" ? s.matches ? "two" : "three" : i;
	}
	function x() {
		document.body.dataset.layout = b();
	}
	function S(n) {
		i = uf(n);
		try {
			t?.setItem(Zd, i);
		} catch {}
		x(), e();
	}
	function C(n, r) {
		if (Object.hasOwn(hf, n)) {
			a[n] = gf(r), u(n);
			try {
				t?.setItem(Qd, JSON.stringify(a));
			} catch {}
			e();
		}
	}
	function w() {
		a = _f(null), d();
		try {
			t?.removeItem(Qd);
		} catch {}
		e();
	}
	function T(t) {
		r.sidebarOpen = !!t, document.body.classList.toggle("mobile-sidebar-open", r.sidebarOpen), e();
	}
	function E(t) {
		r.view = t === "chat" ? "chat" : "details", document.body.classList.toggle("mobile-chat-active", r.view === "chat"), e();
	}
	function ee(n) {
		r.immersive = !!n, document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			t?.setItem(Xd, r.immersive ? "1" : "0");
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
		setMobileImmersive: ee,
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
function bf(e) {
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
function xf(e, t) {
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
function Sf(e) {
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
					workspace: o.config?.resourceDefaults?.workspace || "default",
					project: o.config?.resourceDefaults?.project || "default",
					task: o.config?.resourceDefaults?.task || "default"
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
				resourceDefaults: n.data?.agentHub?.config?.resourceDefaults || {
					workspace: "default",
					project: "default",
					task: "default"
				}
			})
		}), await o(), e.setConfig(xf(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: xf
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var Cf = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering",
	"stopping"
]), wf = 6e4;
function Tf(e) {
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
		if (Number.isFinite(n)) return t() - n <= wf;
		if (!Cf.has(e.status || "")) return !1;
		let r = new Date(e.updatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= wf;
	}
	function s(e) {
		if (!e?.status || e.status === "archived" || ["stopped", "idle-suspended"].includes(e.status) && e.resumable !== !0) return null;
		let t = o(e);
		switch (e.status) {
			case "starting": return {
				kind: "resource-starting",
				className: "task-status-session-running",
				iconName: "loader-circle",
				label: "Resource starting",
				dimension: "resource",
				recentOutput: t
			};
			case "running": return {
				kind: "resource-running",
				className: "task-status-session-running",
				iconName: "loader-circle",
				label: "Resource working",
				dimension: "resource",
				recentOutput: t
			};
			case "waiting_approval": return {
				kind: "resource-approval",
				className: "task-status-attention",
				iconName: "shield-question",
				label: "Resource waiting for approval",
				dimension: "resource",
				recentOutput: t
			};
			case "stopping": return {
				kind: "resource-stopping",
				className: "task-status-session-stopping",
				iconName: "loader-circle",
				label: "Resource stopping",
				dimension: "resource",
				recentOutput: t
			};
			case "recovering": return {
				kind: "resource-recovering",
				className: "task-status-attention",
				iconName: "rotate-ccw",
				label: "Resource recovering",
				dimension: "resource",
				recentOutput: t
			};
			case "idle": return {
				kind: "resource-idle",
				className: "task-status-info",
				iconName: "message-square",
				label: "Resource ready",
				dimension: "resource",
				recentOutput: t
			};
			case "idle-suspended":
			case "stopped": return {
				kind: "resource-suspended",
				className: "task-status-info",
				iconName: "pause-circle",
				label: "Resource sleeping",
				dimension: "resource",
				recentOutput: t
			};
			default: return {
				kind: "resource-active",
				className: "task-status-neutral",
				iconName: "circle-dot",
				label: `Resource ${e.status}`,
				dimension: "resource",
				recentOutput: t
			};
		}
	}
	function c(e, t, n, r, i, a) {
		return {
			kind: e,
			className: t,
			iconName: n,
			label: r,
			dimension: i,
			recentOutput: !!(a && o(a))
		};
	}
	function l(e) {
		let t = e.filter((e) => !!e), n = t.length > 0;
		return {
			statuses: t,
			hasTaskState: n,
			className: t.map((e) => e.className).filter(Boolean).join(" "),
			layoutClassName: n ? t.length > 1 ? "has-task-status-dual" : "has-task-status" : "",
			slotClassName: [t.length === 1 ? "task-status-single" : "", t.length > 1 ? "task-status-dual" : ""].filter(Boolean).join(" ")
		};
	}
	function u(e) {
		let t = s(e.runtime), n = t?.label || "", r = l(e.type === "task" && ["resource-idle", "resource-suspended"].includes(t?.kind || "") ? [] : [t]);
		return {
			session: t,
			statusPresentation: r,
			className: r.className,
			label: n
		};
	}
	function d() {
		return {
			session: null,
			className: "",
			label: "",
			statusPresentation: l([])
		};
	}
	function f(e) {
		let t = (e.children || []).filter((e) => e.archived !== !0), n = t.filter((e) => Cf.has(e.runtime?.status || "")).length, r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n} working`;
		return {
			taskCount: t.length,
			runningCount: n,
			taskLabel: r,
			runningLabel: i,
			text: `${r} · ${i}`,
			ariaLabel: `Open tasks: ${r}; ${i}`
		};
	}
	function p(e) {
		return e ? `${e.kind}:${e.iconName}:${e.recentOutput}` : "none";
	}
	function m() {
		let t = e.tree();
		if (!t) return "";
		let n = [];
		if (t.scheduler) {
			let e = u(t.scheduler);
			n.push(`scheduler:resource=${p(e.session)}:${e.label}`);
		}
		for (let e of t.projects) {
			let t = u(e), r = f(e);
			n.push(`${e.id}:resource=${p(t.session)}:${t.label}:tasks=${r.taskCount}:${r.runningCount}`);
			for (let t of e.children || []) {
				let e = u(t);
				n.push(`${t.id}:resource=${p(e.session)}:${e.label}`);
			}
		}
		return n.join("|");
	}
	function h(t, n, r) {
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
		archiveRedirectTarget: h,
		moveIdInList: a,
		noTaskOperationalState: d,
		operationalStatusPresentation: l,
		projectTaskSummary: f,
		resourceRefText: n,
		resourceStatusState: s,
		statusModel: r,
		taskOperationalState: u,
		taskOperationalStateKey: m,
		taskStatusState: c
	};
}
//#endregion
//#region src/controllers/user-settings-controller.ts
var Ef = "forge.gui.user.v1", Df = 1, Of = 80;
function kf(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, Of).join("") || "User";
}
function Af(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Df ? "User" : kf(t.name);
	} catch {
		return "User";
	}
}
function jf(e, t) {
	let n = r();
	function r() {
		try {
			return Af(window.localStorage.getItem(Ef));
		} catch {
			return "User";
		}
	}
	function i(e) {
		let t = kf(e);
		try {
			window.localStorage.setItem(Ef, JSON.stringify({
				version: Df,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return n = t, n;
	}
	return e.listen(window, "storage", (e) => {
		e.key === Ef && (n = Af(e.newValue), t());
	}), {
		current: () => n,
		save: i
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var Mf = class {
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
}, Nf, Pf = null, $ = {
	config: null,
	tree: null,
	details: {},
	workspaceAgents: null,
	workspaceAgentsDraft: "",
	workspaceAgentsDirty: !1,
	workspaceAgentsSaving: !1,
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
	preview: null,
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
	previewRequestVersion: 0,
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
function Ff() {
	for (let e of Object.keys($.details)) delete $.details[e];
}
var If = wd({
	runtime: $.agent,
	workspaceId: () => $.activeWorkspaceId
}), Lf = If.clearResourceAfterAccepted, Rf = If.clearMemory, zf = If.flush, Bf = If.restoreResource, Vf = If.update, Hf = Td(() => {
	gh && (vm(), oh());
}), Uf = yf(() => Vp()), Wf = Mo(() => Vp()), Gf = bf({
	details: $.details,
	context: () => ({
		workspaceId: $.activeWorkspaceId,
		navigationVersion: $.navigationVersion,
		selectedId: $.selectedId,
		detailRequestVersion: $.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++$.detailRequestVersion,
	isCurrentWorkspace: (e, t) => Np(e, t),
	request: (e, t) => yp(e, t)
}), Kf = Ad({
	workspaceId: () => $.activeWorkspaceId,
	templates: (e) => $.details[e]?.templates || [],
	request: (e, t) => yp(e, t),
	publish: (e) => Nf.renderCreateDialog(e),
	toast: ah,
	reloadTree: () => xp(),
	selectResource: (e) => Wp(e),
	onOpen: () => {
		$.modalEnter = "create";
	},
	onIconsChanged: oh,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
}), qf = (e) => document.getElementById(e), Jf = 5e3, Yf = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, Xf = [
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
], Zf = new Map(Xf.map((e) => [e.id, e])), { applyCustomOrder: Qf, archiveRedirectTarget: $f, moveIdInList: ep, projectTaskSummary: tp, resourceRefText: np, statusModel: rp, taskOperationalState: ip, taskOperationalStateKey: ap } = Tf({
	tree: () => $.tree,
	findResource: (e) => Bm(e),
	agentName: (e) => ($.config?.agents || []).find((t) => t.id === e)?.name || e || "Forge GUI"
}), op = 0, sp = Sf({
	config: () => $.config || {
		workspaces: [],
		agents: [],
		agentProfiles: []
	},
	setConfig: (e) => {
		$.config = e;
	},
	activeWorkspaceId: () => $.activeWorkspaceId,
	setActiveWorkspaceId: (e) => {
		$.activeWorkspaceId = e;
	},
	selectWorkspaceResource: () => {
		$.selectedId = "workspace";
	},
	request: (e, t) => yp(e, t),
	publish: (e) => Nf.renderSettings(e),
	agentOptions: cp,
	workspaceIcons: [Yf, ...Xf],
	userName: vp,
	saveUser: (e) => {
		if (!dp) throw Error("User settings are unavailable.");
		return dp.save(e);
	},
	appearance: () => {
		let e = Uf.snapshot();
		return {
			layout: e.layout.preference,
			fontScales: e.fontScales
		};
	},
	setLayoutPreference: (e) => Uf.setLayoutPreference(e),
	setFontScale: (e, t) => Uf.setFontScale(e, t),
	resetFontScales: () => Uf.resetFontScales(),
	notificationPreferences: () => up?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => up?.setBrowserEnabled(e),
	setCompletionSound: (e) => up?.setSoundEnabled(e),
	flushDraft: zf,
	resetAgentState: fm,
	reloadWorkspaceContext: async () => {
		await Dp(), await xp();
	},
	clearWorkspaceContext: () => {
		$.tree = null, Ff(), jp();
	},
	renderWorkspace: Lp,
	renderAgentViews: () => {
		Xm(), xm();
	},
	toast: ah,
	onIconsChanged: oh
});
function cp() {
	return Qm().map((e) => ({
		id: e.id || "",
		label: Sm(e),
		summary: hm(e)
	}));
}
function lp() {
	Vp(), Jp(), Rm(), km(), xm(), vm(), Cm();
}
var up = null, dp = null;
function fp(e) {
	up?.initialize(e);
}
function pp() {
	up?.establishBaseline();
}
function mp(e = $.tree) {
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
function hp(e) {
	up?.observeProjections(e);
}
function gp(e, t) {
	t && up?.observeEvent(e, t);
}
function _p(e) {
	up?.clearResource(e);
}
function vp() {
	return dp?.current() || "User";
}
async function yp(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		throw new _o(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function bp() {
	let e = Km(), [t, n] = await Promise.all([yp("/api/workspaces"), yp("/api/settings/agenthub")]);
	$.config = nh(t, n), Xm(), $.activeWorkspaceId = qm(e.workspaceId) ? e.workspaceId || "" : $.config?.activeId || $.config?.workspaces[0]?.id || "", $.selectedId = e.resourceId || "workspace", Lp(), $.activeWorkspaceId ? (fp($.activeWorkspaceId), await Dp(), !e.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await xp({ replaceURL: !0 })) : ($.navigationLoading = !1, $.tree = null, Ff(), $.workspaceAgents = null, $.preview = null, $.diff = null, fm(), jp());
}
async function xp(e = {}) {
	if (!$.activeWorkspaceId) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.treeRequestVersion;
	$.navigationLoading = !0, $.navigationError = "", Vp(), $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let i;
	try {
		i = await yp(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw Np(t, n, r) && ($.navigationLoading = !1, $.navigationError = Ed(e), Vp()), e;
	}
	Np(t, n, r) && ($.tree = i, Ff(), $.workspaceAgents = null, $.workspaceAgentsSaving = !1, $.preview = null, $.diff = null, Hm(), Gm(!1), $.selectedId === "workspace" ? await Ep() : $.selectedId && await Sp($.selectedId), Np(t, n, r) && (await cm(t, Nm()), Np(t, n, r) && (pp(), $.navigationLoading = !1, $.navigationError = "", jp(), e.updateURL !== !1 && Jm({ replace: !!e.replaceURL }))));
}
async function Sp(e, t = {}) {
	return Gf.load(e, t);
}
function Cp(e, t = $.activeWorkspaceId, n = {}) {
	return Gf.fetch(e, t);
}
function wp(e) {
	return Gf.snapshot(e);
}
function Tp(e) {
	return Gf.apply(e);
}
async function Ep(e = {}) {
	if (!$.activeWorkspaceId || $.workspaceAgents && !e.force) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.workspaceAgentsRequestVersion;
	try {
		let e = await yp(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!Np(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = e;
	} catch (e) {
		if (!Np(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: Ed(e)
		};
	}
	return $.workspaceAgents;
}
async function Dp(e = $.activeWorkspaceId, t = $.navigationVersion) {
	let n = await yp(`/api/workspaces/${e}/ui-state`);
	return Np(e, t) ? ($.expandedProjects = new Set(n.expandedProjects || []), $.lastResourceId = n.lastResourceId || "", $.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], $.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, !0) : !1;
}
async function Op() {
	if (!$.activeWorkspaceId) return;
	let e = $.activeWorkspaceId, t = $.navigationVersion, n = $.selectedId;
	await yp(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...$.expandedProjects],
			lastResourceId: n,
			projectOrder: $.projectOrder,
			taskOrder: $.taskOrder
		})
	}), Np(e, t) && ($.lastResourceId = n);
}
function kp() {
	$.autoRefreshTimer ||= Pf?.interval(() => {
		Ap().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, Jf) ?? null;
}
async function Ap() {
	if (!$.activeWorkspaceId || $.autoRefreshInFlight || $.listDrag) return;
	let e = $.autoRefreshVersion, t = $.activeWorkspaceId, n = $.navigationVersion, r = $.selectedId;
	$.autoRefreshInFlight = !0;
	try {
		let i = await im(t);
		if (!i || !Pp(t, n, e)) return;
		let a = !rh($.tree, i);
		if (a && ($.tree = i), hp(mp(i)), a && $.preview?.section === "Wiki" && !$.preview.loading && (await $p("Wiki", $.preview.path), !Pp(t, n, e))) return;
		Hm() && (Jm({ replace: !0 }), a = !0, r = $.selectedId);
		let o = $.expandedProjects.size;
		if (Gm(!1), a ||= o !== $.expandedProjects.size, $.selectedId === "workspace") {
			let r = $.workspaceAgents;
			if (await Ep({ force: !0 }), !Pp(t, n, e)) return;
			rh(r, $.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++$.detailRequestVersion, o = await Cp(r, t);
			if (!Pp(t, n, e) || $.selectedId !== r || i !== $.detailRequestVersion) return;
			let s = wp(r);
			Tp(o), rh(s, wp(r)) || (a = !0);
		}
		hp(mp(i)), await cm(t, Nm()) && (a = !0), ap() !== $.taskOperationalStateKey && (a = !0), a && jp();
	} finally {
		$.autoRefreshInFlight = !1;
	}
}
function jp() {
	Vp(), Jp(), vm(), oh(), Rm(), Cm();
}
function Mp() {
	Vp(), Jp(), vm(), oh(), Rm();
}
function Np(e, t, n = null) {
	return e === $.activeWorkspaceId && t === $.navigationVersion && (n == null || n === $.treeRequestVersion);
}
function Pp(e, t, n) {
	return Np(e, t) && n === $.autoRefreshVersion;
}
function Fp(e) {
	return Zf.get(String(e?.icon || "").trim()) || Yf;
}
function Ip(e) {
	let t = Fp(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function Lp() {
	let e = $.config?.workspaces?.find((e) => e.id === $.activeWorkspaceId);
	Ip(e), Vp();
}
function Rp(e, t, n = "") {
	let r = ip(e), i = t === "project" && Wm(e.id), a = t === "project" ? tp(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: np(e.id),
		active: $.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: rp(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? Qf(e.children || [], $.taskOrder[e.id]).map((t) => Rp(t, "task", e.id)) : [],
		projectId: n,
		followed: !!e.attention?.followed
	};
}
function zp(e) {
	if (!e) return null;
	let t = ip(e);
	return {
		id: e.id || "scheduler",
		type: "scheduler",
		title: e.title || "Scheduler",
		ref: "",
		active: $.selectedId === (e.id || "scheduler"),
		expanded: !1,
		ariaLabel: ["Scheduler", t.label].filter(Boolean).join(". "),
		statusLabel: t.label || "Workspace Scheduler",
		status: rp(t.statusPresentation),
		summary: null,
		children: []
	};
}
function Bp(e) {
	let t = ip(e), n = e.type === "scheduler" || e.type === "project" || e.type === "task" ? e.type : "workspace", r = e.title || e.id;
	return {
		id: e.id,
		type: n,
		title: r,
		ref: n === "project" || n === "task" ? np(e.id) : "",
		selected: $.selectedId === e.id,
		activeTurn: !!e.runtime?.activeTurn,
		followed: !!e.attention?.followed,
		turnNumber: Number(e.runtime?.turnNumber) || 0,
		agentName: String(e.runtime?.agentName || "").trim(),
		statusLabel: t.label || (e.attention?.followed ? "Focused resource" : "Active turn"),
		status: rp(t.statusPresentation)
	};
}
function Vp() {
	let e = $.tree ? Qf($.tree.projects || [], $.projectOrder).map((e) => Rp(e, "project")) : [], t = $.tree?.attentionList?.map((e) => Bp(e)) || [];
	$.tree && ($.taskOperationalStateKey = ap()), Nf.renderAppShell({
		identity: $.activeWorkspaceId || "no-workspace",
		loading: !!$.navigationLoading,
		error: $.navigationError || "",
		version: "v0.1.0",
		activeWorkspaceId: $.activeWorkspaceId,
		workspaces: ($.config?.workspaces || []).map((e) => ({
			id: e.id,
			name: e.name || e.id,
			path: e.path || "",
			icon: e.icon || "",
			iconSrc: Fp(e).src
		})),
		scheduler: zp($.tree?.scheduler),
		projects: e,
		attentionList: t,
		...Uf.snapshot(),
		route: Wf.projection(),
		onSwitchWorkspace: (e) => Hp(e),
		onAddWorkspace: () => th("workspace").catch((e) => ah(e.message)),
		onCreateProject: () => Pm(),
		onOpenSettings: () => th().catch((e) => ah(e.message)),
		onToggleProject: (e) => Gp(e),
		onSelectResource: (e) => Wp(e),
		onReorder: (e, t, n) => Up(e, t, n),
		onDragState: (e) => {
			$.listDrag = e;
		},
		onToggleAttention: (e, t) => om(e, t),
		onDismissAttention: (e) => sm(e),
		onPanePreview: (e, t) => lh(e, t),
		onPaneCommit: (e) => uh(e),
		onPaneViewport: () => dh(),
		onMobileSidebar: (e) => fh(e),
		onMobileView: (e) => ph(e),
		onMobileImmersive: (e) => mh(e),
		onHistoryNavigation: (e) => bh(e),
		onToast: ah,
		onIconsChanged: oh
	});
}
async function Hp(e) {
	if (!qm(e)) return;
	if ($.workspaceMenuOpen = !1, e === $.activeWorkspaceId) {
		Lp();
		return;
	}
	fh(!1), zf(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let t = $.navigationVersion;
	await Op().catch((e) => console.warn("failed to save UI state", e)), $.activeWorkspaceId = e, $.selectedId = "workspace", $.tree = null, $.navigationLoading = !0, $.navigationError = "", Ff(), fp(e), Qp(), $.workspaceAgentsSaving = !1, Lm(), fm(), Lp(), await Dp(e, t) && ($.selectedId = $.lastResourceId || "workspace", await xp());
}
async function Up(e, t, n) {
	let r = {
		projectOrder: [...$.projectOrder],
		taskOrder: Object.fromEntries(Object.entries($.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []]))
	};
	if (e.kind === "task") {
		let r = Bm(e.projectId);
		if (!r) return;
		let i = Qf(r.children || [], $.taskOrder[e.projectId]);
		$.taskOrder = {
			...$.taskOrder,
			[e.projectId]: ep(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") $.projectOrder = ep(Qf($.tree?.projects || [], $.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	Vp();
	try {
		await Op();
	} catch (e) {
		throw $.projectOrder = r.projectOrder, $.taskOrder = r.taskOrder, Vp(), e;
	}
}
async function Wp(e, t = {}) {
	let n = $.selectedId !== e;
	t.clearUnread !== !1 && _p(e);
	let r = n || !!t.forceDetail;
	r && ($.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, e !== "workspace" && Gf.reset(e)), n && ($.workspaceAgentsSaving = !1, zf(), Dm(), $.preview = null, $.diff = null, Rf(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = ""), $.selectedId = e, fh(!1), Gm(!1), Jm(), Op().catch((e) => console.warn("failed to save UI state", e)), Mp(), await Promise.all([e === "workspace" ? Ep({ force: !!t.forceDetail }) : Sp(e, { force: r }), cm($.activeWorkspaceId, e)]), Np($.activeWorkspaceId, $.navigationVersion) && Mp();
}
async function Gp(e) {
	$.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), Vp();
	try {
		await Op();
	} catch (t) {
		throw $.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), Vp(), t;
	}
}
function Kp() {
	let e = $.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${$.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: Ym(),
		resourceId: $.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		parent: null,
		loading: !1,
		detail: null,
		wiki: $.tree?.wiki || null,
		workspaceAgents: $.workspaceAgents,
		agentBinding: $.selectedId === "workspace" ? $.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : Bm($.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: cp(),
		resolveResourceTitle: Vm,
		onNavigate: (e) => Yp(e).catch((e) => ah(Ed(e))),
		onCreateTask: (e) => Fm(e),
		onArchive: (e) => zm(e).catch((e) => ah(Ed(e))),
		onSaveWorkspaceAgents: (e, t) => em(e, t),
		onSaveAgentBinding: async (t) => {
			let n = $.selectedId || "workspace";
			await yp(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await xp({ updateURL: !1 }), n !== "workspace" && await Sp(n, { force: !0 }), jp(), ah("Resource agent binding saved.");
		},
		onRefreshScheduler: async () => {
			await xp({ updateURL: !1 }), $.selectedId === "scheduler" && await Sp("scheduler", { force: !0 }), jp();
		},
		onToast: ah,
		onIconsChanged: oh
	};
	if (!$.tree) return t;
	if ($.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Ym()
	};
	let n = Bm($.selectedId) || $.tree.scheduler || $.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Ym()
	};
	let r = $.details[n.id] || null, i = Um(n.id);
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
		detail: qp(r)
	};
}
function qp(e) {
	return !e || e.type !== "scheduler" && e.type !== "project" && e.type !== "task" ? null : {
		...e,
		type: e.type,
		title: e.title || e.id,
		path: e.path || ""
	};
}
function Jp() {
	Nf.renderDetailPanel(Kp());
}
async function Yp(e) {
	await Wp(e, { forceDetail: e === $.selectedId && e !== "workspace" });
}
function Xp(e) {
	let t = "", n = 0;
	for (; n < e.length;) {
		let r = e.indexOf("<!-- managed by forge cli -->", n);
		if (r < 0) {
			t += e.slice(n);
			break;
		}
		let i = e.indexOf("<!-- end of forge cli prompt -->", r + 29);
		if (i < 0) {
			t += e.slice(n);
			break;
		}
		t += e.slice(n, r), n = i + 32;
	}
	return t;
}
function Zp(e) {
	return Xp(e || "").trim();
}
function Qp() {
	$.workspaceAgentsDraft = "", $.workspaceAgentsDirty = !1;
}
async function $p(e, t, n = {}) {
	let r = n.workspaceId || $.activeWorkspaceId, i = n.requestVersion || ++$.previewRequestVersion;
	try {
		let n = await yp(rm(e, t, r));
		return r !== $.activeWorkspaceId || i !== $.previewRequestVersion || $.preview?.section !== e || $.preview?.path !== t ? null : ($.preview = {
			section: e,
			...n
		}, $.preview);
	} catch (a) {
		let o = r === $.activeWorkspaceId && i === $.previewRequestVersion && $.preview?.section === e && $.preview?.path === t;
		if (o && ($.preview = {
			section: e,
			path: t,
			error: Ed(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function em(e, t) {
	if (!$.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = $.activeWorkspaceId, r = $.navigationVersion, i = await yp(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!Np(n, r) || $.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return $.workspaceAgents = i, $.workspaceAgentsDraft = Zp(i.content || ""), $.workspaceAgentsDirty = !1, jp(), i;
}
function tm() {
	$.previewRequestVersion++, $.preview = null, jp();
}
function nm() {
	$.diffRequestVersion++, $.diff = null, jp();
}
function rm(e, t, n = $.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
async function im(e = $.activeWorkspaceId) {
	let t = ++$.treeRequestVersion, n = $.navigationVersion, r = await yp(`/api/workspaces/${e}/tree`);
	return Np(e, n, t) ? r : null;
}
async function am() {
	if (!$.activeWorkspaceId || !$.tree) return;
	let e = await im($.activeWorkspaceId);
	e && ($.tree = e);
}
async function om(e, t) {
	let n = $.activeWorkspaceId;
	!n || !e || (await yp(`/api/workspaces/${encodeURIComponent(n)}/resources/${encodeURIComponent(e)}/attention`, {
		method: "PUT",
		body: JSON.stringify({ followed: t })
	}), await am(), jp());
}
async function sm(e) {
	let t = $.activeWorkspaceId;
	!t || !e || (await yp(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(e)}/attention/dismiss`, { method: "POST" }), await am(), jp());
}
async function cm(e = $.activeWorkspaceId, t = Nm()) {
	if (!e || !t) return !1;
	let n = ++$.messageStatusRequestVersion, r = `${e}:${t}`, i = await yp(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/status`);
	if (n !== $.messageStatusRequestVersion || e !== $.activeWorkspaceId || t !== Nm()) return !1;
	let a = $.messageStatusKey !== r || !rh($.messageStatus, i);
	return $.messageStatusKey = r, $.messageStatus = i, a;
}
function lm() {
	$.stopNotice = null, xm();
}
async function um(e) {
	if (!e || $.steeringMessageId) return;
	let t = $.activeWorkspaceId, n = Nm();
	$.steeringMessageId = e, xm();
	try {
		await yp(`/api/workspaces/${encodeURIComponent(t)}/messages/${encodeURIComponent(e)}/steer`, { method: "POST" }), await cm(t, n), t === $.activeWorkspaceId && n === Nm() && (jp(), ah("Message inserted into the current turn."));
	} catch (e) {
		try {
			await cm(t, n);
		} catch {}
		throw e;
	} finally {
		$.steeringMessageId === e && ($.steeringMessageId = "", xm());
	}
}
async function dm() {
	zf(), Hf.reset(), Rf(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.stopNotice = null, await cm();
}
function fm() {
	zf(), Dm(), $.agent.optionsOpen = !1, $.agent.historyOpen = !1, Rf(), Hf.reset(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = "", $.stopNotice = null, $.agent.toolGroupOpen.clear(), $.agent.approvalDrafts.clear(), $.agent.renderDeferredForSelection = !1, mm();
}
function pm(e, t, n) {
	if (e !== $.activeWorkspaceId || t !== Nm() || !n) return;
	let r = Bm(t)?.runtime || $.messageStatus?.generation;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && gp(n, r?.generationId ? {
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
	].includes(n.type) && cm().then(jp).catch((e) => console.warn("agent refresh failed", e));
}
function mm() {
	$.agent.renderTimer && window.clearTimeout($.agent.renderTimer), $.agent.renderTimer = null;
}
function hm(e) {
	if (!e) return "";
	let t = [gm(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function gm(e) {
	return ($.config?.agentHubProviders || sp.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function _m(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function vm(e = {}) {
	xm();
	let t = Nm(), n = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, r = ($.config?.agents || []).find((e) => e.id === n?.resolvedAgent) || Zm(), i = Bm(t)?.runtime;
	Nf.renderAgentPanelHeader({
		identity: `${$.activeWorkspaceId}:${t}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		status: n,
		submitting: Hf.isSending(ym($.activeWorkspaceId, t)),
		agentName: Sm(r),
		modelSummary: hm(r),
		turnNumber: Number(n?.generation?.turnNumber) || Number(i?.turnNumber) || 0,
		turnStartedAt: String(i?.turnStartedAt || ""),
		onIconsChanged: oh
	}), Nf.renderEventTimeline({
		identity: `${$.activeWorkspaceId}:${t}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: Sm(r),
		resolveResourceTitle: Vm,
		onNavigate: (e) => Wp(e).catch((e) => ah(Ed(e))),
		project: Ws,
		onEvent: pm,
		onNotice: () => {},
		onApproval: jm,
		onToast: ah,
		onIconsChanged: oh
	});
}
function ym(e, t) {
	return `${e || "workspace"}:${t || "resource"}`;
}
var bm = "";
function xm(e = {}) {
	$.agent.skipTTYDraftSync = !1;
	let t = Nm();
	$.activeWorkspaceId && t && Bf(t);
	let n = Hf.active("turn-stop") && Hf.key("turn-stop") === t, r = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, i = $.activeWorkspaceId, a = `${i}:${t}`;
	Nf.renderComposer({
		identity: `${$.activeWorkspaceId}:${t}:${$.agent.ttyDraftKey || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		draft: $.agent.ttyDraft || "",
		draftKey: $.agent.ttyDraftKey || "",
		draftResetVersion: $.agent.ttyDraftResetVersion || 0,
		unavailableReason: r ? r.acceptsMessages ? "" : r.archived ? "This resource is archived." : r.configError || "This resource cannot accept messages." : "Loading work status.",
		sending: Hf.isSending(ym($.activeWorkspaceId, t)),
		canEndTurn: !!(n || ["running", "waiting_approval"].includes(String(r?.session?.state || ""))),
		endingTurn: n,
		stopNotice: $.stopNotice?.key === a ? $.stopNotice.text : "",
		waitingMessages: r?.waitingMessages || [],
		canSteerWaiting: !!r?.canSteerWaiting,
		steeringMessageId: $.steeringMessageId,
		agentBinding: t === "workspace" ? $.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : Bm(t)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: cp(),
		bindingSaving: bm === t,
		onDraft: (e, t) => wm(e, t),
		onSend: Mm,
		onOpenUpload: Tm,
		onEndTurn: () => Am().catch((e) => ah(e.message)),
		onDismissStopNotice: lm,
		onSteerWaiting: um,
		onSaveAgentBinding: async (e) => {
			if (t === Nm()) {
				bm = t, xm();
				try {
					await yp(`/api/workspaces/${encodeURIComponent(i)}/resources/${encodeURIComponent(t)}/agent-binding`, {
						method: "PUT",
						body: JSON.stringify(e)
					}), await xp({ updateURL: !1 }), t !== "workspace" && await Sp(t, { force: !0 }), jp(), ah("Resource agent binding saved.");
				} catch (e) {
					ah(Ed(e));
				} finally {
					bm = "", xm();
				}
			}
		},
		onIconsChanged: oh
	});
}
function Sm(e) {
	return e?.name || e?.id || "Agent";
}
function Cm() {
	sp.render();
}
function wm(e, t) {
	!t || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== Nm() || t.draftKey !== $.agent.ttyDraftKey || Vf(e);
}
function Tm() {
	let e = Nm();
	if (!e || $.messageStatus?.archived) {
		ah("Select an active resource before uploading files.");
		return;
	}
	let t = qf("ttyInput");
	t && Vf(t.value), $.modalEnter = "upload", $.uploadDialog = {
		open: !0,
		identity: ++op,
		resourceId: e,
		items: [],
		nextId: 1
	}, km();
}
function Em(e = [], t = {}) {
	if (!$.uploadDialog.open) return;
	let n = $.uploadDialog.resourceId === Nm(), r = !t.workspaceId || t.workspaceId === $.activeWorkspaceId, i = e.length > 0 && r && n;
	i && (Vf(Om($.agent.ttyDraft, e)), $.agent.ttyDraftResetVersion++), Dm();
	let a = qf("ttyComposer");
	a && delete a.dataset.composerKey, xm({ skipDraftSync: i }), qf("ttyInput")?.focus({ preventScroll: !0 }), oh();
}
function Dm() {
	$.uploadDialog = {
		open: !1,
		identity: ++op,
		resourceId: "",
		items: [],
		nextId: 1
	}, km();
}
function Om(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function km() {
	let e = $.uploadDialog;
	Nf.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${$.activeWorkspaceId}:${e.resourceId || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: e.resourceId || "",
		onDone: Em,
		onIconsChanged: oh
	});
}
async function Am() {
	let e = $.activeWorkspaceId, t = Nm(), n = $.messageStatus?.generation?.generationId || "", r = Hf.begin("turn-stop", t);
	if (r) try {
		let r = n ? `?generationId=${encodeURIComponent(n)}` : "", i = await yp(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/turn/end${r}`, { method: "POST" }), a = Math.max(0, Number(i.cancelledPendingSteerCount || 0)), o = a === 1 ? "Turn stopped. 1 pending steer was cancelled and will not affect the next turn." : a > 1 ? `Turn stopped. ${a} pending steers were cancelled and will not affect the next turn.` : "Turn stopped. No pending steer remained; any steer already delivered to this turn was not changed.";
		i.pendingSteerCancellationError && (o += ` Pending steer cancellation needs attention: ${i.pendingSteerCancellationError}`), $.stopNotice = {
			key: `${e}:${t}`,
			text: o
		}, await cm(e, t), jp();
	} finally {
		Hf.finish(r);
	}
}
async function jm(e, t, n) {
	let r = $.activeWorkspaceId, i = Nm();
	await yp(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/approval?generationId=${encodeURIComponent(e)}`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), await cm(r, i), jp();
}
async function Mm(e, t) {
	if (!e.trim() || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== Nm() || t.draftKey !== $.agent.ttyDraftKey) return {
		accepted: !1,
		clear: !1
	};
	let n = ym(t.workspaceId, t.resourceId);
	if (!Hf.startSending(n)) return {
		accepted: !1,
		clear: !1
	};
	let r = $.agent.ttyDraftVersion;
	try {
		await yp(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/resources/${encodeURIComponent(t.resourceId)}/messages`, {
			method: "POST",
			body: JSON.stringify({
				text: e,
				role: "user",
				sender: { name: vp() }
			})
		});
		let n = Lf({
			workspaceId: t.workspaceId,
			resourceId: t.resourceId,
			key: t.draftKey,
			text: e,
			version: r
		});
		return n && $.agent.ttyDraftResetVersion++, n && $.stopNotice?.key === `${t.workspaceId}:${t.resourceId}` && ($.stopNotice = null), await Promise.all([cm(t.workspaceId, t.resourceId), am()]), jp(), {
			accepted: !0,
			clear: n
		};
	} finally {
		Hf.stopSending(n);
	}
}
function Nm() {
	return $.selectedId === "workspace" ? "workspace" : Bm($.selectedId)?.id || "";
}
function Pm() {
	Im("project");
}
function Fm(e) {
	Im("task", e);
}
function Im(e, t = "") {
	Kf.open(e === "task" ? "task" : "project", t);
}
function Lm() {
	Kf.close();
}
function Rm() {
	Kf.render();
}
async function zm(e) {
	let t = $f(e, $.projectOrder, $.taskOrder), n = (await yp(`/api/workspaces/${$.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	})).warnings || [];
	ah(n.length > 0 ? ["Archived.", ...n.map((e) => `Warning: ${e.message}`)].join("\n") : "Archived."), $.selectedId = t, await xp();
}
function Bm(e) {
	if (!$.tree) return null;
	if ($.tree.scheduler?.id === e) return $.tree.scheduler;
	for (let t of $.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function Vm(e) {
	if (e === "workspace") return Ym();
	let t = Bm(e);
	return t ? String(t.title || t.id).trim() || t.id : null;
}
function Hm() {
	return $.selectedId === "workspace" || Bm($.selectedId) ? !1 : ($.selectedId = "workspace", !0);
}
function Um(e) {
	if (!$.tree) return null;
	for (let t of $.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function Wm(e) {
	return $.expandedProjects.has(e);
}
function Gm(e = !1) {
	let t = Um($.selectedId);
	!t || t.id === $.selectedId || $.expandedProjects.has(t.id) || ($.expandedProjects.add(t.id), e && Op().catch((e) => ah(e.message)));
}
function Km(e = window.location.pathname) {
	return Wf.parse(e);
}
function qm(e) {
	return !!(e && $.config?.workspaces.some((t) => t.id === e));
}
function Jm(e = {}) {
	Wf.project($.activeWorkspaceId, $.selectedId, e);
}
function Ym() {
	return $.config?.workspaces.find((e) => e.id === $.activeWorkspaceId)?.name || "Workspace";
}
function Xm() {
	let e = Qm(), t = $m();
	e.some((e) => e.id === $.agent.agentName) || ($.agent.agentName = t);
}
function Zm() {
	let e = Qm(), t = $.agent.agentName || $m();
	return e.find((e) => e.id === t) || e[0] || null;
}
function Qm() {
	return ($.config?.agents || []).filter((e) => e.available !== !1);
}
function $m() {
	let e = Qm();
	return eh($.config?.agentProfiles, "default") || eh(sp.profiles(), "default") || e[0]?.id || "";
}
function eh(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function th(e = "workspace") {
	return sp.open(e);
}
function nh(e, t) {
	return sp.withAgentHubCatalog(e, t);
}
function rh(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var ih = 0;
function ah(e) {
	Nf.renderToast({
		message: String(e || ""),
		revision: ++ih
	});
}
function oh() {
	let e = window.lucide;
	!e || $.iconRefreshScheduled || ($.iconRefreshScheduled = !0, Pf?.animationFrame(() => {
		$.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function sh(e) {
	oh(), e === "markdown" && window.marked && window.DOMPurify && (Jp(), oh()), e === "diff" && Jp();
}
window.forgeAssetLoaded = sh;
function ch() {
	Uf.initialize();
}
function lh(e, t) {
	Uf.previewPane(e, t);
}
function uh(e) {
	Uf.commitPane(e);
}
function dh() {
	Uf.syncViewport();
}
function fh(e) {
	Uf.setMobileSidebar(e);
}
function ph(e) {
	Uf.setMobileView(e);
}
function mh(e) {
	Uf.setMobileImmersive(e);
}
function hh() {
	Pf?.listen(document, "selectionchange", () => {
		if (!$.agent.renderDeferredForSelection) return;
		let e = qf("ttyLog");
		e && _m(e) || ($.agent.renderDeferredForSelection = !1, vm(), oh());
	}), Pf?.listen(document, "keydown", (e) => {
		e.key === "Escape" && $.diff ? nm() : e.key === "Escape" && $.preview ? tm() : e.key === "Escape" && ($.agent.optionsOpen || $.agent.historyOpen) && ($.agent.optionsOpen = !1, $.agent.historyOpen = !1, xm(), oh());
	}), Pf?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Yp(n.dataset.breadcrumbResource || "workspace").catch((e) => ah(Ed(e)));
			return;
		}
		($.agent.optionsOpen || $.agent.historyOpen) && t && !t.closest(".tty-composer") && ($.agent.optionsOpen = !1, $.agent.historyOpen = !1, xm(), oh()), oh();
	}), Pf?.listen(window, "beforeunload", vh), Pf?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && vh();
	});
}
var gh = !1;
function _h(e) {
	if (Nf = e, gh) {
		lp();
		return;
	}
	gh = !0;
	let t = new Mf();
	Pf = t, up = Jd({
		scope: t,
		selectedResourceId: () => $.selectedId,
		resourceProjections: () => mp(),
		hasTree: () => !!$.tree,
		findResource: Bm,
		selectResource: Wp,
		notificationsSettingsVisible: () => sp.isOpenTab("notifications"),
		renderSettings: Cm,
		refreshIcons: oh,
		flushDraft: vh
	}), dp = jf(t, () => {
		sp.isOpenTab("user") && Cm();
	}), hh(), ch(), up.install(), Vp(), bp().catch((e) => {
		$.navigationLoading = !1, $.navigationError = e.message, ah(e.message), jp();
	}), kp();
}
function vh() {
	zf();
}
function yh() {
	gh && (vh(), gh = !1, up?.dispose(), up = null, dp = null, Hf.reset(), mm(), Kf.dispose(), Pf?.dispose(), Pf = null, $.autoRefreshTimer = null);
}
async function bh(e) {
	let t = Km(e);
	if (!qm(t.workspaceId)) {
		Jm({ replace: !0 });
		return;
	}
	let n = $.activeWorkspaceId !== t.workspaceId, r = $.selectedId;
	zf(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, $.workspaceAgentsSaving = !1;
	let i = $.navigationVersion;
	if ($.activeWorkspaceId = t.workspaceId || "", $.selectedId = t.resourceId || "workspace", !n && r !== $.selectedId && $.selectedId !== "workspace" && (Gf.reset($.selectedId), delete $.details[$.selectedId]), $.preview = null, $.diff = null, n && ($.tree = null, $.navigationLoading = !0, $.navigationError = "", Qp(), $.workspaceAgentsSaving = !1, Lm(), fp($.activeWorkspaceId)), n && fm(), Lp(), n) {
		if (!await Dp(t.workspaceId || "", i)) return;
		!t.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await xp({ updateURL: !1 }), Np(t.workspaceId || "", i) && Jm({ replace: !0 });
	} else {
		let e = Hm();
		if ($.selectedId === "workspace" ? await Ep() : (Gm(!1), await Sp($.selectedId)), !Np(t.workspaceId || "", i)) return;
		r !== $.selectedId && await dm(), jp(), e && Jm({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var xh = gd(), Sh = {
	renderAppShell: xh.appShell.publish,
	renderCreateDialog: xh.create.publish,
	renderSettings: xh.settings.publish,
	renderUploadDialog: xh.upload.publish,
	renderComposer: xh.composer.publish,
	renderEventTimeline: xh.timeline.publish,
	renderAgentPanelHeader: xh.agentHeader.publish,
	renderDetailPanel: xh.detail.publish,
	renderToast: xh.toast.publish
}, Ch = null;
async function wh() {
	if (Ch) return;
	let e = document.getElementById("app");
	if (!e) throw Error("Forge application root is unavailable.");
	e.dataset.componentOwner = "app-shell", Ch = Nr(pd, {
		target: e,
		props: { channels: xh }
	}), _h(Sh);
}
async function Th() {
	if (yh(), !Ch) return;
	let e = Ch;
	Ch = null, await Lr(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void Th()), window.addEventListener("pageshow", (e) => {
	e.persisted && wh();
}), wh().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
