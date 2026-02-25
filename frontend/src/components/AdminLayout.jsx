import { Link, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    const linkStyle = (path) => ({
        display: 'block',
        padding: '12px 20px',
        color: isActive(path) ? '#ff3f6c' : '#333',
        fontWeight: isActive(path) ? 'bold' : 'normal',
        textDecoration: 'none',
        backgroundColor: isActive(path) ? '#fff5f7' : 'transparent',
        borderLeft: isActive(path) ? '4px solid #ff3f6c' : '4px solid transparent'
    });

    return (
        <div className="container" style={{ display: 'flex', minHeight: 'calc(100vh - 80px)', marginTop: '80px' }}>
            {/* Sidebar */}
            <div style={{ width: '250px', borderRight: '1px solid #eaeaec', paddingRight: '20px' }}>
                <h3 style={{ padding: '0 20px 20px', fontSize: '18px', fontWeight: 'bold', borderBottom: '1px solid #eee', marginBottom: '10px' }}>Admin Menu</h3>
                <nav>
                    <Link to="/admin" style={linkStyle('/admin')}>Dashboard</Link>
                    <Link to="/admin/products" style={linkStyle('/admin/products')}>Products</Link>
                    <Link to="/admin/products/create" style={linkStyle('/admin/products/create')}>Create Product</Link>
                    <Link to="/admin/orders" style={linkStyle('/admin/orders')}>Orders</Link>
                </nav>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, paddingLeft: '30px', paddingBottom: '30px' }}>
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
