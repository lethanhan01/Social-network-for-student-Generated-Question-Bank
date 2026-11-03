/**
 * Cấu hình hệ thống Seeder & Rollback cho SQB HUST Frontend
 */

export const CONFIG = {
  API_BASE_URL: process.env.VITE_API_URL || 'https://snsqb.duckdns.org/api/v1',
  WS_BASE_URL: process.env.VITE_WS_URL || 'wss://snsqb.duckdns.org/api/v1/ws',
  SEED_TAG: '#SQB_SEED',
  MANIFEST_FILE: 'scripts/seed/seed-manifest.json',
  DEFAULT_COURSE_CLASS_ID: 3, // Lớp 171146 môn IT4409
  DEFAULT_SUBJECT_ID: 2,      // Môn IT4409 - Công nghệ Web và dịch vụ trực tuyến
  DEVICE_ID: 'sqb-automated-seeder-cli',
  PLATFORM: 'WEB',

  // 5 tài khoản sinh viên được cấp từ README.md
  ACCOUNTS: [
    {
      key: 'user_1',
      email: 'an.lt235631@sis.hust.edu.vn',
      password: '20235631',
      expectedId: 157,
      shortName: 'Lê Thành An'
    },
    {
      key: 'user_2',
      email: 'Anh.BT235635@sis.hust.edu.vn',
      password: '20235635',
      expectedId: 164,
      shortName: 'Bùi Tuấn Anh'
    },
    {
      key: 'user_3',
      email: 'Loc.ns235766@sis.hust.edu.vn',
      password: '20235766',
      expectedId: 139,
      shortName: 'Nguyễn Sỹ Lộc'
    },
    {
      key: 'user_4',
      email: 'tiep.nm235845@sis.hust.edu.vn',
      password: '20235845',
      expectedId: 163,
      shortName: 'Nguyễn Mạnh Tiếp'
    },
    {
      key: 'user_5',
      email: 'kien.nt235759@sis.hust.edu.vn',
      password: '20235759',
      expectedId: 158,
      shortName: 'Nguyễn Trung Kiên'
    }
  ]
};

