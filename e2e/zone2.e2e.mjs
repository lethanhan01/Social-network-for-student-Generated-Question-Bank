import { test, expect } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'

let auth
let headers
const cleanup = new Set()
test.afterAll(async ({ request }) => {
  for (const id of cleanup) {
    const response = await request.delete(`/api/v1/posts/${id}`, { headers })
    expect(response.ok()).toBeTruthy()
  }
})
test.beforeAll(async ({ request }, info) => {
  const readme = await readFile(new URL('../README.md', import.meta.url), 'utf8')
  const email = process.env.SQB_TEST_EMAIL ?? readme.match(/user:\s+(\S+)/)?.[1]
  const password = process.env.SQB_TEST_PASSWORD ?? readme.match(/password:\s+(\S+)/)?.[1]
  const deviceId = `sqb-zone2-ui-${info.project.name}`
  const response = await request.post('/api/v1/auth/login', {
    headers: { 'X-Device-Id': deviceId },
    data: {
      email,
      password,
      device_id: deviceId,
      platform: 'WEB',
      device_name: 'Zone 2 UI verification',
    },
  })
  expect(response.ok()).toBeTruthy()
  const { data } = await response.json()
  expect(data.access_token).toBeTruthy()
  headers = { Authorization: `Bearer ${data.access_token}`, 'X-Device-Id': deviceId }
  auth = {
    user: {
      user_id: data.user_id,
      userId: String(data.user_id),
      role: data.role,
      roles: [data.role],
      fullName: data.username,
    },
    token: data.access_token,
    refreshToken: data.refresh_token,
    isAuthenticated: true,
  }
})
test.beforeEach(async ({ page }) => {
  await page.addInitScript(
    ({ authState }) => {
      localStorage.setItem('sqb-auth-storage', JSON.stringify({ state: authState, version: 0 }))
      localStorage.setItem('gym-locale', 'vi')
    },
    { authState: auth }
  )
})
test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus) {
    const details = page.getByRole('button', { name: /Chi tiết lỗi/ })
    if (await details.isVisible()) {
      await details.click()
      process.stderr.write((await page.locator('pre').allTextContents()).join('\n'))
    }
  }
})

test('Zone 2 routes render without runtime errors or horizontal overflow', async ({ page }) => {
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  for (const [route, heading] of [
    ['/feed', 'Bảng tin & Hoạt động'],
    ['/friends', 'Bạn bè & Kết nối'],
    ['/search?q=Web', 'Tìm kiếm toàn cục'],
    ['/profile/me', null],
    ['/messages', 'Đoạn chat'],
  ]) {
    await page.goto(route)
    await expect(page.locator('h1')).toBeVisible()
    await page.waitForLoadState('networkidle')
    if (route === '/feed') await page.screenshot({ path: test.info().outputPath('feed.png') })
    if (heading) await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBeTruthy()
    await expect(page.getByText('Đã có lỗi xảy ra', { exact: true })).toHaveCount(0)
  }
  expect(errors).toEqual([])
})

test('private post create, edit and delete works through the client', async ({ page, request }) => {
  let postId
  const marker = `Zone 2 browser verification ${randomUUID()}`
  const errors = []
  page.on('pageerror', (error) => errors.push(error.message))
  try {
    await page.goto('/feed')
    await page.getByRole('button', { name: 'Bạn muốn thảo luận bài tập hoặc chia sẻ tài liệu gì hôm nay?' }).click()
    await page.getByRole('textbox', { name: 'Nội dung bài viết' }).fill(marker)
    await page.getByRole('combobox', { name: 'Chọn quyền riêng tư' }).click()
    await page.getByRole('option', { name: 'Chỉ mình tôi', exact: true }).click()
    const createdResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && /\/api\/v1\/posts$/.test(response.url())
    )
    await page.getByRole('button', { name: 'Đăng bài viết', exact: true }).click()
    const created = await (await createdResponse).json()
    postId = created.data?.post_id
    expect(postId).toBeTruthy()
    cleanup.add(postId)
    await expect(page.getByText(marker, { exact: true })).toBeVisible()
    const card = page.locator('article').filter({ hasText: marker }).last().locator('..')
    await card.getByRole('button', { name: 'Tùy chọn bài viết' }).click()
    await page.getByRole('menuitem', { name: 'Chỉnh sửa bài viết' }).click()
    const dialog = page.getByRole('dialog', { name: 'Chỉnh sửa bài viết' })
    await dialog.getByRole('textbox', { name: 'Nội dung thảo luận' }).fill(`${marker} updated`)
    await dialog.getByRole('button', { name: 'Lưu', exact: true }).click()
    await expect(page.getByText(`${marker} updated`, { exact: true })).toBeVisible()
    await page.goto(`/posts/${postId}`)
    await page.getByRole('button', { name: 'Tùy chọn bài viết' }).click()
    await page.getByRole('menuitem', { name: 'Xóa bài viết' }).click()
    await page
      .getByRole('dialog', { name: 'Xóa bài viết' })
      .getByRole('button', { name: 'Xóa', exact: true })
      .click()
    await expect(page).toHaveURL(/\/feed$/)
    cleanup.delete(postId)
    postId = undefined
    expect(errors).toEqual([])
  } finally {
    if (postId) {
      const response = await request
        .delete(`/api/v1/posts/${postId}`, { headers })
        .catch(() => undefined)
      if (response?.ok()) cleanup.delete(postId)
    }
  }
})

test('messaging links resolve to the messenger page', async ({ page }) => {
  await page.goto('/friends')
  const messageLink = page.getByRole('main').getByRole('link', { name: 'Nhắn tin', exact: true }).first()
  await expect(messageLink).toBeVisible()
  {
    await messageLink.click()
    await expect(page).toHaveURL(/\/messages\?userId=\d+/)
    await expect(page.getByRole('button', { name: 'Bắt đầu trò chuyện' })).toBeVisible()
  }
})
