
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart, Building, Calendar, Edit, FileText, MoreHorizontal, Plus, Search, Trash, Users } from "lucide-react";

// Mock data
const placementStats = {
  totalStudents: 250,
  placedStudents: 180,
  ongoingApplications: 45,
  averageSalary: "$85,000",
  topEmployers: ["TechCorp", "InnovateSoft", "DataDrive", "GlobalFinance"],
  placementRate: 72
};

const recentAnnouncementsData = [
  {
    id: 1,
    title: "Campus Drive: TechCorp Inc.",
    date: "2025-04-18",
    content: "TechCorp will be conducting a campus drive on May 10th for Software Engineer and UX Designer positions."
  },
  {
    id: 2,
    title: "Resume Workshop",
    date: "2025-04-15",
    content: "Join us for a resume building workshop on April 25th at 2:00 PM in the Main Auditorium."
  },
  {
    id: 3,
    title: "Interview Preparation Session",
    date: "2025-04-10",
    content: "Mock interviews will be conducted on April 28th. Register through the student portal by April 25th."
  }
];

const remindersData = [
  {
    id: 1,
    title: "Resume Submission Deadline",
    date: "2025-04-30",
    content: "Remind students to submit their updated resumes for the upcoming TechCorp drive."
  },
  {
    id: 2,
    title: "Pre-Placement Talk",
    date: "2025-05-05",
    content: "Pre-placement talk by InnovateSoft at 11:00 AM in the Conference Hall."
  }
];

