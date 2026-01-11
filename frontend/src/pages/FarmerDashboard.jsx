import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const FarmerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ farmLocation: '', cropType: '' });

    const fetchProfile = async () => {
        try {
            const res = await api.get('/farmer/profile');
            setProfile(res.data);
        } catch (err) {
            console.log("No profile found or error", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleOnboard = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/farmer/onboard', formData);
            setProfile(res.data);
        } catch (err) {
            alert('Error creating profile');
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    return (
        <div className="container">
            <h1 className="title">Farmer Dashboard</h1>

            {profile ? (
                <div className="card">
                    <h3>My Farm Profile</h3>
                    <div style={{ marginTop: '1rem' }}>
                        <p><strong>Location:</strong> {profile.farmLocation}</p>
                        <p><strong>Main Crop:</strong> {profile.cropType}</p>
                        <p><strong>Status:</strong>
                            <span className={`status-badge ${profile.user?.status === 'ACTIVE' ? 'status-active' : 'status-pending'}`}
                                style={{ marginLeft: '10px' }}>
                                {profile.user?.status || 'PENDING'}
                            </span>
                        </p>

                        {profile.user?.status === 'PENDING' && (
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#fef9c3', borderRadius: '4px' }}>
                                Your account is pending verification by an Admin. You will have full access once approved.
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card">
                    <h3>Complete Your Profile</h3>
                    <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                        Please provide your farm details to get verified.
                    </p>
                    <form onSubmit={handleOnboard}>
                        <div className="form-group">
                            <label className="form-label">Farm Location</label>
                            <input
                                className="form-input"
                                value={formData.farmLocation}
                                onChange={(e) => setFormData({ ...formData, farmLocation: e.target.value })}
                                required
                                placeholder="e.g. Nagpur, Maharashtra"
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Primary Crop Type</label>
                            <input
                                className="form-input"
                                value={formData.cropType}
                                onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
                                required
                                placeholder="e.g. Cotton, Oranges"
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Submit for Verification</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default FarmerDashboard;
