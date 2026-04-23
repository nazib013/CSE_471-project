import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../api/axios';
import { useNavigate } from 'react-router-dom';

/* ──────────────────────────────────────────────────────────────────────────
   Leaflet is loaded from CDN so no npm install is needed.
   We inject the CSS/JS once and use it via window.L.
────────────────────────────────────────────────────────────────────────── */

const TYPE_LABELS = {
  all: 'All',
  shelter: 'Shelter',
  ngo: 'NGO',
  vet_clinic: 'Vet Clinic',
  rescue: 'Rescue',
};

const TYPE_COLORS = {
  shelter: '#5b5ce6',
  ngo: '#16a34a',
  vet_clinic: '#dc2626',
  rescue: '#f59e0b',
};

const TYPE_ICONS = {
  shelter: '🏠',
  ngo: '🤝',
  vet_clinic: '🏥',
  rescue: '🚨',
};

function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }

    // Load CSS
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Load JS
    if (!document.getElementById('leaflet-js')) {
      const script = document.createElement('script');
      script.id = 'leaflet-js';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => resolve(window.L);
      document.head.appendChild(script);
    } else {
      const check = setInterval(() => {
        if (window.L) { clearInterval(check); resolve(window.L); }
      }, 50);
    }
  });
}

function createMarkerIcon(L, type) {
  const color = TYPE_COLORS[type] || '#5b5ce6';
  const emoji = TYPE_ICONS[type] || '📍';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <ellipse cx="18" cy="42" rx="7" ry="3" fill="rgba(0,0,0,0.2)"/>
      <path d="M18 2C10.27 2 4 8.27 4 16c0 10.5 14 26 14 26S32 26.5 32 16C32 8.27 25.73 2 18 2z"
            fill="${color}" stroke="white" stroke-width="2"/>
      <text x="18" y="20" text-anchor="middle" font-size="13" dy=".3em">${emoji}</text>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [36, 44],
    iconAnchor: [18, 44],
    popupAnchor: [0, -44],
  });
}

