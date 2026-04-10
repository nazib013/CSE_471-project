import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [usersRes, productsRes, complaintsRes] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/products'),
        axios.get('/admin/complaints'),
      ]);
      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function promoteUser(id) {
    try {
      await axios.post(`/admin/promote/${id}`);
      alert('User promoted to admin');
      fetchAll();
    } catch (err) {
      alert('Failed to promote user');
    }
  }

  async function deleteUser(id) {
    if (!window.confirm('Are you sure you want to delete this user? This will remove their products too.')) return;
    try {
      await axios.delete(`/admin/user/${id}`);
      alert('User deleted');
      fetchAll();
    } catch (err) {
      alert('Failed to delete user');
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await axios.delete(`/admin/product/${id}`);
      alert('Product deleted');
      fetchAll();
    } catch (err) {
      alert('Failed to delete product');
    }
  }

  return (
    <div className="page">
      <h1 className="hero-title">Admin Dashboard</h1>
      <p className="muted">Manage users, products, and complaints.</p>

      <div className="kpi-grid" style={{ marginTop: 22 }}>
        <div className="kpi-card">
          <div className="kpi-label">Total Users</div>
          <div className="kpi-value">{users.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Products</div>
          <div className="kpi-value">{products.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Complaints</div>
          <div className="kpi-value">{complaints.length}</div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">Users</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <div className="btn-row">
                      {u.role !== 'admin' && (
                        <button className="btn btn-success" onClick={() => promoteUser(u._id)}>
                          Promote
                        </button>
                      )}
                      <button className="btn btn-danger" onClick={() => deleteUser(u._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">Products</h2>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Amount</th>
                <th>Seller</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>{p.name}</td>
                  <td>{p.amount} Taka</td>
                  <td>{p.sellerId?.name || 'Unknown'}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => deleteProduct(p._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">Complaints</h2>
        {complaints.length === 0 ? (
          <div className="empty-state">No complaints found.</div>
        ) : (
          <div className="list">
            {complaints.map((c) => (
              <div className="card" key={c._id} style={{ background: '#f8fbff' }}>
                <div><strong>From:</strong> {c.userId?.name || 'Unknown'}</div>
                <div><strong>Email:</strong> {c.userId?.email || 'No email'}</div>
                <div style={{ marginTop: 8 }}>
                  <strong>Message:</strong>
                  <div className="muted" style={{ marginTop: 6 }}>{c.message}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}