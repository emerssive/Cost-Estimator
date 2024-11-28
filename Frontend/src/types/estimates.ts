export interface Task {
  task: string;
  subtasks: {
    subtask: string;
    hours: number;
    comments: string;
  }[];
}

export interface Resource {
  role: string;
  allocation_percentage: number;
  engagement_type: string;
  units: number;
}

export interface EstimateData {
  project_id: number;
  estimates: {
    summary: {
      num_subtasks: number;
      num_tasks: number;
      total_hours: number;
    };
    tasks: Task[];
  };
  resources: Resource[];
}