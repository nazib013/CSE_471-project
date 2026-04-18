import React, { useState, useEffect } from 'react';
import axios from '../api/axios';

const TYPE_OPTIONS = [
  { value: 'shelter', label: '🏠 Shelter' },
  { value: 'ngo', label: '🤝 NGO' },
  { value: 'vet_clinic', label: '🏥 Vet Clinic' },
  { value: 'rescue', label: '🚨 Rescue' },
];

const EMPTY_FORM = {
  name: '', type: 'shelter', description: '',
  address: '', city: '', phone: '', email: '',
  website: '', latitude: '', longitude: '',
  services: '', hours: 'Mon-Fri: 9am - 5pm',
};

export default function AdminNGOManager() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/ngos/admin/all');
      setNgos(res.data);
    } catch (err) {
      setError('Failed to load NGOs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(true);
    setError(''); setSuccess('');
  };

  const openEdit = (ngo) => {
    setEditingId(ngo._id);
    setForm({
      ...ngo,
      latitude: String(ngo.latitude || ''),
      longitude: String(ngo.longitude || ''),
      services: Array.isArray(ngo.services) ? ngo.services.join(', ') : '',
    });
    setShowForm(true);
    setError(''); setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.name || !form.address || !form.city || !form.latitude || !form.longitude) {
      setError('Name, address, city, and coordinates are required.');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        services: form.services.split(',').map((s) => s.trim()).filter(Boolean),
      };

      if (editingId) {
        await axios.put(`/ngos/${editingId}`, payload);
        setSuccess('NGO updated successfully.');
      } else {
        await axios.post('/ngos', payload);
        setSuccess('NGO created successfully.');
      }
      setShowForm(false);
      fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save NGO.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this NGO?')) return;
    try {
      await axios.delete(`/ngos/${id}`);
      fetchAll();
    } catch (err) {
      setError('Failed to delete NGO.');
    }
  };

  const handleToggleVerify = async (id) => {
    try {
      await axios.patch(`/ngos/${id}/verify`);
      fetchAll();
    } catch (err) {
      setError('Failed to update verification.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 className="section-title" style={{ margin: 0 }}>NGO & Shelter Management</h2>
        <button className="btn btn-primary" onClick={openCreate}>+ Add NGO</button>
      </div>

      {error && <div className="badge badge-danger" style={{ marginBottom: 12 }}>{error}</div>}
      {success && <div className="badge badge-success" style={{ marginBottom: 12 }}>{success}</div>}

      {/* Form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 16px', color: '#18203a' }}>
            {editingId ? 'Edit NGO' : 'Add New NGO / Shelter'}
          </h3>
          <form onSubmit={handleSubmit} className="form-grid">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label className="muted">Name *</label>
                <input className="input" name="name" value={form.name} onChange={handleChange} placeholder="Organisation name" />
              </div>
              <div>
                <label className="muted">Type *</label>
                <select className="select" name="type" value={form.type} onChange={handleChange}>
                  {TYPE_OPTIONS.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="muted">Description</label>
                <textarea className="textarea" name="description" value={form.description} onChange={handleChange} placeholder="Brief description" />
              </div>
              <div>
                <label className="muted">Address *</label>
                <input className="input" name="address" value={form.address} onChange={handleChange} placeholder="Street address" />
              </div>
              <div>
                <label className="muted">City *</label>
                <input className="input" name="city" value={form.city} onChange={handleChange} placeholder="City" />
              </div>
              <div>
                <label className="muted">Latitude *</label>
                <input className="input" name="latitude" type="number" step="any" value={form.latitude} onChange={handleChange} placeholder="e.g. 23.8103" />
              </div>
              <div>
                <label className="muted">Longitude *</label>
                <input className="input" name="longitude" type="number" step="any" value={form.longitude} onChange={handleChange} placeholder="e.g. 90.4125" />
              </div>
              <div>
                <label className="muted">Phone</label>
                <input className="input" name="phone" value={form.phone} onChange={handleChange} placeholder="+880 ..." />
              </div>
              <div>
                <label className="muted">Email</label>
                <input className="input" name="email" value={form.email} onChange={handleChange} placeholder="contact@..." />
              </div>
              <div>
                <label className="muted">Website</label>
                <input className="input" name="website" value={form.website} onChange={handleChange} placeholder="https://..." />
              </div>
              <div>
                <label className="muted">Operating Hours</label>
                <input className="input" name="hours" value={form.hours} onChange={handleChange} placeholder="Mon-Fri: 9am - 5pm" />
              </div>
              <div style={{ gridColumn: '1/-1' }}>
                <label className="muted">Services (comma-separated)</label>
                <input className="input" name="services" value={form.services} onChange={handleChange} placeholder="Adoption, Vaccination, Emergency Care, ..." />
              </div>
            </div>

            <div className="btn-row" style={{ marginTop: 8 }}>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Saving...' : editingId ? 'Update NGO' : 'Create NGO'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="muted">Loading...</p>
      ) : ngos.length === 0 ? (
        <p className="muted">No NGOs yet. Add one to get started.</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '8px 10px', color: '#6b7280' }}>Name</th>
                <th style={{ padding: '8px 10px', color: '#6b7280' }}>Type</th>
                <th style={{ padding: '8px 10px', color: '#6b7280' }}>City</th>
                <th style={{ padding: '8px 10px', color: '#6b7280' }}>Phone</th>
                <th style={{ padding: '8px 10px', color: '#6b7280' }}>Verified</th>
                <th style={{ padding: '8px 10px', color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ngos.map((ngo) => (
                <tr key={ngo._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '8px 10px', fontWeight: 600 }}>{ngo.name}</td>
                  <td style={{ padding: '8px 10px', textTransform: 'capitalize' }}>{ngo.type.replace('_', ' ')}</td>
                  <td style={{ padding: '8px 10px' }}>{ngo.city}</td>
                  <td style={{ padding: '8px 10px' }}>{ngo.phone || '—'}</td>
                  <td style={{ padding: '8px 10px' }}>
                    <span style={{
                      background: ngo.verified ? '#16a34a' : '#9ca3af',
                      color: '#fff', borderRadius: 12, padding: '2px 8px', fontSize: 11, fontWeight: 700,
                    }}>
                      {ngo.verified ? '✓ Yes' : '✗ No'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px' }}>
                    <div className="btn-row">
                      <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => openEdit(ngo)}>Edit</button>
                      <button
                        className="btn"
                        style={{
                          padding: '4px 10px', fontSize: 12,
                          background: ngo.verified ? '#f59e0b' : '#16a34a',
                          color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                        }}
                        onClick={() => handleToggleVerify(ngo._id)}
                      >
                        {ngo.verified ? 'Unverify' : 'Verify'}
                      </button>
                      <button className="btn btn-danger" style={{ padding: '4px 10px', fontSize: 12 }} onClick={() => handleDelete(ngo._id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
