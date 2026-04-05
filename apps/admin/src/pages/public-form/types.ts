export interface StepField {
  id: string
  type: 'text' | 'nps' | 'choice' | 'grid'
  label: string
  placeholder?: string
  options?: string[]
  rows?: string[]
}

export interface FormStep {
  id: string
  type: 'welcome' | 'core' | 'identity' | 'success' | 'custom' | 'rating' | 'textarea' | 'attribution' | 'informative'
  title: string
  description?: string
  isEnabled: boolean
  locked?: boolean
  config?: Record<string, unknown>
}

export interface FormBranding {
  logoUrl?: string
  avatarUrl?: string
  primaryColor?: string
  headingFont?: string
  bodyFont?: string
}

export interface FormData {
  id: string
  publicId: string
  name: string
  description?: string
  config: {
    steps: FormStep[]
    branding: FormBranding
  }
}
