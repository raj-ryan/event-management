import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Venue form schema
const venueFormSchema = z.object({
  name: z.string().min(1, "Venue name is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  capacity: z.coerce.number().min(1, "Capacity must be greater than 0"),
  price: z.coerce.number().min(0, "Price must be at least 0"),
  description: z.string().optional(),
  image: z.string().optional(),
  amenitiesInput: z.string().optional(),
});

type VenueFormValues = z.infer<typeof venueFormSchema>;

export default function VenueForm() {
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [venueId, setVenueId] = useState<number | null>(null);
  const [match, params] = useRoute<{ id: string }>("/venues/edit/:id");
  const isEditMode = match && params.id;

  // Form setup
  const form = useForm<VenueFormValues>({
    resolver: zodResolver(venueFormSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      capacity: undefined,
      price: undefined,
      description: "",
      image: "",
      amenitiesInput: "",
    },
  });

  // Fetch venue data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      setIsSubmitting(true);
      apiRequest("GET", `/api/venues/${params.id}`)
        .then((res) => res.json())
        .then((venue) => {
          setVenueId(venue.id);
          form.reset({
            name: venue.name,
            address: venue.address,
            city: venue.city || "",
            state: venue.state || "",
            zipCode: venue.zipCode || "",
            capacity: venue.capacity,
            price: venue.price,
            description: venue.description || "",
            image: venue.image || "",
            amenitiesInput: venue.amenities ? venue.amenities.join(", ") : "",
          });
          setIsSubmitting(false);
        })
        .catch((error) => {
          console.error("Error fetching venue:", error);
          toast({
            title: "Error",
            description: "Failed to load venue details",
            variant: "destructive",
          });
          setIsSubmitting(false);
        });
    }
  }, [isEditMode, params?.id, form]);

  async function onSubmit(values: VenueFormValues) {
    setIsSubmitting(true);
    try {
      const method = isEditMode ? "PUT" : "POST";
      const url = isEditMode ? `/api/venues/${params.id}` : "/api/venues";
      
      // Convert amenitiesInput to an array
      const amenities = values.amenitiesInput 
        ? values.amenitiesInput.split(',').map(item => item.trim()).filter(Boolean)
        : [];
      
      // Prepare data for submission
      const venueData = {
        ...values,
        amenities,
      };
      
      // Remove amenitiesInput since it's not part of the venue schema
      delete (venueData as any).amenitiesInput;
      
      const response = await apiRequest(method, url, venueData);
      const venue = await response.json();
      
      toast({
        title: isEditMode ? "Venue Updated" : "Venue Created",
        description: isEditMode 
          ? `${venue.name} has been updated successfully`
          : `${venue.name} has been created successfully`,
      });
      
      // Redirect to venues list
      navigate("/venues");
    } catch (error) {
      console.error("Error submitting venue:", error);
      toast({
        title: "Error",
        description: isEditMode 
          ? "Failed to update venue" 
          : "Failed to create venue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-10 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{isEditMode ? "Edit Venue" : "Add New Venue"}</CardTitle>
          <CardDescription>
            {isEditMode 
              ? "Update venue information" 
              : "Fill in the details to create a new venue"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter venue name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Maximum capacity" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price per Hour ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Hourly rate" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter venue description" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="amenitiesInput"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amenities</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="WiFi, Projector, Catering, etc. (comma separated)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter amenities separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="Image URL for the venue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/venues")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{isEditMode ? "Update Venue" : "Create Venue"}</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}