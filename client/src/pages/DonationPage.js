import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function DonationPage() {
  const { user } = useAuth();

  // --- MONEY DONATION ---
  const [moneyForm, setMoneyForm] = useState({
    amount: '',
    purpose: 'General Donation',
    message: '',
    donor: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
    },
  });
  const [loadingMoney, setLoadingMoney] = useState(false);
  const [moneyMsg, setMoneyMsg] = useState('');

  // --- ITEM DONATION ---
  const [itemForm, setItemForm] = useState({ title: '', description: '' });
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemMsg, setItemMsg] = useState('');

  // --- REQUEST HELP ---
  const [requestForm, setRequestForm] = useState({
    itemNeeded: '',
    reason: '',
    urgency: 'Medium',
  });
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');

  const [myRequests, setMyRequests] = useState([]);

  useEffect(() => {
    fetchMyRequests();
  }, []);

  async function fetchMyRequests() {
    try {
      const res = await axios.get('/requests/my');
      setMyRequests(res.data || []);
    } catch (err) {
      console.error('Failed to fetch requests');
    }
  }

  // --- HANDLERS ---
  const handleMoneyChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('donor.')) {
      const field = name.split('.')[1];
      setMoneyForm({
        ...moneyForm,
        donor: { ...moneyForm.donor, [field]: value },
      });
    } else {
      setMoneyForm({ ...moneyForm, [name]: value });
    }
  };

  const submitMoney = async (e) => {
    e.preventDefault();
    setLoadingMoney(true);
    setMoneyMsg('');

    try {
      const res = await axios.post('/payments/donation/start', moneyForm);
      if (res.data.gatewayUrl) {
        window.location.href = res.data.gatewayUrl;
      } else {
        setMoneyMsg('Payment initialization failed.');
      }
    } catch (err) {
      setMoneyMsg('Error processing donation.');
    } finally {
      setLoadingMoney(false);
    }
  };

  const submitItem = async (e) => {
    e.preventDefault();
    setLoadingItem(true);
    setItemMsg('');

    try {
      await axios.post('/donations/item', itemForm);
      setItemMsg('Item submitted successfully!');
      setItemForm({ title: '', description: '' });
    } catch (err) {
      setItemMsg('Error submitting item.');
    } finally {
      setLoadingItem(false);
    }
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    setLoadingRequest(true);
    setRequestMsg('');

    try {
      await axios.post('/requests', requestForm);
      setRequestMsg('Request submitted successfully!');
      setRequestForm({ itemNeeded: '', reason: '', urgency: 'Medium' });
      fetchMyRequests();
    } catch (err) {
      setRequestMsg('Error submitting request.');
    } finally {
      setLoadingRequest(false);
    }
  };

  return (
    <div className="page">
      <h1 className="hero-title">Support Animals</h1>

      {/* MONEY DONATION */}
      <div className="card">
        <h2>💸 Donate Money</h2>
        <form onSubmit={submitMoney}>
          <input
            className="input"
            name="donor.name"
            value={moneyForm.donor.name}
            onChange={handleMoneyChange}
            placeholder="Name"
            required
          />
          <input
            className="input"
            name="donor.email"
            value={moneyForm.donor.email}
            onChange={handleMoneyChange}
            placeholder="Email"
            required
          />
          <input
            className="input"
            name="amount"
            type="number"
            value={moneyForm.amount}
            onChange={handleMoneyChange}
            placeholder="Amount"
            required
          />

          <button className="btn btn-primary" disabled={loadingMoney}>
            {loadingMoney ? 'Processing...' : 'Donate'}
          </button>

          {moneyMsg && <p>{moneyMsg}</p>}
        </form>
      </div>

      {/* ITEM DONATION */}
      <div className="card">
        <h2>📦 Donate Items</h2>
        <form onSubmit={submitItem}>
          <input
            className="input"
            value={itemForm.title}
            onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
            placeholder="Item title"
            required
          />
          <textarea
            className="textarea"
            value={itemForm.description}
            onChange={(e) =>
              setItemForm({ ...itemForm, description: e.target.value })
            }
            placeholder="Description"
            required
          />

          <button className="btn btn-secondary" disabled={loadingItem}>
            {loadingItem ? 'Submitting...' : 'Submit'}
          </button>

          {itemMsg && <p>{itemMsg}</p>}
        </form>
      </div>

      {/* REQUEST HELP */}
      <div className="card">
        <h2>🙏 Request Help</h2>
        <form onSubmit={submitRequest}>
          <input
            className="input"
            value={requestForm.itemNeeded}
            onChange={(e) =>
              setRequestForm({ ...requestForm, itemNeeded: e.target.value })
            }
            placeholder="Item needed"
            required
          />

          <textarea
            className="textarea"
            value={requestForm.reason}
            onChange={(e) =>
              setRequestForm({ ...requestForm, reason: e.target.value })
            }
            placeholder="Reason"
            required
          />

          <button className="btn btn-primary" disabled={loadingRequest}>
            {loadingRequest ? 'Submitting...' : 'Submit Request'}
          </button>

          {requestMsg && <p>{requestMsg}</p>}
        </form>
      </div>

      {/* MY REQUESTS */}
      <div className="card">
        <h2>📋 My Requests</h2>
        {myRequests.map((r) => (
          <div key={r._id}>
            <strong>{r.itemNeeded}</strong> — {r.status}
          </div>
        ))}
      </div>
    </div>
  );
}