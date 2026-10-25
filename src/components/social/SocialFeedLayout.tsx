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
    <div className="flex justify-center gap-6 w-full items-start">
      {/* Left Column: Shortcuts & Sub-Navigation */}
      <aside className="hidden lg:block w-72 shrink-0 sticky top-20">
        {leftSidebar}
      </aside>

      {/* Center Column: Create Box, Filter Tabs, Feed Streams */}
      <section className="flex-1 max-w-3xl min-w-0 w-full space-y-6">
        {centerFeed}
      </section>

      {/* Right Column: Online Study Buddies & Widgets */}
      <aside className="hidden xl:block w-80 shrink-0 sticky top-20">
        {rightSidebar}
      </aside>
    </div>
  )
}
