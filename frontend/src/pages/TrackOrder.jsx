import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

const TrackOrder = () => {
    const [searchParams] = useSearchParams();
    const queryOrderId = searchParams.get('orderId');

    const [orderId, setOrderId] = useState(queryOrderId || '');
    const [order, setOrder] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Review Management State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [reviewSubmitting, setReviewSubmitting] = useState(false);

    // Store user's existing reviews for products in this order
    const [userReviews, setUserReviews] = useState({});
    const [isEditingMetadata, setIsEditingMetadata] = useState(null);

    useEffect(() => {
        if (queryOrderId) {
            handleTrack(null, queryOrderId);
        }
    }, [queryOrderId]);

    useEffect(() => {
        if (order && order.orderItems) {
            fetchUserReviewsForOrder();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [order]);

    const fetchUserReviewsForOrder = async () => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        if (!userInfo) return;

        const reviewsMap = {};

        await Promise.all(order.orderItems.map(async (item) => {
            if (!item.product?._id) return;
            try {
                const { data } = await axios.get(`https://ecommerce-vwsy.onrender.com/products/${item.product._id}`);
                const product = data || {};

                const reviews = Array.isArray(product.reviews) ? product.reviews : [];

                const userReview = reviews.find(
                    r => r.user === userInfo._id || r.user?._id === userInfo._id
                );
                if (userReview) {
                    reviewsMap[item.product._id] = userReview;
                }
            } catch (err) {
                console.error("Failed to fetch product details for review check", err);
            }
        }));

        setUserReviews(reviewsMap);
    };

    const handleTrack = async (e, idOverride) => {
        if (e) e.preventDefault();
        let idToTrack = idOverride || orderId;

        // Sanitize: strip leading # if present
        if (typeof idToTrack === 'string' && idToTrack.startsWith('#')) {
            idToTrack = idToTrack.substring(1);
        }

        if (!idToTrack) return;

        setLoading(true);
        setError(null);
        setOrder(null);

        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            const config = userInfo ? { headers: { Authorization: `Bearer ${userInfo.token}` } } : {};

            const { data } = await axios.get(`https://ecommerce-vwsy.onrender.com/api/orders/${idToTrack}`, config);
            setOrder(data);

        } catch (err) {
            setError("Order not found or access denied.");
        } finally {
            setLoading(false);
        }
    };

    const getStepStatus = (step) => {
        const statuses = ['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
        let currentStatus = order?.orderStatus || 'Placed';

        // Handle legacy status strings
        if (currentStatus === 'Order Placed') currentStatus = 'Placed';

        const currentIndex = statuses.indexOf(currentStatus);
        const stepIndex = statuses.indexOf(step);

        if (currentStatus === 'Cancelled') return 'cancelled';
        return stepIndex <= currentIndex ? 'completed' : 'pending';
    };

    const handleOpenReviewModal = (item, existingReview = null) => {
        setSelectedProduct(item.product);
        setReviewModalOpen(true);

        if (existingReview) {
            setRating(existingReview.rating);
            setComment(existingReview.comment);
            setIsEditingMetadata(existingReview);
        } else {
            setRating(5);
            setComment('');
            setIsEditingMetadata(null);
        }
    };

    const handleDeleteReview = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        try {
            await axios.delete(`https://ecommerce-vwsy.onrender.com/products/${productId}/reviews`, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });

            alert("Review deleted.");
            fetchUserReviewsForOrder();

        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete review");
        }
    };

    const handleSubmitReview = async () => {
        if (!selectedProduct) return;
        setReviewSubmitting(true);
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        try {
            if (isEditingMetadata) {
                await axios.put(`https://ecommerce-vwsy.onrender.com/products/${selectedProduct._id}/reviews`, {
                    rating,
                    comment
                }, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                alert('Review updated successfully!');
            } else {
                await axios.post(`https://ecommerce-vwsy.onrender.com/products/${selectedProduct._id}/reviews`, {
                    rating,
                    comment
                }, {
                    headers: { Authorization: `Bearer ${userInfo.token}` }
                });
                alert('Review submitted successfully!');
            }

            setReviewModalOpen(false);
            fetchUserReviewsForOrder();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to save review.");
        } finally {
            setReviewSubmitting(false);
        }
    };

    const handleUpdateStatus = async (newStatus) => {
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        try {
            await axios.put(`https://ecommerce-vwsy.onrender.com/api/orders/${order._id}/status`, {
                status: newStatus
            }, {
                headers: { Authorization: `Bearer ${userInfo.token}` }
            });
            handleTrack(null, order.orderId || order._id);
            alert(`Status updated to ${newStatus}`);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to update status");
        }
    };

    return (
        <div className="track-container section-padding">
            <h1 style={{ marginBottom: '20px', fontWeight: '800', textAlign: 'center', fontSize: '28px', color: '#282c3f', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TRACK YOUR ORDER</h1>

            {order && (
                <div>
                    <div style={{ borderBottom: '1px solid #eee', paddingBottom: '15px', marginBottom: '15px', textAlign: 'center' }}>
                        {order.isCancelled ? (
                            <div style={{ backgroundColor: '#ffebe6', padding: '15px', borderRadius: '8px', border: '1px solid #ff3f6c', display: 'inline-block' }}>
                                <h2 style={{ color: '#ff3f6c', margin: 0, fontSize: '18px' }}>Order Cancelled</h2>
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#333', marginBottom: '5px' }}>
                                    {order.orderStatus === 'Delivered' ? 'Delivered' : `Arriving soon`}
                                </div>
                                <div style={{ color: '#03a685', fontWeight: '700', fontSize: '16px' }}>
                                    Estimated Delivery: {new Date(new Date(order.createdAt).setDate(new Date(order.createdAt).getDate() + 7)).toLocaleDateString()}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Admin Actions */}
                    {JSON.parse(localStorage.getItem("userInfo"))?.isAdmin && (
                        <div style={{ backgroundColor: '#f5f5f6', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px dashed #282c3f' }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#282c3f', fontWeight: '800', textTransform: 'uppercase' }}>Admin Actions: Update Progress</h4>
                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                {['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => handleUpdateStatus(s)}
                                        style={{
                                            padding: '8px 12px',
                                            backgroundColor: order.orderStatus === s ? '#282c3f' : '#fff',
                                            color: order.orderStatus === s ? '#fff' : '#282c3f',
                                            border: '1px solid #282c3f',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '700',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {s.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="tracking-wrapper">
                        {['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'].map((step, index) => {
                            const status = getStepStatus(step);
                            const isCompleted = status === 'completed';

                            return (
                                <div key={step} className="tracking-step">
                                    {index < 4 && (
                                        <div className={`tracking-line ${getStepStatus(['Placed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'][index + 1]) === 'completed' ? 'completed' : ''}`} />
                                    )}

                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        backgroundColor: isCompleted ? '#03a685' : '#fff',
                                        border: `3px solid ${isCompleted ? '#03a685' : '#eaeaec'}`,
                                        marginBottom: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '18px',
                                        color: isCompleted ? '#fff' : '#ccc',
                                        fontWeight: 'bold',
                                        transition: 'all 0.3s ease',
                                        flexShrink: 0
                                    }}>
                                        {isCompleted ? '✓' : index + 1}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: isCompleted ? '700' : '500', color: isCompleted ? '#03a685' : '#777', textAlign: 'center' }}>
                                        {step}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="track-grid">
                        <div style={{ padding: '15px', backgroundColor: '#f9f9fa', border: '1px solid #eaeaec', borderRadius: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#535766', textTransform: 'uppercase' }}>Shipping Address</h4>
                            <div style={{ fontSize: '14px', color: '#282c3f', lineHeight: '1.5', fontWeight: '500' }}>
                                <p style={{ fontWeight: '700', marginBottom: '2px' }}>{order.address?.fullName}</p>
                                <p>{order.address?.addressLine}</p>
                                <p>{order.address?.city}, {order.address?.state} - {order.address?.pincode}</p>
                                <p style={{ marginTop: '5px' }}>Phone: <b>{order.address?.phone}</b></p>
                            </div>
                        </div>

                        <div style={{ padding: '15px', backgroundColor: '#f9f9fa', border: '1px solid #eaeaec', borderRadius: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '10px', color: '#535766', textTransform: 'uppercase' }}>Order Details</h4>
                            <div style={{ fontSize: '14px', color: '#282c3f', lineHeight: '1.6', fontWeight: '500' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#535766' }}>ID:</span>
                                    <span style={{ fontWeight: '600' }}>{order.orderId || order._id}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ color: '#535766' }}>Date:</span>
                                    <span style={{ fontWeight: '600' }}>{new Date(order.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                                    <span style={{ color: '#535766', fontWeight: '700' }}>Total:</span>
                                    <span style={{ fontWeight: '800', color: '#ff3f6c', fontSize: '16px' }}>₹{order.totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {order.orderItems && order.orderItems.length > 0 && (
                        <div style={{ marginTop: '30px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#282c3f', textTransform: 'uppercase' }}>Items in this Order</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0', border: '1px solid #eaeaec', borderRadius: '8px', overflow: 'hidden' }}>
                                {order.orderItems.map((item, idx) => {
                                    const existingReview = userReviews[item.product?._id];
                                    return (
                                        <div key={idx} className="track-item-card">
                                            <div style={{ width: '60px', height: '80px', flexShrink: 0, borderRadius: '4px', overflow: 'hidden', backgroundColor: '#f5f5f6' }}>
                                                <img
                                                    src={item.product?.image || "https://via.placeholder.com/150"}
                                                    alt={item.product?.name}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>

                                            <div className="track-item-info" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <div style={{ fontSize: '16px', fontWeight: '700', color: '#282c3f', marginBottom: '4px', lineHeight: '1.2' }}>
                                                    {item.product?.brand}
                                                </div>
                                                <div style={{ fontSize: '14px', color: '#535766', marginBottom: '4px' }}>
                                                    {item.product?.name}
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#7e818c' }}>
                                                    Size: {item.size} | Qty: {item.quantity || 1}
                                                </div>
                                                <div style={{ fontSize: '15px', fontWeight: '700', color: '#282c3f', marginTop: '5px' }}>₹{item.product?.price}</div>
                                            </div>

                                            <div className="track-item-actions" style={{ width: '140px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                                                {existingReview ? (
                                                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                                                        <div style={{ fontSize: '13px', color: '#03a685', fontWeight: '700' }}>
                                                            ★ {existingReview.rating}/5
                                                        </div>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button
                                                                onClick={() => handleOpenReviewModal(item, existingReview)}
                                                                style={{ padding: '6px 12px', background: 'none', border: '1px solid #282c3f', color: '#282c3f', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase' }}>
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteReview(item.product._id)}
                                                                style={{ padding: '6px 12px', background: 'none', border: '1px solid #ff3f6c', color: '#ff3f6c', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '11px', textTransform: 'uppercase' }}>
                                                                Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenReviewModal(item)}
                                                        style={{
                                                            padding: '8px 16px',
                                                            backgroundColor: '#ff3e6c',
                                                            color: '#fff',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            fontSize: '12px',
                                                            textTransform: 'uppercase'
                                                        }}>
                                                        Write Review
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {reviewModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
                    backdropFilter: 'blur(2px)'
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '40px', borderRadius: '12px', width: '90%', maxWidth: '550px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
                    }}>
                        <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '30px', color: '#282c3f' }}>
                            {isEditingMetadata ? 'Edit Review' : 'Write Review'}
                        </h2>
                        <p style={{ marginBottom: '20px', color: '#555', fontSize: '16px' }}>
                            For <b>{selectedProduct?.name}</b>
                        </p>

                        <div style={{ marginBottom: '25px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: '#535766' }}>Rating</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                {[1, 2, 3, 4, 5].map(star => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        style={{
                                            fontSize: '32px',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: star <= rating ? '#ff3f6c' : '#eaeaec',
                                            transition: 'color 0.2s'
                                        }}
                                    >
                                        ★
                                    </button>
                                ))}
                                <span style={{ alignSelf: 'center', marginLeft: '10px', fontWeight: 'bold', color: '#333' }}>
                                    {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
                                </span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '30px' }}>
                            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', color: '#535766' }}>Your Review</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="5"
                                placeholder="What did you like or dislike? What is the quality like?"
                                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '16px', resize: 'vertical' }}
                            ></textarea>
                        </div>

                        <div style={{ display: 'flex', gap: '20px', justifyContent: 'flex-end' }}>
                            <button
                                onClick={() => setReviewModalOpen(false)}
                                style={{ padding: '12px 30px', backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: '#333' }}
                            >
                                CANCEL
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={reviewSubmitting}
                                style={{ padding: '12px 40px', backgroundColor: '#ff3f6c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', opacity: reviewSubmitting ? 0.7 : 1, boxShadow: '0 4px 8px rgba(255, 62, 108, 0.3)' }}
                            >
                                {reviewSubmitting ? 'SUBMITTING...' : (isEditingMetadata ? 'UPDATE REVIEW' : 'SUBMIT REVIEW')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrackOrder;
