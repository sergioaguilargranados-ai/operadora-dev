require('dotenv').config({path:'.env.local'});
const key=process.env.GEMINI_API_KEY;

async function testModel(m) {
  console.log('Testing', m);
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${key}`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{parts:[{text:'hola'}]}]})
  });
  console.log(m, r.status, await r.text());
}

testModel('gemini-2.5-flash')
  .then(() => testModel('gemini-2.0-flash'))
  .then(() => testModel('gemini-1.5-flash'))
  .catch(console.error);
