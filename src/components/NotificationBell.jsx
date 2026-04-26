import React, { useState, useEffect, useContext, useRef } from 'react';
import { Bell, Check, Clock } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { notificationApi } from '@/utils/api/notificationApi';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const NotificationBell = () => {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  const fetchNotifications = async () => {
    if (!user?.id) return;
    try {
      const data = await notificationApi.getUserNotifications(user.id);
      setNotifications(data || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (notifId) => {
    try {
      await notificationApi.markAsRead(notifId);
      setNotifications(prev => 
        prev.map(n => n.notifId === notifId ? { ...n, read: true } : n)
      );
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    const unread = notifications.filter(n => !n.read);
    if (unread.length === 0) return;

    try {
      await Promise.all(unread.map(n => notificationApi.markAsRead(n.notifId)));
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to mark all as read");
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        className="relative hover:bg-slate-100 dark:hover:bg-slate-800"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-semibold text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 text-primary hover:text-primary/80 p-0"
                onClick={handleMarkAllAsRead}
              >
                Mark all as read
              </Button>
            )}
          </div>
          <Separator />
          
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notif) => (
                <div 
                  key={notif.notifId}
                  className={`p-4 border-b last:border-b-0 flex gap-3 transition-colors ${!notif.read ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                  onClick={() => !notif.read && handleMarkAsRead(notif.notifId)}
                >
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${!notif.read ? 'bg-primary' : 'bg-transparent'}`} />
                  <div className="flex flex-col gap-1 flex-1">
                    <p className={`text-sm ${!notif.read ? 'font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="h-3 w-3" />
                      {new Date(notif.date).toLocaleString()}
                    </div>
                  </div>
                  {!notif.read && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.notifId);
                      }}
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
          
          <Separator />
          <div className="p-2 text-center bg-slate-50 dark:bg-slate-800/50">
             <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500" onClick={() => setIsOpen(false)}>
               Close
             </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
