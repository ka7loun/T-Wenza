import React, { useState, useEffect } from 'react';
import { Menu, X, GraduationCap, UserCircle, Layout, Bell, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [userProfile, setUserProfile] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    const fetchUserData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();
        
        setUserProfile(profile);

        // Fetch notification count (pending connection requests)
        const { data: pendingRequests } = await supabase
          .from('user_connections')
          .select('id')
          .eq('user_id_2', session.user.id)
          .eq('status', 'pending');
        
        setNotifications(pendingRequests?.length || 0);
      }
    };

    fetchUserData();

    supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      if (session) fetchUserData();
      else {
        setUserProfile(null);
        setNotifications(0);
      }
    });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const publicLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Career', href: '/career' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ];

  const authLinks = [
    { 
      name: 'Dashboard', 
      href: '/dashboard',
      icon: Layout
    },
    { 
      name: 'Network', 
      href: '/network',
      icon: Users
    },
    { 
      name: 'Profile', 
      href: '/profile',
      icon: UserCircle
    },
  ];

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-lg' : 'bg-white/80 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-lg transform group-hover:scale-110 transition-all duration-300">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                T-Wenza
              </span>
            </Link>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {!isLoggedIn && publicLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-gray-700 hover:text-secondary font-medium transition-colors duration-300 ${
                    location.pathname === link.href ? 'text-secondary' : ''
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  {authLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={`text-gray-700 hover:text-secondary font-medium transition-colors duration-300 flex items-center space-x-1 ${
                          location.pathname === link.href ? 'text-secondary' : ''
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{link.name}</span>
                      </Link>
                    );
                  })}
                  <Link to="/notifications" className="relative">
                    <Bell className="w-5 h-5 text-gray-700 hover:text-secondary" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {notifications}
                      </span>
                    )}
                  </Link>
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="text-gray-700 hover:text-secondary font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link to="/auth" className="btn-primary">
                  Get Started
                </Link>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-secondary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!isLoggedIn && publicLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`block px-3 py-2 text-gray-700 hover:text-secondary font-medium transition-colors duration-300 ${
                  location.pathname === link.href ? 'text-secondary' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            {isLoggedIn ? (
              <>
                {authLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      to={link.href}
                      className={`block px-3 py-2 text-gray-700 hover:text-secondary font-medium transition-colors duration-300 flex items-center space-x-2 ${
                        location.pathname === link.href ? 'text-secondary' : ''
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.name}</span>
                    </Link>
                  );
                })}
                <Link
                  to="/notifications"
                  className="block px-3 py-2 text-gray-700 hover:text-secondary font-medium transition-colors duration-300 flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                  {notifications > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {notifications}
                    </span>
                  )}
                </Link>
                <button
                  onClick={() => {
                    supabase.auth.signOut();
                    setIsOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-gray-700 hover:text-secondary font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                to="/auth"
                className="w-full btn-primary mt-4 text-center block"
                onClick={() => setIsOpen(false)}
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;