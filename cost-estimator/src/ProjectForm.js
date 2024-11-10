// src/components/ProjectForm.js
import React, { useState } from 'react';
import ResultsTable from './ResultsTable';

function ProjectForm() {
    const [projectName, setProjectName] = useState('');
    const [projectSize, setProjectSize] = useState('');
    const [industry, setIndustry] = useState(''); // New state for industry
    const [budget, setBudget] = useState('');
    const [timeline, setTimeline] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [fileUpload, setFileUpload] = useState(null);
    const [formSubmitted, setFormSubmitted] = useState(false);

    // Validation Error States
    const [errors, setErrors] = useState({
        projectName: false,
        projectSize: false,
        industry: false, // New validation for industry
        budget: false,
        timeline: false,
        fileUpload: false,
    });

    const validateFileType = (file) => {
        const allowedExtensions = ['txt', 'docx', 'pdf'];
        const fileExtension = file.name.split('.').pop().toLowerCase();
        return allowedExtensions.includes(fileExtension);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newErrors = {
            projectName: !projectName,
            projectSize: !projectSize,
            industry: !industry, // Validate industry selection
            budget: !budget,
            timeline: !timeline,
            fileUpload: !fileUpload || !validateFileType(fileUpload),
        };

        setErrors(newErrors);

        if (Object.values(newErrors).every(error => !error)) {
            setFormSubmitted(true);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit} className="project-form">
                <h2>Project Form</h2>

                <div className="form-group">
                    <label htmlFor="projectName">Project Name</label>
                    <input
                        type="text"
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                    />
                    {errors.projectName && <p className="error">Project name is required.</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="projectSize">Project Size</label>
                    <select
                        id="projectSize"
                        value={projectSize}
                        onChange={(e) => setProjectSize(e.target.value)}
                        required
                    >
                        <option value="">Select Size</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                    {errors.projectSize && <p className="error">Project size is required.</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="industry">Industry</label>
                    <select
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        required
                    >
                        <option value="">Select Industry</option>
                        <option value="Ecommerce">Ecommerce</option>
                        <option value="Software Development">Software Development</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Finance">Finance</option>
                        <option value="Education">Education</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Manufacturing">Manufacturing</option>
                        <option value="Other">Other</option>
                    </select>
                    {errors.industry && <p className="error">Industry is required.</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="budget">Budget (USD)</label>
                    <input
                        type="number"
                        id="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        required
                    />
                    {errors.budget && <p className="error">Budget is required.</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="timeline">Timeline (weeks)</label>
                    <input
                        type="number"
                        id="timeline"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        required
                    />
                    {errors.timeline && <p className="error">Timeline is required.</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="additionalInfo">Additional Information</label>
                    <textarea
                        id="additionalInfo"
                        value={additionalInfo}
                        onChange={(e) => setAdditionalInfo(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="fileUpload">Upload File</label>
                    <input
                        type="file"
                        id="fileUpload"
                        accept=".txt, .docx, .pdf"
                        onChange={(e) => setFileUpload(e.target.files[0])}
                        required
                    />
                    {errors.fileUpload && <p className="error">Please upload a valid file (.txt, .docx, .pdf).</p>}
                </div>

                <button type="submit" className="submit-button">Submit</button>
            </form>

            {formSubmitted && (
                <ResultsTable
                    projectName={projectName}
                    projectSize={projectSize}
                    industry={industry} // Pass industry to ResultsTable
                    budget={budget}
                    timeline={timeline}
                    additionalInfo={additionalInfo}
                    fileUpload={fileUpload.name}
                />
            )}
        </div>
    );
}

export default ProjectForm;
