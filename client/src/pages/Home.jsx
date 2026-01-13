import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { MapPin, Star, Filter, Search, Heart } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Home() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const res = await axios.get(`${API_URL}/listings`);
        setListings(res.data);
      } catch (err) {
        console.error("Error fetching listings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #ff385c',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
        boxShadow: '0 4px 10px rgba(255, 56, 92, 0.2)'
      }}></div>
      <h2 style={{ marginTop: '24px', color: '#222', fontSize: '20px', fontWeight: '700' }}>Roam Heaven</h2>
      <p style={{ marginTop: '8px', color: '#717171', fontWeight: '500' }}>Exploring unique properties...</p>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="home">
      {/* Hero Section */}
      <header style={{
        padding: '80px 0 40px',
        textAlign: 'center',
        background: 'linear-gradient(rgba(255,255,255,0), rgba(255,255,255,1)), url("https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        marginBottom: '40px',
        borderRadius: '24px',
        color: '#222'
      }}>
        <h1 style={{ fontSize: '3.5rem', fontWeight: '850', letterSpacing: '-1px' }}>Find your next home</h1>
        <p style={{ color: '#484848', fontSize: '1.25rem', marginTop: '12px', fontWeight: '500' }}>Explore unique places to stay around the world.</p>

        {/* Search Bar - Aesthetic Only */}
        <div style={{
          maxWidth: '800px',
          margin: '40px auto 0',
          background: 'white',
          borderRadius: '40px',
          padding: '8px 8px 8px 24px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          border: '1px solid #ddd'
        }}>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', display: 'block' }}>Location</span>
            <span style={{ fontSize: '14px', color: '#717171' }}>Where are you going?</span>
          </div>
          <div style={{ flex: 1, textAlign: 'left', borderLeft: '1px solid #ddd', paddingLeft: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', display: 'block' }}>Date</span>
            <span style={{ fontSize: '14px', color: '#717171' }}>Add dates</span>
          </div>
          <div style={{ flex: 1, textAlign: 'left', borderLeft: '1px solid #ddd', paddingLeft: '24px' }}>
            <span style={{ fontSize: '12px', fontWeight: '800', display: 'block' }}>Travelers</span>
            <span style={{ fontSize: '14px', color: '#717171' }}>Add guests</span>
          </div>
          <button style={{
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '12px',
            cursor: 'pointer'
          }}>
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Filter Section - Aesthetic Only */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px',
        overflowX: 'auto',
        padding: '20px 0',
        marginBottom: '20px',
        borderBottom: '1px solid #eee'
      }}>
        {['Trending', 'Cabins', 'Beachfront', 'Amazing pools', 'Islands', 'Castles', 'Skiing', 'Desert'].map((cat, i) => (
          <div key={cat} style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            minWidth: '70px',
            cursor: 'pointer',
            opacity: i === 0 ? 1 : 0.6,
            borderBottom: i === 0 ? '2px solid black' : 'none',
            paddingBottom: '10px'
          }}>
            <span style={{ fontSize: '13px', fontWeight: '600' }}>{cat}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', fontSize: '14px' }}>
            <Filter size={16} /> Filters
          </button>
        </div>
      </div>

      {/* Listings Grid */}
      <div className="listing-grid">
        {listings.map((l) => (
          <Link to={`/listing/${l._id}`} key={l._id} className="card">
            <div style={{ position: 'relative' }}>
              <img src={l.image?.url} alt={l.title} className="card-image" />
              <div style={{ position: 'absolute', top: '12px', right: '12px', color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                <Heart size={24} />
              </div>
            </div>
            <div className="card-info">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h3 className="card-title" style={{ fontSize: '15px' }}>{l.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '14px' }}>
                  <Star size={14} fill="currentColor" />
                  <span>5.0</span>
                </div>
              </div>
              <p className="card-location" style={{ fontSize: '14px', marginTop: '2px' }}>{l.location}, {l.country}</p>
              <p style={{ fontSize: '14px', color: '#717171', marginTop: '2px' }}>Jan 12 - 17</p>
              <p className="card-price" style={{ marginTop: '8px' }}>
                <span style={{ fontWeight: '800' }}>₹{l.price.toLocaleString('en-IN')}</span>
                <span style={{ fontWeight: '400', color: '#222' }}> night</span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Home;
