// decrypt_seed.js
const fs = require("fs");
const crypto = require("crypto");

/**
 * Decrypt base64 encrypted seed using RSA-OAEP with SHA-256
 */
function decryptSeed() {
    try {
        // 1. Read encrypted seed (Base64)
        const encryptedB64 = fs.readFileSync("encrypted_seed.txt", "utf8").trim();

        // 2. Read private key
        const privateKey = fs.readFileSync("student_private.pem", "utf8");

        // 3. Convert Base64 → Buffer
        const encryptedBuffer = Buffer.from(encryptedB64, "base64");

        // 4. Decrypt using RSA-OAEP (SHA-256)
        const decryptedBuffer = crypto.privateDecrypt(
            {
                key: privateKey,
                padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
                oaepHash: "sha256",
            },
            encryptedBuffer
        );

        // 5. Convert decrypted bytes → UTF-8 string
        const seed = decryptedBuffer.toString("utf8");

        // 6. Validate that seed is a 64-char hex string
        const hexCheck = /^[0-9a-f]{64}$/;

        if (!hexCheck.test(seed)) {
            console.error("❌ Invalid seed format! Expected 64-character hex string.");
            console.error("Decrypted value:", seed);
            return;
        }

        console.log("✅ Seed successfully decrypted!");
        console.log("Decrypted Seed:", seed);

        // Save seed locally (your container will later save inside /data/seed.txt)
        fs.writeFileSync("seed.txt", seed);

        console.log("📁 Seed saved to seed.txt");

    } catch (err) {
        console.error("❌ Decryption failed:", err.message);
    }
}

decryptSeed();
