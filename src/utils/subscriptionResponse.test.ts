import { describe, expect, it } from 'vitest'
import {
  parseSubscriptionListResponse,
  InvalidSubscriptionResponseError,
} from './subscriptionResponse'

describe('subscriptionResponse parser (subscriptionResponse.ts)', () => {
  it('parses valid subscription response array', () => {
    const validPayload = {
      success: true,
      data: [
        {
          subscriptionId: 'sub-1',
          memberId: 'm-1',
          packageId: 'p-1',
          startDate: '2026-01-01',
          endDate: '2026-12-31',
          status: 'active',
        },
      ],
    }

    const result = parseSubscriptionListResponse(validPayload)
    expect(result).toHaveLength(1)
    expect(result[0].subscriptionId).toBe('sub-1')
  })

  it('throws InvalidSubscriptionResponseError on malformed response', () => {
    expect(() => parseSubscriptionListResponse(null)).toThrow(InvalidSubscriptionResponseError)
    expect(() => parseSubscriptionListResponse({})).toThrow(InvalidSubscriptionResponseError)
    expect(() => parseSubscriptionListResponse({ success: false, data: [] })).toThrow(
      InvalidSubscriptionResponseError
    )
    expect(() => parseSubscriptionListResponse({ success: true, data: 'not-an-array' })).toThrow(
      InvalidSubscriptionResponseError
    )
  })
})
