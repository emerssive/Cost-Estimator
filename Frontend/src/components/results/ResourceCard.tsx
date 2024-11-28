import { Card } from "@/components/ui/card";

interface Resource {
  role: string;
  allocation_percentage: number;
  engagement_type: string;
  units: number;
}

interface ResourceCardProps {
  resources: Resource[];
}

export function ResourceCard({ resources }: ResourceCardProps) {
  return (
    <Card className="p-8 rounded-xl border bg-card shadow-lg transition-all duration-200 hover:shadow-xl">
      <h3 className="text-xl font-semibold mb-6 flex items-center">
        <span className="bg-primary/10 p-2 rounded-md mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </span>
        Resource Allocation
      </h3>
      <div className="space-y-4">
        {resources.map((resource, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg hover:bg-primary/5 transition-all duration-200 cursor-default"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{resource.role}</span>
              <span className="text-primary font-semibold">{resource.allocation_percentage}%</span>
            </div>
            <div className="text-sm text-muted-foreground flex justify-between">
              <span>{resource.engagement_type}</span>
              <span>{resource.units} {resource.units === 1 ? 'unit' : 'units'}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}