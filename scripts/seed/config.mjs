/**
 * Cấu hình hệ thống Seeder & Rollback cho SQB HUST Frontend (5 Student + 5 Teacher)
 */

export const STUDENT_ACCOUNTS = [
  {
    key: 'student_1',
    role: 'STUDENT',
    email: 'an.lt235631@sis.hust.edu.vn',
    password: '20235631',
    expectedId: 157,
    shortName: 'Lê Thành An'
  },
  {
    key: 'student_2',
    role: 'STUDENT',
    email: 'Anh.BT235635@sis.hust.edu.vn',
    password: '20235635',
    expectedId: 164,
    shortName: 'Bùi Tuấn Anh'
  },
  {
    key: 'student_3',
    role: 'STUDENT',
    email: 'Loc.ns235766@sis.hust.edu.vn',
    password: '20235766',
    expectedId: 139,
    shortName: 'Nguyễn Sỹ Lộc'
  },
  {
    key: 'student_4',
    role: 'STUDENT',
    email: 'tiep.nm235845@sis.hust.edu.vn',
    password: '20235845',
    expectedId: 163,
    shortName: 'Nguyễn Mạnh Tiếp'
  },
  {
    key: 'student_5',
    role: 'STUDENT',
    email: 'kien.nt235759@sis.hust.edu.vn',
    password: '20235759',
    expectedId: 158,
    shortName: 'Nguyễn Trung Kiên'
  }
];

export const TEACHER_ACCOUNTS = [
  {
    key: 'teacher_1',
    role: 'LECTURER',
    email: 'giangvientest01@mail.com',
    password: 'Hust@123456',
    expectedId: 252,
    shortName: 'TS. Trần Hoàng Hải'
  },
  {
    key: 'teacher_2',
    role: 'LECTURER',
    email: 'giangvientest02@mail.com',
    password: 'Hust@123456',
    expectedId: 253,
    shortName: 'PGS.TS. Phạm Văn Đồng'
  },
  {
    key: 'teacher_3',
    role: 'LECTURER',
    email: 'giangvientest03@mail.com',
    password: 'Hust@123456',
    expectedId: 254,
    shortName: 'TS. Nguyễn Thị Thanh Huyền'
  },
  {
    key: 'teacher_4',
    role: 'LECTURER',
    email: 'giangvientest04@mail.com',
    password: 'Hust@123456',
    expectedId: 255,
    shortName: 'ThS. Lê Minh Tuấn'
  },
  {
    key: 'teacher_5',
    role: 'LECTURER',
    email: 'giangvientest05@mail.com',
    password: 'Hust@123456',
    expectedId: 256,
    shortName: 'TS. Đỗ Quốc Huy'
  }
];

export const CONFIG = {
  API_BASE_URL: process.env.VITE_API_URL || 'https://snsqb.duckdns.org/api/v1',
  WS_BASE_URL: process.env.VITE_WS_URL || 'wss://snsqb.duckdns.org/api/v1/ws',
  SEED_TAG: '#SQB_SEED',
  MANIFEST_FILE: 'scripts/seed/seed-manifest.json',
  DEFAULT_COURSE_CLASS_ID: 3,
  DEFAULT_SUBJECT_ID: 2,
  SUBJECTS: {
    WEB_IT4409: 2,    // Môn IT4409 - Công nghệ Web và dịch vụ trực tuyến
    MOBILE_IT4788: 1  // Môn IT4788 - Phát triển ứng dụng đa nền tảng
  },
  COURSE_CLASSES: [
    {
      key: 'cls_t1_web',
      class_code: '171150',
      subject_id: 2,
      subject_code: 'IT4409',
      lecturerId: 252
    },
    {
      key: 'cls_t1_mob',
      class_code: '171149',
      subject_id: 1,
      subject_code: 'IT4788',
      lecturerId: 252
    },
    {
      key: 'cls_t2_web',
      class_code: '171151',
      subject_id: 2,
      subject_code: 'IT4409',
      lecturerId: 253
    },
    {
      key: 'cls_t2_mob',
      class_code: '171152',
      subject_id: 1,
      subject_code: 'IT4788',
      lecturerId: 253
    }
  ],
  STUDENT_IDS: [157, 164, 139, 163, 158],
  TEACHER_IDS: [252, 253, 254, 255, 256],
  DEVICE_ID: 'sqb-automated-seeder-cli',
  PLATFORM: 'WEB',
  STUDENT_ACCOUNTS,
  TEACHER_ACCOUNTS,
  ACCOUNTS: [...STUDENT_ACCOUNTS, ...TEACHER_ACCOUNTS]
};
