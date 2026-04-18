import React, { useEffect, useState } from 'react';
import axios from '../api/axios';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [donations, setDonations] = useState([]);
  const [donationSummary, setDonationSummary] = useState({
    totalDonations: 0,
    completedDonations: 0,
    pendingDonations: 0,
    failedDonations: 0,
    cancelledDonations: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      const [
        usersRes,
        productsRes,
        complaintsRes,
        ordersRes,
        donationsRes,
        donationSummaryRes,
      ] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/products'),
        axios.get('/admin/complaints'),
        axios.get('/orders'),
        axios.get('/donations'),
        axios.get('/donations/summary/admin'),
      ]);

      setUsers(usersRes.data || []);
      setProducts(productsRes.data || []);
      setComplaints(complaintsRes.data || []);
      setOrders(ordersRes.data || []);
      setDonations(donationsRes.data || []);
      setDonationSummary(donationSummaryRes.data || {});
    } catch (err) {
      console.error(err);
      alert('Failed to load admin data');
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

  async function approveOrder(id) {
    try {
      await axios.patch(`/orders/${id}/status`, {
        status: 'confirmed',
      });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Failed to approve order');
    }
  }

  async function approveProduct(id) {
    try {
      await axios.patch(`/products/${id}/approve`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Failed to approve product');
    }
  }

  async function updateDonationStatus(id, status) {
    try {
      await axios.patch(`/donations/${id}/status`, { status });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Failed to update donation status');
    }
  }

  async function deleteDonation(id) {
    if (!window.confirm('Are you sure you want to delete this donation record?')) return;

    try {
      await axios.delete(`/donations/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
      alert('Failed to delete donation record');
    }
  }

  return (
    <div className="page">
      <h1 className="hero-title">Admin Dashboard</h1>
      <p className="muted">Manage users, products, complaints, orders, and donations.</p>

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
        <div className="kpi-card">
          <div className="kpi-label">Donation Amount</div>
          <div className="kpi-value">{Number(donationSummary.totalAmount || 0).toFixed(2)} Tk</div>
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
                    {!p.isApproved && (
                      <button
                        className="btn btn-success"
                        onClick={() => approveProduct(p._id)}
                        style={{ marginRight: 10 }}
                      >
                        Approve
                      </button>
                    )}
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

      <div className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">Pending Orders</h2>

        {orders.filter((order) => order.status === 'pending').length === 0 ? (
          <div className="empty-state">No pending orders.</div>
        ) : (
          orders
            .filter((order) => order.status === 'pending')
            .map((order) => (
              <div key={order._id} className="card" style={{ marginTop: 15, padding: 15, background: '#f8fbff' }}>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Customer:</strong> {order.shipping?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {order.shipping?.email || 'N/A'}</p>
                <p><strong>Phone:</strong> {order.shipping?.phone || 'N/A'}</p>
                <p><strong>Total:</strong> {Number(order.total || 0).toFixed(2)} Tk</p>
                <p><strong>Payment Status:</strong> {order.paymentStatus || 'pending'}</p>

                <p>
                  <strong>Status:</strong>{' '}
                  <span style={{ color: order.status === 'confirmed' ? 'green' : 'orange' }}>
                    {order.status}
                  </span>
                </p>

                <p><strong>Items:</strong></p>
                <ul>
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <li key={index}>
                        {item.name || 'Item'} × {item.quantity}
                      </li>
                    ))
                  ) : (
                    <li>No items</li>
                  )}
                </ul>

                {order.status !== 'confirmed' && (
                  <button className="btn btn-success" onClick={() => approveOrder(order._id)}>
                    Approve
                  </button>
                )}
              </div>
            ))
        )}
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">Donation Summary</h2>

        <div className="kpi-grid" style={{ marginTop: 16 }}>
          <div className="kpi-card">
            <div className="kpi-label">Total Records</div>
            <div className="kpi-value">{donationSummary.totalDonations || 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Completed</div>
            <div className="kpi-value">{donationSummary.completedDonations || 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Pending</div>
            <div className="kpi-value">{donationSummary.pendingDonations || 0}</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Failed/Cancelled</div>
            <div className="kpi-value">
              {(donationSummary.failedDonations || 0) + (donationSummary.cancelledDonations || 0)}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">Donation Records</h2>

        {donations.length === 0 ? (
          <div className="empty-state">No donation records found.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Transaction</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div>{d.donor?.name || d.userId?.name || 'Unknown'}</div>
                      <div className="muted" style={{ fontSize: 12 }}>
                        {d.donor?.email || d.userId?.email || 'No email'}
                      </div>
                    </td>
                    <td>{Number(d.amount || 0).toFixed(2)} Tk</td>
                    <td>{d.purpose}</td>
                    <td>{d.status}</td>
                    <td>{d.transactionId || 'N/A'}</td>
                    <td>{new Date(d.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="btn-row" style={{ flexWrap: 'wrap' }}>
                        {d.status !== 'completed' && (
                          <button
                            className="btn btn-success"
                            onClick={() => updateDonationStatus(d._id, 'completed')}
                          >
                            Complete
                          </button>
                        )}

                        {d.status !== 'failed' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => updateDonationStatus(d._id, 'failed')}
                          >
                            Fail
                          </button>
                        )}

                        {d.status !== 'cancelled' && (
                          <button
                            className="btn btn-secondary"
                            onClick={() => updateDonationStatus(d._id, 'cancelled')}
                          >
                            Cancel
                          </button>
                        )}

                        <button
                          className="btn btn-danger"
                          onClick={() => deleteDonation(d._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}