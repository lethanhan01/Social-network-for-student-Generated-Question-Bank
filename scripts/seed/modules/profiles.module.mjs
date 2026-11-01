/**
 * Module cập nhật hồ sơ cá nhân cho 5 tài khoản sinh viên
 */

import { PROFILES_DATA } from '../data/profiles.data.mjs';
import { httpClient } from './client.mjs';

export async function updateProfiles(sessionMap) {
  console.log('\n[2/7 PROFILES] Đang cập nhật hồ sơ cá nhân sinh viên...');

  for (const [userId, session] of sessionMap.entries()) {
    const profile = PROFILES_DATA[userId];
    if (!profile) continue;

    const res = await httpClient.put(
      '/users/me',
      {
        full_name: profile.full_name,
        bio: profile.bio,
        gender: profile.gender
      },
      session.token
    );

    if (res.ok) {
      console.log(`  ✓ Đã cập nhật hồ sơ cho: ${profile.full_name} (${profile.class_name})`);
    } else {
      console.warn(`  ⚠️ Không thể cập nhật hồ sơ cho ${session.shortName}:`, res.data || res.raw);
    }
  }
}

