/**
 * Module Gamification & Minigames:
 * - Điểm danh chuyên cần hàng ngày (/games/check-in)
 * - Đặt cược Game 1: Dự đoán số sinh viên tham gia nộp bài ngày mai (/games/prediction/participants)
 * - Đặt cược Game 4: Dự đoán quy mô ngân hàng câu hỏi cuối kỳ (/games/prediction/bank-size)
 * (Lưu ý: Game 2 được đặt cược tự động trong sessions.module.mjs trước khi Teacher chốt RESOLVED)
 */

import { CONFIG } from '../config.mjs';
import { httpClient } from './client.mjs';

export async function processGamification(sessionMap, classIdMap = new Map()) {
  console.log('\n[GAMIFICATION] Đang thực hiện Điểm danh hàng ngày & Đặt cược Minigame (Game 1, Game 4)...');

  // 1. Điểm danh hàng ngày cho 5 Student (và kiểm tra trạng thái)
  for (const studentId of CONFIG.STUDENT_IDS) {
    const session = sessionMap.get(studentId);
    if (!session) continue;

    const res = await httpClient.post('/games/check-in', null, session.token);
    if (res.ok) {
      console.log(`  ✓ [Check-in] ${session.shortName}: Điểm danh thành công! Streak: ${res.data?.current_streak} ngày | Xu: ${res.data?.current_coin_balance}`);
    } else {
      const statusRes = await httpClient.get('/games/check-in', session.token);
      console.log(`  ℹ [Check-in] ${session.shortName}: Đã điểm danh hôm nay (${statusRes.data?.has_checked_in_today}) | Streak: ${statusRes.data?.current_streak ?? 1} ngày`);
    }
  }

  // 2. Đặt cược Game 1: Số sinh viên nộp câu hỏi ngày mai cho lớp học phần
  const targetClassId = classIdMap.get('cls_t1_web') || classIdMap.get('cls_t1_mob') || 52;
  const game1Counts = [4, 5, 3, 5, 4];

  for (let i = 0; i < CONFIG.STUDENT_IDS.length; i++) {
    const studentId = CONFIG.STUDENT_IDS[i];
    const session = sessionMap.get(studentId);
    if (!session) continue;

    const g1Res = await httpClient.post(
      '/games/prediction/participants',
      {
        course_class_id: targetClassId,
        predicted_count: game1Counts[i]
      },
      session.token
    );

    if (g1Res.ok) {
      console.log(`  🎯 [Game 1] ${session.shortName}: Dự đoán ${game1Counts[i]} SV tham gia nộp bài ngày mai tại lớp ID ${targetClassId}`);
    } else if (g1Res.status === 409) {
      console.log(`  ℹ [Game 1] ${session.shortName}: Đã có lượt dự đoán Game 1 hôm nay (hoặc sau 22:00)`);
    }
  }

  // 3. Đặt cược Game 4: Quy mô ngân hàng câu hỏi cuối kỳ cho cả 2 môn IT4409 (id=2) và IT4788 (id=1)
  const webPredictions = [120, 145, 130, 150, 160];
  const mobPredictions = [85, 95, 100, 90, 110];

  for (let i = 0; i < CONFIG.STUDENT_IDS.length; i++) {
    const studentId = CONFIG.STUDENT_IDS[i];
    const session = sessionMap.get(studentId);
    if (!session) continue;

    const [webRes, mobRes] = await Promise.all([
      httpClient.post(
        '/games/prediction/bank-size',
        { subject_id: CONFIG.SUBJECTS.WEB_IT4409, predicted_bank_size: webPredictions[i] },
        session.token
      ),
      httpClient.post(
        '/games/prediction/bank-size',
        { subject_id: CONFIG.SUBJECTS.MOBILE_IT4788, predicted_bank_size: mobPredictions[i] },
        session.token
      )
    ]);

    if (webRes.ok || mobRes.ok) {
      console.log(`  🎯 [Game 4] ${session.shortName}: Dự đoán Ngân hàng đề IT4409 = ${webPredictions[i]} câu, IT4788 = ${mobPredictions[i]} câu`);
    } else {
      console.log(`  ℹ [Game 4] ${session.shortName}: Đã đặt cược quy mô Ngân hàng đề cho cả 2 môn từ trước`);
    }
  }
}
