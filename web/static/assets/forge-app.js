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
		r: B,
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
	var t = B;
	if (t === null) return Un.f |= te, e;
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
	var t = Un, n = B;
	Gn(null), Kn(null);
	try {
		return e();
	} finally {
		Gn(t), Kn(n);
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
		vn() && (V(n), Tn(() => (t === 0 && (r = pr(() => e(() => Zt(n)))), t += 1, () => {
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
			var t = B;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = B.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = En(() => {
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
		var t = B, n = Un, r = He;
		Kn(this.#i), Gn(this.#i), Ue(this.#i.ctx);
		try {
			return It.ensure(), e();
		} catch (e) {
			return Ye(e), null;
		} finally {
			Kn(t), Gn(n), Ue(r);
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
		return this.#h(), V(this.#m);
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
						var r = B;
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
	var s = B, c = mt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = B, t = Un, n = He, r = N;
	return function(i = !0) {
		Kn(e), Gn(t), Ue(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ht(e = !0) {
	Kn(null), Gn(null), Ue(null), e && N?.deactivate();
}
function gt() {
	var e = B, t = e.b, n = N, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function _t(e) {
	var t = 2 | h;
	return B !== null && (B.f |= S), {
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
		parent: B,
		ac: null
	};
}
var vt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function yt(e, t, n) {
	let r = B;
	r === null && pe();
	var i = void 0, a = qt(Te), o = !Un, s = /* @__PURE__ */ new Set();
	return wn(() => {
		var t = B, n = p();
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
	return Jn(t), t;
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
	var t, n = B, r = e.parent;
	if (!Vn && r !== null && e.v !== Te && r.f & 24576) return ke(), e.v;
	Kn(r);
	try {
		e.f &= ~T, xt(e), t = or(e);
	} finally {
		Kn(n);
	}
	return t;
}
function Ct(e) {
	var t = St(e);
	if (!e.equals(t) && (e.wv = rr(), (!N?.is_fork || e.deps === null) && (N === null ? e.v = t : (N.capture(e, t, !0), Dt?.capture(e, t, !0)), e.deps === null))) {
		Qe(e, m);
		return;
	}
	Vn || (Ot === null ? $e(e) : (vn() || N?.is_fork) && Ot.set(e, t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
		t.ac.abort(ue), t.ac = null;
	}), t.fn !== null && (t.teardown = d), cr(t, 0), kn(t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && lr(t);
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
			if (Mt !== null && t === B && (Un === null || !(Un.f & 2))) return;
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
			if (!(r.f & 24576) && ir(r) && (zt = /* @__PURE__ */ new Set(), lr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nn(r), zt?.size > 0)) {
				Gt.clear();
				for (let e of zt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) zt.has(n) && (zt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || lr(n);
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
	return Jn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Jt(e, t = !1, n = !0) {
	let r = qt(e);
	return t || (r.equals = Ve), r;
}
function F(e, t, n = !1) {
	return Un !== null && (!Wn || Un.f & 131072) && We() && Un.f & 4325394 && (qn === null || !qn.has(e)) && Se(), Yt(e, n ? $t(t) : t, Nt);
}
function Yt(e, t, n = null) {
	if (!e.equals(t)) {
		Gt.set(e, Vn ? t : e.v);
		var r = It.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && St(t), Ot === null && $e(t);
		}
		e.wv = rr(), Qt(e, h, n), We() && B !== null && B.f & 1024 && !(B.f & 96) && (Zn === null ? Qn([e]) : Zn.push(e)), !r.is_fork && Wt.size > 0 && !Kt && Xt();
	}
	return t;
}
function Xt() {
	Kt = !1;
	for (let e of Wt) {
		e.f & 1024 && Qe(e, g);
		let t;
		try {
			t = ir(e);
		} catch {
			t = !0;
		}
		t && lr(e);
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
		if (!(!i && s === B)) {
			var l = (c & h) === 0;
			if (l && Qe(s, t), c & 131072) Wt.add(s);
			else if (c & 2) {
				var u = s;
				Ot?.delete(u), c & 65536 || (c & 512 && (B === null || !(B.f & 2097152)) && (s.f |= T), Qt(u, g, n));
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
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ P(0), u = null, d = tr, f = (e) => {
		if (tr === d) return e();
		var t = Un, n = tr;
		Gn(null), nr(d);
		var r = e();
		return Gn(t), nr(n), r;
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
				var c = V(o);
				return c === Te ? void 0 : c;
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
			return (n !== void 0 || B !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ P(i ? $t(e[t]) : Te, u)), r.set(t, n)), V(n) === Te) ? !1 : i;
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
			V(o);
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
	B === null && (Un === null && _e(e), ge()), Vn && he(e);
}
function gn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function _n(e, t) {
	var n = B;
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
	return Qe(t, m), t.teardown = e, t;
}
function bn(e) {
	hn("$effect");
	var t = B.f;
	if (!Un && t & 32 && He !== null && !He.i) {
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Mn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, kn(e, t && !n), cr(e, 0);
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
			if (ir(a) && Ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && Ot === null && Qe(e, m);
	}
	return !1;
}
function ar(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(qn !== null && qn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ar(a, t, !1) : t === a && (n ? Qe(a, h) : a.f & 1024 && Qe(a, g), Vt(a));
	}
}
function or(e) {
	var t = Yn, n = Xn, r = Zn, i = Un, a = qn, o = He, s = Wn, c = tr, l = e.f;
	Yn = null, Xn = 0, Zn = null, Un = l & 96 ? null : e, qn = null, Ue(e.ctx), Wn = !1, tr = ++er, e.ac !== null && (st(() => {
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = N?.is_fork;
		if (Yn !== null) {
			var m;
			if (p || cr(e, Xn), f !== null && Xn > 0) for (f.length = Xn + Yn.length, m = 0; m < Yn.length; m++) f[Xn + m] = Yn[m];
			else e.deps = f = Yn;
			if (vn() && e.f & 512) for (m = Xn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Xn < f.length && (cr(e, Xn), f.length = Xn);
		if (We() && Zn !== null && !Wn && f !== null && !(e.f & 6146)) for (m = 0; m < Zn.length; m++) ar(Zn[m], e);
		if (i !== null && i !== e) {
			if (er++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = er;
			if (t !== null) for (let e of t) e.rv = er;
			Zn !== null && (r === null ? r = Zn : r.push(...Zn));
		}
		return e.f & 8388608 && (e.f ^= te), d;
	} catch (e) {
		return Ye(e);
	} finally {
		e.f ^= E, Yn = t, Xn = n, Zn = r, Un = i, qn = a, Ue(o), Wn = s, tr = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== Te && $e(s), s.ac !== null && st(() => {
			s.ac.abort(ue), s.ac = null, Qe(s, h);
		}), wt(s), cr(s, 0);
	}
}
function cr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) sr(e, n[r]);
}
function lr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Qe(e, m);
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
	await Promise.resolve(), Lt();
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
	if (Vn && Gt.has(e)) return Gt.get(e);
	if (t) {
		var a = e;
		if (Vn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || fr(a)) && (o = St(a)), Gt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Wn && Un !== null && (Bn || !!(Un.f & 512)), c = (a.f & y) === 0;
		ir(a) && (s && (a.f |= 512), Ct(a)), s && !c && (Tt(a), dr(a));
	}
	if (Ot?.has(e)) return Ot.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function dr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Tt(t), dr(t));
}
function fr(e) {
	if (e.v === Te) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Gt.has(t) || t.f & 2 && fr(t)) return !0;
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
		if (ne in e) hr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && ne in n && hr(n);
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
		if (r.capture || Tr.call(t, e), !e.cancelBubble) return st(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qe(() => {
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
		if (D) return kr(Pe, null), Pe;
		i === void 0 && (i = Or(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ ln(i)));
		var t = r || rn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ ln(t), s = t.lastChild;
			kr(o, s);
		} else kr(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ar(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (D) return kr(Pe, null), Pe;
		if (!o) {
			var e = /* @__PURE__ */ ln(Or(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ ln(e);) o.appendChild(/* @__PURE__ */ ln(e));
			else o = /* @__PURE__ */ ln(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ ln(t), r = t.lastChild;
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
	if (D) return kr(Pe, null), Pe;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = cn();
	return e.append(t, n), kr(t, n), e;
}
function W(e, t) {
	if (D) {
		var n = B;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = Pe), Ie();
		return;
	}
	e !== null && e.before(t);
}
function G(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ce] ??= e.nodeValue) && (e[ce] = n, e.nodeValue = `${n}`);
}
function Nr(e, t) {
	return Fr(e, t);
}
var Pr = /* @__PURE__ */ new Map();
function Fr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	sn();
	var l = void 0, u = Sn(() => {
		var s = n ?? t.appendChild(cn());
		dt(s, { pending: () => {} }, (t) => {
			A({});
			var n = He;
			if (o && (n.c = o), a && (i.$$events = a), D && kr(t, null), l = e(t, i) || {}, D && (B.nodes.end = Pe, Pe === null || Pe.nodeType !== 8 || Pe.data !== "]")) throw Ae(), we;
			j();
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
function K(e, t, n = !1) {
	var r;
	D && (r = Pe, Ie());
	var i = new Rr(e), a = n ? x : 0;
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
var zr = Symbol("NaN");
function Br(e, t, n) {
	D && Ie();
	var r = new Rr(e), i = !We();
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
		c = D ? Fe(/* @__PURE__ */ ln(u)) : u.appendChild(cn());
	}
	D && Ie();
	var d = null, f = /* @__PURE__ */ bt(() => {
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
			D && Re(c) === "[!" != (e === 0) && (c = Le(), Fe(c), Ne(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = N, v = fn(), y = 0; y < e; y += 1) {
				D && Pe.nodeType === 8 && Pe.data === "]" && (c = Pe, t = !0, Ne(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Yt(S.v, b), S.i && Yt(S.i, y), v && u.unskip_effect(S.e)) : (S = qr(l, h ? c : Wr ??= cn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Dn(() => s(c)) : (d = Dn(() => s(Wr ??= cn())), d.f |= w)), e > r.size && me("", "", ""), D && e > 0 && Fe(Le()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Ne(!0), V(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, D && (c = Pe);
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
	o && qe(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function qr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? qt(n) : /* @__PURE__ */ Jt(n, !1, !1) : null, l = o & 2 ? qt(i) : null;
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
		var o = /* @__PURE__ */ un(r);
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
		D && (o = Fe(/* @__PURE__ */ ln(c)));
	}
	z(() => {
		var e = B;
		if (s === (s = t() ?? "")) {
			D && Ie();
			return;
		}
		if (n && !D) {
			e.nodes = null, c.innerHTML = s, s !== "" && kr(/* @__PURE__ */ ln(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Mn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (D) {
				for (var a = Pe.data, l = Ie(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ un(l);
				if (l === null) throw Ae(), we;
				kr(Pe, u), o = Fe(l);
				return;
			}
			var d = pn(r ? "svg" : i ? "math" : "template", r ? De : i ? Oe : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (kr(/* @__PURE__ */ ln(f), f.lastChild), r || i) for (; /* @__PURE__ */ ln(f);) o.before(/* @__PURE__ */ ln(f));
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
				mr(e), i && Be(a, e) && (a = e, r.update(e));
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
	var o = e[oe];
	if (D || o !== n || o === void 0) {
		var s = ri(n, r, a);
		(!D || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[oe] = n;
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
	var i = e[se];
	if (D || i !== t) {
		var a = oi(t, r);
		(!D || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[se] = t;
	} else r && (Array.isArray(r) ? (si(e, n?.[0], r[0]), si(e, n?.[1], r[1], "important")) : si(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function li(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return je();
		for (var i of t.options) i.selected = n.includes(fi(i));
		return;
	}
	for (i of t.options) if (tn(fi(i), n)) {
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
	ct(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), fi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && fi(o);
		}
		n(a), e.__value = a, N !== null && r.add(N);
	}), Cn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = N;
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
var pi = Symbol("is custom element"), mi = Symbol("is html"), hi = de ? "link" : "LINK", gi = de ? "progress" : "PROGRESS";
function _i(e) {
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
	D && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === hi) || i[t] !== (i[t] = n) && (t === "loading" && (e[ie] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Si(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function bi(e) {
	return e[ae] ??= {
		[pi]: e.nodeName.includes("-"),
		[mi]: e.namespaceURI === Ee
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
	ct(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Ti(e) ? Ei(a) : a, n(a), N !== null && r.add(N), await ur(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (D && e.defaultValue !== e.value || pr(t) == null && e.value) && (n(Ti(e) ? Ei(e.value) : e.value), N !== null && r.add(N)), Tn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = N;
			if (r.has(i)) return;
		}
		Ti(e) && n === Ei(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function wi(e, t, n = t) {
	ct(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (D && e.defaultChecked !== e.checked || pr(t) == null) && n(e.checked), Tn(() => {
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
	return e === t || e?.[ne] === t;
}
function Oi(e = {}, t, n, r) {
	var i = He.r, a = B;
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
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ _t(r), V(u)) : (l && (l = !1, c = s ? pr(r) : r), c);
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
	o && V(y);
	var b = B;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? V(y) : i && o ? $t(e) : e;
			return F(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Vn && v || b.f & 16384 ? y.v : V(y);
	});
}
function Ai(e) {
	He === null && fe("onMount"), bn(() => {
		let t = pr(e);
		if (typeof t == "function") return t;
	});
}
function ji(e) {
	He === null && fe("onDestroy"), Ai(() => () => pr(e));
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
	A(t, !0);
	let n = ki(t, "className", 3, "");
	var r = Mr(), i = L(r), a = (e) => {
		var r = Pi();
		q(r, 21, () => t.status.statuses, (e) => e.key, (e, t) => {
			var n = Ni();
			X(I(n), {
				get name() {
					return V(t).iconName;
				},
				className: "task-status-icon"
			}), O(n), z(() => J(n, 1, `task-status-indicator ${V(t).className} ${V(t).recentOutput ? "task-status-fresh" : ""}`)), W(e, n);
		}), O(r), z(() => J(r, 1, `task-status-slot ${n()} ${t.status.slotClassName}`)), W(e, r);
	};
	K(i, (e) => {
		t.status.hasTaskState && e(a);
	}), W(e, r), j();
}
//#endregion
//#region src/components/AttentionList.svelte
var Ii = /* @__PURE__ */ U("<div class=\"activity-row empty-attention\"><!><div><strong>No activity</strong><span>Follow a resource or start a turn.</span></div></div>"), Li = /* @__PURE__ */ U("<span role=\"button\" tabindex=\"0\"><!></span>"), Ri = /* @__PURE__ */ U("<span class=\"attention-dismiss\" role=\"button\" tabindex=\"0\" title=\"Dismiss\"><!></span>"), zi = /* @__PURE__ */ U("<button type=\"button\"><span class=\"activity-status\" aria-hidden=\"true\"><span class=\"activity-status-fallback-slot\"><!></span> <span class=\"activity-status-runtime-slot\"><!></span></span> <span class=\"activity-title\"><strong> </strong><span class=\"activity-meta\"> </span></span> <span class=\"activity-actions\"><!> <!></span></button>"), Bi = /* @__PURE__ */ U("<section class=\"attention-section\" data-component-owner=\"attention-list\"><div class=\"section-title\"><span>Activity</span></div> <nav class=\"attention-list\" aria-label=\"Activity list\"><!></nav></section>");
function Vi(e, t) {
	A(t, !0);
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
	var u = Bi(), d = R(I(u), 2), f = I(d), p = (e) => {
		var t = Ii();
		X(I(t), { name: "message-square" }), k(), O(t), W(e, t);
	}, m = (e) => {
		var u = Mr();
		q(L(u), 17, () => t.items, (e) => e.id, (e, t) => {
			var u = zi(), d = I(u), f = I(d), p = I(f);
			{
				let e = /* @__PURE__ */ M(() => r(V(t)));
				X(p, {
					get name() {
						return V(e);
					},
					className: "activity-status-fallback"
				});
			}
			O(f);
			var m = R(f, 2);
			Fi(I(m), {
				get status() {
					return V(t).status;
				},
				className: "activity-status-icon"
			}), O(m), O(d);
			var h = R(d, 2), g = I(h), _ = I(g, !0);
			O(g);
			var v = R(g), y = I(v, !0);
			O(v), O(h);
			var b = R(h, 2), x = I(b), S = (e) => {
				var n = Li();
				let r;
				X(I(n), { name: "star" }), O(n), z(() => {
					r = J(n, 1, "attention-star", null, r, { followed: V(t).followed }), Y(n, "aria-label", V(t).followed ? `Unfollow ${V(t).title}` : `Follow ${V(t).title}`), Y(n, "title", V(t).followed ? "Unfollow" : "Follow");
				}), H("click", n, (e) => s(e, V(t))), H("keydown", n, (e) => l(e, (e) => s(e, V(t)))), W(e, n);
			}, C = /* @__PURE__ */ M(() => i(V(t)));
			K(x, (e) => {
				V(C) && e(S);
			});
			var w = R(x, 2), T = (e) => {
				var n = Ri();
				X(I(n), { name: "x" }), O(n), z(() => Y(n, "aria-label", `Dismiss ${V(t).title}`)), H("click", n, (e) => c(e, V(t))), H("keydown", n, (e) => l(e, (e) => c(e, V(t)))), W(e, n);
			};
			K(w, (e) => {
				V(t).activeTurn || e(T);
			}), O(b), O(u), z((e, n, r) => {
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
	}), O(d), O(u), W(e, u), j();
}
Cr(["click", "keydown"]);
//#endregion
//#region src/components/MobileToolbar.svelte
var Hi = /* @__PURE__ */ U("<header class=\"mobile-toolbar\" data-component-owner=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" type=\"button\" aria-label=\"Toggle immersive chat\"><span class=\"mobile-immersive-icon mobile-immersive-icon-collapse\"><!></span><span class=\"mobile-immersive-icon mobile-immersive-icon-expand\"><!></span></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" data-component-owner=\"mobile-toolbar\" type=\"button\" aria-label=\"Close navigation\"></button>", 1);
function Ui(e, t) {
	A(t, !0);
	var n = Hi(), r = L(n), i = I(r);
	X(I(i), { name: "menu" }), O(i);
	var a = R(i, 2), o = I(a), s = R(o, 2);
	O(a);
	var c = R(a, 2);
	let l;
	var u = I(c);
	X(I(u), { name: "minimize-2" }), O(u);
	var d = R(u);
	X(I(d), { name: "maximize-2" }), O(d), O(c), O(r);
	var f = R(r, 2);
	z(() => {
		Y(i, "aria-expanded", t.sidebarOpen), Y(o, "aria-selected", t.view === "details"), Y(s, "aria-selected", t.view === "chat"), l = J(c, 1, "mobile-icon-button mobile-immersive-button", null, l, { immersive: t.immersive }), Y(c, "aria-pressed", t.immersive);
	}), H("click", i, () => t.onSidebar(!t.sidebarOpen)), H("click", o, () => t.onView("details")), H("click", s, () => t.onView("chat")), H("click", c, () => t.onImmersive(!t.immersive)), H("click", f, () => t.onSidebar(!1)), W(e, n), j();
}
Cr(["click"]);
//#endregion
//#region src/components/PaneResizeHandle.svelte
var Wi = /* @__PURE__ */ U("<div data-component-owner=\"pane-resize-handle\" role=\"separator\"></div>");
function Gi(e, t) {
	A(t, !0);
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
	}), H("pointerdown", i, r), W(e, i), j();
}
Cr(["pointerdown"]);
//#endregion
//#region src/components/ProjectTree.svelte
var Ki = /* @__PURE__ */ U("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), qi = /* @__PURE__ */ U("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Ji = /* @__PURE__ */ U("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Yi = /* @__PURE__ */ U("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), Xi = /* @__PURE__ */ U("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Zi = /* @__PURE__ */ U("<div class=\"task-group\"></div>"), Qi = /* @__PURE__ */ U("<button type=\"button\"><span><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), $i = /* @__PURE__ */ U("<section class=\"tree-section\" data-component-owner=\"project-tree\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section>");
function ea(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(null), i = /* @__PURE__ */ P($t(t.identity));
	bn(() => {
		t.identity !== V(i) && (F(i, t.identity, !0), d());
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
		V(n) && t.onDragState(null), F(n, null), F(r, null);
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
	var h = $i(), g = I(h), _ = R(I(g));
	X(I(_), { name: "plus" }), O(_), O(g);
	var v = R(g, 2), y = I(v), b = (e) => {
		var t = Ki();
		X(I(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), k(2), O(t), W(e, t);
	}, x = (e) => {
		var n = qi(), r = I(n);
		X(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = R(r, 2), a = I(i, !0);
		O(i), O(n), z(() => G(a, t.error)), W(e, n);
	}, S = (e) => {
		var t = Ji();
		X(I(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), k(2), O(t), W(e, t);
	}, C = (e) => {
		var r = Mr();
		q(L(r), 17, () => t.projects, (e) => e.id, (e, t) => {
			var r = Qi(), i = L(r), s = I(i);
			let h;
			var g = I(s), _ = (e) => {
				X(e, { name: "chevron-right" });
			};
			K(g, (e) => {
				V(t).children.length && e(_);
			}), O(s);
			var v = R(s, 2);
			Fi(v, { get status() {
				return V(t).status;
			} });
			var y = R(v, 2);
			X(y, {
				name: "folder",
				className: "tree-icon"
			});
			var b = R(y, 2), x = I(b), S = I(x, !0);
			O(x);
			var C = R(x), w = I(C, !0);
			O(C);
			var T = R(C), E = (e) => {
				var n = Yi(), r = I(n), i = I(r, !0);
				O(r);
				var a = R(r, 2), o = I(a, !0);
				O(a), O(n), z(() => {
					G(i, V(t).summary.taskLabel), G(o, V(t).summary.runningLabel);
				}), W(e, n);
			};
			K(T, (e) => {
				V(t).summary && !V(t).expanded && e(E);
			}), O(b);
			var ee = R(b, 2);
			let te;
			X(I(ee), { name: "star" }), O(ee);
			var ne = R(ee, 2);
			X(I(ne), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), O(ne), O(i);
			var re = R(i, 2), ie = (e) => {
				var r = Zi();
				q(r, 21, () => V(t).children, (e) => e.id, (e, r) => {
					var i = Xi(), s = R(I(i), 2);
					Fi(s, { get status() {
						return V(r).status;
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
				}), O(r), W(e, r);
			};
			K(re, (e) => {
				V(t).expanded && e(ie);
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
			})), H("click", ee, (e) => p(e, V(t))), H("keydown", ee, (e) => m(e, V(t))), Sr("dragstart", ne, (e) => c(e, {
				kind: "project",
				id: V(t).id,
				projectId: ""
			})), Sr("dragend", ne, d), W(e, r);
		}), W(e, r);
	};
	K(y, (e) => {
		t.loading ? e(b) : t.error ? e(x, 1) : t.projects.length === 0 ? e(S, 2) : e(C, -1);
	}), O(v), O(h), z(() => Y(v, "data-navigation-identity", t.identity)), H("click", _, function(...e) {
		t.onCreate?.apply(this, e);
	}), W(e, h), j();
}
Cr(["click", "keydown"]);
//#endregion
//#region src/components/SchedulerNav.svelte
var ta = /* @__PURE__ */ U("<section class=\"scheduler-nav\" data-component-owner=\"scheduler-nav\"><button type=\"button\"><!> <!> <span><strong>Scheduler</strong><small>Natural-language schedules</small></span> <!></button></section>");
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
	}), O(i), O(r), z(() => {
		i.disabled = !t.item, Y(i, "title", t.item?.statusLabel || "Workspace Scheduler"), a = J(i, 1, "", null, a, { active: t.item?.active });
	}), H("click", i, n), W(e, r), j();
}
Cr(["click"]);
//#endregion
//#region src/components/WorkspaceSwitcher.svelte
var ra = /* @__PURE__ */ U("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), ia = /* @__PURE__ */ U("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), aa = /* @__PURE__ */ U("<section class=\"workspace-switcher\" data-component-owner=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <span class=\"workspace-switcher-icon workspace-switcher-icon-idle\"><!></span><span class=\"workspace-switcher-icon workspace-switcher-icon-busy\"><!></span></button> <!></div></section>");
function oa(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(!1), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P($t(t.identity)), a = /* @__PURE__ */ M(() => t.workspaces.find((e) => e.id === t.activeWorkspaceId) ?? null);
	bn(() => {
		t.identity !== V(i) && (F(i, t.identity, !0), F(n, !1), F(r, ""));
	}), Ai(() => {
		let e = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			V(n) && !t?.closest(".workspace-select-row") && F(n, !1);
		}, r = (e) => {
			e.key === "Escape" && !t.mobileSidebarOpen && F(n, !1);
		};
		return document.addEventListener("mousedown", e), document.addEventListener("keydown", r), () => {
			document.removeEventListener("mousedown", e), document.removeEventListener("keydown", r);
		};
	});
	async function o(e) {
		if (!(!e || V(r))) {
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
	var s = aa(), c = I(s), l = I(c);
	let u;
	var d = I(l), f = I(d);
	O(d);
	var p = R(d, 2), m = I(p, !0);
	O(p);
	var h = R(p, 2);
	X(I(h), {
		name: "chevrons-up-down",
		className: "select-icon"
	}), O(h);
	var g = R(h);
	X(I(g), {
		name: "loader-circle",
		className: "select-icon"
	}), O(g), O(l);
	var _ = R(l, 2), v = (e) => {
		var i = ia(), a = R(I(i), 2);
		q(a, 17, () => t.workspaces, (e) => e.id, (e, n) => {
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
			K(p, (e) => {
				V(n).id === t.activeWorkspaceId && e(m);
			}), O(i), z((e) => {
				Y(i, "aria-selected", V(n).id === t.activeWorkspaceId), Y(i, "data-workspace-id", V(n).id), i.disabled = e, Y(s, "src", V(n).iconSrc), G(u, V(n).name || V(n).id), G(f, V(n).path);
			}, [() => !!V(r)]), H("click", i, () => o(V(n).id)), W(e, i);
		});
		var s = R(a, 2), c = I(s);
		X(I(c), { name: "plus" }), k(), O(c), O(s), O(i), H("click", c, () => {
			F(n, !1), t.onAdd();
		}), W(e, i);
	};
	K(_, (e) => {
		V(n) && e(v);
	}), O(c), O(s), z((e) => {
		u = J(l, 1, "workspace-switcher-button", null, u, e), Y(l, "aria-expanded", V(n)), Y(f, "src", V(a)?.iconSrc || "/favicon.svg"), G(m, V(a)?.name || "Workspace");
	}, [() => ({ busy: !!V(r) })]), H("click", l, (e) => {
		e.stopPropagation(), F(n, !V(n));
	}), W(e, s), j();
}
Cr(["click"]);
//#endregion
//#region src/components/AppShell.svelte
var sa = /* @__PURE__ */ U("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div class=\"tty-panel\"><!><div id=\"ttyLog\" class=\"tty-log\" data-component-owner=\"event-timeline\"><!></div><div id=\"ttyComposer\" class=\"tty-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div>");
function ca(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(0);
	Ai(() => {
		let e = t.channel.subscribe((e) => {
			F(n, e, !0), queueMicrotask(e.onIconsChanged);
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
		!e.path || e.revision <= V(r) || (F(r, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	var i = sa(), a = I(i);
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
	var o = R(a, 2), s = I(o), c = R(I(s)), l = R(I(c)), u = I(l, !0);
	O(l), O(c);
	var d = R(c);
	X(I(d), { name: "settings" }), O(d), O(s);
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
		let e = /* @__PURE__ */ M(() => V(n).scheduler || null);
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
	}), O(o);
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
	var _ = R(g, 2), v = I(_), y = I(v);
	X(I(y), { name: "menu" }), O(y), O(v);
	var b = R(v, 2), x = I(b), S = I(x), C = R(S, 2);
	O(x), O(b);
	var w = R(b, 2), T = I(w), E = (e) => {
		var n = Mr();
		Zr(L(n), () => t.details), W(e, n);
	};
	K(T, (e) => {
		t.details && e(E);
	}), O(w);
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
	var te = R(ee, 2), ne = I(te), re = I(ne), ie = (e) => {
		var n = Mr();
		Zr(L(n), () => t.agentHeader), W(e, n);
	};
	K(re, (e) => {
		t.agentHeader && e(ie);
	});
	var ae = R(re), oe = I(ae), se = (e) => {
		var n = Mr();
		Zr(L(n), () => t.timeline), W(e, n);
	};
	K(oe, (e) => {
		t.timeline && e(se);
	}), O(ae);
	var ce = R(ae), le = I(ce), ue = (e) => {
		var n = Mr();
		Zr(L(n), () => t.composer), W(e, n);
	};
	K(le, (e) => {
		t.composer && e(ue);
	}), O(ce), O(ne), O(te), O(_), O(i), z(() => {
		G(u, V(n).version), Y(y, "aria-expanded", V(n).mobile.sidebarOpen), Y(S, "aria-selected", V(n).mobile.view === "details"), Y(C, "aria-selected", V(n).mobile.view === "chat");
	}), H("click", d, () => {
		V(n).onMobileSidebar(!1), V(n).onOpenSettings();
	}), H("click", y, () => V(n).onMobileSidebar(!0)), H("click", S, () => V(n).onMobileView("details")), H("click", C, () => V(n).onMobileView("chat")), W(e, i), j();
}
Cr(["click"]);
//#endregion
//#region src/components/AgentPanelHeader.svelte
var la = /* @__PURE__ */ U("<span class=\"agent-header-queued\"> </span>"), ua = /* @__PURE__ */ U("<span class=\"agent-header-model\"> </span>"), da = /* @__PURE__ */ U("<span class=\"agent-header-turn\"> </span>"), fa = /* @__PURE__ */ U("<header class=\"agent-panel-header\" data-component-owner=\"agent-panel-header\"><div class=\"agent-header-left\"><span class=\"agent-status-dot\" aria-hidden=\"true\"></span> <span class=\"agent-header-name\"> </span> <span class=\"agent-header-state\"> </span> <!></div> <div class=\"agent-header-right\"><!> <!></div></header>");
function pa(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P($t(Date.now()));
	Ai(() => t.channel.subscribe((e) => {
		F(n, e, !0);
	}));
	let i = /* @__PURE__ */ M(() => V(n).resourceId ? V(n).status?.state || "loading" : "empty"), a = /* @__PURE__ */ M(() => V(i) === "working" ? "Working" : V(i) === "idle" ? "Idle" : V(i) === "attention_required" ? "Attention required" : V(i) === "unavailable" ? "Unavailable" : V(i) === "archived" ? "Archived" : V(i) === "loading" ? "Loading" : "No resource selected"), o = /* @__PURE__ */ M(() => V(n).status?.waitingMessages?.length || 0), s = /* @__PURE__ */ M(() => Date.parse(V(n).turnStartedAt || "")), c = /* @__PURE__ */ M(() => V(i) === "working" && Number.isFinite(V(s)));
	bn(() => {
		if (!V(c)) return;
		F(r, Date.now(), !0);
		let e = window.setInterval(() => {
			F(r, Date.now(), !0);
		}, 1e3);
		return () => window.clearInterval(e);
	});
	function l(e) {
		let t = Math.max(0, e), n = Math.floor(t / 3600), r = Math.floor(t % 3600 / 60), i = t % 60, a = (e) => String(e).padStart(2, "0");
		return n > 0 ? `${n}:${a(r)}:${a(i)}` : `${a(r)}:${a(i)}`;
	}
	let u = /* @__PURE__ */ M(() => {
		let e = V(n).turnNumber;
		if (V(i) === "idle") return e > 0 ? `Idle · Turn ${e} completed` : "";
		if (V(i) === "empty" || V(i) === "loading") return "";
		if (Number.isFinite(V(s))) {
			let t = l(Math.floor((V(r) - V(s)) / 1e3));
			return e > 0 ? `Turn ${e} · ${t}` : t;
		}
		return e > 0 ? `Turn ${e}` : "";
	});
	var d = fa(), f = I(d), p = R(I(f), 2), m = I(p, !0);
	O(p);
	var h = R(p, 2), g = I(h, !0);
	O(h);
	var _ = R(h, 2), v = (e) => {
		var t = la(), n = I(t);
		O(t), z(() => G(n, `· ${V(o) ?? ""} queued`)), W(e, t);
	};
	K(_, (e) => {
		V(o) > 0 && e(v);
	}), O(f);
	var y = R(f, 2), b = I(y), x = (e) => {
		var t = ua(), r = I(t, !0);
		O(t), z(() => G(r, V(n).modelSummary)), W(e, t);
	};
	K(b, (e) => {
		V(n).modelSummary && e(x);
	});
	var S = R(b, 2), C = (e) => {
		var t = da(), n = I(t, !0);
		O(t), z(() => G(n, V(u))), W(e, t);
	};
	K(S, (e) => {
		V(u) && e(C);
	}), O(y), O(d), z(() => {
		Y(d, "data-state", V(i)), G(m, V(n).agentName), G(g, V(a));
	}), W(e, d), j();
}
//#endregion
//#region src/components/AgentBindingSelector.svelte
var ma = /* @__PURE__ */ U("<button type=\"button\" class=\"agent-binding-option\" role=\"option\"><span class=\"agent-binding-option-label\"> </span> <!></button>"), ha = /* @__PURE__ */ U("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Profiles\"><div class=\"agent-binding-group-title\">Profiles</div> <!></div>"), ga = /* @__PURE__ */ U("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Agents\"><div class=\"agent-binding-group-title\">Agents</div> <!></div>"), _a = /* @__PURE__ */ U("<div class=\"agent-binding-menu\" role=\"listbox\" tabindex=\"-1\"><!> <!></div>"), va = /* @__PURE__ */ U("<span class=\"agent-binding\"><button type=\"button\" class=\"agent-binding-button\" aria-haspopup=\"listbox\"><span class=\"agent-binding-label\"> </span> <!></button> <!></span>");
function ya(e, t) {
	A(t, !0);
	let n = ki(t, "disabled", 3, !1), r = ki(t, "ariaLabel", 3, "Agent binding"), i = /* @__PURE__ */ M(m), a = /* @__PURE__ */ M(h), o = /* @__PURE__ */ M(() => g(t.value)), s = /* @__PURE__ */ M(() => [...V(i), ...V(a)].find((e) => g(e.value) === V(o))?.label || t.value.name || "Unavailable"), c = /* @__PURE__ */ P(!1), l = /* @__PURE__ */ P(void 0), u = /* @__PURE__ */ P(void 0);
	bn(() => {
		if (!V(c) || !V(u)) return;
		d();
		let e = V(u).querySelector("[aria-selected=\"true\"]") ?? V(u).querySelector(".agent-binding-option");
		ur().then(() => e?.focus());
	}), Ai(() => {
		let e = (e) => {
			V(c) && e.target instanceof Node && !V(l)?.contains(e.target) && F(c, !1);
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
		F(c, !1), g(e.value) !== V(o) && t.onSelect(e.value);
	}
	function v(e) {
		e.key === "Escape" && (e.stopPropagation(), F(c, !1));
	}
	var y = va(), b = I(y), x = I(b), S = I(x, !0);
	O(x), X(R(x, 2), {
		name: "chevrons-up-down",
		className: "agent-binding-icon"
	}), O(b);
	var C = R(b, 2), w = (e) => {
		var t = _a(), n = I(t), s = (e) => {
			var t = ha();
			q(R(I(t), 2), 17, () => V(i), (e) => g(e.value), (e, t) => {
				var n = ma(), r = I(n), i = I(r, !0);
				O(r);
				var a = R(r, 2), s = (e) => {
					X(e, {
						name: "check",
						className: "agent-binding-check"
					});
				}, c = /* @__PURE__ */ M(() => g(V(t).value) === V(o));
				K(a, (e) => {
					V(c) && e(s);
				}), O(n), z((e, r) => {
					Y(n, "aria-selected", e), Y(n, "data-binding", r), G(i, V(t).label);
				}, [() => g(V(t).value) === V(o), () => g(V(t).value)]), H("click", n, () => _(V(t))), W(e, n);
			}), O(t), W(e, t);
		};
		K(n, (e) => {
			V(i).length && e(s);
		});
		var c = R(n, 2), l = (e) => {
			var t = ga();
			q(R(I(t), 2), 17, () => V(a), (e) => g(e.value), (e, t) => {
				var n = ma(), r = I(n), i = I(r, !0);
				O(r);
				var a = R(r, 2), s = (e) => {
					X(e, {
						name: "check",
						className: "agent-binding-check"
					});
				}, c = /* @__PURE__ */ M(() => g(V(t).value) === V(o));
				K(a, (e) => {
					V(c) && e(s);
				}), O(n), z((e, r) => {
					Y(n, "aria-selected", e), Y(n, "data-binding", r), G(i, V(t).label);
				}, [() => g(V(t).value) === V(o), () => g(V(t).value)]), H("click", n, () => _(V(t))), W(e, n);
			}), O(t), W(e, t);
		};
		K(c, (e) => {
			V(a).length && e(l);
		}), O(t), Oi(t, (e) => F(u, e), () => V(u)), z(() => Y(t, "aria-label", r())), H("keydown", t, v), W(e, t);
	};
	K(C, (e) => {
		V(c) && e(w);
	}), O(y), Oi(y, (e) => F(l, e), () => V(l)), z(() => {
		b.disabled = n(), Y(b, "aria-expanded", V(c)), Y(b, "aria-label", r()), G(S, V(s));
	}), H("click", b, () => {
		F(c, !V(c));
	}), W(e, y), j();
}
Cr(["click", "keydown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var ba = /* @__PURE__ */ U("<div class=\"tty-message-item\"><span class=\"tty-message-text\"> </span> <span class=\"tty-message-mode\"> </span> <button type=\"button\" class=\"tty-message-steer\"><!> <span>Insert now</span></button></div>"), xa = /* @__PURE__ */ U("<div class=\"tty-message-queue-error\" role=\"alert\"> </div>"), Sa = /* @__PURE__ */ U("<section class=\"tty-message-queue\" aria-label=\"Waiting messages\"><div class=\"tty-message-queue-header\"><span>Waiting messages</span><span class=\"tty-message-count\"> </span></div> <div class=\"tty-message-list\"></div> <!></section>"), Ca = /* @__PURE__ */ U("<button type=\"button\" id=\"agentEndTurnButton\" title=\"End current turn\" aria-label=\"End current turn\"><span class=\"tty-composer-icon tty-composer-icon-idle\"><!></span><span class=\"tty-composer-icon tty-composer-icon-busy\"><!></span></button>"), wa = /* @__PURE__ */ U("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), Ta = /* @__PURE__ */ U("<!> <form id=\"ttyForm\" class=\"tty-input\"><textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <div class=\"tty-composer-bar\"><button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button> <div class=\"tty-composer-options\"><span class=\"tty-agent-binding\"><!></span> <!> <button type=\"submit\"><span class=\"tty-composer-icon tty-composer-icon-idle\"><!></span><span class=\"tty-composer-icon tty-composer-icon-busy\"><!></span></button></div></div></form> <!>", 1);
function Ea(e, t) {
	A(t, !0);
	let n = t.channel.current(), r = /* @__PURE__ */ P($t(n)), i = /* @__PURE__ */ P($t(n.identity)), a = /* @__PURE__ */ P($t(n.draftResetVersion)), o = /* @__PURE__ */ P($t(n.draft)), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(""), l = /* @__PURE__ */ P(""), u = /* @__PURE__ */ P(!1), d = /* @__PURE__ */ P(void 0), f = /* @__PURE__ */ M(() => !!V(r).unavailableReason || V(s) || V(r).sending);
	Ai(() => t.channel.subscribe((e) => {
		V(r), F(r, e, !0), e.identity === V(i) ? e.draftResetVersion !== V(a) && (F(a, e.draftResetVersion, !0), F(o, e.draft, !0), F(c, "")) : (F(i, e.identity, !0), F(a, e.draftResetVersion, !0), F(o, e.draft, !0), F(s, !1), F(c, ""), F(l, ""), F(u, !1)), queueMicrotask(e.onIconsChanged);
	})), bn(() => {
		V(o), ur().then(v);
	});
	function p() {
		return {
			workspaceId: V(r).workspaceId,
			resourceId: V(r).resourceId,
			draftKey: V(r).draftKey
		};
	}
	function m(e) {
		F(o, e, !0), F(c, ""), V(r).onDraft(e, p());
	}
	async function h(e) {
		e?.preventDefault();
		let t = V(o);
		if (V(f) || !t.trim() || !V(r).workspaceId || !V(r).resourceId) return;
		let n = V(i), a = p();
		F(s, !0), F(c, "");
		try {
			let e = await V(r).onSend(t, a);
			V(i) === n && e.accepted && e.clear && V(o) === t && m("");
		} catch (e) {
			V(i) === n && F(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			V(i) === n && (F(s, !1), await ur(), V(d)?.focus({ preventScroll: !0 }));
		}
	}
	async function g(e) {
		if (!(!V(r).canSteerWaiting || V(r).steeringMessageId)) {
			F(l, "");
			try {
				await V(r).onSteerWaiting(e);
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
			V(u) || (e.preventDefault(), h());
		}
	}
	function v() {
		if (!V(d)) return;
		V(d).style.height = "auto";
		let e = Math.min(V(d).scrollHeight, 160);
		V(d).style.height = `${e}px`, V(d).style.overflowY = V(d).scrollHeight > 160 ? "auto" : "hidden";
	}
	function y(e) {
		V(r).onSaveAgentBinding(e);
	}
	var b = Ta(), x = L(b), S = (e) => {
		var t = Sa(), n = I(t), i = R(I(n)), a = I(i, !0);
		O(i), O(n);
		var o = R(n, 2);
		q(o, 21, () => V(r).waitingMessages, (e) => e.messageId, (e, t) => {
			var n = ba(), i = I(n), a = I(i, !0);
			O(i);
			var o = R(i, 2), s = I(o, !0);
			O(o);
			var c = R(o, 2), l = I(c), u = (e) => {
				X(e, { name: "loader-circle" });
			}, d = (e) => {
				X(e, { name: "corner-up-left" });
			};
			K(l, (e) => {
				V(r).steeringMessageId === V(t).messageId ? e(u) : e(d, -1);
			}), k(2), O(c), O(n), z((e) => {
				Y(n, "data-message-id", V(t).messageId), Y(i, "title", V(t).text), G(a, V(t).text), G(s, V(t).actualMode || V(t).requestedMode), c.disabled = e, Y(c, "title", V(r).canSteerWaiting ? "Insert this waiting message into the current turn" : "Available when the current turn supports steer"), Y(c, "aria-label", `Insert waiting message into current turn: ${V(t).text}`);
			}, [() => !V(r).canSteerWaiting || !!V(r).steeringMessageId]), H("click", c, () => g(V(t).messageId)), W(e, n);
		}), O(o);
		var s = R(o, 2), c = (e) => {
			var t = xa(), n = I(t, !0);
			O(t), z(() => G(n, V(l))), W(e, t);
		};
		K(s, (e) => {
			V(l) && e(c);
		}), O(t), z(() => G(a, V(r).waitingMessages.length)), W(e, t);
	};
	K(x, (e) => {
		V(r).waitingMessages.length && e(S);
	});
	var C = R(x, 2), w = I(C);
	it(w), Oi(w, (e) => F(d, e), () => V(d));
	var T = R(w, 2), E = I(T);
	X(I(E), { name: "plus" }), O(E);
	var ee = R(E, 2), te = I(ee), ne = I(te);
	{
		let e = /* @__PURE__ */ M(() => V(f) || V(r).bindingSaving);
		ya(ne, {
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
			onSelect: y
		});
	}
	O(te);
	var re = R(te, 2), ie = (e) => {
		var t = Ca();
		let n;
		var i = I(t);
		X(I(i), { name: "pause" }), O(i);
		var a = R(i);
		X(I(a), { name: "loader-circle" }), O(a), O(t), z(() => {
			n = J(t, 1, "tty-composer-action tty-end-turn-button", null, n, { busy: V(r).endingTurn }), t.disabled = V(r).endingTurn;
		}), H("click", t, function(...e) {
			V(r).onEndTurn?.apply(this, e);
		}), W(e, t);
	};
	K(re, (e) => {
		V(r).canEndTurn && e(ie);
	});
	var ae = R(re, 2);
	let oe;
	var se = I(ae);
	X(I(se), { name: "send" }), O(se);
	var ce = R(se);
	X(I(ce), { name: "loader-circle" }), O(ce), O(ae), O(ee), O(T), O(C);
	var le = R(C, 2), ue = (e) => {
		var t = wa(), n = I(t), r = I(n, !0);
		O(n);
		var i = R(n);
		O(t), z(() => {
			G(r, V(c)), i.disabled = V(s);
		}), H("click", i, () => h()), W(e, t);
	};
	K(le, (e) => {
		V(c) && e(ue);
	}), z((e) => {
		Y(w, "data-agent-draft-key", V(r).draftKey), Y(w, "placeholder", V(r).unavailableReason || "Message this resource"), w.disabled = V(f), vi(w, V(o)), E.disabled = e, oe = J(ae, 1, "tty-send-button", null, oe, { busy: V(s) }), Y(ae, "title", V(s) ? "Sending..." : V(r).unavailableReason || "Send input"), Y(ae, "aria-label", V(s) ? "Sending..." : V(r).unavailableReason || "Send input"), ae.disabled = V(f);
	}, [() => !!V(r).unavailableReason]), Sr("submit", C, h), H("input", w, (e) => m(e.currentTarget.value)), H("keydown", w, _), H("click", E, function(...e) {
		V(r).onOpenUpload?.apply(this, e);
	}), W(e, b), j();
}
Cr([
	"click",
	"input",
	"keydown"
]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var Da = /* @__PURE__ */ U("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function Oa(e, t) {
	A(t, !0);
	let n = ki(t, "draft", 7);
	var r = Da(), i = I(r);
	it(i);
	var a = R(i, 2);
	_i(a), O(r), z(() => {
		vi(i, n().description), vi(a, n().slug);
	}), H("input", i, (e) => n().description = e.currentTarget.value), H("input", a, (e) => n().slug = e.currentTarget.value), W(e, r), j();
}
Cr(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var ka = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary compact\"> </button>"), Aa = /* @__PURE__ */ U("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), ja = /* @__PURE__ */ U("<p class=\"create-task-preview-hint\">Updating preview...</p>"), Ma = /* @__PURE__ */ U("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), Na = /* @__PURE__ */ U("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Pa = /* @__PURE__ */ U("<small> </small>"), Fa = /* @__PURE__ */ U("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), Ia = /* @__PURE__ */ U("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), La = /* @__PURE__ */ U("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Ra = /* @__PURE__ */ U("<!> <!> <!>", 1), za = /* @__PURE__ */ U("<p class=\"create-task-blank-detail\"> </p>"), Ba = /* @__PURE__ */ U("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), Va = /* @__PURE__ */ U("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), Ha = /* @__PURE__ */ U("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function Ua(e, t) {
	A(t, !0);
	let n = ki(t, "draft", 7), r = /* @__PURE__ */ P($t(n().editedMarkdown ?? "")), i = null, a = /* @__PURE__ */ M(() => !!t.preview && V(r) !== t.preview?.markdown);
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
	var c = Ha(), l = I(c), u = R(I(l), 2), d = (e) => {
		var n = ka(), r = I(n, !0);
		O(n), z(() => {
			n.disabled = t.previewing || t.submitting, G(r, t.previewing ? "Rendering..." : "Refresh");
		}), H("click", n, function(...e) {
			t.onRefresh?.apply(this, e);
		}), W(e, n);
	};
	K(u, (e) => {
		t.selectedTemplate && e(d);
	}), O(l);
	var f = R(l, 2), p = (e) => {
		var i = Ra(), c = L(i), l = (e) => {
			var n = Aa(), r = I(n, !0);
			O(n), z(() => G(r, t.previewError)), W(e, n);
		};
		K(c, (e) => {
			t.previewError && e(l);
		});
		var u = R(c, 2), d = (e) => {
			W(e, ja());
		};
		K(u, (e) => {
			!t.previewError && t.stale && t.preview && e(d);
		});
		var f = R(u, 2), p = (e) => {
			var i = Fa(), c = I(i), l = I(c, !0);
			O(c);
			var u = R(c, 2);
			it(u);
			var d = R(u, 2), f = (e) => {
				var t = Ma(), n = R(I(t), 2);
				O(t), H("click", n, s), W(e, t);
			}, p = (e) => {
				W(e, Na());
			};
			K(d, (e) => {
				V(a) ? e(f) : e(p, -1);
			});
			var m = R(d, 2), h = (e) => {
				var n = Pa(), r = I(n);
				O(n), z(() => G(r, `Slug: ${t.preview.slug ?? ""}`)), W(e, n);
			};
			K(m, (e) => {
				t.preview.slug && e(h);
			});
			var g = R(m, 2), _ = (e) => {
				var r = Pa(), i = I(r);
				O(r), z(() => G(i, `Template ${n().templateName ?? ""} · ${t.templateDigest ?? ""}`)), W(e, r);
			};
			K(g, (e) => {
				t.templateDigest && e(_);
			}), O(i), z(() => {
				G(l, t.preview.title), vi(u, V(r));
			}), H("input", u, (e) => o(e.currentTarget.value)), W(e, i);
		}, m = (e) => {
			W(e, Ia());
		}, h = (e) => {
			W(e, La());
		};
		K(f, (e) => {
			t.preview ? e(p) : t.previewing ? e(m, 1) : t.previewError || e(h, 2);
		}), W(e, i);
	}, m = (e) => {
		var t = Va(), r = I(t), i = I(r, !0);
		O(r);
		var a = R(r, 2), o = (e) => {
			var t = za(), r = I(t, !0);
			O(t), z(() => G(r, n().detail)), W(e, t);
		}, s = /* @__PURE__ */ M(() => n().detail.trim()), c = (e) => {
			W(e, Ba());
		};
		K(a, (e) => {
			V(s) ? e(o) : e(c, -1);
		});
		var l = R(a, 2), u = (e) => {
			var t = Pa(), r = I(t);
			O(t), z((e) => G(r, `Slug: ${e ?? ""}`), [() => n().slug.trim()]), W(e, t);
		}, d = /* @__PURE__ */ M(() => n().slug.trim());
		K(l, (e) => {
			V(d) && e(u);
		}), O(t), z((e) => G(i, e), [() => n().title.trim() || "Untitled task"]), W(e, t);
	};
	K(f, (e) => {
		t.selectedTemplate ? e(p) : e(m, -1);
	}), O(c), W(e, c), j();
}
Cr(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var Wa = /* @__PURE__ */ U("<input type=\"checkbox\"/><span> </span>", 1), Ga = /* @__PURE__ */ U("<span> </span>"), Ka = /* @__PURE__ */ U("<textarea></textarea>"), qa = /* @__PURE__ */ U("<option> </option>"), Ja = /* @__PURE__ */ U("<select><option>Select...</option><!></select>"), Ya = /* @__PURE__ */ U("<input/>"), Xa = /* @__PURE__ */ U("<small> </small>"), Za = /* @__PURE__ */ U("<label><!> <!> <!> <!> <!></label>"), Qa = /* @__PURE__ */ U("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function $a(e, t) {
	A(t, !0);
	function n(e, n) {
		let r = n.currentTarget;
		t.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var r = Qa();
	q(r, 21, () => t.fields, (e) => e.name, (e, r) => {
		var i = Za();
		let a;
		var o = I(i), s = (e) => {
			var i = Wa(), a = L(i);
			_i(a);
			var o = R(a), s = I(o);
			O(o), z(() => {
				yi(a, t.values[V(r).name] === !0), G(s, `${V(r).label ?? ""}${V(r).required ? " *" : ""}`);
			}), H("change", a, (e) => n(V(r), e)), W(e, i);
		}, c = (e) => {
			var t = Ga(), n = I(t);
			O(t), z(() => G(n, `${V(r).label ?? ""}${V(r).required ? " *" : ""}`)), W(e, t);
		};
		K(o, (e) => {
			V(r).type === "boolean" ? e(s) : e(c, -1);
		});
		var l = R(o, 2), u = (e) => {
			var i = Ka();
			it(i), z((e) => {
				i.required = V(r).required, Y(i, "placeholder", V(r).placeholder || ""), vi(i, e);
			}, [() => String(t.values[V(r).name] ?? "")]), H("input", i, (e) => n(V(r), e)), W(e, i);
		};
		K(l, (e) => {
			V(r).type === "textarea" && e(u);
		});
		var d = R(l, 2), f = (e) => {
			var i = Ja(), a = I(i);
			a.value = a.__value = "", q(R(a), 17, () => V(r).options || [], Vr, (e, t) => {
				var n = qa(), r = I(n, !0);
				O(n);
				var i = {};
				z(() => {
					G(r, V(t)), i !== (i = V(t)) && (n.value = (n.__value = V(t)) ?? "");
				}), W(e, n);
			}), O(i);
			var o;
			ui(i), z((e) => {
				i.required = V(r).required, o !== (o = e) && (i.value = (i.__value = e) ?? "", li(i, e));
			}, [() => String(t.values[V(r).name] ?? "")]), H("change", i, (e) => n(V(r), e)), W(e, i);
		};
		K(d, (e) => {
			V(r).type === "select" && e(f);
		});
		var p = R(d, 2), m = (e) => {
			var i = Ya();
			_i(i), z((e) => {
				i.required = V(r).required, Y(i, "placeholder", V(r).placeholder || ""), vi(i, e);
			}, [() => String(t.values[V(r).name] ?? "")]), H("input", i, (e) => n(V(r), e)), W(e, i);
		};
		K(p, (e) => {
			V(r).type === "text" && e(m);
		});
		var h = R(p, 2), g = (e) => {
			var t = Xa(), n = I(t, !0);
			O(t), z(() => G(n, V(r).description)), W(e, t);
		};
		K(h, (e) => {
			V(r).description && e(g);
		}), O(i), z(() => a = J(i, 1, "", null, a, { "template-boolean": V(r).type === "boolean" })), W(e, i);
	}), O(r), z(() => Y(r, "aria-label", t.label)), W(e, r), j();
}
Cr(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var eo = /* @__PURE__ */ U("<small> </small>"), to = /* @__PURE__ */ U("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), no = /* @__PURE__ */ U("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function ro(e, t) {
	A(t, !0);
	function n(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var r = no(), i = R(I(r), 2), a = I(i);
	let o;
	var s = R(I(a), 4);
	X(I(s), { name: "check" }), O(s), O(a), q(R(a, 2), 17, () => t.templates, (e) => e.name, (e, r) => {
		var i = to();
		let a;
		var o = I(i), s = I(o, !0);
		O(o);
		var c = R(o, 2), l = (e) => {
			var t = eo(), n = I(t, !0);
			O(t), z(() => G(n, V(r).description)), W(e, t);
		};
		K(c, (e) => {
			V(r).description && e(l);
		});
		var u = R(c, 2);
		X(I(u), { name: "check" }), O(u), O(i), z((e) => {
			Y(i, "aria-selected", t.selectedName === V(r).name), a = J(i, 1, "template-card", null, a, { selected: t.selectedName === V(r).name }), i.disabled = !V(r).valid || t.disabled, G(s, e);
		}, [() => n(V(r))]), H("click", i, () => t.onSelect(V(r).name)), W(e, i);
	}), O(i), O(r), z(() => {
		Y(a, "aria-selected", t.selectedName === ""), o = J(a, 1, "template-card", null, o, { selected: t.selectedName === "" }), a.disabled = t.disabled;
	}), H("click", a, () => t.onSelect("")), W(e, r), j();
}
Cr(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var io = /* @__PURE__ */ U("<small>(generated by template)</small>"), ao = /* @__PURE__ */ U("<small class=\"create-required\">*</small>"), oo = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), so = /* @__PURE__ */ U("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), co = /* @__PURE__ */ U("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), lo = /* @__PURE__ */ U("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function uo(e, t) {
	A(t, !0);
	let n = ki(t, "draft", 7), r, i = /* @__PURE__ */ M(() => t.model.templates.find((e) => e.name === n().templateName)), a = /* @__PURE__ */ M(() => t.model.preview?.title || ""), o = /* @__PURE__ */ M(() => n().titleOverride ? n().title : V(a)), s = /* @__PURE__ */ M(() => (V(i)?.fields || []).filter((e) => e.required)), c = /* @__PURE__ */ M(() => (V(i)?.fields || []).filter((e) => !e.required)), l = /* @__PURE__ */ M(() => !t.model.preview || t.model.previewKey !== t.model.previewRequestKey(n()));
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
	var v = lo(), y = I(v), b = I(y), x = (e) => {
		ro(e, {
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
	var S = R(b, 2), C = R(I(S), 2), w = I(C), T = I(w), E = R(I(T)), ee = (e) => {
		W(e, io());
	}, te = (e) => {
		W(e, ao());
	};
	K(E, (e) => {
		V(i)?.taskTitle && !n().titleOverride ? e(ee) : e(te, -1);
	}), O(T);
	var ne = R(T, 2), re = I(ne);
	_i(re);
	var ie = R(re, 2), ae = (e) => {
		var t = oo();
		H("click", t, g), W(e, t);
	};
	K(ie, (e) => {
		V(i)?.taskTitle && n().titleOverride && e(ae);
	}), O(ne), O(w);
	var oe = R(w, 2), se = R(I(oe), 2), ce = R(I(se), 2);
	_i(ce), O(se), O(oe), O(C), O(S);
	var le = R(S, 2), ue = (e) => {
		var t = so(), r = R(I(t), 2), i = (e) => {
			$a(e, {
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
			$a(e, {
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
		}), O(t), W(e, t);
	}, de = (e) => {
		var t = co(), r = R(I(t), 2);
		it(r), O(t), z(() => vi(r, n().detail)), H("input", r, (e) => n().detail = e.currentTarget.value), W(e, t);
	};
	K(le, (e) => {
		V(i) ? e(ue) : e(de, -1);
	}), O(y), Ua(R(y, 2), {
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
	}), O(v), z(() => {
		re.required = !V(i)?.taskTitle, vi(re, V(i)?.taskTitle ? V(o) : n().title), Y(re, "placeholder", V(i)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), vi(ce, n().slug);
	}), H("input", re, (e) => h(e.currentTarget.value)), H("input", ce, (e) => {
		n().slug = e.currentTarget.value, f();
	}), W(e, v), j();
}
Cr(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var fo = /* @__PURE__ */ U("<span> </span>"), po = /* @__PURE__ */ U("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function mo(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P($t(s(V(n).draft))), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(void 0), o = /* @__PURE__ */ M(() => V(r).type === "task");
	Ai(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity !== V(i) && (F(i, e.identity, !0), F(r, s(e.draft), !0)), queueMicrotask(e.onIconsChanged);
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
	var l = Mr(), u = L(l), d = (e) => {
		var t = po(), i = I(t), s = R(i, 2);
		let l;
		var u = I(s), d = I(u), f = I(d), p = I(f, !0);
		O(f);
		var m = R(f, 2), h = (e) => {
			var t = fo(), n = I(t, !0);
			O(t), z(() => G(n, V(r).projectId)), W(e, t);
		};
		K(m, (e) => {
			V(o) && e(h);
		}), O(d);
		var g = R(d, 2);
		X(I(g), { name: "x" }), O(g), O(u);
		var _ = R(u, 2), v = I(_);
		Br(v, () => V(n).identity, (e) => {
			var t = Mr(), i = L(t), a = (e) => {
				uo(e, {
					get draft() {
						return V(r);
					},
					get model() {
						return V(n);
					}
				});
			}, s = (e) => {
				Oa(e, { get draft() {
					return V(r);
				} });
			};
			K(i, (e) => {
				V(o) ? e(a) : e(s, -1);
			}), W(e, t);
		});
		var y = R(v, 2), b = I(y), x = I(b, !0);
		O(b);
		var S = R(b, 2);
		O(y), O(_), O(s), Oi(s, (e) => F(a, e), () => V(a)), O(t), z(() => {
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
	}), W(e, l), j();
}
Cr(["click"]);
//#endregion
//#region src/api/client.ts
var ho = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, go = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, _o = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new go(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new go(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new go(e.scope));
		this.active.clear();
	}
}, vo = class {
	requests = new _o();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: bo(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: bo(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof go) ? new go(n) : e;
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
			let n = yo(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new ho(e.status, r, n);
		}
		return t;
	}
};
function yo(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function bo(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
//#endregion
//#region src/components/DiffModal.svelte
var xo = /* @__PURE__ */ U("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), So = /* @__PURE__ */ U("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), Co = /* @__PURE__ */ U("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), wo = /* @__PURE__ */ U("<div class=\"diff-viewer\"></div>"), To = /* @__PURE__ */ U("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function Eo(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(void 0), o = /* @__PURE__ */ M(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	bn(() => {
		let e = t.repo, a = V(o);
		if (F(n, null), F(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		F(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (F(n, r, !0), await ur(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (F(i, n instanceof Error ? n.message : String(n), !0), t.onError(V(i)));
		}).finally(() => {
			t.repo === e && (F(r, !1), queueMicrotask(t.onIconsChanged));
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
	var c = Mr(), l = L(c), u = (e) => {
		var o = To(), s = I(o), c = R(s, 2), l = I(c), u = I(l), d = I(u), f = I(d, !0);
		O(d);
		var p = R(d), m = I(p);
		O(p), O(u);
		var h = R(u);
		X(I(h), { name: "x" }), O(h), O(l);
		var g = R(l, 2), _ = (e) => {
			var n = xo(), r = I(n);
			X(r, { name: "loader-circle" });
			var i = R(r, 2), a = I(i, !0);
			O(i), O(n), z(() => G(a, t.repo.worktreePath || "")), W(e, n);
		}, v = (e) => {
			var t = So(), n = I(t);
			X(n, { name: "triangle-alert" });
			var r = R(n, 2), a = I(r, !0);
			O(r), O(t), z(() => G(a, V(i))), W(e, t);
		}, y = (e) => {
			var t = Co();
			X(I(t), { name: "check-circle-2" }), k(2), O(t), W(e, t);
		}, b = /* @__PURE__ */ M(() => !V(n)?.hasChanges || !V(n).diff?.trim()), x = (e) => {
			var t = wo();
			Oi(t, (e) => F(a, e), () => V(a)), W(e, t);
		};
		K(g, (e) => {
			V(r) ? e(_) : V(i) ? e(v, 1) : V(b) ? e(y, 2) : e(x, -1);
		}), O(c), O(o), z(() => {
			G(f, V(n)?.branch || t.repo.branch || t.repo.name || "Diff"), G(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), H("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), H("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), W(e, o);
	};
	K(l, (e) => {
		t.repo && e(u);
	}), W(e, c), j();
}
Cr(["click"]);
//#endregion
//#region src/components/detail.ts
function Do(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function Oo(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${Mo(e)}</pre>`;
}
function ko(e) {
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
function Ao(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function jo(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...jo(a.children || [], t, n, r + 1));
	return i;
}
function Mo(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/FileBrowser.svelte
var No = /* @__PURE__ */ U("<h3><!><span> </span></h3>"), Po = /* @__PURE__ */ U("<span class=\"artifact-folder-icon\"><!><!></span>"), Fo = /* @__PURE__ */ U("<a class=\"artifact-download\"><!></a>"), Io = /* @__PURE__ */ U("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), Lo = /* @__PURE__ */ U("<div class=\"empty-list-row\"><!><span> </span></div>"), Ro = /* @__PURE__ */ U("<div class=\"content-section\" data-component-owner=\"file-browser\"><!> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function zo(e, t) {
	A(t, !0);
	let n = ki(t, "entries", 19, () => []), r = ki(t, "emptyMessage", 3, "No files."), i = ki(t, "activePath", 3, ""), a = ki(t, "showHeading", 3, !0), o = /* @__PURE__ */ M(() => jo(n(), t.expanded, t.title)), s = /* @__PURE__ */ M(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var l = Ro(), u = I(l), d = (e) => {
		var n = No(), r = I(n);
		X(r, { get name() {
			return V(s);
		} });
		var i = R(r), a = I(i, !0);
		O(i), O(n), z(() => G(a, t.title)), W(e, n);
	};
	K(u, (e) => {
		a() && e(d);
	});
	var f = R(u, 2), p = I(f), m = I(p), h = (e) => {
		var n = Mr();
		q(L(n), 17, () => V(o), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ M(() => V(n).entry.type === "directory"), a = /* @__PURE__ */ M(() => t.expanded.has(`${t.title}:${V(n).entry.path}`));
			var o = Io(), s = I(o);
			let l;
			var u = I(s), d = I(u), f = I(d), p = (e) => {
				X(e, { name: "chevron-right" });
			};
			K(f, (e) => {
				V(r) && e(p);
			}), O(d);
			var m = R(d), h = (e) => {
				var t = Po(), n = I(t);
				X(n, {
					name: "folder",
					className: "artifact-icon artifact-icon-dir"
				}), X(R(n), {
					name: "folder-open",
					className: "artifact-icon artifact-icon-dir"
				}), O(t), W(e, t);
			}, g = (e) => {
				{
					let t = /* @__PURE__ */ M(() => c(V(n).entry.name));
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
			var _ = R(m), v = I(_, !0);
			O(_), O(u);
			var y = R(u, 2), b = I(y), x = (e) => {
				var r = Fo();
				X(I(r), {
					name: "download",
					className: "artifact-download-icon"
				}), O(r), z((e) => {
					Y(r, "href", e), Y(r, "download", V(n).entry.name), Y(r, "title", `Download ${V(n).entry.name}`), Y(r, "aria-label", `Download ${V(n).entry.name}`);
				}, [() => t.rawURL(t.title, V(n).entry.path, !0)]), H("click", r, (e) => e.stopPropagation()), W(e, r);
			};
			K(b, (e) => {
				V(r) || e(x);
			});
			var S = R(b), C = I(S, !0);
			O(S), O(y), O(s), O(o), z((e) => {
				l = J(s, 1, "artifact-row", null, l, {
					directory: V(r),
					file: !V(r),
					active: i() === `${t.title}:${V(n).entry.path}`,
					open: V(r) && V(a)
				}), ci(s, `--depth: ${V(n).depth}`), Y(_, "title", V(n).entry.path), G(v, V(n).entry.name), G(C, e);
			}, [() => V(r) ? `${(V(n).entry.children || []).length} items` : Ao(V(n).entry.size || 0)]), H("click", s, () => V(r) ? t.onToggle(`${t.title}:${V(n).entry.path}`) : t.onPreview(t.title, V(n).entry.path)), W(e, o);
		}), W(e, n);
	}, g = (e) => {
		var n = Lo(), i = I(n);
		{
			let e = /* @__PURE__ */ M(() => t.title === "Artifacts" ? "archive" : "inbox");
			X(i, { get name() {
				return V(e);
			} });
		}
		var a = R(i), o = I(a, !0);
		O(a), O(n), z(() => G(o, r())), W(e, n);
	};
	K(m, (e) => {
		V(o).length ? e(h) : e(g, -1);
	}), O(p), O(f), O(l), W(e, l), j();
}
Cr(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var Bo = /* @__PURE__ */ U("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), Vo = /* @__PURE__ */ U("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), Ho = /* @__PURE__ */ U("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), Uo = /* @__PURE__ */ U("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), Wo = /* @__PURE__ */ U("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Go = /* @__PURE__ */ U("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), Ko = /* @__PURE__ */ U("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function qo(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ M(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ M(() => t.selection ? `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}` : ""), s = /* @__PURE__ */ M(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : ""), c = "";
	bn(() => {
		let e = t.selection, s = V(a), l = V(o);
		if (l === c) return;
		if (c = l, F(n, null), F(i, ""), !e) {
			t.client.requests.abort(s);
			return;
		}
		F(r, !0);
		let u = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${u}?path=${encodeURIComponent(e.path)}`, { scope: s }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && F(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (F(i, n instanceof Error ? n.message : String(n), !0), t.onError(V(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (F(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), ji(() => t.client.requests.abort(V(a)));
	var l = Mr(), u = L(l), d = (e) => {
		var a = Ko(), o = I(a), c = R(o, 2), l = I(c), u = I(l), d = I(u), f = I(d, !0);
		O(d);
		var p = R(d), m = I(p);
		O(p), O(u);
		var h = R(u), g = I(h);
		X(I(g), { name: "external-link" }), k(), O(g);
		var _ = R(g);
		X(I(_), { name: "x" }), O(_), O(h), O(l);
		var v = R(l, 2), y = (e) => {
			var n = Bo(), r = I(n);
			X(r, { name: "loader-circle" });
			var i = R(r, 2), a = I(i, !0);
			O(i), O(n), z(() => G(a, t.selection.path)), W(e, n);
		}, b = (e) => {
			var t = Vo(), n = I(t);
			X(n, { name: "triangle-alert" });
			var r = R(n, 2), a = I(r, !0);
			O(r), O(t), z(() => G(a, V(i))), W(e, t);
		}, x = (e) => {
			var r = Ho(), i = I(r);
			O(r), z(() => {
				Y(i, "src", V(s)), Y(i, "alt", V(n).name || t.selection.path);
			}), W(e, r);
		}, S = (e) => {
			var r = Uo(), i = I(r);
			X(i, { name: "file-warning" });
			var a = R(i), o = I(a, !0);
			O(a);
			var s = R(a), c = I(s);
			O(s), O(r), z((e) => {
				G(o, V(n).name || t.selection.path), G(c, `Binary file, ${e ?? ""}.`);
			}, [() => Ao(V(n).size || 0)]), W(e, r);
		}, C = (e) => {
			var t = Wo();
			Xr(t, () => Oo(V(n)?.content || ""), !0), O(t), W(e, t);
		}, w = /* @__PURE__ */ M(() => Do(V(n)?.path || t.selection.path)), T = (e) => {
			var t = Go(), r = I(t, !0);
			O(t), z(() => G(r, V(n)?.content || "")), W(e, t);
		};
		K(v, (e) => {
			V(r) ? e(y) : V(i) ? e(b, 1) : V(n)?.image ? e(x, 2) : V(n)?.binary ? e(S, 3) : V(w) ? e(C, 4) : e(T, -1);
		}), O(c), O(a), z((e, r) => {
			Y(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${V(n)?.contentHash || "pending"}`), G(f, e), G(m, `${t.selection.path ?? ""}${r ?? ""}${V(n)?.truncated ? " · truncated" : ""}`), Y(g, "href", V(s));
		}, [() => V(n)?.name || t.selection.path.split("/").pop() || "File preview", () => V(n)?.size == null ? "" : ` · ${Ao(V(n).size)}`]), H("click", o, function(...e) {
			t.onClose?.apply(this, e);
		}), H("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), W(e, a);
	};
	K(u, (e) => {
		t.selection && e(d);
	}), W(e, l), j();
}
Cr(["click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var Jo = /* @__PURE__ */ U("<p class=\"approval-question\"> </p>"), Yo = /* @__PURE__ */ U("<p> </p>"), Xo = /* @__PURE__ */ U("<button> </button>"), Zo = /* @__PURE__ */ U("<div class=\"approval-options\"></div>"), Qo = /* @__PURE__ */ U("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), $o = /* @__PURE__ */ U("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), es = /* @__PURE__ */ U("<!> <!>", 1), ts = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function ns(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P($t(a()));
	bn(() => {
		let e = a();
		e !== V(i) && (F(i, e, !0), F(n, ""), F(r, !1));
	});
	function a() {
		return `${t.contextIdentity}:${String(t.item.approvalId || "")}`;
	}
	async function o(e) {
		let i = String(t.item.approvalId || "");
		if (!(!i || V(r))) {
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
	var c = ts(), l = I(c), u = I(l);
	X(u, { name: "shield-question" });
	var d = R(u), f = I(d, !0);
	O(d), O(l);
	var p = R(l, 2), m = (e) => {
		var n = Jo(), r = I(n, !0);
		O(n), z(() => G(r, t.item.question)), W(e, n);
	};
	K(p, (e) => {
		t.item.question && e(m);
	});
	var h = R(p, 2), g = (e) => {
		var n = Yo(), r = I(n, !0);
		O(n), z(() => G(r, t.item.detail)), W(e, n);
	};
	K(h, (e) => {
		t.item.detail && e(g);
	});
	var _ = R(h, 2), v = (e) => {
		var i = es(), a = L(i), c = (e) => {
			var n = Zo();
			q(n, 21, () => t.item.options, (e) => e.optionId, (e, t) => {
				var n = Xo();
				let i;
				var a = I(n, !0);
				O(n), z((e, t) => {
					n.disabled = V(r), i = J(n, 1, "", null, i, e), G(a, t);
				}, [() => ({ "secondary-button": String(V(t).kind || "").startsWith("reject") }), () => s(V(t))]), H("click", n, () => o({ optionId: V(t).optionId })), W(e, n);
			}), O(n), W(e, n);
		}, l = (e) => {
			var t = Qo(), n = I(t);
			X(I(n), { name: "check" }), k(), O(n);
			var i = R(n);
			X(I(i), { name: "x" }), k(), O(i), O(t), z(() => {
				n.disabled = V(r), i.disabled = V(r);
			}), H("click", n, () => o({ decision: "accept" })), H("click", i, () => o({ decision: "decline" })), W(e, t);
		};
		K(a, (e) => {
			t.item.options?.length ? e(c) : e(l, -1);
		});
		var u = R(a, 2), d = (e) => {
			var t = $o(), i = I(t);
			_i(i);
			var a = R(i);
			O(t), z((e) => a.disabled = e, [() => !V(n).trim() || V(r)]), Sr("submit", t, (e) => {
				e.preventDefault(), V(n).trim() && o({ text: V(n).trim() });
			}), Ci(i, () => V(n), (e) => F(n, e)), W(e, t);
		};
		K(u, (e) => {
			t.item.question && e(d);
		}), W(e, i);
	}, y = (e) => {
		var n = Yo(), r = I(n);
		O(n), z(() => G(r, `${(t.item.decision || (t.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${t.item.reply ? `: ${t.item.reply}` : ""}`)), W(e, n);
	};
	K(_, (e) => {
		t.item.status === "pending" ? e(v) : e(y, -1);
	}), O(c), z(() => G(f, t.item.title || "Approval requested")), W(e, c), j();
}
Cr(["click"]);
//#endregion
//#region vendor/agenthub-event-timeline/index.mjs
var rs = 400, is = 12e3;
function as(e, t = rs) {
	let n = String(e ?? "");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function os(e) {
	if (e == null) return "";
	try {
		return as(JSON.stringify(e));
	} catch {
		return "";
	}
}
function ss(e) {
	let t = String(e || "").replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function cs(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string").join(" ") : typeof e == "string" ? e : "";
}
function Z(...e) {
	for (let t of e) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
var ls = /* @__PURE__ */ new Set([
	"user",
	"system",
	"agent",
	"assistant"
]);
function us(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return;
	let t = {};
	for (let n of [
		"id",
		"name",
		"sessionId"
	]) typeof e[n] == "string" && e[n].trim() && (t[n] = e[n].trim());
	return Object.keys(t).length ? t : void 0;
}
function ds(e) {
	let t = typeof e == "string" ? e.trim().toLowerCase() : "";
	return ls.has(t) ? t : "user";
}
function fs(e) {
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
function ps(e) {
	if (!Array.isArray(e)) return "";
	let t = [];
	for (let n of e) typeof n?.text == "string" ? t.push(n.text) : typeof n?.content?.text == "string" ? t.push(n.content.text) : n?.type === "diff" && typeof n?.path == "string" && t.push(`Edit ${n.path}`);
	return t.filter(Boolean).join("\n");
}
function ms(e) {
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
		let a = Z(e.id, r.itemId), o = ss(t) || "Tool", s = "", c = "", l = "";
		t === "commandExecution" ? (o = "Command", s = cs(e.command) || Z(e.cmd), c = Z(e.aggregatedOutput, e.output), typeof e.exitCode == "number" && e.exitCode !== 0 && (l = `Exit code ${e.exitCode}`)) : t === "fileChange" ? (o = "File change", s = (Array.isArray(e.changes) ? e.changes.map((e) => e?.path).filter(Boolean) : []).join(", ")) : t === "mcpToolCall" ? (o = "MCP", s = [e.server, e.tool].filter((e) => typeof e == "string" && e).join(" / "), c = typeof e.result == "string" ? e.result : os(e.result), l = Z(e.error?.message, typeof e.error == "string" ? e.error : "")) : t === "webSearch" ? (o = "Web search", s = Z(e.query)) : (s = Z(e.title, e.name, cs(e.command), e.path), c = Z(e.output, e.aggregatedOutput));
		let u = fs(e.status);
		return n === "item/started" && (u = "running"), n === "item/completed" && u === "running" && (u = "completed"), l && u === "completed" && (u = "failed"), {
			callId: a,
			method: n,
			time: i,
			name: o,
			status: u,
			error: l,
			summary: as(s.replace(/\s+/g, " ").trim(), 120),
			output: as(c, is)
		};
	}
	let a = r.update && typeof r.update == "object" ? r.update : r, o = Z(a.sessionUpdate);
	if (o === "tool_call" || o === "tool_call_update") {
		let e = Z(a.toolCallId, a.id), t = a.rawInput && typeof a.rawInput == "object" ? a.rawInput : {}, r = Z(a.title, cs(t.command), t.path, t.filePath, ss(a.kind));
		return {
			callId: e,
			method: n,
			time: i,
			name: ss(a.kind) || "Tool",
			status: fs(a.status || (o === "tool_call" ? "in_progress" : "")),
			summary: as(r.replace(/\s+/g, " ").trim(), 120),
			output: as(ps(a.content), is),
			error: ""
		};
	}
	if (n === "tool_execution_start" || n === "tool_execution_end") {
		let e = Z(r.toolName, r.name, r.tool), t = r.args && typeof r.args == "object" ? r.args : {}, a = Z(cs(t.command), t.path, t.filePath, ""), o = r.isError === !0 || !!Z(r.error);
		return {
			callId: Z(r.toolCallId, r.callId, e),
			method: n,
			time: i,
			name: ss(e) || "Tool",
			status: n === "tool_execution_start" ? "running" : o ? "failed" : "completed",
			summary: as(a.replace(/\s+/g, " ").trim(), 120),
			output: as(Z(typeof r.result == "string" ? r.result : "", ps(r.result?.content)), is),
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
function hs(e) {
	let t = e?.data ?? {}, n = Z(t.method), r = t.params && typeof t.params == "object" ? t.params : {}, i = Array.isArray(r.options) ? r.options.map((e) => ({
		optionId: Z(e?.optionId),
		name: Z(e?.name),
		kind: Z(e?.kind)
	})).filter((e) => e.optionId) : [], a = cs(r.command) || cs(r?.rawInput?.command);
	if (a) return {
		title: "Run command",
		detail: as(a, 160),
		question: "",
		options: i
	};
	let o = Array.isArray(r.changes) ? r.changes.map((e) => e?.path).filter(Boolean) : [];
	if (r.toolCall && typeof r.toolCall == "object") {
		let e = Z(r.toolCall.title, r.toolCall.kind && ss(r.toolCall.kind)), t = ps(r.toolCall.content);
		return {
			title: e || "Permission requested",
			detail: "",
			question: t,
			options: i
		};
	}
	return o.length ? {
		title: "Apply file changes",
		detail: as(o.join(", "), 160),
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
var gs = {
	accept: "Allowed",
	acceptForSession: "Allowed for this session",
	decline: "Declined",
	cancel: "Cancelled"
}, _s = {
	failed: "Session failed",
	stopping: "Stopping provider",
	stopped: "Session stopped",
	archived: "Session archived"
}, vs = {
	requested: "requested",
	completed: "provider completed",
	provider_error: "provider error",
	startup_error: "startup error",
	daemon_recovery: "daemon recovery"
};
function ys(e) {
	return e === "message.delivery" || e === "provider.event" || e === "provider.metadata" || e === "plan.event" || e === "provider.stderr" || e === "provider.turn.started" || e === "provider.turn.completed" || e.startsWith("provider.process.");
}
function bs(e, t) {
	let n = { ...e };
	return t.name && (n.name = t.name), t.summary && (n.summary = t.summary), t.status && (n.status = t.status), t.error && (n.error = t.error), t.deltaOnly ? n.output = as((n.output || "") + (t.output || ""), is) : t.output && (n.output = t.output), n.time = t.time || e.time, n.key = e.key, n;
}
function xs(e, t) {
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
		rawPreview: os(t?.data?.raw)
	};
}
function Ss(e) {
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
					role: ds(o.role),
					key: a.id,
					time: s,
					steer: o.steer === !0,
					text: typeof o.text == "string" ? o.text : ""
				};
				a.turnId && (e.turnId = a.turnId);
				let n = us(o.sender);
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
				let e = ms(a);
				if (!e) break;
				let n = t.at(-1), i = n?.kind === "tools" ? n : null, o = e.callId ? r.get(e.callId) : null;
				if (o) Object.assign(o.call, bs(o.call, e)), o.group.time = s, o.call.status !== "running" && r.delete(e.callId);
				else {
					if (e.deltaOnly) break;
					let n = i || {
						kind: "tools",
						key: a.id,
						calls: [],
						time: s
					}, o = xs(e, a);
					n.calls.push(o), n.time = s, i || t.push(n), o.callId && o.status === "running" && r.set(o.callId, {
						call: o,
						group: n
					});
				}
				break;
			}
			case "approval.requested": {
				let { title: e, detail: r, question: i, options: c } = hs(a), l = {
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
				let e = Z(o.approvalId), r = Z(o.decision) || "decline", i = Z(o.optionId), c = Z(o.text), l = e ? n.get(e) : null, u = (e) => r === "text" ? "Replied" : i ? `Answered: ${e?.options?.find((e) => e.optionId === i)?.name || i}` : gs[r] || ss(r), d = r === "accept" || r === "acceptForSession" || r === "text";
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
				let e = _s[o.state];
				o.state === "failed" ? i("failed", s) : o.state === "stopped" && i(o.reason === "completed" ? "completed" : "failed", s), o.state === "stopped" && vs[o.reason] && (e += ` · ${vs[o.reason]}`);
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
				if (ys(e)) break;
				t.push({
					kind: "unknown",
					key: a.id,
					time: s,
					type: e || "unknown",
					preview: os(o)
				});
		}
	}
	let a = t.at(-1);
	return a?.kind === "thinking" && (a.active = !0), t;
}
//#endregion
//#region src/components/timeline-events.ts
var Cs = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment",
	"turn.started",
	"turn.completed"
]), ws = /* @__PURE__ */ new Set([
	...Cs,
	"Session created",
	"Turn started",
	"Turn completed"
]);
function Ts(e, t) {
	let n = new Set(e.filter((e) => Cs.has(e.type)).map((e) => String(e.id)));
	return t.filter((e) => e.key === void 0 || !n.has(String(e.key)));
}
function Es(e) {
	let t = e || [], n = Ts(t, Ss(t)), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function Ds(e) {
	let t = String(e || "");
	return ws.has(t) || t === "Agent connected" || t.startsWith("Agent connected ·");
}
function Os(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? Is(r, n) : Ls(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function ks(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) As(n, e);
	return n;
}
function As(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, Ls(t));
		return;
	}
	e[a] = Is(e[a], t);
}
function js(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = Ms(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? Ns(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function Ms(e) {
	if (e.type !== "tool.event") return "";
	let t = Ps(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? Ps(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? Fs(n.toolCallId) || Fs(n.id) : "";
}
function Ns(e, t) {
	let n = e.data || {}, r = t.data || {}, i = Ps(n.raw), a = Ps(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? Ps(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? Ps(a.update) : a;
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
function Ps(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Fs(e) {
	return typeof e == "string" ? e.trim() : "";
}
function Is(e, t) {
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
function Ls(e) {
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
var Rs = 20, zs = 250, Bs = 80, Vs = /* @__PURE__ */ new Set([
	"session.created",
	"session.provider",
	"session.launch-environment"
]), Hs = class {
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
		this.api = e.api ?? new vo(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? Bs), this.realtime = e.realtime !== !1;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t, n) {
		if (this.disposed) return;
		let r = Gs(e, t), i = this.activeKey !== r;
		if (this.activeKey && i && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !r) {
			this.emit();
			return;
		}
		let a = this.contexts.get(r) ?? this.createContext(e, t), o = String(n?.generation?.generationId || ""), s = !!(a.generationId && o && a.generationId !== o);
		a.status = n, a.generationId = o, s ? (this.closeStream(a), a.loaded = !1, a.nextCursor = "", a.hasMoreBefore = !1, this.loadInitial(a)) : !a.loaded && !a.loading ? this.loadInitial(a) : this.realtime && this.connect(a), (i || s) && this.emit();
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.nextCursor) return !1;
		let t = e.requestGeneration, n = e.nextCursor;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest(Xs(e, n), { scope: Js(e, "older") });
			return this.isCurrent(e, t) ? (this.mergePage(e, r), r.segments.some((e) => e.turns?.length || e.gap)) : !1;
		} catch (n) {
			return n instanceof go || !this.isCurrent(e, t) || (e.error = oc(n)), !1;
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
			let r = await this.api.latest(Zs(t, e), { scope: Js(t, `turn:${e}`) });
			if (!this.isCurrent(t, n)) return;
			if (t.details.set(e, r), !r.turn.closed && r.turn.generation.generationId === t.generationId) {
				let i = await this.loadTurnRange(t, r, n);
				if (!this.isCurrent(t, n)) return;
				t.liveEvents.set(e, i);
			}
			this.realtime && this.connect(t);
		} catch (r) {
			if (r instanceof go || !this.isCurrent(t, n)) return;
			t.detailErrors.set(e, oc(r));
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
		this.isCurrent(r, o) && (r.liveEvents.set(i, js(Os([...r.liveEvents.get(i) || [], ...s]))), this.emit());
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
		} : sc();
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
			key: Gs(e, t),
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
			let n = await this.api.latest(Xs(e), { scope: Js(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			e.segments.clear(), e.details.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), this.mergePage(e, n), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof go || !this.isCurrent(e, t)) return;
			e.error = oc(n);
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
			n && (e.liveEvents.set(t.reference, js(Os([...e.liveEvents.get(t.reference) || [], ...n]))), e.orphanEvents.delete(t.turnId));
		}
		e.nextCursor = String(t.page?.nextCursor || ""), e.hasMoreBefore = !!(t.page?.hasMore && e.nextCursor);
	}
	blocks(e) {
		let t = [], n = [...e.segments.values()].sort((e, t) => e.generation.generation - t.generation.generation), r = n.find((t) => t.generation.generationId === e.generationId)?.generation || $s(e), i = r ? this.orphanEventBlocks(e, r) : [];
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
					items: i && !a ? Us(i, r.generation.generationId) : void 0,
					events: a?.filter((e) => !Vs.has(e.type)),
					loading: e.detailLoading.has(t.reference),
					error: e.detailErrors.get(t.reference)
				});
			}
			r.generation.generationId === e.generationId && n.push(...i), n.sort((e, t) => qs(e) - qs(t)), t.push(...n);
		}
		return i.length && !n.some((t) => t.generation.generationId === e.generationId) && t.push(...i), t;
	}
	orphanEventBlocks(e, t) {
		let n = [];
		for (let [r, i] of e.orphanEvents) {
			let a = i.filter((e) => !Vs.has(e.type)), o = [];
			for (let i of a) o.length && Number(i.id) !== Number(o[o.length - 1].id) + 1 && (n.push(Ks(e, r, t, o)), o = []), o.push(i);
			o.length && n.push(Ks(e, r, t, o));
		}
		return n.sort((e, t) => qs(e) - qs(t));
	}
	connect(e) {
		if (!this.realtime || !this.isActive(e) || e.stream || !e.generationId || !nc(e.status)) return;
		let t = Qs(e), n = new URLSearchParams({ generationId: e.generationId });
		t && n.set("after", String(t));
		let r = ++e.streamGeneration, i = this.eventSourceFactory(`${Ys(e)}/stream?${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.resourceId, n), this.scheduleEventFlush(e), rc(n) && this.materializeTerminalTurn(e, String(n.turnId || ""), r);
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
			i.readyState === 2 && (e.stream = null, e.streamGeneration++);
		};
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
				limit: String(zs)
			}), l = await this.api.latest(`${Ys(e)}/events?${c}`, { scope: Js(e, a) });
			if (!this.isCurrent(e, i)) return [];
			let u = ec(l.events).filter((t) => this.eventBelongsToContext(e, t));
			s = Os([...s, ...u]);
			let d = Number(l.page?.nextAfter) || tc(u);
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
					let i = await this.api.latest(Xs(e), { scope: Js(e, `terminal-head:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.mergePage(e, i);
					let a = this.findTurnById(e, r, t);
					if (!a?.closed) throw Error("Turn projection is not closed yet");
					let o = await this.api.latest(Zs(e, a.reference), { scope: Js(e, `terminal:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.flushEvents(e, !1), e.details.set(a.reference, o), e.liveEvents.delete(a.reference), this.emit();
					return;
				} catch (t) {
					if (t instanceof go || !e.stream || !this.isActiveStream(e, e.stream, n)) return;
					if (i === 2) {
						e.error = oc(t), this.emit();
						return;
					}
					await ic(50 * (i + 1));
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
			let n = await this.api.latest(Xs(e), { scope: Js(e, "stream-head") });
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
		e.notices.some((e) => ac(e) === ac(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
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
			if (n) e.liveEvents.set(n, js(ks(e.liveEvents.get(n) || [], [t])));
			else {
				let n = String(t.turnId || "current");
				e.orphanEvents.set(n, js(ks(e.orphanEvents.get(n) || [], [t]))), rc(t) || this.refreshHead(e);
			}
		}
		t && this.isActive(e) && this.emit();
	}
	closeStream(e) {
		e.streamGeneration++, e.stream?.close(), e.stream = null;
	}
	deactivate(e) {
		e && (e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.requestGeneration++, this.closeStream(e), e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(Js(e, "initial")), this.api.requests.abort(Js(e, "older")));
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
function Us(e, t) {
	return (e.items || []).flatMap((e) => Ws(e, t));
}
function Ws(e, t) {
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
		case "lifecycle": return e.text && !Ds(e.text) ? [{
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
function Gs(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function Ks(e, t, n, r) {
	let i = r[0]?.id ?? 0;
	return {
		kind: "turn",
		key: `${e.generationId}:${t || "current"}:${i}`,
		generation: n,
		events: r
	};
}
function qs(e) {
	if (e.turn) return Number(e.turn.startEventId) || 0;
	let t = e.events?.[0];
	return t && Number(t.id) || 0;
}
function Js(e, t) {
	return `resource-chat:${e.key}:${t}`;
}
function Ys(e) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/resources/${encodeURIComponent(e.resourceId)}`;
}
function Xs(e, t = "") {
	let n = new URLSearchParams({ limit: String(Rs) });
	return t && n.set("cursor", t), `${Ys(e)}/history/turns?${n}`;
}
function Zs(e, t) {
	return `${Ys(e)}/history/turns/${encodeURIComponent(t)}`;
}
function Qs(e) {
	let t = [...e.segments.values()].filter((t) => t.generation.generationId === e.generationId).flatMap((e) => e.turns || []), n = [...e.liveEvents.values()].flat();
	return Math.max(0, ...t.map((e) => Number(e.lastEventId) || 0), ...n.map((e) => Number(e.id) || 0));
}
function $s(e) {
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
function ec(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function tc(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function nc(e) {
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
function rc(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function ic(e) {
	return new Promise((t) => setTimeout(t, e));
}
function ac(e) {
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
function oc(e) {
	return e instanceof Error ? e.message : String(e);
}
function sc() {
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
var cc = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function lc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => t.item.tone === "ok" ? "check-circle" : t.item.tone === "danger" ? "triangle-alert" : t.item.tone === "info" ? "info" : "clock");
	function r() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var i = cc(), a = I(i);
	X(a, { get name() {
		return V(n);
	} });
	var o = R(a), s = I(o, !0);
	O(o);
	var c = R(o), l = I(c, !0);
	O(c), O(i), z((e) => {
		J(i, 1, `agent-system-note agent-lifecycle-${t.item.tone || "muted"}`), G(s, t.item.text || ""), G(l, e);
	}, [() => r()]), W(e, i), j();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var uc = /* @__PURE__ */ U("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function dc(e, t) {
	A(t, !0);
	let n = ki(t, "onExpand", 3, () => {}), r = /* @__PURE__ */ P($t(!!t.item.active)), i = !!t.item.active;
	bn(() => {
		let e = !!t.item.active;
		e !== i && (i = e, F(r, e, !0));
	});
	function a() {
		if (t.item.active) return "Thinking…";
		if (!t.item.startTime || !t.item.time) return "Thought";
		let e = Math.round((new Date(t.item.time).getTime() - new Date(t.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var o = uc(), s = I(o), c = I(s);
	X(c, { name: "brain-circuit" });
	var l = R(c), u = I(l, !0);
	O(l);
	var d = R(l);
	X(I(d), { name: "chevron-right" }), O(d), O(s);
	var f = R(s, 2), p = I(f, !0);
	O(f), O(o), z((e) => {
		o.open = V(r), G(u, e), G(p, t.item.text || "");
	}, [() => a()]), Sr("toggle", o, (e) => {
		F(r, e.currentTarget.open, !0), e.currentTarget.open && n()();
	}), W(e, o), j();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var fc = /* @__PURE__ */ U("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), pc = /* @__PURE__ */ U("<span class=\"agent-message-tag\">steer</span>"), mc = /* @__PURE__ */ U("<span class=\"agent-message-source\"> </span>"), hc = /* @__PURE__ */ U("<div class=\"agent-message-content markdown-rendered\"></div>"), gc = /* @__PURE__ */ U("<p> </p>"), _c = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function vc(e, t) {
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
	var s = _c(), c = I(s), l = I(c), u = I(l), d = I(u, !0);
	O(u);
	var f = R(u, 2), p = (e) => {
		var t = fc(), r = I(t, !0);
		O(t), z(() => G(r, V(n))), W(e, t);
	};
	K(f, (e) => {
		V(n) !== "assistant" && e(p);
	});
	var m = R(f, 2), h = (e) => {
		W(e, pc());
	};
	K(m, (e) => {
		t.item.steer && e(h);
	});
	var g = R(m, 2), _ = (e) => {
		var n = mc(), r = I(n);
		O(n), z(() => {
			Y(n, "title", t.item.sender.sessionId), G(r, `from session ${t.item.sender.sessionId ?? ""}`);
		}), W(e, n);
	};
	K(g, (e) => {
		V(n) === "agent" && t.item.sender?.sessionId && e(_);
	});
	var v = R(g, 2), y = I(v, !0);
	O(v), O(l);
	var b = R(l, 2), x = I(b), S = (e) => {
		var t = hc();
		Xr(t, a, !0), O(t), W(e, t);
	}, C = (e) => {
		var n = gc(), r = I(n, !0);
		O(n), z(() => G(r, t.item.text || "")), W(e, n);
	};
	K(x, (e) => {
		V(n) === "assistant" || V(n) === "agent" ? e(S) : e(C, -1);
	}), O(b), O(c), O(s), z((e, t) => {
		J(s, 1, `agent-message-row ${V(n) === "assistant" ? "assistant final" : V(n)}`), G(d, e), G(y, t);
	}, [() => r(), () => i()]), W(e, s), j();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var yc = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function bc(e, t) {
	let n = ki(t, "error", 3, !1), r = ki(t, "alert", 3, !1);
	var i = yc();
	let a;
	var o = I(i), s = I(o);
	{
		let e = /* @__PURE__ */ M(() => n() ? "triangle-alert" : "info");
		X(s, { get name() {
			return V(e);
		} });
	}
	var c = R(s), l = I(c, !0);
	O(c), O(o);
	var u = R(o, 2), d = I(u, !0);
	O(u), O(i), z(() => {
		a = J(i, 1, "timeline-notice", null, a, { "timeline-notice-error": n() }), Y(i, "role", r() ? "alert" : void 0), G(l, t.title), G(d, t.text);
	}), W(e, i);
}
//#endregion
//#region src/components/ToolItem.svelte
var xc = /* @__PURE__ */ U("<pre> </pre>"), Sc = /* @__PURE__ */ U("<details data-component-owner=\"event-timeline\"><summary><span class=\"tool-status-icon tool-status-icon-running\"><!></span><span class=\"tool-status-icon tool-status-icon-failed\"><!></span><span class=\"tool-status-icon tool-status-icon-completed\"><!></span><span> </span><small> </small></summary> <!></details>");
function Cc(e, t) {
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
	var i = Sc(), a = I(i), o = I(a);
	X(I(o), { name: "loader-circle" }), O(o);
	var s = R(o);
	X(I(s), { name: "x-circle" }), O(s);
	var c = R(s);
	X(I(c), { name: "check-circle" }), O(c);
	var l = R(c), u = I(l, !0);
	O(l);
	var d = R(l), f = I(d, !0);
	O(d), O(a);
	var p = R(a, 2), m = (e) => {
		var t = xc(), n = I(t, !0);
		O(t), z((e) => G(n, e), [() => r()]), W(e, t);
	}, h = /* @__PURE__ */ M(() => r());
	K(p, (e) => {
		V(h) && e(m);
	}), O(i), z((e, t, n) => {
		J(i, 1, e), G(u, t), G(f, n);
	}, [
		() => `agent-tool-item agent-tool-${String(t.call.status || "completed")}`,
		() => n(),
		() => String(t.call.method || "tool")
	]), W(e, i), j();
}
//#endregion
//#region src/components/ToolGroup.svelte
var wc = /* @__PURE__ */ U("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function Tc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => t.item.calls || []), r = /* @__PURE__ */ M(() => V(n).map(i));
	function i(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var a = wc(), o = I(a), s = I(o);
	X(I(s), { name: "wrench" }), O(s);
	var c = R(s), l = I(c);
	O(c);
	var u = R(c), d = I(u);
	O(u);
	var f = R(u);
	X(I(f), { name: "chevron-right" }), O(f), O(o);
	var p = R(o, 2);
	q(p, 21, () => V(n), (e) => String(e.callId || e.key), (e, t) => {
		Cc(e, { get call() {
			return V(t);
		} });
	}), O(p), O(a), z((e, i) => {
		Y(a, "data-tool-group-key", e), a.open = t.open, G(l, `${V(n).length ?? ""} tool ${V(n).length === 1 ? "call" : "calls"}`), G(d, `${i ?? ""}${V(r).length > 2 ? ` · +${V(r).length - 2} more` : ""}`);
	}, [() => `${t.generationId}:${String(t.item.key || t.item.time || "tools")}`, () => V(r).slice(0, 2).join(" · ")]), Sr("toggle", a, (e) => t.onToggle(e.currentTarget.open)), W(e, a), j();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var Ec = /* @__PURE__ */ U("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function Dc(e, t) {
	A(t, !0);
	var n = Ec(), r = I(n), i = I(r);
	X(i, { name: "info" });
	var a = R(i), o = I(a);
	O(a), O(r);
	var s = R(r), c = I(s, !0);
	O(s), O(n), z(() => {
		G(o, `Unhandled event: ${(t.item.type || t.item.kind) ?? ""}`), G(c, t.item.preview || "This event carries no payload.");
	}), W(e, n), j();
}
//#endregion
//#region src/components/HistoryTimeline.svelte
var Oc = /* @__PURE__ */ U("<div class=\"history-state\"><!><span>Loading resource History...</span></div>"), kc = /* @__PURE__ */ U("<div class=\"history-state history-error\"><!><strong>History unavailable</strong><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), Ac = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary-button history-load-older\"><!> </button>"), jc = /* @__PURE__ */ U("<div class=\"history-legacy\"><!><span><strong>Legacy history</strong><small>Conversation history from before resource History was available was migrated to Artifacts.</small></span><button type=\"button\" class=\"secondary-button\">Open legacy history</button></div>"), Mc = /* @__PURE__ */ U("<div class=\"history-state\"><!><span>No resource History yet.</span></div>"), Nc = /* @__PURE__ */ U("<div class=\"history-generation\"><div><span> </span><strong> </strong></div> <div class=\"history-generation-meta\"><span> </span><span> </span><span> </span></div></div>"), Pc = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary-button\">Retry</button>"), Fc = /* @__PURE__ */ U("<div class=\"history-gap\"><!><span><strong>History gap</strong><small> </small></span><!></div>"), Ic = /* @__PURE__ */ U("<div class=\"history-detail-state\"><!>Loading Turn detail...</div>"), Lc = /* @__PURE__ */ U("<div class=\"history-detail-state history-error\"><!> </div>"), Rc = /* @__PURE__ */ U("<div class=\"history-item\"><!></div>"), zc = /* @__PURE__ */ U("<div class=\"history-items\"></div>"), Bc = /* @__PURE__ */ U("<section><button type=\"button\" class=\"history-turn-header\"><span class=\"history-turn-title\"><strong>Turn</strong><small> </small></span> <span class=\"history-turn-preview\"> </span> <span class=\"history-turn-count\"> <!></span></button> <!> <!> <!></section>"), Vc = /* @__PURE__ */ U("<!> <!>", 1), Hc = /* @__PURE__ */ U("<!> <!> <!> <!>", 1), Uc = /* @__PURE__ */ U("<div data-component-owner=\"history-timeline\" class=\"history-timeline-root\"><!></div>");
function Wc(e, t) {
	A(t, !0);
	let n = ki(t, "artifacts", 19, () => []), r = /* @__PURE__ */ P($t(c())), i, a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P($t(/* @__PURE__ */ new Map())), s = /* @__PURE__ */ M(() => l(n(), "legacy-log.md"));
	Ai(() => {
		i = new Hs({ realtime: !1 });
		let e = i.subscribe((e) => {
			F(r, e, !0), queueMicrotask(t.onIconsChanged);
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
		return e.events ? Es(e.events) : e.items || [];
	}
	function g(e) {
		return `${e.generationId || V(r).generationId}:${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
	}
	function _(e) {
		return V(o).get(g(e)) ?? !1;
	}
	function v(e, t) {
		F(o, new Map(V(o)).set(g(e), t), !0), t && y(e);
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
	var S = Uc(), C = I(S), w = (e) => {
		var t = Oc();
		X(I(t), {
			name: "loader-circle",
			className: "spin"
		}), k(), O(t), W(e, t);
	}, T = (e) => {
		var t = kc(), n = I(t);
		X(n, { name: "triangle-alert" });
		var a = R(n, 2), o = I(a, !0);
		O(a);
		var s = R(a);
		O(t), z(() => G(o, V(r).error)), H("click", s, () => i?.retryHistory()), W(e, t);
	}, E = (e) => {
		var n = Hc(), o = L(n), c = (e) => {
			var t = Ac(), n = I(t);
			X(n, { name: "chevrons-up" });
			var a = R(n, 1, !0);
			O(t), z(() => {
				t.disabled = V(r).loadingOlder, G(a, V(r).loadingOlder ? "Loading older History..." : "Load older History");
			}), H("click", t, () => i?.loadOlder()), W(e, t);
		};
		K(o, (e) => {
			V(r).hasMoreBefore && e(c);
		});
		var l = R(o, 2), S = (e) => {
			bc(e, {
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
			var n = jc(), r = I(n);
			X(r, { name: "archive-restore" });
			var i = R(r, 2);
			O(n), H("click", i, () => t.onOpenLegacy(V(s))), W(e, n);
		}, T = (e) => {
			var t = Mc();
			X(I(t), { name: "history" }), k(), O(t), W(e, t);
		};
		K(C, (e) => {
			V(r).loaded && !V(r).blocks.length && V(s) ? e(w) : V(r).loaded && !V(r).blocks.length && e(T, 1);
		}), q(R(C, 2), 19, () => V(r).blocks, (e) => e.key, (e, t, n) => {
			var o = Vc(), s = L(o), c = (e) => {
				var n = Nc(), r = I(n), i = I(r), a = I(i);
				O(i);
				var o = R(i), s = I(o, !0);
				O(o), O(r);
				var c = R(r, 2), l = I(c), u = I(l);
				O(l);
				var d = R(l), p = I(d);
				O(d);
				var m = R(d), h = I(m);
				O(m), O(c), O(n), z((e, r, i) => {
					Y(n, "data-generation-id", V(t).generation.generationId), G(a, `Generation ${V(t).generation.generation ?? ""}`), G(s, e), G(u, `Provider: ${r ?? ""}`), G(p, `Model: ${i ?? ""}`), G(h, `Status: ${(V(t).generation.status || "unknown") ?? ""}`);
				}, [
					() => f(V(t).generation.agentName, "agent"),
					() => f(V(t).generation.provider || V(t).generation.providerId, "provider"),
					() => f(V(t).generation.model, "model")
				]), W(e, n);
			};
			K(s, (e) => {
				(V(n) === 0 || V(r).blocks[V(n) - 1].generation.generationId !== V(t).generation.generationId) && e(c);
			});
			var l = R(s, 2), S = (e) => {
				var n = Fc(), r = I(n);
				X(r, { name: "triangle-alert" });
				var a = R(r), o = R(I(a)), s = I(o, !0);
				O(o), O(a);
				var c = R(a), l = (e) => {
					var t = Pc();
					H("click", t, () => i?.retryHistory()), W(e, t);
				};
				K(c, (e) => {
					V(t).gap?.retryable && e(l);
				}), O(n), z(() => {
					Y(n, "data-timeline-key", V(t).key), G(s, V(t).gap?.message || "This generation could not be read.");
				}), W(e, n);
			}, C = (e) => {
				var n = Bc();
				let i;
				var o = I(n), s = I(o), c = R(I(s)), l = I(c);
				O(c), O(s);
				var f = R(s, 2), S = I(f, !0);
				O(f);
				var C = R(f, 2), w = I(C), T = R(w);
				{
					let e = /* @__PURE__ */ M(() => m(V(t)) ? "chevron-up" : "chevron-down");
					X(T, { get name() {
						return V(e);
					} });
				}
				O(C), O(o);
				var E = R(o, 2), ee = (e) => {
					var t = Ic();
					X(I(t), {
						name: "loader-circle",
						className: "spin"
					}), k(), O(t), W(e, t);
				};
				K(E, (e) => {
					V(t).loading && e(ee);
				});
				var te = R(E, 2), ne = (e) => {
					var n = Lc(), r = I(n);
					X(r, { name: "triangle-alert" });
					var i = R(r, 1, !0);
					O(n), z(() => G(i, V(t).error)), W(e, n);
				};
				K(te, (e) => {
					V(t).error && e(ne);
				});
				var re = R(te, 2), ie = (e) => {
					var n = zc();
					q(n, 21, () => h(V(t)), (e) => g(e), (e, n) => {
						var i = Rc(), o = I(i), s = (e) => {
							{
								let r = /* @__PURE__ */ M(() => V(t).generation.agentName || V(t).generation.resolvedProfile || V(t).generation.binding?.name || "Agent");
								vc(e, {
									get item() {
										return V(n);
									},
									get agentName() {
										return V(r);
									}
								});
							}
						}, c = (e) => {
							dc(e, {
								get item() {
									return V(n);
								},
								onExpand: () => y(V(n))
							});
						}, l = (e) => {
							{
								let r = /* @__PURE__ */ M(() => _(V(n)));
								Tc(e, {
									get item() {
										return V(n);
									},
									get generationId() {
										return V(t).generation.generationId;
									},
									get open() {
										return V(r);
									},
									onToggle: (e) => v(V(n), e)
								});
							}
						}, u = (e) => {
							ns(e, {
								get item() {
									return V(n);
								},
								get generationId() {
									return V(t).generation.generationId;
								},
								get contextIdentity() {
									return V(r).identity;
								},
								onApproval: b,
								onToast: (e) => F(a, e, !0)
							});
						}, d = (e) => {
							lc(e, { get item() {
								return V(n);
							} });
						}, f = (e) => {
							{
								let t = /* @__PURE__ */ M(() => V(n).text || "");
								bc(e, {
									title: "Provider error",
									get text() {
										return V(t);
									},
									error: !0
								});
							}
						}, p = (e) => {
							Dc(e, { get item() {
								return V(n);
							} });
						};
						K(o, (e) => {
							V(n).kind === "message" ? e(s) : V(n).kind === "thinking" ? e(c, 1) : V(n).kind === "tools" ? e(l, 2) : V(n).kind === "approval" ? e(u, 3) : V(n).kind === "lifecycle" ? e(d, 4) : V(n).kind === "error" ? e(f, 5) : e(p, -1);
						}), O(i), z(() => Y(i, "data-history-kind", V(n).kind)), W(e, i);
					}), O(n), W(e, n);
				}, ae = /* @__PURE__ */ M(() => m(V(t)));
				K(re, (e) => {
					V(ae) && e(ie);
				}), O(n), z((e, r, a, s) => {
					i = J(n, 1, "history-turn", null, i, { "history-turn-loading": V(t).loading }), Y(n, "data-timeline-key", e), Y(o, "aria-expanded", r), G(l, `${a ?? ""} · ${s ?? ""} · ${(V(t).turn.status || "unknown") ?? ""}`), G(S, V(t).turn.finalReplyPreview || V(t).turn.triggerPreview || "Select to load conversation detail"), G(w, `${V(t).turn.eventCount ?? ""} events · ${V(t).turn.toolEventCount ?? ""} tools `);
				}, [
					() => x(V(t)),
					() => m(V(t)),
					() => u(V(t).turn.startedAt),
					() => d(V(t).turn.durationMs)
				]), H("click", o, () => p(V(t))), W(e, n);
			};
			K(l, (e) => {
				V(t).kind === "gap" ? e(S) : V(t).turn && e(C, 1);
			}), W(e, o);
		}), W(e, n);
	};
	K(C, (e) => {
		V(r).loading && !V(r).loaded ? e(w) : V(r).error && !V(r).loaded ? e(T, 1) : e(E, -1);
	}), O(S), W(e, S), j();
}
Cr(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var Gc = /* @__PURE__ */ U("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), Kc = /* @__PURE__ */ U("<pre class=\"markdown-view\"> </pre>"), qc = /* @__PURE__ */ U("<div class=\"content-section\" data-component-owner=\"markdown-document\"><!></div>");
function Jc(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ M(() => Do(t.file.name));
	var r = qc(), i = I(r), a = (e) => {
		var n = Gc(), r = I(n);
		Xr(r, () => Oo(t.file.content || ""), !0), O(r), O(n), W(e, n);
	}, o = (e) => {
		var n = Kc(), r = I(n, !0);
		O(n), z(() => G(r, t.file.content || "")), W(e, n);
	};
	K(i, (e) => {
		V(n) ? e(a) : e(o, -1);
	}), O(r), z(() => {
		Y(r, "data-doc-file", t.file.name), Y(r, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`);
	}), W(e, r), j();
}
//#endregion
//#region src/components/SchedulerPanel.svelte
var Yc = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary-button\">Cancel edit</button>"), Xc = /* @__PURE__ */ U("<article><header><div><strong> </strong><code> </code></div><div><button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button><button type=\"button\" class=\"secondary-button danger\"><!><span>Remove</span></button></div></header> <dl><div><dt>Condition</dt><dd> </dd></div><div><dt>Target</dt><dd><code> </code></dd></div></dl></article>"), Zc = /* @__PURE__ */ U("<div class=\"empty-list-row\"><!><span>No schedules. The Server will not create empty Scheduler Turns.</span></div>"), Qc = /* @__PURE__ */ U("<div class=\"scheduler-settings-card\"><div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div> <label><input type=\"number\" min=\"1\" max=\"10080\" step=\"1\" aria-label=\"Scheduler wake interval in minutes\"/><span>minutes</span></label> <button type=\"button\" class=\"secondary-button\"><!><span>Save</span></button></div> <div class=\"schedule-editor\"><div class=\"schedule-editor-heading\"><div><strong> </strong><span>Conditions are natural language interpreted by the Scheduler Agent.</span></div><!></div> <label><span>Description</span><input placeholder=\"What should the Scheduler understand?\"/></label> <label><span>Condition</span><textarea rows=\"3\" placeholder=\"For example: when the release branch is green after 09:00 Shanghai time\"></textarea></label> <label><span>Target resource ID</span><input placeholder=\"workspace, scheduler, project1, or project1.task1\"/></label> <button type=\"button\"><span class=\"schedule-icon schedule-icon-busy\"><!></span><span class=\"schedule-icon schedule-icon-editing\"><!></span><span class=\"schedule-icon schedule-icon-add\"><!></span><span> </span></button></div> <div class=\"schedule-list\"><!></div>", 1);
function $c(e, t) {
	A(t, !0);
	let n = new vo();
	ji(() => n.dispose());
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
		if (!V(i).trim() || !V(a).trim() || !V(o).trim() || V(c)) return;
		F(c, !0);
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
			F(c, !1);
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
			F(c, !0);
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
				F(c, !1);
			}
		}
	}
	var m = Qc(), h = L(m), g = R(I(h), 2), _ = I(g);
	_i(_), k(), O(g);
	var v = R(g, 2);
	X(I(v), { name: "save" }), k(), O(v), O(h);
	var y = R(h, 2), b = I(y), x = I(b), S = I(x), C = I(S, !0);
	O(S), k(), O(x);
	var w = R(x), T = (e) => {
		var t = Yc();
		H("click", t, u), W(e, t);
	};
	K(w, (e) => {
		V(r) && e(T);
	}), O(b);
	var E = R(b, 2), ee = R(I(E));
	_i(ee), O(E);
	var te = R(E, 2), ne = R(I(te));
	it(ne), O(te);
	var re = R(te, 2), ie = R(I(re));
	_i(ie), O(re);
	var ae = R(re, 2);
	let oe;
	var se = I(ae);
	X(I(se), { name: "loader-circle" }), O(se);
	var ce = R(se);
	X(I(ce), { name: "save" }), O(ce);
	var le = R(ce);
	X(I(le), { name: "plus" }), O(le);
	var ue = R(le), de = I(ue, !0);
	O(ue), O(ae), O(y);
	var fe = R(y, 2), pe = I(fe), me = (e) => {
		var n = Mr();
		q(L(n), 17, () => t.config.schedules, (e) => e.id, (e, t) => {
			var n = Xc();
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
				i = J(n, 1, "", null, i, { editing: V(r) === V(t).id }), G(c, V(t).description), G(d, V(t).id), G(y, V(t).condition), G(C, V(t).target);
			}), H("click", m, () => l(V(t))), H("click", h, () => f(V(t))), W(e, n);
		}), W(e, n);
	}, he = (e) => {
		var t = Zc();
		X(I(t), { name: "calendar-clock" }), k(), O(t), W(e, t);
	};
	K(pe, (e) => {
		t.config.schedules.length ? e(me) : e(he, -1);
	}), O(fe), z((e, n) => {
		v.disabled = V(c) || V(s) === t.config.wakeIntervalMinutes, G(C, V(r) ? "Edit schedule" : "Add schedule"), ae.disabled = e, oe = J(ae, 1, "", null, oe, n), G(de, V(r) ? "Update schedule" : "Add schedule");
	}, [() => V(c) || !V(i).trim() || !V(a).trim() || !V(o).trim(), () => ({
		busy: V(c),
		editing: !!V(r)
	})]), Ci(_, () => V(s), (e) => F(s, e)), H("click", v, p), Ci(ee, () => V(i), (e) => F(i, e)), Ci(ne, () => V(a), (e) => F(a, e)), Ci(ie, () => V(o), (e) => F(o, e)), H("click", ae, d), W(e, m), j();
}
Cr(["click"]);
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var el = /* @__PURE__ */ U("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), tl = /* @__PURE__ */ U("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), nl = /* @__PURE__ */ U("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), rl = /* @__PURE__ */ U("<p class=\"log-load-error\" role=\"alert\"> </p>"), il = /* @__PURE__ */ U("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><span class=\"workspace-agents-icon workspace-agents-icon-idle\"><!></span><span class=\"workspace-agents-icon workspace-agents-icon-busy\"><!></span><span> </span></button></div></form>"), al = /* @__PURE__ */ U("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function ol(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(""), l = /* @__PURE__ */ M(() => V(r) !== V(i)), u = /* @__PURE__ */ M(() => !!(V(l) && V(o) && V(a) && V(o) !== V(a)));
	bn(() => {
		let e = ko(t.file?.content || ""), u = t.file?.contentHash || "";
		F(o, u, !0), t.identity === V(n) ? !V(l) && u !== V(a) && (F(r, e, !0), F(i, e, !0), F(a, u, !0)) : (F(n, t.identity, !0), F(r, e, !0), F(i, e, !0), F(a, u, !0), F(c, ""), F(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), V(s) || !V(l)) return;
		let u = V(n);
		F(s, !0), F(c, "");
		try {
			let e = await t.onSave(V(r), V(a));
			if (V(n) !== u) return;
			F(i, ko(e.content || V(r)), !0), F(r, V(i), !0), F(a, e.contentHash || "", !0), F(o, V(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			V(n) === u && F(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			V(n) === u && (F(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = al(), p = I(f);
	X(I(p), { name: "file-text" }), k(), O(p);
	var m = R(p, 2), h = (e) => {
		var t = el();
		X(I(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), k(), O(t), W(e, t);
	}, g = (e) => {
		var n = tl(), r = I(n);
		X(r, { name: "triangle-alert" });
		var i = R(r, 2), a = I(i, !0);
		O(i), O(n), z(() => G(a, t.file.error)), W(e, n);
	}, _ = (e) => {
		var t = il(), n = I(t);
		it(n);
		var i = R(n, 2), a = (e) => {
			W(e, nl());
		};
		K(i, (e) => {
			V(u) && e(a);
		});
		var o = R(i, 2), f = (e) => {
			var t = rl(), n = I(t, !0);
			O(t), z(() => G(n, V(c))), W(e, t);
		};
		K(o, (e) => {
			V(c) && e(f);
		});
		var p = R(o, 2), m = I(p);
		let h;
		var g = I(m);
		X(I(g), { name: "save" }), O(g);
		var _ = R(g);
		X(I(_), { name: "loader-circle" }), O(_);
		var v = R(_), y = I(v, !0);
		O(v), O(m), O(p), O(t), z(() => {
			n.disabled = V(s), m.disabled = V(s) || !V(l), h = J(m, 1, "", null, h, { busy: V(s) }), G(y, V(s) ? "Saving" : "Save");
		}), Sr("submit", t, d), Ci(n, () => V(r), (e) => F(r, e)), W(e, t);
	};
	K(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), O(f), W(e, f), j();
}
//#endregion
//#region src/components/DetailPanel.svelte
var sl = /* @__PURE__ */ U("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), cl = /* @__PURE__ */ U("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), ll = /* @__PURE__ */ U("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), ul = /* @__PURE__ */ U("<div class=\"details-header\"><h1 class=\"details-title\"> </h1></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!></div>", 1), dl = /* @__PURE__ */ U("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), fl = /* @__PURE__ */ U("<code class=\"resource-ref-badge\"> </code>"), pl = /* @__PURE__ */ U("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), ml = /* @__PURE__ */ U("<button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button>"), hl = /* @__PURE__ */ U("<div class=\"details-actions\"><!><!></div>"), gl = /* @__PURE__ */ U("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), _l = /* @__PURE__ */ U("<button type=\"button\" role=\"tab\"><!><span> </span></button>"), vl = /* @__PURE__ */ U("<div><!></div>"), yl = /* @__PURE__ */ U("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), bl = /* @__PURE__ */ U("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), xl = /* @__PURE__ */ U("<div class=\"content-section\"><div class=\"template-list\"><!></div></div>"), Sl = /* @__PURE__ */ U("<div class=\"content-section\"><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), Cl = /* @__PURE__ */ U("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), wl = /* @__PURE__ */ U("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), Tl = /* @__PURE__ */ U("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!> <div><!></div> <!> <div><!></div> <div><div class=\"content-section\"><div class=\"worktree-list\"><!></div></div></div></div>", 1), El = /* @__PURE__ */ U("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!></nav> <h1 class=\"details-title\"> <!></h1><!></div> <!>", 1), Dl = /* @__PURE__ */ U("<!> <!> <!>", 1);
function Ol(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P($t(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ P(null), s = /* @__PURE__ */ P(null), c = /* @__PURE__ */ new Map(), l = new vo(), u = 0, d = /* @__PURE__ */ M(() => (V(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), f = /* @__PURE__ */ M(() => new Set(V(d).map((e) => e.name))), p = /* @__PURE__ */ M(g), m = /* @__PURE__ */ M(() => V(o) ? `${V(o).section}:${V(o).path}` : "");
	Ai(() => t.channel.subscribe((e) => {
		let t = w(), l = ++u;
		if (F(n, e, !0), e.identity !== V(r)) {
			V(r) && V(i) && c.set(V(r), V(i)), F(r, e.identity, !0), F(o, null), F(s, null), F(a, /* @__PURE__ */ new Set(), !0);
			let t = c.get(V(r));
			F(i, t && t !== "work" ? t : h(e), !0);
			let n = document.getElementById("detailsContent");
			n && (n.scrollTop = 0);
		} else V(p).length && !V(p).some((e) => e.id === V(i)) && F(i, V(p)[0].id, !0);
		ur().then(() => {
			l === u && T(t), e.onIconsChanged();
		});
	})), Ai(() => {
		let e = (e) => {
			e.key === "Escape" && (V(s) ? (e.preventDefault(), F(s, null)) : V(o) && (e.preventDefault(), F(o, null)));
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
		F(i, e, !0), c.set(V(r), e);
	}
	function y(e) {
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function b(e) {
		let t = new Set(V(a));
		t.has(e) ? t.delete(e) : t.add(e), F(a, t, !0), queueMicrotask(V(n).onIconsChanged);
	}
	function x(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(V(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function S(e, t) {
		F(o, {
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
	var ee = Dl(), te = L(ee), ne = (e) => {
		var t = sl(), n = I(t);
		X(I(n), {
			name: "folder-search",
			className: "empty-state-icon"
		}), k(2), O(n), O(t), W(e, t);
	}, re = (e) => {
		var t = ul(), r = L(t), i = I(r), o = I(i, !0);
		O(i), O(r);
		var s = R(r, 2), c = I(s);
		ol(c, {
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
			var t = cl(), r = I(t);
			X(I(r), { name: "book-open" }), k(), O(r);
			var i = R(r), a = I(i);
			X(a, { name: "triangle-alert" });
			var o = R(a, 2), s = I(o, !0);
			O(o), O(i), O(t), z(() => G(s, V(n).wiki.error)), W(e, t);
		}, d = (e) => {
			var t = ll(), n = I(t);
			X(I(n), { name: "book-open" }), k(), O(n);
			var r = R(n);
			X(I(r), { name: "book-open" }), k(2), O(r), O(t), W(e, t);
		}, f = (e) => {
			{
				let t = /* @__PURE__ */ M(() => V(n).wiki.entries || []);
				zo(e, {
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
		}), O(s), z(() => G(o, V(n).workspaceName)), W(e, t);
	}, ie = (e) => {
		var t = El(), r = L(t), o = I(r), c = I(o), l = I(c, !0);
		O(c);
		var u = R(c, 2), f = (e) => {
			var t = dl(), r = R(L(t)), i = I(r, !0);
			O(r), z(() => G(i, V(n).parent.title)), H("click", r, () => V(n).onNavigate(V(n).parent?.id || "workspace")), W(e, t);
		};
		K(u, (e) => {
			V(n).parent && e(f);
		}), O(o);
		var h = R(o, 2), g = I(h, !0), C = R(g), w = (e) => {
			var t = fl(), r = I(t, !0);
			O(t), z((e) => G(r, e), [() => y(V(n).resourceId)]), W(e, t);
		};
		K(C, (e) => {
			V(n).resourceType !== "scheduler" && e(w);
		}), O(h);
		var T = R(h), E = (e) => {
			var t = hl(), r = I(t), i = (e) => {
				var t = pl();
				X(I(t), { name: "plus" }), k(), O(t), H("click", t, () => V(n).onCreateTask(V(n).resourceId)), W(e, t);
			};
			K(r, (e) => {
				V(n).resourceType === "project" && e(i);
			});
			var a = R(r), o = (e) => {
				var t = ml();
				X(I(t), { name: "archive" }), k(), O(t), H("click", t, () => V(n).onArchive(V(n).resourceId)), W(e, t);
			};
			K(a, (e) => {
				V(n).resourceType !== "scheduler" && e(o);
			}), O(t), W(e, t);
		};
		K(T, (e) => {
			V(n).detail && e(E);
		}), O(r);
		var ee = R(r, 2), te = (e) => {
			var t = gl(), n = I(t);
			X(I(n), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), k(), O(n), O(t), W(e, t);
		}, ne = (e) => {
			var t = Tl(), r = L(t);
			q(r, 21, () => V(p), (e) => e.id, (e, t) => {
				var n = _l();
				let r;
				var a = I(n);
				X(a, { get name() {
					return V(t).icon;
				} });
				var o = R(a), s = I(o, !0);
				O(o), O(n), z(() => {
					r = J(n, 1, "details-tab", null, r, { active: V(i) === V(t).id }), Y(n, "aria-selected", V(i) === V(t).id), G(s, V(t).label);
				}), H("click", n, () => v(V(t).id)), W(e, n);
			}), O(r);
			var o = R(r, 2), c = I(o);
			q(c, 17, () => V(d), (e) => e.path || e.name, (e, t) => {
				var r = vl();
				Jc(I(r), {
					get file() {
						return V(t);
					},
					get workspaceId() {
						return V(n).workspaceId;
					}
				}), O(r), z((e) => Y(r, "hidden", e), [() => V(i) !== _(V(t))]), W(e, r);
			});
			var l = R(c, 2), u = (e) => {
				var t = vl(), r = I(t);
				{
					let e = /* @__PURE__ */ M(() => V(n).onRefreshScheduler || (async () => void 0));
					$c(r, {
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
				O(t), z(() => Y(t, "hidden", V(i) !== "schedules")), W(e, t);
			};
			K(l, (e) => {
				V(n).resourceType === "scheduler" && V(n).detail.scheduler && e(u);
			});
			var f = R(l, 2), h = I(f), g = (e) => {
				var t = xl(), r = I(t), i = I(r), a = (e) => {
					var t = Mr();
					q(L(t), 17, () => V(n).detail.templates, (e) => e.name, (e, t) => {
						var n = yl();
						let r;
						var i = I(n);
						X(i, { name: "file-text" });
						var a = R(i), o = I(a), s = I(o, !0);
						O(o);
						var c = R(o), l = I(c);
						O(c), O(a), X(R(a), { name: "chevron-right" }), O(n), z(() => {
							r = J(n, 1, "template-row", null, r, { invalid: !V(t).valid }), G(s, V(t).title || V(t).name), G(l, `${V(t).name ?? ""} · v${(V(t).schemaVersion || "?") ?? ""} · ${V(t).valid ? `${(V(t).fields || []).length} fields` : `invalid${V(t).errors?.[0]?.message ? `: ${V(t).errors[0].message}` : ""}`}${V(t).legacy ? " · legacy" : ""}`);
						}), H("click", n, () => V(t).path && S("Templates", V(t).path)), W(e, n);
					}), W(e, t);
				}, o = (e) => {
					var t = bl();
					X(I(t), { name: "layout-template" }), k(), O(t), W(e, t);
				};
				K(i, (e) => {
					V(n).detail.templates?.length ? e(a) : e(o, -1);
				}), O(r), O(t), W(e, t);
			}, y = (e) => {
				var t = Sl(), r = I(t), i = I(r), a = I(i);
				X(a, { name: "file-text" });
				var o = R(a), s = I(o), c = I(s, !0);
				O(s);
				var l = R(s), u = I(l);
				O(l), O(o), O(i), O(r), O(t), z(() => {
					G(c, V(n).detail.template.name), G(u, `Created from template · v${(V(n).detail.template.schemaVersion || "?") ?? ""} · ${(V(n).detail.template.digest || "") ?? ""}`);
				}), W(e, t);
			};
			K(h, (e) => {
				V(n).resourceType === "project" ? e(g) : V(n).detail.template && e(y, 1);
			}), O(f);
			var C = R(f, 2), w = (e) => {
				var t = Mr();
				Br(L(t), () => V(n).identity, (e) => {
					{
						let t = /* @__PURE__ */ M(() => V(n).detail.artifacts || []);
						Wc(e, {
							get workspaceId() {
								return V(n).workspaceId;
							},
							get resourceId() {
								return V(n).resourceId;
							},
							get artifacts() {
								return V(t);
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
			var T = R(C, 2), E = I(T);
			{
				let e = /* @__PURE__ */ M(() => V(n).detail.artifacts || []);
				zo(E, {
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
			O(T);
			var ee = R(T, 2), te = I(ee), ne = I(te), re = I(ne), ie = (e) => {
				var t = Mr();
				q(L(t), 17, () => V(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = Cl(), r = I(n), i = I(r);
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
						G(c, V(t).branch || "HEAD"), G(u, `${(V(t).name || "repository") ?? ""}${V(t).targetBranch || V(t).baseBranch ? ` · base ${V(t).targetBranch || V(t).baseBranch}` : ""}`), G(f, V(t).worktreePath || "");
					}), H("click", p, () => F(s, V(t), !0)), W(e, n);
				}), W(e, t);
			}, ae = (e) => {
				var t = wl();
				X(I(t), { name: "git-branch" }), k(), O(t), W(e, t);
			};
			K(re, (e) => {
				V(n).detail.repos?.length ? e(ie) : e(ae, -1);
			}), O(ne), O(te), O(ee), O(o), z(() => {
				Y(f, "hidden", V(i) !== "template"), Y(T, "hidden", V(i) !== "artifacts"), Y(ee, "hidden", V(i) !== "worktrees");
			}), W(e, t);
		};
		K(ee, (e) => {
			V(n).loading || !V(n).detail ? e(te) : e(ne, -1);
		}), z(() => {
			G(l, V(n).workspaceName), G(g, V(n).resourceTitle);
		}), H("click", c, () => V(n).onNavigate("workspace")), W(e, t);
	};
	K(te, (e) => {
		V(n).workspaceId ? V(n).resourceType === "workspace" ? e(re, 1) : e(ie, -1) : e(ne);
	});
	var ae = R(te, 2);
	qo(ae, {
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
		onClose: () => F(o, null),
		onError: E,
		get onIconsChanged() {
			return V(n).onIconsChanged;
		}
	}), Eo(R(ae, 2), {
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
		onClose: () => F(s, null),
		onError: E,
		get onIconsChanged() {
			return V(n).onIconsChanged;
		}
	}), W(e, ee), j();
}
Cr(["click"]);
//#endregion
//#region src/components/EventTimeline.svelte
var kl = /* @__PURE__ */ U("<button type=\"button\"><span class=\"load-older-icon load-older-icon-idle\"><!></span><span class=\"load-older-icon load-older-icon-busy\"><!></span><span> </span></button>"), Al = /* @__PURE__ */ U("<div class=\"conversation-generation\"><span> </span><strong> </strong><small> </small></div>"), jl = /* @__PURE__ */ U("<button type=\"button\" class=\"secondary-button\">Retry</button>"), Ml = /* @__PURE__ */ U("<div class=\"conversation-gap\"><!><span><strong>History unavailable</strong><small> </small></span><!></div>"), Nl = /* @__PURE__ */ U("<div class=\"turn-summary-preview\"> </div>"), Pl = /* @__PURE__ */ U("<div><!></div>"), Fl = /* @__PURE__ */ U("<div class=\"turn-loading\"><!><span>Loading turn details</span></div>"), Il = /* @__PURE__ */ U("<section><!> <!> <!> <!></section>"), Ll = /* @__PURE__ */ U("<!> <!>", 1), Rl = /* @__PURE__ */ U("<div class=\"turn-working-indicator\" role=\"status\" aria-live=\"polite\" data-timeline-key=\"turn-working\"><!><span>working...</span></div>"), zl = /* @__PURE__ */ U("<div class=\"tty-empty\"><!><strong>Loading resource history</strong></div>"), Bl = /* @__PURE__ */ U("<div class=\"tty-empty\"><!><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>"), Vl = /* @__PURE__ */ U("<!> <!> <!> <!> <!> <!> <!>", 1), Hl = /* @__PURE__ */ U("<div class=\"tty-empty\"><!><strong>No resource selected</strong></div>"), Ul = /* @__PURE__ */ U("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div>");
function Wl(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P($t(t.channel.current().project)), i = /* @__PURE__ */ P($t(te())), a = /* @__PURE__ */ P(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ P($t(/* @__PURE__ */ new Map()));
	Ai(() => {
		let e = x();
		o = new Hs({
			onEvent: (e, t, r) => V(n).onEvent(e, t, r),
			onNotice: (e, t, r) => V(n).onNotice(e, t, r)
		});
		let i = o.subscribe(f), a = t.channel.subscribe((e) => {
			let t = V(n).identity, i = w(V(n).status) !== w(e.status) && C(x());
			F(n, e, !0), e.project !== V(r) && F(r, e.project, !0), e.identity !== t && (l = !0, s = null, F(d, new Map(u.get(e.identity) ?? []), !0)), o?.activate(e.workspaceId, e.resourceId, e.status), ur().then(() => {
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
		if (V(i).identity && e.identity === V(i).identity && S()) {
			s = e;
			return;
		}
		p(e);
	}
	function p(e) {
		let t = x();
		c = e.identity !== V(i).identity || l || C(t), l = !1, F(i, e, !0), t && (t.dataset.agentResourceId = e.resourceId), ur().then(() => {
			c && !S() && T(), V(n).onIconsChanged(), e.loaded && e.hasMoreBefore && g(e.identity);
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
		return e.events ? V(r)(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || [];
	}
	async function g(e) {
		let t = 0;
		for (; t < 16 && V(i).identity === e && V(i).hasMoreBefore;) {
			let e = x();
			if (!e || e.scrollHeight > e.clientHeight + 160 || S() || !await o?.loadOlder()) return;
			t++, await ur(), T();
		}
	}
	async function _() {
		let e = x();
		if (!e || V(i).loadingOlder) return;
		let t = E(e), r = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = V(i).identity;
		await o?.loadOlder(), await ur(), V(i).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - r) : s + (e.scrollHeight - a), V(n).onIconsChanged());
	}
	function v(e, t) {
		let n = ee(e);
		F(d, new Map(V(d)).set(n, t), !0), u.set(V(i).identity, new Map(V(d))), t && y(e);
	}
	function y(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return o?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function b(e) {
		return V(d).get(ee(e)) ?? !1;
	}
	function x() {
		return V(a)?.parentElement ?? null;
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
		return `${e.generationId || V(i).generationId}:${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
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
	var ne = Ul(), re = I(ne), ie = (e) => {
		var t = Vl(), r = L(t), a = (e) => {
			var t = kl();
			let n;
			var r = I(t);
			X(I(r), { name: "chevrons-up" }), O(r);
			var a = R(r);
			X(I(a), { name: "loader-circle" }), O(a);
			var o = R(a), s = I(o, !0);
			O(o), O(t), z(() => {
				n = J(t, 1, "load-older-events", null, n, { busy: V(i).loadingOlder }), t.disabled = V(i).loadingOlder, G(s, V(i).loadingOlder ? "Loading..." : "Load older messages");
			}), H("click", t, _), W(e, t);
		};
		K(r, (e) => {
			V(i).hasMoreBefore && e(a);
		});
		var s = R(r, 2);
		q(s, 19, () => V(i).blocks, (e) => e.key, (e, t, r) => {
			var a = Ll(), s = L(a), c = (e) => {
				var n = Al(), r = I(n), i = I(r);
				O(r);
				var a = R(r), o = I(a, !0);
				O(a);
				var s = R(a), c = I(s, !0);
				O(s), O(n), z(() => {
					Y(n, "data-generation-id", V(t).generation.generationId), G(i, `Generation ${V(t).generation.generation ?? ""}`), G(o, V(t).generation.agentName || V(t).generation.resolvedProfile || V(t).generation.binding?.name || "Agent"), G(c, V(t).generation.status);
				}), W(e, n);
			};
			K(s, (e) => {
				(V(r) === 0 || V(i).blocks[V(r) - 1].generation.generationId !== V(t).generation.generationId) && e(c);
			});
			var l = R(s, 2), u = (e) => {
				var n = Ml(), r = I(n);
				X(r, { name: "triangle-alert" });
				var i = R(r), a = R(I(i)), s = I(a, !0);
				O(a), O(i);
				var c = R(i), l = (e) => {
					var t = jl();
					H("click", t, () => o?.retryHistory()), W(e, t);
				};
				K(c, (e) => {
					V(t).gap?.retryable && e(l);
				}), O(n), z(() => {
					Y(n, "data-timeline-key", V(t).key), G(s, V(t).gap?.message || "This generation could not be read.");
				}), W(e, n);
			}, d = (e) => {
				var r = Il();
				let a;
				var o = I(r), s = (e) => {
					var n = Nl(), r = I(n, !0);
					O(n), z(() => G(r, V(t).turn.triggerPreview)), W(e, n);
				};
				K(o, (e) => {
					V(t).turn?.triggerPreview && !V(t).items && !V(t).events && e(s);
				});
				var c = R(o, 2);
				q(c, 17, () => h(V(t)), (e) => ee(e), (e, r) => {
					var a = Pl(), o = I(a), s = (e) => {
						vc(e, {
							get item() {
								return V(r);
							},
							get agentName() {
								return V(n).agentName;
							}
						});
					}, c = (e) => {
						dc(e, {
							get item() {
								return V(r);
							},
							onExpand: () => y(V(r))
						});
					}, l = (e) => {
						{
							let n = /* @__PURE__ */ M(() => b(V(r)));
							Tc(e, {
								get item() {
									return V(r);
								},
								get generationId() {
									return V(t).generation.generationId;
								},
								get open() {
									return V(n);
								},
								onToggle: (e) => v(V(r), e)
							});
						}
					}, u = (e) => {
						ns(e, {
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
						lc(e, { get item() {
							return V(r);
						} });
					}, f = (e) => {
						{
							let t = /* @__PURE__ */ M(() => V(r).text || "");
							bc(e, {
								title: "Provider error",
								get text() {
									return V(t);
								},
								error: !0
							});
						}
					}, p = (e) => {
						Dc(e, { get item() {
							return V(r);
						} });
					};
					K(o, (e) => {
						V(r).kind === "message" ? e(s) : V(r).kind === "thinking" ? e(c, 1) : V(r).kind === "tools" ? e(l, 2) : V(r).kind === "approval" ? e(u, 3) : V(r).kind === "lifecycle" ? e(d, 4) : V(r).kind === "error" ? e(f, 5) : e(p, -1);
					}), O(a), z((e) => Y(a, "data-timeline-key", e), [() => ee(V(r))]), W(e, a);
				});
				var l = R(c, 2), u = (e) => {
					var t = Fl();
					X(I(t), { name: "loader-circle" }), k(), O(t), W(e, t);
				};
				K(l, (e) => {
					V(t).loading && !V(t).items && !V(t).events && e(u);
				});
				var d = R(l, 2), f = (e) => {
					bc(e, {
						title: "Turn unavailable",
						get text() {
							return V(t).error;
						},
						error: !0
					});
				};
				K(d, (e) => {
					V(t).error && e(f);
				}), O(r), Qr(r, (e, t) => m?.(e, t), () => V(t).turn?.reference || ""), z(() => {
					a = J(r, 1, "conversation-turn", null, a, { "conversation-turn-loading": V(t).loading }), Y(r, "data-timeline-key", V(t).key);
				}), W(e, r);
			};
			K(l, (e) => {
				V(t).kind === "gap" ? e(u) : e(d, -1);
			}), W(e, a);
		});
		var c = R(s, 2);
		q(c, 19, () => V(i).notices, (e, t) => `notice:${V(i).identity}:${t}:${String(e.data?.text || "")}`, (e, t, n) => {
			var r = Pl(), i = I(r);
			{
				let e = /* @__PURE__ */ M(() => String(V(t).data?.text || "")), n = /* @__PURE__ */ M(() => V(t).data?.level === "error");
				bc(i, {
					title: "Forge",
					get text() {
						return V(e);
					},
					get error() {
						return V(n);
					}
				});
			}
			O(r), z(() => Y(r, "data-timeline-key", `notice:${V(n)}`)), W(e, r);
		});
		var l = R(c, 2), u = (e) => {
			bc(e, {
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
			var t = Rl();
			X(I(t), { name: "loader-circle" }), k(), O(t), W(e, t);
		}, p = /* @__PURE__ */ M(() => w(V(n).status));
		K(d, (e) => {
			V(p) && e(f);
		});
		var g = R(d, 2), x = (e) => {
			var t = zl();
			X(I(t), { name: "loader-circle" }), k(), O(t), W(e, t);
		};
		K(g, (e) => {
			V(i).loading && !V(i).blocks.length && e(x);
		});
		var S = R(g, 2), C = (e) => {
			var t = Bl();
			X(I(t), { name: "bot" }), k(2), O(t), W(e, t);
		}, T = /* @__PURE__ */ M(() => V(i).loaded && !V(i).loading && !V(i).blocks.length && !V(i).notices.length && !w(V(n).status));
		K(S, (e) => {
			V(T) && e(C);
		}), W(e, t);
	}, ae = (e) => {
		var t = Hl();
		X(I(t), { name: "bot" }), k(), O(t), W(e, t);
	};
	K(re, (e) => {
		V(i).resourceId ? e(ie) : e(ae, -1);
	}), O(ne), Oi(ne, (e) => F(a, e), () => V(a)), z(() => Y(ne, "data-chat-context", V(i).identity)), W(e, ne), j();
}
Cr(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function Gl(e) {
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
function Kl(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: { ...e.resourceDefaults },
		newProfile: { ...e.newProfile }
	};
}
function ql(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var Jl = /* @__PURE__ */ U("<span class=\"settings-pill\"> </span>"), Yl = /* @__PURE__ */ U("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), Xl = /* @__PURE__ */ U("<div class=\"settings-empty\">No AgentHub agents available.</div>"), Zl = /* @__PURE__ */ U("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function Ql(e, t) {
	A(t, !0);
	let n = ki(t, "draft", 15), r = ki(t, "pending", 15);
	async function i() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(Kl(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(ql(e));
			} finally {
				r("");
			}
		}
	}
	var a = Zl(), o = R(I(a), 2), s = I(o), c = R(I(s)), l = I(c, !0);
	O(c), O(s);
	var u = R(s, 2), d = R(I(u));
	_i(d), O(u);
	var f = R(u, 2), p = I(f, !0);
	O(f);
	var m = R(f, 2);
	q(m, 21, () => t.agentHub.capabilities, Vr, (e, t) => {
		var n = Jl(), r = I(n, !0);
		O(n), z(() => G(r, V(t))), W(e, n);
	}), O(m), O(o);
	var h = R(o, 2), g = I(h), _ = R(I(g)), v = I(_);
	O(_), O(g);
	var y = R(g, 2);
	q(y, 21, () => t.agentHub.agents, (e) => e.name, (e, t) => {
		var n = Yl(), r = I(n), i = I(r), a = I(i, !0);
		O(i);
		var o = R(i), s = I(o), c = I(s, !0);
		O(s);
		var l = R(s), u = I(l);
		O(l), O(o), O(r), O(n), z((e) => {
			G(a, e), G(c, V(t).name), G(u, `${(V(t).providerId || "") ?? ""} · ${(V(t).available === !1 ? V(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (V(t).name || "A").slice(0, 1).toUpperCase()]), W(e, n);
	}, (e) => {
		W(e, Xl());
	}), O(y), O(h);
	var b = R(h, 2), x = I(b);
	let S;
	var C = I(x, !0);
	O(x);
	var w = R(x);
	X(I(w), { name: "save" }), k(), O(w), O(b), O(a), z((e) => {
		G(l, t.agentHub.connected && t.agentHub.compatible ? "Compatible" : t.agentHub.connected ? "Incompatible" : "Unavailable"), G(p, t.agentHub.error || `API ${t.agentHub.apiVersion || "unknown"} · AgentHub ${t.agentHub.version || "unknown"}`), G(v, `${t.agentHub.agents.length ?? ""} agents · ${t.agentHub.providers.length ?? ""} providers`), S = J(x, 1, "settings-save-hint", null, S, { visible: n().dirty }), G(C, n().dirty ? "Unsaved changes" : ""), w.disabled = e;
	}, [() => !n().dirty || !!r()]), H("input", d, function(...e) {
		t.onDirty?.apply(this, e);
	}), Ci(d, () => n().endpoint, (e) => n(n().endpoint = e, !0)), H("click", w, i), W(e, a), j();
}
Cr(["input", "click"]);
//#endregion
//#region src/components/AppearanceSettingsPanel.svelte
var $l = /* @__PURE__ */ jr("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), eu = /* @__PURE__ */ jr("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), tu = /* @__PURE__ */ jr("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"80\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-strong\" x=\"40\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect><rect class=\"d-outline\" x=\"74\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect></svg>"), nu = /* @__PURE__ */ jr("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-light\" x=\"6\" y=\"8\" width=\"70\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"82\" y=\"8\" width=\"32\" height=\"56\" rx=\"3\"></rect></svg>"), ru = /* @__PURE__ */ U("<button type=\"button\" role=\"radio\"><span class=\"layout-diagram\"><!></span> <span class=\"layout-option-text\"><strong> </strong><small> </small></span></button>"), iu = /* @__PURE__ */ U("<div class=\"font-scale-row\"><span class=\"font-scale-label\"> </span> <input type=\"range\" min=\"80\" max=\"140\" step=\"5\"/> <span class=\"font-scale-value\"> </span></div>"), au = /* @__PURE__ */ U("<div class=\"settings-panel\" data-component-owner=\"appearance-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Appearance</h2><p>Choose the workspace layout and the text size of each column. Everything applies immediately and is stored only in this browser.</p></div> <section class=\"appearance-section\" aria-label=\"Layout\"><div class=\"settings-section-heading\"><h3>Layout</h3></div> <div class=\"layout-options\" role=\"radiogroup\" aria-label=\"Workspace layout\"></div></section> <section class=\"appearance-section\" aria-label=\"Text size\"><div class=\"settings-section-heading\"><h3>Text size</h3><button type=\"button\" class=\"appearance-reset\"><!><span>Reset</span></button></div> <div class=\"font-scale-rows\"></div> <small class=\"appearance-hint\">Scales the text of each column independently from 80% to 140%.</small></section></div>");
function ou(e, t) {
	A(t, !0);
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
	], i = (e) => `${Math.round(e * 100)}%`, a = /* @__PURE__ */ M(() => r.every((e) => t.appearance.fontScales[e.id] === 1));
	var o = au(), s = R(I(o), 2), c = R(I(s), 2);
	q(c, 21, () => n, (e) => e.id, (e, n) => {
		var r = ru();
		let i;
		var a = I(r), o = I(a), s = (e) => {
			W(e, $l());
		}, c = (e) => {
			W(e, eu());
		}, l = (e) => {
			W(e, tu());
		}, u = (e) => {
			W(e, nu());
		};
		K(o, (e) => {
			V(n).id === "auto" ? e(s) : V(n).id === "three" ? e(c, 1) : V(n).id === "two" ? e(l, 2) : e(u, -1);
		}), O(a);
		var d = R(a, 2), f = I(d), p = I(f, !0);
		O(f);
		var m = R(f), h = I(m, !0);
		O(m), O(d), O(r), z(() => {
			i = J(r, 1, "layout-option", null, i, { active: t.appearance.layout === V(n).id }), Y(r, "aria-checked", t.appearance.layout === V(n).id), G(p, V(n).label), G(h, V(n).description);
		}), H("click", r, () => t.onLayoutPreference(V(n).id)), W(e, r);
	}), O(c), O(s);
	var l = R(s, 2), u = I(l), d = R(I(u));
	X(I(d), { name: "rotate-ccw" }), k(), O(d), O(u);
	var f = R(u, 2);
	q(f, 21, () => r, (e) => e.id, (e, n) => {
		var r = iu(), a = I(r), o = I(a, !0);
		O(a);
		var s = R(a, 2);
		_i(s);
		var c = R(s, 2), l = I(c, !0);
		O(c), O(r), z((e, t) => {
			G(o, V(n).label), vi(s, e), Y(s, "aria-label", `${V(n).label} text size`), G(l, t);
		}, [() => Math.round(t.appearance.fontScales[V(n).id] * 100), () => i(t.appearance.fontScales[V(n).id])]), H("input", s, (e) => t.onFontScale(V(n).id, Number(e.currentTarget.value) / 100)), W(e, r);
	}), O(f), k(2), O(l), O(o), z(() => d.disabled = V(a)), H("click", d, function(...e) {
		t.onResetFontScales?.apply(this, e);
	}), W(e, o), j();
}
Cr(["click", "input"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var su = /* @__PURE__ */ U("<small class=\"settings-notification-help\"> </small>"), cu = /* @__PURE__ */ U("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function lu(e, t) {
	A(t, !0);
	var n = cu(), r = R(I(n), 2), i = I(r), a = R(I(i), 2);
	_i(a), O(i);
	var o = R(i, 2), s = (e) => {
		var n = su(), r = I(n, !0);
		O(n), z(() => G(r, t.notifications.permissionError)), W(e, n);
	};
	K(o, (e) => {
		t.notifications.permissionError && e(s);
	}), O(r);
	var c = R(r, 2), l = I(c), u = R(I(l), 2);
	_i(u), O(l);
	var d = R(l, 2), f = I(d, !0);
	O(d), O(c), O(n), z(() => {
		yi(a, t.notifications.browser), yi(u, t.notifications.sound), G(f, t.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), H("change", a, (e) => t.onBrowserNotifications(e.currentTarget.checked)), H("change", u, (e) => t.onCompletionSound(e.currentTarget.checked)), W(e, n), j();
}
Cr(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var uu = /* @__PURE__ */ U("<option> </option>"), du = /* @__PURE__ */ U("<label><span> </span><select></select></label>"), fu = /* @__PURE__ */ U("<span class=\"settings-profile-system-label\">System</span>"), pu = /* @__PURE__ */ U("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), mu = /* @__PURE__ */ U("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), hu = /* @__PURE__ */ U("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>New Resource Defaults</h3><span>Applied once at creation</span></div> <div class=\"settings-resource-defaults\"></div> <p class=\"settings-resource-default-note\">Existing resources keep their explicit binding. Changing a profile route replaces its referenced resource generations at a safe turn boundary.</p></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function gu(e, t) {
	A(t, !0);
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
				await t.onSaveAgentHub(Kl(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(ql(e));
			} finally {
				r("");
			}
		}
	}
	var f = hu(), p = R(I(f), 2), m = R(I(p), 2);
	q(m, 20, () => [
		["workspace", "Workspace"],
		["project", "Project"],
		["task", "Task"]
	], Vr, (e, t) => {
		let r = /* @__PURE__ */ M(() => t[0]);
		var i = du(), a = I(i), o = I(a, !0);
		O(a);
		var s = R(a);
		q(s, 21, () => u(V(r)), Vr, (e, t) => {
			var n = uu(), r = I(n);
			O(n);
			var i = {};
			z(() => {
				G(r, `${V(t).key ?? ""}${V(t).agentName ? "" : " (Missing)"}`), i !== (i = V(t).key) && (n.value = (n.__value = V(t).key) ?? "");
			}), W(e, n);
		}), O(s);
		var c;
		ui(s), O(i), z(() => {
			G(o, t[1]), Y(s, "aria-label", `${t[1]} default profile`), c !== (c = n().resourceDefaults[V(r)]) && (s.value = (s.__value = n().resourceDefaults[V(r)]) ?? "", li(s, n().resourceDefaults[V(r)]));
		}), H("change", s, (e) => l(V(r), e.currentTarget.value)), W(e, i);
	}), O(m), k(2), O(p);
	var h = R(p, 2), g = I(h), _ = R(I(g)), v = I(_);
	O(_), O(g);
	var y = R(g, 2), b = R(I(y), 2);
	q(b, 17, () => n().profiles, Vr, (e, t, n) => {
		let r = /* @__PURE__ */ M(() => i.has(V(t).key.trim().toLowerCase()));
		var o = mu();
		let l;
		var u = I(o);
		_i(u);
		var d = R(u, 2);
		_i(d);
		var f = R(d, 2);
		q(f, 21, () => c(V(t).agentName), Vr, (e, t) => {
			var n = uu(), r = I(n, !0);
			O(n);
			var i = {};
			z(() => {
				G(r, V(t).label), i !== (i = V(t).id) && (n.value = (n.__value = V(t).id) ?? "");
			}), W(e, n);
		}), O(f);
		var p;
		ui(f);
		var m = R(f, 2), h = (e) => {
			W(e, fu());
		}, g = (e) => {
			var t = pu();
			X(I(t), { name: "trash-2" }), O(t), H("click", t, () => s(n)), W(e, t);
		};
		K(m, (e) => {
			V(r) ? e(h) : e(g, -1);
		}), O(o), z(() => {
			l = J(o, 1, "settings-profile-row", null, l, { "settings-profile-system": V(r) }), vi(u, V(t).key), u.disabled = V(r), vi(d, V(t).description), d.disabled = V(r), p !== (p = V(t).agentName) && (f.value = (f.__value = V(t).agentName) ?? "", li(f, V(t).agentName));
		}), H("input", u, (e) => a(n, "key", e.currentTarget.value)), H("input", d, (e) => a(n, "description", e.currentTarget.value)), H("change", f, (e) => a(n, "agentName", e.currentTarget.value)), W(e, o);
	});
	var x = R(b, 2), S = I(x);
	_i(S);
	var C = R(S, 2);
	_i(C);
	var w = R(C, 2);
	q(w, 21, () => t.agents, Vr, (e, t) => {
		var n = uu(), r = I(n, !0);
		O(n);
		var i = {};
		z(() => {
			G(r, V(t).label), i !== (i = V(t).id) && (n.value = (n.__value = V(t).id) ?? "");
		}), W(e, n);
	}), O(w);
	var T = R(w, 2);
	X(I(T), { name: "plus" }), k(), O(T), O(x), O(y), O(h);
	var E = R(h, 2), ee = I(E);
	let te;
	var ne = I(ee, !0);
	O(ee);
	var re = R(ee);
	X(I(re), { name: "save" }), k(), O(re), O(E), O(f), z((e) => {
		G(v, `${n().profiles.length ?? ""} routes`), w.disabled = !t.agents.length, T.disabled = !t.agents.length, te = J(ee, 1, "settings-save-hint", null, te, { visible: n().dirty }), G(ne, n().dirty ? "Unsaved changes" : ""), re.disabled = e;
	}, [() => !n().dirty || !!r()]), Ci(S, () => n().newProfile.key, (e) => n(n().newProfile.key = e, !0)), Ci(C, () => n().newProfile.description, (e) => n(n().newProfile.description = e, !0)), di(w, () => n().newProfile.agentName, (e) => n(n().newProfile.agentName = e, !0)), H("click", T, o), H("click", re, d), W(e, f), j();
}
Cr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var _u = /* @__PURE__ */ U("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), vu = /* @__PURE__ */ U("<button type=\"button\"><!> <span> </span> <!></button>"), yu = /* @__PURE__ */ U("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function bu(e, t) {
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
	var r = yu();
	q(R(I(r), 2), 17, () => n, (e) => e.id, (e, n) => {
		var r = vu();
		let i;
		var a = I(r);
		X(a, { get name() {
			return V(n).icon;
		} });
		var o = R(a, 2), s = I(o, !0);
		O(o);
		var c = R(o, 2), l = (e) => {
			W(e, _u());
		};
		K(c, (e) => {
			V(n).sharesAgentDraft && e(l);
		}), O(r), z(() => {
			i = J(r, 1, "settings-tab", null, i, {
				active: t.activeTab === V(n).id,
				dirty: t.dirty && V(n).sharesAgentDraft
			}), Y(r, "aria-current", t.activeTab === V(n).id ? "page" : void 0), G(s, V(n).label);
		}), H("click", r, () => t.onSelect(V(n).id)), W(e, r);
	}), O(r), W(e, r), j();
}
Cr(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var xu = /* @__PURE__ */ U("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function Su(e, t) {
	A(t, !0);
	let n = ki(t, "draft", 15), r = ki(t, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n(n().userName = await t.onSaveUser(n().userName), !0);
			} catch (e) {
				t.onToast(ql(e));
			} finally {
				r("");
			}
		}
	}
	var a = xu(), o = R(I(a), 2), s = I(o), c = R(I(s), 2);
	_i(c), k(2), O(s);
	var l = R(s, 2), u = I(l);
	X(I(u), { name: "save" }), k(), O(u), O(l), O(o), O(a), z(() => u.disabled = r() === "user"), Sr("submit", o, i), Ci(c, () => n().userName, (e) => n(n().userName = e, !0)), W(e, a), j();
}
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var Cu = /* @__PURE__ */ U("<span class=\"settings-pill\">Active</span>"), wu = /* @__PURE__ */ U("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), Tu = /* @__PURE__ */ U("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Eu = /* @__PURE__ */ U("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), Du = /* @__PURE__ */ U("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Ou = /* @__PURE__ */ U("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function ku(e, t) {
	A(t, !0);
	let n = ki(t, "draft", 15), r = ki(t, "pending", 15), i = /* @__PURE__ */ P("");
	async function a(e) {
		if (e.preventDefault(), !(!n().workspacePath.trim() || r())) {
			r("workspace");
			try {
				await t.onAddWorkspace(Kl(n())), n(n().workspacePath = "", !0), n(n().createWorkspace = !1, !0);
			} catch (e) {
				t.onToast(ql(e));
			} finally {
				r("");
			}
		}
	}
	async function o(e) {
		if (!r()) {
			r(`remove:${e}`);
			try {
				await t.onRemoveWorkspace(e, Kl(n()));
			} catch (e) {
				t.onToast(ql(e));
			} finally {
				r("");
			}
		}
	}
	async function s(e, a) {
		if (!r()) {
			r(`icon:${e}`), F(i, "");
			try {
				await t.onWorkspaceIcon(e, a, Kl(n()));
			} catch (e) {
				t.onToast(ql(e));
			} finally {
				r("");
			}
		}
	}
	function c(e) {
		let n = t.workspaces.find((t) => t.id === e);
		return t.workspaceIcons.find((e) => e.id === (n?.icon || "")) || t.workspaceIcons[0];
	}
	var l = Ou(), u = R(I(l), 2), d = I(u);
	_i(d);
	var f = R(d, 2), p = I(f);
	_i(p), k(2), O(f);
	var m = R(f, 2), h = I(m);
	X(h, { name: "plus" });
	var g = R(h), _ = I(g, !0);
	O(g), O(m), O(u);
	var v = R(u, 2);
	q(v, 21, () => t.workspaces, (e) => e.id, (e, n) => {
		let a = /* @__PURE__ */ M(() => c(V(n).id));
		var l = Eu(), u = I(l), d = I(u), f = I(d), p = I(f);
		O(f);
		var m = R(f, 2), h = I(m), g = I(h, !0);
		O(h);
		var _ = R(h), v = I(_, !0);
		O(_), O(m), O(d);
		var y = R(d, 2), b = I(y), x = (e) => {
			W(e, Cu());
		};
		K(b, (e) => {
			V(n).id === t.activeWorkspaceId && e(x);
		});
		var S = R(b, 2), C = I(S), w = R(C, 2), T = I(w, !0);
		O(w), X(R(w, 2), { name: "chevron-down" }), O(S);
		var E = R(S, 2);
		X(I(E), { name: "trash-2" }), O(E), O(y), O(u);
		var ee = R(u, 2), te = (e) => {
			var r = Tu();
			q(r, 21, () => t.workspaceIcons, (e) => e.id, (e, t) => {
				var r = wu();
				let i;
				var o = I(r), c = R(o), l = I(c, !0);
				O(c);
				var u = R(c), d = (e) => {
					X(e, { name: "check" });
				};
				K(u, (e) => {
					V(t).id === V(a).id && e(d);
				}), O(r), z(() => {
					Y(r, "aria-checked", V(t).id === V(a).id), Y(r, "title", V(t).label), i = J(r, 1, "", null, i, { selected: V(t).id === V(a).id }), Y(o, "src", V(t).src), G(l, V(t).label);
				}), H("click", r, () => s(V(n).id, V(t).id)), W(e, r);
			}), O(r), z(() => Y(r, "aria-label", `Icon for ${V(n).name}`)), W(e, r);
		};
		K(ee, (e) => {
			V(i) === V(n).id && e(te);
		}), O(l), z((e, t) => {
			Y(p, "src", V(a).src), G(g, V(n).name), G(v, V(n).path), Y(S, "aria-expanded", V(i) === V(n).id), S.disabled = e, Y(C, "src", V(a).src), G(T, r() === `icon:${V(n).id}` ? "Saving..." : V(a).label), E.disabled = t;
		}, [() => !!r(), () => !!r()]), H("click", S, () => F(i, V(i) === V(n).id ? "" : V(n).id, !0)), H("click", E, () => o(V(n).id)), W(e, l);
	}, (e) => {
		W(e, Du());
	}), O(v), O(l), z((e) => {
		m.disabled = e, G(_, n().createWorkspace ? "Create" : "Add");
	}, [() => !!r()]), Sr("submit", u, a), Ci(d, () => n().workspacePath, (e) => n(n().workspacePath = e, !0)), wi(p, () => n().createWorkspace, (e) => n(n().createWorkspace = e, !0)), W(e, l), j();
}
Cr(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var Au = /* @__PURE__ */ U("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function ju(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(-1), a = /* @__PURE__ */ P($t(Gl(V(n)))), o = /* @__PURE__ */ P("");
	Ai(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity === V(r) ? e.dataVersion !== V(i) && !V(a).dirty && (F(i, e.dataVersion, !0), F(a, Gl(e), !0)) : (F(r, e.identity, !0), F(i, e.dataVersion, !0), F(a, Gl(e), !0), F(o, "")), queueMicrotask(e.onIconsChanged);
	})), Ai(() => {
		let e = (e) => {
			V(n).open && e.key === "Escape" && (e.preventDefault(), V(n).onClose(V(a).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function s() {
		V(a).dirty = !0;
	}
	var c = Mr(), l = L(c), u = (e) => {
		var t = Au(), r = L(t), i = R(r, 2), c = I(i);
		bu(c, {
			get activeTab() {
				return V(a).tab;
			},
			get dirty() {
				return V(a).dirty;
			},
			onSelect: (e) => V(a).tab = e
		});
		var l = R(c, 2), u = I(l);
		X(I(u), { name: "x" }), O(u);
		var d = R(u, 2), f = (e) => {
			ku(e, {
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
					F(a, e, !0);
				},
				get pending() {
					return V(o);
				},
				set pending(e) {
					F(o, e, !0);
				}
			});
		}, p = (e) => {
			Su(e, {
				get onSaveUser() {
					return V(n).onSaveUser;
				},
				get onToast() {
					return V(n).onToast;
				},
				get draft() {
					return V(a);
				},
				set draft(e) {
					F(a, e, !0);
				},
				get pending() {
					return V(o);
				},
				set pending(e) {
					F(o, e, !0);
				}
			});
		}, m = (e) => {
			ou(e, {
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
		}, h = (e) => {
			Ql(e, {
				get agentHub() {
					return V(n).agentHub;
				},
				onDirty: s,
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
					F(a, e, !0);
				},
				get pending() {
					return V(o);
				},
				set pending(e) {
					F(o, e, !0);
				}
			});
		}, g = (e) => {
			gu(e, {
				get agents() {
					return V(n).agents;
				},
				onDirty: s,
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
					F(a, e, !0);
				},
				get pending() {
					return V(o);
				},
				set pending(e) {
					F(o, e, !0);
				}
			});
		}, _ = (e) => {
			lu(e, {
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
		K(d, (e) => {
			V(a).tab === "workspace" ? e(f) : V(a).tab === "user" ? e(p, 1) : V(a).tab === "appearance" ? e(m, 2) : V(a).tab === "agenthub" ? e(h, 3) : V(a).tab === "profiles" ? e(g, 4) : e(_, -1);
		}), O(l), O(i), H("click", r, () => V(n).onClose(V(a).dirty)), H("click", u, () => V(n).onClose(V(a).dirty)), W(e, t);
	};
	K(l, (e) => {
		V(n).open && e(u);
	}), W(e, c), j();
}
Cr(["click"]);
//#endregion
//#region src/components/Toast.svelte
var Mu = /* @__PURE__ */ U("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function Nu(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(!1), i = null;
	Ai(() => {
		let e = t.channel.subscribe((e) => {
			F(n, e, !0), F(r, !!e.message, !0), i !== null && window.clearTimeout(i), V(r) && (i = window.setTimeout(() => {
				F(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = Mu(), o = I(a, !0);
	O(a), z(() => {
		Y(a, "hidden", !V(r)), G(o, V(n).message);
	}), W(e, a), j();
}
//#endregion
//#region src/components/UploadDialog.svelte
var Pu = /* @__PURE__ */ U("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), Fu = /* @__PURE__ */ U("<small class=\"upload-result-path\"> </small>"), Iu = /* @__PURE__ */ U("<small class=\"upload-error\"> </small>"), Lu = /* @__PURE__ */ U("<div><div class=\"upload-item-heading\"><span class=\"upload-item-status-icon\"><span class=\"upload-item-status upload-item-status-queued\"><!></span><span class=\"upload-item-status upload-item-status-uploading\"><!></span><span class=\"upload-item-status upload-item-status-success\"><!></span><span class=\"upload-item-status upload-item-status-error\"><!></span></span><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), Ru = /* @__PURE__ */ U("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this resource's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function zu(e, t) {
	A(t, !0);
	let n = /* @__PURE__ */ P($t(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P($t([])), a = 1, o = /* @__PURE__ */ P(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ M(() => V(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ M(() => V(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ M(() => V(i).filter((e) => e.status === "error").length);
	Ai(() => {
		let e = t.channel.subscribe((e) => {
			F(n, e, !0), e.identity !== V(r) && (d(), F(r, e.identity, !0), F(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
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
		F(i, [...V(i), ...r], !0);
		for (let e of r) g(e, V(n).identity, V(n).workspaceId, V(n).resourceId);
	}
	function h(e, t) {
		F(i, V(i).map((n) => n.id === e ? {
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
	var b = Mr(), x = L(b), S = (e) => {
		var t = Ru(), n = I(t), r = R(n, 2), a = I(r), s = R(I(a), 2);
		X(I(s), { name: "x" }), O(s), O(a);
		var d = R(a, 2), f = I(d);
		Oi(f, (e) => F(o, e), () => V(o));
		var p = R(f, 2), h = I(p);
		X(h, { name: "clipboard-paste" });
		var g = R(h, 4);
		X(I(g), { name: "folder-open" }), k(), O(g), O(p);
		var b = R(p, 2), x = I(b), S = (e) => {
			W(e, Pu());
		};
		K(x, (e) => {
			V(i).length || e(S);
		}), q(R(x, 2), 17, () => V(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ M(() => y(V(t)));
			var r = Lu();
			let i;
			var a = I(r), o = I(a), s = I(o);
			X(I(s), { name: "clock-3" }), O(s);
			var c = R(s);
			X(I(c), { name: "loader-circle" }), O(c);
			var l = R(c);
			X(I(l), { name: "circle-check" }), O(l);
			var u = R(l);
			X(I(u), { name: "triangle-alert" }), O(u), O(o);
			var d = R(o), f = I(d), p = I(f, !0);
			O(f);
			var m = R(f), h = I(m, !0);
			O(m), O(d);
			var g = R(d), _ = I(g, !0);
			O(g), O(a);
			var b = R(a, 2), x = I(b);
			let S;
			O(b);
			var C = R(b, 2), w = (e) => {
				var n = Fu(), r = I(n, !0);
				O(n), z(() => G(r, V(t).path)), W(e, n);
			};
			K(C, (e) => {
				V(t).status === "success" && e(w);
			});
			var T = R(C, 2), E = (e) => {
				var n = Iu(), r = I(n, !0);
				O(n), z(() => G(r, V(t).error || "Upload failed")), W(e, n);
			};
			K(T, (e) => {
				V(t).status === "error" && e(E);
			}), O(r), z((e) => {
				i = J(r, 1, "upload-item", null, i, {
					"upload-item-success": V(t).status === "success",
					"upload-item-error": V(t).status === "error",
					"upload-item-uploading": V(t).status === "uploading"
				}), G(p, V(t).name), G(h, e), G(_, V(n).label), Y(b, "aria-label", V(t).name), Y(b, "aria-valuenow", V(t).progress), S = ci(x, "", S, { width: `${V(t).progress}%` });
			}, [() => v(V(t).size)]), W(e, r);
		}), O(b), O(d);
		var C = R(d, 2), w = I(C), T = I(w, !0);
		O(w);
		var E = R(w, 2);
		O(C), O(r), O(t), z(() => {
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
	}), W(e, b), j();
}
Cr([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var Bu = /* @__PURE__ */ U("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div>", 1);
function Vu(e, t) {
	A(t, !0);
	var n = Bu(), r = L(n);
	ca(r, {
		get channel() {
			return t.channels.appShell;
		},
		details: (e) => {
			Ol(e, { get channel() {
				return t.channels.detail;
			} });
		},
		timeline: (e) => {
			Wl(e, { get channel() {
				return t.channels.timeline;
			} });
		},
		composer: (e) => {
			Ea(e, { get channel() {
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
	Nu(I(i), { get channel() {
		return t.channels.toast;
	} }), O(i);
	var a = R(i, 2);
	zu(I(a), { get channel() {
		return t.channels.upload;
	} }), O(a);
	var o = R(a, 2);
	mo(I(o), { get channel() {
		return t.channels.create;
	} }), O(o);
	var s = R(o, 2);
	ju(I(s), { get channel() {
		return t.channels.settings;
	} }), O(s), W(e, n), j();
}
//#endregion
//#region src/components/model-channel.ts
function Hu(e) {
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
var Q = () => void 0, Uu = async () => void 0;
function Wu() {
	return {
		appShell: Hu({
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
			onSwitchWorkspace: Uu,
			onAddWorkspace: Q,
			onCreateProject: Q,
			onOpenSettings: Q,
			onToggleProject: Uu,
			onSelectResource: Uu,
			onReorder: Uu,
			onDragState: Q,
			onToggleAttention: Uu,
			onDismissAttention: Uu,
			onPanePreview: Q,
			onPaneCommit: Q,
			onPaneViewport: Q,
			onMobileSidebar: Q,
			onMobileView: Q,
			onMobileImmersive: Q,
			onToast: Q,
			onIconsChanged: Q,
			onHistoryNavigation: Uu
		}),
		create: Hu({
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
			onPreview: Uu,
			onSubmit: Uu,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: () => !0,
			onIconsChanged: Q
		}),
		settings: Hu({
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
			onAddWorkspace: Uu,
			onRemoveWorkspace: Uu,
			onWorkspaceIcon: Uu,
			onSaveUser: async (e) => e,
			onSaveAgentHub: Uu,
			onLayoutPreference: Q,
			onFontScale: Q,
			onResetFontScales: Q,
			onBrowserNotifications: Q,
			onCompletionSound: Q,
			onToast: Q,
			onIconsChanged: Q
		}),
		upload: Hu({
			open: !1,
			identity: "",
			workspaceId: "",
			resourceId: "",
			onDone: Q,
			onIconsChanged: Q
		}),
		composer: Hu({
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
			onDraft: Q,
			onSend: async () => ({
				accepted: !1,
				clear: !1
			}),
			onOpenUpload: Q,
			onEndTurn: Q,
			onSteerWaiting: Uu,
			onSaveAgentBinding: Uu,
			onIconsChanged: Q
		}),
		detail: Hu({
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
			onNavigate: Q,
			onCreateTask: Q,
			onArchive: Q,
			onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
			onSaveAgentBinding: Uu,
			onToast: Q,
			onIconsChanged: Q
		}),
		timeline: Hu({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			agentName: "Agent",
			project: () => [],
			onEvent: Q,
			onNotice: Q,
			onApproval: Uu,
			onToast: Q,
			onIconsChanged: Q
		}),
		agentHeader: Hu({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			agentName: "Agent",
			modelSummary: "",
			turnNumber: 0,
			turnStartedAt: "",
			onIconsChanged: Q
		}),
		toast: Hu({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var Gu = "forge.gui.agentDraft.v2", Ku = 2, qu = 50, Ju = 7776e6;
function Yu(e) {
	return encodeURIComponent(String(e || "").trim());
}
function Xu(e) {
	return String(e || "").trim() || "workspace";
}
function Zu(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? qu, r = e.maxAgeMs ?? Ju;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function a(e, t) {
		let n = String(e || "").trim(), r = Xu(t);
		return !n || !r ? "" : `${Gu}.resource.${Yu(n)}.${Yu(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== Ku || typeof t.text != "string" ? null : {
				version: Ku,
				text: t.text,
				updatedAt: Number(t.updatedAt) || 0,
				workspaceId: String(t.workspaceId || ""),
				resourceId: Xu(t.resourceId),
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
				version: Ku,
				text: n,
				updatedAt: t(),
				workspaceId: r.workspaceId,
				resourceId: Xu(r.resourceId),
				generationId: String(r.generationId || "") || void 0
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = Xu(a);
		if (!c || !u) return;
		let f = `${Gu}.resource.${Yu(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || Xu(n.resourceId) !== d || o.has(t))) {
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
function Qu(e) {
	let t = Zu(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForResource(r, Xu(n));
	}
	function i(e, t) {
		let r = /* @__PURE__ */ new Set();
		return n.ttyDraftWorkspaceId === e && n.ttyDraftResourceId === t && n.ttyDraftKey && r.add(n.ttyDraftKey), r;
	}
	function a(r = e.workspaceId(), a = n.ttyDraftResourceId) {
		let o = r.trim(), s = Xu(a);
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
		let l = Xu(i), u = r(l, o);
		if (!u) return c();
		n.ttyDraftKey !== u && (n.ttyDraftKey = u, n.ttyDraftWorkspaceId = o.trim(), n.ttyDraftResourceId = l, n.ttyDraft = t.read(u), n.ttyMultiline = n.ttyDraft.includes("\n"), n.ttyDraftVersion++, a(n.ttyDraftWorkspaceId, n.ttyDraftResourceId));
	}
	function u(r) {
		return e.workspaceId() !== r.workspaceId || n.ttyDraftResourceId !== Xu(r.resourceId) || n.ttyDraftKey !== r.key || n.ttyDraft !== r.text || n.ttyDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
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
function $u(e) {
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
function ed(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function td(e) {
	let t = String(e?.id || "").trim();
	if (!t) throw Error("The created resource did not return an id.");
	return t;
}
function nd(e) {
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
function rd(e) {
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
function id(e) {
	let t = 0, n = nd(t), r = 0, i = null, a = "";
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
			previewRequestKey: (e) => JSON.stringify(rd({
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
			...nd(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = nd(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = rd({
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
			n.previewError = ed(e);
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
			if (n.type === "project") r = td(await e.request(`/api/workspaces/${i}/projects`, {
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
					t = rd(n);
				}
				r = td(await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				})), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1;
			let s = ++t;
			n.identity = s, await e.reloadTree(), i === e.workspaceId() && n.identity === s && await e.selectResource(r);
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(ed(t)));
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
function ad() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function od(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.generationId}`;
}
function sd(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function cd(e) {
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
		if (!(!e.settings().browser || ad() !== "granted")) try {
			let n = new window.Notification(od(t), {
				body: sd(t),
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
		n.browser && ad() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = ad();
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
			permission: ad(),
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
var ld = "forge.gui.notifications.v1", ud = `${ld}.settings`;
function dd(e) {
	return e && typeof e == "object" ? e : null;
}
function fd(e) {
	let t = dd(e);
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
function pd() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function md(e) {
	let t = dd(e);
	if (!t || t.version !== 1) return pd();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = dd(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(fd).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(fd).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = dd(e);
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
function hd(e) {
	let t = e.trim();
	return t ? `${ld}.state.${encodeURIComponent(t)}` : "";
}
function gd(e) {
	function t(t) {
		let n = hd(t);
		if (!e || !n) return pd();
		try {
			let t = e.getItem(n);
			if (!t) return pd();
			let r = md(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return pd();
		}
	}
	function n(t, n) {
		let r = md(n), i = hd(t);
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
			let t = dd(JSON.parse(e.getItem(ud) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(ud);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(ud, JSON.stringify({
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
function _d(e) {
	let t = String(e.completionMarker || "").trim();
	if (t) return t;
	let n = String(e.generationId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function vd(e) {
	return String(e.generationId || e.id || "").trim();
}
function yd(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function bd(e, t) {
	let n = String(e.resourceId || "").trim(), r = t.findResource(n), i = vd(e);
	return !n || !i ? null : fd({
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
function xd(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function Sd(e) {
	let t = gd(xd(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= pd(), n.store;
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
	let g = cd({
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
			let r = new t(`${ld}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), ad() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
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
			let n = fd(t.record);
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
		let a = _d(t);
		if (!a || !n.workspaceId) return !1;
		let s = bd(t, {
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
		for (let t of e) _d(t) && x(t, t.completionState || "");
	}
	function C(e, t) {
		let n = yd(e);
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
			r.key === hd(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.refreshIcons()), r.key === ud && (n.settings = t.readSettings(), ad() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
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
var Cd = "forge.gui.paneSizes", wd = "forge.gui.mobileImmersive", Td = "forge.gui.layoutPreference", Ed = "forge.gui.fontScales", Dd = 8, Od = 220, kd = 360, Ad = 320, jd = 1e4, Md = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarAttentionHeight: 210
}), Nd = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarAttentionHeight: "--sidebar-attention-height"
});
function Pd(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function Fd(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var Id = [
	"auto",
	"three",
	"two",
	"split"
];
function Ld(e) {
	return Id.includes(e) ? e : "auto";
}
var Rd = .8, zd = 1.4, Bd = 1, Vd = [
	"sidebar",
	"details",
	"chat"
], Hd = Object.freeze({
	sidebar: "--sidebar-font-scale",
	details: "--details-font-scale",
	chat: "--chat-font-scale"
});
function Ud(e) {
	return Fd(e) ? Math.round(Pd(e, Rd, zd) * 100) / 100 : Bd;
}
function Wd(e) {
	let t = e && typeof e == "object" ? e : {};
	return {
		sidebar: Ud(t.sidebar),
		details: Ud(t.details),
		chat: Ud(t.chat)
	};
}
function Gd(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...Md };
	if (Fd(n.sidebarWidth) && (r.sidebarWidth = Pd(n.sidebarWidth, Od, jd)), Fd(n.chatWidth)) r.chatWidth = Pd(n.chatWidth, Ad, jd);
	else if (Fd(n.detailsWidth) && t >= 688) {
		let e = Pd(n.detailsWidth, kd, t - Dd - Ad);
		r.chatWidth = Pd(t - Dd - e, Ad, jd);
	}
	let i = Fd(n.sidebarAttentionHeight) ? n.sidebarAttentionHeight : n.sidebarSessionHeight;
	return Fd(i) && (r.sidebarAttentionHeight = Pd(i, 84, jd)), r;
}
function Kd(e, t = window.localStorage) {
	let n = { ...Md }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = Wd(null), o = window.matchMedia("(max-width: 980px)"), s = window.matchMedia("(max-width: 1440px)");
	function c() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Cd) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function l() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Ed) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function u(e) {
		document.documentElement.style.setProperty(Hd[e], String(a[e]));
	}
	function d() {
		for (let e of Vd) u(e);
	}
	function f() {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}
	function p(e, t) {
		document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
	}
	function m(e, t) {
		if (!Object.hasOwn(Nd, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(Pd(t, r === "sidebarWidth" ? Od : r === "chatWidth" ? Ad : 84, jd));
		n[r] = i, p(Nd[r], i);
	}
	function h() {
		for (let e of Object.keys(Nd)) m(e, n[e]);
	}
	function g() {
		t?.setItem(Cd, JSON.stringify(n));
	}
	function _() {
		let u = c();
		n = Gd(u, 0), h();
		let p = Fd(u.sidebarSessionHeight) && !Fd(u.sidebarAttentionHeight);
		Fd(u.detailsWidth) && !Fd(u.chatWidth) && !o.matches && (n = Gd(u, f()), h(), p = !0), p && g();
		try {
			r.immersive = t?.getItem(wd) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = Ld(t?.getItem(Td));
		} catch {
			i = "auto";
		}
		x(), a = Wd(l()), d();
		let m = () => {
			x(), e();
		};
		o.addEventListener?.("change", m), s.addEventListener?.("change", m);
	}
	function v(e) {
		if (!Object.hasOwn(Nd, e) || !t) return;
		let r = e, i = c();
		delete i.detailsWidth, delete i.sidebarSessionHeight;
		for (let e of Object.keys(Nd)) Fd(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(Cd, JSON.stringify(i));
	}
	function y() {
		if (o.matches) return;
		let e = c();
		!Fd(e.detailsWidth) || Fd(e.chatWidth) || (n = Gd(e, f()), h(), g());
	}
	function b() {
		return o.matches ? "single" : i === "auto" ? s.matches ? "two" : "three" : i;
	}
	function x() {
		document.body.dataset.layout = b();
	}
	function S(n) {
		i = Ld(n);
		try {
			t?.setItem(Td, i);
		} catch {}
		x(), e();
	}
	function C(n, r) {
		if (Object.hasOwn(Hd, n)) {
			a[n] = Ud(r), u(n);
			try {
				t?.setItem(Ed, JSON.stringify(a));
			} catch {}
			e();
		}
	}
	function w() {
		a = Wd(null), d();
		try {
			t?.removeItem(Ed);
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
			t?.setItem(wd, r.immersive ? "1" : "0");
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
function qd(e) {
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
//#region src/controllers/route-controller.ts
function Jd(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function Yd(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: Jd(t[1]),
		resourceId: t[2] === "r" ? Jd(t[3]) : "workspace"
	} : {};
}
function Xd(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function Zd(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = Xd(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => Yd(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/controllers/settings-controller.ts
function Qd(e, t) {
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
function $d(e) {
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
			activeWorkspaceId: i.activeId || e.activeWorkspaceId(),
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
		}), await o(), e.setConfig(Qd(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: Qd
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var ef = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering",
	"stopping"
]), tf = 6e4;
function nf(e) {
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
		if (Number.isFinite(n)) return t() - n <= tf;
		if (!ef.has(e.status || "")) return !1;
		let r = new Date(e.updatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= tf;
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
		let t = (e.children || []).filter((e) => e.archived !== !0), n = t.filter((e) => ef.has(e.runtime?.status || "")).length, r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n} working`;
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
var rf = "forge.gui.user.v1", af = 1, of = 80;
function sf(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, of).join("") || "User";
}
function cf(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== af ? "User" : sf(t.name);
	} catch {
		return "User";
	}
}
function lf(e, t) {
	let n = r();
	function r() {
		try {
			return cf(window.localStorage.getItem(rf));
		} catch {
			return "User";
		}
	}
	function i(e) {
		let t = sf(e);
		try {
			window.localStorage.setItem(rf, JSON.stringify({
				version: af,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return n = t, n;
	}
	return e.listen(window, "storage", (e) => {
		e.key === rf && (n = cf(e.newValue), t());
	}), {
		current: () => n,
		save: i
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var uf = class {
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
}, df, ff = null, $ = {
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
function pf() {
	for (let e of Object.keys($.details)) delete $.details[e];
}
var mf = Qu({
	runtime: $.agent,
	workspaceId: () => $.activeWorkspaceId
}), hf = mf.clearResourceAfterAccepted, gf = mf.clearMemory, _f = mf.flush, vf = mf.restoreResource, yf = mf.update, bf = $u(() => {
	Gm && (Zp(), Fm());
}), xf = Kd(() => vp()), Sf = Zd(() => vp()), Cf = qd({
	details: $.details,
	context: () => ({
		workspaceId: $.activeWorkspaceId,
		navigationVersion: $.navigationVersion,
		selectedId: $.selectedId,
		detailRequestVersion: $.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++$.detailRequestVersion,
	isCurrentWorkspace: (e, t) => up(e, t),
	request: (e, t) => Xf(e, t)
}), wf = id({
	workspaceId: () => $.activeWorkspaceId,
	templates: (e) => $.details[e]?.templates || [],
	request: (e, t) => Xf(e, t),
	publish: (e) => df.renderCreateDialog(e),
	toast: Pm,
	reloadTree: () => Qf(),
	selectResource: (e) => xp(e),
	onOpen: () => {
		$.modalEnter = "create";
	},
	onIconsChanged: Fm,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
}), Tf = (e) => document.getElementById(e), Ef = 5e3, Df = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, Of = [
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
], kf = new Map(Of.map((e) => [e.id, e])), { applyCustomOrder: Af, moveIdInList: jf, projectTaskSummary: Mf, resourceRefText: Nf, statusModel: Pf, taskOperationalState: Ff, taskOperationalStateKey: If } = nf({
	tree: () => $.tree,
	findResource: (e) => gm(e),
	agentName: (e) => ($.config?.agents || []).find((t) => t.id === e)?.name || e || "Forge GUI"
}), Lf = 0, Rf = $d({
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
	request: (e, t) => Xf(e, t),
	publish: (e) => df.renderSettings(e),
	agentOptions: zf,
	workspaceIcons: [Df, ...Of],
	userName: Yf,
	saveUser: (e) => {
		if (!Hf) throw Error("User settings are unavailable.");
		return Hf.save(e);
	},
	appearance: () => {
		let e = xf.snapshot();
		return {
			layout: e.layout.preference,
			fontScales: e.fontScales
		};
	},
	setLayoutPreference: (e) => xf.setLayoutPreference(e),
	setFontScale: (e, t) => xf.setFontScale(e, t),
	resetFontScales: () => xf.resetFontScales(),
	notificationPreferences: () => Vf?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => Vf?.setBrowserEnabled(e),
	setCompletionSound: (e) => Vf?.setSoundEnabled(e),
	flushDraft: _f,
	resetAgentState: Hp,
	reloadWorkspaceContext: async () => {
		await ip(), await Qf();
	},
	clearWorkspaceContext: () => {
		$.tree = null, pf(), cp();
	},
	renderWorkspace: mp,
	renderAgentViews: () => {
		Tm(), Zp();
	},
	toast: Pm,
	onIconsChanged: Fm
});
function zf() {
	return Dm().map((e) => ({
		id: e.id || "",
		label: Qp(e),
		summary: Gp(e)
	}));
}
function Bf() {
	vp(), Tp(), mm(), am(), Zp(), Jp(), $p();
}
var Vf = null, Hf = null;
function Uf(e) {
	Vf?.initialize(e);
}
function Wf() {
	Vf?.establishBaseline();
}
function Gf(e = $.tree) {
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
function Kf(e) {
	Vf?.observeProjections(e);
}
function qf(e, t) {
	t && Vf?.observeEvent(e, t);
}
function Jf(e) {
	Vf?.clearResource(e);
}
function Yf() {
	return Hf?.current() || "User";
}
async function Xf(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		throw new ho(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function Zf() {
	let e = xm(), [t, n] = await Promise.all([Xf("/api/workspaces"), Xf("/api/settings/agenthub")]);
	$.config = jm(t, n), Tm(), $.activeWorkspaceId = Sm(e.workspaceId) ? e.workspaceId || "" : $.config?.activeId || $.config?.workspaces[0]?.id || "", $.selectedId = e.resourceId || "workspace", mp(), $.activeWorkspaceId ? (Uf($.activeWorkspaceId), await ip(), !e.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await Qf({ replaceURL: !0 })) : ($.navigationLoading = !1, $.tree = null, pf(), $.workspaceAgents = null, $.preview = null, $.diff = null, Hp(), cp());
}
async function Qf(e = {}) {
	if (!$.activeWorkspaceId) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.treeRequestVersion;
	$.navigationLoading = !0, $.navigationError = "", vp(), $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let i;
	try {
		i = await Xf(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw up(t, n, r) && ($.navigationLoading = !1, $.navigationError = ed(e), vp()), e;
	}
	up(t, n, r) && ($.tree = i, pf(), $.workspaceAgents = null, $.workspaceAgentsSaving = !1, $.preview = null, $.diff = null, _m(), bm(!1), $.selectedId === "workspace" ? await rp() : $.selectedId && await $f($.selectedId), up(t, n, r) && (await zp(t, lm()), up(t, n, r) && (Wf(), $.navigationLoading = !1, $.navigationError = "", cp(), e.updateURL !== !1 && Cm({ replace: !!e.replaceURL }))));
}
async function $f(e, t = {}) {
	return Cf.load(e, t);
}
function ep(e, t = $.activeWorkspaceId, n = {}) {
	return Cf.fetch(e, t);
}
function tp(e) {
	return Cf.snapshot(e);
}
function np(e) {
	return Cf.apply(e);
}
async function rp(e = {}) {
	if (!$.activeWorkspaceId || $.workspaceAgents && !e.force) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.workspaceAgentsRequestVersion;
	try {
		let e = await Xf(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!up(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = e;
	} catch (e) {
		if (!up(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: ed(e)
		};
	}
	return $.workspaceAgents;
}
async function ip(e = $.activeWorkspaceId, t = $.navigationVersion) {
	let n = await Xf(`/api/workspaces/${e}/ui-state`);
	return up(e, t) ? ($.expandedProjects = new Set(n.expandedProjects || []), $.lastResourceId = n.lastResourceId || "", $.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], $.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, !0) : !1;
}
async function ap() {
	if (!$.activeWorkspaceId) return;
	let e = $.activeWorkspaceId, t = $.navigationVersion, n = $.selectedId;
	await Xf(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...$.expandedProjects],
			lastResourceId: n,
			projectOrder: $.projectOrder,
			taskOrder: $.taskOrder
		})
	}), up(e, t) && ($.lastResourceId = n);
}
function op() {
	$.autoRefreshTimer ||= ff?.interval(() => {
		sp().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, Ef) ?? null;
}
async function sp() {
	if (!$.activeWorkspaceId || $.autoRefreshInFlight || $.listDrag) return;
	let e = $.autoRefreshVersion, t = $.activeWorkspaceId, n = $.navigationVersion, r = $.selectedId;
	$.autoRefreshInFlight = !0;
	try {
		let i = await Fp(t);
		if (!i || !dp(t, n, e)) return;
		let a = !Mm($.tree, i);
		if (a && ($.tree = i), Kf(Gf(i)), a && $.preview?.section === "Wiki" && !$.preview.loading && (await Ap("Wiki", $.preview.path), !dp(t, n, e))) return;
		_m() && (Cm({ replace: !0 }), a = !0, r = $.selectedId);
		let o = $.expandedProjects.size;
		if (bm(!1), a ||= o !== $.expandedProjects.size, $.selectedId === "workspace") {
			let r = $.workspaceAgents;
			if (await rp({ force: !0 }), !dp(t, n, e)) return;
			Mm(r, $.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++$.detailRequestVersion, o = await ep(r, t);
			if (!dp(t, n, e) || $.selectedId !== r || i !== $.detailRequestVersion) return;
			let s = tp(r);
			np(o), Mm(s, tp(r)) || (a = !0);
		}
		Kf(Gf(i)), await zp(t, lm()) && (a = !0), If() !== $.taskOperationalStateKey && (a = !0), a && cp();
	} finally {
		$.autoRefreshInFlight = !1;
	}
}
function cp() {
	vp(), Tp(), Jp(), Fm(), mm(), $p();
}
function lp() {
	vp(), Tp(), Jp(), Fm(), mm();
}
function up(e, t, n = null) {
	return e === $.activeWorkspaceId && t === $.navigationVersion && (n == null || n === $.treeRequestVersion);
}
function dp(e, t, n) {
	return up(e, t) && n === $.autoRefreshVersion;
}
function fp(e) {
	return kf.get(String(e?.icon || "").trim()) || Df;
}
function pp(e) {
	let t = fp(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function mp() {
	let e = $.config?.workspaces?.find((e) => e.id === $.activeWorkspaceId);
	pp(e), vp();
}
function hp(e, t, n = "") {
	let r = Ff(e), i = t === "project" && ym(e.id), a = t === "project" ? Mf(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: Nf(e.id),
		active: $.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: Pf(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? Af(e.children || [], $.taskOrder[e.id]).map((t) => hp(t, "task", e.id)) : [],
		projectId: n,
		followed: !!e.attention?.followed
	};
}
function gp(e) {
	if (!e) return null;
	let t = Ff(e);
	return {
		id: e.id || "scheduler",
		type: "scheduler",
		title: e.title || "Scheduler",
		ref: "",
		active: $.selectedId === (e.id || "scheduler"),
		expanded: !1,
		ariaLabel: ["Scheduler", t.label].filter(Boolean).join(". "),
		statusLabel: t.label || "Workspace Scheduler",
		status: Pf(t.statusPresentation),
		summary: null,
		children: []
	};
}
function _p(e) {
	let t = Ff(e), n = e.type === "scheduler" || e.type === "project" || e.type === "task" ? e.type : "workspace", r = e.title || e.id;
	return {
		id: e.id,
		type: n,
		title: r,
		ref: n === "project" || n === "task" ? Nf(e.id) : "",
		selected: $.selectedId === e.id,
		activeTurn: !!e.runtime?.activeTurn,
		followed: !!e.attention?.followed,
		turnNumber: Number(e.runtime?.turnNumber) || 0,
		agentName: String(e.runtime?.agentName || "").trim(),
		statusLabel: t.label || (e.attention?.followed ? "Focused resource" : "Active turn"),
		status: Pf(t.statusPresentation)
	};
}
function vp() {
	let e = $.tree ? Af($.tree.projects || [], $.projectOrder).map((e) => hp(e, "project")) : [], t = $.tree?.attentionList?.map((e) => _p(e)) || [];
	$.tree && ($.taskOperationalStateKey = If()), df.renderAppShell({
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
			iconSrc: fp(e).src
		})),
		scheduler: gp($.tree?.scheduler),
		projects: e,
		attentionList: t,
		...xf.snapshot(),
		route: Sf.projection(),
		onSwitchWorkspace: (e) => yp(e),
		onAddWorkspace: () => Am("workspace").catch((e) => Pm(e.message)),
		onCreateProject: () => um(),
		onOpenSettings: () => Am().catch((e) => Pm(e.message)),
		onToggleProject: (e) => Sp(e),
		onSelectResource: (e) => xp(e),
		onReorder: (e, t, n) => bp(e, t, n),
		onDragState: (e) => {
			$.listDrag = e;
		},
		onToggleAttention: (e, t) => Lp(e, t),
		onDismissAttention: (e) => Rp(e),
		onPanePreview: (e, t) => Rm(e, t),
		onPaneCommit: (e) => zm(e),
		onPaneViewport: () => Bm(),
		onMobileSidebar: (e) => Vm(e),
		onMobileView: (e) => Hm(e),
		onMobileImmersive: (e) => Um(e),
		onHistoryNavigation: (e) => Ym(e),
		onToast: Pm,
		onIconsChanged: Fm
	});
}
async function yp(e) {
	if (!Sm(e)) return;
	if ($.workspaceMenuOpen = !1, e === $.activeWorkspaceId) {
		mp();
		return;
	}
	Vm(!1), _f(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let t = $.navigationVersion;
	await ap().catch((e) => console.warn("failed to save UI state", e)), $.activeWorkspaceId = e, $.selectedId = "workspace", $.tree = null, $.navigationLoading = !0, $.navigationError = "", pf(), Uf(e), kp(), $.workspaceAgentsSaving = !1, pm(), Hp(), mp(), await ip(e, t) && ($.selectedId = $.lastResourceId || "workspace", await Qf());
}
async function bp(e, t, n) {
	let r = {
		projectOrder: [...$.projectOrder],
		taskOrder: Object.fromEntries(Object.entries($.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []]))
	};
	if (e.kind === "task") {
		let r = gm(e.projectId);
		if (!r) return;
		let i = Af(r.children || [], $.taskOrder[e.projectId]);
		$.taskOrder = {
			...$.taskOrder,
			[e.projectId]: jf(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") $.projectOrder = jf(Af($.tree?.projects || [], $.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	vp();
	try {
		await ap();
	} catch (e) {
		throw $.projectOrder = r.projectOrder, $.taskOrder = r.taskOrder, vp(), e;
	}
}
async function xp(e, t = {}) {
	let n = $.selectedId !== e;
	t.clearUnread !== !1 && Jf(e);
	let r = n || !!t.forceDetail;
	r && ($.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, e !== "workspace" && Cf.reset(e)), n && ($.workspaceAgentsSaving = !1, _f(), rm(), $.preview = null, $.diff = null, gf(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = ""), $.selectedId = e, Vm(!1), bm(!1), Cm(), ap().catch((e) => console.warn("failed to save UI state", e)), lp(), await Promise.all([e === "workspace" ? rp({ force: !!t.forceDetail }) : $f(e, { force: r }), zp($.activeWorkspaceId, e)]), up($.activeWorkspaceId, $.navigationVersion) && lp();
}
async function Sp(e) {
	$.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), vp();
	try {
		await ap();
	} catch (t) {
		throw $.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), vp(), t;
	}
}
function Cp() {
	let e = $.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${$.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: wm(),
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
		} : gm($.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: zf(),
		onNavigate: (e) => Ep(e).catch((e) => Pm(ed(e))),
		onCreateTask: (e) => dm(e),
		onArchive: (e) => hm(e).catch((e) => Pm(ed(e))),
		onSaveWorkspaceAgents: (e, t) => jp(e, t),
		onSaveAgentBinding: async (t) => {
			let n = $.selectedId || "workspace";
			await Xf(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await Qf({ updateURL: !1 }), n !== "workspace" && await $f(n, { force: !0 }), cp(), Pm("Resource agent binding saved.");
		},
		onRefreshScheduler: async () => {
			await Qf({ updateURL: !1 }), $.selectedId === "scheduler" && await $f("scheduler", { force: !0 }), cp();
		},
		onToast: Pm,
		onIconsChanged: Fm
	};
	if (!$.tree) return t;
	if ($.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: wm()
	};
	let n = gm($.selectedId) || $.tree.scheduler || $.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: wm()
	};
	let r = $.details[n.id] || null, i = vm(n.id);
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
		detail: wp(r)
	};
}
function wp(e) {
	return !e || e.type !== "scheduler" && e.type !== "project" && e.type !== "task" ? null : {
		...e,
		type: e.type,
		title: e.title || e.id,
		path: e.path || ""
	};
}
function Tp() {
	df.renderDetailPanel(Cp());
}
async function Ep(e) {
	await xp(e, { forceDetail: e === $.selectedId && e !== "workspace" });
}
function Dp(e) {
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
function Op(e) {
	return Dp(e || "").trim();
}
function kp() {
	$.workspaceAgentsDraft = "", $.workspaceAgentsDirty = !1;
}
async function Ap(e, t, n = {}) {
	let r = n.workspaceId || $.activeWorkspaceId, i = n.requestVersion || ++$.previewRequestVersion;
	try {
		let n = await Xf(Pp(e, t, r));
		return r !== $.activeWorkspaceId || i !== $.previewRequestVersion || $.preview?.section !== e || $.preview?.path !== t ? null : ($.preview = {
			section: e,
			...n
		}, $.preview);
	} catch (a) {
		let o = r === $.activeWorkspaceId && i === $.previewRequestVersion && $.preview?.section === e && $.preview?.path === t;
		if (o && ($.preview = {
			section: e,
			path: t,
			error: ed(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function jp(e, t) {
	if (!$.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = $.activeWorkspaceId, r = $.navigationVersion, i = await Xf(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!up(n, r) || $.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return $.workspaceAgents = i, $.workspaceAgentsDraft = Op(i.content || ""), $.workspaceAgentsDirty = !1, i;
}
function Mp() {
	$.previewRequestVersion++, $.preview = null, cp();
}
function Np() {
	$.diffRequestVersion++, $.diff = null, cp();
}
function Pp(e, t, n = $.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
async function Fp(e = $.activeWorkspaceId) {
	let t = ++$.treeRequestVersion, n = $.navigationVersion, r = await Xf(`/api/workspaces/${e}/tree`);
	return up(e, n, t) ? r : null;
}
async function Ip() {
	if (!$.activeWorkspaceId || !$.tree) return;
	let e = await Fp($.activeWorkspaceId);
	e && ($.tree = e);
}
async function Lp(e, t) {
	let n = $.activeWorkspaceId;
	!n || !e || (await Xf(`/api/workspaces/${encodeURIComponent(n)}/resources/${encodeURIComponent(e)}/attention`, {
		method: "PUT",
		body: JSON.stringify({ followed: t })
	}), await Ip(), cp());
}
async function Rp(e) {
	let t = $.activeWorkspaceId;
	!t || !e || (await Xf(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(e)}/attention/dismiss`, { method: "POST" }), await Ip(), cp());
}
async function zp(e = $.activeWorkspaceId, t = lm()) {
	if (!e || !t) return !1;
	let n = ++$.messageStatusRequestVersion, r = `${e}:${t}`, i = await Xf(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/status`);
	if (n !== $.messageStatusRequestVersion || e !== $.activeWorkspaceId || t !== lm()) return !1;
	let a = $.messageStatusKey !== r || !Mm($.messageStatus, i);
	return $.messageStatusKey = r, $.messageStatus = i, a;
}
async function Bp(e) {
	if (!e || $.steeringMessageId) return;
	let t = $.activeWorkspaceId, n = lm();
	$.steeringMessageId = e, Zp();
	try {
		await Xf(`/api/workspaces/${encodeURIComponent(t)}/messages/${encodeURIComponent(e)}/steer`, { method: "POST" }), await zp(t, n), t === $.activeWorkspaceId && n === lm() && (cp(), Pm("Message inserted into the current turn."));
	} catch (e) {
		try {
			await zp(t, n);
		} catch {}
		throw e;
	} finally {
		$.steeringMessageId === e && ($.steeringMessageId = "", Zp());
	}
}
async function Vp() {
	_f(), bf.reset(), gf(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, await zp();
}
function Hp() {
	_f(), rm(), $.agent.optionsOpen = !1, $.agent.historyOpen = !1, gf(), bf.reset(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = "", $.agent.toolGroupOpen.clear(), $.agent.approvalDrafts.clear(), $.agent.renderDeferredForSelection = !1, Wp();
}
function Up(e, t, n) {
	if (e !== $.activeWorkspaceId || t !== lm() || !n) return;
	let r = gm(t)?.runtime || $.messageStatus?.generation;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && qf(n, r?.generationId ? {
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
	].includes(n.type) && zp().then(cp).catch((e) => console.warn("agent refresh failed", e));
}
function Wp() {
	$.agent.renderTimer && window.clearTimeout($.agent.renderTimer), $.agent.renderTimer = null;
}
function Gp(e) {
	if (!e) return "";
	let t = [Kp(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function Kp(e) {
	return ($.config?.agentHubProviders || Rf.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function qp(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function Jp(e = {}) {
	Zp();
	let t = lm(), n = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, r = ($.config?.agents || []).find((e) => e.id === n?.resolvedAgent) || Em(), i = gm(t)?.runtime;
	df.renderAgentPanelHeader({
		identity: `${$.activeWorkspaceId}:${t}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: Qp(r),
		modelSummary: Gp(r),
		turnNumber: Number(n?.generation?.turnNumber) || Number(i?.turnNumber) || 0,
		turnStartedAt: String(i?.turnStartedAt || ""),
		onIconsChanged: Fm
	}), df.renderEventTimeline({
		identity: `${$.activeWorkspaceId}:${t}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: Qp(r),
		project: Es,
		onEvent: Up,
		onNotice: () => {},
		onApproval: sm,
		onToast: Pm,
		onIconsChanged: Fm
	});
}
function Yp(e, t) {
	return `${e || "workspace"}:${t || "resource"}`;
}
var Xp = "";
function Zp(e = {}) {
	$.agent.skipTTYDraftSync = !1;
	let t = lm();
	$.activeWorkspaceId && t && vf(t);
	let n = bf.active("turn-stop") && bf.key("turn-stop") === t, r = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, i = $.activeWorkspaceId;
	df.renderComposer({
		identity: `${$.activeWorkspaceId}:${t}:${$.agent.ttyDraftKey || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		draft: $.agent.ttyDraft || "",
		draftKey: $.agent.ttyDraftKey || "",
		draftResetVersion: $.agent.ttyDraftResetVersion || 0,
		unavailableReason: r ? r.acceptsMessages ? "" : r.archived ? "This resource is archived." : r.configError || "This resource cannot accept messages." : "Loading work status.",
		sending: bf.isSending(Yp($.activeWorkspaceId, t)),
		canEndTurn: !!(n || ["running", "waiting_approval"].includes(String(r?.session?.state || ""))),
		endingTurn: n,
		waitingMessages: r?.waitingMessages || [],
		canSteerWaiting: !!r?.canSteerWaiting,
		steeringMessageId: $.steeringMessageId,
		agentBinding: t === "workspace" ? $.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : gm(t)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: zf(),
		bindingSaving: Xp === t,
		onDraft: (e, t) => em(e, t),
		onSend: cm,
		onOpenUpload: tm,
		onEndTurn: () => om().catch((e) => Pm(e.message)),
		onSteerWaiting: Bp,
		onSaveAgentBinding: async (e) => {
			if (t === lm()) {
				Xp = t, Zp();
				try {
					await Xf(`/api/workspaces/${encodeURIComponent(i)}/resources/${encodeURIComponent(t)}/agent-binding`, {
						method: "PUT",
						body: JSON.stringify(e)
					}), await Qf({ updateURL: !1 }), t !== "workspace" && await $f(t, { force: !0 }), cp(), Pm("Resource agent binding saved.");
				} catch (e) {
					Pm(ed(e));
				} finally {
					Xp = "", Zp();
				}
			}
		},
		onIconsChanged: Fm
	});
}
function Qp(e) {
	return e?.name || e?.id || "Agent";
}
function $p() {
	Rf.render();
}
function em(e, t) {
	!t || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== lm() || t.draftKey !== $.agent.ttyDraftKey || yf(e);
}
function tm() {
	let e = lm();
	if (!e || $.messageStatus?.archived) {
		Pm("Select an active resource before uploading files.");
		return;
	}
	let t = Tf("ttyInput");
	t && yf(t.value), $.modalEnter = "upload", $.uploadDialog = {
		open: !0,
		identity: ++Lf,
		resourceId: e,
		items: [],
		nextId: 1
	}, am();
}
function nm(e = [], t = {}) {
	if (!$.uploadDialog.open) return;
	let n = $.uploadDialog.resourceId === lm(), r = !t.workspaceId || t.workspaceId === $.activeWorkspaceId, i = e.length > 0 && r && n;
	i && (yf(im($.agent.ttyDraft, e)), $.agent.ttyDraftResetVersion++), rm();
	let a = Tf("ttyComposer");
	a && delete a.dataset.composerKey, Zp({ skipDraftSync: i }), Tf("ttyInput")?.focus({ preventScroll: !0 }), Fm();
}
function rm() {
	$.uploadDialog = {
		open: !1,
		identity: ++Lf,
		resourceId: "",
		items: [],
		nextId: 1
	}, am();
}
function im(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function am() {
	let e = $.uploadDialog;
	df.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${$.activeWorkspaceId}:${e.resourceId || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: e.resourceId || "",
		onDone: nm,
		onIconsChanged: Fm
	});
}
async function om() {
	let e = $.activeWorkspaceId, t = lm(), n = $.messageStatus?.generation?.generationId || "", r = bf.begin("turn-stop", t);
	if (r) try {
		let r = n ? `?generationId=${encodeURIComponent(n)}` : "";
		await Xf(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/turn/end${r}`, { method: "POST" }), await zp(e, t), cp();
	} finally {
		bf.finish(r);
	}
}
async function sm(e, t, n) {
	let r = $.activeWorkspaceId, i = lm();
	await Xf(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/approval?generationId=${encodeURIComponent(e)}`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), await zp(r, i), cp();
}
async function cm(e, t) {
	if (!e.trim() || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== lm() || t.draftKey !== $.agent.ttyDraftKey) return {
		accepted: !1,
		clear: !1
	};
	let n = Yp(t.workspaceId, t.resourceId);
	if (!bf.startSending(n)) return {
		accepted: !1,
		clear: !1
	};
	let r = $.agent.ttyDraftVersion;
	try {
		await Xf(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/resources/${encodeURIComponent(t.resourceId)}/messages`, {
			method: "POST",
			body: JSON.stringify({
				text: e,
				role: "user",
				sender: { name: Yf() }
			})
		});
		let n = hf({
			workspaceId: t.workspaceId,
			resourceId: t.resourceId,
			key: t.draftKey,
			text: e,
			version: r
		});
		return n && $.agent.ttyDraftResetVersion++, await Promise.all([zp(t.workspaceId, t.resourceId), Ip()]), cp(), {
			accepted: !0,
			clear: n
		};
	} finally {
		bf.stopSending(n);
	}
}
function lm() {
	return $.selectedId === "workspace" ? "workspace" : gm($.selectedId)?.id || "";
}
function um() {
	fm("project");
}
function dm(e) {
	fm("task", e);
}
function fm(e, t = "") {
	wf.open(e === "task" ? "task" : "project", t);
}
function pm() {
	wf.close();
}
function mm() {
	wf.render();
}
async function hm(e) {
	let t = (await Xf(`/api/workspaces/${$.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	})).warnings || [];
	Pm(t.length > 0 ? ["Archived.", ...t.map((e) => `Warning: ${e.message}`)].join("\n") : "Archived."), $.selectedId = "workspace", await Qf();
}
function gm(e) {
	if (!$.tree) return null;
	if ($.tree.scheduler?.id === e) return $.tree.scheduler;
	for (let t of $.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function _m() {
	return $.selectedId === "workspace" || gm($.selectedId) ? !1 : ($.selectedId = "workspace", !0);
}
function vm(e) {
	if (!$.tree) return null;
	for (let t of $.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function ym(e) {
	return $.expandedProjects.has(e);
}
function bm(e = !1) {
	let t = vm($.selectedId);
	!t || t.id === $.selectedId || $.expandedProjects.has(t.id) || ($.expandedProjects.add(t.id), e && ap().catch((e) => Pm(e.message)));
}
function xm(e = window.location.pathname) {
	return Sf.parse(e);
}
function Sm(e) {
	return !!(e && $.config?.workspaces.some((t) => t.id === e));
}
function Cm(e = {}) {
	Sf.project($.activeWorkspaceId, $.selectedId, e);
}
function wm() {
	return $.config?.workspaces.find((e) => e.id === $.activeWorkspaceId)?.name || "Workspace";
}
function Tm() {
	let e = Dm(), t = Om();
	e.some((e) => e.id === $.agent.agentName) || ($.agent.agentName = t);
}
function Em() {
	let e = Dm(), t = $.agent.agentName || Om();
	return e.find((e) => e.id === t) || e[0] || null;
}
function Dm() {
	return ($.config?.agents || []).filter((e) => e.available !== !1);
}
function Om() {
	let e = Dm();
	return km($.config?.agentProfiles, "default") || km(Rf.profiles(), "default") || e[0]?.id || "";
}
function km(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function Am(e = "workspace") {
	return Rf.open(e);
}
function jm(e, t) {
	return Rf.withAgentHubCatalog(e, t);
}
function Mm(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var Nm = 0;
function Pm(e) {
	df.renderToast({
		message: String(e || ""),
		revision: ++Nm
	});
}
function Fm() {
	let e = window.lucide;
	!e || $.iconRefreshScheduled || ($.iconRefreshScheduled = !0, ff?.animationFrame(() => {
		$.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function Im(e) {
	Fm(), e === "markdown" && window.marked && window.DOMPurify && (Tp(), Fm()), e === "diff" && Tp();
}
window.forgeAssetLoaded = Im;
function Lm() {
	xf.initialize();
}
function Rm(e, t) {
	xf.previewPane(e, t);
}
function zm(e) {
	xf.commitPane(e);
}
function Bm() {
	xf.syncViewport();
}
function Vm(e) {
	xf.setMobileSidebar(e);
}
function Hm(e) {
	xf.setMobileView(e);
}
function Um(e) {
	xf.setMobileImmersive(e);
}
function Wm() {
	ff?.listen(document, "selectionchange", () => {
		if (!$.agent.renderDeferredForSelection) return;
		let e = Tf("ttyLog");
		e && qp(e) || ($.agent.renderDeferredForSelection = !1, Jp(), Fm());
	}), ff?.listen(document, "keydown", (e) => {
		e.key === "Escape" && $.diff ? Np() : e.key === "Escape" && $.preview ? Mp() : e.key === "Escape" && ($.agent.optionsOpen || $.agent.historyOpen) && ($.agent.optionsOpen = !1, $.agent.historyOpen = !1, Zp(), Fm());
	}), ff?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Ep(n.dataset.breadcrumbResource || "workspace").catch((e) => Pm(ed(e)));
			return;
		}
		($.agent.optionsOpen || $.agent.historyOpen) && t && !t.closest(".tty-composer") && ($.agent.optionsOpen = !1, $.agent.historyOpen = !1, Zp(), Fm()), Fm();
	}), ff?.listen(window, "beforeunload", qm), ff?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && qm();
	});
}
var Gm = !1;
function Km(e) {
	if (df = e, Gm) {
		Bf();
		return;
	}
	Gm = !0;
	let t = new uf();
	ff = t, Vf = Sd({
		scope: t,
		selectedResourceId: () => $.selectedId,
		resourceProjections: () => Gf(),
		hasTree: () => !!$.tree,
		findResource: gm,
		selectResource: xp,
		notificationsSettingsVisible: () => Rf.isOpenTab("notifications"),
		renderSettings: $p,
		refreshIcons: Fm,
		flushDraft: qm
	}), Hf = lf(t, () => {
		Rf.isOpenTab("user") && $p();
	}), Wm(), Lm(), Vf.install(), vp(), Zf().catch((e) => {
		$.navigationLoading = !1, $.navigationError = e.message, Pm(e.message), cp();
	}), op();
}
function qm() {
	_f();
}
function Jm() {
	Gm && (qm(), Gm = !1, Vf?.dispose(), Vf = null, Hf = null, bf.reset(), Wp(), wf.dispose(), ff?.dispose(), ff = null, $.autoRefreshTimer = null);
}
async function Ym(e) {
	let t = xm(e);
	if (!Sm(t.workspaceId)) {
		Cm({ replace: !0 });
		return;
	}
	let n = $.activeWorkspaceId !== t.workspaceId, r = $.selectedId;
	_f(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, $.workspaceAgentsSaving = !1;
	let i = $.navigationVersion;
	if ($.activeWorkspaceId = t.workspaceId || "", $.selectedId = t.resourceId || "workspace", !n && r !== $.selectedId && $.selectedId !== "workspace" && (Cf.reset($.selectedId), delete $.details[$.selectedId]), $.preview = null, $.diff = null, n && ($.tree = null, $.navigationLoading = !0, $.navigationError = "", kp(), $.workspaceAgentsSaving = !1, pm(), Uf($.activeWorkspaceId)), n && Hp(), mp(), n) {
		if (!await ip(t.workspaceId || "", i)) return;
		!t.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await Qf({ updateURL: !1 }), up(t.workspaceId || "", i) && Cm({ replace: !0 });
	} else {
		let e = _m();
		if ($.selectedId === "workspace" ? await rp() : (bm(!1), await $f($.selectedId)), !up(t.workspaceId || "", i)) return;
		r !== $.selectedId && await Vp(), cp(), e && Cm({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var Xm = Wu(), Zm = {
	renderAppShell: Xm.appShell.publish,
	renderCreateDialog: Xm.create.publish,
	renderSettings: Xm.settings.publish,
	renderUploadDialog: Xm.upload.publish,
	renderComposer: Xm.composer.publish,
	renderEventTimeline: Xm.timeline.publish,
	renderAgentPanelHeader: Xm.agentHeader.publish,
	renderDetailPanel: Xm.detail.publish,
	renderToast: Xm.toast.publish
}, Qm = null;
async function $m() {
	if (Qm) return;
	let e = document.getElementById("app");
	if (!e) throw Error("Forge application root is unavailable.");
	e.dataset.componentOwner = "app-shell", Qm = Nr(Vu, {
		target: e,
		props: { channels: Xm }
	}), Km(Zm);
}
async function eh() {
	if (Jm(), !Qm) return;
	let e = Qm;
	Qm = null, await Lr(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void eh()), window.addEventListener("pageshow", (e) => {
	e.persisted && $m();
}), $m().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
