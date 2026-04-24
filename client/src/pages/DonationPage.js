import React, { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function DonationPage() {
<<<<<<< HEAD
  const { user } = useAuth();
  
  // Money Donation State
  const [moneyForm, setMoneyForm] = useState({
    amount: '',
    purpose: 'General Donation',
    message: '',
    donor: {
      name: user?.name || '',
      email: user?.email || '',
      phone: '',
    }
  });
  const [loadingMoney, setLoadingMoney] = useState(false);
  const [moneyMsg, setMoneyMsg] = useState('');

  // Item Donation State
  const [itemForm, setItemForm] = useState({ title: '', description: '' });
  const [loadingItem, setLoadingItem] = useState(false);
  const [itemMsg, setItemMsg] = useState('');

  // Item Request State
  const [requestForm, setRequestForm] = useState({ itemNeeded: '', reason: '', urgency: 'Medium' });
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');

  // Lists
  const [donatedItems, setDonatedItems] = useState([]);
  const [communityRequests, setCommunityRequests] = useState([]);
  const [myRequests, setMyRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('give'); // 'give' or 'ask'

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
  try {
    const [itemsRes, commRes, myRes] = await Promise.all([
      axios.get('/donations/items'),
      axios.get('/requests/all'),
      axios.get('/requests/my'),
    ]);

    setDonatedItems(itemsRes.data || []);
    
    // CHANGE: Only show requests that the Admin has approved (Active)
    const activeOnly = (commRes.data || []).filter(r => r.status === 'approved');
    setCommunityRequests(activeOnly);
    
    setMyRequests(myRes.data || []);
  } catch (err) {
    console.error("Error loading data");
  }
}

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('donor.')) {
      const field = name.split('.')[1];
      setMoneyForm({ ...moneyForm, donor: { ...moneyForm.donor, [field]: value } });
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
        setMoneyMsg('Could not initialize payment.');
      }
=======
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
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
    } catch (err) {
      setMoneyMsg(err.response?.data?.message || 'Error creating donation.');
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
      setItemMsg('Item submitted successfully! Our AI categorized it.');
      setItemForm({ title: '', description: '' });
      fetchData();
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
      fetchData();
    } catch (err) {
      setRequestMsg('Error submitting request.');
    } finally {
      setLoadingRequest(false);
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
<<<<<<< HEAD
    <div className="page">
      <h1 className="hero-title">Support Our Furry Friends</h1>
      <p className="muted">Your contributions help us provide food, medicine, and shelter to animals in need.</p>

      {/* Tabs */}
      <div className="btn-row" style={{ marginTop: 24, marginBottom: 24, justifyContent: 'center' }}>
        <button 
          className={`btn ${activeTab === 'give' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab('give')}
          style={{ minWidth: 160 }}
        >
          🎁 Give Donation
        </button>
        <button 
          className={`btn ${activeTab === 'ask' ? 'btn-primary' : 'btn-secondary'}`} 
          onClick={() => setActiveTab('ask')}
          style={{ minWidth: 160 }}
        >
          🙏 Request Help
        </button>
      </div>

      {activeTab === 'give' ? (
        <div className="grid" style={{ gap: 30 }}>
          {/* Money Donation */}
          <div className="card">
            <h2 className="section-title">💸 Donate Money</h2>
            <p className="muted" style={{ marginBottom: 15 }}>Secure payment via SSLCommerz</p>
            <form onSubmit={submitMoney}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                      <label className="muted">Donor Name</label>
                      <input className="input" name="donor.name" value={moneyForm.donor.name} onChange={handleMoneyChange} required />
                  </div>
                  <div>
                      <label className="muted">Email</label>
                      <input className="input" type="email" name="donor.email" value={moneyForm.donor.email} onChange={handleMoneyChange} required />
                  </div>
                  <div>
                      <label className="muted">Phone</label>
                      <input className="input" name="donor.phone" value={moneyForm.donor.phone} onChange={handleMoneyChange} required placeholder="e.g. 017..." />
                  </div>
                  <div>
                      <label className="muted">Amount (BDT)</label>
                      <input className="input" type="number" name="amount" value={moneyForm.amount} onChange={handleMoneyChange} required placeholder="Min 10 BDT" />
                  </div>
              </div>

              <label className="muted" style={{ marginTop: 12 }}>Purpose</label>
              <select className="select" name="purpose" value={moneyForm.purpose} onChange={handleMoneyChange}>
                <option>General Donation</option>
                <option>Food Fund</option>
                <option>Medical Emergency</option>
                <option>Shelter Maintenance</option>
              </select>

              <label className="muted" style={{ marginTop: 12 }}>Message (Optional)</label>
              <textarea className="textarea" name="message" value={moneyForm.message} onChange={handleMoneyChange} placeholder="Write a note..."></textarea>
              
              <button className="btn btn-primary btn-block" disabled={loadingMoney} style={{ marginTop: 15 }}>
                {loadingMoney ? 'Processing...' : 'Proceed to Payment'}
              </button>
              {moneyMsg && <p className="badge badge-danger" style={{ marginTop: 10 }}>{moneyMsg}</p>}
            </form>
          </div>

          {/* Item Donation */}
          <div className="card">
            <h2 className="section-title">📦 Donate Items</h2>
            <p className="muted" style={{ marginBottom: 15 }}>Food, Medicine, or Accessories</p>
            <form onSubmit={submitItem}>
              <label className="muted">Item Title</label>
              <input className="input" value={itemForm.title} onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })} required placeholder="e.g. Cat Food, Bandages" />
              
              <label className="muted" style={{ marginTop: 12 }}>Description</label>
              <textarea className="textarea" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} required placeholder="Tell us more about the item..."></textarea>
              
              <button className="btn btn-secondary btn-block" disabled={loadingItem} style={{ marginTop: 15 }}>
                {loadingItem ? 'Categorizing...' : 'Submit Item'}
              </button>
              {itemMsg && <p className={`badge ${itemMsg.includes('Error') ? 'badge-danger' : 'badge-success'}`} style={{ marginTop: 10 }}>{itemMsg}</p>}
            </form>
          </div>
=======
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
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
        </div>
      ) : (
        <div className="grid" style={{ gap: 30 }}>
          {/* Request Form */}
          <div className="card">
            <h2 className="section-title">🙏 Request Items</h2>
            <p className="muted" style={{ marginBottom: 15 }}>Ask for help if you need items for an animal</p>
            <form onSubmit={submitRequest}>
              <label className="muted">Item Needed</label>
              <input 
                className="input" 
                value={requestForm.itemNeeded} 
                onChange={(e) => setRequestForm({ ...requestForm, itemNeeded: e.target.value })} 
                required 
                placeholder="e.g. Emergency Medicine, Kitten Milk" 
              />
              
              <div style={{ marginTop: 12 }}>
                <label className="muted">Urgency</label>
                <select 
                  className="select" 
                  value={requestForm.urgency} 
                  onChange={(e) => setRequestForm({ ...requestForm, urgency: e.target.value })}
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

<<<<<<< HEAD
              <label className="muted" style={{ marginTop: 12 }}>Reason / Case Details</label>
              <textarea 
                className="textarea" 
                value={requestForm.reason} 
                onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })} 
                required 
                placeholder="Why do you need this? Mention animal condition..."
              ></textarea>
              
              <button className="btn btn-primary btn-block" disabled={loadingRequest} style={{ marginTop: 15 }}>
                {loadingRequest ? 'Submitting...' : 'Submit Request'}
              </button>
              {requestMsg && <p className={`badge ${requestMsg.includes('Error') ? 'badge-danger' : 'badge-success'}`} style={{ marginTop: 10 }}>{requestMsg}</p>}
            </form>
          </div>

          {/* User's Own Requests */}
          <div className="card">
            <h2 className="section-title">📋 My Recent Requests</h2>
            <p className="muted" style={{ marginBottom: 15 }}>Tracking your requests for help</p>
            {myRequests.length === 0 ? (
              <p className="muted">You haven't made any requests yet.</p>
            ) : (
              <div className="list">
                {myRequests.slice(0, 5).map(req => (
                  <div key={req._id} className="card shadow-sm" style={{ background: '#f8fbff', marginBottom: 10, padding: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong>{req.itemNeeded}</strong>
                      <span className={`badge ${req.urgency === 'High' ? 'badge-danger' : req.urgency === 'Medium' ? 'badge-warning' : 'badge-secondary'}`}>
                        {req.urgency}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, marginTop: 4, color: '#4b5563' }}>{req.reason}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11 }} className="muted">
                      <span>Status: <strong style={{ color: '#5b5ce6' }}>{req.status}</strong></span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Community Section (Always visible) */}
      <div className="grid" style={{ marginTop: 50, gap: 30 }}>
        <div>
          <h2 className="section-title">📋 Current Community Needs</h2>
          <p className="muted" style={{ marginBottom: 15 }}>People asking for help</p>
          {communityRequests.length === 0 ? <p className="muted">No current needs.</p> : (
            <div className="list">
              {communityRequests.map(req => (
                <div key={req._id} className="card" style={{ background: '#fff5f5', borderLeft: '4px solid #ef4444', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{req.itemNeeded}</strong>
                    <span className="badge badge-danger">{req.urgency}</span>
                  </div>
                  <p style={{ fontSize: 14, marginTop: 5 }}>{req.reason}</p>
                  <div style={{ fontSize: 12, marginTop: 8 }} className="muted">
                    Requested by: {req.userId?.name || 'Anonymous'} | {new Date(req.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="section-title">📦 Recent Donations</h2>
          <p className="muted" style={{ marginBottom: 15 }}>Items given by the community</p>
          {donatedItems.length === 0 ? <p className="muted">No items donated yet.</p> : (
            <div className="list">
              {donatedItems.map(it => (
                <div key={it._id} className="card" style={{ background: '#f8fbff', marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <strong>{it.title}</strong>
                    <span className="badge badge-primary">{it.category}</span>
                  </div>
                  <p className="muted" style={{ marginTop: 5, fontSize: 14 }}>{it.description}</p>
                  <div style={{ fontSize: 12, marginTop: 8 }}>
                    Donor: {it.userId?.name || 'Anonymous'} | {new Date(it.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
=======
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
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
      </div>
    </div>
  );
}
