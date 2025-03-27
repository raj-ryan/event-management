import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { CalendarRange, Users, MapPin, Plus, Edit2, Trash2, Calendar, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

// Mock event data
const mockEvents = [
  {
    id: 1,
    name: "Annual Tech Conference",
    description: "The largest tech conference in the city, featuring speakers from leading tech companies.",
    date: "2025-04-15",
    time: "09:00 AM - 06:00 PM",
    location: "Convention Center",
    venueId: 1,
    imageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop",
    status: "upcoming",
    capacity: 500,
    registeredAttendees: 324,
    price: 99,
    organizer: "TechEvents Inc",
    category: "Technology"
  },
  {
    id: 2,
    name: "Summer Wedding Showcase",
    description: "Explore the latest trends in wedding planning, decorations, and catering.",
    date: "2025-05-20",
    time: "10:00 AM - 04:00 PM",
    location: "Grand Ballroom",
    venueId: 2,
    imageUrl: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop",
    status: "upcoming",
    capacity: 200,
    registeredAttendees: 108,
    price: 25,
    organizer: "Wedding Planners Association",
    category: "Wedding"
  },
  {
    id: 3,
    name: "Garden Concert Series",
    description: "An evening of classical music in the beautiful botanical gardens.",
    date: "2025-06-10",
    time: "07:00 PM - 10:00 PM",
    location: "Botanical Gardens",
    venueId: 3,
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop",
    status: "upcoming",
    capacity: 300,
    registeredAttendees: 187,
    price: 45,
    organizer: "City Symphony Orchestra",
    category: "Music"
  },
  {
    id: 4,
    name: "Charity Fundraiser Gala",
    description: "Annual black-tie fundraiser for local community initiatives.",
    date: "2025-07-05",
    time: "06:30 PM - 11:00 PM",
    location: "Luxury Hotel Ballroom",
    venueId: 4,
    imageUrl: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=2070&auto=format&fit=crop",
    status: "upcoming",
    capacity: 250,
    registeredAttendees: 142,
    price: 150,
    organizer: "Community Foundation",
    category: "Charity"
  }
];

export default function EventsPage() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const { toast } = useToast();

  // Check for admin role
  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []);

  // Function to handle event deletion
  const handleDeleteEvent = (id: number) => {
    // In a real application, this would make an API call
    toast({
      title: "Event Deleted",
      description: "The event has been successfully removed",
    });
    setEventToDelete(null);
  };
  
  // Filter events based on active tab
  const getFilteredEvents = () => {
    if (activeTab === "all") return mockEvents;
    return mockEvents.filter(event => event.category.toLowerCase() === activeTab);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Events</h1>
            <p className="text-muted-foreground">
              Browse and manage upcoming events
            </p>
          </div>
          <div className="space-x-2 flex">
            {isAdmin && (
              <Button onClick={() => navigate("/events/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Event
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full bg-muted/50 p-1 overflow-x-auto flex gap-1" style={{ justifyContent: 'flex-start' }}>
            <TabsTrigger value="all" className="rounded-md">All Events</TabsTrigger>
            <TabsTrigger value="technology" className="rounded-md">Technology</TabsTrigger>
            <TabsTrigger value="wedding" className="rounded-md">Wedding</TabsTrigger>
            <TabsTrigger value="music" className="rounded-md">Music</TabsTrigger>
            <TabsTrigger value="charity" className="rounded-md">Charity</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredEvents().map((event) => (
                <Card key={event.id} className="overflow-hidden">
                  {event.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={event.imageUrl}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="mb-1">{event.name}</CardTitle>
                        <CardDescription>{event.organizer}</CardDescription>
                      </div>
                      <Badge className="bg-primary hover:bg-primary/90 text-white">
                        {event.status === "upcoming" ? "Upcoming" : event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{event.date} • {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{event.registeredAttendees} / {event.capacity} attendees</span>
                      </div>
                      <div className="mt-2">
                        <p className="font-semibold">${event.price}</p>
                        <p className="text-muted-foreground line-clamp-2 mt-1">{event.description}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => navigate(`/events/${event.id}`)}>
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    {isAdmin && (
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => navigate(`/events/edit/${event.id}`)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => setEventToDelete(event.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete {event.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setEventToDelete(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleDeleteEvent(event.id)}
                                className="bg-red-500 hover:bg-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}