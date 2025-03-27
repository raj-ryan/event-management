import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use WebSocket hook for real-time notifications
  const { notifications: wsNotifications, markNotificationAsRead } = useWebSocket();
  
  // Query existing notifications
  const { data: fetchedNotifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    staleTime: 1000 * 60, // 1 minute
  });
  
  // Combine fetched and WebSocket notifications
  const [allNotifications, setAllNotifications] = useState([]);
  
  useEffect(() => {
    // Combine and deduplicate notifications
    const combined = [...wsNotifications, ...fetchedNotifications];
    const uniqueNotifications = Array.from(
      new Map(combined.map(item => [item.id, item])).values()
    );
    
    // Sort by date, newest first
    uniqueNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    setAllNotifications(uniqueNotifications);
  }, [fetchedNotifications, wsNotifications]);
  
  // Count unread notifications
  const unreadCount = allNotifications.filter(n => !n.read).length;
  
  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.id);
    }
  };
  
  // Format notification time
  const formatNotificationTime = (date) => {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(notificationDate, "h:mm a");
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return format(notificationDate, "MMM d");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Badge variant="secondary">{unreadCount} New</Badge>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-80">
          {allNotifications.length > 0 ? (
            <div className="divide-y">
              {allNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 flex items-start cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notification.read ? "bg-muted/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-primary mr-3 flex-shrink-0">
                    {!notification.read && <span className="sr-only">Unread</span>}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatNotificationTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          )}
        </ScrollArea>
        
        <div className="p-4 border-t flex justify-center">
          <Button variant="link" className="w-full text-sm" onClick={() => setIsOpen(false)}>
            Mark all as read
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
