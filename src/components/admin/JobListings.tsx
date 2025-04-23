
import { useState } from "react";
import { Building, Edit, MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Job } from "@/hooks/jobs";

interface JobListingsProps {
  jobs: Job[];
  isLoading: boolean;
}

export const JobListings = ({ jobs, isLoading }: JobListingsProps) => {
  return (
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
        {isLoading ? (
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
};
