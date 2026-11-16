/**
 * Module thiết lập hội thoại 1-1, 3 nhóm chat đa vai trò (Student, Teacher, Lớp học phần),
 * tự động chấp nhận lời mời nhóm cho thành viên khác vai trò và gửi tin nhắn qua STOMP WebSocket.
 */

import { CHAT_DATA } from '../data/chat.data.mjs';
import { httpClient } from './client.mjs';

function sendWsMessage(token, conversationId, content) {
  return new Promise((resolve) => {
    const sessionId = Math.random().toString(36).substring(2, 10);
    const wsUrl = `wss://snsqb.duckdns.org/api/v1/ws/999/${sessionId}/websocket`;
    const ws = new WebSocket(wsUrl);

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

    ws.onerror = () => {
      clearTimeout(timeout);
      try { ws.close(); } catch {}
      resolve(false);
    };
  });
}

async function acceptPendingGroupInvitations(sessionMap, memberIds, groupConvId) {
  for (const memberId of memberIds) {
    const memberSession = sessionMap.get(memberId);
    if (!memberSession) continue;

    const invRes = await httpClient.get('/conversations/group/invitations', memberSession.token);
    const invitations = Array.isArray(invRes.data)
      ? invRes.data
      : (invRes.data?.items || invRes.data?.contents || []);

    for (const inv of invitations) {
      const invId = inv.invitation_id || inv.id;
      const targetConvId = inv.conversation_id || inv.conversation?.conversation_id;
      if (invId && (!targetConvId || targetConvId === groupConvId)) {
        const accRes = await httpClient.post(
          `/conversations/group/invitations/${invId}/accept`,
          null,
          memberSession.token
        );
        if (accRes.ok) {
          console.log(`    ✓ [${memberSession.shortName}] Đã chấp nhận lời mời tham gia nhóm [ID: ${groupConvId}]`);
        }
      }
    }
  }
}

export async function setupChatAndMessages(sessionMap) {
  console.log('\n[CHAT] Đang thiết lập 5 cuộc hội thoại 1-1 và 3 nhóm chat đa vai trò qua STOMP WebSocket...');
  const recordedDirects = [];
  const recordedGroups = [];

  // 1. Tạo các cuộc hội thoại 1-1 (Student-Student, Teacher-Student, Teacher-Teacher)
  for (const directDef of CHAT_DATA.directs) {
    const sessionA = sessionMap.get(directDef.userA);
    const sessionB = sessionMap.get(directDef.userB);
    if (!sessionA || !sessionB) continue;

    let res = await httpClient.post(
      '/conversations/direct',
      { target_user_id: directDef.userB },
      sessionA.token
    );
    if (!res.ok) {
      res = await httpClient.post(
        '/conversations/direct',
        { target_user_id: directDef.userA },
        sessionB.token
      );
    }

    let convId = null;
    if (res.ok && res.data?.conversation_id) {
      convId = res.data.conversation_id;
    } else {
      const listRes = await httpClient.get('/conversations?limit=50', sessionA.token);
      const existing = (listRes.data?.items || []).find(
        c => c.type === 'DIRECT' && (c.partner?.user_id === directDef.userB || c.display_name?.includes(sessionB.shortName))
      );
      if (existing) convId = existing.conversation_id;
    }

    if (convId) {
      recordedDirects.push(convId);
      console.log(`  ✓ Hội thoại 1-1 [ID: ${convId}]: ${sessionA.shortName} <-> ${sessionB.shortName}`);

      for (const msg of directDef.messages) {
        const sender = sessionMap.get(msg.senderId);
        if (!sender) continue;
        const sent = await sendWsMessage(sender.token, convId, msg.text);
        if (sent) {
          console.log(`    ↳ [${sender.shortName}]: "${msg.text.slice(0, 52)}..."`);
        }
      }
    }
  }

  // 2. Tạo 3 nhóm chat (Student Study Group, Teacher Faculty Group, Class Group Teacher+Student)
  const groupDefs = CHAT_DATA.groups || (CHAT_DATA.group ? [CHAT_DATA.group] : []);

  for (const groupDef of groupDefs) {
    const creatorSession = sessionMap.get(groupDef.creatorId);
    if (!creatorSession) continue;

    // Kiểm tra xem nhóm đã tồn tại từ trước chưa
    const listRes = await httpClient.get('/conversations?limit=50', creatorSession.token);
    const existingGroup = (listRes.data?.items || []).find(
      c => c.type === 'GROUP' && (c.display_name === groupDef.name || c.name === groupDef.name)
    );

    let groupConvId = existingGroup?.conversation_id;

    if (!groupConvId) {
      const groupRes = await httpClient.post(
        '/conversations/group',
        {
          name: groupDef.name,
          member_ids: groupDef.memberIds
        },
        creatorSession.token
      );

      if (groupRes.ok && groupRes.data?.conversation_id) {
        groupConvId = groupRes.data.conversation_id;
      }
    }

    if (groupConvId) {
      recordedGroups.push(groupConvId);
      console.log(`  ✓ Nhóm chat [ID: ${groupConvId}]: "${groupDef.name}" (Tạo bởi: ${creatorSession.shortName})`);

      // Tự động chấp nhận lời mời nhóm cho các thành viên khác vai trò (ví dụ: Student được Teacher mời)
      await acceptPendingGroupInvitations(sessionMap, groupDef.memberIds, groupConvId);

      // Gửi chuỗi tin nhắn trao đổi trong nhóm
      for (const msg of groupDef.messages) {
        const sender = sessionMap.get(msg.senderId);
        if (!sender) continue;
        const sent = await sendWsMessage(sender.token, groupConvId, msg.text);
        if (sent) {
          console.log(`    ↳ [${sender.shortName}]: "${msg.text.slice(0, 52)}..."`);
        }
      }
    } else {
      console.warn(`  ⚠️ Không thể tạo nhóm chat "${groupDef.name}"`);
    }
  }

  return {
    directs: recordedDirects,
    groups: recordedGroups
  };
}
