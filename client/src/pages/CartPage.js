import React from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { items, remove, totals } = useCart();
  const navigate = useNavigate();

  if (!items.length) {
    return (
      <div className="page-sm">
        <div className="empty-state">Your cart is empty.</div>
      </div>
    );
  }

  return (
    <div className="page-sm">
      <h1 className="hero-title">Your Cart</h1>
      <p className="muted">Review your selected pets before checkout.</p>

      <div className="list" style={{ marginTop: 20 }}>
        {items.map((it) => (
          <div key={it._id} className="list-item">
            {it.imageUrl ? (
              <img
                src={`${process.env.REACT_APP_API_URL}/${it.imageUrl}`}
                alt={it.name}
                className="thumb"
              />
            ) : (
              <div className="thumb" />
            )}

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>{it.name}</div>
              <div className="muted">{it.description || 'No description'}</div>
              <div style={{ marginTop: 6 }}><strong>{it.amount} Taka</strong></div>
            </div>

            <div className="btn-row">
              <span className="badge badge-primary">Qty: 1</span>
              <button className="btn btn-danger" onClick={() => remove(it._id)}>
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <div className="split">
          <div>
            <h2 className="section-title" style={{ marginBottom: 6 }}>Order Summary</h2>
            <p className="muted">Subtotal of your selected items.</p>
          </div>
          <div style={{ fontSize: 26, fontWeight: 800 }}>
            {totals.subtotal.toFixed(2)} Taka
          </div>
        </div>

        <div className="btn-row" style={{ marginTop: 18 }}>
          <button className="btn btn-primary" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
          <button className="btn btn-secondary" onClick={() => navigate('/products')}>
            Continue Browsing
          </button>
        </div>
      </div>
    </div>
  );
}