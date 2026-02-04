import React, { useEffect, useState } from 'react';
import { syncService } from './services/syncService';
import App from './App';

const MainWrapper = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        // Handle connectivity changes
        const handleOnline = () => {
            setIsOnline(true);
            syncService.syncSales();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Initial sync
        if (navigator.onLine) {
            syncService.syncSales();
            syncService.pullProducts();
        }

        // Periodic sync interval (e.g. every 30 seconds)
        const interval = setInterval(() => {
            if (navigator.onLine) syncService.syncSales();
        }, 30000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    return (
        <>
            {!isOnline && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    width: '100%',
                    background: 'var(--accent-warning)',
                    color: 'black',
                    textAlign: 'center',
                    padding: '4px',
                    zIndex: 9999,
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                }}>
                    MODO OFFLINE ACTIVADO - Las ventas se guardarán localmente
                </div>
            )}
            <App />
        </>
    );
};

export default MainWrapper;
