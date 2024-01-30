import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import DateInput from './DateInput';
import DropdownInput from './DropdownInput';
import { generateReportA, generateReportB, generateReportAnnexTable} from './generateReport';
import './CustomReporting.css';
// Additional imports here (e.g., Bootstrap components)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


const ParentComponent = () => {

    const [clients, setClients] = useState([]);
    const [reports, setReports] = useState([{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }, { value: 'AnnexTable', label: 'Annex Table' }]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedReport, setSelectedReport] = useState({});
    const [clientDeptData, setClientDeptData] = useState([]);
    const [clientDeptProjData, setClientDeptProjData] = useState([]);
    const [deptHrsMins, setDeptHrsMins] = useState([]);
    const [deptDecHrsMins, setDeptDecHrsMins] = useState([]);
    const [projHrsMins, setProjHrsMins] = useState([]);
    const [projDecHrsMins, setProjDecHrsMins] = useState([]);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [totalHrsMins, setTotalHrsMins] = useState([]);
    const [totalDecimalHours, setTotalDecimalHours] = useState([]);
    const [projectData, setprojectData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clients/data/${selectedReport.value}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startDate, endDate, client: selectedClient }),
            });

            const data = await response.json();
            if (selectedReport.label === 'A') {
                
                setClientDeptData(data.entries);
                setDeptHrsMins(data.deptHrsMins);
                setDeptDecHrsMins(data.deptDecHrsMins);
                setTotalHrsMins(data.totalHrsMins);
                setTotalDecimalHours(data.totalDecHrsMins);

            } else if (selectedReport.value === 'B') {
                
                setClientDeptProjData(data.deptProjectEntries);
                setDeptHrsMins(data.deptHrsMins);
                setDeptDecHrsMins(data.deptDecHrsMins);
                setProjHrsMins(data.projHrsMins);
                setProjDecHrsMins(data.projDecHrsMins);
                setTotalHrsMins(data.totalHrsMins);
                setTotalDecimalHours(data.totalDecHrsMins);
                
            } else if (selectedReport.value === 'AnnexTable') {

                setprojectData(data);

            }

            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the default form submission action
        const data = await fetchData(previewPdf);  // Triggers the API call
        return data;
    };

    const handleApplyFiltersAndPreview = async (e) => {
        await handleSubmit(e);
    };

    // Add this useEffect hook
    useEffect(() => {

        if ((clientDeptData && totalHrsMins && totalDecimalHours && deptHrsMins && deptDecHrsMins) || (clientDeptProjData && projHrsMins && projDecHrsMins && deptHrsMins && deptDecHrsMins && totalHrsMins && totalDecimalHours) || (projectData)) {
            previewPdf();
        }
    }, [clientDeptData, totalHrsMins, totalDecimalHours, deptHrsMins, deptDecHrsMins, clientDeptProjData, projHrsMins, projDecHrsMins, projectData]);
        

    // Fetch clients for the first dropdown
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/clients`)
            .then(response => response.json())
            .then(data => setClients(data.map(client => ({ value: client.value, label: client.label }))))
            .catch(error => console.error('Error fetching clients:', error));
    }, []);

    const previewPdf = () => {
        if (selectedReport.value === 'A') {
            const doc = generateReportA(clientDeptData, deptHrsMins, deptDecHrsMins, totalHrsMins, totalDecimalHours); // Replace 'yourData' with the actual data
            const dataUrl = doc.output('datauristring');
            setPdfDataUrl(dataUrl);
        } else if (selectedReport.value === 'B') {
            const doc = generateReportB(clientDeptProjData, projHrsMins, projDecHrsMins, deptHrsMins, deptDecHrsMins, totalHrsMins, totalDecimalHours); // Replace 'yourData' with the actual data
            const dataUrl = doc.output('datauristring');
            setPdfDataUrl(dataUrl);
        } else if (selectedReport.value === 'AnnexTable') {
            const doc = generateReportAnnexTable(projectData); // Replace 'yourData' with the actual data
            const dataUrl = doc.output('datauristring');
            setPdfDataUrl(dataUrl);
        }
    };

    const downloadPdf = async () => {
        try {
            const confirmDownload = window.confirm('Download PDF?');
            if (!confirmDownload) {
                return;
            }
    
            let doc;
            // const doc = generatePdfDocument(clientDeptData, totalHrsMins, totalDecimalHours, deptHrsMins, deptDecHrsMins);
            if (selectedReport.value === 'A') {
                // clientData, deptHrsMins, deptDecHrsMins, totalHrsMins, totalDecimalHours
                doc = generateReportA(clientDeptData, deptHrsMins, deptDecHrsMins, totalHrsMins, totalDecimalHours);
            } else if (selectedReport.value === 'B') {
                // clientDeptProjData, projHrsMins, projDecHrsMins, deptHrsMins, deptDecHrsMins, totalHrsMins, totalDecimalHours
                doc = generateReportB(clientDeptProjData, projHrsMins, projDecHrsMins, deptHrsMins, deptDecHrsMins, totalHrsMins, totalDecimalHours);
            } else if (selectedReport.value === 'AnnexTable') {
                doc = generateReportAnnexTable(projectData);
            }
            
            const pdfData = doc.output('blob');
            const downloadUrl = window.URL.createObjectURL(pdfData);
            const link = document.createElement('a');
            link.href = downloadUrl;
            const date = new Date(endDate);
            const year = date.getFullYear();
            let month = date.getMonth() + 1; // getMonth() is zero-based
            month = month < 10 ? '0' + month : month;
            const yearMonth = '' + year + month;
            const filename = `${selectedClient}_${yearMonth}.pdf`;
            link.download = filename;
            link.click();
        } catch (error) {
            window.alert('Error downloading PDF. Did you select all required filters?')
            console.error('Error downloading PDF:', error);
        }
    };


    return (
        <div>
            <header> DLC Custom Reports TEST</header>
            <div className='menu'>                    
                <ul className="nav justify-content-center">
                    <li className="nav-item">
                        <a className="nav-link" href="/">Time Entry</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/reporting">Reports</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link active" aria-current="page" href="/customreporting">Custom Reports</a>
                    </li>
                </ul>
            </div>
            <form className='entryForm form-spacing' onSubmit={handleSubmit}>
                <DateInput 
                    label="Start Date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <DateInput 
                    label="End Date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <DropdownInput 
                    label="Client"
                    value={selectedClient}
                    onChange={(e) => setSelectedClient(e.target.value)}
                    options={clients}
                    defaultOption={"Select a client"}
                />
                <DropdownInput 
                    label="Report Type"
                    value={selectedReport.value}
                    // onChange={(e) => setSelectedReport(e.target.value)}
                    onChange={(e) => {
                        const selectedOption = reports.find(option => option.value === e.target.value);
                        setSelectedReport(selectedOption);
                    }}
                    options={reports}
                    defaultOption={"Select a report"}
                />
                {/* <button type="submit" className="btn btn-primary">Apply Filters</button> */}
            </form>
            <div className='buttonField'>
                <button className="btn btn-outline-dark " onClick={handleApplyFiltersAndPreview}>Preview Report</button>
                <button className="btn btn-outline-dark" onClick={downloadPdf}>Download PDF</button>
                {/* <button onClick={previewPdf}>Preview Report</button> */}
            </div>
                {pdfDataUrl && <iframe src={pdfDataUrl} style={{width: '100%', height: '500px'}}></iframe>}
        </div>
    );
}

const CustomReporting = () => {
    // State and logic will go here

    return (
        <div>
            <ParentComponent />
        </div>
    );
}

export default CustomReporting;
