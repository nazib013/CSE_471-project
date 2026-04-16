import React, { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function PaymentSuccess() {
  const { orderId } = useParams();
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 28 }}>Payment Successful</h1>
        <p>Your payment was completed successfully.</p>
        <p><strong>Order ID:</strong> {orderId}</p>

        <div className="btn-row" style={{ marginTop: 18 }}>
          <Link to={`/track/${orderId}`} className="btn btn-primary">
            Track Order
          </Link>
          <Link to="/orders" className="btn btn-secondary">
            My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}