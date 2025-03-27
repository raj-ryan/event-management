import React, { useState, useEffect } from 'react';
import { useRoute, useLocation } from 'wouter';
import { 
  CalendarClock, 
  MapPin, 
  Users, 
  DollarSign, 
  Clock, 
  Calendar, 
  Ticket, 
  ArrowLeft, 
  Share2, 
  Tag,
  Info,
  AlertCircle
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import BookEventModal from './book-event-modal';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface Event {
  id: number;
  name: string;
  description: string;
  date: string | Date;
  time: string;
  location: string;
  venueId: number;
  imageUrl: string | null;
  status: string;
  capacity: number;
  registeredAttendees: number;
  price: number;
  organizer: string;
  category: string;
}

export default function EventDetail() {
  const [match, params] = useRoute('/events/:id');
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  useEffect(() => {
    if (!match || !params?.id) {
      navigate('/events');
      return;
    }

    // In a real app, this would be an API call to get event details
    const fetchEvent = async () => {
      try {
        setLoading(true);
        // Mock fetch from server - replace with actual API call
        const mockEvent = {
          id: parseInt(params.id),
          name: "Annual Tech Conference",
          description: "The largest tech conference in the city, featuring speakers from leading tech companies. Join us for a day of learning, networking, and innovation. The event will feature keynote presentations, panel discussions, workshops, and networking opportunities.\n\nHighlights include:\n- Keynote speech by industry leaders\n- Panel discussions on emerging technologies\n- Hands-on workshops\n- Networking opportunities\n- Product showcases",
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
        };
        
        // Simulate API delay
        setTimeout(() => {
          setEvent(mockEvent);
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error fetching event:", error);
        toast({
          title: "Error",
          description: "Failed to load event details",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    fetchEvent();
  }, [match, params?.id, navigate, toast]);

  const formatEventTime = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.name,
        text: `Check out this event: ${event?.name}`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          toast({
            title: "Link Copied",
            description: "Event link copied to clipboard",
          });
        })
        .catch((err) => {
          console.error('Failed to copy: ', err);
        });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-500 hover:bg-green-600';
      case 'ongoing':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'completed':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'cancelled':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-primary hover:bg-primary/90';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
        <p className="text-muted-foreground mb-6">
          The event you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => navigate('/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  const isSoldOut = event.registeredAttendees >= event.capacity;
  const isUnavailable = event.status !== 'upcoming';

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Image */}
      <div 
        className="h-64 md:h-80 w-full bg-cover bg-center relative"
        style={{ backgroundImage: `url(${event.imageUrl || ''})` }}
      >
        <div className="absolute inset-0 bg-black/50 flex items-end p-6">
          <div className="w-full max-w-6xl mx-auto text-white">
            <Badge className={`mb-2 ${getStatusBadgeColor(event.status)}`}>
              {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.name}</h1>
            <p className="text-white/80">{event.organizer}</p>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="flex-grow w-full max-w-6xl mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" onClick={() => navigate('/events')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
              <Button variant="outline" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
            
            {/* Event info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="flex items-center p-4">
                  <Calendar className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatEventTime(event.date)}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <Clock className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">{event.time}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <MapPin className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{event.location}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <Users className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Attendees</p>
                    <p className="font-medium">{event.registeredAttendees} / {event.capacity}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <DollarSign className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium">${event.price.toFixed(2)}</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="flex items-center p-4">
                  <Tag className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{event.category}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Event</h2>
              <div className="prose max-w-none">
                {event.description.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">{paragraph}</p>
                ))}
              </div>
            </div>
            
            {/* Booking alerts */}
            {isSoldOut && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Sold Out</AlertTitle>
                <AlertDescription>
                  This event has reached its maximum capacity. Please check back later as spots may open up if there are cancellations.
                </AlertDescription>
              </Alert>
            )}
            
            {isUnavailable && !isSoldOut && (
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertTitle>Not Available for Booking</AlertTitle>
                <AlertDescription>
                  This event is {event.status} and no longer accepting new bookings.
                </AlertDescription>
              </Alert>
            )}
          </div>
          
          {/* Sidebar / Booking */}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-card border rounded-lg p-6 sticky top-6">
              <h3 className="text-xl font-bold mb-4">Book Tickets</h3>
              
              {!user ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    You need to be logged in to book tickets for this event.
                  </p>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/auth')}
                  >
                    Sign In to Book
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between items-center font-medium">
                    <span>Price per ticket:</span>
                    <span>${event.price.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>Available tickets:</span>
                    <span>{event.capacity - event.registeredAttendees} of {event.capacity}</span>
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    className="w-full" 
                    onClick={() => setIsBookingModalOpen(true)} 
                    disabled={isSoldOut || isUnavailable}
                  >
                    <Ticket className="h-4 w-4 mr-2" />
                    {isSoldOut ? 'Sold Out' : isUnavailable ? 'Unavailable' : 'Book Now'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Secure checkout • Instant confirmation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Booking Modal */}
      {event && (
        <BookEventModal
          event={event}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          onSuccess={() => {
            toast({
              title: "Booking Successful",
              description: `Your tickets for ${event.name} have been booked!`,
            });
          }}
        />
      )}
    </div>
  );
}