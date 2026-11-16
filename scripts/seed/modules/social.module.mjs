/**
 * Module đăng bài viết (8 bài Student + 5 bài Teacher), bình luận phân cấp,
 * thả cảm xúc mạng xã hội và gắn Ghi chú chuyên môn của Giảng viên (Lecturer Notes) lên bài Vinh danh.
 */

import { POSTS_DATA, LECTURER_NOTES } from '../data/posts.data.mjs';
import { httpClient } from './client.mjs';

export async function createSocialContent(sessionMap) {
  console.log('\n[SOCIAL] Đang khởi tạo 13 bài viết (8 SV + 5 GV), bình luận, cảm xúc và Lecturer Notes...');
  const createdPosts = [];
  const createdComments = [];

  for (const postDef of POSTS_DATA) {
    const authorSession = sessionMap.get(postDef.authorId);
    if (!authorSession) {
      console.warn(`  ⚠️ Không tìm thấy phiên đăng nhập cho tác giả ID ${postDef.authorId}`);
      continue;
    }

    const postPayload = {
      content: postDef.content,
      visibility: postDef.visibility,
      post_type: 'SOCIAL_POST'
    };

    const postRes = await httpClient.post('/posts', postPayload, authorSession.token);
    if (!postRes.ok || !postRes.data?.post_id) {
      console.warn(`  ⚠️ Thất bại khi tạo bài viết của ${authorSession.shortName}:`, postRes.data || postRes.raw);
      continue;
    }

    const postId = postRes.data.post_id;
    createdPosts.push({ id: postId, authorId: postDef.authorId });
    console.log(`  ✓ [${authorSession.role}] Đã đăng bài viết [ID: ${postId}] của ${authorSession.shortName} (${postDef.visibility})`);

    // 2. Tạo bình luận và phản hồi phân cấp
    for (const commentDef of postDef.comments || []) {
      const commenterSession = sessionMap.get(commentDef.authorId);
      if (!commenterSession) continue;

      const commentRes = await httpClient.post(
        '/comments',
        {
          target_type: 'POST',
          target_id: postId,
          content: commentDef.content
        },
        commenterSession.token
      );

      if (commentRes.ok && commentRes.data?.comment_id) {
        const commentId = commentRes.data.comment_id;
        createdComments.push({ id: commentId, authorId: commentDef.authorId });
        console.log(`    ↳ Bình luận [ID: ${commentId}] từ ${commenterSession.shortName}`);

        // Tạo phản hồi con (nested replies) nếu có
        for (const replyDef of commentDef.replies || []) {
          const replierSession = sessionMap.get(replyDef.authorId);
          if (!replierSession) continue;

          const replyRes = await httpClient.post(
            '/comments',
            {
              target_type: 'POST',
              target_id: postId,
              content: replyDef.content,
              parent_comment_id: commentId
            },
            replierSession.token
          );

          if (replyRes.ok && replyRes.data?.comment_id) {
            createdComments.push({ id: replyRes.data.comment_id, authorId: replyDef.authorId });
            console.log(`      ↳ Phản hồi con [ID: ${replyRes.data.comment_id}] từ ${replierSession.shortName}`);
          }
        }
      }
    }

    // 3. Thả cảm xúc cho bài viết
    for (const reactDef of postDef.reactions || []) {
      const reactorSession = sessionMap.get(reactDef.userId);
      if (!reactorSession) continue;

      await httpClient.post(
        '/react',
        {
          target_type: 'POST',
          target_id: postId,
          reaction_type: reactDef.type
        },
        reactorSession.token
      );
    }
  }

  // 4. Teacher 01 (252) & Teacher 02 (253) gắn Ghi chú chuyên môn (Lecturer Notes) lên các bài Vinh danh câu hỏi
  let notedCount = 0;
  for (const teacherId of [252, 253]) {
    const teacherSession = sessionMap.get(teacherId);
    if (!teacherSession) continue;

    const feedRes = await httpClient.get('/activity-feeds?limit=40', teacherSession.token);
    const feedItems = feedRes.data?.items || feedRes.data?.contents || [];
    const honorItems = feedItems.filter(
      item =>
        (item.action_type === 'SESSION_RESOLVED_APPROVED' ||
          item.content?.post_type === 'QUESTION_APPROVED_NOTIFICATION') &&
        item.target_id
    );

    for (let idx = 0; idx < honorItems.length; idx++) {
      const honor = honorItems[idx];
      const postId = honor.target_id;
      const noteText = LECTURER_NOTES[(idx + teacherId) % LECTURER_NOTES.length];

      const noteRes = await httpClient.put(
        `/posts/${postId}/lecturer-notes`,
        { content: noteText },
        teacherSession.token
      );

      if (noteRes.ok) {
        notedCount++;
        console.log(`  ✓ [Lecturer Note] ${teacherSession.shortName} đã gắn ghi chú chuyên môn lên bài vinh danh [Post ID: ${postId}]`);
        // Thả thêm cảm xúc LOVE của Giảng viên lên bài vinh danh
        await httpClient.post(
          '/react',
          { target_type: 'POST', target_id: postId, reaction_type: 'LOVE' },
          teacherSession.token
        );
      }
    }
  }

  console.log(`  ✓ Tổng kết Social: ${createdPosts.length} bài viết, ${createdComments.length} bình luận, ${notedCount} ghi chú vinh danh Giảng viên.`);
  return {
    posts: createdPosts,
    comments: createdComments
  };
}
