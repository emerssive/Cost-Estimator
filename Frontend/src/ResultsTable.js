import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow } from 'docx';
import { saveAs } from 'file-saver';

function ResultsTable({ projectData }) {
    const [tasks, setTasks] = useState(projectData.tasks || []);
    const [editingRow, setEditingRow] = useState({}); // Track which row is being edited
    const [errors, setErrors] = useState({}); // Track errors for validation
    const [hourlyRate, setHourlyRate] = useState(0); // Hourly rate for calculations

    // Calculate total hours
    const totalHours = tasks.reduce(
        (sum, task) =>
            sum + task.subtasks.reduce((subSum, subtask) => subSum + Number(subtask.hours || 0), 0),
        0
    );

    // Handle input changes during editing
    const handleChange = (taskIndex, subtaskIndex, field, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex].subtasks[subtaskIndex][field] = value;
        setTasks(updatedTasks);
        console.log('Updated tasks during change:', JSON.stringify(updatedTasks, null, 2)); // Log updated tasks
    };

    // Handle save action for a specific row
    const handleSave = () => {
        const { taskIndex, subtaskIndex } = editingRow;
        const subtask = tasks[taskIndex].subtasks[subtaskIndex];

        // Validate input
        if (!subtask.subtask || subtask.hours <= 0 || isNaN(subtask.hours)) {
            setErrors({
                taskIndex,
                subtaskIndex,
                message: 'Subtask name cannot be empty, and hours must be a positive number.',
            });
            console.error('Validation error:', errors.message); // Log validation error
            return;
        }

        // Clear errors and exit editing mode
        setErrors({});
        setEditingRow({});
        console.log('Updated tasks after save:', JSON.stringify(tasks, null, 2)); // Log updated tasks after saving
    };


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

        // Add summary rows
        tableData.push(['', 'Total No. of Hours', `${totalHours} hours`, '']);
        tableData.push(['', 'Hourly Rate', `$${hourlyRate}`, '']);
        tableData.push(['', 'Total Cost', `$${(totalHours * hourlyRate).toFixed(2)}`, '']);

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
            docContent.push(
                new Paragraph({
                    text: task,
                    heading: 'Heading2',
                    spacing: { after: 200 },
                })
            );

            const subtaskRows = subtasks.map(({ subtask, hours, comments }) =>
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({ text: subtask, alignment: 'center' })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: `${hours} hours`, alignment: 'center' })],
                        }),
                        new TableCell({
                            children: [new Paragraph({ text: comments || 'N/A', alignment: 'center' })],
                        }),
                    ],
                })
            );

            const table = new Table({
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [new Paragraph({ text: 'Subtask', bold: true, alignment: 'center' })],
                                shading: { fill: 'DCE6F1' },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: 'Development Hours', bold: true, alignment: 'center' })],
                                shading: { fill: 'DCE6F1' },
                            }),
                            new TableCell({
                                children: [new Paragraph({ text: 'Comments', bold: true, alignment: 'center' })],
                                shading: { fill: 'DCE6F1' },
                            }),
                        ],
                    }),
                    ...subtaskRows,
                ],
                width: { size: 100, type: 'pct' },
            });

            docContent.push(table);
        });

        // Add summary
        docContent.push(
            new Paragraph({
                text: `Total No. of Hours: ${totalHours}`,
                spacing: { after: 200 },
            }),
            new Paragraph({
                text: `Hourly Rate: $${hourlyRate}`,
                spacing: { after: 200 },
            }),
            new Paragraph({
                text: `Total Cost: $${(totalHours * hourlyRate).toFixed(2)}`,
                spacing: { after: 200 },
            })
        );

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
                        taskItem.subtasks.map((subtask, subIndex) => {
                            const isEditing =
                                editingRow.taskIndex === taskIndex &&
                                editingRow.subtaskIndex === subIndex;

                            return (
                                <tr
                                    key={`${taskIndex}-${subIndex}`}
                                    className="hover-row"
                                >
                                    <td>{subIndex === 0 ? taskItem.task : ''}</td>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={subtask.subtask}
                                                onChange={(e) =>
                                                    handleChange(taskIndex, subIndex, 'subtask', e.target.value)
                                                }
                                            />
                                        ) : (
                                            subtask.subtask
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="number"
                                                value={subtask.hours}
                                                onChange={(e) =>
                                                    handleChange(taskIndex, subIndex, 'hours', e.target.value)
                                                }
                                            />
                                        ) : (
                                            `${subtask.hours} hours`
                                        )}
                                    </td>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={subtask.comments}
                                                onChange={(e) =>
                                                    handleChange(taskIndex, subIndex, 'comments', e.target.value)
                                                }
                                            />
                                        ) : (
                                            subtask.comments || 'N/A'
                                        )}
                                    </td>
                                    <td className="edit-icon-cell">
                                        {isEditing ? (

                                            <button
                                                className="save-button"
                                                onClick={handleSave}
                                            >
                                                Save
                                            </button>
                                        ) : (
                                            <span
                                                className="edit-icon"
                                                onClick={() =>
                                                    setEditingRow({
                                                        taskIndex,
                                                        subtaskIndex: subIndex,
                                                    })
                                                }
                                            >
                                                ✏️
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>

            {errors.message && <p className="error">{errors.message}</p>}
            <div className="actions">
                <button className='export-button' onClick={exportToPDF}>Export to PDF</button>
                <button className='export-button' onClick={exportToDOCX}>Export to DOCX</button>
            </div>

        </div>
    );
}

export default ResultsTable;