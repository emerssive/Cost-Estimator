import { Card } from "@/components/ui/card";

interface SummaryItem {
  label: string;
  value: number;
}

interface SummaryCardProps {
  summary: {
    num_tasks: number;
    num_subtasks: number;
    total_hours: number;
  };
}

export function SummaryCard({ summary }: SummaryCardProps) {
  const summaryItems: SummaryItem[] = [
    { label: "Total Tasks", value: summary.num_tasks },
    { label: "Total Subtasks", value: summary.num_subtasks },
    { label: "Total Hours", value: summary.total_hours },
  ];

  return (
    <Card className="p-8 rounded-xl border bg-card shadow-lg transition-all duration-200 hover:shadow-xl">
      <h3 className="text-xl font-semibold mb-6 flex items-center">
        <span className="bg-primary/10 p-2 rounded-md mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
        </span>
        Summary
      </h3>
      <div className="space-y-4">
        {summaryItems.map((item) => (
          <div 
            key={item.label}
            className="flex justify-between items-center p-3 rounded-lg hover:bg-primary/5 transition-all duration-200 cursor-default"
          >
            <span className="text-muted-foreground">{item.label}</span>
            <span className="font-semibold text-lg">{item.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}