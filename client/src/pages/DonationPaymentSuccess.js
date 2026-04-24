import React, { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Link, useParams } from 'react-router-dom';

export default function DonationPaymentSuccess() {
  const { donationId } = useParams();
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        const res = await axios.get(`/donations/${donationId}`);
        setDonation(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not load donation details.');
      }
    };

    if (donationId) {
      fetchDonation();
    }
  }, [donationId]);

  return (
    <div className="page-sm">
      <div className="card">
        <h1 className="hero-title" style={{ fontSize: 30 }}>
          Donation Payment Successful
        </h1>

        <p className="muted">Thank you. Your donation has been confirmed successfully.</p>

        {error && (
          <div className="badge badge-danger" style={{ marginTop: 12 }}>
            {error}
          </div>
        )}

        {donation && (
          <div className="card" style={{ marginTop: 18, background: '#f8fbff' }}>
            <div><strong>Donation ID:</strong> {donation._id}</div>
            <div><strong>Amount:</strong> {Number(donation.amount).toFixed(2)} Taka</div>
            <div><strong>Purpose:</strong> {donation.purpose}</div>
            <div><strong>Status:</strong> {donation.status}</div>
            <div><strong>Transaction ID:</strong> {donation.transactionId || 'N/A'}</div>
          </div>
        )}

        <div className="btn-row" style={{ marginTop: 18 }}>
          <Link to="/my-donations" className="btn btn-primary">
            View My Donations
          </Link>
          <Link to="/donate" className="btn btn-secondary">
            Donate Again
          </Link>
        </div>
      </div>
    </div>
  );
}