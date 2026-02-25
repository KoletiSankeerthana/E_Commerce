const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        isAdmin: {
            type: Boolean,
            required: true,
            default: false,
        },
        cart: [
            {
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                size: {
                    type: String,
                    required: true,
                },
                quantity: {
                    type: Number,
                    required: true,
                    default: 1,
                },
            },
        ],
        wishlist: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],
        viewedProducts: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            }
        ],
        usedCoupons: [
            {
                code: String
            }
        ],
        addresses: [
            {
                fullName: { type: String, required: true },
                phone: { type: String, required: true },
                addressLine1: { type: String, required: true },
                addressLine2: { type: String },
                city: { type: String, required: true },
                state: { type: String, required: true },
                postalCode: { type: String, required: true },
                country: { type: String, required: true },
                landmark: String,
                addressType: { type: String, default: 'Home' },
                isDefault: { type: Boolean, default: false }
            }
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
