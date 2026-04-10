import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { add } = useCart();
  const p = state?.product;

  if (!p) {
    return (
      <div className="page-sm">
        <div className="empty-state">Product not found.</div>
      </div>
    );
  }

  const addToCart = () => {
    add(p, 1);
    navigate('/cart');
  };

  return (
    <div className="page">
      <div className="btn-row" style={{ marginBottom: 18 }}>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="product-image-wrap" style={{ height: 380, borderRadius: 14, overflow: 'hidden' }}>
            {p.imageUrl ? (
              <img src={`http://localhost:5000/${p.imageUrl}`} alt={p.name} className="product-image" />
            ) : (
              <span className="muted">No image</span>
            )}
          </div>
        </div>

        <div className="card">
          <h1 className="hero-title" style={{ fontSize: 30 }}>{p.name}</h1>
          <div className="price" style={{ marginBottom: 14 }}>{p.amount} Taka</div>
          <p className="muted">{p.description || 'No description available.'}</p>

          <p><strong>Category:</strong> {p.category || 'General'}</p>
          <p><strong>Seller Name:</strong> {p.sellerId?.name || 'Unknown'}</p>
          <p><strong>Seller Email:</strong> {p.sellerId?.email || 'N/A'}</p>

          <div className="btn-row" style={{ marginTop: 18 }}>
            {p.isSold ? (
              <span className="badge badge-danger">SOLD</span>
            ) : (
              <button className="btn btn-primary" onClick={addToCart}>
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}