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
	return Fe(/* @__PURE__ */ fn(D));
}
function O(e) {
	if (E) {
		if (/* @__PURE__ */ fn(D) !== null) throw je(), Te;
		D = e;
	}
}
function k(e = 1) {
	if (E) {
		for (var t = e, n = D; t--;) n = /* @__PURE__ */ fn(n);
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
		var i = /* @__PURE__ */ fn(n);
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
function We(e, t = !1, n) {
	He = {
		p: He,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: z,
		l: null
	};
}
function Ge(e) {
	var t = He, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Cn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, He = t.p, e ?? {};
}
function Ke() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var qe = [];
function Je() {
	var e = qe;
	qe = [], f(e);
}
function Ye(e) {
	if (qe.length === 0 && !Mt) {
		var t = qe;
		queueMicrotask(() => {
			t === qe && Je();
		});
	}
	qe.push(e);
}
function Xe() {
	for (; qe.length > 0;) Je();
}
function Ze(e) {
	var t = z;
	if (t === null) return R.f |= ne, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Qe(e, t);
}
function Qe(e, t) {
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
var $e = ~(h | g | m);
function et(e, t) {
	e.f = e.f & $e | t;
}
function tt(e) {
	e.f & 512 || e.deps === null ? et(e, m) : et(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function nt(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, nt(t.deps));
}
function rt(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), nt(e.deps), et(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var it = !1;
function at(e) {
	var t = it;
	try {
		return it = !1, [e(), it];
	} finally {
		it = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function ot(e) {
	E && /* @__PURE__ */ dn(e) !== null && pn(e);
}
var st = !1;
function ct() {
	st || (st = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ue]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function lt(e) {
	var t = R, n = z;
	Kn(null), qn(null);
	try {
		return e();
	} finally {
		Kn(t), qn(n);
	}
}
function ut(e, t, n, r = n) {
	e.addEventListener(t, () => lt(n));
	let i = e[ue];
	e[ue] = i ? () => {
		i(), r(!0);
	} : () => r(!0), ct();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function dt(e) {
	let t = 0, n = Yt(0), r;
	return () => {
		bn() && (B(n), Dn(() => (t === 0 && (r = mr(() => e(() => $t(n)))), t += 1, () => {
			Ye(() => {
				--t, t === 0 && (r?.(), r = void 0, $t(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ft = x | S;
function pt(e, t, n, r) {
	new mt(e, t, n, r);
}
var mt = class {
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
	#h = dt(() => (this.#m = Yt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = z;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = z.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = On(() => {
			if (E) {
				let e = this.#t;
				Ie();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ft), E && (this.#e = D);
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
		Ye(r), t && (this.#s = kn(() => {
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
			t = !0, n && we(), this.#s !== null && In(this.#s, () => {
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
					Qe(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = kn(() => e(this.#e)), Ye(() => {
			var e = this.#c = document.createDocumentFragment(), t = un();
			e.append(t), this.#a = this.#S(() => kn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, In(this.#o, () => {
				this.#o = null;
			}), this.#x(j));
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
			} else this.#x(j);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		rt(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = z, n = R, r = He;
		qn(this.#i), Kn(this.#i), Ue(this.#i.ctx);
		try {
			return Rt.ensure(), e();
		} catch (e) {
			return Ze(e), null;
		} finally {
			qn(t), Kn(n), Ue(r);
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
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ye(() => {
			this.#d = !1, this.#m && Zt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), B(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		j?.is_fork ? (this.#a && j.skip_effect(this.#a), this.#o && j.skip_effect(this.#o), this.#s && j.skip_effect(this.#s), j.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (Nn(this.#a), null), this.#o &&= (Nn(this.#o), null), this.#s &&= (Nn(this.#s), null), E && (Fe(this.#t), k(), Fe(Le()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return kn(() => {
						var r = z;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Qe(e, this.#i.parent), null;
				}
			}));
		};
		Ye(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Qe(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Qe(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function ht(e, t, n, r) {
	let i = Ke() ? yt : St;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = z, c = gt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Qe(e, s);
			}
			_t();
		}
	}
	var d = vt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ xt(e))).then(u).catch((e) => Qe(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), _t();
	}) : f();
}
function gt() {
	var e = z, t = R, n = He, r = j;
	return function(i = !0) {
		qn(e), Kn(t), Ue(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function _t(e = !0) {
	qn(null), Kn(null), Ue(null), e && j?.deactivate();
}
function vt() {
	var e = z, t = e.b, n = j, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function yt(e) {
	var t = 2 | h;
	return z !== null && (z.f |= S), {
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
		parent: z,
		ac: null
	};
}
var bt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function xt(e, t, n) {
	let r = z;
	r === null && me();
	var i = void 0, a = Yt(Ee), o = !R, s = /* @__PURE__ */ new Set();
	return En(() => {
		var t = z, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== de && n.reject(e);
			}).finally(_t);
		} catch (e) {
			n.reject(e), _t();
		}
		var c = j;
		if (o) {
			if (t.f & 32768) var l = vt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(bt);
			else for (let e of s.values()) e.reject(bt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== bt && (c.activate(), t ? (a.f |= ne, Zt(a, t)) : (a.f & 8388608 && (a.f ^= ne), Zt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), xn(() => {
		for (let e of s) e.reject(bt);
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
function A(e) {
	let t = /* @__PURE__ */ yt(e);
	return Yn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function St(e) {
	let t = /* @__PURE__ */ yt(e);
	return t.equals = Ve, t;
}
function Ct(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) Nn(t[n]);
	}
}
function wt(e) {
	var t, n = z, r = e.parent;
	if (!Un && r !== null && e.v !== Ee && r.f & 24576) return Ae(), e.v;
	qn(r);
	try {
		e.f &= ~T, Ct(e), t = sr(e);
	} finally {
		qn(n);
	}
	return t;
}
function Tt(e) {
	var t = wt(e);
	if (!e.equals(t) && (e.wv = ir(), (!j?.is_fork || e.deps === null) && (j === null ? e.v = t : (j.capture(e, t, !0), kt?.capture(e, t, !0)), e.deps === null))) {
		et(e, m);
		return;
	}
	Un || (At === null ? tt(e) : (bn() || j?.is_fork) && At.set(e, t));
}
function Et(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && lt(() => {
		t.ac.abort(de), t.ac = null;
	}), t.fn !== null && (t.teardown = d), lr(t, 0), jn(t));
}
function Dt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && ur(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Ot = null, j = null, kt = null, At = null, jt = null, Mt = !1, Nt = !1, Pt = null, Ft = null, It = 0, Lt = 1, Rt = class e {
	id = Lt++;
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
		Ot === null ? Ot = this : (Ot.#n = this, this.#t = Ot), Ot = this;
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
			for (var r of n.d) et(r, h), t(r);
			for (r of n.m) et(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, It++ > 1e3 && (this.#x(), Bt());
		for (let e of this.#u) this.#d.delete(e), et(e, h), this.schedule(e);
		for (let e of this.#d) et(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = Pt = [], r = [], i = Ft = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Gt(e), this.#h() || this.discard(), t;
		}
		if (j = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (Pt = null, Ft = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Wt(e, t);
			i.length > 0 && j.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), kt = this, Ht(r), Ht(n), kt = null, this.#s?.resolve();
		var s = j;
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), et(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), j = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) rt(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== Ee && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), At?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		j = this;
	}
	deactivate() {
		j = null, At = null;
	}
	flush() {
		try {
			Nt = !0, j = this, this.#g();
		} finally {
			It = 0, jt = null, Pt = null, Ft = null, Nt = !1, j = null, At = null, qt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(bt);
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
		this.#m || (this.#m = !0, Ye(() => {
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
		if (j === null) {
			let t = j = new e();
			!Nt && !Mt && Ye(() => {
				t.#e || t.flush();
			});
		}
		return j;
	}
	apply() {
		At = null;
	}
	schedule(e) {
		if (jt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (Pt !== null && t === z && (R === null || !(R.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Ot = e : t.#t = e, this.linked = !1;
		}
	}
};
function zt(e) {
	var t = Mt;
	Mt = !0;
	try {
		var n;
		for (e && (j !== null && !j.is_fork && j.flush(), n = e());;) {
			if (Xe(), j === null) return n;
			j.flush();
		}
	} finally {
		Mt = t;
	}
}
function Bt() {
	try {
		ye();
	} catch (e) {
		Qe(e, jt);
	}
}
var Vt = null;
function Ht(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && ar(r) && (Vt = /* @__PURE__ */ new Set(), ur(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Fn(r), Vt?.size > 0)) {
				qt.clear();
				for (let e of Vt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Vt.has(n) && (Vt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || ur(n);
					}
				}
				Vt.clear();
			}
		}
		Vt = null;
	}
}
function Ut(e) {
	j.schedule(e);
}
function Wt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), et(e, m);
		for (var n = e.first; n !== null;) Wt(n, t), n = n.next;
	}
}
function Gt(e) {
	et(e, m);
	for (var t = e.first; t !== null;) Gt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Kt = /* @__PURE__ */ new Set(), qt = /* @__PURE__ */ new Map(), Jt = !1;
function Yt(e, t) {
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
function M(e, t) {
	let n = Yt(e, t);
	return Yn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Xt(e, t = !1, n = !0) {
	let r = Yt(e);
	return t || (r.equals = Ve), r;
}
function N(e, t, n = !1) {
	return R !== null && (!Gn || R.f & 131072) && Ke() && R.f & 4325394 && (Jn === null || !Jn.has(e)) && Ce(), Zt(e, n ? tn(t) : t, Ft);
}
function Zt(e, t, n = null) {
	if (!e.equals(t)) {
		qt.set(e, Un ? t : e.v);
		var r = Rt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && wt(t), At === null && tt(t);
		}
		e.wv = ir(), en(e, h, n), Ke() && z !== null && z.f & 1024 && !(z.f & 96) && (Qn === null ? $n([e]) : Qn.push(e)), !r.is_fork && Kt.size > 0 && !Jt && Qt();
	}
	return t;
}
function Qt() {
	Jt = !1;
	for (let e of Kt) {
		e.f & 1024 && et(e, g);
		let t;
		try {
			t = ar(e);
		} catch {
			t = !0;
		}
		t && ur(e);
	}
	Kt.clear();
}
function $t(e) {
	N(e, e.v + 1);
}
function en(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ke(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === z)) {
			var l = (c & h) === 0;
			if (l && et(s, t), c & 131072) Kt.add(s);
			else if (c & 2) {
				var u = s;
				At?.delete(u), c & 65536 || (c & 512 && (z === null || !(z.f & 2097152)) && (s.f |= T), en(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Vt !== null && Vt.add(d), n === null ? Ut(d) : n.push(d);
			}
		}
	}
}
function tn(t) {
	if (typeof t != "object" || !t || re in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ M(0), u = null, d = nr, f = (e) => {
		if (nr === d) return e();
		var t = R, n = nr;
		Kn(null), rr(d);
		var r = e();
		return Kn(t), rr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ M(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && xe();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ M(n.value, u);
				return r.set(t, e), e;
			}) : N(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ M(Ee, u));
					r.set(t, e), $t(o);
				}
			} else N(n, Ee), $t(o);
			return !0;
		},
		get(e, n, i) {
			if (n === re) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ M(tn(s ? e[n] : Ee), u)), r.set(n, o)), o !== void 0) {
				var c = B(o);
				return c === Ee ? void 0 : c;
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
			return (n !== void 0 || z !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ M(i ? tn(e[t]) : Ee, u)), r.set(t, n)), B(n) === Ee) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ M(Ee, u)), r.set(d + "", p)) : N(p, Ee);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ M(void 0, u)), N(c, tn(n)), r.set(t, c));
			else {
				l = c.v !== Ee;
				var m = f(() => tn(n));
				N(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && N(g, _ + 1);
				}
				$t(o);
			}
			return !0;
		},
		ownKeys(e) {
			B(o);
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
function nn(e) {
	try {
		if (typeof e == "object" && e && re in e) return e[re];
	} catch {}
	return e;
}
function rn(e, t) {
	return Object.is(nn(e), nn(t));
}
var an, on, sn, cn;
function ln() {
	if (an === void 0) {
		an = window, on = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		sn = a(t, "firstChild").get, cn = a(t, "nextSibling").get, u(e) && (e[se] = void 0, e[oe] = null, e[ce] = void 0, e.__e = void 0), u(n) && (n[le] = void 0);
	}
}
function un(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function dn(e) {
	return sn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function fn(e) {
	return cn.call(e);
}
function P(e, t) {
	if (!E) return /* @__PURE__ */ dn(e);
	var n = /* @__PURE__ */ dn(D);
	if (n === null) n = D.appendChild(un());
	else if (t && n.nodeType !== 3) {
		var r = un();
		return n?.before(r), Fe(r), r;
	}
	return t && gn(n), Fe(n), n;
}
function F(e, t = !1) {
	if (!E) {
		var n = /* @__PURE__ */ dn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ fn(n) : n;
	}
	if (t) {
		if (D?.nodeType !== 3) {
			var r = un();
			return D?.before(r), Fe(r), r;
		}
		gn(D);
	}
	return D;
}
function I(e, t = 1, n = !1) {
	let r = E ? D : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ fn(r);
	if (!E) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = un();
			return r === null ? i?.after(a) : r.before(a), Fe(a), a;
		}
		gn(r);
	}
	return Fe(r), r;
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
	z === null && (R === null && ve(e), _e()), Un && ge(e);
}
function vn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function yn(e, t) {
	var n = z;
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
	j?.register_created_effect(r);
	var i = r;
	if (e & 4) Pt === null ? Rt.ensure().schedule(r) : Pt.push(r);
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
	return et(t, m), t.teardown = e, t;
}
function Sn(e) {
	_n("$effect");
	var t = z.f;
	if (!R && t & 32 && He !== null && !He.i) {
		var n = He;
		(n.e ??= []).push(e);
	} else return Cn(e);
}
function Cn(e) {
	return yn(4 | C, e);
}
function wn(e) {
	Rt.ensure();
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
	return yn(te | S, e);
}
function Dn(e, t = 0) {
	return yn(8 | t, e);
}
function L(e, t = [], n = [], r = []) {
	ht(r, t, n, (t) => {
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
		e !== null && lt(() => {
			e.abort(de);
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
		var n = e === t ? null : /* @__PURE__ */ fn(e);
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
		e.f ^= _, e.f & 1024 || (et(e, h), Rt.ensure().schedule(e));
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
		var i = n === r ? null : /* @__PURE__ */ fn(n);
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
			if (ar(a) && Tt(a), a.wv > e.wv) return !0;
		}
		t & 512 && At === null && et(e, m);
	}
	return !1;
}
function or(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Jn !== null && Jn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? or(a, t, !1) : t === a && (n ? et(a, h) : a.f & 1024 && et(a, g), Ut(a));
	}
}
function sr(e) {
	var t = Xn, n = Zn, r = Qn, i = R, a = Jn, o = He, s = Gn, c = nr, l = e.f;
	Xn = null, Zn = 0, Qn = null, R = l & 96 ? null : e, Jn = null, Ue(e.ctx), Gn = !1, nr = ++tr, e.ac !== null && (lt(() => {
		e.ac.abort(de);
	}), e.ac = null);
	try {
		e.f |= ee;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = j?.is_fork;
		if (Xn !== null) {
			var m;
			if (p || lr(e, Zn), f !== null && Zn > 0) for (f.length = Zn + Xn.length, m = 0; m < Xn.length; m++) f[Zn + m] = Xn[m];
			else e.deps = f = Xn;
			if (bn() && e.f & 512) for (m = Zn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Zn < f.length && (lr(e, Zn), f.length = Zn);
		if (Ke() && Qn !== null && !Gn && f !== null && !(e.f & 6146)) for (m = 0; m < Qn.length; m++) or(Qn[m], e);
		if (i !== null && i !== e) {
			if (tr++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = tr;
			if (t !== null) for (let e of t) e.rv = tr;
			Qn !== null && (r === null ? r = Qn : r.push(...Qn));
		}
		return e.f & 8388608 && (e.f ^= ne), d;
	} catch (e) {
		return Ze(e);
	} finally {
		e.f ^= ee, Xn = t, Zn = n, Qn = r, R = i, Jn = a, Ue(o), Gn = s, nr = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== Ee && tt(s), s.ac !== null && lt(() => {
			s.ac.abort(de), s.ac = null, et(s, h);
		}), Et(s), lr(s, 0);
	}
}
function lr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) cr(e, n[r]);
}
function ur(e) {
	var t = e.f;
	if (!(t & 16384)) {
		et(e, m);
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
	await Promise.resolve(), zt();
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
	if (Un && qt.has(e)) return qt.get(e);
	if (t) {
		var a = e;
		if (Un) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || pr(a)) && (o = wt(a)), qt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Gn && R !== null && (Hn || !!(R.f & 512)), c = (a.f & y) === 0;
		ar(a) && (s && (a.f |= 512), Tt(a)), s && !c && (Dt(a), fr(a));
	}
	if (At?.has(e)) return At.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function fr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Dt(t), fr(t));
}
function pr(e) {
	if (e.v === Ee) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (qt.has(t) || t.f & 2 && pr(t)) return !0;
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
		if (r.capture || wr.call(t, e), !e.cancelBubble) return lt(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ye(() => {
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
		if (E) return Or(D, null), D;
		i === void 0 && (i = Dr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ dn(i)));
		var t = r || on ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ dn(t), s = t.lastChild;
			Or(o, s);
		} else Or(t, t);
		return t;
	};
}
function kr(e = "") {
	if (!E) {
		var t = un(e + "");
		return Or(t, t), t;
	}
	var n = D;
	return n.nodeType === 3 ? gn(n) : (n.before(n = un()), Fe(n)), Or(n, n), n;
}
function Ar() {
	if (E) return Or(D, null), D;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = un();
	return e.append(t, n), Or(t, n), e;
}
function U(e, t) {
	if (E) {
		var n = z;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = D), Ie();
		return;
	}
	e !== null && e.before(t);
}
function W(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[le] ??= e.nodeValue) && (e[le] = n, e.nodeValue = `${n}`);
}
function jr(e, t) {
	return Nr(e, t);
}
var Mr = /* @__PURE__ */ new Map();
function Nr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	ln();
	var l = void 0, u = wn(() => {
		var s = n ?? t.appendChild(un());
		pt(s, { pending: () => {} }, (t) => {
			We({});
			var n = He;
			if (o && (n.c = o), a && (i.$$events = a), E && Or(t, null), l = e(t, i) || {}, E && (z.nodes.end = D, D === null || D.nodeType !== 8 || D.data !== "]")) throw je(), Te;
			Ge();
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
						Bn(r, t), t.append(un()), this.#n.set(e, {
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
		var n = j, r = mn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = un();
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
		} else E && (this.anchor = D), this.#a(n);
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/if.js
function G(e, t, n = !1) {
	var r;
	E && (r = D, Ie());
	var i = new Ir(e), a = n ? x : 0;
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
		c = E ? Fe(/* @__PURE__ */ dn(u)) : u.appendChild(un());
	}
	E && Ie();
	var d = null, f = /* @__PURE__ */ St(() => {
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
			E && Re(c) === "[!" != (e === 0) && (c = Le(), Fe(c), Pe(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = j, v = mn(), y = 0; y < e; y += 1) {
				E && D.nodeType === 8 && D.data === "]" && (c = D, t = !0, Pe(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Zt(S.v, b), S.i && Zt(S.i, y), v && u.unskip_effect(S.e)) : (S = Ur(l, h ? c : Br ??= un(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = kn(() => s(c)) : (d = kn(() => s(Br ??= un())), d.f |= w)), e > r.size && he("", "", ""), E && e > 0 && Fe(Le()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Pe(!0), B(f);
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
	o && Ye(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Ur(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Yt(n) : /* @__PURE__ */ Xt(n, !1, !1) : null, l = o & 2 ? Yt(i) : null;
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
		var o = /* @__PURE__ */ fn(r);
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
		E && (o = Fe(/* @__PURE__ */ dn(c)));
	}
	L(() => {
		var e = z;
		if (s === (s = t() ?? "")) {
			E && Ie();
			return;
		}
		if (n && !E) {
			e.nodes = null, c.innerHTML = s, s !== "" && Or(/* @__PURE__ */ dn(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (Pn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (E) {
				for (var a = D.data, l = Ie(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ fn(l);
				if (l === null) throw je(), Te;
				Or(D, u), o = Fe(l);
				return;
			}
			var d = hn(r ? "svg" : i ? "math" : "template", r ? Oe : i ? ke : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Or(/* @__PURE__ */ dn(f), f.lastChild), r || i) for (; /* @__PURE__ */ dn(f);) o.before(/* @__PURE__ */ dn(f));
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
	var o = e[se];
	if (E || o !== n || o === void 0) {
		var s = Zr(n, r, a);
		(!E || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[se] = n;
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
	var i = e[ce];
	if (E || i !== t) {
		var a = ei(t, r);
		(!E || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[ce] = t;
	} else r && (Array.isArray(r) ? (ti(e, n?.[0], r[0]), ti(e, n?.[1], r[1], "important")) : ti(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ri(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Me();
		for (var i of t.options) i.selected = n.includes(oi(i));
		return;
	}
	for (i of t.options) if (rn(oi(i), n)) {
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
	ut(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), oi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && oi(o);
		}
		n(a), e.__value = a, j !== null && r.add(j);
	}), Tn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = j;
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
var si = Symbol("is custom element"), ci = Symbol("is html"), li = fe ? "link" : "LINK", ui = fe ? "progress" : "PROGRESS";
function di(e) {
	if (E) {
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
		e[ue] = n, Ye(n), ct();
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
	E && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === li) || i[t] !== (i[t] = n) && (t === "loading" && (e[ae] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && gi(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function mi(e) {
	return e[oe] ??= {
		[si]: e.nodeName.includes("-"),
		[ci]: e.namespaceURI === De
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
	ut(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = yi(e) ? bi(a) : a, n(a), j !== null && r.add(j), await dr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (E && e.defaultValue !== e.value || mr(t) == null && e.value) && (n(yi(e) ? bi(e.value) : e.value), j !== null && r.add(j)), Dn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = j;
			if (r.has(i)) return;
		}
		yi(e) && n === bi(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function vi(e, t, n = t) {
	ut(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (E && e.defaultChecked !== e.checked || mr(t) == null) && n(e.checked), Dn(() => {
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
	return e === t || e?.[re] === t;
}
function Si(e = {}, t, n, r) {
	var i = He.r, a = z;
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
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/universal.js
function Ci(e, t, n, r, i) {
	var a = () => {
		r(n[e]);
	};
	n.addEventListener(t, a), i ? Dn(() => {
		n[e] = i();
	}) : a(), (n === document.body || n === window || n === document) && xn(() => {
		n.removeEventListener(t, a);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function wi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ yt(r), B(u)) : (l && (l = !1, c = s ? mr(r) : r), c);
	let f;
	if (o) {
		var p = re in e || ie in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = at(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && be(t), f(m)));
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
	var v = !1, y = (n & 1 ? yt : St)(() => (v = !1, g()));
	o && B(y);
	var b = z;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? B(y) : i && o ? tn(e) : e;
			return N(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Un && v || b.f & 16384 ? y.v : B(y);
	});
}
function Ti(e) {
	He === null && pe("onMount"), Sn(() => {
		let t = mr(e);
		if (typeof t == "function") return t;
	});
}
function Ei(e) {
	He === null && pe("onDestroy"), Ti(() => () => mr(e));
}
//#endregion
//#region src/runtime/resource-scope.ts
var Di = class {
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
}, Oi, ki = null, Y = {
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
}, Ai = (e) => document.getElementById(e), ji = 5e3, Mi = 10, Ni = 20, Pi = 6e4, Fi = "forge.gui.paneSizes", Ii = "forge.gui.mobileImmersive", Li = "This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.", Ri = "self-driving-finish", zi = "until-reconcile", Bi = /* @__PURE__ */ new Set([
	"waiting",
	"blocked",
	"error"
]), Vi = "forge.gui.agentDraft.v1", Hi = 1, Ui = "forge.gui.notifications.v1", Wi = `${Ui}.settings`, Gi = 1, Ki = "forge.gui.user.v1", qi = 1, Ji = 80, Yi = 50, Xi = 7776e6, Zi = /* @__PURE__ */ new Set(["session.launch-environment"]), Qi = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering"
]), $i = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, ea = [
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
], ta = new Map(ea.map((e) => [e.id, e])), na = 0, ra = 0, ia = 0, aa = 0, oa = 0, sa = null, ca = "";
function la() {
	return Ul().map((e) => ({
		id: e.id || "",
		label: Fc(e),
		summary: Dc(e)
	}));
}
function ua() {
	is(), Ws(), Sl(), Hc(), el(), Mc(), Sc(), Ac(), Wc();
}
function da() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function fa(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, Ji).join("") || "User";
}
function pa(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
function ma(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== qi ? "User" : fa(t.name);
	} catch {
		return "User";
	}
}
function ha() {
	try {
		return ma(window.localStorage.getItem(Ki));
	} catch {
		return "User";
	}
}
function ga() {
	return fa(Y.user?.name);
}
function _a(e) {
	let t = fa(e);
	try {
		window.localStorage.setItem(Ki, JSON.stringify({
			version: qi,
			name: t
		}));
	} catch {
		return !1;
	}
	return Y.user.name = t, !0;
}
function va() {
	ki?.listen(window, "storage", (e) => {
		e.key === Ki && (Y.user.name = ma(e.newValue), Y.settings.open && Y.settings.tab === "user" && Wc());
	});
}
function ya(e = Y.notifications.workspaceId) {
	let t = String(e || "").trim();
	return t ? `${Ui}.state.${encodeURIComponent(t)}` : "";
}
function ba() {
	return {
		version: Gi,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function xa(e) {
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
function Sa(e) {
	if (!e || e.version !== Gi) return ba();
	let t = Array.isArray(e.seen) ? e.seen.map((e) => ({
		marker: String(e?.marker || "").trim(),
		at: Number(e?.at) || Date.now()
	})).filter((e) => e.marker) : [], n = Array.isArray(e.pending) ? e.pending.map(xa).filter(Boolean) : [], r = Array.isArray(e.unread) ? e.unread.map(xa).filter(Boolean) : [], i = Array.isArray(e.effects) ? e.effects.map((e) => ({
		key: String(e?.key || "").trim(),
		at: Number(e?.at) || Date.now()
	})).filter((e) => e.key) : [];
	return {
		version: Gi,
		seen: t.slice(-2e3),
		pending: n.slice(-200),
		unread: r.slice(-200),
		effects: i.slice(-2e3)
	};
}
function Ca(e = Y.notifications.workspaceId) {
	let t = da(), n = ya(e);
	if (!t || !n) return ba();
	try {
		let e = t.getItem(n);
		if (!e) return ba();
		let r = JSON.parse(e);
		return !r || r.version !== Gi ? (t.removeItem(n), ba()) : Sa(r);
	} catch {
		try {
			t.removeItem(n);
		} catch {}
		return ba();
	}
}
function wa() {
	let e = da(), t = ya();
	if (!(!e || !t || !Y.notifications.store)) {
		Y.notifications.store = Sa(Y.notifications.store);
		try {
			e.setItem(t, JSON.stringify(Y.notifications.store));
		} catch {}
	}
}
function Ta() {
	let e = {
		browser: !1,
		sound: !1
	}, t = da();
	if (!t) return e;
	try {
		let n = JSON.parse(t.getItem(Wi) || "null");
		return !n || n.version !== Gi ? e : {
			browser: !!n.browser,
			sound: !!n.sound
		};
	} catch {
		try {
			t.removeItem(Wi);
		} catch {}
		return e;
	}
}
function Ea() {
	let e = da();
	if (!(!e || !Y.notifications.settings)) try {
		e.setItem(Wi, JSON.stringify({
			version: Gi,
			browser: !!Y.notifications.settings.browser,
			sound: !!Y.notifications.settings.sound
		}));
	} catch {}
}
function Da() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return [
		"granted",
		"default",
		"denied"
	].includes(e) ? e : "default";
}
function Oa(e) {
	let t = String(e || "").trim();
	t && (Aa(), Y.notifications.workspaceId = t, Y.notifications.store = Ca(t), Y.notifications.settings = Ta(), Da() !== "granted" && (Y.notifications.settings.browser = !1, Ea()), Y.notifications.ready = !1, Y.notifications.permissionError = "", ka(t));
}
function ka(e) {
	let t = window.BroadcastChannel || globalThis.BroadcastChannel;
	if (typeof t == "function") try {
		let n = new t(`${Ui}.${encodeURIComponent(e)}`);
		n.onmessage = (e) => Ma(e.data), Y.notifications.channel = n;
	} catch {
		Y.notifications.channel = null;
	}
}
function Aa() {
	try {
		Y.notifications.channel?.close();
	} catch {}
	Y.notifications.channel = null;
}
function ja(e) {
	try {
		Y.notifications.channel?.postMessage({
			...e,
			workspaceId: Y.notifications.workspaceId,
			sourceTabId: Y.notifications.tabId
		});
	} catch {}
}
function Ma(e) {
	if (!e || e.workspaceId !== Y.notifications.workspaceId || e.sourceTabId === Y.notifications.tabId) return;
	let t = Y.notifications.store || ba();
	if (e.type === "effect" && e.effectKey) {
		t.effects.some((t) => t.key === e.effectKey) || (t.effects.push({
			key: e.effectKey,
			at: Number(e.at) || Date.now()
		}), Y.notifications.store = t, wa());
		return;
	}
	if (e.type === "record" && e.record) {
		let n = xa(e.record);
		if (!n) return;
		if (t.seen.some((e) => e.marker === n.marker) || t.seen.push({
			marker: n.marker,
			at: n.at
		}), Ba(n)) {
			t.unread = t.unread.filter((e) => e.marker !== n.marker), t.pending = t.pending.filter((e) => e.marker !== n.marker), Y.notifications.store = t, wa(), ja({
				type: "clear-resource",
				resourceId: n.resourceId
			}), Y.tree && Fs();
			return;
		}
		t.unread.some((e) => e.marker === n.marker) || t.unread.push(n), Y.notifications.store = t, wa(), Y.tree && (Fs(), Z());
		return;
	}
	if (e.type === "clear-marker" && e.marker) {
		t.unread = t.unread.filter((t) => t.marker !== e.marker), t.pending = t.pending.filter((t) => t.marker !== e.marker), Y.notifications.store = t, wa(), Y.tree && Fs();
		return;
	}
	if (e.type === "clear-resource" && e.resourceId) {
		let n = String(e.resourceId);
		t.unread = t.unread.filter((e) => e.resourceId !== n), t.pending = t.pending.filter((e) => e.resourceId !== n), Y.notifications.store = t, wa(), Y.tree && Fs();
	}
}
function Na() {
	return Y.notifications.store || (Y.notifications.store = ba()), Y.notifications.store;
}
function Pa(e) {
	let t = String(e?.completionMarker || e?.agentRunCompletionMarker || "").trim();
	if (t) return t;
	let n = String(e?.agentHubSessionId || e?.completionSessionId || "").trim(), r = Number(e?.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function Fa(e) {
	return String(e?.forgeSessionId || e?.sessionId || e?.agentHubSessionId || e?.id || "").trim();
}
function Ia(e) {
	return e?.source === "internal" || e?.source === "external" ? zs(e).primaryResourceId || "" : e?.resourceId ? String(e.resourceId).trim() : Array.isArray(e?.controls) && e.controls.length === 1 ? String(e.controls[0]?.resourceId || "").trim() : "";
}
function La(e) {
	switch (e?.type) {
		case "turn.failed": return "failed";
		case "turn.cancelled": return "cancelled";
		case "turn.completed": return "completed";
		default: return "";
	}
}
function Ra(e, t) {
	let n = Number(e?.selfDrivingRevision) || 0;
	if (!(e?.schedulerTurn || n > 0)) return {
		isSelfDriving: !1,
		state: "",
		final: !1,
		suppressed: !1
	};
	let r = jl(t)?.selfDriving, i = String(r?.condition || "disabled").trim().toLowerCase(), a = !r?.enabled && r?.lastOutcome?.status === "completed", o = !!r?.enabled && [
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
function za(e, t, n = "") {
	let r = Ia(e), i = jl(r), a = Ra(e, r);
	return xa({
		workspaceId: Y.notifications.workspaceId,
		sessionId: Fa(e),
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
function Ba(e) {
	return !e?.resourceId || Y.selectedId !== e.resourceId ? !1 : Va();
}
function Va() {
	let e = document.visibilityState ? document.visibilityState === "visible" : !document.hidden, t = typeof document.hasFocus != "function" || document.hasFocus();
	return e && !document.hidden && t;
}
function Ha(e, t) {
	return `${e.marker}:${t}`;
}
function Ua() {
	let e = Ca(), t = Na(), n = /* @__PURE__ */ new Map();
	for (let r of [...e.effects, ...t.effects]) r?.key && n.set(r.key, r);
	t.effects = [...n.values()].slice(-2e3), Y.notifications.store = t;
}
function Wa(e, t) {
	let n = Ha(e, t), r = Na();
	return !r.effects.some((e) => e.key === n) && (r.effects.push({
		key: n,
		at: Date.now()
	}), Y.notifications.store = r, wa(), ja({
		type: "effect",
		effectKey: n,
		at: Date.now()
	}), !0);
}
function Ga(e, t, n) {
	let r = typeof navigator < "u" ? navigator.locks : null, i = () => {
		Ua(), Wa(e, t) && n();
	};
	if (!r || typeof r.request != "function") {
		i();
		return;
	}
	try {
		Promise.resolve(r.request(`forge.gui.notification.${Y.notifications.workspaceId}.${Ha(e, t)}`, { ifAvailable: !0 }, (e) => {
			e && i();
		})).catch((e) => {
			console.warn("notification effect lock unavailable", e), i();
		});
	} catch (e) {
		console.warn("notification effect lock unavailable", e), i();
	}
}
function Ka(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.sessionId}`;
}
function qa(e) {
	return e.selfDriving ? `Self-Driving ${e.selfDrivingState || "finished"}.` : e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function Ja() {
	if (!Y.notifications.settings?.sound) return;
	let e = window.AudioContext || window.webkitAudioContext;
	if (typeof e != "function") {
		Y.notifications.soundError = "Audio is unavailable in this browser.", Y.settings.open && Y.settings.tab === "notifications" && Wc();
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
			Y.notifications.soundError = "Chrome blocked completion sound until audio is enabled by the page.", console.warn("completion sound unavailable", e), Y.settings.open && Y.settings.tab === "notifications" && Wc();
		}) : n();
	} catch (e) {
		Y.notifications.soundError = "Completion sound is unavailable right now.", console.warn("completion sound unavailable", e), Y.settings.open && Y.settings.tab === "notifications" && Wc();
	}
}
function Ya(e, t = !1) {
	if (!(!Y.notifications.settings?.browser || Da() !== "granted") && !(!t && !Wa(e, "browser"))) try {
		let t = new window.Notification(Ka(e), {
			body: qa(e),
			tag: `forge-${e.marker}`,
			icon: "/favicon.svg"
		});
		t.onclick = () => {
			try {
				window.focus();
			} catch {}
			lo(e).catch((e) => console.warn("notification navigation failed", e));
		};
	} catch (e) {
		console.warn("browser notification unavailable", e);
	}
}
function Xa(e) {
	Y.notifications.settings?.browser && Da() === "granted" && Ga(e, "browser", () => Ya(e, !0)), Y.notifications.settings?.sound && Ga(e, "sound", Ja);
}
function Za(e, t = "") {
	let n = Pa(e), r = Fa(e);
	if (!n || !r || !Y.notifications.workspaceId) return !1;
	let i = za(e, n, t);
	if (!i?.sessionId) return !1;
	let a = Na(), o = a.seen.some((e) => e.marker === n), s = a.pending.findIndex((e) => e.marker === n), c = Ra(e, i.resourceId);
	return Y.notifications.ready ? o && s < 0 ? !1 : c.isSelfDriving && c.state === "waiting" ? (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), a.pending = a.pending.filter((e) => e.marker !== n), Y.notifications.store = a, wa(), !1) : c.isSelfDriving && c.disabledControl ? (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), a.pending = a.pending.filter((e) => e.marker !== n), a.unread = a.unread.filter((e) => e.marker !== n), Y.notifications.store = a, wa(), !1) : c.isSelfDriving && c.suppressed && !c.final ? (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), s < 0 && a.pending.push(i), Y.notifications.store = a, wa(), !1) : (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), a.pending = a.pending.filter((e) => e.marker !== n), Ba(i) ? (Y.notifications.store = a, wa(), !1) : (a.unread = a.unread.filter((e) => e.marker !== n), a.unread.push(i), Y.notifications.store = a, wa(), ja({
		type: "record",
		record: i
	}), Xa(i), Y.tree && (Fs(), Z()), !0)) : (o || a.seen.push({
		marker: n,
		at: Date.now()
	}), a.pending = a.pending.filter((e) => e.marker !== n), Y.notifications.store = a, wa(), !1);
}
function Qa(e) {
	for (let t of e || []) Pa(t) && Za(t, t.completionState || t.agentRunCompletionState || "");
}
function $a(e, t) {
	let n = La(e);
	if (!n || !e?.sessionId || !Number(e.id)) return;
	let r = `${e.sessionId}:${e.id}`;
	Za({
		...t || {},
		completionMarker: r,
		completionState: n,
		agentHubSessionId: t?.agentHubSessionId || e.sessionId
	}, n);
}
function eo() {
	Y.notifications.ready || (Qa(Y.tree?.sessions || []), Qa(Y.agent.runs || []), Y.notifications.ready = !0, wa());
}
function to(e) {
	let t = String(e || "").trim();
	return !!(t && Na().unread.some((e) => e.sessionId === t));
}
function no(e) {
	let t = String(e || "").trim();
	if (!t) return;
	let n = Na();
	(n.unread.some((e) => e.marker === t) || n.pending.some((e) => e.marker === t)) && (n.unread = n.unread.filter((e) => e.marker !== t), n.pending = n.pending.filter((e) => e.marker !== t), Y.notifications.store = n, wa(), ja({
		type: "clear-marker",
		marker: t
	}), Y.tree && Fs());
}
function ro(e) {
	let t = String(e || "").trim();
	if (!t) return;
	let n = Na();
	(n.unread.some((e) => e.resourceId === t) || n.pending.some((e) => e.resourceId === t)) && (n.unread = n.unread.filter((e) => e.resourceId !== t), n.pending = n.pending.filter((e) => e.resourceId !== t), Y.notifications.store = n, wa(), ja({
		type: "clear-resource",
		resourceId: t
	}), Y.tree && Fs());
}
function io() {
	Ea(), Y.settings.open && Y.settings.tab === "notifications" && Wc();
}
async function ao() {
	let e = Da();
	if (e === "unsupported") return Y.notifications.settings.browser = !1, Y.notifications.permissionError = "Browser notifications are not supported here.", io(), e;
	if (e === "denied") return Y.notifications.settings.browser = !1, Y.notifications.permissionError = "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically.", io(), e;
	let t = e;
	if (e === "default") try {
		t = await window.Notification.requestPermission();
	} catch (e) {
		Y.notifications.permissionError = "Chrome could not request notification permission.", console.warn("notification permission request failed", e);
	}
	return t === "granted" ? (Y.notifications.settings.browser = !0, Y.notifications.permissionError = "") : (Y.notifications.settings.browser = !1, Y.notifications.permissionError = t === "denied" ? "Chrome denied permission. Restore it in Chrome site settings; Forge will not ask again automatically." : "Notification permission is still pending."), io(), t;
}
function oo(e) {
	if (Y.notifications.settings = Y.notifications.settings || Ta(), !e) {
		Y.notifications.settings.browser = !1, Y.notifications.permissionError = "", io();
		return;
	}
	ao().catch((e) => {
		Y.notifications.settings.browser = !1, Y.notifications.permissionError = "Chrome could not request notification permission.", console.warn("notification permission request failed", e), io();
	});
}
function so() {
	let e = window.AudioContext || window.webkitAudioContext;
	if (typeof e != "function") return Y.notifications.soundError = "Audio is unavailable in this browser.", io(), Promise.resolve(!1);
	try {
		Y.notifications.audioContext = Y.notifications.audioContext || new e();
		let t = Y.notifications.audioContext.resume?.();
		return Promise.resolve(t).then(() => (Y.notifications.soundError = "", io(), !0)).catch((e) => (Y.notifications.soundError = "Chrome may block sound until the page receives an audio gesture.", console.warn("completion audio initialization failed", e), io(), !1));
	} catch (e) {
		return Y.notifications.soundError = "Completion sound is unavailable right now.", console.warn("completion audio initialization failed", e), io(), Promise.resolve(!1);
	}
}
function co(e) {
	Y.notifications.settings = Y.notifications.settings || Ta(), Y.notifications.settings.sound = !!e, Y.notifications.soundError = "", io(), e && so();
}
async function lo(e) {
	if (e?.resourceId) try {
		if (await As(e.resourceId, {
			clearUnread: !1,
			forceDetail: !0
		}), e.runId) {
			let t = Y.agent.runs.find((t) => t.id === e.runId);
			t && (Y.agent.activeRunId = t.id, Sc(), Ac(), Z());
		}
	} finally {
		no(e.marker);
	}
}
function uo() {
	ki?.listen(window, "storage", (e) => {
		e.key === ya() && e.newValue && (Y.notifications.store = Ca(), Y.tree && Fs()), e.key === Wi && (Y.notifications.settings = Ta(), Da() !== "granted" && (Y.notifications.settings.browser = !1), Y.settings.open && Y.settings.tab === "notifications" && Wc());
	}), ki?.listen(document, "visibilitychange", () => {
		Fu(), Va() && ro(Y.selectedId);
	}), ki?.listen(window, "focus", () => ro(Y.selectedId));
}
function fo() {
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function po(e) {
	return encodeURIComponent(String(e || "").trim());
}
function mo(e) {
	return String(e?.agentHubSessionId || e?.sourceExternalId || e?.id || "").trim();
}
function ho(e) {
	return String(e || "").trim() || "workspace";
}
function go(e, t = Y.activeWorkspaceId) {
	let n = String(t || "").trim(), r = mo(e);
	return !n || !r ? "" : `${Vi}.session.${po(n)}.${po(r)}`;
}
function _o(e) {
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Hi || typeof t.text != "string" ? null : t;
	} catch {
		return null;
	}
}
function vo(e) {
	let t = fo();
	if (!t || !e) return null;
	let n = "";
	try {
		n = t.getItem(e) || "";
	} catch {
		return null;
	}
	if (!n) return null;
	let r = _o(n);
	if (r) return r;
	try {
		t.removeItem(e);
	} catch {}
	return null;
}
function yo(e) {
	let t = vo(e);
	return t ? t.text ? t.text : (bo(e), "") : "";
}
function bo(e) {
	let t = fo();
	if (!(!t || !e)) try {
		t.removeItem(e);
	} catch {}
}
function xo(e, t) {
	let n = /* @__PURE__ */ new Set();
	Y.agent.ttyDraftWorkspaceId === e && Y.agent.ttyDraftResourceId === t && Y.agent.ttyDraftKey && n.add(Y.agent.ttyDraftKey);
	for (let r of Y.agent.runs || []) {
		if (ho(r.resourceId) !== t) continue;
		let i = go(r, e);
		i && n.add(i);
	}
	return n;
}
function So(e = Y.activeWorkspaceId, t = Y.agent.ttyDraftResourceId) {
	let n = fo(), r = String(e || "").trim(), i = ho(t);
	if (!n || !r || !i) return;
	let a = `${Vi}.session.${po(r)}.`, o = xo(r, i), s = [], c = Date.now();
	try {
		for (let e = 0; e < n.length; e++) {
			let t = n.key(e);
			if (!t || !t.startsWith(a)) continue;
			let r = vo(t);
			if (!r || ho(r.resourceId) !== i || o.has(t)) continue;
			if (!r.text) {
				n.removeItem(t);
				continue;
			}
			let l = Number(r.updatedAt) || 0;
			if (l > 0 && c - l > Xi) {
				n.removeItem(t);
				continue;
			}
			s.push({
				key: t,
				updatedAt: l
			});
		}
		for (s.sort((e, t) => e.updatedAt - t.updatedAt); s.length > Yi;) {
			let e = s.shift();
			e && bo(e.key);
		}
	} catch {}
}
function Co(e, t, n = {}) {
	if (!e) return;
	if (!t) {
		bo(e);
		return;
	}
	let r = fo();
	if (r) try {
		r.setItem(e, JSON.stringify({
			version: Hi,
			text: t,
			updatedAt: Date.now(),
			workspaceId: n.workspaceId || "",
			resourceId: n.resourceId || "",
			runId: n.runId || "",
			sessionId: n.sessionId || ""
		}));
	} catch {}
}
function wo() {
	let e = Y.agent.ttyDraftKey;
	e && (Co(e, Y.agent.ttyDraft, {
		workspaceId: Y.agent.ttyDraftWorkspaceId,
		resourceId: Y.agent.ttyDraftResourceId,
		runId: Y.agent.ttyDraftRunId,
		sessionId: mo(cl())
	}), So(Y.agent.ttyDraftWorkspaceId, Y.agent.ttyDraftResourceId));
}
function To(e, t = !0) {
	let n = String(e ?? "");
	Y.agent.ttyDraft !== n && (Y.agent.ttyDraft = n, Y.agent.ttyDraftVersion++), Y.agent.ttyMultiline = n.includes("\n"), t && wo();
}
function Eo() {
	Y.agent.ttyDraft = "", Y.agent.ttyMultiline = !1, Y.agent.ttyDraftKey = "", Y.agent.ttyDraftWorkspaceId = "", Y.agent.ttyDraftResourceId = "", Y.agent.ttyDraftRunId = "", Y.agent.ttyDraftVersion++;
}
function Do(e, t = Y.activeWorkspaceId) {
	let n = go(e, t);
	if (!n) {
		Eo();
		return;
	}
	Y.agent.ttyDraftKey !== n && (Y.agent.ttyDraftKey = n, Y.agent.ttyDraftWorkspaceId = String(t || "").trim(), Y.agent.ttyDraftResourceId = ho(e.resourceId), Y.agent.ttyDraftRunId = String(e.id || ""), Y.agent.ttyDraft = yo(n), Y.agent.ttyMultiline = Y.agent.ttyDraft.includes("\n"), Y.agent.ttyDraftVersion++, So(Y.agent.ttyDraftWorkspaceId, Y.agent.ttyDraftResourceId));
}
function Oo() {
	wo();
}
function ko({ workspaceId: e, runId: t, key: n, text: r, version: i }) {
	return Y.activeWorkspaceId !== e || Y.agent.activeRunId !== t || Y.agent.ttyDraftKey !== n || Y.agent.ttyDraft !== r || Y.agent.ttyDraftVersion !== i ? !1 : (bo(n), To("", !1), !0);
}
async function Ao(e, t = {}) {
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
async function jo() {
	let e = Il(), [t, n] = await Promise.all([Ao("/api/workspaces"), Ao("/api/settings/agenthub")]);
	Y.config = Yl(t, n), Vl(), Y.activeWorkspaceId = Rl(e.workspaceId) ? e.workspaceId : Y.config.activeId || Y.config.workspaces[0]?.id || "", Y.selectedId = e.resourceId || "workspace", $o(), Y.activeWorkspaceId ? (Oa(Y.activeWorkspaceId), await Uo(), !e.resourceId && Y.lastResourceId && (Y.selectedId = Y.lastResourceId), await Mo({ replaceURL: !0 })) : (Y.navigationLoading = !1, Y.tree = null, Y.details = {}, Y.resourceLogPages = {}, Y.workspaceAgents = null, Y.preview = null, Y.diff = null, gc(), qo());
}
async function Mo(e = {}) {
	if (!Y.activeWorkspaceId) return;
	let t = Y.activeWorkspaceId, n = Y.navigationVersion, r = ++Y.treeRequestVersion;
	Y.navigationLoading = !0, Y.navigationError = "", is(), Y.detailRequestVersion++, Y.workspaceAgentsRequestVersion++, Y.previewRequestVersion++, Y.diffRequestVersion++;
	let i;
	try {
		i = await Ao(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw Yo(t, n, r) && (Y.navigationLoading = !1, Y.navigationError = pa(e), is()), e;
	}
	Yo(t, n, r) && (Y.tree = i, Y.details = {}, Y.resourceLogPages = {}, Y.workspaceAgents = null, Y.workspaceAgentsSaving = !1, Y.preview = null, Y.diff = null, Ml(), Fl(!1), Y.selectedId === "workspace" ? await Ho() : Y.selectedId && await No(Y.selectedId), Yo(t, n, r) && (await oc(), Yo(t, n, r) && (Y.notifications.ready || eo(), Y.navigationLoading = !1, Y.navigationError = "", qo(), e.updateURL !== !1 && zl({ replace: !!e.replaceURL }))));
}
async function No(e, t = {}) {
	if (!e || e === "workspace" || Y.details[e] && !t.force) return;
	t.force && (Fo(e), delete Y.details[e]);
	let n = Y.activeWorkspaceId, r = Y.navigationVersion, i = ++Y.detailRequestVersion, a = await Po(e, n, { logsLimit: Mi });
	return !Yo(n, r) || Y.selectedId !== e || i !== Y.detailRequestVersion ? null : Bo(a, "replace");
}
function Po(e, t = Y.activeWorkspaceId, n = {}) {
	let r = new URLSearchParams(), i = n.logsCursor === void 0 ? n.cursor : n.logsCursor, a = n.logsLimit === void 0 ? n.limit === void 0 ? Mi : n.limit : n.logsLimit;
	return r.set("logsLimit", String(a)), i != null && String(i) !== "" && r.set("logsCursor", String(i)), Ao(`/api/workspaces/${t}/resources/${encodeURIComponent(e)}?${r.toString()}`);
}
function Fo(e) {
	Y.resourceLogPages ||= {}, e && delete Y.resourceLogPages[e];
}
function Io(e) {
	return Y.resourceLogPages ||= {}, Y.resourceLogPages[e] || (Y.resourceLogPages[e] = {
		loaded: !1,
		hasMore: !1,
		nextCursor: "",
		loading: !1,
		error: "",
		requestVersion: 0
	}), Y.resourceLogPages[e];
}
function Lo(e) {
	return Array.isArray(e?.logs) && e.logs.length ? e.logs : Array.isArray(e?.logPage?.entries) ? e.logPage.entries : Array.isArray(e?.logs) ? e.logs : [];
}
function Ro(e, t, n) {
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
	return r.sort(Ks);
}
function zo(e) {
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
function Bo(e, t = "head") {
	if (!e?.id) return null;
	let n = e.id, r = Lo(e), i = e.logPage || null, a = Io(n);
	if (t === "replace" || !a.loaded || !Y.details[n]) {
		a.loaded = !0, a.hasMore = !!i?.hasMore, a.nextCursor = String(i?.nextCursor || ""), a.error = "";
		let t = Ro([], r, !0);
		return Y.details[n] = {
			...e,
			logs: t,
			logPage: {
				hasMore: a.hasMore,
				nextCursor: a.nextCursor
			}
		}, Y.details[n];
	}
	let o = Y.details[n], s = Ro(o.logs || [], r, t !== "older");
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
async function Vo(e = Y.selectedId) {
	if (!e || e === "workspace" || Y.selectedId !== e) return;
	let t = Io(e);
	if (!t.loaded || !t.hasMore || t.loading) return;
	let n = String(t.nextCursor || "");
	if (!n) {
		t.error = "The log page did not provide a continuation cursor.", Ws();
		return;
	}
	let r = Y.activeWorkspaceId, i = Y.navigationVersion, a = ++t.requestVersion;
	t.loading = !0, t.error = "", Ws();
	try {
		let o = await Po(e, r, {
			logsCursor: n,
			logsLimit: Ni
		});
		if (!Yo(r, i) || Y.selectedId !== e || Y.resourceLogPages[e] !== t || a !== t.requestVersion) return;
		Bo(o, "older");
	} catch (n) {
		Yo(r, i) && Y.selectedId === e && Y.resourceLogPages[e] === t && a === t.requestVersion && (t.error = pa(n, "Could not load older logs."));
	} finally {
		Yo(r, i) && Y.selectedId === e && Y.resourceLogPages[e] === t && a === t.requestVersion && (t.loading = !1, Ws(), Z());
	}
}
async function Ho(e = {}) {
	if (!Y.activeWorkspaceId || Y.workspaceAgents && !e.force) return;
	let t = Y.activeWorkspaceId, n = Y.navigationVersion, r = ++Y.workspaceAgentsRequestVersion;
	try {
		let e = await Ao(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!Yo(t, n) || r !== Y.workspaceAgentsRequestVersion) return null;
		Y.workspaceAgents = e;
	} catch (e) {
		if (!Yo(t, n) || r !== Y.workspaceAgentsRequestVersion) return null;
		Y.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: pa(e)
		};
	}
	return Y.workspaceAgents;
}
async function Uo(e = Y.activeWorkspaceId, t = Y.navigationVersion) {
	let n = await Ao(`/api/workspaces/${e}/ui-state`);
	return Yo(e, t) ? (Y.expandedProjects = new Set(n.expandedProjects || []), Y.lastResourceId = n.lastResourceId || "", Y.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], Y.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, Y.sessionOrder = Array.isArray(n.sessionOrder) ? n.sessionOrder : [], !0) : !1;
}
async function Wo() {
	if (!Y.activeWorkspaceId) return;
	let e = Y.activeWorkspaceId, t = Y.navigationVersion, n = Y.selectedId;
	await Ao(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...Y.expandedProjects],
			lastResourceId: n,
			projectOrder: Y.projectOrder,
			taskOrder: Y.taskOrder,
			sessionOrder: Y.sessionOrder
		})
	}), Yo(e, t) && (Y.lastResourceId = n);
}
function Go() {
	Y.autoRefreshTimer ||= ki?.interval(() => {
		Ko().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, ji);
}
async function Ko() {
	if (!Y.activeWorkspaceId || Y.autoRefreshInFlight || Y.agentSessionMutationCount > 0 || Y.listDrag) return;
	let e = Y.autoRefreshVersion, t = Y.activeWorkspaceId, n = Y.navigationVersion, r = Y.selectedId;
	Y.autoRefreshInFlight = !0;
	try {
		let i = await uc(t);
		if (!i || !Xo(t, n, e)) return;
		let a = !ru(Y.tree, i);
		if (a && (Y.tree = i), typeof Qa == "function" && Qa(i.sessions || []), a && Y.preview?.section === "Wiki" && !Y.preview.loading && (await Xs("Wiki", Y.preview.path), !Xo(t, n, e))) return;
		Ml() && (zl({ replace: !0 }), a = !0, r = Y.selectedId);
		let o = Y.expandedProjects.size;
		if (Fl(!1), a ||= o !== Y.expandedProjects.size, Y.selectedId === "workspace") {
			let r = Y.workspaceAgents;
			if (await Ho({ force: !0 }), !Xo(t, n, e)) return;
			ru(r, Y.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++Y.detailRequestVersion, o = await Po(r, t, { logsLimit: Mi });
			if (!Xo(t, n, e) || Y.selectedId !== r || i !== Y.detailRequestVersion) return;
			let s = zo(r);
			Bo(o, "head"), ru(s, zo(r)) || (a = !0);
		}
		Y.agentRunProjectionVersion = (Number(Y.agentRunProjectionVersion) || 0) + 1;
		let s = Y.agentRunProjectionVersion, c = await mc();
		if (!Xo(t, n, e) || s !== Y.agentRunProjectionVersion) return;
		if (ru(Y.agent.runs, c) || (Y.agent.runs = c, a = !0), typeof Qa == "function" && Qa(c), typeof ac == "function" && ac(c), cc(c)) {
			if (!Xo(t, n, e) || s !== Y.agentRunProjectionVersion) return;
			a = !0;
		}
		typeof ac == "function" && ac(Y.agent.runs), Ds() !== Y.taskOperationalStateKey && (a = !0), a && qo();
	} finally {
		Y.autoRefreshInFlight = !1;
	}
}
function qo() {
	is(), Ws(), Sc(), Ac(), Z(), Sl(), Hc(), Wc();
}
function Jo() {
	is(), Ws(), Sc(), Ac(), Z(), Sl(), Hc();
}
function Yo(e, t, n = null) {
	return e === Y.activeWorkspaceId && t === Y.navigationVersion && (n == null || n === Y.treeRequestVersion);
}
function Xo(e, t, n) {
	return Yo(e, t) && n === Y.autoRefreshVersion;
}
function Zo(e) {
	return ta.get(String(e?.icon || "").trim()) || $i;
}
function Qo(e) {
	let t = Zo(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = t.type || "image/png", n.href = t.src;
}
function $o() {
	let e = Y.config?.workspaces?.find((e) => e.id === Y.activeWorkspaceId);
	Qo(e), is();
}
function es(e) {
	if (!e) return "";
	let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
	return `#${n ? n[1] : t}`;
}
function ts(e) {
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
function ns(e, t, n = "") {
	let r = us(e), i = t === "project" && Pl(e.id), a = t === "project" ? os(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: es(e.id),
		active: Y.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: ts(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? Ms(e.children || [], Y.taskOrder[e.id]).map((t) => ns(t, "task", e.id)) : [],
		projectId: n
	};
}
function rs(e) {
	let t = zs(e), n = t.displayResourceId, r = e.source === "internal", i = r ? ms(e) : hs("session-external", "session-status-external", "message-square", "External session active", "session"), a = Bs(e), o = a ? us(a) : ls(), s = ds(r && o.selfDriving ? [o.selfDriving, i] : [i]), c = to(e.id), l = `${Hs(e, a, o, i)}${c ? ". Unread turn completion." : ""}`, u = r ? (Y.config?.agents || []).find((t) => t.id === e.agentRunAgentName) : null, d = [r ? "AgentHub" : "External"];
	return t.controls.length > 1 ? d.push(`${t.controls.length} locks`) : n && d.push(n), e.updatedAt && d.push(_l(e.updatedAt)), {
		id: e.id,
		source: e.source || "external",
		title: Is(e, t),
		meta: d.join(" · "),
		label: r ? u?.name || e.agentRunAgentName || "AgentHub" : "External",
		statusLabel: l,
		status: ts(s),
		unread: c,
		current: !!(Y.selectedId && Y.selectedId !== "workspace" && t.selectedResourceIds.includes(Y.selectedId)),
		clickable: !!(t.navigationResourceId || t.menu),
		navigationResourceId: t.navigationResourceId,
		menu: t.menu,
		controls: t.controls.map((e) => ({
			resourceId: e.resourceId,
			path: e.path || "",
			navigable: !!Rs(e.resourceId)
		}))
	};
}
function is() {
	let e = Y.tree ? Ms(Y.tree.projects || [], Y.projectOrder).map((e) => ns(e, "project")) : [], t = Ms(Ps(Y.tree?.sessions || []), Y.sessionOrder).map(rs);
	Y.tree && (Y.taskOperationalStateKey = Ds()), Oi.renderAppShell({
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
			iconSrc: Zo(e).src
		})),
		projects: e,
		sessions: t,
		paneSizes: { ...Y.paneSizes },
		mobile: { ...Y.mobile },
		route: { ...Y.routeProjection },
		onSwitchWorkspace: (e) => as(e),
		onAddWorkspace: () => Kl("workspace").catch((e) => X(e.message)),
		onCreateProject: () => vl(),
		onOpenSettings: () => Kl().catch((e) => X(e.message)),
		onToggleProject: (e) => js(e),
		onSelectResource: (e) => As(e),
		onReorder: (e, t, n) => cs(e, t, n),
		onDragState: (e) => {
			Y.listDrag = e;
		},
		onPanePreview: (e, t) => hu(e, t),
		onPaneCommit: (e) => _u(e),
		onPaneViewport: () => Tu(),
		onMobileSidebar: (e) => Ou(e),
		onMobileView: (e) => ku(e),
		onMobileImmersive: (e) => ju(e),
		onHistoryNavigation: (e) => Lu(e),
		onToast: X,
		onIconsChanged: Z
	});
}
async function as(e) {
	if (!Rl(e)) return;
	if (Y.workspaceMenuOpen = !1, e === Y.activeWorkspaceId) {
		$o();
		return;
	}
	Ou(!1), Oo(), Y.navigationVersion++, Y.autoRefreshVersion++, Y.treeRequestVersion++, Y.detailRequestVersion++, Y.workspaceAgentsRequestVersion++, Y.previewRequestVersion++, Y.diffRequestVersion++;
	let t = Y.navigationVersion;
	await Wo().catch((e) => console.warn("failed to save UI state", e)), Y.activeWorkspaceId = e, Y.selectedId = "workspace", Y.tree = null, Y.navigationLoading = !0, Y.navigationError = "", Y.details = {}, Y.resourceLogPages = {}, Oa(e), Y.sessionMenu = null, Ys(), Y.workspaceAgentsSaving = !1, xl(), Y.selfDrivingDialog.open && !Y.selfDrivingDialog.submitting && Vc(), gc(), $o(), await Uo(e, t) && (Y.selectedId = Y.lastResourceId || "workspace", await Mo());
}
function os(e) {
	let t = (Array.isArray(e?.children) ? e.children : []).filter((e) => e && e.archived !== !0), n = /* @__PURE__ */ new Set();
	for (let e of t) gs(e.id).some(ss) && n.add(e.id);
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
function ss(e) {
	return e?.source === "internal" && Qi.has(e.agentRunStatus);
}
async function cs(e, t, n) {
	let r = {
		projectOrder: [...Y.projectOrder],
		taskOrder: Object.fromEntries(Object.entries(Y.taskOrder).map(([e, t]) => [e, [...t]])),
		sessionOrder: [...Y.sessionOrder]
	};
	if (e.kind === "session") Y.sessionOrder = Ns(Ms(Ps(Y.tree?.sessions || []), Y.sessionOrder).map((e) => e.id), e.id, t.id, n);
	else if (e.kind === "task") {
		let r = jl(e.projectId);
		if (!r) return;
		let i = Ms(r.children || [], Y.taskOrder[e.projectId]);
		Y.taskOrder = {
			...Y.taskOrder,
			[e.projectId]: Ns(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") Y.projectOrder = Ns(Ms(Y.tree?.projects || [], Y.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	is();
	try {
		await Wo();
	} catch (e) {
		throw Y.projectOrder = r.projectOrder, Y.taskOrder = r.taskOrder, Y.sessionOrder = r.sessionOrder, is(), e;
	}
}
function ls() {
	return {
		selfDriving: null,
		session: null,
		className: "",
		label: "",
		lock: null,
		statusPresentation: ds([], null)
	};
}
function us(e) {
	let t = gs(e.id), n = _s(e.id), r = fs(e.selfDriving), i = ps(t), a = Cs(n), o = ds([r, i], a);
	return {
		selfDriving: r,
		session: i,
		className: o.className,
		lock: a,
		statusPresentation: o,
		label: Ts(e.selfDriving, t, a, {
			selfDriving: r,
			session: i
		})
	};
}
function ds(e, t = null) {
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
function fs(e) {
	if (!e || !e.enabled) return null;
	let t = e?.condition || "ready";
	return t === "error" ? hs("error", "task-status-danger", "triangle-alert", "Self-Driving error", "self-driving") : t === "blocked" || t === "needs_configuration" ? hs(t, "task-status-attention", "square", `Self-Driving ${t.replace(/_/g, " ")}`, "self-driving") : t === "waiting" ? hs("waiting", "task-status-attention", "pause", "Self-Driving waiting", "self-driving") : t === "ready" ? hs("ready", "task-status-queued", "clock", "Self-Driving ready", "self-driving") : hs("unknown", "task-status-neutral", "circle-help", `Self-Driving ${t || "unknown"}`, "self-driving");
}
function ps(e) {
	let t = e.find((e) => e.agentRunStatus === "waiting_approval");
	if (t) return ms(t);
	let n = e.find((e) => e.agentRunStatus === "starting");
	if (n) return ms(n);
	let r = e.find((e) => e.agentRunStatus === "running");
	if (r) return ms(r);
	let i = e.find((e) => e.agentRunStatus === "stopping");
	if (i) return ms(i);
	let a = e.find((e) => e.agentRunStatus === "recovering");
	if (a) return ms(a);
	let o = e.find((e) => e.agentRunStatus === "idle");
	return o ? ms(o) : e.length > 0 ? ms(e[0]) : null;
}
function ms(e) {
	let t = e?.agentRunStatus || "";
	switch (t) {
		case "starting": return hs("session-starting", "task-status-session-running", "loader-circle", "Session starting", "session", e);
		case "running": return hs("session-running", "task-status-session-running", "loader-circle", "Session running", "session", e);
		case "waiting_approval": return hs("session-approval", "task-status-attention", "shield-question", "Session waiting for approval", "session", e);
		case "stopping": return hs("session-stopping", "task-status-session-stopping", "loader-circle", "Session stopping", "session", e);
		case "recovering": return hs("session-recovering", "task-status-attention", "rotate-ccw", "Session recovering", "session", e);
		case "idle": return hs("session-idle", "task-status-info", "message-square", "Session waiting for input", "session", e);
		default: return hs("session-active", "task-status-neutral", "circle-dot", t ? `Session ${t}` : "Session active", "session", e);
	}
}
function hs(e, t, n, r, i, a = null) {
	return {
		kind: e,
		className: t,
		iconName: n,
		label: r,
		dimension: i,
		recentOutput: !!(a && ks(a))
	};
}
function gs(e) {
	return e ? (Y.tree?.sessions || []).filter((t) => t.resourceId === e || Ls(t).some((t) => t.resourceId === e)) : [];
}
function _s(e) {
	return e ? (Y.tree?.sessions || []).filter((t) => Ls(t).some((t) => t.resourceId === e)) : [];
}
function vs() {
	let e = jl(Y.selectedId);
	if (!e || e.type !== "project" && e.type !== "task") return null;
	let t = Y.details?.[e.id];
	return t && t.type !== e.type ? null : e;
}
function ys() {
	let e = vs();
	return !!(e && _s(e.id).some((e) => e.source === "external"));
}
function bs() {
	let e = vs();
	return !!(e && _s(e.id).some((e) => e.source === "internal"));
}
function xs() {
	return ys() || bs();
}
function Ss() {
	xs() && (Y.agent.agentChooserOpen = !1);
}
function Cs(e) {
	if (e.length === 0) return null;
	let t = e.find((e) => e.source === "external"), n = t || e[0], r = e.length, i = ws(n);
	return {
		kind: t ? "external" : "internal",
		className: t ? "task-lock-external" : "task-lock-internal",
		label: r > 1 ? `Locked by ${r} sessions including ${i}` : `Locked by ${i}`
	};
}
function ws(e) {
	return e.source === "external" ? "an external session" : `${(Y.config?.agents || []).find((t) => t.id === e.agentRunAgentName)?.name || e.agentRunAgentName || "Forge GUI"} session`;
}
function Ts(e, t, n, r) {
	let i = [];
	if (e && i.push(`Self-Driving ${e.enabled ? "on" : "off"}, ${e.condition}, revision ${e.revision}`), t.length === 1) i.push(Es(t[0]));
	else if (t.length > 1) {
		let e = [...new Set(t.map((e) => e.agentRunStatus || "open"))].join(", ");
		i.push(`${t.length} agent sessions: ${e}`);
	}
	return n && i.push(n.label), i.join(" · ");
}
function Es(e) {
	return `${e.schedulerTurn ? "Self-Driving session" : "Agent session"} ${(e.agentRunStatus || "open").replace("waiting_approval", "waiting for approval")}`;
}
function Ds() {
	if (!Y.tree) return "";
	let e = [];
	for (let t of Y.tree.projects || []) {
		let n = us(t), r = os(t);
		e.push(`${t.id}:auto=${Os(n.selfDriving)}:session=${Os(n.session)}:${n.lock?.kind || "none"}:${n.label}:tasks=${r.taskCount}:${r.runningCount}`);
		for (let n of t.children || []) {
			let t = us(n);
			e.push(`${n.id}:auto=${Os(t.selfDriving)}:session=${Os(t.session)}:${t.lock?.kind || "none"}:${t.label}`);
		}
	}
	return e.join("|");
}
function Os(e) {
	return e ? `${e.kind}:${e.iconName}:${e.recentOutput}` : "none";
}
function ks(e) {
	let t = new Date(e.agentRunLastOutputAt || "").getTime();
	if (Number.isFinite(t)) return Date.now() - t <= Pi;
	if (!["running", "starting"].includes(e.agentRunStatus)) return !1;
	let n = new Date(e.agentRunUpdatedAt || "").getTime();
	return Number.isFinite(n) && Date.now() - n <= Pi;
}
async function As(e, t = {}) {
	let n = Y.selectedId !== e;
	t.clearUnread !== !1 && ro(e);
	let r = n || !!t.forceDetail;
	r && (Y.navigationVersion++, Y.autoRefreshVersion++, Y.treeRequestVersion++, Y.detailRequestVersion++, Y.workspaceAgentsRequestVersion++, Y.previewRequestVersion++, Y.diffRequestVersion++, e !== "workspace" && (Fo(e), delete Y.details[e])), n && (Y.selfDrivingDialog.open && !Y.selfDrivingDialog.submitting && Vc(), Y.workspaceAgentsSaving = !1, Oo(), Qc(), Y.preview = null, Y.diff = null, _c(), Y.agent.runs = [], Y.agent.activeRunId = "", Y.agent.events = [], Y.agent.notices = [], Y.agent.historyBeforeId = 0, Eo()), Y.selectedId = e, Y.sessionMenu = null, Ou(!1), Fl(!1), zl(), Wo().catch((e) => console.warn("failed to save UI state", e)), Jo(), await Promise.all([e === "workspace" ? Ho({ force: !!t.forceDetail }) : No(e, { force: r }), n ? oc() : Promise.resolve()]), Yo(Y.activeWorkspaceId, Y.navigationVersion) && Jo();
}
async function js(e) {
	Y.expandedProjects.has(e) ? Y.expandedProjects.delete(e) : Y.expandedProjects.add(e), is();
	try {
		await Wo();
	} catch (t) {
		throw Y.expandedProjects.has(e) ? Y.expandedProjects.delete(e) : Y.expandedProjects.add(e), is(), t;
	}
}
function Ms(e, t) {
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
function Ns(e, t, n, r) {
	if (!Array.isArray(e) || t === n) return e;
	let i = e.filter((e) => e !== t), a = i.indexOf(n);
	return a < 0 ? e : (r && (a += 1), i.splice(a, 0, t), i);
}
function Ps(e) {
	return e.map((e, t) => ({
		session: e,
		index: t
	})).sort((e, t) => {
		let n = Date.parse(e.session.startedAt || ""), r = Date.parse(t.session.startedAt || ""), i = Number.isFinite(n), a = Number.isFinite(r);
		return i && a && n !== r ? n - r : i === a ? e.session.id === t.session.id ? e.index - t.index : e.session.id < t.session.id ? -1 : 1 : i ? -1 : 1;
	}).map((e) => e.session);
}
function Fs() {
	is();
}
function Is(e, t) {
	let n = (t && typeof t == "object" ? t : arguments.length > 1 ? { displayResourceId: t || "" } : zs(e)).displayResourceId || "", r = jl(n)?.title || "";
	return e.source === "internal" ? e.agentRunTitle || r || n || e.id : r || n || e.id;
}
function Ls(e) {
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
function Rs(e) {
	let t = String(e || "").trim();
	if (!t) return "";
	let n = jl(t);
	return n && n.archived !== !0 ? t : "";
}
function zs(e) {
	let t = Ls(e), n = String(e?.resourceId || "").trim();
	if (e?.source === "internal" && n) return {
		kind: "run",
		primaryResourceId: n,
		displayResourceId: n,
		navigationResourceId: Rs(n),
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
			navigationResourceId: Rs(e),
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
function Bs(e) {
	if (!e || e.source !== "internal") return null;
	let t = String(e.resourceId || "").trim();
	if (t) return Vs(t);
	let n = Ls(e);
	return n.length === 1 ? Vs(n[0].resourceId) : null;
}
function Vs(e) {
	let t = jl(e);
	return t && t.type === "task" && !t.archived ? t : null;
}
function Hs(e, t, n, r) {
	let i = [];
	if (t?.selfDriving && n?.selfDriving) {
		let e = `Self-Driving ${t.selfDriving.condition || "unknown"}`, n = Number.isFinite(t.selfDriving.revision) ? t.selfDriving.revision : "unknown";
		i.push(`${e}, revision ${n}`);
	}
	return r && i.push(r.label), i.length > 0 ? i.join(" · ") : e?.source === "external" ? "External session active" : "Session active";
}
function Us() {
	let e = Y.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${Y.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: Bl(),
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
		onNavigate: (e) => Gs(e).catch((e) => X(e.message)),
		onCreateTask: (e) => yl(e),
		onArchive: (e) => Al(e).catch((e) => X(e.message)),
		onLoadMoreLogs: (e) => Vo(e),
		onSaveWorkspaceAgents: (e, t) => Zs(e, t),
		onToast: X,
		onIconsChanged: Z
	};
	if (!Y.tree) return t;
	if (Y.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Bl()
	};
	let n = jl(Y.selectedId) || Y.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: Bl()
	};
	let r = Y.details[n.id] || null, i = Nl(n.id), a = Y.resourceLogPages?.[n.id] || {};
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
function Ws() {
	Oi.renderDetailPanel(Us());
}
async function Gs(e) {
	await As(e, { forceDetail: e === Y.selectedId && e !== "workspace" });
}
function Ks(e, t) {
	let n = Date.parse(e?.time || ""), r = Date.parse(t?.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t?.time || "").localeCompare(String(e?.time || ""));
}
function qs(e) {
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
function Js(e) {
	return qs(e || "").trim();
}
function Ys() {
	Y.workspaceAgentsDraft = "", Y.workspaceAgentsDirty = !1;
}
async function Xs(e, t, n = {}) {
	let r = n.workspaceId || Y.activeWorkspaceId, i = n.requestVersion || ++Y.previewRequestVersion;
	try {
		let n = await Ao(ec(e, t, r));
		return r !== Y.activeWorkspaceId || i !== Y.previewRequestVersion || Y.preview?.section !== e || Y.preview?.path !== t ? null : (Y.preview = {
			section: e,
			...n
		}, Y.preview);
	} catch (a) {
		let o = r === Y.activeWorkspaceId && i === Y.previewRequestVersion && Y.preview?.section === e && Y.preview?.path === t;
		if (o && (Y.preview = {
			section: e,
			path: t,
			error: pa(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function Zs(e, t) {
	if (!Y.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = Y.activeWorkspaceId, r = Y.navigationVersion, i = await Ao(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!Yo(n, r) || Y.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return Y.workspaceAgents = i, Y.workspaceAgentsDraft = Js(i.content || ""), Y.workspaceAgentsDirty = !1, i;
}
function Qs() {
	Y.previewRequestVersion++, Y.preview = null, qo();
}
function $s() {
	Y.diffRequestVersion++, Y.diff = null, qo();
}
function ec(e, t, n = Y.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
function tc(e) {
	let t = e?.data;
	return t?.method === "forge/self-driving/finish" && t?.kind === Ri && t?.lifecycle === zi && t?.level !== "error" && String(t.runId || "").trim() !== "" && String(t.resourceId || "").trim() !== "" && Number(t.selfDrivingRevision) > 0;
}
function nc(e) {
	return Number(e?.data?.schedulerTurnSequence) || 0;
}
function rc(e) {
	let t = String(e?.resourceId || "").trim();
	if (!t) return null;
	let n = [Y.details?.[t], jl(t)].map((e) => e?.selfDriving).filter(Boolean).map((e) => ({
		revision: Number(e.revision) || 0,
		state: String(e.condition || "").trim().toLowerCase()
	}));
	if (!n.length) return null;
	let r = (e) => +!Bi.has(e);
	return n.sort((e, t) => t.revision - e.revision || r(t.state) - r(e.state)), n[0];
}
function ic(e, t = Y.agent.runs) {
	if (!tc(e)) return !0;
	let n = e.data;
	if (!Y.agent.activeRunId || String(n.runId).trim() !== Y.agent.activeRunId) return !1;
	let r = (t || []).find((e) => e.id === Y.agent.activeRunId);
	if (!r || String(r.resourceId || "").trim() !== String(n.resourceId).trim() || Number(r.selfDrivingRevision) !== Number(n.selfDrivingRevision)) return !1;
	let i = nc(e), a = Number(r.schedulerTurnSequence) || 0;
	if (a > i && a > 0 || a === i && r.schedulerTurnId && n.schedulerTurnId && r.schedulerTurnId !== n.schedulerTurnId || r.schedulerTurn && (a === 0 || a >= i)) return !1;
	let o = rc(r);
	return !o || o.revision === Number(n.selfDrivingRevision) && Bi.has(o.state);
}
function ac(e = Y.agent.runs) {
	let t = Y.agent.notices.length;
	return Y.agent.notices = Y.agent.notices.filter((t) => ic(t, e)), Y.agent.notices.length !== t;
}
async function oc() {
	if (!Y.activeWorkspaceId) {
		gc();
		return;
	}
	Y.agentRunProjectionVersion = (Number(Y.agentRunProjectionVersion) || 0) + 1;
	let e = Y.agentRunProjectionVersion, t = await mc();
	return e !== Y.agentRunProjectionVersion || !Y.activeWorkspaceId || (Y.agent.runs = t, Qa(Y.agent.runs), cc(Y.agent.runs), typeof ac == "function" && ac(Y.agent.runs), Y.agent.activeRunId || (Y.agent.historyBeforeId = 0), e !== Y.agentRunProjectionVersion) ? !1 : (typeof ac == "function" && ac(Y.agent.runs), !0);
}
async function sc(e = {}) {
	if (!Y.activeWorkspaceId) return;
	Y.agentRunProjectionVersion = (Number(Y.agentRunProjectionVersion) || 0) + 1;
	let t = Y.agentRunProjectionVersion, n = Y.activeWorkspaceId, r = await mc();
	if (t !== Y.agentRunProjectionVersion || Y.activeWorkspaceId !== n || (Y.agent.runs = r, Qa(r), typeof ac == "function" && ac(r), cc(r) && (t !== Y.agentRunProjectionVersion || Y.activeWorkspaceId !== n))) return !1;
	if (e.refreshSelfDrivingProjection && Y.agent.activeRunId) {
		let e = cl(), r = String(e?.resourceId || "").trim(), [i, a] = await Promise.all([uc(n), r ? Po(r, n, { logsLimit: Mi }) : Promise.resolve(null)]);
		if (t !== Y.agentRunProjectionVersion || Y.activeWorkspaceId !== n) return !1;
		i && (Y.tree = i), a && Y.activeWorkspaceId === n && Bo(a, "head");
	}
	return typeof ac == "function" && ac(Y.agent.runs), !0;
}
function cc(e) {
	let t = lc(e);
	if (Y.agent.activeRunId === t) {
		let n = e.find((e) => e.id === t);
		return n && Do(n), !1;
	}
	Oo(), Y.agent.activeRunId = t, Y.agent.events = [], Y.agent.notices = [], Y.agent.eventsHasMore = !1, Y.agent.historyBeforeId = 0, Eo();
	let n = e.find((e) => e.id === t);
	return n && Do(n), Y.agent.approvalDrafts.clear(), !0;
}
function lc(e) {
	let t = e.find((e) => e.schedulerTurn && ll(e));
	return t ? t.id : e.some((e) => e.id === Y.agent.activeRunId) ? Y.agent.activeRunId : e[0]?.id || "";
}
async function uc(e = Y.activeWorkspaceId) {
	let t = ++Y.treeRequestVersion, n = Y.navigationVersion, r = await Ao(`/api/workspaces/${e}/tree`);
	return Yo(e, n, t) ? r : null;
}
async function dc() {
	if (!Y.activeWorkspaceId || !Y.tree) return;
	let e = await uc(Y.activeWorkspaceId);
	e && (Y.tree = e);
}
async function fc(e, t) {
	!e || Y.activeWorkspaceId !== e || (await Promise.all([
		oc(),
		dc(),
		t && t !== "workspace" ? Po(t, e, { logsLimit: Mi }).then((t) => {
			Y.activeWorkspaceId === e && t && Bo(t, "head");
		}) : Promise.resolve()
	]), Y.activeWorkspaceId === e && (typeof ac == "function" && ac(Y.agent.runs), qo()));
}
async function pc(e) {
	Y.agentSessionMutationCount++, Y.autoRefreshVersion++, Y.treeRequestVersion++;
	try {
		return await e();
	} finally {
		Y.agentSessionMutationCount--;
	}
}
function mc() {
	let e = gl(), t = e ? `?resourceId=${encodeURIComponent(e)}` : "";
	return Ao(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs${t}`).then((e) => e.runs || []);
}
async function hc() {
	Oo(), _c(), Y.agent.turnStopping = !1, Y.agent.turnStoppingRunId = "", Y.agent.sessionStopping = !1, Y.agent.sessionStoppingRunId = "", Y.agent.activeRunId = "", Y.agent.events = [], Y.agent.notices = [], Y.agent.historyBeforeId = 0, Eo(), await oc();
}
function gc() {
	Y.selfDrivingDialog.open && !Y.selfDrivingDialog.submitting && Vc(), Oo(), Qc(), _c(), Y.agent.runs = [], Y.agentRunProjectionVersion = (Number(Y.agentRunProjectionVersion) || 0) + 1, Y.agent.activeRunId = "", Y.agent.events = [], Y.agent.notices = [], Y.agent.eventsHasMore = !1, Y.agent.historyBeforeId = 0, Y.agent.loadingOlder = !1, Y.agent.optionsOpen = !1, Y.agent.agentChooserOpen = !1, Y.agent.historyOpen = !1, Eo(), Y.agent.newSessionStarting = !1, Y.agent.turnStopping = !1, Y.agent.turnStoppingRunId = "", Y.agent.sessionStopping = !1, Y.agent.sessionStoppingRunId = "", Y.agent.toolGroupOpen.clear(), Y.agent.approvalDrafts.clear(), Y.agent.selfDrivingFinishNoticeWatermarks instanceof Map && Y.agent.selfDrivingFinishNoticeWatermarks.clear(), Y.agent.renderDeferredForSelection = !1, bc();
}
function _c() {
	Y.agent.stream && Y.agent.stream.close(), Y.agent.stream = null, Y.agent.streamRunId = "";
}
function vc(e, t, n) {
	if (e !== Y.activeWorkspaceId || t !== Y.agent.activeRunId || !n) return;
	let r = Y.agent.runs.find((e) => e.id === t) || null;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && $a(n, r), [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(n.type) && sc({ refreshSelfDrivingProjection: [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state"
	].includes(n.type) }).then(qo).catch((e) => console.warn("agent refresh failed", e));
}
function yc(e, t, n) {
	e === Y.activeWorkspaceId && t === Y.agent.activeRunId && n?.data?.kind === Ri && sc({ refreshSelfDrivingProjection: !0 }).then(qo).catch((e) => console.warn("Self-Driving notice projection refresh failed", e));
}
function bc() {
	Y.agent.renderTimer && window.clearTimeout(Y.agent.renderTimer), Y.agent.renderTimer = null;
}
function xc(e) {
	if (!window.AgentHubEventTimeline?.buildTimeline) throw Error("AgentHub Event Timeline library is unavailable");
	let t = (e || []).filter((e) => !Zi.has(e?.type));
	return window.AgentHubEventTimeline.buildTimeline(t);
}
function Sc() {
	typeof ac == "function" && ac(Y.agent.runs);
	let e = cl(), t = Y.details[Y.selectedId];
	Oi.renderSelfDrivingBar(Cc(t)), Oi.renderSessionSwitcher({
		identity: `${Y.activeWorkspaceId}:${gl()}`,
		workspaceId: Y.activeWorkspaceId,
		resourceId: gl(),
		activeRunId: e?.id || "",
		runs: Y.agent.runs,
		switchingRunId: Y.agent.switchingRunId || "",
		onSelect: il,
		onToast: X,
		onIconsChanged: Z
	});
}
function Cc(e) {
	let t = jl(Y.selectedId);
	if (!t || t.type !== "task" || !e) return {
		identity: `${Y.activeWorkspaceId}:${Y.selectedId}:hidden`,
		visible: !1,
		status: Ec("disabled", !1),
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
	let n = e.selfDriving || null, r = cl(), i = r?.schedulerTurn && r.resourceId === e.id ? `${r.agentProfile ? `${r.agentProfile} → ` : ""}${r.agentHubAgentName || ""}` : "";
	return {
		identity: `${Y.activeWorkspaceId}:${t.id}:${Number(n?.revision) || 0}`,
		visible: !0,
		status: Ec(n?.condition || "disabled", !!n?.enabled),
		summary: Tc(n, e),
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
		statusReason: wc(n, e?.logs),
		pending: !!(Y.agent.selfDrivingSaving || Y.agent.selfDrivingDisabling),
		onToggleEnabled: () => {
			Y.agent.selfDrivingSaving || Y.agent.selfDrivingDisabling || (n?.enabled ? nl().catch((e) => X(e.message)) : Ic(e) ? Bc() : Lc({ enabled: !0 }).catch((e) => X(e.message)));
		},
		onToggleDetails: () => {
			Y.agent.selfDrivingExpanded = !Y.agent.selfDrivingExpanded, Sc();
		},
		onIconsChanged: Z
	};
}
function wc(e, t = []) {
	if (!e) return null;
	let n = String(e.conditionReason || e.notificationError?.message || "").trim();
	return n ? {
		label: "Status",
		text: n
	} : null;
}
function Tc(e, t) {
	if (!e) return "Self-Driving is off.";
	let n = wc(e, t?.logs);
	if (n) return `${n.label}: ${n.text}`;
	if (e.wakeContext?.condition) return `Wake condition: ${e.wakeContext.condition}`;
	let r = cl();
	if (r?.schedulerTurn && r.resourceId === t.id) {
		let e = `${r.agentProfile ? `${r.agentProfile} → ` : ""}${r.agentHubAgentName || ""}`.trim();
		if (e) return `Agent: ${e}`;
	}
	return `Revision ${Number(e.revision) || 0}`;
}
function Ec(e, t = !1) {
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
function Dc(e) {
	if (!e) return "";
	let t = [Oc(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function Oc(e) {
	return (Y.config?.agentHubProviders || Y.settings.data?.agentHub?.catalog?.providers || []).find((t) => t.id === e)?.name || e || "Provider";
}
function kc(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function Ac(e = {}) {
	Mc();
	let t = cl(), n = (Y.config?.agents || []).find((e) => e.id === t?.agentHubAgentName);
	Oi.renderEventTimeline({
		identity: `${Y.activeWorkspaceId}:${t?.id || ""}`,
		workspaceId: Y.activeWorkspaceId,
		activeRunId: t?.id || "",
		activeRun: t,
		runCount: Y.agent.runs.length,
		agentName: Fc(n || Hl()),
		project: xc,
		onEvent: vc,
		onNotice: yc,
		onApproval: sl,
		onToast: X,
		onIconsChanged: Z
	});
}
function jc(e, t) {
	return `${e || "workspace"}:${t || "run"}`;
}
function Mc(e = {}) {
	Y.agent.skipTTYDraftSync = !1, Ss();
	let t = cl();
	t && Do(t);
	let n = ll(t), r = t?.resourceId || gl(), i = fl(t), a = pl(t) || t?.status === "stopping";
	Oi.renderComposer({
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
		unavailableReason: n ? Pc(t, Nc(t)) : "",
		sending: !!(t && Y.agent.sendingInputRunIds.has(jc(Y.activeWorkspaceId, t.id))),
		externalLocked: ys(),
		internalLocked: bs(),
		agents: la(),
		selectedAgentId: Hl()?.id || "",
		chooserOpen: !!Y.agent.agentChooserOpen,
		sessionStarting: !!Y.agent.newSessionStarting,
		actionsOpen: !!Y.agent.sessionActionsOpen,
		canEndTurn: !!(t && (ul(t) || i)),
		endingTurn: i,
		closingSession: a,
		selfDrivingRemainsEnabled: dl(t),
		selfDrivingDisabling: !!Y.agent.selfDrivingDisabling,
		onDraft: (e, t) => Gc(e, t),
		onSend: ml,
		onOpenUpload: Xc,
		onToggleChooser: () => {
			Y.agent.newSessionStarting || !Ul().length || ys() || (Y.agent.agentChooserOpen = !Y.agent.agentChooserOpen, Mc());
		},
		onChooseAgent: (e) => qc(e).catch((e) => X(e.message)),
		onToggleActions: () => {
			Y.agent.sessionActionsOpen = !Y.agent.sessionActionsOpen, Mc();
		},
		onResume: () => ol().catch((e) => X(e.message)),
		onEndTurn: () => rl().catch((e) => X(e.message)),
		onCloseSession: Kc,
		onIconsChanged: Z
	});
}
function Nc(e) {
	return ll(e) ? e.status !== "starting" || Y.agent.events.some((e) => e.type === "session.state" && e.data?.state === "ready") ? !0 : Y.agent.eventsHasMore && e.status !== "starting" : !1;
}
function Pc(e, t = Nc(e)) {
	return ys() ? Li : fl(e) ? "Ending the current turn." : t ? e.status === "stopping" ? "AgentHub is stopping the provider." : e.status === "recovering" ? "AgentHub event recovery is in progress." : e.status === "waiting_approval" ? "Resolve the pending approval before sending input." : "" : "Agent session is starting.";
}
function Fc(e) {
	return e?.name || e?.id || "Agent";
}
function Ic(e) {
	return !e?.selfDriving?.agentName && !(e?.selfDriving?.preferredAgentProfiles || []).length;
}
async function Lc(e = {}) {
	return pc(async () => {
		let t = jl(Y.selectedId), n = t ? Y.details[t.id] || t : null;
		if (!n || n.type !== "task") throw Error("Select a task first.");
		let r = e.enabled === void 0 || !!e.enabled;
		Y.agent.selfDrivingSaving = !0, Sc(), Mc(), Z();
		try {
			let n = {
				resourceId: t.id,
				enabled: r
			};
			e.configured && (n.agentName = String(e.agentName || "").trim(), n.prompt = String(e.runInstructions || ""), n.completionCriteria = String(e.completionCriteria || ""));
			let i = await Ao(`/api/workspaces/${Y.activeWorkspaceId}/self-driving`, {
				method: "PUT",
				body: JSON.stringify(n)
			});
			await Promise.all([
				oc(),
				dc(),
				Po(t.id, Y.activeWorkspaceId, { logsLimit: Mi }).then((e) => {
					e && Y.activeWorkspaceId && Bo(e, "head");
				})
			]), qo(), X(r ? "Self-Driving enabled. The Scheduler will reconcile asynchronously." : i.notificationError ? `Self-Driving disabled. ${i.notificationError}` : "Self-Driving disabled. The current Turn and Session were left open.");
		} finally {
			Y.agent.selfDrivingSaving = !1, Sc(), Mc(), Z();
		}
	});
}
function Rc() {
	return {
		open: !1,
		identity: ++ra,
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
function zc(e) {
	return Y.agent.runs.find((t) => t.resourceId === e && ll(t) && t.status === "idle" && !t.schedulerTurn && String(t.agentHubSessionId || "").trim()) || null;
}
function Bc() {
	let e = jl(Y.selectedId), t = e ? Y.details[e.id] || e : null;
	if (!e || !t || t.type !== "task") {
		X("Select a task first.");
		return;
	}
	let n = zc(e.id), r = t.selfDriving || null, i = Ul(), a = String(r?.agentName || "").trim(), o = i.find((e) => String(e.id || "").trim().toLowerCase() === a.toLowerCase()), s = Hl(), c = String(n?.agentHubAgentName || o?.id || s?.id || "").trim();
	Y.modalEnter = "selfDriving", Y.selfDrivingDialog = {
		open: !0,
		identity: ++ra,
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
	}, Hc();
}
function Vc() {
	let e = Y.selfDrivingDialog;
	if (!e.open || e.submitting) return;
	let t = e.returnFocus;
	Y.selfDrivingDialog = Rc(), Hc(), t && document.contains(t) && t.focus({ preventScroll: !0 });
}
function Hc() {
	let e = Y.selfDrivingDialog;
	Oi.renderSelfDrivingDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${e.resourceId || ""}`,
		resourceId: e.resourceId || "",
		reuseCurrentSession: !!e.reuseCurrentSession,
		agents: la(),
		draft: {
			agentName: e.agentName || "",
			runInstructions: e.runInstructions || ""
		},
		submitting: !!e.submitting,
		error: e.error || "",
		unknown: !!e.unknown,
		onClose: Vc,
		onSubmit: Uc,
		onIconsChanged: Z
	});
}
async function Uc(e) {
	let t = Y.selfDrivingDialog;
	if (!t.open || t.submitting || t.unknown) return;
	if (t.agentName = String(e?.agentName || t.agentName || "").trim(), t.runInstructions = String(e?.runInstructions || ""), !t.reuseCurrentSession && !t.agentName) {
		t.error = "Select an Agent before enabling Self-Driving.", Hc();
		return;
	}
	t.submitting = !0, t.error = "";
	let n = t.identity, r = Y.activeWorkspaceId, i = t.resourceId;
	Hc();
	try {
		if (await Lc({
			configured: !0,
			agentName: t.agentName,
			runInstructions: t.runInstructions,
			completionCriteria: t.completionCriteria
		}), n !== Y.selfDrivingDialog.identity || r !== Y.activeWorkspaceId || i !== Y.selectedId) return;
		let e = t.returnFocus;
		Y.selfDrivingDialog = Rc(), Hc(), e && document.contains(e) && e.focus({ preventScroll: !0 });
	} catch (e) {
		if (n !== Y.selfDrivingDialog.identity) return;
		t.submitting = !1;
		let r = e, i = pa(e, "Self-Driving could not be enabled.");
		t.error = i, t.unknown = !Number.isFinite(Number(r?.status)) || Number(r?.status) >= 500 || i.includes("outcome may be unknown") || i.includes("was updated but the start message failed"), Hc();
	}
}
function Wc() {
	let e = Y.settings.data || {
		workspaces: Y.config?.workspaces || [],
		activeId: Y.activeWorkspaceId,
		agents: Y.config?.agents || [],
		agentProfiles: Y.config?.agentProfiles || []
	}, t = e.agentHub || {}, n = t.status || {}, r = t.catalog || {
		providers: [],
		agents: []
	}, i = Y.notifications.settings || Ta();
	Y.notifications.settings = i, Oi.renderSettings({
		open: !!Y.settings.open,
		identity: `${Y.settings.identity || 0}`,
		dataVersion: Y.settings.dataVersion || 0,
		initialTab: Y.settings.tab || "workspace",
		workspaces: e.workspaces || [],
		activeWorkspaceId: e.activeId || Y.activeWorkspaceId,
		workspaceIcons: [$i, ...ea],
		workspaceIconSavingId: Y.settings.workspaceIconSavingId || "",
		userName: ga(),
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
		agents: la(),
		notifications: {
			browser: !!i.browser,
			sound: !!i.sound,
			permission: Da(),
			permissionError: Y.notifications.permissionError || "",
			soundError: Y.notifications.soundError || ""
		},
		onClose: ql,
		onAddWorkspace: async (e) => {
			tu(e), await Ql();
		},
		onRemoveWorkspace: async (e, t) => {
			tu(t), await $l(e);
		},
		onWorkspaceIcon: async (e, t, n) => {
			tu(n), await eu(e, t);
		},
		onSaveUser: async (e) => {
			let t = fa(e);
			if (!_a(t)) throw Error("User name could not be saved in this browser.");
			return X(t === "User" ? "User name reset to User." : `User name saved as ${t}.`), t;
		},
		onSaveAgentHub: async (e) => {
			tu(e), await nu();
		},
		onBrowserNotifications: oo,
		onCompletionSound: co,
		onToast: X,
		onIconsChanged: Z
	});
}
function Gc(e, t) {
	!t || t.workspaceId !== Y.activeWorkspaceId || t.runId !== Y.agent.activeRunId || t.draftKey !== Y.agent.ttyDraftKey || To(e);
}
function Kc() {
	if (!dl(cl())) {
		tl().catch((e) => X(e.message));
		return;
	}
	if (window.confirm("Self-Driving is On. Close this Session while keeping Self-Driving On? The Scheduler may create a replacement Session.")) {
		tl().catch((e) => X(e.message));
		return;
	}
	window.confirm("Disable Self-Driving and close this Session instead?") && nl().then(() => tl()).catch((e) => X(e.message));
}
async function qc(e = "") {
	if (!Y.agent.newSessionStarting) return pc(async () => {
		if (!Y.activeWorkspaceId) throw Error("Select a workspace first.");
		let t = jl(Y.selectedId);
		if (typeof ys == "function" && ys()) throw Error(Li);
		let n = String(e || "").trim(), r = n ? Ul().find((e) => e.id === n) : Hl();
		if (!r) throw Error("Select an enabled agent first.");
		Y.agent.agentName = r.id, Y.agent.newSessionStarting = !0, Mc(), Z();
		try {
			let e = await Ao(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs`, {
				method: "POST",
				body: JSON.stringify({
					agentName: r.id,
					userName: ga(),
					resourceId: t?.id || "",
					title: t?.title || Bl(),
					prompt: "",
					cwd: hl()
				})
			});
			Y.agent.draftPrompt = "", Y.agent.ttyDraft = "", Y.agent.ttyMultiline = !1, Y.agent.ttyDraftKey = "", Y.agent.ttyDraftWorkspaceId = "", Y.agent.ttyDraftResourceId = "", Y.agent.ttyDraftRunId = "", Y.agent.ttyDraftVersion++, Y.agent.optionsOpen = !1, Y.agent.agentChooserOpen = !1, Y.agent.historyOpen = !1, Y.agent.activeRunId = e.run.id, await Promise.all([oc(), dc()]), qo(), X("Agent session started.");
		} finally {
			Y.agent.newSessionStarting = !1, Mc(), Z();
		}
	});
}
function Jc(e) {
	let t = jl(Y.selectedId), n = t ? Y.details[t.id] || t : null;
	if (!t || t.type !== "task" || !e || e.resourceId !== t.id) return null;
	let r = n?.selfDriving || null;
	return {
		resourceId: t.id,
		selfDrivingProjectionSet: !0,
		expectedSelfDrivingRevision: Number(r?.revision) || 0,
		expectedSelfDrivingCondition: String(r?.condition || "").trim().toLowerCase()
	};
}
async function Yc(e, t) {
	if (!t?.runId) throw Error("Start or select an agent run first.");
	if (typeof ys == "function" && ys()) throw Error(Li);
	let n = cl();
	if (t.workspaceId !== Y.activeWorkspaceId || t.runId !== n?.id || t.resourceId !== (n.resourceId || "") || t.draftKey !== Y.agent.ttyDraftKey) throw Error("The selected Workspace or Session changed before the message could be sent.");
	let r = Jc(n), i = {
		text: e,
		userName: ga()
	};
	return r && Object.assign(i, r), Ao(`/api/workspaces/${t.workspaceId}/agent/runs/${t.runId}/input`, {
		method: "POST",
		body: JSON.stringify(i)
	});
}
function Xc() {
	let e = cl();
	if (!e || !ll(e)) {
		X("Start or resume an agent session before uploading files.");
		return;
	}
	let t = Ai("ttyInput");
	t && To(t.value), Y.modalEnter = "upload", Y.uploadDialog = {
		open: !0,
		identity: ++ia,
		runId: e.id,
		items: [],
		nextId: 1
	}, el();
}
function Zc(e = [], t = {}) {
	if (!Y.uploadDialog.open) return;
	let n = t.workspaceId === Y.activeWorkspaceId && t.runId === Y.agent.activeRunId, r = e.length > 0 && n && Y.uploadDialog.runId === Y.agent.activeRunId;
	r && (To($c(Y.agent.ttyDraft, e)), Y.agent.ttyDraftResetVersion++), Qc();
	let i = Ai("ttyComposer");
	i && delete i.dataset.composerKey, Mc({ skipDraftSync: r }), Ai("ttyInput")?.focus({ preventScroll: !0 }), Z();
}
function Qc() {
	Y.uploadDialog = {
		open: !1,
		identity: ++ia,
		runId: "",
		items: [],
		nextId: 1
	}, el();
}
function $c(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function el() {
	let e = Y.uploadDialog;
	Oi.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${Y.activeWorkspaceId}:${e.runId || ""}`,
		workspaceId: Y.activeWorkspaceId,
		runId: e.runId || "",
		onDone: Zc,
		onIconsChanged: Z
	});
}
async function tl() {
	if (!Y.agent.activeRunId || Y.agent.sessionStopping || Y.agent.turnStopping) return;
	let e = cl();
	if (!(!ll(e) || e.status === "stopping")) return pc(async () => {
		let e = Y.agent.activeRunId;
		Y.agent.sessionStopping = !0, Y.agent.sessionStoppingRunId = e, Mc(), Z();
		try {
			await al(e), await Promise.all([oc(), dc()]), qo(), X("Agent session closed. Self-Driving desired state was not changed.");
		} catch (e) {
			try {
				await Promise.all([oc(), dc()]), qo();
			} catch {}
			throw e;
		} finally {
			Y.agent.sessionStopping = !1, Y.agent.sessionStoppingRunId = "", Mc(), Z();
		}
	});
}
async function nl() {
	if (Y.agent.selfDrivingDisabling) return;
	let e = jl(Y.selectedId), t = e ? Y.details[e.id] || e : null;
	if (!(!t || t.type !== "task")) return pc(async () => {
		Y.agent.selfDrivingDisabling = !0, Sc(), Mc(), Z();
		try {
			let e = await Ao(`/api/workspaces/${Y.activeWorkspaceId}/self-driving`, {
				method: "PUT",
				body: JSON.stringify({
					resourceId: t.id,
					enabled: !1
				})
			});
			await Promise.all([oc(), dc()]), qo(), X(e.notificationError ? `Self-Driving disabled. ${e.notificationError}` : "Self-Driving disabled. The Agent Session remains open.");
		} catch (e) {
			try {
				await Promise.all([oc(), dc()]), qo();
			} catch {}
			throw e;
		} finally {
			Y.agent.selfDrivingDisabling = !1, Sc(), Mc(), Z();
		}
	});
}
async function rl() {
	if (!(!Y.agent.activeRunId || Y.agent.turnStopping || Y.agent.sessionStopping) && ul(cl())) return pc(async () => {
		let e = Y.agent.activeRunId;
		Y.agent.turnStopping = !0, Y.agent.turnStoppingRunId = e, Mc(), Z();
		try {
			await Ao(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs/${e}/interrupt`, { method: "POST" }), await Promise.all([oc(), dc()]), qo(), X("Turn ended. The AgentHub Session remains open.");
		} catch (e) {
			try {
				await Promise.all([oc(), dc()]), qo();
			} catch {}
			throw e;
		} finally {
			Y.agent.turnStopping = !1, Y.agent.turnStoppingRunId = "", Mc(), Z();
		}
	});
}
async function il(e) {
	if (!(!e || e === Y.agent.activeRunId)) return pc(async () => {
		let t = Y.activeWorkspaceId;
		Oo();
		let n = cl();
		Y.agent.activeRunId = e, Y.agent.switchingRunId = e, Eo();
		let r = Y.agent.runs.find((t) => t.id === e);
		r && Do(r), qo();
		try {
			if (n && ll(n) && !n.schedulerTurn) try {
				await al(n.id);
			} catch (r) {
				throw t === Y.activeWorkspaceId && Y.agent.activeRunId === e && (Y.agent.activeRunId = n.id, Eo(), Do(n), qo()), r;
			}
			if (t !== Y.activeWorkspaceId || Y.agent.activeRunId !== e) return;
			await Promise.all([oc(), dc()]), t === Y.activeWorkspaceId && qo();
		} finally {
			Y.agent.switchingRunId === e && (Y.agent.switchingRunId = ""), Sc();
		}
	});
}
async function al(e) {
	if (e) return Ao(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs/${e}/stop`, { method: "POST" });
}
async function ol() {
	if (Y.agent.activeRunId) return pc(async () => {
		if (typeof ys == "function" && ys()) throw Error(Li);
		Oo();
		let e = await Ao(`/api/workspaces/${Y.activeWorkspaceId}/agent/runs/${Y.agent.activeRunId}/resume`, { method: "POST" });
		Y.agent.activeRunId = e.run.id, Do(e.run), Y.agent.historyOpen = !1, await Promise.all([oc(), dc()]), qo(), X("Agent session resumed.");
	});
}
async function sl(e, t, n) {
	if (!e || !t) return;
	let r = Y.activeWorkspaceId;
	await Ao(`/api/workspaces/${r}/agent/runs/${e}/approval`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), r === Y.activeWorkspaceId && (await oc(), qo());
}
function cl() {
	return Y.agent.runs.find((e) => e.id === Y.agent.activeRunId) || null;
}
function ll(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(e?.status);
}
function ul(e) {
	return ["running", "waiting_approval"].includes(e?.status);
}
function dl(e) {
	let t = String(e?.resourceId || "").trim();
	return t ? !!jl(t)?.selfDriving?.enabled : !1;
}
function fl(e) {
	return !!(Y.agent.turnStopping && Y.agent.turnStoppingRunId === e?.id);
}
function pl(e) {
	return !!(Y.agent.sessionStopping && Y.agent.sessionStoppingRunId === e?.id);
}
async function ml(e, t) {
	let n = jc(t?.workspaceId, t?.runId);
	if (Y.agent.sendingInputRunIds.has(n) || !String(e || "").trim()) return {
		accepted: !1,
		clear: !1
	};
	let r = cl();
	if (!r) return {
		accepted: !1,
		clear: !1
	};
	if (Do(r), t.workspaceId !== Y.activeWorkspaceId || t.runId !== Y.agent.activeRunId || t.draftKey !== Y.agent.ttyDraftKey) throw Error("The selected Workspace or Session changed before the message could be sent.");
	To(e);
	let i = t.workspaceId, a = t.runId, o = t.resourceId, s = t.draftKey, c = Y.agent.ttyDraftVersion;
	Y.agent.sendingInputRunIds.add(n);
	try {
		let n = await Yc(e, t), r = !1;
		if (n?.status === "accepted") {
			r = ko({
				workspaceId: i,
				runId: a,
				key: s,
				text: e,
				version: c
			}), r && Y.agent.ttyDraftResetVersion++;
			try {
				typeof fc == "function" && await fc(i, o);
			} catch (e) {
				X(`Message accepted, but the view could not refresh: ${pa(e)}`);
			}
		}
		return {
			accepted: n?.status === "accepted",
			clear: r
		};
	} finally {
		Y.agent.sendingInputRunIds.delete(n), Mc(), Z();
	}
}
function hl() {
	let e = jl(Y.selectedId);
	return e && e.path || "";
}
function gl() {
	return Y.selectedId === "workspace" ? "workspace" : jl(Y.selectedId)?.id || "";
}
function _l(e) {
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
function vl() {
	bl("project");
}
function yl(e) {
	bl("task", e);
}
function bl(e, t = "") {
	sa?.abort(), sa = null, ca = "", Y.modalEnter = "create", Y.createDialog = {
		open: !0,
		identity: ++na,
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
	}, Sl();
}
function xl() {
	Y.createDialog.submitting || (oa++, sa?.abort(), sa = null, ca = "", Y.createDialog = {
		open: !1,
		identity: ++na,
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
	}, Sl());
}
function Sl() {
	let e = Y.createDialog;
	Oi.renderCreateDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${e.type}:${e.projectId}`,
		workspaceId: Y.activeWorkspaceId,
		draft: Cl(e),
		templates: e.type === "task" && Y.details[e.projectId]?.templates || [],
		agents: la(),
		profileKeys: (Y.config?.agentProfiles || []).map((e) => e.key),
		preview: e.preview,
		previewKey: e.previewKey || "",
		previewing: !!e.previewing,
		previewError: e.previewError || "",
		templateDigest: e.templateDigest || "",
		submitting: !!e.submitting,
		onClose: xl,
		onPreview: Dl,
		onSubmit: Ol,
		previewRequestKey: (t) => JSON.stringify(El({
			...e,
			...wl(t),
			templateDigest: ""
		})),
		onConfirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?"),
		onIconsChanged: Z
	});
}
function Cl(e) {
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
function wl(e) {
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
		preferredAgentProfiles: kl(e.agentProfiles),
		prompt: e.prompt,
		completionCriteria: e.completionCriteria,
		activeTab: e.activeTab,
		editedMarkdown: e.editedMarkdown,
		showOptions: !!e.showOptions
	};
}
function Tl(e) {
	!e || !Y.createDialog.open || (String(e.templateName || "") !== String(Y.createDialog.templateName || "") && (Y.createDialog.preview = null, Y.createDialog.templateDigest = "", Y.createDialog.previewError = "", Y.createDialog.previewKey = "", Y.createDialog.previewing = !1, oa++, sa?.abort(), sa = null, ca = ""), Object.assign(Y.createDialog, wl(e)));
}
function El(e) {
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
async function Dl(e) {
	let t = Y.createDialog;
	if (Tl(e), !t.open || !t.templateName) return null;
	let n = El({
		...t,
		templateDigest: ""
	}), r = JSON.stringify(n);
	if (t.previewing) {
		if (r === ca) return null;
		oa++, sa?.abort(), sa = null, ca = "", t.previewing = !1;
	}
	let i = (Y.details[t.projectId]?.templates || []).find((e) => e.name === t.templateName);
	if (i && !i.taskTitle && (!t.titleOverride || !String(t.title).trim())) return t.previewError = "This template does not generate a title. Enter a task title in the Edit tab to render the preview.", Sl(), null;
	t.previewing = !0, t.previewError = "";
	let a = Y.activeWorkspaceId, o = t.identity, s = ++oa;
	sa?.abort();
	let c = new AbortController();
	sa = c, ca = r, Sl();
	try {
		let e = await Ao(`/api/workspaces/${a}/tasks/preview`, {
			method: "POST",
			body: JSON.stringify(n),
			signal: c.signal
		});
		return s !== oa || o !== Y.createDialog.identity || a !== Y.activeWorkspaceId ? null : (t.preview = e, t.templateDigest = e.template?.digest || "", t.previewKey = JSON.stringify(n), e);
	} catch (e) {
		return c.signal.aborted || s !== oa || o !== Y.createDialog.identity || (t.previewError = pa(e)), null;
	} finally {
		s === oa && o === Y.createDialog.identity && (t.previewing = !1, sa === c && (sa = null), ca === r && (ca = ""), Sl());
	}
}
async function Ol(e) {
	let t = Y.createDialog;
	if (!t.open || t.submitting) return;
	Tl(e);
	let n = Y.activeWorkspaceId, r = t.identity;
	t.submitting = !0, Sl();
	try {
		if (t.type === "project") await Ao(`/api/workspaces/${n}/projects`, {
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
				if (t.templateName && !t.templateDigest && (await Dl(Cl(t)), !t.templateDigest)) throw Error(t.previewError || "Could not render the selected template.");
				e = El(t);
			}
			await Ao(`/api/workspaces/${n}/tasks`, {
				method: "POST",
				body: JSON.stringify(e)
			}), X("Task created.");
		}
		if (Y.activeWorkspaceId !== n || Y.createDialog.identity !== r) return;
		Y.createDialog.open = !1, Y.createDialog.identity = ++na, await Mo();
	} catch (e) {
		Y.createDialog.identity === r && (t.submitting = !1, Sl(), X(pa(e)));
	}
}
function kl(e) {
	let t = /* @__PURE__ */ new Set();
	return String(e || "").split(",").map((e) => e.trim().toLowerCase()).filter((e) => !e || t.has(e) ? !1 : (t.add(e), !0));
}
async function Al(e) {
	confirm(`Archive ${e}?`) && (await Ao(`/api/workspaces/${Y.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	}), X("Archived."), Y.selectedId = "workspace", await Mo());
}
function jl(e) {
	if (!Y.tree) return null;
	for (let t of Y.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function Ml() {
	return Y.selectedId === "workspace" || jl(Y.selectedId) ? !1 : (Y.selectedId = "workspace", !0);
}
function Nl(e) {
	if (!Y.tree) return null;
	for (let t of Y.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function Pl(e) {
	return Y.expandedProjects.has(e);
}
function Fl(e = !1) {
	let t = Nl(Y.selectedId);
	!t || t.id === Y.selectedId || Y.expandedProjects.has(t.id) || (Y.expandedProjects.add(t.id), e && Wo().catch((e) => X(e.message)));
}
function Il(e = window.location.pathname) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: Ll(t[1]),
		resourceId: t[2] === "r" ? Ll(t[3]) : "workspace"
	} : {};
}
function Ll(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function Rl(e) {
	return !!(e && Y.config?.workspaces.some((t) => t.id === e));
}
function zl(e = {}) {
	if (!Y.activeWorkspaceId) return;
	let t = Y.selectedId && Y.selectedId !== "workspace" ? Y.selectedId : "", n = t ? `/w/${encodeURIComponent(Y.activeWorkspaceId)}/r/${encodeURIComponent(t)}` : `/w/${encodeURIComponent(Y.activeWorkspaceId)}`;
	(window.location.pathname !== n || Y.routeProjection.path !== n) && (Y.routeProjection = {
		path: n,
		revision: Y.routeProjection.revision + 1,
		replace: !!e.replace
	}, is());
}
function Bl() {
	return Y.config?.workspaces.find((e) => e.id === Y.activeWorkspaceId)?.name || "Workspace";
}
function Vl() {
	let e = Ul(), t = Wl();
	e.some((e) => e.id === Y.agent.agentName) || (Y.agent.agentName = t);
}
function Hl() {
	let e = Ul(), t = Y.agent.agentName || Wl();
	return e.find((e) => e.id === t) || e[0] || null;
}
function Ul() {
	return (Y.config?.agents || []).filter((e) => e.available !== !1);
}
function Wl() {
	let e = Ul();
	return Gl(Y.config?.agentProfiles, "default") || Gl(Y.settings.data?.agentProfiles, "default") || e[0]?.id || "";
}
function Gl(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function Kl(e = "workspace") {
	Y.modalEnter = "settings", Y.settings.open = !0, Y.settings.identity = ++aa, Y.settings.tab = e, Y.settings.agentDirty = !1, Y.settings.expandedAgents = /* @__PURE__ */ new Set(), Y.settings.workspaceIconPickerId = "", Y.settings.workspaceIconSavingId = "", await Jl(), Wc();
}
function ql(e = Y.settings.agentDirty) {
	Y.settings.open && e && !window.confirm("Discard unsaved agent settings changes?") || (Y.settings.open = !1, Y.settings.identity = ++aa, Y.settings.agentDirty = !1, Wc());
}
async function Jl() {
	let [e, t] = await Promise.all([Ao("/api/settings"), Ao("/api/settings/agenthub")]), n = (t.catalog?.agents || []).map((e) => ({
		...e,
		id: e.name
	}));
	Y.settings.data = {
		...e,
		agentHub: t,
		agents: n,
		agentProfiles: t.config?.agentProfiles || []
	}, Y.config = Yl({
		...Y.config || {},
		...e
	}, t), Y.settings.dataVersion = (Y.settings.dataVersion || 0) + 1;
}
function Yl(e, t) {
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
function Xl() {
	let e = Y.settings.data || {};
	return {
		agents: e.agents || [],
		agentProfiles: e.agentProfiles || []
	};
}
async function Zl() {
	let e = Y.settings.agentDirty ? Xl() : null;
	await Jl(), e && (Y.settings.data = {
		...Y.settings.data || {},
		...e
	});
}
async function Ql() {
	let e = Y.settings.workspacePath.trim();
	if (!e) throw Error("Workspace path is required.");
	let t = Y.settings.createWorkspace, n = await Ao("/api/workspaces", {
		method: "POST",
		body: JSON.stringify({
			path: e,
			create: t
		})
	});
	Oo(), Y.settings.workspacePath = "", Y.settings.createWorkspace = !1, Y.config = await Ao("/api/workspaces"), Y.activeWorkspaceId = n.id, gc(), $o(), await Uo(), await Mo(), await Zl(), Wc(), X(t ? "Workspace created." : "Workspace added.");
}
async function $l(e) {
	e && (Oo(), await Ao(`/api/workspaces/${encodeURIComponent(e)}`, { method: "DELETE" }), Y.config = await Ao("/api/workspaces"), Y.activeWorkspaceId === e ? (Y.activeWorkspaceId = Y.config.activeId || Y.config.workspaces[0]?.id || "", Y.selectedId = "workspace", gc(), Y.activeWorkspaceId ? (await Uo(), await Mo()) : (Y.tree = null, Y.details = {}, qo())) : $o(), await Zl(), Wc(), X("Workspace removed from Forge GUI."));
}
async function eu(e, t) {
	if (!(!e || Y.settings.workspaceIconSavingId)) {
		Y.settings.workspaceIconSavingId = e, Y.settings.workspaceIconPickerId = "", Wc();
		try {
			let n = await Ao(`/api/workspaces/${encodeURIComponent(e)}`, {
				method: "PUT",
				body: JSON.stringify({ icon: t || "" })
			}), r = (e) => (e || []).map((e) => e.id === n.id ? n : e);
			Y.config = {
				...Y.config || {},
				workspaces: r(Y.config?.workspaces)
			}, Y.settings.data = {
				...Y.settings.data || {},
				workspaces: r(Y.settings.data?.workspaces)
			}, Y.settings.workspaceIconPickerId = "", $o(), X(t ? "Workspace icon saved." : "Workspace icon reset to the Forge default.");
		} finally {
			Y.settings.workspaceIconSavingId = "", Wc();
		}
	}
}
function tu(e) {
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
async function nu() {
	let e = Y.settings.data || {};
	await Ao("/api/settings/agenthub", {
		method: "PUT",
		body: JSON.stringify({
			endpoint: e.agentHub?.configuredEndpoint || "http://127.0.0.1:4646",
			agentProfiles: (e.agentProfiles || []).map((e) => ({
				key: e.key,
				description: e.description,
				agentName: e.agentName
			}))
		})
	}), await Jl(), Y.config = Yl(await Ao("/api/workspaces"), Y.settings.data.agentHub), Y.settings.agentDirty = !1, Vl(), Sc(), Mc(), Wc(), Z(), X("AgentHub settings saved.");
}
function ru(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var iu = 0;
function X(e) {
	Oi.renderToast({
		message: String(e || ""),
		revision: ++iu
	});
}
function Z() {
	let e = window.lucide;
	!e || Y.iconRefreshScheduled || (Y.iconRefreshScheduled = !0, ki?.animationFrame(() => {
		Y.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function au(e) {
	Z(), e === "markdown" && window.marked && window.DOMPurify && (Ws(), Z()), e === "diff" && Ws();
}
window.forgeAssetLoaded = au;
function ou() {
	let e = bu();
	Y.paneSizes = Su(e, 0), gu(), yu(e.detailsWidth) && !yu(e.chatWidth) && !wu() && (Y.paneSizes = Su(e, Cu()), gu(), vu());
}
function su(e, t) {
	document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
}
var cu = 8, lu = 220, uu = 360, du = 320, fu = 1e4, pu = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarSessionHeight: 210
}), mu = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarSessionHeight: "--sidebar-session-height"
});
function hu(e, t) {
	if (!Object.hasOwn(mu, e) || !Number.isFinite(t)) return;
	let n = Math.round(Eu(t, e === "sidebarWidth" ? lu : e === "chatWidth" ? du : 84, fu));
	Y.paneSizes[e] = n, su(mu[e], n);
}
function gu() {
	for (let e of Object.keys(mu)) hu(e, Y.paneSizes[e]);
}
function _u(e) {
	if (!Object.hasOwn(mu, e)) return;
	let t = bu();
	delete t.detailsWidth;
	for (let e of Object.keys(mu)) yu(t[e]) || (t[e] = Y.paneSizes[e]);
	t[e] = Y.paneSizes[e], localStorage.setItem(Fi, JSON.stringify(t));
}
function vu() {
	localStorage.setItem(Fi, JSON.stringify({ ...Y.paneSizes }));
}
function yu(e) {
	return typeof e == "number" && Number.isFinite(e);
}
function bu() {
	try {
		let e = JSON.parse(localStorage.getItem(Fi) || "{}");
		return e && typeof e == "object" && !Array.isArray(e) ? e : {};
	} catch {
		return {};
	}
}
function xu(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...pu };
	if (yu(n.sidebarWidth) && (r.sidebarWidth = Eu(n.sidebarWidth, lu, fu)), yu(n.chatWidth)) r.chatWidth = Eu(n.chatWidth, du, fu);
	else if (yu(n.detailsWidth) && t >= 688) {
		let e = Eu(n.detailsWidth, uu, t - cu - du);
		r.chatWidth = Eu(t - cu - e, du, fu);
	}
	return yu(n.sidebarSessionHeight) && (r.sidebarSessionHeight = Eu(n.sidebarSessionHeight, 84, fu)), r;
}
function Su(e = bu(), t = Cu()) {
	return xu(e, t);
}
function Cu() {
	return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
}
function wu() {
	return Du !== void 0 && Du.matches;
}
function Tu() {
	if (wu()) return;
	let e = bu();
	yu(e.detailsWidth) && !yu(e.chatWidth) && (Y.paneSizes = xu(e, Cu()), gu(), vu());
}
function Eu(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
var Du = window.matchMedia("(max-width: 980px)");
function Ou(e) {
	Y.mobile.sidebarOpen = !!e, document.body.classList.toggle("mobile-sidebar-open", Y.mobile.sidebarOpen), is();
}
function ku(e) {
	Y.mobile.view = e === "chat" ? "chat" : "details";
	let t = Y.mobile.view === "chat";
	document.body.classList.toggle("mobile-chat-active", t), is();
}
function Au() {
	try {
		return localStorage.getItem(Ii) === "1";
	} catch {
		return !1;
	}
}
function ju(e) {
	Y.mobile.immersive = !!e, document.body.classList.toggle("chat-immersive", Y.mobile.immersive);
	try {
		localStorage.setItem(Ii, Y.mobile.immersive ? "1" : "0");
	} catch {}
	is();
}
function Mu() {
	ki?.listen(document, "selectionchange", () => {
		if (!Y.agent.renderDeferredForSelection) return;
		let e = Ai("ttyLog");
		e && kc(e) || (Y.agent.renderDeferredForSelection = !1, Ac(), Z());
	}), ki?.listen(document, "keydown", (e) => {
		e.key === "Escape" && Y.diff ? $s() : e.key === "Escape" && Y.preview ? Qs() : e.key === "Escape" && (Y.agent.optionsOpen || Y.agent.agentChooserOpen || Y.agent.historyOpen) && (Y.agent.optionsOpen = !1, Y.agent.agentChooserOpen = !1, Y.agent.historyOpen = !1, Sc(), Mc(), Z());
	}), ki?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Gs(n.dataset.breadcrumbResource).catch((e) => X(e.message));
			return;
		}
		let r = Y.agent.agentChooserOpen && t && !t.closest(".tty-new-session-control"), i = (Y.agent.optionsOpen || Y.agent.historyOpen) && t && !t.closest(".agent-actions") && !t.closest(".agent-sessions") && !t.closest(".tty-composer");
		(r || i) && (Y.agent.optionsOpen = !1, Y.agent.agentChooserOpen = !1, Y.agent.historyOpen = !1, Sc(), Mc(), Z()), Y.sessionMenu && (t?.closest(".session-row") || t?.closest(".session-resource-menu") || (Y.sessionMenu = null, Fs(), Z()));
	}), ki?.listen(window, "beforeunload", Fu), ki?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && Fu();
	});
}
var Nu = !1;
function Pu(e) {
	if (Oi = e, Nu) {
		ua();
		return;
	}
	Nu = !0, ki = new Di(), Mu(), ou(), uo(), Y.user.name = ha(), va(), Y.mobile.immersive = Au(), is(), jo().catch((e) => {
		Y.navigationLoading = !1, Y.navigationError = e.message, X(e.message), qo();
	}), Go();
}
function Fu() {
	Oo();
}
function Iu() {
	Nu && (Fu(), Nu = !1, _c(), Aa(), bc(), sa?.abort(), sa = null, ki?.dispose(), ki = null, Y.autoRefreshTimer = null);
}
async function Lu(e) {
	let t = Il(e);
	if (!Rl(t.workspaceId)) {
		zl({ replace: !0 });
		return;
	}
	let n = Y.activeWorkspaceId !== t.workspaceId, r = Y.selectedId;
	Oo(), Y.navigationVersion++, Y.autoRefreshVersion++, Y.treeRequestVersion++, Y.detailRequestVersion++, Y.workspaceAgentsRequestVersion++, Y.previewRequestVersion++, Y.diffRequestVersion++, Y.workspaceAgentsSaving = !1;
	let i = Y.navigationVersion;
	if (Y.activeWorkspaceId = t.workspaceId, Y.selectedId = t.resourceId || "workspace", !n && r !== Y.selectedId && Y.selectedId !== "workspace" && (Fo(Y.selectedId), delete Y.details[Y.selectedId]), Y.preview = null, Y.diff = null, Y.sessionMenu = null, n && (Y.tree = null, Y.navigationLoading = !0, Y.navigationError = "", Ys(), Y.workspaceAgentsSaving = !1, xl(), Oa(Y.activeWorkspaceId)), n && gc(), $o(), n) {
		if (!await Uo(t.workspaceId, i)) return;
		!t.resourceId && Y.lastResourceId && (Y.selectedId = Y.lastResourceId), await Mo({ updateURL: !1 }), Yo(t.workspaceId, i) && zl({ replace: !0 });
	} else {
		let e = Ml();
		if (Y.selectedId === "workspace" ? await Ho() : (Fl(!1), await No(Y.selectedId)), !Yo(t.workspaceId, i)) return;
		r !== Y.selectedId && await hc(), qo(), e && zl({ replace: !0 });
	}
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/components/Icon.svelte
var Ru = /* @__PURE__ */ H("<i></i>");
function Q(e, t) {
	let n = wi(t, "className", 3, "");
	var r = Ru();
	L(() => {
		J(r, "data-lucide", t.name), q(r, 1, Yr(n()));
	}), U(e, r);
}
//#endregion
//#region src/components/AppShell.svelte
var zu = /* @__PURE__ */ H("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), Bu = /* @__PURE__ */ H("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), Vu = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), Hu = /* @__PURE__ */ H("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Uu = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Wu = /* @__PURE__ */ H("<span><!></span>"), Gu = /* @__PURE__ */ H("<span aria-hidden=\"true\"><!><!></span>"), Ku = /* @__PURE__ */ H("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), qu = /* @__PURE__ */ H("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Ju = /* @__PURE__ */ H("<div class=\"task-group\"></div>"), Yu = /* @__PURE__ */ H("<button type=\"button\"><span class=\"chevron\"><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), Xu = /* @__PURE__ */ H("<div class=\"session-row muted-row\"><!><div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>"), Zu = /* @__PURE__ */ H("<span class=\"session-unread-badge\" aria-label=\"Unread turn completion\">New</span>"), Qu = /* @__PURE__ */ H("<button type=\"button\"><!><span><strong> </strong><small> </small></span></button>"), $u = /* @__PURE__ */ H("<div class=\"session-resource-menu\"></div>"), ed = /* @__PURE__ */ H("<button type=\"button\"><!> <div class=\"session-title\"><strong> </strong><span> </span></div> <span> </span> <!> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), td = /* @__PURE__ */ H("<header class=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" class=\"mobile-icon-button mobile-immersive-button\" type=\"button\" aria-label=\"Toggle immersive chat\"><!></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" type=\"button\" aria-label=\"Close navigation\"></button> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div></div> <section class=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" class=\"workspace-switcher-button\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <!></button> <!></div></section> <section class=\"tree-section\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section> <div id=\"sessionResize\" class=\"resize-handle horizontal-resize sidebar-session-resize\" role=\"separator\" aria-orientation=\"horizontal\" aria-label=\"Resize sessions panel\"></div> <section class=\"session-section\"><div class=\"section-title\"><span>Sessions</span></div> <div id=\"sessionList\" class=\"session-list\"><!></div></section> <div class=\"sidebar-footer\"><button id=\"systemSettingsButton\" type=\"button\"><!><span>Settings</span></button></div></aside> <div id=\"sidebarResize\" class=\"resize-handle sidebar-resize\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"Resize sidebar\"></div> <main class=\"workspace-panel\"><section id=\"detailsPanel\" class=\"details-panel\"></section> <div id=\"detailsResize\" class=\"resize-handle details-resize\" role=\"separator\" aria-orientation=\"vertical\" aria-label=\"Resize chat panel\"></div> <aside id=\"agentPanel\" class=\"agent-panel\"><div id=\"agentControls\" class=\"agent-actions\"></div><div id=\"selfDrivingBarWrap\" class=\"self-driving-bar-wrap\"></div><div id=\"agentSessionsWrap\" class=\"agent-sessions\"></div><div class=\"tty-panel\"><div id=\"ttyLog\" class=\"tty-log\"></div><div id=\"ttyComposer\" class=\"tty-composer\"></div></div></aside></main>", 1);
function nd(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(!1), i = /* @__PURE__ */ M(""), a = /* @__PURE__ */ M(""), o = /* @__PURE__ */ M(null), s = /* @__PURE__ */ M(null), c = null, l = /* @__PURE__ */ M(0), u = /* @__PURE__ */ A(() => B(n).workspaces.find((e) => e.id === B(n).activeWorkspaceId) ?? null);
	Ti(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== B(n).identity;
			N(n, e, !0), t && (N(r, !1), N(i, ""), N(a, ""), _()), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			B(r) && !t?.closest(".workspace-select-row") && N(r, !1), B(i) && !t?.closest(".session-row") && !t?.closest(".session-resource-menu") && N(i, "");
		}, s = (e) => {
			e.key === "Escape" && (B(n).mobile.sidebarOpen ? B(n).onMobileSidebar(!1) : B(r) ? N(r, !1) : B(i) && N(i, ""));
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
		!e.path || e.revision <= B(l) || (N(l, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
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
		e.stopPropagation(), N(o, t, !0), N(s, null), B(n).onDragState(t), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", t.id));
	}
	function h(e, t) {
		if (!p(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		N(s, {
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
		B(o) && B(n).onDragState(null), N(o, null), N(s, null);
	}
	async function v(e) {
		if (!(!e || B(a))) {
			N(a, e, !0), N(r, !1);
			try {
				await B(n).onSwitchWorkspace(e);
			} catch (e) {
				B(n).onToast(e instanceof Error ? e.message : String(e));
			} finally {
				N(a, "");
			}
		}
	}
	async function y(e) {
		if (e) {
			N(i, "");
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
			t.menu && N(i, B(i) === t.id ? "" : t.id, !0);
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
	var C = td(), w = F(C), T = P(w);
	Q(P(T), { name: "menu" }), O(T);
	var ee = I(T, 2), te = P(ee), ne = I(te, 2);
	O(ee);
	var re = I(ee, 2), ie = P(re);
	{
		let e = /* @__PURE__ */ A(() => B(n).mobile.immersive ? "minimize-2" : "maximize-2");
		Q(ie, { get name() {
			return B(e);
		} });
	}
	O(re), O(w);
	var ae = I(w, 2), oe = I(ae, 2), se = P(oe), ce = I(P(se)), le = I(P(ce)), ue = P(le, !0);
	O(le), O(ce), O(se);
	var de = I(se, 2), fe = P(de), pe = P(fe), me = P(pe), he = P(me);
	O(me);
	var ge = I(me, 2), _e = P(ge, !0);
	O(ge);
	var ve = I(ge, 2);
	{
		let e = /* @__PURE__ */ A(() => B(a) ? "loader-circle" : "chevrons-up-down");
		Q(ve, {
			get name() {
				return B(e);
			},
			className: "select-icon"
		});
	}
	O(pe);
	var ye = I(pe, 2), be = (e) => {
		var t = Bu(), i = I(P(t), 2);
		K(i, 17, () => B(n).workspaces, (e) => e.id, (e, t) => {
			var r = zu(), i = P(r), o = P(i);
			O(i);
			var s = I(i, 2), c = P(s), l = P(c, !0);
			O(c);
			var u = I(c), d = P(u, !0);
			O(u), O(s);
			var f = I(s, 2), p = (e) => {
				Q(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			G(f, (e) => {
				B(t).id === B(n).activeWorkspaceId && e(p);
			}), O(r), L((e) => {
				J(r, "aria-selected", B(t).id === B(n).activeWorkspaceId), J(r, "data-workspace-id", B(t).id), r.disabled = e, J(o, "src", B(t).iconSrc), W(l, B(t).name || B(t).id), W(d, B(t).path);
			}, [() => !!B(a)]), V("click", r, () => v(B(t).id)), U(e, r);
		});
		var o = I(i, 2), s = P(o);
		Q(P(s), { name: "plus" }), k(), O(s), O(o), O(t), V("click", s, () => {
			N(r, !1), B(n).onAddWorkspace();
		}), U(e, t);
	};
	G(ye, (e) => {
		B(r) && e(be);
	}), O(fe), O(de);
	var xe = I(de, 2), Se = P(xe), Ce = I(P(Se));
	Q(P(Ce), { name: "plus" }), O(Ce), O(Se);
	var we = I(Se, 2), Te = P(we), Ee = (e) => {
		var t = Vu();
		Q(P(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), k(2), O(t), U(e, t);
	}, De = (e) => {
		var t = Hu(), r = P(t);
		Q(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = I(r, 2), a = P(i, !0);
		O(i), O(t), L(() => W(a, B(n).error)), U(e, t);
	}, Oe = (e) => {
		var t = Uu();
		Q(P(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), k(2), O(t), U(e, t);
	}, ke = (e) => {
		var t = Ar();
		K(F(t), 17, () => B(n).projects, (e) => e.id, (e, t) => {
			var n = Yu(), r = F(n), i = P(r), a = P(i), s = (e) => {
				{
					let n = /* @__PURE__ */ A(() => B(t).expanded ? "chevron-down" : "chevron-right");
					Q(e, { get name() {
						return B(n);
					} });
				}
			};
			G(a, (e) => {
				B(t).children.length && e(s);
			}), O(i);
			var c = I(i, 2), l = (e) => {
				var n = Gu(), r = P(n);
				K(r, 17, () => B(t).status.statuses, (e) => e.key, (e, t) => {
					var n = Wu();
					Q(P(n), {
						get name() {
							return B(t).iconName;
						},
						className: "task-status-icon"
					}), O(n), L(() => q(n, 1, `task-status-indicator ${B(t).className} ${B(t).recentOutput ? "task-status-fresh" : ""}`)), U(e, n);
				});
				var i = I(r), a = (e) => {
					var n = Wu();
					Q(P(n), {
						name: "lock",
						className: "task-lock-icon"
					}), O(n), L(() => q(n, 1, `task-lock-indicator ${B(t).status.lock.className}`)), U(e, n);
				};
				G(i, (e) => {
					B(t).status.lock && e(a);
				}), O(n), L(() => q(n, 1, `task-status-slot ${B(t).status.slotClassName}`)), U(e, n);
			};
			G(c, (e) => {
				B(t).status.hasTaskState && e(l);
			});
			var u = I(c, 2);
			Q(u, {
				name: "folder",
				className: "tree-icon"
			});
			var p = I(u, 2), v = P(p), y = P(v, !0);
			O(v);
			var x = I(v), S = P(x, !0);
			O(x);
			var C = I(x), w = (e) => {
				var n = Ku(), r = P(n), i = P(r, !0);
				O(r);
				var a = I(r, 2), o = P(a, !0);
				O(a), O(n), L(() => {
					W(i, B(t).summary.taskLabel), W(o, B(t).summary.runningLabel);
				}), U(e, n);
			};
			G(C, (e) => {
				B(t).summary && !B(t).expanded && e(w);
			}), O(p);
			var T = I(p, 2);
			Q(P(T), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), O(T), O(r);
			var ee = I(r, 2), te = (e) => {
				var n = Ju();
				K(n, 21, () => B(t).children, (e) => e.id, (e, n) => {
					var r = qu(), i = I(P(r), 2), a = (e) => {
						var t = Gu(), r = P(t);
						K(r, 17, () => B(n).status.statuses, (e) => e.key, (e, t) => {
							var n = Wu();
							Q(P(n), {
								get name() {
									return B(t).iconName;
								},
								className: "task-status-icon"
							}), O(n), L(() => q(n, 1, `task-status-indicator ${B(t).className} ${B(t).recentOutput ? "task-status-fresh" : ""}`)), U(e, n);
						});
						var i = I(r), a = (e) => {
							var t = Wu();
							Q(P(t), {
								name: "lock",
								className: "task-lock-icon"
							}), O(t), L(() => q(t, 1, `task-lock-indicator ${B(n).status.lock.className}`)), U(e, t);
						};
						G(i, (e) => {
							B(n).status.lock && e(a);
						}), O(t), L(() => q(t, 1, `task-status-slot ${B(n).status.slotClassName}`)), U(e, t);
					};
					G(i, (e) => {
						B(n).status.hasTaskState && e(a);
					});
					var s = I(i, 2);
					Q(s, {
						name: "file-text",
						className: "tree-icon"
					});
					var c = I(s), l = P(c), u = P(l, !0);
					O(l);
					var p = I(l), v = P(p, !0);
					O(p), O(c);
					var y = I(c, 2);
					Q(P(y), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), O(y), O(r), L((e) => {
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
				}), O(n), U(e, n);
			};
			G(ee, (e) => {
				B(t).expanded && e(te);
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
	G(Te, (e) => {
		B(n).loading ? e(Ee) : B(n).error ? e(De, 1) : B(n).projects.length === 0 ? e(Oe, 2) : e(ke, -1);
	}), O(we), O(xe);
	var Ae = I(xe, 2), je = I(Ae, 2), Me = I(P(je), 2), Ne = P(Me), E = (e) => {
		var t = Xu();
		Q(P(t), { name: "message-square" }), k(), O(t), U(e, t);
	}, Pe = (e) => {
		var t = Ar();
		K(F(t), 17, () => B(n).sessions, (e) => e.id, (e, t) => {
			var n = ed(), r = F(n), a = P(r), s = (e) => {
				var n = Gu(), r = P(n);
				K(r, 17, () => B(t).status.statuses, (e) => e.key, (e, t) => {
					var n = Wu();
					Q(P(n), {
						get name() {
							return B(t).iconName;
						},
						className: "task-status-icon"
					}), O(n), L(() => q(n, 1, `task-status-indicator ${B(t).className} ${B(t).recentOutput ? "task-status-fresh" : ""}`)), U(e, n);
				});
				var i = I(r), a = (e) => {
					var n = Wu();
					Q(P(n), {
						name: "lock",
						className: "task-lock-icon"
					}), O(n), L(() => q(n, 1, `task-lock-indicator ${B(t).status.lock.className}`)), U(e, n);
				};
				G(i, (e) => {
					B(t).status.lock && e(a);
				}), O(n), L(() => q(n, 1, `task-status-slot session-status-icon ${B(t).status.slotClassName}`)), U(e, n);
			};
			G(a, (e) => {
				B(t).status.hasTaskState && e(s);
			});
			var c = I(a, 2), l = P(c), u = P(l, !0);
			O(l);
			var p = I(l), v = P(p, !0);
			O(p), O(c);
			var b = I(c, 2), S = P(b, !0);
			O(b);
			var C = I(b, 2), w = (e) => {
				U(e, Zu());
			};
			G(C, (e) => {
				B(t).unread && e(w);
			});
			var T = I(C, 2);
			Q(P(T), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), O(T), O(r);
			var ee = I(r, 2), te = (e) => {
				var n = $u();
				K(n, 21, () => B(t).controls, (e) => e.resourceId, (e, t) => {
					var n = Qu(), r = P(n);
					Q(r, { name: "corner-down-right" });
					var i = I(r), a = P(i), o = P(a, !0);
					O(a);
					var s = I(a), c = P(s, !0);
					O(s), O(i), O(n), L(() => {
						n.disabled = !B(t).navigable, W(o, B(t).resourceId), W(c, B(t).path);
					}), V("click", n, () => y(B(t).resourceId)), U(e, n);
				}), O(n), L(() => J(n, "data-session-menu", B(t).id)), U(e, n);
			};
			G(ee, (e) => {
				B(i) === B(t).id && B(t).menu && e(te);
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
	G(Ne, (e) => {
		B(n).sessions.length === 0 ? e(E) : e(Pe, -1);
	}), O(Me), O(je);
	var D = I(je, 2), Fe = P(D);
	Q(P(Fe), { name: "settings" }), k(), O(Fe), O(D), O(oe);
	var Ie = I(oe, 2), Le = I(Ie, 2), Re = I(P(Le), 2);
	k(2), O(Le), L(() => {
		J(T, "aria-expanded", B(n).mobile.sidebarOpen), J(te, "aria-selected", B(n).mobile.view === "details"), J(ne, "aria-selected", B(n).mobile.view === "chat"), J(re, "aria-pressed", B(n).mobile.immersive), W(ue, B(n).version), J(pe, "aria-expanded", B(r)), J(he, "src", B(u)?.iconSrc || "/favicon.svg"), W(_e, B(u)?.name || "Workspace"), J(we, "data-navigation-identity", B(n).identity);
	}), V("click", T, () => B(n).onMobileSidebar(!B(n).mobile.sidebarOpen)), V("click", te, () => B(n).onMobileView("details")), V("click", ne, () => B(n).onMobileView("chat")), V("click", re, () => B(n).onMobileImmersive(!B(n).mobile.immersive)), V("click", ae, () => B(n).onMobileSidebar(!1)), V("click", pe, (e) => {
		e.stopPropagation(), N(r, !B(r));
	}), V("click", Ce, function(...e) {
		B(n).onCreateProject?.apply(this, e);
	}), V("pointerdown", Ae, (e) => S(e, "sidebarSessionHeight")), V("click", Fe, () => {
		B(n).onMobileSidebar(!1), B(n).onOpenSettings();
	}), V("pointerdown", Ie, (e) => S(e, "sidebarWidth")), V("pointerdown", Re, (e) => S(e, "chatWidth")), U(e, C), Ge();
}
Sr(["click", "pointerdown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var rd = /* @__PURE__ */ H("<button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button>"), id = /* @__PURE__ */ H("<button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn; keep the Session open.\" aria-label=\"End current turn; keep the Session open.\"><!></button>"), ad = /* @__PURE__ */ H("<span class=\"tty-composer-divider\" aria-hidden=\"true\"></span> <span class=\"tty-composer-group\"><!> <button type=\"button\" id=\"agentCloseSessionButton\" class=\"tty-composer-action tty-close-session-button\"><!></button></span>", 1), od = /* @__PURE__ */ H("<button type=\"button\" id=\"agentActionsToggle\" class=\"tty-actions-toggle\" title=\"Session actions\" aria-label=\"Session actions\"><!></button>"), sd = /* @__PURE__ */ H("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), cd = /* @__PURE__ */ H("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), ld = /* @__PURE__ */ H("<div id=\"ttyAgentMenu\" class=\"tty-agent-menu\" role=\"menu\" aria-label=\"Choose an Agent\"></div>"), ud = /* @__PURE__ */ H("<div class=\"tty-session-actions collapsible open\"><div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div></div>"), dd = /* @__PURE__ */ H("<form id=\"ttyForm\" class=\"tty-input\"><span>&gt;</span> <textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <span class=\"tty-composer-group\"><!> <button type=\"submit\" class=\"tty-send-button\"><!></button></span> <!> <!></form> <!> <!>", 1), fd = /* @__PURE__ */ H("<div class=\"external-resource-lock\">This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.</div>"), pd = /* @__PURE__ */ H("<button type=\"button\" id=\"agentResumeButton\" class=\"tty-primary-action\" title=\"Resume Session\" aria-label=\"Resume Session\"><!><span>Resume Session</span></button>"), md = /* @__PURE__ */ H("<div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div>"), hd = /* @__PURE__ */ H("<div class=\"tty-session-actions tty-standalone-actions open\" role=\"toolbar\" aria-label=\"Session actions\"><!> <!> <!></div>");
function gd(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(""), i = /* @__PURE__ */ M(-1), a = /* @__PURE__ */ M(""), o = /* @__PURE__ */ M(!1), s = /* @__PURE__ */ M(""), c = /* @__PURE__ */ M(!1), l = /* @__PURE__ */ M(void 0), u = /* @__PURE__ */ A(() => !!B(n).unavailableReason || B(o) || B(n).sending), d = /* @__PURE__ */ A(() => B(n).sessionStarting ? "Creating a new AgentHub session..." : B(n).agents.length ? "Choose an Agent to start a new session." : "No enabled agents are available. Configure an AgentHub Agent in Settings.");
	Ti(() => t.channel.subscribe((e) => {
		N(n, e, !0), e.identity === B(r) ? e.draftResetVersion !== B(i) && (N(i, e.draftResetVersion, !0), N(a, e.draft, !0), N(s, "")) : (N(r, e.identity, !0), N(i, e.draftResetVersion, !0), N(a, e.draft, !0), N(o, !1), N(s, ""), N(c, !1)), queueMicrotask(e.onIconsChanged);
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
		N(a, e, !0), N(s, ""), B(n).onDraft(e, f());
	}
	async function m(e) {
		e?.preventDefault();
		let t = B(a);
		if (B(u) || !t.trim() || !B(n).runId) return;
		let i = B(r), c = f();
		N(o, !0), N(s, "");
		try {
			let e = await B(n).onSend(t, c);
			B(r) === i && e.accepted && e.clear && B(a) === t && p("");
		} catch (e) {
			B(r) === i && N(s, e instanceof Error ? e.message : String(e), !0);
		} finally {
			B(r) === i && (N(o, !1), await dr(), B(l)?.focus({ preventScroll: !0 }));
		}
	}
	function h(e) {
		if (!(e.key !== "Enter" || e.isComposing || e.keyCode === 229)) {
			if (e.metaKey || e.ctrlKey) {
				e.preventDefault(), m();
				return;
			}
			if (e.shiftKey) {
				N(c, !0);
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
	var _ = Ar(), v = F(_), y = (e) => {
		var t = dd(), r = F(t), i = I(P(r), 2);
		ot(i), Si(i, (e) => N(l, e), () => B(l));
		var c = I(i, 2), f = P(c), g = (e) => {
			var t = rd();
			Q(P(t), { name: "plus" }), O(t), V("click", t, function(...e) {
				B(n).onOpenUpload?.apply(this, e);
			}), U(e, t);
		};
		G(f, (e) => {
			B(n).externalLocked || e(g);
		});
		var _ = I(f, 2), v = P(_);
		{
			let e = /* @__PURE__ */ A(() => B(o) ? "loader-circle" : "send");
			Q(v, { get name() {
				return B(e);
			} });
		}
		O(_), O(c);
		var y = I(c, 2), b = (e) => {
			var t = ad(), r = I(F(t), 2), i = P(r), a = (e) => {
				var t = id(), r = P(t);
				{
					let e = /* @__PURE__ */ A(() => B(n).endingTurn ? "loader-circle" : "pause");
					Q(r, { get name() {
						return B(e);
					} });
				}
				O(t), L(() => t.disabled = B(n).endingTurn || B(n).closingSession || B(n).selfDrivingDisabling), V("click", t, function(...e) {
					B(n).onEndTurn?.apply(this, e);
				}), U(e, t);
			};
			G(i, (e) => {
				B(n).canEndTurn && e(a);
			});
			var o = I(i, 2), s = P(o);
			{
				let e = /* @__PURE__ */ A(() => B(n).closingSession ? "loader-circle" : "square");
				Q(s, { get name() {
					return B(e);
				} });
			}
			O(o), O(r), L(() => {
				o.disabled = B(n).endingTurn || B(n).closingSession || B(n).selfDrivingDisabling, J(o, "title", B(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session."), J(o, "aria-label", B(n).selfDrivingRemainsEnabled ? "Close this Session; Self-Driving stays On and may create a replacement." : "Close session; end the entire AgentHub Session.");
			}), V("click", o, function(...e) {
				B(n).onCloseSession?.apply(this, e);
			}), U(e, t);
		};
		G(y, (e) => {
			(B(n).canEndTurn || B(n).runId) && e(b);
		});
		var x = I(y, 2), S = (e) => {
			var t = od();
			Q(P(t), { name: "ellipsis" }), O(t), L(() => J(t, "aria-expanded", B(n).actionsOpen)), V("click", t, function(...e) {
				B(n).onToggleActions?.apply(this, e);
			}), U(e, t);
		};
		G(x, (e) => {
			B(n).internalLocked || e(S);
		}), O(r);
		var C = I(r, 2), w = (e) => {
			var t = sd(), n = P(t), r = P(n, !0);
			O(n);
			var i = I(n);
			O(t), L(() => {
				W(r, B(s)), i.disabled = B(o);
			}), V("click", i, () => m()), U(e, t);
		};
		G(C, (e) => {
			B(s) && e(w);
		});
		var T = I(C, 2), ee = (e) => {
			var t = ud(), r = P(t), i = P(r), a = P(i);
			{
				let e = /* @__PURE__ */ A(() => B(n).sessionStarting ? "loader-circle" : "plus");
				Q(a, { get name() {
					return B(e);
				} });
			}
			var o = I(a), s = P(o, !0);
			O(o), O(i);
			var c = I(i, 2), l = (e) => {
				var t = ld();
				K(t, 21, () => B(n).agents, (e) => e.id, (e, t) => {
					var r = cd();
					let i;
					var a = P(r), o = P(a, !0);
					O(a);
					var s = I(a), c = P(s, !0);
					O(s), O(r), L(() => {
						J(r, "data-agent-choice", B(t).id), i = q(r, 1, "", null, i, { active: B(t).id === B(n).selectedAgentId }), W(o, B(t).label), W(c, B(t).summary);
					}), V("click", r, () => B(n).onChooseAgent(B(t).id)), U(e, r);
				}), O(t), U(e, t);
			};
			G(c, (e) => {
				B(n).chooserOpen && e(l);
			}), O(r), O(t), L(() => {
				J(i, "title", B(d)), J(i, "aria-label", B(d)), i.disabled = B(n).sessionStarting || !B(n).agents.length, J(i, "aria-expanded", B(n).chooserOpen), W(s, B(n).sessionStarting ? "Creating Session..." : "New Session");
			}), V("click", i, function(...e) {
				B(n).onToggleChooser?.apply(this, e);
			}), U(e, t);
		};
		G(T, (e) => {
			B(n).actionsOpen && !B(n).internalLocked && e(ee);
		}), L(() => {
			J(i, "data-agent-draft-key", B(n).draftKey), J(i, "placeholder", B(n).unavailableReason || "Send input to the selected agent session"), i.disabled = B(u), fi(i, B(a)), J(_, "title", B(o) ? "Sending..." : B(n).unavailableReason || "Send input"), J(_, "aria-label", B(o) ? "Sending..." : B(n).unavailableReason || "Send input"), _.disabled = B(u);
		}), xr("submit", r, m), V("input", i, (e) => p(e.currentTarget.value)), V("keydown", i, h), U(e, t);
	}, b = (e) => {
		var t = hd(), r = P(t), i = (e) => {
			U(e, fd());
		};
		G(r, (e) => {
			B(n).externalLocked && e(i);
		});
		var a = I(r, 2), o = (e) => {
			var t = pd();
			Q(P(t), { name: "rotate-ccw" }), k(), O(t), V("click", t, function(...e) {
				B(n).onResume?.apply(this, e);
			}), U(e, t);
		};
		G(a, (e) => {
			B(n).canResume && e(o);
		});
		var s = I(a, 2), c = (e) => {
			var t = md(), r = P(t), i = P(r);
			{
				let e = /* @__PURE__ */ A(() => B(n).sessionStarting ? "loader-circle" : "plus");
				Q(i, { get name() {
					return B(e);
				} });
			}
			var a = I(i), o = P(a, !0);
			O(a), O(r);
			var s = I(r, 2), c = (e) => {
				var t = ld();
				K(t, 21, () => B(n).agents, (e) => e.id, (e, t) => {
					var r = cd();
					let i;
					var a = P(r), o = P(a, !0);
					O(a);
					var s = I(a), c = P(s, !0);
					O(s), O(r), L(() => {
						J(r, "data-agent-choice", B(t).id), i = q(r, 1, "", null, i, { active: B(t).id === B(n).selectedAgentId }), W(o, B(t).label), W(c, B(t).summary);
					}), V("click", r, () => B(n).onChooseAgent(B(t).id)), U(e, r);
				}), O(t), U(e, t);
			};
			G(s, (e) => {
				B(n).chooserOpen && e(c);
			}), O(t), L(() => {
				J(r, "title", B(d)), J(r, "aria-label", B(d)), r.disabled = B(n).sessionStarting || !B(n).agents.length, J(r, "aria-expanded", B(n).chooserOpen), W(o, B(n).sessionStarting ? "Creating Session..." : "New Session");
			}), V("click", r, function(...e) {
				B(n).onToggleChooser?.apply(this, e);
			}), U(e, t);
		};
		G(s, (e) => {
			!B(n).internalLocked && !B(n).externalLocked && e(c);
		}), O(t), U(e, t);
	};
	G(v, (e) => {
		B(n).live ? e(y) : e(b, -1);
	}), U(e, _), Ge();
}
Sr([
	"input",
	"keydown",
	"click"
]);
//#endregion
//#region src/components/CreateDialog.svelte
var _d = /* @__PURE__ */ H("<span> </span>"), vd = /* @__PURE__ */ H("<option> </option>"), yd = /* @__PURE__ */ H("<label><span>Template</span> <select name=\"templateName\"><option>Blank task</option><!></select></label>"), bd = /* @__PURE__ */ H("<p class=\"template-description\"> </p>"), xd = /* @__PURE__ */ H("<div class=\"create-dialog-tabs\" role=\"tablist\" aria-label=\"Task content\"><button type=\"button\" role=\"tab\">Edit</button> <button type=\"button\" role=\"tab\">Preview</button></div>"), Sd = /* @__PURE__ */ H("<small> </small>"), Cd = /* @__PURE__ */ H("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), wd = /* @__PURE__ */ H("<p class=\"create-task-preview-hint\">Fields changed since this preview was rendered. Refresh to update.</p>"), Td = /* @__PURE__ */ H("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), Ed = /* @__PURE__ */ H("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Dd = /* @__PURE__ */ H("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <small> </small></section>"), Od = /* @__PURE__ */ H("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), kd = /* @__PURE__ */ H("<div class=\"create-task-preview-pane\" role=\"tabpanel\" aria-label=\"Task preview\"><div class=\"template-preview-actions\"><button type=\"button\" class=\"secondary compact\"> </button> <!></div> <!> <!> <!></div>"), Ad = /* @__PURE__ */ H("<small>(generated by template)</small>"), jd = /* @__PURE__ */ H("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), Md = /* @__PURE__ */ H("<input type=\"checkbox\"/><span> </span>", 1), Nd = /* @__PURE__ */ H("<textarea></textarea>"), Pd = /* @__PURE__ */ H("<select><option>Select...</option><!></select>"), Fd = /* @__PURE__ */ H("<input/>"), Id = /* @__PURE__ */ H("<label><!> <!> <!> <!> <!></label>"), Ld = /* @__PURE__ */ H("<div class=\"template-fields\" aria-label=\"Required template fields\"></div>"), Rd = /* @__PURE__ */ H("<textarea name=\"detail\" placeholder=\"Task detail\"></textarea>"), zd = /* @__PURE__ */ H("<div class=\"template-fields\" aria-label=\"Optional template fields\"></div>"), Bd = /* @__PURE__ */ H("<div class=\"create-task-automation-fields\"><label><span>Agent <small>(optional)</small></span><select name=\"agentName\"><option>Workspace default</option><!></select></label> <label><span>Run instructions</span><textarea name=\"prompt\" placeholder=\"Instructions for the automated run\"></textarea></label> <label><span>Preferred Agent Profiles</span><input name=\"agentProfiles\" placeholder=\"Workspace default, or kimi, codex\"/><small> </small></label> <label><span>Completion criteria</span><textarea name=\"completionCriteria\" placeholder=\"Natural-language completion criteria\"></textarea></label></div>"), Vd = /* @__PURE__ */ H("<div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span><input name=\"slug\" placeholder=\"optional-slug\"/></label></div> <!> <details class=\"create-task-more-options\"><summary> </summary> <div class=\"create-task-more-options-body\"><!> <label class=\"create-task-automation-toggle\"><input name=\"selfDriving\" type=\"checkbox\"/><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label> <!></div></details>", 1), Hd = /* @__PURE__ */ H("<div class=\"create-task-dialog-body\"><!> <!> <!> <!></div>"), Ud = /* @__PURE__ */ H("<textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/>", 1), Wd = /* @__PURE__ */ H("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function Gd(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(tn(m(B(n).draft))), i = /* @__PURE__ */ M(""), a = /* @__PURE__ */ M(!1), o = /* @__PURE__ */ A(() => B(r).type === "task"), s = /* @__PURE__ */ A(() => B(n).templates.find((e) => e.name === B(r).templateName)), c = /* @__PURE__ */ A(() => B(n).preview?.title || ""), l = /* @__PURE__ */ A(() => B(r).titleOverride ? B(r).title : B(c)), u = /* @__PURE__ */ A(() => (B(s)?.fields || []).filter((e) => e.required)), d = /* @__PURE__ */ A(() => (B(s)?.fields || []).filter((e) => !e.required)), f = /* @__PURE__ */ A(() => B(r).editedMarkdown != null && !!B(n).preview && B(r).editedMarkdown !== B(n).preview?.markdown), p = /* @__PURE__ */ A(() => !B(n).preview || B(n).previewKey !== B(n).previewRequestKey(B(r)));
	Ti(() => t.channel.subscribe((e) => {
		let t = B(n).preview;
		N(n, e, !0), e.identity === B(i) ? e.preview && e.preview !== t && B(r).editedMarkdown == null && (B(r).editedMarkdown = e.preview.markdown) : (N(i, e.identity, !0), N(r, m(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), Ti(() => {
		let e = (e) => {
			B(n).open && e.key === "Escape" && !B(n).submitting && (e.preventDefault(), B(n).onClose());
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
		if (B(a)) return;
		let t = e.currentTarget.value;
		if (t === B(r).templateName) return;
		if ((Object.values(B(r).templateFields).some((e) => !!e) || B(r).titleOverride || B(r).editedMarkdown != null) && !B(n).onConfirmTemplateSwitch()) {
			N(a, !0), await dr(), N(a, !1);
			return;
		}
		let i = B(n).templates.find((e) => e.name === t);
		B(r).templateName = t, B(r).templateFields = {};
		for (let e of i?.fields || []) B(r).templateFields[e.name] = h(e);
		B(r).title = "", B(r).titleOverride = !1, B(r).activeTab = "edit", B(r).editedMarkdown = null, B(r).showOptions = !1;
	}
	function _(e, t) {
		let n = t.currentTarget;
		B(r).templateFields[e.name] = e.type === "boolean" && n instanceof HTMLInputElement ? n.checked : n.value;
	}
	async function v(e) {
		B(r).activeTab = e, e === "preview" && B(r).templateName && B(p) && await B(n).onPreview(m(B(r)));
	}
	async function y(e) {
		e.preventDefault(), B(n).submitting || await B(n).onSubmit(m(B(r)));
	}
	async function b() {
		!B(n).previewing && !B(n).submitting && await B(n).onPreview(m(B(r)));
	}
	function x(e) {
		B(r).title = e.currentTarget.value, B(r).templateName && (B(r).titleOverride = !0);
	}
	function S(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var C = Ar(), w = F(C), T = (e) => {
		var t = Wd(), i = P(t), a = I(i, 2);
		let c;
		var m = P(a), h = P(m), C = P(h), w = P(C, !0);
		O(C);
		var T = I(C, 2), ee = (e) => {
			var t = _d(), n = P(t, !0);
			O(t), L(() => W(n, B(r).projectId)), U(e, t);
		};
		G(T, (e) => {
			B(o) && e(ee);
		}), O(h);
		var te = I(h, 2);
		Q(P(te), { name: "x" }), O(te), O(m);
		var ne = I(m, 2), re = P(ne), ie = (e) => {
			var t = Hd(), i = P(t), a = (e) => {
				var t = yd(), i = I(P(t), 2), a = P(i);
				a.value = a.__value = "", K(I(a), 17, () => B(n).templates, (e) => e.name, (e, t) => {
					var n = vd(), r = P(n, !0);
					O(n);
					var i = {};
					L((e) => {
						n.disabled = !B(t).valid, W(r, e), i !== (i = B(t).name) && (n.value = (n.__value = B(t).name) ?? "");
					}, [() => S(B(t))]), U(e, n);
				}), O(i);
				var o;
				ii(i), O(t), L(() => {
					o !== (o = B(r).templateName) && (i.value = (i.__value = B(r).templateName) ?? "", ri(i, B(r).templateName));
				}), V("change", i, g), U(e, t);
			};
			G(i, (e) => {
				B(n).templates.length && e(a);
			});
			var o = I(i, 2), c = (e) => {
				var t = bd(), n = P(t, !0);
				O(t), L(() => W(n, B(s).description)), U(e, t);
			};
			G(o, (e) => {
				B(s)?.description && e(c);
			});
			var m = I(o, 2), h = (e) => {
				var t = xd(), n = P(t);
				let i;
				var a = I(n, 2);
				let o;
				O(t), L(() => {
					i = q(n, 1, "create-dialog-tab", null, i, { active: B(r).activeTab === "edit" }), J(n, "aria-selected", B(r).activeTab === "edit"), o = q(a, 1, "create-dialog-tab", null, o, { active: B(r).activeTab === "preview" }), J(a, "aria-selected", B(r).activeTab === "preview");
				}), V("click", n, () => v("edit")), V("click", a, () => v("preview")), U(e, t);
			};
			G(m, (e) => {
				B(s) && e(h);
			});
			var y = I(m, 2), C = (e) => {
				var t = kd(), i = P(t), a = P(i), o = P(a, !0);
				O(a);
				var s = I(a, 2), c = (e) => {
					var t = Sd(), i = P(t);
					O(t), L(() => W(i, `Template ${B(r).templateName ?? ""} · ${B(n).templateDigest ?? ""}`)), U(e, t);
				};
				G(s, (e) => {
					B(n).templateDigest && e(c);
				}), O(i);
				var l = I(i, 2), u = (e) => {
					var t = Cd(), r = P(t, !0);
					O(t), L(() => W(r, B(n).previewError)), U(e, t);
				};
				G(l, (e) => {
					B(n).previewError && e(u);
				});
				var d = I(l, 2), m = (e) => {
					U(e, wd());
				};
				G(d, (e) => {
					!B(n).previewError && B(p) && B(n).preview && e(m);
				});
				var h = I(d, 2), g = (e) => {
					var t = Dd(), i = P(t), a = P(i, !0);
					O(i);
					var o = I(i, 2);
					ot(o);
					var s = I(o, 2), c = (e) => {
						var t = Td(), i = I(P(t), 2);
						O(t), V("click", i, () => B(r).editedMarkdown = B(n).preview?.markdown ?? null), U(e, t);
					}, l = (e) => {
						U(e, Ed());
					};
					G(s, (e) => {
						B(f) ? e(c) : e(l, -1);
					});
					var u = I(s, 2), d = (e) => {
						var t = Sd(), r = P(t);
						O(t), L(() => W(r, `Slug: ${B(n).preview.slug ?? ""}`)), U(e, t);
					};
					G(u, (e) => {
						B(n).preview.slug && e(d);
					});
					var p = I(u, 2), m = P(p);
					O(p), O(t), L(() => {
						W(a, B(n).preview.title), W(m, `Self-Driving: ${B(n).preview.selfDriving ? `on with ${B(n).preview.selfDriving.agentName || "workspace default"}` : "off"}`);
					}), _i(o, () => B(r).editedMarkdown, (e) => B(r).editedMarkdown = e), U(e, t);
				}, _ = (e) => {
					U(e, Od());
				};
				G(h, (e) => {
					B(n).preview ? e(g) : B(n).previewing && e(_, 1);
				}), O(t), L(() => {
					a.disabled = B(n).previewing || B(n).submitting, W(o, B(n).previewing ? "Rendering..." : "Refresh");
				}), V("click", a, b), U(e, t);
			}, w = (e) => {
				var t = Vd(), i = F(t), a = P(i), o = P(a), c = I(P(o)), f = (e) => {
					U(e, Ad());
				};
				G(c, (e) => {
					B(s)?.taskTitle && !B(r).titleOverride && e(f);
				}), O(o);
				var p = I(o, 2), m = P(p);
				di(m);
				var h = I(m, 2), g = (e) => {
					var t = jd();
					V("click", t, () => {
						B(r).title = "", B(r).titleOverride = !1;
					}), U(e, t);
				};
				G(h, (e) => {
					B(s)?.taskTitle && B(r).titleOverride && e(g);
				}), O(p), O(a);
				var v = I(a, 2), y = I(P(v));
				di(y), O(v), O(i);
				var b = I(i, 2), S = (e) => {
					var t = Ar(), n = F(t), i = (e) => {
						var t = Ld();
						K(t, 21, () => B(u), (e) => e.name, (e, t) => {
							var n = Id();
							let i;
							var a = P(n), o = (e) => {
								var n = Md(), i = F(n);
								di(i);
								var a = I(i), o = P(a, !0);
								O(a), L(() => {
									pi(i, B(r).templateFields[B(t).name] === !0), W(o, B(t).label);
								}), V("change", i, (e) => _(B(t), e)), U(e, n);
							}, s = (e) => {
								var n = _d(), r = P(n);
								O(n), L(() => W(r, `${B(t).label ?? ""}${B(t).required ? " *" : ""}`)), U(e, n);
							};
							G(a, (e) => {
								B(t).type === "boolean" ? e(o) : e(s, -1);
							});
							var c = I(a, 2), l = (e) => {
								var n = Nd();
								ot(n), L((e) => {
									n.required = B(t).required, J(n, "placeholder", B(t).placeholder || ""), fi(n, e);
								}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("input", n, (e) => _(B(t), e)), U(e, n);
							};
							G(c, (e) => {
								B(t).type === "textarea" && e(l);
							});
							var u = I(c, 2), d = (e) => {
								var n = Pd(), i = P(n);
								i.value = i.__value = "", K(I(i), 17, () => B(t).options || [], Lr, (e, t) => {
									var n = vd(), r = P(n, !0);
									O(n);
									var i = {};
									L(() => {
										W(r, B(t)), i !== (i = B(t)) && (n.value = (n.__value = B(t)) ?? "");
									}), U(e, n);
								}), O(n);
								var a;
								ii(n), L((e) => {
									n.required = B(t).required, a !== (a = e) && (n.value = (n.__value = e) ?? "", ri(n, e));
								}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("change", n, (e) => _(B(t), e)), U(e, n);
							};
							G(u, (e) => {
								B(t).type === "select" && e(d);
							});
							var f = I(u, 2), p = (e) => {
								var n = Fd();
								di(n), L((e) => {
									n.required = B(t).required, J(n, "placeholder", B(t).placeholder || ""), fi(n, e);
								}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("input", n, (e) => _(B(t), e)), U(e, n);
							};
							G(f, (e) => {
								B(t).type === "text" && e(p);
							});
							var m = I(f, 2), h = (e) => {
								var n = Sd(), r = P(n, !0);
								O(n), L(() => W(r, B(t).description)), U(e, n);
							};
							G(m, (e) => {
								B(t).description && e(h);
							}), O(n), L(() => i = q(n, 1, "", null, i, { "template-boolean": B(t).type === "boolean" })), U(e, n);
						}), O(t), U(e, t);
					};
					G(n, (e) => {
						B(u).length && e(i);
					}), U(e, t);
				}, C = (e) => {
					var t = Rd();
					ot(t), _i(t, () => B(r).detail, (e) => B(r).detail = e), U(e, t);
				};
				G(b, (e) => {
					B(s) ? e(S) : e(C, -1);
				});
				var w = I(b, 2), T = P(w), ee = P(T);
				O(T);
				var te = I(T, 2), ne = P(te), re = (e) => {
					var t = zd();
					K(t, 21, () => B(d), (e) => e.name, (e, t) => {
						var n = Id();
						let i;
						var a = P(n), o = (e) => {
							var n = Md(), i = F(n);
							di(i);
							var a = I(i), o = P(a, !0);
							O(a), L(() => {
								pi(i, B(r).templateFields[B(t).name] === !0), W(o, B(t).label);
							}), V("change", i, (e) => _(B(t), e)), U(e, n);
						}, s = (e) => {
							var n = _d(), r = P(n, !0);
							O(n), L(() => W(r, B(t).label)), U(e, n);
						};
						G(a, (e) => {
							B(t).type === "boolean" ? e(o) : e(s, -1);
						});
						var c = I(a, 2), l = (e) => {
							var n = Nd();
							ot(n), L((e) => {
								J(n, "placeholder", B(t).placeholder || ""), fi(n, e);
							}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("input", n, (e) => _(B(t), e)), U(e, n);
						};
						G(c, (e) => {
							B(t).type === "textarea" && e(l);
						});
						var u = I(c, 2), d = (e) => {
							var n = Pd(), i = P(n);
							i.value = i.__value = "", K(I(i), 17, () => B(t).options || [], Lr, (e, t) => {
								var n = vd(), r = P(n, !0);
								O(n);
								var i = {};
								L(() => {
									W(r, B(t)), i !== (i = B(t)) && (n.value = (n.__value = B(t)) ?? "");
								}), U(e, n);
							}), O(n);
							var a;
							ii(n), L((e) => {
								a !== (a = e) && (n.value = (n.__value = e) ?? "", ri(n, e));
							}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("change", n, (e) => _(B(t), e)), U(e, n);
						};
						G(u, (e) => {
							B(t).type === "select" && e(d);
						});
						var f = I(u, 2), p = (e) => {
							var n = Fd();
							di(n), L((e) => {
								J(n, "placeholder", B(t).placeholder || ""), fi(n, e);
							}, [() => String(B(r).templateFields[B(t).name] ?? "")]), V("input", n, (e) => _(B(t), e)), U(e, n);
						};
						G(f, (e) => {
							B(t).type === "text" && e(p);
						});
						var m = I(f, 2), h = (e) => {
							var n = Sd(), r = P(n, !0);
							O(n), L(() => W(r, B(t).description)), U(e, n);
						};
						G(m, (e) => {
							B(t).description && e(h);
						}), O(n), L(() => i = q(n, 1, "", null, i, { "template-boolean": B(t).type === "boolean" })), U(e, n);
					}), O(t), U(e, t);
				};
				G(ne, (e) => {
					B(d).length && e(re);
				});
				var ie = I(ne, 2), ae = P(ie);
				di(ae), k(), O(ie);
				var oe = I(ie, 2), se = (e) => {
					var t = Bd(), i = P(t), a = I(P(i)), o = P(a);
					o.value = o.__value = "", K(I(o), 17, () => B(n).agents, (e) => e.id, (e, t) => {
						var n = vd(), r = P(n);
						O(n);
						var i = {};
						L(() => {
							W(r, `${B(t).label ?? ""} — ${B(t).summary ?? ""}`), i !== (i = B(t).id) && (n.value = (n.__value = B(t).id) ?? "");
						}), U(e, n);
					}), O(a), O(i);
					var s = I(i, 2), c = I(P(s));
					ot(c), O(s);
					var l = I(s, 2), u = I(P(l));
					di(u);
					var d = I(u), f = P(d, !0);
					O(d), O(l);
					var p = I(l, 2), m = I(P(p));
					ot(m), O(p), O(t), L((e) => W(f, e), [() => B(n).profileKeys.length ? `Available: ${B(n).profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."]), ai(a, () => B(r).agentName, (e) => B(r).agentName = e), _i(c, () => B(r).prompt, (e) => B(r).prompt = e), _i(u, () => B(r).agentProfiles, (e) => B(r).agentProfiles = e), _i(m, () => B(r).completionCriteria, (e) => B(r).completionCriteria = e), U(e, t);
				};
				G(oe, (e) => {
					B(r).selfDriving && e(se);
				}), O(te), O(w), L(() => {
					m.required = !B(s)?.taskTitle, fi(m, B(s)?.taskTitle ? B(l) : B(r).title), J(m, "placeholder", B(s)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), W(ee, `More options${B(r).selfDriving ? " · Self-Driving on" : ""}`);
				}), V("input", m, x), _i(y, () => B(r).slug, (e) => B(r).slug = e), vi(ae, () => B(r).selfDriving, (e) => B(r).selfDriving = e), Ci("open", "toggle", w, (e) => B(r).showOptions = e, () => B(r).showOptions), U(e, t);
			};
			G(y, (e) => {
				B(s) && B(r).activeTab === "preview" ? e(C) : e(w, -1);
			}), O(t), U(e, t);
		}, ae = (e) => {
			var t = Ud(), n = F(t);
			ot(n);
			var i = I(n, 2);
			di(i), _i(n, () => B(r).description, (e) => B(r).description = e), _i(i, () => B(r).slug, (e) => B(r).slug = e), U(e, t);
		};
		G(re, (e) => {
			B(o) ? e(ie) : e(ae, -1);
		});
		var oe = I(re, 2), se = P(oe), ce = P(se, !0);
		O(se);
		var le = I(se, 2);
		O(oe), O(ne), O(a), O(t), L(() => {
			c = q(a, 1, "create-dialog modal-enter", null, c, { "create-task-dialog": B(o) }), J(a, "aria-label", B(o) ? "Create task" : "Create project"), W(w, B(o) ? "Create task" : "Create project"), te.disabled = B(n).submitting, se.disabled = B(n).submitting, W(ce, B(n).submitting ? "Creating..." : "Create"), le.disabled = B(n).submitting;
		}), V("click", i, function(...e) {
			B(n).onClose?.apply(this, e);
		}), V("click", te, function(...e) {
			B(n).onClose?.apply(this, e);
		}), xr("submit", ne, y), V("click", le, function(...e) {
			B(n).onClose?.apply(this, e);
		}), U(e, t);
	};
	G(w, (e) => {
		B(n).open && e(T);
	}), U(e, C), Ge();
}
Sr([
	"click",
	"change",
	"input"
]);
//#endregion
//#region src/api/client.ts
var Kd = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, qd = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, Jd = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new qd(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new qd(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new qd(e.scope));
		this.active.clear();
	}
}, Yd = class {
	requests = new Jd();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: Zd(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: Zd(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof qd) ? new qd(n) : e;
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
			let n = Xd(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new Kd(e.status, r, n);
		}
		return t;
	}
};
function Xd(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function Zd(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new Yd();
//#endregion
//#region src/components/DiffModal.svelte
var Qd = /* @__PURE__ */ H("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), $d = /* @__PURE__ */ H("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), ef = /* @__PURE__ */ H("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), tf = /* @__PURE__ */ H("<div class=\"diff-viewer\"></div>"), nf = /* @__PURE__ */ H("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function rf(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(null), r = /* @__PURE__ */ M(!1), i = /* @__PURE__ */ M(""), a = /* @__PURE__ */ M(void 0), o = /* @__PURE__ */ A(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	Sn(() => {
		let e = t.repo, a = B(o);
		if (N(n, null), N(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		N(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (N(n, r, !0), await dr(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (N(i, n instanceof Error ? n.message : String(n), !0), t.onError(B(i)));
		}).finally(() => {
			t.repo === e && (N(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Sn(() => {
		B(n)?.diff, B(a), s();
	}), Ei(() => t.client.requests.abort(B(o)));
	function s() {
		!B(a) || !B(n)?.diff || !window.Diff2Html || (B(a).innerHTML = window.Diff2Html.html(B(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Ar(), l = F(c), u = (e) => {
		var o = nf(), s = P(o), c = I(s, 2), l = P(c), u = P(l), d = P(u), f = P(d, !0);
		O(d);
		var p = I(d), m = P(p);
		O(p), O(u);
		var h = I(u);
		Q(P(h), { name: "x" }), O(h), O(l);
		var g = I(l, 2), _ = (e) => {
			var n = Qd(), r = P(n);
			Q(r, { name: "loader-circle" });
			var i = I(r, 2), a = P(i, !0);
			O(i), O(n), L(() => W(a, t.repo.worktreePath || "")), U(e, n);
		}, v = (e) => {
			var t = $d(), n = P(t);
			Q(n, { name: "triangle-alert" });
			var r = I(n, 2), a = P(r, !0);
			O(r), O(t), L(() => W(a, B(i))), U(e, t);
		}, y = (e) => {
			var t = ef();
			Q(P(t), { name: "check-circle-2" }), k(2), O(t), U(e, t);
		}, b = /* @__PURE__ */ A(() => !B(n)?.hasChanges || !B(n).diff?.trim()), x = (e) => {
			var t = tf();
			Si(t, (e) => N(a, e), () => B(a)), U(e, t);
		};
		G(g, (e) => {
			B(r) ? e(_) : B(i) ? e(v, 1) : B(b) ? e(y, 2) : e(x, -1);
		}), O(c), O(o), L(() => {
			W(f, B(n)?.branch || t.repo.branch || t.repo.name || "Diff"), W(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), V("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), V("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), U(e, o);
	};
	G(l, (e) => {
		t.repo && e(u);
	}), U(e, c), Ge();
}
Sr(["click"]);
//#endregion
//#region src/components/detail.ts
function af(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function of(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${ff(e)}</pre>`;
}
function sf(e) {
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
function cf(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function lf(e) {
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
function uf(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function df(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...df(a.children || [], t, n, r + 1));
	return i;
}
function ff(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/FileBrowser.svelte
var pf = /* @__PURE__ */ H("<a class=\"artifact-download\"><!></a>"), mf = /* @__PURE__ */ H("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), hf = /* @__PURE__ */ H("<div class=\"empty-list-row\"><!><span> </span></div>"), gf = /* @__PURE__ */ H("<div class=\"content-section\" data-component-owner=\"file-browser\"><h3><!><span> </span></h3> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function _f(e, t) {
	We(t, !0);
	let n = wi(t, "entries", 19, () => []), r = wi(t, "emptyMessage", 3, "No files."), i = wi(t, "activePath", 3, ""), a = /* @__PURE__ */ A(() => df(n(), t.expanded, t.title)), o = /* @__PURE__ */ A(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var c = gf(), l = P(c), u = P(l);
	Q(u, { get name() {
		return B(o);
	} });
	var d = I(u), f = P(d, !0);
	O(d), O(l);
	var p = I(l, 2), m = P(p), h = P(m), g = (e) => {
		var n = Ar();
		K(F(n), 17, () => B(a), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ A(() => B(n).entry.type === "directory"), a = /* @__PURE__ */ A(() => t.expanded.has(`${t.title}:${B(n).entry.path}`));
			var o = mf(), c = P(o);
			let l;
			var u = P(c), d = P(u), f = P(d), p = (e) => {
				{
					let t = /* @__PURE__ */ A(() => B(a) ? "chevron-down" : "chevron-right");
					Q(e, { get name() {
						return B(t);
					} });
				}
			};
			G(f, (e) => {
				B(r) && e(p);
			}), O(d);
			var m = I(d);
			{
				let e = /* @__PURE__ */ A(() => B(r) ? B(a) ? "folder-open" : "folder" : s(B(n).entry.name)), t = /* @__PURE__ */ A(() => B(r) ? "artifact-icon artifact-icon-dir" : "artifact-icon");
				Q(m, {
					get name() {
						return B(e);
					},
					get className() {
						return B(t);
					}
				});
			}
			var h = I(m), g = P(h, !0);
			O(h), O(u);
			var _ = I(u, 2), v = P(_), y = (e) => {
				var r = pf();
				Q(P(r), {
					name: "download",
					className: "artifact-download-icon"
				}), O(r), L((e) => {
					J(r, "href", e), J(r, "download", B(n).entry.name), J(r, "title", `Download ${B(n).entry.name}`), J(r, "aria-label", `Download ${B(n).entry.name}`);
				}, [() => t.rawURL(t.title, B(n).entry.path, !0)]), V("click", r, (e) => e.stopPropagation()), U(e, r);
			};
			G(v, (e) => {
				B(r) || e(y);
			});
			var b = I(v), x = P(b, !0);
			O(b), O(_), O(c), O(o), L((e) => {
				l = q(c, 1, "artifact-row", null, l, {
					directory: B(r),
					file: !B(r),
					active: i() === `${t.title}:${B(n).entry.path}`
				}), ni(c, `--depth: ${B(n).depth}`), J(h, "title", B(n).entry.path), W(g, B(n).entry.name), W(x, e);
			}, [() => B(r) ? `${(B(n).entry.children || []).length} items` : uf(B(n).entry.size || 0)]), V("click", c, () => B(r) ? t.onToggle(`${t.title}:${B(n).entry.path}`) : t.onPreview(t.title, B(n).entry.path)), U(e, o);
		}), U(e, n);
	}, _ = (e) => {
		var n = hf(), i = P(n);
		{
			let e = /* @__PURE__ */ A(() => t.title === "Artifacts" ? "archive" : "inbox");
			Q(i, { get name() {
				return B(e);
			} });
		}
		var a = I(i), o = P(a, !0);
		O(a), O(n), L(() => W(o, r())), U(e, n);
	};
	G(h, (e) => {
		B(a).length ? e(g) : e(_, -1);
	}), O(m), O(p), O(c), L(() => W(f, t.title)), U(e, c), Ge();
}
Sr(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var vf = /* @__PURE__ */ H("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), yf = /* @__PURE__ */ H("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), bf = /* @__PURE__ */ H("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), xf = /* @__PURE__ */ H("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), Sf = /* @__PURE__ */ H("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Cf = /* @__PURE__ */ H("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), wf = /* @__PURE__ */ H("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Tf(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(null), r = /* @__PURE__ */ M(!1), i = /* @__PURE__ */ M(""), a = /* @__PURE__ */ A(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ A(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : "");
	Sn(() => {
		let e = t.selection, o = B(a);
		if (N(n, null), N(i, ""), !e) {
			t.client.requests.abort(o);
			return;
		}
		N(r, !0);
		let s = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${s}?path=${encodeURIComponent(e.path)}`, { scope: o }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && N(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (N(i, n instanceof Error ? n.message : String(n), !0), t.onError(B(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (N(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Ei(() => t.client.requests.abort(B(a)));
	var s = Ar(), c = F(s), l = (e) => {
		var a = wf(), s = P(a), c = I(s, 2), l = P(c), u = P(l), d = P(u), f = P(d, !0);
		O(d);
		var p = I(d), m = P(p);
		O(p), O(u);
		var h = I(u), g = P(h);
		Q(P(g), { name: "external-link" }), k(), O(g);
		var _ = I(g);
		Q(P(_), { name: "x" }), O(_), O(h), O(l);
		var v = I(l, 2), y = (e) => {
			var n = vf(), r = P(n);
			Q(r, { name: "loader-circle" });
			var i = I(r, 2), a = P(i, !0);
			O(i), O(n), L(() => W(a, t.selection.path)), U(e, n);
		}, b = (e) => {
			var t = yf(), n = P(t);
			Q(n, { name: "triangle-alert" });
			var r = I(n, 2), a = P(r, !0);
			O(r), O(t), L(() => W(a, B(i))), U(e, t);
		}, x = (e) => {
			var r = bf(), i = P(r);
			O(r), L(() => {
				J(i, "src", B(o)), J(i, "alt", B(n).name || t.selection.path);
			}), U(e, r);
		}, S = (e) => {
			var r = xf(), i = P(r);
			Q(i, { name: "file-warning" });
			var a = I(i), o = P(a, !0);
			O(a);
			var s = I(a), c = P(s);
			O(s), O(r), L((e) => {
				W(o, B(n).name || t.selection.path), W(c, `Binary file, ${e ?? ""}.`);
			}, [() => uf(B(n).size || 0)]), U(e, r);
		}, C = (e) => {
			var t = Sf();
			Kr(t, () => of(B(n)?.content || ""), !0), O(t), U(e, t);
		}, w = /* @__PURE__ */ A(() => af(B(n)?.path || t.selection.path)), T = (e) => {
			var t = Cf(), r = P(t, !0);
			O(t), L(() => W(r, B(n)?.content || "")), U(e, t);
		};
		G(v, (e) => {
			B(r) ? e(y) : B(i) ? e(b, 1) : B(n)?.image ? e(x, 2) : B(n)?.binary ? e(S, 3) : B(w) ? e(C, 4) : e(T, -1);
		}), O(c), O(a), L((e, r) => {
			J(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${B(n)?.contentHash || "pending"}`), W(f, e), W(m, `${t.selection.path ?? ""}${r ?? ""}${B(n)?.truncated ? " · truncated" : ""}`), J(g, "href", B(o));
		}, [() => B(n)?.name || t.selection.path.split("/").pop() || "File preview", () => B(n)?.size == null ? "" : ` · ${uf(B(n).size)}`]), V("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), V("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), U(e, a);
	};
	G(c, (e) => {
		t.selection && e(l);
	}), U(e, s), Ge();
}
Sr(["click"]);
//#endregion
//#region src/components/LogTimeline.svelte
var Ef = /* @__PURE__ */ H("<div class=\"markdown-rendered\"></div>"), Df = /* @__PURE__ */ H("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), Of = /* @__PURE__ */ H("<p class=\"log-load-error\" role=\"alert\"> </p>"), kf = /* @__PURE__ */ H("<div class=\"log-load-actions\"><button type=\"button\" class=\"secondary-button log-load-more\"><!><span> </span></button></div>"), Af = /* @__PURE__ */ H("<div class=\"content-section\" data-component-owner=\"log-timeline\"><h3><!><span>Log</span></h3> <div class=\"log-timeline\"></div> <!> <!></div>");
function jf(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ A(() => [...t.logs || []].sort(cf)), r = /* @__PURE__ */ M(!1);
	async function i() {
		if (!(t.loading || B(r))) {
			N(r, !0);
			try {
				await t.onLoadMore();
			} finally {
				N(r, !1), queueMicrotask(t.onIconsChanged);
			}
		}
	}
	var a = Ar(), o = F(a), s = (e) => {
		var a = Af(), o = P(a);
		Q(P(o), { name: "history" }), k(), O(o);
		var s = I(o, 2);
		K(s, 21, () => B(n), (e) => e.id, (e, t) => {
			var n = Df(), r = P(n), i = P(r), a = P(i), o = P(a, !0);
			O(a);
			var s = I(a), c = P(s, !0);
			O(s), O(i);
			var l = I(i, 2), u = P(l, !0);
			O(l);
			var d = I(l, 2);
			Q(P(d), { name: "chevron-right" }), O(d), O(r);
			var f = I(r, 2);
			let p;
			var m = P(f), h = (e) => {
				var n = Ef();
				Kr(n, () => of(B(t).details), !0), O(n), U(e, n);
			}, g = (e) => {
				U(e, kr("No details."));
			};
			G(m, (e) => {
				B(t).details ? e(h) : e(g, -1);
			}), O(f), O(n), L((e) => {
				J(n, "data-log-id", B(t).id), J(i, "title", B(t).time), W(o, e), W(c, B(t).time), W(u, B(t).title || "Untitled log entry"), p = q(f, 1, "log-details", null, p, { empty: !B(t).details });
			}, [() => lf(B(t).time)]), U(e, n);
		}), O(s);
		var c = I(s, 2), l = (e) => {
			var n = Of(), r = P(n, !0);
			O(n), L(() => W(r, t.error)), U(e, n);
		};
		G(c, (e) => {
			t.error && e(l);
		});
		var u = I(c, 2), d = (e) => {
			var n = kf(), a = P(n), o = P(a);
			{
				let e = /* @__PURE__ */ A(() => t.loading || B(r) ? "loader-circle" : "chevron-down"), n = /* @__PURE__ */ A(() => t.loading || B(r) ? "spin" : "");
				Q(o, {
					get name() {
						return B(e);
					},
					get className() {
						return B(n);
					}
				});
			}
			var s = I(o), c = P(s, !0);
			O(s), O(a), O(n), L(() => {
				a.disabled = t.loading || B(r), J(a, "aria-busy", t.loading || B(r)), W(c, t.loading || B(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), V("click", a, i), U(e, n);
		};
		G(u, (e) => {
			t.hasMore && e(d);
		}), O(a), L(() => J(a, "data-log-resource", t.resourceId)), U(e, a);
	};
	G(o, (e) => {
		(B(n).length || t.error || t.hasMore) && e(s);
	}), U(e, a), Ge();
}
Sr(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var Mf = /* @__PURE__ */ H("<a class=\"markdown-open-file\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a>"), Nf = /* @__PURE__ */ H("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), Pf = /* @__PURE__ */ H("<pre class=\"markdown-view\"> </pre>"), Ff = /* @__PURE__ */ H("<div class=\"content-section\" data-component-owner=\"markdown-document\"><h3><!><span> </span> <!></h3> <!></div>");
function If(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ A(() => af(t.file.name)), r = /* @__PURE__ */ A(() => `/api/workspaces/${encodeURIComponent(t.workspaceId)}/files/raw?path=${encodeURIComponent(t.file.path || "")}`);
	var i = Ff(), a = P(i), o = P(a);
	Q(o, { name: "file-text" });
	var s = I(o), c = P(s, !0);
	O(s);
	var l = I(s, 2), u = (e) => {
		var n = Mf();
		Q(P(n), { name: "external-link" }), k(), O(n), L(() => {
			J(n, "href", B(r)), J(n, "aria-label", `Open ${t.file.name} in new window`);
		}), U(e, n);
	};
	G(l, (e) => {
		B(n) && t.file.path && e(u);
	}), O(a);
	var d = I(a, 2), f = (e) => {
		var n = Nf(), r = P(n);
		Kr(r, () => of(t.file.content || ""), !0), O(r), O(n), U(e, n);
	}, p = (e) => {
		var n = Pf(), r = P(n, !0);
		O(n), L(() => W(r, t.file.content || "")), U(e, n);
	};
	G(d, (e) => {
		B(n) ? e(f) : e(p, -1);
	}), O(i), L(() => {
		J(i, "data-doc-file", t.file.name), J(i, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`), W(c, t.file.name);
	}), U(e, i), Ge();
}
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var Lf = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), Rf = /* @__PURE__ */ H("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), zf = /* @__PURE__ */ H("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), Bf = /* @__PURE__ */ H("<p class=\"log-load-error\" role=\"alert\"> </p>"), Vf = /* @__PURE__ */ H("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><!><span> </span></button></div></form>"), Hf = /* @__PURE__ */ H("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function Uf(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(""), r = /* @__PURE__ */ M(""), i = /* @__PURE__ */ M(""), a = /* @__PURE__ */ M(""), o = /* @__PURE__ */ M(""), s = /* @__PURE__ */ M(!1), c = /* @__PURE__ */ M(""), l = /* @__PURE__ */ A(() => B(r) !== B(i)), u = /* @__PURE__ */ A(() => !!(B(l) && B(o) && B(a) && B(o) !== B(a)));
	Sn(() => {
		let e = sf(t.file?.content || ""), u = t.file?.contentHash || "";
		N(o, u, !0), t.identity === B(n) ? !B(l) && u !== B(a) && (N(r, e, !0), N(i, e, !0), N(a, u, !0)) : (N(n, t.identity, !0), N(r, e, !0), N(i, e, !0), N(a, u, !0), N(c, ""), N(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), B(s) || !B(l)) return;
		let u = B(n);
		N(s, !0), N(c, "");
		try {
			let e = await t.onSave(B(r), B(a));
			if (B(n) !== u) return;
			N(i, sf(e.content || B(r)), !0), N(r, B(i), !0), N(a, e.contentHash || "", !0), N(o, B(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			B(n) === u && N(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			B(n) === u && (N(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = Hf(), p = P(f);
	Q(P(p), { name: "file-text" }), k(), O(p);
	var m = I(p, 2), h = (e) => {
		var t = Lf();
		Q(P(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), k(), O(t), U(e, t);
	}, g = (e) => {
		var n = Rf(), r = P(n);
		Q(r, { name: "triangle-alert" });
		var i = I(r, 2), a = P(i, !0);
		O(i), O(n), L(() => W(a, t.file.error)), U(e, n);
	}, _ = (e) => {
		var t = Vf(), n = P(t);
		ot(n);
		var i = I(n, 2), a = (e) => {
			U(e, zf());
		};
		G(i, (e) => {
			B(u) && e(a);
		});
		var o = I(i, 2), f = (e) => {
			var t = Bf(), n = P(t, !0);
			O(t), L(() => W(n, B(c))), U(e, t);
		};
		G(o, (e) => {
			B(c) && e(f);
		});
		var p = I(o, 2), m = P(p), h = P(m);
		{
			let e = /* @__PURE__ */ A(() => B(s) ? "loader-circle" : "save");
			Q(h, { get name() {
				return B(e);
			} });
		}
		var g = I(h), _ = P(g, !0);
		O(g), O(m), O(p), O(t), L(() => {
			n.disabled = B(s), m.disabled = B(s) || !B(l), W(_, B(s) ? "Saving" : "Save");
		}), xr("submit", t, d), _i(n, () => B(r), (e) => N(r, e)), U(e, t);
	};
	G(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), O(f), U(e, f), Ge();
}
//#endregion
//#region src/components/DetailPanel.svelte
var Wf = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div>"), Gf = /* @__PURE__ */ H("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), Kf = /* @__PURE__ */ H("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), qf = /* @__PURE__ */ H("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> </h1></div></div> <!> <!>", 1), Jf = /* @__PURE__ */ H("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), Yf = /* @__PURE__ */ H("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), Xf = /* @__PURE__ */ H("<div class=\"details-actions\"><!><button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button></div>"), Zf = /* @__PURE__ */ H("<div class=\"empty-state\"><!><strong>Loading details...</strong></div>"), Qf = /* @__PURE__ */ H("<span class=\"details-tab-count\"> </span>"), $f = /* @__PURE__ */ H("<button type=\"button\" role=\"tab\"><span> </span><!></button>"), ep = /* @__PURE__ */ H("<div><!></div>"), tp = /* @__PURE__ */ H("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), np = /* @__PURE__ */ H("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), rp = /* @__PURE__ */ H("<div class=\"content-section\"><h3><!><span>Task Templates</span></h3><div class=\"template-list\"><!></div></div>"), ip = /* @__PURE__ */ H("<div class=\"content-section\"><h3><!><span>Template</span></h3><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), ap = /* @__PURE__ */ H("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), op = /* @__PURE__ */ H("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), sp = /* @__PURE__ */ H("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><h3><!><span>Worktrees</span></h3><div class=\"worktree-list\"><!></div></div></div>", 1), cp = /* @__PURE__ */ H("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <code class=\"resource-ref-badge\"> </code></h1><!></div></div> <!>", 1), lp = /* @__PURE__ */ H("<!> <!> <!>", 1);
function up(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(""), i = /* @__PURE__ */ M(""), a = /* @__PURE__ */ M(tn(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ M(null), s = /* @__PURE__ */ M(null), c = /* @__PURE__ */ new Map(), l = new Yd(), u = /* @__PURE__ */ A(() => (B(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), d = /* @__PURE__ */ A(() => new Set(B(u).map((e) => e.name))), f = /* @__PURE__ */ A(h), p = /* @__PURE__ */ A(() => B(o) ? `${B(o).section}:${B(o).path}` : "");
	Ti(() => t.channel.subscribe((e) => {
		if (N(n, e, !0), e.identity !== B(r)) {
			B(r) && B(i) && c.set(B(r), B(i)), N(r, e.identity, !0), N(o, null), N(s, null), N(a, /* @__PURE__ */ new Set(), !0), N(i, c.get(B(r)) || m(e), !0);
			let t = document.getElementById("detailsPanel");
			t && (t.scrollTop = 0);
		} else B(f).length && !B(f).some((e) => e.id === B(i)) && N(i, B(f)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), Ti(() => {
		let e = (e) => {
			e.key === "Escape" && (B(s) ? (e.preventDefault(), N(s, null)) : B(o) && (e.preventDefault(), N(o, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Ei(() => l.dispose());
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
		N(i, e, !0), c.set(B(r), e);
	}
	function v(e) {
		let t = new Set(B(a));
		t.has(e) ? t.delete(e) : t.add(e), N(a, t, !0), queueMicrotask(B(n).onIconsChanged);
	}
	function y(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(B(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function b(e, t) {
		N(o, {
			section: e,
			path: t
		}, !0);
	}
	function x(e) {
		e && B(n).onToast(e);
	}
	var S = lp(), C = F(S), w = (e) => {
		var t = Wf();
		Q(P(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), k(2), O(t), U(e, t);
	}, T = (e) => {
		var t = qf(), r = F(t), i = P(r), o = P(i), s = P(o, !0);
		O(o), O(i);
		var c = I(i), l = P(c), u = P(l, !0);
		O(l), O(c), O(r);
		var d = I(r, 2);
		Uf(d, {
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
			var t = Gf(), r = P(t);
			Q(P(r), { name: "book-open" }), k(), O(r);
			var i = I(r), a = P(i);
			Q(a, { name: "triangle-alert" });
			var o = I(a, 2), s = P(o, !0);
			O(o), O(i), O(t), L(() => W(s, B(n).wiki.error)), U(e, t);
		}, h = (e) => {
			var t = Kf(), n = P(t);
			Q(P(n), { name: "book-open" }), k(), O(n);
			var r = I(n);
			Q(P(r), { name: "book-open" }), k(2), O(r), O(t), U(e, t);
		}, g = (e) => {
			{
				let t = /* @__PURE__ */ A(() => B(n).wiki.entries || []);
				_f(e, {
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
	}, ee = (e) => {
		var t = cp(), r = F(t), o = P(r), c = P(o), l = P(c, !0);
		O(c);
		var d = I(c, 2), m = (e) => {
			var t = Jf(), r = I(F(t)), i = P(r, !0);
			O(r), L(() => W(i, B(n).parent.title)), V("click", r, () => B(n).onNavigate(B(n).parent?.id || "workspace")), U(e, t);
		};
		G(d, (e) => {
			B(n).parent && e(m);
		});
		var h = I(d, 3), x = P(h, !0);
		O(h), O(o);
		var S = I(o, 2), C = P(S), w = P(C, !0), T = I(w), ee = P(T, !0);
		O(T), O(C);
		var te = I(C), ne = (e) => {
			var t = Xf(), r = P(t), i = (e) => {
				var t = Yf();
				Q(P(t), { name: "plus" }), k(), O(t), V("click", t, () => B(n).onCreateTask(B(n).resourceId)), U(e, t);
			};
			G(r, (e) => {
				B(n).resourceType === "project" && e(i);
			});
			var a = I(r);
			Q(P(a), { name: "archive" }), k(), O(a), O(t), V("click", a, () => B(n).onArchive(B(n).resourceId)), U(e, t);
		};
		G(te, (e) => {
			B(n).detail && e(ne);
		}), O(S), O(r);
		var re = I(r, 2), ie = (e) => {
			var t = Zf();
			Q(P(t), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), k(), O(t), U(e, t);
		}, ae = (e) => {
			var t = sp(), r = F(t);
			K(r, 21, () => B(f), (e) => e.id, (e, t) => {
				var r = $f();
				let a;
				var o = P(r), s = P(o, !0);
				O(o);
				var c = I(o), l = (e) => {
					var t = Qf(), r = P(t, !0);
					O(t), L(() => W(r, B(n).detail.logs.length)), U(e, t);
				};
				G(c, (e) => {
					B(t).id === "logs" && B(n).detail.logs?.length && e(l);
				}), O(r), L(() => {
					a = q(r, 1, "details-tab", null, a, { active: B(i) === B(t).id }), J(r, "aria-selected", B(i) === B(t).id), W(s, B(t).label);
				}), V("click", r, () => _(B(t).id)), U(e, r);
			}), O(r);
			var o = I(r, 2);
			K(o, 17, () => B(u), (e) => e.path || e.name, (e, t) => {
				var r = ep();
				If(P(r), {
					get file() {
						return B(t);
					},
					get workspaceId() {
						return B(n).workspaceId;
					}
				}), O(r), L((e) => J(r, "hidden", e), [() => B(i) !== g(B(t))]), U(e, r);
			});
			var c = I(o, 2), l = P(c), d = (e) => {
				var t = rp(), r = P(t);
				Q(P(r), { name: "layout-template" }), k(), O(r);
				var i = I(r), a = P(i), o = (e) => {
					var t = Ar();
					K(F(t), 17, () => B(n).detail.templates, (e) => e.name, (e, t) => {
						var n = tp();
						let r;
						var i = P(n);
						Q(i, { name: "file-text" });
						var a = I(i), o = P(a), s = P(o, !0);
						O(o);
						var c = I(o), l = P(c);
						O(c), O(a), Q(I(a), { name: "chevron-right" }), O(n), L(() => {
							r = q(n, 1, "template-row", null, r, { invalid: !B(t).valid }), W(s, B(t).title || B(t).name), W(l, `${B(t).name ?? ""} · v${(B(t).schemaVersion || "?") ?? ""} · ${B(t).valid ? `${(B(t).fields || []).length} fields` : `invalid${B(t).errors?.[0]?.message ? `: ${B(t).errors[0].message}` : ""}`}${B(t).legacy ? " · legacy" : ""}`);
						}), V("click", n, () => B(t).path && b("Templates", B(t).path)), U(e, n);
					}), U(e, t);
				}, s = (e) => {
					var t = np();
					Q(P(t), { name: "layout-template" }), k(), O(t), U(e, t);
				};
				G(a, (e) => {
					B(n).detail.templates?.length ? e(o) : e(s, -1);
				}), O(i), O(t), U(e, t);
			}, m = (e) => {
				var t = ip(), r = P(t);
				Q(P(r), { name: "layout-template" }), k(), O(r);
				var i = I(r), a = P(i), o = P(a);
				Q(o, { name: "file-text" });
				var s = I(o), c = P(s), l = P(c, !0);
				O(c);
				var u = I(c), d = P(u);
				O(u), O(s), O(a), O(i), O(t), L(() => {
					W(l, B(n).detail.template.name), W(d, `Created from template · v${(B(n).detail.template.schemaVersion || "?") ?? ""} · ${(B(n).detail.template.digest || "") ?? ""}`);
				}), U(e, t);
			};
			G(l, (e) => {
				B(n).resourceType === "project" ? e(d) : B(n).detail.template && e(m, 1);
			}), O(c);
			var h = I(c, 2), x = P(h);
			{
				let e = /* @__PURE__ */ A(() => B(n).detail.logs || []);
				jf(x, {
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
			O(h);
			var S = I(h, 2), C = P(S);
			{
				let e = /* @__PURE__ */ A(() => B(n).detail.artifacts || []);
				_f(C, {
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
			O(S);
			var w = I(S, 2), T = P(w), ee = P(T);
			Q(P(ee), { name: "folder-git-2" }), k(), O(ee);
			var te = I(ee), ne = P(te), re = (e) => {
				var t = Ar();
				K(F(t), 17, () => B(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = ap(), r = P(n), i = P(r);
					Q(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = I(i), o = P(a), c = P(o, !0);
					O(o);
					var l = I(o), u = P(l);
					O(l);
					var d = I(l), f = P(d, !0);
					O(d), O(a), O(r);
					var p = I(r);
					Q(P(p), { name: "git-compare-arrows" }), k(), O(p), O(n), L(() => {
						W(c, B(t).branch || "HEAD"), W(u, `${(B(t).name || "repository") ?? ""}${B(t).targetBranch || B(t).baseBranch ? ` · base ${B(t).targetBranch || B(t).baseBranch}` : ""}`), W(f, B(t).worktreePath || "");
					}), V("click", p, () => N(s, B(t), !0)), U(e, n);
				}), U(e, t);
			}, ie = (e) => {
				var t = op();
				Q(P(t), { name: "git-branch" }), k(), O(t), U(e, t);
			};
			G(ne, (e) => {
				B(n).detail.repos?.length ? e(re) : e(ie, -1);
			}), O(te), O(T), O(w), L(() => {
				J(c, "hidden", B(i) !== "template"), J(h, "hidden", B(i) !== "logs"), J(S, "hidden", B(i) !== "artifacts"), J(w, "hidden", B(i) !== "worktrees");
			}), U(e, t);
		};
		G(re, (e) => {
			B(n).loading || !B(n).detail ? e(ie) : e(ae, -1);
		}), L(() => {
			W(l, B(n).workspaceName), W(x, B(n).resourceTitle), W(w, B(n).resourceTitle), W(ee, B(n).resourceId);
		}), V("click", c, () => B(n).onNavigate("workspace")), V("click", h, () => B(n).onNavigate(B(n).resourceId)), U(e, t);
	};
	G(C, (e) => {
		B(n).workspaceId ? B(n).resourceType === "workspace" ? e(T, 1) : e(ee, -1) : e(w);
	});
	var te = I(C, 2);
	Tf(te, {
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
		onClose: () => N(o, null),
		onError: x,
		get onIconsChanged() {
			return B(n).onIconsChanged;
		}
	}), rf(I(te, 2), {
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
		onClose: () => N(s, null),
		onError: x,
		get onIconsChanged() {
			return B(n).onIconsChanged;
		}
	}), U(e, S), Ge();
}
Sr(["click"]);
//#endregion
//#region src/components/chat-state.ts
var dp = 250, fp = /* @__PURE__ */ new Set(["session.launch-environment"]), pp = class {
	api;
	eventSourceFactory;
	contexts = /* @__PURE__ */ new Map();
	listeners = /* @__PURE__ */ new Set();
	onEvent;
	onNotice;
	activeKey = "";
	disposed = !1;
	constructor(e = {}) {
		this.api = e.api ?? new Yd(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice;
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t) {
		if (this.disposed) return;
		let n = String(t?.id || "").trim(), r = yp(e, n);
		if (this.activeKey && this.activeKey !== r && this.deactivate(this.contexts.get(this.activeKey)), this.activeKey = r, !e || !n) {
			this.emit();
			return;
		}
		let i = this.contexts.get(r) ?? this.createContext(e, n);
		i.run = t, i.acceptedSessionIds = wp(t), this.reconcileNotices(i), !Tp(t) && i.stream && (i.streamGeneration++, i.stream.close(), i.stream = null), this.emit(), !i.loaded && !i.loading ? this.loadInitial(i) : this.connect(i);
	}
	async loadOlder() {
		let e = this.activeContext();
		if (!e || e.loadingOlder || !e.hasMoreBefore || !e.beforeId) return !1;
		let t = e.generation, n = e.beforeId;
		e.loadingOlder = !0, e.error = "", this.emit();
		try {
			let r = await this.api.latest(xp(e, `before=${encodeURIComponent(n)}&limit=${dp}`), { scope: bp(e, "older") });
			if (!this.isCurrent(e, t)) return !1;
			let i = vp(r.events), a = Sp(i);
			return i.length && (!a || a >= n) ? (e.hasMoreBefore = !1, !1) : (e.events = mp([...i, ...e.events]), a && (e.beforeId = a), e.hasMoreBefore = !!(r.page?.hasMoreBefore && a), i.length > 0);
		} catch (n) {
			return n instanceof qd || !this.isCurrent(e, t) || (e.error = kp(n)), !1;
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
			events: e.events.filter((e) => !fp.has(e.type)),
			notices: [...e.notices],
			hasMoreBefore: e.hasMoreBefore,
			loading: e.loading,
			loadingOlder: e.loadingOlder,
			loaded: e.loaded,
			error: e.error
		} : Op();
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
			key: yp(e, t),
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
			let n = await this.api.latest(xp(e, `latest=true&limit=${dp}`), { scope: bp(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			let r = vp(n.events).filter((t) => this.eventBelongsToContext(e, t));
			e.events = mp(r), e.beforeId = Sp(r), e.hasMoreBefore = !!(n.page?.hasMoreBefore && e.beforeId), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof qd || !this.isCurrent(e, t)) return;
			e.error = kp(n);
		} finally {
			this.isCurrent(e, t) && (e.loading = !1, this.emit());
		}
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !Tp(e.run)) return;
		let t = Cp(e.events), n = t ? `?after=${encodeURIComponent(t)}` : "", r = ++e.streamGeneration, i = this.eventSourceFactory(`/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/stream${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.events = hp(e.events, n), this.onEvent?.(e.workspaceId, e.runId, n), this.emit();
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
			Tp(e.run) || (i.close(), e.stream = null);
		};
	}
	appendNotice(e, t) {
		let n = Ep(t);
		if (n) {
			let r = Number(t.data?.schedulerTurnSequence) || 0, i = e.noticeWatermarks.get(n) || 0;
			if (i && r <= i) return;
			e.noticeWatermarks.set(n, Math.max(i, r)), e.notices = e.notices.filter((e) => Ep(e) !== n);
		} else if (e.notices.some((e) => Dp(e) === Dp(t))) return;
		e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20);
	}
	reconcileNotices(e) {
		let t = e.run;
		e.notices = e.notices.filter((e) => {
			if (!Ep(e)) return !0;
			let n = e.data || {};
			if (!t || String(n.runId || "") !== t.id || String(n.resourceId || "") !== String(t.resourceId || "") || Number(n.selfDrivingRevision) !== Number(t.selfDrivingRevision)) return !1;
			let r = Number(n.schedulerTurnSequence) || 0, i = Number(t.schedulerTurnSequence) || 0;
			return !(i > r || t.schedulerTurn && (!r || i >= r));
		});
	}
	deactivate(e) {
		e && (e.generation++, e.streamGeneration++, e.stream?.close(), e.stream = null, e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(bp(e, "initial")), this.api.requests.abort(bp(e, "older")));
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
function mp(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? gp(r, n) : _p(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function hp(e, t) {
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
		return n.splice(r, 0, _p(t)), n;
	}
	let o = [...e];
	return o[a] = gp(e[a], t), o;
}
function gp(e, t) {
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
function _p(e) {
	return e.data?.append === !0 ? {
		...e,
		data: {
			...e.data,
			append: !1
		}
	} : e;
}
function vp(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function yp(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function bp(e, t) {
	return `chat:${e.key}:${t}`;
}
function xp(e, t) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/agent/runs/${encodeURIComponent(e.runId)}/events?${t}`;
}
function Sp(e) {
	return e.reduce((e, t) => {
		let n = Number(t.id) || 0;
		return n && (!e || n < e) ? n : e;
	}, 0);
}
function Cp(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function wp(e) {
	return new Set([
		e?.id,
		e?.agentHubSessionId,
		e?.sourceExternalId
	].map((e) => String(e || "").trim()).filter(Boolean));
}
function Tp(e) {
	return [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e?.status || ""));
}
function Ep(e) {
	let t = e.data || {};
	return t.kind !== "self-driving-finish" || t.lifecycle !== "until-reconcile" ? "" : [
		t.kind,
		t.runId,
		t.resourceId,
		t.selfDrivingRevision
	].map((e) => String(e ?? "")).join(":");
}
function Dp(e) {
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
function Op() {
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
function kp(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/EventTimeline.svelte
var Ap = /* @__PURE__ */ H("<button type=\"button\" class=\"load-older-events\"><!><span> </span></button>"), jp = /* @__PURE__ */ H("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), Mp = /* @__PURE__ */ H("<span class=\"agent-message-tag\">steer</span>"), Np = /* @__PURE__ */ H("<span class=\"agent-message-source\"> </span>"), Pp = /* @__PURE__ */ H("<div class=\"agent-message-content markdown-rendered\"></div>"), Fp = /* @__PURE__ */ H("<p> </p>"), Ip = /* @__PURE__ */ H("<div><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>"), Lp = /* @__PURE__ */ H("<details class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>"), Rp = /* @__PURE__ */ H("<pre> </pre>"), zp = /* @__PURE__ */ H("<details><summary><!><span> </span><small> </small></summary> <!></details>"), Bp = /* @__PURE__ */ H("<details class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>"), Vp = /* @__PURE__ */ H("<p class=\"approval-question\"> </p>"), Hp = /* @__PURE__ */ H("<button> </button>"), Up = /* @__PURE__ */ H("<div class=\"approval-options\"></div>"), Wp = /* @__PURE__ */ H("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), Gp = /* @__PURE__ */ H("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), Kp = /* @__PURE__ */ H("<!> <!>", 1), qp = /* @__PURE__ */ H("<div class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>"), Jp = /* @__PURE__ */ H("<div><!><span> </span><span class=\"agent-note-time\"> </span></div>"), Yp = /* @__PURE__ */ H("<div class=\"agent-event error\"><div><!><strong>Provider error</strong></div><p> </p></div>"), Xp = /* @__PURE__ */ H("<details class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>"), Zp = /* @__PURE__ */ H("<div><!></div>"), Qp = /* @__PURE__ */ H("<div><div><!><strong>Forge</strong></div><p> </p></div>"), $p = /* @__PURE__ */ H("<div class=\"agent-event error\" role=\"alert\"><div><!><strong>Timeline error</strong></div><p> </p></div>"), em = /* @__PURE__ */ H("<div class=\"tty-empty\"><!><strong>Loading agent events</strong></div>"), tm = /* @__PURE__ */ H("<div class=\"tty-empty\"><!><strong>Waiting for agent events</strong></div>"), nm = /* @__PURE__ */ H("<!> <!> <!> <!> <!> <!>", 1), rm = /* @__PURE__ */ H("<div class=\"tty-empty\"><!><strong>No agent run selected</strong><span> </span></div>"), im = /* @__PURE__ */ H("<div class=\"event-timeline-root\"><!></div>");
function am(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(tn(de())), i = /* @__PURE__ */ A(() => B(n).project(B(r).events)), a = /* @__PURE__ */ M(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ M(tn(/* @__PURE__ */ new Map())), d = /* @__PURE__ */ M(tn(/* @__PURE__ */ new Set())), f = /* @__PURE__ */ new Map(), p = /* @__PURE__ */ M(tn(/* @__PURE__ */ new Map()));
	Ti(() => {
		let e = S();
		o = new pp({
			onEvent: (e, t, r) => B(n).onEvent(e, t, r),
			onNotice: (e, t, r) => B(n).onNotice(e, t, r)
		});
		let r = o.subscribe((e) => m(e)), i = t.channel.subscribe((e) => {
			let t = B(n).identity;
			N(n, e, !0), e.identity !== t && (l = !0, s = null, N(p, new Map(f.get(e.identity) ?? []), !0)), o?.activate(e.workspaceId, e.activeRun), queueMicrotask(e.onIconsChanged);
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
		c = e.identity !== B(r).identity || l || w(t), l = !1, N(r, e, !0), t && (t.dataset.agentRunId = e.runId), dr().then(() => {
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
		let t = ee(e), i = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = B(r).identity;
		await o?.loadOlder(), await dr(), B(r).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - i) : s + (e.scrollHeight - a), B(n).onIconsChanged());
	}
	async function v(e, t) {
		let i = String(e.approvalId || "");
		if (!(!i || B(d).has(i))) {
			N(d, new Set(B(d)).add(i), !0);
			try {
				await B(n).onApproval(B(r).runId, i, t);
				let e = new Map(B(u));
				e.delete(ne(i)), N(u, e, !0);
			} catch (e) {
				B(n).onToast(e instanceof Error ? e.message : String(e));
			} finally {
				let e = new Set(B(d));
				e.delete(i), N(d, e, !0);
			}
		}
	}
	function y(e, t) {
		let n = te(e);
		N(p, new Map(B(p)).set(n, t), !0), f.set(B(r).identity, new Map(B(p)));
	}
	function b(e, t) {
		let n = B(p).get(te(e));
		return typeof n == "boolean" ? n : t === B(i).length - 1 || !!e.calls?.some((e) => e.status === "running");
	}
	function x(e, t) {
		N(u, new Map(B(u)).set(ne(e), t), !0);
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
	function ee(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function te(e) {
		return `${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
	}
	function ne(e) {
		return `${B(r).identity}:${e}`;
	}
	function re(e) {
		return e.role === "assistant" ? B(n).agentName || "Agent" : String(e.sender?.name || e.sender?.id || "").trim() || (e.role === "system" ? "System" : e.role === "agent" ? "Agent" : "User");
	}
	function ie(e) {
		let t = new Date(e || "");
		return Number.isNaN(t.valueOf()) ? "" : t.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function ae(e) {
		if (e.active) return "Thinking…";
		if (!e.startTime || !e.time) return "Thought";
		let t = Math.round((new Date(e.time).getTime() - new Date(e.startTime).getTime()) / 1e3);
		return !Number.isFinite(t) || t < 0 ? "Thought" : t < 60 ? `Thought for ${t} ${t === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(t / 60)}m${t % 60}s`;
	}
	function oe(e) {
		let t = String(e || "");
		return !window.marked || !window.DOMPurify ? se(t).replaceAll("\n", "<br>") : window.DOMPurify.sanitize(window.marked.parse(t));
	}
	function se(e) {
		return e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
	}
	function ce(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	function le(e) {
		return [
			e.error,
			e.output,
			e.rawPreview
		].filter(Boolean).join("\n\n");
	}
	function ue(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	function de() {
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
	var fe = im(), pe = P(fe), me = (e) => {
		var t = nm(), n = F(t), a = (e) => {
			var t = Ap(), n = P(t);
			{
				let e = /* @__PURE__ */ A(() => B(r).loadingOlder ? "loader-circle" : "chevrons-up");
				Q(n, { get name() {
					return B(e);
				} });
			}
			var i = I(n), a = P(i, !0);
			O(i), O(t), L(() => {
				t.disabled = B(r).loadingOlder, W(a, B(r).loadingOlder ? "Loading..." : "Load older messages");
			}), V("click", t, _), U(e, t);
		};
		G(n, (e) => {
			B(r).hasMoreBefore && e(a);
		});
		var o = I(n, 2);
		K(o, 19, () => B(i), (e) => te(e), (e, t, n) => {
			var i = Zp(), a = P(i), o = (e) => {
				let n = /* @__PURE__ */ A(() => [
					"assistant",
					"system",
					"agent"
				].includes(String(B(t).role)) ? String(B(t).role) : "user");
				var r = Ip(), i = P(r), a = P(i), o = P(a), s = P(o, !0);
				O(o);
				var c = I(o, 2), l = (e) => {
					var t = jp(), r = P(t, !0);
					O(t), L(() => W(r, B(n))), U(e, t);
				};
				G(c, (e) => {
					B(n) !== "assistant" && e(l);
				});
				var u = I(c, 2), d = (e) => {
					U(e, Mp());
				};
				G(u, (e) => {
					B(t).steer && e(d);
				});
				var f = I(u, 2), p = (e) => {
					var n = Np(), r = P(n);
					O(n), L(() => {
						J(n, "title", B(t).sender.sessionId), W(r, `from session ${B(t).sender.sessionId ?? ""}`);
					}), U(e, n);
				};
				G(f, (e) => {
					B(n) === "agent" && B(t).sender?.sessionId && e(p);
				});
				var m = I(f, 2), h = P(m, !0);
				O(m), O(a);
				var g = I(a, 2), _ = P(g), v = (e) => {
					var n = Pp();
					Kr(n, () => oe(B(t).text), !0), O(n), U(e, n);
				}, y = (e) => {
					var n = Fp(), r = P(n, !0);
					O(n), L(() => W(r, B(t).text || "")), U(e, n);
				};
				G(_, (e) => {
					B(n) === "assistant" ? e(v) : e(y, -1);
				}), O(g), O(i), O(r), L((e, t) => {
					q(r, 1, `agent-message-row ${B(n) === "assistant" ? "assistant final" : B(n)}`), W(s, e), W(h, t);
				}, [() => re(B(t)), () => ie(B(t).time)]), U(e, r);
			}, s = (e) => {
				var n = Lp(), r = P(n), i = P(r);
				Q(i, { name: "brain-circuit" });
				var a = I(i), o = P(a, !0);
				O(a);
				var s = I(a);
				Q(P(s), { name: "chevron-right" }), O(s), O(r);
				var c = I(r, 2), l = P(c, !0);
				O(c), O(n), L((e) => {
					n.open = B(t).active, W(o, e), W(l, B(t).text || "");
				}, [() => ae(B(t))]), U(e, n);
			}, c = (e) => {
				let i = /* @__PURE__ */ A(() => B(t).calls || []), a = /* @__PURE__ */ A(() => B(i).map(ce));
				var o = Bp(), s = P(o), c = P(s);
				Q(P(c), { name: "wrench" }), O(c);
				var l = I(c), u = P(l);
				O(l);
				var d = I(l), f = P(d);
				O(d);
				var p = I(d);
				Q(P(p), { name: "chevron-right" }), O(p), O(s);
				var m = I(s, 2);
				K(m, 21, () => B(i), (e) => String(e.callId || e.key), (e, t) => {
					var n = zp(), r = P(n), i = P(r);
					{
						let e = /* @__PURE__ */ A(() => B(t).status === "running" ? "loader-circle" : B(t).status === "failed" ? "x-circle" : "check-circle");
						Q(i, { get name() {
							return B(e);
						} });
					}
					var a = I(i), o = P(a, !0);
					O(a);
					var s = I(a), c = P(s, !0);
					O(s), O(r);
					var l = I(r, 2), u = (e) => {
						var n = Rp(), r = P(n, !0);
						O(n), L((e) => W(r, e), [() => le(B(t))]), U(e, n);
					}, d = /* @__PURE__ */ A(() => le(B(t)));
					G(l, (e) => {
						B(d) && e(u);
					}), O(n), L((e, t, r) => {
						q(n, 1, e), W(o, t), W(c, r);
					}, [
						() => `agent-tool-item agent-tool-${String(B(t).status || "completed")}`,
						() => ce(B(t)),
						() => String(B(t).method || "tool")
					]), U(e, n);
				}), O(m), O(o), L((e, t, n) => {
					J(o, "data-tool-group-key", e), o.open = t, W(u, `${B(i).length ?? ""} tool ${B(i).length === 1 ? "call" : "calls"}`), W(f, `${n ?? ""}${B(a).length > 2 ? ` · +${B(a).length - 2} more` : ""}`);
				}, [
					() => `${B(r).runId}:${String(B(t).key || B(t).time || "tools")}`,
					() => b(B(t), B(n)),
					() => B(a).slice(0, 2).join(" · ")
				]), xr("toggle", o, (e) => y(B(t), e.currentTarget.open)), U(e, o);
			}, l = (e) => {
				let n = /* @__PURE__ */ A(() => String(B(t).approvalId || "")), r = /* @__PURE__ */ A(() => B(u).get(ne(B(n))) || "");
				var i = qp(), a = P(i), o = P(a);
				Q(o, { name: "shield-question" });
				var s = I(o), c = P(s, !0);
				O(s), O(a);
				var l = I(a, 2), f = (e) => {
					var n = Vp(), r = P(n, !0);
					O(n), L(() => W(r, B(t).question)), U(e, n);
				};
				G(l, (e) => {
					B(t).question && e(f);
				});
				var p = I(l, 2), m = (e) => {
					var n = Fp(), r = P(n, !0);
					O(n), L(() => W(r, B(t).detail)), U(e, n);
				};
				G(p, (e) => {
					B(t).detail && e(m);
				});
				var h = I(p, 2), g = (e) => {
					var i = Kp(), a = F(i), o = (e) => {
						var r = Up();
						K(r, 21, () => B(t).options, (e) => e.optionId, (e, r) => {
							var i = Hp();
							let a;
							var o = P(i, !0);
							O(i), L((e, t, n) => {
								i.disabled = e, a = q(i, 1, "", null, a, t), W(o, n);
							}, [
								() => B(d).has(B(n)),
								() => ({ "secondary-button": String(B(r).kind || "").startsWith("reject") }),
								() => ue(B(r))
							]), V("click", i, () => v(B(t), { optionId: B(r).optionId })), U(e, i);
						}), O(r), U(e, r);
					}, s = (e) => {
						var r = Wp(), i = P(r);
						Q(P(i), { name: "check" }), k(), O(i);
						var a = I(i);
						Q(P(a), { name: "x" }), k(), O(a), O(r), L((e, t) => {
							i.disabled = e, a.disabled = t;
						}, [() => B(d).has(B(n)), () => B(d).has(B(n))]), V("click", i, () => v(B(t), { decision: "accept" })), V("click", a, () => v(B(t), { decision: "decline" })), U(e, r);
					};
					G(a, (e) => {
						B(t).options?.length ? e(o) : e(s, -1);
					});
					var c = I(a, 2), l = (e) => {
						var i = Gp(), a = P(i);
						di(a);
						var o = I(a);
						O(i), L((e) => {
							fi(a, B(r)), o.disabled = e;
						}, [() => !B(r).trim() || B(d).has(B(n))]), xr("submit", i, (e) => {
							e.preventDefault(), B(r).trim() && v(B(t), { text: B(r).trim() });
						}), V("input", a, (e) => x(B(n), e.currentTarget.value)), U(e, i);
					};
					G(c, (e) => {
						B(t).question && e(l);
					}), U(e, i);
				}, _ = (e) => {
					var n = Fp(), r = P(n);
					O(n), L(() => W(r, `${(B(t).decision || (B(t).status === "accepted" ? "Allowed" : "Declined")) ?? ""}${B(t).reply ? `: ${B(t).reply}` : ""}`)), U(e, n);
				};
				G(h, (e) => {
					B(t).status === "pending" ? e(g) : e(_, -1);
				}), O(i), L(() => W(c, B(t).title || "Approval requested")), U(e, i);
			}, f = (e) => {
				let n = /* @__PURE__ */ A(() => B(t).tone === "ok" ? "check-circle" : B(t).tone === "danger" ? "triangle-alert" : B(t).tone === "info" ? "info" : "clock");
				var r = Jp(), i = P(r);
				Q(i, { get name() {
					return B(n);
				} });
				var a = I(i), o = P(a, !0);
				O(a);
				var s = I(a), c = P(s, !0);
				O(s), O(r), L((e) => {
					q(r, 1, `agent-system-note agent-lifecycle-${B(t).tone || "muted"}`), W(o, B(t).text || ""), W(c, e);
				}, [() => ie(B(t).time)]), U(e, r);
			}, p = (e) => {
				var n = Yp(), r = P(n);
				Q(P(r), { name: "triangle-alert" }), k(), O(r);
				var i = I(r), a = P(i, !0);
				O(i), O(n), L(() => W(a, B(t).text || "")), U(e, n);
			}, m = (e) => {
				var n = Xp(), r = P(n), i = P(r);
				Q(i, { name: "info" });
				var a = I(i), o = P(a);
				O(a), O(r);
				var s = I(r), c = P(s, !0);
				O(s), O(n), L(() => {
					W(o, `Unhandled event: ${(B(t).type || B(t).kind) ?? ""}`), W(c, B(t).preview || "This event carries no payload.");
				}), U(e, n);
			};
			G(a, (e) => {
				B(t).kind === "message" ? e(o) : B(t).kind === "thinking" ? e(s, 1) : B(t).kind === "tools" ? e(c, 2) : B(t).kind === "approval" ? e(l, 3) : B(t).kind === "lifecycle" ? e(f, 4) : B(t).kind === "error" ? e(p, 5) : e(m, -1);
			}), O(i), L((e) => J(i, "data-timeline-key", e), [() => te(B(t))]), U(e, i);
		});
		var s = I(o, 2);
		K(s, 19, () => B(r).notices, (e, t) => `notice:${B(r).identity}:${t}:${String(e.data?.schedulerTurnSequence || e.data?.text || "")}`, (e, t, n) => {
			var r = Qp(), i = P(r), a = P(i);
			{
				let e = /* @__PURE__ */ A(() => B(t).data?.level === "error" ? "triangle-alert" : "info");
				Q(a, { get name() {
					return B(e);
				} });
			}
			k(), O(i);
			var o = I(i), s = P(o, !0);
			O(o), O(r), L((e) => {
				J(r, "data-timeline-key", `notice:${B(n)}`), q(r, 1, `agent-event ${B(t).data?.level === "error" ? "error" : "system"}`), W(s, e);
			}, [() => String(B(t).data?.text || "")]), U(e, r);
		});
		var c = I(s, 2), l = (e) => {
			var t = $p(), n = P(t);
			Q(P(n), { name: "triangle-alert" }), k(), O(n);
			var i = I(n), a = P(i, !0);
			O(i), O(t), L(() => W(a, B(r).error)), U(e, t);
		};
		G(c, (e) => {
			B(r).error && e(l);
		});
		var f = I(c, 2), p = (e) => {
			var t = em();
			Q(P(t), { name: "loader-circle" }), k(), O(t), U(e, t);
		};
		G(f, (e) => {
			B(r).loading && !B(i).length && e(p);
		});
		var m = I(f, 2), h = (e) => {
			var t = tm();
			Q(P(t), { name: "loader-circle" }), k(), O(t), U(e, t);
		};
		G(m, (e) => {
			B(r).loaded && !B(r).loading && !B(i).length && !B(r).notices.length && e(h);
		}), U(e, t);
	}, he = (e) => {
		var t = rm(), r = P(t);
		Q(r, { name: "bot" });
		var i = I(r, 2), a = P(i, !0);
		O(i), O(t), L(() => W(a, B(n).runCount ? "Select an Agent Run to view its events." : "Start an agent session.")), U(e, t);
	};
	G(pe, (e) => {
		B(r).runId ? e(me) : e(he, -1);
	}), O(fe), Si(fe, (e) => N(a, e), () => B(a)), L(() => J(fe, "data-chat-context", B(r).identity)), U(e, fe), Ge();
}
Sr(["click", "input"]);
//#endregion
//#region src/components/SelfDrivingBar.svelte
var om = /* @__PURE__ */ H("<span class=\"self-driving-bar-summary\"> </span>"), sm = /* @__PURE__ */ H("<button type=\"button\" class=\"self-driving-bar-toggle\" aria-controls=\"selfDrivingBarDetails\"><!></button>"), cm = /* @__PURE__ */ H("<p> </p>"), lm = /* @__PURE__ */ H("<div class=\"self-driving-bar-details\" id=\"selfDrivingBarDetails\"><small> </small> <!> <!> <!> <!> <!></div>"), um = /* @__PURE__ */ H("<section role=\"status\"><div class=\"self-driving-bar-row\"><span class=\"self-driving-bar-title\"><!><strong>Self-Driving</strong></span> <span><!><span> </span></span> <!> <span class=\"self-driving-bar-actions\"><button type=\"button\" id=\"selfDrivingSwitch\" class=\"self-driving-switch\" role=\"switch\"><span class=\"self-driving-switch-track\"><span class=\"self-driving-switch-thumb\"></span></span><span> </span></button> <!></span></div> <!></section>");
function dm(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current()));
	Ti(() => t.channel.subscribe((e) => {
		N(n, e, !0), queueMicrotask(e.onIconsChanged);
	}));
	let r = /* @__PURE__ */ A(() => B(n).expanded ? "Hide Self-Driving details" : "Show Self-Driving details"), i = /* @__PURE__ */ A(() => B(n).enabled ? "Turn Self-Driving off" : "Turn Self-Driving on");
	var a = Ar(), o = F(a), s = (e) => {
		var t = um(), a = P(t), o = P(a);
		Q(P(o), {
			name: "workflow",
			className: "self-driving-title-icon"
		}), k(), O(o);
		var s = I(o, 2), c = P(s);
		Q(c, {
			get name() {
				return B(n).status.icon;
			},
			className: "self-driving-state-icon"
		});
		var l = I(c), u = P(l, !0);
		O(l), O(s);
		var d = I(s, 2), f = (e) => {
			var t = om(), r = P(t, !0);
			O(t), L(() => {
				J(t, "title", B(n).summary), W(r, B(n).summary);
			}), U(e, t);
		};
		G(d, (e) => {
			B(n).summary && e(f);
		});
		var p = I(d, 2), m = P(p), h = I(P(m)), g = P(h, !0);
		O(h), O(m);
		var _ = I(m, 2), v = (e) => {
			var t = sm(), i = P(t);
			{
				let e = /* @__PURE__ */ A(() => B(n).expanded ? "chevron-up" : "chevron-down");
				Q(i, {
					get name() {
						return B(e);
					},
					className: "self-driving-expand-icon"
				});
			}
			O(t), L(() => {
				J(t, "aria-expanded", B(n).expanded), J(t, "title", B(r)), J(t, "aria-label", B(r));
			}), V("click", t, function(...e) {
				B(n).onToggleDetails?.apply(this, e);
			}), U(e, t);
		};
		G(_, (e) => {
			B(n).hasProjection && e(v);
		}), O(p), O(a);
		var y = I(a, 2), b = (e) => {
			var t = lm(), r = P(t), i = P(r);
			O(r);
			var a = I(r, 2), o = (e) => {
				var t = cm(), r = P(t);
				O(t), L(() => W(r, `Actual Agent: ${B(n).actualAgent ?? ""}${B(n).actualReason ? ` · ${B(n).actualReason}` : ""}`)), U(e, t);
			};
			G(a, (e) => {
				B(n).actualAgent && e(o);
			});
			var s = I(a, 2), c = (e) => {
				var t = cm(), r = P(t);
				O(t), L(() => W(r, `Waiting context: ${B(n).waitingSummary ?? ""}`)), U(e, t);
			};
			G(s, (e) => {
				B(n).waitingSummary && e(c);
			});
			var l = I(s, 2), u = (e) => {
				var t = cm(), r = P(t);
				O(t), L(() => W(r, `Wake condition: ${B(n).wakeCondition ?? ""}${B(n).wakeFallback ? " (compatibility fallback)" : ""}`)), U(e, t);
			};
			G(l, (e) => {
				B(n).wakeCondition && e(u);
			});
			var d = I(l, 2), f = (e) => {
				var t = cm(), r = P(t);
				O(t), L(() => W(r, `Last outcome: ${B(n).lastOutcome.status ?? ""}${B(n).lastOutcome.reason ? ` · ${B(n).lastOutcome.reason}` : ""}`)), U(e, t);
			};
			G(d, (e) => {
				B(n).lastOutcome && e(f);
			});
			var p = I(d, 2), m = (e) => {
				var t = cm(), r = P(t);
				O(t), L(() => W(r, `${B(n).statusReason.label ?? ""}: ${B(n).statusReason.text ?? ""}`)), U(e, t);
			};
			G(p, (e) => {
				B(n).statusReason && e(m);
			}), O(t), L((e) => W(i, `Revision ${B(n).revision ?? ""} · Desired state: ${B(n).enabled ? "On" : "Off"}${e ?? ""}`), [() => B(n).preferredProfiles.length ? ` · Preferred: ${B(n).preferredProfiles.join(" → ")}` : " · Workspace default"]), U(e, t);
		};
		G(y, (e) => {
			B(n).hasProjection && B(n).expanded && e(b);
		}), O(t), L(() => {
			q(t, 1, `self-driving-bar self-driving-bar-${B(n).status.key}${B(n).expanded ? " expanded" : ""}`), J(t, "aria-label", `Self-Driving: ${B(n).status.label}`), q(s, 1, `self-driving-state self-driving-state-${B(n).status.key}`), W(u, B(n).status.label), J(m, "aria-checked", B(n).enabled), J(m, "aria-label", B(i)), J(m, "title", B(i)), m.disabled = B(n).pending, J(m, "aria-busy", B(n).pending || void 0), W(g, B(n).enabled ? "On" : "Off");
		}), V("click", m, function(...e) {
			B(n).onToggleEnabled?.apply(this, e);
		}), U(e, t);
	};
	G(o, (e) => {
		B(n).visible && e(s);
	}), U(e, a), Ge();
}
Sr(["click"]);
//#endregion
//#region src/components/SelfDrivingDialog.svelte
var fm = /* @__PURE__ */ H("<input name=\"agentName\" readonly=\"\" aria-readonly=\"true\"/>"), pm = /* @__PURE__ */ H("<option> </option>"), mm = /* @__PURE__ */ H("<select name=\"agentName\" required=\"\"><option>Select an Agent</option><!></select>"), hm = /* @__PURE__ */ H("<p class=\"self-driving-dialog-error\" role=\"alert\"> </p>"), gm = /* @__PURE__ */ H("<p class=\"self-driving-dialog-error\" role=\"alert\">The result may be unknown. Refresh the task and session state before trying again.</p>"), _m = /* @__PURE__ */ H("<div class=\"self-driving-dialog-layer\" role=\"presentation\"><button class=\"self-driving-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"self-driving-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"selfDrivingDialogTitle\"><header class=\"self-driving-dialog-header\"><strong id=\"selfDrivingDialogTitle\">Configure Self-Driving</strong> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"selfDrivingConfigForm\" class=\"details-form self-driving-dialog-form\"><label><span>Agent</span> <!></label> <label><span>Run instructions <small>(optional)</small></span> <textarea name=\"runInstructions\" rows=\"4\" placeholder=\"Additional Self-Driving instructions\"></textarea></label> <!> <!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function vm(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(tn({ ...B(n).draft })), i = /* @__PURE__ */ M(""), a = /* @__PURE__ */ M(""), o = /* @__PURE__ */ M(void 0), s = /* @__PURE__ */ A(() => B(n).submitting || B(n).unknown || !B(n).reuseCurrentSession && (!B(r).agentName || B(n).agents.length === 0));
	Ti(() => t.channel.subscribe((e) => {
		N(n, e, !0), e.identity !== B(i) && (N(i, e.identity, !0), N(r, { ...e.draft }, !0), N(a, "")), queueMicrotask(e.onIconsChanged);
	})), Ti(() => {
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
				N(a, "Select an Agent before enabling Self-Driving.");
				return;
			}
			N(a, ""), await B(n).onSubmit({ ...B(r) });
		}
	}
	var l = Ar(), u = F(l), d = (e) => {
		var t = _m(), i = P(t), l = I(i, 2), u = P(l), d = I(P(u), 2);
		Q(P(d), { name: "x" }), O(d), O(u);
		var f = I(u, 2), p = P(f), m = I(P(p), 2), h = (e) => {
			var t = fm();
			di(t), _i(t, () => B(r).agentName, (e) => B(r).agentName = e), U(e, t);
		}, g = (e) => {
			var t = mm(), i = P(t);
			i.value = i.__value = "", K(I(i), 17, () => B(n).agents, (e) => e.id, (e, t) => {
				var n = pm(), r = P(n);
				O(n);
				var i = {};
				L(() => {
					W(r, `${B(t).label ?? ""} — ${B(t).summary ?? ""}`), i !== (i = B(t).id) && (n.value = (n.__value = B(t).id) ?? "");
				}), U(e, n);
			}), O(t), L(() => t.disabled = B(n).agents.length === 0 || B(n).submitting), V("input", t, () => N(a, "")), ai(t, () => B(r).agentName, (e) => B(r).agentName = e), U(e, t);
		};
		G(m, (e) => {
			B(n).reuseCurrentSession ? e(h) : e(g, -1);
		}), O(p);
		var _ = I(p, 2), v = I(P(_), 2);
		ot(v), O(_);
		var y = I(_, 2), b = (e) => {
			var t = hm(), r = P(t, !0);
			O(t), L(() => W(r, B(a) || B(n).error)), U(e, t);
		};
		G(y, (e) => {
			(B(a) || B(n).error) && e(b);
		});
		var x = I(y, 2), S = (e) => {
			U(e, gm());
		};
		G(x, (e) => {
			B(n).unknown && e(S);
		});
		var C = I(x, 2), w = P(C), T = P(w, !0);
		O(w);
		var ee = I(w, 2);
		O(C), O(f), O(l), Si(l, (e) => N(o, e), () => B(o)), O(t), L(() => {
			d.disabled = B(n).submitting, v.disabled = B(n).submitting, w.disabled = B(s), J(w, "aria-busy", B(n).submitting), W(T, B(n).submitting ? "Enabling…" : "Save and Enable"), ee.disabled = B(n).submitting;
		}), V("click", i, function(...e) {
			B(n).onClose?.apply(this, e);
		}), V("click", d, function(...e) {
			B(n).onClose?.apply(this, e);
		}), xr("submit", f, c), V("input", v, () => N(a, "")), _i(v, () => B(r).runInstructions, (e) => B(r).runInstructions = e), V("click", ee, function(...e) {
			B(n).onClose?.apply(this, e);
		}), U(e, t);
	};
	G(u, (e) => {
		B(n).open && e(d);
	}), U(e, l), Ge();
}
Sr(["click", "input"]);
//#endregion
//#region src/components/SessionSwitcher.svelte
var ym = /* @__PURE__ */ H("<button type=\"button\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span></button>"), bm = /* @__PURE__ */ H("<div class=\"agent-session-menu\"></div>"), xm = /* @__PURE__ */ H("<div class=\"agent-current-session\"><button type=\"button\" class=\"agent-current-run active\" title=\"Switch session\"><span><strong> </strong> <small><span><span></span> </span> <span class=\"run-badge-time\"> </span></small></span> <!></button></div> <!>", 1), Sm = /* @__PURE__ */ H("<div class=\"session-pill\"><strong>No sessions yet</strong><span>Start an agent session from the selected task.</span></div>"), Cm = /* @__PURE__ */ H("<div class=\"agent-session-error\" role=\"alert\"> </div>"), wm = /* @__PURE__ */ H("<div id=\"agentSessions\" class=\"agent-session-switcher\"><!> <!></div>");
function Tm(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(!1), i = /* @__PURE__ */ M(""), a = /* @__PURE__ */ M(""), o = /* @__PURE__ */ A(() => B(n).runs.find((e) => e.id === B(n).activeRunId) ?? B(n).runs[0] ?? null);
	Ti(() => {
		let e = t.channel.subscribe((e) => {
			let t = e.identity !== B(n).identity;
			N(n, e, !0), t && (N(r, !1), N(i, ""), N(a, "")), queueMicrotask(e.onIconsChanged);
		}), o = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			B(r) && !t?.closest(".agent-session-switcher") && N(r, !1);
		};
		return document.addEventListener("click", o), () => {
			e(), document.removeEventListener("click", o);
		};
	});
	async function s(e) {
		if (!e || B(i) || e === B(n).activeRunId) {
			e === B(n).activeRunId && N(r, !B(r));
			return;
		}
		N(i, e, !0), N(a, ""), N(r, !1);
		try {
			await B(n).onSelect(e);
		} catch (e) {
			N(a, e instanceof Error ? e.message : String(e), !0), B(n).onToast(B(a));
		} finally {
			N(i, "");
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
	var d = wm(), f = P(d), p = (e) => {
		var t = xm(), a = F(t), d = P(a), f = P(d), p = P(f), m = P(p, !0);
		O(p);
		var h = I(p, 2), g = P(h), _ = P(g);
		let v;
		var y = I(_, 1, !0);
		O(g);
		var b = I(g, 2), x = P(b, !0);
		O(b), O(h), O(f);
		var S = I(f, 2);
		{
			let e = /* @__PURE__ */ A(() => B(i) ? "loader-circle" : "chevrons-up-down");
			Q(S, {
				get name() {
					return B(e);
				},
				className: "session-select-icon"
			});
		}
		O(d), O(a);
		var C = I(a, 2), w = (e) => {
			var t = bm();
			K(t, 21, () => B(n).runs, (e) => e.id, (e, t) => {
				var r = ym();
				let a;
				var o = P(r), d = P(o), f = P(d, !0);
				O(d);
				var p = I(d, 2), m = P(p), h = P(m);
				let g;
				var _ = I(h, 1, !0);
				O(m);
				var v = I(m, 2), y = P(v, !0);
				O(v), O(p), O(o), O(r), L((e, i, o, s, c, l) => {
					a = q(r, 1, "agent-session-menu-row", null, a, { active: B(n).activeRunId === B(t).id }), J(r, "data-agent-run", B(t).id), r.disabled = e, W(f, i), q(m, 1, o), g = q(h, 1, "run-badge-dot", null, g, s), W(_, c), W(y, l);
				}, [
					() => !!B(i),
					() => u(B(t)),
					() => `run-badge run-badge-${c(B(t).status)}`,
					() => ({ "run-badge-pulse": ["running", "attention"].includes(c(B(t).status)) }),
					() => (B(t).status || "unknown").replaceAll("_", " "),
					() => l(B(t).updatedAt)
				]), V("click", r, () => s(B(t).id)), U(e, r);
			}), O(t), U(e, t);
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
			e.stopPropagation(), N(r, !B(r));
		}), U(e, t);
	}, m = (e) => {
		U(e, Sm());
	};
	G(f, (e) => {
		B(o) ? e(p) : e(m, -1);
	});
	var h = I(f, 2), g = (e) => {
		var t = Cm(), n = P(t, !0);
		O(t), L(() => W(n, B(a))), U(e, t);
	};
	G(h, (e) => {
		B(a) && e(g);
	}), O(d), L(() => J(d, "data-session-context", B(n).identity)), U(e, d), Ge();
}
Sr(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var Em = /* @__PURE__ */ H("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), Dm = /* @__PURE__ */ H("<button type=\"button\"><!><span> </span><!></button>"), Om = /* @__PURE__ */ H("<span class=\"settings-pill\">Active</span>"), km = /* @__PURE__ */ H("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), Am = /* @__PURE__ */ H("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), jm = /* @__PURE__ */ H("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span><span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/><span> </span><!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), Mm = /* @__PURE__ */ H("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Nm = /* @__PURE__ */ H("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Workspaces</h2><p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/><span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>"), Pm = /* @__PURE__ */ H("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span><input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/><small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>"), Fm = /* @__PURE__ */ H("<span class=\"settings-pill\"> </span>"), Im = /* @__PURE__ */ H("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), Lm = /* @__PURE__ */ H("<div class=\"settings-empty\">No AgentHub agents available.</div>"), Rm = /* @__PURE__ */ H("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>"), zm = /* @__PURE__ */ H("<option> </option>"), Bm = /* @__PURE__ */ H("<span class=\"settings-profile-system-label\">System</span>"), Vm = /* @__PURE__ */ H("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), Hm = /* @__PURE__ */ H("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), Um = /* @__PURE__ */ H("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map chat and Self-Driving preferences to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>"), Wm = /* @__PURE__ */ H("<small class=\"settings-notification-help\"> </small>"), Gm = /* @__PURE__ */ H("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span><input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span><input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>"), Km = /* @__PURE__ */ H("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><aside class=\"settings-tabs\"><div class=\"settings-title\">System Settings</div> <!></aside> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function qm(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(""), i = /* @__PURE__ */ M(-1), a = /* @__PURE__ */ M(tn(l(B(n)))), o = /* @__PURE__ */ M(""), s = /* @__PURE__ */ M(""), c = /* @__PURE__ */ new Set([
		"default",
		"fast",
		"reasoning",
		"scheduler"
	]);
	Ti(() => t.channel.subscribe((e) => {
		N(n, e, !0), e.identity === B(r) ? e.dataVersion !== B(i) && !B(a).dirty && (N(i, e.dataVersion, !0), N(a, l(e), !0)) : (N(r, e.identity, !0), N(i, e.dataVersion, !0), N(a, l(e), !0), N(o, ""), N(s, "")), queueMicrotask(e.onIconsChanged);
	})), Ti(() => {
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
			N(o, "workspace");
			try {
				await B(n).onAddWorkspace(u()), B(a).workspacePath = "", B(a).createWorkspace = !1;
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				N(o, "");
			}
		}
	}
	async function p(e) {
		if (!B(o)) {
			N(o, `remove:${e}`);
			try {
				await B(n).onRemoveWorkspace(e, u());
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				N(o, "");
			}
		}
	}
	async function m(e, t) {
		if (!B(o)) {
			N(o, `icon:${e}`), N(s, "");
			try {
				await B(n).onWorkspaceIcon(e, t, u());
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				N(o, "");
			}
		}
	}
	async function h(e) {
		if (e.preventDefault(), !B(o)) {
			N(o, "user");
			try {
				B(a).userName = await B(n).onSaveUser(B(a).userName);
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				N(o, "");
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
			N(o, "agenthub");
			try {
				await B(n).onSaveAgentHub(u()), B(a).dirty = !1;
			} catch (e) {
				B(n).onToast(S(e));
			} finally {
				N(o, "");
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
	var C = Ar(), w = F(C), T = (e) => {
		var t = Km(), r = F(t), i = I(r, 2), l = P(i);
		K(I(P(l), 2), 16, () => [
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
			var n = Dm();
			let r;
			var i = P(n);
			Q(i, { get name() {
				return t[1];
			} });
			var o = I(i), s = P(o, !0);
			O(o);
			var c = I(o), l = (e) => {
				U(e, Em());
			};
			G(c, (e) => {
				(t[0] === "agenthub" || t[0] === "profiles") && e(l);
			}), O(n), L(() => {
				r = q(n, 1, "settings-tab", null, r, {
					active: B(a).tab === t[0],
					dirty: B(a).dirty && (t[0] === "agenthub" || t[0] === "profiles")
				}), W(s, t[2]);
			}), V("click", n, () => B(a).tab = t[0]), U(e, n);
		}), O(l);
		var u = I(l, 2), S = P(u);
		Q(P(S), { name: "x" }), O(S);
		var C = I(S, 2), w = (e) => {
			var t = Nm(), r = I(P(t), 2), i = P(r);
			di(i);
			var c = I(i, 2), l = P(c);
			di(l), k(), O(c);
			var u = I(c, 2), d = P(u);
			Q(d, { name: "plus" });
			var h = I(d), g = P(h, !0);
			O(h), O(u), O(r);
			var _ = I(r, 2);
			K(_, 21, () => B(n).workspaces, (e) => e.id, (e, t) => {
				let r = /* @__PURE__ */ A(() => b(B(t).id));
				var i = jm(), a = P(i), c = P(a), l = P(c), u = P(l);
				O(l);
				var d = I(l), f = P(d), h = P(f, !0);
				O(f);
				var g = I(f), _ = P(g, !0);
				O(g), O(d), O(c);
				var v = I(c, 2), y = P(v), x = (e) => {
					U(e, Om());
				};
				G(y, (e) => {
					B(t).id === B(n).activeWorkspaceId && e(x);
				});
				var S = I(y, 2), C = P(S), w = I(C), T = P(w, !0);
				O(w), Q(I(w), { name: "chevron-down" }), O(S);
				var ee = I(S, 2);
				Q(P(ee), { name: "trash-2" }), O(ee), O(v), O(a);
				var te = I(a, 2), ne = (e) => {
					var i = Am();
					K(i, 21, () => B(n).workspaceIcons, (e) => e.id, (e, n) => {
						var i = km();
						let a;
						var o = P(i), s = I(o), c = P(s, !0);
						O(s);
						var l = I(s), u = (e) => {
							Q(e, { name: "check" });
						};
						G(l, (e) => {
							B(n).id === B(r).id && e(u);
						}), O(i), L(() => {
							J(i, "aria-checked", B(n).id === B(r).id), J(i, "title", B(n).label), a = q(i, 1, "", null, a, { selected: B(n).id === B(r).id }), J(o, "src", B(n).src), W(c, B(n).label);
						}), V("click", i, () => m(B(t).id, B(n).id)), U(e, i);
					}), O(i), L(() => J(i, "aria-label", `Icon for ${B(t).name}`)), U(e, i);
				};
				G(te, (e) => {
					B(s) === B(t).id && e(ne);
				}), O(i), L((e, n) => {
					J(u, "src", B(r).src), W(h, B(t).name), W(_, B(t).path), J(S, "aria-expanded", B(s) === B(t).id), S.disabled = e, J(C, "src", B(r).src), W(T, B(o) === `icon:${B(t).id}` ? "Saving..." : B(r).label), ee.disabled = n;
				}, [() => !!B(o), () => !!B(o)]), V("click", S, () => N(s, B(s) === B(t).id ? "" : B(t).id, !0)), V("click", ee, () => p(B(t).id)), U(e, i);
			}, (e) => {
				U(e, Mm());
			}), O(_), O(t), L((e) => {
				u.disabled = e, W(g, B(a).createWorkspace ? "Create" : "Add");
			}, [() => !!B(o)]), xr("submit", r, f), _i(i, () => B(a).workspacePath, (e) => B(a).workspacePath = e), vi(l, () => B(a).createWorkspace, (e) => B(a).createWorkspace = e), U(e, t);
		}, T = (e) => {
			var t = Pm(), n = I(P(t), 2), r = P(n), i = I(P(r));
			di(i), k(), O(r);
			var s = I(r, 2), c = P(s);
			Q(P(c), { name: "save" }), k(), O(c), O(s), O(n), O(t), L(() => c.disabled = B(o) === "user"), xr("submit", n, h), _i(i, () => B(a).userName, (e) => B(a).userName = e), U(e, t);
		}, ee = (e) => {
			var t = Rm(), r = I(P(t), 2), i = P(r), s = I(P(i)), c = P(s, !0);
			O(s), O(i);
			var l = I(i, 2), u = I(P(l));
			di(u), O(l);
			var f = I(l, 2), p = P(f, !0);
			O(f);
			var m = I(f, 2);
			K(m, 21, () => B(n).agentHub.capabilities, Lr, (e, t) => {
				var n = Fm(), r = P(n, !0);
				O(n), L(() => W(r, B(t))), U(e, n);
			}), O(m), O(r);
			var h = I(r, 2), g = P(h), _ = I(P(g)), v = P(_);
			O(_), O(g);
			var b = I(g, 2);
			K(b, 21, () => B(n).agentHub.agents, (e) => e.name, (e, t) => {
				var n = Im(), r = P(n), i = P(r), a = P(i, !0);
				O(i);
				var o = I(i), s = P(o), c = P(s, !0);
				O(s);
				var l = I(s), u = P(l);
				O(l), O(o), O(r), O(n), L((e) => {
					W(a, e), W(c, B(t).name), W(u, `${(B(t).providerId || "") ?? ""} · ${(B(t).available === !1 ? B(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
				}, [() => (B(t).name || "A").slice(0, 1).toUpperCase()]), U(e, n);
			}, (e) => {
				U(e, Lm());
			}), O(b), O(h);
			var x = I(h, 2), S = P(x);
			let C;
			var w = P(S, !0);
			O(S);
			var T = I(S);
			Q(P(T), { name: "save" }), k(), O(T), O(x), O(t), L((e) => {
				W(c, B(n).agentHub.connected && B(n).agentHub.compatible ? "Compatible" : B(n).agentHub.connected ? "Incompatible" : "Unavailable"), W(p, B(n).agentHub.error || `API ${B(n).agentHub.apiVersion || "unknown"} · AgentHub ${B(n).agentHub.version || "unknown"}`), W(v, `${B(n).agentHub.agents.length ?? ""} agents · ${B(n).agentHub.providers.length ?? ""} providers`), C = q(S, 1, "settings-save-hint", null, C, { visible: B(a).dirty }), W(w, B(a).dirty ? "Unsaved changes" : ""), T.disabled = e;
			}, [() => !B(a).dirty || !!B(o)]), V("input", u, d), _i(u, () => B(a).endpoint, (e) => B(a).endpoint = e), V("click", T, y), U(e, t);
		}, te = (e) => {
			var t = Um(), r = I(P(t), 2), i = P(r), s = I(P(i)), l = P(s);
			O(s), O(i);
			var u = I(i, 2), d = I(P(u), 2);
			K(d, 17, () => B(a).profiles, Lr, (e, t, n) => {
				let r = /* @__PURE__ */ A(() => c.has(B(t).key.trim().toLowerCase()));
				var i = Hm();
				let a;
				var o = P(i);
				di(o);
				var s = I(o, 2);
				di(s);
				var l = I(s, 2);
				K(l, 21, () => x(B(t).agentName), Lr, (e, t) => {
					var n = zm(), r = P(n, !0);
					O(n);
					var i = {};
					L(() => {
						W(r, B(t).label), i !== (i = B(t).id) && (n.value = (n.__value = B(t).id) ?? "");
					}), U(e, n);
				}), O(l);
				var u;
				ii(l);
				var d = I(l, 2), f = (e) => {
					U(e, Bm());
				}, p = (e) => {
					var t = Vm();
					Q(P(t), { name: "trash-2" }), O(t), V("click", t, () => v(n)), U(e, t);
				};
				G(d, (e) => {
					B(r) ? e(f) : e(p, -1);
				}), O(i), L(() => {
					a = q(i, 1, "settings-profile-row", null, a, { "settings-profile-system": B(r) }), fi(o, B(t).key), o.disabled = B(r), fi(s, B(t).description), s.disabled = B(r), u !== (u = B(t).agentName) && (l.value = (l.__value = B(t).agentName) ?? "", ri(l, B(t).agentName));
				}), V("input", o, (e) => g(n, "key", e.currentTarget.value)), V("input", s, (e) => g(n, "description", e.currentTarget.value)), V("change", l, (e) => g(n, "agentName", e.currentTarget.value)), U(e, i);
			});
			var f = I(d, 2), p = P(f);
			di(p);
			var m = I(p, 2);
			di(m);
			var h = I(m, 2);
			K(h, 21, () => B(n).agents, Lr, (e, t) => {
				var n = zm(), r = P(n, !0);
				O(n);
				var i = {};
				L(() => {
					W(r, B(t).label), i !== (i = B(t).id) && (n.value = (n.__value = B(t).id) ?? "");
				}), U(e, n);
			}), O(h);
			var b = I(h, 2);
			Q(P(b), { name: "plus" }), k(), O(b), O(f), O(u), O(r);
			var S = I(r, 2), C = P(S);
			let w;
			var T = P(C, !0);
			O(C);
			var ee = I(C);
			Q(P(ee), { name: "save" }), k(), O(ee), O(S), O(t), L((e) => {
				W(l, `${B(a).profiles.length ?? ""} routes`), h.disabled = !B(n).agents.length, b.disabled = !B(n).agents.length, w = q(C, 1, "settings-save-hint", null, w, { visible: B(a).dirty }), W(T, B(a).dirty ? "Unsaved changes" : ""), ee.disabled = e;
			}, [() => !B(a).dirty || !!B(o)]), _i(p, () => B(a).newProfile.key, (e) => B(a).newProfile.key = e), _i(m, () => B(a).newProfile.description, (e) => B(a).newProfile.description = e), ai(h, () => B(a).newProfile.agentName, (e) => B(a).newProfile.agentName = e), V("click", b, _), V("click", ee, y), U(e, t);
		}, ne = (e) => {
			var t = Gm(), r = I(P(t), 2), i = P(r), a = I(P(i));
			di(a), O(i);
			var o = I(i, 2), s = (e) => {
				var t = Wm(), r = P(t, !0);
				O(t), L(() => W(r, B(n).notifications.permissionError)), U(e, t);
			};
			G(o, (e) => {
				B(n).notifications.permissionError && e(s);
			}), O(r);
			var c = I(r, 2), l = P(c), u = I(P(l));
			di(u), O(l);
			var d = I(l, 2), f = P(d, !0);
			O(d), O(c), O(t), L(() => {
				pi(a, B(n).notifications.browser), pi(u, B(n).notifications.sound), W(f, B(n).notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
			}), V("change", a, (e) => B(n).onBrowserNotifications(e.currentTarget.checked)), V("change", u, (e) => B(n).onCompletionSound(e.currentTarget.checked)), U(e, t);
		};
		G(C, (e) => {
			B(a).tab === "workspace" ? e(w) : B(a).tab === "user" ? e(T, 1) : B(a).tab === "agenthub" ? e(ee, 2) : B(a).tab === "profiles" ? e(te, 3) : e(ne, -1);
		}), O(u), O(i), V("click", r, () => B(n).onClose(B(a).dirty)), V("click", S, () => B(n).onClose(B(a).dirty)), U(e, t);
	};
	G(w, (e) => {
		B(n).open && e(T);
	}), U(e, C), Ge();
}
Sr([
	"click",
	"input",
	"change"
]);
//#endregion
//#region src/components/Toast.svelte
var Jm = /* @__PURE__ */ H("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function Ym(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(!1), i = null;
	Ti(() => {
		let e = t.channel.subscribe((e) => {
			N(n, e, !0), N(r, !!e.message, !0), i !== null && window.clearTimeout(i), B(r) && (i = window.setTimeout(() => {
				N(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = Jm(), o = P(a, !0);
	O(a), L(() => {
		J(a, "hidden", !B(r)), W(o, B(n).message);
	}), U(e, a), Ge();
}
//#endregion
//#region src/components/UploadDialog.svelte
var Xm = /* @__PURE__ */ H("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), Zm = /* @__PURE__ */ H("<small class=\"upload-result-path\"> </small>"), Qm = /* @__PURE__ */ H("<small class=\"upload-error\"> </small>"), $m = /* @__PURE__ */ H("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), eh = /* @__PURE__ */ H("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this session's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function th(e, t) {
	We(t, !0);
	let n = /* @__PURE__ */ M(tn(t.channel.current())), r = /* @__PURE__ */ M(""), i = /* @__PURE__ */ M(tn([])), a = 1, o = /* @__PURE__ */ M(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ A(() => B(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ A(() => B(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ A(() => B(i).filter((e) => e.status === "error").length);
	Ti(() => {
		let e = t.channel.subscribe((e) => {
			N(n, e, !0), e.identity !== B(r) && (d(), N(r, e.identity, !0), N(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
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
		N(i, [...B(i), ...r], !0);
		for (let e of r) g(e, B(n).identity, B(n).workspaceId, B(n).runId);
	}
	function h(e, t) {
		N(i, B(i).map((n) => n.id === e ? {
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
	var b = Ar(), x = F(b), S = (e) => {
		var t = eh(), n = P(t), r = I(n, 2), a = P(r), s = I(P(a), 2);
		Q(P(s), { name: "x" }), O(s), O(a);
		var d = I(a, 2), f = P(d);
		Si(f, (e) => N(o, e), () => B(o));
		var p = I(f, 2), h = P(p);
		Q(h, { name: "clipboard-paste" });
		var g = I(h, 4);
		Q(P(g), { name: "folder-open" }), k(), O(g), O(p);
		var b = I(p, 2), x = P(b), S = (e) => {
			U(e, Xm());
		};
		G(x, (e) => {
			B(i).length || e(S);
		}), K(I(x, 2), 17, () => B(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ A(() => y(B(t)));
			var r = $m();
			let i;
			var a = P(r), o = P(a);
			Q(o, { get name() {
				return B(n).icon;
			} });
			var s = I(o), c = P(s), l = P(c, !0);
			O(c);
			var u = I(c), d = P(u, !0);
			O(u), O(s);
			var f = I(s), p = P(f, !0);
			O(f), O(a);
			var m = I(a, 2), h = P(m);
			let g;
			O(m);
			var _ = I(m, 2), b = (e) => {
				var n = Zm(), r = P(n, !0);
				O(n), L(() => W(r, B(t).path)), U(e, n);
			};
			G(_, (e) => {
				B(t).status === "success" && e(b);
			});
			var x = I(_, 2), S = (e) => {
				var n = Qm(), r = P(n, !0);
				O(n), L(() => W(r, B(t).error || "Upload failed")), U(e, n);
			};
			G(x, (e) => {
				B(t).status === "error" && e(S);
			}), O(r), L((e) => {
				i = q(r, 1, "upload-item", null, i, {
					"upload-item-success": B(t).status === "success",
					"upload-item-error": B(t).status === "error",
					"upload-item-uploading": B(t).status === "uploading"
				}), W(l, B(t).name), W(d, e), W(p, B(n).label), J(m, "aria-label", B(t).name), J(m, "aria-valuenow", B(t).progress), g = ni(h, "", g, { width: `${B(t).progress}%` });
			}, [() => v(B(t).size)]), U(e, r);
		}), O(b), O(d);
		var C = I(d, 2), w = P(C), T = P(w, !0);
		O(w);
		var ee = I(w, 2);
		O(C), O(r), O(t), L(() => {
			s.disabled = B(c), W(T, B(c) ? "Wait for uploads to finish before closing." : B(i).length ? `${B(l)} uploaded${B(u) ? ` · ${B(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), ee.disabled = B(c);
		}), V("click", n, _), V("click", s, _), V("change", f, () => B(o).files && m(B(o).files)), xr("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), xr("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), xr("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), V("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), B(o).click());
		}), V("click", g, () => B(o).click()), V("click", ee, _), U(e, t);
	};
	G(x, (e) => {
		B(n).open && e(S);
	}), U(e, b), Ge();
}
Sr([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/components/component-registry.ts
var nh = /* @__PURE__ */ new Map();
async function rh(e, t, n) {
	await ih(e), t.replaceChildren(), nh.set(e, n(t));
}
async function ih(e) {
	let t = nh.get(e);
	t && (nh.delete(e), await t());
}
async function ah() {
	let e = [...nh.keys()].reverse();
	for (let t of e) await ih(t);
}
//#endregion
//#region src/components/model-channel.ts
function oh(e) {
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
var $ = () => void 0, sh = async () => void 0, ch = [{
	id: "",
	label: "Forge default",
	src: "/favicon.svg"
}], lh = oh({
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
	onSwitchWorkspace: sh,
	onAddWorkspace: $,
	onCreateProject: $,
	onOpenSettings: $,
	onToggleProject: sh,
	onSelectResource: sh,
	onReorder: sh,
	onDragState: $,
	onPanePreview: $,
	onPaneCommit: $,
	onPaneViewport: $,
	onMobileSidebar: $,
	onMobileView: $,
	onMobileImmersive: $,
	onToast: $,
	onIconsChanged: $,
	onHistoryNavigation: sh
}), uh = oh({
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
	onPreview: sh,
	onSubmit: sh,
	previewRequestKey: () => "",
	onConfirmTemplateSwitch: () => !0,
	onIconsChanged: $
}), dh = oh({
	open: !1,
	identity: "",
	dataVersion: 0,
	initialTab: "workspace",
	workspaces: [],
	activeWorkspaceId: "",
	workspaceIcons: ch,
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
	onAddWorkspace: sh,
	onRemoveWorkspace: sh,
	onWorkspaceIcon: sh,
	onSaveUser: async (e) => e,
	onSaveAgentHub: sh,
	onBrowserNotifications: $,
	onCompletionSound: $,
	onToast: $,
	onIconsChanged: $
}), fh = oh({
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
	onSubmit: sh,
	onIconsChanged: $
}), ph = oh({
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
}), mh = oh({
	message: "",
	revision: 0
}), hh = oh({
	open: !1,
	identity: "",
	workspaceId: "",
	runId: "",
	onDone: $,
	onIconsChanged: $
}), gh = oh({
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
}), _h = oh({
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
	onLoadMoreLogs: sh,
	onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
	onToast: $,
	onIconsChanged: $
}), vh = oh({
	identity: "",
	workspaceId: "",
	resourceId: "",
	activeRunId: "",
	runs: [],
	switchingRunId: "",
	onSelect: sh,
	onToast: $,
	onIconsChanged: $
}), yh = oh({
	identity: "",
	workspaceId: "",
	activeRunId: "",
	activeRun: null,
	runCount: 0,
	agentName: "Agent",
	project: () => [],
	onEvent: $,
	onNotice: $,
	onApproval: sh,
	onToast: $,
	onIconsChanged: $
});
async function bh() {
	await xh("app-shell", "app", nd, { channel: lh });
}
async function xh(e, t, n, r) {
	let i = document.getElementById(t);
	i && await rh(e, i, (t) => {
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
async function Sh() {
	await Promise.all([
		xh("create-dialog", "createDialogRoot", Gd, { channel: uh }),
		xh("settings", "settingsRoot", qm, { channel: dh }),
		xh("self-driving-dialog", "selfDrivingDialogRoot", vm, { channel: fh }),
		xh("self-driving-bar", "selfDrivingBarWrap", dm, { channel: ph }),
		xh("upload-dialog", "uploadDialogRoot", th, { channel: hh }),
		xh("chat-composer", "ttyComposer", gd, { channel: gh }),
		xh("session-switcher", "agentSessionsWrap", Tm, { channel: vh }),
		xh("event-timeline", "ttyLog", am, { channel: yh }),
		xh("detail-panel", "detailsPanel", up, { channel: _h }),
		xh("toast", "toastRoot", Ym, { channel: mh })
	]);
}
var Ch = {
	renderAppShell: (e) => lh.publish(e),
	renderCreateDialog: (e) => uh.publish(e),
	renderSettings: (e) => dh.publish(e),
	renderSelfDrivingDialog: (e) => fh.publish(e),
	renderSelfDrivingBar: (e) => ph.publish(e),
	renderUploadDialog: (e) => hh.publish(e),
	renderComposer: (e) => gh.publish(e),
	renderSessionSwitcher: (e) => vh.publish(e),
	renderEventTimeline: (e) => yh.publish(e),
	renderDetailPanel: (e) => _h.publish(e),
	renderToast: (e) => mh.publish(e)
};
window.addEventListener("pagehide", () => {
	Iu(), ah();
}), window.addEventListener("pageshow", (e) => {
	e.persisted && (async () => {
		await bh(), await Sh(), Pu(Ch);
	})();
}), (async () => {
	await bh(), await Sh(), Pu(Ch);
})().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
