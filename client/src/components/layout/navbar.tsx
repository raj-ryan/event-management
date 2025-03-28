import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/ui/notification-bell";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, User } from "lucide-react";

export default function Navbar() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    } else if (user?.firstName) {
      return user.firstName[0];
    } else if (user?.username) {
      return user.username[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and brand name */}
          <div className="flex items-center">
            <div 
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => handleNavigation("/")}
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="ml-2 text-xl font-heading font-bold">EventZen</span>
            </div>

            {/* Desktop navigation links - show only if logged in */}
            {user && (
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <button
                  onClick={() => handleNavigation("/events")}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary"
                >
                  Events
                </button>
                <button
                  onClick={() => handleNavigation("/venues")}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary"
                >
                  Venues
                </button>
                <button
                  onClick={() => handleNavigation("/dashboard")}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-foreground hover:text-primary border-b-2 border-transparent hover:border-primary"
                >
                  Dashboard
                </button>
              </div>
            )}
          </div>

          {/* User actions section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Notification bell */}
                <NotificationBell />

                {/* User menu (desktop) */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="flex items-center">
                    <Avatar 
                      className="h-8 w-8 cursor-pointer"
                      onClick={() => handleNavigation("/dashboard")}
                    >
                      <AvatarImage
                        src={`https://ui-avatars.com/api/?name=${user.firstName || ''} ${user.lastName || ''}&background=random`}
                        alt={user.username}
                      />
                      <AvatarFallback>{getInitials()}</AvatarFallback>
                    </Avatar>
                    <span className="ml-2 text-sm font-medium hidden lg:block">
                      {user.firstName || user.username}
                    </span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>

                {/* Mobile menu */}
                <div className="md:hidden">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Menu className="h-6 w-6" />
                      </Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Menu</SheetTitle>
                        <SheetDescription>
                          <div className="flex items-center mt-4 mb-6">
                            <Avatar>
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?name=${user.firstName || ''} ${user.lastName || ''}&background=random`}
                                alt={user.username}
                              />
                              <AvatarFallback>{getInitials()}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="text-sm font-medium">
                                {user.firstName
                                  ? `${user.firstName} ${user.lastName || ""}`
                                  : user.username}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </SheetDescription>
                      </SheetHeader>
                      <div className="py-4 space-y-4">
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigation("/dashboard")}
                        >
                          Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigation("/events")}
                        >
                          Events
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigation("/venues")}
                        >
                          Venues
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => handleNavigation("/bookings")}
                        >
                          My Bookings
                        </Button>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-destructive"
                          onClick={handleLogout}
                        >
                          Logout
                        </Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </>
            ) : (
              <>
                {/* Login and Signup buttons for guests */}
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => handleNavigation("/auth")}
                >
                  Login
                </Button>
                <Button onClick={() => handleNavigation("/auth")}>Sign Up</Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
