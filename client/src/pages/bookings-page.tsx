import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { CalendarIcon, Clock, MapPin, Users, DollarSign, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Event, Venue, Booking } from "@shared/schema";

// Extended interfaces for the event and venue with relations
interface EventWithVenue extends Event {
  venue?: { name: string };
}

interface BookingWithDetails extends Booking {
  event?: EventWithVenue;
  venue?: Venue;
}

export default function BookingsPage() {
  const [_, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch bookings
  const { 
    data: bookingsData, 
    isLoading, 
    error 
  } = useQuery<BookingWithDetails[]>({
    queryKey: ["/api/bookings"]
    // Using the default queryFn from queryClient that handles API URL correctly
  });
  
  // Filter bookings based on active tab
  const filteredBookings = bookingsData ? bookingsData.filter(booking => {
    if (activeTab === "all") return true;
    if (activeTab === "events") return !!booking.eventId;
    if (activeTab === "venues") return !!booking.venueId;
    return true;
  }) : [];
  
  // Get status badge variant
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"; // Using default for "success" state
      case "pending":
        return "secondary"; // Using secondary for "warning" state
      case "cancelled":
        return "destructive";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };
  
  // Format booking date
  const formatBookingDate = (date: string | Date) => {
    if (!date) return "No date";
    const bookingDate = typeof date === "string" ? new Date(date) : date;
    return format(bookingDate, "PPP");
  };
  
  // Format booking info
  const getBookingInfo = (booking: BookingWithDetails) => {
    if (booking.eventId && booking.event) {
      return {
        title: booking.event.name,
        location: booking.event.venue?.name || "No venue",
        date: formatBookingDate(booking.event.date),
        type: "Event",
        price: `$${booking.totalAmount.toFixed(2)}`,
        details: `${booking.ticketCount} ticket(s)`,
      };
    } else if (booking.venueId && booking.venue) {
      return {
        title: booking.venue.name,
        location: booking.venue.address,
        date: formatBookingDate(booking.bookingDate as Date),
        type: "Venue",
        price: `$${booking.totalAmount.toFixed(2)}`,
        details: `${booking.bookingDuration} hour(s), ${booking.attendeeCount} people`,
      };
    } else {
      return {
        title: "Unknown booking",
        location: "",
        date: "",
        type: "Unknown",
        price: `$${booking.totalAmount.toFixed(2)}`,
        details: "",
      };
    }
  };
  
  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage your event and venue bookings
            </p>
          </div>
          <Button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>
        
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="events">Event Bookings</TabsTrigger>
            <TabsTrigger value="venues">Venue Bookings</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center p-10 border rounded-lg">
                <p className="text-red-500 mb-4">Error loading bookings</p>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredBookings.map((booking) => {
                  const bookingInfo = getBookingInfo(booking);
                  return (
                    <Card key={booking.id} className="overflow-hidden">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{bookingInfo.title}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <MapPin className="h-4 w-4 mr-1" />
                              {bookingInfo.location}
                            </CardDescription>
                          </div>
                          <Badge variant={getStatusBadgeVariant(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-muted-foreground">
                            <CalendarIcon className="h-4 w-4 mr-2" />
                            <span>{bookingInfo.date}</span>
                          </div>
                          
                          {booking.bookingDuration && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-2" />
                              <span>{booking.bookingDuration} hour(s)</span>
                            </div>
                          )}
                          
                          {booking.attendeeCount && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{booking.attendeeCount} attendees</span>
                            </div>
                          )}
                          
                          {booking.ticketCount && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Users className="h-4 w-4 mr-2" />
                              <span>{booking.ticketCount} ticket(s)</span>
                            </div>
                          )}
                          
                          <div className="flex items-center text-sm font-medium">
                            <DollarSign className="h-4 w-4 mr-2" />
                            <span>{bookingInfo.price}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-secondary/50 flex justify-between">
                        <div className="text-xs text-muted-foreground">
                          Booking #{booking.id}
                        </div>
                        <Badge variant="outline">
                          {booking.paymentStatus.charAt(0).toUpperCase() + booking.paymentStatus.slice(1)}
                        </Badge>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-12 border rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold mb-4">No Bookings Found</h2>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "events" ? (
                    "You haven't made any event bookings yet. Browse events and book your first ticket!"
                  ) : activeTab === "venues" ? (
                    "You haven't made any venue bookings yet. Browse venues and book your first venue!"
                  ) : (
                    "You haven't made any bookings yet. Browse events or venues!"
                  )}
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => navigate("/events")}>
                    Browse Events
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/venues")}>
                    Browse Venues
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}