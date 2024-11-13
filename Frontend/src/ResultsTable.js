
import React from 'react';
function ResultsTable({ projectData }) {
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
                    {projectData.map((item, index) => (
                        <tr key={index}>
                            <td>{item.task}</td>
                            <td>{item.subtask || 'N/A'}</td>
                            <td>{item.developmentHours} hours</td>
                            <td>{item.comments || 'N/A'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}