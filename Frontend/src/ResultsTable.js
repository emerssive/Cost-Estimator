import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function ResultsTable({ projectData }) {
    const { tasks } = projectData || {};
    if (!tasks || !Array.isArray(tasks)) {
        return <p>No tasks available to display.</p>;
    }

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Project Task Details', 14, 20);

        const tableData = [];
        tasks.forEach(({ task, subtasks }) => {
            tableData.push([task, '', '', '']);
            subtasks.forEach(({ subtask, hours, comments }) => {
                tableData.push(['', subtask, `${hours} hours`, comments || 'N/A']);
            });
        });

        autoTable(doc, {
            head: [['Task', 'Subtask', 'Development Hours', 'Comments']],
            body: tableData,
            startY: 30,
            margin: { left: 14, right: 14 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
            alternateRowStyles: { fillColor: [240, 240, 240] },
        });

        doc.save('Project_Estimates.pdf');
    };

    // Export to DOCX
    const exportToDOCX = () => {
        const docContent = [];

        tasks.forEach(({ task, subtasks }) => {
            // Add Task Header
            docContent.push(
                new Paragraph({
                    text: task,
                    heading: 'Heading2',
                    spacing: { after: 200 },
                })
            );

            // Add Subtasks Table
            const subtaskRows = subtasks.map(({ subtask, hours, comments }) =>
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ text: subtask, alignment: 'center' })],
                            shading: { fill: 'F3F3F3' },
                            margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: `${hours} hours`, alignment: 'center' })],
                            shading: { fill: 'F9F9F9' },
                            margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: comments || 'N/A', alignment: 'center' })],
                            shading: { fill: 'F3F3F3' },
                            margins: { top: 100, bottom: 100, left: 100, right: 100 },
                        }),
                    ],
                })
            );

            const table = new Table({
                rows: [
                    // Header Row
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: 'Subtask', bold: true, alignment: 'center' })],
                                shading: { fill: 'DCE6F1' },
                                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: 'Development Hours', bold: true, alignment: 'center' })],
                                shading: { fill: 'DCE6F1' },
                                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: 'Comments', bold: true, alignment: 'center' })],
                                shading: { fill: 'DCE6F1' },
                                margins: { top: 100, bottom: 100, left: 100, right: 100 },
                            }),
                        ],
                    }),
                    ...subtaskRows,
                ],
                width: { size: 100, type: 'pct' },
                alignment: 'center', // Center-align the entire table
            });

            docContent.push(table);
            docContent.push(
                new Paragraph({
                    text: '',
                    spacing: { after: 400 }, // Add space between sections
                })
            );
        });

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            text: 'Project Task Details',
                            heading: 'Heading1',
                            spacing: { after: 300 },
                        }),
                        ...docContent,
                    ],
                },
            ],
        });

        Packer.toBlob(doc).then((blob) => {
            saveAs(blob, 'Project_Estimates.docx');
        });
    };

    return (
        <div className="results-table">
            <h3>Project Task Details</h3>
            <table>
                <thead>
                    <tr>
                        <th>Task</th>
                        <th>Subtask</th>
                        <th>Development Hours</th>
                        <th>Comments</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((taskItem, taskIndex) =>
                        taskItem.subtasks.map((subtask, subIndex) => (
                            <tr key={`${taskIndex}-${subIndex}`}>
                                <td>{subIndex === 0 ? taskItem.task : ''}</td>
                                <td>{subtask.subtask}</td>
                                <td>{subtask.hours} hours</td>
                                <td>{subtask.comments || 'N/A'}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <div className="actions">
                <button onClick={exportToPDF}>Export to PDF</button>
                <button onClick={exportToDOCX}>Export to DOCX</button>
            </div>
        </div>
    );
}

export default ResultsTable;
