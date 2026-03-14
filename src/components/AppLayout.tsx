import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ercmLogo from '@/assets/ercm-logo.png';
import { ROLE_LABELS } from '@/types';
import {
  LayoutDashboard, Package, PlusCircle, FileText, BarChart3,
  LogOut, Menu, X, Settings, Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationBell from '@/components/NotificationBell';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, permission: 'dashboard' },
  { path: '/inventory', label: 'Inventory', icon: Package, permission: 'inventory' },
  { path: '/add-chute', label: 'Add Chute', icon: PlusCircle, permission: 'add_chute' },
  { path: '/requests', label: 'Requests', icon: FileText, permission: 'requests' },
  { path: '/archive', label: 'Archive', icon: Archive, permission: 'inventory' },
  { path: '/statistics', label: 'Statistics', icon: BarChart3, permission: 'statistics' },
  { path: '/settings', label: 'Settings', icon: Settings, permission: 'inventory' },
];

export default function AppLayout() {
  const { user, logout, hasPermission } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredNav = NAV_ITEMS.filter(item => hasPermission(item.permission));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="industrial-gradient h-16 flex items-center px-4 gap-4 no-print shrink-0 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-secondary-foreground">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <img src={ercmLogo} alt="ERCM SA" className="h-10 object-contain" />
        <div className="hidden sm:block ml-2">
          <h1 className="text-secondary-foreground font-bold text-lg leading-tight">ERCM SA</h1>
          <p className="text-industrial-steel text-xs">Steel Scrap Management</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <NotificationBell />
          <div className="text-right hidden sm:block">
            <p className="text-secondary-foreground text-sm font-medium">{user?.fullName}</p>
            <p className="text-industrial-steel text-xs">{user ? ROLE_LABELS[user.role] : ''}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} className="text-industrial-steel hover:text-secondary-foreground hover:bg-sidebar-accent">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={`
          fixed lg:static inset-y-16 left-0 z-40 w-64 industrial-gradient border-r border-sidebar-border
          transform transition-transform lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          no-print flex flex-col
        `}>
          <nav className="flex-1 py-4 space-y-1 px-3">
            {filteredNav.map(item => {
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 bg-foreground/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
