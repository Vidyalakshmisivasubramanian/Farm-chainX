import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const CropDetailsModal = ({ crop, onClose, onVerify }) => {
    if (!crop) return null;

    const hasLocation = crop.latitude && crop.longitude;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                maxWidth: '700px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '30px',
                position: 'relative'
            }}>
                {/* Close Button */}
                <button
                    onClick={onClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#666'
                    }}
                >
                    ×
                </button>

                {/* Title */}
                <h2 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>
                    Crop Details
                </h2>

                {/* Crop Information */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <strong style={{ color: '#666' }}>Crop Name:</strong>
                            <p style={{ margin: '5px 0', fontSize: '16px' }}>{crop.cropName}</p>
                        </div>
                        <div>
                            <strong style={{ color: '#666' }}>Quantity:</strong>
                            <p style={{ margin: '5px 0', fontSize: '16px' }}>{crop.quantity} kg</p>
                        </div>
                        <div>
                            <strong style={{ color: '#666' }}>Origin (City):</strong>
                            <p style={{ margin: '5px 0', fontSize: '16px' }}>{crop.origin || 'N/A'}</p>
                        </div>
                        <div>
                            <strong style={{ color: '#666' }}>Quality Grade:</strong>
                            <p style={{ margin: '5px 0', fontSize: '16px' }}>
                                <span className="status-badge status-active">{crop.qualityGrade}</span>
                            </p>
                        </div>
                        <div>
                            <strong style={{ color: '#666' }}>Harvest Date:</strong>
                            <p style={{ margin: '5px 0', fontSize: '16px' }}>{crop.harvestDate}</p>
                        </div>
                    </div>
                </div>

                {/* Blockchain Information */}
                <div style={{
                    marginBottom: '20px',
                    padding: '15px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px'
                }}>
                    <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>
                        Blockchain Proof
                    </h3>
                    <div style={{ marginBottom: '10px' }}>
                        <strong style={{ color: '#666' }}>Data Hash (SHA-256):</strong>
                        <p style={{
                            margin: '5px 0',
                            fontSize: '14px',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all',
                            backgroundColor: '#fff',
                            padding: '8px',
                            borderRadius: '4px'
                        }}>
                            {crop.dataHash}
                        </p>
                    </div>
                    <div>
                        <strong style={{ color: '#666' }}>Traceability Status:</strong>
                        <p style={{ margin: '5px 0', fontSize: '16px' }}>
                            {crop.verificationStatus === 'VERIFIED' ? (
                                <span style={{ color: 'green', fontWeight: 'bold' }}>✅ Verified Integrity</span>
                            ) : crop.verificationStatus === 'TAMPERED' ? (
                                <span style={{ color: 'red', fontWeight: 'bold' }}>❌ Data Tampered!</span>
                            ) : (
                                <span style={{ color: 'orange', fontWeight: 'bold' }}>⏳ Verification Pending</span>
                            )}
                        </p>
                    </div>
                </div>


                {/* Location Map */}
                {hasLocation ? (
                    <div style={{ marginBottom: '20px' }}>
                        <h3 style={{ marginTop: 0, marginBottom: '10px', fontSize: '18px' }}>
                            Crop Origin Location
                        </h3>
                        <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden' }}>
                            <MapContainer
                                center={[crop.latitude, crop.longitude]}
                                zoom={13}
                                style={{ height: '100%', width: '100%' }}
                                scrollWheelZoom={false}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[crop.latitude, crop.longitude]}>
                                    <Popup>
                                        <strong>{crop.cropName}</strong><br />
                                        Harvested: {crop.harvestDate}
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                        <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                            Coordinates: {crop.latitude.toFixed(6)}, {crop.longitude.toFixed(6)}
                        </p>
                    </div>
                ) : (
                    <div style={{
                        padding: '20px',
                        backgroundColor: '#fff3cd',
                        borderRadius: '8px',
                        marginBottom: '20px'
                    }}>
                        <p style={{ margin: 0, color: '#856404' }}>
                            ℹ️ No location data available for this crop.
                        </p>
                    </div>
                )}

                {/* Close Button at Bottom */}
                <button
                    onClick={onClose}
                    className="btn btn-outline"
                    style={{ width: '100%' }}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default CropDetailsModal;
