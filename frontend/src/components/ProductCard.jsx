import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import '../styles/luxury.css';

const ProductCard = ({ product }) => {

    // Don't navigate for static fallback products (no real DB record)
    const isStatic = product._id && String(product._id).startsWith('static');

    const cardInner = (
        <motion.div
            className="lux-card"
            whileHover={{ scale: 1.05, boxShadow: "0 30px 60px rgba(0,0,0,0.15)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.25 }}
        >

            <div className="lux-img" style={{ position: 'relative', overflow: 'hidden' }}>

                {/* IMAGE ONLY — VIDEO REMOVED */}
                <img
                    src={product.image || "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop"}
                    alt={product.name}
                    className="product-image"
                    style={{
                        background: '#fff',
                        objectFit: 'contain',
                        width: '100%',
                        height: '100%',
                        transition: 'all 0.5s ease'
                    }}
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=800&auto=format&fit=crop";
                    }}
                />

                {!isStatic && (
                    <div className="product-hover-actions">

                        <button
                            className="action-btn primary"
                            onClick={async (e) => {

                                e.preventDefault();

                                const userInfo = JSON.parse(localStorage.getItem("userInfo"));

                                if (!userInfo) {
                                    alert("Please login to add to bag");
                                    return;
                                }

                                try {

                                    await api.post("/cart/add", {
                                        productId: product._id,
                                        size: 'M',
                                        quantity: 1,
                                        userId: userInfo._id
                                    });

                                    window.dispatchEvent(new Event('cartUpdated'));

                                    alert("Added to bag!");

                                } catch (err) {

                                    alert("Failed to add to bag");

                                }

                            }}
                        >
                            Add to Bag
                        </button>

                        <button
                            className="action-btn"
                            onClick={(e) => {
                                e.preventDefault();
                                // Wishlist logic here
                            }}
                        >
                            Wishlist
                        </button>

                    </div>
                )}

            </div>

            <div className="product-info">

                <div>

                    <div className="product-brand">
                        {product.brand}
                    </div>

                    <div className="product-name">
                        {product.name}
                    </div>

                </div>

                <div className="product-price">

                    <span>₹{product.price}</span>

                    {product.hasDiscount && (

                        <>
                            <span style={{
                                textDecoration: 'line-through',
                                color: '#94969f',
                                fontSize: '0.8rem',
                                fontWeight: '400',
                                marginLeft: '8px'
                            }}>
                                ₹{product.originalPrice}
                            </span>

                            <span style={{
                                color: '#03a685',
                                fontSize: '0.8rem',
                                fontWeight: '700',
                                marginLeft: '5px',
                                whiteSpace: 'nowrap'
                            }}>
                                ({product.discountPercentage}% OFF)
                            </span>
                        </>

                    )}

                </div>

                <div style={{
                    fontSize: '0.75rem',
                    color: product.countInStock > 0 ? '#03a685' : '#ff3e6c',
                    fontWeight: 'bold',
                    marginTop: '4px'
                }}>

                    {product.countInStock > 0
                        ? `In Stock (${product.countInStock})`
                        : 'Out of Stock'}

                </div>

            </div>

        </motion.div>
    );

    if (isStatic) {

        return (

            <div
                className="product-card-link"
                style={{
                    textDecoration: 'none',
                    color: 'inherit'
                }}
            >
                {cardInner}
            </div>

        );

    }

    return (

        <Link
            to={`/product/${product._id}`}
            className="product-card-link"
            style={{
                textDecoration: 'none',
                color: 'inherit'
            }}
        >
            {cardInner}
        </Link>

    );

};

export default ProductCard;