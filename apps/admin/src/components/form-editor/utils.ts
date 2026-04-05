import type { FormStep } from './types'

// Ensures custom steps are always before identity/success
// (fixes steps saved in wrong position)
export function normalizeStepOrder(steps: FormStep[]): FormStep[] {
  const firstGateIndex = steps.findIndex(
    (s) => s.type === 'identity' || s.type === 'attribution' || s.type === 'success'
  )
  if (firstGateIndex === -1) return steps

  const misplaced = steps.filter((s, i) => s.type === 'custom' && i >= firstGateIndex)
  if (misplaced.length === 0) return steps

  const rest = steps.filter((s, i) => !(s.type === 'custom' && i >= firstGateIndex))
  const insertAt = rest.findIndex(
    (s) => s.type === 'identity' || s.type === 'attribution' || s.type === 'success'
  )
  return [...rest.slice(0, insertAt), ...misplaced, ...rest.slice(insertAt)]
}
