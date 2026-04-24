import React from 'react';
import { Link } from 'react-router-dom';

const donationFeatures = [
  {
    icon: '💸',
    title: 'Donate Money',
    description: 'Support rescue, food, shelter, and medical care through a secure payment.',
    path: '/donate/money',
    button: 'Open Donation Form',
  },
  {
    icon: '📦',
    title: 'Donate Items',
    description: 'Offer food, medicine, blankets, toys, or other useful animal care items.',
    path: '/donate/items',
    button: 'Submit Item Donation',
  },
  {
    icon: '🙏',
    title: 'Request Help',
    description: 'Ask for support when an animal needs food, medicine, shelter, or urgent care.',
    path: '/donate/request-help',
    button: 'Create Help Request',
  },
  {
    icon: '📋',
    title: 'My Requests',
    description: 'View your submitted help requests and check their current status.',
    path: '/donate/my-requests',
    button: 'View Requests',
  },
];

export default function DonationPage() {
  return (
    <div className="page donate-page">
      <section className="donate-hero card">
        <div>
          <p className="wiz-login-card-top">Make an impact</p>
          <h1 className="hero-title">Support Animals</h1>
          <p className="muted">
            Choose how you want to help. Each feature now has its own dedicated page, so the Donate section feels cleaner and easier to use.
          </p>
        </div>
        <div className="donate-hero-actions">
          <Link to="/my-donations" className="btn btn-secondary">My Donations</Link>
          <Link to="/ngos" className="btn btn-primary">Find NGOs</Link>
        </div>
      </section>

      <section className="donation-feature-grid">
        {donationFeatures.map((feature) => (
          <Link to={feature.path} className="donation-feature-card card" key={feature.title}>
            <span className="donation-icon">{feature.icon}</span>
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
            <span className="donation-card-link">{feature.button} →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}