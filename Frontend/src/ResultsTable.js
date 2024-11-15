import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow } from 'docx';
import { saveAs } from 'file-saver';

function ResultsTable({ projectData }) {
    const { tasks } = projectData || {};
    if (!tasks || !Array.isArray(tasks)) {
        return <p>No tasks available to display.</p>;
    }

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Project Task Details', 10, 10);

        tasks.forEach(({ task, subtasks }, index) => {
            doc.text(`${index + 1}. ${task}`, 10, doc.lastAutoTable?.finalY || 20); // Task title
            autoTable(doc, {
                head: [['Subtask', 'Development Hours', 'Comments']],
                body: subtasks.map(({ subtask, hours, comments }) => [
                    subtask,
                    `${hours} hours`,
                    comments || 'N/A',
                ]),
                startY: doc.lastAutoTable?.finalY || 30,
            });
        });

        doc.save('Project_Estimates.pdf');
    };

    // Export to DOCX
    const exportToDOCX = () => {
        const rows = tasks.map(({ task, subtasks }) => {
            const taskHeader = new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(task)], columnSpan: 3 }),
                ],
            });

            const subtaskRows = subtasks.map(({ subtask, hours, comments }) => {
                return new TableRow({
                    children: [
                        new TableCell({ children: [new Paragraph(subtask)] }),
                        new TableCell({ children: [new Paragraph(`${hours} hours`)] }),
                        new TableCell({ children: [new Paragraph(comments || 'N/A')] }),
                    ],
                });
            });

            return [taskHeader, ...subtaskRows];
        });

        const flatRows = rows.flat(); // Flatten rows for the table
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({ text: 'Project Task Details', heading: 'Heading1' }),
                        new Table({
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph('Subtask')] }),
                                        new TableCell({ children: [new Paragraph('Development Hours')] }),
                                        new TableCell({ children: [new Paragraph('Comments')] }),
                                    ],
                                }),
                                ...flatRows,
                            ],
                        }),
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
                                <td>{taskIndex === subIndex ? taskItem.task : ''}</td>
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
