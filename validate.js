const express = require('express');
const { Storage } = require('megajs');
const router = express.Router();

// Use environment variables or your own secure method for credentials.
const MEGA_EMAIL = process.env.MEGA_EMAIL || 'kibuukauthuman123@gmail.com';
const MEGA_PASSWORD = process.env.MEGA_PASSWORD || 'j42cvCmC2L_RF:2';

router.get('/', async (req, res) => {
  try {
    const { sessionId } = req.query;
    if (!sessionId || !sessionId.startsWith('Veronica;;;')) {
      return res.status(400).json({
        valid: false,
        message: "Invalid session ID format. It should start with 'Veronica;;;'."
      });
    }

    // Extract the file identifier
    const fileId = sessionId.split('Veronica;;;')[1];
    if (!fileId) {
      return res.status(400).json({
        valid: false,
        message: "Session ID is missing the file identifier."
      });
    }

    // Log in to your Mega account
    const storage = await new Storage({
      email: MEGA_EMAIL,
      password: MEGA_PASSWORD
    }).ready;
    
    // The megajs Storage instance populates a "files" object mapping file/node ids to nodes.
    // Check whether the file exists in your account.
    if (storage.files[fileId]) {
      // Generate a public link for the file (if available)
      const megaUrl = await storage.files[fileId].link();
      return res.json({
        valid: true,
        message: "Session ID is valid. File found in your Mega account.",
        megaUrl: megaUrl
      });
    } else {
      return res.status(404).json({
        valid: false,
        message: "Session ID is invalid. File not found in your Mega account."
      });
    }
  } catch (err) {
    console.error("Error in /check-session:", err);
    res.status(500).json({
      valid: false,
      message: "Internal server error while checking session ID."
    });
  }
});

module.exports = router;
