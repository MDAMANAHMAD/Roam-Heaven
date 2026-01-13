import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post(`${API_URL}/auth/login`, formData);
            login(res.data.user, res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '80px auto' }}>
            <h1 style={{ textAlign: 'center', marginBottom: '32px' }}>Welcome Back</h1>
            <form onSubmit={handleSubmit} className="card" style={{ padding: '32px', background: 'white' }}>
                {error && <div style={{ color: '#ff385c', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}
                
                <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ flex: 1, fontSize: '13px' }}
                        onClick={() => setFormData({ email: 'admin@gmail.com', password: 'admin123' })}
                    >
                        Demo Admin
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-outline" 
                        style={{ flex: 1, fontSize: '13px' }}
                        onClick={() => setFormData({ email: 'user@gmail.com', password: 'password123' })}
                    >
                        Demo User
                    </button>
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
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
                <p style={{ textAlign: 'center', marginTop: '20px', color: '#717171' }}>
                    Don't have an account? <Link to="/signup" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Sign up</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
