import type { ReactNode } from 'react'

interface SocialFeedLayoutProps {
  leftSidebar: ReactNode
  centerFeed: ReactNode
  rightSidebar: ReactNode
}

export function SocialFeedLayout({
  leftSidebar,
  centerFeed,
  rightSidebar,
}: Readonly<SocialFeedLayoutProps>) {
  return (
    /* rogym-convention-exempt: NO_NONSEMANTIC_TAGS [Responsive 3-column flex container for social feed] */
    <div className="social-feed-layout">
      {/* Left Column: Shortcuts & Sub-Navigation */}
      <aside className="social-feed-sidebar hidden lg:block min-w-0 sticky top-20 z-10 overflow-y-auto no-scrollbar">
        {leftSidebar}
      </aside>

      {/* Center Column: Create Box, Filter Tabs, Feed Streams */}
      <section className="min-w-0 w-full">
        {centerFeed}
      </section>

      {/* Right Column: Online Study Buddies & Widgets */}
      <aside className="social-feed-sidebar hidden xl:block min-w-0 sticky top-20 z-10 overflow-y-auto no-scrollbar">
        {rightSidebar}
      </aside>
    </div>
  )
}
