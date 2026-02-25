const User = require("../models/User");
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id)
            }
        });

    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            message: "Server error"
        });
    }
};

const addViewedProduct = async (req, res) => {
    try {
        const productId = req.params.productId;

        // Since we are using authMiddleware, we have req.user
        const user = await User.findById(req.user._id);

        if (user) {
            // Check if viewedProducts needs initialization (though mongoose handles this usually)
            if (!user.viewedProducts) {
                user.viewedProducts = [];
            }

            // Remove existing if present to move it to top
            // Using Mongoose .pull() which handles casting and subdocs automatically
            user.viewedProducts.pull(productId);

            // Add to beginning
            user.viewedProducts.unshift(productId);

            // Limit to 10
            if (user.viewedProducts.length > 10) {
                user.viewedProducts = user.viewedProducts.slice(0, 10);
            }

            await user.save();
            res.json({ message: "Product added to recently viewed" });
        } else {
            res.status(404).json({ message: "User not found" });
        }

    } catch (error) {
        console.error("Add viewed error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getViewedProducts = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('viewedProducts');
        if (user) {
            res.json(user.viewedProducts);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching viewed products' });
    }
};

const addAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const newAddress = req.body;

            // If marked as default, unset others (logic specific)
            // For now, simple push
            user.addresses.push(newAddress);
            await user.save();

            res.status(201).json(user.addresses);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error adding address" });
    }
};

const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.addresses = user.addresses.filter(
                (addr) => addr._id.toString() !== req.params.id
            );
            await user.save();
            res.json(user.addresses);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error deleting address" });
    }
};

const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (user) {
            res.json(user.addresses || []);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching addresses" });
    }
};

module.exports = { registerUser, loginUser, addViewedProduct, getViewedProducts, addAddress, deleteAddress, getAddresses };
