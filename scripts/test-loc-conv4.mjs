import dns from 'node:dns';

const origLookup = dns.lookup;
dns.lookup = (hostname, options, callback) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  if (hostname === 'snsqb.duckdns.org') {
    if (options && options.all) {
      return callback(null, [{ address: '160.191.46.107', family: 4 }]);
    }
    return callback(null, '160.191.46.107', 4);
  }
  return origLookup(hostname, options, callback);
};

async function test() {
  // 1. Loc
  const loginLoc = await fetch('https://snsqb.duckdns.org/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'Loc.ns235766@sis.hust.edu.vn', password: '20235766', device_id: 'test', platform: 'WEB' })
  });
  const tokenLoc = (await loginLoc.json()).data?.access_token;
  console.log('--- LOC ---');
  await checkAccount(tokenLoc, 'Loc');

  // 2. An
  const loginAn = await fetch('https://snsqb.duckdns.org/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'an.lt235631@sis.hust.edu.vn', password: '20235631', device_id: 'test', platform: 'WEB' })
  });
  const tokenAn = (await loginAn.json()).data?.access_token;
  console.log('--- AN ---');
  await checkAccount(tokenAn, 'An');
}

async function checkAccount(token, name) {
  if (!token) {
    console.log(`No token for ${name}`);
    return;
  }
  const headers = { Authorization: 'Bearer ' + token };
  const convRes = await fetch('https://snsqb.duckdns.org/api/v1/conversations', { headers });
  const convData = await convRes.json();
  const conv4 = convData.data?.items?.find(c => c.conversation_id === 4);
  console.log(`${name} Conv 4: unread =`, conv4?.unread_count, 'last_msg =', conv4?.last_message);

  const msgRes = await fetch('https://snsqb.duckdns.org/api/v1/conversations/4/messages?limit=20', { headers });
  console.log(`${name} GET /messages status:`, msgRes.status);
  if (msgRes.ok) {
    const json = await msgRes.json();
    console.log(`${name} messages count:`, json.data?.messages?.length);
    console.log(`${name} messages:`, json.data?.messages?.map(m => ({ id: m.message_id, text: m.content, sender: m.sender_id })));
  } else {
    console.log(`${name} GET messages failed:`, await msgRes.text());
  }
}

test().catch(console.error);
