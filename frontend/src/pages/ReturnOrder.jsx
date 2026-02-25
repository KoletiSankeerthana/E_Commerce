import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';

const ReturnOrder = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [returnReason, setReturnReason] = useState('Size not fit');
    const [returnDescription, setReturnDescription] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await api.get(`/orders/${id}`);
                setOrder(data);

                // Check if already returned or ineligible
                if (data.returnStatus !== 'None') {
                    setError("A return has already been requested for this order.");
                } else if (!data.returnEligible) {
                    setError("This order is not eligible for return.");
                } else if (data.orderStatus !== 'Delivered') {
                    setError("Only delivered orders can be returned.");
                } else if (data.returnWindowExpiresAt && new Date() > new Date(data.returnWindowExpiresAt)) {
                    setError("The 7-day return window for this order has expired.");
                }

                setLoading(false);
            } catch (err) {
                setError("Failed to fetch order details.");
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitLoading(true);
            await api.put(`/orders/${id}/request-return`, {
                returnReason,
                returnDescription
            });
            alert("Return request submitted successfully!");
            navigate('/orders');
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit return request.");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) return <div className="container section-padding"><h2>Loading order details...</h2></div>;

    if (error) return (
        <div className="container section-padding" style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: '#fff5f5', padding: '40px', borderRadius: '12px', border: '1px solid #ff3f6c', display: 'inline-block' }}>
                <h2 style={{ color: '#ff3f6c', marginBottom: '20px' }}>{error}</h2>
                <button
                    onClick={() => navigate('/orders')}
                    className="btn btn-primary"
                    style={{ padding: '12px 30px', fontWeight: '700' }}
                >
                    BACK TO ORDERS
                </button>
            </div>
        </div>
    );

    return (
        <div className="container section-padding" style={{ maxWidth: '800px' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '24px', fontWeight: '800', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '1px' }}>Request Return</h1>

            <div style={{ backgroundColor: '#fff', border: '1px solid #eaeaec', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>

                {/* Order Summary Mini-View */}
                <div style={{ paddingBottom: '25px', marginBottom: '25px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <div style={{ color: '#94969f', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Order ID</div>
                        <div style={{ fontWeight: '800', fontSize: '18px', color: '#282c3f' }}>#{order.orderId || order._id.slice(-8).toUpperCase()}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ color: '#94969f', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '4px' }}>Total Amount</div>
                        <div style={{ fontWeight: '800', fontSize: '18px', color: '#ff3f6c' }}>₹{order.totalPrice}</div>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '25px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: '#535766', textTransform: 'uppercase' }}>Reason for Return</label>
                        <select
                            value={returnReason}
                            onChange={(e) => setReturnReason(e.target.value)}
                            required
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '16px',
                                border: '1px solid #d4d5d9',
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <option value="Size not fit">Size not fit</option>
                            <option value="Color not as expected">Color not as expected</option>
                            <option value="Defect in product">Defect in product</option>
                            <option value="Quality not as expected">Quality not as expected</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontSize: '14px', fontWeight: '700', color: '#535766', textTransform: 'uppercase' }}>Additional Details (Optional)</label>
                        <textarea
                            value={returnDescription}
                            onChange={(e) => setReturnDescription(e.target.value)}
                            placeholder="Please provide any additional information to help us process your return faster..."
                            rows="5"
                            style={{
                                width: '100%',
                                padding: '15px',
                                fontSize: '16px',
                                border: '1px solid #d4d5d9',
                                borderRadius: '8px',
                                fontFamily: 'inherit',
                                outline: 'none',
                                resize: 'vertical'
                            }}
                        ></textarea>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginTop: '40px' }}>
                        <button
                            type="button"
                            onClick={() => navigate('/orders')}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: '1px solid #d4d5d9',
                                borderRadius: '8px',
                                background: '#fff',
                                fontWeight: '700',
                                color: '#282c3f',
                                cursor: 'pointer'
                            }}
                        >
                            CANCEL
                        </button>
                        <button
                            type="submit"
                            disabled={submitLoading}
                            style={{
                                flex: 1,
                                padding: '15px',
                                border: 'none',
                                borderRadius: '8px',
                                background: '#ff3f6c',
                                color: '#fff',
                                fontWeight: '800',
                                cursor: 'pointer',
                                opacity: submitLoading ? 0.7 : 1,
                                boxShadow: '0 4px 12px rgba(255, 63, 108, 0.2)'
                            }}
                        >
                            {submitLoading ? 'SUBMITTING...' : 'CONFIRM RETURN'}
                        </button>
                    </div>
                </form>
            </div>

            <p style={{ marginTop: '30px', textAlign: 'center', color: '#7e818c', fontSize: '14px' }}>
                * Your return request will be reviewed by our team. Refund will be processed upon successful pickup and quality check.
            </p>
        </div>
    );
};

export default ReturnOrder;
