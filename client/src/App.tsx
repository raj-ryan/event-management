import { Switch, Route, useLocation } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "./hooks/use-auth";
import { useEffect } from "react";

// Pages
import HomePage from "./pages/home-page";
import AuthPage from "./pages/auth-page";
import DashboardPage from "./pages/dashboard-page";
import EventsPage from "./pages/events-page";
import VenuesPage from "./pages/venues-page";
import VenueForm from "./pages/venues/venue-form";
import VenueDetail from "./pages/venues/venue-detail";
import BookingsPage from "./pages/bookings-page";
import CheckoutPage from "./pages/checkout-page";
import NotFound from "./pages/not-found";

// Redirects to dashboard if user is logged in
function AuthRedirect({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);
  
  return <>{children}</>;
}

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/">
          <AuthRedirect>
            <HomePage />
          </AuthRedirect>
        </Route>
        <Route path="/auth">
          <AuthRedirect>
            <AuthPage />
          </AuthRedirect>
        </Route>
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/events" component={EventsPage} />
        <ProtectedRoute path="/venues" component={VenuesPage} />
        <ProtectedRoute path="/venues/new" component={VenueForm} />
        <ProtectedRoute path="/venues/edit/:id" component={VenueForm} />
        <ProtectedRoute path="/venues/:id" component={VenueDetail} />
        <ProtectedRoute path="/bookings" component={BookingsPage} />
        <ProtectedRoute path="/checkout" component={CheckoutPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
