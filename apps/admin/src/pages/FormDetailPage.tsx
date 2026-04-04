import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { TopBar } from '../components/dashboard/top-bar'
import { DetailView } from '../components/dashboard/detail-view'
import type { DashboardForm } from '../components/dashboard/types'

export default function FormDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form, setForm] = useState<DashboardForm | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`/api/v1/forms/${id}`)
        if (res.ok) {
          const data = await res.json()
          setForm(data)
        } else {
          navigate('/', { replace: true })
        }
      } catch {
        navigate('/', { replace: true })
      } finally {
        setLoading(false)
      }
    }
    fetchForm()
  }, [id, navigate])

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col">
      <TopBar />
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    </div>
  )

  if (!form) return null

  return (
    <div className="min-h-screen">
      <TopBar />
      <DetailView form={form} onBack={() => navigate('/')} />
    </div>
  )
}
