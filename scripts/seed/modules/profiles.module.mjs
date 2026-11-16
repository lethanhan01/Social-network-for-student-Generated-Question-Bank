/**
 * Module cập nhật hồ sơ cá nhân cho 5 Sinh viên và 5 Giảng viên
 */

import { PROFILES_DATA } from '../data/profiles.data.mjs';
import { httpClient } from './client.mjs';

export async function updateProfiles(sessionMap) {
  console.log('\n[2/8 PROFILES] Đang cập nhật hồ sơ cá nhân cho 5 Student & 5 Teacher...');

  for (const [userId, session] of sessionMap.entries()) {
    const profile = PROFILES_DATA[userId];
    if (!profile) continue;

    const res = await httpClient.put(
      '/users/me',
      {
        full_name: profile.full_name,
        bio: profile.bio,
        gender: profile.gender,
        avatar_url: profile.avatar_url
      },
      session.token
    );

    if (res.ok) {
      session.shortName = profile.full_name;
      console.log(`  ✓ [${session.role}] Đã cập nhật hồ sơ: ${profile.full_name} (${profile.class_name})`);
    } else {
      console.warn(`  ⚠️ Không thể cập nhật hồ sơ cho ${session.shortName}:`, res.data || res.raw);
    }
  }
}
