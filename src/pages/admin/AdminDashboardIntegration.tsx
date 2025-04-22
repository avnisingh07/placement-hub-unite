
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useJobs, Job } from "@/hooks/useJobs";
import { useNotifications } from "@/hooks/useNotifications";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight, 
  MessageSquare, 
  Plus, 
  Trash2
} from "lucide-react"; // Using lucide-react instead of radix-ui/react-icons

function AdminDashboardIntegration() {
  const [activeTab, setActiveTab] = useState("jobs");
  const { getAllJobs, createJob, updateJob, deleteJob, isLoading } = useJobs();
  const { createNotification } = useNotifications();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    company: "",
    description: "",
    skills: [] as string[],
    deadline: "",
  });
  const [newSkill, setNewSkill] = useState("");
  const [newNotification, setNewNotification] = useState({
    title: "",
    body: "",
    type: "announcement",
  });

  // Fetch jobs on component mount
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const { jobs: fetchedJobs } = await getAllJobs();
      setJobs(fetchedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch jobs",
        variant: "destructive",
      });
    }
  };

  const handleCreateJob = async () => {
    try {
      if (!newJob.title || !newJob.company || !newJob.description) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await createJob(newJob);
      setIsCreateDialogOpen(false);
      setNewJob({
        title: "",
        company: "",
        description: "",
        skills: [],
        deadline: "",
      });
      fetchJobs();
      toast({
        title: "Success",
        description: "Job created successfully",
      });
    } catch (error) {
      console.error("Error creating job:", error);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive",
      });
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
      fetchJobs();
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      });
    }
  };

  const handleAddSkill = () => {
    if (newSkill.trim() !== "" && !newJob.skills.includes(newSkill.trim())) {
      setNewJob({
        ...newJob,
        skills: [...newJob.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setNewJob({
      ...newJob,
      skills: newJob.skills.filter((s) => s !== skill),
    });
  };

  const handleCreateNotification = async () => {
    try {
      if (!newNotification.title || !newNotification.body) {
        toast({
          title: "Missing Fields",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      await createNotification(
        newNotification.title,
        newNotification.body,
        newNotification.type
      );
      setNewNotification({
        title: "",
        body: "",
        type: "announcement",
      });
      toast({
        title: "Success",
        description: "Notification created successfully",
      });
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        title: "Error",
        description: "Failed to create notification",
        variant: "destructive",
      });
    }
  };

  if (!profile || profile.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="jobs">Manage Jobs</TabsTrigger>
          <TabsTrigger value="notifications">
            Send Announcements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Job Listings</CardTitle>
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="mr-2 h-4 w-4" /> Add New Job
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Job</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={newJob.title}
                        onChange={(e) =>
                          setNewJob({ ...newJob, title: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={newJob.company}
                        onChange={(e) =>
                          setNewJob({ ...newJob, company: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newJob.description}
                        onChange={(e) =>
                          setNewJob({
                            ...newJob,
                            description: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deadline">Deadline (optional)</Label>
                      <Input
                        id="deadline"
                        type="date"
                        value={newJob.deadline}
                        onChange={(e) =>
                          setNewJob({ ...newJob, deadline: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="skills">Skills</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="skills"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          placeholder="Add a skill"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={handleAddSkill}
                        >
                          Add
                        </Button>
                      </div>
                      {newJob.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newJob.skills.map((skill) => (
                            <div
                              key={skill}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md flex items-center text-sm"
                            >
                              {skill}
                              <button
                                type="button"
                                className="ml-1 text-secondary-foreground/70 hover:text-secondary-foreground"
                                onClick={() => handleRemoveSkill(skill)}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      onClick={handleCreateJob}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? "Creating..." : "Create Job"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No jobs found. Create a new job to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          {job.title}
                        </TableCell>
                        <TableCell>{job.company}</TableCell>
                        <TableCell>
                          {format(new Date(job.created_at), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {job.deadline
                            ? format(new Date(job.deadline), "MMM d, yyyy")
                            : "No deadline"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Send Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="notif-title">Title</Label>
                  <Input
                    id="notif-title"
                    value={newNotification.title}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        title: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notif-body">Message</Label>
                  <Textarea
                    id="notif-body"
                    value={newNotification.body}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        body: e.target.value,
                      })
                    }
                    rows={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notif-type">Type</Label>
                  <select
                    id="notif-type"
                    value={newNotification.type}
                    onChange={(e) =>
                      setNewNotification({
                        ...newNotification,
                        type: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="reminder">Reminder</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>
                <Button
                  onClick={handleCreateNotification}
                  disabled={isLoading}
                  className="w-full"
                  variant="default"
                >
                  {isLoading ? "Sending..." : "Send to All Students"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default AdminDashboardIntegration;
