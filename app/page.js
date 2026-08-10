"use client";
import React, { useState, useEffect } from "react";
import {
  Home, ShoppingCart, Receipt, Settings, Plus, Minus, Search,
  MapPin, ChevronRight, Wheat, Zap, Package, X, Check,
} from "lucide-react";
import Link from "next/link";
import { styles, CATEGORIES, currency } from "../lib/ui";

export default function ShopPage() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [tab, setTab] = useState("home");
  const [activeCat, setActiveCat] = useState("grocery");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [toast, setToast] = useState(null);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [custName, setCustName] = useState("");
  const [custPhone, setCustPhone] = useState("");
  const [placedOrderId, setPlacedOrderId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [myPhone, setMyPhone] = useState("");

  useEffect(() => {
    fetch("/api/products").then((r) => r.json()).then((d) => {
      setProducts(Array.isArray(d) ? d : []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (tab === "myorders" && myPhone) {
      fetch(`/api/orders?phone=${encodeURIComponent(myPhone)}`)
        .then((r) => r.json())
        .then((d) => setOrders(Array.isArray(d) ? d : []));
    }
  }, [tab, myPhone]);

  function flashToast(msg) {
    setToast(msg);
    window.clearTimeout(flashToast._t);
    flashToast._t = window.setTimeout(() => setToast(null), 1500);
  }

  function setQty(product, qty) {
    setCart((c) => {
      const next = { ...c };
      if (qty <= 0) delete next[product.id];
      else next[product.id] = qty;
      return next;
    });
  }
  function adjust(product, delta) {
    const current = cart[product.id] ?? 0;
    const base = current === 0 ? product.min_qty - product.step : current;
    const next = Math.max(0, base + delta * product.step);
    setQty(product, next);
    if (next > current) flashToast(`${product.name} added`);
  }

  const visibleProducts = products
    .filter((p) => p.category === activeCat)
    .filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));

  const cartLines = Object.entries(cart)
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id), qty }))
    .filter((l) => l.product);
  const cartTotal = cartLines.reduce((s, l) => s + l.product.price * l.qty, 0);
  const cartCount = cartLines.length;

  async function submitOrder() {
    if (!custName.trim() || !custPhone.trim()) {
      flashToast("Enter name & phone");
      return;
    }
    setSaving(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customer_name: custName.trim(),
        phone: custPhone.trim(),
        items: cartLines.map((l) => ({
          productId: l.product.id, name: l.product.name, unit: l.product.unit, qty: l.qty, price: l.product.price,
        })),
        total: cartTotal,
      }),
    });
    setSaving(false);
    if (res.ok) {
      const order = await res.json();
      setMyPhone(custPhone.trim());
      setPlacedOrderId(order.id);
      setCart({});
      setCheckoutOpen(false);
    } else {
      flashToast("Could not save order, try again");
    }
  }

  if (loading) {
    return (
      <div style={styles.phoneOuter}>
        <div style={{ ...styles.phoneFrame, alignItems: "center", justifyContent: "center", display: "flex" }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div style={styles.phoneOuter}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <div>
            <div style={styles.storeName}>Bulk Store</div>
            <div style={styles.locationRow}>
              <MapPin size={12} color="#D9A441" strokeWidth={2.5} />
              <span style={styles.locationText}>Ongole, AP</span>
            </div>
          </div>
          <button style={styles.cartPill} onClick={() => setTab("cart")} aria-label="Cart">
            <ShoppingCart size={16} color="#EDE4CE" strokeWidth={2.2} />
            {cartCount > 0 && <span style={styles.cartBadge}>{cartCount}</span>}
          </button>
        </div>

        <div style={styles.body}>
          {tab === "home" && (
            <>
              <div style={styles.searchWrap}>
                <Search size={15} color="#8C7A5B" strokeWidth={2.2} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rice, oil, soap..." style={styles.searchInput} />
              </div>
              <div style={styles.catRow}>
                {CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const active = c.id === activeCat;
                  return (
                    <button key={c.id} onClick={() => setActiveCat(c.id)} style={{ ...styles.catChip, background: active ? c.color : "#FFFFFF", borderColor: active ? c.color : "#DDD3B8" }}>
                      <Icon size={15} color={active ? "#EDE4CE" : c.color} strokeWidth={2.2} />
                      <span style={{ ...styles.catChipLabel, color: active ? "#EDE4CE" : "#22262B" }}>{c.label}</span>
                    </button>
                  );
                })}
              </div>
              <div style={styles.sectionLabel}>{CATEGORIES.find((c) => c.id === activeCat)?.label} · {visibleProducts.length} items</div>
              <div style={styles.grid}>
                {visibleProducts.map((p) => {
                  const qty = cart[p.id] ?? 0;
                  return (
                    <div key={p.id} style={styles.card}>
                      <div style={styles.cardName}>{p.name}</div>
                      <div style={styles.cardPriceRow}>
                        <span style={styles.cardPrice}>{currency(p.price)}</span>
                        <span style={styles.cardUnit}>/{p.unit}</span>
                      </div>
                      <div style={styles.ticket}>
                        <button style={styles.ticketBtn} onClick={() => adjust(p, -1)}><Minus size={13} strokeWidth={2.5} color="#1E3557" /></button>
                        <div style={styles.ticketQty}>{qty > 0 ? `${qty}${p.unit}` : `min ${p.min_qty}${p.unit}`}</div>
                        <button style={{ ...styles.ticketBtn, background: "#1E3557" }} onClick={() => adjust(p, 1)}><Plus size={13} strokeWidth={2.5} color="#EDE4CE" /></button>
                      </div>
                    </div>
                  );
                })}
                {visibleProducts.length === 0 && <div style={styles.emptyState}>No items here yet.</div>}
              </div>
            </>
          )}

          {tab === "cart" && (
            <div>
              {placedOrderId && cartLines.length === 0 ? (
                <div style={styles.placedWrap}>
                  <div style={styles.placedCircle}><Check size={26} color="#EDE4CE" strokeWidth={3} /></div>
                  <div style={styles.placedTitle}>Order placed</div>
                  <div style={styles.placedSub}>We'll confirm on WhatsApp/call shortly.</div>
                  <button style={styles.browseBtn} onClick={() => { setPlacedOrderId(null); setTab("home"); }}>Continue shopping</button>
                </div>
              ) : cartLines.length === 0 ? (
                <div style={styles.emptyCart}>
                  <ShoppingCart size={30} color="#C9BE9E" strokeWidth={1.6} />
                  <div style={styles.emptyCartText}>Your cart is empty</div>
                  <button style={styles.browseBtn} onClick={() => setTab("home")}>Browse products</button>
                </div>
              ) : (
                <>
                  <div style={styles.sectionLabel}>Your order</div>
                  {cartLines.map(({ product, qty }) => (
                    <div key={product.id} style={styles.cartLine}>
                      <div style={{ flex: 1 }}>
                        <div style={styles.cartLineName}>{product.name}</div>
                        <div style={styles.cartLineMeta}>{qty}{product.unit} × {currency(product.price)}</div>
                      </div>
                      <div style={styles.cartLineRight}>
                        <div style={styles.cartLineTotal}>{currency(qty * product.price)}</div>
                        <button style={styles.removeBtn} onClick={() => setQty(product, 0)}><X size={13} color="#A8471F" strokeWidth={2.4} /></button>
                      </div>
                    </div>
                  ))}
                  <div style={styles.totalsBox}>
                    <div style={styles.totalsRow}><span>Subtotal</span><span style={styles.mono}>{currency(cartTotal)}</span></div>
                    <div style={styles.totalsRow}><span>Delivery</span><span style={{ color: "#4B7A4B" }}>Free · Ongole</span></div>
                    <div style={styles.totalsDivider} />
                    <div style={{ ...styles.totalsRow, fontWeight: 700 }}><span>Total</span><span style={styles.mono}>{currency(cartTotal)}</span></div>
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "myorders" && (
            <div>
              <div style={styles.sectionLabel}>Track your orders</div>
              <div style={styles.searchWrap}>
                <Search size={15} color="#8C7A5B" strokeWidth={2.2} />
                <input value={myPhone} onChange={(e) => setMyPhone(e.target.value)} placeholder="Enter your phone number" style={styles.searchInput} />
              </div>
              {myPhone && orders.length === 0 && <div style={styles.placeholderText}>No orders found for this number.</div>}
              {orders.map((o) => (
                <div key={o.id} style={styles.orderCard}>
                  <div style={styles.orderCardTop}>
                    <span style={styles.orderId}>#{o.id.slice(0, 6)}</span>
                    <span style={styles.statusPill}>{o.status}</span>
                  </div>
                  {o.items.map((it) => (
                    <div key={it.productId} style={styles.orderItemRow}>
                      <span>{it.name} × {it.qty}{it.unit}</span>
                      <span style={styles.mono}>{currency(it.qty * it.price)}</span>
                    </div>
                  ))}
                  <div style={styles.orderTotalRow}><span>Total</span><span style={styles.mono}>{currency(o.total)}</span></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {tab === "cart" && cartLines.length > 0 && !placedOrderId && (
          <button style={styles.checkoutBar} onClick={() => setCheckoutOpen(true)}>
            <span>Place order · {currency(cartTotal)}</span>
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        )}
        {tab === "home" && cartCount > 0 && (
          <button style={styles.viewCartBar} onClick={() => setTab("cart")}>
            <span>{cartCount} items · {currency(cartTotal)}</span>
            <span style={styles.viewCartLink}>View cart <ChevronRight size={14} strokeWidth={2.5} /></span>
          </button>
        )}

        <div style={styles.nav}>
          {[
            { id: "home", label: "Home", icon: Home },
            { id: "cart", label: "Cart", icon: ShoppingCart },
            { id: "myorders", label: "My Orders", icon: Receipt },
          ].map((n) => {
            const Icon = n.icon;
            const active = tab === n.id;
            return (
              <button key={n.id} onClick={() => setTab(n.id)} style={styles.navBtn}>
                <Icon size={19} color={active ? "#1E3557" : "#A79B7C"} strokeWidth={active ? 2.4 : 2} />
                <span style={{ ...styles.navLabel, color: active ? "#1E3557" : "#A79B7C", fontWeight: active ? 700 : 500 }}>{n.label}</span>
                {active && <div style={styles.navDot} />}
              </button>
            );
          })}
          <Link href="/owner" style={{ ...styles.navBtn, textDecoration: "none" }}>
            <Settings size={19} color="#A79B7C" strokeWidth={2} />
            <span style={{ ...styles.navLabel, color: "#A79B7C" }}>Owner</span>
          </Link>
        </div>

        {checkoutOpen && (
          <div style={styles.modalOverlay} onClick={() => setCheckoutOpen(false)}>
            <div style={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalHandle} />
              <div style={styles.placedTitle}>Your details</div>
              <div style={{ fontSize: 12, color: "#8C7A5B", marginBottom: 14 }}>So we can confirm your order</div>
              <input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Full name" style={styles.modalInput} />
              <input value={custPhone} onChange={(e) => setCustPhone(e.target.value)} placeholder="Phone number" style={styles.modalInput} />
              <button style={styles.browseBtn} onClick={submitOrder} disabled={saving}>
                {saving ? "Placing order..." : `Confirm order · ${currency(cartTotal)}`}
              </button>
            </div>
          </div>
        )}

        {toast && <div style={styles.toast}>{toast}</div>}
      </div>
    </div>
  );
}
