/**
 * Kịch bản dọn dẹp sạch sẽ các tin nhắn test tạm (#SQB_SYNC) đã gửi trong các lần thử trước
 */
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import { CONFIG } from './config.mjs';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRetry(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url, options);
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(1000);
    }
  }
}

async function loginUser(email, password) {
  try {
    const res = await fetchRetry(`${CONFIG.API_BASE_URL}/auth/login`, {
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

async function cleanupSyncMessages() {
  console.log('=== BẮT ĐẦU THU HỒI / DỌN DẸP TIN NHẮN TẠM #SQB_SYNC ===\n');

  for (const acc of CONFIG.ACCOUNTS) {
    const token = await loginUser(acc.email, acc.password);
    if (!token) continue;
    const headers = { 'Authorization': `Bearer ${token}` };

    // Lấy danh sách hội thoại
    const convRes = await fetchRetry(`${CONFIG.API_BASE_URL}/conversations`, { headers });
    if (!convRes.ok) continue;
    const convData = await convRes.json();
    const items = convData.data?.items || [];

    for (const c of items) {
      // Thử lấy tin nhắn gần đây để tìm tin #SQB_SYNC của chính user này
      try {
        const msgRes = await fetchRetry(`${CONFIG.API_BASE_URL}/conversations/${c.conversation_id}/messages?limit=50`, { headers });
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          const syncMsgs = (msgData.data?.messages || []).filter(
            m => m.content && m.content.includes('#SQB_SYNC') && m.sender_id === acc.expectedId
          );

          for (const m of syncMsgs) {
            console.log(`Thu hồi tin nhắn #${m.message_id} từ ${acc.shortName} trong conv #${c.conversation_id}...`);
            const delRes = await fetchRetry(`${CONFIG.API_BASE_URL}/messages/${m.message_id}?mode=EVERYONE`, {
              method: 'DELETE',
              headers
            });
            if (delRes.ok) {
              console.log(`  ✓ Đã thu hồi #${m.message_id} thành công!`);
            }
            await sleep(300);
          }
        }
      } catch (err) {
        // bỏ qua nếu conv đang kẹt
      }
    }
  }

  console.log('\n=== HOÀN TẤT TIẾN TRÌNH DỌN DẸP TIN NHẮN TẠM ===');
}

cleanupSyncMessages().catch(console.error);

