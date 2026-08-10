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
var we = {}, D = Symbol("uninitialized"), Te = "http://www.w3.org/1999/xhtml";
function Ee() {
	console.warn("https://svelte.dev/e/derived_inert");
}
function De(e) {
	console.warn("https://svelte.dev/e/hydration_mismatch");
}
function Oe() {
	console.warn("https://svelte.dev/e/select_multiple_invalid_value");
}
function ke() {
	console.warn("https://svelte.dev/e/svelte_boundary_reset_noop");
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/hydration.js
var O = !1;
function Ae(e) {
	O = e;
}
var k;
function je(e) {
	if (e === null) throw De(), we;
	return k = e;
}
function Me() {
	return je(/* @__PURE__ */ on(k));
}
function A(e) {
	if (O) {
		if (/* @__PURE__ */ on(k) !== null) throw De(), we;
		k = e;
	}
}
function Ne(e = 1) {
	if (O) {
		for (var t = e, n = k; t--;) n = /* @__PURE__ */ on(n);
		k = n;
	}
}
function Pe(e = !0) {
	for (var t = 0, n = k;;) {
		if (n.nodeType === 8) {
			var r = n.data;
			if (r === "]") {
				if (t === 0) return n;
				--t;
			} else (r === "[" || r === "[!" || r[0] === "[" && !isNaN(Number(r.slice(1)))) && (t += 1);
		}
		var i = /* @__PURE__ */ on(n);
		e && n.remove(), n = i;
	}
}
function Fe(e) {
	if (!e || e.nodeType !== 8) throw De(), we;
	return e.data;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/equality.js
function Ie(e) {
	return e === this.v;
}
function Le(e, t) {
	return e == e ? e !== t || typeof e == "object" && !!e || typeof e == "function" : t == t;
}
function Re(e) {
	return !Le(e, this.v);
}
//#endregion
//#region node_modules/svelte/src/internal/client/context.js
var j = null;
function ze(e) {
	j = e;
}
function Be(e, t = !1, n) {
	j = {
		p: j,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: H,
		l: null
	};
}
function Ve(e) {
	var t = j, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) vn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, j = t.p, e ?? {};
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
	if (Ue.length === 0 && !Dt) {
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
	var t = H;
	if (t === null) return V.f |= te, e;
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
function M(e, t) {
	e.f = e.f & Ye | t;
}
function Xe(e) {
	e.f & 512 || e.deps === null ? M(e, m) : M(e, g);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/utils.js
function Ze(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, Ze(t.deps));
}
function Qe(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), Ze(e.deps), M(e, m);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/store.js
var $e = !1;
function et(e) {
	var t = $e;
	try {
		return $e = !1, [e(), $e];
	} finally {
		$e = t;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/misc.js
function tt(e) {
	O && /* @__PURE__ */ an(e) !== null && cn(e);
}
var nt = !1;
function rt() {
	nt || (nt = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[le]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function it(e) {
	var t = V, n = H;
	Vn(null), Hn(null);
	try {
		return e();
	} finally {
		Vn(t), Hn(n);
	}
}
function at(e, t, n, r = n) {
	e.addEventListener(t, () => it(n));
	let i = e[le];
	e[le] = i ? () => {
		i(), r(!0);
	} : () => r(!0), rt();
}
//#endregion
//#region node_modules/svelte/src/reactivity/create-subscriber.js
function ot(e) {
	let t = 0, n = Wt(0), r;
	return () => {
		hn() && (U(n), Sn(() => (t === 0 && (r = lr(() => e(() => Jt(n)))), t += 1, () => {
			Ge(() => {
				--t, t === 0 && (r?.(), r = void 0, Jt(n));
			});
		})));
	};
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var st = x | S;
function ct(e, t, n, r) {
	new lt(e, t, n, r);
}
var lt = class {
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
	#h = ot(() => (this.#m = Wt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Cn(() => {
			if (O) {
				let e = this.#t;
				Me();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, st), O && (this.#e = k);
	}
	#g() {
		try {
			this.#a = wn(() => this.#r(this.#e));
		} catch (e) {
			this.error(e);
		}
	}
	#_(e) {
		let t = this.#n.failed, { reset: n, invoke_onerror: r } = this.#v(e);
		Ge(r), t && (this.#s = wn(() => {
			t(this.#e, () => e, () => n);
		}));
	}
	#v(e) {
		var t = !1, n = !1;
		let r = () => {
			if (t) {
				ke();
				return;
			}
			t = !0, n && Ce(), this.#s !== null && jn(this.#s, () => {
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
		e && (this.is_pending = !0, this.#o = wn(() => e(this.#e)), Ge(() => {
			var e = this.#c = document.createDocumentFragment(), t = rn();
			e.append(t), this.#a = this.#S(() => wn(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, jn(this.#o, () => {
				this.#o = null;
			}), this.#x(P));
		}));
	}
	#b() {
		try {
			if (this.is_pending = this.has_pending_snippet(), this.#u = 0, this.#l = 0, this.#a = wn(() => {
				this.#r(this.#e);
			}), this.#u > 0) {
				var e = this.#c = document.createDocumentFragment();
				Fn(this.#a, e);
				let t = this.#n.pending;
				this.#o = wn(() => t(this.#e));
			} else this.#x(P);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		Qe(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = H, n = V, r = j;
		Hn(this.#i), Vn(this.#i), ze(this.#i.ctx);
		try {
			return Nt.ensure(), e();
		} catch (e) {
			return qe(e), null;
		} finally {
			Hn(t), Vn(n), ze(r);
		}
	}
	#C(e, t) {
		if (!this.has_pending_snippet()) {
			this.parent && this.parent.#C(e, t);
			return;
		}
		this.#u += e, this.#u === 0 && (this.#x(t), this.#o && jn(this.#o, () => {
			this.#o = null;
		}), this.#c &&= (this.#e.before(this.#c), null));
	}
	update_pending_count(e, t) {
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ge(() => {
			this.#d = !1, this.#m && Kt(this.#m, this.#l);
		}));
	}
	get_effect_pending() {
		return this.#h(), U(this.#m);
	}
	error(e) {
		if (!this.#n.onerror && !this.#n.failed) throw e;
		P?.is_fork ? (this.#a && P.skip_effect(this.#a), this.#o && P.skip_effect(this.#o), this.#s && P.skip_effect(this.#s), P.oncommit(() => {
			this.#w(e);
		})) : this.#w(e);
	}
	#w(e) {
		this.#a &&= (On(this.#a), null), this.#o &&= (On(this.#o), null), this.#s &&= (On(this.#s), null), O && (je(this.#t), Ne(), je(Pe()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return wn(() => {
						var r = H;
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
function ut(e, t, n, r) {
	let i = He() ? mt : _t;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = H, c = dt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Je(e, s);
			}
			ft();
		}
	}
	var d = pt();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ gt(e))).then(u).catch((e) => Je(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), ft();
	}) : f();
}
function dt() {
	var e = H, t = V, n = j, r = P;
	return function(i = !0) {
		Hn(e), Vn(t), ze(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function ft(e = !0) {
	Hn(null), Vn(null), ze(null), e && P?.deactivate();
}
function pt() {
	var e = H, t = e.b, n = P, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function mt(e) {
	var t = 2 | h;
	return H !== null && (H.f |= S), {
		ctx: j,
		deps: null,
		effects: null,
		equals: Ie,
		f: t,
		fn: e,
		reactions: null,
		rv: 0,
		v: D,
		wv: 0,
		parent: H,
		ac: null
	};
}
var ht = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function gt(e, t, n) {
	let r = H;
	r === null && pe();
	var i = void 0, a = Wt(D), o = !V, s = /* @__PURE__ */ new Set();
	return xn(() => {
		var t = H, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ue && n.reject(e);
			}).finally(ft);
		} catch (e) {
			n.reject(e), ft();
		}
		var c = P;
		if (o) {
			if (t.f & 32768) var l = pt();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(ht);
			else for (let e of s.values()) e.reject(ht);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== ht && (c.activate(), t ? (a.f |= te, Kt(a, t)) : (a.f & 8388608 && (a.f ^= te), Kt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), gn(() => {
		for (let e of s) e.reject(ht);
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
	let t = /* @__PURE__ */ mt(e);
	return Wn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function _t(e) {
	let t = /* @__PURE__ */ mt(e);
	return t.equals = Re, t;
}
function vt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) On(t[n]);
	}
}
function yt(e) {
	var t, n = H, r = e.parent;
	if (!Rn && r !== null && e.v !== D && r.f & 24576) return Ee(), e.v;
	Hn(r);
	try {
		e.f &= ~T, vt(e), t = nr(e);
	} finally {
		Hn(n);
	}
	return t;
}
function bt(e) {
	var t = yt(e);
	if (!e.equals(t) && (e.wv = $n(), (!P?.is_fork || e.deps === null) && (P === null ? e.v = t : (P.capture(e, t, !0), wt?.capture(e, t, !0)), e.deps === null))) {
		M(e, m);
		return;
	}
	Rn || (Tt === null ? Xe(e) : (hn() || P?.is_fork) && Tt.set(e, t));
}
function xt(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && it(() => {
		t.ac.abort(ue), t.ac = null;
	}), t.fn !== null && (t.teardown = d), ir(t, 0), En(t));
}
function St(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && ar(t);
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/batch.js
var Ct = null, P = null, wt = null, Tt = null, Et = null, Dt = !1, Ot = !1, kt = null, At = null, jt = 0, Mt = 1, Nt = class e {
	id = Mt++;
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
		Ct === null ? Ct = this : (Ct.#n = this, this.#t = Ct), Ct = this;
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
			for (var r of n.d) M(r, h), t(r);
			for (r of n.m) M(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, jt++ > 1e3 && (this.#x(), Ft());
		for (let e of this.#u) this.#d.delete(e), M(e, h), this.schedule(e);
		for (let e of this.#d) M(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = kt = [], r = [], i = At = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Bt(e), this.#h() || this.discard(), t;
		}
		if (P = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (kt = null, At = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) zt(e, t);
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
		this.#r.clear(), wt = this, Lt(r), Lt(n), wt = null, this.#s?.resolve();
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
				a ? r.f ^= m : i & 4 ? t.push(r) : er(r) && (i & 16 && this.#d.add(r), ar(r));
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), M(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), P = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) Qe(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== D && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Tt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		P = this;
	}
	deactivate() {
		P = null, Tt = null;
	}
	flush() {
		try {
			Ot = !0, P = this, this.#g();
		} finally {
			jt = 0, Et = null, kt = null, At = null, Ot = !1, P = null, Tt = null, Ht.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(ht);
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
		if (P === null) {
			let t = P = new e();
			!Ot && !Dt && Ge(() => {
				t.#e || t.flush();
			});
		}
		return P;
	}
	apply() {
		Tt = null;
	}
	schedule(e) {
		if (Et = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (kt !== null && t === H && (V === null || !(V.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Ct = e : t.#t = e, this.linked = !1;
		}
	}
};
function Pt(e) {
	var t = Dt;
	Dt = !0;
	try {
		var n;
		for (e && (P !== null && !P.is_fork && P.flush(), n = e());;) {
			if (Ke(), P === null) return n;
			P.flush();
		}
	} finally {
		Dt = t;
	}
}
function Ft() {
	try {
		ve();
	} catch (e) {
		Je(e, Et);
	}
}
var It = null;
function Lt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && er(r) && (It = /* @__PURE__ */ new Set(), ar(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && An(r), It?.size > 0)) {
				Ht.clear();
				for (let e of It) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) It.has(n) && (It.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || ar(n);
					}
				}
				It.clear();
			}
		}
		It = null;
	}
}
function Rt(e) {
	P.schedule(e);
}
function zt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), M(e, m);
		for (var n = e.first; n !== null;) zt(n, t), n = n.next;
	}
}
function Bt(e) {
	M(e, m);
	for (var t = e.first; t !== null;) Bt(t), t = t.next;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/sources.js
var Vt = /* @__PURE__ */ new Set(), Ht = /* @__PURE__ */ new Map(), Ut = !1;
function Wt(e, t) {
	return {
		f: 0,
		v: e,
		reactions: null,
		equals: Ie,
		rv: 0,
		wv: 0
	};
}
/*#__NO_SIDE_EFFECTS__*/
function F(e, t) {
	let n = Wt(e, t);
	return Wn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function Gt(e, t = !1, n = !0) {
	let r = Wt(e);
	return t || (r.equals = Re), r;
}
function I(e, t, n = !1) {
	return V !== null && (!Bn || V.f & 131072) && He() && V.f & 4325394 && (Un === null || !Un.has(e)) && Se(), Kt(e, n ? L(t) : t, At);
}
function Kt(e, t, n = null) {
	if (!e.equals(t)) {
		Ht.set(e, Rn ? t : e.v);
		var r = Nt.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && yt(t), Tt === null && Xe(t);
		}
		e.wv = $n(), Yt(e, h, n), He() && H !== null && H.f & 1024 && !(H.f & 96) && (qn === null ? Jn([e]) : qn.push(e)), !r.is_fork && Vt.size > 0 && !Ut && qt();
	}
	return t;
}
function qt() {
	Ut = !1;
	for (let e of Vt) {
		e.f & 1024 && M(e, g);
		let t;
		try {
			t = er(e);
		} catch {
			t = !0;
		}
		t && ar(e);
	}
	Vt.clear();
}
function Jt(e) {
	I(e, e.v + 1);
}
function Yt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = He(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === H)) {
			var l = (c & h) === 0;
			if (l && M(s, t), c & 131072) Vt.add(s);
			else if (c & 2) {
				var u = s;
				Tt?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= T), Yt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && It !== null && It.add(d), n === null ? Rt(d) : n.push(d);
			}
		}
	}
}
function L(t) {
	if (typeof t != "object" || !t || ne in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ F(0), u = null, d = Zn, f = (e) => {
		if (Zn === d) return e();
		var t = V, n = Zn;
		Vn(null), Qn(d);
		var r = e();
		return Vn(t), Qn(n), r;
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
					let e = f(() => /* @__PURE__ */ F(D, u));
					r.set(t, e), Jt(o);
				}
			} else I(n, D), Jt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === ne) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ F(L(s ? e[n] : D), u)), r.set(n, o)), o !== void 0) {
				var c = U(o);
				return c === D ? void 0 : c;
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
				if (a !== void 0 && o !== D) return {
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
			var n = r.get(t), i = n !== void 0 && n.v !== D || Reflect.has(e, t);
			return (n !== void 0 || H !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ F(i ? L(e[t]) : D, u)), r.set(t, n)), U(n) === D) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ F(D, u)), r.set(d + "", p)) : I(p, D);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ F(void 0, u)), I(c, L(n)), r.set(t, c));
			else {
				l = c.v !== D;
				var m = f(() => L(n));
				I(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && I(g, _ + 1);
				}
				Jt(o);
			}
			return !0;
		},
		ownKeys(e) {
			U(o);
			var t = Reflect.ownKeys(e).filter((e) => {
				var t = r.get(e);
				return t === void 0 || t.v !== D;
			});
			for (var [n, i] of r) i.v !== D && !(n in e) && t.push(n);
			return t;
		},
		setPrototypeOf() {
			xe();
		}
	});
}
function Xt(e) {
	try {
		if (typeof e == "object" && e && ne in e) return e[ne];
	} catch {}
	return e;
}
function Zt(e, t) {
	return Object.is(Xt(e), Xt(t));
}
var Qt, $t, en, tn;
function nn() {
	if (Qt === void 0) {
		Qt = window, $t = /Firefox/.test(navigator.userAgent);
		var e = Element.prototype, t = Node.prototype, n = Text.prototype;
		en = a(t, "firstChild").get, tn = a(t, "nextSibling").get, u(e) && (e[oe] = void 0, e[ae] = null, e[se] = void 0, e.__e = void 0), u(n) && (n[ce] = void 0);
	}
}
function rn(e = "") {
	return document.createTextNode(e);
}
/*@__NO_SIDE_EFFECTS__*/
function an(e) {
	return en.call(e);
}
/*@__NO_SIDE_EFFECTS__*/
function on(e) {
	return tn.call(e);
}
function R(e, t) {
	if (!O) return /* @__PURE__ */ an(e);
	var n = /* @__PURE__ */ an(k);
	if (n === null) n = k.appendChild(rn());
	else if (t && n.nodeType !== 3) {
		var r = rn();
		return n?.before(r), je(r), r;
	}
	return t && dn(n), je(n), n;
}
function sn(e, t = !1) {
	if (!O) {
		var n = /* @__PURE__ */ an(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ on(n) : n;
	}
	if (t) {
		if (k?.nodeType !== 3) {
			var r = rn();
			return k?.before(r), je(r), r;
		}
		dn(k);
	}
	return k;
}
function z(e, t = 1, n = !1) {
	let r = O ? k : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ on(r);
	if (!O) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = rn();
			return r === null ? i?.after(a) : r.before(a), je(a), a;
		}
		dn(r);
	}
	return je(r), r;
}
function cn(e) {
	e.textContent = "";
}
function ln() {
	return !1;
}
function un(e, t, n) {
	return t == null || t === "http://www.w3.org/1999/xhtml" ? n ? document.createElement(e, { is: n }) : document.createElement(e) : n ? document.createElementNS(t, e, { is: n }) : document.createElementNS(t, e);
}
function dn(e) {
	if (e.nodeValue.length < 65536) return;
	let t = e.nextSibling;
	for (; t !== null && t.nodeType === 3;) t.remove(), e.nodeValue += t.nodeValue, t = e.nextSibling;
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/effects.js
function fn(e) {
	H === null && (V === null && _e(e), ge()), Rn && he(e);
}
function pn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function mn(e, t) {
	var n = H;
	n !== null && n.f & 8192 && (e |= _);
	var r = {
		ctx: j,
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
	if (e & 4) kt === null ? Nt.ensure().schedule(r) : kt.push(r);
	else if (t !== null) {
		try {
			ar(r);
		} catch (e) {
			throw On(r), e;
		}
		i.deps === null && i.teardown === null && i.nodes === null && i.first === i.last && !(i.f & 524288) && (i = i.first, e & 16 && e & 65536 && i !== null && (i.f |= x));
	}
	if (i !== null && (i.parent = n, n !== null && pn(i, n), V !== null && V.f & 2 && !(e & 64))) {
		var a = V;
		(a.effects ??= []).push(i);
	}
	return r;
}
function hn() {
	return V !== null && !Bn;
}
function gn(e) {
	let t = mn(8, null);
	return M(t, m), t.teardown = e, t;
}
function _n(e) {
	fn("$effect");
	var t = H.f;
	if (!V && t & 32 && j !== null && !j.i) {
		var n = j;
		(n.e ??= []).push(e);
	} else return vn(e);
}
function vn(e) {
	return mn(4 | C, e);
}
function yn(e) {
	Nt.ensure();
	let t = mn(64 | S, e);
	return (e = {}) => new Promise((n) => {
		e.outro ? jn(t, () => {
			On(t), n(void 0);
		}) : (On(t), n(void 0));
	});
}
function bn(e) {
	return mn(4, e);
}
function xn(e) {
	return mn(ee | S, e);
}
function Sn(e, t = 0) {
	return mn(8 | t, e);
}
function B(e, t = [], n = [], r = []) {
	ut(r, t, n, (t) => {
		mn(8, () => {
			e(...t.map(U));
		});
	});
}
function Cn(e, t = 0) {
	return mn(16 | t, e);
}
function wn(e) {
	return mn(32 | S, e);
}
function Tn(e) {
	var t = e.teardown;
	if (t !== null) {
		let e = Rn, n = V;
		zn(!0), Vn(null);
		try {
			t.call(null);
		} finally {
			zn(e), Vn(n);
		}
	}
}
function En(e, t = !1) {
	var n = e.first;
	for (e.first = e.last = null; n !== null;) {
		let e = n.ac;
		e !== null && it(() => {
			e.abort(ue);
		});
		var r = n.next;
		n.f & 64 ? n.parent = null : On(n, t), n = r;
	}
}
function Dn(e) {
	for (var t = e.first; t !== null;) {
		var n = t.next;
		t.f & 32 || On(t), t = n;
	}
}
function On(e, t = !0) {
	var n = !1;
	(t || e.f & 262144) && e.nodes !== null && e.nodes.end !== null && (kn(e.nodes.start, e.nodes.end), n = !0), e.f |= b, En(e, t && !n), ir(e, 0);
	var r = e.nodes && e.nodes.t;
	if (r !== null) for (let e of r) e.stop();
	Tn(e), e.f ^= b, e.f |= v;
	var i = e.parent;
	i !== null && i.first !== null && An(e), e.next = e.prev = e.teardown = e.ctx = e.deps = e.fn = e.nodes = e.ac = e.b = null;
}
function kn(e, t) {
	for (; e !== null;) {
		var n = e === t ? null : /* @__PURE__ */ on(e);
		e.remove(), e = n;
	}
}
function An(e) {
	var t = e.parent, n = e.prev, r = e.next;
	n !== null && (n.next = r), r !== null && (r.prev = n), t !== null && (t.first === e && (t.first = r), t.last === e && (t.last = n));
}
function jn(e, t, n = !0) {
	var r = [];
	Mn(e, r, !0);
	var i = () => {
		n && On(e), t && t();
	}, a = r.length;
	if (a > 0) {
		var o = () => --a || i();
		for (var s of r) s.out(o);
	} else i();
}
function Mn(e, t, n) {
	if (!(e.f & 8192)) {
		e.f ^= _;
		var r = e.nodes && e.nodes.t;
		if (r !== null) for (let e of r) (e.is_global || n) && t.push(e);
		for (var i = e.first; i !== null;) {
			var a = i.next;
			if (!(i.f & 64)) {
				var o = !!(i.f & 65536) || !!(i.f & 32) && !!(e.f & 16);
				Mn(i, t, o ? n : !1);
			}
			i = a;
		}
	}
}
function Nn(e) {
	Pn(e, !0);
}
function Pn(e, t) {
	if (e.f & 8192) {
		e.f ^= _, e.f & 1024 || (M(e, h), Nt.ensure().schedule(e));
		for (var n = e.first; n !== null;) {
			var r = n.next, i = !!(n.f & 65536) || !!(n.f & 32);
			Pn(n, i ? t : !1), n = r;
		}
		var a = e.nodes && e.nodes.t;
		if (a !== null) for (let e of a) (e.is_global || t) && e.in();
	}
}
function Fn(e, t) {
	if (e.nodes) for (var n = e.nodes.start, r = e.nodes.end; n !== null;) {
		var i = n === r ? null : /* @__PURE__ */ on(n);
		t.append(n), n = i;
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/legacy.js
var In = null, Ln = !1, Rn = !1;
function zn(e) {
	Rn = e;
}
var V = null, Bn = !1;
function Vn(e) {
	V = e;
}
var H = null;
function Hn(e) {
	H = e;
}
var Un = null;
function Wn(e) {
	V !== null && (Un ??= /* @__PURE__ */ new Set()).add(e);
}
var Gn = null, Kn = 0, qn = null;
function Jn(e) {
	qn = e;
}
var Yn = 1, Xn = 0, Zn = Xn;
function Qn(e) {
	Zn = e;
}
function $n() {
	return ++Yn;
}
function er(e) {
	var t = e.f;
	if (t & 2048) return !0;
	if (t & 2 && (e.f &= ~T), t & 4096) {
		for (var n = e.deps, r = n.length, i = 0; i < r; i++) {
			var a = n[i];
			if (er(a) && bt(a), a.wv > e.wv) return !0;
		}
		t & 512 && Tt === null && M(e, m);
	}
	return !1;
}
function tr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Un !== null && Un.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? tr(a, t, !1) : t === a && (n ? M(a, h) : a.f & 1024 && M(a, g), Rt(a));
	}
}
function nr(e) {
	var t = Gn, n = Kn, r = qn, i = V, a = Un, o = j, s = Bn, c = Zn, l = e.f;
	Gn = null, Kn = 0, qn = null, V = l & 96 ? null : e, Un = null, ze(e.ctx), Bn = !1, Zn = ++Xn, e.ac !== null && (it(() => {
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = P?.is_fork;
		if (Gn !== null) {
			var m;
			if (p || ir(e, Kn), f !== null && Kn > 0) for (f.length = Kn + Gn.length, m = 0; m < Gn.length; m++) f[Kn + m] = Gn[m];
			else e.deps = f = Gn;
			if (hn() && e.f & 512) for (m = Kn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Kn < f.length && (ir(e, Kn), f.length = Kn);
		if (He() && qn !== null && !Bn && f !== null && !(e.f & 6146)) for (m = 0; m < qn.length; m++) tr(qn[m], e);
		if (i !== null && i !== e) {
			if (Xn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Xn;
			if (t !== null) for (let e of t) e.rv = Xn;
			qn !== null && (r === null ? r = qn : r.push(...qn));
		}
		return e.f & 8388608 && (e.f ^= te), d;
	} catch (e) {
		return qe(e);
	} finally {
		e.f ^= E, Gn = t, Kn = n, qn = r, V = i, Un = a, ze(o), Bn = s, Zn = c;
	}
}
function rr(e, r) {
	let i = r.reactions;
	if (i !== null) {
		var a = t.call(i, e);
		if (a !== -1) {
			var o = i.length - 1;
			o === 0 ? i = r.reactions = null : (i[a] = i[o], i.pop());
		}
	}
	if (i === null && r.f & 2 && (Gn === null || !n.call(Gn, r))) {
		var s = r;
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== D && Xe(s), s.ac !== null && it(() => {
			s.ac.abort(ue), s.ac = null, M(s, h);
		}), xt(s), ir(s, 0);
	}
}
function ir(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) rr(e, n[r]);
}
function ar(e) {
	var t = e.f;
	if (!(t & 16384)) {
		M(e, m);
		var n = H, r = Ln;
		H = e, Ln = !(t & 96);
		try {
			t & 16777232 ? Dn(e) : En(e), Tn(e);
			var i = nr(e);
			e.teardown = typeof i == "function" ? i : null, e.wv = Yn;
		} finally {
			Ln = r, H = n;
		}
	}
}
async function or() {
	await Promise.resolve(), Pt();
}
function U(e) {
	var t = !!(e.f & 2);
	if (In?.add(e), V !== null && !Bn && !(H !== null && H.f & 16384) && (Un === null || !Un.has(e))) {
		var r = V.deps;
		if (V.f & 2097152) e.rv < Xn && (e.rv = Xn, Gn === null && r !== null && r[Kn] === e ? Kn++ : Gn === null ? Gn = [e] : Gn.push(e));
		else {
			V.deps ??= [], n.call(V.deps, e) || V.deps.push(e);
			var i = e.reactions;
			i === null ? e.reactions = [V] : n.call(i, V) || i.push(V);
		}
	}
	if (Rn && Ht.has(e)) return Ht.get(e);
	if (t) {
		var a = e;
		if (Rn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || cr(a)) && (o = yt(a)), Ht.set(a, o), o;
		}
		var s = !(a.f & 512) && !Bn && V !== null && (Ln || !!(V.f & 512)), c = (a.f & y) === 0;
		er(a) && (s && (a.f |= 512), bt(a)), s && !c && (St(a), sr(a));
	}
	if (Tt?.has(e)) return Tt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function sr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (St(t), sr(t));
}
function cr(e) {
	if (e.v === D) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Ht.has(t) || t.f & 2 && cr(t)) return !0;
	return !1;
}
function lr(e) {
	var t = Bn;
	try {
		return Bn = !0, e();
	} finally {
		Bn = t;
	}
}
[.../* @__PURE__ */ "allowfullscreen.async.autofocus.autoplay.checked.controls.default.disabled.formnovalidate.indeterminate.inert.ismap.loop.multiple.muted.nomodule.novalidate.open.playsinline.readonly.required.reversed.seamless.selected.webkitdirectory.defer.disablepictureinpicture.disableremoteplayback".split(".")];
var ur = ["touchstart", "touchmove"];
function dr(e) {
	return ur.includes(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/events.js
var fr = Symbol("events"), pr = /* @__PURE__ */ new Set(), mr = /* @__PURE__ */ new Set();
function hr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || yr.call(t, e), !e.cancelBubble) return it(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ge(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function gr(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = hr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && gn(() => {
		t.removeEventListener(e, o, a);
	});
}
function W(e, t, n) {
	(t[fr] ??= {})[e] = n;
}
function _r(e) {
	for (var t = 0; t < e.length; t++) pr.add(e[t]);
	for (var n of mr) n(e);
}
var vr = null;
function yr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	vr = e;
	var s = 0, c = vr === e && e[fr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[fr] = t;
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
		Vn(null), Hn(null);
		try {
			for (var p, m = []; o !== null && o !== t;) {
				try {
					var h = o[fr]?.[r];
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
			e[fr] = t, delete e.currentTarget, Vn(d), Hn(f);
		}
	}
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/reconciler.js
var br = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function xr(e) {
	return br?.createHTML(e) ?? e;
}
function Sr(e) {
	var t = un("template");
	return t.innerHTML = xr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/template.js
function Cr(e, t) {
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
		if (O) return Cr(k, null), k;
		i === void 0 && (i = Sr(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ an(i)));
		var t = r || $t ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ an(t), s = t.lastChild;
			Cr(o, s);
		} else Cr(t, t);
		return t;
	};
}
function wr() {
	if (O) return Cr(k, null), k;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = rn();
	return e.append(t, n), Cr(t, n), e;
}
function K(e, t) {
	if (O) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = k), Me();
		return;
	}
	e !== null && e.before(t);
}
function q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ce] ??= e.nodeValue) && (e[ce] = n, e.nodeValue = `${n}`);
}
function Tr(e, t) {
	return Dr(e, t);
}
var Er = /* @__PURE__ */ new Map();
function Dr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	nn();
	var l = void 0, u = yn(() => {
		var s = n ?? t.appendChild(rn());
		ct(s, { pending: () => {} }, (t) => {
			Be({});
			var n = j;
			if (o && (n.c = o), a && (i.$$events = a), O && Cr(t, null), l = e(t, i) || {}, O && (H.nodes.end = k, k === null || k.nodeType !== 8 || k.data !== "]")) throw De(), we;
			Ve();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = dr(r);
					for (let e of [t, document]) {
						var a = Er.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), Er.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, yr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(pr)), mr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = Er.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, yr), r.delete(e), r.size === 0 && Er.delete(n)) : r.set(e, i);
			}
			mr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Or.set(l, u), l;
}
var Or = /* @__PURE__ */ new WeakMap();
function kr(e, t) {
	let n = Or.get(e);
	return n ? (Or.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Ar = class {
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
			if (n) Nn(n), this.#r.delete(t);
			else {
				var r = this.#n.get(t);
				r && (Nn(r.effect), this.#t.set(t, r.effect), this.#n.delete(t), r.fragment.lastChild.remove(), this.anchor.before(r.fragment), n = r.effect);
			}
			for (let [t, n] of this.#e) {
				if (this.#e.delete(t), t === e) break;
				let r = this.#n.get(n);
				r && (On(r.effect), this.#n.delete(n));
			}
			for (let [e, r] of this.#t) {
				if (e === t || this.#r.has(e)) continue;
				let i = () => {
					if (Array.from(this.#e.values()).includes(e)) {
						var t = document.createDocumentFragment();
						Fn(r, t), t.append(rn()), this.#n.set(e, {
							effect: r,
							fragment: t
						});
					} else On(r);
					this.#r.delete(e), this.#t.delete(e);
				};
				this.#i || !n ? (this.#r.add(e), jn(r, i, !1)) : i();
			}
		}
	};
	#o = (e) => {
		this.#e.delete(e);
		let t = Array.from(this.#e.values());
		for (let [e, n] of this.#n) t.includes(e) || (On(n.effect), this.#n.delete(e));
	};
	ensure(e, t) {
		var n = P, r = ln();
		if (t && !this.#t.has(e) && !this.#n.has(e)) {
			if (r) {
				var i = document.createDocumentFragment(), a = rn();
				i.append(a), this.#n.set(e, {
					effect: wn(() => t(a)),
					fragment: i
				});
			} else this.#t.set(e, wn(() => t(this.anchor)));
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
	O && (r = k, Me());
	var i = new Ar(e), a = n ? x : 0;
	function o(e, t) {
		if (O) {
			var n = Fe(r);
			if (e !== parseInt(n.substring(1))) {
				var a = Pe();
				je(a), i.anchor = a, Ae(!1), i.ensure(e, t), Ae(!0);
				return;
			}
		}
		i.ensure(e, t);
	}
	Cn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/blocks/each.js
function jr(e, t) {
	return t;
}
function Mr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		jn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Nr(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
				}
			} else --s;
		}, !1);
	}
	if (s === 0) {
		var l = i.length === 0 && n !== null;
		if (l) {
			var u = n, d = u.parentNode;
			cn(d), d.append(u), e.items.clear();
		}
		Nr(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Nr(e, t, n = !0) {
	var r;
	if (e.pending.size > 0) {
		r = /* @__PURE__ */ new Set();
		for (let t of e.pending.values()) for (let n of t) r.add(e.items.get(n).e);
	}
	for (var i = 0; i < t.length; i++) {
		var a = t[i];
		r?.has(a) ? (a.f |= w, Fn(a, document.createDocumentFragment())) : On(t[i], n);
	}
}
var Pr;
function Y(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = O ? je(/* @__PURE__ */ an(u)) : u.appendChild(rn());
	}
	O && Me();
	var d = null, f = /* @__PURE__ */ _t(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Ir(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Rr(d, null, c)) : Nn(d) : jn(d, () => {
			d = null;
		})));
	}
	function _(e) {
		v.pending.delete(e);
	}
	var v = {
		effect: Cn(() => {
			p = U(f);
			var e = p.length;
			let t = !1;
			O && Fe(c) === "[!" != (e === 0) && (c = Pe(), je(c), Ae(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = P, v = ln(), y = 0; y < e; y += 1) {
				O && k.nodeType === 8 && k.data === "]" && (c = k, t = !0, Ae(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Kt(S.v, b), S.i && Kt(S.i, y), v && u.unskip_effect(S.e)) : (S = Lr(l, h ? c : Pr ??= rn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = wn(() => s(c)) : (d = wn(() => s(Pr ??= rn())), d.f |= w)), e > r.size && me("", "", ""), O && e > 0 && je(Pe()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Ae(!0), U(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, O && (c = k);
}
function Fr(e) {
	for (; e !== null && !(e.f & 32);) e = e.next;
	return e;
}
function Ir(e, t, n, i, a) {
	var o = !!(i & 8), s = t.length, c = e.items, l = Fr(e.effect.first), u, d = null, f, p = [], m = [], h, g, _, v;
	if (o) for (v = 0; v < s; v += 1) h = t[v], g = a(h, v), _ = c.get(g).e, _.f & 33554432 || (_.nodes?.a?.measure(), (f ??= /* @__PURE__ */ new Set()).add(_));
	for (v = 0; v < s; v += 1) {
		if (h = t[v], g = a(h, v), _ = c.get(g).e, e.outrogroups !== null) for (let t of e.outrogroups) t.pending.delete(_), t.done.delete(_);
		if (_.f & 8192 && (Nn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
			if (_.f ^= w, _ === l) Rr(_, null, n);
			else {
				var y = d ? d.next : l;
				_ === e.effect.last && (e.effect.last = _.prev), _.prev && (_.prev.next = _.next), _.next && (_.next.prev = _.prev), zr(e, d, _), zr(e, _, y), Rr(_, y, n), d = _, p = [], m = [], l = Fr(d.next);
				continue;
			}
		}
		if (_ !== l) {
			if (u !== void 0 && u.has(_)) {
				if (p.length < m.length) {
					var b = m[0], x;
					d = b.prev;
					var S = p[0], C = p[p.length - 1];
					for (x = 0; x < p.length; x += 1) Rr(p[x], b, n);
					for (x = 0; x < m.length; x += 1) u.delete(m[x]);
					zr(e, S.prev, C.next), zr(e, d, S), zr(e, C, b), l = b, d = C, --v, p = [], m = [];
				} else u.delete(_), Rr(_, l, n), zr(e, _.prev, _.next), zr(e, _, d === null ? e.effect.first : d.next), zr(e, d, _), d = _;
				continue;
			}
			for (p = [], m = []; l !== null && l !== _;) (u ??= /* @__PURE__ */ new Set()).add(l), m.push(l), l = Fr(l.next);
			if (l === null) continue;
		}
		_.f & 33554432 || p.push(_), d = _, l = Fr(_.next);
	}
	if (e.outrogroups !== null) {
		for (let t of e.outrogroups) t.pending.size === 0 && (Nr(e, r(t.done)), e.outrogroups?.delete(t));
		e.outrogroups.size === 0 && (e.outrogroups = null);
	}
	if (l !== null || u !== void 0) {
		var T = [];
		if (u !== void 0) for (_ of u) _.f & 8192 || T.push(_);
		for (; l !== null;) !(l.f & 8192) && l !== e.fallback && T.push(l), l = Fr(l.next);
		var E = T.length;
		if (E > 0) {
			var ee = i & 4 && s === 0 ? n : null;
			if (o) {
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.measure();
				for (v = 0; v < E; v += 1) T[v].nodes?.a?.fix();
			}
			Mr(e, T, ee);
		}
	}
	o && Ge(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Lr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Wt(n) : /* @__PURE__ */ Gt(n, !1, !1) : null, l = o & 2 ? Wt(i) : null;
	return {
		v: c,
		i: l,
		e: wn(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Rr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ on(r);
		if (a.before(r), r === i) return;
		r = o;
	}
}
function zr(e, t, n) {
	t === null ? e.effect.first = n : t.next = n, n === null ? e.effect.last = t : n.prev = t;
}
//#endregion
//#region node_modules/clsx/dist/clsx.mjs
function Br(e) {
	var t, n, r = "";
	if (typeof e == "string" || typeof e == "number") r += e;
	else if (typeof e == "object") {
		if (Array.isArray(e)) {
			var i = e.length;
			for (t = 0; t < i; t++) e[t] && (n = Br(e[t])) && (r && (r += " "), r += n);
		} else for (n in e) e[n] && (r && (r += " "), r += n);
	}
	return r;
}
function Vr() {
	for (var e, t, n = 0, r = "", i = arguments.length; n < i; n++) (e = arguments[n]) && (t = Br(e)) && (r && (r += " "), r += t);
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/shared/attributes.js
function Hr(e) {
	return typeof e == "object" ? Vr(e) : e ?? "";
}
var Ur = [..." 	\n\r\f\xA0\v﻿"];
function Wr(e, t, n) {
	var r = e == null ? "" : "" + e;
	if (t && (r = r ? r + " " + t : t), n) {
		for (var i of Object.keys(n)) if (n[i]) r = r ? r + " " + i : i;
		else if (r.length) for (var a = i.length, o = 0; (o = r.indexOf(i, o)) >= 0;) {
			var s = o + a;
			(o === 0 || Ur.includes(r[o - 1])) && (s === r.length || Ur.includes(r[s])) ? r = (o === 0 ? "" : r.substring(0, o)) + r.substring(s + 1) : o = s;
		}
	}
	return r === "" ? null : r;
}
function Gr(e, t = !1) {
	var n = t ? " !important;" : ";", r = "";
	for (var i of Object.keys(e)) {
		var a = e[i];
		a != null && a !== "" && (r += " " + i + ": " + a + n);
	}
	return r;
}
function Kr(e) {
	return e[0] !== "-" || e[1] !== "-" ? e.toLowerCase() : e;
}
function qr(e, t) {
	if (t) {
		var n = "", r, i;
		if (Array.isArray(t) ? (r = t[0], i = t[1]) : r = t, e) {
			e = String(e).replaceAll(/\s*\/\*.*?\*\/\s*/g, "").trim();
			var a = !1, o = 0, s = !1, c = [];
			r && c.push(...Object.keys(r).map(Kr)), i && c.push(...Object.keys(i).map(Kr));
			var l = 0, u = -1;
			let t = e.length;
			for (var d = 0; d < t; d++) {
				var f = e[d];
				if (s ? f === "/" && e[d - 1] === "*" && (s = !1) : a ? a === f && (a = !1) : f === "/" && e[d + 1] === "*" ? s = !0 : f === "\"" || f === "'" ? a = f : f === "(" ? o++ : f === ")" && o--, !s && a === !1 && o === 0) {
					if (f === ":" && u === -1) u = d;
					else if (f === ";" || d === t - 1) {
						if (u !== -1) {
							var p = Kr(e.substring(l, u).trim());
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
		return r && (n += Gr(r)), i && (n += Gr(i, !0)), n = n.trim(), n === "" ? null : n;
	}
	return e == null ? null : String(e);
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/class.js
function Jr(e, t, n, r, i, a) {
	var o = e[oe];
	if (O || o !== n || o === void 0) {
		var s = Wr(n, r, a);
		(!O || s !== e.getAttribute("class")) && (s == null ? e.removeAttribute("class") : t ? e.className = s : e.setAttribute("class", s)), e[oe] = n;
	} else if (a && i !== a) for (var c in a) {
		var l = !!a[c];
		(i == null || l !== !!i[c]) && e.classList.toggle(c, l);
	}
	return a;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/style.js
function Yr(e, t = {}, n, r) {
	for (var i in n) {
		var a = n[i];
		t[i] !== a && (n[i] == null ? e.style.removeProperty(i) : e.style.setProperty(i, a, r));
	}
}
function Xr(e, t, n, r) {
	var i = e[se];
	if (O || i !== t) {
		var a = qr(t, r);
		(!O || a !== e.getAttribute("style")) && (a == null ? e.removeAttribute("style") : e.style.cssText = a), e[se] = t;
	} else r && (Array.isArray(r) ? (Yr(e, n?.[0], r[0]), Yr(e, n?.[1], r[1], "important")) : Yr(e, n, r));
	return r;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function Zr(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return Oe();
		for (var i of t.options) i.selected = n.includes(ei(i));
		return;
	}
	for (i of t.options) if (Zt(ei(i), n)) {
		i.selected = !0;
		return;
	}
	(!r || n !== void 0) && (t.selectedIndex = -1);
}
function Qr(e) {
	var t = new MutationObserver(() => {
		"__value" in e && Zr(e, e.__value);
	});
	t.observe(e, {
		childList: !0,
		subtree: !0,
		attributes: !0,
		attributeFilter: ["value"]
	}), gn(() => {
		t.disconnect();
	});
}
function $r(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	at(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), ei);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && ei(o);
		}
		n(a), e.__value = a, P !== null && r.add(P);
	}), bn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = P;
			if (r.has(o)) return;
		}
		if (Zr(e, a, i), i && a === void 0) {
			var s = e.querySelector(":checked");
			s !== null && (a = ei(s), n(a));
		}
		e.__value = a, i = !1;
	}), Qr(e);
}
function ei(e) {
	return "__value" in e ? e.__value : e.value;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/attributes.js
var ti = Symbol("is custom element"), ni = Symbol("is html"), ri = de ? "link" : "LINK", ii = de ? "progress" : "PROGRESS";
function X(e) {
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
		e[le] = n, Ge(n), rt();
	}
}
function ai(e, t) {
	var n = si(e);
	n.value !== (n.value = t ?? void 0) && (e.value !== t || t === 0 && e.nodeName === ii) && (e.value = t ?? "");
}
function oi(e, t) {
	var n = si(e);
	n.checked !== (n.checked = t ?? void 0) && (e.checked = t);
}
function Z(e, t, n, r) {
	var i = si(e);
	O && (i[t] = e.getAttribute(t), t === "src" || t === "srcset" || t === "href" && e.nodeName === ri) || i[t] !== (i[t] = n) && (t === "loading" && (e[ie] = n), n == null ? e.removeAttribute(t) : typeof n != "string" && li(e).includes(t) ? e[t] = n : e.setAttribute(t, n));
}
function si(e) {
	return e[ae] ??= {
		[ti]: e.nodeName.includes("-"),
		[ni]: e.namespaceURI === Te
	};
}
var ci = /* @__PURE__ */ new Map();
function li(e) {
	var t = e.getAttribute("is") || e.nodeName, n = ci.get(t);
	if (n) return n;
	ci.set(t, n = []);
	for (var r, i = e, a = Element.prototype; a !== i;) {
		for (var s in r = o(i), r) r[s].set && s !== "innerHTML" && s !== "textContent" && s !== "innerText" && n.push(s);
		i = l(i);
	}
	return n;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function ui(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	at(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = fi(e) ? pi(a) : a, n(a), P !== null && r.add(P), await or(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (O && e.defaultValue !== e.value || lr(t) == null && e.value) && (n(fi(e) ? pi(e.value) : e.value), P !== null && r.add(P)), Sn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = P;
			if (r.has(i)) return;
		}
		fi(e) && n === pi(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function di(e, t, n = t) {
	at(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (O && e.defaultChecked !== e.checked || lr(t) == null) && n(e.checked), Sn(() => {
		e.checked = !!t();
	});
}
function fi(e) {
	var t = e.type;
	return t === "number" || t === "range";
}
function pi(e) {
	return e === "" ? null : +e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function mi(e, t) {
	return e === t || e?.[ne] === t;
}
function hi(e = {}, t, n, r) {
	var i = j.r, a = H;
	return bn(() => {
		var o, s;
		return Sn(() => {
			o = s, s = r?.() || [], lr(() => {
				mi(n(...s), e) || (t(e, ...s), o && mi(n(...o), e) && t(null, ...o));
			});
		}), () => {
			let r = a;
			for (; r !== i && r.parent !== null && r.parent.f & 33554432;) r = r.parent;
			let o = () => {
				s && mi(n(...s), e) && t(null, ...s);
			}, c = r.teardown;
			r.teardown = () => {
				o(), c?.();
			};
		};
	}), e;
}
//#endregion
//#region node_modules/svelte/src/internal/client/dom/elements/bindings/universal.js
function gi(e, t, n, r, i) {
	var a = () => {
		r(n[e]);
	};
	n.addEventListener(t, a), i ? Sn(() => {
		n[e] = i();
	}) : a(), (n === document.body || n === window || n === document) && gn(() => {
		n.removeEventListener(t, a);
	});
}
//#endregion
//#region node_modules/svelte/src/internal/client/reactivity/props.js
function _i(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ mt(r), U(u)) : (l && (l = !1, c = s ? lr(r) : r), c);
	let f;
	if (o) {
		var p = ne in e || re in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = et(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ye(t), f(m)));
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
	var v = !1, y = (n & 1 ? mt : _t)(() => (v = !1, g()));
	o && U(y);
	var b = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && o ? L(e) : e;
			return I(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Rn && v || b.f & 16384 ? y.v : U(y);
	});
}
function vi(e) {
	j === null && fe("onMount"), _n(() => {
		let t = lr(e);
		if (typeof t == "function") return t;
	});
}
//#endregion
//#region node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/islands/BrandVersion.svelte
var yi = /* @__PURE__ */ G("<span data-svelte-owned=\"brand-version\"> </span>");
function bi(e, t) {
	let n = _i(t, "version", 3, "v0.1.0");
	var r = yi(), i = R(r, !0);
	A(r), B(() => q(i, n())), K(e, r);
}
//#endregion
//#region src/islands/Icon.svelte
var xi = /* @__PURE__ */ G("<i></i>");
function Q(e, t) {
	let n = _i(t, "className", 3, "");
	var r = xi();
	B(() => {
		Z(r, "data-lucide", t.name), Jr(r, 1, Hr(n()));
	}), K(e, r);
}
//#endregion
//#region src/islands/ChatComposer.svelte
var Si = /* @__PURE__ */ G("<button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button>"), Ci = /* @__PURE__ */ G("<button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn; keep the Session open.\" aria-label=\"End current turn; keep the Session open.\"><!></button>"), wi = /* @__PURE__ */ G("<span class=\"tty-composer-divider\" aria-hidden=\"true\"></span> <span class=\"tty-composer-group\"><!> <button type=\"button\" id=\"agentCloseSessionButton\" class=\"tty-composer-action tty-close-session-button\"><!></button></span>", 1), Ti = /* @__PURE__ */ G("<button type=\"button\" id=\"agentActionsToggle\" class=\"tty-actions-toggle\" title=\"Session actions\" aria-label=\"Session actions\"><!></button>"), Ei = /* @__PURE__ */ G("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), Di = /* @__PURE__ */ G("<button type=\"button\" role=\"menuitem\"><span> </span><small> </small></button>"), Oi = /* @__PURE__ */ G("<div id=\"ttyAgentMenu\" class=\"tty-agent-menu\" role=\"menu\" aria-label=\"Choose an Agent\"></div>"), ki = /* @__PURE__ */ G("<div class=\"tty-session-actions collapsible open\"><div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div></div>"), Ai = /* @__PURE__ */ G("<form id=\"ttyForm\" class=\"tty-input\"><span>&gt;</span> <textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <span class=\"tty-composer-group\"><!> <button type=\"submit\" class=\"tty-send-button\"><!></button></span> <!> <!></form> <!> <!>", 1), ji = /* @__PURE__ */ G("<div class=\"external-resource-lock\">This resource is locked by an external session. New sessions and session input are unavailable until the lock is released; the Self-Driving switch remains available.</div>"), Mi = /* @__PURE__ */ G("<button type=\"button\" id=\"agentResumeButton\" class=\"tty-primary-action\" title=\"Resume Session\" aria-label=\"Resume Session\"><!><span>Resume Session</span></button>"), Ni = /* @__PURE__ */ G("<div class=\"tty-new-session-control\"><button type=\"button\" id=\"agentStartButton\" class=\"tty-new-session-button\" aria-haspopup=\"menu\" aria-controls=\"ttyAgentMenu\"><!><span> </span></button> <!></div>"), Pi = /* @__PURE__ */ G("<div class=\"tty-session-actions tty-standalone-actions open\" role=\"toolbar\" aria-label=\"Session actions\"><!> <!> <!></div>");
function Fi(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ F(L(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(-1), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(!1), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ F(!1), l = /* @__PURE__ */ F(void 0), u = /* @__PURE__ */ N(() => !!U(n).unavailableReason || U(o) || U(n).sending), d = /* @__PURE__ */ N(() => U(n).sessionStarting ? "Creating a new AgentHub session..." : U(n).agents.length ? "Choose an Agent to start a new session." : "No enabled agents are available. Configure an AgentHub Agent in Settings.");
	vi(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity === U(r) ? e.draftResetVersion !== U(i) && (I(i, e.draftResetVersion, !0), I(a, e.draft, !0), I(s, "")) : (I(r, e.identity, !0), I(i, e.draftResetVersion, !0), I(a, e.draft, !0), I(o, !1), I(s, ""), I(c, !1)), queueMicrotask(e.onIconsChanged);
	})), _n(() => {
		U(a), or().then(g);
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
		I(a, e, !0), I(s, ""), U(n).onDraft(e, f());
	}
	async function m(e) {
		e?.preventDefault();
		let t = U(a);
		if (U(u) || !t.trim() || !U(n).runId) return;
		let i = U(r), c = f();
		I(o, !0), I(s, "");
		try {
			let e = await U(n).onSend(t, c);
			U(r) === i && e.accepted && e.clear && U(a) === t && p("");
		} catch (e) {
			U(r) === i && I(s, e instanceof Error ? e.message : String(e), !0);
		} finally {
			U(r) === i && (I(o, !1), await or(), U(l)?.focus({ preventScroll: !0 }));
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
			U(c) || (e.preventDefault(), m());
		}
	}
	function g() {
		if (!U(l)) return;
		U(l).style.height = "auto";
		let e = Math.min(U(l).scrollHeight, 160);
		U(l).style.height = `${e}px`, U(l).style.overflowY = U(l).scrollHeight > 160 ? "auto" : "hidden";
	}
	var _ = wr(), v = sn(_), y = (e) => {
		var t = Ai(), r = sn(t), i = z(R(r), 2);
		tt(i), hi(i, (e) => I(l, e), () => U(l));
		var c = z(i, 2), f = R(c), g = (e) => {
			var t = Si();
			Q(R(t), { name: "plus" }), A(t), W("click", t, function(...e) {
				U(n).onOpenUpload?.apply(this, e);
			}), K(e, t);
		};
		J(f, (e) => {
			U(n).externalLocked || e(g);
		});
		var _ = z(f, 2), v = R(_);
		{
			let e = /* @__PURE__ */ N(() => U(o) ? "loader-circle" : "send");
			Q(v, { get name() {
				return U(e);
			} });
		}
		A(_), A(c);
		var y = z(c, 2), b = (e) => {
			var t = wi(), r = z(sn(t), 2), i = R(r), a = (e) => {
				var t = Ci(), r = R(t);
				{
					let e = /* @__PURE__ */ N(() => U(n).endingTurn ? "loader-circle" : "pause");
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
			var o = z(i, 2), s = R(o);
			{
				let e = /* @__PURE__ */ N(() => U(n).closingSession ? "loader-circle" : "square");
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
			var t = Ti();
			Q(R(t), { name: "ellipsis" }), A(t), B(() => Z(t, "aria-expanded", U(n).actionsOpen)), W("click", t, function(...e) {
				U(n).onToggleActions?.apply(this, e);
			}), K(e, t);
		};
		J(x, (e) => {
			U(n).internalLocked || e(S);
		}), A(r);
		var C = z(r, 2), w = (e) => {
			var t = Ei(), n = R(t), r = R(n, !0);
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
			var t = ki(), r = R(t), i = R(r), a = R(i);
			{
				let e = /* @__PURE__ */ N(() => U(n).sessionStarting ? "loader-circle" : "plus");
				Q(a, { get name() {
					return U(e);
				} });
			}
			var o = z(a), s = R(o, !0);
			A(o), A(i);
			var c = z(i, 2), l = (e) => {
				var t = Oi();
				Y(t, 21, () => U(n).agents, (e) => e.id, (e, t) => {
					var r = Di();
					let i;
					var a = R(r), o = R(a, !0);
					A(a);
					var s = z(a), c = R(s, !0);
					A(s), A(r), B(() => {
						Z(r, "data-agent-choice", U(t).id), i = Jr(r, 1, "", null, i, { active: U(t).id === U(n).selectedAgentId }), q(o, U(t).label), q(c, U(t).summary);
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
			Z(i, "data-agent-draft-key", U(n).draftKey), Z(i, "placeholder", U(n).unavailableReason || "Send input to the selected agent session"), i.disabled = U(u), ai(i, U(a)), Z(_, "title", U(o) ? "Sending..." : U(n).unavailableReason || "Send input"), Z(_, "aria-label", U(o) ? "Sending..." : U(n).unavailableReason || "Send input"), _.disabled = U(u);
		}), gr("submit", r, m), W("input", i, (e) => p(e.currentTarget.value)), W("keydown", i, h), K(e, t);
	}, b = (e) => {
		var t = Pi(), r = R(t), i = (e) => {
			K(e, ji());
		};
		J(r, (e) => {
			U(n).externalLocked && e(i);
		});
		var a = z(r, 2), o = (e) => {
			var t = Mi();
			Q(R(t), { name: "rotate-ccw" }), Ne(), A(t), W("click", t, function(...e) {
				U(n).onResume?.apply(this, e);
			}), K(e, t);
		};
		J(a, (e) => {
			U(n).canResume && e(o);
		});
		var s = z(a, 2), c = (e) => {
			var t = Ni(), r = R(t), i = R(r);
			{
				let e = /* @__PURE__ */ N(() => U(n).sessionStarting ? "loader-circle" : "plus");
				Q(i, { get name() {
					return U(e);
				} });
			}
			var a = z(i), o = R(a, !0);
			A(a), A(r);
			var s = z(r, 2), c = (e) => {
				var t = Oi();
				Y(t, 21, () => U(n).agents, (e) => e.id, (e, t) => {
					var r = Di();
					let i;
					var a = R(r), o = R(a, !0);
					A(a);
					var s = z(a), c = R(s, !0);
					A(s), A(r), B(() => {
						Z(r, "data-agent-choice", U(t).id), i = Jr(r, 1, "", null, i, { active: U(t).id === U(n).selectedAgentId }), q(o, U(t).label), q(c, U(t).summary);
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
	}), K(e, _), Ve();
}
_r([
	"input",
	"keydown",
	"click"
]);
//#endregion
//#region src/islands/CreateDialog.svelte
var Ii = /* @__PURE__ */ G("<span> </span>"), Li = /* @__PURE__ */ G("<option> </option>"), Ri = /* @__PURE__ */ G("<label><span>Template</span> <select name=\"templateName\"><option>Blank task</option><!></select></label>"), zi = /* @__PURE__ */ G("<p class=\"template-description\"> </p>"), Bi = /* @__PURE__ */ G("<div class=\"create-dialog-tabs\" role=\"tablist\" aria-label=\"Task content\"><button type=\"button\" role=\"tab\">Edit</button> <button type=\"button\" role=\"tab\">Preview</button></div>"), Vi = /* @__PURE__ */ G("<small> </small>"), Hi = /* @__PURE__ */ G("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), Ui = /* @__PURE__ */ G("<p class=\"create-task-preview-hint\">Fields changed since this preview was rendered. Refresh to update.</p>"), Wi = /* @__PURE__ */ G("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), Gi = /* @__PURE__ */ G("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), Ki = /* @__PURE__ */ G("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <small> </small></section>"), qi = /* @__PURE__ */ G("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), Ji = /* @__PURE__ */ G("<div class=\"create-task-preview-pane\" role=\"tabpanel\" aria-label=\"Task preview\"><div class=\"template-preview-actions\"><button type=\"button\" class=\"secondary compact\"> </button> <!></div> <!> <!> <!></div>"), Yi = /* @__PURE__ */ G("<small>(generated by template)</small>"), Xi = /* @__PURE__ */ G("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), Zi = /* @__PURE__ */ G("<input type=\"checkbox\"/><span> </span>", 1), Qi = /* @__PURE__ */ G("<textarea></textarea>"), $i = /* @__PURE__ */ G("<select><option>Select...</option><!></select>"), ea = /* @__PURE__ */ G("<input/>"), ta = /* @__PURE__ */ G("<label><!> <!> <!> <!> <!></label>"), na = /* @__PURE__ */ G("<div class=\"template-fields\" aria-label=\"Required template fields\"></div>"), ra = /* @__PURE__ */ G("<textarea name=\"detail\" placeholder=\"Task detail\"></textarea>"), ia = /* @__PURE__ */ G("<div class=\"template-fields\" aria-label=\"Optional template fields\"></div>"), aa = /* @__PURE__ */ G("<div class=\"create-task-automation-fields\"><label><span>Agent <small>(optional)</small></span><select name=\"agentName\"><option>Workspace default</option><!></select></label> <label><span>Run instructions</span><textarea name=\"prompt\" placeholder=\"Instructions for the automated run\"></textarea></label> <label><span>Preferred Agent Profiles</span><input name=\"agentProfiles\" placeholder=\"Workspace default, or kimi, codex\"/><small> </small></label> <label><span>Completion criteria</span><textarea name=\"completionCriteria\" placeholder=\"Natural-language completion criteria\"></textarea></label></div>"), oa = /* @__PURE__ */ G("<div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span><input name=\"slug\" placeholder=\"optional-slug\"/></label></div> <!> <details class=\"create-task-more-options\"><summary> </summary> <div class=\"create-task-more-options-body\"><!> <label class=\"create-task-automation-toggle\"><input name=\"selfDriving\" type=\"checkbox\"/><span><strong>Enable Self-Driving</strong><small>Persist the Task-level desired state and let the Scheduler reconcile one autonomous Turn at a time.</small></span></label> <!></div></details>", 1), sa = /* @__PURE__ */ G("<div class=\"create-task-dialog-body\"><!> <!> <!> <!></div>"), ca = /* @__PURE__ */ G("<textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/>", 1), la = /* @__PURE__ */ G("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function ua(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ F(L(t.channel.current())), r = /* @__PURE__ */ F(L(m(U(n).draft))), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(!1), o = /* @__PURE__ */ N(() => U(r).type === "task"), s = /* @__PURE__ */ N(() => U(n).templates.find((e) => e.name === U(r).templateName)), c = /* @__PURE__ */ N(() => U(n).preview?.title || ""), l = /* @__PURE__ */ N(() => U(r).titleOverride ? U(r).title : U(c)), u = /* @__PURE__ */ N(() => (U(s)?.fields || []).filter((e) => e.required)), d = /* @__PURE__ */ N(() => (U(s)?.fields || []).filter((e) => !e.required)), f = /* @__PURE__ */ N(() => U(r).editedMarkdown != null && !!U(n).preview && U(r).editedMarkdown !== U(n).preview?.markdown), p = /* @__PURE__ */ N(() => !U(n).preview || U(n).previewKey !== U(n).previewRequestKey(U(r)));
	vi(() => t.channel.subscribe((e) => {
		let t = U(n).preview;
		I(n, e, !0), e.identity === U(i) ? e.preview && e.preview !== t && U(r).editedMarkdown == null && (U(r).editedMarkdown = e.preview.markdown) : (I(i, e.identity, !0), I(r, m(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), vi(() => {
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
			I(a, !0), await or(), I(a, !1);
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
	var C = wr(), w = sn(C), T = (e) => {
		var t = la(), i = R(t), a = z(i, 2);
		let c;
		var m = R(a), h = R(m), C = R(h), w = R(C, !0);
		A(C);
		var T = z(C, 2), E = (e) => {
			var t = Ii(), n = R(t, !0);
			A(t), B(() => q(n, U(r).projectId)), K(e, t);
		};
		J(T, (e) => {
			U(o) && e(E);
		}), A(h);
		var ee = z(h, 2);
		Q(R(ee), { name: "x" }), A(ee), A(m);
		var te = z(m, 2), ne = R(te), re = (e) => {
			var t = sa(), i = R(t), a = (e) => {
				var t = Ri(), i = z(R(t), 2), a = R(i);
				a.value = a.__value = "", Y(z(a), 17, () => U(n).templates, (e) => e.name, (e, t) => {
					var n = Li(), r = R(n, !0);
					A(n);
					var i = {};
					B((e) => {
						n.disabled = !U(t).valid, q(r, e), i !== (i = U(t).name) && (n.value = (n.__value = U(t).name) ?? "");
					}, [() => S(U(t))]), K(e, n);
				}), A(i);
				var o;
				Qr(i), A(t), B(() => {
					o !== (o = U(r).templateName) && (i.value = (i.__value = U(r).templateName) ?? "", Zr(i, U(r).templateName));
				}), W("change", i, g), K(e, t);
			};
			J(i, (e) => {
				U(n).templates.length && e(a);
			});
			var o = z(i, 2), c = (e) => {
				var t = zi(), n = R(t, !0);
				A(t), B(() => q(n, U(s).description)), K(e, t);
			};
			J(o, (e) => {
				U(s)?.description && e(c);
			});
			var m = z(o, 2), h = (e) => {
				var t = Bi(), n = R(t);
				let i;
				var a = z(n, 2);
				let o;
				A(t), B(() => {
					i = Jr(n, 1, "create-dialog-tab", null, i, { active: U(r).activeTab === "edit" }), Z(n, "aria-selected", U(r).activeTab === "edit"), o = Jr(a, 1, "create-dialog-tab", null, o, { active: U(r).activeTab === "preview" }), Z(a, "aria-selected", U(r).activeTab === "preview");
				}), W("click", n, () => v("edit")), W("click", a, () => v("preview")), K(e, t);
			};
			J(m, (e) => {
				U(s) && e(h);
			});
			var y = z(m, 2), C = (e) => {
				var t = Ji(), i = R(t), a = R(i), o = R(a, !0);
				A(a);
				var s = z(a, 2), c = (e) => {
					var t = Vi(), i = R(t);
					A(t), B(() => q(i, `Template ${U(r).templateName ?? ""} · ${U(n).templateDigest ?? ""}`)), K(e, t);
				};
				J(s, (e) => {
					U(n).templateDigest && e(c);
				}), A(i);
				var l = z(i, 2), u = (e) => {
					var t = Hi(), r = R(t, !0);
					A(t), B(() => q(r, U(n).previewError)), K(e, t);
				};
				J(l, (e) => {
					U(n).previewError && e(u);
				});
				var d = z(l, 2), m = (e) => {
					K(e, Ui());
				};
				J(d, (e) => {
					!U(n).previewError && U(p) && U(n).preview && e(m);
				});
				var h = z(d, 2), g = (e) => {
					var t = Ki(), i = R(t), a = R(i, !0);
					A(i);
					var o = z(i, 2);
					tt(o);
					var s = z(o, 2), c = (e) => {
						var t = Wi(), i = z(R(t), 2);
						A(t), W("click", i, () => U(r).editedMarkdown = U(n).preview?.markdown ?? null), K(e, t);
					}, l = (e) => {
						K(e, Gi());
					};
					J(s, (e) => {
						U(f) ? e(c) : e(l, -1);
					});
					var u = z(s, 2), d = (e) => {
						var t = Vi(), r = R(t);
						A(t), B(() => q(r, `Slug: ${U(n).preview.slug ?? ""}`)), K(e, t);
					};
					J(u, (e) => {
						U(n).preview.slug && e(d);
					});
					var p = z(u, 2), m = R(p);
					A(p), A(t), B(() => {
						q(a, U(n).preview.title), q(m, `Self-Driving: ${U(n).preview.selfDriving ? `on with ${U(n).preview.selfDriving.agentName || "workspace default"}` : "off"}`);
					}), ui(o, () => U(r).editedMarkdown, (e) => U(r).editedMarkdown = e), K(e, t);
				}, _ = (e) => {
					K(e, qi());
				};
				J(h, (e) => {
					U(n).preview ? e(g) : U(n).previewing && e(_, 1);
				}), A(t), B(() => {
					a.disabled = U(n).previewing || U(n).submitting, q(o, U(n).previewing ? "Rendering..." : "Refresh");
				}), W("click", a, b), K(e, t);
			}, w = (e) => {
				var t = oa(), i = sn(t), a = R(i), o = R(a), c = z(R(o)), f = (e) => {
					K(e, Yi());
				};
				J(c, (e) => {
					U(s)?.taskTitle && !U(r).titleOverride && e(f);
				}), A(o);
				var p = z(o, 2), m = R(p);
				X(m);
				var h = z(m, 2), g = (e) => {
					var t = Xi();
					W("click", t, () => {
						U(r).title = "", U(r).titleOverride = !1;
					}), K(e, t);
				};
				J(h, (e) => {
					U(s)?.taskTitle && U(r).titleOverride && e(g);
				}), A(p), A(a);
				var v = z(a, 2), y = z(R(v));
				X(y), A(v), A(i);
				var b = z(i, 2), S = (e) => {
					var t = wr(), n = sn(t), i = (e) => {
						var t = na();
						Y(t, 21, () => U(u), (e) => e.name, (e, t) => {
							var n = ta();
							let i;
							var a = R(n), o = (e) => {
								var n = Zi(), i = sn(n);
								X(i);
								var a = z(i), o = R(a, !0);
								A(a), B(() => {
									oi(i, U(r).templateFields[U(t).name] === !0), q(o, U(t).label);
								}), W("change", i, (e) => _(U(t), e)), K(e, n);
							}, s = (e) => {
								var n = Ii(), r = R(n);
								A(n), B(() => q(r, `${U(t).label ?? ""}${U(t).required ? " *" : ""}`)), K(e, n);
							};
							J(a, (e) => {
								U(t).type === "boolean" ? e(o) : e(s, -1);
							});
							var c = z(a, 2), l = (e) => {
								var n = Qi();
								tt(n), B((e) => {
									n.required = U(t).required, Z(n, "placeholder", U(t).placeholder || ""), ai(n, e);
								}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("input", n, (e) => _(U(t), e)), K(e, n);
							};
							J(c, (e) => {
								U(t).type === "textarea" && e(l);
							});
							var u = z(c, 2), d = (e) => {
								var n = $i(), i = R(n);
								i.value = i.__value = "", Y(z(i), 17, () => U(t).options || [], jr, (e, t) => {
									var n = Li(), r = R(n, !0);
									A(n);
									var i = {};
									B(() => {
										q(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
									}), K(e, n);
								}), A(n);
								var a;
								Qr(n), B((e) => {
									n.required = U(t).required, a !== (a = e) && (n.value = (n.__value = e) ?? "", Zr(n, e));
								}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("change", n, (e) => _(U(t), e)), K(e, n);
							};
							J(u, (e) => {
								U(t).type === "select" && e(d);
							});
							var f = z(u, 2), p = (e) => {
								var n = ea();
								X(n), B((e) => {
									n.required = U(t).required, Z(n, "placeholder", U(t).placeholder || ""), ai(n, e);
								}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("input", n, (e) => _(U(t), e)), K(e, n);
							};
							J(f, (e) => {
								U(t).type === "text" && e(p);
							});
							var m = z(f, 2), h = (e) => {
								var n = Vi(), r = R(n, !0);
								A(n), B(() => q(r, U(t).description)), K(e, n);
							};
							J(m, (e) => {
								U(t).description && e(h);
							}), A(n), B(() => i = Jr(n, 1, "", null, i, { "template-boolean": U(t).type === "boolean" })), K(e, n);
						}), A(t), K(e, t);
					};
					J(n, (e) => {
						U(u).length && e(i);
					}), K(e, t);
				}, C = (e) => {
					var t = ra();
					tt(t), ui(t, () => U(r).detail, (e) => U(r).detail = e), K(e, t);
				};
				J(b, (e) => {
					U(s) ? e(S) : e(C, -1);
				});
				var w = z(b, 2), T = R(w), E = R(T);
				A(T);
				var ee = z(T, 2), te = R(ee), ne = (e) => {
					var t = ia();
					Y(t, 21, () => U(d), (e) => e.name, (e, t) => {
						var n = ta();
						let i;
						var a = R(n), o = (e) => {
							var n = Zi(), i = sn(n);
							X(i);
							var a = z(i), o = R(a, !0);
							A(a), B(() => {
								oi(i, U(r).templateFields[U(t).name] === !0), q(o, U(t).label);
							}), W("change", i, (e) => _(U(t), e)), K(e, n);
						}, s = (e) => {
							var n = Ii(), r = R(n, !0);
							A(n), B(() => q(r, U(t).label)), K(e, n);
						};
						J(a, (e) => {
							U(t).type === "boolean" ? e(o) : e(s, -1);
						});
						var c = z(a, 2), l = (e) => {
							var n = Qi();
							tt(n), B((e) => {
								Z(n, "placeholder", U(t).placeholder || ""), ai(n, e);
							}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("input", n, (e) => _(U(t), e)), K(e, n);
						};
						J(c, (e) => {
							U(t).type === "textarea" && e(l);
						});
						var u = z(c, 2), d = (e) => {
							var n = $i(), i = R(n);
							i.value = i.__value = "", Y(z(i), 17, () => U(t).options || [], jr, (e, t) => {
								var n = Li(), r = R(n, !0);
								A(n);
								var i = {};
								B(() => {
									q(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
								}), K(e, n);
							}), A(n);
							var a;
							Qr(n), B((e) => {
								a !== (a = e) && (n.value = (n.__value = e) ?? "", Zr(n, e));
							}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("change", n, (e) => _(U(t), e)), K(e, n);
						};
						J(u, (e) => {
							U(t).type === "select" && e(d);
						});
						var f = z(u, 2), p = (e) => {
							var n = ea();
							X(n), B((e) => {
								Z(n, "placeholder", U(t).placeholder || ""), ai(n, e);
							}, [() => String(U(r).templateFields[U(t).name] ?? "")]), W("input", n, (e) => _(U(t), e)), K(e, n);
						};
						J(f, (e) => {
							U(t).type === "text" && e(p);
						});
						var m = z(f, 2), h = (e) => {
							var n = Vi(), r = R(n, !0);
							A(n), B(() => q(r, U(t).description)), K(e, n);
						};
						J(m, (e) => {
							U(t).description && e(h);
						}), A(n), B(() => i = Jr(n, 1, "", null, i, { "template-boolean": U(t).type === "boolean" })), K(e, n);
					}), A(t), K(e, t);
				};
				J(te, (e) => {
					U(d).length && e(ne);
				});
				var re = z(te, 2), ie = R(re);
				X(ie), Ne(), A(re);
				var ae = z(re, 2), oe = (e) => {
					var t = aa(), i = R(t), a = z(R(i)), o = R(a);
					o.value = o.__value = "", Y(z(o), 17, () => U(n).agents, (e) => e.id, (e, t) => {
						var n = Li(), r = R(n);
						A(n);
						var i = {};
						B(() => {
							q(r, `${U(t).label ?? ""} — ${U(t).summary ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
						}), K(e, n);
					}), A(a), A(i);
					var s = z(i, 2), c = z(R(s));
					tt(c), A(s);
					var l = z(s, 2), u = z(R(l));
					X(u);
					var d = z(u), f = R(d, !0);
					A(d), A(l);
					var p = z(l, 2), m = z(R(p));
					tt(m), A(p), A(t), B((e) => q(f, e), [() => U(n).profileKeys.length ? `Available: ${U(n).profileKeys.join(", ")}` : "No Profiles configured; the workspace default will be used."]), $r(a, () => U(r).agentName, (e) => U(r).agentName = e), ui(c, () => U(r).prompt, (e) => U(r).prompt = e), ui(u, () => U(r).agentProfiles, (e) => U(r).agentProfiles = e), ui(m, () => U(r).completionCriteria, (e) => U(r).completionCriteria = e), K(e, t);
				};
				J(ae, (e) => {
					U(r).selfDriving && e(oe);
				}), A(ee), A(w), B(() => {
					m.required = !U(s)?.taskTitle, ai(m, U(s)?.taskTitle ? U(l) : U(r).title), Z(m, "placeholder", U(s)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), q(E, `More options${U(r).selfDriving ? " · Self-Driving on" : ""}`);
				}), W("input", m, x), ui(y, () => U(r).slug, (e) => U(r).slug = e), di(ie, () => U(r).selfDriving, (e) => U(r).selfDriving = e), gi("open", "toggle", w, (e) => U(r).showOptions = e, () => U(r).showOptions), K(e, t);
			};
			J(y, (e) => {
				U(s) && U(r).activeTab === "preview" ? e(C) : e(w, -1);
			}), A(t), K(e, t);
		}, ie = (e) => {
			var t = ca(), n = sn(t);
			tt(n);
			var i = z(n, 2);
			X(i), ui(n, () => U(r).description, (e) => U(r).description = e), ui(i, () => U(r).slug, (e) => U(r).slug = e), K(e, t);
		};
		J(ne, (e) => {
			U(o) ? e(re) : e(ie, -1);
		});
		var ae = z(ne, 2), oe = R(ae), se = R(oe, !0);
		A(oe);
		var ce = z(oe, 2);
		A(ae), A(te), A(a), A(t), B(() => {
			c = Jr(a, 1, "create-dialog modal-enter", null, c, { "create-task-dialog": U(o) }), Z(a, "aria-label", U(o) ? "Create task" : "Create project"), q(w, U(o) ? "Create task" : "Create project"), ee.disabled = U(n).submitting, oe.disabled = U(n).submitting, q(se, U(n).submitting ? "Creating..." : "Create"), ce.disabled = U(n).submitting;
		}), W("click", i, function(...e) {
			U(n).onClose?.apply(this, e);
		}), W("click", ee, function(...e) {
			U(n).onClose?.apply(this, e);
		}), gr("submit", te, y), W("click", ce, function(...e) {
			U(n).onClose?.apply(this, e);
		}), K(e, t);
	};
	J(w, (e) => {
		U(n).open && e(T);
	}), K(e, C), Ve();
}
_r([
	"click",
	"change",
	"input"
]);
//#endregion
//#region src/islands/SelfDrivingDialog.svelte
var da = /* @__PURE__ */ G("<input name=\"agentName\" readonly=\"\" aria-readonly=\"true\"/>"), fa = /* @__PURE__ */ G("<option> </option>"), pa = /* @__PURE__ */ G("<select name=\"agentName\" required=\"\"><option>Select an Agent</option><!></select>"), ma = /* @__PURE__ */ G("<p class=\"self-driving-dialog-error\" role=\"alert\"> </p>"), ha = /* @__PURE__ */ G("<p class=\"self-driving-dialog-error\" role=\"alert\">The result may be unknown. Refresh the task and session state before trying again.</p>"), ga = /* @__PURE__ */ G("<div class=\"self-driving-dialog-layer\" role=\"presentation\"><button class=\"self-driving-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"self-driving-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"selfDrivingDialogTitle\"><header class=\"self-driving-dialog-header\"><strong id=\"selfDrivingDialogTitle\">Configure Self-Driving</strong> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"selfDrivingConfigForm\" class=\"details-form self-driving-dialog-form\"><label><span>Agent</span> <!></label> <label><span>Run instructions <small>(optional)</small></span> <textarea name=\"runInstructions\" rows=\"4\" placeholder=\"Additional Self-Driving instructions\"></textarea></label> <!> <!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function _a(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ F(L(t.channel.current())), r = /* @__PURE__ */ F(L({ ...U(n).draft })), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(void 0), s = /* @__PURE__ */ N(() => U(n).submitting || U(n).unknown || !U(n).reuseCurrentSession && (!U(r).agentName || U(n).agents.length === 0));
	vi(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity !== U(i) && (I(i, e.identity, !0), I(r, { ...e.draft }, !0), I(a, "")), queueMicrotask(e.onIconsChanged);
	})), vi(() => {
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
				I(a, "Select an Agent before enabling Self-Driving.");
				return;
			}
			I(a, ""), await U(n).onSubmit({ ...U(r) });
		}
	}
	var l = wr(), u = sn(l), d = (e) => {
		var t = ga(), i = R(t), l = z(i, 2), u = R(l), d = z(R(u), 2);
		Q(R(d), { name: "x" }), A(d), A(u);
		var f = z(u, 2), p = R(f), m = z(R(p), 2), h = (e) => {
			var t = da();
			X(t), ui(t, () => U(r).agentName, (e) => U(r).agentName = e), K(e, t);
		}, g = (e) => {
			var t = pa(), i = R(t);
			i.value = i.__value = "", Y(z(i), 17, () => U(n).agents, (e) => e.id, (e, t) => {
				var n = fa(), r = R(n);
				A(n);
				var i = {};
				B(() => {
					q(r, `${U(t).label ?? ""} — ${U(t).summary ?? ""}`), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
				}), K(e, n);
			}), A(t), B(() => t.disabled = U(n).agents.length === 0 || U(n).submitting), W("input", t, () => I(a, "")), $r(t, () => U(r).agentName, (e) => U(r).agentName = e), K(e, t);
		};
		J(m, (e) => {
			U(n).reuseCurrentSession ? e(h) : e(g, -1);
		}), A(p);
		var _ = z(p, 2), v = z(R(_), 2);
		tt(v), A(_);
		var y = z(_, 2), b = (e) => {
			var t = ma(), r = R(t, !0);
			A(t), B(() => q(r, U(a) || U(n).error)), K(e, t);
		};
		J(y, (e) => {
			(U(a) || U(n).error) && e(b);
		});
		var x = z(y, 2), S = (e) => {
			K(e, ha());
		};
		J(x, (e) => {
			U(n).unknown && e(S);
		});
		var C = z(x, 2), w = R(C), T = R(w, !0);
		A(w);
		var E = z(w, 2);
		A(C), A(f), A(l), hi(l, (e) => I(o, e), () => U(o)), A(t), B(() => {
			d.disabled = U(n).submitting, v.disabled = U(n).submitting, w.disabled = U(s), Z(w, "aria-busy", U(n).submitting), q(T, U(n).submitting ? "Enabling…" : "Save and Enable"), E.disabled = U(n).submitting;
		}), W("click", i, function(...e) {
			U(n).onClose?.apply(this, e);
		}), W("click", d, function(...e) {
			U(n).onClose?.apply(this, e);
		}), gr("submit", f, c), W("input", v, () => I(a, "")), ui(v, () => U(r).runInstructions, (e) => U(r).runInstructions = e), W("click", E, function(...e) {
			U(n).onClose?.apply(this, e);
		}), K(e, t);
	};
	J(u, (e) => {
		U(n).open && e(d);
	}), K(e, l), Ve();
}
_r(["click", "input"]);
//#endregion
//#region src/islands/SettingsModal.svelte
var va = /* @__PURE__ */ G("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), ya = /* @__PURE__ */ G("<button type=\"button\"><!><span> </span><!></button>"), ba = /* @__PURE__ */ G("<span class=\"settings-pill\">Active</span>"), xa = /* @__PURE__ */ G("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), Sa = /* @__PURE__ */ G("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), Ca = /* @__PURE__ */ G("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span><span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/><span> </span><!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), wa = /* @__PURE__ */ G("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), Ta = /* @__PURE__ */ G("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Workspaces</h2><p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/><span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>"), Ea = /* @__PURE__ */ G("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span><input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/><small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>"), Da = /* @__PURE__ */ G("<span class=\"settings-pill\"> </span>"), Oa = /* @__PURE__ */ G("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), ka = /* @__PURE__ */ G("<div class=\"settings-empty\">No AgentHub agents available.</div>"), Aa = /* @__PURE__ */ G("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>"), ja = /* @__PURE__ */ G("<option> </option>"), Ma = /* @__PURE__ */ G("<span class=\"settings-profile-system-label\">System</span>"), Na = /* @__PURE__ */ G("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), Pa = /* @__PURE__ */ G("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), Fa = /* @__PURE__ */ G("<div class=\"settings-panel settings-agent-panel\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map chat and Self-Driving preferences to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>"), Ia = /* @__PURE__ */ G("<small class=\"settings-notification-help\"> </small>"), La = /* @__PURE__ */ G("<div class=\"settings-panel\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span><input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span><input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>"), Ra = /* @__PURE__ */ G("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><aside class=\"settings-tabs\"><div class=\"settings-title\">System Settings</div> <!></aside> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function za(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ F(L(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(-1), a = /* @__PURE__ */ F(L(l(U(n)))), o = /* @__PURE__ */ F(""), s = /* @__PURE__ */ F(""), c = /* @__PURE__ */ new Set([
		"default",
		"fast",
		"reasoning",
		"scheduler"
	]);
	vi(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity === U(r) ? e.dataVersion !== U(i) && !U(a).dirty && (I(i, e.dataVersion, !0), I(a, l(e), !0)) : (I(r, e.identity, !0), I(i, e.dataVersion, !0), I(a, l(e), !0), I(o, ""), I(s, "")), queueMicrotask(e.onIconsChanged);
	})), vi(() => {
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
			I(o, "workspace");
			try {
				await U(n).onAddWorkspace(u()), U(a).workspacePath = "", U(a).createWorkspace = !1;
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				I(o, "");
			}
		}
	}
	async function p(e) {
		if (!U(o)) {
			I(o, `remove:${e}`);
			try {
				await U(n).onRemoveWorkspace(e, u());
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				I(o, "");
			}
		}
	}
	async function m(e, t) {
		if (!U(o)) {
			I(o, `icon:${e}`), I(s, "");
			try {
				await U(n).onWorkspaceIcon(e, t, u());
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				I(o, "");
			}
		}
	}
	async function h(e) {
		if (e.preventDefault(), !U(o)) {
			I(o, "user");
			try {
				U(a).userName = await U(n).onSaveUser(U(a).userName);
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				I(o, "");
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
			I(o, "agenthub");
			try {
				await U(n).onSaveAgentHub(u()), U(a).dirty = !1;
			} catch (e) {
				U(n).onToast(S(e));
			} finally {
				I(o, "");
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
	var C = wr(), w = sn(C), T = (e) => {
		var t = Ra(), r = sn(t), i = z(r, 2), l = R(i);
		Y(z(R(l), 2), 16, () => [
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
		], jr, (e, t) => {
			var n = ya();
			let r;
			var i = R(n);
			Q(i, { get name() {
				return t[1];
			} });
			var o = z(i), s = R(o, !0);
			A(o);
			var c = z(o), l = (e) => {
				K(e, va());
			};
			J(c, (e) => {
				(t[0] === "agenthub" || t[0] === "profiles") && e(l);
			}), A(n), B(() => {
				r = Jr(n, 1, "settings-tab", null, r, {
					active: U(a).tab === t[0],
					dirty: U(a).dirty && (t[0] === "agenthub" || t[0] === "profiles")
				}), q(s, t[2]);
			}), W("click", n, () => U(a).tab = t[0]), K(e, n);
		}), A(l);
		var u = z(l, 2), S = R(u);
		Q(R(S), { name: "x" }), A(S);
		var C = z(S, 2), w = (e) => {
			var t = Ta(), r = z(R(t), 2), i = R(r);
			X(i);
			var c = z(i, 2), l = R(c);
			X(l), Ne(), A(c);
			var u = z(c, 2), d = R(u);
			Q(d, { name: "plus" });
			var h = z(d), g = R(h, !0);
			A(h), A(u), A(r);
			var _ = z(r, 2);
			Y(_, 21, () => U(n).workspaces, (e) => e.id, (e, t) => {
				let r = /* @__PURE__ */ N(() => b(U(t).id));
				var i = Ca(), a = R(i), c = R(a), l = R(c), u = R(l);
				A(l);
				var d = z(l), f = R(d), h = R(f, !0);
				A(f);
				var g = z(f), _ = R(g, !0);
				A(g), A(d), A(c);
				var v = z(c, 2), y = R(v), x = (e) => {
					K(e, ba());
				};
				J(y, (e) => {
					U(t).id === U(n).activeWorkspaceId && e(x);
				});
				var S = z(y, 2), C = R(S), w = z(C), T = R(w, !0);
				A(w), Q(z(w), { name: "chevron-down" }), A(S);
				var E = z(S, 2);
				Q(R(E), { name: "trash-2" }), A(E), A(v), A(a);
				var ee = z(a, 2), te = (e) => {
					var i = Sa();
					Y(i, 21, () => U(n).workspaceIcons, (e) => e.id, (e, n) => {
						var i = xa();
						let a;
						var o = R(i), s = z(o), c = R(s, !0);
						A(s);
						var l = z(s), u = (e) => {
							Q(e, { name: "check" });
						};
						J(l, (e) => {
							U(n).id === U(r).id && e(u);
						}), A(i), B(() => {
							Z(i, "aria-checked", U(n).id === U(r).id), Z(i, "title", U(n).label), a = Jr(i, 1, "", null, a, { selected: U(n).id === U(r).id }), Z(o, "src", U(n).src), q(c, U(n).label);
						}), W("click", i, () => m(U(t).id, U(n).id)), K(e, i);
					}), A(i), B(() => Z(i, "aria-label", `Icon for ${U(t).name}`)), K(e, i);
				};
				J(ee, (e) => {
					U(s) === U(t).id && e(te);
				}), A(i), B((e, n) => {
					Z(u, "src", U(r).src), q(h, U(t).name), q(_, U(t).path), Z(S, "aria-expanded", U(s) === U(t).id), S.disabled = e, Z(C, "src", U(r).src), q(T, U(o) === `icon:${U(t).id}` ? "Saving..." : U(r).label), E.disabled = n;
				}, [() => !!U(o), () => !!U(o)]), W("click", S, () => I(s, U(s) === U(t).id ? "" : U(t).id, !0)), W("click", E, () => p(U(t).id)), K(e, i);
			}, (e) => {
				K(e, wa());
			}), A(_), A(t), B((e) => {
				u.disabled = e, q(g, U(a).createWorkspace ? "Create" : "Add");
			}, [() => !!U(o)]), gr("submit", r, f), ui(i, () => U(a).workspacePath, (e) => U(a).workspacePath = e), di(l, () => U(a).createWorkspace, (e) => U(a).createWorkspace = e), K(e, t);
		}, T = (e) => {
			var t = Ea(), n = z(R(t), 2), r = R(n), i = z(R(r));
			X(i), Ne(), A(r);
			var s = z(r, 2), c = R(s);
			Q(R(c), { name: "save" }), Ne(), A(c), A(s), A(n), A(t), B(() => c.disabled = U(o) === "user"), gr("submit", n, h), ui(i, () => U(a).userName, (e) => U(a).userName = e), K(e, t);
		}, E = (e) => {
			var t = Aa(), r = z(R(t), 2), i = R(r), s = z(R(i)), c = R(s, !0);
			A(s), A(i);
			var l = z(i, 2), u = z(R(l));
			X(u), A(l);
			var f = z(l, 2), p = R(f, !0);
			A(f);
			var m = z(f, 2);
			Y(m, 21, () => U(n).agentHub.capabilities, jr, (e, t) => {
				var n = Da(), r = R(n, !0);
				A(n), B(() => q(r, U(t))), K(e, n);
			}), A(m), A(r);
			var h = z(r, 2), g = R(h), _ = z(R(g)), v = R(_);
			A(_), A(g);
			var b = z(g, 2);
			Y(b, 21, () => U(n).agentHub.agents, (e) => e.name, (e, t) => {
				var n = Oa(), r = R(n), i = R(r), a = R(i, !0);
				A(i);
				var o = z(i), s = R(o), c = R(s, !0);
				A(s);
				var l = z(s), u = R(l);
				A(l), A(o), A(r), A(n), B((e) => {
					q(a, e), q(c, U(t).name), q(u, `${(U(t).providerId || "") ?? ""} · ${(U(t).available === !1 ? U(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
				}, [() => (U(t).name || "A").slice(0, 1).toUpperCase()]), K(e, n);
			}, (e) => {
				K(e, ka());
			}), A(b), A(h);
			var x = z(h, 2), S = R(x);
			let C;
			var w = R(S, !0);
			A(S);
			var T = z(S);
			Q(R(T), { name: "save" }), Ne(), A(T), A(x), A(t), B((e) => {
				q(c, U(n).agentHub.connected && U(n).agentHub.compatible ? "Compatible" : U(n).agentHub.connected ? "Incompatible" : "Unavailable"), q(p, U(n).agentHub.error || `API ${U(n).agentHub.apiVersion || "unknown"} · AgentHub ${U(n).agentHub.version || "unknown"}`), q(v, `${U(n).agentHub.agents.length ?? ""} agents · ${U(n).agentHub.providers.length ?? ""} providers`), C = Jr(S, 1, "settings-save-hint", null, C, { visible: U(a).dirty }), q(w, U(a).dirty ? "Unsaved changes" : ""), T.disabled = e;
			}, [() => !U(a).dirty || !!U(o)]), W("input", u, d), ui(u, () => U(a).endpoint, (e) => U(a).endpoint = e), W("click", T, y), K(e, t);
		}, ee = (e) => {
			var t = Fa(), r = z(R(t), 2), i = R(r), s = z(R(i)), l = R(s);
			A(s), A(i);
			var u = z(i, 2), d = z(R(u), 2);
			Y(d, 17, () => U(a).profiles, jr, (e, t, n) => {
				let r = /* @__PURE__ */ N(() => c.has(U(t).key.trim().toLowerCase()));
				var i = Pa();
				let a;
				var o = R(i);
				X(o);
				var s = z(o, 2);
				X(s);
				var l = z(s, 2);
				Y(l, 21, () => x(U(t).agentName), jr, (e, t) => {
					var n = ja(), r = R(n, !0);
					A(n);
					var i = {};
					B(() => {
						q(r, U(t).label), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
					}), K(e, n);
				}), A(l);
				var u;
				Qr(l);
				var d = z(l, 2), f = (e) => {
					K(e, Ma());
				}, p = (e) => {
					var t = Na();
					Q(R(t), { name: "trash-2" }), A(t), W("click", t, () => v(n)), K(e, t);
				};
				J(d, (e) => {
					U(r) ? e(f) : e(p, -1);
				}), A(i), B(() => {
					a = Jr(i, 1, "settings-profile-row", null, a, { "settings-profile-system": U(r) }), ai(o, U(t).key), o.disabled = U(r), ai(s, U(t).description), s.disabled = U(r), u !== (u = U(t).agentName) && (l.value = (l.__value = U(t).agentName) ?? "", Zr(l, U(t).agentName));
				}), W("input", o, (e) => g(n, "key", e.currentTarget.value)), W("input", s, (e) => g(n, "description", e.currentTarget.value)), W("change", l, (e) => g(n, "agentName", e.currentTarget.value)), K(e, i);
			});
			var f = z(d, 2), p = R(f);
			X(p);
			var m = z(p, 2);
			X(m);
			var h = z(m, 2);
			Y(h, 21, () => U(n).agents, jr, (e, t) => {
				var n = ja(), r = R(n, !0);
				A(n);
				var i = {};
				B(() => {
					q(r, U(t).label), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
				}), K(e, n);
			}), A(h);
			var b = z(h, 2);
			Q(R(b), { name: "plus" }), Ne(), A(b), A(f), A(u), A(r);
			var S = z(r, 2), C = R(S);
			let w;
			var T = R(C, !0);
			A(C);
			var E = z(C);
			Q(R(E), { name: "save" }), Ne(), A(E), A(S), A(t), B((e) => {
				q(l, `${U(a).profiles.length ?? ""} routes`), h.disabled = !U(n).agents.length, b.disabled = !U(n).agents.length, w = Jr(C, 1, "settings-save-hint", null, w, { visible: U(a).dirty }), q(T, U(a).dirty ? "Unsaved changes" : ""), E.disabled = e;
			}, [() => !U(a).dirty || !!U(o)]), ui(p, () => U(a).newProfile.key, (e) => U(a).newProfile.key = e), ui(m, () => U(a).newProfile.description, (e) => U(a).newProfile.description = e), $r(h, () => U(a).newProfile.agentName, (e) => U(a).newProfile.agentName = e), W("click", b, _), W("click", E, y), K(e, t);
		}, te = (e) => {
			var t = La(), r = z(R(t), 2), i = R(r), a = z(R(i));
			X(a), A(i);
			var o = z(i, 2), s = (e) => {
				var t = Ia(), r = R(t, !0);
				A(t), B(() => q(r, U(n).notifications.permissionError)), K(e, t);
			};
			J(o, (e) => {
				U(n).notifications.permissionError && e(s);
			}), A(r);
			var c = z(r, 2), l = R(c), u = z(R(l));
			X(u), A(l);
			var d = z(l, 2), f = R(d, !0);
			A(d), A(c), A(t), B(() => {
				oi(a, U(n).notifications.browser), oi(u, U(n).notifications.sound), q(f, U(n).notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
			}), W("change", a, (e) => U(n).onBrowserNotifications(e.currentTarget.checked)), W("change", u, (e) => U(n).onCompletionSound(e.currentTarget.checked)), K(e, t);
		};
		J(C, (e) => {
			U(a).tab === "workspace" ? e(w) : U(a).tab === "user" ? e(T, 1) : U(a).tab === "agenthub" ? e(E, 2) : U(a).tab === "profiles" ? e(ee, 3) : e(te, -1);
		}), A(u), A(i), W("click", r, () => U(n).onClose(U(a).dirty)), W("click", S, () => U(n).onClose(U(a).dirty)), K(e, t);
	};
	J(w, (e) => {
		U(n).open && e(T);
	}), K(e, C), Ve();
}
_r([
	"click",
	"input",
	"change"
]);
//#endregion
//#region src/islands/UploadDialog.svelte
var Ba = /* @__PURE__ */ G("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), Va = /* @__PURE__ */ G("<small class=\"upload-result-path\"> </small>"), Ha = /* @__PURE__ */ G("<small class=\"upload-error\"> </small>"), Ua = /* @__PURE__ */ G("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), Wa = /* @__PURE__ */ G("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this session's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function Ga(e, t) {
	Be(t, !0);
	let n = /* @__PURE__ */ F(L(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(L([])), a = 1, o = /* @__PURE__ */ F(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ N(() => U(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ N(() => U(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ N(() => U(i).filter((e) => e.status === "error").length);
	vi(() => {
		let e = t.channel.subscribe((e) => {
			I(n, e, !0), e.identity !== U(r) && (d(), I(r, e.identity, !0), I(i, [], !0), a = 1, e.open && queueMicrotask(() => document.getElementById("agentUploadDropZone")?.focus({ preventScroll: !0 }))), queueMicrotask(e.onIconsChanged);
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
		I(i, [...U(i), ...r], !0);
		for (let e of r) g(e, U(n).identity, U(n).workspaceId, U(n).runId);
	}
	function h(e, t) {
		I(i, U(i).map((n) => n.id === e ? {
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
	var b = wr(), x = sn(b), S = (e) => {
		var t = Wa(), n = R(t), r = z(n, 2), a = R(r), s = z(R(a), 2);
		Q(R(s), { name: "x" }), A(s), A(a);
		var d = z(a, 2), f = R(d);
		hi(f, (e) => I(o, e), () => U(o));
		var p = z(f, 2), h = R(p);
		Q(h, { name: "clipboard-paste" });
		var g = z(h, 4);
		Q(R(g), { name: "folder-open" }), Ne(), A(g), A(p);
		var b = z(p, 2), x = R(b), S = (e) => {
			K(e, Ba());
		};
		J(x, (e) => {
			U(i).length || e(S);
		}), Y(z(x, 2), 17, () => U(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ N(() => y(U(t)));
			var r = Ua();
			let i;
			var a = R(r), o = R(a);
			Q(o, { get name() {
				return U(n).icon;
			} });
			var s = z(o), c = R(s), l = R(c, !0);
			A(c);
			var u = z(c), d = R(u, !0);
			A(u), A(s);
			var f = z(s), p = R(f, !0);
			A(f), A(a);
			var m = z(a, 2), h = R(m);
			let g;
			A(m);
			var _ = z(m, 2), b = (e) => {
				var n = Va(), r = R(n, !0);
				A(n), B(() => q(r, U(t).path)), K(e, n);
			};
			J(_, (e) => {
				U(t).status === "success" && e(b);
			});
			var x = z(_, 2), S = (e) => {
				var n = Ha(), r = R(n, !0);
				A(n), B(() => q(r, U(t).error || "Upload failed")), K(e, n);
			};
			J(x, (e) => {
				U(t).status === "error" && e(S);
			}), A(r), B((e) => {
				i = Jr(r, 1, "upload-item", null, i, {
					"upload-item-success": U(t).status === "success",
					"upload-item-error": U(t).status === "error",
					"upload-item-uploading": U(t).status === "uploading"
				}), q(l, U(t).name), q(d, e), q(p, U(n).label), Z(m, "aria-label", U(t).name), Z(m, "aria-valuenow", U(t).progress), g = Xr(h, "", g, { width: `${U(t).progress}%` });
			}, [() => v(U(t).size)]), K(e, r);
		}), A(b), A(d);
		var C = z(d, 2), w = R(C), T = R(w, !0);
		A(w);
		var E = z(w, 2);
		A(C), A(r), A(t), B(() => {
			s.disabled = U(c), q(T, U(c) ? "Wait for uploads to finish before closing." : U(i).length ? `${U(l)} uploaded${U(u) ? ` · ${U(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), E.disabled = U(c);
		}), W("click", n, _), W("click", s, _), W("change", f, () => U(o).files && m(U(o).files)), gr("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), gr("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), gr("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), W("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), U(o).click());
		}), W("click", g, () => U(o).click()), W("click", E, _), K(e, t);
	};
	J(x, (e) => {
		U(n).open && e(S);
	}), K(e, b), Ve();
}
_r([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/islands/channel.ts
function Ka(e) {
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
var qa = /* @__PURE__ */ new Map();
async function Ja(e, t, n) {
	await Ya(e), t.replaceChildren(), qa.set(e, n(t));
}
async function Ya(e) {
	let t = qa.get(e);
	t && (qa.delete(e), await t());
}
async function Xa() {
	let e = [...qa.keys()];
	await Promise.all(e.map((e) => Ya(e)));
}
//#endregion
//#region src/entry.ts
var Za = "brand-version", $ = () => void 0, Qa = async () => void 0, $a = [{
	id: "",
	label: "Forge default",
	src: "/favicon.svg"
}], eo = Ka({
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
	onPreview: Qa,
	onSubmit: Qa,
	previewRequestKey: () => "",
	onConfirmTemplateSwitch: () => !0,
	onIconsChanged: $
}), to = Ka({
	open: !1,
	identity: "",
	dataVersion: 0,
	initialTab: "workspace",
	workspaces: [],
	activeWorkspaceId: "",
	workspaceIcons: $a,
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
	onAddWorkspace: Qa,
	onRemoveWorkspace: Qa,
	onWorkspaceIcon: Qa,
	onSaveUser: async (e) => e,
	onSaveAgentHub: Qa,
	onBrowserNotifications: $,
	onCompletionSound: $,
	onToast: $,
	onIconsChanged: $
}), no = Ka({
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
	onSubmit: Qa,
	onIconsChanged: $
}), ro = Ka({
	open: !1,
	identity: "",
	workspaceId: "",
	runId: "",
	onDone: $,
	onIconsChanged: $
}), io = Ka({
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
});
async function ao() {
	let e = document.getElementById("brandVersionIsland");
	if (!e) return;
	let t = e.dataset.version || "v0.1.0";
	try {
		await Ja(Za, e, (e) => {
			let n = Tr(bi, {
				target: e,
				props: { version: t }
			});
			return () => kr(n);
		});
	} catch (n) {
		throw e.textContent = t, n;
	}
}
async function oo(e, t, n, r) {
	let i = document.getElementById(t);
	i && await Ja(e, i, (t) => {
		t.dataset.svelteOwned = e;
		let i = Tr(n, {
			target: t,
			props: r
		});
		return async () => {
			delete t.dataset.svelteOwned, await kr(i);
		};
	});
}
async function so() {
	await Promise.all([
		oo("create-dialog", "createDialogRoot", ua, { channel: eo }),
		oo("settings", "settingsRoot", za, { channel: to }),
		oo("self-driving-dialog", "selfDrivingDialogRoot", _a, { channel: no }),
		oo("upload-dialog", "uploadDialogRoot", Ga, { channel: ro }),
		oo("chat-composer", "ttyComposer", Fi, { channel: io })
	]);
}
var co = {
	mountBrandVersion: ao,
	renderCreateDialog: (e) => eo.publish(e),
	renderSettings: (e) => to.publish(e),
	renderSelfDrivingDialog: (e) => no.publish(e),
	renderUploadDialog: (e) => ro.publish(e),
	renderComposer: (e) => io.publish(e),
	unmount: Ya,
	unmountAll: Xa
}, lo = window.ForgeSvelteIslands;
window.ForgeSvelteIslands = co, window.ForgeSveltePageLifecycleInstalled || (window.ForgeSveltePageLifecycleInstalled = !0, window.addEventListener("pagehide", () => {
	window.ForgeSvelteIslands?.unmountAll();
}), window.addEventListener("pageshow", (e) => {
	e.persisted && Promise.all([window.ForgeSvelteIslands?.mountBrandVersion(), so()]);
})), (async () => {
	await lo?.unmountAll(), await Promise.all([ao(), so()]), window.ForgeLegacySvelteReady?.();
})().catch((e) => console.error("Failed to mount the Forge Svelte island", e));
//#endregion
