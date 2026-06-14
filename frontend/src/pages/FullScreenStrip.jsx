import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../apiConfig';
import logo from '../assets/logo.png';
import offer1 from '../assets/Buy 1 Get 1 FREE.png';
import offer2 from '../assets/Super Value Friends Meal.png';
import offer3 from '../assets/Family Combo.png';
import './FullScreenStrip.css';

const FullScreenStrip = () => {
    const [activeOffers, setActiveOffers] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [tickerText, setTickerText] = useState('🍕 WELCOME TO CAPTAIN PIZZA! • FRESH WOOD-FIRED PIZZAS, BURGERS & SIDES • CHOOSE YOUR COMBO & ORDER AT THE COUNTER • DINE-IN & TAKEAWAY AVAILABLE! 🛵');
    
    const sliderRef = useRef(null);
    const scrollPosRef = useRef(0);
    const lastTimeRef = useRef(null);
    const autoScrollRef = useRef(null);
    const controlTimeoutRef = useRef(null);

    const getImgSrc = (img, staticFallback = null) => {
        if (!img) return staticFallback || 'https://images.unsplash.com/photo-1541745537411-b8046f4d5092?w=300';
        if (typeof img !== 'string') return img; 
        
        let normalizedImg = img.replace(/\\/g, '/');
        if (normalizedImg.startsWith('uploads/')) normalizedImg = '/' + normalizedImg;
        if (normalizedImg.startsWith('http') || normalizedImg.startsWith('data:')) return normalizedImg;
        if (normalizedImg.startsWith('/uploads')) return `${API_URL}${normalizedImg}`;
        
        return normalizedImg;
    };

    useEffect(() => {
        // ── Lock body/html scroll to prevent browser scrollbar in fullscreen ──
        const prevHtmlOverflow = document.documentElement.style.overflow;
        const prevBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        // Fetch active campaigns
        const fetchOffers = async () => {
            try {
                const res = await fetch(`${API_URL}/api/offers/active`);
                const data = await res.json();
                if (data.success && data.data) {
                    setActiveOffers(data.data);
                }
            } catch (_) {}
        };
        fetchOffers();

        // Fetch TV ticker text from system settings
        const fetchTickerText = async () => {
            try {
                const res = await fetch(`${API_URL}/api/admin/settings`);
                const data = await res.json();
                if (data.success && data.data) {
                    const tickerSetting = data.data.find(s => s.key === 'tv_ticker_text');
                    if (tickerSetting && tickerSetting.value) {
                        setTickerText(tickerSetting.value);
                    }
                }
            } catch (_) {}
        };
        fetchTickerText();

        // Listen for fullscreen state changes
        const onFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
            // Re-lock overflow after fullscreen toggle (browser may reset it)
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('webkitfullscreenchange', onFullscreenChange);

        // Hide mouse controls after inactivity
        const handleMouseMove = () => {
            setShowControls(true);
            clearTimeout(controlTimeoutRef.current);
            controlTimeoutRef.current = setTimeout(() => {
                setShowControls(false);
            }, 3000);
        };
        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            // Restore original overflow on unmount
            document.documentElement.style.overflow = prevHtmlOverflow;
            document.body.style.overflow = prevBodyOverflow;
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
            window.removeEventListener('mousemove', handleMouseMove);
            clearTimeout(controlTimeoutRef.current);
        };
    }, []);

    const marqueeOffers = React.useMemo(() => {
        let loadedStatic = [
            { id: 'bogo', title: 'Buy 1 Get 1 FREE', desc: 'On Medium & Large Pizzas', image: offer1, badge: 'TIME_LEFT', isBogo: true },
            { id: 'friends', title: 'Super Value Friends Meal', desc: 'Burger + Fries + Coke', image: offer2, badge: 'Limited Deal', price: 100 },
            { id: 'family', title: 'Family Combo Special', desc: 'Pizza + Burgers + Coke', image: offer3, badge: 'Best Seller', price: 340 }
        ];

        try {
            const saved = localStorage.getItem('visible_strip_items');
            if (saved) {
                const parsed = JSON.parse(saved);
                const filtered = [];
                for (const st of loadedStatic) {
                    const edit = parsed.find(p => p._id === st.id);
                    if (edit) {
                        const updatedItem = { ...st };
                        if (edit.title) updatedItem.title = edit.title;
                        if (edit.description) updatedItem.desc = edit.description;
                        if (edit.bannerImage) {
                            if (edit.bannerImage === '🍕🍕') updatedItem.image = offer1;
                            else if (edit.bannerImage === '🍔🍟🥤') updatedItem.image = offer2;
                            else if (edit.bannerImage === '👨‍👩‍👧‍👦🍕') updatedItem.image = offer3;
                            else updatedItem.image = getImgSrc(edit.bannerImage);
                        }
                        if (edit.couponCode !== undefined) {
                            updatedItem.couponCode = edit.couponCode;
                        }
                        if (edit.fixedPrice !== undefined && edit.fixedPrice !== '') {
                            updatedItem.price = Number(edit.fixedPrice);
                        } else if (edit.fixedPrice === '') {
                            updatedItem.price = null;
                        }
                        filtered.push(updatedItem);
                    }
                }
                loadedStatic = filtered;
            }
        } catch(e) {}

        const dynamic = activeOffers.map((o, idx) => {
            let extractedPrice = 199;
            if (o.fixedPrice) {
                extractedPrice = o.fixedPrice;
            } else if (o.bannerImage && o.bannerImage.includes('#price=')) {
                extractedPrice = parseInt(o.bannerImage.split('#price=')[1]) || 199;
            }

            const cleanImage = o.bannerImage ? o.bannerImage.split('#price=')[0] : '';
            return {
                id: o._id || `db-off-${idx}`, 
                title: o.title, 
                desc: o.description, 
                image: getImgSrc(cleanImage), 
                badge: 'DEAL', 
                price: extractedPrice,
                couponCode: o.couponCode
            };
        });
        return [...loadedStatic, ...dynamic];
    }, [activeOffers]);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    return (
        <div className="tv-signage-page" style={{ cursor: showControls ? 'default' : 'none' }}>
            {/* Header / Branding */}
            <div className={`tv-header-bar ${showControls ? 'visible' : 'hidden'}`}>
                <div className="tv-logo-area">
                    <img src={logo} alt="Captain Pizza" className="tv-logo" />
                    <div>
                        <h1 className="tv-main-title">CAPTAIN PIZZA</h1>
                        <p className="tv-subtitle">Today's Mega Deals & Special Offers</p>
                    </div>
                </div>
                <div className="tv-actions">
                    <button className="tv-control-btn" onClick={toggleFullscreen}>
                        <i className={isFullscreen ? 'fas fa-compress' : 'fas fa-expand'}></i>
                        {isFullscreen ? ' Exit Fullscreen' : ' Fullscreen'}
                    </button>
                </div>
            </div>

            {/* Marquee Track Container */}
            <div className="tv-marquee-container">
                <div className="tv-track-wrapper">
                    <div className="tv-track">
                        {/* First Set */}
                        <div className="tv-content-set">
                            {marqueeOffers.map((item, idx) => (
                                <div key={(item.id || idx) + '-tv-1-' + idx} className="tv-dominos-card">
                                    <div className="tv-ribbon">
                                        <span className="tv-ribbon-brand">Captain's</span>
                                        <span className="tv-ribbon-title">{item.badge || 'SPECIAL'}</span>
                                    </div>
                                    <div className="tv-image-container">
                                        {item.image && !item.image.includes('/') && !item.image.includes('http') && !item.image.includes('data:') ? (
                                            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10rem', background:'#1a1a24'}}>
                                                {item.image}
                                            </div>
                                        ) : (
                                            <>
                                                <img src={item.image} alt="" className="tv-card-img-blur" />
                                                <img src={item.image} alt={item.title} className="tv-card-img-contain" />
                                            </>
                                        )}
                                    </div>
                                    <div className="tv-card-overlay">
                                        <div className="tv-item-header">
                                            <span className="tv-veg-indicator" style={{ borderColor: item.isBogo ? '#f59e0b' : '#22c55e' }}>
                                                <span className="tv-veg-dot" style={{ background: item.isBogo ? '#f59e0b' : '#22c55e' }}></span>
                                            </span>
                                            <h2 className="tv-item-name">{item.title}</h2>
                                        </div>
                                        <p className="tv-item-desc">{item.desc}</p>
                                        {item.couponCode && (
                                            <div className="tv-coupon-badge">PROMO CODE: {item.couponCode}</div>
                                        )}
                                        <div className="tv-item-footer">
                                            {item.price ? <span className="tv-price">₹{item.price.toLocaleString('en-IN')}</span> : <span className="tv-price">BOGO</span>}
                                            <span className="tv-order-instruction">ORDER NOW AT THE COUNTER 🌟</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Second Set (Clone for infinite loop) */}
                        <div className="tv-content-set">
                            {marqueeOffers.map((item, idx) => (
                                <div key={(item.id || idx) + '-tv-2-' + idx} className="tv-dominos-card">
                                    <div className="tv-ribbon">
                                        <span className="tv-ribbon-brand">Captain's</span>
                                        <span className="tv-ribbon-title">{item.badge || 'SPECIAL'}</span>
                                    </div>
                                    <div className="tv-image-container">
                                        {item.image && !item.image.includes('/') && !item.image.includes('http') && !item.image.includes('data:') ? (
                                            <div style={{width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10rem', background:'#1a1a24'}}>
                                                {item.image}
                                            </div>
                                        ) : (
                                            <>
                                                <img src={item.image} alt="" className="tv-card-img-blur" />
                                                <img src={item.image} alt={item.title} className="tv-card-img-contain" />
                                            </>
                                        )}
                                    </div>
                                    <div className="tv-card-overlay">
                                        <div className="tv-item-header">
                                            <span className="tv-veg-indicator" style={{ borderColor: item.isBogo ? '#f59e0b' : '#22c55e' }}>
                                                <span className="tv-veg-dot" style={{ background: item.isBogo ? '#f59e0b' : '#22c55e' }}></span>
                                            </span>
                                            <h2 className="tv-item-name">{item.title}</h2>
                                        </div>
                                        <p className="tv-item-desc">{item.desc}</p>
                                        {item.couponCode && (
                                            <div className="tv-coupon-badge">PROMO CODE: {item.couponCode}</div>
                                        )}
                                        <div className="tv-item-footer">
                                            {item.price ? <span className="tv-price">₹{item.price.toLocaleString('en-IN')}</span> : <span className="tv-price">BOGO</span>}
                                            <span className="tv-order-instruction">ORDER NOW AT THE COUNTER 🌟</span>
                                        </div>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer ticker */}
            <div className="tv-ticker-bar">
                <div className="tv-ticker-text">
                    {tickerText}
                </div>
            </div>
        </div>
    );
};

export default FullScreenStrip;
