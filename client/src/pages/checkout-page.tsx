import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
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
import { format } from "date-fns";

// Importing necessary Stripe components
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY || "pk_test_your_key_here"
);

function CheckoutForm({ booking }) {
  const [_, navigate] = useLocation();
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const paymentMutation = useMutation({
    mutationFn: async (paymentIntentId: string) => {
      return apiRequest("POST", "/api/process-payment", {
        bookingId: booking.id,
        stripePaymentId: paymentIntentId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      setPaymentSuccess(true);
      toast({
        title: "Payment successful!",
        description: "Your booking has been confirmed.",
      });
    },
    onError: (error) => {
      toast({
        title: "Payment processing failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError("");

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (error) {
      setPaymentError(error.message || "An error occurred during payment");
      setIsProcessing(false);
    } else if (paymentIntent && paymentIntent.status === "succeeded") {
      // Payment succeeded, update booking status
      paymentMutation.mutate(paymentIntent.id);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-muted-foreground mb-6">
          Your booking has been confirmed and you're all set to attend the event.
        </p>
        <div className="space-x-4">
          <Button onClick={() => navigate("/bookings")}>View My Bookings</Button>
          <Button variant="outline" onClick={() => navigate("/events")}>
            Browse More Events
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {paymentError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative flex items-center" role="alert">
          <AlertTriangle className="h-5 w-5 mr-2" />
          <span>{paymentError}</span>
        </div>
      )}
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${booking?.totalAmount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function CheckoutPage() {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  // Fetch booking details
  const { data: booking, isLoading: isBookingLoading } = useQuery({
    queryKey: ["/api/bookings", bookingId],
    queryFn: async () => {
      const bookings = await fetch("/api/bookings").then(res => res.json());
      const booking = bookings.find(b => b.id === parseInt(bookingId));
      if (!booking) throw new Error("Booking not found");
      return booking;
    },
    enabled: !!bookingId,
  });

  // Fetch event details for the booking
  const { data: event, isLoading: isEventLoading } = useQuery({
    queryKey: ["/api/events", booking?.eventId],
    queryFn: async () => {
      const events = await fetch("/api/events").then(res => res.json());
      const event = events.find(e => e.id === booking.eventId);
      if (!event) throw new Error("Event not found");
      return event;
    },
    enabled: !!booking,
  });

  // Create payment intent when booking is loaded
  useEffect(() => {
    if (booking && booking.paymentStatus !== "paid") {
      const createPaymentIntent = async () => {
        try {
          const response = await apiRequest("POST", "/api/create-payment-intent", {
            bookingId: booking.id,
          });
          const data = await response.json();
          setClientSecret(data.clientSecret);
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to initialize payment. Please try again.",
            variant: "destructive",
          });
        }
      };

      createPaymentIntent();
    } else if (booking && booking.paymentStatus === "paid") {
      toast({
        title: "Already Paid",
        description: "This booking has already been paid for.",
      });
      navigate("/bookings");
    }
  }, [booking, toast, navigate]);

  const isLoading = isBookingLoading || isEventLoading || !clientSecret;

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
            <div className="max-w-3xl mx-auto px-4 sm:px-6 md:px-8">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Complete your payment to confirm your booking.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Payment form */}
                  <div className="md:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Payment Details</CardTitle>
                        <CardDescription>
                          Enter your card information to complete the purchase
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Elements 
                          stripe={stripePromise} 
                          options={{ clientSecret, appearance: { theme: 'stripe' } }}
                        >
                          <CheckoutForm booking={booking} />
                        </Elements>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Order summary */}
                  <div className="md:col-span-1">
                    <Card>
                      <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-semibold text-foreground">{event?.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {event?.date && format(new Date(event.date), "MMMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        
                        <div className="border-t pt-4">
                          <div className="flex justify-between mb-2">
                            <span>Tickets</span>
                            <span>{booking.ticketCount} x ${event?.price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>${booking.totalAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="bg-muted/50 text-xs text-muted-foreground">
                        <p>
                          Your card will be charged immediately. Refunds are available 
                          up to 48 hours before the event start time.
                        </p>
                      </CardFooter>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
