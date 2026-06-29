require('dotenv').config({ path: '.env.local' });
const { GET } = require('./src/app/api/payments/route');

async function test() {
  const req = { url: 'http://localhost/api/payments?tenantId=1' };
  const res = await GET(req);
  console.log(res);
}
test();
