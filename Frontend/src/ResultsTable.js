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
                    {projectData.tasks.map((task, taskIndex) => (
                        task.subtasks.map((subtask, subtaskIndex) => (
                            <tr key={`${taskIndex}-${subtaskIndex}`}>
                                <td>{subtaskIndex === 0 ? task.task : ''}</td>
                                <td>{subtask.subtask}</td>
                                <td>{subtask.hours} hours</td>
                                <td>{subtask.comments || 'N/A'}</td>
                            </tr>
                        ))
                    ))}
                </tbody>
            </table>

            <div className="summary">
                <h4>Summary</h4>
                <ul>
                    <li><strong>Total Hours:</strong> {projectData.summary.total_hours} hours</li>
                    <li><strong>Total Tasks:</strong> {projectData.summary.num_tasks}</li>
                    <li><strong>Total Subtasks:</strong> {projectData.summary.num_subtasks}</li>
                </ul>
            </div>
        </div>
    );
}

export default ResultsTable;
