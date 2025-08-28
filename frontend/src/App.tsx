import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import CPRTraining from './pages/CPRTraining';
import EnhancedCPRTraining from './pages/EnhancedCPRTraining';
import HeimlichTraining from './pages/HeimlichTraining';
import Results from './pages/Results';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Guide from './pages/Guide';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import { AudioProvider } from './components/enhanced/AudioManager';

function App() {
  return (
    <AudioProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* 登录注册页面不显示Header */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* 管理后台页面 - 需要管理员权限 */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          } />
          
          {/* 其他页面显示Header */}
          <Route path="/*" element={
            <>
              <Header />
              <main className="container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/cpr" element={
                    <ProtectedRoute>
                      <CPRTraining />
                    </ProtectedRoute>
                  } />
                  <Route path="/cpr/enhanced" element={
                    <ProtectedRoute>
                      <EnhancedCPRTraining />
                    </ProtectedRoute>
                  } />
                  <Route path="/heimlich" element={
                    <ProtectedRoute>
                      <HeimlichTraining />
                    </ProtectedRoute>
                  } />
                  <Route path="/results" element={
                    <ProtectedRoute>
                      <Results />
                    </ProtectedRoute>
                  } />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/guide" element={
                    <ProtectedRoute>
                      <Guide />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
            </>
          } />
        </Routes>
        </div>
      </Router>
    </AudioProvider>
  );
}

export default App;