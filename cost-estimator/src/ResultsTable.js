// src/components/ResultsTable.js
import React from 'react';

function ResultsTable({ projectName, projectSize, budget, timeline, additionalInfo, fileUpload }) {
    return (
        <div className="results-table">
            <h3>Submitted Project Details</h3>
            <table>
                <thead>
                    <tr>
                        <th>Project Name</th>
                        <th>Size</th>
                        <th>Budget (USD)</th>
                        <th>Timeline (weeks)</th>
                        <th>Additional Info</th>
                        <th>Uploaded File</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{projectName}</td>
                        <td>{projectSize}</td>
                        <td>${budget}</td>
                        <td>{timeline} weeks</td>
                        <td>{additionalInfo || 'N/A'}</td>
                        <td>{fileUpload}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default ResultsTable;
