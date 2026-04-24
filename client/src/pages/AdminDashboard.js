import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import AdminNGOManager from '../components/AdminNGOManager';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]);

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
        requestsRes,
      ] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/products'),
        axios.get('/admin/complaints'),
        axios.get('/orders'),
        axios.get('/donations/all/admin'),
        axios.get('/donations/summary/admin'),
        axios.get('/requests/all'),
      ]);

      setUsers(usersRes.data || []);
      setProducts(productsRes.data || []);
      setComplaints(complaintsRes.data || []);
      setOrders(ordersRes.data || []);
      setDonations(donationsRes.data || []);
      setDonationSummary(donationSummaryRes.data || {});
      setRequests(requestsRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      alert('Failed to load admin data');
    }
  }

  async function approveOrder(id) {
    try {
      await axios.patch(`/orders/${id}/status`, { status: 'confirmed' });
      fetchAll();
    } catch (err) {
      alert('Failed to approve order');
    }
  }

  async function approveProduct(id) {
    try {
      await axios.patch(`/products/${id}/approve`);
      fetchAll();
    } catch (err) {
      alert('Failed to approve product');
    }
  }

  async function handleApproveRequest(id) {
    try {
      await axios.patch(`/admin/requests/${id}/approve`);
      fetchAll();
    } catch (err) {
      alert('Error approving request');
    }
  }

  async function handleFulfillRequest(id) {
    try {
      await axios.patch(`/admin/requests/${id}/fulfill`);
      fetchAll();
    } catch (err) {
      alert('Error completing request');
    }
  }

  async function updateDonationStatus(id, status) {
    try {
      await axios.patch(`/donations/${id}/status`, { status });
      fetchAll();
    } catch (err) {
      alert('Failed to update donation status');
    }
  }

  async function deleteDonation(id) {
    if (!window.confirm('Are you sure you want to delete this donation record?')) return;

    try {
      await axios.delete(`/donations/${id}`);
      fetchAll();
    } catch (err) {
      alert('Failed to delete donation record');
    }
  }

  return (
    <div className="page">
      <h1 className="hero-title">Admin Dashboard</h1>
      <p className="muted">Manage users, products, complaints, orders, donations, and requests.</p>

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
        <h2 className="section-title">Donation Requests Management</h2>
        {requests.length === 0 ? (
          <div className="empty-state">No donation requests found.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Item Needed</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.userId?.name || 'User'}</td>
                    <td>{req.itemNeeded}</td>
                    <td>{req.status}</td>
                    <td>
                      {req.status === 'pending' && (
                        <button className="btn btn-success" onClick={() => handleApproveRequest(req._id)}>
                          Approve
                        </button>
                      )}
                      {req.status === 'approved' && (
                        <button className="btn btn-primary" onClick={() => handleFulfillRequest(req._id)}>
                          Mark Completed
                        </button>
                      )}
                      {req.status === 'fulfilled' && <span className="muted">In History</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: 22 }}>
        <h2 className="section-title">Products</h2>
        {products.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Seller</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.seller?.name || 'N/A'}</td>
                    <td>{p.isApproved ? 'Approved' : 'Pending'}</td>
                    <td>
                      {!p.isApproved && (
                        <button className="btn btn-success" onClick={() => approveProduct(p._id)}>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
              <div key={order._id} className="card" style={{ marginTop: 15, padding: 15, background: 'rgba(255, 255, 255, 0.52)' }}>
                <p><strong>Order ID:</strong> {order._id}</p>
                <p><strong>Customer:</strong> {order.shipping?.name || 'N/A'}</p>
                <p><strong>Email:</strong> {order.shipping?.email || 'N/A'}</p>
                <p><strong>Total:</strong> {Number(order.total || 0).toFixed(2)} Tk</p>
                <button className="btn btn-success" onClick={() => approveOrder(order._id)}>
                  Approve
                </button>
              </div>
            ))
        )}
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
                    <td>{d.donor?.name || d.userId?.name || 'Unknown'}</td>
                    <td>{Number(d.amount || 0).toFixed(2)} Tk</td>
                    <td>{d.purpose || 'N/A'}</td>
                    <td>{d.status}</td>
                    <td>{d.transactionId || 'N/A'}</td>
                    <td>{d.createdAt ? new Date(d.createdAt).toLocaleString() : 'N/A'}</td>
                    <td>
                      <div className="btn-row" style={{ flexWrap: 'wrap' }}>
                        {d.status === 'pending' && (
                          <>
                            <button className="btn btn-success" onClick={() => updateDonationStatus(d._id, 'completed')}>
                              Confirm
                            </button>
                            <button className="btn btn-secondary" onClick={() => updateDonationStatus(d._id, 'cancelled')}>
                              Disapprove
                            </button>
                          </>
                        )}
                        <button className="btn btn-danger" onClick={() => deleteDonation(d._id)}>
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

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <AdminNGOManager />
      </div>
    </div>
  );
}