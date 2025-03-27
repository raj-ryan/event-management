import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import Sidebar from "@/components/layout/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import {
  CalendarCheck,
  DollarSign,
  Users,
  FileText,
  MoreVertical,
  Clock
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch user's events
  const { data: events = [] } = useQuery({
    queryKey: ["/api/events"],
  });

  // Fetch user's bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
  });

  // Calculate stats
  const upcomingEventsCount = events.filter(
    (event) => new Date(event.date) > new Date()
  ).length;

  const totalTicketSales = bookings.reduce(
    (sum, booking) => sum + booking.totalAmount,
    0
  );

  const totalAttendees = bookings.reduce(
    (sum, booking) => sum + booking.ticketCount,
    0
  );

  const activeBookingsCount = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;

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
                  <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Welcome back, <span className="font-medium">{user?.firstName || user?.username}</span>! Here's what's happening with your events.
                  </p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button onClick={() => navigate("/events")}>
                    Create New Event
                  </Button>
                </div>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-primary/10 rounded-md p-3">
                        <CalendarCheck className="h-6 w-6 text-primary" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Upcoming Events
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-foreground">
                              {upcomingEventsCount}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-secondary/10 rounded-md p-3">
                        <DollarSign className="h-6 w-6 text-secondary" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Ticket Sales
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-foreground">
                              ${totalTicketSales.toFixed(2)}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                        <Users className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Total Attendees
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-foreground">
                              {totalAttendees}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-100 rounded-md p-3">
                        <FileText className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-muted-foreground truncate">
                            Active Bookings
                          </dt>
                          <dd>
                            <div className="text-lg font-medium text-foreground">
                              {activeBookingsCount}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upcoming Events */}
              <h2 className="text-lg font-medium text-foreground mb-4">
                Upcoming Events
              </h2>
              <Card className="mb-8">
                {events.length > 0 ? (
                  <ul className="divide-y divide-border">
                    {events.slice(0, 3).map((event) => (
                      <li key={event.id}>
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 bg-primary bg-opacity-10 rounded-md flex flex-col items-center justify-center">
                                <span className="text-primary font-medium text-lg">
                                  {new Date(event.date).getDate()}
                                </span>
                                <span className="text-primary text-xs">
                                  {new Date(event.date).toLocaleString("default", {
                                    month: "short",
                                  })}
                                </span>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-foreground">{event.name}</p>
                                <div className="flex items-center mt-1">
                                  <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground" />
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(event.date).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center mt-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="flex-shrink-0 mr-1.5 h-4 w-4 text-muted-foreground"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                    />
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                  </svg>
                                  <p className="text-xs text-muted-foreground">
                                    {event.location}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Confirmed
                              </span>
                              <button className="ml-4 text-muted-foreground hover:text-foreground">
                                <MoreVertical className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No upcoming events found.</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => navigate("/events")}
                    >
                      Create your first event
                    </Button>
                  </div>
                )}
              </Card>

              {/* Recent Transactions */}
              <h2 className="text-lg font-medium text-foreground mb-4">
                Recent Transactions
              </h2>
              <Card>
                {bookings.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50">
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            Event
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            Date
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            Amount
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {bookings.slice(0, 3).map((booking) => {
                          const event = events.find(e => e.id === booking.eventId);
                          return (
                            <tr key={booking.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-foreground">
                                  {event?.name || "Event"}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Ticket #{booking.id}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-foreground">
                                  {new Date(booking.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-foreground">
                                  ${booking.totalAmount.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    booking.status === "confirmed"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-yellow-100 text-yellow-800"
                                  }`}
                                >
                                  {booking.status === "confirmed" ? "Completed" : "Pending"}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <p className="text-muted-foreground">No transactions found.</p>
                    <Button
                      className="mt-4"
                      variant="outline"
                      onClick={() => navigate("/events")}
                    >
                      Browse events
                    </Button>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
