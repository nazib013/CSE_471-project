import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios'; 

export default function ProfilePage() {
  const { user } = useAuth();
  
  // States for the "+ Add" form (Dynamic Info)
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState(user?.additionalInfo || []);

  // --- NEW: States for Editing Base Profile Info ---
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  if (!user) {
    return (
      <div className="page-sm">
        <div className="empty-state">Not logged in.</div>
      </div>
    );
  }

  // Handle saving the dynamic info (+ Add feature)
  const handleAddInfo = async (e) => {
    e.preventDefault();
    if (!newLabel || !newValue) return;

    try {
      const newInfoItem = { label: newLabel, value: newValue };
      const updatedInfoList = [...additionalInfo, newInfoItem];

      await axios.put(`/auth/add-info/${user.id}`, { additionalInfo: updatedInfoList });
      
      setAdditionalInfo(updatedInfoList);
      setNewLabel('');
      setNewValue('');
      setIsAdding(false);
    } catch (error) {
      console.error("Failed to add info", error);
      alert("Failed to save new information. Check the console.");
    }
  };

  // --- NEW: Handle saving the edited base profile ---
  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      // Send the updated data to our new backend route
      await axios.put(`/auth/update-profile/${user.id}`, profileData);
      
      // Close the editing form (the local profileData state will keep the UI updated)
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Check console.");
    }
  };

  return (
    <div className="page-sm">
      <div className="card">
        
        {/* Header Section with Edit Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="hero-title" style={{ fontSize: 30 }}>My Profile</h1>
            <p className="muted">Your account information.</p>
          </div>
          {!isEditing && (
            <button className="btn" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          )}
        </div>

        <div className="grid" style={{ marginTop: 18 }}>
          
          {/* --- NEW: Toggle between Edit Form and View Mode --- */}
          {isEditing ? (
            <form onSubmit={handleEditProfile} className="card" style={{ background: '#fff', border: '1px solid #ddd', gridColumn: '1 / -1' }}>
              <h3 style={{ marginBottom: 12 }}>Edit Basic Information</h3>
              
              <div style={{ marginBottom: 10 }}>
                <label><strong>Name</strong></label>
                <input 
                  className="input" 
                  value={profileData.name} 
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                  required 
                />
              </div>

              <div style={{ marginBottom: 10 }}>
                <label><strong>Phone</strong></label>
                <input 
                  className="input" 
                  value={profileData.phone} 
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label><strong>Address</strong></label>
                <input 
                  className="input" 
                  value={profileData.address} 
                  onChange={(e) => setProfileData({...profileData, address: e.target.value})} 
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary">Save Changes</button>
                <button type="button" className="btn" onClick={() => setIsEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              {/* Base Info View Mode */}
              <div className="card" style={{ background: '#f8fbff' }}>
                <strong>Name</strong>
                <div style={{ marginTop: 6 }}>{profileData.name}</div>
              </div>

              <div className="card" style={{ background: '#f8fbff' }}>
                <strong>Email</strong>
                <div style={{ marginTop: 6 }}>{user.email}</div>
              </div>

              <div className="card" style={{ background: '#f8fbff' }}>
                <strong>Role</strong>
                <div style={{ marginTop: 6, textTransform: 'capitalize' }}>{user.role}</div>
              </div>

              <div className="card" style={{ background: '#f8fbff' }}>
                <strong>Phone</strong>
                <div style={{ marginTop: 6 }}>{profileData.phone || 'Not provided'}</div>
              </div>

              <div className="card" style={{ background: '#f8fbff' }}>
                <strong>Address</strong>
                <div style={{ marginTop: 6 }}>{profileData.address || 'Not provided'}</div>
              </div>
            </>
          )}

          {/* Render the dynamically added info */}
          {additionalInfo.map((info, index) => (
            <div key={index} className="card" style={{ background: '#eef2ff' }}>
              <strong>{info.label}</strong>
              <div style={{ marginTop: 6 }}>{info.value}</div>
            </div>
          ))}
        </div>

        {/* The "+ Add" Section */}
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