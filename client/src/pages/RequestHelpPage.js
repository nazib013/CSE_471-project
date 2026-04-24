import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

export default function RequestHelpPage() {
  const [requestForm, setRequestForm] = useState({
    itemNeeded: '',
    reason: '',
    urgency: 'Medium',
  });
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');

  const submitRequest = async (e) => {
    e.preventDefault();
    setLoadingRequest(true);
    setRequestMsg('');

    try {
      await axios.post('/requests', requestForm);
      setRequestMsg('Request submitted successfully!');
      setRequestForm({ itemNeeded: '', reason: '', urgency: 'Medium' });
    } catch (err) {
      setRequestMsg('Error submitting request.');
    } finally {
      setLoadingRequest(false);
    }
  };

  return (
    <div className="page-sm">
      <Link to="/donate" className="back-link">← Back to Donate</Link>
      <div className="donation-form-card card">
        <div className="donation-form-head">
          <span className="donation-icon">🙏</span>
          <div>
            <h1 className="hero-title">Request Help</h1>
            <p className="muted">Request support for needed animal care items and explain the urgency.</p>
          </div>
        </div>

        <form onSubmit={submitRequest} className="form-grid">
          <input
            className="input"
            value={requestForm.itemNeeded}
            onChange={(e) => setRequestForm({ ...requestForm, itemNeeded: e.target.value })}
            placeholder="Item needed"
            required
          />

          <select
            className="select"
            value={requestForm.urgency}
            onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>

          <textarea
            className="textarea"
            value={requestForm.reason}
            onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
            placeholder="Reason"
            required
          />

          <button className="btn btn-primary" disabled={loadingRequest}>
            {loadingRequest ? 'Submitting...' : 'Submit Request'}
          </button>

          {requestMsg && <p className="form-message">{requestMsg}</p>}
        </form>
      </div>
    </div>
  );
}