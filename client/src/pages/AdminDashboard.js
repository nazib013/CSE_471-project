import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import AdminNGOManager from '../components/AdminNGOManager';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [donations, setDonations] = useState([]);
  const [requests, setRequests] = useState([]); // New state for requests
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
        requestsRes, // Fetching requests
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
      console.error("Error fetching admin data", err);
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

  const deleteDonation = async (id) => {
    if (!window.confirm("Delete record?")) return;
    try {
      await axios.delete(`/donations/${id}`);
      fetchAll();
    } catch (err) {
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
      </div>

      <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.2)' }}>
        <AdminNGOManager />
      </div>
    </div>
  );
}