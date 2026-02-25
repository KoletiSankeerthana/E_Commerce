const express = require('express');
const router = express.Router();
const { placeOrder, getOrders, cancelOrder, trackOrder, getOrderById, updateOrderStatus, requestReturn, deleteOrder } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware'); // Ensure protect is used

router.post('/place', placeOrder);
router.get('/', getOrders);
router.post('/cancel/:orderId', cancelOrder);
router.put('/:id/cancel', cancelOrder);
router.delete('/:id', protect, deleteOrder);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/request-return', requestReturn);
router.get('/track/:orderId', trackOrder);
router.get('/:id', getOrderById);

module.exports = router;
