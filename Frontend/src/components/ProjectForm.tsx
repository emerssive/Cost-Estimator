import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import axios from 'axios';  

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DatePickerField } from "./form/DatePickerField";
import { formSchema, FormValues } from "@/types/form";

// Sample data for demonstration
const mockEstimateData = {
  project_id: 140,
  estimates: {
    summary: {
      num_subtasks: 34,
      num_tasks: 9,
      total_hours: 436,
    },
    tasks: [
      {
        task: "User Authentication Implementation",
        subtasks: [
          {
            subtask: "Implement user registration system",
            hours: 12,
            comments: "Includes form validation, database schema setup",
          },
          {
            subtask: "Set up OAuth integration",
            hours: 8,
            comments: "Google and Facebook authentication",
          },
        ],
      },
      {
        task: "Database Design",
        subtasks: [
          {
            subtask: "Create database schema",
            hours: 16,
            comments: "Including all necessary tables and relationships",
          },
        ],
      },
    ],
  },
  resources: [
    {
      role: "Project Manager",
      allocation_percentage: 15,
      engagement_type: "Full",
      units: 1,
    },
    {
      role: "Senior Developer",
      allocation_percentage: 100,
      engagement_type: "Full",
      units: 2,
    },
  ],
};

export function ProjectForm({ onEstimateComplete }: { onEstimateComplete: (data: any) => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      projectSize: "",
      industry: "",
      budget: 0,
      timeline: 0,
      additionalInfo: "",
    },
  });

  const startDate = form.watch("startDate");

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      
      const formData = new FormData();
      formData.append('project_name', values.projectName);
      formData.append('project_size', values.projectSize);
      formData.append('industry', values.industry);
      formData.append('budget', values.budget.toString());
      formData.append('timeline', values.timeline.toString());
      formData.append('additional_info', values.additionalInfo || '');
      formData.append('start_date', values.startDate ? format(values.startDate, 'yyyy-MM-dd') : '');
      formData.append('end_date', values.endDate ? format(values.startDate, 'yyyy-MM-dd') : '');
      // Add file if it exists
      if (file) {
        formData.append('file', file);
      }
  
      const response = await axios.post('http://127.0.0.1:5000/projectDetails', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if( response.data.success)
      {
        toast.success("Project submitted successfully!");
        onEstimateComplete(response.data.data);
      }

      else{
        throw new Error(response.data.message || 'Unexpected response from server');
      }
  
    
    }  catch (error) {
      if (axios.isAxiosError(error)) {
        // Network error or server responded with error status
        const errorMessage = error.response?.data?.message 
          || error.message 
          || 'Network error. Please check your connection.';
        toast.error(errorMessage);
      } else {
        // Unexpected error
        toast.error("An unexpected error occurred. Please try again.");
        console.error(error);
      }}
       finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["text/plain", "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      if (allowedTypes.includes(file.type)) {
        setFile(file);
        toast.success("File uploaded successfully!");
      } else {
        toast.error("Please upload a .txt, .pdf, or .docx file");
      }
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8 animate-fadeIn">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Project Estimation</h1>
        <p className="text-muted-foreground">Fill out the form below to get your project estimate.</p>
      </div>

      <div className="p-6 rounded-lg border bg-card/50 backdrop-blur-sm">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="projectSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Small">Small</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="e_commerce">E Commerce</SelectItem>
                        <SelectItem value="software_development">Software Development</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Health Care</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter budget"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timeline (weeks)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter timeline"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <DatePickerField
                form={form}
                name="startDate"
                label="Start Date (Optional)"
              />
              <DatePickerField
                form={form}
                name="endDate"
                label="End Date (Optional)"
                minDate={startDate || undefined}
              />
            </div>

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter any additional details..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Upload Files</FormLabel>
              <Input
                type="file"
                accept=".txt,.pdf,.docx"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-muted-foreground">
                Accepted formats: .txt, .pdf, .docx
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing
                </>
              ) : (
                "Submit Project"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
