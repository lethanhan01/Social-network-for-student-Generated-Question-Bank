/**
 * Module thiết lập hội thoại 1-1, nhóm chat học tập và gửi tin nhắn qua STOMP WebSocket
 */

import { CHAT_DATA } from '../data/chat.data.mjs';
import { httpClient } from './client.mjs';

function sendWsMessage(token, conversationId, content) {
  return new Promise((resolve, reject) => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    const wsUrl = `wss://snsqb.duckdns.org/api/v1/ws/999/${sessionId}/websocket`;
    const ws = new WebSocket(wsUrl);
    let isConnected = false;

    const timeout = setTimeout(() => {
      try { ws.close(); } catch {}
      resolve(false);
    }, 4000);

    ws.onopen = () => {
      const connectFrame = `CONNECT\naccept-version:1.2,1.1,1.0\nheart-beat:10000,10000\nAuthorization:Bearer ${token}\n\n\0`;
      ws.send(JSON.stringify([connectFrame]));
    };

    ws.onmessage = (e) => {
      if (typeof e.data === 'string' && e.data.includes('CONNECTED')) {
        isConnected = true;
        const payload = JSON.stringify({
          conversation_id: conversationId,
          content
        });
        const sendFrame = `SEND\ndestination:/app/chat.send\ncontent-type:application/json\n\n${payload}\0`;
        ws.send(JSON.stringify([sendFrame]));

        setTimeout(() => {
          clearTimeout(timeout);
          try { ws.close(); } catch {}
          resolve(true);
        }, 300);
      }
    };

    ws.onerror = (err) => {
      clearTimeout(timeout);
      try { ws.close(); } catch {}
      resolve(false);
    };
  });
}

export async function setupChatAndMessages(sessionMap) {
  console.log('\n[5/7 CHAT] Đang thiết lập các cuộc hội thoại và gửi tin nhắn thời gian thực...');
  const recordedDirects = [];
  const recordedGroups = [];

  // 1. Tạo các cuộc hội thoại 1-1
  for (const directDef of CHAT_DATA.directs) {
    const sessionA = sessionMap.get(directDef.userA);
    const sessionB = sessionMap.get(directDef.userB);
    if (!sessionA || !sessionB) continue;

    const res = await httpClient.post(
      '/conversations/direct',
      { target_user_id: directDef.userB },
      sessionA.token
    );

    let convId = null;
    if (res.ok && res.data?.conversation_id) {
      convId = res.data.conversation_id;
    } else {
      // Nếu đã tồn tại hội thoại từ trước, fetch danh sách conversations
      const listRes = await httpClient.get('/conversations', sessionA.token);
      const existing = listRes.data?.items?.find(c => c.type === 'DIRECT' && c.partner?.user_id === directDef.userB);
      if (existing) convId = existing.conversation_id;
    }

    if (convId) {
      recordedDirects.push(convId);
      console.log(`  ✓ Hội thoại 1-1 [ID: ${convId}]: ${sessionA.shortName} <-> ${sessionB.shortName}`);

      // Gửi các tin nhắn mẫu
      for (const msg of directDef.messages) {
        const sender = sessionMap.get(msg.senderId);
        if (!sender) continue;
        const sent = await sendWsMessage(sender.token, convId, msg.text);
        if (sent) {
          console.log(`    ↳ [${sender.shortName}]: "${msg.text.slice(0, 45)}..."`);
        }
      }
    }
  }

  // 2. Tạo nhóm chat học tập chung
  const groupDef = CHAT_DATA.group;
  const creatorSession = sessionMap.get(groupDef.creatorId);

  if (creatorSession) {
    const groupRes = await httpClient.post(
      '/conversations/group',
      {
        name: groupDef.name,
        member_ids: groupDef.memberIds
      },
      creatorSession.token
    );

    let groupConvId = null;
    if (groupRes.ok && groupRes.data?.conversation_id) {
      groupConvId = groupRes.data.conversation_id;
    } else {
      // Tìm lại nếu đã tạo trước đó
      const listRes = await httpClient.get('/conversations', creatorSession.token);
      const existing = listRes.data?.items?.find(c => c.type === 'GROUP' && c.name?.includes(groupDef.name));
      if (existing) groupConvId = existing.conversation_id;
    }

    if (groupConvId) {
      recordedGroups.push(groupConvId);
      console.log(`  ✓ Nhóm chat [ID: ${groupConvId}]: "${groupDef.name}" (4 thành viên)`);

      // Gửi chuỗi tin nhắn trao đổi trong nhóm
      for (const msg of groupDef.messages) {
        const sender = sessionMap.get(msg.senderId);
        if (!sender) continue;
        const sent = await sendWsMessage(sender.token, groupConvId, msg.text);
        if (sent) {
          console.log(`    ↳ [${sender.shortName}]: "${msg.text.slice(0, 50)}..."`);
        }
      }
    }
  }

  return {
    directs: recordedDirects,
    groups: recordedGroups
  };
}

