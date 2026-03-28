import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/fuelops/ProtectedRoute";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Avionics from "./pages/Avionics.tsx";
import Events from "./pages/Events.tsx";
import Employment from "./pages/Employment.tsx";
import Contact from "./pages/Contact.tsx";
import NotFound from "./pages/NotFound.tsx";
import FuelOpsLogin from "./pages/FuelOpsLogin.tsx";
import Dashboard from "./pages/fuelops/Dashboard.tsx";
import FuelLog from "./pages/fuelops/FuelLog.tsx";
import Customers from "./pages/fuelops/Customers.tsx";
import Billing from "./pages/fuelops/Billing.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/avionics" element={<Avionics />} />
            <Route path="/events" element={<Events />} />
            <Route path="/employment" element={<Employment />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/fuelops/login" element={<FuelOpsLogin />} />
            <Route path="/fuelops" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/fuelops/log" element={<ProtectedRoute><FuelLog /></ProtectedRoute>} />
            <Route path="/fuelops/customers" element={<ProtectedRoute><Customers /></ProtectedRoute>} />
            <Route path="/fuelops/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
