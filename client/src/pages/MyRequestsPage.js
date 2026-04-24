import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

export default function MyRequestsPage() {
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  async function fetchMyRequests() {
    try {
      const res = await axios.get('/requests/my');
      setMyRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-sm">
      <Link to="/donate" className="back-link">← Back to Donate</Link>
      <div className="card">
        <div className="donation-form-head">
          <span className="donation-icon">📋</span>
          <div>
            <h1 className="hero-title">My Requests</h1>
            <p className="muted">Track the help requests you submitted.</p>
          </div>
        </div>

        {loading ? (
          <p className="muted">Loading requests...</p>
        ) : myRequests.length ? (
          <div className="request-list">
            {myRequests.map((r) => (
              <div key={r._id} className="request-row">
                <div>
                  <strong>{r.itemNeeded}</strong>
                  {r.reason && <p className="muted">{r.reason}</p>}
                </div>
                <span className="info-pill">{r.status}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No requests submitted yet.</p>
            <Link to="/donate/request-help" className="btn btn-primary">Create Request</Link>
          </div>
        )}
      </div>
    </div>
  );
}