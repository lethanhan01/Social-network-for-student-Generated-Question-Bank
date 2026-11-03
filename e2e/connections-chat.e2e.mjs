import { test, expect } from '@playwright/test'

test('Friends and all chat entry points use the restored interface', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sqb-auth-storage', JSON.stringify({ state: {
      user: { user_id: 1, fullName: 'Nguyễn Minh Anh', roles: ['STUDENT'], role: 'STUDENT' },
      token: 'layout-test', isAuthenticated: true,
    }, version: 0 }))
    localStorage.setItem('gym-locale', 'vi')
    localStorage.setItem('rogym-theme', JSON.stringify({ state: { theme: 'dark' }, version: 0 }))
  })
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    const pagination = { has_next: false }
    let data = { items: [], pagination }
    if (path.endsWith('/friendships')) data = {
      items: [{ user_id: 2, full_name: 'Trần Tuấn Anh', mutual_friends_count: 4 }], pagination,
    }
    else if (path.endsWith('/friendships/requests/received')) data = {
      items: [{ requester: { user_id: 3, full_name: 'Vũ Thị Hạnh' } }], pagination,
    }
    else if (path.endsWith('/conversations')) data = {
      items: [{ conversation_id: 7, type: 'DIRECT', display_name: 'Trần Tuấn Anh',
        last_message: { message_id: 2, content: 'Cùng ôn tập Công nghệ Web nhé!' } }], pagination,
    }
    else if (path.endsWith('/conversations/direct')) data = { conversation_id: 7 }
    else if (path.endsWith('/conversations/7/messages')) data = {
      conversation_id: 7, pagination,
      messages: [
        { message_id: 2, sender_id: 2, sender_name: 'Trần Tuấn Anh', content: 'Cùng ôn tập Công nghệ Web nhé!', created_at: '2026-11-03T08:00:00Z' },
        { message_id: 1, sender_id: 1, sender_name: 'Nguyễn Minh Anh', content: 'Mình vừa chia sẻ tài liệu trên bảng tin.', created_at: '2026-11-03T07:55:00Z' },
      ],
    }
    await route.fulfill({ json: { code: 200, data } })
  })

  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/friends')
    await expect(page.getByRole('heading', { name: 'Bạn bè & Kết nối', level: 1 })).toBeVisible()
    await expect(page.getByText('4 bạn chung')).toBeVisible()
    await expect(page.getByRole('tab', { name: /Bạn bè/, selected: true })).toBeVisible()
    await page.screenshot({ path: test.info().outputPath(`friends-${width}.png`), fullPage: true })
    await page.getByRole('tab', { name: /Lời mời nhận/ }).click()
    await expect(page.getByText('Vũ Thị Hạnh')).toBeVisible()
    await page.getByRole('tab', { name: /^Bạn bè/ }).click()
    await page.getByRole('link', { name: 'Nhắn tin' }).click()
    await expect(page).toHaveURL(/messages\?userId=2/)
    await page.getByRole('button', { name: 'Bắt đầu trò chuyện' }).click()
    await expect(page).toHaveURL(/messages\/7/)
    await expect(page.getByText('Cùng ôn tập Công nghệ Web nhé!', { exact: true }).last()).toBeVisible()
    const composer = page.getByRole('textbox', { name: 'Nhập tin nhắn...' })
    await expect(composer).toBeVisible()
    const box = await composer.boundingBox()
    expect(box.y + box.height).toBeLessThanOrEqual(900)
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: test.info().outputPath(`chat-${width}.png`), fullPage: true })

    await page.goto('/messages?conversation=7')
    await expect(page.getByRole('textbox', { name: 'Nhập tin nhắn...' })).toBeVisible()
    if (width < 768) {
      await page.getByRole('button', { name: 'Quay lại', exact: true }).click()
      await expect(page.getByRole('heading', { name: 'Đoạn chat', level: 1 })).toBeVisible()
    }
  }
})
