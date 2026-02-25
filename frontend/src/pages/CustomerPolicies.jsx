import { useParams, Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';

const CustomerPolicies = () => {
    const { type } = useParams();

    const activeStyle = {
        fontWeight: 'bold',
        color: '#ff3e6c',
        borderLeft: '4px solid #ff3e6c',
        paddingLeft: '8px',
        backgroundColor: '#fff5f7'
    };

    const linkStyle = {
        display: 'block',
        padding: '8px 12px',
        color: '#282c3f',
        textDecoration: 'none',
        fontSize: '14px',
        borderRadius: '0 4px 4px 0',
        marginBottom: '2px'
    };

    const renderContent = () => {
        switch (type) {
            case 'about':
                return (
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#282c3f', fontWeight: 'bold', textTransform: 'uppercase' }}>About Style Store</h1>
                        <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                            <p style={{ marginBottom: '15px', fontWeight: '500', color: '#111' }}>Where Luxury Meets Modern Fashion.</p>
                            <p style={{ marginBottom: '15px' }}>Style Store was born from a simple vision: to make high-end, premium fashion accessible to everyone who appreciates quality and style. We believe that fashion is not just what you wear—it's how you express your identity to the world.</p>
                            <p style={{ marginBottom: '15px' }}>Our curated collections represent the pinnacle of artisanal craftsmanship and contemporary design. From timeless classics to the latest runway trends, every piece in our store is selected with a meticulous eye for detail, fabric quality, and ethical production.</p>

                            <div style={{ marginTop: '25px', padding: '20px', borderLeft: '4px solid #ff3e6c', backgroundColor: '#fff5f7' }}>
                                <h3 style={{ fontSize: '18px', color: '#282c3f', marginBottom: '10px' }}>Our Mission</h3>
                                <p>To redefine the luxury shopping experience by providing exceptional service, unparalleled quality, and a platform where style knows no boundaries.</p>
                            </div>

                            <div className="policy-metrics-grid">
                                <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <h4 style={{ color: '#ff3e6c', fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>100%</h4>
                                    <p style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase' }}>Authenticity</p>
                                </div>
                                <div style={{ textAlign: 'center', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <h4 style={{ color: '#ff3e6c', fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' }}>24/7</h4>
                                    <p style={{ fontSize: '13px', color: '#888', textTransform: 'uppercase' }}>Elite Support</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'contact':
                return (
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#282c3f', fontWeight: 'bold', textTransform: 'uppercase' }}>Contact Us</h1>
                        <div style={{ fontSize: '16px', lineHeight: '1.6', color: '#555' }}>
                            <p style={{ marginBottom: '15px' }}>We'd love to hear from you! Reach out to us for any queries or feedback.</p>
                            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                                <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Customer Support</h3>
                                <p>Email: <strong style={{ color: '#282c3f' }}>support@stylestore.com</strong></p>
                                <p>Phone: <strong style={{ color: '#282c3f' }}>+91 9123456789</strong></p>
                                <p>Hours: Mon-Sat, 9AM - 7PM</p>
                            </div>
                            <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
                                <h3 style={{ marginBottom: '10px', fontSize: '18px' }}>Corporate Office</h3>
                                <p>Style Store Fashion Pvt Ltd.</p>
                                <p>123 High Street, Tech Park</p>
                                <p>Bangalore, Karnataka - 560001</p>
                            </div>
                        </div>
                    </div>
                );
            case 'faq':
                return (
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#282c3f', fontWeight: 'bold', textTransform: 'uppercase' }}>Frequently Asked Questions</h1>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {[
                                { q: "How do I track my order?", a: "You can track your order by clicking on the 'Track Order' link in the footer and entering your Order ID." },
                                { q: "What is the return policy?", a: "We offer a 7day return policy for all unused items with original tags." },
                                { q: "Do you ship internationally?", a: "Currently, we only ship within India." },
                                { q: "How can I cancel my order?", a: "You can cancel your order from the 'Orders' page before it has been shipped." }
                            ].map((faq, i) => (
                                <div key={i} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <h3 style={{ fontSize: '17px', marginBottom: '8px', color: '#333' }}>{faq.q}</h3>
                                    <p style={{ color: '#666', lineHeight: '1.4', fontSize: '15px' }}>{faq.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'terms':
                return (
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#282c3f', fontWeight: 'bold', textTransform: 'uppercase' }}>Terms & Conditions</h1>
                        <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                            <p style={{ marginBottom: '15px' }}>Welcome to Style Store. By using our website, you agree to these terms.</p>
                            <h3 style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>1. Usage</h3>
                            <p>You must be at least 18 years old to use this service.</p>
                            <h3 style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>2. Account</h3>
                            <p>You are responsible for maintaining the confidentiality of your account.</p>
                            <h3 style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>3. Pricing</h3>
                            <p>Prices are subject to change without notice.</p>
                        </div>
                    </div>
                );
            case 'shipping':
                return (
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#282c3f', fontWeight: 'bold', textTransform: 'uppercase' }}>Shipping Policy</h1>
                        <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                            <div style={{ marginBottom: '20px' }}>
                                <strong style={{ display: 'block', color: '#282c3f', marginBottom: '5px' }}>Delivery Time</strong>
                                <p>Standard delivery takes 5-7 business days.</p>
                            </div>
                            <div style={{ marginBottom: '20px' }}>
                                <strong style={{ display: 'block', color: '#282c3f', marginBottom: '5px' }}>Shipping Charges</strong>
                                <p>Free shipping on orders above ₹1500. A nominal fee of ₹100 applies for orders below that amount.</p>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <strong style={{ display: 'block', color: '#282c3f', marginBottom: '2px' }}>Tracking</strong>
                                <p>You can track your order with your Order ID in the <Link to="/track-order" style={{ color: '#ff3e6c', fontWeight: 'bold' }}>Track Your Order</Link> page.</p>
                            </div>
                        </div>
                    </div>
                );
            case 'cancellation':
                return (
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#282c3f', fontWeight: 'bold', textTransform: 'uppercase' }}>Cancellation & Returns</h1>
                        <div style={{ fontSize: '16px', lineHeight: '1.8', color: '#555' }}>
                            <h3 style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>Cancellation</h3>
                            <p>You can cancel your order anytime before it is shipped via the 'My Orders' section.</p>
                            <h3 style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>Returns</h3>
                            <p>Initiate a return within  days of delivery. Items must be unused and in original packaging.</p>
                            <h3 style={{ marginTop: '20px', fontSize: '18px', color: '#333' }}>Refunds</h3>
                            <p>Refunds are processed within 5-7 business days after we receive the returned item.</p>
                        </div>
                    </div>
                );
            default:
                return (
                    <div>
                        <h1 style={{ fontSize: '24px', marginBottom: '20px', color: '#282c3f', fontWeight: 'bold' }}>Terms of Use</h1>
                        <p>Please review our terms carefully before using our services.</p>
                    </div>
                );
        }
    };

    return (
        <PageWrapper>
            <div className="policy-container">
                <div className="policy-layout">
                    {/* Sidebar */}
                    <div className="policy-sidebar">
                        <h3>
                            Help Center
                        </h3>
                        <div>
                            <Link to="/policies/about" style={{ ...linkStyle, ...(type === 'about' ? activeStyle : {}) }}>About Us</Link>
                            <Link to="/policies/contact" style={{ ...linkStyle, ...(type === 'contact' ? activeStyle : {}) }}>Contact Us</Link>
                            <Link to="/policies/faq" style={{ ...linkStyle, ...(type === 'faq' ? activeStyle : {}) }}>FAQ</Link>
                            <Link to="/policies/terms" style={{ ...linkStyle, ...(type === 'terms' ? activeStyle : {}) }}>Terms & Conditions</Link>
                            <Link to="/policies/shipping" style={{ ...linkStyle, ...(type === 'shipping' ? activeStyle : {}) }}>Shipping Policy</Link>
                            <Link to="/policies/cancellation" style={{ ...linkStyle, ...(type === 'cancellation' ? activeStyle : {}) }}>Cancellation & Returns</Link>
                        </div>
                    </div>
                    -
                    {/* Content Area */}
                    <div className="policy-content">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default CustomerPolicies;
