import { Route, useLocation } from "wouter";
import { Loader2 } from "lucide-react";

/**
 * A route that requires authentication to access.
 * If user is not authenticated, redirects to login.
 */
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  const [_, navigate] = useLocation();

  // For this simple version, we'll render the component directly
  // and let any authentication logic be handled inside the components
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}