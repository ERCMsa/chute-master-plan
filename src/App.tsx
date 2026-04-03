import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import StockPage from "@/pages/StockPage";
import DemandListPage from "@/pages/DemandListPage";
import SupplyListPage from "@/pages/SupplyListPage";
import ValidationPage from "@/pages/ValidationPage";
import SettingsPage from "@/pages/SettingsPage";
import AuditLogPage from "@/pages/AuditLogPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center industrial-gradient">
        <div className="text-secondary-foreground text-lg">Loading...</div>
      </div>
    );
  }

  if (!session) return <LoginPage />;

  const role = profile?.role;

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/stock" element={<StockPage />} />
        {(role === 'engineer' || role === 'stock_manager') && (
          <Route path="/demands" element={<DemandListPage />} />
        )}
        {(role === 'magazinier' || role === 'stock_manager') && (
          <Route path="/supplies" element={<SupplyListPage />} />
        )}
        {role === 'stock_manager' && (
          <>
            <Route path="/validation" element={<ValidationPage />} />
            <Route path="/audit" element={<AuditLogPage />} />
          </>
        )}
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
