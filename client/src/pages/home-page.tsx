import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [_, navigate] = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    // Simulate loading state
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">EventZen</h1>
      <p className="text-xl mb-8">Welcome to the EventZen platform!</p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Event Management Platform</h2>
        <p className="mb-6">The ultimate solution for event planning and venue booking.</p>
        
        {user ? (
          <div className="space-y-4">
            <p className="text-green-600">You are logged in as {user.username}</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
              <Button variant="outline" onClick={() => navigate("/events")}>Browse Events</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p>Please log in or register to get started</p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => navigate("/auth")}>Login / Register</Button>
              <Button variant="outline" onClick={() => navigate("/auth")}>Learn More</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
