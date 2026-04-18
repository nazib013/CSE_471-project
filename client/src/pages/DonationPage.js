import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

export default function DonationPage() {
  const navigate = useNavigate();
  
  // Tab State: 'money', 'items', 'list', or 'request'
  const [activeTab, setActiveTab] = useState('money'); 

  // --- MONETARY DONATION STATES ---
  const [form, setForm] = useState({ amount: '', purpose: 'General Donation', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const presetAmounts = [100, 500, 1000, 2000];

  // --- ITEM DONATION STATES ---
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemLoading, setItemLoading] = useState(false);
  
  // --- LIST OF ITEMS STATES ---
  const [itemList, setItemList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All'); // NEW: For filtering

  // --- REQUEST HELP STATES ---
  const [requestForm, setRequestForm] = useState({ itemNeeded: '', reason: '', urgency: 'Medium' });
  const [requestLoading, setRequestLoading] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  
  // Clear messages when switching tabs or unmounting the component
  useEffect(() => {
    setError('');
    setSuccess('');
    
    return () => {
      setSuccess('');
      setError('');
    };
  }, [activeTab]);

  // Fetch data based on tab
  useEffect(() => {
    // Fetch items when either the donation form or the list tab is open
    if (activeTab === 'items' || activeTab === 'list') {
      fetchItems();
    } else if (activeTab === 'request') {
      fetchMyRequests();
    }
  }, [activeTab]);

  const fetchItems = async () => {
    try {
      const res = await axios.get('/donations/items');
      setItemList(res.data);
    } catch (err) {
      console.error("Failed to fetch item donations", err);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const res = await axios.get('/requests/my');
      setMyRequests(res.data);
    } catch (err) {
      console.error("Failed to fetch your requests", err);
    }
  };

  // --- MONETARY HANDLERS ---
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handlePresetAmount = (value) => setForm({ ...form, amount: String(value) });

  const handleMoneySubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
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
      setSuccess('Thank you for your monetary donation!');
      setForm({ amount: '', purpose: 'General Donation', message: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit donation.');
    } finally {
      setLoading(false);
    }
  };

  // --- ITEM HANDLERS ---
  const handleItemSubmit = async (e) => {
    e.preventDefault();
    setItemLoading(true); 
    setSuccess(''); 
    setError('');
    
    try {
      const payload = {
        title: itemTitle,
        description: itemDesc
      };

      await axios.post('/donations/items', payload);
      
      setSuccess('Item donated successfully! Check the List of Items tab to see it.');
      
      setItemTitle(''); 
      setItemDesc('');
      
      fetchItems();
    } catch (err) {
      console.error("🚨 FRONTEND CRASH DETAILS:", err);
      const backendError = err.response?.data?.message || 'Failed to submit donation.';
      setError(backendError);
    } finally {
      setItemLoading(false);
    }
  };

  // --- REQUEST HANDLERS ---
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      setRequestLoading(true);
      await axios.post('/requests', requestForm);
      setSuccess('Help request submitted! An admin will review it soon.');
      setRequestForm({ itemNeeded: '', reason: '', urgency: 'Medium' });
      fetchMyRequests();
    } catch (err) {
      setError('Failed to submit request.');
    } finally {
      setRequestLoading(false);
    }
  };

  // --- FILTER LOGIC ---
  const filteredItems = selectedCategory === 'All' 
    ? itemList 
    : itemList.filter(item => item.category === selectedCategory);

  return (
    <div className="page-sm">
      <div className="card shadow-lg">
        <h1 className="hero-title" style={{ fontSize: 30 }}>Support & Resources</h1>
        <p className="muted">Donate to help or request supplies for animals in need.</p>

        {/* --- TABS --- */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', marginBottom: '20px', borderBottom: '2px solid #eee', paddingBottom: '10px', overflowX: 'auto' }}>
          <button 
            className={`btn ${activeTab === 'money' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('money')}
          >
            Money
          </button>
          <button 
            className={`btn ${activeTab === 'items' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('items')}
          >
            Donate Items (AI)
          </button>
          <button 
            className={`btn ${activeTab === 'list' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('list')}
          >
            List of Item(s)
          </button>
          <button 
            className={`btn ${activeTab === 'request' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('request')}
          >
            DonationRequest
          </button>
        </div>

        {/* Global Messages */}
        {error && <div className="badge badge-danger" style={{ marginBottom: 15 }}>{error}</div>}
        {success && <div className="badge badge-success" style={{ marginBottom: 15 }}>{success}</div>}

        {/* --- TAB CONTENT: MONEY --- */}
        {activeTab === 'money' && (
          <div>
            <label className="muted">Choose a quick amount</label>
            <div className="btn-row" style={{ marginTop: 10 }}>
              {presetAmounts.map((amt) => (
                <button type="button" key={amt} className="btn btn-secondary" onClick={() => handlePresetAmount(amt)}>
                  {amt} Taka
                </button>
              ))}
            </div>
            
            <form onSubmit={handleMoneySubmit} className="form-grid" style={{ marginTop: 18 }}>
              <div>
                <label className="muted">Amount</label>
                <input className="input" type="number" name="amount" placeholder="Enter amount" value={form.amount} onChange={handleChange} />
              </div>
              <div>
                <label className="muted">Purpose</label>
                <select className="select" name="purpose" value={form.purpose} onChange={handleChange}>
                  <option value="General Donation">General Donation</option>
                  <option value="Food Support">Food Support</option>
                  <option value="Medical Support">Medical Support</option>
                </select>
              </div>
              <textarea className="textarea" name="message" placeholder="Message (Optional)" value={form.message} onChange={handleChange} />
              <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Submitting...' : 'Donate Now'}</button>
            </form>
          </div>
        )}

        {/* --- TAB CONTENT: DONATE ITEMS FORM --- */}
        {activeTab === 'items' && (
          <div>
            <p className="muted" style={{ marginBottom: 15 }}>Tell us what you are donating, and our AI will automatically categorize it for the community.</p>
            <form onSubmit={handleItemSubmit} className="form-grid">
              <input className="input" required placeholder="Item Title (e.g., Puppy Milk)" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} />
              <textarea className="textarea" required placeholder="Description (condition, quantity, etc.)" value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} />
              <button className="btn btn-primary" type="submit" disabled={itemLoading}>{itemLoading ? 'AI Categorizing...' : 'Submit Items'}</button>
            </form>
          </div>
        )}

        {/* --- TAB CONTENT: NEW LIST OF ITEMS --- */}
        {activeTab === 'list' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>Community Donations</h3>
              <select 
                className="select" 
                style={{ width: 'auto', minWidth: '150px' }} 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">All Categories</option>
                <option value="Food">Food</option>
                <option value="Medicine">Medicine</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="grid">
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div key={item._id} className="card" style={{ borderLeft: '4px solid #4f46e5', background: '#f8fbff', marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{item.title}</strong>
                      <span className="badge" style={{ background: '#eef2ff', color: '#4f46e5' }}>{item.category}</span>
                    </div>
                    <p style={{ fontSize: '14px', margin: '8px 0' }}>{item.description}</p>
                    <small className="muted">Donated by: {item.userId?.name || 'Anonymous'}</small>
                  </div>
                ))
              ) : (
                <p className="muted" style={{ textAlign: 'center', padding: '20px 0' }}>
                  No items found in the "{selectedCategory}" category.
                </p>
              )}
            </div>
          </div>
        )}

        {/* --- TAB CONTENT: REQUEST HELP --- */}
        {activeTab === 'request' && (
          <div>
            <form onSubmit={handleRequestSubmit} className="form-grid">
              <div>
                <label className="muted">What do you need?</label>
                <input className="input" required placeholder="e.g., Puppy Milk, Bandages" value={requestForm.itemNeeded} onChange={(e) => setRequestForm({...requestForm, itemNeeded: e.target.value})} />
              </div>
              <div>
                <label className="muted">Reason</label>
                <textarea className="textarea" required placeholder="Describe the situation..." value={requestForm.reason} onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})} />
              </div>
              <div>
                <label className="muted">Urgency</label>
                <select className="select" value={requestForm.urgency} onChange={(e) => setRequestForm({...requestForm, urgency: e.target.value})}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <button className="btn btn-primary" type="submit" disabled={requestLoading}>{requestLoading ? 'Submitting...' : 'Submit Request'}</button>
            </form>

            <h3 style={{ marginTop: 30 }}>My Active Requests</h3>
            <div className="grid">
              {myRequests.map(req => (
                <div key={req._id} className="card" style={{ borderLeft: '4px solid #f59e0b', background: '#fffbeb', marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{req.itemNeeded}</strong>
                    <span className={`badge ${req.status === 'pending' ? 'badge-secondary' : 'badge-success'}`}>
                      {req.status}
                    </span>
                  </div>
                  <p style={{ fontSize: '14px' }}>{req.reason}</p>
                  <small className="muted">Urgency: {req.urgency}</small>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}