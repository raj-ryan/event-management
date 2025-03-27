import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CalendarRange, Users, MapPin, Bell, UserCog, Calendar, UserPlus, Truck, UsersRound } from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check if user came from admin login
  useEffect(() => {
    // For development purposes, always show admin features
    setIsAdmin(true);
    
    // In a real app, this would read from the auth context or localStorage
    // const urlParams = new URLSearchParams(window.location.search);
    // if (urlParams.get("admin") === "true") {
    //   setIsAdmin(true);
    // }
  }, []);

  // Simulated user data
  const mockUser = {
    username: isAdmin ? "admin" : "testuser",
    email: isAdmin ? "admin@eventzen.com" : "testuser@example.com",
    firstName: isAdmin ? "Admin" : "Test",
    lastName: isAdmin ? "User" : "User",
    role: isAdmin ? "admin" : "user"
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    navigate("/");
  };

  // Feature cards for users and admins
  const userFeatures = [
    {
      title: "View Venues",
      description: "Browse available venues for your next event",
      icon: <MapPin className="h-8 w-8 text-primary" />,
      action: () => navigate("/venues")
    },
    {
      title: "Manage Bookings",
      description: "View and manage your event bookings",
      icon: <CalendarRange className="h-8 w-8 text-primary" />,
      action: () => navigate("/bookings")
    },
    {
      title: "Manage Profile",
      description: "Update your profile information",
      icon: <UserCog className="h-8 w-8 text-primary" />,
      action: () => setActiveTab("profile")
    },
    {
      title: "Live Notifications",
      description: "Get real-time updates about your events",
      icon: <Bell className="h-8 w-8 text-primary" />,
      action: () => setActiveTab("notifications")
    }
  ];

  const adminFeatures = [
    {
      title: "Venue Management",
      description: "Add, edit, and delete venues",
      icon: <MapPin className="h-8 w-8 text-primary" />,
      action: () => navigate("/venues")
    },
    {
      title: "Event Management",
      description: "Schedule, edit, and delete events",
      icon: <Calendar className="h-8 w-8 text-primary" />,
      action: () => navigate("/events")
    },
    {
      title: "Attendee Management",
      description: "Register attendees and send reminders",
      icon: <UserPlus className="h-8 w-8 text-primary" />,
      action: () => setActiveTab("attendees")
    },
    {
      title: "Vendor Management",
      description: "Assign vendors to events",
      icon: <Truck className="h-8 w-8 text-primary" />,
      action: () => setActiveTab("vendors")
    },
    {
      title: "Live Attendee Tracking",
      description: "Real-time event participation monitoring",
      icon: <UsersRound className="h-8 w-8 text-primary" />,
      action: () => setActiveTab("tracking")
    }
  ];

  const features = isAdmin ? adminFeatures : userFeatures;

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isAdmin ? "Admin Dashboard" : "User Dashboard"}
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {mockUser.firstName || mockUser.username}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/")}>Back to Home</Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>Logout</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value={isAdmin ? "analytics" : "notifications"}>
              {isAdmin ? "Analytics" : "Notifications"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
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

            <h2 className="text-2xl font-bold mb-4">Features & Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer" onClick={feature.action}>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                      {feature.icon}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
                <CardDescription>Update your user information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Profile management functionality will be implemented in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics Dashboard</CardTitle>
                <CardDescription>Event and venue performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Analytics functionality will be implemented in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>Your latest updates and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No new notifications to display.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendees" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendee Management</CardTitle>
                <CardDescription>Register and manage event attendees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Attendee management functionality will be implemented in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="vendors" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Management</CardTitle>
                <CardDescription>Assign vendors to events</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Vendor management functionality will be implemented in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="tracking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Attendee Tracking</CardTitle>
                <CardDescription>Real-time event participation monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Live tracking functionality will be implemented in future updates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}