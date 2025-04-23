import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useJobs } from "@/hooks/jobs";

const AdminDashboardIntegration: React.FC = () => {
  const { getAllJobs, isLoading, error } = useJobs();

  React.useEffect(() => {
    const fetchJobs = async () => {
      const result = await getAllJobs();
      if (result && result.jobs) {
        console.log("Fetched jobs:", result.jobs);
      } else if (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchJobs();
  }, [getAllJobs, error]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Dashboard Integration</CardTitle>
        <CardDescription>
          This is an integration test for the admin dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div>Loading jobs...</div>
        ) : error ? (
          <div>Error: {error}</div>
        ) : (
          <div>Jobs loaded successfully!</div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminDashboardIntegration;
