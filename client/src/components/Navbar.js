import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  const cartCount = items.reduce((sum, it) => sum + (it.quantity || 1), 0);
  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/products" className="brand">
          PetAdopt
        </Link>

        <div className="nav-links">
          <Link to="/products" className={`nav-link ${isActive('/products') ? 'active' : ''}`}>
            Products
          </Link>

          <Link to="/orders" className={`nav-link ${isActive('/orders') ? 'active' : ''}`}>
            My Orders
          </Link>

          <Link to="/donate" className={`nav-link ${isActive('/donate') ? 'active' : ''}`}>
            Donate
          </Link>

          <Link to="/ngos" className={`nav-link ${isActive('/ngos') || isActive('/shelter-map') ? 'active' : ''}`}>
            Shelters & NGOs
          </Link>

          <Link to="/my-donations" className={`nav-link ${isActive('/my-donations') ? 'active' : ''}`}>
            My Donations
          </Link>

          <Link to="/cart" className={`nav-link ${isActive('/cart') ? 'active' : ''}`}>
            Cart{cartCount ? ` (${cartCount})` : ''}
          </Link>

          {user?.role === 'seller' && (
            <Link to="/seller" className={`nav-link ${isActive('/seller') ? 'active' : ''}`}>
              Seller
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
              Admin
            </Link>
          )}
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                Profile
              </Link>
              <span className="info-pill">Hi, {user.name}</span>
              <button
                className="btn btn-danger"
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`nav-link ${isActive('/login') ? 'active' : ''}`}>
                Login
              </Link>
              <Link to="/register" className={`nav-link ${isActive('/register') ? 'active' : ''}`}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}