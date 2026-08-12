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
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, C = 1 << 20, w = 1 << 25, T = 65536, ee = 1 << 21, te = 1 << 22, ne = 1 << 23, re = Symbol("$state"), ie = Symbol("legacy props"), ae = Symbol(""), oe = Symbol("attributes"), se = Symbol("class"), ce = Symbol("style"), le = Symbol("text"), ue = Symbol("form reset"), de = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}(), fe = !!globalThis.document?.contentType && /* @__PURE__ */ globalThis.document.contentType.includes("xml");
function pe(e) {
	throw Error("https://svelte.dev/e/lifecycle_outside_component");
}
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function me() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function he(e, t, n) {
	throw Error("https://svelte.dev/e/each_key_duplicate");
}
function ge(e) {
	throw Error("https://svelte.dev/e/effect_in_teardown");
}
function _e() {
	throw Error("https://svelte.dev/e/effect_in_unowned_derived");
}
function ve(e) {
	throw Error("https://svelte.dev/e/effect_orphan");
}
function ye() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function be(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function xe() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function Se() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function Ce() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function we() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var Te = {}, Ee = Symbol("uninitialized"), De = "http://www.w3.org/1999/xhtml", Oe = "http://www.w3.org/2000/svg", ke = "http://www.w3.org/1998/Math/MathML";
function Ae() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function je(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Me() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function Ne() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var E = !1;
function Pe(e) {
	E = e;
}
var D;
function Fe(e) {
	if (e === null) throw je(), Te;
	return D = e;
}
function Ie() {
	return Fe(/* @__PURE__ */ un(D));
}
function O(e) {
	if (E) {
		if (/* @__PURE__ */ un(D) !== null) throw je(), Te;
		D = e;
	}
}
function k(e = 1) {
	if (E) {
		for (var t = e, n = D; t--;) n = /* @__PURE__ */ un(n);
		D = n;
	}
}
function Le(e = !0) {
	for (var t = 0, n = D;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ un(n);
		e && n.remove(), n = i;
	}
}
function Re(e) {
	if (!e || e.nodeType !== 8) throw je(), Te;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function ze(e) {
	return e === this.v;
}
function Be(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ve(e) {
	return !Be(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var He = null;
function Ue(e) {
	He = e;
}
function A(e, t = !1, n) {
	He = {
		p: He,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: V,
		l: null
	};
}
function j(e) {
	var t = He, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) xn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, He = t.p, e ?? {};
}
function We() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ge = [];
function Ke() {
	var e = Ge;
	Ge = [], f(e);
}
function qe(e) {
	if (Ge.length === 0 && !At) {
		var t = Ge;
		queueMicrotask(() => {
			t === Ge && Ke();
		});
	}
	Ge.push(e);
}
function Je() {
	for (; Ge.length > 0;) Ke();
}
function Ye(e) {
	var t = V;
	if (t === null) return B.f |= ne, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Xe(e, t);
}
function Xe(e, t) {
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
var Ze = ~(h | g | m);
function Qe(e, t) {
	e.f = e.f & Ze | t;
}
function $e(e) {
	e.f & 512 || e.deps === null ? Qe(e, m) : Qe(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function et(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, et(t.deps));
}
function tt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), et(e.deps), Qe(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var nt = !1;
function rt(e) {
	var t = nt;
	try {
		return nt = !1, [e(), nt];
	} finally {
		nt = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function it(e) {
	E && /* @__PURE__ */ ln(e) !== null && dn(e);
}
var at = !1;
function ot() {
	at || (at = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ue]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function st(e) {
	var t = B, n = V;
	Wn(null), Gn(null);
	try {
		return e();
	} finally {
		Wn(t), Gn(n);
	}
}
function ct(e, t, n, r = n) {
	e.addEventListener(t, () => st(n));
	let i = e[ue];
	e[ue] = i ? () => {
		i(), r(!0);
	} : () => r(!0), ot();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function lt(e) {
	let t = 0, n = qt(0), r;
	return () => {
		vn() && (H(n), Tn(() => (t === 0 && (r = fr(() => e(() => Zt(n)))), t += 1, () => {
			qe(() => {
				--t, t === 0 && (r?.(), r = void 0, Zt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ut = x | S;
function dt(e, t, n, r) {
	new ft(e, t, n, r);
}
var ft = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t = E ? D : null;
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
	#h = lt(() => (this.#m = qt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = V;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = V.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = En(() => {
			if (E) {
				let e = this.#t;
				Ie();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ut), E && (this.#e = D);
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
		qe(r), t && (this.#s = Dn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				Ne();
				return;
			}
			t = !0, n && we(), this.#s !== null && Pn(this.#s, () => {
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
					Xe(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = Dn(() => e(this.#e)), qe(() => {
			var e = this.#c = document.createDocumentFragment(), t = cn();
			e.append(t), this.#a = this.#S(() => Dn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Pn(this.#o, () => {
				this.#o = null;
			}), this.#x(N));
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
			} else this.#x(N);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		tt(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = V, n = B, r = He;
		Gn(this.#i), Wn(this.#i), Ue(this.#i.ctx);
		try {
			return It.ensure(), e();
		} catch (e) {
			return Ye(e), null;
		} finally {
			Gn(t), Wn(n), Ue(r);
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
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, qe(() => {
			this.#d = !1, this.#m && Yt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), H(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		N?.is_fork ? (this.#a && N.skip_effect(this.#a), this.#o && N.skip_effect(this.#o), this.#s && N.skip_effect(this.#s), N.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (jn(this.#a), null), this.#o &&= (jn(this.#o), null), this.#s &&= (jn(this.#s), null), E && (Fe(this.#t), k(), Fe(Le()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return Dn(() => {
						var r = V;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Xe(e, this.#i.parent), null;
				}
			}));
		};
		qe(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Xe(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Xe(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function pt(e, t, n, r) {
	let i = We() ? _t : bt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = V, c = mt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Xe(e, s);
			}
			ht();
		}
	}
	var d = gt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ yt(e))).then(u).catch((e) => Xe(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), ht();
	}) : f();
}
function mt() {
	var e = V, t = B, n = He, r = N;
	return function(i = !0) {
		Gn(e), Wn(t), Ue(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ht(e = !0) {
	Gn(null), Wn(null), Ue(null), e && N?.deactivate();
}
function gt() {
	var e = V, t = e.b, n = N, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function _t(e) {
	var t = 2 | h;
	return V !== null && (V.f |= S), {
		ctx: He,
		deps: null,
		effects: null,
		equals: ze,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: Ee,
		wv: 0,
		parent: V,
		ac: null
	};
}
var vt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function yt(e, t, n) {
	let r = V;
	r === null && me();
	var i = void 0, a = qt(Ee), o = !B, s = /* @__PURE__ */ new Set();
	return wn(() => {
		var t = V, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== de && n.reject(e);
			}).finally(ht);
		} catch (e) {
			n.reject(e), ht();
		}
		var c = N;
		if (o) {
			if (t.f & 32768) var l = gt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(vt);
			else for (let e of s.values()) e.reject(vt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== vt && (c.activate(), t ? (a.f |= ne, Yt(a, t)) : (a.f & 8388608 && (a.f ^= ne), Yt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), yn(() => {
		for (let e of s) e.reject(vt);
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
function M(e) {
	let t = /* @__PURE__ */ _t(e);
	return qn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function bt(e) {
	let t = /* @__PURE__ */ _t(e);
	return t.equals = Ve, t;
}
function xt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) jn(t[n]);
	}
}
function St(e) {
	var t, n = V, r = e.parent;
	if (!Vn && r !== null && e.v !== Ee && r.f & 24576) return Ae(), e.v;
	Gn(r);
	try {
		e.f &= ~T, xt(e), t = ar(e);
	} finally {
		Gn(n);
	}
	return t;
}
function Ct(e) {
	var t = St(e);
	if (!e.equals(t) && (e.wv = nr(), (!N?.is_fork || e.deps === null) && (N === null ? e.v = t : (N.capture(e, t, !0), Dt?.capture(e, t, !0)), e.deps === null))) {
		Qe(e, m);
		return;
	}
	Vn || (Ot === null ? $e(e) : (vn() || N?.is_fork) && Ot.set(e, t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
		t.ac.abort(de), t.ac = null;
	}), t.fn !== null && (t.teardown = d), sr(t, 0), kn(t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && cr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Et = null, N = null, Dt = null, Ot = null, kt = null, At = !1, jt = !1, Mt = null, Nt = null, Pt = 0, Ft = 1, It = class e {
	id = Ft++;
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
		Et === null ? Et = this : (Et.#n = this, this.#t = Et), Et = this;
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
			for (var r of n.d) Qe(r, h), t(r);
			for (r of n.m) Qe(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Pt++ > 1e3 && (this.#x(), Rt());
		for (let e of this.#u) this.#d.delete(e), Qe(e, h), this.schedule(e);
		for (let e of this.#d) Qe(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Mt = [], r = [], i = Nt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ut(e), this.#h() || this.discard(), t;
		}
		if (N = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Mt = null, Nt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Ht(e, t);
			i.length > 0 && N.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Dt = this, Bt(r), Bt(n), Dt = null, this.#s?.resolve();
		var s = N;
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Qe(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), N = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) tt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== Ee && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Ot?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		N = this;
	}
	deactivate() {
		N = null, Ot = null;
	}
	flush() {
		try {
			jt = !0, N = this, this.#g();
		} finally {
			Pt = 0, kt = null, Mt = null, Nt = null, jt = !1, N = null, Ot = null, Gt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(vt);
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
		this.#m || (this.#m = !0, qe(() => {
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
		if (N === null) {
			let t = N = new e();
			!jt && !At && qe(() => {
				t.#e || t.flush();
			});
		}
		return N;
	}
	apply() {
		Ot = null;
	}
	schedule(e) {
		if (kt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (Mt !== null && t === V && (B === null || !(B.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Et = e : t.#t = e, this.linked = !1;
		}
	}
};
function Lt(e) {
	var t = At;
	At = !0;
	try {
		var n;
		for (e && (N !== null && !N.is_fork && N.flush(), n = e());;) {
			if (Je(), N === null) return n;
			N.flush();
		}
	} finally {
		At = t;
	}
}
function Rt() {
	try {
		ye();
	} catch (e) {
		Xe(e, kt);
	}
}
var zt = null;
function Bt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && rr(r) && (zt = /* @__PURE__ */ new Set(), cr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nn(r), zt?.size > 0)) {
				Gt.clear();
				for (let e of zt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) zt.has(n) && (zt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || cr(n);
					}
				}
				zt.clear();
			}
		}
		zt = null;
	}
}
function Vt(e) {
	N.schedule(e);
}
function Ht(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Qe(e, m);
		for (var n = e.first; n !== null;) Ht(n, t), n = n.next;
	}
}
function Ut(e) {
	Qe(e, m);
	for (var t = e.first; t !== null;) Ut(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Wt = /* @__PURE__ */ new Set(), Gt = /* @__PURE__ */ new Map(), Kt = !1;
function qt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: ze,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function P(e, t) {
	let n = qt(e, t);
	return qn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Jt(e, t = !1, n = !0) {
	let r = qt(e);
	return t || (r.equals = Ve), r;
}
function F(e, t, n = !1) {
	return B !== null && (!Un || B.f & 131072) && We() && B.f & 4325394 && (Kn === null || !Kn.has(e)) && Ce(), Yt(e, n ? $t(t) : t, Nt);
}
function Yt(e, t, n = null) {
	if (!e.equals(t)) {
		Gt.set(e, Vn ? t : e.v);
		var r = It.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && St(t), Ot === null && $e(t);
		}
		e.wv = nr(), Qt(e, h, n), We() && V !== null && V.f & 1024 && !(V.f & 96) && (Xn === null ? Zn([e]) : Xn.push(e)), !r.is_fork && Wt.size > 0 && !Kt && Xt();
	}
	return t;
}
function Xt() {
	Kt = !1;
	for (let e of Wt) {
		e.f & 1024 && Qe(e, g);
		let t;
		try {
			t = rr(e);
		} catch {
			t = !0;
		}
		t && cr(e);
	}
	Wt.clear();
}
function Zt(e) {
	F(e, e.v + 1);
}
function Qt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = We(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === V)) {
			var l = (c & h) === 0;
			if (l && Qe(s, t), c & 131072) Wt.add(s);
			else if (c & 2) {
				var u = s;
				Ot?.delete(u), c & 65536 || (c & 512 && (V === null || !(V.f & 2097152)) && (s.f |= T), Qt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && zt !== null && zt.add(d), n === null ? Vt(d) : n.push(d);
			}
		}
	}
}
function $t(t) {
	if (typeof t != "object" || !t || re in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ P(0), u = null, d = er, f = (e) => {
		if (er === d) return e();
		var t = B, n = er;
		Wn(null), tr(d);
		var r = e();
		return Wn(t), tr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ P(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && xe();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ P(n.value, u);
				return r.set(t, e), e;
			}) : F(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ P(Ee, u));
					r.set(t, e), Zt(o);
				}
			} else F(n, Ee), Zt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === re) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ P($t(s ? e[n] : Ee), u)), r.set(n, o)), o !== void 0) {
				var c = H(o);
				return c === Ee ? void 0 : c;
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
				if (a !== void 0 && o !== Ee) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === re) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== Ee || Reflect.has(e, t);
			return (n !== void 0 || V !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ P(i ? $t(e[t]) : Ee, u)), r.set(t, n)), H(n) === Ee) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ P(Ee, u)), r.set(d + "", p)) : F(p, Ee);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ P(void 0, u)), F(c, $t(n)), r.set(t, c));
			else {
				l = c.v !== Ee;
				var m = f(() => $t(n));
				F(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && F(g, _ + 1);
				}
				Zt(o);
			}
			return !0;
		},
		ownKeys(e) {
			H(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== Ee;
			});
			for (var [n, i] of r) i.v !== Ee && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			Se();
		}
	});
}
function en(e) {
	try {
		if (typeof e == "object" && e && re in e) return e[re];
	} catch {}
	return e;
}
function tn(e, t) {
	return Object.is(en(e), en(t));
}
var nn, rn, an, on;
function sn() {
	if (nn === void 0) {
		nn = window, rn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		an = a(t, "firstChild").get, on = a(t, "nextSibling").get, u(e) && (e[se] = void 0, e[oe] = null, e[ce] = void 0, e.__e = void 0), u(n) && (n[le] = void 0);
	}
}
function cn(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function ln(e) {
	return an.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function un(e) {
	return on.call(e);
}
function I(e, t) {
	if (!E) return /* @__PURE__ */ ln(e);
	var n = /* @__PURE__ */ ln(D);
	if (n === null) n = D.appendChild(cn());
	else if (t && n.nodeType !== 3) {
		var r = cn();
		return n?.before(r), Fe(r), r;
	}
	return t && mn(n), Fe(n), n;
}
function L(e, t = !1) {
	if (!E) {
		var n = /* @__PURE__ */ ln(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ un(n) : n;
	}
	if (t) {
		if (D?.nodeType !== 3) {
			var r = cn();
			return D?.before(r), Fe(r), r;
		}
		mn(D);
	}
	return D;
}
function R(e, t = 1, n = !1) {
	let r = E ? D : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ un(r);
	if (!E) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = cn();
			return r === null ? i?.after(a) : r.before(a), Fe(a), a;
		}
		mn(r);
	}
	return Fe(r), r;
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
	V === null && (B === null && ve(e), _e()), Vn && ge(e);
}
function gn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function _n(e, t) {
	var n = V;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: He,
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
	N?.register_created_effect(r);
	var i = r;
	if (e & 4) Mt === null ? It.ensure().schedule(r) : Mt.push(r);
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
	return Qe(t, m), t.teardown = e, t;
}
function bn(e) {
	hn("$effect");
	var t = V.f;
	if (!B && t & 32 && He !== null && !He.i) {
		var n = He;
		(n.e ??= []).push(e);
	} else return xn(e);
}
function xn(e) {
	return _n(4 | C, e);
}
function Sn(e) {
	It.ensure();
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
	return _n(te | S, e);
}
function Tn(e, t = 0) {
	return _n(8 | t, e);
}
function z(e, t = [], n = [], r = []) {
	pt(r, t, n, (t) => {
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
		e !== null && st(() => {
			e.abort(de);
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
		var n = e === t ? null : /* @__PURE__ */ un(e);
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
		e.f ^= _, e.f & 1024 || (Qe(e, h), It.ensure().schedule(e));
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
		var i = n === r ? null : /* @__PURE__ */ un(n);
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
			if (rr(a) && Ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && Ot === null && Qe(e, m);
	}
	return !1;
}
function ir(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Kn !== null && Kn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ir(a, t, !1) : t === a && (n ? Qe(a, h) : a.f & 1024 && Qe(a, g), Vt(a));
	}
}
function ar(e) {
	var t = Jn, n = Yn, r = Xn, i = B, a = Kn, o = He, s = Un, c = er, l = e.f;
	Jn = null, Yn = 0, Xn = null, B = l & 96 ? null : e, Kn = null, Ue(e.ctx), Un = !1, er = ++$n, e.ac !== null && (st(() => {
		e.ac.abort(de);
	}), e.ac = null);
	try {
		e.f |= ee;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = N?.is_fork;
		if (Jn !== null) {
			var m;
			if (p || sr(e, Yn), f !== null && Yn > 0) for (f.length = Yn + Jn.length, m = 0; m < Jn.length; m++) f[Yn + m] = Jn[m];
			else e.deps = f = Jn;
			if (vn() && e.f & 512) for (m = Yn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Yn < f.length && (sr(e, Yn), f.length = Yn);
		if (We() && Xn !== null && !Un && f !== null && !(e.f & 6146)) for (m = 0; m < Xn.length; m++) ir(Xn[m], e);
		if (i !== null && i !== e) {
			if ($n++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = $n;
			if (t !== null) for (let e of t) e.rv = $n;
			Xn !== null && (r === null ? r = Xn : r.push(...Xn));
		}
		return e.f & 8388608 && (e.f ^= ne), d;
	} catch (e) {
		return Ye(e);
	} finally {
		e.f ^= ee, Jn = t, Yn = n, Xn = r, B = i, Kn = a, Ue(o), Un = s, er = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== Ee && $e(s), s.ac !== null && st(() => {
			s.ac.abort(de), s.ac = null, Qe(s, h);
		}), wt(s), sr(s, 0);
	}
}
function sr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) or(e, n[r]);
}
function cr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Qe(e, m);
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
	await Promise.resolve(), Lt();
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
	if (Vn && Gt.has(e)) return Gt.get(e);
	if (t) {
		var a = e;
		if (Vn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || dr(a)) && (o = St(a)), Gt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Un && B !== null && (Bn || !!(B.f & 512)), c = (a.f & y) === 0;
		rr(a) && (s && (a.f |= 512), Ct(a)), s && !c && (Tt(a), ur(a));
	}
	if (Ot?.has(e)) return Ot.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function ur(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Tt(t), ur(t));
}
function dr(e) {
	if (e.v === Ee) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Gt.has(t) || t.f & 2 && dr(t)) return !0;
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
		if (r.capture || Sr.call(t, e), !e.cancelBubble) return st(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qe(() => {
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
		if (E) return Er(D, null), D;
		i === void 0 && (i = Tr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ ln(i)));
		var t = r || rn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ ln(t), s = t.lastChild;
			Er(o, s);
		} else Er(t, t);
		return t;
	};
}
function Dr(e = "") {
	if (!E) {
		var t = cn(e + "");
		return Er(t, t), t;
	}
	var n = D;
	return n.nodeType === 3 ? mn(n) : (n.before(n = cn()), Fe(n)), Er(n, n), n;
}
function Or() {
	if (E) return Er(D, null), D;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = cn();
	return e.append(t, n), Er(t, n), e;
}
function G(e, t) {
	if (E) {
		var n = V;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = D), Ie();
		return;
	}
	e !== null && e.before(t);
}
function K(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[le] ??= e.nodeValue) && (e[le] = n, e.nodeValue = `${n}`);
}
function kr(e, t) {
	return jr(e, t);
}
var Ar = /* @__PURE__ */ new Map();
function jr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	sn();
	var l = void 0, u = Sn(() => {
		var s = n ?? t.appendChild(cn());
		dt(s, { pending: () => {} }, (t) => {
			A({});
			var n = He;
			if (o && (n.c = o), a && (i.$$events = a), E && Er(t, null), l = e(t, i) || {}, E && (V.nodes.end = D, D === null || D.nodeType !== 8 || D.data !== "]")) throw je(), Te;
			j();
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
						Rn(r, t), t.append(cn()), this.#n.set(e, {
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
		var n = N, r = fn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = cn();
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
		} else E && (this.anchor = D), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function q(e, t, n = !1) {
	var r;
	E && (r = D, Ie());
	var i = new Pr(e), a = n ? x : 0;
	function o(e, t) {
		if (E) {
			var n = Re(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Le();
				Fe(a), i.anchor = a, Pe(!1), i.ensure(e, t), Pe(!0);
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
	E && Ie();
	var r = new Pr(e), i = !We();
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
		c = E ? Fe(/* @__PURE__ */ ln(u)) : u.appendChild(cn());
	}
	E && Ie();
	var d = null, f = /* @__PURE__ */ bt(() => {
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
			E && Re(c) === "[!" != (e === 0) && (c = Le(), Fe(c), Pe(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = N, v = fn(), y = 0; y < e; y += 1) {
				E && D.nodeType === 8 && D.data === "]" && (c = D, t = !0, Pe(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Yt(S.v, b), S.i && Yt(S.i, y), v && u.unskip_effect(S.e)) : (S = Ur(l, h ? c : Br ??= cn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Dn(() => s(c)) : (d = Dn(() => s(Br ??= cn())), d.f |= w)), e > r.size && he("", "", ""), E && e > 0 && Fe(Le()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Pe(!0), H(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, E && (c = D);
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
		var ee = T.length;
		if (ee > 0) {
			var te = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < ee; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < ee; v += 1) T[v].nodes?.a?.fix();
			}
			Rr(e, T, te);
		}
	}
	o && qe(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ur(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? qt(n) : /* @__PURE__ */ Jt(n, !1, !1) : null, l = o & 2 ? qt(i) : null;
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
		var o = /* @__PURE__ */ un(r);
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
		E && (o = Fe(/* @__PURE__ */ ln(c)));
	}
	z(() => {
		var e = V;
		if (s === (s = t() ?? "")) {
			E && Ie();
			return;
		}
		if (n && !E) {
			e.nodes = null, c.innerHTML = s, s !== "" && Er(/* @__PURE__ */ ln(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Mn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (E) {
				for (var a = D.data, l = Ie(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ un(l);
				if (l === null) throw je(), Te;
				Er(D, u), o = Fe(l);
				return;
			}
			var d = pn(r ? "svg" : i ? "math" : "template", r ? Oe : i ? ke : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Er(/* @__PURE__ */ ln(f), f.lastChild), r || i) for (; /* @__PURE__ */ ln(f);) o.before(/* @__PURE__ */ ln(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function qr(e, t, ...n) {
	var r = new Pr(e);
	En(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, x);
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Jr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Jr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Yr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Jr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Xr(e) {
	return typeof e == "object" ? Yr(e) : e ?? "";
}
var Zr = [..." 	\n\r\f\xA0\v﻿"];
function Qr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Zr.includes(r[o - 1])) && (s === r.length || Zr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function $r(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ei(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ti(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ei)), i && c.push(...Object.keys(i).map(ei));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ei(e.substring(l, u).trim());
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
		return r && (n += $r(r)), i && (n += $r(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Y(e, t, n, r, i, a) {
	var o = e[se];
	if (E || o !== n || o === void 0) {
		var s = Qr(n, r, a);
		(!E || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[se] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ni(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ri(e, t, n, r) {
	var i = e[ce];
	if (E || i !== t) {
		var a = ti(t, r);
		(!E || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ce] = t;
	} else r && (Array.isArray(r) ? (ni(e, n?.[0], r[0]), ni(e, n?.[1], r[1], "important")) : ni(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ii(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Me();
		for (var i of t.options) i.selected = n.includes(si(i));
		return;
	}
	for (i of t.options) if (tn(si(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function ai(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ii(e, e.__value);
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
function oi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	ct(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), si);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && si(o);
		}
		n(a), e.__value = a, N !== null && r.add(N);
	}), Cn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = N;
			if (r.has(o)) return;
		}
		if (ii(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = si(s), n(a));
		}
		e.__value = a, i = !1;
	}), ai(e);
}
function si(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var ci = Symbol("is custom element"), li = Symbol("is html"), ui = fe ? "link" : "LINK", di = fe ? "progress" : "PROGRESS";
function fi(e) {
	if (E) {
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
		e[ue] = n, qe(n), ot();
	}
}
function pi(e, t) {
	var n = hi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === di) && (e.value = t ?? "");
}
function mi(e, t) {
	var n = hi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function X(e, t, n, r) {
	var i = hi(e);
	E && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === ui) || i[t] !== (i[t] = n) && (t === "loading" && (e[ae] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && _i(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function hi(e) {
	return e[oe] ??= {
		[ci]: e.nodeName.includes("-"),
		[li]: e.namespaceURI === De
	};
}
var gi = /* @__PURE__ */ new Map();
function _i(e) {
	var t = e.getAttribute("is") || e.nodeName, n = gi.get(t);
	if (n) return n;
	gi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function vi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ct(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = bi(e) ? xi(a) : a, n(a), N !== null && r.add(N), await lr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (E && e.defaultValue !== e.value || fr(t) == null && e.value) && (n(bi(e) ? xi(e.value) : e.value), N !== null && r.add(N)), Tn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = N;
			if (r.has(i)) return;
		}
		bi(e) && n === xi(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function yi(e, t, n = t) {
	ct(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (E && e.defaultChecked !== e.checked || fr(t) == null) && n(e.checked), Tn(() => {
		e.checked = !!t();
	});
}
function bi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function xi(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Si(e, t) {
	return e === t || e?.[re] === t;
}
function Ci(e = {}, t, n, r) {
	var i = He.r, a = V;
	return Cn(() => {
		var o, s;
		return Tn(() => {
			o = s, s = r?.() || [], fr(() => {
				Si(n(...s), e) || (t(e, ...s), o && Si(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Si(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function wi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ _t(r), H(u)) : (l && (l = !1, c = s ? fr(r) : r), c);
	let f;
	if (o) {
		var p = re in e || ie in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = rt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && be(t), f(m)));
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
	var v = !1, y = (n & 1 ? _t : bt)(() => (v = !1, g()));
	o && H(y);
	var b = V;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? H(y) : i && o ? $t(e) : e;
			return F(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Vn && v || b.f & 16384 ? y.v : H(y);
	});
}
function Ti(e) {
	He === null && pe("onMount"), bn(() => {
		let t = fr(e);
		if (typeof t == "function") return t;
	});
}
function Ei(e) {
	He === null && pe("onDestroy"), Ti(() => () => fr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/components/Icon.svelte
var Di = /* @__PURE__ */ W("<i></i>");
function Z(e, t) {
	let n = wi(t, "className", 3, "");
	var r = Di();
	z(() => {
		X(r, "data-lucide", t.name), Y(r, 1, Xr(n()));
	}), G(e, r);
}
//#endregion
//#region src/components/StatusPresentation.svelte
var Oi = /* @__PURE__ */ W("<span><!></span>"), ki = /* @__PURE__ */ W("<span data-component-owner=\"status-presentation\" aria-hidden=\"true\"></span>");
function Ai(e, t) {
	A(t, !0);
	let n = wi(t, "className", 3, "");
	var r = Or(), i = L(r), a = (e) => {
		var r = ki();
		J(r, 21, () => t.status.statuses, (e) => e.key, (e, t) => {
			var n = Oi();
			Z(I(n), {
				get name() {
					return H(t).iconName;
				},
				className: "task-status-icon"
			}), O(n), z(() => Y(n, 1, `task-status-indicator ${H(t).className} ${H(t).recentOutput ? "task-status-fresh" : ""}`)), G(e, n);
		}), O(r), z(() => Y(r, 1, `task-status-slot ${n()} ${t.status.slotClassName}`)), G(e, r);
	};
	q(i, (e) => {
		t.status.hasTaskState && e(a);
	}), G(e, r), j();
}
//#endregion
//#region src/components/GlobalSessionList.svelte
var ji = /* @__PURE__ */ W("<div class=\"session-row muted-row\"><!><div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>"), Mi = /* @__PURE__ */ W("<span class=\"session-unread-badge\" aria-label=\"Unread turn completion\">New</span>"), Ni = /* @__PURE__ */ W("<button type=\"button\"><!> <div class=\"session-title\"><strong> </strong><span> </span></div> <span> </span> <!> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Pi = /* @__PURE__ */ W("<section class=\"session-section\" data-component-owner=\"global-session-list\"><div class=\"section-title\"><span>Sessions</span></div> <div id=\"sessionList\" class=\"session-list\"><!></div></section>");
function Fi(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P($t(t.identity));
	bn(() => {
		t.identity !== H(i) && (F(i, t.identity, !0), u());
	});
	function a(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function o(e) {
		return !H(r) || H(r).id !== e ? "" : H(r).after ? "drop-after" : "drop-before";
	}
	function s(e, i) {
		e.stopPropagation(), F(n, {
			kind: "session",
			id: i,
			projectId: ""
		}, !0), F(r, null), t.onDragState(H(n)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", i));
	}
	function c(e, t) {
		if (!H(n) || H(n).id === t) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let i = e.currentTarget.getBoundingClientRect();
		F(r, {
			id: t,
			after: e.clientY > i.top + i.height / 2
		}, !0);
	}
	async function l(e, i) {
		if (e.preventDefault(), !H(n) || H(n).id === i) return;
		let a = H(n), o = {
			kind: "session",
			id: i,
			projectId: ""
		}, s = H(r)?.id === i && H(r).after;
		u();
		try {
			await t.onReorder(a, o, s);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function u() {
		H(n) && t.onDragState(null), F(n, null), F(r, null);
	}
	async function d(e) {
		if (e) try {
			await t.onSelect(e);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function f(e, t) {
		(e.target instanceof Element ? e.target : null)?.closest(".drag-handle") || t.navigationResourceId && d(t.navigationResourceId);
	}
	var p = Pi(), m = R(I(p), 2), h = I(m), g = (e) => {
		var t = ji();
		Z(I(t), { name: "message-square" }), k(), O(t), G(e, t);
	}, _ = (e) => {
		var r = Or();
		J(L(r), 17, () => t.sessions, (e) => e.id, (e, t) => {
			var r = Ni(), i = I(r);
			Ai(i, {
				get status() {
					return H(t).status;
				},
				className: "session-status-icon"
			});
			var d = R(i, 2), p = I(d), m = I(p, !0);
			O(p);
			var h = R(p), g = I(h, !0);
			O(h), O(d);
			var _ = R(d, 2), v = I(_, !0);
			O(_);
			var y = R(_, 2), b = (e) => {
				G(e, Mi());
			};
			q(y, (e) => {
				H(t).unread && e(b);
			});
			var x = R(y, 2);
			Z(I(x), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), O(x), O(r), z((e) => {
				Y(r, 1, e), X(r, "aria-label", `${H(t).title}. ${H(t).statusLabel}`), X(r, "title", H(t).statusLabel), K(m, H(t).title), K(g, H(t).meta), Y(_, 1, `session-badge ${H(t).source === "internal" ? "internal" : "external"}`), K(v, H(t).label);
			}, [() => `session-row ${H(t).source === "internal" ? "internal-session" : "external-session"} ${a(H(t).status)} ${H(t).clickable ? "clickable-session" : ""} ${H(t).current ? "current-session" : ""} ${H(t).unread ? "session-unread" : ""} ${H(n)?.id === H(t).id ? "drag-source" : ""} ${o(H(t).id)}`]), U("click", r, (e) => f(e, H(t))), yr("dragover", r, (e) => c(e, H(t).id)), yr("drop", r, (e) => l(e, H(t).id)), yr("dragstart", x, (e) => s(e, H(t).id)), yr("dragend", x, u), G(e, r);
		}), G(e, r);
	};
	q(h, (e) => {
		t.sessions.length === 0 ? e(g) : e(_, -1);
	}), O(m), O(p), G(e, p), j();
}
br(["click"]);
//#endregion
//#region src/components/LayoutSwitcher.svelte
var Ii = /* @__PURE__ */ W("<button type=\"button\" data-component-owner=\"layout-switcher\"><!></button>");
function Li(e, t) {
	let n = wi(t, "tone", 3, "light"), r = {
		auto: "layout-grid",
		three: "columns-3",
		two: "columns-2",
		split: "panel-left-close"
	}, i = {
		auto: "Auto (follows window width)",
		three: "Three columns",
		two: "Two columns with tabs",
		split: "Two columns, sidebar collapsed"
	};
	var a = Ii();
	Z(I(a), { get name() {
		return r[t.preference];
	} }), O(a), z(() => {
		Y(a, 1, `layout-switcher ${n()}`), X(a, "title", `Layout: ${i[t.preference]}`), X(a, "aria-label", `Switch layout (current: ${i[t.preference]})`);
	}), U("click", a, function(...e) {
		t.onCycle?.apply(this, e);
	}), G(e, a);
}
br(["click"]);
//#endregion
//#region src/components/MobileToolbar.svelte
var Ri = /* @__PURE__ */ W("<header class=\"mobile-toolbar\" data-component-owner=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" class=\"mobile-icon-button mobile-immersive-button\" type=\"button\" aria-label=\"Toggle immersive chat\"><!></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" data-component-owner=\"mobile-toolbar\" type=\"button\" aria-label=\"Close navigation\"></button>", 1);
function zi(e, t) {
	A(t, !0);
	var n = Ri(), r = L(n), i = I(r);
	Z(I(i), { name: "menu" }), O(i);
	var a = R(i, 2), o = I(a), s = R(o, 2);
	O(a);
	var c = R(a, 2), l = I(c);
	{
		let e = /* @__PURE__ */ M(() => t.immersive ? "minimize-2" : "maximize-2");
		Z(l, { get name() {
			return H(e);
		} });
	}
	O(c), O(r);
	var u = R(r, 2);
	z(() => {
		X(i, "aria-expanded", t.sidebarOpen), X(o, "aria-selected", t.view === "details"), X(s, "aria-selected", t.view === "chat"), X(c, "aria-pressed", t.immersive);
	}), U("click", i, () => t.onSidebar(!t.sidebarOpen)), U("click", o, () => t.onView("details")), U("click", s, () => t.onView("chat")), U("click", c, () => t.onImmersive(!t.immersive)), U("click", u, () => t.onSidebar(!1)), G(e, n), j();
}
br(["click"]);
//#endregion
//#region src/components/PaneResizeHandle.svelte
var Bi = /* @__PURE__ */ W("<div data-component-owner=\"pane-resize-handle\" role=\"separator\"></div>");
function Vi(e, t) {
	A(t, !0);
	let n = null;
	Ei(() => n?.());
	function r(e) {
		if (window.matchMedia("(max-width: 980px)").matches) return;
		e.preventDefault(), n?.();
		let r = e.currentTarget, i = document.getElementById("app"), a = document.getElementById("mobileSidebar"), o = document.querySelector(".workspace-panel"), s = document.getElementById("agentPanel"), c = document.querySelector(".session-section");
		if (!i || !a || !o || !s || !c) return;
		let l = document.body.dataset.layout === "two", u = e.clientX, d = e.clientY, f = a.getBoundingClientRect().width, p = s.getBoundingClientRect().width, m = c.getBoundingClientRect().height, h = t.kind === "sidebarSessionHeight" ? "resizing-y" : "resizing-x";
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
	var i = Bi();
	z(() => {
		X(i, "id", t.id), Y(i, 1, `resize-handle ${t.className}`), X(i, "aria-orientation", t.kind === "sidebarSessionHeight" ? "horizontal" : "vertical"), X(i, "aria-label", t.label);
	}), U("pointerdown", i, r), G(e, i), j();
}
br(["pointerdown"]);
//#endregion
//#region src/components/ProjectTree.svelte
var Hi = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), Ui = /* @__PURE__ */ W("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Wi = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Gi = /* @__PURE__ */ W("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), Ki = /* @__PURE__ */ W("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), qi = /* @__PURE__ */ W("<div class=\"task-group\"></div>"), Ji = /* @__PURE__ */ W("<button type=\"button\"><span class=\"chevron\"><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), Yi = /* @__PURE__ */ W("<section class=\"tree-section\" data-component-owner=\"project-tree\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section>");
function Xi(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P($t(t.identity));
	bn(() => {
		t.identity !== H(i) && (F(i, t.identity, !0), d());
	}), Ei(d);
	function a(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function o(e) {
		return !H(r) || H(r).id !== e ? "" : H(r).after ? "drop-after" : "drop-before";
	}
	function s(e) {
		return !H(n) || H(n).id === e.id || H(n).kind !== e.kind ? !1 : e.kind !== "task" || H(n).projectId === e.projectId;
	}
	function c(e, i) {
		e.stopPropagation(), F(n, i, !0), F(r, null), t.onDragState(i), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", i.id));
	}
	function l(e, t) {
		if (!s(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		F(r, {
			id: t.id,
			after: e.clientY > n.top + n.height / 2
		}, !0);
	}
	async function u(e, i) {
		if (e.preventDefault(), !H(n) || !s(i)) return;
		let a = H(n), o = H(r)?.id === i.id && H(r).after;
		d();
		try {
			await t.onReorder(a, i, o);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function d() {
		H(n) && t.onDragState(null), F(n, null), F(r, null);
	}
	async function f(e, n) {
		let r = e.target instanceof Element ? e.target : null;
		if (!r?.closest(".drag-handle")) try {
			n.type === "project" && r?.closest("[data-project-toggle]") ? await t.onToggle(n.id) : await t.onSelect(n.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var p = Yi(), m = I(p), h = R(I(m));
	Z(I(h), { name: "plus" }), O(h), O(m);
	var g = R(m, 2), _ = I(g), v = (e) => {
		var t = Hi();
		Z(I(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), k(2), O(t), G(e, t);
	}, y = (e) => {
		var n = Ui(), r = I(n);
		Z(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = R(r, 2), a = I(i, !0);
		O(i), O(n), z(() => K(a, t.error)), G(e, n);
	}, b = (e) => {
		var t = Wi();
		Z(I(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), k(2), O(t), G(e, t);
	}, x = (e) => {
		var r = Or();
		J(L(r), 17, () => t.projects, (e) => e.id, (e, t) => {
			var r = Ji(), i = L(r), s = I(i), p = I(s), m = (e) => {
				{
					let n = /* @__PURE__ */ M(() => H(t).expanded ? "chevron-down" : "chevron-right");
					Z(e, { get name() {
						return H(n);
					} });
				}
			};
			q(p, (e) => {
				H(t).children.length && e(m);
			}), O(s);
			var h = R(s, 2);
			Ai(h, { get status() {
				return H(t).status;
			} });
			var g = R(h, 2);
			Z(g, {
				name: "folder",
				className: "tree-icon"
			});
			var _ = R(g, 2), v = I(_), y = I(v, !0);
			O(v);
			var b = R(v), x = I(b, !0);
			O(b);
			var S = R(b), C = (e) => {
				var n = Gi(), r = I(n), i = I(r, !0);
				O(r);
				var a = R(r, 2), o = I(a, !0);
				O(a), O(n), z(() => {
					K(i, H(t).summary.taskLabel), K(o, H(t).summary.runningLabel);
				}), G(e, n);
			};
			q(S, (e) => {
				H(t).summary && !H(t).expanded && e(C);
			}), O(_);
			var w = R(_, 2);
			Z(I(w), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), O(w), O(i);
			var T = R(i, 2), ee = (e) => {
				var r = qi();
				J(r, 21, () => H(t).children, (e) => e.id, (e, r) => {
					var i = Ki(), s = R(I(i), 2);
					Ai(s, { get status() {
						return H(r).status;
					} });
					var p = R(s, 2);
					Z(p, {
						name: "file-text",
						className: "tree-icon"
					});
					var m = R(p), h = I(m), g = I(h, !0);
					O(h);
					var _ = R(h), v = I(_, !0);
					O(_), O(m);
					var y = R(m, 2);
					Z(I(y), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), O(y), O(i), z((e) => {
						Y(i, 1, e), X(i, "aria-label", H(r).ariaLabel || void 0), X(i, "title", H(r).statusLabel || void 0), K(g, H(r).title), K(v, H(r).ref);
					}, [() => `tree-item task-item ${a(H(r).status)} ${H(r).active ? "active" : ""} ${H(n)?.id === H(r).id ? "drag-source" : ""} ${o(H(r).id)}`]), U("click", i, (e) => f(e, H(r))), yr("dragover", i, (e) => l(e, {
						kind: "task",
						id: H(r).id,
						projectId: H(t).id
					})), yr("drop", i, (e) => u(e, {
						kind: "task",
						id: H(r).id,
						projectId: H(t).id
					})), yr("dragstart", y, (e) => c(e, {
						kind: "task",
						id: H(r).id,
						projectId: H(t).id
					})), yr("dragend", y, d), G(e, i);
				}), O(r), G(e, r);
			};
			q(T, (e) => {
				H(t).expanded && e(ee);
			}), z((e) => {
				Y(i, 1, e), X(i, "aria-label", H(t).ariaLabel || void 0), X(i, "title", H(t).statusLabel || void 0), X(s, "data-project-toggle", H(t).children.length ? H(t).id : void 0), K(y, H(t).title), K(x, H(t).ref);
			}, [() => `tree-item ${a(H(t).status)} ${H(t).active ? "active" : ""} ${H(n)?.id === H(t).id ? "drag-source" : ""} ${o(H(t).id)}`]), U("click", i, (e) => f(e, H(t))), yr("dragover", i, (e) => l(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), yr("drop", i, (e) => u(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), yr("dragstart", w, (e) => c(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), yr("dragend", w, d), G(e, r);
		}), G(e, r);
	};
	q(_, (e) => {
		t.loading ? e(v) : t.error ? e(y, 1) : t.projects.length === 0 ? e(b, 2) : e(x, -1);
	}), O(g), O(p), z(() => X(g, "data-navigation-identity", t.identity)), U("click", h, function(...e) {
		t.onCreate?.apply(this, e);
	}), G(e, p), j();
}
br(["click"]);
//#endregion
//#region src/components/WorkspaceSwitcher.svelte
var Zi = /* @__PURE__ */ W("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), Qi = /* @__PURE__ */ W("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), $i = /* @__PURE__ */ W("<section class=\"workspace-switcher\" data-component-owner=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" class=\"workspace-switcher-button\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <!></button> <!></div></section>");
function ea(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(!1), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P($t(t.identity)), a = /* @__PURE__ */ M(() => t.workspaces.find((e) => e.id === t.activeWorkspaceId) ?? null);
	bn(() => {
		t.identity !== H(i) && (F(i, t.identity, !0), F(n, !1), F(r, ""));
	}), Ti(() => {
		let e = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			H(n) && !t?.closest(".workspace-select-row") && F(n, !1);
		}, r = (e) => {
			e.key === "Escape" && !t.mobileSidebarOpen && F(n, !1);
		};
		return document.addEventListener("mousedown", e), document.addEventListener("keydown", r), () => {
			document.removeEventListener("mousedown", e), document.removeEventListener("keydown", r);
		};
	});
	async function o(e) {
		if (!(!e || H(r))) {
			F(r, e, !0), F(n, !1);
			try {
				await t.onSwitch(e);
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				F(r, "");
			}
		}
	}
	var s = $i(), c = I(s), l = I(c), u = I(l), d = I(u);
	O(u);
	var f = R(u, 2), p = I(f, !0);
	O(f);
	var m = R(f, 2);
	{
		let e = /* @__PURE__ */ M(() => H(r) ? "loader-circle" : "chevrons-up-down");
		Z(m, {
			get name() {
				return H(e);
			},
			className: "select-icon"
		});
	}
	O(l);
	var h = R(l, 2), g = (e) => {
		var i = Qi(), a = R(I(i), 2);
		J(a, 17, () => t.workspaces, (e) => e.id, (e, n) => {
			var i = Zi(), a = I(i), s = I(a);
			O(a);
			var c = R(a, 2), l = I(c), u = I(l, !0);
			O(l);
			var d = R(l), f = I(d, !0);
			O(d), O(c);
			var p = R(c, 2), m = (e) => {
				Z(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			q(p, (e) => {
				H(n).id === t.activeWorkspaceId && e(m);
			}), O(i), z((e) => {
				X(i, "aria-selected", H(n).id === t.activeWorkspaceId), X(i, "data-workspace-id", H(n).id), i.disabled = e, X(s, "src", H(n).iconSrc), K(u, H(n).name || H(n).id), K(f, H(n).path);
			}, [() => !!H(r)]), U("click", i, () => o(H(n).id)), G(e, i);
		});
		var s = R(a, 2), c = I(s);
		Z(I(c), { name: "plus" }), k(), O(c), O(s), O(i), U("click", c, () => {
			F(n, !1), t.onAdd();
		}), G(e, i);
	};
	q(h, (e) => {
		H(n) && e(g);
	}), O(c), O(s), z(() => {
		X(l, "aria-expanded", H(n)), X(d, "src", H(a)?.iconSrc || "/favicon.svg"), K(p, H(a)?.name || "Workspace");
	}), U("click", l, (e) => {
		e.stopPropagation(), F(n, !H(n));
	}), G(e, s), j();
}
br(["click"]);
//#endregion
//#region src/components/AppShell.svelte
var ta = /* @__PURE__ */ W("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><!><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"workspace-toolbar-actions\"><!></div></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <div class=\"workspace-view-actions\"><!></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div id=\"agentControls\" class=\"agent-actions\"></div><div id=\"agentSessionsWrap\" class=\"agent-sessions\" data-component-owner=\"session-switcher\"><!></div><div class=\"tty-panel\"><div id=\"ttyLog\" class=\"tty-log\" data-component-owner=\"event-timeline\"><!></div><div id=\"ttyComposer\" class=\"tty-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div>");
function na(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(0);
	Ti(() => {
		let e = t.channel.subscribe((e) => {
			F(n, e, !0), queueMicrotask(e.onIconsChanged);
		}), r = (e) => {
			e.key === "Escape" && H(n).mobile.sidebarOpen && H(n).onMobileSidebar(!1);
		}, i = () => {
			H(n).onHistoryNavigation(window.location.pathname).catch((e) => {
				H(n).onToast(e instanceof Error ? e.message : String(e));
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
			H(n).onPaneViewport(), c();
		};
		return document.addEventListener("keydown", r), document.addEventListener("focusout", f), window.addEventListener("resize", p), window.addEventListener("orientationchange", f), window.addEventListener("popstate", i), a?.addEventListener("resize", c), a?.addEventListener("scroll", c), s.addEventListener?.("change", p), c(), () => {
			e(), document.removeEventListener("keydown", r), document.removeEventListener("focusout", f), window.removeEventListener("resize", p), window.removeEventListener("orientationchange", f), window.removeEventListener("popstate", i), a?.removeEventListener("resize", c), a?.removeEventListener("scroll", c), s.removeEventListener?.("change", p), u(), document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
		};
	}), bn(() => {
		document.body.classList.toggle("mobile-sidebar-open", H(n).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", H(n).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", H(n).mobile.immersive);
	}), bn(() => {
		let e = H(n).route;
		!e.path || e.revision <= H(r) || (F(r, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	var i = ta(), a = I(i);
	zi(a, {
		get sidebarOpen() {
			return H(n).mobile.sidebarOpen;
		},
		get view() {
			return H(n).mobile.view;
		},
		get immersive() {
			return H(n).mobile.immersive;
		},
		get onSidebar() {
			return H(n).onMobileSidebar;
		},
		get onView() {
			return H(n).onMobileView;
		},
		get onImmersive() {
			return H(n).onMobileImmersive;
		}
	});
	var o = R(a, 2), s = I(o), c = R(I(s)), l = R(I(c)), u = I(l, !0);
	O(l), O(c);
	var d = R(c);
	Li(d, {
		get preference() {
			return H(n).layout.preference;
		},
		tone: "dark",
		get onCycle() {
			return H(n).onLayoutCycle;
		}
	});
	var f = R(d);
	Z(I(f), { name: "settings" }), O(f), O(s);
	var p = R(s, 2);
	ea(p, {
		get identity() {
			return H(n).identity;
		},
		get mobileSidebarOpen() {
			return H(n).mobile.sidebarOpen;
		},
		get activeWorkspaceId() {
			return H(n).activeWorkspaceId;
		},
		get workspaces() {
			return H(n).workspaces;
		},
		get onSwitch() {
			return H(n).onSwitchWorkspace;
		},
		get onAdd() {
			return H(n).onAddWorkspace;
		},
		get onToast() {
			return H(n).onToast;
		}
	});
	var m = R(p, 2);
	Xi(m, {
		get identity() {
			return H(n).identity;
		},
		get loading() {
			return H(n).loading;
		},
		get error() {
			return H(n).error;
		},
		get projects() {
			return H(n).projects;
		},
		get onCreate() {
			return H(n).onCreateProject;
		},
		get onToggle() {
			return H(n).onToggleProject;
		},
		get onSelect() {
			return H(n).onSelectResource;
		},
		get onReorder() {
			return H(n).onReorder;
		},
		get onDragState() {
			return H(n).onDragState;
		},
		get onToast() {
			return H(n).onToast;
		}
	});
	var h = R(m, 2);
	Vi(h, {
		id: "sessionResize",
		kind: "sidebarSessionHeight",
		className: "horizontal-resize sidebar-session-resize",
		label: "Resize sessions panel",
		get onPreview() {
			return H(n).onPanePreview;
		},
		get onCommit() {
			return H(n).onPaneCommit;
		}
	}), Fi(R(h, 2), {
		get identity() {
			return H(n).identity;
		},
		get sessions() {
			return H(n).sessions;
		},
		get onSelect() {
			return H(n).onSelectResource;
		},
		get onReorder() {
			return H(n).onReorder;
		},
		get onDragState() {
			return H(n).onDragState;
		},
		get onToast() {
			return H(n).onToast;
		}
	}), O(o);
	var g = R(o, 2);
	Vi(g, {
		id: "sidebarResize",
		kind: "sidebarWidth",
		className: "sidebar-resize",
		label: "Resize sidebar",
		get onPreview() {
			return H(n).onPanePreview;
		},
		get onCommit() {
			return H(n).onPaneCommit;
		}
	});
	var _ = R(g, 2), v = I(_), y = I(v);
	Z(I(y), { name: "menu" }), O(y);
	var b = R(y, 2);
	Li(I(b), {
		get preference() {
			return H(n).layout.preference;
		},
		get onCycle() {
			return H(n).onLayoutCycle;
		}
	}), O(b), O(v);
	var x = R(v, 2), S = I(x), C = I(S), w = R(C, 2);
	O(S);
	var T = R(S, 2);
	Li(I(T), {
		get preference() {
			return H(n).layout.preference;
		},
		get onCycle() {
			return H(n).onLayoutCycle;
		}
	}), O(T), O(x);
	var ee = R(x, 2), te = I(ee), ne = (e) => {
		var n = Or();
		qr(L(n), () => t.details), G(e, n);
	};
	q(te, (e) => {
		t.details && e(ne);
	}), O(ee);
	var re = R(ee, 2);
	Vi(re, {
		id: "detailsResize",
		kind: "chatWidth",
		className: "details-resize",
		label: "Resize chat panel",
		get onPreview() {
			return H(n).onPanePreview;
		},
		get onCommit() {
			return H(n).onPaneCommit;
		}
	});
	var ie = R(re, 2), ae = R(I(ie)), oe = I(ae), se = (e) => {
		var n = Or();
		qr(L(n), () => t.sessions), G(e, n);
	};
	q(oe, (e) => {
		t.sessions && e(se);
	}), O(ae);
	var ce = R(ae), le = I(ce), ue = I(le), de = (e) => {
		var n = Or();
		qr(L(n), () => t.timeline), G(e, n);
	};
	q(ue, (e) => {
		t.timeline && e(de);
	}), O(le);
	var fe = R(le), pe = I(fe), me = (e) => {
		var n = Or();
		qr(L(n), () => t.composer), G(e, n);
	};
	q(pe, (e) => {
		t.composer && e(me);
	}), O(fe), O(ce), O(ie), O(_), O(i), z(() => {
		K(u, H(n).version), X(y, "aria-expanded", H(n).mobile.sidebarOpen), X(C, "aria-selected", H(n).mobile.view === "details"), X(w, "aria-selected", H(n).mobile.view === "chat");
	}), U("click", f, () => {
		H(n).onMobileSidebar(!1), H(n).onOpenSettings();
	}), U("click", y, () => H(n).onMobileSidebar(!0)), U("click", C, () => H(n).onMobileView("details")), U("click", w, () => H(n).onMobileView("chat")), G(e, i), j();
}
br(["click"]);
//#endregion
//#region src/components/ChatComposer.svelte
var ra = /* @__PURE__ */ W("<button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button>"), ia = /* @__PURE__ */ W("<button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn; keep the Session open.\" aria-label=\"End current turn; keep the Session open.\"><!></button>"), aa = /* @__PURE__ */ W("<span class=\"tty-composer-divider\" aria-hidden=\"true\"></span> <span class=\"tty-composer-group\"><!> <button type=\"button\" id=\"agentCloseSessionButton\" class=\"tty-composer-action tty-close-session-button\" title=\"Close session; end the entire AgentHub Session.\" aria-label=\"Close session; end the entire AgentHub Session.\"><!></button></span>", 1), oa = /* @__PURE__ */ W("<button type=\"button\" id=\"agentActionsToggle\" class=\"tty-actions-toggle\" title=\"Session actions\" aria-label=\"Session actions\"><!></button>"), sa = /* @__PURE__ */ W("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), ca = /* @__PURE__ */ W("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), la = /* @__PURE__ */ W("<div id=\"ttyAgentMenu\" class=\"tty-agent-menu\" role=\"menu\" aria-label=\"Choose an Agent\"></div>"), ua = /* @__PURE__ */ W("<div class=\"tty-session-actions collapsible open\"><div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div></div>"), da = /* @__PURE__ */ W("<button type=\"button\" id=\"agentResumeButton\" class=\"tty-primary-action\" title=\"Resume Session\" aria-label=\"Resume Session\"><!><span>Resume Session</span></button>"), fa = /* @__PURE__ */ W("<div class=\"tty-session-actions tty-standalone-actions open\" role=\"toolbar\" aria-label=\"Session actions\"><!> <div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div></div>"), pa = /* @__PURE__ */ W("<form id=\"ttyForm\" class=\"tty-input\"><span>&gt;</span> <textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <span class=\"tty-composer-group\"><!> <button type=\"submit\" class=\"tty-send-button\"><!></button></span> <!> <!></form> <!> <!> <!>", 1);
function ma(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(-1), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(!1), s = /* @__PURE__ */ P(""), c = /* @__PURE__ */ P(!1), l = /* @__PURE__ */ P(void 0), u = /* @__PURE__ */ M(() => !!H(n).unavailableReason || H(o) || H(n).sending), d = /* @__PURE__ */ M(() => H(n).sessionStarting ? "Creating a new AgentHub session..." : H(n).agents.length ? "Choose an Agent to start a new session." : "No enabled agents are available. Configure an AgentHub Agent in Settings.");
	Ti(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity === H(r) ? e.draftResetVersion !== H(i) && (F(i, e.draftResetVersion, !0), F(a, e.draft, !0), F(s, "")) : (F(r, e.identity, !0), F(i, e.draftResetVersion, !0), F(a, e.draft, !0), F(o, !1), F(s, ""), F(c, !1)), queueMicrotask(e.onIconsChanged);
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
		F(a, e, !0), F(s, ""), H(n).onDraft(e, f());
	}
	async function m(e) {
		e?.preventDefault();
		let t = H(a);
		if (H(u) || !t.trim() || !H(n).workspaceId || !H(n).resourceId) return;
		let i = H(r), c = f();
		F(o, !0), F(s, "");
		try {
			let e = await H(n).onSend(t, c);
			H(r) === i && e.accepted && e.clear && H(a) === t && p("");
		} catch (e) {
			H(r) === i && F(s, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(r) === i && (F(o, !1), await lr(), H(l)?.focus({ preventScroll: !0 }));
		}
	}
	function h(e) {
		if (!(e.key !== "Enter" || e.isComposing || e.keyCode === 229)) {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault(), m();
				return;
			}
			if (e.shiftKey) {
				F(c, !0);
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
	var _ = pa(), v = L(_), y = R(I(v), 2);
	it(y), Ci(y, (e) => F(l, e), () => H(l));
	var b = R(y, 2), x = I(b), S = (e) => {
		var t = ra();
		Z(I(t), { name: "plus" }), O(t), U("click", t, function(...e) {
			H(n).onOpenUpload?.apply(this, e);
		}), G(e, t);
	};
	q(x, (e) => {
		H(n).live && e(S);
	});
	var C = R(x, 2), w = I(C);
	{
		let e = /* @__PURE__ */ M(() => H(o) ? "loader-circle" : "send");
		Z(w, { get name() {
			return H(e);
		} });
	}
	O(C), O(b);
	var T = R(b, 2), ee = (e) => {
		var t = aa(), r = R(L(t), 2), i = I(r), a = (e) => {
			var t = ia(), r = I(t);
			{
				let e = /* @__PURE__ */ M(() => H(n).endingTurn ? "loader-circle" : "pause");
				Z(r, { get name() {
					return H(e);
				} });
			}
			O(t), z(() => t.disabled = H(n).endingTurn || H(n).closingSession), U("click", t, function(...e) {
				H(n).onEndTurn?.apply(this, e);
			}), G(e, t);
		};
		q(i, (e) => {
			H(n).canEndTurn && e(a);
		});
		var o = R(i, 2), s = I(o);
		{
			let e = /* @__PURE__ */ M(() => H(n).closingSession ? "loader-circle" : "square");
			Z(s, { get name() {
				return H(e);
			} });
		}
		O(o), O(r), z(() => o.disabled = H(n).endingTurn || H(n).closingSession), U("click", o, function(...e) {
			H(n).onCloseSession?.apply(this, e);
		}), G(e, t);
	};
	q(T, (e) => {
		(H(n).canEndTurn || H(n).runId) && e(ee);
	});
	var te = R(T, 2), ne = (e) => {
		var t = oa();
		Z(I(t), { name: "ellipsis" }), O(t), z(() => X(t, "aria-expanded", H(n).actionsOpen)), U("click", t, function(...e) {
			H(n).onToggleActions?.apply(this, e);
		}), G(e, t);
	};
	q(te, (e) => {
		H(n).live && e(ne);
	}), O(v);
	var re = R(v, 2), ie = (e) => {
		var t = sa(), n = I(t), r = I(n, !0);
		O(n);
		var i = R(n);
		O(t), z(() => {
			K(r, H(s)), i.disabled = H(o);
		}), U("click", i, () => m()), G(e, t);
	};
	q(re, (e) => {
		H(s) && e(ie);
	});
	var ae = R(re, 2), oe = (e) => {
		var t = ua(), r = I(t), i = I(r), a = I(i);
		{
			let e = /* @__PURE__ */ M(() => H(n).sessionStarting ? "loader-circle" : "plus");
			Z(a, { get name() {
				return H(e);
			} });
		}
		var o = R(a), s = I(o, !0);
		O(o), O(i);
		var c = R(i, 2), l = (e) => {
			var t = la();
			J(t, 21, () => H(n).agents, (e) => e.id, (e, t) => {
				var r = ca();
				let i;
				var a = I(r), o = I(a, !0);
				O(a);
				var s = R(a), c = I(s, !0);
				O(s), O(r), z(() => {
					X(r, "data-agent-choice", H(t).id), i = Y(r, 1, "", null, i, { active: H(t).id === H(n).selectedAgentId }), K(o, H(t).label), K(c, H(t).summary);
				}), U("click", r, () => H(n).onChooseAgent(H(t).id)), G(e, r);
			}), O(t), G(e, t);
		};
		q(c, (e) => {
			H(n).chooserOpen && e(l);
		}), O(r), O(t), z(() => {
			X(i, "title", H(d)), X(i, "aria-label", H(d)), i.disabled = H(n).sessionStarting || !H(n).agents.length, X(i, "aria-expanded", H(n).chooserOpen), K(s, H(n).sessionStarting ? "Creating Session..." : "New Session");
		}), U("click", i, function(...e) {
			H(n).onToggleChooser?.apply(this, e);
		}), G(e, t);
	};
	q(ae, (e) => {
		H(n).live && H(n).actionsOpen && e(oe);
	});
	var se = R(ae, 2), ce = (e) => {
		var t = fa(), r = I(t), i = (e) => {
			var t = da();
			Z(I(t), { name: "rotate-ccw" }), k(), O(t), U("click", t, function(...e) {
				H(n).onResume?.apply(this, e);
			}), G(e, t);
		};
		q(r, (e) => {
			H(n).canResume && e(i);
		});
		var a = R(r, 2), o = I(a), s = I(o);
		{
			let e = /* @__PURE__ */ M(() => H(n).sessionStarting ? "loader-circle" : "plus");
			Z(s, { get name() {
				return H(e);
			} });
		}
		var c = R(s), l = I(c, !0);
		O(c), O(o);
		var u = R(o, 2), f = (e) => {
			var t = la();
			J(t, 21, () => H(n).agents, (e) => e.id, (e, t) => {
				var r = ca();
				let i;
				var a = I(r), o = I(a, !0);
				O(a);
				var s = R(a), c = I(s, !0);
				O(s), O(r), z(() => {
					X(r, "data-agent-choice", H(t).id), i = Y(r, 1, "", null, i, { active: H(t).id === H(n).selectedAgentId }), K(o, H(t).label), K(c, H(t).summary);
				}), U("click", r, () => H(n).onChooseAgent(H(t).id)), G(e, r);
			}), O(t), G(e, t);
		};
		q(u, (e) => {
			H(n).chooserOpen && e(f);
		}), O(a), O(t), z(() => {
			X(o, "title", H(d)), X(o, "aria-label", H(d)), o.disabled = H(n).sessionStarting || !H(n).agents.length, X(o, "aria-expanded", H(n).chooserOpen), K(l, H(n).sessionStarting ? "Creating Session..." : "New Session");
		}), U("click", o, function(...e) {
			H(n).onToggleChooser?.apply(this, e);
		}), G(e, t);
	};
	q(se, (e) => {
		!H(n).live && (H(n).canResume || H(n).agents.length) && e(ce);
	}), z(() => {
		X(y, "data-agent-draft-key", H(n).draftKey), X(y, "placeholder", H(n).unavailableReason || (H(n).live ? "Send input to the selected agent session" : "Message this resource")), y.disabled = H(u), pi(y, H(a)), X(C, "title", H(o) ? "Sending..." : H(n).unavailableReason || "Send input"), X(C, "aria-label", H(o) ? "Sending..." : H(n).unavailableReason || "Send input"), C.disabled = H(u);
	}), yr("submit", v, m), U("input", y, (e) => p(e.currentTarget.value)), U("keydown", y, h), G(e, _), j();
}
br([
	"input",
	"keydown",
	"click"
]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var ha = /* @__PURE__ */ W("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function ga(e, t) {
	A(t, !0);
	let n = wi(t, "draft", 7);
	var r = ha(), i = I(r);
	it(i);
	var a = R(i, 2);
	fi(a), O(r), z(() => {
		pi(i, n().description), pi(a, n().slug);
	}), U("input", i, (e) => n().description = e.currentTarget.value), U("input", a, (e) => n().slug = e.currentTarget.value), G(e, r), j();
}
br(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var _a = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\"> </button>"), va = /* @__PURE__ */ W("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), ya = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Updating preview...</p>"), ba = /* @__PURE__ */ W("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), xa = /* @__PURE__ */ W("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Sa = /* @__PURE__ */ W("<small> </small>"), Ca = /* @__PURE__ */ W("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), wa = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), Ta = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Ea = /* @__PURE__ */ W("<!> <!> <!>", 1), Da = /* @__PURE__ */ W("<p class=\"create-task-blank-detail\"> </p>"), Oa = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), ka = /* @__PURE__ */ W("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), Aa = /* @__PURE__ */ W("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function ja(e, t) {
	A(t, !0);
	let n = wi(t, "draft", 7), r = /* @__PURE__ */ P($t(n().editedMarkdown ?? "")), i = null, a = /* @__PURE__ */ M(() => !!t.preview && H(r) !== t.preview?.markdown);
	bn(() => {
		let e = t.preview?.markdown ?? null;
		if (e === i) return;
		let a = n().editedMarkdown == null || n().editedMarkdown === i;
		i = e, a && (F(r, e ?? "", !0), n().editedMarkdown = e);
	});
	function o(e) {
		F(r, e, !0), n().editedMarkdown = e;
	}
	function s() {
		F(r, t.preview?.markdown ?? "", !0), n().editedMarkdown = t.preview?.markdown ?? null;
	}
	var c = Aa(), l = I(c), u = R(I(l), 2), d = (e) => {
		var n = _a(), r = I(n, !0);
		O(n), z(() => {
			n.disabled = t.previewing || t.submitting, K(r, t.previewing ? "Rendering..." : "Refresh");
		}), U("click", n, function(...e) {
			t.onRefresh?.apply(this, e);
		}), G(e, n);
	};
	q(u, (e) => {
		t.selectedTemplate && e(d);
	}), O(l);
	var f = R(l, 2), p = (e) => {
		var i = Ea(), c = L(i), l = (e) => {
			var n = va(), r = I(n, !0);
			O(n), z(() => K(r, t.previewError)), G(e, n);
		};
		q(c, (e) => {
			t.previewError && e(l);
		});
		var u = R(c, 2), d = (e) => {
			G(e, ya());
		};
		q(u, (e) => {
			!t.previewError && t.stale && t.preview && e(d);
		});
		var f = R(u, 2), p = (e) => {
			var i = Ca(), c = I(i), l = I(c, !0);
			O(c);
			var u = R(c, 2);
			it(u);
			var d = R(u, 2), f = (e) => {
				var t = ba(), n = R(I(t), 2);
				O(t), U("click", n, s), G(e, t);
			}, p = (e) => {
				G(e, xa());
			};
			q(d, (e) => {
				H(a) ? e(f) : e(p, -1);
			});
			var m = R(d, 2), h = (e) => {
				var n = Sa(), r = I(n);
				O(n), z(() => K(r, `Slug: ${t.preview.slug ?? ""}`)), G(e, n);
			};
			q(m, (e) => {
				t.preview.slug && e(h);
			});
			var g = R(m, 2), _ = (e) => {
				var r = Sa(), i = I(r);
				O(r), z(() => K(i, `Template ${n().templateName ?? ""} · ${t.templateDigest ?? ""}`)), G(e, r);
			};
			q(g, (e) => {
				t.templateDigest && e(_);
			}), O(i), z(() => {
				K(l, t.preview.title), pi(u, H(r));
			}), U("input", u, (e) => o(e.currentTarget.value)), G(e, i);
		}, m = (e) => {
			G(e, wa());
		}, h = (e) => {
			G(e, Ta());
		};
		q(f, (e) => {
			t.preview ? e(p) : t.previewing ? e(m, 1) : t.previewError || e(h, 2);
		}), G(e, i);
	}, m = (e) => {
		var t = ka(), r = I(t), i = I(r, !0);
		O(r);
		var a = R(r, 2), o = (e) => {
			var t = Da(), r = I(t, !0);
			O(t), z(() => K(r, n().detail)), G(e, t);
		}, s = /* @__PURE__ */ M(() => n().detail.trim()), c = (e) => {
			G(e, Oa());
		};
		q(a, (e) => {
			H(s) ? e(o) : e(c, -1);
		});
		var l = R(a, 2), u = (e) => {
			var t = Sa(), r = I(t);
			O(t), z((e) => K(r, `Slug: ${e ?? ""}`), [() => n().slug.trim()]), G(e, t);
		}, d = /* @__PURE__ */ M(() => n().slug.trim());
		q(l, (e) => {
			H(d) && e(u);
		}), O(t), z((e) => K(i, e), [() => n().title.trim() || "Untitled task"]), G(e, t);
	};
	q(f, (e) => {
		t.selectedTemplate ? e(p) : e(m, -1);
	}), O(c), G(e, c), j();
}
br(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var Ma = /* @__PURE__ */ W("<input type=\"checkbox\"/><span> </span>", 1), Na = /* @__PURE__ */ W("<span> </span>"), Pa = /* @__PURE__ */ W("<textarea></textarea>"), Fa = /* @__PURE__ */ W("<option> </option>"), Ia = /* @__PURE__ */ W("<select><option>Select...</option><!></select>"), La = /* @__PURE__ */ W("<input/>"), Ra = /* @__PURE__ */ W("<small> </small>"), za = /* @__PURE__ */ W("<label><!> <!> <!> <!> <!></label>"), Ba = /* @__PURE__ */ W("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function Va(e, t) {
	A(t, !0);
	function n(e, n) {
		let r = n.currentTarget;
		t.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var r = Ba();
	J(r, 21, () => t.fields, (e) => e.name, (e, r) => {
		var i = za();
		let a;
		var o = I(i), s = (e) => {
			var i = Ma(), a = L(i);
			fi(a);
			var o = R(a), s = I(o);
			O(o), z(() => {
				mi(a, t.values[H(r).name] === !0), K(s, `${H(r).label ?? ""}${H(r).required ? " *" : ""}`);
			}), U("change", a, (e) => n(H(r), e)), G(e, i);
		}, c = (e) => {
			var t = Na(), n = I(t);
			O(t), z(() => K(n, `${H(r).label ?? ""}${H(r).required ? " *" : ""}`)), G(e, t);
		};
		q(o, (e) => {
			H(r).type === "boolean" ? e(s) : e(c, -1);
		});
		var l = R(o, 2), u = (e) => {
			var i = Pa();
			it(i), z((e) => {
				i.required = H(r).required, X(i, "placeholder", H(r).placeholder || ""), pi(i, e);
			}, [() => String(t.values[H(r).name] ?? "")]), U("input", i, (e) => n(H(r), e)), G(e, i);
		};
		q(l, (e) => {
			H(r).type === "textarea" && e(u);
		});
		var d = R(l, 2), f = (e) => {
			var i = Ia(), a = I(i);
			a.value = a.__value = "", J(R(a), 17, () => H(r).options || [], Lr, (e, t) => {
				var n = Fa(), r = I(n, !0);
				O(n);
				var i = {};
				z(() => {
					K(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
				}), G(e, n);
			}), O(i);
			var o;
			ai(i), z((e) => {
				i.required = H(r).required, o !== (o = e) && (i.value = (i.__value = e) ?? "", ii(i, e));
			}, [() => String(t.values[H(r).name] ?? "")]), U("change", i, (e) => n(H(r), e)), G(e, i);
		};
		q(d, (e) => {
			H(r).type === "select" && e(f);
		});
		var p = R(d, 2), m = (e) => {
			var i = La();
			fi(i), z((e) => {
				i.required = H(r).required, X(i, "placeholder", H(r).placeholder || ""), pi(i, e);
			}, [() => String(t.values[H(r).name] ?? "")]), U("input", i, (e) => n(H(r), e)), G(e, i);
		};
		q(p, (e) => {
			H(r).type === "text" && e(m);
		});
		var h = R(p, 2), g = (e) => {
			var t = Ra(), n = I(t, !0);
			O(t), z(() => K(n, H(r).description)), G(e, t);
		};
		q(h, (e) => {
			H(r).description && e(g);
		}), O(i), z(() => a = Y(i, 1, "", null, a, { "template-boolean": H(r).type === "boolean" })), G(e, i);
	}), O(r), z(() => X(r, "aria-label", t.label)), G(e, r), j();
}
br(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var Ha = /* @__PURE__ */ W("<small> </small>"), Ua = /* @__PURE__ */ W("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), Wa = /* @__PURE__ */ W("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function Ga(e, t) {
	A(t, !0);
	function n(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var r = Wa(), i = R(I(r), 2), a = I(i);
	let o;
	var s = R(I(a), 4);
	Z(I(s), { name: "check" }), O(s), O(a), J(R(a, 2), 17, () => t.templates, (e) => e.name, (e, r) => {
		var i = Ua();
		let a;
		var o = I(i), s = I(o, !0);
		O(o);
		var c = R(o, 2), l = (e) => {
			var t = Ha(), n = I(t, !0);
			O(t), z(() => K(n, H(r).description)), G(e, t);
		};
		q(c, (e) => {
			H(r).description && e(l);
		});
		var u = R(c, 2);
		Z(I(u), { name: "check" }), O(u), O(i), z((e) => {
			X(i, "aria-selected", t.selectedName === H(r).name), a = Y(i, 1, "template-card", null, a, { selected: t.selectedName === H(r).name }), i.disabled = !H(r).valid || t.disabled, K(s, e);
		}, [() => n(H(r))]), U("click", i, () => t.onSelect(H(r).name)), G(e, i);
	}), O(i), O(r), z(() => {
		X(a, "aria-selected", t.selectedName === ""), o = Y(a, 1, "template-card", null, o, { selected: t.selectedName === "" }), a.disabled = t.disabled;
	}), U("click", a, () => t.onSelect("")), G(e, r), j();
}
br(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var Ka = /* @__PURE__ */ W("<small>(generated by template)</small>"), qa = /* @__PURE__ */ W("<small class=\"create-required\">*</small>"), Ja = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), Ya = /* @__PURE__ */ W("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), Xa = /* @__PURE__ */ W("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), Za = /* @__PURE__ */ W("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function Qa(e, t) {
	A(t, !0);
	let n = wi(t, "draft", 7), r, i = /* @__PURE__ */ M(() => t.model.templates.find((e) => e.name === n().templateName)), a = /* @__PURE__ */ M(() => t.model.preview?.title || ""), o = /* @__PURE__ */ M(() => n().titleOverride ? n().title : H(a)), s = /* @__PURE__ */ M(() => (H(i)?.fields || []).filter((e) => e.required)), c = /* @__PURE__ */ M(() => (H(i)?.fields || []).filter((e) => !e.required)), l = /* @__PURE__ */ M(() => !t.model.preview || t.model.previewKey !== t.model.previewRequestKey(n()));
	Ei(() => {
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
	var v = Za(), y = I(v), b = I(y), x = (e) => {
		Ga(e, {
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
	var S = R(b, 2), C = R(I(S), 2), w = I(C), T = I(w), ee = R(I(T)), te = (e) => {
		G(e, Ka());
	}, ne = (e) => {
		G(e, qa());
	};
	q(ee, (e) => {
		H(i)?.taskTitle && !n().titleOverride ? e(te) : e(ne, -1);
	}), O(T);
	var re = R(T, 2), ie = I(re);
	fi(ie);
	var ae = R(ie, 2), oe = (e) => {
		var t = Ja();
		U("click", t, g), G(e, t);
	};
	q(ae, (e) => {
		H(i)?.taskTitle && n().titleOverride && e(oe);
	}), O(re), O(w);
	var se = R(w, 2), ce = R(I(se), 2), le = R(I(ce), 2);
	fi(le), O(ce), O(se), O(C), O(S);
	var ue = R(S, 2), de = (e) => {
		var t = Ya(), r = R(I(t), 2), i = (e) => {
			Va(e, {
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
			Va(e, {
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
		}), O(t), G(e, t);
	}, fe = (e) => {
		var t = Xa(), r = R(I(t), 2);
		it(r), O(t), z(() => pi(r, n().detail)), U("input", r, (e) => n().detail = e.currentTarget.value), G(e, t);
	};
	q(ue, (e) => {
		H(i) ? e(de) : e(fe, -1);
	}), O(y), ja(R(y, 2), {
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
	}), O(v), z(() => {
		ie.required = !H(i)?.taskTitle, pi(ie, H(i)?.taskTitle ? H(o) : n().title), X(ie, "placeholder", H(i)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), pi(le, n().slug);
	}), U("input", ie, (e) => h(e.currentTarget.value)), U("input", le, (e) => {
		n().slug = e.currentTarget.value, f();
	}), G(e, v), j();
}
br(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var $a = /* @__PURE__ */ W("<span> </span>"), eo = /* @__PURE__ */ W("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function to(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P($t(s(H(n).draft))), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(void 0), o = /* @__PURE__ */ M(() => H(r).type === "task");
	Ti(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity !== H(i) && (F(i, e.identity, !0), F(r, s(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), Ti(() => {
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
	var l = Or(), u = L(l), d = (e) => {
		var t = eo(), i = I(t), s = R(i, 2);
		let l;
		var u = I(s), d = I(u), f = I(d), p = I(f, !0);
		O(f);
		var m = R(f, 2), h = (e) => {
			var t = $a(), n = I(t, !0);
			O(t), z(() => K(n, H(r).projectId)), G(e, t);
		};
		q(m, (e) => {
			H(o) && e(h);
		}), O(d);
		var g = R(d, 2);
		Z(I(g), { name: "x" }), O(g), O(u);
		var _ = R(u, 2), v = I(_);
		Ir(v, () => H(n).identity, (e) => {
			var t = Or(), i = L(t), a = (e) => {
				Qa(e, {
					get draft() {
						return H(r);
					},
					get model() {
						return H(n);
					}
				});
			}, s = (e) => {
				ga(e, { get draft() {
					return H(r);
				} });
			};
			q(i, (e) => {
				H(o) ? e(a) : e(s, -1);
			}), G(e, t);
		});
		var y = R(v, 2), b = I(y), x = I(b, !0);
		O(b);
		var S = R(b, 2);
		O(y), O(_), O(s), Ci(s, (e) => F(a, e), () => H(a)), O(t), z(() => {
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
	}), G(e, l), j();
}
br(["click"]);
//#endregion
//#region src/api/client.ts
var no = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, ro = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, io = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new ro(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new ro(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new ro(e.scope));
		this.active.clear();
	}
}, ao = class {
	requests = new io();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: so(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: so(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof ro) ? new ro(n) : e;
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
			let n = oo(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new no(e.status, r, n);
		}
		return t;
	}
};
function oo(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function so(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new ao();
//#endregion
//#region src/components/DiffModal.svelte
var co = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), lo = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), uo = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), fo = /* @__PURE__ */ W("<div class=\"diff-viewer\"></div>"), po = /* @__PURE__ */ W("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function mo(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(void 0), o = /* @__PURE__ */ M(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	bn(() => {
		let e = t.repo, a = H(o);
		if (F(n, null), F(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		F(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (F(n, r, !0), await lr(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (F(i, n instanceof Error ? n.message : String(n), !0), t.onError(H(i)));
		}).finally(() => {
			t.repo === e && (F(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), bn(() => {
		H(n)?.diff, H(a), s();
	}), Ei(() => t.client.requests.abort(H(o)));
	function s() {
		!H(a) || !H(n)?.diff || !window.Diff2Html || (H(a).innerHTML = window.Diff2Html.html(H(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Or(), l = L(c), u = (e) => {
		var o = po(), s = I(o), c = R(s, 2), l = I(c), u = I(l), d = I(u), f = I(d, !0);
		O(d);
		var p = R(d), m = I(p);
		O(p), O(u);
		var h = R(u);
		Z(I(h), { name: "x" }), O(h), O(l);
		var g = R(l, 2), _ = (e) => {
			var n = co(), r = I(n);
			Z(r, { name: "loader-circle" });
			var i = R(r, 2), a = I(i, !0);
			O(i), O(n), z(() => K(a, t.repo.worktreePath || "")), G(e, n);
		}, v = (e) => {
			var t = lo(), n = I(t);
			Z(n, { name: "triangle-alert" });
			var r = R(n, 2), a = I(r, !0);
			O(r), O(t), z(() => K(a, H(i))), G(e, t);
		}, y = (e) => {
			var t = uo();
			Z(I(t), { name: "check-circle-2" }), k(2), O(t), G(e, t);
		}, b = /* @__PURE__ */ M(() => !H(n)?.hasChanges || !H(n).diff?.trim()), x = (e) => {
			var t = fo();
			Ci(t, (e) => F(a, e), () => H(a)), G(e, t);
		};
		q(g, (e) => {
			H(r) ? e(_) : H(i) ? e(v, 1) : H(b) ? e(y, 2) : e(x, -1);
		}), O(c), O(o), z(() => {
			K(f, H(n)?.branch || t.repo.branch || t.repo.name || "Diff"), K(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), U("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), U("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), G(e, o);
	};
	q(l, (e) => {
		t.repo && e(u);
	}), G(e, c), j();
}
br(["click"]);
//#endregion
//#region src/components/detail.ts
function ho(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function go(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${So(e)}</pre>`;
}
function _o(e) {
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
function vo(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function yo(e) {
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
function bo(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function xo(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...xo(a.children || [], t, n, r + 1));
	return i;
}
function So(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/FileBrowser.svelte
var Co = /* @__PURE__ */ W("<a class=\"artifact-download\"><!></a>"), wo = /* @__PURE__ */ W("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), To = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span> </span></div>"), Eo = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"file-browser\"><h3><!><span> </span></h3> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function Do(e, t) {
	A(t, !0);
	let n = wi(t, "entries", 19, () => []), r = wi(t, "emptyMessage", 3, "No files."), i = wi(t, "activePath", 3, ""), a = /* @__PURE__ */ M(() => xo(n(), t.expanded, t.title)), o = /* @__PURE__ */ M(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var c = Eo(), l = I(c), u = I(l);
	Z(u, { get name() {
		return H(o);
	} });
	var d = R(u), f = I(d, !0);
	O(d), O(l);
	var p = R(l, 2), m = I(p), h = I(m), g = (e) => {
		var n = Or();
		J(L(n), 17, () => H(a), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ M(() => H(n).entry.type === "directory"), a = /* @__PURE__ */ M(() => t.expanded.has(`${t.title}:${H(n).entry.path}`));
			var o = wo(), c = I(o);
			let l;
			var u = I(c), d = I(u), f = I(d), p = (e) => {
				{
					let t = /* @__PURE__ */ M(() => H(a) ? "chevron-down" : "chevron-right");
					Z(e, { get name() {
						return H(t);
					} });
				}
			};
			q(f, (e) => {
				H(r) && e(p);
			}), O(d);
			var m = R(d);
			{
				let e = /* @__PURE__ */ M(() => H(r) ? H(a) ? "folder-open" : "folder" : s(H(n).entry.name)), t = /* @__PURE__ */ M(() => H(r) ? "artifact-icon artifact-icon-dir" : "artifact-icon");
				Z(m, {
					get name() {
						return H(e);
					},
					get className() {
						return H(t);
					}
				});
			}
			var h = R(m), g = I(h, !0);
			O(h), O(u);
			var _ = R(u, 2), v = I(_), y = (e) => {
				var r = Co();
				Z(I(r), {
					name: "download",
					className: "artifact-download-icon"
				}), O(r), z((e) => {
					X(r, "href", e), X(r, "download", H(n).entry.name), X(r, "title", `Download ${H(n).entry.name}`), X(r, "aria-label", `Download ${H(n).entry.name}`);
				}, [() => t.rawURL(t.title, H(n).entry.path, !0)]), U("click", r, (e) => e.stopPropagation()), G(e, r);
			};
			q(v, (e) => {
				H(r) || e(y);
			});
			var b = R(v), x = I(b, !0);
			O(b), O(_), O(c), O(o), z((e) => {
				l = Y(c, 1, "artifact-row", null, l, {
					directory: H(r),
					file: !H(r),
					active: i() === `${t.title}:${H(n).entry.path}`
				}), ri(c, `--depth: ${H(n).depth}`), X(h, "title", H(n).entry.path), K(g, H(n).entry.name), K(x, e);
			}, [() => H(r) ? `${(H(n).entry.children || []).length} items` : bo(H(n).entry.size || 0)]), U("click", c, () => H(r) ? t.onToggle(`${t.title}:${H(n).entry.path}`) : t.onPreview(t.title, H(n).entry.path)), G(e, o);
		}), G(e, n);
	}, _ = (e) => {
		var n = To(), i = I(n);
		{
			let e = /* @__PURE__ */ M(() => t.title === "Artifacts" ? "archive" : "inbox");
			Z(i, { get name() {
				return H(e);
			} });
		}
		var a = R(i), o = I(a, !0);
		O(a), O(n), z(() => K(o, r())), G(e, n);
	};
	q(h, (e) => {
		H(a).length ? e(g) : e(_, -1);
	}), O(m), O(p), O(c), z(() => K(f, t.title)), G(e, c), j();
}
br(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var Oo = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), ko = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), Ao = /* @__PURE__ */ W("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), jo = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), Mo = /* @__PURE__ */ W("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), No = /* @__PURE__ */ W("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), Po = /* @__PURE__ */ W("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Fo(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ M(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ M(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : "");
	bn(() => {
		let e = t.selection, o = H(a);
		if (F(n, null), F(i, ""), !e) {
			t.client.requests.abort(o);
			return;
		}
		F(r, !0);
		let s = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${s}?path=${encodeURIComponent(e.path)}`, { scope: o }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && F(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (F(i, n instanceof Error ? n.message : String(n), !0), t.onError(H(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (F(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Ei(() => t.client.requests.abort(H(a)));
	var s = Or(), c = L(s), l = (e) => {
		var a = Po(), s = I(a), c = R(s, 2), l = I(c), u = I(l), d = I(u), f = I(d, !0);
		O(d);
		var p = R(d), m = I(p);
		O(p), O(u);
		var h = R(u), g = I(h);
		Z(I(g), { name: "external-link" }), k(), O(g);
		var _ = R(g);
		Z(I(_), { name: "x" }), O(_), O(h), O(l);
		var v = R(l, 2), y = (e) => {
			var n = Oo(), r = I(n);
			Z(r, { name: "loader-circle" });
			var i = R(r, 2), a = I(i, !0);
			O(i), O(n), z(() => K(a, t.selection.path)), G(e, n);
		}, b = (e) => {
			var t = ko(), n = I(t);
			Z(n, { name: "triangle-alert" });
			var r = R(n, 2), a = I(r, !0);
			O(r), O(t), z(() => K(a, H(i))), G(e, t);
		}, x = (e) => {
			var r = Ao(), i = I(r);
			O(r), z(() => {
				X(i, "src", H(o)), X(i, "alt", H(n).name || t.selection.path);
			}), G(e, r);
		}, S = (e) => {
			var r = jo(), i = I(r);
			Z(i, { name: "file-warning" });
			var a = R(i), o = I(a, !0);
			O(a);
			var s = R(a), c = I(s);
			O(s), O(r), z((e) => {
				K(o, H(n).name || t.selection.path), K(c, `Binary file, ${e ?? ""}.`);
			}, [() => bo(H(n).size || 0)]), G(e, r);
		}, C = (e) => {
			var t = Mo();
			Kr(t, () => go(H(n)?.content || ""), !0), O(t), G(e, t);
		}, w = /* @__PURE__ */ M(() => ho(H(n)?.path || t.selection.path)), T = (e) => {
			var t = No(), r = I(t, !0);
			O(t), z(() => K(r, H(n)?.content || "")), G(e, t);
		};
		q(v, (e) => {
			H(r) ? e(y) : H(i) ? e(b, 1) : H(n)?.image ? e(x, 2) : H(n)?.binary ? e(S, 3) : H(w) ? e(C, 4) : e(T, -1);
		}), O(c), O(a), z((e, r) => {
			X(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${H(n)?.contentHash || "pending"}`), K(f, e), K(m, `${t.selection.path ?? ""}${r ?? ""}${H(n)?.truncated ? " · truncated" : ""}`), X(g, "href", H(o));
		}, [() => H(n)?.name || t.selection.path.split("/").pop() || "File preview", () => H(n)?.size == null ? "" : ` · ${bo(H(n).size)}`]), U("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), U("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), G(e, a);
	};
	q(c, (e) => {
		t.selection && e(l);
	}), G(e, s), j();
}
br(["click"]);
//#endregion
//#region src/components/LogTimeline.svelte
var Io = /* @__PURE__ */ W("<div class=\"markdown-rendered\"></div>"), Lo = /* @__PURE__ */ W("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), Ro = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), zo = /* @__PURE__ */ W("<div class=\"log-load-actions\"><button type=\"button\" class=\"secondary-button log-load-more\"><!><span> </span></button></div>"), Bo = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"log-timeline\"><h3><!><span>Log</span></h3> <div class=\"log-timeline\"></div> <!> <!></div>");
function Vo(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => [...t.logs || []].sort(vo)), r = /* @__PURE__ */ P(!1);
	async function i() {
		if (!(t.loading || H(r))) {
			F(r, !0);
			try {
				await t.onLoadMore();
			} finally {
				F(r, !1), queueMicrotask(t.onIconsChanged);
			}
		}
	}
	var a = Or(), o = L(a), s = (e) => {
		var a = Bo(), o = I(a);
		Z(I(o), { name: "history" }), k(), O(o);
		var s = R(o, 2);
		J(s, 21, () => H(n), (e) => e.id, (e, t) => {
			var n = Lo(), r = I(n), i = I(r), a = I(i), o = I(a, !0);
			O(a);
			var s = R(a), c = I(s, !0);
			O(s), O(i);
			var l = R(i, 2), u = I(l, !0);
			O(l);
			var d = R(l, 2);
			Z(I(d), { name: "chevron-right" }), O(d), O(r);
			var f = R(r, 2);
			let p;
			var m = I(f), h = (e) => {
				var n = Io();
				Kr(n, () => go(H(t).details), !0), O(n), G(e, n);
			}, g = (e) => {
				G(e, Dr("No details."));
			};
			q(m, (e) => {
				H(t).details ? e(h) : e(g, -1);
			}), O(f), O(n), z((e) => {
				X(n, "data-log-id", H(t).id), X(i, "title", H(t).time), K(o, e), K(c, H(t).time), K(u, H(t).title || "Untitled log entry"), p = Y(f, 1, "log-details", null, p, { empty: !H(t).details });
			}, [() => yo(H(t).time)]), G(e, n);
		}), O(s);
		var c = R(s, 2), l = (e) => {
			var n = Ro(), r = I(n, !0);
			O(n), z(() => K(r, t.error)), G(e, n);
		};
		q(c, (e) => {
			t.error && e(l);
		});
		var u = R(c, 2), d = (e) => {
			var n = zo(), a = I(n), o = I(a);
			{
				let e = /* @__PURE__ */ M(() => t.loading || H(r) ? "loader-circle" : "chevron-down"), n = /* @__PURE__ */ M(() => t.loading || H(r) ? "spin" : "");
				Z(o, {
					get name() {
						return H(e);
					},
					get className() {
						return H(n);
					}
				});
			}
			var s = R(o), c = I(s, !0);
			O(s), O(a), O(n), z(() => {
				a.disabled = t.loading || H(r), X(a, "aria-busy", t.loading || H(r)), K(c, t.loading || H(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), U("click", a, i), G(e, n);
		};
		q(u, (e) => {
			t.hasMore && e(d);
		}), O(a), z(() => X(a, "data-log-resource", t.resourceId)), G(e, a);
	};
	q(o, (e) => {
		(H(n).length || t.error || t.hasMore) && e(s);
	}), G(e, a), j();
}
br(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var Ho = /* @__PURE__ */ W("<a class=\"markdown-open-file\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a>"), Uo = /* @__PURE__ */ W("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), Wo = /* @__PURE__ */ W("<pre class=\"markdown-view\"> </pre>"), Go = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"markdown-document\"><h3><!><span> </span> <!></h3> <!></div>");
function Ko(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => ho(t.file.name)), r = /* @__PURE__ */ M(() => `/api/workspaces/${encodeURIComponent(t.workspaceId)}/files/raw?path=${encodeURIComponent(t.file.path || "")}`);
	var i = Go(), a = I(i), o = I(a);
	Z(o, { name: "file-text" });
	var s = R(o), c = I(s, !0);
	O(s);
	var l = R(s, 2), u = (e) => {
		var n = Ho();
		Z(I(n), { name: "external-link" }), k(), O(n), z(() => {
			X(n, "href", H(r)), X(n, "aria-label", `Open ${t.file.name} in new window`);
		}), G(e, n);
	};
	q(l, (e) => {
		H(n) && t.file.path && e(u);
	}), O(a);
	var d = R(a, 2), f = (e) => {
		var n = Uo(), r = I(n);
		Kr(r, () => go(t.file.content || ""), !0), O(r), O(n), G(e, n);
	}, p = (e) => {
		var n = Wo(), r = I(n, !0);
		O(n), z(() => K(r, t.file.content || "")), G(e, n);
	};
	q(d, (e) => {
		H(n) ? e(f) : e(p, -1);
	}), O(i), z(() => {
		X(i, "data-doc-file", t.file.name), X(i, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`), K(c, t.file.name);
	}), G(e, i), j();
}
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var qo = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), Jo = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), Yo = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), Xo = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), Zo = /* @__PURE__ */ W("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><!><span> </span></button></div></form>"), Qo = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function $o(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(""), l = /* @__PURE__ */ M(() => H(r) !== H(i)), u = /* @__PURE__ */ M(() => !!(H(l) && H(o) && H(a) && H(o) !== H(a)));
	bn(() => {
		let e = _o(t.file?.content || ""), u = t.file?.contentHash || "";
		F(o, u, !0), t.identity === H(n) ? !H(l) && u !== H(a) && (F(r, e, !0), F(i, e, !0), F(a, u, !0)) : (F(n, t.identity, !0), F(r, e, !0), F(i, e, !0), F(a, u, !0), F(c, ""), F(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), H(s) || !H(l)) return;
		let u = H(n);
		F(s, !0), F(c, "");
		try {
			let e = await t.onSave(H(r), H(a));
			if (H(n) !== u) return;
			F(i, _o(e.content || H(r)), !0), F(r, H(i), !0), F(a, e.contentHash || "", !0), F(o, H(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			H(n) === u && F(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(n) === u && (F(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = Qo(), p = I(f);
	Z(I(p), { name: "file-text" }), k(), O(p);
	var m = R(p, 2), h = (e) => {
		var t = qo();
		Z(I(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), k(), O(t), G(e, t);
	}, g = (e) => {
		var n = Jo(), r = I(n);
		Z(r, { name: "triangle-alert" });
		var i = R(r, 2), a = I(i, !0);
		O(i), O(n), z(() => K(a, t.file.error)), G(e, n);
	}, _ = (e) => {
		var t = Zo(), n = I(t);
		it(n);
		var i = R(n, 2), a = (e) => {
			G(e, Yo());
		};
		q(i, (e) => {
			H(u) && e(a);
		});
		var o = R(i, 2), f = (e) => {
			var t = Xo(), n = I(t, !0);
			O(t), z(() => K(n, H(c))), G(e, t);
		};
		q(o, (e) => {
			H(c) && e(f);
		});
		var p = R(o, 2), m = I(p), h = I(m);
		{
			let e = /* @__PURE__ */ M(() => H(s) ? "loader-circle" : "save");
			Z(h, { get name() {
				return H(e);
			} });
		}
		var g = R(h), _ = I(g, !0);
		O(g), O(m), O(p), O(t), z(() => {
			n.disabled = H(s), m.disabled = H(s) || !H(l), K(_, H(s) ? "Saving" : "Save");
		}), yr("submit", t, d), vi(n, () => H(r), (e) => F(r, e)), G(e, t);
	};
	q(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), O(f), G(e, f), j();
}
//#endregion
//#region src/components/DetailPanel.svelte
var es = /* @__PURE__ */ W("<option> </option>"), ts = /* @__PURE__ */ W("<div class=\"resource-agent-binding\" aria-label=\"Resource agent binding\"><select aria-label=\"Binding kind\"><option>Profile</option><option>Agent</option></select> <select aria-label=\"Binding target\"></select> <button type=\"button\" class=\"secondary\"><!><span> </span></button></div>"), ns = /* @__PURE__ */ W("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), rs = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), is = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), as = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> </h1><!></div></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!></div>", 1), os = /* @__PURE__ */ W("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), ss = /* @__PURE__ */ W("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), cs = /* @__PURE__ */ W("<div class=\"details-actions\"><!><!><button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button></div>"), ls = /* @__PURE__ */ W("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), us = /* @__PURE__ */ W("<span class=\"details-tab-count\"> </span>"), ds = /* @__PURE__ */ W("<button type=\"button\" role=\"tab\"><span> </span><!></button>"), fs = /* @__PURE__ */ W("<div><!></div>"), ps = /* @__PURE__ */ W("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), ms = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), hs = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Task Templates</span></h3><div class=\"template-list\"><!></div></div>"), gs = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Template</span></h3><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), _s = /* @__PURE__ */ W("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), vs = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), ys = /* @__PURE__ */ W("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><h3><!><span>Worktrees</span></h3><div class=\"worktree-list\"><!></div></div></div></div>", 1), bs = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <code class=\"resource-ref-badge\"> </code></h1><!></div></div> <!>", 1), xs = /* @__PURE__ */ W("<!> <!> <!>", 1);
function Ss(e, t) {
	A(t, !0);
	let n = (e) => {
		var t = ts(), n = I(t), i = I(n);
		i.value = i.__value = "profile";
		var a = R(i);
		a.value = a.__value = "agent", O(n);
		var o;
		ai(n);
		var s = R(n, 2);
		J(s, 21, te, Lr, (e, t) => {
			var n = es(), r = I(n, !0);
			O(n);
			var i = {};
			z(() => {
				K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
			}), G(e, n);
		}), O(s);
		var c;
		ai(s);
		var f = R(s, 2), p = I(f);
		{
			let e = /* @__PURE__ */ M(() => H(d) ? "loader-circle" : "save");
			Z(p, { get name() {
				return H(e);
			} });
		}
		var m = R(p), h = I(m, !0);
		O(m), O(f), O(t), z(() => {
			o !== (o = H(l)) && (n.value = (n.__value = H(l)) ?? "", ii(n, H(l))), c !== (c = H(u)) && (s.value = (s.__value = H(u)) ?? "", ii(s, H(u))), f.disabled = H(d) || !H(u) || H(l) === H(r).agentBinding.kind && H(u) === H(r).agentBinding.name, K(h, H(d) ? "Saving" : "Bind");
		}), U("change", n, (e) => ne(e.currentTarget.value)), U("change", s, (e) => F(u, e.currentTarget.value, !0)), U("click", f, re), G(e, t);
	}, r = /* @__PURE__ */ P($t(t.channel.current())), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P($t(/* @__PURE__ */ new Set())), s = /* @__PURE__ */ P(null), c = /* @__PURE__ */ P(null), l = /* @__PURE__ */ P("profile"), u = /* @__PURE__ */ P("default"), d = /* @__PURE__ */ P(!1), f = /* @__PURE__ */ new Map(), p = new ao(), m = /* @__PURE__ */ M(() => (H(r).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), h = /* @__PURE__ */ M(() => new Set(H(m).map((e) => e.name))), g = /* @__PURE__ */ M(y), _ = /* @__PURE__ */ M(() => H(s) ? `${H(s).section}:${H(s).path}` : "");
	Ti(() => t.channel.subscribe((e) => {
		if (F(r, e, !0), e.identity !== H(i)) {
			H(i) && H(a) && f.set(H(i), H(a)), F(i, e.identity, !0), F(s, null), F(c, null), F(o, /* @__PURE__ */ new Set(), !0), F(a, f.get(H(i)) || v(e), !0), F(l, e.agentBinding.kind, !0), F(u, e.agentBinding.name, !0), F(d, !1);
			let t = document.getElementById("detailsContent");
			t && (t.scrollTop = 0);
		} else H(g).length && !H(g).some((e) => e.id === H(a)) && F(a, H(g)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), Ti(() => {
		let e = (e) => {
			e.key === "Escape" && (H(c) ? (e.preventDefault(), F(c, null)) : H(s) && (e.preventDefault(), F(s, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Ei(() => p.dispose());
	function v(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : t.some((e) => e.name === "work.md") ? "work" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "logs";
	}
	function y() {
		if (!H(r).detail) return [];
		let e = [];
		return H(h).has("project.md") && e.push({
			id: "project",
			label: "Project"
		}), H(h).has("task.md") && e.push({
			id: "task",
			label: "Task"
		}), H(h).has("work.md") && e.push({
			id: "work",
			label: "Work"
		}), (H(r).resourceType === "project" || H(r).detail.template) && e.push({
			id: "template",
			label: "Template"
		}), e.push({
			id: "logs",
			label: "Logs"
		}, {
			id: "artifacts",
			label: "Artifacts"
		}), H(r).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees"
		}), e;
	}
	function b(e) {
		return e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : e.name === "work.md" ? "work" : H(g).find((e) => [
			"project",
			"task",
			"work"
		].includes(e.id))?.id || "";
	}
	function x(e) {
		F(a, e, !0), f.set(H(i), e);
	}
	function S(e) {
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function C(e) {
		let t = new Set(H(o));
		t.has(e) ? t.delete(e) : t.add(e), F(o, t, !0), queueMicrotask(H(r).onIconsChanged);
	}
	function w(e, t, n = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = n ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(H(r).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function T(e, t) {
		F(s, {
			section: e,
			path: t
		}, !0);
	}
	function ee(e) {
		e && H(r).onToast(e);
	}
	function te(e = H(l)) {
		return e === "profile" ? H(r).agentProfiles.map((e) => ({
			id: e.key,
			label: e.description ? `${e.key} — ${e.description}` : e.key
		})) : H(r).agents.map((e) => ({
			id: e.id,
			label: e.label
		}));
	}
	function ne(e) {
		F(l, e, !0);
		let t = te(e);
		t.some((e) => e.id === H(u)) || F(u, t[0]?.id || "", !0);
	}
	async function re() {
		if (!(!H(u) || H(d))) {
			F(d, !0);
			try {
				await H(r).onSaveAgentBinding({
					kind: H(l),
					name: H(u)
				});
			} catch (e) {
				ee(e instanceof Error ? e.message : String(e));
			} finally {
				F(d, !1);
			}
		}
	}
	var ie = xs(), ae = L(ie), oe = (e) => {
		var t = ns(), n = I(t);
		Z(I(n), {
			name: "folder-search",
			className: "empty-state-icon"
		}), k(2), O(n), O(t), G(e, t);
	}, se = (e) => {
		var t = as(), i = L(t), a = I(i), s = I(a), c = I(s, !0);
		O(s), O(a);
		var l = R(a), u = I(l), d = I(u, !0);
		O(u);
		var f = R(u);
		n(f), O(l), O(i);
		var p = R(i, 2), m = I(p);
		$o(m, {
			get identity() {
				return H(r).identity;
			},
			get file() {
				return H(r).workspaceAgents;
			},
			get onSave() {
				return H(r).onSaveWorkspaceAgents;
			},
			get onToast() {
				return H(r).onToast;
			},
			get onIconsChanged() {
				return H(r).onIconsChanged;
			}
		});
		var h = R(m, 2), g = (e) => {
			var t = rs(), n = I(t);
			Z(I(n), { name: "book-open" }), k(), O(n);
			var i = R(n), a = I(i);
			Z(a, { name: "triangle-alert" });
			var o = R(a, 2), s = I(o, !0);
			O(o), O(i), O(t), z(() => K(s, H(r).wiki.error)), G(e, t);
		}, v = (e) => {
			var t = is(), n = I(t);
			Z(I(n), { name: "book-open" }), k(), O(n);
			var r = R(n);
			Z(I(r), { name: "book-open" }), k(2), O(r), O(t), G(e, t);
		}, y = (e) => {
			{
				let t = /* @__PURE__ */ M(() => H(r).wiki.entries || []);
				Do(e, {
					title: "Wiki",
					get entries() {
						return H(t);
					},
					emptyMessage: "No Wiki files yet.",
					get expanded() {
						return H(o);
					},
					get activePath() {
						return H(_);
					},
					onToggle: C,
					onPreview: T,
					rawURL: w
				});
			}
		};
		q(h, (e) => {
			H(r).wiki?.error ? e(g) : H(r).wiki?.exists ? e(y, -1) : e(v, 1);
		}), O(p), z(() => {
			K(c, H(r).workspaceName), K(d, H(r).workspaceName);
		}), U("click", s, () => H(r).onNavigate("workspace")), G(e, t);
	}, ce = (e) => {
		var t = bs(), i = L(t), s = I(i), l = I(s), u = I(l, !0);
		O(l);
		var d = R(l, 2), f = (e) => {
			var t = os(), n = R(L(t)), i = I(n, !0);
			O(n), z(() => K(i, H(r).parent.title)), U("click", n, () => H(r).onNavigate(H(r).parent?.id || "workspace")), G(e, t);
		};
		q(d, (e) => {
			H(r).parent && e(f);
		});
		var p = R(d, 3), h = I(p, !0);
		O(p), O(s);
		var v = R(s, 2), y = I(v), ee = I(y, !0), te = R(ee), ne = I(te, !0);
		O(te), O(y);
		var re = R(y), ie = (e) => {
			var t = cs(), i = I(t);
			n(i);
			var a = R(i), o = (e) => {
				var t = ss();
				Z(I(t), { name: "plus" }), k(), O(t), U("click", t, () => H(r).onCreateTask(H(r).resourceId)), G(e, t);
			};
			q(a, (e) => {
				H(r).resourceType === "project" && e(o);
			});
			var s = R(a);
			Z(I(s), { name: "archive" }), k(), O(s), O(t), U("click", s, () => H(r).onArchive(H(r).resourceId)), G(e, t);
		};
		q(re, (e) => {
			H(r).detail && e(ie);
		}), O(v), O(i);
		var ae = R(i, 2), oe = (e) => {
			var t = ls(), n = I(t);
			Z(I(n), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), k(), O(n), O(t), G(e, t);
		}, se = (e) => {
			var t = ys(), n = L(t);
			J(n, 21, () => H(g), (e) => e.id, (e, t) => {
				var n = ds();
				let i;
				var o = I(n), s = I(o, !0);
				O(o);
				var c = R(o), l = (e) => {
					var t = us(), n = I(t, !0);
					O(t), z(() => K(n, H(r).detail.logs.length)), G(e, t);
				};
				q(c, (e) => {
					H(t).id === "logs" && H(r).detail.logs?.length && e(l);
				}), O(n), z(() => {
					i = Y(n, 1, "details-tab", null, i, { active: H(a) === H(t).id }), X(n, "aria-selected", H(a) === H(t).id), K(s, H(t).label);
				}), U("click", n, () => x(H(t).id)), G(e, n);
			}), O(n);
			var i = R(n, 2), s = I(i);
			J(s, 17, () => H(m), (e) => e.path || e.name, (e, t) => {
				var n = fs();
				Ko(I(n), {
					get file() {
						return H(t);
					},
					get workspaceId() {
						return H(r).workspaceId;
					}
				}), O(n), z((e) => X(n, "hidden", e), [() => H(a) !== b(H(t))]), G(e, n);
			});
			var l = R(s, 2), u = I(l), d = (e) => {
				var t = hs(), n = I(t);
				Z(I(n), { name: "layout-template" }), k(), O(n);
				var i = R(n), a = I(i), o = (e) => {
					var t = Or();
					J(L(t), 17, () => H(r).detail.templates, (e) => e.name, (e, t) => {
						var n = ps();
						let r;
						var i = I(n);
						Z(i, { name: "file-text" });
						var a = R(i), o = I(a), s = I(o, !0);
						O(o);
						var c = R(o), l = I(c);
						O(c), O(a), Z(R(a), { name: "chevron-right" }), O(n), z(() => {
							r = Y(n, 1, "template-row", null, r, { invalid: !H(t).valid }), K(s, H(t).title || H(t).name), K(l, `${H(t).name ?? ""} · v${(H(t).schemaVersion || "?") ?? ""} · ${H(t).valid ? `${(H(t).fields || []).length} fields` : `invalid${H(t).errors?.[0]?.message ? `: ${H(t).errors[0].message}` : ""}`}${H(t).legacy ? " · legacy" : ""}`);
						}), U("click", n, () => H(t).path && T("Templates", H(t).path)), G(e, n);
					}), G(e, t);
				}, s = (e) => {
					var t = ms();
					Z(I(t), { name: "layout-template" }), k(), O(t), G(e, t);
				};
				q(a, (e) => {
					H(r).detail.templates?.length ? e(o) : e(s, -1);
				}), O(i), O(t), G(e, t);
			}, f = (e) => {
				var t = gs(), n = I(t);
				Z(I(n), { name: "layout-template" }), k(), O(n);
				var i = R(n), a = I(i), o = I(a);
				Z(o, { name: "file-text" });
				var s = R(o), c = I(s), l = I(c, !0);
				O(c);
				var u = R(c), d = I(u);
				O(u), O(s), O(a), O(i), O(t), z(() => {
					K(l, H(r).detail.template.name), K(d, `Created from template · v${(H(r).detail.template.schemaVersion || "?") ?? ""} · ${(H(r).detail.template.digest || "") ?? ""}`);
				}), G(e, t);
			};
			q(u, (e) => {
				H(r).resourceType === "project" ? e(d) : H(r).detail.template && e(f, 1);
			}), O(l);
			var p = R(l, 2), h = I(p);
			{
				let e = /* @__PURE__ */ M(() => H(r).detail.logs || []);
				Vo(h, {
					get resourceId() {
						return H(r).resourceId;
					},
					get logs() {
						return H(e);
					},
					get hasMore() {
						return H(r).logs.hasMore;
					},
					get loading() {
						return H(r).logs.loading;
					},
					get error() {
						return H(r).logs.error;
					},
					onLoadMore: () => H(r).onLoadMoreLogs(H(r).resourceId),
					get onIconsChanged() {
						return H(r).onIconsChanged;
					}
				});
			}
			O(p);
			var v = R(p, 2), y = I(v);
			{
				let e = /* @__PURE__ */ M(() => H(r).detail.artifacts || []);
				Do(y, {
					title: "Artifacts",
					get entries() {
						return H(e);
					},
					emptyMessage: "No artifacts.",
					get expanded() {
						return H(o);
					},
					get activePath() {
						return H(_);
					},
					onToggle: C,
					onPreview: T,
					rawURL: w
				});
			}
			O(v);
			var S = R(v, 2), ee = I(S), te = I(ee);
			Z(I(te), { name: "folder-git-2" }), k(), O(te);
			var ne = R(te), re = I(ne), ie = (e) => {
				var t = Or();
				J(L(t), 17, () => H(r).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = _s(), r = I(n), i = I(r);
					Z(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = R(i), o = I(a), s = I(o, !0);
					O(o);
					var l = R(o), u = I(l);
					O(l);
					var d = R(l), f = I(d, !0);
					O(d), O(a), O(r);
					var p = R(r);
					Z(I(p), { name: "git-compare-arrows" }), k(), O(p), O(n), z(() => {
						K(s, H(t).branch || "HEAD"), K(u, `${(H(t).name || "repository") ?? ""}${H(t).targetBranch || H(t).baseBranch ? ` · base ${H(t).targetBranch || H(t).baseBranch}` : ""}`), K(f, H(t).worktreePath || "");
					}), U("click", p, () => F(c, H(t), !0)), G(e, n);
				}), G(e, t);
			}, ae = (e) => {
				var t = vs();
				Z(I(t), { name: "git-branch" }), k(), O(t), G(e, t);
			};
			q(re, (e) => {
				H(r).detail.repos?.length ? e(ie) : e(ae, -1);
			}), O(ne), O(ee), O(S), O(i), z(() => {
				X(l, "hidden", H(a) !== "template"), X(p, "hidden", H(a) !== "logs"), X(v, "hidden", H(a) !== "artifacts"), X(S, "hidden", H(a) !== "worktrees");
			}), G(e, t);
		};
		q(ae, (e) => {
			H(r).loading || !H(r).detail ? e(oe) : e(se, -1);
		}), z((e) => {
			K(u, H(r).workspaceName), K(h, H(r).resourceTitle), K(ee, H(r).resourceTitle), K(ne, e);
		}, [() => S(H(r).resourceId)]), U("click", l, () => H(r).onNavigate("workspace")), U("click", p, () => H(r).onNavigate(H(r).resourceId)), G(e, t);
	};
	q(ae, (e) => {
		H(r).workspaceId ? H(r).resourceType === "workspace" ? e(se, 1) : e(ce, -1) : e(oe);
	});
	var le = R(ae, 2);
	Fo(le, {
		get client() {
			return p;
		},
		get workspaceId() {
			return H(r).workspaceId;
		},
		get resourceId() {
			return H(r).resourceId;
		},
		get selection() {
			return H(s);
		},
		onClose: () => F(s, null),
		onError: ee,
		get onIconsChanged() {
			return H(r).onIconsChanged;
		}
	}), mo(R(le, 2), {
		get client() {
			return p;
		},
		get workspaceId() {
			return H(r).workspaceId;
		},
		get resourceId() {
			return H(r).resourceId;
		},
		get repo() {
			return H(c);
		},
		onClose: () => F(c, null),
		onError: ee,
		get onIconsChanged() {
			return H(r).onIconsChanged;
		}
	}), G(e, ie), j();
}
br(["change", "click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var Cs = /* @__PURE__ */ W("<p class=\"approval-question\"> </p>"), ws = /* @__PURE__ */ W("<p> </p>"), Ts = /* @__PURE__ */ W("<button> </button>"), Es = /* @__PURE__ */ W("<div class=\"approval-options\"></div>"), Ds = /* @__PURE__ */ W("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), Os = /* @__PURE__ */ W("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), ks = /* @__PURE__ */ W("<!> <!>", 1), As = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function js(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P($t(a()));
	bn(() => {
		let e = a();
		e !== H(i) && (F(i, e, !0), F(n, ""), F(r, !1));
	});
	function a() {
		return `${t.contextIdentity}:${String(t.item.approvalId || "")}`;
	}
	async function o(e) {
		let i = String(t.item.approvalId || "");
		if (!(!i || H(r))) {
			F(r, !0);
			try {
				await t.onApproval(t.runId, i, e), F(n, "");
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				F(r, !1);
			}
		}
	}
	function s(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	var c = As(), l = I(c), u = I(l);
	Z(u, { name: "shield-question" });
	var d = R(u), f = I(d, !0);
	O(d), O(l);
	var p = R(l, 2), m = (e) => {
		var n = Cs(), r = I(n, !0);
		O(n), z(() => K(r, t.item.question)), G(e, n);
	};
	q(p, (e) => {
		t.item.question && e(m);
	});
	var h = R(p, 2), g = (e) => {
		var n = ws(), r = I(n, !0);
		O(n), z(() => K(r, t.item.detail)), G(e, n);
	};
	q(h, (e) => {
		t.item.detail && e(g);
	});
	var _ = R(h, 2), v = (e) => {
		var i = ks(), a = L(i), c = (e) => {
			var n = Es();
			J(n, 21, () => t.item.options, (e) => e.optionId, (e, t) => {
				var n = Ts();
				let i;
				var a = I(n, !0);
				O(n), z((e, t) => {
					n.disabled = H(r), i = Y(n, 1, "", null, i, e), K(a, t);
				}, [() => ({ "secondary-button": String(H(t).kind || "").startsWith("reject") }), () => s(H(t))]), U("click", n, () => o({ optionId: H(t).optionId })), G(e, n);
			}), O(n), G(e, n);
		}, l = (e) => {
			var t = Ds(), n = I(t);
			Z(I(n), { name: "check" }), k(), O(n);
			var i = R(n);
			Z(I(i), { name: "x" }), k(), O(i), O(t), z(() => {
				n.disabled = H(r), i.disabled = H(r);
			}), U("click", n, () => o({ decision: "accept" })), U("click", i, () => o({ decision: "decline" })), G(e, t);
		};
		q(a, (e) => {
			t.item.options?.length ? e(c) : e(l, -1);
		});
		var u = R(a, 2), d = (e) => {
			var t = Os(), i = I(t);
			fi(i);
			var a = R(i);
			O(t), z((e) => a.disabled = e, [() => !H(n).trim() || H(r)]), yr("submit", t, (e) => {
				e.preventDefault(), H(n).trim() && o({ text: H(n).trim() });
			}), vi(i, () => H(n), (e) => F(n, e)), G(e, t);
		};
		q(u, (e) => {
			t.item.question && e(d);
		}), G(e, i);
	}, y = (e) => {
		var n = ws(), r = I(n);
		O(n), z(() => K(r, `${(t.item.decision || (t.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${t.item.reply ? `: ${t.item.reply}` : ""}`)), G(e, n);
	};
	q(_, (e) => {
		t.item.status === "pending" ? e(v) : e(y, -1);
	}), O(c), z(() => K(f, t.item.title || "Approval requested")), G(e, c), j();
}
br(["click"]);
//#endregion
//#region src/components/timeline-events.ts
function Ms(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? Bs(r, n) : Vs(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function Ns(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) Ps(n, e);
	return n;
}
function Ps(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, Vs(t));
		return;
	}
	e[a] = Bs(e[a], t);
}
function Fs(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = Is(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? Ls(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function Is(e) {
	if (e.type !== "tool.event") return "";
	let t = Rs(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? Rs(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? zs(n.toolCallId) || zs(n.id) : "";
}
function Ls(e, t) {
	let n = e.data || {}, r = t.data || {}, i = Rs(n.raw), a = Rs(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? Rs(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? Rs(a.update) : a;
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
function Rs(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function zs(e) {
	return typeof e == "string" ? e.trim() : "";
}
function Bs(e, t) {
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
function Vs(e) {
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
var Hs = 250, Us = 80, Ws = /* @__PURE__ */ new Set(["session.launch-environment"]), Gs = class {
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
		this.api = e.api ?? new ao(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? Us);
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t) {
		if (this.disposed) return;
		let n = String(t?.id || "").trim(), r = Zs(e, n), i = this.activeKey !== r;
		if (this.activeKey && this.activeKey !== r && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !e || !n) {
			this.emit();
			return;
		}
		let a = this.contexts.get(r) ?? this.createContext(e, n);
		a.run = t, a.acceptedSessionIds = ac(t), a.notices = a.notices.filter((e) => e.data?.method !== "resource/profile"), t?.agentConfigError && this.appendNotice(a, {
			source: "forge",
			type: "forge.notice",
			data: {
				level: "warning",
				method: "resource/profile",
				runId: n,
				text: t.agentConfigError
			}
		}), !oc(t) && a.stream && (a.streamGeneration++, a.stream.close(), a.stream = null), i && this.emit(), !a.loaded && !a.loading ? this.loadInitial(a) : this.connect(a);
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.beforeId) return !1;
		let t = e.generation, n = e.beforeId;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = e.historyMode === "turns" ? ec(e, `before=${encodeURIComponent(n)}&limit=${Hs}`) : $s(e, `before=${encodeURIComponent(n)}&limit=${Hs}`), i = await this.api.latest(r, { scope: Qs(e, "older") });
			if (!this.isCurrent(e, t)) return !1;
			if (e.historyMode === "turns") {
				let t = qs(i.turns), r = rc(t);
				return t.length && (!r || r >= n) ? (e.hasMoreBefore = !1, !1) : (e.events = Fs(Ms([...t.flatMap(Js), ...e.events])), r && (e.beforeId = r), e.hasMoreBefore = !!(i.page?.hasMoreBefore && r), t.length > 0);
			}
			let a = Ks(i.events), o = nc(a);
			return a.length && (!o || o >= n) ? (e.hasMoreBefore = !1, !1) : (e.events = Fs(Ms([...a, ...e.events])), o && (e.beforeId = o), e.hasMoreBefore = !!(i.page?.hasMoreBefore && o), a.length > 0);
		} catch (n) {
			return n instanceof ro || !this.isCurrent(e, t) || (e.error = dc(n)), !1;
		} finally {
			this.isCurrent(e, t) && (e.loadingOlder = !1, this.emit());
		}
	}
	async expandRange(e, t) {
		let n = this.activeContext();
		if (!n || e <= 0 || t < e) return;
		let r = n.generation, i = e - 1, a = [];
		try {
			for (; i < t;) {
				let o = `start=${e}&end=${t}&after=${i}&limit=${Hs}`, s = await this.api.latest($s(n, o), { scope: Qs(n, `range:${e}:${t}`) });
				if (!this.isCurrent(n, r)) return;
				let c = Ks(s.events).filter((e) => this.eventBelongsToContext(n, e));
				a = Ms([...a, ...c]);
				let l = Number(s.page?.nextAfter) || ic(c);
				if (!s.page?.hasMore || !l || l <= i) break;
				i = l;
			}
			if (!this.isCurrent(n, r)) return;
			n.events = Fs(Ms([...n.events, ...a])), this.emit();
		} catch (e) {
			if (e instanceof ro || !this.isCurrent(n, r)) return;
			n.error = dc(e), this.emit();
		}
	}
	snapshot() {
		let e = this.activeContext();
		return e ? {
			identity: e.key,
			workspaceId: e.workspaceId,
			runId: e.runId,
			events: e.events.filter((e) => !Ws.has(e.type)),
			notices: [...e.notices],
			hasMoreBefore: e.hasMoreBefore,
			loading: e.loading,
			loadingOlder: e.loadingOlder,
			loaded: e.loaded,
			error: e.error
		} : uc();
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
			key: Zs(e, t),
			workspaceId: e,
			runId: t,
			acceptedSessionIds: /* @__PURE__ */ new Set([t]),
			run: null,
			generation: 1,
			streamGeneration: 0,
			events: [],
			notices: [],
			beforeId: 0,
			latestEventId: 0,
			historyMode: "turns",
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
			let n = await this.api.latest(ec(e, `latest=true&limit=${Hs}`), { scope: Qs(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			if (Array.isArray(n.turns)) {
				let r = qs(n.turns);
				e.historyMode = "turns", e.events = Fs(Ms(r.flatMap(Js))), e.beforeId = rc(r), e.hasMoreBefore = !!(n.page?.hasMoreBefore && e.beforeId), e.latestEventId = Math.max(0, Number(n.latestEventId) || 0);
				let i = r.at(-1);
				if (i && !i.closed) {
					let n = await this.loadTurnRange(e, i, t);
					if (!this.isCurrent(e, t)) return;
					e.events = Xs(e.events, i.id, n);
				}
				e.loaded = !0, this.connect(e);
				return;
			}
			e.historyMode = "events";
			let r = Ks(n.events).filter((t) => this.eventBelongsToContext(e, t));
			e.events = Fs(Ms(r)), e.beforeId = nc(r), e.latestEventId = ic(r), e.hasMoreBefore = !!(n.page?.hasMoreBefore && e.beforeId), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof ro || !this.isCurrent(e, t)) return;
			e.error = dc(n);
		} finally {
			this.isCurrent(e, t) && (e.loading = !1, this.emit());
		}
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !oc(e.run)) return;
		let t = Math.max(e.latestEventId, ic(e.events)), n = t ? `?after=${encodeURIComponent(t)}` : "", r = ++e.streamGeneration, i = this.eventSourceFactory(`/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/stream${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.latestEventId = Math.max(e.latestEventId, Number(n.id) || 0), e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.runId, n), this.scheduleEventFlush(e), sc(n) && n.turnId && this.compactClosedTurn(e, n.turnId, r);
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
			oc(e.run) || (i.close(), e.stream = null);
		};
	}
	async loadTurnRange(e, t, n) {
		let r = Math.max(1, Number(t.startEventId || t.firstEventId) || 1), i = Math.max(r, Number(t.lastEventId || t.endEventId) || 0, e.latestEventId), a = r - 1, o = [];
		for (; a < i;) {
			let t = `start=${r}&end=${i}&after=${a}&limit=${Hs}`, s = await this.api.latest($s(e, t), { scope: Qs(e, "live-turn") });
			if (!this.isCurrent(e, n)) return [];
			let c = Ks(s.events).filter((t) => this.eventBelongsToContext(e, t));
			o = Ms([...o, ...c]);
			let l = Number(s.page?.nextAfter) || ic(c);
			if (!s.page?.hasMore || !l || l <= a) break;
			a = l;
		}
		let s = Ms(o);
		for (let e = 0; e < s.length; e++) {
			let t = r + e;
			if (Number(s[e].id) !== t) throw Error(`Agent event history has a gap at ${t}.`);
		}
		if (ic(s) !== i) throw Error(`Agent event history stopped before durable event ${i}.`);
		return s;
	}
	async compactClosedTurn(e, t, n) {
		this.flushEvents(e, !1);
		for (let r = 0; r < 3; r++) try {
			let r = await this.api.latest(tc(e, t), { scope: Qs(e, `turn:${t}`) });
			if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
			if (!r.turn?.closed) throw Error("Turn projection is not closed yet");
			e.pendingEvents = e.pendingEvents.filter((e) => e.turnId !== t), e.events = Xs(e.events, t, Js(r.turn)), e.latestEventId = Math.max(e.latestEventId, Number(r.latestEventId) || 0), this.emit();
			return;
		} catch (t) {
			if (!this.isActive(e)) return;
			if (r === 2) {
				e.error = dc(t), this.emit();
				return;
			}
			await cc(50 * (r + 1));
		}
	}
	appendNotice(e, t) {
		e.notices.some((e) => lc(e) === lc(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
	}
	scheduleEventFlush(e) {
		e.flushTimer ||= setTimeout(() => {
			e.flushTimer = null, this.isActive(e) && this.flushEvents(e, !0);
		}, this.streamBatchWindowMs);
	}
	flushEvents(e, t) {
		if (!e.pendingEvents.length) return;
		let n = e.pendingEvents;
		e.pendingEvents = [], e.events = Fs(Ns(e.events, n)), t && this.isActive(e) && this.emit();
	}
	deactivate(e) {
		e && (e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.generation++, e.streamGeneration++, e.stream?.close(), e.stream = null, e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(Qs(e, "initial")), this.api.requests.abort(Qs(e, "older")), this.api.requests.abort(Qs(e, "live-turn")));
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
function Ks(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function qs(e) {
	return Array.isArray(e) ? e.filter((e) => !!e?.id && Number(e.firstEventId || e.startEventId) > 0) : [];
}
function Js(e) {
	let t = String(e.turnId || e.id);
	return (Array.isArray(e.items) ? e.items : []).flatMap((e) => Ys(t, e));
}
function Ys(e, t) {
	let n = Number(t.startEventId) || 0;
	if (!n) return [];
	let r = {
		id: n,
		time: t.endedAt || t.startedAt,
		startTime: t.startedAt,
		turnId: e
	}, i = t.data && typeof t.data == "object" ? t.data : {};
	switch (t.type) {
		case "message": return ["assistant", "agent"].includes(String(t.role || "")) ? [{
			...r,
			type: "message.assistant.delta",
			data: { text: t.text || "" }
		}] : [{
			...r,
			type: "message.input",
			data: {
				role: t.role || "user",
				sender: t.sender,
				steer: t.steer === !0,
				text: t.text || ""
			}
		}];
		case "thinking": {
			let e = Math.max(1, Number(t.count) || 1), i = Math.max(0, Number(t.durationMs) || 0);
			return [{
				...r,
				type: "message.reasoning.delta",
				data: {
					text: `Reasoning details omitted from compact history · ${e} update${e === 1 ? "" : "s"}${i ? ` · ${i} ms` : ""}`,
					compactRange: {
						start: n,
						end: Number(t.endEventId) || n
					}
				}
			}];
		}
		case "tool": {
			let i = Math.max(1, Number(t.count) || 1);
			return [{
				...r,
				type: "tool.event",
				data: {
					method: "turn/compact",
					compactRange: {
						start: n,
						end: Number(t.endEventId) || n
					},
					raw: { update: {
						sessionUpdate: "tool_call",
						toolCallId: `compact:${e}:${n}`,
						kind: "tool",
						status: "completed",
						title: `${i} tool call${i === 1 ? "" : "s"} · details omitted`
					} }
				}
			}];
		}
		case "approval": return [{
			...r,
			type: typeof i.decision == "string" ? "approval.resolved" : "approval.requested",
			data: i
		}];
		case "error": return [{
			...r,
			type: "provider.error",
			data: {
				...i,
				message: t.text || i.message
			}
		}];
		case "lifecycle": return t.text ? [{
			...r,
			type: t.text,
			data: i
		}] : [];
		case "unknown": return [{
			...r,
			type: t.text || "unknown",
			data: i
		}];
		default: return [{
			...r,
			type: t.type || "turn.item",
			data: i
		}];
	}
}
function Xs(e, t, n) {
	return Fs(Ms([...e.filter((e) => e.turnId !== t), ...n]));
}
function Zs(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function Qs(e, t) {
	return `chat:${e.key}:${t}`;
}
function $s(e, t) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/events?${t}`;
}
function ec(e, t) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/turns?${t}`;
}
function tc(e, t) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/turns/${encodeURIComponent(t)}`;
}
function nc(e) {
	return e.reduce((e, t) => {
		let n = Number(t.id) || 0;
		return n && (!e || n < e) ? n : e;
	}, 0);
}
function rc(e) {
	return e.reduce((e, t) => {
		let n = Number(t.firstEventId || t.startEventId) || 0;
		return n && (!e || n < e) ? n : e;
	}, 0);
}
function ic(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function ac(e) {
	return new Set([
		e?.id,
		e?.agentHubSessionId,
		e?.sourceExternalId
	].map((e) => String(e || "").trim()).filter(Boolean));
}
function oc(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e?.status || ""));
}
function sc(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function cc(e) {
	return new Promise((t) => setTimeout(t, e));
}
function lc(e) {
	let t = e.data || {};
	return [
		e.type,
		t.method,
		t.kind,
		t.lifecycle,
		t.runId,
		t.text
	].map((e) => String(e ?? "")).join(":");
}
function uc() {
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
function dc(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/LifecycleNotice.svelte
var fc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function pc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => t.item.tone === "ok" ? "check-circle" : t.item.tone === "danger" ? "triangle-alert" : t.item.tone === "info" ? "info" : "clock");
	function r() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var i = fc(), a = I(i);
	Z(a, { get name() {
		return H(n);
	} });
	var o = R(a), s = I(o, !0);
	O(o);
	var c = R(o), l = I(c, !0);
	O(c), O(i), z((e) => {
		Y(i, 1, `agent-system-note agent-lifecycle-${t.item.tone || "muted"}`), K(s, t.item.text || ""), K(l, e);
	}, [() => r()]), G(e, i), j();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var mc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function hc(e, t) {
	A(t, !0);
	let n = wi(t, "onExpand", 3, () => {});
	function r() {
		if (t.item.active) return "Thinking…";
		if (!t.item.startTime || !t.item.time) return "Thought";
		let e = Math.round((new Date(t.item.time).getTime() - new Date(t.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var i = mc(), a = I(i), o = I(a);
	Z(o, { name: "brain-circuit" });
	var s = R(o), c = I(s, !0);
	O(s);
	var l = R(s);
	Z(I(l), { name: "chevron-right" }), O(l), O(a);
	var u = R(a, 2), d = I(u, !0);
	O(u), O(i), z((e) => {
		i.open = t.item.active, K(c, e), K(d, t.item.text || "");
	}, [() => r()]), yr("toggle", i, (e) => {
		e.currentTarget.open && n()();
	}), G(e, i), j();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var gc = /* @__PURE__ */ W("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), _c = /* @__PURE__ */ W("<span class=\"agent-message-tag\">steer</span>"), vc = /* @__PURE__ */ W("<span class=\"agent-message-source\"> </span>"), yc = /* @__PURE__ */ W("<div class=\"agent-message-content markdown-rendered\"></div>"), bc = /* @__PURE__ */ W("<p> </p>"), xc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function Sc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => [
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
	var s = xc(), c = I(s), l = I(c), u = I(l), d = I(u, !0);
	O(u);
	var f = R(u, 2), p = (e) => {
		var t = gc(), r = I(t, !0);
		O(t), z(() => K(r, H(n))), G(e, t);
	};
	q(f, (e) => {
		H(n) !== "assistant" && e(p);
	});
	var m = R(f, 2), h = (e) => {
		G(e, _c());
	};
	q(m, (e) => {
		t.item.steer && e(h);
	});
	var g = R(m, 2), _ = (e) => {
		var n = vc(), r = I(n);
		O(n), z(() => {
			X(n, "title", t.item.sender.sessionId), K(r, `from session ${t.item.sender.sessionId ?? ""}`);
		}), G(e, n);
	};
	q(g, (e) => {
		H(n) === "agent" && t.item.sender?.sessionId && e(_);
	});
	var v = R(g, 2), y = I(v, !0);
	O(v), O(l);
	var b = R(l, 2), x = I(b), S = (e) => {
		var t = yc();
		Kr(t, a, !0), O(t), G(e, t);
	}, C = (e) => {
		var n = bc(), r = I(n, !0);
		O(n), z(() => K(r, t.item.text || "")), G(e, n);
	};
	q(x, (e) => {
		H(n) === "assistant" ? e(S) : e(C, -1);
	}), O(b), O(c), O(s), z((e, t) => {
		Y(s, 1, `agent-message-row ${H(n) === "assistant" ? "assistant final" : H(n)}`), K(d, e), K(y, t);
	}, [() => r(), () => i()]), G(e, s), j();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var Cc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function wc(e, t) {
	let n = wi(t, "error", 3, !1), r = wi(t, "alert", 3, !1);
	var i = Cc();
	let a;
	var o = I(i), s = I(o);
	{
		let e = /* @__PURE__ */ M(() => n() ? "triangle-alert" : "info");
		Z(s, { get name() {
			return H(e);
		} });
	}
	var c = R(s), l = I(c, !0);
	O(c), O(o);
	var u = R(o, 2), d = I(u, !0);
	O(u), O(i), z(() => {
		a = Y(i, 1, "timeline-notice", null, a, { "timeline-notice-error": n() }), X(i, "role", r() ? "alert" : void 0), K(l, t.title), K(d, t.text);
	}), G(e, i);
}
//#endregion
//#region src/components/ToolItem.svelte
var Tc = /* @__PURE__ */ W("<pre> </pre>"), Ec = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\"><summary><!><span> </span><small> </small></summary> <!></details>");
function Dc(e, t) {
	A(t, !0);
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
	var i = Ec(), a = I(i), o = I(a);
	{
		let e = /* @__PURE__ */ M(() => t.call.status === "running" ? "loader-circle" : t.call.status === "failed" ? "x-circle" : "check-circle");
		Z(o, { get name() {
			return H(e);
		} });
	}
	var s = R(o), c = I(s, !0);
	O(s);
	var l = R(s), u = I(l, !0);
	O(l), O(a);
	var d = R(a, 2), f = (e) => {
		var t = Tc(), n = I(t, !0);
		O(t), z((e) => K(n, e), [() => r()]), G(e, t);
	}, p = /* @__PURE__ */ M(() => r());
	q(d, (e) => {
		H(p) && e(f);
	}), O(i), z((e, t, n) => {
		Y(i, 1, e), K(c, t), K(u, n);
	}, [
		() => `agent-tool-item agent-tool-${String(t.call.status || "completed")}`,
		() => n(),
		() => String(t.call.method || "tool")
	]), G(e, i), j();
}
//#endregion
//#region src/components/ToolGroup.svelte
var Oc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function kc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => t.item.calls || []), r = /* @__PURE__ */ M(() => H(n).map(i));
	function i(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var a = Oc(), o = I(a), s = I(o);
	Z(I(s), { name: "wrench" }), O(s);
	var c = R(s), l = I(c);
	O(c);
	var u = R(c), d = I(u);
	O(u);
	var f = R(u);
	Z(I(f), { name: "chevron-right" }), O(f), O(o);
	var p = R(o, 2);
	J(p, 21, () => H(n), (e) => String(e.callId || e.key), (e, t) => {
		Dc(e, { get call() {
			return H(t);
		} });
	}), O(p), O(a), z((e, i) => {
		X(a, "data-tool-group-key", e), a.open = t.open, K(l, `${H(n).length ?? ""} tool ${H(n).length === 1 ? "call" : "calls"}`), K(d, `${i ?? ""}${H(r).length > 2 ? ` · +${H(r).length - 2} more` : ""}`);
	}, [() => `${t.runId}:${String(t.item.key || t.item.time || "tools")}`, () => H(r).slice(0, 2).join(" · ")]), yr("toggle", a, (e) => t.onToggle(e.currentTarget.open)), G(e, a), j();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var Ac = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function jc(e, t) {
	A(t, !0);
	var n = Ac(), r = I(n), i = I(r);
	Z(i, { name: "info" });
	var a = R(i), o = I(a);
	O(a), O(r);
	var s = R(r), c = I(s, !0);
	O(s), O(n), z(() => {
		K(o, `Unhandled event: ${(t.item.type || t.item.kind) ?? ""}`), K(c, t.item.preview || "This event carries no payload.");
	}), G(e, n), j();
}
//#endregion
//#region src/components/EventTimeline.svelte
var Mc = /* @__PURE__ */ W("<button type=\"button\" class=\"load-older-events\"><!><span> </span></button>"), Nc = /* @__PURE__ */ W("<div><!></div>"), Pc = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>Loading agent events</strong></div>"), Fc = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>Waiting for agent events</strong></div>"), Ic = /* @__PURE__ */ W("<!> <!> <!> <!> <!> <!>", 1), Lc = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>No agent run selected</strong><span> </span></div>"), Rc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div>");
function zc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P($t(t.channel.current().project)), i = /* @__PURE__ */ P($t(ee())), a = /* @__PURE__ */ M(() => H(r)(H(i).events)), o = /* @__PURE__ */ P(void 0), s, c = null, l = !1, u = !1, d = /* @__PURE__ */ new Map(), f = /* @__PURE__ */ P($t(/* @__PURE__ */ new Map()));
	Ti(() => {
		let e = b();
		s = new Gs({
			onEvent: (e, t, r) => H(n).onEvent(e, t, r),
			onNotice: (e, t, r) => H(n).onNotice(e, t, r)
		});
		let i = s.subscribe((e) => p(e)), a = t.channel.subscribe((e) => {
			let t = H(n).identity;
			F(n, e, !0), e.project !== H(r) && F(r, e.project, !0), e.identity !== t && (u = !0, c = null, F(f, new Map(d.get(e.identity) ?? []), !0)), s?.activate(e.workspaceId, e.activeRun), queueMicrotask(e.onIconsChanged);
		}), o = () => {
			if (!c || x()) return;
			let e = c;
			c = null, m(e);
		};
		return document.addEventListener("selectionchange", o), () => {
			i(), a(), document.removeEventListener("selectionchange", o), s?.dispose(), s = void 0, e && e.removeAttribute("data-agent-run-id");
		};
	});
	function p(e) {
		if (H(i).identity && e.identity === H(i).identity && x()) {
			c = e;
			return;
		}
		m(e);
	}
	function m(e) {
		let t = b();
		l = e.identity !== H(i).identity || u || S(t), u = !1, F(i, e, !0), t && (t.dataset.agentRunId = e.runId), lr().then(() => {
			l && !x() && C(), H(n).onIconsChanged(), e.loaded && e.hasMoreBefore && h(e.identity);
		});
	}
	async function h(e) {
		let t = 0;
		for (; t < 16 && H(i).identity === e && H(i).hasMoreBefore;) {
			let e = b();
			if (!e || e.scrollHeight > e.clientHeight + 160 || x() || !await s?.loadOlder()) return;
			t++, await lr(), C();
		}
	}
	async function g() {
		let e = b();
		if (!e || H(i).loadingOlder) return;
		let t = w(e), r = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, o = e.scrollTop, c = H(i).identity;
		await s?.loadOlder(), await lr(), H(i).identity === c && (e.scrollTop = t?.isConnected ? o + (t.getBoundingClientRect().top - r) : o + (e.scrollHeight - a), H(n).onIconsChanged());
	}
	function _(e, t) {
		let n = T(e);
		F(f, new Map(H(f)).set(n, t), !0), d.set(H(i).identity, new Map(H(f))), t && v(e);
	}
	function v(e) {
		if (!(!e.compact || !e.rangeStartEventId || !e.rangeEndEventId)) return s?.expandRange(e.rangeStartEventId, e.rangeEndEventId);
	}
	function y(e) {
		return H(f).get(T(e)) ?? !1;
	}
	function b() {
		return H(o)?.parentElement ?? null;
	}
	function x() {
		let e = b(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function S(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function C() {
		let e = b();
		e && (e.scrollTop = e.scrollHeight);
	}
	function w(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function T(e) {
		return `${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
	}
	function ee() {
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
	var te = Rc(), ne = I(te), re = (e) => {
		var t = Ic(), r = L(t), o = (e) => {
			var t = Mc(), n = I(t);
			{
				let e = /* @__PURE__ */ M(() => H(i).loadingOlder ? "loader-circle" : "chevrons-up");
				Z(n, { get name() {
					return H(e);
				} });
			}
			var r = R(n), a = I(r, !0);
			O(r), O(t), z(() => {
				t.disabled = H(i).loadingOlder, K(a, H(i).loadingOlder ? "Loading..." : "Load older messages");
			}), U("click", t, g), G(e, t);
		};
		q(r, (e) => {
			H(i).hasMoreBefore && e(o);
		});
		var s = R(r, 2);
		J(s, 17, () => H(a), (e) => T(e), (e, t) => {
			var r = Nc(), a = I(r), o = (e) => {
				Sc(e, {
					get item() {
						return H(t);
					},
					get agentName() {
						return H(n).agentName;
					}
				});
			}, s = (e) => {
				hc(e, {
					get item() {
						return H(t);
					},
					onExpand: () => v(H(t))
				});
			}, c = (e) => {
				{
					let n = /* @__PURE__ */ M(() => y(H(t)));
					kc(e, {
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
			}, l = (e) => {
				js(e, {
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
			}, u = (e) => {
				pc(e, { get item() {
					return H(t);
				} });
			}, d = (e) => {
				{
					let n = /* @__PURE__ */ M(() => H(t).text || "");
					wc(e, {
						title: "Provider error",
						get text() {
							return H(n);
						},
						error: !0
					});
				}
			}, f = (e) => {
				jc(e, { get item() {
					return H(t);
				} });
			};
			q(a, (e) => {
				H(t).kind === "message" ? e(o) : H(t).kind === "thinking" ? e(s, 1) : H(t).kind === "tools" ? e(c, 2) : H(t).kind === "approval" ? e(l, 3) : H(t).kind === "lifecycle" ? e(u, 4) : H(t).kind === "error" ? e(d, 5) : e(f, -1);
			}), O(r), z((e) => X(r, "data-timeline-key", e), [() => T(H(t))]), G(e, r);
		});
		var c = R(s, 2);
		J(c, 19, () => H(i).notices, (e, t) => `notice:${H(i).identity}:${t}:${String(e.data?.text || "")}`, (e, t, n) => {
			var r = Nc(), i = I(r);
			{
				let e = /* @__PURE__ */ M(() => String(H(t).data?.text || "")), n = /* @__PURE__ */ M(() => H(t).data?.level === "error");
				wc(i, {
					title: "Forge",
					get text() {
						return H(e);
					},
					get error() {
						return H(n);
					}
				});
			}
			O(r), z(() => X(r, "data-timeline-key", `notice:${H(n)}`)), G(e, r);
		});
		var l = R(c, 2), u = (e) => {
			wc(e, {
				title: "Timeline error",
				get text() {
					return H(i).error;
				},
				error: !0,
				alert: !0
			});
		};
		q(l, (e) => {
			H(i).error && e(u);
		});
		var d = R(l, 2), f = (e) => {
			var t = Pc();
			Z(I(t), { name: "loader-circle" }), k(), O(t), G(e, t);
		};
		q(d, (e) => {
			H(i).loading && !H(a).length && e(f);
		});
		var p = R(d, 2), m = (e) => {
			var t = Fc();
			Z(I(t), { name: "loader-circle" }), k(), O(t), G(e, t);
		};
		q(p, (e) => {
			H(i).loaded && !H(i).loading && !H(a).length && !H(i).notices.length && e(m);
		}), G(e, t);
	}, ie = (e) => {
		var t = Lc(), r = I(t);
		Z(r, { name: "bot" });
		var i = R(r, 2), a = I(i, !0);
		O(i), O(t), z(() => K(a, H(n).runCount ? "Select an Agent Run to view its events." : "Start an agent session.")), G(e, t);
	};
	q(ne, (e) => {
		H(i).runId ? e(re) : e(ie, -1);
	}), O(te), Ci(te, (e) => F(o, e), () => H(o)), z(() => X(te, "data-chat-context", H(i).identity)), G(e, te), j();
}
br(["click"]);
//#endregion
//#region src/components/SessionSwitcher.svelte
var Bc = /* @__PURE__ */ W("<button type=\"button\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span></button>"), Vc = /* @__PURE__ */ W("<div class=\"agent-session-menu\"></div>"), Hc = /* @__PURE__ */ W("<div class=\"agent-current-session\"><button type=\"button\" class=\"agent-current-run active\" title=\"Switch session\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span> <!></button></div> <!>", 1), Uc = /* @__PURE__ */ W("<div class=\"session-pill\"><strong>No sessions yet</strong><span>Start an agent session from the selected task.</span></div>"), Wc = /* @__PURE__ */ W("<div class=\"agent-session-error\" role=\"alert\"> </div>"), Gc = /* @__PURE__ */ W("<div id=\"agentSessions\" class=\"agent-session-switcher\"><!> <!></div>");
function Kc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ M(() => H(n).runs.find((e) => e.id === H(n).activeRunId) ?? H(n).runs[0] ?? null);
	Ti(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== H(n).identity;
			F(n, e, !0), t && (F(r, !1), F(i, ""), F(a, "")), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			H(r) && !t?.closest(".agent-session-switcher") && F(r, !1);
		};
		return document.addEventListener("click", o), () => {
			e(), document.removeEventListener("click", o);
		};
	});
	async function s(e) {
		if (!e || H(i) || e === H(n).activeRunId) {
			e === H(n).activeRunId && F(r, !H(r));
			return;
		}
		F(i, e, !0), F(a, ""), F(r, !1);
		try {
			await H(n).onSelect(e);
		} catch (e) {
			F(a, e instanceof Error ? e.message : String(e), !0), H(n).onToast(H(a));
		} finally {
			F(i, "");
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
	var d = Gc(), f = I(d), p = (e) => {
		var t = Hc(), a = L(t), d = I(a), f = I(d), p = I(f), m = I(p, !0);
		O(p);
		var h = R(p, 2), g = I(h), _ = I(g);
		let v;
		var y = R(_, 1, !0);
		O(g);
		var b = R(g, 2), x = I(b, !0);
		O(b), O(h), O(f);
		var S = R(f, 2);
		{
			let e = /* @__PURE__ */ M(() => H(i) ? "loader-circle" : "chevrons-up-down");
			Z(S, {
				get name() {
					return H(e);
				},
				className: "session-select-icon"
			});
		}
		O(d), O(a);
		var C = R(a, 2), w = (e) => {
			var t = Vc();
			J(t, 21, () => H(n).runs, (e) => e.id, (e, t) => {
				var r = Bc();
				let a;
				var o = I(r), d = I(o), f = I(d, !0);
				O(d);
				var p = R(d, 2), m = I(p), h = I(m);
				let g;
				var _ = R(h, 1, !0);
				O(m);
				var v = R(m, 2), y = I(v, !0);
				O(v), O(p), O(o), O(r), z((e, i, o, s, c, l) => {
					a = Y(r, 1, "agent-session-menu-row", null, a, { active: H(n).activeRunId === H(t).id }), X(r, "data-agent-run", H(t).id), r.disabled = e, K(f, i), Y(m, 1, o), g = Y(h, 1, "run-badge-dot", null, g, s), K(_, c), K(y, l);
				}, [
					() => !!H(i),
					() => u(H(t)),
					() => `run-badge run-badge-${c(H(t).status)}`,
					() => ({ "run-badge-pulse": ["running", "attention"].includes(c(H(t).status)) }),
					() => (H(t).status || "unknown").replaceAll("_", " "),
					() => l(H(t).updatedAt)
				]), U("click", r, () => s(H(t).id)), G(e, r);
			}), O(t), G(e, t);
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
			e.stopPropagation(), F(r, !H(r));
		}), G(e, t);
	}, m = (e) => {
		G(e, Uc());
	};
	q(f, (e) => {
		H(o) ? e(p) : e(m, -1);
	});
	var h = R(f, 2), g = (e) => {
		var t = Wc(), n = I(t, !0);
		O(t), z(() => K(n, H(a))), G(e, t);
	};
	q(h, (e) => {
		H(a) && e(g);
	}), O(d), z(() => X(d, "data-session-context", H(n).identity)), G(e, d), j();
}
br(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function qc(e) {
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
function Jc(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: { ...e.resourceDefaults },
		newProfile: { ...e.newProfile }
	};
}
function Yc(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var Xc = /* @__PURE__ */ W("<span class=\"settings-pill\"> </span>"), Zc = /* @__PURE__ */ W("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), Qc = /* @__PURE__ */ W("<div class=\"settings-empty\">No AgentHub agents available.</div>"), $c = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function el(e, t) {
	A(t, !0);
	let n = wi(t, "draft", 15), r = wi(t, "pending", 15);
	async function i() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(Jc(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(Yc(e));
			} finally {
				r("");
			}
		}
	}
	var a = $c(), o = R(I(a), 2), s = I(o), c = R(I(s)), l = I(c, !0);
	O(c), O(s);
	var u = R(s, 2), d = R(I(u));
	fi(d), O(u);
	var f = R(u, 2), p = I(f, !0);
	O(f);
	var m = R(f, 2);
	J(m, 21, () => t.agentHub.capabilities, Lr, (e, t) => {
		var n = Xc(), r = I(n, !0);
		O(n), z(() => K(r, H(t))), G(e, n);
	}), O(m), O(o);
	var h = R(o, 2), g = I(h), _ = R(I(g)), v = I(_);
	O(_), O(g);
	var y = R(g, 2);
	J(y, 21, () => t.agentHub.agents, (e) => e.name, (e, t) => {
		var n = Zc(), r = I(n), i = I(r), a = I(i, !0);
		O(i);
		var o = R(i), s = I(o), c = I(s, !0);
		O(s);
		var l = R(s), u = I(l);
		O(l), O(o), O(r), O(n), z((e) => {
			K(a, e), K(c, H(t).name), K(u, `${(H(t).providerId || "") ?? ""} · ${(H(t).available === !1 ? H(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (H(t).name || "A").slice(0, 1).toUpperCase()]), G(e, n);
	}, (e) => {
		G(e, Qc());
	}), O(y), O(h);
	var b = R(h, 2), x = I(b);
	let S;
	var C = I(x, !0);
	O(x);
	var w = R(x);
	Z(I(w), { name: "save" }), k(), O(w), O(b), O(a), z((e) => {
		K(l, t.agentHub.connected && t.agentHub.compatible ? "Compatible" : t.agentHub.connected ? "Incompatible" : "Unavailable"), K(p, t.agentHub.error || `API ${t.agentHub.apiVersion || "unknown"} · AgentHub ${t.agentHub.version || "unknown"}`), K(v, `${t.agentHub.agents.length ?? ""} agents · ${t.agentHub.providers.length ?? ""} providers`), S = Y(x, 1, "settings-save-hint", null, S, { visible: n().dirty }), K(C, n().dirty ? "Unsaved changes" : ""), w.disabled = e;
	}, [() => !n().dirty || !!r()]), U("input", d, function(...e) {
		t.onDirty?.apply(this, e);
	}), vi(d, () => n().endpoint, (e) => n(n().endpoint = e, !0)), U("click", w, i), G(e, a), j();
}
br(["input", "click"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var tl = /* @__PURE__ */ W("<small class=\"settings-notification-help\"> </small>"), nl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function rl(e, t) {
	A(t, !0);
	var n = nl(), r = R(I(n), 2), i = I(r), a = R(I(i), 2);
	fi(a), O(i);
	var o = R(i, 2), s = (e) => {
		var n = tl(), r = I(n, !0);
		O(n), z(() => K(r, t.notifications.permissionError)), G(e, n);
	};
	q(o, (e) => {
		t.notifications.permissionError && e(s);
	}), O(r);
	var c = R(r, 2), l = I(c), u = R(I(l), 2);
	fi(u), O(l);
	var d = R(l, 2), f = I(d, !0);
	O(d), O(c), O(n), z(() => {
		mi(a, t.notifications.browser), mi(u, t.notifications.sound), K(f, t.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), U("change", a, (e) => t.onBrowserNotifications(e.currentTarget.checked)), U("change", u, (e) => t.onCompletionSound(e.currentTarget.checked)), G(e, n), j();
}
br(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var il = /* @__PURE__ */ W("<option> </option>"), al = /* @__PURE__ */ W("<label><span> </span><select></select></label>"), ol = /* @__PURE__ */ W("<span class=\"settings-profile-system-label\">System</span>"), sl = /* @__PURE__ */ W("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), cl = /* @__PURE__ */ W("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), ll = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>New Resource Defaults</h3><span>Applied once at creation</span></div> <div class=\"settings-resource-defaults\"></div> <p class=\"settings-resource-default-note\">Existing resources keep their explicit binding. Changing a profile route replaces its referenced resource generations at a safe turn boundary.</p></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function ul(e, t) {
	A(t, !0);
	let n = wi(t, "draft", 15), r = wi(t, "pending", 15), i = /* @__PURE__ */ new Set([
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
				await t.onSaveAgentHub(Jc(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(Yc(e));
			} finally {
				r("");
			}
		}
	}
	var f = ll(), p = R(I(f), 2), m = R(I(p), 2);
	J(m, 20, () => [
		["workspace", "Workspace"],
		["project", "Project"],
		["task", "Task"]
	], Lr, (e, t) => {
		let r = /* @__PURE__ */ M(() => t[0]);
		var i = al(), a = I(i), o = I(a, !0);
		O(a);
		var s = R(a);
		J(s, 21, () => u(H(r)), Lr, (e, t) => {
			var n = il(), r = I(n);
			O(n);
			var i = {};
			z(() => {
				K(r, `${H(t).key ?? ""}${H(t).agentName ? "" : " (Missing)"}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
			}), G(e, n);
		}), O(s);
		var c;
		ai(s), O(i), z(() => {
			K(o, t[1]), X(s, "aria-label", `${t[1]} default profile`), c !== (c = n().resourceDefaults[H(r)]) && (s.value = (s.__value = n().resourceDefaults[H(r)]) ?? "", ii(s, n().resourceDefaults[H(r)]));
		}), U("change", s, (e) => l(H(r), e.currentTarget.value)), G(e, i);
	}), O(m), k(2), O(p);
	var h = R(p, 2), g = I(h), _ = R(I(g)), v = I(_);
	O(_), O(g);
	var y = R(g, 2), b = R(I(y), 2);
	J(b, 17, () => n().profiles, Lr, (e, t, n) => {
		let r = /* @__PURE__ */ M(() => i.has(H(t).key.trim().toLowerCase()));
		var o = cl();
		let l;
		var u = I(o);
		fi(u);
		var d = R(u, 2);
		fi(d);
		var f = R(d, 2);
		J(f, 21, () => c(H(t).agentName), Lr, (e, t) => {
			var n = il(), r = I(n, !0);
			O(n);
			var i = {};
			z(() => {
				K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
			}), G(e, n);
		}), O(f);
		var p;
		ai(f);
		var m = R(f, 2), h = (e) => {
			G(e, ol());
		}, g = (e) => {
			var t = sl();
			Z(I(t), { name: "trash-2" }), O(t), U("click", t, () => s(n)), G(e, t);
		};
		q(m, (e) => {
			H(r) ? e(h) : e(g, -1);
		}), O(o), z(() => {
			l = Y(o, 1, "settings-profile-row", null, l, { "settings-profile-system": H(r) }), pi(u, H(t).key), u.disabled = H(r), pi(d, H(t).description), d.disabled = H(r), p !== (p = H(t).agentName) && (f.value = (f.__value = H(t).agentName) ?? "", ii(f, H(t).agentName));
		}), U("input", u, (e) => a(n, "key", e.currentTarget.value)), U("input", d, (e) => a(n, "description", e.currentTarget.value)), U("change", f, (e) => a(n, "agentName", e.currentTarget.value)), G(e, o);
	});
	var x = R(b, 2), S = I(x);
	fi(S);
	var C = R(S, 2);
	fi(C);
	var w = R(C, 2);
	J(w, 21, () => t.agents, Lr, (e, t) => {
		var n = il(), r = I(n, !0);
		O(n);
		var i = {};
		z(() => {
			K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
		}), G(e, n);
	}), O(w);
	var T = R(w, 2);
	Z(I(T), { name: "plus" }), k(), O(T), O(x), O(y), O(h);
	var ee = R(h, 2), te = I(ee);
	let ne;
	var re = I(te, !0);
	O(te);
	var ie = R(te);
	Z(I(ie), { name: "save" }), k(), O(ie), O(ee), O(f), z((e) => {
		K(v, `${n().profiles.length ?? ""} routes`), w.disabled = !t.agents.length, T.disabled = !t.agents.length, ne = Y(te, 1, "settings-save-hint", null, ne, { visible: n().dirty }), K(re, n().dirty ? "Unsaved changes" : ""), ie.disabled = e;
	}, [() => !n().dirty || !!r()]), vi(S, () => n().newProfile.key, (e) => n(n().newProfile.key = e, !0)), vi(C, () => n().newProfile.description, (e) => n(n().newProfile.description = e, !0)), oi(w, () => n().newProfile.agentName, (e) => n(n().newProfile.agentName = e, !0)), U("click", T, o), U("click", ie, d), G(e, f), j();
}
br([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var dl = /* @__PURE__ */ W("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), fl = /* @__PURE__ */ W("<button type=\"button\"><!> <span> </span> <!></button>"), pl = /* @__PURE__ */ W("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function ml(e, t) {
	A(t, !0);
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
	var r = pl();
	J(R(I(r), 2), 17, () => n, (e) => e.id, (e, n) => {
		var r = fl();
		let i;
		var a = I(r);
		Z(a, { get name() {
			return H(n).icon;
		} });
		var o = R(a, 2), s = I(o, !0);
		O(o);
		var c = R(o, 2), l = (e) => {
			G(e, dl());
		};
		q(c, (e) => {
			H(n).sharesAgentDraft && e(l);
		}), O(r), z(() => {
			i = Y(r, 1, "settings-tab", null, i, {
				active: t.activeTab === H(n).id,
				dirty: t.dirty && H(n).sharesAgentDraft
			}), X(r, "aria-current", t.activeTab === H(n).id ? "page" : void 0), K(s, H(n).label);
		}), U("click", r, () => t.onSelect(H(n).id)), G(e, r);
	}), O(r), G(e, r), j();
}
br(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var hl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function gl(e, t) {
	A(t, !0);
	let n = wi(t, "draft", 15), r = wi(t, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n(n().userName = await t.onSaveUser(n().userName), !0);
			} catch (e) {
				t.onToast(Yc(e));
			} finally {
				r("");
			}
		}
	}
	var a = hl(), o = R(I(a), 2), s = I(o), c = R(I(s), 2);
	fi(c), k(2), O(s);
	var l = R(s, 2), u = I(l);
	Z(I(u), { name: "save" }), k(), O(u), O(l), O(o), O(a), z(() => u.disabled = r() === "user"), yr("submit", o, i), vi(c, () => n().userName, (e) => n(n().userName = e, !0)), G(e, a), j();
}
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var _l = /* @__PURE__ */ W("<span class=\"settings-pill\">Active</span>"), vl = /* @__PURE__ */ W("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), yl = /* @__PURE__ */ W("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), bl = /* @__PURE__ */ W("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), xl = /* @__PURE__ */ W("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Sl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function Cl(e, t) {
	A(t, !0);
	let n = wi(t, "draft", 15), r = wi(t, "pending", 15), i = /* @__PURE__ */ P("");
	async function a(e) {
		if (e.preventDefault(), !(!n().workspacePath.trim() || r())) {
			r("workspace");
			try {
				await t.onAddWorkspace(Jc(n())), n(n().workspacePath = "", !0), n(n().createWorkspace = !1, !0);
			} catch (e) {
				t.onToast(Yc(e));
			} finally {
				r("");
			}
		}
	}
	async function o(e) {
		if (!r()) {
			r(`remove:${e}`);
			try {
				await t.onRemoveWorkspace(e, Jc(n()));
			} catch (e) {
				t.onToast(Yc(e));
			} finally {
				r("");
			}
		}
	}
	async function s(e, a) {
		if (!r()) {
			r(`icon:${e}`), F(i, "");
			try {
				await t.onWorkspaceIcon(e, a, Jc(n()));
			} catch (e) {
				t.onToast(Yc(e));
			} finally {
				r("");
			}
		}
	}
	function c(e) {
		let n = t.workspaces.find((t) => t.id === e);
		return t.workspaceIcons.find((e) => e.id === (n?.icon || "")) || t.workspaceIcons[0];
	}
	var l = Sl(), u = R(I(l), 2), d = I(u);
	fi(d);
	var f = R(d, 2), p = I(f);
	fi(p), k(2), O(f);
	var m = R(f, 2), h = I(m);
	Z(h, { name: "plus" });
	var g = R(h), _ = I(g, !0);
	O(g), O(m), O(u);
	var v = R(u, 2);
	J(v, 21, () => t.workspaces, (e) => e.id, (e, n) => {
		let a = /* @__PURE__ */ M(() => c(H(n).id));
		var l = bl(), u = I(l), d = I(u), f = I(d), p = I(f);
		O(f);
		var m = R(f, 2), h = I(m), g = I(h, !0);
		O(h);
		var _ = R(h), v = I(_, !0);
		O(_), O(m), O(d);
		var y = R(d, 2), b = I(y), x = (e) => {
			G(e, _l());
		};
		q(b, (e) => {
			H(n).id === t.activeWorkspaceId && e(x);
		});
		var S = R(b, 2), C = I(S), w = R(C, 2), T = I(w, !0);
		O(w), Z(R(w, 2), { name: "chevron-down" }), O(S);
		var ee = R(S, 2);
		Z(I(ee), { name: "trash-2" }), O(ee), O(y), O(u);
		var te = R(u, 2), ne = (e) => {
			var r = yl();
			J(r, 21, () => t.workspaceIcons, (e) => e.id, (e, t) => {
				var r = vl();
				let i;
				var o = I(r), c = R(o), l = I(c, !0);
				O(c);
				var u = R(c), d = (e) => {
					Z(e, { name: "check" });
				};
				q(u, (e) => {
					H(t).id === H(a).id && e(d);
				}), O(r), z(() => {
					X(r, "aria-checked", H(t).id === H(a).id), X(r, "title", H(t).label), i = Y(r, 1, "", null, i, { selected: H(t).id === H(a).id }), X(o, "src", H(t).src), K(l, H(t).label);
				}), U("click", r, () => s(H(n).id, H(t).id)), G(e, r);
			}), O(r), z(() => X(r, "aria-label", `Icon for ${H(n).name}`)), G(e, r);
		};
		q(te, (e) => {
			H(i) === H(n).id && e(ne);
		}), O(l), z((e, t) => {
			X(p, "src", H(a).src), K(g, H(n).name), K(v, H(n).path), X(S, "aria-expanded", H(i) === H(n).id), S.disabled = e, X(C, "src", H(a).src), K(T, r() === `icon:${H(n).id}` ? "Saving..." : H(a).label), ee.disabled = t;
		}, [() => !!r(), () => !!r()]), U("click", S, () => F(i, H(i) === H(n).id ? "" : H(n).id, !0)), U("click", ee, () => o(H(n).id)), G(e, l);
	}, (e) => {
		G(e, xl());
	}), O(v), O(l), z((e) => {
		m.disabled = e, K(_, n().createWorkspace ? "Create" : "Add");
	}, [() => !!r()]), yr("submit", u, a), vi(d, () => n().workspacePath, (e) => n(n().workspacePath = e, !0)), yi(p, () => n().createWorkspace, (e) => n(n().createWorkspace = e, !0)), G(e, l), j();
}
br(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var wl = /* @__PURE__ */ W("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function Tl(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(-1), a = /* @__PURE__ */ P($t(qc(H(n)))), o = /* @__PURE__ */ P("");
	Ti(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity === H(r) ? e.dataVersion !== H(i) && !H(a).dirty && (F(i, e.dataVersion, !0), F(a, qc(e), !0)) : (F(r, e.identity, !0), F(i, e.dataVersion, !0), F(a, qc(e), !0), F(o, "")), queueMicrotask(e.onIconsChanged);
	})), Ti(() => {
		let e = (e) => {
			H(n).open && e.key === "Escape" && (e.preventDefault(), H(n).onClose(H(a).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function s() {
		H(a).dirty = !0;
	}
	var c = Or(), l = L(c), u = (e) => {
		var t = wl(), r = L(t), i = R(r, 2), c = I(i);
		ml(c, {
			get activeTab() {
				return H(a).tab;
			},
			get dirty() {
				return H(a).dirty;
			},
			onSelect: (e) => H(a).tab = e
		});
		var l = R(c, 2), u = I(l);
		Z(I(u), { name: "x" }), O(u);
		var d = R(u, 2), f = (e) => {
			Cl(e, {
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
					F(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					F(o, e, !0);
				}
			});
		}, p = (e) => {
			gl(e, {
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
					F(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					F(o, e, !0);
				}
			});
		}, m = (e) => {
			el(e, {
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
					F(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					F(o, e, !0);
				}
			});
		}, h = (e) => {
			ul(e, {
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
					F(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					F(o, e, !0);
				}
			});
		}, g = (e) => {
			rl(e, {
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
		}), O(l), O(i), U("click", r, () => H(n).onClose(H(a).dirty)), U("click", u, () => H(n).onClose(H(a).dirty)), G(e, t);
	};
	q(l, (e) => {
		H(n).open && e(u);
	}), G(e, c), j();
}
br(["click"]);
//#endregion
//#region src/components/Toast.svelte
var El = /* @__PURE__ */ W("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function Dl(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(!1), i = null;
	Ti(() => {
		let e = t.channel.subscribe((e) => {
			F(n, e, !0), F(r, !!e.message, !0), i !== null && window.clearTimeout(i), H(r) && (i = window.setTimeout(() => {
				F(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = El(), o = I(a, !0);
	O(a), z(() => {
		X(a, "hidden", !H(r)), K(o, H(n).message);
	}), G(e, a), j();
}
//#endregion
//#region src/components/UploadDialog.svelte
var Ol = /* @__PURE__ */ W("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), kl = /* @__PURE__ */ W("<small class=\"upload-result-path\"> </small>"), Al = /* @__PURE__ */ W("<small class=\"upload-error\"> </small>"), jl = /* @__PURE__ */ W("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), Ml = /* @__PURE__ */ W("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this session's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function Nl(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P($t([])), a = 1, o = /* @__PURE__ */ P(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ M(() => H(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ M(() => H(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ M(() => H(i).filter((e) => e.status === "error").length);
	Ti(() => {
		let e = t.channel.subscribe((e) => {
			F(n, e, !0), e.identity !== H(r) && (d(), F(r, e.identity, !0), F(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
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
		F(i, [...H(i), ...r], !0);
		for (let e of r) g(e, H(n).identity, H(n).workspaceId, H(n).runId);
	}
	function h(e, t) {
		F(i, H(i).map((n) => n.id === e ? {
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
	var b = Or(), x = L(b), S = (e) => {
		var t = Ml(), n = I(t), r = R(n, 2), a = I(r), s = R(I(a), 2);
		Z(I(s), { name: "x" }), O(s), O(a);
		var d = R(a, 2), f = I(d);
		Ci(f, (e) => F(o, e), () => H(o));
		var p = R(f, 2), h = I(p);
		Z(h, { name: "clipboard-paste" });
		var g = R(h, 4);
		Z(I(g), { name: "folder-open" }), k(), O(g), O(p);
		var b = R(p, 2), x = I(b), S = (e) => {
			G(e, Ol());
		};
		q(x, (e) => {
			H(i).length || e(S);
		}), J(R(x, 2), 17, () => H(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ M(() => y(H(t)));
			var r = jl();
			let i;
			var a = I(r), o = I(a);
			Z(o, { get name() {
				return H(n).icon;
			} });
			var s = R(o), c = I(s), l = I(c, !0);
			O(c);
			var u = R(c), d = I(u, !0);
			O(u), O(s);
			var f = R(s), p = I(f, !0);
			O(f), O(a);
			var m = R(a, 2), h = I(m);
			let g;
			O(m);
			var _ = R(m, 2), b = (e) => {
				var n = kl(), r = I(n, !0);
				O(n), z(() => K(r, H(t).path)), G(e, n);
			};
			q(_, (e) => {
				H(t).status === "success" && e(b);
			});
			var x = R(_, 2), S = (e) => {
				var n = Al(), r = I(n, !0);
				O(n), z(() => K(r, H(t).error || "Upload failed")), G(e, n);
			};
			q(x, (e) => {
				H(t).status === "error" && e(S);
			}), O(r), z((e) => {
				i = Y(r, 1, "upload-item", null, i, {
					"upload-item-success": H(t).status === "success",
					"upload-item-error": H(t).status === "error",
					"upload-item-uploading": H(t).status === "uploading"
				}), K(l, H(t).name), K(d, e), K(p, H(n).label), X(m, "aria-label", H(t).name), X(m, "aria-valuenow", H(t).progress), g = ri(h, "", g, { width: `${H(t).progress}%` });
			}, [() => v(H(t).size)]), G(e, r);
		}), O(b), O(d);
		var C = R(d, 2), w = I(C), T = I(w, !0);
		O(w);
		var ee = R(w, 2);
		O(C), O(r), O(t), z(() => {
			s.disabled = H(c), K(T, H(c) ? "Wait for uploads to finish before closing." : H(i).length ? `${H(l)} uploaded${H(u) ? ` · ${H(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), ee.disabled = H(c);
		}), U("click", n, _), U("click", s, _), U("change", f, () => H(o).files && m(H(o).files)), yr("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), yr("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), yr("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), U("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), H(o).click());
		}), U("click", g, () => H(o).click()), U("click", ee, _), G(e, t);
	};
	q(x, (e) => {
		H(n).open && e(S);
	}), G(e, b), j();
}
br([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var Pl = /* @__PURE__ */ W("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div>", 1);
function Fl(e, t) {
	A(t, !0);
	var n = Pl(), r = L(n);
	na(r, {
		get channel() {
			return t.channels.appShell;
		},
		details: (e) => {
			Ss(e, { get channel() {
				return t.channels.detail;
			} });
		},
		sessions: (e) => {
			Kc(e, { get channel() {
				return t.channels.sessions;
			} });
		},
		timeline: (e) => {
			zc(e, { get channel() {
				return t.channels.timeline;
			} });
		},
		composer: (e) => {
			ma(e, { get channel() {
				return t.channels.composer;
			} });
		},
		$$slots: {
			details: !0,
			sessions: !0,
			timeline: !0,
			composer: !0
		}
	});
	var i = R(r, 2);
	Dl(I(i), { get channel() {
		return t.channels.toast;
	} }), O(i);
	var a = R(i, 2);
	Nl(I(a), { get channel() {
		return t.channels.upload;
	} }), O(a);
	var o = R(a, 2);
	to(I(o), { get channel() {
		return t.channels.create;
	} }), O(o);
	var s = R(o, 2);
	Tl(I(s), { get channel() {
		return t.channels.settings;
	} }), O(s), G(e, n), j();
}
//#endregion
//#region src/components/model-channel.ts
function Il(e) {
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
var Q = () => void 0, Ll = async () => void 0;
function Rl() {
	return {
		appShell: Il({
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
			layout: {
				preference: "auto",
				effective: "three"
			},
			route: {
				path: "",
				revision: 0,
				replace: !0
			},
			onSwitchWorkspace: Ll,
			onAddWorkspace: Q,
			onCreateProject: Q,
			onOpenSettings: Q,
			onToggleProject: Ll,
			onSelectResource: Ll,
			onReorder: Ll,
			onDragState: Q,
			onPanePreview: Q,
			onPaneCommit: Q,
			onPaneViewport: Q,
			onMobileSidebar: Q,
			onMobileView: Q,
			onMobileImmersive: Q,
			onLayoutCycle: Q,
			onToast: Q,
			onIconsChanged: Q,
			onHistoryNavigation: Ll
		}),
		create: Il({
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
			onPreview: Ll,
			onSubmit: Ll,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: () => !0,
			onIconsChanged: Q
		}),
		settings: Il({
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
			onAddWorkspace: Ll,
			onRemoveWorkspace: Ll,
			onWorkspaceIcon: Ll,
			onSaveUser: async (e) => e,
			onSaveAgentHub: Ll,
			onBrowserNotifications: Q,
			onCompletionSound: Q,
			onToast: Q,
			onIconsChanged: Q
		}),
		upload: Il({
			open: !1,
			identity: "",
			workspaceId: "",
			runId: "",
			onDone: Q,
			onIconsChanged: Q
		}),
		composer: Il({
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
			agents: [],
			selectedAgentId: "",
			chooserOpen: !1,
			sessionStarting: !1,
			actionsOpen: !1,
			canEndTurn: !1,
			endingTurn: !1,
			closingSession: !1,
			onDraft: Q,
			onSend: async () => ({
				accepted: !1,
				clear: !1
			}),
			onOpenUpload: Q,
			onToggleChooser: Q,
			onChooseAgent: Q,
			onToggleActions: Q,
			onResume: Q,
			onEndTurn: Q,
			onCloseSession: Q,
			onIconsChanged: Q
		}),
		detail: Il({
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
			logs: {
				hasMore: !1,
				loading: !1,
				error: ""
			},
			onNavigate: Q,
			onCreateTask: Q,
			onArchive: Q,
			onLoadMoreLogs: Ll,
			onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
			onSaveAgentBinding: Ll,
			onToast: Q,
			onIconsChanged: Q
		}),
		sessions: Il({
			identity: "",
			workspaceId: "",
			resourceId: "",
			activeRunId: "",
			runs: [],
			switchingRunId: "",
			onSelect: Ll,
			onToast: Q,
			onIconsChanged: Q
		}),
		timeline: Il({
			identity: "",
			workspaceId: "",
			activeRunId: "",
			activeRun: null,
			runCount: 0,
			agentName: "Agent",
			project: () => [],
			onEvent: Q,
			onNotice: Q,
			onApproval: Ll,
			onToast: Q,
			onIconsChanged: Q
		}),
		toast: Il({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var zl = "forge.gui.agentDraft.v1", Bl = 1, Vl = 50, Hl = 7776e6;
function Ul(e) {
	return encodeURIComponent(String(e || "").trim());
}
function Wl(e) {
	return String(e?.agentHubSessionId || e?.sourceExternalId || e?.id || "").trim();
}
function Gl(e) {
	return String(e || "").trim() || "workspace";
}
function Kl(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? Vl, r = e.maxAgeMs ?? Hl;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function a(e, t) {
		let n = String(t || "").trim(), r = Wl(e);
		return !n || !r ? "" : `${zl}.session.${Ul(n)}.${Ul(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== Bl || typeof t.text != "string" ? null : {
				version: Bl,
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
				version: Bl,
				text: n,
				updatedAt: t(),
				...r
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = Gl(a);
		if (!c || !u) return;
		let f = `${zl}.session.${Ul(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || Gl(n.resourceId) !== d || o.has(t))) {
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
//#region src/controllers/agent-draft-controller.ts
function ql(e) {
	let t = Kl(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForRun(n, r);
	}
	function i(t, i) {
		let a = /* @__PURE__ */ new Set();
		n.ttyDraftWorkspaceId === t && n.ttyDraftResourceId === i && n.ttyDraftKey && a.add(n.ttyDraftKey);
		for (let n of e.runs()) {
			if (Gl(n.resourceId) !== i) continue;
			let e = r(n, t);
			e && a.add(e);
		}
		return a;
	}
	function a(r = e.workspaceId(), a = n.ttyDraftResourceId) {
		let o = r.trim(), s = Gl(a);
		o && t.prune(o, s, i(o, s));
	}
	function o() {
		if (!n.ttyDraftKey) return;
		let r = {
			workspaceId: n.ttyDraftWorkspaceId,
			resourceId: n.ttyDraftResourceId,
			runId: n.ttyDraftRunId,
			sessionId: Wl(e.currentRun())
		};
		t.write(n.ttyDraftKey, n.ttyDraft, r), a(r.workspaceId, r.resourceId);
	}
	function s(e, t = !0) {
		let r = String(e ?? "");
		n.ttyDraft !== r && (n.ttyDraft = r, n.ttyDraftVersion++), n.ttyMultiline = r.includes("\n"), t && o();
	}
	function c() {
		n.ttyDraft = "", n.ttyMultiline = !1, n.ttyDraftKey = "", n.ttyDraftWorkspaceId = "", n.ttyDraftResourceId = "", n.ttyDraftRunId = "", n.ttyDraftVersion++;
	}
	function l(i, o = e.workspaceId()) {
		let s = r(i, o);
		if (!s) return c();
		n.ttyDraftKey !== s && (n.ttyDraftKey = s, n.ttyDraftWorkspaceId = o.trim(), n.ttyDraftResourceId = Gl(i.resourceId), n.ttyDraftRunId = i.id, n.ttyDraft = t.read(s), n.ttyMultiline = n.ttyDraft.includes("\n"), n.ttyDraftVersion++, a(n.ttyDraftWorkspaceId, n.ttyDraftResourceId));
	}
	function u(r) {
		return e.workspaceId() !== r.workspaceId || e.currentRun()?.id !== r.runId || n.ttyDraftKey !== r.key || n.ttyDraft !== r.text || n.ttyDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
	}
	return {
		clearAfterAccepted: u,
		clearMemory: c,
		flush: o,
		restore: l,
		update: s
	};
}
//#endregion
//#region src/controllers/agent-operation-controller.ts
function Jl(e) {
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
function Yl(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/agent-session-controller.ts
function Xl(e) {
	let { operations: t } = e;
	async function n() {
		await Promise.all([e.reloadRuns(), e.refreshTree()]);
	}
	async function r(r = "") {
		if (!t.active("session-start")) return e.mutate(async () => {
			let i = e.workspaceId();
			if (!i) throw Error("Select a workspace first.");
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
	async function i(t) {
		if (t) return e.request(`/api/workspaces/${e.workspaceId()}/agent/runs/${t}/stop`, { method: "POST" });
	}
	async function a() {
		if (!e.activeRunId() || t.active("session-stop") || t.active("turn-stop")) return;
		let r = e.currentRun();
		if (!(!r || !e.isLive(r) || r.status === "stopping")) return e.mutate(async () => {
			let r = e.activeRunId(), a = t.begin("session-stop", r);
			if (a) try {
				await i(r), await n(), e.publish(), e.toast("Agent session closed.");
			} catch (t) {
				try {
					await n(), e.publish();
				} catch {}
				throw t;
			} finally {
				t.finish(a);
			}
		});
	}
	async function o() {
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
	async function s(r) {
		if (!(!r || r === e.activeRunId())) return e.mutate(async () => {
			let a = t.begin("session-switch", r);
			if (!a) return;
			let o = e.workspaceId();
			e.flushDraft();
			let s = e.currentRun();
			e.setActiveRun(r), e.resetDraft();
			let c = e.runs().find((e) => e.id === r);
			c && e.restoreDraft(c), e.publish();
			try {
				if (s && e.isLive(s)) try {
					await i(s.id);
				} catch (t) {
					throw o === e.workspaceId() && e.activeRunId() === r && (e.setActiveRun(s.id), e.resetDraft(), e.restoreDraft(s), e.publish()), t;
				}
				if (o !== e.workspaceId() || e.activeRunId() !== r) return;
				await n(), o === e.workspaceId() && e.publish();
			} finally {
				t.finish(a);
			}
		});
	}
	async function c() {
		let t = e.activeRunId();
		if (t) return e.mutate(async () => {
			e.flushDraft();
			let r = await e.request(`/api/workspaces/${e.workspaceId()}/agent/runs/${t}/resume`, { method: "POST" });
			e.setActiveRun(r.run.id), e.restoreDraft(r.run), e.setHistoryOpen(!1), await n(), e.publish(), e.toast("Agent session resumed.");
		});
	}
	async function l(t, n, r) {
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
	async function u(r, i) {
		let a = `${i?.workspaceId || "workspace"}:${i?.runId || i?.resourceId || "resource"}`;
		if (t.isSending(a) || !String(r || "").trim()) return {
			accepted: !1,
			clear: !1
		};
		let o = e.currentRun();
		if (!o || !e.isLive(o)) {
			let o = e.selectedResource()?.id || "workspace";
			if (i.workspaceId !== e.workspaceId() || i.resourceId !== o) throw Error("The selected Workspace or resource changed before the message could be sent.");
			if (!t.startSending(a)) return {
				accepted: !1,
				clear: !1
			};
			try {
				let t = e.selectedResource(), a = await e.request(`/api/workspaces/${i.workspaceId}/agent/runs`, {
					method: "POST",
					body: JSON.stringify({
						userName: e.userName(),
						resourceId: i.resourceId,
						title: t?.title || e.workspaceName(),
						prompt: r,
						cwd: e.defaultCwd()
					})
				});
				return i.workspaceId !== e.workspaceId() || i.resourceId !== (e.selectedResource()?.id || "workspace") ? {
					accepted: !0,
					clear: !1
				} : (e.resetDraft(), e.setActiveRun(a.run.id), await n(), e.publish(), {
					accepted: !0,
					clear: !0
				});
			} finally {
				t.stopSending(a);
			}
		}
		e.restoreDraft(o);
		let s = e.currentDraft();
		if (i.workspaceId !== e.workspaceId() || i.runId !== e.activeRunId() || i.draftKey !== s.key) throw Error("The selected Workspace or Session changed before the message could be sent.");
		e.updateDraft(r);
		let c = e.currentDraft().version;
		if (!t.startSending(a)) return {
			accepted: !1,
			clear: !1
		};
		try {
			let t = e.currentRun();
			if (!t || i.runId !== t.id || i.resourceId !== (t.resourceId || "")) throw Error("The selected Workspace or Session changed before the message could be sent.");
			let n = {
				text: r,
				userName: e.userName()
			}, a = await e.request(`/api/workspaces/${i.workspaceId}/agent/runs/${i.runId}/input`, {
				method: "POST",
				body: JSON.stringify(n)
			}), o = !1;
			if (a?.status === "accepted") {
				o = e.clearDraftAfterAccepted({
					workspaceId: i.workspaceId,
					runId: i.runId,
					key: i.draftKey,
					text: r,
					version: c
				}), o && e.bumpDraftResetVersion();
				try {
					await e.refreshInputProjection(i.workspaceId, i.resourceId);
				} catch (t) {
					e.toast(`Message accepted, but the view could not refresh: ${Yl(t)}`);
				}
			}
			return {
				accepted: a?.status === "accepted",
				clear: o
			};
		} finally {
			t.stopSending(a);
		}
	}
	return {
		start: r,
		stopSession: a,
		stopTurn: o,
		switchRun: s,
		closeRun: i,
		resume: c,
		resolveApproval: l,
		send: u
	};
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function Zl(e) {
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
function Ql(e) {
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
function $l(e) {
	let t = 0, n = Zl(t), r = 0, i = null, a = "";
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
			previewRequestKey: (e) => JSON.stringify(Ql({
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
			...Zl(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = Zl(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = Ql({
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
			n.previewError = Yl(e);
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
						slug: n.slug
					};
				} else {
					if (n.templateName && !n.templateDigest && (await p(o()), !n.templateDigest)) throw Error(n.previewError || "Could not render the selected template.");
					t = Ql(n);
				}
				await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				}), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1, n.identity = ++t, await e.reloadTree();
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(Yl(t)));
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
function eu() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function tu(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.sessionId}`;
}
function nu(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function ru(e) {
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
		if (!(!e.settings().browser || eu() !== "granted")) try {
			let n = new window.Notification(tu(t), {
				body: nu(t),
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
		n.browser && eu() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = eu();
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
			permission: eu(),
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
var iu = "forge.gui.notifications.v1", au = `${iu}.settings`;
function ou(e) {
	return e && typeof e == "object" ? e : null;
}
function su(e) {
	let t = ou(e);
	if (!t) return null;
	let n = String(t.marker || "").trim(), r = String(t.sessionId || "").trim();
	return !n || !r ? null : {
		workspaceId: String(t.workspaceId || "").trim(),
		sessionId: r,
		runId: String(t.runId || "").trim(),
		resourceId: String(t.resourceId || "").trim(),
		marker: n,
		completionState: String(t.completionState || "completed").trim(),
		title: String(t.title || "").trim(),
		resourceType: String(t.resourceType || "").trim(),
		resourceTitle: String(t.resourceTitle || "").trim(),
		at: Number(t.at) || Date.now()
	};
}
function cu() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function lu(e) {
	let t = ou(e);
	if (!t || t.version !== 1) return cu();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = ou(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(su).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(su).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = ou(e);
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
function uu(e) {
	let t = e.trim();
	return t ? `${iu}.state.${encodeURIComponent(t)}` : "";
}
function du(e) {
	function t(t) {
		let n = uu(t);
		if (!e || !n) return cu();
		try {
			let t = e.getItem(n);
			if (!t) return cu();
			let r = lu(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return cu();
		}
	}
	function n(t, n) {
		let r = lu(n), i = uu(t);
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
			let t = ou(JSON.parse(e.getItem(au) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(au);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(au, JSON.stringify({
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
function fu(e) {
	let t = String(e.completionMarker || e.agentRunCompletionMarker || "").trim();
	if (t) return t;
	let n = String(e.agentHubSessionId || e.completionSessionId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function pu(e) {
	return String(e.forgeSessionId || e.sessionId || e.agentHubSessionId || e.id || "").trim();
}
function mu(e, t) {
	return e.source === "internal" || e.source === "external" ? t(e).resourceId || "" : e.resourceId ? String(e.resourceId).trim() : "";
}
function hu(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function gu(e, t) {
	let n = mu(e, t.navigationTarget), r = t.findResource(n);
	return su({
		workspaceId: t.workspaceId,
		sessionId: pu(e),
		runId: String(e.runId || e.agentRunId || e.id || "").trim(),
		resourceId: n,
		marker: t.marker,
		completionState: t.completionState || e.completionState || "completed",
		title: r?.title || e.title || e.id || "Session",
		resourceType: r?.type || "",
		resourceTitle: r?.title || "",
		at: t.now?.() ?? Date.now()
	});
}
//#endregion
//#region src/controllers/notification-controller.ts
function _u(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function vu(e) {
	let t = du(_u(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= cu(), n.store;
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
			}), t.runId && e.activateRun(t.runId);
		} finally {
			ee(t.marker);
		}
	}
	let g = ru({
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
			let r = new t(`${iu}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), eu() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
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
			let n = su(t.record);
			if (!n) return;
			i.seen.some((e) => e.marker === n.marker) || i.seen.push({
				marker: n.marker,
				at: n.at
			}), l(n) ? (i.unread = i.unread.filter((e) => e.marker !== n.marker), i.pending = i.pending.filter((e) => e.marker !== n.marker), o(), u({
				type: "clear-resource",
				resourceId: n.resourceId
			})) : (i.unread.some((e) => e.marker === n.marker) || i.unread.push(n), o(), e.hasTree() && (e.renderSessions(), e.refreshIcons()));
			return;
		}
		if (t.type === "clear-marker" && t.marker) i.unread = i.unread.filter((e) => e.marker !== t.marker), i.pending = i.pending.filter((e) => e.marker !== t.marker);
		else if (t.type === "clear-resource" && t.resourceId) i.unread = i.unread.filter((e) => e.resourceId !== t.resourceId), i.pending = i.pending.filter((e) => e.resourceId !== t.resourceId);
		else return;
		o(), e.hasTree() && e.renderSessions();
	}
	function x(t, i = "") {
		let a = fu(t);
		if (!a || !n.workspaceId) return !1;
		let s = gu(t, {
			workspaceId: n.workspaceId,
			marker: a,
			completionState: i,
			navigationTarget: e.sessionNavigationTarget,
			findResource: e.findResource
		});
		if (!s?.sessionId) return !1;
		let c = r(), d = c.seen.some((e) => e.marker === a), f = c.pending.findIndex((e) => e.marker === a);
		return n.ready ? d && f < 0 ? !1 : (d || c.seen.push({
			marker: a,
			at: Date.now()
		}), c.pending = c.pending.filter((e) => e.marker !== a), l(s) ? (o(), !1) : (c.unread = c.unread.filter((e) => e.marker !== a), c.unread.push(s), o(), u({
			type: "record",
			record: s
		}), g.deliver(s), e.hasTree() && (e.renderSessions(), e.refreshIcons()), !0)) : (d || c.seen.push({
			marker: a,
			at: Date.now()
		}), c.pending = c.pending.filter((e) => e.marker !== a), o(), !1);
	}
	function S(e) {
		for (let t of e) fu(t) && x(t, t.completionState || t.agentRunCompletionState || "");
	}
	function C(e, t) {
		let n = hu(e);
		!n || !e.sessionId || !Number(e.id) || x({
			...t,
			completionMarker: `${e.sessionId}:${e.id}`,
			completionState: n,
			agentHubSessionId: t.agentHubSessionId || e.sessionId
		}, n);
	}
	function w() {
		n.ready || (S(e.treeSessions()), S(e.agentRuns()), n.ready = !0, o());
	}
	function T(e) {
		let t = e.trim();
		return !!(t && r().unread.some((e) => e.sessionId === t));
	}
	function ee(t) {
		let n = t.trim();
		if (!n) return;
		let i = r();
		(i.unread.some((e) => e.marker === n) || i.pending.some((e) => e.marker === n)) && (i.unread = i.unread.filter((e) => e.marker !== n), i.pending = i.pending.filter((e) => e.marker !== n), o(), u({
			type: "clear-marker",
			marker: n
		}), e.hasTree() && e.renderSessions());
	}
	function te(t) {
		let n = t.trim();
		if (!n) return;
		let i = r();
		(i.unread.some((e) => e.resourceId === n) || i.pending.some((e) => e.resourceId === n)) && (i.unread = i.unread.filter((e) => e.resourceId !== n), i.pending = i.pending.filter((e) => e.resourceId !== n), o(), u({
			type: "clear-resource",
			resourceId: n
		}), e.hasTree() && e.renderSessions());
	}
	function ne() {
		e.scope.listen(window, "storage", (r) => {
			r.key === uu(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.renderSessions()), r.key === au && (n.settings = t.readSettings(), eu() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
		}), e.scope.listen(document, "visibilitychange", () => {
			e.flushDraft(), c() && te(e.selectedResourceId());
		}), e.scope.listen(window, "focus", () => te(e.selectedResourceId()));
	}
	function re() {
		return i(), g.preferences();
	}
	function ie() {
		_(), g.dispose();
	}
	return {
		initialize: y,
		install: ne,
		dispose: ie,
		establishBaseline: w,
		observeProjections: S,
		observeEvent: C,
		hasUnreadForSession: T,
		clearResource: te,
		preferences: re,
		setBrowserEnabled: g.setBrowserEnabled,
		setSoundEnabled: g.setSoundEnabled
	};
}
//#endregion
//#region src/controllers/pane-layout-controller.ts
var yu = "forge.gui.paneSizes", bu = "forge.gui.mobileImmersive", xu = "forge.gui.layoutPreference", Su = 8, Cu = 220, wu = 360, Tu = 320, Eu = 1e4, Du = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarSessionHeight: 210
}), Ou = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarSessionHeight: "--sidebar-session-height"
});
function ku(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function Au(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var ju = [
	"auto",
	"three",
	"two",
	"split"
];
function Mu(e) {
	return ju.includes(e) ? e : "auto";
}
function Nu(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...Du };
	if (Au(n.sidebarWidth) && (r.sidebarWidth = ku(n.sidebarWidth, Cu, Eu)), Au(n.chatWidth)) r.chatWidth = ku(n.chatWidth, Tu, Eu);
	else if (Au(n.detailsWidth) && t >= 688) {
		let e = ku(n.detailsWidth, wu, t - Su - Tu);
		r.chatWidth = ku(t - Su - e, Tu, Eu);
	}
	return Au(n.sidebarSessionHeight) && (r.sidebarSessionHeight = ku(n.sidebarSessionHeight, 84, Eu)), r;
}
function Pu(e, t = window.localStorage) {
	let n = { ...Du }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = window.matchMedia("(max-width: 980px)"), o = window.matchMedia("(max-width: 1440px)");
	function s() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(yu) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function c() {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}
	function l(e, t) {
		document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
	}
	function u(e, t) {
		if (!Object.hasOwn(Ou, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(ku(t, r === "sidebarWidth" ? Cu : r === "chatWidth" ? Tu : 84, Eu));
		n[r] = i, l(Ou[r], i);
	}
	function d() {
		for (let e of Object.keys(Ou)) u(e, n[e]);
	}
	function f() {
		t?.setItem(yu, JSON.stringify(n));
	}
	function p() {
		let l = s();
		n = Nu(l, 0), d(), Au(l.detailsWidth) && !Au(l.chatWidth) && !a.matches && (n = Nu(l, c()), d(), f());
		try {
			r.immersive = t?.getItem(bu) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = Mu(t?.getItem(xu));
		} catch {
			i = "auto";
		}
		_();
		let u = () => {
			_(), e();
		};
		a.addEventListener?.("change", u), o.addEventListener?.("change", u);
	}
	function m(e) {
		if (!Object.hasOwn(Ou, e) || !t) return;
		let r = e, i = s();
		delete i.detailsWidth;
		for (let e of Object.keys(Ou)) Au(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(yu, JSON.stringify(i));
	}
	function h() {
		if (a.matches) return;
		let e = s();
		!Au(e.detailsWidth) || Au(e.chatWidth) || (n = Nu(e, c()), d(), f());
	}
	function g() {
		return a.matches ? "single" : i === "auto" ? o.matches ? "two" : "three" : i;
	}
	function _() {
		document.body.dataset.layout = g();
	}
	function v(n) {
		i = Mu(n);
		try {
			t?.setItem(xu, i);
		} catch {}
		_(), e();
	}
	function y() {
		let e = ju[(ju.indexOf(i) + 1) % ju.length];
		v(e);
	}
	function b(t) {
		r.sidebarOpen = !!t, document.body.classList.toggle("mobile-sidebar-open", r.sidebarOpen), e();
	}
	function x(t) {
		r.view = t === "chat" ? "chat" : "details", document.body.classList.toggle("mobile-chat-active", r.view === "chat"), e();
	}
	function S(n) {
		r.immersive = !!n, document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			t?.setItem(bu, r.immersive ? "1" : "0");
		} catch {}
		e();
	}
	return {
		initialize: p,
		previewPane: u,
		commitPane: m,
		syncViewport: h,
		setLayoutPreference: v,
		cycleLayoutPreference: y,
		setMobileSidebar: b,
		setMobileView: x,
		setMobileImmersive: S,
		snapshot: () => ({
			paneSizes: { ...n },
			mobile: { ...r },
			layout: {
				preference: i,
				effective: g()
			}
		})
	};
}
//#endregion
//#region src/controllers/resource-detail-controller.ts
function Fu(e, t) {
	let n = Date.parse(String(e?.time || "")), r = Date.parse(String(t?.time || ""));
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t?.time || "").localeCompare(String(e?.time || ""));
}
function Iu(e, t, n) {
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
	return r.sort(Fu);
}
function Lu(e, t = 10, n = 20) {
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
			logs: Iu([], o, !0),
			logPage: {
				hasMore: c.hasMore,
				nextCursor: c.nextCursor
			}
		}, e.details[r];
		let l = e.details[r], u = Iu(l.logs || [], o, n !== "older");
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
			d(r, t, a, l) && (a.error = Yl(e, "Could not load older logs."));
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
function Ru(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function zu(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: Ru(t[1]),
		resourceId: t[2] === "r" ? Ru(t[3]) : "workspace"
	} : {};
}
function Bu(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function Vu(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = Bu(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => zu(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/controllers/settings-controller.ts
function Hu(e, t) {
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
function Uu(e) {
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
				agents: c.agents || [],
				resourceDefaults: {
					workspace: i.config?.resourceDefaults?.workspace || "default",
					project: i.config?.resourceDefaults?.project || "default",
					task: i.config?.resourceDefaults?.task || "default"
				}
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
		}), await o(), e.setConfig(Hu(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: Hu
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var Wu = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering"
]), Gu = 6e4;
function Ku(e) {
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
		return e.map((e, t) => ({
			session: e,
			index: t
		})).sort((e, t) => {
			let n = Date.parse(e.session.startedAt || ""), r = Date.parse(t.session.startedAt || ""), i = Number.isFinite(n), a = Number.isFinite(r);
			return i && a && n !== r ? n - r : i === a ? e.session.id === t.session.id ? e.index - t.index : e.session.id < t.session.id ? -1 : 1 : i ? -1 : 1;
		}).map((e) => e.session);
	}
	function s(e) {
		let n = new Date(e.agentRunLastOutputAt || "").getTime();
		if (Number.isFinite(n)) return t() - n <= Gu;
		if (!["running", "starting"].includes(e.agentRunStatus || "")) return !1;
		let r = new Date(e.agentRunUpdatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= Gu;
	}
	function c(e, t, n, r, i, a = null) {
		return {
			kind: e,
			className: t,
			iconName: n,
			label: r,
			dimension: i,
			recentOutput: !!(a && s(a))
		};
	}
	function l(e) {
		let t = e.agentRunStatus || "";
		switch (t) {
			case "starting": return c("session-starting", "task-status-session-running", "loader-circle", "Session starting", "session", e);
			case "running": return c("session-running", "task-status-session-running", "loader-circle", "Session running", "session", e);
			case "waiting_approval": return c("session-approval", "task-status-attention", "shield-question", "Session waiting for approval", "session", e);
			case "stopping": return c("session-stopping", "task-status-session-stopping", "loader-circle", "Session stopping", "session", e);
			case "recovering": return c("session-recovering", "task-status-attention", "rotate-ccw", "Session recovering", "session", e);
			case "idle": return c("session-idle", "task-status-info", "message-square", "Session waiting for input", "session", e);
			default: return c("session-active", "task-status-neutral", "circle-dot", t ? `Session ${t}` : "Session active", "session", e);
		}
	}
	function u(e) {
		for (let t of [
			"waiting_approval",
			"starting",
			"running",
			"stopping",
			"recovering",
			"idle"
		]) {
			let n = e.find((e) => e.agentRunStatus === t);
			if (n) return l(n);
		}
		return e.length ? l(e[0]) : null;
	}
	function d(e) {
		let t = e.filter((e) => !!e), n = t.length > 0;
		return {
			statuses: t,
			hasTaskState: n,
			className: t.map((e) => e.className).filter(Boolean).join(" "),
			layoutClassName: n ? t.length > 1 ? "has-task-status-dual" : "has-task-status" : "",
			slotClassName: [t.length === 1 ? "task-status-single" : "", t.length > 1 ? "task-status-dual" : ""].filter(Boolean).join(" ")
		};
	}
	function f(t) {
		return t ? (e.tree()?.sessions || []).filter((e) => e.resourceId === t) : [];
	}
	function p(e) {
		let t = [];
		return e.length === 1 ? t.push(`Agent session ${(e[0].agentRunStatus || "open").replace("waiting_approval", "waiting for approval")}`) : e.length > 1 && t.push(`${e.length} agent sessions: ${[...new Set(e.map((e) => e.agentRunStatus || "open"))].join(", ")}`), t.join(" · ");
	}
	function m(e) {
		let t = f(e.id), n = u(t), r = d([n]);
		return {
			session: n,
			statusPresentation: r,
			className: r.className,
			label: p(t)
		};
	}
	function h() {
		return {
			session: null,
			className: "",
			label: "",
			statusPresentation: d([])
		};
	}
	function g(e) {
		let t = (e.children || []).filter((e) => e.archived !== !0), n = new Set(t.filter((e) => f(e.id).some((e) => e.source === "internal" && Wu.has(e.agentRunStatus || ""))).map((e) => e.id)), r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n.size} running`;
		return {
			taskCount: t.length,
			runningCount: n.size,
			taskLabel: r,
			runningLabel: i,
			text: `${r} · ${i}`,
			ariaLabel: `Open tasks: ${r}; ${i}`
		};
	}
	function _(e) {
		return e ? `${e.kind}:${e.iconName}:${e.recentOutput}` : "none";
	}
	function v() {
		let t = e.tree();
		if (!t) return "";
		let n = [];
		for (let e of t.projects) {
			let t = m(e), r = g(e);
			n.push(`${e.id}:session=${_(t.session)}:${t.label}:tasks=${r.taskCount}:${r.runningCount}`);
			for (let t of e.children || []) {
				let e = m(t);
				n.push(`${t.id}:session=${_(e.session)}:${e.label}`);
			}
		}
		return n.join("|");
	}
	function y(e, t, n, r) {
		let i = [];
		return r && i.push(r.label), i.length ? i.join(" · ") : e.source === "external" ? "External session active" : "Session active";
	}
	return {
		applyCustomOrder: i,
		moveIdInList: a,
		noTaskOperationalState: h,
		operationalStatusPresentation: d,
		projectTaskSummary: g,
		resourceRefText: n,
		sessionOperationalLabel: y,
		sessionStatusPresentation: l,
		sortedSessionsForDisplay: o,
		statusModel: r,
		taskAgentSessions: f,
		taskOperationalState: m,
		taskOperationalStateKey: v,
		taskStatusState: c
	};
}
//#endregion
//#region src/controllers/user-settings-controller.ts
var qu = "forge.gui.user.v1", Ju = 1, Yu = 80;
function Xu(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, Yu).join("") || "User";
}
function Zu(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Ju ? "User" : Xu(t.name);
	} catch {
		return "User";
	}
}
function Qu(e, t) {
	let n = r();
	function r() {
		try {
			return Zu(window.localStorage.getItem(qu));
		} catch {
			return "User";
		}
	}
	function i(e) {
		let t = Xu(e);
		try {
			window.localStorage.setItem(qu, JSON.stringify({
				version: Ju,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return n = t, n;
	}
	return e.listen(window, "storage", (e) => {
		e.key === qu && (n = Zu(e.newValue), t());
	}), {
		current: () => n,
		save: i
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var $u = class {
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
}, ed, td = null, $ = {
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
		sessionActionsOpen: !1,
		eventsHasMore: !1,
		historyBeforeId: 0,
		loadingOlder: !1,
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
function nd() {
	for (let e of Object.keys($.details)) delete $.details[e];
	for (let e of Object.keys($.resourceLogPages)) delete $.resourceLogPages[e];
}
var rd = ql({
	runtime: $.agent,
	workspaceId: () => $.activeWorkspaceId,
	runs: () => $.agent.runs,
	currentRun: () => Dp()
}), id = rd.clearAfterAccepted, ad = rd.clearMemory, od = rd.flush, sd = rd.restore, cd = rd.update, ld = Jl(() => {
	_m && (rp(), lp(), sm());
}), ud = Xl({
	operations: ld,
	workspaceId: () => $.activeWorkspaceId,
	selectedResource: () => Hp($.selectedId),
	taskDetail: () => {
		let e = Hp($.selectedId);
		return e ? $.details[e.id] || e : null;
	},
	currentRun: () => Dp(),
	runs: () => $.agent.runs,
	activeRunId: () => $.agent.activeRunId,
	selectedAgent: () => Qp(),
	enabledAgents: () => $p(),
	setAgentName: (e) => {
		$.agent.agentName = e;
	},
	setActiveRun: (e) => {
		$.agent.activeRunId = e;
	},
	setHistoryOpen: (e) => {
		$.agent.historyOpen = e;
	},
	closeAgentMenus: () => {
		$.agent.optionsOpen = !1, $.agent.agentChooserOpen = !1, $.agent.historyOpen = !1;
	},
	resetDraft: () => {
		$.agent.draftPrompt = "", ad();
	},
	flushDraft: od,
	restoreDraft: (e) => sd(e),
	currentDraft: () => ({
		key: $.agent.ttyDraftKey,
		text: $.agent.ttyDraft,
		version: $.agent.ttyDraftVersion
	}),
	updateDraft: (e) => cd(e),
	clearDraftAfterAccepted: (e) => id(e),
	bumpDraftResetVersion: () => {
		$.agent.ttyDraftResetVersion++;
	},
	userName: qd,
	workspaceName: Xp,
	defaultCwd: Np,
	isLive: Op,
	isTurnInterruptible: kp,
	mutate: (e) => Jf(e),
	request: (e, t) => Jd(e, t),
	reloadRuns: async () => {
		await Vf();
	},
	refreshTree: async () => {
		await Kf();
	},
	fetchDetail: (e, t) => Qd(e, t, { logsLimit: _d }),
	applyDetail: (e) => {
		tf(e, "head");
	},
	refreshInputProjection: async (e, t) => {
		await qf(e, t);
	},
	publish: lf,
	renderAgent: rp,
	renderComposer: lp,
	refreshIcons: sm,
	toast: om
}), dd = Pu(() => vf()), fd = Vu(() => vf()), pd = Lu({
	details: $.details,
	pages: $.resourceLogPages,
	context: () => ({
		workspaceId: $.activeWorkspaceId,
		navigationVersion: $.navigationVersion,
		selectedId: $.selectedId,
		detailRequestVersion: $.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++$.detailRequestVersion,
	isCurrentWorkspace: (e, t) => df(e, t),
	request: (e, t) => Jd(e, t),
	render: jf,
	refreshIcons: sm
}), md = $l({
	workspaceId: () => $.activeWorkspaceId,
	templates: (e) => $.details[e]?.templates || [],
	request: (e, t) => Jd(e, t),
	publish: (e) => ed.renderCreateDialog(e),
	toast: om,
	reloadTree: () => Xd(),
	selectWorkspaceResource: () => {
		$.selectedId = "workspace";
	},
	onOpen: () => {
		$.modalEnter = "create";
	},
	onIconsChanged: sm,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
}), hd = (e) => document.getElementById(e), gd = 5e3, _d = 10, vd = /* @__PURE__ */ new Set(["session.launch-environment"]), yd = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, bd = [
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
], xd = new Map(bd.map((e) => [e.id, e])), { applyCustomOrder: Sd, moveIdInList: Cd, noTaskOperationalState: wd, operationalStatusPresentation: Td, projectTaskSummary: Ed, resourceRefText: Dd, sessionOperationalLabel: Od, sessionStatusPresentation: kd, sortedSessionsForDisplay: Ad, statusModel: jd, taskOperationalState: Md, taskOperationalStateKey: Nd, taskStatusState: Pd } = Ku({
	tree: () => $.tree,
	findResource: (e) => Hp(e),
	agentName: (e) => ($.config?.agents || []).find((t) => t.id === e)?.name || e || "Forge GUI"
}), Fd = 0, Id = Uu({
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
	request: (e, t) => Jd(e, t),
	publish: (e) => ed.renderSettings(e),
	agentOptions: Ld,
	workspaceIcons: [yd, ...bd],
	userName: qd,
	saveUser: (e) => {
		if (!Bd) throw Error("User settings are unavailable.");
		return Bd.save(e);
	},
	notificationPreferences: () => zd?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => zd?.setBrowserEnabled(e),
	setCompletionSound: (e) => zd?.setSoundEnabled(e),
	flushDraft: od,
	resetAgentState: Zf,
	reloadWorkspaceContext: async () => {
		await af(), await Xd();
	},
	clearWorkspaceContext: () => {
		$.tree = null, nd(), lf();
	},
	renderWorkspace: hf,
	renderAgentViews: () => {
		Zp(), rp(), lp();
	},
	toast: om,
	onIconsChanged: sm
});
function Ld() {
	return $p().map((e) => ({
		id: e.id || "",
		label: fp(e),
		summary: ip(e)
	}));
}
function Rd() {
	vf(), jf(), Bp(), xp(), lp(), rp(), sp(), pp();
}
var zd = null, Bd = null;
function Vd(e) {
	zd?.initialize(e);
}
function Hd() {
	zd?.establishBaseline();
}
function Ud(e) {
	zd?.observeProjections(e);
}
function Wd(e, t) {
	t && zd?.observeEvent(e, t);
}
function Gd(e) {
	return zd?.hasUnreadForSession(e) ?? !1;
}
function Kd(e) {
	zd?.clearResource(e);
}
function qd() {
	return Bd?.current() || "User";
}
async function Jd(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		throw new no(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function Yd() {
	let e = qp(), [t, n] = await Promise.all([Jd("/api/workspaces"), Jd("/api/settings/agenthub")]);
	$.config = rm(t, n), Zp(), $.activeWorkspaceId = Jp(e.workspaceId) ? e.workspaceId || "" : $.config?.activeId || $.config?.workspaces[0]?.id || "", $.selectedId = e.resourceId || "workspace", hf(), $.activeWorkspaceId ? (Vd($.activeWorkspaceId), await af(), !e.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await Xd({ replaceURL: !0 })) : ($.navigationLoading = !1, $.tree = null, nd(), $.workspaceAgents = null, $.preview = null, $.diff = null, Zf(), lf());
}
async function Xd(e = {}) {
	if (!$.activeWorkspaceId) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.treeRequestVersion;
	$.navigationLoading = !0, $.navigationError = "", vf(), $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let i;
	try {
		i = await Jd(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw df(t, n, r) && ($.navigationLoading = !1, $.navigationError = Yl(e), vf()), e;
	}
	df(t, n, r) && ($.tree = i, nd(), $.workspaceAgents = null, $.workspaceAgentsSaving = !1, $.preview = null, $.diff = null, Up(), Kp(!1), $.selectedId === "workspace" ? await rf() : $.selectedId && await Zd($.selectedId), df(t, n, r) && (await Vf(), df(t, n, r) && (Hd(), $.navigationLoading = !1, $.navigationError = "", lf(), e.updateURL !== !1 && Yp({ replace: !!e.replaceURL }))));
}
async function Zd(e, t = {}) {
	return pd.load(e, t);
}
function Qd(e, t = $.activeWorkspaceId, n = {}) {
	return pd.fetch(e, t, n);
}
function $d(e) {
	pd.reset(e);
}
function ef(e) {
	return pd.snapshot(e);
}
function tf(e, t = "head") {
	return pd.apply(e, t);
}
async function nf(e = $.selectedId) {
	await pd.loadMore(e);
}
async function rf(e = {}) {
	if (!$.activeWorkspaceId || $.workspaceAgents && !e.force) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.workspaceAgentsRequestVersion;
	try {
		let e = await Jd(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!df(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = e;
	} catch (e) {
		if (!df(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: Yl(e)
		};
	}
	return $.workspaceAgents;
}
async function af(e = $.activeWorkspaceId, t = $.navigationVersion) {
	let n = await Jd(`/api/workspaces/${e}/ui-state`);
	return df(e, t) ? ($.expandedProjects = new Set(n.expandedProjects || []), $.lastResourceId = n.lastResourceId || "", $.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], $.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, $.sessionOrder = Array.isArray(n.sessionOrder) ? n.sessionOrder : [], !0) : !1;
}
async function of() {
	if (!$.activeWorkspaceId) return;
	let e = $.activeWorkspaceId, t = $.navigationVersion, n = $.selectedId;
	await Jd(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...$.expandedProjects],
			lastResourceId: n,
			projectOrder: $.projectOrder,
			taskOrder: $.taskOrder,
			sessionOrder: $.sessionOrder
		})
	}), df(e, t) && ($.lastResourceId = n);
}
function sf() {
	$.autoRefreshTimer ||= td?.interval(() => {
		cf().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, gd) ?? null;
}
async function cf() {
	if (!$.activeWorkspaceId || $.autoRefreshInFlight || $.agentSessionMutationCount > 0 || $.listDrag) return;
	let e = $.autoRefreshVersion, t = $.activeWorkspaceId, n = $.navigationVersion, r = $.selectedId;
	$.autoRefreshInFlight = !0;
	try {
		let i = await Gf(t);
		if (!i || !ff(t, n, e)) return;
		let a = !im($.tree, i);
		if (a && ($.tree = i), typeof Ud == "function" && Ud(i.sessions || []), a && $.preview?.section === "Wiki" && !$.preview.loading && (await If("Wiki", $.preview.path), !ff(t, n, e))) return;
		Up() && (Yp({ replace: !0 }), a = !0, r = $.selectedId);
		let o = $.expandedProjects.size;
		if (Kp(!1), a ||= o !== $.expandedProjects.size, $.selectedId === "workspace") {
			let r = $.workspaceAgents;
			if (await rf({ force: !0 }), !ff(t, n, e)) return;
			im(r, $.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++$.detailRequestVersion, o = await Qd(r, t, { logsLimit: _d });
			if (!ff(t, n, e) || $.selectedId !== r || i !== $.detailRequestVersion) return;
			let s = ef(r);
			tf(o, "head"), im(s, ef(r)) || (a = !0);
		}
		$.agentRunProjectionVersion = (Number($.agentRunProjectionVersion) || 0) + 1;
		let s = $.agentRunProjectionVersion, c = await Yf();
		if (!ff(t, n, e) || s !== $.agentRunProjectionVersion) return;
		if (im($.agent.runs, c) || ($.agent.runs = c, a = !0), typeof Ud == "function" && Ud(c), Uf(c)) {
			if (!ff(t, n, e) || s !== $.agentRunProjectionVersion) return;
			a = !0;
		}
		Nd() !== $.taskOperationalStateKey && (a = !0), a && lf();
	} finally {
		$.autoRefreshInFlight = !1;
	}
}
function lf() {
	vf(), jf(), rp(), sp(), sm(), Bp(), pp();
}
function uf() {
	vf(), jf(), rp(), sp(), sm(), Bp();
}
function df(e, t, n = null) {
	return e === $.activeWorkspaceId && t === $.navigationVersion && (n == null || n === $.treeRequestVersion);
}
function ff(e, t, n) {
	return df(e, t) && n === $.autoRefreshVersion;
}
function pf(e) {
	return xd.get(String(e?.icon || "").trim()) || yd;
}
function mf(e) {
	let t = pf(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function hf() {
	let e = $.config?.workspaces?.find((e) => e.id === $.activeWorkspaceId);
	mf(e), vf();
}
function gf(e, t, n = "") {
	let r = Md(e), i = t === "project" && Gp(e.id), a = t === "project" ? Ed(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: Dd(e.id),
		active: $.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: jd(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? Sd(e.children || [], $.taskOrder[e.id]).map((t) => gf(t, "task", e.id)) : [],
		projectId: n
	};
}
function _f(e) {
	let t = Ef(e), n = t.displayResourceId, r = e.source === "internal", i = r ? kd(e) : Pd("session-external", "session-status-external", "message-square", "External session active", "session"), a = Df(e), o = a ? Md(a) : wd(), s = Td([i]), c = Gd(e.id), l = `${Od(e, a, o, i)}${c ? ". Unread turn completion." : ""}`, u = r ? ($.config?.agents || []).find((t) => t.id === e.agentRunAgentName) : null, d = [r ? "AgentHub" : "External"];
	return n && d.push(n), e.updatedAt && d.push(Fp(e.updatedAt)), {
		id: e.id,
		source: e.source || "external",
		title: wf(e, t),
		meta: d.join(" · "),
		label: r ? u?.name || e.agentRunAgentName || "AgentHub" : "External",
		statusLabel: l,
		status: jd(s),
		unread: c,
		current: !!($.selectedId && $.selectedId !== "workspace" && t.selectedResourceIds.includes($.selectedId)),
		clickable: !!t.navigationResourceId,
		navigationResourceId: t.navigationResourceId
	};
}
function vf() {
	let e = $.tree ? Sd($.tree.projects || [], $.projectOrder).map((e) => gf(e, "project")) : [], t = Sd(Ad($.tree?.sessions || []), $.sessionOrder).map(_f);
	$.tree && ($.taskOperationalStateKey = Nd()), ed.renderAppShell({
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
			iconSrc: pf(e).src
		})),
		projects: e,
		sessions: t,
		...dd.snapshot(),
		route: fd.projection(),
		onSwitchWorkspace: (e) => yf(e),
		onAddWorkspace: () => nm("workspace").catch((e) => om(e.message)),
		onCreateProject: () => Ip(),
		onOpenSettings: () => nm().catch((e) => om(e.message)),
		onToggleProject: (e) => Sf(e),
		onSelectResource: (e) => xf(e),
		onReorder: (e, t, n) => bf(e, t, n),
		onDragState: (e) => {
			$.listDrag = e;
		},
		onPanePreview: (e, t) => um(e, t),
		onPaneCommit: (e) => dm(e),
		onPaneViewport: () => fm(),
		onMobileSidebar: (e) => pm(e),
		onMobileView: (e) => mm(e),
		onMobileImmersive: (e) => hm(e),
		onLayoutCycle: () => dd.cycleLayoutPreference(),
		onHistoryNavigation: (e) => xm(e),
		onToast: om,
		onIconsChanged: sm
	});
}
async function yf(e) {
	if (!Jp(e)) return;
	if ($.workspaceMenuOpen = !1, e === $.activeWorkspaceId) {
		hf();
		return;
	}
	pm(!1), od(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let t = $.navigationVersion;
	await of().catch((e) => console.warn("failed to save UI state", e)), $.activeWorkspaceId = e, $.selectedId = "workspace", $.tree = null, $.navigationLoading = !0, $.navigationError = "", nd(), Vd(e), $.sessionMenu = null, Ff(), $.workspaceAgentsSaving = !1, zp(), Zf(), hf(), await af(e, t) && ($.selectedId = $.lastResourceId || "workspace", await Xd());
}
async function bf(e, t, n) {
	let r = {
		projectOrder: [...$.projectOrder],
		taskOrder: Object.fromEntries(Object.entries($.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []])),
		sessionOrder: [...$.sessionOrder]
	};
	if (e.kind === "session") $.sessionOrder = Cd(Sd(Ad($.tree?.sessions || []), $.sessionOrder).map((e) => e.id), e.id, t.id, n);
	else if (e.kind === "task") {
		let r = Hp(e.projectId);
		if (!r) return;
		let i = Sd(r.children || [], $.taskOrder[e.projectId]);
		$.taskOrder = {
			...$.taskOrder,
			[e.projectId]: Cd(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") $.projectOrder = Cd(Sd($.tree?.projects || [], $.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	vf();
	try {
		await of();
	} catch (e) {
		throw $.projectOrder = r.projectOrder, $.taskOrder = r.taskOrder, $.sessionOrder = r.sessionOrder, vf(), e;
	}
}
async function xf(e, t = {}) {
	let n = $.selectedId !== e;
	t.clearUnread !== !1 && Kd(e);
	let r = n || !!t.forceDetail;
	r && ($.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, e !== "workspace" && ($d(e), delete $.details[e])), n && ($.workspaceAgentsSaving = !1, od(), yp(), $.preview = null, $.diff = null, Qf(), $.agent.runs = [], $.agent.activeRunId = "", $.agent.events = [], $.agent.notices = [], $.agent.historyBeforeId = 0, ad()), $.selectedId = e, $.sessionMenu = null, pm(!1), Kp(!1), Yp(), of().catch((e) => console.warn("failed to save UI state", e)), uf(), await Promise.all([e === "workspace" ? rf({ force: !!t.forceDetail }) : Zd(e, { force: r }), n ? Vf() : Promise.resolve()]), df($.activeWorkspaceId, $.navigationVersion) && uf();
}
async function Sf(e) {
	$.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), vf();
	try {
		await of();
	} catch (t) {
		throw $.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), vf(), t;
	}
}
function Cf() {
	vf();
}
function wf(e, t = Ef(e)) {
	let n = (typeof t == "string" ? t : t.displayResourceId) || "", r = Hp(n)?.title || "";
	return e.source === "internal" ? e.agentRunTitle || r || n || e.id : r || n || e.id;
}
function Tf(e) {
	let t = String(e || "").trim();
	if (!t) return "";
	let n = Hp(t);
	return n && n.archived !== !0 ? t : "";
}
function Ef(e) {
	let t = String(e?.resourceId || "").trim();
	return e?.source === "internal" && t ? {
		kind: "run",
		resourceId: t,
		displayResourceId: t,
		navigationResourceId: Tf(t),
		selectedResourceIds: [t]
	} : {
		kind: "none",
		resourceId: "",
		displayResourceId: "",
		navigationResourceId: "",
		selectedResourceIds: []
	};
}
function Df(e) {
	if (!e || e.source !== "internal") return null;
	let t = String(e.resourceId || "").trim();
	return t ? Of(t) : null;
}
function Of(e) {
	let t = Hp(e);
	return t && t.type === "task" && !t.archived ? t : null;
}
function kf() {
	let e = $.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${$.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: Xp(),
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
		} : Hp($.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description
		})),
		agents: Ld(),
		logs: {
			hasMore: !1,
			loading: !1,
			error: ""
		},
		onNavigate: (e) => Mf(e).catch((e) => om(Yl(e))),
		onCreateTask: (e) => Lp(e),
		onArchive: (e) => Vp(e).catch((e) => om(Yl(e))),
		onLoadMoreLogs: (e) => nf(e),
		onSaveWorkspaceAgents: (e, t) => Lf(e, t),
		onSaveAgentBinding: async (t) => {
			let n = $.selectedId || "workspace";
			await Jd(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await Xd({ updateURL: !1 }), n !== "workspace" && await Zd(n, { force: !0 }), lf(), om("Resource agent binding saved.");
		},
		onToast: om,
		onIconsChanged: sm
	};
	if (!$.tree) return t;
	if ($.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Xp()
	};
	let n = Hp($.selectedId) || $.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Xp()
	};
	let r = $.details[n.id] || null, i = Wp(n.id), a = $.resourceLogPages?.[n.id] || {};
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
		detail: Af(r),
		logs: {
			hasMore: !!(a.hasMore ?? r?.logPage?.hasMore),
			loading: !!a.loading,
			error: String(a.error || "")
		}
	};
}
function Af(e) {
	return !e || e.type !== "project" && e.type !== "task" ? null : {
		...e,
		type: e.type,
		title: e.title || e.id,
		path: e.path || "",
		logs: (e.logs || []).map((t, n) => ({
			id: t.id || `${e.id}:log:${n}`,
			time: t.time || "",
			title: t.title,
			details: t.details
		}))
	};
}
function jf() {
	ed.renderDetailPanel(kf());
}
async function Mf(e) {
	await xf(e, { forceDetail: e === $.selectedId && e !== "workspace" });
}
function Nf(e) {
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
function Pf(e) {
	return Nf(e || "").trim();
}
function Ff() {
	$.workspaceAgentsDraft = "", $.workspaceAgentsDirty = !1;
}
async function If(e, t, n = {}) {
	let r = n.workspaceId || $.activeWorkspaceId, i = n.requestVersion || ++$.previewRequestVersion;
	try {
		let n = await Jd(Bf(e, t, r));
		return r !== $.activeWorkspaceId || i !== $.previewRequestVersion || $.preview?.section !== e || $.preview?.path !== t ? null : ($.preview = {
			section: e,
			...n
		}, $.preview);
	} catch (a) {
		let o = r === $.activeWorkspaceId && i === $.previewRequestVersion && $.preview?.section === e && $.preview?.path === t;
		if (o && ($.preview = {
			section: e,
			path: t,
			error: Yl(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function Lf(e, t) {
	if (!$.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = $.activeWorkspaceId, r = $.navigationVersion, i = await Jd(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!df(n, r) || $.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return $.workspaceAgents = i, $.workspaceAgentsDraft = Pf(i.content || ""), $.workspaceAgentsDirty = !1, i;
}
function Rf() {
	$.previewRequestVersion++, $.preview = null, lf();
}
function zf() {
	$.diffRequestVersion++, $.diff = null, lf();
}
function Bf(e, t, n = $.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
async function Vf() {
	if (!$.activeWorkspaceId) {
		Zf();
		return;
	}
	$.agentRunProjectionVersion = (Number($.agentRunProjectionVersion) || 0) + 1;
	let e = $.agentRunProjectionVersion, t = await Yf();
	return !(e !== $.agentRunProjectionVersion || !$.activeWorkspaceId || ($.agent.runs = t, Ud($.agent.runs), Uf($.agent.runs), $.agent.activeRunId || ($.agent.historyBeforeId = 0), e !== $.agentRunProjectionVersion));
}
async function Hf() {
	if (!$.activeWorkspaceId) return;
	$.agentRunProjectionVersion = (Number($.agentRunProjectionVersion) || 0) + 1;
	let e = $.agentRunProjectionVersion, t = $.activeWorkspaceId, n = await Yf();
	return !(e !== $.agentRunProjectionVersion || $.activeWorkspaceId !== t || ($.agent.runs = n, Ud(n), Uf(n) && (e !== $.agentRunProjectionVersion || $.activeWorkspaceId !== t)));
}
function Uf(e) {
	let t = Wf(e);
	if ($.agent.activeRunId === t) {
		let n = e.find((e) => e.id === t);
		return n && sd(n), !1;
	}
	od(), $.agent.activeRunId = t, $.agent.events = [], $.agent.notices = [], $.agent.eventsHasMore = !1, $.agent.historyBeforeId = 0, ad();
	let n = e.find((e) => e.id === t);
	return n && sd(n), $.agent.approvalDrafts.clear(), !0;
}
function Wf(e) {
	return e.some((e) => e.id === $.agent.activeRunId) ? $.agent.activeRunId : e[0]?.id || "";
}
async function Gf(e = $.activeWorkspaceId) {
	let t = ++$.treeRequestVersion, n = $.navigationVersion, r = await Jd(`/api/workspaces/${e}/tree`);
	return df(e, n, t) ? r : null;
}
async function Kf() {
	if (!$.activeWorkspaceId || !$.tree) return;
	let e = await Gf($.activeWorkspaceId);
	e && ($.tree = e);
}
async function qf(e, t) {
	!e || $.activeWorkspaceId !== e || (await Promise.all([
		Vf(),
		Kf(),
		t && t !== "workspace" ? Qd(t, e, { logsLimit: _d }).then((t) => {
			$.activeWorkspaceId === e && t && tf(t, "head");
		}) : Promise.resolve()
	]), $.activeWorkspaceId === e && lf());
}
async function Jf(e) {
	$.agentSessionMutationCount++, $.autoRefreshVersion++, $.treeRequestVersion++;
	try {
		return await e();
	} finally {
		$.agentSessionMutationCount--;
	}
}
function Yf() {
	let e = Pp(), t = e ? `?resourceId=${encodeURIComponent(e)}` : "";
	return Jd(`/api/workspaces/${$.activeWorkspaceId}/agent/runs${t}`).then((e) => e.runs || []);
}
async function Xf() {
	od(), Qf(), ld.reset(), $.agent.activeRunId = "", $.agent.events = [], $.agent.notices = [], $.agent.historyBeforeId = 0, ad(), await Vf();
}
function Zf() {
	od(), yp(), Qf(), $.agent.runs = [], $.agentRunProjectionVersion = (Number($.agentRunProjectionVersion) || 0) + 1, $.agent.activeRunId = "", $.agent.events = [], $.agent.notices = [], $.agent.eventsHasMore = !1, $.agent.historyBeforeId = 0, $.agent.loadingOlder = !1, $.agent.optionsOpen = !1, $.agent.agentChooserOpen = !1, $.agent.historyOpen = !1, ad(), ld.reset(), $.agent.toolGroupOpen.clear(), $.agent.approvalDrafts.clear(), $.agent.renderDeferredForSelection = !1, tp();
}
function Qf() {
	$.agent.stream && $.agent.stream.close(), $.agent.stream = null, $.agent.streamRunId = "";
}
function $f(e, t, n) {
	if (e !== $.activeWorkspaceId || t !== $.agent.activeRunId || !n) return;
	let r = $.agent.runs.find((e) => e.id === t) || null;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && Wd(n, r), [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(n.type) && Hf().then(lf).catch((e) => console.warn("agent refresh failed", e));
}
function ep(e, t, n) {}
function tp() {
	$.agent.renderTimer && window.clearTimeout($.agent.renderTimer), $.agent.renderTimer = null;
}
function np(e) {
	if (!window.AgentHubEventTimeline?.buildTimeline) throw Error("AgentHub Event Timeline library is unavailable");
	let t = (e || []).filter((e) => !vd.has(e?.type)), n = window.AgentHubEventTimeline.buildTimeline(t), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function rp() {
	let e = Dp();
	ed.renderSessionSwitcher({
		identity: `${$.activeWorkspaceId}:${Pp()}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: Pp(),
		activeRunId: e?.id || "",
		runs: $.agent.runs,
		switchingRunId: ld.key("session-switch"),
		onSelect: wp,
		onToast: om,
		onIconsChanged: sm
	});
}
function ip(e) {
	if (!e) return "";
	let t = [ap(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function ap(e) {
	return ($.config?.agentHubProviders || Id.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function op(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function sp(e = {}) {
	lp();
	let t = Dp(), n = ($.config?.agents || []).find((e) => e.id === t?.agentHubAgentName);
	ed.renderEventTimeline({
		identity: `${$.activeWorkspaceId}:${t?.id || ""}`,
		workspaceId: $.activeWorkspaceId,
		activeRunId: t?.id || "",
		activeRun: t,
		runCount: $.agent.runs.length,
		agentName: fp(n || Qp()),
		project: np,
		onEvent: $f,
		onNotice: ep,
		onApproval: Ep,
		onToast: om,
		onIconsChanged: sm
	});
}
function cp(e, t) {
	return `${e || "workspace"}:${t || "run"}`;
}
function lp(e = {}) {
	$.agent.skipTTYDraftSync = !1;
	let t = Dp();
	t && sd(t);
	let n = Op(t), r = t?.resourceId || Pp(), i = Ap(t), a = jp(t) || t?.status === "stopping";
	ed.renderComposer({
		identity: `${$.activeWorkspaceId}:${r}:${t?.id || "none"}:${$.agent.ttyDraftKey || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: r,
		runId: t?.id || "",
		runStatus: t?.status || "",
		live: n,
		canResume: !!(t && !n && (t.agentHubSessionId || t.sourceExternalId)),
		draft: $.agent.ttyDraft || "",
		draftKey: $.agent.ttyDraftKey || "",
		draftResetVersion: $.agent.ttyDraftResetVersion || 0,
		unavailableReason: n && t ? dp(t, up(t)) : "",
		sending: !!(t && ld.isSending(cp($.activeWorkspaceId, t.id))),
		agents: Ld(),
		selectedAgentId: Qp()?.id || "",
		chooserOpen: !!$.agent.agentChooserOpen,
		sessionStarting: ld.active("session-start"),
		actionsOpen: !!$.agent.sessionActionsOpen,
		canEndTurn: !!(t && (kp(t) || i)),
		endingTurn: i,
		closingSession: a,
		onDraft: (e, t) => mp(e, t),
		onSend: Mp,
		onOpenUpload: _p,
		onToggleChooser: () => {
			ld.active("session-start") || !$p().length || ($.agent.agentChooserOpen = !$.agent.agentChooserOpen, lp());
		},
		onChooseAgent: (e) => gp(e).catch((e) => om(e.message)),
		onToggleActions: () => {
			$.agent.sessionActionsOpen = !$.agent.sessionActionsOpen, lp();
		},
		onResume: () => Tp().catch((e) => om(e.message)),
		onEndTurn: () => Cp().catch((e) => om(e.message)),
		onCloseSession: hp,
		onIconsChanged: sm
	});
}
function up(e) {
	return !e || !Op(e) ? !1 : e.status !== "starting" || $.agent.events.some((e) => e.type === "session.state" && e.data?.state === "ready") ? !0 : $.agent.eventsHasMore && e.status !== "starting";
}
function dp(e, t = up(e)) {
	return Ap(e) ? "Ending the current turn." : t ? e.status === "stopping" ? "AgentHub is stopping the provider." : e.status === "recovering" ? "AgentHub event recovery is in progress." : e.status === "waiting_approval" ? "Resolve the pending approval before sending input." : "" : "Agent session is starting.";
}
function fp(e) {
	return e?.name || e?.id || "Agent";
}
function pp() {
	Id.render();
}
function mp(e, t) {
	!t || t.workspaceId !== $.activeWorkspaceId || t.runId !== $.agent.activeRunId || t.draftKey !== $.agent.ttyDraftKey || cd(e);
}
function hp() {
	Sp().catch((e) => om(e.message));
}
async function gp(e = "") {
	return ud.start(e);
}
function _p() {
	let e = Dp();
	if (!e || !Op(e)) {
		om("Start or resume an agent session before uploading files.");
		return;
	}
	let t = hd("ttyInput");
	t && cd(t.value), $.modalEnter = "upload", $.uploadDialog = {
		open: !0,
		identity: ++Fd,
		runId: e.id,
		items: [],
		nextId: 1
	}, xp();
}
function vp(e = [], t = {}) {
	if (!$.uploadDialog.open) return;
	let n = t.workspaceId === $.activeWorkspaceId && t.runId === $.agent.activeRunId, r = e.length > 0 && n && $.uploadDialog.runId === $.agent.activeRunId;
	r && (cd(bp($.agent.ttyDraft, e)), $.agent.ttyDraftResetVersion++), yp();
	let i = hd("ttyComposer");
	i && delete i.dataset.composerKey, lp({ skipDraftSync: r }), hd("ttyInput")?.focus({ preventScroll: !0 }), sm();
}
function yp() {
	$.uploadDialog = {
		open: !1,
		identity: ++Fd,
		runId: "",
		items: [],
		nextId: 1
	}, xp();
}
function bp(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function xp() {
	let e = $.uploadDialog;
	ed.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${$.activeWorkspaceId}:${e.runId || ""}`,
		workspaceId: $.activeWorkspaceId,
		runId: e.runId || "",
		onDone: vp,
		onIconsChanged: sm
	});
}
async function Sp() {
	return ud.stopSession();
}
async function Cp() {
	return ud.stopTurn();
}
async function wp(e) {
	return ud.switchRun(e);
}
async function Tp() {
	return ud.resume();
}
async function Ep(e, t, n) {
	return ud.resolveApproval(e, t, n);
}
function Dp() {
	return $.agent.runs.find((e) => e.id === $.agent.activeRunId) || null;
}
function Op(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(e?.status || "");
}
function kp(e) {
	return ["running", "waiting_approval"].includes(e?.status || "");
}
function Ap(e) {
	return ld.active("turn-stop") && ld.key("turn-stop") === e?.id;
}
function jp(e) {
	return ld.active("session-stop") && ld.key("session-stop") === e?.id;
}
async function Mp(e, t) {
	return ud.send(e, t);
}
function Np() {
	let e = Hp($.selectedId);
	return e && e.path || "";
}
function Pp() {
	return $.selectedId === "workspace" ? "workspace" : Hp($.selectedId)?.id || "";
}
function Fp(e) {
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
function Ip() {
	Rp("project");
}
function Lp(e) {
	Rp("task", e);
}
function Rp(e, t = "") {
	md.open(e === "task" ? "task" : "project", t);
}
function zp() {
	md.close();
}
function Bp() {
	md.render();
}
async function Vp(e) {
	confirm(`Archive ${e}?`) && (await Jd(`/api/workspaces/${$.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	}), om("Archived."), $.selectedId = "workspace", await Xd());
}
function Hp(e) {
	if (!$.tree) return null;
	for (let t of $.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function Up() {
	return $.selectedId === "workspace" || Hp($.selectedId) ? !1 : ($.selectedId = "workspace", !0);
}
function Wp(e) {
	if (!$.tree) return null;
	for (let t of $.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function Gp(e) {
	return $.expandedProjects.has(e);
}
function Kp(e = !1) {
	let t = Wp($.selectedId);
	!t || t.id === $.selectedId || $.expandedProjects.has(t.id) || ($.expandedProjects.add(t.id), e && of().catch((e) => om(e.message)));
}
function qp(e = window.location.pathname) {
	return fd.parse(e);
}
function Jp(e) {
	return !!(e && $.config?.workspaces.some((t) => t.id === e));
}
function Yp(e = {}) {
	fd.project($.activeWorkspaceId, $.selectedId, e);
}
function Xp() {
	return $.config?.workspaces.find((e) => e.id === $.activeWorkspaceId)?.name || "Workspace";
}
function Zp() {
	let e = $p(), t = em();
	e.some((e) => e.id === $.agent.agentName) || ($.agent.agentName = t);
}
function Qp() {
	let e = $p(), t = $.agent.agentName || em();
	return e.find((e) => e.id === t) || e[0] || null;
}
function $p() {
	return ($.config?.agents || []).filter((e) => e.available !== !1);
}
function em() {
	let e = $p();
	return tm($.config?.agentProfiles, "default") || tm(Id.profiles(), "default") || e[0]?.id || "";
}
function tm(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function nm(e = "workspace") {
	return Id.open(e);
}
function rm(e, t) {
	return Id.withAgentHubCatalog(e, t);
}
function im(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var am = 0;
function om(e) {
	ed.renderToast({
		message: String(e || ""),
		revision: ++am
	});
}
function sm() {
	let e = window.lucide;
	!e || $.iconRefreshScheduled || ($.iconRefreshScheduled = !0, td?.animationFrame(() => {
		$.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function cm(e) {
	sm(), e === "markdown" && window.marked && window.DOMPurify && (jf(), sm()), e === "diff" && jf();
}
window.forgeAssetLoaded = cm;
function lm() {
	dd.initialize();
}
function um(e, t) {
	dd.previewPane(e, t);
}
function dm(e) {
	dd.commitPane(e);
}
function fm() {
	dd.syncViewport();
}
function pm(e) {
	dd.setMobileSidebar(e);
}
function mm(e) {
	dd.setMobileView(e);
}
function hm(e) {
	dd.setMobileImmersive(e);
}
function gm() {
	td?.listen(document, "selectionchange", () => {
		if (!$.agent.renderDeferredForSelection) return;
		let e = hd("ttyLog");
		e && op(e) || ($.agent.renderDeferredForSelection = !1, sp(), sm());
	}), td?.listen(document, "keydown", (e) => {
		e.key === "Escape" && $.diff ? zf() : e.key === "Escape" && $.preview ? Rf() : e.key === "Escape" && ($.agent.optionsOpen || $.agent.agentChooserOpen || $.agent.historyOpen) && ($.agent.optionsOpen = !1, $.agent.agentChooserOpen = !1, $.agent.historyOpen = !1, rp(), lp(), sm());
	}), td?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Mf(n.dataset.breadcrumbResource || "workspace").catch((e) => om(Yl(e)));
			return;
		}
		let r = $.agent.agentChooserOpen && t && !t.closest(".tty-new-session-control"), i = ($.agent.optionsOpen || $.agent.historyOpen) && t && !t.closest(".agent-actions") && !t.closest(".agent-sessions") && !t.closest(".tty-composer");
		(r || i) && ($.agent.optionsOpen = !1, $.agent.agentChooserOpen = !1, $.agent.historyOpen = !1, rp(), lp(), sm()), $.sessionMenu && (t?.closest(".session-row") || t?.closest(".session-resource-menu") || ($.sessionMenu = null, Cf(), sm()));
	}), td?.listen(window, "beforeunload", ym), td?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && ym();
	});
}
var _m = !1;
function vm(e) {
	if (ed = e, _m) {
		Rd();
		return;
	}
	_m = !0;
	let t = new $u();
	td = t, zd = vu({
		scope: t,
		selectedResourceId: () => $.selectedId,
		treeSessions: () => $.tree?.sessions || [],
		agentRuns: () => $.agent.runs,
		hasTree: () => !!$.tree,
		findResource: Hp,
		sessionNavigationTarget: Ef,
		selectResource: xf,
		activateRun: (e) => {
			let t = $.agent.runs.find((t) => t.id === e);
			t && ($.agent.activeRunId = t.id, rp(), sp(), sm());
		},
		notificationsSettingsVisible: () => Id.isOpenTab("notifications"),
		renderSettings: pp,
		renderSessions: Cf,
		refreshIcons: sm,
		flushDraft: ym
	}), Bd = Qu(t, () => {
		Id.isOpenTab("user") && pp();
	}), gm(), lm(), zd.install(), vf(), Yd().catch((e) => {
		$.navigationLoading = !1, $.navigationError = e.message, om(e.message), lf();
	}), sf();
}
function ym() {
	od();
}
function bm() {
	_m && (ym(), _m = !1, Qf(), zd?.dispose(), zd = null, Bd = null, ld.reset(), tp(), md.dispose(), td?.dispose(), td = null, $.autoRefreshTimer = null);
}
async function xm(e) {
	let t = qp(e);
	if (!Jp(t.workspaceId)) {
		Yp({ replace: !0 });
		return;
	}
	let n = $.activeWorkspaceId !== t.workspaceId, r = $.selectedId;
	od(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, $.workspaceAgentsSaving = !1;
	let i = $.navigationVersion;
	if ($.activeWorkspaceId = t.workspaceId || "", $.selectedId = t.resourceId || "workspace", !n && r !== $.selectedId && $.selectedId !== "workspace" && ($d($.selectedId), delete $.details[$.selectedId]), $.preview = null, $.diff = null, $.sessionMenu = null, n && ($.tree = null, $.navigationLoading = !0, $.navigationError = "", Ff(), $.workspaceAgentsSaving = !1, zp(), Vd($.activeWorkspaceId)), n && Zf(), hf(), n) {
		if (!await af(t.workspaceId || "", i)) return;
		!t.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await Xd({ updateURL: !1 }), df(t.workspaceId || "", i) && Yp({ replace: !0 });
	} else {
		let e = Up();
		if ($.selectedId === "workspace" ? await rf() : (Kp(!1), await Zd($.selectedId)), !df(t.workspaceId || "", i)) return;
		r !== $.selectedId && await Xf(), lf(), e && Yp({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var Sm = Rl(), Cm = {
	renderAppShell: Sm.appShell.publish,
	renderCreateDialog: Sm.create.publish,
	renderSettings: Sm.settings.publish,
	renderUploadDialog: Sm.upload.publish,
	renderComposer: Sm.composer.publish,
	renderSessionSwitcher: Sm.sessions.publish,
	renderEventTimeline: Sm.timeline.publish,
	renderDetailPanel: Sm.detail.publish,
	renderToast: Sm.toast.publish
}, wm = null;
async function Tm() {
	if (wm) return;
	let e = document.getElementById("app");
	if (!e) throw Error("Forge application root is unavailable.");
	e.dataset.componentOwner = "app-shell", wm = kr(Fl, {
		target: e,
		props: { channels: Sm }
	}), vm(Cm);
}
async function Em() {
	if (bm(), !wm) return;
	let e = wm;
	wm = null, await Nr(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void Em()), window.addEventListener("pageshow", (e) => {
	e.persisted && Tm();
}), Tm().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
