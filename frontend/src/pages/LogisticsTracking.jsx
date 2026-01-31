import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LogisticsTracking = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [shipment, setShipment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [orderId]);

    const fetchData = async () => {
        try {
            const orderRes = await api.get('/orders/my-orders');
            const foundOrder = orderRes.data.find(o => o.id === parseInt(orderId));
            setOrder(foundOrder);

            const shipmentRes = await api.get(`/shipments/order/${orderId}`);
            setShipment(shipmentRes.data);
        } catch (err) {
            console.error("Error fetching tracking data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (status, location = null) => {
        try {
            let url = `/shipments/${shipment.id}/status?status=${status}`;
            if (location) url += `&location=${encodeURIComponent(location)}`;
            await api.post(url);
            fetchData();
        } catch (err) {
            const errorMsg = err.response?.data ? (typeof err.response.data === 'string' ? err.response.data : JSON.stringify(err.response.data)) : err.message;
            alert("Error updating status: " + errorMsg);
        }
    };

    const role = localStorage.getItem('role');

    if (loading) return <div className="container">Loading...</div>;
    if (!order) return <div className="container">Order not found.</div>;

    const origin = [order.crop.latitude || 20.5937, order.crop.longitude || 78.9629];
    const current = shipment?.currentLatitude ? [shipment.currentLatitude, shipment.currentLongitude] : origin;
    // Buyer location simulation (static or from user profile if we had it)
    const destination = [origin[0] + 0.1, origin[1] + 0.1];

    return (
        <div className="container">
            <h1 className="title">Logistics Tracking - Order #{orderId}</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
                <div>
                    <div className="card">
                        <h3>Shipment Tracking</h3>
                        <p style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--color-primary)', marginTop: '10px' }}>
                            {shipment?.status || 'PENDING'}
                        </p>
                        <hr style={{ margin: '15px 0' }} />
                        <p><strong>Crop:</strong> {order.crop.cropName}</p>
                        <p><strong>From:</strong> {shipment?.fromRole}</p>
                        <p><strong>To:</strong> {shipment?.toRole}</p>
                        <p><strong>Location:</strong> {shipment?.location || order.crop.origin}</p>

                        {/* Farmer Controls - Only visible to Farmer */}
                        {role === 'FARMER' && (
                            <div style={{ marginTop: '20px' }}>
                                <h4>Update Status</h4>
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                                    <button className="btn btn-outline" onClick={() => handleUpdateStatus('PICKED_UP')}>Pick Up</button>
                                    <button className="btn btn-outline" onClick={() => handleUpdateStatus('IN_TRANSIT')}>In Transit</button>
                                    <button className="btn btn-outline" onClick={() => handleUpdateStatus('DELIVERED')}>Deliver</button>
                                </div>
                                <div style={{ marginTop: '10px' }}>
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Update location text"
                                        id="locUpdate"
                                    />
                                    <button className="btn btn-primary" style={{ marginTop: '5px', width: '100%' }} onClick={() => {
                                        const loc = document.getElementById('locUpdate').value;
                                        handleUpdateStatus(shipment.status, loc);
                                    }}>Update Location</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="card" style={{ padding: '0', height: '500px', overflow: 'hidden' }}>
                    <MapContainer center={current} zoom={11} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={origin}>
                            <Popup>Origin: {order.crop.origin}</Popup>
                        </Marker>
                        <Marker position={current} icon={new L.Icon({
                            iconUrl: 'https://cdn-icons-png.flaticon.com/512/754/754854.png', // TRUCK ICON
                            iconSize: [32, 32],
                            iconAnchor: [16, 32]
                        })}>
                            <Popup>Current Location</Popup>
                        </Marker>
                        <Marker position={destination}>
                            <Popup>Destination (Buyer)</Popup>
                        </Marker>
                        <Polyline positions={[origin, destination]} color="gray" dashArray="5, 10" />
                        <Polyline positions={[origin, current]} color="blue" />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

export default LogisticsTracking;
