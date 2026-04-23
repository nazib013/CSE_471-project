import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CustomerProducts() {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();
  const [complaintMsg, setComplaintMsg] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const { add } = useCart();
  const [query, setQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts(selectedCategory, query);
  }, [selectedCategory, query]);

  async function fetchProducts(category, q) {
    try {
      const params = {};
      if (category) params.category = category;
      if (q && q.trim()) params.q = q.trim();
      const res = await axios.get('/products/all', { params });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  }

  async function fetchCategories() {
    try {
      const res = await axios.get('/products/categories');
      setCategories(res.data);
    } catch (e) {}
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
      <div className="split" style={{ marginBottom: 22 }}>
        <div>
          <h1 className="hero-title">Available Pets</h1>
          <p className="muted">Browse, search, and add your preferred pet to the cart.</p>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 22 }}>
        <div className="grid-2">
          <div>
            <label className="muted">Category</label>
            <select
              className="select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="muted">Search</label>
            <input
              className="input"
              type="text"
              placeholder="Search by name or description"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">No products available.</div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <div className="product-card" key={p._id}>
              <div className="product-image-wrap">
                {p.imageUrl ? (
                  <img
                    src={`${process.env.REACT_APP_API_URL}/${p.imageUrl}`}
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
                <p className="product-meta">{p.description || 'No description provided.'}</p>
                <p className="product-meta">
                  <strong>Category:</strong> {p.category || 'General'}
                </p>
                <p className="product-meta">
                  <strong>Seller:</strong> {p.sellerId?.name || 'Unknown'}
                </p>

                <div className="btn-row" style={{ marginTop: 14 }}>
                  <button
                    className="btn btn-secondary"
                    onClick={() => navigate('/product', { state: { product: p } })}
                  >
                    View Details
                  </button>

                  {p.isSold ? (
                    <span className="badge badge-danger">Sold</span>
                  ) : (
                    <button className="btn btn-primary" onClick={() => add(p, 1)}>
                      Add to Cart
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ marginTop: 24 }}>
        <h2 className="section-title">Submit a Complaint</h2>
        <div className="form-grid">
          <input
            className="input"
            type="text"
            value={complaintMsg}
            onChange={(e) => setComplaintMsg(e.target.value)}
            placeholder="Write your complaint"
          />
          <div>
            <button className="btn btn-primary" onClick={submitComplaint}>
              Submit Complaint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}