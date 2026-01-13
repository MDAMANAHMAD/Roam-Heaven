import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Save } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    price: '',
    location: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
        navigate('/login');
        return;
    }

    const fetchListing = async () => {
      try {
        const res = await axios.get(`${API_URL}/listings/${id}`);
        setFormData({
          title: res.data.title,
          description: res.data.description,
          url: res.data.image?.url || '',
          price: res.data.price,
          location: res.data.location,
          country: res.data.country
        });
      } catch (err) {
        console.error("Error fetching listing:", err);
      }
    };
    fetchListing();
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`${API_URL}/listings/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate(`/listing/${id}`);
    } catch (err) {
      console.error("Error updating listing:", err);
      alert(err.response?.data?.error || "Failed to update listing. Please try again.");
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
        <button 
            onClick={() => navigate(-1)} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', cursor: 'pointer', color: '#717171', marginBottom: '24px' }}
        >
            <ArrowLeft size={18} /> Back to listing
        </button>

      <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '32px' }}>Edit your property details</h1>
      
      <form onSubmit={handleSubmit} className="card" style={{ background: 'white', padding: '40px' }}>
        <div className="form-group">
          <label className="form-label">Title</label>
          <input className="form-input" name="title" value={formData.title} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-input" name="description" value={formData.description} onChange={handleChange} required style={{ minHeight: '150px' }} />
        </div>
        <div className="form-group">
          <label className="form-label">Image URL</label>
          <input className="form-input" name="url" value={formData.url} onChange={handleChange} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div className="form-group">
                <label className="form-label">Price per night</label>
                <input className="form-input" type="number" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-input" name="country" value={formData.country} onChange={handleChange} required />
            </div>
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" name="location" value={formData.location} onChange={handleChange} required />
        </div>
        
        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
            <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ flex: 1, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }} 
                disabled={loading}
            >
                <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
                type="button" 
                className="btn btn-outline" 
                style={{ flex: 1 }}
                onClick={() => navigate(-1)}
            >
                Cancel
            </button>
        </div>
      </form>
    </div>
  );
}

export default EditListing;
