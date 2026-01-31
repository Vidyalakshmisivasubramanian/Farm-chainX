import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.get('/orders/my-orders');
            setOrders(res.data);
        } catch (err) {
            console.error("Error fetching orders", err);
        } finally {
            setLoading(false);
        }
    };

    const role = localStorage.getItem('role');

    const handleApprove = async (orderId) => {
        try {
            await api.post(`/orders/${orderId}/approve`);
            alert("Order approved and ownership transfer recorded!");
            fetchOrders();
        } catch (err) {
            const errorMsg = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : err.message;
            alert("Error approving order: " + errorMsg);
        }
    };

    const handleReject = async (orderId) => {
        try {
            await api.post(`/orders/${orderId}/reject`);
            fetchOrders();
        } catch (err) {
            const errorMsg = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : err.message;
            alert("Error rejecting order: " + errorMsg);
        }
    };

    return (
        <div className="container">
            <h1 className="title">Order Management</h1>
            {loading ? <p>Loading...</p> : (
                <div className="card">
                    <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #eee' }}>
                                <th style={{ padding: '12px' }}>ID</th>
                                <th style={{ padding: '12px' }}>Crop</th>
                                <th style={{ padding: '12px' }}>Buyer/Farmer</th>
                                <th style={{ padding: '12px' }}>Status</th>
                                <th style={{ padding: '12px' }}>Blockchain Hash</th>
                                <th style={{ padding: '12px' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '12px' }}>#{order.id}</td>
                                    <td style={{ padding: '12px' }}>{order.crop.cropName}</td>
                                    <td style={{ padding: '12px' }}>{role === 'FARMER' ? order.buyer.name : order.crop.farmer.user.name}</td>
                                    <td style={{ padding: '12px' }}>
                                        <span className={`status-badge ${order.status === 'APPROVED' ? 'status-active' : (order.status === 'REJECTED' ? 'status-tampered' : 'status-pending')}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {order.blockchainTxHash ? (
                                            <code style={{ fontSize: '0.8rem' }}>{order.blockchainTxHash.substring(0, 10)}...</code>
                                        ) : 'N/A'}
                                    </td>
                                    <td style={{ padding: '12px' }}>
                                        {order.status === 'REQUESTED' && role === 'FARMER' ? (
                                            <>
                                                <button className="btn btn-primary" style={{ marginRight: '5px', padding: '4px 8px' }} onClick={() => handleApprove(order.id)}>Approve</button>
                                                <button className="btn btn-outline" style={{ padding: '4px 8px' }} onClick={() => handleReject(order.id)}>Reject</button>
                                            </>
                                        ) : order.status === 'APPROVED' ? (
                                            <button className="btn btn-outline" onClick={() => navigate(`/track/${order.id}`)}>Track shipment</button>
                                        ) : null}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
