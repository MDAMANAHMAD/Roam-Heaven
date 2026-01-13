const express = require('express');
const app = express();
const mongoose = require('mongoose');
const List = require('./models/list');
const Review = require('./models/review');
const User = require('./models/user');
const Booking = require('./models/booking');
const path = require('path');
const method = require('method-override');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const ExpressError = require('./utils/expresserror.js');
const nodemailer = require('nodemailer');

console.log(">>> DEPLOYMENT VERSION: SMTP_FIX_V3 <<<");

// Email Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 15000, // 15 seconds
    greetingTimeout: 15000,
    socketTimeout: 15000
});

const sendConfirmationEmail = async (to, bookingDetails) => {
    try {
        console.log(`Sending confirmation email to: ${to} using ${process.env.EMAIL_USER}`);
        const mailOptions = {
            from: `"Roam Heaven" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Roam Heaven Booking Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
                    <div style="background: #ff385c; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Booking Confirmed!</h1>
                    </div>
                    <div style="padding: 30px;">
                        <p style="font-size: 16px; color: #222;">Dear Customer,</p>
                        <p style="font-size: 16px; color: #484848;">Your stay at <strong>${bookingDetails.listing.title}</strong> is confirmed. Pack your bags!</p>
                        
                        <div style="background: #f7f7f7; padding: 25px; border-radius: 15px; margin: 25px 0;">
                            <h3 style="margin-top: 0; color: #222;">Trip Details</h3>
                            <p style="margin: 8px 0;"><strong>Check-in:</strong> ${new Date(bookingDetails.checkIn).toLocaleDateString()}</p>
                            <p style="margin: 8px 0;"><strong>Check-out:</strong> ${new Date(bookingDetails.checkOut).toLocaleDateString()}</p>
                            <p style="margin: 8px 0;"><strong>Guests:</strong> ${bookingDetails.guests}</p>
                            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #ddd; font-size: 18px; font-weight: bold;">
                                Total Price: ₹${bookingDetails.totalPrice.toLocaleString('en-IN')}
                            </div>
                        </div>
                        
                        <p style="color: #717171; font-size: 14px;">If you have any questions, feel free to reply to this email.</p>
                        <p style="margin-top: 30px; font-weight: bold; color: #222;">The Roam Heaven Team</p>
                    </div>
                </div>
            `
        };
        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent successfully:", info.messageId);
    } catch (error) {
        console.error("CRITICAL EMAIL ERROR:", error.message);
        if (error.code === 'EAUTH') {
            console.error("AUTHENTICATION FAILED: Please check EMAIL_USER and EMAIL_PASS on Render.");
        }
    }
};

// Middlewares
app.use(cors()); // Allow all origins for production ease, or specify your vercel URL
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(method('_method'));

const port = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'fallbacksecret';

// Auth Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access denied. Login required." });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid token" });
        req.user = user;
        next();
    });
};

// Database Connection
async function main() {
    const dbUrl = process.env.ATLASDB_URL || 'mongodb://127.0.0.1:27017/wanderlust';
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");

    // Seed Users
    try {
        // Admin
        const adminEmail = process.env.EMAIL_USER || "admin@gmail.com";
        const adminUser = await User.findOne({ email: adminEmail });
        if (!adminUser) {
            const newAdmin = new User({ email: adminEmail, username: "admin", role: "admin" });
            await User.register(newAdmin, "admin123");
            console.log(`Admin user seeded: ${adminEmail}`);
        }

        // Demo User
        const demoEmail = "user@gmail.com";
        const demoUser = await User.findOne({ email: demoEmail });
        if (!demoUser) {
            const newUser = new User({ email: demoEmail, username: "demo_user", role: "user" });
            await User.register(newUser, "password123");
            console.log("Demo user seeded: user@gmail.com");
        }
    } catch (e) {
        console.log("Seeding notice:", e.message);
    }
}
main().catch(err => console.log(err));

