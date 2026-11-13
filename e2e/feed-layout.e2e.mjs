import { test, expect } from '@playwright/test'

const profile = {
  user_id: 235, full_name: 'Nguyễn Minh Anh', student_lecturer_code: '20235631',
  role: 'STUDENT', bio: 'Cùng nhau học tập và chia sẻ kiến thức mỗi ngày.',
}
const subjects = [{ subject_id: 1, code: 'IT4409', name: 'Công nghệ Web' }]

test.beforeEach(async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('sqb-auth-storage', JSON.stringify({ state: {
      user: { ...user, fullName: user.full_name, roles: ['STUDENT'] }, token: 'layout-test',
      isAuthenticated: true,
    }, version: 0 }))
    localStorage.setItem('gym-locale', 'vi')
    localStorage.setItem('rogym-theme', JSON.stringify({ state: { theme: 'dark' }, version: 0 }))
  }, profile)
  await page.routeWebSocket('**/ws/**', (socket) => socket.close())
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    let data = { items: [], pagination: { has_next: false } }
    if (path.endsWith('/users/me')) data = profile
    else if (path.endsWith('/users/2')) data = {
      user_id: 2, full_name: 'Trần Tuấn Anh', role: 'STUDENT', bio: 'Cùng học Công nghệ Web.',
    }
    else if (path.endsWith('/badges/users/2')) data = []
    else if (path.endsWith('/conversations')) data = {
      items: [{ conversation_id: 24, type: 'GROUP', display_name: 'Nhóm Công nghệ Web', member_count: 2 }],
    }
    else if (path.endsWith('/conversations/24/members')) data = [profile, { user_id: 2, full_name: 'Trần Tuấn Anh' }]
    else if (path.endsWith('/conversations/24/messages')) data = {
      messages: [{ message_id: 5, sender_id: 2, sender_name: 'Trần Tuấn Anh', content: 'Hẹn gặp ở lớp!' }],
    }
    else if (path.endsWith('/my-enrolled-course-classes')) data = [{
      subject_id: 1, subject_code: 'IT4409', subject_name: 'Công nghệ Web',
    }]
    else if (path.endsWith('/subjects') || path.endsWith('/my-enrolled-subjects')) data = subjects
    else if (path.endsWith('/friendships')) data = {
      items: [{ user_id: 2, full_name: 'Trần Tuấn Anh' }], total_friends: 1,
    }
    else if (path.includes('new-count')) data = { new_count: 0 }
    else if (path.endsWith('/activity-feeds')) data = {
      items: [102, 103].map((id) => ({ feed_id: id, target_type: 'POST', target_id: id })),
      pagination: { has_next: false },
    }
    else if (/\/posts\/10[23]$/.test(path)) data = {
      post_id: Number(path.split('/').at(-1)), subject_id: 1, author: profile, created_at: '2026-11-03T08:00:00Z',
      content: path.endsWith('/102')
        ? 'Mọi người cùng thảo luận bài tập Công nghệ Web nhé!'
        : 'Bài viết thứ hai để kiểm tra khoảng cách.',
    }
    await route.fulfill({ json: { code: 200, data } })
  })
})

