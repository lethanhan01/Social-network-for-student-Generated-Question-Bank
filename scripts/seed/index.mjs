#!/usr/bin/env node

/**
 * SQB HUST Test Data Seeder & Rollback CLI Tool (5 Student + 5 Teacher)
 * ==============================================================================
 * Cung cấp giải pháp tự động hóa tạo dữ liệu thử nghiệm toàn diện và dọn dẹp
 * cho 5 tài khoản Sinh viên và 5 tài khoản Giảng viên từ README.md
 * trên backend https://snsqb.duckdns.org/api/v1
 * ==============================================================================
 */

import { CONFIG } from './config.mjs';
import { authenticateAllAccounts } from './modules/auth.module.mjs';
import { updateProfiles } from './modules/profiles.module.mjs';
import { setupRelationships } from './modules/relationships.module.mjs';
import { createSocialContent } from './modules/social.module.mjs';
import { setupChatAndMessages } from './modules/chat.module.mjs';
import {
  ensureCourseClasses,
  proposeAndPredictSessions,
  resolveAllTeacherSessions,
  practiceAndGenerateExams
} from './modules/sessions.module.mjs';
import { processGamification } from './modules/gamification.module.mjs';
import { rollbackAll, saveManifest, loadManifest } from './modules/rollback.module.mjs';
import { httpClient } from './modules/client.mjs';

const args = process.argv.slice(2);
const isRollback = args.includes('--clean') || args.includes('--rollback');
const isForceScan = args.includes('--force-scan');
const isStatus = args.includes('--status');

const SELECTIVE_FLAGS = [
  '--profiles',
  '--relationships',
  '--classes',
  '--questions',
  '--reviews',
  '--practice',
  '--exams',
  '--gamification',
  '--social',
  '--chat'
];
const isSelective = args.some(arg => SELECTIVE_FLAGS.includes(arg));
const runAll = !isRollback && !isStatus && (!isSelective || args.includes('--all'));

async function displayStatus(sessionMap) {
  console.log('\n============================================================');
  console.log('📊 BÁO CÁO TRẠNG THÁI DỮ LIỆU 5 STUDENT & 5 TEACHER TRÊN HỆ THỐNG');
  console.log('============================================================');

  const anSession = sessionMap.get(157);
  const t1Session = sessionMap.get(252);
  const t2Session = sessionMap.get(253);
  if (!anSession || !t1Session || !t2Session) return;

  const [
    postsRes,
    convsRes,
    friendsRes,
    predictionsRes,
    t1ClassesRes,
    t2ClassesRes,
    t1RevRes,
    t2RevRes,
    t1ExamsRes,
    t2ExamsRes
  ] = await Promise.all([
    httpClient.get('/activity-feeds?limit=40', anSession.token),
    httpClient.get('/conversations?limit=30', anSession.token),
    httpClient.get('/friendships?limit=20', anSession.token),
    httpClient.get('/games/my-predictions?limit=20', anSession.token),
    httpClient.get('/lecturer/course-classes/my-classes', t1Session.token),
    httpClient.get('/lecturer/course-classes/my-classes', t2Session.token),
    httpClient.get('/lecturer/sessions/reviewable?limit=20', t1Session.token),
    httpClient.get('/lecturer/sessions/reviewable?limit=20', t2Session.token),
    httpClient.get('/exams/my-exams?limit=20', t1Session.token),
    httpClient.get('/exams/my-exams?limit=20', t2Session.token)
  ]);

  // Đếm tổng phiên đề xuất của cả 5 Student
  let totalStudentSessions = 0;
  let totalResolvedSessions = 0;
  for (const sId of CONFIG.STUDENT_IDS) {
    const sSess = sessionMap.get(sId);
    if (!sSess) continue;
    const subRes = await httpClient.get('/sessions/my-submissions?limit=50', sSess.token);
    const items = subRes.data?.contents || subRes.data?.items || [];
    totalStudentSessions += items.length;
    totalResolvedSessions += items.filter(s => s.status === 'RESOLVED').length;
  }

  const allPosts = postsRes.data?.items || postsRes.data?.contents || [];
  const seedPosts = allPosts.filter(p => JSON.stringify(p.content || '').includes(CONFIG.SEED_TAG));
  const honorPosts = allPosts.filter(
    p => p.action_type === 'SESSION_RESOLVED_APPROVED' || p.content?.post_type === 'QUESTION_APPROVED_NOTIFICATION'
  );

  const t1Classes = Array.isArray(t1ClassesRes.data) ? t1ClassesRes.data : [];
  const t2Classes = Array.isArray(t2ClassesRes.data) ? t2ClassesRes.data : [];
  const t1Pending = (t1RevRes.data?.items || t1RevRes.data?.contents || []).length;
  const t2Pending = (t2RevRes.data?.items || t2RevRes.data?.contents || []).length;
  const t1Exams = (t1ExamsRes.data?.items || t1ExamsRes.data?.contents || []).length;
  const t2Exams = (t2ExamsRes.data?.items || t2ExamsRes.data?.contents || []).length;
  const predictions = (predictionsRes.data?.contents || predictionsRes.data?.items || []).length;

  console.log(`👨‍🎓 [SINH VIÊN - 5 Tài khoản]`);
  console.log(`  - Tổng phiên câu hỏi đã nộp:    ${totalStudentSessions} (Đã chốt RESOLVED: ${totalResolvedSessions})`);
  console.log(`  - Lượt dự đoán Minigame (An):   ${predictions} lượt (Game 1, Game 2, Game 4)`);
  console.log(`  - Cuộc trò chuyện của An:       ${(convsRes.data?.items || []).length}`);
  console.log(`  - Bạn bè của Lê Thành An:       ${friendsRes.data?.total_friends || (friendsRes.data?.items || []).length}`);

  console.log(`\n👨‍🏫 [GIẢNG VIÊN - 5 Tài khoản]`);
  console.log(`  - Lớp học phần Teacher 01:      ${t1Classes.length} lớp (${t1Classes.map(c => `${c.class_code}-${c.subject_code}[${c.total_students} SV]`).join(', ')})`);
  console.log(`  - Lớp học phần Teacher 02:      ${t2Classes.length} lớp (${t2Classes.map(c => `${c.class_code}-${c.subject_code}[${c.total_students} SV]`).join(', ')})`);
  console.log(`  - Phiên còn treo chưa duyệt:    Teacher 01 = ${t1Pending} | Teacher 02 = ${t2Pending}`);
  console.log(`  - Đề thi đã sinh (/my-exams):   Teacher 01 = ${t1Exams} đề | Teacher 02 = ${t2Exams} đề`);

  console.log(`\n🌐 [MẠNG XÃ HỘI & BẢNG TIN]`);
  console.log(`  - Hoạt động trên Bảng tin:      ${allPosts.length} (Mang tag #SQB_SEED: ${seedPosts.length} | Vinh danh câu hỏi: ${honorPosts.length})`);

  const manifest = loadManifest();
  console.log(`  - Trạng thái Manifest:          ${manifest ? `Đã lưu (${manifest.seeded_at})` : 'Chưa có file manifest'}`);
  console.log('============================================================\n');
}

