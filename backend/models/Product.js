const mongoose = require('mongoose');

const productSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a product name'],
        },
        price: {
            type: Number,
            required: [true, 'Please add a product price'],
            default: 0,
        },
        brand: {
            type: String,
        },
        category: {
            type: String,
        },
        description: {
            type: String,
        },
        reviews: [
            {
                user: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User"
                },
                name: String,
                rating: Number,
                comment: String,
                createdAt: {
                    type: Date,
                    default: Date.now
                }
            }
        ],
        rating: {
            type: Number,
            default: 0
        },
        numReviews: {
            type: Number,
            default: 0
        },
        image: {
            type: String,
        },
        sizes: {
            type: [String],
            default: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"]
        },
        clothType: {
            type: String,
            default: "Cotton"
        },
        stockCount: {
            type: Number,
            default: 5
        },
        countInStock: {
            type: Number,
            default: 0,
        },
        hasDiscount: {
            type: Boolean,
            default: false,
        },
        discountPercentage: {
            type: Number,
            default: 0,
        },
        originalPrice: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
