import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Signup() {
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/signup`, formData);
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Join Roam Heaven</h1>
            <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', background: 'white' }}>
                {error && <div style={{ color: '#ff385c', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
                <div className="form-group">
                    <label className="form-label">Username</label>
                    <input 
                        className="form-input" 
                        value={formData.username} 
                        onChange={e => setFormData({...formData, username: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Email</label>
                    <input 
                        className="form-input" 
                        type="email"
                        value={formData.email} 
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input 
                        className="form-input" 
                        type="password"
                        value={formData.password} 
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} disabled={loading}>
                    {loading ? 'Creating account...' : 'Sign Up'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#717171' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Log in</Link>
                </p>
            </form>
        </div>
    );
}

export default Signup;
