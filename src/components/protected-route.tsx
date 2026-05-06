import { useAuth } from "@/lib/auth";
import { Redirect, useLocation } from "wouter";
import { Layout } from "./layout";

export function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
          <h1 className="text-4xl font-bold mb-4">403</h1>
          <p className="text-xl text-muted-foreground mb-8">Access Denied</p>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </Layout>
    );
  }

  // Redirect unapproved doctors to status page
  if (user.role === "doctor" && !user.isApproved) {
    const allowedUnapprovedPaths = ["/doctor/status"];
    if (!allowedUnapprovedPaths.includes(location)) {
      return <Redirect to="/doctor/status" />;
    }
  }

  // Redirect approved doctors away from the status page
  if (user.role === "doctor" && user.isApproved && location === "/doctor/status") {
    return <Redirect to="/doctor/dashboard" />;
  }

  return <>{children}</>;
}
