/**
 * Module Học thuật toàn trình:
 * 1. Khởi tạo 4 Lớp học phần (IT4409 & IT4788) cho Teacher 01 & 02 và gán đủ 5 Student
 * 2. 5 Student đề xuất 6 phiên (30 câu hỏi) + Đặt cược Game 2 ngay khi phiên đang PENDING
 * 3. Teacher 01 & 02 thẩm định, sửa câu hỏi mẫu, Approve/Reject và chốt RESOLVED 100% phiên
 * 4. 5 Student luyện tập trả lời (/answer) & đánh giá chất lượng (/rate)
 * 5. Teacher 01 & 02 tự động sinh 4 Đề thi chuẩn hóa (/exams/generate)
 */

import { CONFIG } from '../config.mjs';
import { SESSIONS_DATA, EXAMS_DATA, PRACTICE_COMMENTS } from '../data/questions.data.mjs';
import { httpClient } from './client.mjs';

export async function ensureCourseClasses(sessionMap) {
  console.log('\n[4/8 CLASSES] Đang thiết lập 4 lớp học phần (IT4409 & IT4788) cho Teacher 01 & 02 và gán 5 Student...');
  const classIdMap = new Map();
  const recordedClasses = [];

  for (const clsDef of CONFIG.COURSE_CLASSES) {
    const teacherSession = sessionMap.get(clsDef.lecturerId);
    if (!teacherSession) continue;

    // Kiểm tra idempotent trong danh sách lớp của giảng viên
    const myClassesRes = await httpClient.get('/lecturer/course-classes/my-classes', teacherSession.token);
    const myClasses = Array.isArray(myClassesRes.data) ? myClassesRes.data : (myClassesRes.data?.items || []);
    let existingClass = myClasses.find(c => c.class_code === clsDef.class_code);

    let courseClassId = existingClass?.course_class_id;

    if (!courseClassId) {
      const createRes = await httpClient.post(
        '/lecturer/course-classes',
        {
          class_code: clsDef.class_code,
          subject_id: clsDef.subject_id
        },
        teacherSession.token
      );

      if (createRes.ok && createRes.data?.course_class_id) {
        courseClassId = createRes.data.course_class_id;
        console.log(`  ✓ Đã tạo lớp học phần mới [${clsDef.class_code} - ${clsDef.subject_code}] (ID: ${courseClassId}) | GV: ${teacherSession.shortName}`);
      } else {
        // Fallback tìm trong toàn bộ lớp học kỳ hiện tại nếu mã lớp đã tồn tại
        const allClassesRes = await httpClient.get('/lecturer/course-classes', teacherSession.token);
        const allClasses = Array.isArray(allClassesRes.data) ? allClassesRes.data : (allClassesRes.data?.items || []);
        const found = allClasses.find(c => c.class_code === clsDef.class_code);
        if (found) {
          courseClassId = found.course_class_id;
          console.log(`  ℹ Sử dụng lớp học phần đã tồn tại [${clsDef.class_code}] (ID: ${courseClassId})`);
        } else {
          console.warn(`  ⚠️ Không thể tạo lớp ${clsDef.class_code}:`, createRes.data || createRes.raw);
          continue;
        }
      }
    } else {
      console.log(`  ℹ Tái sử dụng lớp học phần [${clsDef.class_code} - ${clsDef.subject_code}] (ID: ${courseClassId}) | GV: ${teacherSession.shortName}`);
    }

    classIdMap.set(clsDef.key, courseClassId);
    recordedClasses.push({
      key: clsDef.key,
      course_class_id: courseClassId,
      class_code: clsDef.class_code,
      subject_id: clsDef.subject_id,
      lecturerId: clsDef.lecturerId
    });

    // Gán đủ 5 Student vào lớp học phần
    const assignRes = await httpClient.post(
      `/lecturer/course-classes/${courseClassId}/students`,
      { student_user_ids: CONFIG.STUDENT_IDS },
      teacherSession.token
    );

    if (assignRes.ok) {
      console.log(`    ↳ Đã đồng bộ 5 sinh viên vào lớp ${clsDef.class_code} (Mới: ${assignRes.data?.total_enrolled ?? 0}, Đã có: ${assignRes.data?.already_enrolled_count ?? 0})`);
    }
  }

  return { classIdMap, classes: recordedClasses };
}

