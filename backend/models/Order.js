const mongoose = require('mongoose');

const orderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product"
            },
            size: String,
            quantity: Number
        }
    ],
    totalPrice: {
        type: Number,
        required: true
    },
    address: {
        fullName: String,
        phone: String,
        addressLine: String,
        city: String,
        state: String,
        country: String,
        pincode: String,
        landmark: String
    },
    paymentMethod: {
        type: String,
        default: "COD"
    },
    orderId: {
        type: String,
        unique: true
    },
    orderStatus: {
        type: String,
        enum: ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
        default: "Placed"
    },
    isCancelled: {
        type: Boolean,
        default: false
    },
    paymentStatus: {
        type: String,
        default: "PENDING"
    },
    trackingSteps: [
        {
            status: String,
            date: Date
        }
    ],
    cancelAllowedUntil: Date,
    returnStatus: {
        type: String,
        enum: ["None", "Requested", "Approved", "Rejected", "Completed"],
        default: "None"
    },
    returnRequestedAt: Date,
    returnCompletedAt: Date,
    returnReason: {
        type: String,
        default: ""
    },
    returnDescription: {
        type: String,
        default: ""
    },
    returnEligible: {
        type: Boolean,
        default: true
    },
    returnWindowExpiresAt: Date,
    paymentDetails: {
        method: String,
        upiId: String,
        cardLast4: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
