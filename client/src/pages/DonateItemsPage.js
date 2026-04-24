import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';

export default function DonateItemsPage() {
  const [itemForm, setItemForm] = useState({ title: '', description: '' });
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemMsg, setItemMsg] = useState('');

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

  return (
    <div className="page-sm">
      <Link to="/donate" className="back-link">← Back to Donate</Link>
      <div className="donation-form-card card">
        <div className="donation-form-head">
          <span className="donation-icon">📦</span>
          <div>
            <h1 className="hero-title">Donate Items</h1>
            <p className="muted">Submit useful food, medicine, toys, blankets, or other animal care items.</p>
          </div>
        </div>

        <form onSubmit={submitItem} className="form-grid">
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
            onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
            placeholder="Description"
            required
          />

          <button className="btn btn-primary" disabled={loadingItem}>
            {loadingItem ? 'Submitting...' : 'Submit Item'}
          </button>

          {itemMsg && <p className="form-message">{itemMsg}</p>}
        </form>
      </div>
    </div>
  );
}