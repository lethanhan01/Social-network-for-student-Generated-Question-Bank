/**
 * Quản lý định danh thiết bị duy nhất (Device Fingerprint) cho Client Web.
 */
const DEVICE_KEY = 'sqb_web_device_id'

export function getDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_KEY)
  if (existing) {
    return existing
  }
  const newId = `web-${crypto.randomUUID()}`
  localStorage.setItem(DEVICE_KEY, newId)
  return newId
}
