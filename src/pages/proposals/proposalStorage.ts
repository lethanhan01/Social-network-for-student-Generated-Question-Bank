import type { ProposalItem } from './ProposalCard'
import type { MySubmissionDetailResponse } from '@/types'

const PROPOSALS_KEY = 'sqb_proposals_list'
const DETAILS_KEY = 'sqb_proposals_details'

export function getStoredProposals(): ProposalItem[] {
  try {
    const raw = localStorage.getItem(PROPOSALS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoredProposal(proposal: ProposalItem, detail: MySubmissionDetailResponse): void {
  try {
    const existing = getStoredProposals()
    const updated = [proposal, ...existing.filter((p) => p.session_id !== proposal.session_id)]
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updated))

    const rawDetails = localStorage.getItem(DETAILS_KEY)
    const detailsMap: Record<number, MySubmissionDetailResponse> = rawDetails ? JSON.parse(rawDetails) : {}
    if (proposal.session_id) {
      detailsMap[proposal.session_id] = detail
      localStorage.setItem(DETAILS_KEY, JSON.stringify(detailsMap))
    }
  } catch {
    // Ignore storage quota or environment errors
  }
}

export function updateStoredProposalStatus(
  sessionId: number,
  newStatus: 'PENDING' | 'APPROVED' | 'REJECTED'
): void {
  try {
    const existing = getStoredProposals()
    const updated = existing.map((p) => (p.session_id === sessionId ? { ...p, status: newStatus } : p))
    localStorage.setItem(PROPOSALS_KEY, JSON.stringify(updated))

    const rawDetails = localStorage.getItem(DETAILS_KEY)
    const detailsMap: Record<number, MySubmissionDetailResponse> = rawDetails ? JSON.parse(rawDetails) : {}
    if (detailsMap[sessionId]) {
      detailsMap[sessionId].reviewed_by_lecturer =
        newStatus === 'APPROVED' ? 'TS. Nguyễn Văn A (Khoa CNTT - HUST)' : undefined
      detailsMap[sessionId].reviewed_at = newStatus === 'APPROVED' ? new Date().toISOString() : undefined
      localStorage.setItem(DETAILS_KEY, JSON.stringify(detailsMap))
    }
  } catch {
    // Ignore storage quota or environment errors
  }
}

export function getStoredProposalDetail(sessionId: number): MySubmissionDetailResponse | undefined {
  try {
    const rawDetails = localStorage.getItem(DETAILS_KEY)
    const detailsMap: Record<number, MySubmissionDetailResponse> = rawDetails ? JSON.parse(rawDetails) : {}
    return detailsMap[sessionId]
  } catch {
    return undefined
  }
}
