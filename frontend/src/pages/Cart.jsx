import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import ImageLoader from '../components/ImageLoader';
import PageWrapper from '../components/PageWrapper';
import LuxLoader from '../components/LuxLoader';

const Cart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const fetchCart = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));

            if (!userInfo) {
                setLoading(false);
                return;
            }

            const response = await api.get(
                `/cart?userId=${userInfo._id}`
            );
            setCartItems(response.data);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handleRemove = async (productId, size) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            if (!userInfo) return;

            await api.delete("/cart/remove", {
                data: {
                    productId,
                    size,
                    userId: userInfo._id
                }
            });
            fetchCart();
            window.dispatchEvent(new Event('cartUpdated'));
        } catch (error) {
            console.error(error);
            alert("Failed to remove item");
        }
    };

    const handleUpdateQuantity = async (productId, size, currentQty, change) => {
        const newQty = currentQty + change;
        if (newQty < 1) return; // Prevent going below 1, user should use remove button

        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            if (!userInfo) return;

            // Optimistic Update
            setCartItems(prev => prev.map(item =>
                item.product._id === productId && item.size === size
                    ? { ...item, quantity: newQty }
                    : item
            ));

            await api.put("/cart/update", {
                productId,
                size,
                quantity: newQty,
                userId: userInfo._id
            });

            // Re-fetch to confirm stock limits etc if handled by backend, 
            // but for now relying on optimistic update for speed
            // fetchCart(); 
        } catch (error) {
            console.error("Failed to update quantity", error);
            alert("Failed to update quantity");
            fetchCart(); // Revert on error
        }
    };

    const handlePlaceOrder = () => {
        navigate('/checkout');
    };
    console.log("CartItems value:", cartItems);
    console.log("Is cartItems an array:", Array.isArray(cartItems));
    const subTotal = Array.isArray(cartItems)
        ? cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0)
        : 0;
    const CONVENIENCE_FEE = 15;
    const SHIPPING_FEE = subTotal < 1000 ? 100 : 0;
    const totalPrice = subTotal + CONVENIENCE_FEE + SHIPPING_FEE;

    if (loading) return <div className="container section-padding"><LuxLoader /></div>;
    if (error) return <div className="container section-padding"><h2 style={{ color: 'red' }}>Error: {error}</h2></div>;

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo) {
        return (
            <div className="container section-padding" style={{ textAlign: 'center', padding: '50px 0' }}>
                <h2>Please Login</h2>
                <p style={{ margin: '20px 0', color: '#535766' }}>Login to view your bag.</p>
                <Link to="/login" className="btn btn-primary" style={{ padding: '15px 40px', display: 'inline-block', textDecoration: 'none' }}>LOGIN</Link>
            </div>
        );
    }

    return (
        <PageWrapper>
            <div className="page-container">
                <h1 className="page-title">SHOPPING BAG <span style={{ whiteSpace: 'nowrap' }}>({cartItems.length} ITEMS)</span></h1>

                {cartItems.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <h2>Your cart is empty</h2>
                        <p style={{ margin: '20px 0', color: '#535766' }}>Add items that you like to your bag. They will appear here.</p>
                        <Link to="/" className="btn btn-primary" style={{ padding: '15px 40px', display: 'inline-block', textDecoration: 'none' }}>CONTINUE SHOPPING</Link>
                    </div>
                ) : (
                    <div className="cart-grid">
                        {/* Left Side: Cart Items */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {cartItems.map((item) => (
                                <div key={`${item.product._id}-${item.size}`} className="cart-item-card">
                                    {/* Left: Image */}
                                    <div className="cart-item-image">
                                        <ImageLoader
                                            src={item.product.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgZmlsbD0nI2U1ZTVlNSc+PHJlY3Qgd2lkdGg9JzMwMCcgaGVpZ2h0PSczMDAnLz4+PHRleHQgeD0nNTAlJyB5PSc1MCUnIGZvbnQtc2l6ZT0nMjAnIHRleHQtYW5jaG9yPSdtaWRkbGUnIGZpbGw9JyNhYWMgfmXJvZHVjdDwvdGV4dD48L3N2Zz4="}
                                            alt={item.product.name}
                                        />
                                    </div>

                                    {/* Middle: Details */}
                                    <div className="cart-item-details" style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <div style={{ fontWeight: '800', fontSize: '1.25rem', color: '#282c3f', marginBottom: '4px' }}>{item.product.brand}</div>
                                            <div style={{ fontSize: '1rem', color: '#535766' }}>{item.product.name}</div>
                                        </div>

                                        <div style={{ marginBottom: '15px', fontWeight: '900', fontSize: '1.5rem', color: '#282c3f' }}>₹{item.product.price}</div>

                                        <div className="cart-item-options" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: 'auto', flexWrap: 'wrap' }}>
                                            <div style={{ backgroundColor: '#f5f5f6', padding: '8px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: '700' }}>
                                                Size: {item.size}
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f6', borderRadius: '4px', padding: '2px' }}>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.size, item.quantity, -1)}
                                                    disabled={item.quantity <= 1}
                                                    style={{ border: 'none', background: 'none', padding: '5px 12px', fontSize: '18px', cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer', color: '#ff3e6c', fontWeight: '900' }}
                                                >
                                                    -
                                                </button>
                                                <span style={{ padding: '0 10px', fontWeight: '800', fontSize: '16px' }}>{item.quantity}</span>
                                                <button
                                                    onClick={() => handleUpdateQuantity(item.product._id, item.size, item.quantity, 1)}
                                                    style={{ border: 'none', background: 'none', padding: '5px 12px', fontSize: '18px', cursor: 'pointer', color: '#ff3e6c', fontWeight: '900' }}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#ff3f6c', fontWeight: '800', textTransform: 'uppercase' }}
                                        onClick={() => handleRemove(item.product._id, item.size)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Right Side: Price Details */}
                        <div className="section-card" style={{ position: 'sticky', top: '100px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '900', color: '#535766', marginBottom: '20px', textTransform: 'uppercase' }}>Price Details ({cartItems.length} Items)</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                                <span>Total Price</span>
                                <span>₹{subTotal.toFixed(2)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                                <span>Convenience Fee</span>
                                <span>₹{CONVENIENCE_FEE}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                                <span>Shipping Fee</span>
                                <span style={{ color: SHIPPING_FEE === 0 ? '#03a685' : 'inherit' }}>{SHIPPING_FEE === 0 ? "FREE" : `₹${SHIPPING_FEE}`}</span>
                            </div>

                            <div style={{ borderTop: '1px solid #eaeaec', paddingTop: '15px', marginTop: '15px', display: 'flex', justifyContent: 'space-between', fontWeight: '900', fontSize: '18px' }}>
                                <span>Total Amount</span>
                                <span>₹{totalPrice.toFixed(2)}</span>
                            </div>
                            <button
                                className="btn btn-primary"
                                style={{ width: '100%', marginTop: '25px', padding: '15px', fontSize: '16px', fontWeight: '900' }}
                                onClick={handlePlaceOrder}
                            >
                                PLACE ORDER
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </PageWrapper>
    );
};

export default Cart;
