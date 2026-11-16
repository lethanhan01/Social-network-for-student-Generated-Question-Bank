/**
 * Module xác thực và quản lý phiên làm việc của 10 tài khoản (5 Student + 5 Teacher)
 */

import { CONFIG } from '../config.mjs';
import { httpClient } from './client.mjs';

export async function authenticateAllAccounts() {
  console.log('\n[1/8 AUTH] Đang xác thực và thu thập Token cho 10 tài khoản (5 Student + 5 Teacher)...');
  const sessionMap = new Map();

  for (const acc of CONFIG.ACCOUNTS) {
    const res = await httpClient.post('/auth/login', {
      email: acc.email,
      password: acc.password,
      device_id: CONFIG.DEVICE_ID,
      platform: CONFIG.PLATFORM,
      device_name: 'Node Seeder CLI'
    });

    if (!res.ok || !res.data?.access_token) {
      throw new Error(`Đăng nhập thất bại cho tài khoản ${acc.email} (Status: ${res.status}): ${JSON.stringify(res.data || res.raw)}`);
    }

    const userId = res.data.user_id || acc.expectedId;
    const role = res.data.role || acc.role;
    sessionMap.set(userId, {
      userId,
      role,
      token: res.data.access_token,
      email: acc.email,
      shortName: acc.shortName,
      key: acc.key
    });

    console.log(`  ✓ [${role}] Đăng nhập thành công: ${acc.shortName} (ID: ${userId} | ${acc.email})`);
  }

  return sessionMap;
}
