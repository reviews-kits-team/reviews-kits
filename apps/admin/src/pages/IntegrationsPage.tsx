import { useState } from 'react'
import { SettingsLayout } from '../components/dashboard/settings-layout'
import { Activity, ShieldCheck, Plus, Trash2, Play, Loader2, X, Upload, FileSpreadsheet } from 'lucide-react'
import { useWebhooks, useCreateWebhook, useDeleteWebhook, useTestWebhook } from '../hooks/useWebhooks'

const INTEGRATIONS = [
  { name: 'Zapier', description: 'Automate tasks with 6,000+ apps.', logo: 'https://cdn.simpleicons.org/zapier/FF6600' },
  { name: 'Make', description: 'Design and automate workflows with no-code.', logo: 'https://cdn.simpleicons.org/make/5A29E4' },
  { name: 'n8n', description: 'Self-hosted workflow automation tool.', logo: 'https://cdn.simpleicons.org/n8n/FF6D5A' },
  { name: 'Slack', description: 'Sync reviews and receive alerts in channels.', logo: 'https://cdn.simpleicons.org/slack/4A154B' },
]

export default function IntegrationsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newHook, setNewHook] = useState({ name: '', url: '', events: ['testimonial.created'] })

  const { data: webhooks = [], isLoading } = useWebhooks()
  const createWebhook = useCreateWebhook()
  const deleteWebhook = useDeleteWebhook()
  const testWebhook = useTestWebhook()

  const handleAddWebhook = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    await createWebhook.mutateAsync(newHook)
    setIsModalOpen(false)
    setNewHook({ name: '', url: '', events: ['testimonial.created'] })
  }

  const handleDelete = (id: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return
    deleteWebhook.mutate(id)
  }

  const handleTest = async (id: string) => {
    await testWebhook.mutateAsync(id)
    alert('Test payload sent successfully!')
  }

  return (
    <SettingsLayout
      title="Integrations"
      subtitle="Connect ReviewKits with your favorite tools via webhooks."
    >
      <div className="space-y-12 py-4">
        {/* Services Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {INTEGRATIONS.map((app) => (
            <div key={app.name} className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-4 flex flex-col items-center text-center gap-4 group hover:border-(--v3-teal) transition-all">
              <div className="w-12 h-12 rounded-xl bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center p-2.5 transition-all group-hover:bg-(--v3-bg) shrink-0">
                <img src={app.logo} alt={app.name} className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-(--v3-text) text-base mb-1">{app.name}</h3>
                <p className="text-[10px] text-(--v3-muted2) leading-relaxed line-clamp-2">{app.description}</p>
              </div>
              <button className="w-full py-2 bg-(--v3-bg3) border border-(--v3-border) rounded-xl text-[10px] font-bold text-(--v3-muted2) hover:bg-(--v3-teal) hover:text-white hover:border-(--v3-teal) transition-all whitespace-nowrap uppercase tracking-wider">
                Connect
              </button>
            </div>
          ))}
        </div>

        {/* Data Migration Section */}
        <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-(--v3-teal)/40 transition-all">
          <div className="w-14 h-14 rounded-2xl bg-(--v3-teal)/10 flex items-center justify-center text-(--v3-teal) shrink-0 shadow-[0_0_20px_rgba(45,212,191,0.1)]">
            <Upload size={28} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-(--v3-text) text-lg mb-1">Import & Data Migration</h3>
            <p className="text-xs text-(--v3-muted2) leading-relaxed max-w-xl">
              Migrate your existing reviews from <span className="text-(--v3-text) font-semibold">Trustpilot, Senja, or custom CSV/JSON files</span>.
              Go to your form details to start the migration wizard.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full border-2 border-(--v3-bg2) bg-[#00b67a] flex items-center justify-center text-[10px] font-black text-white shadow-lg" title="Trustpilot">T</div>
              <div className="w-8 h-8 rounded-full border-2 border-(--v3-bg2) bg-[#5a29e4] flex items-center justify-center text-[10px] font-black text-white shadow-lg" title="Senja">S</div>
              <div className="w-8 h-8 rounded-full border-2 border-(--v3-bg2) bg-amber-500 flex items-center justify-center text-[10px] font-black text-white shadow-lg" title="CSV/JSON">
                <FileSpreadsheet size={12} />
              </div>
            </div>
          </div>
        </div>

        {/* Webhooks Management */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-(--v3-bg2) border border-(--v3-border) flex items-center justify-center text-(--v3-teal)">
                <Activity size={20} />
              </div>
              <div>
                <h2 className="font-bold text-(--v3-text)">Webhooks</h2>
                <p className="text-xs text-(--v3-muted2)">Manage your outgoing webhooks.</p>
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-(--v3-teal) text-white text-xs font-bold rounded-xl hover:shadow-[0_8px_20px_rgba(45,212,191,0.3)] transition-all"
            >
              <Plus size={16} /> Add Hook
            </button>
          </div>

          <div className="mb-5 bg-(--v3-bg2) border border-(--v3-border) rounded-2xl overflow-hidden text-sm">
            {isLoading ? (
              <div className="p-12 flex flex-col items-center justify-center text-(--v3-muted2) gap-3">
                <Loader2 className="animate-spin" size={32} />
                <p>Loading webhooks...</p>
              </div>
            ) : webhooks.length === 0 ? (
              <div className="p-12 text-center text-(--v3-muted2)">
                <p>No webhooks configured yet.</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-(--v3-border) bg-(--v3-bg3)/50">
                    <th className="px-6 py-4 font-bold text-(--v3-text)">Name</th>
                    <th className="px-6 py-4 font-bold text-(--v3-text)">Webhook URL</th>
                    <th className="px-6 py-4 font-bold text-(--v3-text)">Events</th>
                    <th className="px-6 py-4 font-bold text-(--v3-text) text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--v3-border)">
                  {webhooks.map((hook) => (
                    <tr key={hook.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-(--v3-text) font-medium">
                          <span className={`w-2 h-2 rounded-full ${hook.isActive ? 'bg-(--v3-teal)' : 'bg-gray-500'}`} />
                          {hook.name || 'Untitled Webhook'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-(--v3-muted2) font-mono text-xs truncate max-w-50" title={hook.url}>{hook.url}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {hook.events.map((ev: string) => (
                            <span key={ev} className="px-2 py-0.5 bg-(--v3-teal)/10 text-(--v3-teal) rounded-md text-[10px] font-bold border border-(--v3-teal)/20 uppercase tracking-tight">
                              {ev}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleTest(hook.id)}
                            className="w-8 h-8 rounded-lg bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center text-(--v3-muted2) hover:text-(--v3-teal) hover:border-(--v3-teal) transition-all" title="Test Payload"
                          >
                            <Play size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(hook.id)}
                            className="w-8 h-8 rounded-lg bg-(--v3-bg3) border border-(--v3-border) flex items-center justify-center text-(--v3-muted2) hover:text-red-400 hover:border-red-400/50 transition-all" title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Security / Documentation */}
        <div className="p-6 bg-(--v3-teal)/5 border border-(--v3-teal)/20 rounded-xl flex flex-col md:flex-row gap-8 items-start md:items-center mt-12 shadow-sm group hover:border-(--v3-teal)/40 transition-all">
          <div className="w-16 h-16 rounded-full bg-(--v3-teal)/10 flex items-center justify-center text-(--v3-teal) shrink-0 shadow-[0_0_40px_rgba(45,212,191,0.1)] group-hover:scale-110 transition-transform">
            <ShieldCheck size={40} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-(--v3-text) text-xl mb-3">Payload Verification</h3>
            <p className="text-sm text-(--v3-muted2) leading-relaxed max-w-2xl">
              Every webhook request includes an <code>X-ReviewKits-Signature</code> header. Use your secret key to verify the HMAC-SHA256 signature of the request body to ensure it originated from ReviewKits.
            </p>
          </div>
        </div>
      </div>

      {/* Modal for adding Webhook */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-(--v3-bg2) border border-(--v3-border) rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-(--v3-border) flex items-center justify-between bg-(--v3-bg3)/50">
              <h3 className="font-black text-xl text-(--v3-text)">New Webhook</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-(--v3-muted2) hover:text-(--v3-text) transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddWebhook} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-(--v3-muted2) uppercase tracking-wider">Webhook Name</label>
                <input
                  type="text"
                  value={newHook.name}
                  onChange={e => setNewHook({ ...newHook, name: e.target.value })}
                  className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl py-3 px-4 text-sm text-(--v3-text) outline-none focus:border-(--v3-teal) transition-all"
                  placeholder="e.g. Zapier Integration"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-(--v3-muted2) uppercase tracking-wider">Payload URL</label>
                <input
                  type="url"
                  required
                  value={newHook.url}
                  onChange={e => setNewHook({ ...newHook, url: e.target.value })}
                  className="w-full bg-(--v3-bg) border border-(--v3-border) rounded-xl py-3 px-4 text-sm text-(--v3-text) outline-none focus:border-(--v3-teal) transition-all"
                  placeholder="https://hooks.zapier.com/..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-(--v3-muted2) uppercase tracking-wider">Events</label>
                <div className="p-4 bg-(--v3-bg) border border-(--v3-border) rounded-xl">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" checked readOnly className="w-4 h-4 rounded border-(--v3-border) bg-(--v3-bg) text-(--v3-teal)" />
                    <span className="text-sm text-(--v3-text)">New Review Submitted</span>
                  </label>
                </div>
              </div>
              <button
                type="submit"
                disabled={createWebhook.isPending}
                className="w-full py-4 bg-(--v3-teal) text-white font-bold rounded-2xl shadow-[0_8px_20px_rgba(45,212,191,0.2)] hover:shadow-[0_12px_24px_rgba(45,212,191,0.3)] disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {createWebhook.isPending && <Loader2 className="animate-spin" size={18} />}
                Create Webhook
              </button>
            </form>
          </div>
        </div>
      )}
    </SettingsLayout>
  )
}
