import { Route } from "wouter";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * A route that requires authentication to access.
 * If user is not authenticated, displays a login page or redirects to login.
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Simple check for admin or mock user authentication via session storage
  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      const mockUserAuth = sessionStorage.getItem('mockUserAuthenticated');
      
      // Using simple session-based auth for now
      const authenticated = (adminAuth === 'true' || mockUserAuth === 'true');
      
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      // If not authenticated, redirect to auth page
      if (!authenticated) {
        // Only redirect if we're not already on the auth page
        if (!window.location.pathname.includes('/auth')) {
          window.location.href = '/auth';
        }
      }
    };
    
    checkAuth();
  }, []);

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        if (!isAuthenticated) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Redirecting to login...</p>
            </div>
          );
        }
        
        return <Component />;
      }}
    </Route>
  );
}