import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Plus, Pencil, Trash2, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Venue } from "@shared/schema";

export default function VenueList() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [venueToDelete, setVenueToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Check for admin status
  useEffect(() => {
    // Read from localStorage
    const storedRole = localStorage.getItem("userRole");
    if (storedRole === "admin") {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
    
    // In a real app, we would uncomment this to use the auth context
    // if (auth.user?.role === "admin") {
    //   setIsAdmin(true);
    // }
  }, []);

  // Fetch venues
  const { 
    data: venues,
    isLoading,
    error,
    refetch
  } = useQuery<Venue[]>({
    queryKey: ["/api/venues"]
    // Not providing a custom queryFn - using the default fetcher from queryClient
  });

  // Handle venue deletion
  async function handleDeleteVenue() {
    if (!venueToDelete) return;
    
    setIsDeleting(true);
    try {
      await apiRequest("DELETE", `/api/venues/${venueToDelete}`);
      
      toast({
        title: "Venue Deleted",
        description: "The venue has been removed successfully",
      });
      
      // Refresh the venues list
      refetch();
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast({
        title: "Error",
        description: "Failed to delete venue",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setVenueToDelete(null);
    }
  }

  // Handle view details
  function handleViewDetails(id: number) {
    navigate(`/venues/${id}`);
  }

  // Handle edit venue
  function handleEditVenue(id: number) {
    navigate(`/venues/edit/${id}`);
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-10">
        <p className="text-red-500 mb-4">Error loading venues</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Venues</h1>
        {isAdmin && (
          <Button onClick={() => navigate("/venues/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Add New Venue
          </Button>
        )}
      </div>

      {venues && venues.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {venues.map((venue) => (
            <Card key={venue.id} className="overflow-hidden">
              {venue.image && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle>{venue.name}</CardTitle>
                <CardDescription>{venue.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p><strong>Capacity:</strong> {venue.capacity} people</p>
                  <p><strong>Price:</strong> ${venue.price}/hour</p>
                  {venue.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {venue.description}
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => handleViewDetails(venue.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Details
                </Button>
                {isAdmin && (
                  <div className="space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEditVenue(venue.id)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => setVenueToDelete(venue.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete {venue.name}? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setVenueToDelete(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={handleDeleteVenue}
                            disabled={isDeleting}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-10 border rounded-lg bg-background">
          <p className="text-muted-foreground mb-4">No venues found</p>
          {isAdmin && (
            <Button onClick={() => navigate("/venues/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Venue
            </Button>
          )}
        </div>
      )}
    </div>
  );
}