const fs = require('fs');
const crypto = require('crypto');

// Generate RSA 4096-bit key pair
function generateRSAKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 4096,
    publicExponent: 0x10001,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  fs.writeFileSync('student_private.pem', privateKey);
  fs.writeFileSync('student_public.pem', publicKey);

  console.log('✅ RSA 4096-bit key pair generated successfully!');
}

generateRSAKeyPair();
