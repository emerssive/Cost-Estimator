import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow } from 'docx';
import { saveAs } from 'file-saver';
import { Pencil, Check } from 'lucide-react';

function ResultsTable({ projectData, resources }) {
    const [tasks, setTasks] = useState(projectData.tasks || []);
    const [editingRow, setEditingRow] = useState({});
    const [errors, setErrors] = useState({});
    const [hourlyRate, setHourlyRate] = useState(0);
    const [allocations] = useState(resources || []);
    console.log("bilal", allocations);
    const totalHours = tasks.reduce(
        (sum, task) =>
            sum + task.subtasks.reduce((subSum, subtask) => subSum + Number(subtask.hours || 0), 0),
        0
    );

    const handleChange = (taskIndex, subtaskIndex, field, value) => {
        const updatedTasks = [...tasks];
        updatedTasks[taskIndex].subtasks[subtaskIndex][field] = value;
        setTasks(updatedTasks);
        console.log('Updated tasks during change:', JSON.stringify(updatedTasks, null, 2));
    };

    const handleSave = (taskIndex, subtaskIndex) => {
        const subtask = tasks[taskIndex].subtasks[subtaskIndex];

        if (!subtask.subtask || subtask.hours <= 0 || isNaN(subtask.hours)) {
            setErrors({
                taskIndex,
                subtaskIndex,
                message: 'Subtask name cannot be empty, and hours must be a positive number.',
            });
            return;
        }

        setErrors({});
        setEditingRow({});
    };

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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((taskItem, taskIndex) =>
                        taskItem.subtasks.map((subtask, subIndex) => {
                            const isEditing =
                                editingRow.taskIndex === taskIndex &&
                                editingRow.subtaskIndex === subIndex;

                            return (
                                <tr key={`${taskIndex}-${subIndex}`}>
                                    <td>{subIndex === 0 ? taskItem.task : ''}</td>
                                    <td>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={subtask.subtask}
                                                onChange={(e) =>
                                                    handleChange(taskIndex, subIndex, 'subtask', e.target.value)
                                                }
                                                className="edit-input"
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
                                                className="edit-input"
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
                                                className="edit-input"
                                            />
                                        ) : (
                                            subtask.comments || 'N/A'
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            {isEditing ? (
                                                <button
                                                    onClick={() => handleSave(taskIndex, subIndex)}
                                                    className="save-button"
                                                    title="Save changes"
                                                >
                                                    <Check size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setEditingRow({
                                                            taskIndex,
                                                            subtaskIndex: subIndex,
                                                        })
                                                    }
                                                    className="edit-button"
                                                    title="Edit row"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    {/* Summary Rows */}
                    <tr className="summary-row">
                        <td colSpan="2"><strong>Total No. of Hours</strong></td>
                        <td colSpan="3">{totalHours} hours</td>
                    </tr>
                    <tr className="summary-row">
                        <td colSpan="2"><strong>Hourly Rate</strong></td>
                        <td colSpan="3">
                            <input
                                type="number"
                                value={hourlyRate}
                                onChange={(e) => setHourlyRate(Number(e.target.value))}
                                placeholder="Enter rate"
                                className="rate-input"
                            />
                        </td>
                    </tr>
                    <tr className="summary-row">
                        <td colSpan="2"><strong>Total Cost</strong></td>
                        <td colSpan="3">${(totalHours * hourlyRate).toFixed(2)}</td>
                    </tr>
                </tbody>
            </table>

            {/* Resources Section */}
            <div className="resources-section">
                <h3>Resources Allocation</h3>
                <table>
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Engagement Type</th>
                            <th>Allocation Percentage</th>
                            <th>Units</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allocations && allocations.length > 0 ? (
                            allocations.map((resource, index) => (
                                <tr key={index}>
                                    <td>{resource.role}</td>
                                    <td>{resource.engagement_type}</td>
                                    <td>{resource.allocation_percentage}%</td>
                                    <td>{resource.units}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center">No resources allocated</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {errors.message && <p className="error">{errors.message}</p>}
            
            <div className="export-buttons">
                <button className="action-button" onClick={exportToPDF}>
                    Export to PDF
                </button>
                <button className="action-button" onClick={exportToDOCX}>
                    Export to DOCX
                </button>
            </div>
        </div>
    );
}

export default ResultsTable;
