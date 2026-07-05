const https = require('https');

https.get('https://operadora-dev.vercel.app/api/weather?city=Palacio%20Real%20de%20Madrid&date=2026-07-04', (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Response:', res.statusCode, data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});
