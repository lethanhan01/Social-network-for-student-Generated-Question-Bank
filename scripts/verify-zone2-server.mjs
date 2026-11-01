import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

// Credentials stay in memory. Use the documented staging account or explicit environment overrides.
const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8')
const example = await readFile(new URL('../.env.example', import.meta.url), 'utf8')
const configuredUrl = process.env.SQB_API_URL ?? example.match(/^VITE_API_URL=(.+)$/m)?.[1]?.trim()
const proxyTarget = example.match(/^API_PROXY_TARGET=(.+)$/m)?.[1]?.trim()
const base = new URL(configuredUrl, proxyTarget).href.replace(/\/$/, '')
const email = process.env.SQB_TEST_EMAIL ?? readme.match(/user:\s+(\S+)/)?.[1]
const password = process.env.SQB_TEST_PASSWORD ?? readme.match(/password:\s+(\S+)/)?.[1]
assert.ok(
  base && email && password,
  'Provide SQB_API_URL, SQB_TEST_EMAIL and SQB_TEST_PASSWORD or the documented staging configuration'
)
const deviceId = 'sqb-zone2-verification'
let token
let passed = 0
const failures = []
async function request(path, method = 'GET', body) {
  const response = await fetch(`${base}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id': deviceId,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(25_000),
  })
  const envelope = await response.json()
  assert.ok(
    response.ok,
    `${method} ${path}: HTTP ${response.status} ${envelope.message ?? envelope.detail ?? ''}`
  )
  assert.equal(String(envelope.code), '1000', `${method} ${path}: ${envelope.message}`)
  return envelope.data
}
async function check(name, action) {
  try {
    await action()
    passed++
    process.stdout.write(`PASS ${name}\n`)
  } catch (error) {
    failures.push(name)
    process.stderr.write(`FAIL ${name}: ${error.message}\n`)
  }
}
const login = await request('/auth/login', 'POST', {
  email,
  password,
  device_id: deviceId,
  platform: 'WEB',
  device_name: 'Zone 2 verification',
})
token = login.access_token
assert.ok(token, 'Login did not return an access token')
const profile = await request('/users/me')
if (process.argv.includes('--cleanup-ui-fixtures')) {
  const own = await request('/posts/me?limit=50')
  for (const post of own.items ?? []) {
    if (
      post.author?.user_id === profile.user_id &&
      post.visibility === 'ONLY_ME' &&
      /^Zone 2 browser verification [0-9a-f-]{36}( updated)?$/.test(post.content ?? '')
    ) {
      await request(`/posts/${post.post_id}`, 'DELETE')
      process.stdout.write(`Cleaned private UI fixture ${post.post_id}\n`)
    }
  }
}
const contractResponse = await fetch(`${base}/docs/openapi.json`, {
  signal: AbortSignal.timeout(30_000),
})
assert.ok(contractResponse.ok, 'OpenAPI is unavailable')
const contract = await contractResponse.json()
await check('OpenAPI query parameters', async () => {
  for (const [path, names] of Object.entries({
    '/comments': ['target_type', 'target_id', 'parent_comment_id', 'after'],
    '/search': ['query', 'after'],
    '/activity-feeds/new-count': ['since'],
    '/posts/me': ['after'],
    '/friendships': ['after'],
  })) {
    const actual = contract.paths[path]?.get?.parameters?.map((param) => param.name) ?? []
    for (const name of names) assert.ok(actual.includes(name), `${path} must accept ${name}`)
  }
  assert.ok(
    contract.paths['/search/saved']?.post,
    'Confirmed searches must support POST /search/saved'
  )
})
for (const path of [
  '/posts/me?limit=2',
  `/users/${profile.user_id}/posts?limit=2`,
  '/activity-feeds?limit=2',
  '/friendships?limit=2',
  '/friendships/requests/received?limit=2',
  '/friendships/requests/sent?limit=2',
  '/follows/following?limit=2',
  '/follows/followers?limit=2',
  '/blocks?limit=2',
  '/conversations?limit=2',
  '/search?query=Web&type=ALL&limit=2',
  '/search/saved',
  `/activity-feeds/new-count?since=${Date.now()}`,
]) {
  await check(`GET ${path.split('?')[0]}`, async () => {
    assert.ok(await request(path))
  })
}
await check('Post pagination uses after', async () => {
  const first = await request('/posts/me?limit=1')
  if (!first.pagination?.has_next) return
  const second = await request(`/posts/me?limit=1&after=${first.pagination.after}`)
  assert.notEqual(first.items[0]?.post_id, second.items[0]?.post_id)
})
if (process.argv.includes('--write')) {
  let postId
  await check('Private post, nested comments and reaction lifecycle', async () => {
    try {
      const marker = `SQB automated Zone 2 check ${randomUUID()}`
      const post = await request('/posts', 'POST', {
        content: marker,
        visibility: 'ONLY_ME',
        post_type: 'SOCIAL_POST',
      })
      postId = post.post_id
      assert.ok(postId)
      await request(`/posts/${postId}`, 'PUT', {
        content: `${marker} updated`,
        visibility: 'ONLY_ME',
      })
      assert.equal((await request(`/posts/${postId}`)).content, `${marker} updated`)
      const root = await request('/comments', 'POST', {
        target_type: 'POST',
        target_id: postId,
        content: 'Automated root comment',
      })
      assert.ok(root.comment_id)
      const reply = await request('/comments', 'POST', {
        target_type: 'POST',
        target_id: postId,
        parent_comment_id: root.comment_id,
        content: 'Automated reply',
      })
      await request(`/comments/${reply.comment_id}`, 'PUT', { content: 'Automated reply updated' })
      const roots = await request(`/comments?target_type=POST&target_id=${postId}&limit=20`)
      assert.ok(roots.items.some((item) => item.comment_id === root.comment_id))
      const replies = await request(
        `/comments?target_type=POST&target_id=${postId}&parent_comment_id=${root.comment_id}&limit=20`
      )
      assert.ok(replies.items.some((item) => item.content === 'Automated reply updated'))
      for (const type of ['LIKE', 'LOVE', 'WOW']) {
        const reaction = await request('/react', 'POST', {
          target_type: 'POST',
          target_id: postId,
          reaction_type: type,
        })
        assert.equal(reaction.my_reaction, type)
        assert.equal(reaction.total_count, 1, 'Changing reaction type must not decrement the total')
      }
      const removed = await request('/react', 'POST', {
        target_type: 'POST',
        target_id: postId,
        reaction_type: 'WOW',
      })
      assert.equal(removed.total_count, 0)
      await request(`/comments/${reply.comment_id}`, 'DELETE')
      await request(`/comments/${root.comment_id}`, 'DELETE')
    } finally {
      if (postId) await request(`/posts/${postId}`, 'DELETE')
    }
  })
}
process.stdout.write(
  `${passed} checks passed; ${failures.length} failed. No messages or relationship requests were sent.\n`
)
process.exitCode = failures.length ? 1 : 0
