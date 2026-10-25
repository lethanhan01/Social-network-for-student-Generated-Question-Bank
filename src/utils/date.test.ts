import { describe, expect, it } from 'vitest'
import { localDateTimeInputToIso, msUntilNextSaturday, splitDurationDaysHours } from './date'

describe('msUntilNextSaturday', () => {
  it('counts down from a Sunday to the next Saturday midnight in Vietnam time', () => {
    // Chủ Nhật 25/10/2026 10:00 (UTC+7)
    const ms = msUntilNextSaturday(new Date('2026-10-25T03:00:00Z'))
    expect(splitDurationDaysHours(ms)).toEqual({ days: 5, hours: 14 })
  })

  it('returns 0 during Saturday', () => {
    expect(msUntilNextSaturday(new Date('2026-10-31T01:00:00Z'))).toBe(0)
  })

  it('uses the Vietnam calendar day instead of UTC', () => {
    // 17:30Z Thứ Sáu = 00:30 Thứ Bảy giờ Việt Nam
    expect(msUntilNextSaturday(new Date('2026-10-30T17:30:00Z'))).toBe(0)
    // 16:30Z Thứ Sáu = 23:30 Thứ Sáu giờ Việt Nam → còn 30 phút
    expect(msUntilNextSaturday(new Date('2026-10-30T16:30:00Z'))).toBe(30 * 60 * 1000)
  })
})

describe('localDateTimeInputToIso', () => {
  it('converts a valid Vietnam local datetime to ISO', () => {
    expect(localDateTimeInputToIso('2026-07-27T02:27')).toBe('2026-07-26T19:27:00.000Z')
  })

  it.each(['', '2026-07-27T', '2026-07-27T24:00', '2026-02-30T10:00', 'not-a-date'])(
    'returns an empty value for invalid input %p',
    (value) => {
      expect(localDateTimeInputToIso(value)).toBe('')
    },
  )
})
