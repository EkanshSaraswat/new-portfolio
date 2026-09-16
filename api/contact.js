const { Resend } = require("resend");

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight
    if (req.method === "OPTIONS") return res.status(200).end();

    // Only allow POST
    if (req.method !== "POST") {
        return res.status(405).json({ success: false, message: "Method Not Allowed" });
    }

    const { name, email, message } = req.body;

    // Validate fields
    if (!name || !email || !message) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    try {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const { data, error } = await resend.emails.send({
            from: "Portfolio <onboarding@resend.dev>",
            to: ["ekanshsaraswat1234@gmail.com"],
            replyTo: email,
            subject: `New Portfolio Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });

        if (error) {
            console.error("Resend Error:", error);
            return res.status(500).json({ success: false, message: "Failed to send email" });
        }

        return res.status(200).json({ success: true, message: "Email sent successfully!", id: data.id });
    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};
