import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function DonationPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    amount: '',
    purpose: 'General Donation',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const presetAmounts = [100, 500, 1000, 2000];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePresetAmount = (value) => {
    setForm({ ...form, amount: String(value) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.amount || Number(form.amount) <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    try {
      setLoading(true);
      await axios.post('/donations', {
        amount: Number(form.amount),
        purpose: form.purpose,
        message: form.message,
      });

      setSuccess('Thank you for your donation!');
      setForm({
        amount: '',
        purpose: 'General Donation',
        message: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 30 }}>Support Rescued Pets</h1>
        <p className="muted">
          Your donation helps provide food, shelter, medicine, and emergency care.
        </p>

        <div style={{ marginTop: 18 }}>
          <label className="muted">Choose a quick amount</label>
          <div className="btn-row" style={{ marginTop: 10 }}>
            {presetAmounts.map((amt) => (
              <button
                type="button"
                key={amt}
                className="btn btn-secondary"
                onClick={() => handlePresetAmount(amt)}
              >
                {amt} Taka
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 18 }}>
          <div>
            <label className="muted">Donation Amount</label>
            <input
              className="input"
              type="number"
              name="amount"
              min="1"
              placeholder="Enter amount"
              value={form.amount}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="muted">Purpose</label>
            <select
              className="select"
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
            >
              <option value="General Donation">General Donation</option>
              <option value="Food Support">Food Support</option>
              <option value="Medical Support">Medical Support</option>
              <option value="Rescue Support">Rescue Support</option>
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

          {success && (
            <div className="badge badge-success" style={{ width: 'fit-content' }}>
              {success}
            </div>
          )}

          <div className="btn-row">
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : 'Donate Now'}
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