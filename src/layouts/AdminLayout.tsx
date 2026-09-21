import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileCheck2,
  PlusCircle,
  Users2,
  UserCheck,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Bell,
  Search,
  ExternalLink,
  Shield,
  Layers,
} from 'lucide-react';
import { Badge, Dropdown, Button } from '../components/ui';
import { DEMO_USERS } from '../constants';
import { UserRole } from '../types';

export const AdminLayout: React.FC = () => {
  const { user, logout, loginAsDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Assessments', path: '/assessments', icon: <FileCheck2 className="w-5 h-5" /> },
    { label: 'Create Test', path: '/assessments/create', icon: <PlusCircle className="w-5 h-5" /> },
    { label: 'Participants', path: '/participants', icon: <Users2 className="w-5 h-5" /> },
    { label: 'Profile', path: '/profile', icon: <UserCheck className="w-5 h-5" /> },
    { label: 'Settings', path: '/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleDemoSwitch = async (role: UserRole) => {
    await loginAsDemo(role);
  };

  // Determine breadcrumb label
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard Overview';
    if (path === '/assessments') return 'Assessment Directory';
    if (path === '/assessments/create') return 'New Assessment Wizard';
    if (path.includes('/questions')) return 'Question Manager';
    if (path.includes('/results')) return 'Candidate Results';
    if (path.includes('/analytics')) return 'Performance Analytics';
    if (path.includes('/edit')) return 'Edit Assessment';
    if (path.includes('/settings')) return 'Assessment Settings';
    if (path.startsWith('/assessments/')) return 'Assessment Overview';
    if (path === '/participants') return 'Participant Records';
    if (path === '/profile') return 'My Profile';
    if (path === '/settings') return 'Global Settings';
    return 'Portal';
  };

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 shrink-0">
        {/* Brand */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <Sparkles className="w-4 h-4 fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base text-slate-900 tracking-tight leading-none">
              Assess<span className="text-indigo-600">Pulse</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
              Workspace
            </span>
          </div>
        </div>

        {/* Navigation */}
        <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Management
            </div>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`
                }
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>

          {/* Quick Demo Switcher Widget */}
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-700">Quick Role Switch</span>
                <Shield className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('ADMIN')}
                  className={`px-2 py-1 rounded text-left font-medium transition-colors ${
                    user?.role === 'ADMIN' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoSwitch('TEST_CREATOR')}
                  className={`px-2 py-1 rounded text-left font-medium transition-colors ${
                    user?.role === 'TEST_CREATOR' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Creator
                </button>
              </div>
            </div>

            {/* Public Link */}
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <span>View Public Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=4f46e5&color=fff`}
              alt={user?.name || 'User'}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-white"
            />
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-xs text-slate-900 truncate leading-tight">{user?.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{user?.role || 'ADMIN'}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-10 animate-slide-right">
            <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-base text-slate-900">AssessPulse</span>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-indigo-50 text-indigo-600 font-semibold' : 'text-slate-600 hover:bg-slate-100'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                  alt=""
                  className="w-8 h-8 rounded-full"
                />
                <div className="min-w-0 truncate text-xs font-semibold text-slate-800">{user?.name}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => logout()}>
                <LogOut className="w-4 h-4 text-rose-500" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top Header */}
        <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <span className="hidden sm:inline font-medium text-slate-400">Portal</span>
              <ChevronRight className="hidden sm:inline w-3.5 h-3.5 text-slate-300" />
              <span className="font-semibold text-slate-800">{getBreadcrumb()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="primary" dot size="sm" className="hidden sm:inline-flex">
              {user?.role || 'ADMIN'}
            </Badge>

            {/* Quick Demo Switcher Dropdown */}
            <Dropdown
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700"
                >
                  <img
                    src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`}
                    alt=""
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="hidden sm:inline font-semibold">{user?.name?.split(' ')[0]}</span>
                </button>
              }
              items={[
                {
                  id: 'profile',
                  label: 'View Profile',
                  icon: <UserCheck className="w-4 h-4" />,
                  onClick: () => navigate('/profile'),
                },
                {
                  id: 'settings',
                  label: 'Platform Settings',
                  icon: <Settings className="w-4 h-4" />,
                  onClick: () => navigate('/settings'),
                },
                {
                  id: 'demo-admin',
                  label: 'Switch to Admin (Sarah)',
                  onClick: () => handleDemoSwitch('ADMIN'),
                },
                {
                  id: 'demo-creator',
                  label: 'Switch to Creator (Alex)',
                  onClick: () => handleDemoSwitch('TEST_CREATOR'),
                },
                {
                  id: 'logout',
                  label: 'Sign Out',
                  icon: <LogOut className="w-4 h-4 text-rose-500" />,
                  danger: true,
                  divider: true,
                  onClick: () => logout(),
                },
              ]}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around z-40 lg:hidden shadow-lg">
        {navItems.slice(0, 5).map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-1 rounded-lg text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
