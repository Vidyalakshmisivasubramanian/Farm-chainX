import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'CONSUMER' // Default
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            await api.post('/auth/register', formData);
            alert('Registration successful! Please login.');
            navigate('/login');
        } catch (err) {
            alert('Registration failed. Email might be taken.');
        }
    };

    return (
        <div className="container" style={{ maxWidth: '400px', marginTop: '4rem' }}>
            <div className="card">
                <h2 className="title" style={{ textAlign: 'center' }}>Join FarmXChain</h2>
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input className="form-input" name="name" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input className="form-input" type="email" name="email" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input className="form-input" type="password" name="password" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label className="form-label">I am a...</label>
                        <select className="form-input" name="role" onChange={handleChange} value={formData.role}>
                            <option value="CONSUMER">Consumer</option>
                            <option value="FARMER">Farmer</option>
                            <option value="DISTRIBUTOR">Distributor</option>
                            <option value="RETAILER">Retailer</option>
                            <option value="ADMIN">Admin (Demo)</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        Create Account
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Register;
