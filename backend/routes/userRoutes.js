const express = require('express');
const router = express.Router();
const { registerUser, loginUser, addViewedProduct, getViewedProducts, addAddress, deleteAddress, getAddresses } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/viewed/:productId', protect, addViewedProduct);
router.get('/viewed', protect, getViewedProducts);
router.route('/address').post(protect, addAddress).get(protect, getAddresses);
router.route('/address/:id').delete(protect, deleteAddress);

module.exports = router;
