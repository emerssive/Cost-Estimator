import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Edit2, Save, Plus, FileText } from "lucide-react";
import { toast } from "sonner";
import { exportToPDF, exportToDOCX } from "@/utils/exportUtils";
import { EstimateData } from "@/types/estimates";
import { SummaryCard } from "./results/SummaryCard";
import { ResourceCard } from "./results/ResourceCard";

interface ResultsTableProps {
  data: EstimateData;
  onNewEstimate: () => void;
  onDataUpdate?: (newData: EstimateData) => void;
}

export function ResultsTable({ data, onNewEstimate, onDataUpdate }: ResultsTableProps) {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{[key: string]: string}>({});
  const [localData, setLocalData] = useState<EstimateData>(data);

  const handleEdit = (rowId: string, task: any) => {
    setEditingRow(rowId);
    setEditValues({
      task: task.task,
      subtask: task.subtask,
      hours: String(task.hours),
      comments: task.comments
    });
  };

  const handleSave = (taskIndex: number, subtaskIndex: number) => {
    const newData = { ...localData };
    const task = newData.estimates.tasks[taskIndex];
    
    // Update task name if this is the first subtask
    if (subtaskIndex === 0) {
      task.task = editValues.task;
    }
    
    // Update subtask details
    task.subtasks[subtaskIndex] = {
      subtask: editValues.subtask,
      hours: Number(editValues.hours),
      comments: editValues.comments
    };

    // Recalculate summary
    const allHours = newData.estimates.tasks.flatMap(t => t.subtasks.map(s => s.hours));
    newData.estimates.summary.total_hours = allHours.reduce((sum, hours) => sum + hours, 0);
    newData.estimates.summary.num_tasks = newData.estimates.tasks.length;
    newData.estimates.summary.num_subtasks = allHours.length;

    setLocalData(newData);
    onDataUpdate?.(newData);
    
    toast.success("Changes saved successfully!");
    setEditingRow(null);
    setEditValues({});
  };

  const handleInputChange = (field: string, value: string) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderEditableCell = (
    content: string | number,
    field: string,
    type: "text" | "number" = "text"
  ) => {
    if (editValues[field] !== undefined) {
      return (
        <Input
          type={type}
          value={editValues[field]}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={`${type === "number" ? "max-w-[100px] text-right" : ""} transition-all duration-200 focus:ring-2 focus:ring-primary/20`}
          autoFocus={field === "task"}
        />
      );
    }
    return <span>{content}</span>;
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="bg-card rounded-xl shadow-lg p-8 border border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Project Estimate Results
            </h2>
            <p className="text-muted-foreground mt-2">Project ID: {localData.project_id}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToPDF(localData)} 
              className="hover:bg-black hover:text-white group transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4 group-hover:text-white transition-colors" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => exportToDOCX(localData)} 
              className="hover:bg-black hover:text-white group transition-all duration-200"
            >
              <FileText className="mr-2 h-4 w-4 group-hover:text-white transition-colors" />
              Export DOCX
            </Button>
            <Button 
              size="sm" 
              onClick={onNewEstimate} 
              className="bg-primary hover:bg-black transition-colors"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Estimate
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/70">
                <TableHead className="font-semibold">Task</TableHead>
                <TableHead className="font-semibold">Subtask</TableHead>
                <TableHead className="text-right font-semibold">Hours</TableHead>
                <TableHead className="font-semibold">Comments</TableHead>
                <TableHead className="w-[100px] font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localData.estimates.tasks.map((task, taskIndex) =>
                task.subtasks.map((subtask, subtaskIndex) => {
                  const rowId = `${taskIndex}-${subtaskIndex}`;
                  const isEditing = editingRow === rowId;
                  
                  return (
                    <TableRow key={rowId} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        {subtaskIndex === 0 && (isEditing ? renderEditableCell(task.task, "task") : task.task)}
                      </TableCell>
                      <TableCell>
                        {isEditing ? renderEditableCell(subtask.subtask, "subtask") : subtask.subtask}
                      </TableCell>
                      <TableCell className="text-right">
                        {isEditing ? renderEditableCell(subtask.hours, "hours", "number") : subtask.hours}
                      </TableCell>
                      <TableCell>
                        {isEditing ? renderEditableCell(subtask.comments, "comments") : subtask.comments}
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleSave(taskIndex, subtaskIndex)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(rowId, { ...task, ...subtask })}
                            className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black hover:text-white"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard summary={localData.estimates.summary} />
        <ResourceCard resources={localData.resources} />
      </div>
    </div>
  );
}