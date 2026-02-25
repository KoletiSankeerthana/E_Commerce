import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../services/api';

const Checkout = () => {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // New Address State
    const [newAddress, setNewAddress] = useState({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        addressType: 'Home'
    });

    const [couponCode, setCouponCode] = useState("");
    const [discount, setDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState("");

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    useEffect(() => {
        if (!userInfo) {
            navigate('/login');
            return;
        }
        fetchCart();
        fetchAddresses();
    }, [userInfo, navigate]);

    const fetchCart = async () => {
        try {
            const response = await api.get(`/cart?userId=${userInfo._id}`);
            setCartItems(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching cart:", error);
            setLoading(false);
        }
    };

    const fetchAddresses = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            // Now using the new GET route
            const { data } = await api.get('/users/address', config);
            setAddresses(data);
        } catch (error) {
            console.log("Error fetching addresses", error);
        }
    };

    const handleApplyCoupon = () => {
        if (couponCode === "WELCOME20") {
            setDiscount(0.20);
            setAppliedCoupon("WELCOME20");
            alert("Coupon Applied! 20% discount.");
        } else {
            setDiscount(0);
            setAppliedCoupon("");
            alert("Invalid or Expired Coupon Code");
        }
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setNewAddress(prev => ({ ...prev, [name]: value }));
    };

    const saveAddress = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data } = await api.post('/users/address', newAddress, config);
            setAddresses(data); // Expecting updated list
            setShowAddForm(false);
            // Auto Select latest
            if (data.length > 0) setSelectedAddressId(data[data.length - 1]._id);
        } catch (error) {
            alert("Error saving address");
            console.error(error);
        }
    };

    const deleteAddress = async (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${userInfo.token}`,
                    },
                };
                const { data } = await api.delete(`/users/address/${id}`, config);
                setAddresses(data);
                if (selectedAddressId === id) setSelectedAddressId(null);
            } catch (error) {
                alert("Error deleting address");
            }
        }
    };

    const handlePlaceOrder = () => {
        if (!selectedAddressId) {
            alert("Please select a delivery address");
            return;
        }
        const selectedAddr = addresses.find(a => a._id === selectedAddressId);
        navigate('/payment', {
            state: {
                address: selectedAddr,
                couponCode: appliedCoupon,
                finalAmount: totalPrice,
                cartItems: cartItems // Pass items for summary
            }
        });
    };

    // --- Totals Calculation ---
    console.log("CartItems value:", cartItems);
    console.log("Is cartItems an array:", Array.isArray(cartItems));
    const subTotal = Array.isArray(cartItems)
        ? cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
        : 0;
    const discountAmount = subTotal * discount;

    // Fee Logic
    const CONVENIENCE_FEE = 15;
    const SHIPPING_FEE = subTotal < 1000 ? 100 : 0;

    const totalPrice = subTotal - discountAmount + CONVENIENCE_FEE + SHIPPING_FEE;

    if (loading) return <div className="container section-padding"><h2>Loading checkout...</h2></div>;

    return (
        <div className="container section-padding">
            <h1 className="page-title">CHECKOUT</h1>

            <div className="checkout-container checkout-grid">
                {/* Left Side: Address Management */}
                <div className="checkout-left">
                    <h3 className="section-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Select Delivery Address
                        {!showAddForm && (
                            <button onClick={() => setShowAddForm(true)} style={{ color: '#ff3e6c', background: 'none', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>
                                + ADD NEW ADDRESS
                            </button>
                        )}
                    </h3>

                    {showAddForm ? (
                        <div className="section-card">
                            <h4 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: '800' }}>Add New Address</h4>
                            <form onSubmit={saveAddress}>
                                <div className="responsive-form-row" style={{ marginBottom: '15px' }}>
                                    <input type="text" name="fullName" placeholder="Full Name" value={newAddress.fullName} onChange={handleAddressChange} required className="responsive-input" />
                                    <input type="text" name="phone" placeholder="Mobile Number" value={newAddress.phone} onChange={handleAddressChange} required className="responsive-input" />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="text" name="addressLine1" placeholder="Flat, House no., Building, Company, Apartment" value={newAddress.addressLine1} onChange={handleAddressChange} required className="responsive-input" />
                                </div>
                                <div style={{ marginBottom: '15px' }}>
                                    <input type="text" name="addressLine2" placeholder="Area, Colony, Street, Sector, Village" value={newAddress.addressLine2} onChange={handleAddressChange} className="responsive-input" />
                                </div>
                                <div className="responsive-form-row" style={{ marginBottom: '15px' }}>
                                    <input type="text" name="city" placeholder="Town/City" value={newAddress.city} onChange={handleAddressChange} required className="responsive-input" />
                                    <input type="text" name="state" placeholder="State" value={newAddress.state} onChange={handleAddressChange} required className="responsive-input" />
                                </div>
                                <div className="responsive-form-row" style={{ marginBottom: '25px' }}>
                                    <input type="text" name="postalCode" placeholder="Pincode" value={newAddress.postalCode} onChange={handleAddressChange} required className="responsive-input" />
                                    <input type="text" name="country" placeholder="Country" value={newAddress.country} onChange={handleAddressChange} required className="responsive-input" />
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '15px' }}>SAVE ADDRESS</button>
                                    <button type="button" onClick={() => setShowAddForm(false)} className="btn" style={{ flex: 1, padding: '15px', border: '1px solid #ddd' }}>CANCEL</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <>
                            {addresses.length === 0 ? (
                                <div className="add-address-card" onClick={() => setShowAddForm(true)} style={{ cursor: 'pointer', padding: '40px', textAlign: 'center' }}>
                                    <span style={{ fontSize: '32px', display: 'block', color: '#ff3e6c' }}>+</span>
                                    <span style={{ fontSize: '18px', fontWeight: '700', color: '#535766' }}>Add New Address</span>
                                </div>
                            ) : (
                                <div className="address-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                    {addresses.map(addr => (
                                        <div
                                            key={addr._id}
                                            className={`address-card ${selectedAddressId === addr._id ? 'selected' : ''}`}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                            style={{
                                                padding: '20px',
                                                border: selectedAddressId === addr._id ? '2px solid #ff3e6c' : '1px solid #eaeaec',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                backgroundColor: selectedAddressId === addr._id ? '#fff9fa' : 'white'
                                            }}
                                        >
                                            <div style={{ fontWeight: '800', marginBottom: '8px', fontSize: '16px' }}>{addr.fullName}</div>
                                            <div style={{ fontSize: '14px', color: '#535766', marginBottom: '10px', lineHeight: '1.5' }}>
                                                {addr.addressLine1}, {addr.addressLine2 ? addr.addressLine2 + ', ' : ''}
                                                <br />
                                                {addr.city}, {addr.state} - {addr.postalCode}
                                            </div>
                                            <div style={{ fontSize: '14px', fontWeight: '700', color: '#282c3f' }}>Mobile: {addr.phone}</div>

                                            <button
                                                className="address-btn btn-delete"
                                                onClick={(e) => { e.stopPropagation(); deleteAddress(addr._id); }}
                                                style={{
                                                    position: 'absolute', top: '15px', right: '15px',
                                                    background: 'none', border: 'none', color: '#777', fontSize: '12px', fontWeight: '600', cursor: 'pointer'
                                                }}
                                            >
                                                DELETE
                                            </button>
                                        </div>
                                    ))}
                                    <div className="add-address-card" onClick={() => setShowAddForm(true)} style={{ minHeight: '150px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ddd', borderRadius: '8px' }}>
                                        <span style={{ color: '#ff3e6c', fontWeight: 'bold' }}>+ Add Another Address</span>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right Side: Order Summary */}
                <div className="checkout-right" style={{ alignSelf: 'start' }}>
                    <div style={{ position: 'sticky', top: '90px' }}> {/* Sticky Summary - Moved Up */}
                        <h3 style={{ marginBottom: '10px', fontSize: '18px', fontWeight: '800', borderBottom: '1px solid #eaeaec', paddingBottom: '8px' }}>Order Summary</h3>

                        {/* Cart Items Summary */}
                        <div style={{ maxHeight: '140px', overflowY: 'auto', marginBottom: '10px', paddingRight: '5px' }}>
                            {cartItems.map(item => (
                                <div key={`${item.product._id}-${item.size}`} style={{ display: 'flex', gap: '10px', marginBottom: '10px', borderBottom: '1px solid #f0f0f0', paddingBottom: '10px' }}>
                                    <div style={{ width: '50px', height: '66px', flexShrink: 0, backgroundColor: '#f5f5f6', borderRadius: '4px', overflow: 'hidden' }}>
                                        <img src={item.product.image} alt={item.product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', fontSize: '14px', color: '#282c3f', lineHeight: '1.2' }}>{item.product.brand}</div>
                                        <div style={{ fontSize: '13px', color: '#535766', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{item.product.name}</div>
                                        <div style={{ fontSize: '12px', color: '#7e818c', marginTop: '2px' }}>Qty: {item.quantity} | Size: {item.size}</div>
                                        <div style={{ fontWeight: '800', marginTop: '4px', fontSize: '14px' }}>₹{item.product.price}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="summary-card" style={{ background: '#fff' }}>
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ color: '#535766' }}>Subtotal</span>
                                <span style={{ fontWeight: '600' }}>₹{subTotal.toFixed(2)}</span>
                            </div>

                            {discount > 0 && (
                                <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', color: '#03a685', fontSize: '13px' }}>
                                    <span>Discount (20%)</span>
                                    <span>-₹{discountAmount.toFixed(2)}</span>
                                </div>
                            )}

                            {/* Convenience Fee */}
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ color: '#535766' }}>Convenience Fee</span>
                                <span style={{ fontWeight: '600' }}>₹{CONVENIENCE_FEE}</span>
                            </div>

                            {/* Shipping Fee */}
                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
                                <span style={{ color: '#535766' }}>Shipping Fee {subTotal < 1000 && <span style={{ color: '#ff3e6c', fontSize: '11px' }}>(Order &lt; 1000)</span>}</span>
                                <span style={{ fontWeight: '600' }}>
                                    {SHIPPING_FEE === 0 ? <span style={{ color: '#03a685' }}>FREE</span> : `₹${SHIPPING_FEE}`}
                                </span>
                            </div>



                            <div className="summary-row" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                                <span className="summary-total" style={{ fontSize: '16px', color: '#282c3f', fontWeight: '800' }}>Total Amount</span>
                                <span className="summary-total" style={{ fontSize: '16px', fontWeight: '800', color: '#ff3e6c' }}>₹{totalPrice.toFixed(2)}</span>
                            </div>

                            <button
                                onClick={handlePlaceOrder}
                                disabled={!selectedAddressId}
                                style={{
                                    width: '100%',
                                    marginTop: '15px',
                                    fontSize: '15px',
                                    padding: '12px',
                                    background: selectedAddressId ? '#ff3e6c' : '#d4d5d9',
                                    color: 'white',
                                    border: 'none',
                                    fontWeight: '700',
                                    cursor: selectedAddressId ? 'pointer' : 'not-allowed',
                                    borderRadius: '4px',
                                    transition: 'background 0.3s'
                                }}
                            >
                                PROCEED TO PAYMENT
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%', padding: '15px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none', fontSize: '16px', fontWeight: '500'
};

const btnStyle = {
    padding: '15px 30px', borderRadius: '4px', border: 'none', fontWeight: '800', cursor: 'pointer', fontSize: '16px'
};

export default Checkout;
