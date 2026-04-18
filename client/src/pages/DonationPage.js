import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function DonationPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    amount: '',
    purpose: 'General Donation',
    message: '',
    donorName: '',
    donorEmail: '',
    donorPhone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presetAmounts = [100, 500, 1000, 2000];

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePresetAmount = (value) => {
    setForm((prev) => ({
      ...prev,
      amount: String(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    if (!form.donorName.trim() || !form.donorEmail.trim() || !form.donorPhone.trim()) {
      setError('Please provide your name, email and phone number.');
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post('/payments/start-donation', {
        amount: Number(form.amount),
        purpose: form.purpose,
        message: form.message,
        donor: {
          name: form.donorName.trim(),
          email: form.donorEmail.trim(),
          phone: form.donorPhone.trim(),
        },
      });

      if (res.data?.gatewayUrl) {
        window.location.href = res.data.gatewayUrl;
        return;
      }

      setError('Could not start payment. Please try again.');
    } catch (err) {
      setError(err.response?.data?.message || 'Donation payment start failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 32 }}>
          Donate for Animal Care
        </h1>
        <p className="muted">
          Your donation helps provide food, shelter, treatment, and rescue support.
        </p>

        <div className="btn-row" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          {presetAmounts.map((amount) => (
            <button
              key={amount}
              type="button"
              className={`btn ${String(form.amount) === String(amount) ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => handlePresetAmount(amount)}
            >
              {amount} Taka
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="form" style={{ marginTop: 20 }}>
          <div>
            <label className="muted">Donation Amount</label>
            <input
              className="input"
              type="number"
              min="1"
              step="1"
              name="amount"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="muted">Your Name</label>
            <input
              className="input"
              type="text"
              name="donorName"
              placeholder="Enter your full name"
              value={form.donorName}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="muted">Your Email</label>
            <input
              className="input"
              type="email"
              name="donorEmail"
              placeholder="Enter your email"
              value={form.donorEmail}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="muted">Your Phone</label>
            <input
              className="input"
              type="text"
              name="donorPhone"
              placeholder="Enter your phone number"
              value={form.donorPhone}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="muted">Purpose</label>
            <select
              className="input"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
            >
              <option value="General Donation">General Donation</option>
              <option value="Food Support">Food Support</option>
              <option value="Shelter Support">Shelter Support</option>
              <option value="Medical Support">Medical Support</option>
              <option value="Emergency Treatment">Emergency Treatment</option>
            </select>
          </div>

          <div>
            <label className="muted">Message (Optional)</label>
            <textarea
              className="textarea"
              name="message"
              placeholder="Write a short message"
              value={form.message}
              onChange={handleChange}
            />
          </div>

          {error && (
            <div className="badge badge-danger" style={{ width: 'fit-content' }}>
              {error}
            </div>
          )}

          <div className="btn-row">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Redirecting...' : 'Proceed to Donation Payment'}
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/my-donations')}
            >
              View My Donations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}