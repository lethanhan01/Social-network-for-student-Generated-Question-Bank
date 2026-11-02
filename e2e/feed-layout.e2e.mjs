import { test, expect } from '@playwright/test'

const profile = {
  user_id: 235, full_name: 'Nguyễn Minh Anh', student_lecturer_code: '20235631',
  role: 'STUDENT', bio: 'Cùng nhau học tập và chia sẻ kiến thức mỗi ngày.',
}
const subjects = [{ subject_id: 1, code: 'IT4409', name: 'Công nghệ Web' }]

test('Feed stays responsive with the header, subject filter and friend sidebar', async ({ page }) => {
  await page.addInitScript((user) => {
    localStorage.setItem('sqb-auth-storage', JSON.stringify({ state: {
      user: { ...user, fullName: user.full_name, roles: ['STUDENT'] }, token: 'layout-test',
      isAuthenticated: true,
    }, version: 0 }))
    localStorage.setItem('gym-locale', 'vi')
    localStorage.setItem('rogym-theme', JSON.stringify({ state: { theme: 'dark' }, version: 0 }))
  }, profile)
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname
    let data = { items: [], pagination: { has_next: false } }
    if (path.endsWith('/users/me')) data = profile
    else if (path.endsWith('/my-enrolled-course-classes')) data = [{
      subject_id: 1, subject_code: 'IT4409', subject_name: 'Công nghệ Web',
    }]
    else if (path.endsWith('/subjects') || path.endsWith('/my-enrolled-subjects')) data = subjects
    else if (path.endsWith('/friendships')) data = {
      items: [{ user_id: 2, full_name: 'Trần Tuấn Anh' }], total_friends: 1,
    }
    else if (path.includes('new-count')) data = { new_count: 0 }
    else if (path.endsWith('/activity-feeds')) data = {
      items: [{ feed_id: 1, target_type: 'POST', target_id: 102 }],
      pagination: { has_next: false },
    }
    else if (path.endsWith('/posts/102')) data = {
      post_id: 102, subject_id: 1, author: profile, created_at: '2026-11-03T08:00:00Z',
      content: 'Mọi người cùng thảo luận bài tập Công nghệ Web nhé!',
    }
    await route.fulfill({ json: { code: 200, data } })
  })

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
      expect(columns[1] / columns[0]).toBeCloseTo(52 / 23, 1)
    } else await expect(sidebars.nth(1)).toBeHidden()
    await page.screenshot({ path: test.info().outputPath(`feed-${width}.png`), fullPage: true })
  }
  await page.getByRole('button', { name: 'Môn học của tôi' }).click()
  await expect(page).toHaveURL(/tab=MY_SUBJECTS/)
  await expect(page.getByText('Mọi người cùng thảo luận bài tập Công nghệ Web nhé!')).toBeVisible()
  await page.getByRole('button', { name: 'Chuyển sang giao diện sáng' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light')
  await page.screenshot({ path: test.info().outputPath('feed-light.png'), fullPage: true })
  await page.getByRole('button', { name: 'Switch to Japanese' }).click()
  await expect(page.getByRole('button', { name: '履修科目', exact: true })).toBeVisible()
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
})
