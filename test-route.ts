import { config } from 'dotenv';
config({path: '.env.local'});
import { NextRequest } from 'next/server';
import { POST } from './src/app/api/communication/messages/route';

async function test() {
  const req = new NextRequest('http://localhost/api/communication/messages', {
    method: 'POST',
    body: JSON.stringify({
      thread_id: 24,
      sender_id: 1,
      sender_type: 'agent',
      sender_name: 'Usuario',
      body: '¡Hola! Recuerda subir la copia de tu pasaporte',
      message_type: 'alert',
      tenant_id: 1
    })
  });
  
  const res = await POST(req);
  console.log(res.status);
  console.log(await res.json());
}
test().catch(console.error).finally(()=>process.exit(0));
