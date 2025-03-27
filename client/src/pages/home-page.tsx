import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/navbar";
import HeroSection from "@/components/home/hero-section";
import EventCard from "@/components/events/event-card";
import VenueCard from "@/components/venues/venue-card";
import FeatureSection from "@/components/home/feature-section";
import Footer from "@/components/home/footer";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  // Fetch featured events
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  // Fetch featured venues
  const { data: venues = [] } = useQuery({
    queryKey: ["/api/venues"],
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <HeroSection />
        
        {/* Events Showcase */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold font-heading">Upcoming Events</h2>
            <div className="flex space-x-3">
              <Button variant="outline" size="sm">All</Button>
              <Button variant="outline" size="sm">Music</Button>
              <Button variant="outline" size="sm">Tech</Button>
              <Button variant="outline" size="sm">Sports</Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          
          <div className="mt-10 text-center">
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => navigate(user ? "/events" : "/auth")}
            >
              Load More Events
            </Button>
          </div>
        </div>
        
        {/* Venues Showcase */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">Top Venues</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover beautiful venues for your next event. From intimate gatherings to large conferences, find the perfect space.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.slice(0, 3).map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        </div>
        
        {/* Features Section */}
        <FeatureSection />
      </main>
      
      <Footer />
    </div>
  );
}
