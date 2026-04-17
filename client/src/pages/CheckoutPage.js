import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function CheckoutPage() {
  const { items } = useCart();
  const navigate = useNavigate();

  const [shipping, setShipping] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
  });

  const [loading, setLoading] = useState(false);

  if (!items.length) {
    return (
      <div className="page-sm">
        <div className="empty-state">Nothing to checkout.</div>
      </div>
    );
  }

  const placeOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i._id,
          quantity: i.quantity || 1,
        })),
        shipping,
      };

      const res = await axios.post('/payments/start-order', payload);

      if (res.data?.gatewayUrl) {
        window.location.href = res.data.gatewayUrl;
        return;
      }

      alert('Payment page could not be opened');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to start payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 30 }}>Checkout</h1>
        <p className="muted">Enter your shipping details and continue to payment.</p>

        <div className="form-grid" style={{ marginTop: 18 }}>
          {['name', 'email', 'phone', 'address', 'city', 'country', 'postalCode'].map((k) => (
            <input
              key={k}
              className="input"
              placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
              value={shipping[k]}
              onChange={(e) => setShipping({ ...shipping, [k]: e.target.value })}
            />
          ))}
        </div>

        <div className="btn-row" style={{ marginTop: 18 }}>
          <button className="btn btn-primary" disabled={loading} onClick={placeOrder}>
            {loading ? 'Opening Payment...' : 'Proceed to Payment'}
          </button>

          <button className="btn btn-secondary" onClick={() => navigate('/cart')}>
            Back to Cart
          </button>
        </div>
      </div>
    </div>
  );
}