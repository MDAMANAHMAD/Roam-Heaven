import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, Users, MapPin, ReceiptText, X, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

function MyBookings() {
    const { user, token } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const endpoint = user.role === 'admin' ? '/admin/bookings' : '/my-bookings';
                const res = await axios.get(`${API_URL}${endpoint}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookings(res.data);
            } catch (err) {
                console.error("Error fetching bookings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [user, token]);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading your trips...</div>;

    const ReceiptModal = ({ booking, onClose }) => (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                padding: '40px',
                borderRadius: '32px',
                width: '100%',
                maxWidth: '500px',
                position: 'relative',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: 'none', cursor: 'pointer', color: '#717171' }}>
                    <X size={24} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ color: '#1e8e3e', marginBottom: '16px' }}>
                        <CheckCircle size={64} style={{ margin: '0 auto' }} />
                    </div>
                    <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#222' }}>Payment Successful</h2>
                    <p style={{ color: '#717171', fontWeight: '500' }}>Roam Heaven Official Receipt</p>
                </div>

                <div style={{ borderTop: '2px dashed #eee', paddingTop: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: '#717171', fontSize: '15px' }}>Booking ID</span>
                        <span style={{ fontWeight: '600' }}>#{booking._id.slice(-8).toUpperCase()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: '#717171', fontSize: '15px' }}>Property</span>
                        <span style={{ fontWeight: '600' }}>{booking.listing?.title}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: '#717171', fontSize: '15px' }}>Dates</span>
                        <span style={{ fontWeight: '600' }}>{new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: '#717171', fontSize: '15px' }}>Guests</span>
                        <span style={{ fontWeight: '600' }}>{booking.guests} Guests</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                        <span style={{ color: '#717171', fontSize: '15px' }}>Customer</span>
                        <span style={{ fontWeight: '600' }}>{booking.user?.username || user.username}</span>
                    </div>
                    
                    <div style={{ 
                        marginTop: '24px', 
                        paddingTop: '24px', 
                        borderTop: '2px solid #222', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                    }}>
                        <span style={{ fontSize: '20px', fontWeight: '800', color: '#222' }}>Total Paid</span>
                        <span style={{ fontSize: '28px', fontWeight: '900', color: '#ff385c' }}>₹{booking.totalPrice?.toLocaleString('en-IN')}</span>
                    </div>
                </div>

                <button 
                    onClick={() => window.print()} 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: '32px', padding: '16px', borderRadius: '16px', fontSize: '16px', fontWeight: '700' }}
                >
                    Print Receipt
                </button>
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 20px' }}>
            <h1 style={{ marginBottom: '32px', fontSize: '32px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ReceiptText size={36} />
                {user.role === 'admin' ? 'Manage All Bookings' : 'My Trips & Receipts'}
            </h1>

            {bookings.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '80px 40px', borderRadius: '24px' }}>
                    <p style={{ color: '#717171', fontSize: '20px', fontWeight: '500' }}>No bookings found yet. Your future adventures will appear here!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '32px' }}>
                    {bookings.map((booking) => (
                        <div key={booking._id} className="card" style={{ 
                            display: 'flex', 
                            overflow: 'hidden', 
                            padding: '0', 
                            borderRadius: '24px',
                            border: '1px solid #efefef',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            transition: 'all 0.3s ease'
                        }}>
                            <img 
                                src={booking.listing?.image?.url} 
                                alt={booking.listing?.title} 
                                style={{ width: '340px', height: '260px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'flex-start' }}>
                                    <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#222' }}>{booking.listing?.title}</h2>
                                    <span style={{ 
                                        padding: '6px 16px', 
                                        borderRadius: '30px', 
                                        fontSize: '12px', 
                                        fontWeight: '800',
                                        background: '#e6f4ea',
                                        color: '#1e8e3e',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>Confirmed</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', color: '#484848', fontSize: '15px' }}>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={20} color="#ff385c" /> 
                                        {new Date(booking.checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(booking.checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Users size={20} color="#ff385c" /> {booking.guests} Guests
                                    </p>
                                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', gridColumn: 'span 2' }}>
                                        <MapPin size={20} color="#ff385c" /> {booking.listing?.location}, {booking.listing?.country}
                                    </p>
                                    {user.role === 'admin' && (
                                        <div style={{ 
                                            gridColumn: 'span 2', 
                                            background: '#f8f8f8', 
                                            padding: '16px', 
                                            borderRadius: '16px', 
                                            marginTop: '12px',
                                            border: '1px solid #eee'
                                        }}>
                                            <p style={{ fontWeight: '700', color: '#222', fontSize: '14px', marginBottom: '4px' }}>Booked by:</p>
                                            <p style={{ color: '#484848', fontSize: '14px' }}>{booking.user?.username} • {booking.user?.email}</p>
                                        </div>
                                    )}
                                </div>
                                <div style={{ marginTop: 'auto', paddingTop: '24px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <p style={{ fontSize: '13px', color: '#717171', fontWeight: '700', marginBottom: '4px', textTransform: 'uppercase' }}>Total Paid</p>
                                        <p style={{ fontSize: '28px', fontWeight: '900', color: '#222' }}>₹{booking.totalPrice?.toLocaleString('en-IN')}</p>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedBooking(booking)}
                                        className="btn btn-primary" 
                                        style={{ padding: '14px 28px', borderRadius: '16px', fontWeight: '700', fontSize: '15px' }}
                                    >
                                        View Receipt
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedBooking && (
                <ReceiptModal 
                    booking={selectedBooking} 
                    onClose={() => setSelectedBooking(null)} 
                />
            )}
        </div>
    );
}

export default MyBookings;
