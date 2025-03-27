import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import VenueList from "./venues/venue-list";

export default function VenuesPage() {
  const [_, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
            <p className="text-muted-foreground">
              Find the perfect venue for your event
            </p>
          </div>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
            <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
          </div>
        </div>

        <VenueList />
      </div>
    </div>
  );
}