import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function EventsPage() {
  const [_, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Browse and book upcoming events
            </p>
          </div>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>

        <div className="text-center p-12 border rounded-lg bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Our events database is currently being populated. Check back soon for exciting events!
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}