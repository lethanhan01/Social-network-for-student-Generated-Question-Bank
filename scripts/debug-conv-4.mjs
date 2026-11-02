import dns from 'node:dns';
dns.setDefaultResultOrder('ipv4first');

async function test() {
  const loginRes = await fetch('https://snsqb.duckdns.org/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'an.lt235631@sis.hust.edu.vn', password: '20235631', device_id: 'test', platform: 'WEB' })
  });
  const token = (await loginRes.json()).data?.access_token;
  const headers = { Authorization: 'Bearer ' + token };

  console.log('--- 1. Conversation list metadata for Conv 4 ---');
  const convRes = await fetch('https://snsqb.duckdns.org/api/v1/conversations', { headers });
  const convJson = await convRes.json();
  const conv4 = convJson.data?.items?.find(c => c.conversation_id === 4);
  console.log('Conv 4:', conv4);

  console.log('\n--- 2. GET /conversations/4/messages?limit=20 ---');
  const msgRes = await fetch('https://snsqb.duckdns.org/api/v1/conversations/4/messages?limit=20', { headers });
  console.log('Status:', msgRes.status);
  const msgJson = await msgRes.json();
  console.log('Pagination:', msgJson.data?.pagination);
  console.log('Total messages returned:', msgJson.data?.messages?.length);
  console.log('Messages list:');
  msgJson.data?.messages?.forEach((m, idx) => {
    console.log(`  [${idx}] id: ${m.message_id}, sender_id: ${m.sender_id}, sender_name: "${m.sender_name}", content: "${m.content}"`);
  });
}

test().catch(console.error);

