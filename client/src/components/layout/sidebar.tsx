import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Calendar,
  Home,
  LogOut,
  MapPin,
  Menu,
  MessageSquare,
  Settings,
  ShoppingBag,
  User,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import NotificationBell from "@/components/ui/notification-bell";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (isOpen: boolean) => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Events", href: "/events", icon: Calendar },
  { name: "Venues", href: "/venues", icon: MapPin },
  { name: "My Bookings", href: "/bookings", icon: ShoppingBag },
  { name: "Messages", href: "/messages", icon: MessageSquare, badge: 3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: SidebarProps) {
  const [currentPath, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  useEffect(() => {
    // Close mobile menu when navigating
    setIsMobileMenuOpen(false);
  }, [currentPath, setIsMobileMenuOpen]);

  // Display initials in avatar fallback
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
    <>
      {/* Mobile menu backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* Sidebar for desktop and mobile */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar-background shadow-lg transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Header with logo */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border bg-white">
          <div className="flex items-center flex-1">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">E</span>
            </div>
            <span className="ml-2 text-xl font-heading font-bold">EventZen</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation links */}
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <div className="flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = currentPath === item.href;
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.href);
                    }}
                    className={cn(
                      "nav-item flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors",
                      isActive
                        ? "active text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent/50"
                    )}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                    {item.badge && (
                      <span className="ml-auto bg-secondary text-white text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </a>
                );
              })}
            </nav>
          </div>

          {/* User profile section */}
          <div className="p-4 border-t border-sidebar-border">
            <div className="flex items-center">
              <Avatar>
                <AvatarImage 
                  src={`https://ui-avatars.com/api/?name=${user?.firstName || ''} ${user?.lastName || ''}&background=random`}
                  alt={user?.username || "User"}
                />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName
                    ? `${user.firstName} ${user.lastName || ""}`
                    : user?.username}
                </p>
                <p className="text-xs font-medium text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                title="Log out"
              >
                <LogOut className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="fixed bottom-6 right-6 z-30 md:hidden">
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-lg"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </>
  );
}
