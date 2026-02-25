import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import ImageLoader from '../components/ImageLoader';

const Orders = () => {
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));

                if (!userInfo) {
                    setError("Please login to view orders");
                    setLoading(false);
                    return;
                }

                // api service intercepts and adds token, so we can just call /orders
                // Backend expects userId possibly, but usually it gets it from token.
                // Looking at original code: /api/orders?userId=${userInfo._id}
                // Let's keep the query param if backend uses it, but use api.get
                const response = await api.get(`/orders?userId=${userInfo._id}`);

                setOrders(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch orders");
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const handleCancel = async (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order?")) {
            try {
                await api.put(`/orders/${orderId}/cancel`);
                setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: 'Cancelled' } : o));
                alert("Order cancelled successfully");
            } catch (error) {
                alert(error.response?.data?.message || "Failed to cancel order");
            }
        }
    };

    const handleRemoveOrder = async (orderId) => {
        try {
            const confirmDelete = window.confirm("Remove this order permanently from your history?");
            if (!confirmDelete) return;

            await api.delete(`/orders/${orderId}`);
            setOrders(prev => prev.filter(order => order._id !== orderId));
        } catch (error) {
            console.error(error);
            alert("Failed to remove order");
        }
    };


    if (loading) return <div className="container section-padding"><h2>Loading orders...</h2></div>;
    if (error) return (
        <div className="container section-padding" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'red' }}>{error}</h2>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none', padding: '10px 20px' }}>Login</Link>
        </div>
    );

    return (
        <div className="container section-padding" style={{ position: 'relative', minHeight: '80vh' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '24px', fontWeight: '700' }}>MY ORDERS ({orders.length})</h1>

            {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <h2 style={{ fontSize: '24px', color: '#282c3f', marginBottom: '10px' }}>No orders found</h2>
                    <p style={{ color: '#535766', marginBottom: '30px' }}>Looks like you haven't placed any orders yet.</p>
                    <Link to="/" className="btn btn-primary" style={{ padding: '15px 40px', display: 'inline-block', textDecoration: 'none', fontWeight: '700' }}>START SHOPPING</Link>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    {orders.map((order) => (
                        <div key={order._id} style={{
                            border: '1px solid #eaeaec',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            marginBottom: '30px',
                            overflow: 'hidden',
                            padding: '20px'
                        }}>
                            {order.orderItems.map((item, index) => (
                                <div key={index} style={{
                                    borderBottom: index !== order.orderItems.length - 1 ? '1px solid #f0f0f0' : 'none',
                                    paddingBottom: index !== order.orderItems.length - 1 ? '20px' : '0',
                                    marginBottom: index !== order.orderItems.length - 1 ? '20px' : '0'
                                }}>
                                    {/* CONSOLIDATED 2-COLUMN LAYOUT */}
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '20px 30px', // Tight horizontal gap
                                        alignItems: 'flex-start',
                                        width: '100%'
                                    }}>
                                        {/* LEFT COLUMN: PRODUCT SECTION (Narrow & Under Image) */}
                                        <div style={{ width: '180px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'left' }}>
                                            {/* 1. Image (Top) */}
                                            <div style={{
                                                width: '120px',
                                                height: '150px',
                                                backgroundColor: '#f9f9f9',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                border: '1px solid #f5f5f6'
                                            }}>
                                                <ImageLoader
                                                    src={item.product?.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgZmlsbD0nI2U1ZTVlNSc+PHJlY3Qgd2lkdGg9JzMwMCcgaGVpZ2h0PSczMDAnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZm9udC1zaXplPScyMCcgdGV4dC1hbmNob3I9J21pZGRsZScgZmlsbD0nI2FhYSc+UHJvZHVjdDwvdGV4dD48L3N2Zz4="}
                                                    alt={item.product?.name || 'Product'}
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </div>
                                            {/* 2. Name */}
                                            <Link to={`/product/${item.product?._id}`} style={{
                                                textDecoration: 'none',
                                                color: '#282c3f',
                                                fontWeight: '700',
                                                fontSize: '15px',
                                                lineHeight: '1.4'
                                            }}>
                                                {item.product?.name}
                                            </Link>

                                            {/* 3. Specs Row: Price, Size, Qty on one line */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexWrap: 'wrap',
                                                gap: '8px',
                                                fontSize: '14px',
                                                color: '#282c3f'
                                            }}>
                                                <span style={{ fontWeight: '700' }}>₹{item.price || item.product?.price || '930'}</span>
                                                <span style={{ color: '#d4d5d9' }}>|</span>
                                                <span style={{ color: '#535766' }}>Size: <span style={{ fontWeight: '600' }}>{item.size}</span></span>
                                                <span style={{ color: '#d4d5d9' }}>|</span>
                                                <span style={{ color: '#535766' }}>Qty: <span style={{ fontWeight: '600' }}>{item.quantity}</span></span>
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN: INFO + BUTTONS CONSOLIDATED */}
                                        <div style={{ flex: '1 1 auto', minWidth: '250px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                            {/* Metadata Info: Each row is a flex container to ensure strict proximity */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '14px' }}>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <span style={{ color: '#94969f', fontWeight: '500' }}>Order ID:</span>
                                                    <span style={{ fontWeight: '600', color: '#282c3f' }}>#{order.orderId || order._id.slice(-8).toUpperCase()}</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <span style={{ color: '#94969f', fontWeight: '500' }}>Order Date:</span>
                                                    <span style={{ fontWeight: '600', color: '#282c3f' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <span style={{ color: '#94969f', fontWeight: '500' }}>Payment:</span>
                                                    <span style={{ fontWeight: '600', color: '#282c3f' }}>{order.paymentMethod || 'UPI/Card'}</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <span style={{ color: '#94969f', fontWeight: '500' }}>Status:</span>
                                                    <span style={{
                                                        fontWeight: '700',
                                                        color: order.orderStatus === 'Delivered' ? '#03a685' : '#ff3e6c',
                                                        textTransform: 'uppercase'
                                                    }}>{order.orderStatus}</span>
                                                </div>

                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <span style={{ color: '#94969f', fontWeight: '500' }}>Address:</span>
                                                    <span style={{ fontWeight: '600', color: '#282c3f' }}>{order.shippingAddress?.city || 'Chennai'}, India</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons Directly Under Details */}
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <Link to={`/track-order?orderId=${order._id}`} style={{
                                                    textDecoration: 'none',
                                                    backgroundColor: '#282c3f',
                                                    color: '#fff',
                                                    fontWeight: '700',
                                                    fontSize: '11px',
                                                    padding: '8px 18px',
                                                    borderRadius: '4px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Track
                                                </Link>

                                                {(order.orderStatus === 'Placed' || order.orderStatus === 'Processing') && (
                                                    <button
                                                        onClick={() => handleCancel(order._id)}
                                                        style={{
                                                            backgroundColor: '#ff3e6c',
                                                            color: '#fff',
                                                            border: 'none',
                                                            fontWeight: '700',
                                                            cursor: 'pointer',
                                                            fontSize: '11px',
                                                            padding: '8px 18px',
                                                            borderRadius: '4px',
                                                            textTransform: 'uppercase'
                                                        }}
                                                    >
                                                        Cancel
                                                    </button>
                                                )}

                                                <Link to={`/product/${item.product?._id}`} style={{
                                                    textDecoration: 'none',
                                                    color: '#ff3e6c',
                                                    fontWeight: '700',
                                                    fontSize: '11px',
                                                    border: '1px solid #ff3e6c',
                                                    padding: '8px 18px',
                                                    borderRadius: '4px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    Buy Again
                                                </Link>

                                                {/* Return Logic */}
                                                {order.orderStatus === 'Delivered' && order.returnEligible && order.returnStatus === 'None' && (!order.returnWindowExpiresAt || new Date() < new Date(order.returnWindowExpiresAt)) && (
                                                    <Link to={`/return-order/${order._id}`} style={{
                                                        textDecoration: 'none',
                                                        color: '#282c3f',
                                                        fontWeight: '700',
                                                        fontSize: '11px',
                                                        border: '1px solid #282c3f',
                                                        padding: '8px 18px',
                                                        borderRadius: '4px',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        Return
                                                    </Link>
                                                )}

                                                {order.returnStatus !== 'None' && (
                                                    <div style={{
                                                        fontSize: '11px',
                                                        fontWeight: '800',
                                                        color: order.returnStatus === 'Rejected' ? '#ff3e6c' : '#03a685',
                                                        textTransform: 'uppercase',
                                                        padding: '8px 12px',
                                                        backgroundColor: '#f5f5f6',
                                                        borderRadius: '4px',
                                                        border: `1px solid ${order.returnStatus === 'Rejected' ? '#ff3e6c' : '#03a685'}`
                                                    }}>
                                                        Return {order.returnStatus}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;