export async function proposeAndPredictSessions(sessionMap, classIdMap) {
  console.log('\n[5/8 SESSIONS & GAME 2] Đang đề xuất 6 phiên câu hỏi (30 câu) và đặt cược Game 2...');
  const createdSessions = [];

  for (const sessionDef of SESSIONS_DATA) {
    const authorSession = sessionMap.get(sessionDef.authorId);
    if (!authorSession) continue;

    const courseClassId = classIdMap.get(sessionDef.classKey) || CONFIG.DEFAULT_COURSE_CLASS_ID;

    // Kiểm tra idempotent: xem sinh viên đã có phiên trùng tiêu đề chưa
    const mySubsRes = await httpClient.get('/sessions/my-submissions?limit=50', authorSession.token);
    const existingList = mySubsRes.data?.contents || mySubsRes.data?.items || [];
    const existingSession = existingList.find(s => s.title === sessionDef.title);

    let sId = existingSession?.session_id;
    let isNew = false;

    if (sId) {
      console.log(`  ℹ Tái sử dụng Phiên [ID: ${sId}] (${existingSession.status || 'EXISTING'}) của ${authorSession.shortName}`);
    } else {
      const payload = {
        title: sessionDef.title,
        content: sessionDef.content,
        source_url: sessionDef.source_url,
        course_class_id: courseClassId,
        questions: sessionDef.questions
      };

      const res = await httpClient.post('/sessions/propose', payload, authorSession.token);
      if (res.ok && res.data?.session_id) {
        sId = res.data.session_id;
        isNew = true;
        console.log(`  ✓ Đã đề xuất Phiên mới [ID: ${sId}] - Lớp ID: ${courseClassId} | Tác giả: ${authorSession.shortName}`);
        console.log(`    Tiêu đề: "${sessionDef.title.slice(0, 68)}..." (${sessionDef.questions.length} câu)`);
      } else {
        console.warn(`  ⚠️ Thất bại khi đề xuất phiên cho ${authorSession.shortName}:`, res.data || res.raw);
        continue;
      }
    }

    // Đặt cược Game 2 ngay khi phiên còn PENDING (trước khi Teacher chốt RESOLVED)
    if (sessionDef.game2Prediction && (isNew || existingSession?.status === 'PENDING')) {
      const g2Res = await httpClient.post(
        '/games/prediction/approved-questions',
        {
          session_id: sId,
          predicted_human_count: sessionDef.game2Prediction.predicted_human_count,
          predicted_llm_count: sessionDef.game2Prediction.predicted_llm_count
        },
        authorSession.token
      );

      if (g2Res.ok) {
        console.log(`    🎯 [Game 2] ${authorSession.shortName} đã đặt cược cho Phiên ${sId} (Human: ${sessionDef.game2Prediction.predicted_human_count}, LLM: ${sessionDef.game2Prediction.predicted_llm_count})`);
      } else if (g2Res.status === 409) {
        console.log(`    ℹ [Game 2] Đã đặt cược từ trước cho Phiên ${sId}`);
      }
    }

    createdSessions.push({
      key: sessionDef.key,
      id: sId,
      authorId: sessionDef.authorId,
      reviewerId: sessionDef.reviewerId,
      classKey: sessionDef.classKey,
      courseClassId,
      title: sessionDef.title,
      questionsCount: sessionDef.questions.length
    });
  }

  return { sessions: createdSessions };
}

