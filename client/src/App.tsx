import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";

// Pages
import HomePage from "./pages/home-page";
import AuthPage from "./pages/auth-page";
import DashboardPage from "./pages/dashboard-page";
import EventsPage from "./pages/events-page";
import VenuesPage from "./pages/venues-page";
import BookingsPage from "./pages/bookings-page";
import CheckoutPage from "./pages/checkout-page";
import NotFound from "./pages/not-found";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/auth" component={AuthPage} />
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        <ProtectedRoute path="/events" component={EventsPage} />
        <ProtectedRoute path="/venues" component={VenuesPage} />
        <ProtectedRoute path="/bookings" component={BookingsPage} />
        <ProtectedRoute path="/checkout" component={CheckoutPage} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
