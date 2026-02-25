const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const ratings = [3.5, 3.8, 4.0, 4.2, 4.5, 4.8];
const userNames = ['Rahul Sharma', 'Priya Reddy', 'Arjun Kumar', 'Sneha Patel', 'Vikram Singh'];
const comments = [
    "Excellent product",
    "Good value for money",
    "Material is very comfortable",
    "Fits perfectly",
    "Highly recommended"
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const updateData = async () => {
    try {
        const products = await Product.find({});

        for (const product of products) {
            // Update Price based on category
            let minPrice = 200;
            let maxPrice = 1000;

            const categoryLower = product.category ? product.category.toLowerCase() : '';

            if (categoryLower.includes('men') && !categoryLower.includes('women')) {
                minPrice = 400;
                maxPrice = 1500;
            } else if (categoryLower.includes('women')) {
                minPrice = 500;
                maxPrice = 1800;
            } else if (categoryLower.includes('kid')) {
                minPrice = 300;
                maxPrice = 1200;
            } else if (categoryLower.includes('accessories')) {
                minPrice = 200;
                maxPrice = 900;
            }

            product.price = getRandomInt(minPrice, maxPrice);

            // Update Ratings and Reviews
            const rating = getRandom(ratings);
            const numReviews = getRandomInt(3, 25);

            product.rating = rating;
            product.numReviews = numReviews;
            product.reviews = [];

            // Generate random reviews
            const numSampleReviews = getRandomInt(2, 5);
            for (let i = 0; i < numSampleReviews; i++) {
                product.reviews.push({
                    user: new mongoose.Types.ObjectId(),
                    name: getRandom(userNames),
                    rating: Math.floor(rating), // Give integer rating close to average
                    comment: getRandom(comments),
                    createdAt: new Date()
                });
            }

            await product.save();
        }

        console.log('Products updated successfully');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

updateData();
