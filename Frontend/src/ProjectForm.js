// src/components/ProjectForm.js
import React, { useState } from 'react';
import axios from 'axios';
import ResultsTable from './ResultsTable';
import { Snackbar, LinearProgress } from '@mui/material';
import { Alert } from '@mui/material';


function ProjectForm() {
    const [projectName, setProjectName] = useState('');
    const [projectSize, setProjectSize] = useState('');
    const [industry, setIndustry] = useState('');
    const [budget, setBudget] = useState('');
    const [timeline, setTimeline] = useState('');
    const [additionalInfo, setAdditionalInfo] = useState('');
    const [fileUpload, setFileUpload] = useState(null);
    const [estimates, setEstimates] = useState(null); // Store estimates data
    const [errors, setErrors] = useState({}); // State to store validation errors
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('error');
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');


    const validateFields = () => {
        const newErrors = {};

        // Validate project name
        if (!projectName.trim()) {
            newErrors.projectName = "Project Name is required";
        }

        // Validate project size
        if (!projectSize) {
            newErrors.projectSize = "Please select a Project Size";
        }

        // Validate industry
        if (!industry) {
            newErrors.industry = "Please select an Industry";
        }

        // Validate budget
        if (!budget || budget <= 0) {
            newErrors.budget = "Budget must be a positive number";
        }

        // Validate timeline
        if (!timeline || timeline <= 0 || !Number.isInteger(Number(timeline))) {
            newErrors.timeline = "Timeline must be a positive integer";
        }

        // Validate file type if a file is provided
        if (fileUpload) {
            const allowedExtensions = ['txt', 'docx', 'pdf'];
            const fileExtension = fileUpload.name.split('.').pop().toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
                newErrors.fileUpload = "File type must be .txt, .docx, or .pdf";
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0; // Return true if no errors
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate all fields
        if (!validateFields()) {
            setSnackbarMessage('Please fix the errors in the form.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return; // Stop submission if there are validation errors
        }

        setLoading(true);  // Show the loading bar
        setEstimates(null);

        // Use FormData to include file and other data
        const formData = new FormData();
        formData.append('project_name', projectName);
        formData.append('project_size', projectSize);
        formData.append('industry', industry);
        formData.append('budget', budget);
        formData.append('timeline', timeline);
        formData.append('additional_info', additionalInfo);
        formData.append('start_date', startDate || '');
        formData.append('end_date', endDate || '');

        if (fileUpload) {
            formData.append('attachment', fileUpload);
        }

        try {
            // Send the form data to the backend
            const response = await axios.post('https://d640-2400-adc5-116-a500-00-2.ngrok-free.app/projectDetails', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setEstimates(response.data.data.estimates);
                setSnackbarMessage('Project estimates calculated successfully!');
                setSnackbarSeverity('success');
            } else {
                setSnackbarMessage(response.data.message || 'Something went wrong');
                setSnackbarSeverity('error');
            }

            setOpenSnackbar(true);

        } catch (error) {
            console.error("Error submitting project details:", error);
            console.error("Error submitting project details:", error);
            setSnackbarMessage('An error occurred while submitting the form.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
        finally {
            setLoading(false);  // Hide the loading bar
        }
    };

    const handleCloseSnackbar = () => {
        setOpenSnackbar(false);
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
                    />
                    {errors.projectName && <p className="error">{errors.projectName}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="projectSize">Project Size</label>
                    <select
                        id="projectSize"
                        value={projectSize}
                        onChange={(e) => setProjectSize(e.target.value)}
                    >
                        <option value="">Select Size</option>
                        <option value="Small">Small</option>
                        <option value="Medium">Medium</option>
                        <option value="Large">Large</option>
                    </select>
                    {errors.projectSize && <p className="error">{errors.projectSize}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="industry">Industry</label>
                    <select
                        id="industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
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
                    {errors.industry && <p className="error">{errors.industry}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="budget">Budget (USD)</label>
                    <input
                        type="number"
                        id="budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                    />
                    {errors.budget && <p className="error">{errors.budget}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="timeline">Timeline (weeks)</label>
                    <input
                        type="number"
                        id="timeline"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                    />
                    {errors.timeline && <p className="error">{errors.timeline}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="startDate">Project Start Date (Optional)</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="endDate">Project End Date (Optional)</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
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
                        onChange={(e) => setFileUpload(e.target.files[0])}
                    />
                    {errors.fileUpload && <p className="error">{errors.fileUpload}</p>}
                </div>

                <button type="submit" className="submit-button">Submit</button>
            </form>

            {/* Loading Bar */}
            {loading && (
                <div style={{ marginTop: '20px' }}>
                    <LinearProgress sx={{ width: '100%' }} />
                </div>
            )}

            {/* Snackbar for errors or success */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

            {/* Display the estimates in ResultsTable if available */}
            {estimates && <ResultsTable projectData={estimates} />}
        </div>
    );
}

export default ProjectForm;

