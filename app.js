// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
});

app.get('/menu', (req, res) => {
    res.sendFile(__dirname + '/views/menu.html');
});

app.get('/order', (req, res) => {
    res.sendFile(__dirname + '/views/order.html');
});

app.get('/feedback', (req, res) => {
    res.sendFile(__dirname + '/views/feedback.html');
});

// More routes for handling form submissions, order placements, etc.

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// app.js (continued)
// API Routes
const MenuItem = require('./models/menuItem');
const { Order, OrderItem } = require('./models/order');
const Feedback = require('./models/feedback');

// Get all menu items
app.get('/api/menu', async (req, res) => {
    const menuItems = await MenuItem.find();
    res.json(menuItems);
});

// Place an order
app.post('/api/orders', async (req, res) => {
    const { name, email, menu_item_id } = req.body;

    // Generate order number
    const order_number = Math.random().toString(36).substring(7).toUpperCase();

    // Get menu item price
    const menuItem = await MenuItem.findById(menu_item_id);
    const price = menuItem.price;

    // Create order
    const order = new Order({
        user_id: null, // Add user ID if using authentication
        order_number,
        total_amount: price
    });
    await order.save();

    // Create order item
    const orderItem = new OrderItem({
        order_id: order._id,
        menu_item_id,
        quantity: 1,
        price
    });
    await orderItem.save();

    // Send notification to customer
    // Send notification email to owner
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'owner@restaurant.com',
        subject: 'New Order Placed',
        text: `A new order has been placed.\nOrder Number: ${order_number}\nTotal Amount: ${price}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });

    res.json({ order_number });
});

// Submit feedback
app.post('/api/feedback', async (req, res) => {
    const { name, email, message } = req.body;

    const feedback = new Feedback({
        user_id: null, // Add user ID if using authentication
        message
    });
    await feedback.save();

    // Send notification email to owner
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    let mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'owner@restaurant.com',
        subject: 'New Feedback Received',
        text: `New feedback has been submitted.\nName: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Email sent: ' + info.response);
    });

    res.json({ message: 'Feedback submitted successfully!' });
});
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log('MongoDB connection error:', err));
