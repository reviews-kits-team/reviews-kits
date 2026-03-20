import { Routes, Route, Navigate } from 'react-router-dom'
import { authClient } from './lib/auth-client'
import { AuthGuard } from './components/auth-guard'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
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
      </Route>

      <Route path="*" element={<Navigate to={session ? "/" : "/login"} replace />} />
    </Routes>
  )
}

export default App
