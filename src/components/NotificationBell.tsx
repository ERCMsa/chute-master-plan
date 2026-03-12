import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { getNotificationsForRole, getUnreadCount, markAsRead, markAllAsRead, Notification } from '@/lib/notifications';
import { formatDistanceToNow } from 'date-fns';

const TYPE_ICONS: Record<string, string> = {
  request_created: '📋',
  request_approved: '✅',
  request_delivered: '🚚',
  request_cancelled: '❌',
  chute_added: '➕',
  excel_import: '📊',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    if (!user) return;
    setNotifications(getNotificationsForRole(user.role));
    setUnread(getUnreadCount(user.role));
  }, [user]);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const handleMarkAllRead = () => {
    markAllAsRead();
    refresh();
  };

  const handleClick = (id: string) => {
    markAsRead(id);
    refresh();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-industrial-steel hover:text-secondary-foreground hover:bg-sidebar-accent">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
          {unread > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-7" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[320px]">
          {notifications.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">No notifications</p>
          ) : (
            notifications.slice(0, 20).map(n => (
              <div
                key={n.id}
                onClick={() => handleClick(n.id)}
                className={`p-3 border-b cursor-pointer transition-colors hover:bg-accent/50 ${!n.read ? 'bg-accent/20' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-lg">{TYPE_ICONS[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? 'font-semibold' : ''} text-foreground`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                    </p>
                  </div>
                  {!n.read && <span className="h-2 w-2 bg-primary rounded-full mt-1.5 shrink-0" />}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
