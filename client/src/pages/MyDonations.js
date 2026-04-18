import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function MyDonations() {
  const [moneyHistory, setMoneyHistory] = useState([]);
  const [itemHistory, setItemHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [moneyRes, itemRes] = await Promise.all([
          axios.get('/donations/my-donations'),
          axios.get('/donations/my-items')
        ]);
        setMoneyHistory(moneyRes.data);
        setItemHistory(itemRes.data);
      } catch (err) {
        console.error("Error loading history");
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="page-sm">Loading your contributions...</div>;

  return (
    <div className="page-sm">
      <h1 className="hero-title">My Contributions</h1>
      <p className="muted">Track all the support you have provided to animals in need.</p>

      {/* --- MONEY SECTION --- */}
      <div className="card shadow-sm" style={{ marginTop: 25 }}>
        <h3>Monetary Donations</h3>
        {moneyHistory.length === 0 ? <p>No monetary donations yet.</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 10 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Amount</th>
                <th>Purpose</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {moneyHistory.map(don => (
                <tr key={don._id} style={{ borderBottom: '1px solid #fafafa' }}>
                  <td style={{ padding: '10px', color: '#065f46', fontWeight: 'bold' }}>{don.amount} TK</td>
                  <td>{don.purpose}</td>
                  <td className="muted">{new Date(don.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* --- ITEMS SECTION --- */}
      <div className="card shadow-sm" style={{ marginTop: 25 }}>
        <h3>Items Donated</h3>
        {itemHistory.length === 0 ? <p>No items donated yet.</p> : (
          <div className="grid" style={{ marginTop: 10 }}>
            {itemHistory.map(item => (
              <div key={item._id} className="card" style={{ borderLeft: '4px solid #4f46e5', marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{item.title}</strong>
                  <span className="badge">{item.category}</span>
                </div>
                <p style={{ fontSize: '13px', marginTop: 5 }}>{item.description}</p>
                <small className="muted">{new Date(item.createdAt).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}