import { Switch, Route } from "wouter";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthRedirectRoute } from "./lib/auth-redirect-route";

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

// We'll add event forms
import EventForm from "./pages/events/event-form";
import EventDetail from "./pages/events/event-detail";

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Switch>
        {/* Public routes that redirect to dashboard if already authenticated */}
        <AuthRedirectRoute path="/" component={HomePage} />
        <AuthRedirectRoute path="/auth" component={AuthPage} />
        
        {/* Protected routes that require authentication */}
        <ProtectedRoute path="/dashboard" component={DashboardPage} />
        
        {/* Event routes */}
        <ProtectedRoute path="/events" component={EventsPage} />
        <ProtectedRoute path="/events/new" component={EventForm} />
        <ProtectedRoute path="/events/edit/:id" component={EventForm} />
        <ProtectedRoute path="/events/:id" component={EventDetail} />
        
        {/* Venue routes */}
        <ProtectedRoute path="/venues" component={VenuesPage} />
        <ProtectedRoute path="/venues/new" component={VenueForm} />
        <ProtectedRoute path="/venues/edit/:id" component={VenueForm} />
        <ProtectedRoute path="/venues/:id" component={VenueDetail} />
        
        {/* Booking routes */}
        <ProtectedRoute path="/bookings" component={BookingsPage} />
        <ProtectedRoute path="/checkout" component={CheckoutPage} />
        
        {/* Catch-all route */}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

export default App;
