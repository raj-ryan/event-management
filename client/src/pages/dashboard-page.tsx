import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function DashboardPage() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  // Simulated user data
  const mockUser = {
    username: "testuser",
    email: "testuser@example.com",
    firstName: "Test",
    lastName: "User",
    role: "user"
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {mockUser.firstName || mockUser.username}
            </p>
          </div>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Username:</strong> {mockUser.username}</p>
              <p><strong>Email:</strong> {mockUser.email}</p>
              {mockUser.firstName && <p><strong>Name:</strong> {mockUser.firstName} {mockUser.lastName}</p>}
              <p><strong>Role:</strong> {mockUser.role}</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col md:flex-row gap-4">
          <Card className="w-full md:w-1/2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={() => navigate("/events")}>
                  Browse Events
                </Button>
                <Button variant="outline" onClick={() => navigate("/venues")}>
                  Browse Venues
                </Button>
                <Button variant="outline" onClick={() => navigate("/bookings")}>
                  View Your Bookings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="w-full md:w-1/2">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2">
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}