
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
import { useJobs } from "@/hooks/jobs";
import { useResumes } from "@/hooks/resumes/useResumes";
import { useNotifications } from "@/hooks/useNotifications";
import { useState as useHookState } from "react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { getAllJobs } = useJobs();
  const { getMyResumes } = useResumes();
  const { notifications, createNotification } = useNotifications();
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);
  const [createNotificationOpen, setCreateNotificationOpen] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    body: '',
    type: 'general'
  });

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoadingJobs(true);
        setIsLoadingResumes(true);
        
        const jobsResult = await getAllJobs();
        if (jobsResult?.jobs) {
          console.log("Fetched jobs:", jobsResult.jobs);
          setJobs(jobsResult.jobs);
        }
        
        const resumesResult = await getMyResumes();
        if (resumesResult?.resumes) {
          console.log("Fetched resumes:", resumesResult.resumes);
          setResumes(resumesResult.resumes);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast({
          variant: "destructive",
          title: "Error fetching data",
          description: "There was a problem loading the dashboard data."
        });
      } finally {
        setIsLoadingJobs(false);
        setIsLoadingResumes(false);
      }
    };

    fetchAdminData();
  }, []);

  const handleCreateNotification = async () => {
    if (!newNotification.title || !newNotification.body) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both title and message for the notification."
      });
      return;
    }

    try {
      await createNotification(
        newNotification.title,
        newNotification.body,
        newNotification.type
      );
      
      toast({
        title: "Notification created",
        description: "Your notification has been sent successfully."
      });
      
      setNewNotification({
        title: '',
        body: '',
        type: 'general'
      });
      
      setCreateNotificationOpen(false);
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem sending the notification."
      });
    }
  };

  const renderJobListings = () => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Job Listings</CardTitle>
          <CardDescription>Manage all job listings in the system</CardDescription>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Add Job
        </Button>
      </CardHeader>
      <CardContent>
        {isLoadingJobs ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : jobs.length > 0 ? (
          jobs.map(job => (
            <div key={job.id} className="border-b py-4">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-medium">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                  {job.deadline && (
                    <p className="text-xs text-muted-foreground">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit size={16} className="mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No job listings found
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">View All Jobs</Button>
      </CardFooter>
    </Card>
  );

  const renderResumes = () => (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Resumes</CardTitle>
        <CardDescription>View and manage student resumes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoadingResumes ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : resumes.length > 0 ? (
          resumes.map(resume => (
            <div key={resume.id} className="border-b py-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{resume.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {resume.file_type} • {(resume.file_size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Uploaded: {new Date(resume.created_at).toLocaleDateString()}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Download
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No resumes uploaded yet
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderNotifications = () => (
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {profile?.name || 'Admin'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderJobListings()}
        {renderResumes()}
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {renderNotifications()}
      </div>
    </div>
  );
};

export default AdminDashboard;
