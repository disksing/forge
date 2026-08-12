//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/shared/utils.js
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/errors.js
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/constants.js
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/hydration.js
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
	return Pe(/* @__PURE__ */ ln(O));
}
function k(e) {
	if (D) {
		if (/* @__PURE__ */ ln(O) !== null) throw Ae(), we;
		O = e;
	}
}
function A(e = 1) {
	if (D) {
		for (var t = e, n = O; t--;) n = /* @__PURE__ */ ln(n);
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
		var i = /* @__PURE__ */ ln(n);
		e && n.remove(), n = i;
	}
}
function Le(e) {
	if (!e || e.nodeType !== 8) throw Ae(), we;
	return e.data;
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/equality.js
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/context.js
var Ve = null;
function He(e) {
	Ve = e;
}
function j(e, t = !1, n) {
	Ve = {
		p: Ve,
		i: !1,
		c: null,
		e: null,
		s: e,
		x: null,
		r: H,
		l: null
	};
}
function M(e) {
	var t = Ve, n = t.e;
	if (n !== null) {
		t.e = null;
		for (var r of n) bn(r);
	}
	return e !== void 0 && (t.x = e), t.i = !0, Ve = t.p, e ?? {};
}
function Ue() {
	return !0;
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/task.js
var We = [];
function Ge() {
	var e = We;
	We = [], f(e);
}
function Ke(e) {
	if (We.length === 0 && !kt) {
		var t = We;
		queueMicrotask(() => {
			t === We && Ge();
		});
	}
	We.push(e);
}
function qe() {
	for (; We.length > 0;) Ge();
}
function Je(e) {
	var t = H;
	if (t === null) return V.f |= te, e;
	if (!(t.f & 32768) && !(t.f & 4)) throw e;
	Ye(e, t);
}
function Ye(e, t) {
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/status.js
var Xe = ~(h | g | m);
function Ze(e, t) {
	e.f = e.f & Xe | t;
}
function Qe(e) {
	e.f & 512 || e.deps === null ? Ze(e, m) : Ze(e, g);
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/utils.js
function $e(e) {
	if (e !== null) for (let t of e) !(t.f & 2) || !(t.f & 65536) || (t.f ^= T, $e(t.deps));
}
function et(e, t, n) {
	e.f & 2048 ? t.add(e) : e.f & 4096 && n.add(e), $e(e.deps), Ze(e, m);
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/store.js
var tt = !1;
function nt(e) {
	var t = tt;
	try {
		return tt = !1, [e(), tt];
	} finally {
		tt = t;
	}
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/misc.js
function rt(e) {
	D && /* @__PURE__ */ cn(e) !== null && un(e);
}
var it = !1;
function at() {
	it || (it = !0, document.addEventListener("reset", (e) => {
		Promise.resolve().then(() => {
			if (!e.defaultPrevented) for (let t of e.target.elements) t[le]?.();
		});
	}, { capture: !0 }));
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/bindings/shared.js
function ot(e) {
	var t = V, n = H;
	Un(null), Wn(null);
	try {
		return e();
	} finally {
		Un(t), Wn(n);
	}
}
function st(e, t, n, r = n) {
	e.addEventListener(t, () => ot(n));
	let i = e[le];
	e[le] = i ? () => {
		i(), r(!0);
	} : () => r(!0), at();
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/reactivity/create-subscriber.js
function ct(e) {
	let t = 0, n = Kt(0), r;
	return () => {
		_n() && (U(n), wn(() => (t === 0 && (r = dr(() => e(() => Xt(n)))), t += 1, () => {
			Ke(() => {
				--t, t === 0 && (r?.(), r = void 0, Xt(n));
			});
		})));
	};
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/blocks/boundary.js
var lt = x | S;
function ut(e, t, n, r) {
	new dt(e, t, n, r);
}
var dt = class {
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
	#h = ct(() => (this.#m = Kt(this.#l), () => {
		this.#m = null;
	}));
	constructor(e, t, n, r) {
		this.#e = e, this.#n = t, this.#r = (e) => {
			var t = H;
			t.b = this, t.f |= 128, n(e);
		}, this.parent = H.b, this.transform_error = r ?? this.parent?.transform_error ?? ((e) => e), this.#i = Tn(() => {
			if (D) {
				let e = this.#t;
				Fe();
				let t = e.data === "[!";
				if (e.data.startsWith("[?")) {
					let t = JSON.parse(e.data.slice(2));
					this.#_(t);
				} else t ? this.#y() : this.#g();
			} else this.#b();
		}, lt), D && (this.#e = O);
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
		Ke(r), t && (this.#s = En(() => {
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
			t = !0, n && Ce(), this.#s !== null && Nn(this.#s, () => {
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
					Ye(e, this.#i && this.#i.parent);
				}
			}
		};
	}
	#y() {
		let e = this.#n.pending;
		e && (this.is_pending = !0, this.#o = En(() => e(this.#e)), Ke(() => {
			var e = this.#c = document.createDocumentFragment(), t = sn();
			e.append(t), this.#a = this.#S(() => En(() => this.#r(t))), this.#u === 0 && (this.#e.before(e), this.#c = null, Nn(this.#o, () => {
				this.#o = null;
			}), this.#x(P));
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
			} else this.#x(P);
		} catch (e) {
			this.error(e);
		}
	}
	#x(e) {
		this.is_pending = !1, e.transfer_effects(this.#f, this.#p);
	}
	defer_effect(e) {
		et(e, this.#f, this.#p);
	}
	is_rendered() {
		return !this.is_pending && (!this.parent || this.parent.is_rendered());
	}
	has_pending_snippet() {
		return !!this.#n.pending;
	}
	#S(e) {
		var t = H, n = V, r = Ve;
		Wn(this.#i), Un(this.#i), He(this.#i.ctx);
		try {
			return Ft.ensure(), e();
		} catch (e) {
			return Je(e), null;
		} finally {
			Wn(t), Un(n), He(r);
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
		this.#C(e, t), this.#l += e, !(!this.#m || this.#d) && (this.#d = !0, Ke(() => {
			this.#d = !1, this.#m && Jt(this.#m, this.#l);
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
		this.#a &&= (An(this.#a), null), this.#o &&= (An(this.#o), null), this.#s &&= (An(this.#s), null), D && (Pe(this.#t), A(), Pe(Ie()));
		let t = this.#n.failed, n = (e) => {
			let { reset: n, invoke_onerror: r } = this.#v(e);
			r(), t && (this.#s = this.#S(() => {
				try {
					return En(() => {
						var r = H;
						r.b = this, r.f |= 128, t(this.#e, () => e, () => n);
					});
				} catch (e) {
					return Ye(e, this.#i.parent), null;
				}
			}));
		};
		Ke(() => {
			var t;
			try {
				t = this.transform_error(e);
			} catch (e) {
				Ye(e, this.#i && this.#i.parent);
				return;
			}
			typeof t == "object" && t && typeof t.then == "function" ? t.then(n, (e) => Ye(e, this.#i && this.#i.parent)) : n(t);
		});
	}
};
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/async.js
function ft(e, t, n, r) {
	let i = Ue() ? gt : yt;
	var a = e.filter((e) => !e.settled), o = t.map(i);
	if (n.length === 0 && a.length === 0) {
		r(o);
		return;
	}
	var s = H, c = pt(), l = a.length === 1 ? a[0].promise : a.length > 1 ? Promise.all(a.map((e) => e.promise)) : null;
	function u(e) {
		if (!(s.f & 16384)) {
			c();
			try {
				r([...o, ...e]);
			} catch (e) {
				Ye(e, s);
			}
			mt();
		}
	}
	var d = ht();
	if (n.length === 0) {
		l.then(() => u([])).finally(d);
		return;
	}
	function f() {
		Promise.all(n.map((e) => /* @__PURE__ */ vt(e))).then(u).catch((e) => Ye(e, s)).finally(d);
	}
	l ? l.then(() => {
		c(), f(), mt();
	}) : f();
}
function pt() {
	var e = H, t = V, n = Ve, r = P;
	return function(i = !0) {
		Wn(e), Un(t), He(n), i && !(e.f & 16384) && (r?.activate(), r?.apply());
	};
}
function mt(e = !0) {
	Wn(null), Un(null), He(null), e && P?.deactivate();
}
function ht() {
	var e = H, t = e.b, n = P, r = !!t?.is_rendered();
	return t?.update_pending_count(1, n), n.increment(r, e), () => {
		t?.update_pending_count(-1, n), n.decrement(r, e);
	};
}
/*#__NO_SIDE_EFFECTS__*/
function gt(e) {
	var t = 2 | h;
	return H !== null && (H.f |= S), {
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
		parent: H,
		ac: null
	};
}
var _t = Symbol("obsolete");
/*#__NO_SIDE_EFFECTS__*/
function vt(e, t, n) {
	let r = H;
	r === null && pe();
	var i = void 0, a = Kt(Te), o = !V, s = /* @__PURE__ */ new Set();
	return Cn(() => {
		var t = H, n = p();
		i = n.promise;
		try {
			Promise.resolve(e()).then(n.resolve, (e) => {
				e !== ue && n.reject(e);
			}).finally(mt);
		} catch (e) {
			n.reject(e), mt();
		}
		var c = P;
		if (o) {
			if (t.f & 32768) var l = ht();
			if (r.b?.is_rendered()) c.async_deriveds.get(t)?.reject(_t);
			else for (let e of s.values()) e.reject(_t);
			s.add(n), c.async_deriveds.set(t, n);
		}
		let u = (e, t = void 0) => {
			l?.(), s.delete(n), t !== _t && (c.activate(), t ? (a.f |= te, Jt(a, t)) : (a.f & 8388608 && (a.f ^= te), Jt(a, e)), c.deactivate());
		};
		n.promise.then(u, (e) => u(null, e || "unknown"));
	}), vn(() => {
		for (let e of s) e.reject(_t);
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
	let t = /* @__PURE__ */ gt(e);
	return Kn(t), t;
}
/*#__NO_SIDE_EFFECTS__*/
function yt(e) {
	let t = /* @__PURE__ */ gt(e);
	return t.equals = Be, t;
}
function bt(e) {
	var t = e.effects;
	if (t !== null) {
		e.effects = null;
		for (var n = 0; n < t.length; n += 1) An(t[n]);
	}
}
function xt(e) {
	var t, n = H, r = e.parent;
	if (!Bn && r !== null && e.v !== Te && r.f & 24576) return ke(), e.v;
	Wn(r);
	try {
		e.f &= ~T, bt(e), t = ir(e);
	} finally {
		Wn(n);
	}
	return t;
}
function St(e) {
	var t = xt(e);
	if (!e.equals(t) && (e.wv = tr(), (!P?.is_fork || e.deps === null) && (P === null ? e.v = t : (P.capture(e, t, !0), Et?.capture(e, t, !0)), e.deps === null))) {
		Ze(e, m);
		return;
	}
	Bn || (Dt === null ? Qe(e) : (_n() || P?.is_fork) && Dt.set(e, t));
}
function Ct(e) {
	if (e.effects !== null) for (let t of e.effects) (t.teardown || t.ac) && (t.teardown?.(), t.ac !== null && ot(() => {
		t.ac.abort(ue), t.ac = null;
	}), t.fn !== null && (t.teardown = d), or(t, 0), On(t));
}
function wt(e) {
	if (e.effects !== null) for (let t of e.effects) t.teardown && t.fn !== null && sr(t);
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/batch.js
var Tt = null, P = null, Et = null, Dt = null, Ot = null, kt = !1, At = !1, jt = null, Mt = null, Nt = 0, Pt = 1, Ft = class e {
	id = Pt++;
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
		Tt === null ? Tt = this : (Tt.#n = this, this.#t = Tt), Tt = this;
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
			for (var r of n.d) Ze(r, h), t(r);
			for (r of n.m) Ze(r, g), t(r);
		}
		this.#p.add(e);
	}
	#g() {
		this.#e = !0, Nt++ > 1e3 && (this.#x(), Lt());
		for (let e of this.#u) this.#d.delete(e), Ze(e, h), this.schedule(e);
		for (let e of this.#d) Ze(e, g), this.schedule(e);
		let t = this.#c;
		this.#c = [], this.apply();
		var n = jt = [], r = [], i = Mt = [];
		for (let e of t) try {
			this.#_(e, n, r);
		} catch (t) {
			throw Ht(e), this.#h() || this.discard(), t;
		}
		if (P = null, i.length > 0) {
			var a = e.ensure();
			for (let e of i) a.schedule(e);
		}
		if (jt = null, Mt = null, this.#h()) {
			this.#b(r), this.#b(n);
			for (let [e, t] of this.#f) Vt(e, t);
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
		this.#r.clear(), Et = this, zt(r), zt(n), Et = null, this.#s?.resolve();
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
					r & 4194320 && !this.async_deriveds.has(i) && (this.#d.delete(i), Ze(i, h), this.schedule(i));
				}
			}
		};
		for (let e of this.current.keys()) t(e);
		this.oncommit(() => e.discard()), e.#x(), P = this, this.#g();
	}
	#b(e) {
		for (var t = 0; t < e.length; t += 1) et(e[t], this.#u, this.#d);
	}
	capture(e, t, n = !1) {
		e.v !== Te && !this.previous.has(e) && this.previous.set(e, e.v), e.f & 8388608 || (this.current.set(e, [t, n]), Dt?.set(e, t)), this.is_fork || (e.v = t);
	}
	activate() {
		P = this;
	}
	deactivate() {
		P = null, Dt = null;
	}
	flush() {
		try {
			At = !0, P = this, this.#g();
		} finally {
			Nt = 0, Ot = null, jt = null, Mt = null, At = !1, P = null, Dt = null, Wt.clear();
		}
	}
	discard() {
		for (let e of this.#i) e(this);
		this.#i.clear();
		for (let e of this.async_deriveds.values()) e.reject(_t);
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
		this.#m || (this.#m = !0, Ke(() => {
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
			!At && !kt && Ke(() => {
				t.#e || t.flush();
			});
		}
		return P;
	}
	apply() {
		Dt = null;
	}
	schedule(e) {
		if (Ot = e, e.b?.is_pending && e.f & 16777228 && !(e.f & 32768)) {
			e.b.defer_effect(e);
			return;
		}
		for (var t = e; t.parent !== null;) {
			t = t.parent;
			var n = t.f;
			if (jt !== null && t === H && (V === null || !(V.f & 2))) return;
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
			e === null || (e.#n = t), t === null ? Tt = e : t.#t = e, this.linked = !1;
		}
	}
};
function It(e) {
	var t = kt;
	kt = !0;
	try {
		var n;
		for (e && (P !== null && !P.is_fork && P.flush(), n = e());;) {
			if (qe(), P === null) return n;
			P.flush();
		}
	} finally {
		kt = t;
	}
}
function Lt() {
	try {
		ve();
	} catch (e) {
		Ye(e, Ot);
	}
}
var Rt = null;
function zt(e) {
	var t = e.length;
	if (t !== 0) {
		for (var n = 0; n < t;) {
			var r = e[n++];
			if (!(r.f & 24576) && nr(r) && (Rt = /* @__PURE__ */ new Set(), sr(r), r.deps === null && r.first === null && r.nodes === null && r.teardown === null && r.ac === null && Mn(r), Rt?.size > 0)) {
				Wt.clear();
				for (let e of Rt) {
					if (e.f & 24576) continue;
					let t = [e], n = e.parent;
					for (; n !== null;) Rt.has(n) && (Rt.delete(n), t.push(n)), n = n.parent;
					for (let e = t.length - 1; e >= 0; e--) {
						let n = t[e];
						n.f & 24576 || sr(n);
					}
				}
				Rt.clear();
			}
		}
		Rt = null;
	}
}
function Bt(e) {
	P.schedule(e);
}
function Vt(e, t) {
	if (!(e.f & 32 && e.f & 1024)) {
		e.f & 2048 ? t.d.push(e) : e.f & 4096 && t.m.push(e), Ze(e, m);
		for (var n = e.first; n !== null;) Vt(n, t), n = n.next;
	}
}
function Ht(e) {
	Ze(e, m);
	for (var t = e.first; t !== null;) Ht(t), t = t.next;
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/sources.js
var Ut = /* @__PURE__ */ new Set(), Wt = /* @__PURE__ */ new Map(), Gt = !1;
function Kt(e, t) {
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
function F(e, t) {
	let n = Kt(e, t);
	return Kn(n), n;
}
/*#__NO_SIDE_EFFECTS__*/
function qt(e, t = !1, n = !0) {
	let r = Kt(e);
	return t || (r.equals = Be), r;
}
function I(e, t, n = !1) {
	return V !== null && (!Hn || V.f & 131072) && Ue() && V.f & 4325394 && (Gn === null || !Gn.has(e)) && Se(), Jt(e, n ? Qt(t) : t, Mt);
}
function Jt(e, t, n = null) {
	if (!e.equals(t)) {
		Wt.set(e, Bn ? t : e.v);
		var r = Ft.ensure();
		if (r.capture(e, t), e.f & 2) {
			let t = e;
			e.f & 2048 && xt(t), Dt === null && Qe(t);
		}
		e.wv = tr(), Zt(e, h, n), Ue() && H !== null && H.f & 1024 && !(H.f & 96) && (Yn === null ? Xn([e]) : Yn.push(e)), !r.is_fork && Ut.size > 0 && !Gt && Yt();
	}
	return t;
}
function Yt() {
	Gt = !1;
	for (let e of Ut) {
		e.f & 1024 && Ze(e, g);
		let t;
		try {
			t = nr(e);
		} catch {
			t = !0;
		}
		t && sr(e);
	}
	Ut.clear();
}
function Xt(e) {
	I(e, e.v + 1);
}
function Zt(e, t, n) {
	var r = e.reactions;
	if (r !== null) for (var i = Ue(), a = r.length, o = 0; o < a; o++) {
		var s = r[o], c = s.f;
		if (!(!i && s === H)) {
			var l = (c & h) === 0;
			if (l && Ze(s, t), c & 131072) Ut.add(s);
			else if (c & 2) {
				var u = s;
				Dt?.delete(u), c & 65536 || (c & 512 && (H === null || !(H.f & 2097152)) && (s.f |= T), Zt(u, g, n));
			} else if (l) {
				var d = s;
				c & 16 && Rt !== null && Rt.add(d), n === null ? Bt(d) : n.push(d);
			}
		}
	}
}
function Qt(t) {
	if (typeof t != "object" || !t || ne in t) return t;
	let n = l(t);
	if (n !== s && n !== c) return t;
	var r = /* @__PURE__ */ new Map(), i = e(t), o = /* @__PURE__ */ F(0), u = null, d = $n, f = (e) => {
		if ($n === d) return e();
		var t = V, n = $n;
		Un(null), er(d);
		var r = e();
		return Un(t), er(n), r;
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
					let e = f(() => /* @__PURE__ */ F(Te, u));
					r.set(t, e), Xt(o);
				}
			} else I(n, Te), Xt(o);
			return !0;
		},
		get(e, n, i) {
			if (n === ne) return t;
			var o = r.get(n), s = n in e;
			if (o === void 0 && (!s || a(e, n)?.writable) && (o = f(() => /* @__PURE__ */ F(Qt(s ? e[n] : Te), u)), r.set(n, o)), o !== void 0) {
				var c = U(o);
				return c === Te ? void 0 : c;
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
			return (n !== void 0 || H !== null && (!i || a(e, t)?.writable)) && (n === void 0 && (n = f(() => /* @__PURE__ */ F(i ? Qt(e[t]) : Te, u)), r.set(t, n)), U(n) === Te) ? !1 : i;
		},
		set(e, t, n, s) {
			var c = r.get(t), l = t in e;
			if (i && t === "length") for (var d = n; d < c.v; d += 1) {
				var p = r.get(d + "");
				p === void 0 ? d in e && (p = f(() => /* @__PURE__ */ F(Te, u)), r.set(d + "", p)) : I(p, Te);
			}
			if (c === void 0) (!l || a(e, t)?.writable) && (c = f(() => /* @__PURE__ */ F(void 0, u)), I(c, Qt(n)), r.set(t, c));
			else {
				l = c.v !== Te;
				var m = f(() => Qt(n));
				I(c, m);
			}
			var h = Reflect.getOwnPropertyDescriptor(e, t);
			if (h?.set && h.set.call(s, n), !l) {
				if (i && typeof t == "string") {
					var g = r.get("length"), _ = Number(t);
					Number.isInteger(_) && _ >= g.v && I(g, _ + 1);
				}
				Xt(o);
			}
			return !0;
		},
		ownKeys(e) {
			U(o);
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
function $t(e) {
	try {
		if (typeof e == "object" && e && ne in e) return e[ne];
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
		rn = a(t, "firstChild").get, an = a(t, "nextSibling").get, u(e) && (e[oe] = void 0, e[ae] = null, e[se] = void 0, e.__e = void 0), u(n) && (n[ce] = void 0);
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
	if (!D) return /* @__PURE__ */ cn(e);
	var n = /* @__PURE__ */ cn(O);
	if (n === null) n = O.appendChild(sn());
	else if (t && n.nodeType !== 3) {
		var r = sn();
		return n?.before(r), Pe(r), r;
	}
	return t && pn(n), Pe(n), n;
}
function R(e, t = !1) {
	if (!D) {
		var n = /* @__PURE__ */ cn(e);
		return n instanceof Comment && n.data === "" ? /* @__PURE__ */ ln(n) : n;
	}
	if (t) {
		if (O?.nodeType !== 3) {
			var r = sn();
			return O?.before(r), Pe(r), r;
		}
		pn(O);
	}
	return O;
}
function z(e, t = 1, n = !1) {
	let r = D ? O : e;
	for (var i; t--;) i = r, r = /* @__PURE__ */ ln(r);
	if (!D) return r;
	if (n) {
		if (r?.nodeType !== 3) {
			var a = sn();
			return r === null ? i?.after(a) : r.before(a), Pe(a), a;
		}
		pn(r);
	}
	return Pe(r), r;
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/effects.js
function mn(e) {
	H === null && (V === null && _e(e), ge()), Bn && he(e);
}
function hn(e, t) {
	var n = t.last;
	n === null ? t.last = t.first = e : (n.next = e, e.prev = n, t.last = e);
}
function gn(e, t) {
	var n = H;
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
	P?.register_created_effect(r);
	var i = r;
	if (e & 4) jt === null ? Ft.ensure().schedule(r) : jt.push(r);
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
	return Ze(t, m), t.teardown = e, t;
}
function yn(e) {
	mn("$effect");
	var t = H.f;
	if (!V && t & 32 && Ve !== null && !Ve.i) {
		var n = Ve;
		(n.e ??= []).push(e);
	} else return bn(e);
}
function bn(e) {
	return gn(4 | C, e);
}
function xn(e) {
	Ft.ensure();
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
	return gn(ee | S, e);
}
function wn(e, t = 0) {
	return gn(8 | t, e);
}
function B(e, t = [], n = [], r = []) {
	ft(r, t, n, (t) => {
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
		e !== null && ot(() => {
			e.abort(ue);
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
		e.f ^= _, e.f & 1024 || (Ze(e, h), Ft.ensure().schedule(e));
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/legacy.js
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
			if (nr(a) && St(a), a.wv > e.wv) return !0;
		}
		t & 512 && Dt === null && Ze(e, m);
	}
	return !1;
}
function rr(e, t, n = !0) {
	var r = e.reactions;
	if (r !== null && !(Gn !== null && Gn.has(e))) for (var i = 0; i < r.length; i++) {
		var a = r[i];
		a.f & 2 ? rr(a, t, !1) : t === a && (n ? Ze(a, h) : a.f & 1024 && Ze(a, g), Bt(a));
	}
}
function ir(e) {
	var t = qn, n = Jn, r = Yn, i = V, a = Gn, o = Ve, s = Hn, c = $n, l = e.f;
	qn = null, Jn = 0, Yn = null, V = l & 96 ? null : e, Gn = null, He(e.ctx), Hn = !1, $n = ++Qn, e.ac !== null && (ot(() => {
		e.ac.abort(ue);
	}), e.ac = null);
	try {
		e.f |= E;
		var u = e.fn, d = u();
		e.f |= y;
		var f = e.deps, p = P?.is_fork;
		if (qn !== null) {
			var m;
			if (p || or(e, Jn), f !== null && Jn > 0) for (f.length = Jn + qn.length, m = 0; m < qn.length; m++) f[Jn + m] = qn[m];
			else e.deps = f = qn;
			if (_n() && e.f & 512) for (m = Jn; m < f.length; m++) (f[m].reactions ??= []).push(e);
		} else !p && f !== null && Jn < f.length && (or(e, Jn), f.length = Jn);
		if (Ue() && Yn !== null && !Hn && f !== null && !(e.f & 6146)) for (m = 0; m < Yn.length; m++) rr(Yn[m], e);
		if (i !== null && i !== e) {
			if (Qn++, i.deps !== null) for (let e = 0; e < n; e += 1) i.deps[e].rv = Qn;
			if (t !== null) for (let e of t) e.rv = Qn;
			Yn !== null && (r === null ? r = Yn : r.push(...Yn));
		}
		return e.f & 8388608 && (e.f ^= te), d;
	} catch (e) {
		return Je(e);
	} finally {
		e.f ^= E, qn = t, Jn = n, Yn = r, V = i, Gn = a, He(o), Hn = s, $n = c;
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
		s.f & 512 && (s.f ^= 512, s.f &= ~T), s.v !== Te && Qe(s), s.ac !== null && ot(() => {
			s.ac.abort(ue), s.ac = null, Ze(s, h);
		}), Ct(s), or(s, 0);
	}
}
function or(e, t) {
	var n = e.deps;
	if (n !== null) for (var r = t; r < n.length; r++) ar(e, n[r]);
}
function sr(e) {
	var t = e.f;
	if (!(t & 16384)) {
		Ze(e, m);
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
	await Promise.resolve(), It();
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
	if (Bn && Wt.has(e)) return Wt.get(e);
	if (t) {
		var a = e;
		if (Bn) {
			var o = a.v;
			return (!(a.f & 1024) && a.reactions !== null || ur(a)) && (o = xt(a)), Wt.set(a, o), o;
		}
		var s = !(a.f & 512) && !Hn && V !== null && (zn || !!(V.f & 512)), c = (a.f & y) === 0;
		nr(a) && (s && (a.f |= 512), St(a)), s && !c && (wt(a), lr(a));
	}
	if (Dt?.has(e)) return Dt.get(e);
	if (e.f & 8388608) throw e.v;
	return e.v;
}
function lr(e) {
	if (e.f |= 512, e.deps !== null) for (let t of e.deps) (t.reactions ??= []).push(e), t.f & 2 && !(t.f & 512) && (wt(t), lr(t));
}
function ur(e) {
	if (e.v === Te) return !0;
	if (e.deps === null) return !1;
	for (let t of e.deps) if (Wt.has(t) || t.f & 2 && ur(t)) return !0;
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
function fr(e) {
	if (!(typeof e != "object" || !e || e instanceof EventTarget)) {
		if (ne in e) pr(e);
		else if (!Array.isArray(e)) for (let t in e) {
			let n = e[t];
			typeof n == "object" && n && ne in n && pr(n);
		}
	}
}
function pr(e, t = /* @__PURE__ */ new Set()) {
	if (typeof e == "object" && e && !(e instanceof EventTarget) && !t.has(e)) {
		t.add(e), e instanceof Date && e.getTime();
		for (let n in e) try {
			pr(e[n], t);
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
var mr = ["touchstart", "touchmove"];
function hr(e) {
	return mr.includes(e);
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/events.js
var gr = Symbol("events"), _r = /* @__PURE__ */ new Set(), vr = /* @__PURE__ */ new Set();
function yr(e, t, n, r = {}) {
	function i(e) {
		if (r.capture || Cr.call(t, e), !e.cancelBubble) return ot(() => n?.call(this, e));
	}
	return e.startsWith("pointer") || e.startsWith("touch") || e === "wheel" ? Ke(() => {
		t.addEventListener(e, i, r);
	}) : t.addEventListener(e, i, r), i;
}
function br(e, t, n, r, i) {
	var a = {
		capture: r,
		passive: i
	}, o = yr(e, t, n, a);
	(t === document.body || t === window || t === document || t instanceof HTMLMediaElement) && vn(() => {
		t.removeEventListener(e, o, a);
	});
}
function W(e, t, n) {
	(t[gr] ??= {})[e] = n;
}
function xr(e) {
	for (var t = 0; t < e.length; t++) _r.add(e[t]);
	for (var n of vr) n(e);
}
var Sr = null;
function Cr(e) {
	var t = this, n = t.ownerDocument, r = e.type, a = e.composedPath?.() || [], o = a[0] || e.target;
	Sr = e;
	var s = 0, c = Sr === e && e[gr];
	if (c) {
		var l = a.indexOf(c);
		if (l !== -1 && (t === document || t === window)) {
			e[gr] = t;
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
					var h = o[gr]?.[r];
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
			e[gr] = t, delete e.currentTarget, Un(d), Wn(f);
		}
	}
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/reconciler.js
var wr = globalThis?.window?.trustedTypes && /* @__PURE__ */ globalThis.window.trustedTypes.createPolicy("svelte-trusted-html", { createHTML: (e) => e });
function Tr(e) {
	return wr?.createHTML(e) ?? e;
}
function Er(e) {
	var t = fn("template");
	return t.innerHTML = Tr(e.replaceAll("<!>", "<!---->")), t.content;
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/template.js
function Dr(e, t) {
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
		if (D) return Dr(O, null), O;
		i === void 0 && (i = Er(a ? e : "<!>" + e), n || (i = /* @__PURE__ */ cn(i)));
		var t = r || nn ? document.importNode(i, !0) : i.cloneNode(!0);
		if (n) {
			var o = /* @__PURE__ */ cn(t), s = t.lastChild;
			Dr(o, s);
		} else Dr(t, t);
		return t;
	};
}
function Or(e = "") {
	if (!D) {
		var t = sn(e + "");
		return Dr(t, t), t;
	}
	var n = O;
	return n.nodeType === 3 ? pn(n) : (n.before(n = sn()), Pe(n)), Dr(n, n), n;
}
function kr() {
	if (D) return Dr(O, null), O;
	var e = document.createDocumentFragment(), t = document.createComment(""), n = sn();
	return e.append(t, n), Dr(t, n), e;
}
function K(e, t) {
	if (D) {
		var n = H;
		(!(n.f & 32768) || n.nodes.end === null) && (n.nodes.end = O), Fe();
		return;
	}
	e !== null && e.before(t);
}
function q(e, t) {
	var n = t == null ? "" : typeof t == "object" ? `${t}` : t;
	n !== (e[ce] ??= e.nodeValue) && (e[ce] = n, e.nodeValue = `${n}`);
}
function Ar(e, t) {
	return Mr(e, t);
}
var jr = /* @__PURE__ */ new Map();
function Mr(e, { target: t, anchor: n, props: i = {}, events: a, context: o, intro: s = !0, transformError: c }) {
	on();
	var l = void 0, u = xn(() => {
		var s = n ?? t.appendChild(sn());
		ut(s, { pending: () => {} }, (t) => {
			j({});
			var n = Ve;
			if (o && (n.c = o), a && (i.$$events = a), D && Dr(t, null), l = e(t, i) || {}, D && (H.nodes.end = O, O === null || O.nodeType !== 8 || O.data !== "]")) throw Ae(), we;
			M();
		}, c);
		var u = /* @__PURE__ */ new Set(), d = (e) => {
			for (var n = 0; n < e.length; n++) {
				var r = e[n];
				if (!u.has(r)) {
					u.add(r);
					var i = hr(r);
					for (let e of [t, document]) {
						var a = jr.get(e);
						a === void 0 && (a = /* @__PURE__ */ new Map(), jr.set(e, a));
						var o = a.get(r);
						o === void 0 ? (e.addEventListener(r, Cr, { passive: i }), a.set(r, 1)) : a.set(r, o + 1);
					}
				}
			}
		};
		return d(r(_r)), vr.add(d), () => {
			for (var e of u) for (let n of [t, document]) {
				var r = jr.get(n), i = r.get(e);
				--i == 0 ? (n.removeEventListener(e, Cr), r.delete(e), r.size === 0 && jr.delete(n)) : r.set(e, i);
			}
			vr.delete(d), s !== n && s.parentNode?.removeChild(s);
		};
	});
	return Nr.set(l, u), l;
}
var Nr = /* @__PURE__ */ new WeakMap();
function Pr(e, t) {
	let n = Nr.get(e);
	return n ? (Nr.delete(e), n(t)) : Promise.resolve();
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/blocks/branches.js
var Fr = class {
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
		var n = P, r = dn();
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
		} else D && (this.anchor = O), this.#a(n);
	}
};
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/blocks/if.js
function J(e, t, n = !1) {
	var r;
	D && (r = O, Fe());
	var i = new Fr(e), a = n ? x : 0;
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
	Tn(() => {
		var e = !1;
		t((t, n = 0) => {
			e = !0, o(n, t);
		}), e || o(-1, null);
	}, a);
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/blocks/key.js
var Ir = Symbol("NaN");
function Lr(e, t, n) {
	D && Fe();
	var r = new Fr(e), i = !Ue();
	Tn(() => {
		var e = t();
		e !== e && (e = Ir), i && typeof e == "object" && e && (e = {}), r.ensure(e, n);
	});
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/blocks/each.js
function Rr(e, t) {
	return t;
}
function zr(e, t, n) {
	for (var i = [], a = t.length, o, s = t.length, c = 0; c < a; c++) {
		let n = t[c];
		Nn(n, () => {
			if (o) {
				if (o.pending.delete(n), o.done.add(n), o.pending.size === 0) {
					var t = e.outrogroups;
					Br(e, r(o.done)), t.delete(o), t.size === 0 && (e.outrogroups = null);
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
		Br(e, t, !l);
	} else o = {
		pending: new Set(t),
		done: /* @__PURE__ */ new Set()
	}, (e.outrogroups ??= /* @__PURE__ */ new Set()).add(o);
}
function Br(e, t, n = !0) {
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
var Vr;
function Hr(t, n, i, a, o, s = null) {
	var c = t, l = /* @__PURE__ */ new Map();
	if (n & 4) {
		var u = t;
		c = D ? Pe(/* @__PURE__ */ cn(u)) : u.appendChild(sn());
	}
	D && Fe();
	var d = null, f = /* @__PURE__ */ yt(() => {
		var t = i();
		return e(t) ? t : t == null ? [] : r(t);
	}), p, m = /* @__PURE__ */ new Map(), h = !0;
	function g(e) {
		v.effect.f & 16384 || (v.pending.delete(e), v.fallback = d, Wr(v, p, c, n, a), d !== null && (p.length === 0 ? d.f & 33554432 ? (d.f ^= w, Kr(d, null, c)) : Fn(d) : Nn(d, () => {
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
			D && Le(c) === "[!" != (e === 0) && (c = Ie(), Pe(c), Ne(!1), t = !0);
			for (var r = /* @__PURE__ */ new Set(), u = P, v = dn(), y = 0; y < e; y += 1) {
				D && O.nodeType === 8 && O.data === "]" && (c = O, t = !0, Ne(!1));
				var b = p[y], x = a(b, y), S = h ? null : l.get(x);
				S ? (S.v && Jt(S.v, b), S.i && Jt(S.i, y), v && u.unskip_effect(S.e)) : (S = Gr(l, h ? c : Vr ??= sn(), b, x, y, o, n, i), h || (S.e.f |= w), l.set(x, S)), r.add(x);
			}
			if (e === 0 && s && !d && (h ? d = En(() => s(c)) : (d = En(() => s(Vr ??= sn())), d.f |= w)), e > r.size && me("", "", ""), D && e > 0 && Pe(Ie()), !h) {
				if (m.set(u, r), v) {
					for (let [e, t] of l) r.has(e) || u.skip_effect(t.e);
					u.oncommit(g), u.ondiscard(_);
				} else g(u);
			}
			t && Ne(!0), U(f);
		}),
		flags: n,
		items: l,
		pending: m,
		outrogroups: null,
		fallback: d
	};
	h = !1, D && (c = O);
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
		if (_.f & 8192 && (Fn(_), o && (_.nodes?.a?.unfix(), (f ??= /* @__PURE__ */ new Set()).delete(_))), _.f & 33554432) {
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
		for (let t of e.outrogroups) t.pending.size === 0 && (Br(e, r(t.done)), e.outrogroups?.delete(t));
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
			zr(e, T, ee);
		}
	}
	o && Ke(() => {
		if (f !== void 0) for (_ of f) _.nodes?.a?.apply();
	});
}
function Gr(e, t, n, r, i, a, o, s) {
	var c = o & 1 ? o & 16 ? Kt(n) : /* @__PURE__ */ qt(n, !1, !1) : null, l = o & 2 ? Kt(i) : null;
	return {
		v: c,
		i: l,
		e: En(() => (a(t, c ?? n, l ?? i, s), () => {
			e.delete(r);
		}))
	};
}
function Kr(e, t, n) {
	if (e.nodes) for (var r = e.nodes.start, i = e.nodes.end, a = t && !(t.f & 33554432) ? t.nodes.start : n; r !== null;) {
		var o = /* @__PURE__ */ ln(r);
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
		D && (o = Pe(/* @__PURE__ */ cn(c)));
	}
	B(() => {
		var e = H;
		if (s === (s = t() ?? "")) {
			D && Fe();
			return;
		}
		if (n && !D) {
			e.nodes = null, c.innerHTML = s, s !== "" && Dr(/* @__PURE__ */ cn(c), c.lastChild);
			return;
		}
		if (e.nodes !== null && (jn(e.nodes.start, e.nodes.end), e.nodes = null), s !== "") {
			if (D) {
				for (var a = O.data, l = Fe(), u = l; l !== null && (l.nodeType !== 8 || l.data !== "");) u = l, l = /* @__PURE__ */ ln(l);
				if (l === null) throw Ae(), we;
				Dr(O, u), o = Pe(l);
				return;
			}
			var d = fn(r ? "svg" : i ? "math" : "template", r ? De : i ? Oe : void 0);
			d.innerHTML = s;
			var f = r || i ? d : d.content;
			if (Dr(/* @__PURE__ */ cn(f), f.lastChild), r || i) for (; /* @__PURE__ */ cn(f);) o.before(/* @__PURE__ */ cn(f));
			else o.before(f);
		}
	});
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/blocks/snippet.js
function Yr(e, t, ...n) {
	var r = new Fr(e);
	Tn(() => {
		let e = t() ?? null;
		r.ensure(e, e && ((t) => e(t, ...n)));
	}, x);
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/actions.js
function Xr(e, t, n) {
	Sn(() => {
		var r = dr(() => t(e, n?.()) || {});
		if (n && r?.update) {
			var i = !1, a = {};
			wn(() => {
				var e = n();
				fr(e), i && ze(a, e) && (a = e, r.update(e));
			}), i = !0;
		}
		if (r?.destroy) return () => r.destroy();
	});
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/clsx/dist/clsx.mjs
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/shared/attributes.js
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/class.js
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/style.js
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/bindings/select.js
function ci(t, n, r = !1) {
	if (t.multiple) {
		if (n == null) return;
		if (!e(n)) return je();
		for (var i of t.options) i.selected = n.includes(di(i));
		return;
	}
	for (i of t.options) if (en(di(i), n)) {
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
	}), vn(() => {
		t.disconnect();
	});
}
function ui(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet(), i = !0;
	st(e, "change", (t) => {
		var i = t ? "[selected]" : ":checked", a;
		if (e.multiple) a = [].map.call(e.querySelectorAll(i), di);
		else {
			var o = e.querySelector(i) ?? e.querySelector("option:not([disabled])");
			a = o && di(o);
		}
		n(a), e.__value = a, P !== null && r.add(P);
	}), Sn(() => {
		var a = t();
		if (e === document.activeElement) {
			var o = P;
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/attributes.js
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
		e[le] = n, Ke(n), at();
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/bindings/input.js
function Si(e, t, n = t) {
	var r = /* @__PURE__ */ new WeakSet();
	st(e, "input", async (i) => {
		var a = i ? e.defaultValue : e.value;
		if (a = wi(e) ? Ti(a) : a, n(a), P !== null && r.add(P), await cr(), a !== (a = t())) {
			var o = e.selectionStart, s = e.selectionEnd, c = e.value.length;
			if (e.value = a ?? "", s !== null) {
				var l = e.value.length;
				o === s && s === c && l > c ? (e.selectionStart = l, e.selectionEnd = l) : (e.selectionStart = o, e.selectionEnd = Math.min(s, l));
			}
		}
	}), (D && e.defaultValue !== e.value || dr(t) == null && e.value) && (n(wi(e) ? Ti(e.value) : e.value), P !== null && r.add(P)), wn(() => {
		var n = t();
		if (e === document.activeElement) {
			var i = P;
			if (r.has(i)) return;
		}
		wi(e) && n === Ti(e.value) || e.type === "date" && !n && !e.value || n !== e.value && (e.value = n ?? "");
	});
}
function Ci(e, t, n = t) {
	st(e, "change", (t) => {
		n(t ? e.defaultChecked : e.checked);
	}), (D && e.defaultChecked !== e.checked || dr(t) == null) && n(e.checked), wn(() => {
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/dom/elements/bindings/this.js
function Ei(e, t) {
	return e === t || e?.[ne] === t;
}
function Di(e = {}, t, n, r) {
	var i = Ve.r, a = H;
	return Sn(() => {
		var o, s;
		return wn(() => {
			o = s, s = r?.() || [], dr(() => {
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
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/client/reactivity/props.js
function Oi(e, t, n, r) {
	var i = !0, o = !!(n & 8), s = !!(n & 16), c = r, l = !0, u = void 0, d = () => s && i ? (u ??= /* @__PURE__ */ gt(r), U(u)) : (l && (l = !1, c = s ? dr(r) : r), c);
	let f;
	if (o) {
		var p = ne in e || re in e;
		f = a(e, t)?.set ?? (p && t in e ? (n) => e[t] = n : void 0);
	}
	var m, h = !1;
	o ? [m, h] = nt(() => e[t]) : m = e[t], m === void 0 && r !== void 0 && (m = d(), f && (i && ye(t), f(m)));
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
	var v = !1, y = (n & 1 ? gt : yt)(() => (v = !1, g()));
	o && U(y);
	var b = H;
	return (function(e, t) {
		if (arguments.length > 0) {
			let n = t ? U(y) : i && o ? Qt(e) : e;
			return I(y, n), v = !0, c !== void 0 && (c = n), e;
		}
		return Bn && v || b.f & 16384 ? y.v : U(y);
	});
}
function ki(e) {
	Ve === null && fe("onMount"), yn(() => {
		let t = dr(e);
		if (typeof t == "function") return t;
	});
}
function Ai(e) {
	Ve === null && fe("onDestroy"), ki(() => () => dr(e));
}
//#endregion
//#region ../../../../../repos/forge/web/node_modules/svelte/src/internal/disclose-version.js
typeof window < "u" && ((window.__svelte ??= {}).v ??= /* @__PURE__ */ new Set()).add("5");
//#endregion
//#region src/components/Icon.svelte
var ji = /* @__PURE__ */ G("<i></i>");
function X(e, t) {
	let n = Oi(t, "className", 3, "");
	var r = ji();
	B(() => {
		Y(r, "data-lucide", t.name), ai(r, 1, $r(n()));
	}), K(e, r);
}
//#endregion
//#region src/components/StatusPresentation.svelte
var Mi = /* @__PURE__ */ G("<span><!></span>"), Ni = /* @__PURE__ */ G("<span data-component-owner=\"status-presentation\" aria-hidden=\"true\"></span>");
function Pi(e, t) {
	j(t, !0);
	let n = Oi(t, "className", 3, "");
	var r = kr(), i = R(r), a = (e) => {
		var r = Ni();
		Hr(r, 21, () => t.status.statuses, (e) => e.key, (e, t) => {
			var n = Mi();
			X(L(n), {
				get name() {
					return U(t).iconName;
				},
				className: "task-status-icon"
			}), k(n), B(() => ai(n, 1, `task-status-indicator ${U(t).className} ${U(t).recentOutput ? "task-status-fresh" : ""}`)), K(e, n);
		}), k(r), B(() => ai(r, 1, `task-status-slot ${n()} ${t.status.slotClassName}`)), K(e, r);
	};
	J(i, (e) => {
		t.status.hasTaskState && e(a);
	}), K(e, r), M();
}
//#endregion
//#region src/components/GlobalSessionList.svelte
var Fi = /* @__PURE__ */ G("<div class=\"session-row muted-row\"><!><div><strong>No active sessions</strong><span>Start one from a task directory.</span></div></div>"), Ii = /* @__PURE__ */ G("<span class=\"session-unread-badge\" aria-label=\"Unread turn completion\">New</span>"), Li = /* @__PURE__ */ G("<button type=\"button\"><!> <div class=\"session-title\"><strong> </strong><span> </span></div> <span> </span> <!> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Ri = /* @__PURE__ */ G("<section class=\"session-section\" data-component-owner=\"global-session-list\"><div class=\"section-title\"><span>Sessions</span></div> <div id=\"sessionList\" class=\"session-list\"><!></div></section>");
function zi(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(null), i = /* @__PURE__ */ F(Qt(t.identity));
	yn(() => {
		t.identity !== U(i) && (I(i, t.identity, !0), u());
	});
	function a(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function o(e) {
		return !U(r) || U(r).id !== e ? "" : U(r).after ? "drop-after" : "drop-before";
	}
	function s(e, i) {
		e.stopPropagation(), I(n, {
			kind: "session",
			id: i,
			projectId: ""
		}, !0), I(r, null), t.onDragState(U(n)), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", i));
	}
	function c(e, t) {
		if (!U(n) || U(n).id === t) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let i = e.currentTarget.getBoundingClientRect();
		I(r, {
			id: t,
			after: e.clientY > i.top + i.height / 2
		}, !0);
	}
	async function l(e, i) {
		if (e.preventDefault(), !U(n) || U(n).id === i) return;
		let a = U(n), o = {
			kind: "session",
			id: i,
			projectId: ""
		}, s = U(r)?.id === i && U(r).after;
		u();
		try {
			await t.onReorder(a, o, s);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function u() {
		U(n) && t.onDragState(null), I(n, null), I(r, null);
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
	var p = Ri(), m = z(L(p), 2), h = L(m), g = (e) => {
		var t = Fi();
		X(L(t), { name: "message-square" }), A(), k(t), K(e, t);
	}, _ = (e) => {
		var r = kr();
		Hr(R(r), 17, () => t.sessions, (e) => e.id, (e, t) => {
			var r = Li(), i = L(r);
			Pi(i, {
				get status() {
					return U(t).status;
				},
				className: "session-status-icon"
			});
			var d = z(i, 2), p = L(d), m = L(p, !0);
			k(p);
			var h = z(p), g = L(h, !0);
			k(h), k(d);
			var _ = z(d, 2), v = L(_, !0);
			k(_);
			var y = z(_, 2), b = (e) => {
				K(e, Ii());
			};
			J(y, (e) => {
				U(t).unread && e(b);
			});
			var x = z(y, 2);
			X(L(x), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), k(x), k(r), B((e) => {
				ai(r, 1, e), Y(r, "aria-label", `${U(t).title}. ${U(t).statusLabel}`), Y(r, "title", U(t).statusLabel), q(m, U(t).title), q(g, U(t).meta), ai(_, 1, `session-badge ${U(t).source === "internal" ? "internal" : "external"}`), q(v, U(t).label);
			}, [() => `session-row ${U(t).source === "internal" ? "internal-session" : "external-session"} ${a(U(t).status)} ${U(t).clickable ? "clickable-session" : ""} ${U(t).current ? "current-session" : ""} ${U(t).unread ? "session-unread" : ""} ${U(n)?.id === U(t).id ? "drag-source" : ""} ${o(U(t).id)}`]), W("click", r, (e) => f(e, U(t))), br("dragover", r, (e) => c(e, U(t).id)), br("drop", r, (e) => l(e, U(t).id)), br("dragstart", x, (e) => s(e, U(t).id)), br("dragend", x, u), K(e, r);
		}), K(e, r);
	};
	J(h, (e) => {
		t.sessions.length === 0 ? e(g) : e(_, -1);
	}), k(m), k(p), K(e, p), M();
}
xr(["click"]);
//#endregion
//#region src/components/LayoutSwitcher.svelte
var Bi = /* @__PURE__ */ G("<button type=\"button\" data-component-owner=\"layout-switcher\"><!></button>");
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
	X(L(a), { get name() {
		return r[t.preference];
	} }), k(a), B(() => {
		ai(a, 1, `layout-switcher ${n()}`), Y(a, "title", `Layout: ${i[t.preference]}`), Y(a, "aria-label", `Switch layout (current: ${i[t.preference]})`);
	}), W("click", a, function(...e) {
		t.onCycle?.apply(this, e);
	}), K(e, a);
}
xr(["click"]);
//#endregion
//#region src/components/MobileToolbar.svelte
var Hi = /* @__PURE__ */ G("<header class=\"mobile-toolbar\" data-component-owner=\"mobile-toolbar\"><button id=\"mobileMenuButton\" class=\"mobile-icon-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"mobile-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"mobileDetailsButton\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"mobileChatButton\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <button id=\"mobileImmersiveButton\" class=\"mobile-icon-button mobile-immersive-button\" type=\"button\" aria-label=\"Toggle immersive chat\"><!></button></header> <button id=\"mobileSidebarBackdrop\" class=\"mobile-sidebar-backdrop\" data-component-owner=\"mobile-toolbar\" type=\"button\" aria-label=\"Close navigation\"></button>", 1);
function Ui(e, t) {
	j(t, !0);
	var n = Hi(), r = R(n), i = L(r);
	X(L(i), { name: "menu" }), k(i);
	var a = z(i, 2), o = L(a), s = z(o, 2);
	k(a);
	var c = z(a, 2), l = L(c);
	{
		let e = /* @__PURE__ */ N(() => t.immersive ? "minimize-2" : "maximize-2");
		X(l, { get name() {
			return U(e);
		} });
	}
	k(c), k(r);
	var u = z(r, 2);
	B(() => {
		Y(i, "aria-expanded", t.sidebarOpen), Y(o, "aria-selected", t.view === "details"), Y(s, "aria-selected", t.view === "chat"), Y(c, "aria-pressed", t.immersive);
	}), W("click", i, () => t.onSidebar(!t.sidebarOpen)), W("click", o, () => t.onView("details")), W("click", s, () => t.onView("chat")), W("click", c, () => t.onImmersive(!t.immersive)), W("click", u, () => t.onSidebar(!1)), K(e, n), M();
}
xr(["click"]);
//#endregion
//#region src/components/PaneResizeHandle.svelte
var Wi = /* @__PURE__ */ G("<div data-component-owner=\"pane-resize-handle\" role=\"separator\"></div>");
function Gi(e, t) {
	j(t, !0);
	let n = null;
	Ai(() => n?.());
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
	var i = Wi();
	B(() => {
		Y(i, "id", t.id), ai(i, 1, `resize-handle ${t.className}`), Y(i, "aria-orientation", t.kind === "sidebarSessionHeight" ? "horizontal" : "vertical"), Y(i, "aria-label", t.label);
	}), W("pointerdown", i, r), K(e, i), M();
}
xr(["pointerdown"]);
//#endregion
//#region src/components/ProjectTree.svelte
var Ki = /* @__PURE__ */ G("<div class=\"empty-state\"><!><strong>Loading workspace</strong><span>Refreshing navigation...</span></div>"), qi = /* @__PURE__ */ G("<div class=\"empty-state\" role=\"alert\"><!><strong>Workspace unavailable</strong><span> </span></div>"), Ji = /* @__PURE__ */ G("<div class=\"empty-state\"><!><strong>No workspace yet</strong><span>Add a workspace path to begin.</span></div>"), Yi = /* @__PURE__ */ G("<span class=\"project-task-summary\" aria-hidden=\"true\"><span class=\"project-task-summary-count\"> </span><span class=\"project-task-summary-separator\">·</span><span class=\"project-task-summary-running\"> </span></span>"), Xi = /* @__PURE__ */ G("<button type=\"button\"><span class=\"chevron\"></span> <!> <!><span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button>"), Zi = /* @__PURE__ */ G("<div class=\"task-group\"></div>"), Qi = /* @__PURE__ */ G("<button type=\"button\"><span class=\"chevron\"><!></span> <!> <!> <span class=\"name\"><span class=\"name-text\"> </span><span class=\"resource-ref\"> </span><!></span> <span class=\"drag-handle\" draggable=\"true\" title=\"Drag to reorder\"><!></span></button> <!>", 1), $i = /* @__PURE__ */ G("<section class=\"tree-section\" data-component-owner=\"project-tree\"><div class=\"section-title\"><span>Projects</span><button id=\"newProjectButton\" type=\"button\" title=\"New project\"><!></button></div> <nav id=\"projectTree\" class=\"project-tree\"><!></nav></section>");
function ea(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(null), i = /* @__PURE__ */ F(Qt(t.identity));
	yn(() => {
		t.identity !== U(i) && (I(i, t.identity, !0), d());
	}), Ai(d);
	function a(e) {
		return [e.layoutClassName, e.className].filter(Boolean).join(" ");
	}
	function o(e) {
		return !U(r) || U(r).id !== e ? "" : U(r).after ? "drop-after" : "drop-before";
	}
	function s(e) {
		return !U(n) || U(n).id === e.id || U(n).kind !== e.kind ? !1 : e.kind !== "task" || U(n).projectId === e.projectId;
	}
	function c(e, i) {
		e.stopPropagation(), I(n, i, !0), I(r, null), t.onDragState(i), e.dataTransfer && (e.dataTransfer.effectAllowed = "move", e.dataTransfer.setData("text/plain", i.id));
	}
	function l(e, t) {
		if (!s(t)) return;
		e.preventDefault(), e.dataTransfer && (e.dataTransfer.dropEffect = "move");
		let n = e.currentTarget.getBoundingClientRect();
		I(r, {
			id: t.id,
			after: e.clientY > n.top + n.height / 2
		}, !0);
	}
	async function u(e, i) {
		if (e.preventDefault(), !U(n) || !s(i)) return;
		let a = U(n), o = U(r)?.id === i.id && U(r).after;
		d();
		try {
			await t.onReorder(a, i, o);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	function d() {
		U(n) && t.onDragState(null), I(n, null), I(r, null);
	}
	async function f(e, n) {
		let r = e.target instanceof Element ? e.target : null;
		if (!r?.closest(".drag-handle")) try {
			n.type === "project" && r?.closest("[data-project-toggle]") ? await t.onToggle(n.id) : await t.onSelect(n.id);
		} catch (e) {
			t.onToast(e instanceof Error ? e.message : String(e));
		}
	}
	var p = $i(), m = L(p), h = z(L(m));
	X(L(h), { name: "plus" }), k(h), k(m);
	var g = z(m, 2), _ = L(g), v = (e) => {
		var t = Ki();
		X(L(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(2), k(t), K(e, t);
	}, y = (e) => {
		var n = qi(), r = L(n);
		X(r, {
			name: "circle-alert",
			className: "empty-state-icon"
		});
		var i = z(r, 2), a = L(i, !0);
		k(i), k(n), B(() => q(a, t.error)), K(e, n);
	}, b = (e) => {
		var t = Ji();
		X(L(t), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(t), K(e, t);
	}, x = (e) => {
		var r = kr();
		Hr(R(r), 17, () => t.projects, (e) => e.id, (e, t) => {
			var r = Qi(), i = R(r), s = L(i), p = L(s), m = (e) => {
				{
					let n = /* @__PURE__ */ N(() => U(t).expanded ? "chevron-down" : "chevron-right");
					X(e, { get name() {
						return U(n);
					} });
				}
			};
			J(p, (e) => {
				U(t).children.length && e(m);
			}), k(s);
			var h = z(s, 2);
			Pi(h, { get status() {
				return U(t).status;
			} });
			var g = z(h, 2);
			X(g, {
				name: "folder",
				className: "tree-icon"
			});
			var _ = z(g, 2), v = L(_), y = L(v, !0);
			k(v);
			var b = z(v), x = L(b, !0);
			k(b);
			var S = z(b), C = (e) => {
				var n = Yi(), r = L(n), i = L(r, !0);
				k(r);
				var a = z(r, 2), o = L(a, !0);
				k(a), k(n), B(() => {
					q(i, U(t).summary.taskLabel), q(o, U(t).summary.runningLabel);
				}), K(e, n);
			};
			J(S, (e) => {
				U(t).summary && !U(t).expanded && e(C);
			}), k(_);
			var w = z(_, 2);
			X(L(w), {
				name: "grip-vertical",
				className: "drag-handle-icon"
			}), k(w), k(i);
			var T = z(i, 2), E = (e) => {
				var r = Zi();
				Hr(r, 21, () => U(t).children, (e) => e.id, (e, r) => {
					var i = Xi(), s = z(L(i), 2);
					Pi(s, { get status() {
						return U(r).status;
					} });
					var p = z(s, 2);
					X(p, {
						name: "file-text",
						className: "tree-icon"
					});
					var m = z(p), h = L(m), g = L(h, !0);
					k(h);
					var _ = z(h), v = L(_, !0);
					k(_), k(m);
					var y = z(m, 2);
					X(L(y), {
						name: "grip-vertical",
						className: "drag-handle-icon"
					}), k(y), k(i), B((e) => {
						ai(i, 1, e), Y(i, "aria-label", U(r).ariaLabel || void 0), Y(i, "title", U(r).statusLabel || void 0), q(g, U(r).title), q(v, U(r).ref);
					}, [() => `tree-item task-item ${a(U(r).status)} ${U(r).active ? "active" : ""} ${U(n)?.id === U(r).id ? "drag-source" : ""} ${o(U(r).id)}`]), W("click", i, (e) => f(e, U(r))), br("dragover", i, (e) => l(e, {
						kind: "task",
						id: U(r).id,
						projectId: U(t).id
					})), br("drop", i, (e) => u(e, {
						kind: "task",
						id: U(r).id,
						projectId: U(t).id
					})), br("dragstart", y, (e) => c(e, {
						kind: "task",
						id: U(r).id,
						projectId: U(t).id
					})), br("dragend", y, d), K(e, i);
				}), k(r), K(e, r);
			};
			J(T, (e) => {
				U(t).expanded && e(E);
			}), B((e) => {
				ai(i, 1, e), Y(i, "aria-label", U(t).ariaLabel || void 0), Y(i, "title", U(t).statusLabel || void 0), Y(s, "data-project-toggle", U(t).children.length ? U(t).id : void 0), q(y, U(t).title), q(x, U(t).ref);
			}, [() => `tree-item ${a(U(t).status)} ${U(t).active ? "active" : ""} ${U(n)?.id === U(t).id ? "drag-source" : ""} ${o(U(t).id)}`]), W("click", i, (e) => f(e, U(t))), br("dragover", i, (e) => l(e, {
				kind: "project",
				id: U(t).id,
				projectId: ""
			})), br("drop", i, (e) => u(e, {
				kind: "project",
				id: U(t).id,
				projectId: ""
			})), br("dragstart", w, (e) => c(e, {
				kind: "project",
				id: U(t).id,
				projectId: ""
			})), br("dragend", w, d), K(e, r);
		}), K(e, r);
	};
	J(_, (e) => {
		t.loading ? e(v) : t.error ? e(y, 1) : t.projects.length === 0 ? e(b, 2) : e(x, -1);
	}), k(g), k(p), B(() => Y(g, "data-navigation-identity", t.identity)), W("click", h, function(...e) {
		t.onCreate?.apply(this, e);
	}), K(e, p), M();
}
xr(["click"]);
//#endregion
//#region src/components/WorkspaceSwitcher.svelte
var ta = /* @__PURE__ */ G("<button type=\"button\" class=\"workspace-menu-row\" role=\"option\"><span class=\"workspace-avatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-menu-main\"><strong> </strong><small> </small></span> <!></button>"), na = /* @__PURE__ */ G("<div id=\"workspaceMenu\" class=\"workspace-menu\" role=\"listbox\"><div class=\"workspace-menu-title\">Switch Workspace</div> <!> <div class=\"workspace-menu-footer\"><button type=\"button\" id=\"workspaceMenuAdd\"><!><span>Add workspace...</span></button></div></div>"), ra = /* @__PURE__ */ G("<section class=\"workspace-switcher\" data-component-owner=\"workspace-switcher\"><div class=\"workspace-select-row\"><button id=\"workspaceSwitcher\" class=\"workspace-switcher-button\" type=\"button\" aria-haspopup=\"listbox\"><span class=\"workspace-avatar\" id=\"workspaceAvatar\"><img alt=\"\" aria-hidden=\"true\"/></span> <span class=\"workspace-switcher-name\" id=\"workspaceSwitcherName\"> </span> <!></button> <!></div></section>");
function ia(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(!1), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(Qt(t.identity)), a = /* @__PURE__ */ N(() => t.workspaces.find((e) => e.id === t.activeWorkspaceId) ?? null);
	yn(() => {
		t.identity !== U(i) && (I(i, t.identity, !0), I(n, !1), I(r, ""));
	}), ki(() => {
		let e = (e) => {
			let t = e.target instanceof Element ? e.target : null;
			U(n) && !t?.closest(".workspace-select-row") && I(n, !1);
		}, r = (e) => {
			e.key === "Escape" && !t.mobileSidebarOpen && I(n, !1);
		};
		return document.addEventListener("mousedown", e), document.addEventListener("keydown", r), () => {
			document.removeEventListener("mousedown", e), document.removeEventListener("keydown", r);
		};
	});
	async function o(e) {
		if (!(!e || U(r))) {
			I(r, e, !0), I(n, !1);
			try {
				await t.onSwitch(e);
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				I(r, "");
			}
		}
	}
	var s = ra(), c = L(s), l = L(c), u = L(l), d = L(u);
	k(u);
	var f = z(u, 2), p = L(f, !0);
	k(f);
	var m = z(f, 2);
	{
		let e = /* @__PURE__ */ N(() => U(r) ? "loader-circle" : "chevrons-up-down");
		X(m, {
			get name() {
				return U(e);
			},
			className: "select-icon"
		});
	}
	k(l);
	var h = z(l, 2), g = (e) => {
		var i = na(), a = z(L(i), 2);
		Hr(a, 17, () => t.workspaces, (e) => e.id, (e, n) => {
			var i = ta(), a = L(i), s = L(a);
			k(a);
			var c = z(a, 2), l = L(c), u = L(l, !0);
			k(l);
			var d = z(l), f = L(d, !0);
			k(d), k(c);
			var p = z(c, 2), m = (e) => {
				X(e, {
					name: "check",
					className: "workspace-menu-check"
				});
			};
			J(p, (e) => {
				U(n).id === t.activeWorkspaceId && e(m);
			}), k(i), B((e) => {
				Y(i, "aria-selected", U(n).id === t.activeWorkspaceId), Y(i, "data-workspace-id", U(n).id), i.disabled = e, Y(s, "src", U(n).iconSrc), q(u, U(n).name || U(n).id), q(f, U(n).path);
			}, [() => !!U(r)]), W("click", i, () => o(U(n).id)), K(e, i);
		});
		var s = z(a, 2), c = L(s);
		X(L(c), { name: "plus" }), A(), k(c), k(s), k(i), W("click", c, () => {
			I(n, !1), t.onAdd();
		}), K(e, i);
	};
	J(h, (e) => {
		U(n) && e(g);
	}), k(c), k(s), B(() => {
		Y(l, "aria-expanded", U(n)), Y(d, "src", U(a)?.iconSrc || "/favicon.svg"), q(p, U(a)?.name || "Workspace");
	}), W("click", l, (e) => {
		e.stopPropagation(), I(n, !U(n));
	}), K(e, s), M();
}
xr(["click"]);
//#endregion
//#region src/components/AppShell.svelte
var aa = /* @__PURE__ */ G("<div data-component-owner=\"app-shell\" class=\"app-shell\"><!> <aside id=\"mobileSidebar\" class=\"sidebar\"><div class=\"brand-band\"><div class=\"brand-mark\">F</div><div class=\"brand-copy\"><strong>Forge</strong><span> </span></div><!><button id=\"systemSettingsButton\" class=\"brand-settings\" type=\"button\" title=\"Settings\" aria-label=\"Settings\"><!></button></div> <!> <!> <!> <!></aside> <!> <main class=\"workspace-panel\"><div class=\"workspace-toolbar\"><button id=\"splitMenuButton\" class=\"workspace-menu-button\" type=\"button\" aria-label=\"Open navigation\" aria-controls=\"mobileSidebar\"><!></button> <div class=\"workspace-toolbar-actions\"><!></div></div> <div class=\"workspace-view-tabs\"><div class=\"workspace-view-switcher\" role=\"tablist\" aria-label=\"Workspace view\"><button id=\"paneDetailsTab\" type=\"button\" role=\"tab\" aria-controls=\"detailsPanel\">Details</button> <button id=\"paneChatTab\" type=\"button\" role=\"tab\" aria-controls=\"agentPanel\">Chat</button></div> <div class=\"workspace-view-actions\"><!></div></div> <section id=\"detailsPanel\" class=\"details-panel\" data-component-owner=\"detail-panel\"><!></section> <!> <aside id=\"agentPanel\" class=\"agent-panel\"><div class=\"tty-panel\"><div id=\"ttyLog\" class=\"tty-log\" data-component-owner=\"event-timeline\"><!></div><div id=\"ttyComposer\" class=\"tty-composer\" data-component-owner=\"chat-composer\"><!></div></div></aside></main></div>");
function oa(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(0);
	ki(() => {
		let e = t.channel.subscribe((e) => {
			I(n, e, !0), queueMicrotask(e.onIconsChanged);
		}), r = (e) => {
			e.key === "Escape" && U(n).mobile.sidebarOpen && U(n).onMobileSidebar(!1);
		}, i = () => {
			U(n).onHistoryNavigation(window.location.pathname).catch((e) => {
				U(n).onToast(e instanceof Error ? e.message : String(e));
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
			U(n).onPaneViewport(), c();
		};
		return document.addEventListener("keydown", r), document.addEventListener("focusout", f), window.addEventListener("resize", p), window.addEventListener("orientationchange", f), window.addEventListener("popstate", i), a?.addEventListener("resize", c), a?.addEventListener("scroll", c), s.addEventListener?.("change", p), c(), () => {
			e(), document.removeEventListener("keydown", r), document.removeEventListener("focusout", f), window.removeEventListener("resize", p), window.removeEventListener("orientationchange", f), window.removeEventListener("popstate", i), a?.removeEventListener("resize", c), a?.removeEventListener("scroll", c), s.removeEventListener?.("change", p), u(), document.body.classList.remove("mobile-sidebar-open", "mobile-chat-active", "chat-immersive", "resizing-x", "resizing-y");
		};
	}), yn(() => {
		document.body.classList.toggle("mobile-sidebar-open", U(n).mobile.sidebarOpen), document.body.classList.toggle("mobile-chat-active", U(n).mobile.view === "chat"), document.body.classList.toggle("chat-immersive", U(n).mobile.immersive);
	}), yn(() => {
		let e = U(n).route;
		!e.path || e.revision <= U(r) || (I(r, e.revision, !0), window.location.pathname !== e.path && window.history[e.replace ? "replaceState" : "pushState"]({}, "", e.path));
	});
	var i = aa(), a = L(i);
	Ui(a, {
		get sidebarOpen() {
			return U(n).mobile.sidebarOpen;
		},
		get view() {
			return U(n).mobile.view;
		},
		get immersive() {
			return U(n).mobile.immersive;
		},
		get onSidebar() {
			return U(n).onMobileSidebar;
		},
		get onView() {
			return U(n).onMobileView;
		},
		get onImmersive() {
			return U(n).onMobileImmersive;
		}
	});
	var o = z(a, 2), s = L(o), c = z(L(s)), l = z(L(c)), u = L(l, !0);
	k(l), k(c);
	var d = z(c);
	Vi(d, {
		get preference() {
			return U(n).layout.preference;
		},
		tone: "dark",
		get onCycle() {
			return U(n).onLayoutCycle;
		}
	});
	var f = z(d);
	X(L(f), { name: "settings" }), k(f), k(s);
	var p = z(s, 2);
	ia(p, {
		get identity() {
			return U(n).identity;
		},
		get mobileSidebarOpen() {
			return U(n).mobile.sidebarOpen;
		},
		get activeWorkspaceId() {
			return U(n).activeWorkspaceId;
		},
		get workspaces() {
			return U(n).workspaces;
		},
		get onSwitch() {
			return U(n).onSwitchWorkspace;
		},
		get onAdd() {
			return U(n).onAddWorkspace;
		},
		get onToast() {
			return U(n).onToast;
		}
	});
	var m = z(p, 2);
	ea(m, {
		get identity() {
			return U(n).identity;
		},
		get loading() {
			return U(n).loading;
		},
		get error() {
			return U(n).error;
		},
		get projects() {
			return U(n).projects;
		},
		get onCreate() {
			return U(n).onCreateProject;
		},
		get onToggle() {
			return U(n).onToggleProject;
		},
		get onSelect() {
			return U(n).onSelectResource;
		},
		get onReorder() {
			return U(n).onReorder;
		},
		get onDragState() {
			return U(n).onDragState;
		},
		get onToast() {
			return U(n).onToast;
		}
	});
	var h = z(m, 2);
	Gi(h, {
		id: "sessionResize",
		kind: "sidebarSessionHeight",
		className: "horizontal-resize sidebar-session-resize",
		label: "Resize sessions panel",
		get onPreview() {
			return U(n).onPanePreview;
		},
		get onCommit() {
			return U(n).onPaneCommit;
		}
	}), zi(z(h, 2), {
		get identity() {
			return U(n).identity;
		},
		get sessions() {
			return U(n).sessions;
		},
		get onSelect() {
			return U(n).onSelectResource;
		},
		get onReorder() {
			return U(n).onReorder;
		},
		get onDragState() {
			return U(n).onDragState;
		},
		get onToast() {
			return U(n).onToast;
		}
	}), k(o);
	var g = z(o, 2);
	Gi(g, {
		id: "sidebarResize",
		kind: "sidebarWidth",
		className: "sidebar-resize",
		label: "Resize sidebar",
		get onPreview() {
			return U(n).onPanePreview;
		},
		get onCommit() {
			return U(n).onPaneCommit;
		}
	});
	var _ = z(g, 2), v = L(_), y = L(v);
	X(L(y), { name: "menu" }), k(y);
	var b = z(y, 2);
	Vi(L(b), {
		get preference() {
			return U(n).layout.preference;
		},
		get onCycle() {
			return U(n).onLayoutCycle;
		}
	}), k(b), k(v);
	var x = z(v, 2), S = L(x), C = L(S), w = z(C, 2);
	k(S);
	var T = z(S, 2);
	Vi(L(T), {
		get preference() {
			return U(n).layout.preference;
		},
		get onCycle() {
			return U(n).onLayoutCycle;
		}
	}), k(T), k(x);
	var E = z(x, 2), ee = L(E), te = (e) => {
		var n = kr();
		Yr(R(n), () => t.details), K(e, n);
	};
	J(ee, (e) => {
		t.details && e(te);
	}), k(E);
	var ne = z(E, 2);
	Gi(ne, {
		id: "detailsResize",
		kind: "chatWidth",
		className: "details-resize",
		label: "Resize chat panel",
		get onPreview() {
			return U(n).onPanePreview;
		},
		get onCommit() {
			return U(n).onPaneCommit;
		}
	});
	var re = z(ne, 2), ie = L(re), ae = L(ie), oe = L(ae), se = (e) => {
		var n = kr();
		Yr(R(n), () => t.timeline), K(e, n);
	};
	J(oe, (e) => {
		t.timeline && e(se);
	}), k(ae);
	var ce = z(ae), le = L(ce), ue = (e) => {
		var n = kr();
		Yr(R(n), () => t.composer), K(e, n);
	};
	J(le, (e) => {
		t.composer && e(ue);
	}), k(ce), k(ie), k(re), k(_), k(i), B(() => {
		q(u, U(n).version), Y(y, "aria-expanded", U(n).mobile.sidebarOpen), Y(C, "aria-selected", U(n).mobile.view === "details"), Y(w, "aria-selected", U(n).mobile.view === "chat");
	}), W("click", f, () => {
		U(n).onMobileSidebar(!1), U(n).onOpenSettings();
	}), W("click", y, () => U(n).onMobileSidebar(!0)), W("click", C, () => U(n).onMobileView("details")), W("click", w, () => U(n).onMobileView("chat")), K(e, i), M();
}
xr(["click"]);
//#endregion
//#region src/components/ChatComposer.svelte
var sa = /* @__PURE__ */ G("<div class=\"tty-message-item\"><span class=\"tty-message-text\"> </span> <span class=\"tty-message-mode\"> </span> <button type=\"button\" class=\"tty-message-steer\"><!> <span>Insert now</span></button></div>"), ca = /* @__PURE__ */ G("<div class=\"tty-message-queue-error\" role=\"alert\"> </div>"), la = /* @__PURE__ */ G("<section class=\"tty-message-queue\" aria-label=\"Waiting messages\"><div class=\"tty-message-queue-header\"><span>Waiting messages</span><span class=\"tty-message-count\"> </span></div> <div class=\"tty-message-list\"></div> <!></section>"), ua = /* @__PURE__ */ G("<span class=\"tty-composer-divider\" aria-hidden=\"true\"></span> <span class=\"tty-composer-group\"><button type=\"button\" id=\"agentEndTurnButton\" class=\"tty-composer-action tty-end-turn-button\" title=\"End current turn\" aria-label=\"End current turn\"><!></button></span>", 1), da = /* @__PURE__ */ G("<div class=\"tty-composer-error\" role=\"alert\"><span> </span><button type=\"button\" class=\"secondary-button\">Retry</button></div>"), fa = /* @__PURE__ */ G("<!> <form id=\"ttyForm\" class=\"tty-input\"><span>&gt;</span> <textarea id=\"ttyInput\" rows=\"1\" autocomplete=\"off\"></textarea> <span class=\"tty-composer-group\"><button type=\"button\" id=\"agentUploadButton\" class=\"tty-upload-button\" title=\"Upload files\" aria-label=\"Upload files\"><!></button> <button type=\"submit\" class=\"tty-send-button\"><!></button></span> <!></form> <!>", 1);
function pa(e, t) {
	j(t, !0);
	let n = t.channel.current(), r = /* @__PURE__ */ F(Qt(n)), i = /* @__PURE__ */ F(Qt(n.identity)), a = /* @__PURE__ */ F(Qt(n.draftResetVersion)), o = /* @__PURE__ */ F(Qt(n.draft)), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ F(""), u = /* @__PURE__ */ F(!1), d = /* @__PURE__ */ F(void 0), f = /* @__PURE__ */ N(() => !!U(r).unavailableReason || U(s) || U(r).sending);
	ki(() => t.channel.subscribe((e) => {
		U(r), I(r, e, !0), e.identity === U(i) ? e.draftResetVersion !== U(a) && (I(a, e.draftResetVersion, !0), I(o, e.draft, !0), I(c, "")) : (I(i, e.identity, !0), I(a, e.draftResetVersion, !0), I(o, e.draft, !0), I(s, !1), I(c, ""), I(l, ""), I(u, !1)), queueMicrotask(e.onIconsChanged);
	})), yn(() => {
		U(o), cr().then(v);
	});
	function p() {
		return {
			workspaceId: U(r).workspaceId,
			resourceId: U(r).resourceId,
			draftKey: U(r).draftKey
		};
	}
	function m(e) {
		I(o, e, !0), I(c, ""), U(r).onDraft(e, p());
	}
	async function h(e) {
		e?.preventDefault();
		let t = U(o);
		if (U(f) || !t.trim() || !U(r).workspaceId || !U(r).resourceId) return;
		let n = U(i), a = p();
		I(s, !0), I(c, "");
		try {
			let e = await U(r).onSend(t, a);
			U(i) === n && e.accepted && e.clear && U(o) === t && m("");
		} catch (e) {
			U(i) === n && I(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			U(i) === n && (I(s, !1), await cr(), U(d)?.focus({ preventScroll: !0 }));
		}
	}
	async function g(e) {
		if (!(!U(r).canSteerWaiting || U(r).steeringMessageId)) {
			I(l, "");
			try {
				await U(r).onSteerWaiting(e);
			} catch (e) {
				I(l, e instanceof Error ? e.message : String(e), !0);
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
				I(u, !0);
				return;
			}
			U(u) || (e.preventDefault(), h());
		}
	}
	function v() {
		if (!U(d)) return;
		U(d).style.height = "auto";
		let e = Math.min(U(d).scrollHeight, 160);
		U(d).style.height = `${e}px`, U(d).style.overflowY = U(d).scrollHeight > 160 ? "auto" : "hidden";
	}
	var y = fa(), b = R(y), x = (e) => {
		var t = la(), n = L(t), i = z(L(n)), a = L(i, !0);
		k(i), k(n);
		var o = z(n, 2);
		Hr(o, 21, () => U(r).waitingMessages, (e) => e.messageId, (e, t) => {
			var n = sa(), i = L(n), a = L(i, !0);
			k(i);
			var o = z(i, 2), s = L(o, !0);
			k(o);
			var c = z(o, 2), l = L(c), u = (e) => {
				X(e, { name: "loader-circle" });
			}, d = (e) => {
				X(e, { name: "corner-up-left" });
			};
			J(l, (e) => {
				U(r).steeringMessageId === U(t).messageId ? e(u) : e(d, -1);
			}), A(2), k(c), k(n), B((e) => {
				Y(n, "data-message-id", U(t).messageId), Y(i, "title", U(t).text), q(a, U(t).text), q(s, U(t).actualMode || U(t).requestedMode), c.disabled = e, Y(c, "title", U(r).canSteerWaiting ? "Insert this waiting message into the current turn" : "Available when the current turn supports steer"), Y(c, "aria-label", `Insert waiting message into current turn: ${U(t).text}`);
			}, [() => !U(r).canSteerWaiting || !!U(r).steeringMessageId]), W("click", c, () => g(U(t).messageId)), K(e, n);
		}), k(o);
		var s = z(o, 2), c = (e) => {
			var t = ca(), n = L(t, !0);
			k(t), B(() => q(n, U(l))), K(e, t);
		};
		J(s, (e) => {
			U(l) && e(c);
		}), k(t), B(() => q(a, U(r).waitingMessages.length)), K(e, t);
	};
	J(b, (e) => {
		U(r).waitingMessages.length && e(x);
	});
	var S = z(b, 2), C = z(L(S), 2);
	rt(C), Di(C, (e) => I(d, e), () => U(d));
	var w = z(C, 2), T = L(w);
	X(L(T), { name: "plus" }), k(T);
	var E = z(T, 2), ee = L(E);
	{
		let e = /* @__PURE__ */ N(() => U(s) ? "loader-circle" : "send");
		X(ee, { get name() {
			return U(e);
		} });
	}
	k(E), k(w);
	var te = z(w, 2), ne = (e) => {
		var t = ua(), n = z(R(t), 2), i = L(n), a = L(i);
		{
			let e = /* @__PURE__ */ N(() => U(r).endingTurn ? "loader-circle" : "pause");
			X(a, { get name() {
				return U(e);
			} });
		}
		k(i), k(n), B(() => i.disabled = U(r).endingTurn), W("click", i, function(...e) {
			U(r).onEndTurn?.apply(this, e);
		}), K(e, t);
	};
	J(te, (e) => {
		U(r).canEndTurn && e(ne);
	}), k(S);
	var re = z(S, 2), ie = (e) => {
		var t = da(), n = L(t), r = L(n, !0);
		k(n);
		var i = z(n);
		k(t), B(() => {
			q(r, U(c)), i.disabled = U(s);
		}), W("click", i, () => h()), K(e, t);
	};
	J(re, (e) => {
		U(c) && e(ie);
	}), B((e) => {
		Y(C, "data-agent-draft-key", U(r).draftKey), Y(C, "placeholder", U(r).unavailableReason || "Message this resource"), C.disabled = U(f), _i(C, U(o)), T.disabled = e, Y(E, "title", U(s) ? "Sending..." : U(r).unavailableReason || "Send input"), Y(E, "aria-label", U(s) ? "Sending..." : U(r).unavailableReason || "Send input"), E.disabled = U(f);
	}, [() => !!U(r).unavailableReason]), br("submit", S, h), W("input", C, (e) => m(e.currentTarget.value)), W("keydown", C, _), W("click", T, function(...e) {
		U(r).onOpenUpload?.apply(this, e);
	}), K(e, y), M();
}
xr([
	"click",
	"input",
	"keydown"
]);
//#endregion
//#region src/components/ProjectCreateForm.svelte
var ma = /* @__PURE__ */ G("<div class=\"project-create-form\" data-component-owner=\"project-create-form\"><textarea name=\"description\" required=\"\" placeholder=\"Describe the project\"></textarea> <input name=\"slug\" placeholder=\"optional-slug\"/></div>");
function ha(e, t) {
	j(t, !0);
	let n = Oi(t, "draft", 7);
	var r = ma(), i = L(r);
	rt(i);
	var a = z(i, 2);
	gi(a), k(r), B(() => {
		_i(i, n().description), _i(a, n().slug);
	}), W("input", i, (e) => n().description = e.currentTarget.value), W("input", a, (e) => n().slug = e.currentTarget.value), K(e, r), M();
}
xr(["input"]);
//#endregion
//#region src/components/TaskPreview.svelte
var ga = /* @__PURE__ */ G("<button type=\"button\" class=\"secondary compact\"> </button>"), _a = /* @__PURE__ */ G("<p class=\"create-task-preview-error\" role=\"alert\"> </p>"), va = /* @__PURE__ */ G("<p class=\"create-task-preview-hint\">Updating preview...</p>"), ya = /* @__PURE__ */ G("<div class=\"template-preview-actions\" data-preview-edited-note=\"\"><small>Modified — the task will be created with this edited content instead of the template output.</small> <button type=\"button\" class=\"secondary compact\">Reset edits</button></div>"), ba = /* @__PURE__ */ G("<small data-preview-edit-hint=\"\">Edit the content above to override the template output for this task.</small>"), xa = /* @__PURE__ */ G("<small> </small>"), Sa = /* @__PURE__ */ G("<section class=\"template-preview\" aria-label=\"Rendered task content\"><h4> </h4> <textarea name=\"previewMarkdown\" class=\"create-task-preview-editor\" aria-label=\"Task markdown\" spellcheck=\"false\"></textarea> <!> <!> <!></section>"), Ca = /* @__PURE__ */ G("<p class=\"create-task-preview-hint\">Rendering preview...</p>"), wa = /* @__PURE__ */ G("<p class=\"create-task-preview-hint\">Fill in the template fields and the preview renders automatically.</p>"), Ta = /* @__PURE__ */ G("<!> <!> <!>", 1), Ea = /* @__PURE__ */ G("<p class=\"create-task-blank-detail\"> </p>"), Da = /* @__PURE__ */ G("<p class=\"create-task-preview-hint\">Write the task detail and the preview updates as you type.</p>"), Oa = /* @__PURE__ */ G("<section class=\"template-preview create-task-blank-preview\" aria-label=\"Task content preview\"><h4> </h4> <!> <!></section>"), ka = /* @__PURE__ */ G("<aside class=\"create-task-preview-col\" aria-label=\"Task preview\" data-component-owner=\"task-preview\"><div class=\"create-section-title create-preview-title\"><span>Task preview</span> <!></div> <!></aside>");
function Aa(e, t) {
	j(t, !0);
	let n = Oi(t, "draft", 7), r = /* @__PURE__ */ F(Qt(n().editedMarkdown ?? "")), i = null, a = /* @__PURE__ */ N(() => !!t.preview && U(r) !== t.preview?.markdown);
	yn(() => {
		let e = t.preview?.markdown ?? null;
		if (e === i) return;
		let a = n().editedMarkdown == null || n().editedMarkdown === i;
		i = e, a && (I(r, e ?? "", !0), n().editedMarkdown = e);
	});
	function o(e) {
		I(r, e, !0), n().editedMarkdown = e;
	}
	function s() {
		I(r, t.preview?.markdown ?? "", !0), n().editedMarkdown = t.preview?.markdown ?? null;
	}
	var c = ka(), l = L(c), u = z(L(l), 2), d = (e) => {
		var n = ga(), r = L(n, !0);
		k(n), B(() => {
			n.disabled = t.previewing || t.submitting, q(r, t.previewing ? "Rendering..." : "Refresh");
		}), W("click", n, function(...e) {
			t.onRefresh?.apply(this, e);
		}), K(e, n);
	};
	J(u, (e) => {
		t.selectedTemplate && e(d);
	}), k(l);
	var f = z(l, 2), p = (e) => {
		var i = Ta(), c = R(i), l = (e) => {
			var n = _a(), r = L(n, !0);
			k(n), B(() => q(r, t.previewError)), K(e, n);
		};
		J(c, (e) => {
			t.previewError && e(l);
		});
		var u = z(c, 2), d = (e) => {
			K(e, va());
		};
		J(u, (e) => {
			!t.previewError && t.stale && t.preview && e(d);
		});
		var f = z(u, 2), p = (e) => {
			var i = Sa(), c = L(i), l = L(c, !0);
			k(c);
			var u = z(c, 2);
			rt(u);
			var d = z(u, 2), f = (e) => {
				var t = ya(), n = z(L(t), 2);
				k(t), W("click", n, s), K(e, t);
			}, p = (e) => {
				K(e, ba());
			};
			J(d, (e) => {
				U(a) ? e(f) : e(p, -1);
			});
			var m = z(d, 2), h = (e) => {
				var n = xa(), r = L(n);
				k(n), B(() => q(r, `Slug: ${t.preview.slug ?? ""}`)), K(e, n);
			};
			J(m, (e) => {
				t.preview.slug && e(h);
			});
			var g = z(m, 2), _ = (e) => {
				var r = xa(), i = L(r);
				k(r), B(() => q(i, `Template ${n().templateName ?? ""} · ${t.templateDigest ?? ""}`)), K(e, r);
			};
			J(g, (e) => {
				t.templateDigest && e(_);
			}), k(i), B(() => {
				q(l, t.preview.title), _i(u, U(r));
			}), W("input", u, (e) => o(e.currentTarget.value)), K(e, i);
		}, m = (e) => {
			K(e, Ca());
		}, h = (e) => {
			K(e, wa());
		};
		J(f, (e) => {
			t.preview ? e(p) : t.previewing ? e(m, 1) : t.previewError || e(h, 2);
		}), K(e, i);
	}, m = (e) => {
		var t = Oa(), r = L(t), i = L(r, !0);
		k(r);
		var a = z(r, 2), o = (e) => {
			var t = Ea(), r = L(t, !0);
			k(t), B(() => q(r, n().detail)), K(e, t);
		}, s = /* @__PURE__ */ N(() => n().detail.trim()), c = (e) => {
			K(e, Da());
		};
		J(a, (e) => {
			U(s) ? e(o) : e(c, -1);
		});
		var l = z(a, 2), u = (e) => {
			var t = xa(), r = L(t);
			k(t), B((e) => q(r, `Slug: ${e ?? ""}`), [() => n().slug.trim()]), K(e, t);
		}, d = /* @__PURE__ */ N(() => n().slug.trim());
		J(l, (e) => {
			U(d) && e(u);
		}), k(t), B((e) => q(i, e), [() => n().title.trim() || "Untitled task"]), K(e, t);
	};
	J(f, (e) => {
		t.selectedTemplate ? e(p) : e(m, -1);
	}), k(c), K(e, c), M();
}
xr(["click", "input"]);
//#endregion
//#region src/components/TemplateFieldGroup.svelte
var ja = /* @__PURE__ */ G("<input type=\"checkbox\"/><span> </span>", 1), Ma = /* @__PURE__ */ G("<span> </span>"), Na = /* @__PURE__ */ G("<textarea></textarea>"), Pa = /* @__PURE__ */ G("<option> </option>"), Fa = /* @__PURE__ */ G("<select><option>Select...</option><!></select>"), Ia = /* @__PURE__ */ G("<input/>"), La = /* @__PURE__ */ G("<small> </small>"), Ra = /* @__PURE__ */ G("<label><!> <!> <!> <!> <!></label>"), za = /* @__PURE__ */ G("<div class=\"template-fields\" data-component-owner=\"template-field-group\"></div>");
function Ba(e, t) {
	j(t, !0);
	function n(e, n) {
		let r = n.currentTarget;
		t.onChange(e, e.type === "boolean" && r instanceof HTMLInputElement ? r.checked : r.value);
	}
	var r = za();
	Hr(r, 21, () => t.fields, (e) => e.name, (e, r) => {
		var i = Ra();
		let a;
		var o = L(i), s = (e) => {
			var i = ja(), a = R(i);
			gi(a);
			var o = z(a), s = L(o);
			k(o), B(() => {
				vi(a, t.values[U(r).name] === !0), q(s, `${U(r).label ?? ""}${U(r).required ? " *" : ""}`);
			}), W("change", a, (e) => n(U(r), e)), K(e, i);
		}, c = (e) => {
			var t = Ma(), n = L(t);
			k(t), B(() => q(n, `${U(r).label ?? ""}${U(r).required ? " *" : ""}`)), K(e, t);
		};
		J(o, (e) => {
			U(r).type === "boolean" ? e(s) : e(c, -1);
		});
		var l = z(o, 2), u = (e) => {
			var i = Na();
			rt(i), B((e) => {
				i.required = U(r).required, Y(i, "placeholder", U(r).placeholder || ""), _i(i, e);
			}, [() => String(t.values[U(r).name] ?? "")]), W("input", i, (e) => n(U(r), e)), K(e, i);
		};
		J(l, (e) => {
			U(r).type === "textarea" && e(u);
		});
		var d = z(l, 2), f = (e) => {
			var i = Fa(), a = L(i);
			a.value = a.__value = "", Hr(z(a), 17, () => U(r).options || [], Rr, (e, t) => {
				var n = Pa(), r = L(n, !0);
				k(n);
				var i = {};
				B(() => {
					q(r, U(t)), i !== (i = U(t)) && (n.value = (n.__value = U(t)) ?? "");
				}), K(e, n);
			}), k(i);
			var o;
			li(i), B((e) => {
				i.required = U(r).required, o !== (o = e) && (i.value = (i.__value = e) ?? "", ci(i, e));
			}, [() => String(t.values[U(r).name] ?? "")]), W("change", i, (e) => n(U(r), e)), K(e, i);
		};
		J(d, (e) => {
			U(r).type === "select" && e(f);
		});
		var p = z(d, 2), m = (e) => {
			var i = Ia();
			gi(i), B((e) => {
				i.required = U(r).required, Y(i, "placeholder", U(r).placeholder || ""), _i(i, e);
			}, [() => String(t.values[U(r).name] ?? "")]), W("input", i, (e) => n(U(r), e)), K(e, i);
		};
		J(p, (e) => {
			U(r).type === "text" && e(m);
		});
		var h = z(p, 2), g = (e) => {
			var t = La(), n = L(t, !0);
			k(t), B(() => q(n, U(r).description)), K(e, t);
		};
		J(h, (e) => {
			U(r).description && e(g);
		}), k(i), B(() => a = ai(i, 1, "", null, a, { "template-boolean": U(r).type === "boolean" })), K(e, i);
	}), k(r), B(() => Y(r, "aria-label", t.label)), K(e, r), M();
}
xr(["change", "input"]);
//#endregion
//#region src/components/TemplatePicker.svelte
var Va = /* @__PURE__ */ G("<small> </small>"), Ha = /* @__PURE__ */ G("<button type=\"button\" role=\"option\"><strong> </strong> <!> <span class=\"template-card-check\"><!></span></button>"), Ua = /* @__PURE__ */ G("<section class=\"template-picker create-section\" aria-label=\"Template\" data-component-owner=\"template-picker\"><div class=\"create-section-title\">Choose a template</div> <div class=\"template-cards\" role=\"listbox\" aria-label=\"Templates\"><button type=\"button\" role=\"option\"><strong>Blank task</strong> <small>Start from an empty task and write the detail yourself.</small> <span class=\"template-card-check\"><!></span></button> <!></div></section>");
function Wa(e, t) {
	j(t, !0);
	function n(e) {
		return `${e.title || e.name}${e.valid ? "" : " (invalid)"}`;
	}
	var r = Ua(), i = z(L(r), 2), a = L(i);
	let o;
	var s = z(L(a), 4);
	X(L(s), { name: "check" }), k(s), k(a), Hr(z(a, 2), 17, () => t.templates, (e) => e.name, (e, r) => {
		var i = Ha();
		let a;
		var o = L(i), s = L(o, !0);
		k(o);
		var c = z(o, 2), l = (e) => {
			var t = Va(), n = L(t, !0);
			k(t), B(() => q(n, U(r).description)), K(e, t);
		};
		J(c, (e) => {
			U(r).description && e(l);
		});
		var u = z(c, 2);
		X(L(u), { name: "check" }), k(u), k(i), B((e) => {
			Y(i, "aria-selected", t.selectedName === U(r).name), a = ai(i, 1, "template-card", null, a, { selected: t.selectedName === U(r).name }), i.disabled = !U(r).valid || t.disabled, q(s, e);
		}, [() => n(U(r))]), W("click", i, () => t.onSelect(U(r).name)), K(e, i);
	}), k(i), k(r), B(() => {
		Y(a, "aria-selected", t.selectedName === ""), o = ai(a, 1, "template-card", null, o, { selected: t.selectedName === "" }), a.disabled = t.disabled;
	}), W("click", a, () => t.onSelect("")), K(e, r), M();
}
xr(["click"]);
//#endregion
//#region src/components/TaskCreateForm.svelte
var Ga = /* @__PURE__ */ G("<small>(generated by template)</small>"), Ka = /* @__PURE__ */ G("<small class=\"create-required\">*</small>"), qa = /* @__PURE__ */ G("<button type=\"button\" class=\"secondary compact\">Use generated</button>"), Ja = /* @__PURE__ */ G("<section class=\"create-section create-template-fields\" aria-label=\"Template fields\"><div class=\"create-section-title\">Template fields</div> <!> <!></section>"), Ya = /* @__PURE__ */ G("<section class=\"create-section create-task-details\" aria-label=\"Details\"><div class=\"create-section-title\">Details</div> <textarea name=\"detail\" placeholder=\"Task detail\"></textarea></section>"), Xa = /* @__PURE__ */ G("<div class=\"create-task-split\" data-component-owner=\"task-create-form\"><div class=\"create-task-form-col\"><!> <section class=\"create-section create-task-basic\" aria-label=\"Basic information\"><div class=\"create-section-title\">Basic information</div> <div class=\"create-title-slug-row\"><label><span>Task title <!></span> <span class=\"template-title-control\"><input name=\"title\"/> <!></span></label> <label class=\"create-task-slug-field\"><span>Slug <small>(optional)</small></span> <span class=\"create-task-slug-wrap\"><span class=\"create-task-slug-prefix\" aria-hidden=\"true\">#</span> <input name=\"slug\" placeholder=\"optional-slug\"/></span></label></div></section> <!></div> <!></div>");
function Za(e, t) {
	j(t, !0);
	let n = Oi(t, "draft", 7), r, i = /* @__PURE__ */ N(() => t.model.templates.find((e) => e.name === n().templateName)), a = /* @__PURE__ */ N(() => t.model.preview?.title || ""), o = /* @__PURE__ */ N(() => n().titleOverride ? n().title : U(a)), s = /* @__PURE__ */ N(() => (U(i)?.fields || []).filter((e) => e.required)), c = /* @__PURE__ */ N(() => (U(i)?.fields || []).filter((e) => !e.required)), l = /* @__PURE__ */ N(() => !t.model.preview || t.model.previewKey !== t.model.previewRequestKey(n()));
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
			r = void 0, n().templateName && U(l) && !t.model.submitting && t.model.onPreview(u());
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
	var v = Xa(), y = L(v), b = L(y), x = (e) => {
		Wa(e, {
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
	J(b, (e) => {
		t.model.templates.length && e(x);
	});
	var S = z(b, 2), C = z(L(S), 2), w = L(C), T = L(w), E = z(L(T)), ee = (e) => {
		K(e, Ga());
	}, te = (e) => {
		K(e, Ka());
	};
	J(E, (e) => {
		U(i)?.taskTitle && !n().titleOverride ? e(ee) : e(te, -1);
	}), k(T);
	var ne = z(T, 2), re = L(ne);
	gi(re);
	var ie = z(re, 2), ae = (e) => {
		var t = qa();
		W("click", t, g), K(e, t);
	};
	J(ie, (e) => {
		U(i)?.taskTitle && n().titleOverride && e(ae);
	}), k(ne), k(w);
	var oe = z(w, 2), se = z(L(oe), 2), ce = z(L(se), 2);
	gi(ce), k(se), k(oe), k(C), k(S);
	var le = z(S, 2), ue = (e) => {
		var t = Ja(), r = z(L(t), 2), i = (e) => {
			Ba(e, {
				get fields() {
					return U(s);
				},
				get values() {
					return n().templateFields;
				},
				label: "Required template fields",
				onChange: m
			});
		};
		J(r, (e) => {
			U(s).length && e(i);
		});
		var a = z(r, 2), o = (e) => {
			Ba(e, {
				get fields() {
					return U(c);
				},
				get values() {
					return n().templateFields;
				},
				label: "Optional template fields",
				onChange: m
			});
		};
		J(a, (e) => {
			U(c).length && e(o);
		}), k(t), K(e, t);
	}, de = (e) => {
		var t = Ya(), r = z(L(t), 2);
		rt(r), k(t), B(() => _i(r, n().detail)), W("input", r, (e) => n().detail = e.currentTarget.value), K(e, t);
	};
	J(le, (e) => {
		U(i) ? e(ue) : e(de, -1);
	}), k(y), Aa(z(y, 2), {
		get draft() {
			return n();
		},
		get selectedTemplate() {
			return U(i);
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
			return U(l);
		},
		get templateDigest() {
			return t.model.templateDigest;
		},
		get submitting() {
			return t.model.submitting;
		},
		onRefresh: _
	}), k(v), B(() => {
		re.required = !U(i)?.taskTitle, _i(re, U(i)?.taskTitle ? U(o) : n().title), Y(re, "placeholder", U(i)?.taskTitle ? "Auto-generated from the template fields — type to override" : "Task title"), _i(ce, n().slug);
	}), W("input", re, (e) => h(e.currentTarget.value)), W("input", ce, (e) => {
		n().slug = e.currentTarget.value, f();
	}), K(e, v), M();
}
xr(["input", "click"]);
//#endregion
//#region src/components/CreateDialog.svelte
var Qa = /* @__PURE__ */ G("<span> </span>"), $a = /* @__PURE__ */ G("<div class=\"create-dialog-layer\" role=\"presentation\"><button class=\"create-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div role=\"dialog\" aria-modal=\"true\"><header class=\"create-dialog-header\"><div><strong> </strong> <!></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <form id=\"createDialogForm\" class=\"details-form create-dialog-form\"><!> <div class=\"form-actions\"><button type=\"submit\"> </button> <button type=\"button\" class=\"secondary\">Cancel</button></div></form></div></div>");
function eo(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(Qt(s(U(n).draft))), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(void 0), o = /* @__PURE__ */ N(() => U(r).type === "task");
	ki(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity !== U(i) && (I(i, e.identity, !0), I(r, s(e.draft), !0)), queueMicrotask(e.onIconsChanged);
	})), ki(() => {
		let e = (e) => {
			if (!U(n).open) return;
			if (e.key === "Escape" && !U(n).submitting) {
				e.preventDefault(), U(n).onClose();
				return;
			}
			if (e.key !== "Tab" || !U(a)) return;
			let t = [...U(a).querySelectorAll("button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled])")];
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
		e.preventDefault(), U(n).submitting || await U(n).onSubmit(s(U(r)));
	}
	var l = kr(), u = R(l), d = (e) => {
		var t = $a(), i = L(t), s = z(i, 2);
		let l;
		var u = L(s), d = L(u), f = L(d), p = L(f, !0);
		k(f);
		var m = z(f, 2), h = (e) => {
			var t = Qa(), n = L(t, !0);
			k(t), B(() => q(n, U(r).projectId)), K(e, t);
		};
		J(m, (e) => {
			U(o) && e(h);
		}), k(d);
		var g = z(d, 2);
		X(L(g), { name: "x" }), k(g), k(u);
		var _ = z(u, 2), v = L(_);
		Lr(v, () => U(n).identity, (e) => {
			var t = kr(), i = R(t), a = (e) => {
				Za(e, {
					get draft() {
						return U(r);
					},
					get model() {
						return U(n);
					}
				});
			}, s = (e) => {
				ha(e, { get draft() {
					return U(r);
				} });
			};
			J(i, (e) => {
				U(o) ? e(a) : e(s, -1);
			}), K(e, t);
		});
		var y = z(v, 2), b = L(y), x = L(b, !0);
		k(b);
		var S = z(b, 2);
		k(y), k(_), k(s), Di(s, (e) => I(a, e), () => U(a)), k(t), B(() => {
			l = ai(s, 1, "create-dialog modal-enter", null, l, { "create-task-dialog": U(o) }), Y(s, "aria-label", U(o) ? "Create task" : "Create project"), q(p, U(o) ? "Create task" : "Create project"), g.disabled = U(n).submitting, b.disabled = U(n).submitting, q(x, U(n).submitting ? "Creating..." : "Create"), S.disabled = U(n).submitting;
		}), W("click", i, function(...e) {
			U(n).onClose?.apply(this, e);
		}), W("click", g, function(...e) {
			U(n).onClose?.apply(this, e);
		}), br("submit", _, c), W("click", S, function(...e) {
			U(n).onClose?.apply(this, e);
		}), K(e, t);
	};
	J(u, (e) => {
		U(n).open && e(d);
	}), K(e, l), M();
}
xr(["click"]);
//#endregion
//#region src/api/client.ts
var to = class extends Error {
	status;
	code;
	body;
	constructor(e, t, n) {
		super(t), this.name = "ApiError", this.status = e, this.code = n?.code, this.body = n;
	}
}, no = class extends Error {
	scope;
	constructor(e) {
		super(`Ignored a stale response for ${e}`), this.name = "StaleResponseError", this.scope = e;
	}
}, ro = class {
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
		if (this.active.get(e.scope)?.generation !== e.generation) throw new no(e.scope);
	}
	finish(e) {
		this.active.get(e.scope)?.generation === e.generation && this.active.delete(e.scope);
	}
	abort(e) {
		let t = this.active.get(e);
		t && (this.active.delete(e), t.controller.abort(new no(e)));
	}
	dispose() {
		for (let e of this.active.values()) e.controller.abort(new no(e.scope));
		this.active.clear();
	}
}, io = class {
	requests = new ro();
	fetchImpl;
	baseURL;
	constructor(e, t = "") {
		this.fetchImpl = e ?? globalThis.fetch.bind(globalThis), this.baseURL = t;
	}
	async request(e, t = {}) {
		let n = await this.fetchImpl(this.resolve(e), {
			...t,
			headers: oo(t.headers)
		});
		return this.decode(n);
	}
	async latest(e, t) {
		let { scope: n, ...r } = t, i = this.requests.begin(n);
		try {
			let t = await this.fetchImpl(this.resolve(e), {
				...r,
				headers: oo(r.headers),
				signal: i.controller.signal
			}), n = await this.decode(t);
			return this.requests.assertCurrent(i), n;
		} catch (e) {
			throw i.controller.signal.aborted && !(e instanceof no) ? new no(n) : e;
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
			let n = ao(t) ? t : void 0, r = n?.error || typeof t == "string" && t || e.statusText || `HTTP ${e.status}`;
			throw new to(e.status, r, n);
		}
		return t;
	}
};
function ao(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}
function oo(e) {
	let t = new Headers(e);
	return t.has("Accept") || t.set("Accept", "application/json"), t;
}
new io();
//#endregion
//#region src/components/DiffModal.svelte
var so = /* @__PURE__ */ G("<div class=\"file-modal-empty\"><!><strong>Loading diff</strong><span> </span></div>"), co = /* @__PURE__ */ G("<div class=\"file-modal-empty error-preview\"><!><strong>Diff unavailable</strong><span> </span></div>"), lo = /* @__PURE__ */ G("<div class=\"file-modal-empty\"><!><strong>No changes</strong><span>This worktree has no diff to show.</span></div>"), uo = /* @__PURE__ */ G("<div class=\"diff-viewer\"></div>"), fo = /* @__PURE__ */ G("<div class=\"diff-modal-layer\" data-component-owner=\"diff-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close worktree diff\"></button> <div class=\"diff-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Worktree diff\"><header class=\"file-modal-header diff-modal-header\"><div><strong> </strong><span> </span></div><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <!></div></div>");
function po(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(void 0), o = /* @__PURE__ */ N(() => `detail-diff:${t.workspaceId}:${t.resourceId}`);
	yn(() => {
		let e = t.repo, a = U(o);
		if (I(n, null), I(i, ""), !e) {
			t.client.requests.abort(a);
			return;
		}
		I(r, !0);
		let c = e.worktreePath || "", l = e.targetBranch || e.baseBranch || "", u = new URLSearchParams({ path: c });
		l && u.set("base", l), t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/diff?${u}`, { scope: a }).then(async (r) => {
			t.repo === e && (I(n, r, !0), await cr(), s());
		}).catch((n) => {
			t.repo === e && n?.name !== "StaleResponseError" && (I(i, n instanceof Error ? n.message : String(n), !0), t.onError(U(i)));
		}).finally(() => {
			t.repo === e && (I(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), yn(() => {
		U(n)?.diff, U(a), s();
	}), Ai(() => t.client.requests.abort(U(o)));
	function s() {
		!U(a) || !U(n)?.diff || !window.Diff2Html || (U(a).innerHTML = window.Diff2Html.html(U(n).diff, {
			drawFileList: !0,
			matching: "lines",
			outputFormat: "side-by-side",
			renderNothingWhenEmpty: !1
		}));
	}
	var c = kr(), l = R(c), u = (e) => {
		var o = fo(), s = L(o), c = z(s, 2), l = L(c), u = L(l), d = L(u), f = L(d, !0);
		k(d);
		var p = z(d), m = L(p);
		k(p), k(u);
		var h = z(u);
		X(L(h), { name: "x" }), k(h), k(l);
		var g = z(l, 2), _ = (e) => {
			var n = so(), r = L(n);
			X(r, { name: "loader-circle" });
			var i = z(r, 2), a = L(i, !0);
			k(i), k(n), B(() => q(a, t.repo.worktreePath || "")), K(e, n);
		}, v = (e) => {
			var t = co(), n = L(t);
			X(n, { name: "triangle-alert" });
			var r = z(n, 2), a = L(r, !0);
			k(r), k(t), B(() => q(a, U(i))), K(e, t);
		}, y = (e) => {
			var t = lo();
			X(L(t), { name: "check-circle-2" }), A(2), k(t), K(e, t);
		}, b = /* @__PURE__ */ N(() => !U(n)?.hasChanges || !U(n).diff?.trim()), x = (e) => {
			var t = uo();
			Di(t, (e) => I(a, e), () => U(a)), K(e, t);
		};
		J(g, (e) => {
			U(r) ? e(_) : U(i) ? e(v, 1) : U(b) ? e(y, 2) : e(x, -1);
		}), k(c), k(o), B(() => {
			q(f, U(n)?.branch || t.repo.branch || t.repo.name || "Diff"), q(m, `${(t.repo.worktreePath || "") ?? ""}${t.repo.targetBranch || t.repo.baseBranch ? ` · base ${t.repo.targetBranch || t.repo.baseBranch}` : ""}`);
		}), W("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), W("click", h, function(...e) {
			t.onClose?.apply(this, e);
		}), K(e, o);
	};
	J(l, (e) => {
		t.repo && e(u);
	}), K(e, c), M();
}
xr(["click"]);
//#endregion
//#region src/components/detail.ts
function mo(e = "") {
	return /\.(md|markdown|mdown|mkdn)$/i.test(e);
}
function ho(e) {
	return window.marked && window.DOMPurify ? (window.marked.setOptions({
		breaks: !0,
		gfm: !0
	}), window.DOMPurify.sanitize(window.marked.parse(String(e ?? "")))) : `<pre>${xo(e)}</pre>`;
}
function go(e) {
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
function _o(e, t) {
	let n = Date.parse(e.time || ""), r = Date.parse(t.time || "");
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t.time || "").localeCompare(String(e.time || ""));
}
function vo(e) {
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
function yo(e) {
	if (!Number.isFinite(e) || e <= 0) return "0 B";
	let t = [
		"B",
		"KB",
		"MB",
		"GB"
	], n = Math.min(Math.floor(Math.log(e) / Math.log(1024)), t.length - 1), r = e / 1024 ** n;
	return `${r >= 10 || n === 0 ? r.toFixed(0) : r.toFixed(1)} ${t[n]}`;
}
function bo(e, t, n, r = 0) {
	let i = [];
	for (let a of e || []) i.push({
		entry: a,
		depth: r
	}), a.type === "directory" && t.has(`${n}:${a.path}`) && i.push(...bo(a.children || [], t, n, r + 1));
	return i;
}
function xo(e) {
	return String(e ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;").replaceAll("'", "&#39;");
}
//#endregion
//#region src/components/FileBrowser.svelte
var So = /* @__PURE__ */ G("<a class=\"artifact-download\"><!></a>"), Co = /* @__PURE__ */ G("<div class=\"artifact-node\"><button type=\"button\"><span class=\"artifact-main\"><span class=\"artifact-chevron\"><!></span><!><span class=\"artifact-name\"> </span></span> <span class=\"artifact-side\"><!><small> </small></span></button></div>"), wo = /* @__PURE__ */ G("<div class=\"empty-list-row\"><!><span> </span></div>"), To = /* @__PURE__ */ G("<div class=\"content-section\" data-component-owner=\"file-browser\"><h3><!><span> </span></h3> <div class=\"artifact-browser\"><div class=\"artifact-tree\" role=\"tree\"><!></div></div></div>");
function Eo(e, t) {
	j(t, !0);
	let n = Oi(t, "entries", 19, () => []), r = Oi(t, "emptyMessage", 3, "No files."), i = Oi(t, "activePath", 3, ""), a = /* @__PURE__ */ N(() => bo(n(), t.expanded, t.title)), o = /* @__PURE__ */ N(() => t.title === "Wiki" ? "book-open" : "paperclip");
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
	var c = To(), l = L(c), u = L(l);
	X(u, { get name() {
		return U(o);
	} });
	var d = z(u), f = L(d, !0);
	k(d), k(l);
	var p = z(l, 2), m = L(p), h = L(m), g = (e) => {
		var n = kr();
		Hr(R(n), 17, () => U(a), (e) => `${t.title}:${e.entry.path}`, (e, n) => {
			let r = /* @__PURE__ */ N(() => U(n).entry.type === "directory"), a = /* @__PURE__ */ N(() => t.expanded.has(`${t.title}:${U(n).entry.path}`));
			var o = Co(), c = L(o);
			let l;
			var u = L(c), d = L(u), f = L(d), p = (e) => {
				{
					let t = /* @__PURE__ */ N(() => U(a) ? "chevron-down" : "chevron-right");
					X(e, { get name() {
						return U(t);
					} });
				}
			};
			J(f, (e) => {
				U(r) && e(p);
			}), k(d);
			var m = z(d);
			{
				let e = /* @__PURE__ */ N(() => U(r) ? U(a) ? "folder-open" : "folder" : s(U(n).entry.name)), t = /* @__PURE__ */ N(() => U(r) ? "artifact-icon artifact-icon-dir" : "artifact-icon");
				X(m, {
					get name() {
						return U(e);
					},
					get className() {
						return U(t);
					}
				});
			}
			var h = z(m), g = L(h, !0);
			k(h), k(u);
			var _ = z(u, 2), v = L(_), y = (e) => {
				var r = So();
				X(L(r), {
					name: "download",
					className: "artifact-download-icon"
				}), k(r), B((e) => {
					Y(r, "href", e), Y(r, "download", U(n).entry.name), Y(r, "title", `Download ${U(n).entry.name}`), Y(r, "aria-label", `Download ${U(n).entry.name}`);
				}, [() => t.rawURL(t.title, U(n).entry.path, !0)]), W("click", r, (e) => e.stopPropagation()), K(e, r);
			};
			J(v, (e) => {
				U(r) || e(y);
			});
			var b = z(v), x = L(b, !0);
			k(b), k(_), k(c), k(o), B((e) => {
				l = ai(c, 1, "artifact-row", null, l, {
					directory: U(r),
					file: !U(r),
					active: i() === `${t.title}:${U(n).entry.path}`
				}), si(c, `--depth: ${U(n).depth}`), Y(h, "title", U(n).entry.path), q(g, U(n).entry.name), q(x, e);
			}, [() => U(r) ? `${(U(n).entry.children || []).length} items` : yo(U(n).entry.size || 0)]), W("click", c, () => U(r) ? t.onToggle(`${t.title}:${U(n).entry.path}`) : t.onPreview(t.title, U(n).entry.path)), K(e, o);
		}), K(e, n);
	}, _ = (e) => {
		var n = wo(), i = L(n);
		{
			let e = /* @__PURE__ */ N(() => t.title === "Artifacts" ? "archive" : "inbox");
			X(i, { get name() {
				return U(e);
			} });
		}
		var a = z(i), o = L(a, !0);
		k(a), k(n), B(() => q(o, r())), K(e, n);
	};
	J(h, (e) => {
		U(a).length ? e(g) : e(_, -1);
	}), k(m), k(p), k(c), B(() => q(f, t.title)), K(e, c), M();
}
xr(["click"]);
//#endregion
//#region src/components/FilePreviewModal.svelte
var Do = /* @__PURE__ */ G("<div class=\"file-modal-empty\"><!><strong>Loading preview</strong><span> </span></div>"), Oo = /* @__PURE__ */ G("<div class=\"file-modal-empty error-preview\"><!><strong>Preview unavailable</strong><span> </span></div>"), ko = /* @__PURE__ */ G("<div class=\"image-preview\" data-preview-scroll=\"\"><img/></div>"), Ao = /* @__PURE__ */ G("<div class=\"file-modal-empty\"><!><strong> </strong><span> </span></div>"), jo = /* @__PURE__ */ G("<div class=\"modal-markdown markdown-rendered\" data-preview-scroll=\"\"></div>"), Mo = /* @__PURE__ */ G("<pre class=\"modal-preview-content\" data-preview-scroll=\"\"> </pre>"), No = /* @__PURE__ */ G("<div class=\"file-modal-layer\" data-component-owner=\"file-preview-modal\" role=\"presentation\"><button class=\"file-modal-backdrop modal-enter\" type=\"button\" aria-label=\"Close file preview\"></button> <div class=\"file-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"File preview\"><header class=\"file-modal-header\"><div><strong> </strong><span> </span></div><div class=\"file-modal-actions\"><a class=\"secondary-button file-modal-open\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a><button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></div></header> <!></div></div>");
function Po(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(null), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ N(() => `detail-preview:${t.workspaceId}:${t.resourceId}`), o = /* @__PURE__ */ N(() => t.selection ? `/api/workspaces/${encodeURIComponent(t.workspaceId)}/${t.selection.section === "Wiki" ? "wiki/files/raw" : "files/raw"}?path=${encodeURIComponent(t.selection.path)}` : "");
	yn(() => {
		let e = t.selection, o = U(a);
		if (I(n, null), I(i, ""), !e) {
			t.client.requests.abort(o);
			return;
		}
		I(r, !0);
		let s = e.section === "Wiki" ? "wiki/files" : "files";
		t.client.latest(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/${s}?path=${encodeURIComponent(e.path)}`, { scope: o }).then((r) => {
			t.selection?.section === e.section && t.selection.path === e.path && I(n, r, !0);
		}).catch((n) => {
			t.selection?.section === e.section && t.selection.path === e.path && n?.name !== "StaleResponseError" && (I(i, n instanceof Error ? n.message : String(n), !0), t.onError(U(i)));
		}).finally(() => {
			t.selection?.section === e.section && t.selection.path === e.path && (I(r, !1), queueMicrotask(t.onIconsChanged));
		});
	}), Ai(() => t.client.requests.abort(U(a)));
	var s = kr(), c = R(s), l = (e) => {
		var a = No(), s = L(a), c = z(s, 2), l = L(c), u = L(l), d = L(u), f = L(d, !0);
		k(d);
		var p = z(d), m = L(p);
		k(p), k(u);
		var h = z(u), g = L(h);
		X(L(g), { name: "external-link" }), A(), k(g);
		var _ = z(g);
		X(L(_), { name: "x" }), k(_), k(h), k(l);
		var v = z(l, 2), y = (e) => {
			var n = Do(), r = L(n);
			X(r, { name: "loader-circle" });
			var i = z(r, 2), a = L(i, !0);
			k(i), k(n), B(() => q(a, t.selection.path)), K(e, n);
		}, b = (e) => {
			var t = Oo(), n = L(t);
			X(n, { name: "triangle-alert" });
			var r = z(n, 2), a = L(r, !0);
			k(r), k(t), B(() => q(a, U(i))), K(e, t);
		}, x = (e) => {
			var r = ko(), i = L(r);
			k(r), B(() => {
				Y(i, "src", U(o)), Y(i, "alt", U(n).name || t.selection.path);
			}), K(e, r);
		}, S = (e) => {
			var r = Ao(), i = L(r);
			X(i, { name: "file-warning" });
			var a = z(i), o = L(a, !0);
			k(a);
			var s = z(a), c = L(s);
			k(s), k(r), B((e) => {
				q(o, U(n).name || t.selection.path), q(c, `Binary file, ${e ?? ""}.`);
			}, [() => yo(U(n).size || 0)]), K(e, r);
		}, C = (e) => {
			var t = jo();
			Jr(t, () => ho(U(n)?.content || ""), !0), k(t), K(e, t);
		}, w = /* @__PURE__ */ N(() => mo(U(n)?.path || t.selection.path)), T = (e) => {
			var t = Mo(), r = L(t, !0);
			k(t), B(() => q(r, U(n)?.content || "")), K(e, t);
		};
		J(v, (e) => {
			U(r) ? e(y) : U(i) ? e(b, 1) : U(n)?.image ? e(x, 2) : U(n)?.binary ? e(S, 3) : U(w) ? e(C, 4) : e(T, -1);
		}), k(c), k(a), B((e, r) => {
			Y(c, "data-preview-identity", `${t.workspaceId}:${t.resourceId}:${t.selection.section}:${t.selection.path}:${U(n)?.contentHash || "pending"}`), q(f, e), q(m, `${t.selection.path ?? ""}${r ?? ""}${U(n)?.truncated ? " · truncated" : ""}`), Y(g, "href", U(o));
		}, [() => U(n)?.name || t.selection.path.split("/").pop() || "File preview", () => U(n)?.size == null ? "" : ` · ${yo(U(n).size)}`]), W("click", s, function(...e) {
			t.onClose?.apply(this, e);
		}), W("click", _, function(...e) {
			t.onClose?.apply(this, e);
		}), K(e, a);
	};
	J(c, (e) => {
		t.selection && e(l);
	}), K(e, s), M();
}
xr(["click"]);
//#endregion
//#region src/components/LogTimeline.svelte
var Fo = /* @__PURE__ */ G("<div class=\"markdown-rendered\"></div>"), Io = /* @__PURE__ */ G("<details class=\"log-entry\"><summary><span class=\"log-time\"><strong> </strong><small> </small></span> <span class=\"log-title\"> </span> <span class=\"log-chevron\" aria-hidden=\"true\"><!></span></summary> <div><!></div></details>"), Lo = /* @__PURE__ */ G("<p class=\"log-load-error\" role=\"alert\"> </p>"), Ro = /* @__PURE__ */ G("<div class=\"log-load-actions\"><button type=\"button\" class=\"secondary-button log-load-more\"><!><span> </span></button></div>"), zo = /* @__PURE__ */ G("<div class=\"content-section\" data-component-owner=\"log-timeline\"><h3><!><span>Log</span></h3> <div class=\"log-timeline\"></div> <!> <!></div>");
function Bo(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => [...t.logs || []].sort(_o)), r = /* @__PURE__ */ F(!1);
	async function i() {
		if (!(t.loading || U(r))) {
			I(r, !0);
			try {
				await t.onLoadMore();
			} finally {
				I(r, !1), queueMicrotask(t.onIconsChanged);
			}
		}
	}
	var a = kr(), o = R(a), s = (e) => {
		var a = zo(), o = L(a);
		X(L(o), { name: "history" }), A(), k(o);
		var s = z(o, 2);
		Hr(s, 21, () => U(n), (e) => e.id, (e, t) => {
			var n = Io(), r = L(n), i = L(r), a = L(i), o = L(a, !0);
			k(a);
			var s = z(a), c = L(s, !0);
			k(s), k(i);
			var l = z(i, 2), u = L(l, !0);
			k(l);
			var d = z(l, 2);
			X(L(d), { name: "chevron-right" }), k(d), k(r);
			var f = z(r, 2);
			let p;
			var m = L(f), h = (e) => {
				var n = Fo();
				Jr(n, () => ho(U(t).details), !0), k(n), K(e, n);
			}, g = (e) => {
				K(e, Or("No details."));
			};
			J(m, (e) => {
				U(t).details ? e(h) : e(g, -1);
			}), k(f), k(n), B((e) => {
				Y(n, "data-log-id", U(t).id), Y(i, "title", U(t).time), q(o, e), q(c, U(t).time), q(u, U(t).title || "Untitled log entry"), p = ai(f, 1, "log-details", null, p, { empty: !U(t).details });
			}, [() => vo(U(t).time)]), K(e, n);
		}), k(s);
		var c = z(s, 2), l = (e) => {
			var n = Lo(), r = L(n, !0);
			k(n), B(() => q(r, t.error)), K(e, n);
		};
		J(c, (e) => {
			t.error && e(l);
		});
		var u = z(c, 2), d = (e) => {
			var n = Ro(), a = L(n), o = L(a);
			{
				let e = /* @__PURE__ */ N(() => t.loading || U(r) ? "loader-circle" : "chevron-down"), n = /* @__PURE__ */ N(() => t.loading || U(r) ? "spin" : "");
				X(o, {
					get name() {
						return U(e);
					},
					get className() {
						return U(n);
					}
				});
			}
			var s = z(o), c = L(s, !0);
			k(s), k(a), k(n), B(() => {
				a.disabled = t.loading || U(r), Y(a, "aria-busy", t.loading || U(r)), q(c, t.loading || U(r) ? "Loading older logs..." : t.error ? "Retry" : "Load More");
			}), W("click", a, i), K(e, n);
		};
		J(u, (e) => {
			t.hasMore && e(d);
		}), k(a), B(() => Y(a, "data-log-resource", t.resourceId)), K(e, a);
	};
	J(o, (e) => {
		(U(n).length || t.error || t.hasMore) && e(s);
	}), K(e, a), M();
}
xr(["click"]);
//#endregion
//#region src/components/MarkdownDocument.svelte
var Vo = /* @__PURE__ */ G("<a class=\"markdown-open-file\" target=\"_blank\" rel=\"noopener\" title=\"Open file in new window\"><!><span>Open</span></a>"), Ho = /* @__PURE__ */ G("<div class=\"markdown-preview\"><div class=\"markdown-view markdown-rendered\"></div></div>"), Uo = /* @__PURE__ */ G("<pre class=\"markdown-view\"> </pre>"), Wo = /* @__PURE__ */ G("<div class=\"content-section\" data-component-owner=\"markdown-document\"><h3><!><span> </span> <!></h3> <!></div>");
function Go(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => mo(t.file.name)), r = /* @__PURE__ */ N(() => `/api/workspaces/${encodeURIComponent(t.workspaceId)}/files/raw?path=${encodeURIComponent(t.file.path || "")}`);
	var i = Wo(), a = L(i), o = L(a);
	X(o, { name: "file-text" });
	var s = z(o), c = L(s, !0);
	k(s);
	var l = z(s, 2), u = (e) => {
		var n = Vo();
		X(L(n), { name: "external-link" }), A(), k(n), B(() => {
			Y(n, "href", U(r)), Y(n, "aria-label", `Open ${t.file.name} in new window`);
		}), K(e, n);
	};
	J(l, (e) => {
		U(n) && t.file.path && e(u);
	}), k(a);
	var d = z(a, 2), f = (e) => {
		var n = Ho(), r = L(n);
		Jr(r, () => ho(t.file.content || ""), !0), k(r), k(n), K(e, n);
	}, p = (e) => {
		var n = Uo(), r = L(n, !0);
		k(n), B(() => q(r, t.file.content || "")), K(e, n);
	};
	J(d, (e) => {
		U(n) ? e(f) : e(p, -1);
	}), k(i), B(() => {
		Y(i, "data-doc-file", t.file.name), Y(i, "data-document-identity", `${t.workspaceId}:${t.file.path || t.file.name}:preview:${t.file.contentHash || "unversioned"}`), q(c, t.file.name);
	}), K(e, i), M();
}
//#endregion
//#region src/components/WorkspaceAgentsEditor.svelte
var Ko = /* @__PURE__ */ G("<div class=\"empty-state\"><!><strong>Loading AGENTS.md...</strong></div>"), qo = /* @__PURE__ */ G("<div class=\"file-modal-empty error-preview\"><!><strong>AGENTS.md unavailable</strong><span> </span></div>"), Jo = /* @__PURE__ */ G("<p class=\"log-load-error\" role=\"alert\">AGENTS.md changed on disk while you were editing. Your draft is preserved; saving now will report a conflict.</p>"), Yo = /* @__PURE__ */ G("<p class=\"log-load-error\" role=\"alert\"> </p>"), Xo = /* @__PURE__ */ G("<form id=\"workspaceAgentsForm\" class=\"details-form workspace-agents-form\"><textarea id=\"workspaceAgentsContent\" rows=\"10\" spellcheck=\"false\"></textarea> <!> <!> <div class=\"form-actions\"><button type=\"submit\"><!><span> </span></button></div></form>"), Zo = /* @__PURE__ */ G("<div class=\"content-section\" data-component-owner=\"workspace-agents-editor\"><h3><!><span>Workspace AGENTS.md</span></h3> <!></div>");
function Qo(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(""), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(""), s = /* @__PURE__ */ F(!1), c = /* @__PURE__ */ F(""), l = /* @__PURE__ */ N(() => U(r) !== U(i)), u = /* @__PURE__ */ N(() => !!(U(l) && U(o) && U(a) && U(o) !== U(a)));
	yn(() => {
		let e = go(t.file?.content || ""), u = t.file?.contentHash || "";
		I(o, u, !0), t.identity === U(n) ? !U(l) && u !== U(a) && (I(r, e, !0), I(i, e, !0), I(a, u, !0)) : (I(n, t.identity, !0), I(r, e, !0), I(i, e, !0), I(a, u, !0), I(c, ""), I(s, !1));
	});
	async function d(e) {
		if (e.preventDefault(), U(s) || !U(l)) return;
		let u = U(n);
		I(s, !0), I(c, "");
		try {
			let e = await t.onSave(U(r), U(a));
			if (U(n) !== u) return;
			I(i, go(e.content || U(r)), !0), I(r, U(i), !0), I(a, e.contentHash || "", !0), I(o, U(a), !0), t.onToast("Workspace AGENTS.md saved.");
		} catch (e) {
			U(n) === u && I(c, e instanceof Error ? e.message : String(e), !0);
		} finally {
			U(n) === u && (I(s, !1), queueMicrotask(t.onIconsChanged));
		}
	}
	var f = Zo(), p = L(f);
	X(L(p), { name: "file-text" }), A(), k(p);
	var m = z(p, 2), h = (e) => {
		var t = Ko();
		X(L(t), {
			name: "loader-circle",
			className: "empty-state-icon"
		}), A(), k(t), K(e, t);
	}, g = (e) => {
		var n = qo(), r = L(n);
		X(r, { name: "triangle-alert" });
		var i = z(r, 2), a = L(i, !0);
		k(i), k(n), B(() => q(a, t.file.error)), K(e, n);
	}, _ = (e) => {
		var t = Xo(), n = L(t);
		rt(n);
		var i = z(n, 2), a = (e) => {
			K(e, Jo());
		};
		J(i, (e) => {
			U(u) && e(a);
		});
		var o = z(i, 2), f = (e) => {
			var t = Yo(), n = L(t, !0);
			k(t), B(() => q(n, U(c))), K(e, t);
		};
		J(o, (e) => {
			U(c) && e(f);
		});
		var p = z(o, 2), m = L(p), h = L(m);
		{
			let e = /* @__PURE__ */ N(() => U(s) ? "loader-circle" : "save");
			X(h, { get name() {
				return U(e);
			} });
		}
		var g = z(h), _ = L(g, !0);
		k(g), k(m), k(p), k(t), B(() => {
			n.disabled = U(s), m.disabled = U(s) || !U(l), q(_, U(s) ? "Saving" : "Save");
		}), br("submit", t, d), Si(n, () => U(r), (e) => I(r, e)), K(e, t);
	};
	J(m, (e) => {
		t.file ? t.file.error ? e(g, 1) : e(_, -1) : e(h);
	}), k(f), K(e, f), M();
}
//#endregion
//#region src/components/DetailPanel.svelte
var $o = /* @__PURE__ */ G("<option> </option>"), es = /* @__PURE__ */ G("<div class=\"resource-agent-binding\" aria-label=\"Resource agent binding\"><select aria-label=\"Binding kind\"><option>Profile</option><option>Agent</option></select> <select aria-label=\"Binding target\"></select> <button type=\"button\" class=\"secondary\"><!><span> </span></button></div>"), ts = /* @__PURE__ */ G("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>No workspace selected</strong><span>Add an AgentWorkspace path in the sidebar.</span></div></div>"), ns = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty error-preview wiki-status\"><!><strong>Wiki unavailable</strong><span> </span></div></div>"), rs = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Wiki</span></h3><div class=\"file-modal-empty wiki-status\"><!><strong>Wiki not initialized</strong><span>Run forge migrate to create wiki/index.md.</span></div></div>"), is = /* @__PURE__ */ G("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav><div class=\"title-row\"><h1> </h1><!></div></div> <div id=\"detailsContent\" class=\"details-content\"><!> <!></div>", 1), as = /* @__PURE__ */ G("<span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link\"> </button>", 1), os = /* @__PURE__ */ G("<button type=\"button\" id=\"newTaskButton\"><!><span>New Task</span></button>"), ss = /* @__PURE__ */ G("<div class=\"details-actions\"><!><!><button type=\"button\" class=\"danger\" id=\"archiveButton\"><!><span>Archive</span></button></div>"), cs = /* @__PURE__ */ G("<div id=\"detailsContent\" class=\"details-content\"><div class=\"empty-state\"><!><strong>Loading details...</strong></div></div>"), ls = /* @__PURE__ */ G("<span class=\"details-tab-count\"> </span>"), us = /* @__PURE__ */ G("<button type=\"button\" role=\"tab\"><span> </span><!></button>"), ds = /* @__PURE__ */ G("<div><!></div>"), fs = /* @__PURE__ */ G("<button type=\"button\"><!><span><strong> </strong><small> </small></span><!></button>"), ps = /* @__PURE__ */ G("<div class=\"empty-list-row\"><!><span>No task templates in templates/*.md.</span></div>"), ms = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Task Templates</span></h3><div class=\"template-list\"><!></div></div>"), hs = /* @__PURE__ */ G("<div class=\"content-section\"><h3><!><span>Template</span></h3><div class=\"template-list\"><div class=\"template-row\"><!><span><strong> </strong><small> </small></span></div></div></div>"), gs = /* @__PURE__ */ G("<div class=\"worktree-row\"><div class=\"worktree-main\"><!><div><strong> </strong><span> </span><small> </small></div></div><button type=\"button\" class=\"secondary-button\"><!><span>View Diff</span></button></div>"), _s = /* @__PURE__ */ G("<div class=\"empty-list-row\"><!><span>No worktrees.</span></div>"), vs = /* @__PURE__ */ G("<div class=\"details-tabs\" role=\"tablist\" aria-label=\"Resource details\"></div> <div id=\"detailsContent\" class=\"details-content\"><!> <div><!></div> <div><!></div> <div><!></div> <div><div class=\"content-section\"><h3><!><span>Worktrees</span></h3><div class=\"worktree-list\"><!></div></div></div></div>", 1), ys = /* @__PURE__ */ G("<div class=\"details-header\"><nav class=\"breadcrumb\" aria-label=\"Location\"><button type=\"button\" class=\"breadcrumb-link\"> </button> <!> <span class=\"breadcrumb-separator\">/</span><button type=\"button\" class=\"breadcrumb-link current\"> </button></nav> <div class=\"title-row\"><h1> <code class=\"resource-ref-badge\"> </code></h1><!></div></div> <!>", 1), bs = /* @__PURE__ */ G("<!> <!> <!>", 1);
function xs(e, t) {
	j(t, !0);
	let n = (e) => {
		var t = es(), n = L(t), i = L(n);
		i.value = i.__value = "profile";
		var a = z(i);
		a.value = a.__value = "agent", k(n);
		var o;
		li(n);
		var s = z(n, 2);
		Hr(s, 21, ee, Rr, (e, t) => {
			var n = $o(), r = L(n, !0);
			k(n);
			var i = {};
			B(() => {
				q(r, U(t).label), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
			}), K(e, n);
		}), k(s);
		var c;
		li(s);
		var f = z(s, 2), p = L(f);
		{
			let e = /* @__PURE__ */ N(() => U(d) ? "loader-circle" : "save");
			X(p, { get name() {
				return U(e);
			} });
		}
		var m = z(p), h = L(m, !0);
		k(m), k(f), k(t), B(() => {
			o !== (o = U(l)) && (n.value = (n.__value = U(l)) ?? "", ci(n, U(l))), c !== (c = U(u)) && (s.value = (s.__value = U(u)) ?? "", ci(s, U(u))), f.disabled = U(d) || !U(u) || U(l) === U(r).agentBinding.kind && U(u) === U(r).agentBinding.name, q(h, U(d) ? "Saving" : "Bind");
		}), W("change", n, (e) => te(e.currentTarget.value)), W("change", s, (e) => I(u, e.currentTarget.value, !0)), W("click", f, ne), K(e, t);
	}, r = /* @__PURE__ */ F(Qt(t.channel.current())), i = /* @__PURE__ */ F(""), a = /* @__PURE__ */ F(""), o = /* @__PURE__ */ F(Qt(/* @__PURE__ */ new Set())), s = /* @__PURE__ */ F(null), c = /* @__PURE__ */ F(null), l = /* @__PURE__ */ F("profile"), u = /* @__PURE__ */ F("default"), d = /* @__PURE__ */ F(!1), f = /* @__PURE__ */ new Map(), p = new io(), m = /* @__PURE__ */ N(() => (U(r).detail?.files || []).filter((e) => e.name !== "AGENTS.md")), h = /* @__PURE__ */ N(() => new Set(U(m).map((e) => e.name))), g = /* @__PURE__ */ N(y), _ = /* @__PURE__ */ N(() => U(s) ? `${U(s).section}:${U(s).path}` : "");
	ki(() => t.channel.subscribe((e) => {
		if (I(r, e, !0), e.identity !== U(i)) {
			U(i) && U(a) && f.set(U(i), U(a)), I(i, e.identity, !0), I(s, null), I(c, null), I(o, /* @__PURE__ */ new Set(), !0), I(a, f.get(U(i)) || v(e), !0), I(l, e.agentBinding.kind, !0), I(u, e.agentBinding.name, !0), I(d, !1);
			let t = document.getElementById("detailsContent");
			t && (t.scrollTop = 0);
		} else U(g).length && !U(g).some((e) => e.id === U(a)) && I(a, U(g)[0].id, !0);
		queueMicrotask(e.onIconsChanged);
	})), ki(() => {
		let e = (e) => {
			e.key === "Escape" && (U(c) ? (e.preventDefault(), I(c, null)) : U(s) && (e.preventDefault(), I(s, null)));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	}), Ai(() => p.dispose());
	function v(e) {
		let t = (e.detail?.files || []).filter((e) => e.name !== "AGENTS.md");
		return e.resourceType === "project" && t.some((e) => e.name === "project.md") ? "project" : t.some((e) => e.name === "task.md") ? "task" : t.some((e) => e.name === "work.md") ? "work" : e.resourceType === "project" ? "project" : e.resourceType === "task" ? "task" : "logs";
	}
	function y() {
		if (!U(r).detail) return [];
		let e = [];
		return U(h).has("project.md") && e.push({
			id: "project",
			label: "Project"
		}), U(h).has("task.md") && e.push({
			id: "task",
			label: "Task"
		}), U(h).has("work.md") && e.push({
			id: "work",
			label: "Work"
		}), (U(r).resourceType === "project" || U(r).detail.template) && e.push({
			id: "template",
			label: "Template"
		}), e.push({
			id: "logs",
			label: "Logs"
		}, {
			id: "artifacts",
			label: "Artifacts"
		}), U(r).resourceType === "task" && e.push({
			id: "worktrees",
			label: "Worktrees"
		}), e;
	}
	function b(e) {
		return e.name === "project.md" ? "project" : e.name === "task.md" ? "task" : e.name === "work.md" ? "work" : U(g).find((e) => [
			"project",
			"task",
			"work"
		].includes(e.id))?.id || "";
	}
	function x(e) {
		I(a, e, !0), f.set(U(i), e);
	}
	function S(e) {
		let t = e.includes(".") ? e.slice(e.lastIndexOf(".") + 1) : e, n = t.match(/^(?:project|task)(\d+)$/);
		return `#${n ? n[1] : t}`;
	}
	function C(e) {
		let t = new Set(U(o));
		t.has(e) ? t.delete(e) : t.add(e), I(o, t, !0), queueMicrotask(U(r).onIconsChanged);
	}
	function w(e, t, n = !1) {
		let i = e === "Wiki" ? "wiki/files/raw" : "files/raw", a = n ? "&download=1" : "";
		return `/api/workspaces/${encodeURIComponent(U(r).workspaceId)}/${i}?path=${encodeURIComponent(t)}${a}`;
	}
	function T(e, t) {
		I(s, {
			section: e,
			path: t
		}, !0);
	}
	function E(e) {
		e && U(r).onToast(e);
	}
	function ee(e = U(l)) {
		return e === "profile" ? U(r).agentProfiles.map((e) => ({
			id: e.key,
			label: e.description ? `${e.key} — ${e.description}` : e.key
		})) : U(r).agents.map((e) => ({
			id: e.id,
			label: e.label
		}));
	}
	function te(e) {
		I(l, e, !0);
		let t = ee(e);
		t.some((e) => e.id === U(u)) || I(u, t[0]?.id || "", !0);
	}
	async function ne() {
		if (!(!U(u) || U(d))) {
			I(d, !0);
			try {
				await U(r).onSaveAgentBinding({
					kind: U(l),
					name: U(u)
				});
			} catch (e) {
				E(e instanceof Error ? e.message : String(e));
			} finally {
				I(d, !1);
			}
		}
	}
	var re = bs(), ie = R(re), ae = (e) => {
		var t = ts(), n = L(t);
		X(L(n), {
			name: "folder-search",
			className: "empty-state-icon"
		}), A(2), k(n), k(t), K(e, t);
	}, oe = (e) => {
		var t = is(), i = R(t), a = L(i), s = L(a), c = L(s, !0);
		k(s), k(a);
		var l = z(a), u = L(l), d = L(u, !0);
		k(u);
		var f = z(u);
		n(f), k(l), k(i);
		var p = z(i, 2), m = L(p);
		Qo(m, {
			get identity() {
				return U(r).identity;
			},
			get file() {
				return U(r).workspaceAgents;
			},
			get onSave() {
				return U(r).onSaveWorkspaceAgents;
			},
			get onToast() {
				return U(r).onToast;
			},
			get onIconsChanged() {
				return U(r).onIconsChanged;
			}
		});
		var h = z(m, 2), g = (e) => {
			var t = ns(), n = L(t);
			X(L(n), { name: "book-open" }), A(), k(n);
			var i = z(n), a = L(i);
			X(a, { name: "triangle-alert" });
			var o = z(a, 2), s = L(o, !0);
			k(o), k(i), k(t), B(() => q(s, U(r).wiki.error)), K(e, t);
		}, v = (e) => {
			var t = rs(), n = L(t);
			X(L(n), { name: "book-open" }), A(), k(n);
			var r = z(n);
			X(L(r), { name: "book-open" }), A(2), k(r), k(t), K(e, t);
		}, y = (e) => {
			{
				let t = /* @__PURE__ */ N(() => U(r).wiki.entries || []);
				Eo(e, {
					title: "Wiki",
					get entries() {
						return U(t);
					},
					emptyMessage: "No Wiki files yet.",
					get expanded() {
						return U(o);
					},
					get activePath() {
						return U(_);
					},
					onToggle: C,
					onPreview: T,
					rawURL: w
				});
			}
		};
		J(h, (e) => {
			U(r).wiki?.error ? e(g) : U(r).wiki?.exists ? e(y, -1) : e(v, 1);
		}), k(p), B(() => {
			q(c, U(r).workspaceName), q(d, U(r).workspaceName);
		}), W("click", s, () => U(r).onNavigate("workspace")), K(e, t);
	}, se = (e) => {
		var t = ys(), i = R(t), s = L(i), l = L(s), u = L(l, !0);
		k(l);
		var d = z(l, 2), f = (e) => {
			var t = as(), n = z(R(t)), i = L(n, !0);
			k(n), B(() => q(i, U(r).parent.title)), W("click", n, () => U(r).onNavigate(U(r).parent?.id || "workspace")), K(e, t);
		};
		J(d, (e) => {
			U(r).parent && e(f);
		});
		var p = z(d, 3), h = L(p, !0);
		k(p), k(s);
		var v = z(s, 2), y = L(v), E = L(y, !0), ee = z(E), te = L(ee, !0);
		k(ee), k(y);
		var ne = z(y), re = (e) => {
			var t = ss(), i = L(t);
			n(i);
			var a = z(i), o = (e) => {
				var t = os();
				X(L(t), { name: "plus" }), A(), k(t), W("click", t, () => U(r).onCreateTask(U(r).resourceId)), K(e, t);
			};
			J(a, (e) => {
				U(r).resourceType === "project" && e(o);
			});
			var s = z(a);
			X(L(s), { name: "archive" }), A(), k(s), k(t), W("click", s, () => U(r).onArchive(U(r).resourceId)), K(e, t);
		};
		J(ne, (e) => {
			U(r).detail && e(re);
		}), k(v), k(i);
		var ie = z(i, 2), ae = (e) => {
			var t = cs(), n = L(t);
			X(L(n), {
				name: "loader-circle",
				className: "empty-state-icon"
			}), A(), k(n), k(t), K(e, t);
		}, oe = (e) => {
			var t = vs(), n = R(t);
			Hr(n, 21, () => U(g), (e) => e.id, (e, t) => {
				var n = us();
				let i;
				var o = L(n), s = L(o, !0);
				k(o);
				var c = z(o), l = (e) => {
					var t = ls(), n = L(t, !0);
					k(t), B(() => q(n, U(r).detail.logs.length)), K(e, t);
				};
				J(c, (e) => {
					U(t).id === "logs" && U(r).detail.logs?.length && e(l);
				}), k(n), B(() => {
					i = ai(n, 1, "details-tab", null, i, { active: U(a) === U(t).id }), Y(n, "aria-selected", U(a) === U(t).id), q(s, U(t).label);
				}), W("click", n, () => x(U(t).id)), K(e, n);
			}), k(n);
			var i = z(n, 2), s = L(i);
			Hr(s, 17, () => U(m), (e) => e.path || e.name, (e, t) => {
				var n = ds();
				Go(L(n), {
					get file() {
						return U(t);
					},
					get workspaceId() {
						return U(r).workspaceId;
					}
				}), k(n), B((e) => Y(n, "hidden", e), [() => U(a) !== b(U(t))]), K(e, n);
			});
			var l = z(s, 2), u = L(l), d = (e) => {
				var t = ms(), n = L(t);
				X(L(n), { name: "layout-template" }), A(), k(n);
				var i = z(n), a = L(i), o = (e) => {
					var t = kr();
					Hr(R(t), 17, () => U(r).detail.templates, (e) => e.name, (e, t) => {
						var n = fs();
						let r;
						var i = L(n);
						X(i, { name: "file-text" });
						var a = z(i), o = L(a), s = L(o, !0);
						k(o);
						var c = z(o), l = L(c);
						k(c), k(a), X(z(a), { name: "chevron-right" }), k(n), B(() => {
							r = ai(n, 1, "template-row", null, r, { invalid: !U(t).valid }), q(s, U(t).title || U(t).name), q(l, `${U(t).name ?? ""} · v${(U(t).schemaVersion || "?") ?? ""} · ${U(t).valid ? `${(U(t).fields || []).length} fields` : `invalid${U(t).errors?.[0]?.message ? `: ${U(t).errors[0].message}` : ""}`}${U(t).legacy ? " · legacy" : ""}`);
						}), W("click", n, () => U(t).path && T("Templates", U(t).path)), K(e, n);
					}), K(e, t);
				}, s = (e) => {
					var t = ps();
					X(L(t), { name: "layout-template" }), A(), k(t), K(e, t);
				};
				J(a, (e) => {
					U(r).detail.templates?.length ? e(o) : e(s, -1);
				}), k(i), k(t), K(e, t);
			}, f = (e) => {
				var t = hs(), n = L(t);
				X(L(n), { name: "layout-template" }), A(), k(n);
				var i = z(n), a = L(i), o = L(a);
				X(o, { name: "file-text" });
				var s = z(o), c = L(s), l = L(c, !0);
				k(c);
				var u = z(c), d = L(u);
				k(u), k(s), k(a), k(i), k(t), B(() => {
					q(l, U(r).detail.template.name), q(d, `Created from template · v${(U(r).detail.template.schemaVersion || "?") ?? ""} · ${(U(r).detail.template.digest || "") ?? ""}`);
				}), K(e, t);
			};
			J(u, (e) => {
				U(r).resourceType === "project" ? e(d) : U(r).detail.template && e(f, 1);
			}), k(l);
			var p = z(l, 2), h = L(p);
			{
				let e = /* @__PURE__ */ N(() => U(r).detail.logs || []);
				Bo(h, {
					get resourceId() {
						return U(r).resourceId;
					},
					get logs() {
						return U(e);
					},
					get hasMore() {
						return U(r).logs.hasMore;
					},
					get loading() {
						return U(r).logs.loading;
					},
					get error() {
						return U(r).logs.error;
					},
					onLoadMore: () => U(r).onLoadMoreLogs(U(r).resourceId),
					get onIconsChanged() {
						return U(r).onIconsChanged;
					}
				});
			}
			k(p);
			var v = z(p, 2), y = L(v);
			{
				let e = /* @__PURE__ */ N(() => U(r).detail.artifacts || []);
				Eo(y, {
					title: "Artifacts",
					get entries() {
						return U(e);
					},
					emptyMessage: "No artifacts.",
					get expanded() {
						return U(o);
					},
					get activePath() {
						return U(_);
					},
					onToggle: C,
					onPreview: T,
					rawURL: w
				});
			}
			k(v);
			var S = z(v, 2), E = L(S), ee = L(E);
			X(L(ee), { name: "folder-git-2" }), A(), k(ee);
			var te = z(ee), ne = L(te), re = (e) => {
				var t = kr();
				Hr(R(t), 17, () => U(r).detail.repos, (e) => `${e.name}:${e.worktreePath}`, (e, t) => {
					var n = gs(), r = L(n), i = L(r);
					X(i, {
						name: "git-branch",
						className: "worktree-icon"
					});
					var a = z(i), o = L(a), s = L(o, !0);
					k(o);
					var l = z(o), u = L(l);
					k(l);
					var d = z(l), f = L(d, !0);
					k(d), k(a), k(r);
					var p = z(r);
					X(L(p), { name: "git-compare-arrows" }), A(), k(p), k(n), B(() => {
						q(s, U(t).branch || "HEAD"), q(u, `${(U(t).name || "repository") ?? ""}${U(t).targetBranch || U(t).baseBranch ? ` · base ${U(t).targetBranch || U(t).baseBranch}` : ""}`), q(f, U(t).worktreePath || "");
					}), W("click", p, () => I(c, U(t), !0)), K(e, n);
				}), K(e, t);
			}, ie = (e) => {
				var t = _s();
				X(L(t), { name: "git-branch" }), A(), k(t), K(e, t);
			};
			J(ne, (e) => {
				U(r).detail.repos?.length ? e(re) : e(ie, -1);
			}), k(te), k(E), k(S), k(i), B(() => {
				Y(l, "hidden", U(a) !== "template"), Y(p, "hidden", U(a) !== "logs"), Y(v, "hidden", U(a) !== "artifacts"), Y(S, "hidden", U(a) !== "worktrees");
			}), K(e, t);
		};
		J(ie, (e) => {
			U(r).loading || !U(r).detail ? e(ae) : e(oe, -1);
		}), B((e) => {
			q(u, U(r).workspaceName), q(h, U(r).resourceTitle), q(E, U(r).resourceTitle), q(te, e);
		}, [() => S(U(r).resourceId)]), W("click", l, () => U(r).onNavigate("workspace")), W("click", p, () => U(r).onNavigate(U(r).resourceId)), K(e, t);
	};
	J(ie, (e) => {
		U(r).workspaceId ? U(r).resourceType === "workspace" ? e(oe, 1) : e(se, -1) : e(ae);
	});
	var ce = z(ie, 2);
	Po(ce, {
		get client() {
			return p;
		},
		get workspaceId() {
			return U(r).workspaceId;
		},
		get resourceId() {
			return U(r).resourceId;
		},
		get selection() {
			return U(s);
		},
		onClose: () => I(s, null),
		onError: E,
		get onIconsChanged() {
			return U(r).onIconsChanged;
		}
	}), po(z(ce, 2), {
		get client() {
			return p;
		},
		get workspaceId() {
			return U(r).workspaceId;
		},
		get resourceId() {
			return U(r).resourceId;
		},
		get repo() {
			return U(c);
		},
		onClose: () => I(c, null),
		onError: E,
		get onIconsChanged() {
			return U(r).onIconsChanged;
		}
	}), K(e, re), M();
}
xr(["change", "click"]);
//#endregion
//#region src/components/ApprovalCard.svelte
var Ss = /* @__PURE__ */ G("<p class=\"approval-question\"> </p>"), Cs = /* @__PURE__ */ G("<p> </p>"), ws = /* @__PURE__ */ G("<button> </button>"), Ts = /* @__PURE__ */ G("<div class=\"approval-options\"></div>"), Es = /* @__PURE__ */ G("<div class=\"approval-actions\"><button><!><span>Allow once</span></button><button class=\"secondary-button\"><!><span>Decline</span></button></div>"), Ds = /* @__PURE__ */ G("<form class=\"approval-reply\"><input placeholder=\"Reply with a custom answer…\" aria-label=\"Custom reply\"/><button type=\"submit\">Send</button></form>"), Os = /* @__PURE__ */ G("<!> <!>", 1), ks = /* @__PURE__ */ G("<div data-component-owner=\"event-timeline\" class=\"agent-event approval\"><div><!><strong> </strong></div> <!> <!> <!></div>");
function As(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(""), r = /* @__PURE__ */ F(!1), i = /* @__PURE__ */ F(Qt(a()));
	yn(() => {
		let e = a();
		e !== U(i) && (I(i, e, !0), I(n, ""), I(r, !1));
	});
	function a() {
		return `${t.contextIdentity}:${String(t.item.approvalId || "")}`;
	}
	async function o(e) {
		let i = String(t.item.approvalId || "");
		if (!(!i || U(r))) {
			I(r, !0);
			try {
				await t.onApproval(t.runId, i, e), I(n, "");
			} catch (e) {
				t.onToast(e instanceof Error ? e.message : String(e));
			} finally {
				I(r, !1);
			}
		}
	}
	function s(e) {
		return e.name || String(e.kind || "").replace(/[_-]+/g, " ").trim() || e.optionId;
	}
	var c = ks(), l = L(c), u = L(l);
	X(u, { name: "shield-question" });
	var d = z(u), f = L(d, !0);
	k(d), k(l);
	var p = z(l, 2), m = (e) => {
		var n = Ss(), r = L(n, !0);
		k(n), B(() => q(r, t.item.question)), K(e, n);
	};
	J(p, (e) => {
		t.item.question && e(m);
	});
	var h = z(p, 2), g = (e) => {
		var n = Cs(), r = L(n, !0);
		k(n), B(() => q(r, t.item.detail)), K(e, n);
	};
	J(h, (e) => {
		t.item.detail && e(g);
	});
	var _ = z(h, 2), v = (e) => {
		var i = Os(), a = R(i), c = (e) => {
			var n = Ts();
			Hr(n, 21, () => t.item.options, (e) => e.optionId, (e, t) => {
				var n = ws();
				let i;
				var a = L(n, !0);
				k(n), B((e, t) => {
					n.disabled = U(r), i = ai(n, 1, "", null, i, e), q(a, t);
				}, [() => ({ "secondary-button": String(U(t).kind || "").startsWith("reject") }), () => s(U(t))]), W("click", n, () => o({ optionId: U(t).optionId })), K(e, n);
			}), k(n), K(e, n);
		}, l = (e) => {
			var t = Es(), n = L(t);
			X(L(n), { name: "check" }), A(), k(n);
			var i = z(n);
			X(L(i), { name: "x" }), A(), k(i), k(t), B(() => {
				n.disabled = U(r), i.disabled = U(r);
			}), W("click", n, () => o({ decision: "accept" })), W("click", i, () => o({ decision: "decline" })), K(e, t);
		};
		J(a, (e) => {
			t.item.options?.length ? e(c) : e(l, -1);
		});
		var u = z(a, 2), d = (e) => {
			var t = Ds(), i = L(t);
			gi(i);
			var a = z(i);
			k(t), B((e) => a.disabled = e, [() => !U(n).trim() || U(r)]), br("submit", t, (e) => {
				e.preventDefault(), U(n).trim() && o({ text: U(n).trim() });
			}), Si(i, () => U(n), (e) => I(n, e)), K(e, t);
		};
		J(u, (e) => {
			t.item.question && e(d);
		}), K(e, i);
	}, y = (e) => {
		var n = Cs(), r = L(n);
		k(n), B(() => q(r, `${(t.item.decision || (t.item.status === "accepted" ? "Allowed" : "Declined")) ?? ""}${t.item.reply ? `: ${t.item.reply}` : ""}`)), K(e, n);
	};
	J(_, (e) => {
		t.item.status === "pending" ? e(v) : e(y, -1);
	}), k(c), B(() => q(f, t.item.title || "Approval requested")), K(e, c), M();
}
xr(["click"]);
//#endregion
//#region src/components/timeline-events.ts
function js(e) {
	let t = /* @__PURE__ */ new Map();
	for (let n of e) {
		let e = Number(n?.id) || 0;
		if (!e) continue;
		let r = t.get(e);
		t.set(e, r ? zs(r, n) : Bs(n));
	}
	return [...t.values()].sort((e, t) => Number(e.id) - Number(t.id));
}
function Ms(e, t) {
	if (!t.length) return e;
	let n = [...e];
	for (let e of t) Ns(n, e);
	return n;
}
function Ns(e, t) {
	let n = Number(t?.id) || 0;
	if (!n) return;
	let r = 0, i = e.length;
	for (; r < i;) {
		let t = r + i >>> 1;
		Number(e[t].id) < n ? r = t + 1 : i = t;
	}
	let a = r < e.length && Number(e[r].id) === n ? r : -1;
	if (a < 0) {
		e.splice(r, 0, Bs(t));
		return;
	}
	e[a] = zs(e[a], t);
}
function Ps(e) {
	let t = [], n = /* @__PURE__ */ new Map(), r = () => {
		n.size && (t.push(...[...n.values()].sort((e, t) => Number(e.id) - Number(t.id))), n = /* @__PURE__ */ new Map());
	};
	for (let i of e) {
		let e = Fs(i);
		if (e) {
			let t = n.get(e);
			n.set(e, t ? Is(t, i) : i);
			continue;
		}
		r(), t.push(i);
	}
	return r(), t;
}
function Fs(e) {
	if (e.type !== "tool.event") return "";
	let t = Ls(e.data?.raw), n = t.update && typeof t.update == "object" && !Array.isArray(t.update) ? Ls(t.update) : t;
	return n.sessionUpdate === "tool_call_update" ? Rs(n.toolCallId) || Rs(n.id) : "";
}
function Is(e, t) {
	let n = e.data || {}, r = t.data || {}, i = Ls(n.raw), a = Ls(r.raw), o = i.update && typeof i.update == "object" && !Array.isArray(i.update) ? Ls(i.update) : i, s = a.update && typeof a.update == "object" && !Array.isArray(a.update) ? Ls(a.update) : a;
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
function Ls(e) {
	return e && typeof e == "object" && !Array.isArray(e) ? e : {};
}
function Rs(e) {
	return typeof e == "string" ? e.trim() : "";
}
function zs(e, t) {
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
function Bs(e) {
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
var Vs = 20, Hs = 250, Us = 80, Ws = /* @__PURE__ */ new Set(["session.launch-environment"]), Gs = class {
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
		this.api = e.api ?? new io(), this.eventSourceFactory = e.eventSourceFactory ?? ((e) => new EventSource(e)), this.onEvent = e.onEvent, this.onNotice = e.onNotice, this.streamBatchWindowMs = Math.max(0, e.streamBatchWindowMs ?? Us);
	}
	subscribe(e) {
		return this.listeners.add(e), e(this.snapshot()), () => this.listeners.delete(e);
	}
	activate(e, t, n) {
		if (this.disposed) return;
		let r = Js(e, t), i = this.activeKey !== r;
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
			let r = await this.api.latest($s(e, n), { scope: Zs(e, "older") });
			return this.isCurrent(e, t) ? (this.mergePage(e, r), r.segments.some((e) => e.turns?.length || e.gap)) : !1;
		} catch (n) {
			return n instanceof no || !this.isCurrent(e, t) || (e.error = lc(n)), !1;
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
			let r = await this.api.latest(ec(t, e), { scope: Zs(t, `turn:${e}`) });
			if (!this.isCurrent(t, n)) return;
			if (t.details.set(e, r), !r.turn.closed && r.turn.generation.generationId === t.generationId) {
				let i = await this.loadTurnRange(t, r, n);
				if (!this.isCurrent(t, n)) return;
				t.liveEvents.set(e, i);
			}
			this.connect(t);
		} catch (r) {
			if (r instanceof no || !this.isCurrent(t, n)) return;
			t.detailErrors.set(e, lc(r));
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
		o && (r.liveEvents.set(o, Ps(js([...r.liveEvents.get(o) || [], ...a]))), this.emit());
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
			key: Js(e, t),
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
			flushTimer: null
		};
		return this.contexts.set(n.key, n), n;
	}
	async loadInitial(e) {
		if (e.loading) return;
		let t = e.requestGeneration;
		e.loading = !0, e.error = "", this.emit();
		try {
			let n = await this.api.latest($s(e), { scope: Zs(e, "initial") });
			if (!this.isCurrent(e, t)) return;
			e.segments.clear(), e.details.clear(), e.detailErrors.clear(), e.liveEvents.clear(), e.orphanEvents.clear(), this.mergePage(e, n), e.loaded = !0, this.connect(e);
		} catch (n) {
			if (n instanceof no || !this.isCurrent(e, t)) return;
			e.error = lc(n);
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
			n && (e.liveEvents.set(t.reference, Ps(js([...e.liveEvents.get(t.reference) || [], ...n]))), e.orphanEvents.delete(t.turnId));
		}
		e.nextCursor = String(t.page?.nextCursor || ""), e.hasMoreBefore = !!(t.page?.hasMore && e.nextCursor);
	}
	blocks(e) {
		let t = [], n = [...e.segments.values()].sort((e, t) => e.generation.generation - t.generation.generation), r = n.find((t) => t.generation.generationId === e.generationId)?.generation || nc(e), i = r ? this.orphanEventBlocks(e, r) : [];
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
					items: i && !a ? Ks(i, r.generation.generationId) : void 0,
					events: a?.filter((e) => !Ws.has(e.type)),
					loading: e.detailLoading.has(t.reference),
					error: e.detailErrors.get(t.reference)
				});
			}
			r.generation.generationId === e.generationId && n.push(...i), n.sort((e, t) => Xs(e) - Xs(t)), t.push(...n);
		}
		return i.length && !n.some((t) => t.generation.generationId === e.generationId) && t.push(...i), t;
	}
	orphanEventBlocks(e, t) {
		let n = [];
		for (let [r, i] of e.orphanEvents) {
			let a = i.filter((e) => !Ws.has(e.type)), o = [];
			for (let i of a) o.length && Number(i.id) !== Number(o[o.length - 1].id) + 1 && (n.push(Ys(e, r, t, o)), o = []), o.push(i);
			o.length && n.push(Ys(e, r, t, o));
		}
		return n.sort((e, t) => Xs(e) - Xs(t));
	}
	connect(e) {
		if (!this.isActive(e) || e.stream || !e.generationId || !ac(e.status)) return;
		let t = tc(e), n = new URLSearchParams({ generationId: e.generationId });
		t && n.set("after", String(t));
		let r = ++e.streamGeneration, i = this.eventSourceFactory(`${Qs(e)}/stream?${n}`);
		e.stream = i, i.onmessage = (t) => {
			if (this.isActiveStream(e, i, r)) try {
				let n = JSON.parse(t.data);
				if (!this.eventBelongsToContext(e, n)) return;
				e.pendingEvents.push(n), this.onEvent?.(e.workspaceId, e.resourceId, n), this.scheduleEventFlush(e), oc(n) && this.materializeTerminalTurn(e, String(n.turnId || ""), r);
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
				limit: String(Hs)
			}), c = await this.api.latest(`${Qs(e)}/events?${s}`, { scope: Zs(e, i) });
			if (!this.isCurrent(e, r)) return [];
			let l = rc(c.events).filter((t) => this.eventBelongsToContext(e, t));
			o = js([...o, ...l]);
			let u = Number(c.page?.nextAfter) || ic(l);
			if (!c.page?.hasMore || !u || u <= a) break;
			a = u;
		}
		return o;
	}
	async materializeTerminalTurn(e, t, n) {
		this.flushEvents(e, !1);
		for (let r = 0; r < 3; r++) try {
			let r = await this.api.latest($s(e), { scope: Zs(e, "terminal-head") });
			if (!e.stream || !this.isActiveStream(e, e.stream, n)) return;
			this.mergePage(e, r);
			let i = [...e.segments.values()].flatMap((e) => e.turns || []).find((n) => n.turnId === t && n.generation.generationId === e.generationId);
			if (!i?.closed) throw Error("Turn projection is not closed yet");
			let a = await this.api.latest(ec(e, i.reference), { scope: Zs(e, `terminal:${t}`) });
			if (!this.isActiveStream(e, e.stream, n)) return;
			e.details.set(i.reference, a), e.liveEvents.delete(i.reference), this.emit();
			return;
		} catch (t) {
			if (!this.isActive(e)) return;
			if (r === 2) {
				e.error = lc(t), this.emit();
				return;
			}
			await sc(50 * (r + 1));
		}
	}
	async refreshHead(e) {
		if (e.headRefreshing) return;
		e.headRefreshing = !0;
		let t = e.requestGeneration;
		try {
			let n = await this.api.latest($s(e), { scope: Zs(e, "stream-head") });
			this.isCurrent(e, t) && (this.mergePage(e, n), this.emit());
		} catch {} finally {
			e.headRefreshing = !1;
		}
	}
	findTurn(e, t) {
		return [...e.segments.values()].flatMap((e) => e.turns || []).find((e) => e.reference === t);
	}
	turnReferenceForEvent(e, t, n) {
		return [...e.segments.values()].filter((e) => e.generation.generationId === t).flatMap((e) => e.turns || []).find((e) => n >= e.startEventId && n <= e.lastEventId)?.reference || "";
	}
	eventBelongsToContext(e, t) {
		let n = String(t.sessionId || "");
		return !n || !e.status?.session?.id || n === e.status.session.id;
	}
	appendNotice(e, t) {
		e.notices.some((e) => cc(e) === cc(t)) || (e.notices.push(t), e.notices.length > 20 && e.notices.splice(0, e.notices.length - 20));
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
			if (n) e.liveEvents.set(n, Ps(Ms(e.liveEvents.get(n) || [], [t])));
			else {
				let n = String(t.turnId || "current");
				e.orphanEvents.set(n, Ps(Ms(e.orphanEvents.get(n) || [], [t]))), this.refreshHead(e);
			}
		}
		t && this.isActive(e) && this.emit();
	}
	closeStream(e) {
		e.streamGeneration++, e.stream?.close(), e.stream = null;
	}
	deactivate(e) {
		e && (e.flushTimer && clearTimeout(e.flushTimer), e.flushTimer = null, this.flushEvents(e, !1), e.requestGeneration++, this.closeStream(e), e.loading = !1, e.loadingOlder = !1, this.api.requests.abort(Zs(e, "initial")), this.api.requests.abort(Zs(e, "older")));
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
function Ks(e, t) {
	return (e.items || []).flatMap((e) => qs(e, t));
}
function qs(e, t) {
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
function Js(e, t) {
	return e && t ? `${e}:${t}` : "";
}
function Ys(e, t, n, r) {
	let i = r[0]?.id ?? 0;
	return {
		kind: "turn",
		key: `${e.generationId}:${t || "current"}:${i}`,
		generation: n,
		events: r
	};
}
function Xs(e) {
	if (e.turn) return Number(e.turn.startEventId) || 0;
	let t = e.events?.[0];
	return t && Number(t.id) || 0;
}
function Zs(e, t) {
	return `resource-chat:${e.key}:${t}`;
}
function Qs(e) {
	return `/api/workspaces/${encodeURIComponent(e.workspaceId)}/resources/${encodeURIComponent(e.resourceId)}`;
}
function $s(e, t = "") {
	let n = new URLSearchParams({ limit: String(Vs) });
	return t && n.set("cursor", t), `${Qs(e)}/history/turns?${n}`;
}
function ec(e, t) {
	return `${Qs(e)}/history/turns/${encodeURIComponent(t)}`;
}
function tc(e) {
	let t = [...e.segments.values()].filter((t) => t.generation.generationId === e.generationId).flatMap((e) => e.turns || []), n = [...e.liveEvents.values()].flat();
	return Math.max(0, ...t.map((e) => Number(e.lastEventId) || 0), ...n.map((e) => Number(e.id) || 0));
}
function nc(e) {
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
function rc(e) {
	return Array.isArray(e) ? e.filter((e) => Number(e?.id) > 0) : [];
}
function ic(e) {
	return e.reduce((e, t) => Math.max(e, Number(t.id) || 0), 0);
}
function ac(e) {
	return !!(e?.generation?.generationId && e.session?.id && [
		"starting",
		"running",
		"waiting_approval",
		"idle",
		"stopping",
		"recovering"
	].includes(String(e.generation.status || "")));
}
function oc(e) {
	return [
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(e.type);
}
function sc(e) {
	return new Promise((t) => setTimeout(t, e));
}
function cc(e) {
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
function lc(e) {
	return e instanceof Error ? e.message : String(e);
}
function uc() {
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
var dc = /* @__PURE__ */ G("<div data-component-owner=\"event-timeline\"><!><span> </span><span class=\"agent-note-time\"> </span></div>");
function fc(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => t.item.tone === "ok" ? "check-circle" : t.item.tone === "danger" ? "triangle-alert" : t.item.tone === "info" ? "info" : "clock");
	function r() {
		let e = new Date(t.item.time || "");
		return Number.isNaN(e.valueOf()) ? "" : e.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	var i = dc(), a = L(i);
	X(a, { get name() {
		return U(n);
	} });
	var o = z(a), s = L(o, !0);
	k(o);
	var c = z(o), l = L(c, !0);
	k(c), k(i), B((e) => {
		ai(i, 1, `agent-system-note agent-lifecycle-${t.item.tone || "muted"}`), q(s, t.item.text || ""), q(l, e);
	}, [() => r()]), K(e, i), M();
}
//#endregion
//#region src/components/ThinkingBlock.svelte
var pc = /* @__PURE__ */ G("<details data-component-owner=\"event-timeline\" class=\"agent-reasoning-note\"><summary><!><span> </span><span class=\"agent-reasoning-chevron\"><!></span></summary> <p> </p></details>");
function mc(e, t) {
	j(t, !0);
	let n = Oi(t, "onExpand", 3, () => {});
	function r() {
		if (t.item.active) return "Thinking…";
		if (!t.item.startTime || !t.item.time) return "Thought";
		let e = Math.round((new Date(t.item.time).getTime() - new Date(t.item.startTime).getTime()) / 1e3);
		return !Number.isFinite(e) || e < 0 ? "Thought" : e < 60 ? `Thought for ${e} ${e === 1 ? "second" : "seconds"}` : `Thought for ${Math.floor(e / 60)}m${e % 60}s`;
	}
	var i = pc(), a = L(i), o = L(a);
	X(o, { name: "brain-circuit" });
	var s = z(o), c = L(s, !0);
	k(s);
	var l = z(s);
	X(L(l), { name: "chevron-right" }), k(l), k(a);
	var u = z(a, 2), d = L(u, !0);
	k(u), k(i), B((e) => {
		i.open = t.item.active, q(c, e), q(d, t.item.text || "");
	}, [() => r()]), br("toggle", i, (e) => {
		e.currentTarget.open && n()();
	}), K(e, i), M();
}
//#endregion
//#region src/components/TimelineMessage.svelte
var hc = /* @__PURE__ */ G("<span class=\"agent-message-tag agent-message-role-tag\"> </span>"), gc = /* @__PURE__ */ G("<span class=\"agent-message-tag\">steer</span>"), _c = /* @__PURE__ */ G("<span class=\"agent-message-source\"> </span>"), vc = /* @__PURE__ */ G("<div class=\"agent-message-content markdown-rendered\"></div>"), yc = /* @__PURE__ */ G("<p> </p>"), bc = /* @__PURE__ */ G("<div data-component-owner=\"event-timeline\"><div class=\"agent-message-main\"><div class=\"agent-message-meta\"><strong> </strong> <!> <!> <!> <span> </span></div> <div class=\"agent-message-bubble\"><!></div></div></div>");
function xc(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => [
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
	var s = bc(), c = L(s), l = L(c), u = L(l), d = L(u, !0);
	k(u);
	var f = z(u, 2), p = (e) => {
		var t = hc(), r = L(t, !0);
		k(t), B(() => q(r, U(n))), K(e, t);
	};
	J(f, (e) => {
		U(n) !== "assistant" && e(p);
	});
	var m = z(f, 2), h = (e) => {
		K(e, gc());
	};
	J(m, (e) => {
		t.item.steer && e(h);
	});
	var g = z(m, 2), _ = (e) => {
		var n = _c(), r = L(n);
		k(n), B(() => {
			Y(n, "title", t.item.sender.sessionId), q(r, `from session ${t.item.sender.sessionId ?? ""}`);
		}), K(e, n);
	};
	J(g, (e) => {
		U(n) === "agent" && t.item.sender?.sessionId && e(_);
	});
	var v = z(g, 2), y = L(v, !0);
	k(v), k(l);
	var b = z(l, 2), x = L(b), S = (e) => {
		var t = vc();
		Jr(t, a, !0), k(t), K(e, t);
	}, C = (e) => {
		var n = yc(), r = L(n, !0);
		k(n), B(() => q(r, t.item.text || "")), K(e, n);
	};
	J(x, (e) => {
		U(n) === "assistant" ? e(S) : e(C, -1);
	}), k(b), k(c), k(s), B((e, t) => {
		ai(s, 1, `agent-message-row ${U(n) === "assistant" ? "assistant final" : U(n)}`), q(d, e), q(y, t);
	}, [() => r(), () => i()]), K(e, s), M();
}
//#endregion
//#region src/components/TimelineNotice.svelte
var Sc = /* @__PURE__ */ G("<div data-component-owner=\"event-timeline\"><div><!><strong> </strong></div> <p> </p></div>");
function Cc(e, t) {
	let n = Oi(t, "error", 3, !1), r = Oi(t, "alert", 3, !1);
	var i = Sc();
	let a;
	var o = L(i), s = L(o);
	{
		let e = /* @__PURE__ */ N(() => n() ? "triangle-alert" : "info");
		X(s, { get name() {
			return U(e);
		} });
	}
	var c = z(s), l = L(c, !0);
	k(c), k(o);
	var u = z(o, 2), d = L(u, !0);
	k(u), k(i), B(() => {
		a = ai(i, 1, "timeline-notice", null, a, { "timeline-notice-error": n() }), Y(i, "role", r() ? "alert" : void 0), q(l, t.title), q(d, t.text);
	}), K(e, i);
}
//#endregion
//#region src/components/ToolItem.svelte
var wc = /* @__PURE__ */ G("<pre> </pre>"), Tc = /* @__PURE__ */ G("<details data-component-owner=\"event-timeline\"><summary><!><span> </span><small> </small></summary> <!></details>");
function Ec(e, t) {
	j(t, !0);
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
	var i = Tc(), a = L(i), o = L(a);
	{
		let e = /* @__PURE__ */ N(() => t.call.status === "running" ? "loader-circle" : t.call.status === "failed" ? "x-circle" : "check-circle");
		X(o, { get name() {
			return U(e);
		} });
	}
	var s = z(o), c = L(s, !0);
	k(s);
	var l = z(s), u = L(l, !0);
	k(l), k(a);
	var d = z(a, 2), f = (e) => {
		var t = wc(), n = L(t, !0);
		k(t), B((e) => q(n, e), [() => r()]), K(e, t);
	}, p = /* @__PURE__ */ N(() => r());
	J(d, (e) => {
		U(p) && e(f);
	}), k(i), B((e, t, n) => {
		ai(i, 1, e), q(c, t), q(u, n);
	}, [
		() => `agent-tool-item agent-tool-${String(t.call.status || "completed")}`,
		() => n(),
		() => String(t.call.method || "tool")
	]), K(e, i), M();
}
//#endregion
//#region src/components/ToolGroup.svelte
var Dc = /* @__PURE__ */ G("<details data-component-owner=\"event-timeline\" class=\"agent-tool-group\"><summary><span class=\"agent-tool-group-icon\"><!></span><span class=\"agent-tool-group-title\"> </span><span class=\"agent-tool-group-preview\"> </span><span class=\"agent-tool-group-chevron\"><!></span></summary> <div class=\"agent-tool-list\"></div></details>");
function Oc(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ N(() => t.item.calls || []), r = /* @__PURE__ */ N(() => U(n).map(i));
	function i(e) {
		return [e.name, e.summary].filter(Boolean).join(" · ") || "Tool call";
	}
	var a = Dc(), o = L(a), s = L(o);
	X(L(s), { name: "wrench" }), k(s);
	var c = z(s), l = L(c);
	k(c);
	var u = z(c), d = L(u);
	k(u);
	var f = z(u);
	X(L(f), { name: "chevron-right" }), k(f), k(o);
	var p = z(o, 2);
	Hr(p, 21, () => U(n), (e) => String(e.callId || e.key), (e, t) => {
		Ec(e, { get call() {
			return U(t);
		} });
	}), k(p), k(a), B((e, i) => {
		Y(a, "data-tool-group-key", e), a.open = t.open, q(l, `${U(n).length ?? ""} tool ${U(n).length === 1 ? "call" : "calls"}`), q(d, `${i ?? ""}${U(r).length > 2 ? ` · +${U(r).length - 2} more` : ""}`);
	}, [() => `${t.runId}:${String(t.item.key || t.item.time || "tools")}`, () => U(r).slice(0, 2).join(" · ")]), br("toggle", a, (e) => t.onToggle(e.currentTarget.open)), K(e, a), M();
}
//#endregion
//#region src/components/UnknownEvent.svelte
var kc = /* @__PURE__ */ G("<details data-component-owner=\"event-timeline\" class=\"agent-tool-item agent-unknown-event\"><summary><!><span> </span></summary><pre> </pre></details>");
function Ac(e, t) {
	j(t, !0);
	var n = kc(), r = L(n), i = L(r);
	X(i, { name: "info" });
	var a = z(i), o = L(a);
	k(a), k(r);
	var s = z(r), c = L(s, !0);
	k(s), k(n), B(() => {
		q(o, `Unhandled event: ${(t.item.type || t.item.kind) ?? ""}`), q(c, t.item.preview || "This event carries no payload.");
	}), K(e, n), M();
}
//#endregion
//#region src/components/EventTimeline.svelte
var jc = /* @__PURE__ */ G("<button type=\"button\" class=\"load-older-events\"><!><span> </span></button>"), Mc = /* @__PURE__ */ G("<div class=\"conversation-generation\"><span> </span><strong> </strong><small> </small></div>"), Nc = /* @__PURE__ */ G("<button type=\"button\" class=\"secondary-button\">Retry</button>"), Pc = /* @__PURE__ */ G("<div class=\"conversation-gap\"><!><span><strong>History unavailable</strong><small> </small></span><!></div>"), Fc = /* @__PURE__ */ G("<div class=\"turn-summary-preview\"> </div>"), Ic = /* @__PURE__ */ G("<div><!></div>"), Lc = /* @__PURE__ */ G("<div class=\"turn-loading\"><!><span>Loading turn details</span></div>"), Rc = /* @__PURE__ */ G("<section><!> <!> <!> <!></section>"), zc = /* @__PURE__ */ G("<!> <!>", 1), Bc = /* @__PURE__ */ G("<div class=\"tty-empty\"><!><strong>Loading resource history</strong></div>"), Vc = /* @__PURE__ */ G("<div class=\"tty-empty\"><!><strong>No conversation yet</strong><span>Send a message to start this resource's conversation.</span></div>"), Hc = /* @__PURE__ */ G("<!> <!> <!> <!> <!> <!>", 1), Uc = /* @__PURE__ */ G("<div class=\"tty-empty\"><!><strong>No resource selected</strong></div>"), Wc = /* @__PURE__ */ G("<div data-component-owner=\"event-timeline\" class=\"event-timeline-root\"><!></div>");
function Gc(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(Qt(t.channel.current().project)), i = /* @__PURE__ */ F(Qt(ee())), a = /* @__PURE__ */ F(void 0), o, s = null, c = !1, l = !1, u = /* @__PURE__ */ new Map(), d = /* @__PURE__ */ F(Qt(/* @__PURE__ */ new Map()));
	ki(() => {
		let e = x();
		o = new Gs({
			onEvent: (e, t, r) => U(n).onEvent(e, t, r),
			onNotice: (e, t, r) => U(n).onNotice(e, t, r)
		});
		let i = o.subscribe(f), a = t.channel.subscribe((e) => {
			let t = U(n).identity;
			I(n, e, !0), e.project !== U(r) && I(r, e.project, !0), e.identity !== t && (l = !0, s = null, I(d, new Map(u.get(e.identity) ?? []), !0)), o?.activate(e.workspaceId, e.resourceId, e.status), queueMicrotask(e.onIconsChanged);
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
		if (U(i).identity && e.identity === U(i).identity && S()) {
			s = e;
			return;
		}
		p(e);
	}
	function p(e) {
		let t = x();
		c = e.identity !== U(i).identity || l || C(t), l = !1, I(i, e, !0), t && (t.dataset.agentResourceId = e.resourceId), cr().then(() => {
			c && !S() && w(), U(n).onIconsChanged(), e.loaded && e.hasMoreBefore && g(e.identity);
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
		return e.events ? U(r)(e.events).map((t) => ({
			...t,
			generationId: e.generation.generationId
		})) : e.items || [];
	}
	async function g(e) {
		let t = 0;
		for (; t < 16 && U(i).identity === e && U(i).hasMoreBefore;) {
			let e = x();
			if (!e || e.scrollHeight > e.clientHeight + 160 || S() || !await o?.loadOlder()) return;
			t++, await cr(), w();
		}
	}
	async function _() {
		let e = x();
		if (!e || U(i).loadingOlder) return;
		let t = T(e), r = t?.getBoundingClientRect().top ?? 0, a = e.scrollHeight, s = e.scrollTop, c = U(i).identity;
		await o?.loadOlder(), await cr(), U(i).identity === c && (e.scrollTop = t?.isConnected ? s + (t.getBoundingClientRect().top - r) : s + (e.scrollHeight - a), U(n).onIconsChanged());
	}
	function v(e, t) {
		let n = E(e);
		I(d, new Map(U(d)).set(n, t), !0), u.set(U(i).identity, new Map(U(d))), t && y(e);
	}
	function y(e) {
		if (!(!e.compact || !e.generationId || !e.rangeStartEventId || !e.rangeEndEventId)) return o?.expandRange(e.generationId, e.rangeStartEventId, e.rangeEndEventId);
	}
	function b(e) {
		return U(d).get(E(e)) ?? !1;
	}
	function x() {
		return U(a)?.parentElement ?? null;
	}
	function S() {
		let e = x(), t = window.getSelection?.();
		return !!(e && t && !t.isCollapsed && t.rangeCount && t.getRangeAt(0).intersectsNode(e));
	}
	function C(e) {
		return !!(e && e.scrollHeight - e.scrollTop - e.clientHeight <= 32);
	}
	function w() {
		let e = x();
		e && (e.scrollTop = e.scrollHeight);
	}
	function T(e) {
		let t = e.getBoundingClientRect().top;
		return [...e.querySelectorAll("[data-timeline-key]")].find((e) => e.getBoundingClientRect().bottom >= t) ?? null;
	}
	function E(e) {
		return `${e.generationId || U(i).generationId}:${e.kind}:${String(e.key ?? e.approvalId ?? e.time ?? e.type ?? "event")}`;
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
	var te = Wc(), ne = L(te), re = (e) => {
		var t = Hc(), r = R(t), a = (e) => {
			var t = jc(), n = L(t);
			{
				let e = /* @__PURE__ */ N(() => U(i).loadingOlder ? "loader-circle" : "chevrons-up");
				X(n, { get name() {
					return U(e);
				} });
			}
			var r = z(n), a = L(r, !0);
			k(r), k(t), B(() => {
				t.disabled = U(i).loadingOlder, q(a, U(i).loadingOlder ? "Loading..." : "Load older messages");
			}), W("click", t, _), K(e, t);
		};
		J(r, (e) => {
			U(i).hasMoreBefore && e(a);
		});
		var s = z(r, 2);
		Hr(s, 19, () => U(i).blocks, (e) => e.key, (e, t, r) => {
			var a = zc(), s = R(a), c = (e) => {
				var n = Mc(), r = L(n), i = L(r);
				k(r);
				var a = z(r), o = L(a, !0);
				k(a);
				var s = z(a), c = L(s, !0);
				k(s), k(n), B(() => {
					Y(n, "data-generation-id", U(t).generation.generationId), q(i, `Generation ${U(t).generation.generation ?? ""}`), q(o, U(t).generation.agentName || U(t).generation.resolvedProfile || U(t).generation.binding?.name || "Agent"), q(c, U(t).generation.status);
				}), K(e, n);
			};
			J(s, (e) => {
				(U(r) === 0 || U(i).blocks[U(r) - 1].generation.generationId !== U(t).generation.generationId) && e(c);
			});
			var l = z(s, 2), u = (e) => {
				var n = Pc(), r = L(n);
				X(r, { name: "triangle-alert" });
				var i = z(r), a = z(L(i)), s = L(a, !0);
				k(a), k(i);
				var c = z(i), l = (e) => {
					var t = Nc();
					W("click", t, () => o?.retryHistory()), K(e, t);
				};
				J(c, (e) => {
					U(t).gap?.retryable && e(l);
				}), k(n), B(() => {
					Y(n, "data-timeline-key", U(t).key), q(s, U(t).gap?.message || "This generation could not be read.");
				}), K(e, n);
			}, d = (e) => {
				var r = Rc();
				let a;
				var o = L(r), s = (e) => {
					var n = Fc(), r = L(n, !0);
					k(n), B(() => q(r, U(t).turn.triggerPreview)), K(e, n);
				};
				J(o, (e) => {
					U(t).turn?.triggerPreview && !U(t).items && !U(t).events && e(s);
				});
				var c = z(o, 2);
				Hr(c, 17, () => h(U(t)), (e) => E(e), (e, r) => {
					var a = Ic(), o = L(a), s = (e) => {
						xc(e, {
							get item() {
								return U(r);
							},
							get agentName() {
								return U(n).agentName;
							}
						});
					}, c = (e) => {
						mc(e, {
							get item() {
								return U(r);
							},
							onExpand: () => y(U(r))
						});
					}, l = (e) => {
						{
							let n = /* @__PURE__ */ N(() => b(U(r)));
							Oc(e, {
								get item() {
									return U(r);
								},
								get runId() {
									return U(t).generation.generationId;
								},
								get open() {
									return U(n);
								},
								onToggle: (e) => v(U(r), e)
							});
						}
					}, u = (e) => {
						As(e, {
							get item() {
								return U(r);
							},
							get runId() {
								return U(t).generation.generationId;
							},
							get contextIdentity() {
								return U(i).identity;
							},
							get onApproval() {
								return U(n).onApproval;
							},
							get onToast() {
								return U(n).onToast;
							}
						});
					}, d = (e) => {
						fc(e, { get item() {
							return U(r);
						} });
					}, f = (e) => {
						{
							let t = /* @__PURE__ */ N(() => U(r).text || "");
							Cc(e, {
								title: "Provider error",
								get text() {
									return U(t);
								},
								error: !0
							});
						}
					}, p = (e) => {
						Ac(e, { get item() {
							return U(r);
						} });
					};
					J(o, (e) => {
						U(r).kind === "message" ? e(s) : U(r).kind === "thinking" ? e(c, 1) : U(r).kind === "tools" ? e(l, 2) : U(r).kind === "approval" ? e(u, 3) : U(r).kind === "lifecycle" ? e(d, 4) : U(r).kind === "error" ? e(f, 5) : e(p, -1);
					}), k(a), B((e) => Y(a, "data-timeline-key", e), [() => E(U(r))]), K(e, a);
				});
				var l = z(c, 2), u = (e) => {
					var t = Lc();
					X(L(t), { name: "loader-circle" }), A(), k(t), K(e, t);
				};
				J(l, (e) => {
					U(t).loading && !U(t).items && !U(t).events && e(u);
				});
				var d = z(l, 2), f = (e) => {
					Cc(e, {
						title: "Turn unavailable",
						get text() {
							return U(t).error;
						},
						error: !0
					});
				};
				J(d, (e) => {
					U(t).error && e(f);
				}), k(r), Xr(r, (e, t) => m?.(e, t), () => U(t).turn?.reference || ""), B(() => {
					a = ai(r, 1, "conversation-turn", null, a, { "conversation-turn-loading": U(t).loading }), Y(r, "data-timeline-key", U(t).key);
				}), K(e, r);
			};
			J(l, (e) => {
				U(t).kind === "gap" ? e(u) : e(d, -1);
			}), K(e, a);
		});
		var c = z(s, 2);
		Hr(c, 19, () => U(i).notices, (e, t) => `notice:${U(i).identity}:${t}:${String(e.data?.text || "")}`, (e, t, n) => {
			var r = Ic(), i = L(r);
			{
				let e = /* @__PURE__ */ N(() => String(U(t).data?.text || "")), n = /* @__PURE__ */ N(() => U(t).data?.level === "error");
				Cc(i, {
					title: "Forge",
					get text() {
						return U(e);
					},
					get error() {
						return U(n);
					}
				});
			}
			k(r), B(() => Y(r, "data-timeline-key", `notice:${U(n)}`)), K(e, r);
		});
		var l = z(c, 2), u = (e) => {
			Cc(e, {
				title: "Timeline error",
				get text() {
					return U(i).error;
				},
				error: !0,
				alert: !0
			});
		};
		J(l, (e) => {
			U(i).error && e(u);
		});
		var d = z(l, 2), f = (e) => {
			var t = Bc();
			X(L(t), { name: "loader-circle" }), A(), k(t), K(e, t);
		};
		J(d, (e) => {
			U(i).loading && !U(i).blocks.length && e(f);
		});
		var p = z(d, 2), g = (e) => {
			var t = Vc();
			X(L(t), { name: "bot" }), A(2), k(t), K(e, t);
		};
		J(p, (e) => {
			U(i).loaded && !U(i).loading && !U(i).blocks.length && !U(i).notices.length && e(g);
		}), K(e, t);
	}, ie = (e) => {
		var t = Uc();
		X(L(t), { name: "bot" }), A(), k(t), K(e, t);
	};
	J(ne, (e) => {
		U(i).resourceId ? e(re) : e(ie, -1);
	}), k(te), Di(te, (e) => I(a, e), () => U(a)), B(() => Y(te, "data-chat-context", U(i).identity)), K(e, te), M();
}
xr(["click"]);
//#endregion
//#region src/components/settings-draft.ts
function Kc(e) {
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
function qc(e) {
	return {
		...e,
		profiles: e.profiles.map((e) => ({ ...e })),
		resourceDefaults: { ...e.resourceDefaults },
		newProfile: { ...e.newProfile }
	};
}
function Jc(e) {
	return e instanceof Error ? e.message : String(e);
}
//#endregion
//#region src/components/AgentHubSettingsPanel.svelte
var Yc = /* @__PURE__ */ G("<span class=\"settings-pill\"> </span>"), Xc = /* @__PURE__ */ G("<div class=\"settings-service-row\"><div class=\"settings-provider-main\"><span class=\"settings-agent-mark\"> </span><span><strong> </strong><small> </small></span></div></div>"), Zc = /* @__PURE__ */ G("<div class=\"settings-empty\">No AgentHub agents available.</div>"), Qc = /* @__PURE__ */ G("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"agenthub-settings-panel\" data-settings-panel=\"\" data-settings-section=\"agenthub\"><div class=\"settings-panel-header\"><h2>AgentHub</h2><p>Forge connects to AgentHub for providers, agents, and durable sessions. Provider and agent definitions are read-only here.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Connection</h3><span class=\"settings-pill\"> </span></div> <label class=\"settings-default-agent\"><span>Endpoint</span><input id=\"settingsAgentHubEndpoint\"/></label> <small> </small> <div class=\"settings-provider-list\"></div></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Catalog</h3><span> </span></div> <div class=\"settings-agent-list\"></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button id=\"settingsSaveButton\" type=\"button\"><!><span>Save All</span></button></div></div>");
function $c(e, t) {
	j(t, !0);
	let n = Oi(t, "draft", 15), r = Oi(t, "pending", 15);
	async function i() {
		if (!(!n().dirty || r())) {
			r("agenthub");
			try {
				await t.onSaveAgentHub(qc(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(Jc(e));
			} finally {
				r("");
			}
		}
	}
	var a = Qc(), o = z(L(a), 2), s = L(o), c = z(L(s)), l = L(c, !0);
	k(c), k(s);
	var u = z(s, 2), d = z(L(u));
	gi(d), k(u);
	var f = z(u, 2), p = L(f, !0);
	k(f);
	var m = z(f, 2);
	Hr(m, 21, () => t.agentHub.capabilities, Rr, (e, t) => {
		var n = Yc(), r = L(n, !0);
		k(n), B(() => q(r, U(t))), K(e, n);
	}), k(m), k(o);
	var h = z(o, 2), g = L(h), _ = z(L(g)), v = L(_);
	k(_), k(g);
	var y = z(g, 2);
	Hr(y, 21, () => t.agentHub.agents, (e) => e.name, (e, t) => {
		var n = Xc(), r = L(n), i = L(r), a = L(i, !0);
		k(i);
		var o = z(i), s = L(o), c = L(s, !0);
		k(s);
		var l = z(s), u = L(l);
		k(l), k(o), k(r), k(n), B((e) => {
			q(a, e), q(c, U(t).name), q(u, `${(U(t).providerId || "") ?? ""} · ${(U(t).available === !1 ? U(t).unavailableReason || "Unavailable" : "Available") ?? ""}`);
		}, [() => (U(t).name || "A").slice(0, 1).toUpperCase()]), K(e, n);
	}, (e) => {
		K(e, Zc());
	}), k(y), k(h);
	var b = z(h, 2), x = L(b);
	let S;
	var C = L(x, !0);
	k(x);
	var w = z(x);
	X(L(w), { name: "save" }), A(), k(w), k(b), k(a), B((e) => {
		q(l, t.agentHub.connected && t.agentHub.compatible ? "Compatible" : t.agentHub.connected ? "Incompatible" : "Unavailable"), q(p, t.agentHub.error || `API ${t.agentHub.apiVersion || "unknown"} · AgentHub ${t.agentHub.version || "unknown"}`), q(v, `${t.agentHub.agents.length ?? ""} agents · ${t.agentHub.providers.length ?? ""} providers`), S = ai(x, 1, "settings-save-hint", null, S, { visible: n().dirty }), q(C, n().dirty ? "Unsaved changes" : ""), w.disabled = e;
	}, [() => !n().dirty || !!r()]), W("input", d, function(...e) {
		t.onDirty?.apply(this, e);
	}), Si(d, () => n().endpoint, (e) => n(n().endpoint = e, !0)), W("click", w, i), K(e, a), M();
}
xr(["input", "click"]);
//#endregion
//#region src/components/NotificationSettingsPanel.svelte
var el = /* @__PURE__ */ G("<small class=\"settings-notification-help\"> </small>"), tl = /* @__PURE__ */ G("<div class=\"settings-panel\" data-component-owner=\"notification-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Notifications</h2><p>Choose how this browser notifies you when an Agent run finishes.</p></div> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Browser notifications</strong><small>Show one notification when a background run finishes.</small></span> <input id=\"settingsBrowserNotifications\" type=\"checkbox\"/></label> <!></section> <section class=\"settings-agent-section\"><label class=\"settings-notification-option\"><span class=\"settings-notification-copy\"><strong>Completion sound</strong><small>Play one short local sound for each new notification.</small></span> <input id=\"settingsCompletionSound\" type=\"checkbox\"/></label> <small class=\"settings-notification-help\"> </small></section></div>");
function nl(e, t) {
	j(t, !0);
	var n = tl(), r = z(L(n), 2), i = L(r), a = z(L(i), 2);
	gi(a), k(i);
	var o = z(i, 2), s = (e) => {
		var n = el(), r = L(n, !0);
		k(n), B(() => q(r, t.notifications.permissionError)), K(e, n);
	};
	J(o, (e) => {
		t.notifications.permissionError && e(s);
	}), k(r);
	var c = z(r, 2), l = L(c), u = z(L(l), 2);
	gi(u), k(l);
	var d = z(l, 2), f = L(d, !0);
	k(d), k(c), k(n), B(() => {
		vi(a, t.notifications.browser), vi(u, t.notifications.sound), q(f, t.notifications.soundError || "Chrome may require the enable action to happen from a user gesture.");
	}), W("change", a, (e) => t.onBrowserNotifications(e.currentTarget.checked)), W("change", u, (e) => t.onCompletionSound(e.currentTarget.checked)), K(e, n), M();
}
xr(["change"]);
//#endregion
//#region src/components/ProfilesSettingsPanel.svelte
var rl = /* @__PURE__ */ G("<option> </option>"), il = /* @__PURE__ */ G("<label><span> </span><select></select></label>"), al = /* @__PURE__ */ G("<span class=\"settings-profile-system-label\">System</span>"), ol = /* @__PURE__ */ G("<button type=\"button\" class=\"settings-danger-button\" title=\"Delete Profile\"><!></button>"), sl = /* @__PURE__ */ G("<div><input aria-label=\"Profile key\"/> <input aria-label=\"Summary\"/> <select aria-label=\"AgentHub Agent\"></select> <!></div>"), cl = /* @__PURE__ */ G("<div class=\"settings-panel settings-agent-panel\" data-component-owner=\"profiles-settings-panel\" data-settings-panel=\"\" data-settings-section=\"profiles\"><div class=\"settings-panel-header\"><h2>Agent Profiles</h2><p>Profiles map Forge workflows to AgentHub agents. System profiles are reserved; custom profile keys must be unique.</p></div> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>New Resource Defaults</h3><span>Applied once at creation</span></div> <div class=\"settings-resource-defaults\"></div> <p class=\"settings-resource-default-note\">Existing resources keep their explicit binding. Changing a profile route replaces its referenced resource generations at a safe turn boundary.</p></section> <section class=\"settings-agent-section\"><div class=\"settings-section-heading\"><h3>Profile Routes</h3><span> </span></div> <div class=\"settings-profile-table\"><div class=\"settings-profile-row settings-profile-head\"><span>Profile key</span><span>Summary</span><span>AgentHub Agent</span><span></span></div> <!> <div class=\"settings-profile-row settings-profile-new\"><input id=\"settingsNewProfileKey\" placeholder=\"New key\" aria-label=\"New profile key\"/> <input id=\"settingsNewProfileDescription\" placeholder=\"New profile summary\" aria-label=\"New profile summary\"/> <select id=\"settingsNewProfileAgent\" aria-label=\"New profile agent\"></select> <button id=\"settingsAddProfileButton\" type=\"button\"><!><span>Add</span></button></div></div></section> <div class=\"settings-form-actions settings-save-bar\"><span> </span><button type=\"button\"><!><span>Save All</span></button></div></div>");
function ll(e, t) {
	j(t, !0);
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
				await t.onSaveAgentHub(qc(n())), n(n().dirty = !1, !0);
			} catch (e) {
				t.onToast(Jc(e));
			} finally {
				r("");
			}
		}
	}
	var f = cl(), p = z(L(f), 2), m = z(L(p), 2);
	Hr(m, 20, () => [
		["workspace", "Workspace"],
		["project", "Project"],
		["task", "Task"]
	], Rr, (e, t) => {
		let r = /* @__PURE__ */ N(() => t[0]);
		var i = il(), a = L(i), o = L(a, !0);
		k(a);
		var s = z(a);
		Hr(s, 21, () => u(U(r)), Rr, (e, t) => {
			var n = rl(), r = L(n);
			k(n);
			var i = {};
			B(() => {
				q(r, `${U(t).key ?? ""}${U(t).agentName ? "" : " (Missing)"}`), i !== (i = U(t).key) && (n.value = (n.__value = U(t).key) ?? "");
			}), K(e, n);
		}), k(s);
		var c;
		li(s), k(i), B(() => {
			q(o, t[1]), Y(s, "aria-label", `${t[1]} default profile`), c !== (c = n().resourceDefaults[U(r)]) && (s.value = (s.__value = n().resourceDefaults[U(r)]) ?? "", ci(s, n().resourceDefaults[U(r)]));
		}), W("change", s, (e) => l(U(r), e.currentTarget.value)), K(e, i);
	}), k(m), A(2), k(p);
	var h = z(p, 2), g = L(h), _ = z(L(g)), v = L(_);
	k(_), k(g);
	var y = z(g, 2), b = z(L(y), 2);
	Hr(b, 17, () => n().profiles, Rr, (e, t, n) => {
		let r = /* @__PURE__ */ N(() => i.has(U(t).key.trim().toLowerCase()));
		var o = sl();
		let l;
		var u = L(o);
		gi(u);
		var d = z(u, 2);
		gi(d);
		var f = z(d, 2);
		Hr(f, 21, () => c(U(t).agentName), Rr, (e, t) => {
			var n = rl(), r = L(n, !0);
			k(n);
			var i = {};
			B(() => {
				q(r, U(t).label), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
			}), K(e, n);
		}), k(f);
		var p;
		li(f);
		var m = z(f, 2), h = (e) => {
			K(e, al());
		}, g = (e) => {
			var t = ol();
			X(L(t), { name: "trash-2" }), k(t), W("click", t, () => s(n)), K(e, t);
		};
		J(m, (e) => {
			U(r) ? e(h) : e(g, -1);
		}), k(o), B(() => {
			l = ai(o, 1, "settings-profile-row", null, l, { "settings-profile-system": U(r) }), _i(u, U(t).key), u.disabled = U(r), _i(d, U(t).description), d.disabled = U(r), p !== (p = U(t).agentName) && (f.value = (f.__value = U(t).agentName) ?? "", ci(f, U(t).agentName));
		}), W("input", u, (e) => a(n, "key", e.currentTarget.value)), W("input", d, (e) => a(n, "description", e.currentTarget.value)), W("change", f, (e) => a(n, "agentName", e.currentTarget.value)), K(e, o);
	});
	var x = z(b, 2), S = L(x);
	gi(S);
	var C = z(S, 2);
	gi(C);
	var w = z(C, 2);
	Hr(w, 21, () => t.agents, Rr, (e, t) => {
		var n = rl(), r = L(n, !0);
		k(n);
		var i = {};
		B(() => {
			q(r, U(t).label), i !== (i = U(t).id) && (n.value = (n.__value = U(t).id) ?? "");
		}), K(e, n);
	}), k(w);
	var T = z(w, 2);
	X(L(T), { name: "plus" }), A(), k(T), k(x), k(y), k(h);
	var E = z(h, 2), ee = L(E);
	let te;
	var ne = L(ee, !0);
	k(ee);
	var re = z(ee);
	X(L(re), { name: "save" }), A(), k(re), k(E), k(f), B((e) => {
		q(v, `${n().profiles.length ?? ""} routes`), w.disabled = !t.agents.length, T.disabled = !t.agents.length, te = ai(ee, 1, "settings-save-hint", null, te, { visible: n().dirty }), q(ne, n().dirty ? "Unsaved changes" : ""), re.disabled = e;
	}, [() => !n().dirty || !!r()]), Si(S, () => n().newProfile.key, (e) => n(n().newProfile.key = e, !0)), Si(C, () => n().newProfile.description, (e) => n(n().newProfile.description = e, !0)), ui(w, () => n().newProfile.agentName, (e) => n(n().newProfile.agentName = e, !0)), W("click", T, o), W("click", re, d), K(e, f), M();
}
xr([
	"change",
	"input",
	"click"
]);
//#endregion
//#region src/components/SettingsNavigation.svelte
var ul = /* @__PURE__ */ G("<span class=\"settings-tab-dot\" aria-hidden=\"true\"></span>"), dl = /* @__PURE__ */ G("<button type=\"button\"><!> <span> </span> <!></button>"), fl = /* @__PURE__ */ G("<aside class=\"settings-tabs\" data-component-owner=\"settings-navigation\"><div class=\"settings-title\">System Settings</div> <!></aside>");
function pl(e, t) {
	j(t, !0);
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
	var r = fl();
	Hr(z(L(r), 2), 17, () => n, (e) => e.id, (e, n) => {
		var r = dl();
		let i;
		var a = L(r);
		X(a, { get name() {
			return U(n).icon;
		} });
		var o = z(a, 2), s = L(o, !0);
		k(o);
		var c = z(o, 2), l = (e) => {
			K(e, ul());
		};
		J(c, (e) => {
			U(n).sharesAgentDraft && e(l);
		}), k(r), B(() => {
			i = ai(r, 1, "settings-tab", null, i, {
				active: t.activeTab === U(n).id,
				dirty: t.dirty && U(n).sharesAgentDraft
			}), Y(r, "aria-current", t.activeTab === U(n).id ? "page" : void 0), q(s, U(n).label);
		}), W("click", r, () => t.onSelect(U(n).id)), K(e, r);
	}), k(r), K(e, r), M();
}
xr(["click"]);
//#endregion
//#region src/components/UserSettingsPanel.svelte
var ml = /* @__PURE__ */ G("<div class=\"settings-panel\" data-component-owner=\"user-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>User</h2><p>Choose the name shown for messages you send from this browser.</p></div> <form id=\"settingsUserForm\" class=\"settings-user-form\"><label><span>Name</span> <input id=\"settingsUserName\" maxlength=\"80\" placeholder=\"User\"/> <small>Stored only in this browser. Empty values use User.</small></label> <div class=\"settings-form-actions\"><button type=\"submit\"><!><span>Save</span></button></div></form></div>");
function hl(e, t) {
	j(t, !0);
	let n = Oi(t, "draft", 15), r = Oi(t, "pending", 15);
	async function i(e) {
		if (e.preventDefault(), !r()) {
			r("user");
			try {
				n(n().userName = await t.onSaveUser(n().userName), !0);
			} catch (e) {
				t.onToast(Jc(e));
			} finally {
				r("");
			}
		}
	}
	var a = ml(), o = z(L(a), 2), s = L(o), c = z(L(s), 2);
	gi(c), A(2), k(s);
	var l = z(s, 2), u = L(l);
	X(L(u), { name: "save" }), A(), k(u), k(l), k(o), k(a), B(() => u.disabled = r() === "user"), br("submit", o, i), Si(c, () => n().userName, (e) => n(n().userName = e, !0)), K(e, a), M();
}
//#endregion
//#region src/components/WorkspaceSettingsPanel.svelte
var gl = /* @__PURE__ */ G("<span class=\"settings-pill\">Active</span>"), _l = /* @__PURE__ */ G("<button type=\"button\" role=\"radio\"><img alt=\"\"/><span> </span><!></button>"), vl = /* @__PURE__ */ G("<div class=\"settings-workspace-icon-picker\" role=\"radiogroup\"></div>"), yl = /* @__PURE__ */ G("<div class=\"settings-workspace-entry\"><div class=\"settings-list-row\"><div class=\"settings-row-main\"><span class=\"settings-workspace-mark\"><img alt=\"\" aria-hidden=\"true\"/></span> <span><strong> </strong><small> </small></span></div> <div class=\"settings-row-actions\"><!> <button type=\"button\" class=\"settings-workspace-icon-button\" title=\"Change workspace icon\"><img alt=\"\"/> <span> </span> <!></button> <button type=\"button\" class=\"settings-danger-button\" title=\"Remove workspace\"><!></button></div></div> <!></div>"), bl = /* @__PURE__ */ G("<div class=\"settings-empty\">No workspaces managed by Forge GUI.</div>"), xl = /* @__PURE__ */ G("<div class=\"settings-panel\" data-component-owner=\"workspace-settings-panel\" data-settings-panel=\"\"><div class=\"settings-panel-header\"><h2>Workspaces</h2> <p>Add existing AgentWorkspace folders or create and initialize a new Forge workspace.</p></div> <form id=\"settingsWorkspaceForm\" class=\"settings-path-form\"><input id=\"settingsWorkspacePath\" placeholder=\"/Users/me/Documents/AgentWorkspace\"/> <label class=\"settings-check\"><input id=\"settingsWorkspaceCreate\" type=\"checkbox\"/> <span>Create directory and run forge init</span></label> <button type=\"submit\"><!><span> </span></button></form> <div class=\"settings-list\"></div></div>");
function Sl(e, t) {
	j(t, !0);
	let n = Oi(t, "draft", 15), r = Oi(t, "pending", 15), i = /* @__PURE__ */ F("");
	async function a(e) {
		if (e.preventDefault(), !(!n().workspacePath.trim() || r())) {
			r("workspace");
			try {
				await t.onAddWorkspace(qc(n())), n(n().workspacePath = "", !0), n(n().createWorkspace = !1, !0);
			} catch (e) {
				t.onToast(Jc(e));
			} finally {
				r("");
			}
		}
	}
	async function o(e) {
		if (!r()) {
			r(`remove:${e}`);
			try {
				await t.onRemoveWorkspace(e, qc(n()));
			} catch (e) {
				t.onToast(Jc(e));
			} finally {
				r("");
			}
		}
	}
	async function s(e, a) {
		if (!r()) {
			r(`icon:${e}`), I(i, "");
			try {
				await t.onWorkspaceIcon(e, a, qc(n()));
			} catch (e) {
				t.onToast(Jc(e));
			} finally {
				r("");
			}
		}
	}
	function c(e) {
		let n = t.workspaces.find((t) => t.id === e);
		return t.workspaceIcons.find((e) => e.id === (n?.icon || "")) || t.workspaceIcons[0];
	}
	var l = xl(), u = z(L(l), 2), d = L(u);
	gi(d);
	var f = z(d, 2), p = L(f);
	gi(p), A(2), k(f);
	var m = z(f, 2), h = L(m);
	X(h, { name: "plus" });
	var g = z(h), _ = L(g, !0);
	k(g), k(m), k(u);
	var v = z(u, 2);
	Hr(v, 21, () => t.workspaces, (e) => e.id, (e, n) => {
		let a = /* @__PURE__ */ N(() => c(U(n).id));
		var l = yl(), u = L(l), d = L(u), f = L(d), p = L(f);
		k(f);
		var m = z(f, 2), h = L(m), g = L(h, !0);
		k(h);
		var _ = z(h), v = L(_, !0);
		k(_), k(m), k(d);
		var y = z(d, 2), b = L(y), x = (e) => {
			K(e, gl());
		};
		J(b, (e) => {
			U(n).id === t.activeWorkspaceId && e(x);
		});
		var S = z(b, 2), C = L(S), w = z(C, 2), T = L(w, !0);
		k(w), X(z(w, 2), { name: "chevron-down" }), k(S);
		var E = z(S, 2);
		X(L(E), { name: "trash-2" }), k(E), k(y), k(u);
		var ee = z(u, 2), te = (e) => {
			var r = vl();
			Hr(r, 21, () => t.workspaceIcons, (e) => e.id, (e, t) => {
				var r = _l();
				let i;
				var o = L(r), c = z(o), l = L(c, !0);
				k(c);
				var u = z(c), d = (e) => {
					X(e, { name: "check" });
				};
				J(u, (e) => {
					U(t).id === U(a).id && e(d);
				}), k(r), B(() => {
					Y(r, "aria-checked", U(t).id === U(a).id), Y(r, "title", U(t).label), i = ai(r, 1, "", null, i, { selected: U(t).id === U(a).id }), Y(o, "src", U(t).src), q(l, U(t).label);
				}), W("click", r, () => s(U(n).id, U(t).id)), K(e, r);
			}), k(r), B(() => Y(r, "aria-label", `Icon for ${U(n).name}`)), K(e, r);
		};
		J(ee, (e) => {
			U(i) === U(n).id && e(te);
		}), k(l), B((e, t) => {
			Y(p, "src", U(a).src), q(g, U(n).name), q(v, U(n).path), Y(S, "aria-expanded", U(i) === U(n).id), S.disabled = e, Y(C, "src", U(a).src), q(T, r() === `icon:${U(n).id}` ? "Saving..." : U(a).label), E.disabled = t;
		}, [() => !!r(), () => !!r()]), W("click", S, () => I(i, U(i) === U(n).id ? "" : U(n).id, !0)), W("click", E, () => o(U(n).id)), K(e, l);
	}, (e) => {
		K(e, bl());
	}), k(v), k(l), B((e) => {
		m.disabled = e, q(_, n().createWorkspace ? "Create" : "Add");
	}, [() => !!r()]), br("submit", u, a), Si(d, () => n().workspacePath, (e) => n(n().workspacePath = e, !0)), Ci(p, () => n().createWorkspace, (e) => n(n().createWorkspace = e, !0)), K(e, l), M();
}
xr(["click"]);
//#endregion
//#region src/components/SettingsModal.svelte
var Cl = /* @__PURE__ */ G("<button class=\"settings-overlay modal-enter\" type=\"button\" aria-label=\"Close settings\"></button> <div class=\"settings-modal modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"System Settings\"><!> <div class=\"settings-content\"><button type=\"button\" class=\"settings-close\" title=\"Close\" aria-label=\"Close\"><!></button> <!></div></div>", 1);
function wl(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(-1), a = /* @__PURE__ */ F(Qt(Kc(U(n)))), o = /* @__PURE__ */ F("");
	ki(() => t.channel.subscribe((e) => {
		I(n, e, !0), e.identity === U(r) ? e.dataVersion !== U(i) && !U(a).dirty && (I(i, e.dataVersion, !0), I(a, Kc(e), !0)) : (I(r, e.identity, !0), I(i, e.dataVersion, !0), I(a, Kc(e), !0), I(o, "")), queueMicrotask(e.onIconsChanged);
	})), ki(() => {
		let e = (e) => {
			U(n).open && e.key === "Escape" && (e.preventDefault(), U(n).onClose(U(a).dirty));
		};
		return document.addEventListener("keydown", e), () => document.removeEventListener("keydown", e);
	});
	function s() {
		U(a).dirty = !0;
	}
	var c = kr(), l = R(c), u = (e) => {
		var t = Cl(), r = R(t), i = z(r, 2), c = L(i);
		pl(c, {
			get activeTab() {
				return U(a).tab;
			},
			get dirty() {
				return U(a).dirty;
			},
			onSelect: (e) => U(a).tab = e
		});
		var l = z(c, 2), u = L(l);
		X(L(u), { name: "x" }), k(u);
		var d = z(u, 2), f = (e) => {
			Sl(e, {
				get workspaces() {
					return U(n).workspaces;
				},
				get activeWorkspaceId() {
					return U(n).activeWorkspaceId;
				},
				get workspaceIcons() {
					return U(n).workspaceIcons;
				},
				get onAddWorkspace() {
					return U(n).onAddWorkspace;
				},
				get onRemoveWorkspace() {
					return U(n).onRemoveWorkspace;
				},
				get onWorkspaceIcon() {
					return U(n).onWorkspaceIcon;
				},
				get onToast() {
					return U(n).onToast;
				},
				get draft() {
					return U(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return U(o);
				},
				set pending(e) {
					I(o, e, !0);
				}
			});
		}, p = (e) => {
			hl(e, {
				get onSaveUser() {
					return U(n).onSaveUser;
				},
				get onToast() {
					return U(n).onToast;
				},
				get draft() {
					return U(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return U(o);
				},
				set pending(e) {
					I(o, e, !0);
				}
			});
		}, m = (e) => {
			$c(e, {
				get agentHub() {
					return U(n).agentHub;
				},
				onDirty: s,
				get onSaveAgentHub() {
					return U(n).onSaveAgentHub;
				},
				get onToast() {
					return U(n).onToast;
				},
				get draft() {
					return U(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return U(o);
				},
				set pending(e) {
					I(o, e, !0);
				}
			});
		}, h = (e) => {
			ll(e, {
				get agents() {
					return U(n).agents;
				},
				onDirty: s,
				get onSaveAgentHub() {
					return U(n).onSaveAgentHub;
				},
				get onToast() {
					return U(n).onToast;
				},
				get draft() {
					return U(a);
				},
				set draft(e) {
					I(a, e, !0);
				},
				get pending() {
					return U(o);
				},
				set pending(e) {
					I(o, e, !0);
				}
			});
		}, g = (e) => {
			nl(e, {
				get notifications() {
					return U(n).notifications;
				},
				get onBrowserNotifications() {
					return U(n).onBrowserNotifications;
				},
				get onCompletionSound() {
					return U(n).onCompletionSound;
				}
			});
		};
		J(d, (e) => {
			U(a).tab === "workspace" ? e(f) : U(a).tab === "user" ? e(p, 1) : U(a).tab === "agenthub" ? e(m, 2) : U(a).tab === "profiles" ? e(h, 3) : e(g, -1);
		}), k(l), k(i), W("click", r, () => U(n).onClose(U(a).dirty)), W("click", u, () => U(n).onClose(U(a).dirty)), K(e, t);
	};
	J(l, (e) => {
		U(n).open && e(u);
	}), K(e, c), M();
}
xr(["click"]);
//#endregion
//#region src/components/Toast.svelte
var Tl = /* @__PURE__ */ G("<div id=\"toast\" class=\"toast\" role=\"status\" aria-live=\"polite\"> </div>");
function El(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(!1), i = null;
	ki(() => {
		let e = t.channel.subscribe((e) => {
			I(n, e, !0), I(r, !!e.message, !0), i !== null && window.clearTimeout(i), U(r) && (i = window.setTimeout(() => {
				I(r, !1), i = null;
			}, 2800));
		});
		return () => {
			e(), i !== null && window.clearTimeout(i);
		};
	});
	var a = Tl(), o = L(a, !0);
	k(a), B(() => {
		Y(a, "hidden", !U(r)), q(o, U(n).message);
	}), K(e, a), M();
}
//#endregion
//#region src/components/UploadDialog.svelte
var Dl = /* @__PURE__ */ G("<div class=\"upload-empty\">Selected or pasted files upload automatically.</div>"), Ol = /* @__PURE__ */ G("<small class=\"upload-result-path\"> </small>"), kl = /* @__PURE__ */ G("<small class=\"upload-error\"> </small>"), Al = /* @__PURE__ */ G("<div><div class=\"upload-item-heading\"><!><span><strong> </strong><small> </small></span><em> </em></div> <div class=\"upload-progress\" role=\"progressbar\" aria-valuemin=\"0\" aria-valuemax=\"100\"><span></span></div> <!> <!></div>"), jl = /* @__PURE__ */ G("<div class=\"upload-dialog-layer\" role=\"presentation\"><button class=\"upload-dialog-backdrop modal-enter\" type=\"button\" aria-label=\"Close\"></button> <div class=\"upload-dialog modal-enter\" role=\"dialog\" aria-modal=\"true\" aria-label=\"Upload files\"><header class=\"upload-dialog-header\"><div><strong>Upload files</strong><span>Files are saved in this resource's artifacts/upload/ directory.</span></div> <button class=\"icon-button\" type=\"button\" title=\"Close\" aria-label=\"Close\"><!></button></header> <div class=\"upload-dialog-content\"><input id=\"agentUploadInput\" type=\"file\" multiple=\"\" hidden=\"\"/> <div id=\"agentUploadDropZone\" class=\"upload-drop-zone\" tabindex=\"0\" role=\"button\"><!><strong>Paste files from the clipboard</strong><span>or choose one or more files from this device</span> <button id=\"agentUploadChooseButton\" type=\"button\" class=\"secondary-button\"><!><span>Choose files</span></button></div> <div class=\"upload-list\" aria-live=\"polite\"><!> <!></div></div> <footer class=\"upload-dialog-footer\"><span> </span> <button type=\"button\">Done</button></footer></div></div>");
function Ml(e, t) {
	j(t, !0);
	let n = /* @__PURE__ */ F(Qt(t.channel.current())), r = /* @__PURE__ */ F(""), i = /* @__PURE__ */ F(Qt([])), a = 1, o = /* @__PURE__ */ F(void 0), s = /* @__PURE__ */ new Map(), c = /* @__PURE__ */ N(() => U(i).some((e) => e.status === "queued" || e.status === "uploading")), l = /* @__PURE__ */ N(() => U(i).filter((e) => e.status === "success").length), u = /* @__PURE__ */ N(() => U(i).filter((e) => e.status === "error").length);
	ki(() => {
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
		for (let e of r) g(e, U(n).identity, U(n).workspaceId, U(n).resourceId);
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
		s.set(e.id, a), a.open("POST", `/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/uploads`), a.responseType = "json", a.upload.addEventListener("progress", (r) => {
			U(n).identity !== t || !r.lengthComputable || h(e.id, { progress: Math.min(99, Math.round(r.loaded / r.total * 100)) });
		}), a.addEventListener("load", () => {
			if (s.delete(e.id), U(n).identity !== t || U(n).workspaceId !== r || U(n).resourceId !== i) return;
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
			resourceId: U(n).resourceId
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
	var b = kr(), x = R(b), S = (e) => {
		var t = jl(), n = L(t), r = z(n, 2), a = L(r), s = z(L(a), 2);
		X(L(s), { name: "x" }), k(s), k(a);
		var d = z(a, 2), f = L(d);
		Di(f, (e) => I(o, e), () => U(o));
		var p = z(f, 2), h = L(p);
		X(h, { name: "clipboard-paste" });
		var g = z(h, 4);
		X(L(g), { name: "folder-open" }), A(), k(g), k(p);
		var b = z(p, 2), x = L(b), S = (e) => {
			K(e, Dl());
		};
		J(x, (e) => {
			U(i).length || e(S);
		}), Hr(z(x, 2), 17, () => U(i), (e) => e.id, (e, t) => {
			let n = /* @__PURE__ */ N(() => y(U(t)));
			var r = Al();
			let i;
			var a = L(r), o = L(a);
			X(o, { get name() {
				return U(n).icon;
			} });
			var s = z(o), c = L(s), l = L(c, !0);
			k(c);
			var u = z(c), d = L(u, !0);
			k(u), k(s);
			var f = z(s), p = L(f, !0);
			k(f), k(a);
			var m = z(a, 2), h = L(m);
			let g;
			k(m);
			var _ = z(m, 2), b = (e) => {
				var n = Ol(), r = L(n, !0);
				k(n), B(() => q(r, U(t).path)), K(e, n);
			};
			J(_, (e) => {
				U(t).status === "success" && e(b);
			});
			var x = z(_, 2), S = (e) => {
				var n = kl(), r = L(n, !0);
				k(n), B(() => q(r, U(t).error || "Upload failed")), K(e, n);
			};
			J(x, (e) => {
				U(t).status === "error" && e(S);
			}), k(r), B((e) => {
				i = ai(r, 1, "upload-item", null, i, {
					"upload-item-success": U(t).status === "success",
					"upload-item-error": U(t).status === "error",
					"upload-item-uploading": U(t).status === "uploading"
				}), q(l, U(t).name), q(d, e), q(p, U(n).label), Y(m, "aria-label", U(t).name), Y(m, "aria-valuenow", U(t).progress), g = si(h, "", g, { width: `${U(t).progress}%` });
			}, [() => v(U(t).size)]), K(e, r);
		}), k(b), k(d);
		var C = z(d, 2), w = L(C), T = L(w, !0);
		k(w);
		var E = z(w, 2);
		k(C), k(r), k(t), B(() => {
			s.disabled = U(c), q(T, U(c) ? "Wait for uploads to finish before closing." : U(i).length ? `${U(l)} uploaded${U(u) ? ` · ${U(u)} failed` : ""}. Successful paths will be added to the chat input.` : "No files selected."), E.disabled = U(c);
		}), W("click", n, _), W("click", s, _), W("change", f, () => U(o).files && m(U(o).files)), br("dragover", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.add("dragging");
		}), br("dragleave", p, (e) => e.currentTarget.classList.remove("dragging")), br("drop", p, (e) => {
			e.preventDefault(), e.currentTarget.classList.remove("dragging"), e.dataTransfer?.files && m(e.dataTransfer.files);
		}), W("keydown", p, (e) => {
			(e.key === "Enter" || e.key === " ") && (e.preventDefault(), U(o).click());
		}), W("click", g, () => U(o).click()), W("click", E, _), K(e, t);
	};
	J(x, (e) => {
		U(n).open && e(S);
	}), K(e, b), M();
}
xr([
	"click",
	"change",
	"keydown"
]);
//#endregion
//#region src/ForgeApp.svelte
var Nl = /* @__PURE__ */ G("<!> <div data-component-owner=\"toast\" style=\"display: contents\"><!></div> <div data-component-owner=\"upload-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"create-dialog\" style=\"display: contents\"><!></div> <div data-component-owner=\"settings\" style=\"display: contents\"><!></div>", 1);
function Pl(e, t) {
	j(t, !0);
	var n = Nl(), r = R(n);
	oa(r, {
		get channel() {
			return t.channels.appShell;
		},
		details: (e) => {
			xs(e, { get channel() {
				return t.channels.detail;
			} });
		},
		timeline: (e) => {
			Gc(e, { get channel() {
				return t.channels.timeline;
			} });
		},
		composer: (e) => {
			pa(e, { get channel() {
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
	El(L(i), { get channel() {
		return t.channels.toast;
	} }), k(i);
	var a = z(i, 2);
	Ml(L(a), { get channel() {
		return t.channels.upload;
	} }), k(a);
	var o = z(a, 2);
	eo(L(o), { get channel() {
		return t.channels.create;
	} }), k(o);
	var s = z(o, 2);
	wl(L(s), { get channel() {
		return t.channels.settings;
	} }), k(s), K(e, n), M();
}
//#endregion
//#region src/components/model-channel.ts
function Fl(e) {
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
var Z = () => void 0, Il = async () => void 0;
function Ll() {
	return {
		appShell: Fl({
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
			onSwitchWorkspace: Il,
			onAddWorkspace: Z,
			onCreateProject: Z,
			onOpenSettings: Z,
			onToggleProject: Il,
			onSelectResource: Il,
			onReorder: Il,
			onDragState: Z,
			onPanePreview: Z,
			onPaneCommit: Z,
			onPaneViewport: Z,
			onMobileSidebar: Z,
			onMobileView: Z,
			onMobileImmersive: Z,
			onLayoutCycle: Z,
			onToast: Z,
			onIconsChanged: Z,
			onHistoryNavigation: Il
		}),
		create: Fl({
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
			onPreview: Il,
			onSubmit: Il,
			previewRequestKey: () => "",
			onConfirmTemplateSwitch: () => !0,
			onIconsChanged: Z
		}),
		settings: Fl({
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
			onAddWorkspace: Il,
			onRemoveWorkspace: Il,
			onWorkspaceIcon: Il,
			onSaveUser: async (e) => e,
			onSaveAgentHub: Il,
			onBrowserNotifications: Z,
			onCompletionSound: Z,
			onToast: Z,
			onIconsChanged: Z
		}),
		upload: Fl({
			open: !1,
			identity: "",
			workspaceId: "",
			resourceId: "",
			onDone: Z,
			onIconsChanged: Z
		}),
		composer: Fl({
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
			onDraft: Z,
			onSend: async () => ({
				accepted: !1,
				clear: !1
			}),
			onOpenUpload: Z,
			onEndTurn: Z,
			onSteerWaiting: Il,
			onIconsChanged: Z
		}),
		detail: Fl({
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
			onNavigate: Z,
			onCreateTask: Z,
			onArchive: Z,
			onLoadMoreLogs: Il,
			onSaveWorkspaceAgents: async () => ({ path: "AGENTS.md" }),
			onSaveAgentBinding: Il,
			onToast: Z,
			onIconsChanged: Z
		}),
		timeline: Fl({
			identity: "",
			workspaceId: "",
			resourceId: "",
			status: null,
			agentName: "Agent",
			project: () => [],
			onEvent: Z,
			onNotice: Z,
			onApproval: Il,
			onToast: Z,
			onIconsChanged: Z
		}),
		toast: Fl({
			message: "",
			revision: 0
		})
	};
}
//#endregion
//#region src/controllers/agent-draft-store.ts
var Rl = "forge.gui.agentDraft.v1", zl = 1, Bl = 50, Vl = 7776e6;
function Hl(e) {
	return encodeURIComponent(String(e || "").trim());
}
function Ul(e) {
	return String(e?.agentHubSessionId || e?.sourceExternalId || e?.id || "").trim();
}
function Wl(e) {
	return String(e || "").trim() || "workspace";
}
function Gl(e = {}) {
	let t = e.now || Date.now, n = e.maxOrphanCount ?? Bl, r = e.maxAgeMs ?? Vl;
	function i() {
		if ("storage" in e) return e.storage || null;
		try {
			return window.localStorage;
		} catch {
			return null;
		}
	}
	function a(e, t) {
		let n = String(t || "").trim(), r = Ul(e);
		return !n || !r ? "" : `${Rl}.session.${Hl(n)}.${Hl(r)}`;
	}
	function o(e, t) {
		let n = String(e || "").trim(), r = Wl(t);
		return !n || !r ? "" : `${Rl}.resource.${Hl(n)}.${Hl(r)}`;
	}
	function s(e) {
		if (!e) return null;
		try {
			let t = JSON.parse(e);
			return !t || t.version !== zl || typeof t.text != "string" ? null : {
				version: zl,
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
	function c(e) {
		let t = i();
		if (!t || !e) return null;
		let n = null;
		try {
			n = t.getItem(e);
		} catch {
			return null;
		}
		return s(n) || (n && u(e), null);
	}
	function l(e) {
		let t = c(e);
		return t?.text ? t.text : (t && u(e), "");
	}
	function u(e) {
		let t = i();
		if (!(!t || !e)) try {
			t.removeItem(e);
		} catch {}
	}
	function d(e, n, r) {
		if (!e) return;
		if (!n) {
			u(e);
			return;
		}
		let a = i();
		if (a) try {
			a.setItem(e, JSON.stringify({
				version: zl,
				text: n,
				updatedAt: t(),
				...r
			}));
		} catch {}
	}
	function f(e, a, o) {
		let s = i(), l = String(e || "").trim(), d = Wl(a);
		if (!s || !l) return;
		let f = `${Rl}.session.${Hl(l)}.`, p = [], m = t();
		try {
			for (let e = 0; e < s.length; e++) {
				let t = s.key(e);
				if (!t || !t.startsWith(f)) continue;
				let n = c(t);
				if (!(!n || Wl(n.resourceId) !== d || o.has(t))) {
					if (!n.text || n.updatedAt > 0 && m - n.updatedAt > r) {
						u(t);
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
				e && u(e.key);
			}
		} catch {}
	}
	return {
		keyForRun: a,
		keyForResource: o,
		read: l,
		remove: u,
		write: d,
		prune: f
	};
}
//#endregion
//#region src/controllers/agent-draft-controller.ts
function Kl(e) {
	let t = Gl(), { runtime: n } = e;
	function r(n, r = e.workspaceId()) {
		return t.keyForRun(n, r);
	}
	function i(t, i) {
		let a = /* @__PURE__ */ new Set();
		n.ttyDraftWorkspaceId === t && n.ttyDraftResourceId === i && n.ttyDraftKey && a.add(n.ttyDraftKey);
		for (let n of e.runs()) {
			if (Wl(n.resourceId) !== i) continue;
			let e = r(n, t);
			e && a.add(e);
		}
		return a;
	}
	function a(r = e.workspaceId(), a = n.ttyDraftResourceId) {
		let o = r.trim(), s = Wl(a);
		o && t.prune(o, s, i(o, s));
	}
	function o() {
		if (!n.ttyDraftKey) return;
		let r = {
			workspaceId: n.ttyDraftWorkspaceId,
			resourceId: n.ttyDraftResourceId,
			runId: n.ttyDraftRunId,
			sessionId: Ul(e.currentRun())
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
		n.ttyDraftKey !== s && (n.ttyDraftKey = s, n.ttyDraftWorkspaceId = o.trim(), n.ttyDraftResourceId = Wl(i.resourceId), n.ttyDraftRunId = i.id, n.ttyDraft = t.read(s), n.ttyMultiline = n.ttyDraft.includes("\n"), n.ttyDraftVersion++, a(n.ttyDraftWorkspaceId, n.ttyDraftResourceId));
	}
	function u(r, i = e.workspaceId()) {
		let a = Wl(r), o = t.keyForResource(i, a);
		if (!o) return c();
		n.ttyDraftKey !== o && (n.ttyDraftKey = o, n.ttyDraftWorkspaceId = i.trim(), n.ttyDraftResourceId = a, n.ttyDraftRunId = "", n.ttyDraft = t.read(o), n.ttyMultiline = n.ttyDraft.includes("\n"), n.ttyDraftVersion++);
	}
	function d(r) {
		return e.workspaceId() !== r.workspaceId || n.ttyDraftResourceId !== Wl(r.resourceId) || n.ttyDraftKey !== r.key || n.ttyDraft !== r.text || n.ttyDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
	}
	function f(r) {
		return e.workspaceId() !== r.workspaceId || e.currentRun()?.id !== r.runId || n.ttyDraftKey !== r.key || n.ttyDraft !== r.text || n.ttyDraftVersion !== r.version ? !1 : (t.remove(r.key), s("", !1), !0);
	}
	return {
		clearAfterAccepted: f,
		clearResourceAfterAccepted: d,
		clearMemory: c,
		flush: o,
		restore: l,
		restoreResource: u,
		update: s
	};
}
//#endregion
//#region src/controllers/agent-operation-controller.ts
function ql(e) {
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
function Jl(e, t = "Unexpected error") {
	return e instanceof Error && e.message ? e.message : e && typeof e == "object" && "message" in e ? String(e.message || t) : String(e || t);
}
//#endregion
//#region src/controllers/create-dialog-controller.ts
function Yl(e) {
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
function Xl(e) {
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
function Zl(e) {
	let t = 0, n = Yl(t), r = 0, i = null, a = "";
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
			previewRequestKey: (e) => JSON.stringify(Xl({
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
			...Yl(++t),
			open: !0,
			type: r,
			projectId: i
		}, e.onOpen(), u();
	}
	function f() {
		n.submitting || (c(), n = Yl(++t), u());
	}
	async function p(t) {
		if (l(t), !n.open || !n.templateName) return;
		let o = Xl({
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
			n.previewError = Jl(e);
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
					t = Xl(n);
				}
				await e.request(`/api/workspaces/${i}/tasks`, {
					method: "POST",
					body: JSON.stringify(t)
				}), e.toast("Task created.");
			}
			if (i !== e.workspaceId() || n.identity !== a) return;
			n.open = !1, n.identity = ++t, await e.reloadTree();
		} catch (t) {
			n.identity === a && (n.submitting = !1, u(), e.toast(Jl(t)));
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
function Ql() {
	if (window.Notification === void 0) return "unsupported";
	let e = String(window.Notification.permission || "default");
	return e === "granted" || e === "denied" ? e : "default";
}
function $l(e) {
	return `${e.resourceType === "project" ? "Project" : e.resourceType === "task" ? "Task" : "Session"}: ${e.title || e.resourceId || e.sessionId}`;
}
function eu(e) {
	return e.completionState === "failed" ? "Turn failed." : e.completionState === "cancelled" ? "Turn cancelled." : "Turn completed.";
}
function tu(e) {
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
		if (!(!e.settings().browser || Ql() !== "granted")) try {
			let n = new window.Notification($l(t), {
				body: eu(t),
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
		n.browser && Ql() === "granted" && e.claim(t, "browser", () => a(t)), n.sound && e.claim(t, "sound", i);
	}
	async function s() {
		let t = e.settings(), n = Ql();
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
			permission: Ql(),
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
var nu = "forge.gui.notifications.v1", ru = `${nu}.settings`;
function iu(e) {
	return e && typeof e == "object" ? e : null;
}
function au(e) {
	let t = iu(e);
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
function ou() {
	return {
		version: 1,
		seen: [],
		pending: [],
		unread: [],
		effects: []
	};
}
function su(e) {
	let t = iu(e);
	if (!t || t.version !== 1) return ou();
	let n = Array.isArray(t.seen) ? t.seen.map((e) => {
		let t = iu(e);
		return {
			marker: String(t?.marker || "").trim(),
			at: Number(t?.at) || Date.now()
		};
	}).filter((e) => e.marker) : [], r = Array.isArray(t.pending) ? t.pending.map(au).filter((e) => !!e) : [], i = Array.isArray(t.unread) ? t.unread.map(au).filter((e) => !!e) : [], a = Array.isArray(t.effects) ? t.effects.map((e) => {
		let t = iu(e);
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
function cu(e) {
	let t = e.trim();
	return t ? `${nu}.state.${encodeURIComponent(t)}` : "";
}
function lu(e) {
	function t(t) {
		let n = cu(t);
		if (!e || !n) return ou();
		try {
			let t = e.getItem(n);
			if (!t) return ou();
			let r = su(JSON.parse(t));
			return r.version !== 1 && e.removeItem(n), r;
		} catch {
			try {
				e.removeItem(n);
			} catch {}
			return ou();
		}
	}
	function n(t, n) {
		let r = su(n), i = cu(t);
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
			let t = iu(JSON.parse(e.getItem(ru) || "null"));
			return !t || t.version !== 1 ? {
				browser: !1,
				sound: !1
			} : {
				browser: !!t.browser,
				sound: !!t.sound
			};
		} catch {
			try {
				e.removeItem(ru);
			} catch {}
			return {
				browser: !1,
				sound: !1
			};
		}
	}
	function i(t) {
		if (e) try {
			e.setItem(ru, JSON.stringify({
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
function uu(e) {
	let t = String(e.completionMarker || e.agentRunCompletionMarker || "").trim();
	if (t) return t;
	let n = String(e.agentHubSessionId || e.completionSessionId || "").trim(), r = Number(e.completionEventId) || 0;
	return n && r > 0 ? `${n}:${r}` : "";
}
function du(e) {
	return String(e.forgeSessionId || e.sessionId || e.agentHubSessionId || e.id || "").trim();
}
function fu(e, t) {
	return e.source === "internal" || e.source === "external" ? t(e).resourceId || "" : e.resourceId ? String(e.resourceId).trim() : "";
}
function pu(e) {
	return e.type === "turn.failed" ? "failed" : e.type === "turn.cancelled" ? "cancelled" : e.type === "turn.completed" ? "completed" : "";
}
function mu(e, t) {
	let n = fu(e, t.navigationTarget), r = t.findResource(n);
	return au({
		workspaceId: t.workspaceId,
		sessionId: du(e),
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
function hu(e) {
	if ("storage" in e) return e.storage || null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}
function gu(e) {
	let t = lu(hu(e)), n = {
		ready: !1,
		workspaceId: "",
		store: null,
		settings: null,
		channel: null,
		tabId: `tab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
	};
	function r() {
		return n.store ||= ou(), n.store;
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
			E(t.marker);
		}
	}
	let g = tu({
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
			let r = new t(`${nu}.${encodeURIComponent(e)}`);
			r.onmessage = (e) => b(e.data), n.channel = r;
		} catch {
			n.channel = null;
		}
	}
	function y(e) {
		let r = e.trim();
		r && (_(), n.workspaceId = r, n.store = t.readStore(r), n.settings = t.readSettings(), Ql() !== "granted" && (n.settings.browser = !1, t.writeSettings(n.settings)), n.ready = !1, v(r));
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
			let n = au(t.record);
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
		let a = uu(t);
		if (!a || !n.workspaceId) return !1;
		let s = mu(t, {
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
		for (let t of e) uu(t) && x(t, t.completionState || t.agentRunCompletionState || "");
	}
	function C(e, t) {
		let n = pu(e);
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
	function E(t) {
		let n = t.trim();
		if (!n) return;
		let i = r();
		(i.unread.some((e) => e.marker === n) || i.pending.some((e) => e.marker === n)) && (i.unread = i.unread.filter((e) => e.marker !== n), i.pending = i.pending.filter((e) => e.marker !== n), o(), u({
			type: "clear-marker",
			marker: n
		}), e.hasTree() && e.renderSessions());
	}
	function ee(t) {
		let n = t.trim();
		if (!n) return;
		let i = r();
		(i.unread.some((e) => e.resourceId === n) || i.pending.some((e) => e.resourceId === n)) && (i.unread = i.unread.filter((e) => e.resourceId !== n), i.pending = i.pending.filter((e) => e.resourceId !== n), o(), u({
			type: "clear-resource",
			resourceId: n
		}), e.hasTree() && e.renderSessions());
	}
	function te() {
		e.scope.listen(window, "storage", (r) => {
			r.key === cu(n.workspaceId) && r.newValue && (n.store = t.readStore(n.workspaceId), e.hasTree() && e.renderSessions()), r.key === ru && (n.settings = t.readSettings(), Ql() !== "granted" && (n.settings.browser = !1), e.notificationsSettingsVisible() && e.renderSettings());
		}), e.scope.listen(document, "visibilitychange", () => {
			e.flushDraft(), c() && ee(e.selectedResourceId());
		}), e.scope.listen(window, "focus", () => ee(e.selectedResourceId()));
	}
	function ne() {
		return i(), g.preferences();
	}
	function re() {
		_(), g.dispose();
	}
	return {
		initialize: y,
		install: te,
		dispose: re,
		establishBaseline: w,
		observeProjections: S,
		observeEvent: C,
		hasUnreadForSession: T,
		clearResource: ee,
		preferences: ne,
		setBrowserEnabled: g.setBrowserEnabled,
		setSoundEnabled: g.setSoundEnabled
	};
}
//#endregion
//#region src/controllers/pane-layout-controller.ts
var _u = "forge.gui.paneSizes", vu = "forge.gui.mobileImmersive", yu = "forge.gui.layoutPreference", bu = 8, xu = 220, Su = 360, Cu = 320, wu = 1e4, Tu = Object.freeze({
	sidebarWidth: 280,
	chatWidth: 420,
	sidebarSessionHeight: 210
}), Eu = Object.freeze({
	sidebarWidth: "--sidebar-width",
	chatWidth: "--chat-width",
	sidebarSessionHeight: "--sidebar-session-height"
});
function Du(e, t, n) {
	return Math.min(n, Math.max(t, e));
}
function Ou(e) {
	return typeof e == "number" && Number.isFinite(e);
}
var ku = [
	"auto",
	"three",
	"two",
	"split"
];
function Au(e) {
	return ku.includes(e) ? e : "auto";
}
function ju(e, t = 0) {
	let n = e && typeof e == "object" ? e : {}, r = { ...Tu };
	if (Ou(n.sidebarWidth) && (r.sidebarWidth = Du(n.sidebarWidth, xu, wu)), Ou(n.chatWidth)) r.chatWidth = Du(n.chatWidth, Cu, wu);
	else if (Ou(n.detailsWidth) && t >= 688) {
		let e = Du(n.detailsWidth, Su, t - bu - Cu);
		r.chatWidth = Du(t - bu - e, Cu, wu);
	}
	return Ou(n.sidebarSessionHeight) && (r.sidebarSessionHeight = Du(n.sidebarSessionHeight, 84, wu)), r;
}
function Mu(e, t = window.localStorage) {
	let n = { ...Tu }, r = {
		sidebarOpen: !1,
		view: "details",
		immersive: !1
	}, i = "auto", a = window.matchMedia("(max-width: 980px)"), o = window.matchMedia("(max-width: 1440px)");
	function s() {
		if (!t) return {};
		try {
			let e = JSON.parse(t.getItem(_u) || "{}");
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
		if (!Object.hasOwn(Eu, e) || !Number.isFinite(t)) return;
		let r = e, i = Math.round(Du(t, r === "sidebarWidth" ? xu : r === "chatWidth" ? Cu : 84, wu));
		n[r] = i, l(Eu[r], i);
	}
	function d() {
		for (let e of Object.keys(Eu)) u(e, n[e]);
	}
	function f() {
		t?.setItem(_u, JSON.stringify(n));
	}
	function p() {
		let l = s();
		n = ju(l, 0), d(), Ou(l.detailsWidth) && !Ou(l.chatWidth) && !a.matches && (n = ju(l, c()), d(), f());
		try {
			r.immersive = t?.getItem(vu) === "1";
		} catch {
			r.immersive = !1;
		}
		document.body.classList.toggle("chat-immersive", r.immersive);
		try {
			i = Au(t?.getItem(yu));
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
		if (!Object.hasOwn(Eu, e) || !t) return;
		let r = e, i = s();
		delete i.detailsWidth;
		for (let e of Object.keys(Eu)) Ou(i[e]) || (i[e] = n[e]);
		i[r] = n[r], t.setItem(_u, JSON.stringify(i));
	}
	function h() {
		if (a.matches) return;
		let e = s();
		!Ou(e.detailsWidth) || Ou(e.chatWidth) || (n = ju(e, c()), d(), f());
	}
	function g() {
		return a.matches ? "single" : i === "auto" ? o.matches ? "two" : "three" : i;
	}
	function _() {
		document.body.dataset.layout = g();
	}
	function v(n) {
		i = Au(n);
		try {
			t?.setItem(yu, i);
		} catch {}
		_(), e();
	}
	function y() {
		let e = ku[(ku.indexOf(i) + 1) % ku.length];
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
			t?.setItem(vu, r.immersive ? "1" : "0");
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
function Nu(e, t) {
	let n = Date.parse(String(e?.time || "")), r = Date.parse(String(t?.time || ""));
	return Number.isFinite(n) && Number.isFinite(r) && n !== r ? r - n : String(t?.time || "").localeCompare(String(e?.time || ""));
}
function Pu(e, t, n) {
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
	return r.sort(Nu);
}
function Fu(e, t = 10, n = 20) {
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
			logs: Pu([], o, !0),
			logPage: {
				hasMore: c.hasMore,
				nextCursor: c.nextCursor
			}
		}, e.details[r];
		let l = e.details[r], u = Pu(l.logs || [], o, n !== "older");
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
			d(r, t, a, l) && (a.error = Jl(e, "Could not load older logs."));
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
function Iu(e = "") {
	try {
		return decodeURIComponent(e);
	} catch {
		return "";
	}
}
function Lu(e) {
	let t = e.split("/").filter(Boolean);
	return t[0] === "w" ? {
		workspaceId: Iu(t[1]),
		resourceId: t[2] === "r" ? Iu(t[3]) : "workspace"
	} : {};
}
function Ru(e, t = "") {
	let n = String(e || "").trim();
	if (!n) return "";
	let r = t && t !== "workspace" ? String(t) : "";
	return r ? `/w/${encodeURIComponent(n)}/r/${encodeURIComponent(r)}` : `/w/${encodeURIComponent(n)}`;
}
function zu(e) {
	let t = {
		path: "",
		revision: 0,
		replace: !0
	};
	function n(n, r, i = {}) {
		let a = Ru(n, r);
		a && (window.location.pathname !== a || t.path !== a) && (t = {
			path: a,
			revision: t.revision + 1,
			replace: !!i.replace
		}, e());
	}
	return {
		parse: (e = window.location.pathname) => Lu(e),
		project: n,
		projection: () => ({ ...t })
	};
}
//#endregion
//#region src/controllers/settings-controller.ts
function Bu(e, t) {
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
function Vu(e) {
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
		}), await o(), e.setConfig(Bu(await e.request("/api/workspaces"), n.data?.agentHub || {})), n.agentDirty = !1, e.renderAgentViews(), r(), e.onIconsChanged(), e.toast("AgentHub settings saved.");
	}
	return {
		open: i,
		close: a,
		render: r,
		refresh: o,
		isOpenTab: (e) => n.open && n.tab === e,
		providers: () => n.data?.agentHub?.catalog?.providers || [],
		profiles: () => n.data?.agentProfiles || [],
		withAgentHubCatalog: Bu
	};
}
//#endregion
//#region src/controllers/shell-projection.ts
var Hu = /* @__PURE__ */ new Set([
	"starting",
	"running",
	"waiting_approval",
	"recovering"
]), Uu = 6e4;
function Wu(e) {
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
		if (Number.isFinite(n)) return t() - n <= Uu;
		if (!["running", "starting"].includes(e.agentRunStatus || "")) return !1;
		let r = new Date(e.agentRunUpdatedAt || "").getTime();
		return Number.isFinite(r) && t() - r <= Uu;
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
		let t = (e.children || []).filter((e) => e.archived !== !0), n = new Set(t.filter((e) => f(e.id).some((e) => e.source === "internal" && Hu.has(e.agentRunStatus || ""))).map((e) => e.id)), r = `${t.length} ${t.length === 1 ? "task" : "tasks"}`, i = `${n.size} running`;
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
var Gu = "forge.gui.user.v1", Ku = 1, qu = 80;
function Ju(e) {
	let t = String(e || "").trim();
	return t && Array.from(t).slice(0, qu).join("") || "User";
}
function Yu(e) {
	if (!e) return "User";
	try {
		let t = JSON.parse(e);
		return !t || t.version !== Ku ? "User" : Ju(t.name);
	} catch {
		return "User";
	}
}
function Xu(e, t) {
	let n = r();
	function r() {
		try {
			return Yu(window.localStorage.getItem(Gu));
		} catch {
			return "User";
		}
	}
	function i(e) {
		let t = Ju(e);
		try {
			window.localStorage.setItem(Gu, JSON.stringify({
				version: Ku,
				name: t
			}));
		} catch {
			throw Error("User name could not be saved in this browser.");
		}
		return n = t, n;
	}
	return e.listen(window, "storage", (e) => {
		e.key === Gu && (n = Yu(e.newValue), t());
	}), {
		current: () => n,
		save: i
	};
}
//#endregion
//#region src/runtime/resource-scope.ts
var Zu = class {
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
}, Qu = 400, $u = 12e3;
function ed(e, t = Qu) {
	let n = String(e ?? "");
	return n.length > t ? `${n.slice(0, t - 1)}…` : n;
}
function td(e) {
	if (e == null) return "";
	try {
		return ed(JSON.stringify(e));
	} catch {
		return "";
	}
}
function nd(e) {
	let t = String(e || "").replace(/[_-]+/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
	return t ? t.charAt(0).toUpperCase() + t.slice(1) : "";
}
function rd(e) {
	return Array.isArray(e) ? e.filter((e) => typeof e == "string").join(" ") : typeof e == "string" ? e : "";
}
function Q(...e) {
	for (let t of e) if (typeof t == "string" && t.trim()) return t.trim();
	return "";
}
var id = /* @__PURE__ */ new Set([
	"user",
	"system",
	"agent",
	"assistant"
]);
function ad(e) {
	if (!e || typeof e != "object" || Array.isArray(e)) return;
	let t = {};
	for (let n of [
		"id",
		"name",
		"sessionId"
	]) typeof e[n] == "string" && e[n].trim() && (t[n] = e[n].trim());
	return Object.keys(t).length ? t : void 0;
}
function od(e) {
	let t = typeof e == "string" ? e.trim().toLowerCase() : "";
	return id.has(t) ? t : "user";
}
function sd(e) {
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
function cd(e) {
	if (!Array.isArray(e)) return "";
	let t = [];
	for (let n of e) typeof n?.text == "string" ? t.push(n.text) : typeof n?.content?.text == "string" ? t.push(n.content.text) : n?.type === "diff" && typeof n?.path == "string" && t.push(`Edit ${n.path}`);
	return t.filter(Boolean).join("\n");
}
function ld(e) {
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
		let a = Q(e.id, r.itemId), o = nd(t) || "Tool", s = "", c = "", l = "";
		t === "commandExecution" ? (o = "Command", s = rd(e.command) || Q(e.cmd), c = Q(e.aggregatedOutput, e.output), typeof e.exitCode == "number" && e.exitCode !== 0 && (l = `Exit code ${e.exitCode}`)) : t === "fileChange" ? (o = "File change", s = (Array.isArray(e.changes) ? e.changes.map((e) => e?.path).filter(Boolean) : []).join(", ")) : t === "mcpToolCall" ? (o = "MCP", s = [e.server, e.tool].filter((e) => typeof e == "string" && e).join(" / "), c = typeof e.result == "string" ? e.result : td(e.result), l = Q(e.error?.message, typeof e.error == "string" ? e.error : "")) : t === "webSearch" ? (o = "Web search", s = Q(e.query)) : (s = Q(e.title, e.name, rd(e.command), e.path), c = Q(e.output, e.aggregatedOutput));
		let u = sd(e.status);
		return n === "item/started" && (u = "running"), n === "item/completed" && u === "running" && (u = "completed"), l && u === "completed" && (u = "failed"), {
			callId: a,
			method: n,
			time: i,
			name: o,
			status: u,
			error: l,
			summary: ed(s.replace(/\s+/g, " ").trim(), 120),
			output: ed(c, $u)
		};
	}
	let a = r.update && typeof r.update == "object" ? r.update : r, o = Q(a.sessionUpdate);
	if (o === "tool_call" || o === "tool_call_update") {
		let e = Q(a.toolCallId, a.id), t = a.rawInput && typeof a.rawInput == "object" ? a.rawInput : {}, r = Q(a.title, rd(t.command), t.path, t.filePath, nd(a.kind));
		return {
			callId: e,
			method: n,
			time: i,
			name: nd(a.kind) || "Tool",
			status: sd(a.status || (o === "tool_call" ? "in_progress" : "")),
			summary: ed(r.replace(/\s+/g, " ").trim(), 120),
			output: ed(cd(a.content), $u),
			error: ""
		};
	}
	if (n === "tool_execution_start" || n === "tool_execution_end") {
		let e = Q(r.toolName, r.name, r.tool), t = r.args && typeof r.args == "object" ? r.args : {}, a = Q(rd(t.command), t.path, t.filePath, ""), o = r.isError === !0 || !!Q(r.error);
		return {
			callId: Q(r.toolCallId, r.callId, e),
			method: n,
			time: i,
			name: nd(e) || "Tool",
			status: n === "tool_execution_start" ? "running" : o ? "failed" : "completed",
			summary: ed(a.replace(/\s+/g, " ").trim(), 120),
			output: ed(Q(typeof r.result == "string" ? r.result : "", cd(r.result?.content)), $u),
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
function ud(e) {
	let t = e?.data ?? {}, n = Q(t.method), r = t.params && typeof t.params == "object" ? t.params : {}, i = Array.isArray(r.options) ? r.options.map((e) => ({
		optionId: Q(e?.optionId),
		name: Q(e?.name),
		kind: Q(e?.kind)
	})).filter((e) => e.optionId) : [], a = rd(r.command) || rd(r?.rawInput?.command);
	if (a) return {
		title: "Run command",
		detail: ed(a, 160),
		question: "",
		options: i
	};
	let o = Array.isArray(r.changes) ? r.changes.map((e) => e?.path).filter(Boolean) : [];
	if (r.toolCall && typeof r.toolCall == "object") {
		let e = Q(r.toolCall.title, r.toolCall.kind && nd(r.toolCall.kind)), t = cd(r.toolCall.content);
		return {
			title: e || "Permission requested",
			detail: "",
			question: t,
			options: i
		};
	}
	return o.length ? {
		title: "Apply file changes",
		detail: ed(o.join(", "), 160),
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
var dd = {
	accept: "Allowed",
	acceptForSession: "Allowed for this session",
	decline: "Declined",
	cancel: "Cancelled"
}, fd = {
	failed: "Session failed",
	stopping: "Stopping provider",
	stopped: "Session stopped",
	archived: "Session archived"
}, pd = {
	requested: "requested",
	completed: "provider completed",
	provider_error: "provider error",
	startup_error: "startup error",
	daemon_recovery: "daemon recovery"
};
function md(e) {
	return e === "message.delivery" || e === "provider.event" || e === "provider.metadata" || e === "plan.event" || e === "provider.stderr" || e === "provider.turn.started" || e === "provider.turn.completed" || e.startsWith("provider.process.");
}
function hd(e, t) {
	let n = { ...e };
	return t.name && (n.name = t.name), t.summary && (n.summary = t.summary), t.status && (n.status = t.status), t.error && (n.error = t.error), t.deltaOnly ? n.output = ed((n.output || "") + (t.output || ""), $u) : t.output && (n.output = t.output), n.time = t.time || e.time, n.key = e.key, n;
}
function gd(e, t) {
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
		rawPreview: td(t?.data?.raw)
	};
}
function _d(e) {
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
					role: od(o.role),
					key: a.id,
					time: s,
					steer: o.steer === !0,
					text: typeof o.text == "string" ? o.text : ""
				};
				a.turnId && (e.turnId = a.turnId);
				let n = ad(o.sender);
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
				let e = ld(a);
				if (!e) break;
				let n = t.at(-1), i = n?.kind === "tools" ? n : null, o = e.callId ? r.get(e.callId) : null;
				if (o) Object.assign(o.call, hd(o.call, e)), o.group.time = s, o.call.status !== "running" && r.delete(e.callId);
				else {
					if (e.deltaOnly) break;
					let n = i || {
						kind: "tools",
						key: a.id,
						calls: [],
						time: s
					}, o = gd(e, a);
					n.calls.push(o), n.time = s, i || t.push(n), o.callId && o.status === "running" && r.set(o.callId, {
						call: o,
						group: n
					});
				}
				break;
			}
			case "approval.requested": {
				let { title: e, detail: r, question: i, options: c } = ud(a), l = {
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
				let e = Q(o.approvalId), r = Q(o.decision) || "decline", i = Q(o.optionId), c = Q(o.text), l = e ? n.get(e) : null, u = (e) => r === "text" ? "Replied" : i ? `Answered: ${e?.options?.find((e) => e.optionId === i)?.name || i}` : dd[r] || nd(r), d = r === "accept" || r === "acceptForSession" || r === "text";
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
				let e = fd[o.state];
				o.state === "failed" ? i("failed", s) : o.state === "stopped" && i(o.reason === "completed" ? "completed" : "failed", s), o.state === "stopped" && pd[o.reason] && (e += ` · ${pd[o.reason]}`);
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
				if (md(e)) break;
				t.push({
					kind: "unknown",
					key: a.id,
					time: s,
					type: e || "unknown",
					preview: td(o)
				});
		}
	}
	let a = t.at(-1);
	return a?.kind === "thinking" && (a.active = !0), t;
}
//#endregion
//#region src/app-controller.ts
var vd, yd = null, $ = {
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
		resourceId: "",
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
	messageStatus: null,
	messageStatusKey: "",
	messageStatusRequestVersion: 0,
	steeringMessageId: "",
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
function bd() {
	for (let e of Object.keys($.details)) delete $.details[e];
	for (let e of Object.keys($.resourceLogPages)) delete $.resourceLogPages[e];
}
var xd = Kl({
	runtime: $.agent,
	workspaceId: () => $.activeWorkspaceId,
	runs: () => $.agent.runs,
	currentRun: () => Fp()
}), Sd = xd.clearResourceAfterAccepted, Cd = xd.clearMemory, wd = xd.flush, Td = xd.restoreResource, Ed = xd.update, Dd = ql(() => {
	bm && (wp(), um());
}), Od = Mu(() => Ff()), kd = zu(() => Ff()), Ad = Fu({
	details: $.details,
	pages: $.resourceLogPages,
	context: () => ({
		workspaceId: $.activeWorkspaceId,
		navigationVersion: $.navigationVersion,
		selectedId: $.selectedId,
		detailRequestVersion: $.detailRequestVersion
	}),
	nextDetailRequestVersion: () => ++$.detailRequestVersion,
	isCurrentWorkspace: (e, t) => Of(e, t),
	request: (e, t) => ff(e, t),
	render: Jf,
	refreshIcons: um
}), jd = Zl({
	workspaceId: () => $.activeWorkspaceId,
	templates: (e) => $.details[e]?.templates || [],
	request: (e, t) => ff(e, t),
	publish: (e) => vd.renderCreateDialog(e),
	toast: lm,
	reloadTree: () => mf(),
	selectWorkspaceResource: () => {
		$.selectedId = "workspace";
	},
	onOpen: () => {
		$.modalEnter = "create";
	},
	onIconsChanged: um,
	confirmTemplateSwitch: () => window.confirm("Discard edited template fields and switch templates?")
}), Md = (e) => document.getElementById(e), Nd = 5e3, Pd = 10, Fd = /* @__PURE__ */ new Set(["session.launch-environment"]), Id = {
	id: "",
	label: "Forge default",
	src: "/favicon.svg",
	type: "image/svg+xml"
}, Ld = [
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
], Rd = new Map(Ld.map((e) => [e.id, e])), { applyCustomOrder: zd, moveIdInList: Bd, noTaskOperationalState: Vd, operationalStatusPresentation: Hd, projectTaskSummary: Ud, resourceRefText: Wd, sessionOperationalLabel: Gd, sessionStatusPresentation: Kd, sortedSessionsForDisplay: qd, statusModel: Jd, taskOperationalState: Yd, taskOperationalStateKey: Xd, taskStatusState: Zd } = Wu({
	tree: () => $.tree,
	findResource: (e) => Gp(e),
	agentName: (e) => ($.config?.agents || []).find((t) => t.id === e)?.name || e || "Forge GUI"
}), Qd = 0, $d = Vu({
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
	request: (e, t) => ff(e, t),
	publish: (e) => vd.renderSettings(e),
	agentOptions: ef,
	workspaceIcons: [Id, ...Ld],
	userName: df,
	saveUser: (e) => {
		if (!rf) throw Error("User settings are unavailable.");
		return rf.save(e);
	},
	notificationPreferences: () => nf?.preferences() || {
		browser: !1,
		sound: !1,
		permission: "unsupported",
		permissionError: "",
		soundError: ""
	},
	setBrowserNotifications: (e) => nf?.setBrowserEnabled(e),
	setCompletionSound: (e) => nf?.setSoundEnabled(e),
	flushDraft: wd,
	resetAgentState: pp,
	reloadWorkspaceContext: async () => {
		await Sf(), await mf();
	},
	clearWorkspaceContext: () => {
		$.tree = null, bd(), Ef();
	},
	renderWorkspace: Mf,
	renderAgentViews: () => {
		em(), wp();
	},
	toast: lm,
	onIconsChanged: um
});
function ef() {
	return nm().map((e) => ({
		id: e.id || "",
		label: Tp(e),
		summary: yp(e)
	}));
}
function tf() {
	Ff(), Jf(), Up(), Mp(), wp(), Sp(), Ep();
}
var nf = null, rf = null;
function af(e) {
	nf?.initialize(e);
}
function of() {
	nf?.establishBaseline();
}
function sf(e) {
	nf?.observeProjections(e);
}
function cf(e, t) {
	t && nf?.observeEvent(e, t);
}
function lf(e) {
	return nf?.hasUnreadForSession(e) ?? !1;
}
function uf(e) {
	nf?.clearResource(e);
}
function df() {
	return rf?.current() || "User";
}
async function ff(e, t = {}) {
	let n = await fetch(e, {
		headers: { "Content-Type": "application/json" },
		...t
	});
	if (!n.ok) {
		let e = `${n.status} ${n.statusText}`;
		try {
			e = (await n.json()).error || e;
		} catch {}
		throw new to(n.status, e);
	}
	return n.status === 204 ? null : n.json();
}
async function pf() {
	let e = Xp(), [t, n] = await Promise.all([ff("/api/workspaces"), ff("/api/settings/agenthub")]);
	$.config = om(t, n), em(), $.activeWorkspaceId = Zp(e.workspaceId) ? e.workspaceId || "" : $.config?.activeId || $.config?.workspaces[0]?.id || "", $.selectedId = e.resourceId || "workspace", Mf(), $.activeWorkspaceId ? (af($.activeWorkspaceId), await Sf(), !e.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await mf({ replaceURL: !0 })) : ($.navigationLoading = !1, $.tree = null, bd(), $.workspaceAgents = null, $.preview = null, $.diff = null, pp(), Ef());
}
async function mf(e = {}) {
	if (!$.activeWorkspaceId) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.treeRequestVersion;
	$.navigationLoading = !0, $.navigationError = "", Ff(), $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let i;
	try {
		i = await ff(`/api/workspaces/${t}/tree`);
	} catch (e) {
		throw Of(t, n, r) && ($.navigationLoading = !1, $.navigationError = Jl(e), Ff()), e;
	}
	Of(t, n, r) && ($.tree = i, bd(), $.workspaceAgents = null, $.workspaceAgentsSaving = !1, $.preview = null, $.diff = null, Kp(), Yp(!1), $.selectedId === "workspace" ? await xf() : $.selectedId && await hf($.selectedId), Of(t, n, r) && (await ip(), Of(t, n, r) && (await up(t, Lp()), Of(t, n, r) && (of(), $.navigationLoading = !1, $.navigationError = "", Ef(), e.updateURL !== !1 && Qp({ replace: !!e.replaceURL })))));
}
async function hf(e, t = {}) {
	return Ad.load(e, t);
}
function gf(e, t = $.activeWorkspaceId, n = {}) {
	return Ad.fetch(e, t, n);
}
function _f(e) {
	Ad.reset(e);
}
function vf(e) {
	return Ad.snapshot(e);
}
function yf(e, t = "head") {
	return Ad.apply(e, t);
}
async function bf(e = $.selectedId) {
	await Ad.loadMore(e);
}
async function xf(e = {}) {
	if (!$.activeWorkspaceId || $.workspaceAgents && !e.force) return;
	let t = $.activeWorkspaceId, n = $.navigationVersion, r = ++$.workspaceAgentsRequestVersion;
	try {
		let e = await ff(`/api/workspaces/${t}/files?path=AGENTS.md`);
		if (!Of(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = e;
	} catch (e) {
		if (!Of(t, n) || r !== $.workspaceAgentsRequestVersion) return null;
		$.workspaceAgents = {
			path: "AGENTS.md",
			name: "AGENTS.md",
			error: Jl(e)
		};
	}
	return $.workspaceAgents;
}
async function Sf(e = $.activeWorkspaceId, t = $.navigationVersion) {
	let n = await ff(`/api/workspaces/${e}/ui-state`);
	return Of(e, t) ? ($.expandedProjects = new Set(n.expandedProjects || []), $.lastResourceId = n.lastResourceId || "", $.projectOrder = Array.isArray(n.projectOrder) ? n.projectOrder : [], $.taskOrder = n.taskOrder && typeof n.taskOrder == "object" ? n.taskOrder : {}, $.sessionOrder = Array.isArray(n.sessionOrder) ? n.sessionOrder : [], !0) : !1;
}
async function Cf() {
	if (!$.activeWorkspaceId) return;
	let e = $.activeWorkspaceId, t = $.navigationVersion, n = $.selectedId;
	await ff(`/api/workspaces/${e}/ui-state`, {
		method: "PUT",
		body: JSON.stringify({
			version: 1,
			expandedProjects: [...$.expandedProjects],
			lastResourceId: n,
			projectOrder: $.projectOrder,
			taskOrder: $.taskOrder,
			sessionOrder: $.sessionOrder
		})
	}), Of(e, t) && ($.lastResourceId = n);
}
function wf() {
	$.autoRefreshTimer ||= yd?.interval(() => {
		Tf().catch((e) => {
			console.warn("auto refresh failed", e);
		});
	}, Nd) ?? null;
}
async function Tf() {
	if (!$.activeWorkspaceId || $.autoRefreshInFlight || $.agentSessionMutationCount > 0 || $.listDrag) return;
	let e = $.autoRefreshVersion, t = $.activeWorkspaceId, n = $.navigationVersion, r = $.selectedId;
	$.autoRefreshInFlight = !0;
	try {
		let i = await sp(t);
		if (!i || !kf(t, n, e)) return;
		let a = !sm($.tree, i);
		if (a && ($.tree = i), typeof sf == "function" && sf(i.sessions || []), a && $.preview?.section === "Wiki" && !$.preview.loading && (await $f("Wiki", $.preview.path), !kf(t, n, e))) return;
		Kp() && (Qp({ replace: !0 }), a = !0, r = $.selectedId);
		let o = $.expandedProjects.size;
		if (Yp(!1), a ||= o !== $.expandedProjects.size, $.selectedId === "workspace") {
			let r = $.workspaceAgents;
			if (await xf({ force: !0 }), !kf(t, n, e)) return;
			sm(r, $.workspaceAgents) || (a = !0);
		} else if (r) {
			let i = ++$.detailRequestVersion, o = await gf(r, t, { logsLimit: Pd });
			if (!kf(t, n, e) || $.selectedId !== r || i !== $.detailRequestVersion) return;
			let s = vf(r);
			yf(o, "head"), sm(s, vf(r)) || (a = !0);
		}
		$.agentRunProjectionVersion = (Number($.agentRunProjectionVersion) || 0) + 1;
		let s = $.agentRunProjectionVersion, c = await lp();
		if (!kf(t, n, e) || s !== $.agentRunProjectionVersion) return;
		if (sm($.agent.runs, c) || ($.agent.runs = c, a = !0), typeof sf == "function" && sf(c), ap(c)) {
			if (!kf(t, n, e) || s !== $.agentRunProjectionVersion) return;
			a = !0;
		}
		await up(t, Lp()) && (a = !0), Xd() !== $.taskOperationalStateKey && (a = !0), a && Ef();
	} finally {
		$.autoRefreshInFlight = !1;
	}
}
function Ef() {
	Ff(), Jf(), Sp(), um(), Up(), Ep();
}
function Df() {
	Ff(), Jf(), Sp(), um(), Up();
}
function Of(e, t, n = null) {
	return e === $.activeWorkspaceId && t === $.navigationVersion && (n == null || n === $.treeRequestVersion);
}
function kf(e, t, n) {
	return Of(e, t) && n === $.autoRefreshVersion;
}
function Af(e) {
	return Rd.get(String(e?.icon || "").trim()) || Id;
}
function jf(e) {
	let t = Af(e), n = document.querySelector("link[rel=\"icon\"]");
	n || (n = document.createElement("link"), n.rel = "icon", document.head.appendChild(n)), n.type = "type" in t ? String(t.type || "image/png") : "image/png", n.href = t.src;
}
function Mf() {
	let e = $.config?.workspaces?.find((e) => e.id === $.activeWorkspaceId);
	jf(e), Ff();
}
function Nf(e, t, n = "") {
	let r = Yd(e), i = t === "project" && Jp(e.id), a = t === "project" ? Ud(e) : null, o = e.title || e.id;
	return {
		id: e.id,
		type: t,
		title: o,
		ref: Wd(e.id),
		active: $.selectedId === e.id,
		expanded: i,
		ariaLabel: [
			o,
			a?.ariaLabel,
			r.label
		].filter(Boolean).join(". "),
		statusLabel: r.label || "",
		status: Jd(r.statusPresentation),
		summary: a ? {
			taskLabel: a.taskLabel,
			runningLabel: a.runningLabel,
			ariaLabel: a.ariaLabel
		} : null,
		children: t === "project" ? zd(e.children || [], $.taskOrder[e.id]).map((t) => Nf(t, "task", e.id)) : [],
		projectId: n
	};
}
function Pf(e) {
	let t = Uf(e), n = t.displayResourceId, r = e.source === "internal", i = r ? Kd(e) : Zd("session-external", "session-status-external", "message-square", "External session active", "session"), a = Wf(e), o = a ? Yd(a) : Vd(), s = Hd([i]), c = lf(e.id), l = `${Gd(e, a, o, i)}${c ? ". Unread turn completion." : ""}`, u = r ? ($.config?.agents || []).find((t) => t.id === e.agentRunAgentName) : null, d = [r ? "AgentHub" : "External"];
	return n && d.push(n), e.updatedAt && d.push(Rp(e.updatedAt)), {
		id: e.id,
		source: e.source || "external",
		title: Vf(e, t),
		meta: d.join(" · "),
		label: r ? u?.name || e.agentRunAgentName || "AgentHub" : "External",
		statusLabel: l,
		status: Jd(s),
		unread: c,
		current: !!($.selectedId && $.selectedId !== "workspace" && t.selectedResourceIds.includes($.selectedId)),
		clickable: !!t.navigationResourceId,
		navigationResourceId: t.navigationResourceId
	};
}
function Ff() {
	let e = $.tree ? zd($.tree.projects || [], $.projectOrder).map((e) => Nf(e, "project")) : [], t = zd(qd($.tree?.sessions || []), $.sessionOrder).map(Pf);
	$.tree && ($.taskOperationalStateKey = Xd()), vd.renderAppShell({
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
			iconSrc: Af(e).src
		})),
		projects: e,
		sessions: t,
		...Od.snapshot(),
		route: kd.projection(),
		onSwitchWorkspace: (e) => If(e),
		onAddWorkspace: () => am("workspace").catch((e) => lm(e.message)),
		onCreateProject: () => zp(),
		onOpenSettings: () => am().catch((e) => lm(e.message)),
		onToggleProject: (e) => zf(e),
		onSelectResource: (e) => Rf(e),
		onReorder: (e, t, n) => Lf(e, t, n),
		onDragState: (e) => {
			$.listDrag = e;
		},
		onPanePreview: (e, t) => pm(e, t),
		onPaneCommit: (e) => mm(e),
		onPaneViewport: () => hm(),
		onMobileSidebar: (e) => gm(e),
		onMobileView: (e) => _m(e),
		onMobileImmersive: (e) => vm(e),
		onLayoutCycle: () => Od.cycleLayoutPreference(),
		onHistoryNavigation: (e) => wm(e),
		onToast: lm,
		onIconsChanged: um
	});
}
async function If(e) {
	if (!Zp(e)) return;
	if ($.workspaceMenuOpen = !1, e === $.activeWorkspaceId) {
		Mf();
		return;
	}
	gm(!1), wd(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++;
	let t = $.navigationVersion;
	await Cf().catch((e) => console.warn("failed to save UI state", e)), $.activeWorkspaceId = e, $.selectedId = "workspace", $.tree = null, $.navigationLoading = !0, $.navigationError = "", bd(), af(e), $.sessionMenu = null, Qf(), $.workspaceAgentsSaving = !1, Hp(), pp(), Mf(), await Sf(e, t) && ($.selectedId = $.lastResourceId || "workspace", await mf());
}
async function Lf(e, t, n) {
	let r = {
		projectOrder: [...$.projectOrder],
		taskOrder: Object.fromEntries(Object.entries($.taskOrder).map(([e, t]) => [e, Array.isArray(t) ? [...t] : []])),
		sessionOrder: [...$.sessionOrder]
	};
	if (e.kind === "session") $.sessionOrder = Bd(zd(qd($.tree?.sessions || []), $.sessionOrder).map((e) => e.id), e.id, t.id, n);
	else if (e.kind === "task") {
		let r = Gp(e.projectId);
		if (!r) return;
		let i = zd(r.children || [], $.taskOrder[e.projectId]);
		$.taskOrder = {
			...$.taskOrder,
			[e.projectId]: Bd(i.map((e) => e.id), e.id, t.id, n)
		};
	} else if (e.kind === "project") $.projectOrder = Bd(zd($.tree?.projects || [], $.projectOrder).map((e) => e.id), e.id, t.id, n);
	else return;
	Ff();
	try {
		await Cf();
	} catch (e) {
		throw $.projectOrder = r.projectOrder, $.taskOrder = r.taskOrder, $.sessionOrder = r.sessionOrder, Ff(), e;
	}
}
async function Rf(e, t = {}) {
	let n = $.selectedId !== e;
	t.clearUnread !== !1 && uf(e);
	let r = n || !!t.forceDetail;
	r && ($.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, e !== "workspace" && (_f(e), delete $.details[e])), n && ($.workspaceAgentsSaving = !1, wd(), Ap(), $.preview = null, $.diff = null, mp(), $.agent.runs = [], $.agent.activeRunId = "", $.agent.events = [], $.agent.notices = [], $.agent.historyBeforeId = 0, Cd(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = ""), $.selectedId = e, $.sessionMenu = null, gm(!1), Yp(!1), Qp(), Cf().catch((e) => console.warn("failed to save UI state", e)), Df(), await Promise.all([
		e === "workspace" ? xf({ force: !!t.forceDetail }) : hf(e, { force: r }),
		n ? ip() : Promise.resolve(),
		up($.activeWorkspaceId, e)
	]), Of($.activeWorkspaceId, $.navigationVersion) && Df();
}
async function zf(e) {
	$.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), Ff();
	try {
		await Cf();
	} catch (t) {
		throw $.expandedProjects.has(e) ? $.expandedProjects.delete(e) : $.expandedProjects.add(e), Ff(), t;
	}
}
function Bf() {
	Ff();
}
function Vf(e, t = Uf(e)) {
	let n = (typeof t == "string" ? t : t.displayResourceId) || "", r = Gp(n)?.title || "";
	return e.source === "internal" ? e.agentRunTitle || r || n || e.id : r || n || e.id;
}
function Hf(e) {
	let t = String(e || "").trim();
	if (!t) return "";
	let n = Gp(t);
	return n && n.archived !== !0 ? t : "";
}
function Uf(e) {
	let t = String(e?.resourceId || "").trim();
	return e?.source === "internal" && t ? {
		kind: "run",
		resourceId: t,
		displayResourceId: t,
		navigationResourceId: Hf(t),
		selectedResourceIds: [t]
	} : {
		kind: "none",
		resourceId: "",
		displayResourceId: "",
		navigationResourceId: "",
		selectedResourceIds: []
	};
}
function Wf(e) {
	if (!e || e.source !== "internal") return null;
	let t = String(e.resourceId || "").trim();
	return t ? Gf(t) : null;
}
function Gf(e) {
	let t = Gp(e);
	return t && t.type === "task" && !t.archived ? t : null;
}
function Kf() {
	let e = $.activeWorkspaceId || "", t = {
		identity: e ? `${e}:${$.selectedId || "workspace"}` : "empty",
		workspaceId: e,
		workspaceName: $p(),
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
		} : Gp($.selectedId)?.agentBinding || {
			kind: "profile",
			name: "default"
		},
		agentProfiles: ($.config?.agentProfiles || []).map((e) => ({
			key: e.key,
			description: e.description
		})),
		agents: ef(),
		logs: {
			hasMore: !1,
			loading: !1,
			error: ""
		},
		onNavigate: (e) => Yf(e).catch((e) => lm(Jl(e))),
		onCreateTask: (e) => Bp(e),
		onArchive: (e) => Wp(e).catch((e) => lm(Jl(e))),
		onLoadMoreLogs: (e) => bf(e),
		onSaveWorkspaceAgents: (e, t) => ep(e, t),
		onSaveAgentBinding: async (t) => {
			let n = $.selectedId || "workspace";
			await ff(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(n)}/agent-binding`, {
				method: "PUT",
				body: JSON.stringify(t)
			}), await mf({ updateURL: !1 }), n !== "workspace" && await hf(n, { force: !0 }), Ef(), lm("Resource agent binding saved.");
		},
		onToast: lm,
		onIconsChanged: um
	};
	if (!$.tree) return t;
	if ($.selectedId === "workspace") return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: $p()
	};
	let n = Gp($.selectedId) || $.tree.projects[0];
	if (!n) return {
		...t,
		resourceId: "workspace",
		resourceType: "workspace",
		resourceTitle: $p()
	};
	let r = $.details[n.id] || null, i = qp(n.id), a = $.resourceLogPages?.[n.id] || {};
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
		detail: qf(r),
		logs: {
			hasMore: !!(a.hasMore ?? r?.logPage?.hasMore),
			loading: !!a.loading,
			error: String(a.error || "")
		}
	};
}
function qf(e) {
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
function Jf() {
	vd.renderDetailPanel(Kf());
}
async function Yf(e) {
	await Rf(e, { forceDetail: e === $.selectedId && e !== "workspace" });
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
		let n = await ff(rp(e, t, r));
		return r !== $.activeWorkspaceId || i !== $.previewRequestVersion || $.preview?.section !== e || $.preview?.path !== t ? null : ($.preview = {
			section: e,
			...n
		}, $.preview);
	} catch (a) {
		let o = r === $.activeWorkspaceId && i === $.previewRequestVersion && $.preview?.section === e && $.preview?.path === t;
		if (o && ($.preview = {
			section: e,
			path: t,
			error: Jl(a)
		}), n.rethrow && o) throw a;
		return null;
	}
}
async function ep(e, t) {
	if (!$.activeWorkspaceId) throw Error("No workspace is selected.");
	let n = $.activeWorkspaceId, r = $.navigationVersion, i = await ff(`/api/workspaces/${n}/files?path=AGENTS.md`, {
		method: "PUT",
		body: JSON.stringify({
			content: e,
			expectedContentHash: t
		})
	});
	if (!Of(n, r) || $.selectedId !== "workspace") throw Error("The workspace changed before AGENTS.md finished saving.");
	return $.workspaceAgents = i, $.workspaceAgentsDraft = Zf(i.content || ""), $.workspaceAgentsDirty = !1, i;
}
function tp() {
	$.previewRequestVersion++, $.preview = null, Ef();
}
function np() {
	$.diffRequestVersion++, $.diff = null, Ef();
}
function rp(e, t, n = $.activeWorkspaceId) {
	return `/api/workspaces/${n}/${e === "Wiki" ? "wiki/files" : "files"}?path=${encodeURIComponent(t)}`;
}
async function ip() {
	if (!$.activeWorkspaceId) {
		pp();
		return;
	}
	$.agentRunProjectionVersion = (Number($.agentRunProjectionVersion) || 0) + 1;
	let e = $.agentRunProjectionVersion, t = await lp();
	return !(e !== $.agentRunProjectionVersion || !$.activeWorkspaceId || ($.agent.runs = t, sf($.agent.runs), ap($.agent.runs), $.agent.activeRunId || ($.agent.historyBeforeId = 0), e !== $.agentRunProjectionVersion));
}
function ap(e) {
	let t = op(e);
	return $.agent.activeRunId !== t && ($.agent.activeRunId = t, $.agent.events = [], $.agent.notices = [], $.agent.eventsHasMore = !1, $.agent.historyBeforeId = 0, $.agent.approvalDrafts.clear(), !0);
}
function op(e) {
	return e.some((e) => e.id === $.agent.activeRunId) ? $.agent.activeRunId : e[0]?.id || "";
}
async function sp(e = $.activeWorkspaceId) {
	let t = ++$.treeRequestVersion, n = $.navigationVersion, r = await ff(`/api/workspaces/${e}/tree`);
	return Of(e, n, t) ? r : null;
}
async function cp() {
	if (!$.activeWorkspaceId || !$.tree) return;
	let e = await sp($.activeWorkspaceId);
	e && ($.tree = e);
}
function lp() {
	let e = Lp(), t = e ? `?resourceId=${encodeURIComponent(e)}` : "";
	return ff(`/api/workspaces/${$.activeWorkspaceId}/agent/runs${t}`).then((e) => e.runs || []);
}
async function up(e = $.activeWorkspaceId, t = Lp()) {
	if (!e || !t) return !1;
	let n = ++$.messageStatusRequestVersion, r = `${e}:${t}`, i = await ff(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/status`);
	if (n !== $.messageStatusRequestVersion || e !== $.activeWorkspaceId || t !== Lp()) return !1;
	let a = $.messageStatusKey !== r || !sm($.messageStatus, i);
	return $.messageStatusKey = r, $.messageStatus = i, a;
}
async function dp(e) {
	if (!e || $.steeringMessageId) return;
	let t = $.activeWorkspaceId, n = Lp();
	$.steeringMessageId = e, wp();
	try {
		await ff(`/api/workspaces/${encodeURIComponent(t)}/messages/${encodeURIComponent(e)}/steer`, { method: "POST" }), await up(t, n), t === $.activeWorkspaceId && n === Lp() && (Ef(), lm("Message inserted into the current turn."));
	} catch (e) {
		try {
			await up(t, n);
		} catch {}
		throw e;
	} finally {
		$.steeringMessageId === e && ($.steeringMessageId = "", wp());
	}
}
async function fp() {
	wd(), mp(), Dd.reset(), $.agent.activeRunId = "", $.agent.events = [], $.agent.notices = [], $.agent.historyBeforeId = 0, Cd(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, await Promise.all([ip(), up()]);
}
function pp() {
	wd(), Ap(), mp(), $.agent.runs = [], $.agentRunProjectionVersion = (Number($.agentRunProjectionVersion) || 0) + 1, $.agent.activeRunId = "", $.agent.events = [], $.agent.notices = [], $.agent.eventsHasMore = !1, $.agent.historyBeforeId = 0, $.agent.loadingOlder = !1, $.agent.optionsOpen = !1, $.agent.agentChooserOpen = !1, $.agent.historyOpen = !1, Cd(), Dd.reset(), $.messageStatus = null, $.messageStatusKey = "", $.messageStatusRequestVersion++, $.steeringMessageId = "", $.agent.toolGroupOpen.clear(), $.agent.approvalDrafts.clear(), $.agent.renderDeferredForSelection = !1, _p();
}
function mp() {
	$.agent.stream && $.agent.stream.close(), $.agent.stream = null, $.agent.streamRunId = "";
}
function hp(e, t, n) {
	if (e !== $.activeWorkspaceId || t !== Lp() || !n) return;
	let r = Fp();
	[
		"turn.completed",
		"turn.failed",
		"turn.cancelled"
	].includes(n.type) && cf(n, r), [
		"turn.completed",
		"turn.failed",
		"turn.cancelled",
		"session.state",
		"approval.requested",
		"approval.resolved"
	].includes(n.type) && up().then(Ef).catch((e) => console.warn("agent refresh failed", e));
}
function gp(e, t, n) {}
function _p() {
	$.agent.renderTimer && window.clearTimeout($.agent.renderTimer), $.agent.renderTimer = null;
}
function vp(e) {
	let t = (e || []).filter((e) => !Fd.has(e?.type)), n = _d(t), r = new Map(t.map((e) => [Number(e.id), e]));
	for (let e of n) {
		let t = r.get(Number(e.key)), n = t?.data?.compactRange;
		n && (e.compact = !0, e.rangeStartEventId = Number(n.start) || Number(t?.id) || 0, e.rangeEndEventId = Number(n.end) || e.rangeStartEventId);
	}
	return n;
}
function yp(e) {
	if (!e) return "";
	let t = [bp(e.providerId)];
	return e.options?.model && t.push(e.options.model), t.filter(Boolean).join(" · ");
}
function bp(e) {
	return ($.config?.agentHubProviders || $d.providers()).find((t) => t.id === e)?.name || e || "Provider";
}
function xp(e) {
	let t = window.getSelection?.();
	return !t || t.isCollapsed || t.rangeCount === 0 ? !1 : t.getRangeAt(0).intersectsNode(e);
}
function Sp(e = {}) {
	wp();
	let t = Lp(), n = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null, r = ($.config?.agents || []).find((e) => e.id === n?.resolvedAgent);
	vd.renderEventTimeline({
		identity: `${$.activeWorkspaceId}:${t}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		status: n,
		agentName: Tp(r || tm()),
		project: vp,
		onEvent: hp,
		onNotice: gp,
		onApproval: Pp,
		onToast: lm,
		onIconsChanged: um
	});
}
function Cp(e, t) {
	return `${e || "workspace"}:${t || "resource"}`;
}
function wp(e = {}) {
	$.agent.skipTTYDraftSync = !1;
	let t = Lp();
	$.activeWorkspaceId && t && Td(t);
	let n = Dd.active("turn-stop") && Dd.key("turn-stop") === t, r = $.messageStatusKey === `${$.activeWorkspaceId}:${t}` ? $.messageStatus : null;
	vd.renderComposer({
		identity: `${$.activeWorkspaceId}:${t}:${$.agent.ttyDraftKey || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: t,
		draft: $.agent.ttyDraft || "",
		draftKey: $.agent.ttyDraftKey || "",
		draftResetVersion: $.agent.ttyDraftResetVersion || 0,
		unavailableReason: r ? r.acceptsMessages ? "" : r.archived ? "This resource is archived." : r.configError || "This resource cannot accept messages." : "Loading work status.",
		sending: Dd.isSending(Cp($.activeWorkspaceId, t)),
		canEndTurn: !!(n || ["running", "waiting_approval"].includes(String(r?.session?.state || ""))),
		endingTurn: n,
		waitingMessages: r?.waitingMessages || [],
		canSteerWaiting: !!r?.canSteerWaiting,
		steeringMessageId: $.steeringMessageId,
		onDraft: (e, t) => Dp(e, t),
		onSend: Ip,
		onOpenUpload: Op,
		onEndTurn: () => Np().catch((e) => lm(e.message)),
		onSteerWaiting: dp,
		onIconsChanged: um
	});
}
function Tp(e) {
	return e?.name || e?.id || "Agent";
}
function Ep() {
	$d.render();
}
function Dp(e, t) {
	!t || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== Lp() || t.draftKey !== $.agent.ttyDraftKey || Ed(e);
}
function Op() {
	let e = Lp();
	if (!e || $.messageStatus?.archived) {
		lm("Select an active resource before uploading files.");
		return;
	}
	let t = Md("ttyInput");
	t && Ed(t.value), $.modalEnter = "upload", $.uploadDialog = {
		open: !0,
		identity: ++Qd,
		resourceId: e,
		items: [],
		nextId: 1
	}, Mp();
}
function kp(e = [], t = {}) {
	if (!$.uploadDialog.open) return;
	let n = $.uploadDialog.resourceId === Lp(), r = !t.workspaceId || t.workspaceId === $.activeWorkspaceId, i = e.length > 0 && r && n;
	i && (Ed(jp($.agent.ttyDraft, e)), $.agent.ttyDraftResetVersion++), Ap();
	let a = Md("ttyComposer");
	a && delete a.dataset.composerKey, wp({ skipDraftSync: i }), Md("ttyInput")?.focus({ preventScroll: !0 }), um();
}
function Ap() {
	$.uploadDialog = {
		open: !1,
		identity: ++Qd,
		resourceId: "",
		items: [],
		nextId: 1
	}, Mp();
}
function jp(e, t) {
	let n = t.filter(Boolean).join("\n");
	return n ? e ? `${e}${e.endsWith("\n") ? "" : "\n"}${n}` : n : e;
}
function Mp() {
	let e = $.uploadDialog;
	vd.renderUploadDialog({
		open: !!e.open,
		identity: `${e.identity || 0}:${$.activeWorkspaceId}:${e.resourceId || ""}`,
		workspaceId: $.activeWorkspaceId,
		resourceId: e.resourceId || "",
		onDone: kp,
		onIconsChanged: um
	});
}
async function Np() {
	let e = $.activeWorkspaceId, t = Lp(), n = $.messageStatus?.generation?.generationId || "", r = Dd.begin("turn-stop", t);
	if (r) try {
		let r = n ? `?generationId=${encodeURIComponent(n)}` : "";
		await ff(`/api/workspaces/${encodeURIComponent(e)}/resources/${encodeURIComponent(t)}/turn/end${r}`, { method: "POST" }), await up(e, t), Ef();
	} finally {
		Dd.finish(r);
	}
}
async function Pp(e, t, n) {
	let r = $.activeWorkspaceId, i = Lp();
	await ff(`/api/workspaces/${encodeURIComponent(r)}/resources/${encodeURIComponent(i)}/approval?generationId=${encodeURIComponent(e)}`, {
		method: "POST",
		body: JSON.stringify({
			requestId: t,
			...n
		})
	}), await up(r, i), Ef();
}
function Fp() {
	return $.agent.runs.find((e) => e.id === $.agent.activeRunId) || null;
}
async function Ip(e, t) {
	if (!e.trim() || t.workspaceId !== $.activeWorkspaceId || t.resourceId !== Lp() || t.draftKey !== $.agent.ttyDraftKey) return {
		accepted: !1,
		clear: !1
	};
	let n = Cp(t.workspaceId, t.resourceId);
	if (!Dd.startSending(n)) return {
		accepted: !1,
		clear: !1
	};
	let r = $.agent.ttyDraftVersion;
	try {
		await ff(`/api/workspaces/${encodeURIComponent(t.workspaceId)}/resources/${encodeURIComponent(t.resourceId)}/messages`, {
			method: "POST",
			body: JSON.stringify({
				text: e,
				role: "user",
				sender: { name: df() }
			})
		});
		let n = Sd({
			workspaceId: t.workspaceId,
			resourceId: t.resourceId,
			key: t.draftKey,
			text: e,
			version: r
		});
		return n && $.agent.ttyDraftResetVersion++, await Promise.all([up(t.workspaceId, t.resourceId), cp()]), Ef(), {
			accepted: !0,
			clear: n
		};
	} finally {
		Dd.stopSending(n);
	}
}
function Lp() {
	return $.selectedId === "workspace" ? "workspace" : Gp($.selectedId)?.id || "";
}
function Rp(e) {
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
function zp() {
	Vp("project");
}
function Bp(e) {
	Vp("task", e);
}
function Vp(e, t = "") {
	jd.open(e === "task" ? "task" : "project", t);
}
function Hp() {
	jd.close();
}
function Up() {
	jd.render();
}
async function Wp(e) {
	confirm(`Archive ${e}?`) && (await ff(`/api/workspaces/${$.activeWorkspaceId}/archive`, {
		method: "POST",
		body: JSON.stringify({ resourceId: e })
	}), lm("Archived."), $.selectedId = "workspace", await mf());
}
function Gp(e) {
	if (!$.tree) return null;
	for (let t of $.tree.projects) {
		if (t.id === e) return t;
		for (let n of t.children || []) if (n.id === e) return n;
	}
	return null;
}
function Kp() {
	return $.selectedId === "workspace" || Gp($.selectedId) ? !1 : ($.selectedId = "workspace", !0);
}
function qp(e) {
	if (!$.tree) return null;
	for (let t of $.tree.projects) if (t.id === e || (t.children || []).some((t) => t.id === e)) return t;
	return null;
}
function Jp(e) {
	return $.expandedProjects.has(e);
}
function Yp(e = !1) {
	let t = qp($.selectedId);
	!t || t.id === $.selectedId || $.expandedProjects.has(t.id) || ($.expandedProjects.add(t.id), e && Cf().catch((e) => lm(e.message)));
}
function Xp(e = window.location.pathname) {
	return kd.parse(e);
}
function Zp(e) {
	return !!(e && $.config?.workspaces.some((t) => t.id === e));
}
function Qp(e = {}) {
	kd.project($.activeWorkspaceId, $.selectedId, e);
}
function $p() {
	return $.config?.workspaces.find((e) => e.id === $.activeWorkspaceId)?.name || "Workspace";
}
function em() {
	let e = nm(), t = rm();
	e.some((e) => e.id === $.agent.agentName) || ($.agent.agentName = t);
}
function tm() {
	let e = nm(), t = $.agent.agentName || rm();
	return e.find((e) => e.id === t) || e[0] || null;
}
function nm() {
	return ($.config?.agents || []).filter((e) => e.available !== !1);
}
function rm() {
	let e = nm();
	return im($.config?.agentProfiles, "default") || im($d.profiles(), "default") || e[0]?.id || "";
}
function im(e, t) {
	let n = String(t || "").trim().toLowerCase(), r = (e || []).find((e) => String(e.key || "").trim().toLowerCase() === n);
	return String(r?.agentName || "").trim();
}
async function am(e = "workspace") {
	return $d.open(e);
}
function om(e, t) {
	return $d.withAgentHubCatalog(e, t);
}
function sm(e, t) {
	return JSON.stringify(e ?? null) === JSON.stringify(t ?? null);
}
var cm = 0;
function lm(e) {
	vd.renderToast({
		message: String(e || ""),
		revision: ++cm
	});
}
function um() {
	let e = window.lucide;
	!e || $.iconRefreshScheduled || ($.iconRefreshScheduled = !0, yd?.animationFrame(() => {
		$.iconRefreshScheduled = !1, e.createIcons({ attrs: { "stroke-width": 2 } });
	}));
}
function dm(e) {
	um(), e === "markdown" && window.marked && window.DOMPurify && (Jf(), um()), e === "diff" && Jf();
}
window.forgeAssetLoaded = dm;
function fm() {
	Od.initialize();
}
function pm(e, t) {
	Od.previewPane(e, t);
}
function mm(e) {
	Od.commitPane(e);
}
function hm() {
	Od.syncViewport();
}
function gm(e) {
	Od.setMobileSidebar(e);
}
function _m(e) {
	Od.setMobileView(e);
}
function vm(e) {
	Od.setMobileImmersive(e);
}
function ym() {
	yd?.listen(document, "selectionchange", () => {
		if (!$.agent.renderDeferredForSelection) return;
		let e = Md("ttyLog");
		e && xp(e) || ($.agent.renderDeferredForSelection = !1, Sp(), um());
	}), yd?.listen(document, "keydown", (e) => {
		e.key === "Escape" && $.diff ? np() : e.key === "Escape" && $.preview ? tp() : e.key === "Escape" && ($.agent.optionsOpen || $.agent.agentChooserOpen || $.agent.historyOpen) && ($.agent.optionsOpen = !1, $.agent.agentChooserOpen = !1, $.agent.historyOpen = !1, wp(), um());
	}), yd?.listen(document, "click", (e) => {
		let t = e.target instanceof Element ? e.target : null, n = t?.closest("[data-breadcrumb-resource]");
		if (n) {
			Yf(n.dataset.breadcrumbResource || "workspace").catch((e) => lm(Jl(e)));
			return;
		}
		let r = $.agent.agentChooserOpen && t && !t.closest(".tty-new-session-control"), i = ($.agent.optionsOpen || $.agent.historyOpen) && t && !t.closest(".tty-composer");
		(r || i) && ($.agent.optionsOpen = !1, $.agent.agentChooserOpen = !1, $.agent.historyOpen = !1, wp(), um()), $.sessionMenu && (t?.closest(".session-row") || t?.closest(".session-resource-menu") || ($.sessionMenu = null, Bf(), um()));
	}), yd?.listen(window, "beforeunload", Sm), yd?.listen(document, "visibilitychange", () => {
		(document.hidden || document.visibilityState === "hidden") && Sm();
	});
}
var bm = !1;
function xm(e) {
	if (vd = e, bm) {
		tf();
		return;
	}
	bm = !0;
	let t = new Zu();
	yd = t, nf = gu({
		scope: t,
		selectedResourceId: () => $.selectedId,
		treeSessions: () => $.tree?.sessions || [],
		agentRuns: () => $.agent.runs,
		hasTree: () => !!$.tree,
		findResource: Gp,
		sessionNavigationTarget: Uf,
		selectResource: Rf,
		activateRun: (e) => {
			let t = $.agent.runs.find((t) => t.id === e);
			t && ($.agent.activeRunId = t.id, Sp(), um());
		},
		notificationsSettingsVisible: () => $d.isOpenTab("notifications"),
		renderSettings: Ep,
		renderSessions: Bf,
		refreshIcons: um,
		flushDraft: Sm
	}), rf = Xu(t, () => {
		$d.isOpenTab("user") && Ep();
	}), ym(), fm(), nf.install(), Ff(), pf().catch((e) => {
		$.navigationLoading = !1, $.navigationError = e.message, lm(e.message), Ef();
	}), wf();
}
function Sm() {
	wd();
}
function Cm() {
	bm && (Sm(), bm = !1, mp(), nf?.dispose(), nf = null, rf = null, Dd.reset(), _p(), jd.dispose(), yd?.dispose(), yd = null, $.autoRefreshTimer = null);
}
async function wm(e) {
	let t = Xp(e);
	if (!Zp(t.workspaceId)) {
		Qp({ replace: !0 });
		return;
	}
	let n = $.activeWorkspaceId !== t.workspaceId, r = $.selectedId;
	wd(), $.navigationVersion++, $.autoRefreshVersion++, $.treeRequestVersion++, $.detailRequestVersion++, $.workspaceAgentsRequestVersion++, $.previewRequestVersion++, $.diffRequestVersion++, $.workspaceAgentsSaving = !1;
	let i = $.navigationVersion;
	if ($.activeWorkspaceId = t.workspaceId || "", $.selectedId = t.resourceId || "workspace", !n && r !== $.selectedId && $.selectedId !== "workspace" && (_f($.selectedId), delete $.details[$.selectedId]), $.preview = null, $.diff = null, $.sessionMenu = null, n && ($.tree = null, $.navigationLoading = !0, $.navigationError = "", Qf(), $.workspaceAgentsSaving = !1, Hp(), af($.activeWorkspaceId)), n && pp(), Mf(), n) {
		if (!await Sf(t.workspaceId || "", i)) return;
		!t.resourceId && $.lastResourceId && ($.selectedId = $.lastResourceId), await mf({ updateURL: !1 }), Of(t.workspaceId || "", i) && Qp({ replace: !0 });
	} else {
		let e = Kp();
		if ($.selectedId === "workspace" ? await xf() : (Yp(!1), await hf($.selectedId)), !Of(t.workspaceId || "", i)) return;
		r !== $.selectedId && await fp(), Ef(), e && Qp({ replace: !0 });
	}
}
//#endregion
//#region src/entry.ts
var Tm = Ll(), Em = {
	renderAppShell: Tm.appShell.publish,
	renderCreateDialog: Tm.create.publish,
	renderSettings: Tm.settings.publish,
	renderUploadDialog: Tm.upload.publish,
	renderComposer: Tm.composer.publish,
	renderEventTimeline: Tm.timeline.publish,
	renderDetailPanel: Tm.detail.publish,
	renderToast: Tm.toast.publish
}, Dm = null;
async function Om() {
	if (Dm) return;
	let e = document.getElementById("app");
	if (!e) throw Error("Forge application root is unavailable.");
	e.dataset.componentOwner = "app-shell", Dm = Ar(Pl, {
		target: e,
		props: { channels: Tm }
	}), xm(Em);
}
async function km() {
	if (Cm(), !Dm) return;
	let e = Dm;
	Dm = null, await Pr(e), document.getElementById("app")?.removeAttribute("data-component-owner");
}
window.addEventListener("pagehide", () => void km()), window.addEventListener("pageshow", (e) => {
	e.persisted && Om();
}), Om().catch((e) => console.error("Failed to start the Forge application", e));
//#endregion
