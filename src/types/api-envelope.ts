/**
 * Global API Response Envelopes & Meta definitions for SQB HUST
 */

export interface GlobalResponse<T> {
  code: string
  message: string
  data: T
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface CursorMeta {
  next_cursor?: string | null
  has_more: boolean
}
