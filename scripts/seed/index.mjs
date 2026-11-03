#!/usr/bin/env node

/**
 * SQB HUST Test Data Seeder & Rollback CLI Tool
 * ==============================================================================
 * Cung cấp giải pháp tự động hóa tạo dữ liệu thử nghiệm và dọn dẹp cho 5 tài khoản
 * sinh viên từ README.md trên backend https://snsqb.duckdns.org/api/v1
 * ==============================================================================
 */

import { CONFIG } from './config.mjs';
import { authenticateAllAccounts } from './modules/auth.module.mjs';
import { updateProfiles } from './modules/profiles.module.mjs';
import { setupRelationships } from './modules/relationships.module.mjs';
import { createSocialContent } from './modules/social.module.mjs';
import { setupChatAndMessages } from './modules/chat.module.mjs';
import { proposeSessions } from './modules/sessions.module.mjs';
import { processGamification } from './modules/gamification.module.mjs';
import { rollbackAll, saveManifest, loadManifest } from './modules/rollback.module.mjs';
import { httpClient } from './modules/client.mjs';

const args = process.argv.slice(2);
const isRollback = args.includes('--clean') || args.includes('--rollback');
const isForceScan = args.includes('--force-scan');
const isStatus = args.includes('--status');

const isSelective = args.some(arg => ['--social', '--chat', '--questions', '--relationships', '--gamification', '--profiles'].includes(arg));
const runAll = !isRollback && !isStatus && (!isSelective || args.includes('--all'));

async function displayStatus(sessionMap) {
  console.log('\n============================================================');
  console.log('📊 BÁO CÁO TRẠNG THÁI DỮ LIỆU THỬ NGHIỆM TRÊN HỆ THỐNG');
  console.log('============================================================');

  const anSession = sessionMap.get(157);
  if (!anSession) return;

  const [postsRes, sessionsRes, convsRes, friendsRes] = await Promise.all([
    httpClient.get('/activity-feeds?limit=20', anSession.token),
    httpClient.get('/sessions/my-submissions?limit=20', anSession.token),
    httpClient.get('/conversations?limit=20', anSession.token),
    httpClient.get('/friendships?limit=20', anSession.token)
  ]);

  const allPosts = postsRes.data?.items || postsRes.data?.contents || [];
  const seedPosts = allPosts.filter(p => {
    const text = typeof p.content === 'string' ? p.content : JSON.stringify(p.content || '');
    return text.includes(CONFIG.SEED_TAG);
  });

  const allSessions = sessionsRes.data?.contents || sessionsRes.data?.items || [];
  const seedSessions = allSessions.filter(s => (s.title || '').includes(CONFIG.SEED_TAG));

  const allConvs = convsRes.data?.items || [];
  const totalFriends = friendsRes.data?.total_friends || friendsRes.data?.items?.length || 0;

  console.log(`- Bài viết trên Bảng tin:  ${allPosts.length} (Bài kiểm thử #SQB_SEED: ${seedPosts.length})`);
  console.log(`- Phiên đề xuất câu hỏi:    ${allSessions.length} (Phiên kiểm thử: ${seedSessions.length})`);
  console.log(`- Cuộc trò chuyện (Chat):  ${allConvs.length}`);
  console.log(`- Bạn bè của Lê Thành An:  ${totalFriends}`);

  const manifest = loadManifest();
  console.log(`- Trạng thái Manifest:     ${manifest ? `Đã lưu (${manifest.seeded_at})` : 'Chưa có file manifest'}`);
  console.log('============================================================\n');
}

async function main() {
  console.log('============================================================');
  console.log('🚀 SQB HUST TEST DATA GENERATION & ROLLBACK CLI');
  console.log(`🌐 Target Backend: ${CONFIG.API_BASE_URL}`);
  console.log('============================================================');

  try {
    // Bước 1: Đăng nhập toàn bộ 5 tài khoản
    const sessionMap = await authenticateAllAccounts();

    // Nếu chạy chế độ Status
    if (isStatus) {
      await displayStatus(sessionMap);
      return;
    }

    // Nếu chạy chế độ Rollback / Clean
    if (isRollback) {
      await rollbackAll(sessionMap, { forceScan: isForceScan });
      return;
    }

    // Chế độ Seed dữ liệu (Hỗ trợ merge nối tiếp với manifest hiện có)
    const existingManifest = loadManifest();
    const manifestLedger = {
      seeded_at: new Date().toISOString(),
      environment: CONFIG.API_BASE_URL,
      created_entities: {
        sessions: existingManifest?.created_entities?.sessions || [],
        posts: existingManifest?.created_entities?.posts || [],
        comments: existingManifest?.created_entities?.comments || [],
        conversations: {
          direct: existingManifest?.created_entities?.conversations?.direct || [],
          group: existingManifest?.created_entities?.conversations?.group || []
        },
        friend_requests: existingManifest?.created_entities?.friend_requests || []
      }
    };

    if (runAll || args.includes('--profiles')) {
      await updateProfiles(sessionMap);
    }

    if (runAll || args.includes('--relationships')) {
      const relResult = await setupRelationships(sessionMap);
      manifestLedger.created_entities.friend_requests = [
        ...manifestLedger.created_entities.friend_requests,
        ...(relResult.friendRequests || [])
      ];
    }

    if (runAll || args.includes('--social')) {
      const socialResult = await createSocialContent(sessionMap);
      manifestLedger.created_entities.posts = [
        ...manifestLedger.created_entities.posts,
        ...(socialResult.posts || [])
      ];
      manifestLedger.created_entities.comments = [
        ...manifestLedger.created_entities.comments,
        ...(socialResult.comments || [])
      ];
    }

    if (runAll || args.includes('--chat')) {
      const chatResult = await setupChatAndMessages(sessionMap);
      manifestLedger.created_entities.conversations.direct = Array.from(new Set([
        ...manifestLedger.created_entities.conversations.direct,
        ...(chatResult.directs || [])
      ]));
      manifestLedger.created_entities.conversations.group = Array.from(new Set([
        ...manifestLedger.created_entities.conversations.group,
        ...(chatResult.groups || [])
      ]));
    }

    if (runAll || args.includes('--questions')) {
      const sessionResult = await proposeSessions(sessionMap);
      manifestLedger.created_entities.sessions = [
        ...manifestLedger.created_entities.sessions,
        ...(sessionResult.sessions || [])
      ];
    }

    if (runAll || args.includes('--gamification')) {
      await processGamification(sessionMap);
    }

    // Lưu Manifest Ledger
    saveManifest(manifestLedger);

    console.log('\n============================================================');
    console.log('🎉 TOÀN BỘ QUY TRÌNH TẠO DỮ LIỆU ĐÃ HOÀN TẤT THÀNH CÔNG!');
    console.log('============================================================');
    console.log(`- Để kiểm tra trạng thái:  npm run seed:status`);
    console.log(`- Để hoàn tác / dọn dẹp:   npm run seed:rollback`);
    console.log('============================================================\n');

  } catch (error) {
    console.error('\n❌ Xảy ra lỗi nghiêm trọng trong quá trình thực thi:', error.message);
    process.exit(1);
  }
}

void main();
