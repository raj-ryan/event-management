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
import { CalendarRange, Users, MapPin, Plus, Edit2, Trash2, Calendar, Eye, Ticket, Loader2 } from "lucide-react";
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
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Event, Venue } from "@shared/schema";
import { format, parseISO } from "date-fns";

// Extended interface for event with venue information and additional display properties
interface EventWithVenue extends Event {
  venue?: Venue;
  // Additional display properties not in schema
  imageUrl?: string;
  time?: string;
  location?: string;
  organizer?: string;
  registeredAttendees?: number;
}

export default function EventsPage() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  const [isAdmin, setIsAdmin] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch events from API
  const { 
    data: events = [], 
    isLoading, 
    error 
  } = useQuery<EventWithVenue[]>({
    queryKey: ["/api/events"]
    // Using the default queryFn from queryClient that handles API URL correctly
  });

  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const res = await apiRequest("DELETE", `/api/events/${eventId}`);
      if (!res.ok) {
        throw new Error("Failed to delete event");
      }
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Event Deleted",
        description: "The event has been successfully removed",
      });
      setEventToDelete(null);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      });
    }
  });
  
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
    deleteEventMutation.mutate(id);
  };
  
  // Filter events based on active tab
  const getFilteredEvents = () => {
    if (activeTab === "all") return events;
    return events.filter(event => event.category?.toLowerCase() === activeTab);
  };
  
  // Format event date
  const formatEventDate = (date: string | Date) => {
    if (!date) return "No date";
    const eventDate = typeof date === "string" ? parseISO(date) : date;
    return format(eventDate, "PPP");
  };
  
  // Get default image for events without images
  const getDefaultImage = (category?: string) => {
    switch (category?.toLowerCase()) {
      case "technology":
        return "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop";
      case "wedding":
        return "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop";
      case "music":
        return "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=2070&auto=format&fit=crop";
      case "charity":
        return "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?q=80&w=2070&auto=format&fit=crop";
      default:
        return "https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop";
    }
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
          <TabsList className="w-full bg-slate-100 dark:bg-slate-800 p-1.5 overflow-x-auto flex gap-1.5 rounded-lg shadow-sm" style={{ justifyContent: 'flex-start' }}>
            <TabsTrigger 
              value="all" 
              className="rounded-md py-1.5 px-3 font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              All Events
            </TabsTrigger>
            <TabsTrigger 
              value="technology" 
              className="rounded-md py-1.5 px-3 font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Technology
            </TabsTrigger>
            <TabsTrigger 
              value="wedding" 
              className="rounded-md py-1.5 px-3 font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Wedding
            </TabsTrigger>
            <TabsTrigger 
              value="music" 
              className="rounded-md py-1.5 px-3 font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Music
            </TabsTrigger>
            <TabsTrigger 
              value="charity" 
              className="rounded-md py-1.5 px-3 font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Charity
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center p-10 border rounded-lg">
                <p className="text-red-500 mb-4">Error loading events</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : getFilteredEvents().length === 0 ? (
              <div className="text-center p-10 border rounded-lg">
                <p className="text-muted-foreground mb-4">No events found in this category</p>
                <Button onClick={() => setActiveTab("all")}>
                  View All Events
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {getFilteredEvents().map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="h-48 overflow-hidden">
                      <img
                        src={event.imageUrl || getDefaultImage(event.category)}
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="mb-1">{event.name}</CardTitle>
                          <CardDescription>{event.organizer || "Unknown organizer"}</CardDescription>
                        </div>
                        <Badge className="bg-primary hover:bg-primary/90 text-white">
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{formatEventDate(event.date)} • {event.time || "All day"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{event.location || "No location specified"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{event.registeredAttendees || 0} / {event.capacity || "∞"} attendees</span>
                        </div>
                        <div className="mt-2">
                          <p className="font-semibold">${event.price.toFixed(2)}</p>
                          <p className="text-muted-foreground line-clamp-2 mt-1">{event.description}</p>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="outline" onClick={() => navigate(`/events/${event.id}`)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                      
                      {isAdmin ? (
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
                      ) : (
                        <Button 
                          variant="default"
                          onClick={() => navigate(`/events/${event.id}`)}
                          disabled={
                            event.status !== "upcoming" || 
                            (typeof event.capacity === "number" && 
                             typeof event.registeredAttendees === "number" && 
                             event.registeredAttendees >= event.capacity)
                          }
                        >
                          <Ticket className="h-4 w-4 mr-2" />
                          Book Now
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}