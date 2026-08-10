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
	return Pe(/* @__PURE__ */ un(O));
}
function k(e) {
	if (D) {
		if (/* @__PURE__ */ un(O) !== null) throw Ae(), we;
		O = e;
	}
}
function A(e = 1) {
	if (D) {
		for (var t = e, n = O; t--;) n = /* @__PURE__ */ un(n);
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
		var i = /* @__PURE__ */ un(n);
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
function Ue(e, t = !1, n) {
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
function We(e) {
	var t = Ve, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) xn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ve = t.p, e ?? {};
}
function Ge() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ke = [];
function qe() {
	var e = Ke;
	Ke = [], f(e);
}
function Je(e) {
	if (Ke.length === 0 && !jt) {
		var t = Ke;
		queueMicrotask(() => {
			t === Ke && qe();
		});
	}
	Ke.push(e);
}
function Ye() {
	for (; Ke.length > 0;) qe();
}
function Xe(e) {
	var t = V;
	if (t === null) return B.f |= te, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ze(e, t);
}
function Ze(e, t) {
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
var Qe = ~(h | g | m);
function $e(e, t) {
	e.f = e.f & Qe | t;
}
function et(e) {
	e.f & 512 || e.deps === null ? $e(e, m) : $e(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function tt(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, tt(t.deps));
}
function nt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), tt(e.deps), $e(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var rt = !1;
function it(e) {
	var t = rt;
	try {
		return rt = !1, [e(), rt];
	} finally {
		rt = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function at(e) {
	D && /* @__PURE__ */ ln(e) !== null && dn(e);
}
var ot = !1;
function st() {
	ot || (ot = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[le]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ct(e) {
	var t = B, n = V;
	Wn(null), Gn(null);
	try {
		return e();
	} finally {
		Wn(t), Gn(n);
	}
}
function lt(e, t, n, r = n) {
	e.addEventListener(t, () => ct(n));
	let i = e[le];
	e[le] = i ? () => {
		i(), r(!0);
	} : () => r(!0), st();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ut(e) {
	let t = 0, n = Jt(0), r;
	return () => {
		vn() && (H(n), Tn(() => (t === 0 && (r = fr(() => e(() => Qt(n)))), t += 1, () => {
			Je(() => {
				--t, t === 0 && (r?.(), r = void 0, Qt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var dt = x | S;
function ft(e, t, n, r) {
	new pt(e, t, n, r);
}
var pt = class {
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
	#h = ut(() => (this.#m = Jt(this.#l), () => {
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
		}, dt), D && (this.#e = O);
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
		Je(r), t && (this.#s = Dn(() => {
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
					Ze(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = Dn(() => e(this.#e)), Je(() => {
			var e = this.#c = document.createDocumentFragment(), t = cn();
			e.append(t), this.#a = this.#S(() => Dn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Pn(this.#o, () => {
				this.#o = null;
			}), this.#x(M));
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
			} else this.#x(M);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		nt(e, this.#f, this.#p);
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
			return Lt.ensure(), e();
		} catch (e) {
			return Xe(e), null;
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
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Je(() => {
			this.#d = !1, this.#m && Xt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), H(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		M?.is_fork ? (this.#a && M.skip_effect(this.#a), this.#o && M.skip_effect(this.#o), this.#s && M.skip_effect(this.#s), M.oncommit(() => {
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
					return Ze(e, this.#i.parent), null;
				}
			}));
		};
		Je(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Ze(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Ze(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function mt(e, t, n, r) {
	let i = Ge() ? vt : xt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = V, c = ht(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ze(e, s);
			}
			gt();
		}
	}
	var d = _t();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ bt(e))).then(u).catch((e) => Ze(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), gt();
	}) : f();
}
function ht() {
	var e = V, t = B, n = Ve, r = M;
	return function(i = !0) {
		Gn(e), Wn(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function gt(e = !0) {
	Gn(null), Wn(null), He(null), e && M?.deactivate();
}
function _t() {
	var e = V, t = e.b, n = M, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function vt(e) {
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
var yt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function bt(e, t, n) {
	let r = V;
	r === null && pe();
	var i = void 0, a = Jt(Te), o = !B, s = /* @__PURE__ */ new Set();
	return wn(() => {
		var t = V, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ue && n.reject(e);
			}).finally(gt);
		} catch (e) {
			n.reject(e), gt();
		}
		var c = M;
		if (o) {
			if (t.f & 32768) var l = _t();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(yt);
			else for (let e of s.values()) e.reject(yt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== yt && (c.activate(), t ? (a.f |= te, Xt(a, t)) : (a.f & 8388608 && (a.f ^= te), Xt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), yn(() => {
		for (let e of s) e.reject(yt);
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
function j(e) {
	let t = /* @__PURE__ */ vt(e);
	return qn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function xt(e) {
	let t = /* @__PURE__ */ vt(e);
	return t.equals = Be, t;
}
function St(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) jn(t[n]);
	}
}
function Ct(e) {
	var t, n = V, r = e.parent;
	if (!Vn && r !== null && e.v !== Te && r.f & 24576) return ke(), e.v;
	Gn(r);
	try {
		e.f &= ~T, St(e), t = ar(e);
	} finally {
		Gn(n);
	}
	return t;
}
function wt(e) {
	var t = Ct(e);
	if (!e.equals(t) && (e.wv = nr(), (!M?.is_fork || e.deps === null) && (M === null ? e.v = t : (M.capture(e, t, !0), Ot?.capture(e, t, !0)), e.deps === null))) {
		$e(e, m);
		return;
	}
	Vn || (kt === null ? et(e) : (vn() || M?.is_fork) && kt.set(e, t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ct(() => {
		t.ac.abort(ue), t.ac = null;
	}), t.fn !== null && (t.teardown = d), sr(t, 0), kn(t));
}
function Et(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && cr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Dt = null, M = null, Ot = null, kt = null, At = null, jt = !1, Mt = !1, Nt = null, Pt = null, Ft = 0, It = 1, Lt = class e {
	id = It++;
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
		Dt === null ? Dt = this : (Dt.#n = this, this.#t = Dt), Dt = this;
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
			for (var r of n.d) $e(r, h), t(r);
			for (r of n.m) $e(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Ft++ > 1e3 && (this.#x(), zt());
		for (let e of this.#u) this.#d.delete(e), $e(e, h), this.schedule(e);
		for (let e of this.#d) $e(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Nt = [], r = [], i = Pt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Wt(e), this.#h() || this.discard(), t;
		}
		if (M = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Nt = null, Pt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Ut(e, t);
			i.length > 0 && M.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Ot = this, Vt(r), Vt(n), Ot = null, this.#s?.resolve();
		var s = M;
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), $e(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), M = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) nt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== Te && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), kt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		M = this;
	}
	deactivate() {
		M = null, kt = null;
	}
	flush() {
		try {
			Mt = !0, M = this, this.#g();
		} finally {
			Ft = 0, At = null, Nt = null, Pt = null, Mt = !1, M = null, kt = null, Kt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(yt);
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
		this.#m || (this.#m = !0, Je(() => {
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
		if (M === null) {
			let t = M = new e();
			!Mt && !jt && Je(() => {
				t.#e || t.flush();
			});
		}
		return M;
	}
	apply() {
		kt = null;
	}
	schedule(e) {
		if (At = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (Nt !== null && t === V && (B === null || !(B.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Dt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Rt(e) {
	var t = jt;
	jt = !0;
	try {
		var n;
		for (e && (M !== null && !M.is_fork && M.flush(), n = e());;) {
			if (Ye(), M === null) return n;
			M.flush();
		}
	} finally {
		jt = t;
	}
}
function zt() {
	try {
		ve();
	} catch (e) {
		Ze(e, At);
	}
}
var Bt = null;
function Vt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && rr(r) && (Bt = /* @__PURE__ */ new Set(), cr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Nn(r), Bt?.size > 0)) {
				Kt.clear();
				for (let e of Bt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Bt.has(n) && (Bt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || cr(n);
					}
				}
				Bt.clear();
			}
		}
		Bt = null;
	}
}
function Ht(e) {
	M.schedule(e);
}
function Ut(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), $e(e, m);
		for (var n = e.first; n !== null;) Ut(n, t), n = n.next;
	}
}
function Wt(e) {
	$e(e, m);
	for (var t = e.first; t !== null;) Wt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Gt = /* @__PURE__ */ new Set(), Kt = /* @__PURE__ */ new Map(), qt = !1;
function Jt(e, t) {
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
function N(e, t) {
	let n = Jt(e, t);
	return qn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Yt(e, t = !1, n = !0) {
	let r = Jt(e);
	return t || (r.equals = Be), r;
}
function P(e, t, n = !1) {
	return B !== null && (!Un || B.f & 131072) && Ge() && B.f & 4325394 && (Kn === null || !Kn.has(e)) && Se(), Xt(e, n ? F(t) : t, Pt);
}
function Xt(e, t, n = null) {
	if (!e.equals(t)) {
		Kt.set(e, Vn ? t : e.v);
		var r = Lt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ct(t), kt === null && et(t);
		}
		e.wv = nr(), $t(e, h, n), Ge() && V !== null && V.f & 1024 && !(V.f & 96) && (Xn === null ? Zn([e]) : Xn.push(e)), !r.is_fork && Gt.size > 0 && !qt && Zt();
	}
	return t;
}
function Zt() {
	qt = !1;
	for (let e of Gt) {
		e.f & 1024 && $e(e, g);
		let t;
		try {
			t = rr(e);
		} catch {
			t = !0;
		}
		t && cr(e);
	}
	Gt.clear();
}
function Qt(e) {
	P(e, e.v + 1);
}
function $t(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ge(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === V)) {
			var l = (c & h) === 0;
			if (l && $e(s, t), c & 131072) Gt.add(s);
			else if (c & 2) {
				var u = s;
				kt?.delete(u), c & 65536 || (c & 512 && (V === null || !(V.f & 2097152)) && (s.f |= T), $t(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Bt !== null && Bt.add(d), n === null ? Ht(d) : n.push(d);
			}
		}
	}
}
function F(t) {
	if (typeof t != "object" || !t || ne in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ N(0), u = null, d = er, f = (e) => {
		if (er === d) return e();
		var t = B, n = er;
		Wn(null), tr(d);
		var r = e();
		return Wn(t), tr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ N(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && be();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ N(n.value, u);
				return r.set(t, e), e;
			}) : P(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ N(Te, u));
					r.set(t, e), Qt(o);
				}
			} else P(n, Te), Qt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === ne) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ N(F(s ? e[n] : Te), u)), r.set(n, o)), o !== void 0) {
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
			return (n !== void 0 || V !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ N(i ? F(e[t]) : Te, u)), r.set(t, n)), H(n) === Te) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ N(Te, u)), r.set(d + "", p)) : P(p, Te);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ N(void 0, u)), P(c, F(n)), r.set(t, c));
			else {
				l = c.v !== Te;
				var m = f(() => F(n));
				P(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && P(g, _ + 1);
				}
				Qt(o);
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
	var n = /* @__PURE__ */ ln(O);
	if (n === null) n = O.appendChild(cn());
	else if (t && n.nodeType !== 3) {
		var r = cn();
		return n?.before(r), Pe(r), r;
	}
	return t && mn(n), Pe(n), n;
}
function L(e, t = !1) {
	if (!D) {
		var n = /* @__PURE__ */ ln(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ un(n) : n;
	}
	if (t) {
		if (O?.nodeType !== 3) {
			var r = cn();
			return O?.before(r), Pe(r), r;
		}
		mn(O);
	}
	return O;
}
function R(e, t = 1, n = !1) {
	let r = D ? O : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ un(r);
	if (!D) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = cn();
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
	M?.register_created_effect(r);
	var i = r;
	if (e & 4) Nt === null ? Lt.ensure().schedule(r) : Nt.push(r);
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
	return $e(t, m), t.teardown = e, t;
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
	Lt.ensure();
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
	mt(r, t, n, (t) => {
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
		e !== null && ct(() => {
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
		e.f ^= _, e.f & 1024 || ($e(e, h), Lt.ensure().schedule(e));
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
			if (rr(a) && wt(a), a.wv > e.wv) return !0;
		}
		t & 512 && kt === null && $e(e, m);
	}
	return !1;
}
function ir(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Kn !== null && Kn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ir(a, t, !1) : t === a && (n ? $e(a, h) : a.f & 1024 && $e(a, g), Ht(a));
	}
}
function ar(e) {
	var t = Jn, n = Yn, r = Xn, i = B, a = Kn, o = Ve, s = Un, c = er, l = e.f;
	Jn = null, Yn = 0, Xn = null, B = l & 96 ? null : e, Kn = null, He(e.ctx), Un = !1, er = ++$n, e.ac !== null && (ct(() => {
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = M?.is_fork;
		if (Jn !== null) {
			var m;
			if (p || sr(e, Yn), f !== null && Yn > 0) for (f.length = Yn + Jn.length, m = 0; m < Jn.length; m++) f[Yn + m] = Jn[m];
			else e.deps = f = Jn;
			if (vn() && e.f & 512) for (m = Yn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Yn < f.length && (sr(e, Yn), f.length = Yn);
		if (Ge() && Xn !== null && !Un && f !== null && !(e.f & 6146)) for (m = 0; m < Xn.length; m++) ir(Xn[m], e);
		if (i !== null && i !== e) {
			if ($n++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = $n;
			if (t !== null) for (let e of t) e.rv = $n;
			Xn !== null && (r === null ? r = Xn : r.push(...Xn));
		}
		return e.f & 8388608 && (e.f ^= te), d;
	} catch (e) {
		return Xe(e);
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
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== Te && et(s), s.ac !== null && ct(() => {
			s.ac.abort(ue), s.ac = null, $e(s, h);
		}), Tt(s), sr(s, 0);
	}
}
function sr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) or(e, n[r]);
}
function cr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		$e(e, m);
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
	await Promise.resolve(), Rt();
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
	if (Vn && Kt.has(e)) return Kt.get(e);
	if (t) {
		var a = e;
		if (Vn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || dr(a)) && (o = Ct(a)), Kt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Un && B !== null && (Bn || !!(B.f & 512)), c = (a.f & y) === 0;
		rr(a) && (s && (a.f |= 512), wt(a)), s && !c && (Et(a), ur(a));
	}
	if (kt?.has(e)) return kt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function ur(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Et(t), ur(t));
}
function dr(e) {
	if (e.v === Te) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Kt.has(t) || t.f & 2 && dr(t)) return !0;
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
		if (r.capture || Sr.call(t, e), !e.cancelBubble) return ct(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Je(() => {
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
	if (!D) {
		var t = cn(e + "");
		return Er(t, t), t;
	}
	var n = O;
	return n.nodeType === 3 ? mn(n) : (n.before(n = cn()), Pe(n)), Er(n, n), n;
}
function Or() {
	if (D) return Er(O, null), O;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = cn();
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
	sn();
	var l = void 0, u = Sn(() => {
		var s = n ?? t.appendChild(cn());
		ft(s, { pending: () => {} }, (t) => {
			Ue({});
			var n = Ve;
			if (o && (n.c = o), a && (i.$$events = a), D && Er(t, null), l = e(t, i) || {}, D && (V.nodes.end = O, O === null || O.nodeType !== 8 || O.data !== "]")) throw Ae(), we;
			We();
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
		var n = M, r = fn();
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
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Fr(e, t) {
	return t;
}
function Ir(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Pn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Lr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
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
		Lr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Lr(e, t, n = !0) {
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
var Rr;
function J(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = D ? Pe(/* @__PURE__ */ ln(u)) : u.appendChild(cn());
	}
	D && Fe();
	var d = null, f = /* @__PURE__ */ xt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Br(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Hr(d, null, c)) : In(d) : Pn(d, () => {
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
			for (var r = /* @__PURE__ */ new Set(), u = M, v = fn(), y = 0; y < e; y += 1) {
				D && O.nodeType === 8 && O.data === "]" && (c = O, t = !0, Ne(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Xt(S.v, b), S.i && Xt(S.i, y), v && u.unskip_effect(S.e)) : (S = Vr(l, h ? c : Rr ??= cn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = Dn(() => s(c)) : (d = Dn(() => s(Rr ??= cn())), d.f |= w)), e > r.size && me("", "", ""), D && e > 0 && Pe(Ie()), !h) {
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
function zr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Br(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = zr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (In(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Hr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Ur(e, d, _), Ur(e, _, y), Hr(_, y, n), d = _, p = [], m = [], l = zr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Hr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Ur(e, S.prev, C.next), Ur(e, d, S), Ur(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Hr(_, l, n), Ur(e, _.prev, _.next), Ur(e, _, d === null ? e.effect.first : d.next), Ur(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = zr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = zr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Lr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = zr(l.next);
		var E = T.length;
		if (E > 0) {
			var ee = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Ir(e, T, ee);
		}
	}
	o && Je(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Vr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Jt(n) : /* @__PURE__ */ Yt(n, !1, !1) : null, l = o & 2 ? Jt(i) : null;
	return {
		v: c,
		i: l,
		e: Dn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Hr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ un(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Ur(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Wr(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		D && (o = Pe(/* @__PURE__ */ ln(c)));
	}
	z(() => {
		var e = V;
		if (s === (s = t() ?? "")) {
			D && Fe();
			return;
		}
		if (n && !D) {
			e.nodes = null, c.innerHTML = s, s !== "" && Er(/* @__PURE__ */ ln(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Mn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (D) {
				for (var a = O.data, l = Fe(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ un(l);
				if (l === null) throw Ae(), we;
				Er(O, u), o = Pe(l);
				return;
			}
			var d = pn(r ? "svg" : i ? "math" : "template", r ? De : i ? Oe : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Er(/* @__PURE__ */ ln(f), f.lastChild), r || i) for (; /* @__PURE__ */ ln(f);) o.before(/* @__PURE__ */ ln(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Gr(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Gr(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Kr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Gr(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function qr(e) {
	return typeof e == "object" ? Kr(e) : e ?? "";
}
var Jr = [..." 	\n\r\f\xA0\v﻿"];
function Yr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Jr.includes(r[o - 1])) && (s === r.length || Jr.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Xr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Zr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function Qr(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Zr)), i && c.push(...Object.keys(i).map(Zr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Zr(e.substring(l, u).trim());
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
		return r && (n += Xr(r)), i && (n += Xr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Y(e, t, n, r, i, a) {
	var o = e[oe];
	if (D || o !== n || o === void 0) {
		var s = Yr(n, r, a);
		(!D || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[oe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function $r(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function ei(e, t, n, r) {
	var i = e[se];
	if (D || i !== t) {
		var a = Qr(t, r);
		(!D || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[se] = t;
	} else r && (Array.isArray(r) ? ($r(e, n?.[0], r[0]), $r(e, n?.[1], r[1], "important")) : $r(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ti(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return je();
		for (var i of t.options) i.selected = n.includes(ii(i));
		return;
	}
	for (i of t.options) if (tn(ii(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function ni(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ti(e, e.__value);
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
function ri(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	lt(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), ii);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && ii(o);
		}
		n(a), e.__value = a, M !== null && r.add(M);
	}), Cn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = M;
			if (r.has(o)) return;
		}
		if (ti(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = ii(s), n(a));
		}
		e.__value = a, i = !1;
	}), ni(e);
}
function ii(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var ai = Symbol("is custom element"), oi = Symbol("is html"), si = de ? "link" : "LINK", ci = de ? "progress" : "PROGRESS";
function X(e) {
	if (D) {
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
		e[le] = n, Je(n), st();
	}
}
function li(e, t) {
	var n = di(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === ci) && (e.value = t ?? "");
}
function ui(e, t) {
	var n = di(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Z(e, t, n, r) {
	var i = di(e);
	D && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === si) || i[t] !== (i[t] = n) && (t === "loading" && (e[ie] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && pi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function di(e) {
	return e[ae] ??= {
		[ai]: e.nodeName.includes("-"),
		[oi]: e.namespaceURI === Ee
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
	lt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = gi(e) ? _i(a) : a, n(a), M !== null && r.add(M), await lr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (D && e.defaultValue !== e.value || fr(t) == null && e.value) && (n(gi(e) ? _i(e.value) : e.value), M !== null && r.add(M)), Tn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = M;
			if (r.has(i)) return;
		}
		gi(e) && n === _i(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function hi(e, t, n = t) {
	lt(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (D && e.defaultChecked !== e.checked || fr(t) == null) && n(e.checked), Tn(() => {
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
	return e === t || e?.[ne] === t;
}
function yi(e = {}, t, n, r) {
	var i = Ve.r, a = V;
	return Cn(() => {
		var o, s;
		return Tn(() => {
			o = s, s = r?.() || [], fr(() => {
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
	n.addEventListener(t, a), i ? Tn(() => {
		n[e] = i();
	}) : a(), (n === document.body || n === window || n === document) && yn(() => {
		n.removeEventListener(t, a);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function xi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ vt(r), H(u)) : (l && (l = !1, c = s ? fr(r) : r), c);
	let f;
	if (o) {
		var p = ne in e || re in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = it(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ye(t), f(m)));
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
	var v = !1, y = (n & 1 ? vt : xt)(() => (v = !1, g()));
	o && H(y);
	var b = V;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? H(y) : i && o ? F(e) : e;
			return P(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Vn && v || b.f & 16384 ? y.v : H(y);
	});
}
function Si(e) {
	Ve === null && fe("onMount"), bn(() => {
		let t = fr(e);
		if (typeof t == "function") return t;
	});
}
function Ci(e) {
	Ve === null && fe("onDestroy"), Si(() => () => fr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/islands/BrandVersion.svelte
var wi = /* @__PURE__ */ W("<span data-svelte-owned=\"brand-version\"> </span>");
function Ti(e, t) {
	let n = xi(t, "version", 3, "v0.1.0");
	var r = wi(), i = I(r, !0);
	k(r), z(() => K(i, n())), G(e, r);
}
//#endregion
//#region src/islands/Icon.svelte
var Ei = /* @__PURE__ */ W("<i></i>");
function Q(e, t) {
	let n = xi(t, "className", 3, "");
	var r = Ei();
	z(() => {
		Z(r, "data-lucide", t.name), Y(r, 1, qr(n()));
	}), G(e, r);
}
//#endregion
//#region src/islands/ChatComposer.svelte
var Di = /* @__PURE__ */ W("<button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button>"), Oi = /* @__PURE__ */ W("<button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn; keep the Session open.\" aria-label=\"End current turn; keep the Session open.\"><!></button>"), ki = /* @__PURE__ */ W("<span class=\"tty-composer-divider\" aria-hidden=\"true\"></span> <span class=\"tty-composer-group\"><!> <button type=\"button\" id=\"agentCloseSessionButton\" class=\"tty-composer-action tty-close-session-button\"><!></button></span>", 1), Ai = /* @__PURE__ */ W("<button type=\"button\" id=\"agentActionsToggle\" class=\"tty-actions-toggle\" title=\"Session actions\" aria-label=\"Session actions\"><!></button>"), ji = /* @__PURE__ */ W("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), Mi = /* @__PURE__ */ W("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Ni = /* @__PURE__ */ W("<div id=\"ttyAgentMenu\" class=\"tty-agent-menu\" role=\"menu\" aria-label=\"Choose an Agent\"></div>"), Pi = /* @__PURE__ */ W("<div class=\"tty-session-actions collapsible open\"><div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div></div>"), Fi = /* @__PURE__ */ W("<form id=\"ttyForm\" class=\"tty-input\"><span>&gt;</span> <textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <span class=\"tty-composer-group\"><!> <button type=\"submit\" class=\"tty-send-button\"><!></button></span> <!> <!></form> <!> <!>", 1), Ii = /* @__PURE__ */ W("<div class=\"external-resource-lock\">This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.</div>"), Li = /* @__PURE__ */ W("<button type=\"button\" id=\"agentResumeButton\" class=\"tty-primary-action\" title=\"Resume Session\" aria-label=\"Resume Session\"><!><span>Resume Session</span></button>"), Ri = /* @__PURE__ */ W("<div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div>"), zi = /* @__PURE__ */ W("<div class=\"tty-session-actions tty-standalone-actions open\" role=\"toolbar\" aria-label=\"Session actions\"><!> <!> <!></div>");
function Bi(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(F(t.channel.current())), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(-1), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ N(!1), s = /* @__PURE__ */ N(""), c = /* @__PURE__ */ N(!1), l = /* @__PURE__ */ N(void 0), u = /* @__PURE__ */ j(() => !!H(n).unavailableReason || H(o) || H(n).sending), d = /* @__PURE__ */ j(() => H(n).sessionStarting ? "Creating a new AgentHub session..." : H(n).agents.length ? "Choose an Agent to start a new session." : "No enabled agents are available. Configure an AgentHub Agent in Settings.");
	Si(() => t.channel.subscribe((e) => {
		P(n, e, !0), e.identity === H(r) ? e.draftResetVersion !== H(i) && (P(i, e.draftResetVersion, !0), P(a, e.draft, !0), P(s, "")) : (P(r, e.identity, !0), P(i, e.draftResetVersion, !0), P(a, e.draft, !0), P(o, !1), P(s, ""), P(c, !1)), queueMicrotask(e.onIconsChanged);
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
		P(a, e, !0), P(s, ""), H(n).onDraft(e, f());
	}
	async function m(e) {
		e?.preventDefault();
		let t = H(a);
		if (H(u) || !t.trim() || !H(n).runId) return;
		let i = H(r), c = f();
		P(o, !0), P(s, "");
		try {
			let e = await H(n).onSend(t, c);
			H(r) === i && e.accepted && e.clear && H(a) === t && p("");
		} catch (e) {
			H(r) === i && P(s, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(r) === i && (P(o, !1), await lr(), H(l)?.focus({ preventScroll: !0 }));
		}
	}
	function h(e) {
		if (!(e.key !== "Enter" || e.isComposing || e.keyCode === 229)) {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault(), m();
				return;
			}
			if (e.shiftKey) {
				P(c, !0);
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
	var _ = Or(), v = L(_), y = (e) => {
		var t = Fi(), r = L(t), i = R(I(r), 2);
		at(i), yi(i, (e) => P(l, e), () => H(l));
		var c = R(i, 2), f = I(c), g = (e) => {
			var t = Di();
			Q(I(t), { name: "plus" }), k(t), U("click", t, function(...e) {
				H(n).onOpenUpload?.apply(this, e);
			}), G(e, t);
		};
		q(f, (e) => {
			H(n).externalLocked || e(g);
		});
		var _ = R(f, 2), v = I(_);
		{
			let e = /* @__PURE__ */ j(() => H(o) ? "loader-circle" : "send");
			Q(v, { get name() {
				return H(e);
			} });
		}
		k(_), k(c);
		var y = R(c, 2), b = (e) => {
			var t = ki(), r = R(L(t), 2), i = I(r), a = (e) => {
				var t = Oi(), r = I(t);
				{
					let e = /* @__PURE__ */ j(() => H(n).endingTurn ? "loader-circle" : "pause");
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
			var o = R(i, 2), s = I(o);
			{
				let e = /* @__PURE__ */ j(() => H(n).closingSession ? "loader-circle" : "square");
				Q(s, { get name() {
					return H(e);
				} });
			}
			k(o), k(r), z(() => {
				o.disabled = H(n).endingTurn || H(n).closingSession || H(n).selfDrivingDisabling, Z(o, "title", H(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session."), Z(o, "aria-label", H(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session.");
			}), U("click", o, function(...e) {
				H(n).onCloseSession?.apply(this, e);
			}), G(e, t);
		};
		q(y, (e) => {
			(H(n).canEndTurn || H(n).runId) && e(b);
		});
		var x = R(y, 2), S = (e) => {
			var t = Ai();
			Q(I(t), { name: "ellipsis" }), k(t), z(() => Z(t, "aria-expanded", H(n).actionsOpen)), U("click", t, function(...e) {
				H(n).onToggleActions?.apply(this, e);
			}), G(e, t);
		};
		q(x, (e) => {
			H(n).internalLocked || e(S);
		}), k(r);
		var C = R(r, 2), w = (e) => {
			var t = ji(), n = I(t), r = I(n, !0);
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
			var t = Pi(), r = I(t), i = I(r), a = I(i);
			{
				let e = /* @__PURE__ */ j(() => H(n).sessionStarting ? "loader-circle" : "plus");
				Q(a, { get name() {
					return H(e);
				} });
			}
			var o = R(a), s = I(o, !0);
			k(o), k(i);
			var c = R(i, 2), l = (e) => {
				var t = Ni();
				J(t, 21, () => H(n).agents, (e) => e.id, (e, t) => {
					var r = Mi();
					let i;
					var a = I(r), o = I(a, !0);
					k(a);
					var s = R(a), c = I(s, !0);
					k(s), k(r), z(() => {
						Z(r, "data-agent-choice", H(t).id), i = Y(r, 1, "", null, i, { active: H(t).id === H(n).selectedAgentId }), K(o, H(t).label), K(c, H(t).summary);
					}), U("click", r, () => H(n).onChooseAgent(H(t).id)), G(e, r);
				}), k(t), G(e, t);
			};
			q(c, (e) => {
				H(n).chooserOpen && e(l);
			}), k(r), k(t), z(() => {
				Z(i, "title", H(d)), Z(i, "aria-label", H(d)), i.disabled = H(n).sessionStarting || !H(n).agents.length, Z(i, "aria-expanded", H(n).chooserOpen), K(s, H(n).sessionStarting ? "Creating Session..." : "New Session");
			}), U("click", i, function(...e) {
				H(n).onToggleChooser?.apply(this, e);
			}), G(e, t);
		};
		q(T, (e) => {
			H(n).actionsOpen && !H(n).internalLocked && e(E);
		}), z(() => {
			Z(i, "data-agent-draft-key", H(n).draftKey), Z(i, "placeholder", H(n).unavailableReason || "Send input to the selected agent session"), i.disabled = H(u), li(i, H(a)), Z(_, "title", H(o) ? "Sending..." : H(n).unavailableReason || "Send input"), Z(_, "aria-label", H(o) ? "Sending..." : H(n).unavailableReason || "Send input"), _.disabled = H(u);
		}), yr("submit", r, m), U("input", i, (e) => p(e.currentTarget.value)), U("keydown", i, h), G(e, t);
	}, b = (e) => {
		var t = zi(), r = I(t), i = (e) => {
			G(e, Ii());
		};
		q(r, (e) => {
			H(n).externalLocked && e(i);
		});
		var a = R(r, 2), o = (e) => {
			var t = Li();
			Q(I(t), { name: "rotate-ccw" }), A(), k(t), U("click", t, function(...e) {
				H(n).onResume?.apply(this, e);
			}), G(e, t);
		};
		q(a, (e) => {
			H(n).canResume && e(o);
		});
		var s = R(a, 2), c = (e) => {
			var t = Ri(), r = I(t), i = I(r);
			{
				let e = /* @__PURE__ */ j(() => H(n).sessionStarting ? "loader-circle" : "plus");
				Q(i, { get name() {
					return H(e);
				} });
			}
			var a = R(i), o = I(a, !0);
			k(a), k(r);
			var s = R(r, 2), c = (e) => {
				var t = Ni();
				J(t, 21, () => H(n).agents, (e) => e.id, (e, t) => {
					var r = Mi();
					let i;
					var a = I(r), o = I(a, !0);
					k(a);
					var s = R(a), c = I(s, !0);
					k(s), k(r), z(() => {
						Z(r, "data-agent-choice", H(t).id), i = Y(r, 1, "", null, i, { active: H(t).id === H(n).selectedAgentId }), K(o, H(t).label), K(c, H(t).summary);
					}), U("click", r, () => H(n).onChooseAgent(H(t).id)), G(e, r);
				}), k(t), G(e, t);
			};
			q(s, (e) => {
				H(n).chooserOpen && e(c);
			}), k(t), z(() => {
				Z(r, "title", H(d)), Z(r, "aria-label", H(d)), r.disabled = H(n).sessionStarting || !H(n).agents.length, Z(r, "aria-expanded", H(n).chooserOpen), K(o, H(n).sessionStarting ? "Creating Session..." : "New Session");
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
	}), G(e, _), We();
}
br([
	"input",
	"keydown",
	"click"
]);
//#endregion
//#region src/islands/CreateDialog.svelte
var Vi = /* @__PURE__ */ W("<span> </span>"), Hi = /* @__PURE__ */ W("<option> </option>"), Ui = /* @__PURE__ */ W("<label><span>Template</span> <select name=\"templateName\"><option>Blank task</option><!></select></label>"), Wi = /* @__PURE__ */ W("<p class=\"template-description\"> </p>"), Gi = /* @__PURE__ */ W("<div class=\"create-dialog-tabs\" role=\"tablist\" aria-label=\"Task content\"><button type=\"button\" role=\"tab\">Edit</button> <button type=\"button\" role=\"tab\">Preview</button></div>"), Ki = /* @__PURE__ */ W("<small> </small>"), qi = /* @__PURE__ */ W("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), Ji = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Fields changed since this preview was rendered. Refresh to update.</p>"), Yi = /* @__PURE__ */ W("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), Xi = /* @__PURE__ */ W("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Zi = /* @__PURE__ */ W("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <small> </small></section>"), Qi = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), $i = /* @__PURE__ */ W("<div class=\"create-task-preview-pane\" role=\"tabpanel\" aria-label=\"Task preview\"><div class=\"template-preview-actions\"><button type=\"button\" class=\"secondary compact\"> </button> <!></div> <!> <!> <!></div>"), ea = /* @__PURE__ */ W("<small>(generated by template)</small>"), ta = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), na = /* @__PURE__ */ W("<input type=\"checkbox\"/><span> </span>", 1), ra = /* @__PURE__ */ W("<textarea></textarea>"), ia = /* @__PURE__ */ W("<select><option>Select...</option><!></select>"), aa = /* @__PURE__ */ W("<input/>"), oa = /* @__PURE__ */ W("<label><!> <!> <!> <!> <!></label>"), sa = /* @__PURE__ */ W("<div class=\"template-fields\" aria-label=\"Required template fields\"></div>"), ca = /* @__PURE__ */ W("<textarea name=\"detail\" placeholder=\"Task detail\"></textarea>"), la = /* @__PURE__ */ W("<div class=\"template-fields\" aria-label=\"Optional template fields\"></div>"), ua = /* @__PURE__ */ W("<div class=\"create-task-automation-fields\"><label><span>Agent <small>(optional)</small></span><select name=\"agentName\"><option>Workspace default</option><!></select></label> <label><span>Run instructions</span><textarea name=\"prompt\" placeholder=\"Instructions for the automated run\"></textarea></label> <label><span>Preferred Agent Profiles</span><input name=\"agentProfiles\" placeholder=\"Workspace default, or kimi, codex\"/><small> </small></label> <label><span>Completion criteria</span><textarea name=\"completionCriteria\" placeholder=\"Natural-language completion criteria\"></textarea></label></div>"), da = /* @__PURE__ */ W("<div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span><input name=\"slug\" placeholder=\"optional-slug\"/></label></div> <!> <details class=\"create-task-more-options\"><summary> </summary> <div class=\"create-task-more-options-body\"><!> <label class=\"create-task-automation-toggle\"><input name=\"selfDriving\" type=\"checkbox\"/><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label> <!></div></details>", 1), fa = /* @__PURE__ */ W("<div class=\"create-task-dialog-body\"><!> <!> <!> <!></div>"), pa = /* @__PURE__ */ W("<textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/>", 1), ma = /* @__PURE__ */ W("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function ha(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(F(t.channel.current())), r = /* @__PURE__ */ N(F(m(H(n).draft))), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(!1), o = /* @__PURE__ */ j(() => H(r).type === "task"), s = /* @__PURE__ */ j(() => H(n).templates.find((e) => e.name === H(r).templateName)), c = /* @__PURE__ */ j(() => H(n).preview?.title || ""), l = /* @__PURE__ */ j(() => H(r).titleOverride ? H(r).title : H(c)), u = /* @__PURE__ */ j(() => (H(s)?.fields || []).filter((e) => e.required)), d = /* @__PURE__ */ j(() => (H(s)?.fields || []).filter((e) => !e.required)), f = /* @__PURE__ */ j(() => H(r).editedMarkdown != null && !!H(n).preview && H(r).editedMarkdown !== H(n).preview?.markdown), p = /* @__PURE__ */ j(() => !H(n).preview || H(n).previewKey !== H(n).previewRequestKey(H(r)));
	Si(() => t.channel.subscribe((e) => {
		let t = H(n).preview;
		P(n, e, !0), e.identity === H(i) ? e.preview && e.preview !== t && H(r).editedMarkdown == null && (H(r).editedMarkdown = e.preview.markdown) : (P(i, e.identity, !0), P(r, m(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), Si(() => {
		let e = (e) => {
			H(n).open && e.key === "Escape" && !H(n).submitting && (e.preventDefault(), H(n).onClose());
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
		if (H(a)) return;
		let t = e.currentTarget.value;
		if (t === H(r).templateName) return;
		if ((Object.values(H(r).templateFields).some((e) => !!e) || H(r).titleOverride || H(r).editedMarkdown != null) && !H(n).onConfirmTemplateSwitch()) {
			P(a, !0), await lr(), P(a, !1);
			return;
		}
		let i = H(n).templates.find((e) => e.name === t);
		H(r).templateName = t, H(r).templateFields = {};
		for (let e of i?.fields || []) H(r).templateFields[e.name] = h(e);
		H(r).title = "", H(r).titleOverride = !1, H(r).activeTab = "edit", H(r).editedMarkdown = null, H(r).showOptions = !1;
	}
	function _(e, t) {
		let n = t.currentTarget;
		H(r).templateFields[e.name] = e.type === "boolean" && n instanceof HTMLInputElement ? n.checked : n.value;
	}
	async function v(e) {
		H(r).activeTab = e, e === "preview" && H(r).templateName && H(p) && await H(n).onPreview(m(H(r)));
	}
	async function y(e) {
		e.preventDefault(), H(n).submitting || await H(n).onSubmit(m(H(r)));
	}
	async function b() {
		!H(n).previewing && !H(n).submitting && await H(n).onPreview(m(H(r)));
	}
	function x(e) {
		H(r).title = e.currentTarget.value, H(r).templateName && (H(r).titleOverride = !0);
	}
	function S(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var C = Or(), w = L(C), T = (e) => {
		var t = ma(), i = I(t), a = R(i, 2);
		let c;
		var m = I(a), h = I(m), C = I(h), w = I(C, !0);
		k(C);
		var T = R(C, 2), E = (e) => {
			var t = Vi(), n = I(t, !0);
			k(t), z(() => K(n, H(r).projectId)), G(e, t);
		};
		q(T, (e) => {
			H(o) && e(E);
		}), k(h);
		var ee = R(h, 2);
		Q(I(ee), { name: "x" }), k(ee), k(m);
		var te = R(m, 2), ne = I(te), re = (e) => {
			var t = fa(), i = I(t), a = (e) => {
				var t = Ui(), i = R(I(t), 2), a = I(i);
				a.value = a.__value = "", J(R(a), 17, () => H(n).templates, (e) => e.name, (e, t) => {
					var n = Hi(), r = I(n, !0);
					k(n);
					var i = {};
					z((e) => {
						n.disabled = !H(t).valid, K(r, e), i !== (i = H(t).name) && (n.value = (n.__value = H(t).name) ?? "");
					}, [() => S(H(t))]), G(e, n);
				}), k(i);
				var o;
				ni(i), k(t), z(() => {
					o !== (o = H(r).templateName) && (i.value = (i.__value = H(r).templateName) ?? "", ti(i, H(r).templateName));
				}), U("change", i, g), G(e, t);
			};
			q(i, (e) => {
				H(n).templates.length && e(a);
			});
			var o = R(i, 2), c = (e) => {
				var t = Wi(), n = I(t, !0);
				k(t), z(() => K(n, H(s).description)), G(e, t);
			};
			q(o, (e) => {
				H(s)?.description && e(c);
			});
			var m = R(o, 2), h = (e) => {
				var t = Gi(), n = I(t);
				let i;
				var a = R(n, 2);
				let o;
				k(t), z(() => {
					i = Y(n, 1, "create-dialog-tab", null, i, { active: H(r).activeTab === "edit" }), Z(n, "aria-selected", H(r).activeTab === "edit"), o = Y(a, 1, "create-dialog-tab", null, o, { active: H(r).activeTab === "preview" }), Z(a, "aria-selected", H(r).activeTab === "preview");
				}), U("click", n, () => v("edit")), U("click", a, () => v("preview")), G(e, t);
			};
			q(m, (e) => {
				H(s) && e(h);
			});
			var y = R(m, 2), C = (e) => {
				var t = $i(), i = I(t), a = I(i), o = I(a, !0);
				k(a);
				var s = R(a, 2), c = (e) => {
					var t = Ki(), i = I(t);
					k(t), z(() => K(i, `Template ${H(r).templateName ?? ""} · ${H(n).templateDigest ?? ""}`)), G(e, t);
				};
				q(s, (e) => {
					H(n).templateDigest && e(c);
				}), k(i);
				var l = R(i, 2), u = (e) => {
					var t = qi(), r = I(t, !0);
					k(t), z(() => K(r, H(n).previewError)), G(e, t);
				};
				q(l, (e) => {
					H(n).previewError && e(u);
				});
				var d = R(l, 2), m = (e) => {
					G(e, Ji());
				};
				q(d, (e) => {
					!H(n).previewError && H(p) && H(n).preview && e(m);
				});
				var h = R(d, 2), g = (e) => {
					var t = Zi(), i = I(t), a = I(i, !0);
					k(i);
					var o = R(i, 2);
					at(o);
					var s = R(o, 2), c = (e) => {
						var t = Yi(), i = R(I(t), 2);
						k(t), U("click", i, () => H(r).editedMarkdown = H(n).preview?.markdown ?? null), G(e, t);
					}, l = (e) => {
						G(e, Xi());
					};
					q(s, (e) => {
						H(f) ? e(c) : e(l, -1);
					});
					var u = R(s, 2), d = (e) => {
						var t = Ki(), r = I(t);
						k(t), z(() => K(r, `Slug: ${H(n).preview.slug ?? ""}`)), G(e, t);
					};
					q(u, (e) => {
						H(n).preview.slug && e(d);
					});
					var p = R(u, 2), m = I(p);
					k(p), k(t), z(() => {
						K(a, H(n).preview.title), K(m, `Self-Driving: ${H(n).preview.selfDriving ? `on with ${H(n).preview.selfDriving.agentName || "workspace default"}` : "off"}`);
					}), mi(o, () => H(r).editedMarkdown, (e) => H(r).editedMarkdown = e), G(e, t);
				}, _ = (e) => {
					G(e, Qi());
				};
				q(h, (e) => {
					H(n).preview ? e(g) : H(n).previewing && e(_, 1);
				}), k(t), z(() => {
					a.disabled = H(n).previewing || H(n).submitting, K(o, H(n).previewing ? "Rendering..." : "Refresh");
				}), U("click", a, b), G(e, t);
			}, w = (e) => {
				var t = da(), i = L(t), a = I(i), o = I(a), c = R(I(o)), f = (e) => {
					G(e, ea());
				};
				q(c, (e) => {
					H(s)?.taskTitle && !H(r).titleOverride && e(f);
				}), k(o);
				var p = R(o, 2), m = I(p);
				X(m);
				var h = R(m, 2), g = (e) => {
					var t = ta();
					U("click", t, () => {
						H(r).title = "", H(r).titleOverride = !1;
					}), G(e, t);
				};
				q(h, (e) => {
					H(s)?.taskTitle && H(r).titleOverride && e(g);
				}), k(p), k(a);
				var v = R(a, 2), y = R(I(v));
				X(y), k(v), k(i);
				var b = R(i, 2), S = (e) => {
					var t = Or(), n = L(t), i = (e) => {
						var t = sa();
						J(t, 21, () => H(u), (e) => e.name, (e, t) => {
							var n = oa();
							let i;
							var a = I(n), o = (e) => {
								var n = na(), i = L(n);
								X(i);
								var a = R(i), o = I(a, !0);
								k(a), z(() => {
									ui(i, H(r).templateFields[H(t).name] === !0), K(o, H(t).label);
								}), U("change", i, (e) => _(H(t), e)), G(e, n);
							}, s = (e) => {
								var n = Vi(), r = I(n);
								k(n), z(() => K(r, `${H(t).label ?? ""}${H(t).required ? " *" : ""}`)), G(e, n);
							};
							q(a, (e) => {
								H(t).type === "boolean" ? e(o) : e(s, -1);
							});
							var c = R(a, 2), l = (e) => {
								var n = ra();
								at(n), z((e) => {
									n.required = H(t).required, Z(n, "placeholder", H(t).placeholder || ""), li(n, e);
								}, [() => String(H(r).templateFields[H(t).name] ?? "")]), U("input", n, (e) => _(H(t), e)), G(e, n);
							};
							q(c, (e) => {
								H(t).type === "textarea" && e(l);
							});
							var u = R(c, 2), d = (e) => {
								var n = ia(), i = I(n);
								i.value = i.__value = "", J(R(i), 17, () => H(t).options || [], Fr, (e, t) => {
									var n = Hi(), r = I(n, !0);
									k(n);
									var i = {};
									z(() => {
										K(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
									}), G(e, n);
								}), k(n);
								var a;
								ni(n), z((e) => {
									n.required = H(t).required, a !== (a = e) && (n.value = (n.__value = e) ?? "", ti(n, e));
								}, [() => String(H(r).templateFields[H(t).name] ?? "")]), U("change", n, (e) => _(H(t), e)), G(e, n);
							};
							q(u, (e) => {
								H(t).type === "select" && e(d);
							});
							var f = R(u, 2), p = (e) => {
								var n = aa();
								X(n), z((e) => {
									n.required = H(t).required, Z(n, "placeholder", H(t).placeholder || ""), li(n, e);
								}, [() => String(H(r).templateFields[H(t).name] ?? "")]), U("input", n, (e) => _(H(t), e)), G(e, n);
							};
							q(f, (e) => {
								H(t).type === "text" && e(p);
							});
							var m = R(f, 2), h = (e) => {
								var n = Ki(), r = I(n, !0);
								k(n), z(() => K(r, H(t).description)), G(e, n);
							};
							q(m, (e) => {
								H(t).description && e(h);
							}), k(n), z(() => i = Y(n, 1, "", null, i, { "template-boolean": H(t).type === "boolean" })), G(e, n);
						}), k(t), G(e, t);
					};
					q(n, (e) => {
						H(u).length && e(i);
					}), G(e, t);
				}, C = (e) => {
					var t = ca();
					at(t), mi(t, () => H(r).detail, (e) => H(r).detail = e), G(e, t);
				};
				q(b, (e) => {
					H(s) ? e(S) : e(C, -1);
				});
				var w = R(b, 2), T = I(w), E = I(T);
				k(T);
				var ee = R(T, 2), te = I(ee), ne = (e) => {
					var t = la();
					J(t, 21, () => H(d), (e) => e.name, (e, t) => {
						var n = oa();
						let i;
						var a = I(n), o = (e) => {
							var n = na(), i = L(n);
							X(i);
							var a = R(i), o = I(a, !0);
							k(a), z(() => {
								ui(i, H(r).templateFields[H(t).name] === !0), K(o, H(t).label);
							}), U("change", i, (e) => _(H(t), e)), G(e, n);
						}, s = (e) => {
							var n = Vi(), r = I(n, !0);
							k(n), z(() => K(r, H(t).label)), G(e, n);
						};
						q(a, (e) => {
							H(t).type === "boolean" ? e(o) : e(s, -1);
						});
						var c = R(a, 2), l = (e) => {
							var n = ra();
							at(n), z((e) => {
								Z(n, "placeholder", H(t).placeholder || ""), li(n, e);
							}, [() => String(H(r).templateFields[H(t).name] ?? "")]), U("input", n, (e) => _(H(t), e)), G(e, n);
						};
						q(c, (e) => {
							H(t).type === "textarea" && e(l);
						});
						var u = R(c, 2), d = (e) => {
							var n = ia(), i = I(n);
							i.value = i.__value = "", J(R(i), 17, () => H(t).options || [], Fr, (e, t) => {
								var n = Hi(), r = I(n, !0);
								k(n);
								var i = {};
								z(() => {
									K(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
								}), G(e, n);
							}), k(n);
							var a;
							ni(n), z((e) => {
								a !== (a = e) && (n.value = (n.__value = e) ?? "", ti(n, e));
							}, [() => String(H(r).templateFields[H(t).name] ?? "")]), U("change", n, (e) => _(H(t), e)), G(e, n);
						};
						q(u, (e) => {
							H(t).type === "select" && e(d);
						});
						var f = R(u, 2), p = (e) => {
							var n = aa();
							X(n), z((e) => {
								Z(n, "placeholder", H(t).placeholder || ""), li(n, e);
							}, [() => String(H(r).templateFields[H(t).name] ?? "")]), U("input", n, (e) => _(H(t), e)), G(e, n);
						};
						q(f, (e) => {
							H(t).type === "text" && e(p);
						});
						var m = R(f, 2), h = (e) => {
							var n = Ki(), r = I(n, !0);
							k(n), z(() => K(r, H(t).description)), G(e, n);
						};
						q(m, (e) => {
							H(t).description && e(h);
						}), k(n), z(() => i = Y(n, 1, "", null, i, { "template-boolean": H(t).type === "boolean" })), G(e, n);
					}), k(t), G(e, t);
				};
				q(te, (e) => {
					H(d).length && e(ne);
				});
				var re = R(te, 2), ie = I(re);
				X(ie), A(), k(re);
				var ae = R(re, 2), oe = (e) => {
					var t = ua(), i = I(t), a = R(I(i)), o = I(a);
					o.value = o.__value = "", J(R(o), 17, () => H(n).agents, (e) => e.id, (e, t) => {
						var n = Hi(), r = I(n);
						k(n);
						var i = {};
						z(() => {
							K(r, `${H(t).label ?? ""} — ${H(t).summary ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
						}), G(e, n);
					}), k(a), k(i);
					var s = R(i, 2), c = R(I(s));
					at(c), k(s);
					var l = R(s, 2), u = R(I(l));
					X(u);
					var d = R(u), f = I(d, !0);
					k(d), k(l);
					var p = R(l, 2), m = R(I(p));
					at(m), k(p), k(t), z((e) => K(f, e), [() => H(n).profileKeys.length ? `Available: ${H(n).profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."]), ri(a, () => H(r).agentName, (e) => H(r).agentName = e), mi(c, () => H(r).prompt, (e) => H(r).prompt = e), mi(u, () => H(r).agentProfiles, (e) => H(r).agentProfiles = e), mi(m, () => H(r).completionCriteria, (e) => H(r).completionCriteria = e), G(e, t);
				};
				q(ae, (e) => {
					H(r).selfDriving && e(oe);
				}), k(ee), k(w), z(() => {
					m.required = !H(s)?.taskTitle, li(m, H(s)?.taskTitle ? H(l) : H(r).title), Z(m, "placeholder", H(s)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), K(E, `More options${H(r).selfDriving ? " · Self-Driving on" : ""}`);
				}), U("input", m, x), mi(y, () => H(r).slug, (e) => H(r).slug = e), hi(ie, () => H(r).selfDriving, (e) => H(r).selfDriving = e), bi("open", "toggle", w, (e) => H(r).showOptions = e, () => H(r).showOptions), G(e, t);
			};
			q(y, (e) => {
				H(s) && H(r).activeTab === "preview" ? e(C) : e(w, -1);
			}), k(t), G(e, t);
		}, ie = (e) => {
			var t = pa(), n = L(t);
			at(n);
			var i = R(n, 2);
			X(i), mi(n, () => H(r).description, (e) => H(r).description = e), mi(i, () => H(r).slug, (e) => H(r).slug = e), G(e, t);
		};
		q(ne, (e) => {
			H(o) ? e(re) : e(ie, -1);
		});
		var ae = R(ne, 2), oe = I(ae), se = I(oe, !0);
		k(oe);
		var ce = R(oe, 2);
		k(ae), k(te), k(a), k(t), z(() => {
			c = Y(a, 1, "create-dialog modal-enter", null, c, { "create-task-dialog": H(o) }), Z(a, "aria-label", H(o) ? "Create task" : "Create project"), K(w, H(o) ? "Create task" : "Create project"), ee.disabled = H(n).submitting, oe.disabled = H(n).submitting, K(se, H(n).submitting ? "Creating..." : "Create"), ce.disabled = H(n).submitting;
		}), U("click", i, function(...e) {
			H(n).onClose?.apply(this, e);
		}), U("click", ee, function(...e) {
			H(n).onClose?.apply(this, e);
		}), yr("submit", te, y), U("click", ce, function(...e) {
			H(n).onClose?.apply(this, e);
		}), G(e, t);
	};
	q(w, (e) => {
		H(n).open && e(T);
	}), G(e, C), We();
}
br([
	"click",
	"change",
	"input"
]);
//#endregion
//#region src/api/client.ts
var ga = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, _a = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, va = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new _a(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new _a(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new _a(e.scope));
		this.active.clear();
	}
}, ya = class {
	requests = new va();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: xa(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: xa(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof _a) ? new _a(n) : e;
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
			let n = ba(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new ga(e.status, r, n);
		}
		return t;
	}
};
function ba(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function xa(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new ya();
//#endregion
//#region src/islands/DiffModal.svelte
var Sa = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), Ca = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), wa = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), Ta = /* @__PURE__ */ W("<div class=\"diff-viewer\"></div>"), Ea = /* @__PURE__ */ W("<div class=\"diff-modal-layer\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function Da(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(null), r = /* @__PURE__ */ N(!1), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(void 0), o = /* @__PURE__ */ j(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	bn(() => {
		let e = t.repo, a = H(o);
		if (P(n, null), P(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		P(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (P(n, r, !0), await lr(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (P(i, n instanceof Error ? n.message : String(n), !0), t.onError(H(i)));
		}).finally(() => {
			t.repo === e && (P(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), bn(() => {
		H(n)?.diff, H(a), s();
	}), Ci(() => t.client.requests.abort(H(o)));
	function s() {
		!H(a) || !H(n)?.diff || !window.Diff2Html || (H(a).innerHTML = window.Diff2Html.html(H(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Or(), l = L(c), u = (e) => {
		var o = Ea(), s = I(o), c = R(s, 2), l = I(c), u = I(l), d = I(u), f = I(d, !0);
		k(d);
		var p = R(d), m = I(p);
		k(p), k(u);
		var h = R(u);
		Q(I(h), { name: "x" }), k(h), k(l);
		var g = R(l, 2), _ = (e) => {
			var n = Sa(), r = I(n);
			Q(r, { name: "loader-circle" });
			var i = R(r, 2), a = I(i, !0);
			k(i), k(n), z(() => K(a, t.repo.worktreePath || "")), G(e, n);
		}, v = (e) => {
			var t = Ca(), n = I(t);
			Q(n, { name: "triangle-alert" });
			var r = R(n, 2), a = I(r, !0);
			k(r), k(t), z(() => K(a, H(i))), G(e, t);
		}, y = (e) => {
			var t = wa();
			Q(I(t), { name: "check-circle-2" }), A(2), k(t), G(e, t);
		}, b = /* @__PURE__ */ j(() => !H(n)?.hasChanges || !H(n).diff?.trim()), x = (e) => {
			var t = Ta();
			yi(t, (e) => P(a, e), () => H(a)), G(e, t);
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
	}), G(e, c), We();
}
br(["click"]);
//#endregion
//#region src/islands/detail.ts
function Oa(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function ka(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${Fa(e)}</pre>`;
}
function Aa(e) {
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
function ja(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function Ma(e) {
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
function Na(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function Pa(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...Pa(a.children || [], t, n, r + 1));
	return i;
}
function Fa(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/islands/FileBrowser.svelte
var Ia = /* @__PURE__ */ W("<a class=\"artifact-download\"><!></a>"), La = /* @__PURE__ */ W("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), Ra = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span> </span></div>"), za = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span> </span></h3> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function Ba(e, t) {
	Ue(t, !0);
	let n = xi(t, "entries", 19, () => []), r = xi(t, "emptyMessage", 3, "No files."), i = xi(t, "activePath", 3, ""), a = /* @__PURE__ */ j(() => Pa(n(), t.expanded, t.title)), o = /* @__PURE__ */ j(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var c = za(), l = I(c), u = I(l);
	Q(u, { get name() {
		return H(o);
	} });
	var d = R(u), f = I(d, !0);
	k(d), k(l);
	var p = R(l, 2), m = I(p), h = I(m), g = (e) => {
		var n = Or();
		J(L(n), 17, () => H(a), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ j(() => H(n).entry.type === "directory"), a = /* @__PURE__ */ j(() => t.expanded.has(`${t.title}:${H(n).entry.path}`));
			var o = La(), c = I(o);
			let l;
			var u = I(c), d = I(u), f = I(d), p = (e) => {
				{
					let t = /* @__PURE__ */ j(() => H(a) ? "chevron-down" : "chevron-right");
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
				let e = /* @__PURE__ */ j(() => H(r) ? H(a) ? "folder-open" : "folder" : s(H(n).entry.name)), t = /* @__PURE__ */ j(() => H(r) ? "artifact-icon artifact-icon-dir" : "artifact-icon");
				Q(m, {
					get name() {
						return H(e);
					},
					get className() {
						return H(t);
					}
				});
			}
			var h = R(m), g = I(h, !0);
			k(h), k(u);
			var _ = R(u, 2), v = I(_), y = (e) => {
				var r = Ia();
				Q(I(r), {
					name: "download",
					className: "artifact-download-icon"
				}), k(r), z((e) => {
					Z(r, "href", e), Z(r, "download", H(n).entry.name), Z(r, "title", `Download ${H(n).entry.name}`), Z(r, "aria-label", `Download ${H(n).entry.name}`);
				}, [() => t.rawURL(t.title, H(n).entry.path, !0)]), U("click", r, (e) => e.stopPropagation()), G(e, r);
			};
			q(v, (e) => {
				H(r) || e(y);
			});
			var b = R(v), x = I(b, !0);
			k(b), k(_), k(c), k(o), z((e) => {
				l = Y(c, 1, "artifact-row", null, l, {
					directory: H(r),
					file: !H(r),
					active: i() === `${t.title}:${H(n).entry.path}`
				}), ei(c, `--depth: ${H(n).depth}`), Z(h, "title", H(n).entry.path), K(g, H(n).entry.name), K(x, e);
			}, [() => H(r) ? `${(H(n).entry.children || []).length} items` : Na(H(n).entry.size || 0)]), U("click", c, () => H(r) ? t.onToggle(`${t.title}:${H(n).entry.path}`) : t.onPreview(t.title, H(n).entry.path)), G(e, o);
		}), G(e, n);
	}, _ = (e) => {
		var n = Ra(), i = I(n);
		{
			let e = /* @__PURE__ */ j(() => t.title === "Artifacts" ? "archive" : "inbox");
			Q(i, { get name() {
				return H(e);
			} });
		}
		var a = R(i), o = I(a, !0);
		k(a), k(n), z(() => K(o, r())), G(e, n);
	};
	q(h, (e) => {
		H(a).length ? e(g) : e(_, -1);
	}), k(m), k(p), k(c), z(() => K(f, t.title)), G(e, c), We();
}
br(["click"]);
//#endregion
//#region src/islands/FilePreviewModal.svelte
var Va = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), Ha = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), Ua = /* @__PURE__ */ W("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), Wa = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), Ga = /* @__PURE__ */ W("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Ka = /* @__PURE__ */ W("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), qa = /* @__PURE__ */ W("<div class=\"file-modal-layer\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Ja(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(null), r = /* @__PURE__ */ N(!1), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ j(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ j(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : "");
	bn(() => {
		let e = t.selection, o = H(a);
		if (P(n, null), P(i, ""), !e) {
			t.client.requests.abort(o);
			return;
		}
		P(r, !0);
		let s = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${s}?path=${encodeURIComponent(e.path)}`, { scope: o }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && P(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (P(i, n instanceof Error ? n.message : String(n), !0), t.onError(H(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (P(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Ci(() => t.client.requests.abort(H(a)));
	var s = Or(), c = L(s), l = (e) => {
		var a = qa(), s = I(a), c = R(s, 2), l = I(c), u = I(l), d = I(u), f = I(d, !0);
		k(d);
		var p = R(d), m = I(p);
		k(p), k(u);
		var h = R(u), g = I(h);
		Q(I(g), { name: "external-link" }), A(), k(g);
		var _ = R(g);
		Q(I(_), { name: "x" }), k(_), k(h), k(l);
		var v = R(l, 2), y = (e) => {
			var n = Va(), r = I(n);
			Q(r, { name: "loader-circle" });
			var i = R(r, 2), a = I(i, !0);
			k(i), k(n), z(() => K(a, t.selection.path)), G(e, n);
		}, b = (e) => {
			var t = Ha(), n = I(t);
			Q(n, { name: "triangle-alert" });
			var r = R(n, 2), a = I(r, !0);
			k(r), k(t), z(() => K(a, H(i))), G(e, t);
		}, x = (e) => {
			var r = Ua(), i = I(r);
			k(r), z(() => {
				Z(i, "src", H(o)), Z(i, "alt", H(n).name || t.selection.path);
			}), G(e, r);
		}, S = (e) => {
			var r = Wa(), i = I(r);
			Q(i, { name: "file-warning" });
			var a = R(i), o = I(a, !0);
			k(a);
			var s = R(a), c = I(s);
			k(s), k(r), z((e) => {
				K(o, H(n).name || t.selection.path), K(c, `Binary file, ${e ?? ""}.`);
			}, [() => Na(H(n).size || 0)]), G(e, r);
		}, C = (e) => {
			var t = Ga();
			Wr(t, () => ka(H(n)?.content || ""), !0), k(t), G(e, t);
		}, w = /* @__PURE__ */ j(() => Oa(H(n)?.path || t.selection.path)), T = (e) => {
			var t = Ka(), r = I(t, !0);
			k(t), z(() => K(r, H(n)?.content || "")), G(e, t);
		};
		q(v, (e) => {
			H(r) ? e(y) : H(i) ? e(b, 1) : H(n)?.image ? e(x, 2) : H(n)?.binary ? e(S, 3) : H(w) ? e(C, 4) : e(T, -1);
		}), k(c), k(a), z((e, r) => {
			Z(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${H(n)?.contentHash || "pending"}`), K(f, e), K(m, `${t.selection.path ?? ""}${r ?? ""}${H(n)?.truncated ? " · truncated" : ""}`), Z(g, "href", H(o));
		}, [() => H(n)?.name || t.selection.path.split("/").pop() || "File preview", () => H(n)?.size == null ? "" : ` · ${Na(H(n).size)}`]), U("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), U("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), G(e, a);
	};
	q(c, (e) => {
		t.selection && e(l);
	}), G(e, s), We();
}
br(["click"]);
//#endregion
//#region src/islands/LogTimeline.svelte
var Ya = /* @__PURE__ */ W("<div class=\"markdown-rendered\"></div>"), Xa = /* @__PURE__ */ W("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), Za = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), Qa = /* @__PURE__ */ W("<div class=\"log-load-actions\"><button type=\"button\" class=\"secondary-button log-load-more\"><!><span> </span></button></div>"), $a = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Log</span></h3> <div class=\"log-timeline\"></div> <!> <!></div>");
function eo(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ j(() => [...t.logs || []].sort(ja)), r = /* @__PURE__ */ N(!1);
	async function i() {
		if (!(t.loading || H(r))) {
			P(r, !0);
			try {
				await t.onLoadMore();
			} finally {
				P(r, !1), queueMicrotask(t.onIconsChanged);
			}
		}
	}
	var a = Or(), o = L(a), s = (e) => {
		var a = $a(), o = I(a);
		Q(I(o), { name: "history" }), A(), k(o);
		var s = R(o, 2);
		J(s, 21, () => H(n), (e) => e.id, (e, t) => {
			var n = Xa(), r = I(n), i = I(r), a = I(i), o = I(a, !0);
			k(a);
			var s = R(a), c = I(s, !0);
			k(s), k(i);
			var l = R(i, 2), u = I(l, !0);
			k(l);
			var d = R(l, 2);
			Q(I(d), { name: "chevron-right" }), k(d), k(r);
			var f = R(r, 2);
			let p;
			var m = I(f), h = (e) => {
				var n = Ya();
				Wr(n, () => ka(H(t).details), !0), k(n), G(e, n);
			}, g = (e) => {
				G(e, Dr("No details."));
			};
			q(m, (e) => {
				H(t).details ? e(h) : e(g, -1);
			}), k(f), k(n), z((e) => {
				Z(n, "data-log-id", H(t).id), Z(i, "title", H(t).time), K(o, e), K(c, H(t).time), K(u, H(t).title || "Untitled log entry"), p = Y(f, 1, "log-details", null, p, { empty: !H(t).details });
			}, [() => Ma(H(t).time)]), G(e, n);
		}), k(s);
		var c = R(s, 2), l = (e) => {
			var n = Za(), r = I(n, !0);
			k(n), z(() => K(r, t.error)), G(e, n);
		};
		q(c, (e) => {
			t.error && e(l);
		});
		var u = R(c, 2), d = (e) => {
			var n = Qa(), a = I(n), o = I(a);
			{
				let e = /* @__PURE__ */ j(() => t.loading || H(r) ? "loader-circle" : "chevron-down"), n = /* @__PURE__ */ j(() => t.loading || H(r) ? "spin" : "");
				Q(o, {
					get name() {
						return H(e);
					},
					get className() {
						return H(n);
					}
				});
			}
			var s = R(o), c = I(s, !0);
			k(s), k(a), k(n), z(() => {
				a.disabled = t.loading || H(r), Z(a, "aria-busy", t.loading || H(r)), K(c, t.loading || H(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), U("click", a, i), G(e, n);
		};
		q(u, (e) => {
			t.hasMore && e(d);
		}), k(a), z(() => Z(a, "data-log-resource", t.resourceId)), G(e, a);
	};
	q(o, (e) => {
		(H(n).length || t.error || t.hasMore) && e(s);
	}), G(e, a), We();
}
br(["click"]);
//#endregion
//#region src/islands/MarkdownDocument.svelte
var to = /* @__PURE__ */ W("<a class=\"markdown-open-file\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a>"), no = /* @__PURE__ */ W("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), ro = /* @__PURE__ */ W("<pre class=\"markdown-view\"> </pre>"), io = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span> </span> <!></h3> <!></div>");
function ao(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ j(() => Oa(t.file.name)), r = /* @__PURE__ */ j(() => `/api/workspaces/${encodeURIComponent(t.workspaceId)}/files/raw?path=${encodeURIComponent(t.file.path || "")}`);
	var i = io(), a = I(i), o = I(a);
	Q(o, { name: "file-text" });
	var s = R(o), c = I(s, !0);
	k(s);
	var l = R(s, 2), u = (e) => {
		var n = to();
		Q(I(n), { name: "external-link" }), A(), k(n), z(() => {
			Z(n, "href", H(r)), Z(n, "aria-label", `Open ${t.file.name} in new window`);
		}), G(e, n);
	};
	q(l, (e) => {
		H(n) && t.file.path && e(u);
	}), k(a);
	var d = R(a, 2), f = (e) => {
		var n = no(), r = I(n);
		Wr(r, () => ka(t.file.content || ""), !0), k(r), k(n), G(e, n);
	}, p = (e) => {
		var n = ro(), r = I(n, !0);
		k(n), z(() => K(r, t.file.content || "")), G(e, n);
	};
	q(d, (e) => {
		H(n) ? e(f) : e(p, -1);
	}), k(i), z(() => {
		Z(i, "data-doc-file", t.file.name), Z(i, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`), K(c, t.file.name);
	}), G(e, i), We();
}
//#endregion
//#region src/islands/WorkspaceAgentsEditor.svelte
var oo = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), so = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), co = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), lo = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), uo = /* @__PURE__ */ W("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><!><span> </span></button></div></form>"), fo = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function po(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(""), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ N(""), s = /* @__PURE__ */ N(!1), c = /* @__PURE__ */ N(""), l = /* @__PURE__ */ j(() => H(r) !== H(i)), u = /* @__PURE__ */ j(() => !!(H(l) && H(o) && H(a) && H(o) !== H(a)));
	bn(() => {
		let e = Aa(t.file?.content || ""), u = t.file?.contentHash || "";
		P(o, u, !0), t.identity === H(n) ? !H(l) && u !== H(a) && (P(r, e, !0), P(i, e, !0), P(a, u, !0)) : (P(n, t.identity, !0), P(r, e, !0), P(i, e, !0), P(a, u, !0), P(c, ""), P(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), H(s) || !H(l)) return;
		let u = H(n);
		P(s, !0), P(c, "");
		try {
			let e = await t.onSave(H(r), H(a));
			if (H(n) !== u) return;
			P(i, Aa(e.content || H(r)), !0), P(r, H(i), !0), P(a, e.contentHash || "", !0), P(o, H(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			H(n) === u && P(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(n) === u && (P(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = fo(), p = I(f);
	Q(I(p), { name: "file-text" }), A(), k(p);
	var m = R(p, 2), h = (e) => {
		var t = oo();
		Q(I(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(), k(t), G(e, t);
	}, g = (e) => {
		var n = so(), r = I(n);
		Q(r, { name: "triangle-alert" });
		var i = R(r, 2), a = I(i, !0);
		k(i), k(n), z(() => K(a, t.file.error)), G(e, n);
	}, _ = (e) => {
		var t = uo(), n = I(t);
		at(n);
		var i = R(n, 2), a = (e) => {
			G(e, co());
		};
		q(i, (e) => {
			H(u) && e(a);
		});
		var o = R(i, 2), f = (e) => {
			var t = lo(), n = I(t, !0);
			k(t), z(() => K(n, H(c))), G(e, t);
		};
		q(o, (e) => {
			H(c) && e(f);
		});
		var p = R(o, 2), m = I(p), h = I(m);
		{
			let e = /* @__PURE__ */ j(() => H(s) ? "loader-circle" : "save");
			Q(h, { get name() {
				return H(e);
			} });
		}
		var g = R(h), _ = I(g, !0);
		k(g), k(m), k(p), k(t), z(() => {
			n.disabled = H(s), m.disabled = H(s) || !H(l), K(_, H(s) ? "Saving" : "Save");
		}), yr("submit", t, d), mi(n, () => H(r), (e) => P(r, e)), G(e, t);
	};
	q(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), k(f), G(e, f), We();
}
//#endregion
//#region src/islands/DetailPanel.svelte
var mo = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div>"), ho = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), go = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), _o = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> </h1></div></div> <!> <!>", 1), vo = /* @__PURE__ */ W("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), yo = /* @__PURE__ */ W("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), bo = /* @__PURE__ */ W("<div class=\"details-actions\"><!><button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button></div>"), xo = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading details...</strong></div>"), So = /* @__PURE__ */ W("<span class=\"details-tab-count\"> </span>"), Co = /* @__PURE__ */ W("<button type=\"button\" role=\"tab\"><span> </span><!></button>"), wo = /* @__PURE__ */ W("<div><!></div>"), To = /* @__PURE__ */ W("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), Eo = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), Do = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Task Templates</span></h3><div class=\"template-list\"><!></div></div>"), Oo = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Template</span></h3><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), ko = /* @__PURE__ */ W("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), Ao = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), jo = /* @__PURE__ */ W("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><h3><!><span>Worktrees</span></h3><div class=\"worktree-list\"><!></div></div></div>", 1), Mo = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <code class=\"resource-ref-badge\"> </code></h1><!></div></div> <!>", 1), No = /* @__PURE__ */ W("<!> <!> <!>", 1);
function Po(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(F(t.channel.current())), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(F(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ N(null), s = /* @__PURE__ */ N(null), c = /* @__PURE__ */ new Map(), l = new ya(), u = /* @__PURE__ */ j(() => (H(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), d = /* @__PURE__ */ j(() => new Set(H(u).map((e) => e.name))), f = /* @__PURE__ */ j(h), p = /* @__PURE__ */ j(() => H(o) ? `${H(o).section}:${H(o).path}` : "");
	Si(() => t.channel.subscribe((e) => {
		if (P(n, e, !0), e.identity !== H(r)) {
			H(r) && H(i) && c.set(H(r), H(i)), P(r, e.identity, !0), P(o, null), P(s, null), P(a, /* @__PURE__ */ new Set(), !0), P(i, c.get(H(r)) || m(e), !0);
			let t = document.getElementById("detailsPanel");
			t && (t.scrollTop = 0);
		} else H(f).length && !H(f).some((e) => e.id === H(i)) && P(i, H(f)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), Si(() => {
		let e = (e) => {
			e.key === "Escape" && (H(s) ? (e.preventDefault(), P(s, null)) : H(o) && (e.preventDefault(), P(o, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Ci(() => l.dispose());
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
		P(i, e, !0), c.set(H(r), e);
	}
	function v(e) {
		let t = new Set(H(a));
		t.has(e) ? t.delete(e) : t.add(e), P(a, t, !0), queueMicrotask(H(n).onIconsChanged);
	}
	function y(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(H(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function b(e, t) {
		P(o, {
			section: e,
			path: t
		}, !0);
	}
	function x(e) {
		e && H(n).onToast(e);
	}
	var S = No(), C = L(S), w = (e) => {
		var t = mo();
		Q(I(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(t), G(e, t);
	}, T = (e) => {
		var t = _o(), r = L(t), i = I(r), o = I(i), s = I(o, !0);
		k(o), k(i);
		var c = R(i), l = I(c), u = I(l, !0);
		k(l), k(c), k(r);
		var d = R(r, 2);
		po(d, {
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
			var t = ho(), r = I(t);
			Q(I(r), { name: "book-open" }), A(), k(r);
			var i = R(r), a = I(i);
			Q(a, { name: "triangle-alert" });
			var o = R(a, 2), s = I(o, !0);
			k(o), k(i), k(t), z(() => K(s, H(n).wiki.error)), G(e, t);
		}, h = (e) => {
			var t = go(), n = I(t);
			Q(I(n), { name: "book-open" }), A(), k(n);
			var r = R(n);
			Q(I(r), { name: "book-open" }), A(2), k(r), k(t), G(e, t);
		}, g = (e) => {
			{
				let t = /* @__PURE__ */ j(() => H(n).wiki.entries || []);
				Ba(e, {
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
		var t = Mo(), r = L(t), o = I(r), c = I(o), l = I(c, !0);
		k(c);
		var d = R(c, 2), m = (e) => {
			var t = vo(), r = R(L(t)), i = I(r, !0);
			k(r), z(() => K(i, H(n).parent.title)), U("click", r, () => H(n).onNavigate(H(n).parent?.id || "workspace")), G(e, t);
		};
		q(d, (e) => {
			H(n).parent && e(m);
		});
		var h = R(d, 3), x = I(h, !0);
		k(h), k(o);
		var S = R(o, 2), C = I(S), w = I(C, !0), T = R(w), E = I(T, !0);
		k(T), k(C);
		var ee = R(C), te = (e) => {
			var t = bo(), r = I(t), i = (e) => {
				var t = yo();
				Q(I(t), { name: "plus" }), A(), k(t), U("click", t, () => H(n).onCreateTask(H(n).resourceId)), G(e, t);
			};
			q(r, (e) => {
				H(n).resourceType === "project" && e(i);
			});
			var a = R(r);
			Q(I(a), { name: "archive" }), A(), k(a), k(t), U("click", a, () => H(n).onArchive(H(n).resourceId)), G(e, t);
		};
		q(ee, (e) => {
			H(n).detail && e(te);
		}), k(S), k(r);
		var ne = R(r, 2), re = (e) => {
			var t = xo();
			Q(I(t), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), A(), k(t), G(e, t);
		}, ie = (e) => {
			var t = jo(), r = L(t);
			J(r, 21, () => H(f), (e) => e.id, (e, t) => {
				var r = Co();
				let a;
				var o = I(r), s = I(o, !0);
				k(o);
				var c = R(o), l = (e) => {
					var t = So(), r = I(t, !0);
					k(t), z(() => K(r, H(n).detail.logs.length)), G(e, t);
				};
				q(c, (e) => {
					H(t).id === "logs" && H(n).detail.logs?.length && e(l);
				}), k(r), z(() => {
					a = Y(r, 1, "details-tab", null, a, { active: H(i) === H(t).id }), Z(r, "aria-selected", H(i) === H(t).id), K(s, H(t).label);
				}), U("click", r, () => _(H(t).id)), G(e, r);
			}), k(r);
			var o = R(r, 2);
			J(o, 17, () => H(u), (e) => e.path || e.name, (e, t) => {
				var r = wo();
				ao(I(r), {
					get file() {
						return H(t);
					},
					get workspaceId() {
						return H(n).workspaceId;
					}
				}), k(r), z((e) => Z(r, "hidden", e), [() => H(i) !== g(H(t))]), G(e, r);
			});
			var c = R(o, 2), l = I(c), d = (e) => {
				var t = Do(), r = I(t);
				Q(I(r), { name: "layout-template" }), A(), k(r);
				var i = R(r), a = I(i), o = (e) => {
					var t = Or();
					J(L(t), 17, () => H(n).detail.templates, (e) => e.name, (e, t) => {
						var n = To();
						let r;
						var i = I(n);
						Q(i, { name: "file-text" });
						var a = R(i), o = I(a), s = I(o, !0);
						k(o);
						var c = R(o), l = I(c);
						k(c), k(a), Q(R(a), { name: "chevron-right" }), k(n), z(() => {
							r = Y(n, 1, "template-row", null, r, { invalid: !H(t).valid }), K(s, H(t).title || H(t).name), K(l, `${H(t).name ?? ""} · v${(H(t).schemaVersion || "?") ?? ""} · ${H(t).valid ? `${(H(t).fields || []).length} fields` : `invalid${H(t).errors?.[0]?.message ? `: ${H(t).errors[0].message}` : ""}`}${H(t).legacy ? " · legacy" : ""}`);
						}), U("click", n, () => H(t).path && b("Templates", H(t).path)), G(e, n);
					}), G(e, t);
				}, s = (e) => {
					var t = Eo();
					Q(I(t), { name: "layout-template" }), A(), k(t), G(e, t);
				};
				q(a, (e) => {
					H(n).detail.templates?.length ? e(o) : e(s, -1);
				}), k(i), k(t), G(e, t);
			}, m = (e) => {
				var t = Oo(), r = I(t);
				Q(I(r), { name: "layout-template" }), A(), k(r);
				var i = R(r), a = I(i), o = I(a);
				Q(o, { name: "file-text" });
				var s = R(o), c = I(s), l = I(c, !0);
				k(c);
				var u = R(c), d = I(u);
				k(u), k(s), k(a), k(i), k(t), z(() => {
					K(l, H(n).detail.template.name), K(d, `Created from template · v${(H(n).detail.template.schemaVersion || "?") ?? ""} · ${(H(n).detail.template.digest || "") ?? ""}`);
				}), G(e, t);
			};
			q(l, (e) => {
				H(n).resourceType === "project" ? e(d) : H(n).detail.template && e(m, 1);
			}), k(c);
			var h = R(c, 2), x = I(h);
			{
				let e = /* @__PURE__ */ j(() => H(n).detail.logs || []);
				eo(x, {
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
			var S = R(h, 2), C = I(S);
			{
				let e = /* @__PURE__ */ j(() => H(n).detail.artifacts || []);
				Ba(C, {
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
			var w = R(S, 2), T = I(w), E = I(T);
			Q(I(E), { name: "folder-git-2" }), A(), k(E);
			var ee = R(E), te = I(ee), ne = (e) => {
				var t = Or();
				J(L(t), 17, () => H(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = ko(), r = I(n), i = I(r);
					Q(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = R(i), o = I(a), c = I(o, !0);
					k(o);
					var l = R(o), u = I(l);
					k(l);
					var d = R(l), f = I(d, !0);
					k(d), k(a), k(r);
					var p = R(r);
					Q(I(p), { name: "git-compare-arrows" }), A(), k(p), k(n), z(() => {
						K(c, H(t).branch || "HEAD"), K(u, `${(H(t).name || "repository") ?? ""}${H(t).targetBranch || H(t).baseBranch ? ` · base ${H(t).targetBranch || H(t).baseBranch}` : ""}`), K(f, H(t).worktreePath || "");
					}), U("click", p, () => P(s, H(t), !0)), G(e, n);
				}), G(e, t);
			}, re = (e) => {
				var t = Ao();
				Q(I(t), { name: "git-branch" }), A(), k(t), G(e, t);
			};
			q(te, (e) => {
				H(n).detail.repos?.length ? e(ne) : e(re, -1);
			}), k(ee), k(T), k(w), z(() => {
				Z(c, "hidden", H(i) !== "template"), Z(h, "hidden", H(i) !== "logs"), Z(S, "hidden", H(i) !== "artifacts"), Z(w, "hidden", H(i) !== "worktrees");
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
	Ja(ee, {
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
		onClose: () => P(o, null),
		onError: x,
		get onIconsChanged() {
			return H(n).onIconsChanged;
		}
	}), Da(R(ee, 2), {
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
		onClose: () => P(s, null),
		onError: x,
		get onIconsChanged() {
			return H(n).onIconsChanged;
		}
	}), G(e, S), We();
}
br(["click"]);
//#endregion
//#region src/islands/chat-state.ts
var Fo = 250, Io = /* @__PURE__ */ new Set(["session.launch-environment"]), Lo = class {
	api;
	eventSourceFactory;
	contexts = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	onEvent;
	onNotice;
	activeKey = "";
	disposed = !1;
	constructor(e = {}) {
		this.api = e.api ?? new ya(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t) {
		if (this.disposed) return;
		let n = String(t?.id || "").trim(), r = Ho(e, n);
		if (this.activeKey && this.activeKey !== r && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !e || !n) {
			this.emit();
			return;
		}
		let i = this.contexts.get(r) ?? this.createContext(e, n);
		i.run = t, i.acceptedSessionIds = qo(t), this.reconcileNotices(i), !Jo(t) && i.stream && (i.streamGeneration++, i.stream.close(), i.stream = null), this.emit(), !i.loaded && !i.loading ? this.loadInitial(i) : this.connect(i);
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.beforeId) return !1;
		let t = e.generation, n = e.beforeId;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest(Wo(e, `before=${encodeURIComponent(n)}&limit=${Fo}`), { scope: Uo(e, "older") });
			if (!this.isCurrent(e, t)) return !1;
			let i = Vo(r.events), a = Go(i);
			return i.length && (!a || a >= n) ? (e.hasMoreBefore = !1, !1) : (e.events = Ro([...i, ...e.events]), a && (e.beforeId = a), e.hasMoreBefore = !!(r.page?.hasMoreBefore && a), i.length > 0);
		} catch (n) {
			return n instanceof _a || !this.isCurrent(e, t) || (e.error = Qo(n)), !1;
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
			events: e.events.filter((e) => !Io.has(e.type)),
			notices: [...e.notices],
			hasMoreBefore: e.hasMoreBefore,
			loading: e.loading,
			loadingOlder: e.loadingOlder,
			loaded: e.loaded,
			error: e.error
		} : Zo();
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
			key: Ho(e, t),
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
			let n = await this.api.latest(Wo(e, `latest=true&limit=${Fo}`), { scope: Uo(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			let r = Vo(n.events).filter((t) => this.eventBelongsToContext(e, t));
			e.events = Ro(r), e.beforeId = Go(r), e.hasMoreBefore = !!(n.page?.hasMoreBefore && e.beforeId), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof _a || !this.isCurrent(e, t)) return;
			e.error = Qo(n);
		} finally {
			this.isCurrent(e, t) && (e.loading = !1, this.emit());
		}
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !Jo(e.run)) return;
		let t = Ko(e.events), n = t ? `?after=${encodeURIComponent(t)}` : "", r = ++e.streamGeneration, i = this.eventSourceFactory(`/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/stream${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.events = zo(e.events, n), this.onEvent?.(e.workspaceId, e.runId, n), this.emit();
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
			Jo(e.run) || (i.close(), e.stream = null);
		};
	}
	appendNotice(e, t) {
		let n = Yo(t);
		if (n) {
			let r = Number(t.data?.schedulerTurnSequence) || 0, i = e.noticeWatermarks.get(n) || 0;
			if (i && r <= i) return;
			e.noticeWatermarks.set(n, Math.max(i, r)), e.notices = e.notices.filter((e) => Yo(e) !== n);
		} else if (e.notices.some((e) => Xo(e) === Xo(t))) return;
		e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20);
	}
	reconcileNotices(e) {
		let t = e.run;
		e.notices = e.notices.filter((e) => {
			if (!Yo(e)) return !0;
			let n = e.data || {};
			if (!t || String(n.runId || "") !== t.id || String(n.resourceId || "") !== String(t.resourceId || "") || Number(n.selfDrivingRevision) !== Number(t.selfDrivingRevision)) return !1;
			let r = Number(n.schedulerTurnSequence) || 0, i = Number(t.schedulerTurnSequence) || 0;
			return !(i > r || t.schedulerTurn && (!r || i >= r));
		});
	}
	deactivate(e) {
		e && (e.generation++, e.streamGeneration++, e.stream?.close(), e.stream = null, e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(Uo(e, "initial")), this.api.requests.abort(Uo(e, "older")));
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
function Ro(e) {
	let t = [];
	for (let n of e) t = zo(t, n);
	return t;
}
function zo(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return e;
	let r = e.findIndex((e) => Number(e.id) === n), i = [...e];
	if (r < 0) i.push(Bo(t));
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
function Bo(e) {
	return e.data?.append === !0 ? {
		...e,
		data: {
			...e.data,
			append: !1
		}
	} : e;
}
function Vo(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function Ho(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function Uo(e, t) {
	return `chat:${e.key}:${t}`;
}
function Wo(e, t) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/events?${t}`;
}
function Go(e) {
	return e.reduce((e, t) => {
		let n = Number(t.id) || 0;
		return n && (!e || n < e) ? n : e;
	}, 0);
}
function Ko(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function qo(e) {
	return new Set([
		e?.id,
		e?.agentHubSessionId,
		e?.sourceExternalId
	].map((e) => String(e || "").trim()).filter(Boolean));
}
function Jo(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e?.status || ""));
}
function Yo(e) {
	let t = e.data || {};
	return t.kind !== "self-driving-finish" || t.lifecycle !== "until-reconcile" ? "" : [
		t.kind,
		t.runId,
		t.resourceId,
		t.selfDrivingRevision
	].map((e) => String(e ?? "")).join(":");
}
function Xo(e) {
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
function Zo() {
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
function Qo(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/islands/EventTimeline.svelte
var $o = /* @__PURE__ */ W("<button type=\"button\" class=\"load-older-events\"><!><span> </span></button>"), es = /* @__PURE__ */ W("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), ts = /* @__PURE__ */ W("<span class=\"agent-message-tag\">steer</span>"), ns = /* @__PURE__ */ W("<span class=\"agent-message-source\"> </span>"), rs = /* @__PURE__ */ W("<div class=\"agent-message-content markdown-rendered\"></div>"), is = /* @__PURE__ */ W("<p> </p>"), as = /* @__PURE__ */ W("<div><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>"), os = /* @__PURE__ */ W("<details class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>"), ss = /* @__PURE__ */ W("<pre> </pre>"), cs = /* @__PURE__ */ W("<details><summary><!><span> </span><small> </small></summary> <!></details>"), ls = /* @__PURE__ */ W("<details class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>"), us = /* @__PURE__ */ W("<p class=\"approval-question\"> </p>"), ds = /* @__PURE__ */ W("<button> </button>"), fs = /* @__PURE__ */ W("<div class=\"approval-options\"></div>"), ps = /* @__PURE__ */ W("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), ms = /* @__PURE__ */ W("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), hs = /* @__PURE__ */ W("<!> <!>", 1), gs = /* @__PURE__ */ W("<div class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>"), _s = /* @__PURE__ */ W("<div><!><span> </span><span class=\"agent-note-time\"> </span></div>"), vs = /* @__PURE__ */ W("<div class=\"agent-event error\"><div><!><strong>Provider error</strong></div><p> </p></div>"), ys = /* @__PURE__ */ W("<details class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>"), bs = /* @__PURE__ */ W("<div><!></div>"), xs = /* @__PURE__ */ W("<div><div><!><strong>Forge</strong></div><p> </p></div>"), Ss = /* @__PURE__ */ W("<div class=\"agent-event error\" role=\"alert\"><div><!><strong>Timeline error</strong></div><p> </p></div>"), Cs = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>Loading agent events</strong></div>"), ws = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>Waiting for agent events</strong></div>"), Ts = /* @__PURE__ */ W("<!> <!> <!> <!> <!> <!>", 1), Es = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>No agent run selected</strong><span> </span></div>"), Ds = /* @__PURE__ */ W("<div class=\"event-timeline-root\"><!></div>");
function Os(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(F(t.channel.current())), r = /* @__PURE__ */ N(F(ue())), i = /* @__PURE__ */ j(() => H(n).project(H(r).events)), a = /* @__PURE__ */ N(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ N(F(/* @__PURE__ */ new Map())), d = /* @__PURE__ */ N(F(/* @__PURE__ */ new Set())), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ N(F(/* @__PURE__ */ new Map()));
	Si(() => {
		let e = S();
		o = new Lo({
			onEvent: (e, t, r) => H(n).onEvent(e, t, r),
			onNotice: (e, t, r) => H(n).onNotice(e, t, r)
		});
		let r = o.subscribe((e) => m(e)), i = t.channel.subscribe((e) => {
			let t = H(n).identity;
			P(n, e, !0), e.identity !== t && (l = !0, s = null, P(p, new Map(f.get(e.identity) ?? []), !0)), o?.activate(e.workspaceId, e.activeRun), queueMicrotask(e.onIconsChanged);
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
		if (H(r).identity && e.identity === H(r).identity && C()) {
			s = e;
			return;
		}
		h(e);
	}
	function h(e) {
		let t = S();
		c = e.identity !== H(r).identity || l || w(t), l = !1, P(r, e, !0), t && (t.dataset.agentRunId = e.runId), lr().then(() => {
			c && !C() && T(), H(n).onIconsChanged(), e.loaded && e.hasMoreBefore && g(e.identity);
		});
	}
	async function g(e) {
		let t = 0;
		for (; t < 16 && H(r).identity === e && H(r).hasMoreBefore;) {
			let e = S();
			if (!e || e.scrollHeight > e.clientHeight + 160 || C() || !await o?.loadOlder()) return;
			t++, await lr(), T();
		}
	}
	async function _() {
		let e = S();
		if (!e || H(r).loadingOlder) return;
		let t = E(e), i = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = H(r).identity;
		await o?.loadOlder(), await lr(), H(r).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - i) : s + (e.scrollHeight - a), H(n).onIconsChanged());
	}
	async function v(e, t) {
		let i = String(e.approvalId || "");
		if (!(!i || H(d).has(i))) {
			P(d, new Set(H(d)).add(i), !0);
			try {
				await H(n).onApproval(H(r).runId, i, t);
				let e = new Map(H(u));
				e.delete(te(i)), P(u, e, !0);
			} catch (e) {
				H(n).onToast(e instanceof Error ? e.message : String(e));
			} finally {
				let e = new Set(H(d));
				e.delete(i), P(d, e, !0);
			}
		}
	}
	function y(e, t) {
		let n = ee(e);
		P(p, new Map(H(p)).set(n, t), !0), f.set(H(r).identity, new Map(H(p)));
	}
	function b(e, t) {
		let n = H(p).get(ee(e));
		return typeof n == "boolean" ? n : t === H(i).length - 1 || !!e.calls?.some((e) => e.status === "running");
	}
	function x(e, t) {
		P(u, new Map(H(u)).set(te(e), t), !0);
	}
	function S() {
		return H(a)?.parentElement ?? null;
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
	function ee(e) {
		return `${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
	}
	function te(e) {
		return `${H(r).identity}:${e}`;
	}
	function ne(e) {
		return e.role === "assistant" ? H(n).agentName || "Agent" : String(e.sender?.name || e.sender?.id || "").trim() || (e.role === "system" ? "System" : e.role === "agent" ? "Agent" : "User");
	}
	function re(e) {
		let t = new Date(e || "");
		return Number.isNaN(t.valueOf()) ? "" : t.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function ie(e) {
		if (e.active) return "Thinking…";
		if (!e.startTime || !e.time) return "Thought";
		let t = Math.round((new Date(e.time).getTime() - new Date(e.startTime).getTime()) / 1e3);
		return !Number.isFinite(t) || t < 0 ? "Thought" : t < 60 ? `Thought for ${t} ${t === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(t / 60)}m${t % 60}s`;
	}
	function ae(e) {
		let t = String(e || "");
		return !window.marked || !window.DOMPurify ? oe(t).replaceAll("\n", "<br>") : window.DOMPurify.sanitize(window.marked.parse(t));
	}
	function oe(e) {
		return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
	}
	function se(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	function ce(e) {
		return [
			e.error,
			e.output,
			e.rawPreview
		].filter(Boolean).join("\n\n");
	}
	function le(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	function ue() {
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
	var de = Ds(), fe = I(de), pe = (e) => {
		var t = Ts(), n = L(t), a = (e) => {
			var t = $o(), n = I(t);
			{
				let e = /* @__PURE__ */ j(() => H(r).loadingOlder ? "loader-circle" : "chevrons-up");
				Q(n, { get name() {
					return H(e);
				} });
			}
			var i = R(n), a = I(i, !0);
			k(i), k(t), z(() => {
				t.disabled = H(r).loadingOlder, K(a, H(r).loadingOlder ? "Loading..." : "Load older messages");
			}), U("click", t, _), G(e, t);
		};
		q(n, (e) => {
			H(r).hasMoreBefore && e(a);
		});
		var o = R(n, 2);
		J(o, 19, () => H(i), (e) => ee(e), (e, t, n) => {
			var i = bs(), a = I(i), o = (e) => {
				let n = /* @__PURE__ */ j(() => [
					"assistant",
					"system",
					"agent"
				].includes(String(H(t).role)) ? String(H(t).role) : "user");
				var r = as(), i = I(r), a = I(i), o = I(a), s = I(o, !0);
				k(o);
				var c = R(o, 2), l = (e) => {
					var t = es(), r = I(t, !0);
					k(t), z(() => K(r, H(n))), G(e, t);
				};
				q(c, (e) => {
					H(n) !== "assistant" && e(l);
				});
				var u = R(c, 2), d = (e) => {
					G(e, ts());
				};
				q(u, (e) => {
					H(t).steer && e(d);
				});
				var f = R(u, 2), p = (e) => {
					var n = ns(), r = I(n);
					k(n), z(() => {
						Z(n, "title", H(t).sender.sessionId), K(r, `from session ${H(t).sender.sessionId ?? ""}`);
					}), G(e, n);
				};
				q(f, (e) => {
					H(n) === "agent" && H(t).sender?.sessionId && e(p);
				});
				var m = R(f, 2), h = I(m, !0);
				k(m), k(a);
				var g = R(a, 2), _ = I(g), v = (e) => {
					var n = rs();
					Wr(n, () => ae(H(t).text), !0), k(n), G(e, n);
				}, y = (e) => {
					var n = is(), r = I(n, !0);
					k(n), z(() => K(r, H(t).text || "")), G(e, n);
				};
				q(_, (e) => {
					H(n) === "assistant" ? e(v) : e(y, -1);
				}), k(g), k(i), k(r), z((e, t) => {
					Y(r, 1, `agent-message-row ${H(n) === "assistant" ? "assistant final" : H(n)}`), K(s, e), K(h, t);
				}, [() => ne(H(t)), () => re(H(t).time)]), G(e, r);
			}, s = (e) => {
				var n = os(), r = I(n), i = I(r);
				Q(i, { name: "brain-circuit" });
				var a = R(i), o = I(a, !0);
				k(a);
				var s = R(a);
				Q(I(s), { name: "chevron-right" }), k(s), k(r);
				var c = R(r, 2), l = I(c, !0);
				k(c), k(n), z((e) => {
					n.open = H(t).active, K(o, e), K(l, H(t).text || "");
				}, [() => ie(H(t))]), G(e, n);
			}, c = (e) => {
				let i = /* @__PURE__ */ j(() => H(t).calls || []), a = /* @__PURE__ */ j(() => H(i).map(se));
				var o = ls(), s = I(o), c = I(s);
				Q(I(c), { name: "wrench" }), k(c);
				var l = R(c), u = I(l);
				k(l);
				var d = R(l), f = I(d);
				k(d);
				var p = R(d);
				Q(I(p), { name: "chevron-right" }), k(p), k(s);
				var m = R(s, 2);
				J(m, 21, () => H(i), (e) => String(e.callId || e.key), (e, t) => {
					var n = cs(), r = I(n), i = I(r);
					{
						let e = /* @__PURE__ */ j(() => H(t).status === "running" ? "loader-circle" : H(t).status === "failed" ? "x-circle" : "check-circle");
						Q(i, { get name() {
							return H(e);
						} });
					}
					var a = R(i), o = I(a, !0);
					k(a);
					var s = R(a), c = I(s, !0);
					k(s), k(r);
					var l = R(r, 2), u = (e) => {
						var n = ss(), r = I(n, !0);
						k(n), z((e) => K(r, e), [() => ce(H(t))]), G(e, n);
					}, d = /* @__PURE__ */ j(() => ce(H(t)));
					q(l, (e) => {
						H(d) && e(u);
					}), k(n), z((e, t, r) => {
						Y(n, 1, e), K(o, t), K(c, r);
					}, [
						() => `agent-tool-item agent-tool-${String(H(t).status || "completed")}`,
						() => se(H(t)),
						() => String(H(t).method || "tool")
					]), G(e, n);
				}), k(m), k(o), z((e, t, n) => {
					Z(o, "data-tool-group-key", e), o.open = t, K(u, `${H(i).length ?? ""} tool ${H(i).length === 1 ? "call" : "calls"}`), K(f, `${n ?? ""}${H(a).length > 2 ? ` · +${H(a).length - 2} more` : ""}`);
				}, [
					() => `${H(r).runId}:${String(H(t).key || H(t).time || "tools")}`,
					() => b(H(t), H(n)),
					() => H(a).slice(0, 2).join(" · ")
				]), yr("toggle", o, (e) => y(H(t), e.currentTarget.open)), G(e, o);
			}, l = (e) => {
				let n = /* @__PURE__ */ j(() => String(H(t).approvalId || "")), r = /* @__PURE__ */ j(() => H(u).get(te(H(n))) || "");
				var i = gs(), a = I(i), o = I(a);
				Q(o, { name: "shield-question" });
				var s = R(o), c = I(s, !0);
				k(s), k(a);
				var l = R(a, 2), f = (e) => {
					var n = us(), r = I(n, !0);
					k(n), z(() => K(r, H(t).question)), G(e, n);
				};
				q(l, (e) => {
					H(t).question && e(f);
				});
				var p = R(l, 2), m = (e) => {
					var n = is(), r = I(n, !0);
					k(n), z(() => K(r, H(t).detail)), G(e, n);
				};
				q(p, (e) => {
					H(t).detail && e(m);
				});
				var h = R(p, 2), g = (e) => {
					var i = hs(), a = L(i), o = (e) => {
						var r = fs();
						J(r, 21, () => H(t).options, (e) => e.optionId, (e, r) => {
							var i = ds();
							let a;
							var o = I(i, !0);
							k(i), z((e, t, n) => {
								i.disabled = e, a = Y(i, 1, "", null, a, t), K(o, n);
							}, [
								() => H(d).has(H(n)),
								() => ({ "secondary-button": String(H(r).kind || "").startsWith("reject") }),
								() => le(H(r))
							]), U("click", i, () => v(H(t), { optionId: H(r).optionId })), G(e, i);
						}), k(r), G(e, r);
					}, s = (e) => {
						var r = ps(), i = I(r);
						Q(I(i), { name: "check" }), A(), k(i);
						var a = R(i);
						Q(I(a), { name: "x" }), A(), k(a), k(r), z((e, t) => {
							i.disabled = e, a.disabled = t;
						}, [() => H(d).has(H(n)), () => H(d).has(H(n))]), U("click", i, () => v(H(t), { decision: "accept" })), U("click", a, () => v(H(t), { decision: "decline" })), G(e, r);
					};
					q(a, (e) => {
						H(t).options?.length ? e(o) : e(s, -1);
					});
					var c = R(a, 2), l = (e) => {
						var i = ms(), a = I(i);
						X(a);
						var o = R(a);
						k(i), z((e) => {
							li(a, H(r)), o.disabled = e;
						}, [() => !H(r).trim() || H(d).has(H(n))]), yr("submit", i, (e) => {
							e.preventDefault(), H(r).trim() && v(H(t), { text: H(r).trim() });
						}), U("input", a, (e) => x(H(n), e.currentTarget.value)), G(e, i);
					};
					q(c, (e) => {
						H(t).question && e(l);
					}), G(e, i);
				}, _ = (e) => {
					var n = is(), r = I(n);
					k(n), z(() => K(r, `${(H(t).decision || (H(t).status === "accepted" ? "Allowed" : "Declined")) ?? ""}${H(t).reply ? `: ${H(t).reply}` : ""}`)), G(e, n);
				};
				q(h, (e) => {
					H(t).status === "pending" ? e(g) : e(_, -1);
				}), k(i), z(() => K(c, H(t).title || "Approval requested")), G(e, i);
			}, f = (e) => {
				let n = /* @__PURE__ */ j(() => H(t).tone === "ok" ? "check-circle" : H(t).tone === "danger" ? "triangle-alert" : H(t).tone === "info" ? "info" : "clock");
				var r = _s(), i = I(r);
				Q(i, { get name() {
					return H(n);
				} });
				var a = R(i), o = I(a, !0);
				k(a);
				var s = R(a), c = I(s, !0);
				k(s), k(r), z((e) => {
					Y(r, 1, `agent-system-note agent-lifecycle-${H(t).tone || "muted"}`), K(o, H(t).text || ""), K(c, e);
				}, [() => re(H(t).time)]), G(e, r);
			}, p = (e) => {
				var n = vs(), r = I(n);
				Q(I(r), { name: "triangle-alert" }), A(), k(r);
				var i = R(r), a = I(i, !0);
				k(i), k(n), z(() => K(a, H(t).text || "")), G(e, n);
			}, m = (e) => {
				var n = ys(), r = I(n), i = I(r);
				Q(i, { name: "info" });
				var a = R(i), o = I(a);
				k(a), k(r);
				var s = R(r), c = I(s, !0);
				k(s), k(n), z(() => {
					K(o, `Unhandled event: ${(H(t).type || H(t).kind) ?? ""}`), K(c, H(t).preview || "This event carries no payload.");
				}), G(e, n);
			};
			q(a, (e) => {
				H(t).kind === "message" ? e(o) : H(t).kind === "thinking" ? e(s, 1) : H(t).kind === "tools" ? e(c, 2) : H(t).kind === "approval" ? e(l, 3) : H(t).kind === "lifecycle" ? e(f, 4) : H(t).kind === "error" ? e(p, 5) : e(m, -1);
			}), k(i), z((e) => Z(i, "data-timeline-key", e), [() => ee(H(t))]), G(e, i);
		});
		var s = R(o, 2);
		J(s, 19, () => H(r).notices, (e, t) => `notice:${H(r).identity}:${t}:${String(e.data?.schedulerTurnSequence || e.data?.text || "")}`, (e, t, n) => {
			var r = xs(), i = I(r), a = I(i);
			{
				let e = /* @__PURE__ */ j(() => H(t).data?.level === "error" ? "triangle-alert" : "info");
				Q(a, { get name() {
					return H(e);
				} });
			}
			A(), k(i);
			var o = R(i), s = I(o, !0);
			k(o), k(r), z((e) => {
				Z(r, "data-timeline-key", `notice:${H(n)}`), Y(r, 1, `agent-event ${H(t).data?.level === "error" ? "error" : "system"}`), K(s, e);
			}, [() => String(H(t).data?.text || "")]), G(e, r);
		});
		var c = R(s, 2), l = (e) => {
			var t = Ss(), n = I(t);
			Q(I(n), { name: "triangle-alert" }), A(), k(n);
			var i = R(n), a = I(i, !0);
			k(i), k(t), z(() => K(a, H(r).error)), G(e, t);
		};
		q(c, (e) => {
			H(r).error && e(l);
		});
		var f = R(c, 2), p = (e) => {
			var t = Cs();
			Q(I(t), { name: "loader-circle" }), A(), k(t), G(e, t);
		};
		q(f, (e) => {
			H(r).loading && !H(i).length && e(p);
		});
		var m = R(f, 2), h = (e) => {
			var t = ws();
			Q(I(t), { name: "loader-circle" }), A(), k(t), G(e, t);
		};
		q(m, (e) => {
			H(r).loaded && !H(r).loading && !H(i).length && !H(r).notices.length && e(h);
		}), G(e, t);
	}, me = (e) => {
		var t = Es(), r = I(t);
		Q(r, { name: "bot" });
		var i = R(r, 2), a = I(i, !0);
		k(i), k(t), z(() => K(a, H(n).runCount ? "Select an Agent Run to view its events." : "Start an agent session.")), G(e, t);
	};
	q(fe, (e) => {
		H(r).runId ? e(pe) : e(me, -1);
	}), k(de), yi(de, (e) => P(a, e), () => H(a)), z(() => Z(de, "data-chat-context", H(r).identity)), G(e, de), We();
}
br(["click", "input"]);
//#endregion
//#region src/islands/SelfDrivingDialog.svelte
var ks = /* @__PURE__ */ W("<input name=\"agentName\" readonly=\"\" aria-readonly=\"true\"/>"), As = /* @__PURE__ */ W("<option> </option>"), js = /* @__PURE__ */ W("<select name=\"agentName\" required=\"\"><option>Select an Agent</option><!></select>"), Ms = /* @__PURE__ */ W("<p class=\"self-driving-dialog-error\" role=\"alert\"> </p>"), Ns = /* @__PURE__ */ W("<p class=\"self-driving-dialog-error\" role=\"alert\">The result may be unknown. Refresh the task and session state before trying again.</p>"), Ps = /* @__PURE__ */ W("<div class=\"self-driving-dialog-layer\" role=\"presentation\"><button class=\"self-driving-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"self-driving-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"selfDrivingDialogTitle\"><header class=\"self-driving-dialog-header\"><strong id=\"selfDrivingDialogTitle\">Configure Self-Driving</strong> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"selfDrivingConfigForm\" class=\"details-form self-driving-dialog-form\"><label><span>Agent</span> <!></label> <label><span>Run instructions <small>(optional)</small></span> <textarea name=\"runInstructions\" rows=\"4\" placeholder=\"Additional Self-Driving instructions\"></textarea></label> <!> <!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function Fs(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(F(t.channel.current())), r = /* @__PURE__ */ N(F({ ...H(n).draft })), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ N(void 0), s = /* @__PURE__ */ j(() => H(n).submitting || H(n).unknown || !H(n).reuseCurrentSession && (!H(r).agentName || H(n).agents.length === 0));
	Si(() => t.channel.subscribe((e) => {
		P(n, e, !0), e.identity !== H(i) && (P(i, e.identity, !0), P(r, { ...e.draft }, !0), P(a, "")), queueMicrotask(e.onIconsChanged);
	})), Si(() => {
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
				P(a, "Select an Agent before enabling Self-Driving.");
				return;
			}
			P(a, ""), await H(n).onSubmit({ ...H(r) });
		}
	}
	var l = Or(), u = L(l), d = (e) => {
		var t = Ps(), i = I(t), l = R(i, 2), u = I(l), d = R(I(u), 2);
		Q(I(d), { name: "x" }), k(d), k(u);
		var f = R(u, 2), p = I(f), m = R(I(p), 2), h = (e) => {
			var t = ks();
			X(t), mi(t, () => H(r).agentName, (e) => H(r).agentName = e), G(e, t);
		}, g = (e) => {
			var t = js(), i = I(t);
			i.value = i.__value = "", J(R(i), 17, () => H(n).agents, (e) => e.id, (e, t) => {
				var n = As(), r = I(n);
				k(n);
				var i = {};
				z(() => {
					K(r, `${H(t).label ?? ""} — ${H(t).summary ?? ""}`), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
				}), G(e, n);
			}), k(t), z(() => t.disabled = H(n).agents.length === 0 || H(n).submitting), U("input", t, () => P(a, "")), ri(t, () => H(r).agentName, (e) => H(r).agentName = e), G(e, t);
		};
		q(m, (e) => {
			H(n).reuseCurrentSession ? e(h) : e(g, -1);
		}), k(p);
		var _ = R(p, 2), v = R(I(_), 2);
		at(v), k(_);
		var y = R(_, 2), b = (e) => {
			var t = Ms(), r = I(t, !0);
			k(t), z(() => K(r, H(a) || H(n).error)), G(e, t);
		};
		q(y, (e) => {
			(H(a) || H(n).error) && e(b);
		});
		var x = R(y, 2), S = (e) => {
			G(e, Ns());
		};
		q(x, (e) => {
			H(n).unknown && e(S);
		});
		var C = R(x, 2), w = I(C), T = I(w, !0);
		k(w);
		var E = R(w, 2);
		k(C), k(f), k(l), yi(l, (e) => P(o, e), () => H(o)), k(t), z(() => {
			d.disabled = H(n).submitting, v.disabled = H(n).submitting, w.disabled = H(s), Z(w, "aria-busy", H(n).submitting), K(T, H(n).submitting ? "Enabling…" : "Save and Enable"), E.disabled = H(n).submitting;
		}), U("click", i, function(...e) {
			H(n).onClose?.apply(this, e);
		}), U("click", d, function(...e) {
			H(n).onClose?.apply(this, e);
		}), yr("submit", f, c), U("input", v, () => P(a, "")), mi(v, () => H(r).runInstructions, (e) => H(r).runInstructions = e), U("click", E, function(...e) {
			H(n).onClose?.apply(this, e);
		}), G(e, t);
	};
	q(u, (e) => {
		H(n).open && e(d);
	}), G(e, l), We();
}
br(["click", "input"]);
//#endregion
//#region src/islands/SessionSwitcher.svelte
var Is = /* @__PURE__ */ W("<button type=\"button\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span></button>"), Ls = /* @__PURE__ */ W("<div class=\"agent-session-menu\"></div>"), Rs = /* @__PURE__ */ W("<div class=\"agent-current-session\"><button type=\"button\" class=\"agent-current-run active\" title=\"Switch session\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span> <!></button></div> <!>", 1), zs = /* @__PURE__ */ W("<div class=\"session-pill\"><strong>No sessions yet</strong><span>Start an agent session from the selected task.</span></div>"), Bs = /* @__PURE__ */ W("<div class=\"agent-session-error\" role=\"alert\"> </div>"), Vs = /* @__PURE__ */ W("<div id=\"agentSessions\" class=\"agent-session-switcher\"><!> <!></div>");
function Hs(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(F(t.channel.current())), r = /* @__PURE__ */ N(!1), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ j(() => H(n).runs.find((e) => e.id === H(n).activeRunId) ?? H(n).runs[0] ?? null);
	Si(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== H(n).identity;
			P(n, e, !0), t && (P(r, !1), P(i, ""), P(a, "")), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			H(r) && !t?.closest(".agent-session-switcher") && P(r, !1);
		};
		return document.addEventListener("click", o), () => {
			e(), document.removeEventListener("click", o);
		};
	});
	async function s(e) {
		if (!e || H(i) || e === H(n).activeRunId) {
			e === H(n).activeRunId && P(r, !H(r));
			return;
		}
		P(i, e, !0), P(a, ""), P(r, !1);
		try {
			await H(n).onSelect(e);
		} catch (e) {
			P(a, e instanceof Error ? e.message : String(e), !0), H(n).onToast(H(a));
		} finally {
			P(i, "");
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
	var d = Vs(), f = I(d), p = (e) => {
		var t = Rs(), a = L(t), d = I(a), f = I(d), p = I(f), m = I(p, !0);
		k(p);
		var h = R(p, 2), g = I(h), _ = I(g);
		let v;
		var y = R(_, 1, !0);
		k(g);
		var b = R(g, 2), x = I(b, !0);
		k(b), k(h), k(f);
		var S = R(f, 2);
		{
			let e = /* @__PURE__ */ j(() => H(i) ? "loader-circle" : "chevrons-up-down");
			Q(S, {
				get name() {
					return H(e);
				},
				className: "session-select-icon"
			});
		}
		k(d), k(a);
		var C = R(a, 2), w = (e) => {
			var t = Ls();
			J(t, 21, () => H(n).runs, (e) => e.id, (e, t) => {
				var r = Is();
				let a;
				var o = I(r), d = I(o), f = I(d, !0);
				k(d);
				var p = R(d, 2), m = I(p), h = I(m);
				let g;
				var _ = R(h, 1, !0);
				k(m);
				var v = R(m, 2), y = I(v, !0);
				k(v), k(p), k(o), k(r), z((e, i, o, s, c, l) => {
					a = Y(r, 1, "agent-session-menu-row", null, a, { active: H(n).activeRunId === H(t).id }), Z(r, "data-agent-run", H(t).id), r.disabled = e, K(f, i), Y(m, 1, o), g = Y(h, 1, "run-badge-dot", null, g, s), K(_, c), K(y, l);
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
			Z(d, "data-agent-run", H(o).id), Z(d, "aria-expanded", H(r)), K(m, e), Y(g, 1, t), v = Y(_, 1, "run-badge-dot", null, v, n), K(y, i), K(x, a);
		}, [
			() => u(H(o)),
			() => `run-badge run-badge-${c(H(o).status)}`,
			() => ({ "run-badge-pulse": ["running", "attention"].includes(c(H(o).status)) }),
			() => (H(o).status || "unknown").replaceAll("_", " "),
			() => l(H(o).updatedAt)
		]), U("click", d, (e) => {
			e.stopPropagation(), P(r, !H(r));
		}), G(e, t);
	}, m = (e) => {
		G(e, zs());
	};
	q(f, (e) => {
		H(o) ? e(p) : e(m, -1);
	});
	var h = R(f, 2), g = (e) => {
		var t = Bs(), n = I(t, !0);
		k(t), z(() => K(n, H(a))), G(e, t);
	};
	q(h, (e) => {
		H(a) && e(g);
	}), k(d), z(() => Z(d, "data-session-context", H(n).identity)), G(e, d), We();
}
br(["click"]);
//#endregion
//#region src/islands/SettingsModal.svelte
var Us = /* @__PURE__ */ W("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), Ws = /* @__PURE__ */ W("<button type=\"button\"><!><span> </span><!></button>"), Gs = /* @__PURE__ */ W("<span class=\"settings-pill\">Active</span>"), Ks = /* @__PURE__ */ W("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), qs = /* @__PURE__ */ W("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Js = /* @__PURE__ */ W("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span><span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/><span> </span><!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), Ys = /* @__PURE__ */ W("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Xs = /* @__PURE__ */ W("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Workspaces</h2><p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/><span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>"), Zs = /* @__PURE__ */ W("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span><input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/><small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>"), Qs = /* @__PURE__ */ W("<span class=\"settings-pill\"> </span>"), $s = /* @__PURE__ */ W("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), ec = /* @__PURE__ */ W("<div class=\"settings-empty\">No AgentHub agents available.</div>"), tc = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>"), nc = /* @__PURE__ */ W("<option> </option>"), rc = /* @__PURE__ */ W("<span class=\"settings-profile-system-label\">System</span>"), ic = /* @__PURE__ */ W("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), ac = /* @__PURE__ */ W("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), oc = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map chat and Self-Driving preferences to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>"), sc = /* @__PURE__ */ W("<small class=\"settings-notification-help\"> </small>"), cc = /* @__PURE__ */ W("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span><input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span><input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>"), lc = /* @__PURE__ */ W("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><aside class=\"settings-tabs\"><div class=\"settings-title\">System Settings</div> <!></aside> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function uc(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(F(t.channel.current())), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(-1), a = /* @__PURE__ */ N(F(l(H(n)))), o = /* @__PURE__ */ N(""), s = /* @__PURE__ */ N(""), c = /* @__PURE__ */ new Set([
		"default",
		"fast",
		"reasoning",
		"scheduler"
	]);
	Si(() => t.channel.subscribe((e) => {
		P(n, e, !0), e.identity === H(r) ? e.dataVersion !== H(i) && !H(a).dirty && (P(i, e.dataVersion, !0), P(a, l(e), !0)) : (P(r, e.identity, !0), P(i, e.dataVersion, !0), P(a, l(e), !0), P(o, ""), P(s, "")), queueMicrotask(e.onIconsChanged);
	})), Si(() => {
		let e = (e) => {
			H(n).open && e.key === "Escape" && (e.preventDefault(), H(n).onClose(H(a).dirty));
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
			...H(a),
			profiles: H(a).profiles.map((e) => ({ ...e })),
			newProfile: { ...H(a).newProfile }
		};
	}
	function d() {
		H(a).dirty = !0;
	}
	async function f(e) {
		if (e.preventDefault(), !(!H(a).workspacePath.trim() || H(o))) {
			P(o, "workspace");
			try {
				await H(n).onAddWorkspace(u()), H(a).workspacePath = "", H(a).createWorkspace = !1;
			} catch (e) {
				H(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	async function p(e) {
		if (!H(o)) {
			P(o, `remove:${e}`);
			try {
				await H(n).onRemoveWorkspace(e, u());
			} catch (e) {
				H(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	async function m(e, t) {
		if (!H(o)) {
			P(o, `icon:${e}`), P(s, "");
			try {
				await H(n).onWorkspaceIcon(e, t, u());
			} catch (e) {
				H(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	async function h(e) {
		if (e.preventDefault(), !H(o)) {
			P(o, "user");
			try {
				H(a).userName = await H(n).onSaveUser(H(a).userName);
			} catch (e) {
				H(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	function g(e, t, n) {
		H(a).profiles[e][t] = n, d();
	}
	function _() {
		let e = H(a).newProfile.key.trim().toLowerCase();
		if (!e) return H(n).onToast("Profile key is required.");
		if (c.has(e)) return H(n).onToast(`${e} is a reserved system profile.`);
		if (H(a).profiles.some((t) => t.key.trim().toLowerCase() === e)) return H(n).onToast(`Profile ${e} already exists.`);
		H(a).profiles = [...H(a).profiles, {
			key: e,
			description: H(a).newProfile.description.trim(),
			agentName: H(a).newProfile.agentName
		}], H(a).newProfile = {
			key: "",
			description: "",
			agentName: H(n).agents[0]?.id || ""
		}, d();
	}
	function v(e) {
		let t = H(a).profiles[e];
		if (!t || c.has(t.key.trim().toLowerCase())) return H(n).onToast("System profiles cannot be deleted.");
		H(a).profiles = H(a).profiles.filter((t, n) => e !== n), d();
	}
	async function y() {
		if (!(!H(a).dirty || H(o))) {
			P(o, "agenthub");
			try {
				await H(n).onSaveAgentHub(u()), H(a).dirty = !1;
			} catch (e) {
				H(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	function b(e) {
		let t = H(n).workspaces.find((t) => t.id === e);
		return H(n).workspaceIcons.find((e) => e.id === (t?.icon || "")) || H(n).workspaceIcons[0];
	}
	function x(e) {
		let t = H(n).agents.map((e) => ({
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
	var C = Or(), w = L(C), T = (e) => {
		var t = lc(), r = L(t), i = R(r, 2), l = I(i);
		J(R(I(l), 2), 16, () => [
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
		], Fr, (e, t) => {
			var n = Ws();
			let r;
			var i = I(n);
			Q(i, { get name() {
				return t[1];
			} });
			var o = R(i), s = I(o, !0);
			k(o);
			var c = R(o), l = (e) => {
				G(e, Us());
			};
			q(c, (e) => {
				(t[0] === "agenthub" || t[0] === "profiles") && e(l);
			}), k(n), z(() => {
				r = Y(n, 1, "settings-tab", null, r, {
					active: H(a).tab === t[0],
					dirty: H(a).dirty && (t[0] === "agenthub" || t[0] === "profiles")
				}), K(s, t[2]);
			}), U("click", n, () => H(a).tab = t[0]), G(e, n);
		}), k(l);
		var u = R(l, 2), S = I(u);
		Q(I(S), { name: "x" }), k(S);
		var C = R(S, 2), w = (e) => {
			var t = Xs(), r = R(I(t), 2), i = I(r);
			X(i);
			var c = R(i, 2), l = I(c);
			X(l), A(), k(c);
			var u = R(c, 2), d = I(u);
			Q(d, { name: "plus" });
			var h = R(d), g = I(h, !0);
			k(h), k(u), k(r);
			var _ = R(r, 2);
			J(_, 21, () => H(n).workspaces, (e) => e.id, (e, t) => {
				let r = /* @__PURE__ */ j(() => b(H(t).id));
				var i = Js(), a = I(i), c = I(a), l = I(c), u = I(l);
				k(l);
				var d = R(l), f = I(d), h = I(f, !0);
				k(f);
				var g = R(f), _ = I(g, !0);
				k(g), k(d), k(c);
				var v = R(c, 2), y = I(v), x = (e) => {
					G(e, Gs());
				};
				q(y, (e) => {
					H(t).id === H(n).activeWorkspaceId && e(x);
				});
				var S = R(y, 2), C = I(S), w = R(C), T = I(w, !0);
				k(w), Q(R(w), { name: "chevron-down" }), k(S);
				var E = R(S, 2);
				Q(I(E), { name: "trash-2" }), k(E), k(v), k(a);
				var ee = R(a, 2), te = (e) => {
					var i = qs();
					J(i, 21, () => H(n).workspaceIcons, (e) => e.id, (e, n) => {
						var i = Ks();
						let a;
						var o = I(i), s = R(o), c = I(s, !0);
						k(s);
						var l = R(s), u = (e) => {
							Q(e, { name: "check" });
						};
						q(l, (e) => {
							H(n).id === H(r).id && e(u);
						}), k(i), z(() => {
							Z(i, "aria-checked", H(n).id === H(r).id), Z(i, "title", H(n).label), a = Y(i, 1, "", null, a, { selected: H(n).id === H(r).id }), Z(o, "src", H(n).src), K(c, H(n).label);
						}), U("click", i, () => m(H(t).id, H(n).id)), G(e, i);
					}), k(i), z(() => Z(i, "aria-label", `Icon for ${H(t).name}`)), G(e, i);
				};
				q(ee, (e) => {
					H(s) === H(t).id && e(te);
				}), k(i), z((e, n) => {
					Z(u, "src", H(r).src), K(h, H(t).name), K(_, H(t).path), Z(S, "aria-expanded", H(s) === H(t).id), S.disabled = e, Z(C, "src", H(r).src), K(T, H(o) === `icon:${H(t).id}` ? "Saving..." : H(r).label), E.disabled = n;
				}, [() => !!H(o), () => !!H(o)]), U("click", S, () => P(s, H(s) === H(t).id ? "" : H(t).id, !0)), U("click", E, () => p(H(t).id)), G(e, i);
			}, (e) => {
				G(e, Ys());
			}), k(_), k(t), z((e) => {
				u.disabled = e, K(g, H(a).createWorkspace ? "Create" : "Add");
			}, [() => !!H(o)]), yr("submit", r, f), mi(i, () => H(a).workspacePath, (e) => H(a).workspacePath = e), hi(l, () => H(a).createWorkspace, (e) => H(a).createWorkspace = e), G(e, t);
		}, T = (e) => {
			var t = Zs(), n = R(I(t), 2), r = I(n), i = R(I(r));
			X(i), A(), k(r);
			var s = R(r, 2), c = I(s);
			Q(I(c), { name: "save" }), A(), k(c), k(s), k(n), k(t), z(() => c.disabled = H(o) === "user"), yr("submit", n, h), mi(i, () => H(a).userName, (e) => H(a).userName = e), G(e, t);
		}, E = (e) => {
			var t = tc(), r = R(I(t), 2), i = I(r), s = R(I(i)), c = I(s, !0);
			k(s), k(i);
			var l = R(i, 2), u = R(I(l));
			X(u), k(l);
			var f = R(l, 2), p = I(f, !0);
			k(f);
			var m = R(f, 2);
			J(m, 21, () => H(n).agentHub.capabilities, Fr, (e, t) => {
				var n = Qs(), r = I(n, !0);
				k(n), z(() => K(r, H(t))), G(e, n);
			}), k(m), k(r);
			var h = R(r, 2), g = I(h), _ = R(I(g)), v = I(_);
			k(_), k(g);
			var b = R(g, 2);
			J(b, 21, () => H(n).agentHub.agents, (e) => e.name, (e, t) => {
				var n = $s(), r = I(n), i = I(r), a = I(i, !0);
				k(i);
				var o = R(i), s = I(o), c = I(s, !0);
				k(s);
				var l = R(s), u = I(l);
				k(l), k(o), k(r), k(n), z((e) => {
					K(a, e), K(c, H(t).name), K(u, `${(H(t).providerId || "") ?? ""} · ${(H(t).available === !1 ? H(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
				}, [() => (H(t).name || "A").slice(0, 1).toUpperCase()]), G(e, n);
			}, (e) => {
				G(e, ec());
			}), k(b), k(h);
			var x = R(h, 2), S = I(x);
			let C;
			var w = I(S, !0);
			k(S);
			var T = R(S);
			Q(I(T), { name: "save" }), A(), k(T), k(x), k(t), z((e) => {
				K(c, H(n).agentHub.connected && H(n).agentHub.compatible ? "Compatible" : H(n).agentHub.connected ? "Incompatible" : "Unavailable"), K(p, H(n).agentHub.error || `API ${H(n).agentHub.apiVersion || "unknown"} · AgentHub ${H(n).agentHub.version || "unknown"}`), K(v, `${H(n).agentHub.agents.length ?? ""} agents · ${H(n).agentHub.providers.length ?? ""} providers`), C = Y(S, 1, "settings-save-hint", null, C, { visible: H(a).dirty }), K(w, H(a).dirty ? "Unsaved changes" : ""), T.disabled = e;
			}, [() => !H(a).dirty || !!H(o)]), U("input", u, d), mi(u, () => H(a).endpoint, (e) => H(a).endpoint = e), U("click", T, y), G(e, t);
		}, ee = (e) => {
			var t = oc(), r = R(I(t), 2), i = I(r), s = R(I(i)), l = I(s);
			k(s), k(i);
			var u = R(i, 2), d = R(I(u), 2);
			J(d, 17, () => H(a).profiles, Fr, (e, t, n) => {
				let r = /* @__PURE__ */ j(() => c.has(H(t).key.trim().toLowerCase()));
				var i = ac();
				let a;
				var o = I(i);
				X(o);
				var s = R(o, 2);
				X(s);
				var l = R(s, 2);
				J(l, 21, () => x(H(t).agentName), Fr, (e, t) => {
					var n = nc(), r = I(n, !0);
					k(n);
					var i = {};
					z(() => {
						K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
					}), G(e, n);
				}), k(l);
				var u;
				ni(l);
				var d = R(l, 2), f = (e) => {
					G(e, rc());
				}, p = (e) => {
					var t = ic();
					Q(I(t), { name: "trash-2" }), k(t), U("click", t, () => v(n)), G(e, t);
				};
				q(d, (e) => {
					H(r) ? e(f) : e(p, -1);
				}), k(i), z(() => {
					a = Y(i, 1, "settings-profile-row", null, a, { "settings-profile-system": H(r) }), li(o, H(t).key), o.disabled = H(r), li(s, H(t).description), s.disabled = H(r), u !== (u = H(t).agentName) && (l.value = (l.__value = H(t).agentName) ?? "", ti(l, H(t).agentName));
				}), U("input", o, (e) => g(n, "key", e.currentTarget.value)), U("input", s, (e) => g(n, "description", e.currentTarget.value)), U("change", l, (e) => g(n, "agentName", e.currentTarget.value)), G(e, i);
			});
			var f = R(d, 2), p = I(f);
			X(p);
			var m = R(p, 2);
			X(m);
			var h = R(m, 2);
			J(h, 21, () => H(n).agents, Fr, (e, t) => {
				var n = nc(), r = I(n, !0);
				k(n);
				var i = {};
				z(() => {
					K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
				}), G(e, n);
			}), k(h);
			var b = R(h, 2);
			Q(I(b), { name: "plus" }), A(), k(b), k(f), k(u), k(r);
			var S = R(r, 2), C = I(S);
			let w;
			var T = I(C, !0);
			k(C);
			var E = R(C);
			Q(I(E), { name: "save" }), A(), k(E), k(S), k(t), z((e) => {
				K(l, `${H(a).profiles.length ?? ""} routes`), h.disabled = !H(n).agents.length, b.disabled = !H(n).agents.length, w = Y(C, 1, "settings-save-hint", null, w, { visible: H(a).dirty }), K(T, H(a).dirty ? "Unsaved changes" : ""), E.disabled = e;
			}, [() => !H(a).dirty || !!H(o)]), mi(p, () => H(a).newProfile.key, (e) => H(a).newProfile.key = e), mi(m, () => H(a).newProfile.description, (e) => H(a).newProfile.description = e), ri(h, () => H(a).newProfile.agentName, (e) => H(a).newProfile.agentName = e), U("click", b, _), U("click", E, y), G(e, t);
		}, te = (e) => {
			var t = cc(), r = R(I(t), 2), i = I(r), a = R(I(i));
			X(a), k(i);
			var o = R(i, 2), s = (e) => {
				var t = sc(), r = I(t, !0);
				k(t), z(() => K(r, H(n).notifications.permissionError)), G(e, t);
			};
			q(o, (e) => {
				H(n).notifications.permissionError && e(s);
			}), k(r);
			var c = R(r, 2), l = I(c), u = R(I(l));
			X(u), k(l);
			var d = R(l, 2), f = I(d, !0);
			k(d), k(c), k(t), z(() => {
				ui(a, H(n).notifications.browser), ui(u, H(n).notifications.sound), K(f, H(n).notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
			}), U("change", a, (e) => H(n).onBrowserNotifications(e.currentTarget.checked)), U("change", u, (e) => H(n).onCompletionSound(e.currentTarget.checked)), G(e, t);
		};
		q(C, (e) => {
			H(a).tab === "workspace" ? e(w) : H(a).tab === "user" ? e(T, 1) : H(a).tab === "agenthub" ? e(E, 2) : H(a).tab === "profiles" ? e(ee, 3) : e(te, -1);
		}), k(u), k(i), U("click", r, () => H(n).onClose(H(a).dirty)), U("click", S, () => H(n).onClose(H(a).dirty)), G(e, t);
	};
	q(w, (e) => {
		H(n).open && e(T);
	}), G(e, C), We();
}
br([
	"click",
	"input",
	"change"
]);
//#endregion
//#region src/islands/UploadDialog.svelte
var dc = /* @__PURE__ */ W("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), fc = /* @__PURE__ */ W("<small class=\"upload-result-path\"> </small>"), pc = /* @__PURE__ */ W("<small class=\"upload-error\"> </small>"), mc = /* @__PURE__ */ W("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), hc = /* @__PURE__ */ W("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this session's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function gc(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(F(t.channel.current())), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(F([])), a = 1, o = /* @__PURE__ */ N(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ j(() => H(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ j(() => H(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ j(() => H(i).filter((e) => e.status === "error").length);
	Si(() => {
		let e = t.channel.subscribe((e) => {
			P(n, e, !0), e.identity !== H(r) && (d(), P(r, e.identity, !0), P(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
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
		P(i, [...H(i), ...r], !0);
		for (let e of r) g(e, H(n).identity, H(n).workspaceId, H(n).runId);
	}
	function h(e, t) {
		P(i, H(i).map((n) => n.id === e ? {
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
		var t = hc(), n = I(t), r = R(n, 2), a = I(r), s = R(I(a), 2);
		Q(I(s), { name: "x" }), k(s), k(a);
		var d = R(a, 2), f = I(d);
		yi(f, (e) => P(o, e), () => H(o));
		var p = R(f, 2), h = I(p);
		Q(h, { name: "clipboard-paste" });
		var g = R(h, 4);
		Q(I(g), { name: "folder-open" }), A(), k(g), k(p);
		var b = R(p, 2), x = I(b), S = (e) => {
			G(e, dc());
		};
		q(x, (e) => {
			H(i).length || e(S);
		}), J(R(x, 2), 17, () => H(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ j(() => y(H(t)));
			var r = mc();
			let i;
			var a = I(r), o = I(a);
			Q(o, { get name() {
				return H(n).icon;
			} });
			var s = R(o), c = I(s), l = I(c, !0);
			k(c);
			var u = R(c), d = I(u, !0);
			k(u), k(s);
			var f = R(s), p = I(f, !0);
			k(f), k(a);
			var m = R(a, 2), h = I(m);
			let g;
			k(m);
			var _ = R(m, 2), b = (e) => {
				var n = fc(), r = I(n, !0);
				k(n), z(() => K(r, H(t).path)), G(e, n);
			};
			q(_, (e) => {
				H(t).status === "success" && e(b);
			});
			var x = R(_, 2), S = (e) => {
				var n = pc(), r = I(n, !0);
				k(n), z(() => K(r, H(t).error || "Upload failed")), G(e, n);
			};
			q(x, (e) => {
				H(t).status === "error" && e(S);
			}), k(r), z((e) => {
				i = Y(r, 1, "upload-item", null, i, {
					"upload-item-success": H(t).status === "success",
					"upload-item-error": H(t).status === "error",
					"upload-item-uploading": H(t).status === "uploading"
				}), K(l, H(t).name), K(d, e), K(p, H(n).label), Z(m, "aria-label", H(t).name), Z(m, "aria-valuenow", H(t).progress), g = ei(h, "", g, { width: `${H(t).progress}%` });
			}, [() => v(H(t).size)]), G(e, r);
		}), k(b), k(d);
		var C = R(d, 2), w = I(C), T = I(w, !0);
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
	}), G(e, b), We();
}
br([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/islands/channel.ts
function _c(e) {
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
var vc = /* @__PURE__ */ new Map();
async function yc(e, t, n) {
	await bc(e), t.replaceChildren(), vc.set(e, n(t));
}
async function bc(e) {
	let t = vc.get(e);
	t && (vc.delete(e), await t());
}
async function xc() {
	let e = [...vc.keys()];
	await Promise.all(e.map((e) => bc(e)));
}
//#endregion
//#region src/entry.ts
var Sc = "brand-version", $ = () => void 0, Cc = async () => void 0, wc = [{
	id: "",
	label: "Forge default",
	src: "/favicon.svg"
}], Tc = _c({
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
	onPreview: Cc,
	onSubmit: Cc,
	previewRequestKey: () => "",
	onConfirmTemplateSwitch: () => !0,
	onIconsChanged: $
}), Ec = _c({
	open: !1,
	identity: "",
	dataVersion: 0,
	initialTab: "workspace",
	workspaces: [],
	activeWorkspaceId: "",
	workspaceIcons: wc,
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
	onAddWorkspace: Cc,
	onRemoveWorkspace: Cc,
	onWorkspaceIcon: Cc,
	onSaveUser: async (e) => e,
	onSaveAgentHub: Cc,
	onBrowserNotifications: $,
	onCompletionSound: $,
	onToast: $,
	onIconsChanged: $
}), Dc = _c({
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
	onSubmit: Cc,
	onIconsChanged: $
}), Oc = _c({
	open: !1,
	identity: "",
	workspaceId: "",
	runId: "",
	onDone: $,
	onIconsChanged: $
}), kc = _c({
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
}), Ac = _c({
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
	onLoadMoreLogs: Cc,
	onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
	onToast: $,
	onIconsChanged: $
}), jc = _c({
	identity: "",
	workspaceId: "",
	resourceId: "",
	activeRunId: "",
	runs: [],
	switchingRunId: "",
	onSelect: Cc,
	onToast: $,
	onIconsChanged: $
}), Mc = _c({
	identity: "",
	workspaceId: "",
	activeRunId: "",
	activeRun: null,
	runCount: 0,
	agentName: "Agent",
	project: () => [],
	onEvent: $,
	onNotice: $,
	onApproval: Cc,
	onToast: $,
	onIconsChanged: $
});
async function Nc() {
	let e = document.getElementById("brandVersionIsland");
	if (!e) return;
	let t = e.dataset.version || "v0.1.0";
	try {
		await yc(Sc, e, (e) => {
			let n = kr(Ti, {
				target: e,
				props: { version: t }
			});
			return () => Nr(n);
		});
	} catch (n) {
		throw e.textContent = t, n;
	}
}
async function Pc(e, t, n, r) {
	let i = document.getElementById(t);
	i && await yc(e, i, (t) => {
		t.dataset.svelteOwned = e;
		let i = kr(n, {
			target: t,
			props: r
		});
		return async () => {
			delete t.dataset.svelteOwned, await Nr(i);
		};
	});
}
async function Fc() {
	await Promise.all([
		Pc("create-dialog", "createDialogRoot", ha, { channel: Tc }),
		Pc("settings", "settingsRoot", uc, { channel: Ec }),
		Pc("self-driving-dialog", "selfDrivingDialogRoot", Fs, { channel: Dc }),
		Pc("upload-dialog", "uploadDialogRoot", gc, { channel: Oc }),
		Pc("chat-composer", "ttyComposer", Bi, { channel: kc }),
		Pc("session-switcher", "agentSessionsWrap", Hs, { channel: jc }),
		Pc("event-timeline", "ttyLog", Os, { channel: Mc }),
		Pc("detail-panel", "detailsPanel", Po, { channel: Ac })
	]);
}
var Ic = {
	mountBrandVersion: Nc,
	renderCreateDialog: (e) => Tc.publish(e),
	renderSettings: (e) => Ec.publish(e),
	renderSelfDrivingDialog: (e) => Dc.publish(e),
	renderUploadDialog: (e) => Oc.publish(e),
	renderComposer: (e) => kc.publish(e),
	renderSessionSwitcher: (e) => jc.publish(e),
	renderEventTimeline: (e) => Mc.publish(e),
	renderDetailPanel: (e) => Ac.publish(e),
	unmount: bc,
	unmountAll: xc
}, Lc = window.ForgeSvelteIslands;
window.ForgeSvelteIslands = Ic, window.ForgeSveltePageLifecycleInstalled || (window.ForgeSveltePageLifecycleInstalled = !0, window.addEventListener("pagehide", () => {
	window.ForgeSvelteIslands?.unmountAll();
}), window.addEventListener("pageshow", (e) => {
	e.persisted && Promise.all([window.ForgeSvelteIslands?.mountBrandVersion(), Fc()]);
})), (async () => {
	await Lc?.unmountAll(), await Promise.all([Nc(), Fc()]), window.ForgeLegacySvelteReady?.();
})().catch((e) => console.error("Failed to mount the Forge Svelte island", e));
//#endregion
