import { Route, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function AuthRedirectRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const { user, isLoading } = useAuth();
  const [_, navigate] = useLocation();

  // Check for admin or mock user authentication
  const [isAdminOrMockUser, setIsAdminOrMockUser] = useState<boolean>(false);
  
  useEffect(() => {
    const adminAuth = window.sessionStorage.getItem('adminAuthenticated');
    const mockUserAuth = window.sessionStorage.getItem('mockUserAuthenticated');
    
    setIsAdminOrMockUser(adminAuth === 'true' || mockUserAuth === 'true');
    
    console.log("Auth redirect check:", {
      user,
      isAdmin: adminAuth === 'true',
      isMockUser: mockUserAuth === 'true',
    });
    
  }, [user]);

  // Redirect to dashboard if user is logged in or admin/mock auth exists
  useEffect(() => {
    if ((user || isAdminOrMockUser) && !isLoading) {
      console.log("Redirecting to dashboard from auth page");
      navigate("/dashboard");
    }
  }, [user, isAdminOrMockUser, isLoading, navigate]);

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
        
        // Only show the component if user is not logged in and no admin/mock auth
        if (!user && !isAdminOrMockUser) {
          return <Component />;
        }
        
        // Return loading state while redirect happens
        return (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        );
      }}
    </Route>
  );
}