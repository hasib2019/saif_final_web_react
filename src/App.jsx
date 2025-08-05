import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Products from './pages/Products';
import News from './pages/News';
import Contact from './pages/Contact';

// Admin Components
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import AdminHeroSlides from './pages/admin/HeroSlides';
import AdminNews from './pages/admin/News';
import AdminAbout from './pages/admin/About';
import AdminCategories from './pages/admin/Categories';
import AdminMedia from './pages/admin/Media';
import AdminPartners from './pages/admin/Partners';
import AdminContact from './pages/admin/Contact';
import AdminUsers from './pages/admin/Users';
import AdminLanguages from './pages/admin/Languages';
import AdminSettings from './pages/admin/Settings';
import AdminHeroSlideForm from './pages/admin/HeroSlideForm';

function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminDashboard />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={
                  <ProtectedRoute requiredPermission="manage-products">
                    <AdminProducts />
                  </ProtectedRoute>
                } />
                <Route path="categories" element={
                  <ProtectedRoute requiredPermission="manage-categories">
                    <AdminCategories />
                  </ProtectedRoute>
                } />
                <Route path="news" element={
                  <ProtectedRoute requiredPermission="manage-press-releases">
                    <AdminNews />
                  </ProtectedRoute>
                } />
                <Route path="about" element={
                  <ProtectedRoute requiredPermission="manage-company-info">
                    <AdminAbout />
                  </ProtectedRoute>
                } />
                <Route path="partners" element={
                  <ProtectedRoute requiredPermission="manage-partners">
                    <AdminPartners />
                  </ProtectedRoute>
                } />
                <Route path="contact" element={
                  <ProtectedRoute requiredPermission="view-form-submissions">
                    <AdminContact />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute requiredPermission="manage-users">
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="languages" element={
                  <ProtectedRoute requiredPermission="manage-languages">
                    <AdminLanguages />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Public Website Routes */}
              <Route path="/*" element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/contact" element={<Contact />} />
                  </Routes>
                </Layout>
              } />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4ade80',
                    secondary: '#000',
                  },
                },
                error: {
                  duration: 4000,
                  theme: {
                    primary: '#ef4444',
                    secondary: '#000',
                  },
                },
              }}
            />
          </div>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
