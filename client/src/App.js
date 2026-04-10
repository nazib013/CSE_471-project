import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CustomerProducts from './pages/CustomerProducts';  // new import
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ProductDetail from './pages/ProductDetail';
import MyOrders from './pages/MyOrders';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <AuthProvider>
  <CartProvider>
  <Navbar />
  <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/seller"
          element={
            <PrivateRoute roles={['seller']}>
              <SellerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        {/* Customer browsing routes */}
        <Route path="/products" element={<CustomerProducts />} />
  <Route path="/product" element={<ProductDetail />} />
  <Route path="/cart" element={<CartPage />} />
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/track/:id" element={<TrackOrderPage />} />
        <Route
          path="/profile"
          element={
            <PrivateRoute roles={['customer','seller','admin']}>
              <ProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <PrivateRoute roles={['customer','seller','admin']}>
              <MyOrders />
            </PrivateRoute>
          }
        />
        
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
