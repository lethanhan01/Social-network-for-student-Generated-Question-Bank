import { describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithQueryClient } from '@/test/query-test-utils'
import { CommentForm } from './CommentForm'

describe('Comment draft recovery', () => {
  it('preserves a failed reply and lets the user retry successfully', async () => {
    const send = vi.fn().mockRejectedValueOnce(new Error('Offline')).mockResolvedValueOnce({})
    const user = userEvent.setup()
    renderWithQueryClient(<CommentForm label="Reply" onSend={send} />)
    await user.type(screen.getByRole('textbox', { name: 'Reply' }), 'Keep this draft')
    await user.click(screen.getByRole('button', { name: 'Gửi' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Offline')
    expect(screen.getByRole('textbox', { name: 'Reply' })).toHaveValue('Keep this draft')
    await user.click(screen.getByRole('button', { name: 'Gửi' }))
    expect(screen.getByRole('textbox', { name: 'Reply' })).toHaveValue('')
    expect(send).toHaveBeenCalledTimes(2)
  })
})
