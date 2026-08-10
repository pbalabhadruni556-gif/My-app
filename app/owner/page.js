"use client";
import React, { useState, useEffect } from "react";
import { Lock, Plus, PenLine, Trash2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { styles, CATEGORIES, currency, statusStyle } from "../../lib/ui";

export default function OwnerPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState(false);
  const [section, setSection] = useState("orders");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    if (unlocked) {
      fetch("/api/products").then((r) => r.json()).then(setProducts);
      fetch("/api/orders").then((r) => r.json()).then(setOrders);
    }
  }, [unlocked]);

  async function checkPin() {
    const res = await fetch("/api/owner-auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    const data = await res.json();
    if (data.ok) setUnlocked(true);
    else setPinError(true);
  }

  async function updateStatus(id, status) {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status } : x)));
    await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  async function saveProduct(draft) {
    const method = draft.id ? "PUT" : "POST";
    const res = await fetch("/api/products", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const saved = await res.json();
    setProducts((prev) => {
      if (draft.id) return prev.map((p) => (p.id === saved.id ? saved : p));
      return [...prev, saved];
    });
    setEditing(null);
  }

  async function deleteProduct(id) {
    await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  if (!unlocked) {
    return (
      <div style={styles.phoneOuter}>
        <div style={styles.phoneFrame}>
          <div style={styles.header}>
            <Link href="/" style={{ color: "#EDE4CE", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: 12.5 }}>
              <ArrowLeft size={14} /> Back to shop
            </Link>
          </div>
          <div style={styles.body}>
            <div style={styles.lockWrap}>
              <div style={styles.lockCircle}><Lock size={22} color="#EDE4CE" strokeWidth={2.2} /></div>
              <div style={styles.placedTitle}>Owner area</div>
              <div style={styles.placeholderText}>Enter PIN to manage products &amp; orders</div>
              <input
                type="password"
                value={pin}
                onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                placeholder="PIN"
                style={{ ...styles.modalInput, marginTop: 14, textAlign: "center", letterSpacing: 4 }}
              />
              {pinError && <div style={{ color: "#A8471F", fontSize: 11.5, marginBottom: 8 }}>Incorrect PIN</div>}
              <button style={styles.browseBtn} onClick={checkPin}>Unlock</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeOrders = orders.filter((o) => o.status !== "Delivered");

  if (editing !== null) {
    return (
      <div style={styles.phoneOuter}>
        <div style={styles.phoneFrame}>
          <div style={styles.header}><div style={styles.storeName}>Owner</div></div>
          <div style={styles.body}>
            <ProductEditor product={editing} onSave={saveProduct} onCancel={() => setEditing(null)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.phoneOuter}>
      <div style={styles.phoneFrame}>
        <div style={styles.header}>
          <Link href="/" style={{ color: "#EDE4CE", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: 12.5 }}>
            <ArrowLeft size={14} /> Back to shop
          </Link>
        </div>
        <div style={styles.body}>
          <div style={styles.ownerTabs}>
            {["orders", "products"].map((s) => (
              <button key={s} onClick={() => setSection(s)} style={{ ...styles.ownerTabBtn, background: section === s ? "#1E3557" : "#FFFFFF", color: section === s ? "#EDE4CE" : "#22262B" }}>
                {s === "orders" ? `Orders (${activeOrders.length})` : "Products"}
              </button>
            ))}
          </div>

          {section === "orders" && (
            <>
              {orders.length === 0 && <div style={styles.placeholderText}>No orders yet.</div>}
              {orders.map((o) => (
                <div key={o.id} style={styles.orderCard}>
                  <div style={styles.orderCardTop}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{o.customer_name}</div>
                      <div style={{ fontSize: 11, color: "#8C7A5B" }}>{o.phone}</div>
                    </div>
                    <span style={{ ...styles.statusPill, ...statusStyle(o.status) }}>{o.status}</span>
                  </div>
                  {o.items.map((it) => (
                    <div key={it.productId} style={styles.orderItemRow}>
                      <span>{it.name} × {it.qty}{it.unit}</span>
                      <span style={styles.mono}>{currency(it.qty * it.price)}</span>
                    </div>
                  ))}
                  <div style={styles.orderTotalRow}><span>Total</span><span style={styles.mono}>{currency(o.total)}</span></div>
                  <div style={styles.statusBtnRow}>
                    {["New", "Packed", "Out for delivery", "Delivered"].map((s) => (
                      <button key={s} onClick={() => updateStatus(o.id, s)} style={{ ...styles.statusBtn, ...(o.status === s ? styles.statusBtnActive : {}) }}>{s}</button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {section === "products" && (
            <>
              <button
                style={{ ...styles.browseBtn, width: "100%", marginBottom: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}
                onClick={() => setEditing({ category: "grocery", unit: "kg", min_qty: 1, step: 1, price: 0, name: "" })}
              >
                <Plus size={14} strokeWidth={2.5} /> Add new product
              </button>
              {products.map((p) => (
                <div key={p.id} style={styles.productRow}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: "#8C7A5B" }}>{currency(p.price)}/{p.unit} · min {p.min_qty}{p.unit} · {p.category}</div>
                  </div>
                  <button style={styles.iconBtn} onClick={() => setEditing(p)}><PenLine size={14} color="#1E3557" /></button>
                  <button style={styles.iconBtn} onClick={() => deleteProduct(p.id)}><Trash2 size={14} color="#A8471F" /></button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductEditor({ product, onSave, onCancel }) {
  const [draft, setDraft] = useState(product);
  return (
    <div>
      <button onClick={onCancel} style={styles.backBtn}><ArrowLeft size={14} /> Back</button>
      <div style={styles.sectionLabel}>{product.id ? "Edit product" : "New product"}</div>
      <label style={styles.fieldLabel}>Name</label>
      <input style={styles.modalInput} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="e.g. Sona Masoori Rice" />
      <label style={styles.fieldLabel}>Category</label>
      <div style={styles.catRow}>
        {CATEGORIES.map((c) => (
          <button key={c.id} onClick={() => setDraft({ ...draft, category: c.id })} style={{ ...styles.catChip, background: draft.category === c.id ? c.color : "#FFFFFF", borderColor: draft.category === c.id ? c.color : "#DDD3B8" }}>
            <span style={{ ...styles.catChipLabel, color: draft.category === c.id ? "#EDE4CE" : "#22262B" }}>{c.label}</span>
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.fieldLabel}>Price (₹)</label>
          <input type="number" style={styles.modalInput} value={draft.price} onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.fieldLabel}>Unit</label>
          <input style={styles.modalInput} value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} placeholder="kg / L / pack / pc" />
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={styles.fieldLabel}>Min order</label>
          <input type="number" style={styles.modalInput} value={draft.min_qty} onChange={(e) => setDraft({ ...draft, min_qty: Number(e.target.value) })} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={styles.fieldLabel}>Step size</label>
          <input type="number" style={styles.modalInput} value={draft.step} onChange={(e) => setDraft({ ...draft, step: Number(e.target.value) })} />
        </div>
      </div>
      <button style={{ ...styles.browseBtn, width: "100%", marginTop: 8 }} onClick={() => draft.name.trim() && draft.price > 0 && onSave(draft)}>
        Save product
      </button>
    </div>
  );
}
