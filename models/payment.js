const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    paymentStatus: {
        type: String,
    },
    orderStatus: {
        type: String,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);