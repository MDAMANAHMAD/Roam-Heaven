import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Share, Heart, MapPin, Trash2, Edit, Calendar, Users, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState({ name: '', rating: 5, comment: '' });

  // Booking State
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1
  });
  const [bookingStatus, setBookingStatus] = useState({ type: '', message: '' });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`${API_URL}/listings/${id}`);
        setListing(res.data);
      } catch (err) {
        console.error("Error fetching listing:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`${API_URL}/listings/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.error || "Failed to delete listing.");
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to leave a review");
      return navigate('/login');
    }
    try {
      await axios.post(`${API_URL}/listings/${id}/reviews`, { reviews: review }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const res = await axios.get(`${API_URL}/listings/${id}`);
      setListing(res.data);
      setReview({ name: user.username, rating: 5, comment: '' });
    } catch (err) {
      console.error("Error posting review:", err);
    }
  };

  const handleBooking = async () => {
    if (!user) {
      return navigate('/login');
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      setBookingStatus({ type: 'error', message: 'Please select dates' });
      return;
    }

    setBookingStatus({ type: 'loading', message: 'Processing...' });

    const dayDiff = (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24);
    const nights = dayDiff > 0 ? dayDiff : 1; // Fallback to 1 to avoid 0
    const calculatedTotal = listing.price * nights * bookingData.guests;

    try {
      const res = await axios.post(`${API_URL}/bookings`, {
        listingId: id,
        ...bookingData,
        totalPrice: calculatedTotal
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingStatus({
        type: 'success',
        message: 'Reservation successful! Check your email.',
        booking: res.data.booking
      });
    } catch (err) {
      setBookingStatus({ type: 'error', message: err.response?.data?.error || 'Booking failed' });
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>;
  if (!listing) return <div>Listing not found.</div>;

  return (
    <div className="details-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 className="details-title">{listing.title}</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user && user.role === 'admin' && (
            <>
              <Link to={`/listing/${listing._id}/edit`} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit size={16} /> Edit
              </Link>
              <button onClick={handleDelete} className="btn btn-outline" style={{ color: '#ff385c', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={16} /> Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#717171', marginBottom: '24px' }}>
        <p><MapPin size={16} /> {listing.location}, {listing.country}</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <span><Share size={16} /> Share</span>
          <span><Heart size={16} /> Save</span>
        </div>
      </div>

      <img src={listing.image.url} alt={listing.title} className="details-image" />

      <div className="details-content">
        <div>
          <div style={{ paddingBottom: '24px', borderBottom: '1px solid #eee', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700' }}>Entire place hosted by Roam Heaven Pro</h2>
            <p style={{ color: '#717171', marginTop: '4px' }}>{listing.guests || 2} guests · 1 bedroom · 1 bed · 1 bath</p>
          </div>

          <p style={{ fontSize: '16px', lineHeight: '1.6', color: '#222' }}>{listing.description}</p>

          <div style={{ padding: '32px 0', borderTop: '1px solid #eee', marginTop: '32px' }}>
            <h3 style={{ marginBottom: '20px' }}>What this place offers</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Kitchen</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Wifi</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Workspace</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>✅ Free parking</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', border: '1px solid #ddd', boxShadow: 'var(--shadow)', height: 'fit-content', position: 'sticky', top: '100px' }}>
          {bookingStatus.type === 'success' && bookingStatus.booking ? (
            // Receipt View
            <div className="receipt-container" style={{ textAlign: 'center' }}>
              <div style={{ color: '#1e8e3e', marginBottom: '16px' }}>
                <CheckCircle size={48} style={{ margin: '0 auto' }} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Booking Confirmed!</h3>
              <p style={{ color: '#717171', fontSize: '14px', marginBottom: '24px' }}>A confirmation email has been sent.</p>

              <div style={{ textAlign: 'left', background: '#f7f7f7', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Listing:</strong> {listing.title}</div>
                <div style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Check-in:</strong> {bookingStatus.booking.checkIn}</div>
                <div style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Check-out:</strong> {bookingStatus.booking.checkOut}</div>
                <div style={{ marginBottom: '8px', fontSize: '14px' }}><strong>Guests:</strong> {bookingStatus.booking.guests}</div>
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #ddd', fontSize: '16px', fontWeight: 'bold' }}>
                  Total: ₹{bookingStatus.booking.totalPrice?.toLocaleString('en-IN')}
                </div>
              </div>

              <button
                onClick={() => setBookingStatus({ type: '', message: '' })}
                className="btn btn-outline"
                style={{ width: '100%' }}
              >
                Book Another Date
              </button>
            </div>
          ) : (
            // Booking Form
            <>
              <p style={{ fontSize: '1.5rem', fontWeight: '700' }}>₹{listing.price.toLocaleString('en-IN')} <span style={{ fontWeight: '400', color: '#717171', fontSize: '1rem' }}>/ night / guest</span></p>

              <div style={{ marginTop: '24px', border: '1px solid #b0b0b0', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', borderBottom: '1px solid #b0b0b0' }}>
                  <div style={{ flex: 1, padding: '10px', borderRight: '1px solid #b0b0b0' }}>
                    <label style={{ fontSize: '10px', fontWeight: '800', display: 'block' }}>CHECK-IN</label>
                    <input
                      type="date"
                      style={{ border: 'none', width: '100%', outline: 'none', fontSize: '14px' }}
                      value={bookingData.checkIn}
                      onChange={e => setBookingData({ ...bookingData, checkIn: e.target.value })}
                    />
                  </div>
                  <div style={{ flex: 1, padding: '10px' }}>
                    <label style={{ fontSize: '10px', fontWeight: '800', display: 'block' }}>CHECKOUT</label>
                    <input
                      type="date"
                      style={{ border: 'none', width: '100%', outline: 'none', fontSize: '14px' }}
                      value={bookingData.checkOut}
                      min={bookingData.checkIn}
                      onChange={e => setBookingData({ ...bookingData, checkOut: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ padding: '10px' }}>
                  <label style={{ fontSize: '10px', fontWeight: '800', display: 'block' }}>GUESTS</label>
                  <select
                    style={{ border: 'none', width: '100%', outline: 'none', background: 'transparent' }}
                    value={bookingData.guests}
                    onChange={e => setBookingData({ ...bookingData, guests: parseInt(e.target.value) })}
                  >
                    {[1, 2, 3, 4, 5].map(v => <option key={v} value={v}>{v} guest{v > 1 ? 's' : ''}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleBooking}
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '16px' }}
                disabled={bookingStatus.type === 'loading'}
              >
                {bookingStatus.type === 'loading' ? 'Processing...' : 'Reserve Now'}
              </button>

              {bookingStatus.message && bookingStatus.type !== 'success' && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: '#fce8e6',
                  color: '#d93025',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {bookingStatus.message}
                </div>
              )}

              <p style={{ textAlign: 'center', color: '#717171', marginTop: '12px', fontSize: '12px' }}>You won't be charged yet</p>

              {(() => {
                const dayDiff = (new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24);
                const nights = dayDiff > 0 ? dayDiff : 0;
                const total = listing.price * nights * bookingData.guests;

                return nights > 0 ? (
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', color: '#222' }}>
                      <span style={{ textDecoration: 'underline' }}>₹{listing.price.toLocaleString('en-IN')} x {nights} nights x {bookingData.guests} guests</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', color: '#222' }}>
                      <span style={{ textDecoration: 'underline' }}>Wanderlust service fee</span>
                      <span>₹0</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid #eee', fontWeight: '700', fontSize: '18px' }}>
                      <span>Total</span>
                      <span>₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : null;
              })()}
            </>
          )}
        </div>
      </div>

      <div className="review-section">
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '24px' }}>Reviews</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
          {listing.reviews && listing.reviews.length > 0 ? (
            listing.reviews.map((r, i) => (
              <div key={i} className="review-card" style={{ border: '1px solid #eee', padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ff385c', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {(r.name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{r.name || 'Guest User'}</div>
                    <div style={{ fontSize: '12px', color: '#717171' }}>January 2026</div>
                  </div>
                </div>
                <div style={{ color: '#ff385c', marginBottom: '8px' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{r.comment || 'No comment provided.'}</p>
              </div>
            ))
          ) : (
            <p style={{ color: '#717171' }}>No reviews yet. Be the first!</p>
          )}
        </div>

        {user ? (
          <div style={{ marginTop: '48px', background: '#f9f9f9', padding: '32px', borderRadius: '24px', border: '1px solid #eee', maxWidth: '600px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '700' }}>Add a Review</h3>
            <form onSubmit={handleReviewSubmit} style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label className="form-label">Review Comment</label>
                <textarea
                  className="form-input"
                  value={review.comment}
                  onChange={e => setReview({ ...review, comment: e.target.value })}
                  placeholder="Share your experience..."
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Rating</label>
                <select
                  className="form-input"
                  value={review.rating}
                  onChange={e => setReview({ ...review, rating: parseInt(e.target.value) })}
                >
                  {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px' }}>Post Review</button>
            </form>
          </div>
        ) : (
          <div style={{ marginTop: '48px', textAlign: 'center', padding: '40px', background: '#f7f7f7', borderRadius: '12px' }}>
            <p style={{ marginBottom: '16px', fontWeight: '600' }}>Want to share your thoughts?</p>
            <Link to="/login" className="btn btn-primary">Login to Review</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingDetails;
