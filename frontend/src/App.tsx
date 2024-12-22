import './App.css'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { SignUpForm } from './components/signUp'
import { SignInForm } from './components/signIn'
import { Dashboard } from './components/dashboard'
import Project from './components/project'
import { Toaster } from './components/ui/toaster'
import ProfilePage from './components/profilePage'
import { ProjectProvider } from './context/ProjectContext'

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/signup" element={!user ? <SignUpForm /> : <Navigate to="/profile" />} />
      <Route path="/signin" element={!user ? <SignInForm /> : <Navigate to="/profile" />} />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/signin" />} />
      <Route path="/project" element={user ? <Project /> : <Navigate to="/signin" />} />
      <Route path='/profile' element={user ? <ProfilePage /> : <Navigate to="/signin" />} />
    </Routes>
  )
}

function App() {

  return (
    <AuthProvider>
      <SocketProvider>
        <ProjectProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster />
          </BrowserRouter>
        </ProjectProvider>
      </SocketProvider>
    </AuthProvider>
  )
}

export default App
