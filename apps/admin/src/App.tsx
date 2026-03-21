import { Routes, Route, Navigate } from 'react-router-dom'
import { authClient } from './lib/auth-client'
import { AuthGuard } from './components/auth-guard'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import SecurityPage from './pages/SecurityPage'
import './App.css'

function App() {
  const { data: session } = authClient.useSession()

  return (
    <Routes>
      <Route 
        path="/login" 
        element={session ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      
      {/* Protected Routes */}
      <Route element={<AuthGuard />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Route>

      <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
    </Routes>
  )
}

export default App
