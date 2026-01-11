import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const AdminDashboard = () => {
    const [farmers, setFarmers] = useState([]);

    const fetchPending = async () => {
        try {
            const res = await api.get('/admin/farmers/pending');
            setFarmers(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchPending();
    }, []);

    const handleVerify = async (id, approved) => {
        try {
            await api.post(`/admin/farmers/${id}/verify?approved=${approved}`);
            // Remove from list
            setFarmers(farmers.filter(f => f.id !== id));
        } catch (err) {
            alert('Action failed');
        }
    };

    return (
        <div className="container">
            <h1 className="title">Admin Dashboard</h1>

            <div className="card">
                <h3>Pending Verifications</h3>
                {farmers.length === 0 ? (
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>No pending validations.</p>
                ) : (
                    <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th>Farmer Name</th>
                                    <th>Email</th>
                                    <th>Location</th>
                                    <th>Crop</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {farmers.map(farmer => (
                                    <tr key={farmer.id}>
                                        <td>{farmer.user.name}</td>
                                        <td>{farmer.user.email}</td>
                                        <td>{farmer.farmLocation}</td>
                                        <td>{farmer.cropType}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                    onClick={() => handleVerify(farmer.id, true)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem', color: '#dc2626', borderColor: '#dc2626' }}
                                                    onClick={() => handleVerify(farmer.id, false)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
