import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [paymentMethod, setPaymentMethod] = useState("COD");
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // Dynamic fields
    const [upiId, setUpiId] = useState("");
    const [cardDetails, setCardDetails] = useState({
        number: "",
        expiry: "",
        cvv: ""
    });

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    const address = location.state?.address;
    const couponCode = location.state?.couponCode;

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
        } else if (!address) {
            navigate('/checkout');
        }
    }, [userInfo, address, navigate]);

    const validatePayment = () => {
        if (paymentMethod === "UPI") {
            const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+$/;
            if (!upiRegex.test(upiId)) {
                alert("Invalid UPI ID");
                return false;
            }
        }
        if (paymentMethod === "Card") {
            if (!/^\d{16}$/.test(cardDetails.number)) {
                alert("Card number must be 16 digits");
                return false;
            }
            if (!/^\d{3}$/.test(cardDetails.cvv)) {
                alert("CVV must be 3 digits");
                return false;
            }
            if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry)) {
                alert("Expiry must be MM/YY");
                return false;
            }
        }
        return true;
    };

    const handleInitialSubmit = () => {
        if (validatePayment()) {
            setShowModal(true);
        }
    };

    const handlePlaceOrder = async () => {
        try {
            setLoading(true);
            const response = await axios.post(
                "http://localhost:5000/api/orders/place",
                {
                    userId: userInfo._id,
                    address: {
                        ...address,
                        addressLine: address.addressLine1 + (address.addressLine2 ? `, ${address.addressLine2}` : ""),
                        pincode: address.postalCode
                    },
                    paymentMethod,
                    couponCode,
                    paymentDetails: {
                        method: paymentMethod,
                        upiId: paymentMethod === "UPI" ? upiId : undefined,
                        cardLast4: paymentMethod === "Card" ? cardDetails.number.slice(-4) : undefined
                    }
                }
            );

            // alert("Payment successful, order placed");
            // alert("Payment successful, order placed");
            // Navigate to dynamic order details route
            const orderId = response.data._id || (response.data.order && response.data.order._id);
            if (orderId) {
                navigate(`/track-order?orderId=${orderId}`);
            } else {
                navigate("/orders");
            }
        } catch (error) {
            console.error("Order placement error:", error);
            alert("Failed to place order");
        } finally {
            setLoading(false);
            setShowModal(false);
        }
    };

    return (
        <div className="container section-padding">
            <h1 className="page-title">PAYMENT</h1>

            <div className="payment-grid">
                {/* LEFT: Payment Methods */}
                <div className="section-card">
                    <h3 className="section-card-title">Choose Payment Mode</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                        {/* UPI Option */}
                        <div className="payment-method-item">
                            <label className="payment-method-label">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="UPI"
                                    checked={paymentMethod === "UPI"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="payment-radio"
                                />
                                <span className="payment-method-text">UPI (Google Pay, PhonePe, Paytm)</span>
                            </label>
                            {paymentMethod === "UPI" && (
                                <div style={{ padding: '0 15px 15px 50px' }}>
                                    <input
                                        type="text"
                                        placeholder="Enter UPI ID (e.g. name@upi)"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="responsive-input"
                                    />
                                    <p style={{ fontSize: '14px', color: '#94969f', marginTop: '10px' }}>A payment request will be sent to this UPI ID.</p>
                                </div>
                            )}
                        </div>

                        {/* Card Option */}
                        <div className="payment-method-item">
                            <label className="payment-method-label">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="Card"
                                    checked={paymentMethod === "Card"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="payment-radio"
                                />
                                <span className="payment-method-text">Credit / Debit Card</span>
                            </label>
                            {paymentMethod === "Card" && (
                                <div style={{ padding: '0 15px 15px 50px' }}>
                                    <input
                                        type="text"
                                        placeholder="Card Number"
                                        maxLength="16"
                                        value={cardDetails.number}
                                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                                        className="responsive-input"
                                        style={{ marginBottom: '15px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <input
                                            type="text"
                                            placeholder="MM/YY"
                                            value={cardDetails.expiry}
                                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                                            className="responsive-input"
                                        />
                                        <input
                                            type="text"
                                            placeholder="CVV"
                                            maxLength="3"
                                            value={cardDetails.cvv}
                                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                                            className="responsive-input"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* COD Option */}
                        <div className="payment-method-item">
                            <label className="payment-method-label">
                                <input
                                    type="radio"
                                    name="payment"
                                    value="COD"
                                    checked={paymentMethod === "COD"}
                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                    className="payment-radio"
                                />
                                <span className="payment-method-text">Cash on Delivery (COD)</span>
                            </label>
                        </div>
                    </div>

                    <div style={{ marginTop: '50px' }}>
                        <button
                            onClick={handleInitialSubmit}
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '15px', fontSize: '18px', fontWeight: '900', letterSpacing: '1px', textTransform: 'uppercase' }}
                        >
                            PAY NOW
                        </button>
                    </div>
                </div>

                {/* RIGHT: Order Summary (Wider & Bigger) */}
                <div className="section-card">
                    <h3 className="section-card-title">Order Summary</h3>

                    <div style={{ maxHeight: '700px', overflowY: 'auto' }}>
                        {location.state?.cartItems?.map(item => (
                            <div key={item.product._id} className="order-item-row" style={{ display: 'flex', gap: '20px', marginBottom: '20px', borderBottom: '1px solid #f0f0f0', paddingBottom: '20px' }}>
                                <div style={{ width: '120px', height: '150px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', border: '1px solid #eee' }}>
                                    <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                                    <div style={{ fontWeight: '800', fontSize: '18px', marginBottom: '5px' }}>{item.product.brand}</div>
                                    <div style={{ fontSize: '16px', color: '#555', marginBottom: '5px' }}>{item.product.name}</div>
                                    <div style={{ fontSize: '14px', marginBottom: '10px' }}>Qty: <b>{item.quantity}</b> | Size: <b>{item.size}</b></div>
                                    <div style={{ fontWeight: '800', fontSize: '20px', color: '#282c3f' }}>₹{item.product.price}</div>
                                </div>
                            </div>
                        )) || <div style={{ fontSize: '18px', color: '#888' }}>Loading items...</div>}
                    </div>

                    <div className="summary-total-row">
                        <span>Total Amount</span>
                        <span>₹{location.state?.finalAmount?.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            {
                showModal && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', maxWidth: '400px', width: '90%' }}>
                            <h3 style={{ marginBottom: '20px', fontWeight: 'bold' }}>Confirm Order</h3>
                            <div style={{ marginBottom: '15px' }}>
                                <strong>Address:</strong>
                                <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#535766', margin: '5px 0 0 0' }}>
                                    <span style={{ fontWeight: '700', color: '#282c3f' }}>{address?.fullName}</span><br />
                                    {address?.addressLine1}{address?.addressLine2 ? `, ${address?.addressLine2}` : ''}<br />
                                    {address?.city}, {address?.state} - {address?.postalCode}<br />
                                    <strong>Phone:</strong> {address?.phone}
                                </p>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <strong>Payment Method:</strong>
                                <p style={{ margin: '5px 0 0 0', color: '#535766' }}>{paymentMethod}</p>
                                {paymentMethod === 'UPI' && <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{upiId}</p>}
                                {paymentMethod === 'Card' && <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>Card ending in {cardDetails.number.slice(-4)}</p>}
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <button
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', background: '#f9f9f9', cursor: 'pointer', color: '#333', fontWeight: 'bold' }}
                                >
                                    CANCEL
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    className="btn btn-primary"
                                    disabled={loading}
                                    style={{ flex: 1, padding: '12px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    {loading ? "Placing..." : "Confirm Order"}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Payment;
