const express = require('express');
const router = express.Router();

const {
    getProducts,              // <-- THIS WAS MISSING
    getProductById,
    createProduct,
    searchProducts,
    createProductReview,
    updateProductReview,
    deleteProductReview,
    getRelatedProducts
} = require('../controllers/productController');

const { protect } = require('../middleware/authMiddleware');


// Search products
router.get('/search', searchProducts);


// Get all products
router.get('/', getProducts);


// Create product
router.post('/', createProduct);


// Create review
router.post('/:id/reviews', protect, createProductReview);
router.put('/:id/reviews', protect, updateProductReview);
router.delete('/:id/reviews', protect, deleteProductReview);


// Related products
router.get('/:id/related', getRelatedProducts);


// Get single product
router.get('/:id', getProductById);


module.exports = router;
