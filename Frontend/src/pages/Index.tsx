import { ProjectForm } from "@/components/ProjectForm";
import { ResultsTable } from "@/components/ResultsTable";
import { useState } from "react";
import { toast } from "sonner";
import { EstimateData } from "@/types/estimates";

// Sample data for demonstration
const sampleData = {
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

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [estimateData, setEstimateData] = useState<any>(null);

  const handleEstimateComplete = (data: any) => {
    setEstimateData(data);
    setShowResults(true);
    toast.success("Estimate calculated successfully!");
  };

  const handleDataUpdate = (newData: EstimateData) => {
    setEstimateData(newData);
  };

  const handleNewEstimate = () => {
    setShowResults(false);
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {!showResults ? (
          <ProjectForm onEstimateComplete={handleEstimateComplete} />
        ) : (
          <ResultsTable 
            data={estimateData} 
            onNewEstimate={handleNewEstimate} 
            onDataUpdate={handleDataUpdate}
          />
        )}
      </div>
    </div>
  );
};

export default Index;
