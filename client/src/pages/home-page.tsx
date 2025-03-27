import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [_, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-4xl font-bold mb-6">EventZen</h1>
      <p className="text-xl mb-8">Welcome to the EventZen platform!</p>
      
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Event Management Platform</h2>
        <p className="mb-6">The ultimate solution for event planning and venue booking.</p>
        
        <div className="space-y-4">
          <p>Please log in or register to get started</p>
          <div className="flex flex-col gap-2">
            <Button onClick={() => navigate("/auth")}>Login / Register</Button>
            <Button variant="outline" onClick={() => navigate("/auth")}>Learn More</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
