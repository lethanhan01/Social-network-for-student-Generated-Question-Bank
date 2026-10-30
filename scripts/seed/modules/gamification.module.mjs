/**
 * Module điểm danh hàng ngày và hoạt động Gamification
 */

import { httpClient } from './client.mjs';

export async function processGamification(sessionMap) {
  console.log('\n[7/7 GAMIFICATION] Đang thực hiện điểm danh hàng ngày cho 5 tài khoản...');

  for (const [userId, session] of sessionMap.entries()) {
    const res = await httpClient.post('/games/check-in', null, session.token);

    if (res.ok) {
      console.log(`  ✓ ${session.shortName}: Điểm danh thành công! Streak: ${res.data?.current_streak} ngày | Xu: ${res.data?.current_coin_balance}`);
    } else {
      // Đã điểm danh hôm nay hoặc trạng thái tương tự
      const statusRes = await httpClient.get('/games/check-in', session.token);
      console.log(`  ℹ ${session.shortName}: Trạng thái hôm nay đã điểm danh: ${statusRes.data?.has_checked_in_today} | Streak: ${statusRes.data?.current_streak}`);
    }
  }
}

