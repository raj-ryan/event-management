import { Route } from "wouter";

/**
 * A route that is always accessible.
 * Used for public pages like homepage and login.
 */
export function AuthRedirectRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element;
}) {
  // For this simple version, we'll render the component directly
  // and let any authentication logic be handled inside the components
  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}