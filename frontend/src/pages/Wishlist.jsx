import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ImageLoader from '../components/ImageLoader';

const Wishlist = () => {
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Define fetchWishlist outside useEffect to call it after removal
    const fetchWishlist = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));

            if (!userInfo) {
                setError("Please login to view wishlist");
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `https://ecommerce-vwsy.onrender.com/api/wishlist?userId=${userInfo._id}`
            );

            setWishlistItems(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch wishlist");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveWishlist = async (productId) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));
            await axios.delete("https://ecommerce-vwsy.onrender.com/api/wishlist/remove", {
                data: {
                    userId: userInfo._id,
                    productId
                }
            });
            fetchWishlist();
        } catch {
            alert("Remove failed");
        }
    };

    if (loading) return <div className="container section-padding"><h2>Loading wishlist...</h2></div>;
    if (error) return (
        <div className="container section-padding" style={{ textAlign: 'center' }}>
            <h2 style={{ color: 'red' }}>{error}</h2>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-block', textDecoration: 'none', padding: '10px 20px' }}>Login</Link>
        </div>
    );

    return (
        <div className="container section-padding" style={{ minHeight: '70vh' }}>
            <h1 style={{ marginBottom: '30px', fontSize: '24px', fontWeight: '700' }}>MY WISHLIST ({wishlistItems.length})</h1>

            {wishlistItems.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <h2>Your wishlist is empty</h2>
                    <p style={{ margin: '20px 0', color: '#535766' }}>Save items that you like in your wishlist.</p>
                    <Link to="/" className="btn btn-primary" style={{ padding: '15px 40px', display: 'inline-block', textDecoration: 'none' }}>CONTINUE SHOPPING</Link>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '50px 20px' }}>
                    {wishlistItems.map((product) => (
                        <div key={product._id} className="product-card" style={{ position: 'relative' }}>
                            <Link to={`/product/${product._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <div className="lux-img" style={{ height: '280px' }}>
                                    <ImageLoader
                                        src={product.image || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMzAwJyBoZWlnaHQ9JzMwMCcgZmlsbD0nI2U1ZTVlNSc+PHJlY3Qgd2lkdGg9JzMwMCcgaGVpZ2h0PSczMDAnLz48dGV4dCB4PSc1MCUnIHk9JzUwJScgZm9udC1zaXplPScyMCcgdGV4dC1hbmNob3I9J21pZGRsZScgZmlsbD0nI2FhYSc+UHJvZHVjdDwvdGV4dD48L3N2Zz4="}
                                        alt={product.name}
                                    />
                                </div>
                                <div className="product-info">
                                    <div className="product-brand">{product.brand}</div>
                                    <div className="product-name">{product.name}</div>
                                    <div className="product-price">₹{product.price}</div>
                                </div>
                            </Link>
                            <button
                                onClick={() => handleRemoveWishlist(product._id)}
                                style={{
                                    marginTop: "10px",
                                    padding: "6px 12px",
                                    border: "1px solid red",
                                    background: "white",
                                    color: "red",
                                    cursor: "pointer",
                                    borderRadius: "4px",
                                    width: "100%"
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
