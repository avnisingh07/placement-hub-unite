
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationManagerProps {
  notifications: Notification[];
  onCreateNotification: (title: string, body: string, type: string) => Promise<void>;
}

export const NotificationManager = ({ notifications, onCreateNotification }: NotificationManagerProps) => {
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'general'
  });

  const handleCreateNotification = async () => {
    await onCreateNotification(
      newNotification.title,
      newNotification.body,
      newNotification.type
    );
    setNewNotification({ title: '', body: '', type: 'general' });
    setCreateNotificationOpen(false);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage system notifications</CardDescription>
        </div>
        <Dialog open={createNotificationOpen} onOpenChange={setCreateNotificationOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Create Notification
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Notification</DialogTitle>
              <DialogDescription>
                This notification will be sent to all students.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">Title</label>
                <Input 
                  id="title" 
                  placeholder="Notification title" 
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">Message</label>
                <Textarea 
                  id="message" 
                  placeholder="Write your message here..." 
                  rows={4}
                  value={newNotification.body}
                  onChange={(e) => setNewNotification({...newNotification, body: e.target.value})}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateNotificationOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateNotification}>Send Notification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {notifications && notifications.length > 0 ? (
          notifications.map(notification => (
            <div key={notification.id} className="border-b py-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <h3 className="font-medium">{notification.title}</h3>
                  <Badge variant="outline">{notification.type}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{notification.body}</p>
                <p className="text-xs text-muted-foreground">
                  Sent: {new Date(notification.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No notifications yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
