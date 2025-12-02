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

// Code to verify (replace with code you generated)
const codeToVerify = process.argv[2]; // pass code as command line arg

if (!codeToVerify) {
    console.error("❌ Please provide the TOTP code as argument. Example:");
    console.error("node verify_2fa.js 123456");
    process.exit(1);
}

// Configure TOTP
totp.options = { digits: 6, step: 30 };

// Verify code
const isValid = totp.check(codeToVerify, hexSeed);

console.log(`✅ Code ${codeToVerify} is ${isValid ? "valid" : "invalid"}`);
