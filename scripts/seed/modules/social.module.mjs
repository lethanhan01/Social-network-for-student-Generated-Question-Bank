/**
 * Module đăng bài viết, bình luận phân cấp và thả cảm xúc mạng xã hội
 */

import { POSTS_DATA } from '../data/posts.data.mjs';
import { httpClient } from './client.mjs';

export async function createSocialContent(sessionMap) {
  console.log('\n[4/7 SOCIAL] Đang khởi tạo 8 bài viết, bình luận và cảm xúc...');
  const createdPosts = [];
  const createdComments = [];

  for (const postDef of POSTS_DATA) {
    const authorSession = sessionMap.get(postDef.authorId);
    if (!authorSession) {
      console.warn(`  ⚠️ Không tìm thấy phiên đăng nhập cho tác giả ID ${postDef.authorId}`);
      continue;
    }

    // 1. Tạo bài viết sinh viên (SOCIAL_POST không truyền subject_id)
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
    console.log(`  ✓ Đã đăng bài viết [ID: ${postId}] của ${authorSession.shortName} (${postDef.visibility})`);

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

  console.log(`  ✓ Tổng kết Social: ${createdPosts.length} bài viết, ${createdComments.length} bình luận đã tạo.`);
  return {
    posts: createdPosts,
    comments: createdComments
  };
}
