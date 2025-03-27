import { CalendarClock, CreditCard, Bell } from "lucide-react";

export default function FeatureSection() {
  return (
    <div className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-heading mb-4">Why Choose EventZen?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Everything you need to plan and manage successful events, all in one platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-5">
              <CalendarClock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Easy Planning</h3>
            <p className="text-muted-foreground">
              Create and manage events with an intuitive interface. Track all details in one place.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-5">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure Payments</h3>
            <p className="text-muted-foreground">
              Process ticket sales and bookings with our secure payment system powered by Stripe.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full mx-auto flex items-center justify-center mb-5">
              <Bell className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-time Updates</h3>
            <p className="text-muted-foreground">
              Get instant notifications about bookings, changes, and important event updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
