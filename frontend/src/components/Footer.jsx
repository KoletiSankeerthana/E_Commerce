import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="lux-footer" style={{ backgroundColor: '#0f111a', color: '#fff' }}>
            <div className="container footer-grid">
                {/* Column 1: Online Shopping */}
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', marginBottom: '15px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>ONLINE SHOPPING</h3>
                    <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2', fontSize: '0.85rem', color: '#ccc' }}>
                        <li><Link to="/category/Men" style={{ textDecoration: 'none', color: 'inherit' }}>Men</Link></li>
                        <li><Link to="/category/Women" style={{ textDecoration: 'none', color: 'inherit' }}>Women</Link></li>
                        <li><Link to="/category/Kids" style={{ textDecoration: 'none', color: 'inherit' }}>Kids</Link></li>
                        <li><Link to="/category/Accessories" style={{ textDecoration: 'none', color: 'inherit' }}>Accessories</Link></li>
                    </ul>
                </div>

                {/* Column 2: Customer Policies */}
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', marginBottom: '15px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>CUSTOMER POLICIES</h3>
                    <ul style={{ listStyle: 'none', padding: 0, lineHeight: '2', fontSize: '0.85rem', color: '#ccc' }}>
                        <li><Link to="/policies/about" style={{ textDecoration: 'none', color: 'inherit' }}>About Us</Link></li>
                        <li><Link to="/policies/contact" style={{ textDecoration: 'none', color: 'inherit' }}>Contact Us</Link></li>
                        <li><Link to="/policies/faq" style={{ textDecoration: 'none', color: 'inherit' }}>FAQ</Link></li>
                        <li><Link to="/policies/terms" style={{ textDecoration: 'none', color: 'inherit' }}>T&C</Link></li>
                        <li><Link to="/policies/shipping" style={{ textDecoration: 'none', color: 'inherit' }}>Shipping</Link></li>
                        <li><Link to="/policies/cancellation" style={{ textDecoration: 'none', color: 'inherit' }}>Cancellation</Link></li>
                    </ul>
                </div>

                {/* Column 3: Experience App & Social */}
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', marginBottom: '15px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>EXPERIENCE APP</h3>
                    <div className="flex-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '20px', justifyContent: 'center' }}>
                        <a href="#" style={{ textDecoration: 'none' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" style={{ height: '32px' }} />
                        </a>
                        <a href="#" style={{ textDecoration: 'none' }}>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/135px-Download_on_the_App_Store_Badge.svg.png" alt="App Store" style={{ height: '32px' }} />
                        </a>
                    </div>

                    <h3 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'white', marginBottom: '15px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>KEEP IN TOUCH</h3>
                    <div className="flex-row" style={{ display: 'flex', gap: '15px', alignItems: 'center', justifyContent: 'center' }}>
                        <a href="#" style={{ textDecoration: 'none' }}><img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" style={{ width: '20px' }} /></a>
                        <a href="#" style={{ textDecoration: 'none' }}><img src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg" alt="Twitter" style={{ width: '20px' }} /></a>
                        <a href="#" style={{ textDecoration: 'none' }}><img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png" alt="Instagram" style={{ width: '20px' }} /></a>
                        <a href="#" style={{ textDecoration: 'none' }}><img src="https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg" alt="YouTube" style={{ width: '20px' }} /></a>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', marginTop: '5px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src="/images/logo.png" alt="StyleStore Logo" style={{ height: '50px', width: '100px', objectFit: 'contain', marginLeft: '-60px' }} />
                    <span style={{
                        fontSize: '1.2rem',
                        fontFamily: "'Playfair Display', serif",
                        color: 'white',
                        fontWeight: '800',
                        letterSpacing: '2px',
                        textTransform: 'uppercase',
                        marginLeft: '-40px'
                    }}>STYLE STORE</span>
                </Link>
                <p style={{ marginTop: '5px', color: '#666', fontSize: '0.65rem', marginLeft: '-10px' }}>&copy; 2026 Style Store. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
