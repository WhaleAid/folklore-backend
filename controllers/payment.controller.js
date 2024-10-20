const { Payment } = require('../models');
const dotenv = require('dotenv');

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
            amount: amount,
        });

        const stripe = require('stripe')(process.env.STRIPE_API_KEY);

        const price = await stripe.prices.create({
            unit_amount: amount * 100,
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

        res.json({ payment, paymentLink: paymentLink.url });
    } catch (error) {
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
        const payments = await Payment.find();
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.checkPassword = async (req, res) => {
    try {
        const { password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        if (hashedPassword === process.env.PASSWORD) {
            res.status(200).json({ message: 'Password is correct' });
        } else {
            res.status(401).json({ message: 'Password is incorrect' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}