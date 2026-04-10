import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="page-sm">
        <div className="empty-state">Not logged in.</div>
      </div>
    );
  }

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 30 }}>My Profile</h1>
        <p className="muted">Your account information.</p>

        <div className="grid" style={{ marginTop: 18 }}>
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
        </div>
      </div>
    </div>
  );
}