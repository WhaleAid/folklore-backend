const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const paymentRoutes = require('./routes/payment.routes');
const { payment } = require('./models');
const http = require('http');
const mongoose = require('mongoose');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const mongoDB = process.env.MONGODB_URI;

mongoose.connect(mongoDB)
    .then(() => console.log('MongoDB Client Connected'))
    .catch(error => console.log('MongoDB Client Error', error));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());
app.set('trust proxy', true);

app.get('/', (req, res) => {
    res.json({ message: 'Welcome to folklore API' });
});

paymentRoutes(app);

app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    console.log('Webhook received!');
    const sig = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const stripe = require('stripe')(process.env.STRIPE_API_KEY);

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        console.log(`Webhook signature verification failed: ${err.message}`);
        return res.sendStatus(400);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;

            const paymentId = session.metadata.paymentId;
            const payment = await payment.findByIdAndUpdate(paymentId, { status: 'Paid', order: 'pending' });

            console.log(`Payment ${paymentId} has been completed and updated.`);
            break;

        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;

            const paymentIntentId = paymentIntent.metadata.paymentId;
            await payment.findByIdAndUpdate(paymentIntentId, { status: 'Paid' });

            console.log(`Payment Intent ${paymentIntentId} was successful!`);
            break;

        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).end();
});

const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
