import type { ReactNode } from 'react'
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/overlay/Sheet'

interface Props {
  title: string
  description: string
  onClose: () => void
  children: ReactNode
  drawer?: boolean
}
export function PortalDialog({ title, description, onClose, children, drawer = false }: Props) {
  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <SheetContent
        side={drawer ? 'right' : 'top'}
        className={
          drawer
            ? ''
            : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg rounded-2xl border border-line-subtle'
        }
      >
        <SheetTitle className="pr-8 text-xl font-bold">{title}</SheetTitle>
        <SheetDescription className="text-sm text-fg-secondary">{description}</SheetDescription>
        {children}
      </SheetContent>
    </Sheet>
  )
}
