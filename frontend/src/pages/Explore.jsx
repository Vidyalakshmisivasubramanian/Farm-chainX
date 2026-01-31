import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Explore = () => {
    const [ledger, setLedger] = useState([]);
    const [loading, setLoading] = useState(true);
    const [verifyResult, setVerifyResult] = useState(null);

    useEffect(() => {
        fetchLedger();
    }, []);

    const fetchLedger = async () => {
        try {
            const res = await api.get('/blockchain/explore');
            setLedger(res.data);
        } catch (err) {
            console.error("Error fetching ledger", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (cropId) => {
        try {
            await api.post(`/orders/buy/${cropId}`);
            alert("Order placed successfully! Wait for farmer to accept.");
        } catch (err) {
            const errorMsg = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : err.message;
            alert("Order Failed: " + errorMsg);
        }
    };

    const handleVerify = async (cropId) => {
        setVerifyResult(null);
        try {
            const res = await api.get(`/blockchain/verify/${cropId}`);
            setVerifyResult(res.data);

            // Update the local ledger status
            setLedger(ledger.map(item =>
                item.id === cropId ? { ...item, status: res.data.status } : item
            ));
        } catch (err) {
            alert("Verification Failed: " + (err.response?.data || err.message));
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'VERIFIED': return <span style={{ color: '#22c55e', fontWeight: 'bold' }}>✅ Valid</span>;
            case 'TAMPERED': return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>❌ Tampered</span>;
            default: return <span style={{ color: '#eab308', fontWeight: 'bold' }}>⏳ Pending</span>;
        }
    };

    return (
        <div className="container" style={{ marginTop: '3rem' }}>
            <h1 className="title">Public Crop Explorer</h1>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>
                Verify the integrity of crops registered on the FarmXChain blockchain.
            </p>

            {loading ? <p>Loading Ledger...</p> : (
                <div className="card">
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee' }}>
                                    <th style={{ padding: '12px' }}>Crop</th>
                                    <th style={{ padding: '12px' }}>Origin</th>
                                    <th style={{ padding: '12px' }}>Harvest Date</th>
                                    <th style={{ padding: '12px' }}>Blockchain Hash</th>
                                    <th style={{ padding: '12px' }}>Status</th>
                                    <th style={{ padding: '12px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ledger.map((item, index) => (
                                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '12px' }}><strong>{item.cropName}</strong></td>
                                        <td style={{ padding: '12px' }}>{item.origin}</td>
                                        <td style={{ padding: '12px' }}>{item.harvestDate}</td>
                                        <td style={{ padding: '12px' }}>
                                            <code style={{ background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#555' }}>
                                                {item.hash.substring(0, 15)}...
                                            </code>
                                        </td>
                                        <td style={{ padding: '12px' }}>{getStatusIcon(item.status)}</td>
                                        <td style={{ padding: '12px' }}>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '4px 12px', fontSize: '0.9rem', marginRight: '5px' }}
                                                onClick={() => handleVerify(item.id)}
                                            >
                                                Verify
                                            </button>
                                            <button
                                                className="btn btn-primary"
                                                style={{ padding: '4px 12px', fontSize: '0.9rem' }}
                                                onClick={() => handleBuy(item.id)}
                                            >
                                                Buy
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {ledger.length === 0 && (
                                    <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No records found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {verifyResult && (
                <div className="card" style={{
                    marginTop: '2rem',
                    border: '1px solid',
                    borderColor: verifyResult.valid ? '#22c55e' : (verifyResult.status === 'TAMPERED' ? '#ef4444' : '#eab308'),
                    backgroundColor: verifyResult.valid ? '#f0fdf4' : (verifyResult.status === 'TAMPERED' ? '#fef2f2' : '#fefce8')
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3>Verification Detail</h3>
                        <button onClick={() => setVerifyResult(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>×</button>
                    </div>
                    <p style={{ fontSize: '1.1rem', marginTop: '10px' }}>
                        <strong>Result:</strong> {verifyResult.valid ? '🟢 Data Integrity Confirmed' : (verifyResult.status === 'TAMPERED' ? '🔴 TAMPERING DETECTED' : '🟡 Pending Blockchain Confirmation')}
                    </p>
                    <p><strong>Message:</strong> {verifyResult.message}</p>

                    <div style={{ marginTop: '1.5rem', background: 'white', padding: '1rem', borderRadius: '8px', border: '1px solid #eee' }}>
                        <h4 style={{ marginBottom: '10px' }}>Current Data from Database:</h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
                            <div><strong>Crop:</strong> {verifyResult.cropData.cropName}</div>
                            <div><strong>Quantity:</strong> {verifyResult.cropData.quantity} kg</div>
                            <div><strong>Origin:</strong> {verifyResult.cropData.origin}</div>
                            <div><strong>Harvest:</strong> {verifyResult.cropData.harvestDate}</div>
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <strong>Blockchain Data Hash:</strong>
                            <code style={{ display: 'block', wordBreak: 'break-all', marginTop: '5px', color: '#666' }}>{verifyResult.cropData.dataHash}</code>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Explore;