export async function resolveAllTeacherSessions(sessionMap, proposedSessions = []) {
  console.log('\n[6/8 TEACHER REVIEWS] Teacher 01 & 02 đang thẩm định và chốt RESOLVED 100% phiên câu hỏi...');
  const resolvedSessionIds = [];

  // 1. Duyệt các phiên trong SESSIONS_DATA theo đúng kịch bản reviewPlan
  for (const sessionDef of SESSIONS_DATA) {
    const matched = proposedSessions.find(s => s.key === sessionDef.key || s.title === sessionDef.title);
    if (!matched?.id) continue;

    const sId = matched.id;
    const reviewerSession = sessionMap.get(sessionDef.reviewerId);
    if (!reviewerSession) continue;

    const detailRes = await httpClient.get(`/lecturer/sessions/${sId}`, reviewerSession.token);
    if (!detailRes.ok) {
      console.warn(`  ⚠️ Không thể mở chi tiết phiên ${sId} bởi ${reviewerSession.shortName}:`, detailRes.data || detailRes.raw);
      continue;
    }

    const items = detailRes.data?.items || [];
    const plan = sessionDef.reviewPlan || {};
    const rejectIdxSet = new Set(plan.rejectQuestionIndexes || []);

    // Kiểm tra xem phiên đã RESOLVED từ trước chưa (tất cả câu hỏi không còn PENDING)
    const hasPending = items.some(q => q.status === 'PENDING');

    if (hasPending) {
      // 1.1 Chỉnh sửa câu hỏi mẫu nếu có cấu hình editQuestionIndex
      if (plan.editQuestionIndex != null && items[plan.editQuestionIndex]) {
        const qEdit = items[plan.editQuestionIndex];
        const origDef = sessionDef.questions[plan.editQuestionIndex];
        const editRes = await httpClient.put(
          `/lecturer/questions/${qEdit.question_id}`,
          {
            content: qEdit.content || origDef?.content,
            options: qEdit.options || origDef?.options,
            explanation: `${qEdit.explanation || origDef?.explanation || ''}${plan.editExplanationSuffix || ''}`,
            auto_approve: false
          },
          reviewerSession.token
        );
        if (editRes.ok) {
          console.log(`    ✎ [${reviewerSession.shortName}] Đã biên tập bổ sung lời giải cho câu hỏi [ID: ${qEdit.question_id}]`);
        }
      }

      // 1.2 Phê duyệt các câu hỏi đạt chuẩn
      const approveIds = items
        .filter((_, idx) => !rejectIdxSet.has(idx))
        .map(q => q.question_id)
        .filter(Boolean);

      if (approveIds.length > 0) {
        const appRes = await httpClient.post(
          '/lecturer/sessions/approve',
          { question_ids: approveIds },
          reviewerSession.token
        );
        if (appRes.ok) {
          console.log(`    ✓ [${reviewerSession.shortName}] Đã phê duyệt ${approveIds.length} câu hỏi trong Phiên ${sId}`);
        }
      }

      // 1.3 Từ chối câu hỏi lỗi mẫu (nếu có)
      const rejectIds = items
        .filter((_, idx) => rejectIdxSet.has(idx))
        .map(q => q.question_id)
        .filter(Boolean);

      if (rejectIds.length > 0) {
        const rejRes = await httpClient.post(
          '/lecturer/sessions/reject',
          {
            question_ids: rejectIds,
            reason: plan.rejectReason || 'Cần tách bạch rõ hơn các phương án gây nhiễu.'
          },
          reviewerSession.token
        );
        if (rejRes.ok) {
          console.log(`    ✗ [${reviewerSession.shortName}] Đã từ chối mẫu ${rejectIds.length} câu hỏi [ID: ${rejectIds.join(', ')}] kèm lý do chuyên môn`);
        }
      }
    }

    // 1.4 Chốt hoàn tất duyệt phiên (complete-review -> RESOLVED)
    const completeRes = await httpClient.post(
      `/lecturer/sessions/${sId}/complete-review`,
      null,
      reviewerSession.token
    );

    if (completeRes.ok) {
      resolvedSessionIds.push(sId);
      console.log(`  ✓ Đã chốt RESOLVED Phiên [ID: ${sId}] bởi ${reviewerSession.shortName}`);
    }
  }

  // 2. Quét toàn bộ danh sách /lecturer/sessions/reviewable của Teacher 01 & 02
  // để xử lý dứt điểm mọi phiên còn tồn đọng (bao gồm phiên 104 đang treo ở REVIEWING)
  for (const teacherId of [252, 253]) {
    const teacherSession = sessionMap.get(teacherId);
    if (!teacherSession) continue;

    const revRes = await httpClient.get('/lecturer/sessions/reviewable?limit=50', teacherSession.token);
    const lingering = revRes.data?.items || revRes.data?.contents || [];

    for (const rem of lingering) {
      const remId = rem.session_id;
      if (!remId) continue;

      const detailRes = await httpClient.get(`/lecturer/sessions/${remId}`, teacherSession.token);
      const items = detailRes.data?.items || [];
      const pendingIds = items.filter(q => q.status === 'PENDING').map(q => q.question_id).filter(Boolean);

      if (pendingIds.length > 0) {
        await httpClient.post('/lecturer/sessions/approve', { question_ids: pendingIds }, teacherSession.token);
      }

      const compRes = await httpClient.post(`/lecturer/sessions/${remId}/complete-review`, null, teacherSession.token);
      if (compRes.ok) {
        if (!resolvedSessionIds.includes(remId)) resolvedSessionIds.push(remId);
        console.log(`  ✓ Đã dọn & chốt RESOLVED phiên tồn đọng [ID: ${remId} - "${rem.title}"] bởi ${teacherSession.shortName}`);
      }
    }
  }

  return { resolvedSessionIds };
}

