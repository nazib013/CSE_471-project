import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

export default function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState('');
  const CATEGORY_OPTIONS = ['Cat', 'Dog', 'Bird', 'Rabbit', 'Fish', 'Reptile', 'Other'];
  const [error, setError] = useState('');
  const [complaintMsg, setComplaintMsg] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    try {
      const res = await axios.get('/products/mine');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !amount.trim()) {
      setError('Please enter valid product name and amount');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('amount', amount);
    if (category) formData.append('category', category);
    if (image) formData.append('image', image);

    try {
      await axios.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setName('');
      setDescription('');
      setAmount('');
      setImage(null);
      setCategory('');
      setError('');
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add product');
    }
  }

  const submitComplaint = async () => {
    if (!complaintMsg.trim()) {
      alert('Please enter a complaint message');
      return;
    }
    try {
      await axios.post('/complaints', { message: complaintMsg });
      alert('Complaint sent!');
      setComplaintMsg('');
    } catch (err) {
      alert('Failed to send complaint');
    }
  };

  return (
    <div className="page">
      <h1 className="hero-title">Seller Dashboard</h1>
      <p className="muted">Manage your listed pets and submit issues to admin.</p>

      <div className="grid-2" style={{ marginTop: 22 }}>
        <div className="card">
          <h2 className="section-title">Add Product</h2>
          <form onSubmit={handleSubmit} encType="multipart/form-data" className="form-grid">
            <input
              className="input"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <textarea
              className="textarea"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <input
              className="input"
              type="text"
              placeholder="Amount in Taka"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <select className="select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select Category</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

            <input className="input" type="file" onChange={(e) => setImage(e.target.files[0])} />

            <button type="submit" className="btn btn-primary">
              Add Product
            </button>
          </form>

          {error && <p className="error-text">{error}</p>}
        </div>

        <div className="card">
          <h2 className="section-title">Submit a Complaint</h2>
          <div className="form-grid">
            <input
              className="input"
              type="text"
              value={complaintMsg}
              onChange={(e) => setComplaintMsg(e.target.value)}
              placeholder="Your complaint"
            />
            <button className="btn btn-secondary" onClick={submitComplaint}>
              Submit Complaint
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">My Products</h2>

        {products.length === 0 ? (
          <div className="empty-state">No products added yet.</div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <div className="product-card" key={p._id}>
                <div className="product-image-wrap">
                  {p.imageUrl ? (
                    <img
                      src={`http://localhost:5000/${p.imageUrl}`}
                      alt={p.name}
                      className="product-image"
                    />
                  ) : (
                    <span className="muted">No image</span>
                  )}
                </div>
                <div className="product-body">
                  <h3 className="product-title">{p.name}</h3>
                  <div className="price">{p.amount} Taka</div>
                  <p className="product-meta">{p.category ? p.category : 'General'}</p>
                  <p className="product-meta">{p.description || 'No description'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}