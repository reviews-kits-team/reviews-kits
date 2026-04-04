import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { authClient } from './lib/auth-client'
import { AuthGuard } from './components/auth-guard'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import FormDetailPage from './pages/FormDetailPage'
import FormEditorPage from './pages/FormEditorPage'
import PublicFormPage from './pages/PublicFormPage'
import TestimonialDetailPage from './pages/TestimonialDetailPage'
import IntegrationsPage from './pages/IntegrationsPage'
import './App.css'

// Apply saved theme before first render to avoid flash
const savedTheme = localStorage.getItem('rk-theme')
if (savedTheme === 'light') {
  document.documentElement.classList.add('light')
}

function App() {
  const { data: session } = authClient.useSession()
  const location = useLocation()

  return (
    <div key={location.key} className="animate-in fade-in slide-in-from-bottom-3 duration-200">
      <Routes location={location}>
        <Route
          path="/login"
          element={session ? <Navigate to="/" replace /> : <LoginPage />}
        />

        {/* Public Form Route */}
        <Route path="/f/:slug" element={<PublicFormPage />} />

        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/forms/:id" element={<FormDetailPage />} />
          <Route path="/forms/:id/edit" element={<FormEditorPage />} />
          <Route path="/forms/:formId/testimonials/:id" element={<TestimonialDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
      </Routes>
    </div>
  )
}

export default App
