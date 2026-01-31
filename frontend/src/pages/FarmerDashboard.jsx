import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import MapPicker from '../components/MapPicker';
import CropDetailsModal from '../components/CropDetailsModal';

const FarmerDashboard = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ farmLocation: '', cropType: '' });

    // Crop State
    const [crops, setCrops] = useState([]);
    const [cropForm, setCropForm] = useState({
        cropName: '',
        quantity: '',
        qualityGrade: '',
        harvestDate: '',
        origin: '',
        latitude: null,
        longitude: null
    });
    const [selectedCrop, setSelectedCrop] = useState(null);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/farmer/profile');
            setProfile(res.data);
            if (res.data) {
                fetchCrops();
            }
        } catch (err) {
            console.log("No profile found or error", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCrops = async () => {
        try {
            const res = await api.get('/crops/my-crops');
            setCrops(res.data);
        } catch (err) {
            console.error("Error fetching crops", err);
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

    const handleAddCrop = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/crops', {
                ...cropForm,
                quantity: parseFloat(cropForm.quantity)
            });
            setCrops([...crops, res.data]);
            setCropForm({ cropName: '', quantity: '', qualityGrade: '', harvestDate: '', origin: '', latitude: null, longitude: null });
            alert('Crop registered and hashed on blockchain!');
        } catch (err) {
            console.error(err);
            let errorMessage = "Error adding crop";
            if (err.response) {
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else {
                    errorMessage = JSON.stringify(err.response.data);
                }
            } else if (err.request) {
                errorMessage = "No response from server. Is the backend running?";
            } else {
                errorMessage = err.message;
            }
            alert("Error: " + errorMessage);
        }
    };

    if (loading) return <div className="container">Loading...</div>;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'VERIFIED': return <span style={{ color: 'green' }} title="Verified on Blockchain">✅ Verified</span>;
            case 'TAMPERED': return <span style={{ color: 'red' }} title="Data Mismatch Detected!">❌ Tampered</span>;
            default: return <span style={{ color: 'orange' }} title="Waiting for transaction to be mined">⏳ Pending</span>;
        }
    };

    return (
        <div className="container">
            <h1 className="title">Farmer Dashboard</h1>

            {profile ? (
                <>
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

                    {profile.user?.status === 'ACTIVE' && (
                        <>
                            {/* Add New Crop Section */}
                            <div className="card" style={{ marginTop: '2rem' }}>
                                <h3>Register New Crop Batch</h3>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                    This will generate a blockchain record for traceability.
                                </p>
                                <form onSubmit={handleAddCrop} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Crop Name</label>
                                        <input
                                            className="form-input"
                                            value={cropForm.cropName}
                                            onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })}
                                            required
                                            placeholder="e.g. Wheat"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Quantity (kg)</label>
                                        <input
                                            type="number"
                                            className="form-input"
                                            value={cropForm.quantity}
                                            onChange={(e) => setCropForm({ ...cropForm, quantity: e.target.value })}
                                            required
                                            placeholder="e.g. 1000"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Quality Grade</label>
                                        <select
                                            className="form-input"
                                            value={cropForm.qualityGrade}
                                            onChange={(e) => setCropForm({ ...cropForm, qualityGrade: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Grade</option>
                                            <option value="A">Grade A (Premium)</option>
                                            <option value="B">Grade B (Standard)</option>
                                            <option value="C">Grade C (Industrial)</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Harvest Date</label>
                                        <input
                                            type="date"
                                            className="form-input"
                                            value={cropForm.harvestDate}
                                            onChange={(e) => setCropForm({ ...cropForm, harvestDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Origin (City / Location)</label>
                                        <input
                                            className="form-input"
                                            value={cropForm.origin}
                                            onChange={(e) => setCropForm({ ...cropForm, origin: e.target.value })}
                                            required
                                            placeholder="e.g. Nagpur, India"
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label className="form-label">Map Location (Optional)</label>
                                        <MapPicker
                                            latitude={cropForm.latitude}
                                            longitude={cropForm.longitude}
                                            onLocationSelect={(lat, lng) => setCropForm({ ...cropForm, latitude: lat, longitude: lng })}
                                        />
                                    </div>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <button type="submit" className="btn btn-primary">Register on Blockchain</button>
                                    </div>
                                </form>
                            </div>

                            {/* Crop List Section */}
                            <div className="card" style={{ marginTop: '2rem' }}>
                                <h3>My Crop Listings</h3>
                                <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                                <th style={{ padding: '10px' }}>Crop</th>
                                                <th style={{ padding: '10px' }}>Quantity</th>
                                                <th style={{ padding: '10px' }}>Origin</th>
                                                <th style={{ padding: '10px' }}>Blockchain Hash</th>
                                                <th style={{ padding: '10px' }}>Integrity</th>
                                                <th style={{ padding: '10px' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {crops.map((crop) => (
                                                <tr key={crop.id} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '10px' }}>{crop.cropName}</td>
                                                    <td style={{ padding: '10px' }}>{crop.quantity} kg</td>
                                                    <td style={{ padding: '10px' }}>{crop.origin}</td>
                                                    <td style={{ padding: '10px' }}>
                                                        <code style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', display: 'block', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={crop.dataHash}>
                                                            {crop.dataHash?.substring(0, 10)}...
                                                        </code>
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        {getStatusBadge(crop.verificationStatus)}
                                                    </td>
                                                    <td style={{ padding: '10px' }}>
                                                        <button
                                                            onClick={() => setSelectedCrop(crop)}
                                                            className="btn btn-outline"
                                                            style={{ padding: '4px 12px', fontSize: '0.85rem' }}
                                                        >
                                                            Details
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                            {crops.length === 0 && (
                                                <tr>
                                                    <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                                                        No crops registered yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    )}
                </>
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

            {/* Crop Details Modal */}
            {selectedCrop && (
                <CropDetailsModal
                    crop={selectedCrop}
                    onClose={() => setSelectedCrop(null)}
                />
            )}
        </div>
    );
};

export default FarmerDashboard;

