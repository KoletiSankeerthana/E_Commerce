import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    useEffect(() => {
        if (!userInfo || !userInfo.isAdmin) {
            navigate('/');
            return;
        }

        const fetchProducts = async () => {
            try {
                const { data } = await axios.get('https://ecommerce-vwsy.onrender.com/products');
                const safeProducts = Array.isArray(data) ? data : [];

                setProducts(safeProducts);
                setDisplayedProducts(safeProducts);
            } catch (error) {
                console.error("Error fetching products:", error);
                setLoading(false);
            }
        };

        fetchProducts();
    }, [userInfo, navigate]);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`https://ecommerce-vwsy.onrender.com/products/${id}`);
                await axios.delete(`https://ecommerce-vwsy.onrender.com/products/${id}`);
                setProducts(products.filter(product => product._id !== id));
            } catch (error) {
                alert('Delete failed');
            }
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold' }}>Products</h2>
                <button
                    onClick={() => navigate('/admin/products/create')}
                    className="btn btn-primary"
                    style={{ padding: '10px 20px' }}
                >
                    Create Product
                </button>
            </div>

            <div className="table-responsive">
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #eee' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f9f9f9', textAlign: 'left' }}>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Image</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Name</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Brand</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Category</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Price</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Stock</th>
                            <th style={{ padding: '12px', borderBottom: '1px solid #eee' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>

                        <tr key={product._id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '10px' }}>
                                <img src={product.image} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover' }} />
                            </td>
                            <td style={{ padding: '10px' }}>{product.name}</td>
                            <td style={{ padding: '10px' }}>{product.brand}</td>
                            <td style={{ padding: '10px' }}>{product.category}</td>
                            <td style={{ padding: '10px' }}>₹{product.price}</td>
                            <td style={{ padding: '10px' }}>{product.countInStock}</td>
                            <td style={{ padding: '10px' }}>
                                <button
                                    style={{ marginRight: '10px', padding: '5px 10px', cursor: 'pointer', border: '1px solid #ddd', borderRadius: '4px' }}
                                    onClick={() => alert("Edit functionality not implemented in requirements")}
                                >
                                    Edit
                                </button>
                                <button
                                    style={{ padding: '5px 10px', cursor: 'pointer', backgroundColor: '#ff3f6c', color: 'white', border: 'none', borderRadius: '4px' }}
                                    onClick={() => handleDelete(product._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProducts;
