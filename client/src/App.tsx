import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import EventsPage from "@/pages/events-page";
import VenuesPage from "@/pages/venues-page";
import BookingsPage from "@/pages/bookings-page";
import CheckoutPage from "@/pages/checkout-page";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={DashboardPage} />
      <ProtectedRoute path="/events" component={EventsPage} />
      <ProtectedRoute path="/venues" component={VenuesPage} />
      <ProtectedRoute path="/bookings" component={BookingsPage} />
      <ProtectedRoute path="/checkout/:bookingId" component={CheckoutPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return <Router />;
}

export default App;
