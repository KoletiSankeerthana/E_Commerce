const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');
const connectDB = require('../config/db');

dotenv.config();

const updateData = async () => {
    try {
        await connectDB();

        const products = await Product.find({});
        console.log(`Found ${products.length} products`);

        for (let product of products) {
            // Updated Sizes (Adding XXL, XXXL)
            product.sizes = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];

            // Realistic Stock
            product.stockCount = Math.floor(Math.random() * 50) + 1; // 1 to 50
            product.countInStock = product.stockCount;

            // Cloth Type based on Category
            if (product.category === 'Men') {
                product.clothType = 'Cotton Blend';
                product.price = 1299; // Base realistic price
            } else if (product.category === 'Women') {
                product.clothType = 'Silk / Chiffon';
                product.price = 1799;
            } else if (product.category === 'Kids') {
                product.clothType = 'Soft Cotton';
                product.price = 699;
            } else if (product.category === 'Accessories') {
                product.clothType = 'Leather / Metal';
                product.price = 499;
            } else {
                product.clothType = 'Standard Material';
            }

            // Randomize price slightly for realism
            product.price += Math.floor(Math.random() * 500);

            await product.save();
            console.log(`Updated: ${product.name}`);
        }

        console.log("All products updated successfully");
        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

updateData();
