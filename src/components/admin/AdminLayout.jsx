import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  FileText,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Globe,
  Image,
  Building,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const { user, logout, hasRole, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Define all navigation items with correct permission names (matching database)
  const allNavigationItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard }, // No permission required for dashboard
    { name: 'Account Creation', href: '/admin/users/create', icon: Users, permission: 'manage-users' },
    { name: 'Hero Slides', href: '/admin/hero-slides', icon: FileText, permission: 'manage-content' },
    { name: 'News & Press', href: '/admin/news', icon: FileText, permission: 'manage-press-releases' },
    { name: 'About Content', href: '/admin/about', icon: FileText, permission: 'manage-company-info' },
    { name: 'Products', href: '/admin/products', icon: Package, permission: 'manage-products' },
    { name: 'Categories', href: '/admin/categories', icon: Package, permission: 'manage-categories' },
    { name: 'Media', href: '/admin/media', icon: Image, permission: 'manage-media' },
    { name: 'Partners', href: '/admin/partners', icon: Building, permission: 'manage-partners' },
    { name: 'Contact', href: '/admin/contact', icon: MessageSquare, permission: 'view-form-submissions' },
    { name: 'Contact Info', href: '/admin/contact-info', icon: MessageSquare, permission: 'manage-settings' },
    { name: 'Users', href: '/admin/users', icon: Users, permission: 'manage-users' },
    { name: 'Languages', href: '/admin/languages', icon: Globe, permission: 'manage-languages' },
    { name: 'Settings', href: '/admin/settings', icon: Settings, permission: 'manage-settings' },
  ];

  // Filter navigation based on user permissions
  const getFilteredNavigation = () => {
    // If user is not loaded yet, return empty array
    if (!user) return [];

    // Check if user has admin role (show all navigation)
    const isAdmin = user.roles?.some(role => 
      role.name === 'admin' || role.name === 'super_admin' || role.name === 'super-admin'
    );

    if (isAdmin) {
      return allNavigationItems;
    }

    // Filter based on permissions for non-admin users
    return allNavigationItems.filter(item => {
      if (item.children) {
        // Filter children based on permissions
        const filteredChildren = item.children.filter(child => 
          hasPermission(child.permission)
        );
        
        // Show parent if it has visible children or user has parent permission
        if (filteredChildren.length > 0 || hasPermission(item.permission)) {
          return { ...item, children: filteredChildren };
        }
        return false;
      }
      
      return hasPermission(item.permission);
    });
  };

  const navigation = getFilteredNavigation();


  const isActive = (href) => {
    return location.pathname === href;
  };

  const isParentActive = (children) => {
    return children?.some(child => location.pathname === child.href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '':'pointer-events-none'}`}>
        <div
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition ease-in-out duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="absolute top-0 right-0 pt-2 -mr-12">
            <button
              type="button"
              className="flex justify-center items-center ml-1 w-10 h-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <SidebarContent
            navigation={navigation}
            isActive={isActive}
            isParentActive={isParentActive}
            expandedMenus={expandedMenus}
            toggleMenu={toggleMenu}
            user={user}
            handleLogout={handleLogout}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent
          navigation={navigation}
          isActive={isActive}
          isParentActive={isParentActive}
          expandedMenus={expandedMenus}
          toggleMenu={toggleMenu}
          user={user}
          handleLogout={handleLogout}
        />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 md:pl-64">
        <div className="sticky top-0 z-10 pt-1 pl-1 bg-gray-50 md:hidden sm:pl-3 sm:pt-3">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        <main className="flex-1">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({ navigation, isActive, isParentActive, expandedMenus, toggleMenu, user, handleLogout }) => {
  return (
    <div className="flex flex-col flex-1 min-h-0 bg-white shadow">
      <div className="flex overflow-y-auto flex-col flex-1 pt-5 pb-4">
        <div className="flex flex-shrink-0 items-center px-4">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="flex-1 px-2 mt-5 space-y-1">
          {navigation.map((item) => {
            if (item.children) {
              const isExpanded = expandedMenus[item.name];
              const hasActiveChild = isParentActive(item.children);
              
              return (
                <div key={item.name}>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`${
                      hasActiveChild
                        ? 'bg-primary-100 text-primary-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    } group w-full flex items-center pl-2 pr-1 py-2 text-left text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  >
                    <item.icon
                      className={`${
                        hasActiveChild ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                      } mr-3 flex-shrink-0 h-6 w-6`}
                    />
                    <span className="flex-1">{item.name}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href}
                          className={`${
                            isActive(child.href)
                              ? 'bg-primary-100 text-primary-900'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          } group w-full flex items-center pl-11 pr-2 py-2 text-sm font-medium rounded-md`}
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`${
                  isActive(item.href)
                    ? 'bg-primary-100 text-primary-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md`}
              >
                <item.icon
                  className={`${
                    isActive(item.href) ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
        <div className="flex items-center w-full">
          <div className="flex-shrink-0">
            <div className="flex justify-center items-center w-8 h-8 rounded-full bg-primary-600">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
          </div>
          <div className="flex-1 ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex-shrink-0 p-1 ml-3 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;