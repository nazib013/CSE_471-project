import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/auth/register', { name, email, password, role, phone, address });
      alert('Registration successful. Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="wiz-login-page">
      <div className="wiz-login-shell">
        <div className="wiz-login-left">
          <div className="wiz-login-badge">Join PetAdopt</div>
          <h1 className="wiz-login-heading">Create your pet care account</h1>
          <p className="wiz-login-copy">
            Register to adopt pets, list pets for caring homes, manage donations,
            and stay connected with the animal care community.
          </p>
          <div className="wiz-login-points">
            <div className="wiz-login-point">Adopt and support animals with ease</div>
            <div className="wiz-login-point">Manage orders, donations, and requests</div>
            <div className="wiz-login-point">Use one trusted account across the platform</div>
          </div>
        </div>

        <div className="wiz-login-card">
          <p className="wiz-login-card-top">Sign up</p>
          <h2 className="wiz-login-title">Create Account</h2>
          <p className="wiz-login-subtitle">Fill in your details to get started.</p>

          <form onSubmit={handleSubmit} className="wiz-login-form">
            <div className="wiz-field">
              <label className="wiz-label">Full Name</label>
              <input className="wiz-input" placeholder="Enter your full name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="wiz-field">
              <label className="wiz-label">Email</label>
              <input className="wiz-input" placeholder="Enter your email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="wiz-field">
              <label className="wiz-label">Password</label>
              <input className="wiz-input" placeholder="Create a password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="grid-2">
              <div className="wiz-field">
                <label className="wiz-label">Phone</label>
                <input className="wiz-input" placeholder="017..." type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="wiz-field">
                <label className="wiz-label">Role</label>
                <select className="wiz-input" value={role} onChange={(e) => setRole(e.target.value)}>
                  <option value="customer">Customer</option>
                  <option value="seller">Seller</option>
                </select>
              </div>
            </div>
            <div className="wiz-field">
              <label className="wiz-label">Address</label>
              <input className="wiz-input" placeholder="Enter your full address" type="text" value={address} onChange={(e) => setAddress(e.target.value)} required />
            </div>
            <button type="submit" className="wiz-login-btn">Register</button>
          </form>

          {error ? <p className="wiz-login-error">{error}</p> : null}
          <p className="wiz-login-footer">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </div>
    </div>
  );
}
