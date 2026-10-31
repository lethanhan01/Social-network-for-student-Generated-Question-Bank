/**
 * Kịch bản tự động kiểm tra và giải phóng (unblock) toàn bộ hội thoại bị lỗi 500 cho 5 tài khoản sinh viên
 */
import { CONFIG } from './config.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000);
    }
  }
}

function sendWsMessage(token, conversationId, content) {
  return new Promise((resolve) => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    const wsUrl = `wss://snsqb.duckdns.org/api/v1/ws/999/${sessionId}/websocket`;
    const ws = new WebSocket(wsUrl);

    const timer = setTimeout(() => {
      try { ws.close(); } catch {}
      resolve(false);
    }, 5000);

    ws.onopen = () => {
      const connectFrame = `CONNECT\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\nAuthorization:Bearer ${token}\n\n\0`;
      ws.send(JSON.stringify([connectFrame]));
    };

    ws.onmessage = (event) => {
      const str = String(event.data);
      if (str.includes('CONNECTED')) {
        const payload = JSON.stringify({
          conversation_id: conversationId,
          content
        });
        const sendFrame = `SEND\ndestination:/app/chat.send\ncontent-type:application/json\n\n${payload}\0`;
        ws.send(JSON.stringify([sendFrame]));

        setTimeout(() => {
          clearTimeout(timer);
          try { ws.close(); } catch {}
          resolve(true);
        }, 800);
      }
    };

    ws.onerror = () => {
      clearTimeout(timer);
      try { ws.close(); } catch {}
      resolve(false);
    };
  });
}

async function loginUser(email, password) {
  try {
    const res = await fetchWithRetry(`${CONFIG.API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        password,
        device_id: CONFIG.DEVICE_ID,
        platform: CONFIG.PLATFORM
      })
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data?.access_token || null;
  } catch {
    return null;
  }
}

async function unblockAll() {
  console.log('=== BẮT ĐẦU KIỂM TRA VÀ MỞ KHÓA TOÀN BỘ HỘI THOẠI BỊ KẸT ===\n');

  for (const acc of CONFIG.ACCOUNTS) {
    console.log(`Kiểm tra tài khoản: ${acc.shortName} (${acc.email})`);
    const token = await loginUser(acc.email, acc.password);
    if (!token) {
      console.log(`  ✗ Đăng nhập thất bại cho ${acc.email}`);
      continue;
    }

    const headers = { 'Authorization': `Bearer ${token}` };
    const convRes = await fetchWithRetry(`${CONFIG.API_BASE_URL}/conversations`, { headers });
    const convData = await convRes.json();
    const items = convData?.data?.items || [];

    for (const conv of items) {
      await sleep(300);
      const checkRes = await fetchWithRetry(`${CONFIG.API_BASE_URL}/conversations/${conv.conversation_id}/messages?limit=20`, { headers });
      if (checkRes.status === 200) {
        console.log(`  ✓ Hội thoại #${conv.conversation_id} (${conv.type}): OK (unread: ${conv.unread_count})`);
      } else {
        console.log(`  ⚠ Hội thoại #${conv.conversation_id} (${conv.type}): Bị lỗi ${checkRes.status} (unread: ${conv.unread_count}). Đang tự động giải phóng...`);
        const sent = await sendWsMessage(token, conv.conversation_id, 'Đồng bộ kết nối hội thoại #SQB_SYNC');
        if (sent) {
          await sleep(500);
          const recheck = await fetchWithRetry(`${CONFIG.API_BASE_URL}/conversations/${conv.conversation_id}/messages?limit=20`, { headers });
          if (recheck.status === 200) {
            console.log(`    ↳ ĐÃ MỞ KHÓA THÀNH CÔNG! Trạng thái mới: 200 OK`);
          } else {
            console.log(`    ↳ Chưa thể mở khóa: ${recheck.status}`);
          }
        } else {
          console.log(`    ↳ Không thể kết nối WebSocket để mở khóa.`);
        }
      }
    }
    await sleep(500);
  }

  console.log('\n=== HOÀN TẤT TIẾN TRÌNH GIẢI PHÓNG HỘI THOẠI ===');
}

unblockAll().catch(console.error);