// --- AUTH ROUTES ---

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = new User({ email, username, role: 'user' });
        const registeredUser = await User.register(user, password);

        const token = jwt.sign({ id: registeredUser._id, username: registeredUser.username, role: registeredUser.role }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: registeredUser._id, username: registeredUser.username, email: registeredUser.email, role: registeredUser.role } });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`); // Debug log

        // Find user by email first
        const userFound = await User.findOne({ email });
        if (!userFound) {
            console.log("User not found via email lookup");
            return res.status(400).json({ error: "User not found with this email" });
        }

        // Authenticate using the username from the found user
        try {
            const { user } = await User.authenticate()(userFound.username, password);
            if (!user) {
                console.log("Password verification failed for:", userFound.username);
                return res.status(400).json({ error: "Invalid password" });
            }
            const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
            res.json({ token, user: { id: user._id, username: user.username, email: user.email, role: user.role } });
        } catch (authError) {
            console.log("Authentication error:", authError);
            return res.status(400).json({ error: "Authentication failed" });
        }

    } catch (err) {
        console.error("Login server error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- LISTING ROUTES ---

app.get('/api/listings', async (req, res) => {
    const allListings = await List.find({});
    res.json(allListings);
});

app.get('/api/listings/:id', async (req, res) => {
    try {
        const listing = await List.findById(req.params.id).populate('reviews');
        if (!listing) return res.status(404).json({ error: "Listing not found" });
        res.json(listing);
    } catch (err) {
        res.status(400).json({ error: "Invalid ID format" });
    }
});

// Protected Listing Routes
app.post('/api/listings', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Only admins can create listings" });
        }
        const newList = new List({ ...req.body, image: { url: req.body.url || req.body.image } });
        await newList.save();
        res.status(201).json(newList);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/listings/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Only admins can edit listings" });
        }
        const { id } = req.params;
        const { title, description, url, price, location, country } = req.body;

        const updatedListing = await List.findByIdAndUpdate(id, {
            title,
            description,
            image: { url },
            price,
            location,
            country
        }, { new: true });

        if (!updatedListing) return res.status(404).json({ error: "Listing not found" });
        res.json(updatedListing);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/listings/:id', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Only admins can delete listings" });
        }
        const { id } = req.params;
        const deletedListing = await List.findByIdAndDelete(id);

        if (!deletedListing) return res.status(404).json({ error: "Listing not found" });
        res.json({ message: "Listing deleted successfully" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// --- BOOKING ROUTES ---

app.post('/api/bookings', authenticateToken, async (req, res) => {
    try {
        const { listingId, checkIn, checkOut, guests, totalPrice } = req.body;
        const booking = new Booking({
            listing: listingId,
            user: req.user.id,
            checkIn,
            checkOut,
            guests,
            totalPrice
        });
        await booking.save();

        // Populate listing details for email
        await booking.populate('listing');

        // Get user email to send confirmation (using req.user info or fetching full user)
        const user = await User.findById(req.user.id);
        if (user && user.email) {
            // Send Email in background (don't await to keep response fast, or await if critical)
            sendConfirmationEmail(user.email, booking);
        }

        res.status(201).json({ message: "Booking successful!", booking });
    } catch (err) {
        console.error("Booking error:", err);
        res.status(400).json({ error: err.message });
    }
});

app.get('/api/my-bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('listing')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied" });
        }
        const bookings = await Booking.find({})
            .populate('listing')
            .populate('user')
            .sort({ createdAt: -1 });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- REVIEW ROUTES ---

app.post('/api/listings/:id/reviews', authenticateToken, async (req, res) => {
    try {
        const listing = await List.findById(req.params.id);
        if (!listing) return res.status(404).json({ error: "Listing not found" });

        const newReview = new Review(req.body.reviews);
        listing.reviews.push(newReview);
        await newReview.save();
        await listing.save();
        res.status(201).json(newReview);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Port Listening
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Error handling
app.all('*', (req, res, next) => {
    next(new ExpressError(404, 'API endpoint not found'));
});

app.use((err, req, res, next) => {
    const { Statuscode = 500, message = 'Something went wrong' } = err;
    res.status(Statuscode).json({ error: message });
});
