
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar as CalendarIcon, Check, Clock, Edit, Plus, Trash, Bell, Calendar, CheckCircle, XCircle } from "lucide-react";

// Mock data
const reminderData = [
  {
    id: 1,
    title: "Resume Submission Deadline",
    date: "2025-04-30",
    time: "23:59",
    description: "Submit your updated resume for the upcoming TechCorp drive.",
    isCompleted: false,
    category: "submission"
  },
  {
    id: 2,
    title: "Interview Preparation Session",
    date: "2025-04-28",
    time: "14:00",
    description: "Attend the interview preparation session in Conference Room A.",
    isCompleted: false,
    category: "event"
  },
  {
    id: 3,
    title: "Application for Frontend Developer Role",
    date: "2025-05-15",
    time: "23:59",
    description: "Submit your application for the Frontend Developer Intern position at TechCorp.",
    isCompleted: false,
    category: "application"
  },
  {
    id: 4,
    title: "Data Structures Review",
    date: "2025-04-25",
    time: "10:00",
    description: "Review data structures concepts for upcoming technical interviews.",
    isCompleted: true,
    category: "study"
  }
];

// Mock events for calendar
const eventData = [
  {
    id: 1,
    title: "Resume Submission Deadline",
    date: "2025-04-30",
    category: "deadline"
  },
  {
    id: 2,
    title: "Interview Preparation Session",
    date: "2025-04-28",
    category: "event"
  },
  {
    id: 3,
    title: "TechCorp Campus Drive",
    date: "2025-05-10",
    category: "event"
  },
  {
    id: 4,
    title: "Mock Interview Session",
    date: "2025-05-05",
    category: "event"
  },
  {
    id: 5,
    title: "Frontend Developer Application Deadline",
    date: "2025-05-15",
    category: "deadline"
  }
];

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatShortDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (timeString: string) => {
  if (!timeString) return '';
  const [hours, minutes] = timeString.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${minutes} ${ampm}`;
};

const getDaysLeft = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return `${diffDays} days left`;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'submission':
      return "bg-blue-50 text-blue-700 border-blue-200";
    case 'event':
      return "bg-green-50 text-green-700 border-green-200";
    case 'application':
      return "bg-purple-50 text-purple-700 border-purple-200";
    case 'study':
      return "bg-amber-50 text-amber-700 border-amber-200";
    case 'deadline':
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

// Generate calendar days
const generateCalendarDays = () => {
  const currentDate = new Date();
  currentDate.setDate(1); // Start from the 1st of the month
  
  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  
  const days = [];
  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    days.push({
      date: day.toISOString().split('T')[0],
      events: eventData.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getDate() === day.getDate() &&
          eventDate.getMonth() === day.getMonth() &&
          eventDate.getFullYear() === day.getFullYear()
        );
      })
    });
  }
  
  return days;
};

const Reminders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState(reminderData);
  const [calendarDays] = useState(generateCalendarDays());
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("submission");
  const [showCompleted, setShowCompleted] = useState(true);
  
  // Toggle reminder completion
  const toggleCompletion = (id: number) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, isCompleted: !reminder.isCompleted } : reminder
    ));
  };
  
  // Delete reminder
  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
    toast({
      title: "Reminder deleted",
      description: "The reminder has been removed from your list."
    });
  };
  
  // Add new reminder
  const addReminder = () => {
    if (!newTitle || !newDate) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in the required fields."
      });
      return;
    }
    
    const newReminder = {
      id: Math.max(...reminders.map(r => r.id)) + 1,
      title: newTitle,
      date: newDate,
      time: newTime,
      description: newDescription,
      isCompleted: false,
      category: newCategory
    };
    
    setReminders([...reminders, newReminder]);
    setNewTitle("");
    setNewDate("");
    setNewTime("");
    setNewDescription("");
    setNewCategory("submission");
    
    toast({
      title: "Reminder added",
      description: "Your new reminder has been added successfully."
    });
  };
  
  // Filter reminders
  const filteredReminders = reminders.filter(reminder => showCompleted || !reminder.isCompleted);
  
  const isPastDate = (dateString: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0, 0, 0, 0);
    return targetDate < today;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reminders & Calendar</h1>
          <p className="text-muted-foreground">
            Keep track of important dates and deadlines
          </p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add Reminder
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Reminder</DialogTitle>
              <DialogDescription>
                Create a new reminder for an important task or deadline
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                  placeholder="e.g. Submit Resume"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={newDate} 
                    onChange={(e) => setNewDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time (optional)</Label>
                  <Input 
                    id="time" 
                    type="time"
                    value={newTime} 
                    onChange={(e) => setNewTime(e.target.value)} 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select 
                  id="category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2 border border-input rounded-md"
                >
                  <option value="submission">Submission</option>
                  <option value="event">Event</option>
                  <option value="application">Application</option>
                  <option value="study">Study</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea 
                  id="description" 
                  value={newDescription} 
                  onChange={(e) => setNewDescription(e.target.value)} 
                  placeholder="Enter additional details..."
                  rows={3}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button onClick={addReminder}>
                Add Reminder
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left column - Reminders */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Upcoming Reminders</CardTitle>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="show-completed" 
                    checked={showCompleted} 
                    onChange={() => setShowCompleted(!showCompleted)} 
                    className="mr-1"
                  />
                  <Label htmlFor="show-completed" className="text-sm cursor-pointer">
                    Show Completed
                  </Label>
                </div>
              </div>
              <CardDescription>
                {filteredReminders.filter(r => !r.isCompleted).length} pending reminders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredReminders.length > 0 ? (
                  filteredReminders.map(reminder => (
                    <div 
                      key={reminder.id} 
                      className={`border rounded-lg p-3 ${
                        reminder.isCompleted ? "bg-gray-50" : ""
                      } ${
                        isPastDate(reminder.date) && !reminder.isCompleted ? "border-red-200 bg-red-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleCompletion(reminder.id)}
                            className={`p-1 rounded-full mr-3 border ${
                              reminder.isCompleted 
                                ? "bg-green-500 text-white border-green-500" 
                                : "text-muted-foreground border-muted-foreground"
                            }`}
                          >
                            <Check size={14} />
                          </button>
                          <div>
                            <h3 className={`font-medium ${reminder.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                              {reminder.title}
                            </h3>
                            <div className="flex items-center text-sm text-muted-foreground mt-1">
                              <CalendarIcon size={12} className="mr-1" />
                              <span>{formatDate(reminder.date)}</span>
                              {reminder.time && (
                                <>
                                  <Clock size={12} className="ml-2 mr-1" />
                                  <span>{formatTime(reminder.time)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={getCategoryColor(reminder.category)}
                        >
                          {reminder.category.charAt(0).toUpperCase() + reminder.category.slice(1)}
                        </Badge>
                      </div>
                      
                      {reminder.description && (
                        <p className={`text-sm mt-3 ${reminder.isCompleted ? "text-muted-foreground" : ""}`}>
                          {reminder.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center mt-3">
                        <span className={`text-xs ${
                          isPastDate(reminder.date) && !reminder.isCompleted ? "text-red-600 font-medium" : "text-muted-foreground"
                        }`}>
                          {getDaysLeft(reminder.date)}
                        </span>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => {/* Edit reminder functionality would go here */}}
                          >
                            <Edit size={14} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 text-red-600"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle size={36} className="mx-auto text-gray-400 mb-3" />
                    <h3 className="font-medium mb-1">No reminders</h3>
                    <p className="text-sm text-muted-foreground">
                      You don't have any reminders at the moment.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Plus size={16} className="mr-2" />
                    Create New Reminder
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  {/* Same content as the Add Reminder dialog above */}
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
          
          {user?.role === "admin" && (
            <Card>
              <CardHeader>
                <CardTitle>Send Group Reminder</CardTitle>
                <CardDescription>
                  Send a reminder to all students
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="group-title">Title</Label>
                  <Input id="group-title" placeholder="e.g. Resume Submission Deadline" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-date">Date</Label>
                    <Input id="group-date" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="group-time">Time</Label>
                    <Input id="group-time" type="time" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group-description">Message</Label>
                  <Textarea id="group-description" placeholder="Enter message..." rows={3} />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">
                  <Bell size={16} className="mr-2" />
                  Send to All Students
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
        
        {/* Right column - Calendar */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Monthly Calendar</CardTitle>
                <Badge variant="outline">April 2025</Badge>
              </div>
              <CardDescription>
                View upcoming events and deadlines
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Calendar Header */}
              <div className="grid grid-cols-7 text-sm font-medium text-center mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
                  <div key={i} className="py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days of the week before the first of the month */}
                {/* This is a simplified example; in a real app you would calculate this dynamically */}
                {/* Assuming April 1, 2025 is a Tuesday (index 2) */}
                {[0, 1].map((_, i) => (
                  <div key={`empty-${i}`} className="h-24 border rounded-md bg-gray-50"></div>
                ))}
                
                {calendarDays.map((day, i) => {
                  const hasEvents = day.events.length > 0;
                  const isToday = new Date().toISOString().split('T')[0] === day.date;
                  
                  return (
                    <div 
                      key={i} 
                      className={`h-24 border rounded-md p-1 hover:border-purple-300 transition-colors ${
                        isToday ? "bg-purple-50 border-purple-200" : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${isToday ? "text-purple-700" : ""}`}>
                          {new Date(day.date).getDate()}
                        </span>
                        {hasEvents && (
                          <Badge variant="secondary" className="text-xs h-5 px-1">
                            {day.events.length}
                          </Badge>
                        )}
                      </div>
                      
                      {hasEvents && (
                        <div className="space-y-1">
                          {day.events.slice(0, 2).map((event, j) => (
                            <div 
                              key={j} 
                              className={`text-xs p-1 rounded truncate ${getCategoryColor(event.category)}`}
                              title={event.title}
                            >
                              {event.title}
                            </div>
                          ))}
                          {day.events.length > 2 && (
                            <div className="text-xs text-center text-muted-foreground">
                              +{day.events.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start space-y-2">
              <div className="text-sm font-medium">Event Types:</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className={getCategoryColor("event")}>Event</Badge>
                <Badge variant="outline" className={getCategoryColor("deadline")}>Deadline</Badge>
                <Badge variant="outline" className={getCategoryColor("application")}>Application</Badge>
                <Badge variant="outline" className={getCategoryColor("submission")}>Submission</Badge>
              </div>
            </CardFooter>
          </Card>
          
          {/* Upcoming Events List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>
                Events and deadlines for the next 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {eventData.slice(0, 3).map((event, i) => (
                  <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                    <div className="flex gap-3">
                      <div className={`text-center p-2 border rounded-md ${getCategoryColor(event.category)}`}>
                        <div className="text-xs font-medium">{formatShortDate(event.date).split(' ')[0]}</div>
                        <div className="text-lg font-bold">{formatShortDate(event.date).split(' ')[1]}</div>
                      </div>
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <CalendarIcon size={12} className="mr-1" />
                          <span>{formatDate(event.date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant="outline" className={getCategoryColor(event.category)}>
                      {event.category === "deadline" ? "Deadline" : "Event"}
                    </Badge>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full">
                  View All Events
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Reminders;
