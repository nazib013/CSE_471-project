import React from 'react';
import { Link } from 'react-router-dom';

export default function DonationPaymentCancelled() {
  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 30 }}>
          Donation Payment Cancelled
        </h1>
        <p className="muted">
          Your donation payment was cancelled before completion.
        </p>

        <div className="btn-row" style={{ marginTop: 18 }}>
          <Link to="/donate" className="btn btn-primary">
            Donate Again
          </Link>
          <Link to="/my-donations" className="btn btn-secondary">
            View My Donations
          </Link>
        </div>
      </div>
    </div>
  );
}