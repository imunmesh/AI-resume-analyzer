import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineMoon,
  HiOutlineSun,
  HiOutlineLogout,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineViewGrid,
  HiOutlineChartBar,
} from 'react-icons/hi';

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('theme');
    return stored ? stored === 'dark' : true;
  });
  const [scrolled, setScrolled] = useState(false);
  const profileRef = useRef(null);

  // Theme toggle
  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = user
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid },
        { to: '/history', label: 'History', icon: HiOutlineChartBar },
      ]
    : [];

  const isActive = (path) => location.pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'glass-strong shadow-lg py-2'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center shadow-lg shadow-primary-500/25 group-hover:shadow-primary-500/40 transition-shadow">
              <span className="text-white font-display font-bold text-lg">R</span>
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <span className="font-display font-bold text-xl text-dark-900 dark:text-white">
              Resume<span className="gradient-text">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive(to)
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}

            {isAdmin && (
              <Link
                to="/admin"
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/admin')
                    ? 'bg-accent-amber/10 text-accent-amber'
                    : 'text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800'
                }`}
              >
                <HiOutlineShieldCheck className="h-4 w-4" />
                Admin
              </Link>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setDark(!dark)}
              className="p-2 rounded-xl text-dark-500 dark:text-dark-400 hover:bg-dark-100 dark:hover:bg-dark-800 transition-all duration-200"
              title={dark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {dark ? (
                <HiOutlineSun className="h-5 w-5 text-amber-400" />
              ) : (
                <HiOutlineMoon className="h-5 w-5" />
              )}
            </button>

            {/* User menu */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-dark-100 dark:hover:bg-dark-800 transition-all duration-200"
                >
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-violet flex items-center justify-center text-white font-semibold text-sm shadow-md">
                    {(user.displayName || user.email)?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-dark-700 dark:text-dark-200 max-w-[120px] truncate">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </button>

                {/* Dropdown */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 glass-strong rounded-2xl py-2 animate-slide-down">
                    <div className="px-4 py-3 border-b border-dark-200/50 dark:border-dark-700/50">
                      <p className="text-sm font-semibold text-dark-900 dark:text-white truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-dark-500 dark:text-dark-400 truncate">
                        {user.email}
                      </p>
                      {isAdmin && (
                        <span className="mt-1 inline-block badge-primary text-[10px]">
                          Admin
                        </span>
                      )}
                    </div>
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                      >
                        <HiOutlineViewGrid className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <Link
                        to="/history"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-dark-700 dark:text-dark-200 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
                      >
                        <HiOutlineChartBar className="h-4 w-4" />
                        History
                      </Link>
                    </div>
                    <div className="border-t border-dark-200/50 dark:border-dark-700/50 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <HiOutlineLogout className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link to="/login" className="btn-ghost text-sm">
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary text-sm !px-5 !py-2">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-dark-600 dark:text-dark-300 hover:bg-dark-100 dark:hover:bg-dark-800 transition-colors"
            >
              {mobileOpen ? (
                <HiOutlineX className="h-6 w-6" />
              ) : (
                <HiOutlineMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden glass-strong border-t border-dark-200/50 dark:border-dark-700/50 animate-slide-down">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive(to)
                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                    : 'text-dark-600 dark:text-dark-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-600 dark:text-dark-300"
              >
                <HiOutlineShieldCheck className="h-5 w-5" />
                Admin Panel
              </Link>
            )}
            {!user && (
              <div className="flex flex-col gap-2 pt-3 border-t border-dark-200/50 dark:border-dark-700/50">
                <Link to="/login" className="btn-secondary text-center text-sm">
                  Log In
                </Link>
                <Link to="/signup" className="btn-primary text-center text-sm">
                  Get Started
                </Link>
              </div>
            )}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-600 dark:text-red-400"
              >
                <HiOutlineLogout className="h-5 w-5" />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
