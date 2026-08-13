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
var Pe;
function Fe(e) {
	if (e === null) throw Ae(), we;
	return Pe = e;
}
function Ie() {
	return Fe(/* @__PURE__ */ un(Pe));
}
function O(e) {
	if (D) {
		if (/* @__PURE__ */ un(Pe) !== null) throw Ae(), we;
		Pe = e;
	}
}
function k(e = 1) {
	if (D) {
		for (var t = e, n = Pe; t--;) n = /* @__PURE__ */ un(n);
		Pe = n;
	}
}
function Le(e = !0) {
	for (var t = 0, n = Pe;;) {
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
	if (!e || e.nodeType !== 8) throw Ae(), we;
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
	if (t === null) return B.f |= te, e;
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
	D && /* @__PURE__ */ ln(e) !== null && dn(e);
}
var at = !1;
function ot() {
	at || (at = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[le]?.();
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
	let i = e[le];
	e[le] = i ? () => {
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
	#t = D ? Pe : null;
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
			if (D) {
				let e = this.#t;
				Ie();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ut), D && (this.#e = Pe);
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
		this.#a &&= (jn(this.#a), null), this.#o &&= (jn(this.#o), null), this.#s &&= (jn(this.#s), null), D && (Fe(this.#t), k(), Fe(Le()));
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
		v: Te,
		wv: 0,
		parent: V,
		ac: null
	};
}
var vt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function yt(e, t, n) {
	let r = V;
	r === null && pe();
	var i = void 0, a = qt(Te), o = !B, s = /* @__PURE__ */ new Set();
	return wn(() => {
		var t = V, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ue && n.reject(e);
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
			l?.(), s.delete(n), t !== vt && (c.activate(), t ? (a.f |= te, Yt(a, t)) : (a.f & 8388608 && (a.f ^= te), Yt(a, e)), c.deactivate());
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
	if (!Vn && r !== null && e.v !== Te && r.f & 24576) return ke(), e.v;
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
		t.ac.abort(ue), t.ac = null;
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
		e.v !== Te && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Ot?.set(e, t)), this.is_fork || (e.v = t);
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
		ve();
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
	return B !== null && (!Un || B.f & 131072) && We() && B.f & 4325394 && (Kn === null || !Kn.has(e)) && Se(), Yt(e, n ? $t(t) : t, Nt);
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
	if (typeof t != "object" || !t || ne in t) return t;
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
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && be();
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
					let e = f(() => /* @__PURE__ */ P(Te, u));
					r.set(t, e), Zt(o);
				}
			} else F(n, Te), Zt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === ne) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ P($t(s ? e[n] : Te), u)), r.set(n, o)), o !== void 0) {
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
			return (n !== void 0 || V !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ P(i ? $t(e[t]) : Te, u)), r.set(t, n)), H(n) === Te) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ P(Te, u)), r.set(d + "", p)) : F(p, Te);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ P(void 0, u)), F(c, $t(n)), r.set(t, c));
			else {
				l = c.v !== Te;
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
function en(e) {
	try {
		if (typeof e == "object" && e && ne in e) return e[ne];
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
		an = a(t, "firstChild").get, on = a(t, "nextSibling").get, u(e) && (e[oe] = void 0, e[ae] = null, e[se] = void 0, e.__e = void 0), u(n) && (n[ce] = void 0);
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
	if (!D) return /* @__PURE__ */ ln(e);
	var n = /* @__PURE__ */ ln(Pe);
	if (n === null) n = Pe.appendChild(cn());
	else if (t && n.nodeType !== 3) {
		var r = cn();
		return n?.before(r), Fe(r), r;
	}
	return t && mn(n), Fe(n), n;
}
function L(e, t = !1) {
	if (!D) {
		var n = /* @__PURE__ */ ln(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ un(n) : n;
	}
	if (t) {
		if (Pe?.nodeType !== 3) {
			var r = cn();
			return Pe?.before(r), Fe(r), r;
		}
		mn(Pe);
	}
	return Pe;
}
function R(e, t = 1, n = !1) {
	let r = D ? Pe : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ un(r);
	if (!D) return r;
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
	return _n(ee | S, e);
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
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= E;
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
		return e.f & 8388608 && (e.f ^= te), d;
	} catch (e) {
		return Ye(e);
	} finally {
		e.f ^= E, Jn = t, Yn = n, Xn = r, B = i, Kn = a, Ue(o), Un = s, er = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== Te && $e(s), s.ac !== null && st(() => {
			s.ac.abort(ue), s.ac = null, Qe(s, h);
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
	if (e.v === Te) return !0;
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
function pr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (ne in e) mr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && ne in n && mr(n);
		}
	}
}
function mr(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			mr(e[n], t);
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
var hr = ["touchstart", "touchmove"];
function gr(e) {
	return hr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var _r = Symbol("events"), vr = /* @__PURE__ */ new Set(), yr = /* @__PURE__ */ new Set();
function br(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || wr.call(t, e), !e.cancelBubble) return st(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qe(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function xr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = br(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && yn(() => {
		t.removeEventListener(e, o, a);
	});
}
function U(e, t, n) {
	(t[_r] ??= {})[e] = n;
}
function Sr(e) {
	for (var t = 0; t < e.length; t++) vr.add(e[t]);
	for (var n of yr) n(e);
}
var Cr = null;
function wr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	Cr = e;
	var s = 0, c = Cr === e && e[_r];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[_r] = t;
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
					var h = o[_r]?.[r];
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
			e[_r] = t, delete e.currentTarget, Wn(d), Gn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Tr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Er(e) {
	return Tr?.createHTML(e) ?? e;
}
function Dr(e) {
	var t = pn("template");
	return t.innerHTML = Er(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Or(e, t) {
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
		if (D) return Or(Pe, null), Pe;
		i === void 0 && (i = Dr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ ln(i)));
		var t = r || rn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ ln(t), s = t.lastChild;
			Or(o, s);
		} else Or(t, t);
		return t;
	};
}
function kr(e = "") {
	if (!D) {
		var t = cn(e + "");
		return Or(t, t), t;
	}
	var n = Pe;
	return n.nodeType === 3 ? mn(n) : (n.before(n = cn()), Fe(n)), Or(n, n), n;
}
function Ar() {
	if (D) return Or(Pe, null), Pe;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = cn();
	return e.append(t, n), Or(t, n), e;
}
function G(e, t) {
	if (D) {
		var n = V;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = Pe), Ie();
		return;
	}
	e !== null && e.before(t);
}
function K(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ce] ??= e.nodeValue) && (e[ce] = n, e.nodeValue = `${n}`);
}
function jr(e, t) {
	return Nr(e, t);
}
var Mr = /* @__PURE__ */ new Map();
function Nr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	sn();
	var l = void 0, u = Sn(() => {
		var s = n ?? t.appendChild(cn());
		dt(s, { pending: () => {} }, (t) => {
			A({});
			var n = He;
			if (o && (n.c = o), a && (i.$$events = a), D && Or(t, null), l = e(t, i) || {}, D && (V.nodes.end = Pe, Pe === null || Pe.nodeType !== 8 || Pe.data !== "]")) throw Ae(), we;
			j();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = gr(r);
					for (let e of [t, document]) {
						var a = Mr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Mr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, wr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(vr)), yr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Mr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, wr), r.delete(e), r.size === 0 && Mr.delete(n)) : r.set(e, i);
			}
			yr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Pr.set(l, u), l;
}
var Pr = /* @__PURE__ */ new WeakMap();
function Fr(e, t) {
	let n = Pr.get(e);
	return n ? (Pr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Ir = class {
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
		} else D && (this.anchor = Pe), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function q(e, t, n = !1) {
	var r;
	D && (r = Pe, Ie());
	var i = new Ir(e), a = n ? x : 0;
	function o(e, t) {
		if (D) {
			var n = Re(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Le();
				Fe(a), i.anchor = a, Ne(!1), i.ensure(e, t), Ne(!0);
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
var Lr = Symbol("NaN");
function Rr(e, t, n) {
	D && Ie();
	var r = new Ir(e), i = !We();
	En(() => {
		var e = t();
		e !== e && (e = Lr), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function zr(e, t) {
	return t;
}
function Br(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Pn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Vr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
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
		Vr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Vr(e, t, n = !0) {
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
var Hr;
function J(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = D ? Fe(/* @__PURE__ */ ln(u)) : u.appendChild(cn());
	}
	D && Ie();
	var d = null, f = /* @__PURE__ */ bt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Wr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Kr(d, null, c)) : In(d) : Pn(d, () => {
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
			D && Re(c) === "[!" != (e === 0) && (c = Le(), Fe(c), Ne(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = N, v = fn(), y = 0; y < e; y += 1) {
				D && Pe.nodeType === 8 && Pe.data === "]" && (c = Pe, t = !0, Ne(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Yt(S.v, b), S.i && Yt(S.i, y), v && u.unskip_effect(S.e)) : (S = Gr(l, h ? c : Hr ??= cn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Dn(() => s(c)) : (d = Dn(() => s(Hr ??= cn())), d.f |= w)), e > r.size && me("", "", ""), D && e > 0 && Fe(Le()), !h) {
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
	h = !1, D && (c = Pe);
}
function Ur(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Wr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Ur(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (In(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Kr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), qr(e, d, _), qr(e, _, y), Kr(_, y, n), d = _, p = [], m = [], l = Ur(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Kr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					qr(e, S.prev, C.next), qr(e, d, S), qr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Kr(_, l, n), qr(e, _.prev, _.next), qr(e, _, d === null ? e.effect.first : d.next), qr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Ur(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Ur(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Vr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Ur(l.next);
		var E = T.length;
		if (E > 0) {
			var ee = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Br(e, T, ee);
		}
	}
	o && qe(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Gr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? qt(n) : /* @__PURE__ */ Jt(n, !1, !1) : null, l = o & 2 ? qt(i) : null;
	return {
		v: c,
		i: l,
		e: Dn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Kr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ un(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function qr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Jr(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		D && (o = Fe(/* @__PURE__ */ ln(c)));
	}
	z(() => {
		var e = V;
		if (s === (s = t() ?? "")) {
			D && Ie();
			return;
		}
		if (n && !D) {
			e.nodes = null, c.innerHTML = s, s !== "" && Or(/* @__PURE__ */ ln(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Mn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (D) {
				for (var a = Pe.data, l = Ie(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ un(l);
				if (l === null) throw Ae(), we;
				Or(Pe, u), o = Fe(l);
				return;
			}
			var d = pn(r ? "svg" : i ? "math" : "template", r ? De : i ? Oe : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Or(/* @__PURE__ */ ln(f), f.lastChild), r || i) for (; /* @__PURE__ */ ln(f);) o.before(/* @__PURE__ */ ln(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function Yr(e, t, ...n) {
	var r = new Ir(e);
	En(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, x);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/actions.js
function Xr(e, t, n) {
	Cn(() => {
		var r = fr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			Tn(() => {
				var e = n();
				pr(e), i && Be(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Zr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Zr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Qr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Zr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function $r(e) {
	return typeof e == "object" ? Qr(e) : e ?? "";
}
var ei = [..." 	\n\r\f\xA0\v﻿"];
function ti(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || ei.includes(r[o - 1])) && (s === r.length || ei.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ni(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function ri(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function ii(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(ri)), i && c.push(...Object.keys(i).map(ri));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = ri(e.substring(l, u).trim());
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
		return r && (n += ni(r)), i && (n += ni(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function ai(e, t, n, r, i, a) {
	var o = e[oe];
	if (D || o !== n || o === void 0) {
		var s = ti(n, r, a);
		(!D || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[oe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function oi(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function si(e, t, n, r) {
	var i = e[se];
	if (D || i !== t) {
		var a = ii(t, r);
		(!D || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[se] = t;
	} else r && (Array.isArray(r) ? (oi(e, n?.[0], r[0]), oi(e, n?.[1], r[1], "important")) : oi(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ci(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return je();
		for (var i of t.options) i.selected = n.includes(di(i));
		return;
	}
	for (i of t.options) if (tn(di(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function li(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ci(e, e.__value);
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
function ui(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	ct(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), di);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && di(o);
		}
		n(a), e.__value = a, N !== null && r.add(N);
	}), Cn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = N;
			if (r.has(o)) return;
		}
		if (ci(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = di(s), n(a));
		}
		e.__value = a, i = !1;
	}), li(e);
}
function di(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var fi = Symbol("is custom element"), pi = Symbol("is html"), mi = de ? "link" : "LINK", hi = de ? "progress" : "PROGRESS";
function gi(e) {
	if (D) {
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
		e[le] = n, qe(n), ot();
	}
}
function _i(e, t) {
	var n = yi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === hi) && (e.value = t ?? "");
}
function vi(e, t) {
	var n = yi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Y(e, t, n, r) {
	var i = yi(e);
	D && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === mi) || i[t] !== (i[t] = n) && (t === "loading" && (e[ie] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && xi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function yi(e) {
	return e[ae] ??= {
		[fi]: e.nodeName.includes("-"),
		[pi]: e.namespaceURI === Ee
	};
}
var bi = /* @__PURE__ */ new Map();
function xi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = bi.get(t);
	if (n) return n;
	bi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Si(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ct(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = wi(e) ? Ti(a) : a, n(a), N !== null && r.add(N), await lr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (D && e.defaultValue !== e.value || fr(t) == null && e.value) && (n(wi(e) ? Ti(e.value) : e.value), N !== null && r.add(N)), Tn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = N;
			if (r.has(i)) return;
		}
		wi(e) && n === Ti(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function Ci(e, t, n = t) {
	ct(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (D && e.defaultChecked !== e.checked || fr(t) == null) && n(e.checked), Tn(() => {
		e.checked = !!t();
	});
}
function wi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Ti(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ei(e, t) {
	return e === t || e?.[ne] === t;
}
function Di(e = {}, t, n, r) {
	var i = He.r, a = V;
	return Cn(() => {
		var o, s;
		return Tn(() => {
			o = s, s = r?.() || [], fr(() => {
				Ei(n(...s), e) || (t(e, ...s), o && Ei(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Ei(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Oi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ _t(r), H(u)) : (l && (l = !1, c = s ? fr(r) : r), c);
	let f;
	if (o) {
		var p = ne in e || re in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = rt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ye(t), f(m)));
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
function ki(e) {
	He === null && fe("onMount"), bn(() => {
		let t = fr(e);
		if (typeof t == "function") return t;
	});
}
function Ai(e) {
	He === null && fe("onDestroy"), ki(() => () => fr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/components/Icon.svelte
var ji = /* @__PURE__ */ W("<i></i>");
function X(e, t) {
	let n = Oi(t, "className", 3, "");
	var r = ji();
	z(() => {
		Y(r, "data-lucide", t.name), ai(r, 1, $r(n()));
	}), G(e, r);
}
//#endregion
//#region src/components/StatusPresentation.svelte
var Mi = /* @__PURE__ */ W("<span><!></span>"), Ni = /* @__PURE__ */ W("<span data-component-owner=\"status-presentation\" aria-hidden=\"true\"></span>");
function Pi(e, t) {
	A(t, !0);
	let n = Oi(t, "className", 3, "");
	var r = Ar(), i = L(r), a = (e) => {
		var r = Ni();
		J(r, 21, () => t.status.statuses, (e) => e.key, (e, t) => {
			var n = Mi();
			X(I(n), {
				get name() {
					return H(t).iconName;
				},
				className: "task-status-icon"
			}), O(n), z(() => ai(n, 1, `task-status-indicator ${H(t).className} ${H(t).recentOutput ? "task-status-fresh" : ""}`)), G(e, n);
		}), O(r), z(() => ai(r, 1, `task-status-slot ${n()} ${t.status.slotClassName}`)), G(e, r);
	};
	q(i, (e) => {
		t.status.hasTaskState && e(a);
	}), G(e, r), j();
}
//#endregion
//#region src/components/AttentionList.svelte
var Fi = /* @__PURE__ */ W("<div class=\"activity-row empty-attention\"><!><div><strong>No activity</strong><span>Follow a resource or start a turn.</span></div></div>"), Ii = /* @__PURE__ */ W("<span role=\"button\" tabindex=\"0\"><!></span>"), Li = /* @__PURE__ */ W("<button type=\"button\"><span class=\"activity-status\" aria-hidden=\"true\"><span class=\"activity-status-fallback-slot\"><!></span> <span class=\"activity-status-runtime-slot\"><!></span></span> <span class=\"activity-title\"><strong> </strong><span class=\"activity-meta\"> </span></span> <span class=\"activity-badge\"> </span> <span class=\"activity-actions\"><!> <span class=\"attention-dismiss\" role=\"button\" tabindex=\"0\" title=\"Dismiss\"><!></span></span></button>"), Ri = /* @__PURE__ */ W("<section class=\"attention-section\" data-component-owner=\"attention-list\"><div class=\"section-title\"><span>Activity</span></div> <nav class=\"attention-list\" aria-label=\"Activity list\"><!></nav></section>");
function zi(e, t) {
	A(t, !0);
	function n(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function r(e) {
		return e.type === "project" ? "folder" : e.type === "task" ? "file-text" : e.type === "scheduler" ? "calendar-clock" : "home";
	}
	function i(e) {
		return e.type === "project" ? "Project" : e.type === "task" ? "Task" : e.type === "scheduler" ? "Scheduler" : "Workspace";
	}
	function a(e) {
		return e.type === "project" || e.type === "task";
	}
	function o(e) {
		return [
			e.ref || e.id,
			e.agentName ? `Agent ${e.agentName}` : "",
			e.turnNumber > 0 ? `Turn ${e.turnNumber}` : "No turns",
			e.statusLabel
		].filter(Boolean).join(" · ");
	}
	async function s(e) {
		try {
			await t.onSelect(e.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function c(e, n) {
		e.preventDefault(), e.stopPropagation();
		try {
			await t.onToggleAttention(n.id, !n.followed);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function l(e, n) {
		e.preventDefault(), e.stopPropagation();
		try {
			await t.onDismiss(n.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function u(e, t) {
		(e.key === "Enter" || e.key === " ") && t(e);
	}
	var d = Ri(), f = R(I(d), 2), p = I(f), m = (e) => {
		var t = Fi();
		X(I(t), { name: "message-square" }), k(), O(t), G(e, t);
	}, h = (e) => {
		var d = Ar();
		J(L(d), 17, () => t.items, (e) => e.id, (e, t) => {
			var d = Li(), f = I(d), p = I(f), m = I(p);
			{
				let e = /* @__PURE__ */ M(() => r(H(t)));
				X(m, {
					get name() {
						return H(e);
					},
					className: "activity-status-fallback"
				});
			}
			O(p);
			var h = R(p, 2);
			Pi(I(h), {
				get status() {
					return H(t).status;
				},
				className: "activity-status-icon"
			}), O(h), O(f);
			var g = R(f, 2), _ = I(g), v = I(_, !0);
			O(_);
			var y = R(_), b = I(y, !0);
			O(y), O(g);
			var x = R(g, 2), S = I(x, !0);
			O(x);
			var C = R(x, 2), w = I(C), T = (e) => {
				var n = Ii();
				let r;
				X(I(n), { name: "star" }), O(n), z(() => {
					r = ai(n, 1, "attention-star", null, r, { followed: H(t).followed }), Y(n, "aria-label", H(t).followed ? `Unfollow ${H(t).title}` : `Follow ${H(t).title}`), Y(n, "title", H(t).followed ? "Unfollow" : "Follow");
				}), U("click", n, (e) => c(e, H(t))), U("keydown", n, (e) => u(e, (e) => c(e, H(t)))), G(e, n);
			}, E = /* @__PURE__ */ M(() => a(H(t)));
			q(w, (e) => {
				H(E) && e(T);
			});
			var ee = R(w, 2);
			X(I(ee), { name: "x" }), O(ee), O(C), O(d), z((e, n, r, i) => {
				ai(d, 1, e), Y(d, "aria-current", H(t).selected ? "page" : void 0), Y(d, "data-active-turn", H(t).activeTurn || void 0), Y(d, "aria-label", n), Y(d, "title", H(t).statusLabel || void 0), Y(p, "hidden", H(t).status.hasTaskState), Y(h, "hidden", !H(t).status.hasTaskState), K(v, H(t).title), K(b, r), K(S, i), Y(ee, "aria-label", `Dismiss ${H(t).title}`);
			}, [
				() => `activity-row ${n(H(t).status)} ${H(t).selected ? "selected" : ""}`,
				() => `${H(t).title}. ${o(H(t))}`,
				() => o(H(t)),
				() => i(H(t))
			]), U("click", d, () => s(H(t))), U("click", ee, (e) => l(e, H(t))), U("keydown", ee, (e) => u(e, (e) => l(e, H(t)))), G(e, d);
		}), G(e, d);
	};
	q(p, (e) => {
		t.items.length === 0 ? e(m) : e(h, -1);
	}), O(f), O(d), G(e, d), j();
}
Sr(["click", "keydown"]);
//#endregion
//#region src/components/LayoutSwitcher.svelte
var Bi = /* @__PURE__ */ W("<button type=\"button\" data-component-owner=\"layout-switcher\"><!></button>");
function Vi(e, t) {
	let n = Oi(t, "tone", 3, "light"), r = {
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
	var a = Bi();
	X(I(a), { get name() {
		return r[t.preference];
	} }), O(a), z(() => {
		ai(a, 1, `layout-switcher ${n()}`), Y(a, "title", `Layout: ${i[t.preference]}`), Y(a, "aria-label", `Switch layout (current: ${i[t.preference]})`);
	}), U("click", a, function(...e) {
		t.onCycle?.apply(this, e);
	}), G(e, a);
}
Sr(["click"]);
//#endregion
//#region src/components/MobileToolbar.svelte
var Hi = /* @__PURE__ */ W("<header class=\"mobile-toolbar\" data-component-owner=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" class=\"mobile-icon-button mobile-immersive-button\" type=\"button\" aria-label=\"Toggle immersive chat\"><!></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" data-component-owner=\"mobile-toolbar\" type=\"button\" aria-label=\"Close navigation\"></button>", 1);
function Ui(e, t) {
	A(t, !0);
	var n = Hi(), r = L(n), i = I(r);
	X(I(i), { name: "menu" }), O(i);
	var a = R(i, 2), o = I(a), s = R(o, 2);
	O(a);
	var c = R(a, 2), l = I(c);
	{
		let e = /* @__PURE__ */ M(() => t.immersive ? "minimize-2" : "maximize-2");
		X(l, { get name() {
			return H(e);
		} });
	}
	O(c), O(r);
	var u = R(r, 2);
	z(() => {
		Y(i, "aria-expanded", t.sidebarOpen), Y(o, "aria-selected", t.view === "details"), Y(s, "aria-selected", t.view === "chat"), Y(c, "aria-pressed", t.immersive);
	}), U("click", i, () => t.onSidebar(!t.sidebarOpen)), U("click", o, () => t.onView("details")), U("click", s, () => t.onView("chat")), U("click", c, () => t.onImmersive(!t.immersive)), U("click", u, () => t.onSidebar(!1)), G(e, n), j();
}
Sr(["click"]);
//#endregion
//#region src/components/PaneResizeHandle.svelte
var Wi = /* @__PURE__ */ W("<div data-component-owner=\"pane-resize-handle\" role=\"separator\"></div>");
function Gi(e, t) {
	A(t, !0);
	let n = null;
	Ai(() => n?.());
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
		Y(i, "id", t.id), ai(i, 1, `resize-handle ${t.className}`), Y(i, "aria-orientation", t.kind === "sidebarAttentionHeight" ? "horizontal" : "vertical"), Y(i, "aria-label", t.label);
	}), U("pointerdown", i, r), G(e, i), j();
}
Sr(["pointerdown"]);
//#endregion
//#region src/components/ProjectTree.svelte
var Ki = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), qi = /* @__PURE__ */ W("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Ji = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Yi = /* @__PURE__ */ W("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), Xi = /* @__PURE__ */ W("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Zi = /* @__PURE__ */ W("<div class=\"task-group\"></div>"), Qi = /* @__PURE__ */ W("<button type=\"button\"><span class=\"chevron\"><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), $i = /* @__PURE__ */ W("<section class=\"tree-section\" data-component-owner=\"project-tree\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section>");
function ea(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P($t(t.identity));
	bn(() => {
		t.identity !== H(i) && (F(i, t.identity, !0), d());
	}), Ai(d);
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
	async function p(e, n) {
		e.preventDefault(), e.stopPropagation();
		try {
			await t.onToggleAttention(n.id, !n.followed);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function m(e, t) {
		(e.key === "Enter" || e.key === " ") && p(e, t);
	}
	var h = $i(), g = I(h), _ = R(I(g));
	X(I(_), { name: "plus" }), O(_), O(g);
	var v = R(g, 2), y = I(v), b = (e) => {
		var t = Ki();
		X(I(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), k(2), O(t), G(e, t);
	}, x = (e) => {
		var n = qi(), r = I(n);
		X(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = R(r, 2), a = I(i, !0);
		O(i), O(n), z(() => K(a, t.error)), G(e, n);
	}, S = (e) => {
		var t = Ji();
		X(I(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), k(2), O(t), G(e, t);
	}, C = (e) => {
		var r = Ar();
		J(L(r), 17, () => t.projects, (e) => e.id, (e, t) => {
			var r = Qi(), i = L(r), s = I(i), h = I(s), g = (e) => {
				{
					let n = /* @__PURE__ */ M(() => H(t).expanded ? "chevron-down" : "chevron-right");
					X(e, { get name() {
						return H(n);
					} });
				}
			};
			q(h, (e) => {
				H(t).children.length && e(g);
			}), O(s);
			var _ = R(s, 2);
			Pi(_, { get status() {
				return H(t).status;
			} });
			var v = R(_, 2);
			X(v, {
				name: "folder",
				className: "tree-icon"
			});
			var y = R(v, 2), b = I(y), x = I(b, !0);
			O(b);
			var S = R(b), C = I(S, !0);
			O(S);
			var w = R(S), T = (e) => {
				var n = Yi(), r = I(n), i = I(r, !0);
				O(r);
				var a = R(r, 2), o = I(a, !0);
				O(a), O(n), z(() => {
					K(i, H(t).summary.taskLabel), K(o, H(t).summary.runningLabel);
				}), G(e, n);
			};
			q(w, (e) => {
				H(t).summary && !H(t).expanded && e(T);
			}), O(y);
			var E = R(y, 2);
			let ee;
			X(I(E), { name: "star" }), O(E);
			var te = R(E, 2);
			X(I(te), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), O(te), O(i);
			var ne = R(i, 2), re = (e) => {
				var r = Zi();
				J(r, 21, () => H(t).children, (e) => e.id, (e, r) => {
					var i = Xi(), s = R(I(i), 2);
					Pi(s, { get status() {
						return H(r).status;
					} });
					var h = R(s, 2);
					X(h, {
						name: "file-text",
						className: "tree-icon"
					});
					var g = R(h), _ = I(g), v = I(_, !0);
					O(_);
					var y = R(_), b = I(y, !0);
					O(y), O(g);
					var x = R(g, 2);
					let S;
					X(I(x), { name: "star" }), O(x);
					var C = R(x, 2);
					X(I(C), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), O(C), O(i), z((e) => {
						ai(i, 1, e), Y(i, "aria-label", H(r).ariaLabel || void 0), Y(i, "title", H(r).statusLabel || void 0), K(v, H(r).title), K(b, H(r).ref), S = ai(x, 1, "attention-star", null, S, { followed: H(r).followed }), Y(x, "aria-checked", H(r).followed), Y(x, "aria-label", H(r).followed ? `Unfollow ${H(r).title}` : `Follow ${H(r).title}`), Y(x, "title", H(r).followed ? "Unfollow" : "Follow");
					}, [() => `tree-item task-item ${a(H(r).status)} ${H(r).active ? "active" : ""} ${H(n)?.id === H(r).id ? "drag-source" : ""} ${o(H(r).id)}`]), U("click", i, (e) => f(e, H(r))), xr("dragover", i, (e) => l(e, {
						kind: "task",
						id: H(r).id,
						projectId: H(t).id
					})), xr("drop", i, (e) => u(e, {
						kind: "task",
						id: H(r).id,
						projectId: H(t).id
					})), U("click", x, (e) => p(e, H(r))), U("keydown", x, (e) => m(e, H(r))), xr("dragstart", C, (e) => c(e, {
						kind: "task",
						id: H(r).id,
						projectId: H(t).id
					})), xr("dragend", C, d), G(e, i);
				}), O(r), G(e, r);
			};
			q(ne, (e) => {
				H(t).expanded && e(re);
			}), z((e) => {
				ai(i, 1, e), Y(i, "aria-label", H(t).ariaLabel || void 0), Y(i, "title", H(t).statusLabel || void 0), Y(s, "data-project-toggle", H(t).children.length ? H(t).id : void 0), K(x, H(t).title), K(C, H(t).ref), ee = ai(E, 1, "attention-star", null, ee, { followed: H(t).followed }), Y(E, "aria-checked", H(t).followed), Y(E, "aria-label", H(t).followed ? `Unfollow ${H(t).title}` : `Follow ${H(t).title}`), Y(E, "title", H(t).followed ? "Unfollow" : "Follow");
			}, [() => `tree-item ${a(H(t).status)} ${H(t).active ? "active" : ""} ${H(n)?.id === H(t).id ? "drag-source" : ""} ${o(H(t).id)}`]), U("click", i, (e) => f(e, H(t))), xr("dragover", i, (e) => l(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), xr("drop", i, (e) => u(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), U("click", E, (e) => p(e, H(t))), U("keydown", E, (e) => m(e, H(t))), xr("dragstart", te, (e) => c(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), xr("dragend", te, d), G(e, r);
		}), G(e, r);
	};
	q(y, (e) => {
		t.loading ? e(b) : t.error ? e(x, 1) : t.projects.length === 0 ? e(S, 2) : e(C, -1);
	}), O(v), O(h), z(() => Y(v, "data-navigation-identity", t.identity)), U("click", _, function(...e) {
		t.onCreate?.apply(this, e);
	}), G(e, h), j();
}
Sr(["click", "keydown"]);
//#endregion
//#region src/components/SchedulerNav.svelte
var ta = /* @__PURE__ */ W("<section class=\"scheduler-nav\" data-component-owner=\"scheduler-nav\"><button type=\"button\"><!> <!> <span><strong>Scheduler</strong><small>Natural-language schedules</small></span> <!></button></section>");
function na(e, t) {
	A(t, !0);
	async function n() {
		if (t.item) try {
			await t.onSelect(t.item.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var r = ta(), i = I(r);
	let a;
	var o = I(i), s = (e) => {
		Pi(e, { get status() {
			return t.item.status;
		} });
	};
	q(o, (e) => {
		t.item && e(s);
	});
	var c = R(o, 2);
	X(c, {
		name: "clock-3",
		className: "scheduler-nav-icon"
	}), X(R(c, 4), {
		name: "chevron-right",
		className: "scheduler-nav-chevron"
	}), O(i), O(r), z(() => {
		i.disabled = !t.item, Y(i, "title", t.item?.statusLabel || "Workspace Scheduler"), a = ai(i, 1, "", null, a, { active: t.item?.active });
	}), U("click", i, n), G(e, r), j();
}
Sr(["click"]);
//#endregion
//#region src/components/WorkspaceSwitcher.svelte
var ra = /* @__PURE__ */ W("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), ia = /* @__PURE__ */ W("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), aa = /* @__PURE__ */ W("<section class=\"workspace-switcher\" data-component-owner=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" class=\"workspace-switcher-button\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <!></button> <!></div></section>");
function oa(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(!1), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P($t(t.identity)), a = /* @__PURE__ */ M(() => t.workspaces.find((e) => e.id === t.activeWorkspaceId) ?? null);
	bn(() => {
		t.identity !== H(i) && (F(i, t.identity, !0), F(n, !1), F(r, ""));
	}), ki(() => {
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
	var s = aa(), c = I(s), l = I(c), u = I(l), d = I(u);
	O(u);
	var f = R(u, 2), p = I(f, !0);
	O(f);
	var m = R(f, 2);
	{
		let e = /* @__PURE__ */ M(() => H(r) ? "loader-circle" : "chevrons-up-down");
		X(m, {
			get name() {
				return H(e);
			},
			className: "select-icon"
		});
	}
	O(l);
	var h = R(l, 2), g = (e) => {
		var i = ia(), a = R(I(i), 2);
		J(a, 17, () => t.workspaces, (e) => e.id, (e, n) => {
			var i = ra(), a = I(i), s = I(a);
			O(a);
			var c = R(a, 2), l = I(c), u = I(l, !0);
			O(l);
			var d = R(l), f = I(d, !0);
			O(d), O(c);
			var p = R(c, 2), m = (e) => {
				X(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			q(p, (e) => {
				H(n).id === t.activeWorkspaceId && e(m);
			}), O(i), z((e) => {
				Y(i, "aria-selected", H(n).id === t.activeWorkspaceId), Y(i, "data-workspace-id", H(n).id), i.disabled = e, Y(s, "src", H(n).iconSrc), K(u, H(n).name || H(n).id), K(f, H(n).path);
			}, [() => !!H(r)]), U("click", i, () => o(H(n).id)), G(e, i);
		});
		var s = R(a, 2), c = I(s);
		X(I(c), { name: "plus" }), k(), O(c), O(s), O(i), U("click", c, () => {
			F(n, !1), t.onAdd();
		}), G(e, i);
	};
	q(h, (e) => {
		H(n) && e(g);
	}), O(c), O(s), z(() => {
		Y(l, "aria-expanded", H(n)), Y(d, "src", H(a)?.iconSrc || "/favicon.svg"), K(p, H(a)?.name || "Workspace");
	}), U("click", l, (e) => {
		e.stopPropagation(), F(n, !H(n));
	}), G(e, s), j();
}
Sr(["click"]);
//#endregion
//#region src/components/AppShell.svelte
var sa = /* @__PURE__ */ W("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><!><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"workspace-toolbar-actions\"><!></div></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <div class=\"workspace-view-actions\"><!></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div class=\"tty-panel\"><div id=\"ttyLog\" class=\"tty-log\" data-component-owner=\"event-timeline\"><!></div><div id=\"ttyComposer\" class=\"tty-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div>");
function ca(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(0);
	ki(() => {
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
	var i = sa(), a = I(i);
	Ui(a, {
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
	Vi(d, {
		get preference() {
			return H(n).layout.preference;
		},
		tone: "dark",
		get onCycle() {
			return H(n).onLayoutCycle;
		}
	});
	var f = R(d);
	X(I(f), { name: "settings" }), O(f), O(s);
	var p = R(s, 2);
	oa(p, {
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
	{
		let e = /* @__PURE__ */ M(() => H(n).scheduler || null);
		na(m, {
			get item() {
				return H(e);
			},
			get onSelect() {
				return H(n).onSelectResource;
			},
			get onToast() {
				return H(n).onToast;
			}
		});
	}
	var h = R(m, 2);
	ea(h, {
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
		get onToggleAttention() {
			return H(n).onToggleAttention;
		},
		get onToast() {
			return H(n).onToast;
		}
	});
	var g = R(h, 2);
	Gi(g, {
		id: "activityResize",
		kind: "sidebarAttentionHeight",
		className: "horizontal-resize sidebar-activity-resize",
		label: "Resize activity panel",
		get onPreview() {
			return H(n).onPanePreview;
		},
		get onCommit() {
			return H(n).onPaneCommit;
		}
	}), zi(R(g, 2), {
		get items() {
			return H(n).attentionList;
		},
		get onSelect() {
			return H(n).onSelectResource;
		},
		get onToggleAttention() {
			return H(n).onToggleAttention;
		},
		get onDismiss() {
			return H(n).onDismissAttention;
		},
		get onToast() {
			return H(n).onToast;
		}
	}), O(o);
	var _ = R(o, 2);
	Gi(_, {
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
	var v = R(_, 2), y = I(v), b = I(y);
	X(I(b), { name: "menu" }), O(b);
	var x = R(b, 2);
	Vi(I(x), {
		get preference() {
			return H(n).layout.preference;
		},
		get onCycle() {
			return H(n).onLayoutCycle;
		}
	}), O(x), O(y);
	var S = R(y, 2), C = I(S), w = I(C), T = R(w, 2);
	O(C);
	var E = R(C, 2);
	Vi(I(E), {
		get preference() {
			return H(n).layout.preference;
		},
		get onCycle() {
			return H(n).onLayoutCycle;
		}
	}), O(E), O(S);
	var ee = R(S, 2), te = I(ee), ne = (e) => {
		var n = Ar();
		Yr(L(n), () => t.details), G(e, n);
	};
	q(te, (e) => {
		t.details && e(ne);
	}), O(ee);
	var re = R(ee, 2);
	Gi(re, {
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
	var ie = R(re, 2), ae = I(ie), oe = I(ae), se = I(oe), ce = (e) => {
		var n = Ar();
		Yr(L(n), () => t.timeline), G(e, n);
	};
	q(se, (e) => {
		t.timeline && e(ce);
	}), O(oe);
	var le = R(oe), ue = I(le), de = (e) => {
		var n = Ar();
		Yr(L(n), () => t.composer), G(e, n);
	};
	q(ue, (e) => {
		t.composer && e(de);
	}), O(le), O(ae), O(ie), O(v), O(i), z(() => {
		K(u, H(n).version), Y(b, "aria-expanded", H(n).mobile.sidebarOpen), Y(w, "aria-selected", H(n).mobile.view === "details"), Y(T, "aria-selected", H(n).mobile.view === "chat");
	}), U("click", f, () => {
		H(n).onMobileSidebar(!1), H(n).onOpenSettings();
	}), U("click", b, () => H(n).onMobileSidebar(!0)), U("click", w, () => H(n).onMobileView("details")), U("click", T, () => H(n).onMobileView("chat")), G(e, i), j();
}
Sr(["click"]);
//#endregion
//#region src/components/AgentBindingSelector.svelte
var la = /* @__PURE__ */ W("<option> </option>"), ua = /* @__PURE__ */ W("<optgroup label=\"Profiles\"></optgroup>"), da = /* @__PURE__ */ W("<optgroup label=\"Agents\"></optgroup>"), fa = /* @__PURE__ */ W("<span class=\"agent-binding-sizer\" aria-hidden=\"true\"> </span> <select><!><!></select>", 1);
function pa(e, t) {
	A(t, !0);
	let n = Oi(t, "disabled", 3, !1), r = Oi(t, "ariaLabel", 3, "Agent binding"), i = /* @__PURE__ */ M(f), a = /* @__PURE__ */ M(p), o = /* @__PURE__ */ M(() => m(t.value)), s = /* @__PURE__ */ M(() => [...H(i), ...H(a)].find((e) => m(e.value) === H(o))?.label || t.value.name || "Unavailable"), c = /* @__PURE__ */ P(void 0), l = /* @__PURE__ */ P(0);
	bn(() => {
		H(s), lr().then(() => {
			H(c) && F(l, Math.ceil(H(c).getBoundingClientRect().width), !0);
		});
	});
	function u(e) {
		return e.trim().toLowerCase();
	}
	function d(e) {
		return t.agents.find((t) => u(t.id) === u(e))?.label || e || "Unavailable";
	}
	function f() {
		let e = t.profiles.map((e) => ({
			value: {
				kind: "profile",
				name: e.key
			},
			label: `${e.key} (current: ${d(e.agentName || "")})`
		}));
		return t.value.kind === "profile" && !t.profiles.some((e) => u(e.key) === u(t.value.name)) && e.unshift({
			value: t.value,
			label: `${t.value.name} (missing profile)`
		}), e;
	}
	function p() {
		let e = t.agents.map((e) => {
			let n = t.profiles.filter((t) => u(t.agentName || "") === u(e.id)).map((e) => e.key);
			return {
				value: {
					kind: "agent",
					name: e.id
				},
				label: n.length ? `${e.label} (${n.join(", ")})` : e.label
			};
		});
		return t.value.kind === "agent" && !t.agents.some((e) => u(e.id) === u(t.value.name)) && e.unshift({
			value: t.value,
			label: `${t.value.name} (missing agent)`
		}), e;
	}
	function m(e) {
		return `${e.kind}:${encodeURIComponent(e.name)}`;
	}
	function h(e) {
		let n = e.currentTarget, r = n.value;
		n.value = H(o);
		let i = r.indexOf(":");
		if (i < 0) return;
		let a = r.slice(0, i);
		if (a !== "profile" && a !== "agent") return;
		let s = {
			kind: a,
			name: decodeURIComponent(r.slice(i + 1))
		};
		m(s) !== H(o) && t.onSelect(s);
	}
	var g = fa(), _ = L(g), v = I(_, !0);
	O(_), Di(_, (e) => F(c, e), () => H(c));
	var y = R(_, 2);
	let b;
	var x = I(y), S = (e) => {
		var t = ua();
		J(t, 21, () => H(i), (e) => m(e.value), (e, t) => {
			var n = la(), r = I(n, !0);
			O(n);
			var i = {};
			z((e) => {
				K(r, H(t).label), i !== (i = e) && (n.value = (n.__value = e) ?? "");
			}, [() => m(H(t).value)]), G(e, n);
		}), O(t), G(e, t);
	};
	q(x, (e) => {
		H(i).length && e(S);
	});
	var C = R(x), w = (e) => {
		var t = da();
		J(t, 21, () => H(a), (e) => m(e.value), (e, t) => {
			var n = la(), r = I(n, !0);
			O(n);
			var i = {};
			z((e) => {
				K(r, H(t).label), i !== (i = e) && (n.value = (n.__value = e) ?? "");
			}, [() => m(H(t).value)]), G(e, n);
		}), O(t), G(e, t);
	};
	q(C, (e) => {
		H(a).length && e(w);
	}), O(y);
	var T;
	li(y), z(() => {
		K(v, H(s)), y.disabled = n(), Y(y, "aria-label", r()), b = si(y, "", b, { width: H(l) ? `${H(l) + 2}px` : void 0 }), T !== (T = H(o)) && (y.value = (y.__value = H(o)) ?? "", ci(y, H(o)));
	}), U("change", y, h), G(e, g), j();
}
Sr(["change"]);
//#endregion
//#region src/components/ChatComposer.svelte
var ma = /* @__PURE__ */ W("<div class=\"tty-message-item\"><span class=\"tty-message-text\"> </span> <span class=\"tty-message-mode\"> </span> <button type=\"button\" class=\"tty-message-steer\"><!> <span>Insert now</span></button></div>"), ha = /* @__PURE__ */ W("<div class=\"tty-message-queue-error\" role=\"alert\"> </div>"), ga = /* @__PURE__ */ W("<section class=\"tty-message-queue\" aria-label=\"Waiting messages\"><div class=\"tty-message-queue-header\"><span>Waiting messages</span><span class=\"tty-message-count\"> </span></div> <div class=\"tty-message-list\"></div> <!></section>"), _a = /* @__PURE__ */ W("<button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn\" aria-label=\"End current turn\"><!></button>"), va = /* @__PURE__ */ W("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), ya = /* @__PURE__ */ W("<!> <form id=\"ttyForm\" class=\"tty-input\"><textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <div class=\"tty-composer-bar\"><button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button> <div class=\"tty-composer-options\"><span class=\"tty-agent-binding\"><!></span> <!> <button type=\"submit\" class=\"tty-send-button\"><!></button></div></div></form> <!>", 1);
function ba(e, t) {
	A(t, !0);
	let n = t.channel.current(), r = /* @__PURE__ */ P($t(n)), i = /* @__PURE__ */ P($t(n.identity)), a = /* @__PURE__ */ P($t(n.draftResetVersion)), o = /* @__PURE__ */ P($t(n.draft)), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(""), l = /* @__PURE__ */ P(""), u = /* @__PURE__ */ P(!1), d = /* @__PURE__ */ P(void 0), f = /* @__PURE__ */ M(() => !!H(r).unavailableReason || H(s) || H(r).sending);
	ki(() => t.channel.subscribe((e) => {
		H(r), F(r, e, !0), e.identity === H(i) ? e.draftResetVersion !== H(a) && (F(a, e.draftResetVersion, !0), F(o, e.draft, !0), F(c, "")) : (F(i, e.identity, !0), F(a, e.draftResetVersion, !0), F(o, e.draft, !0), F(s, !1), F(c, ""), F(l, ""), F(u, !1)), queueMicrotask(e.onIconsChanged);
	})), bn(() => {
		H(o), lr().then(v);
	});
	function p() {
		return {
			workspaceId: H(r).workspaceId,
			resourceId: H(r).resourceId,
			draftKey: H(r).draftKey
		};
	}
	function m(e) {
		F(o, e, !0), F(c, ""), H(r).onDraft(e, p());
	}
	async function h(e) {
		e?.preventDefault();
		let t = H(o);
		if (H(f) || !t.trim() || !H(r).workspaceId || !H(r).resourceId) return;
		let n = H(i), a = p();
		F(s, !0), F(c, "");
		try {
			let e = await H(r).onSend(t, a);
			H(i) === n && e.accepted && e.clear && H(o) === t && m("");
		} catch (e) {
			H(i) === n && F(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(i) === n && (F(s, !1), await lr(), H(d)?.focus({ preventScroll: !0 }));
		}
	}
	async function g(e) {
		if (!(!H(r).canSteerWaiting || H(r).steeringMessageId)) {
			F(l, "");
			try {
				await H(r).onSteerWaiting(e);
			} catch (e) {
				F(l, e instanceof Error ? e.message : String(e), !0);
			}
		}
	}
	function _(e) {
		if (!(e.key !== "Enter" || e.isComposing || e.keyCode === 229)) {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault(), h();
				return;
			}
			if (e.shiftKey) {
				F(u, !0);
				return;
			}
			H(u) || (e.preventDefault(), h());
		}
	}
	function v() {
		if (!H(d)) return;
		H(d).style.height = "auto";
		let e = Math.min(H(d).scrollHeight, 160);
		H(d).style.height = `${e}px`, H(d).style.overflowY = H(d).scrollHeight > 160 ? "auto" : "hidden";
	}
	function y(e) {
		H(r).onSaveAgentBinding(e);
	}
	var b = ya(), x = L(b), S = (e) => {
		var t = ga(), n = I(t), i = R(I(n)), a = I(i, !0);
		O(i), O(n);
		var o = R(n, 2);
		J(o, 21, () => H(r).waitingMessages, (e) => e.messageId, (e, t) => {
			var n = ma(), i = I(n), a = I(i, !0);
			O(i);
			var o = R(i, 2), s = I(o, !0);
			O(o);
			var c = R(o, 2), l = I(c), u = (e) => {
				X(e, { name: "loader-circle" });
			}, d = (e) => {
				X(e, { name: "corner-up-left" });
			};
			q(l, (e) => {
				H(r).steeringMessageId === H(t).messageId ? e(u) : e(d, -1);
			}), k(2), O(c), O(n), z((e) => {
				Y(n, "data-message-id", H(t).messageId), Y(i, "title", H(t).text), K(a, H(t).text), K(s, H(t).actualMode || H(t).requestedMode), c.disabled = e, Y(c, "title", H(r).canSteerWaiting ? "Insert this waiting message into the current turn" : "Available when the current turn supports steer"), Y(c, "aria-label", `Insert waiting message into current turn: ${H(t).text}`);
			}, [() => !H(r).canSteerWaiting || !!H(r).steeringMessageId]), U("click", c, () => g(H(t).messageId)), G(e, n);
		}), O(o);
		var s = R(o, 2), c = (e) => {
			var t = ha(), n = I(t, !0);
			O(t), z(() => K(n, H(l))), G(e, t);
		};
		q(s, (e) => {
			H(l) && e(c);
		}), O(t), z(() => K(a, H(r).waitingMessages.length)), G(e, t);
	};
	q(x, (e) => {
		H(r).waitingMessages.length && e(S);
	});
	var C = R(x, 2), w = I(C);
	it(w), Di(w, (e) => F(d, e), () => H(d));
	var T = R(w, 2), E = I(T);
	X(I(E), { name: "plus" }), O(E);
	var ee = R(E, 2), te = I(ee), ne = I(te);
	{
		let e = /* @__PURE__ */ M(() => H(f) || H(r).bindingSaving);
		pa(ne, {
			get value() {
				return H(r).agentBinding;
			},
			get profiles() {
				return H(r).agentProfiles;
			},
			get agents() {
				return H(r).agents;
			},
			get disabled() {
				return H(e);
			},
			ariaLabel: "Binding target",
			onSelect: y
		});
	}
	O(te);
	var re = R(te, 2), ie = (e) => {
		var t = _a(), n = I(t);
		{
			let e = /* @__PURE__ */ M(() => H(r).endingTurn ? "loader-circle" : "pause");
			X(n, { get name() {
				return H(e);
			} });
		}
		O(t), z(() => t.disabled = H(r).endingTurn), U("click", t, function(...e) {
			H(r).onEndTurn?.apply(this, e);
		}), G(e, t);
	};
	q(re, (e) => {
		H(r).canEndTurn && e(ie);
	});
	var ae = R(re, 2), oe = I(ae);
	{
		let e = /* @__PURE__ */ M(() => H(s) ? "loader-circle" : "send");
		X(oe, { get name() {
			return H(e);
		} });
	}
	O(ae), O(ee), O(T), O(C);
	var se = R(C, 2), ce = (e) => {
		var t = va(), n = I(t), r = I(n, !0);
		O(n);
		var i = R(n);
		O(t), z(() => {
			K(r, H(c)), i.disabled = H(s);
		}), U("click", i, () => h()), G(e, t);
	};
	q(se, (e) => {
		H(c) && e(ce);
	}), z((e) => {
		Y(w, "data-agent-draft-key", H(r).draftKey), Y(w, "placeholder", H(r).unavailableReason || "Message this resource"), w.disabled = H(f), _i(w, H(o)), E.disabled = e, Y(ae, "title", H(s) ? "Sending..." : H(r).unavailableReason || "Send input"), Y(ae, "aria-label", H(s) ? "Sending..." : H(r).unavailableReason || "Send input"), ae.disabled = H(f);
	}, [() => !!H(r).unavailableReason]), xr("submit", C, h), U("input", w, (e) => m(e.currentTarget.value)), U("keydown", w, _), U("click", E, function(...e) {
		H(r).onOpenUpload?.apply(this, e);
	}), G(e, b), j();
}
Sr([
	"click",
	"input",
	"keydown"
]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var xa = /* @__PURE__ */ W("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function Sa(e, t) {
	A(t, !0);
	let n = Oi(t, "draft", 7);
	var r = xa(), i = I(r);
	it(i);
	var a = R(i, 2);
	gi(a), O(r), z(() => {
		_i(i, n().description), _i(a, n().slug);
	}), U("input", i, (e) => n().description = e.currentTarget.value), U("input", a, (e) => n().slug = e.currentTarget.value), G(e, r), j();
}
Sr(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var Ca = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\"> </button>"), wa = /* @__PURE__ */ W("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), Ta = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Updating preview...</p>"), Ea = /* @__PURE__ */ W("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), Da = /* @__PURE__ */ W("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Oa = /* @__PURE__ */ W("<small> </small>"), ka = /* @__PURE__ */ W("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), Aa = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), ja = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Ma = /* @__PURE__ */ W("<!> <!> <!>", 1), Na = /* @__PURE__ */ W("<p class=\"create-task-blank-detail\"> </p>"), Pa = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), Fa = /* @__PURE__ */ W("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), Ia = /* @__PURE__ */ W("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function La(e, t) {
	A(t, !0);
	let n = Oi(t, "draft", 7), r = /* @__PURE__ */ P($t(n().editedMarkdown ?? "")), i = null, a = /* @__PURE__ */ M(() => !!t.preview && H(r) !== t.preview?.markdown);
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
	var c = Ia(), l = I(c), u = R(I(l), 2), d = (e) => {
		var n = Ca(), r = I(n, !0);
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
		var i = Ma(), c = L(i), l = (e) => {
			var n = wa(), r = I(n, !0);
			O(n), z(() => K(r, t.previewError)), G(e, n);
		};
		q(c, (e) => {
			t.previewError && e(l);
		});
		var u = R(c, 2), d = (e) => {
			G(e, Ta());
		};
		q(u, (e) => {
			!t.previewError && t.stale && t.preview && e(d);
		});
		var f = R(u, 2), p = (e) => {
			var i = ka(), c = I(i), l = I(c, !0);
			O(c);
			var u = R(c, 2);
			it(u);
			var d = R(u, 2), f = (e) => {
				var t = Ea(), n = R(I(t), 2);
				O(t), U("click", n, s), G(e, t);
			}, p = (e) => {
				G(e, Da());
			};
			q(d, (e) => {
				H(a) ? e(f) : e(p, -1);
			});
			var m = R(d, 2), h = (e) => {
				var n = Oa(), r = I(n);
				O(n), z(() => K(r, `Slug: ${t.preview.slug ?? ""}`)), G(e, n);
			};
			q(m, (e) => {
				t.preview.slug && e(h);
			});
			var g = R(m, 2), _ = (e) => {
				var r = Oa(), i = I(r);
				O(r), z(() => K(i, `Template ${n().templateName ?? ""} · ${t.templateDigest ?? ""}`)), G(e, r);
			};
			q(g, (e) => {
				t.templateDigest && e(_);
			}), O(i), z(() => {
				K(l, t.preview.title), _i(u, H(r));
			}), U("input", u, (e) => o(e.currentTarget.value)), G(e, i);
		}, m = (e) => {
			G(e, Aa());
		}, h = (e) => {
			G(e, ja());
		};
		q(f, (e) => {
			t.preview ? e(p) : t.previewing ? e(m, 1) : t.previewError || e(h, 2);
		}), G(e, i);
	}, m = (e) => {
		var t = Fa(), r = I(t), i = I(r, !0);
		O(r);
		var a = R(r, 2), o = (e) => {
			var t = Na(), r = I(t, !0);
			O(t), z(() => K(r, n().detail)), G(e, t);
		}, s = /* @__PURE__ */ M(() => n().detail.trim()), c = (e) => {
			G(e, Pa());
		};
		q(a, (e) => {
			H(s) ? e(o) : e(c, -1);
		});
		var l = R(a, 2), u = (e) => {
			var t = Oa(), r = I(t);
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
Sr(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var Ra = /* @__PURE__ */ W("<input type=\"checkbox\"/><span> </span>", 1), za = /* @__PURE__ */ W("<span> </span>"), Ba = /* @__PURE__ */ W("<textarea></textarea>"), Va = /* @__PURE__ */ W("<option> </option>"), Ha = /* @__PURE__ */ W("<select><option>Select...</option><!></select>"), Ua = /* @__PURE__ */ W("<input/>"), Wa = /* @__PURE__ */ W("<small> </small>"), Ga = /* @__PURE__ */ W("<label><!> <!> <!> <!> <!></label>"), Ka = /* @__PURE__ */ W("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function qa(e, t) {
	A(t, !0);
	function n(e, n) {
		let r = n.currentTarget;
		t.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var r = Ka();
	J(r, 21, () => t.fields, (e) => e.name, (e, r) => {
		var i = Ga();
		let a;
		var o = I(i), s = (e) => {
			var i = Ra(), a = L(i);
			gi(a);
			var o = R(a), s = I(o);
			O(o), z(() => {
				vi(a, t.values[H(r).name] === !0), K(s, `${H(r).label ?? ""}${H(r).required ? " *" : ""}`);
			}), U("change", a, (e) => n(H(r), e)), G(e, i);
		}, c = (e) => {
			var t = za(), n = I(t);
			O(t), z(() => K(n, `${H(r).label ?? ""}${H(r).required ? " *" : ""}`)), G(e, t);
		};
		q(o, (e) => {
			H(r).type === "boolean" ? e(s) : e(c, -1);
		});
		var l = R(o, 2), u = (e) => {
			var i = Ba();
			it(i), z((e) => {
				i.required = H(r).required, Y(i, "placeholder", H(r).placeholder || ""), _i(i, e);
			}, [() => String(t.values[H(r).name] ?? "")]), U("input", i, (e) => n(H(r), e)), G(e, i);
		};
		q(l, (e) => {
			H(r).type === "textarea" && e(u);
		});
		var d = R(l, 2), f = (e) => {
			var i = Ha(), a = I(i);
			a.value = a.__value = "", J(R(a), 17, () => H(r).options || [], zr, (e, t) => {
				var n = Va(), r = I(n, !0);
				O(n);
				var i = {};
				z(() => {
					K(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
				}), G(e, n);
			}), O(i);
			var o;
			li(i), z((e) => {
				i.required = H(r).required, o !== (o = e) && (i.value = (i.__value = e) ?? "", ci(i, e));
			}, [() => String(t.values[H(r).name] ?? "")]), U("change", i, (e) => n(H(r), e)), G(e, i);
		};
		q(d, (e) => {
			H(r).type === "select" && e(f);
		});
		var p = R(d, 2), m = (e) => {
			var i = Ua();
			gi(i), z((e) => {
				i.required = H(r).required, Y(i, "placeholder", H(r).placeholder || ""), _i(i, e);
			}, [() => String(t.values[H(r).name] ?? "")]), U("input", i, (e) => n(H(r), e)), G(e, i);
		};
		q(p, (e) => {
			H(r).type === "text" && e(m);
		});
		var h = R(p, 2), g = (e) => {
			var t = Wa(), n = I(t, !0);
			O(t), z(() => K(n, H(r).description)), G(e, t);
		};
		q(h, (e) => {
			H(r).description && e(g);
		}), O(i), z(() => a = ai(i, 1, "", null, a, { "template-boolean": H(r).type === "boolean" })), G(e, i);
	}), O(r), z(() => Y(r, "aria-label", t.label)), G(e, r), j();
}
Sr(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var Ja = /* @__PURE__ */ W("<small> </small>"), Ya = /* @__PURE__ */ W("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), Xa = /* @__PURE__ */ W("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function Za(e, t) {
	A(t, !0);
	function n(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var r = Xa(), i = R(I(r), 2), a = I(i);
	let o;
	var s = R(I(a), 4);
	X(I(s), { name: "check" }), O(s), O(a), J(R(a, 2), 17, () => t.templates, (e) => e.name, (e, r) => {
		var i = Ya();
		let a;
		var o = I(i), s = I(o, !0);
		O(o);
		var c = R(o, 2), l = (e) => {
			var t = Ja(), n = I(t, !0);
			O(t), z(() => K(n, H(r).description)), G(e, t);
		};
		q(c, (e) => {
			H(r).description && e(l);
		});
		var u = R(c, 2);
		X(I(u), { name: "check" }), O(u), O(i), z((e) => {
			Y(i, "aria-selected", t.selectedName === H(r).name), a = ai(i, 1, "template-card", null, a, { selected: t.selectedName === H(r).name }), i.disabled = !H(r).valid || t.disabled, K(s, e);
		}, [() => n(H(r))]), U("click", i, () => t.onSelect(H(r).name)), G(e, i);
	}), O(i), O(r), z(() => {
		Y(a, "aria-selected", t.selectedName === ""), o = ai(a, 1, "template-card", null, o, { selected: t.selectedName === "" }), a.disabled = t.disabled;
	}), U("click", a, () => t.onSelect("")), G(e, r), j();
}
Sr(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var Qa = /* @__PURE__ */ W("<small>(generated by template)</small>"), $a = /* @__PURE__ */ W("<small class=\"create-required\">*</small>"), eo = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), to = /* @__PURE__ */ W("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), no = /* @__PURE__ */ W("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), ro = /* @__PURE__ */ W("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function io(e, t) {
	A(t, !0);
	let n = Oi(t, "draft", 7), r, i = /* @__PURE__ */ M(() => t.model.templates.find((e) => e.name === n().templateName)), a = /* @__PURE__ */ M(() => t.model.preview?.title || ""), o = /* @__PURE__ */ M(() => n().titleOverride ? n().title : H(a)), s = /* @__PURE__ */ M(() => (H(i)?.fields || []).filter((e) => e.required)), c = /* @__PURE__ */ M(() => (H(i)?.fields || []).filter((e) => !e.required)), l = /* @__PURE__ */ M(() => !t.model.preview || t.model.previewKey !== t.model.previewRequestKey(n()));
	Ai(() => {
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
	var v = ro(), y = I(v), b = I(y), x = (e) => {
		Za(e, {
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
	var S = R(b, 2), C = R(I(S), 2), w = I(C), T = I(w), E = R(I(T)), ee = (e) => {
		G(e, Qa());
	}, te = (e) => {
		G(e, $a());
	};
	q(E, (e) => {
		H(i)?.taskTitle && !n().titleOverride ? e(ee) : e(te, -1);
	}), O(T);
	var ne = R(T, 2), re = I(ne);
	gi(re);
	var ie = R(re, 2), ae = (e) => {
		var t = eo();
		U("click", t, g), G(e, t);
	};
	q(ie, (e) => {
		H(i)?.taskTitle && n().titleOverride && e(ae);
	}), O(ne), O(w);
	var oe = R(w, 2), se = R(I(oe), 2), ce = R(I(se), 2);
	gi(ce), O(se), O(oe), O(C), O(S);
	var le = R(S, 2), ue = (e) => {
		var t = to(), r = R(I(t), 2), i = (e) => {
			qa(e, {
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
			qa(e, {
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
	}, de = (e) => {
		var t = no(), r = R(I(t), 2);
		it(r), O(t), z(() => _i(r, n().detail)), U("input", r, (e) => n().detail = e.currentTarget.value), G(e, t);
	};
	q(le, (e) => {
		H(i) ? e(ue) : e(de, -1);
	}), O(y), La(R(y, 2), {
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
		re.required = !H(i)?.taskTitle, _i(re, H(i)?.taskTitle ? H(o) : n().title), Y(re, "placeholder", H(i)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), _i(ce, n().slug);
	}), U("input", re, (e) => h(e.currentTarget.value)), U("input", ce, (e) => {
		n().slug = e.currentTarget.value, f();
	}), G(e, v), j();
}
Sr(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var ao = /* @__PURE__ */ W("<span> </span>"), oo = /* @__PURE__ */ W("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function so(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P($t(s(H(n).draft))), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(void 0), o = /* @__PURE__ */ M(() => H(r).type === "task");
	ki(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity !== H(i) && (F(i, e.identity, !0), F(r, s(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), ki(() => {
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
	var l = Ar(), u = L(l), d = (e) => {
		var t = oo(), i = I(t), s = R(i, 2);
		let l;
		var u = I(s), d = I(u), f = I(d), p = I(f, !0);
		O(f);
		var m = R(f, 2), h = (e) => {
			var t = ao(), n = I(t, !0);
			O(t), z(() => K(n, H(r).projectId)), G(e, t);
		};
		q(m, (e) => {
			H(o) && e(h);
		}), O(d);
		var g = R(d, 2);
		X(I(g), { name: "x" }), O(g), O(u);
		var _ = R(u, 2), v = I(_);
		Rr(v, () => H(n).identity, (e) => {
			var t = Ar(), i = L(t), a = (e) => {
				io(e, {
					get draft() {
						return H(r);
					},
					get model() {
						return H(n);
					}
				});
			}, s = (e) => {
				Sa(e, { get draft() {
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
		O(y), O(_), O(s), Di(s, (e) => F(a, e), () => H(a)), O(t), z(() => {
			l = ai(s, 1, "create-dialog modal-enter", null, l, { "create-task-dialog": H(o) }), Y(s, "aria-label", H(o) ? "Create task" : "Create project"), K(p, H(o) ? "Create task" : "Create project"), g.disabled = H(n).submitting, b.disabled = H(n).submitting, K(x, H(n).submitting ? "Creating..." : "Create"), S.disabled = H(n).submitting;
		}), U("click", i, function(...e) {
			H(n).onClose?.apply(this, e);
		}), U("click", g, function(...e) {
			H(n).onClose?.apply(this, e);
		}), xr("submit", _, c), U("click", S, function(...e) {
			H(n).onClose?.apply(this, e);
		}), G(e, t);
	};
	q(u, (e) => {
		H(n).open && e(d);
	}), G(e, l), j();
}
Sr(["click"]);
//#endregion
//#region src/api/client.ts
var co = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, lo = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, uo = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new lo(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new lo(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new lo(e.scope));
		this.active.clear();
	}
}, fo = class {
	requests = new uo();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: mo(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: mo(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof lo) ? new lo(n) : e;
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
			let n = po(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new co(e.status, r, n);
		}
		return t;
	}
};
function po(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function mo(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new fo();
//#endregion
//#region src/components/DiffModal.svelte
var ho = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), go = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), _o = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), vo = /* @__PURE__ */ W("<div class=\"diff-viewer\"></div>"), yo = /* @__PURE__ */ W("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function bo(e, t) {
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
	}), Ai(() => t.client.requests.abort(H(o)));
	function s() {
		!H(a) || !H(n)?.diff || !window.Diff2Html || (H(a).innerHTML = window.Diff2Html.html(H(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Ar(), l = L(c), u = (e) => {
		var o = yo(), s = I(o), c = R(s, 2), l = I(c), u = I(l), d = I(u), f = I(d, !0);
		O(d);
		var p = R(d), m = I(p);
		O(p), O(u);
		var h = R(u);
		X(I(h), { name: "x" }), O(h), O(l);
		var g = R(l, 2), _ = (e) => {
			var n = ho(), r = I(n);
			X(r, { name: "loader-circle" });
			var i = R(r, 2), a = I(i, !0);
			O(i), O(n), z(() => K(a, t.repo.worktreePath || "")), G(e, n);
		}, v = (e) => {
			var t = go(), n = I(t);
			X(n, { name: "triangle-alert" });
			var r = R(n, 2), a = I(r, !0);
			O(r), O(t), z(() => K(a, H(i))), G(e, t);
		}, y = (e) => {
			var t = _o();
			X(I(t), { name: "check-circle-2" }), k(2), O(t), G(e, t);
		}, b = /* @__PURE__ */ M(() => !H(n)?.hasChanges || !H(n).diff?.trim()), x = (e) => {
			var t = vo();
			Di(t, (e) => F(a, e), () => H(a)), G(e, t);
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
Sr(["click"]);
//#endregion
//#region src/components/detail.ts
function xo(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function So(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${Oo(e)}</pre>`;
}
function Co(e) {
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
function wo(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function To(e) {
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
function Eo(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function Do(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...Do(a.children || [], t, n, r + 1));
	return i;
}
function Oo(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/FileBrowser.svelte
var ko = /* @__PURE__ */ W("<h3><!><span> </span></h3>"), Ao = /* @__PURE__ */ W("<a class=\"artifact-download\"><!></a>"), jo = /* @__PURE__ */ W("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), Mo = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span> </span></div>"), No = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"file-browser\"><!> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function Po(e, t) {
	A(t, !0);
	let n = Oi(t, "entries", 19, () => []), r = Oi(t, "emptyMessage", 3, "No files."), i = Oi(t, "activePath", 3, ""), a = Oi(t, "showHeading", 3, !0), o = /* @__PURE__ */ M(() => Do(n(), t.expanded, t.title)), s = /* @__PURE__ */ M(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var l = No(), u = I(l), d = (e) => {
		var n = ko(), r = I(n);
		X(r, { get name() {
			return H(s);
		} });
		var i = R(r), a = I(i, !0);
		O(i), O(n), z(() => K(a, t.title)), G(e, n);
	};
	q(u, (e) => {
		a() && e(d);
	});
	var f = R(u, 2), p = I(f), m = I(p), h = (e) => {
		var n = Ar();
		J(L(n), 17, () => H(o), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ M(() => H(n).entry.type === "directory"), a = /* @__PURE__ */ M(() => t.expanded.has(`${t.title}:${H(n).entry.path}`));
			var o = jo(), s = I(o);
			let l;
			var u = I(s), d = I(u), f = I(d), p = (e) => {
				{
					let t = /* @__PURE__ */ M(() => H(a) ? "chevron-down" : "chevron-right");
					X(e, { get name() {
						return H(t);
					} });
				}
			};
			q(f, (e) => {
				H(r) && e(p);
			}), O(d);
			var m = R(d);
			{
				let e = /* @__PURE__ */ M(() => H(r) ? H(a) ? "folder-open" : "folder" : c(H(n).entry.name)), t = /* @__PURE__ */ M(() => H(r) ? "artifact-icon artifact-icon-dir" : "artifact-icon");
				X(m, {
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
				var r = Ao();
				X(I(r), {
					name: "download",
					className: "artifact-download-icon"
				}), O(r), z((e) => {
					Y(r, "href", e), Y(r, "download", H(n).entry.name), Y(r, "title", `Download ${H(n).entry.name}`), Y(r, "aria-label", `Download ${H(n).entry.name}`);
				}, [() => t.rawURL(t.title, H(n).entry.path, !0)]), U("click", r, (e) => e.stopPropagation()), G(e, r);
			};
			q(v, (e) => {
				H(r) || e(y);
			});
			var b = R(v), x = I(b, !0);
			O(b), O(_), O(s), O(o), z((e) => {
				l = ai(s, 1, "artifact-row", null, l, {
					directory: H(r),
					file: !H(r),
					active: i() === `${t.title}:${H(n).entry.path}`
				}), si(s, `--depth: ${H(n).depth}`), Y(h, "title", H(n).entry.path), K(g, H(n).entry.name), K(x, e);
			}, [() => H(r) ? `${(H(n).entry.children || []).length} items` : Eo(H(n).entry.size || 0)]), U("click", s, () => H(r) ? t.onToggle(`${t.title}:${H(n).entry.path}`) : t.onPreview(t.title, H(n).entry.path)), G(e, o);
		}), G(e, n);
	}, g = (e) => {
		var n = Mo(), i = I(n);
		{
			let e = /* @__PURE__ */ M(() => t.title === "Artifacts" ? "archive" : "inbox");
			X(i, { get name() {
				return H(e);
			} });
		}
		var a = R(i), o = I(a, !0);
		O(a), O(n), z(() => K(o, r())), G(e, n);
	};
	q(m, (e) => {
		H(o).length ? e(h) : e(g, -1);
	}), O(p), O(f), O(l), G(e, l), j();
}
Sr(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var Fo = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), Io = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), Lo = /* @__PURE__ */ W("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), Ro = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), zo = /* @__PURE__ */ W("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Bo = /* @__PURE__ */ W("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), Vo = /* @__PURE__ */ W("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Ho(e, t) {
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
	}), Ai(() => t.client.requests.abort(H(a)));
	var s = Ar(), c = L(s), l = (e) => {
		var a = Vo(), s = I(a), c = R(s, 2), l = I(c), u = I(l), d = I(u), f = I(d, !0);
		O(d);
		var p = R(d), m = I(p);
		O(p), O(u);
		var h = R(u), g = I(h);
		X(I(g), { name: "external-link" }), k(), O(g);
		var _ = R(g);
		X(I(_), { name: "x" }), O(_), O(h), O(l);
		var v = R(l, 2), y = (e) => {
			var n = Fo(), r = I(n);
			X(r, { name: "loader-circle" });
			var i = R(r, 2), a = I(i, !0);
			O(i), O(n), z(() => K(a, t.selection.path)), G(e, n);
		}, b = (e) => {
			var t = Io(), n = I(t);
			X(n, { name: "triangle-alert" });
			var r = R(n, 2), a = I(r, !0);
			O(r), O(t), z(() => K(a, H(i))), G(e, t);
		}, x = (e) => {
			var r = Lo(), i = I(r);
			O(r), z(() => {
				Y(i, "src", H(o)), Y(i, "alt", H(n).name || t.selection.path);
			}), G(e, r);
		}, S = (e) => {
			var r = Ro(), i = I(r);
			X(i, { name: "file-warning" });
			var a = R(i), o = I(a, !0);
			O(a);
			var s = R(a), c = I(s);
			O(s), O(r), z((e) => {
				K(o, H(n).name || t.selection.path), K(c, `Binary file, ${e ?? ""}.`);
			}, [() => Eo(H(n).size || 0)]), G(e, r);
		}, C = (e) => {
			var t = zo();
			Jr(t, () => So(H(n)?.content || ""), !0), O(t), G(e, t);
		}, w = /* @__PURE__ */ M(() => xo(H(n)?.path || t.selection.path)), T = (e) => {
			var t = Bo(), r = I(t, !0);
			O(t), z(() => K(r, H(n)?.content || "")), G(e, t);
		};
		q(v, (e) => {
			H(r) ? e(y) : H(i) ? e(b, 1) : H(n)?.image ? e(x, 2) : H(n)?.binary ? e(S, 3) : H(w) ? e(C, 4) : e(T, -1);
		}), O(c), O(a), z((e, r) => {
			Y(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${H(n)?.contentHash || "pending"}`), K(f, e), K(m, `${t.selection.path ?? ""}${r ?? ""}${H(n)?.truncated ? " · truncated" : ""}`), Y(g, "href", H(o));
		}, [() => H(n)?.name || t.selection.path.split("/").pop() || "File preview", () => H(n)?.size == null ? "" : ` · ${Eo(H(n).size)}`]), U("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), U("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), G(e, a);
	};
	q(c, (e) => {
		t.selection && e(l);
	}), G(e, s), j();
}
Sr(["click"]);
//#endregion
//#region src/components/LogTimeline.svelte
var Uo = /* @__PURE__ */ W("<div class=\"markdown-rendered\"></div>"), Wo = /* @__PURE__ */ W("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), Go = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), Ko = /* @__PURE__ */ W("<div class=\"log-load-actions\"><button type=\"button\" class=\"secondary-button log-load-more\"><!><span> </span></button></div>"), qo = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"log-timeline\"><div class=\"log-timeline\"></div> <!> <!></div>");
function Jo(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => [...t.logs || []].sort(wo)), r = /* @__PURE__ */ P(!1);
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
	var a = Ar(), o = L(a), s = (e) => {
		var a = qo(), o = I(a);
		J(o, 21, () => H(n), (e) => e.id, (e, t) => {
			var n = Wo(), r = I(n), i = I(r), a = I(i), o = I(a, !0);
			O(a);
			var s = R(a), c = I(s, !0);
			O(s), O(i);
			var l = R(i, 2), u = I(l, !0);
			O(l);
			var d = R(l, 2);
			X(I(d), { name: "chevron-right" }), O(d), O(r);
			var f = R(r, 2);
			let p;
			var m = I(f), h = (e) => {
				var n = Uo();
				Jr(n, () => So(H(t).details), !0), O(n), G(e, n);
			}, g = (e) => {
				G(e, kr("No details."));
			};
			q(m, (e) => {
				H(t).details ? e(h) : e(g, -1);
			}), O(f), O(n), z((e) => {
				Y(n, "data-log-id", H(t).id), Y(i, "title", H(t).time), K(o, e), K(c, H(t).time), K(u, H(t).title || "Untitled log entry"), p = ai(f, 1, "log-details", null, p, { empty: !H(t).details });
			}, [() => To(H(t).time)]), G(e, n);
		}), O(o);
		var s = R(o, 2), c = (e) => {
			var n = Go(), r = I(n, !0);
			O(n), z(() => K(r, t.error)), G(e, n);
		};
		q(s, (e) => {
			t.error && e(c);
		});
		var l = R(s, 2), u = (e) => {
			var n = Ko(), a = I(n), o = I(a);
			{
				let e = /* @__PURE__ */ M(() => t.loading || H(r) ? "loader-circle" : "chevron-down"), n = /* @__PURE__ */ M(() => t.loading || H(r) ? "spin" : "");
				X(o, {
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
				a.disabled = t.loading || H(r), Y(a, "aria-busy", t.loading || H(r)), K(c, t.loading || H(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), U("click", a, i), G(e, n);
		};
		q(l, (e) => {
			t.hasMore && e(u);
		}), O(a), z(() => Y(a, "data-log-resource", t.resourceId)), G(e, a);
	};
	q(o, (e) => {
		(H(n).length || t.error || t.hasMore) && e(s);
	}), G(e, a), j();
}
Sr(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var Yo = /* @__PURE__ */ W("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), Xo = /* @__PURE__ */ W("<pre class=\"markdown-view\"> </pre>"), Zo = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"markdown-document\"><!></div>");
function Qo(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => xo(t.file.name));
	var r = Zo(), i = I(r), a = (e) => {
		var n = Yo(), r = I(n);
		Jr(r, () => So(t.file.content || ""), !0), O(r), O(n), G(e, n);
	}, o = (e) => {
		var n = Xo(), r = I(n, !0);
		O(n), z(() => K(r, t.file.content || "")), G(e, n);
	};
	q(i, (e) => {
		H(n) ? e(a) : e(o, -1);
	}), O(r), z(() => {
		Y(r, "data-doc-file", t.file.name), Y(r, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`);
	}), G(e, r), j();
}
//#endregion
//#region src/components/SchedulerPanel.svelte
var $o = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary-button\">Cancel edit</button>"), es = /* @__PURE__ */ W("<article><header><div><strong> </strong><code> </code></div><div><button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button><button type=\"button\" class=\"secondary-button danger\"><!><span>Remove</span></button></div></header> <dl><div><dt>Condition</dt><dd> </dd></div><div><dt>Target</dt><dd><code> </code></dd></div></dl></article>"), ts = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No schedules. The Server will not create empty Scheduler Turns.</span></div>"), ns = /* @__PURE__ */ W("<div class=\"scheduler-settings-card\"><div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div> <label><input type=\"number\" min=\"1\" max=\"10080\" step=\"1\" aria-label=\"Scheduler wake interval in minutes\"/><span>minutes</span></label> <button type=\"button\" class=\"secondary-button\"><!><span>Save</span></button></div> <div class=\"schedule-editor\"><div class=\"schedule-editor-heading\"><div><strong> </strong><span>Conditions are natural language interpreted by the Scheduler Agent.</span></div><!></div> <label><span>Description</span><input placeholder=\"What should the Scheduler understand?\"/></label> <label><span>Condition</span><textarea rows=\"3\" placeholder=\"For example: when the release branch is green after 09:00 Shanghai time\"></textarea></label> <label><span>Target resource ID</span><input placeholder=\"workspace, scheduler, project1, or project1.task1\"/></label> <button type=\"button\"><!><span> </span></button></div> <div class=\"schedule-list\"><!></div>", 1);
function rs(e, t) {
	A(t, !0);
	let n = new fo();
	Ai(() => n.dispose());
	let r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P("workspace"), s = /* @__PURE__ */ P(30), c = /* @__PURE__ */ P(!1);
	bn(() => {
		F(s, t.config.wakeIntervalMinutes, !0);
	});
	function l(e) {
		F(r, e.id, !0), F(i, e.description, !0), F(a, e.condition, !0), F(o, e.target, !0);
	}
	function u() {
		F(r, ""), F(i, ""), F(a, ""), F(o, "workspace");
	}
	async function d() {
		if (!H(i).trim() || !H(a).trim() || !H(o).trim() || H(c)) return;
		F(c, !0);
		let e = !!H(r);
		try {
			let s = `/api/workspaces/${encodeURIComponent(t.workspaceId)}/scheduler${H(r) ? `/${encodeURIComponent(H(r))}` : ""}`;
			await n.request(s, {
				method: H(r) ? "PUT" : "POST",
				body: JSON.stringify({
					description: H(i),
					condition: H(a),
					target: H(o)
				})
			}), u(), await t.onChanged(), t.onToast(e ? "Schedule updated." : "Schedule added.");
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		} finally {
			F(c, !1);
		}
	}
	async function f(e) {
		if (window.confirm(`Remove schedule ${e.id}?`)) try {
			await n.request(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/scheduler/${encodeURIComponent(e.id)}`, { method: "DELETE" }), H(r) === e.id && u(), await t.onChanged(), t.onToast("Schedule removed.");
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	async function p() {
		if (!(!Number.isInteger(H(s)) || H(s) < 1 || H(s) > 10080 || H(c))) {
			F(c, !0);
			try {
				await n.request(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/scheduler/settings`, {
					method: "PUT",
					body: JSON.stringify({
						agentBinding: t.config.agentBinding,
						wakeIntervalMinutes: H(s)
					})
				}), await t.onChanged(), t.onToast("Scheduler interval saved.");
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				F(c, !1);
			}
		}
	}
	var m = ns(), h = L(m), g = R(I(h), 2), _ = I(g);
	gi(_), k(), O(g);
	var v = R(g, 2);
	X(I(v), { name: "save" }), k(), O(v), O(h);
	var y = R(h, 2), b = I(y), x = I(b), S = I(x), C = I(S, !0);
	O(S), k(), O(x);
	var w = R(x), T = (e) => {
		var t = $o();
		U("click", t, u), G(e, t);
	};
	q(w, (e) => {
		H(r) && e(T);
	}), O(b);
	var E = R(b, 2), ee = R(I(E));
	gi(ee), O(E);
	var te = R(E, 2), ne = R(I(te));
	it(ne), O(te);
	var re = R(te, 2), ie = R(I(re));
	gi(ie), O(re);
	var ae = R(re, 2), oe = I(ae);
	{
		let e = /* @__PURE__ */ M(() => H(c) ? "loader-circle" : H(r) ? "save" : "plus");
		X(oe, { get name() {
			return H(e);
		} });
	}
	var se = R(oe), ce = I(se, !0);
	O(se), O(ae), O(y);
	var le = R(y, 2), ue = I(le), de = (e) => {
		var n = Ar();
		J(L(n), 17, () => t.config.schedules, (e) => e.id, (e, t) => {
			var n = es();
			let i;
			var a = I(n), o = I(a), s = I(o), c = I(s, !0);
			O(s);
			var u = R(s), d = I(u, !0);
			O(u), O(o);
			var p = R(o), m = I(p);
			X(I(m), { name: "pencil" }), k(), O(m);
			var h = R(m);
			X(I(h), { name: "trash-2" }), k(), O(h), O(p), O(a);
			var g = R(a, 2), _ = I(g), v = R(I(_)), y = I(v, !0);
			O(v), O(_);
			var b = R(_), x = R(I(b)), S = I(x), C = I(S, !0);
			O(S), O(x), O(b), O(g), O(n), z(() => {
				i = ai(n, 1, "", null, i, { editing: H(r) === H(t).id }), K(c, H(t).description), K(d, H(t).id), K(y, H(t).condition), K(C, H(t).target);
			}), U("click", m, () => l(H(t))), U("click", h, () => f(H(t))), G(e, n);
		}), G(e, n);
	}, fe = (e) => {
		var t = ts();
		X(I(t), { name: "calendar-clock" }), k(), O(t), G(e, t);
	};
	q(ue, (e) => {
		t.config.schedules.length ? e(de) : e(fe, -1);
	}), O(le), z((e) => {
		v.disabled = H(c) || H(s) === t.config.wakeIntervalMinutes, K(C, H(r) ? "Edit schedule" : "Add schedule"), ae.disabled = e, K(ce, H(r) ? "Update schedule" : "Add schedule");
	}, [() => H(c) || !H(i).trim() || !H(a).trim() || !H(o).trim()]), Si(_, () => H(s), (e) => F(s, e)), U("click", v, p), Si(ee, () => H(i), (e) => F(i, e)), Si(ne, () => H(a), (e) => F(a, e)), Si(ie, () => H(o), (e) => F(o, e)), U("click", ae, d), G(e, m), j();
}
Sr(["click"]);
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var is = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), as = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), os = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), ss = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), cs = /* @__PURE__ */ W("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><!><span> </span></button></div></form>"), ls = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function us(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(""), l = /* @__PURE__ */ M(() => H(r) !== H(i)), u = /* @__PURE__ */ M(() => !!(H(l) && H(o) && H(a) && H(o) !== H(a)));
	bn(() => {
		let e = Co(t.file?.content || ""), u = t.file?.contentHash || "";
		F(o, u, !0), t.identity === H(n) ? !H(l) && u !== H(a) && (F(r, e, !0), F(i, e, !0), F(a, u, !0)) : (F(n, t.identity, !0), F(r, e, !0), F(i, e, !0), F(a, u, !0), F(c, ""), F(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), H(s) || !H(l)) return;
		let u = H(n);
		F(s, !0), F(c, "");
		try {
			let e = await t.onSave(H(r), H(a));
			if (H(n) !== u) return;
			F(i, Co(e.content || H(r)), !0), F(r, H(i), !0), F(a, e.contentHash || "", !0), F(o, H(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			H(n) === u && F(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(n) === u && (F(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = ls(), p = I(f);
	X(I(p), { name: "file-text" }), k(), O(p);
	var m = R(p, 2), h = (e) => {
		var t = is();
		X(I(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), k(), O(t), G(e, t);
	}, g = (e) => {
		var n = as(), r = I(n);
		X(r, { name: "triangle-alert" });
		var i = R(r, 2), a = I(i, !0);
		O(i), O(n), z(() => K(a, t.file.error)), G(e, n);
	}, _ = (e) => {
		var t = cs(), n = I(t);
		it(n);
		var i = R(n, 2), a = (e) => {
			G(e, os());
		};
		q(i, (e) => {
			H(u) && e(a);
		});
		var o = R(i, 2), f = (e) => {
			var t = ss(), n = I(t, !0);
			O(t), z(() => K(n, H(c))), G(e, t);
		};
		q(o, (e) => {
			H(c) && e(f);
		});
		var p = R(o, 2), m = I(p), h = I(m);
		{
			let e = /* @__PURE__ */ M(() => H(s) ? "loader-circle" : "save");
			X(h, { get name() {
				return H(e);
			} });
		}
		var g = R(h), _ = I(g, !0);
		O(g), O(m), O(p), O(t), z(() => {
			n.disabled = H(s), m.disabled = H(s) || !H(l), K(_, H(s) ? "Saving" : "Save");
		}), xr("submit", t, d), Si(n, () => H(r), (e) => F(r, e)), G(e, t);
	};
	q(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), O(f), G(e, f), j();
}
//#endregion
//#region src/components/DetailPanel.svelte
var ds = /* @__PURE__ */ W("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), fs = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), ps = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), ms = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> <span class=\"resource-creator-badge\"> </span></h1></div></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!></div>", 1), hs = /* @__PURE__ */ W("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), gs = /* @__PURE__ */ W("<code class=\"resource-ref-badge\"> </code>"), _s = /* @__PURE__ */ W("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), vs = /* @__PURE__ */ W("<button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button>"), ys = /* @__PURE__ */ W("<div class=\"details-actions\"><!><!></div>"), bs = /* @__PURE__ */ W("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), xs = /* @__PURE__ */ W("<span class=\"details-tab-count\"> </span>"), Ss = /* @__PURE__ */ W("<button type=\"button\" role=\"tab\"><!><span> </span><!></button>"), Cs = /* @__PURE__ */ W("<div><!></div>"), ws = /* @__PURE__ */ W("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), Ts = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), Es = /* @__PURE__ */ W("<div class=\"content-section\"><div class=\"template-list\"><!></div></div>"), Ds = /* @__PURE__ */ W("<div class=\"content-section\"><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), Os = /* @__PURE__ */ W("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), ks = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), As = /* @__PURE__ */ W("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><div class=\"worktree-list\"><!></div></div></div></div>", 1), js = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <!><span class=\"resource-creator-badge\"> </span></h1><!></div></div> <!>", 1), Ms = /* @__PURE__ */ W("<!> <!> <!>", 1);
function Ns(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P($t(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ P(null), s = /* @__PURE__ */ P(null), c = /* @__PURE__ */ new Map(), l = new fo(), u = /* @__PURE__ */ M(() => (H(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), d = /* @__PURE__ */ M(() => new Set(H(u).map((e) => e.name))), f = /* @__PURE__ */ M(h), p = /* @__PURE__ */ M(() => H(o) ? `${H(o).section}:${H(o).path}` : "");
	ki(() => t.channel.subscribe((e) => {
		if (F(n, e, !0), e.identity !== H(r)) {
			H(r) && H(i) && c.set(H(r), H(i)), F(r, e.identity, !0), F(o, null), F(s, null), F(a, /* @__PURE__ */ new Set(), !0), F(i, c.get(H(r)) || m(e), !0);
			let t = document.getElementById("detailsContent");
			t && (t.scrollTop = 0);
		} else H(f).length && !H(f).some((e) => e.id === H(i)) && F(i, H(f)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), ki(() => {
		let e = (e) => {
			e.key === "Escape" && (H(s) ? (e.preventDefault(), F(s, null)) : H(o) && (e.preventDefault(), F(o, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Ai(() => l.dispose());
	function m(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "scheduler" ? "context" : e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : t.some((e) => e.name === "work.md") ? "work" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "logs";
	}
	function h() {
		if (!H(n).detail) return [];
		if (H(n).resourceType === "scheduler") return [{
			id: "context",
			label: "Context",
			icon: "file-text"
		}, {
			id: "schedules",
			label: "Schedules",
			icon: "calendar-clock"
		}];
		let e = [];
		return H(d).has("project.md") && e.push({
			id: "project",
			label: "Project",
			icon: "file-text"
		}), H(d).has("task.md") && e.push({
			id: "task",
			label: "Task",
			icon: "file-text"
		}), H(d).has("work.md") && e.push({
			id: "work",
			label: "Work",
			icon: "file-text"
		}), (H(n).resourceType === "project" || H(n).detail.template) && e.push({
			id: "template",
			label: "Template",
			icon: "layout-template"
		}), e.push({
			id: "logs",
			label: "Logs",
			icon: "history"
		}, {
			id: "artifacts",
			label: "Artifacts",
			icon: "paperclip"
		}), H(n).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees",
			icon: "folder-git-2"
		}), e;
	}
	function g(e) {
		return e.name === "scheduler.md" ? "context" : e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : e.name === "work.md" ? "work" : H(f).find((e) => [
			"project",
			"task",
			"work"
		].includes(e.id))?.id || "";
	}
	function _(e) {
		F(i, e, !0), c.set(H(r), e);
	}
	function v(e) {
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function y() {
		return H(n).creator ? H(n).creator.kind === "user" ? "Created by user" : `Created by ${H(n).creator.resourceId || "resource"}` : "Creator unknown (legacy)";
	}
	function b() {
		return H(n).creator ? H(n).creator.kind === "user" ? "Creator provenance: user" : `Creator provenance: ${H(n).creator.workspaceInstanceId || "unknown Workspace"} / ${H(n).creator.resourceId || "unknown resource"}` : "This legacy resource has no persisted creator provenance.";
	}
	function x(e) {
		let t = new Set(H(a));
		t.has(e) ? t.delete(e) : t.add(e), F(a, t, !0), queueMicrotask(H(n).onIconsChanged);
	}
	function S(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(H(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function C(e, t) {
		F(o, {
			section: e,
			path: t
		}, !0);
	}
	function w(e) {
		e && H(n).onToast(e);
	}
	var T = Ms(), E = L(T), ee = (e) => {
		var t = ds(), n = I(t);
		X(I(n), {
			name: "folder-search",
			className: "empty-state-icon"
		}), k(2), O(n), O(t), G(e, t);
	}, te = (e) => {
		var t = ms(), r = L(t), i = I(r), o = I(i), s = I(o, !0);
		O(o), O(i);
		var c = R(i), l = I(c), u = I(l, !0), d = R(u), f = I(d, !0);
		O(d), O(l), O(c), O(r);
		var m = R(r, 2), h = I(m);
		us(h, {
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
		var g = R(h, 2), _ = (e) => {
			var t = fs(), r = I(t);
			X(I(r), { name: "book-open" }), k(), O(r);
			var i = R(r), a = I(i);
			X(a, { name: "triangle-alert" });
			var o = R(a, 2), s = I(o, !0);
			O(o), O(i), O(t), z(() => K(s, H(n).wiki.error)), G(e, t);
		}, v = (e) => {
			var t = ps(), n = I(t);
			X(I(n), { name: "book-open" }), k(), O(n);
			var r = R(n);
			X(I(r), { name: "book-open" }), k(2), O(r), O(t), G(e, t);
		}, w = (e) => {
			{
				let t = /* @__PURE__ */ M(() => H(n).wiki.entries || []);
				Po(e, {
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
					onToggle: x,
					onPreview: C,
					rawURL: S
				});
			}
		};
		q(g, (e) => {
			H(n).wiki?.error ? e(_) : H(n).wiki?.exists ? e(w, -1) : e(v, 1);
		}), O(m), z((e, t) => {
			K(s, H(n).workspaceName), K(u, H(n).workspaceName), Y(d, "title", e), K(f, t);
		}, [() => b(), () => y()]), U("click", o, () => H(n).onNavigate("workspace")), G(e, t);
	}, ne = (e) => {
		var t = js(), r = L(t), o = I(r), c = I(o), l = I(c, !0);
		O(c);
		var d = R(c, 2), m = (e) => {
			var t = hs(), r = R(L(t)), i = I(r, !0);
			O(r), z(() => K(i, H(n).parent.title)), U("click", r, () => H(n).onNavigate(H(n).parent?.id || "workspace")), G(e, t);
		};
		q(d, (e) => {
			H(n).parent && e(m);
		});
		var h = R(d, 3), w = I(h, !0);
		O(h), O(o);
		var T = R(o, 2), E = I(T), ee = I(E, !0), te = R(ee), ne = (e) => {
			var t = gs(), r = I(t, !0);
			O(t), z((e) => K(r, e), [() => v(H(n).resourceId)]), G(e, t);
		};
		q(te, (e) => {
			H(n).resourceType !== "scheduler" && e(ne);
		});
		var re = R(te), ie = I(re, !0);
		O(re), O(E);
		var ae = R(E), oe = (e) => {
			var t = ys(), r = I(t), i = (e) => {
				var t = _s();
				X(I(t), { name: "plus" }), k(), O(t), U("click", t, () => H(n).onCreateTask(H(n).resourceId)), G(e, t);
			};
			q(r, (e) => {
				H(n).resourceType === "project" && e(i);
			});
			var a = R(r), o = (e) => {
				var t = vs();
				X(I(t), { name: "archive" }), k(), O(t), U("click", t, () => H(n).onArchive(H(n).resourceId)), G(e, t);
			};
			q(a, (e) => {
				H(n).resourceType !== "scheduler" && e(o);
			}), O(t), G(e, t);
		};
		q(ae, (e) => {
			H(n).detail && e(oe);
		}), O(T), O(r);
		var se = R(r, 2), ce = (e) => {
			var t = bs(), n = I(t);
			X(I(n), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), k(), O(n), O(t), G(e, t);
		}, le = (e) => {
			var t = As(), r = L(t);
			J(r, 21, () => H(f), (e) => e.id, (e, t) => {
				var r = Ss();
				let a;
				var o = I(r);
				X(o, { get name() {
					return H(t).icon;
				} });
				var s = R(o), c = I(s, !0);
				O(s);
				var l = R(s), u = (e) => {
					var t = xs(), r = I(t, !0);
					O(t), z(() => K(r, H(n).detail.logs.length)), G(e, t);
				};
				q(l, (e) => {
					H(t).id === "logs" && H(n).detail.logs?.length && e(u);
				}), O(r), z(() => {
					a = ai(r, 1, "details-tab", null, a, { active: H(i) === H(t).id }), Y(r, "aria-selected", H(i) === H(t).id), K(c, H(t).label);
				}), U("click", r, () => _(H(t).id)), G(e, r);
			}), O(r);
			var o = R(r, 2), c = I(o);
			J(c, 17, () => H(u), (e) => e.path || e.name, (e, t) => {
				var r = Cs();
				Qo(I(r), {
					get file() {
						return H(t);
					},
					get workspaceId() {
						return H(n).workspaceId;
					}
				}), O(r), z((e) => Y(r, "hidden", e), [() => H(i) !== g(H(t))]), G(e, r);
			});
			var l = R(c, 2), d = (e) => {
				var t = Cs(), r = I(t);
				{
					let e = /* @__PURE__ */ M(() => H(n).onRefreshScheduler || (async () => void 0));
					rs(r, {
						get workspaceId() {
							return H(n).workspaceId;
						},
						get config() {
							return H(n).detail.scheduler;
						},
						get onChanged() {
							return H(e);
						},
						get onToast() {
							return H(n).onToast;
						}
					});
				}
				O(t), z(() => Y(t, "hidden", H(i) !== "schedules")), G(e, t);
			};
			q(l, (e) => {
				H(n).resourceType === "scheduler" && H(n).detail.scheduler && e(d);
			});
			var m = R(l, 2), h = I(m), v = (e) => {
				var t = Es(), r = I(t), i = I(r), a = (e) => {
					var t = Ar();
					J(L(t), 17, () => H(n).detail.templates, (e) => e.name, (e, t) => {
						var n = ws();
						let r;
						var i = I(n);
						X(i, { name: "file-text" });
						var a = R(i), o = I(a), s = I(o, !0);
						O(o);
						var c = R(o), l = I(c);
						O(c), O(a), X(R(a), { name: "chevron-right" }), O(n), z(() => {
							r = ai(n, 1, "template-row", null, r, { invalid: !H(t).valid }), K(s, H(t).title || H(t).name), K(l, `${H(t).name ?? ""} · v${(H(t).schemaVersion || "?") ?? ""} · ${H(t).valid ? `${(H(t).fields || []).length} fields` : `invalid${H(t).errors?.[0]?.message ? `: ${H(t).errors[0].message}` : ""}`}${H(t).legacy ? " · legacy" : ""}`);
						}), U("click", n, () => H(t).path && C("Templates", H(t).path)), G(e, n);
					}), G(e, t);
				}, o = (e) => {
					var t = Ts();
					X(I(t), { name: "layout-template" }), k(), O(t), G(e, t);
				};
				q(i, (e) => {
					H(n).detail.templates?.length ? e(a) : e(o, -1);
				}), O(r), O(t), G(e, t);
			}, y = (e) => {
				var t = Ds(), r = I(t), i = I(r), a = I(i);
				X(a, { name: "file-text" });
				var o = R(a), s = I(o), c = I(s, !0);
				O(s);
				var l = R(s), u = I(l);
				O(l), O(o), O(i), O(r), O(t), z(() => {
					K(c, H(n).detail.template.name), K(u, `Created from template · v${(H(n).detail.template.schemaVersion || "?") ?? ""} · ${(H(n).detail.template.digest || "") ?? ""}`);
				}), G(e, t);
			};
			q(h, (e) => {
				H(n).resourceType === "project" ? e(v) : H(n).detail.template && e(y, 1);
			}), O(m);
			var b = R(m, 2), w = I(b);
			{
				let e = /* @__PURE__ */ M(() => H(n).detail.logs || []);
				Jo(w, {
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
			O(b);
			var T = R(b, 2), E = I(T);
			{
				let e = /* @__PURE__ */ M(() => H(n).detail.artifacts || []);
				Po(E, {
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
					onToggle: x,
					onPreview: C,
					rawURL: S,
					showHeading: !1
				});
			}
			O(T);
			var ee = R(T, 2), te = I(ee), ne = I(te), re = I(ne), ie = (e) => {
				var t = Ar();
				J(L(t), 17, () => H(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = Os(), r = I(n), i = I(r);
					X(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = R(i), o = I(a), c = I(o, !0);
					O(o);
					var l = R(o), u = I(l);
					O(l);
					var d = R(l), f = I(d, !0);
					O(d), O(a), O(r);
					var p = R(r);
					X(I(p), { name: "git-compare-arrows" }), k(), O(p), O(n), z(() => {
						K(c, H(t).branch || "HEAD"), K(u, `${(H(t).name || "repository") ?? ""}${H(t).targetBranch || H(t).baseBranch ? ` · base ${H(t).targetBranch || H(t).baseBranch}` : ""}`), K(f, H(t).worktreePath || "");
					}), U("click", p, () => F(s, H(t), !0)), G(e, n);
				}), G(e, t);
			}, ae = (e) => {
				var t = ks();
				X(I(t), { name: "git-branch" }), k(), O(t), G(e, t);
			};
			q(re, (e) => {
				H(n).detail.repos?.length ? e(ie) : e(ae, -1);
			}), O(ne), O(te), O(ee), O(o), z(() => {
				Y(m, "hidden", H(i) !== "template"), Y(b, "hidden", H(i) !== "logs"), Y(T, "hidden", H(i) !== "artifacts"), Y(ee, "hidden", H(i) !== "worktrees");
			}), G(e, t);
		};
		q(se, (e) => {
			H(n).loading || !H(n).detail ? e(ce) : e(le, -1);
		}), z((e, t) => {
			K(l, H(n).workspaceName), K(w, H(n).resourceTitle), K(ee, H(n).resourceTitle), Y(re, "title", e), K(ie, t);
		}, [() => H(n).resourceType === "scheduler" ? "Special Forge-managed Workspace resource" : b(), () => H(n).resourceType === "scheduler" ? "Forge-managed" : y()]), U("click", c, () => H(n).onNavigate("workspace")), U("click", h, () => H(n).onNavigate(H(n).resourceId)), G(e, t);
	};
	q(E, (e) => {
		H(n).workspaceId ? H(n).resourceType === "workspace" ? e(te, 1) : e(ne, -1) : e(ee);
	});
	var re = R(E, 2);
	Ho(re, {
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
		onClose: () => F(o, null),
		onError: w,
		get onIconsChanged() {
			return H(n).onIconsChanged;
		}
	}), bo(R(re, 2), {
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
		onClose: () => F(s, null),
		onError: w,
		get onIconsChanged() {
			return H(n).onIconsChanged;
		}
	}), G(e, T), j();
}
Sr(["click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var Ps = /* @__PURE__ */ W("<p class=\"approval-question\"> </p>"), Fs = /* @__PURE__ */ W("<p> </p>"), Is = /* @__PURE__ */ W("<button> </button>"), Ls = /* @__PURE__ */ W("<div class=\"approval-options\"></div>"), Rs = /* @__PURE__ */ W("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), zs = /* @__PURE__ */ W("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), Bs = /* @__PURE__ */ W("<!> <!>", 1), Vs = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function Hs(e, t) {
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
				await t.onApproval(t.generationId, i, e), F(n, "");
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
	var c = Vs(), l = I(c), u = I(l);
	X(u, { name: "shield-question" });
	var d = R(u), f = I(d, !0);
	O(d), O(l);
	var p = R(l, 2), m = (e) => {
		var n = Ps(), r = I(n, !0);
		O(n), z(() => K(r, t.item.question)), G(e, n);
	};
	q(p, (e) => {
		t.item.question && e(m);
	});
	var h = R(p, 2), g = (e) => {
		var n = Fs(), r = I(n, !0);
		O(n), z(() => K(r, t.item.detail)), G(e, n);
	};
	q(h, (e) => {
		t.item.detail && e(g);
	});
	var _ = R(h, 2), v = (e) => {
		var i = Bs(), a = L(i), c = (e) => {
			var n = Ls();
			J(n, 21, () => t.item.options, (e) => e.optionId, (e, t) => {
				var n = Is();
				let i;
				var a = I(n, !0);
				O(n), z((e, t) => {
					n.disabled = H(r), i = ai(n, 1, "", null, i, e), K(a, t);
				}, [() => ({ "secondary-button": String(H(t).kind || "").startsWith("reject") }), () => s(H(t))]), U("click", n, () => o({ optionId: H(t).optionId })), G(e, n);
			}), O(n), G(e, n);
		}, l = (e) => {
			var t = Rs(), n = I(t);
			X(I(n), { name: "check" }), k(), O(n);
			var i = R(n);
			X(I(i), { name: "x" }), k(), O(i), O(t), z(() => {
				n.disabled = H(r), i.disabled = H(r);
			}), U("click", n, () => o({ decision: "accept" })), U("click", i, () => o({ decision: "decline" })), G(e, t);
		};
		q(a, (e) => {
			t.item.options?.length ? e(c) : e(l, -1);
		});
		var u = R(a, 2), d = (e) => {
			var t = zs(), i = I(t);
			gi(i);
			var a = R(i);
			O(t), z((e) => a.disabled = e, [() => !H(n).trim() || H(r)]), xr("submit", t, (e) => {
				e.preventDefault(), H(n).trim() && o({ text: H(n).trim() });
			}), Si(i, () => H(n), (e) => F(n, e)), G(e, t);
		};
		q(u, (e) => {
			t.item.question && e(d);
		}), G(e, i);
	}, y = (e) => {
		var n = Fs(), r = I(n);
		O(n), z(() => K(r, `${(t.item.decision || (t.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${t.item.reply ? `: ${t.item.reply}` : ""}`)), G(e, n);
	};
	q(_, (e) => {
		t.item.status === "pending" ? e(v) : e(y, -1);
	}), O(c), z(() => K(f, t.item.title || "Approval requested")), G(e, c), j();
}
Sr(["click"]);
//#endregion
//#region src/components/timeline-events.ts
function Us(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? Zs(r, n) : Qs(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function Ws(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) Gs(n, e);
	return n;
}
function Gs(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, Qs(t));
		return;
	}
	e[a] = Zs(e[a], t);
}
function Ks(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = qs(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? Js(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function qs(e) {
	if (e.type !== "tool.event") return "";
	let t = Ys(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? Ys(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? Xs(n.toolCallId) || Xs(n.id) : "";
}
function Js(e, t) {
	let n = e.data || {}, r = t.data || {}, i = Ys(n.raw), a = Ys(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? Ys(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? Ys(a.update) : a;
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
function Ys(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Xs(e) {
	return typeof e == "string" ? e.trim() : "";
}
function Zs(e, t) {
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
function Qs(e) {
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
var $s = 20, ec = 250, tc = 80, nc = /* @__PURE__ */ new Set(["session.launch-environment"]), rc = class {
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
		this.api = e.api ?? new fo(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? tc);
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t, n) {
		if (this.disposed) return;
		let r = oc(e, t), i = this.activeKey !== r;
		if (this.activeKey && i && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !r) {
			this.emit();
			return;
		}
		let a = this.contexts.get(r) ?? this.createContext(e, t), o = String(n?.generation?.generationId || ""), s = !!(a.generationId && o && a.generationId !== o);
		a.status = n, a.generationId = o, s ? (this.closeStream(a), a.loaded = !1, a.nextCursor = "", a.hasMoreBefore = !1, this.loadInitial(a)) : !a.loaded && !a.loading ? this.loadInitial(a) : this.connect(a), (i || s) && this.emit();
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.nextCursor) return !1;
		let t = e.requestGeneration, n = e.nextCursor;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest(dc(e, n), { scope: lc(e, "older") });
			return this.isCurrent(e, t) ? (this.mergePage(e, r), r.segments.some((e) => e.turns?.length || e.gap)) : !1;
		} catch (n) {
			return n instanceof lo || !this.isCurrent(e, t) || (e.error = xc(n)), !1;
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
			let r = await this.api.latest(fc(t, e), { scope: lc(t, `turn:${e}`) });
			if (!this.isCurrent(t, n)) return;
			if (t.details.set(e, r), !r.turn.closed && r.turn.generation.generationId === t.generationId) {
				let i = await this.loadTurnRange(t, r, n);
				if (!this.isCurrent(t, n)) return;
				t.liveEvents.set(e, i);
			}
			this.connect(t);
		} catch (r) {
			if (r instanceof lo || !this.isCurrent(t, n)) return;
			t.detailErrors.set(e, xc(r));
		} finally {
			this.isCurrent(t, n) && (t.detailLoading.delete(e), this.emit());
		}
	}
	async expandRange(e, t, n) {
		let r = this.activeContext();
		if (!r || e !== r.generationId || t <= 0 || n < t) return;
		let i = r.requestGeneration, a = await this.fetchEventRange(r, t, n, i, `range:${t}:${n}`);
		if (!this.isCurrent(r, i)) return;
		let o = this.turnReferenceForEvent(r, e, t);
		o && (r.liveEvents.set(o, Ks(Us([...r.liveEvents.get(o) || [], ...a]))), this.emit());
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
		} : Sc();
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
			key: oc(e, t),
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
			let n = await this.api.latest(dc(e), { scope: lc(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			e.segments.clear(), e.details.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), this.mergePage(e, n), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof lo || !this.isCurrent(e, t)) return;
			e.error = xc(n);
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
			n && (e.liveEvents.set(t.reference, Ks(Us([...e.liveEvents.get(t.reference) || [], ...n]))), e.orphanEvents.delete(t.turnId));
		}
		e.nextCursor = String(t.page?.nextCursor || ""), e.hasMoreBefore = !!(t.page?.hasMore && e.nextCursor);
	}
	blocks(e) {
		let t = [], n = [...e.segments.values()].sort((e, t) => e.generation.generation - t.generation.generation), r = n.find((t) => t.generation.generationId === e.generationId)?.generation || mc(e), i = r ? this.orphanEventBlocks(e, r) : [];
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
					items: i && !a ? ic(i, r.generation.generationId) : void 0,
					events: a?.filter((e) => !nc.has(e.type)),
					loading: e.detailLoading.has(t.reference),
					error: e.detailErrors.get(t.reference)
				});
			}
			r.generation.generationId === e.generationId && n.push(...i), n.sort((e, t) => cc(e) - cc(t)), t.push(...n);
		}
		return i.length && !n.some((t) => t.generation.generationId === e.generationId) && t.push(...i), t;
	}
	orphanEventBlocks(e, t) {
		let n = [];
		for (let [r, i] of e.orphanEvents) {
			let a = i.filter((e) => !nc.has(e.type)), o = [];
			for (let i of a) o.length && Number(i.id) !== Number(o[o.length - 1].id) + 1 && (n.push(sc(e, r, t, o)), o = []), o.push(i);
			o.length && n.push(sc(e, r, t, o));
		}
		return n.sort((e, t) => cc(e) - cc(t));
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !e.generationId || !_c(e.status)) return;
		let t = pc(e), n = new URLSearchParams({ generationId: e.generationId });
		t && n.set("after", String(t));
		let r = ++e.streamGeneration, i = this.eventSourceFactory(`${uc(e)}/stream?${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.resourceId, n), this.scheduleEventFlush(e), vc(n) && this.materializeTerminalTurn(e, String(n.turnId || ""), r);
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
			this.isActiveStream(e, i, r) || i.close();
		};
	}
	async loadTurnRange(e, t, n) {
		let r = Math.max(1, Number(t.turn.startEventId) || 1), i = Math.max(r, Number(t.turn.lastEventId) || 0, Number(t.latestEventId) || 0);
		return this.fetchEventRange(e, r, i, n, `live-turn:${t.turn.reference}`);
	}
	async fetchEventRange(e, t, n, r, i) {
		let a = t - 1, o = [];
		for (; a < n;) {
			let s = new URLSearchParams({
				generationId: e.generationId,
				start: String(t),
				end: String(n),
				after: String(a),
				limit: String(ec)
			}), c = await this.api.latest(`${uc(e)}/events?${s}`, { scope: lc(e, i) });
			if (!this.isCurrent(e, r)) return [];
			let l = hc(c.events).filter((t) => this.eventBelongsToContext(e, t));
			o = Us([...o, ...l]);
			let u = Number(c.page?.nextAfter) || gc(l);
			if (!c.page?.hasMore || !u || u <= a) break;
			a = u;
		}
		return o;
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
					let i = await this.api.latest(dc(e), { scope: lc(e, `terminal-head:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.mergePage(e, i);
					let a = this.findTurnById(e, r, t);
					if (!a?.closed) throw Error("Turn projection is not closed yet");
					let o = await this.api.latest(fc(e, a.reference), { scope: lc(e, `terminal:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.flushEvents(e, !1), e.details.set(a.reference, o), e.liveEvents.delete(a.reference), this.emit();
					return;
				} catch (t) {
					if (t instanceof lo || !e.stream || !this.isActiveStream(e, e.stream, n)) return;
					if (i === 2) {
						e.error = xc(t), this.emit();
						return;
					}
					await yc(50 * (i + 1));
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
			let n = await this.api.latest(dc(e), { scope: lc(e, "stream-head") });
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
	eventBelongsToContext(e, t) {
		let n = String(t.sessionId || "");
		return !n || !e.status?.session?.id || n === e.status.session.id;
	}
	appendNotice(e, t) {
		e.notices.some((e) => bc(e) === bc(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
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
			let n = this.turnReferenceForEvent(e, e.generationId, Number(t.id));
			if (n) e.liveEvents.set(n, Ks(Ws(e.liveEvents.get(n) || [], [t])));
			else {
				let n = String(t.turnId || "current");
				e.orphanEvents.set(n, Ks(Ws(e.orphanEvents.get(n) || [], [t]))), vc(t) || this.refreshHead(e);
			}
		}
		t && this.isActive(e) && this.emit();
	}
	closeStream(e) {
		e.streamGeneration++, e.stream?.close(), e.stream = null;
	}
	deactivate(e) {
		e && (e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.requestGeneration++, this.closeStream(e), e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(lc(e, "initial")), this.api.requests.abort(lc(e, "older")));
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
function ic(e, t) {
	return (e.items || []).flatMap((e) => ac(e, t));
}
function ac(e, t) {
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
		case "tool": return [{
			...r,
			kind: "tools",
			compact: !0,
			rangeStartEventId: e.startEventId,
			rangeEndEventId: e.endEventId,
			calls: [{
				key: n,
				callId: n,
				name: "Tool activity",
				summary: `${Math.max(1, Number(e.count) || 1)} call(s) · details omitted`,
				status: "completed"
			}]
		}];
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
		case "lifecycle": return e.text ? [{
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
function oc(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function sc(e, t, n, r) {
	let i = r[0]?.id ?? 0;
	return {
		kind: "turn",
		key: `${e.generationId}:${t || "current"}:${i}`,
		generation: n,
		events: r
	};
}
function cc(e) {
	if (e.turn) return Number(e.turn.startEventId) || 0;
	let t = e.events?.[0];
	return t && Number(t.id) || 0;
}
function lc(e, t) {
	return `resource-chat:${e.key}:${t}`;
}
function uc(e) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/resources/${encodeURIComponent(e.resourceId)}`;
}
function dc(e, t = "") {
	let n = new URLSearchParams({ limit: String($s) });
	return t && n.set("cursor", t), `${uc(e)}/history/turns?${n}`;
}
function fc(e, t) {
	return `${uc(e)}/history/turns/${encodeURIComponent(t)}`;
}
function pc(e) {
	let t = [...e.segments.values()].filter((t) => t.generation.generationId === e.generationId).flatMap((e) => e.turns || []), n = [...e.liveEvents.values()].flat();
	return Math.max(0, ...t.map((e) => Number(e.lastEventId) || 0), ...n.map((e) => Number(e.id) || 0));
}
function mc(e) {
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
function hc(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function gc(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function _c(e) {
	return !!(e?.generation?.generationId && e.session?.id && [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e.generation.status || "")));
}
function vc(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function yc(e) {
	return new Promise((t) => setTimeout(t, e));
}
function bc(e) {
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
function xc(e) {
	return e instanceof Error ? e.message : String(e);
}
function Sc() {
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
var Cc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function wc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => t.item.tone === "ok" ? "check-circle" : t.item.tone === "danger" ? "triangle-alert" : t.item.tone === "info" ? "info" : "clock");
	function r() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var i = Cc(), a = I(i);
	X(a, { get name() {
		return H(n);
	} });
	var o = R(a), s = I(o, !0);
	O(o);
	var c = R(o), l = I(c, !0);
	O(c), O(i), z((e) => {
		ai(i, 1, `agent-system-note agent-lifecycle-${t.item.tone || "muted"}`), K(s, t.item.text || ""), K(l, e);
	}, [() => r()]), G(e, i), j();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var Tc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function Ec(e, t) {
	A(t, !0);
	let n = Oi(t, "onExpand", 3, () => {});
	function r() {
		if (t.item.active) return "Thinking…";
		if (!t.item.startTime || !t.item.time) return "Thought";
		let e = Math.round((new Date(t.item.time).getTime() - new Date(t.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var i = Tc(), a = I(i), o = I(a);
	X(o, { name: "brain-circuit" });
	var s = R(o), c = I(s, !0);
	O(s);
	var l = R(s);
	X(I(l), { name: "chevron-right" }), O(l), O(a);
	var u = R(a, 2), d = I(u, !0);
	O(u), O(i), z((e) => {
		i.open = t.item.active, K(c, e), K(d, t.item.text || "");
	}, [() => r()]), xr("toggle", i, (e) => {
		e.currentTarget.open && n()();
	}), G(e, i), j();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var Dc = /* @__PURE__ */ W("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), Oc = /* @__PURE__ */ W("<span class=\"agent-message-tag\">steer</span>"), kc = /* @__PURE__ */ W("<span class=\"agent-message-source\"> </span>"), Ac = /* @__PURE__ */ W("<div class=\"agent-message-content markdown-rendered\"></div>"), jc = /* @__PURE__ */ W("<p> </p>"), Mc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function Nc(e, t) {
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
	var s = Mc(), c = I(s), l = I(c), u = I(l), d = I(u, !0);
	O(u);
	var f = R(u, 2), p = (e) => {
		var t = Dc(), r = I(t, !0);
		O(t), z(() => K(r, H(n))), G(e, t);
	};
	q(f, (e) => {
		H(n) !== "assistant" && e(p);
	});
	var m = R(f, 2), h = (e) => {
		G(e, Oc());
	};
	q(m, (e) => {
		t.item.steer && e(h);
	});
	var g = R(m, 2), _ = (e) => {
		var n = kc(), r = I(n);
		O(n), z(() => {
			Y(n, "title", t.item.sender.sessionId), K(r, `from session ${t.item.sender.sessionId ?? ""}`);
		}), G(e, n);
	};
	q(g, (e) => {
		H(n) === "agent" && t.item.sender?.sessionId && e(_);
	});
	var v = R(g, 2), y = I(v, !0);
	O(v), O(l);
	var b = R(l, 2), x = I(b), S = (e) => {
		var t = Ac();
		Jr(t, a, !0), O(t), G(e, t);
	}, C = (e) => {
		var n = jc(), r = I(n, !0);
		O(n), z(() => K(r, t.item.text || "")), G(e, n);
	};
	q(x, (e) => {
		H(n) === "assistant" ? e(S) : e(C, -1);
	}), O(b), O(c), O(s), z((e, t) => {
		ai(s, 1, `agent-message-row ${H(n) === "assistant" ? "assistant final" : H(n)}`), K(d, e), K(y, t);
	}, [() => r(), () => i()]), G(e, s), j();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var Pc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function Fc(e, t) {
	let n = Oi(t, "error", 3, !1), r = Oi(t, "alert", 3, !1);
	var i = Pc();
	let a;
	var o = I(i), s = I(o);
	{
		let e = /* @__PURE__ */ M(() => n() ? "triangle-alert" : "info");
		X(s, { get name() {
			return H(e);
		} });
	}
	var c = R(s), l = I(c, !0);
	O(c), O(o);
	var u = R(o, 2), d = I(u, !0);
	O(u), O(i), z(() => {
		a = ai(i, 1, "timeline-notice", null, a, { "timeline-notice-error": n() }), Y(i, "role", r() ? "alert" : void 0), K(l, t.title), K(d, t.text);
	}), G(e, i);
}
//#endregion
//#region src/components/ToolItem.svelte
var Ic = /* @__PURE__ */ W("<pre> </pre>"), Lc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\"><summary><!><span> </span><small> </small></summary> <!></details>");
function Rc(e, t) {
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
	var i = Lc(), a = I(i), o = I(a);
	{
		let e = /* @__PURE__ */ M(() => t.call.status === "running" ? "loader-circle" : t.call.status === "failed" ? "x-circle" : "check-circle");
		X(o, { get name() {
			return H(e);
		} });
	}
	var s = R(o), c = I(s, !0);
	O(s);
	var l = R(s), u = I(l, !0);
	O(l), O(a);
	var d = R(a, 2), f = (e) => {
		var t = Ic(), n = I(t, !0);
		O(t), z((e) => K(n, e), [() => r()]), G(e, t);
	}, p = /* @__PURE__ */ M(() => r());
	q(d, (e) => {
		H(p) && e(f);
	}), O(i), z((e, t, n) => {
		ai(i, 1, e), K(c, t), K(u, n);
	}, [
		() => `agent-tool-item agent-tool-${String(t.call.status || "completed")}`,
		() => n(),
		() => String(t.call.method || "tool")
	]), G(e, i), j();
}
//#endregion
//#region src/components/ToolGroup.svelte
var zc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function Bc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => t.item.calls || []), r = /* @__PURE__ */ M(() => H(n).map(i));
	function i(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var a = zc(), o = I(a), s = I(o);
	X(I(s), { name: "wrench" }), O(s);
	var c = R(s), l = I(c);
	O(c);
	var u = R(c), d = I(u);
	O(u);
	var f = R(u);
	X(I(f), { name: "chevron-right" }), O(f), O(o);
	var p = R(o, 2);
	J(p, 21, () => H(n), (e) => String(e.callId || e.key), (e, t) => {
		Rc(e, { get call() {
			return H(t);
		} });
	}), O(p), O(a), z((e, i) => {
		Y(a, "data-tool-group-key", e), a.open = t.open, K(l, `${H(n).length ?? ""} tool ${H(n).length === 1 ? "call" : "calls"}`), K(d, `${i ?? ""}${H(r).length > 2 ? ` · +${H(r).length - 2} more` : ""}`);
	}, [() => `${t.generationId}:${String(t.item.key || t.item.time || "tools")}`, () => H(r).slice(0, 2).join(" · ")]), xr("toggle", a, (e) => t.onToggle(e.currentTarget.open)), G(e, a), j();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var Vc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function Hc(e, t) {
	A(t, !0);
	var n = Vc(), r = I(n), i = I(r);
	X(i, { name: "info" });
	var a = R(i), o = I(a);
	O(a), O(r);
	var s = R(r), c = I(s, !0);
	O(s), O(n), z(() => {
		K(o, `Unhandled event: ${(t.item.type || t.item.kind) ?? ""}`), K(c, t.item.preview || "This event carries no payload.");
	}), G(e, n), j();
}
//#endregion
//#region src/components/EventTimeline.svelte
var Uc = /* @__PURE__ */ W("<button type=\"button\" class=\"load-older-events\"><!><span> </span></button>"), Wc = /* @__PURE__ */ W("<div class=\"conversation-generation\"><span> </span><strong> </strong><small> </small></div>"), Gc = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary-button\">Retry</button>"), Kc = /* @__PURE__ */ W("<div class=\"conversation-gap\"><!><span><strong>History unavailable</strong><small> </small></span><!></div>"), qc = /* @__PURE__ */ W("<div class=\"turn-summary-preview\"> </div>"), Jc = /* @__PURE__ */ W("<div><!></div>"), Yc = /* @__PURE__ */ W("<div class=\"turn-loading\"><!><span>Loading turn details</span></div>"), Xc = /* @__PURE__ */ W("<section><!> <!> <!> <!></section>"), Zc = /* @__PURE__ */ W("<!> <!>", 1), Qc = /* @__PURE__ */ W("<div class=\"turn-working-indicator\" role=\"status\" aria-live=\"polite\" data-timeline-key=\"turn-working\"><!><span>working...</span></div>"), $c = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>Loading resource history</strong></div>"), el = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>"), tl = /* @__PURE__ */ W("<!> <!> <!> <!> <!> <!> <!>", 1), nl = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>No resource selected</strong></div>"), rl = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div>");
function il(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P($t(t.channel.current().project)), i = /* @__PURE__ */ P($t(te())), a = /* @__PURE__ */ P(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ P($t(/* @__PURE__ */ new Map()));
	ki(() => {
		let e = x();
		o = new rc({
			onEvent: (e, t, r) => H(n).onEvent(e, t, r),
			onNotice: (e, t, r) => H(n).onNotice(e, t, r)
		});
		let i = o.subscribe(f), a = t.channel.subscribe((e) => {
			let t = H(n).identity, i = w(H(n).status) !== w(e.status) && C(x());
			F(n, e, !0), e.project !== H(r) && F(r, e.project, !0), e.identity !== t && (l = !0, s = null, F(d, new Map(u.get(e.identity) ?? []), !0)), o?.activate(e.workspaceId, e.resourceId, e.status), lr().then(() => {
				i && !S() && T(), e.onIconsChanged();
			});
		}), c = () => {
			if (!s || S()) return;
			let e = s;
			s = null, p(e);
		};
		return document.addEventListener("selectionchange", c), () => {
			i(), a(), document.removeEventListener("selectionchange", c), o?.dispose(), o = void 0, e && e.removeAttribute("data-agent-resource-id");
		};
	});
	function f(e) {
		if (H(i).identity && e.identity === H(i).identity && S()) {
			s = e;
			return;
		}
		p(e);
	}
	function p(e) {
		let t = x();
		c = e.identity !== H(i).identity || l || C(t), l = !1, F(i, e, !0), t && (t.dataset.agentResourceId = e.resourceId), lr().then(() => {
			c && !S() && T(), H(n).onIconsChanged(), e.loaded && e.hasMoreBefore && g(e.identity);
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
			root: x(),
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
		return e.events ? H(r)(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || [];
	}
	async function g(e) {
		let t = 0;
		for (; t < 16 && H(i).identity === e && H(i).hasMoreBefore;) {
			let e = x();
			if (!e || e.scrollHeight > e.clientHeight + 160 || S() || !await o?.loadOlder()) return;
			t++, await lr(), T();
		}
	}
	async function _() {
		let e = x();
		if (!e || H(i).loadingOlder) return;
		let t = E(e), r = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = H(i).identity;
		await o?.loadOlder(), await lr(), H(i).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - r) : s + (e.scrollHeight - a), H(n).onIconsChanged());
	}
	function v(e, t) {
		let n = ee(e);
		F(d, new Map(H(d)).set(n, t), !0), u.set(H(i).identity, new Map(H(d))), t && y(e);
	}
	function y(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return o?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function b(e) {
		return H(d).get(ee(e)) ?? !1;
	}
	function x() {
		return H(a)?.parentElement ?? null;
	}
	function S() {
		let e = x(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function C(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function w(e) {
		return e?.session?.state === "running" && !!e.session.currentTurnId;
	}
	function T() {
		let e = x();
		e && (e.scrollTop = e.scrollHeight);
	}
	function E(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function ee(e) {
		return `${e.generationId || H(i).generationId}:${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
	}
	function te() {
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
	var ne = rl(), re = I(ne), ie = (e) => {
		var t = tl(), r = L(t), a = (e) => {
			var t = Uc(), n = I(t);
			{
				let e = /* @__PURE__ */ M(() => H(i).loadingOlder ? "loader-circle" : "chevrons-up");
				X(n, { get name() {
					return H(e);
				} });
			}
			var r = R(n), a = I(r, !0);
			O(r), O(t), z(() => {
				t.disabled = H(i).loadingOlder, K(a, H(i).loadingOlder ? "Loading..." : "Load older messages");
			}), U("click", t, _), G(e, t);
		};
		q(r, (e) => {
			H(i).hasMoreBefore && e(a);
		});
		var s = R(r, 2);
		J(s, 19, () => H(i).blocks, (e) => e.key, (e, t, r) => {
			var a = Zc(), s = L(a), c = (e) => {
				var n = Wc(), r = I(n), i = I(r);
				O(r);
				var a = R(r), o = I(a, !0);
				O(a);
				var s = R(a), c = I(s, !0);
				O(s), O(n), z(() => {
					Y(n, "data-generation-id", H(t).generation.generationId), K(i, `Generation ${H(t).generation.generation ?? ""}`), K(o, H(t).generation.agentName || H(t).generation.resolvedProfile || H(t).generation.binding?.name || "Agent"), K(c, H(t).generation.status);
				}), G(e, n);
			};
			q(s, (e) => {
				(H(r) === 0 || H(i).blocks[H(r) - 1].generation.generationId !== H(t).generation.generationId) && e(c);
			});
			var l = R(s, 2), u = (e) => {
				var n = Kc(), r = I(n);
				X(r, { name: "triangle-alert" });
				var i = R(r), a = R(I(i)), s = I(a, !0);
				O(a), O(i);
				var c = R(i), l = (e) => {
					var t = Gc();
					U("click", t, () => o?.retryHistory()), G(e, t);
				};
				q(c, (e) => {
					H(t).gap?.retryable && e(l);
				}), O(n), z(() => {
					Y(n, "data-timeline-key", H(t).key), K(s, H(t).gap?.message || "This generation could not be read.");
				}), G(e, n);
			}, d = (e) => {
				var r = Xc();
				let a;
				var o = I(r), s = (e) => {
					var n = qc(), r = I(n, !0);
					O(n), z(() => K(r, H(t).turn.triggerPreview)), G(e, n);
				};
				q(o, (e) => {
					H(t).turn?.triggerPreview && !H(t).items && !H(t).events && e(s);
				});
				var c = R(o, 2);
				J(c, 17, () => h(H(t)), (e) => ee(e), (e, r) => {
					var a = Jc(), o = I(a), s = (e) => {
						Nc(e, {
							get item() {
								return H(r);
							},
							get agentName() {
								return H(n).agentName;
							}
						});
					}, c = (e) => {
						Ec(e, {
							get item() {
								return H(r);
							},
							onExpand: () => y(H(r))
						});
					}, l = (e) => {
						{
							let n = /* @__PURE__ */ M(() => b(H(r)));
							Bc(e, {
								get item() {
									return H(r);
								},
								get generationId() {
									return H(t).generation.generationId;
								},
								get open() {
									return H(n);
								},
								onToggle: (e) => v(H(r), e)
							});
						}
					}, u = (e) => {
						Hs(e, {
							get item() {
								return H(r);
							},
							get generationId() {
								return H(t).generation.generationId;
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
						wc(e, { get item() {
							return H(r);
						} });
					}, f = (e) => {
						{
							let t = /* @__PURE__ */ M(() => H(r).text || "");
							Fc(e, {
								title: "Provider error",
								get text() {
									return H(t);
								},
								error: !0
							});
						}
					}, p = (e) => {
						Hc(e, { get item() {
							return H(r);
						} });
					};
					q(o, (e) => {
						H(r).kind === "message" ? e(s) : H(r).kind === "thinking" ? e(c, 1) : H(r).kind === "tools" ? e(l, 2) : H(r).kind === "approval" ? e(u, 3) : H(r).kind === "lifecycle" ? e(d, 4) : H(r).kind === "error" ? e(f, 5) : e(p, -1);
					}), O(a), z((e) => Y(a, "data-timeline-key", e), [() => ee(H(r))]), G(e, a);
				});
				var l = R(c, 2), u = (e) => {
					var t = Yc();
					X(I(t), { name: "loader-circle" }), k(), O(t), G(e, t);
				};
				q(l, (e) => {
					H(t).loading && !H(t).items && !H(t).events && e(u);
				});
				var d = R(l, 2), f = (e) => {
					Fc(e, {
						title: "Turn unavailable",
						get text() {
							return H(t).error;
						},
						error: !0
					});
				};
				q(d, (e) => {
					H(t).error && e(f);
				}), O(r), Xr(r, (e, t) => m?.(e, t), () => H(t).turn?.reference || ""), z(() => {
					a = ai(r, 1, "conversation-turn", null, a, { "conversation-turn-loading": H(t).loading }), Y(r, "data-timeline-key", H(t).key);
				}), G(e, r);
			};
			q(l, (e) => {
				H(t).kind === "gap" ? e(u) : e(d, -1);
			}), G(e, a);
		});
		var c = R(s, 2);
		J(c, 19, () => H(i).notices, (e, t) => `notice:${H(i).identity}:${t}:${String(e.data?.text || "")}`, (e, t, n) => {
			var r = Jc(), i = I(r);
			{
				let e = /* @__PURE__ */ M(() => String(H(t).data?.text || "")), n = /* @__PURE__ */ M(() => H(t).data?.level === "error");
				Fc(i, {
					title: "Forge",
					get text() {
						return H(e);
					},
					get error() {
						return H(n);
					}
				});
			}
			O(r), z(() => Y(r, "data-timeline-key", `notice:${H(n)}`)), G(e, r);
		});
		var l = R(c, 2), u = (e) => {
			Fc(e, {
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
			var t = Qc();
			X(I(t), { name: "loader-circle" }), k(), O(t), G(e, t);
		}, p = /* @__PURE__ */ M(() => w(H(n).status));
		q(d, (e) => {
			H(p) && e(f);
		});
		var g = R(d, 2), x = (e) => {
			var t = $c();
			X(I(t), { name: "loader-circle" }), k(), O(t), G(e, t);
		};
		q(g, (e) => {
			H(i).loading && !H(i).blocks.length && e(x);
		});
		var S = R(g, 2), C = (e) => {
			var t = el();
			X(I(t), { name: "bot" }), k(2), O(t), G(e, t);
		}, T = /* @__PURE__ */ M(() => H(i).loaded && !H(i).loading && !H(i).blocks.length && !H(i).notices.length && !w(H(n).status));
		q(S, (e) => {
			H(T) && e(C);
		}), G(e, t);
	}, ae = (e) => {
		var t = nl();
		X(I(t), { name: "bot" }), k(), O(t), G(e, t);
	};
	q(re, (e) => {
		H(i).resourceId ? e(ie) : e(ae, -1);
	}), O(ne), Di(ne, (e) => F(a, e), () => H(a)), z(() => Y(ne, "data-chat-context", H(i).identity)), G(e, ne), j();
}
Sr(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function al(e) {
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
function ol(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: { ...e.resourceDefaults },
		newProfile: { ...e.newProfile }
	};
}
function sl(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var cl = /* @__PURE__ */ W("<span class=\"settings-pill\"> </span>"), ll = /* @__PURE__ */ W("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), ul = /* @__PURE__ */ W("<div class=\"settings-empty\">No AgentHub agents available.</div>"), dl = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function fl(e, t) {
	A(t, !0);
	let n = Oi(t, "draft", 15), r = Oi(t, "pending", 15);
	async function i() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(ol(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(sl(e));
			} finally {
				r("");
			}
		}
	}
	var a = dl(), o = R(I(a), 2), s = I(o), c = R(I(s)), l = I(c, !0);
	O(c), O(s);
	var u = R(s, 2), d = R(I(u));
	gi(d), O(u);
	var f = R(u, 2), p = I(f, !0);
	O(f);
	var m = R(f, 2);
	J(m, 21, () => t.agentHub.capabilities, zr, (e, t) => {
		var n = cl(), r = I(n, !0);
		O(n), z(() => K(r, H(t))), G(e, n);
	}), O(m), O(o);
	var h = R(o, 2), g = I(h), _ = R(I(g)), v = I(_);
	O(_), O(g);
	var y = R(g, 2);
	J(y, 21, () => t.agentHub.agents, (e) => e.name, (e, t) => {
		var n = ll(), r = I(n), i = I(r), a = I(i, !0);
		O(i);
		var o = R(i), s = I(o), c = I(s, !0);
		O(s);
		var l = R(s), u = I(l);
		O(l), O(o), O(r), O(n), z((e) => {
			K(a, e), K(c, H(t).name), K(u, `${(H(t).providerId || "") ?? ""} · ${(H(t).available === !1 ? H(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (H(t).name || "A").slice(0, 1).toUpperCase()]), G(e, n);
	}, (e) => {
		G(e, ul());
	}), O(y), O(h);
	var b = R(h, 2), x = I(b);
	let S;
	var C = I(x, !0);
	O(x);
	var w = R(x);
	X(I(w), { name: "save" }), k(), O(w), O(b), O(a), z((e) => {
		K(l, t.agentHub.connected && t.agentHub.compatible ? "Compatible" : t.agentHub.connected ? "Incompatible" : "Unavailable"), K(p, t.agentHub.error || `API ${t.agentHub.apiVersion || "unknown"} · AgentHub ${t.agentHub.version || "unknown"}`), K(v, `${t.agentHub.agents.length ?? ""} agents · ${t.agentHub.providers.length ?? ""} providers`), S = ai(x, 1, "settings-save-hint", null, S, { visible: n().dirty }), K(C, n().dirty ? "Unsaved changes" : ""), w.disabled = e;
	}, [() => !n().dirty || !!r()]), U("input", d, function(...e) {
		t.onDirty?.apply(this, e);
	}), Si(d, () => n().endpoint, (e) => n(n().endpoint = e, !0)), U("click", w, i), G(e, a), j();
}
Sr(["input", "click"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var pl = /* @__PURE__ */ W("<small class=\"settings-notification-help\"> </small>"), ml = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function hl(e, t) {
	A(t, !0);
	var n = ml(), r = R(I(n), 2), i = I(r), a = R(I(i), 2);
	gi(a), O(i);
	var o = R(i, 2), s = (e) => {
		var n = pl(), r = I(n, !0);
		O(n), z(() => K(r, t.notifications.permissionError)), G(e, n);
	};
	q(o, (e) => {
		t.notifications.permissionError && e(s);
	}), O(r);
	var c = R(r, 2), l = I(c), u = R(I(l), 2);
	gi(u), O(l);
	var d = R(l, 2), f = I(d, !0);
	O(d), O(c), O(n), z(() => {
		vi(a, t.notifications.browser), vi(u, t.notifications.sound), K(f, t.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), U("change", a, (e) => t.onBrowserNotifications(e.currentTarget.checked)), U("change", u, (e) => t.onCompletionSound(e.currentTarget.checked)), G(e, n), j();
}
Sr(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var gl = /* @__PURE__ */ W("<option> </option>"), _l = /* @__PURE__ */ W("<label><span> </span><select></select></label>"), vl = /* @__PURE__ */ W("<span class=\"settings-profile-system-label\">System</span>"), yl = /* @__PURE__ */ W("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), bl = /* @__PURE__ */ W("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), xl = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>New Resource Defaults</h3><span>Applied once at creation</span></div> <div class=\"settings-resource-defaults\"></div> <p class=\"settings-resource-default-note\">Existing resources keep their explicit binding. Changing a profile route replaces its referenced resource generations at a safe turn boundary.</p></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function Sl(e, t) {
	A(t, !0);
	let n = Oi(t, "draft", 15), r = Oi(t, "pending", 15), i = /* @__PURE__ */ new Set([
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
				await t.onSaveAgentHub(ol(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(sl(e));
			} finally {
				r("");
			}
		}
	}
	var f = xl(), p = R(I(f), 2), m = R(I(p), 2);
	J(m, 20, () => [
		["workspace", "Workspace"],
		["project", "Project"],
		["task", "Task"]
	], zr, (e, t) => {
		let r = /* @__PURE__ */ M(() => t[0]);
		var i = _l(), a = I(i), o = I(a, !0);
		O(a);
		var s = R(a);
		J(s, 21, () => u(H(r)), zr, (e, t) => {
			var n = gl(), r = I(n);
			O(n);
			var i = {};
			z(() => {
				K(r, `${H(t).key ?? ""}${H(t).agentName ? "" : " (Missing)"}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
			}), G(e, n);
		}), O(s);
		var c;
		li(s), O(i), z(() => {
			K(o, t[1]), Y(s, "aria-label", `${t[1]} default profile`), c !== (c = n().resourceDefaults[H(r)]) && (s.value = (s.__value = n().resourceDefaults[H(r)]) ?? "", ci(s, n().resourceDefaults[H(r)]));
		}), U("change", s, (e) => l(H(r), e.currentTarget.value)), G(e, i);
	}), O(m), k(2), O(p);
	var h = R(p, 2), g = I(h), _ = R(I(g)), v = I(_);
	O(_), O(g);
	var y = R(g, 2), b = R(I(y), 2);
	J(b, 17, () => n().profiles, zr, (e, t, n) => {
		let r = /* @__PURE__ */ M(() => i.has(H(t).key.trim().toLowerCase()));
		var o = bl();
		let l;
		var u = I(o);
		gi(u);
		var d = R(u, 2);
		gi(d);
		var f = R(d, 2);
		J(f, 21, () => c(H(t).agentName), zr, (e, t) => {
			var n = gl(), r = I(n, !0);
			O(n);
			var i = {};
			z(() => {
				K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
			}), G(e, n);
		}), O(f);
		var p;
		li(f);
		var m = R(f, 2), h = (e) => {
			G(e, vl());
		}, g = (e) => {
			var t = yl();
			X(I(t), { name: "trash-2" }), O(t), U("click", t, () => s(n)), G(e, t);
		};
		q(m, (e) => {
			H(r) ? e(h) : e(g, -1);
		}), O(o), z(() => {
			l = ai(o, 1, "settings-profile-row", null, l, { "settings-profile-system": H(r) }), _i(u, H(t).key), u.disabled = H(r), _i(d, H(t).description), d.disabled = H(r), p !== (p = H(t).agentName) && (f.value = (f.__value = H(t).agentName) ?? "", ci(f, H(t).agentName));
		}), U("input", u, (e) => a(n, "key", e.currentTarget.value)), U("input", d, (e) => a(n, "description", e.currentTarget.value)), U("change", f, (e) => a(n, "agentName", e.currentTarget.value)), G(e, o);
	});
	var x = R(b, 2), S = I(x);
	gi(S);
	var C = R(S, 2);
	gi(C);
	var w = R(C, 2);
	J(w, 21, () => t.agents, zr, (e, t) => {
		var n = gl(), r = I(n, !0);
		O(n);
		var i = {};
		z(() => {
			K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
		}), G(e, n);
	}), O(w);
	var T = R(w, 2);
	X(I(T), { name: "plus" }), k(), O(T), O(x), O(y), O(h);
	var E = R(h, 2), ee = I(E);
	let te;
	var ne = I(ee, !0);
	O(ee);
	var re = R(ee);
	X(I(re), { name: "save" }), k(), O(re), O(E), O(f), z((e) => {
		K(v, `${n().profiles.length ?? ""} routes`), w.disabled = !t.agents.length, T.disabled = !t.agents.length, te = ai(ee, 1, "settings-save-hint", null, te, { visible: n().dirty }), K(ne, n().dirty ? "Unsaved changes" : ""), re.disabled = e;
	}, [() => !n().dirty || !!r()]), Si(S, () => n().newProfile.key, (e) => n(n().newProfile.key = e, !0)), Si(C, () => n().newProfile.description, (e) => n(n().newProfile.description = e, !0)), ui(w, () => n().newProfile.agentName, (e) => n(n().newProfile.agentName = e, !0)), U("click", T, o), U("click", re, d), G(e, f), j();
}
Sr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var Cl = /* @__PURE__ */ W("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), wl = /* @__PURE__ */ W("<button type=\"button\"><!> <span> </span> <!></button>"), Tl = /* @__PURE__ */ W("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function El(e, t) {
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
	var r = Tl();
	J(R(I(r), 2), 17, () => n, (e) => e.id, (e, n) => {
		var r = wl();
		let i;
		var a = I(r);
		X(a, { get name() {
			return H(n).icon;
		} });
		var o = R(a, 2), s = I(o, !0);
		O(o);
		var c = R(o, 2), l = (e) => {
			G(e, Cl());
		};
		q(c, (e) => {
			H(n).sharesAgentDraft && e(l);
		}), O(r), z(() => {
			i = ai(r, 1, "settings-tab", null, i, {
				active: t.activeTab === H(n).id,
				dirty: t.dirty && H(n).sharesAgentDraft
			}), Y(r, "aria-current", t.activeTab === H(n).id ? "page" : void 0), K(s, H(n).label);
		}), U("click", r, () => t.onSelect(H(n).id)), G(e, r);
	}), O(r), G(e, r), j();
}
Sr(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var Dl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function Ol(e, t) {
	A(t, !0);
	let n = Oi(t, "draft", 15), r = Oi(t, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n(n().userName = await t.onSaveUser(n().userName), !0);
			} catch (e) {
				t.onToast(sl(e));
			} finally {
				r("");
			}
		}
	}
	var a = Dl(), o = R(I(a), 2), s = I(o), c = R(I(s), 2);
	gi(c), k(2), O(s);
	var l = R(s, 2), u = I(l);
	X(I(u), { name: "save" }), k(), O(u), O(l), O(o), O(a), z(() => u.disabled = r() === "user"), xr("submit", o, i), Si(c, () => n().userName, (e) => n(n().userName = e, !0)), G(e, a), j();
}
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var kl = /* @__PURE__ */ W("<span class=\"settings-pill\">Active</span>"), Al = /* @__PURE__ */ W("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), jl = /* @__PURE__ */ W("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Ml = /* @__PURE__ */ W("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), Nl = /* @__PURE__ */ W("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Pl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function Fl(e, t) {
	A(t, !0);
	let n = Oi(t, "draft", 15), r = Oi(t, "pending", 15), i = /* @__PURE__ */ P("");
	async function a(e) {
		if (e.preventDefault(), !(!n().workspacePath.trim() || r())) {
			r("workspace");
			try {
				await t.onAddWorkspace(ol(n())), n(n().workspacePath = "", !0), n(n().createWorkspace = !1, !0);
			} catch (e) {
				t.onToast(sl(e));
			} finally {
				r("");
			}
		}
	}
	async function o(e) {
		if (!r()) {
			r(`remove:${e}`);
			try {
				await t.onRemoveWorkspace(e, ol(n()));
			} catch (e) {
				t.onToast(sl(e));
			} finally {
				r("");
			}
		}
	}
	async function s(e, a) {
		if (!r()) {
			r(`icon:${e}`), F(i, "");
			try {
				await t.onWorkspaceIcon(e, a, ol(n()));
			} catch (e) {
				t.onToast(sl(e));
			} finally {
				r("");
			}
		}
	}
	function c(e) {
		let n = t.workspaces.find((t) => t.id === e);
		return t.workspaceIcons.find((e) => e.id === (n?.icon || "")) || t.workspaceIcons[0];
	}
	var l = Pl(), u = R(I(l), 2), d = I(u);
	gi(d);
	var f = R(d, 2), p = I(f);
	gi(p), k(2), O(f);
	var m = R(f, 2), h = I(m);
	X(h, { name: "plus" });
	var g = R(h), _ = I(g, !0);
	O(g), O(m), O(u);
	var v = R(u, 2);
	J(v, 21, () => t.workspaces, (e) => e.id, (e, n) => {
		let a = /* @__PURE__ */ M(() => c(H(n).id));
		var l = Ml(), u = I(l), d = I(u), f = I(d), p = I(f);
		O(f);
		var m = R(f, 2), h = I(m), g = I(h, !0);
		O(h);
		var _ = R(h), v = I(_, !0);
		O(_), O(m), O(d);
		var y = R(d, 2), b = I(y), x = (e) => {
			G(e, kl());
		};
		q(b, (e) => {
			H(n).id === t.activeWorkspaceId && e(x);
		});
		var S = R(b, 2), C = I(S), w = R(C, 2), T = I(w, !0);
		O(w), X(R(w, 2), { name: "chevron-down" }), O(S);
		var E = R(S, 2);
		X(I(E), { name: "trash-2" }), O(E), O(y), O(u);
		var ee = R(u, 2), te = (e) => {
			var r = jl();
			J(r, 21, () => t.workspaceIcons, (e) => e.id, (e, t) => {
				var r = Al();
				let i;
				var o = I(r), c = R(o), l = I(c, !0);
				O(c);
				var u = R(c), d = (e) => {
					X(e, { name: "check" });
				};
				q(u, (e) => {
					H(t).id === H(a).id && e(d);
				}), O(r), z(() => {
					Y(r, "aria-checked", H(t).id === H(a).id), Y(r, "title", H(t).label), i = ai(r, 1, "", null, i, { selected: H(t).id === H(a).id }), Y(o, "src", H(t).src), K(l, H(t).label);
				}), U("click", r, () => s(H(n).id, H(t).id)), G(e, r);
			}), O(r), z(() => Y(r, "aria-label", `Icon for ${H(n).name}`)), G(e, r);
		};
		q(ee, (e) => {
			H(i) === H(n).id && e(te);
		}), O(l), z((e, t) => {
			Y(p, "src", H(a).src), K(g, H(n).name), K(v, H(n).path), Y(S, "aria-expanded", H(i) === H(n).id), S.disabled = e, Y(C, "src", H(a).src), K(T, r() === `icon:${H(n).id}` ? "Saving..." : H(a).label), E.disabled = t;
		}, [() => !!r(), () => !!r()]), U("click", S, () => F(i, H(i) === H(n).id ? "" : H(n).id, !0)), U("click", E, () => o(H(n).id)), G(e, l);
	}, (e) => {
		G(e, Nl());
	}), O(v), O(l), z((e) => {
		m.disabled = e, K(_, n().createWorkspace ? "Create" : "Add");
	}, [() => !!r()]), xr("submit", u, a), Si(d, () => n().workspacePath, (e) => n(n().workspacePath = e, !0)), Ci(p, () => n().createWorkspace, (e) => n(n().createWorkspace = e, !0)), G(e, l), j();
}
Sr(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var Il = /* @__PURE__ */ W("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function Ll(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(-1), a = /* @__PURE__ */ P($t(al(H(n)))), o = /* @__PURE__ */ P("");
	ki(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity === H(r) ? e.dataVersion !== H(i) && !H(a).dirty && (F(i, e.dataVersion, !0), F(a, al(e), !0)) : (F(r, e.identity, !0), F(i, e.dataVersion, !0), F(a, al(e), !0), F(o, "")), queueMicrotask(e.onIconsChanged);
	})), ki(() => {
		let e = (e) => {
			H(n).open && e.key === "Escape" && (e.preventDefault(), H(n).onClose(H(a).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function s() {
		H(a).dirty = !0;
	}
	var c = Ar(), l = L(c), u = (e) => {
		var t = Il(), r = L(t), i = R(r, 2), c = I(i);
		El(c, {
			get activeTab() {
				return H(a).tab;
			},
			get dirty() {
				return H(a).dirty;
			},
			onSelect: (e) => H(a).tab = e
		});
		var l = R(c, 2), u = I(l);
		X(I(u), { name: "x" }), O(u);
		var d = R(u, 2), f = (e) => {
			Fl(e, {
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
			Ol(e, {
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
			fl(e, {
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
			Sl(e, {
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
			hl(e, {
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
Sr(["click"]);
//#endregion
//#region src/components/Toast.svelte
var Rl = /* @__PURE__ */ W("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function zl(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(!1), i = null;
	ki(() => {
		let e = t.channel.subscribe((e) => {
			F(n, e, !0), F(r, !!e.message, !0), i !== null && window.clearTimeout(i), H(r) && (i = window.setTimeout(() => {
				F(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = Rl(), o = I(a, !0);
	O(a), z(() => {
		Y(a, "hidden", !H(r)), K(o, H(n).message);
	}), G(e, a), j();
}
//#endregion
//#region src/components/UploadDialog.svelte
var Bl = /* @__PURE__ */ W("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), Vl = /* @__PURE__ */ W("<small class=\"upload-result-path\"> </small>"), Hl = /* @__PURE__ */ W("<small class=\"upload-error\"> </small>"), Ul = /* @__PURE__ */ W("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), Wl = /* @__PURE__ */ W("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this resource's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function Gl(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P($t([])), a = 1, o = /* @__PURE__ */ P(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ M(() => H(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ M(() => H(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ M(() => H(i).filter((e) => e.status === "error").length);
	ki(() => {
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
		for (let e of r) g(e, H(n).identity, H(n).workspaceId, H(n).resourceId);
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
		s.set(e.id, a), a.open("POST", `/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/uploads`), a.responseType = "json", a.upload.addEventListener("progress", (r) => {
			H(n).identity !== t || !r.lengthComputable || h(e.id, { progress: Math.min(99, Math.round(r.loaded / r.total * 100)) });
		}), a.addEventListener("load", () => {
			if (s.delete(e.id), H(n).identity !== t || H(n).workspaceId !== r || H(n).resourceId !== i) return;
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
			resourceId: H(n).resourceId
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
	var b = Ar(), x = L(b), S = (e) => {
		var t = Wl(), n = I(t), r = R(n, 2), a = I(r), s = R(I(a), 2);
		X(I(s), { name: "x" }), O(s), O(a);
		var d = R(a, 2), f = I(d);
		Di(f, (e) => F(o, e), () => H(o));
		var p = R(f, 2), h = I(p);
		X(h, { name: "clipboard-paste" });
		var g = R(h, 4);
		X(I(g), { name: "folder-open" }), k(), O(g), O(p);
		var b = R(p, 2), x = I(b), S = (e) => {
			G(e, Bl());
		};
		q(x, (e) => {
			H(i).length || e(S);
		}), J(R(x, 2), 17, () => H(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ M(() => y(H(t)));
			var r = Ul();
			let i;
			var a = I(r), o = I(a);
			X(o, { get name() {
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
				var n = Vl(), r = I(n, !0);
				O(n), z(() => K(r, H(t).path)), G(e, n);
			};
			q(_, (e) => {
				H(t).status === "success" && e(b);
			});
			var x = R(_, 2), S = (e) => {
				var n = Hl(), r = I(n, !0);
				O(n), z(() => K(r, H(t).error || "Upload failed")), G(e, n);
			};
			q(x, (e) => {
				H(t).status === "error" && e(S);
			}), O(r), z((e) => {
				i = ai(r, 1, "upload-item", null, i, {
					"upload-item-success": H(t).status === "success",
					"upload-item-error": H(t).status === "error",
					"upload-item-uploading": H(t).status === "uploading"
				}), K(l, H(t).name), K(d, e), K(p, H(n).label), Y(m, "aria-label", H(t).name), Y(m, "aria-valuenow", H(t).progress), g = si(h, "", g, { width: `${H(t).progress}%` });
			}, [() => v(H(t).size)]), G(e, r);
		}), O(b), O(d);
		var C = R(d, 2), w = I(C), T = I(w, !0);
		O(w);
		var E = R(w, 2);
		O(C), O(r), O(t), z(() => {
			s.disabled = H(c), K(T, H(c) ? "Wait for uploads to finish before closing." : H(i).length ? `${H(l)} uploaded${H(u) ? ` · ${H(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), E.disabled = H(c);
		}), U("click", n, _), U("click", s, _), U("change", f, () => H(o).files && m(H(o).files)), xr("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), xr("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), xr("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), U("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), H(o).click());
		}), U("click", g, () => H(o).click()), U("click", E, _), G(e, t);
	};
	q(x, (e) => {
		H(n).open && e(S);
	}), G(e, b), j();
}
Sr([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var Kl = /* @__PURE__ */ W("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div>", 1);
function ql(e, t) {
	A(t, !0);
	var n = Kl(), r = L(n);
	ca(r, {
		get channel() {
			return t.channels.appShell;
		},
		details: (e) => {
			Ns(e, { get channel() {
				return t.channels.detail;
			} });
		},
		timeline: (e) => {
			il(e, { get channel() {
				return t.channels.timeline;
			} });
		},
		composer: (e) => {
			ba(e, { get channel() {
				return t.channels.composer;
			} });
		},
		$$slots: {
			details: !0,
			timeline: !0,
			composer: !0
		}
	});
	var i = R(r, 2);
	zl(I(i), { get channel() {
		return t.channels.toast;
	} }), O(i);
	var a = R(i, 2);
	Gl(I(a), { get channel() {
		return t.channels.upload;
	} }), O(a);
	var o = R(a, 2);
	so(I(o), { get channel() {
		return t.channels.create;
	} }), O(o);
	var s = R(o, 2);
	Ll(I(s), { get channel() {
		return t.channels.settings;
	} }), O(s), G(e, n), j();
}
//#endregion
//#region src/components/model-channel.ts
function Jl(e) {
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
var Z = () => void 0, Yl = async () => void 0;
function Xl() {
	return {
		appShell: Jl({
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
			onSwitchWorkspace: Yl,
			onAddWorkspace: Z,
			onCreateProject: Z,
			onOpenSettings: Z,
			onToggleProject: Yl,
			onSelectResource: Yl,
			onReorder: Yl,
			onDragState: Z,
			onToggleAttention: Yl,
			onDismissAttention: Yl,
			onPanePreview: Z,
			onPaneCommit: Z,
			onPaneViewport: Z,
			onMobileSidebar: Z,
			onMobileView: Z,
			onMobileImmersive: Z,
			onLayoutCycle: Z,
			onToast: Z,
			onIconsChanged: Z,
			onHistoryNavigation: Yl
		}),
		create: Jl({
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
			onPreview: Yl,
			onSubmit: Yl,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: () => !0,
			onIconsChanged: Z
		}),
		settings: Jl({
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
			onClose: Z,
			onAddWorkspace: Yl,
			onRemoveWorkspace: Yl,
			onWorkspaceIcon: Yl,
			onSaveUser: async (e) => e,
			onSaveAgentHub: Yl,
			onBrowserNotifications: Z,
			onCompletionSound: Z,
			onToast: Z,
			onIconsChanged: Z
		}),
		upload: Jl({
			open: !1,
			identity: "",
			workspaceId: "",
			resourceId: "",
			onDone: Z,
			onIconsChanged: Z
		}),
		composer: Jl({
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
			onSteerWaiting: Yl,
			onSaveAgentBinding: Yl,
			onIconsChanged: Z
		}),
		detail: Jl({
			identity: "",
			workspaceId: "",
			workspaceName: "",
			resourceId: "",
			resourceType: "",
			resourceTitle: "",
			creator: void 0,
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
			onNavigate: Z,
			onCreateTask: Z,
			onArchive: Z,
			onLoadMoreLogs: Yl,
			onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
			onSaveAgentBinding: Yl,
			onToast: Z,
			onIconsChanged: Z
		}),
		timeline: Jl({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			agentName: "Agent",
			project: () => [],
			onEvent: Z,
			onNotice: Z,
			onApproval: Yl,
			onToast: Z,
			onIconsChanged: Z
		}),
		toast: Jl({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var Zl = "forge.gui.agentDraft.v2", Ql = 2, $l = 50, eu = 7776e6;
function tu(e) {
	return encodeURIComponent(String(e || "").trim());
}
function nu(e) {
	return String(e || "").trim() || "workspace";
}
function ru(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? $l, r = e.maxAgeMs ?? eu;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function a(e, t) {
		let n = String(e || "").trim(), r = nu(t);
		return !n || !r ? "" : `${Zl}.resource.${tu(n)}.${tu(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== Ql || typeof t.text != "string" ? null : {
				version: Ql,
				text: t.text,
				updatedAt: Number(t.updatedAt) || 0,
				workspaceId: String(t.workspaceId || ""),
				resourceId: nu(t.resourceId),
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
				version: Ql,
				text: n,
				updatedAt: t(),
				workspaceId: r.workspaceId,
				resourceId: nu(r.resourceId),
				generationId: String(r.generationId || "") || void 0
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = nu(a);
		if (!c || !u) return;
		let f = `${Zl}.resource.${tu(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || nu(n.resourceId) !== d || o.has(t))) {
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
function iu(e) {
	let t = ru(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForResource(r, nu(n));
	}
	function i(e, t) {
		let r = /* @__PURE__ */ new Set();
		return n.ttyDraftWorkspaceId === e && n.ttyDraftResourceId === t && n.ttyDraftKey && r.add(n.ttyDraftKey), r;
	}
	function a(r = e.workspaceId(), a = n.ttyDraftResourceId) {
		let o = r.trim(), s = nu(a);
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
		let l = nu(i), u = r(l, o);
		if (!u) return c();
		n.ttyDraftKey !== u && (n.ttyDraftKey = u, n.ttyDraftWorkspaceId = o.trim(), n.ttyDraftResourceId = l, n.ttyDraft = t.read(u), n.ttyMultiline = n.ttyDraft.includes("\n"), n.ttyDraftVersion++, a(n.ttyDraftWorkspaceId, n.ttyDraftResourceId));
	}
	function u(r) {
		return e.workspaceId() !== r.workspaceId || n.ttyDraftResourceId !== nu(r.resourceId) || n.ttyDraftKey !== r.key || n.ttyDraft !== r.text || n.ttyDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
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
function au(e) {
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
function ou(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function su(e) {
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
function cu(e) {
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
function lu(e) {
	let t = 0, n = su(t), r = 0, i = null, a = "";
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
			previewRequestKey: (e) => JSON.stringify(cu({
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
			...su(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = su(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = cu({
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
			n.previewError = ou(e);
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
					t = cu(n);
				}
				await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				}), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1, n.identity = ++t, await e.reloadTree();
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(ou(t)));
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
function uu() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function du(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.generationId}`;
}
function fu(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function pu(e) {
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
		if (!(!e.settings().browser || uu() !== "granted")) try {
			let n = new window.Notification(du(t), {
				body: fu(t),
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
		n.browser && uu() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = uu();
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
			permission: uu(),
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
var mu = "forge.gui.notifications.v1", hu = `${mu}.settings`;
function gu(e) {
	return e && typeof e == "object" ? e : null;
}
function _u(e) {
	let t = gu(e);
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
function vu() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function yu(e) {
	let t = gu(e);
	if (!t || t.version !== 1) return vu();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = gu(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(_u).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(_u).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = gu(e);
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
function bu(e) {
	let t = e.trim();
	return t ? `${mu}.state.${encodeURIComponent(t)}` : "";
}
function xu(e) {
	function t(t) {
		let n = bu(t);
		if (!e || !n) return vu();
		try {
			let t = e.getItem(n);
			if (!t) return vu();
			let r = yu(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return vu();
		}
	}
	function n(t, n) {
		let r = yu(n), i = bu(t);
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
			let t = gu(JSON.parse(e.getItem(hu) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(hu);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(hu, JSON.stringify({
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
function Su(e) {
	let t = String(e.completionMarker || "").trim();
	if (t) return t;
	let n = String(e.generationId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function Cu(e) {
	return String(e.generationId || e.id || "").trim();
}
function wu(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function Tu(e, t) {
	let n = String(e.resourceId || "").trim(), r = t.findResource(n), i = Cu(e);
	return !n || !i ? null : _u({
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
function Eu(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function Du(e) {
	let t = xu(Eu(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= vu(), n.store;
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
	let g = pu({
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
			let r = new t(`${mu}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), uu() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
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
			let n = _u(t.record);
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
		let a = Su(t);
		if (!a || !n.workspaceId) return !1;
		let s = Tu(t, {
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
		for (let t of e) Su(t) && x(t, t.completionState || "");
	}
	function C(e, t) {
		let n = wu(e);
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
			r.key === bu(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.refreshIcons()), r.key === hu && (n.settings = t.readSettings(), uu() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
		}), e.scope.listen(document, "visibilitychange", () => {
			e.flushDraft(), c() && E(e.selectedResourceId());
		}), e.scope.listen(window, "focus", () => E(e.selectedResourceId()));
	}
	function te() {
		return i(), g.preferences();
	}
	function ne() {
		_(), g.dispose();
	}
	return {
		initialize: y,
		install: ee,
		dispose: ne,
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
var Ou = "forge.gui.paneSizes", ku = "forge.gui.mobileImmersive", Au = "forge.gui.layoutPreference", ju = 8, Mu = 220, Nu = 360, Pu = 320, Fu = 1e4, Iu = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarAttentionHeight: 210
}), Lu = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarAttentionHeight: "--sidebar-attention-height"
});
function Ru(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function zu(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var Bu = [
	"auto",
	"three",
	"two",
	"split"
];
function Vu(e) {
	return Bu.includes(e) ? e : "auto";
}
function Hu(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...Iu };
	if (zu(n.sidebarWidth) && (r.sidebarWidth = Ru(n.sidebarWidth, Mu, Fu)), zu(n.chatWidth)) r.chatWidth = Ru(n.chatWidth, Pu, Fu);
	else if (zu(n.detailsWidth) && t >= 688) {
		let e = Ru(n.detailsWidth, Nu, t - ju - Pu);
		r.chatWidth = Ru(t - ju - e, Pu, Fu);
	}
	let i = zu(n.sidebarAttentionHeight) ? n.sidebarAttentionHeight : n.sidebarSessionHeight;
	return zu(i) && (r.sidebarAttentionHeight = Ru(i, 84, Fu)), r;
}
function Uu(e, t = window.localStorage) {
	let n = { ...Iu }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = window.matchMedia("(max-width: 980px)"), o = window.matchMedia("(max-width: 1440px)");
	function s() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Ou) || "{}");
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
		if (!Object.hasOwn(Lu, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(Ru(t, r === "sidebarWidth" ? Mu : r === "chatWidth" ? Pu : 84, Fu));
		n[r] = i, l(Lu[r], i);
	}
	function d() {
		for (let e of Object.keys(Lu)) u(e, n[e]);
	}
	function f() {
		t?.setItem(Ou, JSON.stringify(n));
	}
	function p() {
		let l = s();
		n = Hu(l, 0), d();
		let u = zu(l.sidebarSessionHeight) && !zu(l.sidebarAttentionHeight);
		zu(l.detailsWidth) && !zu(l.chatWidth) && !a.matches && (n = Hu(l, c()), d(), u = !0), u && f();
		try {
			r.immersive = t?.getItem(ku) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = Vu(t?.getItem(Au));
		} catch {
			i = "auto";
		}
		_();
		let p = () => {
			_(), e();
		};
		a.addEventListener?.("change", p), o.addEventListener?.("change", p);
	}
	function m(e) {
		if (!Object.hasOwn(Lu, e) || !t) return;
		let r = e, i = s();
		delete i.detailsWidth, delete i.sidebarSessionHeight;
		for (let e of Object.keys(Lu)) zu(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(Ou, JSON.stringify(i));
	}
	function h() {
		if (a.matches) return;
		let e = s();
		!zu(e.detailsWidth) || zu(e.chatWidth) || (n = Hu(e, c()), d(), f());
	}
	function g() {
		return a.matches ? "single" : i === "auto" ? o.matches ? "two" : "three" : i;
	}
	function _() {
		document.body.dataset.layout = g();
	}
	function v(n) {
		i = Vu(n);
		try {
			t?.setItem(Au, i);
		} catch {}
		_(), e();
	}
	function y() {
		let e = Bu[(Bu.indexOf(i) + 1) % Bu.length];
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
			t?.setItem(ku, r.immersive ? "1" : "0");
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
function Wu(e, t) {
	let n = Date.parse(String(e?.time || "")), r = Date.parse(String(t?.time || ""));
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t?.time || "").localeCompare(String(e?.time || ""));
}
function Gu(e, t, n) {
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
	return r.sort(Wu);
}
function Ku(e, t = 10, n = 20) {
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
			logs: Gu([], o, !0),
			logPage: {
				hasMore: c.hasMore,
				nextCursor: c.nextCursor
			}
		}, e.details[r];
		let l = e.details[r], u = Gu(l.logs || [], o, n !== "older");
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
			d(r, t, a, l) && (a.error = ou(e, "Could not load older logs."));
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
function qu(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function Ju(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: qu(t[1]),
		resourceId: t[2] === "r" ? qu(t[3]) : "workspace"
	} : {};
}
function Yu(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function Xu(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = Yu(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => Ju(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/controllers/settings-controller.ts
function Zu(e, t) {
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
function Qu(e) {
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
		}), await o(), e.setConfig(Zu(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: Zu
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var $u = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering",
	"stopping"
]), ed = 6e4;
function td(e) {
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
		if (Number.isFinite(n)) return t() - n <= ed;
		if (!$u.has(e.status || "")) return !1;
		let r = new Date(e.updatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= ed;
	}
	function s(e) {
		if (!e?.status || e.status === "stopped" || e.status === "archived") return null;
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
		let t = s(e.runtime), n = t?.label || "", r = l([t]);
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
		let t = (e.children || []).filter((e) => e.archived !== !0), n = t.filter((e) => $u.has(e.runtime?.status || "")).length, r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n} working`;
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
	return {
		applyCustomOrder: i,
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
var nd = "forge.gui.user.v1", rd = 1, id = 80;
function ad(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, id).join("") || "User";
}
function od(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== rd ? "User" : ad(t.name);
	} catch {
		return "User";
	}
}
function sd(e, t) {
	let n = r();
	function r() {
		try {
			return od(window.localStorage.getItem(nd));
		} catch {
			return "User";
		}
	}
	function i(e) {
		let t = ad(e);
		try {
			window.localStorage.setItem(nd, JSON.stringify({
				version: rd,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return n = t, n;
	}
	return e.listen(window, "storage", (e) => {
		e.key === nd && (n = od(e.newValue), t());
	}), {
		current: () => n,
		save: i
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var cd = class {
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
}, ld = 400, ud = 12e3;
function dd(e, t = ld) {
	let n = String(e ?? "");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function fd(e) {
	if (e == null) return "";
	try {
		return dd(JSON.stringify(e));
	} catch {
		return "";
	}
}
function pd(e) {
	let t = String(e || "").replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function md(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string").join(" ") : typeof e == "string" ? e : "";
}
function Q(...e) {
	for (let t of e) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
var hd = /* @__PURE__ */ new Set([
	"user",
	"system",
	"agent",
	"assistant"
]);
function gd(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return;
	let t = {};
	for (let n of [
		"id",
		"name",
		"sessionId"
	]) typeof e[n] == "string" && e[n].trim() && (t[n] = e[n].trim());
	return Object.keys(t).length ? t : void 0;
}
function _d(e) {
	let t = typeof e == "string" ? e.trim().toLowerCase() : "";
	return hd.has(t) ? t : "user";
}
function vd(e) {
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
function yd(e) {
	if (!Array.isArray(e)) return "";
	let t = [];
	for (let n of e) typeof n?.text == "string" ? t.push(n.text) : typeof n?.content?.text == "string" ? t.push(n.content.text) : n?.type === "diff" && typeof n?.path == "string" && t.push(`Edit ${n.path}`);
	return t.filter(Boolean).join("\n");
}
function bd(e) {
	let t = e?.data ?? {}, n = typeof t.method == "string" ? t.method : "", r = t.raw && typeof t.raw == "object" ? t.raw : {}, i = e?.time || "";
	if (n.startsWith("item/") || n.startsWith("command/")) {
		if (n === "item/commandExecution/outputDelta" || n === "command/exec/outputDelta") {
			let e = Q(r.itemId, r.callId, r.id);
			return e ? {
				callId: e,
				method: n,
				time: i,
				deltaOnly: !0,
				output: typeof r.delta == "string" ? r.delta : ""
			} : null;
		}
		let e = r.item && typeof r.item == "object" ? r.item : r, t = Q(e.type);
		if ([
			"userMessage",
			"agentMessage",
			"reasoning"
		].includes(t)) return null;
		let a = Q(e.id, r.itemId), o = pd(t) || "Tool", s = "", c = "", l = "";
		t === "commandExecution" ? (o = "Command", s = md(e.command) || Q(e.cmd), c = Q(e.aggregatedOutput, e.output), typeof e.exitCode == "number" && e.exitCode !== 0 && (l = `Exit code ${e.exitCode}`)) : t === "fileChange" ? (o = "File change", s = (Array.isArray(e.changes) ? e.changes.map((e) => e?.path).filter(Boolean) : []).join(", ")) : t === "mcpToolCall" ? (o = "MCP", s = [e.server, e.tool].filter((e) => typeof e == "string" && e).join(" / "), c = typeof e.result == "string" ? e.result : fd(e.result), l = Q(e.error?.message, typeof e.error == "string" ? e.error : "")) : t === "webSearch" ? (o = "Web search", s = Q(e.query)) : (s = Q(e.title, e.name, md(e.command), e.path), c = Q(e.output, e.aggregatedOutput));
		let u = vd(e.status);
		return n === "item/started" && (u = "running"), n === "item/completed" && u === "running" && (u = "completed"), l && u === "completed" && (u = "failed"), {
			callId: a,
			method: n,
			time: i,
			name: o,
			status: u,
			error: l,
			summary: dd(s.replace(/\s+/g, " ").trim(), 120),
			output: dd(c, ud)
		};
	}
	let a = r.update && typeof r.update == "object" ? r.update : r, o = Q(a.sessionUpdate);
	if (o === "tool_call" || o === "tool_call_update") {
		let e = Q(a.toolCallId, a.id), t = a.rawInput && typeof a.rawInput == "object" ? a.rawInput : {}, r = Q(a.title, md(t.command), t.path, t.filePath, pd(a.kind));
		return {
			callId: e,
			method: n,
			time: i,
			name: pd(a.kind) || "Tool",
			status: vd(a.status || (o === "tool_call" ? "in_progress" : "")),
			summary: dd(r.replace(/\s+/g, " ").trim(), 120),
			output: dd(yd(a.content), ud),
			error: ""
		};
	}
	if (n === "tool_execution_start" || n === "tool_execution_end") {
		let e = Q(r.toolName, r.name, r.tool), t = r.args && typeof r.args == "object" ? r.args : {}, a = Q(md(t.command), t.path, t.filePath, ""), o = r.isError === !0 || !!Q(r.error);
		return {
			callId: Q(r.toolCallId, r.callId, e),
			method: n,
			time: i,
			name: pd(e) || "Tool",
			status: n === "tool_execution_start" ? "running" : o ? "failed" : "completed",
			summary: dd(a.replace(/\s+/g, " ").trim(), 120),
			output: dd(Q(typeof r.result == "string" ? r.result : "", yd(r.result?.content)), ud),
			error: Q(r.error)
		};
	}
	return {
		callId: Q(r.toolCallId, r.itemId, r.id),
		method: n,
		time: i,
		name: "Tool",
		status: n.includes("start") ? "running" : "completed",
		summary: n,
		output: "",
		error: ""
	};
}
function xd(e) {
	let t = e?.data ?? {}, n = Q(t.method), r = t.params && typeof t.params == "object" ? t.params : {}, i = Array.isArray(r.options) ? r.options.map((e) => ({
		optionId: Q(e?.optionId),
		name: Q(e?.name),
		kind: Q(e?.kind)
	})).filter((e) => e.optionId) : [], a = md(r.command) || md(r?.rawInput?.command);
	if (a) return {
		title: "Run command",
		detail: dd(a, 160),
		question: "",
		options: i
	};
	let o = Array.isArray(r.changes) ? r.changes.map((e) => e?.path).filter(Boolean) : [];
	if (r.toolCall && typeof r.toolCall == "object") {
		let e = Q(r.toolCall.title, r.toolCall.kind && pd(r.toolCall.kind)), t = yd(r.toolCall.content);
		return {
			title: e || "Permission requested",
			detail: "",
			question: t,
			options: i
		};
	}
	return o.length ? {
		title: "Apply file changes",
		detail: dd(o.join(", "), 160),
		question: "",
		options: i
	} : n.includes("permissions") ? {
		title: "Grant permissions",
		detail: Q(r.reason),
		question: "",
		options: i
	} : n.includes("fileChange") ? {
		title: "Apply file changes",
		detail: Q(r.reason),
		question: "",
		options: i
	} : {
		title: "Approval requested",
		detail: Q(r.reason, n),
		question: "",
		options: i
	};
}
var Sd = {
	accept: "Allowed",
	acceptForSession: "Allowed for this session",
	decline: "Declined",
	cancel: "Cancelled"
}, Cd = {
	failed: "Session failed",
	stopping: "Stopping provider",
	stopped: "Session stopped",
	archived: "Session archived"
}, wd = {
	requested: "requested",
	completed: "provider completed",
	provider_error: "provider error",
	startup_error: "startup error",
	daemon_recovery: "daemon recovery"
};
function Td(e) {
	return e === "message.delivery" || e === "provider.event" || e === "provider.metadata" || e === "plan.event" || e === "provider.stderr" || e === "provider.turn.started" || e === "provider.turn.completed" || e.startsWith("provider.process.");
}
function Ed(e, t) {
	let n = { ...e };
	return t.name && (n.name = t.name), t.summary && (n.summary = t.summary), t.status && (n.status = t.status), t.error && (n.error = t.error), t.deltaOnly ? n.output = dd((n.output || "") + (t.output || ""), ud) : t.output && (n.output = t.output), n.time = t.time || e.time, n.key = e.key, n;
}
function Dd(e, t) {
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
		rawPreview: fd(t?.data?.raw)
	};
}
function Od(e) {
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
					role: _d(o.role),
					key: a.id,
					time: s,
					steer: o.steer === !0,
					text: typeof o.text == "string" ? o.text : ""
				};
				a.turnId && (e.turnId = a.turnId);
				let n = gd(o.sender);
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
				let e = bd(a);
				if (!e) break;
				let n = t.at(-1), i = n?.kind === "tools" ? n : null, o = e.callId ? r.get(e.callId) : null;
				if (o) Object.assign(o.call, Ed(o.call, e)), o.group.time = s, o.call.status !== "running" && r.delete(e.callId);
				else {
					if (e.deltaOnly) break;
					let n = i || {
						kind: "tools",
						key: a.id,
						calls: [],
						time: s
					}, o = Dd(e, a);
					n.calls.push(o), n.time = s, i || t.push(n), o.callId && o.status === "running" && r.set(o.callId, {
						call: o,
						group: n
					});
				}
				break;
			}
			case "approval.requested": {
				let { title: e, detail: r, question: i, options: c } = xd(a), l = {
					kind: "approval",
					key: a.id,
					time: s,
					approvalId: Q(o.approvalId),
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
				let e = Q(o.approvalId), r = Q(o.decision) || "decline", i = Q(o.optionId), c = Q(o.text), l = e ? n.get(e) : null, u = (e) => r === "text" ? "Replied" : i ? `Answered: ${e?.options?.find((e) => e.optionId === i)?.name || i}` : Sd[r] || pd(r), d = r === "accept" || r === "acceptForSession" || r === "text";
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
					let e = Q(o.message, "The provider reported an error"), n = Q(o.details), r = n && n !== e ? `${e} · ${n}` : e;
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
					text: `Turn failed${Q(o.error, o.message) ? `: ${Q(o.error, o.message)}` : ""}`
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
				let e = Q(o.agentName), n = Q(o.provider), r = ["Agent connected"];
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
				let e = Cd[o.state];
				o.state === "failed" ? i("failed", s) : o.state === "stopped" && i(o.reason === "completed" ? "completed" : "failed", s), o.state === "stopped" && wd[o.reason] && (e += ` · ${wd[o.reason]}`);
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
				if (Td(e)) break;
				t.push({
					kind: "unknown",
					key: a.id,
					time: s,
					type: e || "unknown",
					preview: fd(o)
				});
		}
	}
	let a = t.at(-1);
	return a?.kind === "thinking" && (a.active = !0), t;
}
//#endregion
//#region src/app-controller.ts
var kd, Ad = null, $ = {
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
function jd() {
	for (let e of Object.keys($.details)) delete $.details[e];
	for (let e of Object.keys($.resourceLogPages)) delete $.resourceLogPages[e];
}
var Md = iu({
	runtime: $.agent,
	workspaceId: () => $.activeWorkspaceId
}), Nd = Md.clearResourceAfterAccepted, Pd = Md.clearMemory, Fd = Md.flush, Id = Md.restoreResource, Ld = Md.update, Rd = au(() => {
	gm && (Sp(), om());
}), zd = Uu(() => Vf()), Bd = Xu(() => Vf()), Vd = Ku({
	details: $.details,
	pages: $.resourceLogPages,
	context: () => ({
		workspaceId: $.activeWorkspaceId,
		navigationVersion: $.navigationVersion,
		selectedId: $.selectedId,
		detailRequestVersion: $.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++$.detailRequestVersion,
	isCurrentWorkspace: (e, t) => Nf(e, t),
	request: (e, t) => _f(e, t),
	render: Jf,
	refreshIcons: om
}), Hd = lu({
	workspaceId: () => $.activeWorkspaceId,
	templates: (e) => $.details[e]?.templates || [],
	request: (e, t) => _f(e, t),
	publish: (e) => kd.renderCreateDialog(e),
	toast: am,
	reloadTree: () => yf(),
	selectWorkspaceResource: () => {
		$.selectedId = "workspace";
	},
	onOpen: () => {
		$.modalEnter = "create";
	},
	onIconsChanged: om,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
}), Ud = (e) => document.getElementById(e), Wd = 5e3, Gd = 10, Kd = /* @__PURE__ */ new Set(["session.launch-environment"]), qd = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, Jd = [
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
], Yd = new Map(Jd.map((e) => [e.id, e])), { applyCustomOrder: Xd, moveIdInList: Zd, projectTaskSummary: Qd, resourceRefText: $d, statusModel: ef, taskOperationalState: tf, taskOperationalStateKey: nf } = td({
	tree: () => $.tree,
	findResource: (e) => Vp(e),
	agentName: (e) => ($.config?.agents || []).find((t) => t.id === e)?.name || e || "Forge GUI"
}), rf = 0, af = Qu({
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
	request: (e, t) => _f(e, t),
	publish: (e) => kd.renderSettings(e),
	agentOptions: of,
	workspaceIcons: [qd, ...Jd],
	userName: gf,
	saveUser: (e) => {
		if (!lf) throw Error("User settings are unavailable.");
		return lf.save(e);
	},
	notificationPreferences: () => cf?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => cf?.setBrowserEnabled(e),
	setCompletionSound: (e) => cf?.setSoundEnabled(e),
	flushDraft: Fd,
	resetAgentState: dp,
	reloadWorkspaceContext: async () => {
		await Df(), await yf();
	},
	clearWorkspaceContext: () => {
		$.tree = null, jd(), jf();
	},
	renderWorkspace: Lf,
	renderAgentViews: () => {
		Xp(), Sp();
	},
	toast: am,
	onIconsChanged: om
});
function of() {
	return Qp().map((e) => ({
		id: e.id || "",
		label: Cp(e),
		summary: gp(e)
	}));
}
function sf() {
	Vf(), Jf(), zp(), Ap(), Sp(), yp(), wp();
}
var cf = null, lf = null;
function uf(e) {
	cf?.initialize(e);
}
function df() {
	cf?.establishBaseline();
}
function ff(e = $.tree) {
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
function pf(e) {
	cf?.observeProjections(e);
}
function mf(e, t) {
	t && cf?.observeEvent(e, t);
}
function hf(e) {
	cf?.clearResource(e);
}
function gf() {
	return lf?.current() || "User";
}
async function _f(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		throw new co(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function vf() {
	let e = Kp(), [t, n] = await Promise.all([_f("/api/workspaces"), _f("/api/settings/agenthub")]);
	$.config = nm(t, n), Xp(), $.activeWorkspaceId = qp(e.workspaceId) ? e.workspaceId || "" : $.config?.activeId || $.config?.workspaces[0]?.id || "", $.selectedId = e.resourceId || "workspace", Lf(), $.activeWorkspaceId ? (uf($.activeWorkspaceId), await Df(), !e.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await yf({ replaceURL: !0 })) : ($.navigationLoading = !1, $.tree = null, jd(), $.workspaceAgents = null, $.preview = null, $.diff = null, dp(), jf());
}
async function yf(e = {}) {
	if (!$.activeWorkspaceId) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.treeRequestVersion;
	$.navigationLoading = !0, $.navigationError = "", Vf(), $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let i;
	try {
		i = await _f(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw Nf(t, n, r) && ($.navigationLoading = !1, $.navigationError = ou(e), Vf()), e;
	}
	Nf(t, n, r) && ($.tree = i, jd(), $.workspaceAgents = null, $.workspaceAgentsSaving = !1, $.preview = null, $.diff = null, Hp(), Gp(!1), $.selectedId === "workspace" ? await Ef() : $.selectedId && await bf($.selectedId), Nf(t, n, r) && (await cp(t, Pp()), Nf(t, n, r) && (df(), $.navigationLoading = !1, $.navigationError = "", jf(), e.updateURL !== !1 && Jp({ replace: !!e.replaceURL }))));
}
async function bf(e, t = {}) {
	return Vd.load(e, t);
}
function xf(e, t = $.activeWorkspaceId, n = {}) {
	return Vd.fetch(e, t, n);
}
function Sf(e) {
	Vd.reset(e);
}
function Cf(e) {
	return Vd.snapshot(e);
}
function wf(e, t = "head") {
	return Vd.apply(e, t);
}
async function Tf(e = $.selectedId) {
	await Vd.loadMore(e);
}
async function Ef(e = {}) {
	if (!$.activeWorkspaceId || $.workspaceAgents && !e.force) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.workspaceAgentsRequestVersion;
	try {
		let e = await _f(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!Nf(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = e;
	} catch (e) {
		if (!Nf(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: ou(e)
		};
	}
	return $.workspaceAgents;
}
async function Df(e = $.activeWorkspaceId, t = $.navigationVersion) {
	let n = await _f(`/api/workspaces/${e}/ui-state`);
	return Nf(e, t) ? ($.expandedProjects = new Set(n.expandedProjects || []), $.lastResourceId = n.lastResourceId || "", $.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], $.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, !0) : !1;
}
async function Of() {
	if (!$.activeWorkspaceId) return;
	let e = $.activeWorkspaceId, t = $.navigationVersion, n = $.selectedId;
	await _f(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...$.expandedProjects],
			lastResourceId: n,
			projectOrder: $.projectOrder,
			taskOrder: $.taskOrder
		})
	}), Nf(e, t) && ($.lastResourceId = n);
}
function kf() {
	$.autoRefreshTimer ||= Ad?.interval(() => {
		Af().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, Wd) ?? null;
}
async function Af() {
	if (!$.activeWorkspaceId || $.autoRefreshInFlight || $.listDrag) return;
	let e = $.autoRefreshVersion, t = $.activeWorkspaceId, n = $.navigationVersion, r = $.selectedId;
	$.autoRefreshInFlight = !0;
	try {
		let i = await ip(t);
		if (!i || !Pf(t, n, e)) return;
		let a = !rm($.tree, i);
		if (a && ($.tree = i), pf(ff(i)), a && $.preview?.section === "Wiki" && !$.preview.loading && (await $f("Wiki", $.preview.path), !Pf(t, n, e))) return;
		Hp() && (Jp({ replace: !0 }), a = !0, r = $.selectedId);
		let o = $.expandedProjects.size;
		if (Gp(!1), a ||= o !== $.expandedProjects.size, $.selectedId === "workspace") {
			let r = $.workspaceAgents;
			if (await Ef({ force: !0 }), !Pf(t, n, e)) return;
			rm(r, $.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++$.detailRequestVersion, o = await xf(r, t, { logsLimit: Gd });
			if (!Pf(t, n, e) || $.selectedId !== r || i !== $.detailRequestVersion) return;
			let s = Cf(r);
			wf(o, "head"), rm(s, Cf(r)) || (a = !0);
		}
		pf(ff(i)), await cp(t, Pp()) && (a = !0), nf() !== $.taskOperationalStateKey && (a = !0), a && jf();
	} finally {
		$.autoRefreshInFlight = !1;
	}
}
function jf() {
	Vf(), Jf(), yp(), om(), zp(), wp();
}
function Mf() {
	Vf(), Jf(), yp(), om(), zp();
}
function Nf(e, t, n = null) {
	return e === $.activeWorkspaceId && t === $.navigationVersion && (n == null || n === $.treeRequestVersion);
}
function Pf(e, t, n) {
	return Nf(e, t) && n === $.autoRefreshVersion;
}
function Ff(e) {
	return Yd.get(String(e?.icon || "").trim()) || qd;
}
function If(e) {
	let t = Ff(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function Lf() {
	let e = $.config?.workspaces?.find((e) => e.id === $.activeWorkspaceId);
	If(e), Vf();
}
function Rf(e, t, n = "") {
	let r = tf(e), i = t === "project" && Wp(e.id), a = t === "project" ? Qd(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: $d(e.id),
		active: $.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: ef(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? Xd(e.children || [], $.taskOrder[e.id]).map((t) => Rf(t, "task", e.id)) : [],
		projectId: n,
		followed: !!e.attention?.followed
	};
}
function zf(e) {
	if (!e) return null;
	let t = tf(e);
	return {
		id: e.id || "scheduler",
		type: "scheduler",
		title: e.title || "Scheduler",
		ref: "",
		active: $.selectedId === (e.id || "scheduler"),
		expanded: !1,
		ariaLabel: ["Scheduler", t.label].filter(Boolean).join(". "),
		statusLabel: t.label || "Workspace Scheduler",
		status: ef(t.statusPresentation),
		summary: null,
		children: []
	};
}
function Bf(e) {
	let t = tf(e), n = e.type === "scheduler" || e.type === "project" || e.type === "task" ? e.type : "workspace", r = e.title || e.id;
	return {
		id: e.id,
		type: n,
		title: r,
		ref: n === "project" || n === "task" ? $d(e.id) : "",
		selected: $.selectedId === e.id,
		activeTurn: !!e.runtime?.activeTurn,
		followed: !!e.attention?.followed,
		turnNumber: Number(e.runtime?.turnNumber) || 0,
		agentName: String(e.runtime?.agentName || "").trim(),
		statusLabel: t.label || (e.attention?.followed ? "Focused resource" : "Active turn"),
		status: ef(t.statusPresentation)
	};
}
function Vf() {
	let e = $.tree ? Xd($.tree.projects || [], $.projectOrder).map((e) => Rf(e, "project")) : [], t = $.tree?.attentionList?.map((e) => Bf(e)) || [];
	$.tree && ($.taskOperationalStateKey = nf()), kd.renderAppShell({
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
			iconSrc: Ff(e).src
		})),
		scheduler: zf($.tree?.scheduler),
		projects: e,
		attentionList: t,
		...zd.snapshot(),
		route: Bd.projection(),
		onSwitchWorkspace: (e) => Hf(e),
		onAddWorkspace: () => tm("workspace").catch((e) => am(e.message)),
		onCreateProject: () => Fp(),
		onOpenSettings: () => tm().catch((e) => am(e.message)),
		onToggleProject: (e) => Gf(e),
		onSelectResource: (e) => Wf(e),
		onReorder: (e, t, n) => Uf(e, t, n),
		onDragState: (e) => {
			$.listDrag = e;
		},
		onToggleAttention: (e, t) => op(e, t),
		onDismissAttention: (e) => sp(e),
		onPanePreview: (e, t) => lm(e, t),
		onPaneCommit: (e) => um(e),
		onPaneViewport: () => dm(),
		onMobileSidebar: (e) => fm(e),
		onMobileView: (e) => pm(e),
		onMobileImmersive: (e) => mm(e),
		onLayoutCycle: () => zd.cycleLayoutPreference(),
		onHistoryNavigation: (e) => bm(e),
		onToast: am,
		onIconsChanged: om
	});
}
async function Hf(e) {
	if (!qp(e)) return;
	if ($.workspaceMenuOpen = !1, e === $.activeWorkspaceId) {
		Lf();
		return;
	}
	fm(!1), Fd(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let t = $.navigationVersion;
	await Of().catch((e) => console.warn("failed to save UI state", e)), $.activeWorkspaceId = e, $.selectedId = "workspace", $.tree = null, $.navigationLoading = !0, $.navigationError = "", jd(), uf(e), Qf(), $.workspaceAgentsSaving = !1, Rp(), dp(), Lf(), await Df(e, t) && ($.selectedId = $.lastResourceId || "workspace", await yf());
}
async function Uf(e, t, n) {
	let r = {
		projectOrder: [...$.projectOrder],
		taskOrder: Object.fromEntries(Object.entries($.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []]))
	};
	if (e.kind === "task") {
		let r = Vp(e.projectId);
		if (!r) return;
		let i = Xd(r.children || [], $.taskOrder[e.projectId]);
		$.taskOrder = {
			...$.taskOrder,
			[e.projectId]: Zd(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") $.projectOrder = Zd(Xd($.tree?.projects || [], $.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	Vf();
	try {
		await Of();
	} catch (e) {
		throw $.projectOrder = r.projectOrder, $.taskOrder = r.taskOrder, Vf(), e;
	}
}
async function Wf(e, t = {}) {
	let n = $.selectedId !== e;
	t.clearUnread !== !1 && hf(e);
	let r = n || !!t.forceDetail;
	r && ($.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, e !== "workspace" && (Sf(e), delete $.details[e])), n && ($.workspaceAgentsSaving = !1, Fd(), Op(), $.preview = null, $.diff = null, Pd(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = ""), $.selectedId = e, fm(!1), Gp(!1), Jp(), Of().catch((e) => console.warn("failed to save UI state", e)), Mf(), await Promise.all([e === "workspace" ? Ef({ force: !!t.forceDetail }) : bf(e, { force: r }), cp($.activeWorkspaceId, e)]), Nf($.activeWorkspaceId, $.navigationVersion) && Mf();
}
async function Gf(e) {
	$.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), Vf();
	try {
		await Of();
	} catch (t) {
		throw $.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), Vf(), t;
	}
}
function Kf() {
	let e = $.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${$.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: Yp(),
		resourceId: $.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		creator: $.selectedId === "workspace" ? $.tree?.creator : $.details[$.selectedId]?.creator || Vp($.selectedId)?.creator,
		parent: null,
		loading: !1,
		detail: null,
		wiki: $.tree?.wiki || null,
		workspaceAgents: $.workspaceAgents,
		agentBinding: $.selectedId === "workspace" ? $.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : Vp($.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: of(),
		logs: {
			hasMore: !1,
			loading: !1,
			error: ""
		},
		onNavigate: (e) => Yf(e).catch((e) => am(ou(e))),
		onCreateTask: (e) => Ip(e),
		onArchive: (e) => Bp(e).catch((e) => am(ou(e))),
		onLoadMoreLogs: (e) => Tf(e),
		onSaveWorkspaceAgents: (e, t) => ep(e, t),
		onSaveAgentBinding: async (t) => {
			let n = $.selectedId || "workspace";
			await _f(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await yf({ updateURL: !1 }), n !== "workspace" && await bf(n, { force: !0 }), jf(), am("Resource agent binding saved.");
		},
		onRefreshScheduler: async () => {
			await yf({ updateURL: !1 }), $.selectedId === "scheduler" && await bf("scheduler", { force: !0 }), jf();
		},
		onToast: am,
		onIconsChanged: om
	};
	if (!$.tree) return t;
	if ($.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Yp()
	};
	let n = Vp($.selectedId) || $.tree.scheduler || $.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Yp()
	};
	let r = $.details[n.id] || null, i = Up(n.id), a = $.resourceLogPages?.[n.id] || {};
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
		detail: qf(r),
		logs: {
			hasMore: !!(a.hasMore ?? r?.logPage?.hasMore),
			loading: !!a.loading,
			error: String(a.error || "")
		}
	};
}
function qf(e) {
	return !e || e.type !== "scheduler" && e.type !== "project" && e.type !== "task" ? null : {
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
function Jf() {
	kd.renderDetailPanel(Kf());
}
async function Yf(e) {
	await Wf(e, { forceDetail: e === $.selectedId && e !== "workspace" });
}
function Xf(e) {
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
function Zf(e) {
	return Xf(e || "").trim();
}
function Qf() {
	$.workspaceAgentsDraft = "", $.workspaceAgentsDirty = !1;
}
async function $f(e, t, n = {}) {
	let r = n.workspaceId || $.activeWorkspaceId, i = n.requestVersion || ++$.previewRequestVersion;
	try {
		let n = await _f(rp(e, t, r));
		return r !== $.activeWorkspaceId || i !== $.previewRequestVersion || $.preview?.section !== e || $.preview?.path !== t ? null : ($.preview = {
			section: e,
			...n
		}, $.preview);
	} catch (a) {
		let o = r === $.activeWorkspaceId && i === $.previewRequestVersion && $.preview?.section === e && $.preview?.path === t;
		if (o && ($.preview = {
			section: e,
			path: t,
			error: ou(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function ep(e, t) {
	if (!$.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = $.activeWorkspaceId, r = $.navigationVersion, i = await _f(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!Nf(n, r) || $.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return $.workspaceAgents = i, $.workspaceAgentsDraft = Zf(i.content || ""), $.workspaceAgentsDirty = !1, i;
}
function tp() {
	$.previewRequestVersion++, $.preview = null, jf();
}
function np() {
	$.diffRequestVersion++, $.diff = null, jf();
}
function rp(e, t, n = $.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
async function ip(e = $.activeWorkspaceId) {
	let t = ++$.treeRequestVersion, n = $.navigationVersion, r = await _f(`/api/workspaces/${e}/tree`);
	return Nf(e, n, t) ? r : null;
}
async function ap() {
	if (!$.activeWorkspaceId || !$.tree) return;
	let e = await ip($.activeWorkspaceId);
	e && ($.tree = e);
}
async function op(e, t) {
	let n = $.activeWorkspaceId;
	!n || !e || (await _f(`/api/workspaces/${encodeURIComponent(n)}/resources/${encodeURIComponent(e)}/attention`, {
		method: "PUT",
		body: JSON.stringify({ followed: t })
	}), await ap(), jf());
}
async function sp(e) {
	let t = $.activeWorkspaceId;
	!t || !e || (await _f(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(e)}/attention/dismiss`, { method: "POST" }), await ap(), jf());
}
async function cp(e = $.activeWorkspaceId, t = Pp()) {
	if (!e || !t) return !1;
	let n = ++$.messageStatusRequestVersion, r = `${e}:${t}`, i = await _f(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/status`);
	if (n !== $.messageStatusRequestVersion || e !== $.activeWorkspaceId || t !== Pp()) return !1;
	let a = $.messageStatusKey !== r || !rm($.messageStatus, i);
	return $.messageStatusKey = r, $.messageStatus = i, a;
}
async function lp(e) {
	if (!e || $.steeringMessageId) return;
	let t = $.activeWorkspaceId, n = Pp();
	$.steeringMessageId = e, Sp();
	try {
		await _f(`/api/workspaces/${encodeURIComponent(t)}/messages/${encodeURIComponent(e)}/steer`, { method: "POST" }), await cp(t, n), t === $.activeWorkspaceId && n === Pp() && (jf(), am("Message inserted into the current turn."));
	} catch (e) {
		try {
			await cp(t, n);
		} catch {}
		throw e;
	} finally {
		$.steeringMessageId === e && ($.steeringMessageId = "", Sp());
	}
}
async function up() {
	Fd(), Rd.reset(), Pd(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, await cp();
}
function dp() {
	Fd(), Op(), $.agent.optionsOpen = !1, $.agent.historyOpen = !1, Pd(), Rd.reset(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = "", $.agent.toolGroupOpen.clear(), $.agent.approvalDrafts.clear(), $.agent.renderDeferredForSelection = !1, mp();
}
function fp(e, t, n) {
	if (e !== $.activeWorkspaceId || t !== Pp() || !n) return;
	let r = Vp(t)?.runtime || $.messageStatus?.generation;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && mf(n, r?.generationId ? {
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
	].includes(n.type) && cp().then(jf).catch((e) => console.warn("agent refresh failed", e));
}
function pp(e, t, n) {}
function mp() {
	$.agent.renderTimer && window.clearTimeout($.agent.renderTimer), $.agent.renderTimer = null;
}
function hp(e) {
	let t = (e || []).filter((e) => !Kd.has(e?.type)), n = Od(t), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function gp(e) {
	if (!e) return "";
	let t = [_p(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function _p(e) {
	return ($.config?.agentHubProviders || af.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function vp(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function yp(e = {}) {
	Sp();
	let t = Pp(), n = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, r = ($.config?.agents || []).find((e) => e.id === n?.resolvedAgent);
	kd.renderEventTimeline({
		identity: `${$.activeWorkspaceId}:${t}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: Cp(r || Zp()),
		project: hp,
		onEvent: fp,
		onNotice: pp,
		onApproval: Mp,
		onToast: am,
		onIconsChanged: om
	});
}
function bp(e, t) {
	return `${e || "workspace"}:${t || "resource"}`;
}
var xp = "";
function Sp(e = {}) {
	$.agent.skipTTYDraftSync = !1;
	let t = Pp();
	$.activeWorkspaceId && t && Id(t);
	let n = Rd.active("turn-stop") && Rd.key("turn-stop") === t, r = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, i = $.activeWorkspaceId;
	kd.renderComposer({
		identity: `${$.activeWorkspaceId}:${t}:${$.agent.ttyDraftKey || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		draft: $.agent.ttyDraft || "",
		draftKey: $.agent.ttyDraftKey || "",
		draftResetVersion: $.agent.ttyDraftResetVersion || 0,
		unavailableReason: r ? r.acceptsMessages ? "" : r.archived ? "This resource is archived." : r.configError || "This resource cannot accept messages." : "Loading work status.",
		sending: Rd.isSending(bp($.activeWorkspaceId, t)),
		canEndTurn: !!(n || ["running", "waiting_approval"].includes(String(r?.session?.state || ""))),
		endingTurn: n,
		waitingMessages: r?.waitingMessages || [],
		canSteerWaiting: !!r?.canSteerWaiting,
		steeringMessageId: $.steeringMessageId,
		agentBinding: t === "workspace" ? $.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : Vp(t)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: of(),
		bindingSaving: xp === t,
		onDraft: (e, t) => Tp(e, t),
		onSend: Np,
		onOpenUpload: Ep,
		onEndTurn: () => jp().catch((e) => am(e.message)),
		onSteerWaiting: lp,
		onSaveAgentBinding: async (e) => {
			if (t === Pp()) {
				xp = t, Sp();
				try {
					await _f(`/api/workspaces/${encodeURIComponent(i)}/resources/${encodeURIComponent(t)}/agent-binding`, {
						method: "PUT",
						body: JSON.stringify(e)
					}), await yf({ updateURL: !1 }), t !== "workspace" && await bf(t, { force: !0 }), jf(), am("Resource agent binding saved.");
				} catch (e) {
					am(ou(e));
				} finally {
					xp = "", Sp();
				}
			}
		},
		onIconsChanged: om
	});
}
function Cp(e) {
	return e?.name || e?.id || "Agent";
}
function wp() {
	af.render();
}
function Tp(e, t) {
	!t || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== Pp() || t.draftKey !== $.agent.ttyDraftKey || Ld(e);
}
function Ep() {
	let e = Pp();
	if (!e || $.messageStatus?.archived) {
		am("Select an active resource before uploading files.");
		return;
	}
	let t = Ud("ttyInput");
	t && Ld(t.value), $.modalEnter = "upload", $.uploadDialog = {
		open: !0,
		identity: ++rf,
		resourceId: e,
		items: [],
		nextId: 1
	}, Ap();
}
function Dp(e = [], t = {}) {
	if (!$.uploadDialog.open) return;
	let n = $.uploadDialog.resourceId === Pp(), r = !t.workspaceId || t.workspaceId === $.activeWorkspaceId, i = e.length > 0 && r && n;
	i && (Ld(kp($.agent.ttyDraft, e)), $.agent.ttyDraftResetVersion++), Op();
	let a = Ud("ttyComposer");
	a && delete a.dataset.composerKey, Sp({ skipDraftSync: i }), Ud("ttyInput")?.focus({ preventScroll: !0 }), om();
}
function Op() {
	$.uploadDialog = {
		open: !1,
		identity: ++rf,
		resourceId: "",
		items: [],
		nextId: 1
	}, Ap();
}
function kp(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function Ap() {
	let e = $.uploadDialog;
	kd.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${$.activeWorkspaceId}:${e.resourceId || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: e.resourceId || "",
		onDone: Dp,
		onIconsChanged: om
	});
}
async function jp() {
	let e = $.activeWorkspaceId, t = Pp(), n = $.messageStatus?.generation?.generationId || "", r = Rd.begin("turn-stop", t);
	if (r) try {
		let r = n ? `?generationId=${encodeURIComponent(n)}` : "";
		await _f(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/turn/end${r}`, { method: "POST" }), await cp(e, t), jf();
	} finally {
		Rd.finish(r);
	}
}
async function Mp(e, t, n) {
	let r = $.activeWorkspaceId, i = Pp();
	await _f(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/approval?generationId=${encodeURIComponent(e)}`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), await cp(r, i), jf();
}
async function Np(e, t) {
	if (!e.trim() || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== Pp() || t.draftKey !== $.agent.ttyDraftKey) return {
		accepted: !1,
		clear: !1
	};
	let n = bp(t.workspaceId, t.resourceId);
	if (!Rd.startSending(n)) return {
		accepted: !1,
		clear: !1
	};
	let r = $.agent.ttyDraftVersion;
	try {
		await _f(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/resources/${encodeURIComponent(t.resourceId)}/messages`, {
			method: "POST",
			body: JSON.stringify({
				text: e,
				role: "user",
				sender: { name: gf() }
			})
		});
		let n = Nd({
			workspaceId: t.workspaceId,
			resourceId: t.resourceId,
			key: t.draftKey,
			text: e,
			version: r
		});
		return n && $.agent.ttyDraftResetVersion++, await Promise.all([cp(t.workspaceId, t.resourceId), ap()]), jf(), {
			accepted: !0,
			clear: n
		};
	} finally {
		Rd.stopSending(n);
	}
}
function Pp() {
	return $.selectedId === "workspace" ? "workspace" : Vp($.selectedId)?.id || "";
}
function Fp() {
	Lp("project");
}
function Ip(e) {
	Lp("task", e);
}
function Lp(e, t = "") {
	Hd.open(e === "task" ? "task" : "project", t);
}
function Rp() {
	Hd.close();
}
function zp() {
	Hd.render();
}
async function Bp(e) {
	confirm(`Archive ${e}?`) && (await _f(`/api/workspaces/${$.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	}), am("Archived."), $.selectedId = "workspace", await yf());
}
function Vp(e) {
	if (!$.tree) return null;
	if ($.tree.scheduler?.id === e) return $.tree.scheduler;
	for (let t of $.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function Hp() {
	return $.selectedId === "workspace" || Vp($.selectedId) ? !1 : ($.selectedId = "workspace", !0);
}
function Up(e) {
	if (!$.tree) return null;
	for (let t of $.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function Wp(e) {
	return $.expandedProjects.has(e);
}
function Gp(e = !1) {
	let t = Up($.selectedId);
	!t || t.id === $.selectedId || $.expandedProjects.has(t.id) || ($.expandedProjects.add(t.id), e && Of().catch((e) => am(e.message)));
}
function Kp(e = window.location.pathname) {
	return Bd.parse(e);
}
function qp(e) {
	return !!(e && $.config?.workspaces.some((t) => t.id === e));
}
function Jp(e = {}) {
	Bd.project($.activeWorkspaceId, $.selectedId, e);
}
function Yp() {
	return $.config?.workspaces.find((e) => e.id === $.activeWorkspaceId)?.name || "Workspace";
}
function Xp() {
	let e = Qp(), t = $p();
	e.some((e) => e.id === $.agent.agentName) || ($.agent.agentName = t);
}
function Zp() {
	let e = Qp(), t = $.agent.agentName || $p();
	return e.find((e) => e.id === t) || e[0] || null;
}
function Qp() {
	return ($.config?.agents || []).filter((e) => e.available !== !1);
}
function $p() {
	let e = Qp();
	return em($.config?.agentProfiles, "default") || em(af.profiles(), "default") || e[0]?.id || "";
}
function em(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function tm(e = "workspace") {
	return af.open(e);
}
function nm(e, t) {
	return af.withAgentHubCatalog(e, t);
}
function rm(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var im = 0;
function am(e) {
	kd.renderToast({
		message: String(e || ""),
		revision: ++im
	});
}
function om() {
	let e = window.lucide;
	!e || $.iconRefreshScheduled || ($.iconRefreshScheduled = !0, Ad?.animationFrame(() => {
		$.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function sm(e) {
	om(), e === "markdown" && window.marked && window.DOMPurify && (Jf(), om()), e === "diff" && Jf();
}
window.forgeAssetLoaded = sm;
function cm() {
	zd.initialize();
}
function lm(e, t) {
	zd.previewPane(e, t);
}
function um(e) {
	zd.commitPane(e);
}
function dm() {
	zd.syncViewport();
}
function fm(e) {
	zd.setMobileSidebar(e);
}
function pm(e) {
	zd.setMobileView(e);
}
function mm(e) {
	zd.setMobileImmersive(e);
}
function hm() {
	Ad?.listen(document, "selectionchange", () => {
		if (!$.agent.renderDeferredForSelection) return;
		let e = Ud("ttyLog");
		e && vp(e) || ($.agent.renderDeferredForSelection = !1, yp(), om());
	}), Ad?.listen(document, "keydown", (e) => {
		e.key === "Escape" && $.diff ? np() : e.key === "Escape" && $.preview ? tp() : e.key === "Escape" && ($.agent.optionsOpen || $.agent.historyOpen) && ($.agent.optionsOpen = !1, $.agent.historyOpen = !1, Sp(), om());
	}), Ad?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Yf(n.dataset.breadcrumbResource || "workspace").catch((e) => am(ou(e)));
			return;
		}
		($.agent.optionsOpen || $.agent.historyOpen) && t && !t.closest(".tty-composer") && ($.agent.optionsOpen = !1, $.agent.historyOpen = !1, Sp(), om()), om();
	}), Ad?.listen(window, "beforeunload", vm), Ad?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && vm();
	});
}
var gm = !1;
function _m(e) {
	if (kd = e, gm) {
		sf();
		return;
	}
	gm = !0;
	let t = new cd();
	Ad = t, cf = Du({
		scope: t,
		selectedResourceId: () => $.selectedId,
		resourceProjections: () => ff(),
		hasTree: () => !!$.tree,
		findResource: Vp,
		selectResource: Wf,
		notificationsSettingsVisible: () => af.isOpenTab("notifications"),
		renderSettings: wp,
		refreshIcons: om,
		flushDraft: vm
	}), lf = sd(t, () => {
		af.isOpenTab("user") && wp();
	}), hm(), cm(), cf.install(), Vf(), vf().catch((e) => {
		$.navigationLoading = !1, $.navigationError = e.message, am(e.message), jf();
	}), kf();
}
function vm() {
	Fd();
}
function ym() {
	gm && (vm(), gm = !1, cf?.dispose(), cf = null, lf = null, Rd.reset(), mp(), Hd.dispose(), Ad?.dispose(), Ad = null, $.autoRefreshTimer = null);
}
async function bm(e) {
	let t = Kp(e);
	if (!qp(t.workspaceId)) {
		Jp({ replace: !0 });
		return;
	}
	let n = $.activeWorkspaceId !== t.workspaceId, r = $.selectedId;
	Fd(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, $.workspaceAgentsSaving = !1;
	let i = $.navigationVersion;
	if ($.activeWorkspaceId = t.workspaceId || "", $.selectedId = t.resourceId || "workspace", !n && r !== $.selectedId && $.selectedId !== "workspace" && (Sf($.selectedId), delete $.details[$.selectedId]), $.preview = null, $.diff = null, n && ($.tree = null, $.navigationLoading = !0, $.navigationError = "", Qf(), $.workspaceAgentsSaving = !1, Rp(), uf($.activeWorkspaceId)), n && dp(), Lf(), n) {
		if (!await Df(t.workspaceId || "", i)) return;
		!t.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await yf({ updateURL: !1 }), Nf(t.workspaceId || "", i) && Jp({ replace: !0 });
	} else {
		let e = Hp();
		if ($.selectedId === "workspace" ? await Ef() : (Gp(!1), await bf($.selectedId)), !Nf(t.workspaceId || "", i)) return;
		r !== $.selectedId && await up(), jf(), e && Jp({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var xm = Xl(), Sm = {
	renderAppShell: xm.appShell.publish,
	renderCreateDialog: xm.create.publish,
	renderSettings: xm.settings.publish,
	renderUploadDialog: xm.upload.publish,
	renderComposer: xm.composer.publish,
	renderEventTimeline: xm.timeline.publish,
	renderDetailPanel: xm.detail.publish,
	renderToast: xm.toast.publish
}, Cm = null;
async function wm() {
	if (Cm) return;
	let e = document.getElementById("app");
	if (!e) throw Error("Forge application root is unavailable.");
	e.dataset.componentOwner = "app-shell", Cm = jr(ql, {
		target: e,
		props: { channels: xm }
	}), _m(Sm);
}
async function Tm() {
	if (ym(), !Cm) return;
	let e = Cm;
	Cm = null, await Fr(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void Tm()), window.addEventListener("pageshow", (e) => {
	e.persisted && wm();
}), wm().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