function createUserIcon(L) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="#3b82f6" stroke="white" stroke-width="2.5"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>`;
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -16],
  });
}

export default function ShelterMap() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState('');
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [radius, setRadius] = useState(50);
  const [mapReady, setMapReady] = useState(false);

  // Default center: Dhaka, Bangladesh
  const DEFAULT_CENTER = [23.8103, 90.4125];

  const fetchNGOs = useCallback(async (lat, lng, rad, type) => {
    try {
      setLoading(true);
      const params = { radius: rad };
      if (type !== 'all') params.type = type;
      if (lat && lng) {
        params.lat = lat;
        params.lng = lng;
      }
      const res = await axios.get('/ngos/nearby', { params });
      setNgos(res.data);
      setError('');
    } catch (err) {
      // fallback: fetch all
      try {
        const params2 = {};
        if (type !== 'all') params2.type = type;
        const res2 = await axios.get('/ngos', { params: params2 });
        setNgos(res2.data);
        setError('');
      } catch {
        setError('Failed to load locations.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    let mounted = true;
    loadLeaflet().then((L) => {
      if (!mounted || !mapRef.current || leafletMapRef.current) return;

      const map = L.map(mapRef.current, { zoomControl: true }).setView(DEFAULT_CENTER, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
      setMapReady(true);
    });

    return () => {
      mounted = false;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  // Fetch NGOs on mount
  useEffect(() => {
    fetchNGOs(null, null, radius, typeFilter);
  }, [fetchNGOs, radius, typeFilter]);

  // Render markers when map is ready and NGOs load
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;
    const L = window.L;
    const map = leafletMapRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add NGO markers
    ngos.forEach((ngo) => {
      if (!ngo.latitude || !ngo.longitude) return;
      const icon = createMarkerIcon(L, ngo.type);
      const marker = L.marker([ngo.latitude, ngo.longitude], { icon })
        .addTo(map)
        .bindPopup(
          `<div style="min-width:200px">
            <b style="font-size:14px">${ngo.name}</b><br/>
            <span style="color:#6b7280;font-size:12px">${TYPE_ICONS[ngo.type] || ''} ${TYPE_LABELS[ngo.type] || ngo.type}</span><br/>
            <span style="font-size:12px">📍 ${ngo.address}, ${ngo.city}</span><br/>
            ${ngo.phone ? `<span style="font-size:12px">📞 ${ngo.phone}</span><br/>` : ''}
            ${ngo.distance !== undefined ? `<span style="font-size:12px;color:#5b5ce6">📏 ${ngo.distance} km away</span><br/>` : ''}
            ${ngo.hours ? `<span style="font-size:12px">🕐 ${ngo.hours}</span>` : ''}
          </div>`,
          { maxWidth: 260 }
        );

      marker.on('click', () => setSelectedNGO(ngo));
      markersRef.current.push(marker);
    });

    // Fit bounds if we have markers
    if (ngos.length > 0) {
      const coords = ngos
        .filter((n) => n.latitude && n.longitude)
        .map((n) => [n.latitude, n.longitude]);
      if (coords.length > 0) {
        try { map.fitBounds(coords, { padding: [40, 40], maxZoom: 14 }); } catch (_) {}
      }
    }
  }, [ngos, mapReady]);

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setUserLocation({ lat, lng });
        setLocating(false);

        if (leafletMapRef.current) {
          const L = window.L;
          if (userMarkerRef.current) userMarkerRef.current.remove();
          userMarkerRef.current = L.marker([lat, lng], { icon: createUserIcon(L) })
            .addTo(leafletMapRef.current)
            .bindPopup('<b>Your Location</b>')
            .openPopup();
          leafletMapRef.current.setView([lat, lng], 13);
        }

        fetchNGOs(lat, lng, radius, typeFilter);
      },
      (err) => {
        setLocating(false);
        setError('Could not get your location. Please allow location access.');
      }
    );
  };

  const filteredNGOs = typeFilter === 'all'
    ? ngos
    : ngos.filter((n) => n.type === typeFilter);

  return (
    <div className="page" style={{ padding: '28px 20px' }}>
      <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="hero-title">🗺️ Shelter & Clinic Map</h1>
          <p className="muted" style={{ margin: 0 }}>
            Find nearby animal shelters, NGOs, rescue centres, and vet clinics.
          </p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/ngos')}>
          ← Back to Directory
        </button>
      </div>

      {/* Controls */}
      <div className="card" style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
        {/* Type filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTypeFilter(key)}
              style={{
                padding: '5px 12px', borderRadius: 20, border: 'none',
                background: typeFilter === key ? '#5b5ce6' : 'rgba(91,92,230,0.12)',
                color: typeFilter === key ? '#fff' : '#5b5ce6',
                fontWeight: 600, fontSize: 12, cursor: 'pointer',
              }}
            >
              {TYPE_ICONS[key] || ''} {label}
            </button>
          ))}
        </div>

        {/* Radius */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label className="muted" style={{ fontSize: 13, whiteSpace: 'nowrap' }}>Radius:</label>
          <select
            className="select"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ margin: 0, width: 'auto' }}
          >
            <option value={10}>10 km</option>
            <option value={25}>25 km</option>
            <option value={50}>50 km</option>
            <option value={100}>100 km</option>
          </select>
        </div>

        <button
          className="btn btn-primary"
          onClick={handleLocateMe}
          disabled={locating}
          style={{ whiteSpace: 'nowrap' }}
        >
          {locating ? '📡 Locating...' : '📍 Use My Location'}
        </button>
      </div>

      {error && (
        <div className="badge badge-danger" style={{ marginBottom: 12 }}>{error}</div>
      )}

      {/* Main layout: map + sidebar */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16, minHeight: 520 }}>
        {/* Map container */}
        <div
          style={{
            borderRadius: 18, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.22)',
            boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
            minHeight: 520,
            position: 'relative',
          }}
        >
          {loading && (
            <div
              style={{
                position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.7)',
                zIndex: 500, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 16, color: '#5b5ce6',
              }}
            >
              Loading map data...
            </div>
          )}
          <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 520 }} />
        </div>

        {/* Sidebar list */}
        <div
          style={{
            background: 'rgba(255,255,255,0.18)', borderRadius: 18,
            border: '1px solid rgba(255,255,255,0.22)', backdropFilter: 'blur(10px)',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
          }}
        >
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
            <h3 style={{ margin: 0, fontSize: 15, color: '#18203a' }}>
              {filteredNGOs.length} locations found
            </h3>
            {userLocation && (
              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6b7280' }}>
                Showing within {radius} km of your location
              </p>
            )}
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {filteredNGOs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <p style={{ margin: 0 }}>No locations found. Try expanding the radius.</p>
              </div>
            ) : (
              filteredNGOs.map((ngo) => (
                <div
                  key={ngo._id}
                  onClick={() => {
                    setSelectedNGO(ngo);
                    if (leafletMapRef.current && ngo.latitude && ngo.longitude) {
                      leafletMapRef.current.setView([ngo.latitude, ngo.longitude], 15);
                      // Open popup for this marker
                      markersRef.current.forEach((m) => {
                        const ll = m.getLatLng();
                        if (
                          Math.abs(ll.lat - ngo.latitude) < 0.0001 &&
                          Math.abs(ll.lng - ngo.longitude) < 0.0001
                        ) {
                          m.openPopup();
                        }
                      });
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer',
                    background: selectedNGO?._id === ngo._id
                      ? 'rgba(91,92,230,0.12)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedNGO?._id !== ngo._id)
                      e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    if (selectedNGO?._id !== ngo._id)
                      e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 18 }}>{TYPE_ICONS[ngo.type] || '📍'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#18203a' }}>{ngo.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280' }}>
                        {ngo.city}
                        {ngo.distance !== undefined && (
                          <span style={{ color: '#5b5ce6', marginLeft: 6 }}>
                            {ngo.distance} km
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {ngo.phone && (
                    <div style={{ fontSize: 12, color: '#9ca3af' }}>📞 {ngo.phone}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* NGO detail panel */}
      {selectedNGO && (
        <div
          className="card"
          style={{ marginTop: 16, position: 'relative' }}
        >
          <button
            onClick={() => setSelectedNGO(null)}
            style={{
              position: 'absolute', top: 14, right: 14, background: 'none',
              border: 'none', fontSize: 20, cursor: 'pointer', color: '#6b7280',
            }}
          >
            ✕
          </button>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <span
                style={{
                  display: 'inline-block',
                  background: TYPE_COLORS[selectedNGO.type] || '#5b5ce6',
                  color: '#fff', borderRadius: 20, padding: '2px 10px',
                  fontSize: 12, fontWeight: 600, marginBottom: 8,
                }}
              >
                {TYPE_LABELS[selectedNGO.type]}
              </span>
              <h2 style={{ margin: '0 0 6px', fontSize: 20, color: '#18203a' }}>{selectedNGO.name}</h2>
              <p style={{ margin: '0 0 6px', color: '#4b5563', fontSize: 14 }}>
                📍 {selectedNGO.address}, {selectedNGO.city}
              </p>
              {selectedNGO.description && (
                <p style={{ margin: '0 0 10px', color: '#6b7280', fontSize: 13 }}>
                  {selectedNGO.description}
                </p>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 180 }}>
              {selectedNGO.phone && (
                <a href={`tel:${selectedNGO.phone}`} style={{ color: '#5b5ce6', fontSize: 14 }}>
                  📞 {selectedNGO.phone}
                </a>
              )}
              {selectedNGO.email && (
                <a href={`mailto:${selectedNGO.email}`} style={{ color: '#5b5ce6', fontSize: 14 }}>
                  ✉️ {selectedNGO.email}
                </a>
              )}
              {selectedNGO.hours && (
                <span style={{ fontSize: 13, color: '#6b7280' }}>🕐 {selectedNGO.hours}</span>
              )}
              {selectedNGO.distance !== undefined && (
                <span style={{ fontSize: 13, color: '#5b5ce6', fontWeight: 700 }}>
                  📏 {selectedNGO.distance} km from you
                </span>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${selectedNGO.latitude},${selectedNGO.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#5b5ce6', color: '#fff', padding: '8px 16px',
                  borderRadius: 10, textDecoration: 'none', fontSize: 13, fontWeight: 600,
                  textAlign: 'center', marginTop: 4,
                }}
              >
                Open in Google Maps ↗
              </a>
            </div>
          </div>
          {selectedNGO.services && selectedNGO.services.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedNGO.services.map((s, i) => (
                <span
                  key={i}
                  style={{
                    background: 'rgba(91,92,230,0.12)', color: '#5b5ce6',
                    borderRadius: 12, padding: '3px 10px', fontSize: 12,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
