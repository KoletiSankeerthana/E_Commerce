const placeOrder = async (req, res) => {
    try {
        const { userId, address, paymentMethod, paymentDetails, couponCode } = req.body;

        const User = require("../models/User");
        const Order = require("../models/Order");
        const Product = require("../models/Product"); // Ensure Product model is loaded

        const user = await User.findById(userId)
            .populate("cart.product");

        if (!user || user.cart.length === 0) {
            return res.status(400).json({
                message: "Cart empty"
            });
        }

        // Validate Stock
        for (const item of user.cart) {
            const product = await Product.findById(item.product._id);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product}` });
            }
            if (product.countInStock < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }
        }

        let subTotal = user.cart.reduce(
            (sum, item) =>
                sum + item.product.price * item.quantity,
            0
        );

        let totalPrice = subTotal;

        // Coupon Logic
        if (couponCode === 'WELCOME20') {
            const isUsed = user.usedCoupons.some(c => c.code === couponCode);
            if (isUsed) {
                return res.status(400).json({ message: "Coupon code already used" });
            }
            totalPrice = totalPrice - (totalPrice * 0.20);
            user.usedCoupons.push({ code: couponCode });
        } else if (couponCode) {
            return res.status(400).json({ message: "Invalid coupon code" });
        }

        // Add Fees (Must match Frontend Logic)
        const CONVENIENCE_FEE = 15;
        const SHIPPING_FEE = subTotal < 1000 ? 100 : 0;

        totalPrice += CONVENIENCE_FEE + SHIPPING_FEE;

        const generateOrderId = () => "ORD" + Date.now() + Math.floor(Math.random() * 1000);

        const trackingSteps = [
            {
                status: "Placed",
                date: new Date()
            },
            {
                status: "Processing",
                date: new Date(Date.now() + 2 * 60 * 60 * 1000)
            },
            {
                status: "Shipped",
                date: new Date(Date.now() + 24 * 60 * 60 * 1000)
            },
            {
                status: "Out for Delivery",
                date: new Date(Date.now() + 48 * 60 * 60 * 1000)
            },
            {
                status: "Delivered",
                date: new Date(Date.now() + 72 * 60 * 60 * 1000)
            }
        ];

        // Calculate Return Eligibility
        let returnEligible = true;
        // Check if any item is an accessory
        for (const item of user.cart) {
            const product = await Product.findById(item.product._id);
            if (product && product.category === 'Accessories') {
                returnEligible = false;
                break;
            }
        }

        const order = new Order({
            user: userId,
            orderItems: user.cart,
            totalPrice,
            address,
            paymentMethod,
            paymentDetails,
            orderId: generateOrderId(),
            trackingSteps,
            cancelAllowedUntil: new Date(Date.now() + 24 * 60 * 60 * 1000),
            returnEligible,
            // 7 days return window will be set upon delivery
            returnWindowExpiresAt: null
        });

        await order.save();

        // Reduce Stock
        for (const item of user.cart) {
            const product = await Product.findById(item.product._id);
            if (product) {
                product.countInStock -= item.quantity;
                await product.save();
            }
        }

        user.cart = [];

        await user.save();

        res.status(201).json(order);

    } catch (error) {
        console.error("Place order error:", error);
        res.status(500).json({
            message: "Order failed"
        });
    }
};

const getOrders = async (req, res) => {
    try {
        const { userId } = req.query;
        const Order = require("../models/Order");

        const orders = await Order.find({
            user: userId
        }).populate("orderItems.product").sort({ createdAt: -1 });

        res.status(200).json(orders);

    } catch (error) {
        console.error("Get orders error:", error);
        res.status(500).json({
            message: "Fetch failed"
        });
    }
};

const cancelOrder = async (req, res) => {
    try {
        const orderId = req.params.orderId || req.params.id; // Support both route params
        const Order = require("../models/Order");

        // Try finding by orderId string or _id
        let order = await Order.findOne({ orderId: orderId });
        if (!order) {
            try {
                order = await Order.findById(orderId);
            } catch (e) {
                // ignore
            }
        }

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.orderStatus !== "Placed" && order.orderStatus !== "Processing") {
            return res.status(400).json({ message: "Cannot cancel order at this stage" });
        }

        if (new Date() > new Date(order.cancelAllowedUntil)) {
            return res.status(400).json({ message: "Cancellation window expired" });
        }

        order.orderStatus = "Cancelled";
        order.isCancelled = true;
        await order.save();

        res.status(200).json({ message: "Order cancelled" });

    } catch (error) {
        res.status(500).json({ message: "Cancellation failed" });
    }
};

const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const Order = require("../models/Order");
        const order = await Order.findById(req.params.id);

        if (order) {
            order.orderStatus = status;

            // Update the specific step's date to now
            const stepIndex = order.trackingSteps.findIndex(s => s.status === status);
            if (stepIndex !== -1) {
                // Update all previous steps to 'now' if they are still in the future or not set correctly
                // This ensures a logical progression in the timeline
                for (let i = 0; i <= stepIndex; i++) {
                    if (!order.trackingSteps[i].date || new Date(order.trackingSteps[i].date) > new Date()) {
                        order.trackingSteps[i].date = new Date();
                    }
                }
            } else {
                // If step doesn't exist (unexpected for standard flow but possible), push it
                order.trackingSteps.push({
                    status: status,
                    date: new Date()
                });
            }

            // If status is 'Delivered', set return window for 7 days from now
            if (status === 'Delivered' && order.returnEligible) {
                order.returnWindowExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            }

            // If the body contains returnStatus, update it too
            if (req.body.returnStatus) {
                order.returnStatus = req.body.returnStatus;
                if (req.body.returnStatus === 'Completed') {
                    order.returnCompletedAt = new Date();
                }
            }

            await order.save();
            res.json(order);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Update failed" });
    }
};

const requestReturn = async (req, res) => {
    try {
        const { returnReason, returnDescription } = req.body;
        const Order = require("../models/Order");
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (!order.returnEligible) {
            return res.status(400).json({ message: "This product is not eligible for return" });
        }

        if (new Date() > new Date(order.returnWindowExpiresAt)) {
            return res.status(400).json({ message: "Return window expired" });
        }

        if (order.returnStatus !== 'None') {
            return res.status(400).json({ message: "Return already requested or processed" });
        }

        order.returnReason = returnReason;
        order.returnDescription = returnDescription;
        order.returnStatus = "Requested";
        order.returnRequestedAt = new Date();

        await order.save();

        res.status(200).json(order);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Return request failed" });
    }
};

const trackOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const Order = require("../models/Order");

        const order = await Order.findOne({ orderId });

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        // Return both steps and current status for frontend
        res.status(200).json({
            status: order.orderStatus,
            trackingSteps: order.trackingSteps
        });

    } catch (error) {
        res.status(500).json({ message: "Tracking failed" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const Order = require("../models/Order");
        const order = await Order.findOne({ orderId: req.params.id }).populate("orderItems.product") || await Order.findById(req.params.id).populate("orderItems.product");
        // fallback to findById if using ID from URL which might be _id for return requests

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ message: "Fetch failed" });
    }
};

const deleteOrder = async (req, res) => {
    try {
        const Order = require("../models/Order");
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        await order.deleteOne();
        res.json({ message: "Order removed" });
    } catch (error) {
        res.status(500).json({ message: "Delete failed" });
    }
};

module.exports = { placeOrder, getOrders, cancelOrder, trackOrder, getOrderById, updateOrderStatus, requestReturn, deleteOrder };
