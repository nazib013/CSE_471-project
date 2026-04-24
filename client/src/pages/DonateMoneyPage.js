import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function DonateMoneyPage() {
  const { user } = useAuth();
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

  return (
    <div className="page-sm">
      <Link to="/donate" className="back-link">← Back to Donate</Link>
      <div className="donation-form-card card">
        <div className="donation-form-head">
          <span className="donation-icon">💸</span>
          <div>
            <h1 className="hero-title">Donate Money</h1>
            <p className="muted">Support animal rescue, food, shelter, and care through a secure donation.</p>
          </div>
        </div>

        <form onSubmit={submitMoney} className="form-grid">
          <input className="input" name="donor.name" value={moneyForm.donor.name} onChange={handleMoneyChange} placeholder="Name" required />
          <input className="input" name="donor.email" value={moneyForm.donor.email} onChange={handleMoneyChange} placeholder="Email" required />
          <input className="input" name="donor.phone" value={moneyForm.donor.phone} onChange={handleMoneyChange} placeholder="Phone number" />
          <input className="input" name="amount" type="number" value={moneyForm.amount} onChange={handleMoneyChange} placeholder="Amount" required />

          <select className="select" name="purpose" value={moneyForm.purpose} onChange={handleMoneyChange}>
            <option>General Donation</option>
            <option>Food Support</option>
            <option>Medical Support</option>
            <option>Shelter Support</option>
          </select>

          <textarea className="textarea" name="message" value={moneyForm.message} onChange={handleMoneyChange} placeholder="Message, optional" />

          <button className="btn btn-primary" disabled={loadingMoney}>
            {loadingMoney ? 'Processing...' : 'Donate Now'}
          </button>

          {moneyMsg && <p className="form-message">{moneyMsg}</p>}
        </form>
      </div>
    </div>
  );
}