
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, BellOff, Calendar, CheckCheck, Clock, Edit, Filter, Pencil, Plus, Send, Trash, X } from "lucide-react";

// Mock data
const notificationsData = [
  {
    id: 1,
    title: "Campus Drive: TechCorp Inc.",
    description: "TechCorp will be conducting a campus drive on May 10th for Software Engineer and UX Designer positions.",
    date: "2025-04-18",
    type: "announcement",
    isRead: false
  },
  {
    id: 2,
    title: "Resume Workshop",
    description: "Join us for a resume building workshop on April 25th at 2:00 PM in the Main Auditorium.",
    date: "2025-04-15",
    type: "event",
    isRead: true
  },
  {
    id: 3,
    title: "Interview Preparation Session",
    description: "Mock interviews will be conducted on April 28th. Register through the student portal by April 25th.",
    date: "2025-04-10",
    type: "event",
    isRead: false
  },
  {
    id: 4,
    title: "Application Status: Frontend Developer Intern",
    description: "Your application for the Frontend Developer Intern position at TechCorp Inc. has been reviewed. You have been shortlisted for the interview round.",
    date: "2025-04-05",
    type: "application",
    isRead: true
  },
  {
    id: 5,
    title: "Deadline Reminder: Resume Submission",
    description: "This is a reminder that the deadline for submitting your updated resume is April 30th.",
    date: "2025-04-02",
    type: "reminder",
    isRead: false
  }
];

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'announcement':
      return <Bell className="text-blue-500" />;
    case 'event':
      return <Calendar className="text-green-500" />;
    case 'application':
      return <CheckCheck className="text-purple-500" />;
    case 'reminder':
      return <Clock className="text-amber-500" />;
    default:
      return <Bell className="text-gray-500" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'announcement':
      return "bg-blue-50 text-blue-700 border-blue-200";
    case 'event':
      return "bg-green-50 text-green-700 border-green-200";
    case 'application':
      return "bg-purple-50 text-purple-700 border-purple-200";
    case 'reminder':
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const Notifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(notificationsData);
  const [activeTab, setActiveTab] = useState("all");
  const [showEmailDigests, setShowEmailDigests] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState<any>(null);
  
  // Admin new notification form
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState("announcement");
  
  // Mark notification as read
  const markAsRead = (id: number) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, isRead: true } : notif
    ));
  };
  
  // Delete notification
  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    toast({
      title: "Notification deleted",
      description: "The notification has been removed from your list."
    });
  };
  
  // Create new notification (admin only)
  const createNotification = () => {
    if (!newTitle || !newDescription) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields."
      });
      return;
    }
    
    const newNotif = {
      id: Math.max(...notifications.map(n => n.id)) + 1,
      title: newTitle,
      description: newDescription,
      date: new Date().toISOString().split('T')[0],
      type: newType,
      isRead: false
    };
    
    setNotifications([newNotif, ...notifications]);
    setNewTitle("");
    setNewDescription("");
    setNewType("announcement");
    
    toast({
      title: "Notification created",
      description: "Your notification has been sent to all students."
    });
  };
  
  // Filter notifications based on active tab
  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notif.isRead;
    return notif.type === activeTab;
  });
  
  // Mark all as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    toast({
      title: "All notifications marked as read",
      description: "All your notifications have been marked as read."
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Stay updated with important announcements and reminders
          </p>
        </div>
        
        <div className="flex gap-2">
          {user?.role === "admin" && (
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  New Notification
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Notification</DialogTitle>
                  <DialogDescription>
                    Create a new notification to send to students
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title" 
                      value={newTitle} 
                      onChange={(e) => setNewTitle(e.target.value)} 
                      placeholder="e.g. Campus Drive Announcement"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <select 
                      id="type"
                      value={newType}
                      onChange={(e) => setNewType(e.target.value)}
                      className="w-full p-2 border border-input rounded-md"
                    >
                      <option value="announcement">Announcement</option>
                      <option value="event">Event</option>
                      <option value="reminder">Reminder</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      value={newDescription} 
                      onChange={(e) => setNewDescription(e.target.value)} 
                      placeholder="Enter notification details..."
                      rows={5}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button onClick={createNotification}>
                    <Send size={16} className="mr-2" />
                    Send Notification
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          
          <Button variant="outline" onClick={markAllAsRead}>
            <CheckCheck size={16} className="mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left side - Filters and Settings */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant={activeTab === "all" ? "default" : "outline"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("all")}
              >
                <Bell size={16} className="mr-2" />
                All Notifications
                <Badge variant="outline" className="ml-auto">
                  {notifications.length}
                </Badge>
              </Button>
              
              <Button 
                variant={activeTab === "unread" ? "default" : "outline"} 
                className="w-full justify-start"
                onClick={() => setActiveTab("unread")}
              >
                <BellOff size={16} className="mr-2" />
                Unread
                <Badge variant="outline" className="ml-auto">
                  {notifications.filter(n => !n.isRead).length}
                </Badge>
              </Button>
              
              <div className="pt-2 border-t">
                <h3 className="text-sm font-medium mb-2">Notification Types</h3>
                <div className="space-y-2">
                  <Button 
                    variant={activeTab === "announcement" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("announcement")}
                  >
                    <Bell size={16} className="mr-2 text-blue-500" />
                    Announcements
                  </Button>
                  
                  <Button 
                    variant={activeTab === "event" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("event")}
                  >
                    <Calendar size={16} className="mr-2 text-green-500" />
                    Events
                  </Button>
                  
                  <Button 
                    variant={activeTab === "application" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("application")}
                  >
                    <CheckCheck size={16} className="mr-2 text-purple-500" />
                    Applications
                  </Button>
                  
                  <Button 
                    variant={activeTab === "reminder" ? "default" : "outline"} 
                    className="w-full justify-start"
                    onClick={() => setActiveTab("reminder")}
                  >
                    <Clock size={16} className="mr-2 text-amber-500" />
                    Reminders
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-digests">Email Digests</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive daily email summaries
                  </p>
                </div>
                <Switch 
                  id="email-digests" 
                  checked={showEmailDigests} 
                  onCheckedChange={setShowEmailDigests} 
                />
              </div>
              
              <div className="pt-2 border-t space-y-2">
                <h3 className="text-sm font-medium">Manage Preferences</h3>
                <Button variant="outline" size="sm" className="w-full">
                  <Filter size={14} className="mr-2" />
                  Customize Notifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right side - Notifications List */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>
                {activeTab === "all" 
                  ? "All Notifications" 
                  : activeTab === "unread" 
                    ? "Unread Notifications" 
                    : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s`}
              </CardTitle>
              <CardDescription>
                {filteredNotifications.length} 
                {filteredNotifications.length === 1 ? " notification" : " notifications"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map(notification => (
                    <div 
                      key={notification.id} 
                      className={`border rounded-lg p-4 ${!notification.isRead ? "bg-gray-50" : ""} transition-colors hover:border-purple-300`}
                      onClick={() => {
                        markAsRead(notification.id);
                        setSelectedNotification(notification);
                      }}
                    >
                      <div className="flex gap-3">
                        <div className="mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between">
                            <h3 className={`font-medium ${!notification.isRead ? "font-semibold" : ""}`}>
                              {notification.title}
                            </h3>
                            <Badge 
                              variant="outline" 
                              className={`ml-2 ${getTypeColor(notification.type)}`}
                            >
                              {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formatDate(notification.date)}
                          </p>
                          <p className="text-sm mt-2 line-clamp-2">
                            {notification.description}
                          </p>
                          
                          <div className="flex justify-end mt-3">
                            {!notification.isRead && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <CheckCheck size={14} className="mr-1" />
                                Mark as read
                              </Button>
                            )}
                            
                            {user?.role === "admin" && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                              >
                                <Trash size={14} className="mr-1" />
                                Delete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <Bell size={40} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                    <p className="text-muted-foreground">
                      You don't have any {activeTab !== "all" && activeTab !== "unread" 
                        ? activeTab 
                        : ""} notifications {activeTab === "unread" ? "unread " : ""}at the moment.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={(open) => !open && setSelectedNotification(null)}>
        {selectedNotification && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <div className="flex items-center gap-2">
                {getNotificationIcon(selectedNotification.type)}
                <DialogTitle>{selectedNotification.title}</DialogTitle>
              </div>
              <div className="flex justify-between items-center">
                <DialogDescription>
                  {formatDate(selectedNotification.date)}
                </DialogDescription>
                <Badge 
                  variant="outline" 
                  className={getTypeColor(selectedNotification.type)}
                >
                  {selectedNotification.type.charAt(0).toUpperCase() + selectedNotification.type.slice(1)}
                </Badge>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <p>{selectedNotification.description}</p>
              
              {user?.role === "student" && selectedNotification.type !== "application" && (
                <div className="space-y-2 border-t pt-4">
                  <Label htmlFor="comment">Add a comment</Label>
                  <Textarea id="comment" placeholder="Type your comment here..." />
                  <Button size="sm">
                    <Send size={14} className="mr-2" />
                    Send
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter className="gap-2">
              {user?.role === "admin" && (
                <>
                  <Button variant="outline" className="sm:mr-auto">
                    <Pencil size={16} className="mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" onClick={() => {
                    deleteNotification(selectedNotification.id);
                    setSelectedNotification(null);
                  }}>
                    <Trash size={16} className="mr-2" />
                    Delete
                  </Button>
                </>
              )}
              
              <Button onClick={() => setSelectedNotification(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Notifications;
