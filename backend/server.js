
const express = require("express");
const cors = require("cors");
const { Resend } = require("resend");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.send("Portfolio Backend is running!");
});

// Contact form API
app.post("/api/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // Validate fields
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: "Portfolio <onboarding@resend.dev>",
            to: ["ekanshsaraswat1234@gmail.com"],
            replyTo: email,
            subject: `New Portfolio Message from ${name}`,
            text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
        });

        if (error) {
            console.error("Resend Error:", error);

            return res.status(500).json({
                success: false,
                message: "Failed to send email",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Email sent successfully!",
            id: data.id,
        });
    } catch (error) {
        console.error("Server Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});