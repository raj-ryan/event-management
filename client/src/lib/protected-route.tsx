import { Route, useLocation, useRoute } from "wouter";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

/**
 * A route that requires authentication to access.
 * If user is not authenticated, redirects to login.
 * Also checks for the proper role if specified.
 */
export function ProtectedRoute({
  path,
  component: Component,
  requiredRole,
}: {
  path: string;
  component: () => React.JSX.Element;
  requiredRole?: "user" | "admin";
}) {
  const [_, navigate] = useLocation();
  const [match, params] = useRoute(path);
  
  useEffect(() => {
    if (match) {
      // Get stored role from session storage
      const userRole = sessionStorage.getItem('userRole');
      
      // If role is required and doesn't match, redirect to appropriate dashboard
      if (requiredRole && userRole && requiredRole !== userRole) {
        // Redirect to the appropriate dashboard
        const redirectPath = userRole === 'admin' ? '/dashboard?role=admin' : '/dashboard?role=user';
        navigate(redirectPath);
      }
    }
  }, [match, params, requiredRole, navigate]);

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}