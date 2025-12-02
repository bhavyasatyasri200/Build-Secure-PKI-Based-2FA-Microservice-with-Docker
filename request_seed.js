const fs = require('fs');
const https = require('https');

// Your details
const studentId = '23P31A0533';
const githubRepoUrl = 'https://github.com/bhavyasatyasri200/Build-Secure-PKI-Based-2FA-Microservice-with-Docker';
const apiHost = 'eajeyq4r3zljoq4rpovy2nthda0vtjqf.lambda-url.ap-south-1.on.aws';

// Read your student public key as-is
let publicKey;
try {
  publicKey = fs.readFileSync('student_public.pem', 'utf-8');
} catch (err) {
  console.error('❌ Failed to read student_public.pem:', err.message);
  process.exit(1);
}

// Prepare JSON payload
const postData = JSON.stringify({
  student_id: studentId,
  github_repo_url: githubRepoUrl,
  public_key: publicKey  // send raw PEM content
});

// HTTPS request options
const options = {
  hostname: apiHost,
  path: '/',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Send request
const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const resp = JSON.parse(data);
      if (resp.status === 'success') {
        fs.writeFileSync('encrypted_seed.txt', resp.encrypted_seed);
        console.log('✅ Encrypted seed saved to encrypted_seed.txt');
      } else {
        console.error('❌ API returned error:', resp);
      }
    } catch (e) {
      console.error('❌ Failed to parse API response:', e.message);
    }
  });
});

req.on('error', e => console.error('❌ Request failed:', e.message));

req.write(postData);
req.end();
