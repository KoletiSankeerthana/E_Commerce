const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Public
const addToCart = async (req, res) => {
    try {
        const { productId, size, quantity, userId } = req.body;

        if (!productId || !size) {
            return res.status(400).json({ message: "Product ID and size are required" });
        }

        if (!userId) {
            return res.status(400).json({
                message: "User ID required"
            });
        }

        const Product = require("../models/Product");
        const User = require("../models/User");

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        if (!user.cart) {
            user.cart = [];
        }

        const existingItem = user.cart.find(
            item =>
                item.product.toString() === productId &&
                item.size === size
        );

        if (existingItem) {
            existingItem.quantity += quantity || 1;
        } else {
            user.cart.push({
                product: productId,
                size,
                quantity: quantity || 1
            });
        }

        await user.save();

        res.status(200).json({
            message: "Product added to cart",
            cart: user.cart
        });

    } catch (error) {
        console.error("Add to cart error:", error);
        res.status(500).json({
            message: "Server error while adding to cart"
        });
    }
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Public
const getCart = async (req, res) => {
    try {
        const User = require("../models/User");
        const { userId } = req.query;

        let user = await User.findById(userId).populate("cart.product");

        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }

        res.status(200).json(user.cart);

    } catch (error) {
        console.error("Get cart error:", error);
        res.status(500).json({
            message: "Server error while fetching cart"
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove
// @access  Public
const removeFromCart = async (req, res) => {
    try {
        const { productId, size, userId } = req.body;

        if (!productId || !size || !userId) {
            return res.status(400).json({
                message: "Product ID, size, and User ID required"
            });
        }

        const User = require("../models/User");

        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        user.cart = user.cart.filter(item =>
            !(item.product.toString() === productId && item.size === size)
        );

        await user.save();

        res.status(200).json({
            message: "Item removed from cart",
            cart: user.cart
        });

    } catch (error) {
        console.error("Remove cart error:", error);
        res.status(500).json({
            message: "Server error while removing item"
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Public
const updateCartQuantity = async (req, res) => {
    try {
        const { productId, size, userId, quantity } = req.body;

        if (!productId || !size || !userId || !quantity) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const User = require("../models/User");
        let user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const itemIndex = user.cart.findIndex(item =>
            item.product.toString() === productId && item.size === size
        );

        if (itemIndex > -1) {
            user.cart[itemIndex].quantity = quantity;
            await user.save();
            res.status(200).json(user.cart);
        } else {
            res.status(404).json({ message: "Item not found in cart" });
        }
    } catch (error) {
        console.error("Update cart error:", error);
        res.status(500).json({ message: "Server error while updating cart" });
    }
};

module.exports = {
    addToCart,
    getCart,
    removeFromCart,
    updateCartQuantity
};
