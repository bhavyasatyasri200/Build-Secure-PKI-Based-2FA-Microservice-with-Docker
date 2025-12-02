const fs = require("fs");
const { totp } = require("otplib");

// Path to decrypted seed
const SEED_PATH = "seed.txt";

// Check if seed exists
if (!fs.existsSync(SEED_PATH)) {
    console.error("❌ Seed not decrypted yet. Run decrypt_seed.js first.");
    process.exit(1);
}

// Read hex seed
const hexSeed = fs.readFileSync(SEED_PATH, "utf8").trim();

// Configure TOTP
totp.options = { digits: 6, step: 30 }; // 6-digit TOTP, 30-second period

// Generate TOTP
const code = totp.generate(hexSeed);

// Calculate seconds remaining in current period
const epoch = Math.floor(Date.now() / 1000);
const valid_for = 30 - (epoch % 30);

console.log("✅ TOTP code generated!");
console.log("Code:", code);
console.log("Valid for (seconds):", valid_for);
