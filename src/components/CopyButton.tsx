import { useState } from 'react'
import { Button } from './ui/form/Button'

type CopyButtonProps = {
  text: string
  label?: string
  className?: string
  variant?: 'primary' | 'ghost' | 'toolbar' | 'danger' | 'dangerFilled'
}

export function CopyButton({ text, label = 'Copy', className = '', variant = 'ghost' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1000)
  }

  return (
    <Button variant={variant} onClick={handleCopy} className={className}>
      {copied ? 'Copied' : label}
    </Button>
  )
}
