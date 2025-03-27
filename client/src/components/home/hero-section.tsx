import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();

  const handleExploreEvents = () => {
    navigate("/events");
  };

  const handleCreateAccount = () => {
    navigate("/auth");
  };

  return (
    <div className="bg-gradient-to-r from-primary-light to-primary pt-16 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white font-heading tracking-tight">
            Discover & Manage Events with Ease
          </h1>
          <p className="mt-4 text-xl text-white opacity-90 max-w-2xl mx-auto">
            Find the perfect venues, plan unforgettable events, and manage every detail in one platform.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100"
              onClick={handleExploreEvents}
            >
              Explore Events
            </Button>
            {!user && (
              <Button 
                className="bg-secondary hover:bg-secondary-dark"
                size="lg"
                onClick={handleCreateAccount}
              >
                Create Account
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
