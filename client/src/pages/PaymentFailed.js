import React from 'react';
import { Link } from 'react-router-dom';

export default function PaymentFailed() {
  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 28 }}>Payment Failed</h1>
        <p>Your payment could not be completed.</p>
        <p>Please try again from your cart or checkout page.</p>

        <div className="btn-row" style={{ marginTop: 18 }}>
          <Link to="/cart" className="btn btn-primary">
            Back to Cart
          </Link>
          <Link to="/checkout" className="btn btn-secondary">
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}