import { Star, Users, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface VenueCardProps {
  venue: any;
}

export default function VenueCard({ venue }: VenueCardProps) {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

  // Generate random rating for demo purposes
  // In a real app, this would come from the venue data
  const rating = venue.rating || 4.7 + (Math.random() * 0.3);
  const reviewCount = venue.reviewCount || Math.floor(Math.random() * 50) + 10;

  // Format amenities for display
  const amenities = venue.amenities || ["WiFi", "Parking", "Catering", "AV Equipment"];

  const handleViewEvents = () => {
    navigate(`/events?venueId=${venue.id}`);
  };

  return (
    <>
      <Card className="bg-background rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300">
        {/* Venue image */}
        <div className="h-64 w-full overflow-hidden">
          <img
            className="w-full h-full object-cover"
            src={venue.image || `https://source.unsplash.com/random/800x500/?venue,event-space,${venue.name.toLowerCase().replace(/\s/g, '-')}`}
            alt={venue.name}
          />
        </div>
        
        <CardContent className="p-5">
          <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
          
          {/* Ratings */}
          <div className="flex items-center mb-3">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
              />
            ))}
            <span className="ml-2 text-sm text-muted-foreground">
              {rating.toFixed(1)} ({reviewCount} reviews)
            </span>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
            {venue.description || 
              "Modern venue with excellent amenities, perfect for corporate events, weddings, and social gatherings."}
          </p>
          
          {/* Capacity and action buttons */}
          <div className="flex justify-between items-center">
            <div>
              <span className="text-sm text-muted-foreground">Capacity:</span>
              <span className="font-semibold ml-1">{venue.capacity} people</span>
            </div>
            <Button 
              variant="ghost" 
              className="text-primary hover:text-primary-dark font-medium text-sm"
              onClick={() => setIsDetailsDialogOpen(true)}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Venue Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{venue.name}</DialogTitle>
            <DialogDescription>
              <div className="flex items-center mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} 
                  />
                ))}
                <span className="ml-2 text-sm">
                  {rating.toFixed(1)} ({reviewCount} reviews)
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="rounded-md overflow-hidden h-48 mb-4">
              <img
                className="w-full h-full object-cover"
                src={venue.image || `https://source.unsplash.com/random/800x500/?venue,event-space,${venue.name.toLowerCase().replace(/\s/g, '-')}`}
                alt={venue.name}
              />
            </div>
            
            <p className="mb-4">
              {venue.description || 
                "This elegant venue offers modern amenities and versatile spaces perfect for corporate events, weddings, and social gatherings. With state-of-the-art facilities and professional staff, your event is guaranteed to be a success."}
            </p>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium mb-2">Capacity</h4>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{venue.capacity} people</span>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Price</h4>
                <div className="flex items-center">
                  <span className="font-semibold">${venue.price.toFixed(2)}</span>
                  <span className="text-muted-foreground text-sm ml-1">/ day</span>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Amenities</h4>
              <div className="flex flex-wrap gap-2">
                {amenities.map((amenity) => (
                  <Badge variant="outline" key={amenity}>{amenity}</Badge>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium mb-2">Address</h4>
              <p className="text-muted-foreground">
                {venue.address || "123 Event Street, San Francisco, CA 94105"}
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={handleViewEvents}>
              View Events <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
