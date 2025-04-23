
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

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { getAllJobs } = useJobs();
  const { getMyResumes } = useResumes();
  const { notifications, createNotification } = useNotifications();
  
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);

  useEffect(() => {
    const fetchAdminData = async () => {
      const jobsResult = await getAllJobs();
      const resumesResult = await getMyResumes();
      
      if (jobsResult.jobs) setJobs(jobsResult.jobs);
      if (resumesResult.resumes) setResumes(resumesResult.resumes);
    };

    fetchAdminData();
  }, []);

  const renderJobListings = () => (
    <Card>
      <CardHeader>
        <CardTitle>Job Listings</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.map(job => (
          <div key={job.id} className="border-b py-2">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{job.title}</h3>
                <p className="text-sm text-muted-foreground">{job.company}</p>
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
        ))}
      </CardContent>
    </Card>
  );

  const renderResumes = () => (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Resumes</CardTitle>
      </CardHeader>
      <CardContent>
        {resumes.map(resume => (
          <div key={resume.id} className="border-b py-2">
            <div className="flex justify-between">
              <div>
                <h3 className="font-medium">{resume.title}</h3>
                <p className="text-sm text-muted-foreground">{resume.file_type}</p>
              </div>
              <Button variant="outline" size="sm">
                Download
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderNotifications = () => (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <Button 
          variant="outline" 
          onClick={() => createNotification(
            "Test Notification", 
            "This is a test notification", 
            "general"
          )}
        >
          Create Notification
        </Button>
      </CardHeader>
      <CardContent>
        {notifications.map(notification => (
          <div key={notification.id} className="border-b py-2">
            <h3 className="font-medium">{notification.title}</h3>
            <p className="text-sm text-muted-foreground">{notification.body}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {profile?.name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderJobListings()}
        {renderResumes()}
        {renderNotifications()}
      </div>
    </div>
  );
};

export default AdminDashboard;
