import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const userInfo = JSON.parse(localStorage.getItem("userInfo"));
                if (!userInfo) {
                    setError("Please login to view order details");
                    setLoading(false);
                    return;
                }

                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || err.message || "Failed to fetch order");
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    if (loading) return <div className="container section-padding"><h2>Loading order details...</h2></div>;
    if (error) return <div className="container section-padding"><h2 style={{ color: 'red' }}>Error: {error}</h2></div>;

    if (!order) {
        return <div className="container section-padding"><h2>Loading order details...</h2></div>;
    }

    return (
        <div className="container section-padding">
            <h1 style={{ marginBottom: '20px', fontSize: '24px' }}>Order Details</h1>
            <div style={{ border: '1px solid #eaeaec', padding: '20px', borderRadius: '8px' }}>
                <div style={{ marginBottom: '20px' }}>
                    <strong>Order ID:</strong> {order.orderId || order._id}
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <strong>Status:</strong> {order.orderStatus}
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}
                </div>

                <h3>Items</h3>
                <div style={{ marginTop: '15px' }}>
                    {order.orderItems.map((item, index) => (
                        <div key={index} style={{ display: 'flex', gap: '20px', marginBottom: '15px', borderBottom: '1px solid #eee', paddingBottom: '15px' }}>
                            <div style={{ width: '80px', height: '100px' }}>
                                <img
                                    src={item.product?.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgZmlsbD0nI2U1ZTVlNSc+PHJlY3Qgd2lkdGg9JzMwMCcgaGVpZ2h0PSczMDAnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZm9udC1zaXplPScyMCcgdGV4dC1hbmNob3I9J21pZGRsZScgZmlsbD0nI2FhYSc+UHJvZHVjdDwvdGV4dD48L3N2Zz4="}
                                    alt={item.product?.name}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={(e) => {
                                        e.target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgZmlsbD0nI2U1ZTVlNSc+PHJlY3Qgd2lkdGg9JzMwMCcgaGVpZ2h0PSczMDAnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZm9udC1zaXplPScyMCcgdGV4dC1hbmNob3I9J21pZGRsZScgZmlsbD0nI2FhYSc+UHJvZHVjdDwvdGV4dD48L3N2Zz4=";
                                    }}
                                />
                            </div>
                            <div>
                                <div style={{ fontWeight: 'bold' }}>{item.product?.brand}</div>
                                <div>{item.product?.name}</div>
                                <div style={{ fontSize: '14px', color: '#555' }}>Size: {item.size} | Qty: {item.quantity}</div>
                                <div style={{ fontWeight: 'bold' }}>₹{item.product?.price}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '20px', fontSize: '18px', fontWeight: 'bold', textAlign: 'right' }}>
                    Total: ₹{order.totalPrice}
                </div>

                <button
                    onClick={() => navigate(`/track-order?orderId=${order._id}`)}
                    style={{
                        marginTop: '20px',
                        padding: '12px 25px',
                        backgroundColor: '#ff3f6c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        display: 'inline-block'
                    }}
                >
                    Track My Order
                </button>
            </div>
        </div>
    );
};

export default OrderDetails;
