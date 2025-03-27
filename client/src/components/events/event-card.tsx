import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarIcon, Clock, MapPinIcon, Users } from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface EventCardProps {
  event: any;
}

export default function EventCard({ event }: EventCardProps) {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isBookDialogOpen, setIsBookDialogOpen] = useState(false);
  const [ticketCount, setTicketCount] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const isEventPast = isPast(new Date(event.date));
  const isCreator = user && event.createdBy === user.id;

  // Format date and time
  const formattedDate = format(new Date(event.date), "MMM d, yyyy");
  const formattedDay = format(new Date(event.date), "d");
  const formattedMonth = format(new Date(event.date), "MMM");
  const formattedTime = format(new Date(event.date), "h:mm a");

  // Calculate maximum tickets that can be purchased
  const maxTickets = event.capacity > 10 ? 10 : event.capacity;

  const handleBookEvent = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setIsLoading(true);
    try {
      const booking = {
        eventId: event.id,
        ticketCount: ticketCount,
        status: "pending",
        paymentStatus: "pending",
        totalAmount: event.price * ticketCount
      };

      const response = await apiRequest("POST", "/api/bookings", booking);
      const data = await response.json();
      
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setIsBookDialogOpen(false);
      
      toast({
        title: "Booking Created",
        description: "Your booking has been created successfully. Proceed to payment to confirm."
      });
      
      navigate(`/checkout/${data.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = () => {
    // For now, just open the booking dialog
    // In a full implementation, this would navigate to an event details page
    setIsBookDialogOpen(true);
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-md event-card">
        {/* Event image */}
        <div className="relative h-48 w-full overflow-hidden">
          <img
            className="h-full w-full object-cover"
            src={event.image || `https://source.unsplash.com/random/400x200/?${event.category.toLowerCase()}`}
            alt={event.name}
          />
          <div className="absolute top-4 left-4 bg-white bg-opacity-90 p-2 rounded-md text-center">
            <div className="text-primary font-bold text-lg">{formattedDay}</div>
            <div className="text-primary text-xs uppercase">{formattedMonth}</div>
          </div>
          {isEventPast && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm font-semibold px-3 py-2 bg-opacity-90">
                Event Ended
              </Badge>
            </div>
          )}
          {isCreator && (
            <Badge variant="outline" className="absolute top-4 right-4 bg-white">
              Your Event
            </Badge>
          )}
        </div>
        
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div>
              <Badge variant="secondary" className="mb-2">
                {event.category}
              </Badge>
              <h3 className="text-lg font-bold mb-1">{event.name}</h3>
              <p className="text-muted-foreground text-sm mb-2 flex items-center">
                <MapPinIcon className="h-4 w-4 mr-1" />
                {event.venue || "Venue"}
              </p>
            </div>
            <span className="text-secondary font-semibold">${event.price.toFixed(2)}</span>
          </div>
          
          <div className="flex items-center text-sm mt-3">
            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{formattedTime}</span>
          </div>
          
          {/* Attendees visualization */}
          <div className="mt-4 flex justify-between items-center">
            <div className="flex -space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-white">
                  <AvatarFallback className="bg-primary-light text-primary text-xs">
                    {String.fromCharCode(65 + i)}
                  </AvatarFallback>
                </Avatar>
              ))}
              <div className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-white bg-muted text-xs text-muted-foreground">
                +{event.attendeeCount || 42}
              </div>
            </div>
            <Button 
              variant="link" 
              className="text-primary hover:text-primary-dark p-0 h-auto text-sm"
              onClick={handleViewDetails}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Booking Dialog */}
      <Dialog open={isBookDialogOpen} onOpenChange={setIsBookDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{event.name}</DialogTitle>
            <DialogDescription>
              {event.description || "Join us for this exciting event!"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Date & Time</h4>
                <p className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  {formattedDate} at {formattedTime}
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                <p className="flex items-center">
                  <MapPinIcon className="h-4 w-4 mr-1" />
                  {event.venue || "Venue"}
                </p>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Price</h4>
              <p className="text-lg font-semibold">${event.price.toFixed(2)} per ticket</p>
            </div>
            
            {!isEventPast && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Number of Tickets</h4>
                <div className="flex items-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                    disabled={ticketCount <= 1}
                  >
                    -
                  </Button>
                  <span className="mx-4 w-8 text-center">{ticketCount}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTicketCount(Math.min(maxTickets, ticketCount + 1))}
                    disabled={ticketCount >= maxTickets}
                  >
                    +
                  </Button>
                  <span className="ml-4 text-sm text-muted-foreground">
                    (${(event.price * ticketCount).toFixed(2)} total)
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  <Users className="h-3 w-3 inline mr-1" />
                  {event.capacity} spots available
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBookDialogOpen(false)}>
              Cancel
            </Button>
            {!isEventPast ? (
              <Button onClick={handleBookEvent} disabled={isLoading}>
                {isLoading ? "Processing..." : "Book Now"}
              </Button>
            ) : (
              <Button disabled>Event Ended</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
