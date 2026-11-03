import assert from 'node:assert/strict'

/** Remote IDs/cursors are data, never URL syntax or a replacement endpoint. */
export function encodeServerIdentifier(value) {
  assert.ok(
    typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value)),
    'Expected a decimal server identifier'
  )
  const identifier = Number(value)
  assert.ok(Number.isSafeInteger(identifier) && identifier > 0, 'Expected a positive safe integer')
  return encodeURIComponent(String(identifier))
}
