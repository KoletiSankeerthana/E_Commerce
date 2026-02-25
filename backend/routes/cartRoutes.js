const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart, updateCartQuantity } = require('../controllers/cartController');

// Define routes
router.post('/add', addToCart);
router.get('/', getCart);
router.delete('/remove', removeFromCart);
router.put('/update', updateCartQuantity);

module.exports = router;
