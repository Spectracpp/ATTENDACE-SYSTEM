const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

// Serve the QR scanner page (Admin only)
router.get("/scanner", auth, (req, res) => {
    if (req.userType !== "admin") {
        return res.status(403).json({ message: "Only admins can access the scanner" });
    }
    res.sendFile(path.join(__dirname, '../public/scanner.html'));
});

module.exports = router;
