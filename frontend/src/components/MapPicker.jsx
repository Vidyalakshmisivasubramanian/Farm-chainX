import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : <Marker position={position} />;
}

const MapPicker = ({ latitude, longitude, onLocationSelect }) => {
    const [position, setPosition] = useState(
        latitude && longitude ? { lat: latitude, lng: longitude } : null
    );

    const handlePositionChange = (newPosition) => {
        setPosition(newPosition);
        if (onLocationSelect) {
            onLocationSelect(newPosition.lat, newPosition.lng);
        }
    };

    // Default center: India
    const defaultCenter = [20.5937, 78.9629];
    const center = position ? [position.lat, position.lng] : defaultCenter;

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                handlePositionChange({ lat: parseFloat(lat), lng: parseFloat(lon) });
            } else {
                alert("Location not found");
            }
        } catch (err) {
            console.error("Search error", err);
        }
    };

    return (
        <div style={{ width: '100%', marginTop: '10px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="Search location (e.g. Nagpur)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ flex: 1 }}
                />
                <button type="submit" className="btn btn-outline" style={{ padding: '8px 15px' }}>Search</button>
            </form>
            <div style={{ height: '300px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
                <MapContainer
                    center={center}
                    zoom={position ? 13 : 5}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationMarker position={position} setPosition={handlePositionChange} />
                </MapContainer>
            </div>
        </div>
    );
};

export default MapPicker;
