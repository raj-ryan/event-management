import { Route } from "wouter";

// For now, this is a simplified version that always renders the component
// without authentication checks to enable navigation between all pages
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  return <Route path={path} component={Component} />;
}
