import React, { useState, useEffect, useRef, useContext } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import DashboardStats from './DashboardStats';
import MenuManager from './MenuManager';
import UserManager from './UserManager';
import CouponManager from './CouponManager';
import OrderManager from './OrderManager';
import SettingsManager from './SettingsManager';
import OfferManager from './OfferManager';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
    const location = useLocation();
    const { user, authLoading, logoutAuth } = useContext(AuthContext);
    const navigate = useNavigate();

    // ── New Order Notification State ──────────────────────────────────────
    // Queue of unseen orders — popup stays until each one is closed
    const [orderQueue, setOrderQueue] = useState([]);     // array of order objects
    const [pendingCount, setPendingCount] = useState(0);  // total pending right now
    // Initialize directly from storage so first poll sees correct seen IDs
    const seenIdsRef = useRef((() => {
        try {
            const stored = sessionStorage.getItem('admin_seen_order_ids');
            return stored ? new Set(JSON.parse(stored)) : new Set();
        } catch { return new Set(); }
    })());

    useEffect(() => {
        if (!authLoading && (!user || user.role !== 'admin')) {
            navigate('/admin-login');
        }
    }, [user, authLoading, navigate]);

    // ── Poll for new orders every 12 seconds ─────────────────────────────
    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const checkNewOrders = async () => {
            try {
                const stored = sessionStorage.getItem('captain_pizza_user') || localStorage.getItem('captain_pizza_user');
                const token = stored ? JSON.parse(stored)?.token : null;
                if (!token) return;

                const { default: API_URL } = await import('../../apiConfig');
                const res = await fetch(`${API_URL}/api/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                if (!data.success || !data.data) return;

                const allOrders = data.data;
                const pending = allOrders.filter(o => o.status === 'pending');
                setPendingCount(pending.length);

                // Detect truly new (unseen) pending orders
                const unseen = pending.filter(o => !seenIdsRef.current.has(o._id));
                if (unseen.length > 0) {
                    // Add unseen orders to the alert queue
                    setOrderQueue(prev => {
                        const existingIds = new Set(prev.map(o => o._id));
                        const toAdd = unseen.filter(o => !existingIds.has(o._id));
                        return [...prev, ...toAdd];
                    });

                    // Play alert sound
                    try {
                        const ctx = new (window.AudioContext || window.webkitAudioContext)();
                        const osc = ctx.createOscillator();
                        const gain = ctx.createGain();
                        osc.connect(gain);
                        gain.connect(ctx.destination);
                        osc.frequency.setValueAtTime(880, ctx.currentTime);
                        osc.frequency.setValueAtTime(660, ctx.currentTime + 0.15);
                        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.30);
                        gain.gain.setValueAtTime(0.3, ctx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
                        osc.start(ctx.currentTime);
                        osc.stop(ctx.currentTime + 0.55);
                    } catch (_) {}
                }
            } catch (_) {}
        };

        checkNewOrders();
        const interval = setInterval(checkNewOrders, 12000);
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, authLoading]);

    // ── Dismiss the top-most order in the queue ───────────────────────────
    const dismissTop = () => {
        setOrderQueue(prev => {
            const [first, ...rest] = prev;
            if (first) {
                // Mark as seen so it won't alert again
                seenIdsRef.current.add(first._id);
                try {
                    sessionStorage.setItem('admin_seen_order_ids', JSON.stringify([...seenIdsRef.current]));
                } catch (_) {}
            }
            return rest;
        });
    };

    const goToOrders = () => {
        dismissTop();
        navigate('/admin/orders');
    };

    if (authLoading) return <div className="admin-loading">Checking permissions...</div>;
    if (!user || user.role !== 'admin') return null;

    const currentTab = location.pathname.split('/').pop();
    const topOrder = orderQueue[0] || null; // currently shown popup order

    return (
        <div className="admin-dashboard">

            {/* ── New Order Popup — stays open until admin manually closes ── */}
            {topOrder && (
                /* NO onClick on overlay — clicking outside does NOT close popup */
                <div className="new-order-overlay nop-enter">
                    <div className="new-order-popup animate-fade-scale">

                        {/* Pulsing alert strip at very top */}
                        <div className="nop-alert-strip">
                            <i className="fas fa-circle-notch fa-spin"></i>
                            &nbsp;ACTION REQUIRED — NEW INCOMING ORDER
                        </div>

                        <div className="nop-header">
                            <div className="nop-bell">
                                <i className="fas fa-bell nop-bell-icon"></i>
                            </div>
                            <div className="nop-title-wrap">
                                <h3 className="nop-title">🍕 New Order Arrived!</h3>
                                {orderQueue.length > 1 && (
                                    <span className="nop-badge">{orderQueue.length} orders in queue</span>
                                )}
                            </div>
                            {/* X button — only way to close */}
                            <button className="nop-close" onClick={dismissTop} title="Close this alert">
                                <i className="fas fa-times"></i>
                            </button>
                        </div>

                        <div className="nop-body">
                            <div className="nop-row">
                                <span className="nop-label">Order ID</span>
                                <span className="nop-value nop-id">#{topOrder._id.slice(-6).toUpperCase()}</span>
                            </div>
                            <div className="nop-row">
                                <span className="nop-label">Customer</span>
                                <span className="nop-value">{topOrder.customerInfo?.name || 'Walk-in'}</span>
                            </div>
                            <div className="nop-row">
                                <span className="nop-label">Phone</span>
                                <span className="nop-value">{topOrder.customerInfo?.phone || '—'}</span>
                            </div>
                            <div className="nop-row">
                                <span className="nop-label">Amount</span>
                                <span className="nop-value nop-amount">₹{topOrder.totalAmount}</span>
                            </div>
                            <div className="nop-row">
                                <span className="nop-label">Payment</span>
                                <span className="nop-value" style={{ textTransform: 'uppercase' }}>
                                    {topOrder.paymentMethod || '—'}
                                </span>
                            </div>
                            <div className="nop-items">
                                <span className="nop-label">Items Ordered</span>
                                <ul className="nop-items-list">
                                    {topOrder.orderItems?.slice(0, 5).map((item, i) => (
                                        <li key={i}><strong>{item.quantity}×</strong> {item.name}</li>
                                    ))}
                                    {(topOrder.orderItems?.length || 0) > 5 && (
                                        <li className="nop-more">+{topOrder.orderItems.length - 5} more items…</li>
                                    )}
                                </ul>
                            </div>
                        </div>

                        <div className="nop-footer">
                            <button className="nop-btn-view" onClick={goToOrders}>
                                <i className="fas fa-eye"></i> Open Orders Panel
                            </button>
                            <button className="nop-btn-dismiss" onClick={dismissTop}>
                                <i className="fas fa-check"></i> Mark as Seen
                            </button>
                        </div>

                        {orderQueue.length > 1 && (
                            <div className="nop-queue-hint">
                                <i className="fas fa-layer-group"></i>
                                &nbsp;{orderQueue.length - 1} more order alert{orderQueue.length - 1 > 1 ? 's' : ''} waiting
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <h2>Captain Admin</h2>
                    <p>Manager Panel</p>
                </div>

                <nav className="admin-nav">
                    <Link to="/admin" className={`admin-nav-link ${currentTab === 'admin' ? 'active' : ''}`}>
                        <i className="fas fa-home"></i> Overview
                    </Link>

                    <Link to="/admin/menu" className={`admin-nav-link ${currentTab === 'menu' ? 'active' : ''}`}>
                        <i className="fas fa-pizza-slice"></i> Menu &amp; Inventory
                    </Link>

                    <Link to="/admin/orders" className={`admin-nav-link ${currentTab === 'orders' ? 'active' : ''}`}>
                        <i className="fas fa-receipt"></i> Order History
                        {pendingCount > 0 && (
                            <span className="admin-pending-badge">{pendingCount}</span>
                        )}
                    </Link>

                    <Link to="/admin/users" className={`admin-nav-link ${currentTab === 'users' ? 'active' : ''}`}>
                        <i className="fas fa-users"></i> Users Setup
                    </Link>
                    <Link to="/admin/coupons" className={`admin-nav-link ${currentTab === 'coupons' ? 'active' : ''}`}>
                        <i className="fas fa-ticket-alt"></i> Coupons
                    </Link>
                    <Link to="/admin/offers" className={`admin-nav-link ${currentTab === 'offers' ? 'active' : ''}`}>
                        <i className="fas fa-bullhorn"></i> Seasonal Offers
                    </Link>
                    <Link to="/admin/settings" className={`admin-nav-link ${currentTab === 'settings' ? 'active' : ''}`}>
                        <i className="fas fa-cog"></i> System Settings
                    </Link>
                </nav>

                <div className="admin-logout">
                    <button
                        onClick={logoutAuth}
                        className="btn-primary"
                        style={{ width: '100%', textAlign: 'center', display: 'block', cursor: 'pointer', border: 'none' }}
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                <header className="admin-header">
                    <h2>Admin Dashboard</h2>
                    <div className="admin-profile">
                        {pendingCount > 0 && (
                            <span className="admin-header-pending">
                                <i className="fas fa-clock"></i> {pendingCount} pending order{pendingCount > 1 ? 's' : ''}
                            </span>
                        )}
                        <span>Welcome, Aajay Sharma</span>
                        <div className="admin-avatar">AS</div>
                    </div>
                </header>

                <div className="admin-content-wrapper">
                    <Routes>
                        <Route path="/" element={<DashboardStats />} />
                        <Route path="/menu" element={<MenuManager />} />
                        <Route path="/orders" element={<OrderManager />} />
                        <Route path="/users" element={<UserManager />} />
                        <Route path="/coupons" element={<CouponManager />} />
                        <Route path="/offers" element={<OfferManager />} />
                        <Route path="/settings" element={<SettingsManager />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
