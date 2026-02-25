import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Admin = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/');
            return;
        }

        const fetchData = async () => {
            try {
                const productsRes = await axios.get('https://ecommerce-vwsy.onrender.com/api/products');
                const ordersRes = await axios.get('https://ecommerce-vwsy.onrender.com/api/orders');

                setProducts(productsRes.data);
                setOrders(ordersRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching admin data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, [userInfo, navigate]);

    const handleDeleteProduct = async (id) => {
        if (window.confirm("Are you sure you want to delete this product?")) {
            try {
                await axios.delete(`https://ecommerce-vwsy.onrender.com/api/products/${id}`);
                setProducts(products.filter(p => p._id !== id));
            } catch (error) {
                alert("Failed to delete product");
            }
        }
    };

    if (loading) return <div className="container section-padding"><h2>Loading Admin Dashboard...</h2></div>;

    return (
        <div className="container section-padding">
            <h1 style={{ marginBottom: '30px', fontWeight: '700' }}>ADMIN DASHBOARD</h1>

            <div style={{ display: 'flex', gap: '40px', flexDirection: 'column' }}>

                {/* Orders Section */}
                <div style={{ padding: '20px', border: '1px solid #eaeaec', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <h3 style={{ marginBottom: '20px', fontWeight: 'bold' }}>Recent Orders ({orders.length})</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
                                    <th style={{ padding: '10px' }}>Order ID</th>
                                    <th style={{ padding: '10px' }}>User</th>
                                    <th style={{ padding: '10px' }}>Items</th>
                                    <th style={{ padding: '10px' }}>Total</th>
                                    <th style={{ padding: '10px' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(orders) && orders.map(order => (
                                    <tr key={order._id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '10px' }}>{order.orderId || order._id}</td>
                                        <td style={{ padding: '10px' }}>{order.user?.name}</td>
                                        <td style={{ padding: '10px' }}>{order.orderItems.length}</td>
                                        <td style={{ padding: '10px' }}>₹{order.totalPrice}</td>
                                        <td style={{ padding: '10px' }}>
                                            <span style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                backgroundColor: order.orderStatus === 'Delivered' ? '#d4edda' : '#fff3cd',
                                                color: order.orderStatus === 'Delivered' ? '#155724' : '#856404',
                                                fontSize: '12px'
                                            }}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Products Section */}
                <div style={{ padding: '20px', border: '1px solid #eaeaec', borderRadius: '8px', backgroundColor: '#fff' }}>
                    <h3 style={{ marginBottom: '20px', fontWeight: 'bold' }}>Products ({products.length})</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                        {Array.isArray(products) && products.map(product => (
                            <div key={product._id} style={{ border: '1px solid #eee', borderRadius: '4px', overflow: 'hidden' }}>
                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                                <div style={{ padding: '10px' }}>
                                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>{product.brand}</div>
                                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '10px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span style={{ fontWeight: 'bold' }}>₹{product.price}</span>
                                        <button
                                            onClick={() => handleDeleteProduct(product._id)}
                                            style={{ padding: '5px 10px', backgroundColor: '#ff3f6c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Admin;
