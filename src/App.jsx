import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Buses from './pages/Buses'
import RoutesPage from "./pages/RoutesPage";
import Bookings from './pages/Bookings'
import Hirings from './pages/Hirings'
import Users from './pages/Users'
import Notifications from './pages/Notifications'
import ProtectedRoute from './components/ProtectedRoute'
// import Register from './pages/Register'
// import ResetPassword from './pages/ResetPassword'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* <Route path="/register" element={<Register />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} /> */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/buses" element={<Buses />} />
                    <Route path="/routes" element={<RoutesPage />} />
                    <Route path="/bookings" element={<Bookings />} />
                    <Route path="/hirings" element={<Hirings />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/notifications" element={<Notifications />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App
