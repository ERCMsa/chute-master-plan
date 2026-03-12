import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import AppLayout from "@/components/AppLayout";
import LoginPage from "@/pages/LoginPage";
import DashboardPage from "@/pages/DashboardPage";
import InventoryPage from "@/pages/InventoryPage";
import AddChutePage from "@/pages/AddChutePage";
import RequestsPage from "@/pages/RequestsPage";
import StatisticsPage from "@/pages/StatisticsPage";
import UsersPage from "@/pages/UsersPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoutes() {
  const { user, hasPermission } = useAuth();
  if (!user) return <LoginPage />;

  const defaultPath = hasPermission('dashboard') ? '/' : '/inventory';

  return (
    <Routes>
      <Route element={<AppLayout />}>
        {hasPermission('dashboard') && <Route path="/" element={<DashboardPage />} />}
        {hasPermission('inventory') && <Route path="/inventory" element={<InventoryPage />} />}
        {hasPermission('add_chute') && <Route path="/add-chute" element={<AddChutePage />} />}
        {hasPermission('requests') && <Route path="/requests" element={<RequestsPage />} />}
        {hasPermission('statistics') && <Route path="/statistics" element={<StatisticsPage />} />}
        {hasPermission('users') && <Route path="/users" element={<UsersPage />} />}
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
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
          <ProtectedRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
