import {
  siClerk,
  siGithub,
  siLemonsqueezy,
  siResend,
  siStripe,
} from 'simple-icons'

type Brand = {
  title: string
  color: string
  path?: string
  src?: string
}

const brands: Brand[] = [
  { title: siStripe.title, path: siStripe.path, color: `#${siStripe.hex}` },
  { title: siGithub.title, path: siGithub.path, color: '#ffffff' },
  { title: siClerk.title, path: siClerk.path, color: `#${siClerk.hex}` },
  { title: 'Paystack', src: '/logos/paystack.svg', color: '#09A5DB' },
  { title: siResend.title, path: siResend.path, color: '#ffffff' },
  { title: siLemonsqueezy.title, path: siLemonsqueezy.path, color: `#${siLemonsqueezy.hex}` },
]

function BrandLogo({ title, path, src, color }: Brand) {
  if (src) {
    return <img src={src} alt={title} className="h-8 w-auto shrink-0" />
  }

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      aria-label={title}
      className="h-8 w-auto shrink-0"
    >
      <path d={path} fill={color} />
    </svg>
  )
}

export function IntegrationMarquee() {
  const track = brands.map((brand) => (
    <BrandLogo key={brand.title} {...brand} />
  ))

  return (
    <div className="relative overflow-hidden py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-linear-to-r from-zinc-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-linear-to-l from-zinc-950 to-transparent" />
      <div className="marquee-track flex w-max items-center gap-16">
        {track}
        {track}
      </div>
    </div>
  )
}