test('Feed stays responsive with the header, subject filter and friend sidebar', async ({ page }) => {
  for (const width of [375, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/feed')
    await expect(page.getByRole('heading', { level: 1, name: 'Bảng tin & Hoạt động' })).toBeVisible()
    await expect(page.getByRole('banner')).toHaveCount(1)
    await expect(page.locator('main aside')).toHaveCount(2)
    await expect(page.getByRole('link', { name: 'SQB HUST', exact: true })).toBeVisible()
    await expect(page.getByText('Mọi người cùng thảo luận bài tập Công nghệ Web nhé!')).toBeVisible()
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    const sidebars = page.locator('.social-feed-sidebar')
    if (width >= 1024) await expect(sidebars.nth(0)).toBeVisible()
    else await expect(sidebars.nth(0)).toBeHidden()
    if (width >= 1280) {
      await expect(sidebars.nth(1)).toBeVisible()
      const columns = await page.locator('.social-feed-layout').evaluate((element) =>
        getComputedStyle(element).gridTemplateColumns.split(' ').map(Number.parseFloat))
      expect(columns[1]).toBe(680)
      expect(columns[0]).toBeCloseTo(columns[2], 0)
    } else await expect(sidebars.nth(1)).toBeHidden()
    const posts = page.locator('.social-card').filter({ has: page.locator('.social-post-copy') })
    await expect(posts).toHaveCount(2)
    const first = await posts.nth(0).boundingBox()
    const second = await posts.nth(1).boundingBox()
    expect(second.y - first.y - first.height).toBeCloseTo(12, 0)
    await page.screenshot({ path: test.info().outputPath(`feed-${width}.png`), fullPage: true })
  }
  await page.getByRole('button', { name: 'Môn học của tôi' }).click()
  await expect(page).toHaveURL(/tab=MY_SUBJECTS/)
  await expect(page.getByText('Mọi người cùng thảo luận bài tập Công nghệ Web nhé!')).toBeVisible()
  await page.getByRole('button', { name: 'Menu người dùng' }).click()
  await expect(page.getByRole('menuitem', { name: 'Hồ sơ cá nhân' })).toBeVisible()
  await expect(page.getByRole('menu').getByRole('radiogroup')).toHaveCount(0)
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Chuyển sang giao diện sáng' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.screenshot({ path: test.info().outputPath('feed-light.png'), fullPage: true })
  await page.getByRole('button', { name: 'Switch to Japanese' }).click()
  await expect(page.getByRole('button', { name: '履修科目', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})

test('Profile actions and conversation information fit on desktop and mobile', async ({ page }) => {
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/profile/2')
    await expect(page.getByRole('heading', { name: 'Trần Tuấn Anh' })).toBeVisible()
    const actions = [
      page.getByRole('link', { name: 'Nhắn tin', exact: true }),
      page.getByRole('button', { name: 'Kết bạn', exact: true }),
      page.getByRole('button', { name: 'Theo dõi', exact: true }),
      page.getByRole('button', { name: 'Tùy chọn hồ sơ' }),
    ]
    for (const action of actions) await expect(action).toBeVisible()
    const boxes = await Promise.all(actions.map((action) => action.boundingBox()))
    expect(boxes.every((box) => Math.abs(box.y - boxes[0].y) < 1)).toBe(true)
    await actions[3].click()
    await expect(page.getByRole('menuitem', { name: 'Gửi báo cáo' })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).toBeHidden()
    await page.screenshot({ path: test.info().outputPath(`profile-${width}.png`) })

    await page.goto('/messages/24')
    const title = page.getByRole('region', { name: 'Nội dung hội thoại' })
      .getByRole('button', { name: 'Nhóm Công nghệ Web', exact: true })
    await title.click()
    const details = page.getByRole('complementary', { name: 'Thông tin hội thoại' })
    await expect(details).toBeVisible()
    await details.getByRole('button', { name: 'Thành viên (2)' }).click()
    await expect(details.getByText('Trần Tuấn Anh')).toBeVisible()
    await expect(page.getByRole('main').getByText('Hẹn gặp ở lớp!')).toBeVisible({ visible: width >= 1280 })
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: test.info().outputPath(`chat-${width}.png`) })
    await details.getByRole('button', { name: 'Quản trị nhóm chat' }).click()
    await expect(page.getByRole('dialog', { name: 'Quản trị nhóm chat' })).toBeVisible()
    await page.keyboard.press('Escape')
    await details.getByRole('button', { name: 'Đóng thông tin hội thoại' }).click()
    await expect(details).toBeHidden()
    await expect(title).toBeFocused()
  }
})
