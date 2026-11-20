import React, { useEffect, useState } from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ onFinish }) => {
    const [progress, setProgress] = useState(0);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const start = setTimeout(() => setProgress(100), 30);
        const leave = setTimeout(() => setIsLeaving(true), reduceMotion ? 80 : 420);
        const finish = setTimeout(onFinish, reduceMotion ? 100 : 650);
        return () => {
            clearTimeout(start);
            clearTimeout(leave);
            clearTimeout(finish);
        };
    }, [onFinish]);

    return (
        <div className={`loading-screen ${isLeaving ? 'fade-out' : ''}`} role="status" aria-live="polite">
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
