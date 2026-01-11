import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Sprout } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <nav className="nav">
            <Link to="/" className="nav-brand">
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sprout color="var(--color-primary)" />
                    FarmXChain
                </span>
            </Link>
            <div className="nav-links">
                {!token ? (
                    <>
                        <Link to="/login" className="nav-link">Login</Link>
                        <Link to="/register" className="nav-link">Register</Link>
                    </>
                ) : (
                    <>
                        {role === 'FARMER' && <Link to="/farmer-dashboard" className="nav-link">My Farm</Link>}
                        {role === 'ADMIN' && <Link to="/admin-dashboard" className="nav-link">Admin Panel</Link>}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                Hi, {name}
                            </span>
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}>
                                <LogOut size={16} />
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
