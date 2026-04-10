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
    try {
      const res = await axios.post('/auth/login', { email, password });
      login({ ...res.data.user, token: res.data.token });

      if (res.data.user.role === 'seller') {
        navigate('/seller');
      } else if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h2 style={styles.title}>Login</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        {error ? <p style={styles.error}>{error}</p> : null}

        <p style={styles.text}>
          Don't have account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
  },
  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#fff',
    padding: '32px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
  },
  title: {
    margin: '0 0 20px',
    textAlign: 'center',
    color: '#1f2937',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  input: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid #d1d5db',
    fontSize: '16px',
    outline: 'none',
  },
  button: {
    padding: '12px',
    border: 'none',
    borderRadius: '10px',
    background: '#2563eb',
    color: '#fff',
    fontSize: '16px',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginTop: '12px',
  },
  text: {
    marginTop: '16px',
    textAlign: 'center',
  },
};