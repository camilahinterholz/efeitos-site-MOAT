// src/componentes/HeroSimulation.jsx
import React from 'react';
import '../style/heroSection.css';
import heroImage from '../assets/herobg.png';

export default function HeroSimulation() {
    return (
        <div
            className="hero-section"
            style={{ backgroundImage: `url(${heroImage})` }}
        >
            <div className="hero-overlay"></div>
            <div className="hero-content">
                <h1 className="hero-title">
                    A TECH TEAM ON-DEMAND: PAY-AS-YOU-GO TECHNOLOGY SERVICES FOR SMALL BUSINESSES
                </h1>
                <p className="hero-description">
                    Plug us in for progress on projects, backlogs, or blockers. From fixing bugs to
                    building features or launching systems, we take on your tech work. Seamless,
                    flexible, and all at one simple rate.
                </p>
            </div>
        </div>
    );
}