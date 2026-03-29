import { useState, useCallback } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "@/context/AppContext";
import AppLoader from "@/components/AppLoader";
import AuthModal from "@/components/AuthModal";
import Header from "@/components/Header";
import AdminOrderNotifier from "@/components/AdminOrderNotifier";
import AppErrorBoundary from "@/components/AppErrorBoundary";
import Index from "./pages/Index";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import FavoritesPage from "./pages/FavoritesPage";
import AdminPage from "./pages/AdminPage";
import UserProfilePage from "./pages/UserProfilePage";
import FreeReadyPage from "./pages/FreeReadyPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    {children}
  </>
);

const App = () => {
  const [loaded, setLoaded] = useState(false);
  const handleLoaded = useCallback(() => setLoaded(true), []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProvider>
          {!loaded && <AppLoader onComplete={handleLoaded} />}
          <Toaster />
          <Sonner />
          <AuthModal />
          <AppErrorBoundary fallback={null}>
            <AdminOrderNotifier />
          </AppErrorBoundary>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<AppLayout><Index /></AppLayout>} />
              <Route path="/cart" element={<AppLayout><CartPage /></AppLayout>} />
              <Route path="/orders" element={<AppLayout><OrdersPage /></AppLayout>} />
              <Route path="/tracking" element={<AppLayout><OrdersPage /></AppLayout>} />
              <Route path="/profile" element={<AppLayout><UserProfilePage /></AppLayout>} />
              <Route path="/favorites" element={<AppLayout><FavoritesPage /></AppLayout>} />
              <Route path="/free-ready" element={<AppLayout><FreeReadyPage /></AppLayout>} />
              <Route path="/admin" element={<AppLayout><AdminPage /></AppLayout>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
