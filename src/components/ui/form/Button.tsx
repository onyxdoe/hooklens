import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'toolbar' | 'danger' | 'dangerFilled'
  pill?: boolean
}

const variants = {
  primary: 'bg-zinc-100 text-zinc-950 hover:bg-white',
  ghost: 'bg-transparent text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
  toolbar: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
  danger: 'bg-transparent text-zinc-500 hover:text-red-400 hover:bg-zinc-800',
  dangerFilled: 'bg-red-950 text-red-400 hover:bg-red-900',
}

export function Button({ variant = 'primary', pill, className = '', children, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${pill ? 'rounded-full px-6 py-2.5' : 'rounded'} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
