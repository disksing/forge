//#region node_modules/svelte/src/internal/shared/utils.js
var e = Array.isArray, t = Array.prototype.indexOf, n = Array.prototype.includes, r = Array.from, i = Object.defineProperty, a = Object.getOwnPropertyDescriptor, o = Object.prototype, s = Array.prototype, c = Object.getPrototypeOf, l = Object.isExtensible, u = () => {};
function d(e) {
	for (var t = 0; t < e.length; t++) e[t]();
}
function f() {
	var e, t;
	return {
		promise: new Promise((n, r) => {
			e = n, t = r;
		}),
		resolve: e,
		reject: t
	};
}
var p = 1024, m = 2048, h = 4096, g = 8192, ee = 16384, te = 32768, _ = 1 << 25, ne = 65536, v = 1 << 19, re = 1 << 20, ie = 65536, ae = 1 << 21, oe = 1 << 22, se = 1 << 23, ce = Symbol("$state"), le = Symbol("legacy props"), ue = Symbol("attributes"), de = Symbol("class"), fe = Symbol("style"), pe = Symbol("text"), me = new class extends Error {
	name = "StaleReactionError";
	message = "The reaction that called `getAbortSignal()` was re-run or destroyed";
}();
globalThis.document?.contentType;
//#endregion
//#region node_modules/svelte/src/internal/client/errors.js
function he() {
	throw Error("https://svelte.dev/e/async_derived_orphan");
}
function ge() {
	throw Error("https://svelte.dev/e/effect_update_depth_exceeded");
}
function _e(e) {
	throw Error("https://svelte.dev/e/props_invalid_value");
}
function ve() {
	throw Error("https://svelte.dev/e/state_descriptors_fixed");
}
function ye() {
	throw Error("https://svelte.dev/e/state_prototype_fixed");
}
function be() {
	throw Error("https://svelte.dev/e/state_unsafe_mutation");
}
function xe() {
	throw Error("https://svelte.dev/e/svelte_boundary_reset_onerror");
}
//#endregion
//#region node_modules/svelte/src/constants.js
var y = Symbol("uninitialized");
function Se() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function Ce() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function we(e) {
	return e === this.v;
}
function Te(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Ee(e) {
	return !Te(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var b = null;
function x(e) {
	b = e;
}
function De(e, t = !1, n) {
	b = {
		p: b,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: U,
		l: null
	};
}
function Oe(e) {
	var t = b, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) Nt(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, b = t.p, e ?? {};
}
function S() {
	return !0;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/task.js
var C = [];
function ke() {
	var e = C;
	C = [], d(e);
}
function w(e) {
	if (C.length === 0 && !rt) {
		var t = C;
		queueMicrotask(() => {
			t === C && ke();
		});
	}
	C.push(e);
}
function Ae(e) {
	var t = U;
	if (t === null) return B.f |= se, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	T(e, t);
}
function T(e, t) {
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
var je = ~(m | h | p);
function E(e, t) {
	e.f = e.f & je | t;
}
function Me(e) {
	e.f & 512 || e.deps === null ? E(e, p) : E(e, h);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Ne(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= ie, Ne(t.deps));
}
function Pe(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Ne(e.deps), E(e, p);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var Fe = !1;
function Ie(e) {
	var t = Fe;
	try {
		return Fe = !1, [e(), Fe];
	} finally {
		Fe = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function Le(e) {
	var t = B, n = U;
	H(null), W(null);
	try {
		return e();
	} finally {
		H(t), W(n);
	}
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function Re(e) {
	let t = 0, n = gt(0), r;
	return () => {
		jt() && ($(n), It(() => (t === 0 && (r = ln(() => e(() => F(n)))), t += 1, () => {
			w(() => {
				--t, t === 0 && (r?.(), r = void 0, F(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var ze = ne | v;
function Be(e, t, n, r) {
	new Ve(e, t, n, r);
}
var Ve = class {
	parent;
	is_pending = !1;
	transform_error;
	#e;
	#t;
	#n;
	#r;
	#i = null;
	#a = null;
	#o = null;
	#s = null;
	#c = 0;
	#l = 0;
	#u = !1;
	#d = /* @__PURE__ */ new Set();
	#f = /* @__PURE__ */ new Set();
	#p = null;
	#m = Re(() => (this.#p = gt(this.#c), () => {
		this.#p = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#t = t, this.#n = (e) => {
			var t = U;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = U.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#r = Rt(() => {
			this.#g();
		}, ze);
	}
	#h(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				Ce();
				return;
			}
			t = !0, n && xe(), this.#o !== null && Gt(this.#o, () => {
				this.#o = null;
			}), this.#v(() => {
				this.#g();
			});
		};
		return {
			reset: r,
			invoke_onerror: () => {
				try {
					n = !0, this.#t.onerror?.(e, r), n = !1;
				} catch (e) {
					T(e, this.#r && this.#r.parent);
				}
			}
		};
	}
	#g() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#l = 0, this.#c = 0, this.#i = zt(() => {
				this.#n(this.#e);
			}), this.#l > 0) {
				var e = this.#s = document.createDocumentFragment();
				qt(this.#i, e);
				let t = this.#t.pending;
				this.#a = zt(() => t(this.#e));
			} else this.#_(O);
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		this.is_pending = !1, e.transfer_effects(this.#d, this.#f);
	}
	defer_effect(e) {
		Pe(e, this.#d, this.#f);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#t.pending;
	}
	#v(e) {
		var t = U, n = B, r = b;
		W(this.#r), H(this.#r), x(this.#r.ctx);
		try {
			return ct.ensure(), e();
		} catch (e) {
			return Ae(e), null;
		} finally {
			W(t), H(n), x(r);
		}
	}
	#y(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#y(e, t);
			return;
		}
		this.#l += e, this.#l === 0 && (this.#_(t), this.#a && Gt(this.#a, () => {
			this.#a = null;
		}), this.#s &&= (this.#e.before(this.#s), null));
	}
	update_pending_count(e, t) {
		this.#y(e, t), this.#c += e, !(!this.#p || this.#u) && (this.#u = !0, w(() => {
			this.#u = !1, this.#p && _t(this.#p, this.#c);
		}));
	}
	get_effect_pending() {
		return this.#m(), $(this.#p);
	}
	error(e) {
		if (!this.#t.onerror && !this.#t.failed) throw e;
		O?.is_fork ? (this.#i && O.skip_effect(this.#i), this.#a && O.skip_effect(this.#a), this.#o && O.skip_effect(this.#o), O.oncommit(() => {
			this.#b(e);
		})) : this.#b(e);
	}
	#b(e) {
		this.#i &&= (R(this.#i), null), this.#a &&= (R(this.#a), null), this.#o &&= (R(this.#o), null);
		let t = this.#t.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#h(e);
			r(), t && (this.#o = this.#v(() => {
				try {
					return zt(() => {
						var r = U;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return T(e, this.#r.parent), null;
				}
			}));
		};
		w(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				T(e, this.#r && this.#r.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => T(e, this.#r && this.#r.parent)) : n(t);
		});
	}
};
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/async.js
function He(e, t, n, r) {
	let i = S() ? Ke : Ye;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = U, c = Ue(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				T(e, s);
			}
			We();
		}
	}
	var d = Ge();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ Je(e))).then(u).catch((e) => T(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), We();
	}) : f();
}
function Ue() {
	var e = U, t = B, n = b, r = O;
	return function(i = !0) {
		W(e), H(t), x(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function We(e = !0) {
	W(null), H(null), x(null), e && O?.deactivate();
}
function Ge() {
	var e = U, t = e.b, n = O, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function Ke(e) {
	var t = 2 | m;
	return U !== null && (U.f |= v), {
		ctx: b,
		deps: null,
		effects: null,
		equals: we,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: y,
		wv: 0,
		parent: U,
		ac: null
	};
}
var qe = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function Je(e, t, n) {
	let r = U;
	r === null && he();
	var i = void 0, a = gt(y), o = !B, s = /* @__PURE__ */ new Set();
	return Ft(() => {
		var t = U, n = f();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== me && n.reject(e);
			}).finally(We);
		} catch (e) {
			n.reject(e), We();
		}
		var c = O;
		if (o) {
			if (t.f & 32768) var l = Ge();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(qe);
			else for (let e of s.values()) e.reject(qe);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== qe && (c.activate(), t ? (a.f |= se, _t(a, t)) : (a.f & 8388608 && (a.f ^= se), _t(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), Mt(() => {
		for (let e of s) e.reject(qe);
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
function Ye(e) {
	let t = /* @__PURE__ */ Ke(e);
	return t.equals = Ee, t;
}
function Xe(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) R(t[n]);
	}
}
function Ze(e) {
	var t, n = U, r = e.parent;
	if (!z && r !== null && e.v !== y && r.f & 24576) return Se(), e.v;
	W(r);
	try {
		e.f &= ~ie, Xe(e), t = an(e);
	} finally {
		W(n);
	}
	return t;
}
function Qe(e) {
	var t = Ze(e);
	if (!e.equals(t) && (e.wv = tn(), (!O?.is_fork || e.deps === null) && (O === null ? e.v = t : (O.capture(e, t, !0), tt?.capture(e, t, !0)), e.deps === null))) {
		E(e, p);
		return;
	}
	z || (k === null ? Me(e) : (jt() || O?.is_fork) && k.set(e, t));
}
function $e(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && Le(() => {
		t.ac.abort(me), t.ac = null;
	}), t.fn !== null && (t.teardown = u), Z(t, 0), Vt(t));
}
function et(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && Q(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var D = null, O = null, tt = null, k = null, nt = null, rt = !1, it = !1, A = null, at = null, ot = 0, st = 1, ct = class e {
	id = st++;
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
		D === null ? D = this : (D.#n = this, this.#t = D), D = this;
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
			for (var r of n.d) E(r, m), t(r);
			for (r of n.m) E(r, h), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, ot++ > 1e3 && (this.#x(), lt());
		for (let e of this.#u) this.#d.delete(e), E(e, m), this.schedule(e);
		for (let e of this.#d) E(e, h), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = A = [], r = [], i = at = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw pt(e), this.#h() || this.discard(), t;
		}
		if (O = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (A = null, at = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) ft(e, t);
			i.length > 0 && O.#g();
			return;
		}
		let o = this.#v();
		if (o) {
			this.#b(r), this.#b(n), o.#y(this);
			return;
		}
		this.#u.clear(), this.#d.clear();
		for (let e of this.#r) e(this);
		this.#r.clear(), tt = this, ut(r), ut(n), tt = null, this.#s?.resolve();
		var s = O;
		if (this.#a === 0 && (this.#c.length === 0 || s !== null) && this.#x(), this.#c.length > 0) {
			if (s !== null) {
				let e = s;
				e.#c.push(...this.#c.filter((t) => !e.#c.includes(t)));
			} else s = this;
		}
		s !== null && s.#g();
	}
	#_(e, t, n) {
		e.f ^= p;
		for (var r = e.first; r !== null;) {
			var i = r.f, a = !!(i & 96);
			if (!(a && i & 1024 || i & 8192 || this.#f.has(r)) && r.fn !== null) {
				a ? r.f ^= p : i & 4 ? t.push(r) : nn(r) && (i & 16 && this.#d.add(r), Q(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), E(i, m), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), O = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Pe(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== y && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), k?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		O = this;
	}
	deactivate() {
		O = null, k = null;
	}
	flush() {
		try {
			it = !0, O = this, this.#g();
		} finally {
			ot = 0, nt = null, A = null, at = null, it = !1, O = null, k = null, M.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(qe);
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
		this.#m || (this.#m = !0, w(() => {
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
		return (this.#s ??= f()).promise;
	}
	static ensure() {
		if (O === null) {
			let t = O = new e();
			!it && w(() => {
				t.#e || t.flush();
			});
		}
		return O;
	}
	apply() {
		k = null;
	}
	schedule(e) {
		if (nt = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (A !== null && t === U && (B === null || !(B.f & 2))) return;
			if (n & 96) {
				if (!(n & 1024)) return;
				t.f ^= p;
			}
		}
		this.#c.push(t);
	}
	#x() {
		if (this.linked) {
			var e = this.#t, t = this.#n;
			e === null || (e.#n = t), t === null ? D = e : t.#t = e, this.linked = !1;
		}
	}
};
function lt() {
	try {
		ge();
	} catch (e) {
		T(e, nt);
	}
}
var j = null;
function ut(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && nn(r) && (j = /* @__PURE__ */ new Set(), Q(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Wt(r), j?.size > 0)) {
				M.clear();
				for (let e of j) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) j.has(n) && (j.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || Q(n);
					}
				}
				j.clear();
			}
		}
		j = null;
	}
}
function dt(e) {
	O.schedule(e);
}
function ft(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), E(e, p);
		for (var n = e.first; n !== null;) ft(n, t), n = n.next;
	}
}
function pt(e) {
	E(e, p);
	for (var t = e.first; t !== null;) pt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var mt = /* @__PURE__ */ new Set(), M = /* @__PURE__ */ new Map(), ht = !1;
function gt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: we,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function N(e, t) {
	let n = gt(e, t);
	return Zt(n), n;
}
function P(e, t, n = !1) {
	return B !== null && (!V || B.f & 131072) && S() && B.f & 4325394 && (G === null || !G.has(e)) && be(), _t(e, n ? I(t) : t, at);
}
function _t(e, t, n = null) {
	if (!e.equals(t)) {
		M.set(e, z ? t : e.v);
		var r = ct.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && Ze(t), k === null && Me(t);
		}
		e.wv = tn(), yt(e, m, n), S() && U !== null && U.f & 1024 && !(U.f & 96) && (J === null ? Qt([e]) : J.push(e)), !r.is_fork && mt.size > 0 && !ht && vt();
	}
	return t;
}
function vt() {
	ht = !1;
	for (let e of mt) {
		e.f & 1024 && E(e, h);
		let t;
		try {
			t = nn(e);
		} catch {
			t = !0;
		}
		t && Q(e);
	}
	mt.clear();
}
function F(e) {
	P(e, e.v + 1);
}
function yt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = S(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === U)) {
			var l = (c & m) === 0;
			if (l && E(s, t), c & 131072) mt.add(s);
			else if (c & 2) {
				var u = s;
				k?.delete(u), c & 65536 || (c & 512 && (U === null || !(U.f & 2097152)) && (s.f |= ie), yt(u, h, n));
			} else if (l) {
				var d = s;
				c & 16 && j !== null && j.add(d), n === null ? dt(d) : n.push(d);
			}
		}
	}
}
function I(t) {
	if (typeof t != "object" || !t || ce in t) return t;
	let n = c(t);
	if (n !== o && n !== s) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), l = /* @__PURE__ */ N(0), u = null, d = X, f = (e) => {
		if (X === d) return e();
		var t = B, n = X;
		H(null), en(d);
		var r = e();
		return H(t), en(n), r;
	};
	return i && r.set("length", /* @__PURE__ */ N(t.length, u)), new Proxy(t, {
		defineProperty(e, t, n) {
			(!("value" in n) || n.configurable === !1 || n.enumerable === !1 || n.writable === !1) && ve();
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
					let e = f(() => /* @__PURE__ */ N(y, u));
					r.set(t, e), F(l);
				}
			} else P(n, y), F(l);
			return !0;
		},
		get(e, n, i) {
			if (n === ce) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ N(I(s ? e[n] : y), u)), r.set(n, o)), o !== void 0) {
				var c = $(o);
				return c === y ? void 0 : c;
			}
			return Reflect.get(e, n, i);
		},
		getOwnPropertyDescriptor(e, t) {
			var n = Reflect.getOwnPropertyDescriptor(e, t);
			if (n && "value" in n) {
				var i = r.get(t);
				i && (n.value = $(i));
			} else if (n === void 0) {
				var a = r.get(t), o = a?.v;
				if (a !== void 0 && o !== y) return {
					enumerable: !0,
					configurable: !0,
					value: o,
					writable: !0
				};
			}
			return n;
		},
		has(e, t) {
			if (t === ce) return !0;
			var n = r.get(t), i = n !== void 0 && n.v !== y || Reflect.has(e, t);
			return (n !== void 0 || U !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ N(i ? I(e[t]) : y, u)), r.set(t, n)), $(n) === y) ? !1 : i;
		},
		set(e, t, n, o) {
			var s = r.get(t), c = t in e;
			if (i && t === "length") for (var d = n; d < s.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ N(y, u)), r.set(d + "", p)) : P(p, y);
			}
			if (s === void 0) (!c || a(e, t)?.writable) && (s = f(() => /* @__PURE__ */ N(void 0, u)), P(s, I(n)), r.set(t, s));
			else {
				c = s.v !== y;
				var m = f(() => I(n));
				P(s, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(o, n), !c) {
				if (i && typeof t == "string") {
					var g = r.get("length"), ee = Number(t);
					Number.isInteger(ee) && ee >= g.v && P(g, ee + 1);
				}
				F(l);
			}
			return !0;
		},
		ownKeys(e) {
			$(l);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== y;
			});
			for (var [n, i] of r) i.v !== y && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			ye();
		}
	});
}
var bt, xt, St, Ct;
function wt() {
	if (bt === void 0) {
		bt = window, xt = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		St = a(t, "firstChild").get, Ct = a(t, "nextSibling").get, l(e) && (e[de] = void 0, e[ue] = null, e[fe] = void 0, e.__e = void 0), l(n) && (n[pe] = void 0);
	}
}
function Tt(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Et(e) {
	return St.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function Dt(e) {
	return Ct.call(e);
}
function Ot(e, t) {
	return /* @__PURE__ */ Et(e);
}
function kt(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function At(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function L(e, t) {
	var n = U;
	n !== null && n.f & 8192 && (e |= g);
	var r = {
		ctx: b,
		deps: null,
		nodes: null,
		f: e | m | 512,
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
	O?.register_created_effect(r);
	var i = r;
	if (e & 4) A === null ? ct.ensure().schedule(r) : A.push(r);
	else if (t !== null) {
		try {
			Q(r);
		} catch (e) {
			throw R(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= ne));
	}
	if (i !== null && (i.parent = n, n !== null && At(i, n), B !== null && B.f & 2 && !(e & 64))) {
		var a = B;
		(a.effects ??= []).push(i);
	}
	return r;
}
function jt() {
	return B !== null && !V;
}
function Mt(e) {
	let t = L(8, null);
	return E(t, p), t.teardown = e, t;
}
function Nt(e) {
	return L(4 | re, e);
}
function Pt(e) {
	ct.ensure();
	let t = L(64 | v, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? Gt(t, () => {
			R(t), n(void 0);
		}) : (R(t), n(void 0));
	});
}
function Ft(e) {
	return L(oe | v, e);
}
function It(e, t = 0) {
	return L(8 | t, e);
}
function Lt(e, t = [], n = [], r = []) {
	He(r, t, n, (t) => {
		L(8, () => {
			e(...t.map($));
		});
	});
}
function Rt(e, t = 0) {
	return L(16 | t, e);
}
function zt(e) {
	return L(32 | v, e);
}
function Bt(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = z, n = B;
		Xt(!0), H(null);
		try {
			t.call(null);
		} finally {
			Xt(e), H(n);
		}
	}
}
function Vt(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && Le(() => {
			e.abort(me);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : R(n, t), n = r;
	}
}
function Ht(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || R(t), t = n;
	}
}
function R(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (Ut(e.nodes.start, e.nodes.end), n = !0), e.f |= _, Vt(e, t && !n), Z(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Bt(e), e.f ^= _, e.f |= ee;
	var i = e.parent;
	i !== null && i.first !== null && Wt(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function Ut(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ Dt(e);
		e.remove(), e = n;
	}
}
function Wt(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function Gt(e, t, n = !0) {
	var r = [];
	Kt(e, r, !0);
	var i = () => {
		n && R(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Kt(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= g;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Kt(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function qt(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ Dt(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var Jt = null, Yt = !1, z = !1;
function Xt(e) {
	z = e;
}
var B = null, V = !1;
function H(e) {
	B = e;
}
var U = null;
function W(e) {
	U = e;
}
var G = null;
function Zt(e) {
	B !== null && (G ??= /* @__PURE__ */ new Set()).add(e);
}
var K = null, q = 0, J = null;
function Qt(e) {
	J = e;
}
var $t = 1, Y = 0, X = Y;
function en(e) {
	X = e;
}
function tn() {
	return ++$t;
}
function nn(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~ie), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (nn(a) && Qe(a), a.wv > e.wv) return !0;
		}
		t & 512 && k === null && E(e, p);
	}
	return !1;
}
function rn(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(G !== null && G.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? rn(a, t, !1) : t === a && (n ? E(a, m) : a.f & 1024 && E(a, h), dt(a));
	}
}
function an(e) {
	var t = K, n = q, r = J, i = B, a = G, o = b, s = V, c = X, l = e.f;
	K = null, q = 0, J = null, B = l & 96 ? null : e, G = null, x(e.ctx), V = !1, X = ++Y, e.ac !== null && (Le(() => {
		e.ac.abort(me);
	}), e.ac = null);
	try {
		e.f |= ae;
		var u = e.fn, d = u();
		e.f |= te;
		var f = e.deps, p = O?.is_fork;
		if (K !== null) {
			var m;
			if (p || Z(e, q), f !== null && q > 0) for (f.length = q + K.length, m = 0; m < K.length; m++) f[q + m] = K[m];
			else e.deps = f = K;
			if (jt() && e.f & 512) for (m = q; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && q < f.length && (Z(e, q), f.length = q);
		if (S() && J !== null && !V && f !== null && !(e.f & 6146)) for (m = 0; m < J.length; m++) rn(J[m], e);
		if (i !== null && i !== e) {
			if (Y++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Y;
			if (t !== null) for (let e of t) e.rv = Y;
			J !== null && (r === null ? r = J : r.push(...J));
		}
		return e.f & 8388608 && (e.f ^= se), d;
	} catch (e) {
		return Ae(e);
	} finally {
		e.f ^= ae, K = t, q = n, J = r, B = i, G = a, x(o), V = s, X = c;
	}
}
function on(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (K === null || !n.call(K, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~ie), s.v !== y && Me(s), s.ac !== null && Le(() => {
			s.ac.abort(me), s.ac = null, E(s, m);
		}), $e(s), Z(s, 0);
	}
}
function Z(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) on(e, n[r]);
}
function Q(e) {
	var t = e.f;
	if (!(t & 16384)) {
		E(e, p);
		var n = U, r = Yt;
		U = e, Yt = !(t & 96);
		try {
			t & 16777232 ? Ht(e) : Vt(e), Bt(e);
			var i = an(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = $t;
		} finally {
			Yt = r, U = n;
		}
	}
}
function $(e) {
	var t = !!(e.f & 2);
	if (Jt?.add(e), B !== null && !V && !(U !== null && U.f & 16384) && (G === null || !G.has(e))) {
		var r = B.deps;
		if (B.f & 2097152) e.rv < Y && (e.rv = Y, K === null && r !== null && r[q] === e ? q++ : K === null ? K = [e] : K.push(e));
		else {
			B.deps ??= [], n.call(B.deps, e) || B.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [B] : n.call(i, B) || i.push(B);
		}
	}
	if (z && M.has(e)) return M.get(e);
	if (t) {
		var a = e;
		if (z) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || cn(a)) && (o = Ze(a)), M.set(a, o), o;
		}
		var s = !(a.f & 512) && !V && B !== null && (Yt || !!(B.f & 512)), c = (a.f & te) === 0;
		nn(a) && (s && (a.f |= 512), Qe(a)), s && !c && (et(a), sn(a));
	}
	if (k?.has(e)) return k.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function sn(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (et(t), sn(t));
}
function cn(e) {
	if (e.v === y) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (M.has(t) || t.f & 2 && cn(t)) return !0;
	return !1;
}
function ln(e) {
	var t = V;
	try {
		return V = !0, e();
	} finally {
		V = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var un = ["touchstart", "touchmove"];
function dn(e) {
	return un.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var fn = Symbol("events"), pn = /* @__PURE__ */ new Set(), mn = /* @__PURE__ */ new Set(), hn = null;
function gn(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	hn = e;
	var s = 0, c = hn === e && e[fn];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[fn] = t;
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
		var d = B, f = U;
		H(null), W(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[fn]?.[r];
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
			e[fn] = t, delete e.currentTarget, H(d), W(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var _n = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function vn(e) {
	return _n?.createHTML(e) ?? e;
}
function yn(e) {
	var t = kt("template");
	return t.innerHTML = vn(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function bn(e, t) {
	var n = U;
	n.nodes === null && (n.nodes = {
		start: e,
		end: t,
		a: null,
		t: null
	});
}
/*#__NO_SIDE_EFFECTS__*/
function xn(e, t) {
	var n = !!(t & 1), r = !!(t & 2), i, a = !e.startsWith("<!>");
	return () => {
		i === void 0 && (i = yn(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ Et(i)));
		var t = r || xt ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ Et(t), s = t.lastChild;
			bn(o, s);
		} else bn(t, t);
		return t;
	};
}
function Sn(e, t) {
	e !== null && e.before(t);
}
function Cn(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[pe] ??= e.nodeValue) && (e[pe] = n, e.nodeValue = `${n}`);
}
function wn(e, t) {
	return En(e, t);
}
var Tn = /* @__PURE__ */ new Map();
function En(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	wt();
	var l = void 0, u = Pt(() => {
		var s = n ?? t.appendChild(Tt());
		Be(s, { pending: () => {} }, (t) => {
			De({});
			var n = b;
			o && (n.c = o), a && (i.$$events = a), l = e(t, i) || {}, Oe();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = dn(r);
					for (let e of [t, document]) {
						var a = Tn.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Tn.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, gn, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(pn)), mn.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Tn.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, gn), r.delete(e), r.size === 0 && Tn.delete(n)) : r.set(e, i);
			}
			mn.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Dn.set(l, u), l;
}
var Dn = /* @__PURE__ */ new WeakMap();
function On(e, t) {
	let n = Dn.get(e);
	return n ? (Dn.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function kn(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ Ke(r), $(u)) : (l && (l = !1, c = s ? ln(r) : r), c);
	let f;
	if (o) {
		var p = ce in e || le in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = Ie(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && _e(t), f(m)));
	var g = i ? () => {
		var n = e[t];
		return n === void 0 ? d() : (l = !0, n);
	} : () => {
		var n = e[t];
		return n !== void 0 && (c = void 0), n === void 0 ? c : n;
	};
	if (i && !(n & 4)) return g;
	if (f) {
		var ee = e.$$legacy;
		return (function(e, t) {
			return arguments.length > 0 ? ((!i || !t || ee || h) && f(t ? g() : e), e) : g();
		});
	}
	var te = !1, _ = (n & 1 ? Ke : Ye)(() => (te = !1, g()));
	o && $(_);
	var ne = U;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? $(_) : i && o ? I(e) : e;
			return P(_, n), te = !0, c !== void 0 && (c = n), e;
		}
		return z && te || ne.f & 16384 ? _.v : $(_);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/islands/BrandVersion.svelte
var An = /* @__PURE__ */ xn("<span data-svelte-owned=\"brand-version\"> </span>");
function jn(e, t) {
	let n = kn(t, "version", 3, "v0.1.0");
	var r = An(), i = Ot(r, !0);
	Lt(() => Cn(i, n())), Sn(e, r);
}
//#endregion
//#region src/islands/lifecycle.ts
var Mn = /* @__PURE__ */ new Map();
async function Nn(e, t, n) {
	await Pn(e), t.replaceChildren(), Mn.set(e, n(t));
}
async function Pn(e) {
	let t = Mn.get(e);
	t && (Mn.delete(e), await t());
}
async function Fn() {
	let e = [...Mn.keys()];
	await Promise.all(e.map((e) => Pn(e)));
}
//#endregion
//#region src/entry.ts
var In = "brand-version";
async function Ln() {
	let e = document.getElementById("brandVersionIsland");
	if (!e) return;
	let t = e.dataset.version || "v0.1.0";
	try {
		await Nn(In, e, (e) => {
			let n = wn(jn, {
				target: e,
				props: { version: t }
			});
			return () => On(n);
		});
	} catch (n) {
		throw e.textContent = t, n;
	}
}
var Rn = {
	mountBrandVersion: Ln,
	unmount: Pn,
	unmountAll: Fn
}, zn = window.ForgeSvelteIslands;
window.ForgeSvelteIslands = Rn, window.ForgeSveltePageLifecycleInstalled || (window.ForgeSveltePageLifecycleInstalled = !0, window.addEventListener("pagehide", () => {
	window.ForgeSvelteIslands?.unmountAll();
}), window.addEventListener("pageshow", (e) => {
	e.persisted && window.ForgeSvelteIslands?.mountBrandVersion();
})), (async () => {
	await zn?.unmountAll(), await Ln();
})().catch((e) => console.error("Failed to mount the Forge Svelte island", e));
//#endregion
