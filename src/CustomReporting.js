import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import NavigationBar from './NavigationBar';
import DateInput from './DateInput';
import DropdownInput from './DropdownInput';
import FormatDate from './FormatDate';
import FormatDifference from './FormatDifference';
import './CustomReporting.css';
// Additional imports here (e.g., Bootstrap components)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// clientData, totalHrsMins, totalDecimalHours, deptHrsMins, deptDecHrsMins
const generatePdfDocument = (clientData, totalHrsMins, totalDecimalHours, deptHrsMins, deptDecHrsMins) => {

    const doc = new jsPDF();
    doc.setFontSize(8); // Set the font size to 12 points

    // if (!Array.isArray(data)) {
    // console.error("Invalid data format. Expected an array:", data);
    // return doc;
    // }
    // Example: Adding text to the PDF. You should replace this with your actual data formatting

    doc.setFontSize(12);
    doc.text("Hourly Breakdown", 10, 20);
    doc.setFontSize(8);
    
    const columns = ["Kunde", "Abteilung", "Datum", "Startzeit", "Endzeit", "Arbeitszeit", "Projekt", "Counterparty", "Beratung", "DLC Staff"]; // Add more columns as needed
    let startY = 30;
    const marginHorizontal = 10;
    const fontSize = 8;
    const lineOffset = 5;
    const textOffset = 12;

    // iterate through clientData Array of Arrays
    clientData.forEach((data, index) => {

        const tableData = data.map(item => [
            item.client, 
            item.department, 
            new Date(item.start_time).toLocaleDateString('de-GE', { day: '2-digit', month: '2-digit', year: 'numeric' }), // Format the date as DD.MM.YYYY
            new Date(item.start_time).toLocaleTimeString('de-GE', { hour: '2-digit', minute: '2-digit' }), // Get the time in HH:MM format
            new Date(item.end_time).toLocaleTimeString('de-GE', { hour: '2-digit', minute: '2-digit' }), // Get the time in HH:MM format     
            FormatDifference(item.time_diff_hrs_mins), 
            item.project, 
            item.counterparty, 
            item.description, 
            item.pid // Map other fields as needed
        ]);

        doc.autoTable({
            head: [columns],
            body: tableData,
            startY,
            margin: { horizontal: marginHorizontal },
            styles: { overflow: 'linebreak', fontSize},
            bodyStyles: { valign: 'top' },
            columnStyles: { id: { fontStyle: 'bold' } }, // Example: making 'id' column bold
            headStyles: { fillColor: [212,165,154] }
        });

        doc.line(10, doc.autoTable.previous.finalY + lineOffset, 210 - 10, doc.autoTable.previous.finalY + lineOffset); // 210 and 15 are the width of the page
        doc.text(`Arbeitszeit: \t${String(deptHrsMins[index])} h \t\t Dezimal: \t${String(deptDecHrsMins[index])} h`, 10, doc.autoTable.previous.finalY + textOffset); // Example: adding text below the table   

        startY = doc.autoTable.previous.finalY + 20;
    });

    if (doc.autoTable.previous && typeof doc.autoTable.previous.finalY === 'number') {
        let finalY = doc.autoTable.previous.finalY;
        doc.line(10, finalY + 20, 210 - 10, finalY +20);
        doc.text('Gesamt', 10, finalY + 30); // Example: adding text below the table
        doc.text(`Arbeitszeit: \t${String(totalHrsMins)} h \t\t Dezimal: \t${String(totalDecimalHours)} h`, 10, finalY + 35); // Example: adding text below the table   
        doc.line(10, finalY + 37, 210 - 10, finalY + 37); // 210 and 15 are the width of the page
        doc.line(10, finalY + 38, 210 - 10, finalY + 38); // 210 and 15 are the width of the page
    }



  

    return doc

};




const ParentComponent = () => {

    const [clients, setClients] = useState([]);
    const [reports, setReports] = useState([{ value: 'A', label: 'A' }, { value: 'B', label: 'B' }]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedReport, setSelectedReport] = useState('');
    const [clientDeptData, setClientDeptData] = useState([]);
    const [deptHrsMins, setDeptHrsMins] = useState([]);
    const [deptDecHrsMins, setDeptDecHrsMins] = useState([]);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [totalHrsMins, setTotalHrsMins] = useState([]);
    const [totalDecimalHours, setTotalDecimalHours] = useState([]);

    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clients/data/${selectedReport}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startDate, endDate, client: selectedClient }),
            });
            const data = await response.json();

            setClientDeptData(data.entries);
            setDeptHrsMins(data.deptHrsMins);
            setDeptDecHrsMins(data.deptDecHrsMins);
            setTotalHrsMins(data.totalHrsMins);
            setTotalDecimalHours(data.totalDecHrsMins);

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

        if (clientDeptData && totalHrsMins && totalDecimalHours && deptHrsMins && deptDecHrsMins) {
            previewPdf();
        }
    }, [clientDeptData, totalHrsMins, totalDecimalHours, deptHrsMins, deptDecHrsMins]);
        

    // Fetch clients for the first dropdown
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/clients`)
            .then(response => response.json())
            .then(data => setClients(data.map(client => ({ value: client.value, label: client.label }))))
            .catch(error => console.error('Error fetching clients:', error));
    }, []);

    const previewPdf = () => {
        const doc = generatePdfDocument(clientDeptData, totalHrsMins, totalDecimalHours, deptHrsMins, deptDecHrsMins); // Replace 'yourData' with the actual data
        const dataUrl = doc.output('datauristring');
        setPdfDataUrl(dataUrl);
    };

    const downloadPdf = async () => {
        try {
            const confirmDownload = window.confirm('Download PDF?');
            if (!confirmDownload) {
                return;
            }
    
            const doc = generatePdfDocument(clientDeptData, totalHrsMins, totalDecimalHours, deptHrsMins, deptDecHrsMins);
            const pdfData = doc.output('blob');
            const downloadUrl = window.URL.createObjectURL(pdfData);
            const link = document.createElement('a');
            link.href = downloadUrl;
            const dateStr = clientDeptData[0][0].end_time;  
            const date = new Date(dateStr);
            const year = date.getFullYear();
            let month = date.getMonth() + 1; // getMonth() is zero-based
            month = month < 10 ? '0' + month : month;
            const yearMonth = '' + year + month;

            const filename = `${clientDeptData[0][0].client}_${yearMonth}.pdf`;
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
                    value={selectedReport}
                    onChange={(e) => setSelectedReport(e.target.value)}
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
