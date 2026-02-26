import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import PageWrapper from '../components/PageWrapper';
import LuxLoader from '../components/LuxLoader';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [selectedSize, setSelectedSize] = useState(null);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [error, setError] = useState(null);

    // Review State (Only for displaying list properly, writing is guided to Orders)
    const [isReviewsExpanded, setIsReviewsExpanded] = useState(false);

    useEffect(() => {
        const fetchProductData = async () => {
            setLoading(true);
            try {
                // Fetch Product
                const { data } = await api.get(`/api/products/${id}`);
                setProduct(data);

                // Fetch Related
                const relatedRes = await api.get(`/api/products/${id}/related`);
                setRelatedProducts(relatedRes.data);

                // Fire and forget: Recently Viewed
                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                if (userInfo) {
                    api.post(`/users/viewed/${id}`).catch(err => console.error("Recently viewed failed", err));
                }

                setLoading(false);
            } catch (err) {
                setError(err.request?.status === 0 ? 'Backend Server Not Running' : (err.response?.data?.message || err.message));
                setLoading(false);
            }
        };

        fetchProductData();
        setIsReviewsExpanded(false);
    }, [id]);

    const handleAddToCart = async () => {
        // Validation: If sizes exist (and not Accessories), require selection
        if (product.category !== "Accessories" && displaySizes.length > 0 && !selectedSize) {
            alert("Please select a size first!");
            return;
        }

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));

        if (!userInfo) {
            alert("Please login to add items to cart");
            return;
        }

        try {
            setAdding(true);

            await axios.post("https://ecommerce-vwsy.onrender.com/api/cart/add", {
                productId: product._id,
                size: selectedSize || 'One Size',
                quantity: 1,
                userId: userInfo._id
            });


            window.dispatchEvent(new Event('cartUpdated'));
            alert("Success! The item was added to your bag.");
        } catch (err) {
            console.error("Bag Update Failed:", err);
            const msg = err.response?.data?.message || err.response?.data?.detail || err.message;
            alert(`Failed to add to bag: ${msg}`);
        } finally {
            setAdding(false);
        }
    };

    const handleAddToWishlist = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem("userInfo"));

            if (!userInfo) {
                alert("Please login to add to wishlist");
                return;
            }

            await axios.post("https://ecommerce-vwsy.onrender.com/api/wishlist/add", {
                userId: userInfo._id,
                productId: product._id
            });

            alert("Added to wishlist");
        } catch {
            alert("Wishlist failed");
        }
    };

    // --- SIZING LOGIC ---
    let displaySizes = [];
    if (product) {
        // 1. If product has sizes in DB, start with them
        if (product.sizes && product.sizes.length > 0) {
            displaySizes = [...product.sizes];
        }

        // 2. Special Category Overrides
        const cat = product.category ? product.category.toLowerCase() : '';
        const nameLc = product.name ? product.name.toLowerCase() : '';

        // Check for Saree (category or name) -> FORCE Free Size
        if (cat.includes('saree') || cat.includes('sari') || cat.includes('saress') || nameLc.includes('saree') || nameLc.includes('sari')) {
            displaySizes = ['Free Size'];
        }
        // Kids Logic
        else if (cat === 'kids') {
            displaySizes = ['0-2 yrs', '2-4 yrs', '4-6 yrs', '6-8 yrs', '8-10 yrs'];
        }
        // Fallback for Empty DB Sizes (Only for specific types, reduce aggression)
        else if (displaySizes.length === 0) {
            if (cat === 'footwear') {
                displaySizes = ['UK6', 'UK7', 'UK8', 'UK9', 'UK10', 'UK11'];
            } else if (['men', 'women', 'clothing', 'top', 'shirt', 'dress', 'kurta'].some(k => cat.includes(k))) {
                // Only add standard sizes if it looks like clothing
                displaySizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            }
            // Else: Leave empty (Accessories, Bags, etc. shouldn't have sizes forced)
        }
    }

    if (loading) return <div className="container section-padding"><LuxLoader /></div>;
    if (error) return <div className="container section-padding"><h2 style={{ color: 'red' }}>Error: {error}</h2></div>;
    if (!product) return <div className="container section-padding"><h2>Product not found</h2></div>;

    // Filter reviews to show
    // Filter reviews to show
    const reviewsToShow = product.reviews ? (isReviewsExpanded ? product.reviews : product.reviews.slice(0, 1)) : [];

    return (
        <PageWrapper>
            <div className="pd-container" style={{ paddingBottom: '0' }}> {/* Reduced bottom padding */}
                {/* LEFT COLUMN: Image ONLY */}
                <div className="pd-left-column">
                    <div className="pd-image-section">
                        <img
                            src={product.image && product.image.length > 5 ? product.image : "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200"}
                            alt={product.name}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200";
                            }}
                        />
                    </div>
                </div>

                {/* RIGHT COLUMN: Product Info + REVIEWS */}
                <div className="pd-info-section">
                    <div className="pd-brand">{product.brand}</div>
                    <h1 className="pd-title">{product.name}</h1>

                    <div className="pd-price-block">
                        <div className="pd-price">₹{product.price}</div>
                        {product.hasDiscount && (
                            <>
                                <div className="pd-original-price">₹{product.originalPrice}</div>
                                <div className="pd-discount">({product.discountPercentage}% OFF)</div>
                            </>
                        )}
                    </div>

                    <div style={{ margin: '10px 0', fontSize: '1rem', fontWeight: 'bold', color: product.countInStock > 0 ? '#03a685' : '#ff3e6c' }}>
                        {product.countInStock > 0 ? `In Stock (${product.countInStock})` : 'Out of Stock'}
                    </div>

                    {/* Size Selector */}
                    {product.category !== "Accessories" && displaySizes.length > 0 && (
                        <div className="pd-size-container">
                            <div className="pd-size-title">SELECT SIZE</div>
                            <div className="pd-sizes-row">
                                {displaySizes.map((size) => (
                                    <button
                                        key={size}
                                        className={`pd-size-btn ${selectedSize === size ? 'selected' : ''}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="pd-actions">
                        <button
                            className="pd-add-bag-btn"
                            onClick={handleAddToCart}
                            disabled={adding || product.countInStock === 0}
                            style={{ opacity: (adding || product.countInStock === 0) ? 0.6 : 1 }}
                        >
                            {adding ? "ADDING..." : (product.countInStock === 0 ? 'OUT OF STOCK' : 'ADD TO BAG')}
                        </button>
                        <button className="pd-wishlist-btn" onClick={handleAddToWishlist}>
                            ♡ WISHLIST
                        </button>
                    </div>

                    {/* Product Details & Description */}
                    <div className="pd-details-section">
                        <h3 className="pd-details-title">Product Details</h3>
                        <p className="pd-details-text" style={{ marginBottom: '0.9375rem' }}>{product.description}</p>
                        <p className="pd-details-text"><strong>Category:</strong> {product.category}</p>
                        <p className="pd-details-text"><strong>Material:</strong> {product.clothType}</p>
                    </div>

                    {/* CUSTOMER REVIEWS - TIGHT SPACING under details */}
                    <div className="pd-reviews-section-right" style={{ borderTop: '0.0625rem solid #eaeaec', paddingTop: '0.3125rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3125rem' }}>
                            <h2 className="pd-reviews-title" style={{ margin: 0 }}>Customer Reviews</h2>

                            {/* Expand Arrow/Button */}
                            {product.reviews.length > 1 && (
                                <div
                                    onClick={() => setIsReviewsExpanded(!isReviewsExpanded)}
                                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3125rem', fontSize: '0.875rem', fontWeight: 'bold', color: '#ff3e6c' }}
                                >
                                    {isReviewsExpanded ? 'Show Less' : 'View All'}
                                    <span style={{ transform: isReviewsExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>▼</span>
                                </div>
                            )}
                        </div>

                        {product.reviews.length === 0 ? (
                            <p style={{ fontSize: '1rem', color: '#777', margin: '0.3125rem 0' }}>No reviews yet.</p>
                        ) : (
                            <div className="pd-reviews-list">
                                {reviewsToShow.map((review) => (
                                    <div key={review._id} className="pd-review-card" style={{ marginBottom: '0.625rem', paddingBottom: '0.625rem', borderBottom: '0.0625rem solid #f0f0f0' }}>
                                        <div className="pd-review-header" style={{ marginBottom: '0.3125rem', display: 'flex', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <strong className="pd-reviewer-name" style={{ fontSize: '1rem', display: 'block', color: '#282c3f' }}>{review.name}</strong>
                                            </div>
                                            <div className="pd-review-rating" style={{ color: '#ff3e6c', fontSize: '1rem' }}>
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="pd-review-comment" style={{ fontSize: '1rem', lineHeight: '1.4', color: '#282c3f', marginTop: '0.125rem', marginBottom: '0.125rem' }}>{review.comment}</p>
                                        <span style={{ fontSize: '0.8125rem', color: '#999', display: 'block' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Info about writing reviews */}
                        <div style={{ marginTop: '0.3125rem', fontSize: '0.875rem', color: '#555' }}>
                            Purchased this item?
                            <Link to="/track-order" style={{ marginLeft: '0.3125rem', color: '#ff3e6c', fontWeight: '700', textDecoration: 'none' }}>
                                Write a Review
                            </Link>
                        </div>
                    </div>

                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="container section-spacing">
                    <h2 className="section-title">Related Products</h2>

                    <div className="related-products-grid">
                        {relatedProducts.slice(0, 4).map(p => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </div>
            )}
        </PageWrapper>
    );
};

export default ProductDetail;
