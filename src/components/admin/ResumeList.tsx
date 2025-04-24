
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Eye, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Resume } from "@/hooks/resumes/types";

interface ResumeListProps {
  resumes: Resume[];
  isLoading: boolean;
}

export const ResumeList = ({ resumes, isLoading }: ResumeListProps) => {
  const { toast } = useToast();

  const handleDownload = async (resume: Resume) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(resume.file_path);

      if (error) throw error;

      // Create a download link
      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = resume.title + '.' + resume.file_type.split('/')[1];
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Success",
        description: "Resume downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download resume",
      });
    }
  };

  const getPreviewUrl = async (resume: Resume): Promise<string | null> => {
    try {
      const { data } = await supabase.storage
        .from('resumes')
        .getPublicUrl(resume.file_path);

      return data.publicUrl;
    } catch (error) {
      console.error('Error getting preview URL:', error);
      return null;
    }
  };

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
                <div className="flex gap-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl h-[80vh]">
                      <DialogHeader>
                        <DialogTitle>{resume.title}</DialogTitle>
                        <DialogDescription>
                          Uploaded on {new Date(resume.created_at).toLocaleDateString()}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="h-full mt-4">
                        <iframe
                          src={resume.file_path}
                          className="w-full h-full border-0"
                          title={`Preview of ${resume.title}`}
                          onLoad={async (e) => {
                            const iframe = e.target as HTMLIFrameElement;
                            const url = await getPreviewUrl(resume);
                            if (url) iframe.src = url;
                          }}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDownload(resume)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
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
