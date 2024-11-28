import jsPDF from "jspdf";
import { Document, Packer, Paragraph, Table, TableRow, TableCell, HeadingLevel, AlignmentType } from "docx";
import { saveAs } from "file-saver";
import { EstimateData } from "@/types/estimates";

export const exportToPDF = (data: EstimateData) => {
  const doc = new jsPDF();
  let yPos = 20;

  // Title
  doc.setFontSize(20);
  doc.text("Project Estimate Results", 20, yPos);
  yPos += 15;

  // Project ID
  doc.setFontSize(12);
  doc.text(`Project ID: ${data.project_id}`, 20, yPos);
  yPos += 15;

  // Tasks Section
  doc.setFontSize(16);
  doc.text("Tasks & Subtasks", 20, yPos);
  yPos += 10;
  doc.setFontSize(12);

  data.estimates.tasks.forEach((task) => {
    doc.text(task.task, 20, yPos);
    yPos += 8;
    task.subtasks.forEach((subtask) => {
      doc.text(`• ${subtask.subtask}`, 25, yPos);
      yPos += 6;
      doc.text(`  Hours: ${subtask.hours}`, 30, yPos);
      yPos += 6;
      doc.text(`  Comments: ${subtask.comments}`, 30, yPos);
      yPos += 8;
    });
    yPos += 5;
  });

  // Summary Section
  yPos += 10;
  doc.setFontSize(16);
  doc.text("Summary", 20, yPos);
  yPos += 10;
  doc.setFontSize(12);
  doc.text(`Total Tasks: ${data.estimates.summary.num_tasks}`, 25, yPos);
  yPos += 8;
  doc.text(`Total Subtasks: ${data.estimates.summary.num_subtasks}`, 25, yPos);
  yPos += 8;
  doc.text(`Total Hours: ${data.estimates.summary.total_hours}`, 25, yPos);

  // Resource Allocation
  yPos += 15;
  doc.setFontSize(16);
  doc.text("Resource Allocation", 20, yPos);
  yPos += 10;
  doc.setFontSize(12);

  data.resources.forEach((resource) => {
    doc.text(`${resource.role}:`, 25, yPos);
    yPos += 6;
    doc.text(`• Engagement Type: ${resource.engagement_type}`, 30, yPos);
    yPos += 6;
    doc.text(`• Allocation: ${resource.allocation_percentage}%`, 30, yPos);
    yPos += 6;
    doc.text(`• Units: ${resource.units}`, 30, yPos);
    yPos += 10;
  });

  doc.save("project-estimate.pdf");
};

export const exportToDOCX = async (data: EstimateData) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "Project Estimate Results",
          heading: HeadingLevel.HEADING_1,
          alignment: AlignmentType.CENTER
        }),
        new Paragraph({ 
          text: `Project ID: ${data.project_id}`,
          alignment: AlignmentType.LEFT
        }),
        new Paragraph({ text: "" }),
        
        // Tasks & Subtasks Section
        new Paragraph({
          text: "Tasks & Subtasks",
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Task", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph({ text: "Subtask", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph({ text: "Hours", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph({ text: "Comments", style: "Strong" })] }),
              ],
            }),
            ...data.estimates.tasks.flatMap((task) =>
              task.subtasks.map((subtask) =>
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(task.task)] }),
                    new TableCell({ children: [new Paragraph(subtask.subtask)] }),
                    new TableCell({ children: [new Paragraph(String(subtask.hours))] }),
                    new TableCell({ children: [new Paragraph(subtask.comments)] }),
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
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Total Tasks", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph(String(data.estimates.summary.num_tasks))] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Total Subtasks", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph(String(data.estimates.summary.num_subtasks))] }),
              ],
            }),
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Total Hours", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph(String(data.estimates.summary.total_hours))] }),
              ],
            }),
          ],
        }),
        new Paragraph({ text: "" }),

        // Resource Allocation Section
        new Paragraph({
          text: "Resource Allocation",
          heading: HeadingLevel.HEADING_2,
        }),
        new Table({
          rows: [
            new TableRow({
              children: [
                new TableCell({ children: [new Paragraph({ text: "Role", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph({ text: "Engagement Type", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph({ text: "Allocation", style: "Strong" })] }),
                new TableCell({ children: [new Paragraph({ text: "Units", style: "Strong" })] }),
              ],
            }),
            ...data.resources.map((resource) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(resource.role)] }),
                  new TableCell({ children: [new Paragraph(resource.engagement_type)] }),
                  new TableCell({ children: [new Paragraph(`${resource.allocation_percentage}%`)] }),
                  new TableCell({ children: [new Paragraph(String(resource.units))] }),
                ],
              })
            ),
          ],
        }),
      ],
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "project-estimate.docx");
};