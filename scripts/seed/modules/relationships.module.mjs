/**
 * Module thiết lập mạng lưới quan hệ (bạn bè cùng vai trò, lời mời kết bạn, follow đa vai trò)
 */

import { CONFIG } from '../config.mjs';
import { httpClient } from './client.mjs';

export async function setupRelationships(sessionMap) {
  console.log('\n[3/8 RELATIONSHIPS] Đang thiết lập mạng lưới Bạn bè (Student/Teacher) và Theo dõi chéo...');
  const recordedRequests = [];

  // 1. Thiết lập các cặp bạn bè chính thức (ACCEPTED) giữa các Sinh viên (STUDENT <-> STUDENT)
  const studentFriendPairs = [
    [157, 164], // An <-> Tuấn Anh
    [157, 139], // An <-> Sỹ Lộc
    [164, 139], // Tuấn Anh <-> Sỹ Lộc
    [157, 163]  // An <-> Tiếp
  ];

  // 2. Thiết lập các cặp bạn bè chính thức (ACCEPTED) giữa các Giảng viên (LECTURER <-> LECTURER)
  const teacherFriendPairs = [
    [252, 253], // TS. Hải <-> PGS. Đồng
    [252, 254], // TS. Hải <-> TS. Huyền
    [252, 255], // TS. Hải <-> ThS. Tuấn
    [252, 256], // TS. Hải <-> TS. Huy
    [253, 254], // PGS. Đồng <-> TS. Huyền
    [253, 256], // PGS. Đồng <-> TS. Huy
    [254, 256]  // TS. Huyền <-> TS. Huy
  ];

  for (const [fromId, toId] of [...studentFriendPairs, ...teacherFriendPairs]) {
    const fromSession = sessionMap.get(fromId);
    const toSession = sessionMap.get(toId);
    if (!fromSession || !toSession) continue;

    const reqRes = await httpClient.post(
      '/friendships/request',
      { addressee_id: toId },
      fromSession.token
    );

    if (reqRes.ok) {
      console.log(`  ✓ Đã gửi lời mời kết bạn: ${fromSession.shortName} -> ${toSession.shortName}`);
    }

    const accRes = await httpClient.post(
      '/friendships/accept',
      { requester_id: fromId },
      toSession.token
    );

    if (accRes.ok) {
      console.log(`  ✓ Đã chấp nhận kết bạn: ${toSession.shortName} <-> ${fromSession.shortName}`);
    } else {
      // Thử chiều ngược lại nếu đối phương từng gửi trước
      await httpClient.post('/friendships/accept', { requester_id: toId }, fromSession.token);
    }
  }

  // 3. Thiết lập lời mời kết bạn đang chờ duyệt (PENDING):
  // - Sinh viên: Kiên (158) -> Tiếp (163)
  // - Giảng viên: TS. Huy (256) -> ThS. Tuấn (255)
  const pendingPairs = [
    [158, 163],
    [256, 255]
  ];

  for (const [reqId, addId] of pendingPairs) {
    const reqSession = sessionMap.get(reqId);
    const addSession = sessionMap.get(addId);
    if (!reqSession || !addSession) continue;

    const pendingRes = await httpClient.post(
      '/friendships/request',
      { addressee_id: addId },
      reqSession.token
    );

    if (pendingRes.ok || pendingRes.status === 409) {
      console.log(`  ✓ Lời mời kết bạn chờ duyệt (PENDING): ${reqSession.shortName} -> ${addSession.shortName}`);
      recordedRequests.push({ requester_id: reqId, addressee_id: addId });
    }
  }

  // 4. Thiết lập mạng lưới Theo dõi (FOLLOW) xuyên vai trò (Student <-> Teacher & nội bộ)
  const followList = [];

  // 4.1 Cả 5 Student đều Follow cả 5 Teacher
  for (const sId of CONFIG.STUDENT_IDS) {
    for (const tId of CONFIG.TEACHER_IDS) {
      followList.push({ followerId: sId, targetId: tId });
    }
  }

  // 4.2 Teacher 01 (252) và Teacher 02 (253) Follow lại cả 5 Student (để hỗ trợ mời vào Nhóm chat lớp học phần)
  for (const tId of [252, 253]) {
    for (const sId of CONFIG.STUDENT_IDS) {
      followList.push({ followerId: tId, targetId: sId });
    }
  }

  // 4.3 Các lượt Follow nội bộ giữa Student & giữa Teacher
  followList.push(
    { followerId: 163, targetId: 157 },
    { followerId: 163, targetId: 164 },
    { followerId: 158, targetId: 157 },
    { followerId: 139, targetId: 158 },
    { followerId: 252, targetId: 253 },
    { followerId: 253, targetId: 252 }
  );

  let followSuccessCount = 0;
  for (const { followerId, targetId } of followList) {
    const follower = sessionMap.get(followerId);
    const target = sessionMap.get(targetId);
    if (!follower || !target) continue;

    const followRes = await httpClient.post(`/follows/${targetId}`, null, follower.token);
    if (followRes.ok) {
      followSuccessCount++;
    }
  }
  console.log(`  ✓ Đã đồng bộ mạng lưới Follow đa chiều (${followList.length} liên kết, ${followSuccessCount} lượt mới).`);

  return { friendRequests: recordedRequests };
}
