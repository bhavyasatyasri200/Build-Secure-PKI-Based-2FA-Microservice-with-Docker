const fs = require('fs');
const crypto = require('crypto');

// 1. Latest commit hash (from git log)
const commitHash = "06e907a11e7e1b17161442485bf4a446bf3e6605";

// 2. Load student private key
const privateKey = fs.readFileSync('student_private.pem', 'utf-8');

// 3. Sign commit hash with RSA-PSS-SHA256
const sign = crypto.createSign('sha256');
sign.update(commitHash, 'utf8'); // ASCII string
sign.end();

const signature = sign.sign({
  key: privateKey,
  padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
  saltLength: crypto.constants.RSA_PSS_SALTLEN_MAX_SIGN
});

// 4. Load instructor public key
const instructorPublicKey = fs.readFileSync('instructor_public.pem', 'utf-8');

// 5. Encrypt signature with instructor public key (RSA-OAEP-SHA256)
const encrypted = crypto.publicEncrypt(
  {
    key: instructorPublicKey,
    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
    oaepHash: "sha256"
  },
  signature
);

// 6. Base64 encode the encrypted signature
const encryptedBase64 = encrypted.toString('base64');

// 7. Output
console.log("Commit Hash:", commitHash);
console.log("Encrypted Signature (Base64):", encryptedBase64);
