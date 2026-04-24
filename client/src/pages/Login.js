import React, { useState } from 'react';
import axios from '../api/axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      console.log('Attempting login with:', { email, password });
      const res = await axios.post('/auth/login', { email, password });
      console.log('Login response:', res.data);
      login({ ...res.data.user, token: res.data.token });

      if (res.data.user.role === 'seller') {
        navigate('/seller');
      } else if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error message:', err.message);
      setError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="wiz-login-page">
      <div className="wiz-login-shell">
        <div className="wiz-login-left">
          <div className="wiz-login-badge">Pet Care Platform</div>
          <h1 className="wiz-login-heading">
            Welcome back to your pet care dashboard
          </h1>
          <p className="wiz-login-copy">
            Manage adoptions, track donations, and stay connected with your
            pet-loving community in one simple place.
          </p>

          <div className="wiz-login-points">
            <div className="wiz-login-point">Find loving homes for pets</div>
            <div className="wiz-login-point">Support animal care through donations</div>
            <div className="wiz-login-point">Stay connected with a trusted pet community</div>
          </div>
        </div>

        <div className="wiz-login-card">
          <p className="wiz-login-card-top">Sign in</p>
          <h2 className="wiz-login-title">Welcome Back</h2>
          <p className="wiz-login-subtitle">
            Enter your email and password to continue.
          </p>

          <form onSubmit={handleSubmit} className="wiz-login-form">
            <div className="wiz-field">
              <label className="wiz-label">Email</label>
              <input
                className="wiz-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="wiz-field">
              <label className="wiz-label">Password</label>
              <input
                className="wiz-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="wiz-login-btn">
              Login
            </button>
          </form>

          {error && <p className="wiz-login-error">{error}</p>}

          <p className="wiz-login-footer">
            Don&apos;t have an account? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}