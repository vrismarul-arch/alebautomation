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

// ------------------------------
// CREATE UPLOADS FOLDER
// ------------------------------
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

// ------------------------------
// MULTER STORAGE
// ------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});

const upload = multer({ storage });

// ------------------------------
// DEFAULT ROUTE
// ------------------------------
app.get("/", (req, res) => {
  res.send("ALEB Backend is Running Successfully 🚀");
});

// ------------------------------
// CONTACT FORM API
// ------------------------------
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

    // --------------------------
    // UI EMAIL TEMPLATE (CONTACT)
    // --------------------------
    const mailOptions = {
      from: `"ALEB Website Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL, cc: process.env.CC_EMAIL || "",
      subject: "New Website Contact Form Submission",

      html: `
      <div style="font-family: Poppins, sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">

          <h2 style="color: #1a237e; border-bottom: 2px solid #eee; padding-bottom: 8px;">
            📩 New Contact Message
          </h2>

          <p><b>Name:</b> ${name} ${lastName || ""}</p>
          <p><b>Phone:</b> ${number || "N/A"}</p>
          <p><b>Email:</b> ${email}</p>

          <div style="margin-top: 15px; padding: 15px; background: #fafafa; border-left: 4px solid #1a237e;">
            <b>Message:</b>
            <p>${message}</p>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #777;">
            This message was sent via <b>ALEB Website Contact Form</b>.
          </p>

        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "Message sent successfully!" });

  } catch (error) {
    console.log("Email Error:", error);
    res.status(500).json({ success: false, message: "Email sending failed!" });
  }
});

// ------------------------------
// CAREER FORM API
// ------------------------------
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
        user: process.env.EMAIL_USER_careers,
        pass: process.env.EMAIL_PASS_careers,
      },
    });

    // --------------------------
    // UI EMAIL TEMPLATE (CAREER)
    // --------------------------
    const mailOptions = {
      from: `"ALEB Careers Submission" <${process.env.EMAIL_USER_careers}>`,
      to: process.env.RECEIVER_EMAIL, cc: process.env.CC_EMAIL || "",
      subject: `New Career Application – ${fullName} (${position})`,
      
      html: `
      <div style="font-family: Poppins, sans-serif; padding: 20px; background: #f4f4f4;">
        <div style="max-width: 650px; margin: auto; background: white; border-radius: 10px; padding: 25px; box-shadow: 0 0 10px rgba(0,0,0,0.08);">

          <h2 style="color: #1a237e; border-bottom: 2px solid #eee; padding-bottom: 10px;">
            🧑‍💼 New Career Application
          </h2>

          <table style="width: 100%; margin-top: 15px;">
            <tr><td><b>Name:</b></td><td>${fullName}</td></tr>
            <tr><td><b>Email:</b></td><td>${email}</td></tr>
            <tr><td><b>Phone:</b></td><td>${phone}</td></tr>
            <tr><td><b>Position Applied:</b></td><td>${position}</td></tr>
            <tr><td><b>Experience:</b></td><td>${experience || "N/A"}</td></tr>
            <tr><td><b>Qualification:</b></td><td>${qualification || "N/A"}</td></tr>
            <tr><td><b>Current Company:</b></td><td>${currentCompany || "N/A"}</td></tr>
            <tr><td><b>Portfolio:</b></td><td>${portfolio || "N/A"}</td></tr>
          </table>

          <div style="margin-top: 20px; padding: 15px; background: #fafafa; border-left: 4px solid #1a237e;">
            <b>Message:</b>
            <p>${message || "No additional message provided."}</p>
          </div>

          <div style="margin-top: 20px;">
            <b>📎 Resume Attached</b>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #777;">
            Submitted via <b>ALEB Careers Page</b>.
          </p>

        </div>
      </div>
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

// ------------------------------
// START SERVER
// ------------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 ALEB Backend running on port ${PORT}`);
});
