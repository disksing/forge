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
	return Pe(/* @__PURE__ */ dn(O));
}
function k(e) {
	if (D) {
		if (/* @__PURE__ */ dn(O) !== null) throw Ae(), we;
		O = e;
	}
}
function A(e = 1) {
	if (D) {
		for (var t = e, n = O; t--;) n = /* @__PURE__ */ dn(n);
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
		var i = /* @__PURE__ */ dn(n);
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
		r: z,
		l: null
	};
}
function We(e) {
	var t = Ve, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Cn(r);
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
	var t = z;
	if (t === null) return R.f |= te, e;
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
	D && /* @__PURE__ */ un(e) !== null && pn(e);
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
	var t = R, n = z;
	Kn(null), qn(null);
	try {
		return e();
	} finally {
		Kn(t), qn(n);
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
		bn() && (B(n), Dn(() => (t === 0 && (r = mr(() => e(() => Qt(n)))), t += 1, () => {
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
			var t = z;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = z.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = On(() => {
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
			this.#a = kn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Je(r), t && (this.#s = kn(() => {
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
			t = !0, n && Ce(), this.#s !== null && In(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = kn(() => e(this.#e)), Je(() => {
			var e = this.#c = document.createDocumentFragment(), t = ln();
			e.append(t), this.#a = this.#S(() => kn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, In(this.#o, () => {
				this.#o = null;
			}), this.#x(M));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = kn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Bn(this.#a, e);
				let t = this.#n.pending;
				this.#o = kn(() => t(this.#e));
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
		var t = z, n = R, r = Ve;
		qn(this.#i), Kn(this.#i), He(this.#i.ctx);
		try {
			return Lt.ensure(), e();
		} catch (e) {
			return Xe(e), null;
		} finally {
			qn(t), Kn(n), He(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && In(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Je(() => {
			this.#d = !1, this.#m && Xt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), B(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		M?.is_fork ? (this.#a && M.skip_effect(this.#a), this.#o && M.skip_effect(this.#o), this.#s && M.skip_effect(this.#s), M.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Nn(this.#a), null), this.#o &&= (Nn(this.#o), null), this.#s &&= (Nn(this.#s), null), D && (Pe(this.#t), A(), Pe(Ie()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return kn(() => {
						var r = z;
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
	var s = z, c = ht(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
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
	var e = z, t = R, n = Ve, r = M;
	return function(i = !0) {
		qn(e), Kn(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function gt(e = !0) {
	qn(null), Kn(null), He(null), e && M?.deactivate();
}
function _t() {
	var e = z, t = e.b, n = M, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function vt(e) {
	var t = 2 | h;
	return z !== null && (z.f |= S), {
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
		parent: z,
		ac: null
	};
}
var yt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function bt(e, t, n) {
	let r = z;
	r === null && pe();
	var i = void 0, a = Jt(Te), o = !R, s = /* @__PURE__ */ new Set();
	return En(() => {
		var t = z, n = p();
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
	}), xn(() => {
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
	return Yn(t), t;
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
		for (var n = 0; n < t.length; n += 1) Nn(t[n]);
	}
}
function Ct(e) {
	var t, n = z, r = e.parent;
	if (!Un && r !== null && e.v !== Te && r.f & 24576) return ke(), e.v;
	qn(r);
	try {
		e.f &= ~T, St(e), t = sr(e);
	} finally {
		qn(n);
	}
	return t;
}
function wt(e) {
	var t = Ct(e);
	if (!e.equals(t) && (e.wv = ir(), (!M?.is_fork || e.deps === null) && (M === null ? e.v = t : (M.capture(e, t, !0), Ot?.capture(e, t, !0)), e.deps === null))) {
		$e(e, m);
		return;
	}
	Un || (kt === null ? et(e) : (bn() || M?.is_fork) && kt.set(e, t));
}
function Tt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ct(() => {
		t.ac.abort(ue), t.ac = null;
	}), t.fn !== null && (t.teardown = d), lr(t, 0), jn(t));
}
function Et(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && ur(t);
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
				a ? r.f ^= m : i & 4 ? t.push(r) : ar(r) && (i & 16 && this.#d.add(r), ur(r));
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
			if (Nt !== null && t === z && (R === null || !(R.f & 2))) return;
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
			if (!(r.f & 24576) && ar(r) && (Bt = /* @__PURE__ */ new Set(), ur(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Fn(r), Bt?.size > 0)) {
				Kt.clear();
				for (let e of Bt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Bt.has(n) && (Bt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || ur(n);
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
	return Yn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Yt(e, t = !1, n = !0) {
	let r = Jt(e);
	return t || (r.equals = Be), r;
}
function P(e, t, n = !1) {
	return R !== null && (!Gn || R.f & 131072) && Ge() && R.f & 4325394 && (Jn === null || !Jn.has(e)) && Se(), Xt(e, n ? en(t) : t, Pt);
}
function Xt(e, t, n = null) {
	if (!e.equals(t)) {
		Kt.set(e, Un ? t : e.v);
		var r = Lt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ct(t), kt === null && et(t);
		}
		e.wv = ir(), $t(e, h, n), Ge() && z !== null && z.f & 1024 && !(z.f & 96) && (Qn === null ? $n([e]) : Qn.push(e)), !r.is_fork && Gt.size > 0 && !qt && Zt();
	}
	return t;
}
function Zt() {
	qt = !1;
	for (let e of Gt) {
		e.f & 1024 && $e(e, g);
		let t;
		try {
			t = ar(e);
		} catch {
			t = !0;
		}
		t && ur(e);
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
		if (!(!i && s === z)) {
			var l = (c & h) === 0;
			if (l && $e(s, t), c & 131072) Gt.add(s);
			else if (c & 2) {
				var u = s;
				kt?.delete(u), c & 65536 || (c & 512 && (z === null || !(z.f & 2097152)) && (s.f |= T), $t(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Bt !== null && Bt.add(d), n === null ? Ht(d) : n.push(d);
			}
		}
	}
}
function en(t) {
	if (typeof t != "object" || !t || ne in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ N(0), u = null, d = nr, f = (e) => {
		if (nr === d) return e();
		var t = R, n = nr;
		Kn(null), rr(d);
		var r = e();
		return Kn(t), rr(n), r;
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
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ N(en(s ? e[n] : Te), u)), r.set(n, o)), o !== void 0) {
				var c = B(o);
				return c === Te ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = B(i));
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
			return (n !== void 0 || z !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ N(i ? en(e[t]) : Te, u)), r.set(t, n)), B(n) === Te) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ N(Te, u)), r.set(d + "", p)) : P(p, Te);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ N(void 0, u)), P(c, en(n)), r.set(t, c));
			else {
				l = c.v !== Te;
				var m = f(() => en(n));
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
			B(o);
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
function tn(e) {
	try {
		if (typeof e == "object" && e && ne in e) return e[ne];
	} catch {}
	return e;
}
function nn(e, t) {
	return Object.is(tn(e), tn(t));
}
var rn, an, on, sn;
function cn() {
	if (rn === void 0) {
		rn = window, an = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		on = a(t, "firstChild").get, sn = a(t, "nextSibling").get, u(e) && (e[oe] = void 0, e[ae] = null, e[se] = void 0, e.__e = void 0), u(n) && (n[ce] = void 0);
	}
}
function ln(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function un(e) {
	return on.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function dn(e) {
	return sn.call(e);
}
function F(e, t) {
	if (!D) return /* @__PURE__ */ un(e);
	var n = /* @__PURE__ */ un(O);
	if (n === null) n = O.appendChild(ln());
	else if (t && n.nodeType !== 3) {
		var r = ln();
		return n?.before(r), Pe(r), r;
	}
	return t && gn(n), Pe(n), n;
}
function fn(e, t = !1) {
	if (!D) {
		var n = /* @__PURE__ */ un(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ dn(n) : n;
	}
	if (t) {
		if (O?.nodeType !== 3) {
			var r = ln();
			return O?.before(r), Pe(r), r;
		}
		gn(O);
	}
	return O;
}
function I(e, t = 1, n = !1) {
	let r = D ? O : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ dn(r);
	if (!D) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = ln();
			return r === null ? i?.after(a) : r.before(a), Pe(a), a;
		}
		gn(r);
	}
	return Pe(r), r;
}
function pn(e) {
	e.textContent = "";
}
function mn() {
	return !1;
}
function hn(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function gn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function _n(e) {
	z === null && (R === null && _e(e), ge()), Un && he(e);
}
function vn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function yn(e, t) {
	var n = z;
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
			ur(r);
		} catch (e) {
			throw Nn(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && vn(i, n), R !== null && R.f & 2 && !(e & 64))) {
		var a = R;
		(a.effects ??= []).push(i);
	}
	return r;
}
function bn() {
	return R !== null && !Gn;
}
function xn(e) {
	let t = yn(8, null);
	return $e(t, m), t.teardown = e, t;
}
function Sn(e) {
	_n("$effect");
	var t = z.f;
	if (!R && t & 32 && Ve !== null && !Ve.i) {
		var n = Ve;
		(n.e ??= []).push(e);
	} else return Cn(e);
}
function Cn(e) {
	return yn(4 | C, e);
}
function wn(e) {
	Lt.ensure();
	let t = yn(64 | S, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? In(t, () => {
			Nn(t), n(void 0);
		}) : (Nn(t), n(void 0));
	});
}
function Tn(e) {
	return yn(4, e);
}
function En(e) {
	return yn(ee | S, e);
}
function Dn(e, t = 0) {
	return yn(8 | t, e);
}
function L(e, t = [], n = [], r = []) {
	mt(r, t, n, (t) => {
		yn(8, () => {
			e(...t.map(B));
		});
	});
}
function On(e, t = 0) {
	return yn(16 | t, e);
}
function kn(e) {
	return yn(32 | S, e);
}
function An(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Un, n = R;
		Wn(!0), Kn(null);
		try {
			t.call(null);
		} finally {
			Wn(e), Kn(n);
		}
	}
}
function jn(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && ct(() => {
			e.abort(ue);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : Nn(n, t), n = r;
	}
}
function Mn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || Nn(t), t = n;
	}
}
function Nn(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Pn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, jn(e, t && !n), lr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	An(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && Fn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Pn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ dn(e);
		e.remove(), e = n;
	}
}
function Fn(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function In(e, t, n = !0) {
	var r = [];
	Ln(e, r, !0);
	var i = () => {
		n && Nn(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Ln(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= _;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Ln(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Rn(e) {
	zn(e, !0);
}
function zn(e, t) {
	if (e.f & 8192) {
		e.f ^= _, e.f & 1024 || ($e(e, h), Lt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			zn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Bn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ dn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Vn = null, Hn = !1, Un = !1;
function Wn(e) {
	Un = e;
}
var R = null, Gn = !1;
function Kn(e) {
	R = e;
}
var z = null;
function qn(e) {
	z = e;
}
var Jn = null;
function Yn(e) {
	R !== null && (Jn ??= /* @__PURE__ */ new Set()).add(e);
}
var Xn = null, Zn = 0, Qn = null;
function $n(e) {
	Qn = e;
}
var er = 1, tr = 0, nr = tr;
function rr(e) {
	nr = e;
}
function ir() {
	return ++er;
}
function ar(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (ar(a) && wt(a), a.wv > e.wv) return !0;
		}
		t & 512 && kt === null && $e(e, m);
	}
	return !1;
}
function or(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Jn !== null && Jn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? or(a, t, !1) : t === a && (n ? $e(a, h) : a.f & 1024 && $e(a, g), Ht(a));
	}
}
function sr(e) {
	var t = Xn, n = Zn, r = Qn, i = R, a = Jn, o = Ve, s = Gn, c = nr, l = e.f;
	Xn = null, Zn = 0, Qn = null, R = l & 96 ? null : e, Jn = null, He(e.ctx), Gn = !1, nr = ++tr, e.ac !== null && (ct(() => {
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = M?.is_fork;
		if (Xn !== null) {
			var m;
			if (p || lr(e, Zn), f !== null && Zn > 0) for (f.length = Zn + Xn.length, m = 0; m < Xn.length; m++) f[Zn + m] = Xn[m];
			else e.deps = f = Xn;
			if (bn() && e.f & 512) for (m = Zn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Zn < f.length && (lr(e, Zn), f.length = Zn);
		if (Ge() && Qn !== null && !Gn && f !== null && !(e.f & 6146)) for (m = 0; m < Qn.length; m++) or(Qn[m], e);
		if (i !== null && i !== e) {
			if (tr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = tr;
			if (t !== null) for (let e of t) e.rv = tr;
			Qn !== null && (r === null ? r = Qn : r.push(...Qn));
		}
		return e.f & 8388608 && (e.f ^= te), d;
	} catch (e) {
		return Xe(e);
	} finally {
		e.f ^= E, Xn = t, Zn = n, Qn = r, R = i, Jn = a, He(o), Gn = s, nr = c;
	}
}
function cr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Xn === null || !n.call(Xn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== Te && et(s), s.ac !== null && ct(() => {
			s.ac.abort(ue), s.ac = null, $e(s, h);
		}), Tt(s), lr(s, 0);
	}
}
function lr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) cr(e, n[r]);
}
function ur(e) {
	var t = e.f;
	if (!(t & 16384)) {
		$e(e, m);
		var n = z, r = Hn;
		z = e, Hn = !(t & 96);
		try {
			t & 16777232 ? Mn(e) : jn(e), An(e);
			var i = sr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = er;
		} finally {
			Hn = r, z = n;
		}
	}
}
async function dr() {
	await Promise.resolve(), Rt();
}
function B(e) {
	var t = !!(e.f & 2);
	if (Vn?.add(e), R !== null && !Gn && !(z !== null && z.f & 16384) && (Jn === null || !Jn.has(e))) {
		var r = R.deps;
		if (R.f & 2097152) e.rv < tr && (e.rv = tr, Xn === null && r !== null && r[Zn] === e ? Zn++ : Xn === null ? Xn = [e] : Xn.push(e));
		else {
			R.deps ??= [], n.call(R.deps, e) || R.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [R] : n.call(i, R) || i.push(R);
		}
	}
	if (Un && Kt.has(e)) return Kt.get(e);
	if (t) {
		var a = e;
		if (Un) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || pr(a)) && (o = Ct(a)), Kt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Gn && R !== null && (Hn || !!(R.f & 512)), c = (a.f & y) === 0;
		ar(a) && (s && (a.f |= 512), wt(a)), s && !c && (Et(a), fr(a));
	}
	if (kt?.has(e)) return kt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function fr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Et(t), fr(t));
}
function pr(e) {
	if (e.v === Te) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Kt.has(t) || t.f & 2 && pr(t)) return !0;
	return !1;
}
function mr(e) {
	var t = Gn;
	try {
		return Gn = !0, e();
	} finally {
		Gn = t;
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
		if (r.capture || wr.call(t, e), !e.cancelBubble) return ct(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Je(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function xr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = br(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && xn(() => {
		t.removeEventListener(e, o, a);
	});
}
function V(e, t, n) {
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
		var d = R, f = z;
		Kn(null), qn(null);
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
			e[_r] = t, delete e.currentTarget, Kn(d), qn(f);
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
	var t = hn("template");
	return t.innerHTML = Er(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Or(e, t) {
	var n = z;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function H(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		if (D) return Or(O, null), O;
		i === void 0 && (i = Dr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ un(i)));
		var t = r || an ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ un(t), s = t.lastChild;
			Or(o, s);
		} else Or(t, t);
		return t;
	};
}
function kr(e = "") {
	if (!D) {
		var t = ln(e + "");
		return Or(t, t), t;
	}
	var n = O;
	return n.nodeType === 3 ? gn(n) : (n.before(n = ln()), Pe(n)), Or(n, n), n;
}
function Ar() {
	if (D) return Or(O, null), O;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = ln();
	return e.append(t, n), Or(t, n), e;
}
function U(e, t) {
	if (D) {
		var n = z;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = O), Fe();
		return;
	}
	e !== null && e.before(t);
}
function W(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ce] ??= e.nodeValue) && (e[ce] = n, e.nodeValue = `${n}`);
}
function jr(e, t) {
	return Nr(e, t);
}
var Mr = /* @__PURE__ */ new Map();
function Nr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	cn();
	var l = void 0, u = wn(() => {
		var s = n ?? t.appendChild(ln());
		ft(s, { pending: () => {} }, (t) => {
			Ue({});
			var n = Ve;
			if (o && (n.c = o), a && (i.$$events = a), D && Or(t, null), l = e(t, i) || {}, D && (z.nodes.end = O, O === null || O.nodeType !== 8 || O.data !== "]")) throw Ae(), we;
			We();
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
			if (n) Rn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Rn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (Nn(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Bn(r, t), t.append(ln()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else Nn(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), In(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (Nn(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = M, r = mn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = ln();
				i.append(a), this.#n.set(e, {
					effect: kn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, kn(() => t(this.anchor)));
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
function G(e, t, n = !1) {
	var r;
	D && (r = O, Fe());
	var i = new Ir(e), a = n ? x : 0;
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
	On(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function Lr(e, t) {
	return t;
}
function Rr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		In(n, () => {
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
			pn(d), d.append(u), e.items.clear();
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
		r?.has(a) ? (a.f |= w, Bn(a, document.createDocumentFragment())) : Nn(t[i], n);
	}
}
var Br;
function K(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = D ? Pe(/* @__PURE__ */ un(u)) : u.appendChild(ln());
	}
	D && Fe();
	var d = null, f = /* @__PURE__ */ xt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Hr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Wr(d, null, c)) : Rn(d) : In(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: On(() => {
			p = B(f);
			var e = p.length;
			let t = !1;
			D && Le(c) === "[!" != (e === 0) && (c = Ie(), Pe(c), Ne(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = M, v = mn(), y = 0; y < e; y += 1) {
				D && O.nodeType === 8 && O.data === "]" && (c = O, t = !0, Ne(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Xt(S.v, b), S.i && Xt(S.i, y), v && u.unskip_effect(S.e)) : (S = Ur(l, h ? c : Br ??= ln(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = kn(() => s(c)) : (d = kn(() => s(Br ??= ln())), d.f |= w)), e > r.size && me("", "", ""), D && e > 0 && Pe(Ie()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Ne(!0), B(f);
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
		if (_.f & 8192 && (Rn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
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
	o && Je(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ur(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Jt(n) : /* @__PURE__ */ Yt(n, !1, !1) : null, l = o & 2 ? Jt(i) : null;
	return {
		v: c,
		i: l,
		e: kn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Wr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ dn(r);
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
		D && (o = Pe(/* @__PURE__ */ un(c)));
	}
	L(() => {
		var e = z;
		if (s === (s = t() ?? "")) {
			D && Fe();
			return;
		}
		if (n && !D) {
			e.nodes = null, c.innerHTML = s, s !== "" && Or(/* @__PURE__ */ un(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Pn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (D) {
				for (var a = O.data, l = Fe(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ dn(l);
				if (l === null) throw Ae(), we;
				Or(O, u), o = Pe(l);
				return;
			}
			var d = hn(r ? "svg" : i ? "math" : "template", r ? De : i ? Oe : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Or(/* @__PURE__ */ un(f), f.lastChild), r || i) for (; /* @__PURE__ */ un(f);) o.before(/* @__PURE__ */ un(f));
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
function q(e, t, n, r, i, a) {
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
	for (i of t.options) if (nn(oi(i), n)) {
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
	}), xn(() => {
		t.disconnect();
	});
}
function ai(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	lt(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), oi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && oi(o);
		}
		n(a), e.__value = a, M !== null && r.add(M);
	}), Tn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = M;
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
					J(e, "value", null), e.value = n;
				}
				if (e.hasAttribute("checked")) {
					var r = e.checked;
					J(e, "checked", null), e.checked = r;
				}
			}
		};
		e[le] = n, Je(n), st();
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
function J(e, t, n, r) {
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
	lt(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = yi(e) ? bi(a) : a, n(a), M !== null && r.add(M), await dr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (D && e.defaultValue !== e.value || mr(t) == null && e.value) && (n(yi(e) ? bi(e.value) : e.value), M !== null && r.add(M)), Dn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = M;
			if (r.has(i)) return;
		}
		yi(e) && n === bi(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function vi(e, t, n = t) {
	lt(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (D && e.defaultChecked !== e.checked || mr(t) == null) && n(e.checked), Dn(() => {
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
	var i = Ve.r, a = z;
	return Tn(() => {
		var o, s;
		return Dn(() => {
			o = s, s = r?.() || [], mr(() => {
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
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ vt(r), B(u)) : (l && (l = !1, c = s ? mr(r) : r), c);
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
	o && B(y);
	var b = z;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? B(y) : i && o ? en(e) : e;
			return P(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Un && v || b.f & 16384 ? y.v : B(y);
	});
}
function wi(e) {
	Ve === null && fe("onMount"), Sn(() => {
		let t = mr(e);
		if (typeof t == "function") return t;
	});
}
function Ti(e) {
	Ve === null && fe("onDestroy"), wi(() => () => mr(e));
}
//#endregion
//#region src/runtime/resource-scope.ts
var Ei = class {
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
}, Di, Oi = null, Y = {
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
	routeProjection: {
		path: "",
		revision: 0,
		replace: !0
	},
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
	paneSizes: {
		sidebarWidth: 280,
		chatWidth: 420,
		sidebarSessionHeight: 210
	},
	settings: {
		open: !1,
		identity: 0,
		dataVersion: 0,
		tab: "workspace",
		data: null,
		agentDirty: !1,
		expandedAgents: /* @__PURE__ */ new Set(),
		suppressDraftSync: !1,
		workspacePath: "",
		createWorkspace: !1,
		saving: !1,
		workspaceIconPickerId: "",
		workspaceIconSavingId: "",
		newProfile: {
			key: "",
			description: "",
			agentName: ""
		}
	},
	user: { name: "User" },
	notifications: {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: "tab-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2),
		audioContext: null,
		soundError: "",
		permissionError: ""
	},
	createDialog: {
		open: !1,
		identity: 0,
		type: "",
		projectId: "",
		templateName: "",
		templateFields: {},
		templateDirty: !1,
		titleOverride: !1,
		templateDigest: "",
		preview: null,
		previewing: !1,
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
	},
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
	mobile: {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	},
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
		selfDrivingSaving: !1,
		selfDrivingDisabling: !1,
		newSessionStarting: !1,
		sessionActionsOpen: !1,
		eventsHasMore: !1,
		historyBeforeId: 0,
		loadingOlder: !1,
		sendingInputRunIds: /* @__PURE__ */ new Set(),
		turnStopping: !1,
		turnStoppingRunId: "",
		sessionStopping: !1,
		sessionStoppingRunId: "",
		switchingRunId: "",
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
}, ki = (e) => document.getElementById(e), Ai = 5e3, ji = 10, Mi = 20, Ni = 6e4, Pi = "forge.gui.paneSizes", Fi = "forge.gui.mobileImmersive", Ii = "This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.", Li = "self-driving-finish", Ri = "until-reconcile", zi = /* @__PURE__ */ new Set([
	"waiting",
	"blocked",
	"error"
]), Bi = "forge.gui.agentDraft.v1", Vi = 1, Hi = "forge.gui.notifications.v1", Ui = `${Hi}.settings`, Wi = 1, Gi = "forge.gui.user.v1", Ki = 1, qi = 80, Ji = 50, Yi = 7776e6, Xi = /* @__PURE__ */ new Set(["session.launch-environment"]), Zi = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering"
]), Qi = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, $i = [
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
], ea = new Map($i.map((e) => [e.id, e])), ta = 0, na = 0, ra = 0, ia = 0, aa = 0, oa = null, sa = "";
function ca() {
	return Hl().map((e) => ({
		id: e.id || "",
		label: Pc(e),
		summary: Ec(e)
	}));
}
function la() {
	rs(), Us(), xl(), Vc(), $c(), jc(), xc(), kc(), Uc();
}
function ua() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function da(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, qi).join("") || "User";
}
function fa(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
function pa(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Ki ? "User" : da(t.name);
	} catch {
		return "User";
	}
}
function ma() {
	try {
		return pa(window.localStorage.getItem(Gi));
	} catch {
		return "User";
	}
}
function ha() {
	return da(Y.user?.name);
}
function ga(e) {
	let t = da(e);
	try {
		window.localStorage.setItem(Gi, JSON.stringify({
			version: Ki,
			name: t
		}));
	} catch {
		return !1;
	}
	return Y.user.name = t, !0;
}
function _a() {
	Oi?.listen(window, "storage", (e) => {
		e.key === Gi && (Y.user.name = pa(e.newValue), Y.settings.open && Y.settings.tab === "user" && Uc());
	});
}
function va(e = Y.notifications.workspaceId) {
	let t = String(e || "").trim();
	return t ? `${Hi}.state.${encodeURIComponent(t)}` : "";
}
function ya() {
	return {
		version: Wi,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function ba(e) {
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
function xa(e) {
	if (!e || e.version !== Wi) return ya();
	let t = Array.isArray(e.seen) ? e.seen.map((e) => ({
		marker: String(e?.marker || "").trim(),
		at: Number(e?.at) || Date.now()
	})).filter((e) => e.marker) : [], n = Array.isArray(e.pending) ? e.pending.map(ba).filter(Boolean) : [], r = Array.isArray(e.unread) ? e.unread.map(ba).filter(Boolean) : [], i = Array.isArray(e.effects) ? e.effects.map((e) => ({
		key: String(e?.key || "").trim(),
		at: Number(e?.at) || Date.now()
	})).filter((e) => e.key) : [];
	return {
		version: Wi,
		seen: t.slice(-2e3),
		pending: n.slice(-200),
		unread: r.slice(-200),
		effects: i.slice(-2e3)
	};
}
function Sa(e = Y.notifications.workspaceId) {
	let t = ua(), n = va(e);
	if (!t || !n) return ya();
	try {
		let e = t.getItem(n);
		if (!e) return ya();
		let r = JSON.parse(e);
		return !r || r.version !== Wi ? (t.removeItem(n), ya()) : xa(r);
	} catch {
		try {
			t.removeItem(n);
		} catch {}
		return ya();
	}
}
function Ca() {
	let e = ua(), t = va();
	if (!(!e || !t || !Y.notifications.store)) {
		Y.notifications.store = xa(Y.notifications.store);
		try {
			e.setItem(t, JSON.stringify(Y.notifications.store));
		} catch {}
	}
}
function wa() {
	let e = {
		browser: !1,
		sound: !1
	}, t = ua();
	if (!t) return e;
	try {
		let n = JSON.parse(t.getItem(Ui) || "null");
		return !n || n.version !== Wi ? e : {
			browser: !!n.browser,
			sound: !!n.sound
		};
	} catch {
		try {
			t.removeItem(Ui);
		} catch {}
		return e;
	}
}
function Ta() {
	let e = ua();
	if (!(!e || !Y.notifications.settings)) try {
		e.setItem(Ui, JSON.stringify({
			version: Wi,
			browser: !!Y.notifications.settings.browser,
			sound: !!Y.notifications.settings.sound
		}));
	} catch {}
}
function Ea() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return [
		"granted",
		"default",
		"denied"
	].includes(e) ? e : "default";
}
function Da(e) {
	let t = String(e || "").trim();
	t && (ka(), Y.notifications.workspaceId = t, Y.notifications.store = Sa(t), Y.notifications.settings = wa(), Ea() !== "granted" && (Y.notifications.settings.browser = !1, Ta()), Y.notifications.ready = !1, Y.notifications.permissionError = "", Oa(t));
}
function Oa(e) {
	let t = window.BroadcastChannel || globalThis.BroadcastChannel;
	if (typeof t == "function") try {
		let n = new t(`${Hi}.${encodeURIComponent(e)}`);
		n.onmessage = (e) => ja(e.data), Y.notifications.channel = n;
	} catch {
		Y.notifications.channel = null;
	}
}
function ka() {
	try {
		Y.notifications.channel?.close();
	} catch {}
	Y.notifications.channel = null;
}
function Aa(e) {
	try {
		Y.notifications.channel?.postMessage({
			...e,
			workspaceId: Y.notifications.workspaceId,
			sourceTabId: Y.notifications.tabId
		});
	} catch {}
}
function ja(e) {
	if (!e || e.workspaceId !== Y.notifications.workspaceId || e.sourceTabId === Y.notifications.tabId) return;
	let t = Y.notifications.store || ya();
	if (e.type === "effect" && e.effectKey) {
		t.effects.some((t) => t.key === e.effectKey) || (t.effects.push({
			key: e.effectKey,
			at: Number(e.at) || Date.now()
		}), Y.notifications.store = t, Ca());
		return;
	}
	if (e.type === "record" && e.record) {
		let n = ba(e.record);
		if (!n) return;
		if (t.seen.some((e) => e.marker === n.marker) || t.seen.push({
			marker: n.marker,
			at: n.at
		}), za(n)) {
			t.unread = t.unread.filter((e) => e.marker !== n.marker), t.pending = t.pending.filter((e) => e.marker !== n.marker), Y.notifications.store = t, Ca(), Aa({
				type: "clear-resource",
				resourceId: n.resourceId
			}), Y.tree && Ps();
			return;
		}
		t.unread.some((e) => e.marker === n.marker) || t.unread.push(n), Y.notifications.store = t, Ca(), Y.tree && (Ps(), Z());
		return;
	}
	if (e.type === "clear-marker" && e.marker) {
		t.unread = t.unread.filter((t) => t.marker !== e.marker), t.pending = t.pending.filter((t) => t.marker !== e.marker), Y.notifications.store = t, Ca(), Y.tree && Ps();
		return;
	}
	if (e.type === "clear-resource" && e.resourceId) {
		let n = String(e.resourceId);
		t.unread = t.unread.filter((e) => e.resourceId !== n), t.pending = t.pending.filter((e) => e.resourceId !== n), Y.notifications.store = t, Ca(), Y.tree && Ps();
	}
}
function Ma() {
	return Y.notifications.store || (Y.notifications.store = ya()), Y.notifications.store;
}
function Na(e) {
	let t = String(e?.completionMarker || e?.agentRunCompletionMarker || "").trim();
	if (t) return t;
	let n = String(e?.agentHubSessionId || e?.completionSessionId || "").trim(), r = Number(e?.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function Pa(e) {
	return String(e?.forgeSessionId || e?.sessionId || e?.agentHubSessionId || e?.id || "").trim();
}
function Fa(e) {
	return e?.source === "internal" || e?.source === "external" ? Rs(e).primaryResourceId || "" : e?.resourceId ? String(e.resourceId).trim() : Array.isArray(e?.controls) && e.controls.length === 1 ? String(e.controls[0]?.resourceId || "").trim() : "";
}
function Ia(e) {
	switch (e?.type) {
		case "turn.failed": return "failed";
		case "turn.cancelled": return "cancelled";
		case "turn.completed": return "completed";
		default: return "";
	}
}
function La(e, t) {
	let n = Number(e?.selfDrivingRevision) || 0;
	if (!(e?.schedulerTurn || n > 0)) return {
		isSelfDriving: !1,
		state: "",
		final: !1,
		suppressed: !1
	};
	let r = Al(t)?.selfDriving, i = String(r?.condition || "disabled").trim().toLowerCase(), a = !r?.enabled && r?.lastOutcome?.status === "completed", o = !!r?.enabled && [
		"blocked",
		"error",
		"needs_configuration"
	].includes(i), s = !r?.enabled && !a, c = a || o;
	return {
		isSelfDriving: !0,
		state: i,
		final: c,
		suppressed: !c,
		disabledControl: s
	};
}
function Ra(e, t, n = "") {
	let r = Fa(e), i = Al(r), a = La(e, r);
	return ba({
		workspaceId: Y.notifications.workspaceId,
		sessionId: Pa(e),
		runId: String(e?.runId || e?.agentRunId || e?.id || "").trim(),
		resourceId: r,
		marker: t,
		completionState: n || e?.completionState || "completed",
		selfDriving: a.isSelfDriving,
		selfDrivingState: a.state,
		title: i?.title || e?.title || e?.agentRunTitle || e?.id || "Session",
		resourceType: i?.type || "",
		resourceTitle: i?.title || "",
		at: Date.now()
	});
}
function za(e) {
	return !e?.resourceId || Y.selectedId !== e.resourceId ? !1 : Ba();
}
function Ba() {
	let e = document.visibilityState ? document.visibilityState === "visible" : !document.hidden, t = typeof document.hasFocus != "function" || document.hasFocus();
	return e && !document.hidden && t;
}
function Va(e, t) {
	return `${e.marker}:${t}`;
}
function Ha() {
	let e = Sa(), t = Ma(), n = /* @__PURE__ */ new Map();
	for (let r of [...e.effects, ...t.effects]) r?.key && n.set(r.key, r);
	t.effects = [...n.values()].slice(-2e3), Y.notifications.store = t;
}
function Ua(e, t) {
	let n = Va(e, t), r = Ma();
	return !r.effects.some((e) => e.key === n) && (r.effects.push({
		key: n,
		at: Date.now()
	}), Y.notifications.store = r, Ca(), Aa({
		type: "effect",
		effectKey: n,
		at: Date.now()
	}), !0);
}
function Wa(e, t, n) {
	let r = typeof navigator < "u" ? navigator.locks : null, i = () => {
		Ha(), Ua(e, t) && n();
	};
	if (!r || typeof r.request != "function") {
		i();
		return;
	}
	try {
		Promise.resolve(r.request(`forge.gui.notification.${Y.notifications.workspaceId}.${Va(e, t)}`, { ifAvailable: !0 }, (e) => {
			e && i();
		})).catch((e) => {
			console.warn("notification effect lock unavailable", e), i();
		});
	} catch (e) {
		console.warn("notification effect lock unavailable", e), i();
	}
}
function Ga(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.sessionId}`;
}
function Ka(e) {
	return e.selfDriving ? `Self-Driving ${e.selfDrivingState || "finished"}.` : e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function qa() {
	if (!Y.notifications.settings?.sound) return;
	let e = window.AudioContext || window.webkitAudioContext;
	if (typeof e != "function") {
		Y.notifications.soundError = "Audio is unavailable in this browser.", Y.settings.open && Y.settings.tab === "notifications" && Uc();
		return;
	}
	try {
		let t = Y.notifications.audioContext || new e();
		Y.notifications.audioContext = t;
		let n = () => {
			let e = t.createOscillator(), n = t.createGain();
			e.type = "sine", e.frequency.setValueAtTime(880, t.currentTime), e.frequency.exponentialRampToValueAtTime(660, t.currentTime + .12), n.gain.setValueAtTime(1e-4, t.currentTime), n.gain.exponentialRampToValueAtTime(.08, t.currentTime + .01), n.gain.exponentialRampToValueAtTime(1e-4, t.currentTime + .16), e.connect(n), n.connect(t.destination), e.start(), e.stop(t.currentTime + .18);
		};
		t.state === "suspended" ? t.resume().then(n).catch((e) => {
			Y.notifications.soundError = "Chrome blocked completion sound until audio is enabled by the page.", console.warn("completion sound unavailable", e), Y.settings.open && Y.settings.tab === "notifications" && Uc();
		}) : n();
	} catch (e) {
		Y.notifications.soundError = "Completion sound is unavailable right now.", console.warn("completion sound unavailable", e), Y.settings.open && Y.settings.tab === "notifications" && Uc();
	}
}
function Ja(e, t = !1) {
	if (!(!Y.notifications.settings?.browser || Ea() !== "granted") && !(!t && !Ua(e, "browser"))) try {
		let t = new window.Notification(Ga(e), {
			body: Ka(e),
			tag: `forge-${e.marker}`,
			icon: "/favicon.svg"
		});
		t.onclick = () => {
			try {
				window.focus();
			} catch {}
			co(e).catch((e) => console.warn("notification navigation failed", e));
		};
	} catch (e) {
		console.warn("browser notification unavailable", e);
	}
}
function Ya(e) {
	Y.notifications.settings?.browser && Ea() === "granted" && Wa(e, "browser", () => Ja(e, !0)), Y.notifications.settings?.sound && Wa(e, "sound", qa);
}
function Xa(e, t = "") {
	let n = Na(e), r = Pa(e);
	if (!n || !r || !Y.notifications.workspaceId) return !1;
	let i = Ra(e, n, t);
	if (!i?.sessionId) return !1;
	let a = Ma(), o = a.seen.some((e) => e.marker === n), s = a.pending.findIndex((e) => e.marker === n), c = La(e, i.resourceId);
	return Y.notifications.ready ? o && s < 0 ? !1 : c.isSelfDriving && c.state === "waiting" ? (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), a.pending = a.pending.filter((e) => e.marker !== n), Y.notifications.store = a, Ca(), !1) : c.isSelfDriving && c.disabledControl ? (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), a.pending = a.pending.filter((e) => e.marker !== n), a.unread = a.unread.filter((e) => e.marker !== n), Y.notifications.store = a, Ca(), !1) : c.isSelfDriving && c.suppressed && !c.final ? (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), s < 0 && a.pending.push(i), Y.notifications.store = a, Ca(), !1) : (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), a.pending = a.pending.filter((e) => e.marker !== n), za(i) ? (Y.notifications.store = a, Ca(), !1) : (a.unread = a.unread.filter((e) => e.marker !== n), a.unread.push(i), Y.notifications.store = a, Ca(), Aa({
		type: "record",
		record: i
	}), Ya(i), Y.tree && (Ps(), Z()), !0)) : (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), a.pending = a.pending.filter((e) => e.marker !== n), Y.notifications.store = a, Ca(), !1);
}
function Za(e) {
	for (let t of e || []) Na(t) && Xa(t, t.completionState || t.agentRunCompletionState || "");
}
function Qa(e, t) {
	let n = Ia(e);
	if (!n || !e?.sessionId || !Number(e.id)) return;
	let r = `${e.sessionId}:${e.id}`;
	Xa({
		...t || {},
		completionMarker: r,
		completionState: n,
		agentHubSessionId: t?.agentHubSessionId || e.sessionId
	}, n);
}
function $a() {
	Y.notifications.ready || (Za(Y.tree?.sessions || []), Za(Y.agent.runs || []), Y.notifications.ready = !0, Ca());
}
function eo(e) {
	let t = String(e || "").trim();
	return !!(t && Ma().unread.some((e) => e.sessionId === t));
}
function to(e) {
	let t = String(e || "").trim();
	if (!t) return;
	let n = Ma();
	(n.unread.some((e) => e.marker === t) || n.pending.some((e) => e.marker === t)) && (n.unread = n.unread.filter((e) => e.marker !== t), n.pending = n.pending.filter((e) => e.marker !== t), Y.notifications.store = n, Ca(), Aa({
		type: "clear-marker",
		marker: t
	}), Y.tree && Ps());
}
function no(e) {
	let t = String(e || "").trim();
	if (!t) return;
	let n = Ma();
	(n.unread.some((e) => e.resourceId === t) || n.pending.some((e) => e.resourceId === t)) && (n.unread = n.unread.filter((e) => e.resourceId !== t), n.pending = n.pending.filter((e) => e.resourceId !== t), Y.notifications.store = n, Ca(), Aa({
		type: "clear-resource",
		resourceId: t
	}), Y.tree && Ps());
}
function ro() {
	Ta(), Y.settings.open && Y.settings.tab === "notifications" && Uc();
}
async function io() {
	let e = Ea();
	if (e === "unsupported") return Y.notifications.settings.browser = !1, Y.notifications.permissionError = "Browser notifications are not supported here.", ro(), e;
	if (e === "denied") return Y.notifications.settings.browser = !1, Y.notifications.permissionError = "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically.", ro(), e;
	let t = e;
	if (e === "default") try {
		t = await window.Notification.requestPermission();
	} catch (e) {
		Y.notifications.permissionError = "Chrome could not request notification permission.", console.warn("notification permission request failed", e);
	}
	return t === "granted" ? (Y.notifications.settings.browser = !0, Y.notifications.permissionError = "") : (Y.notifications.settings.browser = !1, Y.notifications.permissionError = t === "denied" ? "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically." : "Notification permission is still pending."), ro(), t;
}
function ao(e) {
	if (Y.notifications.settings = Y.notifications.settings || wa(), !e) {
		Y.notifications.settings.browser = !1, Y.notifications.permissionError = "", ro();
		return;
	}
	io().catch((e) => {
		Y.notifications.settings.browser = !1, Y.notifications.permissionError = "Chrome could not request notification permission.", console.warn("notification permission request failed", e), ro();
	});
}
function oo() {
	let e = window.AudioContext || window.webkitAudioContext;
	if (typeof e != "function") return Y.notifications.soundError = "Audio is unavailable in this browser.", ro(), Promise.resolve(!1);
	try {
		Y.notifications.audioContext = Y.notifications.audioContext || new e();
		let t = Y.notifications.audioContext.resume?.();
		return Promise.resolve(t).then(() => (Y.notifications.soundError = "", ro(), !0)).catch((e) => (Y.notifications.soundError = "Chrome may block sound until the page receives an audio gesture.", console.warn("completion audio initialization failed", e), ro(), !1));
	} catch (e) {
		return Y.notifications.soundError = "Completion sound is unavailable right now.", console.warn("completion audio initialization failed", e), ro(), Promise.resolve(!1);
	}
}
function so(e) {
	Y.notifications.settings = Y.notifications.settings || wa(), Y.notifications.settings.sound = !!e, Y.notifications.soundError = "", ro(), e && oo();
}
async function co(e) {
	if (e?.resourceId) try {
		if (await ks(e.resourceId, {
			clearUnread: !1,
			forceDetail: !0
		}), e.runId) {
			let t = Y.agent.runs.find((t) => t.id === e.runId);
			t && (Y.agent.activeRunId = t.id, xc(), kc(), Z());
		}
	} finally {
		to(e.marker);
	}
}
function lo() {
	Oi?.listen(window, "storage", (e) => {
		e.key === va() && e.newValue && (Y.notifications.store = Sa(), Y.tree && Ps()), e.key === Ui && (Y.notifications.settings = wa(), Ea() !== "granted" && (Y.notifications.settings.browser = !1), Y.settings.open && Y.settings.tab === "notifications" && Uc());
	}), Oi?.listen(document, "visibilitychange", () => {
		Pu(), Ba() && no(Y.selectedId);
	}), Oi?.listen(window, "focus", () => no(Y.selectedId));
}
function uo() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function fo(e) {
	return encodeURIComponent(String(e || "").trim());
}
function po(e) {
	return String(e?.agentHubSessionId || e?.sourceExternalId || e?.id || "").trim();
}
function mo(e) {
	return String(e || "").trim() || "workspace";
}
function ho(e, t = Y.activeWorkspaceId) {
	let n = String(t || "").trim(), r = po(e);
	return !n || !r ? "" : `${Bi}.session.${fo(n)}.${fo(r)}`;
}
function go(e) {
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Vi || typeof t.text != "string" ? null : t;
	} catch {
		return null;
	}
}
function _o(e) {
	let t = uo();
	if (!t || !e) return null;
	let n = "";
	try {
		n = t.getItem(e) || "";
	} catch {
		return null;
	}
	if (!n) return null;
	let r = go(n);
	if (r) return r;
	try {
		t.removeItem(e);
	} catch {}
	return null;
}
function vo(e) {
	let t = _o(e);
	return t ? t.text ? t.text : (yo(e), "") : "";
}
function yo(e) {
	let t = uo();
	if (!(!t || !e)) try {
		t.removeItem(e);
	} catch {}
}
function bo(e, t) {
	let n = /* @__PURE__ */ new Set();
	Y.agent.ttyDraftWorkspaceId === e && Y.agent.ttyDraftResourceId === t && Y.agent.ttyDraftKey && n.add(Y.agent.ttyDraftKey);
	for (let r of Y.agent.runs || []) {
		if (mo(r.resourceId) !== t) continue;
		let i = ho(r, e);
		i && n.add(i);
	}
	return n;
}
function xo(e = Y.activeWorkspaceId, t = Y.agent.ttyDraftResourceId) {
	let n = uo(), r = String(e || "").trim(), i = mo(t);
	if (!n || !r || !i) return;
	let a = `${Bi}.session.${fo(r)}.`, o = bo(r, i), s = [], c = Date.now();
	try {
		for (let e = 0; e < n.length; e++) {
			let t = n.key(e);
			if (!t || !t.startsWith(a)) continue;
			let r = _o(t);
			if (!r || mo(r.resourceId) !== i || o.has(t)) continue;
			if (!r.text) {
				n.removeItem(t);
				continue;
			}
			let l = Number(r.updatedAt) || 0;
			if (l > 0 && c - l > Yi) {
				n.removeItem(t);
				continue;
			}
			s.push({
				key: t,
				updatedAt: l
			});
		}
		for (s.sort((e, t) => e.updatedAt - t.updatedAt); s.length > Ji;) {
			let e = s.shift();
			e && yo(e.key);
		}
	} catch {}
}
function So(e, t, n = {}) {
	if (!e) return;
	if (!t) {
		yo(e);
		return;
	}
	let r = uo();
	if (r) try {
		r.setItem(e, JSON.stringify({
			version: Vi,
			text: t,
			updatedAt: Date.now(),
			workspaceId: n.workspaceId || "",
			resourceId: n.resourceId || "",
			runId: n.runId || "",
			sessionId: n.sessionId || ""
		}));
	} catch {}
}
function Co() {
	let e = Y.agent.ttyDraftKey;
	e && (So(e, Y.agent.ttyDraft, {
		workspaceId: Y.agent.ttyDraftWorkspaceId,
		resourceId: Y.agent.ttyDraftResourceId,
		runId: Y.agent.ttyDraftRunId,
		sessionId: po(sl())
	}), xo(Y.agent.ttyDraftWorkspaceId, Y.agent.ttyDraftResourceId));
}
function wo(e, t = !0) {
	let n = String(e ?? "");
	Y.agent.ttyDraft !== n && (Y.agent.ttyDraft = n, Y.agent.ttyDraftVersion++), Y.agent.ttyMultiline = n.includes("\n"), t && Co();
}
function To() {
	Y.agent.ttyDraft = "", Y.agent.ttyMultiline = !1, Y.agent.ttyDraftKey = "", Y.agent.ttyDraftWorkspaceId = "", Y.agent.ttyDraftResourceId = "", Y.agent.ttyDraftRunId = "", Y.agent.ttyDraftVersion++;
}
function Eo(e, t = Y.activeWorkspaceId) {
	let n = ho(e, t);
	if (!n) {
		To();
		return;
	}
	Y.agent.ttyDraftKey !== n && (Y.agent.ttyDraftKey = n, Y.agent.ttyDraftWorkspaceId = String(t || "").trim(), Y.agent.ttyDraftResourceId = mo(e.resourceId), Y.agent.ttyDraftRunId = String(e.id || ""), Y.agent.ttyDraft = vo(n), Y.agent.ttyMultiline = Y.agent.ttyDraft.includes("\n"), Y.agent.ttyDraftVersion++, xo(Y.agent.ttyDraftWorkspaceId, Y.agent.ttyDraftResourceId));
}
function Do() {
	Co();
}
function Oo({ workspaceId: e, runId: t, key: n, text: r, version: i }) {
	return Y.activeWorkspaceId !== e || Y.agent.activeRunId !== t || Y.agent.ttyDraftKey !== n || Y.agent.ttyDraft !== r || Y.agent.ttyDraftVersion !== i ? !1 : (yo(n), wo("", !1), !0);
}
async function ko(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		let t = Error(e);
		throw t.status = n.status, t;
	}
	return n.status === 204 ? null : n.json();
}
async function Ao() {
	let e = Fl(), [t, n] = await Promise.all([ko("/api/workspaces"), ko("/api/settings/agenthub")]);
	Y.config = Jl(t, n), Bl(), Y.activeWorkspaceId = Ll(e.workspaceId) ? e.workspaceId : Y.config.activeId || Y.config.workspaces[0]?.id || "", Y.selectedId = e.resourceId || "workspace", Qo(), Y.activeWorkspaceId ? (Da(Y.activeWorkspaceId), await Ho(), !e.resourceId && Y.lastResourceId && (Y.selectedId = Y.lastResourceId), await jo({ replaceURL: !0 })) : (Y.navigationLoading = !1, Y.tree = null, Y.details = {}, Y.resourceLogPages = {}, Y.workspaceAgents = null, Y.preview = null, Y.diff = null, hc(), Ko());
}
async function jo(e = {}) {
	if (!Y.activeWorkspaceId) return;
	let t = Y.activeWorkspaceId, n = Y.navigationVersion, r = ++Y.treeRequestVersion;
	Y.navigationLoading = !0, Y.navigationError = "", rs(), Y.detailRequestVersion++, Y.workspaceAgentsRequestVersion++, Y.previewRequestVersion++, Y.diffRequestVersion++;
	let i;
	try {
		i = await ko(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw Jo(t, n, r) && (Y.navigationLoading = !1, Y.navigationError = fa(e), rs()), e;
	}
	Jo(t, n, r) && (Y.tree = i, Y.details = {}, Y.resourceLogPages = {}, Y.workspaceAgents = null, Y.workspaceAgentsSaving = !1, Y.preview = null, Y.diff = null, jl(), Pl(!1), Y.selectedId === "workspace" ? await Vo() : Y.selectedId && await Mo(Y.selectedId), Jo(t, n, r) && (await ac(), Jo(t, n, r) && (Y.notifications.ready || $a(), Y.navigationLoading = !1, Y.navigationError = "", Ko(), e.updateURL !== !1 && Rl({ replace: !!e.replaceURL }))));
}
async function Mo(e, t = {}) {
	if (!e || e === "workspace" || Y.details[e] && !t.force) return;
	t.force && (Po(e), delete Y.details[e]);
	let n = Y.activeWorkspaceId, r = Y.navigationVersion, i = ++Y.detailRequestVersion, a = await No(e, n, { logsLimit: ji });
	return !Jo(n, r) || Y.selectedId !== e || i !== Y.detailRequestVersion ? null : zo(a, "replace");
}
function No(e, t = Y.activeWorkspaceId, n = {}) {
	let r = new URLSearchParams(), i = n.logsCursor === void 0 ? n.cursor : n.logsCursor, a = n.logsLimit === void 0 ? n.limit === void 0 ? ji : n.limit : n.logsLimit;
	return r.set("logsLimit", String(a)), i != null && String(i) !== "" && r.set("logsCursor", String(i)), ko(`/api/workspaces/${t}/resources/${encodeURIComponent(e)}?${r.toString()}`);
}
function Po(e) {
	Y.resourceLogPages ||= {}, e && delete Y.resourceLogPages[e];
}
function Fo(e) {
	return Y.resourceLogPages ||= {}, Y.resourceLogPages[e] || (Y.resourceLogPages[e] = {
		loaded: !1,
		hasMore: !1,
		nextCursor: "",
		loading: !1,
		error: "",
		requestVersion: 0
	}), Y.resourceLogPages[e];
}
function Io(e) {
	return Array.isArray(e?.logs) && e.logs.length ? e.logs : Array.isArray(e?.logPage?.entries) ? e.logPage.entries : Array.isArray(e?.logs) ? e.logs : [];
}
function Lo(e, t, n) {
	let r = [], i = /* @__PURE__ */ new Map(), a = (e, t) => {
		let n = String(e?.id || "");
		if (n && i.has(n)) {
			t && (r[i.get(n)] = e);
			return;
		}
		n && i.set(n, r.length), r.push(e);
	}, o = n ? t : e, s = n ? e : t;
	for (let e of o || []) a(e, !1);
	for (let e of s || []) a(e, !n);
	return r.sort(Gs);
}
function Ro(e) {
	let t = Y.resourceLogPages?.[e];
	return {
		detail: Y.details[e] || null,
		page: t ? {
			loaded: t.loaded,
			hasMore: t.hasMore,
			nextCursor: t.nextCursor,
			loading: t.loading,
			error: t.error
		} : null
	};
}
function zo(e, t = "head") {
	if (!e?.id) return null;
	let n = e.id, r = Io(e), i = e.logPage || null, a = Fo(n);
	if (t === "replace" || !a.loaded || !Y.details[n]) {
		a.loaded = !0, a.hasMore = !!i?.hasMore, a.nextCursor = String(i?.nextCursor || ""), a.error = "";
		let t = Lo([], r, !0);
		return Y.details[n] = {
			...e,
			logs: t,
			logPage: {
				hasMore: a.hasMore,
				nextCursor: a.nextCursor
			}
		}, Y.details[n];
	}
	let o = Y.details[n], s = Lo(o.logs || [], r, t !== "older");
	t === "older" && i && (a.hasMore = !!i.hasMore, a.nextCursor = String(i.nextCursor || "")), a.loaded = !0, a.error = "";
	let c = t === "older" ? o : {
		...o,
		...e
	};
	return Y.details[n] = {
		...c,
		logs: s,
		logPage: {
			hasMore: a.hasMore,
			nextCursor: a.nextCursor
		}
	}, Y.details[n];
}
async function Bo(e = Y.selectedId) {
	if (!e || e === "workspace" || Y.selectedId !== e) return;
	let t = Fo(e);
	if (!t.loaded || !t.hasMore || t.loading) return;
	let n = String(t.nextCursor || "");
	if (!n) {
		t.error = "The log page did not provide a continuation cursor.", Us();
		return;
	}
	let r = Y.activeWorkspaceId, i = Y.navigationVersion, a = ++t.requestVersion;
	t.loading = !0, t.error = "", Us();
	try {
		let o = await No(e, r, {
			logsCursor: n,
			logsLimit: Mi
		});
		if (!Jo(r, i) || Y.selectedId !== e || Y.resourceLogPages[e] !== t || a !== t.requestVersion) return;
		zo(o, "older");
	} catch (n) {
		Jo(r, i) && Y.selectedId === e && Y.resourceLogPages[e] === t && a === t.requestVersion && (t.error = fa(n, "Could not load older logs."));
	} finally {
		Jo(r, i) && Y.selectedId === e && Y.resourceLogPages[e] === t && a === t.requestVersion && (t.loading = !1, Us(), Z());
	}
}
async function Vo(e = {}) {
	if (!Y.activeWorkspaceId || Y.workspaceAgents && !e.force) return;
	let t = Y.activeWorkspaceId, n = Y.navigationVersion, r = ++Y.workspaceAgentsRequestVersion;
	try {
		let e = await ko(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!Jo(t, n) || r !== Y.workspaceAgentsRequestVersion) return null;
		Y.workspaceAgents = e;
	} catch (e) {
		if (!Jo(t, n) || r !== Y.workspaceAgentsRequestVersion) return null;
		Y.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: fa(e)
		};
	}
	return Y.workspaceAgents;
}
async function Ho(e = Y.activeWorkspaceId, t = Y.navigationVersion) {
	let n = await ko(`/api/workspaces/${e}/ui-state`);
	return Jo(e, t) ? (Y.expandedProjects = new Set(n.expandedProjects || []), Y.lastResourceId = n.lastResourceId || "", Y.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], Y.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, Y.sessionOrder = Array.isArray(n.sessionOrder) ? n.sessionOrder : [], !0) : !1;
}
async function Uo() {
	if (!Y.activeWorkspaceId) return;
	let e = Y.activeWorkspaceId, t = Y.navigationVersion, n = Y.selectedId;
	await ko(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...Y.expandedProjects],
			lastResourceId: n,
			projectOrder: Y.projectOrder,
			taskOrder: Y.taskOrder,
			sessionOrder: Y.sessionOrder
		})
	}), Jo(e, t) && (Y.lastResourceId = n);
}
function Wo() {
	Y.autoRefreshTimer ||= Oi?.interval(() => {
		Go().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, Ai);
}
async function Go() {
	if (!Y.activeWorkspaceId || Y.autoRefreshInFlight || Y.agentSessionMutationCount > 0 || Y.listDrag) return;
	let e = Y.autoRefreshVersion, t = Y.activeWorkspaceId, n = Y.navigationVersion, r = Y.selectedId;
	Y.autoRefreshInFlight = !0;
	try {
		let i = await lc(t);
		if (!i || !Yo(t, n, e)) return;
		let a = !nu(Y.tree, i);
		if (a && (Y.tree = i), typeof Za == "function" && Za(i.sessions || []), a && Y.preview?.section === "Wiki" && !Y.preview.loading && (await Ys("Wiki", Y.preview.path), !Yo(t, n, e))) return;
		jl() && (Rl({ replace: !0 }), a = !0, r = Y.selectedId);
		let o = Y.expandedProjects.size;
		if (Pl(!1), a ||= o !== Y.expandedProjects.size, Y.selectedId === "workspace") {
			let r = Y.workspaceAgents;
			if (await Vo({ force: !0 }), !Yo(t, n, e)) return;
			nu(r, Y.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++Y.detailRequestVersion, o = await No(r, t, { logsLimit: ji });
			if (!Yo(t, n, e) || Y.selectedId !== r || i !== Y.detailRequestVersion) return;
			let s = Ro(r);
			zo(o, "head"), nu(s, Ro(r)) || (a = !0);
		}
		Y.agentRunProjectionVersion = (Number(Y.agentRunProjectionVersion) || 0) + 1;
		let s = Y.agentRunProjectionVersion, c = await pc();
		if (!Yo(t, n, e) || s !== Y.agentRunProjectionVersion) return;
		if (nu(Y.agent.runs, c) || (Y.agent.runs = c, a = !0), typeof Za == "function" && Za(c), typeof ic == "function" && ic(c), sc(c)) {
			if (!Yo(t, n, e) || s !== Y.agentRunProjectionVersion) return;
			a = !0;
		}
		typeof ic == "function" && ic(Y.agent.runs), Es() !== Y.taskOperationalStateKey && (a = !0), a && Ko();
	} finally {
		Y.autoRefreshInFlight = !1;
	}
}
function Ko() {
	rs(), Us(), xc(), kc(), Z(), xl(), Vc(), Uc();
}
function qo() {
	rs(), Us(), xc(), kc(), Z(), xl(), Vc();
}
function Jo(e, t, n = null) {
	return e === Y.activeWorkspaceId && t === Y.navigationVersion && (n == null || n === Y.treeRequestVersion);
}
function Yo(e, t, n) {
	return Jo(e, t) && n === Y.autoRefreshVersion;
}
function Xo(e) {
	return ea.get(String(e?.icon || "").trim()) || Qi;
}
function Zo(e) {
	let t = Xo(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = t.type || "image/png", n.href = t.src;
}
function Qo() {
	let e = Y.config?.workspaces?.find((e) => e.id === Y.activeWorkspaceId);
	Zo(e), rs();
}
function $o(e) {
	if (!e) return "";
	let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
	return `#${n ? n[1] : t}`;
}
function es(e) {
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
function ts(e, t, n = "") {
	let r = ls(e), i = t === "project" && Nl(e.id), a = t === "project" ? as(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: $o(e.id),
		active: Y.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: es(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? js(e.children || [], Y.taskOrder[e.id]).map((t) => ts(t, "task", e.id)) : [],
		projectId: n
	};
}
function ns(e) {
	let t = Rs(e), n = t.displayResourceId, r = e.source === "internal", i = r ? ps(e) : ms("session-external", "session-status-external", "message-square", "External session active", "session"), a = zs(e), o = a ? ls(a) : cs(), s = us(r && o.selfDriving ? [o.selfDriving, i] : [i]), c = eo(e.id), l = `${Vs(e, a, o, i)}${c ? ". Unread turn completion." : ""}`, u = r ? (Y.config?.agents || []).find((t) => t.id === e.agentRunAgentName) : null, d = [r ? "AgentHub" : "External"];
	return t.controls.length > 1 ? d.push(`${t.controls.length} locks`) : n && d.push(n), e.updatedAt && d.push(gl(e.updatedAt)), {
		id: e.id,
		source: e.source || "external",
		title: Fs(e, t),
		meta: d.join(" · "),
		label: r ? u?.name || e.agentRunAgentName || "AgentHub" : "External",
		statusLabel: l,
		status: es(s),
		unread: c,
		current: !!(Y.selectedId && Y.selectedId !== "workspace" && t.selectedResourceIds.includes(Y.selectedId)),
		clickable: !!(t.navigationResourceId || t.menu),
		navigationResourceId: t.navigationResourceId,
		menu: t.menu,
		controls: t.controls.map((e) => ({
			resourceId: e.resourceId,
			path: e.path || "",
			navigable: !!Ls(e.resourceId)
		}))
	};
}
function rs() {
	let e = Y.tree ? js(Y.tree.projects || [], Y.projectOrder).map((e) => ts(e, "project")) : [], t = js(Ns(Y.tree?.sessions || []), Y.sessionOrder).map(ns);
	Y.tree && (Y.taskOperationalStateKey = Es()), Di.renderAppShell({
		identity: Y.activeWorkspaceId || "no-workspace",
		loading: !!Y.navigationLoading,
		error: Y.navigationError || "",
		version: "v0.1.0",
		activeWorkspaceId: Y.activeWorkspaceId,
		workspaces: (Y.config?.workspaces || []).map((e) => ({
			id: e.id,
			name: e.name || e.id,
			path: e.path || "",
			icon: e.icon || "",
			iconSrc: Xo(e).src
		})),
		projects: e,
		sessions: t,
		paneSizes: { ...Y.paneSizes },
		mobile: { ...Y.mobile },
		route: { ...Y.routeProjection },
		onSwitchWorkspace: (e) => is(e),
		onAddWorkspace: () => Gl("workspace").catch((e) => X(e.message)),
		onCreateProject: () => _l(),
		onOpenSettings: () => Gl().catch((e) => X(e.message)),
		onToggleProject: (e) => As(e),
		onSelectResource: (e) => ks(e),
		onReorder: (e, t, n) => ss(e, t, n),
		onDragState: (e) => {
			Y.listDrag = e;
		},
		onPanePreview: (e, t) => mu(e, t),
		onPaneCommit: (e) => gu(e),
		onPaneViewport: () => wu(),
		onMobileSidebar: (e) => Du(e),
		onMobileView: (e) => Ou(e),
		onMobileImmersive: (e) => Au(e),
		onHistoryNavigation: (e) => Iu(e),
		onToast: X,
		onIconsChanged: Z
	});
}
async function is(e) {
	if (!Ll(e)) return;
	if (Y.workspaceMenuOpen = !1, e === Y.activeWorkspaceId) {
		Qo();
		return;
	}
	Du(!1), Do(), Y.navigationVersion++, Y.autoRefreshVersion++, Y.treeRequestVersion++, Y.detailRequestVersion++, Y.workspaceAgentsRequestVersion++, Y.previewRequestVersion++, Y.diffRequestVersion++;
	let t = Y.navigationVersion;
	await Uo().catch((e) => console.warn("failed to save UI state", e)), Y.activeWorkspaceId = e, Y.selectedId = "workspace", Y.tree = null, Y.navigationLoading = !0, Y.navigationError = "", Y.details = {}, Y.resourceLogPages = {}, Da(e), Y.sessionMenu = null, Js(), Y.workspaceAgentsSaving = !1, bl(), Y.selfDrivingDialog.open && !Y.selfDrivingDialog.submitting && Bc(), hc(), Qo(), await Ho(e, t) && (Y.selectedId = Y.lastResourceId || "workspace", await jo());
}
function as(e) {
	let t = (Array.isArray(e?.children) ? e.children : []).filter((e) => e && e.archived !== !0), n = /* @__PURE__ */ new Set();
	for (let e of t) hs(e.id).some(os) && n.add(e.id);
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
function os(e) {
	return e?.source === "internal" && Zi.has(e.agentRunStatus);
}
async function ss(e, t, n) {
	let r = {
		projectOrder: [...Y.projectOrder],
		taskOrder: Object.fromEntries(Object.entries(Y.taskOrder).map(([e, t]) => [e, [...t]])),
		sessionOrder: [...Y.sessionOrder]
	};
	if (e.kind === "session") Y.sessionOrder = Ms(js(Ns(Y.tree?.sessions || []), Y.sessionOrder).map((e) => e.id), e.id, t.id, n);
	else if (e.kind === "task") {
		let r = Al(e.projectId);
		if (!r) return;
		let i = js(r.children || [], Y.taskOrder[e.projectId]);
		Y.taskOrder = {
			...Y.taskOrder,
			[e.projectId]: Ms(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") Y.projectOrder = Ms(js(Y.tree?.projects || [], Y.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	rs();
	try {
		await Uo();
	} catch (e) {
		throw Y.projectOrder = r.projectOrder, Y.taskOrder = r.taskOrder, Y.sessionOrder = r.sessionOrder, rs(), e;
	}
}
function cs() {
	return {
		selfDriving: null,
		session: null,
		className: "",
		label: "",
		lock: null,
		statusPresentation: us([], null)
	};
}
function ls(e) {
	let t = hs(e.id), n = gs(e.id), r = ds(e.selfDriving), i = fs(t), a = Ss(n), o = us([r, i], a);
	return {
		selfDriving: r,
		session: i,
		className: o.className,
		lock: a,
		statusPresentation: o,
		label: ws(e.selfDriving, t, a, {
			selfDriving: r,
			session: i
		})
	};
}
function us(e, t = null) {
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
function ds(e) {
	if (!e || !e.enabled) return null;
	let t = e?.condition || "ready";
	return t === "error" ? ms("error", "task-status-danger", "triangle-alert", "Self-Driving error", "self-driving") : t === "blocked" || t === "needs_configuration" ? ms(t, "task-status-attention", "square", `Self-Driving ${t.replace(/_/g, " ")}`, "self-driving") : t === "waiting" ? ms("waiting", "task-status-attention", "pause", "Self-Driving waiting", "self-driving") : t === "ready" ? ms("ready", "task-status-queued", "clock", "Self-Driving ready", "self-driving") : ms("unknown", "task-status-neutral", "circle-help", `Self-Driving ${t || "unknown"}`, "self-driving");
}
function fs(e) {
	let t = e.find((e) => e.agentRunStatus === "waiting_approval");
	if (t) return ps(t);
	let n = e.find((e) => e.agentRunStatus === "starting");
	if (n) return ps(n);
	let r = e.find((e) => e.agentRunStatus === "running");
	if (r) return ps(r);
	let i = e.find((e) => e.agentRunStatus === "stopping");
	if (i) return ps(i);
	let a = e.find((e) => e.agentRunStatus === "recovering");
	if (a) return ps(a);
	let o = e.find((e) => e.agentRunStatus === "idle");
	return o ? ps(o) : e.length > 0 ? ps(e[0]) : null;
}
function ps(e) {
	let t = e?.agentRunStatus || "";
	switch (t) {
		case "starting": return ms("session-starting", "task-status-session-running", "loader-circle", "Session starting", "session", e);
		case "running": return ms("session-running", "task-status-session-running", "loader-circle", "Session running", "session", e);
		case "waiting_approval": return ms("session-approval", "task-status-attention", "shield-question", "Session waiting for approval", "session", e);
		case "stopping": return ms("session-stopping", "task-status-session-stopping", "loader-circle", "Session stopping", "session", e);
		case "recovering": return ms("session-recovering", "task-status-attention", "rotate-ccw", "Session recovering", "session", e);
		case "idle": return ms("session-idle", "task-status-info", "message-square", "Session waiting for input", "session", e);
		default: return ms("session-active", "task-status-neutral", "circle-dot", t ? `Session ${t}` : "Session active", "session", e);
	}
}
function ms(e, t, n, r, i, a = null) {
	return {
		kind: e,
		className: t,
		iconName: n,
		label: r,
		dimension: i,
		recentOutput: !!(a && Os(a))
	};
}
function hs(e) {
	return e ? (Y.tree?.sessions || []).filter((t) => t.resourceId === e || Is(t).some((t) => t.resourceId === e)) : [];
}
function gs(e) {
	return e ? (Y.tree?.sessions || []).filter((t) => Is(t).some((t) => t.resourceId === e)) : [];
}
function _s() {
	let e = Al(Y.selectedId);
	if (!e || e.type !== "project" && e.type !== "task") return null;
	let t = Y.details?.[e.id];
	return t && t.type !== e.type ? null : e;
}
function vs() {
	let e = _s();
	return !!(e && gs(e.id).some((e) => e.source === "external"));
}
function ys() {
	let e = _s();
	return !!(e && gs(e.id).some((e) => e.source === "internal"));
}
function bs() {
	return vs() || ys();
}
function xs() {
	bs() && (Y.agent.agentChooserOpen = !1);
}
function Ss(e) {
	if (e.length === 0) return null;
	let t = e.find((e) => e.source === "external"), n = t || e[0], r = e.length, i = Cs(n);
	return {
		kind: t ? "external" : "internal",
		className: t ? "task-lock-external" : "task-lock-internal",
		label: r > 1 ? `Locked by ${r} sessions including ${i}` : `Locked by ${i}`
	};
}
function Cs(e) {
	return e.source === "external" ? "an external session" : `${(Y.config?.agents || []).find((t) => t.id === e.agentRunAgentName)?.name || e.agentRunAgentName || "Forge GUI"} session`;
}
function ws(e, t, n, r) {
	let i = [];
	if (e && i.push(`Self-Driving ${e.enabled ? "on" : "off"}, ${e.condition}, revision ${e.revision}`), t.length === 1) i.push(Ts(t[0]));
	else if (t.length > 1) {
		let e = [...new Set(t.map((e) => e.agentRunStatus || "open"))].join(", ");
		i.push(`${t.length} agent sessions: ${e}`);
	}
	return n && i.push(n.label), i.join(" · ");
}
function Ts(e) {
	return `${e.schedulerTurn ? "Self-Driving session" : "Agent session"} ${(e.agentRunStatus || "open").replace("waiting_approval", "waiting for approval")}`;
}
function Es() {
	if (!Y.tree) return "";
	let e = [];
	for (let t of Y.tree.projects || []) {
		let n = ls(t), r = as(t);
		e.push(`${t.id}:auto=${Ds(n.selfDriving)}:session=${Ds(n.session)}:${n.lock?.kind || "none"}:${n.label}:tasks=${r.taskCount}:${r.runningCount}`);
		for (let n of t.children || []) {
			let t = ls(n);
			e.push(`${n.id}:auto=${Ds(t.selfDriving)}:session=${Ds(t.session)}:${t.lock?.kind || "none"}:${t.label}`);
		}
	}
	return e.join("|");
}
function Ds(e) {
	return e ? `${e.kind}:${e.iconName}:${e.recentOutput}` : "none";
}
function Os(e) {
	let t = new Date(e.agentRunLastOutputAt || "").getTime();
	if (Number.isFinite(t)) return Date.now() - t <= Ni;
	if (!["running", "starting"].includes(e.agentRunStatus)) return !1;
	let n = new Date(e.agentRunUpdatedAt || "").getTime();
	return Number.isFinite(n) && Date.now() - n <= Ni;
}
async function ks(e, t = {}) {
	let n = Y.selectedId !== e;
	t.clearUnread !== !1 && no(e);
	let r = n || !!t.forceDetail;
	r && (Y.navigationVersion++, Y.autoRefreshVersion++, Y.treeRequestVersion++, Y.detailRequestVersion++, Y.workspaceAgentsRequestVersion++, Y.previewRequestVersion++, Y.diffRequestVersion++, e !== "workspace" && (Po(e), delete Y.details[e])), n && (Y.selfDrivingDialog.open && !Y.selfDrivingDialog.submitting && Bc(), Y.workspaceAgentsSaving = !1, Do(), Zc(), Y.preview = null, Y.diff = null, gc(), Y.agent.runs = [], Y.agent.activeRunId = "", Y.agent.events = [], Y.agent.notices = [], Y.agent.historyBeforeId = 0, To()), Y.selectedId = e, Y.sessionMenu = null, Du(!1), Pl(!1), Rl(), Uo().catch((e) => console.warn("failed to save UI state", e)), qo(), await Promise.all([e === "workspace" ? Vo({ force: !!t.forceDetail }) : Mo(e, { force: r }), n ? ac() : Promise.resolve()]), Jo(Y.activeWorkspaceId, Y.navigationVersion) && qo();
}
async function As(e) {
	Y.expandedProjects.has(e) ? Y.expandedProjects.delete(e) : Y.expandedProjects.add(e), rs();
	try {
		await Uo();
	} catch (t) {
		throw Y.expandedProjects.has(e) ? Y.expandedProjects.delete(e) : Y.expandedProjects.add(e), rs(), t;
	}
}
function js(e, t) {
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
function Ms(e, t, n, r) {
	if (!Array.isArray(e) || t === n) return e;
	let i = e.filter((e) => e !== t), a = i.indexOf(n);
	return a < 0 ? e : (r && (a += 1), i.splice(a, 0, t), i);
}
function Ns(e) {
	return e.map((e, t) => ({
		session: e,
		index: t
	})).sort((e, t) => {
		let n = Date.parse(e.session.startedAt || ""), r = Date.parse(t.session.startedAt || ""), i = Number.isFinite(n), a = Number.isFinite(r);
		return i && a && n !== r ? n - r : i === a ? e.session.id === t.session.id ? e.index - t.index : e.session.id < t.session.id ? -1 : 1 : i ? -1 : 1;
	}).map((e) => e.session);
}
function Ps() {
	rs();
}
function Fs(e, t) {
	let n = (t && typeof t == "object" ? t : arguments.length > 1 ? { displayResourceId: t || "" } : Rs(e)).displayResourceId || "", r = Al(n)?.title || "";
	return e.source === "internal" ? e.agentRunTitle || r || n || e.id : r || n || e.id;
}
function Is(e) {
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
function Ls(e) {
	let t = String(e || "").trim();
	if (!t) return "";
	let n = Al(t);
	return n && n.archived !== !0 ? t : "";
}
function Rs(e) {
	let t = Is(e), n = String(e?.resourceId || "").trim();
	if (e?.source === "internal" && n) return {
		kind: "run",
		primaryResourceId: n,
		displayResourceId: n,
		navigationResourceId: Ls(n),
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
			navigationResourceId: Ls(e),
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
function zs(e) {
	if (!e || e.source !== "internal") return null;
	let t = String(e.resourceId || "").trim();
	if (t) return Bs(t);
	let n = Is(e);
	return n.length === 1 ? Bs(n[0].resourceId) : null;
}
function Bs(e) {
	let t = Al(e);
	return t && t.type === "task" && !t.archived ? t : null;
}
function Vs(e, t, n, r) {
	let i = [];
	if (t?.selfDriving && n?.selfDriving) {
		let e = `Self-Driving ${t.selfDriving.condition || "unknown"}`, n = Number.isFinite(t.selfDriving.revision) ? t.selfDriving.revision : "unknown";
		i.push(`${e}, revision ${n}`);
	}
	return r && i.push(r.label), i.length > 0 ? i.join(" · ") : e?.source === "external" ? "External session active" : "Session active";
}
function Hs() {
	let e = Y.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${Y.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: zl(),
		resourceId: Y.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		parent: null,
		loading: !1,
		detail: null,
		wiki: Y.tree?.wiki || null,
		workspaceAgents: Y.workspaceAgents,
		logs: {
			hasMore: !1,
			loading: !1,
			error: ""
		},
		onNavigate: (e) => Ws(e).catch((e) => X(e.message)),
		onCreateTask: (e) => vl(e),
		onArchive: (e) => kl(e).catch((e) => X(e.message)),
		onLoadMoreLogs: (e) => Bo(e),
		onSaveWorkspaceAgents: (e, t) => Xs(e, t),
		onToast: X,
		onIconsChanged: Z
	};
	if (!Y.tree) return t;
	if (Y.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: zl()
	};
	let n = Al(Y.selectedId) || Y.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: zl()
	};
	let r = Y.details[n.id] || null, i = Ml(n.id), a = Y.resourceLogPages?.[n.id] || {};
	return {
		...t,
		identity: `${e}:${n.id}:${n.type}`,
		resourceId: n.id,
		resourceType: n.type,
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
function Us() {
	Di.renderDetailPanel(Hs());
}
async function Ws(e) {
	await ks(e, { forceDetail: e === Y.selectedId && e !== "workspace" });
}
function Gs(e, t) {
	let n = Date.parse(e?.time || ""), r = Date.parse(t?.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t?.time || "").localeCompare(String(e?.time || ""));
}
function Ks(e) {
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
function qs(e) {
	return Ks(e || "").trim();
}
function Js() {
	Y.workspaceAgentsDraft = "", Y.workspaceAgentsDirty = !1;
}
async function Ys(e, t, n = {}) {
	let r = n.workspaceId || Y.activeWorkspaceId, i = n.requestVersion || ++Y.previewRequestVersion;
	try {
		let n = await ko($s(e, t, r));
		return r !== Y.activeWorkspaceId || i !== Y.previewRequestVersion || Y.preview?.section !== e || Y.preview?.path !== t ? null : (Y.preview = {
			section: e,
			...n
		}, Y.preview);
	} catch (a) {
		let o = r === Y.activeWorkspaceId && i === Y.previewRequestVersion && Y.preview?.section === e && Y.preview?.path === t;
		if (o && (Y.preview = {
			section: e,
			path: t,
			error: fa(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function Xs(e, t) {
	if (!Y.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = Y.activeWorkspaceId, r = Y.navigationVersion, i = await ko(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!Jo(n, r) || Y.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return Y.workspaceAgents = i, Y.workspaceAgentsDraft = qs(i.content || ""), Y.workspaceAgentsDirty = !1, i;
}
function Zs() {
	Y.previewRequestVersion++, Y.preview = null, Ko();
}
function Qs() {
	Y.diffRequestVersion++, Y.diff = null, Ko();
}
function $s(e, t, n = Y.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
function ec(e) {
	let t = e?.data;
	return t?.method === "forge/self-driving/finish" && t?.kind === Li && t?.lifecycle === Ri && t?.level !== "error" && String(t.runId || "").trim() !== "" && String(t.resourceId || "").trim() !== "" && Number(t.selfDrivingRevision) > 0;
}
function tc(e) {
	return Number(e?.data?.schedulerTurnSequence) || 0;
}
function nc(e) {
	let t = String(e?.resourceId || "").trim();
	if (!t) return null;
	let n = [Y.details?.[t], Al(t)].map((e) => e?.selfDriving).filter(Boolean).map((e) => ({
		revision: Number(e.revision) || 0,
		state: String(e.condition || "").trim().toLowerCase()
	}));
	if (!n.length) return null;
	let r = (e) => +!zi.has(e);
	return n.sort((e, t) => t.revision - e.revision || r(t.state) - r(e.state)), n[0];
}
function rc(e, t = Y.agent.runs) {
	if (!ec(e)) return !0;
	let n = e.data;
	if (!Y.agent.activeRunId || String(n.runId).trim() !== Y.agent.activeRunId) return !1;
	let r = (t || []).find((e) => e.id === Y.agent.activeRunId);
	if (!r || String(r.resourceId || "").trim() !== String(n.resourceId).trim() || Number(r.selfDrivingRevision) !== Number(n.selfDrivingRevision)) return !1;
	let i = tc(e), a = Number(r.schedulerTurnSequence) || 0;
	if (a > i && a > 0 || a === i && r.schedulerTurnId && n.schedulerTurnId && r.schedulerTurnId !== n.schedulerTurnId || r.schedulerTurn && (a === 0 || a >= i)) return !1;
	let o = nc(r);
	return !o || o.revision === Number(n.selfDrivingRevision) && zi.has(o.state);
}
function ic(e = Y.agent.runs) {
	let t = Y.agent.notices.length;
	return Y.agent.notices = Y.agent.notices.filter((t) => rc(t, e)), Y.agent.notices.length !== t;
}
async function ac() {
	if (!Y.activeWorkspaceId) {
		hc();
		return;
	}
	Y.agentRunProjectionVersion = (Number(Y.agentRunProjectionVersion) || 0) + 1;
	let e = Y.agentRunProjectionVersion, t = await pc();
	return e !== Y.agentRunProjectionVersion || !Y.activeWorkspaceId || (Y.agent.runs = t, Za(Y.agent.runs), sc(Y.agent.runs), typeof ic == "function" && ic(Y.agent.runs), Y.agent.activeRunId || (Y.agent.historyBeforeId = 0), e !== Y.agentRunProjectionVersion) ? !1 : (typeof ic == "function" && ic(Y.agent.runs), !0);
}
async function oc(e = {}) {
	if (!Y.activeWorkspaceId) return;
	Y.agentRunProjectionVersion = (Number(Y.agentRunProjectionVersion) || 0) + 1;
	let t = Y.agentRunProjectionVersion, n = Y.activeWorkspaceId, r = await pc();
	if (t !== Y.agentRunProjectionVersion || Y.activeWorkspaceId !== n || (Y.agent.runs = r, Za(r), typeof ic == "function" && ic(r), sc(r) && (t !== Y.agentRunProjectionVersion || Y.activeWorkspaceId !== n))) return !1;
	if (e.refreshSelfDrivingProjection && Y.agent.activeRunId) {
		let e = sl(), r = String(e?.resourceId || "").trim(), [i, a] = await Promise.all([lc(n), r ? No(r, n, { logsLimit: ji }) : Promise.resolve(null)]);
		if (t !== Y.agentRunProjectionVersion || Y.activeWorkspaceId !== n) return !1;
		i && (Y.tree = i), a && Y.activeWorkspaceId === n && zo(a, "head");
	}
	return typeof ic == "function" && ic(Y.agent.runs), !0;
}
function sc(e) {
	let t = cc(e);
	if (Y.agent.activeRunId === t) {
		let n = e.find((e) => e.id === t);
		return n && Eo(n), !1;
	}
	Do(), Y.agent.activeRunId = t, Y.agent.events = [], Y.agent.notices = [], Y.agent.eventsHasMore = !1, Y.agent.historyBeforeId = 0, To();
	let n = e.find((e) => e.id === t);
	return n && Eo(n), Y.agent.approvalDrafts.clear(), !0;
}
function cc(e) {
	let t = e.find((e) => e.schedulerTurn && cl(e));
	return t ? t.id : e.some((e) => e.id === Y.agent.activeRunId) ? Y.agent.activeRunId : e[0]?.id || "";
}
async function lc(e = Y.activeWorkspaceId) {
	let t = ++Y.treeRequestVersion, n = Y.navigationVersion, r = await ko(`/api/workspaces/${e}/tree`);
	return Jo(e, n, t) ? r : null;
}
async function uc() {
	if (!Y.activeWorkspaceId || !Y.tree) return;
	let e = await lc(Y.activeWorkspaceId);
	e && (Y.tree = e);
}
async function dc(e, t) {
	!e || Y.activeWorkspaceId !== e || (await Promise.all([
		ac(),
		uc(),
		t && t !== "workspace" ? No(t, e, { logsLimit: ji }).then((t) => {
			Y.activeWorkspaceId === e && t && zo(t, "head");
		}) : Promise.resolve()
	]), Y.activeWorkspaceId === e && (typeof ic == "function" && ic(Y.agent.runs), Ko()));
}
async function fc(e) {
	Y.agentSessionMutationCount++, Y.autoRefreshVersion++, Y.treeRequestVersion++;
	try {
		return await e();
	} finally {
		Y.agentSessionMutationCount--;
	}
}
function pc() {
	let e = hl(), t = e ? `?resourceId=${encodeURIComponent(e)}` : "";
	return ko(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs${t}`).then((e) => e.runs || []);
}
async function mc() {
	Do(), gc(), Y.agent.turnStopping = !1, Y.agent.turnStoppingRunId = "", Y.agent.sessionStopping = !1, Y.agent.sessionStoppingRunId = "", Y.agent.activeRunId = "", Y.agent.events = [], Y.agent.notices = [], Y.agent.historyBeforeId = 0, To(), await ac();
}
function hc() {
	Y.selfDrivingDialog.open && !Y.selfDrivingDialog.submitting && Bc(), Do(), Zc(), gc(), Y.agent.runs = [], Y.agentRunProjectionVersion = (Number(Y.agentRunProjectionVersion) || 0) + 1, Y.agent.activeRunId = "", Y.agent.events = [], Y.agent.notices = [], Y.agent.eventsHasMore = !1, Y.agent.historyBeforeId = 0, Y.agent.loadingOlder = !1, Y.agent.optionsOpen = !1, Y.agent.agentChooserOpen = !1, Y.agent.historyOpen = !1, To(), Y.agent.newSessionStarting = !1, Y.agent.turnStopping = !1, Y.agent.turnStoppingRunId = "", Y.agent.sessionStopping = !1, Y.agent.sessionStoppingRunId = "", Y.agent.toolGroupOpen.clear(), Y.agent.approvalDrafts.clear(), Y.agent.selfDrivingFinishNoticeWatermarks instanceof Map && Y.agent.selfDrivingFinishNoticeWatermarks.clear(), Y.agent.renderDeferredForSelection = !1, yc();
}
function gc() {
	Y.agent.stream && Y.agent.stream.close(), Y.agent.stream = null, Y.agent.streamRunId = "";
}
function _c(e, t, n) {
	if (e !== Y.activeWorkspaceId || t !== Y.agent.activeRunId || !n) return;
	let r = Y.agent.runs.find((e) => e.id === t) || null;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && Qa(n, r), [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(n.type) && oc({ refreshSelfDrivingProjection: [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state"
	].includes(n.type) }).then(Ko).catch((e) => console.warn("agent refresh failed", e));
}
function vc(e, t, n) {
	e === Y.activeWorkspaceId && t === Y.agent.activeRunId && n?.data?.kind === Li && oc({ refreshSelfDrivingProjection: !0 }).then(Ko).catch((e) => console.warn("Self-Driving notice projection refresh failed", e));
}
function yc() {
	Y.agent.renderTimer && window.clearTimeout(Y.agent.renderTimer), Y.agent.renderTimer = null;
}
function bc(e) {
	if (!window.AgentHubEventTimeline?.buildTimeline) throw Error("AgentHub Event Timeline library is unavailable");
	let t = (e || []).filter((e) => !Xi.has(e?.type));
	return window.AgentHubEventTimeline.buildTimeline(t);
}
function xc() {
	typeof ic == "function" && ic(Y.agent.runs);
	let e = sl(), t = Y.details[Y.selectedId];
	Di.renderSelfDrivingBar(Sc(t)), Di.renderSessionSwitcher({
		identity: `${Y.activeWorkspaceId}:${hl()}`,
		workspaceId: Y.activeWorkspaceId,
		resourceId: hl(),
		activeRunId: e?.id || "",
		runs: Y.agent.runs,
		switchingRunId: Y.agent.switchingRunId || "",
		onSelect: rl,
		onToast: X,
		onIconsChanged: Z
	});
}
function Sc(e) {
	let t = Al(Y.selectedId);
	if (!t || t.type !== "task" || !e) return {
		identity: `${Y.activeWorkspaceId}:${Y.selectedId}:hidden`,
		visible: !1,
		status: Tc("disabled", !1),
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
		onIconsChanged: Z
	};
	let n = e.selfDriving || null, r = sl(), i = r?.schedulerTurn && r.resourceId === e.id ? `${r.agentProfile ? `${r.agentProfile} → ` : ""}${r.agentHubAgentName || ""}` : "";
	return {
		identity: `${Y.activeWorkspaceId}:${t.id}:${Number(n?.revision) || 0}`,
		visible: !0,
		status: Tc(n?.condition || "disabled", !!n?.enabled),
		summary: wc(n, e),
		expanded: !!(n && Y.agent.selfDrivingExpanded),
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
		statusReason: Cc(n, e?.logs),
		pending: !!(Y.agent.selfDrivingSaving || Y.agent.selfDrivingDisabling),
		onToggleEnabled: () => {
			Y.agent.selfDrivingSaving || Y.agent.selfDrivingDisabling || (n?.enabled ? tl().catch((e) => X(e.message)) : Fc(e) ? zc() : Ic({ enabled: !0 }).catch((e) => X(e.message)));
		},
		onToggleDetails: () => {
			Y.agent.selfDrivingExpanded = !Y.agent.selfDrivingExpanded, xc();
		},
		onIconsChanged: Z
	};
}
function Cc(e, t = []) {
	if (!e) return null;
	let n = String(e.conditionReason || e.notificationError?.message || "").trim();
	return n ? {
		label: "Status",
		text: n
	} : null;
}
function wc(e, t) {
	if (!e) return "Self-Driving is off.";
	let n = Cc(e, t?.logs);
	if (n) return `${n.label}: ${n.text}`;
	if (e.wakeContext?.condition) return `Wake condition: ${e.wakeContext.condition}`;
	let r = sl();
	if (r?.schedulerTurn && r.resourceId === t.id) {
		let e = `${r.agentProfile ? `${r.agentProfile} → ` : ""}${r.agentHubAgentName || ""}`.trim();
		if (e) return `Agent: ${e}`;
	}
	return `Revision ${Number(e.revision) || 0}`;
}
function Tc(e, t = !1) {
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
function Ec(e) {
	if (!e) return "";
	let t = [Dc(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function Dc(e) {
	return (Y.config?.agentHubProviders || Y.settings.data?.agentHub?.catalog?.providers || []).find((t) => t.id === e)?.name || e || "Provider";
}
function Oc(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function kc(e = {}) {
	jc();
	let t = sl(), n = (Y.config?.agents || []).find((e) => e.id === t?.agentHubAgentName);
	Di.renderEventTimeline({
		identity: `${Y.activeWorkspaceId}:${t?.id || ""}`,
		workspaceId: Y.activeWorkspaceId,
		activeRunId: t?.id || "",
		activeRun: t,
		runCount: Y.agent.runs.length,
		agentName: Pc(n || Vl()),
		project: bc,
		onEvent: _c,
		onNotice: vc,
		onApproval: ol,
		onToast: X,
		onIconsChanged: Z
	});
}
function Ac(e, t) {
	return `${e || "workspace"}:${t || "run"}`;
}
function jc(e = {}) {
	Y.agent.skipTTYDraftSync = !1, xs();
	let t = sl();
	t && Eo(t);
	let n = cl(t), r = t?.resourceId || hl(), i = dl(t), a = fl(t) || t?.status === "stopping";
	Di.renderComposer({
		identity: `${Y.activeWorkspaceId}:${r}:${t?.id || "none"}:${Y.agent.ttyDraftKey || ""}`,
		workspaceId: Y.activeWorkspaceId,
		resourceId: r,
		runId: t?.id || "",
		runStatus: t?.status || "",
		live: n,
		canResume: !!(t && !n && (t.agentHubSessionId || t.sourceExternalId)),
		draft: Y.agent.ttyDraft || "",
		draftKey: Y.agent.ttyDraftKey || "",
		draftResetVersion: Y.agent.ttyDraftResetVersion || 0,
		unavailableReason: n ? Nc(t, Mc(t)) : "",
		sending: !!(t && Y.agent.sendingInputRunIds.has(Ac(Y.activeWorkspaceId, t.id))),
		externalLocked: vs(),
		internalLocked: ys(),
		agents: ca(),
		selectedAgentId: Vl()?.id || "",
		chooserOpen: !!Y.agent.agentChooserOpen,
		sessionStarting: !!Y.agent.newSessionStarting,
		actionsOpen: !!Y.agent.sessionActionsOpen,
		canEndTurn: !!(t && (ll(t) || i)),
		endingTurn: i,
		closingSession: a,
		selfDrivingRemainsEnabled: ul(t),
		selfDrivingDisabling: !!Y.agent.selfDrivingDisabling,
		onDraft: (e, t) => Wc(e, t),
		onSend: pl,
		onOpenUpload: Yc,
		onToggleChooser: () => {
			Y.agent.newSessionStarting || !Hl().length || vs() || (Y.agent.agentChooserOpen = !Y.agent.agentChooserOpen, jc());
		},
		onChooseAgent: (e) => Kc(e).catch((e) => X(e.message)),
		onToggleActions: () => {
			Y.agent.sessionActionsOpen = !Y.agent.sessionActionsOpen, jc();
		},
		onResume: () => al().catch((e) => X(e.message)),
		onEndTurn: () => nl().catch((e) => X(e.message)),
		onCloseSession: Gc,
		onIconsChanged: Z
	});
}
function Mc(e) {
	return cl(e) ? e.status !== "starting" || Y.agent.events.some((e) => e.type === "session.state" && e.data?.state === "ready") ? !0 : Y.agent.eventsHasMore && e.status !== "starting" : !1;
}
function Nc(e, t = Mc(e)) {
	return vs() ? Ii : dl(e) ? "Ending the current turn." : t ? e.status === "stopping" ? "AgentHub is stopping the provider." : e.status === "recovering" ? "AgentHub event recovery is in progress." : e.status === "waiting_approval" ? "Resolve the pending approval before sending input." : "" : "Agent session is starting.";
}
function Pc(e) {
	return e?.name || e?.id || "Agent";
}
function Fc(e) {
	return !e?.selfDriving?.agentName && !(e?.selfDriving?.preferredAgentProfiles || []).length;
}
async function Ic(e = {}) {
	return fc(async () => {
		let t = Al(Y.selectedId), n = t ? Y.details[t.id] || t : null;
		if (!n || n.type !== "task") throw Error("Select a task first.");
		let r = e.enabled === void 0 || !!e.enabled;
		Y.agent.selfDrivingSaving = !0, xc(), jc(), Z();
		try {
			let n = {
				resourceId: t.id,
				enabled: r
			};
			e.configured && (n.agentName = String(e.agentName || "").trim(), n.prompt = String(e.runInstructions || ""), n.completionCriteria = String(e.completionCriteria || ""));
			let i = await ko(`/api/workspaces/${Y.activeWorkspaceId}/self-driving`, {
				method: "PUT",
				body: JSON.stringify(n)
			});
			await Promise.all([
				ac(),
				uc(),
				No(t.id, Y.activeWorkspaceId, { logsLimit: ji }).then((e) => {
					e && Y.activeWorkspaceId && zo(e, "head");
				})
			]), Ko(), X(r ? "Self-Driving enabled. The Scheduler will reconcile asynchronously." : i.notificationError ? `Self-Driving disabled. ${i.notificationError}` : "Self-Driving disabled. The current Turn and Session were left open.");
		} finally {
			Y.agent.selfDrivingSaving = !1, xc(), jc(), Z();
		}
	});
}
function Lc() {
	return {
		open: !1,
		identity: ++na,
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
function Rc(e) {
	return Y.agent.runs.find((t) => t.resourceId === e && cl(t) && t.status === "idle" && !t.schedulerTurn && String(t.agentHubSessionId || "").trim()) || null;
}
function zc() {
	let e = Al(Y.selectedId), t = e ? Y.details[e.id] || e : null;
	if (!e || !t || t.type !== "task") {
		X("Select a task first.");
		return;
	}
	let n = Rc(e.id), r = t.selfDriving || null, i = Hl(), a = String(r?.agentName || "").trim(), o = i.find((e) => String(e.id || "").trim().toLowerCase() === a.toLowerCase()), s = Vl(), c = String(n?.agentHubAgentName || o?.id || s?.id || "").trim();
	Y.modalEnter = "selfDriving", Y.selfDrivingDialog = {
		open: !0,
		identity: ++na,
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
	}, Vc();
}
function Bc() {
	let e = Y.selfDrivingDialog;
	if (!e.open || e.submitting) return;
	let t = e.returnFocus;
	Y.selfDrivingDialog = Lc(), Vc(), t && document.contains(t) && t.focus({ preventScroll: !0 });
}
function Vc() {
	let e = Y.selfDrivingDialog;
	Di.renderSelfDrivingDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${e.resourceId || ""}`,
		resourceId: e.resourceId || "",
		reuseCurrentSession: !!e.reuseCurrentSession,
		agents: ca(),
		draft: {
			agentName: e.agentName || "",
			runInstructions: e.runInstructions || ""
		},
		submitting: !!e.submitting,
		error: e.error || "",
		unknown: !!e.unknown,
		onClose: Bc,
		onSubmit: Hc,
		onIconsChanged: Z
	});
}
async function Hc(e) {
	let t = Y.selfDrivingDialog;
	if (!t.open || t.submitting || t.unknown) return;
	if (t.agentName = String(e?.agentName || t.agentName || "").trim(), t.runInstructions = String(e?.runInstructions || ""), !t.reuseCurrentSession && !t.agentName) {
		t.error = "Select an Agent before enabling Self-Driving.", Vc();
		return;
	}
	t.submitting = !0, t.error = "";
	let n = t.identity, r = Y.activeWorkspaceId, i = t.resourceId;
	Vc();
	try {
		if (await Ic({
			configured: !0,
			agentName: t.agentName,
			runInstructions: t.runInstructions,
			completionCriteria: t.completionCriteria
		}), n !== Y.selfDrivingDialog.identity || r !== Y.activeWorkspaceId || i !== Y.selectedId) return;
		let e = t.returnFocus;
		Y.selfDrivingDialog = Lc(), Vc(), e && document.contains(e) && e.focus({ preventScroll: !0 });
	} catch (e) {
		if (n !== Y.selfDrivingDialog.identity) return;
		t.submitting = !1;
		let r = e, i = fa(e, "Self-Driving could not be enabled.");
		t.error = i, t.unknown = !Number.isFinite(Number(r?.status)) || Number(r?.status) >= 500 || i.includes("outcome may be unknown") || i.includes("was updated but the start message failed"), Vc();
	}
}
function Uc() {
	let e = Y.settings.data || {
		workspaces: Y.config?.workspaces || [],
		activeId: Y.activeWorkspaceId,
		agents: Y.config?.agents || [],
		agentProfiles: Y.config?.agentProfiles || []
	}, t = e.agentHub || {}, n = t.status || {}, r = t.catalog || {
		providers: [],
		agents: []
	}, i = Y.notifications.settings || wa();
	Y.notifications.settings = i, Di.renderSettings({
		open: !!Y.settings.open,
		identity: `${Y.settings.identity || 0}`,
		dataVersion: Y.settings.dataVersion || 0,
		initialTab: Y.settings.tab || "workspace",
		workspaces: e.workspaces || [],
		activeWorkspaceId: e.activeId || Y.activeWorkspaceId,
		workspaceIcons: [Qi, ...$i],
		workspaceIconSavingId: Y.settings.workspaceIconSavingId || "",
		userName: ha(),
		agentHub: {
			configuredEndpoint: t.configuredEndpoint || "http://127.0.0.1:4646",
			connected: !!t.connected,
			compatible: !!t.compatible,
			error: t.error || "",
			apiVersion: n.apiVersion || "",
			version: n.version || "",
			capabilities: n.capabilities || [],
			providers: r.providers || [],
			agents: r.agents || []
		},
		profiles: (e.agentProfiles || []).map((e) => ({
			key: e.key || "",
			description: e.description || "",
			agentName: e.agentName || ""
		})),
		agents: ca(),
		notifications: {
			browser: !!i.browser,
			sound: !!i.sound,
			permission: Ea(),
			permissionError: Y.notifications.permissionError || "",
			soundError: Y.notifications.soundError || ""
		},
		onClose: Kl,
		onAddWorkspace: async (e) => {
			eu(e), await Zl();
		},
		onRemoveWorkspace: async (e, t) => {
			eu(t), await Ql(e);
		},
		onWorkspaceIcon: async (e, t, n) => {
			eu(n), await $l(e, t);
		},
		onSaveUser: async (e) => {
			let t = da(e);
			if (!ga(t)) throw Error("User name could not be saved in this browser.");
			return X(t === "User" ? "User name reset to User." : `User name saved as ${t}.`), t;
		},
		onSaveAgentHub: async (e) => {
			eu(e), await tu();
		},
		onBrowserNotifications: ao,
		onCompletionSound: so,
		onToast: X,
		onIconsChanged: Z
	});
}
function Wc(e, t) {
	!t || t.workspaceId !== Y.activeWorkspaceId || t.runId !== Y.agent.activeRunId || t.draftKey !== Y.agent.ttyDraftKey || wo(e);
}
function Gc() {
	if (!ul(sl())) {
		el().catch((e) => X(e.message));
		return;
	}
	if (window.confirm("Self-Driving is On. Close this Session while keeping Self-Driving On? The Scheduler may create a replacement Session.")) {
		el().catch((e) => X(e.message));
		return;
	}
	window.confirm("Disable Self-Driving and close this Session instead?") && tl().then(() => el()).catch((e) => X(e.message));
}
async function Kc(e = "") {
	if (!Y.agent.newSessionStarting) return fc(async () => {
		if (!Y.activeWorkspaceId) throw Error("Select a workspace first.");
		let t = Al(Y.selectedId);
		if (typeof vs == "function" && vs()) throw Error(Ii);
		let n = String(e || "").trim(), r = n ? Hl().find((e) => e.id === n) : Vl();
		if (!r) throw Error("Select an enabled agent first.");
		Y.agent.agentName = r.id, Y.agent.newSessionStarting = !0, jc(), Z();
		try {
			let e = await ko(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs`, {
				method: "POST",
				body: JSON.stringify({
					agentName: r.id,
					userName: ha(),
					resourceId: t?.id || "",
					title: t?.title || zl(),
					prompt: "",
					cwd: ml()
				})
			});
			Y.agent.draftPrompt = "", Y.agent.ttyDraft = "", Y.agent.ttyMultiline = !1, Y.agent.ttyDraftKey = "", Y.agent.ttyDraftWorkspaceId = "", Y.agent.ttyDraftResourceId = "", Y.agent.ttyDraftRunId = "", Y.agent.ttyDraftVersion++, Y.agent.optionsOpen = !1, Y.agent.agentChooserOpen = !1, Y.agent.historyOpen = !1, Y.agent.activeRunId = e.run.id, await Promise.all([ac(), uc()]), Ko(), X("Agent session started.");
		} finally {
			Y.agent.newSessionStarting = !1, jc(), Z();
		}
	});
}
function qc(e) {
	let t = Al(Y.selectedId), n = t ? Y.details[t.id] || t : null;
	if (!t || t.type !== "task" || !e || e.resourceId !== t.id) return null;
	let r = n?.selfDriving || null;
	return {
		resourceId: t.id,
		selfDrivingProjectionSet: !0,
		expectedSelfDrivingRevision: Number(r?.revision) || 0,
		expectedSelfDrivingCondition: String(r?.condition || "").trim().toLowerCase()
	};
}
async function Jc(e, t) {
	if (!t?.runId) throw Error("Start or select an agent run first.");
	if (typeof vs == "function" && vs()) throw Error(Ii);
	let n = sl();
	if (t.workspaceId !== Y.activeWorkspaceId || t.runId !== n?.id || t.resourceId !== (n.resourceId || "") || t.draftKey !== Y.agent.ttyDraftKey) throw Error("The selected Workspace or Session changed before the message could be sent.");
	let r = qc(n), i = {
		text: e,
		userName: ha()
	};
	return r && Object.assign(i, r), ko(`/api/workspaces/${t.workspaceId}/agent/runs/${t.runId}/input`, {
		method: "POST",
		body: JSON.stringify(i)
	});
}
function Yc() {
	let e = sl();
	if (!e || !cl(e)) {
		X("Start or resume an agent session before uploading files.");
		return;
	}
	let t = ki("ttyInput");
	t && wo(t.value), Y.modalEnter = "upload", Y.uploadDialog = {
		open: !0,
		identity: ++ra,
		runId: e.id,
		items: [],
		nextId: 1
	}, $c();
}
function Xc(e = [], t = {}) {
	if (!Y.uploadDialog.open) return;
	let n = t.workspaceId === Y.activeWorkspaceId && t.runId === Y.agent.activeRunId, r = e.length > 0 && n && Y.uploadDialog.runId === Y.agent.activeRunId;
	r && (wo(Qc(Y.agent.ttyDraft, e)), Y.agent.ttyDraftResetVersion++), Zc();
	let i = ki("ttyComposer");
	i && delete i.dataset.composerKey, jc({ skipDraftSync: r }), ki("ttyInput")?.focus({ preventScroll: !0 }), Z();
}
function Zc() {
	Y.uploadDialog = {
		open: !1,
		identity: ++ra,
		runId: "",
		items: [],
		nextId: 1
	}, $c();
}
function Qc(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function $c() {
	let e = Y.uploadDialog;
	Di.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${Y.activeWorkspaceId}:${e.runId || ""}`,
		workspaceId: Y.activeWorkspaceId,
		runId: e.runId || "",
		onDone: Xc,
		onIconsChanged: Z
	});
}
async function el() {
	if (!Y.agent.activeRunId || Y.agent.sessionStopping || Y.agent.turnStopping) return;
	let e = sl();
	if (!(!cl(e) || e.status === "stopping")) return fc(async () => {
		let e = Y.agent.activeRunId;
		Y.agent.sessionStopping = !0, Y.agent.sessionStoppingRunId = e, jc(), Z();
		try {
			await il(e), await Promise.all([ac(), uc()]), Ko(), X("Agent session closed. Self-Driving desired state was not changed.");
		} catch (e) {
			try {
				await Promise.all([ac(), uc()]), Ko();
			} catch {}
			throw e;
		} finally {
			Y.agent.sessionStopping = !1, Y.agent.sessionStoppingRunId = "", jc(), Z();
		}
	});
}
async function tl() {
	if (Y.agent.selfDrivingDisabling) return;
	let e = Al(Y.selectedId), t = e ? Y.details[e.id] || e : null;
	if (!(!t || t.type !== "task")) return fc(async () => {
		Y.agent.selfDrivingDisabling = !0, xc(), jc(), Z();
		try {
			let e = await ko(`/api/workspaces/${Y.activeWorkspaceId}/self-driving`, {
				method: "PUT",
				body: JSON.stringify({
					resourceId: t.id,
					enabled: !1
				})
			});
			await Promise.all([ac(), uc()]), Ko(), X(e.notificationError ? `Self-Driving disabled. ${e.notificationError}` : "Self-Driving disabled. The Agent Session remains open.");
		} catch (e) {
			try {
				await Promise.all([ac(), uc()]), Ko();
			} catch {}
			throw e;
		} finally {
			Y.agent.selfDrivingDisabling = !1, xc(), jc(), Z();
		}
	});
}
async function nl() {
	if (!(!Y.agent.activeRunId || Y.agent.turnStopping || Y.agent.sessionStopping) && ll(sl())) return fc(async () => {
		let e = Y.agent.activeRunId;
		Y.agent.turnStopping = !0, Y.agent.turnStoppingRunId = e, jc(), Z();
		try {
			await ko(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs/${e}/interrupt`, { method: "POST" }), await Promise.all([ac(), uc()]), Ko(), X("Turn ended. The AgentHub Session remains open.");
		} catch (e) {
			try {
				await Promise.all([ac(), uc()]), Ko();
			} catch {}
			throw e;
		} finally {
			Y.agent.turnStopping = !1, Y.agent.turnStoppingRunId = "", jc(), Z();
		}
	});
}
async function rl(e) {
	if (!(!e || e === Y.agent.activeRunId)) return fc(async () => {
		let t = Y.activeWorkspaceId;
		Do();
		let n = sl();
		Y.agent.activeRunId = e, Y.agent.switchingRunId = e, To();
		let r = Y.agent.runs.find((t) => t.id === e);
		r && Eo(r), Ko();
		try {
			if (n && cl(n) && !n.schedulerTurn) try {
				await il(n.id);
			} catch (r) {
				throw t === Y.activeWorkspaceId && Y.agent.activeRunId === e && (Y.agent.activeRunId = n.id, To(), Eo(n), Ko()), r;
			}
			if (t !== Y.activeWorkspaceId || Y.agent.activeRunId !== e) return;
			await Promise.all([ac(), uc()]), t === Y.activeWorkspaceId && Ko();
		} finally {
			Y.agent.switchingRunId === e && (Y.agent.switchingRunId = ""), xc();
		}
	});
}
async function il(e) {
	if (e) return ko(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs/${e}/stop`, { method: "POST" });
}
async function al() {
	if (Y.agent.activeRunId) return fc(async () => {
		if (typeof vs == "function" && vs()) throw Error(Ii);
		Do();
		let e = await ko(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs/${Y.agent.activeRunId}/resume`, { method: "POST" });
		Y.agent.activeRunId = e.run.id, Eo(e.run), Y.agent.historyOpen = !1, await Promise.all([ac(), uc()]), Ko(), X("Agent session resumed.");
	});
}
async function ol(e, t, n) {
	if (!e || !t) return;
	let r = Y.activeWorkspaceId;
	await ko(`/api/workspaces/${r}/agent/runs/${e}/approval`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), r === Y.activeWorkspaceId && (await ac(), Ko());
}
function sl() {
	return Y.agent.runs.find((e) => e.id === Y.agent.activeRunId) || null;
}
function cl(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(e?.status);
}
function ll(e) {
	return ["running", "waiting_approval"].includes(e?.status);
}
function ul(e) {
	let t = String(e?.resourceId || "").trim();
	return t ? !!Al(t)?.selfDriving?.enabled : !1;
}
function dl(e) {
	return !!(Y.agent.turnStopping && Y.agent.turnStoppingRunId === e?.id);
}
function fl(e) {
	return !!(Y.agent.sessionStopping && Y.agent.sessionStoppingRunId === e?.id);
}
async function pl(e, t) {
	let n = Ac(t?.workspaceId, t?.runId);
	if (Y.agent.sendingInputRunIds.has(n) || !String(e || "").trim()) return {
		accepted: !1,
		clear: !1
	};
	let r = sl();
	if (!r) return {
		accepted: !1,
		clear: !1
	};
	if (Eo(r), t.workspaceId !== Y.activeWorkspaceId || t.runId !== Y.agent.activeRunId || t.draftKey !== Y.agent.ttyDraftKey) throw Error("The selected Workspace or Session changed before the message could be sent.");
	wo(e);
	let i = t.workspaceId, a = t.runId, o = t.resourceId, s = t.draftKey, c = Y.agent.ttyDraftVersion;
	Y.agent.sendingInputRunIds.add(n);
	try {
		let n = await Jc(e, t), r = !1;
		if (n?.status === "accepted") {
			r = Oo({
				workspaceId: i,
				runId: a,
				key: s,
				text: e,
				version: c
			}), r && Y.agent.ttyDraftResetVersion++;
			try {
				typeof dc == "function" && await dc(i, o);
			} catch (e) {
				X(`Message accepted, but the view could not refresh: ${fa(e)}`);
			}
		}
		return {
			accepted: n?.status === "accepted",
			clear: r
		};
	} finally {
		Y.agent.sendingInputRunIds.delete(n), jc(), Z();
	}
}
function ml() {
	let e = Al(Y.selectedId);
	return e && e.path || "";
}
function hl() {
	return Y.selectedId === "workspace" ? "workspace" : Al(Y.selectedId)?.id || "";
}
function gl(e) {
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
function _l() {
	yl("project");
}
function vl(e) {
	yl("task", e);
}
function yl(e, t = "") {
	oa?.abort(), oa = null, sa = "", Y.modalEnter = "create", Y.createDialog = {
		open: !0,
		identity: ++ta,
		type: e,
		projectId: t,
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
	}, xl();
}
function bl() {
	Y.createDialog.submitting || (aa++, oa?.abort(), oa = null, sa = "", Y.createDialog = {
		open: !1,
		identity: ++ta,
		type: "",
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
	}, xl());
}
function xl() {
	let e = Y.createDialog;
	Di.renderCreateDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${e.type}:${e.projectId}`,
		workspaceId: Y.activeWorkspaceId,
		draft: Sl(e),
		templates: e.type === "task" && Y.details[e.projectId]?.templates || [],
		agents: ca(),
		profileKeys: (Y.config?.agentProfiles || []).map((e) => e.key),
		preview: e.preview,
		previewKey: e.previewKey || "",
		previewing: !!e.previewing,
		previewError: e.previewError || "",
		templateDigest: e.templateDigest || "",
		submitting: !!e.submitting,
		onClose: bl,
		onPreview: El,
		onSubmit: Dl,
		previewRequestKey: (t) => JSON.stringify(Tl({
			...e,
			...Cl(t),
			templateDigest: ""
		})),
		onConfirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?"),
		onIconsChanged: Z
	});
}
function Sl(e) {
	return {
		type: e.type === "task" ? "task" : "project",
		projectId: e.projectId || "",
		templateName: e.templateName || "",
		templateFields: { ...e.templateFields || {} },
		title: e.title || "",
		titleOverride: !!e.titleOverride,
		description: e.description || "",
		detail: e.detail || "",
		slug: e.slug || "",
		selfDriving: !!e.selfDriving,
		agentName: e.agentName || "",
		agentProfiles: (e.preferredAgentProfiles || []).join(", "),
		prompt: e.prompt || "",
		completionCriteria: e.completionCriteria || "",
		activeTab: e.activeTab === "preview" ? "preview" : "edit",
		editedMarkdown: e.editedMarkdown == null ? null : String(e.editedMarkdown),
		showOptions: !!e.showOptions
	};
}
function Cl(e) {
	return {
		type: e.type,
		projectId: e.projectId,
		templateName: e.templateName,
		templateFields: { ...e.templateFields || {} },
		title: e.title,
		titleOverride: !!e.titleOverride,
		description: e.description,
		detail: e.detail,
		slug: e.slug,
		selfDriving: !!e.selfDriving,
		agentName: e.agentName,
		preferredAgentProfiles: Ol(e.agentProfiles),
		prompt: e.prompt,
		completionCriteria: e.completionCriteria,
		activeTab: e.activeTab,
		editedMarkdown: e.editedMarkdown,
		showOptions: !!e.showOptions
	};
}
function wl(e) {
	!e || !Y.createDialog.open || (String(e.templateName || "") !== String(Y.createDialog.templateName || "") && (Y.createDialog.preview = null, Y.createDialog.templateDigest = "", Y.createDialog.previewError = "", Y.createDialog.previewKey = "", Y.createDialog.previewing = !1, aa++, oa?.abort(), oa = null, sa = ""), Object.assign(Y.createDialog, Cl(e)));
}
function Tl(e) {
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
async function El(e) {
	let t = Y.createDialog;
	if (wl(e), !t.open || !t.templateName) return null;
	let n = Tl({
		...t,
		templateDigest: ""
	}), r = JSON.stringify(n);
	if (t.previewing) {
		if (r === sa) return null;
		aa++, oa?.abort(), oa = null, sa = "", t.previewing = !1;
	}
	let i = (Y.details[t.projectId]?.templates || []).find((e) => e.name === t.templateName);
	if (i && !i.taskTitle && (!t.titleOverride || !String(t.title).trim())) return t.previewError = "This template does not generate a title. Enter a task title to render the preview.", xl(), null;
	t.previewing = !0, t.previewError = "";
	let a = Y.activeWorkspaceId, o = t.identity, s = ++aa;
	oa?.abort();
	let c = new AbortController();
	oa = c, sa = r, xl();
	try {
		let e = await ko(`/api/workspaces/${a}/tasks/preview`, {
			method: "POST",
			body: JSON.stringify(n),
			signal: c.signal
		});
		return s !== aa || o !== Y.createDialog.identity || a !== Y.activeWorkspaceId ? null : (t.preview = e, t.templateDigest = e.template?.digest || "", t.previewKey = JSON.stringify(n), e);
	} catch (e) {
		return c.signal.aborted || s !== aa || o !== Y.createDialog.identity || (t.previewError = fa(e)), null;
	} finally {
		s === aa && o === Y.createDialog.identity && (t.previewing = !1, oa === c && (oa = null), sa === r && (sa = ""), xl());
	}
}
async function Dl(e) {
	let t = Y.createDialog;
	if (!t.open || t.submitting) return;
	wl(e);
	let n = Y.activeWorkspaceId, r = t.identity;
	t.submitting = !0, xl();
	try {
		if (t.type === "project") await ko(`/api/workspaces/${n}/projects`, {
			method: "POST",
			body: JSON.stringify({
				description: t.description,
				slug: t.slug
			})
		}), X("Project created."), Y.selectedId = "workspace";
		else {
			let e, r = t.templateName && t.editedMarkdown != null && t.editedMarkdown !== t.preview?.markdown ? t.editedMarkdown : null;
			if (r != null) {
				let n = String(t.titleOverride ? t.title : t.preview?.title || "").trim();
				if (!n) throw Error("Task title is required when creating from edited preview content.");
				e = {
					project: t.projectId,
					title: n,
					taskMarkdown: r,
					slug: t.slug,
					selfDriving: t.selfDriving,
					agentName: t.selfDriving ? t.agentName : "",
					preferredAgentProfiles: t.selfDriving ? t.preferredAgentProfiles : [],
					prompt: t.selfDriving ? t.prompt : "",
					completionCriteria: t.selfDriving ? t.completionCriteria : ""
				};
			} else {
				if (t.templateName && !t.templateDigest && (await El(Sl(t)), !t.templateDigest)) throw Error(t.previewError || "Could not render the selected template.");
				e = Tl(t);
			}
			await ko(`/api/workspaces/${n}/tasks`, {
				method: "POST",
				body: JSON.stringify(e)
			}), X("Task created.");
		}
		if (Y.activeWorkspaceId !== n || Y.createDialog.identity !== r) return;
		Y.createDialog.open = !1, Y.createDialog.identity = ++ta, await jo();
	} catch (e) {
		Y.createDialog.identity === r && (t.submitting = !1, xl(), X(fa(e)));
	}
}
function Ol(e) {
	let t = /* @__PURE__ */ new Set();
	return String(e || "").split(",").map((e) => e.trim().toLowerCase()).filter((e) => !e || t.has(e) ? !1 : (t.add(e), !0));
}
async function kl(e) {
	confirm(`Archive ${e}?`) && (await ko(`/api/workspaces/${Y.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	}), X("Archived."), Y.selectedId = "workspace", await jo());
}
function Al(e) {
	if (!Y.tree) return null;
	for (let t of Y.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function jl() {
	return Y.selectedId === "workspace" || Al(Y.selectedId) ? !1 : (Y.selectedId = "workspace", !0);
}
function Ml(e) {
	if (!Y.tree) return null;
	for (let t of Y.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function Nl(e) {
	return Y.expandedProjects.has(e);
}
function Pl(e = !1) {
	let t = Ml(Y.selectedId);
	!t || t.id === Y.selectedId || Y.expandedProjects.has(t.id) || (Y.expandedProjects.add(t.id), e && Uo().catch((e) => X(e.message)));
}
function Fl(e = window.location.pathname) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: Il(t[1]),
		resourceId: t[2] === "r" ? Il(t[3]) : "workspace"
	} : {};
}
function Il(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function Ll(e) {
	return !!(e && Y.config?.workspaces.some((t) => t.id === e));
}
function Rl(e = {}) {
	if (!Y.activeWorkspaceId) return;
	let t = Y.selectedId && Y.selectedId !== "workspace" ? Y.selectedId : "", n = t ? `/w/${encodeURIComponent(Y.activeWorkspaceId)}/r/${encodeURIComponent(t)}` : `/w/${encodeURIComponent(Y.activeWorkspaceId)}`;
	(window.location.pathname !== n || Y.routeProjection.path !== n) && (Y.routeProjection = {
		path: n,
		revision: Y.routeProjection.revision + 1,
		replace: !!e.replace
	}, rs());
}
function zl() {
	return Y.config?.workspaces.find((e) => e.id === Y.activeWorkspaceId)?.name || "Workspace";
}
function Bl() {
	let e = Hl(), t = Ul();
	e.some((e) => e.id === Y.agent.agentName) || (Y.agent.agentName = t);
}
function Vl() {
	let e = Hl(), t = Y.agent.agentName || Ul();
	return e.find((e) => e.id === t) || e[0] || null;
}
function Hl() {
	return (Y.config?.agents || []).filter((e) => e.available !== !1);
}
function Ul() {
	let e = Hl();
	return Wl(Y.config?.agentProfiles, "default") || Wl(Y.settings.data?.agentProfiles, "default") || e[0]?.id || "";
}
function Wl(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function Gl(e = "workspace") {
	Y.modalEnter = "settings", Y.settings.open = !0, Y.settings.identity = ++ia, Y.settings.tab = e, Y.settings.agentDirty = !1, Y.settings.expandedAgents = /* @__PURE__ */ new Set(), Y.settings.workspaceIconPickerId = "", Y.settings.workspaceIconSavingId = "", await ql(), Uc();
}
function Kl(e = Y.settings.agentDirty) {
	Y.settings.open && e && !window.confirm("Discard unsaved agent settings changes?") || (Y.settings.open = !1, Y.settings.identity = ++ia, Y.settings.agentDirty = !1, Uc());
}
async function ql() {
	let [e, t] = await Promise.all([ko("/api/settings"), ko("/api/settings/agenthub")]), n = (t.catalog?.agents || []).map((e) => ({
		...e,
		id: e.name
	}));
	Y.settings.data = {
		...e,
		agentHub: t,
		agents: n,
		agentProfiles: t.config?.agentProfiles || []
	}, Y.config = Jl({
		...Y.config || {},
		...e
	}, t), Y.settings.dataVersion = (Y.settings.dataVersion || 0) + 1;
}
function Jl(e, t) {
	let n = (t.catalog?.agents || []).filter((e) => e.available !== !1).map((e) => ({
		...e,
		id: e.name
	}));
	return {
		...e,
		agents: n,
		agentHubProviders: t.catalog?.providers || [],
		agentProfiles: t.config?.agentProfiles || []
	};
}
function Yl() {
	let e = Y.settings.data || {};
	return {
		agents: e.agents || [],
		agentProfiles: e.agentProfiles || []
	};
}
async function Xl() {
	let e = Y.settings.agentDirty ? Yl() : null;
	await ql(), e && (Y.settings.data = {
		...Y.settings.data || {},
		...e
	});
}
async function Zl() {
	let e = Y.settings.workspacePath.trim();
	if (!e) throw Error("Workspace path is required.");
	let t = Y.settings.createWorkspace, n = await ko("/api/workspaces", {
		method: "POST",
		body: JSON.stringify({
			path: e,
			create: t
		})
	});
	Do(), Y.settings.workspacePath = "", Y.settings.createWorkspace = !1, Y.config = await ko("/api/workspaces"), Y.activeWorkspaceId = n.id, hc(), Qo(), await Ho(), await jo(), await Xl(), Uc(), X(t ? "Workspace created." : "Workspace added.");
}
async function Ql(e) {
	e && (Do(), await ko(`/api/workspaces/${encodeURIComponent(e)}`, { method: "DELETE" }), Y.config = await ko("/api/workspaces"), Y.activeWorkspaceId === e ? (Y.activeWorkspaceId = Y.config.activeId || Y.config.workspaces[0]?.id || "", Y.selectedId = "workspace", hc(), Y.activeWorkspaceId ? (await Ho(), await jo()) : (Y.tree = null, Y.details = {}, Ko())) : Qo(), await Xl(), Uc(), X("Workspace removed from Forge GUI."));
}
async function $l(e, t) {
	if (!(!e || Y.settings.workspaceIconSavingId)) {
		Y.settings.workspaceIconSavingId = e, Y.settings.workspaceIconPickerId = "", Uc();
		try {
			let n = await ko(`/api/workspaces/${encodeURIComponent(e)}`, {
				method: "PUT",
				body: JSON.stringify({ icon: t || "" })
			}), r = (e) => (e || []).map((e) => e.id === n.id ? n : e);
			Y.config = {
				...Y.config || {},
				workspaces: r(Y.config?.workspaces)
			}, Y.settings.data = {
				...Y.settings.data || {},
				workspaces: r(Y.settings.data?.workspaces)
			}, Y.settings.workspaceIconPickerId = "", Qo(), X(t ? "Workspace icon saved." : "Workspace icon reset to the Forge default.");
		} finally {
			Y.settings.workspaceIconSavingId = "", Uc();
		}
	}
}
function eu(e) {
	!e || !Y.settings.open || (Y.settings.tab = e.tab || Y.settings.tab, Y.settings.workspacePath = String(e.workspacePath || ""), Y.settings.createWorkspace = !!e.createWorkspace, Y.settings.agentDirty = !!e.dirty, Y.settings.data = {
		...Y.settings.data || {},
		agentHub: {
			...Y.settings.data?.agentHub || {},
			configuredEndpoint: String(e.endpoint || "")
		},
		agentProfiles: (e.profiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		}))
	});
}
async function tu() {
	let e = Y.settings.data || {};
	await ko("/api/settings/agenthub", {
		method: "PUT",
		body: JSON.stringify({
			endpoint: e.agentHub?.configuredEndpoint || "http://127.0.0.1:4646",
			agentProfiles: (e.agentProfiles || []).map((e) => ({
				key: e.key,
				description: e.description,
				agentName: e.agentName
			}))
		})
	}), await ql(), Y.config = Jl(await ko("/api/workspaces"), Y.settings.data.agentHub), Y.settings.agentDirty = !1, Bl(), xc(), jc(), Uc(), Z(), X("AgentHub settings saved.");
}
function nu(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var ru = 0;
function X(e) {
	Di.renderToast({
		message: String(e || ""),
		revision: ++ru
	});
}
function Z() {
	let e = window.lucide;
	!e || Y.iconRefreshScheduled || (Y.iconRefreshScheduled = !0, Oi?.animationFrame(() => {
		Y.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function iu(e) {
	Z(), e === "markdown" && window.marked && window.DOMPurify && (Us(), Z()), e === "diff" && Us();
}
window.forgeAssetLoaded = iu;
function au() {
	let e = yu();
	Y.paneSizes = xu(e, 0), hu(), vu(e.detailsWidth) && !vu(e.chatWidth) && !Cu() && (Y.paneSizes = xu(e, Su()), hu(), _u());
}
function ou(e, t) {
	document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
}
var su = 8, cu = 220, lu = 360, uu = 320, du = 1e4, fu = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarSessionHeight: 210
}), pu = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarSessionHeight: "--sidebar-session-height"
});
function mu(e, t) {
	if (!Object.hasOwn(pu, e) || !Number.isFinite(t)) return;
	let n = Math.round(Tu(t, e === "sidebarWidth" ? cu : e === "chatWidth" ? uu : 84, du));
	Y.paneSizes[e] = n, ou(pu[e], n);
}
function hu() {
	for (let e of Object.keys(pu)) mu(e, Y.paneSizes[e]);
}
function gu(e) {
	if (!Object.hasOwn(pu, e)) return;
	let t = yu();
	delete t.detailsWidth;
	for (let e of Object.keys(pu)) vu(t[e]) || (t[e] = Y.paneSizes[e]);
	t[e] = Y.paneSizes[e], localStorage.setItem(Pi, JSON.stringify(t));
}
function _u() {
	localStorage.setItem(Pi, JSON.stringify({ ...Y.paneSizes }));
}
function vu(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function yu() {
	try {
		let e = JSON.parse(localStorage.getItem(Pi) || "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? e : {};
	} catch {
		return {};
	}
}
function bu(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...fu };
	if (vu(n.sidebarWidth) && (r.sidebarWidth = Tu(n.sidebarWidth, cu, du)), vu(n.chatWidth)) r.chatWidth = Tu(n.chatWidth, uu, du);
	else if (vu(n.detailsWidth) && t >= 688) {
		let e = Tu(n.detailsWidth, lu, t - su - uu);
		r.chatWidth = Tu(t - su - e, uu, du);
	}
	return vu(n.sidebarSessionHeight) && (r.sidebarSessionHeight = Tu(n.sidebarSessionHeight, 84, du)), r;
}
function xu(e = yu(), t = Su()) {
	return bu(e, t);
}
function Su() {
	return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
}
function Cu() {
	return Eu !== void 0 && Eu.matches;
}
function wu() {
	if (Cu()) return;
	let e = yu();
	vu(e.detailsWidth) && !vu(e.chatWidth) && (Y.paneSizes = bu(e, Su()), hu(), _u());
}
function Tu(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
var Eu = window.matchMedia("(max-width: 980px)");
function Du(e) {
	Y.mobile.sidebarOpen = !!e, document.body.classList.toggle("mobile-sidebar-open", Y.mobile.sidebarOpen), rs();
}
function Ou(e) {
	Y.mobile.view = e === "chat" ? "chat" : "details";
	let t = Y.mobile.view === "chat";
	document.body.classList.toggle("mobile-chat-active", t), rs();
}
function ku() {
	try {
		return localStorage.getItem(Fi) === "1";
	} catch {
		return !1;
	}
}
function Au(e) {
	Y.mobile.immersive = !!e, document.body.classList.toggle("chat-immersive", Y.mobile.immersive);
	try {
		localStorage.setItem(Fi, Y.mobile.immersive ? "1" : "0");
	} catch {}
	rs();
}
function ju() {
	Oi?.listen(document, "selectionchange", () => {
		if (!Y.agent.renderDeferredForSelection) return;
		let e = ki("ttyLog");
		e && Oc(e) || (Y.agent.renderDeferredForSelection = !1, kc(), Z());
	}), Oi?.listen(document, "keydown", (e) => {
		e.key === "Escape" && Y.diff ? Qs() : e.key === "Escape" && Y.preview ? Zs() : e.key === "Escape" && (Y.agent.optionsOpen || Y.agent.agentChooserOpen || Y.agent.historyOpen) && (Y.agent.optionsOpen = !1, Y.agent.agentChooserOpen = !1, Y.agent.historyOpen = !1, xc(), jc(), Z());
	}), Oi?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Ws(n.dataset.breadcrumbResource).catch((e) => X(e.message));
			return;
		}
		let r = Y.agent.agentChooserOpen && t && !t.closest(".tty-new-session-control"), i = (Y.agent.optionsOpen || Y.agent.historyOpen) && t && !t.closest(".agent-actions") && !t.closest(".agent-sessions") && !t.closest(".tty-composer");
		(r || i) && (Y.agent.optionsOpen = !1, Y.agent.agentChooserOpen = !1, Y.agent.historyOpen = !1, xc(), jc(), Z()), Y.sessionMenu && (t?.closest(".session-row") || t?.closest(".session-resource-menu") || (Y.sessionMenu = null, Ps(), Z()));
	}), Oi?.listen(window, "beforeunload", Pu), Oi?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && Pu();
	});
}
var Mu = !1;
function Nu(e) {
	if (Di = e, Mu) {
		la();
		return;
	}
	Mu = !0, Oi = new Ei(), ju(), au(), lo(), Y.user.name = ma(), _a(), Y.mobile.immersive = ku(), rs(), Ao().catch((e) => {
		Y.navigationLoading = !1, Y.navigationError = e.message, X(e.message), Ko();
	}), Wo();
}
function Pu() {
	Do();
}
function Fu() {
	Mu && (Pu(), Mu = !1, gc(), ka(), yc(), oa?.abort(), oa = null, Oi?.dispose(), Oi = null, Y.autoRefreshTimer = null);
}
async function Iu(e) {
	let t = Fl(e);
	if (!Ll(t.workspaceId)) {
		Rl({ replace: !0 });
		return;
	}
	let n = Y.activeWorkspaceId !== t.workspaceId, r = Y.selectedId;
	Do(), Y.navigationVersion++, Y.autoRefreshVersion++, Y.treeRequestVersion++, Y.detailRequestVersion++, Y.workspaceAgentsRequestVersion++, Y.previewRequestVersion++, Y.diffRequestVersion++, Y.workspaceAgentsSaving = !1;
	let i = Y.navigationVersion;
	if (Y.activeWorkspaceId = t.workspaceId, Y.selectedId = t.resourceId || "workspace", !n && r !== Y.selectedId && Y.selectedId !== "workspace" && (Po(Y.selectedId), delete Y.details[Y.selectedId]), Y.preview = null, Y.diff = null, Y.sessionMenu = null, n && (Y.tree = null, Y.navigationLoading = !0, Y.navigationError = "", Js(), Y.workspaceAgentsSaving = !1, bl(), Da(Y.activeWorkspaceId)), n && hc(), Qo(), n) {
		if (!await Ho(t.workspaceId, i)) return;
		!t.resourceId && Y.lastResourceId && (Y.selectedId = Y.lastResourceId), await jo({ updateURL: !1 }), Jo(t.workspaceId, i) && Rl({ replace: !0 });
	} else {
		let e = jl();
		if (Y.selectedId === "workspace" ? await Vo() : (Pl(!1), await Mo(Y.selectedId)), !Jo(t.workspaceId, i)) return;
		r !== Y.selectedId && await mc(), Ko(), e && Rl({ replace: !0 });
	}
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/components/Icon.svelte
var Lu = /* @__PURE__ */ H("<i></i>");
function Q(e, t) {
	let n = Ci(t, "className", 3, "");
	var r = Lu();
	L(() => {
		J(r, "data-lucide", t.name), q(r, 1, Yr(n()));
	}), U(e, r);
}
//#endregion
//#region src/components/AppShell.svelte
var Ru = /* @__PURE__ */ H("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), zu = /* @__PURE__ */ H("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), Bu = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), Vu = /* @__PURE__ */ H("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Hu = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Uu = /* @__PURE__ */ H("<span><!></span>"), Wu = /* @__PURE__ */ H("<span aria-hidden=\"true\"><!><!></span>"), Gu = /* @__PURE__ */ H("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), Ku = /* @__PURE__ */ H("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), qu = /* @__PURE__ */ H("<div class=\"task-group\"></div>"), Ju = /* @__PURE__ */ H("<button type=\"button\"><span class=\"chevron\"><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), Yu = /* @__PURE__ */ H("<div class=\"session-row muted-row\"><!><div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>"), Xu = /* @__PURE__ */ H("<span class=\"session-unread-badge\" aria-label=\"Unread turn completion\">New</span>"), Zu = /* @__PURE__ */ H("<button type=\"button\"><!><span><strong> </strong><small> </small></span></button>"), Qu = /* @__PURE__ */ H("<div class=\"session-resource-menu\"></div>"), $u = /* @__PURE__ */ H("<button type=\"button\"><!> <div class=\"session-title\"><strong> </strong><span> </span></div> <span> </span> <!> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), ed = /* @__PURE__ */ H("<header class=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" class=\"mobile-icon-button mobile-immersive-button\" type=\"button\" aria-label=\"Toggle immersive chat\"><!></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" type=\"button\" aria-label=\"Close navigation\"></button> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div></div> <section class=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" class=\"workspace-switcher-button\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <!></button> <!></div></section> <section class=\"tree-section\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section> <div id=\"sessionResize\" class=\"resize-handle horizontal-resize sidebar-session-resize\" role=\"separator\" aria-orientation=\"horizontal\" aria-label=\"Resize sessions panel\"></div> <section class=\"session-section\"><div class=\"section-title\"><span>Sessions</span></div> <div id=\"sessionList\" class=\"session-list\"><!></div></section> <div class=\"sidebar-footer\"><button id=\"systemSettingsButton\" type=\"button\"><!><span>Settings</span></button></div></aside> <div id=\"sidebarResize\" class=\"resize-handle sidebar-resize\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"Resize sidebar\"></div> <main class=\"workspace-panel\"><section id=\"detailsPanel\" class=\"details-panel\"></section> <div id=\"detailsResize\" class=\"resize-handle details-resize\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"Resize chat panel\"></div> <aside id=\"agentPanel\" class=\"agent-panel\"><div id=\"agentControls\" class=\"agent-actions\"></div><div id=\"selfDrivingBarWrap\" class=\"self-driving-bar-wrap\"></div><div id=\"agentSessionsWrap\" class=\"agent-sessions\"></div><div class=\"tty-panel\"><div id=\"ttyLog\" class=\"tty-log\"></div><div id=\"ttyComposer\" class=\"tty-composer\"></div></div></aside></main>", 1);
function td(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(!1), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ N(null), s = /* @__PURE__ */ N(null), c = null, l = /* @__PURE__ */ N(0), u = /* @__PURE__ */ j(() => B(n).workspaces.find((e) => e.id === B(n).activeWorkspaceId) ?? null);
	wi(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== B(n).identity;
			P(n, e, !0), t && (P(r, !1), P(i, ""), P(a, ""), _()), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			B(r) && !t?.closest(".workspace-select-row") && P(r, !1), B(i) && !t?.closest(".session-row") && !t?.closest(".session-resource-menu") && P(i, "");
		}, s = (e) => {
			e.key === "Escape" && (B(n).mobile.sidebarOpen ? B(n).onMobileSidebar(!1) : B(r) ? P(r, !1) : B(i) && P(i, ""));
		}, l = () => {
			B(n).onHistoryNavigation(window.location.pathname).catch((e) => {
				B(n).onToast(e instanceof Error ? e.message : String(e));
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
			B(n).onPaneViewport(), p();
		};
		return document.addEventListener("mousedown", o), document.addEventListener("keydown", s), document.addEventListener("focusout", v), window.addEventListener("resize", y), window.addEventListener("orientationchange", v), window.addEventListener("popstate", l), u?.addEventListener("resize", p), u?.addEventListener("scroll", p), f.addEventListener?.("change", y), p(), () => {
			e(), c?.(), _(), document.removeEventListener("mousedown", o), document.removeEventListener("keydown", s), document.removeEventListener("focusout", v), window.removeEventListener("resize", y), window.removeEventListener("orientationchange", v), window.removeEventListener("popstate", l), u?.removeEventListener("resize", p), u?.removeEventListener("scroll", p), f.removeEventListener?.("change", y), h(), document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
		};
	}), Sn(() => {
		document.body.classList.toggle("mobile-sidebar-open", B(n).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", B(n).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", B(n).mobile.immersive);
	}), Sn(() => {
		let e = B(n).route;
		!e.path || e.revision <= B(l) || (P(l, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	function d(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function f(e) {
		return !B(s) || B(s).id !== e ? "" : B(s).after ? "drop-after" : "drop-before";
	}
	function p(e) {
		return !B(o) || B(o).id === e.id || B(o).kind !== e.kind ? !1 : e.kind !== "task" || B(o).projectId === e.projectId;
	}
	function m(e, t) {
		e.stopPropagation(), P(o, t, !0), P(s, null), B(n).onDragState(t), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", t.id));
	}
	function h(e, t) {
		if (!p(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		P(s, {
			id: t.id,
			after: e.clientY > n.top + n.height / 2
		}, !0);
	}
	async function g(e, t) {
		if (e.preventDefault(), !B(o) || !p(t)) return;
		let r = B(o), i = B(s)?.id === t.id && B(s).after;
		_();
		try {
			await B(n).onReorder(r, t, i);
		} catch (e) {
			B(n).onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function _() {
		B(o) && B(n).onDragState(null), P(o, null), P(s, null);
	}
	async function v(e) {
		if (!(!e || B(a))) {
			P(a, e, !0), P(r, !1);
			try {
				await B(n).onSwitchWorkspace(e);
			} catch (e) {
				B(n).onToast(e instanceof Error ? e.message : String(e));
			} finally {
				P(a, "");
			}
		}
	}
	async function y(e) {
		if (e) {
			P(i, "");
			try {
				await B(n).onSelectResource(e);
			} catch (e) {
				B(n).onToast(e instanceof Error ? e.message : String(e));
			}
		}
	}
	async function b(e, t) {
		let r = e.target instanceof Element ? e.target : null;
		if (!r?.closest(".drag-handle")) {
			if (t.type === "project" && r?.closest("[data-project-toggle]")) {
				try {
					await B(n).onToggleProject(t.id);
				} catch (e) {
					B(n).onToast(e instanceof Error ? e.message : String(e));
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
			t.menu && P(i, B(i) === t.id ? "" : t.id, !0);
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
				B(n).onPanePreview(t, Math.min(r, Math.max(220, f + e.clientX - u)));
			} else if (t === "chatWidth") {
				let r = Math.max(320, o.getBoundingClientRect().width - 360 - 8);
				B(n).onPanePreview(t, Math.min(r, Math.max(320, p - (e.clientX - u))));
			} else {
				let r = Math.max(120, a.getBoundingClientRect().height - 250);
				B(n).onPanePreview(t, Math.min(r, Math.max(84, m - (e.clientY - d))));
			}
		}, _ = () => {
			r.classList.remove("dragging"), document.body.classList.remove(h), window.removeEventListener("pointermove", g), window.removeEventListener("pointerup", _), window.removeEventListener("pointercancel", _), c = null, B(n).onPaneCommit(t);
		};
		c = _, window.addEventListener("pointermove", g), window.addEventListener("pointerup", _, { once: !0 }), window.addEventListener("pointercancel", _, { once: !0 });
	}
	var C = ed(), w = fn(C), T = F(w);
	Q(F(T), { name: "menu" }), k(T);
	var E = I(T, 2), ee = F(E), te = I(ee, 2);
	k(E);
	var ne = I(E, 2), re = F(ne);
	{
		let e = /* @__PURE__ */ j(() => B(n).mobile.immersive ? "minimize-2" : "maximize-2");
		Q(re, { get name() {
			return B(e);
		} });
	}
	k(ne), k(w);
	var ie = I(w, 2), ae = I(ie, 2), oe = F(ae), se = I(F(oe)), ce = I(F(se)), le = F(ce, !0);
	k(ce), k(se), k(oe);
	var ue = I(oe, 2), de = F(ue), fe = F(de), pe = F(fe), me = F(pe);
	k(pe);
	var he = I(pe, 2), ge = F(he, !0);
	k(he);
	var _e = I(he, 2);
	{
		let e = /* @__PURE__ */ j(() => B(a) ? "loader-circle" : "chevrons-up-down");
		Q(_e, {
			get name() {
				return B(e);
			},
			className: "select-icon"
		});
	}
	k(fe);
	var ve = I(fe, 2), ye = (e) => {
		var t = zu(), i = I(F(t), 2);
		K(i, 17, () => B(n).workspaces, (e) => e.id, (e, t) => {
			var r = Ru(), i = F(r), o = F(i);
			k(i);
			var s = I(i, 2), c = F(s), l = F(c, !0);
			k(c);
			var u = I(c), d = F(u, !0);
			k(u), k(s);
			var f = I(s, 2), p = (e) => {
				Q(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			G(f, (e) => {
				B(t).id === B(n).activeWorkspaceId && e(p);
			}), k(r), L((e) => {
				J(r, "aria-selected", B(t).id === B(n).activeWorkspaceId), J(r, "data-workspace-id", B(t).id), r.disabled = e, J(o, "src", B(t).iconSrc), W(l, B(t).name || B(t).id), W(d, B(t).path);
			}, [() => !!B(a)]), V("click", r, () => v(B(t).id)), U(e, r);
		});
		var o = I(i, 2), s = F(o);
		Q(F(s), { name: "plus" }), A(), k(s), k(o), k(t), V("click", s, () => {
			P(r, !1), B(n).onAddWorkspace();
		}), U(e, t);
	};
	G(ve, (e) => {
		B(r) && e(ye);
	}), k(de), k(ue);
	var be = I(ue, 2), xe = F(be), Se = I(F(xe));
	Q(F(Se), { name: "plus" }), k(Se), k(xe);
	var Ce = I(xe, 2), we = F(Ce), Te = (e) => {
		var t = Bu();
		Q(F(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(2), k(t), U(e, t);
	}, Ee = (e) => {
		var t = Vu(), r = F(t);
		Q(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = I(r, 2), a = F(i, !0);
		k(i), k(t), L(() => W(a, B(n).error)), U(e, t);
	}, De = (e) => {
		var t = Hu();
		Q(F(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(t), U(e, t);
	}, Oe = (e) => {
		var t = Ar();
		K(fn(t), 17, () => B(n).projects, (e) => e.id, (e, t) => {
			var n = Ju(), r = fn(n), i = F(r), a = F(i), s = (e) => {
				{
					let n = /* @__PURE__ */ j(() => B(t).expanded ? "chevron-down" : "chevron-right");
					Q(e, { get name() {
						return B(n);
					} });
				}
			};
			G(a, (e) => {
				B(t).children.length && e(s);
			}), k(i);
			var c = I(i, 2), l = (e) => {
				var n = Wu(), r = F(n);
				K(r, 17, () => B(t).status.statuses, (e) => e.key, (e, t) => {
					var n = Uu();
					Q(F(n), {
						get name() {
							return B(t).iconName;
						},
						className: "task-status-icon"
					}), k(n), L(() => q(n, 1, `task-status-indicator ${B(t).className} ${B(t).recentOutput ? "task-status-fresh" : ""}`)), U(e, n);
				});
				var i = I(r), a = (e) => {
					var n = Uu();
					Q(F(n), {
						name: "lock",
						className: "task-lock-icon"
					}), k(n), L(() => q(n, 1, `task-lock-indicator ${B(t).status.lock.className}`)), U(e, n);
				};
				G(i, (e) => {
					B(t).status.lock && e(a);
				}), k(n), L(() => q(n, 1, `task-status-slot ${B(t).status.slotClassName}`)), U(e, n);
			};
			G(c, (e) => {
				B(t).status.hasTaskState && e(l);
			});
			var u = I(c, 2);
			Q(u, {
				name: "folder",
				className: "tree-icon"
			});
			var p = I(u, 2), v = F(p), y = F(v, !0);
			k(v);
			var x = I(v), S = F(x, !0);
			k(x);
			var C = I(x), w = (e) => {
				var n = Gu(), r = F(n), i = F(r, !0);
				k(r);
				var a = I(r, 2), o = F(a, !0);
				k(a), k(n), L(() => {
					W(i, B(t).summary.taskLabel), W(o, B(t).summary.runningLabel);
				}), U(e, n);
			};
			G(C, (e) => {
				B(t).summary && !B(t).expanded && e(w);
			}), k(p);
			var T = I(p, 2);
			Q(F(T), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), k(T), k(r);
			var E = I(r, 2), ee = (e) => {
				var n = qu();
				K(n, 21, () => B(t).children, (e) => e.id, (e, n) => {
					var r = Ku(), i = I(F(r), 2), a = (e) => {
						var t = Wu(), r = F(t);
						K(r, 17, () => B(n).status.statuses, (e) => e.key, (e, t) => {
							var n = Uu();
							Q(F(n), {
								get name() {
									return B(t).iconName;
								},
								className: "task-status-icon"
							}), k(n), L(() => q(n, 1, `task-status-indicator ${B(t).className} ${B(t).recentOutput ? "task-status-fresh" : ""}`)), U(e, n);
						});
						var i = I(r), a = (e) => {
							var t = Uu();
							Q(F(t), {
								name: "lock",
								className: "task-lock-icon"
							}), k(t), L(() => q(t, 1, `task-lock-indicator ${B(n).status.lock.className}`)), U(e, t);
						};
						G(i, (e) => {
							B(n).status.lock && e(a);
						}), k(t), L(() => q(t, 1, `task-status-slot ${B(n).status.slotClassName}`)), U(e, t);
					};
					G(i, (e) => {
						B(n).status.hasTaskState && e(a);
					});
					var s = I(i, 2);
					Q(s, {
						name: "file-text",
						className: "tree-icon"
					});
					var c = I(s), l = F(c), u = F(l, !0);
					k(l);
					var p = I(l), v = F(p, !0);
					k(p), k(c);
					var y = I(c, 2);
					Q(F(y), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), k(y), k(r), L((e) => {
						q(r, 1, e), J(r, "aria-label", B(n).ariaLabel || void 0), J(r, "title", B(n).statusLabel || void 0), W(u, B(n).title), W(v, B(n).ref);
					}, [() => `tree-item task-item ${d(B(n).status)} ${B(n).active ? "active" : ""} ${B(o)?.id === B(n).id ? "drag-source" : ""} ${f(B(n).id)}`]), V("click", r, (e) => b(e, B(n))), xr("dragover", r, (e) => h(e, {
						kind: "task",
						id: B(n).id,
						projectId: B(t).id
					})), xr("drop", r, (e) => g(e, {
						kind: "task",
						id: B(n).id,
						projectId: B(t).id
					})), xr("dragstart", y, (e) => m(e, {
						kind: "task",
						id: B(n).id,
						projectId: B(t).id
					})), xr("dragend", y, _), U(e, r);
				}), k(n), U(e, n);
			};
			G(E, (e) => {
				B(t).expanded && e(ee);
			}), L((e) => {
				q(r, 1, e), J(r, "aria-label", B(t).ariaLabel || void 0), J(r, "title", B(t).statusLabel || void 0), J(i, "data-project-toggle", B(t).children.length ? B(t).id : void 0), W(y, B(t).title), W(S, B(t).ref);
			}, [() => `tree-item ${d(B(t).status)} ${B(t).active ? "active" : ""} ${B(o)?.id === B(t).id ? "drag-source" : ""} ${f(B(t).id)}`]), V("click", r, (e) => b(e, B(t))), xr("dragover", r, (e) => h(e, {
				kind: "project",
				id: B(t).id,
				projectId: ""
			})), xr("drop", r, (e) => g(e, {
				kind: "project",
				id: B(t).id,
				projectId: ""
			})), xr("dragstart", T, (e) => m(e, {
				kind: "project",
				id: B(t).id,
				projectId: ""
			})), xr("dragend", T, _), U(e, n);
		}), U(e, t);
	};
	G(we, (e) => {
		B(n).loading ? e(Te) : B(n).error ? e(Ee, 1) : B(n).projects.length === 0 ? e(De, 2) : e(Oe, -1);
	}), k(Ce), k(be);
	var ke = I(be, 2), Ae = I(ke, 2), je = I(F(Ae), 2), Me = F(je), D = (e) => {
		var t = Yu();
		Q(F(t), { name: "message-square" }), A(), k(t), U(e, t);
	}, Ne = (e) => {
		var t = Ar();
		K(fn(t), 17, () => B(n).sessions, (e) => e.id, (e, t) => {
			var n = $u(), r = fn(n), a = F(r), s = (e) => {
				var n = Wu(), r = F(n);
				K(r, 17, () => B(t).status.statuses, (e) => e.key, (e, t) => {
					var n = Uu();
					Q(F(n), {
						get name() {
							return B(t).iconName;
						},
						className: "task-status-icon"
					}), k(n), L(() => q(n, 1, `task-status-indicator ${B(t).className} ${B(t).recentOutput ? "task-status-fresh" : ""}`)), U(e, n);
				});
				var i = I(r), a = (e) => {
					var n = Uu();
					Q(F(n), {
						name: "lock",
						className: "task-lock-icon"
					}), k(n), L(() => q(n, 1, `task-lock-indicator ${B(t).status.lock.className}`)), U(e, n);
				};
				G(i, (e) => {
					B(t).status.lock && e(a);
				}), k(n), L(() => q(n, 1, `task-status-slot session-status-icon ${B(t).status.slotClassName}`)), U(e, n);
			};
			G(a, (e) => {
				B(t).status.hasTaskState && e(s);
			});
			var c = I(a, 2), l = F(c), u = F(l, !0);
			k(l);
			var p = I(l), v = F(p, !0);
			k(p), k(c);
			var b = I(c, 2), S = F(b, !0);
			k(b);
			var C = I(b, 2), w = (e) => {
				U(e, Xu());
			};
			G(C, (e) => {
				B(t).unread && e(w);
			});
			var T = I(C, 2);
			Q(F(T), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), k(T), k(r);
			var E = I(r, 2), ee = (e) => {
				var n = Qu();
				K(n, 21, () => B(t).controls, (e) => e.resourceId, (e, t) => {
					var n = Zu(), r = F(n);
					Q(r, { name: "corner-down-right" });
					var i = I(r), a = F(i), o = F(a, !0);
					k(a);
					var s = I(a), c = F(s, !0);
					k(s), k(i), k(n), L(() => {
						n.disabled = !B(t).navigable, W(o, B(t).resourceId), W(c, B(t).path);
					}), V("click", n, () => y(B(t).resourceId)), U(e, n);
				}), k(n), L(() => J(n, "data-session-menu", B(t).id)), U(e, n);
			};
			G(E, (e) => {
				B(i) === B(t).id && B(t).menu && e(ee);
			}), L((e) => {
				q(r, 1, e), J(r, "aria-label", `${B(t).title}. ${B(t).statusLabel}`), J(r, "title", B(t).statusLabel), W(u, B(t).title), W(v, B(t).meta), q(b, 1, `session-badge ${B(t).source === "internal" ? "internal" : "external"}`), W(S, B(t).label);
			}, [() => `session-row ${B(t).source === "internal" ? "internal-session" : "external-session"} ${d(B(t).status)} ${B(t).clickable ? "clickable-session" : ""} ${B(t).current ? "current-session" : ""} ${B(t).unread ? "session-unread" : ""} ${B(o)?.id === B(t).id ? "drag-source" : ""} ${f(B(t).id)}`]), V("click", r, (e) => x(e, B(t))), xr("dragover", r, (e) => h(e, {
				kind: "session",
				id: B(t).id,
				projectId: ""
			})), xr("drop", r, (e) => g(e, {
				kind: "session",
				id: B(t).id,
				projectId: ""
			})), xr("dragstart", T, (e) => m(e, {
				kind: "session",
				id: B(t).id,
				projectId: ""
			})), xr("dragend", T, _), U(e, n);
		}), U(e, t);
	};
	G(Me, (e) => {
		B(n).sessions.length === 0 ? e(D) : e(Ne, -1);
	}), k(je), k(Ae);
	var O = I(Ae, 2), Pe = F(O);
	Q(F(Pe), { name: "settings" }), A(), k(Pe), k(O), k(ae);
	var Fe = I(ae, 2), Ie = I(Fe, 2), Le = I(F(Ie), 2);
	A(2), k(Ie), L(() => {
		J(T, "aria-expanded", B(n).mobile.sidebarOpen), J(ee, "aria-selected", B(n).mobile.view === "details"), J(te, "aria-selected", B(n).mobile.view === "chat"), J(ne, "aria-pressed", B(n).mobile.immersive), W(le, B(n).version), J(fe, "aria-expanded", B(r)), J(me, "src", B(u)?.iconSrc || "/favicon.svg"), W(ge, B(u)?.name || "Workspace"), J(Ce, "data-navigation-identity", B(n).identity);
	}), V("click", T, () => B(n).onMobileSidebar(!B(n).mobile.sidebarOpen)), V("click", ee, () => B(n).onMobileView("details")), V("click", te, () => B(n).onMobileView("chat")), V("click", ne, () => B(n).onMobileImmersive(!B(n).mobile.immersive)), V("click", ie, () => B(n).onMobileSidebar(!1)), V("click", fe, (e) => {
		e.stopPropagation(), P(r, !B(r));
	}), V("click", Se, function(...e) {
		B(n).onCreateProject?.apply(this, e);
	}), V("pointerdown", ke, (e) => S(e, "sidebarSessionHeight")), V("click", Pe, () => {
		B(n).onMobileSidebar(!1), B(n).onOpenSettings();
	}), V("pointerdown", Fe, (e) => S(e, "sidebarWidth")), V("pointerdown", Le, (e) => S(e, "chatWidth")), U(e, C), We();
}
Sr(["click", "pointerdown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var nd = /* @__PURE__ */ H("<button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button>"), rd = /* @__PURE__ */ H("<button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn; keep the Session open.\" aria-label=\"End current turn; keep the Session open.\"><!></button>"), id = /* @__PURE__ */ H("<span class=\"tty-composer-divider\" aria-hidden=\"true\"></span> <span class=\"tty-composer-group\"><!> <button type=\"button\" id=\"agentCloseSessionButton\" class=\"tty-composer-action tty-close-session-button\"><!></button></span>", 1), ad = /* @__PURE__ */ H("<button type=\"button\" id=\"agentActionsToggle\" class=\"tty-actions-toggle\" title=\"Session actions\" aria-label=\"Session actions\"><!></button>"), od = /* @__PURE__ */ H("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), sd = /* @__PURE__ */ H("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), cd = /* @__PURE__ */ H("<div id=\"ttyAgentMenu\" class=\"tty-agent-menu\" role=\"menu\" aria-label=\"Choose an Agent\"></div>"), ld = /* @__PURE__ */ H("<div class=\"tty-session-actions collapsible open\"><div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div></div>"), ud = /* @__PURE__ */ H("<form id=\"ttyForm\" class=\"tty-input\"><span>&gt;</span> <textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <span class=\"tty-composer-group\"><!> <button type=\"submit\" class=\"tty-send-button\"><!></button></span> <!> <!></form> <!> <!>", 1), dd = /* @__PURE__ */ H("<div class=\"external-resource-lock\">This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.</div>"), fd = /* @__PURE__ */ H("<button type=\"button\" id=\"agentResumeButton\" class=\"tty-primary-action\" title=\"Resume Session\" aria-label=\"Resume Session\"><!><span>Resume Session</span></button>"), pd = /* @__PURE__ */ H("<div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div>"), md = /* @__PURE__ */ H("<div class=\"tty-session-actions tty-standalone-actions open\" role=\"toolbar\" aria-label=\"Session actions\"><!> <!> <!></div>");
function hd(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(-1), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ N(!1), s = /* @__PURE__ */ N(""), c = /* @__PURE__ */ N(!1), l = /* @__PURE__ */ N(void 0), u = /* @__PURE__ */ j(() => !!B(n).unavailableReason || B(o) || B(n).sending), d = /* @__PURE__ */ j(() => B(n).sessionStarting ? "Creating a new AgentHub session..." : B(n).agents.length ? "Choose an Agent to start a new session." : "No enabled agents are available. Configure an AgentHub Agent in Settings.");
	wi(() => t.channel.subscribe((e) => {
		P(n, e, !0), e.identity === B(r) ? e.draftResetVersion !== B(i) && (P(i, e.draftResetVersion, !0), P(a, e.draft, !0), P(s, "")) : (P(r, e.identity, !0), P(i, e.draftResetVersion, !0), P(a, e.draft, !0), P(o, !1), P(s, ""), P(c, !1)), queueMicrotask(e.onIconsChanged);
	})), Sn(() => {
		B(a), dr().then(g);
	});
	function f() {
		return {
			workspaceId: B(n).workspaceId,
			resourceId: B(n).resourceId,
			runId: B(n).runId,
			draftKey: B(n).draftKey
		};
	}
	function p(e) {
		P(a, e, !0), P(s, ""), B(n).onDraft(e, f());
	}
	async function m(e) {
		e?.preventDefault();
		let t = B(a);
		if (B(u) || !t.trim() || !B(n).runId) return;
		let i = B(r), c = f();
		P(o, !0), P(s, "");
		try {
			let e = await B(n).onSend(t, c);
			B(r) === i && e.accepted && e.clear && B(a) === t && p("");
		} catch (e) {
			B(r) === i && P(s, e instanceof Error ? e.message : String(e), !0);
		} finally {
			B(r) === i && (P(o, !1), await dr(), B(l)?.focus({ preventScroll: !0 }));
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
			B(c) || (e.preventDefault(), m());
		}
	}
	function g() {
		if (!B(l)) return;
		B(l).style.height = "auto";
		let e = Math.min(B(l).scrollHeight, 160);
		B(l).style.height = `${e}px`, B(l).style.overflowY = B(l).scrollHeight > 160 ? "auto" : "hidden";
	}
	var _ = Ar(), v = fn(_), y = (e) => {
		var t = ud(), r = fn(t), i = I(F(r), 2);
		at(i), Si(i, (e) => P(l, e), () => B(l));
		var c = I(i, 2), f = F(c), g = (e) => {
			var t = nd();
			Q(F(t), { name: "plus" }), k(t), V("click", t, function(...e) {
				B(n).onOpenUpload?.apply(this, e);
			}), U(e, t);
		};
		G(f, (e) => {
			B(n).externalLocked || e(g);
		});
		var _ = I(f, 2), v = F(_);
		{
			let e = /* @__PURE__ */ j(() => B(o) ? "loader-circle" : "send");
			Q(v, { get name() {
				return B(e);
			} });
		}
		k(_), k(c);
		var y = I(c, 2), b = (e) => {
			var t = id(), r = I(fn(t), 2), i = F(r), a = (e) => {
				var t = rd(), r = F(t);
				{
					let e = /* @__PURE__ */ j(() => B(n).endingTurn ? "loader-circle" : "pause");
					Q(r, { get name() {
						return B(e);
					} });
				}
				k(t), L(() => t.disabled = B(n).endingTurn || B(n).closingSession || B(n).selfDrivingDisabling), V("click", t, function(...e) {
					B(n).onEndTurn?.apply(this, e);
				}), U(e, t);
			};
			G(i, (e) => {
				B(n).canEndTurn && e(a);
			});
			var o = I(i, 2), s = F(o);
			{
				let e = /* @__PURE__ */ j(() => B(n).closingSession ? "loader-circle" : "square");
				Q(s, { get name() {
					return B(e);
				} });
			}
			k(o), k(r), L(() => {
				o.disabled = B(n).endingTurn || B(n).closingSession || B(n).selfDrivingDisabling, J(o, "title", B(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session."), J(o, "aria-label", B(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session.");
			}), V("click", o, function(...e) {
				B(n).onCloseSession?.apply(this, e);
			}), U(e, t);
		};
		G(y, (e) => {
			(B(n).canEndTurn || B(n).runId) && e(b);
		});
		var x = I(y, 2), S = (e) => {
			var t = ad();
			Q(F(t), { name: "ellipsis" }), k(t), L(() => J(t, "aria-expanded", B(n).actionsOpen)), V("click", t, function(...e) {
				B(n).onToggleActions?.apply(this, e);
			}), U(e, t);
		};
		G(x, (e) => {
			B(n).internalLocked || e(S);
		}), k(r);
		var C = I(r, 2), w = (e) => {
			var t = od(), n = F(t), r = F(n, !0);
			k(n);
			var i = I(n);
			k(t), L(() => {
				W(r, B(s)), i.disabled = B(o);
			}), V("click", i, () => m()), U(e, t);
		};
		G(C, (e) => {
			B(s) && e(w);
		});
		var T = I(C, 2), E = (e) => {
			var t = ld(), r = F(t), i = F(r), a = F(i);
			{
				let e = /* @__PURE__ */ j(() => B(n).sessionStarting ? "loader-circle" : "plus");
				Q(a, { get name() {
					return B(e);
				} });
			}
			var o = I(a), s = F(o, !0);
			k(o), k(i);
			var c = I(i, 2), l = (e) => {
				var t = cd();
				K(t, 21, () => B(n).agents, (e) => e.id, (e, t) => {
					var r = sd();
					let i;
					var a = F(r), o = F(a, !0);
					k(a);
					var s = I(a), c = F(s, !0);
					k(s), k(r), L(() => {
						J(r, "data-agent-choice", B(t).id), i = q(r, 1, "", null, i, { active: B(t).id === B(n).selectedAgentId }), W(o, B(t).label), W(c, B(t).summary);
					}), V("click", r, () => B(n).onChooseAgent(B(t).id)), U(e, r);
				}), k(t), U(e, t);
			};
			G(c, (e) => {
				B(n).chooserOpen && e(l);
			}), k(r), k(t), L(() => {
				J(i, "title", B(d)), J(i, "aria-label", B(d)), i.disabled = B(n).sessionStarting || !B(n).agents.length, J(i, "aria-expanded", B(n).chooserOpen), W(s, B(n).sessionStarting ? "Creating Session..." : "New Session");
			}), V("click", i, function(...e) {
				B(n).onToggleChooser?.apply(this, e);
			}), U(e, t);
		};
		G(T, (e) => {
			B(n).actionsOpen && !B(n).internalLocked && e(E);
		}), L(() => {
			J(i, "data-agent-draft-key", B(n).draftKey), J(i, "placeholder", B(n).unavailableReason || "Send input to the selected agent session"), i.disabled = B(u), fi(i, B(a)), J(_, "title", B(o) ? "Sending..." : B(n).unavailableReason || "Send input"), J(_, "aria-label", B(o) ? "Sending..." : B(n).unavailableReason || "Send input"), _.disabled = B(u);
		}), xr("submit", r, m), V("input", i, (e) => p(e.currentTarget.value)), V("keydown", i, h), U(e, t);
	}, b = (e) => {
		var t = md(), r = F(t), i = (e) => {
			U(e, dd());
		};
		G(r, (e) => {
			B(n).externalLocked && e(i);
		});
		var a = I(r, 2), o = (e) => {
			var t = fd();
			Q(F(t), { name: "rotate-ccw" }), A(), k(t), V("click", t, function(...e) {
				B(n).onResume?.apply(this, e);
			}), U(e, t);
		};
		G(a, (e) => {
			B(n).canResume && e(o);
		});
		var s = I(a, 2), c = (e) => {
			var t = pd(), r = F(t), i = F(r);
			{
				let e = /* @__PURE__ */ j(() => B(n).sessionStarting ? "loader-circle" : "plus");
				Q(i, { get name() {
					return B(e);
				} });
			}
			var a = I(i), o = F(a, !0);
			k(a), k(r);
			var s = I(r, 2), c = (e) => {
				var t = cd();
				K(t, 21, () => B(n).agents, (e) => e.id, (e, t) => {
					var r = sd();
					let i;
					var a = F(r), o = F(a, !0);
					k(a);
					var s = I(a), c = F(s, !0);
					k(s), k(r), L(() => {
						J(r, "data-agent-choice", B(t).id), i = q(r, 1, "", null, i, { active: B(t).id === B(n).selectedAgentId }), W(o, B(t).label), W(c, B(t).summary);
					}), V("click", r, () => B(n).onChooseAgent(B(t).id)), U(e, r);
				}), k(t), U(e, t);
			};
			G(s, (e) => {
				B(n).chooserOpen && e(c);
			}), k(t), L(() => {
				J(r, "title", B(d)), J(r, "aria-label", B(d)), r.disabled = B(n).sessionStarting || !B(n).agents.length, J(r, "aria-expanded", B(n).chooserOpen), W(o, B(n).sessionStarting ? "Creating Session..." : "New Session");
			}), V("click", r, function(...e) {
				B(n).onToggleChooser?.apply(this, e);
			}), U(e, t);
		};
		G(s, (e) => {
			!B(n).internalLocked && !B(n).externalLocked && e(c);
		}), k(t), U(e, t);
	};
	G(v, (e) => {
		B(n).live ? e(y) : e(b, -1);
	}), U(e, _), We();
}
Sr([
	"input",
	"keydown",
	"click"
]);
//#endregion
//#region src/components/CreateDialog.svelte
var gd = /* @__PURE__ */ H("<span> </span>"), _d = /* @__PURE__ */ H("<small> </small>"), vd = /* @__PURE__ */ H("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), yd = /* @__PURE__ */ H("<section class=\"create-section\" aria-label=\"Template\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>"), bd = /* @__PURE__ */ H("<small>(generated by template)</small>"), xd = /* @__PURE__ */ H("<small class=\"create-required\">*</small>"), Sd = /* @__PURE__ */ H("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), Cd = /* @__PURE__ */ H("<input type=\"checkbox\"/><span> </span>", 1), wd = /* @__PURE__ */ H("<textarea></textarea>"), Td = /* @__PURE__ */ H("<option> </option>"), Ed = /* @__PURE__ */ H("<select><option>Select...</option><!></select>"), Dd = /* @__PURE__ */ H("<input/>"), Od = /* @__PURE__ */ H("<label><!> <!> <!> <!> <!></label>"), kd = /* @__PURE__ */ H("<div class=\"template-fields\"></div>"), Ad = /* @__PURE__ */ H("<section class=\"create-section\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!></section>"), jd = /* @__PURE__ */ H("<section class=\"create-section\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), Md = /* @__PURE__ */ H("<div class=\"create-task-automation-fields\"><label><span>Agent <small>(optional)</small></span><select name=\"agentName\"><option>Workspace default</option><!></select></label> <label><span>Run instructions</span><textarea name=\"prompt\" placeholder=\"Instructions for the automated run\"></textarea></label> <label><span>Preferred Agent Profiles</span><input name=\"agentProfiles\" placeholder=\"Workspace default, or kimi, codex\"/><small> </small></label> <label><span>Completion criteria</span><textarea name=\"completionCriteria\" placeholder=\"Natural-language completion criteria\"></textarea></label></div>"), Nd = /* @__PURE__ */ H("<button type=\"button\" class=\"secondary compact\"> </button>"), Pd = /* @__PURE__ */ H("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), Fd = /* @__PURE__ */ H("<p class=\"create-task-preview-hint\">Updating preview...</p>"), Id = /* @__PURE__ */ H("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), Ld = /* @__PURE__ */ H("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Rd = /* @__PURE__ */ H("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <small> </small> <!></section>"), zd = /* @__PURE__ */ H("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), Bd = /* @__PURE__ */ H("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Vd = /* @__PURE__ */ H("<!> <!> <!>", 1), Hd = /* @__PURE__ */ H("<p class=\"create-task-blank-detail\"> </p>"), Ud = /* @__PURE__ */ H("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), Wd = /* @__PURE__ */ H("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!> <small> </small></section>"), Gd = /* @__PURE__ */ H("<div class=\"create-task-split\"><div class=\"create-task-form-col\"><!> <section class=\"create-section\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!> <section class=\"create-section\" aria-label=\"Automation\"><div class=\"create-section-title\">Automation</div> <label class=\"create-task-automation-toggle\"><input name=\"selfDriving\" type=\"checkbox\"/><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label> <!></section></div> <aside class=\"create-task-preview-col\" aria-label=\"Task preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside></div>"), Kd = /* @__PURE__ */ H("<textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/>", 1), qd = /* @__PURE__ */ H("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function Jd(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(en(h(B(n).draft))), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(void 0), o, s = /* @__PURE__ */ j(() => B(r).type === "task"), c = /* @__PURE__ */ j(() => B(n).templates.find((e) => e.name === B(r).templateName)), l = /* @__PURE__ */ j(() => B(n).preview?.title || ""), u = /* @__PURE__ */ j(() => B(r).titleOverride ? B(r).title : B(l)), d = /* @__PURE__ */ j(() => (B(c)?.fields || []).filter((e) => e.required)), f = /* @__PURE__ */ j(() => (B(c)?.fields || []).filter((e) => !e.required)), p = /* @__PURE__ */ j(() => B(r).editedMarkdown != null && !!B(n).preview && B(r).editedMarkdown !== B(n).preview?.markdown), m = /* @__PURE__ */ j(() => !B(n).preview || B(n).previewKey !== B(n).previewRequestKey(B(r)));
	wi(() => t.channel.subscribe((e) => {
		let t = B(n).preview;
		P(n, e, !0), e.identity === B(i) ? e.preview && e.preview !== t && B(r).editedMarkdown == null && (B(r).editedMarkdown = e.preview.markdown) : (P(i, e.identity, !0), P(r, h(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), wi(() => {
		let e = (e) => {
			if (!B(n).open) return;
			if (e.key === "Escape" && !B(n).submitting) {
				e.preventDefault(), B(n).onClose();
				return;
			}
			if (e.key !== "Tab" || !B(a)) return;
			let t = [...B(a).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
			if (!t.length) return;
			let r = t[0], i = t[t.length - 1];
			e.shiftKey && document.activeElement === r ? (e.preventDefault(), i.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r.focus());
		};
		return document.addEventListener("keydown", e), () => {
			document.removeEventListener("keydown", e), o && clearTimeout(o);
		};
	});
	function h(e) {
		return {
			...e,
			templateFields: { ...e.templateFields }
		};
	}
	function g(e) {
		return e.hasDefault ? e.default ?? "" : e.type !== "boolean" && "";
	}
	function _(e = 450) {
		o && clearTimeout(o), o = setTimeout(() => {
			o = void 0, B(r).templateName && B(m) && !B(n).submitting && B(n).onPreview(h(B(r)));
		}, e);
	}
	async function v(e) {
		if (B(n).submitting || e === B(r).templateName || (Object.values(B(r).templateFields).some((e) => !!e) || B(r).titleOverride || B(r).editedMarkdown != null) && !B(n).onConfirmTemplateSwitch()) return;
		let t = B(n).templates.find((t) => t.name === e);
		B(r).templateName = e, B(r).templateFields = {};
		for (let e of t?.fields || []) B(r).templateFields[e.name] = g(e);
		B(r).title = "", B(r).titleOverride = !1, B(r).editedMarkdown = null, _(150);
	}
	function y(e, t) {
		let n = t.currentTarget;
		B(r).templateFields[e.name] = e.type === "boolean" && n instanceof HTMLInputElement ? n.checked : n.value, _();
	}
	async function b(e) {
		e.preventDefault(), B(n).submitting || await B(n).onSubmit(h(B(r)));
	}
	async function x() {
		!B(n).previewing && !B(n).submitting && await B(n).onPreview(h(B(r)));
	}
	function S(e) {
		B(r).title = e.currentTarget.value, B(r).templateName && (B(r).titleOverride = !0), _();
	}
	function C(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var w = Ar(), T = fn(w), E = (e) => {
		var t = qd(), i = F(t), o = I(i, 2);
		let l;
		var h = F(o), g = F(h), w = F(g), T = F(w, !0);
		k(w);
		var E = I(w, 2), ee = (e) => {
			var t = gd(), n = F(t, !0);
			k(t), L(() => W(n, B(r).projectId)), U(e, t);
		};
		G(E, (e) => {
			B(s) && e(ee);
		}), k(g);
		var te = I(g, 2);
		Q(F(te), { name: "x" }), k(te), k(h);
		var ne = I(h, 2), re = F(ne), ie = (e) => {
			var t = Gd(), i = F(t), a = F(i), o = (e) => {
				var t = yd(), i = I(F(t), 2), a = F(i);
				let o;
				var s = I(F(a), 4);
				Q(F(s), { name: "check" }), k(s), k(a), K(I(a, 2), 17, () => B(n).templates, (e) => e.name, (e, t) => {
					var i = vd();
					let a;
					var o = F(i), s = F(o, !0);
					k(o);
					var c = I(o, 2), l = (e) => {
						var n = _d(), r = F(n, !0);
						k(n), L(() => W(r, B(t).description)), U(e, n);
					};
					G(c, (e) => {
						B(t).description && e(l);
					});
					var u = I(c, 2);
					Q(F(u), { name: "check" }), k(u), k(i), L((e) => {
						J(i, "aria-selected", B(r).templateName === B(t).name), a = q(i, 1, "template-card", null, a, { selected: B(r).templateName === B(t).name }), i.disabled = !B(t).valid || B(n).submitting, W(s, e);
					}, [() => C(B(t))]), V("click", i, () => v(B(t).name)), U(e, i);
				}), k(i), k(t), L(() => {
					J(a, "aria-selected", B(r).templateName === ""), o = q(a, 1, "template-card", null, o, { selected: B(r).templateName === "" }), a.disabled = B(n).submitting;
				}), V("click", a, () => v("")), U(e, t);
			};
			G(a, (e) => {
				B(n).templates.length && e(o);
			});
			var s = I(a, 2), l = I(F(s), 2), h = F(l), g = F(h), b = I(F(g)), w = (e) => {
				U(e, bd());
			}, T = (e) => {
				U(e, xd());
			};
			G(b, (e) => {
				B(c)?.taskTitle && !B(r).titleOverride ? e(w) : e(T, -1);
			}), k(g);
			var E = I(g, 2), ee = F(E);
			di(ee);
			var te = I(ee, 2), ne = (e) => {
				var t = Sd();
				V("click", t, () => {
					B(r).title = "", B(r).titleOverride = !1, _();
				}), U(e, t);
			};
			G(te, (e) => {
				B(c)?.taskTitle && B(r).titleOverride && e(ne);
			}), k(E), k(h);
			var re = I(h, 2), ie = I(F(re), 2), ae = I(F(ie), 2);
			di(ae), k(ie), k(re), k(l), k(s);
			var oe = I(s, 2), se = (e) => {
				var t = Ad();
				K(I(F(t), 2), 17, () => [B(d), B(f)], Lr, (e, t, n) => {
					var i = Ar(), a = fn(i), o = (e) => {
						var i = kd();
						J(i, "aria-label", n === 0 ? "Required template fields" : "Optional template fields"), K(i, 21, () => B(t), (e) => e.name, (e, t) => {
							var n = Od();
							let i;
							var a = F(n), o = (e) => {
								var n = Cd(), i = fn(n);
								di(i);
								var a = I(i), o = F(a);
								k(a), L(() => {
									pi(i, B(r).templateFields[B(t).name] === !0), W(o, `${B(t).label ?? ""}${B(t).required ? " *" : ""}`);
								}), V("change", i, (e) => y(B(t), e)), U(e, n);
							}, s = (e) => {
								var n = gd(), r = F(n);
								k(n), L(() => W(r, `${B(t).label ?? ""}${B(t).required ? " *" : ""}`)), U(e, n);
							};
							G(a, (e) => {
								B(t).type === "boolean" ? e(o) : e(s, -1);
							});
							var c = I(a, 2), l = (e) => {
								var n = wd();
								at(n), L((e) => {
									n.required = B(t).required, J(n, "placeholder", B(t).placeholder || ""), fi(n, e);
								}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("input", n, (e) => y(B(t), e)), U(e, n);
							};
							G(c, (e) => {
								B(t).type === "textarea" && e(l);
							});
							var u = I(c, 2), d = (e) => {
								var n = Ed(), i = F(n);
								i.value = i.__value = "", K(I(i), 17, () => B(t).options || [], Lr, (e, t) => {
									var n = Td(), r = F(n, !0);
									k(n);
									var i = {};
									L(() => {
										W(r, B(t)), i !== (i = B(t)) && (n.value = (n.__value = B(t)) ?? "");
									}), U(e, n);
								}), k(n);
								var a;
								ii(n), L((e) => {
									n.required = B(t).required, a !== (a = e) && (n.value = (n.__value = e) ?? "", ri(n, e));
								}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("change", n, (e) => y(B(t), e)), U(e, n);
							};
							G(u, (e) => {
								B(t).type === "select" && e(d);
							});
							var f = I(u, 2), p = (e) => {
								var n = Dd();
								di(n), L((e) => {
									n.required = B(t).required, J(n, "placeholder", B(t).placeholder || ""), fi(n, e);
								}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("input", n, (e) => y(B(t), e)), U(e, n);
							};
							G(f, (e) => {
								B(t).type === "text" && e(p);
							});
							var m = I(f, 2), h = (e) => {
								var n = _d(), r = F(n, !0);
								k(n), L(() => W(r, B(t).description)), U(e, n);
							};
							G(m, (e) => {
								B(t).description && e(h);
							}), k(n), L(() => i = q(n, 1, "", null, i, { "template-boolean": B(t).type === "boolean" })), U(e, n);
						}), k(i), U(e, i);
					};
					G(a, (e) => {
						B(t).length && e(o);
					}), U(e, i);
				}), k(t), U(e, t);
			}, ce = (e) => {
				var t = jd(), n = I(F(t), 2);
				at(n), k(t), _i(n, () => B(r).detail, (e) => B(r).detail = e), U(e, t);
			};
			G(oe, (e) => {
				B(c) ? e(se) : e(ce, -1);
			});
			var le = I(oe, 2), ue = I(F(le), 2), de = F(ue);
			di(de), A(), k(ue);
			var fe = I(ue, 2), pe = (e) => {
				var t = Md(), i = F(t), a = I(F(i)), o = F(a);
				o.value = o.__value = "", K(I(o), 17, () => B(n).agents, (e) => e.id, (e, t) => {
					var n = Td(), r = F(n);
					k(n);
					var i = {};
					L(() => {
						W(r, `${B(t).label ?? ""} — ${B(t).summary ?? ""}`), i !== (i = B(t).id) && (n.value = (n.__value = B(t).id) ?? "");
					}), U(e, n);
				}), k(a), k(i);
				var s = I(i, 2), c = I(F(s));
				at(c), k(s);
				var l = I(s, 2), u = I(F(l));
				di(u);
				var d = I(u), f = F(d, !0);
				k(d), k(l);
				var p = I(l, 2), m = I(F(p));
				at(m), k(p), k(t), L((e) => W(f, e), [() => B(n).profileKeys.length ? `Available: ${B(n).profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."]), V("change", a, () => _()), ai(a, () => B(r).agentName, (e) => B(r).agentName = e), V("input", c, () => _()), _i(c, () => B(r).prompt, (e) => B(r).prompt = e), V("input", u, () => _()), _i(u, () => B(r).agentProfiles, (e) => B(r).agentProfiles = e), V("input", m, () => _()), _i(m, () => B(r).completionCriteria, (e) => B(r).completionCriteria = e), U(e, t);
			};
			G(fe, (e) => {
				B(r).selfDriving && e(pe);
			}), k(le), k(i);
			var me = I(i, 2), he = F(me), ge = I(F(he), 2), _e = (e) => {
				var t = Nd(), r = F(t, !0);
				k(t), L(() => {
					t.disabled = B(n).previewing || B(n).submitting, W(r, B(n).previewing ? "Rendering..." : "Refresh");
				}), V("click", t, x), U(e, t);
			};
			G(ge, (e) => {
				B(c) && e(_e);
			}), k(he);
			var ve = I(he, 2), ye = (e) => {
				var t = Vd(), i = fn(t), a = (e) => {
					var t = Pd(), r = F(t, !0);
					k(t), L(() => W(r, B(n).previewError)), U(e, t);
				};
				G(i, (e) => {
					B(n).previewError && e(a);
				});
				var o = I(i, 2), s = (e) => {
					U(e, Fd());
				};
				G(o, (e) => {
					!B(n).previewError && B(m) && B(n).preview && e(s);
				});
				var c = I(o, 2), l = (e) => {
					var t = Rd(), i = F(t), a = F(i, !0);
					k(i);
					var o = I(i, 2);
					at(o);
					var s = I(o, 2), c = (e) => {
						var t = Id(), i = I(F(t), 2);
						k(t), V("click", i, () => B(r).editedMarkdown = B(n).preview?.markdown ?? null), U(e, t);
					}, l = (e) => {
						U(e, Ld());
					};
					G(s, (e) => {
						B(p) ? e(c) : e(l, -1);
					});
					var u = I(s, 2), d = (e) => {
						var t = _d(), r = F(t);
						k(t), L(() => W(r, `Slug: ${B(n).preview.slug ?? ""}`)), U(e, t);
					};
					G(u, (e) => {
						B(n).preview.slug && e(d);
					});
					var f = I(u, 2), m = F(f);
					k(f);
					var h = I(f, 2), g = (e) => {
						var t = _d(), i = F(t);
						k(t), L(() => W(i, `Template ${B(r).templateName ?? ""} · ${B(n).templateDigest ?? ""}`)), U(e, t);
					};
					G(h, (e) => {
						B(n).templateDigest && e(g);
					}), k(t), L(() => {
						W(a, B(n).preview.title), W(m, `Self-Driving: ${B(n).preview.selfDriving ? `on with ${B(n).preview.selfDriving.agentName || "workspace default"}` : "off"}`);
					}), _i(o, () => B(r).editedMarkdown, (e) => B(r).editedMarkdown = e), U(e, t);
				}, u = (e) => {
					U(e, zd());
				}, d = (e) => {
					U(e, Bd());
				};
				G(c, (e) => {
					B(n).preview ? e(l) : B(n).previewing ? e(u, 1) : B(n).previewError || e(d, 2);
				}), U(e, t);
			}, be = (e) => {
				var t = Wd(), n = F(t), i = F(n, !0);
				k(n);
				var a = I(n, 2), o = (e) => {
					var t = Hd(), n = F(t, !0);
					k(t), L(() => W(n, B(r).detail)), U(e, t);
				}, s = /* @__PURE__ */ j(() => B(r).detail.trim()), c = (e) => {
					U(e, Ud());
				};
				G(a, (e) => {
					B(s) ? e(o) : e(c, -1);
				});
				var l = I(a, 2), u = (e) => {
					var t = _d(), n = F(t);
					k(t), L((e) => W(n, `Slug: ${e ?? ""}`), [() => B(r).slug.trim()]), U(e, t);
				}, d = /* @__PURE__ */ j(() => B(r).slug.trim());
				G(l, (e) => {
					B(d) && e(u);
				});
				var f = I(l, 2), p = F(f);
				k(f), k(t), L((e) => {
					W(i, e), W(p, `Self-Driving: ${B(r).selfDriving ? `on with ${B(r).agentName || "workspace default"}` : "off"}`);
				}, [() => B(r).title.trim() || "Untitled task"]), U(e, t);
			};
			G(ve, (e) => {
				B(c) ? e(ye) : e(be, -1);
			}), k(me), k(t), L(() => {
				ee.required = !B(c)?.taskTitle, fi(ee, B(c)?.taskTitle ? B(u) : B(r).title), J(ee, "placeholder", B(c)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title");
			}), V("input", ee, S), V("input", ae, () => _()), _i(ae, () => B(r).slug, (e) => B(r).slug = e), V("change", de, () => _()), vi(de, () => B(r).selfDriving, (e) => B(r).selfDriving = e), U(e, t);
		}, ae = (e) => {
			var t = Kd(), n = fn(t);
			at(n);
			var i = I(n, 2);
			di(i), _i(n, () => B(r).description, (e) => B(r).description = e), _i(i, () => B(r).slug, (e) => B(r).slug = e), U(e, t);
		};
		G(re, (e) => {
			B(s) ? e(ie) : e(ae, -1);
		});
		var oe = I(re, 2), se = F(oe), ce = F(se, !0);
		k(se);
		var le = I(se, 2);
		k(oe), k(ne), k(o), Si(o, (e) => P(a, e), () => B(a)), k(t), L(() => {
			l = q(o, 1, "create-dialog modal-enter", null, l, { "create-task-dialog": B(s) }), J(o, "aria-label", B(s) ? "Create task" : "Create project"), W(T, B(s) ? "Create task" : "Create project"), te.disabled = B(n).submitting, se.disabled = B(n).submitting, W(ce, B(n).submitting ? "Creating..." : "Create"), le.disabled = B(n).submitting;
		}), V("click", i, function(...e) {
			B(n).onClose?.apply(this, e);
		}), V("click", te, function(...e) {
			B(n).onClose?.apply(this, e);
		}), xr("submit", ne, b), V("click", le, function(...e) {
			B(n).onClose?.apply(this, e);
		}), U(e, t);
	};
	G(T, (e) => {
		B(n).open && e(E);
	}), U(e, w), We();
}
Sr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region src/api/client.ts
var Yd = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, Xd = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, Zd = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new Xd(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new Xd(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new Xd(e.scope));
		this.active.clear();
	}
}, Qd = class {
	requests = new Zd();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: ef(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: ef(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof Xd) ? new Xd(n) : e;
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
			let n = $d(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new Yd(e.status, r, n);
		}
		return t;
	}
};
function $d(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function ef(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new Qd();
//#endregion
//#region src/components/DiffModal.svelte
var tf = /* @__PURE__ */ H("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), nf = /* @__PURE__ */ H("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), rf = /* @__PURE__ */ H("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), af = /* @__PURE__ */ H("<div class=\"diff-viewer\"></div>"), of = /* @__PURE__ */ H("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function sf(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(null), r = /* @__PURE__ */ N(!1), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(void 0), o = /* @__PURE__ */ j(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	Sn(() => {
		let e = t.repo, a = B(o);
		if (P(n, null), P(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		P(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (P(n, r, !0), await dr(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (P(i, n instanceof Error ? n.message : String(n), !0), t.onError(B(i)));
		}).finally(() => {
			t.repo === e && (P(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Sn(() => {
		B(n)?.diff, B(a), s();
	}), Ti(() => t.client.requests.abort(B(o)));
	function s() {
		!B(a) || !B(n)?.diff || !window.Diff2Html || (B(a).innerHTML = window.Diff2Html.html(B(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Ar(), l = fn(c), u = (e) => {
		var o = of(), s = F(o), c = I(s, 2), l = F(c), u = F(l), d = F(u), f = F(d, !0);
		k(d);
		var p = I(d), m = F(p);
		k(p), k(u);
		var h = I(u);
		Q(F(h), { name: "x" }), k(h), k(l);
		var g = I(l, 2), _ = (e) => {
			var n = tf(), r = F(n);
			Q(r, { name: "loader-circle" });
			var i = I(r, 2), a = F(i, !0);
			k(i), k(n), L(() => W(a, t.repo.worktreePath || "")), U(e, n);
		}, v = (e) => {
			var t = nf(), n = F(t);
			Q(n, { name: "triangle-alert" });
			var r = I(n, 2), a = F(r, !0);
			k(r), k(t), L(() => W(a, B(i))), U(e, t);
		}, y = (e) => {
			var t = rf();
			Q(F(t), { name: "check-circle-2" }), A(2), k(t), U(e, t);
		}, b = /* @__PURE__ */ j(() => !B(n)?.hasChanges || !B(n).diff?.trim()), x = (e) => {
			var t = af();
			Si(t, (e) => P(a, e), () => B(a)), U(e, t);
		};
		G(g, (e) => {
			B(r) ? e(_) : B(i) ? e(v, 1) : B(b) ? e(y, 2) : e(x, -1);
		}), k(c), k(o), L(() => {
			W(f, B(n)?.branch || t.repo.branch || t.repo.name || "Diff"), W(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), V("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), V("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), U(e, o);
	};
	G(l, (e) => {
		t.repo && e(u);
	}), U(e, c), We();
}
Sr(["click"]);
//#endregion
//#region src/components/detail.ts
function cf(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function lf(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${hf(e)}</pre>`;
}
function uf(e) {
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
function df(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function ff(e) {
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
function pf(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function mf(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...mf(a.children || [], t, n, r + 1));
	return i;
}
function hf(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/FileBrowser.svelte
var gf = /* @__PURE__ */ H("<a class=\"artifact-download\"><!></a>"), _f = /* @__PURE__ */ H("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), vf = /* @__PURE__ */ H("<div class=\"empty-list-row\"><!><span> </span></div>"), yf = /* @__PURE__ */ H("<div class=\"content-section\" data-component-owner=\"file-browser\"><h3><!><span> </span></h3> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function bf(e, t) {
	Ue(t, !0);
	let n = Ci(t, "entries", 19, () => []), r = Ci(t, "emptyMessage", 3, "No files."), i = Ci(t, "activePath", 3, ""), a = /* @__PURE__ */ j(() => mf(n(), t.expanded, t.title)), o = /* @__PURE__ */ j(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var c = yf(), l = F(c), u = F(l);
	Q(u, { get name() {
		return B(o);
	} });
	var d = I(u), f = F(d, !0);
	k(d), k(l);
	var p = I(l, 2), m = F(p), h = F(m), g = (e) => {
		var n = Ar();
		K(fn(n), 17, () => B(a), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ j(() => B(n).entry.type === "directory"), a = /* @__PURE__ */ j(() => t.expanded.has(`${t.title}:${B(n).entry.path}`));
			var o = _f(), c = F(o);
			let l;
			var u = F(c), d = F(u), f = F(d), p = (e) => {
				{
					let t = /* @__PURE__ */ j(() => B(a) ? "chevron-down" : "chevron-right");
					Q(e, { get name() {
						return B(t);
					} });
				}
			};
			G(f, (e) => {
				B(r) && e(p);
			}), k(d);
			var m = I(d);
			{
				let e = /* @__PURE__ */ j(() => B(r) ? B(a) ? "folder-open" : "folder" : s(B(n).entry.name)), t = /* @__PURE__ */ j(() => B(r) ? "artifact-icon artifact-icon-dir" : "artifact-icon");
				Q(m, {
					get name() {
						return B(e);
					},
					get className() {
						return B(t);
					}
				});
			}
			var h = I(m), g = F(h, !0);
			k(h), k(u);
			var _ = I(u, 2), v = F(_), y = (e) => {
				var r = gf();
				Q(F(r), {
					name: "download",
					className: "artifact-download-icon"
				}), k(r), L((e) => {
					J(r, "href", e), J(r, "download", B(n).entry.name), J(r, "title", `Download ${B(n).entry.name}`), J(r, "aria-label", `Download ${B(n).entry.name}`);
				}, [() => t.rawURL(t.title, B(n).entry.path, !0)]), V("click", r, (e) => e.stopPropagation()), U(e, r);
			};
			G(v, (e) => {
				B(r) || e(y);
			});
			var b = I(v), x = F(b, !0);
			k(b), k(_), k(c), k(o), L((e) => {
				l = q(c, 1, "artifact-row", null, l, {
					directory: B(r),
					file: !B(r),
					active: i() === `${t.title}:${B(n).entry.path}`
				}), ni(c, `--depth: ${B(n).depth}`), J(h, "title", B(n).entry.path), W(g, B(n).entry.name), W(x, e);
			}, [() => B(r) ? `${(B(n).entry.children || []).length} items` : pf(B(n).entry.size || 0)]), V("click", c, () => B(r) ? t.onToggle(`${t.title}:${B(n).entry.path}`) : t.onPreview(t.title, B(n).entry.path)), U(e, o);
		}), U(e, n);
	}, _ = (e) => {
		var n = vf(), i = F(n);
		{
			let e = /* @__PURE__ */ j(() => t.title === "Artifacts" ? "archive" : "inbox");
			Q(i, { get name() {
				return B(e);
			} });
		}
		var a = I(i), o = F(a, !0);
		k(a), k(n), L(() => W(o, r())), U(e, n);
	};
	G(h, (e) => {
		B(a).length ? e(g) : e(_, -1);
	}), k(m), k(p), k(c), L(() => W(f, t.title)), U(e, c), We();
}
Sr(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var xf = /* @__PURE__ */ H("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), Sf = /* @__PURE__ */ H("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), Cf = /* @__PURE__ */ H("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), wf = /* @__PURE__ */ H("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), Tf = /* @__PURE__ */ H("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Ef = /* @__PURE__ */ H("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), Df = /* @__PURE__ */ H("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Of(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(null), r = /* @__PURE__ */ N(!1), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ j(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ j(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : "");
	Sn(() => {
		let e = t.selection, o = B(a);
		if (P(n, null), P(i, ""), !e) {
			t.client.requests.abort(o);
			return;
		}
		P(r, !0);
		let s = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${s}?path=${encodeURIComponent(e.path)}`, { scope: o }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && P(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (P(i, n instanceof Error ? n.message : String(n), !0), t.onError(B(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (P(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Ti(() => t.client.requests.abort(B(a)));
	var s = Ar(), c = fn(s), l = (e) => {
		var a = Df(), s = F(a), c = I(s, 2), l = F(c), u = F(l), d = F(u), f = F(d, !0);
		k(d);
		var p = I(d), m = F(p);
		k(p), k(u);
		var h = I(u), g = F(h);
		Q(F(g), { name: "external-link" }), A(), k(g);
		var _ = I(g);
		Q(F(_), { name: "x" }), k(_), k(h), k(l);
		var v = I(l, 2), y = (e) => {
			var n = xf(), r = F(n);
			Q(r, { name: "loader-circle" });
			var i = I(r, 2), a = F(i, !0);
			k(i), k(n), L(() => W(a, t.selection.path)), U(e, n);
		}, b = (e) => {
			var t = Sf(), n = F(t);
			Q(n, { name: "triangle-alert" });
			var r = I(n, 2), a = F(r, !0);
			k(r), k(t), L(() => W(a, B(i))), U(e, t);
		}, x = (e) => {
			var r = Cf(), i = F(r);
			k(r), L(() => {
				J(i, "src", B(o)), J(i, "alt", B(n).name || t.selection.path);
			}), U(e, r);
		}, S = (e) => {
			var r = wf(), i = F(r);
			Q(i, { name: "file-warning" });
			var a = I(i), o = F(a, !0);
			k(a);
			var s = I(a), c = F(s);
			k(s), k(r), L((e) => {
				W(o, B(n).name || t.selection.path), W(c, `Binary file, ${e ?? ""}.`);
			}, [() => pf(B(n).size || 0)]), U(e, r);
		}, C = (e) => {
			var t = Tf();
			Kr(t, () => lf(B(n)?.content || ""), !0), k(t), U(e, t);
		}, w = /* @__PURE__ */ j(() => cf(B(n)?.path || t.selection.path)), T = (e) => {
			var t = Ef(), r = F(t, !0);
			k(t), L(() => W(r, B(n)?.content || "")), U(e, t);
		};
		G(v, (e) => {
			B(r) ? e(y) : B(i) ? e(b, 1) : B(n)?.image ? e(x, 2) : B(n)?.binary ? e(S, 3) : B(w) ? e(C, 4) : e(T, -1);
		}), k(c), k(a), L((e, r) => {
			J(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${B(n)?.contentHash || "pending"}`), W(f, e), W(m, `${t.selection.path ?? ""}${r ?? ""}${B(n)?.truncated ? " · truncated" : ""}`), J(g, "href", B(o));
		}, [() => B(n)?.name || t.selection.path.split("/").pop() || "File preview", () => B(n)?.size == null ? "" : ` · ${pf(B(n).size)}`]), V("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), V("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), U(e, a);
	};
	G(c, (e) => {
		t.selection && e(l);
	}), U(e, s), We();
}
Sr(["click"]);
//#endregion
//#region src/components/LogTimeline.svelte
var kf = /* @__PURE__ */ H("<div class=\"markdown-rendered\"></div>"), Af = /* @__PURE__ */ H("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), jf = /* @__PURE__ */ H("<p class=\"log-load-error\" role=\"alert\"> </p>"), Mf = /* @__PURE__ */ H("<div class=\"log-load-actions\"><button type=\"button\" class=\"secondary-button log-load-more\"><!><span> </span></button></div>"), Nf = /* @__PURE__ */ H("<div class=\"content-section\" data-component-owner=\"log-timeline\"><h3><!><span>Log</span></h3> <div class=\"log-timeline\"></div> <!> <!></div>");
function Pf(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ j(() => [...t.logs || []].sort(df)), r = /* @__PURE__ */ N(!1);
	async function i() {
		if (!(t.loading || B(r))) {
			P(r, !0);
			try {
				await t.onLoadMore();
			} finally {
				P(r, !1), queueMicrotask(t.onIconsChanged);
			}
		}
	}
	var a = Ar(), o = fn(a), s = (e) => {
		var a = Nf(), o = F(a);
		Q(F(o), { name: "history" }), A(), k(o);
		var s = I(o, 2);
		K(s, 21, () => B(n), (e) => e.id, (e, t) => {
			var n = Af(), r = F(n), i = F(r), a = F(i), o = F(a, !0);
			k(a);
			var s = I(a), c = F(s, !0);
			k(s), k(i);
			var l = I(i, 2), u = F(l, !0);
			k(l);
			var d = I(l, 2);
			Q(F(d), { name: "chevron-right" }), k(d), k(r);
			var f = I(r, 2);
			let p;
			var m = F(f), h = (e) => {
				var n = kf();
				Kr(n, () => lf(B(t).details), !0), k(n), U(e, n);
			}, g = (e) => {
				U(e, kr("No details."));
			};
			G(m, (e) => {
				B(t).details ? e(h) : e(g, -1);
			}), k(f), k(n), L((e) => {
				J(n, "data-log-id", B(t).id), J(i, "title", B(t).time), W(o, e), W(c, B(t).time), W(u, B(t).title || "Untitled log entry"), p = q(f, 1, "log-details", null, p, { empty: !B(t).details });
			}, [() => ff(B(t).time)]), U(e, n);
		}), k(s);
		var c = I(s, 2), l = (e) => {
			var n = jf(), r = F(n, !0);
			k(n), L(() => W(r, t.error)), U(e, n);
		};
		G(c, (e) => {
			t.error && e(l);
		});
		var u = I(c, 2), d = (e) => {
			var n = Mf(), a = F(n), o = F(a);
			{
				let e = /* @__PURE__ */ j(() => t.loading || B(r) ? "loader-circle" : "chevron-down"), n = /* @__PURE__ */ j(() => t.loading || B(r) ? "spin" : "");
				Q(o, {
					get name() {
						return B(e);
					},
					get className() {
						return B(n);
					}
				});
			}
			var s = I(o), c = F(s, !0);
			k(s), k(a), k(n), L(() => {
				a.disabled = t.loading || B(r), J(a, "aria-busy", t.loading || B(r)), W(c, t.loading || B(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), V("click", a, i), U(e, n);
		};
		G(u, (e) => {
			t.hasMore && e(d);
		}), k(a), L(() => J(a, "data-log-resource", t.resourceId)), U(e, a);
	};
	G(o, (e) => {
		(B(n).length || t.error || t.hasMore) && e(s);
	}), U(e, a), We();
}
Sr(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var Ff = /* @__PURE__ */ H("<a class=\"markdown-open-file\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a>"), If = /* @__PURE__ */ H("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), Lf = /* @__PURE__ */ H("<pre class=\"markdown-view\"> </pre>"), Rf = /* @__PURE__ */ H("<div class=\"content-section\" data-component-owner=\"markdown-document\"><h3><!><span> </span> <!></h3> <!></div>");
function zf(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ j(() => cf(t.file.name)), r = /* @__PURE__ */ j(() => `/api/workspaces/${encodeURIComponent(t.workspaceId)}/files/raw?path=${encodeURIComponent(t.file.path || "")}`);
	var i = Rf(), a = F(i), o = F(a);
	Q(o, { name: "file-text" });
	var s = I(o), c = F(s, !0);
	k(s);
	var l = I(s, 2), u = (e) => {
		var n = Ff();
		Q(F(n), { name: "external-link" }), A(), k(n), L(() => {
			J(n, "href", B(r)), J(n, "aria-label", `Open ${t.file.name} in new window`);
		}), U(e, n);
	};
	G(l, (e) => {
		B(n) && t.file.path && e(u);
	}), k(a);
	var d = I(a, 2), f = (e) => {
		var n = If(), r = F(n);
		Kr(r, () => lf(t.file.content || ""), !0), k(r), k(n), U(e, n);
	}, p = (e) => {
		var n = Lf(), r = F(n, !0);
		k(n), L(() => W(r, t.file.content || "")), U(e, n);
	};
	G(d, (e) => {
		B(n) ? e(f) : e(p, -1);
	}), k(i), L(() => {
		J(i, "data-doc-file", t.file.name), J(i, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`), W(c, t.file.name);
	}), U(e, i), We();
}
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var Bf = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), Vf = /* @__PURE__ */ H("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), Hf = /* @__PURE__ */ H("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), Uf = /* @__PURE__ */ H("<p class=\"log-load-error\" role=\"alert\"> </p>"), Wf = /* @__PURE__ */ H("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><!><span> </span></button></div></form>"), Gf = /* @__PURE__ */ H("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function Kf(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(""), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ N(""), s = /* @__PURE__ */ N(!1), c = /* @__PURE__ */ N(""), l = /* @__PURE__ */ j(() => B(r) !== B(i)), u = /* @__PURE__ */ j(() => !!(B(l) && B(o) && B(a) && B(o) !== B(a)));
	Sn(() => {
		let e = uf(t.file?.content || ""), u = t.file?.contentHash || "";
		P(o, u, !0), t.identity === B(n) ? !B(l) && u !== B(a) && (P(r, e, !0), P(i, e, !0), P(a, u, !0)) : (P(n, t.identity, !0), P(r, e, !0), P(i, e, !0), P(a, u, !0), P(c, ""), P(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), B(s) || !B(l)) return;
		let u = B(n);
		P(s, !0), P(c, "");
		try {
			let e = await t.onSave(B(r), B(a));
			if (B(n) !== u) return;
			P(i, uf(e.content || B(r)), !0), P(r, B(i), !0), P(a, e.contentHash || "", !0), P(o, B(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			B(n) === u && P(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			B(n) === u && (P(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = Gf(), p = F(f);
	Q(F(p), { name: "file-text" }), A(), k(p);
	var m = I(p, 2), h = (e) => {
		var t = Bf();
		Q(F(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(), k(t), U(e, t);
	}, g = (e) => {
		var n = Vf(), r = F(n);
		Q(r, { name: "triangle-alert" });
		var i = I(r, 2), a = F(i, !0);
		k(i), k(n), L(() => W(a, t.file.error)), U(e, n);
	}, _ = (e) => {
		var t = Wf(), n = F(t);
		at(n);
		var i = I(n, 2), a = (e) => {
			U(e, Hf());
		};
		G(i, (e) => {
			B(u) && e(a);
		});
		var o = I(i, 2), f = (e) => {
			var t = Uf(), n = F(t, !0);
			k(t), L(() => W(n, B(c))), U(e, t);
		};
		G(o, (e) => {
			B(c) && e(f);
		});
		var p = I(o, 2), m = F(p), h = F(m);
		{
			let e = /* @__PURE__ */ j(() => B(s) ? "loader-circle" : "save");
			Q(h, { get name() {
				return B(e);
			} });
		}
		var g = I(h), _ = F(g, !0);
		k(g), k(m), k(p), k(t), L(() => {
			n.disabled = B(s), m.disabled = B(s) || !B(l), W(_, B(s) ? "Saving" : "Save");
		}), xr("submit", t, d), _i(n, () => B(r), (e) => P(r, e)), U(e, t);
	};
	G(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), k(f), U(e, f), We();
}
//#endregion
//#region src/components/DetailPanel.svelte
var qf = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div>"), Jf = /* @__PURE__ */ H("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), Yf = /* @__PURE__ */ H("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), Xf = /* @__PURE__ */ H("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> </h1></div></div> <!> <!>", 1), Zf = /* @__PURE__ */ H("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), Qf = /* @__PURE__ */ H("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), $f = /* @__PURE__ */ H("<div class=\"details-actions\"><!><button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button></div>"), ep = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>Loading details...</strong></div>"), tp = /* @__PURE__ */ H("<span class=\"details-tab-count\"> </span>"), np = /* @__PURE__ */ H("<button type=\"button\" role=\"tab\"><span> </span><!></button>"), rp = /* @__PURE__ */ H("<div><!></div>"), ip = /* @__PURE__ */ H("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), ap = /* @__PURE__ */ H("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), op = /* @__PURE__ */ H("<div class=\"content-section\"><h3><!><span>Task Templates</span></h3><div class=\"template-list\"><!></div></div>"), sp = /* @__PURE__ */ H("<div class=\"content-section\"><h3><!><span>Template</span></h3><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), cp = /* @__PURE__ */ H("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), lp = /* @__PURE__ */ H("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), up = /* @__PURE__ */ H("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><h3><!><span>Worktrees</span></h3><div class=\"worktree-list\"><!></div></div></div>", 1), dp = /* @__PURE__ */ H("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <code class=\"resource-ref-badge\"> </code></h1><!></div></div> <!>", 1), fp = /* @__PURE__ */ H("<!> <!> <!>", 1);
function pp(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(en(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ N(null), s = /* @__PURE__ */ N(null), c = /* @__PURE__ */ new Map(), l = new Qd(), u = /* @__PURE__ */ j(() => (B(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), d = /* @__PURE__ */ j(() => new Set(B(u).map((e) => e.name))), f = /* @__PURE__ */ j(h), p = /* @__PURE__ */ j(() => B(o) ? `${B(o).section}:${B(o).path}` : "");
	wi(() => t.channel.subscribe((e) => {
		if (P(n, e, !0), e.identity !== B(r)) {
			B(r) && B(i) && c.set(B(r), B(i)), P(r, e.identity, !0), P(o, null), P(s, null), P(a, /* @__PURE__ */ new Set(), !0), P(i, c.get(B(r)) || m(e), !0);
			let t = document.getElementById("detailsPanel");
			t && (t.scrollTop = 0);
		} else B(f).length && !B(f).some((e) => e.id === B(i)) && P(i, B(f)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), wi(() => {
		let e = (e) => {
			e.key === "Escape" && (B(s) ? (e.preventDefault(), P(s, null)) : B(o) && (e.preventDefault(), P(o, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Ti(() => l.dispose());
	function m(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : t.some((e) => e.name === "work.md") ? "work" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "logs";
	}
	function h() {
		if (!B(n).detail) return [];
		let e = [];
		return B(d).has("project.md") && e.push({
			id: "project",
			label: "Project"
		}), B(d).has("task.md") && e.push({
			id: "task",
			label: "Task"
		}), B(d).has("work.md") && e.push({
			id: "work",
			label: "Work"
		}), (B(n).resourceType === "project" || B(n).detail.template) && e.push({
			id: "template",
			label: "Template"
		}), e.push({
			id: "logs",
			label: "Logs"
		}, {
			id: "artifacts",
			label: "Artifacts"
		}), B(n).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees"
		}), e;
	}
	function g(e) {
		return e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : e.name === "work.md" ? "work" : B(f).find((e) => [
			"project",
			"task",
			"work"
		].includes(e.id))?.id || "";
	}
	function _(e) {
		P(i, e, !0), c.set(B(r), e);
	}
	function v(e) {
		let t = new Set(B(a));
		t.has(e) ? t.delete(e) : t.add(e), P(a, t, !0), queueMicrotask(B(n).onIconsChanged);
	}
	function y(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(B(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function b(e, t) {
		P(o, {
			section: e,
			path: t
		}, !0);
	}
	function x(e) {
		e && B(n).onToast(e);
	}
	var S = fp(), C = fn(S), w = (e) => {
		var t = qf();
		Q(F(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(t), U(e, t);
	}, T = (e) => {
		var t = Xf(), r = fn(t), i = F(r), o = F(i), s = F(o, !0);
		k(o), k(i);
		var c = I(i), l = F(c), u = F(l, !0);
		k(l), k(c), k(r);
		var d = I(r, 2);
		Kf(d, {
			get identity() {
				return B(n).identity;
			},
			get file() {
				return B(n).workspaceAgents;
			},
			get onSave() {
				return B(n).onSaveWorkspaceAgents;
			},
			get onToast() {
				return B(n).onToast;
			},
			get onIconsChanged() {
				return B(n).onIconsChanged;
			}
		});
		var f = I(d, 2), m = (e) => {
			var t = Jf(), r = F(t);
			Q(F(r), { name: "book-open" }), A(), k(r);
			var i = I(r), a = F(i);
			Q(a, { name: "triangle-alert" });
			var o = I(a, 2), s = F(o, !0);
			k(o), k(i), k(t), L(() => W(s, B(n).wiki.error)), U(e, t);
		}, h = (e) => {
			var t = Yf(), n = F(t);
			Q(F(n), { name: "book-open" }), A(), k(n);
			var r = I(n);
			Q(F(r), { name: "book-open" }), A(2), k(r), k(t), U(e, t);
		}, g = (e) => {
			{
				let t = /* @__PURE__ */ j(() => B(n).wiki.entries || []);
				bf(e, {
					title: "Wiki",
					get entries() {
						return B(t);
					},
					emptyMessage: "No Wiki files yet.",
					get expanded() {
						return B(a);
					},
					get activePath() {
						return B(p);
					},
					onToggle: v,
					onPreview: b,
					rawURL: y
				});
			}
		};
		G(f, (e) => {
			B(n).wiki?.error ? e(m) : B(n).wiki?.exists ? e(g, -1) : e(h, 1);
		}), L(() => {
			W(s, B(n).workspaceName), W(u, B(n).workspaceName);
		}), V("click", o, () => B(n).onNavigate("workspace")), U(e, t);
	}, E = (e) => {
		var t = dp(), r = fn(t), o = F(r), c = F(o), l = F(c, !0);
		k(c);
		var d = I(c, 2), m = (e) => {
			var t = Zf(), r = I(fn(t)), i = F(r, !0);
			k(r), L(() => W(i, B(n).parent.title)), V("click", r, () => B(n).onNavigate(B(n).parent?.id || "workspace")), U(e, t);
		};
		G(d, (e) => {
			B(n).parent && e(m);
		});
		var h = I(d, 3), x = F(h, !0);
		k(h), k(o);
		var S = I(o, 2), C = F(S), w = F(C, !0), T = I(w), E = F(T, !0);
		k(T), k(C);
		var ee = I(C), te = (e) => {
			var t = $f(), r = F(t), i = (e) => {
				var t = Qf();
				Q(F(t), { name: "plus" }), A(), k(t), V("click", t, () => B(n).onCreateTask(B(n).resourceId)), U(e, t);
			};
			G(r, (e) => {
				B(n).resourceType === "project" && e(i);
			});
			var a = I(r);
			Q(F(a), { name: "archive" }), A(), k(a), k(t), V("click", a, () => B(n).onArchive(B(n).resourceId)), U(e, t);
		};
		G(ee, (e) => {
			B(n).detail && e(te);
		}), k(S), k(r);
		var ne = I(r, 2), re = (e) => {
			var t = ep();
			Q(F(t), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), A(), k(t), U(e, t);
		}, ie = (e) => {
			var t = up(), r = fn(t);
			K(r, 21, () => B(f), (e) => e.id, (e, t) => {
				var r = np();
				let a;
				var o = F(r), s = F(o, !0);
				k(o);
				var c = I(o), l = (e) => {
					var t = tp(), r = F(t, !0);
					k(t), L(() => W(r, B(n).detail.logs.length)), U(e, t);
				};
				G(c, (e) => {
					B(t).id === "logs" && B(n).detail.logs?.length && e(l);
				}), k(r), L(() => {
					a = q(r, 1, "details-tab", null, a, { active: B(i) === B(t).id }), J(r, "aria-selected", B(i) === B(t).id), W(s, B(t).label);
				}), V("click", r, () => _(B(t).id)), U(e, r);
			}), k(r);
			var o = I(r, 2);
			K(o, 17, () => B(u), (e) => e.path || e.name, (e, t) => {
				var r = rp();
				zf(F(r), {
					get file() {
						return B(t);
					},
					get workspaceId() {
						return B(n).workspaceId;
					}
				}), k(r), L((e) => J(r, "hidden", e), [() => B(i) !== g(B(t))]), U(e, r);
			});
			var c = I(o, 2), l = F(c), d = (e) => {
				var t = op(), r = F(t);
				Q(F(r), { name: "layout-template" }), A(), k(r);
				var i = I(r), a = F(i), o = (e) => {
					var t = Ar();
					K(fn(t), 17, () => B(n).detail.templates, (e) => e.name, (e, t) => {
						var n = ip();
						let r;
						var i = F(n);
						Q(i, { name: "file-text" });
						var a = I(i), o = F(a), s = F(o, !0);
						k(o);
						var c = I(o), l = F(c);
						k(c), k(a), Q(I(a), { name: "chevron-right" }), k(n), L(() => {
							r = q(n, 1, "template-row", null, r, { invalid: !B(t).valid }), W(s, B(t).title || B(t).name), W(l, `${B(t).name ?? ""} · v${(B(t).schemaVersion || "?") ?? ""} · ${B(t).valid ? `${(B(t).fields || []).length} fields` : `invalid${B(t).errors?.[0]?.message ? `: ${B(t).errors[0].message}` : ""}`}${B(t).legacy ? " · legacy" : ""}`);
						}), V("click", n, () => B(t).path && b("Templates", B(t).path)), U(e, n);
					}), U(e, t);
				}, s = (e) => {
					var t = ap();
					Q(F(t), { name: "layout-template" }), A(), k(t), U(e, t);
				};
				G(a, (e) => {
					B(n).detail.templates?.length ? e(o) : e(s, -1);
				}), k(i), k(t), U(e, t);
			}, m = (e) => {
				var t = sp(), r = F(t);
				Q(F(r), { name: "layout-template" }), A(), k(r);
				var i = I(r), a = F(i), o = F(a);
				Q(o, { name: "file-text" });
				var s = I(o), c = F(s), l = F(c, !0);
				k(c);
				var u = I(c), d = F(u);
				k(u), k(s), k(a), k(i), k(t), L(() => {
					W(l, B(n).detail.template.name), W(d, `Created from template · v${(B(n).detail.template.schemaVersion || "?") ?? ""} · ${(B(n).detail.template.digest || "") ?? ""}`);
				}), U(e, t);
			};
			G(l, (e) => {
				B(n).resourceType === "project" ? e(d) : B(n).detail.template && e(m, 1);
			}), k(c);
			var h = I(c, 2), x = F(h);
			{
				let e = /* @__PURE__ */ j(() => B(n).detail.logs || []);
				Pf(x, {
					get resourceId() {
						return B(n).resourceId;
					},
					get logs() {
						return B(e);
					},
					get hasMore() {
						return B(n).logs.hasMore;
					},
					get loading() {
						return B(n).logs.loading;
					},
					get error() {
						return B(n).logs.error;
					},
					onLoadMore: () => B(n).onLoadMoreLogs(B(n).resourceId),
					get onIconsChanged() {
						return B(n).onIconsChanged;
					}
				});
			}
			k(h);
			var S = I(h, 2), C = F(S);
			{
				let e = /* @__PURE__ */ j(() => B(n).detail.artifacts || []);
				bf(C, {
					title: "Artifacts",
					get entries() {
						return B(e);
					},
					emptyMessage: "No artifacts.",
					get expanded() {
						return B(a);
					},
					get activePath() {
						return B(p);
					},
					onToggle: v,
					onPreview: b,
					rawURL: y
				});
			}
			k(S);
			var w = I(S, 2), T = F(w), E = F(T);
			Q(F(E), { name: "folder-git-2" }), A(), k(E);
			var ee = I(E), te = F(ee), ne = (e) => {
				var t = Ar();
				K(fn(t), 17, () => B(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = cp(), r = F(n), i = F(r);
					Q(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = I(i), o = F(a), c = F(o, !0);
					k(o);
					var l = I(o), u = F(l);
					k(l);
					var d = I(l), f = F(d, !0);
					k(d), k(a), k(r);
					var p = I(r);
					Q(F(p), { name: "git-compare-arrows" }), A(), k(p), k(n), L(() => {
						W(c, B(t).branch || "HEAD"), W(u, `${(B(t).name || "repository") ?? ""}${B(t).targetBranch || B(t).baseBranch ? ` · base ${B(t).targetBranch || B(t).baseBranch}` : ""}`), W(f, B(t).worktreePath || "");
					}), V("click", p, () => P(s, B(t), !0)), U(e, n);
				}), U(e, t);
			}, re = (e) => {
				var t = lp();
				Q(F(t), { name: "git-branch" }), A(), k(t), U(e, t);
			};
			G(te, (e) => {
				B(n).detail.repos?.length ? e(ne) : e(re, -1);
			}), k(ee), k(T), k(w), L(() => {
				J(c, "hidden", B(i) !== "template"), J(h, "hidden", B(i) !== "logs"), J(S, "hidden", B(i) !== "artifacts"), J(w, "hidden", B(i) !== "worktrees");
			}), U(e, t);
		};
		G(ne, (e) => {
			B(n).loading || !B(n).detail ? e(re) : e(ie, -1);
		}), L(() => {
			W(l, B(n).workspaceName), W(x, B(n).resourceTitle), W(w, B(n).resourceTitle), W(E, B(n).resourceId);
		}), V("click", c, () => B(n).onNavigate("workspace")), V("click", h, () => B(n).onNavigate(B(n).resourceId)), U(e, t);
	};
	G(C, (e) => {
		B(n).workspaceId ? B(n).resourceType === "workspace" ? e(T, 1) : e(E, -1) : e(w);
	});
	var ee = I(C, 2);
	Of(ee, {
		get client() {
			return l;
		},
		get workspaceId() {
			return B(n).workspaceId;
		},
		get resourceId() {
			return B(n).resourceId;
		},
		get selection() {
			return B(o);
		},
		onClose: () => P(o, null),
		onError: x,
		get onIconsChanged() {
			return B(n).onIconsChanged;
		}
	}), sf(I(ee, 2), {
		get client() {
			return l;
		},
		get workspaceId() {
			return B(n).workspaceId;
		},
		get resourceId() {
			return B(n).resourceId;
		},
		get repo() {
			return B(s);
		},
		onClose: () => P(s, null),
		onError: x,
		get onIconsChanged() {
			return B(n).onIconsChanged;
		}
	}), U(e, S), We();
}
Sr(["click"]);
//#endregion
//#region src/components/chat-state.ts
var mp = 250, hp = /* @__PURE__ */ new Set(["session.launch-environment"]), gp = class {
	api;
	eventSourceFactory;
	contexts = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	onEvent;
	onNotice;
	activeKey = "";
	disposed = !1;
	constructor(e = {}) {
		this.api = e.api ?? new Qd(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t) {
		if (this.disposed) return;
		let n = String(t?.id || "").trim(), r = Sp(e, n);
		if (this.activeKey && this.activeKey !== r && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !e || !n) {
			this.emit();
			return;
		}
		let i = this.contexts.get(r) ?? this.createContext(e, n);
		i.run = t, i.acceptedSessionIds = Dp(t), this.reconcileNotices(i), !Op(t) && i.stream && (i.streamGeneration++, i.stream.close(), i.stream = null), this.emit(), !i.loaded && !i.loading ? this.loadInitial(i) : this.connect(i);
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.beforeId) return !1;
		let t = e.generation, n = e.beforeId;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest(wp(e, `before=${encodeURIComponent(n)}&limit=${mp}`), { scope: Cp(e, "older") });
			if (!this.isCurrent(e, t)) return !1;
			let i = xp(r.events), a = Tp(i);
			return i.length && (!a || a >= n) ? (e.hasMoreBefore = !1, !1) : (e.events = _p([...i, ...e.events]), a && (e.beforeId = a), e.hasMoreBefore = !!(r.page?.hasMoreBefore && a), i.length > 0);
		} catch (n) {
			return n instanceof Xd || !this.isCurrent(e, t) || (e.error = Mp(n)), !1;
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
			events: e.events.filter((e) => !hp.has(e.type)),
			notices: [...e.notices],
			hasMoreBefore: e.hasMoreBefore,
			loading: e.loading,
			loadingOlder: e.loadingOlder,
			loaded: e.loaded,
			error: e.error
		} : jp();
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
			key: Sp(e, t),
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
			let n = await this.api.latest(wp(e, `latest=true&limit=${mp}`), { scope: Cp(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			let r = xp(n.events).filter((t) => this.eventBelongsToContext(e, t));
			e.events = _p(r), e.beforeId = Tp(r), e.hasMoreBefore = !!(n.page?.hasMoreBefore && e.beforeId), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof Xd || !this.isCurrent(e, t)) return;
			e.error = Mp(n);
		} finally {
			this.isCurrent(e, t) && (e.loading = !1, this.emit());
		}
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !Op(e.run)) return;
		let t = Ep(e.events), n = t ? `?after=${encodeURIComponent(t)}` : "", r = ++e.streamGeneration, i = this.eventSourceFactory(`/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/stream${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.events = vp(e.events, n), this.onEvent?.(e.workspaceId, e.runId, n), this.emit();
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
			Op(e.run) || (i.close(), e.stream = null);
		};
	}
	appendNotice(e, t) {
		let n = kp(t);
		if (n) {
			let r = Number(t.data?.schedulerTurnSequence) || 0, i = e.noticeWatermarks.get(n) || 0;
			if (i && r <= i) return;
			e.noticeWatermarks.set(n, Math.max(i, r)), e.notices = e.notices.filter((e) => kp(e) !== n);
		} else if (e.notices.some((e) => Ap(e) === Ap(t))) return;
		e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20);
	}
	reconcileNotices(e) {
		let t = e.run;
		e.notices = e.notices.filter((e) => {
			if (!kp(e)) return !0;
			let n = e.data || {};
			if (!t || String(n.runId || "") !== t.id || String(n.resourceId || "") !== String(t.resourceId || "") || Number(n.selfDrivingRevision) !== Number(t.selfDrivingRevision)) return !1;
			let r = Number(n.schedulerTurnSequence) || 0, i = Number(t.schedulerTurnSequence) || 0;
			return !(i > r || t.schedulerTurn && (!r || i >= r));
		});
	}
	deactivate(e) {
		e && (e.generation++, e.streamGeneration++, e.stream?.close(), e.stream = null, e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(Cp(e, "initial")), this.api.requests.abort(Cp(e, "older")));
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
function _p(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? yp(r, n) : bp(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function vp(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return e;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		let n = [...e];
		return n.splice(r, 0, bp(t)), n;
	}
	let o = [...e];
	return o[a] = yp(e[a], t), o;
}
function yp(e, t) {
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
function bp(e) {
	return e.data?.append === !0 ? {
		...e,
		data: {
			...e.data,
			append: !1
		}
	} : e;
}
function xp(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function Sp(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function Cp(e, t) {
	return `chat:${e.key}:${t}`;
}
function wp(e, t) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/events?${t}`;
}
function Tp(e) {
	return e.reduce((e, t) => {
		let n = Number(t.id) || 0;
		return n && (!e || n < e) ? n : e;
	}, 0);
}
function Ep(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function Dp(e) {
	return new Set([
		e?.id,
		e?.agentHubSessionId,
		e?.sourceExternalId
	].map((e) => String(e || "").trim()).filter(Boolean));
}
function Op(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e?.status || ""));
}
function kp(e) {
	let t = e.data || {};
	return t.kind !== "self-driving-finish" || t.lifecycle !== "until-reconcile" ? "" : [
		t.kind,
		t.runId,
		t.resourceId,
		t.selfDrivingRevision
	].map((e) => String(e ?? "")).join(":");
}
function Ap(e) {
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
function jp() {
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
function Mp(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/EventTimeline.svelte
var Np = /* @__PURE__ */ H("<button type=\"button\" class=\"load-older-events\"><!><span> </span></button>"), Pp = /* @__PURE__ */ H("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), Fp = /* @__PURE__ */ H("<span class=\"agent-message-tag\">steer</span>"), Ip = /* @__PURE__ */ H("<span class=\"agent-message-source\"> </span>"), Lp = /* @__PURE__ */ H("<div class=\"agent-message-content markdown-rendered\"></div>"), Rp = /* @__PURE__ */ H("<p> </p>"), zp = /* @__PURE__ */ H("<div><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>"), Bp = /* @__PURE__ */ H("<details class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>"), Vp = /* @__PURE__ */ H("<pre> </pre>"), Hp = /* @__PURE__ */ H("<details><summary><!><span> </span><small> </small></summary> <!></details>"), Up = /* @__PURE__ */ H("<details class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>"), Wp = /* @__PURE__ */ H("<p class=\"approval-question\"> </p>"), Gp = /* @__PURE__ */ H("<button> </button>"), Kp = /* @__PURE__ */ H("<div class=\"approval-options\"></div>"), qp = /* @__PURE__ */ H("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), Jp = /* @__PURE__ */ H("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), Yp = /* @__PURE__ */ H("<!> <!>", 1), Xp = /* @__PURE__ */ H("<div class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>"), Zp = /* @__PURE__ */ H("<div><!><span> </span><span class=\"agent-note-time\"> </span></div>"), Qp = /* @__PURE__ */ H("<div class=\"agent-event error\"><div><!><strong>Provider error</strong></div><p> </p></div>"), $p = /* @__PURE__ */ H("<details class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>"), em = /* @__PURE__ */ H("<div><!></div>"), tm = /* @__PURE__ */ H("<div><div><!><strong>Forge</strong></div><p> </p></div>"), nm = /* @__PURE__ */ H("<div class=\"agent-event error\" role=\"alert\"><div><!><strong>Timeline error</strong></div><p> </p></div>"), rm = /* @__PURE__ */ H("<div class=\"tty-empty\"><!><strong>Loading agent events</strong></div>"), im = /* @__PURE__ */ H("<div class=\"tty-empty\"><!><strong>Waiting for agent events</strong></div>"), am = /* @__PURE__ */ H("<!> <!> <!> <!> <!> <!>", 1), om = /* @__PURE__ */ H("<div class=\"tty-empty\"><!><strong>No agent run selected</strong><span> </span></div>"), sm = /* @__PURE__ */ H("<div class=\"event-timeline-root\"><!></div>");
function cm(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(en(ue())), i = /* @__PURE__ */ j(() => B(n).project(B(r).events)), a = /* @__PURE__ */ N(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ N(en(/* @__PURE__ */ new Map())), d = /* @__PURE__ */ N(en(/* @__PURE__ */ new Set())), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ N(en(/* @__PURE__ */ new Map()));
	wi(() => {
		let e = S();
		o = new gp({
			onEvent: (e, t, r) => B(n).onEvent(e, t, r),
			onNotice: (e, t, r) => B(n).onNotice(e, t, r)
		});
		let r = o.subscribe((e) => m(e)), i = t.channel.subscribe((e) => {
			let t = B(n).identity;
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
		if (B(r).identity && e.identity === B(r).identity && C()) {
			s = e;
			return;
		}
		h(e);
	}
	function h(e) {
		let t = S();
		c = e.identity !== B(r).identity || l || w(t), l = !1, P(r, e, !0), t && (t.dataset.agentRunId = e.runId), dr().then(() => {
			c && !C() && T(), B(n).onIconsChanged(), e.loaded && e.hasMoreBefore && g(e.identity);
		});
	}
	async function g(e) {
		let t = 0;
		for (; t < 16 && B(r).identity === e && B(r).hasMoreBefore;) {
			let e = S();
			if (!e || e.scrollHeight > e.clientHeight + 160 || C() || !await o?.loadOlder()) return;
			t++, await dr(), T();
		}
	}
	async function _() {
		let e = S();
		if (!e || B(r).loadingOlder) return;
		let t = E(e), i = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = B(r).identity;
		await o?.loadOlder(), await dr(), B(r).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - i) : s + (e.scrollHeight - a), B(n).onIconsChanged());
	}
	async function v(e, t) {
		let i = String(e.approvalId || "");
		if (!(!i || B(d).has(i))) {
			P(d, new Set(B(d)).add(i), !0);
			try {
				await B(n).onApproval(B(r).runId, i, t);
				let e = new Map(B(u));
				e.delete(te(i)), P(u, e, !0);
			} catch (e) {
				B(n).onToast(e instanceof Error ? e.message : String(e));
			} finally {
				let e = new Set(B(d));
				e.delete(i), P(d, e, !0);
			}
		}
	}
	function y(e, t) {
		let n = ee(e);
		P(p, new Map(B(p)).set(n, t), !0), f.set(B(r).identity, new Map(B(p)));
	}
	function b(e, t) {
		let n = B(p).get(ee(e));
		return typeof n == "boolean" ? n : t === B(i).length - 1 || !!e.calls?.some((e) => e.status === "running");
	}
	function x(e, t) {
		P(u, new Map(B(u)).set(te(e), t), !0);
	}
	function S() {
		return B(a)?.parentElement ?? null;
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
		return `${B(r).identity}:${e}`;
	}
	function ne(e) {
		return e.role === "assistant" ? B(n).agentName || "Agent" : String(e.sender?.name || e.sender?.id || "").trim() || (e.role === "system" ? "System" : e.role === "agent" ? "Agent" : "User");
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
	var de = sm(), fe = F(de), pe = (e) => {
		var t = am(), n = fn(t), a = (e) => {
			var t = Np(), n = F(t);
			{
				let e = /* @__PURE__ */ j(() => B(r).loadingOlder ? "loader-circle" : "chevrons-up");
				Q(n, { get name() {
					return B(e);
				} });
			}
			var i = I(n), a = F(i, !0);
			k(i), k(t), L(() => {
				t.disabled = B(r).loadingOlder, W(a, B(r).loadingOlder ? "Loading..." : "Load older messages");
			}), V("click", t, _), U(e, t);
		};
		G(n, (e) => {
			B(r).hasMoreBefore && e(a);
		});
		var o = I(n, 2);
		K(o, 19, () => B(i), (e) => ee(e), (e, t, n) => {
			var i = em(), a = F(i), o = (e) => {
				let n = /* @__PURE__ */ j(() => [
					"assistant",
					"system",
					"agent"
				].includes(String(B(t).role)) ? String(B(t).role) : "user");
				var r = zp(), i = F(r), a = F(i), o = F(a), s = F(o, !0);
				k(o);
				var c = I(o, 2), l = (e) => {
					var t = Pp(), r = F(t, !0);
					k(t), L(() => W(r, B(n))), U(e, t);
				};
				G(c, (e) => {
					B(n) !== "assistant" && e(l);
				});
				var u = I(c, 2), d = (e) => {
					U(e, Fp());
				};
				G(u, (e) => {
					B(t).steer && e(d);
				});
				var f = I(u, 2), p = (e) => {
					var n = Ip(), r = F(n);
					k(n), L(() => {
						J(n, "title", B(t).sender.sessionId), W(r, `from session ${B(t).sender.sessionId ?? ""}`);
					}), U(e, n);
				};
				G(f, (e) => {
					B(n) === "agent" && B(t).sender?.sessionId && e(p);
				});
				var m = I(f, 2), h = F(m, !0);
				k(m), k(a);
				var g = I(a, 2), _ = F(g), v = (e) => {
					var n = Lp();
					Kr(n, () => ae(B(t).text), !0), k(n), U(e, n);
				}, y = (e) => {
					var n = Rp(), r = F(n, !0);
					k(n), L(() => W(r, B(t).text || "")), U(e, n);
				};
				G(_, (e) => {
					B(n) === "assistant" ? e(v) : e(y, -1);
				}), k(g), k(i), k(r), L((e, t) => {
					q(r, 1, `agent-message-row ${B(n) === "assistant" ? "assistant final" : B(n)}`), W(s, e), W(h, t);
				}, [() => ne(B(t)), () => re(B(t).time)]), U(e, r);
			}, s = (e) => {
				var n = Bp(), r = F(n), i = F(r);
				Q(i, { name: "brain-circuit" });
				var a = I(i), o = F(a, !0);
				k(a);
				var s = I(a);
				Q(F(s), { name: "chevron-right" }), k(s), k(r);
				var c = I(r, 2), l = F(c, !0);
				k(c), k(n), L((e) => {
					n.open = B(t).active, W(o, e), W(l, B(t).text || "");
				}, [() => ie(B(t))]), U(e, n);
			}, c = (e) => {
				let i = /* @__PURE__ */ j(() => B(t).calls || []), a = /* @__PURE__ */ j(() => B(i).map(se));
				var o = Up(), s = F(o), c = F(s);
				Q(F(c), { name: "wrench" }), k(c);
				var l = I(c), u = F(l);
				k(l);
				var d = I(l), f = F(d);
				k(d);
				var p = I(d);
				Q(F(p), { name: "chevron-right" }), k(p), k(s);
				var m = I(s, 2);
				K(m, 21, () => B(i), (e) => String(e.callId || e.key), (e, t) => {
					var n = Hp(), r = F(n), i = F(r);
					{
						let e = /* @__PURE__ */ j(() => B(t).status === "running" ? "loader-circle" : B(t).status === "failed" ? "x-circle" : "check-circle");
						Q(i, { get name() {
							return B(e);
						} });
					}
					var a = I(i), o = F(a, !0);
					k(a);
					var s = I(a), c = F(s, !0);
					k(s), k(r);
					var l = I(r, 2), u = (e) => {
						var n = Vp(), r = F(n, !0);
						k(n), L((e) => W(r, e), [() => ce(B(t))]), U(e, n);
					}, d = /* @__PURE__ */ j(() => ce(B(t)));
					G(l, (e) => {
						B(d) && e(u);
					}), k(n), L((e, t, r) => {
						q(n, 1, e), W(o, t), W(c, r);
					}, [
						() => `agent-tool-item agent-tool-${String(B(t).status || "completed")}`,
						() => se(B(t)),
						() => String(B(t).method || "tool")
					]), U(e, n);
				}), k(m), k(o), L((e, t, n) => {
					J(o, "data-tool-group-key", e), o.open = t, W(u, `${B(i).length ?? ""} tool ${B(i).length === 1 ? "call" : "calls"}`), W(f, `${n ?? ""}${B(a).length > 2 ? ` · +${B(a).length - 2} more` : ""}`);
				}, [
					() => `${B(r).runId}:${String(B(t).key || B(t).time || "tools")}`,
					() => b(B(t), B(n)),
					() => B(a).slice(0, 2).join(" · ")
				]), xr("toggle", o, (e) => y(B(t), e.currentTarget.open)), U(e, o);
			}, l = (e) => {
				let n = /* @__PURE__ */ j(() => String(B(t).approvalId || "")), r = /* @__PURE__ */ j(() => B(u).get(te(B(n))) || "");
				var i = Xp(), a = F(i), o = F(a);
				Q(o, { name: "shield-question" });
				var s = I(o), c = F(s, !0);
				k(s), k(a);
				var l = I(a, 2), f = (e) => {
					var n = Wp(), r = F(n, !0);
					k(n), L(() => W(r, B(t).question)), U(e, n);
				};
				G(l, (e) => {
					B(t).question && e(f);
				});
				var p = I(l, 2), m = (e) => {
					var n = Rp(), r = F(n, !0);
					k(n), L(() => W(r, B(t).detail)), U(e, n);
				};
				G(p, (e) => {
					B(t).detail && e(m);
				});
				var h = I(p, 2), g = (e) => {
					var i = Yp(), a = fn(i), o = (e) => {
						var r = Kp();
						K(r, 21, () => B(t).options, (e) => e.optionId, (e, r) => {
							var i = Gp();
							let a;
							var o = F(i, !0);
							k(i), L((e, t, n) => {
								i.disabled = e, a = q(i, 1, "", null, a, t), W(o, n);
							}, [
								() => B(d).has(B(n)),
								() => ({ "secondary-button": String(B(r).kind || "").startsWith("reject") }),
								() => le(B(r))
							]), V("click", i, () => v(B(t), { optionId: B(r).optionId })), U(e, i);
						}), k(r), U(e, r);
					}, s = (e) => {
						var r = qp(), i = F(r);
						Q(F(i), { name: "check" }), A(), k(i);
						var a = I(i);
						Q(F(a), { name: "x" }), A(), k(a), k(r), L((e, t) => {
							i.disabled = e, a.disabled = t;
						}, [() => B(d).has(B(n)), () => B(d).has(B(n))]), V("click", i, () => v(B(t), { decision: "accept" })), V("click", a, () => v(B(t), { decision: "decline" })), U(e, r);
					};
					G(a, (e) => {
						B(t).options?.length ? e(o) : e(s, -1);
					});
					var c = I(a, 2), l = (e) => {
						var i = Jp(), a = F(i);
						di(a);
						var o = I(a);
						k(i), L((e) => {
							fi(a, B(r)), o.disabled = e;
						}, [() => !B(r).trim() || B(d).has(B(n))]), xr("submit", i, (e) => {
							e.preventDefault(), B(r).trim() && v(B(t), { text: B(r).trim() });
						}), V("input", a, (e) => x(B(n), e.currentTarget.value)), U(e, i);
					};
					G(c, (e) => {
						B(t).question && e(l);
					}), U(e, i);
				}, _ = (e) => {
					var n = Rp(), r = F(n);
					k(n), L(() => W(r, `${(B(t).decision || (B(t).status === "accepted" ? "Allowed" : "Declined")) ?? ""}${B(t).reply ? `: ${B(t).reply}` : ""}`)), U(e, n);
				};
				G(h, (e) => {
					B(t).status === "pending" ? e(g) : e(_, -1);
				}), k(i), L(() => W(c, B(t).title || "Approval requested")), U(e, i);
			}, f = (e) => {
				let n = /* @__PURE__ */ j(() => B(t).tone === "ok" ? "check-circle" : B(t).tone === "danger" ? "triangle-alert" : B(t).tone === "info" ? "info" : "clock");
				var r = Zp(), i = F(r);
				Q(i, { get name() {
					return B(n);
				} });
				var a = I(i), o = F(a, !0);
				k(a);
				var s = I(a), c = F(s, !0);
				k(s), k(r), L((e) => {
					q(r, 1, `agent-system-note agent-lifecycle-${B(t).tone || "muted"}`), W(o, B(t).text || ""), W(c, e);
				}, [() => re(B(t).time)]), U(e, r);
			}, p = (e) => {
				var n = Qp(), r = F(n);
				Q(F(r), { name: "triangle-alert" }), A(), k(r);
				var i = I(r), a = F(i, !0);
				k(i), k(n), L(() => W(a, B(t).text || "")), U(e, n);
			}, m = (e) => {
				var n = $p(), r = F(n), i = F(r);
				Q(i, { name: "info" });
				var a = I(i), o = F(a);
				k(a), k(r);
				var s = I(r), c = F(s, !0);
				k(s), k(n), L(() => {
					W(o, `Unhandled event: ${(B(t).type || B(t).kind) ?? ""}`), W(c, B(t).preview || "This event carries no payload.");
				}), U(e, n);
			};
			G(a, (e) => {
				B(t).kind === "message" ? e(o) : B(t).kind === "thinking" ? e(s, 1) : B(t).kind === "tools" ? e(c, 2) : B(t).kind === "approval" ? e(l, 3) : B(t).kind === "lifecycle" ? e(f, 4) : B(t).kind === "error" ? e(p, 5) : e(m, -1);
			}), k(i), L((e) => J(i, "data-timeline-key", e), [() => ee(B(t))]), U(e, i);
		});
		var s = I(o, 2);
		K(s, 19, () => B(r).notices, (e, t) => `notice:${B(r).identity}:${t}:${String(e.data?.schedulerTurnSequence || e.data?.text || "")}`, (e, t, n) => {
			var r = tm(), i = F(r), a = F(i);
			{
				let e = /* @__PURE__ */ j(() => B(t).data?.level === "error" ? "triangle-alert" : "info");
				Q(a, { get name() {
					return B(e);
				} });
			}
			A(), k(i);
			var o = I(i), s = F(o, !0);
			k(o), k(r), L((e) => {
				J(r, "data-timeline-key", `notice:${B(n)}`), q(r, 1, `agent-event ${B(t).data?.level === "error" ? "error" : "system"}`), W(s, e);
			}, [() => String(B(t).data?.text || "")]), U(e, r);
		});
		var c = I(s, 2), l = (e) => {
			var t = nm(), n = F(t);
			Q(F(n), { name: "triangle-alert" }), A(), k(n);
			var i = I(n), a = F(i, !0);
			k(i), k(t), L(() => W(a, B(r).error)), U(e, t);
		};
		G(c, (e) => {
			B(r).error && e(l);
		});
		var f = I(c, 2), p = (e) => {
			var t = rm();
			Q(F(t), { name: "loader-circle" }), A(), k(t), U(e, t);
		};
		G(f, (e) => {
			B(r).loading && !B(i).length && e(p);
		});
		var m = I(f, 2), h = (e) => {
			var t = im();
			Q(F(t), { name: "loader-circle" }), A(), k(t), U(e, t);
		};
		G(m, (e) => {
			B(r).loaded && !B(r).loading && !B(i).length && !B(r).notices.length && e(h);
		}), U(e, t);
	}, me = (e) => {
		var t = om(), r = F(t);
		Q(r, { name: "bot" });
		var i = I(r, 2), a = F(i, !0);
		k(i), k(t), L(() => W(a, B(n).runCount ? "Select an Agent Run to view its events." : "Start an agent session.")), U(e, t);
	};
	G(fe, (e) => {
		B(r).runId ? e(pe) : e(me, -1);
	}), k(de), Si(de, (e) => P(a, e), () => B(a)), L(() => J(de, "data-chat-context", B(r).identity)), U(e, de), We();
}
Sr(["click", "input"]);
//#endregion
//#region src/components/SelfDrivingBar.svelte
var lm = /* @__PURE__ */ H("<span class=\"self-driving-bar-summary\"> </span>"), um = /* @__PURE__ */ H("<button type=\"button\" class=\"self-driving-bar-toggle\" aria-controls=\"selfDrivingBarDetails\"><!></button>"), dm = /* @__PURE__ */ H("<p> </p>"), fm = /* @__PURE__ */ H("<div class=\"self-driving-bar-details\" id=\"selfDrivingBarDetails\"><small> </small> <!> <!> <!> <!> <!></div>"), pm = /* @__PURE__ */ H("<section role=\"status\"><div class=\"self-driving-bar-row\"><span class=\"self-driving-bar-title\"><!><strong>Self-Driving</strong></span> <span><!><span> </span></span> <!> <span class=\"self-driving-bar-actions\"><button type=\"button\" id=\"selfDrivingSwitch\" class=\"self-driving-switch\" role=\"switch\"><span class=\"self-driving-switch-track\"><span class=\"self-driving-switch-thumb\"></span></span><span> </span></button> <!></span></div> <!></section>");
function mm(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current()));
	wi(() => t.channel.subscribe((e) => {
		P(n, e, !0), queueMicrotask(e.onIconsChanged);
	}));
	let r = /* @__PURE__ */ j(() => B(n).expanded ? "Hide Self-Driving details" : "Show Self-Driving details"), i = /* @__PURE__ */ j(() => B(n).enabled ? "Turn Self-Driving off" : "Turn Self-Driving on");
	var a = Ar(), o = fn(a), s = (e) => {
		var t = pm(), a = F(t), o = F(a);
		Q(F(o), {
			name: "workflow",
			className: "self-driving-title-icon"
		}), A(), k(o);
		var s = I(o, 2), c = F(s);
		Q(c, {
			get name() {
				return B(n).status.icon;
			},
			className: "self-driving-state-icon"
		});
		var l = I(c), u = F(l, !0);
		k(l), k(s);
		var d = I(s, 2), f = (e) => {
			var t = lm(), r = F(t, !0);
			k(t), L(() => {
				J(t, "title", B(n).summary), W(r, B(n).summary);
			}), U(e, t);
		};
		G(d, (e) => {
			B(n).summary && e(f);
		});
		var p = I(d, 2), m = F(p), h = I(F(m)), g = F(h, !0);
		k(h), k(m);
		var _ = I(m, 2), v = (e) => {
			var t = um(), i = F(t);
			{
				let e = /* @__PURE__ */ j(() => B(n).expanded ? "chevron-up" : "chevron-down");
				Q(i, {
					get name() {
						return B(e);
					},
					className: "self-driving-expand-icon"
				});
			}
			k(t), L(() => {
				J(t, "aria-expanded", B(n).expanded), J(t, "title", B(r)), J(t, "aria-label", B(r));
			}), V("click", t, function(...e) {
				B(n).onToggleDetails?.apply(this, e);
			}), U(e, t);
		};
		G(_, (e) => {
			B(n).hasProjection && e(v);
		}), k(p), k(a);
		var y = I(a, 2), b = (e) => {
			var t = fm(), r = F(t), i = F(r);
			k(r);
			var a = I(r, 2), o = (e) => {
				var t = dm(), r = F(t);
				k(t), L(() => W(r, `Actual Agent: ${B(n).actualAgent ?? ""}${B(n).actualReason ? ` · ${B(n).actualReason}` : ""}`)), U(e, t);
			};
			G(a, (e) => {
				B(n).actualAgent && e(o);
			});
			var s = I(a, 2), c = (e) => {
				var t = dm(), r = F(t);
				k(t), L(() => W(r, `Waiting context: ${B(n).waitingSummary ?? ""}`)), U(e, t);
			};
			G(s, (e) => {
				B(n).waitingSummary && e(c);
			});
			var l = I(s, 2), u = (e) => {
				var t = dm(), r = F(t);
				k(t), L(() => W(r, `Wake condition: ${B(n).wakeCondition ?? ""}${B(n).wakeFallback ? " (compatibility fallback)" : ""}`)), U(e, t);
			};
			G(l, (e) => {
				B(n).wakeCondition && e(u);
			});
			var d = I(l, 2), f = (e) => {
				var t = dm(), r = F(t);
				k(t), L(() => W(r, `Last outcome: ${B(n).lastOutcome.status ?? ""}${B(n).lastOutcome.reason ? ` · ${B(n).lastOutcome.reason}` : ""}`)), U(e, t);
			};
			G(d, (e) => {
				B(n).lastOutcome && e(f);
			});
			var p = I(d, 2), m = (e) => {
				var t = dm(), r = F(t);
				k(t), L(() => W(r, `${B(n).statusReason.label ?? ""}: ${B(n).statusReason.text ?? ""}`)), U(e, t);
			};
			G(p, (e) => {
				B(n).statusReason && e(m);
			}), k(t), L((e) => W(i, `Revision ${B(n).revision ?? ""} · Desired state: ${B(n).enabled ? "On" : "Off"}${e ?? ""}`), [() => B(n).preferredProfiles.length ? ` · Preferred: ${B(n).preferredProfiles.join(" → ")}` : " · Workspace default"]), U(e, t);
		};
		G(y, (e) => {
			B(n).hasProjection && B(n).expanded && e(b);
		}), k(t), L(() => {
			q(t, 1, `self-driving-bar self-driving-bar-${B(n).status.key}${B(n).expanded ? " expanded" : ""}`), J(t, "aria-label", `Self-Driving: ${B(n).status.label}`), q(s, 1, `self-driving-state self-driving-state-${B(n).status.key}`), W(u, B(n).status.label), J(m, "aria-checked", B(n).enabled), J(m, "aria-label", B(i)), J(m, "title", B(i)), m.disabled = B(n).pending, J(m, "aria-busy", B(n).pending || void 0), W(g, B(n).enabled ? "On" : "Off");
		}), V("click", m, function(...e) {
			B(n).onToggleEnabled?.apply(this, e);
		}), U(e, t);
	};
	G(o, (e) => {
		B(n).visible && e(s);
	}), U(e, a), We();
}
Sr(["click"]);
//#endregion
//#region src/components/SelfDrivingDialog.svelte
var hm = /* @__PURE__ */ H("<input name=\"agentName\" readonly=\"\" aria-readonly=\"true\"/>"), gm = /* @__PURE__ */ H("<option> </option>"), _m = /* @__PURE__ */ H("<select name=\"agentName\" required=\"\"><option>Select an Agent</option><!></select>"), vm = /* @__PURE__ */ H("<p class=\"self-driving-dialog-error\" role=\"alert\"> </p>"), ym = /* @__PURE__ */ H("<p class=\"self-driving-dialog-error\" role=\"alert\">The result may be unknown. Refresh the task and session state before trying again.</p>"), bm = /* @__PURE__ */ H("<div class=\"self-driving-dialog-layer\" role=\"presentation\"><button class=\"self-driving-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"self-driving-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"selfDrivingDialogTitle\"><header class=\"self-driving-dialog-header\"><strong id=\"selfDrivingDialogTitle\">Configure Self-Driving</strong> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"selfDrivingConfigForm\" class=\"details-form self-driving-dialog-form\"><label><span>Agent</span> <!></label> <label><span>Run instructions <small>(optional)</small></span> <textarea name=\"runInstructions\" rows=\"4\" placeholder=\"Additional Self-Driving instructions\"></textarea></label> <!> <!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function xm(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(en({ ...B(n).draft })), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ N(void 0), s = /* @__PURE__ */ j(() => B(n).submitting || B(n).unknown || !B(n).reuseCurrentSession && (!B(r).agentName || B(n).agents.length === 0));
	wi(() => t.channel.subscribe((e) => {
		P(n, e, !0), e.identity !== B(i) && (P(i, e.identity, !0), P(r, { ...e.draft }, !0), P(a, "")), queueMicrotask(e.onIconsChanged);
	})), wi(() => {
		let e = (e) => {
			if (!B(n).open) return;
			if (e.key === "Escape" && !B(n).submitting) {
				e.preventDefault(), B(n).onClose();
				return;
			}
			if (e.key !== "Tab" || !B(o)) return;
			let t = [...B(o).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
			if (!t.length) return;
			let r = t[0], i = t[t.length - 1];
			e.shiftKey && document.activeElement === r ? (e.preventDefault(), i.focus()) : !e.shiftKey && document.activeElement === i && (e.preventDefault(), r.focus());
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	async function c(e) {
		if (e.preventDefault(), !B(s)) {
			if (!B(n).reuseCurrentSession && !B(r).agentName) {
				P(a, "Select an Agent before enabling Self-Driving.");
				return;
			}
			P(a, ""), await B(n).onSubmit({ ...B(r) });
		}
	}
	var l = Ar(), u = fn(l), d = (e) => {
		var t = bm(), i = F(t), l = I(i, 2), u = F(l), d = I(F(u), 2);
		Q(F(d), { name: "x" }), k(d), k(u);
		var f = I(u, 2), p = F(f), m = I(F(p), 2), h = (e) => {
			var t = hm();
			di(t), _i(t, () => B(r).agentName, (e) => B(r).agentName = e), U(e, t);
		}, g = (e) => {
			var t = _m(), i = F(t);
			i.value = i.__value = "", K(I(i), 17, () => B(n).agents, (e) => e.id, (e, t) => {
				var n = gm(), r = F(n);
				k(n);
				var i = {};
				L(() => {
					W(r, `${B(t).label ?? ""} — ${B(t).summary ?? ""}`), i !== (i = B(t).id) && (n.value = (n.__value = B(t).id) ?? "");
				}), U(e, n);
			}), k(t), L(() => t.disabled = B(n).agents.length === 0 || B(n).submitting), V("input", t, () => P(a, "")), ai(t, () => B(r).agentName, (e) => B(r).agentName = e), U(e, t);
		};
		G(m, (e) => {
			B(n).reuseCurrentSession ? e(h) : e(g, -1);
		}), k(p);
		var _ = I(p, 2), v = I(F(_), 2);
		at(v), k(_);
		var y = I(_, 2), b = (e) => {
			var t = vm(), r = F(t, !0);
			k(t), L(() => W(r, B(a) || B(n).error)), U(e, t);
		};
		G(y, (e) => {
			(B(a) || B(n).error) && e(b);
		});
		var x = I(y, 2), S = (e) => {
			U(e, ym());
		};
		G(x, (e) => {
			B(n).unknown && e(S);
		});
		var C = I(x, 2), w = F(C), T = F(w, !0);
		k(w);
		var E = I(w, 2);
		k(C), k(f), k(l), Si(l, (e) => P(o, e), () => B(o)), k(t), L(() => {
			d.disabled = B(n).submitting, v.disabled = B(n).submitting, w.disabled = B(s), J(w, "aria-busy", B(n).submitting), W(T, B(n).submitting ? "Enabling…" : "Save and Enable"), E.disabled = B(n).submitting;
		}), V("click", i, function(...e) {
			B(n).onClose?.apply(this, e);
		}), V("click", d, function(...e) {
			B(n).onClose?.apply(this, e);
		}), xr("submit", f, c), V("input", v, () => P(a, "")), _i(v, () => B(r).runInstructions, (e) => B(r).runInstructions = e), V("click", E, function(...e) {
			B(n).onClose?.apply(this, e);
		}), U(e, t);
	};
	G(u, (e) => {
		B(n).open && e(d);
	}), U(e, l), We();
}
Sr(["click", "input"]);
//#endregion
//#region src/components/SessionSwitcher.svelte
var Sm = /* @__PURE__ */ H("<button type=\"button\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span></button>"), Cm = /* @__PURE__ */ H("<div class=\"agent-session-menu\"></div>"), wm = /* @__PURE__ */ H("<div class=\"agent-current-session\"><button type=\"button\" class=\"agent-current-run active\" title=\"Switch session\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span> <!></button></div> <!>", 1), Tm = /* @__PURE__ */ H("<div class=\"session-pill\"><strong>No sessions yet</strong><span>Start an agent session from the selected task.</span></div>"), Em = /* @__PURE__ */ H("<div class=\"agent-session-error\" role=\"alert\"> </div>"), Dm = /* @__PURE__ */ H("<div id=\"agentSessions\" class=\"agent-session-switcher\"><!> <!></div>");
function Om(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(!1), i = /* @__PURE__ */ N(""), a = /* @__PURE__ */ N(""), o = /* @__PURE__ */ j(() => B(n).runs.find((e) => e.id === B(n).activeRunId) ?? B(n).runs[0] ?? null);
	wi(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== B(n).identity;
			P(n, e, !0), t && (P(r, !1), P(i, ""), P(a, "")), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			B(r) && !t?.closest(".agent-session-switcher") && P(r, !1);
		};
		return document.addEventListener("click", o), () => {
			e(), document.removeEventListener("click", o);
		};
	});
	async function s(e) {
		if (!e || B(i) || e === B(n).activeRunId) {
			e === B(n).activeRunId && P(r, !B(r));
			return;
		}
		P(i, e, !0), P(a, ""), P(r, !1);
		try {
			await B(n).onSelect(e);
		} catch (e) {
			P(a, e instanceof Error ? e.message : String(e), !0), B(n).onToast(B(a));
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
	var d = Dm(), f = F(d), p = (e) => {
		var t = wm(), a = fn(t), d = F(a), f = F(d), p = F(f), m = F(p, !0);
		k(p);
		var h = I(p, 2), g = F(h), _ = F(g);
		let v;
		var y = I(_, 1, !0);
		k(g);
		var b = I(g, 2), x = F(b, !0);
		k(b), k(h), k(f);
		var S = I(f, 2);
		{
			let e = /* @__PURE__ */ j(() => B(i) ? "loader-circle" : "chevrons-up-down");
			Q(S, {
				get name() {
					return B(e);
				},
				className: "session-select-icon"
			});
		}
		k(d), k(a);
		var C = I(a, 2), w = (e) => {
			var t = Cm();
			K(t, 21, () => B(n).runs, (e) => e.id, (e, t) => {
				var r = Sm();
				let a;
				var o = F(r), d = F(o), f = F(d, !0);
				k(d);
				var p = I(d, 2), m = F(p), h = F(m);
				let g;
				var _ = I(h, 1, !0);
				k(m);
				var v = I(m, 2), y = F(v, !0);
				k(v), k(p), k(o), k(r), L((e, i, o, s, c, l) => {
					a = q(r, 1, "agent-session-menu-row", null, a, { active: B(n).activeRunId === B(t).id }), J(r, "data-agent-run", B(t).id), r.disabled = e, W(f, i), q(m, 1, o), g = q(h, 1, "run-badge-dot", null, g, s), W(_, c), W(y, l);
				}, [
					() => !!B(i),
					() => u(B(t)),
					() => `run-badge run-badge-${c(B(t).status)}`,
					() => ({ "run-badge-pulse": ["running", "attention"].includes(c(B(t).status)) }),
					() => (B(t).status || "unknown").replaceAll("_", " "),
					() => l(B(t).updatedAt)
				]), V("click", r, () => s(B(t).id)), U(e, r);
			}), k(t), U(e, t);
		};
		G(C, (e) => {
			B(r) && e(w);
		}), L((e, t, n, i, a) => {
			J(d, "data-agent-run", B(o).id), J(d, "aria-expanded", B(r)), W(m, e), q(g, 1, t), v = q(_, 1, "run-badge-dot", null, v, n), W(y, i), W(x, a);
		}, [
			() => u(B(o)),
			() => `run-badge run-badge-${c(B(o).status)}`,
			() => ({ "run-badge-pulse": ["running", "attention"].includes(c(B(o).status)) }),
			() => (B(o).status || "unknown").replaceAll("_", " "),
			() => l(B(o).updatedAt)
		]), V("click", d, (e) => {
			e.stopPropagation(), P(r, !B(r));
		}), U(e, t);
	}, m = (e) => {
		U(e, Tm());
	};
	G(f, (e) => {
		B(o) ? e(p) : e(m, -1);
	});
	var h = I(f, 2), g = (e) => {
		var t = Em(), n = F(t, !0);
		k(t), L(() => W(n, B(a))), U(e, t);
	};
	G(h, (e) => {
		B(a) && e(g);
	}), k(d), L(() => J(d, "data-session-context", B(n).identity)), U(e, d), We();
}
Sr(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var km = /* @__PURE__ */ H("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), Am = /* @__PURE__ */ H("<button type=\"button\"><!><span> </span><!></button>"), jm = /* @__PURE__ */ H("<span class=\"settings-pill\">Active</span>"), Mm = /* @__PURE__ */ H("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), Nm = /* @__PURE__ */ H("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Pm = /* @__PURE__ */ H("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span><span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/><span> </span><!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), Fm = /* @__PURE__ */ H("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Im = /* @__PURE__ */ H("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Workspaces</h2><p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/><span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>"), Lm = /* @__PURE__ */ H("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span><input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/><small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>"), Rm = /* @__PURE__ */ H("<span class=\"settings-pill\"> </span>"), zm = /* @__PURE__ */ H("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), Bm = /* @__PURE__ */ H("<div class=\"settings-empty\">No AgentHub agents available.</div>"), Vm = /* @__PURE__ */ H("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>"), Hm = /* @__PURE__ */ H("<option> </option>"), Um = /* @__PURE__ */ H("<span class=\"settings-profile-system-label\">System</span>"), Wm = /* @__PURE__ */ H("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), Gm = /* @__PURE__ */ H("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), Km = /* @__PURE__ */ H("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map chat and Self-Driving preferences to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>"), qm = /* @__PURE__ */ H("<small class=\"settings-notification-help\"> </small>"), Jm = /* @__PURE__ */ H("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span><input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span><input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>"), Ym = /* @__PURE__ */ H("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><aside class=\"settings-tabs\"><div class=\"settings-title\">System Settings</div> <!></aside> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function Xm(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(-1), a = /* @__PURE__ */ N(en(l(B(n)))), o = /* @__PURE__ */ N(""), s = /* @__PURE__ */ N(""), c = /* @__PURE__ */ new Set([
		"default",
		"fast",
		"reasoning",
		"scheduler"
	]);
	wi(() => t.channel.subscribe((e) => {
		P(n, e, !0), e.identity === B(r) ? e.dataVersion !== B(i) && !B(a).dirty && (P(i, e.dataVersion, !0), P(a, l(e), !0)) : (P(r, e.identity, !0), P(i, e.dataVersion, !0), P(a, l(e), !0), P(o, ""), P(s, "")), queueMicrotask(e.onIconsChanged);
	})), wi(() => {
		let e = (e) => {
			B(n).open && e.key === "Escape" && (e.preventDefault(), B(n).onClose(B(a).dirty));
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
			...B(a),
			profiles: B(a).profiles.map((e) => ({ ...e })),
			newProfile: { ...B(a).newProfile }
		};
	}
	function d() {
		B(a).dirty = !0;
	}
	async function f(e) {
		if (e.preventDefault(), !(!B(a).workspacePath.trim() || B(o))) {
			P(o, "workspace");
			try {
				await B(n).onAddWorkspace(u()), B(a).workspacePath = "", B(a).createWorkspace = !1;
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	async function p(e) {
		if (!B(o)) {
			P(o, `remove:${e}`);
			try {
				await B(n).onRemoveWorkspace(e, u());
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	async function m(e, t) {
		if (!B(o)) {
			P(o, `icon:${e}`), P(s, "");
			try {
				await B(n).onWorkspaceIcon(e, t, u());
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	async function h(e) {
		if (e.preventDefault(), !B(o)) {
			P(o, "user");
			try {
				B(a).userName = await B(n).onSaveUser(B(a).userName);
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	function g(e, t, n) {
		B(a).profiles[e][t] = n, d();
	}
	function _() {
		let e = B(a).newProfile.key.trim().toLowerCase();
		if (!e) return B(n).onToast("Profile key is required.");
		if (c.has(e)) return B(n).onToast(`${e} is a reserved system profile.`);
		if (B(a).profiles.some((t) => t.key.trim().toLowerCase() === e)) return B(n).onToast(`Profile ${e} already exists.`);
		B(a).profiles = [...B(a).profiles, {
			key: e,
			description: B(a).newProfile.description.trim(),
			agentName: B(a).newProfile.agentName
		}], B(a).newProfile = {
			key: "",
			description: "",
			agentName: B(n).agents[0]?.id || ""
		}, d();
	}
	function v(e) {
		let t = B(a).profiles[e];
		if (!t || c.has(t.key.trim().toLowerCase())) return B(n).onToast("System profiles cannot be deleted.");
		B(a).profiles = B(a).profiles.filter((t, n) => e !== n), d();
	}
	async function y() {
		if (!(!B(a).dirty || B(o))) {
			P(o, "agenthub");
			try {
				await B(n).onSaveAgentHub(u()), B(a).dirty = !1;
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				P(o, "");
			}
		}
	}
	function b(e) {
		let t = B(n).workspaces.find((t) => t.id === e);
		return B(n).workspaceIcons.find((e) => e.id === (t?.icon || "")) || B(n).workspaceIcons[0];
	}
	function x(e) {
		let t = B(n).agents.map((e) => ({
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
	var C = Ar(), w = fn(C), T = (e) => {
		var t = Ym(), r = fn(t), i = I(r, 2), l = F(i);
		K(I(F(l), 2), 16, () => [
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
		], Lr, (e, t) => {
			var n = Am();
			let r;
			var i = F(n);
			Q(i, { get name() {
				return t[1];
			} });
			var o = I(i), s = F(o, !0);
			k(o);
			var c = I(o), l = (e) => {
				U(e, km());
			};
			G(c, (e) => {
				(t[0] === "agenthub" || t[0] === "profiles") && e(l);
			}), k(n), L(() => {
				r = q(n, 1, "settings-tab", null, r, {
					active: B(a).tab === t[0],
					dirty: B(a).dirty && (t[0] === "agenthub" || t[0] === "profiles")
				}), W(s, t[2]);
			}), V("click", n, () => B(a).tab = t[0]), U(e, n);
		}), k(l);
		var u = I(l, 2), S = F(u);
		Q(F(S), { name: "x" }), k(S);
		var C = I(S, 2), w = (e) => {
			var t = Im(), r = I(F(t), 2), i = F(r);
			di(i);
			var c = I(i, 2), l = F(c);
			di(l), A(), k(c);
			var u = I(c, 2), d = F(u);
			Q(d, { name: "plus" });
			var h = I(d), g = F(h, !0);
			k(h), k(u), k(r);
			var _ = I(r, 2);
			K(_, 21, () => B(n).workspaces, (e) => e.id, (e, t) => {
				let r = /* @__PURE__ */ j(() => b(B(t).id));
				var i = Pm(), a = F(i), c = F(a), l = F(c), u = F(l);
				k(l);
				var d = I(l), f = F(d), h = F(f, !0);
				k(f);
				var g = I(f), _ = F(g, !0);
				k(g), k(d), k(c);
				var v = I(c, 2), y = F(v), x = (e) => {
					U(e, jm());
				};
				G(y, (e) => {
					B(t).id === B(n).activeWorkspaceId && e(x);
				});
				var S = I(y, 2), C = F(S), w = I(C), T = F(w, !0);
				k(w), Q(I(w), { name: "chevron-down" }), k(S);
				var E = I(S, 2);
				Q(F(E), { name: "trash-2" }), k(E), k(v), k(a);
				var ee = I(a, 2), te = (e) => {
					var i = Nm();
					K(i, 21, () => B(n).workspaceIcons, (e) => e.id, (e, n) => {
						var i = Mm();
						let a;
						var o = F(i), s = I(o), c = F(s, !0);
						k(s);
						var l = I(s), u = (e) => {
							Q(e, { name: "check" });
						};
						G(l, (e) => {
							B(n).id === B(r).id && e(u);
						}), k(i), L(() => {
							J(i, "aria-checked", B(n).id === B(r).id), J(i, "title", B(n).label), a = q(i, 1, "", null, a, { selected: B(n).id === B(r).id }), J(o, "src", B(n).src), W(c, B(n).label);
						}), V("click", i, () => m(B(t).id, B(n).id)), U(e, i);
					}), k(i), L(() => J(i, "aria-label", `Icon for ${B(t).name}`)), U(e, i);
				};
				G(ee, (e) => {
					B(s) === B(t).id && e(te);
				}), k(i), L((e, n) => {
					J(u, "src", B(r).src), W(h, B(t).name), W(_, B(t).path), J(S, "aria-expanded", B(s) === B(t).id), S.disabled = e, J(C, "src", B(r).src), W(T, B(o) === `icon:${B(t).id}` ? "Saving..." : B(r).label), E.disabled = n;
				}, [() => !!B(o), () => !!B(o)]), V("click", S, () => P(s, B(s) === B(t).id ? "" : B(t).id, !0)), V("click", E, () => p(B(t).id)), U(e, i);
			}, (e) => {
				U(e, Fm());
			}), k(_), k(t), L((e) => {
				u.disabled = e, W(g, B(a).createWorkspace ? "Create" : "Add");
			}, [() => !!B(o)]), xr("submit", r, f), _i(i, () => B(a).workspacePath, (e) => B(a).workspacePath = e), vi(l, () => B(a).createWorkspace, (e) => B(a).createWorkspace = e), U(e, t);
		}, T = (e) => {
			var t = Lm(), n = I(F(t), 2), r = F(n), i = I(F(r));
			di(i), A(), k(r);
			var s = I(r, 2), c = F(s);
			Q(F(c), { name: "save" }), A(), k(c), k(s), k(n), k(t), L(() => c.disabled = B(o) === "user"), xr("submit", n, h), _i(i, () => B(a).userName, (e) => B(a).userName = e), U(e, t);
		}, E = (e) => {
			var t = Vm(), r = I(F(t), 2), i = F(r), s = I(F(i)), c = F(s, !0);
			k(s), k(i);
			var l = I(i, 2), u = I(F(l));
			di(u), k(l);
			var f = I(l, 2), p = F(f, !0);
			k(f);
			var m = I(f, 2);
			K(m, 21, () => B(n).agentHub.capabilities, Lr, (e, t) => {
				var n = Rm(), r = F(n, !0);
				k(n), L(() => W(r, B(t))), U(e, n);
			}), k(m), k(r);
			var h = I(r, 2), g = F(h), _ = I(F(g)), v = F(_);
			k(_), k(g);
			var b = I(g, 2);
			K(b, 21, () => B(n).agentHub.agents, (e) => e.name, (e, t) => {
				var n = zm(), r = F(n), i = F(r), a = F(i, !0);
				k(i);
				var o = I(i), s = F(o), c = F(s, !0);
				k(s);
				var l = I(s), u = F(l);
				k(l), k(o), k(r), k(n), L((e) => {
					W(a, e), W(c, B(t).name), W(u, `${(B(t).providerId || "") ?? ""} · ${(B(t).available === !1 ? B(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
				}, [() => (B(t).name || "A").slice(0, 1).toUpperCase()]), U(e, n);
			}, (e) => {
				U(e, Bm());
			}), k(b), k(h);
			var x = I(h, 2), S = F(x);
			let C;
			var w = F(S, !0);
			k(S);
			var T = I(S);
			Q(F(T), { name: "save" }), A(), k(T), k(x), k(t), L((e) => {
				W(c, B(n).agentHub.connected && B(n).agentHub.compatible ? "Compatible" : B(n).agentHub.connected ? "Incompatible" : "Unavailable"), W(p, B(n).agentHub.error || `API ${B(n).agentHub.apiVersion || "unknown"} · AgentHub ${B(n).agentHub.version || "unknown"}`), W(v, `${B(n).agentHub.agents.length ?? ""} agents · ${B(n).agentHub.providers.length ?? ""} providers`), C = q(S, 1, "settings-save-hint", null, C, { visible: B(a).dirty }), W(w, B(a).dirty ? "Unsaved changes" : ""), T.disabled = e;
			}, [() => !B(a).dirty || !!B(o)]), V("input", u, d), _i(u, () => B(a).endpoint, (e) => B(a).endpoint = e), V("click", T, y), U(e, t);
		}, ee = (e) => {
			var t = Km(), r = I(F(t), 2), i = F(r), s = I(F(i)), l = F(s);
			k(s), k(i);
			var u = I(i, 2), d = I(F(u), 2);
			K(d, 17, () => B(a).profiles, Lr, (e, t, n) => {
				let r = /* @__PURE__ */ j(() => c.has(B(t).key.trim().toLowerCase()));
				var i = Gm();
				let a;
				var o = F(i);
				di(o);
				var s = I(o, 2);
				di(s);
				var l = I(s, 2);
				K(l, 21, () => x(B(t).agentName), Lr, (e, t) => {
					var n = Hm(), r = F(n, !0);
					k(n);
					var i = {};
					L(() => {
						W(r, B(t).label), i !== (i = B(t).id) && (n.value = (n.__value = B(t).id) ?? "");
					}), U(e, n);
				}), k(l);
				var u;
				ii(l);
				var d = I(l, 2), f = (e) => {
					U(e, Um());
				}, p = (e) => {
					var t = Wm();
					Q(F(t), { name: "trash-2" }), k(t), V("click", t, () => v(n)), U(e, t);
				};
				G(d, (e) => {
					B(r) ? e(f) : e(p, -1);
				}), k(i), L(() => {
					a = q(i, 1, "settings-profile-row", null, a, { "settings-profile-system": B(r) }), fi(o, B(t).key), o.disabled = B(r), fi(s, B(t).description), s.disabled = B(r), u !== (u = B(t).agentName) && (l.value = (l.__value = B(t).agentName) ?? "", ri(l, B(t).agentName));
				}), V("input", o, (e) => g(n, "key", e.currentTarget.value)), V("input", s, (e) => g(n, "description", e.currentTarget.value)), V("change", l, (e) => g(n, "agentName", e.currentTarget.value)), U(e, i);
			});
			var f = I(d, 2), p = F(f);
			di(p);
			var m = I(p, 2);
			di(m);
			var h = I(m, 2);
			K(h, 21, () => B(n).agents, Lr, (e, t) => {
				var n = Hm(), r = F(n, !0);
				k(n);
				var i = {};
				L(() => {
					W(r, B(t).label), i !== (i = B(t).id) && (n.value = (n.__value = B(t).id) ?? "");
				}), U(e, n);
			}), k(h);
			var b = I(h, 2);
			Q(F(b), { name: "plus" }), A(), k(b), k(f), k(u), k(r);
			var S = I(r, 2), C = F(S);
			let w;
			var T = F(C, !0);
			k(C);
			var E = I(C);
			Q(F(E), { name: "save" }), A(), k(E), k(S), k(t), L((e) => {
				W(l, `${B(a).profiles.length ?? ""} routes`), h.disabled = !B(n).agents.length, b.disabled = !B(n).agents.length, w = q(C, 1, "settings-save-hint", null, w, { visible: B(a).dirty }), W(T, B(a).dirty ? "Unsaved changes" : ""), E.disabled = e;
			}, [() => !B(a).dirty || !!B(o)]), _i(p, () => B(a).newProfile.key, (e) => B(a).newProfile.key = e), _i(m, () => B(a).newProfile.description, (e) => B(a).newProfile.description = e), ai(h, () => B(a).newProfile.agentName, (e) => B(a).newProfile.agentName = e), V("click", b, _), V("click", E, y), U(e, t);
		}, te = (e) => {
			var t = Jm(), r = I(F(t), 2), i = F(r), a = I(F(i));
			di(a), k(i);
			var o = I(i, 2), s = (e) => {
				var t = qm(), r = F(t, !0);
				k(t), L(() => W(r, B(n).notifications.permissionError)), U(e, t);
			};
			G(o, (e) => {
				B(n).notifications.permissionError && e(s);
			}), k(r);
			var c = I(r, 2), l = F(c), u = I(F(l));
			di(u), k(l);
			var d = I(l, 2), f = F(d, !0);
			k(d), k(c), k(t), L(() => {
				pi(a, B(n).notifications.browser), pi(u, B(n).notifications.sound), W(f, B(n).notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
			}), V("change", a, (e) => B(n).onBrowserNotifications(e.currentTarget.checked)), V("change", u, (e) => B(n).onCompletionSound(e.currentTarget.checked)), U(e, t);
		};
		G(C, (e) => {
			B(a).tab === "workspace" ? e(w) : B(a).tab === "user" ? e(T, 1) : B(a).tab === "agenthub" ? e(E, 2) : B(a).tab === "profiles" ? e(ee, 3) : e(te, -1);
		}), k(u), k(i), V("click", r, () => B(n).onClose(B(a).dirty)), V("click", S, () => B(n).onClose(B(a).dirty)), U(e, t);
	};
	G(w, (e) => {
		B(n).open && e(T);
	}), U(e, C), We();
}
Sr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region src/components/Toast.svelte
var Zm = /* @__PURE__ */ H("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function Qm(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(!1), i = null;
	wi(() => {
		let e = t.channel.subscribe((e) => {
			P(n, e, !0), P(r, !!e.message, !0), i !== null && window.clearTimeout(i), B(r) && (i = window.setTimeout(() => {
				P(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = Zm(), o = F(a, !0);
	k(a), L(() => {
		J(a, "hidden", !B(r)), W(o, B(n).message);
	}), U(e, a), We();
}
//#endregion
//#region src/components/UploadDialog.svelte
var $m = /* @__PURE__ */ H("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), eh = /* @__PURE__ */ H("<small class=\"upload-result-path\"> </small>"), th = /* @__PURE__ */ H("<small class=\"upload-error\"> </small>"), nh = /* @__PURE__ */ H("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), rh = /* @__PURE__ */ H("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this session's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function ih(e, t) {
	Ue(t, !0);
	let n = /* @__PURE__ */ N(en(t.channel.current())), r = /* @__PURE__ */ N(""), i = /* @__PURE__ */ N(en([])), a = 1, o = /* @__PURE__ */ N(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ j(() => B(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ j(() => B(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ j(() => B(i).filter((e) => e.status === "error").length);
	wi(() => {
		let e = t.channel.subscribe((e) => {
			P(n, e, !0), e.identity !== B(r) && (d(), P(r, e.identity, !0), P(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			if (!B(n).open) return;
			let t = f(e.clipboardData);
			t.length && (e.preventDefault(), m(t));
		};
		document.addEventListener("paste", o);
		let s = (e) => {
			B(n).open && e.key === "Escape" && !B(c) && (e.preventDefault(), _());
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
		if (!B(n).open || !t.length) return;
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
		P(i, [...B(i), ...r], !0);
		for (let e of r) g(e, B(n).identity, B(n).workspaceId, B(n).runId);
	}
	function h(e, t) {
		P(i, B(i).map((n) => n.id === e ? {
			...n,
			...t
		} : n), !0);
	}
	function g(e, t, r, i) {
		h(e.id, { status: "uploading" });
		let a = new XMLHttpRequest();
		s.set(e.id, a), a.open("POST", `/api/workspaces/${encodeURIComponent(r)}/agent/runs/${encodeURIComponent(i)}/uploads`), a.responseType = "json", a.upload.addEventListener("progress", (r) => {
			B(n).identity !== t || !r.lengthComputable || h(e.id, { progress: Math.min(99, Math.round(r.loaded / r.total * 100)) });
		}), a.addEventListener("load", () => {
			if (s.delete(e.id), B(n).identity !== t || B(n).workspaceId !== r || B(n).runId !== i) return;
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
			s.delete(e.id), B(n).identity === t && h(e.id, {
				status: "error",
				error: "Network error while uploading."
			});
		});
		let o = new FormData();
		o.append("file", e.file, e.name), a.send(o);
	}
	function _() {
		B(c) || B(n).onDone(B(i).filter((e) => e.status === "success" && e.path).map((e) => e.path), {
			workspaceId: B(n).workspaceId,
			runId: B(n).runId
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
	var b = Ar(), x = fn(b), S = (e) => {
		var t = rh(), n = F(t), r = I(n, 2), a = F(r), s = I(F(a), 2);
		Q(F(s), { name: "x" }), k(s), k(a);
		var d = I(a, 2), f = F(d);
		Si(f, (e) => P(o, e), () => B(o));
		var p = I(f, 2), h = F(p);
		Q(h, { name: "clipboard-paste" });
		var g = I(h, 4);
		Q(F(g), { name: "folder-open" }), A(), k(g), k(p);
		var b = I(p, 2), x = F(b), S = (e) => {
			U(e, $m());
		};
		G(x, (e) => {
			B(i).length || e(S);
		}), K(I(x, 2), 17, () => B(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ j(() => y(B(t)));
			var r = nh();
			let i;
			var a = F(r), o = F(a);
			Q(o, { get name() {
				return B(n).icon;
			} });
			var s = I(o), c = F(s), l = F(c, !0);
			k(c);
			var u = I(c), d = F(u, !0);
			k(u), k(s);
			var f = I(s), p = F(f, !0);
			k(f), k(a);
			var m = I(a, 2), h = F(m);
			let g;
			k(m);
			var _ = I(m, 2), b = (e) => {
				var n = eh(), r = F(n, !0);
				k(n), L(() => W(r, B(t).path)), U(e, n);
			};
			G(_, (e) => {
				B(t).status === "success" && e(b);
			});
			var x = I(_, 2), S = (e) => {
				var n = th(), r = F(n, !0);
				k(n), L(() => W(r, B(t).error || "Upload failed")), U(e, n);
			};
			G(x, (e) => {
				B(t).status === "error" && e(S);
			}), k(r), L((e) => {
				i = q(r, 1, "upload-item", null, i, {
					"upload-item-success": B(t).status === "success",
					"upload-item-error": B(t).status === "error",
					"upload-item-uploading": B(t).status === "uploading"
				}), W(l, B(t).name), W(d, e), W(p, B(n).label), J(m, "aria-label", B(t).name), J(m, "aria-valuenow", B(t).progress), g = ni(h, "", g, { width: `${B(t).progress}%` });
			}, [() => v(B(t).size)]), U(e, r);
		}), k(b), k(d);
		var C = I(d, 2), w = F(C), T = F(w, !0);
		k(w);
		var E = I(w, 2);
		k(C), k(r), k(t), L(() => {
			s.disabled = B(c), W(T, B(c) ? "Wait for uploads to finish before closing." : B(i).length ? `${B(l)} uploaded${B(u) ? ` · ${B(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), E.disabled = B(c);
		}), V("click", n, _), V("click", s, _), V("change", f, () => B(o).files && m(B(o).files)), xr("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), xr("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), xr("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), V("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), B(o).click());
		}), V("click", g, () => B(o).click()), V("click", E, _), U(e, t);
	};
	G(x, (e) => {
		B(n).open && e(S);
	}), U(e, b), We();
}
Sr([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/components/component-registry.ts
var ah = /* @__PURE__ */ new Map();
async function oh(e, t, n) {
	await sh(e), t.replaceChildren(), ah.set(e, n(t));
}
async function sh(e) {
	let t = ah.get(e);
	t && (ah.delete(e), await t());
}
async function ch() {
	let e = [...ah.keys()].reverse();
	for (let t of e) await sh(t);
}
//#endregion
//#region src/components/model-channel.ts
function lh(e) {
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
var $ = () => void 0, uh = async () => void 0, dh = [{
	id: "",
	label: "Forge default",
	src: "/favicon.svg"
}], fh = lh({
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
	onSwitchWorkspace: uh,
	onAddWorkspace: $,
	onCreateProject: $,
	onOpenSettings: $,
	onToggleProject: uh,
	onSelectResource: uh,
	onReorder: uh,
	onDragState: $,
	onPanePreview: $,
	onPaneCommit: $,
	onPaneViewport: $,
	onMobileSidebar: $,
	onMobileView: $,
	onMobileImmersive: $,
	onToast: $,
	onIconsChanged: $,
	onHistoryNavigation: uh
}), ph = lh({
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
	onPreview: uh,
	onSubmit: uh,
	previewRequestKey: () => "",
	onConfirmTemplateSwitch: () => !0,
	onIconsChanged: $
}), mh = lh({
	open: !1,
	identity: "",
	dataVersion: 0,
	initialTab: "workspace",
	workspaces: [],
	activeWorkspaceId: "",
	workspaceIcons: dh,
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
	onAddWorkspace: uh,
	onRemoveWorkspace: uh,
	onWorkspaceIcon: uh,
	onSaveUser: async (e) => e,
	onSaveAgentHub: uh,
	onBrowserNotifications: $,
	onCompletionSound: $,
	onToast: $,
	onIconsChanged: $
}), hh = lh({
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
	onSubmit: uh,
	onIconsChanged: $
}), gh = lh({
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
}), _h = lh({
	message: "",
	revision: 0
}), vh = lh({
	open: !1,
	identity: "",
	workspaceId: "",
	runId: "",
	onDone: $,
	onIconsChanged: $
}), yh = lh({
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
}), bh = lh({
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
	onLoadMoreLogs: uh,
	onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
	onToast: $,
	onIconsChanged: $
}), xh = lh({
	identity: "",
	workspaceId: "",
	resourceId: "",
	activeRunId: "",
	runs: [],
	switchingRunId: "",
	onSelect: uh,
	onToast: $,
	onIconsChanged: $
}), Sh = lh({
	identity: "",
	workspaceId: "",
	activeRunId: "",
	activeRun: null,
	runCount: 0,
	agentName: "Agent",
	project: () => [],
	onEvent: $,
	onNotice: $,
	onApproval: uh,
	onToast: $,
	onIconsChanged: $
});
async function Ch() {
	await wh("app-shell", "app", td, { channel: fh });
}
async function wh(e, t, n, r) {
	let i = document.getElementById(t);
	i && await oh(e, i, (t) => {
		t.dataset.componentOwner = e;
		let i = jr(n, {
			target: t,
			props: r
		});
		return async () => {
			delete t.dataset.componentOwner, await Fr(i);
		};
	});
}
async function Th() {
	await Promise.all([
		wh("create-dialog", "createDialogRoot", Jd, { channel: ph }),
		wh("settings", "settingsRoot", Xm, { channel: mh }),
		wh("self-driving-dialog", "selfDrivingDialogRoot", xm, { channel: hh }),
		wh("self-driving-bar", "selfDrivingBarWrap", mm, { channel: gh }),
		wh("upload-dialog", "uploadDialogRoot", ih, { channel: vh }),
		wh("chat-composer", "ttyComposer", hd, { channel: yh }),
		wh("session-switcher", "agentSessionsWrap", Om, { channel: xh }),
		wh("event-timeline", "ttyLog", cm, { channel: Sh }),
		wh("detail-panel", "detailsPanel", pp, { channel: bh }),
		wh("toast", "toastRoot", Qm, { channel: _h })
	]);
}
var Eh = {
	renderAppShell: (e) => fh.publish(e),
	renderCreateDialog: (e) => ph.publish(e),
	renderSettings: (e) => mh.publish(e),
	renderSelfDrivingDialog: (e) => hh.publish(e),
	renderSelfDrivingBar: (e) => gh.publish(e),
	renderUploadDialog: (e) => vh.publish(e),
	renderComposer: (e) => yh.publish(e),
	renderSessionSwitcher: (e) => xh.publish(e),
	renderEventTimeline: (e) => Sh.publish(e),
	renderDetailPanel: (e) => bh.publish(e),
	renderToast: (e) => _h.publish(e)
};
window.addEventListener("pagehide", () => {
	Fu(), ch();
}), window.addEventListener("pageshow", (e) => {
	e.persisted && (async () => {
		await Ch(), await Th(), Nu(Eh);
	})();
}), (async () => {
	await Ch(), await Th(), Nu(Eh);
})().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
