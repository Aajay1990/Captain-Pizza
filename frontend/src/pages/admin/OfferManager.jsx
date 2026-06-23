import React, { useState, useEffect } from 'react';
import { api } from '../../context/AuthContext';
import API_URL from '../../apiConfig';

const OfferManager = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentOffer, setCurrentOffer] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingTvImage, setUploadingTvImage] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [saveLoading, setSaveLoading] = useState(false);

    const [staticStripItems, setStaticStripItems] = useState(() => {
        try {
            const saved = localStorage.getItem('visible_strip_items');
            if (saved) return JSON.parse(saved);
        } catch(e) {}
        return [
            { _id: 'bogo', title: 'Buy 1 Get 1 FREE', description: "Built-in Captain's Strip Item scrolling on Home", isActive: true, isStatic: true, bannerImage: '🍕🍕', fixedPrice: '', couponCode: '' },
            { _id: 'friends', title: 'Super Value Friends Meal', description: "Built-in Captain's Strip Item scrolling on Home", isActive: true, isStatic: true, bannerImage: '🍔🍟🥤', fixedPrice: 100, couponCode: '' },
            { _id: 'family', title: 'Family Combo Special', description: "Built-in Captain's Strip Item scrolling on Home", isActive: true, isStatic: true, bannerImage: '👨‍👩‍👧‍👦🍕', fixedPrice: 340, couponCode: '' }
        ];
    });

    const getImgSrc = (img) => {
        if (!img) return '';
        if (typeof img !== 'string') return img;
        let n = img.replace(/\\/g, '/');
        if (n.startsWith('uploads/')) n = '/' + n;
        if (n.startsWith('http') || n.startsWith('data:')) return n;
        if (n.startsWith('/uploads')) return `${API_URL}${n}`;
        return n;
    };

    const defaultFormState = {
        title: '', description: '',
        discountType: 'PERCENT', discountValue: '',
        fixedPrice: '', priceMode: 'DISCOUNT',
        startDate: '', endDate: '',
        isActive: true, bannerImage: '', tvImage: '', couponCode: ''
    };
    const [formData, setFormData] = useState(defaultFormState);

    useEffect(() => { fetchOffers(); }, []);

    const fetchOffers = async () => {
        try {
            const res = await api.get('/api/admin/offers');
            if (res.data.success) setOffers(res.data.data);
            else setOffers([]);
        } catch (err) { setOffers([]); }
        finally { setLoading(false); }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('image', file);
        setUploadingImage(true);
        try {
            const res = await api.post('/api/upload', fd);
            if (res.data.success) {
                setFormData(prev => ({ ...prev, bannerImage: res.data.image }));
            } else {
                alert('Upload Failed: ' + (res.data.message || 'Unknown'));
            }
        } catch (err) {
            alert('Upload error: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingImage(false);
            e.target.value = null;
        }
    };

    const handleTvImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const fd = new FormData();
        fd.append('image', file);
        setUploadingTvImage(true);
        try {
            const res = await api.post('/api/upload', fd);
            if (res.data.success) {
                setFormData(prev => ({ ...prev, tvImage: res.data.image }));
            } else {
                alert('TV Image Upload Failed: ' + (res.data.message || 'Unknown'));
            }
        } catch (err) {
            alert('TV Upload error: ' + (err.response?.data?.message || err.message));
        } finally {
            setUploadingTvImage(false);
            e.target.value = null;
        }
    };

    const openEditor = (offer = null) => {
        setSaveError('');
        if (offer) {
            let fPrice = offer.fixedPrice || '';
            let bImage = offer.bannerImage || '';
            if (!fPrice && bImage.includes('#price=')) {
                fPrice = parseInt(bImage.split('#price=')[1]) || '';
            }
            bImage = bImage.split('#price=')[0];

            setFormData({
                title: offer.title || '',
                description: offer.description || '',
                discountType: offer.discountType || 'PERCENT',
                discountValue: offer.discountValue || '',
                fixedPrice: fPrice,
                priceMode: offer.priceMode || (fPrice ? 'FIXED' : 'DISCOUNT'),
                startDate: offer.startDate ? new Date(offer.startDate).toISOString().split('T')[0] : '',
                endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
                isActive: offer.isActive,
                bannerImage: bImage,
                tvImage: offer.tvImage || '',
                couponCode: offer.couponCode || ''
            });
            setCurrentOffer(offer);
        } else {
            setFormData({
                ...defaultFormState,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0]
            });
            setCurrentOffer(null);
        }
        setIsEditing(true);
    };

    const closeEditor = () => { setIsEditing(false); setCurrentOffer(null); setSaveError(''); };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaveError('');
        setSaveLoading(true);

        // Parse prices cleanly — inputs are type=text to avoid browser -1 bug
        const fixedPriceNum = parseInt(formData.fixedPrice, 10);
        const discountValueNum = parseInt(formData.discountValue, 10);

        // If editing a static/built-in item, save directly to local storage
        if (currentOffer && currentOffer.isStatic) {
            const updated = staticStripItems.map(item => {
                if (item._id === currentOffer._id) {
                    return {
                        ...item,
                        title: formData.title.trim(),
                        description: formData.description.trim(),
                        fixedPrice: isNaN(fixedPriceNum) ? '' : fixedPriceNum,
                        discountValue: isNaN(discountValueNum) ? '' : discountValueNum,
                        discountType: formData.discountType,
                        couponCode: formData.couponCode ? formData.couponCode.toUpperCase().trim() : '',
                        bannerImage: formData.bannerImage || ''
                    };
                }
                return item;
            });
            setStaticStripItems(updated);
            localStorage.setItem('visible_strip_items', JSON.stringify(updated));
            alert('Saved built-in item!');
            closeEditor();
            setSaveLoading(false);
            return;
        }

        // Hack: Store price in the image URL to bypass backend schema limits if the user doesn't update the backend
        let finalBannerImage = formData.bannerImage ? formData.bannerImage.split('#price=')[0].trim() : '';
        if (fixedPriceNum && !isNaN(fixedPriceNum)) {
            finalBannerImage += `#price=${fixedPriceNum}`;
        }

        // Build payload
        const payload = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            priceMode: 'FIXED',
            startDate: formData.startDate,
            endDate: formData.endDate,
            isActive: formData.isActive,
            bannerImage: finalBannerImage || '',
            tvImage: formData.tvImage ? formData.tvImage.trim() : '',
            couponCode: formData.couponCode ? formData.couponCode.toUpperCase().trim() : '',
            fixedPrice: fixedPriceNum,
            discountType: formData.discountType,
            discountValue: discountValueNum
        };

        // Validate
        if (!payload.title) { setSaveError('Campaign title is required.'); setSaveLoading(false); return; }
        if (!payload.startDate || !payload.endDate) { setSaveError('Start and end dates are required.'); setSaveLoading(false); return; }
        if (new Date(payload.startDate) > new Date(payload.endDate)) { setSaveError('End date must be after start date.'); setSaveLoading(false); return; }
        if (isNaN(fixedPriceNum) || fixedPriceNum < 1) {
            setSaveError('Please enter a valid Marked Price (whole number, at least \u20b91).');
            setSaveLoading(false); return;
        }
        if (isNaN(discountValueNum) || discountValueNum < 1) {
            setSaveError('Please enter a valid Coupon Discount value (whole number, at least 1).');
            setSaveLoading(false); return;
        }
        if (formData.discountType === 'PERCENT' && discountValueNum > 100) {
            setSaveError('Percentage discount cannot exceed 100%.');
            setSaveLoading(false); return;
        }

        const method = currentOffer ? 'put' : 'post';
        const url = currentOffer ? `/api/admin/offers/${currentOffer._id}` : `/api/admin/offers`;

        try {
            const res = await api[method](url, payload);
            if (res.data.success) {
                fetchOffers();
                closeEditor();
            } else {
                setSaveError('Save failed: ' + (res.data.message || 'Unknown error'));
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Network error saving offer.';
            setSaveError('Error: ' + msg);
        } finally {
            setSaveLoading(false);
        }
    };



    const handleDelete = async (id, isStatic = false) => {
        if (!window.confirm('Delete this item completely?')) return;
        if (isStatic) {
            const updated = staticStripItems.filter(item => item._id !== id);
            setStaticStripItems(updated);
            localStorage.setItem('visible_strip_items', JSON.stringify(updated));
            alert('Item deleted!');
            return;
        }
        try {
            const res = await api.delete(`/api/admin/offers/${id}`);
            if (res.data.success) {
                setOffers(prev => prev.filter(o => o._id !== id));
            } else {
                alert('Delete failed: ' + (res.data.message || 'Unknown error'));
            }
        } catch { alert('Network error deleting offer.'); }
    };

    const handleToggleActive = async (offer) => {
        try {
            const res = await api.put(`/api/admin/offers/${offer._id}`, { ...offer, isActive: !offer.isActive });
            if (res.data.success) {
                setOffers(prev => prev.map(o => o._id === offer._id ? { ...o, isActive: !o.isActive } : o));
            }
        } catch { alert('Failed to update offer status.'); }
    };

    return (
        <div className="coupon-manager">
            <div className="admin-toolbar">
                <h3 className="section-title">Dynamic Seasonal Offers</h3>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <a href="/tv-strip" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: '1px solid #ccc', borderRadius: '8px', textDecoration: 'none', color: '#333', fontWeight: 'bold', background: '#fff', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <i className="fas fa-tv" style={{ color: '#B71C1C' }}></i> TV Signage Mode
                    </a>
                    <button className="btn-primary" onClick={() => openEditor()}>
                        <i className="fas fa-plus"></i> New Offer Campaign
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Banner</th>
                            <th>Campaign Title</th>
                            <th>Coupon Code</th>
                            <th>Price / Discount</th>
                            <th>Valid Dates</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading campaigns...</td></tr>}

                        {[...staticStripItems, ...offers].map(offer => {
                            const now = new Date();
                            const isLive = offer.isStatic ? true : (offer.isActive && new Date(offer.startDate) <= now && new Date(offer.endDate) >= now);
                            return (
                                <tr key={offer._id}>
                                    <td>
                                        {(() => {
                                            const displayImg = offer.bannerImage || offer.image || '';
                                            const isEmoji = displayImg && !displayImg.startsWith('uploads') && !displayImg.startsWith('/') && !displayImg.startsWith('http') && !displayImg.startsWith('data:');
                                            if (isEmoji) {
                                                return <span style={{ fontSize: '2rem' }}>{displayImg}</span>;
                                            } else if (displayImg) {
                                                return (
                                                    <img src={getImgSrc(displayImg.split('#price=')[0])} alt="offer banner"
                                                        style={{ width: '80px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                                                );
                                            } else {
                                                return <span style={{ color: '#999', fontSize: '0.8rem' }}>No Image</span>;
                                            }
                                        })()}
                                    </td>
                                    <td>
                                        <strong>{offer.title}</strong><br />
                                        <small style={{ color: '#666' }}>{offer.description}</small>
                                    </td>
                                    <td>
                                        {offer.couponCode ? (
                                            <span style={{ background: 'rgba(183,28,28,0.1)', color: '#B71C1C', padding: '3px 10px', borderRadius: '6px', fontWeight: '800', fontSize: '0.85rem', border: '1px dashed #B71C1C' }}>
                                                {offer.couponCode}
                                            </span>
                                        ) : (
                                            <span style={{ color: '#ccc', fontSize: '0.8rem' }}>{offer.isStatic ? 'Built-in' : '—'}</span>
                                        )}
                                    </td>
                                    <td>
                                        {offer.isStatic ? (
                                            'N/A'
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                                <span style={{ color: '#2E7D32', fontWeight: '700' }}>
                                                    Banner: ₹{offer.fixedPrice || (offer.bannerImage && offer.bannerImage.includes('#price=') ? offer.bannerImage.split('#price=')[1] : 199)}
                                                </span>
                                                <span style={{ color: '#B71C1C', fontSize: '0.85rem', fontWeight: 'bold' }}>
                                                    Coupon: {offer.discountType === 'AMOUNT' ? `₹${offer.discountValue} OFF` : `${offer.discountValue}% OFF`}
                                                </span>
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ fontSize: '0.85rem' }}>
                                        {offer.isStatic ? 'Always' : `${new Date(offer.startDate).toLocaleDateString()} → ${new Date(offer.endDate).toLocaleDateString()}`}
                                    </td>
                                    <td>
                                        {offer.isStatic ? (
                                            <span style={{ color: 'green', fontWeight: 'bold' }}>Built-in</span>
                                        ) : (
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={offer.isActive}
                                                    onChange={() => handleToggleActive(offer)}
                                                    style={{ width: '16px', height: '16px', accentColor: '#B71C1C', cursor: 'pointer' }}
                                                />
                                                <span style={{ color: isLive ? 'green' : (offer.isActive ? 'orange' : 'red'), fontWeight: '700', fontSize: '0.8rem' }}>
                                                    {isLive ? '● Live' : offer.isActive ? '○ Scheduled' : '✕ Off'}
                                                </span>
                                            </label>
                                        )}
                                    </td>
                                    <td style={{ display: 'flex', gap: '10px' }}>
                                        <button className="action-btn edit" onClick={() => openEditor(offer)}><i className="fas fa-edit"></i></button>
                                        <button className="action-btn delete" onClick={() => handleDelete(offer._id, offer.isStatic)}><i className="fas fa-trash"></i></button>
                                    </td>
                                </tr>
                            );
                        })}

                        {!loading && offers.length === 0 && (
                            <tr><td colSpan="7" style={{ textAlign: 'center', color: '#999', padding: '30px' }}>
                                No seasonal campaigns created yet. Click "New Offer Campaign" to create one.
                            </td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Editor Modal */}
            {isEditing && (
                <div className="modal-overlay">
                    <div className="modal-content animate-slide-up" style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3 className="section-title">{currentOffer ? 'Edit Seasonal Campaign' : 'Create Seasonal Campaign'}</h3>

                        {saveError && (
                            <div style={{ background: '#ffebee', color: '#c62828', border: '1px solid #ffcdd2', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', fontWeight: '600', fontSize: '0.9rem', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                <i className="fas fa-exclamation-circle" style={{ marginTop: '2px' }}></i>
                                <span>{saveError}</span>
                            </div>
                        )}

                        <form onSubmit={handleSave}>
                            {/* Title */}
                            <div className="form-group">
                                <label>Campaign Title *</label>
                                <input type="text" value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Diwali Dhamaka Offer" required />
                            </div>

                            {/* Description */}
                            <div className="form-group">
                                <label>Short Description</label>
                                <input type="text" value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g. Get 20% off on all Veg Pizzas!" />
                            </div>

                            <div style={{ marginBottom: '15px', padding: '14px', background: '#f8f8f8', borderRadius: '10px', border: '1px solid #eee' }}>
                                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#666', marginBottom: '10px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pricing & Discount Details *</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '15px' }}>
                                    
                                    <div className="form-group">
                                        <label>Original / Marked Price (₹) *</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={formData.fixedPrice}
                                            onChange={e => {
                                                const val = e.target.value.replace(/[^0-9]/g, '');
                                                setFormData({ ...formData, fixedPrice: val, priceMode: 'FIXED' });
                                            }}
                                            placeholder="e.g. 199"
                                        />
                                        <small style={{ color: '#666' }}>This price is shown on the campaign card banner to users.</small>
                                    </div>

                                    <div className="form-group">
                                        <label>Coupon Discount Value *</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={formData.discountValue}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/[^0-9]/g, '');
                                                    setFormData({ ...formData, discountValue: val });
                                                }}
                                                placeholder={formData.discountType === 'PERCENT' ? 'e.g. 20' : 'e.g. 50'}
                                                style={{ flex: 1 }}
                                            />
                                            <select
                                                value={formData.discountType}
                                                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                                style={{ width: '80px', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
                                            >
                                                <option value="PERCENT">% Off</option>
                                                <option value="AMOUNT">₹ Off</option>
                                            </select>
                                        </div>
                                        <small style={{ color: '#666' }}>Applied to user when they enter the promo code at checkout.</small>
                                    </div>

                                </div>
                            </div>

                            {/* Dates */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Start Date {!currentOffer?.isStatic && '*'}</label>
                                    <input type="date" value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })} required={!currentOffer?.isStatic} />
                                </div>
                                <div className="form-group">
                                    <label>End Date {!currentOffer?.isStatic && '*'}</label>
                                    <input type="date" value={formData.endDate}
                                        onChange={e => setFormData({ ...formData, endDate: e.target.value })} required={!currentOffer?.isStatic} />
                                </div>
                            </div>

                            {/* Coupon Code */}
                            <div className="form-group">
                                <label>Promo / Coupon Code <span style={{ color: '#999', fontWeight: '400' }}>(Optional — will be shown to users on homepage)</span></label>
                                <input type="text" value={formData.couponCode}
                                    onChange={e => setFormData({ ...formData, couponCode: e.target.value.toUpperCase().replace(/\s/g, '') })}
                                    placeholder="e.g. HOLI50 or DIWALI20"
                                    style={{ textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700' }} />
                                <small style={{ color: '#2E7D32', fontWeight: '600' }}>
                                    <i className="fas fa-info-circle"></i> If entered, this code will be prominently displayed on the homepage so users can copy and use it at checkout.
                                </small>
                            </div>

                            {/* Banner Images — Two uploads */}
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ fontWeight: '800', fontSize: '0.85rem', color: '#333', display: 'block', marginBottom: '12px' }}>
                                    📸 Campaign Images
                                </label>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

                                    {/* Image 1 — User Panel Card (311×359) */}
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#B71C1C', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            🏠 User Panel Card
                                            <span style={{ color: '#999', fontWeight: '400', marginLeft: '6px' }}>311 × 359 px</span>
                                        </div>
                                        <div
                                            onClick={() => document.getElementById('offer-image-upload').click()}
                                            style={{ border: `2px dashed ${formData.bannerImage ? '#B71C1C' : '#ddd'}`, borderRadius: '10px', padding: '14px', textAlign: 'center', cursor: 'pointer', background: '#fcfcfc', transition: 'border-color 0.2s', minHeight: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#B71C1C'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = formData.bannerImage ? '#B71C1C' : '#ddd'}
                                        >
                                            <input type="file" id="offer-image-upload" style={{ display: 'none' }} accept="image/*" onChange={handleImageUpload} />
                                            {uploadingImage ? (
                                                <><i className="fas fa-spinner fa-spin" style={{ fontSize: '1.6rem', color: '#B71C1C' }}></i><p style={{ margin: 0, fontSize: '0.8rem' }}>Uploading...</p></>
                                            ) : formData.bannerImage ? (
                                                <>
                                                    <img src={getImgSrc(formData.bannerImage.split('#price=')[0])} alt="User card preview"
                                                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                                    <span style={{ fontSize: '0.7rem', color: '#B71C1C', fontWeight: '700' }}>🔄 Click to change</span>
                                                    <button type="button" onClick={e => { e.stopPropagation(); setFormData(p => ({...p, bannerImage: ''})); }}
                                                        style={{ fontSize: '0.7rem', color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕ Remove</button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-image" style={{ fontSize: '1.8rem', color: '#ccc' }}></i>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#555' }}>Upload User Card Image</p>
                                                    <span style={{ fontSize: '0.68rem', color: '#aaa' }}>Required: 311 × 359 px</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Image 2 — TV Strip (509×434) */}
                                    <div>
                                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#1565C0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                            📺 TV Strip Image
                                            <span style={{ color: '#999', fontWeight: '400', marginLeft: '6px' }}>509 × 434 px</span>
                                        </div>
                                        <div
                                            onClick={() => document.getElementById('offer-tv-image-upload').click()}
                                            style={{ border: `2px dashed ${formData.tvImage ? '#1565C0' : '#ddd'}`, borderRadius: '10px', padding: '14px', textAlign: 'center', cursor: 'pointer', background: '#f8fbff', transition: 'border-color 0.2s', minHeight: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = '#1565C0'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = formData.tvImage ? '#1565C0' : '#ddd'}
                                        >
                                            <input type="file" id="offer-tv-image-upload" style={{ display: 'none' }} accept="image/*" onChange={handleTvImageUpload} />
                                            {uploadingTvImage ? (
                                                <><i className="fas fa-spinner fa-spin" style={{ fontSize: '1.6rem', color: '#1565C0' }}></i><p style={{ margin: 0, fontSize: '0.8rem' }}>Uploading...</p></>
                                            ) : formData.tvImage ? (
                                                <>
                                                    <img src={getImgSrc(formData.tvImage)} alt="TV preview"
                                                        style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
                                                    <span style={{ fontSize: '0.7rem', color: '#1565C0', fontWeight: '700' }}>🔄 Click to change</span>
                                                    <button type="button" onClick={e => { e.stopPropagation(); setFormData(p => ({...p, tvImage: ''})); }}
                                                        style={{ fontSize: '0.7rem', color: '#999', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>✕ Remove</button>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-tv" style={{ fontSize: '1.8rem', color: '#ccc' }}></i>
                                                    <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: '700', color: '#555' }}>Upload TV Strip Image</p>
                                                    <span style={{ fontSize: '0.68rem', color: '#aaa' }}>Required: 509 × 434 px</span>
                                                    <span style={{ fontSize: '0.65rem', color: '#bbb' }}>(Uses user card image if empty)</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Enable Toggle */}
                            <div className="form-group">
                                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginTop: '10px', fontWeight: '600' }}>
                                    <input type="checkbox" checked={formData.isActive}
                                        onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                                        style={{ width: '18px', height: '18px', accentColor: '#B71C1C' }} />
                                    Enable Campaign (must also fall within date range to show on homepage)
                                </label>
                            </div>

                            <div className="modal-actions" style={{ marginTop: '20px' }}>
                                <button type="button" className="action-btn" onClick={closeEditor} style={{ padding: '10px 20px' }} disabled={saveLoading}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ padding: '10px 28px' }} disabled={saveLoading}>
                                    {saveLoading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : (currentOffer ? '✅ Update Campaign' : '🚀 Launch Campaign')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OfferManager;
