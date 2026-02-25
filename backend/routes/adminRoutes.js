const express = require('express');
const router = express.Router();
const { getAllProducts, deleteProduct, getAllOrders } = require('../controllers/adminController');

router.get('/products', getAllProducts);
router.delete('/products/:id', deleteProduct);
router.get('/orders', getAllOrders);

module.exports = router;
