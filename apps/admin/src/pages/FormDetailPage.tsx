import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { TopBar } from '../components/dashboard/top-bar'
import { DetailView } from '../components/dashboard/detail-view'
import { useDashboardFormById } from '../hooks/useFormDetail'

export default function FormDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: form, isLoading, isError } = useDashboardFormById(id)

  if (isLoading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <TopBar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    </div>
  )

  if (isError || !form) {
    navigate('/', { replace: true })
    return null
  }

  return (
    <div className="min-h-screen">
      <TopBar />
      <DetailView form={form} onBack={() => navigate('/')} />
    </div>
  )
}
