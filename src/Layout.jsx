import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { LayoutGrid, Sparkles, LogOut, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  const navigation = [
    { name: 'Board', href: createPageUrl('KanbanBoard'), icon: LayoutGrid },
    { name: 'AI Assistant', href: createPageUrl('AIAssistant'), icon: Sparkles },
  ];

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-950/80 backdrop-blur-xl border-r border-purple-500/20 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <LayoutGrid className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">TaskFlow</h1>
              <p className="text-xs text-gray-400">Kanban Board</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || 
                           (item.href.includes('KanbanBoard') && currentPageName === 'KanbanBoard') ||
                           (item.href.includes('AIAssistant') && currentPageName === 'AIAssistant');
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white border border-purple-500/50 shadow-lg shadow-purple-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        {user && (
          <div className="p-4 border-t border-purple-500/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-all group">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-white font-medium text-sm truncate">
                      {user.full_name || 'User'}
                    </p>
                    <p className="text-gray-400 text-xs truncate">{user.email}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-56 bg-slate-900 border-purple-500/30"
                align="end"
                side="top"
              >
                <div className="px-2 py-2">
                  <p className="text-white font-medium text-sm">{user.full_name || 'User'}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                  {user.role && (
                    <p className="text-purple-400 text-xs mt-1 capitalize">{user.role}</p>
                  )}
                </div>
                <DropdownMenuSeparator className="bg-purple-500/20" />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 focus:text-red-300 focus:bg-red-500/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}