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
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, C = 1 << 20, w = 1 << 25, T = 65536, E = 1 << 21, ee = 1 << 22, te = 1 << 23, ne = Symbol("$state"), re = Symbol("legacy props"), ie = Symbol(""), ae = Symbol("attributes"), oe = Symbol("class"), se = Symbol("style"), ce = Symbol("text"), le = Symbol("form reset"), ue = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), de = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function fe(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function pe() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function me(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function he(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function ge() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function _e(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function ve() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function ye(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function be() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function xe() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Se() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function Ce() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var we = {}, Te = Symbol("uninitialized"), Ee = "http://www.w3.org/1999/xhtml", De = "http://www.w3.org/2000/svg", Oe = "http://www.w3.org/1998/Math/MathML";
function ke() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Ae(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function je() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Me() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var D = !1;
function Ne(e) {
	D = e;
}
var O;
function Pe(e) {
	if (e === null) throw Ae(), we;
	return O = e;
}
function Fe() {
	return Pe(/* @__PURE__ */ ln(O));
}
function k(e) {
	if (D) {
		if (/* @__PURE__ */ ln(O) !== null) throw Ae(), we;
		O = e;
	}
}
function A(e = 1) {
	if (D) {
		for (var t = e, n = O; t--;) n = /* @__PURE__ */ ln(n);
		O = n;
	}
}
function Ie(e = !0) {
	for (var t = 0, n = O;;) {
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
	if (!e || e.nodeType !== 8) throw Ae(), we;
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
		r: V,
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
	var t = V;
	if (t === null) return B.f |= te, e;
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
	D && /* @__PURE__ */ cn(e) !== null && dn(e);
}
var it = !1;
function at() {
	it || (it = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[le]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ot(e) {
	var t = B, n = V;
	Wn(null), Gn(null);
	try {
		return e();
	} finally {
		Wn(t), Gn(n);
	}
}
function st(e, t, n, r = n) {
	e.addEventListener(t, () => ot(n));
	let i = e[le];
	e[le] = i ? () => {
		i(), r(!0);
	} : () => r(!0), at();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ct(e) {
	let t = 0, n = Kt(0), r;
	return () => {
		vn() && (H(n), Tn(() => (t === 0 && (r = fr(() => e(() => Xt(n)))), t += 1, () => {
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
	#t = D ? O : null;
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
			var t = V;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = V.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = En(() => {
			if (D) {
				let e = this.#t;
				Fe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, lt), D && (this.#e = O);
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
				Me();
				return;
			}
			t = !0, n && Ce(), this.#s !== null && Pn(this.#s, () => {
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
		var t = V, n = B, r = Ve;
		Gn(this.#i), Wn(this.#i), He(this.#i.ctx);
		try {
			return Ft.ensure(), e();
		} catch (e) {
			return Je(e), null;
		} finally {
			Gn(t), Wn(n), He(r);
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
		return this.#h(), H(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		P?.is_fork ? (this.#a && P.skip_effect(this.#a), this.#o && P.skip_effect(this.#o), this.#s && P.skip_effect(this.#s), P.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (jn(this.#a), null), this.#o &&= (jn(this.#o), null), this.#s &&= (jn(this.#s), null), D && (Pe(this.#t), A(), Pe(Ie()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return Dn(() => {
						var r = V;
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
	var s = V, c = pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = V, t = B, n = Ve, r = P;
	return function(i = !0) {
		Gn(e), Wn(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function mt(e = !0) {
	Gn(null), Wn(null), He(null), e && P?.deactivate();
}
function ht() {
	var e = V, t = e.b, n = P, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gt(e) {
	var t = 2 | h;
	return V !== null && (V.f |= S), {
		ctx: Ve,
		deps: null,
		effects: null,
		equals: Re,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: Te,
		wv: 0,
		parent: V,
		ac: null
	};
}
var _t = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function vt(e, t, n) {
	let r = V;
	r === null && pe();
	var i = void 0, a = Kt(Te), o = !B, s = /* @__PURE__ */ new Set();
	return wn(() => {
		var t = V, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ue && n.reject(e);
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
	return qn(t), t;
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
	var t, n = V, r = e.parent;
	if (!Vn && r !== null && e.v !== Te && r.f & 24576) return ke(), e.v;
	Gn(r);
	try {
		e.f &= ~T, bt(e), t = ar(e);
	} finally {
		Gn(n);
	}
	return t;
}
function St(e) {
	var t = xt(e);
	if (!e.equals(t) && (e.wv = nr(), (!P?.is_fork || e.deps === null) && (P === null ? e.v = t : (P.capture(e, t, !0), Et?.capture(e, t, !0)), e.deps === null))) {
		Ze(e, m);
		return;
	}
	Vn || (Dt === null ? Qe(e) : (vn() || P?.is_fork) && Dt.set(e, t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ot(() => {
		t.ac.abort(ue), t.ac = null;
	}), t.fn !== null && (t.teardown = d), sr(t, 0), kn(t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && cr(t);
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
				a ? r.f ^= m : i & 4 ? t.push(r) : rr(r) && (i & 16 && this.#d.add(r), cr(r));
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
		e.v !== Te && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Dt?.set(e, t)), this.is_fork || (e.v = t);
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
			if (jt !== null && t === V && (B === null || !(B.f & 2))) return;
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
		ve();
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
			if (!(r.f & 24576) && rr(r) && (Rt = /* @__PURE__ */ new Set(), cr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nn(r), Rt?.size > 0)) {
				Wt.clear();
				for (let e of Rt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Rt.has(n) && (Rt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || cr(n);
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
	return qn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function qt(e, t = !1, n = !0) {
	let r = Kt(e);
	return t || (r.equals = Be), r;
}
function I(e, t, n = !1) {
	return B !== null && (!Un || B.f & 131072) && Ue() && B.f & 4325394 && (Kn === null || !Kn.has(e)) && Se(), Jt(e, n ? Qt(t) : t, Mt);
}
function Jt(e, t, n = null) {
	if (!e.equals(t)) {
		Wt.set(e, Vn ? t : e.v);
		var r = Ft.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && xt(t), Dt === null && Qe(t);
		}
		e.wv = nr(), Zt(e, h, n), Ue() && V !== null && V.f & 1024 && !(V.f & 96) && (Xn === null ? Zn([e]) : Xn.push(e)), !r.is_fork && Ut.size > 0 && !Gt && Yt();
	}
	return t;
}
function Yt() {
	Gt = !1;
	for (let e of Ut) {
		e.f & 1024 && Ze(e, g);
		let t;
		try {
			t = rr(e);
		} catch {
			t = !0;
		}
		t && cr(e);
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
		if (!(!i && s === V)) {
			var l = (c & h) === 0;
			if (l && Ze(s, t), c & 131072) Ut.add(s);
			else if (c & 2) {
				var u = s;
				Dt?.delete(u), c & 65536 || (c & 512 && (V === null || !(V.f & 2097152)) && (s.f |= T), Zt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Rt !== null && Rt.add(d), n === null ? Bt(d) : n.push(d);
			}
		}
	}
}
function Qt(t) {
	if (typeof t != "object" || !t || ne in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ F(0), u = null, d = er, f = (e) => {
		if (er === d) return e();
		var t = B, n = er;
		Wn(null), tr(d);
		var r = e();
		return Wn(t), tr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ F(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && be();
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
					let e = f(() => /* @__PURE__ */ F(Te, u));
					r.set(t, e), Xt(o);
				}
			} else I(n, Te), Xt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === ne) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ F(Qt(s ? e[n] : Te), u)), r.set(n, o)), o !== void 0) {
				var c = H(o);
				return c === Te ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = H(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== Te) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === ne) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== Te || Reflect.has(e, t);
			return (n !== void 0 || V !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ F(i ? Qt(e[t]) : Te, u)), r.set(t, n)), H(n) === Te) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ F(Te, u)), r.set(d + "", p)) : I(p, Te);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ F(void 0, u)), I(c, Qt(n)), r.set(t, c));
			else {
				l = c.v !== Te;
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
			H(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== Te;
			});
			for (var [n, i] of r) i.v !== Te && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			xe();
		}
	});
}
function $t(e) {
	try {
		if (typeof e == "object" && e && ne in e) return e[ne];
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
		rn = a(t, "firstChild").get, an = a(t, "nextSibling").get, u(e) && (e[oe] = void 0, e[ae] = null, e[se] = void 0, e.__e = void 0), u(n) && (n[ce] = void 0);
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
	if (!D) return /* @__PURE__ */ cn(e);
	var n = /* @__PURE__ */ cn(O);
	if (n === null) n = O.appendChild(sn());
	else if (t && n.nodeType !== 3) {
		var r = sn();
		return n?.before(r), Pe(r), r;
	}
	return t && mn(n), Pe(n), n;
}
function un(e, t = !1) {
	if (!D) {
		var n = /* @__PURE__ */ cn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
	}
	if (t) {
		if (O?.nodeType !== 3) {
			var r = sn();
			return O?.before(r), Pe(r), r;
		}
		mn(O);
	}
	return O;
}
function R(e, t = 1, n = !1) {
	let r = D ? O : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ ln(r);
	if (!D) return r;
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
	V === null && (B === null && _e(e), ge()), Vn && he(e);
}
function gn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function _n(e, t) {
	var n = V;
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
			cr(r);
		} catch (e) {
			throw jn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && gn(i, n), B !== null && B.f & 2 && !(e & 64))) {
		var a = B;
		(a.effects ??= []).push(i);
	}
	return r;
}
function vn() {
	return B !== null && !Un;
}
function yn(e) {
	let t = _n(8, null);
	return Ze(t, m), t.teardown = e, t;
}
function bn(e) {
	hn("$effect");
	var t = V.f;
	if (!B && t & 32 && Ve !== null && !Ve.i) {
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
			e(...t.map(H));
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
		let e = Vn, n = B;
		Hn(!0), Wn(null);
		try {
			t.call(null);
		} finally {
			Hn(e), Wn(n);
		}
	}
}
function kn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ot(() => {
			e.abort(ue);
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Mn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, kn(e, t && !n), sr(e, 0);
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
var B = null, Un = !1;
function Wn(e) {
	B = e;
}
var V = null;
function Gn(e) {
	V = e;
}
var Kn = null;
function qn(e) {
	B !== null && (Kn ??= /* @__PURE__ */ new Set()).add(e);
}
var Jn = null, Yn = 0, Xn = null;
function Zn(e) {
	Xn = e;
}
var Qn = 1, $n = 0, er = $n;
function tr(e) {
	er = e;
}
function nr() {
	return ++Qn;
}
function rr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (rr(a) && St(a), a.wv > e.wv) return !0;
		}
		t & 512 && Dt === null && Ze(e, m);
	}
	return !1;
}
function ir(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Kn !== null && Kn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ir(a, t, !1) : t === a && (n ? Ze(a, h) : a.f & 1024 && Ze(a, g), Bt(a));
	}
}
function ar(e) {
	var t = Jn, n = Yn, r = Xn, i = B, a = Kn, o = Ve, s = Un, c = er, l = e.f;
	Jn = null, Yn = 0, Xn = null, B = l & 96 ? null : e, Kn = null, He(e.ctx), Un = !1, er = ++$n, e.ac !== null && (ot(() => {
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = P?.is_fork;
		if (Jn !== null) {
			var m;
			if (p || sr(e, Yn), f !== null && Yn > 0) for (f.length = Yn + Jn.length, m = 0; m < Jn.length; m++) f[Yn + m] = Jn[m];
			else e.deps = f = Jn;
			if (vn() && e.f & 512) for (m = Yn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Yn < f.length && (sr(e, Yn), f.length = Yn);
		if (Ue() && Xn !== null && !Un && f !== null && !(e.f & 6146)) for (m = 0; m < Xn.length; m++) ir(Xn[m], e);
		if (i !== null && i !== e) {
			if ($n++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = $n;
			if (t !== null) for (let e of t) e.rv = $n;
			Xn !== null && (r === null ? r = Xn : r.push(...Xn));
		}
		return e.f & 8388608 && (e.f ^= te), d;
	} catch (e) {
		return Je(e);
	} finally {
		e.f ^= E, Jn = t, Yn = n, Xn = r, B = i, Kn = a, He(o), Un = s, er = c;
	}
}
function or(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Jn === null || !n.call(Jn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== Te && Qe(s), s.ac !== null && ot(() => {
			s.ac.abort(ue), s.ac = null, Ze(s, h);
		}), Ct(s), sr(s, 0);
	}
}
function sr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) or(e, n[r]);
}
function cr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Ze(e, m);
		var n = V, r = Bn;
		V = e, Bn = !(t & 96);
		try {
			t & 16777232 ? An(e) : kn(e), On(e);
			var i = ar(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Qn;
		} finally {
			Bn = r, V = n;
		}
	}
}
async function lr() {
	await Promise.resolve(), It();
}
function H(e) {
	var t = !!(e.f & 2);
	if (zn?.add(e), B !== null && !Un && !(V !== null && V.f & 16384) && (Kn === null || !Kn.has(e))) {
		var r = B.deps;
		if (B.f & 2097152) e.rv < $n && (e.rv = $n, Jn === null && r !== null && r[Yn] === e ? Yn++ : Jn === null ? Jn = [e] : Jn.push(e));
		else {
			B.deps ??= [], n.call(B.deps, e) || B.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [B] : n.call(i, B) || i.push(B);
		}
	}
	if (Vn && Wt.has(e)) return Wt.get(e);
	if (t) {
		var a = e;
		if (Vn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || dr(a)) && (o = xt(a)), Wt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Un && B !== null && (Bn || !!(B.f & 512)), c = (a.f & y) === 0;
		rr(a) && (s && (a.f |= 512), St(a)), s && !c && (wt(a), ur(a));
	}
	if (Dt?.has(e)) return Dt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function ur(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (wt(t), ur(t));
}
function dr(e) {
	if (e.v === Te) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Wt.has(t) || t.f & 2 && dr(t)) return !0;
	return !1;
}
function fr(e) {
	var t = Un;
	try {
		return Un = !0, e();
	} finally {
		Un = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var pr = ["touchstart", "touchmove"];
function mr(e) {
	return pr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var hr = Symbol("events"), gr = /* @__PURE__ */ new Set(), _r = /* @__PURE__ */ new Set();
function vr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Sr.call(t, e), !e.cancelBubble) return ot(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ke(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function yr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = vr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && yn(() => {
		t.removeEventListener(e, o, a);
	});
}
function U(e, t, n) {
	(t[hr] ??= {})[e] = n;
}
function br(e) {
	for (var t = 0; t < e.length; t++) gr.add(e[t]);
	for (var n of _r) n(e);
}
var xr = null;
function Sr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	xr = e;
	var s = 0, c = xr === e && e[hr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[hr] = t;
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
		var d = B, f = V;
		Wn(null), Gn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[hr]?.[r];
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
			e[hr] = t, delete e.currentTarget, Wn(d), Gn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Cr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function wr(e) {
	return Cr?.createHTML(e) ?? e;
}
function Tr(e) {
	var t = pn("template");
	return t.innerHTML = wr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Er(e, t) {
	var n = V;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function W(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (D) return Er(O, null), O;
		i === void 0 && (i = Tr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ cn(i)));
		var t = r || nn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ cn(t), s = t.lastChild;
			Er(o, s);
		} else Er(t, t);
		return t;
	};
}
function Dr(e = "") {
	if (!D) {
		var t = sn(e + "");
		return Er(t, t), t;
	}
	var n = O;
	return n.nodeType === 3 ? mn(n) : (n.before(n = sn()), Pe(n)), Er(n, n), n;
}
function Or() {
	if (D) return Er(O, null), O;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = sn();
	return e.append(t, n), Er(t, n), e;
}
function G(e, t) {
	if (D) {
		var n = V;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = O), Fe();
		return;
	}
	e !== null && e.before(t);
}
function K(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ce] ??= e.nodeValue) && (e[ce] = n, e.nodeValue = `${n}`);
}
function kr(e, t) {
	return jr(e, t);
}
var Ar = /* @__PURE__ */ new Map();
function jr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	on();
	var l = void 0, u = Sn(() => {
		var s = n ?? t.appendChild(sn());
		ut(s, { pending: () => {} }, (t) => {
			j({});
			var n = Ve;
			if (o && (n.c = o), a && (i.$$events = a), D && Er(t, null), l = e(t, i) || {}, D && (V.nodes.end = O, O === null || O.nodeType !== 8 || O.data !== "]")) throw Ae(), we;
			M();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = mr(r);
					for (let e of [t, document]) {
						var a = Ar.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Ar.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Sr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(gr)), _r.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Ar.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Sr), r.delete(e), r.size === 0 && Ar.delete(n)) : r.set(e, i);
			}
			_r.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Mr.set(l, u), l;
}
var Mr = /* @__PURE__ */ new WeakMap();
function Nr(e, t) {
	let n = Mr.get(e);
	return n ? (Mr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Pr = class {
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
		} else D && (this.anchor = O), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function q(e, t, n = !1) {
	var r;
	D && (r = O, Fe());
	var i = new Pr(e), a = n ? x : 0;
	function o(e, t) {
		if (D) {
			var n = Le(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Ie();
				Pe(a), i.anchor = a, Ne(!1), i.ensure(e, t), Ne(!0);
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
var Fr = Symbol("NaN");
function Ir(e, t, n) {
	D && Fe();
	var r = new Pr(e), i = !Ue();
	En(() => {
		var e = t();
		e !== e && (e = Fr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Lr(e, t) {
	return t;
}
function Rr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Pn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					zr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
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
		zr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function zr(e, t, n = !0) {
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
var Br;
function J(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = D ? Pe(/* @__PURE__ */ cn(u)) : u.appendChild(sn());
	}
	D && Fe();
	var d = null, f = /* @__PURE__ */ yt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Hr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Wr(d, null, c)) : In(d) : Pn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: En(() => {
			p = H(f);
			var e = p.length;
			let t = !1;
			D && Le(c) === "[!" != (e === 0) && (c = Ie(), Pe(c), Ne(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = P, v = fn(), y = 0; y < e; y += 1) {
				D && O.nodeType === 8 && O.data === "]" && (c = O, t = !0, Ne(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Jt(S.v, b), S.i && Jt(S.i, y), v && u.unskip_effect(S.e)) : (S = Ur(l, h ? c : Br ??= sn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Dn(() => s(c)) : (d = Dn(() => s(Br ??= sn())), d.f |= w)), e > r.size && me("", "", ""), D && e > 0 && Pe(Ie()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Ne(!0), H(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, D && (c = O);
}
function Vr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Hr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Vr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (In(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Wr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Gr(e, d, _), Gr(e, _, y), Wr(_, y, n), d = _, p = [], m = [], l = Vr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Wr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Gr(e, S.prev, C.next), Gr(e, d, S), Gr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Wr(_, l, n), Gr(e, _.prev, _.next), Gr(e, _, d === null ? e.effect.first : d.next), Gr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Vr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Vr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (zr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Vr(l.next);
		var E = T.length;
		if (E > 0) {
			var ee = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Rr(e, T, ee);
		}
	}
	o && Ke(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ur(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Kt(n) : /* @__PURE__ */ qt(n, !1, !1) : null, l = o & 2 ? Kt(i) : null;
	return {
		v: c,
		i: l,
		e: Dn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Wr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ ln(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Gr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Kr(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		D && (o = Pe(/* @__PURE__ */ cn(c)));
	}
	z(() => {
		var e = V;
		if (s === (s = t() ?? "")) {
			D && Fe();
			return;
		}
		if (n && !D) {
			e.nodes = null, c.innerHTML = s, s !== "" && Er(/* @__PURE__ */ cn(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Mn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (D) {
				for (var a = O.data, l = Fe(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ ln(l);
				if (l === null) throw Ae(), we;
				Er(O, u), o = Pe(l);
				return;
			}
			var d = pn(r ? "svg" : i ? "math" : "template", r ? De : i ? Oe : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Er(/* @__PURE__ */ cn(f), f.lastChild), r || i) for (; /* @__PURE__ */ cn(f);) o.before(/* @__PURE__ */ cn(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function qr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = qr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Jr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = qr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Yr(e) {
	return typeof e == "object" ? Jr(e) : e ?? "";
}
var Xr = [..." 	\n\r\f\xA0\v﻿"];
function Zr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Xr.includes(r[o - 1])) && (s === r.length || Xr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Qr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function $r(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ei(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map($r)), i && c.push(...Object.keys(i).map($r));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = $r(e.substring(l, u).trim());
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
		return r && (n += Qr(r)), i && (n += Qr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Y(e, t, n, r, i, a) {
	var o = e[oe];
	if (D || o !== n || o === void 0) {
		var s = Zr(n, r, a);
		(!D || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[oe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ti(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ni(e, t, n, r) {
	var i = e[se];
	if (D || i !== t) {
		var a = ei(t, r);
		(!D || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[se] = t;
	} else r && (Array.isArray(r) ? (ti(e, n?.[0], r[0]), ti(e, n?.[1], r[1], "important")) : ti(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ri(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return je();
		for (var i of t.options) i.selected = n.includes(oi(i));
		return;
	}
	for (i of t.options) if (en(oi(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function ii(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ri(e, e.__value);
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
function ai(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	st(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), oi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && oi(o);
		}
		n(a), e.__value = a, P !== null && r.add(P);
	}), Cn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = P;
			if (r.has(o)) return;
		}
		if (ri(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = oi(s), n(a));
		}
		e.__value = a, i = !1;
	}), ii(e);
}
function oi(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var si = Symbol("is custom element"), ci = Symbol("is html"), li = de ? "link" : "LINK", ui = de ? "progress" : "PROGRESS";
function di(e) {
	if (D) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					X(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					X(e, "checked", null), e.checked = r;
				}
			}
		};
		e[le] = n, Ke(n), at();
	}
}
function fi(e, t) {
	var n = mi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === ui) && (e.value = t ?? "");
}
function pi(e, t) {
	var n = mi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function X(e, t, n, r) {
	var i = mi(e);
	D && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === li) || i[t] !== (i[t] = n) && (t === "loading" && (e[ie] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && gi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function mi(e) {
	return e[ae] ??= {
		[si]: e.nodeName.includes("-"),
		[ci]: e.namespaceURI === Ee
	};
}
var hi = /* @__PURE__ */ new Map();
function gi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = hi.get(t);
	if (n) return n;
	hi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function _i(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	st(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = yi(e) ? bi(a) : a, n(a), P !== null && r.add(P), await lr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (D && e.defaultValue !== e.value || fr(t) == null && e.value) && (n(yi(e) ? bi(e.value) : e.value), P !== null && r.add(P)), Tn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = P;
			if (r.has(i)) return;
		}
		yi(e) && n === bi(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function vi(e, t, n = t) {
	st(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (D && e.defaultChecked !== e.checked || fr(t) == null) && n(e.checked), Tn(() => {
		e.checked = !!t();
	});
}
function yi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function bi(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function xi(e, t) {
	return e === t || e?.[ne] === t;
}
function Si(e = {}, t, n, r) {
	var i = Ve.r, a = V;
	return Cn(() => {
		var o, s;
		return Tn(() => {
			o = s, s = r?.() || [], fr(() => {
				xi(n(...s), e) || (t(e, ...s), o && xi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && xi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Ci(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ gt(r), H(u)) : (l && (l = !1, c = s ? fr(r) : r), c);
	let f;
	if (o) {
		var p = ne in e || re in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = nt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ye(t), f(m)));
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
	o && H(y);
	var b = V;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? H(y) : i && o ? Qt(e) : e;
			return I(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Vn && v || b.f & 16384 ? y.v : H(y);
	});
}
function wi(e) {
	Ve === null && fe("onMount"), bn(() => {
		let t = fr(e);
		if (typeof t == "function") return t;
	});
}
function Ti(e) {
	Ve === null && fe("onDestroy"), wi(() => () => fr(e));
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var Ei = "forge.gui.agentDraft.v1", Di = 1, Oi = 50, ki = 7776e6;
function Ai(e) {
	return encodeURIComponent(String(e || "").trim());
}
function ji(e) {
	return String(e?.agentHubSessionId || e?.sourceExternalId || e?.id || "").trim();
}
function Mi(e) {
	return String(e || "").trim() || "workspace";
}
function Ni(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? Oi, r = e.maxAgeMs ?? ki;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function a(e, t) {
		let n = String(t || "").trim(), r = ji(e);
		return !n || !r ? "" : `${Ei}.session.${Ai(n)}.${Ai(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== Di || typeof t.text != "string" ? null : {
				version: Di,
				text: t.text,
				updatedAt: Number(t.updatedAt) || 0,
				workspaceId: String(t.workspaceId || ""),
				resourceId: String(t.resourceId || ""),
				runId: String(t.runId || ""),
				sessionId: String(t.sessionId || "")
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
				version: Di,
				text: n,
				updatedAt: t(),
				...r
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = Mi(a);
		if (!c || !u) return;
		let f = `${Ei}.session.${Ai(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || Mi(n.resourceId) !== d || o.has(t))) {
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
		keyForRun: a,
		read: c,
		remove: l,
		write: u,
		prune: d
	};
}
//#endregion
//#region src/controllers/agent-operation-controller.ts
function Pi(e) {
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
function Fi(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/agent-session-controller.ts
function Ii(e) {
	let { operations: t } = e;
	async function n() {
		await Promise.all([e.reloadRuns(), e.refreshTree()]);
	}
	async function r(r = {}) {
		return e.mutate(async () => {
			let i = e.taskDetail();
			if (!i || i.type !== "task") throw Error("Select a task first.");
			let a = i.id, o = r.enabled ?? !0, s = t.begin("self-driving-save", a);
			if (s) try {
				let t = {
					resourceId: a,
					enabled: o
				};
				r.configured && (t.agentName = String(r.agentName || "").trim(), t.prompt = String(r.runInstructions || ""), t.completionCriteria = String(r.completionCriteria || ""));
				let i = await e.request(`/api/workspaces/${e.workspaceId()}/self-driving`, {
					method: "PUT",
					body: JSON.stringify(t)
				}), s = e.workspaceId();
				await Promise.all([n(), e.fetchDetail(a, s).then((t) => e.applyDetail(t))]), e.publish(), e.toast(o ? "Self-Driving enabled. The Scheduler will reconcile asynchronously." : i.notificationError ? `Self-Driving disabled. ${i.notificationError}` : "Self-Driving disabled. The current Turn and Session were left open.");
			} finally {
				t.finish(s);
			}
		});
	}
	async function i(r = "") {
		if (!t.active("session-start")) return e.mutate(async () => {
			let i = e.workspaceId();
			if (!i) throw Error("Select a workspace first.");
			if (e.hasExternalLock()) throw Error(e.externalLockMessage);
			let a = e.selectedResource(), o = String(r || "").trim(), s = o ? e.enabledAgents().find((e) => e.id === o) || null : e.selectedAgent();
			if (!s) throw Error("Select an enabled agent first.");
			e.setAgentName(s.id);
			let c = t.begin("session-start", s.id);
			if (c) try {
				let t = await e.request(`/api/workspaces/${i}/agent/runs`, {
					method: "POST",
					body: JSON.stringify({
						agentName: s.id,
						userName: e.userName(),
						resourceId: a?.id || "",
						title: a?.title || e.workspaceName(),
						prompt: "",
						cwd: e.defaultCwd()
					})
				});
				e.resetDraft(), e.closeAgentMenus(), e.setActiveRun(t.run.id), await n(), e.publish(), e.toast("Agent session started.");
			} finally {
				t.finish(c);
			}
		});
	}
	async function a(t) {
		if (t) return e.request(`/api/workspaces/${e.workspaceId()}/agent/runs/${t}/stop`, { method: "POST" });
	}
	async function o() {
		if (!e.activeRunId() || t.active("session-stop") || t.active("turn-stop")) return;
		let r = e.currentRun();
		if (!(!r || !e.isLive(r) || r.status === "stopping")) return e.mutate(async () => {
			let r = e.activeRunId(), i = t.begin("session-stop", r);
			if (i) try {
				await a(r), await n(), e.publish(), e.toast("Agent session closed. Self-Driving desired state was not changed.");
			} catch (t) {
				try {
					await n(), e.publish();
				} catch {}
				throw t;
			} finally {
				t.finish(i);
			}
		});
	}
	async function s() {
		if (t.active("self-driving-disable")) return;
		let r = e.taskDetail();
		if (!(!r || r.type !== "task")) return e.mutate(async () => {
			let i = t.begin("self-driving-disable", r.id);
			if (i) try {
				let t = await e.request(`/api/workspaces/${e.workspaceId()}/self-driving`, {
					method: "PUT",
					body: JSON.stringify({
						resourceId: r.id,
						enabled: !1
					})
				});
				await n(), e.publish(), e.toast(t.notificationError ? `Self-Driving disabled. ${t.notificationError}` : "Self-Driving disabled. The Agent Session remains open.");
			} catch (t) {
				try {
					await n(), e.publish();
				} catch {}
				throw t;
			} finally {
				t.finish(i);
			}
		});
	}
	async function c() {
		if (!(!e.activeRunId() || t.active("turn-stop") || t.active("session-stop") || !e.isTurnInterruptible(e.currentRun()))) return e.mutate(async () => {
			let r = e.activeRunId(), i = t.begin("turn-stop", r);
			if (i) try {
				await e.request(`/api/workspaces/${e.workspaceId()}/agent/runs/${r}/interrupt`, { method: "POST" }), await n(), e.publish(), e.toast("Turn ended. The AgentHub Session remains open.");
			} catch (t) {
				try {
					await n(), e.publish();
				} catch {}
				throw t;
			} finally {
				t.finish(i);
			}
		});
	}
	async function l(r) {
		if (!(!r || r === e.activeRunId())) return e.mutate(async () => {
			let i = t.begin("session-switch", r);
			if (!i) return;
			let o = e.workspaceId();
			e.flushDraft();
			let s = e.currentRun();
			e.setActiveRun(r), e.resetDraft();
			let c = e.runs().find((e) => e.id === r);
			c && e.restoreDraft(c), e.publish();
			try {
				if (s && e.isLive(s) && !s.schedulerTurn) try {
					await a(s.id);
				} catch (t) {
					throw o === e.workspaceId() && e.activeRunId() === r && (e.setActiveRun(s.id), e.resetDraft(), e.restoreDraft(s), e.publish()), t;
				}
				if (o !== e.workspaceId() || e.activeRunId() !== r) return;
				await n(), o === e.workspaceId() && e.publish();
			} finally {
				t.finish(i);
			}
		});
	}
	async function u() {
		let t = e.activeRunId();
		if (t) return e.mutate(async () => {
			if (e.hasExternalLock()) throw Error(e.externalLockMessage);
			e.flushDraft();
			let r = await e.request(`/api/workspaces/${e.workspaceId()}/agent/runs/${t}/resume`, { method: "POST" });
			e.setActiveRun(r.run.id), e.restoreDraft(r.run), e.setHistoryOpen(!1), await n(), e.publish(), e.toast("Agent session resumed.");
		});
	}
	async function d(t, n, r) {
		if (!t || !n) return;
		let i = e.workspaceId();
		await e.request(`/api/workspaces/${i}/agent/runs/${t}/approval`, {
			method: "POST",
			body: JSON.stringify({
				requestId: n,
				...r
			})
		}), i === e.workspaceId() && (await e.reloadRuns(), e.publish());
	}
	async function f(n, r) {
		let i = `${r?.workspaceId || "workspace"}:${r?.runId || "run"}`;
		if (t.isSending(i) || !String(n || "").trim()) return {
			accepted: !1,
			clear: !1
		};
		let a = e.currentRun();
		if (!a) return {
			accepted: !1,
			clear: !1
		};
		e.restoreDraft(a);
		let o = e.currentDraft();
		if (r.workspaceId !== e.workspaceId() || r.runId !== e.activeRunId() || r.draftKey !== o.key) throw Error("The selected Workspace or Session changed before the message could be sent.");
		e.updateDraft(n);
		let s = e.currentDraft().version;
		if (!t.startSending(i)) return {
			accepted: !1,
			clear: !1
		};
		try {
			if (e.hasExternalLock()) throw Error(e.externalLockMessage);
			let t = e.currentRun();
			if (!t || r.runId !== t.id || r.resourceId !== (t.resourceId || "")) throw Error("The selected Workspace or Session changed before the message could be sent.");
			let i = {
				text: n,
				userName: e.userName()
			};
			Object.assign(i, e.inputSelfDrivingProjection(t) || {});
			let a = await e.request(`/api/workspaces/${r.workspaceId}/agent/runs/${r.runId}/input`, {
				method: "POST",
				body: JSON.stringify(i)
			}), o = !1;
			if (a?.status === "accepted") {
				o = e.clearDraftAfterAccepted({
					workspaceId: r.workspaceId,
					runId: r.runId,
					key: r.draftKey,
					text: n,
					version: s
				}), o && e.bumpDraftResetVersion();
				try {
					await e.refreshInputProjection(r.workspaceId, r.resourceId);
				} catch (t) {
					e.toast(`Message accepted, but the view could not refresh: ${Fi(t)}`);
				}
			}
			return {
				accepted: a?.status === "accepted",
				clear: o
			};
		} finally {
			t.stopSending(i);
		}
	}
	return {
		setSelfDriving: r,
		start: i,
		stopSession: o,
		disableSelfDriving: s,
		stopTurn: c,
		switchRun: l,
		closeRun: a,
		resume: u,
		resolveApproval: d,
		send: f
	};
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function Li(e) {
	let t = /* @__PURE__ */ new Set();
	return String(e || "").split(",").map((e) => e.trim().toLowerCase()).filter((e) => !e || t.has(e) ? !1 : (t.add(e), !0));
}
function Ri(e) {
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
		selfDriving: !1,
		agentName: "",
		preferredAgentProfiles: [],
		prompt: "",
		completionCriteria: "",
		submitting: !1
	};
}
function zi(e) {
	return {
		project: e.projectId,
		title: e.templateName ? e.titleOverride ? e.title : "" : e.title,
		...e.templateName ? {
			templateName: e.templateName,
			templateFields: e.templateFields,
			...e.templateDigest ? { expectedTemplateDigest: e.templateDigest } : {}
		} : { detail: e.detail },
		slug: e.slug,
		selfDriving: e.selfDriving,
		agentName: e.selfDriving ? e.agentName : "",
		preferredAgentProfiles: e.selfDriving ? e.preferredAgentProfiles : [],
		prompt: e.selfDriving ? e.prompt : "",
		completionCriteria: e.selfDriving ? e.completionCriteria : ""
	};
}
function Bi(e) {
	let t = 0, n = Ri(t), r = 0, i = null, a = "";
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
			selfDriving: e.selfDriving,
			agentName: e.agentName,
			agentProfiles: e.preferredAgentProfiles.join(", "),
			prompt: e.prompt,
			completionCriteria: e.completionCriteria,
			activeTab: e.activeTab,
			editedMarkdown: e.editedMarkdown,
			showOptions: e.showOptions
		};
	}
	function s(e) {
		return {
			...e,
			templateFields: { ...e.templateFields },
			preferredAgentProfiles: Li(e.agentProfiles)
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
			agents: e.agents(),
			profileKeys: e.profileKeys(),
			preview: t.preview,
			previewKey: t.previewKey,
			previewing: t.previewing,
			previewError: t.previewError,
			templateDigest: t.templateDigest,
			submitting: t.submitting,
			onClose: f,
			onPreview: p,
			onSubmit: m,
			previewRequestKey: (e) => JSON.stringify(zi({
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
			...Ri(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = Ri(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = zi({
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
			n.previewError = Fi(e);
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
			if (n.type === "project") await e.request(`/api/workspaces/${i}/projects`, {
				method: "POST",
				body: JSON.stringify({
					description: n.description,
					slug: n.slug
				})
			}), e.toast("Project created."), e.selectWorkspaceResource();
			else {
				let t, r = n.templateName && n.editedMarkdown != null && n.editedMarkdown !== n.preview?.markdown ? n.editedMarkdown : null;
				if (r != null) {
					let e = String(n.titleOverride ? n.title : n.preview?.title || "").trim();
					if (!e) throw Error("Task title is required when creating from edited preview content.");
					t = {
						project: n.projectId,
						title: e,
						taskMarkdown: r,
						slug: n.slug,
						selfDriving: n.selfDriving,
						agentName: n.selfDriving ? n.agentName : "",
						preferredAgentProfiles: n.selfDriving ? n.preferredAgentProfiles : [],
						prompt: n.selfDriving ? n.prompt : "",
						completionCriteria: n.selfDriving ? n.completionCriteria : ""
					};
				} else {
					if (n.templateName && !n.templateDigest && (await p(o()), !n.templateDigest)) throw Error(n.previewError || "Could not render the selected template.");
					t = zi(n);
				}
				await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				}), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1, n.identity = ++t, await e.reloadTree();
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(Fi(t)));
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
//#region src/controllers/notification-controller.ts
var Vi = "forge.gui.notifications.v1", Hi = `${Vi}.settings`, Ui = 1;
function Wi(e) {
	let t = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: "tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
		audioContext: null,
		soundError: "",
		permissionError: ""
	};
	function n() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function r(e = t.workspaceId) {
		let n = String(e || "").trim();
		return n ? `${Vi}.state.${encodeURIComponent(n)}` : "";
	}
	function i() {
		return {
			version: Ui,
			seen: [],
			pending: [],
			unread: [],
			effects: []
		};
	}
	function a(e) {
		if (!e || typeof e != "object") return null;
		let t = String(e.marker || "").trim(), n = String(e.sessionId || "").trim();
		return !t || !n ? null : {
			workspaceId: String(e.workspaceId || "").trim(),
			sessionId: n,
			runId: String(e.runId || "").trim(),
			resourceId: String(e.resourceId || "").trim(),
			marker: t,
			completionState: String(e.completionState || "completed").trim(),
			selfDriving: !!e.selfDriving,
			selfDrivingState: String(e.selfDrivingState || "").trim(),
			title: String(e.title || "").trim(),
			resourceType: String(e.resourceType || "").trim(),
			resourceTitle: String(e.resourceTitle || "").trim(),
			at: Number(e.at) || Date.now()
		};
	}
	function o(e) {
		if (!e || e.version !== Ui) return i();
		let t = Array.isArray(e.seen) ? e.seen.map((e) => ({
			marker: String(e?.marker || "").trim(),
			at: Number(e?.at) || Date.now()
		})).filter((e) => e.marker) : [], n = Array.isArray(e.pending) ? e.pending.map(a).filter(Boolean) : [], r = Array.isArray(e.unread) ? e.unread.map(a).filter(Boolean) : [], o = Array.isArray(e.effects) ? e.effects.map((e) => ({
			key: String(e?.key || "").trim(),
			at: Number(e?.at) || Date.now()
		})).filter((e) => e.key) : [];
		return {
			version: Ui,
			seen: t.slice(-2e3),
			pending: n.slice(-200),
			unread: r.slice(-200),
			effects: o.slice(-2e3)
		};
	}
	function s(e = t.workspaceId) {
		let a = n(), s = r(e);
		if (!a || !s) return i();
		try {
			let e = a.getItem(s);
			if (!e) return i();
			let t = JSON.parse(e);
			return !t || t.version !== Ui ? (a.removeItem(s), i()) : o(t);
		} catch {
			try {
				a.removeItem(s);
			} catch {}
			return i();
		}
	}
	function c() {
		let e = n(), i = r();
		if (!(!e || !i || !t.store)) {
			t.store = o(t.store);
			try {
				e.setItem(i, JSON.stringify(t.store));
			} catch {}
		}
	}
	function l() {
		let e = {
			browser: !1,
			sound: !1
		}, t = n();
		if (!t) return e;
		try {
			let n = JSON.parse(t.getItem(Hi) || "null");
			return !n || n.version !== Ui ? e : {
				browser: !!n.browser,
				sound: !!n.sound
			};
		} catch {
			try {
				t.removeItem(Hi);
			} catch {}
			return e;
		}
	}
	function u() {
		let e = n();
		if (!(!e || !t.settings)) try {
			e.setItem(Hi, JSON.stringify({
				version: Ui,
				browser: !!t.settings.browser,
				sound: !!t.settings.sound
			}));
		} catch {}
	}
	function d() {
		if (window.Notification === void 0) return "unsupported";
		let e = String(window.Notification.permission || "default");
		return [
			"granted",
			"default",
			"denied"
		].includes(e) ? e : "default";
	}
	function f(e) {
		let n = String(e || "").trim();
		n && (m(), t.workspaceId = n, t.store = s(n), t.settings = l(), d() !== "granted" && (t.settings.browser = !1, u()), t.ready = !1, t.permissionError = "", p(n));
	}
	function p(e) {
		let n = window.BroadcastChannel || globalThis.BroadcastChannel;
		if (typeof n == "function") try {
			let r = new n(`${Vi}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => g(e.data), t.channel = r;
		} catch {
			t.channel = null;
		}
	}
	function m() {
		try {
			t.channel?.close();
		} catch {}
		t.channel = null;
	}
	function h(e) {
		try {
			t.channel?.postMessage({
				...e,
				workspaceId: t.workspaceId,
				sourceTabId: t.tabId
			});
		} catch {}
	}
	function g(n) {
		if (!n || n.workspaceId !== t.workspaceId || n.sourceTabId === t.tabId) return;
		let r = t.store || i();
		if (n.type === "effect" && n.effectKey) {
			r.effects.some((e) => e.key === n.effectKey) || (r.effects.push({
				key: n.effectKey,
				at: Number(n.at) || Date.now()
			}), t.store = r, c());
			return;
		}
		if (n.type === "record" && n.record) {
			let i = a(n.record);
			if (!i) return;
			if (r.seen.some((e) => e.marker === i.marker) || r.seen.push({
				marker: i.marker,
				at: i.at
			}), w(i)) {
				r.unread = r.unread.filter((e) => e.marker !== i.marker), r.pending = r.pending.filter((e) => e.marker !== i.marker), t.store = r, c(), h({
					type: "clear-resource",
					resourceId: i.resourceId
				}), e.hasTree() && e.renderSessions();
				return;
			}
			r.unread.some((e) => e.marker === i.marker) || r.unread.push(i), t.store = r, c(), e.hasTree() && (e.renderSessions(), e.refreshIcons());
			return;
		}
		if (n.type === "clear-marker" && n.marker) {
			r.unread = r.unread.filter((e) => e.marker !== n.marker), r.pending = r.pending.filter((e) => e.marker !== n.marker), t.store = r, c(), e.hasTree() && e.renderSessions();
			return;
		}
		if (n.type === "clear-resource" && n.resourceId) {
			let i = String(n.resourceId);
			r.unread = r.unread.filter((e) => e.resourceId !== i), r.pending = r.pending.filter((e) => e.resourceId !== i), t.store = r, c(), e.hasTree() && e.renderSessions();
		}
	}
	function _() {
		return t.store ||= i(), t.store;
	}
	function v(e) {
		let t = String(e?.completionMarker || e?.agentRunCompletionMarker || "").trim();
		if (t) return t;
		let n = String(e?.agentHubSessionId || e?.completionSessionId || "").trim(), r = Number(e?.completionEventId) || 0;
		return n && r > 0 ? `${n}:${r}` : "";
	}
	function y(e) {
		return String(e?.forgeSessionId || e?.sessionId || e?.agentHubSessionId || e?.id || "").trim();
	}
	function b(t) {
		return t?.source === "internal" || t?.source === "external" ? e.sessionNavigationTarget(t).primaryResourceId || "" : t?.resourceId ? String(t.resourceId).trim() : Array.isArray(t?.controls) && t.controls.length === 1 ? String(t.controls[0]?.resourceId || "").trim() : "";
	}
	function x(e) {
		switch (e?.type) {
			case "turn.failed": return "failed";
			case "turn.cancelled": return "cancelled";
			case "turn.completed": return "completed";
			default: return "";
		}
	}
	function S(t, n) {
		let r = Number(t?.selfDrivingRevision) || 0;
		if (!(t?.schedulerTurn || r > 0)) return {
			isSelfDriving: !1,
			state: "",
			final: !1,
			suppressed: !1
		};
		let i = e.findResource(n)?.selfDriving, a = String(i?.condition || "disabled").trim().toLowerCase(), o = !i?.enabled && i?.lastOutcome?.status === "completed", s = !!i?.enabled && [
			"blocked",
			"error",
			"needs_configuration"
		].includes(a), c = !i?.enabled && !o, l = o || s;
		return {
			isSelfDriving: !0,
			state: a,
			final: l,
			suppressed: !l,
			disabledControl: c
		};
	}
	function C(n, r, i = "") {
		let o = b(n), s = e.findResource(o), c = S(n, o);
		return a({
			workspaceId: t.workspaceId,
			sessionId: y(n),
			runId: String(n?.runId || n?.agentRunId || n?.id || "").trim(),
			resourceId: o,
			marker: r,
			completionState: i || n?.completionState || "completed",
			selfDriving: c.isSelfDriving,
			selfDrivingState: c.state,
			title: s?.title || n?.title || n?.agentRunTitle || n?.id || "Session",
			resourceType: s?.type || "",
			resourceTitle: s?.title || "",
			at: Date.now()
		});
	}
	function w(t) {
		return !t?.resourceId || e.selectedResourceId() !== t.resourceId ? !1 : T();
	}
	function T() {
		let e = document.visibilityState ? document.visibilityState === "visible" : !document.hidden, t = typeof document.hasFocus != "function" || document.hasFocus();
		return e && !document.hidden && t;
	}
	function E(e, t) {
		return `${e.marker}:${t}`;
	}
	function ee() {
		let e = s(), n = _(), r = /* @__PURE__ */ new Map();
		for (let t of [...e.effects, ...n.effects]) t?.key && r.set(t.key, t);
		n.effects = [...r.values()].slice(-2e3), t.store = n;
	}
	function te(e, n) {
		let r = E(e, n), i = _();
		return !i.effects.some((e) => e.key === r) && (i.effects.push({
			key: r,
			at: Date.now()
		}), t.store = i, c(), h({
			type: "effect",
			effectKey: r,
			at: Date.now()
		}), !0);
	}
	function ne(e, n, r) {
		let i = typeof navigator < "u" ? navigator.locks : null, a = () => {
			ee(), te(e, n) && r();
		};
		if (!i || typeof i.request != "function") {
			a();
			return;
		}
		try {
			Promise.resolve(i.request(`forge.gui.notification.${t.workspaceId}.${E(e, n)}`, { ifAvailable: !0 }, (e) => {
				e && a();
			})).catch((e) => {
				console.warn("notification effect lock unavailable", e), a();
			});
		} catch (e) {
			console.warn("notification effect lock unavailable", e), a();
		}
	}
	function re(e) {
		return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.sessionId}`;
	}
	function ie(e) {
		return e.selfDriving ? `Self-Driving ${e.selfDrivingState || "finished"}.` : e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
	}
	function ae() {
		if (!t.settings?.sound) return;
		let n = window.AudioContext || window.webkitAudioContext;
		if (typeof n != "function") {
			t.soundError = "Audio is unavailable in this browser.", e.notificationsSettingsVisible() && e.renderSettings();
			return;
		}
		try {
			let r = t.audioContext || new n();
			t.audioContext = r;
			let i = () => {
				let e = r.createOscillator(), t = r.createGain();
				e.type = "sine", e.frequency.setValueAtTime(880, r.currentTime), e.frequency.exponentialRampToValueAtTime(660, r.currentTime + .12), t.gain.setValueAtTime(1e-4, r.currentTime), t.gain.exponentialRampToValueAtTime(.08, r.currentTime + .01), t.gain.exponentialRampToValueAtTime(1e-4, r.currentTime + .16), e.connect(t), t.connect(r.destination), e.start(), e.stop(r.currentTime + .18);
			};
			r.state === "suspended" ? r.resume().then(i).catch((n) => {
				t.soundError = "Chrome blocked completion sound until audio is enabled by the page.", console.warn("completion sound unavailable", n), e.notificationsSettingsVisible() && e.renderSettings();
			}) : i();
		} catch (n) {
			t.soundError = "Completion sound is unavailable right now.", console.warn("completion sound unavailable", n), e.notificationsSettingsVisible() && e.renderSettings();
		}
	}
	function oe(e, n = !1) {
		if (!(!t.settings?.browser || d() !== "granted") && !(!n && !te(e, "browser"))) try {
			let t = new window.Notification(re(e), {
				body: ie(e),
				tag: `forge-${e.marker}`,
				icon: "/favicon.svg"
			});
			t.onclick = () => {
				try {
					window.focus();
				} catch {}
				be(e).catch((e) => console.warn("notification navigation failed", e));
			};
		} catch (e) {
			console.warn("browser notification unavailable", e);
		}
	}
	function se(e) {
		t.settings?.browser && d() === "granted" && ne(e, "browser", () => oe(e, !0)), t.settings?.sound && ne(e, "sound", ae);
	}
	function ce(n, r = "") {
		let i = v(n), a = y(n);
		if (!i || !a || !t.workspaceId) return !1;
		let o = C(n, i, r);
		if (!o?.sessionId) return !1;
		let s = _(), l = s.seen.some((e) => e.marker === i), u = s.pending.findIndex((e) => e.marker === i), d = S(n, o.resourceId);
		return t.ready ? l && u < 0 ? !1 : d.isSelfDriving && d.state === "waiting" ? (l || s.seen.push({
			marker: i,
			at: Date.now()
		}), s.pending = s.pending.filter((e) => e.marker !== i), t.store = s, c(), !1) : d.isSelfDriving && d.disabledControl ? (l || s.seen.push({
			marker: i,
			at: Date.now()
		}), s.pending = s.pending.filter((e) => e.marker !== i), s.unread = s.unread.filter((e) => e.marker !== i), t.store = s, c(), !1) : d.isSelfDriving && d.suppressed && !d.final ? (l || s.seen.push({
			marker: i,
			at: Date.now()
		}), u < 0 && s.pending.push(o), t.store = s, c(), !1) : (l || s.seen.push({
			marker: i,
			at: Date.now()
		}), s.pending = s.pending.filter((e) => e.marker !== i), w(o) ? (t.store = s, c(), !1) : (s.unread = s.unread.filter((e) => e.marker !== i), s.unread.push(o), t.store = s, c(), h({
			type: "record",
			record: o
		}), se(o), e.hasTree() && (e.renderSessions(), e.refreshIcons()), !0)) : (l || s.seen.push({
			marker: i,
			at: Date.now()
		}), s.pending = s.pending.filter((e) => e.marker !== i), t.store = s, c(), !1);
	}
	function le(e) {
		for (let t of e || []) v(t) && ce(t, t.completionState || t.agentRunCompletionState || "");
	}
	function ue(e, t) {
		let n = x(e);
		if (!n || !e?.sessionId || !Number(e.id)) return;
		let r = `${e.sessionId}:${e.id}`;
		ce({
			...t || {},
			completionMarker: r,
			completionState: n,
			agentHubSessionId: t?.agentHubSessionId || e.sessionId
		}, n);
	}
	function de() {
		t.ready || (le(e.treeSessions()), le(e.agentRuns()), t.ready = !0, c());
	}
	function fe(e) {
		let t = String(e || "").trim();
		return !!(t && _().unread.some((e) => e.sessionId === t));
	}
	function pe(n) {
		let r = String(n || "").trim();
		if (!r) return;
		let i = _();
		(i.unread.some((e) => e.marker === r) || i.pending.some((e) => e.marker === r)) && (i.unread = i.unread.filter((e) => e.marker !== r), i.pending = i.pending.filter((e) => e.marker !== r), t.store = i, c(), h({
			type: "clear-marker",
			marker: r
		}), e.hasTree() && e.renderSessions());
	}
	function me(n) {
		let r = String(n || "").trim();
		if (!r) return;
		let i = _();
		(i.unread.some((e) => e.resourceId === r) || i.pending.some((e) => e.resourceId === r)) && (i.unread = i.unread.filter((e) => e.resourceId !== r), i.pending = i.pending.filter((e) => e.resourceId !== r), t.store = i, c(), h({
			type: "clear-resource",
			resourceId: r
		}), e.hasTree() && e.renderSessions());
	}
	function he() {
		u(), e.notificationsSettingsVisible() && e.renderSettings();
	}
	async function ge() {
		t.settings = t.settings || l();
		let e = d();
		if (e === "unsupported") return t.settings.browser = !1, t.permissionError = "Browser notifications are not supported here.", he(), e;
		if (e === "denied") return t.settings.browser = !1, t.permissionError = "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically.", he(), e;
		let n = e;
		if (e === "default") try {
			n = await window.Notification.requestPermission();
		} catch (e) {
			t.permissionError = "Chrome could not request notification permission.", console.warn("notification permission request failed", e);
		}
		return n === "granted" ? (t.settings.browser = !0, t.permissionError = "") : (t.settings.browser = !1, t.permissionError = n === "denied" ? "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically." : "Notification permission is still pending."), he(), n;
	}
	function _e(e) {
		if (t.settings = t.settings || l(), !e) {
			t.settings.browser = !1, t.permissionError = "", he();
			return;
		}
		ge().catch((e) => {
			t.settings && (t.settings.browser = !1), t.permissionError = "Chrome could not request notification permission.", console.warn("notification permission request failed", e), he();
		});
	}
	function ve() {
		let e = window.AudioContext || window.webkitAudioContext;
		if (typeof e != "function") return t.soundError = "Audio is unavailable in this browser.", he(), Promise.resolve(!1);
		try {
			t.audioContext = t.audioContext || new e();
			let n = t.audioContext.resume?.();
			return Promise.resolve(n).then(() => (t.soundError = "", he(), !0)).catch((e) => (t.soundError = "Chrome may block sound until the page receives an audio gesture.", console.warn("completion audio initialization failed", e), he(), !1));
		} catch (e) {
			return t.soundError = "Completion sound is unavailable right now.", console.warn("completion audio initialization failed", e), he(), Promise.resolve(!1);
		}
	}
	function ye(e) {
		t.settings = t.settings || l(), t.settings.sound = !!e, t.soundError = "", he(), e && ve();
	}
	async function be(t) {
		if (t?.resourceId) try {
			await e.selectResource(t.resourceId, {
				clearUnread: !1,
				forceDetail: !0
			}), t.runId && e.activateRun(t.runId);
		} finally {
			pe(t.marker);
		}
	}
	function xe() {
		e.scope.listen(window, "storage", (n) => {
			n.key === r() && n.newValue && (t.store = s(), e.hasTree() && e.renderSessions()), n.key === Hi && (t.settings = l(), d() !== "granted" && (t.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
		}), e.scope.listen(document, "visibilitychange", () => {
			e.flushDraft(), T() && me(e.selectedResourceId());
		}), e.scope.listen(window, "focus", () => me(e.selectedResourceId()));
	}
	function Se() {
		let e = t.settings || l();
		return t.settings = e, {
			browser: e.browser,
			sound: e.sound,
			permission: d(),
			permissionError: t.permissionError,
			soundError: t.soundError
		};
	}
	function Ce() {
		m();
		try {
			t.audioContext?.close();
		} catch {}
		t.audioContext = null;
	}
	return {
		initialize: f,
		install: xe,
		dispose: Ce,
		establishBaseline: de,
		observeProjections: le,
		observeEvent: ue,
		hasUnreadForSession: fe,
		clearResource: me,
		preferences: Se,
		setBrowserEnabled: _e,
		setSoundEnabled: ye
	};
}
//#endregion
//#region src/controllers/pane-layout-controller.ts
var Gi = "forge.gui.paneSizes", Ki = "forge.gui.mobileImmersive", qi = 8, Ji = 220, Yi = 360, Xi = 320, Zi = 1e4, Qi = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarSessionHeight: 210
}), $i = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarSessionHeight: "--sidebar-session-height"
});
function ea(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function ta(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function na(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...Qi };
	if (ta(n.sidebarWidth) && (r.sidebarWidth = ea(n.sidebarWidth, Ji, Zi)), ta(n.chatWidth)) r.chatWidth = ea(n.chatWidth, Xi, Zi);
	else if (ta(n.detailsWidth) && t >= 688) {
		let e = ea(n.detailsWidth, Yi, t - qi - Xi);
		r.chatWidth = ea(t - qi - e, Xi, Zi);
	}
	return ta(n.sidebarSessionHeight) && (r.sidebarSessionHeight = ea(n.sidebarSessionHeight, 84, Zi)), r;
}
function ra(e, t = window.localStorage) {
	let n = { ...Qi }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = window.matchMedia("(max-width: 980px)");
	function a() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Gi) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function o() {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}
	function s(e, t) {
		document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
	}
	function c(e, t) {
		if (!Object.hasOwn($i, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(ea(t, r === "sidebarWidth" ? Ji : r === "chatWidth" ? Xi : 84, Zi));
		n[r] = i, s($i[r], i);
	}
	function l() {
		for (let e of Object.keys($i)) c(e, n[e]);
	}
	function u() {
		t?.setItem(Gi, JSON.stringify(n));
	}
	function d() {
		let e = a();
		n = na(e, 0), l(), ta(e.detailsWidth) && !ta(e.chatWidth) && !i.matches && (n = na(e, o()), l(), u());
		try {
			r.immersive = t?.getItem(Ki) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
	}
	function f(e) {
		if (!Object.hasOwn($i, e) || !t) return;
		let r = e, i = a();
		delete i.detailsWidth;
		for (let e of Object.keys($i)) ta(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(Gi, JSON.stringify(i));
	}
	function p() {
		if (i.matches) return;
		let e = a();
		!ta(e.detailsWidth) || ta(e.chatWidth) || (n = na(e, o()), l(), u());
	}
	function m(t) {
		r.sidebarOpen = !!t, document.body.classList.toggle("mobile-sidebar-open", r.sidebarOpen), e();
	}
	function h(t) {
		r.view = t === "chat" ? "chat" : "details", document.body.classList.toggle("mobile-chat-active", r.view === "chat"), e();
	}
	function g(n) {
		r.immersive = !!n, document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			t?.setItem(Ki, r.immersive ? "1" : "0");
		} catch {}
		e();
	}
	return {
		initialize: d,
		previewPane: c,
		commitPane: f,
		syncViewport: p,
		setMobileSidebar: m,
		setMobileView: h,
		setMobileImmersive: g,
		snapshot: () => ({
			paneSizes: { ...n },
			mobile: { ...r }
		})
	};
}
//#endregion
//#region src/controllers/resource-detail-controller.ts
function ia(e, t) {
	let n = Date.parse(String(e?.time || "")), r = Date.parse(String(t?.time || ""));
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t?.time || "").localeCompare(String(e?.time || ""));
}
function aa(e, t, n) {
	let r = [], i = /* @__PURE__ */ new Map(), a = (e, t) => {
		let n = String(e?.id || "");
		if (n && i.has(n)) {
			t && (r[i.get(n)] = e);
			return;
		}
		n && i.set(n, r.length), r.push(e);
	};
	for (let r of n ? t : e) a(r, !1);
	for (let r of n ? e : t) a(r, !n);
	return r.sort(ia);
}
function oa(e, t = 10, n = 20) {
	function r(t) {
		t && delete e.pages[t];
	}
	function i(t) {
		return e.pages[t] ||= {
			loaded: !1,
			hasMore: !1,
			nextCursor: "",
			loading: !1,
			error: "",
			requestVersion: 0
		};
	}
	function a(e) {
		return Array.isArray(e?.logs) && e.logs.length ? e.logs : Array.isArray(e?.logPage?.entries) ? e.logPage.entries : Array.isArray(e?.logs) ? e.logs : [];
	}
	function o(t) {
		let n = e.pages[t];
		return {
			detail: e.details[t] || null,
			page: n ? {
				loaded: n.loaded,
				hasMore: n.hasMore,
				nextCursor: n.nextCursor,
				loading: n.loading,
				error: n.error
			} : null
		};
	}
	function s(t, n = "head") {
		if (!t?.id) return null;
		let r = t.id, o = a(t), s = t.logPage || null, c = i(r);
		if (n === "replace" || !c.loaded || !e.details[r]) return c.loaded = !0, c.hasMore = !!s?.hasMore, c.nextCursor = String(s?.nextCursor || ""), c.error = "", e.details[r] = {
			...t,
			logs: aa([], o, !0),
			logPage: {
				hasMore: c.hasMore,
				nextCursor: c.nextCursor
			}
		}, e.details[r];
		let l = e.details[r], u = aa(l.logs || [], o, n !== "older");
		n === "older" && s && (c.hasMore = !!s.hasMore, c.nextCursor = String(s.nextCursor || "")), c.loaded = !0, c.error = "";
		let d = n === "older" ? l : {
			...l,
			...t
		};
		return e.details[r] = {
			...d,
			logs: u,
			logPage: {
				hasMore: c.hasMore,
				nextCursor: c.nextCursor
			}
		}, e.details[r];
	}
	function c(n, r = e.context().workspaceId, i = {}) {
		let a = new URLSearchParams(), o = i.logsCursor ?? i.cursor, s = i.logsLimit ?? i.limit ?? t;
		return a.set("logsLimit", String(s)), o != null && String(o) !== "" && a.set("logsCursor", String(o)), e.request(`/api/workspaces/${r}/resources/${encodeURIComponent(n)}?${a.toString()}`);
	}
	async function l(n, i = {}) {
		if (!n || n === "workspace" || e.details[n] && !i.force) return;
		i.force && (r(n), delete e.details[n]);
		let a = e.context(), o = e.nextDetailRequestVersion(), l = await c(n, a.workspaceId, { logsLimit: t }), u = e.context();
		return !e.isCurrentWorkspace(a.workspaceId, a.navigationVersion) || u.selectedId !== n || o !== u.detailRequestVersion ? null : s(l, "replace");
	}
	async function u(t = e.context().selectedId) {
		let r = e.context();
		if (!t || t === "workspace" || r.selectedId !== t) return;
		let a = i(t);
		if (!a.loaded || !a.hasMore || a.loading) return;
		let o = String(a.nextCursor || "");
		if (!o) {
			a.error = "The log page did not provide a continuation cursor.", e.render();
			return;
		}
		let l = ++a.requestVersion;
		a.loading = !0, a.error = "", e.render();
		try {
			let e = await c(t, r.workspaceId, {
				logsCursor: o,
				logsLimit: n
			});
			if (!d(r, t, a, l)) return;
			s(e, "older");
		} catch (e) {
			d(r, t, a, l) && (a.error = Fi(e, "Could not load older logs."));
		} finally {
			d(r, t, a, l) && (a.loading = !1, e.render(), e.refreshIcons());
		}
	}
	function d(t, n, r, i) {
		let a = e.context();
		return e.isCurrentWorkspace(t.workspaceId, t.navigationVersion) && a.selectedId === n && e.pages[n] === r && i === r.requestVersion;
	}
	return {
		reset: r,
		page: i,
		snapshot: o,
		apply: s,
		fetch: c,
		load: l,
		loadMore: u
	};
}
//#endregion
//#region src/controllers/route-controller.ts
function sa(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function ca(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: sa(t[1]),
		resourceId: t[2] === "r" ? sa(t[3]) : "workspace"
	} : {};
}
function la(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function ua(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = la(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => ca(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/controllers/settings-controller.ts
function da(e, t) {
	let n = t?.catalog || {}, r = new Map((n.agents || []).map((e) => [e.name, e])), i = (e.agents || []).map((e) => ({
		...e,
		...r.get(e.name || e.id),
		id: e.id || e.name
	}));
	return {
		...e,
		agents: i,
		agentHubProviders: n.providers || [],
		agentProfiles: t.config?.agentProfiles || []
	};
}
function fa(e) {
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
		let t = e.config(), r = n.data || {
			workspaces: t.workspaces,
			activeId: e.activeWorkspaceId(),
			agents: t.agents,
			agentProfiles: t.agentProfiles
		}, i = r.agentHub || {}, o = i.status || {}, c = i.catalog || {};
		e.publish({
			open: n.open,
			identity: `${n.identity}`,
			dataVersion: n.dataVersion,
			initialTab: n.tab,
			workspaces: r.workspaces || [],
			activeWorkspaceId: r.activeId || e.activeWorkspaceId(),
			workspaceIcons: e.workspaceIcons,
			workspaceIconSavingId: n.workspaceIconSavingId,
			userName: e.userName(),
			agentHub: {
				configuredEndpoint: i.configuredEndpoint || "http://127.0.0.1:4646",
				connected: !!i.connected,
				compatible: !!i.compatible,
				error: i.error || "",
				apiVersion: o.apiVersion || "",
				version: o.version || "",
				capabilities: o.capabilities || [],
				providers: c.providers || [],
				agents: c.agents || []
			},
			profiles: (r.agentProfiles || []).map((e) => ({ ...e })),
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
		}), await o(), e.setConfig(da(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: da
	};
}
//#endregion
//#region src/controllers/user-settings-controller.ts
var pa = "forge.gui.user.v1", ma = 1, ha = 80;
function ga(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, ha).join("") || "User";
}
function _a(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== ma ? "User" : ga(t.name);
	} catch {
		return "User";
	}
}
function va(e, t) {
	let n = r();
	function r() {
		try {
			return _a(window.localStorage.getItem(pa));
		} catch {
			return "User";
		}
	}
	function i(e) {
		let t = ga(e);
		try {
			window.localStorage.setItem(pa, JSON.stringify({
				version: ma,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return n = t, n;
	}
	return e.listen(window, "storage", (e) => {
		e.key === pa && (n = _a(e.newValue), t());
	}), {
		current: () => n,
		save: i
	};
}
//#endregion
//#region src/api/client.ts
var ya = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, ba = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, xa = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new ba(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new ba(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new ba(e.scope));
		this.active.clear();
	}
}, Sa = class {
	requests = new xa();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: wa(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: wa(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof ba) ? new ba(n) : e;
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
			let n = Ca(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new ya(e.status, r, n);
		}
		return t;
	}
};
function Ca(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function wa(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new Sa();
//#endregion
//#region src/runtime/resource-scope.ts
var Ta = class {
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
}, Ea, Da = null, Z = {
	config: null,
	tree: null,
	details: {},
	resourceLogPages: {},
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
	sessionOrder: [],
	listDrag: null,
	expandedPaths: /* @__PURE__ */ new Set(),
	preview: null,
	diff: null,
	modalEnter: "",
	sessionMenu: null,
	taskOperationalStateKey: "",
	selfDrivingDialog: {
		open: !1,
		identity: 0,
		mode: "",
		resourceId: "",
		reuseRunId: "",
		reuseCurrentSession: !1,
		agentName: "",
		expectedRevision: 0,
		expectedCondition: "",
		runInstructions: "",
		completionCriteria: "",
		submitting: !1,
		error: "",
		unknown: !1,
		returnFocus: null
	},
	uploadDialog: {
		open: !1,
		identity: 0,
		runId: "",
		items: [],
		nextId: 1
	},
	autoRefreshTimer: null,
	autoRefreshInFlight: !1,
	autoRefreshVersion: 0,
	agentRunProjectionVersion: 0,
	treeRequestVersion: 0,
	navigationVersion: 0,
	detailRequestVersion: 0,
	workspaceAgentsRequestVersion: 0,
	previewRequestVersion: 0,
	diffRequestVersion: 0,
	agentSessionMutationCount: 0,
	iconRefreshScheduled: !1,
	agent: {
		runs: [],
		activeRunId: "",
		events: [],
		notices: [],
		stream: null,
		streamRunId: "",
		renderTimer: null,
		draftPrompt: "",
		ttyDraft: "",
		ttyMultiline: !1,
		ttyDraftKey: "",
		ttyDraftWorkspaceId: "",
		ttyDraftResourceId: "",
		ttyDraftRunId: "",
		ttyDraftVersion: 0,
		ttyDraftResetVersion: 0,
		skipTTYDraftSync: !1,
		agentName: "",
		optionsOpen: !1,
		agentChooserOpen: !1,
		historyOpen: !1,
		selfDrivingExpanded: !1,
		sessionActionsOpen: !1,
		eventsHasMore: !1,
		historyBeforeId: 0,
		loadingOlder: !1,
		toolGroupOpen: /* @__PURE__ */ new Map(),
		approvalDrafts: /* @__PURE__ */ new Map(),
		selfDrivingFinishNoticeWatermarks: /* @__PURE__ */ new Map(),
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
function Oa() {
	for (let e of Object.keys(Z.details)) delete Z.details[e];
	for (let e of Object.keys(Z.resourceLogPages)) delete Z.resourceLogPages[e];
}
var ka = Pi(() => {
	zl && (uc(), bc(), kl());
}), Aa = Ii({
	operations: ka,
	workspaceId: () => Z.activeWorkspaceId,
	selectedResource: () => ul(Z.selectedId),
	taskDetail: () => {
		let e = ul(Z.selectedId);
		return e ? Z.details[e.id] || e : null;
	},
	currentRun: () => Jc(),
	runs: () => Z.agent.runs,
	activeRunId: () => Z.agent.activeRunId,
	selectedAgent: () => bl(),
	enabledAgents: () => xl(),
	setAgentName: (e) => {
		Z.agent.agentName = e;
	},
	setActiveRun: (e) => {
		Z.agent.activeRunId = e;
	},
	setHistoryOpen: (e) => {
		Z.agent.historyOpen = e;
	},
	closeAgentMenus: () => {
		Z.agent.optionsOpen = !1, Z.agent.agentChooserOpen = !1, Z.agent.historyOpen = !1;
	},
	resetDraft: () => {
		Z.agent.draftPrompt = "", vo();
	},
	flushDraft: bo,
	restoreDraft: (e) => yo(e),
	currentDraft: () => ({
		key: Z.agent.ttyDraftKey,
		text: Z.agent.ttyDraft,
		version: Z.agent.ttyDraftVersion
	}),
	updateDraft: (e) => _o(e),
	clearDraftAfterAccepted: (e) => xo(e),
	bumpDraftResetVersion: () => {
		Z.agent.ttyDraftResetVersion++;
	},
	userName: so,
	workspaceName: vl,
	defaultCwd: tl,
	hasExternalLock: cs,
	externalLockMessage: "This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.",
	isLive: Yc,
	isTurnInterruptible: Xc,
	inputSelfDrivingProjection: Ic,
	mutate: (e) => tc(e),
	request: (e, t) => So(e, t),
	reloadRuns: async () => {
		await Js();
	},
	refreshTree: async () => {
		await $s();
	},
	fetchDetail: (e, t) => Eo(e, t, { logsLimit: La }),
	applyDetail: (e) => {
		ko(e, "head");
	},
	refreshInputProjection: async (e, t) => {
		await ec(e, t);
	},
	publish: Io,
	renderAgent: uc,
	renderComposer: bc,
	refreshIcons: kl,
	toast: Ol
}), ja = ra(() => qo()), Ma = ua(() => qo()), Na = oa({
	details: Z.details,
	pages: Z.resourceLogPages,
	context: () => ({
		workspaceId: Z.activeWorkspaceId,
		navigationVersion: Z.navigationVersion,
		selectedId: Z.selectedId,
		detailRequestVersion: Z.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++Z.detailRequestVersion,
	isCurrentWorkspace: (e, t) => Ro(e, t),
	request: (e, t) => So(e, t),
	render: Ns,
	refreshIcons: kl
}), Pa = Bi({
	workspaceId: () => Z.activeWorkspaceId,
	templates: (e) => Z.details[e]?.templates || [],
	agents: Za,
	profileKeys: () => (Z.config?.agentProfiles || []).map((e) => e.key),
	request: (e, t) => So(e, t),
	publish: (e) => Ea.renderCreateDialog(e),
	toast: Ol,
	reloadTree: () => wo(),
	selectWorkspaceResource: () => {
		Z.selectedId = "workspace";
	},
	onOpen: () => {
		Z.modalEnter = "create";
	},
	onIconsChanged: kl,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
}), Fa = (e) => document.getElementById(e), Ia = 5e3, La = 10, Ra = 6e4, za = "This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.", Ba = "self-driving-finish", Va = "until-reconcile", Ha = /* @__PURE__ */ new Set([
	"waiting",
	"blocked",
	"error"
]), Ua = /* @__PURE__ */ new Set(["session.launch-environment"]), Wa = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering"
]), Ga = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, Ka = [
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
], qa = new Map(Ka.map((e) => [e.id, e])), Ja = 0, Ya = 0, Xa = fa({
	config: () => Z.config || {
		workspaces: [],
		agents: [],
		agentProfiles: []
	},
	setConfig: (e) => {
		Z.config = e;
	},
	activeWorkspaceId: () => Z.activeWorkspaceId,
	setActiveWorkspaceId: (e) => {
		Z.activeWorkspaceId = e;
	},
	selectWorkspaceResource: () => {
		Z.selectedId = "workspace";
	},
	request: (e, t) => So(e, t),
	publish: (e) => Ea.renderSettings(e),
	agentOptions: Za,
	workspaceIcons: [Ga, ...Ka],
	userName: so,
	saveUser: (e) => {
		if (!eo) throw Error("User settings are unavailable.");
		return eo.save(e);
	},
	notificationPreferences: () => $a?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => $a?.setBrowserEnabled(e),
	setCompletionSound: (e) => $a?.setSoundEnabled(e),
	flushDraft: bo,
	resetAgentState: ic,
	reloadWorkspaceContext: async () => {
		await Mo(), await wo();
	},
	clearWorkspaceContext: () => {
		Z.tree = null, Oa(), Io();
	},
	renderWorkspace: Ho,
	renderAgentViews: () => {
		yl(), uc(), bc();
	},
	toast: Ol,
	onIconsChanged: kl
});
function Za() {
	return xl().map((e) => ({
		id: e.id || "",
		label: Cc(e),
		summary: hc(e)
	}));
}
function Qa() {
	qo(), Ns(), cl(), Ac(), Vc(), bc(), uc(), vc(), Mc();
}
var $a = null, eo = null;
function to(e) {
	$a?.initialize(e);
}
function no() {
	$a?.establishBaseline();
}
function ro(e) {
	$a?.observeProjections(e);
}
function io(e, t) {
	$a?.observeEvent(e, t);
}
function ao(e) {
	return $a?.hasUnreadForSession(e) ?? !1;
}
function oo(e) {
	$a?.clearResource(e);
}
function so() {
	return eo?.current() || "User";
}
var co = Ni();
function lo(e, t = Z.activeWorkspaceId) {
	return co.keyForRun(e, t);
}
function uo(e) {
	return co.read(e);
}
function fo(e) {
	co.remove(e);
}
function po(e, t) {
	let n = /* @__PURE__ */ new Set();
	Z.agent.ttyDraftWorkspaceId === e && Z.agent.ttyDraftResourceId === t && Z.agent.ttyDraftKey && n.add(Z.agent.ttyDraftKey);
	for (let r of Z.agent.runs || []) {
		if (Mi(r.resourceId) !== t) continue;
		let i = lo(r, e);
		i && n.add(i);
	}
	return n;
}
function mo(e = Z.activeWorkspaceId, t = Z.agent.ttyDraftResourceId) {
	let n = String(e || "").trim(), r = Mi(t);
	n && co.prune(n, r, po(n, r));
}
function ho(e, t, n) {
	co.write(e, t, n);
}
function go() {
	let e = Z.agent.ttyDraftKey;
	e && (ho(e, Z.agent.ttyDraft, {
		workspaceId: Z.agent.ttyDraftWorkspaceId,
		resourceId: Z.agent.ttyDraftResourceId,
		runId: Z.agent.ttyDraftRunId,
		sessionId: ji(Jc())
	}), mo(Z.agent.ttyDraftWorkspaceId, Z.agent.ttyDraftResourceId));
}
function _o(e, t = !0) {
	let n = String(e ?? "");
	Z.agent.ttyDraft !== n && (Z.agent.ttyDraft = n, Z.agent.ttyDraftVersion++), Z.agent.ttyMultiline = n.includes("\n"), t && go();
}
function vo() {
	Z.agent.ttyDraft = "", Z.agent.ttyMultiline = !1, Z.agent.ttyDraftKey = "", Z.agent.ttyDraftWorkspaceId = "", Z.agent.ttyDraftResourceId = "", Z.agent.ttyDraftRunId = "", Z.agent.ttyDraftVersion++;
}
function yo(e, t = Z.activeWorkspaceId) {
	let n = lo(e, t);
	if (!n) {
		vo();
		return;
	}
	Z.agent.ttyDraftKey !== n && (Z.agent.ttyDraftKey = n, Z.agent.ttyDraftWorkspaceId = String(t || "").trim(), Z.agent.ttyDraftResourceId = Mi(e.resourceId), Z.agent.ttyDraftRunId = String(e.id || ""), Z.agent.ttyDraft = uo(n), Z.agent.ttyMultiline = Z.agent.ttyDraft.includes("\n"), Z.agent.ttyDraftVersion++, mo(Z.agent.ttyDraftWorkspaceId, Z.agent.ttyDraftResourceId));
}
function bo() {
	go();
}
function xo({ workspaceId: e, runId: t, key: n, text: r, version: i }) {
	return Z.activeWorkspaceId !== e || Z.agent.activeRunId !== t || Z.agent.ttyDraftKey !== n || Z.agent.ttyDraft !== r || Z.agent.ttyDraftVersion !== i ? !1 : (fo(n), _o("", !1), !0);
}
async function So(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		throw new ya(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function Co() {
	let e = hl(), [t, n] = await Promise.all([So("/api/workspaces"), So("/api/settings/agenthub")]);
	Z.config = Tl(t, n), yl(), Z.activeWorkspaceId = gl(e.workspaceId) ? e.workspaceId || "" : Z.config?.activeId || Z.config?.workspaces[0]?.id || "", Z.selectedId = e.resourceId || "workspace", Ho(), Z.activeWorkspaceId ? (to(Z.activeWorkspaceId), await Mo(), !e.resourceId && Z.lastResourceId && (Z.selectedId = Z.lastResourceId), await wo({ replaceURL: !0 })) : (Z.navigationLoading = !1, Z.tree = null, Oa(), Z.workspaceAgents = null, Z.preview = null, Z.diff = null, ic(), Io());
}
async function wo(e = {}) {
	if (!Z.activeWorkspaceId) return;
	let t = Z.activeWorkspaceId, n = Z.navigationVersion, r = ++Z.treeRequestVersion;
	Z.navigationLoading = !0, Z.navigationError = "", qo(), Z.detailRequestVersion++, Z.workspaceAgentsRequestVersion++, Z.previewRequestVersion++, Z.diffRequestVersion++;
	let i;
	try {
		i = await So(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw Ro(t, n, r) && (Z.navigationLoading = !1, Z.navigationError = Fi(e), qo()), e;
	}
	Ro(t, n, r) && (Z.tree = i, Oa(), Z.workspaceAgents = null, Z.workspaceAgentsSaving = !1, Z.preview = null, Z.diff = null, dl(), ml(!1), Z.selectedId === "workspace" ? await jo() : Z.selectedId && await To(Z.selectedId), Ro(t, n, r) && (await Js(), Ro(t, n, r) && (no(), Z.navigationLoading = !1, Z.navigationError = "", Io(), e.updateURL !== !1 && _l({ replace: !!e.replaceURL }))));
}
async function To(e, t = {}) {
	return Na.load(e, t);
}
function Eo(e, t = Z.activeWorkspaceId, n = {}) {
	return Na.fetch(e, t, n);
}
function Do(e) {
	Na.reset(e);
}
function Oo(e) {
	return Na.snapshot(e);
}
function ko(e, t = "head") {
	return Na.apply(e, t);
}
async function Ao(e = Z.selectedId) {
	await Na.loadMore(e);
}
async function jo(e = {}) {
	if (!Z.activeWorkspaceId || Z.workspaceAgents && !e.force) return;
	let t = Z.activeWorkspaceId, n = Z.navigationVersion, r = ++Z.workspaceAgentsRequestVersion;
	try {
		let e = await So(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!Ro(t, n) || r !== Z.workspaceAgentsRequestVersion) return null;
		Z.workspaceAgents = e;
	} catch (e) {
		if (!Ro(t, n) || r !== Z.workspaceAgentsRequestVersion) return null;
		Z.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: Fi(e)
		};
	}
	return Z.workspaceAgents;
}
async function Mo(e = Z.activeWorkspaceId, t = Z.navigationVersion) {
	let n = await So(`/api/workspaces/${e}/ui-state`);
	return Ro(e, t) ? (Z.expandedProjects = new Set(n.expandedProjects || []), Z.lastResourceId = n.lastResourceId || "", Z.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], Z.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, Z.sessionOrder = Array.isArray(n.sessionOrder) ? n.sessionOrder : [], !0) : !1;
}
async function No() {
	if (!Z.activeWorkspaceId) return;
	let e = Z.activeWorkspaceId, t = Z.navigationVersion, n = Z.selectedId;
	await So(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...Z.expandedProjects],
			lastResourceId: n,
			projectOrder: Z.projectOrder,
			taskOrder: Z.taskOrder,
			sessionOrder: Z.sessionOrder
		})
	}), Ro(e, t) && (Z.lastResourceId = n);
}
function Po() {
	Z.autoRefreshTimer ||= Da?.interval(() => {
		Fo().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, Ia) ?? null;
}
async function Fo() {
	if (!Z.activeWorkspaceId || Z.autoRefreshInFlight || Z.agentSessionMutationCount > 0 || Z.listDrag) return;
	let e = Z.autoRefreshVersion, t = Z.activeWorkspaceId, n = Z.navigationVersion, r = Z.selectedId;
	Z.autoRefreshInFlight = !0;
	try {
		let i = await Qs(t);
		if (!i || !zo(t, n, e)) return;
		let a = !El(Z.tree, i);
		if (a && (Z.tree = i), typeof ro == "function" && ro(i.sessions || []), a && Z.preview?.section === "Wiki" && !Z.preview.loading && (await Rs("Wiki", Z.preview.path), !zo(t, n, e))) return;
		dl() && (_l({ replace: !0 }), a = !0, r = Z.selectedId);
		let o = Z.expandedProjects.size;
		if (ml(!1), a ||= o !== Z.expandedProjects.size, Z.selectedId === "workspace") {
			let r = Z.workspaceAgents;
			if (await jo({ force: !0 }), !zo(t, n, e)) return;
			El(r, Z.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++Z.detailRequestVersion, o = await Eo(r, t, { logsLimit: La });
			if (!zo(t, n, e) || Z.selectedId !== r || i !== Z.detailRequestVersion) return;
			let s = Oo(r);
			ko(o, "head"), El(s, Oo(r)) || (a = !0);
		}
		Z.agentRunProjectionVersion = (Number(Z.agentRunProjectionVersion) || 0) + 1;
		let s = Z.agentRunProjectionVersion, c = await nc();
		if (!zo(t, n, e) || s !== Z.agentRunProjectionVersion) return;
		if (El(Z.agent.runs, c) || (Z.agent.runs = c, a = !0), typeof ro == "function" && ro(c), typeof qs == "function" && qs(c), Xs(c)) {
			if (!zo(t, n, e) || s !== Z.agentRunProjectionVersion) return;
			a = !0;
		}
		typeof qs == "function" && qs(Z.agent.runs), gs() !== Z.taskOperationalStateKey && (a = !0), a && Io();
	} finally {
		Z.autoRefreshInFlight = !1;
	}
}
function Io() {
	qo(), Ns(), uc(), vc(), kl(), cl(), Ac(), Mc();
}
function Lo() {
	qo(), Ns(), uc(), vc(), kl(), cl(), Ac();
}
function Ro(e, t, n = null) {
	return e === Z.activeWorkspaceId && t === Z.navigationVersion && (n == null || n === Z.treeRequestVersion);
}
function zo(e, t, n) {
	return Ro(e, t) && n === Z.autoRefreshVersion;
}
function Bo(e) {
	return qa.get(String(e?.icon || "").trim()) || Ga;
}
function Vo(e) {
	let t = Bo(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function Ho() {
	let e = Z.config?.workspaces?.find((e) => e.id === Z.activeWorkspaceId);
	Vo(e), qo();
}
function Uo(e) {
	if (!e) return "";
	let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
	return `#${n ? n[1] : t}`;
}
function Wo(e) {
	let t = (e?.statuses || []).map((e, t) => ({
		key: `${e.kind || e.iconName || "status"}:${t}`,
		className: e.className || "",
		iconName: e.iconName || "circle",
		recentOutput: !!e.recentOutput
	}));
	return {
		hasTaskState: !!e?.hasTaskState,
		className: e?.className || "",
		layoutClassName: e?.layoutClassName || "",
		slotClassName: e?.slotClassName || "",
		statuses: t,
		lock: e?.lock ? { className: e.lock.className || "" } : null
	};
}
function Go(e, t, n = "") {
	let r = $o(e), i = t === "project" && pl(e.id), a = t === "project" ? Yo(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: Uo(e.id),
		active: Z.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: Wo(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? xs(e.children || [], Z.taskOrder[e.id]).map((t) => Go(t, "task", e.id)) : [],
		projectId: n
	};
}
function Ko(e) {
	let t = Os(e), n = t.displayResourceId, r = e.source === "internal", i = r ? rs(e) : is("session-external", "session-status-external", "message-square", "External session active", "session"), a = ks(e), o = a ? $o(a) : Qo(), s = es(r && o.selfDriving ? [o.selfDriving, i] : [i]), c = ao(e.id), l = `${js(e, a, o, i)}${c ? ". Unread turn completion." : ""}`, u = r ? (Z.config?.agents || []).find((t) => t.id === e.agentRunAgentName) : null, d = [r ? "AgentHub" : "External"];
	return t.controls.length > 1 ? d.push(`${t.controls.length} locks`) : n && d.push(n), e.updatedAt && d.push(rl(e.updatedAt)), {
		id: e.id,
		source: e.source || "external",
		title: Ts(e, t),
		meta: d.join(" · "),
		label: r ? u?.name || e.agentRunAgentName || "AgentHub" : "External",
		statusLabel: l,
		status: Wo(s),
		unread: c,
		current: !!(Z.selectedId && Z.selectedId !== "workspace" && t.selectedResourceIds.includes(Z.selectedId)),
		clickable: !!(t.navigationResourceId || t.menu),
		navigationResourceId: t.navigationResourceId,
		menu: t.menu,
		controls: t.controls.map((e) => ({
			resourceId: e.resourceId,
			path: e.path || "",
			navigable: !!Ds(e.resourceId)
		}))
	};
}
function qo() {
	let e = Z.tree ? xs(Z.tree.projects || [], Z.projectOrder).map((e) => Go(e, "project")) : [], t = xs(Cs(Z.tree?.sessions || []), Z.sessionOrder).map(Ko);
	Z.tree && (Z.taskOperationalStateKey = gs()), Ea.renderAppShell({
		identity: Z.activeWorkspaceId || "no-workspace",
		loading: !!Z.navigationLoading,
		error: Z.navigationError || "",
		version: "v0.1.0",
		activeWorkspaceId: Z.activeWorkspaceId,
		workspaces: (Z.config?.workspaces || []).map((e) => ({
			id: e.id,
			name: e.name || e.id,
			path: e.path || "",
			icon: e.icon || "",
			iconSrc: Bo(e).src
		})),
		projects: e,
		sessions: t,
		...ja.snapshot(),
		route: Ma.projection(),
		onSwitchWorkspace: (e) => Jo(e),
		onAddWorkspace: () => wl("workspace").catch((e) => Ol(e.message)),
		onCreateProject: () => il(),
		onOpenSettings: () => wl().catch((e) => Ol(e.message)),
		onToggleProject: (e) => bs(e),
		onSelectResource: (e) => ys(e),
		onReorder: (e, t, n) => Zo(e, t, n),
		onDragState: (e) => {
			Z.listDrag = e;
		},
		onPanePreview: (e, t) => Ml(e, t),
		onPaneCommit: (e) => Nl(e),
		onPaneViewport: () => Pl(),
		onMobileSidebar: (e) => Fl(e),
		onMobileView: (e) => Il(e),
		onMobileImmersive: (e) => Ll(e),
		onHistoryNavigation: (e) => Ul(e),
		onToast: Ol,
		onIconsChanged: kl
	});
}
async function Jo(e) {
	if (!gl(e)) return;
	if (Z.workspaceMenuOpen = !1, e === Z.activeWorkspaceId) {
		Ho();
		return;
	}
	Fl(!1), bo(), Z.navigationVersion++, Z.autoRefreshVersion++, Z.treeRequestVersion++, Z.detailRequestVersion++, Z.workspaceAgentsRequestVersion++, Z.previewRequestVersion++, Z.diffRequestVersion++;
	let t = Z.navigationVersion;
	await No().catch((e) => console.warn("failed to save UI state", e)), Z.activeWorkspaceId = e, Z.selectedId = "workspace", Z.tree = null, Z.navigationLoading = !0, Z.navigationError = "", Oa(), to(e), Z.sessionMenu = null, Ls(), Z.workspaceAgentsSaving = !1, sl(), Z.selfDrivingDialog.open && !Z.selfDrivingDialog.submitting && kc(), ic(), Ho(), await Mo(e, t) && (Z.selectedId = Z.lastResourceId || "workspace", await wo());
}
function Yo(e) {
	let t = (Array.isArray(e?.children) ? e.children : []).filter((e) => e && e.archived !== !0), n = /* @__PURE__ */ new Set();
	for (let e of t) as(e.id).some(Xo) && n.add(e.id);
	let r = t.length, i = n.size, a = `${r} ${r === 1 ? "task" : "tasks"}`, o = `${i} running`;
	return {
		taskCount: r,
		runningCount: i,
		taskLabel: a,
		runningLabel: o,
		text: `${a} · ${o}`,
		ariaLabel: `Open tasks: ${a}; ${o}`
	};
}
function Xo(e) {
	return e?.source === "internal" && Wa.has(e.agentRunStatus);
}
async function Zo(e, t, n) {
	let r = {
		projectOrder: [...Z.projectOrder],
		taskOrder: Object.fromEntries(Object.entries(Z.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []])),
		sessionOrder: [...Z.sessionOrder]
	};
	if (e.kind === "session") Z.sessionOrder = Ss(xs(Cs(Z.tree?.sessions || []), Z.sessionOrder).map((e) => e.id), e.id, t.id, n);
	else if (e.kind === "task") {
		let r = ul(e.projectId);
		if (!r) return;
		let i = xs(r.children || [], Z.taskOrder[e.projectId]);
		Z.taskOrder = {
			...Z.taskOrder,
			[e.projectId]: Ss(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") Z.projectOrder = Ss(xs(Z.tree?.projects || [], Z.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	qo();
	try {
		await No();
	} catch (e) {
		throw Z.projectOrder = r.projectOrder, Z.taskOrder = r.taskOrder, Z.sessionOrder = r.sessionOrder, qo(), e;
	}
}
function Qo() {
	return {
		selfDriving: null,
		session: null,
		className: "",
		label: "",
		lock: null,
		statusPresentation: es([], null)
	};
}
function $o(e) {
	let t = as(e.id), n = os(e.id), r = ts(e.selfDriving), i = ns(t), a = fs(n), o = es([r, i], a);
	return {
		selfDriving: r,
		session: i,
		className: o.className,
		lock: a,
		statusPresentation: o,
		label: ms(e.selfDriving, t, a, {
			selfDriving: r,
			session: i
		})
	};
}
function es(e, t = null) {
	let n = (e || []).filter(Boolean), r = n.length > 0 || !!t;
	return {
		statuses: n,
		lock: t,
		hasTaskState: r,
		className: n.map((e) => e.className).filter(Boolean).join(" "),
		layoutClassName: r ? n.length > 1 ? "has-task-status-dual" : "has-task-status" : "",
		slotClassName: [
			n.length === 0 && t ? "task-status-lock-only" : "",
			n.length === 1 ? "task-status-single" : "",
			n.length > 1 ? "task-status-dual" : ""
		].filter(Boolean).join(" ")
	};
}
function ts(e) {
	if (!e || !e.enabled) return null;
	let t = e?.condition || "ready";
	return t === "error" ? is("error", "task-status-danger", "triangle-alert", "Self-Driving error", "self-driving") : t === "blocked" || t === "needs_configuration" ? is(t, "task-status-attention", "square", `Self-Driving ${t.replace(/_/g, " ")}`, "self-driving") : t === "waiting" ? is("waiting", "task-status-attention", "pause", "Self-Driving waiting", "self-driving") : t === "ready" ? is("ready", "task-status-queued", "clock", "Self-Driving ready", "self-driving") : is("unknown", "task-status-neutral", "circle-help", `Self-Driving ${t || "unknown"}`, "self-driving");
}
function ns(e) {
	let t = e.find((e) => e.agentRunStatus === "waiting_approval");
	if (t) return rs(t);
	let n = e.find((e) => e.agentRunStatus === "starting");
	if (n) return rs(n);
	let r = e.find((e) => e.agentRunStatus === "running");
	if (r) return rs(r);
	let i = e.find((e) => e.agentRunStatus === "stopping");
	if (i) return rs(i);
	let a = e.find((e) => e.agentRunStatus === "recovering");
	if (a) return rs(a);
	let o = e.find((e) => e.agentRunStatus === "idle");
	return o ? rs(o) : e.length > 0 ? rs(e[0]) : null;
}
function rs(e) {
	let t = e?.agentRunStatus || "";
	switch (t) {
		case "starting": return is("session-starting", "task-status-session-running", "loader-circle", "Session starting", "session", e);
		case "running": return is("session-running", "task-status-session-running", "loader-circle", "Session running", "session", e);
		case "waiting_approval": return is("session-approval", "task-status-attention", "shield-question", "Session waiting for approval", "session", e);
		case "stopping": return is("session-stopping", "task-status-session-stopping", "loader-circle", "Session stopping", "session", e);
		case "recovering": return is("session-recovering", "task-status-attention", "rotate-ccw", "Session recovering", "session", e);
		case "idle": return is("session-idle", "task-status-info", "message-square", "Session waiting for input", "session", e);
		default: return is("session-active", "task-status-neutral", "circle-dot", t ? `Session ${t}` : "Session active", "session", e);
	}
}
function is(e, t, n, r, i, a = null) {
	return {
		kind: e,
		className: t,
		iconName: n,
		label: r,
		dimension: i,
		recentOutput: !!(a && vs(a))
	};
}
function as(e) {
	return e ? (Z.tree?.sessions || []).filter((t) => t.resourceId === e || Es(t).some((t) => t.resourceId === e)) : [];
}
function os(e) {
	return e ? (Z.tree?.sessions || []).filter((t) => Es(t).some((t) => t.resourceId === e)) : [];
}
function ss() {
	let e = ul(Z.selectedId);
	if (!e || e.type !== "project" && e.type !== "task") return null;
	let t = Z.details?.[e.id];
	return t && t.type !== e.type ? null : e;
}
function cs() {
	let e = ss();
	return !!(e && os(e.id).some((e) => e.source === "external"));
}
function ls() {
	let e = ss();
	return !!(e && os(e.id).some((e) => e.source === "internal"));
}
function us() {
	return cs() || ls();
}
function ds() {
	us() && (Z.agent.agentChooserOpen = !1);
}
function fs(e) {
	if (e.length === 0) return null;
	let t = e.find((e) => e.source === "external"), n = t || e[0], r = e.length, i = ps(n);
	return {
		kind: t ? "external" : "internal",
		className: t ? "task-lock-external" : "task-lock-internal",
		label: r > 1 ? `Locked by ${r} sessions including ${i}` : `Locked by ${i}`
	};
}
function ps(e) {
	return e.source === "external" ? "an external session" : `${(Z.config?.agents || []).find((t) => t.id === e.agentRunAgentName)?.name || e.agentRunAgentName || "Forge GUI"} session`;
}
function ms(e, t, n, r) {
	let i = [];
	if (e && i.push(`Self-Driving ${e.enabled ? "on" : "off"}, ${e.condition}, revision ${e.revision}`), t.length === 1) i.push(hs(t[0]));
	else if (t.length > 1) {
		let e = [...new Set(t.map((e) => e.agentRunStatus || "open"))].join(", ");
		i.push(`${t.length} agent sessions: ${e}`);
	}
	return n && i.push(n.label), i.join(" · ");
}
function hs(e) {
	return `${e.schedulerTurn ? "Self-Driving session" : "Agent session"} ${(e.agentRunStatus || "open").replace("waiting_approval", "waiting for approval")}`;
}
function gs() {
	if (!Z.tree) return "";
	let e = [];
	for (let t of Z.tree.projects || []) {
		let n = $o(t), r = Yo(t);
		e.push(`${t.id}:auto=${_s(n.selfDriving)}:session=${_s(n.session)}:${n.lock?.kind || "none"}:${n.label}:tasks=${r.taskCount}:${r.runningCount}`);
		for (let n of t.children || []) {
			let t = $o(n);
			e.push(`${n.id}:auto=${_s(t.selfDriving)}:session=${_s(t.session)}:${t.lock?.kind || "none"}:${t.label}`);
		}
	}
	return e.join("|");
}
function _s(e) {
	return e ? `${e.kind}:${e.iconName}:${e.recentOutput}` : "none";
}
function vs(e) {
	let t = new Date(e.agentRunLastOutputAt || "").getTime();
	if (Number.isFinite(t)) return Date.now() - t <= Ra;
	if (!["running", "starting"].includes(e.agentRunStatus)) return !1;
	let n = new Date(e.agentRunUpdatedAt || "").getTime();
	return Number.isFinite(n) && Date.now() - n <= Ra;
}
async function ys(e, t = {}) {
	let n = Z.selectedId !== e;
	t.clearUnread !== !1 && oo(e);
	let r = n || !!t.forceDetail;
	r && (Z.navigationVersion++, Z.autoRefreshVersion++, Z.treeRequestVersion++, Z.detailRequestVersion++, Z.workspaceAgentsRequestVersion++, Z.previewRequestVersion++, Z.diffRequestVersion++, e !== "workspace" && (Do(e), delete Z.details[e])), n && (Z.selfDrivingDialog.open && !Z.selfDrivingDialog.submitting && kc(), Z.workspaceAgentsSaving = !1, bo(), zc(), Z.preview = null, Z.diff = null, ac(), Z.agent.runs = [], Z.agent.activeRunId = "", Z.agent.events = [], Z.agent.notices = [], Z.agent.historyBeforeId = 0, vo()), Z.selectedId = e, Z.sessionMenu = null, Fl(!1), ml(!1), _l(), No().catch((e) => console.warn("failed to save UI state", e)), Lo(), await Promise.all([e === "workspace" ? jo({ force: !!t.forceDetail }) : To(e, { force: r }), n ? Js() : Promise.resolve()]), Ro(Z.activeWorkspaceId, Z.navigationVersion) && Lo();
}
async function bs(e) {
	Z.expandedProjects.has(e) ? Z.expandedProjects.delete(e) : Z.expandedProjects.add(e), qo();
	try {
		await No();
	} catch (t) {
		throw Z.expandedProjects.has(e) ? Z.expandedProjects.delete(e) : Z.expandedProjects.add(e), qo(), t;
	}
}
function xs(e, t) {
	if (!Array.isArray(e)) return [];
	if (!Array.isArray(t) || t.length === 0) return e;
	let n = /* @__PURE__ */ new Map();
	return t.forEach((e, t) => {
		n.has(e) || n.set(e, t);
	}), e.map((e, t) => ({
		item: e,
		index: t
	})).sort((e, t) => {
		let r = n.has(e.item.id) ? n.get(e.item.id) : n.size + e.index, i = n.has(t.item.id) ? n.get(t.item.id) : n.size + t.index;
		return r === i ? e.index - t.index : r - i;
	}).map((e) => e.item);
}
function Ss(e, t, n, r) {
	if (!Array.isArray(e) || t === n) return e;
	let i = e.filter((e) => e !== t), a = i.indexOf(n);
	return a < 0 ? e : (r && (a += 1), i.splice(a, 0, t), i);
}
function Cs(e) {
	return e.map((e, t) => ({
		session: e,
		index: t
	})).sort((e, t) => {
		let n = Date.parse(e.session.startedAt || ""), r = Date.parse(t.session.startedAt || ""), i = Number.isFinite(n), a = Number.isFinite(r);
		return i && a && n !== r ? n - r : i === a ? e.session.id === t.session.id ? e.index - t.index : e.session.id < t.session.id ? -1 : 1 : i ? -1 : 1;
	}).map((e) => e.session);
}
function ws() {
	qo();
}
function Ts(e, t) {
	let n = (t && typeof t == "object" ? t : arguments.length > 1 ? { displayResourceId: t || "" } : Os(e)).displayResourceId || "", r = ul(n)?.title || "";
	return e.source === "internal" ? e.agentRunTitle || r || n || e.id : r || n || e.id;
}
function Es(e) {
	let t = (e?.controls || []).map((e) => ({
		resourceId: String(e?.resourceId || "").trim(),
		path: String(e?.path || "")
	})).filter((e) => e.resourceId);
	if (t.length === 0) {
		let t = String(e?.resourceId || "").trim();
		if (t) return [{
			resourceId: t,
			path: ""
		}];
	}
	return t;
}
function Ds(e) {
	let t = String(e || "").trim();
	if (!t) return "";
	let n = ul(t);
	return n && n.archived !== !0 ? t : "";
}
function Os(e) {
	let t = Es(e), n = String(e?.resourceId || "").trim();
	if (e?.source === "internal" && n) return {
		kind: "run",
		primaryResourceId: n,
		displayResourceId: n,
		navigationResourceId: Ds(n),
		selectedResourceIds: [n],
		controls: t,
		menu: !1
	};
	if (t.length === 1) {
		let e = t[0].resourceId;
		return {
			kind: "single-control",
			primaryResourceId: e,
			displayResourceId: e,
			navigationResourceId: Ds(e),
			selectedResourceIds: [e],
			controls: t,
			menu: !1
		};
	}
	return {
		kind: t.length > 1 ? "controls" : "none",
		primaryResourceId: "",
		displayResourceId: t[0]?.resourceId || "",
		navigationResourceId: "",
		selectedResourceIds: t.map((e) => e.resourceId),
		controls: t,
		menu: t.length > 1
	};
}
function ks(e) {
	if (!e || e.source !== "internal") return null;
	let t = String(e.resourceId || "").trim();
	if (t) return As(t);
	let n = Es(e);
	return n.length === 1 ? As(n[0].resourceId) : null;
}
function As(e) {
	let t = ul(e);
	return t && t.type === "task" && !t.archived ? t : null;
}
function js(e, t, n, r) {
	let i = [];
	if (t?.selfDriving && n?.selfDriving) {
		let e = `Self-Driving ${t.selfDriving.condition || "unknown"}`, n = Number.isFinite(t.selfDriving.revision) ? t.selfDriving.revision : "unknown";
		i.push(`${e}, revision ${n}`);
	}
	return r && i.push(r.label), i.length > 0 ? i.join(" · ") : e?.source === "external" ? "External session active" : "Session active";
}
function Ms() {
	let e = Z.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${Z.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: vl(),
		resourceId: Z.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		parent: null,
		loading: !1,
		detail: null,
		wiki: Z.tree?.wiki || null,
		workspaceAgents: Z.workspaceAgents,
		logs: {
			hasMore: !1,
			loading: !1,
			error: ""
		},
		onNavigate: (e) => Ps(e).catch((e) => Ol(e.message)),
		onCreateTask: (e) => al(e),
		onArchive: (e) => ll(e).catch((e) => Ol(e.message)),
		onLoadMoreLogs: (e) => Ao(e),
		onSaveWorkspaceAgents: (e, t) => zs(e, t),
		onToast: Ol,
		onIconsChanged: kl
	};
	if (!Z.tree) return t;
	if (Z.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: vl()
	};
	let n = ul(Z.selectedId) || Z.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: vl()
	};
	let r = Z.details[n.id] || null, i = fl(n.id), a = Z.resourceLogPages?.[n.id] || {};
	return {
		...t,
		identity: `${e}:${n.id}:${n.type}`,
		resourceId: n.id,
		resourceType: n.type === "project" || n.type === "task" ? n.type : "",
		resourceTitle: r?.title || n.title || n.id,
		parent: i && i.id !== n.id ? {
			id: i.id,
			title: i.title || i.id
		} : null,
		loading: !r,
		detail: r,
		logs: {
			hasMore: !!(a.hasMore ?? r?.logPage?.hasMore),
			loading: !!a.loading,
			error: String(a.error || "")
		}
	};
}
function Ns() {
	Ea.renderDetailPanel(Ms());
}
async function Ps(e) {
	await ys(e, { forceDetail: e === Z.selectedId && e !== "workspace" });
}
function Fs(e) {
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
function Is(e) {
	return Fs(e || "").trim();
}
function Ls() {
	Z.workspaceAgentsDraft = "", Z.workspaceAgentsDirty = !1;
}
async function Rs(e, t, n = {}) {
	let r = n.workspaceId || Z.activeWorkspaceId, i = n.requestVersion || ++Z.previewRequestVersion;
	try {
		let n = await So(Hs(e, t, r));
		return r !== Z.activeWorkspaceId || i !== Z.previewRequestVersion || Z.preview?.section !== e || Z.preview?.path !== t ? null : (Z.preview = {
			section: e,
			...n
		}, Z.preview);
	} catch (a) {
		let o = r === Z.activeWorkspaceId && i === Z.previewRequestVersion && Z.preview?.section === e && Z.preview?.path === t;
		if (o && (Z.preview = {
			section: e,
			path: t,
			error: Fi(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function zs(e, t) {
	if (!Z.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = Z.activeWorkspaceId, r = Z.navigationVersion, i = await So(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!Ro(n, r) || Z.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return Z.workspaceAgents = i, Z.workspaceAgentsDraft = Is(i.content || ""), Z.workspaceAgentsDirty = !1, i;
}
function Bs() {
	Z.previewRequestVersion++, Z.preview = null, Io();
}
function Vs() {
	Z.diffRequestVersion++, Z.diff = null, Io();
}
function Hs(e, t, n = Z.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
function Us(e) {
	let t = e?.data;
	return t?.method === "forge/self-driving/finish" && t?.kind === Ba && t?.lifecycle === Va && t?.level !== "error" && String(t.runId || "").trim() !== "" && String(t.resourceId || "").trim() !== "" && Number(t.selfDrivingRevision) > 0;
}
function Ws(e) {
	return Number(e?.data?.schedulerTurnSequence) || 0;
}
function Gs(e) {
	let t = String(e?.resourceId || "").trim();
	if (!t) return null;
	let n = [Z.details?.[t], ul(t)].map((e) => e?.selfDriving).filter((e) => !!e).map((e) => ({
		revision: Number(e.revision) || 0,
		state: String(e.condition || "").trim().toLowerCase()
	}));
	if (!n.length) return null;
	let r = (e) => +!Ha.has(e);
	return n.sort((e, t) => t.revision - e.revision || r(t.state) - r(e.state)), n[0];
}
function Ks(e, t = Z.agent.runs) {
	if (!Us(e)) return !0;
	let n = e.data;
	if (!Z.agent.activeRunId || String(n.runId).trim() !== Z.agent.activeRunId) return !1;
	let r = (t || []).find((e) => e.id === Z.agent.activeRunId);
	if (!r || String(r.resourceId || "").trim() !== String(n.resourceId).trim() || Number(r.selfDrivingRevision) !== Number(n.selfDrivingRevision)) return !1;
	let i = Ws(e), a = Number(r.schedulerTurnSequence) || 0;
	if (a > i && a > 0 || a === i && r.schedulerTurnId && n.schedulerTurnId && r.schedulerTurnId !== n.schedulerTurnId || r.schedulerTurn && (a === 0 || a >= i)) return !1;
	let o = Gs(r);
	return !o || o.revision === Number(n.selfDrivingRevision) && Ha.has(o.state);
}
function qs(e = Z.agent.runs) {
	let t = Z.agent.notices.length;
	return Z.agent.notices = Z.agent.notices.filter((t) => Ks(t, e)), Z.agent.notices.length !== t;
}
async function Js() {
	if (!Z.activeWorkspaceId) {
		ic();
		return;
	}
	Z.agentRunProjectionVersion = (Number(Z.agentRunProjectionVersion) || 0) + 1;
	let e = Z.agentRunProjectionVersion, t = await nc();
	return e !== Z.agentRunProjectionVersion || !Z.activeWorkspaceId || (Z.agent.runs = t, ro(Z.agent.runs), Xs(Z.agent.runs), typeof qs == "function" && qs(Z.agent.runs), Z.agent.activeRunId || (Z.agent.historyBeforeId = 0), e !== Z.agentRunProjectionVersion) ? !1 : (typeof qs == "function" && qs(Z.agent.runs), !0);
}
async function Ys(e = {}) {
	if (!Z.activeWorkspaceId) return;
	Z.agentRunProjectionVersion = (Number(Z.agentRunProjectionVersion) || 0) + 1;
	let t = Z.agentRunProjectionVersion, n = Z.activeWorkspaceId, r = await nc();
	if (t !== Z.agentRunProjectionVersion || Z.activeWorkspaceId !== n || (Z.agent.runs = r, ro(r), typeof qs == "function" && qs(r), Xs(r) && (t !== Z.agentRunProjectionVersion || Z.activeWorkspaceId !== n))) return !1;
	if (e.refreshSelfDrivingProjection && Z.agent.activeRunId) {
		let e = Jc(), r = String(e?.resourceId || "").trim(), [i, a] = await Promise.all([Qs(n), r ? Eo(r, n, { logsLimit: La }) : Promise.resolve(null)]);
		if (t !== Z.agentRunProjectionVersion || Z.activeWorkspaceId !== n) return !1;
		i && (Z.tree = i), a && Z.activeWorkspaceId === n && ko(a, "head");
	}
	return typeof qs == "function" && qs(Z.agent.runs), !0;
}
function Xs(e) {
	let t = Zs(e);
	if (Z.agent.activeRunId === t) {
		let n = e.find((e) => e.id === t);
		return n && yo(n), !1;
	}
	bo(), Z.agent.activeRunId = t, Z.agent.events = [], Z.agent.notices = [], Z.agent.eventsHasMore = !1, Z.agent.historyBeforeId = 0, vo();
	let n = e.find((e) => e.id === t);
	return n && yo(n), Z.agent.approvalDrafts.clear(), !0;
}
function Zs(e) {
	let t = e.find((e) => e.schedulerTurn && Yc(e));
	return t ? t.id : e.some((e) => e.id === Z.agent.activeRunId) ? Z.agent.activeRunId : e[0]?.id || "";
}
async function Qs(e = Z.activeWorkspaceId) {
	let t = ++Z.treeRequestVersion, n = Z.navigationVersion, r = await So(`/api/workspaces/${e}/tree`);
	return Ro(e, n, t) ? r : null;
}
async function $s() {
	if (!Z.activeWorkspaceId || !Z.tree) return;
	let e = await Qs(Z.activeWorkspaceId);
	e && (Z.tree = e);
}
async function ec(e, t) {
	!e || Z.activeWorkspaceId !== e || (await Promise.all([
		Js(),
		$s(),
		t && t !== "workspace" ? Eo(t, e, { logsLimit: La }).then((t) => {
			Z.activeWorkspaceId === e && t && ko(t, "head");
		}) : Promise.resolve()
	]), Z.activeWorkspaceId === e && (typeof qs == "function" && qs(Z.agent.runs), Io()));
}
async function tc(e) {
	Z.agentSessionMutationCount++, Z.autoRefreshVersion++, Z.treeRequestVersion++;
	try {
		return await e();
	} finally {
		Z.agentSessionMutationCount--;
	}
}
function nc() {
	let e = nl(), t = e ? `?resourceId=${encodeURIComponent(e)}` : "";
	return So(`/api/workspaces/${Z.activeWorkspaceId}/agent/runs${t}`).then((e) => e.runs || []);
}
async function rc() {
	bo(), ac(), ka.reset(), Z.agent.activeRunId = "", Z.agent.events = [], Z.agent.notices = [], Z.agent.historyBeforeId = 0, vo(), await Js();
}
function ic() {
	Z.selfDrivingDialog.open && !Z.selfDrivingDialog.submitting && kc(), bo(), zc(), ac(), Z.agent.runs = [], Z.agentRunProjectionVersion = (Number(Z.agentRunProjectionVersion) || 0) + 1, Z.agent.activeRunId = "", Z.agent.events = [], Z.agent.notices = [], Z.agent.eventsHasMore = !1, Z.agent.historyBeforeId = 0, Z.agent.loadingOlder = !1, Z.agent.optionsOpen = !1, Z.agent.agentChooserOpen = !1, Z.agent.historyOpen = !1, vo(), ka.reset(), Z.agent.toolGroupOpen.clear(), Z.agent.approvalDrafts.clear(), Z.agent.selfDrivingFinishNoticeWatermarks instanceof Map && Z.agent.selfDrivingFinishNoticeWatermarks.clear(), Z.agent.renderDeferredForSelection = !1, cc();
}
function ac() {
	Z.agent.stream && Z.agent.stream.close(), Z.agent.stream = null, Z.agent.streamRunId = "";
}
function oc(e, t, n) {
	if (e !== Z.activeWorkspaceId || t !== Z.agent.activeRunId || !n) return;
	let r = Z.agent.runs.find((e) => e.id === t) || null;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && io(n, r), [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(n.type) && Ys({ refreshSelfDrivingProjection: [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state"
	].includes(n.type) }).then(Io).catch((e) => console.warn("agent refresh failed", e));
}
function sc(e, t, n) {
	e === Z.activeWorkspaceId && t === Z.agent.activeRunId && n?.data?.kind === Ba && Ys({ refreshSelfDrivingProjection: !0 }).then(Io).catch((e) => console.warn("Self-Driving notice projection refresh failed", e));
}
function cc() {
	Z.agent.renderTimer && window.clearTimeout(Z.agent.renderTimer), Z.agent.renderTimer = null;
}
function lc(e) {
	if (!window.AgentHubEventTimeline?.buildTimeline) throw Error("AgentHub Event Timeline library is unavailable");
	let t = (e || []).filter((e) => !Ua.has(e?.type));
	return window.AgentHubEventTimeline.buildTimeline(t);
}
function uc() {
	typeof qs == "function" && qs(Z.agent.runs);
	let e = Jc(), t = Z.details[Z.selectedId];
	Ea.renderSelfDrivingBar(dc(t)), Ea.renderSessionSwitcher({
		identity: `${Z.activeWorkspaceId}:${nl()}`,
		workspaceId: Z.activeWorkspaceId,
		resourceId: nl(),
		activeRunId: e?.id || "",
		runs: Z.agent.runs,
		switchingRunId: ka.key("session-switch"),
		onSelect: Gc,
		onToast: Ol,
		onIconsChanged: kl
	});
}
function dc(e) {
	let t = ul(Z.selectedId);
	if (!t || t.type !== "task" || !e) return {
		identity: `${Z.activeWorkspaceId}:${Z.selectedId}:hidden`,
		visible: !1,
		status: mc("disabled", !1),
		summary: "",
		expanded: !1,
		hasProjection: !1,
		revision: 0,
		enabled: !1,
		preferredProfiles: [],
		actualAgent: "",
		actualReason: "",
		waitingSummary: "",
		wakeCondition: "",
		wakeFallback: !1,
		lastOutcome: null,
		statusReason: null,
		pending: !1,
		onToggleEnabled: () => {},
		onToggleDetails: () => {},
		onIconsChanged: kl
	};
	let n = e.selfDriving || null, r = Jc(), i = r?.schedulerTurn && r.resourceId === e.id ? `${r.agentProfile ? `${r.agentProfile} → ` : ""}${r.agentHubAgentName || ""}` : "";
	return {
		identity: `${Z.activeWorkspaceId}:${t.id}:${Number(n?.revision) || 0}`,
		visible: !0,
		status: mc(n?.condition || "disabled", !!n?.enabled),
		summary: pc(n, e),
		expanded: !!(n && Z.agent.selfDrivingExpanded),
		hasProjection: !!n,
		revision: Number(n?.revision) || 0,
		enabled: !!n?.enabled,
		preferredProfiles: n?.preferredAgentProfiles || [],
		actualAgent: i,
		actualReason: i ? String(r?.agentSelectionReason || "") : "",
		waitingSummary: String(n?.wakeContext?.summary || ""),
		wakeCondition: String(n?.wakeContext?.condition || ""),
		wakeFallback: !!n?.wakeContext?.fallback,
		lastOutcome: n?.lastOutcome ? {
			status: String(n.lastOutcome.status || ""),
			reason: String(n.lastOutcome.reason || "")
		} : null,
		statusReason: fc(n, e?.logs),
		pending: ka.active("self-driving-save") || ka.active("self-driving-disable"),
		onToggleEnabled: () => {
			ka.active("self-driving-save") || ka.active("self-driving-disable") || (n?.enabled ? Uc().catch((e) => Ol(e.message)) : wc(e) ? Oc() : Tc({ enabled: !0 }).catch((e) => Ol(e.message)));
		},
		onToggleDetails: () => {
			Z.agent.selfDrivingExpanded = !Z.agent.selfDrivingExpanded, uc();
		},
		onIconsChanged: kl
	};
}
function fc(e, t = []) {
	if (!e) return null;
	let n = String(e.conditionReason || e.notificationError?.message || "").trim();
	return n ? {
		label: "Status",
		text: n
	} : null;
}
function pc(e, t) {
	if (!e) return "Self-Driving is off.";
	let n = fc(e, t?.logs);
	if (n) return `${n.label}: ${n.text}`;
	if (e.wakeContext?.condition) return `Wake condition: ${e.wakeContext.condition}`;
	let r = Jc();
	if (r?.schedulerTurn && r.resourceId === t.id) {
		let e = `${r.agentProfile ? `${r.agentProfile} → ` : ""}${r.agentHubAgentName || ""}`.trim();
		if (e) return `Agent: ${e}`;
	}
	return `Revision ${Number(e.revision) || 0}`;
}
function mc(e, t = !1) {
	let n = {
		disabled: {
			label: "Off",
			icon: "circle-dashed"
		},
		ready: {
			label: "Ready",
			icon: "list-start"
		},
		waiting: {
			label: "Waiting",
			icon: "pause"
		},
		blocked: {
			label: "Blocked",
			icon: "octagon-alert"
		},
		error: {
			label: "Error",
			icon: "circle-x"
		},
		needs_configuration: {
			label: "Needs configuration",
			icon: "settings"
		}
	}, r = t ? String(e || "ready").trim().toLowerCase() : "disabled", i = Object.hasOwn(n, r) ? r : "unknown";
	return {
		key: i,
		...n[i] || {
			label: r || "Unknown",
			icon: "circle-help"
		}
	};
}
function hc(e) {
	if (!e) return "";
	let t = [gc(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function gc(e) {
	return (Z.config?.agentHubProviders || Xa.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function _c(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function vc(e = {}) {
	bc();
	let t = Jc(), n = (Z.config?.agents || []).find((e) => e.id === t?.agentHubAgentName);
	Ea.renderEventTimeline({
		identity: `${Z.activeWorkspaceId}:${t?.id || ""}`,
		workspaceId: Z.activeWorkspaceId,
		activeRunId: t?.id || "",
		activeRun: t,
		runCount: Z.agent.runs.length,
		agentName: Cc(n || bl()),
		project: lc,
		onEvent: oc,
		onNotice: sc,
		onApproval: qc,
		onToast: Ol,
		onIconsChanged: kl
	});
}
function yc(e, t) {
	return `${e || "workspace"}:${t || "run"}`;
}
function bc(e = {}) {
	Z.agent.skipTTYDraftSync = !1, ds();
	let t = Jc();
	t && yo(t);
	let n = Yc(t), r = t?.resourceId || nl(), i = Qc(t), a = $c(t) || t?.status === "stopping";
	Ea.renderComposer({
		identity: `${Z.activeWorkspaceId}:${r}:${t?.id || "none"}:${Z.agent.ttyDraftKey || ""}`,
		workspaceId: Z.activeWorkspaceId,
		resourceId: r,
		runId: t?.id || "",
		runStatus: t?.status || "",
		live: n,
		canResume: !!(t && !n && (t.agentHubSessionId || t.sourceExternalId)),
		draft: Z.agent.ttyDraft || "",
		draftKey: Z.agent.ttyDraftKey || "",
		draftResetVersion: Z.agent.ttyDraftResetVersion || 0,
		unavailableReason: n ? Sc(t, xc(t)) : "",
		sending: !!(t && ka.isSending(yc(Z.activeWorkspaceId, t.id))),
		externalLocked: cs(),
		internalLocked: ls(),
		agents: Za(),
		selectedAgentId: bl()?.id || "",
		chooserOpen: !!Z.agent.agentChooserOpen,
		sessionStarting: ka.active("session-start"),
		actionsOpen: !!Z.agent.sessionActionsOpen,
		canEndTurn: !!(t && (Xc(t) || i)),
		endingTurn: i,
		closingSession: a,
		selfDrivingRemainsEnabled: Zc(t),
		selfDrivingDisabling: ka.active("self-driving-disable"),
		onDraft: (e, t) => Nc(e, t),
		onSend: el,
		onOpenUpload: Lc,
		onToggleChooser: () => {
			ka.active("session-start") || !xl().length || cs() || (Z.agent.agentChooserOpen = !Z.agent.agentChooserOpen, bc());
		},
		onChooseAgent: (e) => Fc(e).catch((e) => Ol(e.message)),
		onToggleActions: () => {
			Z.agent.sessionActionsOpen = !Z.agent.sessionActionsOpen, bc();
		},
		onResume: () => Kc().catch((e) => Ol(e.message)),
		onEndTurn: () => Wc().catch((e) => Ol(e.message)),
		onCloseSession: Pc,
		onIconsChanged: kl
	});
}
function xc(e) {
	return Yc(e) ? e.status !== "starting" || Z.agent.events.some((e) => e.type === "session.state" && e.data?.state === "ready") ? !0 : Z.agent.eventsHasMore && e.status !== "starting" : !1;
}
function Sc(e, t = xc(e)) {
	return cs() ? za : Qc(e) ? "Ending the current turn." : t ? e.status === "stopping" ? "AgentHub is stopping the provider." : e.status === "recovering" ? "AgentHub event recovery is in progress." : e.status === "waiting_approval" ? "Resolve the pending approval before sending input." : "" : "Agent session is starting.";
}
function Cc(e) {
	return e?.name || e?.id || "Agent";
}
function wc(e) {
	return !e?.selfDriving?.agentName && !(e?.selfDriving?.preferredAgentProfiles || []).length;
}
async function Tc(e = {}) {
	return Aa.setSelfDriving(e);
}
function Ec() {
	return {
		open: !1,
		identity: ++Ja,
		mode: "",
		resourceId: "",
		reuseRunId: "",
		reuseCurrentSession: !1,
		agentName: "",
		expectedRevision: 0,
		expectedCondition: "",
		runInstructions: "",
		completionCriteria: "",
		submitting: !1,
		error: "",
		unknown: !1,
		returnFocus: null
	};
}
function Dc(e) {
	return Z.agent.runs.find((t) => t.resourceId === e && Yc(t) && t.status === "idle" && !t.schedulerTurn && String(t.agentHubSessionId || "").trim()) || null;
}
function Oc() {
	let e = ul(Z.selectedId), t = e ? Z.details[e.id] || e : null;
	if (!e || !t || t.type !== "task") {
		Ol("Select a task first.");
		return;
	}
	let n = Dc(e.id), r = t.selfDriving || null, i = xl(), a = String(r?.agentName || "").trim(), o = i.find((e) => String(e.id || "").trim().toLowerCase() === a.toLowerCase()), s = bl(), c = String(n?.agentHubAgentName || o?.id || s?.id || "").trim();
	Z.modalEnter = "selfDriving", Z.selfDrivingDialog = {
		open: !0,
		identity: ++Ja,
		mode: "configure",
		resourceId: e.id,
		reuseRunId: n?.id || "",
		reuseCurrentSession: !!n,
		agentName: c,
		expectedRevision: Number(r?.revision) || 0,
		expectedCondition: String(r?.condition || "").trim().toLowerCase(),
		runInstructions: String(r?.prompt || ""),
		completionCriteria: String(r?.completionCriteria || ""),
		submitting: !1,
		error: i.length === 0 ? "No enabled AgentHub agents are available. Self-Driving can still be enabled and will report Needs configuration." : "",
		unknown: !1,
		returnFocus: document.activeElement instanceof HTMLElement ? document.activeElement : null
	}, Ac();
}
function kc() {
	let e = Z.selfDrivingDialog;
	if (!e.open || e.submitting) return;
	let t = e.returnFocus;
	Z.selfDrivingDialog = Ec(), Ac(), t && document.contains(t) && t.focus({ preventScroll: !0 });
}
function Ac() {
	let e = Z.selfDrivingDialog;
	Ea.renderSelfDrivingDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${e.resourceId || ""}`,
		resourceId: e.resourceId || "",
		reuseCurrentSession: !!e.reuseCurrentSession,
		agents: Za(),
		draft: {
			agentName: e.agentName || "",
			runInstructions: e.runInstructions || ""
		},
		submitting: !!e.submitting,
		error: e.error || "",
		unknown: !!e.unknown,
		onClose: kc,
		onSubmit: jc,
		onIconsChanged: kl
	});
}
async function jc(e) {
	let t = Z.selfDrivingDialog;
	if (!t.open || t.submitting || t.unknown) return;
	if (t.agentName = String(e?.agentName || t.agentName || "").trim(), t.runInstructions = String(e?.runInstructions || ""), !t.reuseCurrentSession && !t.agentName) {
		t.error = "Select an Agent before enabling Self-Driving.", Ac();
		return;
	}
	t.submitting = !0, t.error = "";
	let n = t.identity, r = Z.activeWorkspaceId, i = t.resourceId;
	Ac();
	try {
		if (await Tc({
			configured: !0,
			agentName: t.agentName,
			runInstructions: t.runInstructions,
			completionCriteria: t.completionCriteria
		}), n !== Z.selfDrivingDialog.identity || r !== Z.activeWorkspaceId || i !== Z.selectedId) return;
		let e = t.returnFocus;
		Z.selfDrivingDialog = Ec(), Ac(), e && document.contains(e) && e.focus({ preventScroll: !0 });
	} catch (e) {
		if (n !== Z.selfDrivingDialog.identity) return;
		t.submitting = !1;
		let r = e, i = Fi(e, "Self-Driving could not be enabled.");
		t.error = i, t.unknown = !Number.isFinite(Number(r?.status)) || Number(r?.status) >= 500 || i.includes("outcome may be unknown") || i.includes("was updated but the start message failed"), Ac();
	}
}
function Mc() {
	Xa.render();
}
function Nc(e, t) {
	!t || t.workspaceId !== Z.activeWorkspaceId || t.runId !== Z.agent.activeRunId || t.draftKey !== Z.agent.ttyDraftKey || _o(e);
}
function Pc() {
	if (!Zc(Jc())) {
		Hc().catch((e) => Ol(e.message));
		return;
	}
	if (window.confirm("Self-Driving is On. Close this Session while keeping Self-Driving On? The Scheduler may create a replacement Session.")) {
		Hc().catch((e) => Ol(e.message));
		return;
	}
	window.confirm("Disable Self-Driving and close this Session instead?") && Uc().then(() => Hc()).catch((e) => Ol(e.message));
}
async function Fc(e = "") {
	return Aa.start(e);
}
function Ic(e) {
	let t = ul(Z.selectedId), n = t ? Z.details[t.id] || t : null;
	if (!t || t.type !== "task" || !e || e.resourceId !== t.id) return null;
	let r = n?.selfDriving || null;
	return {
		resourceId: t.id,
		selfDrivingProjectionSet: !0,
		expectedSelfDrivingRevision: Number(r?.revision) || 0,
		expectedSelfDrivingCondition: String(r?.condition || "").trim().toLowerCase()
	};
}
function Lc() {
	let e = Jc();
	if (!e || !Yc(e)) {
		Ol("Start or resume an agent session before uploading files.");
		return;
	}
	let t = Fa("ttyInput");
	t && _o(t.value), Z.modalEnter = "upload", Z.uploadDialog = {
		open: !0,
		identity: ++Ya,
		runId: e.id,
		items: [],
		nextId: 1
	}, Vc();
}
function Rc(e = [], t = {}) {
	if (!Z.uploadDialog.open) return;
	let n = t.workspaceId === Z.activeWorkspaceId && t.runId === Z.agent.activeRunId, r = e.length > 0 && n && Z.uploadDialog.runId === Z.agent.activeRunId;
	r && (_o(Bc(Z.agent.ttyDraft, e)), Z.agent.ttyDraftResetVersion++), zc();
	let i = Fa("ttyComposer");
	i && delete i.dataset.composerKey, bc({ skipDraftSync: r }), Fa("ttyInput")?.focus({ preventScroll: !0 }), kl();
}
function zc() {
	Z.uploadDialog = {
		open: !1,
		identity: ++Ya,
		runId: "",
		items: [],
		nextId: 1
	}, Vc();
}
function Bc(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function Vc() {
	let e = Z.uploadDialog;
	Ea.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${Z.activeWorkspaceId}:${e.runId || ""}`,
		workspaceId: Z.activeWorkspaceId,
		runId: e.runId || "",
		onDone: Rc,
		onIconsChanged: kl
	});
}
async function Hc() {
	return Aa.stopSession();
}
async function Uc() {
	return Aa.disableSelfDriving();
}
async function Wc() {
	return Aa.stopTurn();
}
async function Gc(e) {
	return Aa.switchRun(e);
}
async function Kc() {
	return Aa.resume();
}
async function qc(e, t, n) {
	return Aa.resolveApproval(e, t, n);
}
function Jc() {
	return Z.agent.runs.find((e) => e.id === Z.agent.activeRunId) || null;
}
function Yc(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(e?.status);
}
function Xc(e) {
	return ["running", "waiting_approval"].includes(e?.status);
}
function Zc(e) {
	let t = String(e?.resourceId || "").trim();
	return t ? !!ul(t)?.selfDriving?.enabled : !1;
}
function Qc(e) {
	return ka.active("turn-stop") && ka.key("turn-stop") === e?.id;
}
function $c(e) {
	return ka.active("session-stop") && ka.key("session-stop") === e?.id;
}
async function el(e, t) {
	return Aa.send(e, t);
}
function tl() {
	let e = ul(Z.selectedId);
	return e && e.path || "";
}
function nl() {
	return Z.selectedId === "workspace" ? "workspace" : ul(Z.selectedId)?.id || "";
}
function rl(e) {
	if (!e) return "unknown";
	let t = new Date(e).getTime();
	if (!Number.isFinite(t)) return e;
	let n = Math.max(0, Math.round((Date.now() - t) / 1e3));
	if (n < 60) return `${n}s ago`;
	let r = Math.round(n / 60);
	if (r < 60) return `${r}m ago`;
	let i = Math.round(r / 60);
	return i < 24 ? `${i}h ago` : `${Math.round(i / 24)}d ago`;
}
function il() {
	ol("project");
}
function al(e) {
	ol("task", e);
}
function ol(e, t = "") {
	Pa.open(e === "task" ? "task" : "project", t);
}
function sl() {
	Pa.close();
}
function cl() {
	Pa.render();
}
async function ll(e) {
	confirm(`Archive ${e}?`) && (await So(`/api/workspaces/${Z.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	}), Ol("Archived."), Z.selectedId = "workspace", await wo());
}
function ul(e) {
	if (!Z.tree) return null;
	for (let t of Z.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function dl() {
	return Z.selectedId === "workspace" || ul(Z.selectedId) ? !1 : (Z.selectedId = "workspace", !0);
}
function fl(e) {
	if (!Z.tree) return null;
	for (let t of Z.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function pl(e) {
	return Z.expandedProjects.has(e);
}
function ml(e = !1) {
	let t = fl(Z.selectedId);
	!t || t.id === Z.selectedId || Z.expandedProjects.has(t.id) || (Z.expandedProjects.add(t.id), e && No().catch((e) => Ol(e.message)));
}
function hl(e = window.location.pathname) {
	return Ma.parse(e);
}
function gl(e) {
	return !!(e && Z.config?.workspaces.some((t) => t.id === e));
}
function _l(e = {}) {
	Ma.project(Z.activeWorkspaceId, Z.selectedId, e);
}
function vl() {
	return Z.config?.workspaces.find((e) => e.id === Z.activeWorkspaceId)?.name || "Workspace";
}
function yl() {
	let e = xl(), t = Sl();
	e.some((e) => e.id === Z.agent.agentName) || (Z.agent.agentName = t);
}
function bl() {
	let e = xl(), t = Z.agent.agentName || Sl();
	return e.find((e) => e.id === t) || e[0] || null;
}
function xl() {
	return (Z.config?.agents || []).filter((e) => e.available !== !1);
}
function Sl() {
	let e = xl();
	return Cl(Z.config?.agentProfiles, "default") || Cl(Xa.profiles(), "default") || e[0]?.id || "";
}
function Cl(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function wl(e = "workspace") {
	return Xa.open(e);
}
function Tl(e, t) {
	return Xa.withAgentHubCatalog(e, t);
}
function El(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var Dl = 0;
function Ol(e) {
	Ea.renderToast({
		message: String(e || ""),
		revision: ++Dl
	});
}
function kl() {
	let e = window.lucide;
	!e || Z.iconRefreshScheduled || (Z.iconRefreshScheduled = !0, Da?.animationFrame(() => {
		Z.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function Al(e) {
	kl(), e === "markdown" && window.marked && window.DOMPurify && (Ns(), kl()), e === "diff" && Ns();
}
window.forgeAssetLoaded = Al;
function jl() {
	ja.initialize();
}
function Ml(e, t) {
	ja.previewPane(e, t);
}
function Nl(e) {
	ja.commitPane(e);
}
function Pl() {
	ja.syncViewport();
}
function Fl(e) {
	ja.setMobileSidebar(e);
}
function Il(e) {
	ja.setMobileView(e);
}
function Ll(e) {
	ja.setMobileImmersive(e);
}
function Rl() {
	Da?.listen(document, "selectionchange", () => {
		if (!Z.agent.renderDeferredForSelection) return;
		let e = Fa("ttyLog");
		e && _c(e) || (Z.agent.renderDeferredForSelection = !1, vc(), kl());
	}), Da?.listen(document, "keydown", (e) => {
		e.key === "Escape" && Z.diff ? Vs() : e.key === "Escape" && Z.preview ? Bs() : e.key === "Escape" && (Z.agent.optionsOpen || Z.agent.agentChooserOpen || Z.agent.historyOpen) && (Z.agent.optionsOpen = !1, Z.agent.agentChooserOpen = !1, Z.agent.historyOpen = !1, uc(), bc(), kl());
	}), Da?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Ps(n.dataset.breadcrumbResource).catch((e) => Ol(e.message));
			return;
		}
		let r = Z.agent.agentChooserOpen && t && !t.closest(".tty-new-session-control"), i = (Z.agent.optionsOpen || Z.agent.historyOpen) && t && !t.closest(".agent-actions") && !t.closest(".agent-sessions") && !t.closest(".tty-composer");
		(r || i) && (Z.agent.optionsOpen = !1, Z.agent.agentChooserOpen = !1, Z.agent.historyOpen = !1, uc(), bc(), kl()), Z.sessionMenu && (t?.closest(".session-row") || t?.closest(".session-resource-menu") || (Z.sessionMenu = null, ws(), kl()));
	}), Da?.listen(window, "beforeunload", Vl), Da?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && Vl();
	});
}
var zl = !1;
function Bl(e) {
	if (Ea = e, zl) {
		Qa();
		return;
	}
	zl = !0;
	let t = new Ta();
	Da = t, $a = Wi({
		scope: t,
		selectedResourceId: () => Z.selectedId,
		treeSessions: () => Z.tree?.sessions || [],
		agentRuns: () => Z.agent.runs,
		hasTree: () => !!Z.tree,
		findResource: ul,
		sessionNavigationTarget: Os,
		selectResource: ys,
		activateRun: (e) => {
			let t = Z.agent.runs.find((t) => t.id === e);
			t && (Z.agent.activeRunId = t.id, uc(), vc(), kl());
		},
		notificationsSettingsVisible: () => Xa.isOpenTab("notifications"),
		renderSettings: Mc,
		renderSessions: ws,
		refreshIcons: kl,
		flushDraft: Vl
	}), eo = va(t, () => {
		Xa.isOpenTab("user") && Mc();
	}), Rl(), jl(), $a.install(), qo(), Co().catch((e) => {
		Z.navigationLoading = !1, Z.navigationError = e.message, Ol(e.message), Io();
	}), Po();
}
function Vl() {
	bo();
}
function Hl() {
	zl && (Vl(), zl = !1, ac(), $a?.dispose(), $a = null, eo = null, ka.reset(), cc(), Pa.dispose(), Da?.dispose(), Da = null, Z.autoRefreshTimer = null);
}
async function Ul(e) {
	let t = hl(e);
	if (!gl(t.workspaceId)) {
		_l({ replace: !0 });
		return;
	}
	let n = Z.activeWorkspaceId !== t.workspaceId, r = Z.selectedId;
	bo(), Z.navigationVersion++, Z.autoRefreshVersion++, Z.treeRequestVersion++, Z.detailRequestVersion++, Z.workspaceAgentsRequestVersion++, Z.previewRequestVersion++, Z.diffRequestVersion++, Z.workspaceAgentsSaving = !1;
	let i = Z.navigationVersion;
	if (Z.activeWorkspaceId = t.workspaceId || "", Z.selectedId = t.resourceId || "workspace", !n && r !== Z.selectedId && Z.selectedId !== "workspace" && (Do(Z.selectedId), delete Z.details[Z.selectedId]), Z.preview = null, Z.diff = null, Z.sessionMenu = null, n && (Z.tree = null, Z.navigationLoading = !0, Z.navigationError = "", Ls(), Z.workspaceAgentsSaving = !1, sl(), to(Z.activeWorkspaceId)), n && ic(), Ho(), n) {
		if (!await Mo(t.workspaceId, i)) return;
		!t.resourceId && Z.lastResourceId && (Z.selectedId = Z.lastResourceId), await wo({ updateURL: !1 }), Ro(t.workspaceId, i) && _l({ replace: !0 });
	} else {
		let e = dl();
		if (Z.selectedId === "workspace" ? await jo() : (ml(!1), await To(Z.selectedId)), !Ro(t.workspaceId, i)) return;
		r !== Z.selectedId && await rc(), Io(), e && _l({ replace: !0 });
	}
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/components/Icon.svelte
var Wl = /* @__PURE__ */ W("<i></i>");
function Q(e, t) {
	let n = Ci(t, "className", 3, "");
	var r = Wl();
	z(() => {
		X(r, "data-lucide", t.name), Y(r, 1, Yr(n()));
	}), G(e, r);
}
//#endregion
//#region src/components/AppShell.svelte
var Gl = /* @__PURE__ */ W("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), Kl = /* @__PURE__ */ W("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), ql = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), Jl = /* @__PURE__ */ W("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Yl = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Xl = /* @__PURE__ */ W("<span><!></span>"), Zl = /* @__PURE__ */ W("<span aria-hidden=\"true\"><!><!></span>"), Ql = /* @__PURE__ */ W("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), $l = /* @__PURE__ */ W("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), eu = /* @__PURE__ */ W("<div class=\"task-group\"></div>"), tu = /* @__PURE__ */ W("<button type=\"button\"><span class=\"chevron\"><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), nu = /* @__PURE__ */ W("<div class=\"session-row muted-row\"><!><div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>"), ru = /* @__PURE__ */ W("<span class=\"session-unread-badge\" aria-label=\"Unread turn completion\">New</span>"), iu = /* @__PURE__ */ W("<button type=\"button\"><!><span><strong> </strong><small> </small></span></button>"), au = /* @__PURE__ */ W("<div class=\"session-resource-menu\"></div>"), ou = /* @__PURE__ */ W("<button type=\"button\"><!> <div class=\"session-title\"><strong> </strong><span> </span></div> <span> </span> <!> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), su = /* @__PURE__ */ W("<header class=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" class=\"mobile-icon-button mobile-immersive-button\" type=\"button\" aria-label=\"Toggle immersive chat\"><!></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" type=\"button\" aria-label=\"Close navigation\"></button> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <section class=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" class=\"workspace-switcher-button\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <!></button> <!></div></section> <section class=\"tree-section\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section> <div id=\"sessionResize\" class=\"resize-handle horizontal-resize sidebar-session-resize\" role=\"separator\" aria-orientation=\"horizontal\" aria-label=\"Resize sessions panel\"></div> <section class=\"session-section\"><div class=\"section-title\"><span>Sessions</span></div> <div id=\"sessionList\" class=\"session-list\"><!></div></section></aside> <div id=\"sidebarResize\" class=\"resize-handle sidebar-resize\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"Resize sidebar\"></div> <main class=\"workspace-panel\"><section id=\"detailsPanel\" class=\"details-panel\"></section> <div id=\"detailsResize\" class=\"resize-handle details-resize\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"Resize chat panel\"></div> <aside id=\"agentPanel\" class=\"agent-panel\"><div id=\"agentControls\" class=\"agent-actions\"></div><div id=\"selfDrivingBarWrap\" class=\"self-driving-bar-wrap\"></div><div id=\"agentSessionsWrap\" class=\"agent-sessions\"></div><div class=\"tty-panel\"><div id=\"ttyLog\" class=\"tty-log\"></div><div id=\"ttyComposer\" class=\"tty-composer\"></div></div></aside></main>", 1);
function cu(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(null), s = /* @__PURE__ */ F(null), c = null, l = /* @__PURE__ */ F(0), u = /* @__PURE__ */ N(() => H(n).workspaces.find((e) => e.id === H(n).activeWorkspaceId) ?? null);
	wi(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== H(n).identity;
			I(n, e, !0), t && (I(r, !1), I(i, ""), I(a, ""), _()), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			H(r) && !t?.closest(".workspace-select-row") && I(r, !1), H(i) && !t?.closest(".session-row") && !t?.closest(".session-resource-menu") && I(i, "");
		}, s = (e) => {
			e.key === "Escape" && (H(n).mobile.sidebarOpen ? H(n).onMobileSidebar(!1) : H(r) ? I(r, !1) : H(i) && I(i, ""));
		}, l = () => {
			H(n).onHistoryNavigation(window.location.pathname).catch((e) => {
				H(n).onToast(e instanceof Error ? e.message : String(e));
			});
		}, u = window.visualViewport, d = /* @__PURE__ */ new Set(), f = typeof window.matchMedia == "function" ? window.matchMedia("(max-width: 980px)") : {
			matches: !1,
			addEventListener: () => void 0,
			removeEventListener: () => void 0
		}, p = () => {
			let e = document.documentElement;
			if (!f.matches || !u) {
				e.style.removeProperty("--app-viewport-height"), e.style.removeProperty("--app-viewport-offset-top"), e.style.removeProperty("--app-viewport-offset-left");
				return;
			}
			e.style.setProperty("--app-viewport-height", `${u.height}px`), e.style.setProperty("--app-viewport-offset-top", `${u.offsetTop}px`), e.style.setProperty("--app-viewport-offset-left", `${u.offsetLeft}px`);
		}, m = () => {
			(window.scrollX !== 0 || window.scrollY !== 0) && window.scrollTo(0, 0), p();
		}, h = () => {
			for (let e of d) window.clearTimeout(e);
			d.clear();
		}, g = (e) => {
			let t = window.setTimeout(() => {
				d.delete(t), m();
			}, e);
			d.add(t);
		}, v = () => {
			h(), g(0), g(300);
		}, y = () => {
			H(n).onPaneViewport(), p();
		};
		return document.addEventListener("mousedown", o), document.addEventListener("keydown", s), document.addEventListener("focusout", v), window.addEventListener("resize", y), window.addEventListener("orientationchange", v), window.addEventListener("popstate", l), u?.addEventListener("resize", p), u?.addEventListener("scroll", p), f.addEventListener?.("change", y), p(), () => {
			e(), c?.(), _(), document.removeEventListener("mousedown", o), document.removeEventListener("keydown", s), document.removeEventListener("focusout", v), window.removeEventListener("resize", y), window.removeEventListener("orientationchange", v), window.removeEventListener("popstate", l), u?.removeEventListener("resize", p), u?.removeEventListener("scroll", p), f.removeEventListener?.("change", y), h(), document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
		};
	}), bn(() => {
		document.body.classList.toggle("mobile-sidebar-open", H(n).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", H(n).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", H(n).mobile.immersive);
	}), bn(() => {
		let e = H(n).route;
		!e.path || e.revision <= H(l) || (I(l, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	function d(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function f(e) {
		return !H(s) || H(s).id !== e ? "" : H(s).after ? "drop-after" : "drop-before";
	}
	function p(e) {
		return !H(o) || H(o).id === e.id || H(o).kind !== e.kind ? !1 : e.kind !== "task" || H(o).projectId === e.projectId;
	}
	function m(e, t) {
		e.stopPropagation(), I(o, t, !0), I(s, null), H(n).onDragState(t), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", t.id));
	}
	function h(e, t) {
		if (!p(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		I(s, {
			id: t.id,
			after: e.clientY > n.top + n.height / 2
		}, !0);
	}
	async function g(e, t) {
		if (e.preventDefault(), !H(o) || !p(t)) return;
		let r = H(o), i = H(s)?.id === t.id && H(s).after;
		_();
		try {
			await H(n).onReorder(r, t, i);
		} catch (e) {
			H(n).onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function _() {
		H(o) && H(n).onDragState(null), I(o, null), I(s, null);
	}
	async function v(e) {
		if (!(!e || H(a))) {
			I(a, e, !0), I(r, !1);
			try {
				await H(n).onSwitchWorkspace(e);
			} catch (e) {
				H(n).onToast(e instanceof Error ? e.message : String(e));
			} finally {
				I(a, "");
			}
		}
	}
	async function y(e) {
		if (e) {
			I(i, "");
			try {
				await H(n).onSelectResource(e);
			} catch (e) {
				H(n).onToast(e instanceof Error ? e.message : String(e));
			}
		}
	}
	async function b(e, t) {
		let r = e.target instanceof Element ? e.target : null;
		if (!r?.closest(".drag-handle")) {
			if (t.type === "project" && r?.closest("[data-project-toggle]")) {
				try {
					await H(n).onToggleProject(t.id);
				} catch (e) {
					H(n).onToast(e instanceof Error ? e.message : String(e));
				}
				return;
			}
			await y(t.id);
		}
	}
	function x(e, t) {
		if (!(e.target instanceof Element ? e.target : null)?.closest(".drag-handle")) {
			if (t.navigationResourceId) {
				y(t.navigationResourceId);
				return;
			}
			t.menu && I(i, H(i) === t.id ? "" : t.id, !0);
		}
	}
	function S(e, t) {
		if (window.matchMedia("(max-width: 980px)").matches) return;
		e.preventDefault(), c?.();
		let r = e.currentTarget, i = document.getElementById("app"), a = document.getElementById("mobileSidebar"), o = document.querySelector(".workspace-panel"), s = document.getElementById("agentPanel"), l = document.querySelector(".session-section");
		if (!i || !a || !o || !s || !l) return;
		let u = e.clientX, d = e.clientY, f = a.getBoundingClientRect().width, p = s.getBoundingClientRect().width, m = l.getBoundingClientRect().height, h = t === "sidebarSessionHeight" ? "resizing-y" : "resizing-x";
		r.classList.add("dragging"), document.body.classList.add(h);
		let g = (e) => {
			if (t === "sidebarWidth") {
				let r = Math.max(220, i.getBoundingClientRect().width - 8 - 360 - 8 - Math.max(320, s.getBoundingClientRect().width));
				H(n).onPanePreview(t, Math.min(r, Math.max(220, f + e.clientX - u)));
			} else if (t === "chatWidth") {
				let r = Math.max(320, o.getBoundingClientRect().width - 360 - 8);
				H(n).onPanePreview(t, Math.min(r, Math.max(320, p - (e.clientX - u))));
			} else {
				let r = Math.max(120, a.getBoundingClientRect().height - 250);
				H(n).onPanePreview(t, Math.min(r, Math.max(84, m - (e.clientY - d))));
			}
		}, _ = () => {
			r.classList.remove("dragging"), document.body.classList.remove(h), window.removeEventListener("pointermove", g), window.removeEventListener("pointerup", _), window.removeEventListener("pointercancel", _), c = null, H(n).onPaneCommit(t);
		};
		c = _, window.addEventListener("pointermove", g), window.addEventListener("pointerup", _, { once: !0 }), window.addEventListener("pointercancel", _, { once: !0 });
	}
	var C = su(), w = un(C), T = L(w);
	Q(L(T), { name: "menu" }), k(T);
	var E = R(T, 2), ee = L(E), te = R(ee, 2);
	k(E);
	var ne = R(E, 2), re = L(ne);
	{
		let e = /* @__PURE__ */ N(() => H(n).mobile.immersive ? "minimize-2" : "maximize-2");
		Q(re, { get name() {
			return H(e);
		} });
	}
	k(ne), k(w);
	var ie = R(w, 2), ae = R(ie, 2), oe = L(ae), se = R(L(oe)), ce = R(L(se)), le = L(ce, !0);
	k(ce), k(se);
	var ue = R(se);
	Q(L(ue), { name: "settings" }), k(ue), k(oe);
	var de = R(oe, 2), fe = L(de), pe = L(fe), me = L(pe), he = L(me);
	k(me);
	var ge = R(me, 2), _e = L(ge, !0);
	k(ge);
	var ve = R(ge, 2);
	{
		let e = /* @__PURE__ */ N(() => H(a) ? "loader-circle" : "chevrons-up-down");
		Q(ve, {
			get name() {
				return H(e);
			},
			className: "select-icon"
		});
	}
	k(pe);
	var ye = R(pe, 2), be = (e) => {
		var t = Kl(), i = R(L(t), 2);
		J(i, 17, () => H(n).workspaces, (e) => e.id, (e, t) => {
			var r = Gl(), i = L(r), o = L(i);
			k(i);
			var s = R(i, 2), c = L(s), l = L(c, !0);
			k(c);
			var u = R(c), d = L(u, !0);
			k(u), k(s);
			var f = R(s, 2), p = (e) => {
				Q(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			q(f, (e) => {
				H(t).id === H(n).activeWorkspaceId && e(p);
			}), k(r), z((e) => {
				X(r, "aria-selected", H(t).id === H(n).activeWorkspaceId), X(r, "data-workspace-id", H(t).id), r.disabled = e, X(o, "src", H(t).iconSrc), K(l, H(t).name || H(t).id), K(d, H(t).path);
			}, [() => !!H(a)]), U("click", r, () => v(H(t).id)), G(e, r);
		});
		var o = R(i, 2), s = L(o);
		Q(L(s), { name: "plus" }), A(), k(s), k(o), k(t), U("click", s, () => {
			I(r, !1), H(n).onAddWorkspace();
		}), G(e, t);
	};
	q(ye, (e) => {
		H(r) && e(be);
	}), k(fe), k(de);
	var xe = R(de, 2), Se = L(xe), Ce = R(L(Se));
	Q(L(Ce), { name: "plus" }), k(Ce), k(Se);
	var we = R(Se, 2), Te = L(we), Ee = (e) => {
		var t = ql();
		Q(L(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(2), k(t), G(e, t);
	}, De = (e) => {
		var t = Jl(), r = L(t);
		Q(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = R(r, 2), a = L(i, !0);
		k(i), k(t), z(() => K(a, H(n).error)), G(e, t);
	}, Oe = (e) => {
		var t = Yl();
		Q(L(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(t), G(e, t);
	}, ke = (e) => {
		var t = Or();
		J(un(t), 17, () => H(n).projects, (e) => e.id, (e, t) => {
			var n = tu(), r = un(n), i = L(r), a = L(i), s = (e) => {
				{
					let n = /* @__PURE__ */ N(() => H(t).expanded ? "chevron-down" : "chevron-right");
					Q(e, { get name() {
						return H(n);
					} });
				}
			};
			q(a, (e) => {
				H(t).children.length && e(s);
			}), k(i);
			var c = R(i, 2), l = (e) => {
				var n = Zl(), r = L(n);
				J(r, 17, () => H(t).status.statuses, (e) => e.key, (e, t) => {
					var n = Xl();
					Q(L(n), {
						get name() {
							return H(t).iconName;
						},
						className: "task-status-icon"
					}), k(n), z(() => Y(n, 1, `task-status-indicator ${H(t).className} ${H(t).recentOutput ? "task-status-fresh" : ""}`)), G(e, n);
				});
				var i = R(r), a = (e) => {
					var n = Xl();
					Q(L(n), {
						name: "lock",
						className: "task-lock-icon"
					}), k(n), z(() => Y(n, 1, `task-lock-indicator ${H(t).status.lock.className}`)), G(e, n);
				};
				q(i, (e) => {
					H(t).status.lock && e(a);
				}), k(n), z(() => Y(n, 1, `task-status-slot ${H(t).status.slotClassName}`)), G(e, n);
			};
			q(c, (e) => {
				H(t).status.hasTaskState && e(l);
			});
			var u = R(c, 2);
			Q(u, {
				name: "folder",
				className: "tree-icon"
			});
			var p = R(u, 2), v = L(p), y = L(v, !0);
			k(v);
			var x = R(v), S = L(x, !0);
			k(x);
			var C = R(x), w = (e) => {
				var n = Ql(), r = L(n), i = L(r, !0);
				k(r);
				var a = R(r, 2), o = L(a, !0);
				k(a), k(n), z(() => {
					K(i, H(t).summary.taskLabel), K(o, H(t).summary.runningLabel);
				}), G(e, n);
			};
			q(C, (e) => {
				H(t).summary && !H(t).expanded && e(w);
			}), k(p);
			var T = R(p, 2);
			Q(L(T), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), k(T), k(r);
			var E = R(r, 2), ee = (e) => {
				var n = eu();
				J(n, 21, () => H(t).children, (e) => e.id, (e, n) => {
					var r = $l(), i = R(L(r), 2), a = (e) => {
						var t = Zl(), r = L(t);
						J(r, 17, () => H(n).status.statuses, (e) => e.key, (e, t) => {
							var n = Xl();
							Q(L(n), {
								get name() {
									return H(t).iconName;
								},
								className: "task-status-icon"
							}), k(n), z(() => Y(n, 1, `task-status-indicator ${H(t).className} ${H(t).recentOutput ? "task-status-fresh" : ""}`)), G(e, n);
						});
						var i = R(r), a = (e) => {
							var t = Xl();
							Q(L(t), {
								name: "lock",
								className: "task-lock-icon"
							}), k(t), z(() => Y(t, 1, `task-lock-indicator ${H(n).status.lock.className}`)), G(e, t);
						};
						q(i, (e) => {
							H(n).status.lock && e(a);
						}), k(t), z(() => Y(t, 1, `task-status-slot ${H(n).status.slotClassName}`)), G(e, t);
					};
					q(i, (e) => {
						H(n).status.hasTaskState && e(a);
					});
					var s = R(i, 2);
					Q(s, {
						name: "file-text",
						className: "tree-icon"
					});
					var c = R(s), l = L(c), u = L(l, !0);
					k(l);
					var p = R(l), v = L(p, !0);
					k(p), k(c);
					var y = R(c, 2);
					Q(L(y), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), k(y), k(r), z((e) => {
						Y(r, 1, e), X(r, "aria-label", H(n).ariaLabel || void 0), X(r, "title", H(n).statusLabel || void 0), K(u, H(n).title), K(v, H(n).ref);
					}, [() => `tree-item task-item ${d(H(n).status)} ${H(n).active ? "active" : ""} ${H(o)?.id === H(n).id ? "drag-source" : ""} ${f(H(n).id)}`]), U("click", r, (e) => b(e, H(n))), yr("dragover", r, (e) => h(e, {
						kind: "task",
						id: H(n).id,
						projectId: H(t).id
					})), yr("drop", r, (e) => g(e, {
						kind: "task",
						id: H(n).id,
						projectId: H(t).id
					})), yr("dragstart", y, (e) => m(e, {
						kind: "task",
						id: H(n).id,
						projectId: H(t).id
					})), yr("dragend", y, _), G(e, r);
				}), k(n), G(e, n);
			};
			q(E, (e) => {
				H(t).expanded && e(ee);
			}), z((e) => {
				Y(r, 1, e), X(r, "aria-label", H(t).ariaLabel || void 0), X(r, "title", H(t).statusLabel || void 0), X(i, "data-project-toggle", H(t).children.length ? H(t).id : void 0), K(y, H(t).title), K(S, H(t).ref);
			}, [() => `tree-item ${d(H(t).status)} ${H(t).active ? "active" : ""} ${H(o)?.id === H(t).id ? "drag-source" : ""} ${f(H(t).id)}`]), U("click", r, (e) => b(e, H(t))), yr("dragover", r, (e) => h(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), yr("drop", r, (e) => g(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), yr("dragstart", T, (e) => m(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), yr("dragend", T, _), G(e, n);
		}), G(e, t);
	};
	q(Te, (e) => {
		H(n).loading ? e(Ee) : H(n).error ? e(De, 1) : H(n).projects.length === 0 ? e(Oe, 2) : e(ke, -1);
	}), k(we), k(xe);
	var Ae = R(xe, 2), je = R(Ae, 2), Me = R(L(je), 2), D = L(Me), Ne = (e) => {
		var t = nu();
		Q(L(t), { name: "message-square" }), A(), k(t), G(e, t);
	}, O = (e) => {
		var t = Or();
		J(un(t), 17, () => H(n).sessions, (e) => e.id, (e, t) => {
			var n = ou(), r = un(n), a = L(r), s = (e) => {
				var n = Zl(), r = L(n);
				J(r, 17, () => H(t).status.statuses, (e) => e.key, (e, t) => {
					var n = Xl();
					Q(L(n), {
						get name() {
							return H(t).iconName;
						},
						className: "task-status-icon"
					}), k(n), z(() => Y(n, 1, `task-status-indicator ${H(t).className} ${H(t).recentOutput ? "task-status-fresh" : ""}`)), G(e, n);
				});
				var i = R(r), a = (e) => {
					var n = Xl();
					Q(L(n), {
						name: "lock",
						className: "task-lock-icon"
					}), k(n), z(() => Y(n, 1, `task-lock-indicator ${H(t).status.lock.className}`)), G(e, n);
				};
				q(i, (e) => {
					H(t).status.lock && e(a);
				}), k(n), z(() => Y(n, 1, `task-status-slot session-status-icon ${H(t).status.slotClassName}`)), G(e, n);
			};
			q(a, (e) => {
				H(t).status.hasTaskState && e(s);
			});
			var c = R(a, 2), l = L(c), u = L(l, !0);
			k(l);
			var p = R(l), v = L(p, !0);
			k(p), k(c);
			var b = R(c, 2), S = L(b, !0);
			k(b);
			var C = R(b, 2), w = (e) => {
				G(e, ru());
			};
			q(C, (e) => {
				H(t).unread && e(w);
			});
			var T = R(C, 2);
			Q(L(T), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), k(T), k(r);
			var E = R(r, 2), ee = (e) => {
				var n = au();
				J(n, 21, () => H(t).controls, (e) => e.resourceId, (e, t) => {
					var n = iu(), r = L(n);
					Q(r, { name: "corner-down-right" });
					var i = R(r), a = L(i), o = L(a, !0);
					k(a);
					var s = R(a), c = L(s, !0);
					k(s), k(i), k(n), z(() => {
						n.disabled = !H(t).navigable, K(o, H(t).resourceId), K(c, H(t).path);
					}), U("click", n, () => y(H(t).resourceId)), G(e, n);
				}), k(n), z(() => X(n, "data-session-menu", H(t).id)), G(e, n);
			};
			q(E, (e) => {
				H(i) === H(t).id && H(t).menu && e(ee);
			}), z((e) => {
				Y(r, 1, e), X(r, "aria-label", `${H(t).title}. ${H(t).statusLabel}`), X(r, "title", H(t).statusLabel), K(u, H(t).title), K(v, H(t).meta), Y(b, 1, `session-badge ${H(t).source === "internal" ? "internal" : "external"}`), K(S, H(t).label);
			}, [() => `session-row ${H(t).source === "internal" ? "internal-session" : "external-session"} ${d(H(t).status)} ${H(t).clickable ? "clickable-session" : ""} ${H(t).current ? "current-session" : ""} ${H(t).unread ? "session-unread" : ""} ${H(o)?.id === H(t).id ? "drag-source" : ""} ${f(H(t).id)}`]), U("click", r, (e) => x(e, H(t))), yr("dragover", r, (e) => h(e, {
				kind: "session",
				id: H(t).id,
				projectId: ""
			})), yr("drop", r, (e) => g(e, {
				kind: "session",
				id: H(t).id,
				projectId: ""
			})), yr("dragstart", T, (e) => m(e, {
				kind: "session",
				id: H(t).id,
				projectId: ""
			})), yr("dragend", T, _), G(e, n);
		}), G(e, t);
	};
	q(D, (e) => {
		H(n).sessions.length === 0 ? e(Ne) : e(O, -1);
	}), k(Me), k(je), k(ae);
	var Pe = R(ae, 2), Fe = R(Pe, 2), Ie = R(L(Fe), 2);
	A(2), k(Fe), z(() => {
		X(T, "aria-expanded", H(n).mobile.sidebarOpen), X(ee, "aria-selected", H(n).mobile.view === "details"), X(te, "aria-selected", H(n).mobile.view === "chat"), X(ne, "aria-pressed", H(n).mobile.immersive), K(le, H(n).version), X(pe, "aria-expanded", H(r)), X(he, "src", H(u)?.iconSrc || "/favicon.svg"), K(_e, H(u)?.name || "Workspace"), X(we, "data-navigation-identity", H(n).identity);
	}), U("click", T, () => H(n).onMobileSidebar(!H(n).mobile.sidebarOpen)), U("click", ee, () => H(n).onMobileView("details")), U("click", te, () => H(n).onMobileView("chat")), U("click", ne, () => H(n).onMobileImmersive(!H(n).mobile.immersive)), U("click", ie, () => H(n).onMobileSidebar(!1)), U("click", ue, () => {
		H(n).onMobileSidebar(!1), H(n).onOpenSettings();
	}), U("click", pe, (e) => {
		e.stopPropagation(), I(r, !H(r));
	}), U("click", Ce, function(...e) {
		H(n).onCreateProject?.apply(this, e);
	}), U("pointerdown", Ae, (e) => S(e, "sidebarSessionHeight")), U("pointerdown", Pe, (e) => S(e, "sidebarWidth")), U("pointerdown", Ie, (e) => S(e, "chatWidth")), G(e, C), M();
}
br(["click", "pointerdown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var lu = /* @__PURE__ */ W("<button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button>"), uu = /* @__PURE__ */ W("<button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn; keep the Session open.\" aria-label=\"End current turn; keep the Session open.\"><!></button>"), du = /* @__PURE__ */ W("<span class=\"tty-composer-divider\" aria-hidden=\"true\"></span> <span class=\"tty-composer-group\"><!> <button type=\"button\" id=\"agentCloseSessionButton\" class=\"tty-composer-action tty-close-session-button\"><!></button></span>", 1), fu = /* @__PURE__ */ W("<button type=\"button\" id=\"agentActionsToggle\" class=\"tty-actions-toggle\" title=\"Session actions\" aria-label=\"Session actions\"><!></button>"), pu = /* @__PURE__ */ W("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), mu = /* @__PURE__ */ W("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), hu = /* @__PURE__ */ W("<div id=\"ttyAgentMenu\" class=\"tty-agent-menu\" role=\"menu\" aria-label=\"Choose an Agent\"></div>"), gu = /* @__PURE__ */ W("<div class=\"tty-session-actions collapsible open\"><div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div></div>"), _u = /* @__PURE__ */ W("<form id=\"ttyForm\" class=\"tty-input\"><span>&gt;</span> <textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <span class=\"tty-composer-group\"><!> <button type=\"submit\" class=\"tty-send-button\"><!></button></span> <!> <!></form> <!> <!>", 1), vu = /* @__PURE__ */ W("<div class=\"external-resource-lock\">This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.</div>"), yu = /* @__PURE__ */ W("<button type=\"button\" id=\"agentResumeButton\" class=\"tty-primary-action\" title=\"Resume Session\" aria-label=\"Resume Session\"><!><span>Resume Session</span></button>"), bu = /* @__PURE__ */ W("<div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div>"), xu = /* @__PURE__ */ W("<div class=\"tty-session-actions tty-standalone-actions open\" role=\"toolbar\" aria-label=\"Session actions\"><!> <!> <!></div>");
function Su(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(-1), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(void 0), u = /* @__PURE__ */ N(() => !!H(n).unavailableReason || H(o) || H(n).sending), d = /* @__PURE__ */ N(() => H(n).sessionStarting ? "Creating a new AgentHub session..." : H(n).agents.length ? "Choose an Agent to start a new session." : "No enabled agents are available. Configure an AgentHub Agent in Settings.");
	wi(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity === H(r) ? e.draftResetVersion !== H(i) && (I(i, e.draftResetVersion, !0), I(a, e.draft, !0), I(s, "")) : (I(r, e.identity, !0), I(i, e.draftResetVersion, !0), I(a, e.draft, !0), I(o, !1), I(s, ""), I(c, !1)), queueMicrotask(e.onIconsChanged);
	})), bn(() => {
		H(a), lr().then(g);
	});
	function f() {
		return {
			workspaceId: H(n).workspaceId,
			resourceId: H(n).resourceId,
			runId: H(n).runId,
			draftKey: H(n).draftKey
		};
	}
	function p(e) {
		I(a, e, !0), I(s, ""), H(n).onDraft(e, f());
	}
	async function m(e) {
		e?.preventDefault();
		let t = H(a);
		if (H(u) || !t.trim() || !H(n).runId) return;
		let i = H(r), c = f();
		I(o, !0), I(s, "");
		try {
			let e = await H(n).onSend(t, c);
			H(r) === i && e.accepted && e.clear && H(a) === t && p("");
		} catch (e) {
			H(r) === i && I(s, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(r) === i && (I(o, !1), await lr(), H(l)?.focus({ preventScroll: !0 }));
		}
	}
	function h(e) {
		if (!(e.key !== "Enter" || e.isComposing || e.keyCode === 229)) {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault(), m();
				return;
			}
			if (e.shiftKey) {
				I(c, !0);
				return;
			}
			H(c) || (e.preventDefault(), m());
		}
	}
	function g() {
		if (!H(l)) return;
		H(l).style.height = "auto";
		let e = Math.min(H(l).scrollHeight, 160);
		H(l).style.height = `${e}px`, H(l).style.overflowY = H(l).scrollHeight > 160 ? "auto" : "hidden";
	}
	var _ = Or(), v = un(_), y = (e) => {
		var t = _u(), r = un(t), i = R(L(r), 2);
		rt(i), Si(i, (e) => I(l, e), () => H(l));
		var c = R(i, 2), f = L(c), g = (e) => {
			var t = lu();
			Q(L(t), { name: "plus" }), k(t), U("click", t, function(...e) {
				H(n).onOpenUpload?.apply(this, e);
			}), G(e, t);
		};
		q(f, (e) => {
			H(n).externalLocked || e(g);
		});
		var _ = R(f, 2), v = L(_);
		{
			let e = /* @__PURE__ */ N(() => H(o) ? "loader-circle" : "send");
			Q(v, { get name() {
				return H(e);
			} });
		}
		k(_), k(c);
		var y = R(c, 2), b = (e) => {
			var t = du(), r = R(un(t), 2), i = L(r), a = (e) => {
				var t = uu(), r = L(t);
				{
					let e = /* @__PURE__ */ N(() => H(n).endingTurn ? "loader-circle" : "pause");
					Q(r, { get name() {
						return H(e);
					} });
				}
				k(t), z(() => t.disabled = H(n).endingTurn || H(n).closingSession || H(n).selfDrivingDisabling), U("click", t, function(...e) {
					H(n).onEndTurn?.apply(this, e);
				}), G(e, t);
			};
			q(i, (e) => {
				H(n).canEndTurn && e(a);
			});
			var o = R(i, 2), s = L(o);
			{
				let e = /* @__PURE__ */ N(() => H(n).closingSession ? "loader-circle" : "square");
				Q(s, { get name() {
					return H(e);
				} });
			}
			k(o), k(r), z(() => {
				o.disabled = H(n).endingTurn || H(n).closingSession || H(n).selfDrivingDisabling, X(o, "title", H(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session."), X(o, "aria-label", H(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session.");
			}), U("click", o, function(...e) {
				H(n).onCloseSession?.apply(this, e);
			}), G(e, t);
		};
		q(y, (e) => {
			(H(n).canEndTurn || H(n).runId) && e(b);
		});
		var x = R(y, 2), S = (e) => {
			var t = fu();
			Q(L(t), { name: "ellipsis" }), k(t), z(() => X(t, "aria-expanded", H(n).actionsOpen)), U("click", t, function(...e) {
				H(n).onToggleActions?.apply(this, e);
			}), G(e, t);
		};
		q(x, (e) => {
			H(n).internalLocked || e(S);
		}), k(r);
		var C = R(r, 2), w = (e) => {
			var t = pu(), n = L(t), r = L(n, !0);
			k(n);
			var i = R(n);
			k(t), z(() => {
				K(r, H(s)), i.disabled = H(o);
			}), U("click", i, () => m()), G(e, t);
		};
		q(C, (e) => {
			H(s) && e(w);
		});
		var T = R(C, 2), E = (e) => {
			var t = gu(), r = L(t), i = L(r), a = L(i);
			{
				let e = /* @__PURE__ */ N(() => H(n).sessionStarting ? "loader-circle" : "plus");
				Q(a, { get name() {
					return H(e);
				} });
			}
			var o = R(a), s = L(o, !0);
			k(o), k(i);
			var c = R(i, 2), l = (e) => {
				var t = hu();
				J(t, 21, () => H(n).agents, (e) => e.id, (e, t) => {
					var r = mu();
					let i;
					var a = L(r), o = L(a, !0);
					k(a);
					var s = R(a), c = L(s, !0);
					k(s), k(r), z(() => {
						X(r, "data-agent-choice", H(t).id), i = Y(r, 1, "", null, i, { active: H(t).id === H(n).selectedAgentId }), K(o, H(t).label), K(c, H(t).summary);
					}), U("click", r, () => H(n).onChooseAgent(H(t).id)), G(e, r);
				}), k(t), G(e, t);
			};
			q(c, (e) => {
				H(n).chooserOpen && e(l);
			}), k(r), k(t), z(() => {
				X(i, "title", H(d)), X(i, "aria-label", H(d)), i.disabled = H(n).sessionStarting || !H(n).agents.length, X(i, "aria-expanded", H(n).chooserOpen), K(s, H(n).sessionStarting ? "Creating Session..." : "New Session");
			}), U("click", i, function(...e) {
				H(n).onToggleChooser?.apply(this, e);
			}), G(e, t);
		};
		q(T, (e) => {
			H(n).actionsOpen && !H(n).internalLocked && e(E);
		}), z(() => {
			X(i, "data-agent-draft-key", H(n).draftKey), X(i, "placeholder", H(n).unavailableReason || "Send input to the selected agent session"), i.disabled = H(u), fi(i, H(a)), X(_, "title", H(o) ? "Sending..." : H(n).unavailableReason || "Send input"), X(_, "aria-label", H(o) ? "Sending..." : H(n).unavailableReason || "Send input"), _.disabled = H(u);
		}), yr("submit", r, m), U("input", i, (e) => p(e.currentTarget.value)), U("keydown", i, h), G(e, t);
	}, b = (e) => {
		var t = xu(), r = L(t), i = (e) => {
			G(e, vu());
		};
		q(r, (e) => {
			H(n).externalLocked && e(i);
		});
		var a = R(r, 2), o = (e) => {
			var t = yu();
			Q(L(t), { name: "rotate-ccw" }), A(), k(t), U("click", t, function(...e) {
				H(n).onResume?.apply(this, e);
			}), G(e, t);
		};
		q(a, (e) => {
			H(n).canResume && e(o);
		});
		var s = R(a, 2), c = (e) => {
			var t = bu(), r = L(t), i = L(r);
			{
				let e = /* @__PURE__ */ N(() => H(n).sessionStarting ? "loader-circle" : "plus");
				Q(i, { get name() {
					return H(e);
				} });
			}
			var a = R(i), o = L(a, !0);
			k(a), k(r);
			var s = R(r, 2), c = (e) => {
				var t = hu();
				J(t, 21, () => H(n).agents, (e) => e.id, (e, t) => {
					var r = mu();
					let i;
					var a = L(r), o = L(a, !0);
					k(a);
					var s = R(a), c = L(s, !0);
					k(s), k(r), z(() => {
						X(r, "data-agent-choice", H(t).id), i = Y(r, 1, "", null, i, { active: H(t).id === H(n).selectedAgentId }), K(o, H(t).label), K(c, H(t).summary);
					}), U("click", r, () => H(n).onChooseAgent(H(t).id)), G(e, r);
				}), k(t), G(e, t);
			};
			q(s, (e) => {
				H(n).chooserOpen && e(c);
			}), k(t), z(() => {
				X(r, "title", H(d)), X(r, "aria-label", H(d)), r.disabled = H(n).sessionStarting || !H(n).agents.length, X(r, "aria-expanded", H(n).chooserOpen), K(o, H(n).sessionStarting ? "Creating Session..." : "New Session");
			}), U("click", r, function(...e) {
				H(n).onToggleChooser?.apply(this, e);
			}), G(e, t);
		};
		q(s, (e) => {
			!H(n).internalLocked && !H(n).externalLocked && e(c);
		}), k(t), G(e, t);
	};
	q(v, (e) => {
		H(n).live ? e(y) : e(b, -1);
	}), G(e, _), M();
}
br([
	"input",
	"keydown",
	"click"
]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var Cu = /* @__PURE__ */ W("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function wu(e, t) {
	j(t, !0);
	let n = Ci(t, "draft", 7);
	var r = Cu(), i = L(r);
	rt(i);
	var a = R(i, 2);
	di(a), k(r), z(() => {
		fi(i, n().description), fi(a, n().slug);
	}), U("input", i, (e) => n().description = e.currentTarget.value), U("input", a, (e) => n().slug = e.currentTarget.value), G(e, r), M();
}
br(["input"]);
//#endregion
//#region src/components/SelfDrivingOptions.svelte
var Tu = /* @__PURE__ */ W("<option> </option>"), Eu = /* @__PURE__ */ W("<div class=\"create-task-automation-fields\"><label><span>Agent <small>(optional)</small></span><select name=\"agentName\"><option>Workspace default</option><!></select></label> <label><span>Run instructions</span><textarea name=\"prompt\" placeholder=\"Instructions for the automated run\"></textarea></label> <label><span>Preferred Agent Profiles</span><input name=\"agentProfiles\" placeholder=\"Workspace default, or kimi, codex\"/><small> </small></label> <label><span>Completion criteria</span><textarea name=\"completionCriteria\" placeholder=\"Natural-language completion criteria\"></textarea></label></div>"), Du = /* @__PURE__ */ W("<section class=\"self-driving-options create-section\" aria-label=\"Automation\" data-component-owner=\"self-driving-options\"><div class=\"create-section-title\">Automation</div> <label class=\"create-task-automation-toggle\"><input name=\"selfDriving\" type=\"checkbox\"/><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label> <!></section>");
function Ou(e, t) {
	j(t, !0);
	let n = Ci(t, "draft", 7), r = /* @__PURE__ */ F(Qt(n().selfDriving));
	function i(e) {
		I(r, e.currentTarget.checked, !0), n().selfDriving = H(r), t.onChange();
	}
	function a(e, r) {
		n()[e] = r, t.onChange();
	}
	var o = Du(), s = R(L(o), 2), c = L(s);
	di(c), A(), k(s);
	var l = R(s, 2), u = (e) => {
		var r = Eu(), i = L(r), o = R(L(i)), s = L(o);
		s.value = s.__value = "", J(R(s), 17, () => t.agents, (e) => e.id, (e, t) => {
			var n = Tu(), r = L(n);
			k(n);
			var i = {};
			z(() => {
				K(r, `${H(t).label ?? ""} — ${H(t).summary ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
			}), G(e, n);
		}), k(o);
		var c;
		ii(o), k(i);
		var l = R(i, 2), u = R(L(l));
		rt(u), k(l);
		var d = R(l, 2), f = R(L(d));
		di(f);
		var p = R(f), m = L(p, !0);
		k(p), k(d);
		var h = R(d, 2), g = R(L(h));
		rt(g), k(h), k(r), z((e) => {
			c !== (c = n().agentName) && (o.value = (o.__value = n().agentName) ?? "", ri(o, n().agentName)), fi(u, n().prompt), fi(f, n().agentProfiles), K(m, e), fi(g, n().completionCriteria);
		}, [() => t.profileKeys.length ? `Available: ${t.profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."]), U("change", o, (e) => a("agentName", e.currentTarget.value)), U("input", u, (e) => a("prompt", e.currentTarget.value)), U("input", f, (e) => a("agentProfiles", e.currentTarget.value)), U("input", g, (e) => a("completionCriteria", e.currentTarget.value)), G(e, r);
	};
	q(l, (e) => {
		H(r) && e(u);
	}), k(o), z(() => pi(c, H(r))), U("change", c, i), G(e, o), M();
}
br(["change", "input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var ku = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\"> </button>"), Au = /* @__PURE__ */ W("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), ju = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Updating preview...</p>"), Mu = /* @__PURE__ */ W("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), Nu = /* @__PURE__ */ W("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Pu = /* @__PURE__ */ W("<small> </small>"), Fu = /* @__PURE__ */ W("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <small> </small> <!></section>"), Iu = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), Lu = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Ru = /* @__PURE__ */ W("<!> <!> <!>", 1), zu = /* @__PURE__ */ W("<p class=\"create-task-blank-detail\"> </p>"), Bu = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), Vu = /* @__PURE__ */ W("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!> <small> </small></section>"), Hu = /* @__PURE__ */ W("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function Uu(e, t) {
	j(t, !0);
	let n = Ci(t, "draft", 7), r = /* @__PURE__ */ F(Qt(n().editedMarkdown ?? "")), i = null, a = /* @__PURE__ */ N(() => !!t.preview && H(r) !== t.preview?.markdown);
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
	var c = Hu(), l = L(c), u = R(L(l), 2), d = (e) => {
		var n = ku(), r = L(n, !0);
		k(n), z(() => {
			n.disabled = t.previewing || t.submitting, K(r, t.previewing ? "Rendering..." : "Refresh");
		}), U("click", n, function(...e) {
			t.onRefresh?.apply(this, e);
		}), G(e, n);
	};
	q(u, (e) => {
		t.selectedTemplate && e(d);
	}), k(l);
	var f = R(l, 2), p = (e) => {
		var i = Ru(), c = un(i), l = (e) => {
			var n = Au(), r = L(n, !0);
			k(n), z(() => K(r, t.previewError)), G(e, n);
		};
		q(c, (e) => {
			t.previewError && e(l);
		});
		var u = R(c, 2), d = (e) => {
			G(e, ju());
		};
		q(u, (e) => {
			!t.previewError && t.stale && t.preview && e(d);
		});
		var f = R(u, 2), p = (e) => {
			var i = Fu(), c = L(i), l = L(c, !0);
			k(c);
			var u = R(c, 2);
			rt(u);
			var d = R(u, 2), f = (e) => {
				var t = Mu(), n = R(L(t), 2);
				k(t), U("click", n, s), G(e, t);
			}, p = (e) => {
				G(e, Nu());
			};
			q(d, (e) => {
				H(a) ? e(f) : e(p, -1);
			});
			var m = R(d, 2), h = (e) => {
				var n = Pu(), r = L(n);
				k(n), z(() => K(r, `Slug: ${t.preview.slug ?? ""}`)), G(e, n);
			};
			q(m, (e) => {
				t.preview.slug && e(h);
			});
			var g = R(m, 2), _ = L(g);
			k(g);
			var v = R(g, 2), y = (e) => {
				var r = Pu(), i = L(r);
				k(r), z(() => K(i, `Template ${n().templateName ?? ""} · ${t.templateDigest ?? ""}`)), G(e, r);
			};
			q(v, (e) => {
				t.templateDigest && e(y);
			}), k(i), z(() => {
				K(l, t.preview.title), fi(u, H(r)), K(_, `Self-Driving: ${t.preview.selfDriving ? `on with ${t.preview.selfDriving.agentName || "workspace default"}` : "off"}`);
			}), U("input", u, (e) => o(e.currentTarget.value)), G(e, i);
		}, m = (e) => {
			G(e, Iu());
		}, h = (e) => {
			G(e, Lu());
		};
		q(f, (e) => {
			t.preview ? e(p) : t.previewing ? e(m, 1) : t.previewError || e(h, 2);
		}), G(e, i);
	}, m = (e) => {
		var t = Vu(), r = L(t), i = L(r, !0);
		k(r);
		var a = R(r, 2), o = (e) => {
			var t = zu(), r = L(t, !0);
			k(t), z(() => K(r, n().detail)), G(e, t);
		}, s = /* @__PURE__ */ N(() => n().detail.trim()), c = (e) => {
			G(e, Bu());
		};
		q(a, (e) => {
			H(s) ? e(o) : e(c, -1);
		});
		var l = R(a, 2), u = (e) => {
			var t = Pu(), r = L(t);
			k(t), z((e) => K(r, `Slug: ${e ?? ""}`), [() => n().slug.trim()]), G(e, t);
		}, d = /* @__PURE__ */ N(() => n().slug.trim());
		q(l, (e) => {
			H(d) && e(u);
		});
		var f = R(l, 2), p = L(f);
		k(f), k(t), z((e) => {
			K(i, e), K(p, `Self-Driving: ${n().selfDriving ? `on with ${n().agentName || "workspace default"}` : "off"}`);
		}, [() => n().title.trim() || "Untitled task"]), G(e, t);
	};
	q(f, (e) => {
		t.selectedTemplate ? e(p) : e(m, -1);
	}), k(c), G(e, c), M();
}
br(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var Wu = /* @__PURE__ */ W("<input type=\"checkbox\"/><span> </span>", 1), Gu = /* @__PURE__ */ W("<span> </span>"), Ku = /* @__PURE__ */ W("<textarea></textarea>"), qu = /* @__PURE__ */ W("<option> </option>"), Ju = /* @__PURE__ */ W("<select><option>Select...</option><!></select>"), Yu = /* @__PURE__ */ W("<input/>"), Xu = /* @__PURE__ */ W("<small> </small>"), Zu = /* @__PURE__ */ W("<label><!> <!> <!> <!> <!></label>"), Qu = /* @__PURE__ */ W("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function $u(e, t) {
	j(t, !0);
	function n(e, n) {
		let r = n.currentTarget;
		t.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var r = Qu();
	J(r, 21, () => t.fields, (e) => e.name, (e, r) => {
		var i = Zu();
		let a;
		var o = L(i), s = (e) => {
			var i = Wu(), a = un(i);
			di(a);
			var o = R(a), s = L(o);
			k(o), z(() => {
				pi(a, t.values[H(r).name] === !0), K(s, `${H(r).label ?? ""}${H(r).required ? " *" : ""}`);
			}), U("change", a, (e) => n(H(r), e)), G(e, i);
		}, c = (e) => {
			var t = Gu(), n = L(t);
			k(t), z(() => K(n, `${H(r).label ?? ""}${H(r).required ? " *" : ""}`)), G(e, t);
		};
		q(o, (e) => {
			H(r).type === "boolean" ? e(s) : e(c, -1);
		});
		var l = R(o, 2), u = (e) => {
			var i = Ku();
			rt(i), z((e) => {
				i.required = H(r).required, X(i, "placeholder", H(r).placeholder || ""), fi(i, e);
			}, [() => String(t.values[H(r).name] ?? "")]), U("input", i, (e) => n(H(r), e)), G(e, i);
		};
		q(l, (e) => {
			H(r).type === "textarea" && e(u);
		});
		var d = R(l, 2), f = (e) => {
			var i = Ju(), a = L(i);
			a.value = a.__value = "", J(R(a), 17, () => H(r).options || [], Lr, (e, t) => {
				var n = qu(), r = L(n, !0);
				k(n);
				var i = {};
				z(() => {
					K(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
				}), G(e, n);
			}), k(i);
			var o;
			ii(i), z((e) => {
				i.required = H(r).required, o !== (o = e) && (i.value = (i.__value = e) ?? "", ri(i, e));
			}, [() => String(t.values[H(r).name] ?? "")]), U("change", i, (e) => n(H(r), e)), G(e, i);
		};
		q(d, (e) => {
			H(r).type === "select" && e(f);
		});
		var p = R(d, 2), m = (e) => {
			var i = Yu();
			di(i), z((e) => {
				i.required = H(r).required, X(i, "placeholder", H(r).placeholder || ""), fi(i, e);
			}, [() => String(t.values[H(r).name] ?? "")]), U("input", i, (e) => n(H(r), e)), G(e, i);
		};
		q(p, (e) => {
			H(r).type === "text" && e(m);
		});
		var h = R(p, 2), g = (e) => {
			var t = Xu(), n = L(t, !0);
			k(t), z(() => K(n, H(r).description)), G(e, t);
		};
		q(h, (e) => {
			H(r).description && e(g);
		}), k(i), z(() => a = Y(i, 1, "", null, a, { "template-boolean": H(r).type === "boolean" })), G(e, i);
	}), k(r), z(() => X(r, "aria-label", t.label)), G(e, r), M();
}
br(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var ed = /* @__PURE__ */ W("<small> </small>"), td = /* @__PURE__ */ W("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), nd = /* @__PURE__ */ W("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function rd(e, t) {
	j(t, !0);
	function n(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var r = nd(), i = R(L(r), 2), a = L(i);
	let o;
	var s = R(L(a), 4);
	Q(L(s), { name: "check" }), k(s), k(a), J(R(a, 2), 17, () => t.templates, (e) => e.name, (e, r) => {
		var i = td();
		let a;
		var o = L(i), s = L(o, !0);
		k(o);
		var c = R(o, 2), l = (e) => {
			var t = ed(), n = L(t, !0);
			k(t), z(() => K(n, H(r).description)), G(e, t);
		};
		q(c, (e) => {
			H(r).description && e(l);
		});
		var u = R(c, 2);
		Q(L(u), { name: "check" }), k(u), k(i), z((e) => {
			X(i, "aria-selected", t.selectedName === H(r).name), a = Y(i, 1, "template-card", null, a, { selected: t.selectedName === H(r).name }), i.disabled = !H(r).valid || t.disabled, K(s, e);
		}, [() => n(H(r))]), U("click", i, () => t.onSelect(H(r).name)), G(e, i);
	}), k(i), k(r), z(() => {
		X(a, "aria-selected", t.selectedName === ""), o = Y(a, 1, "template-card", null, o, { selected: t.selectedName === "" }), a.disabled = t.disabled;
	}), U("click", a, () => t.onSelect("")), G(e, r), M();
}
br(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var id = /* @__PURE__ */ W("<small>(generated by template)</small>"), ad = /* @__PURE__ */ W("<small class=\"create-required\">*</small>"), od = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), sd = /* @__PURE__ */ W("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), cd = /* @__PURE__ */ W("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), ld = /* @__PURE__ */ W("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!> <!></div> <!></div>");
function ud(e, t) {
	j(t, !0);
	let n = Ci(t, "draft", 7), r, i = /* @__PURE__ */ N(() => t.model.templates.find((e) => e.name === n().templateName)), a = /* @__PURE__ */ N(() => t.model.preview?.title || ""), o = /* @__PURE__ */ N(() => n().titleOverride ? n().title : H(a)), s = /* @__PURE__ */ N(() => (H(i)?.fields || []).filter((e) => e.required)), c = /* @__PURE__ */ N(() => (H(i)?.fields || []).filter((e) => !e.required)), l = /* @__PURE__ */ N(() => !t.model.preview || t.model.previewKey !== t.model.previewRequestKey(n()));
	Ti(() => {
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
			r = void 0, n().templateName && H(l) && !t.model.submitting && t.model.onPreview(u());
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
	var v = ld(), y = L(v), b = L(y), x = (e) => {
		rd(e, {
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
	q(b, (e) => {
		t.model.templates.length && e(x);
	});
	var S = R(b, 2), C = R(L(S), 2), w = L(C), T = L(w), E = R(L(T)), ee = (e) => {
		G(e, id());
	}, te = (e) => {
		G(e, ad());
	};
	q(E, (e) => {
		H(i)?.taskTitle && !n().titleOverride ? e(ee) : e(te, -1);
	}), k(T);
	var ne = R(T, 2), re = L(ne);
	di(re);
	var ie = R(re, 2), ae = (e) => {
		var t = od();
		U("click", t, g), G(e, t);
	};
	q(ie, (e) => {
		H(i)?.taskTitle && n().titleOverride && e(ae);
	}), k(ne), k(w);
	var oe = R(w, 2), se = R(L(oe), 2), ce = R(L(se), 2);
	di(ce), k(se), k(oe), k(C), k(S);
	var le = R(S, 2), ue = (e) => {
		var t = sd(), r = R(L(t), 2), i = (e) => {
			$u(e, {
				get fields() {
					return H(s);
				},
				get values() {
					return n().templateFields;
				},
				label: "Required template fields",
				onChange: m
			});
		};
		q(r, (e) => {
			H(s).length && e(i);
		});
		var a = R(r, 2), o = (e) => {
			$u(e, {
				get fields() {
					return H(c);
				},
				get values() {
					return n().templateFields;
				},
				label: "Optional template fields",
				onChange: m
			});
		};
		q(a, (e) => {
			H(c).length && e(o);
		}), k(t), G(e, t);
	}, de = (e) => {
		var t = cd(), r = R(L(t), 2);
		rt(r), k(t), z(() => fi(r, n().detail)), U("input", r, (e) => n().detail = e.currentTarget.value), G(e, t);
	};
	q(le, (e) => {
		H(i) ? e(ue) : e(de, -1);
	}), Ou(R(le, 2), {
		get draft() {
			return n();
		},
		get agents() {
			return t.model.agents;
		},
		get profileKeys() {
			return t.model.profileKeys;
		},
		onChange: () => f()
	}), k(y), Uu(R(y, 2), {
		get draft() {
			return n();
		},
		get selectedTemplate() {
			return H(i);
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
			return H(l);
		},
		get templateDigest() {
			return t.model.templateDigest;
		},
		get submitting() {
			return t.model.submitting;
		},
		onRefresh: _
	}), k(v), z(() => {
		re.required = !H(i)?.taskTitle, fi(re, H(i)?.taskTitle ? H(o) : n().title), X(re, "placeholder", H(i)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), fi(ce, n().slug);
	}), U("input", re, (e) => h(e.currentTarget.value)), U("input", ce, (e) => {
		n().slug = e.currentTarget.value, f();
	}), G(e, v), M();
}
br(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var dd = /* @__PURE__ */ W("<span> </span>"), fd = /* @__PURE__ */ W("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function pd(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(Qt(s(H(n).draft))), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(void 0), o = /* @__PURE__ */ N(() => H(r).type === "task");
	wi(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity !== H(i) && (I(i, e.identity, !0), I(r, s(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), wi(() => {
		let e = (e) => {
			if (!H(n).open) return;
			if (e.key === "Escape" && !H(n).submitting) {
				e.preventDefault(), H(n).onClose();
				return;
			}
			if (e.key !== "Tab" || !H(a)) return;
			let t = [...H(a).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
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
		e.preventDefault(), H(n).submitting || await H(n).onSubmit(s(H(r)));
	}
	var l = Or(), u = un(l), d = (e) => {
		var t = fd(), i = L(t), s = R(i, 2);
		let l;
		var u = L(s), d = L(u), f = L(d), p = L(f, !0);
		k(f);
		var m = R(f, 2), h = (e) => {
			var t = dd(), n = L(t, !0);
			k(t), z(() => K(n, H(r).projectId)), G(e, t);
		};
		q(m, (e) => {
			H(o) && e(h);
		}), k(d);
		var g = R(d, 2);
		Q(L(g), { name: "x" }), k(g), k(u);
		var _ = R(u, 2), v = L(_);
		Ir(v, () => H(n).identity, (e) => {
			var t = Or(), i = un(t), a = (e) => {
				ud(e, {
					get draft() {
						return H(r);
					},
					get model() {
						return H(n);
					}
				});
			}, s = (e) => {
				wu(e, { get draft() {
					return H(r);
				} });
			};
			q(i, (e) => {
				H(o) ? e(a) : e(s, -1);
			}), G(e, t);
		});
		var y = R(v, 2), b = L(y), x = L(b, !0);
		k(b);
		var S = R(b, 2);
		k(y), k(_), k(s), Si(s, (e) => I(a, e), () => H(a)), k(t), z(() => {
			l = Y(s, 1, "create-dialog modal-enter", null, l, { "create-task-dialog": H(o) }), X(s, "aria-label", H(o) ? "Create task" : "Create project"), K(p, H(o) ? "Create task" : "Create project"), g.disabled = H(n).submitting, b.disabled = H(n).submitting, K(x, H(n).submitting ? "Creating..." : "Create"), S.disabled = H(n).submitting;
		}), U("click", i, function(...e) {
			H(n).onClose?.apply(this, e);
		}), U("click", g, function(...e) {
			H(n).onClose?.apply(this, e);
		}), yr("submit", _, c), U("click", S, function(...e) {
			H(n).onClose?.apply(this, e);
		}), G(e, t);
	};
	q(u, (e) => {
		H(n).open && e(d);
	}), G(e, l), M();
}
br(["click"]);
//#endregion
//#region src/components/DiffModal.svelte
var md = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), hd = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), gd = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), _d = /* @__PURE__ */ W("<div class=\"diff-viewer\"></div>"), vd = /* @__PURE__ */ W("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function yd(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(void 0), o = /* @__PURE__ */ N(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	bn(() => {
		let e = t.repo, a = H(o);
		if (I(n, null), I(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		I(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (I(n, r, !0), await lr(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (I(i, n instanceof Error ? n.message : String(n), !0), t.onError(H(i)));
		}).finally(() => {
			t.repo === e && (I(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), bn(() => {
		H(n)?.diff, H(a), s();
	}), Ti(() => t.client.requests.abort(H(o)));
	function s() {
		!H(a) || !H(n)?.diff || !window.Diff2Html || (H(a).innerHTML = window.Diff2Html.html(H(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Or(), l = un(c), u = (e) => {
		var o = vd(), s = L(o), c = R(s, 2), l = L(c), u = L(l), d = L(u), f = L(d, !0);
		k(d);
		var p = R(d), m = L(p);
		k(p), k(u);
		var h = R(u);
		Q(L(h), { name: "x" }), k(h), k(l);
		var g = R(l, 2), _ = (e) => {
			var n = md(), r = L(n);
			Q(r, { name: "loader-circle" });
			var i = R(r, 2), a = L(i, !0);
			k(i), k(n), z(() => K(a, t.repo.worktreePath || "")), G(e, n);
		}, v = (e) => {
			var t = hd(), n = L(t);
			Q(n, { name: "triangle-alert" });
			var r = R(n, 2), a = L(r, !0);
			k(r), k(t), z(() => K(a, H(i))), G(e, t);
		}, y = (e) => {
			var t = gd();
			Q(L(t), { name: "check-circle-2" }), A(2), k(t), G(e, t);
		}, b = /* @__PURE__ */ N(() => !H(n)?.hasChanges || !H(n).diff?.trim()), x = (e) => {
			var t = _d();
			Si(t, (e) => I(a, e), () => H(a)), G(e, t);
		};
		q(g, (e) => {
			H(r) ? e(_) : H(i) ? e(v, 1) : H(b) ? e(y, 2) : e(x, -1);
		}), k(c), k(o), z(() => {
			K(f, H(n)?.branch || t.repo.branch || t.repo.name || "Diff"), K(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), U("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), U("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), G(e, o);
	};
	q(l, (e) => {
		t.repo && e(u);
	}), G(e, c), M();
}
br(["click"]);
//#endregion
//#region src/components/detail.ts
function bd(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function xd(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${Dd(e)}</pre>`;
}
function Sd(e) {
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
function Cd(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function wd(e) {
	let t = Date.parse(e || "");
	if (!Number.isFinite(t)) return "unknown";
	let n = Math.round((Date.now() - t) / 1e3), r = n < 0, i = Math.abs(n);
	if (i < 45) return r ? "soon" : "just now";
	for (let [e, t] of [
		["year", 31536e3],
		["month", 2592e3],
		["week", 604800],
		["day", 86400],
		["hour", 3600],
		["min", 60]
	]) {
		if (i < t) continue;
		let n = Math.floor(i / t), a = e === "min" ? "min" : `${e}${n === 1 ? "" : "s"}`;
		return r ? `in ${n} ${a}` : `${n} ${a} ago`;
	}
	return r ? "in 1 min" : "1 min ago";
}
function Td(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function Ed(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...Ed(a.children || [], t, n, r + 1));
	return i;
}
function Dd(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/FileBrowser.svelte
var Od = /* @__PURE__ */ W("<a class=\"artifact-download\"><!></a>"), kd = /* @__PURE__ */ W("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), Ad = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span> </span></div>"), jd = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"file-browser\"><h3><!><span> </span></h3> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function Md(e, t) {
	j(t, !0);
	let n = Ci(t, "entries", 19, () => []), r = Ci(t, "emptyMessage", 3, "No files."), i = Ci(t, "activePath", 3, ""), a = /* @__PURE__ */ N(() => Ed(n(), t.expanded, t.title)), o = /* @__PURE__ */ N(() => t.title === "Wiki" ? "book-open" : "paperclip");
	function s(e) {
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
	var c = jd(), l = L(c), u = L(l);
	Q(u, { get name() {
		return H(o);
	} });
	var d = R(u), f = L(d, !0);
	k(d), k(l);
	var p = R(l, 2), m = L(p), h = L(m), g = (e) => {
		var n = Or();
		J(un(n), 17, () => H(a), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ N(() => H(n).entry.type === "directory"), a = /* @__PURE__ */ N(() => t.expanded.has(`${t.title}:${H(n).entry.path}`));
			var o = kd(), c = L(o);
			let l;
			var u = L(c), d = L(u), f = L(d), p = (e) => {
				{
					let t = /* @__PURE__ */ N(() => H(a) ? "chevron-down" : "chevron-right");
					Q(e, { get name() {
						return H(t);
					} });
				}
			};
			q(f, (e) => {
				H(r) && e(p);
			}), k(d);
			var m = R(d);
			{
				let e = /* @__PURE__ */ N(() => H(r) ? H(a) ? "folder-open" : "folder" : s(H(n).entry.name)), t = /* @__PURE__ */ N(() => H(r) ? "artifact-icon artifact-icon-dir" : "artifact-icon");
				Q(m, {
					get name() {
						return H(e);
					},
					get className() {
						return H(t);
					}
				});
			}
			var h = R(m), g = L(h, !0);
			k(h), k(u);
			var _ = R(u, 2), v = L(_), y = (e) => {
				var r = Od();
				Q(L(r), {
					name: "download",
					className: "artifact-download-icon"
				}), k(r), z((e) => {
					X(r, "href", e), X(r, "download", H(n).entry.name), X(r, "title", `Download ${H(n).entry.name}`), X(r, "aria-label", `Download ${H(n).entry.name}`);
				}, [() => t.rawURL(t.title, H(n).entry.path, !0)]), U("click", r, (e) => e.stopPropagation()), G(e, r);
			};
			q(v, (e) => {
				H(r) || e(y);
			});
			var b = R(v), x = L(b, !0);
			k(b), k(_), k(c), k(o), z((e) => {
				l = Y(c, 1, "artifact-row", null, l, {
					directory: H(r),
					file: !H(r),
					active: i() === `${t.title}:${H(n).entry.path}`
				}), ni(c, `--depth: ${H(n).depth}`), X(h, "title", H(n).entry.path), K(g, H(n).entry.name), K(x, e);
			}, [() => H(r) ? `${(H(n).entry.children || []).length} items` : Td(H(n).entry.size || 0)]), U("click", c, () => H(r) ? t.onToggle(`${t.title}:${H(n).entry.path}`) : t.onPreview(t.title, H(n).entry.path)), G(e, o);
		}), G(e, n);
	}, _ = (e) => {
		var n = Ad(), i = L(n);
		{
			let e = /* @__PURE__ */ N(() => t.title === "Artifacts" ? "archive" : "inbox");
			Q(i, { get name() {
				return H(e);
			} });
		}
		var a = R(i), o = L(a, !0);
		k(a), k(n), z(() => K(o, r())), G(e, n);
	};
	q(h, (e) => {
		H(a).length ? e(g) : e(_, -1);
	}), k(m), k(p), k(c), z(() => K(f, t.title)), G(e, c), M();
}
br(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var Nd = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), Pd = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), Fd = /* @__PURE__ */ W("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), Id = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), Ld = /* @__PURE__ */ W("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Rd = /* @__PURE__ */ W("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), zd = /* @__PURE__ */ W("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Bd(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ N(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ N(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : "");
	bn(() => {
		let e = t.selection, o = H(a);
		if (I(n, null), I(i, ""), !e) {
			t.client.requests.abort(o);
			return;
		}
		I(r, !0);
		let s = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${s}?path=${encodeURIComponent(e.path)}`, { scope: o }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && I(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (I(i, n instanceof Error ? n.message : String(n), !0), t.onError(H(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (I(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Ti(() => t.client.requests.abort(H(a)));
	var s = Or(), c = un(s), l = (e) => {
		var a = zd(), s = L(a), c = R(s, 2), l = L(c), u = L(l), d = L(u), f = L(d, !0);
		k(d);
		var p = R(d), m = L(p);
		k(p), k(u);
		var h = R(u), g = L(h);
		Q(L(g), { name: "external-link" }), A(), k(g);
		var _ = R(g);
		Q(L(_), { name: "x" }), k(_), k(h), k(l);
		var v = R(l, 2), y = (e) => {
			var n = Nd(), r = L(n);
			Q(r, { name: "loader-circle" });
			var i = R(r, 2), a = L(i, !0);
			k(i), k(n), z(() => K(a, t.selection.path)), G(e, n);
		}, b = (e) => {
			var t = Pd(), n = L(t);
			Q(n, { name: "triangle-alert" });
			var r = R(n, 2), a = L(r, !0);
			k(r), k(t), z(() => K(a, H(i))), G(e, t);
		}, x = (e) => {
			var r = Fd(), i = L(r);
			k(r), z(() => {
				X(i, "src", H(o)), X(i, "alt", H(n).name || t.selection.path);
			}), G(e, r);
		}, S = (e) => {
			var r = Id(), i = L(r);
			Q(i, { name: "file-warning" });
			var a = R(i), o = L(a, !0);
			k(a);
			var s = R(a), c = L(s);
			k(s), k(r), z((e) => {
				K(o, H(n).name || t.selection.path), K(c, `Binary file, ${e ?? ""}.`);
			}, [() => Td(H(n).size || 0)]), G(e, r);
		}, C = (e) => {
			var t = Ld();
			Kr(t, () => xd(H(n)?.content || ""), !0), k(t), G(e, t);
		}, w = /* @__PURE__ */ N(() => bd(H(n)?.path || t.selection.path)), T = (e) => {
			var t = Rd(), r = L(t, !0);
			k(t), z(() => K(r, H(n)?.content || "")), G(e, t);
		};
		q(v, (e) => {
			H(r) ? e(y) : H(i) ? e(b, 1) : H(n)?.image ? e(x, 2) : H(n)?.binary ? e(S, 3) : H(w) ? e(C, 4) : e(T, -1);
		}), k(c), k(a), z((e, r) => {
			X(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${H(n)?.contentHash || "pending"}`), K(f, e), K(m, `${t.selection.path ?? ""}${r ?? ""}${H(n)?.truncated ? " · truncated" : ""}`), X(g, "href", H(o));
		}, [() => H(n)?.name || t.selection.path.split("/").pop() || "File preview", () => H(n)?.size == null ? "" : ` · ${Td(H(n).size)}`]), U("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), U("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), G(e, a);
	};
	q(c, (e) => {
		t.selection && e(l);
	}), G(e, s), M();
}
br(["click"]);
//#endregion
//#region src/components/LogTimeline.svelte
var Vd = /* @__PURE__ */ W("<div class=\"markdown-rendered\"></div>"), Hd = /* @__PURE__ */ W("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), Ud = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), Wd = /* @__PURE__ */ W("<div class=\"log-load-actions\"><button type=\"button\" class=\"secondary-button log-load-more\"><!><span> </span></button></div>"), Gd = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"log-timeline\"><h3><!><span>Log</span></h3> <div class=\"log-timeline\"></div> <!> <!></div>");
function Kd(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => [...t.logs || []].sort(Cd)), r = /* @__PURE__ */ F(!1);
	async function i() {
		if (!(t.loading || H(r))) {
			I(r, !0);
			try {
				await t.onLoadMore();
			} finally {
				I(r, !1), queueMicrotask(t.onIconsChanged);
			}
		}
	}
	var a = Or(), o = un(a), s = (e) => {
		var a = Gd(), o = L(a);
		Q(L(o), { name: "history" }), A(), k(o);
		var s = R(o, 2);
		J(s, 21, () => H(n), (e) => e.id, (e, t) => {
			var n = Hd(), r = L(n), i = L(r), a = L(i), o = L(a, !0);
			k(a);
			var s = R(a), c = L(s, !0);
			k(s), k(i);
			var l = R(i, 2), u = L(l, !0);
			k(l);
			var d = R(l, 2);
			Q(L(d), { name: "chevron-right" }), k(d), k(r);
			var f = R(r, 2);
			let p;
			var m = L(f), h = (e) => {
				var n = Vd();
				Kr(n, () => xd(H(t).details), !0), k(n), G(e, n);
			}, g = (e) => {
				G(e, Dr("No details."));
			};
			q(m, (e) => {
				H(t).details ? e(h) : e(g, -1);
			}), k(f), k(n), z((e) => {
				X(n, "data-log-id", H(t).id), X(i, "title", H(t).time), K(o, e), K(c, H(t).time), K(u, H(t).title || "Untitled log entry"), p = Y(f, 1, "log-details", null, p, { empty: !H(t).details });
			}, [() => wd(H(t).time)]), G(e, n);
		}), k(s);
		var c = R(s, 2), l = (e) => {
			var n = Ud(), r = L(n, !0);
			k(n), z(() => K(r, t.error)), G(e, n);
		};
		q(c, (e) => {
			t.error && e(l);
		});
		var u = R(c, 2), d = (e) => {
			var n = Wd(), a = L(n), o = L(a);
			{
				let e = /* @__PURE__ */ N(() => t.loading || H(r) ? "loader-circle" : "chevron-down"), n = /* @__PURE__ */ N(() => t.loading || H(r) ? "spin" : "");
				Q(o, {
					get name() {
						return H(e);
					},
					get className() {
						return H(n);
					}
				});
			}
			var s = R(o), c = L(s, !0);
			k(s), k(a), k(n), z(() => {
				a.disabled = t.loading || H(r), X(a, "aria-busy", t.loading || H(r)), K(c, t.loading || H(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), U("click", a, i), G(e, n);
		};
		q(u, (e) => {
			t.hasMore && e(d);
		}), k(a), z(() => X(a, "data-log-resource", t.resourceId)), G(e, a);
	};
	q(o, (e) => {
		(H(n).length || t.error || t.hasMore) && e(s);
	}), G(e, a), M();
}
br(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var qd = /* @__PURE__ */ W("<a class=\"markdown-open-file\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a>"), Jd = /* @__PURE__ */ W("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), Yd = /* @__PURE__ */ W("<pre class=\"markdown-view\"> </pre>"), Xd = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"markdown-document\"><h3><!><span> </span> <!></h3> <!></div>");
function Zd(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => bd(t.file.name)), r = /* @__PURE__ */ N(() => `/api/workspaces/${encodeURIComponent(t.workspaceId)}/files/raw?path=${encodeURIComponent(t.file.path || "")}`);
	var i = Xd(), a = L(i), o = L(a);
	Q(o, { name: "file-text" });
	var s = R(o), c = L(s, !0);
	k(s);
	var l = R(s, 2), u = (e) => {
		var n = qd();
		Q(L(n), { name: "external-link" }), A(), k(n), z(() => {
			X(n, "href", H(r)), X(n, "aria-label", `Open ${t.file.name} in new window`);
		}), G(e, n);
	};
	q(l, (e) => {
		H(n) && t.file.path && e(u);
	}), k(a);
	var d = R(a, 2), f = (e) => {
		var n = Jd(), r = L(n);
		Kr(r, () => xd(t.file.content || ""), !0), k(r), k(n), G(e, n);
	}, p = (e) => {
		var n = Yd(), r = L(n, !0);
		k(n), z(() => K(r, t.file.content || "")), G(e, n);
	};
	q(d, (e) => {
		H(n) ? e(f) : e(p, -1);
	}), k(i), z(() => {
		X(i, "data-doc-file", t.file.name), X(i, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`), K(c, t.file.name);
	}), G(e, i), M();
}
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var Qd = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), $d = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), ef = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), tf = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), nf = /* @__PURE__ */ W("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><!><span> </span></button></div></form>"), rf = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function af(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(""), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(""), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ N(() => H(r) !== H(i)), u = /* @__PURE__ */ N(() => !!(H(l) && H(o) && H(a) && H(o) !== H(a)));
	bn(() => {
		let e = Sd(t.file?.content || ""), u = t.file?.contentHash || "";
		I(o, u, !0), t.identity === H(n) ? !H(l) && u !== H(a) && (I(r, e, !0), I(i, e, !0), I(a, u, !0)) : (I(n, t.identity, !0), I(r, e, !0), I(i, e, !0), I(a, u, !0), I(c, ""), I(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), H(s) || !H(l)) return;
		let u = H(n);
		I(s, !0), I(c, "");
		try {
			let e = await t.onSave(H(r), H(a));
			if (H(n) !== u) return;
			I(i, Sd(e.content || H(r)), !0), I(r, H(i), !0), I(a, e.contentHash || "", !0), I(o, H(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			H(n) === u && I(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(n) === u && (I(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = rf(), p = L(f);
	Q(L(p), { name: "file-text" }), A(), k(p);
	var m = R(p, 2), h = (e) => {
		var t = Qd();
		Q(L(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(), k(t), G(e, t);
	}, g = (e) => {
		var n = $d(), r = L(n);
		Q(r, { name: "triangle-alert" });
		var i = R(r, 2), a = L(i, !0);
		k(i), k(n), z(() => K(a, t.file.error)), G(e, n);
	}, _ = (e) => {
		var t = nf(), n = L(t);
		rt(n);
		var i = R(n, 2), a = (e) => {
			G(e, ef());
		};
		q(i, (e) => {
			H(u) && e(a);
		});
		var o = R(i, 2), f = (e) => {
			var t = tf(), n = L(t, !0);
			k(t), z(() => K(n, H(c))), G(e, t);
		};
		q(o, (e) => {
			H(c) && e(f);
		});
		var p = R(o, 2), m = L(p), h = L(m);
		{
			let e = /* @__PURE__ */ N(() => H(s) ? "loader-circle" : "save");
			Q(h, { get name() {
				return H(e);
			} });
		}
		var g = R(h), _ = L(g, !0);
		k(g), k(m), k(p), k(t), z(() => {
			n.disabled = H(s), m.disabled = H(s) || !H(l), K(_, H(s) ? "Saving" : "Save");
		}), yr("submit", t, d), _i(n, () => H(r), (e) => I(r, e)), G(e, t);
	};
	q(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), k(f), G(e, f), M();
}
//#endregion
//#region src/components/DetailPanel.svelte
var of = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div>"), sf = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), cf = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), lf = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> </h1></div></div> <!> <!>", 1), uf = /* @__PURE__ */ W("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), df = /* @__PURE__ */ W("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), ff = /* @__PURE__ */ W("<div class=\"details-actions\"><!><button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button></div>"), pf = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading details...</strong></div>"), mf = /* @__PURE__ */ W("<span class=\"details-tab-count\"> </span>"), hf = /* @__PURE__ */ W("<button type=\"button\" role=\"tab\"><span> </span><!></button>"), gf = /* @__PURE__ */ W("<div><!></div>"), _f = /* @__PURE__ */ W("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), vf = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), yf = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Task Templates</span></h3><div class=\"template-list\"><!></div></div>"), bf = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Template</span></h3><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), xf = /* @__PURE__ */ W("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), Sf = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), Cf = /* @__PURE__ */ W("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><h3><!><span>Worktrees</span></h3><div class=\"worktree-list\"><!></div></div></div>", 1), wf = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <code class=\"resource-ref-badge\"> </code></h1><!></div></div> <!>", 1), Tf = /* @__PURE__ */ W("<!> <!> <!>", 1);
function Ef(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(Qt(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ F(null), s = /* @__PURE__ */ F(null), c = /* @__PURE__ */ new Map(), l = new Sa(), u = /* @__PURE__ */ N(() => (H(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), d = /* @__PURE__ */ N(() => new Set(H(u).map((e) => e.name))), f = /* @__PURE__ */ N(h), p = /* @__PURE__ */ N(() => H(o) ? `${H(o).section}:${H(o).path}` : "");
	wi(() => t.channel.subscribe((e) => {
		if (I(n, e, !0), e.identity !== H(r)) {
			H(r) && H(i) && c.set(H(r), H(i)), I(r, e.identity, !0), I(o, null), I(s, null), I(a, /* @__PURE__ */ new Set(), !0), I(i, c.get(H(r)) || m(e), !0);
			let t = document.getElementById("detailsPanel");
			t && (t.scrollTop = 0);
		} else H(f).length && !H(f).some((e) => e.id === H(i)) && I(i, H(f)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), wi(() => {
		let e = (e) => {
			e.key === "Escape" && (H(s) ? (e.preventDefault(), I(s, null)) : H(o) && (e.preventDefault(), I(o, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Ti(() => l.dispose());
	function m(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : t.some((e) => e.name === "work.md") ? "work" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "logs";
	}
	function h() {
		if (!H(n).detail) return [];
		let e = [];
		return H(d).has("project.md") && e.push({
			id: "project",
			label: "Project"
		}), H(d).has("task.md") && e.push({
			id: "task",
			label: "Task"
		}), H(d).has("work.md") && e.push({
			id: "work",
			label: "Work"
		}), (H(n).resourceType === "project" || H(n).detail.template) && e.push({
			id: "template",
			label: "Template"
		}), e.push({
			id: "logs",
			label: "Logs"
		}, {
			id: "artifacts",
			label: "Artifacts"
		}), H(n).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees"
		}), e;
	}
	function g(e) {
		return e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : e.name === "work.md" ? "work" : H(f).find((e) => [
			"project",
			"task",
			"work"
		].includes(e.id))?.id || "";
	}
	function _(e) {
		I(i, e, !0), c.set(H(r), e);
	}
	function v(e) {
		let t = new Set(H(a));
		t.has(e) ? t.delete(e) : t.add(e), I(a, t, !0), queueMicrotask(H(n).onIconsChanged);
	}
	function y(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(H(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function b(e, t) {
		I(o, {
			section: e,
			path: t
		}, !0);
	}
	function x(e) {
		e && H(n).onToast(e);
	}
	var S = Tf(), C = un(S), w = (e) => {
		var t = of();
		Q(L(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(t), G(e, t);
	}, T = (e) => {
		var t = lf(), r = un(t), i = L(r), o = L(i), s = L(o, !0);
		k(o), k(i);
		var c = R(i), l = L(c), u = L(l, !0);
		k(l), k(c), k(r);
		var d = R(r, 2);
		af(d, {
			get identity() {
				return H(n).identity;
			},
			get file() {
				return H(n).workspaceAgents;
			},
			get onSave() {
				return H(n).onSaveWorkspaceAgents;
			},
			get onToast() {
				return H(n).onToast;
			},
			get onIconsChanged() {
				return H(n).onIconsChanged;
			}
		});
		var f = R(d, 2), m = (e) => {
			var t = sf(), r = L(t);
			Q(L(r), { name: "book-open" }), A(), k(r);
			var i = R(r), a = L(i);
			Q(a, { name: "triangle-alert" });
			var o = R(a, 2), s = L(o, !0);
			k(o), k(i), k(t), z(() => K(s, H(n).wiki.error)), G(e, t);
		}, h = (e) => {
			var t = cf(), n = L(t);
			Q(L(n), { name: "book-open" }), A(), k(n);
			var r = R(n);
			Q(L(r), { name: "book-open" }), A(2), k(r), k(t), G(e, t);
		}, g = (e) => {
			{
				let t = /* @__PURE__ */ N(() => H(n).wiki.entries || []);
				Md(e, {
					title: "Wiki",
					get entries() {
						return H(t);
					},
					emptyMessage: "No Wiki files yet.",
					get expanded() {
						return H(a);
					},
					get activePath() {
						return H(p);
					},
					onToggle: v,
					onPreview: b,
					rawURL: y
				});
			}
		};
		q(f, (e) => {
			H(n).wiki?.error ? e(m) : H(n).wiki?.exists ? e(g, -1) : e(h, 1);
		}), z(() => {
			K(s, H(n).workspaceName), K(u, H(n).workspaceName);
		}), U("click", o, () => H(n).onNavigate("workspace")), G(e, t);
	}, E = (e) => {
		var t = wf(), r = un(t), o = L(r), c = L(o), l = L(c, !0);
		k(c);
		var d = R(c, 2), m = (e) => {
			var t = uf(), r = R(un(t)), i = L(r, !0);
			k(r), z(() => K(i, H(n).parent.title)), U("click", r, () => H(n).onNavigate(H(n).parent?.id || "workspace")), G(e, t);
		};
		q(d, (e) => {
			H(n).parent && e(m);
		});
		var h = R(d, 3), x = L(h, !0);
		k(h), k(o);
		var S = R(o, 2), C = L(S), w = L(C, !0), T = R(w), E = L(T, !0);
		k(T), k(C);
		var ee = R(C), te = (e) => {
			var t = ff(), r = L(t), i = (e) => {
				var t = df();
				Q(L(t), { name: "plus" }), A(), k(t), U("click", t, () => H(n).onCreateTask(H(n).resourceId)), G(e, t);
			};
			q(r, (e) => {
				H(n).resourceType === "project" && e(i);
			});
			var a = R(r);
			Q(L(a), { name: "archive" }), A(), k(a), k(t), U("click", a, () => H(n).onArchive(H(n).resourceId)), G(e, t);
		};
		q(ee, (e) => {
			H(n).detail && e(te);
		}), k(S), k(r);
		var ne = R(r, 2), re = (e) => {
			var t = pf();
			Q(L(t), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), A(), k(t), G(e, t);
		}, ie = (e) => {
			var t = Cf(), r = un(t);
			J(r, 21, () => H(f), (e) => e.id, (e, t) => {
				var r = hf();
				let a;
				var o = L(r), s = L(o, !0);
				k(o);
				var c = R(o), l = (e) => {
					var t = mf(), r = L(t, !0);
					k(t), z(() => K(r, H(n).detail.logs.length)), G(e, t);
				};
				q(c, (e) => {
					H(t).id === "logs" && H(n).detail.logs?.length && e(l);
				}), k(r), z(() => {
					a = Y(r, 1, "details-tab", null, a, { active: H(i) === H(t).id }), X(r, "aria-selected", H(i) === H(t).id), K(s, H(t).label);
				}), U("click", r, () => _(H(t).id)), G(e, r);
			}), k(r);
			var o = R(r, 2);
			J(o, 17, () => H(u), (e) => e.path || e.name, (e, t) => {
				var r = gf();
				Zd(L(r), {
					get file() {
						return H(t);
					},
					get workspaceId() {
						return H(n).workspaceId;
					}
				}), k(r), z((e) => X(r, "hidden", e), [() => H(i) !== g(H(t))]), G(e, r);
			});
			var c = R(o, 2), l = L(c), d = (e) => {
				var t = yf(), r = L(t);
				Q(L(r), { name: "layout-template" }), A(), k(r);
				var i = R(r), a = L(i), o = (e) => {
					var t = Or();
					J(un(t), 17, () => H(n).detail.templates, (e) => e.name, (e, t) => {
						var n = _f();
						let r;
						var i = L(n);
						Q(i, { name: "file-text" });
						var a = R(i), o = L(a), s = L(o, !0);
						k(o);
						var c = R(o), l = L(c);
						k(c), k(a), Q(R(a), { name: "chevron-right" }), k(n), z(() => {
							r = Y(n, 1, "template-row", null, r, { invalid: !H(t).valid }), K(s, H(t).title || H(t).name), K(l, `${H(t).name ?? ""} · v${(H(t).schemaVersion || "?") ?? ""} · ${H(t).valid ? `${(H(t).fields || []).length} fields` : `invalid${H(t).errors?.[0]?.message ? `: ${H(t).errors[0].message}` : ""}`}${H(t).legacy ? " · legacy" : ""}`);
						}), U("click", n, () => H(t).path && b("Templates", H(t).path)), G(e, n);
					}), G(e, t);
				}, s = (e) => {
					var t = vf();
					Q(L(t), { name: "layout-template" }), A(), k(t), G(e, t);
				};
				q(a, (e) => {
					H(n).detail.templates?.length ? e(o) : e(s, -1);
				}), k(i), k(t), G(e, t);
			}, m = (e) => {
				var t = bf(), r = L(t);
				Q(L(r), { name: "layout-template" }), A(), k(r);
				var i = R(r), a = L(i), o = L(a);
				Q(o, { name: "file-text" });
				var s = R(o), c = L(s), l = L(c, !0);
				k(c);
				var u = R(c), d = L(u);
				k(u), k(s), k(a), k(i), k(t), z(() => {
					K(l, H(n).detail.template.name), K(d, `Created from template · v${(H(n).detail.template.schemaVersion || "?") ?? ""} · ${(H(n).detail.template.digest || "") ?? ""}`);
				}), G(e, t);
			};
			q(l, (e) => {
				H(n).resourceType === "project" ? e(d) : H(n).detail.template && e(m, 1);
			}), k(c);
			var h = R(c, 2), x = L(h);
			{
				let e = /* @__PURE__ */ N(() => H(n).detail.logs || []);
				Kd(x, {
					get resourceId() {
						return H(n).resourceId;
					},
					get logs() {
						return H(e);
					},
					get hasMore() {
						return H(n).logs.hasMore;
					},
					get loading() {
						return H(n).logs.loading;
					},
					get error() {
						return H(n).logs.error;
					},
					onLoadMore: () => H(n).onLoadMoreLogs(H(n).resourceId),
					get onIconsChanged() {
						return H(n).onIconsChanged;
					}
				});
			}
			k(h);
			var S = R(h, 2), C = L(S);
			{
				let e = /* @__PURE__ */ N(() => H(n).detail.artifacts || []);
				Md(C, {
					title: "Artifacts",
					get entries() {
						return H(e);
					},
					emptyMessage: "No artifacts.",
					get expanded() {
						return H(a);
					},
					get activePath() {
						return H(p);
					},
					onToggle: v,
					onPreview: b,
					rawURL: y
				});
			}
			k(S);
			var w = R(S, 2), T = L(w), E = L(T);
			Q(L(E), { name: "folder-git-2" }), A(), k(E);
			var ee = R(E), te = L(ee), ne = (e) => {
				var t = Or();
				J(un(t), 17, () => H(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = xf(), r = L(n), i = L(r);
					Q(i, {
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
					Q(L(p), { name: "git-compare-arrows" }), A(), k(p), k(n), z(() => {
						K(c, H(t).branch || "HEAD"), K(u, `${(H(t).name || "repository") ?? ""}${H(t).targetBranch || H(t).baseBranch ? ` · base ${H(t).targetBranch || H(t).baseBranch}` : ""}`), K(f, H(t).worktreePath || "");
					}), U("click", p, () => I(s, H(t), !0)), G(e, n);
				}), G(e, t);
			}, re = (e) => {
				var t = Sf();
				Q(L(t), { name: "git-branch" }), A(), k(t), G(e, t);
			};
			q(te, (e) => {
				H(n).detail.repos?.length ? e(ne) : e(re, -1);
			}), k(ee), k(T), k(w), z(() => {
				X(c, "hidden", H(i) !== "template"), X(h, "hidden", H(i) !== "logs"), X(S, "hidden", H(i) !== "artifacts"), X(w, "hidden", H(i) !== "worktrees");
			}), G(e, t);
		};
		q(ne, (e) => {
			H(n).loading || !H(n).detail ? e(re) : e(ie, -1);
		}), z(() => {
			K(l, H(n).workspaceName), K(x, H(n).resourceTitle), K(w, H(n).resourceTitle), K(E, H(n).resourceId);
		}), U("click", c, () => H(n).onNavigate("workspace")), U("click", h, () => H(n).onNavigate(H(n).resourceId)), G(e, t);
	};
	q(C, (e) => {
		H(n).workspaceId ? H(n).resourceType === "workspace" ? e(T, 1) : e(E, -1) : e(w);
	});
	var ee = R(C, 2);
	Bd(ee, {
		get client() {
			return l;
		},
		get workspaceId() {
			return H(n).workspaceId;
		},
		get resourceId() {
			return H(n).resourceId;
		},
		get selection() {
			return H(o);
		},
		onClose: () => I(o, null),
		onError: x,
		get onIconsChanged() {
			return H(n).onIconsChanged;
		}
	}), yd(R(ee, 2), {
		get client() {
			return l;
		},
		get workspaceId() {
			return H(n).workspaceId;
		},
		get resourceId() {
			return H(n).resourceId;
		},
		get repo() {
			return H(s);
		},
		onClose: () => I(s, null),
		onError: x,
		get onIconsChanged() {
			return H(n).onIconsChanged;
		}
	}), G(e, S), M();
}
br(["click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var Df = /* @__PURE__ */ W("<p class=\"approval-question\"> </p>"), Of = /* @__PURE__ */ W("<p> </p>"), kf = /* @__PURE__ */ W("<button> </button>"), Af = /* @__PURE__ */ W("<div class=\"approval-options\"></div>"), jf = /* @__PURE__ */ W("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), Mf = /* @__PURE__ */ W("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), Nf = /* @__PURE__ */ W("<!> <!>", 1), Pf = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function Ff(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(""), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(Qt(a()));
	bn(() => {
		let e = a();
		e !== H(i) && (I(i, e, !0), I(n, ""), I(r, !1));
	});
	function a() {
		return `${t.contextIdentity}:${String(t.item.approvalId || "")}`;
	}
	async function o(e) {
		let i = String(t.item.approvalId || "");
		if (!(!i || H(r))) {
			I(r, !0);
			try {
				await t.onApproval(t.runId, i, e), I(n, "");
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
	var c = Pf(), l = L(c), u = L(l);
	Q(u, { name: "shield-question" });
	var d = R(u), f = L(d, !0);
	k(d), k(l);
	var p = R(l, 2), m = (e) => {
		var n = Df(), r = L(n, !0);
		k(n), z(() => K(r, t.item.question)), G(e, n);
	};
	q(p, (e) => {
		t.item.question && e(m);
	});
	var h = R(p, 2), g = (e) => {
		var n = Of(), r = L(n, !0);
		k(n), z(() => K(r, t.item.detail)), G(e, n);
	};
	q(h, (e) => {
		t.item.detail && e(g);
	});
	var _ = R(h, 2), v = (e) => {
		var i = Nf(), a = un(i), c = (e) => {
			var n = Af();
			J(n, 21, () => t.item.options, (e) => e.optionId, (e, t) => {
				var n = kf();
				let i;
				var a = L(n, !0);
				k(n), z((e, t) => {
					n.disabled = H(r), i = Y(n, 1, "", null, i, e), K(a, t);
				}, [() => ({ "secondary-button": String(H(t).kind || "").startsWith("reject") }), () => s(H(t))]), U("click", n, () => o({ optionId: H(t).optionId })), G(e, n);
			}), k(n), G(e, n);
		}, l = (e) => {
			var t = jf(), n = L(t);
			Q(L(n), { name: "check" }), A(), k(n);
			var i = R(n);
			Q(L(i), { name: "x" }), A(), k(i), k(t), z(() => {
				n.disabled = H(r), i.disabled = H(r);
			}), U("click", n, () => o({ decision: "accept" })), U("click", i, () => o({ decision: "decline" })), G(e, t);
		};
		q(a, (e) => {
			t.item.options?.length ? e(c) : e(l, -1);
		});
		var u = R(a, 2), d = (e) => {
			var t = Mf(), i = L(t);
			di(i);
			var a = R(i);
			k(t), z((e) => a.disabled = e, [() => !H(n).trim() || H(r)]), yr("submit", t, (e) => {
				e.preventDefault(), H(n).trim() && o({ text: H(n).trim() });
			}), _i(i, () => H(n), (e) => I(n, e)), G(e, t);
		};
		q(u, (e) => {
			t.item.question && e(d);
		}), G(e, i);
	}, y = (e) => {
		var n = Of(), r = L(n);
		k(n), z(() => K(r, `${(t.item.decision || (t.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${t.item.reply ? `: ${t.item.reply}` : ""}`)), G(e, n);
	};
	q(_, (e) => {
		t.item.status === "pending" ? e(v) : e(y, -1);
	}), k(c), z(() => K(f, t.item.title || "Approval requested")), G(e, c), M();
}
br(["click"]);
//#endregion
//#region src/components/timeline-events.ts
function If(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? Wf(r, n) : Gf(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function Lf(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) Rf(n, e);
	return n;
}
function Rf(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, Gf(t));
		return;
	}
	e[a] = Wf(e[a], t);
}
function zf(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = Bf(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? Vf(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function Bf(e) {
	if (e.type !== "tool.event") return "";
	let t = Hf(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? Hf(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? Uf(n.toolCallId) || Uf(n.id) : "";
}
function Vf(e, t) {
	let n = e.data || {}, r = t.data || {}, i = Hf(n.raw), a = Hf(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? Hf(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? Hf(a.update) : a;
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
function Hf(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Uf(e) {
	return typeof e == "string" ? e.trim() : "";
}
function Wf(e, t) {
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
function Gf(e) {
	return e.data?.append === !0 ? {
		...e,
		data: {
			...e.data,
			append: !1
		}
	} : e;
}
//#endregion
//#region src/components/chat-state.ts
var Kf = 250, qf = 80, Jf = /* @__PURE__ */ new Set(["session.launch-environment"]), Yf = class {
	api;
	eventSourceFactory;
	contexts = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	onEvent;
	onNotice;
	streamBatchWindowMs;
	activeKey = "";
	disposed = !1;
	constructor(e = {}) {
		this.api = e.api ?? new Sa(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? qf);
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t) {
		if (this.disposed) return;
		let n = String(t?.id || "").trim(), r = Zf(e, n), i = this.activeKey !== r;
		if (this.activeKey && this.activeKey !== r && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !e || !n) {
			this.emit();
			return;
		}
		let a = this.contexts.get(r) ?? this.createContext(e, n);
		a.run = t, a.acceptedSessionIds = np(t);
		let o = this.reconcileNotices(a);
		!rp(t) && a.stream && (a.streamGeneration++, a.stream.close(), a.stream = null), (i || o) && this.emit(), !a.loaded && !a.loading ? this.loadInitial(a) : this.connect(a);
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.beforeId) return !1;
		let t = e.generation, n = e.beforeId;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest($f(e, `before=${encodeURIComponent(n)}&limit=${Kf}`), { scope: Qf(e, "older") });
			if (!this.isCurrent(e, t)) return !1;
			let i = Xf(r.events), a = ep(i);
			return i.length && (!a || a >= n) ? (e.hasMoreBefore = !1, !1) : (e.events = zf(If([...i, ...e.events])), a && (e.beforeId = a), e.hasMoreBefore = !!(r.page?.hasMoreBefore && a), i.length > 0);
		} catch (n) {
			return n instanceof ba || !this.isCurrent(e, t) || (e.error = sp(n)), !1;
		} finally {
			this.isCurrent(e, t) && (e.loadingOlder = !1, this.emit());
		}
	}
	snapshot() {
		let e = this.activeContext();
		return e ? {
			identity: e.key,
			workspaceId: e.workspaceId,
			runId: e.runId,
			events: e.events.filter((e) => !Jf.has(e.type)),
			notices: [...e.notices],
			hasMoreBefore: e.hasMoreBefore,
			loading: e.loading,
			loadingOlder: e.loadingOlder,
			loaded: e.loaded,
			error: e.error
		} : op();
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
			key: Zf(e, t),
			workspaceId: e,
			runId: t,
			acceptedSessionIds: /* @__PURE__ */ new Set([t]),
			run: null,
			generation: 1,
			streamGeneration: 0,
			events: [],
			notices: [],
			noticeWatermarks: /* @__PURE__ */ new Map(),
			beforeId: 0,
			hasMoreBefore: !1,
			loading: !1,
			loadingOlder: !1,
			loaded: !1,
			error: "",
			stream: null,
			pendingEvents: [],
			flushTimer: null
		};
		return this.contexts.set(n.key, n), n;
	}
	async loadInitial(e) {
		let t = e.generation;
		e.loading = !0, e.error = "", this.emit();
		try {
			let n = await this.api.latest($f(e, `latest=true&limit=${Kf}`), { scope: Qf(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			let r = Xf(n.events).filter((t) => this.eventBelongsToContext(e, t));
			e.events = zf(If(r)), e.beforeId = ep(r), e.hasMoreBefore = !!(n.page?.hasMoreBefore && e.beforeId), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof ba || !this.isCurrent(e, t)) return;
			e.error = sp(n);
		} finally {
			this.isCurrent(e, t) && (e.loading = !1, this.emit());
		}
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !rp(e.run)) return;
		let t = tp(e.events), n = t ? `?after=${encodeURIComponent(t)}` : "", r = ++e.streamGeneration, i = this.eventSourceFactory(`/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/stream${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.runId, n), this.scheduleEventFlush(e);
			} catch {
				e.error = "An Agent event could not be decoded.", this.emit();
			}
		}, i.addEventListener("forge.notice", (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.noticeBelongsToContext(e, n)) return;
				this.flushEvents(e, !1), this.appendNotice(e, n), this.onNotice?.(e.workspaceId, e.runId, n), this.emit();
			} catch {
				e.error = "A Forge notice could not be decoded.", this.emit();
			}
		}), i.onerror = () => {
			if (!this.isActiveStream(e, i, r)) {
				i.close();
				return;
			}
			rp(e.run) || (i.close(), e.stream = null);
		};
	}
	appendNotice(e, t) {
		let n = ip(t);
		if (n) {
			let r = Number(t.data?.schedulerTurnSequence) || 0, i = e.noticeWatermarks.get(n) || 0;
			if (i && r <= i) return;
			e.noticeWatermarks.set(n, Math.max(i, r)), e.notices = e.notices.filter((e) => ip(e) !== n);
		} else if (e.notices.some((e) => ap(e) === ap(t))) return;
		e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20);
	}
	reconcileNotices(e) {
		let t = e.run, n = e.notices, r = n.filter((e) => {
			if (!ip(e)) return !0;
			let n = e.data || {};
			if (!t || String(n.runId || "") !== t.id || String(n.resourceId || "") !== String(t.resourceId || "") || Number(n.selfDrivingRevision) !== Number(t.selfDrivingRevision)) return !1;
			let r = Number(n.schedulerTurnSequence) || 0, i = Number(t.schedulerTurnSequence) || 0;
			return !(i > r || t.schedulerTurn && (!r || i >= r));
		});
		return e.notices = r, r.length !== n.length || r.some((e, t) => e !== n[t]);
	}
	scheduleEventFlush(e) {
		e.flushTimer ||= setTimeout(() => {
			e.flushTimer = null, this.isActive(e) && this.flushEvents(e, !0);
		}, this.streamBatchWindowMs);
	}
	flushEvents(e, t) {
		if (!e.pendingEvents.length) return;
		let n = e.pendingEvents;
		e.pendingEvents = [], e.events = zf(Lf(e.events, n)), t && this.isActive(e) && this.emit();
	}
	deactivate(e) {
		e && (e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.generation++, e.streamGeneration++, e.stream?.close(), e.stream = null, e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(Qf(e, "initial")), this.api.requests.abort(Qf(e, "older")));
	}
	eventBelongsToContext(e, t) {
		let n = String(t.sessionId || "").trim();
		return !n || e.acceptedSessionIds.has(n);
	}
	noticeBelongsToContext(e, t) {
		if (t.source && t.source !== "forge") return !1;
		let n = String(t.data?.runId || "").trim();
		return !n || n === e.runId;
	}
	isCurrent(e, t) {
		return !this.disposed && this.isActive(e) && e.generation === t;
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
function Xf(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function Zf(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function Qf(e, t) {
	return `chat:${e.key}:${t}`;
}
function $f(e, t) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/events?${t}`;
}
function ep(e) {
	return e.reduce((e, t) => {
		let n = Number(t.id) || 0;
		return n && (!e || n < e) ? n : e;
	}, 0);
}
function tp(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function np(e) {
	return new Set([
		e?.id,
		e?.agentHubSessionId,
		e?.sourceExternalId
	].map((e) => String(e || "").trim()).filter(Boolean));
}
function rp(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e?.status || ""));
}
function ip(e) {
	let t = e.data || {};
	return t.kind !== "self-driving-finish" || t.lifecycle !== "until-reconcile" ? "" : [
		t.kind,
		t.runId,
		t.resourceId,
		t.selfDrivingRevision
	].map((e) => String(e ?? "")).join(":");
}
function ap(e) {
	let t = e.data || {};
	return [
		e.type,
		t.method,
		t.kind,
		t.lifecycle,
		t.runId,
		t.schedulerTurnSequence,
		t.text
	].map((e) => String(e ?? "")).join(":");
}
function op() {
	return {
		identity: "",
		workspaceId: "",
		runId: "",
		events: [],
		notices: [],
		hasMoreBefore: !1,
		loading: !1,
		loadingOlder: !1,
		loaded: !1,
		error: ""
	};
}
function sp(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/ErrorNotice.svelte
var cp = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"agent-event error\"><div><!><strong> </strong></div><p> </p></div>");
function lp(e, t) {
	let n = Ci(t, "alert", 3, !1);
	var r = cp(), i = L(r), a = L(i);
	Q(a, { name: "triangle-alert" });
	var o = R(a), s = L(o, !0);
	k(o), k(i);
	var c = R(i), l = L(c, !0);
	k(c), k(r), z(() => {
		X(r, "role", n() ? "alert" : void 0), K(s, t.title), K(l, t.text);
	}), G(e, r);
}
//#endregion
//#region src/components/ForgeNotice.svelte
var up = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><div><!><strong>Forge</strong></div><p> </p></div>");
function dp(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => t.notice.data?.level === "error");
	var r = up(), i = L(r), a = L(i);
	{
		let e = /* @__PURE__ */ N(() => H(n) ? "triangle-alert" : "info");
		Q(a, { get name() {
			return H(e);
		} });
	}
	A(), k(i);
	var o = R(i), s = L(o, !0);
	k(o), k(r), z((e) => {
		Y(r, 1, `agent-event ${H(n) ? "error" : "system"}`), K(s, e);
	}, [() => String(t.notice.data?.text || "")]), G(e, r), M();
}
//#endregion
//#region src/components/LifecycleNotice.svelte
var fp = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function pp(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => t.item.tone === "ok" ? "check-circle" : t.item.tone === "danger" ? "triangle-alert" : t.item.tone === "info" ? "info" : "clock");
	function r() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var i = fp(), a = L(i);
	Q(a, { get name() {
		return H(n);
	} });
	var o = R(a), s = L(o, !0);
	k(o);
	var c = R(o), l = L(c, !0);
	k(c), k(i), z((e) => {
		Y(i, 1, `agent-system-note agent-lifecycle-${t.item.tone || "muted"}`), K(s, t.item.text || ""), K(l, e);
	}, [() => r()]), G(e, i), M();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var mp = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function hp(e, t) {
	j(t, !0);
	function n() {
		if (t.item.active) return "Thinking…";
		if (!t.item.startTime || !t.item.time) return "Thought";
		let e = Math.round((new Date(t.item.time).getTime() - new Date(t.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var r = mp(), i = L(r), a = L(i);
	Q(a, { name: "brain-circuit" });
	var o = R(a), s = L(o, !0);
	k(o);
	var c = R(o);
	Q(L(c), { name: "chevron-right" }), k(c), k(i);
	var l = R(i, 2), u = L(l, !0);
	k(l), k(r), z((e) => {
		r.open = t.item.active, K(s, e), K(u, t.item.text || "");
	}, [() => n()]), G(e, r), M();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var gp = /* @__PURE__ */ W("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), _p = /* @__PURE__ */ W("<span class=\"agent-message-tag\">steer</span>"), vp = /* @__PURE__ */ W("<span class=\"agent-message-source\"> </span>"), yp = /* @__PURE__ */ W("<div class=\"agent-message-content markdown-rendered\"></div>"), bp = /* @__PURE__ */ W("<p> </p>"), xp = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function Sp(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => [
		"assistant",
		"system",
		"agent"
	].includes(String(t.item.role)) ? String(t.item.role) : "user");
	function r() {
		return t.item.role === "assistant" ? t.agentName || "Agent" : String(t.item.sender?.name || t.item.sender?.id || "").trim() || (t.item.role === "system" ? "System" : t.item.role === "agent" ? "Agent" : "User");
	}
	function i() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function a() {
		let e = String(t.item.text || "");
		return !window.marked || !window.DOMPurify ? o(e).replaceAll("\n", "<br>") : window.DOMPurify.sanitize(window.marked.parse(e));
	}
	function o(e) {
		return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
	}
	var s = xp(), c = L(s), l = L(c), u = L(l), d = L(u, !0);
	k(u);
	var f = R(u, 2), p = (e) => {
		var t = gp(), r = L(t, !0);
		k(t), z(() => K(r, H(n))), G(e, t);
	};
	q(f, (e) => {
		H(n) !== "assistant" && e(p);
	});
	var m = R(f, 2), h = (e) => {
		G(e, _p());
	};
	q(m, (e) => {
		t.item.steer && e(h);
	});
	var g = R(m, 2), _ = (e) => {
		var n = vp(), r = L(n);
		k(n), z(() => {
			X(n, "title", t.item.sender.sessionId), K(r, `from session ${t.item.sender.sessionId ?? ""}`);
		}), G(e, n);
	};
	q(g, (e) => {
		H(n) === "agent" && t.item.sender?.sessionId && e(_);
	});
	var v = R(g, 2), y = L(v, !0);
	k(v), k(l);
	var b = R(l, 2), x = L(b), S = (e) => {
		var t = yp();
		Kr(t, a, !0), k(t), G(e, t);
	}, C = (e) => {
		var n = bp(), r = L(n, !0);
		k(n), z(() => K(r, t.item.text || "")), G(e, n);
	};
	q(x, (e) => {
		H(n) === "assistant" ? e(S) : e(C, -1);
	}), k(b), k(c), k(s), z((e, t) => {
		Y(s, 1, `agent-message-row ${H(n) === "assistant" ? "assistant final" : H(n)}`), K(d, e), K(y, t);
	}, [() => r(), () => i()]), G(e, s), M();
}
//#endregion
//#region src/components/ToolItem.svelte
var Cp = /* @__PURE__ */ W("<pre> </pre>"), wp = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\"><summary><!><span> </span><small> </small></summary> <!></details>");
function Tp(e, t) {
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
	var i = wp(), a = L(i), o = L(a);
	{
		let e = /* @__PURE__ */ N(() => t.call.status === "running" ? "loader-circle" : t.call.status === "failed" ? "x-circle" : "check-circle");
		Q(o, { get name() {
			return H(e);
		} });
	}
	var s = R(o), c = L(s, !0);
	k(s);
	var l = R(s), u = L(l, !0);
	k(l), k(a);
	var d = R(a, 2), f = (e) => {
		var t = Cp(), n = L(t, !0);
		k(t), z((e) => K(n, e), [() => r()]), G(e, t);
	}, p = /* @__PURE__ */ N(() => r());
	q(d, (e) => {
		H(p) && e(f);
	}), k(i), z((e, t, n) => {
		Y(i, 1, e), K(c, t), K(u, n);
	}, [
		() => `agent-tool-item agent-tool-${String(t.call.status || "completed")}`,
		() => n(),
		() => String(t.call.method || "tool")
	]), G(e, i), M();
}
//#endregion
//#region src/components/ToolGroup.svelte
var Ep = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function Dp(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => t.item.calls || []), r = /* @__PURE__ */ N(() => H(n).map(i));
	function i(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var a = Ep(), o = L(a), s = L(o);
	Q(L(s), { name: "wrench" }), k(s);
	var c = R(s), l = L(c);
	k(c);
	var u = R(c), d = L(u);
	k(u);
	var f = R(u);
	Q(L(f), { name: "chevron-right" }), k(f), k(o);
	var p = R(o, 2);
	J(p, 21, () => H(n), (e) => String(e.callId || e.key), (e, t) => {
		Tp(e, { get call() {
			return H(t);
		} });
	}), k(p), k(a), z((e, i) => {
		X(a, "data-tool-group-key", e), a.open = t.open, K(l, `${H(n).length ?? ""} tool ${H(n).length === 1 ? "call" : "calls"}`), K(d, `${i ?? ""}${H(r).length > 2 ? ` · +${H(r).length - 2} more` : ""}`);
	}, [() => `${t.runId}:${String(t.item.key || t.item.time || "tools")}`, () => H(r).slice(0, 2).join(" · ")]), yr("toggle", a, (e) => t.onToggle(e.currentTarget.open)), G(e, a), M();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var Op = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function kp(e, t) {
	j(t, !0);
	var n = Op(), r = L(n), i = L(r);
	Q(i, { name: "info" });
	var a = R(i), o = L(a);
	k(a), k(r);
	var s = R(r), c = L(s, !0);
	k(s), k(n), z(() => {
		K(o, `Unhandled event: ${(t.item.type || t.item.kind) ?? ""}`), K(c, t.item.preview || "This event carries no payload.");
	}), G(e, n), M();
}
//#endregion
//#region src/components/EventTimeline.svelte
var Ap = /* @__PURE__ */ W("<button type=\"button\" class=\"load-older-events\"><!><span> </span></button>"), jp = /* @__PURE__ */ W("<div><!></div>"), Mp = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>Loading agent events</strong></div>"), Np = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>Waiting for agent events</strong></div>"), Pp = /* @__PURE__ */ W("<!> <!> <!> <!> <!> <!>", 1), Fp = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>No agent run selected</strong><span> </span></div>"), Ip = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div>");
function Lp(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(Qt(t.channel.current().project)), i = /* @__PURE__ */ F(Qt(T())), a = /* @__PURE__ */ N(() => H(r)(H(i).events)), o = /* @__PURE__ */ F(void 0), s, c = null, l = !1, u = !1, d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ F(Qt(/* @__PURE__ */ new Map()));
	wi(() => {
		let e = y();
		s = new Yf({
			onEvent: (e, t, r) => H(n).onEvent(e, t, r),
			onNotice: (e, t, r) => H(n).onNotice(e, t, r)
		});
		let i = s.subscribe((e) => p(e)), a = t.channel.subscribe((e) => {
			let t = H(n).identity;
			I(n, e, !0), e.project !== H(r) && I(r, e.project, !0), e.identity !== t && (u = !0, c = null, I(f, new Map(d.get(e.identity) ?? []), !0)), s?.activate(e.workspaceId, e.activeRun), queueMicrotask(e.onIconsChanged);
		}), o = () => {
			if (!c || b()) return;
			let e = c;
			c = null, m(e);
		};
		return document.addEventListener("selectionchange", o), () => {
			i(), a(), document.removeEventListener("selectionchange", o), s?.dispose(), s = void 0, e && e.removeAttribute("data-agent-run-id");
		};
	});
	function p(e) {
		if (H(i).identity && e.identity === H(i).identity && b()) {
			c = e;
			return;
		}
		m(e);
	}
	function m(e) {
		let t = y();
		l = e.identity !== H(i).identity || u || x(t), u = !1, I(i, e, !0), t && (t.dataset.agentRunId = e.runId), lr().then(() => {
			l && !b() && S(), H(n).onIconsChanged(), e.loaded && e.hasMoreBefore && h(e.identity);
		});
	}
	async function h(e) {
		let t = 0;
		for (; t < 16 && H(i).identity === e && H(i).hasMoreBefore;) {
			let e = y();
			if (!e || e.scrollHeight > e.clientHeight + 160 || b() || !await s?.loadOlder()) return;
			t++, await lr(), S();
		}
	}
	async function g() {
		let e = y();
		if (!e || H(i).loadingOlder) return;
		let t = C(e), r = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, o = e.scrollTop, c = H(i).identity;
		await s?.loadOlder(), await lr(), H(i).identity === c && (e.scrollTop = t?.isConnected ? o + (t.getBoundingClientRect().top - r) : o + (e.scrollHeight - a), H(n).onIconsChanged());
	}
	function _(e, t) {
		let n = w(e);
		I(f, new Map(H(f)).set(n, t), !0), d.set(H(i).identity, new Map(H(f)));
	}
	function v(e, t) {
		let n = H(f).get(w(e));
		return typeof n == "boolean" ? n : t === H(a).length - 1 || !!e.calls?.some((e) => e.status === "running");
	}
	function y() {
		return H(o)?.parentElement ?? null;
	}
	function b() {
		let e = y(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function x(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function S() {
		let e = y();
		e && (e.scrollTop = e.scrollHeight);
	}
	function C(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function w(e) {
		return `${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
	}
	function T() {
		return {
			identity: "",
			workspaceId: "",
			runId: "",
			events: [],
			notices: [],
			hasMoreBefore: !1,
			loading: !1,
			loadingOlder: !1,
			loaded: !1,
			error: ""
		};
	}
	var E = Ip(), ee = L(E), te = (e) => {
		var t = Pp(), r = un(t), o = (e) => {
			var t = Ap(), n = L(t);
			{
				let e = /* @__PURE__ */ N(() => H(i).loadingOlder ? "loader-circle" : "chevrons-up");
				Q(n, { get name() {
					return H(e);
				} });
			}
			var r = R(n), a = L(r, !0);
			k(r), k(t), z(() => {
				t.disabled = H(i).loadingOlder, K(a, H(i).loadingOlder ? "Loading..." : "Load older messages");
			}), U("click", t, g), G(e, t);
		};
		q(r, (e) => {
			H(i).hasMoreBefore && e(o);
		});
		var s = R(r, 2);
		J(s, 19, () => H(a), (e) => w(e), (e, t, r) => {
			var a = jp(), o = L(a), s = (e) => {
				Sp(e, {
					get item() {
						return H(t);
					},
					get agentName() {
						return H(n).agentName;
					}
				});
			}, c = (e) => {
				hp(e, { get item() {
					return H(t);
				} });
			}, l = (e) => {
				{
					let n = /* @__PURE__ */ N(() => v(H(t), H(r)));
					Dp(e, {
						get item() {
							return H(t);
						},
						get runId() {
							return H(i).runId;
						},
						get open() {
							return H(n);
						},
						onToggle: (e) => _(H(t), e)
					});
				}
			}, u = (e) => {
				Ff(e, {
					get item() {
						return H(t);
					},
					get runId() {
						return H(i).runId;
					},
					get contextIdentity() {
						return H(i).identity;
					},
					get onApproval() {
						return H(n).onApproval;
					},
					get onToast() {
						return H(n).onToast;
					}
				});
			}, d = (e) => {
				pp(e, { get item() {
					return H(t);
				} });
			}, f = (e) => {
				{
					let n = /* @__PURE__ */ N(() => H(t).text || "");
					lp(e, {
						title: "Provider error",
						get text() {
							return H(n);
						}
					});
				}
			}, p = (e) => {
				kp(e, { get item() {
					return H(t);
				} });
			};
			q(o, (e) => {
				H(t).kind === "message" ? e(s) : H(t).kind === "thinking" ? e(c, 1) : H(t).kind === "tools" ? e(l, 2) : H(t).kind === "approval" ? e(u, 3) : H(t).kind === "lifecycle" ? e(d, 4) : H(t).kind === "error" ? e(f, 5) : e(p, -1);
			}), k(a), z((e) => X(a, "data-timeline-key", e), [() => w(H(t))]), G(e, a);
		});
		var c = R(s, 2);
		J(c, 19, () => H(i).notices, (e, t) => `notice:${H(i).identity}:${t}:${String(e.data?.schedulerTurnSequence || e.data?.text || "")}`, (e, t, n) => {
			var r = jp();
			dp(L(r), { get notice() {
				return H(t);
			} }), k(r), z(() => X(r, "data-timeline-key", `notice:${H(n)}`)), G(e, r);
		});
		var l = R(c, 2), u = (e) => {
			lp(e, {
				title: "Timeline error",
				get text() {
					return H(i).error;
				},
				alert: !0
			});
		};
		q(l, (e) => {
			H(i).error && e(u);
		});
		var d = R(l, 2), f = (e) => {
			var t = Mp();
			Q(L(t), { name: "loader-circle" }), A(), k(t), G(e, t);
		};
		q(d, (e) => {
			H(i).loading && !H(a).length && e(f);
		});
		var p = R(d, 2), m = (e) => {
			var t = Np();
			Q(L(t), { name: "loader-circle" }), A(), k(t), G(e, t);
		};
		q(p, (e) => {
			H(i).loaded && !H(i).loading && !H(a).length && !H(i).notices.length && e(m);
		}), G(e, t);
	}, ne = (e) => {
		var t = Fp(), r = L(t);
		Q(r, { name: "bot" });
		var i = R(r, 2), a = L(i, !0);
		k(i), k(t), z(() => K(a, H(n).runCount ? "Select an Agent Run to view its events." : "Start an agent session.")), G(e, t);
	};
	q(ee, (e) => {
		H(i).runId ? e(te) : e(ne, -1);
	}), k(E), Si(E, (e) => I(o, e), () => H(o)), z(() => X(E, "data-chat-context", H(i).identity)), G(e, E), M();
}
br(["click"]);
//#endregion
//#region src/components/SelfDrivingBar.svelte
var Rp = /* @__PURE__ */ W("<span class=\"self-driving-bar-summary\"> </span>"), zp = /* @__PURE__ */ W("<button type=\"button\" class=\"self-driving-bar-toggle\" aria-controls=\"selfDrivingBarDetails\"><!></button>"), Bp = /* @__PURE__ */ W("<p> </p>"), Vp = /* @__PURE__ */ W("<div class=\"self-driving-bar-details\" id=\"selfDrivingBarDetails\"><small> </small> <!> <!> <!> <!> <!></div>"), Hp = /* @__PURE__ */ W("<section role=\"status\"><div class=\"self-driving-bar-row\"><span class=\"self-driving-bar-title\"><!><strong>Self-Driving</strong></span> <span><!><span> </span></span> <!> <span class=\"self-driving-bar-actions\"><button type=\"button\" id=\"selfDrivingSwitch\" class=\"self-driving-switch\" role=\"switch\"><span class=\"self-driving-switch-track\"><span class=\"self-driving-switch-thumb\"></span></span><span> </span></button> <!></span></div> <!></section>");
function Up(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current()));
	wi(() => t.channel.subscribe((e) => {
		I(n, e, !0), queueMicrotask(e.onIconsChanged);
	}));
	let r = /* @__PURE__ */ N(() => H(n).expanded ? "Hide Self-Driving details" : "Show Self-Driving details"), i = /* @__PURE__ */ N(() => H(n).enabled ? "Turn Self-Driving off" : "Turn Self-Driving on");
	var a = Or(), o = un(a), s = (e) => {
		var t = Hp(), a = L(t), o = L(a);
		Q(L(o), {
			name: "workflow",
			className: "self-driving-title-icon"
		}), A(), k(o);
		var s = R(o, 2), c = L(s);
		Q(c, {
			get name() {
				return H(n).status.icon;
			},
			className: "self-driving-state-icon"
		});
		var l = R(c), u = L(l, !0);
		k(l), k(s);
		var d = R(s, 2), f = (e) => {
			var t = Rp(), r = L(t, !0);
			k(t), z(() => {
				X(t, "title", H(n).summary), K(r, H(n).summary);
			}), G(e, t);
		};
		q(d, (e) => {
			H(n).summary && e(f);
		});
		var p = R(d, 2), m = L(p), h = R(L(m)), g = L(h, !0);
		k(h), k(m);
		var _ = R(m, 2), v = (e) => {
			var t = zp(), i = L(t);
			{
				let e = /* @__PURE__ */ N(() => H(n).expanded ? "chevron-up" : "chevron-down");
				Q(i, {
					get name() {
						return H(e);
					},
					className: "self-driving-expand-icon"
				});
			}
			k(t), z(() => {
				X(t, "aria-expanded", H(n).expanded), X(t, "title", H(r)), X(t, "aria-label", H(r));
			}), U("click", t, function(...e) {
				H(n).onToggleDetails?.apply(this, e);
			}), G(e, t);
		};
		q(_, (e) => {
			H(n).hasProjection && e(v);
		}), k(p), k(a);
		var y = R(a, 2), b = (e) => {
			var t = Vp(), r = L(t), i = L(r);
			k(r);
			var a = R(r, 2), o = (e) => {
				var t = Bp(), r = L(t);
				k(t), z(() => K(r, `Actual Agent: ${H(n).actualAgent ?? ""}${H(n).actualReason ? ` · ${H(n).actualReason}` : ""}`)), G(e, t);
			};
			q(a, (e) => {
				H(n).actualAgent && e(o);
			});
			var s = R(a, 2), c = (e) => {
				var t = Bp(), r = L(t);
				k(t), z(() => K(r, `Waiting context: ${H(n).waitingSummary ?? ""}`)), G(e, t);
			};
			q(s, (e) => {
				H(n).waitingSummary && e(c);
			});
			var l = R(s, 2), u = (e) => {
				var t = Bp(), r = L(t);
				k(t), z(() => K(r, `Wake condition: ${H(n).wakeCondition ?? ""}${H(n).wakeFallback ? " (compatibility fallback)" : ""}`)), G(e, t);
			};
			q(l, (e) => {
				H(n).wakeCondition && e(u);
			});
			var d = R(l, 2), f = (e) => {
				var t = Bp(), r = L(t);
				k(t), z(() => K(r, `Last outcome: ${H(n).lastOutcome.status ?? ""}${H(n).lastOutcome.reason ? ` · ${H(n).lastOutcome.reason}` : ""}`)), G(e, t);
			};
			q(d, (e) => {
				H(n).lastOutcome && e(f);
			});
			var p = R(d, 2), m = (e) => {
				var t = Bp(), r = L(t);
				k(t), z(() => K(r, `${H(n).statusReason.label ?? ""}: ${H(n).statusReason.text ?? ""}`)), G(e, t);
			};
			q(p, (e) => {
				H(n).statusReason && e(m);
			}), k(t), z((e) => K(i, `Revision ${H(n).revision ?? ""} · Desired state: ${H(n).enabled ? "On" : "Off"}${e ?? ""}`), [() => H(n).preferredProfiles.length ? ` · Preferred: ${H(n).preferredProfiles.join(" → ")}` : " · Workspace default"]), G(e, t);
		};
		q(y, (e) => {
			H(n).hasProjection && H(n).expanded && e(b);
		}), k(t), z(() => {
			Y(t, 1, `self-driving-bar self-driving-bar-${H(n).status.key}${H(n).expanded ? " expanded" : ""}`), X(t, "aria-label", `Self-Driving: ${H(n).status.label}`), Y(s, 1, `self-driving-state self-driving-state-${H(n).status.key}`), K(u, H(n).status.label), X(m, "aria-checked", H(n).enabled), X(m, "aria-label", H(i)), X(m, "title", H(i)), m.disabled = H(n).pending, X(m, "aria-busy", H(n).pending || void 0), K(g, H(n).enabled ? "On" : "Off");
		}), U("click", m, function(...e) {
			H(n).onToggleEnabled?.apply(this, e);
		}), G(e, t);
	};
	q(o, (e) => {
		H(n).visible && e(s);
	}), G(e, a), M();
}
br(["click"]);
//#endregion
//#region src/components/SelfDrivingDialog.svelte
var Wp = /* @__PURE__ */ W("<input name=\"agentName\" readonly=\"\" aria-readonly=\"true\"/>"), Gp = /* @__PURE__ */ W("<option> </option>"), Kp = /* @__PURE__ */ W("<select name=\"agentName\" required=\"\"><option>Select an Agent</option><!></select>"), qp = /* @__PURE__ */ W("<p class=\"self-driving-dialog-error\" role=\"alert\"> </p>"), Jp = /* @__PURE__ */ W("<p class=\"self-driving-dialog-error\" role=\"alert\">The result may be unknown. Refresh the task and session state before trying again.</p>"), Yp = /* @__PURE__ */ W("<div class=\"self-driving-dialog-layer\" role=\"presentation\"><button class=\"self-driving-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"self-driving-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"selfDrivingDialogTitle\"><header class=\"self-driving-dialog-header\"><strong id=\"selfDrivingDialogTitle\">Configure Self-Driving</strong> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"selfDrivingConfigForm\" class=\"details-form self-driving-dialog-form\"><label><span>Agent</span> <!></label> <label><span>Run instructions <small>(optional)</small></span> <textarea name=\"runInstructions\" rows=\"4\" placeholder=\"Additional Self-Driving instructions\"></textarea></label> <!> <!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function Xp(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(Qt({ ...H(n).draft })), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(void 0), s = /* @__PURE__ */ N(() => H(n).submitting || H(n).unknown || !H(n).reuseCurrentSession && (!H(r).agentName || H(n).agents.length === 0));
	wi(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity !== H(i) && (I(i, e.identity, !0), I(r, { ...e.draft }, !0), I(a, "")), queueMicrotask(e.onIconsChanged);
	})), wi(() => {
		let e = (e) => {
			if (!H(n).open) return;
			if (e.key === "Escape" && !H(n).submitting) {
				e.preventDefault(), H(n).onClose();
				return;
			}
			if (e.key !== "Tab" || !H(o)) return;
			let t = [...H(o).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
			if (!t.length) return;
			let r = t[0], i = t[t.length - 1];
			e.shiftKey && document.activeElement === r ? (e.preventDefault(), i.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r.focus());
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	async function c(e) {
		if (e.preventDefault(), !H(s)) {
			if (!H(n).reuseCurrentSession && !H(r).agentName) {
				I(a, "Select an Agent before enabling Self-Driving.");
				return;
			}
			I(a, ""), await H(n).onSubmit({ ...H(r) });
		}
	}
	var l = Or(), u = un(l), d = (e) => {
		var t = Yp(), i = L(t), l = R(i, 2), u = L(l), d = R(L(u), 2);
		Q(L(d), { name: "x" }), k(d), k(u);
		var f = R(u, 2), p = L(f), m = R(L(p), 2), h = (e) => {
			var t = Wp();
			di(t), _i(t, () => H(r).agentName, (e) => H(r).agentName = e), G(e, t);
		}, g = (e) => {
			var t = Kp(), i = L(t);
			i.value = i.__value = "", J(R(i), 17, () => H(n).agents, (e) => e.id, (e, t) => {
				var n = Gp(), r = L(n);
				k(n);
				var i = {};
				z(() => {
					K(r, `${H(t).label ?? ""} — ${H(t).summary ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
				}), G(e, n);
			}), k(t), z(() => t.disabled = H(n).agents.length === 0 || H(n).submitting), U("input", t, () => I(a, "")), ai(t, () => H(r).agentName, (e) => H(r).agentName = e), G(e, t);
		};
		q(m, (e) => {
			H(n).reuseCurrentSession ? e(h) : e(g, -1);
		}), k(p);
		var _ = R(p, 2), v = R(L(_), 2);
		rt(v), k(_);
		var y = R(_, 2), b = (e) => {
			var t = qp(), r = L(t, !0);
			k(t), z(() => K(r, H(a) || H(n).error)), G(e, t);
		};
		q(y, (e) => {
			(H(a) || H(n).error) && e(b);
		});
		var x = R(y, 2), S = (e) => {
			G(e, Jp());
		};
		q(x, (e) => {
			H(n).unknown && e(S);
		});
		var C = R(x, 2), w = L(C), T = L(w, !0);
		k(w);
		var E = R(w, 2);
		k(C), k(f), k(l), Si(l, (e) => I(o, e), () => H(o)), k(t), z(() => {
			d.disabled = H(n).submitting, v.disabled = H(n).submitting, w.disabled = H(s), X(w, "aria-busy", H(n).submitting), K(T, H(n).submitting ? "Enabling…" : "Save and Enable"), E.disabled = H(n).submitting;
		}), U("click", i, function(...e) {
			H(n).onClose?.apply(this, e);
		}), U("click", d, function(...e) {
			H(n).onClose?.apply(this, e);
		}), yr("submit", f, c), U("input", v, () => I(a, "")), _i(v, () => H(r).runInstructions, (e) => H(r).runInstructions = e), U("click", E, function(...e) {
			H(n).onClose?.apply(this, e);
		}), G(e, t);
	};
	q(u, (e) => {
		H(n).open && e(d);
	}), G(e, l), M();
}
br(["click", "input"]);
//#endregion
//#region src/components/SessionSwitcher.svelte
var Zp = /* @__PURE__ */ W("<button type=\"button\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span></button>"), Qp = /* @__PURE__ */ W("<div class=\"agent-session-menu\"></div>"), $p = /* @__PURE__ */ W("<div class=\"agent-current-session\"><button type=\"button\" class=\"agent-current-run active\" title=\"Switch session\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span> <!></button></div> <!>", 1), em = /* @__PURE__ */ W("<div class=\"session-pill\"><strong>No sessions yet</strong><span>Start an agent session from the selected task.</span></div>"), tm = /* @__PURE__ */ W("<div class=\"agent-session-error\" role=\"alert\"> </div>"), nm = /* @__PURE__ */ W("<div id=\"agentSessions\" class=\"agent-session-switcher\"><!> <!></div>");
function rm(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ N(() => H(n).runs.find((e) => e.id === H(n).activeRunId) ?? H(n).runs[0] ?? null);
	wi(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== H(n).identity;
			I(n, e, !0), t && (I(r, !1), I(i, ""), I(a, "")), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			H(r) && !t?.closest(".agent-session-switcher") && I(r, !1);
		};
		return document.addEventListener("click", o), () => {
			e(), document.removeEventListener("click", o);
		};
	});
	async function s(e) {
		if (!e || H(i) || e === H(n).activeRunId) {
			e === H(n).activeRunId && I(r, !H(r));
			return;
		}
		I(i, e, !0), I(a, ""), I(r, !1);
		try {
			await H(n).onSelect(e);
		} catch (e) {
			I(a, e instanceof Error ? e.message : String(e), !0), H(n).onToast(H(a));
		} finally {
			I(i, "");
		}
	}
	function c(e = "") {
		return ["starting", "running"].includes(e) ? "running" : [
			"waiting_approval",
			"stopping",
			"recovering"
		].includes(e) ? "attention" : e === "completed" ? "done" : e === "failed" ? "danger" : "muted";
	}
	function l(e) {
		let t = new Date(e || "").getTime();
		if (!Number.isFinite(t)) return "";
		let n = Math.max(0, Math.round((Date.now() - t) / 1e3));
		if (n < 60) return `${n}s ago`;
		let r = Math.round(n / 60);
		if (r < 60) return `${r}m ago`;
		let i = Math.round(r / 60);
		return i < 24 ? `${i}h ago` : `${Math.round(i / 24)}d ago`;
	}
	function u(e) {
		return e.title || e.id;
	}
	var d = nm(), f = L(d), p = (e) => {
		var t = $p(), a = un(t), d = L(a), f = L(d), p = L(f), m = L(p, !0);
		k(p);
		var h = R(p, 2), g = L(h), _ = L(g);
		let v;
		var y = R(_, 1, !0);
		k(g);
		var b = R(g, 2), x = L(b, !0);
		k(b), k(h), k(f);
		var S = R(f, 2);
		{
			let e = /* @__PURE__ */ N(() => H(i) ? "loader-circle" : "chevrons-up-down");
			Q(S, {
				get name() {
					return H(e);
				},
				className: "session-select-icon"
			});
		}
		k(d), k(a);
		var C = R(a, 2), w = (e) => {
			var t = Qp();
			J(t, 21, () => H(n).runs, (e) => e.id, (e, t) => {
				var r = Zp();
				let a;
				var o = L(r), d = L(o), f = L(d, !0);
				k(d);
				var p = R(d, 2), m = L(p), h = L(m);
				let g;
				var _ = R(h, 1, !0);
				k(m);
				var v = R(m, 2), y = L(v, !0);
				k(v), k(p), k(o), k(r), z((e, i, o, s, c, l) => {
					a = Y(r, 1, "agent-session-menu-row", null, a, { active: H(n).activeRunId === H(t).id }), X(r, "data-agent-run", H(t).id), r.disabled = e, K(f, i), Y(m, 1, o), g = Y(h, 1, "run-badge-dot", null, g, s), K(_, c), K(y, l);
				}, [
					() => !!H(i),
					() => u(H(t)),
					() => `run-badge run-badge-${c(H(t).status)}`,
					() => ({ "run-badge-pulse": ["running", "attention"].includes(c(H(t).status)) }),
					() => (H(t).status || "unknown").replaceAll("_", " "),
					() => l(H(t).updatedAt)
				]), U("click", r, () => s(H(t).id)), G(e, r);
			}), k(t), G(e, t);
		};
		q(C, (e) => {
			H(r) && e(w);
		}), z((e, t, n, i, a) => {
			X(d, "data-agent-run", H(o).id), X(d, "aria-expanded", H(r)), K(m, e), Y(g, 1, t), v = Y(_, 1, "run-badge-dot", null, v, n), K(y, i), K(x, a);
		}, [
			() => u(H(o)),
			() => `run-badge run-badge-${c(H(o).status)}`,
			() => ({ "run-badge-pulse": ["running", "attention"].includes(c(H(o).status)) }),
			() => (H(o).status || "unknown").replaceAll("_", " "),
			() => l(H(o).updatedAt)
		]), U("click", d, (e) => {
			e.stopPropagation(), I(r, !H(r));
		}), G(e, t);
	}, m = (e) => {
		G(e, em());
	};
	q(f, (e) => {
		H(o) ? e(p) : e(m, -1);
	});
	var h = R(f, 2), g = (e) => {
		var t = tm(), n = L(t, !0);
		k(t), z(() => K(n, H(a))), G(e, t);
	};
	q(h, (e) => {
		H(a) && e(g);
	}), k(d), z(() => X(d, "data-session-context", H(n).identity)), G(e, d), M();
}
br(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function im(e) {
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
function am(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		newProfile: { ...e.newProfile }
	};
}
function om(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var sm = /* @__PURE__ */ W("<span class=\"settings-pill\"> </span>"), cm = /* @__PURE__ */ W("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), lm = /* @__PURE__ */ W("<div class=\"settings-empty\">No AgentHub agents available.</div>"), um = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function dm(e, t) {
	j(t, !0);
	let n = Ci(t, "draft", 15), r = Ci(t, "pending", 15);
	async function i() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(am(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(om(e));
			} finally {
				r("");
			}
		}
	}
	var a = um(), o = R(L(a), 2), s = L(o), c = R(L(s)), l = L(c, !0);
	k(c), k(s);
	var u = R(s, 2), d = R(L(u));
	di(d), k(u);
	var f = R(u, 2), p = L(f, !0);
	k(f);
	var m = R(f, 2);
	J(m, 21, () => t.agentHub.capabilities, Lr, (e, t) => {
		var n = sm(), r = L(n, !0);
		k(n), z(() => K(r, H(t))), G(e, n);
	}), k(m), k(o);
	var h = R(o, 2), g = L(h), _ = R(L(g)), v = L(_);
	k(_), k(g);
	var y = R(g, 2);
	J(y, 21, () => t.agentHub.agents, (e) => e.name, (e, t) => {
		var n = cm(), r = L(n), i = L(r), a = L(i, !0);
		k(i);
		var o = R(i), s = L(o), c = L(s, !0);
		k(s);
		var l = R(s), u = L(l);
		k(l), k(o), k(r), k(n), z((e) => {
			K(a, e), K(c, H(t).name), K(u, `${(H(t).providerId || "") ?? ""} · ${(H(t).available === !1 ? H(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (H(t).name || "A").slice(0, 1).toUpperCase()]), G(e, n);
	}, (e) => {
		G(e, lm());
	}), k(y), k(h);
	var b = R(h, 2), x = L(b);
	let S;
	var C = L(x, !0);
	k(x);
	var w = R(x);
	Q(L(w), { name: "save" }), A(), k(w), k(b), k(a), z((e) => {
		K(l, t.agentHub.connected && t.agentHub.compatible ? "Compatible" : t.agentHub.connected ? "Incompatible" : "Unavailable"), K(p, t.agentHub.error || `API ${t.agentHub.apiVersion || "unknown"} · AgentHub ${t.agentHub.version || "unknown"}`), K(v, `${t.agentHub.agents.length ?? ""} agents · ${t.agentHub.providers.length ?? ""} providers`), S = Y(x, 1, "settings-save-hint", null, S, { visible: n().dirty }), K(C, n().dirty ? "Unsaved changes" : ""), w.disabled = e;
	}, [() => !n().dirty || !!r()]), U("input", d, function(...e) {
		t.onDirty?.apply(this, e);
	}), _i(d, () => n().endpoint, (e) => n(n().endpoint = e, !0)), U("click", w, i), G(e, a), M();
}
br(["input", "click"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var fm = /* @__PURE__ */ W("<small class=\"settings-notification-help\"> </small>"), pm = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function mm(e, t) {
	j(t, !0);
	var n = pm(), r = R(L(n), 2), i = L(r), a = R(L(i), 2);
	di(a), k(i);
	var o = R(i, 2), s = (e) => {
		var n = fm(), r = L(n, !0);
		k(n), z(() => K(r, t.notifications.permissionError)), G(e, n);
	};
	q(o, (e) => {
		t.notifications.permissionError && e(s);
	}), k(r);
	var c = R(r, 2), l = L(c), u = R(L(l), 2);
	di(u), k(l);
	var d = R(l, 2), f = L(d, !0);
	k(d), k(c), k(n), z(() => {
		pi(a, t.notifications.browser), pi(u, t.notifications.sound), K(f, t.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), U("change", a, (e) => t.onBrowserNotifications(e.currentTarget.checked)), U("change", u, (e) => t.onCompletionSound(e.currentTarget.checked)), G(e, n), M();
}
br(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var hm = /* @__PURE__ */ W("<option> </option>"), gm = /* @__PURE__ */ W("<span class=\"settings-profile-system-label\">System</span>"), _m = /* @__PURE__ */ W("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), vm = /* @__PURE__ */ W("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), ym = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map chat and Self-Driving preferences to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function bm(e, t) {
	j(t, !0);
	let n = Ci(t, "draft", 15), r = Ci(t, "pending", 15), i = /* @__PURE__ */ new Set([
		"default",
		"fast",
		"reasoning",
		"scheduler"
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
	async function l() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(am(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(om(e));
			} finally {
				r("");
			}
		}
	}
	var u = ym(), d = R(L(u), 2), f = L(d), p = R(L(f)), m = L(p);
	k(p), k(f);
	var h = R(f, 2), g = R(L(h), 2);
	J(g, 17, () => n().profiles, Lr, (e, t, n) => {
		let r = /* @__PURE__ */ N(() => i.has(H(t).key.trim().toLowerCase()));
		var o = vm();
		let l;
		var u = L(o);
		di(u);
		var d = R(u, 2);
		di(d);
		var f = R(d, 2);
		J(f, 21, () => c(H(t).agentName), Lr, (e, t) => {
			var n = hm(), r = L(n, !0);
			k(n);
			var i = {};
			z(() => {
				K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
			}), G(e, n);
		}), k(f);
		var p;
		ii(f);
		var m = R(f, 2), h = (e) => {
			G(e, gm());
		}, g = (e) => {
			var t = _m();
			Q(L(t), { name: "trash-2" }), k(t), U("click", t, () => s(n)), G(e, t);
		};
		q(m, (e) => {
			H(r) ? e(h) : e(g, -1);
		}), k(o), z(() => {
			l = Y(o, 1, "settings-profile-row", null, l, { "settings-profile-system": H(r) }), fi(u, H(t).key), u.disabled = H(r), fi(d, H(t).description), d.disabled = H(r), p !== (p = H(t).agentName) && (f.value = (f.__value = H(t).agentName) ?? "", ri(f, H(t).agentName));
		}), U("input", u, (e) => a(n, "key", e.currentTarget.value)), U("input", d, (e) => a(n, "description", e.currentTarget.value)), U("change", f, (e) => a(n, "agentName", e.currentTarget.value)), G(e, o);
	});
	var _ = R(g, 2), v = L(_);
	di(v);
	var y = R(v, 2);
	di(y);
	var b = R(y, 2);
	J(b, 21, () => t.agents, Lr, (e, t) => {
		var n = hm(), r = L(n, !0);
		k(n);
		var i = {};
		z(() => {
			K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
		}), G(e, n);
	}), k(b);
	var x = R(b, 2);
	Q(L(x), { name: "plus" }), A(), k(x), k(_), k(h), k(d);
	var S = R(d, 2), C = L(S);
	let w;
	var T = L(C, !0);
	k(C);
	var E = R(C);
	Q(L(E), { name: "save" }), A(), k(E), k(S), k(u), z((e) => {
		K(m, `${n().profiles.length ?? ""} routes`), b.disabled = !t.agents.length, x.disabled = !t.agents.length, w = Y(C, 1, "settings-save-hint", null, w, { visible: n().dirty }), K(T, n().dirty ? "Unsaved changes" : ""), E.disabled = e;
	}, [() => !n().dirty || !!r()]), _i(v, () => n().newProfile.key, (e) => n(n().newProfile.key = e, !0)), _i(y, () => n().newProfile.description, (e) => n(n().newProfile.description = e, !0)), ai(b, () => n().newProfile.agentName, (e) => n(n().newProfile.agentName = e, !0)), U("click", x, o), U("click", E, l), G(e, u), M();
}
br([
	"input",
	"change",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var xm = /* @__PURE__ */ W("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), Sm = /* @__PURE__ */ W("<button type=\"button\"><!> <span> </span> <!></button>"), Cm = /* @__PURE__ */ W("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function wm(e, t) {
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
	var r = Cm();
	J(R(L(r), 2), 17, () => n, (e) => e.id, (e, n) => {
		var r = Sm();
		let i;
		var a = L(r);
		Q(a, { get name() {
			return H(n).icon;
		} });
		var o = R(a, 2), s = L(o, !0);
		k(o);
		var c = R(o, 2), l = (e) => {
			G(e, xm());
		};
		q(c, (e) => {
			H(n).sharesAgentDraft && e(l);
		}), k(r), z(() => {
			i = Y(r, 1, "settings-tab", null, i, {
				active: t.activeTab === H(n).id,
				dirty: t.dirty && H(n).sharesAgentDraft
			}), X(r, "aria-current", t.activeTab === H(n).id ? "page" : void 0), K(s, H(n).label);
		}), U("click", r, () => t.onSelect(H(n).id)), G(e, r);
	}), k(r), G(e, r), M();
}
br(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var Tm = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function Em(e, t) {
	j(t, !0);
	let n = Ci(t, "draft", 15), r = Ci(t, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n(n().userName = await t.onSaveUser(n().userName), !0);
			} catch (e) {
				t.onToast(om(e));
			} finally {
				r("");
			}
		}
	}
	var a = Tm(), o = R(L(a), 2), s = L(o), c = R(L(s), 2);
	di(c), A(2), k(s);
	var l = R(s, 2), u = L(l);
	Q(L(u), { name: "save" }), A(), k(u), k(l), k(o), k(a), z(() => u.disabled = r() === "user"), yr("submit", o, i), _i(c, () => n().userName, (e) => n(n().userName = e, !0)), G(e, a), M();
}
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var Dm = /* @__PURE__ */ W("<span class=\"settings-pill\">Active</span>"), Om = /* @__PURE__ */ W("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), km = /* @__PURE__ */ W("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Am = /* @__PURE__ */ W("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), jm = /* @__PURE__ */ W("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Mm = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function Nm(e, t) {
	j(t, !0);
	let n = Ci(t, "draft", 15), r = Ci(t, "pending", 15), i = /* @__PURE__ */ F("");
	async function a(e) {
		if (e.preventDefault(), !(!n().workspacePath.trim() || r())) {
			r("workspace");
			try {
				await t.onAddWorkspace(am(n())), n(n().workspacePath = "", !0), n(n().createWorkspace = !1, !0);
			} catch (e) {
				t.onToast(om(e));
			} finally {
				r("");
			}
		}
	}
	async function o(e) {
		if (!r()) {
			r(`remove:${e}`);
			try {
				await t.onRemoveWorkspace(e, am(n()));
			} catch (e) {
				t.onToast(om(e));
			} finally {
				r("");
			}
		}
	}
	async function s(e, a) {
		if (!r()) {
			r(`icon:${e}`), I(i, "");
			try {
				await t.onWorkspaceIcon(e, a, am(n()));
			} catch (e) {
				t.onToast(om(e));
			} finally {
				r("");
			}
		}
	}
	function c(e) {
		let n = t.workspaces.find((t) => t.id === e);
		return t.workspaceIcons.find((e) => e.id === (n?.icon || "")) || t.workspaceIcons[0];
	}
	var l = Mm(), u = R(L(l), 2), d = L(u);
	di(d);
	var f = R(d, 2), p = L(f);
	di(p), A(2), k(f);
	var m = R(f, 2), h = L(m);
	Q(h, { name: "plus" });
	var g = R(h), _ = L(g, !0);
	k(g), k(m), k(u);
	var v = R(u, 2);
	J(v, 21, () => t.workspaces, (e) => e.id, (e, n) => {
		let a = /* @__PURE__ */ N(() => c(H(n).id));
		var l = Am(), u = L(l), d = L(u), f = L(d), p = L(f);
		k(f);
		var m = R(f, 2), h = L(m), g = L(h, !0);
		k(h);
		var _ = R(h), v = L(_, !0);
		k(_), k(m), k(d);
		var y = R(d, 2), b = L(y), x = (e) => {
			G(e, Dm());
		};
		q(b, (e) => {
			H(n).id === t.activeWorkspaceId && e(x);
		});
		var S = R(b, 2), C = L(S), w = R(C, 2), T = L(w, !0);
		k(w), Q(R(w, 2), { name: "chevron-down" }), k(S);
		var E = R(S, 2);
		Q(L(E), { name: "trash-2" }), k(E), k(y), k(u);
		var ee = R(u, 2), te = (e) => {
			var r = km();
			J(r, 21, () => t.workspaceIcons, (e) => e.id, (e, t) => {
				var r = Om();
				let i;
				var o = L(r), c = R(o), l = L(c, !0);
				k(c);
				var u = R(c), d = (e) => {
					Q(e, { name: "check" });
				};
				q(u, (e) => {
					H(t).id === H(a).id && e(d);
				}), k(r), z(() => {
					X(r, "aria-checked", H(t).id === H(a).id), X(r, "title", H(t).label), i = Y(r, 1, "", null, i, { selected: H(t).id === H(a).id }), X(o, "src", H(t).src), K(l, H(t).label);
				}), U("click", r, () => s(H(n).id, H(t).id)), G(e, r);
			}), k(r), z(() => X(r, "aria-label", `Icon for ${H(n).name}`)), G(e, r);
		};
		q(ee, (e) => {
			H(i) === H(n).id && e(te);
		}), k(l), z((e, t) => {
			X(p, "src", H(a).src), K(g, H(n).name), K(v, H(n).path), X(S, "aria-expanded", H(i) === H(n).id), S.disabled = e, X(C, "src", H(a).src), K(T, r() === `icon:${H(n).id}` ? "Saving..." : H(a).label), E.disabled = t;
		}, [() => !!r(), () => !!r()]), U("click", S, () => I(i, H(i) === H(n).id ? "" : H(n).id, !0)), U("click", E, () => o(H(n).id)), G(e, l);
	}, (e) => {
		G(e, jm());
	}), k(v), k(l), z((e) => {
		m.disabled = e, K(_, n().createWorkspace ? "Create" : "Add");
	}, [() => !!r()]), yr("submit", u, a), _i(d, () => n().workspacePath, (e) => n(n().workspacePath = e, !0)), vi(p, () => n().createWorkspace, (e) => n(n().createWorkspace = e, !0)), G(e, l), M();
}
br(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var Pm = /* @__PURE__ */ W("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function Fm(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(-1), a = /* @__PURE__ */ F(Qt(im(H(n)))), o = /* @__PURE__ */ F("");
	wi(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity === H(r) ? e.dataVersion !== H(i) && !H(a).dirty && (I(i, e.dataVersion, !0), I(a, im(e), !0)) : (I(r, e.identity, !0), I(i, e.dataVersion, !0), I(a, im(e), !0), I(o, "")), queueMicrotask(e.onIconsChanged);
	})), wi(() => {
		let e = (e) => {
			H(n).open && e.key === "Escape" && (e.preventDefault(), H(n).onClose(H(a).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function s() {
		H(a).dirty = !0;
	}
	var c = Or(), l = un(c), u = (e) => {
		var t = Pm(), r = un(t), i = R(r, 2), c = L(i);
		wm(c, {
			get activeTab() {
				return H(a).tab;
			},
			get dirty() {
				return H(a).dirty;
			},
			onSelect: (e) => H(a).tab = e
		});
		var l = R(c, 2), u = L(l);
		Q(L(u), { name: "x" }), k(u);
		var d = R(u, 2), f = (e) => {
			Nm(e, {
				get workspaces() {
					return H(n).workspaces;
				},
				get activeWorkspaceId() {
					return H(n).activeWorkspaceId;
				},
				get workspaceIcons() {
					return H(n).workspaceIcons;
				},
				get onAddWorkspace() {
					return H(n).onAddWorkspace;
				},
				get onRemoveWorkspace() {
					return H(n).onRemoveWorkspace;
				},
				get onWorkspaceIcon() {
					return H(n).onWorkspaceIcon;
				},
				get onToast() {
					return H(n).onToast;
				},
				get draft() {
					return H(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					I(o, e, !0);
				}
			});
		}, p = (e) => {
			Em(e, {
				get onSaveUser() {
					return H(n).onSaveUser;
				},
				get onToast() {
					return H(n).onToast;
				},
				get draft() {
					return H(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					I(o, e, !0);
				}
			});
		}, m = (e) => {
			dm(e, {
				get agentHub() {
					return H(n).agentHub;
				},
				onDirty: s,
				get onSaveAgentHub() {
					return H(n).onSaveAgentHub;
				},
				get onToast() {
					return H(n).onToast;
				},
				get draft() {
					return H(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					I(o, e, !0);
				}
			});
		}, h = (e) => {
			bm(e, {
				get agents() {
					return H(n).agents;
				},
				onDirty: s,
				get onSaveAgentHub() {
					return H(n).onSaveAgentHub;
				},
				get onToast() {
					return H(n).onToast;
				},
				get draft() {
					return H(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					I(o, e, !0);
				}
			});
		}, g = (e) => {
			mm(e, {
				get notifications() {
					return H(n).notifications;
				},
				get onBrowserNotifications() {
					return H(n).onBrowserNotifications;
				},
				get onCompletionSound() {
					return H(n).onCompletionSound;
				}
			});
		};
		q(d, (e) => {
			H(a).tab === "workspace" ? e(f) : H(a).tab === "user" ? e(p, 1) : H(a).tab === "agenthub" ? e(m, 2) : H(a).tab === "profiles" ? e(h, 3) : e(g, -1);
		}), k(l), k(i), U("click", r, () => H(n).onClose(H(a).dirty)), U("click", u, () => H(n).onClose(H(a).dirty)), G(e, t);
	};
	q(l, (e) => {
		H(n).open && e(u);
	}), G(e, c), M();
}
br(["click"]);
//#endregion
//#region src/components/Toast.svelte
var Im = /* @__PURE__ */ W("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function Lm(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(!1), i = null;
	wi(() => {
		let e = t.channel.subscribe((e) => {
			I(n, e, !0), I(r, !!e.message, !0), i !== null && window.clearTimeout(i), H(r) && (i = window.setTimeout(() => {
				I(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = Im(), o = L(a, !0);
	k(a), z(() => {
		X(a, "hidden", !H(r)), K(o, H(n).message);
	}), G(e, a), M();
}
//#endregion
//#region src/components/UploadDialog.svelte
var Rm = /* @__PURE__ */ W("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), zm = /* @__PURE__ */ W("<small class=\"upload-result-path\"> </small>"), Bm = /* @__PURE__ */ W("<small class=\"upload-error\"> </small>"), Vm = /* @__PURE__ */ W("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), Hm = /* @__PURE__ */ W("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this session's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function Um(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(Qt([])), a = 1, o = /* @__PURE__ */ F(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ N(() => H(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ N(() => H(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ N(() => H(i).filter((e) => e.status === "error").length);
	wi(() => {
		let e = t.channel.subscribe((e) => {
			I(n, e, !0), e.identity !== H(r) && (d(), I(r, e.identity, !0), I(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			if (!H(n).open) return;
			let t = f(e.clipboardData);
			t.length && (e.preventDefault(), m(t));
		};
		document.addEventListener("paste", o);
		let s = (e) => {
			H(n).open && e.key === "Escape" && !H(c) && (e.preventDefault(), _());
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
		if (!H(n).open || !t.length) return;
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
		I(i, [...H(i), ...r], !0);
		for (let e of r) g(e, H(n).identity, H(n).workspaceId, H(n).runId);
	}
	function h(e, t) {
		I(i, H(i).map((n) => n.id === e ? {
			...n,
			...t
		} : n), !0);
	}
	function g(e, t, r, i) {
		h(e.id, { status: "uploading" });
		let a = new XMLHttpRequest();
		s.set(e.id, a), a.open("POST", `/api/workspaces/${encodeURIComponent(r)}/agent/runs/${encodeURIComponent(i)}/uploads`), a.responseType = "json", a.upload.addEventListener("progress", (r) => {
			H(n).identity !== t || !r.lengthComputable || h(e.id, { progress: Math.min(99, Math.round(r.loaded / r.total * 100)) });
		}), a.addEventListener("load", () => {
			if (s.delete(e.id), H(n).identity !== t || H(n).workspaceId !== r || H(n).runId !== i) return;
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
			s.delete(e.id), H(n).identity === t && h(e.id, {
				status: "error",
				error: "Network error while uploading."
			});
		});
		let o = new FormData();
		o.append("file", e.file, e.name), a.send(o);
	}
	function _() {
		H(c) || H(n).onDone(H(i).filter((e) => e.status === "success" && e.path).map((e) => e.path), {
			workspaceId: H(n).workspaceId,
			runId: H(n).runId
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
	var b = Or(), x = un(b), S = (e) => {
		var t = Hm(), n = L(t), r = R(n, 2), a = L(r), s = R(L(a), 2);
		Q(L(s), { name: "x" }), k(s), k(a);
		var d = R(a, 2), f = L(d);
		Si(f, (e) => I(o, e), () => H(o));
		var p = R(f, 2), h = L(p);
		Q(h, { name: "clipboard-paste" });
		var g = R(h, 4);
		Q(L(g), { name: "folder-open" }), A(), k(g), k(p);
		var b = R(p, 2), x = L(b), S = (e) => {
			G(e, Rm());
		};
		q(x, (e) => {
			H(i).length || e(S);
		}), J(R(x, 2), 17, () => H(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ N(() => y(H(t)));
			var r = Vm();
			let i;
			var a = L(r), o = L(a);
			Q(o, { get name() {
				return H(n).icon;
			} });
			var s = R(o), c = L(s), l = L(c, !0);
			k(c);
			var u = R(c), d = L(u, !0);
			k(u), k(s);
			var f = R(s), p = L(f, !0);
			k(f), k(a);
			var m = R(a, 2), h = L(m);
			let g;
			k(m);
			var _ = R(m, 2), b = (e) => {
				var n = zm(), r = L(n, !0);
				k(n), z(() => K(r, H(t).path)), G(e, n);
			};
			q(_, (e) => {
				H(t).status === "success" && e(b);
			});
			var x = R(_, 2), S = (e) => {
				var n = Bm(), r = L(n, !0);
				k(n), z(() => K(r, H(t).error || "Upload failed")), G(e, n);
			};
			q(x, (e) => {
				H(t).status === "error" && e(S);
			}), k(r), z((e) => {
				i = Y(r, 1, "upload-item", null, i, {
					"upload-item-success": H(t).status === "success",
					"upload-item-error": H(t).status === "error",
					"upload-item-uploading": H(t).status === "uploading"
				}), K(l, H(t).name), K(d, e), K(p, H(n).label), X(m, "aria-label", H(t).name), X(m, "aria-valuenow", H(t).progress), g = ni(h, "", g, { width: `${H(t).progress}%` });
			}, [() => v(H(t).size)]), G(e, r);
		}), k(b), k(d);
		var C = R(d, 2), w = L(C), T = L(w, !0);
		k(w);
		var E = R(w, 2);
		k(C), k(r), k(t), z(() => {
			s.disabled = H(c), K(T, H(c) ? "Wait for uploads to finish before closing." : H(i).length ? `${H(l)} uploaded${H(u) ? ` · ${H(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), E.disabled = H(c);
		}), U("click", n, _), U("click", s, _), U("change", f, () => H(o).files && m(H(o).files)), yr("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), yr("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), yr("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), U("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), H(o).click());
		}), U("click", g, () => H(o).click()), U("click", E, _), G(e, t);
	};
	q(x, (e) => {
		H(n).open && e(S);
	}), G(e, b), M();
}
br([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/components/component-registry.ts
var Wm = /* @__PURE__ */ new Map();
async function Gm(e, t, n) {
	await Km(e), t.replaceChildren(), Wm.set(e, n(t));
}
async function Km(e) {
	let t = Wm.get(e);
	t && (Wm.delete(e), await t());
}
async function qm() {
	let e = [...Wm.keys()].reverse();
	for (let t of e) await Km(t);
}
//#endregion
//#region src/components/model-channel.ts
function Jm(e) {
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
//#region src/entry.ts
var $ = () => void 0, Ym = async () => void 0, Xm = [{
	id: "",
	label: "Forge default",
	src: "/favicon.svg"
}], Zm = Jm({
	identity: "",
	loading: !0,
	error: "",
	version: "v0.1.0",
	activeWorkspaceId: "",
	workspaces: [],
	projects: [],
	sessions: [],
	paneSizes: {
		sidebarWidth: 280,
		chatWidth: 420,
		sidebarSessionHeight: 210
	},
	mobile: {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	},
	route: {
		path: "",
		revision: 0,
		replace: !0
	},
	onSwitchWorkspace: Ym,
	onAddWorkspace: $,
	onCreateProject: $,
	onOpenSettings: $,
	onToggleProject: Ym,
	onSelectResource: Ym,
	onReorder: Ym,
	onDragState: $,
	onPanePreview: $,
	onPaneCommit: $,
	onPaneViewport: $,
	onMobileSidebar: $,
	onMobileView: $,
	onMobileImmersive: $,
	onToast: $,
	onIconsChanged: $,
	onHistoryNavigation: Ym
}), Qm = Jm({
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
		selfDriving: !1,
		agentName: "",
		agentProfiles: "",
		prompt: "",
		completionCriteria: "",
		activeTab: "edit",
		editedMarkdown: null,
		showOptions: !1
	},
	templates: [],
	agents: [],
	profileKeys: [],
	preview: null,
	previewKey: "",
	previewing: !1,
	previewError: "",
	templateDigest: "",
	submitting: !1,
	onClose: $,
	onPreview: Ym,
	onSubmit: Ym,
	previewRequestKey: () => "",
	onConfirmTemplateSwitch: () => !0,
	onIconsChanged: $
}), $m = Jm({
	open: !1,
	identity: "",
	dataVersion: 0,
	initialTab: "workspace",
	workspaces: [],
	activeWorkspaceId: "",
	workspaceIcons: Xm,
	workspaceIconSavingId: "",
	userName: "User",
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
	onClose: $,
	onAddWorkspace: Ym,
	onRemoveWorkspace: Ym,
	onWorkspaceIcon: Ym,
	onSaveUser: async (e) => e,
	onSaveAgentHub: Ym,
	onBrowserNotifications: $,
	onCompletionSound: $,
	onToast: $,
	onIconsChanged: $
}), eh = Jm({
	open: !1,
	identity: "",
	resourceId: "",
	reuseCurrentSession: !1,
	agents: [],
	draft: {
		agentName: "",
		runInstructions: ""
	},
	submitting: !1,
	error: "",
	unknown: !1,
	onClose: $,
	onSubmit: Ym,
	onIconsChanged: $
}), th = Jm({
	identity: "",
	visible: !1,
	status: {
		key: "disabled",
		label: "Off",
		icon: "circle-dashed"
	},
	summary: "",
	expanded: !1,
	hasProjection: !1,
	revision: 0,
	enabled: !1,
	preferredProfiles: [],
	actualAgent: "",
	actualReason: "",
	waitingSummary: "",
	wakeCondition: "",
	wakeFallback: !1,
	lastOutcome: null,
	statusReason: null,
	pending: !1,
	onToggleEnabled: $,
	onToggleDetails: $,
	onIconsChanged: $
}), nh = Jm({
	message: "",
	revision: 0
}), rh = Jm({
	open: !1,
	identity: "",
	workspaceId: "",
	runId: "",
	onDone: $,
	onIconsChanged: $
}), ih = Jm({
	identity: "",
	workspaceId: "",
	resourceId: "",
	runId: "",
	runStatus: "",
	live: !1,
	canResume: !1,
	draft: "",
	draftKey: "",
	draftResetVersion: 0,
	unavailableReason: "",
	sending: !1,
	externalLocked: !1,
	internalLocked: !1,
	agents: [],
	selectedAgentId: "",
	chooserOpen: !1,
	sessionStarting: !1,
	actionsOpen: !1,
	canEndTurn: !1,
	endingTurn: !1,
	closingSession: !1,
	selfDrivingRemainsEnabled: !1,
	selfDrivingDisabling: !1,
	onDraft: $,
	onSend: async () => ({
		accepted: !1,
		clear: !1
	}),
	onOpenUpload: $,
	onToggleChooser: $,
	onChooseAgent: $,
	onToggleActions: $,
	onResume: $,
	onEndTurn: $,
	onCloseSession: $,
	onIconsChanged: $
}), ah = Jm({
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
	logs: {
		hasMore: !1,
		loading: !1,
		error: ""
	},
	onNavigate: $,
	onCreateTask: $,
	onArchive: $,
	onLoadMoreLogs: Ym,
	onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
	onToast: $,
	onIconsChanged: $
}), oh = Jm({
	identity: "",
	workspaceId: "",
	resourceId: "",
	activeRunId: "",
	runs: [],
	switchingRunId: "",
	onSelect: Ym,
	onToast: $,
	onIconsChanged: $
}), sh = Jm({
	identity: "",
	workspaceId: "",
	activeRunId: "",
	activeRun: null,
	runCount: 0,
	agentName: "Agent",
	project: () => [],
	onEvent: $,
	onNotice: $,
	onApproval: Ym,
	onToast: $,
	onIconsChanged: $
});
async function ch() {
	await lh("app-shell", "app", cu, { channel: Zm });
}
async function lh(e, t, n, r) {
	let i = document.getElementById(t);
	i && await Gm(e, i, (t) => {
		t.dataset.componentOwner = e;
		let i = kr(n, {
			target: t,
			props: r
		});
		return async () => {
			delete t.dataset.componentOwner, await Nr(i);
		};
	});
}
async function uh() {
	await Promise.all([
		lh("create-dialog", "createDialogRoot", pd, { channel: Qm }),
		lh("settings", "settingsRoot", Fm, { channel: $m }),
		lh("self-driving-dialog", "selfDrivingDialogRoot", Xp, { channel: eh }),
		lh("self-driving-bar", "selfDrivingBarWrap", Up, { channel: th }),
		lh("upload-dialog", "uploadDialogRoot", Um, { channel: rh }),
		lh("chat-composer", "ttyComposer", Su, { channel: ih }),
		lh("session-switcher", "agentSessionsWrap", rm, { channel: oh }),
		lh("event-timeline", "ttyLog", Lp, { channel: sh }),
		lh("detail-panel", "detailsPanel", Ef, { channel: ah }),
		lh("toast", "toastRoot", Lm, { channel: nh })
	]);
}
var dh = {
	renderAppShell: (e) => Zm.publish(e),
	renderCreateDialog: (e) => Qm.publish(e),
	renderSettings: (e) => $m.publish(e),
	renderSelfDrivingDialog: (e) => eh.publish(e),
	renderSelfDrivingBar: (e) => th.publish(e),
	renderUploadDialog: (e) => rh.publish(e),
	renderComposer: (e) => ih.publish(e),
	renderSessionSwitcher: (e) => oh.publish(e),
	renderEventTimeline: (e) => sh.publish(e),
	renderDetailPanel: (e) => ah.publish(e),
	renderToast: (e) => nh.publish(e)
};
window.addEventListener("pagehide", () => {
	Hl(), qm();
}), window.addEventListener("pageshow", (e) => {
	e.persisted && (async () => {
		await ch(), await uh(), Bl(dh);
	})();
}), (async () => {
	await ch(), await uh(), Bl(dh);
})().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
