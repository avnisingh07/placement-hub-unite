
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Resume } from "@/hooks/resumes/types";

interface ResumeListProps {
  resumes: Resume[];
  isLoading: boolean;
}

export const ResumeList = ({ resumes, isLoading }: ResumeListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Resumes</CardTitle>
        <CardDescription>View and manage student resumes</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
};
