import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onFinish }) => {
    const [progress, setProgress] = useState(0);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Function to increment progress
        const incrementProgress = () => {
            setProgress((prev) => {
                const next = prev + Math.random() * 15;
                return next > 100 ? 100 : next;
            });
        };

        const timer = setInterval(incrementProgress, 200);

        // Cleanup interval
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (progress === 100) {
            // Wait a bit before leaving
            const leaveTimer = setTimeout(() => {
                setIsLeaving(true);
                // Call onFinish callback after fade-out
                const completeTimer = setTimeout(() => {
                    onFinish();
                }, 800); // Same as transition Duration in CSS
                
                return () => clearTimeout(completeTimer);
            }, 500);

            return () => clearTimeout(leaveTimer);
        }
    }, [progress, onFinish]);

    return (
        <div className={`loading-screen ${isLeaving ? 'fade-out' : ''}`}>
            <div className="loading-bg-glow"></div>
            
            <div className="loading-icons animate-in">
                <div className="loading-icon-box">
                    <ion-icon name="code-slash-outline"></ion-icon>
                </div>
                <div className="loading-icon-box">
                    <ion-icon name="layers-outline"></ion-icon>
                </div>
                <div className="loading-icon-box">
                    <ion-icon name="flash-outline"></ion-icon>
                </div>
            </div>

            <div className="loading-text-container animate-in">
                <h3 className="loading-title">WELCOME TO MY</h3>
                <h2 className="loading-subtitle">PORTFOLIO WEBSITE</h2>
            </div>

            <div className="loading-badge animate-in">
                 <ion-icon name="globe-outline"></ion-icon>
                 <span>risajunetenoria.com</span>
            </div>

            <div className="loading-progress-container animate-in">
                <div 
                    className="loading-progress-bar" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default LoadingScreen;
