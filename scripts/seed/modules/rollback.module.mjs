/**
 * Module dọn dẹp và Rollback dữ liệu đã tạo theo Manifest hoặc Quét tag #SQB_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { CONFIG } from '../config.mjs';
import { httpClient } from './client.mjs';

export function loadManifest() {
  const filePath = path.resolve(CONFIG.MANIFEST_FILE);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    } catch (e) {
      console.warn('⚠️ Lỗi đọc file manifest:', e.message);
    }
  }
  return null;
}

export function saveManifest(manifestData) {
  const filePath = path.resolve(CONFIG.MANIFEST_FILE);
  fs.writeFileSync(filePath, JSON.stringify(manifestData, null, 2), 'utf8');
  console.log(`\n💾 Đã lưu nhật ký thực thể vào: ${CONFIG.MANIFEST_FILE}`);
}

export async function rollbackAll(sessionMap, options = {}) {
  console.log('\n============================================================');
  console.log('🔄 BẮT ĐẦU QUY TRÌNH ROLLBACK & DỌN DẸP DỮ LIỆU KIỂM THỬ');
  console.log('============================================================');

  const manifest = loadManifest();
  let deletedPosts = 0;
  let deletedComments = 0;
  let deletedSessions = 0;

  // 1. Rollback theo Manifest (nếu tồn tại)
  if (manifest && manifest.created_entities) {
    console.log(`\n[ROLLBACK - LỚP 1] Đang dọn dẹp theo Manifest (${manifest.seeded_at})...`);
    const entities = manifest.created_entities;

    // 1.1 Xóa comments
    for (const c of entities.comments || []) {
      const commentId = typeof c === 'object' ? c.id : c;
      const authorId = typeof c === 'object' ? c.authorId : null;
      const authorSession = authorId ? sessionMap.get(authorId) : sessionMap.values().next().value;
      if (!authorSession) continue;

      const res = await httpClient.delete(`/comments/${commentId}`, authorSession.token);
      if (res.ok) {
        deletedComments++;
        console.log(`  ✓ Đã xóa bình luận [ID: ${commentId}]`);
      }
    }

    // 1.2 Xóa posts
    for (const p of entities.posts || []) {
      const postId = typeof p === 'object' ? p.id : p;
      const authorId = typeof p === 'object' ? p.authorId : null;
      const authorSession = authorId ? sessionMap.get(authorId) : null;
      const token = authorSession ? authorSession.token : sessionMap.values().next().value?.token;

      const res = await httpClient.delete(`/posts/${postId}`, token);
      if (res.ok) {
        deletedPosts++;
        console.log(`  ✓ Đã xóa bài viết [ID: ${postId}]`);
      }
    }

    // 1.3 Xóa sessions
    for (const s of entities.sessions || []) {
      const sessionId = typeof s === 'object' ? s.id : s;
      const authorId = typeof s === 'object' ? s.authorId : null;
      const authorSession = authorId ? sessionMap.get(authorId) : null;
      const token = authorSession ? authorSession.token : sessionMap.values().next().value?.token;

      const res = await httpClient.delete(`/sessions/my-submissions/${sessionId}`, token);
      if (res.ok) {
        deletedSessions++;
        console.log(`  ✓ Đã xóa phiên đề xuất câu hỏi [ID: ${sessionId}]`);
      }
    }

    // 1.4 Rời nhóm chat
    for (const gId of entities.conversations?.group || []) {
      for (const session of sessionMap.values()) {
        await httpClient.post(`/conversations/${gId}/leave`, null, session.token);
      }
      console.log(`  ✓ Đã rời nhóm chat [ID: ${gId}]`);
    }

    // Xóa trắng manifest
    fs.unlinkSync(path.resolve(CONFIG.MANIFEST_FILE));
    console.log(`  ✓ Đã dọn dẹp file manifest.`);
  }

  // 2. Fallback Tag Scan nếu được yêu cầu qua --force-scan hoặc không có manifest
  if (options.forceScan || !manifest) {
    console.log(`\n[ROLLBACK - LỚP 2] Đang quét API backend tìm các thực thể mang tag "${CONFIG.SEED_TAG}"...`);

    for (const [userId, session] of sessionMap.entries()) {
      // 2.1 Quét bài viết của tài khoản
      const myPostsRes = await httpClient.get('/posts/me?limit=50', session.token);
      const postsToDel = (myPostsRes.data?.contents || myPostsRes.data?.items || [])
        .filter(p => {
          const text = typeof p.content === 'string' ? p.content : JSON.stringify(p.content || '');
          return text.includes(CONFIG.SEED_TAG);
        });

      for (const post of postsToDel) {
        const delRes = await httpClient.delete(`/posts/${post.post_id}`, session.token);
        if (delRes.ok) {
          deletedPosts++;
          console.log(`  ✓ [Tag Scan] Đã xóa bài viết [ID: ${post.post_id}] của ${session.shortName}`);
        }
      }

      // 2.2 Quét phiên đề xuất câu hỏi của tài khoản
      const mySessionsRes = await httpClient.get('/sessions/my-submissions?limit=50', session.token);
      const sessionsToDel = (mySessionsRes.data?.contents || mySessionsRes.data?.items || [])
        .filter(s => (s.title || '').includes(CONFIG.SEED_TAG));

      for (const sess of sessionsToDel) {
        const delRes = await httpClient.delete(`/sessions/my-submissions/${sess.session_id}`, session.token);
        if (delRes.ok) {
          deletedSessions++;
          console.log(`  ✓ [Tag Scan] Đã xóa phiên đề xuất [ID: ${sess.session_id}] của ${session.shortName}`);
        }
      }

      // 2.3 Quét nhóm chat mang tag
      const myConvsRes = await httpClient.get('/conversations?limit=50', session.token);
      const groupsToLeave = (myConvsRes.data?.items || [])
        .filter(c => c.type === 'GROUP' && (c.name || '').includes(CONFIG.SEED_TAG));

      for (const grp of groupsToLeave) {
        await httpClient.post(`/conversations/${grp.conversation_id}/leave`, null, session.token);
        console.log(`  ✓ [Tag Scan] Rời nhóm chat [ID: ${grp.conversation_id}]`);
      }
    }
  }

  console.log('\n============================================================');
  console.log(`🎉 HOÀN TẤT ROLLBACK: Đã xóa ${deletedPosts} bài viết, ${deletedComments} bình luận, ${deletedSessions} phiên đề xuất.`);
  console.log('============================================================\n');
}
