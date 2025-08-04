import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Horses from './pages/Horses'
import Lessons from './pages/Lessons'
import Events from './pages/Events'
import Equipment from './pages/Equipment'
import Payments from './pages/Payments'
import Users from './pages/Users'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/horses" element={<Horses />} />
        <Route path="/lessons" element={<Lessons />} />
        <Route path="/events" element={<Events />} />
        <Route path="/equipment" element={<Equipment />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/users" element={<Users />} />
      </Route>
    </Routes>
  )
}

export default App