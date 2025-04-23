
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useJobs } from "@/hooks/jobs";
import { useResumes } from "@/hooks/resumes/useResumes";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";
import { JobListings } from "@/components/admin/JobListings";
import { ResumeList } from "@/components/admin/ResumeList";
import { NotificationManager } from "@/components/admin/NotificationManager";

const AdminDashboard = () => {
  const { user, profile } = useAuth();
  const { getAllJobs } = useJobs();
  const { getMyResumes } = useResumes();
  const { notifications, createNotification } = useNotifications();
  const { toast } = useToast();
  
  const [jobs, setJobs] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = useState(false);

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

  const handleCreateNotification = async (title: string, body: string, type: string) => {
    if (!title || !body) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please provide both title and message for the notification."
      });
      return;
    }

    try {
      await createNotification(title, body, type);
      toast({
        title: "Notification created",
        description: "Your notification has been sent successfully."
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "There was a problem sending the notification."
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Welcome, {profile?.name || 'Admin'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <JobListings jobs={jobs} isLoading={isLoadingJobs} />
        <ResumeList resumes={resumes} isLoading={isLoadingResumes} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <NotificationManager 
          notifications={notifications} 
          onCreateNotification={handleCreateNotification}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
