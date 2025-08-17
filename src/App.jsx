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
import AdminContactInfo from './pages/admin/ContactInfo';
import AdminHeroSlideForm from './pages/admin/HeroSlideForm';
import CategoryForm from './pages/admin/CategoryForm';
import ProductForm from './pages/admin/ProductForm';
import UserForm from './pages/admin/UserForm';
import NewsForm from './pages/admin/NewsForm';
import ContactSettings from './pages/admin/ContactSettings';

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
                <Route path="products/create" element={
                  <ProtectedRoute requiredPermission="manage-products">
                    <ProductForm />
                  </ProtectedRoute>
                } />
                <Route path="products/:id/edit" element={
                  <ProtectedRoute requiredPermission="manage-products">
                    <ProductForm />
                  </ProtectedRoute>
                } />
                <Route path="products/:id" element={
                  <ProtectedRoute requiredPermission="manage-products">
                    <ProductForm readOnly={true} />
                  </ProtectedRoute>
                } />
                <Route path="categories" element={
                  <ProtectedRoute requiredPermission="manage-categories">
                    <AdminCategories />
                  </ProtectedRoute>
                } />
                <Route path="categories/create" element={
                  <ProtectedRoute requiredPermission="manage-categories">
                    <CategoryForm />
                  </ProtectedRoute>
                } />
                <Route path="categories/:id/edit" element={
                  <ProtectedRoute requiredPermission="manage-categories">
                    <CategoryForm />
                  </ProtectedRoute>
                } />
                <Route path="categories/:id" element={
                  <ProtectedRoute requiredPermission="manage-categories">
                    <CategoryForm readOnly={true} />
                  </ProtectedRoute>
                } />
                <Route path="news" element={
                  <ProtectedRoute requiredPermission="manage-press-releases">
                    <AdminNews />
                  </ProtectedRoute>
                } />
                <Route path="news/create" element={
                  <ProtectedRoute requiredPermission="manage-press-releases">
                    <NewsForm />
                  </ProtectedRoute>
                } />
                <Route path="news/:id/edit" element={
                  <ProtectedRoute requiredPermission="manage-press-releases">
                    <NewsForm />
                  </ProtectedRoute>
                } />
                <Route path="news/:id" element={
                  <ProtectedRoute requiredPermission="manage-press-releases">
                    <NewsForm readOnly={true} />
                  </ProtectedRoute>
                } />
                <Route path="about" element={
                  <ProtectedRoute requiredPermission="manage-company-info">
                    <AdminAbout />
                  </ProtectedRoute>
                } />
                <Route path="hero-slides" element={
                  <ProtectedRoute requiredPermission="manage-content">
                    <AdminHeroSlides />
                  </ProtectedRoute>
                } />
                <Route path="hero-slides/create" element={
                  <ProtectedRoute requiredPermission="manage-content">
                    <AdminHeroSlideForm />
                  </ProtectedRoute>
                } />
                <Route path="hero-slides/:id/edit" element={
                  <ProtectedRoute requiredPermission="manage-content">
                    <AdminHeroSlideForm />
                  </ProtectedRoute>
                } />
                <Route path="hero-slides/:id" element={
                  <ProtectedRoute requiredPermission="manage-content">
                    <AdminHeroSlideForm readOnly={true} />
                  </ProtectedRoute>
                } />
                <Route path="partners" element={
                  <ProtectedRoute requiredPermission="manage-partners">
                    <AdminPartners />
                  </ProtectedRoute>
                } />
                <Route path="partners/create" element={
                  <ProtectedRoute requiredPermission="manage-partners">
                    <AdminPartners isCreating={true} />
                  </ProtectedRoute>
                } />
                <Route path="partners/:id/edit" element={
                  <ProtectedRoute requiredPermission="manage-partners">
                    <AdminPartners isEditing={true} />
                  </ProtectedRoute>
                } />
                <Route path="partners/:id" element={
                  <ProtectedRoute requiredPermission="manage-partners">
                    <AdminPartners readOnly={true} />
                  </ProtectedRoute>
                } />
                <Route path="contact" element={
                  <ProtectedRoute requiredPermission="view-form-submissions">
                    <AdminContact />
                  </ProtectedRoute>
                } />
                <Route path="contact/settings" element={
                  <ProtectedRoute requiredPermission="manage-settings">
                    <ContactSettings />
                  </ProtectedRoute>
                } />
                <Route path="users" element={
                  <ProtectedRoute requiredPermission="manage-users">
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                <Route path="users/create" element={
                  <ProtectedRoute requiredPermission="manage-users">
                    <UserForm />
                  </ProtectedRoute>
                } />
                <Route path="users/:id/edit" element={
                  <ProtectedRoute requiredPermission="manage-users">
                    <UserForm />
                  </ProtectedRoute>
                } />
                <Route path="users/:id" element={
                  <ProtectedRoute requiredPermission="manage-users">
                    <UserForm readOnly={true} />
                  </ProtectedRoute>
                } />
                <Route path="account-create" element={
                  <ProtectedRoute requiredPermission="manage-users">
                    <UserForm />
                  </ProtectedRoute>
                } />
                <Route path="languages" element={
                  <ProtectedRoute requiredPermission="manage-languages">
                    <AdminLanguages />
                  </ProtectedRoute>
                } />
                <Route path="media" element={
                  <ProtectedRoute requiredPermission="manage-media">
                    <AdminMedia />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute requiredPermission="manage-settings">
                    <AdminSettings />
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
