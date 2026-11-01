import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PostMediaGrid } from './PostMediaGrid'

describe('Post media returned by the server', () => {
  it('handles null media_urls without crashing the profile or feed', () => {
    const { container } = render(<PostMediaGrid media={null} />)
    expect(container).toBeEmptyDOMElement()
  })
  it('allows opening attachments beyond the fourth image', () => {
    render(
      <PostMediaGrid
        media={Array.from({ length: 5 }, (_, index) => ({
          url: `https://example.com/${index}.png`,
          name: `Image ${index}`,
          type: 'IMAGE',
        }))}
      />
    )
    expect(screen.getByRole('button', { name: 'Image 4' })).toBeInTheDocument()
  })
})
