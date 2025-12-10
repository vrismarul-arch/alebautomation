require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const bodyParser = require("body-parser");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ----------------------------------
// MULTER STORAGE (Resume Upload)
// ----------------------------------
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Ensure uploads folder exists
if (!fs.existsSync("./uploads")) {
    fs.mkdirSync("./uploads");
}

// ----------------------------------
// CONTACT FORM API (Already Working)
// ----------------------------------
app.post("/send-mail", async (req, res) => {
    const { name, lastName, number, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "Missing Fields" });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ALEB Website Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: "New Website Contact Form Submission",
            html: `
                <h2>New Contact Message</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Phone:</b> ${number}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b> ${message}</p>
            `,
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.log("Email Error:", error);
        res.status(500).json({ success: false, message: "Email sending failed!" });
    }
});

// ----------------------------------
// CAREER FORM API WITH FILE UPLOAD
// ----------------------------------
app.post("/career-apply", upload.single("resume"), async (req, res) => {
    const {
        fullName,
        email,
        phone,
        position,
        experience,
        qualification,
        currentCompany,
        message,
        portfolio,
    } = req.body;

    if (!fullName || !email || !phone || !position || !req.file) {
        return res.status(400).json({
            success: false,
            message: "Required fields missing",
        });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"ALEB Careers Submission" <${process.env.EMAIL_USER}>`,
            to: process.env.RECEIVER_EMAIL,
            subject: `New Career Application – ${fullName} (${position})`,
            html: `
                <h2>New Career Application Received</h2>
                <p><b>Name:</b> ${fullName}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Phone:</b> ${phone}</p>
                <p><b>Position:</b> ${position}</p>
                <p><b>Experience:</b> ${experience}</p>
                <p><b>Qualification:</b> ${qualification}</p>
                <p><b>Current / Last Company:</b> ${currentCompany}</p>
                <p><b>Cover Letter:</b> ${message}</p>
                <p><b>Portfolio:</b> ${portfolio}</p>
                <p><b>Resume Attached Below</b></p>
            `,
            attachments: [
                {
                    filename: req.file.originalname,
                    path: req.file.path,
                },
            ],
        };

        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: "Application submitted successfully!" });
    } catch (err) {
        console.log("Career Email Error:", err);
        res.status(500).json({
            success: false,
            message: "Failed to submit application",
        });
    }
});

// ----------------------------------
// SERVER START
// ----------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Backend running on port ${PORT}`);
});
