/**
 * Module thiết lập mạng lưới quan hệ (bạn bè, lời mời kết bạn, follow)
 */

import { httpClient } from './client.mjs';

export async function setupRelationships(sessionMap) {
  console.log('\n[3/7 RELATIONSHIPS] Đang thiết lập mạng lưới bạn bè và theo dõi...');
  const recordedRequests = [];

  // 1. Thiết lập các cặp bạn bè chính thức (ACCEPTED)
  const friendPairs = [
    [157, 164], // An <-> Tuấn Anh
    [157, 139], // An <-> Sỹ Lộc
    [164, 139]  // Tuấn Anh <-> Sỹ Lộc
  ];

  for (const [fromId, toId] of friendPairs) {
    const fromSession = sessionMap.get(fromId);
    const toSession = sessionMap.get(toId);
    if (!fromSession || !toSession) continue;

    // Gửi lời mời kết bạn
    const reqRes = await httpClient.post(
      '/friendships/request',
      { addressee_id: toId },
      fromSession.token
    );

    if (reqRes.ok) {
      console.log(`  ✓ Đã gửi lời mời: ${fromSession.shortName} -> ${toSession.shortName}`);
    } else if (reqRes.status === 409) {
      console.log(`  ℹ Đã là bạn bè từ trước: ${fromSession.shortName} <-> ${toSession.shortName}`);
    }

    // Chấp nhận lời mời kết bạn
    const accRes = await httpClient.post(
      '/friendships/accept',
      { requester_id: fromId },
      toSession.token
    );

    if (accRes.ok) {
      console.log(`  ✓ Đã chấp nhận kết bạn: ${toSession.shortName} <-> ${fromSession.shortName}`);
    }
  }

  // 2. Thiết lập lời mời kết bạn đang chờ duyệt (PENDING): Kiên (158) -> Tiếp (163)
  const kienSession = sessionMap.get(158);
  const tiepSession = sessionMap.get(163);

  if (kienSession && tiepSession) {
    const pendingRes = await httpClient.post(
      '/friendships/request',
      { addressee_id: 163 },
      kienSession.token
    );

    if (pendingRes.ok) {
      console.log(`  ✓ Tạo lời mời chờ duyệt: ${kienSession.shortName} -> ${tiepSession.shortName}`);
      recordedRequests.push({ requester_id: 158, addressee_id: 163 });
    } else if (pendingRes.status === 409) {
      console.log(`  ℹ Lời mời đã tồn tại: ${kienSession.shortName} -> ${tiepSession.shortName}`);
      recordedRequests.push({ requester_id: 158, addressee_id: 163 });
    }
  }

  // 3. Thiết lập mạng lưới Theo dõi (FOLLOW)
  const followList = [
    { followerId: 163, targetId: 157 }, // Tiếp follow An
    { followerId: 163, targetId: 164 }, // Tiếp follow Tuấn Anh
    { followerId: 158, targetId: 157 }, // Kiên follow An
    { followerId: 139, targetId: 158 }  // Sỹ Lộc follow Kiên
  ];

  for (const { followerId, targetId } of followList) {
    const follower = sessionMap.get(followerId);
    const target = sessionMap.get(targetId);
    if (!follower || !target) continue;

    const followRes = await httpClient.post(
      `/follows/${targetId}`,
      null,
      follower.token
    );

    if (followRes.ok) {
      console.log(`  ✓ Đã theo dõi: ${follower.shortName} -> ${target.shortName}`);
    } else {
      console.log(`  ℹ Trạng thái theo dõi: ${follower.shortName} -> ${target.shortName} (${followRes.status})`);
    }
  }

  return { friendRequests: recordedRequests };
}

