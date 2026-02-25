const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const connectDB = require('../config/db');

dotenv.config();

connectDB();

const applyDiscounts = async () => {
    try {
        const products = await Product.find({});

        for (const product of products) {
            // Randomize stock for EVERY product as requested: "like for example in stock(10) like that for each product not only 10 any random number"
            product.countInStock = Math.floor(Math.random() * 50) + 1; // 1 to 50 items

            // Apply discounts to "few products only"
            // Let's say 40% of products get a discount
            const shouldHaveDiscount = Math.random() < 0.4;

            if (shouldHaveDiscount) {
                // min discount is 20% and maximum is 70%
                const discount = Math.floor(Math.random() * (70 - 20 + 1)) + 20;

                let basePrice = product.originalPrice || product.price;

                product.originalPrice = basePrice;
                product.discountPercentage = discount;
                product.hasDiscount = true;
                // product cost shoudl be according to the discount
                product.price = Math.round(basePrice * (1 - discount / 100));
            } else {
                // Reset discount if it was somehow set before
                if (product.hasDiscount) {
                    product.price = product.originalPrice || product.price;
                    product.hasDiscount = false;
                    product.discountPercentage = 0;
                }
            }

            await product.save();
        }

        console.log('Discounts applied successfully');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

applyDiscounts();
