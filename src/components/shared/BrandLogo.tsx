import logoPng from '@/assets/logo.png'
import { cn } from '@/utils/cn'

interface BrandLogoProps {
  className?: string
  alt?: string
}

export function BrandLogo({ className, alt = 'SQB HUST' }: Readonly<BrandLogoProps>) {
  return (
    <img
      src={logoPng}
      alt={alt}
      width={90}
      height={32}
      decoding="async"
      className={cn('h-8 w-auto object-contain select-none shrink-0', className)}
    />
  )
}

