import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Info } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function NewListing() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    price: '',
    location: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API_URL}/listings`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!user) return null;

  return (
    <div style={{ maxWidth: '700px', margin: '60px auto' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Host your property</h1>
        <p style={{ color: '#717171', marginTop: '8px' }}>Share your beautiful space with travelers from all over the world.</p>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ background: 'white', padding: '40px' }}>
        {error && (
            <div style={{ background: '#fce8e6', color: '#d93025', padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Info size={18} /> {error}
            </div>
        )}

        <div className="form-group">
          <label className="form-label">Property Title</label>
          <input 
            className="form-input" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Modern Apartment in Tokyo" 
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea 
            className="form-input" 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            required 
            placeholder="Describe what makes your space unique..." 
            style={{ minHeight: '150px' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Image URL</label>
          <input 
            className="form-input" 
            name="image" 
            value={formData.image} 
            onChange={handleChange} 
            placeholder="Paste a direct image link (Unsplash/Pexels)" 
          />
          <p style={{ fontSize: '12px', color: '#717171', marginTop: '6px' }}>High quality photos help you get more bookings.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div className="form-group">
            <label className="form-label">Price (per night in ₹)</label>
            <input 
                className="form-input" 
                type="number" 
                name="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                placeholder="1200" 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Country</label>
            <input 
                className="form-input" 
                name="country" 
                value={formData.country} 
                onChange={handleChange} 
                required 
                placeholder="e.g. India" 
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Exact Location</label>
          <input 
            className="form-input" 
            name="location" 
            value={formData.location} 
            onChange={handleChange} 
            required 
            placeholder="e.g. Jaipur, Rajasthan" 
          />
        </div>

        <div style={{ marginTop: '32px', borderTop: '1px solid #eee', paddingTop: '32px' }}>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '16px', fontSize: '18px' }} disabled={loading}>
                {loading ? 'Publishing...' : 'List your Property'}
            </button>
        </div>
      </form>
    </div>
  );
}

export default NewListing;
