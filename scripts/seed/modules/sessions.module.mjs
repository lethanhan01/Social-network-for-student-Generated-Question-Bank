/**
 * Module đề xuất các phiên nộp câu hỏi trắc nghiệm môn Web IT4409
 */

import { SESSIONS_DATA } from '../data/questions.data.mjs';
import { httpClient } from './client.mjs';

export async function proposeSessions(sessionMap) {
  console.log('\n[6/7 SESSIONS] Đang tạo 3 phiên đề xuất câu hỏi trắc nghiệm môn IT4409...');
  const createdSessions = [];

  for (const sessionDef of SESSIONS_DATA) {
    const authorSession = sessionMap.get(sessionDef.authorId);
    if (!authorSession) continue;

    const payload = {
      title: sessionDef.title,
      content: sessionDef.content,
      source_url: sessionDef.source_url,
      course_class_id: sessionDef.course_class_id,
      questions: sessionDef.questions
    };

    const res = await httpClient.post('/sessions/propose', payload, authorSession.token);

    if (res.ok && res.data?.session_id) {
      const sId = res.data.session_id;
      createdSessions.push({
        id: sId,
        authorId: sessionDef.authorId,
        code: res.data.session_code,
        title: sessionDef.title,
        questionsCount: sessionDef.questions.length
      });
      console.log(`  ✓ Đã đề xuất Phiên [ID: ${sId}] - Mã: ${res.data.session_code}`);
      console.log(`    Tiêu đề: "${sessionDef.title.slice(0, 60)}..."`);
      console.log(`    Số câu hỏi: ${sessionDef.questions.length} | Tác giả: ${authorSession.shortName}`);
    } else {
      console.warn(`  ⚠️ Thất bại khi đề xuất phiên cho ${authorSession.shortName}:`, res.data || res.raw);
    }
  }

  return { sessions: createdSessions };
}

