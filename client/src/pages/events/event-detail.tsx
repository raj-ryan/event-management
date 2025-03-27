import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  ArrowLeft, 
  Calendar,
  MapPin, 
  Users, 
  DollarSign,
  Clock,
  Tag,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import BookEventModal from "./book-event-modal";
import { format } from "date-fns";

// Mock Event data
interface EventDetail {
  id: number;
  name: string;
  description: string;
  date: Date;
  endDate: Date | null;
  venueId: number;
  venue: {
    id: number;
    name: string;
    address: string;
    capacity: number;
    amenities: string[];
  };
  capacity: number;
  price: number;
  image: string;
  status: string;
  organizer: {
    id: number;
    name: string;
    avatar: string;
  };
  category: string;
  attendees: {
    count: number;
    list: Array<{
      id: number;
      name: string;
      avatar: string;
    }>;
  };
}

export default function EventDetail() {
  const params = useParams<{ id: string }>();
  const [_, navigate] = useLocation();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  
  // Fetch event data
  const { data: event, isLoading, error } = useQuery<EventDetail>({
    queryKey: ['/api/events', params?.id],
    queryFn: async () => {
      // In a real app, this would fetch from an API
      // For now, use mock data
      return {
        id: parseInt(params!.id),
        name: "Annual Tech Conference 2025",
        description: "Join us for the largest tech conference in the city. Experience cutting-edge technology, network with industry leaders, and gain insights into the latest trends and innovations. This year's event includes workshops, panel discussions, and keynote speeches from renowned tech visionaries.",
        date: new Date("2025-04-15T09:00:00"),
        endDate: new Date("2025-04-17T18:00:00"),
        venueId: 1,
        venue: {
          id: 1,
          name: "Metropolitan Convention Center",
          address: "123 Main Street, Cityville, ST 12345",
          capacity: 1500,
          amenities: ["WiFi", "Parking", "Catering", "AV Equipment"]
        },
        capacity: 1200,
        price: 99.99,
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        status: "upcoming",
        organizer: {
          id: 1,
          name: "Tech Events Inc",
          avatar: "T"
        },
        category: "Technology",
        attendees: {
          count: 450,
          list: [
            { id: 1, name: "Jane Smith", avatar: "JS" },
            { id: 2, name: "John Doe", avatar: "JD" },
            { id: 3, name: "Sarah Johnson", avatar: "SJ" }
          ]
        }
      };
    },
  });
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500">Error loading event</h1>
          <p className="mt-2">Unable to load event details. Please try again later.</p>
          <Button 
            variant="outline" 
            className="mt-4" 
            onClick={() => navigate("/events")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const formatDateRange = () => {
    const start = format(new Date(event.date), "PPP");
    
    if (event.endDate) {
      const end = format(new Date(event.endDate), "PPP");
      return `${start} - ${end}`;
    }
    
    return start;
  };
  
  const formatTimeRange = () => {
    const start = format(new Date(event.date), "h:mm a");
    
    if (event.endDate) {
      const end = format(new Date(event.endDate), "h:mm a");
      return `${start} - ${end}`;
    }
    
    return `${start} onward`;
  };
  
  const getStatusColor = () => {
    switch (event.status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Back button */}
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate("/events")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Event image */}
          <div className="rounded-xl overflow-hidden mb-6">
            <AspectRatio ratio={16 / 9}>
              <img 
                src={event.image} 
                alt={event.name} 
                className="object-cover w-full h-full"
              />
            </AspectRatio>
          </div>
          
          {/* Event header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">{event.name}</h1>
              <Badge className={getStatusColor()}>
                {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
              </Badge>
            </div>
            
            <div className="flex items-center mt-2">
              <Tag className="h-4 w-4 mr-1" />
              <span className="text-muted-foreground">{event.category}</span>
            </div>
          </div>
          
          {/* Event organizer */}
          <div className="flex items-center mb-6">
            <Avatar className="h-10 w-10 mr-2">
              <AvatarFallback>{event.organizer.avatar}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Organized by</p>
              <p className="font-semibold">{event.organizer.name}</p>
            </div>
          </div>
          
          {/* Event details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Date & Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{formatDateRange()}</p>
                <p className="text-muted-foreground">{formatTimeRange()}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{event.venue.name}</p>
                <p className="text-muted-foreground">{event.venue.address}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Attendance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{event.attendees.count} / {event.capacity} attending</p>
                <p className="text-muted-foreground">
                  {Math.round((event.attendees.count / event.capacity) * 100)}% filled
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <DollarSign className="h-4 w-4 mr-2" />
                  Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>${event.price.toFixed(2)} per ticket</p>
                <p className="text-muted-foreground">
                  {event.price === 0 ? 'Free event' : 'Paid event'}
                </p>
              </CardContent>
            </Card>
          </div>
          
          {/* Event description */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>About this event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-line">{event.description}</p>
            </CardContent>
          </Card>
          
          {/* Venue information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Venue Information</CardTitle>
              <CardDescription>{event.venue.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">{event.venue.address}</p>
              <div className="mb-4">
                <h4 className="font-medium mb-2">Amenities</h4>
                <div className="flex flex-wrap gap-2">
                  {event.venue.amenities.map((amenity, index) => (
                    <Badge key={index} variant="outline">
                      {amenity}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Capacity</h4>
                <p>This venue can accommodate up to {event.venue.capacity} people.</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Attendees */}
          <Card>
            <CardHeader>
              <CardTitle>Attendees</CardTitle>
              <CardDescription>{event.attendees.count} people are attending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {event.attendees.list.map((attendee) => (
                  <div key={attendee.id} className="flex items-center">
                    <Avatar className="h-8 w-8 mr-2">
                      <AvatarFallback>{attendee.avatar}</AvatarFallback>
                    </Avatar>
                    <span>{attendee.name}</span>
                  </div>
                ))}
                {event.attendees.count > event.attendees.list.length && (
                  <div className="text-muted-foreground ml-2">
                    +{event.attendees.count - event.attendees.list.length} more
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking Information</CardTitle>
                <CardDescription>Secure your spot at this event</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Price:</span>
                    <span className="font-bold">
                      {event.price === 0 ? 'Free' : `$${event.price.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available spots:</span>
                    <span className="font-bold">
                      {event.capacity - event.attendees.count}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Event date:</span>
                    <span className="font-bold">
                      {format(new Date(event.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex flex-col gap-2">
                    <Button 
                      size="lg" 
                      className="w-full"
                      onClick={() => setIsBookModalOpen(true)}
                      disabled={event.status === 'cancelled' || event.status === 'completed'}
                    >
                      Book Now
                    </Button>
                    
                    <Button variant="outline" size="lg" className="w-full">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Event
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                <p>
                  {event.status === 'upcoming' 
                    ? `Booking closes 24 hours before the event`
                    : event.status === 'cancelled' 
                      ? 'This event has been cancelled'
                      : event.status === 'completed'
                        ? 'This event has ended'
                        : 'Book now while spots are available!'}
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      <BookEventModal 
        isOpen={isBookModalOpen}
        onClose={() => setIsBookModalOpen(false)}
        event={event}
      />
    </div>
  );
}