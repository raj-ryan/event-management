import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function BookingsPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // Fetch bookings
  const { data: bookings = [], isLoading: isBookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Fetch events to get details for each booking
  const { data: events = [], isLoading: isEventsLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const isLoading = isBookingsLoading || isEventsLoading;

  // Enrich bookings with event data
  const enrichedBookings = bookings.map((booking) => {
    const event = events.find((e) => e.id === booking.eventId);
    return { ...booking, event };
  });

  // Filter bookings by status
  const upcomingBookings = enrichedBookings.filter(
    (booking) =>
      booking.event &&
      new Date(booking.event.date) > new Date() &&
      booking.status !== "cancelled"
  );

  const pastBookings = enrichedBookings.filter(
    (booking) =>
      booking.event &&
      (new Date(booking.event.date) <= new Date() || booking.status === "cancelled")
  );

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      await apiRequest("PUT", `/api/bookings/${selectedBooking.id}`, {
        status: "cancelled",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });

      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully.",
      });

      setIsCancelDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    }
  };

  const proceedToCheckout = (booking) => {
    if (booking.paymentStatus === "paid") {
      toast({
        title: "Already Paid",
        description: "This booking has already been paid for.",
      });
      return;
    }

    navigate(`/checkout/${booking.id}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Mobile header */}
        <header className="bg-white shadow-sm flex items-center h-16 md:hidden">
          <div className="flex items-center px-4">
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="ml-4 flex items-center">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="ml-2 text-lg font-heading font-bold">
                EventZen
              </span>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    My Bookings
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    View and manage your event bookings.
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button onClick={() => navigate("/events")}>
                    Browse Events
                  </Button>
                </div>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardHeader className="h-24 bg-muted"></CardHeader>
                      <CardContent className="h-32 bg-muted mt-4"></CardContent>
                      <CardFooter className="h-12 bg-muted mt-4"></CardFooter>
                    </Card>
                  ))}
                </div>
              ) : enrichedBookings.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    You don't have any bookings yet.
                  </p>
                  <Button onClick={() => navigate("/events")}>
                    Browse Events
                  </Button>
                </div>
              ) : (
                <Tabs defaultValue="upcoming" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="upcoming">
                      Upcoming ({upcomingBookings.length})
                    </TabsTrigger>
                    <TabsTrigger value="past">
                      Past ({pastBookings.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upcoming" className="space-y-4">
                    {upcomingBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No upcoming bookings found.
                        </p>
                      </div>
                    ) : (
                      upcomingBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{booking.event?.name}</CardTitle>
                                <CardDescription>
                                  {booking.event?.date &&
                                    format(
                                      new Date(booking.event.date),
                                      "EEEE, MMMM d, yyyy 'at' h:mm a"
                                    )}
                                </CardDescription>
                              </div>
                              <div className="flex space-x-2">
                                <Badge
                                  variant={
                                    booking.status === "confirmed"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {booking.status === "confirmed"
                                    ? "Confirmed"
                                    : "Pending"}
                                </Badge>
                                <Badge
                                  variant={
                                    booking.paymentStatus === "paid"
                                      ? "success"
                                      : "secondary"
                                  }
                                >
                                  {booking.paymentStatus === "paid"
                                    ? "Paid"
                                    : "Unpaid"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p>
                                <span className="font-medium">Tickets:</span>{" "}
                                {booking.ticketCount}
                              </p>
                              <p>
                                <span className="font-medium">Total:</span> $
                                {booking.totalAmount.toFixed(2)}
                              </p>
                              <p>
                                <span className="font-medium">Booked on:</span>{" "}
                                {format(
                                  new Date(booking.createdAt),
                                  "MMMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </CardContent>
                          <CardFooter className="flex justify-between">
                            <Button
                              variant="outline"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setIsCancelDialogOpen(true);
                              }}
                            >
                              Cancel Booking
                            </Button>
                            {booking.paymentStatus !== "paid" && (
                              <Button
                                onClick={() => proceedToCheckout(booking)}
                              >
                                Pay Now
                              </Button>
                            )}
                          </CardFooter>
                        </Card>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="past" className="space-y-4">
                    {pastBookings.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">
                          No past bookings found.
                        </p>
                      </div>
                    ) : (
                      pastBookings.map((booking) => (
                        <Card key={booking.id}>
                          <CardHeader>
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle>{booking.event?.name}</CardTitle>
                                <CardDescription>
                                  {booking.event?.date &&
                                    format(
                                      new Date(booking.event.date),
                                      "EEEE, MMMM d, yyyy 'at' h:mm a"
                                    )}
                                </CardDescription>
                              </div>
                              <div className="flex space-x-2">
                                <Badge
                                  variant={
                                    booking.status === "cancelled"
                                      ? "destructive"
                                      : booking.status === "confirmed"
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {booking.status === "cancelled"
                                    ? "Cancelled"
                                    : booking.status === "confirmed"
                                    ? "Attended"
                                    : "Pending"}
                                </Badge>
                                <Badge
                                  variant={
                                    booking.paymentStatus === "paid"
                                      ? "success"
                                      : "secondary"
                                  }
                                >
                                  {booking.paymentStatus === "paid"
                                    ? "Paid"
                                    : "Unpaid"}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <p>
                                <span className="font-medium">Tickets:</span>{" "}
                                {booking.ticketCount}
                              </p>
                              <p>
                                <span className="font-medium">Total:</span> $
                                {booking.totalAmount.toFixed(2)}
                              </p>
                              <p>
                                <span className="font-medium">Booked on:</span>{" "}
                                {format(
                                  new Date(booking.createdAt),
                                  "MMMM d, yyyy"
                                )}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Cancel Booking Confirmation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedBooking && selectedBooking.event && (
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Event:</span>{" "}
                  {selectedBooking.event.name}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {format(
                    new Date(selectedBooking.event.date),
                    "MMMM d, yyyy 'at' h:mm a"
                  )}
                </p>
                <p>
                  <span className="font-medium">Tickets:</span>{" "}
                  {selectedBooking.ticketCount}
                </p>
                <p>
                  <span className="font-medium">Total:</span> $
                  {selectedBooking.totalAmount.toFixed(2)}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelDialogOpen(false)}
            >
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
            >
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
