import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function MyDonations() {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/donations/mine');
      setDonations(res.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load donations.');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  if (loading) {
    return (
      <div className="page-sm">
        <div className="empty-state">Loading donations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-sm">
        <div className="card">
          <div className="badge badge-danger">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 30 }}>My Donations</h1>
        <p className="muted">Here is your personal donation history.</p>

        <div className="grid grid-2" style={{ marginTop: 18 }}>
          <div className="card" style={{ background: '#f8fbff' }}>
            <strong>Total Donations</strong>
            <div style={{ marginTop: 8 }}>{donations.length}</div>
          </div>

          <div className="card" style={{ background: '#f8fbff' }}>
            <strong>Total Amount</strong>
            <div style={{ marginTop: 8 }}>{totalAmount.toFixed(2)} Taka</div>
          </div>
        </div>
      </div>

      {donations.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 18 }}>
          You have not made any donations yet.
        </div>
      ) : (
        <div className="list" style={{ marginTop: 18 }}>
          {donations.map((d) => (
            <div className="card" key={d._id}>
              <div className="split">
                <div>
                  <div><strong>Amount:</strong> {Number(d.amount).toFixed(2)} Taka</div>
                  <div><strong>Purpose:</strong> {d.purpose}</div>
                  <div><strong>Status:</strong> {d.status}</div>
                  <div><strong>Date:</strong> {new Date(d.createdAt).toLocaleString()}</div>
                </div>

                <div>
                  <span
                    className={`badge ${
                      d.status === 'completed'
                        ? 'badge-success'
                        : d.status === 'failed'
                        ? 'badge-danger'
                        : 'badge-warning'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
              </div>

              {d.message && (
                <div style={{ marginTop: 14 }}>
                  <strong>Message:</strong>
                  <div className="muted" style={{ marginTop: 6 }}>{d.message}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}