import { describe, expect, it } from 'vitest'
import { encodeServerIdentifier } from './lib/zone2-request-url.mjs'

describe('Server identifiers used in verification request URLs', () => {
  it.each([1, 42, '42', 1728200000000])('accepts the documented numeric identifier %s', (value) => {
    expect(encodeServerIdentifier(value)).toBe(String(value))
  })
  it.each([
    '../users/me',
    '1/../../users/me',
    '1&limit=1000000',
    '1?redirect=https://example.com',
    'https://example.com',
    '//example.com',
    '1#fragment',
    '1e3',
    '0x10',
    '',
    0,
    -1,
    1.5,
    Number.MAX_SAFE_INTEGER + 1,
    null,
    undefined,
    {},
    ['42'],
    true,
  ])('rejects a response value that cannot be used as an API identifier: %j', (value) => {
    expect(() => encodeServerIdentifier(value)).toThrow()
  })
})
