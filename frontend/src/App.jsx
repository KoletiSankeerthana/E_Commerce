import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import Payment from './pages/Payment';
import Admin from './pages/Admin';
import AdminLayout from './components/AdminLayout';
import AdminProducts from './pages/AdminProducts';
import AdminCreateProduct from './pages/AdminCreateProduct';
import AdminOrders from './pages/AdminOrders';
import Products from './pages/Products';
import OrderDetails from './pages/OrderDetails';
import TrackOrder from './pages/TrackOrder';
import ReturnOrder from './pages/ReturnOrder';
import CustomerPolicies from './pages/CustomerPolicies';
import Footer from './components/Footer';
import './App.css';
import './styles/luxury.css';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AnimatePresence } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary';

function AnimatedRoutes() {
  const location = useLocation();

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      mirror: false,
    });
  }, []);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/category/:category" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order/:id" element={<OrderDetails />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/policies/:type" element={<CustomerPolicies />} />
        <Route path="/track-order" element={<TrackOrder />} />
        <Route path="/return-order/:id" element={<ReturnOrder />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Admin />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/create" element={<AdminCreateProduct />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        <Route path="*" element={<Home />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <main>
        <ErrorBoundary>
          <AnimatedRoutes />
        </ErrorBoundary>
      </main>
      <Footer />
    </>
  );
}

export default App;