import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../services/api';

const Navbar = () => {
    const [cartCount, setCartCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showSortDropdown, setShowSortDropdown] = useState(false); // New State
    const [showMobileMenu, setShowMobileMenu] = useState(false); // Task 2: Mobile Menu
    const [leaveTimer, setLeaveTimer] = useState(null); // Timer for stability

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();

    // ... (userInfo and fetchCart ...)

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    // Robust Toggle Logic for Profile
    const handleProfileEnter = () => {
        if (leaveTimer) clearTimeout(leaveTimer);
        setShowDropdown(true);
    };

    const handleProfileLeave = () => {
        const timer = setTimeout(() => {
            setShowDropdown(false);
        }, 300); // 300ms grace period
        setLeaveTimer(timer);
    };

    const handleProfileClick = () => {
        if (leaveTimer) clearTimeout(leaveTimer);
        setShowDropdown(!showDropdown);
    };

    // Close menu on navigation
    useEffect(() => {
        setShowMobileMenu(false);
    }, [location.pathname]);

    const fetchCartCount = async () => {
        try {
            if (userInfo) {
                const { data } = await api.get(`/cart?userId=${userInfo._id}`);
                setCartCount(data.length);
            } else {
                setCartCount(0);
            }
        } catch (err) {
            console.log("Error fetching cart count", err);
        }
    };

    useEffect(() => {
        fetchCartCount();
        const handleCartUpdate = () => fetchCartCount();
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [userInfo]);

    const handleLogout = () => {
        localStorage.removeItem("userInfo");
        window.location.reload();
    };

    // Category Logic: Ash -> Pink -> Ash (Deselect)
    const handleCategoryClick = (cat) => {
        if (location.pathname === `/category/${cat}`) {
            navigate("/"); // Deselect (Go Home)
        } else {
            navigate(`/category/${cat}`);
        }
    };

    const getLinkStyle = (cat) => {
        const isActive = location.pathname === `/category/${cat}`;
        return {
            color: isActive ? '#ff3f6c' : '#535766', // Pink if active, Ash usually
            fontWeight: isActive ? '700' : '600',
            textDecoration: 'none',
            marginLeft: '1.25rem',
            cursor: 'pointer',
            transition: 'color 0.3s',
            textTransform: 'uppercase',
            fontSize: '0.875rem',
            letterSpacing: '0.03125rem'
        };
    };

    // Sort Logic (Updated)
    const handleSortChange = (value) => {
        const newParams = new URLSearchParams(searchParams);
        if (value) newParams.set('sort', value);
        else newParams.delete('sort');
        setSearchParams(newParams);
    };

    // Search Logic
    const handleSearchChange = (e) => {
        const value = e.target.value;
        const newParams = new URLSearchParams(searchParams);
        if (value) {
            newParams.set('q', value);
            // Ensure we are on a page that displays results
            if (location.pathname !== '/' && location.pathname !== '/products') {
                navigate(`/?q=${value}`);
            } else {
                setSearchParams(newParams);
            }
        } else {
            newParams.delete('q');
            if (location.pathname === '/') {
                setSearchParams(newParams);
            }
        }
    };


    return (
        <nav className="lux-navbar">
            <div className="container nav-content">
                {/* 1. Logo Section */}
                <Link to="/" className="lux-logo">
                    <img src="/images/logo.png" alt="Logo" className="logo" />
                    <span className="logo-text">STYLE STORE</span>
                </Link>

                {/* 2. Menu Section (Home, Men, Women...) */}
                <div className="nav-center">
                    <span onClick={() => navigate('/')} className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>Home</span>
                    {['Men', 'Women', 'Kids', 'Accessories'].map(cat => (
                        <span key={cat} onClick={() => handleCategoryClick(cat)} className={`nav-item ${location.pathname === `/category/${cat}` ? 'active' : ''}`}>
                            {cat}
                        </span>
                    ))}
                </div>

                {/* 3. Tools Section (Search, Sort, Icons) */}
                <div className="nav-tools">
                    <div className="nav-search-wrapper">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchParams.get('q') || ''}
                            onChange={(e) => {
                                const value = e.target.value;
                                const newParams = new URLSearchParams(searchParams);
                                if (value) {
                                    newParams.set('q', value);
                                    if (location.pathname !== '/' && location.pathname !== '/products') navigate(`/?q=${value}`);
                                    else setSearchParams(newParams);
                                } else {
                                    newParams.delete('q');
                                    setSearchParams(newParams);
                                }
                            }}
                            className="nav-search-input"
                        />
                        <span className="nav-search-icon">🔍</span>
                    </div>

                    <div className="nav-sort-wrapper">
                        <div
                            className={`custom-sort-dropdown ${showSortDropdown ? 'open' : ''}`}
                            onClick={() => setShowSortDropdown(!showSortDropdown)}
                            onMouseLeave={() => setShowSortDropdown(false)}
                        >
                            <span className="sort-label-text">
                                {searchParams.get('sort') === 'price_asc' ? 'Low to High' :
                                    searchParams.get('sort') === 'price_desc' ? 'High to Low' :
                                        searchParams.get('sort') === 'rating' ? 'Rating' :
                                            'Sort By'}
                            </span>
                            <span className="sort-arrow-icon">▼</span>

                            <div className="sort-options">
                                <div className={`sort-option ${!searchParams.get('sort') ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); handleSortChange(''); setShowSortDropdown(false); }}>Recommended</div>
                                <div className={`sort-option ${searchParams.get('sort') === 'price_asc' ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); handleSortChange('price_asc'); setShowSortDropdown(false); }}>Price: Low to High</div>
                                <div className={`sort-option ${searchParams.get('sort') === 'price_desc' ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); handleSortChange('price_desc'); setShowSortDropdown(false); }}>Price: High to Low</div>
                                <div className={`sort-option ${searchParams.get('sort') === 'rating' ? 'selected' : ''}`} onClick={(e) => { e.stopPropagation(); handleSortChange('rating'); setShowSortDropdown(false); }}>Customer Rating</div>
                            </div>
                        </div>
                    </div>

                    <div className="nav-icons-group">
                        <div className="nav-utility-item" onClick={() => navigate("/wishlist")} title="Wishlist">
                            <span className="nav-icon">♡</span>
                        </div>

                        <div className="nav-utility-item" onClick={() => navigate("/cart")} title="Cart" style={{ position: 'relative' }}>
                            <span className="nav-icon">🛒</span>
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </div>

                        <div
                            style={{ position: 'relative', display: 'flex', alignItems: 'center', height: '100%', cursor: 'pointer' }}
                            onClick={handleProfileClick}
                            onMouseEnter={handleProfileEnter}
                            onMouseLeave={handleProfileLeave}
                        >
                            <span className="nav-icon" title="Profile">👤</span>
                            {showDropdown && (
                                <div className="nav-dropdown" onMouseEnter={handleProfileEnter} onMouseLeave={handleProfileLeave} onClick={(e) => e.stopPropagation()}>
                                    {!userInfo ? (
                                        <>
                                            <div className="dropdown-welcome">Welcome</div>
                                            <Link to="/signup" className="dropdown-link brand-highlight" onClick={() => setShowDropdown(false)}>Signup</Link>
                                            <Link to="/login" className="dropdown-link" onClick={() => setShowDropdown(false)}>Login</Link>
                                        </>
                                    ) : (
                                        <>
                                            <div className="dropdown-header">Hello, {userInfo.name}</div>
                                            {userInfo.isAdmin && <Link to="/admin" className="dropdown-link brand-highlight bold" onClick={() => setShowDropdown(false)}>Admin Dashboard</Link>}
                                            <Link to="/orders" className="dropdown-link" onClick={() => setShowDropdown(false)}>My Orders</Link>
                                            <Link to="/wishlist" className="dropdown-link" onClick={() => setShowDropdown(false)}>Wishlist</Link>
                                            <div onClick={() => { handleLogout(); setShowDropdown(false); }} className="dropdown-link logout-btn">Logout</div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
