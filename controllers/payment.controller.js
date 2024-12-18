const { Payment } = require('../models');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');

exports.createPayment = async (req, res) => {
    try {
        const { email, message, amount } = req.body;

        if (!email || !message || !amount) {
            console.log('Please provide amount, email, and message');
            return res.status(400).json({ message: 'Please provide email, and message' });
        }


        const payment = await Payment.create({
            email: email,
            message: message,
            amount: amount / 100,
        });

        const stripe = require('stripe')(process.env.STRIPE_API_KEY);

        const price = await stripe.prices.create({
            unit_amount: amount,
            currency: 'eur',
            product_data: {
                name: message,
            },
        });

        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
                {
                    price: price.id,
                    quantity: 1,
                },
            ],
            metadata: { paymentId: payment._id.toString() },
            after_completion: {
                redirect: {
                    url: `${process.env.CLIENT_URL}/payment/${payment._id.toString()}/success`,
                },
                type: 'redirect',
            }
        });

        res.status(200).json({ payment, paymentLink: paymentLink.url });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
}

exports.getPayment = async (req, res) => {
    try {
        const paymentId = req.params.id;
        if (!paymentId) {
            return res.status(400).json({ message: 'payment id missing' });
        }

        const payment = await Payment.findById(paymentId)
        if (!payment) {
            return res.status(404).json({ message: 'payment not found' });
        }

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find().sort({ createdAt: -1 });
        res.status(200).json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.checkPassword = async (req, res) => {
    try {
        const { password } = req.body;
        if (password === process.env.PASSWORD) {
            res.status(200).json({ message: 'Password is correct' });
        } else {
            res.status(401).json({ message: 'Password is incorrect' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.orderStatus = async (req, res) => {
    try {
        const { paymentId, orderStatus } = req.body;

        if (!paymentId || !orderStatus) {
            return res.status(400).json({ message: 'Please provide paymentId and orderStatus' });
        }

        const payment = await Payment.findByIdAndUpdate(paymentId, { order: orderStatus });

        res.json(payment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}