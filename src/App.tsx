
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ResumeManager from "./pages/student/ResumeManager";
import Opportunities from "./pages/Opportunities";
import Notifications from "./pages/Notifications";
import Reminders from "./pages/Reminders";
import ChatInterface from "./pages/ChatInterface";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Create a new QueryClient instance
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<StudentDashboard />} />
              <Route path="admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="resume" element={<ResumeManager />} />
              <Route path="opportunities" element={<Opportunities />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="reminders" element={<Reminders />} />
              <Route path="chat" element={<ChatInterface />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* Redirect /admin/dashboard to /dashboard/admin for consistency */}
            <Route path="/admin/dashboard" element={<Navigate to="/dashboard/admin" replace />} />
            <Route path="/student/dashboard" element={<Navigate to="/dashboard" replace />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
