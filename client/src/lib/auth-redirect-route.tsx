import { Route } from "wouter";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

/**
 * A route that redirects to dashboard if already authenticated.
 * For use with login and registration pages.
 */
export function AuthRedirectRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [redirected, setRedirected] = useState<boolean>(false);
  
  // Simple check for admin or mock user authentication via session storage
  useEffect(() => {
    const checkAuth = () => {
      const adminAuth = sessionStorage.getItem('adminAuthenticated');
      const mockUserAuth = sessionStorage.getItem('mockUserAuthenticated');
      
      // Using simple session-based auth for now
      const authenticated = (adminAuth === 'true' || mockUserAuth === 'true');
      
      setIsAuthenticated(authenticated);
      setIsLoading(false);
      
      // If authenticated, redirect to dashboard
      if (authenticated && !redirected) {
        // Only redirect if we're currently on the auth page
        if (window.location.pathname.includes('/auth')) {
          setRedirected(true);
          window.location.href = '/dashboard';
        }
      }
    };
    
    checkAuth();
  }, [redirected]);

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
        
        if (isAuthenticated) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2">Redirecting to dashboard...</p>
            </div>
          );
        }
        
        return <Component />;
      }}
    </Route>
  );
}