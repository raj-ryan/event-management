import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/sidebar";
import VenueCard from "@/components/venues/venue-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function VenuesPage() {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [capacityFilter, setCapacityFilter] = useState("all");

  // Fetch venues
  const { data: venues = [], isLoading } = useQuery({
    queryKey: ["/api/venues"],
  });

  // Filter venues based on search and capacity
  const filteredVenues = venues.filter((venue) => {
    const matchesSearch = venue.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    let matchesCapacity = true;
    if (capacityFilter === "small") {
      matchesCapacity = venue.capacity <= 100;
    } else if (capacityFilter === "medium") {
      matchesCapacity = venue.capacity > 100 && venue.capacity <= 500;
    } else if (capacityFilter === "large") {
      matchesCapacity = venue.capacity > 500;
    }

    return matchesSearch && matchesCapacity;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white shadow-sm flex items-center h-16 md:hidden">
          <div className="flex items-center px-4">
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="ml-4 flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="ml-2 text-lg font-heading font-bold">
                EventZen
              </span>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Venues</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Discover beautiful venues for your next event.
                  </p>
                </div>
                {user?.role === "admin" && (
                  <div className="mt-4 md:mt-0">
                    <Button>Add New Venue</Button>
                  </div>
                )}
              </div>

              {/* Search and filter */}
              <div className="flex flex-col md:flex-row gap-4 md:items-center mb-8">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <Input
                    placeholder="Search venues..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select
                    value={capacityFilter}
                    onValueChange={setCapacityFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by capacity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Capacities</SelectItem>
                      <SelectItem value="small">Small (≤ 100)</SelectItem>
                      <SelectItem value="medium">Medium (101-500)</SelectItem>
                      <SelectItem value="large">Large (&gt; 500)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Venues grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-muted rounded-lg overflow-hidden h-96"
                    ></div>
                  ))}
                </div>
              ) : filteredVenues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredVenues.map((venue) => (
                    <VenueCard key={venue.id} venue={venue} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No venues found matching your criteria.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setCapacityFilter("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
