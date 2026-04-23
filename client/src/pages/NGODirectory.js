import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

const TYPE_LABELS = {
  all: 'All',
  shelter: '🏠 Shelter',
  ngo: '🤝 NGO',
  vet_clinic: '🏥 Vet Clinic',
  rescue: '🚨 Rescue',
};

const TYPE_COLORS = {
  shelter: '#5b5ce6',
  ngo: '#16a34a',
  vet_clinic: '#dc2626',
  rescue: '#f59e0b',
};

function NGOCard({ ngo, onClick }) {
  return (
    <div
      className="card"
      style={{ cursor: 'pointer', transition: 'transform 0.15s', position: 'relative' }}
      onClick={() => onClick(ngo)}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
    >
      {/* Verified badge */}
      <span
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          background: '#16a34a',
          color: '#fff',
          borderRadius: 20,
          padding: '2px 10px',
          fontSize: 11,
          fontWeight: 700,
        }}
      >
        ✓ Verified
      </span>

      {/* Type badge */}
      <span
        style={{
          display: 'inline-block',
          background: TYPE_COLORS[ngo.type] || '#5b5ce6',
          color: '#fff',
          borderRadius: 20,
          padding: '3px 12px',
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {TYPE_LABELS[ngo.type] || ngo.type}
      </span>

      <h3 style={{ margin: '0 0 6px', fontSize: 18, color: '#18203a' }}>{ngo.name}</h3>
      <p style={{ margin: '0 0 10px', color: '#4b5563', fontSize: 14 }}>
        📍 {ngo.address}, {ngo.city}
      </p>

      {ngo.description && (
        <p style={{ margin: '0 0 10px', color: '#6b7280', fontSize: 13, lineHeight: 1.5 }}>
          {ngo.description.length > 120 ? ngo.description.slice(0, 120) + '...' : ngo.description}
        </p>
      )}

      {ngo.services && ngo.services.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {ngo.services.map((s, i) => (
            <span
              key={i}
              style={{
                background: 'rgba(91,92,230,0.12)',
                color: '#5b5ce6',
                borderRadius: 12,
                padding: '2px 10px',
                fontSize: 12,
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#6b7280', marginTop: 8 }}>
        {ngo.phone && <span>📞 {ngo.phone}</span>}
        {ngo.hours && <span>🕐 {ngo.hours}</span>}
      </div>
    </div>
  );
}

function NGOModal({ ngo, onClose }) {
  if (!ngo) return null;
  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: '#fff', borderRadius: 18, padding: 28, maxWidth: 560,
          width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 14, right: 14, background: 'none',
            border: 'none', fontSize: 22, cursor: 'pointer', color: '#6b7280',
          }}
        >
          ✕
        </button>

        <span
          style={{
            display: 'inline-block',
            background: TYPE_COLORS[ngo.type] || '#5b5ce6',
            color: '#fff', borderRadius: 20, padding: '3px 12px',
            fontSize: 12, fontWeight: 600, marginBottom: 12,
          }}
        >
          {TYPE_LABELS[ngo.type] || ngo.type}
        </span>

        <h2 style={{ margin: '0 0 8px', color: '#18203a' }}>{ngo.name}</h2>
        <p style={{ margin: '0 0 16px', color: '#4b5563' }}>
          📍 {ngo.address}, {ngo.city}
        </p>

        {ngo.description && (
          <p style={{ margin: '0 0 16px', color: '#6b7280', lineHeight: 1.6 }}>
            {ngo.description}
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {ngo.phone && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>PHONE</div>
              <a href={`tel:${ngo.phone}`} style={{ color: '#5b5ce6', fontWeight: 600 }}>
                {ngo.phone}
              </a>
            </div>
          )}
          {ngo.email && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>EMAIL</div>
              <a href={`mailto:${ngo.email}`} style={{ color: '#5b5ce6', fontWeight: 600, fontSize: 13 }}>
                {ngo.email}
              </a>
            </div>
          )}
          {ngo.hours && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>HOURS</div>
              <span style={{ fontWeight: 600, fontSize: 13 }}>{ngo.hours}</span>
            </div>
          )}
          {ngo.website && (
            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '10px 14px' }}>
              <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2 }}>WEBSITE</div>
              <a
                href={ngo.website}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#5b5ce6', fontWeight: 600, fontSize: 13 }}
              >
                Visit Website ↗
              </a>
            </div>
          )}
        </div>

        {ngo.services && ngo.services.length > 0 && (
          <>
            <div style={{ fontWeight: 700, marginBottom: 8, color: '#18203a' }}>Services Offered</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {ngo.services.map((s, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(91,92,230,0.12)',
                    color: '#5b5ce6', borderRadius: 12,
                    padding: '4px 12px', fontSize: 13,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </>
        )}

        <a
          href={`https://www.google.com/maps/search/?api=1&query=${ngo.latitude},${ngo.longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-block', background: '#5b5ce6', color: '#fff',
            padding: '10px 20px', borderRadius: 10, fontWeight: 600,
            textDecoration: 'none', fontSize: 14,
          }}
        >
          📍 Open in Google Maps
        </a>
      </div>
    </div>
  );
}

export default function NGODirectory() {
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [filters, setFilters] = useState({ type: 'all', city: '', search: '' });

  const fetchNGOs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.city) params.city = filters.city;
      if (filters.search) params.search = filters.search;
      const res = await axios.get('/ngos', { params });
      setNgos(res.data);
      setError('');
    } catch (err) {
      setError('Failed to load NGOs. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNGOs();
  }, [fetchNGOs]);

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 className="hero-title">🐾 NGO & Shelter Directory</h1>
        <p className="muted" style={{ margin: 0 }}>
          Browse verified animal shelters, rescue organizations, NGOs, and veterinary clinics.
        </p>
      </div>

      {/* Filter bar */}
      <div
        className="card"
        style={{ marginBottom: 24, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}
      >
        {/* Type filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilters((f) => ({ ...f, type: key }))}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                border: 'none',
                background: filters.type === key ? '#5b5ce6' : 'rgba(91,92,230,0.12)',
                color: filters.type === key ? '#fff' : '#5b5ce6',
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, minWidth: 160 }}>
          <input
            className="input"
            placeholder="🔍 Search by name or service..."
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            style={{ margin: 0 }}
          />
        </div>

        <div style={{ minWidth: 140 }}>
          <input
            className="input"
            placeholder="📍 Filter by city..."
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            style={{ margin: 0 }}
          />
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/shelter-map')}
          style={{ whiteSpace: 'nowrap' }}
        >
          🗺️ View on Map
        </button>
      </div>

      {/* Count */}
      {!loading && (
        <p className="muted" style={{ marginBottom: 16 }}>
          {ngos.length} verified {filters.type !== 'all' ? TYPE_LABELS[filters.type] + 's' : 'organizations'} found
        </p>
      )}

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b7280' }}>Loading...</div>
      ) : error ? (
        <div className="badge badge-danger">{error}</div>
      ) : ngos.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 50 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <h3 style={{ color: '#18203a', marginBottom: 8 }}>No results found</h3>
          <p className="muted">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 20,
          }}
        >
          {ngos.map((ngo) => (
            <NGOCard key={ngo._id} ngo={ngo} onClick={setSelectedNGO} />
          ))}
        </div>
      )}

      {selectedNGO && (
        <NGOModal ngo={selectedNGO} onClose={() => setSelectedNGO(null)} />
      )}
    </div>
  );
}
