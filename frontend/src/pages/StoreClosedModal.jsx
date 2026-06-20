import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';
import './StoreClosedModal.css';

/**
 * StoreClosedModal — polls the backend for store_status every 5 minutes.
 * When status === 'closed', renders a fullscreen blocking modal.
 * Admin pages (/admin*) are never blocked.
 */
const StoreClosedModal = () => {
    const [isClosed, setIsClosed] = useState(false);
    const [closedMessage, setClosedMessage] = useState("Sorry, we're currently closed. We'll be back soon! 🍕");
    const [openTime, setOpenTime] = useState('');
    const [closeTime, setCloseTime] = useState('');

    // Don't block admin or TV strip pages
    const isAdminPage = window.location.pathname.startsWith('/admin');
    const isTvPage = window.location.pathname.startsWith('/tv-strip');

    const checkStatus = async () => {
        if (isAdminPage || isTvPage) return;
        try {
            const res = await fetch(`${API_URL}/api/admin/settings`);
            const data = await res.json();
            if (!data.success || !data.data) return;

            const settings = data.data;
            const find = (key) => settings.find(s => s.key === key)?.value;

            const status = find('store_status') || 'open';
            const msg = find('store_closed_message') || "Sorry, we're currently closed. We'll be back soon! 🍕";
            const open = find('store_open_time') || '';
            const close = find('store_close_time') || '';

            setIsClosed(status === 'closed');
            setClosedMessage(msg);
            setOpenTime(open);
            setCloseTime(close);
        } catch (_) {}
    };

    useEffect(() => {
        if (isAdminPage || isTvPage) return;
        checkStatus();
        // Poll every 5 minutes
        const interval = setInterval(checkStatus, 5 * 60 * 1000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!isClosed || isAdminPage || isTvPage) return null;

    // Format time for display
    const fmt = (t) => {
        if (!t) return '';
        const [h, m] = t.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour = ((h % 12) || 12);
        return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
    };

    return (
        <div className="store-closed-overlay">
            <div className="store-closed-modal">
                {/* Animated pizza icon */}
                <div className="scm-icon-wrap">
                    <div className="scm-icon">🍕</div>
                    <div className="scm-icon-ring"></div>
                </div>

                <h1 className="scm-title">We're Closed</h1>
                <p className="scm-message">{closedMessage}</p>

                {(openTime || closeTime) && (
                    <div className="scm-hours">
                        <i className="fas fa-clock"></i>
                        <span>
                            {openTime && closeTime
                                ? `We're open ${fmt(openTime)} – ${fmt(closeTime)}`
                                : openTime
                                    ? `Opens at ${fmt(openTime)}`
                                    : `Closes at ${fmt(closeTime)}`}
                        </span>
                    </div>
                )}

                <div className="scm-footer">
                    <span className="scm-dot"></span>
                    Captain Pizza · See you soon!
                    <span className="scm-dot"></span>
                </div>
            </div>
        </div>
    );
};

export default StoreClosedModal;
