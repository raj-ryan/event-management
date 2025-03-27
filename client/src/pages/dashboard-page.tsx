import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { CalendarRange, Users, MapPin, Bell, UserCog, Calendar, UserPlus, Truck, UsersRound, Plus } from "lucide-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check for user role from user data
  useEffect(() => {
    // In a real app, we would check auth context
    // if (auth.user?.role === "admin") {
    //   setIsAdmin(true);
    // }
    
    // For development, read from URL or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.get("role") === "admin") {
      setIsAdmin(true);
      // Store in localStorage for persistence
      localStorage.setItem("userRole", "admin");
    } else if (urlParams.get("role") === "user") {
      setIsAdmin(false);
      localStorage.setItem("userRole", "user");
    } else {
      // Read from storage if not in URL
      const storedRole = localStorage.getItem("userRole");
      if (storedRole === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    }
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
            <Button variant="outline" onClick={() => setActiveTab("overview")}>Back to Overview</Button>
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
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="firstName" className="text-sm font-medium">First Name</label>
                        <input
                          id="firstName"
                          type="text"
                          className="w-full p-2 border rounded-md"
                          defaultValue={mockUser.firstName || ""}
                          placeholder="Enter your first name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="lastName" className="text-sm font-medium">Last Name</label>
                        <input
                          id="lastName"
                          type="text"
                          className="w-full p-2 border rounded-md"
                          defaultValue={mockUser.lastName || ""}
                          placeholder="Enter your last name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">Email</label>
                      <input
                        id="email"
                        type="email"
                        className="w-full p-2 border rounded-md"
                        defaultValue={mockUser.email}
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="username" className="text-sm font-medium">Username</label>
                      <input
                        id="username"
                        type="text"
                        className="w-full p-2 border rounded-md"
                        defaultValue={mockUser.username}
                        placeholder="Enter your username"
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
                        <input
                          id="currentPassword"
                          type="password"
                          className="w-full p-2 border rounded-md"
                          placeholder="Enter your current password"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
                        <input
                          id="newPassword"
                          type="password"
                          className="w-full p-2 border rounded-md"
                          placeholder="Enter your new password"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
                        <input
                          id="confirmPassword"
                          type="password"
                          className="w-full p-2 border rounded-md"
                          placeholder="Confirm your new password"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="emailNotifications"
                          type="checkbox"
                          className="h-4 w-4 mr-2"
                          defaultChecked
                        />
                        <label htmlFor="emailNotifications" className="text-sm">Receive email notifications</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="smsNotifications"
                          type="checkbox"
                          className="h-4 w-4 mr-2"
                        />
                        <label htmlFor="smsNotifications" className="text-sm">Receive SMS notifications</label>
                      </div>
                      
                      <div className="flex items-center">
                        <input
                          id="marketingEmails"
                          type="checkbox"
                          className="h-4 w-4 mr-2"
                          defaultChecked
                        />
                        <label htmlFor="marketingEmails" className="text-sm">Receive marketing emails</label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Save Changes</Button>
                  </div>
                </div>
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
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="p-4 bg-primary/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg mb-1">Total Events</CardTitle>
                          <p className="text-3xl font-bold">12</p>
                        </div>
                        <Calendar className="h-10 w-10 text-primary" />
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-primary/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg mb-1">Total Bookings</CardTitle>
                          <p className="text-3xl font-bold">87</p>
                        </div>
                        <CalendarRange className="h-10 w-10 text-primary" />
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-primary/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg mb-1">Total Attendees</CardTitle>
                          <p className="text-3xl font-bold">245</p>
                        </div>
                        <Users className="h-10 w-10 text-primary" />
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-primary/10">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg mb-1">Revenue</CardTitle>
                          <p className="text-3xl font-bold">$18,245</p>
                        </div>
                        <svg className="h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Popular Events</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-md h-10 relative">
                            <div className="absolute top-0 left-0 h-10 bg-primary rounded-md" style={{ width: '80%' }}></div>
                            <div className="absolute top-0 left-0 h-10 w-full flex items-center justify-between px-3">
                              <span className="text-white font-medium">Annual Tech Conference</span>
                              <span className="text-white font-medium">80%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-md h-10 relative">
                            <div className="absolute top-0 left-0 h-10 bg-primary rounded-md" style={{ width: '65%' }}></div>
                            <div className="absolute top-0 left-0 h-10 w-full flex items-center justify-between px-3">
                              <span className="text-white font-medium">Summer Wedding Showcase</span>
                              <span className="text-white font-medium">65%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-md h-10 relative">
                            <div className="absolute top-0 left-0 h-10 bg-primary rounded-md" style={{ width: '45%' }}></div>
                            <div className="absolute top-0 left-0 h-10 w-full flex items-center justify-between px-3">
                              <span className="text-white font-medium">Garden Concert Series</span>
                              <span className="text-white font-medium">45%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-md h-10 relative">
                            <div className="absolute top-0 left-0 h-10 bg-primary rounded-md" style={{ width: '30%' }}></div>
                            <div className="absolute top-0 left-0 h-10 w-full flex items-center justify-between px-3">
                              <span className="text-white font-medium">Charity Fundraiser Gala</span>
                              <span className="text-white font-medium">30%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Top Venues</h3>
                      <div className="space-y-4">
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-md h-10 relative">
                            <div className="absolute top-0 left-0 h-10 bg-primary rounded-md" style={{ width: '75%' }}></div>
                            <div className="absolute top-0 left-0 h-10 w-full flex items-center justify-between px-3">
                              <span className="text-white font-medium">Grand Ballroom</span>
                              <span className="text-white font-medium">75%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-md h-10 relative">
                            <div className="absolute top-0 left-0 h-10 bg-primary rounded-md" style={{ width: '60%' }}></div>
                            <div className="absolute top-0 left-0 h-10 w-full flex items-center justify-between px-3">
                              <span className="text-white font-medium">Convention Center</span>
                              <span className="text-white font-medium">60%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-md h-10 relative">
                            <div className="absolute top-0 left-0 h-10 bg-primary rounded-md" style={{ width: '50%' }}></div>
                            <div className="absolute top-0 left-0 h-10 w-full flex items-center justify-between px-3">
                              <span className="text-white font-medium">Rooftop Garden</span>
                              <span className="text-white font-medium">50%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <div className="w-full bg-muted rounded-md h-10 relative">
                            <div className="absolute top-0 left-0 h-10 bg-primary rounded-md" style={{ width: '25%' }}></div>
                            <div className="absolute top-0 left-0 h-10 w-full flex items-center justify-between px-3">
                              <span className="text-white font-medium">Ocean View Terrace</span>
                              <span className="text-white font-medium">25%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Monthly Revenue</h3>
                    <div className="h-64 bg-muted rounded-md flex items-end p-4">
                      <div className="h-30% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-45% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-60% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-40% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-50% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-65% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-90% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-75% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-60% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-80% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-70% bg-primary w-8 rounded-t-md mx-2"></div>
                      <div className="h-55% bg-primary w-8 rounded-t-md mx-2"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <div>Jan</div>
                      <div>Feb</div>
                      <div>Mar</div>
                      <div>Apr</div>
                      <div>May</div>
                      <div>Jun</div>
                      <div>Jul</div>
                      <div>Aug</div>
                      <div>Sep</div>
                      <div>Oct</div>
                      <div>Nov</div>
                      <div>Dec</div>
                    </div>
                  </div>
                </div>
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
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="p-4">
                      <CardTitle className="text-lg mb-2">Pending Check-ins</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        <ul className="space-y-2">
                          <li className="flex justify-between items-center">
                            <span>John Doe - Annual Tech Conference</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Attendee Checked In",
                                  description: "John Doe has been checked in successfully",
                                });
                              }}
                            >
                              Check In
                            </Button>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Sarah Doe - Annual Tech Conference</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Attendee Checked In",
                                  description: "Sarah Doe has been checked in successfully",
                                });
                              }}
                            >
                              Check In
                            </Button>
                          </li>
                          <li className="flex justify-between items-center">
                            <span>Jane Smith - Summer Wedding Showcase</span>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                toast({
                                  title: "Attendee Checked In",
                                  description: "Jane Smith has been checked in successfully",
                                });
                              }}
                            >
                              Check In
                            </Button>
                          </li>
                        </ul>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <CardTitle className="text-lg mb-2">Recent Check-ins</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        <p>No recent check-ins to display</p>
                      </div>
                    </Card>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-4">All Registered Attendees</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted text-left">
                            <th className="p-2">Name</th>
                            <th className="p-2">Email</th>
                            <th className="p-2">Event</th>
                            <th className="p-2">Check-in Status</th>
                            <th className="p-2">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-2">John Doe</td>
                            <td className="p-2">john@example.com</td>
                            <td className="p-2">Annual Tech Conference</td>
                            <td className="p-2"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Pending</span></td>
                            <td className="p-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Attendee Checked In",
                                    description: "John Doe has been checked in successfully",
                                  });
                                }}
                              >
                                Check In
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-2">Sarah Doe</td>
                            <td className="p-2">sarah@example.com</td>
                            <td className="p-2">Annual Tech Conference</td>
                            <td className="p-2"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Pending</span></td>
                            <td className="p-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Attendee Checked In",
                                    description: "Sarah Doe has been checked in successfully",
                                  });
                                }}
                              >
                                Check In
                              </Button>
                            </td>
                          </tr>
                          <tr className="border-t">
                            <td className="p-2">Jane Smith</td>
                            <td className="p-2">jane@example.com</td>
                            <td className="p-2">Summer Wedding Showcase</td>
                            <td className="p-2"><span className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">Pending</span></td>
                            <td className="p-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  toast({
                                    title: "Attendee Checked In",
                                    description: "Jane Smith has been checked in successfully",
                                  });
                                }}
                              >
                                Check In
                              </Button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
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
                <div className="space-y-4">
                  <div className="flex justify-end mb-4">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Vendor
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card className="p-4">
                      <CardTitle className="text-lg mb-2">Elite Catering</CardTitle>
                      <div className="text-sm space-y-2">
                        <p><strong>Type:</strong> Catering</p>
                        <p><strong>Contact:</strong> contact@elitecatering.com</p>
                        <p><strong>Phone:</strong> 212-555-1234</p>
                        <div className="mt-4">
                          <strong>Assigned to:</strong>
                          <ul className="list-disc pl-5 mt-1">
                            <li>Summer Wedding Showcase</li>
                            <li>Garden Concert Series</li>
                          </ul>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Edit Vendor",
                                description: "Edit Elite Catering details",
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Vendor Removed",
                                description: "Elite Catering has been removed successfully",
                                variant: "destructive",
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <CardTitle className="text-lg mb-2">Sound Masters</CardTitle>
                      <div className="text-sm space-y-2">
                        <p><strong>Type:</strong> Audio/Visual</p>
                        <p><strong>Contact:</strong> info@soundmasters.com</p>
                        <p><strong>Phone:</strong> 415-555-6789</p>
                        <div className="mt-4">
                          <strong>Assigned to:</strong>
                          <ul className="list-disc pl-5 mt-1">
                            <li>Annual Tech Conference</li>
                            <li>Garden Concert Series</li>
                          </ul>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Edit Vendor",
                                description: "Edit Sound Masters details",
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Vendor Removed",
                                description: "Sound Masters has been removed successfully",
                                variant: "destructive",
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <CardTitle className="text-lg mb-2">Perfect Decor</CardTitle>
                      <div className="text-sm space-y-2">
                        <p><strong>Type:</strong> Decoration</p>
                        <p><strong>Contact:</strong> hello@perfectdecor.com</p>
                        <p><strong>Phone:</strong> 310-555-4321</p>
                        <div className="mt-4">
                          <strong>Assigned to:</strong>
                          <ul className="list-disc pl-5 mt-1">
                            <li>Summer Wedding Showcase</li>
                          </ul>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Edit Vendor",
                                description: "Edit Perfect Decor details",
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Vendor Removed",
                                description: "Perfect Decor has been removed successfully",
                                variant: "destructive",
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <CardTitle className="text-lg mb-2">Photo Memories</CardTitle>
                      <div className="text-sm space-y-2">
                        <p><strong>Type:</strong> Photography</p>
                        <p><strong>Contact:</strong> bookings@photomemories.com</p>
                        <p><strong>Phone:</strong> 650-555-7890</p>
                        <div className="mt-4">
                          <strong>Assigned to:</strong>
                          <ul className="list-disc pl-5 mt-1">
                            <li>Annual Tech Conference</li>
                            <li>Summer Wedding Showcase</li>
                          </ul>
                        </div>
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Edit Vendor",
                                description: "Edit Photo Memories details",
                              });
                            }}
                          >
                            Edit
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              toast({
                                title: "Vendor Removed",
                                description: "Photo Memories has been removed successfully",
                                variant: "destructive",
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
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
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-4 bg-green-50 border-green-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg mb-1">Active Events</CardTitle>
                          <p className="text-3xl font-bold text-green-600">2</p>
                        </div>
                        <Calendar className="h-10 w-10 text-green-500" />
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg mb-1">Total Attendees</CardTitle>
                          <p className="text-3xl font-bold text-blue-600">5</p>
                        </div>
                        <Users className="h-10 w-10 text-blue-500" />
                      </div>
                    </Card>
                    
                    <Card className="p-4 bg-amber-50 border-amber-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle className="text-lg mb-1">Check-ins Today</CardTitle>
                          <p className="text-3xl font-bold text-amber-600">0</p>
                        </div>
                        <UsersRound className="h-10 w-10 text-amber-500" />
                      </div>
                    </Card>
                  </div>
                  
                  <h3 className="text-xl font-semibold mt-6 mb-4">Active Events</h3>
                  <div className="space-y-4">
                    <Card className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <CardTitle className="text-lg">Annual Tech Conference</CardTitle>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Live Now</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Attendance Statistics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Registered</span>
                              <span className="font-medium">3</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Checked In</span>
                              <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Attendance Rate</span>
                              <span className="font-medium">0%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Recent Activity</h4>
                          <div className="text-sm text-muted-foreground">
                            <p>No recent check-ins</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                    
                    <Card className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <CardTitle className="text-lg">Summer Wedding Showcase</CardTitle>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Live Now</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Attendance Statistics</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Total Registered</span>
                              <span className="font-medium">2</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Checked In</span>
                              <span className="font-medium">0</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Attendance Rate</span>
                              <span className="font-medium">0%</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2">Recent Activity</h4>
                          <div className="text-sm text-muted-foreground">
                            <p>No recent check-ins</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}