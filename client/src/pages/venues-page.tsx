import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import VenueList from "./venues/venue-list";
import { useState, useEffect } from "react";

export default function VenuesPage() {
  const [_, navigate] = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check for admin status
  useEffect(() => {
    // For development purposes, always show admin controls
    setIsAdmin(true);
    
    // In a real app, we would uncomment this to use the auth context
    // if (auth.user?.role === "admin") {
    //   setIsAdmin(true);
    // }
  }, []);

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
          <div className="space-x-2 flex">
            {isAdmin && (
              <Button 
                onClick={() => navigate("/venues/new")}
                className="mr-2"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Venue
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
            <Button onClick={() => navigate("/dashboard")}>Dashboard</Button>
          </div>
        </div>

        <VenueList />
      </div>
    </div>
  );
}