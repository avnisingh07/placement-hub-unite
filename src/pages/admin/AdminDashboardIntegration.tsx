
// Since AdminDashboard.tsx is a read-only file, I'm creating a new file with integration examples
// This would need to be merged into the main component
import { useEffect, useState } from "react";
import { useJobs } from "@/hooks/useJobs";
import { useReminders } from "@/hooks/useReminders";
import { useNotifications } from "@/hooks/useNotifications";
import { useToast } from "@/hooks/use-toast";

export const useAdminDashboardIntegration = () => {
  const { toast } = useToast();
  const { 
    createJob, 
    getAllJobs,
    updateJob,
    deleteJob,
    isLoading: isJobsLoading 
  } = useJobs();
  
  const {
    reminders,
    createReminder,
    updateReminder,
    deleteReminder,
    isLoading: isRemindersLoading
  } = useReminders();
  
  const {
    notifications,
    createNotification,
    isLoading: isNotificationsLoading
  } = useNotifications();
  
  const [jobs, setJobs] = useState([]);
  
  // Fetch initial data
  useEffect(() => {
    const fetchJobs = async () => {
      const { jobs: jobsData } = await getAllJobs();
      setJobs(jobsData || []);
    };
    
    fetchJobs();
  }, []);
  
  // Add a new job listing
  const handleAddJob = async (jobData) => {
    try {
      const { success, job, error } = await createJob({
        title: jobData.title,
        company: jobData.company,
        description: jobData.description || "",
        location: jobData.location,
        deadline: jobData.deadline,
        skills: jobData.skills || []
      });
      
      if (!success) throw new Error(error);
      
      // Update local state
      setJobs(prevJobs => [...prevJobs, job]);
      return { success: true };
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to add job",
        description: err.message
      });
      return { success: false, error: err.message };
    }
  };
  
  // Add a new announcement (notification)
  const handleAddAnnouncement = async (title, body) => {
    try {
      const { success, notification, error } = await createNotification(
        title,
        body,
        "announcement",
        null // Send to all users
      );
      
      if (!success) throw new Error(error);
      
      return { success: true };
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to add announcement",
        description: err.message
      });
      return { success: false, error: err.message };
    }
  };
  
  // Add a new reminder
  const handleAddReminder = async (title, message, dueDate, targets = null) => {
    try {
      const { success, reminder, error } = await createReminder(
        title,
        message,
        dueDate,
        targets
      );
      
      if (!success) throw new Error(error);
      
      return { success: true };
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to add reminder",
        description: err.message
      });
      return { success: false, error: err.message };
    }
  };
  
  return {
    jobs,
    reminders,
    notifications,
    handleAddJob,
    handleAddAnnouncement,
    handleAddReminder,
    deleteJob,
    updateJob,
    deleteReminder,
    updateReminder,
    isLoading: isJobsLoading || isRemindersLoading || isNotificationsLoading
  };
};
