import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function BookingsPage() {
  const [_, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage your event bookings
            </p>
          </div>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>

        <div className="text-center p-12 border rounded-lg bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">No Bookings Yet</h2>
          <p className="text-muted-foreground mb-6">
            You haven't made any bookings yet. Browse events and book your first ticket!
          </p>
          <Button onClick={() => navigate("/events")}>Browse Events</Button>
        </div>
      </div>
    </div>
  );
}