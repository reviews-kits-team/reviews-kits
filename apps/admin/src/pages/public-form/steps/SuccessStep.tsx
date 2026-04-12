import { CheckCircle, Twitter, Linkedin, Link2 } from 'lucide-react'
import type { FormStep } from '../types'

interface SuccessStepProps {
  step: FormStep
  primaryColor: string
  appliedHeadingFont: string
}

export function SuccessStep({ step, primaryColor, appliedHeadingFont }: SuccessStepProps) {
  const cfg = step.config as Record<string, unknown> | undefined
  
  // New customizable fields with defaults
  const thankYouTitle = step.title || 'Thank you for your feedback!'
  const thankYouMessage = step.description || cfg?.thankYouMessage as string || 'We appreciate your review and will use it to improve our service.'
  const ctaLabel = cfg?.thankYouCtaLabel as string | undefined
  const ctaUrl = cfg?.thankYouCtaUrl as string | undefined
  const showSocial = cfg?.thankYouShowSocial as boolean ?? false
  
  // Social share text
  const shareText = cfg?.thankYouShareText as string || 'I just left a review! Check it out:'
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : ''
  
  const handleTwitterShare = () => {
    const text = encodeURIComponent(`${shareText} ${shareUrl}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'width=550,height=450')
  }
  
  const handleLinkedInShare = () => {
    const url = encodeURIComponent(shareUrl)
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'width=550,height=450')
  }
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
  }

  return (
    <div className="animate-in zoom-in-95 duration-1000 w-full flex flex-col items-center">
      <div 
        style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
        className="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner animate-bounce"
      >
        <CheckCircle size={64} />
      </div>
      
      <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: appliedHeadingFont, color: '#000000' }}>
        {thankYouTitle}
      </h1>
      
      <p className="text-gray-600 text-xl leading-relaxed max-w-md mb-8">
        {thankYouMessage}
      </p>

      {/* CTA Button */}
      {ctaLabel && ctaUrl && (
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-white font-bold text-lg mb-8 transition-all hover:scale-105 hover:shadow-lg"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 4px 14px ${primaryColor}40`
          }}
        >
          {ctaLabel}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </a>
      )}

      {/* Social Share Buttons */}
      {showSocial && (
        <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-200 w-full max-w-xs">
          <span className="text-sm text-gray-500 font-medium">Share your experience</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleTwitterShare}
              className="w-12 h-12 rounded-full bg-[#1DA1F2] flex items-center justify-center text-white hover:bg-[#1a91da] transition-all hover:scale-110 hover:shadow-lg"
              aria-label="Share on Twitter"
            >
              <Twitter size={22} />
            </button>
            
            <button
              onClick={handleLinkedInShare}
              className="w-12 h-12 rounded-full bg-[#0A66C2] flex items-center justify-center text-white hover:bg-[#004182] transition-all hover:scale-110 hover:shadow-lg"
              aria-label="Share on LinkedIn"
            >
              <Linkedin size={22} />
            </button>
            
            <button
              onClick={handleCopyLink}
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-all hover:scale-110 hover:shadow-lg"
              aria-label="Copy link"
            >
              <Link2 size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