export async function practiceAndGenerateExams(sessionMap, classIdMap, proposedSessions = []) {
  console.log('\n[7/8 PRACTICE & EXAMS] 5 Student đang luyện tập/đánh giá câu hỏi & Teacher 01-02 sinh 4 đề thi...');
  let totalAnswers = 0;
  let totalRatings = 0;
  const createdExams = [];

  // 1. 5 Student làm bài luyện tập (/answer) và đánh giá chất lượng (/rate)
  for (const sessionDef of SESSIONS_DATA) {
    const matched = proposedSessions.find(s => s.key === sessionDef.key || s.title === sessionDef.title);
    if (!matched?.id) continue;

    const sId = matched.id;
    const readerSession = sessionMap.get(157);
    if (!readerSession) continue;

    const qRes = await httpClient.get(`/sessions/${sId}/questions`, readerSession.token);
    const liveQuestions = qRes.data?.questions || [];
    if (liveQuestions.length === 0) continue;

    for (let qIdx = 0; qIdx < liveQuestions.length; qIdx++) {
      const liveQ = liveQuestions[qIdx];
      const qId = liveQ.question_id;
      if (!qId) continue;

      // Tìm đáp án đúng từ SESSIONS_DATA gốc theo nội dung câu hỏi
      const origQ = sessionDef.questions.find(item => liveQ.content?.includes(item.content.slice(0, 35))) || sessionDef.questions[qIdx];
      const correctOpt = origQ?.options?.find(o => o.is_correct)?.key || 'B';
      const wrongOpt = origQ?.options?.find(o => !o.is_correct)?.key || 'A';

      // Cho cả 5 Student trả lời câu hỏi (4 người chọn đáp án đúng, 1 người chọn phương án nhiễu)
      for (let sIdx = 0; sIdx < CONFIG.STUDENT_IDS.length; sIdx++) {
        const studentId = CONFIG.STUDENT_IDS[sIdx];
        const studentSession = sessionMap.get(studentId);
        if (!studentSession) continue;

        if (!(liveQ.my_interaction?.answered && studentId === 157)) {
          const pickCorrect = ((qIdx + sIdx) % 5) !== 4;
          const selectedKey = pickCorrect ? correctOpt : wrongOpt;

          const ansPayload = {
            selected_options: [selectedKey]
          };
          if (liveQ.updated_at) {
            ansPayload.question_updated_at = liveQ.updated_at;
          }

          const ansRes = await httpClient.post(`/questions/${qId}/answer`, ansPayload, studentSession.token);
          if (ansRes.ok) {
            totalAnswers++;
          }
        }

        // Cho 3 Student đánh giá chất lượng mỗi câu hỏi (tránh tự đánh giá câu của chính mình)
        if (studentId !== sessionDef.authorId && (sIdx === 0 || sIdx === 1 || sIdx === 2)) {
          const ratingScore = (qIdx + sIdx) % 3 === 0 ? 3 : 4;
          const commentText = PRACTICE_COMMENTS[(qIdx + sIdx) % PRACTICE_COMMENTS.length];
          const rateRes = await httpClient.post(
            `/questions/${qId}/rate`,
            {
              rating: ratingScore,
              comment: commentText
            },
            studentSession.token
          );
          if (rateRes.ok) {
            totalRatings++;
          }
        }
      }
    }
  }
  console.log(`  ✓ Đã ghi nhận ${totalAnswers} lượt trả lời luyện tập và ${totalRatings} đánh giá sao từ 5 Student.`);

  // 2. Teacher 01 & 02 tự động sinh 4 Đề thi mẫu (/exams/generate)
  for (const examDef of EXAMS_DATA) {
    const teacherSession = sessionMap.get(examDef.lecturerId);
    if (!teacherSession) continue;

    const classId = classIdMap.get(examDef.classKey);
    if (!classId) continue;

    // Kiểm tra idempotent qua danh sách đề thi của giảng viên
    const myExamsRes = await httpClient.get('/exams/my-exams?limit=50', teacherSession.token);
    const existingExams = myExamsRes.data?.items || myExamsRes.data?.contents || [];
    const foundExam = existingExams.find(e => e.title === examDef.title);

    if (foundExam) {
      createdExams.push({ id: foundExam.exam_id, title: foundExam.title, lecturerId: examDef.lecturerId });
      console.log(`  ℹ Tái sử dụng Đề thi [ID: ${foundExam.exam_id}] "${examDef.title}" (${teacherSession.shortName})`);
      continue;
    }

    const genRes = await httpClient.post(
      '/exams/generate',
      {
        subject_id: examDef.subject_id,
        title: examDef.title,
        question_count: examDef.question_count,
        shuffle_options: examDef.shuffle_options,
        include_answer_key: examDef.include_answer_key,
        class_ids: [classId]
      },
      teacherSession.token
    );

    if (genRes.ok && genRes.data?.exam_id) {
      createdExams.push({
        id: genRes.data.exam_id,
        title: examDef.title,
        lecturerId: examDef.lecturerId,
        questionCount: genRes.data.question_count
      });
      console.log(`  ✓ Đã sinh Đề thi mới [ID: ${genRes.data.exam_id}] (${genRes.data.question_count} câu): "${examDef.title}"`);
    } else {
      console.warn(`  ⚠️ Không thể sinh đề thi "${examDef.title}":`, genRes.data || genRes.raw);
    }
  }

  return { exams: createdExams, totalAnswers, totalRatings };
}
