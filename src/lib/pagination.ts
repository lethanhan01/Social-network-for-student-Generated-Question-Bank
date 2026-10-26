import type { CursorPaginationDto } from '@/types'

/**
 * Backend cursor responses expose `{ before, after, has_prev, has_next }` while the
 * request side accepts a single string `cursor`. The next page is requested with the
 * `after` value. This is the single place where that contract is interpreted so it can be
 * corrected in one spot if the backend semantics differ.
 */
export function getNextCursor(pagination?: CursorPaginationDto): string | undefined {
  if (!pagination?.has_next) return undefined
  if (pagination.after === undefined || pagination.after === null) return undefined
  return String(pagination.after)
}

export const getCursorFromPagination = getNextCursor
