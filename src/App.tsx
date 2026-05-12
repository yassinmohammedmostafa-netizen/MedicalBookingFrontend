import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth";
import { LanguageProvider } from "@/lib/language";
import { ProtectedRoute } from "@/components/protected-route";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import VerifyEmail from "@/pages/verify-email";
import DoctorsList from "@/pages/doctors/index";
import DoctorProfile from "@/pages/doctors/[id]";
import Appointments from "@/pages/appointments";
import ProfilePage from "@/pages/profile";
import DoctorDashboard from "@/pages/doctor/dashboard";
import DoctorStatus from "@/pages/doctor/status";
import DoctorAppointments from "@/pages/doctor/appointments";
import DoctorSlots from "@/pages/doctor/slots";
import DoctorCalendar from "@/pages/doctor/calendar";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminAppointments from "@/pages/admin/appointments";
import AdminDoctors from "@/pages/admin/doctors";
import AdminUsers from "@/pages/admin/users";
import AdminCalendar from "@/pages/admin/calendar";
import AdminReviews from "@/pages/admin/reviews";

const handle401 = (error: any) => {
  if (error?.status === 401) {
    const isLoginPage = window.location.pathname === "/login";
    if (!isLoginPage && localStorage.getItem('relax_token')) {
      localStorage.removeItem('relax_token');
      window.location.href = "/login?session=expired";
    }
  }
};

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handle401,
  }),
  mutationCache: new MutationCache({
    onError: handle401,
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: (failureCount, error: any) => {
        if (error?.status === 401) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
  }
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/verify-email" component={VerifyEmail} />
      
      <Route path="/doctors" component={DoctorsList} />
      <Route path="/doctors/:id" component={DoctorProfile} />
      
      <Route path="/appointments">
        <ProtectedRoute allowedRoles={["patient"]}>
          <Appointments />
        </ProtectedRoute>
      </Route>

      <Route path="/profile">
        <ProtectedRoute allowedRoles={["patient"]}>
          <ProfilePage />
        </ProtectedRoute>
      </Route>

      <Route path="/doctor/profile">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <ProfilePage />
        </ProtectedRoute>
      </Route>

      <Route path="/doctor/status">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorStatus />
        </ProtectedRoute>
      </Route>

      <Route path="/doctor/dashboard">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/appointments">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorAppointments />
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/slots">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorSlots />
        </ProtectedRoute>
      </Route>
      <Route path="/doctor/calendar">
        <ProtectedRoute allowedRoles={["doctor"]}>
          <DoctorCalendar />
        </ProtectedRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/appointments">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminAppointments />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/doctors">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminDoctors />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminUsers />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/calendar">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminCalendar />
        </ProtectedRoute>
      </Route>
      <Route path="/admin/reviews">
        <ProtectedRoute allowedRoles={["admin"]}>
          <AdminReviews />
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
