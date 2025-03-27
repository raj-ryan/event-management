import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  
  // Check if user is authenticated via session storage
  const [isMockUser, setIsMockUser] = useState<boolean>(false);
  
  useEffect(() => {
    // Check for both admin and mock user authentication
    const adminAuth = window.sessionStorage.getItem('adminAuthenticated');
    const mockUserAuth = window.sessionStorage.getItem('mockUserAuthenticated');
    
    setIsAdmin(adminAuth === 'true');
    setIsMockUser(mockUserAuth === 'true');
    
    console.log("Auth status:", { 
      isAdmin: adminAuth === 'true', 
      isMockUser: mockUserAuth === 'true',
      firebaseUser: !!user 
    });
  }, [user]);

  // Check URL for admin role parameter
  useEffect(() => {
    if (path.includes("?role=admin") || window.location.search.includes("role=admin")) {
      setIsAdmin(true);
    }
  }, [path]);

  return (
    <Route path={path}>
      {() => {
        if (isLoading && !isAdmin) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }
        
        // Allow access if user is authenticated via Firebase OR is admin via session OR is mock user
        if (!user && !isAdmin && !isMockUser) {
          console.log("Not authenticated: redirecting to auth page");
          // Redirect to auth page if not logged in
          // Set a flag to prevent redirect loops
          sessionStorage.setItem('authRedirectInProgress', 'true');
          
          // Use direct navigation to avoid potential routing issues
          window.location.href = "/auth";
          
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
