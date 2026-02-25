const Product = require("../models/Product");
const Order = require("../models/Order");

const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products"
        });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({
            message: "Product deleted"
        });
    } catch (error) {
        res.status(500).json({
            message: "Delete failed"
        });
    }
};

const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate("user").sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({
            message: "Fetch failed"
        });
    }
};

module.exports = { getAllProducts, deleteProduct, getAllOrders };
