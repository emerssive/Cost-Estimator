import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle, TextRun } from "docx";
import { saveAs } from "file-saver";
import { format } from 'date-fns';

// Define interface to match the actual data structure
interface EstimateData {
  project_id?: number;
  estimates?: {
    summary?: {
      num_tasks?: number;
      num_subtasks?: number;
      total_hours?: number;
    };
    tasks?: Array<{
      task?: string;
      subtasks?: Array<{
        subtask?: string;
        hours?: number;
        comments?: string;
      }>;
    }>;
  };
  resources?: Array<{
    role?: string;
    engagement_type?: string;
    allocation_percentage?: number;
    units?: number;
  }>;
}

export const exportToPDF = (data: EstimateData) => {
  if (!data || !data.estimates) {
    console.error("No valid data provided for PDF export");
    return;
  }

  try {
    console.log("Exporting EstimateData to PDF:", data);

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });

    // Set margins
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;

    // Title
    doc.setFontSize(18);
    doc.text("Project Estimate Results", pageWidth / 2, margin + 10, { align: "center" });

    // Project ID
    doc.setFontSize(12);
    doc.text(`Project ID: ${data.project_id || 'N/A'}`, margin, margin + 20);

    // Tasks & Subtasks Table
    const tasksTableData = data.estimates.tasks?.flatMap((task) => 
      task.subtasks?.map((subtask) => [
        task.task || 'Unnamed Task',
        subtask.subtask || 'Unnamed Subtask',
        (subtask.hours?.toString() || '0'),
        subtask.comments || 'No comments'
      ]) || []
    ) || [];

    autoTable(doc, {
      startY: margin + 30,
      head: [['Task', 'Subtask', 'Hours', 'Comments']],
      body: tasksTableData,
      theme: 'striped',
      styles: { 
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255 
      },
      margin: { left: margin, right: margin }
    });

    // Summary Table
    const summary = data.estimates.summary || {};
    const summaryTableData = [
      ['Total Tasks', (summary.num_tasks?.toString() || '0')],
      ['Total Subtasks', (summary.num_subtasks?.toString() || '0')],
      ['Total Hours', (summary.total_hours?.toString() || '0')]
    ];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Metric', 'Value']],
      body: summaryTableData,
      theme: 'striped',
      styles: { 
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255 
      },
      margin: { left: margin, right: margin }
    });

    // Resource Allocation Table
    const resourcesTableData = data.resources?.map((resource) => [
      resource.role || 'Unnamed Role',
      resource.engagement_type || 'N/A',
      `${resource.allocation_percentage || 0}%`,
      (resource.units?.toString() || '0')
    ]) || [];

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 10,
      head: [['Role', 'Engagement Type', 'Allocation', 'Units']],
      body: resourcesTableData,
      theme: 'striped',
      styles: { 
        fontSize: 10,
        cellPadding: 2,
      },
      headStyles: { 
        fillColor: [41, 128, 185],
        textColor: 255 
      },
      margin: { left: margin, right: margin }
    });

    const timestamp = format(new Date(), 'dd_MM_HH_mm');
    doc.save(`Estimate_${timestamp}.pdf`);
  } catch (error) {
    console.error("Error exporting PDF:", error);
  }
};

export const exportToDOCX = async (data: EstimateData) => {
  if (!data || !data.estimates) {
    console.error("No valid data provided for DOCX export");
    return;
  }

  try {
    console.log("Exporting EstimateData to DOCX:", data);

    const doc = new Document({
      styles: {
        default: {
          document: {
            run: {
              size: "11pt",
              font: "Calibri"
            }
          }
        }
      },
      sections: [{
        properties: {
          page: {
            margin: {
              top: 1000,    // 1 inch = 2.54 cm = 1000 twips
              right: 1000,
              bottom: 1000,
              left: 1000
            }
          }
        },
        children: [
          new Paragraph({
            text: "Project Estimate Results",
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ 
            children: [
              new TextRun({
                text: `Project ID: ${data.project_id || 'N/A'}`,
                bold: true
              })
            ],
            alignment: AlignmentType.CENTER
          }),
          new Paragraph({ text: "" }),
          
          // Tasks & Subtasks Section
          new Paragraph({
            text: "Tasks & Subtasks",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: "Task", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Subtask", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Hours", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Comments", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                ],
              }),
              ...(data.estimates?.tasks || []).flatMap((task) =>
                (task.subtasks || []).map((subtask) =>
                  new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(task.task || 'Unnamed Task')] }),
                      new TableCell({ children: [new Paragraph(subtask.subtask || 'Unnamed Subtask')] }),
                      new TableCell({ children: [new Paragraph(String(subtask.hours || 0))] }),
                      new TableCell({ children: [new Paragraph(subtask.comments || 'No comments')] }),
                    ],
                  })
                )
              ),
            ],
          }),
          new Paragraph({ text: "" }),

          // Summary Section
          new Paragraph({
            text: "Summary",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: "Metric", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Value", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Tasks")] }),
                  new TableCell({ children: [new Paragraph(String(data.estimates?.summary?.num_tasks || 0))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Subtasks")] }),
                  new TableCell({ children: [new Paragraph(String(data.estimates?.summary?.num_subtasks || 0))] }),
                ],
              }),
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph("Total Hours")] }),
                  new TableCell({ children: [new Paragraph(String(data.estimates?.summary?.total_hours || 0))] }),
                ],
              }),
            ],
          }),
          new Paragraph({ text: "" }),

          // Resource Allocation Section
          new Paragraph({
            text: "Resource Allocation",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ 
                    children: [new Paragraph({ text: "Role", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Engagement Type", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Allocation", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                  new TableCell({ 
                    children: [new Paragraph({ text: "Units", alignment: AlignmentType.CENTER })],
                    shading: { fill: "4169E1" },
                    borders: { 
                      top: { style: BorderStyle.SINGLE, size: 1 },
                      bottom: { style: BorderStyle.SINGLE, size: 1 },
                      left: { style: BorderStyle.SINGLE, size: 1 },
                      right: { style: BorderStyle.SINGLE, size: 1 }
                    }
                  }),
                ],
              }),
              ...(data.resources || []).map((resource) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(resource.role || 'Unnamed Role')] }),
                    new TableCell({ children: [new Paragraph(resource.engagement_type || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(`${resource.allocation_percentage || 0}%`)] }),
                    new TableCell({ children: [new Paragraph(String(resource.units || 0))] }),
                  ],
                })
              ),
            ],
          }),
        ],
      }],
    });
    
    
    const blob = await Packer.toBlob(doc);
    const timestamp = format(new Date(), 'dd_MM_HH_mm');
    saveAs(blob, `Estimate_${timestamp}.docx`);
  } catch (error) {
    console.error("Error exporting DOCX:", error);
  }
};