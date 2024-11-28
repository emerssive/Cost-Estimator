import { z } from "zod";

export const formSchema = z.object({
  projectName: z.string().min(2, "Project name must be at least 2 characters"),
  projectSize: z.string(),
  industry: z.string(),
  budget: z.number().min(1000, "Budget must be at least $1,000"),
  timeline: z.number().min(1, "Timeline must be at least 1 week"),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  additionalInfo: z.string().optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export type FormValues = z.infer<typeof formSchema>;