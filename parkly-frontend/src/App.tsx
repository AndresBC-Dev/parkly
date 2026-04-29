import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import MapPage from "./pages/MapPage.tsx";
import Operations from "./pages/Operations.tsx";
import Customers from "./pages/Customers.tsx";
import Login from "./pages/Login.tsx";
import Rates from "./pages/Rates.tsx";
import Settings from "./pages/Settings.tsx";
import NotFound from "./pages/NotFound.tsx";
import { useParkingStore } from "@/lib/parking-store";
import { Navigate } from "react-router-dom";
import api from "@/lib/api";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const user = useParkingStore((s) => s.user);
  const token = localStorage.getItem("parkly_token");
  
  if (!user && !token) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  const login = useParkingStore((s) => s.login);
  const fetchCustomers = useParkingStore((s) => s.fetchCustomers);
  const fetchSlots = useParkingStore((s) => s.fetchSlots);
  const fetchMovements = useParkingStore((s) => s.fetchMovements);
  const fetchRates = useParkingStore((s) => s.fetchRates);

  useEffect(() => {
    const token = localStorage.getItem("parkly_token");
    if (token) {
      api.get("/auth/me")
        .then((res) => {
          login(token, res.data);
          fetchCustomers();
          fetchSlots();
          fetchMovements();
          fetchRates();
        })
        .catch(() => {
          localStorage.removeItem("parkly_token");
        });
    }
  }, [login]);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            }
          />
          <Route
            path="/map"
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/operations"
            element={
              <ProtectedRoute>
                <Operations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rates"
            element={
              <ProtectedRoute>
                <Rates />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customers"
            element={
              <ProtectedRoute>
                <Customers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
