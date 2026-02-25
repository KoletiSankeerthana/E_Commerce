import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import PageWrapper from '../components/PageWrapper';
import LuxLoader from '../components/LuxLoader';
import { motion } from 'framer-motion';
import '../styles/luxury.css';
// import '../styles/category.css'; // Commented out to prevent overriding luxury.css

const Home = () => {
    const { category } = useParams();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // State for Product Listings
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter & Search State
    const [showFilter, setShowFilter] = useState(false);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Search State (Fixed)
    const searchQuery = searchParams.get('q') || '';
    const sortOption = searchParams.get('sort');
    const pageQuery = searchParams.get('page') || 1;

    // Landing Page State (Fixed)
    // Landing Page State (Fixed with Static Fallbacks)
    const [bestSellerProducts, setBestSellerProducts] = useState([
        { _id: 'static1', name: 'Premium Printed Shirt', brand: 'Fashion Pro', price: 1299, image: '/images/men-printed-regular-fit-shirt.png', category: 'Men', rating: 4.8 },
        { _id: 'static2', name: 'Flared Silk Lehanga', brand: 'Ethnic Wear', price: 3499, image: '/images/women-flared-lehanga.png', category: 'Women', rating: 4.9 },
        { _id: 'static3', name: 'Cotton Block Print Dress', brand: 'Little Stars', price: 899, image: '/images/kids-block-print-A-line-dress.png', category: 'Kids', rating: 4.7 },
        { _id: 'static4', name: 'Classic Leather Wallet', brand: 'Luxe Accs', price: 599, image: '/images/accessories-men-wallet.png', category: 'Accessories', rating: 4.6 }
    ]);

    // Determine Mode
    const isListingMode = !!(searchQuery || category);

    // --- Listing Logic ---
    useEffect(() => {
        setPage(Number(pageQuery));
    }, [pageQuery]);

    useEffect(() => {
        if (!isListingMode) {
            setLoading(false);
            return;
        }

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();

                if (category) params.append('category', category);
                if (minPrice) params.append('minPrice', minPrice);
                if (maxPrice) params.append('maxPrice', maxPrice);
                if (sortOption) params.append('sort', sortOption);

                if (searchQuery) {
                    const searchUrl = `/products/search?q=${searchQuery}`;
                    const { data } = await api.get(searchUrl);

                    // Client-side filtering & sorting for search results
                    let filtered = data;
                    if (minPrice) filtered = filtered.filter(p => p.price >= Number(minPrice));
                    if (maxPrice) filtered = filtered.filter(p => p.price <= Number(maxPrice));

                    if (sortOption === 'price_asc') {
                        filtered.sort((a, b) => a.price - b.price);
                    } else if (sortOption === 'price_desc') {
                        filtered.sort((a, b) => b.price - a.price);
                    } else if (sortOption === 'rating') {
                        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    }

                    setProducts(Array.isArray(filtered) ? filtered : []);
                    setTotalPages(1);
                } else {
                    params.append('page', page);
                    params.append('limit', 12);

                    const queryString = params.toString();
                    const { data } = await api.get(`/products?${queryString}`);
                    if (Array.isArray(data?.products)) {
                        setProducts(data.products);
                        setTotalPages(data.pages || 1);
                        setPage(data.page || 1);
                    }
                    else if (Array.isArray(data)) {
                        setProducts(data);
                        setTotalPages(1);
                        setPage(1);
                    }
                    else {
                        setProducts([]);  // CRITICAL FIX
                        setTotalPages(1);
                        setPage(1);
                    }
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [category, searchQuery, page, minPrice, maxPrice, isListingMode, sortOption]);


    // --- Landing Page Logic ---
    const [categoryImages, setCategoryImages] = useState({
        Men: "/images/category-men.jpg",
        Women: "/images/category-women.jpg",
        Kids: "/images/category-kids.jpg",
        Accessories: "/images/category-accessories.jpg"
    });

    useEffect(() => {
        if (isListingMode) return;

        const fetchLandingData = async () => {
            try {
                // 1. Fetch Bestsellers (sorted by rating)
                const bestSellerRes = await api.get('/products?sort=rating&limit=30');
                const productsArray = bestSellerRes.data.products || bestSellerRes.data;

                if (productsArray && productsArray.length > 0) {
                    const uniqueCats = [];
                    const distinctBestSellers = [];

                    // 1. Identify Best Sellers (Top 8, but only top 4 are usually shown)
                    for (const p of productsArray) {
                        if (!uniqueCats.includes(p.category) && distinctBestSellers.length < 8) {
                            uniqueCats.push(p.category);
                            distinctBestSellers.push(p);
                        }
                    }
                    if (distinctBestSellers.length < 8) {
                        for (const p of productsArray) {
                            if (!distinctBestSellers.find(item => item._id === p._id) && distinctBestSellers.length < 8) {
                                distinctBestSellers.push(p);
                            }
                        }
                    }

                    const bestSellerIds = distinctBestSellers.map(p => p._id);
                    const newCategoryImages = { ...categoryImages };

                    // 2. Map representative images for categories from products NOT in best sellers
                    // We skip the first 10 products to avoid "Bestseller" tags and ensure variety
                    const diverseProducts = productsArray.slice(10);
                    for (const cat of ['Men', 'Women', 'Kids', 'Accessories']) {
                        const diverseProduct = diverseProducts.find(p => p.category === cat && !bestSellerIds.includes(p._id));
                        if (diverseProduct) {
                            newCategoryImages[cat] = diverseProduct.image;
                        } else {
                            // Fallback to any non-bestseller if no "diverse" one found
                            const fallbackProduct = productsArray.find(p => p.category === cat && !bestSellerIds.includes(p._id));
                            if (fallbackProduct) newCategoryImages[cat] = fallbackProduct.image;
                        }
                    }

                    // Best sellers from API
                    if (distinctBestSellers.length > 0) {
                        setBestSellerProducts(distinctBestSellers);
                    }
                    // Category images from API
                    setCategoryImages(newCategoryImages);
                }
            } catch (err) {
                console.error("Failed to fetch landing data", err);
            }
        };
        fetchLandingData();
    }, [isListingMode]);


    const changePage = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            const newParams = Object.fromEntries(searchParams);
            newParams.page = newPage;
            setSearchParams(newParams);
        }
    };


    // --- Render Listing Mode ---
    if (isListingMode) {
        if (loading) return <div className="container center-content"><LuxLoader /></div>;
        if (error) return <div className="container center-content"><h2 style={{ color: 'red' }}>Error: {error}</h2></div>;

        return (
            <div className="container" style={{ marginTop: '1.875rem', padding: '0 1.25rem' }}>

                {/* Main Content */}
                <div>
                    <h1 className="listing-title">
                        {searchQuery ? `Search Results for "${searchQuery}"` : category ? `${category} Collection` : 'Products'}
                    </h1>

                    <div className="product-grid">
                        {products && products.length > 0 ? (
                            products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))
                        ) : (
                            <h3>No products found.</h3>
                        )}
                    </div>

                    {/* Pagination */}
                    {!searchQuery && totalPages > 1 && (
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.9375rem', marginTop: '2.5rem', marginBottom: '2.5rem' }}>
                            <button
                                onClick={() => changePage(page - 1)}
                                disabled={page === 1}
                                className="btn"
                                style={{ fontSize: '1.2rem' }}
                            >
                                PREVIOUS PAGE
                            </button>
                            <span style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
                                Page {page} of {totalPages}
                            </span>
                            <button
                                onClick={() => changePage(page + 1)}
                                disabled={page === totalPages}
                                className="btn"
                                style={{ fontSize: '1.2rem' }}
                            >
                                NEXT PAGE
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // --- Render Landing Mode ---
    const heroImages = [
        "/images/hero-main.jpg",
        "/images/hero-alt.jpg",
        "/images/hero-new.jpg"
    ];
    // eslint-disable-next-line no-unused-vars
    const [currentHero, setCurrentHero] = useState(0);

    useEffect(() => {
        if (!isListingMode) {
            const interval = setInterval(() => {
                setCurrentHero(prev => (prev + 1) % heroImages.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [isListingMode]);

    return (
        <PageWrapper>
            <div className="home-background">
                {/* SECTION 1: Cinematic Luxury Hero Slider */}
                <section className="luxury-hero">
                    {heroImages.map((img, index) => (
                        <div
                            key={index}
                            className={`hero-slide ${index === currentHero ? "active" : ""}`}
                            style={{ backgroundImage: `url(${img})` }}
                        />
                    ))}

                    <div className="hero-overlay"></div>
                    <div className="hero-content" key={currentHero}>
                        <h1 className="hero-title">
                            <span className="line">
                                <span>E</span><span>l</span><span>e</span><span>v</span><span>a</span><span>t</span><span>e</span>
                                <span>&nbsp;</span>
                                <span>Y</span><span>o</span><span>u</span><span>r</span>
                            </span>

                            <span className="line">
                                <span>U</span><span>n</span><span>i</span><span>q</span><span>u</span><span>e</span>
                                <span>&nbsp;</span>
                                <span>S</span><span>t</span><span>y</span><span>l</span><span>e</span>
                            </span>
                        </h1>

                        <p className="hero-subtitle">
                            Luxury fashion curated for modern living.
                        </p>

                        <button className="hero-btn" onClick={() => navigate("/products")}>
                            Explore Collection
                        </button>
                    </div>


                </section>

                {/* SECTION 2: Shop by Category */}
                <div className="section-wrapper">
                    <h2 className="section-title">Shop by Category</h2>
                    <div className="category-img-grid">
                        {[
                            { name: "Men", link: "/category/Men" },
                            { name: "Women", link: "/category/Women" },
                            { name: "Kids", link: "/category/Kids" },
                            { name: "Accessories", link: "/category/Accessories" }
                        ].map((cat) => (
                            <Link key={cat.name} to={cat.link} className="category-img-card">
                                <div className="category-img-wrapper">
                                    <img src={categoryImages[cat.name]} alt={cat.name} />
                                </div>
                                <span className="category-img-label">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* SECTION 5: Best Sellers */}
                <div className="container section-spacing">
                    <h2 className="section-title">Best Sellers</h2>
                    <div className="product-grid bestseller-grid">
                        {bestSellerProducts.slice(0, 4).map(p => (
                            <ProductCard key={p._id} product={p} />
                        ))}
                    </div>
                </div>

                {/* Features */}
                <div className="features-section">
                    <div className="container features-grid">
                        {/* ... features mapping ... */}
                        {/* ... features mapping ... */}
                        {[
                            { icon: '🚚', title: 'Free Delivery', desc: 'Orders above ₹1500', color: '#f0f4ff' },
                            { icon: '↩️', title: 'Easy Returns', desc: '7 days return policy', color: '#eef2ff' },
                            { icon: '🔒', title: 'Secure Payment', desc: '100% secure payment', color: '#fffecf' },
                            { icon: '🎧', title: '24/7 Support', desc: 'Dedicated support', color: '#f5f5f5' },
                        ].map((feature, idx) => (
                            <div key={idx} className="feature-card">
                                <div className="feature-icon-wrapper" style={{ backgroundColor: feature.color }}>
                                    {feature.icon}
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-desc">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>


            </div>
        </PageWrapper>
    );
};

export default Home;
