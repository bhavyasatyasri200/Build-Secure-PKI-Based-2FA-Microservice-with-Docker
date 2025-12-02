// server.js
const express = require("express");
const fs = require("fs");
const path = require("path");

const { decrypt_seed } = require("./decrypt");
const { generate_totp_code, verify_totp_code } = require("./totp");

const app = express();
app.use(express.json());

// Directory where seed is stored (required for Docker volume)
const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const SEED_PATH = path.join(DATA_DIR, "seed.txt");


// ------------------------------------------------------
// 1️⃣ POST /decrypt-seed
// ------------------------------------------------------
app.post("/decrypt-seed", (req, res) => {
  try {
    const { encrypted_seed } = req.body;
    if (!encrypted_seed) {
      return res.status(400).json({ error: "Missing encrypted_seed" });
    }

    const seed = decrypt_seed(encrypted_seed);

    // Validate hex seed
    if (!/^[0-9a-f]{64}$/i.test(seed)) {
      return res.status(500).json({ error: "Invalid decrypted seed format" });
    }

    // Save seed persistently
    fs.writeFileSync(SEED_PATH, seed, "utf8");

    return res.json({ status: "ok" });

  } catch (err) {
    console.error("Decryption failed:", err.message);
    return res.status(500).json({ error: "Decryption failed" });
  }
});


// ------------------------------------------------------
// 2️⃣ GET /generate-2fa
// ------------------------------------------------------
app.get("/generate-2fa", (req, res) => {
  try {
    if (!fs.existsSync(SEED_PATH)) {
      return res.status(500).json({ error: "Seed not decrypted yet" });
    }

    const seed = fs.readFileSync(SEED_PATH, "utf8").trim();

    const code = generate_totp_code(seed);

    // How many seconds remain in current 30-sec window?
    const now = Math.floor(Date.now() / 1000);
    const valid_for = 30 - (now % 30);

    return res.json({ code, valid_for });

  } catch (err) {
    console.error("Generate 2FA error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
});


// ------------------------------------------------------
// 3️⃣ POST /verify-2fa
// ------------------------------------------------------
app.post("/verify-2fa", (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Missing code" });
    }

    if (!fs.existsSync(SEED_PATH)) {
      return res.status(500).json({ error: "Seed not decrypted yet" });
    }

    const seed = fs.readFileSync(SEED_PATH, "utf8").trim();

    const isValid = verify_totp_code(seed, code);

    return res.json({ valid: isValid });

  } catch (err) {
    console.error("Verify error:", err.message);
    return res.status(500).json({ error: "Internal error" });
  }
});


// ------------------------------------------------------
// Start API Server
// ------------------------------------------------------
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`✅ 2FA Microservice running on port ${PORT}`);
});
