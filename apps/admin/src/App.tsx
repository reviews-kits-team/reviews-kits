import { Routes, Route, Navigate } from 'react-router-dom'
import { authClient } from './lib/auth-client'
import { AuthGuard } from './components/auth-guard'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import SecurityPage from './pages/SecurityPage'
import FormEditorPage from './pages/FormEditorPage'
import PublicFormPage from './pages/PublicFormPage'
import './App.css'

function App() {
  const { data: session } = authClient.useSession()

  return (
    <Routes>
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
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/forms/:id/edit" element={<FormEditorPage />} />
      </Route>

      <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
    </Routes>
  )
}

export default App
