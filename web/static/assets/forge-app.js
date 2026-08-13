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
	return Ne(/* @__PURE__ */ cn(k));
}
function A(e) {
	if (O) {
		if (/* @__PURE__ */ cn(k) !== null) throw ke(), Ce;
		k = e;
	}
}
function j(e = 1) {
	if (O) {
		for (var t = e, n = k; t--;) n = /* @__PURE__ */ cn(n);
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
		var i = /* @__PURE__ */ cn(n);
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
function M(e, t = !1, n) {
	Be = {
		p: Be,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: V,
		l: null
	};
}
function N(e) {
	var t = Be, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) bn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Be = t.p, e ?? {};
}
function He() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var Ue = [];
function We() {
	var e = Ue;
	Ue = [], f(e);
}
function Ge(e) {
	if (Ue.length === 0 && !Ot) {
		var t = Ue;
		queueMicrotask(() => {
			t === Ue && We();
		});
	}
	Ue.push(e);
}
function Ke() {
	for (; Ue.length > 0;) We();
}
function qe(e) {
	var t = V;
	if (t === null) return Hn.f |= ee, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Je(e, t);
}
function Je(e, t) {
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
var Ye = ~(h | g | m);
function Xe(e, t) {
	e.f = e.f & Ye | t;
}
function Ze(e) {
	e.f & 512 || e.deps === null ? Xe(e, m) : Xe(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Qe(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, Qe(t.deps));
}
function $e(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Qe(e.deps), Xe(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var et = !1;
function tt(e) {
	var t = et;
	try {
		return et = !1, [e(), et];
	} finally {
		et = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function nt(e) {
	O && /* @__PURE__ */ sn(e) !== null && un(e);
}
var rt = !1;
function it() {
	rt || (rt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[ce]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function at(e) {
	var t = Hn, n = V;
	Wn(null), Gn(null);
	try {
		return e();
	} finally {
		Wn(t), Gn(n);
	}
}
function ot(e, t, n, r = n) {
	e.addEventListener(t, () => at(n));
	let i = e[ce];
	e[ce] = i ? () => {
		i(), r(!0);
	} : () => r(!0), it();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function st(e) {
	let t = 0, n = Gt(0), r;
	return () => {
		_n() && (H(n), wn(() => (t === 0 && (r = fr(() => e(() => Yt(n)))), t += 1, () => {
			Ge(() => {
				--t, t === 0 && (r?.(), r = void 0, Yt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ct = x | S;
function lt(e, t, n, r) {
	new ut(e, t, n, r);
}
var ut = class {
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
	#h = st(() => (this.#m = Gt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = V;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = V.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Tn(() => {
			if (O) {
				let e = this.#t;
				Pe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, ct), O && (this.#e = k);
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
		Ge(r), t && (this.#s = En(() => {
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
					Je(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = En(() => e(this.#e)), Ge(() => {
			var e = this.#c = document.createDocumentFragment(), t = on();
			e.append(t), this.#a = this.#S(() => En(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Nn(this.#o, () => {
				this.#o = null;
			}), this.#x(F));
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
			} else this.#x(F);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		$e(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = V, n = Hn, r = Be;
		Gn(this.#i), Wn(this.#i), Ve(this.#i.ctx);
		try {
			return Pt.ensure(), e();
		} catch (e) {
			return qe(e), null;
		} finally {
			Gn(t), Wn(n), Ve(r);
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
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ge(() => {
			this.#d = !1, this.#m && qt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), H(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		F?.is_fork ? (this.#a && F.skip_effect(this.#a), this.#o && F.skip_effect(this.#o), this.#s && F.skip_effect(this.#s), F.oncommit(() => {
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
						var r = V;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Je(e, this.#i.parent), null;
				}
			}));
		};
		Ge(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Je(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Je(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function dt(e, t, n, r) {
	let i = He() ? ht : vt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = V, c = ft(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Je(e, s);
			}
			pt();
		}
	}
	var d = mt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ _t(e))).then(u).catch((e) => Je(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), pt();
	}) : f();
}
function ft() {
	var e = V, t = Hn, n = Be, r = F;
	return function(i = !0) {
		Gn(e), Wn(t), Ve(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function pt(e = !0) {
	Gn(null), Wn(null), Ve(null), e && F?.deactivate();
}
function mt() {
	var e = V, t = e.b, n = F, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function ht(e) {
	var t = 2 | h;
	return V !== null && (V.f |= S), {
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
		parent: V,
		ac: null
	};
}
var gt = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function _t(e, t, n) {
	let r = V;
	r === null && fe();
	var i = void 0, a = Gt(we), o = !Hn, s = /* @__PURE__ */ new Set();
	return Cn(() => {
		var t = V, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== le && n.reject(e);
			}).finally(pt);
		} catch (e) {
			n.reject(e), pt();
		}
		var c = F;
		if (o) {
			if (t.f & 32768) var l = mt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(gt);
			else for (let e of s.values()) e.reject(gt);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== gt && (c.activate(), t ? (a.f |= ee, qt(a, t)) : (a.f & 8388608 && (a.f ^= ee), qt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), vn(() => {
		for (let e of s) e.reject(gt);
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
function P(e) {
	let t = /* @__PURE__ */ ht(e);
	return qn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function vt(e) {
	let t = /* @__PURE__ */ ht(e);
	return t.equals = ze, t;
}
function yt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) An(t[n]);
	}
}
function bt(e) {
	var t, n = V, r = e.parent;
	if (!Bn && r !== null && e.v !== we && r.f & 24576) return Oe(), e.v;
	Gn(r);
	try {
		e.f &= ~T, yt(e), t = ar(e);
	} finally {
		Gn(n);
	}
	return t;
}
function xt(e) {
	var t = bt(e);
	if (!e.equals(t) && (e.wv = nr(), (!F?.is_fork || e.deps === null) && (F === null ? e.v = t : (F.capture(e, t, !0), Tt?.capture(e, t, !0)), e.deps === null))) {
		Xe(e, m);
		return;
	}
	Bn || (Et === null ? Ze(e) : (_n() || F?.is_fork) && Et.set(e, t));
}
function St(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && at(() => {
		t.ac.abort(le), t.ac = null;
	}), t.fn !== null && (t.teardown = d), sr(t, 0), On(t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && cr(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var wt = null, F = null, Tt = null, Et = null, Dt = null, Ot = !1, kt = !1, At = null, jt = null, Mt = 0, Nt = 1, Pt = class e {
	id = Nt++;
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
		wt === null ? wt = this : (wt.#n = this, this.#t = wt), wt = this;
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
			for (var r of n.d) Xe(r, h), t(r);
			for (r of n.m) Xe(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Mt++ > 1e3 && (this.#x(), It());
		for (let e of this.#u) this.#d.delete(e), Xe(e, h), this.schedule(e);
		for (let e of this.#d) Xe(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = At = [], r = [], i = jt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Vt(e), this.#h() || this.discard(), t;
		}
		if (F = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (At = null, jt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Bt(e, t);
			i.length > 0 && F.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), Tt = this, Rt(r), Rt(n), Tt = null, this.#s?.resolve();
		var s = F;
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Xe(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), F = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) $e(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== we && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Et?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		F = this;
	}
	deactivate() {
		F = null, Et = null;
	}
	flush() {
		try {
			kt = !0, F = this, this.#g();
		} finally {
			Mt = 0, Dt = null, At = null, jt = null, kt = !1, F = null, Et = null, Ut.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(gt);
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
		this.#m || (this.#m = !0, Ge(() => {
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
		if (F === null) {
			let t = F = new e();
			!kt && !Ot && Ge(() => {
				t.#e || t.flush();
			});
		}
		return F;
	}
	apply() {
		Et = null;
	}
	schedule(e) {
		if (Dt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (At !== null && t === V && (Hn === null || !(Hn.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? wt = e : t.#t = e, this.linked = !1;
		}
	}
};
function Ft(e) {
	var t = Ot;
	Ot = !0;
	try {
		var n;
		for (e && (F !== null && !F.is_fork && F.flush(), n = e());;) {
			if (Ke(), F === null) return n;
			F.flush();
		}
	} finally {
		Ot = t;
	}
}
function It() {
	try {
		_e();
	} catch (e) {
		Je(e, Dt);
	}
}
var Lt = null;
function Rt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && rr(r) && (Lt = /* @__PURE__ */ new Set(), cr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mn(r), Lt?.size > 0)) {
				Ut.clear();
				for (let e of Lt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Lt.has(n) && (Lt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || cr(n);
					}
				}
				Lt.clear();
			}
		}
		Lt = null;
	}
}
function zt(e) {
	F.schedule(e);
}
function Bt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Xe(e, m);
		for (var n = e.first; n !== null;) Bt(n, t), n = n.next;
	}
}
function Vt(e) {
	Xe(e, m);
	for (var t = e.first; t !== null;) Vt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Ht = /* @__PURE__ */ new Set(), Ut = /* @__PURE__ */ new Map(), Wt = !1;
function Gt(e, t) {
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
function I(e, t) {
	let n = Gt(e, t);
	return qn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Kt(e, t = !1, n = !0) {
	let r = Gt(e);
	return t || (r.equals = ze), r;
}
function L(e, t, n = !1) {
	return Hn !== null && (!Un || Hn.f & 131072) && He() && Hn.f & 4325394 && (Kn === null || !Kn.has(e)) && xe(), qt(e, n ? Zt(t) : t, jt);
}
function qt(e, t, n = null) {
	if (!e.equals(t)) {
		Ut.set(e, Bn ? t : e.v);
		var r = Pt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && bt(t), Et === null && Ze(t);
		}
		e.wv = nr(), Xt(e, h, n), He() && V !== null && V.f & 1024 && !(V.f & 96) && (Xn === null ? Zn([e]) : Xn.push(e)), !r.is_fork && Ht.size > 0 && !Wt && Jt();
	}
	return t;
}
function Jt() {
	Wt = !1;
	for (let e of Ht) {
		e.f & 1024 && Xe(e, g);
		let t;
		try {
			t = rr(e);
		} catch {
			t = !0;
		}
		t && cr(e);
	}
	Ht.clear();
}
function Yt(e) {
	L(e, e.v + 1);
}
function Xt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = He(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === V)) {
			var l = (c & h) === 0;
			if (l && Xe(s, t), c & 131072) Ht.add(s);
			else if (c & 2) {
				var u = s;
				Et?.delete(u), c & 65536 || (c & 512 && (V === null || !(V.f & 2097152)) && (s.f |= T), Xt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Lt !== null && Lt.add(d), n === null ? zt(d) : n.push(d);
			}
		}
	}
}
function Zt(t) {
	if (typeof t != "object" || !t || te in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ I(0), u = null, d = er, f = (e) => {
		if (er === d) return e();
		var t = Hn, n = er;
		Wn(null), tr(d);
		var r = e();
		return Wn(t), tr(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ I(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ye();
			var i = r.get(t);
			return i === void 0 ? f(() => {
				var e = /* @__PURE__ */ I(n.value, u);
				return r.set(t, e), e;
			}) : L(i, n.value, !0), !0;
		},
		deleteProperty(e, t) {
			var n = r.get(t);
			if (n === void 0) {
				if (t in e) {
					let e = f(() => /* @__PURE__ */ I(we, u));
					r.set(t, e), Yt(o);
				}
			} else L(n, we), Yt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === te) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ I(Zt(s ? e[n] : we), u)), r.set(n, o)), o !== void 0) {
				var c = H(o);
				return c === we ? void 0 : c;
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
			return (n !== void 0 || V !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ I(i ? Zt(e[t]) : we, u)), r.set(t, n)), H(n) === we) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ I(we, u)), r.set(d + "", p)) : L(p, we);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ I(void 0, u)), L(c, Zt(n)), r.set(t, c));
			else {
				l = c.v !== we;
				var m = f(() => Zt(n));
				L(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && L(g, _ + 1);
				}
				Yt(o);
			}
			return !0;
		},
		ownKeys(e) {
			H(o);
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
function Qt(e) {
	try {
		if (typeof e == "object" && e && te in e) return e[te];
	} catch {}
	return e;
}
function $t(e, t) {
	return Object.is(Qt(e), Qt(t));
}
var en, tn, nn, rn;
function an() {
	if (en === void 0) {
		en = window, tn = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		nn = a(t, "firstChild").get, rn = a(t, "nextSibling").get, u(e) && (e[ae] = void 0, e[ie] = null, e[oe] = void 0, e.__e = void 0), u(n) && (n[se] = void 0);
	}
}
function on(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function sn(e) {
	return nn.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function cn(e) {
	return rn.call(e);
}
function R(e, t) {
	if (!O) return /* @__PURE__ */ sn(e);
	var n = /* @__PURE__ */ sn(k);
	if (n === null) n = k.appendChild(on());
	else if (t && n.nodeType !== 3) {
		var r = on();
		return n?.before(r), Ne(r), r;
	}
	return t && pn(n), Ne(n), n;
}
function ln(e, t = !1) {
	if (!O) {
		var n = /* @__PURE__ */ sn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ cn(n) : n;
	}
	if (t) {
		if (k?.nodeType !== 3) {
			var r = on();
			return k?.before(r), Ne(r), r;
		}
		pn(k);
	}
	return k;
}
function z(e, t = 1, n = !1) {
	let r = O ? k : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ cn(r);
	if (!O) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = on();
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
	V === null && (Hn === null && ge(e), he()), Bn && me(e);
}
function hn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function gn(e, t) {
	var n = V;
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
	F?.register_created_effect(r);
	var i = r;
	if (e & 4) At === null ? Pt.ensure().schedule(r) : At.push(r);
	else if (t !== null) {
		try {
			cr(r);
		} catch (e) {
			throw An(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && hn(i, n), Hn !== null && Hn.f & 2 && !(e & 64))) {
		var a = Hn;
		(a.effects ??= []).push(i);
	}
	return r;
}
function _n() {
	return Hn !== null && !Un;
}
function vn(e) {
	let t = gn(8, null);
	return Xe(t, m), t.teardown = e, t;
}
function yn(e) {
	mn("$effect");
	var t = V.f;
	if (!Hn && t & 32 && Be !== null && !Be.i) {
		var n = Be;
		(n.e ??= []).push(e);
	} else return bn(e);
}
function bn(e) {
	return gn(4 | C, e);
}
function xn(e) {
	Pt.ensure();
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
	dt(r, t, n, (t) => {
		gn(8, () => {
			e(...t.map(H));
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
		let e = Bn, n = Hn;
		Vn(!0), Wn(null);
		try {
			t.call(null);
		} finally {
			Vn(e), Wn(n);
		}
	}
}
function On(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && at(() => {
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
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (jn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, On(e, t && !n), sr(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Dn(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && Mn(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function jn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ cn(e);
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
		e.f ^= _, e.f & 1024 || (Xe(e, h), Pt.ensure().schedule(e));
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
		var i = n === r ? null : /* @__PURE__ */ cn(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Rn = null, zn = !1, Bn = !1;
function Vn(e) {
	Bn = e;
}
var Hn = null, Un = !1;
function Wn(e) {
	Hn = e;
}
var V = null;
function Gn(e) {
	V = e;
}
var Kn = null;
function qn(e) {
	Hn !== null && (Kn ??= /* @__PURE__ */ new Set()).add(e);
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
			if (rr(a) && xt(a), a.wv > e.wv) return !0;
		}
		t & 512 && Et === null && Xe(e, m);
	}
	return !1;
}
function ir(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Kn !== null && Kn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? ir(a, t, !1) : t === a && (n ? Xe(a, h) : a.f & 1024 && Xe(a, g), zt(a));
	}
}
function ar(e) {
	var t = Jn, n = Yn, r = Xn, i = Hn, a = Kn, o = Be, s = Un, c = er, l = e.f;
	Jn = null, Yn = 0, Xn = null, Hn = l & 96 ? null : e, Kn = null, Ve(e.ctx), Un = !1, er = ++$n, e.ac !== null && (at(() => {
		e.ac.abort(le);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = F?.is_fork;
		if (Jn !== null) {
			var m;
			if (p || sr(e, Yn), f !== null && Yn > 0) for (f.length = Yn + Jn.length, m = 0; m < Jn.length; m++) f[Yn + m] = Jn[m];
			else e.deps = f = Jn;
			if (_n() && e.f & 512) for (m = Yn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Yn < f.length && (sr(e, Yn), f.length = Yn);
		if (He() && Xn !== null && !Un && f !== null && !(e.f & 6146)) for (m = 0; m < Xn.length; m++) ir(Xn[m], e);
		if (i !== null && i !== e) {
			if ($n++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = $n;
			if (t !== null) for (let e of t) e.rv = $n;
			Xn !== null && (r === null ? r = Xn : r.push(...Xn));
		}
		return e.f & 8388608 && (e.f ^= ee), d;
	} catch (e) {
		return qe(e);
	} finally {
		e.f ^= E, Jn = t, Yn = n, Xn = r, Hn = i, Kn = a, Ve(o), Un = s, er = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== we && Ze(s), s.ac !== null && at(() => {
			s.ac.abort(le), s.ac = null, Xe(s, h);
		}), St(s), sr(s, 0);
	}
}
function sr(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) or(e, n[r]);
}
function cr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Xe(e, m);
		var n = V, r = zn;
		V = e, zn = !(t & 96);
		try {
			t & 16777232 ? kn(e) : On(e), Dn(e);
			var i = ar(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Qn;
		} finally {
			zn = r, V = n;
		}
	}
}
async function lr() {
	await Promise.resolve(), Ft();
}
function H(e) {
	var t = !!(e.f & 2);
	if (Rn?.add(e), Hn !== null && !Un && !(V !== null && V.f & 16384) && (Kn === null || !Kn.has(e))) {
		var r = Hn.deps;
		if (Hn.f & 2097152) e.rv < $n && (e.rv = $n, Jn === null && r !== null && r[Yn] === e ? Yn++ : Jn === null ? Jn = [e] : Jn.push(e));
		else {
			Hn.deps ??= [], n.call(Hn.deps, e) || Hn.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [Hn] : n.call(i, Hn) || i.push(Hn);
		}
	}
	if (Bn && Ut.has(e)) return Ut.get(e);
	if (t) {
		var a = e;
		if (Bn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || dr(a)) && (o = bt(a)), Ut.set(a, o), o;
		}
		var s = !(a.f & 512) && !Un && Hn !== null && (zn || !!(Hn.f & 512)), c = (a.f & y) === 0;
		rr(a) && (s && (a.f |= 512), xt(a)), s && !c && (Ct(a), ur(a));
	}
	if (Et?.has(e)) return Et.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function ur(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (Ct(t), ur(t));
}
function dr(e) {
	if (e.v === we) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Ut.has(t) || t.f & 2 && dr(t)) return !0;
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
		if (te in e) mr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && te in n && mr(n);
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
		if (r.capture || wr.call(t, e), !e.cancelBubble) return at(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ge(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function xr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = br(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && vn(() => {
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
		var d = Hn, f = V;
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
	var t = fn("template");
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
		if (O) return Or(k, null), k;
		i === void 0 && (i = Dr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ sn(i)));
		var t = r || tn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ sn(t), s = t.lastChild;
			Or(o, s);
		} else Or(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function kr(e, t, n = "svg") {
	var r = !e.startsWith("<!>"), i = !!(t & 1), a = `<${n}>${r ? e : "<!>" + e}</${n}>`, o;
	return () => {
		if (O) return Or(k, null), k;
		if (!o) {
			var e = /* @__PURE__ */ sn(Dr(a));
			if (i) for (o = document.createDocumentFragment(); /* @__PURE__ */ sn(e);) o.appendChild(/* @__PURE__ */ sn(e));
			else o = /* @__PURE__ */ sn(e);
		}
		var t = o.cloneNode(!0);
		if (i) {
			var n = /* @__PURE__ */ sn(t), r = t.lastChild;
			Or(n, r);
		} else Or(t, t);
		return t;
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ar(e, t) {
	return /* @__PURE__ */ kr(e, t, "svg");
}
function jr(e = "") {
	if (!O) {
		var t = on(e + "");
		return Or(t, t), t;
	}
	var n = k;
	return n.nodeType === 3 ? pn(n) : (n.before(n = on()), Ne(n)), Or(n, n), n;
}
function Mr() {
	if (O) return Or(k, null), k;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = on();
	return e.append(t, n), Or(t, n), e;
}
function G(e, t) {
	if (O) {
		var n = V;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = k), Pe();
		return;
	}
	e !== null && e.before(t);
}
function K(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[se] ??= e.nodeValue) && (e[se] = n, e.nodeValue = `${n}`);
}
function Nr(e, t) {
	return Fr(e, t);
}
var Pr = /* @__PURE__ */ new Map();
function Fr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	an();
	var l = void 0, u = xn(() => {
		var s = n ?? t.appendChild(on());
		lt(s, { pending: () => {} }, (t) => {
			M({});
			var n = Be;
			if (o && (n.c = o), a && (i.$$events = a), O && Or(t, null), l = e(t, i) || {}, O && (V.nodes.end = k, k === null || k.nodeType !== 8 || k.data !== "]")) throw ke(), Ce;
			N();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = gr(r);
					for (let e of [t, document]) {
						var a = Pr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Pr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, wr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(vr)), yr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Pr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, wr), r.delete(e), r.size === 0 && Pr.delete(n)) : r.set(e, i);
			}
			yr.delete(d), s !== n && s.parentNode?.removeChild(s);
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
						Ln(r, t), t.append(on()), this.#n.set(e, {
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
		var n = F, r = dn();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = on();
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
function q(e, t, n = !1) {
	var r;
	O && (r = k, Pe());
	var i = new Rr(e), a = n ? x : 0;
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
//#region node_modules/svelte/src/internal/client/dom/blocks/key.js
var zr = Symbol("NaN");
function Br(e, t, n) {
	O && Pe();
	var r = new Rr(e), i = !He();
	Tn(() => {
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
		Nn(n, () => {
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
			un(d), d.append(u), e.items.clear();
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
		r?.has(a) ? (a.f |= w, Ln(a, document.createDocumentFragment())) : An(t[i], n);
	}
}
var Wr;
function Gr(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = O ? Ne(/* @__PURE__ */ sn(u)) : u.appendChild(on());
	}
	O && Pe();
	var d = null, f = /* @__PURE__ */ vt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, qr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Yr(d, null, c)) : Fn(d) : Nn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Tn(() => {
			p = H(f);
			var e = p.length;
			let t = !1;
			O && Ie(c) === "[!" != (e === 0) && (c = Fe(), Ne(c), Me(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = F, v = dn(), y = 0; y < e; y += 1) {
				O && k.nodeType === 8 && k.data === "]" && (c = k, t = !0, Me(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && qt(S.v, b), S.i && qt(S.i, y), v && u.unskip_effect(S.e)) : (S = Jr(l, h ? c : Wr ??= on(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = En(() => s(c)) : (d = En(() => s(Wr ??= on())), d.f |= w)), e > r.size && pe("", "", ""), O && e > 0 && Ne(Fe()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Me(!0), H(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, O && (c = k);
}
function Kr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function qr(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Kr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Fn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Yr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), Xr(e, d, _), Xr(e, _, y), Yr(_, y, n), d = _, p = [], m = [], l = Kr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Yr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					Xr(e, S.prev, C.next), Xr(e, d, S), Xr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Yr(_, l, n), Xr(e, _.prev, _.next), Xr(e, _, d === null ? e.effect.first : d.next), Xr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Kr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Kr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Ur(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Kr(l.next);
		var E = T.length;
		if (E > 0) {
			var D = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Hr(e, T, D);
		}
	}
	o && Ge(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Jr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Gt(n) : /* @__PURE__ */ Kt(n, !1, !1) : null, l = o & 2 ? Gt(i) : null;
	return {
		v: c,
		i: l,
		e: En(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Yr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ cn(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function Xr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
function Zr(e, t, n = !1, r = !1, i = !1, a = !1) {
	var o = e, s = "";
	if (n) {
		var c = e;
		O && (o = Ne(/* @__PURE__ */ sn(c)));
	}
	B(() => {
		var e = V;
		if (s === (s = t() ?? "")) {
			O && Pe();
			return;
		}
		if (n && !O) {
			e.nodes = null, c.innerHTML = s, s !== "" && Or(/* @__PURE__ */ sn(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (jn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (O) {
				for (var a = k.data, l = Pe(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ cn(l);
				if (l === null) throw ke(), Ce;
				Or(k, u), o = Ne(l);
				return;
			}
			var d = fn(r ? "svg" : i ? "math" : "template", r ? Ee : i ? De : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Or(/* @__PURE__ */ sn(f), f.lastChild), r || i) for (; /* @__PURE__ */ sn(f);) o.before(/* @__PURE__ */ sn(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function Qr(e, t, ...n) {
	var r = new Rr(e);
	Tn(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, x);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/actions.js
function $r(e, t, n) {
	Sn(() => {
		var r = fr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			wn(() => {
				var e = n();
				pr(e), i && Re(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function ei(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = ei(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function ti() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = ei(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function ni(e) {
	return typeof e == "object" ? ti(e) : e ?? "";
}
var ri = [..." 	\n\r\f\xA0\v﻿"];
function ii(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || ri.includes(r[o - 1])) && (s === r.length || ri.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function ai(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function oi(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function si(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(oi)), i && c.push(...Object.keys(i).map(oi));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = oi(e.substring(l, u).trim());
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
		return r && (n += ai(r)), i && (n += ai(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function J(e, t, n, r, i, a) {
	var o = e[ae];
	if (O || o !== n || o === void 0) {
		var s = ii(n, r, a);
		(!O || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[ae] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function ci(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function li(e, t, n, r) {
	var i = e[oe];
	if (O || i !== t) {
		var a = si(t, r);
		(!O || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[oe] = t;
	} else r && (Array.isArray(r) ? (ci(e, n?.[0], r[0]), ci(e, n?.[1], r[1], "important")) : ci(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ui(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Ae();
		for (var i of t.options) i.selected = n.includes(pi(i));
		return;
	}
	for (i of t.options) if ($t(pi(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function di(e) {
	var t = new MutationObserver(() => {
		"__value" in e && ui(e, e.__value);
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
function fi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	ot(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), pi);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && pi(o);
		}
		n(a), e.__value = a, F !== null && r.add(F);
	}), Sn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = F;
			if (r.has(o)) return;
		}
		if (ui(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = pi(s), n(a));
		}
		e.__value = a, i = !1;
	}), di(e);
}
function pi(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var mi = Symbol("is custom element"), hi = Symbol("is html"), gi = ue ? "link" : "LINK", _i = ue ? "progress" : "PROGRESS";
function vi(e) {
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
		e[ce] = n, Ge(n), it();
	}
}
function yi(e, t) {
	var n = xi(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === _i) && (e.value = t ?? "");
}
function bi(e, t) {
	var n = xi(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Y(e, t, n, r) {
	var i = xi(e);
	O && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === gi) || i[t] !== (i[t] = n) && (t === "loading" && (e[re] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && Ci(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function xi(e) {
	return e[ie] ??= {
		[mi]: e.nodeName.includes("-"),
		[hi]: e.namespaceURI === Te
	};
}
var Si = /* @__PURE__ */ new Map();
function Ci(e) {
	var t = e.getAttribute("is") || e.nodeName, n = Si.get(t);
	if (n) return n;
	Si.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function wi(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	ot(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = Ei(e) ? Di(a) : a, n(a), F !== null && r.add(F), await lr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (O && e.defaultValue !== e.value || fr(t) == null && e.value) && (n(Ei(e) ? Di(e.value) : e.value), F !== null && r.add(F)), wn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = F;
			if (r.has(i)) return;
		}
		Ei(e) && n === Di(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function Ti(e, t, n = t) {
	ot(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (O && e.defaultChecked !== e.checked || fr(t) == null) && n(e.checked), wn(() => {
		e.checked = !!t();
	});
}
function Ei(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function Di(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Oi(e, t) {
	return e === t || e?.[te] === t;
}
function ki(e = {}, t, n, r) {
	var i = Be.r, a = V;
	return Sn(() => {
		var o, s;
		return wn(() => {
			o = s, s = r?.() || [], fr(() => {
				Oi(n(...s), e) || (t(e, ...s), o && Oi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && Oi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function Ai(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ ht(r), H(u)) : (l && (l = !1, c = s ? fr(r) : r), c);
	let f;
	if (o) {
		var p = te in e || ne in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = tt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ve(t), f(m)));
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
	var v = !1, y = (n & 1 ? ht : vt)(() => (v = !1, g()));
	o && H(y);
	var b = V;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? H(y) : i && o ? Zt(e) : e;
			return L(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : H(y);
	});
}
function ji(e) {
	Be === null && de("onMount"), yn(() => {
		let t = fr(e);
		if (typeof t == "function") return t;
	});
}
function Mi(e) {
	Be === null && de("onDestroy"), ji(() => () => fr(e));
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/components/Icon.svelte
var Ni = /* @__PURE__ */ W("<i></i>");
function X(e, t) {
	let n = Ai(t, "className", 3, "");
	var r = Ni();
	B(() => {
		Y(r, "data-lucide", t.name), J(r, 1, ni(n()));
	}), G(e, r);
}
//#endregion
//#region src/components/StatusPresentation.svelte
var Pi = /* @__PURE__ */ W("<span><!></span>"), Fi = /* @__PURE__ */ W("<span data-component-owner=\"status-presentation\" aria-hidden=\"true\"></span>");
function Ii(e, t) {
	M(t, !0);
	let n = Ai(t, "className", 3, "");
	var r = Mr(), i = ln(r), a = (e) => {
		var r = Fi();
		Gr(r, 21, () => t.status.statuses, (e) => e.key, (e, t) => {
			var n = Pi();
			X(R(n), {
				get name() {
					return H(t).iconName;
				},
				className: "task-status-icon"
			}), A(n), B(() => J(n, 1, `task-status-indicator ${H(t).className} ${H(t).recentOutput ? "task-status-fresh" : ""}`)), G(e, n);
		}), A(r), B(() => J(r, 1, `task-status-slot ${n()} ${t.status.slotClassName}`)), G(e, r);
	};
	q(i, (e) => {
		t.status.hasTaskState && e(a);
	}), G(e, r), N();
}
//#endregion
//#region src/components/AttentionList.svelte
var Li = /* @__PURE__ */ W("<div class=\"activity-row empty-attention\"><!><div><strong>No activity</strong><span>Follow a resource or start a turn.</span></div></div>"), Ri = /* @__PURE__ */ W("<span role=\"button\" tabindex=\"0\"><!></span>"), zi = /* @__PURE__ */ W("<span class=\"attention-dismiss\" role=\"button\" tabindex=\"0\" title=\"Dismiss\"><!></span>"), Bi = /* @__PURE__ */ W("<button type=\"button\"><span class=\"activity-status\" aria-hidden=\"true\"><span class=\"activity-status-fallback-slot\"><!></span> <span class=\"activity-status-runtime-slot\"><!></span></span> <span class=\"activity-title\"><strong> </strong><span class=\"activity-meta\"> </span></span> <span class=\"activity-badge\"> </span> <span class=\"activity-actions\"><!> <!></span></button>"), Vi = /* @__PURE__ */ W("<section class=\"attention-section\" data-component-owner=\"attention-list\"><div class=\"section-title\"><span>Activity</span></div> <nav class=\"attention-list\" aria-label=\"Activity list\"><!></nav></section>");
function Hi(e, t) {
	M(t, !0);
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
	var d = Vi(), f = z(R(d), 2), p = R(f), m = (e) => {
		var t = Li();
		X(R(t), { name: "message-square" }), j(), A(t), G(e, t);
	}, h = (e) => {
		var d = Mr();
		Gr(ln(d), 17, () => t.items, (e) => e.id, (e, t) => {
			var d = Bi(), f = R(d), p = R(f), m = R(p);
			{
				let e = /* @__PURE__ */ P(() => r(H(t)));
				X(m, {
					get name() {
						return H(e);
					},
					className: "activity-status-fallback"
				});
			}
			A(p);
			var h = z(p, 2);
			Ii(R(h), {
				get status() {
					return H(t).status;
				},
				className: "activity-status-icon"
			}), A(h), A(f);
			var g = z(f, 2), _ = R(g), v = R(_, !0);
			A(_);
			var y = z(_), b = R(y, !0);
			A(y), A(g);
			var x = z(g, 2), S = R(x, !0);
			A(x);
			var C = z(x, 2), w = R(C), T = (e) => {
				var n = Ri();
				let r;
				X(R(n), { name: "star" }), A(n), B(() => {
					r = J(n, 1, "attention-star", null, r, { followed: H(t).followed }), Y(n, "aria-label", H(t).followed ? `Unfollow ${H(t).title}` : `Follow ${H(t).title}`), Y(n, "title", H(t).followed ? "Unfollow" : "Follow");
				}), U("click", n, (e) => c(e, H(t))), U("keydown", n, (e) => u(e, (e) => c(e, H(t)))), G(e, n);
			}, E = /* @__PURE__ */ P(() => a(H(t)));
			q(w, (e) => {
				H(E) && e(T);
			});
			var D = z(w, 2), ee = (e) => {
				var n = zi();
				X(R(n), { name: "x" }), A(n), B(() => Y(n, "aria-label", `Dismiss ${H(t).title}`)), U("click", n, (e) => l(e, H(t))), U("keydown", n, (e) => u(e, (e) => l(e, H(t)))), G(e, n);
			};
			q(D, (e) => {
				H(t).activeTurn || e(ee);
			}), A(C), A(d), B((e, n, r, i) => {
				J(d, 1, e), Y(d, "aria-current", H(t).selected ? "page" : void 0), Y(d, "data-active-turn", H(t).activeTurn || void 0), Y(d, "aria-label", n), Y(d, "title", H(t).statusLabel || void 0), Y(p, "hidden", H(t).status.hasTaskState), Y(h, "hidden", !H(t).status.hasTaskState), K(v, H(t).title), K(b, r), K(S, i);
			}, [
				() => `activity-row ${n(H(t).status)} ${H(t).selected ? "selected" : ""}`,
				() => `${H(t).title}. ${o(H(t))}`,
				() => o(H(t)),
				() => i(H(t))
			]), U("click", d, () => s(H(t))), G(e, d);
		}), G(e, d);
	};
	q(p, (e) => {
		t.items.length === 0 ? e(m) : e(h, -1);
	}), A(f), A(d), G(e, d), N();
}
Sr(["click", "keydown"]);
//#endregion
//#region src/components/MobileToolbar.svelte
var Ui = /* @__PURE__ */ W("<header class=\"mobile-toolbar\" data-component-owner=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" type=\"button\" aria-label=\"Toggle immersive chat\"><span class=\"mobile-immersive-icon mobile-immersive-icon-collapse\"><!></span><span class=\"mobile-immersive-icon mobile-immersive-icon-expand\"><!></span></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" data-component-owner=\"mobile-toolbar\" type=\"button\" aria-label=\"Close navigation\"></button>", 1);
function Wi(e, t) {
	M(t, !0);
	var n = Ui(), r = ln(n), i = R(r);
	X(R(i), { name: "menu" }), A(i);
	var a = z(i, 2), o = R(a), s = z(o, 2);
	A(a);
	var c = z(a, 2);
	let l;
	var u = R(c);
	X(R(u), { name: "minimize-2" }), A(u);
	var d = z(u);
	X(R(d), { name: "maximize-2" }), A(d), A(c), A(r);
	var f = z(r, 2);
	B(() => {
		Y(i, "aria-expanded", t.sidebarOpen), Y(o, "aria-selected", t.view === "details"), Y(s, "aria-selected", t.view === "chat"), l = J(c, 1, "mobile-icon-button mobile-immersive-button", null, l, { immersive: t.immersive }), Y(c, "aria-pressed", t.immersive);
	}), U("click", i, () => t.onSidebar(!t.sidebarOpen)), U("click", o, () => t.onView("details")), U("click", s, () => t.onView("chat")), U("click", c, () => t.onImmersive(!t.immersive)), U("click", f, () => t.onSidebar(!1)), G(e, n), N();
}
Sr(["click"]);
//#endregion
//#region src/components/PaneResizeHandle.svelte
var Gi = /* @__PURE__ */ W("<div data-component-owner=\"pane-resize-handle\" role=\"separator\"></div>");
function Ki(e, t) {
	M(t, !0);
	let n = null;
	Mi(() => n?.());
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
	var i = Gi();
	B(() => {
		Y(i, "id", t.id), J(i, 1, `resize-handle ${t.className}`), Y(i, "aria-orientation", t.kind === "sidebarAttentionHeight" ? "horizontal" : "vertical"), Y(i, "aria-label", t.label);
	}), U("pointerdown", i, r), G(e, i), N();
}
Sr(["pointerdown"]);
//#endregion
//#region src/components/ProjectTree.svelte
var qi = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), Ji = /* @__PURE__ */ W("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Yi = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Xi = /* @__PURE__ */ W("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), Zi = /* @__PURE__ */ W("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Qi = /* @__PURE__ */ W("<div class=\"task-group\"></div>"), $i = /* @__PURE__ */ W("<button type=\"button\"><span><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span role=\"checkbox\" tabindex=\"0\"><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), ea = /* @__PURE__ */ W("<section class=\"tree-section\" data-component-owner=\"project-tree\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section>");
function ta(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(null), r = /* @__PURE__ */ I(null), i = /* @__PURE__ */ I(Zt(t.identity));
	yn(() => {
		t.identity !== H(i) && (L(i, t.identity, !0), d());
	}), Mi(d);
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
		e.stopPropagation(), L(n, i, !0), L(r, null), t.onDragState(i), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", i.id));
	}
	function l(e, t) {
		if (!s(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		L(r, {
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
		H(n) && t.onDragState(null), L(n, null), L(r, null);
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
	var h = ea(), g = R(h), _ = z(R(g));
	X(R(_), { name: "plus" }), A(_), A(g);
	var v = z(g, 2), y = R(v), b = (e) => {
		var t = qi();
		X(R(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), j(2), A(t), G(e, t);
	}, x = (e) => {
		var n = Ji(), r = R(n);
		X(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = z(r, 2), a = R(i, !0);
		A(i), A(n), B(() => K(a, t.error)), G(e, n);
	}, S = (e) => {
		var t = Yi();
		X(R(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), j(2), A(t), G(e, t);
	}, C = (e) => {
		var r = Mr();
		Gr(ln(r), 17, () => t.projects, (e) => e.id, (e, t) => {
			var r = $i(), i = ln(r), s = R(i);
			let h;
			var g = R(s), _ = (e) => {
				X(e, { name: "chevron-right" });
			};
			q(g, (e) => {
				H(t).children.length && e(_);
			}), A(s);
			var v = z(s, 2);
			Ii(v, { get status() {
				return H(t).status;
			} });
			var y = z(v, 2);
			X(y, {
				name: "folder",
				className: "tree-icon"
			});
			var b = z(y, 2), x = R(b), S = R(x, !0);
			A(x);
			var C = z(x), w = R(C, !0);
			A(C);
			var T = z(C), E = (e) => {
				var n = Xi(), r = R(n), i = R(r, !0);
				A(r);
				var a = z(r, 2), o = R(a, !0);
				A(a), A(n), B(() => {
					K(i, H(t).summary.taskLabel), K(o, H(t).summary.runningLabel);
				}), G(e, n);
			};
			q(T, (e) => {
				H(t).summary && !H(t).expanded && e(E);
			}), A(b);
			var D = z(b, 2);
			let ee;
			X(R(D), { name: "star" }), A(D);
			var te = z(D, 2);
			X(R(te), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), A(te), A(i);
			var ne = z(i, 2), re = (e) => {
				var r = Qi();
				Gr(r, 21, () => H(t).children, (e) => e.id, (e, r) => {
					var i = Zi(), s = z(R(i), 2);
					Ii(s, { get status() {
						return H(r).status;
					} });
					var h = z(s, 2);
					X(h, {
						name: "file-text",
						className: "tree-icon"
					});
					var g = z(h), _ = R(g), v = R(_, !0);
					A(_);
					var y = z(_), b = R(y, !0);
					A(y), A(g);
					var x = z(g, 2);
					let S;
					X(R(x), { name: "star" }), A(x);
					var C = z(x, 2);
					X(R(C), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), A(C), A(i), B((e) => {
						J(i, 1, e), Y(i, "aria-label", H(r).ariaLabel || void 0), Y(i, "title", H(r).statusLabel || void 0), K(v, H(r).title), K(b, H(r).ref), S = J(x, 1, "attention-star", null, S, { followed: H(r).followed }), Y(x, "aria-checked", H(r).followed), Y(x, "aria-label", H(r).followed ? `Unfollow ${H(r).title}` : `Follow ${H(r).title}`), Y(x, "title", H(r).followed ? "Unfollow" : "Follow");
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
				}), A(r), G(e, r);
			};
			q(ne, (e) => {
				H(t).expanded && e(re);
			}), B((e) => {
				J(i, 1, e), Y(i, "aria-label", H(t).ariaLabel || void 0), Y(i, "title", H(t).statusLabel || void 0), h = J(s, 1, "chevron", null, h, { expanded: H(t).expanded }), Y(s, "data-project-toggle", H(t).children.length ? H(t).id : void 0), K(S, H(t).title), K(w, H(t).ref), ee = J(D, 1, "attention-star", null, ee, { followed: H(t).followed }), Y(D, "aria-checked", H(t).followed), Y(D, "aria-label", H(t).followed ? `Unfollow ${H(t).title}` : `Follow ${H(t).title}`), Y(D, "title", H(t).followed ? "Unfollow" : "Follow");
			}, [() => `tree-item ${a(H(t).status)} ${H(t).active ? "active" : ""} ${H(n)?.id === H(t).id ? "drag-source" : ""} ${o(H(t).id)}`]), U("click", i, (e) => f(e, H(t))), xr("dragover", i, (e) => l(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), xr("drop", i, (e) => u(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), U("click", D, (e) => p(e, H(t))), U("keydown", D, (e) => m(e, H(t))), xr("dragstart", te, (e) => c(e, {
				kind: "project",
				id: H(t).id,
				projectId: ""
			})), xr("dragend", te, d), G(e, r);
		}), G(e, r);
	};
	q(y, (e) => {
		t.loading ? e(b) : t.error ? e(x, 1) : t.projects.length === 0 ? e(S, 2) : e(C, -1);
	}), A(v), A(h), B(() => Y(v, "data-navigation-identity", t.identity)), U("click", _, function(...e) {
		t.onCreate?.apply(this, e);
	}), G(e, h), N();
}
Sr(["click", "keydown"]);
//#endregion
//#region src/components/SchedulerNav.svelte
var na = /* @__PURE__ */ W("<section class=\"scheduler-nav\" data-component-owner=\"scheduler-nav\"><button type=\"button\"><!> <!> <span><strong>Scheduler</strong><small>Natural-language schedules</small></span> <!></button></section>");
function ra(e, t) {
	M(t, !0);
	async function n() {
		if (t.item) try {
			await t.onSelect(t.item.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var r = na(), i = R(r);
	let a;
	var o = R(i), s = (e) => {
		Ii(e, { get status() {
			return t.item.status;
		} });
	};
	q(o, (e) => {
		t.item && e(s);
	});
	var c = z(o, 2);
	X(c, {
		name: "clock-3",
		className: "scheduler-nav-icon"
	}), X(z(c, 4), {
		name: "chevron-right",
		className: "scheduler-nav-chevron"
	}), A(i), A(r), B(() => {
		i.disabled = !t.item, Y(i, "title", t.item?.statusLabel || "Workspace Scheduler"), a = J(i, 1, "", null, a, { active: t.item?.active });
	}), U("click", i, n), G(e, r), N();
}
Sr(["click"]);
//#endregion
//#region src/components/WorkspaceSwitcher.svelte
var ia = /* @__PURE__ */ W("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), aa = /* @__PURE__ */ W("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), oa = /* @__PURE__ */ W("<section class=\"workspace-switcher\" data-component-owner=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <span class=\"workspace-switcher-icon workspace-switcher-icon-idle\"><!></span><span class=\"workspace-switcher-icon workspace-switcher-icon-busy\"><!></span></button> <!></div></section>");
function sa(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(!1), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(Zt(t.identity)), a = /* @__PURE__ */ P(() => t.workspaces.find((e) => e.id === t.activeWorkspaceId) ?? null);
	yn(() => {
		t.identity !== H(i) && (L(i, t.identity, !0), L(n, !1), L(r, ""));
	}), ji(() => {
		let e = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			H(n) && !t?.closest(".workspace-select-row") && L(n, !1);
		}, r = (e) => {
			e.key === "Escape" && !t.mobileSidebarOpen && L(n, !1);
		};
		return document.addEventListener("mousedown", e), document.addEventListener("keydown", r), () => {
			document.removeEventListener("mousedown", e), document.removeEventListener("keydown", r);
		};
	});
	async function o(e) {
		if (!(!e || H(r))) {
			L(r, e, !0), L(n, !1);
			try {
				await t.onSwitch(e);
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				L(r, "");
			}
		}
	}
	var s = oa(), c = R(s), l = R(c);
	let u;
	var d = R(l), f = R(d);
	A(d);
	var p = z(d, 2), m = R(p, !0);
	A(p);
	var h = z(p, 2);
	X(R(h), {
		name: "chevrons-up-down",
		className: "select-icon"
	}), A(h);
	var g = z(h);
	X(R(g), {
		name: "loader-circle",
		className: "select-icon"
	}), A(g), A(l);
	var _ = z(l, 2), v = (e) => {
		var i = aa(), a = z(R(i), 2);
		Gr(a, 17, () => t.workspaces, (e) => e.id, (e, n) => {
			var i = ia(), a = R(i), s = R(a);
			A(a);
			var c = z(a, 2), l = R(c), u = R(l, !0);
			A(l);
			var d = z(l), f = R(d, !0);
			A(d), A(c);
			var p = z(c, 2), m = (e) => {
				X(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			q(p, (e) => {
				H(n).id === t.activeWorkspaceId && e(m);
			}), A(i), B((e) => {
				Y(i, "aria-selected", H(n).id === t.activeWorkspaceId), Y(i, "data-workspace-id", H(n).id), i.disabled = e, Y(s, "src", H(n).iconSrc), K(u, H(n).name || H(n).id), K(f, H(n).path);
			}, [() => !!H(r)]), U("click", i, () => o(H(n).id)), G(e, i);
		});
		var s = z(a, 2), c = R(s);
		X(R(c), { name: "plus" }), j(), A(c), A(s), A(i), U("click", c, () => {
			L(n, !1), t.onAdd();
		}), G(e, i);
	};
	q(_, (e) => {
		H(n) && e(v);
	}), A(c), A(s), B((e) => {
		u = J(l, 1, "workspace-switcher-button", null, u, e), Y(l, "aria-expanded", H(n)), Y(f, "src", H(a)?.iconSrc || "/favicon.svg"), K(m, H(a)?.name || "Workspace");
	}, [() => ({ busy: !!H(r) })]), U("click", l, (e) => {
		e.stopPropagation(), L(n, !H(n));
	}), G(e, s), N();
}
Sr(["click"]);
//#endregion
//#region src/components/AppShell.svelte
var ca = /* @__PURE__ */ W("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div class=\"tty-panel\"><div id=\"ttyLog\" class=\"tty-log\" data-component-owner=\"event-timeline\"><!></div><div id=\"ttyComposer\" class=\"tty-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div>");
function la(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(Zt(t.channel.current())), r = /* @__PURE__ */ I(0);
	ji(() => {
		let e = t.channel.subscribe((e) => {
			L(n, e, !0), queueMicrotask(e.onIconsChanged);
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
	}), yn(() => {
		document.body.classList.toggle("mobile-sidebar-open", H(n).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", H(n).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", H(n).mobile.immersive);
	}), yn(() => {
		let e = H(n).route;
		!e.path || e.revision <= H(r) || (L(r, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	var i = ca(), a = R(i);
	Wi(a, {
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
	var o = z(a, 2), s = R(o), c = z(R(s)), l = z(R(c)), u = R(l, !0);
	A(l), A(c);
	var d = z(c);
	X(R(d), { name: "settings" }), A(d), A(s);
	var f = z(s, 2);
	sa(f, {
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
	var p = z(f, 2);
	{
		let e = /* @__PURE__ */ P(() => H(n).scheduler || null);
		ra(p, {
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
	var m = z(p, 2);
	ta(m, {
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
	var h = z(m, 2);
	Ki(h, {
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
	}), Hi(z(h, 2), {
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
	}), A(o);
	var g = z(o, 2);
	Ki(g, {
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
	var _ = z(g, 2), v = R(_), y = R(v);
	X(R(y), { name: "menu" }), A(y), A(v);
	var b = z(v, 2), x = R(b), S = R(x), C = z(S, 2);
	A(x), A(b);
	var w = z(b, 2), T = R(w), E = (e) => {
		var n = Mr();
		Qr(ln(n), () => t.details), G(e, n);
	};
	q(T, (e) => {
		t.details && e(E);
	}), A(w);
	var D = z(w, 2);
	Ki(D, {
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
	var ee = z(D, 2), te = R(ee), ne = R(te), re = R(ne), ie = (e) => {
		var n = Mr();
		Qr(ln(n), () => t.timeline), G(e, n);
	};
	q(re, (e) => {
		t.timeline && e(ie);
	}), A(ne);
	var ae = z(ne), oe = R(ae), se = (e) => {
		var n = Mr();
		Qr(ln(n), () => t.composer), G(e, n);
	};
	q(oe, (e) => {
		t.composer && e(se);
	}), A(ae), A(te), A(ee), A(_), A(i), B(() => {
		K(u, H(n).version), Y(y, "aria-expanded", H(n).mobile.sidebarOpen), Y(S, "aria-selected", H(n).mobile.view === "details"), Y(C, "aria-selected", H(n).mobile.view === "chat");
	}), U("click", d, () => {
		H(n).onMobileSidebar(!1), H(n).onOpenSettings();
	}), U("click", y, () => H(n).onMobileSidebar(!0)), U("click", S, () => H(n).onMobileView("details")), U("click", C, () => H(n).onMobileView("chat")), G(e, i), N();
}
Sr(["click"]);
//#endregion
//#region src/components/AgentBindingSelector.svelte
var ua = /* @__PURE__ */ W("<button type=\"button\" class=\"agent-binding-option\" role=\"option\"><span class=\"agent-binding-option-label\"> </span> <!></button>"), da = /* @__PURE__ */ W("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Profiles\"><div class=\"agent-binding-group-title\">Profiles</div> <!></div>"), fa = /* @__PURE__ */ W("<div class=\"agent-binding-group\" role=\"group\" aria-label=\"Agents\"><div class=\"agent-binding-group-title\">Agents</div> <!></div>"), pa = /* @__PURE__ */ W("<div class=\"agent-binding-menu\" role=\"listbox\" tabindex=\"-1\"><!> <!></div>"), ma = /* @__PURE__ */ W("<span class=\"agent-binding\"><button type=\"button\" class=\"agent-binding-button\" aria-haspopup=\"listbox\"><span class=\"agent-binding-label\"> </span> <!></button> <!></span>");
function ha(e, t) {
	M(t, !0);
	let n = Ai(t, "disabled", 3, !1), r = Ai(t, "ariaLabel", 3, "Agent binding"), i = /* @__PURE__ */ P(m), a = /* @__PURE__ */ P(h), o = /* @__PURE__ */ P(() => g(t.value)), s = /* @__PURE__ */ P(() => [...H(i), ...H(a)].find((e) => g(e.value) === H(o))?.label || t.value.name || "Unavailable"), c = /* @__PURE__ */ I(!1), l = /* @__PURE__ */ I(void 0), u = /* @__PURE__ */ I(void 0);
	yn(() => {
		if (!H(c) || !H(u)) return;
		d();
		let e = H(u).querySelector("[aria-selected=\"true\"]") ?? H(u).querySelector(".agent-binding-option");
		lr().then(() => e?.focus());
	}), ji(() => {
		let e = (e) => {
			H(c) && e.target instanceof Node && !H(l)?.contains(e.target) && L(c, !1);
		}, t = () => {
			H(c) && d();
		};
		return document.addEventListener("mousedown", e), window.addEventListener("resize", t), () => {
			document.removeEventListener("mousedown", e), window.removeEventListener("resize", t);
		};
	});
	function d() {
		if (!H(l) || !H(u)) return;
		let e = H(l).getBoundingClientRect().top, t = Math.max(120, Math.floor(e - 14));
		H(u).style.maxHeight = `${t}px`;
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
		L(c, !1), g(e.value) !== H(o) && t.onSelect(e.value);
	}
	function v(e) {
		e.key === "Escape" && (e.stopPropagation(), L(c, !1));
	}
	var y = ma(), b = R(y), x = R(b), S = R(x, !0);
	A(x), X(z(x, 2), {
		name: "chevrons-up-down",
		className: "agent-binding-icon"
	}), A(b);
	var C = z(b, 2), w = (e) => {
		var t = pa(), n = R(t), s = (e) => {
			var t = da();
			Gr(z(R(t), 2), 17, () => H(i), (e) => g(e.value), (e, t) => {
				var n = ua(), r = R(n), i = R(r, !0);
				A(r);
				var a = z(r, 2), s = (e) => {
					X(e, {
						name: "check",
						className: "agent-binding-check"
					});
				}, c = /* @__PURE__ */ P(() => g(H(t).value) === H(o));
				q(a, (e) => {
					H(c) && e(s);
				}), A(n), B((e, r) => {
					Y(n, "aria-selected", e), Y(n, "data-binding", r), K(i, H(t).label);
				}, [() => g(H(t).value) === H(o), () => g(H(t).value)]), U("click", n, () => _(H(t))), G(e, n);
			}), A(t), G(e, t);
		};
		q(n, (e) => {
			H(i).length && e(s);
		});
		var c = z(n, 2), l = (e) => {
			var t = fa();
			Gr(z(R(t), 2), 17, () => H(a), (e) => g(e.value), (e, t) => {
				var n = ua(), r = R(n), i = R(r, !0);
				A(r);
				var a = z(r, 2), s = (e) => {
					X(e, {
						name: "check",
						className: "agent-binding-check"
					});
				}, c = /* @__PURE__ */ P(() => g(H(t).value) === H(o));
				q(a, (e) => {
					H(c) && e(s);
				}), A(n), B((e, r) => {
					Y(n, "aria-selected", e), Y(n, "data-binding", r), K(i, H(t).label);
				}, [() => g(H(t).value) === H(o), () => g(H(t).value)]), U("click", n, () => _(H(t))), G(e, n);
			}), A(t), G(e, t);
		};
		q(c, (e) => {
			H(a).length && e(l);
		}), A(t), ki(t, (e) => L(u, e), () => H(u)), B(() => Y(t, "aria-label", r())), U("keydown", t, v), G(e, t);
	};
	q(C, (e) => {
		H(c) && e(w);
	}), A(y), ki(y, (e) => L(l, e), () => H(l)), B(() => {
		b.disabled = n(), Y(b, "aria-expanded", H(c)), Y(b, "aria-label", r()), K(S, H(s));
	}), U("click", b, () => {
		L(c, !H(c));
	}), G(e, y), N();
}
Sr(["click", "keydown"]);
//#endregion
//#region src/components/ChatComposer.svelte
var ga = /* @__PURE__ */ W("<div class=\"tty-message-item\"><span class=\"tty-message-text\"> </span> <span class=\"tty-message-mode\"> </span> <button type=\"button\" class=\"tty-message-steer\"><!> <span>Insert now</span></button></div>"), _a = /* @__PURE__ */ W("<div class=\"tty-message-queue-error\" role=\"alert\"> </div>"), va = /* @__PURE__ */ W("<section class=\"tty-message-queue\" aria-label=\"Waiting messages\"><div class=\"tty-message-queue-header\"><span>Waiting messages</span><span class=\"tty-message-count\"> </span></div> <div class=\"tty-message-list\"></div> <!></section>"), ya = /* @__PURE__ */ W("<button type=\"button\" id=\"agentEndTurnButton\" title=\"End current turn\" aria-label=\"End current turn\"><span class=\"tty-composer-icon tty-composer-icon-idle\"><!></span><span class=\"tty-composer-icon tty-composer-icon-busy\"><!></span></button>"), ba = /* @__PURE__ */ W("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), xa = /* @__PURE__ */ W("<!> <form id=\"ttyForm\" class=\"tty-input\"><textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <div class=\"tty-composer-bar\"><button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button> <div class=\"tty-composer-options\"><span class=\"tty-agent-binding\"><!></span> <!> <button type=\"submit\"><span class=\"tty-composer-icon tty-composer-icon-idle\"><!></span><span class=\"tty-composer-icon tty-composer-icon-busy\"><!></span></button></div></div></form> <!>", 1);
function Sa(e, t) {
	M(t, !0);
	let n = t.channel.current(), r = /* @__PURE__ */ I(Zt(n)), i = /* @__PURE__ */ I(Zt(n.identity)), a = /* @__PURE__ */ I(Zt(n.draftResetVersion)), o = /* @__PURE__ */ I(Zt(n.draft)), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ I(""), u = /* @__PURE__ */ I(!1), d = /* @__PURE__ */ I(void 0), f = /* @__PURE__ */ P(() => !!H(r).unavailableReason || H(s) || H(r).sending);
	ji(() => t.channel.subscribe((e) => {
		H(r), L(r, e, !0), e.identity === H(i) ? e.draftResetVersion !== H(a) && (L(a, e.draftResetVersion, !0), L(o, e.draft, !0), L(c, "")) : (L(i, e.identity, !0), L(a, e.draftResetVersion, !0), L(o, e.draft, !0), L(s, !1), L(c, ""), L(l, ""), L(u, !1)), queueMicrotask(e.onIconsChanged);
	})), yn(() => {
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
		L(o, e, !0), L(c, ""), H(r).onDraft(e, p());
	}
	async function h(e) {
		e?.preventDefault();
		let t = H(o);
		if (H(f) || !t.trim() || !H(r).workspaceId || !H(r).resourceId) return;
		let n = H(i), a = p();
		L(s, !0), L(c, "");
		try {
			let e = await H(r).onSend(t, a);
			H(i) === n && e.accepted && e.clear && H(o) === t && m("");
		} catch (e) {
			H(i) === n && L(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(i) === n && (L(s, !1), await lr(), H(d)?.focus({ preventScroll: !0 }));
		}
	}
	async function g(e) {
		if (!(!H(r).canSteerWaiting || H(r).steeringMessageId)) {
			L(l, "");
			try {
				await H(r).onSteerWaiting(e);
			} catch (e) {
				L(l, e instanceof Error ? e.message : String(e), !0);
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
				L(u, !0);
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
	var b = xa(), x = ln(b), S = (e) => {
		var t = va(), n = R(t), i = z(R(n)), a = R(i, !0);
		A(i), A(n);
		var o = z(n, 2);
		Gr(o, 21, () => H(r).waitingMessages, (e) => e.messageId, (e, t) => {
			var n = ga(), i = R(n), a = R(i, !0);
			A(i);
			var o = z(i, 2), s = R(o, !0);
			A(o);
			var c = z(o, 2), l = R(c), u = (e) => {
				X(e, { name: "loader-circle" });
			}, d = (e) => {
				X(e, { name: "corner-up-left" });
			};
			q(l, (e) => {
				H(r).steeringMessageId === H(t).messageId ? e(u) : e(d, -1);
			}), j(2), A(c), A(n), B((e) => {
				Y(n, "data-message-id", H(t).messageId), Y(i, "title", H(t).text), K(a, H(t).text), K(s, H(t).actualMode || H(t).requestedMode), c.disabled = e, Y(c, "title", H(r).canSteerWaiting ? "Insert this waiting message into the current turn" : "Available when the current turn supports steer"), Y(c, "aria-label", `Insert waiting message into current turn: ${H(t).text}`);
			}, [() => !H(r).canSteerWaiting || !!H(r).steeringMessageId]), U("click", c, () => g(H(t).messageId)), G(e, n);
		}), A(o);
		var s = z(o, 2), c = (e) => {
			var t = _a(), n = R(t, !0);
			A(t), B(() => K(n, H(l))), G(e, t);
		};
		q(s, (e) => {
			H(l) && e(c);
		}), A(t), B(() => K(a, H(r).waitingMessages.length)), G(e, t);
	};
	q(x, (e) => {
		H(r).waitingMessages.length && e(S);
	});
	var C = z(x, 2), w = R(C);
	nt(w), ki(w, (e) => L(d, e), () => H(d));
	var T = z(w, 2), E = R(T);
	X(R(E), { name: "plus" }), A(E);
	var D = z(E, 2), ee = R(D), te = R(ee);
	{
		let e = /* @__PURE__ */ P(() => H(f) || H(r).bindingSaving);
		ha(te, {
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
	A(ee);
	var ne = z(ee, 2), re = (e) => {
		var t = ya();
		let n;
		var i = R(t);
		X(R(i), { name: "pause" }), A(i);
		var a = z(i);
		X(R(a), { name: "loader-circle" }), A(a), A(t), B(() => {
			n = J(t, 1, "tty-composer-action tty-end-turn-button", null, n, { busy: H(r).endingTurn }), t.disabled = H(r).endingTurn;
		}), U("click", t, function(...e) {
			H(r).onEndTurn?.apply(this, e);
		}), G(e, t);
	};
	q(ne, (e) => {
		H(r).canEndTurn && e(re);
	});
	var ie = z(ne, 2);
	let ae;
	var oe = R(ie);
	X(R(oe), { name: "send" }), A(oe);
	var se = z(oe);
	X(R(se), { name: "loader-circle" }), A(se), A(ie), A(D), A(T), A(C);
	var ce = z(C, 2), le = (e) => {
		var t = ba(), n = R(t), r = R(n, !0);
		A(n);
		var i = z(n);
		A(t), B(() => {
			K(r, H(c)), i.disabled = H(s);
		}), U("click", i, () => h()), G(e, t);
	};
	q(ce, (e) => {
		H(c) && e(le);
	}), B((e) => {
		Y(w, "data-agent-draft-key", H(r).draftKey), Y(w, "placeholder", H(r).unavailableReason || "Message this resource"), w.disabled = H(f), yi(w, H(o)), E.disabled = e, ae = J(ie, 1, "tty-send-button", null, ae, { busy: H(s) }), Y(ie, "title", H(s) ? "Sending..." : H(r).unavailableReason || "Send input"), Y(ie, "aria-label", H(s) ? "Sending..." : H(r).unavailableReason || "Send input"), ie.disabled = H(f);
	}, [() => !!H(r).unavailableReason]), xr("submit", C, h), U("input", w, (e) => m(e.currentTarget.value)), U("keydown", w, _), U("click", E, function(...e) {
		H(r).onOpenUpload?.apply(this, e);
	}), G(e, b), N();
}
Sr([
	"click",
	"input",
	"keydown"
]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var Ca = /* @__PURE__ */ W("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function wa(e, t) {
	M(t, !0);
	let n = Ai(t, "draft", 7);
	var r = Ca(), i = R(r);
	nt(i);
	var a = z(i, 2);
	vi(a), A(r), B(() => {
		yi(i, n().description), yi(a, n().slug);
	}), U("input", i, (e) => n().description = e.currentTarget.value), U("input", a, (e) => n().slug = e.currentTarget.value), G(e, r), N();
}
Sr(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var Ta = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\"> </button>"), Ea = /* @__PURE__ */ W("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), Da = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Updating preview...</p>"), Oa = /* @__PURE__ */ W("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), ka = /* @__PURE__ */ W("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Aa = /* @__PURE__ */ W("<small> </small>"), ja = /* @__PURE__ */ W("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), Ma = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), Na = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Pa = /* @__PURE__ */ W("<!> <!> <!>", 1), Fa = /* @__PURE__ */ W("<p class=\"create-task-blank-detail\"> </p>"), Ia = /* @__PURE__ */ W("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), La = /* @__PURE__ */ W("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), Ra = /* @__PURE__ */ W("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function za(e, t) {
	M(t, !0);
	let n = Ai(t, "draft", 7), r = /* @__PURE__ */ I(Zt(n().editedMarkdown ?? "")), i = null, a = /* @__PURE__ */ P(() => !!t.preview && H(r) !== t.preview?.markdown);
	yn(() => {
		let e = t.preview?.markdown ?? null;
		if (e === i) return;
		let a = n().editedMarkdown == null || n().editedMarkdown === i;
		i = e, a && (L(r, e ?? "", !0), n().editedMarkdown = e);
	});
	function o(e) {
		L(r, e, !0), n().editedMarkdown = e;
	}
	function s() {
		L(r, t.preview?.markdown ?? "", !0), n().editedMarkdown = t.preview?.markdown ?? null;
	}
	var c = Ra(), l = R(c), u = z(R(l), 2), d = (e) => {
		var n = Ta(), r = R(n, !0);
		A(n), B(() => {
			n.disabled = t.previewing || t.submitting, K(r, t.previewing ? "Rendering..." : "Refresh");
		}), U("click", n, function(...e) {
			t.onRefresh?.apply(this, e);
		}), G(e, n);
	};
	q(u, (e) => {
		t.selectedTemplate && e(d);
	}), A(l);
	var f = z(l, 2), p = (e) => {
		var i = Pa(), c = ln(i), l = (e) => {
			var n = Ea(), r = R(n, !0);
			A(n), B(() => K(r, t.previewError)), G(e, n);
		};
		q(c, (e) => {
			t.previewError && e(l);
		});
		var u = z(c, 2), d = (e) => {
			G(e, Da());
		};
		q(u, (e) => {
			!t.previewError && t.stale && t.preview && e(d);
		});
		var f = z(u, 2), p = (e) => {
			var i = ja(), c = R(i), l = R(c, !0);
			A(c);
			var u = z(c, 2);
			nt(u);
			var d = z(u, 2), f = (e) => {
				var t = Oa(), n = z(R(t), 2);
				A(t), U("click", n, s), G(e, t);
			}, p = (e) => {
				G(e, ka());
			};
			q(d, (e) => {
				H(a) ? e(f) : e(p, -1);
			});
			var m = z(d, 2), h = (e) => {
				var n = Aa(), r = R(n);
				A(n), B(() => K(r, `Slug: ${t.preview.slug ?? ""}`)), G(e, n);
			};
			q(m, (e) => {
				t.preview.slug && e(h);
			});
			var g = z(m, 2), _ = (e) => {
				var r = Aa(), i = R(r);
				A(r), B(() => K(i, `Template ${n().templateName ?? ""} · ${t.templateDigest ?? ""}`)), G(e, r);
			};
			q(g, (e) => {
				t.templateDigest && e(_);
			}), A(i), B(() => {
				K(l, t.preview.title), yi(u, H(r));
			}), U("input", u, (e) => o(e.currentTarget.value)), G(e, i);
		}, m = (e) => {
			G(e, Ma());
		}, h = (e) => {
			G(e, Na());
		};
		q(f, (e) => {
			t.preview ? e(p) : t.previewing ? e(m, 1) : t.previewError || e(h, 2);
		}), G(e, i);
	}, m = (e) => {
		var t = La(), r = R(t), i = R(r, !0);
		A(r);
		var a = z(r, 2), o = (e) => {
			var t = Fa(), r = R(t, !0);
			A(t), B(() => K(r, n().detail)), G(e, t);
		}, s = /* @__PURE__ */ P(() => n().detail.trim()), c = (e) => {
			G(e, Ia());
		};
		q(a, (e) => {
			H(s) ? e(o) : e(c, -1);
		});
		var l = z(a, 2), u = (e) => {
			var t = Aa(), r = R(t);
			A(t), B((e) => K(r, `Slug: ${e ?? ""}`), [() => n().slug.trim()]), G(e, t);
		}, d = /* @__PURE__ */ P(() => n().slug.trim());
		q(l, (e) => {
			H(d) && e(u);
		}), A(t), B((e) => K(i, e), [() => n().title.trim() || "Untitled task"]), G(e, t);
	};
	q(f, (e) => {
		t.selectedTemplate ? e(p) : e(m, -1);
	}), A(c), G(e, c), N();
}
Sr(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var Ba = /* @__PURE__ */ W("<input type=\"checkbox\"/><span> </span>", 1), Va = /* @__PURE__ */ W("<span> </span>"), Ha = /* @__PURE__ */ W("<textarea></textarea>"), Ua = /* @__PURE__ */ W("<option> </option>"), Wa = /* @__PURE__ */ W("<select><option>Select...</option><!></select>"), Ga = /* @__PURE__ */ W("<input/>"), Ka = /* @__PURE__ */ W("<small> </small>"), qa = /* @__PURE__ */ W("<label><!> <!> <!> <!> <!></label>"), Ja = /* @__PURE__ */ W("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function Ya(e, t) {
	M(t, !0);
	function n(e, n) {
		let r = n.currentTarget;
		t.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var r = Ja();
	Gr(r, 21, () => t.fields, (e) => e.name, (e, r) => {
		var i = qa();
		let a;
		var o = R(i), s = (e) => {
			var i = Ba(), a = ln(i);
			vi(a);
			var o = z(a), s = R(o);
			A(o), B(() => {
				bi(a, t.values[H(r).name] === !0), K(s, `${H(r).label ?? ""}${H(r).required ? " *" : ""}`);
			}), U("change", a, (e) => n(H(r), e)), G(e, i);
		}, c = (e) => {
			var t = Va(), n = R(t);
			A(t), B(() => K(n, `${H(r).label ?? ""}${H(r).required ? " *" : ""}`)), G(e, t);
		};
		q(o, (e) => {
			H(r).type === "boolean" ? e(s) : e(c, -1);
		});
		var l = z(o, 2), u = (e) => {
			var i = Ha();
			nt(i), B((e) => {
				i.required = H(r).required, Y(i, "placeholder", H(r).placeholder || ""), yi(i, e);
			}, [() => String(t.values[H(r).name] ?? "")]), U("input", i, (e) => n(H(r), e)), G(e, i);
		};
		q(l, (e) => {
			H(r).type === "textarea" && e(u);
		});
		var d = z(l, 2), f = (e) => {
			var i = Wa(), a = R(i);
			a.value = a.__value = "", Gr(z(a), 17, () => H(r).options || [], Vr, (e, t) => {
				var n = Ua(), r = R(n, !0);
				A(n);
				var i = {};
				B(() => {
					K(r, H(t)), i !== (i = H(t)) && (n.value = (n.__value = H(t)) ?? "");
				}), G(e, n);
			}), A(i);
			var o;
			di(i), B((e) => {
				i.required = H(r).required, o !== (o = e) && (i.value = (i.__value = e) ?? "", ui(i, e));
			}, [() => String(t.values[H(r).name] ?? "")]), U("change", i, (e) => n(H(r), e)), G(e, i);
		};
		q(d, (e) => {
			H(r).type === "select" && e(f);
		});
		var p = z(d, 2), m = (e) => {
			var i = Ga();
			vi(i), B((e) => {
				i.required = H(r).required, Y(i, "placeholder", H(r).placeholder || ""), yi(i, e);
			}, [() => String(t.values[H(r).name] ?? "")]), U("input", i, (e) => n(H(r), e)), G(e, i);
		};
		q(p, (e) => {
			H(r).type === "text" && e(m);
		});
		var h = z(p, 2), g = (e) => {
			var t = Ka(), n = R(t, !0);
			A(t), B(() => K(n, H(r).description)), G(e, t);
		};
		q(h, (e) => {
			H(r).description && e(g);
		}), A(i), B(() => a = J(i, 1, "", null, a, { "template-boolean": H(r).type === "boolean" })), G(e, i);
	}), A(r), B(() => Y(r, "aria-label", t.label)), G(e, r), N();
}
Sr(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var Xa = /* @__PURE__ */ W("<small> </small>"), Za = /* @__PURE__ */ W("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), Qa = /* @__PURE__ */ W("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function $a(e, t) {
	M(t, !0);
	function n(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var r = Qa(), i = z(R(r), 2), a = R(i);
	let o;
	var s = z(R(a), 4);
	X(R(s), { name: "check" }), A(s), A(a), Gr(z(a, 2), 17, () => t.templates, (e) => e.name, (e, r) => {
		var i = Za();
		let a;
		var o = R(i), s = R(o, !0);
		A(o);
		var c = z(o, 2), l = (e) => {
			var t = Xa(), n = R(t, !0);
			A(t), B(() => K(n, H(r).description)), G(e, t);
		};
		q(c, (e) => {
			H(r).description && e(l);
		});
		var u = z(c, 2);
		X(R(u), { name: "check" }), A(u), A(i), B((e) => {
			Y(i, "aria-selected", t.selectedName === H(r).name), a = J(i, 1, "template-card", null, a, { selected: t.selectedName === H(r).name }), i.disabled = !H(r).valid || t.disabled, K(s, e);
		}, [() => n(H(r))]), U("click", i, () => t.onSelect(H(r).name)), G(e, i);
	}), A(i), A(r), B(() => {
		Y(a, "aria-selected", t.selectedName === ""), o = J(a, 1, "template-card", null, o, { selected: t.selectedName === "" }), a.disabled = t.disabled;
	}), U("click", a, () => t.onSelect("")), G(e, r), N();
}
Sr(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var eo = /* @__PURE__ */ W("<small>(generated by template)</small>"), to = /* @__PURE__ */ W("<small class=\"create-required\">*</small>"), no = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), ro = /* @__PURE__ */ W("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), io = /* @__PURE__ */ W("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), ao = /* @__PURE__ */ W("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function oo(e, t) {
	M(t, !0);
	let n = Ai(t, "draft", 7), r, i = /* @__PURE__ */ P(() => t.model.templates.find((e) => e.name === n().templateName)), a = /* @__PURE__ */ P(() => t.model.preview?.title || ""), o = /* @__PURE__ */ P(() => n().titleOverride ? n().title : H(a)), s = /* @__PURE__ */ P(() => (H(i)?.fields || []).filter((e) => e.required)), c = /* @__PURE__ */ P(() => (H(i)?.fields || []).filter((e) => !e.required)), l = /* @__PURE__ */ P(() => !t.model.preview || t.model.previewKey !== t.model.previewRequestKey(n()));
	Mi(() => {
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
	var v = ao(), y = R(v), b = R(y), x = (e) => {
		$a(e, {
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
	var S = z(b, 2), C = z(R(S), 2), w = R(C), T = R(w), E = z(R(T)), D = (e) => {
		G(e, eo());
	}, ee = (e) => {
		G(e, to());
	};
	q(E, (e) => {
		H(i)?.taskTitle && !n().titleOverride ? e(D) : e(ee, -1);
	}), A(T);
	var te = z(T, 2), ne = R(te);
	vi(ne);
	var re = z(ne, 2), ie = (e) => {
		var t = no();
		U("click", t, g), G(e, t);
	};
	q(re, (e) => {
		H(i)?.taskTitle && n().titleOverride && e(ie);
	}), A(te), A(w);
	var ae = z(w, 2), oe = z(R(ae), 2), se = z(R(oe), 2);
	vi(se), A(oe), A(ae), A(C), A(S);
	var ce = z(S, 2), le = (e) => {
		var t = ro(), r = z(R(t), 2), i = (e) => {
			Ya(e, {
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
		var a = z(r, 2), o = (e) => {
			Ya(e, {
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
		}), A(t), G(e, t);
	}, ue = (e) => {
		var t = io(), r = z(R(t), 2);
		nt(r), A(t), B(() => yi(r, n().detail)), U("input", r, (e) => n().detail = e.currentTarget.value), G(e, t);
	};
	q(ce, (e) => {
		H(i) ? e(le) : e(ue, -1);
	}), A(y), za(z(y, 2), {
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
	}), A(v), B(() => {
		ne.required = !H(i)?.taskTitle, yi(ne, H(i)?.taskTitle ? H(o) : n().title), Y(ne, "placeholder", H(i)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), yi(se, n().slug);
	}), U("input", ne, (e) => h(e.currentTarget.value)), U("input", se, (e) => {
		n().slug = e.currentTarget.value, f();
	}), G(e, v), N();
}
Sr(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var so = /* @__PURE__ */ W("<span> </span>"), co = /* @__PURE__ */ W("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function lo(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(Zt(t.channel.current())), r = /* @__PURE__ */ I(Zt(s(H(n).draft))), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(void 0), o = /* @__PURE__ */ P(() => H(r).type === "task");
	ji(() => t.channel.subscribe((e) => {
		L(n, e, !0), e.identity !== H(i) && (L(i, e.identity, !0), L(r, s(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), ji(() => {
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
	var l = Mr(), u = ln(l), d = (e) => {
		var t = co(), i = R(t), s = z(i, 2);
		let l;
		var u = R(s), d = R(u), f = R(d), p = R(f, !0);
		A(f);
		var m = z(f, 2), h = (e) => {
			var t = so(), n = R(t, !0);
			A(t), B(() => K(n, H(r).projectId)), G(e, t);
		};
		q(m, (e) => {
			H(o) && e(h);
		}), A(d);
		var g = z(d, 2);
		X(R(g), { name: "x" }), A(g), A(u);
		var _ = z(u, 2), v = R(_);
		Br(v, () => H(n).identity, (e) => {
			var t = Mr(), i = ln(t), a = (e) => {
				oo(e, {
					get draft() {
						return H(r);
					},
					get model() {
						return H(n);
					}
				});
			}, s = (e) => {
				wa(e, { get draft() {
					return H(r);
				} });
			};
			q(i, (e) => {
				H(o) ? e(a) : e(s, -1);
			}), G(e, t);
		});
		var y = z(v, 2), b = R(y), x = R(b, !0);
		A(b);
		var S = z(b, 2);
		A(y), A(_), A(s), ki(s, (e) => L(a, e), () => H(a)), A(t), B(() => {
			l = J(s, 1, "create-dialog modal-enter", null, l, { "create-task-dialog": H(o) }), Y(s, "aria-label", H(o) ? "Create task" : "Create project"), K(p, H(o) ? "Create task" : "Create project"), g.disabled = H(n).submitting, b.disabled = H(n).submitting, K(x, H(n).submitting ? "Creating..." : "Create"), S.disabled = H(n).submitting;
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
	}), G(e, l), N();
}
Sr(["click"]);
//#endregion
//#region src/api/client.ts
var uo = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, fo = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, po = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new fo(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new fo(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new fo(e.scope));
		this.active.clear();
	}
}, mo = class {
	requests = new po();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: go(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: go(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof fo) ? new fo(n) : e;
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
			let n = ho(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new uo(e.status, r, n);
		}
		return t;
	}
};
function ho(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function go(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new mo();
//#endregion
//#region src/components/DiffModal.svelte
var _o = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), vo = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), yo = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), bo = /* @__PURE__ */ W("<div class=\"diff-viewer\"></div>"), xo = /* @__PURE__ */ W("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function So(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(null), r = /* @__PURE__ */ I(!1), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(void 0), o = /* @__PURE__ */ P(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	yn(() => {
		let e = t.repo, a = H(o);
		if (L(n, null), L(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		L(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (L(n, r, !0), await lr(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (L(i, n instanceof Error ? n.message : String(n), !0), t.onError(H(i)));
		}).finally(() => {
			t.repo === e && (L(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), yn(() => {
		H(n)?.diff, H(a), s();
	}), Mi(() => t.client.requests.abort(H(o)));
	function s() {
		!H(a) || !H(n)?.diff || !window.Diff2Html || (H(a).innerHTML = window.Diff2Html.html(H(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = Mr(), l = ln(c), u = (e) => {
		var o = xo(), s = R(o), c = z(s, 2), l = R(c), u = R(l), d = R(u), f = R(d, !0);
		A(d);
		var p = z(d), m = R(p);
		A(p), A(u);
		var h = z(u);
		X(R(h), { name: "x" }), A(h), A(l);
		var g = z(l, 2), _ = (e) => {
			var n = _o(), r = R(n);
			X(r, { name: "loader-circle" });
			var i = z(r, 2), a = R(i, !0);
			A(i), A(n), B(() => K(a, t.repo.worktreePath || "")), G(e, n);
		}, v = (e) => {
			var t = vo(), n = R(t);
			X(n, { name: "triangle-alert" });
			var r = z(n, 2), a = R(r, !0);
			A(r), A(t), B(() => K(a, H(i))), G(e, t);
		}, y = (e) => {
			var t = yo();
			X(R(t), { name: "check-circle-2" }), j(2), A(t), G(e, t);
		}, b = /* @__PURE__ */ P(() => !H(n)?.hasChanges || !H(n).diff?.trim()), x = (e) => {
			var t = bo();
			ki(t, (e) => L(a, e), () => H(a)), G(e, t);
		};
		q(g, (e) => {
			H(r) ? e(_) : H(i) ? e(v, 1) : H(b) ? e(y, 2) : e(x, -1);
		}), A(c), A(o), B(() => {
			K(f, H(n)?.branch || t.repo.branch || t.repo.name || "Diff"), K(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), U("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), U("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), G(e, o);
	};
	q(l, (e) => {
		t.repo && e(u);
	}), G(e, c), N();
}
Sr(["click"]);
//#endregion
//#region src/components/detail.ts
function Co(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function wo(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${Ao(e)}</pre>`;
}
function To(e) {
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
function Eo(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function Do(e) {
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
function Oo(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function ko(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...ko(a.children || [], t, n, r + 1));
	return i;
}
function Ao(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/FileBrowser.svelte
var jo = /* @__PURE__ */ W("<h3><!><span> </span></h3>"), Mo = /* @__PURE__ */ W("<span class=\"artifact-folder-icon\"><!><!></span>"), No = /* @__PURE__ */ W("<a class=\"artifact-download\"><!></a>"), Po = /* @__PURE__ */ W("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), Fo = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span> </span></div>"), Io = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"file-browser\"><!> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function Lo(e, t) {
	M(t, !0);
	let n = Ai(t, "entries", 19, () => []), r = Ai(t, "emptyMessage", 3, "No files."), i = Ai(t, "activePath", 3, ""), a = Ai(t, "showHeading", 3, !0), o = /* @__PURE__ */ P(() => ko(n(), t.expanded, t.title)), s = /* @__PURE__ */ P(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var l = Io(), u = R(l), d = (e) => {
		var n = jo(), r = R(n);
		X(r, { get name() {
			return H(s);
		} });
		var i = z(r), a = R(i, !0);
		A(i), A(n), B(() => K(a, t.title)), G(e, n);
	};
	q(u, (e) => {
		a() && e(d);
	});
	var f = z(u, 2), p = R(f), m = R(p), h = (e) => {
		var n = Mr();
		Gr(ln(n), 17, () => H(o), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ P(() => H(n).entry.type === "directory"), a = /* @__PURE__ */ P(() => t.expanded.has(`${t.title}:${H(n).entry.path}`));
			var o = Po(), s = R(o);
			let l;
			var u = R(s), d = R(u), f = R(d), p = (e) => {
				X(e, { name: "chevron-right" });
			};
			q(f, (e) => {
				H(r) && e(p);
			}), A(d);
			var m = z(d), h = (e) => {
				var t = Mo(), n = R(t);
				X(n, {
					name: "folder",
					className: "artifact-icon artifact-icon-dir"
				}), X(z(n), {
					name: "folder-open",
					className: "artifact-icon artifact-icon-dir"
				}), A(t), G(e, t);
			}, g = (e) => {
				{
					let t = /* @__PURE__ */ P(() => c(H(n).entry.name));
					X(e, {
						get name() {
							return H(t);
						},
						className: "artifact-icon"
					});
				}
			};
			q(m, (e) => {
				H(r) ? e(h) : e(g, -1);
			});
			var _ = z(m), v = R(_, !0);
			A(_), A(u);
			var y = z(u, 2), b = R(y), x = (e) => {
				var r = No();
				X(R(r), {
					name: "download",
					className: "artifact-download-icon"
				}), A(r), B((e) => {
					Y(r, "href", e), Y(r, "download", H(n).entry.name), Y(r, "title", `Download ${H(n).entry.name}`), Y(r, "aria-label", `Download ${H(n).entry.name}`);
				}, [() => t.rawURL(t.title, H(n).entry.path, !0)]), U("click", r, (e) => e.stopPropagation()), G(e, r);
			};
			q(b, (e) => {
				H(r) || e(x);
			});
			var S = z(b), C = R(S, !0);
			A(S), A(y), A(s), A(o), B((e) => {
				l = J(s, 1, "artifact-row", null, l, {
					directory: H(r),
					file: !H(r),
					active: i() === `${t.title}:${H(n).entry.path}`,
					open: H(r) && H(a)
				}), li(s, `--depth: ${H(n).depth}`), Y(_, "title", H(n).entry.path), K(v, H(n).entry.name), K(C, e);
			}, [() => H(r) ? `${(H(n).entry.children || []).length} items` : Oo(H(n).entry.size || 0)]), U("click", s, () => H(r) ? t.onToggle(`${t.title}:${H(n).entry.path}`) : t.onPreview(t.title, H(n).entry.path)), G(e, o);
		}), G(e, n);
	}, g = (e) => {
		var n = Fo(), i = R(n);
		{
			let e = /* @__PURE__ */ P(() => t.title === "Artifacts" ? "archive" : "inbox");
			X(i, { get name() {
				return H(e);
			} });
		}
		var a = z(i), o = R(a, !0);
		A(a), A(n), B(() => K(o, r())), G(e, n);
	};
	q(m, (e) => {
		H(o).length ? e(h) : e(g, -1);
	}), A(p), A(f), A(l), G(e, l), N();
}
Sr(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var Ro = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), zo = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), Bo = /* @__PURE__ */ W("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), Vo = /* @__PURE__ */ W("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), Ho = /* @__PURE__ */ W("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Uo = /* @__PURE__ */ W("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), Wo = /* @__PURE__ */ W("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Go(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(null), r = /* @__PURE__ */ I(!1), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ P(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ P(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : "");
	yn(() => {
		let e = t.selection, o = H(a);
		if (L(n, null), L(i, ""), !e) {
			t.client.requests.abort(o);
			return;
		}
		L(r, !0);
		let s = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${s}?path=${encodeURIComponent(e.path)}`, { scope: o }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && L(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (L(i, n instanceof Error ? n.message : String(n), !0), t.onError(H(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (L(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Mi(() => t.client.requests.abort(H(a)));
	var s = Mr(), c = ln(s), l = (e) => {
		var a = Wo(), s = R(a), c = z(s, 2), l = R(c), u = R(l), d = R(u), f = R(d, !0);
		A(d);
		var p = z(d), m = R(p);
		A(p), A(u);
		var h = z(u), g = R(h);
		X(R(g), { name: "external-link" }), j(), A(g);
		var _ = z(g);
		X(R(_), { name: "x" }), A(_), A(h), A(l);
		var v = z(l, 2), y = (e) => {
			var n = Ro(), r = R(n);
			X(r, { name: "loader-circle" });
			var i = z(r, 2), a = R(i, !0);
			A(i), A(n), B(() => K(a, t.selection.path)), G(e, n);
		}, b = (e) => {
			var t = zo(), n = R(t);
			X(n, { name: "triangle-alert" });
			var r = z(n, 2), a = R(r, !0);
			A(r), A(t), B(() => K(a, H(i))), G(e, t);
		}, x = (e) => {
			var r = Bo(), i = R(r);
			A(r), B(() => {
				Y(i, "src", H(o)), Y(i, "alt", H(n).name || t.selection.path);
			}), G(e, r);
		}, S = (e) => {
			var r = Vo(), i = R(r);
			X(i, { name: "file-warning" });
			var a = z(i), o = R(a, !0);
			A(a);
			var s = z(a), c = R(s);
			A(s), A(r), B((e) => {
				K(o, H(n).name || t.selection.path), K(c, `Binary file, ${e ?? ""}.`);
			}, [() => Oo(H(n).size || 0)]), G(e, r);
		}, C = (e) => {
			var t = Ho();
			Zr(t, () => wo(H(n)?.content || ""), !0), A(t), G(e, t);
		}, w = /* @__PURE__ */ P(() => Co(H(n)?.path || t.selection.path)), T = (e) => {
			var t = Uo(), r = R(t, !0);
			A(t), B(() => K(r, H(n)?.content || "")), G(e, t);
		};
		q(v, (e) => {
			H(r) ? e(y) : H(i) ? e(b, 1) : H(n)?.image ? e(x, 2) : H(n)?.binary ? e(S, 3) : H(w) ? e(C, 4) : e(T, -1);
		}), A(c), A(a), B((e, r) => {
			Y(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${H(n)?.contentHash || "pending"}`), K(f, e), K(m, `${t.selection.path ?? ""}${r ?? ""}${H(n)?.truncated ? " · truncated" : ""}`), Y(g, "href", H(o));
		}, [() => H(n)?.name || t.selection.path.split("/").pop() || "File preview", () => H(n)?.size == null ? "" : ` · ${Oo(H(n).size)}`]), U("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), U("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), G(e, a);
	};
	q(c, (e) => {
		t.selection && e(l);
	}), G(e, s), N();
}
Sr(["click"]);
//#endregion
//#region src/components/LogTimeline.svelte
var Ko = /* @__PURE__ */ W("<div class=\"markdown-rendered\"></div>"), qo = /* @__PURE__ */ W("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), Jo = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), Yo = /* @__PURE__ */ W("<div class=\"log-load-actions\"><button type=\"button\"><span class=\"log-load-icon log-load-icon-idle\"><!></span><span class=\"log-load-icon log-load-icon-busy\"><!></span><span> </span></button></div>"), Xo = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"log-timeline\"><div class=\"log-timeline\"></div> <!> <!></div>");
function Zo(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ P(() => [...t.logs || []].sort(Eo)), r = /* @__PURE__ */ I(!1);
	async function i() {
		if (!(t.loading || H(r))) {
			L(r, !0);
			try {
				await t.onLoadMore();
			} finally {
				L(r, !1), queueMicrotask(t.onIconsChanged);
			}
		}
	}
	var a = Mr(), o = ln(a), s = (e) => {
		var a = Xo(), o = R(a);
		Gr(o, 21, () => H(n), (e) => e.id, (e, t) => {
			var n = qo(), r = R(n), i = R(r), a = R(i), o = R(a, !0);
			A(a);
			var s = z(a), c = R(s, !0);
			A(s), A(i);
			var l = z(i, 2), u = R(l, !0);
			A(l);
			var d = z(l, 2);
			X(R(d), { name: "chevron-right" }), A(d), A(r);
			var f = z(r, 2);
			let p;
			var m = R(f), h = (e) => {
				var n = Ko();
				Zr(n, () => wo(H(t).details), !0), A(n), G(e, n);
			}, g = (e) => {
				G(e, jr("No details."));
			};
			q(m, (e) => {
				H(t).details ? e(h) : e(g, -1);
			}), A(f), A(n), B((e) => {
				Y(n, "data-log-id", H(t).id), Y(i, "title", H(t).time), K(o, e), K(c, H(t).time), K(u, H(t).title || "Untitled log entry"), p = J(f, 1, "log-details", null, p, { empty: !H(t).details });
			}, [() => Do(H(t).time)]), G(e, n);
		}), A(o);
		var s = z(o, 2), c = (e) => {
			var n = Jo(), r = R(n, !0);
			A(n), B(() => K(r, t.error)), G(e, n);
		};
		q(s, (e) => {
			t.error && e(c);
		});
		var l = z(s, 2), u = (e) => {
			var n = Yo(), a = R(n);
			let o;
			var s = R(a);
			X(R(s), { name: "chevron-down" }), A(s);
			var c = z(s);
			X(R(c), {
				name: "loader-circle",
				className: "spin"
			}), A(c);
			var l = z(c), u = R(l, !0);
			A(l), A(a), A(n), B(() => {
				o = J(a, 1, "secondary-button log-load-more", null, o, { busy: t.loading || H(r) }), a.disabled = t.loading || H(r), Y(a, "aria-busy", t.loading || H(r)), K(u, t.loading || H(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), U("click", a, i), G(e, n);
		};
		q(l, (e) => {
			t.hasMore && e(u);
		}), A(a), B(() => Y(a, "data-log-resource", t.resourceId)), G(e, a);
	};
	q(o, (e) => {
		(H(n).length || t.error || t.hasMore) && e(s);
	}), G(e, a), N();
}
Sr(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var Qo = /* @__PURE__ */ W("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), $o = /* @__PURE__ */ W("<pre class=\"markdown-view\"> </pre>"), es = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"markdown-document\"><!></div>");
function ts(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ P(() => Co(t.file.name));
	var r = es(), i = R(r), a = (e) => {
		var n = Qo(), r = R(n);
		Zr(r, () => wo(t.file.content || ""), !0), A(r), A(n), G(e, n);
	}, o = (e) => {
		var n = $o(), r = R(n, !0);
		A(n), B(() => K(r, t.file.content || "")), G(e, n);
	};
	q(i, (e) => {
		H(n) ? e(a) : e(o, -1);
	}), A(r), B(() => {
		Y(r, "data-doc-file", t.file.name), Y(r, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`);
	}), G(e, r), N();
}
//#endregion
//#region src/components/SchedulerPanel.svelte
var ns = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary-button\">Cancel edit</button>"), rs = /* @__PURE__ */ W("<article><header><div><strong> </strong><code> </code></div><div><button type=\"button\" class=\"secondary-button\"><!><span>Edit</span></button><button type=\"button\" class=\"secondary-button danger\"><!><span>Remove</span></button></div></header> <dl><div><dt>Condition</dt><dd> </dd></div><div><dt>Target</dt><dd><code> </code></dd></div></dl></article>"), is = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No schedules. The Server will not create empty Scheduler Turns.</span></div>"), as = /* @__PURE__ */ W("<div class=\"scheduler-settings-card\"><div><strong>Wake interval</strong><span>Minutes after the previous Server-triggered Scheduler Turn completes. Empty schedule lists do not wake.</span></div> <label><input type=\"number\" min=\"1\" max=\"10080\" step=\"1\" aria-label=\"Scheduler wake interval in minutes\"/><span>minutes</span></label> <button type=\"button\" class=\"secondary-button\"><!><span>Save</span></button></div> <div class=\"schedule-editor\"><div class=\"schedule-editor-heading\"><div><strong> </strong><span>Conditions are natural language interpreted by the Scheduler Agent.</span></div><!></div> <label><span>Description</span><input placeholder=\"What should the Scheduler understand?\"/></label> <label><span>Condition</span><textarea rows=\"3\" placeholder=\"For example: when the release branch is green after 09:00 Shanghai time\"></textarea></label> <label><span>Target resource ID</span><input placeholder=\"workspace, scheduler, project1, or project1.task1\"/></label> <button type=\"button\"><span class=\"schedule-icon schedule-icon-busy\"><!></span><span class=\"schedule-icon schedule-icon-editing\"><!></span><span class=\"schedule-icon schedule-icon-add\"><!></span><span> </span></button></div> <div class=\"schedule-list\"><!></div>", 1);
function os(e, t) {
	M(t, !0);
	let n = new mo();
	Mi(() => n.dispose());
	let r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I("workspace"), s = /* @__PURE__ */ I(30), c = /* @__PURE__ */ I(!1);
	yn(() => {
		L(s, t.config.wakeIntervalMinutes, !0);
	});
	function l(e) {
		L(r, e.id, !0), L(i, e.description, !0), L(a, e.condition, !0), L(o, e.target, !0);
	}
	function u() {
		L(r, ""), L(i, ""), L(a, ""), L(o, "workspace");
	}
	async function d() {
		if (!H(i).trim() || !H(a).trim() || !H(o).trim() || H(c)) return;
		L(c, !0);
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
			L(c, !1);
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
			L(c, !0);
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
				L(c, !1);
			}
		}
	}
	var m = as(), h = ln(m), g = z(R(h), 2), _ = R(g);
	vi(_), j(), A(g);
	var v = z(g, 2);
	X(R(v), { name: "save" }), j(), A(v), A(h);
	var y = z(h, 2), b = R(y), x = R(b), S = R(x), C = R(S, !0);
	A(S), j(), A(x);
	var w = z(x), T = (e) => {
		var t = ns();
		U("click", t, u), G(e, t);
	};
	q(w, (e) => {
		H(r) && e(T);
	}), A(b);
	var E = z(b, 2), D = z(R(E));
	vi(D), A(E);
	var ee = z(E, 2), te = z(R(ee));
	nt(te), A(ee);
	var ne = z(ee, 2), re = z(R(ne));
	vi(re), A(ne);
	var ie = z(ne, 2);
	let ae;
	var oe = R(ie);
	X(R(oe), { name: "loader-circle" }), A(oe);
	var se = z(oe);
	X(R(se), { name: "save" }), A(se);
	var ce = z(se);
	X(R(ce), { name: "plus" }), A(ce);
	var le = z(ce), ue = R(le, !0);
	A(le), A(ie), A(y);
	var de = z(y, 2), fe = R(de), pe = (e) => {
		var n = Mr();
		Gr(ln(n), 17, () => t.config.schedules, (e) => e.id, (e, t) => {
			var n = rs();
			let i;
			var a = R(n), o = R(a), s = R(o), c = R(s, !0);
			A(s);
			var u = z(s), d = R(u, !0);
			A(u), A(o);
			var p = z(o), m = R(p);
			X(R(m), { name: "pencil" }), j(), A(m);
			var h = z(m);
			X(R(h), { name: "trash-2" }), j(), A(h), A(p), A(a);
			var g = z(a, 2), _ = R(g), v = z(R(_)), y = R(v, !0);
			A(v), A(_);
			var b = z(_), x = z(R(b)), S = R(x), C = R(S, !0);
			A(S), A(x), A(b), A(g), A(n), B(() => {
				i = J(n, 1, "", null, i, { editing: H(r) === H(t).id }), K(c, H(t).description), K(d, H(t).id), K(y, H(t).condition), K(C, H(t).target);
			}), U("click", m, () => l(H(t))), U("click", h, () => f(H(t))), G(e, n);
		}), G(e, n);
	}, me = (e) => {
		var t = is();
		X(R(t), { name: "calendar-clock" }), j(), A(t), G(e, t);
	};
	q(fe, (e) => {
		t.config.schedules.length ? e(pe) : e(me, -1);
	}), A(de), B((e, n) => {
		v.disabled = H(c) || H(s) === t.config.wakeIntervalMinutes, K(C, H(r) ? "Edit schedule" : "Add schedule"), ie.disabled = e, ae = J(ie, 1, "", null, ae, n), K(ue, H(r) ? "Update schedule" : "Add schedule");
	}, [() => H(c) || !H(i).trim() || !H(a).trim() || !H(o).trim(), () => ({
		busy: H(c),
		editing: !!H(r)
	})]), wi(_, () => H(s), (e) => L(s, e)), U("click", v, p), wi(D, () => H(i), (e) => L(i, e)), wi(te, () => H(a), (e) => L(a, e)), wi(re, () => H(o), (e) => L(o, e)), U("click", ie, d), G(e, m), N();
}
Sr(["click"]);
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var ss = /* @__PURE__ */ W("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), cs = /* @__PURE__ */ W("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), ls = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), us = /* @__PURE__ */ W("<p class=\"log-load-error\" role=\"alert\"> </p>"), ds = /* @__PURE__ */ W("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><span class=\"workspace-agents-icon workspace-agents-icon-idle\"><!></span><span class=\"workspace-agents-icon workspace-agents-icon-busy\"><!></span><span> </span></button></div></form>"), fs = /* @__PURE__ */ W("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function ps(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(""), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(""), o = /* @__PURE__ */ I(""), s = /* @__PURE__ */ I(!1), c = /* @__PURE__ */ I(""), l = /* @__PURE__ */ P(() => H(r) !== H(i)), u = /* @__PURE__ */ P(() => !!(H(l) && H(o) && H(a) && H(o) !== H(a)));
	yn(() => {
		let e = To(t.file?.content || ""), u = t.file?.contentHash || "";
		L(o, u, !0), t.identity === H(n) ? !H(l) && u !== H(a) && (L(r, e, !0), L(i, e, !0), L(a, u, !0)) : (L(n, t.identity, !0), L(r, e, !0), L(i, e, !0), L(a, u, !0), L(c, ""), L(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), H(s) || !H(l)) return;
		let u = H(n);
		L(s, !0), L(c, "");
		try {
			let e = await t.onSave(H(r), H(a));
			if (H(n) !== u) return;
			L(i, To(e.content || H(r)), !0), L(r, H(i), !0), L(a, e.contentHash || "", !0), L(o, H(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			H(n) === u && L(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			H(n) === u && (L(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = fs(), p = R(f);
	X(R(p), { name: "file-text" }), j(), A(p);
	var m = z(p, 2), h = (e) => {
		var t = ss();
		X(R(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), j(), A(t), G(e, t);
	}, g = (e) => {
		var n = cs(), r = R(n);
		X(r, { name: "triangle-alert" });
		var i = z(r, 2), a = R(i, !0);
		A(i), A(n), B(() => K(a, t.file.error)), G(e, n);
	}, _ = (e) => {
		var t = ds(), n = R(t);
		nt(n);
		var i = z(n, 2), a = (e) => {
			G(e, ls());
		};
		q(i, (e) => {
			H(u) && e(a);
		});
		var o = z(i, 2), f = (e) => {
			var t = us(), n = R(t, !0);
			A(t), B(() => K(n, H(c))), G(e, t);
		};
		q(o, (e) => {
			H(c) && e(f);
		});
		var p = z(o, 2), m = R(p);
		let h;
		var g = R(m);
		X(R(g), { name: "save" }), A(g);
		var _ = z(g);
		X(R(_), { name: "loader-circle" }), A(_);
		var v = z(_), y = R(v, !0);
		A(v), A(m), A(p), A(t), B(() => {
			n.disabled = H(s), m.disabled = H(s) || !H(l), h = J(m, 1, "", null, h, { busy: H(s) }), K(y, H(s) ? "Saving" : "Save");
		}), xr("submit", t, d), wi(n, () => H(r), (e) => L(r, e)), G(e, t);
	};
	q(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), A(f), G(e, f), N();
}
//#endregion
//#region src/components/DetailPanel.svelte
var ms = /* @__PURE__ */ W("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), hs = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), gs = /* @__PURE__ */ W("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), _s = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> <span class=\"resource-creator-badge\"> </span></h1></div></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!></div>", 1), vs = /* @__PURE__ */ W("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), ys = /* @__PURE__ */ W("<code class=\"resource-ref-badge\"> </code>"), bs = /* @__PURE__ */ W("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), xs = /* @__PURE__ */ W("<button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button>"), Ss = /* @__PURE__ */ W("<div class=\"details-actions\"><!><!></div>"), Cs = /* @__PURE__ */ W("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), ws = /* @__PURE__ */ W("<span class=\"details-tab-count\"> </span>"), Ts = /* @__PURE__ */ W("<button type=\"button\" role=\"tab\"><!><span> </span><!></button>"), Es = /* @__PURE__ */ W("<div><!></div>"), Ds = /* @__PURE__ */ W("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), Os = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), ks = /* @__PURE__ */ W("<div class=\"content-section\"><div class=\"template-list\"><!></div></div>"), As = /* @__PURE__ */ W("<div class=\"content-section\"><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), js = /* @__PURE__ */ W("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), Ms = /* @__PURE__ */ W("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), Ns = /* @__PURE__ */ W("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><div class=\"worktree-list\"><!></div></div></div></div>", 1), Ps = /* @__PURE__ */ W("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <!><span class=\"resource-creator-badge\"> </span></h1><!></div></div> <!>", 1), Fs = /* @__PURE__ */ W("<!> <!> <!>", 1);
function Is(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(Zt(t.channel.current())), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(""), a = /* @__PURE__ */ I(Zt(/* @__PURE__ */ new Set())), o = /* @__PURE__ */ I(null), s = /* @__PURE__ */ I(null), c = /* @__PURE__ */ new Map(), l = new mo(), u = /* @__PURE__ */ P(() => (H(n).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), d = /* @__PURE__ */ P(() => new Set(H(u).map((e) => e.name))), f = /* @__PURE__ */ P(h), p = /* @__PURE__ */ P(() => H(o) ? `${H(o).section}:${H(o).path}` : "");
	ji(() => t.channel.subscribe((e) => {
		if (L(n, e, !0), e.identity !== H(r)) {
			H(r) && H(i) && c.set(H(r), H(i)), L(r, e.identity, !0), L(o, null), L(s, null), L(a, /* @__PURE__ */ new Set(), !0), L(i, c.get(H(r)) || m(e), !0);
			let t = document.getElementById("detailsContent");
			t && (t.scrollTop = 0);
		} else H(f).length && !H(f).some((e) => e.id === H(i)) && L(i, H(f)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), ji(() => {
		let e = (e) => {
			e.key === "Escape" && (H(s) ? (e.preventDefault(), L(s, null)) : H(o) && (e.preventDefault(), L(o, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Mi(() => l.dispose());
	function m(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "scheduler" ? "schedules" : e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : t.some((e) => e.name === "work.md") ? "work" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "logs";
	}
	function h() {
		if (!H(n).detail) return [];
		if (H(n).resourceType === "scheduler") return [{
			id: "schedules",
			label: "Schedules",
			icon: "calendar-clock"
		}, {
			id: "context",
			label: "Context",
			icon: "file-text"
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
		L(i, e, !0), c.set(H(r), e);
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
		t.has(e) ? t.delete(e) : t.add(e), L(a, t, !0), queueMicrotask(H(n).onIconsChanged);
	}
	function S(e, t, r = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = r ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(H(n).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function C(e, t) {
		L(o, {
			section: e,
			path: t
		}, !0);
	}
	function w(e) {
		e && H(n).onToast(e);
	}
	var T = Fs(), E = ln(T), D = (e) => {
		var t = ms(), n = R(t);
		X(R(n), {
			name: "folder-search",
			className: "empty-state-icon"
		}), j(2), A(n), A(t), G(e, t);
	}, ee = (e) => {
		var t = _s(), r = ln(t), i = R(r), o = R(i), s = R(o, !0);
		A(o), A(i);
		var c = z(i), l = R(c), u = R(l, !0), d = z(u), f = R(d, !0);
		A(d), A(l), A(c), A(r);
		var m = z(r, 2), h = R(m);
		ps(h, {
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
		var g = z(h, 2), _ = (e) => {
			var t = hs(), r = R(t);
			X(R(r), { name: "book-open" }), j(), A(r);
			var i = z(r), a = R(i);
			X(a, { name: "triangle-alert" });
			var o = z(a, 2), s = R(o, !0);
			A(o), A(i), A(t), B(() => K(s, H(n).wiki.error)), G(e, t);
		}, v = (e) => {
			var t = gs(), n = R(t);
			X(R(n), { name: "book-open" }), j(), A(n);
			var r = z(n);
			X(R(r), { name: "book-open" }), j(2), A(r), A(t), G(e, t);
		}, w = (e) => {
			{
				let t = /* @__PURE__ */ P(() => H(n).wiki.entries || []);
				Lo(e, {
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
		}), A(m), B((e, t) => {
			K(s, H(n).workspaceName), K(u, H(n).workspaceName), Y(d, "title", e), K(f, t);
		}, [() => b(), () => y()]), U("click", o, () => H(n).onNavigate("workspace")), G(e, t);
	}, te = (e) => {
		var t = Ps(), r = ln(t), o = R(r), c = R(o), l = R(c, !0);
		A(c);
		var d = z(c, 2), m = (e) => {
			var t = vs(), r = z(ln(t)), i = R(r, !0);
			A(r), B(() => K(i, H(n).parent.title)), U("click", r, () => H(n).onNavigate(H(n).parent?.id || "workspace")), G(e, t);
		};
		q(d, (e) => {
			H(n).parent && e(m);
		});
		var h = z(d, 3), w = R(h, !0);
		A(h), A(o);
		var T = z(o, 2), E = R(T), D = R(E, !0), ee = z(D), te = (e) => {
			var t = ys(), r = R(t, !0);
			A(t), B((e) => K(r, e), [() => v(H(n).resourceId)]), G(e, t);
		};
		q(ee, (e) => {
			H(n).resourceType !== "scheduler" && e(te);
		});
		var ne = z(ee), re = R(ne, !0);
		A(ne), A(E);
		var ie = z(E), ae = (e) => {
			var t = Ss(), r = R(t), i = (e) => {
				var t = bs();
				X(R(t), { name: "plus" }), j(), A(t), U("click", t, () => H(n).onCreateTask(H(n).resourceId)), G(e, t);
			};
			q(r, (e) => {
				H(n).resourceType === "project" && e(i);
			});
			var a = z(r), o = (e) => {
				var t = xs();
				X(R(t), { name: "archive" }), j(), A(t), U("click", t, () => H(n).onArchive(H(n).resourceId)), G(e, t);
			};
			q(a, (e) => {
				H(n).resourceType !== "scheduler" && e(o);
			}), A(t), G(e, t);
		};
		q(ie, (e) => {
			H(n).detail && e(ae);
		}), A(T), A(r);
		var oe = z(r, 2), se = (e) => {
			var t = Cs(), n = R(t);
			X(R(n), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), j(), A(n), A(t), G(e, t);
		}, ce = (e) => {
			var t = Ns(), r = ln(t);
			Gr(r, 21, () => H(f), (e) => e.id, (e, t) => {
				var r = Ts();
				let a;
				var o = R(r);
				X(o, { get name() {
					return H(t).icon;
				} });
				var s = z(o), c = R(s, !0);
				A(s);
				var l = z(s), u = (e) => {
					var t = ws(), r = R(t, !0);
					A(t), B(() => K(r, H(n).detail.logs.length)), G(e, t);
				};
				q(l, (e) => {
					H(t).id === "logs" && H(n).detail.logs?.length && e(u);
				}), A(r), B(() => {
					a = J(r, 1, "details-tab", null, a, { active: H(i) === H(t).id }), Y(r, "aria-selected", H(i) === H(t).id), K(c, H(t).label);
				}), U("click", r, () => _(H(t).id)), G(e, r);
			}), A(r);
			var o = z(r, 2), c = R(o);
			Gr(c, 17, () => H(u), (e) => e.path || e.name, (e, t) => {
				var r = Es();
				ts(R(r), {
					get file() {
						return H(t);
					},
					get workspaceId() {
						return H(n).workspaceId;
					}
				}), A(r), B((e) => Y(r, "hidden", e), [() => H(i) !== g(H(t))]), G(e, r);
			});
			var l = z(c, 2), d = (e) => {
				var t = Es(), r = R(t);
				{
					let e = /* @__PURE__ */ P(() => H(n).onRefreshScheduler || (async () => void 0));
					os(r, {
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
				A(t), B(() => Y(t, "hidden", H(i) !== "schedules")), G(e, t);
			};
			q(l, (e) => {
				H(n).resourceType === "scheduler" && H(n).detail.scheduler && e(d);
			});
			var m = z(l, 2), h = R(m), v = (e) => {
				var t = ks(), r = R(t), i = R(r), a = (e) => {
					var t = Mr();
					Gr(ln(t), 17, () => H(n).detail.templates, (e) => e.name, (e, t) => {
						var n = Ds();
						let r;
						var i = R(n);
						X(i, { name: "file-text" });
						var a = z(i), o = R(a), s = R(o, !0);
						A(o);
						var c = z(o), l = R(c);
						A(c), A(a), X(z(a), { name: "chevron-right" }), A(n), B(() => {
							r = J(n, 1, "template-row", null, r, { invalid: !H(t).valid }), K(s, H(t).title || H(t).name), K(l, `${H(t).name ?? ""} · v${(H(t).schemaVersion || "?") ?? ""} · ${H(t).valid ? `${(H(t).fields || []).length} fields` : `invalid${H(t).errors?.[0]?.message ? `: ${H(t).errors[0].message}` : ""}`}${H(t).legacy ? " · legacy" : ""}`);
						}), U("click", n, () => H(t).path && C("Templates", H(t).path)), G(e, n);
					}), G(e, t);
				}, o = (e) => {
					var t = Os();
					X(R(t), { name: "layout-template" }), j(), A(t), G(e, t);
				};
				q(i, (e) => {
					H(n).detail.templates?.length ? e(a) : e(o, -1);
				}), A(r), A(t), G(e, t);
			}, y = (e) => {
				var t = As(), r = R(t), i = R(r), a = R(i);
				X(a, { name: "file-text" });
				var o = z(a), s = R(o), c = R(s, !0);
				A(s);
				var l = z(s), u = R(l);
				A(l), A(o), A(i), A(r), A(t), B(() => {
					K(c, H(n).detail.template.name), K(u, `Created from template · v${(H(n).detail.template.schemaVersion || "?") ?? ""} · ${(H(n).detail.template.digest || "") ?? ""}`);
				}), G(e, t);
			};
			q(h, (e) => {
				H(n).resourceType === "project" ? e(v) : H(n).detail.template && e(y, 1);
			}), A(m);
			var b = z(m, 2), w = R(b);
			{
				let e = /* @__PURE__ */ P(() => H(n).detail.logs || []);
				Zo(w, {
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
			A(b);
			var T = z(b, 2), E = R(T);
			{
				let e = /* @__PURE__ */ P(() => H(n).detail.artifacts || []);
				Lo(E, {
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
			A(T);
			var D = z(T, 2), ee = R(D), te = R(ee), ne = R(te), re = (e) => {
				var t = Mr();
				Gr(ln(t), 17, () => H(n).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = js(), r = R(n), i = R(r);
					X(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = z(i), o = R(a), c = R(o, !0);
					A(o);
					var l = z(o), u = R(l);
					A(l);
					var d = z(l), f = R(d, !0);
					A(d), A(a), A(r);
					var p = z(r);
					X(R(p), { name: "git-compare-arrows" }), j(), A(p), A(n), B(() => {
						K(c, H(t).branch || "HEAD"), K(u, `${(H(t).name || "repository") ?? ""}${H(t).targetBranch || H(t).baseBranch ? ` · base ${H(t).targetBranch || H(t).baseBranch}` : ""}`), K(f, H(t).worktreePath || "");
					}), U("click", p, () => L(s, H(t), !0)), G(e, n);
				}), G(e, t);
			}, ie = (e) => {
				var t = Ms();
				X(R(t), { name: "git-branch" }), j(), A(t), G(e, t);
			};
			q(ne, (e) => {
				H(n).detail.repos?.length ? e(re) : e(ie, -1);
			}), A(te), A(ee), A(D), A(o), B(() => {
				Y(m, "hidden", H(i) !== "template"), Y(b, "hidden", H(i) !== "logs"), Y(T, "hidden", H(i) !== "artifacts"), Y(D, "hidden", H(i) !== "worktrees");
			}), G(e, t);
		};
		q(oe, (e) => {
			H(n).loading || !H(n).detail ? e(se) : e(ce, -1);
		}), B((e, t) => {
			K(l, H(n).workspaceName), K(w, H(n).resourceTitle), K(D, H(n).resourceTitle), Y(ne, "title", e), K(re, t);
		}, [() => H(n).resourceType === "scheduler" ? "Special Forge-managed Workspace resource" : b(), () => H(n).resourceType === "scheduler" ? "Forge-managed" : y()]), U("click", c, () => H(n).onNavigate("workspace")), U("click", h, () => H(n).onNavigate(H(n).resourceId)), G(e, t);
	};
	q(E, (e) => {
		H(n).workspaceId ? H(n).resourceType === "workspace" ? e(ee, 1) : e(te, -1) : e(D);
	});
	var ne = z(E, 2);
	Go(ne, {
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
		onClose: () => L(o, null),
		onError: w,
		get onIconsChanged() {
			return H(n).onIconsChanged;
		}
	}), So(z(ne, 2), {
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
		onClose: () => L(s, null),
		onError: w,
		get onIconsChanged() {
			return H(n).onIconsChanged;
		}
	}), G(e, T), N();
}
Sr(["click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var Ls = /* @__PURE__ */ W("<p class=\"approval-question\"> </p>"), Rs = /* @__PURE__ */ W("<p> </p>"), zs = /* @__PURE__ */ W("<button> </button>"), Bs = /* @__PURE__ */ W("<div class=\"approval-options\"></div>"), Vs = /* @__PURE__ */ W("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), Hs = /* @__PURE__ */ W("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), Us = /* @__PURE__ */ W("<!> <!>", 1), Ws = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function Gs(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(""), r = /* @__PURE__ */ I(!1), i = /* @__PURE__ */ I(Zt(a()));
	yn(() => {
		let e = a();
		e !== H(i) && (L(i, e, !0), L(n, ""), L(r, !1));
	});
	function a() {
		return `${t.contextIdentity}:${String(t.item.approvalId || "")}`;
	}
	async function o(e) {
		let i = String(t.item.approvalId || "");
		if (!(!i || H(r))) {
			L(r, !0);
			try {
				await t.onApproval(t.generationId, i, e), L(n, "");
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				L(r, !1);
			}
		}
	}
	function s(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	var c = Ws(), l = R(c), u = R(l);
	X(u, { name: "shield-question" });
	var d = z(u), f = R(d, !0);
	A(d), A(l);
	var p = z(l, 2), m = (e) => {
		var n = Ls(), r = R(n, !0);
		A(n), B(() => K(r, t.item.question)), G(e, n);
	};
	q(p, (e) => {
		t.item.question && e(m);
	});
	var h = z(p, 2), g = (e) => {
		var n = Rs(), r = R(n, !0);
		A(n), B(() => K(r, t.item.detail)), G(e, n);
	};
	q(h, (e) => {
		t.item.detail && e(g);
	});
	var _ = z(h, 2), v = (e) => {
		var i = Us(), a = ln(i), c = (e) => {
			var n = Bs();
			Gr(n, 21, () => t.item.options, (e) => e.optionId, (e, t) => {
				var n = zs();
				let i;
				var a = R(n, !0);
				A(n), B((e, t) => {
					n.disabled = H(r), i = J(n, 1, "", null, i, e), K(a, t);
				}, [() => ({ "secondary-button": String(H(t).kind || "").startsWith("reject") }), () => s(H(t))]), U("click", n, () => o({ optionId: H(t).optionId })), G(e, n);
			}), A(n), G(e, n);
		}, l = (e) => {
			var t = Vs(), n = R(t);
			X(R(n), { name: "check" }), j(), A(n);
			var i = z(n);
			X(R(i), { name: "x" }), j(), A(i), A(t), B(() => {
				n.disabled = H(r), i.disabled = H(r);
			}), U("click", n, () => o({ decision: "accept" })), U("click", i, () => o({ decision: "decline" })), G(e, t);
		};
		q(a, (e) => {
			t.item.options?.length ? e(c) : e(l, -1);
		});
		var u = z(a, 2), d = (e) => {
			var t = Hs(), i = R(t);
			vi(i);
			var a = z(i);
			A(t), B((e) => a.disabled = e, [() => !H(n).trim() || H(r)]), xr("submit", t, (e) => {
				e.preventDefault(), H(n).trim() && o({ text: H(n).trim() });
			}), wi(i, () => H(n), (e) => L(n, e)), G(e, t);
		};
		q(u, (e) => {
			t.item.question && e(d);
		}), G(e, i);
	}, y = (e) => {
		var n = Rs(), r = R(n);
		A(n), B(() => K(r, `${(t.item.decision || (t.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${t.item.reply ? `: ${t.item.reply}` : ""}`)), G(e, n);
	};
	q(_, (e) => {
		t.item.status === "pending" ? e(v) : e(y, -1);
	}), A(c), B(() => K(f, t.item.title || "Approval requested")), G(e, c), N();
}
Sr(["click"]);
//#endregion
//#region src/components/timeline-events.ts
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
//#region src/components/chat-state.ts
var nc = 20, rc = 250, ic = 80, ac = /* @__PURE__ */ new Set(["session.launch-environment"]), oc = class {
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
		this.api = e.api ?? new mo(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? ic);
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t, n) {
		if (this.disposed) return;
		let r = lc(e, t), i = this.activeKey !== r;
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
			let r = await this.api.latest(mc(e, n), { scope: fc(e, "older") });
			return this.isCurrent(e, t) ? (this.mergePage(e, r), r.segments.some((e) => e.turns?.length || e.gap)) : !1;
		} catch (n) {
			return n instanceof fo || !this.isCurrent(e, t) || (e.error = wc(n)), !1;
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
			let r = await this.api.latest(hc(t, e), { scope: fc(t, `turn:${e}`) });
			if (!this.isCurrent(t, n)) return;
			if (t.details.set(e, r), !r.turn.closed && r.turn.generation.generationId === t.generationId) {
				let i = await this.loadTurnRange(t, r, n);
				if (!this.isCurrent(t, n)) return;
				t.liveEvents.set(e, i);
			}
			this.connect(t);
		} catch (r) {
			if (r instanceof fo || !this.isCurrent(t, n)) return;
			t.detailErrors.set(e, wc(r));
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
		o && (r.liveEvents.set(o, Ys(Ks([...r.liveEvents.get(o) || [], ...a]))), this.emit());
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
		} : Tc();
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
			key: lc(e, t),
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
			let n = await this.api.latest(mc(e), { scope: fc(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			e.segments.clear(), e.details.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), this.mergePage(e, n), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof fo || !this.isCurrent(e, t)) return;
			e.error = wc(n);
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
		let t = [], n = [...e.segments.values()].sort((e, t) => e.generation.generation - t.generation.generation), r = n.find((t) => t.generation.generationId === e.generationId)?.generation || _c(e), i = r ? this.orphanEventBlocks(e, r) : [];
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
					items: i && !a ? sc(i, r.generation.generationId) : void 0,
					events: a?.filter((e) => !ac.has(e.type)),
					loading: e.detailLoading.has(t.reference),
					error: e.detailErrors.get(t.reference)
				});
			}
			r.generation.generationId === e.generationId && n.push(...i), n.sort((e, t) => dc(e) - dc(t)), t.push(...n);
		}
		return i.length && !n.some((t) => t.generation.generationId === e.generationId) && t.push(...i), t;
	}
	orphanEventBlocks(e, t) {
		let n = [];
		for (let [r, i] of e.orphanEvents) {
			let a = i.filter((e) => !ac.has(e.type)), o = [];
			for (let i of a) o.length && Number(i.id) !== Number(o[o.length - 1].id) + 1 && (n.push(uc(e, r, t, o)), o = []), o.push(i);
			o.length && n.push(uc(e, r, t, o));
		}
		return n.sort((e, t) => dc(e) - dc(t));
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !e.generationId || !bc(e.status)) return;
		let t = gc(e), n = new URLSearchParams({ generationId: e.generationId });
		t && n.set("after", String(t));
		let r = ++e.streamGeneration, i = this.eventSourceFactory(`${pc(e)}/stream?${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.resourceId, n), this.scheduleEventFlush(e), xc(n) && this.materializeTerminalTurn(e, String(n.turnId || ""), r);
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
				limit: String(rc)
			}), c = await this.api.latest(`${pc(e)}/events?${s}`, { scope: fc(e, i) });
			if (!this.isCurrent(e, r)) return [];
			let l = vc(c.events).filter((t) => this.eventBelongsToContext(e, t));
			o = Ks([...o, ...l]);
			let u = Number(c.page?.nextAfter) || yc(l);
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
					let i = await this.api.latest(mc(e), { scope: fc(e, `terminal-head:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.mergePage(e, i);
					let a = this.findTurnById(e, r, t);
					if (!a?.closed) throw Error("Turn projection is not closed yet");
					let o = await this.api.latest(hc(e, a.reference), { scope: fc(e, `terminal:${r}:${t}`) });
					if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
					this.flushEvents(e, !1), e.details.set(a.reference, o), e.liveEvents.delete(a.reference), this.emit();
					return;
				} catch (t) {
					if (t instanceof fo || !e.stream || !this.isActiveStream(e, e.stream, n)) return;
					if (i === 2) {
						e.error = wc(t), this.emit();
						return;
					}
					await Sc(50 * (i + 1));
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
			let n = await this.api.latest(mc(e), { scope: fc(e, "stream-head") });
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
		e.notices.some((e) => Cc(e) === Cc(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
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
				e.orphanEvents.set(n, Ys(qs(e.orphanEvents.get(n) || [], [t]))), xc(t) || this.refreshHead(e);
			}
		}
		t && this.isActive(e) && this.emit();
	}
	closeStream(e) {
		e.streamGeneration++, e.stream?.close(), e.stream = null;
	}
	deactivate(e) {
		e && (e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.requestGeneration++, this.closeStream(e), e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(fc(e, "initial")), this.api.requests.abort(fc(e, "older")));
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
function sc(e, t) {
	return (e.items || []).flatMap((e) => cc(e, t));
}
function cc(e, t) {
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
function lc(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function uc(e, t, n, r) {
	let i = r[0]?.id ?? 0;
	return {
		kind: "turn",
		key: `${e.generationId}:${t || "current"}:${i}`,
		generation: n,
		events: r
	};
}
function dc(e) {
	if (e.turn) return Number(e.turn.startEventId) || 0;
	let t = e.events?.[0];
	return t && Number(t.id) || 0;
}
function fc(e, t) {
	return `resource-chat:${e.key}:${t}`;
}
function pc(e) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/resources/${encodeURIComponent(e.resourceId)}`;
}
function mc(e, t = "") {
	let n = new URLSearchParams({ limit: String(nc) });
	return t && n.set("cursor", t), `${pc(e)}/history/turns?${n}`;
}
function hc(e, t) {
	return `${pc(e)}/history/turns/${encodeURIComponent(t)}`;
}
function gc(e) {
	let t = [...e.segments.values()].filter((t) => t.generation.generationId === e.generationId).flatMap((e) => e.turns || []), n = [...e.liveEvents.values()].flat();
	return Math.max(0, ...t.map((e) => Number(e.lastEventId) || 0), ...n.map((e) => Number(e.id) || 0));
}
function _c(e) {
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
function vc(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function yc(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function bc(e) {
	return !!(e?.generation?.generationId && e.session?.id && [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e.generation.status || "")));
}
function xc(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function Sc(e) {
	return new Promise((t) => setTimeout(t, e));
}
function Cc(e) {
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
function wc(e) {
	return e instanceof Error ? e.message : String(e);
}
function Tc() {
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
var Ec = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function Dc(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ P(() => t.item.tone === "ok" ? "check-circle" : t.item.tone === "danger" ? "triangle-alert" : t.item.tone === "info" ? "info" : "clock");
	function r() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var i = Ec(), a = R(i);
	X(a, { get name() {
		return H(n);
	} });
	var o = z(a), s = R(o, !0);
	A(o);
	var c = z(o), l = R(c, !0);
	A(c), A(i), B((e) => {
		J(i, 1, `agent-system-note agent-lifecycle-${t.item.tone || "muted"}`), K(s, t.item.text || ""), K(l, e);
	}, [() => r()]), G(e, i), N();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var Oc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function kc(e, t) {
	M(t, !0);
	let n = Ai(t, "onExpand", 3, () => {}), r = /* @__PURE__ */ I(Zt(!!t.item.active)), i = !!t.item.active;
	yn(() => {
		let e = !!t.item.active;
		e !== i && (i = e, L(r, e, !0));
	});
	function a() {
		if (t.item.active) return "Thinking…";
		if (!t.item.startTime || !t.item.time) return "Thought";
		let e = Math.round((new Date(t.item.time).getTime() - new Date(t.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var o = Oc(), s = R(o), c = R(s);
	X(c, { name: "brain-circuit" });
	var l = z(c), u = R(l, !0);
	A(l);
	var d = z(l);
	X(R(d), { name: "chevron-right" }), A(d), A(s);
	var f = z(s, 2), p = R(f, !0);
	A(f), A(o), B((e) => {
		o.open = H(r), K(u, e), K(p, t.item.text || "");
	}, [() => a()]), xr("toggle", o, (e) => {
		L(r, e.currentTarget.open, !0), e.currentTarget.open && n()();
	}), G(e, o), N();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var Ac = /* @__PURE__ */ W("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), jc = /* @__PURE__ */ W("<span class=\"agent-message-tag\">steer</span>"), Mc = /* @__PURE__ */ W("<span class=\"agent-message-source\"> </span>"), Nc = /* @__PURE__ */ W("<div class=\"agent-message-content markdown-rendered\"></div>"), Pc = /* @__PURE__ */ W("<p> </p>"), Fc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function Ic(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ P(() => [
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
	var s = Fc(), c = R(s), l = R(c), u = R(l), d = R(u, !0);
	A(u);
	var f = z(u, 2), p = (e) => {
		var t = Ac(), r = R(t, !0);
		A(t), B(() => K(r, H(n))), G(e, t);
	};
	q(f, (e) => {
		H(n) !== "assistant" && e(p);
	});
	var m = z(f, 2), h = (e) => {
		G(e, jc());
	};
	q(m, (e) => {
		t.item.steer && e(h);
	});
	var g = z(m, 2), _ = (e) => {
		var n = Mc(), r = R(n);
		A(n), B(() => {
			Y(n, "title", t.item.sender.sessionId), K(r, `from session ${t.item.sender.sessionId ?? ""}`);
		}), G(e, n);
	};
	q(g, (e) => {
		H(n) === "agent" && t.item.sender?.sessionId && e(_);
	});
	var v = z(g, 2), y = R(v, !0);
	A(v), A(l);
	var b = z(l, 2), x = R(b), S = (e) => {
		var t = Nc();
		Zr(t, a, !0), A(t), G(e, t);
	}, C = (e) => {
		var n = Pc(), r = R(n, !0);
		A(n), B(() => K(r, t.item.text || "")), G(e, n);
	};
	q(x, (e) => {
		H(n) === "assistant" || H(n) === "agent" ? e(S) : e(C, -1);
	}), A(b), A(c), A(s), B((e, t) => {
		J(s, 1, `agent-message-row ${H(n) === "assistant" ? "assistant final" : H(n)}`), K(d, e), K(y, t);
	}, [() => r(), () => i()]), G(e, s), N();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var Lc = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function Rc(e, t) {
	let n = Ai(t, "error", 3, !1), r = Ai(t, "alert", 3, !1);
	var i = Lc();
	let a;
	var o = R(i), s = R(o);
	{
		let e = /* @__PURE__ */ P(() => n() ? "triangle-alert" : "info");
		X(s, { get name() {
			return H(e);
		} });
	}
	var c = z(s), l = R(c, !0);
	A(c), A(o);
	var u = z(o, 2), d = R(u, !0);
	A(u), A(i), B(() => {
		a = J(i, 1, "timeline-notice", null, a, { "timeline-notice-error": n() }), Y(i, "role", r() ? "alert" : void 0), K(l, t.title), K(d, t.text);
	}), G(e, i);
}
//#endregion
//#region src/components/ToolItem.svelte
var zc = /* @__PURE__ */ W("<pre> </pre>"), Bc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\"><summary><span class=\"tool-status-icon tool-status-icon-running\"><!></span><span class=\"tool-status-icon tool-status-icon-failed\"><!></span><span class=\"tool-status-icon tool-status-icon-completed\"><!></span><span> </span><small> </small></summary> <!></details>");
function Vc(e, t) {
	M(t, !0);
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
	var i = Bc(), a = R(i), o = R(a);
	X(R(o), { name: "loader-circle" }), A(o);
	var s = z(o);
	X(R(s), { name: "x-circle" }), A(s);
	var c = z(s);
	X(R(c), { name: "check-circle" }), A(c);
	var l = z(c), u = R(l, !0);
	A(l);
	var d = z(l), f = R(d, !0);
	A(d), A(a);
	var p = z(a, 2), m = (e) => {
		var t = zc(), n = R(t, !0);
		A(t), B((e) => K(n, e), [() => r()]), G(e, t);
	}, h = /* @__PURE__ */ P(() => r());
	q(p, (e) => {
		H(h) && e(m);
	}), A(i), B((e, t, n) => {
		J(i, 1, e), K(u, t), K(f, n);
	}, [
		() => `agent-tool-item agent-tool-${String(t.call.status || "completed")}`,
		() => n(),
		() => String(t.call.method || "tool")
	]), G(e, i), N();
}
//#endregion
//#region src/components/ToolGroup.svelte
var Hc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function Uc(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ P(() => t.item.calls || []), r = /* @__PURE__ */ P(() => H(n).map(i));
	function i(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var a = Hc(), o = R(a), s = R(o);
	X(R(s), { name: "wrench" }), A(s);
	var c = z(s), l = R(c);
	A(c);
	var u = z(c), d = R(u);
	A(u);
	var f = z(u);
	X(R(f), { name: "chevron-right" }), A(f), A(o);
	var p = z(o, 2);
	Gr(p, 21, () => H(n), (e) => String(e.callId || e.key), (e, t) => {
		Vc(e, { get call() {
			return H(t);
		} });
	}), A(p), A(a), B((e, i) => {
		Y(a, "data-tool-group-key", e), a.open = t.open, K(l, `${H(n).length ?? ""} tool ${H(n).length === 1 ? "call" : "calls"}`), K(d, `${i ?? ""}${H(r).length > 2 ? ` · +${H(r).length - 2} more` : ""}`);
	}, [() => `${t.generationId}:${String(t.item.key || t.item.time || "tools")}`, () => H(r).slice(0, 2).join(" · ")]), xr("toggle", a, (e) => t.onToggle(e.currentTarget.open)), G(e, a), N();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var Wc = /* @__PURE__ */ W("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function Gc(e, t) {
	M(t, !0);
	var n = Wc(), r = R(n), i = R(r);
	X(i, { name: "info" });
	var a = z(i), o = R(a);
	A(a), A(r);
	var s = z(r), c = R(s, !0);
	A(s), A(n), B(() => {
		K(o, `Unhandled event: ${(t.item.type || t.item.kind) ?? ""}`), K(c, t.item.preview || "This event carries no payload.");
	}), G(e, n), N();
}
//#endregion
//#region src/components/EventTimeline.svelte
var Kc = /* @__PURE__ */ W("<button type=\"button\"><span class=\"load-older-icon load-older-icon-idle\"><!></span><span class=\"load-older-icon load-older-icon-busy\"><!></span><span> </span></button>"), qc = /* @__PURE__ */ W("<div class=\"conversation-generation\"><span> </span><strong> </strong><small> </small></div>"), Jc = /* @__PURE__ */ W("<button type=\"button\" class=\"secondary-button\">Retry</button>"), Yc = /* @__PURE__ */ W("<div class=\"conversation-gap\"><!><span><strong>History unavailable</strong><small> </small></span><!></div>"), Xc = /* @__PURE__ */ W("<div class=\"turn-summary-preview\"> </div>"), Zc = /* @__PURE__ */ W("<div><!></div>"), Qc = /* @__PURE__ */ W("<div class=\"turn-loading\"><!><span>Loading turn details</span></div>"), $c = /* @__PURE__ */ W("<section><!> <!> <!> <!></section>"), el = /* @__PURE__ */ W("<!> <!>", 1), tl = /* @__PURE__ */ W("<div class=\"turn-working-indicator\" role=\"status\" aria-live=\"polite\" data-timeline-key=\"turn-working\"><!><span>working...</span></div>"), nl = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>Loading resource history</strong></div>"), rl = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>"), il = /* @__PURE__ */ W("<!> <!> <!> <!> <!> <!> <!>", 1), al = /* @__PURE__ */ W("<div class=\"tty-empty\"><!><strong>No resource selected</strong></div>"), ol = /* @__PURE__ */ W("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div>");
function sl(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(Zt(t.channel.current())), r = /* @__PURE__ */ I(Zt(t.channel.current().project)), i = /* @__PURE__ */ I(Zt(ee())), a = /* @__PURE__ */ I(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ I(Zt(/* @__PURE__ */ new Map()));
	ji(() => {
		let e = x();
		o = new oc({
			onEvent: (e, t, r) => H(n).onEvent(e, t, r),
			onNotice: (e, t, r) => H(n).onNotice(e, t, r)
		});
		let i = o.subscribe(f), a = t.channel.subscribe((e) => {
			let t = H(n).identity, i = w(H(n).status) !== w(e.status) && C(x());
			L(n, e, !0), e.project !== H(r) && L(r, e.project, !0), e.identity !== t && (l = !0, s = null, L(d, new Map(u.get(e.identity) ?? []), !0)), o?.activate(e.workspaceId, e.resourceId, e.status), lr().then(() => {
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
		c = e.identity !== H(i).identity || l || C(t), l = !1, L(i, e, !0), t && (t.dataset.agentResourceId = e.resourceId), lr().then(() => {
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
		let n = D(e);
		L(d, new Map(H(d)).set(n, t), !0), u.set(H(i).identity, new Map(H(d))), t && y(e);
	}
	function y(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return o?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function b(e) {
		return H(d).get(D(e)) ?? !1;
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
	function D(e) {
		return `${e.generationId || H(i).generationId}:${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
	}
	function ee() {
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
	var te = ol(), ne = R(te), re = (e) => {
		var t = il(), r = ln(t), a = (e) => {
			var t = Kc();
			let n;
			var r = R(t);
			X(R(r), { name: "chevrons-up" }), A(r);
			var a = z(r);
			X(R(a), { name: "loader-circle" }), A(a);
			var o = z(a), s = R(o, !0);
			A(o), A(t), B(() => {
				n = J(t, 1, "load-older-events", null, n, { busy: H(i).loadingOlder }), t.disabled = H(i).loadingOlder, K(s, H(i).loadingOlder ? "Loading..." : "Load older messages");
			}), U("click", t, _), G(e, t);
		};
		q(r, (e) => {
			H(i).hasMoreBefore && e(a);
		});
		var s = z(r, 2);
		Gr(s, 19, () => H(i).blocks, (e) => e.key, (e, t, r) => {
			var a = el(), s = ln(a), c = (e) => {
				var n = qc(), r = R(n), i = R(r);
				A(r);
				var a = z(r), o = R(a, !0);
				A(a);
				var s = z(a), c = R(s, !0);
				A(s), A(n), B(() => {
					Y(n, "data-generation-id", H(t).generation.generationId), K(i, `Generation ${H(t).generation.generation ?? ""}`), K(o, H(t).generation.agentName || H(t).generation.resolvedProfile || H(t).generation.binding?.name || "Agent"), K(c, H(t).generation.status);
				}), G(e, n);
			};
			q(s, (e) => {
				(H(r) === 0 || H(i).blocks[H(r) - 1].generation.generationId !== H(t).generation.generationId) && e(c);
			});
			var l = z(s, 2), u = (e) => {
				var n = Yc(), r = R(n);
				X(r, { name: "triangle-alert" });
				var i = z(r), a = z(R(i)), s = R(a, !0);
				A(a), A(i);
				var c = z(i), l = (e) => {
					var t = Jc();
					U("click", t, () => o?.retryHistory()), G(e, t);
				};
				q(c, (e) => {
					H(t).gap?.retryable && e(l);
				}), A(n), B(() => {
					Y(n, "data-timeline-key", H(t).key), K(s, H(t).gap?.message || "This generation could not be read.");
				}), G(e, n);
			}, d = (e) => {
				var r = $c();
				let a;
				var o = R(r), s = (e) => {
					var n = Xc(), r = R(n, !0);
					A(n), B(() => K(r, H(t).turn.triggerPreview)), G(e, n);
				};
				q(o, (e) => {
					H(t).turn?.triggerPreview && !H(t).items && !H(t).events && e(s);
				});
				var c = z(o, 2);
				Gr(c, 17, () => h(H(t)), (e) => D(e), (e, r) => {
					var a = Zc(), o = R(a), s = (e) => {
						Ic(e, {
							get item() {
								return H(r);
							},
							get agentName() {
								return H(n).agentName;
							}
						});
					}, c = (e) => {
						kc(e, {
							get item() {
								return H(r);
							},
							onExpand: () => y(H(r))
						});
					}, l = (e) => {
						{
							let n = /* @__PURE__ */ P(() => b(H(r)));
							Uc(e, {
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
						Gs(e, {
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
						Dc(e, { get item() {
							return H(r);
						} });
					}, f = (e) => {
						{
							let t = /* @__PURE__ */ P(() => H(r).text || "");
							Rc(e, {
								title: "Provider error",
								get text() {
									return H(t);
								},
								error: !0
							});
						}
					}, p = (e) => {
						Gc(e, { get item() {
							return H(r);
						} });
					};
					q(o, (e) => {
						H(r).kind === "message" ? e(s) : H(r).kind === "thinking" ? e(c, 1) : H(r).kind === "tools" ? e(l, 2) : H(r).kind === "approval" ? e(u, 3) : H(r).kind === "lifecycle" ? e(d, 4) : H(r).kind === "error" ? e(f, 5) : e(p, -1);
					}), A(a), B((e) => Y(a, "data-timeline-key", e), [() => D(H(r))]), G(e, a);
				});
				var l = z(c, 2), u = (e) => {
					var t = Qc();
					X(R(t), { name: "loader-circle" }), j(), A(t), G(e, t);
				};
				q(l, (e) => {
					H(t).loading && !H(t).items && !H(t).events && e(u);
				});
				var d = z(l, 2), f = (e) => {
					Rc(e, {
						title: "Turn unavailable",
						get text() {
							return H(t).error;
						},
						error: !0
					});
				};
				q(d, (e) => {
					H(t).error && e(f);
				}), A(r), $r(r, (e, t) => m?.(e, t), () => H(t).turn?.reference || ""), B(() => {
					a = J(r, 1, "conversation-turn", null, a, { "conversation-turn-loading": H(t).loading }), Y(r, "data-timeline-key", H(t).key);
				}), G(e, r);
			};
			q(l, (e) => {
				H(t).kind === "gap" ? e(u) : e(d, -1);
			}), G(e, a);
		});
		var c = z(s, 2);
		Gr(c, 19, () => H(i).notices, (e, t) => `notice:${H(i).identity}:${t}:${String(e.data?.text || "")}`, (e, t, n) => {
			var r = Zc(), i = R(r);
			{
				let e = /* @__PURE__ */ P(() => String(H(t).data?.text || "")), n = /* @__PURE__ */ P(() => H(t).data?.level === "error");
				Rc(i, {
					title: "Forge",
					get text() {
						return H(e);
					},
					get error() {
						return H(n);
					}
				});
			}
			A(r), B(() => Y(r, "data-timeline-key", `notice:${H(n)}`)), G(e, r);
		});
		var l = z(c, 2), u = (e) => {
			Rc(e, {
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
		var d = z(l, 2), f = (e) => {
			var t = tl();
			X(R(t), { name: "loader-circle" }), j(), A(t), G(e, t);
		}, p = /* @__PURE__ */ P(() => w(H(n).status));
		q(d, (e) => {
			H(p) && e(f);
		});
		var g = z(d, 2), x = (e) => {
			var t = nl();
			X(R(t), { name: "loader-circle" }), j(), A(t), G(e, t);
		};
		q(g, (e) => {
			H(i).loading && !H(i).blocks.length && e(x);
		});
		var S = z(g, 2), C = (e) => {
			var t = rl();
			X(R(t), { name: "bot" }), j(2), A(t), G(e, t);
		}, T = /* @__PURE__ */ P(() => H(i).loaded && !H(i).loading && !H(i).blocks.length && !H(i).notices.length && !w(H(n).status));
		q(S, (e) => {
			H(T) && e(C);
		}), G(e, t);
	}, ie = (e) => {
		var t = al();
		X(R(t), { name: "bot" }), j(), A(t), G(e, t);
	};
	q(ne, (e) => {
		H(i).resourceId ? e(re) : e(ie, -1);
	}), A(te), ki(te, (e) => L(a, e), () => H(a)), B(() => Y(te, "data-chat-context", H(i).identity)), G(e, te), N();
}
Sr(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function cl(e) {
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
function ll(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: { ...e.resourceDefaults },
		newProfile: { ...e.newProfile }
	};
}
function ul(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var dl = /* @__PURE__ */ W("<span class=\"settings-pill\"> </span>"), fl = /* @__PURE__ */ W("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), pl = /* @__PURE__ */ W("<div class=\"settings-empty\">No AgentHub agents available.</div>"), ml = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function hl(e, t) {
	M(t, !0);
	let n = Ai(t, "draft", 15), r = Ai(t, "pending", 15);
	async function i() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(ll(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(ul(e));
			} finally {
				r("");
			}
		}
	}
	var a = ml(), o = z(R(a), 2), s = R(o), c = z(R(s)), l = R(c, !0);
	A(c), A(s);
	var u = z(s, 2), d = z(R(u));
	vi(d), A(u);
	var f = z(u, 2), p = R(f, !0);
	A(f);
	var m = z(f, 2);
	Gr(m, 21, () => t.agentHub.capabilities, Vr, (e, t) => {
		var n = dl(), r = R(n, !0);
		A(n), B(() => K(r, H(t))), G(e, n);
	}), A(m), A(o);
	var h = z(o, 2), g = R(h), _ = z(R(g)), v = R(_);
	A(_), A(g);
	var y = z(g, 2);
	Gr(y, 21, () => t.agentHub.agents, (e) => e.name, (e, t) => {
		var n = fl(), r = R(n), i = R(r), a = R(i, !0);
		A(i);
		var o = z(i), s = R(o), c = R(s, !0);
		A(s);
		var l = z(s), u = R(l);
		A(l), A(o), A(r), A(n), B((e) => {
			K(a, e), K(c, H(t).name), K(u, `${(H(t).providerId || "") ?? ""} · ${(H(t).available === !1 ? H(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (H(t).name || "A").slice(0, 1).toUpperCase()]), G(e, n);
	}, (e) => {
		G(e, pl());
	}), A(y), A(h);
	var b = z(h, 2), x = R(b);
	let S;
	var C = R(x, !0);
	A(x);
	var w = z(x);
	X(R(w), { name: "save" }), j(), A(w), A(b), A(a), B((e) => {
		K(l, t.agentHub.connected && t.agentHub.compatible ? "Compatible" : t.agentHub.connected ? "Incompatible" : "Unavailable"), K(p, t.agentHub.error || `API ${t.agentHub.apiVersion || "unknown"} · AgentHub ${t.agentHub.version || "unknown"}`), K(v, `${t.agentHub.agents.length ?? ""} agents · ${t.agentHub.providers.length ?? ""} providers`), S = J(x, 1, "settings-save-hint", null, S, { visible: n().dirty }), K(C, n().dirty ? "Unsaved changes" : ""), w.disabled = e;
	}, [() => !n().dirty || !!r()]), U("input", d, function(...e) {
		t.onDirty?.apply(this, e);
	}), wi(d, () => n().endpoint, (e) => n(n().endpoint = e, !0)), U("click", w, i), G(e, a), N();
}
Sr(["input", "click"]);
//#endregion
//#region src/components/AppearanceSettingsPanel.svelte
var gl = /* @__PURE__ */ Ar("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-dash\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), _l = /* @__PURE__ */ Ar("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"50\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"90\" y=\"8\" width=\"24\" height=\"56\" rx=\"3\"></rect></svg>"), vl = /* @__PURE__ */ Ar("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-strong\" x=\"6\" y=\"8\" width=\"22\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-light\" x=\"34\" y=\"8\" width=\"80\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-strong\" x=\"40\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect><rect class=\"d-outline\" x=\"74\" y=\"13\" width=\"30\" height=\"8\" rx=\"2\"></rect></svg>"), yl = /* @__PURE__ */ Ar("<svg viewBox=\"0 0 120 72\" aria-hidden=\"true\"><rect class=\"d-fill-light\" x=\"6\" y=\"8\" width=\"70\" height=\"56\" rx=\"3\"></rect><rect class=\"d-fill-mid\" x=\"82\" y=\"8\" width=\"32\" height=\"56\" rx=\"3\"></rect></svg>"), bl = /* @__PURE__ */ W("<button type=\"button\" role=\"radio\"><span class=\"layout-diagram\"><!></span> <span class=\"layout-option-text\"><strong> </strong><small> </small></span></button>"), xl = /* @__PURE__ */ W("<div class=\"font-scale-row\"><span class=\"font-scale-label\"> </span> <input type=\"range\" min=\"80\" max=\"140\" step=\"5\"/> <span class=\"font-scale-value\"> </span></div>"), Sl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"appearance-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Appearance</h2><p>Choose the workspace layout and the text size of each column. Everything applies immediately and is stored only in this browser.</p></div> <section class=\"appearance-section\" aria-label=\"Layout\"><div class=\"settings-section-heading\"><h3>Layout</h3></div> <div class=\"layout-options\" role=\"radiogroup\" aria-label=\"Workspace layout\"></div></section> <section class=\"appearance-section\" aria-label=\"Text size\"><div class=\"settings-section-heading\"><h3>Text size</h3><button type=\"button\" class=\"appearance-reset\"><!><span>Reset</span></button></div> <div class=\"font-scale-rows\"></div> <small class=\"appearance-hint\">Scales the text of each column independently from 80% to 140%.</small></section></div>");
function Cl(e, t) {
	M(t, !0);
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
	], i = (e) => `${Math.round(e * 100)}%`, a = /* @__PURE__ */ P(() => r.every((e) => t.appearance.fontScales[e.id] === 1));
	var o = Sl(), s = z(R(o), 2), c = z(R(s), 2);
	Gr(c, 21, () => n, (e) => e.id, (e, n) => {
		var r = bl();
		let i;
		var a = R(r), o = R(a), s = (e) => {
			G(e, gl());
		}, c = (e) => {
			G(e, _l());
		}, l = (e) => {
			G(e, vl());
		}, u = (e) => {
			G(e, yl());
		};
		q(o, (e) => {
			H(n).id === "auto" ? e(s) : H(n).id === "three" ? e(c, 1) : H(n).id === "two" ? e(l, 2) : e(u, -1);
		}), A(a);
		var d = z(a, 2), f = R(d), p = R(f, !0);
		A(f);
		var m = z(f), h = R(m, !0);
		A(m), A(d), A(r), B(() => {
			i = J(r, 1, "layout-option", null, i, { active: t.appearance.layout === H(n).id }), Y(r, "aria-checked", t.appearance.layout === H(n).id), K(p, H(n).label), K(h, H(n).description);
		}), U("click", r, () => t.onLayoutPreference(H(n).id)), G(e, r);
	}), A(c), A(s);
	var l = z(s, 2), u = R(l), d = z(R(u));
	X(R(d), { name: "rotate-ccw" }), j(), A(d), A(u);
	var f = z(u, 2);
	Gr(f, 21, () => r, (e) => e.id, (e, n) => {
		var r = xl(), a = R(r), o = R(a, !0);
		A(a);
		var s = z(a, 2);
		vi(s);
		var c = z(s, 2), l = R(c, !0);
		A(c), A(r), B((e, t) => {
			K(o, H(n).label), yi(s, e), Y(s, "aria-label", `${H(n).label} text size`), K(l, t);
		}, [() => Math.round(t.appearance.fontScales[H(n).id] * 100), () => i(t.appearance.fontScales[H(n).id])]), U("input", s, (e) => t.onFontScale(H(n).id, Number(e.currentTarget.value) / 100)), G(e, r);
	}), A(f), j(2), A(l), A(o), B(() => d.disabled = H(a)), U("click", d, function(...e) {
		t.onResetFontScales?.apply(this, e);
	}), G(e, o), N();
}
Sr(["click", "input"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var wl = /* @__PURE__ */ W("<small class=\"settings-notification-help\"> </small>"), Tl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function El(e, t) {
	M(t, !0);
	var n = Tl(), r = z(R(n), 2), i = R(r), a = z(R(i), 2);
	vi(a), A(i);
	var o = z(i, 2), s = (e) => {
		var n = wl(), r = R(n, !0);
		A(n), B(() => K(r, t.notifications.permissionError)), G(e, n);
	};
	q(o, (e) => {
		t.notifications.permissionError && e(s);
	}), A(r);
	var c = z(r, 2), l = R(c), u = z(R(l), 2);
	vi(u), A(l);
	var d = z(l, 2), f = R(d, !0);
	A(d), A(c), A(n), B(() => {
		bi(a, t.notifications.browser), bi(u, t.notifications.sound), K(f, t.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), U("change", a, (e) => t.onBrowserNotifications(e.currentTarget.checked)), U("change", u, (e) => t.onCompletionSound(e.currentTarget.checked)), G(e, n), N();
}
Sr(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var Dl = /* @__PURE__ */ W("<option> </option>"), Ol = /* @__PURE__ */ W("<label><span> </span><select></select></label>"), kl = /* @__PURE__ */ W("<span class=\"settings-profile-system-label\">System</span>"), Al = /* @__PURE__ */ W("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), jl = /* @__PURE__ */ W("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), Ml = /* @__PURE__ */ W("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>New Resource Defaults</h3><span>Applied once at creation</span></div> <div class=\"settings-resource-defaults\"></div> <p class=\"settings-resource-default-note\">Existing resources keep their explicit binding. Changing a profile route replaces its referenced resource generations at a safe turn boundary.</p></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function Nl(e, t) {
	M(t, !0);
	let n = Ai(t, "draft", 15), r = Ai(t, "pending", 15), i = /* @__PURE__ */ new Set([
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
				await t.onSaveAgentHub(ll(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(ul(e));
			} finally {
				r("");
			}
		}
	}
	var f = Ml(), p = z(R(f), 2), m = z(R(p), 2);
	Gr(m, 20, () => [
		["workspace", "Workspace"],
		["project", "Project"],
		["task", "Task"]
	], Vr, (e, t) => {
		let r = /* @__PURE__ */ P(() => t[0]);
		var i = Ol(), a = R(i), o = R(a, !0);
		A(a);
		var s = z(a);
		Gr(s, 21, () => u(H(r)), Vr, (e, t) => {
			var n = Dl(), r = R(n);
			A(n);
			var i = {};
			B(() => {
				K(r, `${H(t).key ?? ""}${H(t).agentName ? "" : " (Missing)"}`), i !== (i = H(t).key) && (n.value = (n.__value = H(t).key) ?? "");
			}), G(e, n);
		}), A(s);
		var c;
		di(s), A(i), B(() => {
			K(o, t[1]), Y(s, "aria-label", `${t[1]} default profile`), c !== (c = n().resourceDefaults[H(r)]) && (s.value = (s.__value = n().resourceDefaults[H(r)]) ?? "", ui(s, n().resourceDefaults[H(r)]));
		}), U("change", s, (e) => l(H(r), e.currentTarget.value)), G(e, i);
	}), A(m), j(2), A(p);
	var h = z(p, 2), g = R(h), _ = z(R(g)), v = R(_);
	A(_), A(g);
	var y = z(g, 2), b = z(R(y), 2);
	Gr(b, 17, () => n().profiles, Vr, (e, t, n) => {
		let r = /* @__PURE__ */ P(() => i.has(H(t).key.trim().toLowerCase()));
		var o = jl();
		let l;
		var u = R(o);
		vi(u);
		var d = z(u, 2);
		vi(d);
		var f = z(d, 2);
		Gr(f, 21, () => c(H(t).agentName), Vr, (e, t) => {
			var n = Dl(), r = R(n, !0);
			A(n);
			var i = {};
			B(() => {
				K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
			}), G(e, n);
		}), A(f);
		var p;
		di(f);
		var m = z(f, 2), h = (e) => {
			G(e, kl());
		}, g = (e) => {
			var t = Al();
			X(R(t), { name: "trash-2" }), A(t), U("click", t, () => s(n)), G(e, t);
		};
		q(m, (e) => {
			H(r) ? e(h) : e(g, -1);
		}), A(o), B(() => {
			l = J(o, 1, "settings-profile-row", null, l, { "settings-profile-system": H(r) }), yi(u, H(t).key), u.disabled = H(r), yi(d, H(t).description), d.disabled = H(r), p !== (p = H(t).agentName) && (f.value = (f.__value = H(t).agentName) ?? "", ui(f, H(t).agentName));
		}), U("input", u, (e) => a(n, "key", e.currentTarget.value)), U("input", d, (e) => a(n, "description", e.currentTarget.value)), U("change", f, (e) => a(n, "agentName", e.currentTarget.value)), G(e, o);
	});
	var x = z(b, 2), S = R(x);
	vi(S);
	var C = z(S, 2);
	vi(C);
	var w = z(C, 2);
	Gr(w, 21, () => t.agents, Vr, (e, t) => {
		var n = Dl(), r = R(n, !0);
		A(n);
		var i = {};
		B(() => {
			K(r, H(t).label), i !== (i = H(t).id) && (n.value = (n.__value = H(t).id) ?? "");
		}), G(e, n);
	}), A(w);
	var T = z(w, 2);
	X(R(T), { name: "plus" }), j(), A(T), A(x), A(y), A(h);
	var E = z(h, 2), D = R(E);
	let ee;
	var te = R(D, !0);
	A(D);
	var ne = z(D);
	X(R(ne), { name: "save" }), j(), A(ne), A(E), A(f), B((e) => {
		K(v, `${n().profiles.length ?? ""} routes`), w.disabled = !t.agents.length, T.disabled = !t.agents.length, ee = J(D, 1, "settings-save-hint", null, ee, { visible: n().dirty }), K(te, n().dirty ? "Unsaved changes" : ""), ne.disabled = e;
	}, [() => !n().dirty || !!r()]), wi(S, () => n().newProfile.key, (e) => n(n().newProfile.key = e, !0)), wi(C, () => n().newProfile.description, (e) => n(n().newProfile.description = e, !0)), fi(w, () => n().newProfile.agentName, (e) => n(n().newProfile.agentName = e, !0)), U("click", T, o), U("click", ne, d), G(e, f), N();
}
Sr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var Pl = /* @__PURE__ */ W("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), Fl = /* @__PURE__ */ W("<button type=\"button\"><!> <span> </span> <!></button>"), Il = /* @__PURE__ */ W("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function Ll(e, t) {
	M(t, !0);
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
	var r = Il();
	Gr(z(R(r), 2), 17, () => n, (e) => e.id, (e, n) => {
		var r = Fl();
		let i;
		var a = R(r);
		X(a, { get name() {
			return H(n).icon;
		} });
		var o = z(a, 2), s = R(o, !0);
		A(o);
		var c = z(o, 2), l = (e) => {
			G(e, Pl());
		};
		q(c, (e) => {
			H(n).sharesAgentDraft && e(l);
		}), A(r), B(() => {
			i = J(r, 1, "settings-tab", null, i, {
				active: t.activeTab === H(n).id,
				dirty: t.dirty && H(n).sharesAgentDraft
			}), Y(r, "aria-current", t.activeTab === H(n).id ? "page" : void 0), K(s, H(n).label);
		}), U("click", r, () => t.onSelect(H(n).id)), G(e, r);
	}), A(r), G(e, r), N();
}
Sr(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var Rl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function zl(e, t) {
	M(t, !0);
	let n = Ai(t, "draft", 15), r = Ai(t, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n(n().userName = await t.onSaveUser(n().userName), !0);
			} catch (e) {
				t.onToast(ul(e));
			} finally {
				r("");
			}
		}
	}
	var a = Rl(), o = z(R(a), 2), s = R(o), c = z(R(s), 2);
	vi(c), j(2), A(s);
	var l = z(s, 2), u = R(l);
	X(R(u), { name: "save" }), j(), A(u), A(l), A(o), A(a), B(() => u.disabled = r() === "user"), xr("submit", o, i), wi(c, () => n().userName, (e) => n(n().userName = e, !0)), G(e, a), N();
}
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var Bl = /* @__PURE__ */ W("<span class=\"settings-pill\">Active</span>"), Vl = /* @__PURE__ */ W("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), Hl = /* @__PURE__ */ W("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Ul = /* @__PURE__ */ W("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), Wl = /* @__PURE__ */ W("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Gl = /* @__PURE__ */ W("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function Kl(e, t) {
	M(t, !0);
	let n = Ai(t, "draft", 15), r = Ai(t, "pending", 15), i = /* @__PURE__ */ I("");
	async function a(e) {
		if (e.preventDefault(), !(!n().workspacePath.trim() || r())) {
			r("workspace");
			try {
				await t.onAddWorkspace(ll(n())), n(n().workspacePath = "", !0), n(n().createWorkspace = !1, !0);
			} catch (e) {
				t.onToast(ul(e));
			} finally {
				r("");
			}
		}
	}
	async function o(e) {
		if (!r()) {
			r(`remove:${e}`);
			try {
				await t.onRemoveWorkspace(e, ll(n()));
			} catch (e) {
				t.onToast(ul(e));
			} finally {
				r("");
			}
		}
	}
	async function s(e, a) {
		if (!r()) {
			r(`icon:${e}`), L(i, "");
			try {
				await t.onWorkspaceIcon(e, a, ll(n()));
			} catch (e) {
				t.onToast(ul(e));
			} finally {
				r("");
			}
		}
	}
	function c(e) {
		let n = t.workspaces.find((t) => t.id === e);
		return t.workspaceIcons.find((e) => e.id === (n?.icon || "")) || t.workspaceIcons[0];
	}
	var l = Gl(), u = z(R(l), 2), d = R(u);
	vi(d);
	var f = z(d, 2), p = R(f);
	vi(p), j(2), A(f);
	var m = z(f, 2), h = R(m);
	X(h, { name: "plus" });
	var g = z(h), _ = R(g, !0);
	A(g), A(m), A(u);
	var v = z(u, 2);
	Gr(v, 21, () => t.workspaces, (e) => e.id, (e, n) => {
		let a = /* @__PURE__ */ P(() => c(H(n).id));
		var l = Ul(), u = R(l), d = R(u), f = R(d), p = R(f);
		A(f);
		var m = z(f, 2), h = R(m), g = R(h, !0);
		A(h);
		var _ = z(h), v = R(_, !0);
		A(_), A(m), A(d);
		var y = z(d, 2), b = R(y), x = (e) => {
			G(e, Bl());
		};
		q(b, (e) => {
			H(n).id === t.activeWorkspaceId && e(x);
		});
		var S = z(b, 2), C = R(S), w = z(C, 2), T = R(w, !0);
		A(w), X(z(w, 2), { name: "chevron-down" }), A(S);
		var E = z(S, 2);
		X(R(E), { name: "trash-2" }), A(E), A(y), A(u);
		var D = z(u, 2), ee = (e) => {
			var r = Hl();
			Gr(r, 21, () => t.workspaceIcons, (e) => e.id, (e, t) => {
				var r = Vl();
				let i;
				var o = R(r), c = z(o), l = R(c, !0);
				A(c);
				var u = z(c), d = (e) => {
					X(e, { name: "check" });
				};
				q(u, (e) => {
					H(t).id === H(a).id && e(d);
				}), A(r), B(() => {
					Y(r, "aria-checked", H(t).id === H(a).id), Y(r, "title", H(t).label), i = J(r, 1, "", null, i, { selected: H(t).id === H(a).id }), Y(o, "src", H(t).src), K(l, H(t).label);
				}), U("click", r, () => s(H(n).id, H(t).id)), G(e, r);
			}), A(r), B(() => Y(r, "aria-label", `Icon for ${H(n).name}`)), G(e, r);
		};
		q(D, (e) => {
			H(i) === H(n).id && e(ee);
		}), A(l), B((e, t) => {
			Y(p, "src", H(a).src), K(g, H(n).name), K(v, H(n).path), Y(S, "aria-expanded", H(i) === H(n).id), S.disabled = e, Y(C, "src", H(a).src), K(T, r() === `icon:${H(n).id}` ? "Saving..." : H(a).label), E.disabled = t;
		}, [() => !!r(), () => !!r()]), U("click", S, () => L(i, H(i) === H(n).id ? "" : H(n).id, !0)), U("click", E, () => o(H(n).id)), G(e, l);
	}, (e) => {
		G(e, Wl());
	}), A(v), A(l), B((e) => {
		m.disabled = e, K(_, n().createWorkspace ? "Create" : "Add");
	}, [() => !!r()]), xr("submit", u, a), wi(d, () => n().workspacePath, (e) => n(n().workspacePath = e, !0)), Ti(p, () => n().createWorkspace, (e) => n(n().createWorkspace = e, !0)), G(e, l), N();
}
Sr(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var ql = /* @__PURE__ */ W("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function Jl(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(Zt(t.channel.current())), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(-1), a = /* @__PURE__ */ I(Zt(cl(H(n)))), o = /* @__PURE__ */ I("");
	ji(() => t.channel.subscribe((e) => {
		L(n, e, !0), e.identity === H(r) ? e.dataVersion !== H(i) && !H(a).dirty && (L(i, e.dataVersion, !0), L(a, cl(e), !0)) : (L(r, e.identity, !0), L(i, e.dataVersion, !0), L(a, cl(e), !0), L(o, "")), queueMicrotask(e.onIconsChanged);
	})), ji(() => {
		let e = (e) => {
			H(n).open && e.key === "Escape" && (e.preventDefault(), H(n).onClose(H(a).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function s() {
		H(a).dirty = !0;
	}
	var c = Mr(), l = ln(c), u = (e) => {
		var t = ql(), r = ln(t), i = z(r, 2), c = R(i);
		Ll(c, {
			get activeTab() {
				return H(a).tab;
			},
			get dirty() {
				return H(a).dirty;
			},
			onSelect: (e) => H(a).tab = e
		});
		var l = z(c, 2), u = R(l);
		X(R(u), { name: "x" }), A(u);
		var d = z(u, 2), f = (e) => {
			Kl(e, {
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
					L(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					L(o, e, !0);
				}
			});
		}, p = (e) => {
			zl(e, {
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
					L(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					L(o, e, !0);
				}
			});
		}, m = (e) => {
			Cl(e, {
				get appearance() {
					return H(n).appearance;
				},
				get onLayoutPreference() {
					return H(n).onLayoutPreference;
				},
				get onFontScale() {
					return H(n).onFontScale;
				},
				get onResetFontScales() {
					return H(n).onResetFontScales;
				}
			});
		}, h = (e) => {
			hl(e, {
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
					L(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					L(o, e, !0);
				}
			});
		}, g = (e) => {
			Nl(e, {
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
					L(a, e, !0);
				},
				get pending() {
					return H(o);
				},
				set pending(e) {
					L(o, e, !0);
				}
			});
		}, _ = (e) => {
			El(e, {
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
			H(a).tab === "workspace" ? e(f) : H(a).tab === "user" ? e(p, 1) : H(a).tab === "appearance" ? e(m, 2) : H(a).tab === "agenthub" ? e(h, 3) : H(a).tab === "profiles" ? e(g, 4) : e(_, -1);
		}), A(l), A(i), U("click", r, () => H(n).onClose(H(a).dirty)), U("click", u, () => H(n).onClose(H(a).dirty)), G(e, t);
	};
	q(l, (e) => {
		H(n).open && e(u);
	}), G(e, c), N();
}
Sr(["click"]);
//#endregion
//#region src/components/Toast.svelte
var Yl = /* @__PURE__ */ W("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function Xl(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(Zt(t.channel.current())), r = /* @__PURE__ */ I(!1), i = null;
	ji(() => {
		let e = t.channel.subscribe((e) => {
			L(n, e, !0), L(r, !!e.message, !0), i !== null && window.clearTimeout(i), H(r) && (i = window.setTimeout(() => {
				L(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = Yl(), o = R(a, !0);
	A(a), B(() => {
		Y(a, "hidden", !H(r)), K(o, H(n).message);
	}), G(e, a), N();
}
//#endregion
//#region src/components/UploadDialog.svelte
var Zl = /* @__PURE__ */ W("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), Ql = /* @__PURE__ */ W("<small class=\"upload-result-path\"> </small>"), $l = /* @__PURE__ */ W("<small class=\"upload-error\"> </small>"), eu = /* @__PURE__ */ W("<div><div class=\"upload-item-heading\"><span class=\"upload-item-status-icon\"><span class=\"upload-item-status upload-item-status-queued\"><!></span><span class=\"upload-item-status upload-item-status-uploading\"><!></span><span class=\"upload-item-status upload-item-status-success\"><!></span><span class=\"upload-item-status upload-item-status-error\"><!></span></span><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), tu = /* @__PURE__ */ W("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this resource's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function nu(e, t) {
	M(t, !0);
	let n = /* @__PURE__ */ I(Zt(t.channel.current())), r = /* @__PURE__ */ I(""), i = /* @__PURE__ */ I(Zt([])), a = 1, o = /* @__PURE__ */ I(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ P(() => H(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ P(() => H(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ P(() => H(i).filter((e) => e.status === "error").length);
	ji(() => {
		let e = t.channel.subscribe((e) => {
			L(n, e, !0), e.identity !== H(r) && (d(), L(r, e.identity, !0), L(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
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
		L(i, [...H(i), ...r], !0);
		for (let e of r) g(e, H(n).identity, H(n).workspaceId, H(n).resourceId);
	}
	function h(e, t) {
		L(i, H(i).map((n) => n.id === e ? {
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
	var b = Mr(), x = ln(b), S = (e) => {
		var t = tu(), n = R(t), r = z(n, 2), a = R(r), s = z(R(a), 2);
		X(R(s), { name: "x" }), A(s), A(a);
		var d = z(a, 2), f = R(d);
		ki(f, (e) => L(o, e), () => H(o));
		var p = z(f, 2), h = R(p);
		X(h, { name: "clipboard-paste" });
		var g = z(h, 4);
		X(R(g), { name: "folder-open" }), j(), A(g), A(p);
		var b = z(p, 2), x = R(b), S = (e) => {
			G(e, Zl());
		};
		q(x, (e) => {
			H(i).length || e(S);
		}), Gr(z(x, 2), 17, () => H(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ P(() => y(H(t)));
			var r = eu();
			let i;
			var a = R(r), o = R(a), s = R(o);
			X(R(s), { name: "clock-3" }), A(s);
			var c = z(s);
			X(R(c), { name: "loader-circle" }), A(c);
			var l = z(c);
			X(R(l), { name: "circle-check" }), A(l);
			var u = z(l);
			X(R(u), { name: "triangle-alert" }), A(u), A(o);
			var d = z(o), f = R(d), p = R(f, !0);
			A(f);
			var m = z(f), h = R(m, !0);
			A(m), A(d);
			var g = z(d), _ = R(g, !0);
			A(g), A(a);
			var b = z(a, 2), x = R(b);
			let S;
			A(b);
			var C = z(b, 2), w = (e) => {
				var n = Ql(), r = R(n, !0);
				A(n), B(() => K(r, H(t).path)), G(e, n);
			};
			q(C, (e) => {
				H(t).status === "success" && e(w);
			});
			var T = z(C, 2), E = (e) => {
				var n = $l(), r = R(n, !0);
				A(n), B(() => K(r, H(t).error || "Upload failed")), G(e, n);
			};
			q(T, (e) => {
				H(t).status === "error" && e(E);
			}), A(r), B((e) => {
				i = J(r, 1, "upload-item", null, i, {
					"upload-item-success": H(t).status === "success",
					"upload-item-error": H(t).status === "error",
					"upload-item-uploading": H(t).status === "uploading"
				}), K(p, H(t).name), K(h, e), K(_, H(n).label), Y(b, "aria-label", H(t).name), Y(b, "aria-valuenow", H(t).progress), S = li(x, "", S, { width: `${H(t).progress}%` });
			}, [() => v(H(t).size)]), G(e, r);
		}), A(b), A(d);
		var C = z(d, 2), w = R(C), T = R(w, !0);
		A(w);
		var E = z(w, 2);
		A(C), A(r), A(t), B(() => {
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
	}), G(e, b), N();
}
Sr([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var ru = /* @__PURE__ */ W("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div>", 1);
function iu(e, t) {
	M(t, !0);
	var n = ru(), r = ln(n);
	la(r, {
		get channel() {
			return t.channels.appShell;
		},
		details: (e) => {
			Is(e, { get channel() {
				return t.channels.detail;
			} });
		},
		timeline: (e) => {
			sl(e, { get channel() {
				return t.channels.timeline;
			} });
		},
		composer: (e) => {
			Sa(e, { get channel() {
				return t.channels.composer;
			} });
		},
		$$slots: {
			details: !0,
			timeline: !0,
			composer: !0
		}
	});
	var i = z(r, 2);
	Xl(R(i), { get channel() {
		return t.channels.toast;
	} }), A(i);
	var a = z(i, 2);
	nu(R(a), { get channel() {
		return t.channels.upload;
	} }), A(a);
	var o = z(a, 2);
	lo(R(o), { get channel() {
		return t.channels.create;
	} }), A(o);
	var s = z(o, 2);
	Jl(R(s), { get channel() {
		return t.channels.settings;
	} }), A(s), G(e, n), N();
}
//#endregion
//#region src/components/model-channel.ts
function au(e) {
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
var Z = () => void 0, ou = async () => void 0;
function su() {
	return {
		appShell: au({
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
			onSwitchWorkspace: ou,
			onAddWorkspace: Z,
			onCreateProject: Z,
			onOpenSettings: Z,
			onToggleProject: ou,
			onSelectResource: ou,
			onReorder: ou,
			onDragState: Z,
			onToggleAttention: ou,
			onDismissAttention: ou,
			onPanePreview: Z,
			onPaneCommit: Z,
			onPaneViewport: Z,
			onMobileSidebar: Z,
			onMobileView: Z,
			onMobileImmersive: Z,
			onToast: Z,
			onIconsChanged: Z,
			onHistoryNavigation: ou
		}),
		create: au({
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
			onPreview: ou,
			onSubmit: ou,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: () => !0,
			onIconsChanged: Z
		}),
		settings: au({
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
			onClose: Z,
			onAddWorkspace: ou,
			onRemoveWorkspace: ou,
			onWorkspaceIcon: ou,
			onSaveUser: async (e) => e,
			onSaveAgentHub: ou,
			onLayoutPreference: Z,
			onFontScale: Z,
			onResetFontScales: Z,
			onBrowserNotifications: Z,
			onCompletionSound: Z,
			onToast: Z,
			onIconsChanged: Z
		}),
		upload: au({
			open: !1,
			identity: "",
			workspaceId: "",
			resourceId: "",
			onDone: Z,
			onIconsChanged: Z
		}),
		composer: au({
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
			onSteerWaiting: ou,
			onSaveAgentBinding: ou,
			onIconsChanged: Z
		}),
		detail: au({
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
			onLoadMoreLogs: ou,
			onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
			onSaveAgentBinding: ou,
			onToast: Z,
			onIconsChanged: Z
		}),
		timeline: au({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			agentName: "Agent",
			project: () => [],
			onEvent: Z,
			onNotice: Z,
			onApproval: ou,
			onToast: Z,
			onIconsChanged: Z
		}),
		toast: au({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var cu = "forge.gui.agentDraft.v2", lu = 2, uu = 50, du = 7776e6;
function fu(e) {
	return encodeURIComponent(String(e || "").trim());
}
function pu(e) {
	return String(e || "").trim() || "workspace";
}
function mu(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? uu, r = e.maxAgeMs ?? du;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function a(e, t) {
		let n = String(e || "").trim(), r = pu(t);
		return !n || !r ? "" : `${cu}.resource.${fu(n)}.${fu(r)}`;
	}
	function o(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== lu || typeof t.text != "string" ? null : {
				version: lu,
				text: t.text,
				updatedAt: Number(t.updatedAt) || 0,
				workspaceId: String(t.workspaceId || ""),
				resourceId: pu(t.resourceId),
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
				version: lu,
				text: n,
				updatedAt: t(),
				workspaceId: r.workspaceId,
				resourceId: pu(r.resourceId),
				generationId: String(r.generationId || "") || void 0
			}));
		} catch {}
	}
	function d(e, a, o) {
		let c = i(), u = String(e || "").trim(), d = pu(a);
		if (!c || !u) return;
		let f = `${cu}.resource.${fu(u)}.`, p = [], m = t();
		try {
			for (let e = 0; e < c.length; e++) {
				let t = c.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = s(t);
				if (!(!n || pu(n.resourceId) !== d || o.has(t))) {
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
function hu(e) {
	let t = mu(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForResource(r, pu(n));
	}
	function i(e, t) {
		let r = /* @__PURE__ */ new Set();
		return n.ttyDraftWorkspaceId === e && n.ttyDraftResourceId === t && n.ttyDraftKey && r.add(n.ttyDraftKey), r;
	}
	function a(r = e.workspaceId(), a = n.ttyDraftResourceId) {
		let o = r.trim(), s = pu(a);
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
		let l = pu(i), u = r(l, o);
		if (!u) return c();
		n.ttyDraftKey !== u && (n.ttyDraftKey = u, n.ttyDraftWorkspaceId = o.trim(), n.ttyDraftResourceId = l, n.ttyDraft = t.read(u), n.ttyMultiline = n.ttyDraft.includes("\n"), n.ttyDraftVersion++, a(n.ttyDraftWorkspaceId, n.ttyDraftResourceId));
	}
	function u(r) {
		return e.workspaceId() !== r.workspaceId || n.ttyDraftResourceId !== pu(r.resourceId) || n.ttyDraftKey !== r.key || n.ttyDraft !== r.text || n.ttyDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
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
function gu(e) {
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
function _u(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function vu(e) {
	let t = String(e?.id || "").trim();
	if (!t) throw Error("The created resource did not return an id.");
	return t;
}
function yu(e) {
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
function bu(e) {
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
function xu(e) {
	let t = 0, n = yu(t), r = 0, i = null, a = "";
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
			previewRequestKey: (e) => JSON.stringify(bu({
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
			...yu(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = yu(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = bu({
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
			n.previewError = _u(e);
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
			if (n.type === "project") r = vu(await e.request(`/api/workspaces/${i}/projects`, {
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
					t = bu(n);
				}
				r = vu(await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				})), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1;
			let s = ++t;
			n.identity = s, await e.reloadTree(), i === e.workspaceId() && n.identity === s && await e.selectResource(r);
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(_u(t)));
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
function Su() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function Cu(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.generationId}`;
}
function wu(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function Tu(e) {
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
		if (!(!e.settings().browser || Su() !== "granted")) try {
			let n = new window.Notification(Cu(t), {
				body: wu(t),
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
		n.browser && Su() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = Su();
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
			permission: Su(),
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
var Eu = "forge.gui.notifications.v1", Du = `${Eu}.settings`;
function Ou(e) {
	return e && typeof e == "object" ? e : null;
}
function ku(e) {
	let t = Ou(e);
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
function Au() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function ju(e) {
	let t = Ou(e);
	if (!t || t.version !== 1) return Au();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = Ou(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(ku).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(ku).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = Ou(e);
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
function Mu(e) {
	let t = e.trim();
	return t ? `${Eu}.state.${encodeURIComponent(t)}` : "";
}
function Nu(e) {
	function t(t) {
		let n = Mu(t);
		if (!e || !n) return Au();
		try {
			let t = e.getItem(n);
			if (!t) return Au();
			let r = ju(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return Au();
		}
	}
	function n(t, n) {
		let r = ju(n), i = Mu(t);
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
			let t = Ou(JSON.parse(e.getItem(Du) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(Du);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(Du, JSON.stringify({
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
function Pu(e) {
	let t = String(e.completionMarker || "").trim();
	if (t) return t;
	let n = String(e.generationId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function Fu(e) {
	return String(e.generationId || e.id || "").trim();
}
function Iu(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function Lu(e, t) {
	let n = String(e.resourceId || "").trim(), r = t.findResource(n), i = Fu(e);
	return !n || !i ? null : ku({
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
function Ru(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function zu(e) {
	let t = Nu(Ru(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= Au(), n.store;
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
	let g = Tu({
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
			let r = new t(`${Eu}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), Su() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
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
			let n = ku(t.record);
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
		let a = Pu(t);
		if (!a || !n.workspaceId) return !1;
		let s = Lu(t, {
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
		for (let t of e) Pu(t) && x(t, t.completionState || "");
	}
	function C(e, t) {
		let n = Iu(e);
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
			r.key === Mu(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.refreshIcons()), r.key === Du && (n.settings = t.readSettings(), Su() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
		}), e.scope.listen(document, "visibilitychange", () => {
			e.flushDraft(), c() && E(e.selectedResourceId());
		}), e.scope.listen(window, "focus", () => E(e.selectedResourceId()));
	}
	function ee() {
		return i(), g.preferences();
	}
	function te() {
		_(), g.dispose();
	}
	return {
		initialize: y,
		install: D,
		dispose: te,
		establishBaseline: w,
		observeProjections: S,
		observeEvent: C,
		clearResource: E,
		preferences: ee,
		setBrowserEnabled: g.setBrowserEnabled,
		setSoundEnabled: g.setSoundEnabled
	};
}
//#endregion
//#region src/controllers/pane-layout-controller.ts
var Bu = "forge.gui.paneSizes", Vu = "forge.gui.mobileImmersive", Hu = "forge.gui.layoutPreference", Uu = "forge.gui.fontScales", Wu = 8, Gu = 220, Ku = 360, qu = 320, Ju = 1e4, Yu = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarAttentionHeight: 210
}), Xu = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarAttentionHeight: "--sidebar-attention-height"
});
function Zu(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function Qu(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var $u = [
	"auto",
	"three",
	"two",
	"split"
];
function ed(e) {
	return $u.includes(e) ? e : "auto";
}
var td = .8, nd = 1.4, rd = 1, id = [
	"sidebar",
	"details",
	"chat"
], ad = Object.freeze({
	sidebar: "--sidebar-font-scale",
	details: "--details-font-scale",
	chat: "--chat-font-scale"
});
function od(e) {
	return Qu(e) ? Math.round(Zu(e, td, nd) * 100) / 100 : rd;
}
function sd(e) {
	let t = e && typeof e == "object" ? e : {};
	return {
		sidebar: od(t.sidebar),
		details: od(t.details),
		chat: od(t.chat)
	};
}
function cd(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...Yu };
	if (Qu(n.sidebarWidth) && (r.sidebarWidth = Zu(n.sidebarWidth, Gu, Ju)), Qu(n.chatWidth)) r.chatWidth = Zu(n.chatWidth, qu, Ju);
	else if (Qu(n.detailsWidth) && t >= 688) {
		let e = Zu(n.detailsWidth, Ku, t - Wu - qu);
		r.chatWidth = Zu(t - Wu - e, qu, Ju);
	}
	let i = Qu(n.sidebarAttentionHeight) ? n.sidebarAttentionHeight : n.sidebarSessionHeight;
	return Qu(i) && (r.sidebarAttentionHeight = Zu(i, 84, Ju)), r;
}
function ld(e, t = window.localStorage) {
	let n = { ...Yu }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = sd(null), o = window.matchMedia("(max-width: 980px)"), s = window.matchMedia("(max-width: 1440px)");
	function c() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Bu) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function l() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(Uu) || "{}");
			return e && typeof e == "object" && !Array.isArray(e) ? e : {};
		} catch {
			return {};
		}
	}
	function u(e) {
		document.documentElement.style.setProperty(ad[e], String(a[e]));
	}
	function d() {
		for (let e of id) u(e);
	}
	function f() {
		return document.querySelector(".workspace-panel")?.getBoundingClientRect().width || 0;
	}
	function p(e, t) {
		document.documentElement.style.setProperty(e, `${Math.round(t)}px`);
	}
	function m(e, t) {
		if (!Object.hasOwn(Xu, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(Zu(t, r === "sidebarWidth" ? Gu : r === "chatWidth" ? qu : 84, Ju));
		n[r] = i, p(Xu[r], i);
	}
	function h() {
		for (let e of Object.keys(Xu)) m(e, n[e]);
	}
	function g() {
		t?.setItem(Bu, JSON.stringify(n));
	}
	function _() {
		let u = c();
		n = cd(u, 0), h();
		let p = Qu(u.sidebarSessionHeight) && !Qu(u.sidebarAttentionHeight);
		Qu(u.detailsWidth) && !Qu(u.chatWidth) && !o.matches && (n = cd(u, f()), h(), p = !0), p && g();
		try {
			r.immersive = t?.getItem(Vu) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = ed(t?.getItem(Hu));
		} catch {
			i = "auto";
		}
		x(), a = sd(l()), d();
		let m = () => {
			x(), e();
		};
		o.addEventListener?.("change", m), s.addEventListener?.("change", m);
	}
	function v(e) {
		if (!Object.hasOwn(Xu, e) || !t) return;
		let r = e, i = c();
		delete i.detailsWidth, delete i.sidebarSessionHeight;
		for (let e of Object.keys(Xu)) Qu(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(Bu, JSON.stringify(i));
	}
	function y() {
		if (o.matches) return;
		let e = c();
		!Qu(e.detailsWidth) || Qu(e.chatWidth) || (n = cd(e, f()), h(), g());
	}
	function b() {
		return o.matches ? "single" : i === "auto" ? s.matches ? "two" : "three" : i;
	}
	function x() {
		document.body.dataset.layout = b();
	}
	function S(n) {
		i = ed(n);
		try {
			t?.setItem(Hu, i);
		} catch {}
		x(), e();
	}
	function C(n, r) {
		if (Object.hasOwn(ad, n)) {
			a[n] = od(r), u(n);
			try {
				t?.setItem(Uu, JSON.stringify(a));
			} catch {}
			e();
		}
	}
	function w() {
		a = sd(null), d();
		try {
			t?.removeItem(Uu);
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
			t?.setItem(Vu, r.immersive ? "1" : "0");
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
function ud(e, t) {
	let n = Date.parse(String(e?.time || "")), r = Date.parse(String(t?.time || ""));
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t?.time || "").localeCompare(String(e?.time || ""));
}
function dd(e, t, n) {
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
	return r.sort(ud);
}
function fd(e, t = 10, n = 20) {
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
			logs: dd([], o, !0),
			logPage: {
				hasMore: c.hasMore,
				nextCursor: c.nextCursor
			}
		}, e.details[r];
		let l = e.details[r], u = dd(l.logs || [], o, n !== "older");
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
			d(r, t, a, l) && (a.error = _u(e, "Could not load older logs."));
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
function pd(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function md(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: pd(t[1]),
		resourceId: t[2] === "r" ? pd(t[3]) : "workspace"
	} : {};
}
function hd(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function gd(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = hd(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => md(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/controllers/settings-controller.ts
function _d(e, t) {
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
function vd(e) {
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
		}), await o(), e.setConfig(_d(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: _d
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var yd = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering",
	"stopping"
]), bd = 6e4;
function xd(e) {
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
		if (Number.isFinite(n)) return t() - n <= bd;
		if (!yd.has(e.status || "")) return !1;
		let r = new Date(e.updatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= bd;
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
		let t = (e.children || []).filter((e) => e.archived !== !0), n = t.filter((e) => yd.has(e.runtime?.status || "")).length, r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n} working`;
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
var Sd = "forge.gui.user.v1", Cd = 1, wd = 80;
function Td(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, wd).join("") || "User";
}
function Ed(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Cd ? "User" : Td(t.name);
	} catch {
		return "User";
	}
}
function Dd(e, t) {
	let n = r();
	function r() {
		try {
			return Ed(window.localStorage.getItem(Sd));
		} catch {
			return "User";
		}
	}
	function i(e) {
		let t = Td(e);
		try {
			window.localStorage.setItem(Sd, JSON.stringify({
				version: Cd,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return n = t, n;
	}
	return e.listen(window, "storage", (e) => {
		e.key === Sd && (n = Ed(e.newValue), t());
	}), {
		current: () => n,
		save: i
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var Od = class {
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
}, kd = 400, Ad = 12e3;
function jd(e, t = kd) {
	let n = String(e ?? "");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function Md(e) {
	if (e == null) return "";
	try {
		return jd(JSON.stringify(e));
	} catch {
		return "";
	}
}
function Nd(e) {
	let t = String(e || "").replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function Pd(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string").join(" ") : typeof e == "string" ? e : "";
}
function Q(...e) {
	for (let t of e) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
var Fd = /* @__PURE__ */ new Set([
	"user",
	"system",
	"agent",
	"assistant"
]);
function Id(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return;
	let t = {};
	for (let n of [
		"id",
		"name",
		"sessionId"
	]) typeof e[n] == "string" && e[n].trim() && (t[n] = e[n].trim());
	return Object.keys(t).length ? t : void 0;
}
function Ld(e) {
	let t = typeof e == "string" ? e.trim().toLowerCase() : "";
	return Fd.has(t) ? t : "user";
}
function Rd(e) {
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
function zd(e) {
	if (!Array.isArray(e)) return "";
	let t = [];
	for (let n of e) typeof n?.text == "string" ? t.push(n.text) : typeof n?.content?.text == "string" ? t.push(n.content.text) : n?.type === "diff" && typeof n?.path == "string" && t.push(`Edit ${n.path}`);
	return t.filter(Boolean).join("\n");
}
function Bd(e) {
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
		let a = Q(e.id, r.itemId), o = Nd(t) || "Tool", s = "", c = "", l = "";
		t === "commandExecution" ? (o = "Command", s = Pd(e.command) || Q(e.cmd), c = Q(e.aggregatedOutput, e.output), typeof e.exitCode == "number" && e.exitCode !== 0 && (l = `Exit code ${e.exitCode}`)) : t === "fileChange" ? (o = "File change", s = (Array.isArray(e.changes) ? e.changes.map((e) => e?.path).filter(Boolean) : []).join(", ")) : t === "mcpToolCall" ? (o = "MCP", s = [e.server, e.tool].filter((e) => typeof e == "string" && e).join(" / "), c = typeof e.result == "string" ? e.result : Md(e.result), l = Q(e.error?.message, typeof e.error == "string" ? e.error : "")) : t === "webSearch" ? (o = "Web search", s = Q(e.query)) : (s = Q(e.title, e.name, Pd(e.command), e.path), c = Q(e.output, e.aggregatedOutput));
		let u = Rd(e.status);
		return n === "item/started" && (u = "running"), n === "item/completed" && u === "running" && (u = "completed"), l && u === "completed" && (u = "failed"), {
			callId: a,
			method: n,
			time: i,
			name: o,
			status: u,
			error: l,
			summary: jd(s.replace(/\s+/g, " ").trim(), 120),
			output: jd(c, Ad)
		};
	}
	let a = r.update && typeof r.update == "object" ? r.update : r, o = Q(a.sessionUpdate);
	if (o === "tool_call" || o === "tool_call_update") {
		let e = Q(a.toolCallId, a.id), t = a.rawInput && typeof a.rawInput == "object" ? a.rawInput : {}, r = Q(a.title, Pd(t.command), t.path, t.filePath, Nd(a.kind));
		return {
			callId: e,
			method: n,
			time: i,
			name: Nd(a.kind) || "Tool",
			status: Rd(a.status || (o === "tool_call" ? "in_progress" : "")),
			summary: jd(r.replace(/\s+/g, " ").trim(), 120),
			output: jd(zd(a.content), Ad),
			error: ""
		};
	}
	if (n === "tool_execution_start" || n === "tool_execution_end") {
		let e = Q(r.toolName, r.name, r.tool), t = r.args && typeof r.args == "object" ? r.args : {}, a = Q(Pd(t.command), t.path, t.filePath, ""), o = r.isError === !0 || !!Q(r.error);
		return {
			callId: Q(r.toolCallId, r.callId, e),
			method: n,
			time: i,
			name: Nd(e) || "Tool",
			status: n === "tool_execution_start" ? "running" : o ? "failed" : "completed",
			summary: jd(a.replace(/\s+/g, " ").trim(), 120),
			output: jd(Q(typeof r.result == "string" ? r.result : "", zd(r.result?.content)), Ad),
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
function Vd(e) {
	let t = e?.data ?? {}, n = Q(t.method), r = t.params && typeof t.params == "object" ? t.params : {}, i = Array.isArray(r.options) ? r.options.map((e) => ({
		optionId: Q(e?.optionId),
		name: Q(e?.name),
		kind: Q(e?.kind)
	})).filter((e) => e.optionId) : [], a = Pd(r.command) || Pd(r?.rawInput?.command);
	if (a) return {
		title: "Run command",
		detail: jd(a, 160),
		question: "",
		options: i
	};
	let o = Array.isArray(r.changes) ? r.changes.map((e) => e?.path).filter(Boolean) : [];
	if (r.toolCall && typeof r.toolCall == "object") {
		let e = Q(r.toolCall.title, r.toolCall.kind && Nd(r.toolCall.kind)), t = zd(r.toolCall.content);
		return {
			title: e || "Permission requested",
			detail: "",
			question: t,
			options: i
		};
	}
	return o.length ? {
		title: "Apply file changes",
		detail: jd(o.join(", "), 160),
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
var Hd = {
	accept: "Allowed",
	acceptForSession: "Allowed for this session",
	decline: "Declined",
	cancel: "Cancelled"
}, Ud = {
	failed: "Session failed",
	stopping: "Stopping provider",
	stopped: "Session stopped",
	archived: "Session archived"
}, Wd = {
	requested: "requested",
	completed: "provider completed",
	provider_error: "provider error",
	startup_error: "startup error",
	daemon_recovery: "daemon recovery"
};
function Gd(e) {
	return e === "message.delivery" || e === "provider.event" || e === "provider.metadata" || e === "plan.event" || e === "provider.stderr" || e === "provider.turn.started" || e === "provider.turn.completed" || e.startsWith("provider.process.");
}
function Kd(e, t) {
	let n = { ...e };
	return t.name && (n.name = t.name), t.summary && (n.summary = t.summary), t.status && (n.status = t.status), t.error && (n.error = t.error), t.deltaOnly ? n.output = jd((n.output || "") + (t.output || ""), Ad) : t.output && (n.output = t.output), n.time = t.time || e.time, n.key = e.key, n;
}
function qd(e, t) {
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
		rawPreview: Md(t?.data?.raw)
	};
}
function Jd(e) {
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
					role: Ld(o.role),
					key: a.id,
					time: s,
					steer: o.steer === !0,
					text: typeof o.text == "string" ? o.text : ""
				};
				a.turnId && (e.turnId = a.turnId);
				let n = Id(o.sender);
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
				let e = Bd(a);
				if (!e) break;
				let n = t.at(-1), i = n?.kind === "tools" ? n : null, o = e.callId ? r.get(e.callId) : null;
				if (o) Object.assign(o.call, Kd(o.call, e)), o.group.time = s, o.call.status !== "running" && r.delete(e.callId);
				else {
					if (e.deltaOnly) break;
					let n = i || {
						kind: "tools",
						key: a.id,
						calls: [],
						time: s
					}, o = qd(e, a);
					n.calls.push(o), n.time = s, i || t.push(n), o.callId && o.status === "running" && r.set(o.callId, {
						call: o,
						group: n
					});
				}
				break;
			}
			case "approval.requested": {
				let { title: e, detail: r, question: i, options: c } = Vd(a), l = {
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
				let e = Q(o.approvalId), r = Q(o.decision) || "decline", i = Q(o.optionId), c = Q(o.text), l = e ? n.get(e) : null, u = (e) => r === "text" ? "Replied" : i ? `Answered: ${e?.options?.find((e) => e.optionId === i)?.name || i}` : Hd[r] || Nd(r), d = r === "accept" || r === "acceptForSession" || r === "text";
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
				let e = Ud[o.state];
				o.state === "failed" ? i("failed", s) : o.state === "stopped" && i(o.reason === "completed" ? "completed" : "failed", s), o.state === "stopped" && Wd[o.reason] && (e += ` · ${Wd[o.reason]}`);
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
				if (Gd(e)) break;
				t.push({
					kind: "unknown",
					key: a.id,
					time: s,
					type: e || "unknown",
					preview: Md(o)
				});
		}
	}
	let a = t.at(-1);
	return a?.kind === "thinking" && (a.active = !0), t;
}
//#endregion
//#region src/app-controller.ts
var Yd, Xd = null, $ = {
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
function Zd() {
	for (let e of Object.keys($.details)) delete $.details[e];
	for (let e of Object.keys($.resourceLogPages)) delete $.resourceLogPages[e];
}
var Qd = hu({
	runtime: $.agent,
	workspaceId: () => $.activeWorkspaceId
}), $d = Qd.clearResourceAfterAccepted, ef = Qd.clearMemory, tf = Qd.flush, nf = Qd.restoreResource, rf = Qd.update, af = gu(() => {
	Im && (Hp(), Em());
}), of = ld(() => sp()), sf = gd(() => sp()), cf = fd({
	details: $.details,
	pages: $.resourceLogPages,
	context: () => ({
		workspaceId: $.activeWorkspaceId,
		navigationVersion: $.navigationVersion,
		selectedId: $.selectedId,
		detailRequestVersion: $.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++$.detailRequestVersion,
	isCurrentWorkspace: (e, t) => $f(e, t),
	request: (e, t) => Lf(e, t),
	render: mp,
	refreshIcons: Em
}), lf = xu({
	workspaceId: () => $.activeWorkspaceId,
	templates: (e) => $.details[e]?.templates || [],
	request: (e, t) => Lf(e, t),
	publish: (e) => Yd.renderCreateDialog(e),
	toast: Tm,
	reloadTree: () => zf(),
	selectResource: (e) => up(e),
	onOpen: () => {
		$.modalEnter = "create";
	},
	onIconsChanged: Em,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
}), uf = (e) => document.getElementById(e), df = 5e3, ff = 10, pf = /* @__PURE__ */ new Set(["session.launch-environment"]), mf = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, hf = [
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
], gf = new Map(hf.map((e) => [e.id, e])), { applyCustomOrder: _f, moveIdInList: vf, projectTaskSummary: yf, resourceRefText: bf, statusModel: xf, taskOperationalState: Sf, taskOperationalStateKey: Cf } = xd({
	tree: () => $.tree,
	findResource: (e) => sm(e),
	agentName: (e) => ($.config?.agents || []).find((t) => t.id === e)?.name || e || "Forge GUI"
}), wf = 0, Tf = vd({
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
	request: (e, t) => Lf(e, t),
	publish: (e) => Yd.renderSettings(e),
	agentOptions: Ef,
	workspaceIcons: [mf, ...hf],
	userName: If,
	saveUser: (e) => {
		if (!kf) throw Error("User settings are unavailable.");
		return kf.save(e);
	},
	appearance: () => {
		let e = of.snapshot();
		return {
			layout: e.layout.preference,
			fontScales: e.fontScales
		};
	},
	setLayoutPreference: (e) => of.setLayoutPreference(e),
	setFontScale: (e, t) => of.setFontScale(e, t),
	resetFontScales: () => of.resetFontScales(),
	notificationPreferences: () => Of?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => Of?.setBrowserEnabled(e),
	setCompletionSound: (e) => Of?.setSoundEnabled(e),
	flushDraft: tf,
	resetAgentState: jp,
	reloadWorkspaceContext: async () => {
		await qf(), await zf();
	},
	clearWorkspaceContext: () => {
		$.tree = null, Zd(), Zf();
	},
	renderWorkspace: rp,
	renderAgentViews: () => {
		gm(), Hp();
	},
	toast: Tm,
	onIconsChanged: Em
});
function Ef() {
	return vm().map((e) => ({
		id: e.id || "",
		label: Up(e),
		summary: Ip(e)
	}));
}
function Df() {
	sp(), mp(), am(), Xp(), Hp(), zp(), Wp();
}
var Of = null, kf = null;
function Af(e) {
	Of?.initialize(e);
}
function jf() {
	Of?.establishBaseline();
}
function Mf(e = $.tree) {
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
function Nf(e) {
	Of?.observeProjections(e);
}
function Pf(e, t) {
	t && Of?.observeEvent(e, t);
}
function Ff(e) {
	Of?.clearResource(e);
}
function If() {
	return kf?.current() || "User";
}
async function Lf(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		throw new uo(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function Rf() {
	let e = fm(), [t, n] = await Promise.all([Lf("/api/workspaces"), Lf("/api/settings/agenthub")]);
	$.config = Sm(t, n), gm(), $.activeWorkspaceId = pm(e.workspaceId) ? e.workspaceId || "" : $.config?.activeId || $.config?.workspaces[0]?.id || "", $.selectedId = e.resourceId || "workspace", rp(), $.activeWorkspaceId ? (Af($.activeWorkspaceId), await qf(), !e.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await zf({ replaceURL: !0 })) : ($.navigationLoading = !1, $.tree = null, Zd(), $.workspaceAgents = null, $.preview = null, $.diff = null, jp(), Zf());
}
async function zf(e = {}) {
	if (!$.activeWorkspaceId) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.treeRequestVersion;
	$.navigationLoading = !0, $.navigationError = "", sp(), $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let i;
	try {
		i = await Lf(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw $f(t, n, r) && ($.navigationLoading = !1, $.navigationError = _u(e), sp()), e;
	}
	$f(t, n, r) && ($.tree = i, Zd(), $.workspaceAgents = null, $.workspaceAgentsSaving = !1, $.preview = null, $.diff = null, cm(), dm(!1), $.selectedId === "workspace" ? await Kf() : $.selectedId && await Bf($.selectedId), $f(t, n, r) && (await Op(t, em()), $f(t, n, r) && (jf(), $.navigationLoading = !1, $.navigationError = "", Zf(), e.updateURL !== !1 && mm({ replace: !!e.replaceURL }))));
}
async function Bf(e, t = {}) {
	return cf.load(e, t);
}
function Vf(e, t = $.activeWorkspaceId, n = {}) {
	return cf.fetch(e, t, n);
}
function Hf(e) {
	cf.reset(e);
}
function Uf(e) {
	return cf.snapshot(e);
}
function Wf(e, t = "head") {
	return cf.apply(e, t);
}
async function Gf(e = $.selectedId) {
	await cf.loadMore(e);
}
async function Kf(e = {}) {
	if (!$.activeWorkspaceId || $.workspaceAgents && !e.force) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.workspaceAgentsRequestVersion;
	try {
		let e = await Lf(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!$f(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = e;
	} catch (e) {
		if (!$f(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: _u(e)
		};
	}
	return $.workspaceAgents;
}
async function qf(e = $.activeWorkspaceId, t = $.navigationVersion) {
	let n = await Lf(`/api/workspaces/${e}/ui-state`);
	return $f(e, t) ? ($.expandedProjects = new Set(n.expandedProjects || []), $.lastResourceId = n.lastResourceId || "", $.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], $.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, !0) : !1;
}
async function Jf() {
	if (!$.activeWorkspaceId) return;
	let e = $.activeWorkspaceId, t = $.navigationVersion, n = $.selectedId;
	await Lf(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...$.expandedProjects],
			lastResourceId: n,
			projectOrder: $.projectOrder,
			taskOrder: $.taskOrder
		})
	}), $f(e, t) && ($.lastResourceId = n);
}
function Yf() {
	$.autoRefreshTimer ||= Xd?.interval(() => {
		Xf().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, df) ?? null;
}
async function Xf() {
	if (!$.activeWorkspaceId || $.autoRefreshInFlight || $.listDrag) return;
	let e = $.autoRefreshVersion, t = $.activeWorkspaceId, n = $.navigationVersion, r = $.selectedId;
	$.autoRefreshInFlight = !0;
	try {
		let i = await wp(t);
		if (!i || !ep(t, n, e)) return;
		let a = !Cm($.tree, i);
		if (a && ($.tree = i), Nf(Mf(i)), a && $.preview?.section === "Wiki" && !$.preview.loading && (await yp("Wiki", $.preview.path), !ep(t, n, e))) return;
		cm() && (mm({ replace: !0 }), a = !0, r = $.selectedId);
		let o = $.expandedProjects.size;
		if (dm(!1), a ||= o !== $.expandedProjects.size, $.selectedId === "workspace") {
			let r = $.workspaceAgents;
			if (await Kf({ force: !0 }), !ep(t, n, e)) return;
			Cm(r, $.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++$.detailRequestVersion, o = await Vf(r, t, { logsLimit: ff });
			if (!ep(t, n, e) || $.selectedId !== r || i !== $.detailRequestVersion) return;
			let s = Uf(r);
			Wf(o, "head"), Cm(s, Uf(r)) || (a = !0);
		}
		Nf(Mf(i)), await Op(t, em()) && (a = !0), Cf() !== $.taskOperationalStateKey && (a = !0), a && Zf();
	} finally {
		$.autoRefreshInFlight = !1;
	}
}
function Zf() {
	sp(), mp(), zp(), Em(), am(), Wp();
}
function Qf() {
	sp(), mp(), zp(), Em(), am();
}
function $f(e, t, n = null) {
	return e === $.activeWorkspaceId && t === $.navigationVersion && (n == null || n === $.treeRequestVersion);
}
function ep(e, t, n) {
	return $f(e, t) && n === $.autoRefreshVersion;
}
function tp(e) {
	return gf.get(String(e?.icon || "").trim()) || mf;
}
function np(e) {
	let t = tp(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function rp() {
	let e = $.config?.workspaces?.find((e) => e.id === $.activeWorkspaceId);
	np(e), sp();
}
function ip(e, t, n = "") {
	let r = Sf(e), i = t === "project" && um(e.id), a = t === "project" ? yf(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: bf(e.id),
		active: $.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: xf(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? _f(e.children || [], $.taskOrder[e.id]).map((t) => ip(t, "task", e.id)) : [],
		projectId: n,
		followed: !!e.attention?.followed
	};
}
function ap(e) {
	if (!e) return null;
	let t = Sf(e);
	return {
		id: e.id || "scheduler",
		type: "scheduler",
		title: e.title || "Scheduler",
		ref: "",
		active: $.selectedId === (e.id || "scheduler"),
		expanded: !1,
		ariaLabel: ["Scheduler", t.label].filter(Boolean).join(". "),
		statusLabel: t.label || "Workspace Scheduler",
		status: xf(t.statusPresentation),
		summary: null,
		children: []
	};
}
function op(e) {
	let t = Sf(e), n = e.type === "scheduler" || e.type === "project" || e.type === "task" ? e.type : "workspace", r = e.title || e.id;
	return {
		id: e.id,
		type: n,
		title: r,
		ref: n === "project" || n === "task" ? bf(e.id) : "",
		selected: $.selectedId === e.id,
		activeTurn: !!e.runtime?.activeTurn,
		followed: !!e.attention?.followed,
		turnNumber: Number(e.runtime?.turnNumber) || 0,
		agentName: String(e.runtime?.agentName || "").trim(),
		statusLabel: t.label || (e.attention?.followed ? "Focused resource" : "Active turn"),
		status: xf(t.statusPresentation)
	};
}
function sp() {
	let e = $.tree ? _f($.tree.projects || [], $.projectOrder).map((e) => ip(e, "project")) : [], t = $.tree?.attentionList?.map((e) => op(e)) || [];
	$.tree && ($.taskOperationalStateKey = Cf()), Yd.renderAppShell({
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
			iconSrc: tp(e).src
		})),
		scheduler: ap($.tree?.scheduler),
		projects: e,
		attentionList: t,
		...of.snapshot(),
		route: sf.projection(),
		onSwitchWorkspace: (e) => cp(e),
		onAddWorkspace: () => xm("workspace").catch((e) => Tm(e.message)),
		onCreateProject: () => tm(),
		onOpenSettings: () => xm().catch((e) => Tm(e.message)),
		onToggleProject: (e) => dp(e),
		onSelectResource: (e) => up(e),
		onReorder: (e, t, n) => lp(e, t, n),
		onDragState: (e) => {
			$.listDrag = e;
		},
		onToggleAttention: (e, t) => Ep(e, t),
		onDismissAttention: (e) => Dp(e),
		onPanePreview: (e, t) => km(e, t),
		onPaneCommit: (e) => Am(e),
		onPaneViewport: () => jm(),
		onMobileSidebar: (e) => Mm(e),
		onMobileView: (e) => Nm(e),
		onMobileImmersive: (e) => Pm(e),
		onHistoryNavigation: (e) => Bm(e),
		onToast: Tm,
		onIconsChanged: Em
	});
}
async function cp(e) {
	if (!pm(e)) return;
	if ($.workspaceMenuOpen = !1, e === $.activeWorkspaceId) {
		rp();
		return;
	}
	Mm(!1), tf(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let t = $.navigationVersion;
	await Jf().catch((e) => console.warn("failed to save UI state", e)), $.activeWorkspaceId = e, $.selectedId = "workspace", $.tree = null, $.navigationLoading = !0, $.navigationError = "", Zd(), Af(e), vp(), $.workspaceAgentsSaving = !1, im(), jp(), rp(), await qf(e, t) && ($.selectedId = $.lastResourceId || "workspace", await zf());
}
async function lp(e, t, n) {
	let r = {
		projectOrder: [...$.projectOrder],
		taskOrder: Object.fromEntries(Object.entries($.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []]))
	};
	if (e.kind === "task") {
		let r = sm(e.projectId);
		if (!r) return;
		let i = _f(r.children || [], $.taskOrder[e.projectId]);
		$.taskOrder = {
			...$.taskOrder,
			[e.projectId]: vf(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") $.projectOrder = vf(_f($.tree?.projects || [], $.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	sp();
	try {
		await Jf();
	} catch (e) {
		throw $.projectOrder = r.projectOrder, $.taskOrder = r.taskOrder, sp(), e;
	}
}
async function up(e, t = {}) {
	let n = $.selectedId !== e;
	t.clearUnread !== !1 && Ff(e);
	let r = n || !!t.forceDetail;
	r && ($.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, e !== "workspace" && (Hf(e), delete $.details[e])), n && ($.workspaceAgentsSaving = !1, tf(), Jp(), $.preview = null, $.diff = null, ef(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = ""), $.selectedId = e, Mm(!1), dm(!1), mm(), Jf().catch((e) => console.warn("failed to save UI state", e)), Qf(), await Promise.all([e === "workspace" ? Kf({ force: !!t.forceDetail }) : Bf(e, { force: r }), Op($.activeWorkspaceId, e)]), $f($.activeWorkspaceId, $.navigationVersion) && Qf();
}
async function dp(e) {
	$.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), sp();
	try {
		await Jf();
	} catch (t) {
		throw $.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), sp(), t;
	}
}
function fp() {
	let e = $.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${$.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: hm(),
		resourceId: $.selectedId || "",
		resourceType: "",
		resourceTitle: "",
		creator: $.selectedId === "workspace" ? $.tree?.creator : $.details[$.selectedId]?.creator || sm($.selectedId)?.creator,
		parent: null,
		loading: !1,
		detail: null,
		wiki: $.tree?.wiki || null,
		workspaceAgents: $.workspaceAgents,
		agentBinding: $.selectedId === "workspace" ? $.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : sm($.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: Ef(),
		logs: {
			hasMore: !1,
			loading: !1,
			error: ""
		},
		onNavigate: (e) => hp(e).catch((e) => Tm(_u(e))),
		onCreateTask: (e) => nm(e),
		onArchive: (e) => om(e).catch((e) => Tm(_u(e))),
		onLoadMoreLogs: (e) => Gf(e),
		onSaveWorkspaceAgents: (e, t) => bp(e, t),
		onSaveAgentBinding: async (t) => {
			let n = $.selectedId || "workspace";
			await Lf(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await zf({ updateURL: !1 }), n !== "workspace" && await Bf(n, { force: !0 }), Zf(), Tm("Resource agent binding saved.");
		},
		onRefreshScheduler: async () => {
			await zf({ updateURL: !1 }), $.selectedId === "scheduler" && await Bf("scheduler", { force: !0 }), Zf();
		},
		onToast: Tm,
		onIconsChanged: Em
	};
	if (!$.tree) return t;
	if ($.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: hm()
	};
	let n = sm($.selectedId) || $.tree.scheduler || $.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: hm()
	};
	let r = $.details[n.id] || null, i = lm(n.id), a = $.resourceLogPages?.[n.id] || {};
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
		detail: pp(r),
		logs: {
			hasMore: !!(a.hasMore ?? r?.logPage?.hasMore),
			loading: !!a.loading,
			error: String(a.error || "")
		}
	};
}
function pp(e) {
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
function mp() {
	Yd.renderDetailPanel(fp());
}
async function hp(e) {
	await up(e, { forceDetail: e === $.selectedId && e !== "workspace" });
}
function gp(e) {
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
function _p(e) {
	return gp(e || "").trim();
}
function vp() {
	$.workspaceAgentsDraft = "", $.workspaceAgentsDirty = !1;
}
async function yp(e, t, n = {}) {
	let r = n.workspaceId || $.activeWorkspaceId, i = n.requestVersion || ++$.previewRequestVersion;
	try {
		let n = await Lf(Cp(e, t, r));
		return r !== $.activeWorkspaceId || i !== $.previewRequestVersion || $.preview?.section !== e || $.preview?.path !== t ? null : ($.preview = {
			section: e,
			...n
		}, $.preview);
	} catch (a) {
		let o = r === $.activeWorkspaceId && i === $.previewRequestVersion && $.preview?.section === e && $.preview?.path === t;
		if (o && ($.preview = {
			section: e,
			path: t,
			error: _u(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function bp(e, t) {
	if (!$.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = $.activeWorkspaceId, r = $.navigationVersion, i = await Lf(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!$f(n, r) || $.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return $.workspaceAgents = i, $.workspaceAgentsDraft = _p(i.content || ""), $.workspaceAgentsDirty = !1, i;
}
function xp() {
	$.previewRequestVersion++, $.preview = null, Zf();
}
function Sp() {
	$.diffRequestVersion++, $.diff = null, Zf();
}
function Cp(e, t, n = $.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
async function wp(e = $.activeWorkspaceId) {
	let t = ++$.treeRequestVersion, n = $.navigationVersion, r = await Lf(`/api/workspaces/${e}/tree`);
	return $f(e, n, t) ? r : null;
}
async function Tp() {
	if (!$.activeWorkspaceId || !$.tree) return;
	let e = await wp($.activeWorkspaceId);
	e && ($.tree = e);
}
async function Ep(e, t) {
	let n = $.activeWorkspaceId;
	!n || !e || (await Lf(`/api/workspaces/${encodeURIComponent(n)}/resources/${encodeURIComponent(e)}/attention`, {
		method: "PUT",
		body: JSON.stringify({ followed: t })
	}), await Tp(), Zf());
}
async function Dp(e) {
	let t = $.activeWorkspaceId;
	!t || !e || (await Lf(`/api/workspaces/${encodeURIComponent(t)}/resources/${encodeURIComponent(e)}/attention/dismiss`, { method: "POST" }), await Tp(), Zf());
}
async function Op(e = $.activeWorkspaceId, t = em()) {
	if (!e || !t) return !1;
	let n = ++$.messageStatusRequestVersion, r = `${e}:${t}`, i = await Lf(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/status`);
	if (n !== $.messageStatusRequestVersion || e !== $.activeWorkspaceId || t !== em()) return !1;
	let a = $.messageStatusKey !== r || !Cm($.messageStatus, i);
	return $.messageStatusKey = r, $.messageStatus = i, a;
}
async function kp(e) {
	if (!e || $.steeringMessageId) return;
	let t = $.activeWorkspaceId, n = em();
	$.steeringMessageId = e, Hp();
	try {
		await Lf(`/api/workspaces/${encodeURIComponent(t)}/messages/${encodeURIComponent(e)}/steer`, { method: "POST" }), await Op(t, n), t === $.activeWorkspaceId && n === em() && (Zf(), Tm("Message inserted into the current turn."));
	} catch (e) {
		try {
			await Op(t, n);
		} catch {}
		throw e;
	} finally {
		$.steeringMessageId === e && ($.steeringMessageId = "", Hp());
	}
}
async function Ap() {
	tf(), af.reset(), ef(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, await Op();
}
function jp() {
	tf(), Jp(), $.agent.optionsOpen = !1, $.agent.historyOpen = !1, ef(), af.reset(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = "", $.agent.toolGroupOpen.clear(), $.agent.approvalDrafts.clear(), $.agent.renderDeferredForSelection = !1, Pp();
}
function Mp(e, t, n) {
	if (e !== $.activeWorkspaceId || t !== em() || !n) return;
	let r = sm(t)?.runtime || $.messageStatus?.generation;
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && Pf(n, r?.generationId ? {
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
	].includes(n.type) && Op().then(Zf).catch((e) => console.warn("agent refresh failed", e));
}
function Np(e, t, n) {}
function Pp() {
	$.agent.renderTimer && window.clearTimeout($.agent.renderTimer), $.agent.renderTimer = null;
}
function Fp(e) {
	let t = (e || []).filter((e) => !pf.has(e?.type)), n = Jd(t), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function Ip(e) {
	if (!e) return "";
	let t = [Lp(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function Lp(e) {
	return ($.config?.agentHubProviders || Tf.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function Rp(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function zp(e = {}) {
	Hp();
	let t = em(), n = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, r = ($.config?.agents || []).find((e) => e.id === n?.resolvedAgent);
	Yd.renderEventTimeline({
		identity: `${$.activeWorkspaceId}:${t}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: Up(r || _m()),
		project: Fp,
		onEvent: Mp,
		onNotice: Np,
		onApproval: Qp,
		onToast: Tm,
		onIconsChanged: Em
	});
}
function Bp(e, t) {
	return `${e || "workspace"}:${t || "resource"}`;
}
var Vp = "";
function Hp(e = {}) {
	$.agent.skipTTYDraftSync = !1;
	let t = em();
	$.activeWorkspaceId && t && nf(t);
	let n = af.active("turn-stop") && af.key("turn-stop") === t, r = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, i = $.activeWorkspaceId;
	Yd.renderComposer({
		identity: `${$.activeWorkspaceId}:${t}:${$.agent.ttyDraftKey || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		draft: $.agent.ttyDraft || "",
		draftKey: $.agent.ttyDraftKey || "",
		draftResetVersion: $.agent.ttyDraftResetVersion || 0,
		unavailableReason: r ? r.acceptsMessages ? "" : r.archived ? "This resource is archived." : r.configError || "This resource cannot accept messages." : "Loading work status.",
		sending: af.isSending(Bp($.activeWorkspaceId, t)),
		canEndTurn: !!(n || ["running", "waiting_approval"].includes(String(r?.session?.state || ""))),
		endingTurn: n,
		waitingMessages: r?.waitingMessages || [],
		canSteerWaiting: !!r?.canSteerWaiting,
		steeringMessageId: $.steeringMessageId,
		agentBinding: t === "workspace" ? $.tree?.agentBinding || {
			kind: "profile",
			name: "default"
		} : sm(t)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description,
			agentName: e.agentName
		})),
		agents: Ef(),
		bindingSaving: Vp === t,
		onDraft: (e, t) => Gp(e, t),
		onSend: $p,
		onOpenUpload: Kp,
		onEndTurn: () => Zp().catch((e) => Tm(e.message)),
		onSteerWaiting: kp,
		onSaveAgentBinding: async (e) => {
			if (t === em()) {
				Vp = t, Hp();
				try {
					await Lf(`/api/workspaces/${encodeURIComponent(i)}/resources/${encodeURIComponent(t)}/agent-binding`, {
						method: "PUT",
						body: JSON.stringify(e)
					}), await zf({ updateURL: !1 }), t !== "workspace" && await Bf(t, { force: !0 }), Zf(), Tm("Resource agent binding saved.");
				} catch (e) {
					Tm(_u(e));
				} finally {
					Vp = "", Hp();
				}
			}
		},
		onIconsChanged: Em
	});
}
function Up(e) {
	return e?.name || e?.id || "Agent";
}
function Wp() {
	Tf.render();
}
function Gp(e, t) {
	!t || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== em() || t.draftKey !== $.agent.ttyDraftKey || rf(e);
}
function Kp() {
	let e = em();
	if (!e || $.messageStatus?.archived) {
		Tm("Select an active resource before uploading files.");
		return;
	}
	let t = uf("ttyInput");
	t && rf(t.value), $.modalEnter = "upload", $.uploadDialog = {
		open: !0,
		identity: ++wf,
		resourceId: e,
		items: [],
		nextId: 1
	}, Xp();
}
function qp(e = [], t = {}) {
	if (!$.uploadDialog.open) return;
	let n = $.uploadDialog.resourceId === em(), r = !t.workspaceId || t.workspaceId === $.activeWorkspaceId, i = e.length > 0 && r && n;
	i && (rf(Yp($.agent.ttyDraft, e)), $.agent.ttyDraftResetVersion++), Jp();
	let a = uf("ttyComposer");
	a && delete a.dataset.composerKey, Hp({ skipDraftSync: i }), uf("ttyInput")?.focus({ preventScroll: !0 }), Em();
}
function Jp() {
	$.uploadDialog = {
		open: !1,
		identity: ++wf,
		resourceId: "",
		items: [],
		nextId: 1
	}, Xp();
}
function Yp(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function Xp() {
	let e = $.uploadDialog;
	Yd.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${$.activeWorkspaceId}:${e.resourceId || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: e.resourceId || "",
		onDone: qp,
		onIconsChanged: Em
	});
}
async function Zp() {
	let e = $.activeWorkspaceId, t = em(), n = $.messageStatus?.generation?.generationId || "", r = af.begin("turn-stop", t);
	if (r) try {
		let r = n ? `?generationId=${encodeURIComponent(n)}` : "";
		await Lf(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/turn/end${r}`, { method: "POST" }), await Op(e, t), Zf();
	} finally {
		af.finish(r);
	}
}
async function Qp(e, t, n) {
	let r = $.activeWorkspaceId, i = em();
	await Lf(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/approval?generationId=${encodeURIComponent(e)}`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), await Op(r, i), Zf();
}
async function $p(e, t) {
	if (!e.trim() || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== em() || t.draftKey !== $.agent.ttyDraftKey) return {
		accepted: !1,
		clear: !1
	};
	let n = Bp(t.workspaceId, t.resourceId);
	if (!af.startSending(n)) return {
		accepted: !1,
		clear: !1
	};
	let r = $.agent.ttyDraftVersion;
	try {
		await Lf(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/resources/${encodeURIComponent(t.resourceId)}/messages`, {
			method: "POST",
			body: JSON.stringify({
				text: e,
				role: "user",
				sender: { name: If() }
			})
		});
		let n = $d({
			workspaceId: t.workspaceId,
			resourceId: t.resourceId,
			key: t.draftKey,
			text: e,
			version: r
		});
		return n && $.agent.ttyDraftResetVersion++, await Promise.all([Op(t.workspaceId, t.resourceId), Tp()]), Zf(), {
			accepted: !0,
			clear: n
		};
	} finally {
		af.stopSending(n);
	}
}
function em() {
	return $.selectedId === "workspace" ? "workspace" : sm($.selectedId)?.id || "";
}
function tm() {
	rm("project");
}
function nm(e) {
	rm("task", e);
}
function rm(e, t = "") {
	lf.open(e === "task" ? "task" : "project", t);
}
function im() {
	lf.close();
}
function am() {
	lf.render();
}
async function om(e) {
	confirm(`Archive ${e}?`) && (await Lf(`/api/workspaces/${$.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	}), Tm("Archived."), $.selectedId = "workspace", await zf());
}
function sm(e) {
	if (!$.tree) return null;
	if ($.tree.scheduler?.id === e) return $.tree.scheduler;
	for (let t of $.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function cm() {
	return $.selectedId === "workspace" || sm($.selectedId) ? !1 : ($.selectedId = "workspace", !0);
}
function lm(e) {
	if (!$.tree) return null;
	for (let t of $.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function um(e) {
	return $.expandedProjects.has(e);
}
function dm(e = !1) {
	let t = lm($.selectedId);
	!t || t.id === $.selectedId || $.expandedProjects.has(t.id) || ($.expandedProjects.add(t.id), e && Jf().catch((e) => Tm(e.message)));
}
function fm(e = window.location.pathname) {
	return sf.parse(e);
}
function pm(e) {
	return !!(e && $.config?.workspaces.some((t) => t.id === e));
}
function mm(e = {}) {
	sf.project($.activeWorkspaceId, $.selectedId, e);
}
function hm() {
	return $.config?.workspaces.find((e) => e.id === $.activeWorkspaceId)?.name || "Workspace";
}
function gm() {
	let e = vm(), t = ym();
	e.some((e) => e.id === $.agent.agentName) || ($.agent.agentName = t);
}
function _m() {
	let e = vm(), t = $.agent.agentName || ym();
	return e.find((e) => e.id === t) || e[0] || null;
}
function vm() {
	return ($.config?.agents || []).filter((e) => e.available !== !1);
}
function ym() {
	let e = vm();
	return bm($.config?.agentProfiles, "default") || bm(Tf.profiles(), "default") || e[0]?.id || "";
}
function bm(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function xm(e = "workspace") {
	return Tf.open(e);
}
function Sm(e, t) {
	return Tf.withAgentHubCatalog(e, t);
}
function Cm(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var wm = 0;
function Tm(e) {
	Yd.renderToast({
		message: String(e || ""),
		revision: ++wm
	});
}
function Em() {
	let e = window.lucide;
	!e || $.iconRefreshScheduled || ($.iconRefreshScheduled = !0, Xd?.animationFrame(() => {
		$.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function Dm(e) {
	Em(), e === "markdown" && window.marked && window.DOMPurify && (mp(), Em()), e === "diff" && mp();
}
window.forgeAssetLoaded = Dm;
function Om() {
	of.initialize();
}
function km(e, t) {
	of.previewPane(e, t);
}
function Am(e) {
	of.commitPane(e);
}
function jm() {
	of.syncViewport();
}
function Mm(e) {
	of.setMobileSidebar(e);
}
function Nm(e) {
	of.setMobileView(e);
}
function Pm(e) {
	of.setMobileImmersive(e);
}
function Fm() {
	Xd?.listen(document, "selectionchange", () => {
		if (!$.agent.renderDeferredForSelection) return;
		let e = uf("ttyLog");
		e && Rp(e) || ($.agent.renderDeferredForSelection = !1, zp(), Em());
	}), Xd?.listen(document, "keydown", (e) => {
		e.key === "Escape" && $.diff ? Sp() : e.key === "Escape" && $.preview ? xp() : e.key === "Escape" && ($.agent.optionsOpen || $.agent.historyOpen) && ($.agent.optionsOpen = !1, $.agent.historyOpen = !1, Hp(), Em());
	}), Xd?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			hp(n.dataset.breadcrumbResource || "workspace").catch((e) => Tm(_u(e)));
			return;
		}
		($.agent.optionsOpen || $.agent.historyOpen) && t && !t.closest(".tty-composer") && ($.agent.optionsOpen = !1, $.agent.historyOpen = !1, Hp(), Em()), Em();
	}), Xd?.listen(window, "beforeunload", Rm), Xd?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && Rm();
	});
}
var Im = !1;
function Lm(e) {
	if (Yd = e, Im) {
		Df();
		return;
	}
	Im = !0;
	let t = new Od();
	Xd = t, Of = zu({
		scope: t,
		selectedResourceId: () => $.selectedId,
		resourceProjections: () => Mf(),
		hasTree: () => !!$.tree,
		findResource: sm,
		selectResource: up,
		notificationsSettingsVisible: () => Tf.isOpenTab("notifications"),
		renderSettings: Wp,
		refreshIcons: Em,
		flushDraft: Rm
	}), kf = Dd(t, () => {
		Tf.isOpenTab("user") && Wp();
	}), Fm(), Om(), Of.install(), sp(), Rf().catch((e) => {
		$.navigationLoading = !1, $.navigationError = e.message, Tm(e.message), Zf();
	}), Yf();
}
function Rm() {
	tf();
}
function zm() {
	Im && (Rm(), Im = !1, Of?.dispose(), Of = null, kf = null, af.reset(), Pp(), lf.dispose(), Xd?.dispose(), Xd = null, $.autoRefreshTimer = null);
}
async function Bm(e) {
	let t = fm(e);
	if (!pm(t.workspaceId)) {
		mm({ replace: !0 });
		return;
	}
	let n = $.activeWorkspaceId !== t.workspaceId, r = $.selectedId;
	tf(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, $.workspaceAgentsSaving = !1;
	let i = $.navigationVersion;
	if ($.activeWorkspaceId = t.workspaceId || "", $.selectedId = t.resourceId || "workspace", !n && r !== $.selectedId && $.selectedId !== "workspace" && (Hf($.selectedId), delete $.details[$.selectedId]), $.preview = null, $.diff = null, n && ($.tree = null, $.navigationLoading = !0, $.navigationError = "", vp(), $.workspaceAgentsSaving = !1, im(), Af($.activeWorkspaceId)), n && jp(), rp(), n) {
		if (!await qf(t.workspaceId || "", i)) return;
		!t.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await zf({ updateURL: !1 }), $f(t.workspaceId || "", i) && mm({ replace: !0 });
	} else {
		let e = cm();
		if ($.selectedId === "workspace" ? await Kf() : (dm(!1), await Bf($.selectedId)), !$f(t.workspaceId || "", i)) return;
		r !== $.selectedId && await Ap(), Zf(), e && mm({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var Vm = su(), Hm = {
	renderAppShell: Vm.appShell.publish,
	renderCreateDialog: Vm.create.publish,
	renderSettings: Vm.settings.publish,
	renderUploadDialog: Vm.upload.publish,
	renderComposer: Vm.composer.publish,
	renderEventTimeline: Vm.timeline.publish,
	renderDetailPanel: Vm.detail.publish,
	renderToast: Vm.toast.publish
}, Um = null;
async function Wm() {
	if (Um) return;
	let e = document.getElementById("app");
	if (!e) throw Error("Forge application root is unavailable.");
	e.dataset.componentOwner = "app-shell", Um = Nr(iu, {
		target: e,
		props: { channels: Vm }
	}), Lm(Hm);
}
async function Gm() {
	if (zm(), !Um) return;
	let e = Um;
	Um = null, await Lr(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void Gm()), window.addEventListener("pageshow", (e) => {
	e.persisted && Wm();
}), Wm().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
