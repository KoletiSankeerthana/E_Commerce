import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ProductCard from '../components/ProductCard';
import PageWrapper from '../components/PageWrapper';
import LuxLoader from '../components/LuxLoader';

const Products = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();

    const search = searchParams.get('q') || '';
    const sortOption = searchParams.get('sort') || '';

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await api.get('/products');
                if (data.products) {
                    setProducts(data.products);
                } else {
                    setProducts(data);
                }
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="container section-padding"><LuxLoader /></div>;
    if (error) return <div className="container section-padding"><h2 style={{ color: 'red' }}>Error: {error}</h2></div>;

    if (!products || products.length === 0) {
        return <div className="container section-padding"><h2>No products available</h2></div>;
    }

    // Client-side Filtering & Sorting
    let displayedProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    if (sortOption === 'price_asc') {
        displayedProducts.sort((a, b) => a.price - b.price);
    } else if (sortOption === 'price_desc') {
        displayedProducts.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'newest') {
        displayedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortOption === 'rating') {
        displayedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return (
        <PageWrapper>
            <div className="container section-padding">
                <h1 style={{ marginBottom: '20px', fontSize: '24px', color: '#282c3f', textAlign: 'center' }}>
                    {search ? `Search Results for "${search}"` : 'All Products'}
                </h1>

                <div className="product-grid">
                    {Array.isArray(displayedProducts) && displayedProducts.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            </div>
        </PageWrapper>
    );
};

export default Products;