const jobListingsData = [
  {
    id: 1,
    title: "Frontend Developer Intern",
    company: "TechCorp Inc.",
    location: "Remote",
    deadline: "2025-05-15",
    applicants: 24
  },
  {
    id: 2,
    title: "UX Designer",
    company: "DesignHub",
    location: "New York, NY",
    deadline: "2025-05-20",
    applicants: 18
  },
  {
    id: 3,
    title: "Data Analyst",
    company: "DataDrive",
    location: "Chicago, IL",
    deadline: "2025-05-25",
    applicants: 15
  },
  {
    id: 4,
    title: "Backend Developer",
    company: "ServerStack",
    location: "Boston, MA",
    deadline: "2025-06-01",
    applicants: 12
  }
];

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState(recentAnnouncementsData);
  const [reminders, setReminders] = useState(remindersData);
  const [jobListings, setJobListings] = useState(jobListingsData);
  const [newJobTitle, setNewJobTitle] = useState("");
  const [newJobCompany, setNewJobCompany] = useState("");
  const [newJobLocation, setNewJobLocation] = useState("");
  const [newJobDeadline, setNewJobDeadline] = useState("");
  
  const [newAnnouncementTitle, setNewAnnouncementTitle] = useState("");
  const [newAnnouncementContent, setNewAnnouncementContent] = useState("");
  
  const [newReminderTitle, setNewReminderTitle] = useState("");
  const [newReminderDate, setNewReminderDate] = useState("");
  const [newReminderContent, setNewReminderContent] = useState("");

  // Redirect to student dashboard if user is a student
  useEffect(() => {
    if (user?.role === "student") {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Add a new job listing
  const handleAddJob = () => {
    if (!newJobTitle || !newJobCompany || !newJobLocation || !newJobDeadline) return;
    
    const newJob = {
      id: Math.max(...jobListings.map(job => job.id)) + 1,
      title: newJobTitle,
      company: newJobCompany,
      location: newJobLocation,
      deadline: newJobDeadline,
      applicants: 0
    };
    
    setJobListings([...jobListings, newJob]);
    setNewJobTitle("");
    setNewJobCompany("");
    setNewJobLocation("");
    setNewJobDeadline("");
  };

  // Add a new announcement
  const handleAddAnnouncement = () => {
    if (!newAnnouncementTitle || !newAnnouncementContent) return;
    
    const newAnnouncement = {
      id: Math.max(...announcements.map(ann => ann.id)) + 1,
      title: newAnnouncementTitle,
      date: new Date().toISOString().split('T')[0],
      content: newAnnouncementContent
    };
    
    setAnnouncements([newAnnouncement, ...announcements]);
    setNewAnnouncementTitle("");
    setNewAnnouncementContent("");
  };

  // Add a new reminder
  const handleAddReminder = () => {
    if (!newReminderTitle || !newReminderDate || !newReminderContent) return;
    
    const newReminder = {
      id: Math.max(...reminders.map(rem => rem.id)) + 1,
      title: newReminderTitle,
      date: newReminderDate,
      content: newReminderContent
    };
    
    setReminders([...reminders, newReminder]);
    setNewReminderTitle("");
    setNewReminderDate("");
    setNewReminderContent("");
  };

  // Delete an announcement
  const deleteAnnouncement = (id: number) => {
    setAnnouncements(announcements.filter(ann => ann.id !== id));
  };

  // Delete a reminder
  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(rem => rem.id !== id));
  };

  // Delete a job listing
  const deleteJob = (id: number) => {
    setJobListings(jobListings.filter(job => job.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage placement activities and monitor student progress
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/opportunities")}>
          <Plus size={16} className="mr-2" />
          New Job Listing
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <h3 className="text-2xl font-bold mt-1">{placementStats.totalStudents}</h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <Users size={20} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Placed Students</p>
                <h3 className="text-2xl font-bold mt-1">{placementStats.placedStudents}</h3>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <Building size={20} className="text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ongoing Applications</p>
                <h3 className="text-2xl font-bold mt-1">{placementStats.ongoingApplications}</h3>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <FileText size={20} className="text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Placement Rate</p>
                <h3 className="text-2xl font-bold mt-1">{placementStats.placementRate}%</h3>
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <BarChart size={20} className="text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column - Jobs & Announcements */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Job Listings</CardTitle>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Job Listing</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new job opportunity
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="job-title" className="text-sm font-medium">Job Title</label>
                        <Input 
                          id="job-title" 
                          value={newJobTitle} 
                          onChange={(e) => setNewJobTitle(e.target.value)} 
                          placeholder="e.g. Frontend Developer"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="company" className="text-sm font-medium">Company</label>
                        <Input 
                          id="company" 
                          value={newJobCompany} 
                          onChange={(e) => setNewJobCompany(e.target.value)} 
                          placeholder="e.g. TechCorp Inc."
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="location" className="text-sm font-medium">Location</label>
                        <Input 
                          id="location" 
                          value={newJobLocation} 
                          onChange={(e) => setNewJobLocation(e.target.value)} 
                          placeholder="e.g. Remote or New York, NY"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="deadline" className="text-sm font-medium">Application Deadline</label>
                        <Input 
                          id="deadline" 
                          type="date" 
                          value={newJobDeadline} 
                          onChange={(e) => setNewJobDeadline(e.target.value)} 
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddJob}>Add Job Listing</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {jobListings.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-medium">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {job.company} • {job.location}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteJob(job.id)}>
                            <Trash size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar size={14} className="mr-1" />
                        Deadline: {formatDate(job.deadline)}
                      </div>
                      <Badge variant="secondary">{job.applicants} applicants</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/opportunities")}>
                Manage All Job Listings
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Announcements</CardTitle>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Announcement</DialogTitle>
                      <DialogDescription>
                        Create a new announcement to notify students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="announcement-title" className="text-sm font-medium">Title</label>
                        <Input 
                          id="announcement-title" 
                          value={newAnnouncementTitle} 
                          onChange={(e) => setNewAnnouncementTitle(e.target.value)} 
                          placeholder="e.g. Campus Drive: TechCorp Inc."
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="announcement-content" className="text-sm font-medium">Content</label>
                        <Textarea 
                          id="announcement-content" 
                          value={newAnnouncementContent} 
                          onChange={(e) => setNewAnnouncementContent(e.target.value)} 
                          placeholder="Enter announcement details..."
                          rows={5}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddAnnouncement}>Publish Announcement</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div key={announcement.id} className="border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{announcement.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteAnnouncement(announcement.id)}>
                            <Trash size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Posted on {formatDate(announcement.date)}
                    </p>
                    <p className="text-sm mt-2">{announcement.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/notifications")}>
                Manage All Announcements
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column - Reminders & Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Reminders</CardTitle>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus size={16} className="mr-2" />
                      Add New
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Reminder</DialogTitle>
                      <DialogDescription>
                        Schedule a new reminder for students
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="reminder-title" className="text-sm font-medium">Title</label>
                        <Input 
                          id="reminder-title" 
                          value={newReminderTitle} 
                          onChange={(e) => setNewReminderTitle(e.target.value)} 
                          placeholder="e.g. Resume Submission Deadline"
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="reminder-date" className="text-sm font-medium">Date</label>
                        <Input 
                          id="reminder-date" 
                          type="date" 
                          value={newReminderDate} 
                          onChange={(e) => setNewReminderDate(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="reminder-content" className="text-sm font-medium">Content</label>
                        <Textarea 
                          id="reminder-content" 
                          value={newReminderContent} 
                          onChange={(e) => setNewReminderContent(e.target.value)} 
                          placeholder="Enter reminder details..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddReminder}>Add Reminder</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <div key={reminder.id} className="border rounded-lg p-4 shadow-sm">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{reminder.title}</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal size={18} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <Edit size={16} className="mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteReminder(reminder.id)}>
                            <Trash size={16} className="mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Calendar size={14} className="mr-1" />
                      {formatDate(reminder.date)}
                    </div>
                    <p className="text-sm mt-2">{reminder.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard/reminders")}>
                Manage All Reminders
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Placement Statistics</CardTitle>
              <CardDescription>
                Overview of current placement status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Placement Rate</p>
                    <p className="text-2xl font-bold">{placementStats.placementRate}%</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-muted-foreground">Avg. Salary</p>
                    <p className="text-2xl font-bold">{placementStats.averageSalary}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-2">Top Employers</h4>
                  <div className="flex flex-wrap gap-2">
                    {placementStats.topEmployers.map((employer, index) => (
                      <Badge key={index} variant="secondary">{employer}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Placement Progress</span>
                    <span className="text-sm font-medium">
                      {placementStats.placedStudents}/{placementStats.totalStudents}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(placementStats.placedStudents / placementStats.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <BarChart size={16} className="mr-2" />
                View Detailed Reports
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Search</CardTitle>
              <CardDescription>
                Find students or job listings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search..." className="pl-8" />
                </div>
                
                <Tabs defaultValue="students">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="students">Students</TabsTrigger>
                    <TabsTrigger value="jobs">Jobs</TabsTrigger>
                  </TabsList>
                  <TabsContent value="students" className="space-y-4 mt-2">
                    <Button variant="outline" className="w-full justify-start text-sm">
                      View All Students
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-sm">
                      Placement Status
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-sm">
                      Resume Database
                    </Button>
                  </TabsContent>
                  <TabsContent value="jobs" className="space-y-4 mt-2">
                    <Button variant="outline" className="w-full justify-start text-sm">
                      Active Listings
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-sm">
                      Application Status
                    </Button>
                    <Button variant="outline" className="w-full justify-start text-sm">
                      Post New Job
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
