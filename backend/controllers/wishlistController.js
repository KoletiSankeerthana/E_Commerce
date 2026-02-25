const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const User = require("../models/User");

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.wishlist.includes(productId)) {
            user.wishlist.push(productId);
            await user.save();
        }

        res.status(200).json({
            message: "Added to wishlist",
            wishlist: user.wishlist
        });

    } catch (error) {
        res.status(500).json({
            message: "Wishlist error"
        });
    }
};

const getWishlist = async (req, res) => {
    try {
        const { userId } = req.query;
        const User = require("../models/User");

        const user = await User.findById(userId)
            .populate("wishlist");

        res.status(200).json(user.wishlist);

    } catch (error) {
        res.status(500).json({
            message: "Wishlist fetch error"
        });
    }
};

const removeFromWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        const User = require("../models/User");

        const user = await User.findById(userId);

        user.wishlist = user.wishlist.filter(
            item => item.toString() !== productId
        );

        await user.save();

        res.status(200).json({
            message: "Removed"
        });

    } catch (error) {
        res.status(500).json({
            message: "Remove failed"
        });
    }
};

module.exports = { addToWishlist, getWishlist, removeFromWishlist };
