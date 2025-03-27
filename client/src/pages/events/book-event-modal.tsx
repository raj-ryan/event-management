import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Ticket, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  phone: z.string().optional(),
  ticketCount: z.number().int().min(1, { message: "Must book at least one ticket" }),
});

type FormValues = z.infer<typeof formSchema>;

interface Event {
  id: number;
  name: string;
  price: number;
  capacity: number;
  registeredAttendees: number;
  date: string | Date;
  status: string;
}

interface BookEventModalProps {
  event: Event;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BookEventModal({ event, isOpen, onClose, onSuccess }: BookEventModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate available tickets
  const availableTickets = event.capacity - event.registeredAttendees;
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      ticketCount: 1,
    },
  });
  
  // Event booking mutation
  const bookEventMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Calculate total amount based on event price and ticket count
      const totalAmount = event.price * data.ticketCount;
      
      const bookingData = {
        eventId: event.id,
        ticketCount: data.ticketCount,
        totalAmount,
        attendees: [{
          firstName: data.name.split(' ')[0],
          lastName: data.name.split(' ').slice(1).join(' ') || '',
          email: data.email,
          phone: data.phone || null
        }]
      };
      
      const response = await apiRequest('POST', '/api/event-bookings', bookingData);
      return response.json();
    },
    onSuccess: () => {
      // Refresh bookings data
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/events', event.id] });
      
      // Show success notification
      toast({
        title: "Event Booked!",
        description: `You have successfully booked tickets for ${event.name}.`,
      });
      
      // Close the modal and reset form
      onClose();
      form.reset();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: error instanceof Error ? error.message : "Could not complete your booking",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = async (data: FormValues) => {
    // Validate that ticket count is not greater than available tickets
    if (data.ticketCount > availableTickets) {
      toast({
        title: "Invalid Ticket Count",
        description: `Only ${availableTickets} tickets are available for this event`,
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      await bookEventMutation.mutateAsync(data);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate ticket count options based on availability (max 10 or available tickets)
  const maxTickets = Math.min(10, availableTickets);
  const ticketOptions = Array.from({ length: maxTickets }, (_, i) => i + 1);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Tickets: {event.name}</DialogTitle>
          <DialogDescription>
            Fill out the details below to book tickets for this event.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="ticketCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Tickets</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={availableTickets}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>
                      Max: {availableTickets} tickets available
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      Name of the primary attendee
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="email@example.com" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Your confirmation and tickets will be sent here
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="tel" 
                        placeholder="(123) 456-7890" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      For urgent event updates
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-2" />
              
              <div className="bg-secondary/50 p-4 rounded-md space-y-2">
                <Label>Booking Summary</Label>
                <div className="grid grid-cols-2 gap-1 text-sm">
                  <div>Event:</div>
                  <div className="font-medium">{event.name}</div>
                  
                  <div>Date:</div>
                  <div className="font-medium">
                    {event.date instanceof Date 
                      ? event.date.toLocaleDateString() 
                      : new Date(event.date).toLocaleDateString()}
                  </div>
                  
                  <div>Price per ticket:</div>
                  <div className="font-medium">${event.price.toFixed(2)}</div>
                  
                  <div>Number of tickets:</div>
                  <div className="font-medium">{form.watch('ticketCount') || 1}</div>
                </div>
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center pt-1">
                  <div className="font-semibold">Total:</div>
                  <div className="font-bold text-lg">
                    ${((form.watch('ticketCount') || 1) * event.price).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting || availableTickets === 0} 
                className="w-full sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Proceed to Payment
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}