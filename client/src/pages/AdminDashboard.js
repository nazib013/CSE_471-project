import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import AdminNGOManager from '../components/AdminNGOManager';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [donations, setDonations] = useState([]);
<<<<<<< HEAD
  const [requests, setRequests] = useState([]); // New state for requests
=======
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
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
<<<<<<< HEAD
        requestsRes, // Fetching requests
=======
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
      ] = await Promise.all([
        axios.get('/admin/users'),
        axios.get('/admin/products'),
        axios.get('/admin/complaints'),
        axios.get('/orders'),
<<<<<<< HEAD
        axios.get('/donations/all/admin'),
        axios.get('/donations/summary/admin'),
        axios.get('/requests/all'),
=======
        axios.get('/donations'),
        axios.get('/donations/summary/admin'),
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
      ]);

      setUsers(usersRes.data || []);
      setProducts(productsRes.data || []);
      setComplaints(complaintsRes.data || []);
      setOrders(ordersRes.data || []);
      setDonations(donationsRes.data || []);
      setDonationSummary(donationSummaryRes.data || {});
<<<<<<< HEAD
      setRequests(requestsRes.data || []);
    } catch (err) {
      console.error("Error fetching admin data", err);
=======
    } catch (err) {
      console.error(err);
      alert('Failed to load admin data');
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
    }
  }

  // Action: Approve (Pending -> Active)

  const handleApproveRequest = async (id) => {
    try {
      // Changed path to /admin/requests/
      await axios.patch(`/admin/requests/${id}/approve`);
      fetchAll();
    } catch (err) {
      alert("Error approving: " + err.message);
    }
  };

  const handleFulfillRequest = async (id) => {
    try {
      // Changed path to /admin/requests/
      await axios.patch(`/admin/requests/${id}/fulfill`);
      fetchAll();
    } catch (err) {
      alert("Error completing: " + err.message);
    }
  };
  const updateDonationStatus = async (id, status) => {
    try {
      await axios.patch(`/donations/${id}/status`, { status });
      fetchAll();
    } catch (err) {
      console.error("Update failed");
    }
  };

<<<<<<< HEAD
  const deleteDonation = async (id) => {
    if (!window.confirm("Delete record?")) return;
=======
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

>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
    try {
      await axios.delete(`/donations/${id}`);
      fetchAll();
    } catch (err) {
<<<<<<< HEAD
      console.error("Delete failed");
    }
  };

  return (
    <div className="page" style={{ padding: '20px' }}>
      <h1 className="hero-title">Admin Management Dashboard</h1>

      {/* --- DONATION REQUESTS SECTION (ACTIVE & HISTORY) --- */}
      <div className="card shadow-sm" style={{ marginBottom: 30 }}>
        <h3>Donation Requests Management</h3>
        <p className="muted">Approve new requests or move completed ones to history.</p>
        
        <div className="table-responsive">
=======
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
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
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
              {requests.map(req => (
                <tr key={req._id}>
                  <td>{req.userId?.name || 'User'}</td>
                  <td>{req.itemNeeded}</td>
                  <td>
<<<<<<< HEAD
                    <span className={`badge ${req.status === 'approved' ? 'badge-primary' : req.status === 'fulfilled' ? 'badge-success' : 'badge-secondary'}`}>
                      {req.status === 'approved' ? 'Active' : req.status}
                    </span>
                  </td>
                  <td>
                    {req.status === 'pending' && (
                      <button className="btn btn-sm" onClick={() => handleApproveRequest(req._id)}>Approve</button>
                    )}
                    {req.status === 'approved' && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleFulfillRequest(req._id)}>Mark Completed</button>
                    )}
                    {req.status === 'fulfilled' && <span className="muted">In History</span>}
=======
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
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- EXISTING MONETARY DONATIONS --- */}
      <div className="card shadow-sm">
        <h3>Monetary Donations</h3>
        {donations.length === 0 ? <p>No donations found.</p> : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Donor</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {donations.map((d) => (
                  <tr key={d._id}>
                    <td>{d.donor?.name || 'N/A'}</td>
                    <td>{d.amount} TK</td>
                    <td><span className={`badge badge-${d.status}`}>{d.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {d.status === 'pending' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => updateDonationStatus(d._id, 'completed')}
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="btn btn-danger btn-sm"
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
<<<<<<< HEAD
      </div>

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <AdminNGOManager />
=======
>>>>>>> d915b9ccd4cb6385b3fbc6fee4459447cfb27c06
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
      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <AdminNGOManager />
      </div>

    </div>
  );
}