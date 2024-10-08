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
    status: {
        type: String,
    },
    order: {
        type: String,
    },
},
    { timestamps: true }
);

module.exports = mongoose.model('Payment', paymentSchema);