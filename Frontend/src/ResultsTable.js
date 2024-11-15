// src/components/ResultsTable.js
import React, { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';
import { saveAs } from 'file-saver';

function ResultsTable({ projectData, updateEstimates }) {
    const [estimates, setEstimates] = useState(projectData);

    // Handle inline editing
    const handleEdit = (index, field, value) => {
        const updatedEstimates = [...estimates];
        updatedEstimates[index][field] = value;
        setEstimates(updatedEstimates);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        setLoading(true);
    
        const formData = new FormData();
        formData.append('project_name', projectName);
        formData.append('project_size', projectSize);
        formData.append('industry', industry);
        formData.append('budget', budget);
        formData.append('timeline', timeline);
        formData.append('additional_info', additionalInfo);
        if (fileUpload) {
            formData.append('attachment', fileUpload);
        }
    
        try {
            const response = await axios.post('http://localhost:5000/projectDetails', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
    
            console.log('Backend response:', response.data); // Log the response to inspect structure
    
            // Transform estimates object into an array
            const estimatesArray = Object.values(response.data.estimates);
    
            setEstimates(estimatesArray); // Pass the array to ResultsTable
        } catch (error) {
            console.error("Error submitting project details:", error);
        } finally {
            setLoading(false);
        }
    };
    

    // Save changes (this could be extended to send updates to a backend)
    const handleSave = () => {
        updateEstimates(estimates); // Pass updated estimates to parent
        alert('Changes saved successfully!');
    };

    // Export to PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Project Task Details', 10, 10);
        autoTable(doc, {
            head: [['Task', 'Subtask', 'Development Hours', 'Comments/Notes']],
            body: estimates.map(({ task, subtask, developmentHours, comments }) => [
                task,
                subtask || 'N/A',
                `${developmentHours} hours`,
                comments || 'N/A',
            ]),
        });
        doc.save('Project_Estimates.pdf');
    };

    // Export to DOCX
    const exportToDOCX = () => {
        const rows = estimates.map(({ task, subtask, developmentHours, comments }) => {
            return new TableRow({
                children: [
                    new TableCell({ children: [new Paragraph(task)] }),
                    new TableCell({ children: [new Paragraph(subtask || 'N/A')] }),
                    new TableCell({ children: [new Paragraph(`${developmentHours} hours`)] }),
                    new TableCell({ children: [new Paragraph(comments || 'N/A')] }),
                ],
            });
        });

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({ text: 'Project Task Details', heading: 'Heading1' }),
                        new Table({
                            rows: [
                                new TableRow({
                                    children: [
                                        new TableCell({ children: [new Paragraph('Task')] }),
                                        new TableCell({ children: [new Paragraph('Subtask')] }),
                                        new TableCell({ children: [new Paragraph('Development Hours')] }),
                                        new TableCell({ children: [new Paragraph('Comments/Notes')] }),
                                    ],
                                }),
                                ...rows,
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
                        <th>Comments/Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {estimates.map((item, index) => (
                        <tr key={index}>
                            <td>
                                <input
                                    type="text"
                                    value={item.task}
                                    onChange={(e) => handleEdit(index, 'task', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={item.subtask || ''}
                                    onChange={(e) => handleEdit(index, 'subtask', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    value={item.developmentHours}
                                    onChange={(e) => handleEdit(index, 'developmentHours', e.target.value)}
                                />
                            </td>
                            <td>
                                <input
                                    type="text"
                                    value={item.comments || ''}
                                    onChange={(e) => handleEdit(index, 'comments', e.target.value)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="actions">
                <button onClick={handleSave}>Save Changes</button>
                <button onClick={exportToPDF}>Export to PDF</button>
                <button onClick={exportToDOCX}>Export to DOCX</button>
            </div>
        </div>
    );
}

export default ResultsTable;
