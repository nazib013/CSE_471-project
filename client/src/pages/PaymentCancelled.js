import React from 'react';
import { Link } from 'react-router-dom';

export default function PaymentCancelled() {
  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 28 }}>Payment Cancelled</h1>
        <p>You cancelled the payment.</p>
        <p>Your cart is still there, so you can come back and try again anytime.</p>

        <div className="btn-row" style={{ marginTop: 18 }}>
          <Link to="/cart" className="btn btn-primary">
            Back to Cart
          </Link>
          <Link to="/checkout" className="btn btn-secondary">
            Checkout Again
          </Link>
        </div>
      </div>
    </div>
  );
}