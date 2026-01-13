import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import ListingDetails from './pages/ListingDetails';
import NewListing from './pages/NewListing';
import EditListing from './pages/EditListing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import MyBookings from './pages/MyBookings';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home as HomeIcon, PlusCircle, Compass, User, LogOut, ReceiptText } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="logo">
          <Compass size={32} />
          ROAM HEAVEN
        </Link>
        <div className="nav-links">
          <Link to="/" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <HomeIcon size={18} /> Home
          </Link>
          {user ? (
            <>
              <Link to="/bookings" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ReceiptText size={18} /> {user.role === 'admin' ? 'Manage Bookings' : 'My Bookings'}
              </Link>
              {user.role === 'admin' && (
                <Link to="/new" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <PlusCircle size={18} /> Add Place
                </Link>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '12px', padding: '0 12px', borderLeft: '1px solid #eee' }}>
                <span style={{ fontWeight: '600', fontSize: '14px' }}>Hi, {user.username}</span>
                <button onClick={handleLogout} className="btn-outline" style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: '#ff385c' }}>
                  <LogOut size={18} />
                </button>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" className="btn btn-outline">Log in</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/listing/:id" element={<ListingDetails />} />
              <Route path="/listing/:id/edit" element={<EditListing />} />
              <Route path="/new" element={<NewListing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/bookings" element={<MyBookings />} />
            </Routes>
          </main>
          <footer style={{ textAlign: 'center', padding: '40px 0', color: '#717171', borderTop: '1px solid #eee', marginTop: '60px' }}>
            <p>© 2026 Roam Heaven Inc. All rights reserved.</p>
          </footer>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
