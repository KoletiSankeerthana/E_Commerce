const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');


// @desc Fetch all products
// @route GET /api/products
// @access Public
const getProducts = asyncHandler(async (req, res) => {
    const { category, brand, minPrice, maxPrice, page, limit } = req.query;

    let query = {};

    if (category) {
        query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (brand) {
        query.brand = { $regex: brand, $options: 'i' };
    }

    if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const pageNumber = Number(page) || 1;
    const pageSize = Number(limit) || 12;
    const skip = (pageNumber - 1) * pageSize;

    let sortOption = {};
    if (req.query.sort === 'rating') {
        sortOption = { rating: -1 };
    }

    if (page || limit) {
        const count = await Product.countDocuments(query);
        const products = await Product.find(query)
            .sort(sortOption)
            .limit(pageSize)
            .skip(skip);

        res.json({
            products,
            page: pageNumber,
            pages: Math.ceil(count / pageSize),
            total: count
        });
    } else {
        const products = await Product.find(query).sort(sortOption);
        res.json(products);
    }
});


const normalize = (text) => text.toLowerCase().replace(/[-\s]/g, '');

// @desc Search products
// @route GET /api/products/search
// @access Public
const searchProducts = asyncHandler(async (req, res) => {
    const keyword = req.query.q || '';
    const normalizedKeyword = normalize(keyword);

    const products = await Product.find({});

    const filteredProducts = products.filter(product => {
        const normalizedName = normalize(product.name);
        const normalizedBrand = normalize(product.brand);
        const normalizedCategory = normalize(product.category);

        return (
            normalizedName.includes(normalizedKeyword) ||
            normalizedBrand.includes(normalizedKeyword) ||
            normalizedCategory.includes(normalizedKeyword)
        );
    });

    res.json(filteredProducts);
});


// @desc Fetch single product
// @route GET /api/products/:id
// @access Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


// @desc Create product
// @route POST /api/products
// @access Public
const createProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        description,
        image,
        brand,
        category,
        countInStock
    } = req.body;

    const product = new Product({
        name,
        price,
        description,
        image,
        brand,
        category,
        countInStock
    });

    const createdProduct = await product.save();

    res.status(201).json(createdProduct);
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const alreadyReviewed = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (alreadyReviewed) {
            res.status(400);
            throw new Error('Product already reviewed');
        }

        const review = {
            name: req.user.name,
            rating: Number(rating),
            comment,
            user: req.user._id,
        };

        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;

        await product.save();
        res.status(201).json({ message: 'Review added' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete review
// @route   DELETE /api/products/:id/reviews
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        const reviewIndex = product.reviews.findIndex(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (reviewIndex === -1) {
            res.status(404);
            throw new Error('Review not found');
        }

        product.reviews.splice(reviewIndex, 1);
        product.numReviews = product.reviews.length;

        if (product.numReviews > 0) {
            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;
        } else {
            product.rating = 0;
        }

        await product.save();
        res.json({ message: 'Review removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Update review
// @route   PUT /api/products/:id/reviews
// @access  Private
const updateProductReview = asyncHandler(async (req, res) => {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        const review = product.reviews.find(
            (r) => r.user.toString() === req.user._id.toString()
        );

        if (review) {
            review.rating = Number(rating);
            review.comment = comment;

            product.rating =
                product.reviews.reduce((acc, item) => item.rating + acc, 0) /
                product.reviews.length;

            await product.save();
            res.json({ message: 'Review updated' });
        } else {
            res.status(404);
            throw new Error('Review not found');
        }
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Get related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        const related = await Product.find({
            category: product.category,
            _id: { $ne: product._id }
        }).limit(4);
        res.json(related);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


// Export ONLY ONCE and ONLY AT BOTTOM
module.exports = {
    getProducts,
    getProductById,
    createProduct,
    searchProducts,
    createProductReview,
    deleteProductReview,
    updateProductReview,
    getRelatedProducts
};
