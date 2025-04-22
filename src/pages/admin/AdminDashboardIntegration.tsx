// AdminDashboardIntegration.tsx
import React, { useState, useEffect } from 'react';
import { useJobs, Job } from '@/hooks/useJobs';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "@radix-ui/react-icons"

const AdminDashboard = () => {
  const { getAllJobs, createJob, updateJob, deleteJob, isLoading } = useJobs();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchJobs = async () => {
      const { jobs: fetchedJobs } = await getAllJobs();
      setJobs(fetchedJobs);
    };

    fetchJobs();
  }, [getAllJobs]);

  const handleCreateJob = async (jobData: any) => {
    setIsCreating(true);
    
    try {
      // Extract location and other non-Job properties to avoid type errors
      const { location, ...jobDataWithoutLocation } = jobData;
      
      const { success, job, error } = await createJob(jobDataWithoutLocation);
      
      if (success) {
        toast({
          title: "Job Created",
          description: "The job posting has been created successfully.",
        });
        setJobs((prev) => [...prev, job]);
        setShowCreateModal(false);
      } else {
        toast({
          variant: "destructive",
          title: "Error Creating Job",
          description: error || "Failed to create job. Please try again.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      const { success, error } = await deleteJob(jobId);
      if (success) {
        toast({
          title: "Job Deleted",
          description: "The job posting has been deleted successfully.",
        });
        setJobs((prev) => prev.filter((job) => job.id !== jobId));
      } else {
        toast({
          variant: "destructive",
          title: "Error Deleting Job",
          description: error || "Failed to delete job. Please try again.",
        });
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "An unexpected error occurred.",
      });
    }
  };

  const jobSchema = z.object({
    title: z.string().min(2, {
      message: "Job title must be at least 2 characters.",
    }),
    company: z.string().min(2, {
      message: "Company name must be at least 2 characters.",
    }),
    description: z.string().min(10, {
      message: "Job description must be at least 10 characters.",
    }),
    skills: z.string().optional(),
    deadline: z.date().optional(),
  })
  
  const form = useForm<z.infer<typeof jobSchema>>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: "",
      company: "",
      description: "",
      skills: "",
      deadline: undefined,
    },
  })

  const onSubmit = (values: z.infer<typeof jobSchema>) => {
    handleCreateJob(values);
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>

      <div className="mb-6">
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button variant="primary">Create New Job</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>
                Add a new job posting to the platform.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Software Engineer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Input placeholder="Acme Corp" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Brief job description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills (comma-separated)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., React, Node.js, SQL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Deadline</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < new Date()
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>
                        Select a deadline for the job posting.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit">
                    {isCreating ? "Creating..." : "Create Job"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableCaption>A list of your recent job postings.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Title</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.company}</TableCell>
                <TableCell>{job.description}</TableCell>
                <TableCell>{job.skills?.join(', ') || 'N/A'}</TableCell>
                <TableCell>{job.deadline || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminDashboard;
