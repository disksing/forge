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
var m = 1024, h = 2048, g = 4096, _ = 8192, v = 16384, y = 32768, b = 1 << 25, x = 65536, S = 1 << 19, C = 1 << 20, w = 1 << 25, T = 65536, E = 1 << 21, D = 1 << 22, ee = 1 << 23, te = Symbol("$state"), ne = Symbol("legacy props"), re = Symbol(""), ie = Symbol("attributes"), ae = Symbol("class"), oe = Symbol("style"), se = Symbol("text"), ce = Symbol("form reset"), le = new class extends Error {
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
var k;
function Ne(e) {
	if (e === null) throw ke(), Ce;
	return k = e;
}
function Pe() {
	return Ne(/* @__PURE__ */ ln(k));
}
function A(e) {
	if (O) {
		if (/* @__PURE__ */ ln(k) !== null) throw ke(), Ce;
		k = e;
	}
}
function j(e = 1) {
	if (O) {
		for (var t = e, n = k; t--;) n = /* @__PURE__ */ ln(n);
		k = n;
	}
}
function Fe(e = !0) {
	for (var t = 0, n = k;;) {
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
function Ie(e) {
	if (!e || e.nodeType !== 8) throw ke(), Ce;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Le(e) {
	return e === this.v;
}
function Re(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function ze(e) {
	return !Re(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var Be = null;
function Ve(e) {
	Be = e;
}
function He(e, t = !1, n) {
	Be = {
		p: Be,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: H,
		l: null
	};
}
function Ue(e) {
	var t = Be, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) bn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Be = t.p, e ?? {};
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
	var t = H;
	if (t === null) return V.f |= ee, e;
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
	O && /* @__PURE__ */ cn(e) !== null && un(e);
}
var at = !1;
function ot() {
	at || (at = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ce]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function st(e) {
	var t = V, n = H;
	Un(null), Wn(null);
	try {
		return e();
	} finally {
		Un(t), Wn(n);
	}
}
function ct(e, t, n, r = n) {
	e.addEventListener(t, () => st(n));
	let i = e[ce];
	e[ce] = i ? () => {
		i(), r(!0);
	} : () => r(!0), ot();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function lt(e) {
	let t = 0, n = qt(0), r;
	return () => {
		_n() && (U(n), wn(() => (t === 0 && (r = dr(() => e(() => Zt(n)))), t += 1, () => {
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
	#t = O ? k : null;
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
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Tn(() => {
			if (O) {
				let e = this.#t;
				Pe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ut), O && (this.#e = k);
	}
	#g() {
		try {
			this.#a = En(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		qe(r), t && (this.#s = En(() => {
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
			t = !0, n && Se(), this.#s !== null && Nn(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = En(() => e(this.#e)), qe(() => {
			var e = this.#c = document.createDocumentFragment(), t = sn();
			e.append(t), this.#a = this.#S(() => En(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Nn(this.#o, () => {
				this.#o = null;
			}), this.#x(N));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = En(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Ln(this.#a, e);
				let t = this.#n.pending;
				this.#o = En(() => t(this.#e));
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
		var t = H, n = V, r = Be;
		Wn(this.#i), Un(this.#i), Ve(this.#i.ctx);
		try {
			return It.ensure(), e();
		} catch (e) {
			return Ye(e), null;
		} finally {
			Wn(t), Un(n), Ve(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && Nn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, qe(() => {
			this.#d = !1, this.#m && Yt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), U(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		N?.is_fork ? (this.#a && N.skip_effect(this.#a), this.#o && N.skip_effect(this.#o), this.#s && N.skip_effect(this.#s), N.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (An(this.#a), null), this.#o &&= (An(this.#o), null), this.#s &&= (An(this.#s), null), O && (Ne(this.#t), j(), Ne(Fe()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return En(() => {
						var r = H;
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
	var s = H, c = mt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = H, t = V, n = Be, r = N;
	return function(i = !0) {
		Wn(e), Un(t), Ve(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ht(e = !0) {
	Wn(null), Un(null), Ve(null), e && N?.deactivate();
}
function gt() {
	var e = H, t = e.b, n = N, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function _t(e) {
	var t = 2 | h;
	return H !== null && (H.f |= S), {
		ctx: Be,
		deps: null,
		effects: null,
		equals: Le,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: we,
		wv: 0,
		parent: H,
		ac: null
	};
}
var vt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function yt(e, t, n) {
	let r = H;
	r === null && fe();
	var i = void 0, a = qt(we), o = !V, s = /* @__PURE__ */ new Set();
	return Cn(() => {
		var t = H, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== le && n.reject(e);
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
			l?.(), s.delete(n), t !== vt && (c.activate(), t ? (a.f |= ee, Yt(a, t)) : (a.f & 8388608 && (a.f ^= ee), Yt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), vn(() => {
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
	return Kn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function bt(e) {
	let t = /* @__PURE__ */ _t(e);
	return t.equals = ze, t;
}
function xt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) An(t[n]);
	}
}
function St(e) {
	var t, n = H, r = e.parent;
	if (!Bn && r !== null && e.v !== we && r.f & 24576) return Oe(), e.v;
	Wn(r);
	try {
		e.f &= ~T, xt(e), t = ir(e);
	} finally {
		Wn(n);
	}
	return t;
}
function Ct(e) {
	var t = St(e);
	if (!e.equals(t) && (e.wv = tr(), (!N?.is_fork || e.deps === null) && (N === null ? e.v = t : (N.capture(e, t, !0), Dt?.capture(e, t, !0)), e.deps === null))) {
		Qe(e, m);
		return;
	}
	Bn || (Ot === null ? $e(e) : (_n() || N?.is_fork) && Ot.set(e, t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && st(() => {
		t.ac.abort(le), t.ac = null;
	}), t.fn !== null && (t.teardown = d), or(t, 0), On(t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && sr(t);
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
				a ? r.f ^= m : i & 4 ? t.push(r) : nr(r) && (i & 16 && this.#d.add(r), sr(r));
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
		e.v !== we && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Ot?.set(e, t)), this.is_fork || (e.v = t);
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
			if (Mt !== null && t === H && (V === null || !(V.f & 2))) return;
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
		_e();
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
			if (!(r.f & 24576) && nr(r) && (zt = /* @__PURE__ */ new Set(), sr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mn(r), zt?.size > 0)) {
				Gt.clear();
				for (let e of zt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) zt.has(n) && (zt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || sr(n);
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
		equals: Le,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function P(e, t) {
	let n = qt(e, t);
	return Kn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Jt(e, t = !1, n = !0) {
	let r = qt(e);
	return t || (r.equals = ze), r;
}
function F(e, t, n = !1) {
	return V !== null && (!Hn || V.f & 131072) && We() && V.f & 4325394 && (Gn === null || !Gn.has(e)) && xe(), Yt(e, n ? I(t) : t, Nt);
}
function Yt(e, t, n = null) {
	if (!e.equals(t)) {
		Gt.set(e, Bn ? t : e.v);
		var r = It.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && St(t), Ot === null && $e(t);
		}
		e.wv = tr(), Qt(e, h, n), We() && H !== null && H.f & 1024 && !(H.f & 96) && (Yn === null ? Xn([e]) : Yn.push(e)), !r.is_fork && Wt.size > 0 && !Kt && Xt();
	}
	return t;
}
function Xt() {
	Kt = !1;
	for (let e of Wt) {
		e.f & 1024 && Qe(e, g);
		let t;
		try {
			t = nr(e);
		} catch {
			t = !0;
		}
		t && sr(e);
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
		if (!(!i && s === H)) {
			var l = (c & h) === 0;
			if (l && Qe(s, t), c & 131072) Wt.add(s);
			else if (c & 2) {
				var u = s;
				Ot?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= T), Qt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && zt !== null && zt.add(d), n === null ? Vt(d) : n.push(d);
			}
		}
	}
}
function I(t) {
	if (typeof t != "object" || !t || te in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ P(0), u = null, d = $n, f = (e) => {
		if ($n === d) return e();
		var t = V, n = $n;
		Un(null), er(d);
		var r = e();
		return Un(t), er(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ P(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ye();
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
					let e = f(() => /* @__PURE__ */ P(we, u));
					r.set(t, e), Zt(o);
				}
			} else F(n, we), Zt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === te) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ P(I(s ? e[n] : we), u)), r.set(n, o)), o !== void 0) {
				var c = U(o);
				return c === we ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = U(i));
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
			if (t === te) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== we || Reflect.has(e, t);
			return (n !== void 0 || H !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ P(i ? I(e[t]) : we, u)), r.set(t, n)), U(n) === we) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ P(we, u)), r.set(d + "", p)) : F(p, we);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ P(void 0, u)), F(c, I(n)), r.set(t, c));
			else {
				l = c.v !== we;
				var m = f(() => I(n));
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
			U(o);
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
		if (typeof e == "object" && e && te in e) return e[te];
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
	var n = /* @__PURE__ */ cn(k);
	if (n === null) n = k.appendChild(sn());
	else if (t && n.nodeType !== 3) {
		var r = sn();
		return n?.before(r), Ne(r), r;
	}
	return t && pn(n), Ne(n), n;
}
function R(e, t = !1) {
	if (!O) {
		var n = /* @__PURE__ */ cn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
	}
	if (t) {
		if (k?.nodeType !== 3) {
			var r = sn();
			return k?.before(r), Ne(r), r;
		}
		pn(k);
	}
	return k;
}
function z(e, t = 1, n = !1) {
	let r = O ? k : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ ln(r);
	if (!O) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = sn();
			return r === null ? i?.after(a) : r.before(a), Ne(a), a;
		}
		pn(r);
	}
	return Ne(r), r;
}
function un(e) {
	e.textContent = "";
}
function dn() {
	return !1;
}
function fn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function pn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function mn(e) {
	H === null && (V === null && ge(e), he()), Bn && me(e);
}
function hn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function gn(e, t) {
	var n = H;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: Be,
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
			sr(r);
		} catch (e) {
			throw An(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && hn(i, n), V !== null && V.f & 2 && !(e & 64))) {
		var a = V;
		(a.effects ??= []).push(i);
	}
	return r;
}
function _n() {
	return V !== null && !Hn;
}
function vn(e) {
	let t = gn(8, null);
	return Qe(t, m), t.teardown = e, t;
}
function yn(e) {
	mn("$effect");
	var t = H.f;
	if (!V && t & 32 && Be !== null && !Be.i) {
		var n = Be;
		(n.e ??= []).push(e);
	} else return bn(e);
}
function bn(e) {
	return gn(4 | C, e);
}
function xn(e) {
	It.ensure();
	let t = gn(64 | S, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Nn(t, () => {
			An(t), n(void 0);
		}) : (An(t), n(void 0));
	});
}
function Sn(e) {
	return gn(4, e);
}
function Cn(e) {
	return gn(D | S, e);
}
function wn(e, t = 0) {
	return gn(8 | t, e);
}
function B(e, t = [], n = [], r = []) {
	pt(r, t, n, (t) => {
		gn(8, () => {
			e(...t.map(U));
		});
	});
}
function Tn(e, t = 0) {
	return gn(16 | t, e);
}
function En(e) {
	return gn(32 | S, e);
}
function Dn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Bn, n = V;
		Vn(!0), Un(null);
		try {
			t.call(null);
		} finally {
			Vn(e), Un(n);
		}
	}
}
function On(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && st(() => {
			e.abort(le);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : An(n, t), n = r;
	}
}
function kn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || An(t), t = n;
	}
}
function An(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (jn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, On(e, t && !n), or(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Dn(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && Mn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function jn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ ln(e);
		e.remove(), e = n;
	}
}
function Mn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Nn(e, t, n = !0) {
	var r = [];
	Pn(e, r, !0);
	var i = () => {
		n && An(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Pn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= _;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Pn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Fn(e) {
	In(e, !0);
}
function In(e, t) {
	if (e.f & 8192) {
		e.f ^= _, e.f & 1024 || (Qe(e, h), It.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			In(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Ln(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ ln(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Rn = null, zn = !1, Bn = !1;
function Vn(e) {
	Bn = e;
}
var V = null, Hn = !1;
function Un(e) {
	V = e;
}
var H = null;
function Wn(e) {
	H = e;
}
var Gn = null;
function Kn(e) {
	V !== null && (Gn ??= /* @__PURE__ */ new Set()).add(e);
}
var qn = null, Jn = 0, Yn = null;
function Xn(e) {
	Yn = e;
}
var Zn = 1, Qn = 0, $n = Qn;
function er(e) {
	$n = e;
}
function tr() {
	return ++Zn;
}
function nr(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (nr(a) && Ct(a), a.wv > e.wv) return !0;
		}
		t & 512 && Ot === null && Qe(e, m);
	}
	return !1;
}
function rr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Gn !== null && Gn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? rr(a, t, !1) : t === a && (n ? Qe(a, h) : a.f & 1024 && Qe(a, g), Vt(a));
	}
}
function ir(e) {
	var t = qn, n = Jn, r = Yn, i = V, a = Gn, o = Be, s = Hn, c = $n, l = e.f;
	qn = null, Jn = 0, Yn = null, V = l & 96 ? null : e, Gn = null, Ve(e.ctx), Hn = !1, $n = ++Qn, e.ac !== null && (st(() => {
		e.ac.abort(le);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = N?.is_fork;
		if (qn !== null) {
			var m;
			if (p || or(e, Jn), f !== null && Jn > 0) for (f.length = Jn + qn.length, m = 0; m < qn.length; m++) f[Jn + m] = qn[m];
			else e.deps = f = qn;
			if (_n() && e.f & 512) for (m = Jn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Jn < f.length && (or(e, Jn), f.length = Jn);
		if (We() && Yn !== null && !Hn && f !== null && !(e.f & 6146)) for (m = 0; m < Yn.length; m++) rr(Yn[m], e);
		if (i !== null && i !== e) {
			if (Qn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Qn;
			if (t !== null) for (let e of t) e.rv = Qn;
			Yn !== null && (r === null ? r = Yn : r.push(...Yn));
		}
		return e.f & 8388608 && (e.f ^= ee), d;
	} catch (e) {
		return Ye(e);
	} finally {
		e.f ^= E, qn = t, Jn = n, Yn = r, V = i, Gn = a, Ve(o), Hn = s, $n = c;
	}
}
function ar(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (qn === null || !n.call(qn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== we && $e(s), s.ac !== null && st(() => {
			s.ac.abort(le), s.ac = null, Qe(s, h);
		}), wt(s), or(s, 0);
	}
}
function or(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ar(e, n[r]);
}
function sr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Qe(e, m);
		var n = H, r = zn;
		H = e, zn = !(t & 96);
		try {
			t & 16777232 ? kn(e) : On(e), Dn(e);
			var i = ir(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Zn;
		} finally {
			zn = r, H = n;
		}
	}
}
async function cr() {
	await Promise.resolve(), Lt();
}
function U(e) {
	var t = !!(e.f & 2);
	if (Rn?.add(e), V !== null && !Hn && !(H !== null && H.f & 16384) && (Gn === null || !Gn.has(e))) {
		var r = V.deps;
		if (V.f & 2097152) e.rv < Qn && (e.rv = Qn, qn === null && r !== null && r[Jn] === e ? Jn++ : qn === null ? qn = [e] : qn.push(e));
		else {
			V.deps ??= [], n.call(V.deps, e) || V.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [V] : n.call(i, V) || i.push(V);
		}
	}
	if (Bn && Gt.has(e)) return Gt.get(e);
	if (t) {
		var a = e;
		if (Bn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || ur(a)) && (o = St(a)), Gt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Hn && V !== null && (zn || !!(V.f & 512)), c = (a.f & y) === 0;
		nr(a) && (s && (a.f |= 512), Ct(a)), s && !c && (Tt(a), lr(a));
	}
	if (Ot?.has(e)) return Ot.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function lr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Tt(t), lr(t));
}
function ur(e) {
	if (e.v === we) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Gt.has(t) || t.f & 2 && ur(t)) return !0;
	return !1;
}
function dr(e) {
	var t = Hn;
	try {
		return Hn = !0, e();
	} finally {
		Hn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var fr = ["touchstart", "touchmove"];
function pr(e) {
	return fr.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var mr = Symbol("events"), hr = /* @__PURE__ */ new Set(), gr = /* @__PURE__ */ new Set();
function _r(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || xr.call(t, e), !e.cancelBubble) return st(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? qe(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function vr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = _r(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && vn(() => {
		t.removeEventListener(e, o, a);
	});
}
function W(e, t, n) {
	(t[mr] ??= {})[e] = n;
}
function yr(e) {
	for (var t = 0; t < e.length; t++) hr.add(e[t]);
	for (var n of gr) n(e);
}
var br = null;
function xr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	br = e;
	var s = 0, c = br === e && e[mr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[mr] = t;
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
		var d = V, f = H;
		Un(null), Wn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[mr]?.[r];
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
			e[mr] = t, delete e.currentTarget, Un(d), Wn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var Sr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Cr(e) {
	return Sr?.createHTML(e) ?? e;
}
function wr(e) {
	var t = fn("template");
	return t.innerHTML = Cr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Tr(e, t) {
	var n = H;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function G(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (O) return Tr(k, null), k;
		i === void 0 && (i = wr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ cn(i)));
		var t = r || nn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ cn(t), s = t.lastChild;
			Tr(o, s);
		} else Tr(t, t);
		return t;
	};
}
function Er(e = "") {
	if (!O) {
		var t = sn(e + "");
		return Tr(t, t), t;
	}
	var n = k;
	return n.nodeType === 3 ? pn(n) : (n.before(n = sn()), Ne(n)), Tr(n, n), n;
}
function Dr() {
	if (O) return Tr(k, null), k;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = sn();
	return e.append(t, n), Tr(t, n), e;
}
function K(e, t) {
	if (O) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = k), Pe();
		return;
	}
	e !== null && e.before(t);
}
function q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[se] ??= e.nodeValue) && (e[se] = n, e.nodeValue = `${n}`);
}
function Or(e, t) {
	return Ar(e, t);
}
var kr = /* @__PURE__ */ new Map();
function Ar(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	on();
	var l = void 0, u = xn(() => {
		var s = n ?? t.appendChild(sn());
		dt(s, { pending: () => {} }, (t) => {
			He({});
			var n = Be;
			if (o && (n.c = o), a && (i.$$events = a), O && Tr(t, null), l = e(t, i) || {}, O && (H.nodes.end = k, k === null || k.nodeType !== 8 || k.data !== "]")) throw ke(), Ce;
			Ue();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = pr(r);
					for (let e of [t, document]) {
						var a = kr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), kr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, xr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(hr)), gr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = kr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, xr), r.delete(e), r.size === 0 && kr.delete(n)) : r.set(e, i);
			}
			gr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return jr.set(l, u), l;
}
var jr = /* @__PURE__ */ new WeakMap();
function Mr(e, t) {
	let n = jr.get(e);
	return n ? (jr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Nr = class {
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
			if (n) Fn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Fn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (An(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Ln(r, t), t.append(sn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else An(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), Nn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (An(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = N, r = dn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = sn();
				i.append(a), this.#n.set(e, {
					effect: En(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, En(() => t(this.anchor)));
		}
		if (this.#e.set(n, e), r) {
			for (let [t, r] of this.#t) t === e ? n.unskip_effect(r) : n.skip_effect(r);
			for (let [t, r] of this.#n) t === e ? n.unskip_effect(r.effect) : n.skip_effect(r.effect);
			n.oncommit(this.#a), n.ondiscard(this.#o);
		} else O && (this.anchor = k), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function J(e, t, n = !1) {
	var r;
	O && (r = k, Pe());
	var i = new Nr(e), a = n ? x : 0;
	function o(e, t) {
		if (O) {
			var n = Ie(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Fe();
				Ne(a), i.anchor = a, Me(!1), i.ensure(e, t), Me(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Tn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Pr(e, t) {
	return t;
}
function Fr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Nn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Ir(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null;
		if (l) {
			var u = n, d = u.parentNode;
			un(d), d.append(u), e.items.clear();
		}
		Ir(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Ir(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= w, Ln(a, document.createDocumentFragment())) : An(t[i], n);
	}
}
var Lr;
function Y(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = O ? Ne(/* @__PURE__ */ cn(u)) : u.appendChild(sn());
	}
	O && Pe();
	var d = null, f = /* @__PURE__ */ bt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, zr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Vr(d, null, c)) : Fn(d) : Nn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Tn(() => {
			p = U(f);
			var e = p.length;
			let t = !1;
			O && Ie(c) === "[!" != (e === 0) && (c = Fe(), Ne(c), Me(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = N, v = dn(), y = 0; y < e; y += 1) {
				O && k.nodeType === 8 && k.data === "]" && (c = k, t = !0, Me(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Yt(S.v, b), S.i && Yt(S.i, y), v && u.unskip_effect(S.e)) : (S = Br(l, h ? c : Lr ??= sn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = En(() => s(c)) : (d = En(() => s(Lr ??= sn())), d.f |= w)), e > r.size && pe("", "", ""), O && e > 0 && Ne(Fe()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Me(!0), U(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, O && (c = k);
}
function Rr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function zr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Rr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Fn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Vr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Hr(e, d, _), Hr(e, _, y), Vr(_, y, n), d = _, p = [], m = [], l = Rr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Vr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Hr(e, S.prev, C.next), Hr(e, d, S), Hr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Vr(_, l, n), Hr(e, _.prev, _.next), Hr(e, _, d === null ? e.effect.first : d.next), Hr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Rr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Rr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Ir(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Rr(l.next);
		var E = T.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Fr(e, T, D);
		}
	}
	o && qe(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Br(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? qt(n) : /* @__PURE__ */ Jt(n, !1, !1) : null, l = o & 2 ? qt(i) : null;
	return {
		v: c,
		i: l,
		e: En(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Vr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ ln(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Hr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Ur(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		O && (o = Ne(/* @__PURE__ */ cn(c)));
	}
	B(() => {
		var e = H;
		if (s === (s = t() ?? "")) {
			O && Pe();
			return;
		}
		if (n && !O) {
			e.nodes = null, c.innerHTML = s, s !== "" && Tr(/* @__PURE__ */ cn(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (jn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (O) {
				for (var a = k.data, l = Pe(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ ln(l);
				if (l === null) throw ke(), Ce;
				Tr(k, u), o = Ne(l);
				return;
			}
			var d = fn(r ? "svg" : i ? "math" : "template", r ? Ee : i ? De : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Tr(/* @__PURE__ */ cn(f), f.lastChild), r || i) for (; /* @__PURE__ */ cn(f);) o.before(/* @__PURE__ */ cn(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Wr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Wr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Gr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Wr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Kr(e) {
	return typeof e == "object" ? Gr(e) : e ?? "";
}
var qr = [..." 	\n\r\f\xA0\v﻿"];
function Jr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || qr.includes(r[o - 1])) && (s === r.length || qr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Yr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Xr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Zr(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Xr)), i && c.push(...Object.keys(i).map(Xr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Xr(e.substring(l, u).trim());
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
		return r && (n += Yr(r)), i && (n += Yr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function X(e, t, n, r, i, a) {
	var o = e[ae];
	if (O || o !== n || o === void 0) {
		var s = Jr(n, r, a);
		(!O || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ae] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function Qr(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function $r(e, t, n, r) {
	var i = e[oe];
	if (O || i !== t) {
		var a = Zr(t, r);
		(!O || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[oe] = t;
	} else r && (Array.isArray(r) ? (Qr(e, n?.[0], r[0]), Qr(e, n?.[1], r[1], "important")) : Qr(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ei(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ae();
		for (var i of t.options) i.selected = n.includes(ri(i));
		return;
	}
	for (i of t.options) if (en(ri(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function ti(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ei(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), vn(() => {
		t.disconnect();
	});
}
function ni(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	ct(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), ri);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && ri(o);
		}
		n(a), e.__value = a, N !== null && r.add(N);
	}), Sn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = N;
			if (r.has(o)) return;
		}
		if (ei(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = ri(s), n(a));
		}
		e.__value = a, i = !1;
	}), ti(e);
}
function ri(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var ii = Symbol("is custom element"), ai = Symbol("is html"), oi = ue ? "link" : "LINK", si = ue ? "progress" : "PROGRESS";
function ci(e) {
	if (O) {
		var t = !1, n = () => {
			if (!t) {
				if (t = !0, e.hasAttribute("value")) {
					var n = e.value;
					Z(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					Z(e, "checked", null), e.checked = r;
				}
			}
		};
		e[ce] = n, qe(n), ot();
	}
}
function li(e, t) {
	var n = di(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === si) && (e.value = t ?? "");
}
function ui(e, t) {
	var n = di(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Z(e, t, n, r) {
	var i = di(e);
	O && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === oi) || i[t] !== (i[t] = n) && (t === "loading" && (e[re] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && pi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function di(e) {
	return e[ie] ??= {
		[ii]: e.nodeName.includes("-"),
		[ai]: e.namespaceURI === Te
	};
}
var fi = /* @__PURE__ */ new Map();
function pi(e) {
	var t = e.getAttribute("is") || e.nodeName, n = fi.get(t);
	if (n) return n;
	fi.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function mi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ct(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = gi(e) ? _i(a) : a, n(a), N !== null && r.add(N), await cr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (O && e.defaultValue !== e.value || dr(t) == null && e.value) && (n(gi(e) ? _i(e.value) : e.value), N !== null && r.add(N)), wn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = N;
			if (r.has(i)) return;
		}
		gi(e) && n === _i(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function hi(e, t, n = t) {
	ct(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (O && e.defaultChecked !== e.checked || dr(t) == null) && n(e.checked), wn(() => {
		e.checked = !!t();
	});
}
function gi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function _i(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function vi(e, t) {
	return e === t || e?.[te] === t;
}
function yi(e = {}, t, n, r) {
	var i = Be.r, a = H;
	return Sn(() => {
		var o, s;
		return wn(() => {
			o = s, s = r?.() || [], dr(() => {
				vi(n(...s), e) || (t(e, ...s), o && vi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && vi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/universal.js
function bi(e, t, n, r, i) {
	var a = () => {
		r(n[e]);
	};
	n.addEventListener(t, a), i ? wn(() => {
		n[e] = i();
	}) : a(), (n === document.body || n === window || n === document) && vn(() => {
		n.removeEventListener(t, a);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function xi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ _t(r), U(u)) : (l && (l = !1, c = s ? dr(r) : r), c);
	let f;
	if (o) {
		var p = te in e || ne in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = rt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ve(t), f(m)));
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
	o && U(y);
	var b = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && o ? I(e) : e;
			return F(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : U(y);
	});
}
function Si(e) {
	Be === null && de("onMount"), yn(() => {
		let t = dr(e);
		if (typeof t == "function") return t;
	});
}
function Ci(e) {
	Be === null && de("onDestroy"), Si(() => () => dr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/islands/Icon.svelte
var wi = /* @__PURE__ */ G("<i></i>");
function Q(e, t) {
	let n = xi(t, "className", 3, "");
	var r = wi();
	B(() => {
		Z(r, "data-lucide", t.name), X(r, 1, Kr(n()));
	}), K(e, r);
}
//#endregion
//#region src/islands/AppShell.svelte
var Ti = /* @__PURE__ */ G("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), Ei = /* @__PURE__ */ G("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), Di = /* @__PURE__ */ G("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), Oi = /* @__PURE__ */ G("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), ki = /* @__PURE__ */ G("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Ai = /* @__PURE__ */ G("<span><!></span>"), ji = /* @__PURE__ */ G("<span aria-hidden=\"true\"><!><!></span>"), Mi = /* @__PURE__ */ G("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), Ni = /* @__PURE__ */ G("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Pi = /* @__PURE__ */ G("<div class=\"task-group\"></div>"), Fi = /* @__PURE__ */ G("<button type=\"button\"><span class=\"chevron\"><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), Ii = /* @__PURE__ */ G("<div class=\"session-row muted-row\"><!><div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>"), Li = /* @__PURE__ */ G("<span class=\"session-unread-badge\" aria-label=\"Unread turn completion\">New</span>"), Ri = /* @__PURE__ */ G("<button type=\"button\"><!><span><strong> </strong><small> </small></span></button>"), zi = /* @__PURE__ */ G("<div class=\"session-resource-menu\"></div>"), Bi = /* @__PURE__ */ G("<button type=\"button\"><!> <div class=\"session-title\"><strong> </strong><span> </span></div> <span> </span> <!> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), Vi = /* @__PURE__ */ G("<header class=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" class=\"mobile-icon-button mobile-immersive-button\" type=\"button\" aria-label=\"Toggle immersive chat\"><!></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" type=\"button\" aria-label=\"Close navigation\"></button> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span id=\"brandVersionIsland\"></span></div></div> <section class=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" class=\"workspace-switcher-button\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <!></button> <!></div></section> <section class=\"tree-section\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section> <div id=\"sessionResize\" class=\"resize-handle horizontal-resize sidebar-session-resize\" role=\"separator\" aria-orientation=\"horizontal\" aria-label=\"Resize sessions panel\"></div> <section class=\"session-section\"><div class=\"section-title\"><span>Sessions</span></div> <div id=\"sessionList\" class=\"session-list\"><!></div></section> <div class=\"sidebar-footer\"><button id=\"systemSettingsButton\" type=\"button\"><!><span>Settings</span></button></div></aside> <div id=\"sidebarResize\" class=\"resize-handle sidebar-resize\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"Resize sidebar\"></div> <main class=\"workspace-panel\"><section id=\"detailsPanel\" class=\"details-panel\"></section> <div id=\"detailsResize\" class=\"resize-handle details-resize\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"Resize chat panel\"></div> <aside id=\"agentPanel\" class=\"agent-panel\"><div id=\"agentControls\" class=\"agent-actions\"></div><div id=\"selfDrivingBarWrap\" class=\"self-driving-bar-wrap\"></div><div id=\"agentSessionsWrap\" class=\"agent-sessions\"></div><div class=\"tty-panel\"><div id=\"ttyLog\" class=\"tty-log\"></div><div id=\"ttyComposer\" class=\"tty-composer\"></div></div></aside></main>", 1);
function Hi(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(null), s = /* @__PURE__ */ P(null), c = null, l = /* @__PURE__ */ P(0), u = /* @__PURE__ */ M(() => U(n).workspaces.find((e) => e.id === U(n).activeWorkspaceId) ?? null);
	Si(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== U(n).identity;
			F(n, e, !0), t && (F(r, !1), F(i, ""), F(a, ""), _()), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			U(r) && !t?.closest(".workspace-select-row") && F(r, !1), U(i) && !t?.closest(".session-row") && !t?.closest(".session-resource-menu") && F(i, "");
		}, s = (e) => {
			e.key === "Escape" && (U(n).mobile.sidebarOpen ? U(n).onMobileSidebar(!1) : U(r) ? F(r, !1) : U(i) && F(i, ""));
		}, l = () => {
			U(n).onHistoryNavigation(window.location.pathname).catch((e) => {
				U(n).onToast(e instanceof Error ? e.message : String(e));
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
			U(n).onPaneViewport(), p();
		};
		return document.addEventListener("mousedown", o), document.addEventListener("keydown", s), document.addEventListener("focusout", v), window.addEventListener("resize", y), window.addEventListener("orientationchange", v), window.addEventListener("popstate", l), u?.addEventListener("resize", p), u?.addEventListener("scroll", p), f.addEventListener?.("change", y), p(), () => {
			e(), c?.(), _(), document.removeEventListener("mousedown", o), document.removeEventListener("keydown", s), document.removeEventListener("focusout", v), window.removeEventListener("resize", y), window.removeEventListener("orientationchange", v), window.removeEventListener("popstate", l), u?.removeEventListener("resize", p), u?.removeEventListener("scroll", p), f.removeEventListener?.("change", y), h(), document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
		};
	}), yn(() => {
		document.body.classList.toggle("mobile-sidebar-open", U(n).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", U(n).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", U(n).mobile.immersive);
	}), yn(() => {
		let e = U(n).route;
		!e.path || e.revision <= U(l) || (F(l, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	function d(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function f(e) {
		return !U(s) || U(s).id !== e ? "" : U(s).after ? "drop-after" : "drop-before";
	}
	function p(e) {
		return !U(o) || U(o).id === e.id || U(o).kind !== e.kind ? !1 : e.kind !== "task" || U(o).projectId === e.projectId;
	}
	function m(e, t) {
		e.stopPropagation(), F(o, t, !0), F(s, null), U(n).onDragState(t), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", t.id));
	}
	function h(e, t) {
		if (!p(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		F(s, {
			id: t.id,
			after: e.clientY > n.top + n.height / 2
		}, !0);
	}
	async function g(e, t) {
		if (e.preventDefault(), !U(o) || !p(t)) return;
		let r = U(o), i = U(s)?.id === t.id && U(s).after;
		_();
		try {
			await U(n).onReorder(r, t, i);
		} catch (e) {
			U(n).onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function _() {
		U(o) && U(n).onDragState(null), F(o, null), F(s, null);
	}
	async function v(e) {
		if (!(!e || U(a))) {
			F(a, e, !0), F(r, !1);
			try {
				await U(n).onSwitchWorkspace(e);
			} catch (e) {
				U(n).onToast(e instanceof Error ? e.message : String(e));
			} finally {
				F(a, "");
			}
		}
	}
	async function y(e) {
		if (e) {
			F(i, "");
			try {
				await U(n).onSelectResource(e);
			} catch (e) {
				U(n).onToast(e instanceof Error ? e.message : String(e));
			}
		}
	}
	async function b(e, t) {
		let r = e.target instanceof Element ? e.target : null;
		if (!r?.closest(".drag-handle")) {
			if (t.type === "project" && r?.closest("[data-project-toggle]")) {
				try {
					await U(n).onToggleProject(t.id);
				} catch (e) {
					U(n).onToast(e instanceof Error ? e.message : String(e));
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
			t.menu && F(i, U(i) === t.id ? "" : t.id, !0);
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
				U(n).onPanePreview(t, Math.min(r, Math.max(220, f + e.clientX - u)));
			} else if (t === "chatWidth") {
				let r = Math.max(320, o.getBoundingClientRect().width - 360 - 8);
				U(n).onPanePreview(t, Math.min(r, Math.max(320, p - (e.clientX - u))));
			} else {
				let r = Math.max(120, a.getBoundingClientRect().height - 250);
				U(n).onPanePreview(t, Math.min(r, Math.max(84, m - (e.clientY - d))));
			}
		}, _ = () => {
			r.classList.remove("dragging"), document.body.classList.remove(h), window.removeEventListener("pointermove", g), window.removeEventListener("pointerup", _), window.removeEventListener("pointercancel", _), c = null, U(n).onPaneCommit(t);
		};
		c = _, window.addEventListener("pointermove", g), window.addEventListener("pointerup", _, { once: !0 }), window.addEventListener("pointercancel", _, { once: !0 });
	}
	var C = Vi(), w = R(C), T = L(w);
	Q(L(T), { name: "menu" }), A(T);
	var E = z(T, 2), D = L(E), ee = z(D, 2);
	A(E);
	var te = z(E, 2), ne = L(te);
	{
		let e = /* @__PURE__ */ M(() => U(n).mobile.immersive ? "minimize-2" : "maximize-2");
		Q(ne, { get name() {
			return U(e);
		} });
	}
	A(te), A(w);
	var re = z(w, 2), ie = z(re, 2), ae = L(ie), oe = z(L(ae)), se = z(L(oe));
	A(oe), A(ae);
	var ce = z(ae, 2), le = L(ce), ue = L(le), de = L(ue), fe = L(de);
	A(de);
	var pe = z(de, 2), me = L(pe, !0);
	A(pe);
	var he = z(pe, 2);
	{
		let e = /* @__PURE__ */ M(() => U(a) ? "loader-circle" : "chevrons-up-down");
		Q(he, {
			get name() {
				return U(e);
			},
			className: "select-icon"
		});
	}
	A(ue);
	var ge = z(ue, 2), _e = (e) => {
		var t = Ei(), i = z(L(t), 2);
		Y(i, 17, () => U(n).workspaces, (e) => e.id, (e, t) => {
			var r = Ti(), i = L(r), o = L(i);
			A(i);
			var s = z(i, 2), c = L(s), l = L(c, !0);
			A(c);
			var u = z(c), d = L(u, !0);
			A(u), A(s);
			var f = z(s, 2), p = (e) => {
				Q(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			J(f, (e) => {
				U(t).id === U(n).activeWorkspaceId && e(p);
			}), A(r), B((e) => {
				Z(r, "aria-selected", U(t).id === U(n).activeWorkspaceId), Z(r, "data-workspace-id", U(t).id), r.disabled = e, Z(o, "src", U(t).iconSrc), q(l, U(t).name || U(t).id), q(d, U(t).path);
			}, [() => !!U(a)]), W("click", r, () => v(U(t).id)), K(e, r);
		});
		var o = z(i, 2), s = L(o);
		Q(L(s), { name: "plus" }), j(), A(s), A(o), A(t), W("click", s, () => {
			F(r, !1), U(n).onAddWorkspace();
		}), K(e, t);
	};
	J(ge, (e) => {
		U(r) && e(_e);
	}), A(le), A(ce);
	var ve = z(ce, 2), ye = L(ve), be = z(L(ye));
	Q(L(be), { name: "plus" }), A(be), A(ye);
	var xe = z(ye, 2), Se = L(xe), Ce = (e) => {
		var t = Di();
		Q(L(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), j(2), A(t), K(e, t);
	}, we = (e) => {
		var t = Oi(), r = L(t);
		Q(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = z(r, 2), a = L(i, !0);
		A(i), A(t), B(() => q(a, U(n).error)), K(e, t);
	}, Te = (e) => {
		var t = ki();
		Q(L(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), j(2), A(t), K(e, t);
	}, Ee = (e) => {
		var t = Dr();
		Y(R(t), 17, () => U(n).projects, (e) => e.id, (e, t) => {
			var n = Fi(), r = R(n), i = L(r), a = L(i), s = (e) => {
				{
					let n = /* @__PURE__ */ M(() => U(t).expanded ? "chevron-down" : "chevron-right");
					Q(e, { get name() {
						return U(n);
					} });
				}
			};
			J(a, (e) => {
				U(t).children.length && e(s);
			}), A(i);
			var c = z(i, 2), l = (e) => {
				var n = ji(), r = L(n);
				Y(r, 17, () => U(t).status.statuses, (e) => e.key, (e, t) => {
					var n = Ai();
					Q(L(n), {
						get name() {
							return U(t).iconName;
						},
						className: "task-status-icon"
					}), A(n), B(() => X(n, 1, `task-status-indicator ${U(t).className} ${U(t).recentOutput ? "task-status-fresh" : ""}`)), K(e, n);
				});
				var i = z(r), a = (e) => {
					var n = Ai();
					Q(L(n), {
						name: "lock",
						className: "task-lock-icon"
					}), A(n), B(() => X(n, 1, `task-lock-indicator ${U(t).status.lock.className}`)), K(e, n);
				};
				J(i, (e) => {
					U(t).status.lock && e(a);
				}), A(n), B(() => X(n, 1, `task-status-slot ${U(t).status.slotClassName}`)), K(e, n);
			};
			J(c, (e) => {
				U(t).status.hasTaskState && e(l);
			});
			var u = z(c, 2);
			Q(u, {
				name: "folder",
				className: "tree-icon"
			});
			var p = z(u, 2), v = L(p), y = L(v, !0);
			A(v);
			var x = z(v), S = L(x, !0);
			A(x);
			var C = z(x), w = (e) => {
				var n = Mi(), r = L(n), i = L(r, !0);
				A(r);
				var a = z(r, 2), o = L(a, !0);
				A(a), A(n), B(() => {
					q(i, U(t).summary.taskLabel), q(o, U(t).summary.runningLabel);
				}), K(e, n);
			};
			J(C, (e) => {
				U(t).summary && !U(t).expanded && e(w);
			}), A(p);
			var T = z(p, 2);
			Q(L(T), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), A(T), A(r);
			var E = z(r, 2), D = (e) => {
				var n = Pi();
				Y(n, 21, () => U(t).children, (e) => e.id, (e, n) => {
					var r = Ni(), i = z(L(r), 2), a = (e) => {
						var t = ji(), r = L(t);
						Y(r, 17, () => U(n).status.statuses, (e) => e.key, (e, t) => {
							var n = Ai();
							Q(L(n), {
								get name() {
									return U(t).iconName;
								},
								className: "task-status-icon"
							}), A(n), B(() => X(n, 1, `task-status-indicator ${U(t).className} ${U(t).recentOutput ? "task-status-fresh" : ""}`)), K(e, n);
						});
						var i = z(r), a = (e) => {
							var t = Ai();
							Q(L(t), {
								name: "lock",
								className: "task-lock-icon"
							}), A(t), B(() => X(t, 1, `task-lock-indicator ${U(n).status.lock.className}`)), K(e, t);
						};
						J(i, (e) => {
							U(n).status.lock && e(a);
						}), A(t), B(() => X(t, 1, `task-status-slot ${U(n).status.slotClassName}`)), K(e, t);
					};
					J(i, (e) => {
						U(n).status.hasTaskState && e(a);
					});
					var s = z(i, 2);
					Q(s, {
						name: "file-text",
						className: "tree-icon"
					});
					var c = z(s), l = L(c), u = L(l, !0);
					A(l);
					var p = z(l), v = L(p, !0);
					A(p), A(c);
					var y = z(c, 2);
					Q(L(y), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), A(y), A(r), B((e) => {
						X(r, 1, e), Z(r, "aria-label", U(n).ariaLabel || void 0), Z(r, "title", U(n).statusLabel || void 0), q(u, U(n).title), q(v, U(n).ref);
					}, [() => `tree-item task-item ${d(U(n).status)} ${U(n).active ? "active" : ""} ${U(o)?.id === U(n).id ? "drag-source" : ""} ${f(U(n).id)}`]), W("click", r, (e) => b(e, U(n))), vr("dragover", r, (e) => h(e, {
						kind: "task",
						id: U(n).id,
						projectId: U(t).id
					})), vr("drop", r, (e) => g(e, {
						kind: "task",
						id: U(n).id,
						projectId: U(t).id
					})), vr("dragstart", y, (e) => m(e, {
						kind: "task",
						id: U(n).id,
						projectId: U(t).id
					})), vr("dragend", y, _), K(e, r);
				}), A(n), K(e, n);
			};
			J(E, (e) => {
				U(t).expanded && e(D);
			}), B((e) => {
				X(r, 1, e), Z(r, "aria-label", U(t).ariaLabel || void 0), Z(r, "title", U(t).statusLabel || void 0), Z(i, "data-project-toggle", U(t).children.length ? U(t).id : void 0), q(y, U(t).title), q(S, U(t).ref);
			}, [() => `tree-item ${d(U(t).status)} ${U(t).active ? "active" : ""} ${U(o)?.id === U(t).id ? "drag-source" : ""} ${f(U(t).id)}`]), W("click", r, (e) => b(e, U(t))), vr("dragover", r, (e) => h(e, {
				kind: "project",
				id: U(t).id,
				projectId: ""
			})), vr("drop", r, (e) => g(e, {
				kind: "project",
				id: U(t).id,
				projectId: ""
			})), vr("dragstart", T, (e) => m(e, {
				kind: "project",
				id: U(t).id,
				projectId: ""
			})), vr("dragend", T, _), K(e, n);
		}), K(e, t);
	};
	J(Se, (e) => {
		U(n).loading ? e(Ce) : U(n).error ? e(we, 1) : U(n).projects.length === 0 ? e(Te, 2) : e(Ee, -1);
	}), A(xe), A(ve);
	var De = z(ve, 2), Oe = z(De, 2), ke = z(L(Oe), 2), Ae = L(ke), je = (e) => {
		var t = Ii();
		Q(L(t), { name: "message-square" }), j(), A(t), K(e, t);
	}, O = (e) => {
		var t = Dr();
		Y(R(t), 17, () => U(n).sessions, (e) => e.id, (e, t) => {
			var n = Bi(), r = R(n), a = L(r), s = (e) => {
				var n = ji(), r = L(n);
				Y(r, 17, () => U(t).status.statuses, (e) => e.key, (e, t) => {
					var n = Ai();
					Q(L(n), {
						get name() {
							return U(t).iconName;
						},
						className: "task-status-icon"
					}), A(n), B(() => X(n, 1, `task-status-indicator ${U(t).className} ${U(t).recentOutput ? "task-status-fresh" : ""}`)), K(e, n);
				});
				var i = z(r), a = (e) => {
					var n = Ai();
					Q(L(n), {
						name: "lock",
						className: "task-lock-icon"
					}), A(n), B(() => X(n, 1, `task-lock-indicator ${U(t).status.lock.className}`)), K(e, n);
				};
				J(i, (e) => {
					U(t).status.lock && e(a);
				}), A(n), B(() => X(n, 1, `task-status-slot session-status-icon ${U(t).status.slotClassName}`)), K(e, n);
			};
			J(a, (e) => {
				U(t).status.hasTaskState && e(s);
			});
			var c = z(a, 2), l = L(c), u = L(l, !0);
			A(l);
			var p = z(l), v = L(p, !0);
			A(p), A(c);
			var b = z(c, 2), S = L(b, !0);
			A(b);
			var C = z(b, 2), w = (e) => {
				K(e, Li());
			};
			J(C, (e) => {
				U(t).unread && e(w);
			});
			var T = z(C, 2);
			Q(L(T), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), A(T), A(r);
			var E = z(r, 2), D = (e) => {
				var n = zi();
				Y(n, 21, () => U(t).controls, (e) => e.resourceId, (e, t) => {
					var n = Ri(), r = L(n);
					Q(r, { name: "corner-down-right" });
					var i = z(r), a = L(i), o = L(a, !0);
					A(a);
					var s = z(a), c = L(s, !0);
					A(s), A(i), A(n), B(() => {
						n.disabled = !U(t).navigable, q(o, U(t).resourceId), q(c, U(t).path);
					}), W("click", n, () => y(U(t).resourceId)), K(e, n);
				}), A(n), B(() => Z(n, "data-session-menu", U(t).id)), K(e, n);
			};
			J(E, (e) => {
				U(i) === U(t).id && U(t).menu && e(D);
			}), B((e) => {
				X(r, 1, e), Z(r, "aria-label", `${U(t).title}. ${U(t).statusLabel}`), Z(r, "title", U(t).statusLabel), q(u, U(t).title), q(v, U(t).meta), X(b, 1, `session-badge ${U(t).source === "internal" ? "internal" : "external"}`), q(S, U(t).label);
			}, [() => `session-row ${U(t).source === "internal" ? "internal-session" : "external-session"} ${d(U(t).status)} ${U(t).clickable ? "clickable-session" : ""} ${U(t).current ? "current-session" : ""} ${U(t).unread ? "session-unread" : ""} ${U(o)?.id === U(t).id ? "drag-source" : ""} ${f(U(t).id)}`]), W("click", r, (e) => x(e, U(t))), vr("dragover", r, (e) => h(e, {
				kind: "session",
				id: U(t).id,
				projectId: ""
			})), vr("drop", r, (e) => g(e, {
				kind: "session",
				id: U(t).id,
				projectId: ""
			})), vr("dragstart", T, (e) => m(e, {
				kind: "session",
				id: U(t).id,
				projectId: ""
			})), vr("dragend", T, _), K(e, n);
		}), K(e, t);
	};
	J(Ae, (e) => {
		U(n).sessions.length === 0 ? e(je) : e(O, -1);
	}), A(ke), A(Oe);
	var Me = z(Oe, 2), k = L(Me);
	Q(L(k), { name: "settings" }), j(), A(k), A(Me), A(ie);
	var Ne = z(ie, 2), Pe = z(Ne, 2), Fe = z(L(Pe), 2);
	j(2), A(Pe), B(() => {
		Z(T, "aria-expanded", U(n).mobile.sidebarOpen), Z(D, "aria-selected", U(n).mobile.view === "details"), Z(ee, "aria-selected", U(n).mobile.view === "chat"), Z(te, "aria-pressed", U(n).mobile.immersive), Z(se, "data-version", U(n).version), Z(ue, "aria-expanded", U(r)), Z(fe, "src", U(u)?.iconSrc || "/favicon.svg"), q(me, U(u)?.name || "Workspace"), Z(xe, "data-navigation-identity", U(n).identity);
	}), W("click", T, () => U(n).onMobileSidebar(!U(n).mobile.sidebarOpen)), W("click", D, () => U(n).onMobileView("details")), W("click", ee, () => U(n).onMobileView("chat")), W("click", te, () => U(n).onMobileImmersive(!U(n).mobile.immersive)), W("click", re, () => U(n).onMobileSidebar(!1)), W("click", ue, (e) => {
		e.stopPropagation(), F(r, !U(r));
	}), W("click", be, function(...e) {
		U(n).onCreateProject?.apply(this, e);
	}), W("pointerdown", De, (e) => S(e, "sidebarSessionHeight")), W("click", k, () => {
		U(n).onMobileSidebar(!1), U(n).onOpenSettings();
	}), W("pointerdown", Ne, (e) => S(e, "sidebarWidth")), W("pointerdown", Fe, (e) => S(e, "chatWidth")), K(e, C), Ue();
}
yr(["click", "pointerdown"]);
//#endregion
//#region src/islands/BrandVersion.svelte
var Ui = /* @__PURE__ */ G("<span data-svelte-owned=\"brand-version\"> </span>");
function Wi(e, t) {
	let n = xi(t, "version", 3, "v0.1.0");
	var r = Ui(), i = L(r, !0);
	A(r), B(() => q(i, n())), K(e, r);
}
//#endregion
//#region src/islands/ChatComposer.svelte
var Gi = /* @__PURE__ */ G("<button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button>"), Ki = /* @__PURE__ */ G("<button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn; keep the Session open.\" aria-label=\"End current turn; keep the Session open.\"><!></button>"), qi = /* @__PURE__ */ G("<span class=\"tty-composer-divider\" aria-hidden=\"true\"></span> <span class=\"tty-composer-group\"><!> <button type=\"button\" id=\"agentCloseSessionButton\" class=\"tty-composer-action tty-close-session-button\"><!></button></span>", 1), Ji = /* @__PURE__ */ G("<button type=\"button\" id=\"agentActionsToggle\" class=\"tty-actions-toggle\" title=\"Session actions\" aria-label=\"Session actions\"><!></button>"), Yi = /* @__PURE__ */ G("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), Xi = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Zi = /* @__PURE__ */ G("<div id=\"ttyAgentMenu\" class=\"tty-agent-menu\" role=\"menu\" aria-label=\"Choose an Agent\"></div>"), Qi = /* @__PURE__ */ G("<div class=\"tty-session-actions collapsible open\"><div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div></div>"), $i = /* @__PURE__ */ G("<form id=\"ttyForm\" class=\"tty-input\"><span>&gt;</span> <textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <span class=\"tty-composer-group\"><!> <button type=\"submit\" class=\"tty-send-button\"><!></button></span> <!> <!></form> <!> <!>", 1), ea = /* @__PURE__ */ G("<div class=\"external-resource-lock\">This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.</div>"), ta = /* @__PURE__ */ G("<button type=\"button\" id=\"agentResumeButton\" class=\"tty-primary-action\" title=\"Resume Session\" aria-label=\"Resume Session\"><!><span>Resume Session</span></button>"), na = /* @__PURE__ */ G("<div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div>"), ra = /* @__PURE__ */ G("<div class=\"tty-session-actions tty-standalone-actions open\" role=\"toolbar\" aria-label=\"Session actions\"><!> <!> <!></div>");
function ia(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(-1), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(!1), s = /* @__PURE__ */ P(""), c = /* @__PURE__ */ P(!1), l = /* @__PURE__ */ P(void 0), u = /* @__PURE__ */ M(() => !!U(n).unavailableReason || U(o) || U(n).sending), d = /* @__PURE__ */ M(() => U(n).sessionStarting ? "Creating a new AgentHub session..." : U(n).agents.length ? "Choose an Agent to start a new session." : "No enabled agents are available. Configure an AgentHub Agent in Settings.");
	Si(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity === U(r) ? e.draftResetVersion !== U(i) && (F(i, e.draftResetVersion, !0), F(a, e.draft, !0), F(s, "")) : (F(r, e.identity, !0), F(i, e.draftResetVersion, !0), F(a, e.draft, !0), F(o, !1), F(s, ""), F(c, !1)), queueMicrotask(e.onIconsChanged);
	})), yn(() => {
		U(a), cr().then(g);
	});
	function f() {
		return {
			workspaceId: U(n).workspaceId,
			resourceId: U(n).resourceId,
			runId: U(n).runId,
			draftKey: U(n).draftKey
		};
	}
	function p(e) {
		F(a, e, !0), F(s, ""), U(n).onDraft(e, f());
	}
	async function m(e) {
		e?.preventDefault();
		let t = U(a);
		if (U(u) || !t.trim() || !U(n).runId) return;
		let i = U(r), c = f();
		F(o, !0), F(s, "");
		try {
			let e = await U(n).onSend(t, c);
			U(r) === i && e.accepted && e.clear && U(a) === t && p("");
		} catch (e) {
			U(r) === i && F(s, e instanceof Error ? e.message : String(e), !0);
		} finally {
			U(r) === i && (F(o, !1), await cr(), U(l)?.focus({ preventScroll: !0 }));
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
			U(c) || (e.preventDefault(), m());
		}
	}
	function g() {
		if (!U(l)) return;
		U(l).style.height = "auto";
		let e = Math.min(U(l).scrollHeight, 160);
		U(l).style.height = `${e}px`, U(l).style.overflowY = U(l).scrollHeight > 160 ? "auto" : "hidden";
	}
	var _ = Dr(), v = R(_), y = (e) => {
		var t = $i(), r = R(t), i = z(L(r), 2);
		it(i), yi(i, (e) => F(l, e), () => U(l));
		var c = z(i, 2), f = L(c), g = (e) => {
			var t = Gi();
			Q(L(t), { name: "plus" }), A(t), W("click", t, function(...e) {
				U(n).onOpenUpload?.apply(this, e);
			}), K(e, t);
		};
		J(f, (e) => {
			U(n).externalLocked || e(g);
		});
		var _ = z(f, 2), v = L(_);
		{
			let e = /* @__PURE__ */ M(() => U(o) ? "loader-circle" : "send");
			Q(v, { get name() {
				return U(e);
			} });
		}
		A(_), A(c);
		var y = z(c, 2), b = (e) => {
			var t = qi(), r = z(R(t), 2), i = L(r), a = (e) => {
				var t = Ki(), r = L(t);
				{
					let e = /* @__PURE__ */ M(() => U(n).endingTurn ? "loader-circle" : "pause");
					Q(r, { get name() {
						return U(e);
					} });
				}
				A(t), B(() => t.disabled = U(n).endingTurn || U(n).closingSession || U(n).selfDrivingDisabling), W("click", t, function(...e) {
					U(n).onEndTurn?.apply(this, e);
				}), K(e, t);
			};
			J(i, (e) => {
				U(n).canEndTurn && e(a);
			});
			var o = z(i, 2), s = L(o);
			{
				let e = /* @__PURE__ */ M(() => U(n).closingSession ? "loader-circle" : "square");
				Q(s, { get name() {
					return U(e);
				} });
			}
			A(o), A(r), B(() => {
				o.disabled = U(n).endingTurn || U(n).closingSession || U(n).selfDrivingDisabling, Z(o, "title", U(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session."), Z(o, "aria-label", U(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session.");
			}), W("click", o, function(...e) {
				U(n).onCloseSession?.apply(this, e);
			}), K(e, t);
		};
		J(y, (e) => {
			(U(n).canEndTurn || U(n).runId) && e(b);
		});
		var x = z(y, 2), S = (e) => {
			var t = Ji();
			Q(L(t), { name: "ellipsis" }), A(t), B(() => Z(t, "aria-expanded", U(n).actionsOpen)), W("click", t, function(...e) {
				U(n).onToggleActions?.apply(this, e);
			}), K(e, t);
		};
		J(x, (e) => {
			U(n).internalLocked || e(S);
		}), A(r);
		var C = z(r, 2), w = (e) => {
			var t = Yi(), n = L(t), r = L(n, !0);
			A(n);
			var i = z(n);
			A(t), B(() => {
				q(r, U(s)), i.disabled = U(o);
			}), W("click", i, () => m()), K(e, t);
		};
		J(C, (e) => {
			U(s) && e(w);
		});
		var T = z(C, 2), E = (e) => {
			var t = Qi(), r = L(t), i = L(r), a = L(i);
			{
				let e = /* @__PURE__ */ M(() => U(n).sessionStarting ? "loader-circle" : "plus");
				Q(a, { get name() {
					return U(e);
				} });
			}
			var o = z(a), s = L(o, !0);
			A(o), A(i);
			var c = z(i, 2), l = (e) => {
				var t = Zi();
				Y(t, 21, () => U(n).agents, (e) => e.id, (e, t) => {
					var r = Xi();
					let i;
					var a = L(r), o = L(a, !0);
					A(a);
					var s = z(a), c = L(s, !0);
					A(s), A(r), B(() => {
						Z(r, "data-agent-choice", U(t).id), i = X(r, 1, "", null, i, { active: U(t).id === U(n).selectedAgentId }), q(o, U(t).label), q(c, U(t).summary);
					}), W("click", r, () => U(n).onChooseAgent(U(t).id)), K(e, r);
				}), A(t), K(e, t);
			};
			J(c, (e) => {
				U(n).chooserOpen && e(l);
			}), A(r), A(t), B(() => {
				Z(i, "title", U(d)), Z(i, "aria-label", U(d)), i.disabled = U(n).sessionStarting || !U(n).agents.length, Z(i, "aria-expanded", U(n).chooserOpen), q(s, U(n).sessionStarting ? "Creating Session..." : "New Session");
			}), W("click", i, function(...e) {
				U(n).onToggleChooser?.apply(this, e);
			}), K(e, t);
		};
		J(T, (e) => {
			U(n).actionsOpen && !U(n).internalLocked && e(E);
		}), B(() => {
			Z(i, "data-agent-draft-key", U(n).draftKey), Z(i, "placeholder", U(n).unavailableReason || "Send input to the selected agent session"), i.disabled = U(u), li(i, U(a)), Z(_, "title", U(o) ? "Sending..." : U(n).unavailableReason || "Send input"), Z(_, "aria-label", U(o) ? "Sending..." : U(n).unavailableReason || "Send input"), _.disabled = U(u);
		}), vr("submit", r, m), W("input", i, (e) => p(e.currentTarget.value)), W("keydown", i, h), K(e, t);
	}, b = (e) => {
		var t = ra(), r = L(t), i = (e) => {
			K(e, ea());
		};
		J(r, (e) => {
			U(n).externalLocked && e(i);
		});
		var a = z(r, 2), o = (e) => {
			var t = ta();
			Q(L(t), { name: "rotate-ccw" }), j(), A(t), W("click", t, function(...e) {
				U(n).onResume?.apply(this, e);
			}), K(e, t);
		};
		J(a, (e) => {
			U(n).canResume && e(o);
		});
		var s = z(a, 2), c = (e) => {
			var t = na(), r = L(t), i = L(r);
			{
				let e = /* @__PURE__ */ M(() => U(n).sessionStarting ? "loader-circle" : "plus");
				Q(i, { get name() {
					return U(e);
				} });
			}
			var a = z(i), o = L(a, !0);
			A(a), A(r);
			var s = z(r, 2), c = (e) => {
				var t = Zi();
				Y(t, 21, () => U(n).agents, (e) => e.id, (e, t) => {
					var r = Xi();
					let i;
					var a = L(r), o = L(a, !0);
					A(a);
					var s = z(a), c = L(s, !0);
					A(s), A(r), B(() => {
						Z(r, "data-agent-choice", U(t).id), i = X(r, 1, "", null, i, { active: U(t).id === U(n).selectedAgentId }), q(o, U(t).label), q(c, U(t).summary);
					}), W("click", r, () => U(n).onChooseAgent(U(t).id)), K(e, r);
				}), A(t), K(e, t);
			};
			J(s, (e) => {
				U(n).chooserOpen && e(c);
			}), A(t), B(() => {
				Z(r, "title", U(d)), Z(r, "aria-label", U(d)), r.disabled = U(n).sessionStarting || !U(n).agents.length, Z(r, "aria-expanded", U(n).chooserOpen), q(o, U(n).sessionStarting ? "Creating Session..." : "New Session");
			}), W("click", r, function(...e) {
				U(n).onToggleChooser?.apply(this, e);
			}), K(e, t);
		};
		J(s, (e) => {
			!U(n).internalLocked && !U(n).externalLocked && e(c);
		}), A(t), K(e, t);
	};
	J(v, (e) => {
		U(n).live ? e(y) : e(b, -1);
	}), K(e, _), Ue();
}
yr([
	"input",
	"keydown",
	"click"
]);
//#endregion
//#region src/islands/CreateDialog.svelte
var aa = /* @__PURE__ */ G("<span> </span>"), oa = /* @__PURE__ */ G("<option> </option>"), sa = /* @__PURE__ */ G("<label><span>Template</span> <select name=\"templateName\"><option>Blank task</option><!></select></label>"), ca = /* @__PURE__ */ G("<p class=\"template-description\"> </p>"), la = /* @__PURE__ */ G("<div class=\"create-dialog-tabs\" role=\"tablist\" aria-label=\"Task content\"><button type=\"button\" role=\"tab\">Edit</button> <button type=\"button\" role=\"tab\">Preview</button></div>"), ua = /* @__PURE__ */ G("<small> </small>"), da = /* @__PURE__ */ G("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), fa = /* @__PURE__ */ G("<p class=\"create-task-preview-hint\">Fields changed since this preview was rendered. Refresh to update.</p>"), pa = /* @__PURE__ */ G("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), ma = /* @__PURE__ */ G("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), ha = /* @__PURE__ */ G("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <small> </small></section>"), ga = /* @__PURE__ */ G("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), _a = /* @__PURE__ */ G("<div class=\"create-task-preview-pane\" role=\"tabpanel\" aria-label=\"Task preview\"><div class=\"template-preview-actions\"><button type=\"button\" class=\"secondary compact\"> </button> <!></div> <!> <!> <!></div>"), va = /* @__PURE__ */ G("<small>(generated by template)</small>"), ya = /* @__PURE__ */ G("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), ba = /* @__PURE__ */ G("<input type=\"checkbox\"/><span> </span>", 1), xa = /* @__PURE__ */ G("<textarea></textarea>"), Sa = /* @__PURE__ */ G("<select><option>Select...</option><!></select>"), Ca = /* @__PURE__ */ G("<input/>"), wa = /* @__PURE__ */ G("<label><!> <!> <!> <!> <!></label>"), Ta = /* @__PURE__ */ G("<div class=\"template-fields\" aria-label=\"Required template fields\"></div>"), Ea = /* @__PURE__ */ G("<textarea name=\"detail\" placeholder=\"Task detail\"></textarea>"), Da = /* @__PURE__ */ G("<div class=\"template-fields\" aria-label=\"Optional template fields\"></div>"), Oa = /* @__PURE__ */ G("<div class=\"create-task-automation-fields\"><label><span>Agent <small>(optional)</small></span><select name=\"agentName\"><option>Workspace default</option><!></select></label> <label><span>Run instructions</span><textarea name=\"prompt\" placeholder=\"Instructions for the automated run\"></textarea></label> <label><span>Preferred Agent Profiles</span><input name=\"agentProfiles\" placeholder=\"Workspace default, or kimi, codex\"/><small> </small></label> <label><span>Completion criteria</span><textarea name=\"completionCriteria\" placeholder=\"Natural-language completion criteria\"></textarea></label></div>"), ka = /* @__PURE__ */ G("<div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span><input name=\"slug\" placeholder=\"optional-slug\"/></label></div> <!> <details class=\"create-task-more-options\"><summary> </summary> <div class=\"create-task-more-options-body\"><!> <label class=\"create-task-automation-toggle\"><input name=\"selfDriving\" type=\"checkbox\"/><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label> <!></div></details>", 1), Aa = /* @__PURE__ */ G("<div class=\"create-task-dialog-body\"><!> <!> <!> <!></div>"), ja = /* @__PURE__ */ G("<textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/>", 1), Ma = /* @__PURE__ */ G("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function Na(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(I(m(U(n).draft))), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(!1), o = /* @__PURE__ */ M(() => U(r).type === "task"), s = /* @__PURE__ */ M(() => U(n).templates.find((e) => e.name === U(r).templateName)), c = /* @__PURE__ */ M(() => U(n).preview?.title || ""), l = /* @__PURE__ */ M(() => U(r).titleOverride ? U(r).title : U(c)), u = /* @__PURE__ */ M(() => (U(s)?.fields || []).filter((e) => e.required)), d = /* @__PURE__ */ M(() => (U(s)?.fields || []).filter((e) => !e.required)), f = /* @__PURE__ */ M(() => U(r).editedMarkdown != null && !!U(n).preview && U(r).editedMarkdown !== U(n).preview?.markdown), p = /* @__PURE__ */ M(() => !U(n).preview || U(n).previewKey !== U(n).previewRequestKey(U(r)));
	Si(() => t.channel.subscribe((e) => {
		let t = U(n).preview;
		F(n, e, !0), e.identity === U(i) ? e.preview && e.preview !== t && U(r).editedMarkdown == null && (U(r).editedMarkdown = e.preview.markdown) : (F(i, e.identity, !0), F(r, m(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), Si(() => {
		let e = (e) => {
			U(n).open && e.key === "Escape" && !U(n).submitting && (e.preventDefault(), U(n).onClose());
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function m(e) {
		return {
			...e,
			templateFields: { ...e.templateFields }
		};
	}
	function h(e) {
		return e.hasDefault ? e.default ?? "" : e.type !== "boolean" && "";
	}
	async function g(e) {
		if (U(a)) return;
		let t = e.currentTarget.value;
		if (t === U(r).templateName) return;
		if ((Object.values(U(r).templateFields).some((e) => !!e) || U(r).titleOverride || U(r).editedMarkdown != null) && !U(n).onConfirmTemplateSwitch()) {
			F(a, !0), await cr(), F(a, !1);
			return;
		}
		let i = U(n).templates.find((e) => e.name === t);
		U(r).templateName = t, U(r).templateFields = {};
		for (let e of i?.fields || []) U(r).templateFields[e.name] = h(e);
		U(r).title = "", U(r).titleOverride = !1, U(r).activeTab = "edit", U(r).editedMarkdown = null, U(r).showOptions = !1;
	}
	function _(e, t) {
		let n = t.currentTarget;
		U(r).templateFields[e.name] = e.type === "boolean" && n instanceof HTMLInputElement ? n.checked : n.value;
	}
	async function v(e) {
		U(r).activeTab = e, e === "preview" && U(r).templateName && U(p) && await U(n).onPreview(m(U(r)));
	}
	async function y(e) {
		e.preventDefault(), U(n).submitting || await U(n).onSubmit(m(U(r)));
	}
	async function b() {
		!U(n).previewing && !U(n).submitting && await U(n).onPreview(m(U(r)));
	}
	function x(e) {
		U(r).title = e.currentTarget.value, U(r).templateName && (U(r).titleOverride = !0);
	}
	function S(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var C = Dr(), w = R(C), T = (e) => {
		var t = Ma(), i = L(t), a = z(i, 2);
		let c;
		var m = L(a), h = L(m), C = L(h), w = L(C, !0);
		A(C);
		var T = z(C, 2), E = (e) => {
			var t = aa(), n = L(t, !0);
			A(t), B(() => q(n, U(r).projectId)), K(e, t);
		};
		J(T, (e) => {
			U(o) && e(E);
		}), A(h);
		var D = z(h, 2);
		Q(L(D), { name: "x" }), A(D), A(m);
		var ee = z(m, 2), te = L(ee), ne = (e) => {
			var t = Aa(), i = L(t), a = (e) => {
				var t = sa(), i = z(L(t), 2), a = L(i);
				a.value = a.__value = "", Y(z(a), 17, () => U(n).templates, (e) => e.name, (e, t) => {
					var n = oa(), r = L(n, !0);
					A(n);
					var i = {};
					B((e) => {
						n.disabled = !U(t).valid, q(r, e), i !== (i = U(t).name) && (n.value = (n.__value = U(t).name) ?? "");
					}, [() => S(U(t))]), K(e, n);
				}), A(i);
				var o;
				ti(i), A(t), B(() => {
					o !== (o = U(r).templateName) && (i.value = (i.__value = U(r).templateName) ?? "", ei(i, U(r).templateName));
				}), W("change", i, g), K(e, t);
			};
			J(i, (e) => {
				U(n).templates.length && e(a);
			});
			var o = z(i, 2), c = (e) => {
				var t = ca(), n = L(t, !0);
				A(t), B(() => q(n, U(s).description)), K(e, t);
			};
			J(o, (e) => {
				U(s)?.description && e(c);
			});
			var m = z(o, 2), h = (e) => {
				var t = la(), n = L(t);
				let i;
				var a = z(n, 2);
				let o;
				A(t), B(() => {
					i = X(n, 1, "create-dialog-tab", null, i, { active: U(r).activeTab === "edit" }), Z(n, "aria-selected", U(r).activeTab === "edit"), o = X(a, 1, "create-dialog-tab", null, o, { active: U(r).activeTab === "preview" }), Z(a, "aria-selected", U(r).activeTab === "preview");
				}), W("click", n, () => v("edit")), W("click", a, () => v("preview")), K(e, t);
			};
			J(m, (e) => {
				U(s) && e(h);
			});
			var y = z(m, 2), C = (e) => {
				var t = _a(), i = L(t), a = L(i), o = L(a, !0);
				A(a);
				var s = z(a, 2), c = (e) => {
					var t = ua(), i = L(t);
					A(t), B(() => q(i, `Template ${U(r).templateName ?? ""} · ${U(n).templateDigest ?? ""}`)), K(e, t);
				};
				J(s, (e) => {
					U(n).templateDigest && e(c);
				}), A(i);
				var l = z(i, 2), u = (e) => {
					var t = da(), r = L(t, !0);
					A(t), B(() => q(r, U(n).previewError)), K(e, t);
				};
				J(l, (e) => {
					U(n).previewError && e(u);
				});
				var d = z(l, 2), m = (e) => {
					K(e, fa());
				};
				J(d, (e) => {
					!U(n).previewError && U(p) && U(n).preview && e(m);
				});
				var h = z(d, 2), g = (e) => {
					var t = ha(), i = L(t), a = L(i, !0);
					A(i);
					var o = z(i, 2);
					it(o);
					var s = z(o, 2), c = (e) => {
						var t = pa(), i = z(L(t), 2);
						A(t), W("click", i, () => U(r).editedMarkdown = U(n).preview?.markdown ?? null), K(e, t);
					}, l = (e) => {
						K(e, ma());
					};
					J(s, (e) => {
						U(f) ? e(c) : e(l, -1);
					});
					var u = z(s, 2), d = (e) => {
						var t = ua(), r = L(t);
						A(t), B(() => q(r, `Slug: ${U(n).preview.slug ?? ""}`)), K(e, t);
					};
					J(u, (e) => {
						U(n).preview.slug && e(d);
					});
					var p = z(u, 2), m = L(p);
					A(p), A(t), B(() => {
						q(a, U(n).preview.title), q(m, `Self-Driving: ${U(n).preview.selfDriving ? `on with ${U(n).preview.selfDriving.agentName || "workspace default"}` : "off"}`);
					}), mi(o, () => U(r).editedMarkdown, (e) => U(r).editedMarkdown = e), K(e, t);
				}, _ = (e) => {
					K(e, ga());
				};
				J(h, (e) => {
					U(n).preview ? e(g) : U(n).previewing && e(_, 1);
				}), A(t), B(() => {
					a.disabled = U(n).previewing || U(n).submitting, q(o, U(n).previewing ? "Rendering..." : "Refresh");
				}), W("click", a, b), K(e, t);
			}, w = (e) => {
				var t = ka(), i = R(t), a = L(i), o = L(a), c = z(L(o)), f = (e) => {
					K(e, va());
				};
				J(c, (e) => {
					U(s)?.taskTitle && !U(r).titleOverride && e(f);
				}), A(o);
				var p = z(o, 2), m = L(p);
				ci(m);
				var h = z(m, 2), g = (e) => {
					var t = ya();
					W("click", t, () => {
						U(r).title = "", U(r).titleOverride = !1;
					}), K(e, t);
				};
				J(h, (e) => {
					U(s)?.taskTitle && U(r).titleOverride && e(g);
				}), A(p), A(a);
				var v = z(a, 2), y = z(L(v));
				ci(y), A(v), A(i);
				var b = z(i, 2), S = (e) => {
					var t = Dr(), n = R(t), i = (e) => {
						var t = Ta();
						Y(t, 21, () => U(u), (e) => e.name, (e, t) => {
							var n = wa();
							let i;
							var a = L(n), o = (e) => {
								var n = ba(), i = R(n);
								ci(i);
								var a = z(i), o = L(a, !0);
								A(a), B(() => {
									ui(i, U(r).templateFields[U(t).name] === !0), q(o, U(t).label);
								}), W("change", i, (e) => _(U(t), e)), K(e, n);
							}, s = (e) => {
								var n = aa(), r = L(n);
								A(n), B(() => q(r, `${U(t).label ?? ""}${U(t).required ? " *" : ""}`)), K(e, n);
							};
							J(a, (e) => {
								U(t).type === "boolean" ? e(o) : e(s, -1);
							});
							var c = z(a, 2), l = (e) => {
								var n = xa();
								it(n), B((e) => {
									n.required = U(t).required, Z(n, "placeholder", U(t).placeholder || ""), li(n, e);
								}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("input", n, (e) => _(U(t), e)), K(e, n);
							};
							J(c, (e) => {
								U(t).type === "textarea" && e(l);
							});
							var u = z(c, 2), d = (e) => {
								var n = Sa(), i = L(n);
								i.value = i.__value = "", Y(z(i), 17, () => U(t).options || [], Pr, (e, t) => {
									var n = oa(), r = L(n, !0);
									A(n);
									var i = {};
									B(() => {
										q(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
									}), K(e, n);
								}), A(n);
								var a;
								ti(n), B((e) => {
									n.required = U(t).required, a !== (a = e) && (n.value = (n.__value = e) ?? "", ei(n, e));
								}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("change", n, (e) => _(U(t), e)), K(e, n);
							};
							J(u, (e) => {
								U(t).type === "select" && e(d);
							});
							var f = z(u, 2), p = (e) => {
								var n = Ca();
								ci(n), B((e) => {
									n.required = U(t).required, Z(n, "placeholder", U(t).placeholder || ""), li(n, e);
								}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("input", n, (e) => _(U(t), e)), K(e, n);
							};
							J(f, (e) => {
								U(t).type === "text" && e(p);
							});
							var m = z(f, 2), h = (e) => {
								var n = ua(), r = L(n, !0);
								A(n), B(() => q(r, U(t).description)), K(e, n);
							};
							J(m, (e) => {
								U(t).description && e(h);
							}), A(n), B(() => i = X(n, 1, "", null, i, { "template-boolean": U(t).type === "boolean" })), K(e, n);
						}), A(t), K(e, t);
					};
					J(n, (e) => {
						U(u).length && e(i);
					}), K(e, t);
				}, C = (e) => {
					var t = Ea();
					it(t), mi(t, () => U(r).detail, (e) => U(r).detail = e), K(e, t);
				};
				J(b, (e) => {
					U(s) ? e(S) : e(C, -1);
				});
				var w = z(b, 2), T = L(w), E = L(T);
				A(T);
				var D = z(T, 2), ee = L(D), te = (e) => {
					var t = Da();
					Y(t, 21, () => U(d), (e) => e.name, (e, t) => {
						var n = wa();
						let i;
						var a = L(n), o = (e) => {
							var n = ba(), i = R(n);
							ci(i);
							var a = z(i), o = L(a, !0);
							A(a), B(() => {
								ui(i, U(r).templateFields[U(t).name] === !0), q(o, U(t).label);
							}), W("change", i, (e) => _(U(t), e)), K(e, n);
						}, s = (e) => {
							var n = aa(), r = L(n, !0);
							A(n), B(() => q(r, U(t).label)), K(e, n);
						};
						J(a, (e) => {
							U(t).type === "boolean" ? e(o) : e(s, -1);
						});
						var c = z(a, 2), l = (e) => {
							var n = xa();
							it(n), B((e) => {
								Z(n, "placeholder", U(t).placeholder || ""), li(n, e);
							}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("input", n, (e) => _(U(t), e)), K(e, n);
						};
						J(c, (e) => {
							U(t).type === "textarea" && e(l);
						});
						var u = z(c, 2), d = (e) => {
							var n = Sa(), i = L(n);
							i.value = i.__value = "", Y(z(i), 17, () => U(t).options || [], Pr, (e, t) => {
								var n = oa(), r = L(n, !0);
								A(n);
								var i = {};
								B(() => {
									q(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
								}), K(e, n);
							}), A(n);
							var a;
							ti(n), B((e) => {
								a !== (a = e) && (n.value = (n.__value = e) ?? "", ei(n, e));
							}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("change", n, (e) => _(U(t), e)), K(e, n);
						};
						J(u, (e) => {
							U(t).type === "select" && e(d);
						});
						var f = z(u, 2), p = (e) => {
							var n = Ca();
							ci(n), B((e) => {
								Z(n, "placeholder", U(t).placeholder || ""), li(n, e);
							}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("input", n, (e) => _(U(t), e)), K(e, n);
						};
						J(f, (e) => {
							U(t).type === "text" && e(p);
						});
						var m = z(f, 2), h = (e) => {
							var n = ua(), r = L(n, !0);
							A(n), B(() => q(r, U(t).description)), K(e, n);
						};
						J(m, (e) => {
							U(t).description && e(h);
						}), A(n), B(() => i = X(n, 1, "", null, i, { "template-boolean": U(t).type === "boolean" })), K(e, n);
					}), A(t), K(e, t);
				};
				J(ee, (e) => {
					U(d).length && e(te);
				});
				var ne = z(ee, 2), re = L(ne);
				ci(re), j(), A(ne);
				var ie = z(ne, 2), ae = (e) => {
					var t = Oa(), i = L(t), a = z(L(i)), o = L(a);
					o.value = o.__value = "", Y(z(o), 17, () => U(n).agents, (e) => e.id, (e, t) => {
						var n = oa(), r = L(n);
						A(n);
						var i = {};
						B(() => {
							q(r, `${U(t).label ?? ""} — ${U(t).summary ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
						}), K(e, n);
					}), A(a), A(i);
					var s = z(i, 2), c = z(L(s));
					it(c), A(s);
					var l = z(s, 2), u = z(L(l));
					ci(u);
					var d = z(u), f = L(d, !0);
					A(d), A(l);
					var p = z(l, 2), m = z(L(p));
					it(m), A(p), A(t), B((e) => q(f, e), [() => U(n).profileKeys.length ? `Available: ${U(n).profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."]), ni(a, () => U(r).agentName, (e) => U(r).agentName = e), mi(c, () => U(r).prompt, (e) => U(r).prompt = e), mi(u, () => U(r).agentProfiles, (e) => U(r).agentProfiles = e), mi(m, () => U(r).completionCriteria, (e) => U(r).completionCriteria = e), K(e, t);
				};
				J(ie, (e) => {
					U(r).selfDriving && e(ae);
				}), A(D), A(w), B(() => {
					m.required = !U(s)?.taskTitle, li(m, U(s)?.taskTitle ? U(l) : U(r).title), Z(m, "placeholder", U(s)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), q(E, `More options${U(r).selfDriving ? " · Self-Driving on" : ""}`);
				}), W("input", m, x), mi(y, () => U(r).slug, (e) => U(r).slug = e), hi(re, () => U(r).selfDriving, (e) => U(r).selfDriving = e), bi("open", "toggle", w, (e) => U(r).showOptions = e, () => U(r).showOptions), K(e, t);
			};
			J(y, (e) => {
				U(s) && U(r).activeTab === "preview" ? e(C) : e(w, -1);
			}), A(t), K(e, t);
		}, re = (e) => {
			var t = ja(), n = R(t);
			it(n);
			var i = z(n, 2);
			ci(i), mi(n, () => U(r).description, (e) => U(r).description = e), mi(i, () => U(r).slug, (e) => U(r).slug = e), K(e, t);
		};
		J(te, (e) => {
			U(o) ? e(ne) : e(re, -1);
		});
		var ie = z(te, 2), ae = L(ie), oe = L(ae, !0);
		A(ae);
		var se = z(ae, 2);
		A(ie), A(ee), A(a), A(t), B(() => {
			c = X(a, 1, "create-dialog modal-enter", null, c, { "create-task-dialog": U(o) }), Z(a, "aria-label", U(o) ? "Create task" : "Create project"), q(w, U(o) ? "Create task" : "Create project"), D.disabled = U(n).submitting, ae.disabled = U(n).submitting, q(oe, U(n).submitting ? "Creating..." : "Create"), se.disabled = U(n).submitting;
		}), W("click", i, function(...e) {
			U(n).onClose?.apply(this, e);
		}), W("click", D, function(...e) {
			U(n).onClose?.apply(this, e);
		}), vr("submit", ee, y), W("click", se, function(...e) {
			U(n).onClose?.apply(this, e);
		}), K(e, t);
	};
	J(w, (e) => {
		U(n).open && e(T);
	}), K(e, C), Ue();
}
yr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region src/api/client.ts
var Pa = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, Fa = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, Ia = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new Fa(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new Fa(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new Fa(e.scope));
		this.active.clear();
	}
}, La = class {
	requests = new Ia();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: za(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: za(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof Fa) ? new Fa(n) : e;
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
			let n = Ra(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new Pa(e.status, r, n);
		}
		return t;
	}
};
function Ra(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function za(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new La();
//#endregion
//#region src/islands/DiffModal.svelte
var Ba = /* @__PURE__ */ G("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), Va = /* @__PURE__ */ G("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), Ha = /* @__PURE__ */ G("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), Ua = /* @__PURE__ */ G("<div class=\"diff-viewer\"></div>"), Wa = /* @__PURE__ */ G("<div class=\"diff-modal-layer\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function Ga(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(void 0), o = /* @__PURE__ */ M(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	yn(() => {
		let e = t.repo, a = U(o);
		if (F(n, null), F(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		F(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (F(n, r, !0), await cr(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (F(i, n instanceof Error ? n.message : String(n), !0), t.onError(U(i)));
		}).finally(() => {
			t.repo === e && (F(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), yn(() => {
		U(n)?.diff, U(a), s();
	}), Ci(() => t.client.requests.abort(U(o)));
	function s() {
		!U(a) || !U(n)?.diff || !window.Diff2Html || (U(a).innerHTML = window.Diff2Html.html(U(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Dr(), l = R(c), u = (e) => {
		var o = Wa(), s = L(o), c = z(s, 2), l = L(c), u = L(l), d = L(u), f = L(d, !0);
		A(d);
		var p = z(d), m = L(p);
		A(p), A(u);
		var h = z(u);
		Q(L(h), { name: "x" }), A(h), A(l);
		var g = z(l, 2), _ = (e) => {
			var n = Ba(), r = L(n);
			Q(r, { name: "loader-circle" });
			var i = z(r, 2), a = L(i, !0);
			A(i), A(n), B(() => q(a, t.repo.worktreePath || "")), K(e, n);
		}, v = (e) => {
			var t = Va(), n = L(t);
			Q(n, { name: "triangle-alert" });
			var r = z(n, 2), a = L(r, !0);
			A(r), A(t), B(() => q(a, U(i))), K(e, t);
		}, y = (e) => {
			var t = Ha();
			Q(L(t), { name: "check-circle-2" }), j(2), A(t), K(e, t);
		}, b = /* @__PURE__ */ M(() => !U(n)?.hasChanges || !U(n).diff?.trim()), x = (e) => {
			var t = Ua();
			yi(t, (e) => F(a, e), () => U(a)), K(e, t);
		};
		J(g, (e) => {
			U(r) ? e(_) : U(i) ? e(v, 1) : U(b) ? e(y, 2) : e(x, -1);
		}), A(c), A(o), B(() => {
			q(f, U(n)?.branch || t.repo.branch || t.repo.name || "Diff"), q(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), W("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), W("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), K(e, o);
	};
	J(l, (e) => {
		t.repo && e(u);
	}), K(e, c), Ue();
}
yr(["click"]);
//#endregion
//#region src/islands/detail.ts
function Ka(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function qa(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${$a(e)}</pre>`;
}
function Ja(e) {
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
function Ya(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function Xa(e) {
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
function Za(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function Qa(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...Qa(a.children || [], t, n, r + 1));
	return i;
}
function $a(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/islands/FileBrowser.svelte
var eo = /* @__PURE__ */ G("<a class=\"artifact-download\"><!></a>"), to = /* @__PURE__ */ G("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), no = /* @__PURE__ */ G("<div class=\"empty-list-row\"><!><span> </span></div>"), ro = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span> </span></h3> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function io(e, t) {
	He(t, !0);
	let n = xi(t, "entries", 19, () => []), r = xi(t, "emptyMessage", 3, "No files."), i = xi(t, "activePath", 3, ""), a = /* @__PURE__ */ M(() => Qa(n(), t.expanded, t.title)), o = /* @__PURE__ */ M(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var c = ro(), l = L(c), u = L(l);
	Q(u, { get name() {
		return U(o);
	} });
	var d = z(u), f = L(d, !0);
	A(d), A(l);
	var p = z(l, 2), m = L(p), h = L(m), g = (e) => {
		var n = Dr();
		Y(R(n), 17, () => U(a), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ M(() => U(n).entry.type === "directory"), a = /* @__PURE__ */ M(() => t.expanded.has(`${t.title}:${U(n).entry.path}`));
			var o = to(), c = L(o);
			let l;
			var u = L(c), d = L(u), f = L(d), p = (e) => {
				{
					let t = /* @__PURE__ */ M(() => U(a) ? "chevron-down" : "chevron-right");
					Q(e, { get name() {
						return U(t);
					} });
				}
			};
			J(f, (e) => {
				U(r) && e(p);
			}), A(d);
			var m = z(d);
			{
				let e = /* @__PURE__ */ M(() => U(r) ? U(a) ? "folder-open" : "folder" : s(U(n).entry.name)), t = /* @__PURE__ */ M(() => U(r) ? "artifact-icon artifact-icon-dir" : "artifact-icon");
				Q(m, {
					get name() {
						return U(e);
					},
					get className() {
						return U(t);
					}
				});
			}
			var h = z(m), g = L(h, !0);
			A(h), A(u);
			var _ = z(u, 2), v = L(_), y = (e) => {
				var r = eo();
				Q(L(r), {
					name: "download",
					className: "artifact-download-icon"
				}), A(r), B((e) => {
					Z(r, "href", e), Z(r, "download", U(n).entry.name), Z(r, "title", `Download ${U(n).entry.name}`), Z(r, "aria-label", `Download ${U(n).entry.name}`);
				}, [() => t.rawURL(t.title, U(n).entry.path, !0)]), W("click", r, (e) => e.stopPropagation()), K(e, r);
			};
			J(v, (e) => {
				U(r) || e(y);
			});
			var b = z(v), x = L(b, !0);
			A(b), A(_), A(c), A(o), B((e) => {
				l = X(c, 1, "artifact-row", null, l, {
					directory: U(r),
					file: !U(r),
					active: i() === `${t.title}:${U(n).entry.path}`
				}), $r(c, `--depth: ${U(n).depth}`), Z(h, "title", U(n).entry.path), q(g, U(n).entry.name), q(x, e);
			}, [() => U(r) ? `${(U(n).entry.children || []).length} items` : Za(U(n).entry.size || 0)]), W("click", c, () => U(r) ? t.onToggle(`${t.title}:${U(n).entry.path}`) : t.onPreview(t.title, U(n).entry.path)), K(e, o);
		}), K(e, n);
	}, _ = (e) => {
		var n = no(), i = L(n);
		{
			let e = /* @__PURE__ */ M(() => t.title === "Artifacts" ? "archive" : "inbox");
			Q(i, { get name() {
				return U(e);
			} });
		}
		var a = z(i), o = L(a, !0);
		A(a), A(n), B(() => q(o, r())), K(e, n);
	};
	J(h, (e) => {
		U(a).length ? e(g) : e(_, -1);
	}), A(m), A(p), A(c), B(() => q(f, t.title)), K(e, c), Ue();
}
yr(["click"]);
//#endregion
//#region src/islands/FilePreviewModal.svelte
var ao = /* @__PURE__ */ G("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), oo = /* @__PURE__ */ G("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), so = /* @__PURE__ */ G("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), co = /* @__PURE__ */ G("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), lo = /* @__PURE__ */ G("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), uo = /* @__PURE__ */ G("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), fo = /* @__PURE__ */ G("<div class=\"file-modal-layer\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function po(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(null), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ M(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ M(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : "");
	yn(() => {
		let e = t.selection, o = U(a);
		if (F(n, null), F(i, ""), !e) {
			t.client.requests.abort(o);
			return;
		}
		F(r, !0);
		let s = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${s}?path=${encodeURIComponent(e.path)}`, { scope: o }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && F(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (F(i, n instanceof Error ? n.message : String(n), !0), t.onError(U(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (F(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Ci(() => t.client.requests.abort(U(a)));
	var s = Dr(), c = R(s), l = (e) => {
		var a = fo(), s = L(a), c = z(s, 2), l = L(c), u = L(l), d = L(u), f = L(d, !0);
		A(d);
		var p = z(d), m = L(p);
		A(p), A(u);
		var h = z(u), g = L(h);
		Q(L(g), { name: "external-link" }), j(), A(g);
		var _ = z(g);
		Q(L(_), { name: "x" }), A(_), A(h), A(l);
		var v = z(l, 2), y = (e) => {
			var n = ao(), r = L(n);
			Q(r, { name: "loader-circle" });
			var i = z(r, 2), a = L(i, !0);
			A(i), A(n), B(() => q(a, t.selection.path)), K(e, n);
		}, b = (e) => {
			var t = oo(), n = L(t);
			Q(n, { name: "triangle-alert" });
			var r = z(n, 2), a = L(r, !0);
			A(r), A(t), B(() => q(a, U(i))), K(e, t);
		}, x = (e) => {
			var r = so(), i = L(r);
			A(r), B(() => {
				Z(i, "src", U(o)), Z(i, "alt", U(n).name || t.selection.path);
			}), K(e, r);
		}, S = (e) => {
			var r = co(), i = L(r);
			Q(i, { name: "file-warning" });
			var a = z(i), o = L(a, !0);
			A(a);
			var s = z(a), c = L(s);
			A(s), A(r), B((e) => {
				q(o, U(n).name || t.selection.path), q(c, `Binary file, ${e ?? ""}.`);
			}, [() => Za(U(n).size || 0)]), K(e, r);
		}, C = (e) => {
			var t = lo();
			Ur(t, () => qa(U(n)?.content || ""), !0), A(t), K(e, t);
		}, w = /* @__PURE__ */ M(() => Ka(U(n)?.path || t.selection.path)), T = (e) => {
			var t = uo(), r = L(t, !0);
			A(t), B(() => q(r, U(n)?.content || "")), K(e, t);
		};
		J(v, (e) => {
			U(r) ? e(y) : U(i) ? e(b, 1) : U(n)?.image ? e(x, 2) : U(n)?.binary ? e(S, 3) : U(w) ? e(C, 4) : e(T, -1);
		}), A(c), A(a), B((e, r) => {
			Z(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${U(n)?.contentHash || "pending"}`), q(f, e), q(m, `${t.selection.path ?? ""}${r ?? ""}${U(n)?.truncated ? " · truncated" : ""}`), Z(g, "href", U(o));
		}, [() => U(n)?.name || t.selection.path.split("/").pop() || "File preview", () => U(n)?.size == null ? "" : ` · ${Za(U(n).size)}`]), W("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), W("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), K(e, a);
	};
	J(c, (e) => {
		t.selection && e(l);
	}), K(e, s), Ue();
}
yr(["click"]);
//#endregion
//#region src/islands/LogTimeline.svelte
var mo = /* @__PURE__ */ G("<div class=\"markdown-rendered\"></div>"), ho = /* @__PURE__ */ G("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), go = /* @__PURE__ */ G("<p class=\"log-load-error\" role=\"alert\"> </p>"), _o = /* @__PURE__ */ G("<div class=\"log-load-actions\"><button type=\"button\" class=\"secondary-button log-load-more\"><!><span> </span></button></div>"), vo = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Log</span></h3> <div class=\"log-timeline\"></div> <!> <!></div>");
function yo(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ M(() => [...t.logs || []].sort(Ya)), r = /* @__PURE__ */ P(!1);
	async function i() {
		if (!(t.loading || U(r))) {
			F(r, !0);
			try {
				await t.onLoadMore();
			} finally {
				F(r, !1), queueMicrotask(t.onIconsChanged);
			}
		}
	}
	var a = Dr(), o = R(a), s = (e) => {
		var a = vo(), o = L(a);
		Q(L(o), { name: "history" }), j(), A(o);
		var s = z(o, 2);
		Y(s, 21, () => U(n), (e) => e.id, (e, t) => {
			var n = ho(), r = L(n), i = L(r), a = L(i), o = L(a, !0);
			A(a);
			var s = z(a), c = L(s, !0);
			A(s), A(i);
			var l = z(i, 2), u = L(l, !0);
			A(l);
			var d = z(l, 2);
			Q(L(d), { name: "chevron-right" }), A(d), A(r);
			var f = z(r, 2);
			let p;
			var m = L(f), h = (e) => {
				var n = mo();
				Ur(n, () => qa(U(t).details), !0), A(n), K(e, n);
			}, g = (e) => {
				K(e, Er("No details."));
			};
			J(m, (e) => {
				U(t).details ? e(h) : e(g, -1);
			}), A(f), A(n), B((e) => {
				Z(n, "data-log-id", U(t).id), Z(i, "title", U(t).time), q(o, e), q(c, U(t).time), q(u, U(t).title || "Untitled log entry"), p = X(f, 1, "log-details", null, p, { empty: !U(t).details });
			}, [() => Xa(U(t).time)]), K(e, n);
		}), A(s);
		var c = z(s, 2), l = (e) => {
			var n = go(), r = L(n, !0);
			A(n), B(() => q(r, t.error)), K(e, n);
		};
		J(c, (e) => {
			t.error && e(l);
		});
		var u = z(c, 2), d = (e) => {
			var n = _o(), a = L(n), o = L(a);
			{
				let e = /* @__PURE__ */ M(() => t.loading || U(r) ? "loader-circle" : "chevron-down"), n = /* @__PURE__ */ M(() => t.loading || U(r) ? "spin" : "");
				Q(o, {
					get name() {
						return U(e);
					},
					get className() {
						return U(n);
					}
				});
			}
			var s = z(o), c = L(s, !0);
			A(s), A(a), A(n), B(() => {
				a.disabled = t.loading || U(r), Z(a, "aria-busy", t.loading || U(r)), q(c, t.loading || U(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), W("click", a, i), K(e, n);
		};
		J(u, (e) => {
			t.hasMore && e(d);
		}), A(a), B(() => Z(a, "data-log-resource", t.resourceId)), K(e, a);
	};
	J(o, (e) => {
		(U(n).length || t.error || t.hasMore) && e(s);
	}), K(e, a), Ue();
}
yr(["click"]);
//#endregion
//#region src/islands/MarkdownDocument.svelte
var bo = /* @__PURE__ */ G("<a class=\"markdown-open-file\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a>"), xo = /* @__PURE__ */ G("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), So = /* @__PURE__ */ G("<pre class=\"markdown-view\"> </pre>"), Co = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span> </span> <!></h3> <!></div>");
function wo(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ M(() => Ka(t.file.name)), r = /* @__PURE__ */ M(() => `/api/workspaces/${encodeURIComponent(t.workspaceId)}/files/raw?path=${encodeURIComponent(t.file.path || "")}`);
	var i = Co(), a = L(i), o = L(a);
	Q(o, { name: "file-text" });
	var s = z(o), c = L(s, !0);
	A(s);
	var l = z(s, 2), u = (e) => {
		var n = bo();
		Q(L(n), { name: "external-link" }), j(), A(n), B(() => {
			Z(n, "href", U(r)), Z(n, "aria-label", `Open ${t.file.name} in new window`);
		}), K(e, n);
	};
	J(l, (e) => {
		U(n) && t.file.path && e(u);
	}), A(a);
	var d = z(a, 2), f = (e) => {
		var n = xo(), r = L(n);
		Ur(r, () => qa(t.file.content || ""), !0), A(r), A(n), K(e, n);
	}, p = (e) => {
		var n = So(), r = L(n, !0);
		A(n), B(() => q(r, t.file.content || "")), K(e, n);
	};
	J(d, (e) => {
		U(n) ? e(f) : e(p, -1);
	}), A(i), B(() => {
		Z(i, "data-doc-file", t.file.name), Z(i, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`), q(c, t.file.name);
	}), K(e, i), Ue();
}
//#endregion
//#region src/islands/WorkspaceAgentsEditor.svelte
var To = /* @__PURE__ */ G("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), Eo = /* @__PURE__ */ G("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), Do = /* @__PURE__ */ G("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), Oo = /* @__PURE__ */ G("<p class=\"log-load-error\" role=\"alert\"> </p>"), ko = /* @__PURE__ */ G("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><!><span> </span></button></div></form>"), Ao = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function jo(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(""), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(!1), c = /* @__PURE__ */ P(""), l = /* @__PURE__ */ M(() => U(r) !== U(i)), u = /* @__PURE__ */ M(() => !!(U(l) && U(o) && U(a) && U(o) !== U(a)));
	yn(() => {
		let e = Ja(t.file?.content || ""), u = t.file?.contentHash || "";
		F(o, u, !0), t.identity === U(n) ? !U(l) && u !== U(a) && (F(r, e, !0), F(i, e, !0), F(a, u, !0)) : (F(n, t.identity, !0), F(r, e, !0), F(i, e, !0), F(a, u, !0), F(c, ""), F(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), U(s) || !U(l)) return;
		let u = U(n);
		F(s, !0), F(c, "");
		try {
			let e = await t.onSave(U(r), U(a));
			if (U(n) !== u) return;
			F(i, Ja(e.content || U(r)), !0), F(r, U(i), !0), F(a, e.contentHash || "", !0), F(o, U(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			U(n) === u && F(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			U(n) === u && (F(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = Ao(), p = L(f);
	Q(L(p), { name: "file-text" }), j(), A(p);
	var m = z(p, 2), h = (e) => {
		var t = To();
		Q(L(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), j(), A(t), K(e, t);
	}, g = (e) => {
		var n = Eo(), r = L(n);
		Q(r, { name: "triangle-alert" });
		var i = z(r, 2), a = L(i, !0);
		A(i), A(n), B(() => q(a, t.file.error)), K(e, n);
	}, _ = (e) => {
		var t = ko(), n = L(t);
		it(n);
		var i = z(n, 2), a = (e) => {
			K(e, Do());
		};
		J(i, (e) => {
			U(u) && e(a);
		});
		var o = z(i, 2), f = (e) => {
			var t = Oo(), n = L(t, !0);
			A(t), B(() => q(n, U(c))), K(e, t);
		};
		J(o, (e) => {
			U(c) && e(f);
		});
		var p = z(o, 2), m = L(p), h = L(m);
		{
			let e = /* @__PURE__ */ M(() => U(s) ? "loader-circle" : "save");
			Q(h, { get name() {
				return U(e);
			} });
		}
		var g = z(h), _ = L(g, !0);
		A(g), A(m), A(p), A(t), B(() => {
			n.disabled = U(s), m.disabled = U(s) || !U(l), q(_, U(s) ? "Saving" : "Save");
		}), vr("submit", t, d), mi(n, () => U(r), (e) => F(r, e)), K(e, t);
	};
	J(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), A(f), K(e, f), Ue();
}
//#endregion
//#region src/islands/DetailPanel.svelte
var Mo = /* @__PURE__ */ G("<div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div>"), No = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), Po = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), Fo = /* @__PURE__ */ G("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> </h1></div></div> <!> <!>", 1), Io = /* @__PURE__ */ G("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), Lo = /* @__PURE__ */ G("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), Ro = /* @__PURE__ */ G("<div class=\"details-actions\"><!><button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button></div>"), zo = /* @__PURE__ */ G("<div class=\"empty-state\"><!><strong>Loading details...</strong></div>"), Bo = /* @__PURE__ */ G("<span class=\"details-tab-count\"> </span>"), Vo = /* @__PURE__ */ G("<button type=\"button\" role=\"tab\"><span> </span><!></button>"), Ho = /* @__PURE__ */ G("<div><!></div>"), Uo = /* @__PURE__ */ G("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), Wo = /* @__PURE__ */ G("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), Go = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Task Templates</span></h3><div class=\"template-list\"><!></div></div>"), Ko = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Template</span></h3><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), qo = /* @__PURE__ */ G("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), Jo = /* @__PURE__ */ G("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), Yo = /* @__PURE__ */ G("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><h3><!><span>Worktrees</span></h3><div class=\"worktree-list\"><!></div></div></div>", 1), Xo = /* @__PURE__ */ G("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <code class=\"resource-ref-badge\"> </code></h1><!></div></div> <!>", 1), Zo = /* @__PURE__ */ G("<!> <!> <!>", 1);
function Qo(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(I(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ P(null), s = /* @__PURE__ */ P(null), c = /* @__PURE__ */ new Map(), l = new La(), u = /* @__PURE__ */ M(() => (U(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), d = /* @__PURE__ */ M(() => new Set(U(u).map((e) => e.name))), f = /* @__PURE__ */ M(h), p = /* @__PURE__ */ M(() => U(o) ? `${U(o).section}:${U(o).path}` : "");
	Si(() => t.channel.subscribe((e) => {
		if (F(n, e, !0), e.identity !== U(r)) {
			U(r) && U(i) && c.set(U(r), U(i)), F(r, e.identity, !0), F(o, null), F(s, null), F(a, /* @__PURE__ */ new Set(), !0), F(i, c.get(U(r)) || m(e), !0);
			let t = document.getElementById("detailsPanel");
			t && (t.scrollTop = 0);
		} else U(f).length && !U(f).some((e) => e.id === U(i)) && F(i, U(f)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), Si(() => {
		let e = (e) => {
			e.key === "Escape" && (U(s) ? (e.preventDefault(), F(s, null)) : U(o) && (e.preventDefault(), F(o, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Ci(() => l.dispose());
	function m(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : t.some((e) => e.name === "work.md") ? "work" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "logs";
	}
	function h() {
		if (!U(n).detail) return [];
		let e = [];
		return U(d).has("project.md") && e.push({
			id: "project",
			label: "Project"
		}), U(d).has("task.md") && e.push({
			id: "task",
			label: "Task"
		}), U(d).has("work.md") && e.push({
			id: "work",
			label: "Work"
		}), (U(n).resourceType === "project" || U(n).detail.template) && e.push({
			id: "template",
			label: "Template"
		}), e.push({
			id: "logs",
			label: "Logs"
		}, {
			id: "artifacts",
			label: "Artifacts"
		}), U(n).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees"
		}), e;
	}
	function g(e) {
		return e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : e.name === "work.md" ? "work" : U(f).find((e) => [
			"project",
			"task",
			"work"
		].includes(e.id))?.id || "";
	}
	function _(e) {
		F(i, e, !0), c.set(U(r), e);
	}
	function v(e) {
		let t = new Set(U(a));
		t.has(e) ? t.delete(e) : t.add(e), F(a, t, !0), queueMicrotask(U(n).onIconsChanged);
	}
	function y(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(U(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function b(e, t) {
		F(o, {
			section: e,
			path: t
		}, !0);
	}
	function x(e) {
		e && U(n).onToast(e);
	}
	var S = Zo(), C = R(S), w = (e) => {
		var t = Mo();
		Q(L(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), j(2), A(t), K(e, t);
	}, T = (e) => {
		var t = Fo(), r = R(t), i = L(r), o = L(i), s = L(o, !0);
		A(o), A(i);
		var c = z(i), l = L(c), u = L(l, !0);
		A(l), A(c), A(r);
		var d = z(r, 2);
		jo(d, {
			get identity() {
				return U(n).identity;
			},
			get file() {
				return U(n).workspaceAgents;
			},
			get onSave() {
				return U(n).onSaveWorkspaceAgents;
			},
			get onToast() {
				return U(n).onToast;
			},
			get onIconsChanged() {
				return U(n).onIconsChanged;
			}
		});
		var f = z(d, 2), m = (e) => {
			var t = No(), r = L(t);
			Q(L(r), { name: "book-open" }), j(), A(r);
			var i = z(r), a = L(i);
			Q(a, { name: "triangle-alert" });
			var o = z(a, 2), s = L(o, !0);
			A(o), A(i), A(t), B(() => q(s, U(n).wiki.error)), K(e, t);
		}, h = (e) => {
			var t = Po(), n = L(t);
			Q(L(n), { name: "book-open" }), j(), A(n);
			var r = z(n);
			Q(L(r), { name: "book-open" }), j(2), A(r), A(t), K(e, t);
		}, g = (e) => {
			{
				let t = /* @__PURE__ */ M(() => U(n).wiki.entries || []);
				io(e, {
					title: "Wiki",
					get entries() {
						return U(t);
					},
					emptyMessage: "No Wiki files yet.",
					get expanded() {
						return U(a);
					},
					get activePath() {
						return U(p);
					},
					onToggle: v,
					onPreview: b,
					rawURL: y
				});
			}
		};
		J(f, (e) => {
			U(n).wiki?.error ? e(m) : U(n).wiki?.exists ? e(g, -1) : e(h, 1);
		}), B(() => {
			q(s, U(n).workspaceName), q(u, U(n).workspaceName);
		}), W("click", o, () => U(n).onNavigate("workspace")), K(e, t);
	}, E = (e) => {
		var t = Xo(), r = R(t), o = L(r), c = L(o), l = L(c, !0);
		A(c);
		var d = z(c, 2), m = (e) => {
			var t = Io(), r = z(R(t)), i = L(r, !0);
			A(r), B(() => q(i, U(n).parent.title)), W("click", r, () => U(n).onNavigate(U(n).parent?.id || "workspace")), K(e, t);
		};
		J(d, (e) => {
			U(n).parent && e(m);
		});
		var h = z(d, 3), x = L(h, !0);
		A(h), A(o);
		var S = z(o, 2), C = L(S), w = L(C, !0), T = z(w), E = L(T, !0);
		A(T), A(C);
		var D = z(C), ee = (e) => {
			var t = Ro(), r = L(t), i = (e) => {
				var t = Lo();
				Q(L(t), { name: "plus" }), j(), A(t), W("click", t, () => U(n).onCreateTask(U(n).resourceId)), K(e, t);
			};
			J(r, (e) => {
				U(n).resourceType === "project" && e(i);
			});
			var a = z(r);
			Q(L(a), { name: "archive" }), j(), A(a), A(t), W("click", a, () => U(n).onArchive(U(n).resourceId)), K(e, t);
		};
		J(D, (e) => {
			U(n).detail && e(ee);
		}), A(S), A(r);
		var te = z(r, 2), ne = (e) => {
			var t = zo();
			Q(L(t), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), j(), A(t), K(e, t);
		}, re = (e) => {
			var t = Yo(), r = R(t);
			Y(r, 21, () => U(f), (e) => e.id, (e, t) => {
				var r = Vo();
				let a;
				var o = L(r), s = L(o, !0);
				A(o);
				var c = z(o), l = (e) => {
					var t = Bo(), r = L(t, !0);
					A(t), B(() => q(r, U(n).detail.logs.length)), K(e, t);
				};
				J(c, (e) => {
					U(t).id === "logs" && U(n).detail.logs?.length && e(l);
				}), A(r), B(() => {
					a = X(r, 1, "details-tab", null, a, { active: U(i) === U(t).id }), Z(r, "aria-selected", U(i) === U(t).id), q(s, U(t).label);
				}), W("click", r, () => _(U(t).id)), K(e, r);
			}), A(r);
			var o = z(r, 2);
			Y(o, 17, () => U(u), (e) => e.path || e.name, (e, t) => {
				var r = Ho();
				wo(L(r), {
					get file() {
						return U(t);
					},
					get workspaceId() {
						return U(n).workspaceId;
					}
				}), A(r), B((e) => Z(r, "hidden", e), [() => U(i) !== g(U(t))]), K(e, r);
			});
			var c = z(o, 2), l = L(c), d = (e) => {
				var t = Go(), r = L(t);
				Q(L(r), { name: "layout-template" }), j(), A(r);
				var i = z(r), a = L(i), o = (e) => {
					var t = Dr();
					Y(R(t), 17, () => U(n).detail.templates, (e) => e.name, (e, t) => {
						var n = Uo();
						let r;
						var i = L(n);
						Q(i, { name: "file-text" });
						var a = z(i), o = L(a), s = L(o, !0);
						A(o);
						var c = z(o), l = L(c);
						A(c), A(a), Q(z(a), { name: "chevron-right" }), A(n), B(() => {
							r = X(n, 1, "template-row", null, r, { invalid: !U(t).valid }), q(s, U(t).title || U(t).name), q(l, `${U(t).name ?? ""} · v${(U(t).schemaVersion || "?") ?? ""} · ${U(t).valid ? `${(U(t).fields || []).length} fields` : `invalid${U(t).errors?.[0]?.message ? `: ${U(t).errors[0].message}` : ""}`}${U(t).legacy ? " · legacy" : ""}`);
						}), W("click", n, () => U(t).path && b("Templates", U(t).path)), K(e, n);
					}), K(e, t);
				}, s = (e) => {
					var t = Wo();
					Q(L(t), { name: "layout-template" }), j(), A(t), K(e, t);
				};
				J(a, (e) => {
					U(n).detail.templates?.length ? e(o) : e(s, -1);
				}), A(i), A(t), K(e, t);
			}, m = (e) => {
				var t = Ko(), r = L(t);
				Q(L(r), { name: "layout-template" }), j(), A(r);
				var i = z(r), a = L(i), o = L(a);
				Q(o, { name: "file-text" });
				var s = z(o), c = L(s), l = L(c, !0);
				A(c);
				var u = z(c), d = L(u);
				A(u), A(s), A(a), A(i), A(t), B(() => {
					q(l, U(n).detail.template.name), q(d, `Created from template · v${(U(n).detail.template.schemaVersion || "?") ?? ""} · ${(U(n).detail.template.digest || "") ?? ""}`);
				}), K(e, t);
			};
			J(l, (e) => {
				U(n).resourceType === "project" ? e(d) : U(n).detail.template && e(m, 1);
			}), A(c);
			var h = z(c, 2), x = L(h);
			{
				let e = /* @__PURE__ */ M(() => U(n).detail.logs || []);
				yo(x, {
					get resourceId() {
						return U(n).resourceId;
					},
					get logs() {
						return U(e);
					},
					get hasMore() {
						return U(n).logs.hasMore;
					},
					get loading() {
						return U(n).logs.loading;
					},
					get error() {
						return U(n).logs.error;
					},
					onLoadMore: () => U(n).onLoadMoreLogs(U(n).resourceId),
					get onIconsChanged() {
						return U(n).onIconsChanged;
					}
				});
			}
			A(h);
			var S = z(h, 2), C = L(S);
			{
				let e = /* @__PURE__ */ M(() => U(n).detail.artifacts || []);
				io(C, {
					title: "Artifacts",
					get entries() {
						return U(e);
					},
					emptyMessage: "No artifacts.",
					get expanded() {
						return U(a);
					},
					get activePath() {
						return U(p);
					},
					onToggle: v,
					onPreview: b,
					rawURL: y
				});
			}
			A(S);
			var w = z(S, 2), T = L(w), E = L(T);
			Q(L(E), { name: "folder-git-2" }), j(), A(E);
			var D = z(E), ee = L(D), te = (e) => {
				var t = Dr();
				Y(R(t), 17, () => U(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = qo(), r = L(n), i = L(r);
					Q(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = z(i), o = L(a), c = L(o, !0);
					A(o);
					var l = z(o), u = L(l);
					A(l);
					var d = z(l), f = L(d, !0);
					A(d), A(a), A(r);
					var p = z(r);
					Q(L(p), { name: "git-compare-arrows" }), j(), A(p), A(n), B(() => {
						q(c, U(t).branch || "HEAD"), q(u, `${(U(t).name || "repository") ?? ""}${U(t).targetBranch || U(t).baseBranch ? ` · base ${U(t).targetBranch || U(t).baseBranch}` : ""}`), q(f, U(t).worktreePath || "");
					}), W("click", p, () => F(s, U(t), !0)), K(e, n);
				}), K(e, t);
			}, ne = (e) => {
				var t = Jo();
				Q(L(t), { name: "git-branch" }), j(), A(t), K(e, t);
			};
			J(ee, (e) => {
				U(n).detail.repos?.length ? e(te) : e(ne, -1);
			}), A(D), A(T), A(w), B(() => {
				Z(c, "hidden", U(i) !== "template"), Z(h, "hidden", U(i) !== "logs"), Z(S, "hidden", U(i) !== "artifacts"), Z(w, "hidden", U(i) !== "worktrees");
			}), K(e, t);
		};
		J(te, (e) => {
			U(n).loading || !U(n).detail ? e(ne) : e(re, -1);
		}), B(() => {
			q(l, U(n).workspaceName), q(x, U(n).resourceTitle), q(w, U(n).resourceTitle), q(E, U(n).resourceId);
		}), W("click", c, () => U(n).onNavigate("workspace")), W("click", h, () => U(n).onNavigate(U(n).resourceId)), K(e, t);
	};
	J(C, (e) => {
		U(n).workspaceId ? U(n).resourceType === "workspace" ? e(T, 1) : e(E, -1) : e(w);
	});
	var D = z(C, 2);
	po(D, {
		get client() {
			return l;
		},
		get workspaceId() {
			return U(n).workspaceId;
		},
		get resourceId() {
			return U(n).resourceId;
		},
		get selection() {
			return U(o);
		},
		onClose: () => F(o, null),
		onError: x,
		get onIconsChanged() {
			return U(n).onIconsChanged;
		}
	}), Ga(z(D, 2), {
		get client() {
			return l;
		},
		get workspaceId() {
			return U(n).workspaceId;
		},
		get resourceId() {
			return U(n).resourceId;
		},
		get repo() {
			return U(s);
		},
		onClose: () => F(s, null),
		onError: x,
		get onIconsChanged() {
			return U(n).onIconsChanged;
		}
	}), K(e, S), Ue();
}
yr(["click"]);
//#endregion
//#region src/islands/chat-state.ts
var $o = 250, es = /* @__PURE__ */ new Set(["session.launch-environment"]), ts = class {
	api;
	eventSourceFactory;
	contexts = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	onEvent;
	onNotice;
	activeKey = "";
	disposed = !1;
	constructor(e = {}) {
		this.api = e.api ?? new La(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t) {
		if (this.disposed) return;
		let n = String(t?.id || "").trim(), r = os(e, n);
		if (this.activeKey && this.activeKey !== r && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !e || !n) {
			this.emit();
			return;
		}
		let i = this.contexts.get(r) ?? this.createContext(e, n);
		i.run = t, i.acceptedSessionIds = ds(t), this.reconcileNotices(i), !fs(t) && i.stream && (i.streamGeneration++, i.stream.close(), i.stream = null), this.emit(), !i.loaded && !i.loading ? this.loadInitial(i) : this.connect(i);
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.beforeId) return !1;
		let t = e.generation, n = e.beforeId;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest(cs(e, `before=${encodeURIComponent(n)}&limit=${$o}`), { scope: ss(e, "older") });
			if (!this.isCurrent(e, t)) return !1;
			let i = as(r.events), a = ls(i);
			return i.length && (!a || a >= n) ? (e.hasMoreBefore = !1, !1) : (e.events = ns([...i, ...e.events]), a && (e.beforeId = a), e.hasMoreBefore = !!(r.page?.hasMoreBefore && a), i.length > 0);
		} catch (n) {
			return n instanceof Fa || !this.isCurrent(e, t) || (e.error = gs(n)), !1;
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
			events: e.events.filter((e) => !es.has(e.type)),
			notices: [...e.notices],
			hasMoreBefore: e.hasMoreBefore,
			loading: e.loading,
			loadingOlder: e.loadingOlder,
			loaded: e.loaded,
			error: e.error
		} : hs();
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
			key: os(e, t),
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
			stream: null
		};
		return this.contexts.set(n.key, n), n;
	}
	async loadInitial(e) {
		let t = e.generation;
		e.loading = !0, e.error = "", this.emit();
		try {
			let n = await this.api.latest(cs(e, `latest=true&limit=${$o}`), { scope: ss(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			let r = as(n.events).filter((t) => this.eventBelongsToContext(e, t));
			e.events = ns(r), e.beforeId = ls(r), e.hasMoreBefore = !!(n.page?.hasMoreBefore && e.beforeId), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof Fa || !this.isCurrent(e, t)) return;
			e.error = gs(n);
		} finally {
			this.isCurrent(e, t) && (e.loading = !1, this.emit());
		}
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !fs(e.run)) return;
		let t = us(e.events), n = t ? `?after=${encodeURIComponent(t)}` : "", r = ++e.streamGeneration, i = this.eventSourceFactory(`/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/stream${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.events = rs(e.events, n), this.onEvent?.(e.workspaceId, e.runId, n), this.emit();
			} catch {
				e.error = "An Agent event could not be decoded.", this.emit();
			}
		}, i.addEventListener("forge.notice", (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.noticeBelongsToContext(e, n)) return;
				this.appendNotice(e, n), this.onNotice?.(e.workspaceId, e.runId, n), this.emit();
			} catch {
				e.error = "A Forge notice could not be decoded.", this.emit();
			}
		}), i.onerror = () => {
			if (!this.isActiveStream(e, i, r)) {
				i.close();
				return;
			}
			fs(e.run) || (i.close(), e.stream = null);
		};
	}
	appendNotice(e, t) {
		let n = ps(t);
		if (n) {
			let r = Number(t.data?.schedulerTurnSequence) || 0, i = e.noticeWatermarks.get(n) || 0;
			if (i && r <= i) return;
			e.noticeWatermarks.set(n, Math.max(i, r)), e.notices = e.notices.filter((e) => ps(e) !== n);
		} else if (e.notices.some((e) => ms(e) === ms(t))) return;
		e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20);
	}
	reconcileNotices(e) {
		let t = e.run;
		e.notices = e.notices.filter((e) => {
			if (!ps(e)) return !0;
			let n = e.data || {};
			if (!t || String(n.runId || "") !== t.id || String(n.resourceId || "") !== String(t.resourceId || "") || Number(n.selfDrivingRevision) !== Number(t.selfDrivingRevision)) return !1;
			let r = Number(n.schedulerTurnSequence) || 0, i = Number(t.schedulerTurnSequence) || 0;
			return !(i > r || t.schedulerTurn && (!r || i >= r));
		});
	}
	deactivate(e) {
		e && (e.generation++, e.streamGeneration++, e.stream?.close(), e.stream = null, e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(ss(e, "initial")), this.api.requests.abort(ss(e, "older")));
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
function ns(e) {
	let t = [];
	for (let n of e) t = rs(t, n);
	return t;
}
function rs(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return e;
	let r = e.findIndex((e) => Number(e.id) === n), i = [...e];
	if (r < 0) i.push(is(t));
	else {
		let n = e[r];
		if (t.data?.append === !0) {
			let e = typeof n.data?.text == "string" ? n.data.text : "", a = typeof t.data.text == "string" ? t.data.text : "";
			i[r] = {
				...n,
				...t,
				startTime: t.startTime || n.startTime,
				data: {
					...n.data,
					...t.data,
					append: !1,
					text: e + a
				}
			};
		} else i[r] = {
			...t,
			startTime: t.startTime || n.startTime
		};
	}
	return i.sort((e, t) => Number(e.id) - Number(t.id));
}
function is(e) {
	return e.data?.append === !0 ? {
		...e,
		data: {
			...e.data,
			append: !1
		}
	} : e;
}
function as(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function os(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function ss(e, t) {
	return `chat:${e.key}:${t}`;
}
function cs(e, t) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/events?${t}`;
}
function ls(e) {
	return e.reduce((e, t) => {
		let n = Number(t.id) || 0;
		return n && (!e || n < e) ? n : e;
	}, 0);
}
function us(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function ds(e) {
	return new Set([
		e?.id,
		e?.agentHubSessionId,
		e?.sourceExternalId
	].map((e) => String(e || "").trim()).filter(Boolean));
}
function fs(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e?.status || ""));
}
function ps(e) {
	let t = e.data || {};
	return t.kind !== "self-driving-finish" || t.lifecycle !== "until-reconcile" ? "" : [
		t.kind,
		t.runId,
		t.resourceId,
		t.selfDrivingRevision
	].map((e) => String(e ?? "")).join(":");
}
function ms(e) {
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
function hs() {
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
function gs(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/islands/EventTimeline.svelte
var _s = /* @__PURE__ */ G("<button type=\"button\" class=\"load-older-events\"><!><span> </span></button>"), vs = /* @__PURE__ */ G("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), ys = /* @__PURE__ */ G("<span class=\"agent-message-tag\">steer</span>"), bs = /* @__PURE__ */ G("<span class=\"agent-message-source\"> </span>"), xs = /* @__PURE__ */ G("<div class=\"agent-message-content markdown-rendered\"></div>"), Ss = /* @__PURE__ */ G("<p> </p>"), Cs = /* @__PURE__ */ G("<div><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>"), ws = /* @__PURE__ */ G("<details class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>"), Ts = /* @__PURE__ */ G("<pre> </pre>"), Es = /* @__PURE__ */ G("<details><summary><!><span> </span><small> </small></summary> <!></details>"), Ds = /* @__PURE__ */ G("<details class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>"), Os = /* @__PURE__ */ G("<p class=\"approval-question\"> </p>"), ks = /* @__PURE__ */ G("<button> </button>"), As = /* @__PURE__ */ G("<div class=\"approval-options\"></div>"), js = /* @__PURE__ */ G("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), Ms = /* @__PURE__ */ G("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), Ns = /* @__PURE__ */ G("<!> <!>", 1), Ps = /* @__PURE__ */ G("<div class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>"), Fs = /* @__PURE__ */ G("<div><!><span> </span><span class=\"agent-note-time\"> </span></div>"), Is = /* @__PURE__ */ G("<div class=\"agent-event error\"><div><!><strong>Provider error</strong></div><p> </p></div>"), Ls = /* @__PURE__ */ G("<details class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>"), Rs = /* @__PURE__ */ G("<div><!></div>"), zs = /* @__PURE__ */ G("<div><div><!><strong>Forge</strong></div><p> </p></div>"), Bs = /* @__PURE__ */ G("<div class=\"agent-event error\" role=\"alert\"><div><!><strong>Timeline error</strong></div><p> </p></div>"), Vs = /* @__PURE__ */ G("<div class=\"tty-empty\"><!><strong>Loading agent events</strong></div>"), Hs = /* @__PURE__ */ G("<div class=\"tty-empty\"><!><strong>Waiting for agent events</strong></div>"), Us = /* @__PURE__ */ G("<!> <!> <!> <!> <!> <!>", 1), Ws = /* @__PURE__ */ G("<div class=\"tty-empty\"><!><strong>No agent run selected</strong><span> </span></div>"), Gs = /* @__PURE__ */ G("<div class=\"event-timeline-root\"><!></div>");
function Ks(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(I(le())), i = /* @__PURE__ */ M(() => U(n).project(U(r).events)), a = /* @__PURE__ */ P(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ P(I(/* @__PURE__ */ new Map())), d = /* @__PURE__ */ P(I(/* @__PURE__ */ new Set())), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ P(I(/* @__PURE__ */ new Map()));
	Si(() => {
		let e = S();
		o = new ts({
			onEvent: (e, t, r) => U(n).onEvent(e, t, r),
			onNotice: (e, t, r) => U(n).onNotice(e, t, r)
		});
		let r = o.subscribe((e) => m(e)), i = t.channel.subscribe((e) => {
			let t = U(n).identity;
			F(n, e, !0), e.identity !== t && (l = !0, s = null, F(p, new Map(f.get(e.identity) ?? []), !0)), o?.activate(e.workspaceId, e.activeRun), queueMicrotask(e.onIconsChanged);
		}), a = () => {
			if (!s || C()) return;
			let e = s;
			s = null, h(e);
		};
		return document.addEventListener("selectionchange", a), () => {
			r(), i(), document.removeEventListener("selectionchange", a), o?.dispose(), o = void 0, e && e.removeAttribute("data-agent-run-id");
		};
	});
	function m(e) {
		if (U(r).identity && e.identity === U(r).identity && C()) {
			s = e;
			return;
		}
		h(e);
	}
	function h(e) {
		let t = S();
		c = e.identity !== U(r).identity || l || w(t), l = !1, F(r, e, !0), t && (t.dataset.agentRunId = e.runId), cr().then(() => {
			c && !C() && T(), U(n).onIconsChanged(), e.loaded && e.hasMoreBefore && g(e.identity);
		});
	}
	async function g(e) {
		let t = 0;
		for (; t < 16 && U(r).identity === e && U(r).hasMoreBefore;) {
			let e = S();
			if (!e || e.scrollHeight > e.clientHeight + 160 || C() || !await o?.loadOlder()) return;
			t++, await cr(), T();
		}
	}
	async function _() {
		let e = S();
		if (!e || U(r).loadingOlder) return;
		let t = E(e), i = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = U(r).identity;
		await o?.loadOlder(), await cr(), U(r).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - i) : s + (e.scrollHeight - a), U(n).onIconsChanged());
	}
	async function v(e, t) {
		let i = String(e.approvalId || "");
		if (!(!i || U(d).has(i))) {
			F(d, new Set(U(d)).add(i), !0);
			try {
				await U(n).onApproval(U(r).runId, i, t);
				let e = new Map(U(u));
				e.delete(ee(i)), F(u, e, !0);
			} catch (e) {
				U(n).onToast(e instanceof Error ? e.message : String(e));
			} finally {
				let e = new Set(U(d));
				e.delete(i), F(d, e, !0);
			}
		}
	}
	function y(e, t) {
		let n = D(e);
		F(p, new Map(U(p)).set(n, t), !0), f.set(U(r).identity, new Map(U(p)));
	}
	function b(e, t) {
		let n = U(p).get(D(e));
		return typeof n == "boolean" ? n : t === U(i).length - 1 || !!e.calls?.some((e) => e.status === "running");
	}
	function x(e, t) {
		F(u, new Map(U(u)).set(ee(e), t), !0);
	}
	function S() {
		return U(a)?.parentElement ?? null;
	}
	function C() {
		let e = S(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function w(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function T() {
		let e = S();
		e && (e.scrollTop = e.scrollHeight);
	}
	function E(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function D(e) {
		return `${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
	}
	function ee(e) {
		return `${U(r).identity}:${e}`;
	}
	function te(e) {
		return e.role === "assistant" ? U(n).agentName || "Agent" : String(e.sender?.name || e.sender?.id || "").trim() || (e.role === "system" ? "System" : e.role === "agent" ? "Agent" : "User");
	}
	function ne(e) {
		let t = new Date(e || "");
		return Number.isNaN(t.valueOf()) ? "" : t.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function re(e) {
		if (e.active) return "Thinking…";
		if (!e.startTime || !e.time) return "Thought";
		let t = Math.round((new Date(e.time).getTime() - new Date(e.startTime).getTime()) / 1e3);
		return !Number.isFinite(t) || t < 0 ? "Thought" : t < 60 ? `Thought for ${t} ${t === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(t / 60)}m${t % 60}s`;
	}
	function ie(e) {
		let t = String(e || "");
		return !window.marked || !window.DOMPurify ? ae(t).replaceAll("\n", "<br>") : window.DOMPurify.sanitize(window.marked.parse(t));
	}
	function ae(e) {
		return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
	}
	function oe(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	function se(e) {
		return [
			e.error,
			e.output,
			e.rawPreview
		].filter(Boolean).join("\n\n");
	}
	function ce(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	function le() {
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
	var ue = Gs(), de = L(ue), fe = (e) => {
		var t = Us(), n = R(t), a = (e) => {
			var t = _s(), n = L(t);
			{
				let e = /* @__PURE__ */ M(() => U(r).loadingOlder ? "loader-circle" : "chevrons-up");
				Q(n, { get name() {
					return U(e);
				} });
			}
			var i = z(n), a = L(i, !0);
			A(i), A(t), B(() => {
				t.disabled = U(r).loadingOlder, q(a, U(r).loadingOlder ? "Loading..." : "Load older messages");
			}), W("click", t, _), K(e, t);
		};
		J(n, (e) => {
			U(r).hasMoreBefore && e(a);
		});
		var o = z(n, 2);
		Y(o, 19, () => U(i), (e) => D(e), (e, t, n) => {
			var i = Rs(), a = L(i), o = (e) => {
				let n = /* @__PURE__ */ M(() => [
					"assistant",
					"system",
					"agent"
				].includes(String(U(t).role)) ? String(U(t).role) : "user");
				var r = Cs(), i = L(r), a = L(i), o = L(a), s = L(o, !0);
				A(o);
				var c = z(o, 2), l = (e) => {
					var t = vs(), r = L(t, !0);
					A(t), B(() => q(r, U(n))), K(e, t);
				};
				J(c, (e) => {
					U(n) !== "assistant" && e(l);
				});
				var u = z(c, 2), d = (e) => {
					K(e, ys());
				};
				J(u, (e) => {
					U(t).steer && e(d);
				});
				var f = z(u, 2), p = (e) => {
					var n = bs(), r = L(n);
					A(n), B(() => {
						Z(n, "title", U(t).sender.sessionId), q(r, `from session ${U(t).sender.sessionId ?? ""}`);
					}), K(e, n);
				};
				J(f, (e) => {
					U(n) === "agent" && U(t).sender?.sessionId && e(p);
				});
				var m = z(f, 2), h = L(m, !0);
				A(m), A(a);
				var g = z(a, 2), _ = L(g), v = (e) => {
					var n = xs();
					Ur(n, () => ie(U(t).text), !0), A(n), K(e, n);
				}, y = (e) => {
					var n = Ss(), r = L(n, !0);
					A(n), B(() => q(r, U(t).text || "")), K(e, n);
				};
				J(_, (e) => {
					U(n) === "assistant" ? e(v) : e(y, -1);
				}), A(g), A(i), A(r), B((e, t) => {
					X(r, 1, `agent-message-row ${U(n) === "assistant" ? "assistant final" : U(n)}`), q(s, e), q(h, t);
				}, [() => te(U(t)), () => ne(U(t).time)]), K(e, r);
			}, s = (e) => {
				var n = ws(), r = L(n), i = L(r);
				Q(i, { name: "brain-circuit" });
				var a = z(i), o = L(a, !0);
				A(a);
				var s = z(a);
				Q(L(s), { name: "chevron-right" }), A(s), A(r);
				var c = z(r, 2), l = L(c, !0);
				A(c), A(n), B((e) => {
					n.open = U(t).active, q(o, e), q(l, U(t).text || "");
				}, [() => re(U(t))]), K(e, n);
			}, c = (e) => {
				let i = /* @__PURE__ */ M(() => U(t).calls || []), a = /* @__PURE__ */ M(() => U(i).map(oe));
				var o = Ds(), s = L(o), c = L(s);
				Q(L(c), { name: "wrench" }), A(c);
				var l = z(c), u = L(l);
				A(l);
				var d = z(l), f = L(d);
				A(d);
				var p = z(d);
				Q(L(p), { name: "chevron-right" }), A(p), A(s);
				var m = z(s, 2);
				Y(m, 21, () => U(i), (e) => String(e.callId || e.key), (e, t) => {
					var n = Es(), r = L(n), i = L(r);
					{
						let e = /* @__PURE__ */ M(() => U(t).status === "running" ? "loader-circle" : U(t).status === "failed" ? "x-circle" : "check-circle");
						Q(i, { get name() {
							return U(e);
						} });
					}
					var a = z(i), o = L(a, !0);
					A(a);
					var s = z(a), c = L(s, !0);
					A(s), A(r);
					var l = z(r, 2), u = (e) => {
						var n = Ts(), r = L(n, !0);
						A(n), B((e) => q(r, e), [() => se(U(t))]), K(e, n);
					}, d = /* @__PURE__ */ M(() => se(U(t)));
					J(l, (e) => {
						U(d) && e(u);
					}), A(n), B((e, t, r) => {
						X(n, 1, e), q(o, t), q(c, r);
					}, [
						() => `agent-tool-item agent-tool-${String(U(t).status || "completed")}`,
						() => oe(U(t)),
						() => String(U(t).method || "tool")
					]), K(e, n);
				}), A(m), A(o), B((e, t, n) => {
					Z(o, "data-tool-group-key", e), o.open = t, q(u, `${U(i).length ?? ""} tool ${U(i).length === 1 ? "call" : "calls"}`), q(f, `${n ?? ""}${U(a).length > 2 ? ` · +${U(a).length - 2} more` : ""}`);
				}, [
					() => `${U(r).runId}:${String(U(t).key || U(t).time || "tools")}`,
					() => b(U(t), U(n)),
					() => U(a).slice(0, 2).join(" · ")
				]), vr("toggle", o, (e) => y(U(t), e.currentTarget.open)), K(e, o);
			}, l = (e) => {
				let n = /* @__PURE__ */ M(() => String(U(t).approvalId || "")), r = /* @__PURE__ */ M(() => U(u).get(ee(U(n))) || "");
				var i = Ps(), a = L(i), o = L(a);
				Q(o, { name: "shield-question" });
				var s = z(o), c = L(s, !0);
				A(s), A(a);
				var l = z(a, 2), f = (e) => {
					var n = Os(), r = L(n, !0);
					A(n), B(() => q(r, U(t).question)), K(e, n);
				};
				J(l, (e) => {
					U(t).question && e(f);
				});
				var p = z(l, 2), m = (e) => {
					var n = Ss(), r = L(n, !0);
					A(n), B(() => q(r, U(t).detail)), K(e, n);
				};
				J(p, (e) => {
					U(t).detail && e(m);
				});
				var h = z(p, 2), g = (e) => {
					var i = Ns(), a = R(i), o = (e) => {
						var r = As();
						Y(r, 21, () => U(t).options, (e) => e.optionId, (e, r) => {
							var i = ks();
							let a;
							var o = L(i, !0);
							A(i), B((e, t, n) => {
								i.disabled = e, a = X(i, 1, "", null, a, t), q(o, n);
							}, [
								() => U(d).has(U(n)),
								() => ({ "secondary-button": String(U(r).kind || "").startsWith("reject") }),
								() => ce(U(r))
							]), W("click", i, () => v(U(t), { optionId: U(r).optionId })), K(e, i);
						}), A(r), K(e, r);
					}, s = (e) => {
						var r = js(), i = L(r);
						Q(L(i), { name: "check" }), j(), A(i);
						var a = z(i);
						Q(L(a), { name: "x" }), j(), A(a), A(r), B((e, t) => {
							i.disabled = e, a.disabled = t;
						}, [() => U(d).has(U(n)), () => U(d).has(U(n))]), W("click", i, () => v(U(t), { decision: "accept" })), W("click", a, () => v(U(t), { decision: "decline" })), K(e, r);
					};
					J(a, (e) => {
						U(t).options?.length ? e(o) : e(s, -1);
					});
					var c = z(a, 2), l = (e) => {
						var i = Ms(), a = L(i);
						ci(a);
						var o = z(a);
						A(i), B((e) => {
							li(a, U(r)), o.disabled = e;
						}, [() => !U(r).trim() || U(d).has(U(n))]), vr("submit", i, (e) => {
							e.preventDefault(), U(r).trim() && v(U(t), { text: U(r).trim() });
						}), W("input", a, (e) => x(U(n), e.currentTarget.value)), K(e, i);
					};
					J(c, (e) => {
						U(t).question && e(l);
					}), K(e, i);
				}, _ = (e) => {
					var n = Ss(), r = L(n);
					A(n), B(() => q(r, `${(U(t).decision || (U(t).status === "accepted" ? "Allowed" : "Declined")) ?? ""}${U(t).reply ? `: ${U(t).reply}` : ""}`)), K(e, n);
				};
				J(h, (e) => {
					U(t).status === "pending" ? e(g) : e(_, -1);
				}), A(i), B(() => q(c, U(t).title || "Approval requested")), K(e, i);
			}, f = (e) => {
				let n = /* @__PURE__ */ M(() => U(t).tone === "ok" ? "check-circle" : U(t).tone === "danger" ? "triangle-alert" : U(t).tone === "info" ? "info" : "clock");
				var r = Fs(), i = L(r);
				Q(i, { get name() {
					return U(n);
				} });
				var a = z(i), o = L(a, !0);
				A(a);
				var s = z(a), c = L(s, !0);
				A(s), A(r), B((e) => {
					X(r, 1, `agent-system-note agent-lifecycle-${U(t).tone || "muted"}`), q(o, U(t).text || ""), q(c, e);
				}, [() => ne(U(t).time)]), K(e, r);
			}, p = (e) => {
				var n = Is(), r = L(n);
				Q(L(r), { name: "triangle-alert" }), j(), A(r);
				var i = z(r), a = L(i, !0);
				A(i), A(n), B(() => q(a, U(t).text || "")), K(e, n);
			}, m = (e) => {
				var n = Ls(), r = L(n), i = L(r);
				Q(i, { name: "info" });
				var a = z(i), o = L(a);
				A(a), A(r);
				var s = z(r), c = L(s, !0);
				A(s), A(n), B(() => {
					q(o, `Unhandled event: ${(U(t).type || U(t).kind) ?? ""}`), q(c, U(t).preview || "This event carries no payload.");
				}), K(e, n);
			};
			J(a, (e) => {
				U(t).kind === "message" ? e(o) : U(t).kind === "thinking" ? e(s, 1) : U(t).kind === "tools" ? e(c, 2) : U(t).kind === "approval" ? e(l, 3) : U(t).kind === "lifecycle" ? e(f, 4) : U(t).kind === "error" ? e(p, 5) : e(m, -1);
			}), A(i), B((e) => Z(i, "data-timeline-key", e), [() => D(U(t))]), K(e, i);
		});
		var s = z(o, 2);
		Y(s, 19, () => U(r).notices, (e, t) => `notice:${U(r).identity}:${t}:${String(e.data?.schedulerTurnSequence || e.data?.text || "")}`, (e, t, n) => {
			var r = zs(), i = L(r), a = L(i);
			{
				let e = /* @__PURE__ */ M(() => U(t).data?.level === "error" ? "triangle-alert" : "info");
				Q(a, { get name() {
					return U(e);
				} });
			}
			j(), A(i);
			var o = z(i), s = L(o, !0);
			A(o), A(r), B((e) => {
				Z(r, "data-timeline-key", `notice:${U(n)}`), X(r, 1, `agent-event ${U(t).data?.level === "error" ? "error" : "system"}`), q(s, e);
			}, [() => String(U(t).data?.text || "")]), K(e, r);
		});
		var c = z(s, 2), l = (e) => {
			var t = Bs(), n = L(t);
			Q(L(n), { name: "triangle-alert" }), j(), A(n);
			var i = z(n), a = L(i, !0);
			A(i), A(t), B(() => q(a, U(r).error)), K(e, t);
		};
		J(c, (e) => {
			U(r).error && e(l);
		});
		var f = z(c, 2), p = (e) => {
			var t = Vs();
			Q(L(t), { name: "loader-circle" }), j(), A(t), K(e, t);
		};
		J(f, (e) => {
			U(r).loading && !U(i).length && e(p);
		});
		var m = z(f, 2), h = (e) => {
			var t = Hs();
			Q(L(t), { name: "loader-circle" }), j(), A(t), K(e, t);
		};
		J(m, (e) => {
			U(r).loaded && !U(r).loading && !U(i).length && !U(r).notices.length && e(h);
		}), K(e, t);
	}, pe = (e) => {
		var t = Ws(), r = L(t);
		Q(r, { name: "bot" });
		var i = z(r, 2), a = L(i, !0);
		A(i), A(t), B(() => q(a, U(n).runCount ? "Select an Agent Run to view its events." : "Start an agent session.")), K(e, t);
	};
	J(de, (e) => {
		U(r).runId ? e(fe) : e(pe, -1);
	}), A(ue), yi(ue, (e) => F(a, e), () => U(a)), B(() => Z(ue, "data-chat-context", U(r).identity)), K(e, ue), Ue();
}
yr(["click", "input"]);
//#endregion
//#region src/islands/SelfDrivingDialog.svelte
var qs = /* @__PURE__ */ G("<input name=\"agentName\" readonly=\"\" aria-readonly=\"true\"/>"), Js = /* @__PURE__ */ G("<option> </option>"), Ys = /* @__PURE__ */ G("<select name=\"agentName\" required=\"\"><option>Select an Agent</option><!></select>"), Xs = /* @__PURE__ */ G("<p class=\"self-driving-dialog-error\" role=\"alert\"> </p>"), Zs = /* @__PURE__ */ G("<p class=\"self-driving-dialog-error\" role=\"alert\">The result may be unknown. Refresh the task and session state before trying again.</p>"), Qs = /* @__PURE__ */ G("<div class=\"self-driving-dialog-layer\" role=\"presentation\"><button class=\"self-driving-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"self-driving-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"selfDrivingDialogTitle\"><header class=\"self-driving-dialog-header\"><strong id=\"selfDrivingDialogTitle\">Configure Self-Driving</strong> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"selfDrivingConfigForm\" class=\"details-form self-driving-dialog-form\"><label><span>Agent</span> <!></label> <label><span>Run instructions <small>(optional)</small></span> <textarea name=\"runInstructions\" rows=\"4\" placeholder=\"Additional Self-Driving instructions\"></textarea></label> <!> <!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function $s(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(I({ ...U(n).draft })), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ P(void 0), s = /* @__PURE__ */ M(() => U(n).submitting || U(n).unknown || !U(n).reuseCurrentSession && (!U(r).agentName || U(n).agents.length === 0));
	Si(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity !== U(i) && (F(i, e.identity, !0), F(r, { ...e.draft }, !0), F(a, "")), queueMicrotask(e.onIconsChanged);
	})), Si(() => {
		let e = (e) => {
			if (!U(n).open) return;
			if (e.key === "Escape" && !U(n).submitting) {
				e.preventDefault(), U(n).onClose();
				return;
			}
			if (e.key !== "Tab" || !U(o)) return;
			let t = [...U(o).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
			if (!t.length) return;
			let r = t[0], i = t[t.length - 1];
			e.shiftKey && document.activeElement === r ? (e.preventDefault(), i.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r.focus());
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	async function c(e) {
		if (e.preventDefault(), !U(s)) {
			if (!U(n).reuseCurrentSession && !U(r).agentName) {
				F(a, "Select an Agent before enabling Self-Driving.");
				return;
			}
			F(a, ""), await U(n).onSubmit({ ...U(r) });
		}
	}
	var l = Dr(), u = R(l), d = (e) => {
		var t = Qs(), i = L(t), l = z(i, 2), u = L(l), d = z(L(u), 2);
		Q(L(d), { name: "x" }), A(d), A(u);
		var f = z(u, 2), p = L(f), m = z(L(p), 2), h = (e) => {
			var t = qs();
			ci(t), mi(t, () => U(r).agentName, (e) => U(r).agentName = e), K(e, t);
		}, g = (e) => {
			var t = Ys(), i = L(t);
			i.value = i.__value = "", Y(z(i), 17, () => U(n).agents, (e) => e.id, (e, t) => {
				var n = Js(), r = L(n);
				A(n);
				var i = {};
				B(() => {
					q(r, `${U(t).label ?? ""} — ${U(t).summary ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
				}), K(e, n);
			}), A(t), B(() => t.disabled = U(n).agents.length === 0 || U(n).submitting), W("input", t, () => F(a, "")), ni(t, () => U(r).agentName, (e) => U(r).agentName = e), K(e, t);
		};
		J(m, (e) => {
			U(n).reuseCurrentSession ? e(h) : e(g, -1);
		}), A(p);
		var _ = z(p, 2), v = z(L(_), 2);
		it(v), A(_);
		var y = z(_, 2), b = (e) => {
			var t = Xs(), r = L(t, !0);
			A(t), B(() => q(r, U(a) || U(n).error)), K(e, t);
		};
		J(y, (e) => {
			(U(a) || U(n).error) && e(b);
		});
		var x = z(y, 2), S = (e) => {
			K(e, Zs());
		};
		J(x, (e) => {
			U(n).unknown && e(S);
		});
		var C = z(x, 2), w = L(C), T = L(w, !0);
		A(w);
		var E = z(w, 2);
		A(C), A(f), A(l), yi(l, (e) => F(o, e), () => U(o)), A(t), B(() => {
			d.disabled = U(n).submitting, v.disabled = U(n).submitting, w.disabled = U(s), Z(w, "aria-busy", U(n).submitting), q(T, U(n).submitting ? "Enabling…" : "Save and Enable"), E.disabled = U(n).submitting;
		}), W("click", i, function(...e) {
			U(n).onClose?.apply(this, e);
		}), W("click", d, function(...e) {
			U(n).onClose?.apply(this, e);
		}), vr("submit", f, c), W("input", v, () => F(a, "")), mi(v, () => U(r).runInstructions, (e) => U(r).runInstructions = e), W("click", E, function(...e) {
			U(n).onClose?.apply(this, e);
		}), K(e, t);
	};
	J(u, (e) => {
		U(n).open && e(d);
	}), K(e, l), Ue();
}
yr(["click", "input"]);
//#endregion
//#region src/islands/SessionSwitcher.svelte
var ec = /* @__PURE__ */ G("<button type=\"button\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span></button>"), tc = /* @__PURE__ */ G("<div class=\"agent-session-menu\"></div>"), nc = /* @__PURE__ */ G("<div class=\"agent-current-session\"><button type=\"button\" class=\"agent-current-run active\" title=\"Switch session\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span> <!></button></div> <!>", 1), rc = /* @__PURE__ */ G("<div class=\"session-pill\"><strong>No sessions yet</strong><span>Start an agent session from the selected task.</span></div>"), ic = /* @__PURE__ */ G("<div class=\"agent-session-error\" role=\"alert\"> </div>"), ac = /* @__PURE__ */ G("<div id=\"agentSessions\" class=\"agent-session-switcher\"><!> <!></div>");
function oc(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(!1), i = /* @__PURE__ */ P(""), a = /* @__PURE__ */ P(""), o = /* @__PURE__ */ M(() => U(n).runs.find((e) => e.id === U(n).activeRunId) ?? U(n).runs[0] ?? null);
	Si(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== U(n).identity;
			F(n, e, !0), t && (F(r, !1), F(i, ""), F(a, "")), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			U(r) && !t?.closest(".agent-session-switcher") && F(r, !1);
		};
		return document.addEventListener("click", o), () => {
			e(), document.removeEventListener("click", o);
		};
	});
	async function s(e) {
		if (!e || U(i) || e === U(n).activeRunId) {
			e === U(n).activeRunId && F(r, !U(r));
			return;
		}
		F(i, e, !0), F(a, ""), F(r, !1);
		try {
			await U(n).onSelect(e);
		} catch (e) {
			F(a, e instanceof Error ? e.message : String(e), !0), U(n).onToast(U(a));
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
	var d = ac(), f = L(d), p = (e) => {
		var t = nc(), a = R(t), d = L(a), f = L(d), p = L(f), m = L(p, !0);
		A(p);
		var h = z(p, 2), g = L(h), _ = L(g);
		let v;
		var y = z(_, 1, !0);
		A(g);
		var b = z(g, 2), x = L(b, !0);
		A(b), A(h), A(f);
		var S = z(f, 2);
		{
			let e = /* @__PURE__ */ M(() => U(i) ? "loader-circle" : "chevrons-up-down");
			Q(S, {
				get name() {
					return U(e);
				},
				className: "session-select-icon"
			});
		}
		A(d), A(a);
		var C = z(a, 2), w = (e) => {
			var t = tc();
			Y(t, 21, () => U(n).runs, (e) => e.id, (e, t) => {
				var r = ec();
				let a;
				var o = L(r), d = L(o), f = L(d, !0);
				A(d);
				var p = z(d, 2), m = L(p), h = L(m);
				let g;
				var _ = z(h, 1, !0);
				A(m);
				var v = z(m, 2), y = L(v, !0);
				A(v), A(p), A(o), A(r), B((e, i, o, s, c, l) => {
					a = X(r, 1, "agent-session-menu-row", null, a, { active: U(n).activeRunId === U(t).id }), Z(r, "data-agent-run", U(t).id), r.disabled = e, q(f, i), X(m, 1, o), g = X(h, 1, "run-badge-dot", null, g, s), q(_, c), q(y, l);
				}, [
					() => !!U(i),
					() => u(U(t)),
					() => `run-badge run-badge-${c(U(t).status)}`,
					() => ({ "run-badge-pulse": ["running", "attention"].includes(c(U(t).status)) }),
					() => (U(t).status || "unknown").replaceAll("_", " "),
					() => l(U(t).updatedAt)
				]), W("click", r, () => s(U(t).id)), K(e, r);
			}), A(t), K(e, t);
		};
		J(C, (e) => {
			U(r) && e(w);
		}), B((e, t, n, i, a) => {
			Z(d, "data-agent-run", U(o).id), Z(d, "aria-expanded", U(r)), q(m, e), X(g, 1, t), v = X(_, 1, "run-badge-dot", null, v, n), q(y, i), q(x, a);
		}, [
			() => u(U(o)),
			() => `run-badge run-badge-${c(U(o).status)}`,
			() => ({ "run-badge-pulse": ["running", "attention"].includes(c(U(o).status)) }),
			() => (U(o).status || "unknown").replaceAll("_", " "),
			() => l(U(o).updatedAt)
		]), W("click", d, (e) => {
			e.stopPropagation(), F(r, !U(r));
		}), K(e, t);
	}, m = (e) => {
		K(e, rc());
	};
	J(f, (e) => {
		U(o) ? e(p) : e(m, -1);
	});
	var h = z(f, 2), g = (e) => {
		var t = ic(), n = L(t, !0);
		A(t), B(() => q(n, U(a))), K(e, t);
	};
	J(h, (e) => {
		U(a) && e(g);
	}), A(d), B(() => Z(d, "data-session-context", U(n).identity)), K(e, d), Ue();
}
yr(["click"]);
//#endregion
//#region src/islands/SettingsModal.svelte
var sc = /* @__PURE__ */ G("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), cc = /* @__PURE__ */ G("<button type=\"button\"><!><span> </span><!></button>"), lc = /* @__PURE__ */ G("<span class=\"settings-pill\">Active</span>"), uc = /* @__PURE__ */ G("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), dc = /* @__PURE__ */ G("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), fc = /* @__PURE__ */ G("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span><span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/><span> </span><!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), pc = /* @__PURE__ */ G("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), mc = /* @__PURE__ */ G("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Workspaces</h2><p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/><span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>"), hc = /* @__PURE__ */ G("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span><input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/><small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>"), gc = /* @__PURE__ */ G("<span class=\"settings-pill\"> </span>"), _c = /* @__PURE__ */ G("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), vc = /* @__PURE__ */ G("<div class=\"settings-empty\">No AgentHub agents available.</div>"), yc = /* @__PURE__ */ G("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>"), bc = /* @__PURE__ */ G("<option> </option>"), xc = /* @__PURE__ */ G("<span class=\"settings-profile-system-label\">System</span>"), Sc = /* @__PURE__ */ G("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), Cc = /* @__PURE__ */ G("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), wc = /* @__PURE__ */ G("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map chat and Self-Driving preferences to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>"), Tc = /* @__PURE__ */ G("<small class=\"settings-notification-help\"> </small>"), Ec = /* @__PURE__ */ G("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span><input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span><input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>"), Dc = /* @__PURE__ */ G("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><aside class=\"settings-tabs\"><div class=\"settings-title\">System Settings</div> <!></aside> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function Oc(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(-1), a = /* @__PURE__ */ P(I(l(U(n)))), o = /* @__PURE__ */ P(""), s = /* @__PURE__ */ P(""), c = /* @__PURE__ */ new Set([
		"default",
		"fast",
		"reasoning",
		"scheduler"
	]);
	Si(() => t.channel.subscribe((e) => {
		F(n, e, !0), e.identity === U(r) ? e.dataVersion !== U(i) && !U(a).dirty && (F(i, e.dataVersion, !0), F(a, l(e), !0)) : (F(r, e.identity, !0), F(i, e.dataVersion, !0), F(a, l(e), !0), F(o, ""), F(s, "")), queueMicrotask(e.onIconsChanged);
	})), Si(() => {
		let e = (e) => {
			U(n).open && e.key === "Escape" && (e.preventDefault(), U(n).onClose(U(a).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function l(e) {
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
	function u() {
		return {
			...U(a),
			profiles: U(a).profiles.map((e) => ({ ...e })),
			newProfile: { ...U(a).newProfile }
		};
	}
	function d() {
		U(a).dirty = !0;
	}
	async function f(e) {
		if (e.preventDefault(), !(!U(a).workspacePath.trim() || U(o))) {
			F(o, "workspace");
			try {
				await U(n).onAddWorkspace(u()), U(a).workspacePath = "", U(a).createWorkspace = !1;
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				F(o, "");
			}
		}
	}
	async function p(e) {
		if (!U(o)) {
			F(o, `remove:${e}`);
			try {
				await U(n).onRemoveWorkspace(e, u());
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				F(o, "");
			}
		}
	}
	async function m(e, t) {
		if (!U(o)) {
			F(o, `icon:${e}`), F(s, "");
			try {
				await U(n).onWorkspaceIcon(e, t, u());
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				F(o, "");
			}
		}
	}
	async function h(e) {
		if (e.preventDefault(), !U(o)) {
			F(o, "user");
			try {
				U(a).userName = await U(n).onSaveUser(U(a).userName);
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				F(o, "");
			}
		}
	}
	function g(e, t, n) {
		U(a).profiles[e][t] = n, d();
	}
	function _() {
		let e = U(a).newProfile.key.trim().toLowerCase();
		if (!e) return U(n).onToast("Profile key is required.");
		if (c.has(e)) return U(n).onToast(`${e} is a reserved system profile.`);
		if (U(a).profiles.some((t) => t.key.trim().toLowerCase() === e)) return U(n).onToast(`Profile ${e} already exists.`);
		U(a).profiles = [...U(a).profiles, {
			key: e,
			description: U(a).newProfile.description.trim(),
			agentName: U(a).newProfile.agentName
		}], U(a).newProfile = {
			key: "",
			description: "",
			agentName: U(n).agents[0]?.id || ""
		}, d();
	}
	function v(e) {
		let t = U(a).profiles[e];
		if (!t || c.has(t.key.trim().toLowerCase())) return U(n).onToast("System profiles cannot be deleted.");
		U(a).profiles = U(a).profiles.filter((t, n) => e !== n), d();
	}
	async function y() {
		if (!(!U(a).dirty || U(o))) {
			F(o, "agenthub");
			try {
				await U(n).onSaveAgentHub(u()), U(a).dirty = !1;
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				F(o, "");
			}
		}
	}
	function b(e) {
		let t = U(n).workspaces.find((t) => t.id === e);
		return U(n).workspaceIcons.find((e) => e.id === (t?.icon || "")) || U(n).workspaceIcons[0];
	}
	function x(e) {
		let t = U(n).agents.map((e) => ({
			id: e.id,
			label: e.label
		}));
		return e && !t.some((t) => t.id === e) ? [{
			id: e,
			label: `${e} (Unavailable)`
		}, ...t] : t;
	}
	function S(e) {
		return e instanceof Error ? e.message : String(e);
	}
	var C = Dr(), w = R(C), T = (e) => {
		var t = Dc(), r = R(t), i = z(r, 2), l = L(i);
		Y(z(L(l), 2), 16, () => [
			[
				"workspace",
				"hard-drive",
				"Workspace"
			],
			[
				"user",
				"user-round",
				"User"
			],
			[
				"agenthub",
				"network",
				"AgentHub"
			],
			[
				"profiles",
				"route",
				"Profiles"
			],
			[
				"notifications",
				"bell",
				"Notifications"
			]
		], Pr, (e, t) => {
			var n = cc();
			let r;
			var i = L(n);
			Q(i, { get name() {
				return t[1];
			} });
			var o = z(i), s = L(o, !0);
			A(o);
			var c = z(o), l = (e) => {
				K(e, sc());
			};
			J(c, (e) => {
				(t[0] === "agenthub" || t[0] === "profiles") && e(l);
			}), A(n), B(() => {
				r = X(n, 1, "settings-tab", null, r, {
					active: U(a).tab === t[0],
					dirty: U(a).dirty && (t[0] === "agenthub" || t[0] === "profiles")
				}), q(s, t[2]);
			}), W("click", n, () => U(a).tab = t[0]), K(e, n);
		}), A(l);
		var u = z(l, 2), S = L(u);
		Q(L(S), { name: "x" }), A(S);
		var C = z(S, 2), w = (e) => {
			var t = mc(), r = z(L(t), 2), i = L(r);
			ci(i);
			var c = z(i, 2), l = L(c);
			ci(l), j(), A(c);
			var u = z(c, 2), d = L(u);
			Q(d, { name: "plus" });
			var h = z(d), g = L(h, !0);
			A(h), A(u), A(r);
			var _ = z(r, 2);
			Y(_, 21, () => U(n).workspaces, (e) => e.id, (e, t) => {
				let r = /* @__PURE__ */ M(() => b(U(t).id));
				var i = fc(), a = L(i), c = L(a), l = L(c), u = L(l);
				A(l);
				var d = z(l), f = L(d), h = L(f, !0);
				A(f);
				var g = z(f), _ = L(g, !0);
				A(g), A(d), A(c);
				var v = z(c, 2), y = L(v), x = (e) => {
					K(e, lc());
				};
				J(y, (e) => {
					U(t).id === U(n).activeWorkspaceId && e(x);
				});
				var S = z(y, 2), C = L(S), w = z(C), T = L(w, !0);
				A(w), Q(z(w), { name: "chevron-down" }), A(S);
				var E = z(S, 2);
				Q(L(E), { name: "trash-2" }), A(E), A(v), A(a);
				var D = z(a, 2), ee = (e) => {
					var i = dc();
					Y(i, 21, () => U(n).workspaceIcons, (e) => e.id, (e, n) => {
						var i = uc();
						let a;
						var o = L(i), s = z(o), c = L(s, !0);
						A(s);
						var l = z(s), u = (e) => {
							Q(e, { name: "check" });
						};
						J(l, (e) => {
							U(n).id === U(r).id && e(u);
						}), A(i), B(() => {
							Z(i, "aria-checked", U(n).id === U(r).id), Z(i, "title", U(n).label), a = X(i, 1, "", null, a, { selected: U(n).id === U(r).id }), Z(o, "src", U(n).src), q(c, U(n).label);
						}), W("click", i, () => m(U(t).id, U(n).id)), K(e, i);
					}), A(i), B(() => Z(i, "aria-label", `Icon for ${U(t).name}`)), K(e, i);
				};
				J(D, (e) => {
					U(s) === U(t).id && e(ee);
				}), A(i), B((e, n) => {
					Z(u, "src", U(r).src), q(h, U(t).name), q(_, U(t).path), Z(S, "aria-expanded", U(s) === U(t).id), S.disabled = e, Z(C, "src", U(r).src), q(T, U(o) === `icon:${U(t).id}` ? "Saving..." : U(r).label), E.disabled = n;
				}, [() => !!U(o), () => !!U(o)]), W("click", S, () => F(s, U(s) === U(t).id ? "" : U(t).id, !0)), W("click", E, () => p(U(t).id)), K(e, i);
			}, (e) => {
				K(e, pc());
			}), A(_), A(t), B((e) => {
				u.disabled = e, q(g, U(a).createWorkspace ? "Create" : "Add");
			}, [() => !!U(o)]), vr("submit", r, f), mi(i, () => U(a).workspacePath, (e) => U(a).workspacePath = e), hi(l, () => U(a).createWorkspace, (e) => U(a).createWorkspace = e), K(e, t);
		}, T = (e) => {
			var t = hc(), n = z(L(t), 2), r = L(n), i = z(L(r));
			ci(i), j(), A(r);
			var s = z(r, 2), c = L(s);
			Q(L(c), { name: "save" }), j(), A(c), A(s), A(n), A(t), B(() => c.disabled = U(o) === "user"), vr("submit", n, h), mi(i, () => U(a).userName, (e) => U(a).userName = e), K(e, t);
		}, E = (e) => {
			var t = yc(), r = z(L(t), 2), i = L(r), s = z(L(i)), c = L(s, !0);
			A(s), A(i);
			var l = z(i, 2), u = z(L(l));
			ci(u), A(l);
			var f = z(l, 2), p = L(f, !0);
			A(f);
			var m = z(f, 2);
			Y(m, 21, () => U(n).agentHub.capabilities, Pr, (e, t) => {
				var n = gc(), r = L(n, !0);
				A(n), B(() => q(r, U(t))), K(e, n);
			}), A(m), A(r);
			var h = z(r, 2), g = L(h), _ = z(L(g)), v = L(_);
			A(_), A(g);
			var b = z(g, 2);
			Y(b, 21, () => U(n).agentHub.agents, (e) => e.name, (e, t) => {
				var n = _c(), r = L(n), i = L(r), a = L(i, !0);
				A(i);
				var o = z(i), s = L(o), c = L(s, !0);
				A(s);
				var l = z(s), u = L(l);
				A(l), A(o), A(r), A(n), B((e) => {
					q(a, e), q(c, U(t).name), q(u, `${(U(t).providerId || "") ?? ""} · ${(U(t).available === !1 ? U(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
				}, [() => (U(t).name || "A").slice(0, 1).toUpperCase()]), K(e, n);
			}, (e) => {
				K(e, vc());
			}), A(b), A(h);
			var x = z(h, 2), S = L(x);
			let C;
			var w = L(S, !0);
			A(S);
			var T = z(S);
			Q(L(T), { name: "save" }), j(), A(T), A(x), A(t), B((e) => {
				q(c, U(n).agentHub.connected && U(n).agentHub.compatible ? "Compatible" : U(n).agentHub.connected ? "Incompatible" : "Unavailable"), q(p, U(n).agentHub.error || `API ${U(n).agentHub.apiVersion || "unknown"} · AgentHub ${U(n).agentHub.version || "unknown"}`), q(v, `${U(n).agentHub.agents.length ?? ""} agents · ${U(n).agentHub.providers.length ?? ""} providers`), C = X(S, 1, "settings-save-hint", null, C, { visible: U(a).dirty }), q(w, U(a).dirty ? "Unsaved changes" : ""), T.disabled = e;
			}, [() => !U(a).dirty || !!U(o)]), W("input", u, d), mi(u, () => U(a).endpoint, (e) => U(a).endpoint = e), W("click", T, y), K(e, t);
		}, D = (e) => {
			var t = wc(), r = z(L(t), 2), i = L(r), s = z(L(i)), l = L(s);
			A(s), A(i);
			var u = z(i, 2), d = z(L(u), 2);
			Y(d, 17, () => U(a).profiles, Pr, (e, t, n) => {
				let r = /* @__PURE__ */ M(() => c.has(U(t).key.trim().toLowerCase()));
				var i = Cc();
				let a;
				var o = L(i);
				ci(o);
				var s = z(o, 2);
				ci(s);
				var l = z(s, 2);
				Y(l, 21, () => x(U(t).agentName), Pr, (e, t) => {
					var n = bc(), r = L(n, !0);
					A(n);
					var i = {};
					B(() => {
						q(r, U(t).label), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
					}), K(e, n);
				}), A(l);
				var u;
				ti(l);
				var d = z(l, 2), f = (e) => {
					K(e, xc());
				}, p = (e) => {
					var t = Sc();
					Q(L(t), { name: "trash-2" }), A(t), W("click", t, () => v(n)), K(e, t);
				};
				J(d, (e) => {
					U(r) ? e(f) : e(p, -1);
				}), A(i), B(() => {
					a = X(i, 1, "settings-profile-row", null, a, { "settings-profile-system": U(r) }), li(o, U(t).key), o.disabled = U(r), li(s, U(t).description), s.disabled = U(r), u !== (u = U(t).agentName) && (l.value = (l.__value = U(t).agentName) ?? "", ei(l, U(t).agentName));
				}), W("input", o, (e) => g(n, "key", e.currentTarget.value)), W("input", s, (e) => g(n, "description", e.currentTarget.value)), W("change", l, (e) => g(n, "agentName", e.currentTarget.value)), K(e, i);
			});
			var f = z(d, 2), p = L(f);
			ci(p);
			var m = z(p, 2);
			ci(m);
			var h = z(m, 2);
			Y(h, 21, () => U(n).agents, Pr, (e, t) => {
				var n = bc(), r = L(n, !0);
				A(n);
				var i = {};
				B(() => {
					q(r, U(t).label), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
				}), K(e, n);
			}), A(h);
			var b = z(h, 2);
			Q(L(b), { name: "plus" }), j(), A(b), A(f), A(u), A(r);
			var S = z(r, 2), C = L(S);
			let w;
			var T = L(C, !0);
			A(C);
			var E = z(C);
			Q(L(E), { name: "save" }), j(), A(E), A(S), A(t), B((e) => {
				q(l, `${U(a).profiles.length ?? ""} routes`), h.disabled = !U(n).agents.length, b.disabled = !U(n).agents.length, w = X(C, 1, "settings-save-hint", null, w, { visible: U(a).dirty }), q(T, U(a).dirty ? "Unsaved changes" : ""), E.disabled = e;
			}, [() => !U(a).dirty || !!U(o)]), mi(p, () => U(a).newProfile.key, (e) => U(a).newProfile.key = e), mi(m, () => U(a).newProfile.description, (e) => U(a).newProfile.description = e), ni(h, () => U(a).newProfile.agentName, (e) => U(a).newProfile.agentName = e), W("click", b, _), W("click", E, y), K(e, t);
		}, ee = (e) => {
			var t = Ec(), r = z(L(t), 2), i = L(r), a = z(L(i));
			ci(a), A(i);
			var o = z(i, 2), s = (e) => {
				var t = Tc(), r = L(t, !0);
				A(t), B(() => q(r, U(n).notifications.permissionError)), K(e, t);
			};
			J(o, (e) => {
				U(n).notifications.permissionError && e(s);
			}), A(r);
			var c = z(r, 2), l = L(c), u = z(L(l));
			ci(u), A(l);
			var d = z(l, 2), f = L(d, !0);
			A(d), A(c), A(t), B(() => {
				ui(a, U(n).notifications.browser), ui(u, U(n).notifications.sound), q(f, U(n).notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
			}), W("change", a, (e) => U(n).onBrowserNotifications(e.currentTarget.checked)), W("change", u, (e) => U(n).onCompletionSound(e.currentTarget.checked)), K(e, t);
		};
		J(C, (e) => {
			U(a).tab === "workspace" ? e(w) : U(a).tab === "user" ? e(T, 1) : U(a).tab === "agenthub" ? e(E, 2) : U(a).tab === "profiles" ? e(D, 3) : e(ee, -1);
		}), A(u), A(i), W("click", r, () => U(n).onClose(U(a).dirty)), W("click", S, () => U(n).onClose(U(a).dirty)), K(e, t);
	};
	J(w, (e) => {
		U(n).open && e(T);
	}), K(e, C), Ue();
}
yr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region src/islands/UploadDialog.svelte
var kc = /* @__PURE__ */ G("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), Ac = /* @__PURE__ */ G("<small class=\"upload-result-path\"> </small>"), jc = /* @__PURE__ */ G("<small class=\"upload-error\"> </small>"), Mc = /* @__PURE__ */ G("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), Nc = /* @__PURE__ */ G("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this session's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function Pc(e, t) {
	He(t, !0);
	let n = /* @__PURE__ */ P(I(t.channel.current())), r = /* @__PURE__ */ P(""), i = /* @__PURE__ */ P(I([])), a = 1, o = /* @__PURE__ */ P(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ M(() => U(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ M(() => U(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ M(() => U(i).filter((e) => e.status === "error").length);
	Si(() => {
		let e = t.channel.subscribe((e) => {
			F(n, e, !0), e.identity !== U(r) && (d(), F(r, e.identity, !0), F(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			if (!U(n).open) return;
			let t = f(e.clipboardData);
			t.length && (e.preventDefault(), m(t));
		};
		document.addEventListener("paste", o);
		let s = (e) => {
			U(n).open && e.key === "Escape" && !U(c) && (e.preventDefault(), _());
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
		if (!U(n).open || !t.length) return;
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
		F(i, [...U(i), ...r], !0);
		for (let e of r) g(e, U(n).identity, U(n).workspaceId, U(n).runId);
	}
	function h(e, t) {
		F(i, U(i).map((n) => n.id === e ? {
			...n,
			...t
		} : n), !0);
	}
	function g(e, t, r, i) {
		h(e.id, { status: "uploading" });
		let a = new XMLHttpRequest();
		s.set(e.id, a), a.open("POST", `/api/workspaces/${encodeURIComponent(r)}/agent/runs/${encodeURIComponent(i)}/uploads`), a.responseType = "json", a.upload.addEventListener("progress", (r) => {
			U(n).identity !== t || !r.lengthComputable || h(e.id, { progress: Math.min(99, Math.round(r.loaded / r.total * 100)) });
		}), a.addEventListener("load", () => {
			if (s.delete(e.id), U(n).identity !== t || U(n).workspaceId !== r || U(n).runId !== i) return;
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
			s.delete(e.id), U(n).identity === t && h(e.id, {
				status: "error",
				error: "Network error while uploading."
			});
		});
		let o = new FormData();
		o.append("file", e.file, e.name), a.send(o);
	}
	function _() {
		U(c) || U(n).onDone(U(i).filter((e) => e.status === "success" && e.path).map((e) => e.path), {
			workspaceId: U(n).workspaceId,
			runId: U(n).runId
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
	var b = Dr(), x = R(b), S = (e) => {
		var t = Nc(), n = L(t), r = z(n, 2), a = L(r), s = z(L(a), 2);
		Q(L(s), { name: "x" }), A(s), A(a);
		var d = z(a, 2), f = L(d);
		yi(f, (e) => F(o, e), () => U(o));
		var p = z(f, 2), h = L(p);
		Q(h, { name: "clipboard-paste" });
		var g = z(h, 4);
		Q(L(g), { name: "folder-open" }), j(), A(g), A(p);
		var b = z(p, 2), x = L(b), S = (e) => {
			K(e, kc());
		};
		J(x, (e) => {
			U(i).length || e(S);
		}), Y(z(x, 2), 17, () => U(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ M(() => y(U(t)));
			var r = Mc();
			let i;
			var a = L(r), o = L(a);
			Q(o, { get name() {
				return U(n).icon;
			} });
			var s = z(o), c = L(s), l = L(c, !0);
			A(c);
			var u = z(c), d = L(u, !0);
			A(u), A(s);
			var f = z(s), p = L(f, !0);
			A(f), A(a);
			var m = z(a, 2), h = L(m);
			let g;
			A(m);
			var _ = z(m, 2), b = (e) => {
				var n = Ac(), r = L(n, !0);
				A(n), B(() => q(r, U(t).path)), K(e, n);
			};
			J(_, (e) => {
				U(t).status === "success" && e(b);
			});
			var x = z(_, 2), S = (e) => {
				var n = jc(), r = L(n, !0);
				A(n), B(() => q(r, U(t).error || "Upload failed")), K(e, n);
			};
			J(x, (e) => {
				U(t).status === "error" && e(S);
			}), A(r), B((e) => {
				i = X(r, 1, "upload-item", null, i, {
					"upload-item-success": U(t).status === "success",
					"upload-item-error": U(t).status === "error",
					"upload-item-uploading": U(t).status === "uploading"
				}), q(l, U(t).name), q(d, e), q(p, U(n).label), Z(m, "aria-label", U(t).name), Z(m, "aria-valuenow", U(t).progress), g = $r(h, "", g, { width: `${U(t).progress}%` });
			}, [() => v(U(t).size)]), K(e, r);
		}), A(b), A(d);
		var C = z(d, 2), w = L(C), T = L(w, !0);
		A(w);
		var E = z(w, 2);
		A(C), A(r), A(t), B(() => {
			s.disabled = U(c), q(T, U(c) ? "Wait for uploads to finish before closing." : U(i).length ? `${U(l)} uploaded${U(u) ? ` · ${U(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), E.disabled = U(c);
		}), W("click", n, _), W("click", s, _), W("change", f, () => U(o).files && m(U(o).files)), vr("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), vr("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), vr("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), W("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), U(o).click());
		}), W("click", g, () => U(o).click()), W("click", E, _), K(e, t);
	};
	J(x, (e) => {
		U(n).open && e(S);
	}), K(e, b), Ue();
}
yr([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/islands/channel.ts
function Fc(e) {
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
//#region src/islands/lifecycle.ts
var Ic = /* @__PURE__ */ new Map();
async function Lc(e, t, n) {
	await Rc(e), t.replaceChildren(), Ic.set(e, n(t));
}
async function Rc(e) {
	let t = Ic.get(e);
	t && (Ic.delete(e), await t());
}
async function zc() {
	let e = [...Ic.keys()].reverse();
	for (let t of e) await Rc(t);
}
//#endregion
//#region src/entry.ts
var Bc = "brand-version", $ = () => void 0, Vc = async () => void 0, Hc = [{
	id: "",
	label: "Forge default",
	src: "/favicon.svg"
}], Uc = Fc({
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
	onSwitchWorkspace: Vc,
	onAddWorkspace: $,
	onCreateProject: $,
	onOpenSettings: $,
	onToggleProject: Vc,
	onSelectResource: Vc,
	onReorder: Vc,
	onDragState: $,
	onPanePreview: $,
	onPaneCommit: $,
	onPaneViewport: $,
	onMobileSidebar: $,
	onMobileView: $,
	onMobileImmersive: $,
	onToast: $,
	onIconsChanged: $,
	onHistoryNavigation: Vc
}), Wc = Fc({
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
	onPreview: Vc,
	onSubmit: Vc,
	previewRequestKey: () => "",
	onConfirmTemplateSwitch: () => !0,
	onIconsChanged: $
}), Gc = Fc({
	open: !1,
	identity: "",
	dataVersion: 0,
	initialTab: "workspace",
	workspaces: [],
	activeWorkspaceId: "",
	workspaceIcons: Hc,
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
	onAddWorkspace: Vc,
	onRemoveWorkspace: Vc,
	onWorkspaceIcon: Vc,
	onSaveUser: async (e) => e,
	onSaveAgentHub: Vc,
	onBrowserNotifications: $,
	onCompletionSound: $,
	onToast: $,
	onIconsChanged: $
}), Kc = Fc({
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
	onSubmit: Vc,
	onIconsChanged: $
}), qc = Fc({
	open: !1,
	identity: "",
	workspaceId: "",
	runId: "",
	onDone: $,
	onIconsChanged: $
}), Jc = Fc({
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
}), Yc = Fc({
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
	onLoadMoreLogs: Vc,
	onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
	onToast: $,
	onIconsChanged: $
}), Xc = Fc({
	identity: "",
	workspaceId: "",
	resourceId: "",
	activeRunId: "",
	runs: [],
	switchingRunId: "",
	onSelect: Vc,
	onToast: $,
	onIconsChanged: $
}), Zc = Fc({
	identity: "",
	workspaceId: "",
	activeRunId: "",
	activeRun: null,
	runCount: 0,
	agentName: "Agent",
	project: () => [],
	onEvent: $,
	onNotice: $,
	onApproval: Vc,
	onToast: $,
	onIconsChanged: $
});
async function Qc() {
	let e = document.getElementById("brandVersionIsland");
	if (!e) return;
	let t = e.dataset.version || "v0.1.0";
	try {
		await Lc(Bc, e, (e) => {
			let n = Or(Wi, {
				target: e,
				props: { version: t }
			});
			return () => Mr(n);
		});
	} catch (n) {
		throw e.textContent = t, n;
	}
}
async function $c() {
	await el("app-shell", "app", Hi, { channel: Uc });
}
async function el(e, t, n, r) {
	let i = document.getElementById(t);
	i && await Lc(e, i, (t) => {
		t.dataset.svelteOwned = e;
		let i = Or(n, {
			target: t,
			props: r
		});
		return async () => {
			delete t.dataset.svelteOwned, await Mr(i);
		};
	});
}
async function tl() {
	await Promise.all([
		el("create-dialog", "createDialogRoot", Na, { channel: Wc }),
		el("settings", "settingsRoot", Oc, { channel: Gc }),
		el("self-driving-dialog", "selfDrivingDialogRoot", $s, { channel: Kc }),
		el("upload-dialog", "uploadDialogRoot", Pc, { channel: qc }),
		el("chat-composer", "ttyComposer", ia, { channel: Jc }),
		el("session-switcher", "agentSessionsWrap", oc, { channel: Xc }),
		el("event-timeline", "ttyLog", Ks, { channel: Zc }),
		el("detail-panel", "detailsPanel", Qo, { channel: Yc })
	]);
}
var nl = {
	renderAppShell: (e) => Uc.publish(e),
	mountBrandVersion: Qc,
	renderCreateDialog: (e) => Wc.publish(e),
	renderSettings: (e) => Gc.publish(e),
	renderSelfDrivingDialog: (e) => Kc.publish(e),
	renderUploadDialog: (e) => qc.publish(e),
	renderComposer: (e) => Jc.publish(e),
	renderSessionSwitcher: (e) => Xc.publish(e),
	renderEventTimeline: (e) => Zc.publish(e),
	renderDetailPanel: (e) => Yc.publish(e),
	unmount: Rc,
	unmountAll: zc
}, rl = window.ForgeSvelteIslands;
window.ForgeSvelteIslands = nl, window.ForgeSveltePageLifecycleInstalled || (window.ForgeSveltePageLifecycleInstalled = !0, window.addEventListener("pagehide", () => {
	window.ForgeSvelteIslands?.unmountAll();
}), window.addEventListener("pageshow", (e) => {
	e.persisted && (async () => {
		await $c(), await Promise.all([window.ForgeSvelteIslands?.mountBrandVersion(), tl()]), window.ForgeLegacySvelteReady?.();
	})();
})), (async () => {
	await rl?.unmountAll(), await $c(), await Promise.all([Qc(), tl()]), window.ForgeLegacySvelteReady?.();
})().catch((e) => console.error("Failed to mount the Forge Svelte island", e));
//#endregion
