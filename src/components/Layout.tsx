import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, TrendingUp, Users, User, Menu } from 'lucide-react';

const Layout: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/invest', icon: TrendingUp, label: 'Invest' },
    { path: '/team', icon: Users, label: 'Team' },
    { path: '/me', icon: User, label: 'Me' },
  ];

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-16">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800">
        <div className="flex justify-around py-2">
          {navItems.map(({ path, icon: Icon, label }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center py-2 px-4 transition-colors ${
                  isActive ? 'text-yellow-500' : 'text-gray-400'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default Layout;