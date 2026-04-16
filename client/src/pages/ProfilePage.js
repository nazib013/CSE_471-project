import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios'; // Make sure this path is correct for your project

export default function ProfilePage() {
  const { user } = useAuth();
  
  // States for the "+ Add" form
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  
  // Local state to hold the dynamic info so it updates on the screen immediately
  const [additionalInfo, setAdditionalInfo] = useState(user?.additionalInfo || []);

  if (!user) {
    return (
      <div className="page-sm">
        <div className="empty-state">Not logged in.</div>
      </div>
    );
  }

  // Handle saving the new dynamic info
  const handleAddInfo = async (e) => {
    e.preventDefault();
    if (!newLabel || !newValue) return;

    try {
      const newInfoItem = { label: newLabel, value: newValue };
      const updatedInfoList = [...additionalInfo, newInfoItem];

      // Send the updated list to your backend
      // Note: We will need to make sure this route exists on your server next!
      await axios.put(`/auth/add-info/${user.id}`, { additionalInfo: updatedInfoList });
      // Update the screen and close the form
      setAdditionalInfo(updatedInfoList);
      setNewLabel('');
      setNewValue('');
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add info", error);
      alert("Failed to save new information. Check the console.");
    }
  };

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 30 }}>My Profile</h1>
        <p className="muted">Your account information.</p>

        <div className="grid" style={{ marginTop: 18 }}>
          {/* Base Info */}
          <div className="card" style={{ background: '#f8fbff' }}>
            <strong>Name</strong>
            <div style={{ marginTop: 6 }}>{user.name}</div>
          </div>

          <div className="card" style={{ background: '#f8fbff' }}>
            <strong>Email</strong>
            <div style={{ marginTop: 6 }}>{user.email}</div>
          </div>

          <div className="card" style={{ background: '#f8fbff' }}>
            <strong>Role</strong>
            <div style={{ marginTop: 6, textTransform: 'capitalize' }}>{user.role}</div>
          </div>

          {/* New fields from Task 1 */}
          <div className="card" style={{ background: '#f8fbff' }}>
            <strong>Phone</strong>
            <div style={{ marginTop: 6 }}>{user.phone || 'Not provided'}</div>
          </div>

          <div className="card" style={{ background: '#f8fbff' }}>
            <strong>Address</strong>
            <div style={{ marginTop: 6 }}>{user.address || 'Not provided'}</div>
          </div>

          {/* Render the dynamically added info */}
          {additionalInfo.map((info, index) => (
            <div key={index} className="card" style={{ background: '#eef2ff' }}>
              <strong>{info.label}</strong>
              <div style={{ marginTop: 6 }}>{info.value}</div>
            </div>
          ))}
        </div>

        {/* --- Task 2: The "+ Add" Section --- */}
        <div style={{ marginTop: 24 }}>
          {!isAdding ? (
            <button 
              className="btn btn-primary" 
              onClick={() => setIsAdding(true)}
            >
              + Add More Info
            </button>
          ) : (
            <form onSubmit={handleAddInfo} className="card" style={{ background: '#fff', border: '1px solid #ddd' }}>
              <h3 style={{ marginBottom: 12 }}>Add New Information</h3>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
                <input
                  className="input"
                  placeholder="Title (e.g., 'Hobby')"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  required
                />
                <input
                  className="input"
                  placeholder="Value (e.g., 'Reading')"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Save</button>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}