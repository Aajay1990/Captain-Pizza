import React, { useState, useEffect, useContext } from 'react';
import { AuthContext, api } from '../../context/AuthContext';

const SettingsManager = () => {
    const { user } = useContext(AuthContext);
    const [settings, setSettings] = useState([]);
    const [draft, setDraft] = useState({});          // local edits — NOT sent until Save clicked
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [hasUnsaved, setHasUnsaved] = useState(false);

    useEffect(() => { fetchSettings(); }, []);

    const fetchSettings = async () => {
        try {
            setErrorMsg('');
            const res = await api.get('/api/admin/settings');
            if (res.data.success) {
                setSettings(res.data.data);
                setDraft({});
                setHasUnsaved(false);
            }
        } catch (error) {
            setErrorMsg('Failed to load settings from server.');
        } finally {
            setLoading(false);
        }
    };

    const getSettingValue = (key, defaultValue) => {
        // Draft takes priority over saved settings
        if (draft[key] !== undefined) return draft[key];
        const s = settings.find(item => item.key === key);
        return (s && s.value !== undefined) ? s.value : defaultValue;
    };

    const setDraftValue = (key, value) => {
        setDraft(prev => ({ ...prev, [key]: value }));
        setHasUnsaved(true);
    };

    // Save ALL draft changes in one batch
    const handleSaveAll = async () => {
        if (Object.keys(draft).length === 0) {
            setMessage('No changes to save.');
            setTimeout(() => setMessage(''), 2000);
            return;
        }
        setSaving(true);
        setErrorMsg('');
        try {
            const promises = Object.entries(draft).map(([key, value]) =>
                api.put(`/api/admin/settings/${key}`, { value })
            );
            await Promise.all(promises);
            // Reload fresh from server
            await fetchSettings();
            setMessage('✅ All settings saved successfully!');
            setTimeout(() => setMessage(''), 3500);
        } catch (error) {
            setErrorMsg(`Save failed: ${error.response?.data?.message || 'Server error'}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="placeholder-pane">
            <div className="loading-spinner"></div>
            <p>Loading system settings...</p>
        </div>
    );

    const storeStatus = getSettingValue('store_status', 'open');
    const isOpen = storeStatus === 'open';

    return (
        <div className="settings-manager card-style animate-fade-in">
            <div className="settings-header-banner">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <i className="fas fa-tools header-icon"></i>
                    <div>
                        <h3 className="section-title">Global System Configuration</h3>
                        <p className="section-subtitle">Edit settings below, then click Save Settings</p>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    {hasUnsaved && (
                        <span style={{ fontSize: '0.8rem', color: '#e53935', fontWeight: 700, background: '#ffebee', padding: '4px 12px', borderRadius: '999px', border: '1px solid #ffcdd2' }}>
                            ● Unsaved changes
                        </span>
                    )}
                    <button onClick={fetchSettings} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem' }}>
                        <i className="fas fa-sync-alt"></i> Discard
                    </button>
                </div>
            </div>

            {message && (
                <div className="alert-message pulse-animation">
                    <i className="fas fa-check-circle"></i> {message}
                </div>
            )}
            {errorMsg && (
                <div className="alert-message" style={{ backgroundColor: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2' }}>
                    <i className="fas fa-exclamation-triangle"></i> {errorMsg}
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                STORE OPEN / CLOSE STATUS
            ═══════════════════════════════════════════════ */}
            <div className="settings-section-card" style={{ marginBottom: '25px', borderLeft: `4px solid ${isOpen ? '#22c55e' : '#e53935'}` }}>
                <div className="section-card-header" style={{ color: isOpen ? '#16a34a' : '#c62828' }}>
                    <i className={`fas ${isOpen ? 'fa-store' : 'fa-store-slash'}`}></i>
                    Store Status &amp; Hours Management
                    <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, background: isOpen ? '#dcfce7' : '#fee2e2', color: isOpen ? '#16a34a' : '#dc2626', padding: '3px 12px', borderRadius: '999px', border: `1px solid ${isOpen ? '#bbf7d0' : '#fecaca'}` }}>
                        {isOpen ? '🟢 STORE OPEN' : '🔴 STORE CLOSED'}
                    </span>
                </div>

                <div className="setting-row">
                    <div className="setting-info">
                        <strong>Store Status</strong>
                        <p>When Closed — a popup will block the website. No orders possible.</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => setDraftValue('store_status', 'open')}
                            style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', background: storeStatus === 'open' ? '#22c55e' : '#f1f5f9', color: storeStatus === 'open' ? '#fff' : '#64748b', boxShadow: storeStatus === 'open' ? '0 4px 12px rgba(34,197,94,0.35)' : 'none', transition: 'all 0.2s' }}
                        >
                            <i className="fas fa-door-open"></i> Open
                        </button>
                        <button
                            onClick={() => setDraftValue('store_status', 'closed')}
                            style={{ padding: '9px 20px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: '0.9rem', background: storeStatus === 'closed' ? '#e53935' : '#f1f5f9', color: storeStatus === 'closed' ? '#fff' : '#64748b', boxShadow: storeStatus === 'closed' ? '0 4px 12px rgba(229,57,53,0.35)' : 'none', transition: 'all 0.2s' }}
                        >
                            <i className="fas fa-door-closed"></i> Closed
                        </button>
                    </div>
                </div>

                <div className="setting-row">
                    <div className="setting-info">
                        <strong>Auto-Hours (Cron)</strong>
                        <p>Automatically open/close based on the times below (server-side cron runs every minute).</p>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: 700 }}>
                        <div
                            onClick={() => setDraftValue('store_auto_hours', getSettingValue('store_auto_hours', 'false') === 'true' ? 'false' : 'true')}
                            style={{ width: '48px', height: '26px', borderRadius: '999px', background: getSettingValue('store_auto_hours', 'false') === 'true' ? '#22c55e' : '#cbd5e1', position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                            <div style={{ position: 'absolute', top: '3px', left: getSettingValue('store_auto_hours', 'false') === 'true' ? '24px' : '3px', width: '20px', height: '20px', borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }}></div>
                        </div>
                        {getSettingValue('store_auto_hours', 'false') === 'true' ? 'Enabled' : 'Disabled'}
                    </label>
                </div>

                <div className="setting-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
                    <div className="setting-info">
                        <strong>Store Open Time</strong>
                        <p>Time the store opens each day (IST, 24-hour format).</p>
                    </div>
                    <input
                        type="time"
                        className="premium-input-text"
                        value={getSettingValue('store_open_time', '11:00')}
                        onChange={(e) => setDraftValue('store_open_time', e.target.value)}
                        style={{ maxWidth: '140px', fontWeight: 700, fontSize: '1rem' }}
                    />
                </div>

                <div className="setting-row" style={{ flexWrap: 'wrap', gap: '16px' }}>
                    <div className="setting-info">
                        <strong>Store Close Time</strong>
                        <p>Time the store closes each day (IST, 24-hour format).</p>
                    </div>
                    <input
                        type="time"
                        className="premium-input-text"
                        value={getSettingValue('store_close_time', '23:00')}
                        onChange={(e) => setDraftValue('store_close_time', e.target.value)}
                        style={{ maxWidth: '140px', fontWeight: 700, fontSize: '1rem' }}
                    />
                </div>

                <div className="setting-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                    <div className="setting-info">
                        <strong>Closed Message</strong>
                        <p>Popup message shown to customers when store is closed.</p>
                    </div>
                    <textarea
                        className="premium-input-text w-full"
                        rows={3}
                        style={{ maxWidth: '100%', width: '100%', resize: 'vertical' }}
                        placeholder="e.g. Sorry, we're closed right now. We open at 11:00 AM. See you soon! 🍕"
                        value={getSettingValue('store_closed_message', "Sorry, we're currently closed. We'll be back soon! 🍕")}
                        onChange={(e) => setDraftValue('store_closed_message', e.target.value)}
                    />
                </div>
            </div>

            <div className="settings-grid">
                {/* Logistics & Charges */}
                <div className="settings-section-card logistics-card">
                    <div className="section-card-header">
                        <i className="fas fa-truck"></i> Delivery &amp; Logistics
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Standard Delivery Charge</strong>
                            <p>Flat fee for low-value orders.</p>
                        </div>
                        <div className="input-with-symbol">
                            <span className="symbol">Rs.</span>
                            <input type="number" className="premium-input-number"
                                value={getSettingValue('delivery_charge', 40)}
                                onChange={(e) => setDraftValue('delivery_charge', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Free Delivery Threshold</strong>
                            <p>Min order for free delivery.</p>
                        </div>
                        <div className="input-with-symbol">
                            <span className="symbol">Rs.</span>
                            <input type="number" className="premium-input-number"
                                value={getSettingValue('free_delivery_min_order', 1000)}
                                onChange={(e) => setDraftValue('free_delivery_min_order', Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Delivery Marquee Text</strong>
                            <p>Scrolling text banner on homepage.</p>
                        </div>
                        <input className="premium-input-text w-full" style={{ maxWidth: '280px' }}
                            placeholder="e.g. 🎉 SPECIAL OFFER: 3 KM FREE..."
                            value={getSettingValue('delivery_marquee_text', '🎉 SPECIAL OFFER: 3 KM FREE DELIVERY')}
                            onChange={(e) => setDraftValue('delivery_marquee_text', e.target.value)}
                        />
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Banner Heading</strong>
                            <p>Main text on the blue delivery banner.</p>
                        </div>
                        <input className="premium-input-text w-full" style={{ maxWidth: '280px' }}
                            placeholder="e.g. Free Home Delivery"
                            value={getSettingValue('banner_heading', 'Free Home Delivery')}
                            onChange={(e) => setDraftValue('banner_heading', e.target.value)}
                        />
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Banner Subheading</strong>
                            <p>Secondary text on delivery banner.</p>
                        </div>
                        <input className="premium-input-text w-full" style={{ maxWidth: '280px' }}
                            placeholder="e.g. Within 3KM on all orders..."
                            value={getSettingValue('banner_subheading', 'Within 3KM on all orders above ₹')}
                            onChange={(e) => setDraftValue('banner_subheading', e.target.value)}
                        />
                    </div>
                </div>

                {/* Contact & Support */}
                <div className="settings-section-card contact-card">
                    <div className="section-card-header">
                        <i className="fas fa-headset"></i> Store Contact &amp; WhatsApp
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Admin WhatsApp Number</strong>
                            <p>Format: 91XXXXXXXXXX.</p>
                        </div>
                        <input className="premium-input-text w-full" placeholder="e.g. 919220367325"
                            value={getSettingValue('admin_whatsapp_number', '919220367325')}
                            onChange={(e) => setDraftValue('admin_whatsapp_number', e.target.value.replace(/\D/g, ''))}
                        />
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Store Contact Email</strong>
                            <p>For support notifications.</p>
                        </div>
                        <input className="premium-input-text w-full" type="email"
                            placeholder="e.g. captainpizzadayalpur@gm..."
                            value={getSettingValue('store_contact_email', 'captainpizzadayalpur@gmail.com')}
                            onChange={(e) => setDraftValue('store_contact_email', e.target.value)}
                        />
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Phone Number 1</strong>
                            <p>Primary contact for Contact Us page.</p>
                        </div>
                        <input className="premium-input-text w-full" placeholder="+91 9220367325"
                            value={getSettingValue('phone_number_1', '+91 9220367325')}
                            onChange={(e) => setDraftValue('phone_number_1', e.target.value)}
                        />
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Phone Number 2</strong>
                            <p>Secondary contact number (optional).</p>
                        </div>
                        <input className="premium-input-text w-full" placeholder="+91 9220367425"
                            value={getSettingValue('phone_number_2', '+91 9220367425')}
                            onChange={(e) => setDraftValue('phone_number_2', e.target.value)}
                        />
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Store Address</strong>
                            <p>Full address shown on Contact page.</p>
                        </div>
                        <textarea className="premium-input-text w-full" rows={3}
                            placeholder="Store full address..."
                            value={getSettingValue('store_address', 'F-11 Main Road Dayalpur, Opposite Rajmandir Hypermarket')}
                            onChange={(e) => setDraftValue('store_address', e.target.value)}
                        />
                    </div>

                    <div className="setting-row">
                        <div className="setting-info">
                            <strong>Business Hours (Display Text)</strong>
                            <p>Shown on Contact page only (cosmetic).</p>
                        </div>
                        <input className="premium-input-text w-full"
                            placeholder="e.g. Monday to Sunday, 11:00 AM to 11:00 PM"
                            value={getSettingValue('business_hours', 'Monday to Sunday, 11:00 AM to 11:00 PM')}
                            onChange={(e) => setDraftValue('business_hours', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* TV Signage */}
            <div className="settings-section-card" style={{ marginTop: '25px', borderLeft: '4px solid #6a0dad' }}>
                <div className="section-card-header" style={{ color: '#6a0dad' }}>
                    <i className="fas fa-tv"></i> TV Signage Display
                </div>
                <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: '16px', marginTop: '-8px' }}>
                    Controls the scrolling ticker text shown at the bottom of the TV Strip screen.
                </p>
                <div className="setting-row" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: '10px' }}>
                    <div className="setting-info">
                        <strong>📺 TV Ticker Bar Text</strong>
                        <p>Scrolling announcement at the bottom of TV signage. Use • to separate items.</p>
                    </div>
                    <textarea className="premium-input-text w-full" rows={3}
                        style={{ maxWidth: '100%', width: '100%', resize: 'vertical', fontWeight: '600' }}
                        placeholder="e.g. 🍕 WELCOME TO CAPTAIN PIZZA! • FRESH PIZZAS..."
                        value={getSettingValue('tv_ticker_text', '🍕 WELCOME TO CAPTAIN PIZZA! • FRESH WOOD-FIRED PIZZAS, BURGERS & SIDES • CHOOSE YOUR COMBO & ORDER AT THE COUNTER • DINE-IN & TAKEAWAY AVAILABLE! 🛵')}
                        onChange={(e) => setDraftValue('tv_ticker_text', e.target.value)}
                    />
                    <small style={{ color: '#999', fontSize: '0.75rem' }}>
                        <i className="fas fa-info-circle"></i> Changes take effect next time TV Strip is refreshed.
                    </small>
                </div>
            </div>

            {/* Save Button */}
            <div className="settings-footer" style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end', gap: '12px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                <button onClick={fetchSettings} style={{ padding: '12px 20px', borderRadius: '10px', border: '1px solid #ddd', background: '#f8f8f8', color: '#666', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                    <i className="fas fa-times"></i> Discard Changes
                </button>
                <button
                    className="btn-primary"
                    onClick={handleSaveAll}
                    disabled={saving}
                    style={{ padding: '12px 28px', fontSize: '1.05rem', opacity: saving ? 0.7 : 1, position: 'relative' }}
                >
                    {saving ? (
                        <><i className="fas fa-spinner fa-spin"></i> Saving...</>
                    ) : (
                        <><i className="fas fa-save"></i> Save All Settings {hasUnsaved ? `(${Object.keys(draft).length} changes)` : ''}</>
                    )}
                </button>
            </div>

            <style>{`
                .settings-manager { padding: 20px; background: transparent; }
                .settings-header-banner { display: flex; align-items: center; gap: 15px; margin-bottom: 30px; padding-bottom: 15px; border-bottom: 1px solid rgba(0,0,0,0.05); justify-content: space-between; }
                .header-icon { font-size: 2.2rem; color: var(--primary); }
                .section-title { margin: 0; font-size: 1.4rem; color: #333; }
                .section-subtitle { margin: 2px 0 0; font-size: 0.88rem; color: #666; }
                .settings-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; }
                .settings-section-card { background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 20px rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.06); }
                .section-card-header { font-weight: 700; font-size: 1.05rem; margin-bottom: 18px; display: flex; align-items: center; gap: 10px; color: #333; }
                .logistics-card .section-card-header { color: #1976d2; }
                .setting-row { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid #f5f5f5; gap: 15px; }
                .setting-row:last-child { border-bottom: none; }
                .setting-info strong { display: block; font-size: 13.5px; color: #444; }
                .setting-info p { margin: 3px 0 0; font-size: 12px; color: #888; }
                .premium-select, .premium-input-text, .premium-input-number { padding: 9px 12px; border-radius: 8px; border: 1px solid #ddd; background: #fdfdfd; font-size: 14px; font-weight: 600; outline: none; transition: all 0.2s ease; }
                .premium-select:focus, .premium-input-text:focus, .premium-input-number:focus { border-color: var(--primary); background: white; box-shadow: 0 0 0 3px rgba(183,28,28,0.1); }
                .premium-input-text { width: 100%; max-width: 200px; }
                .premium-input-number { width: 80px; text-align: center; }
                .input-with-symbol { display: flex; align-items: center; background: #f8f8f8; border-radius: 8px; border: 1px solid #ddd; overflow: hidden; }
                .input-with-symbol .symbol { padding: 0 10px; color: #666; font-weight: bold; background: #eee; height: 40px; display: flex; align-items: center; }
                .input-with-symbol .premium-input-number { border: none; background: transparent; }
                .alert-message { padding: 14px 18px; background: #e8f5e9; color: #2e7d32; border-radius: 12px; margin-bottom: 20px; font-weight: 600; border: 1px solid #c8e6c9; display: flex; align-items: center; gap: 10px; }
                .placeholder-pane { padding: 100px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px; color: #999; }
                .loading-spinner { width: 40px; height: 40px; border: 3px solid #f3f3f3; border-top: 3px solid var(--primary); border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                @media (max-width: 900px) { .settings-grid { grid-template-columns: 1fr; } .setting-row { flex-direction: column; align-items: flex-start; } .premium-input-text { max-width: 100%; } }
            `}</style>
        </div>
    );
};

export default SettingsManager;
