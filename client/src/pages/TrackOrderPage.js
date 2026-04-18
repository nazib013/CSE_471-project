import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useParams } from 'react-router-dom';

export default function TrackOrderPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (e) {}
    })();
  }, [id]);

  if (!order) {
    return (
      <div className="page-sm">
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 28 }}>Order Tracking</h1>
        <p><strong>Order ID:</strong> {"ORD-" + order._id.slice(-6)}</p>
        <p>
          <strong>Status:</strong>{' '}
          <span
            className={`badge ${
              order.status === 'delivered'
                ? 'badge-success'
                : order.status === 'cancelled'
                ? 'badge-danger'
                : 'badge-warning'
            }`}
          >
            {order.status}
          </span>
        </p>

        {order.deliveryTracking?.carrier && (
          <p>
            <strong>Carrier:</strong> {order.deliveryTracking.carrier} <br />
            <strong>Tracking #:</strong> {order.deliveryTracking.trackingNumber}
          </p>
        )}

        {order.deliveryTracking?.eta && (
          <p>
            <strong>ETA:</strong> {new Date(order.deliveryTracking.eta).toLocaleString()}
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: 20 }}>
        <h2 className="section-title">History</h2>
        {(order.deliveryTracking?.history || []).length === 0 ? (
          <div className="empty-state">No tracking history yet.</div>
        ) : (
          <div className="order-history">
            {(order.deliveryTracking?.history || []).map((h, idx) => (
              <div className="history-item" key={idx}>
                <div><strong>{h.status}</strong></div>
                <div className="muted">{h.note}</div>
                <div style={{ marginTop: 6 }}>{new Date(h.at).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}