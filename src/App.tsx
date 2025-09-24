import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import CBTExam from "./pages/CBTExam";
import Demo from "./pages/Demo";
import Pricing from "./pages/Pricing";
import Resources from "./pages/Resources";
import Consultation from "./pages/Consultation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/auth" element={<Layout showNavbar={false}><Auth /></Layout>} />
            <Route path="/login" element={<Layout showNavbar={false}><Login /></Layout>} />
            <Route path="/signup" element={<Layout showNavbar={false}><Signup /></Layout>} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Layout showNavbar={false}><AdminDashboard /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/practice" element={
              <ProtectedRoute>
                <Layout showNavbar={false}><CBTExam /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/exam" element={
              <ProtectedRoute>
                <Layout showNavbar={false}><CBTExam /></Layout>
              </ProtectedRoute>
            } />
            <Route path="/demo" element={<Layout><Demo /></Layout>} />
            <Route path="/pricing" element={<Layout><Pricing /></Layout>} />
            <Route path="/resources" element={<Layout><Resources /></Layout>} />
            <Route path="/consultation" element={<Layout><Consultation /></Layout>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