async function main() {
  console.log('============================================================');
  console.log('🚀 SQB HUST TEST DATA GENERATION & ROLLBACK CLI (10 ACCOUNTS)');
  console.log(`🌐 Target Backend: ${CONFIG.API_BASE_URL}`);
  console.log('============================================================');

  try {
    // Bước 1: Đăng nhập toàn bộ 10 tài khoản (5 Student + 5 Teacher)
    const sessionMap = await authenticateAllAccounts();

    if (isStatus) {
      await displayStatus(sessionMap);
      return;
    }

    if (isRollback) {
      await rollbackAll(sessionMap, { forceScan: isForceScan });
      return;
    }

    const existingManifest = loadManifest();
    const manifestLedger = {
      seeded_at: new Date().toISOString(),
      environment: CONFIG.API_BASE_URL,
      created_entities: {
        classes: existingManifest?.created_entities?.classes || [],
        sessions: existingManifest?.created_entities?.sessions || [],
        exams: existingManifest?.created_entities?.exams || [],
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

    // Bước Học thuật: Lớp học phần -> Đề xuất & Game 2 -> Teacher Duyệt RESOLVED -> Luyện tập & Sinh đề thi
    const needAcademic =
      runAll ||
      args.some(a => ['--classes', '--questions', '--reviews', '--practice', '--exams', '--gamification'].includes(a));

    let classIdMap = new Map();
    let proposedSessions = manifestLedger.created_entities.sessions;

    if (needAcademic) {
      const clsResult = await ensureCourseClasses(sessionMap);
      classIdMap = clsResult.classIdMap;
      manifestLedger.created_entities.classes = clsResult.classes;
    }

    if (runAll || args.includes('--questions') || args.includes('--reviews') || args.includes('--practice')) {
      const sessionResult = await proposeAndPredictSessions(sessionMap, classIdMap);
      proposedSessions = sessionResult.sessions;
      manifestLedger.created_entities.sessions = proposedSessions;
    }

    if (runAll || args.includes('--questions') || args.includes('--reviews') || args.includes('--practice') || args.includes('--exams')) {
      await resolveAllTeacherSessions(sessionMap, proposedSessions);
    }

    if (runAll || args.includes('--practice') || args.includes('--exams') || args.includes('--questions')) {
      const peResult = await practiceAndGenerateExams(sessionMap, classIdMap, proposedSessions);
      manifestLedger.created_entities.exams = peResult.exams || [];
    }

    if (runAll || args.includes('--gamification')) {
      await processGamification(sessionMap, classIdMap);
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
      manifestLedger.created_entities.conversations.direct = Array.from(
        new Set([...manifestLedger.created_entities.conversations.direct, ...(chatResult.directs || [])])
      );
      manifestLedger.created_entities.conversations.group = Array.from(
        new Set([...manifestLedger.created_entities.conversations.group, ...(chatResult.groups || [])])
      );
    }

    saveManifest(manifestLedger);

    console.log('\n============================================================');
    console.log('🎉 TOÀN BỘ QUY TRÌNH TẠO DỮ LIỆU 10 TÀI KHOẢN ĐÃ HOÀN TẤT!');
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
