import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ercmLogo from '@/assets/ercm-logo.png';
import {
  LayoutDashboard, Package, FileText, Truck, CheckSquare,
  LogOut, Menu, X, Settings, ScrollText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ROLE_LABELS: Record<string, string> = {
  engineer: 'Engineer',
  magazinier: 'Magazinier',
  stock_manager: 'Stock Manager',
};

interface NavItem {
  path: string;
  label: string;
  icon: any;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['engineer', 'magazinier', 'stock_manager'] },
  { path: '/stock', label: 'Stock', icon: Package, roles: ['engineer', 'magazinier', 'stock_manager'] },
  { path: '/demands', label: 'Demand Lists', icon: FileText, roles: ['engineer', 'stock_manager'] },
  { path: '/supplies', label: 'Supply Lists', icon: Truck, roles: ['magazinier', 'stock_manager'] },
  { path: '/validation', label: 'Validation', icon: CheckSquare, roles: ['stock_manager'] },
  { path: '/audit', label: 'Audit Log', icon: ScrollText, roles: ['stock_manager'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['engineer', 'magazinier', 'stock_manager'] },
];

export default function AppLayout() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = profile?.role || 'engineer';
  const filteredNav = NAV_ITEMS.filter(item => item.roles.includes(role));

  return (
    <div className="min-h-screen flex flex-col">
      <header className="industrial-gradient h-16 flex items-center px-4 gap-4 no-print shrink-0 z-50">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-secondary-foreground">
          {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
        <img src={ercmLogo} alt="ERCM SA" className="h-10 object-contain" />
        <div className="hidden sm:block ml-2">
          <h1 className="text-secondary-foreground font-bold text-lg leading-tight">ERCM SA</h1>
          <p className="text-industrial-steel text-xs">Chute Stock Management</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-secondary-foreground text-sm font-medium">{profile?.display_name}</p>
            <p className="text-industrial-steel text-xs">{ROLE_LABELS[role]}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={signOut} className="text-industrial-steel hover:text-secondary-foreground hover:bg-sidebar-accent">
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
