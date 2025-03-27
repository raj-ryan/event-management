import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function CheckoutPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  return (
    <div className="flex flex-col items-center min-h-screen p-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
            <p className="text-muted-foreground">
              Complete your booking
            </p>
          </div>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
        </div>

        <div className="text-center p-12 border rounded-lg bg-white shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Payment System Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Our payment processing system is currently being set up. Check back soon!
          </p>
          <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}