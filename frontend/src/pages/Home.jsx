import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
            <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '1rem' }}>
                FarmXChain
            </h1>
            <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', maxWidth: '600px', margin: '0 auto 2rem' }}>
                A Blockchain-Based Smart Agriculture Supply Chain Platform connecting Farmers directly to Consumers.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                    Get Started
                </Link>
                <Link to="/register" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
                    Join Now
                </Link>
            </div>

            <div style={{ marginTop: '4rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                <div className="card">
                    <h3>For Farmers</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Get fair prices and direct access to markets.</p>
                </div>
                <div className="card">
                    <h3>For Consumers</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Trace fresh produce from farm to fork.</p>
                </div>
                <div className="card">
                    <h3>Secure</h3>
                    <p style={{ color: 'var(--color-text-muted)' }}>Powered by transparent supply chain technology.</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
