import { ArrowRight, ArrowLeft } from 'lucide-react'
import type { FormStep, StepField } from '../types'

interface CustomStepProps {
  step: FormStep
  primaryColor: string
  appliedHeadingFont: string
  customFieldValues: Record<string, unknown>
  setCustomFieldValues: (values: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>)) => void
  onNext: () => void
  onBack: () => void
}

export function CustomStep({ 
  step, 
  primaryColor, 
  appliedHeadingFont, 
  customFieldValues, 
  setCustomFieldValues, 
  onNext, 
  onBack 
}: CustomStepProps) {
  const fields = ((step.config as Record<string, unknown>)?.fields || []) as StepField[]

  return (
    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 w-full flex flex-col items-center">
      <h1 className="text-4xl font-black tracking-tighter text-black mb-6" style={{ fontFamily: appliedHeadingFont, color: '#000000' }}>
        {step.title}
      </h1>
      <p className="text-gray-600 mb-8 text-xl leading-relaxed">{step.description}</p>

      <div className="w-full space-y-6 mb-10 text-left">
        {fields.map(field => (
          <div key={field.id}>
            <p className="text-sm font-bold text-gray-800 mb-2">{field.label}</p>
            {field.type === 'text' && (
              <input
                type="text"
                placeholder={field.placeholder || 'Your answer...'}
                value={(customFieldValues[field.id] as string) || ''}
                onChange={e => setCustomFieldValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                className="w-full px-6 py-4 rounded-2xl border-2 border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-gray-100 outline-none transition-all text-black placeholder:text-gray-400"
              />
            )}
            {field.type === 'nps' && (
              <div className="flex gap-1">
                {Array.from({ length: 11 }, (_, i) => {
                  const selected = customFieldValues[field.id] === i
                  return (
                    <button key={i}
                      onClick={() => setCustomFieldValues(prev => ({ ...prev, [field.id]: i }))}
                      style={selected ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#fff' } : {}}
                      className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${selected ? '' : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-600'}`}
                    >{i}</button>
                  )
                })}
              </div>
            )}
            {field.type === 'choice' && (
              <div className="space-y-2">
                {(field.options || []).map((opt, i) => {
                  const selected = customFieldValues[field.id] === opt
                  return (
                    <button key={i}
                      onClick={() => setCustomFieldValues(prev => ({ ...prev, [field.id]: opt }))}
                      style={selected ? { borderColor: primaryColor } : {}}
                      className={`w-full px-6 py-4 rounded-2xl border-2 text-left font-medium transition-all flex items-center gap-3 ${selected ? 'bg-gray-50 text-gray-900' : 'border-gray-100 bg-gray-50 hover:border-gray-300 text-gray-700'}`}
                    >
                      <div
                        style={selected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                        className={`w-4 h-4 rounded-full border-2 shrink-0 ${selected ? '' : 'border-gray-300'}`}
                      />
                      {opt}
                    </button>
                  )
                })}
              </div>
            )}
            {field.type === 'grid' && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-gray-400 font-normal text-left w-1/3" />
                      {(field.options || ['1','2','3','4','5']).map(col => (
                        <th key={col} className="p-2 text-gray-500 font-bold text-center">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(field.rows || []).map((row, ri) => {
                      const rowSelections = (customFieldValues[field.id] as Record<number, string>) || {}
                      return (
                        <tr key={ri} className="border-t border-gray-100">
                          <td className="p-2 text-gray-600 text-sm">{row}</td>
                          {(field.options || ['1','2','3','4','5']).map(col => {
                            const selected = rowSelections[ri] === col
                            return (
                              <td key={col} className="p-2 text-center">
                                <button
                                  onClick={() => setCustomFieldValues(prev => ({
                                    ...prev,
                                    [field.id]: { ...((prev[field.id] as Record<number, string>) || {}), [ri]: col }
                                  }))}
                                  style={selected ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                                  className={`w-5 h-5 rounded-full border-2 mx-auto transition-all block ${selected ? '' : 'border-gray-200 hover:border-gray-400'}`}
                                />
                              </td>
                            )
                          })}
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex gap-4 w-full">
        <button onClick={onBack}
          className="px-6 py-5 rounded-2xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all font-bold"
        >
          <ArrowLeft size={22} />
        </button>
        <button
          onClick={onNext}
          style={{ backgroundColor: primaryColor }}
          className="flex-1 py-5 rounded-2xl text-white font-bold text-lg shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
        >
          {(step.config as Record<string, string>)?.buttonText || 'Continue'} <ArrowRight size={22} />
        </button>
      </div>
    </div>
  )
}
