import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get('/orders/mine');
        setOrders(res.data || []);
      } catch (e) {
        setError(e.response?.data?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const refresh = async () => {
    const res = await axios.get('/orders/mine');
    setOrders(res.data || []);
  };

  const cancelOrder = async (id) => {
    try {
      await axios.post(`/orders/${id}/cancel`);
      await refresh();
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (loading) {
    return (
      <div className="page-sm">
        <div className="empty-state">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-sm">
        <div className="card">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="hero-title">My Orders</h1>
      <p className="muted">Track, review, or cancel your existing orders.</p>

      {orders.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 20 }}>No orders yet.</div>
      ) : (
        <div className="list" style={{ marginTop: 20 }}>
          {orders.map((o) => (
            <div className="card" key={o._id}>
              <div className="split">
                <div>
                  <div><strong>Order ID:</strong> {"ORD-" + o._id.slice(-6)}</div>
                  <div><strong>Placed:</strong> {new Date(o.createdAt).toLocaleString()}</div>
                  <div><strong>Items:</strong> {o.items?.length || 0}</div>
                  <div><strong>Total:</strong> {Number(o.total || 0).toFixed(2)} Taka</div>
                </div>

                <div>
                  <span
                    className={`badge ${
                      o.status === 'cancelled'
                        ? 'badge-danger'
                        : o.status === 'delivered'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>

              {Array.isArray(o.items) && o.items.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ marginTop: 0 }}>Products</h3>
                  <div className="list">
                    {o.items.map((it, idx) => (
                      <div className="list-item" key={idx}>
                        {it.imageUrl ? (
                          <img
                            src={`http://localhost:5000/${it.imageUrl}`}
                            alt={it.name}
                            className="thumb"
                          />
                        ) : (
                          <div className="thumb" />
                        )}

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>{it.name}</div>
                          <div className="muted">
                            {it.amount} × {it.quantity || 1}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="btn-row" style={{ marginTop: 16 }}>
                <Link to={`/track/${o._id}`} className="btn btn-secondary" style={{ display: 'inline-block' }}>
                  Track Details
                </Link>
                {o.status !== 'cancelled' && (
                  <button className="btn btn-danger" onClick={() => cancelOrder(o._id)}>
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}