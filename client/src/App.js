import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import CustomerProducts from './pages/CustomerProducts';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ProductDetail from './pages/ProductDetail';
import MyOrders from './pages/MyOrders';
import ProfilePage from './pages/ProfilePage';
import DonationPage from './pages/DonationPage';
import MyDonations from './pages/MyDonations';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar'; 
import Tips from './pages/Tips';
import TipDetail from "./pages/TipDetail";
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import PaymentCancelled from './pages/PaymentCancelled';
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

          <Route path="/products" element={<CustomerProducts />} />
          <Route path="/product" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track/:id" element={<TrackOrderPage />} />
          <Route path="/payment-success/:orderId" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/payment-cancelled" element={<PaymentCancelled />} />
          <Route path="/tips/:id" element={<TipDetail />} />

          <Route
            path="/profile"
            element={
              <PrivateRoute roles={['customer', 'seller', 'admin']}>
                <ProfilePage />
              </PrivateRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PrivateRoute roles={['customer', 'seller', 'admin']}>
                <MyOrders />
              </PrivateRoute>
            }
          />

          <Route
            path="/donate"
            element={
              <PrivateRoute roles={['customer', 'seller', 'admin']}>
                <DonationPage />
              </PrivateRoute>
            }
          />

          <Route
            path="/my-donations"
            element={
              <PrivateRoute roles={['customer', 'seller', 'admin']}>
                <MyDonations />
              </PrivateRoute>
            }
          />
          <Route
            path="/tips"
            element={
              <PrivateRoute roles={['customer', 'seller', 'admin']}>
                <Tips />
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