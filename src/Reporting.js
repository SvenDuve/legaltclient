import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import NavigationBar from './NavigationBar';
import DateInput from './DateInput';
import DropdownInput from './DropdownInput';
import FormatDate from './FormatDate';
import FormatDifference from './FormatDifference';
import './Reporting.css';
// Additional imports here (e.g., Bootstrap components)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


const generatePdfDocument = (data, totalHrsMins, totalDecimalHours) => {

    const doc = new jsPDF();
    doc.setFontSize(8); // Set the font size to 12 points

    if (!Array.isArray(data)) {
    console.error("Invalid data format. Expected an array:", data);
    return doc;
    }
    // Example: Adding text to the PDF. You should replace this with your actual data formatting

    doc.setFontSize(12);
    doc.text("Hourly Breakdown", 10, 20);
    doc.setFontSize(8);
    
    // Define the table columns and data
    const columns = ["Client", "Start Time", "End Time", "Time Difference", "Project", "Description", "DLC Staff"]; // Add more columns as needed
    // Add the table to the document
    const tableData = data.map(item => [
    item.client, FormatDate(item.start_time), FormatDate(item.end_time), FormatDifference(item.time_diff_hrs_mins), item.project, item.description, item.pid // Map other fields as needed
    ]);

    doc.autoTable({
    head: [columns],
    body: tableData,
    startY: 30,
    margin: { horizontal: 10 },
    styles: { overflow: 'linebreak', fontSize: 8},
    bodyStyles: { valign: 'top' },
    columnStyles: { id: { fontStyle: 'bold' } }, // Example: making 'id' column bold
    headStyles: { fillColor: [212,165,154] }
    });
    doc.line(10, doc.autoTable.previous.finalY + 5, 210 - 10, doc.autoTable.previous.finalY + 5); // 210 and 15 are the width of the page

    doc.text(`Total Hours: \t${String(totalHrsMins)} h \t\t Decimal: \t${String(totalDecimalHours)} h`, 10, doc.autoTable.previous.finalY + 12); // Example: adding text below the table   
  
//   data.entries.forEach((item, index) => {
//     doc.text(`${item.client} - ${item.start_time} - ${item.end_time} - ${item.time_diff_hrs_mins} - ${item.project} - ${item.description} - ${item.pid}`, 10    , 30 + (10 * index));
//   });

  return doc;
};




const ParentComponent = () => {

    
    const [clients, setClients] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedClient, setSelectedClient] = useState('');
    const [clientData, setClientData] = useState([]);
    const [pdfDataUrl, setPdfDataUrl] = useState(null);
    const [totalHrsMins, setTotalHrsMins] = useState([]);
    const [totalDecimalHours, setTotalDecimalHours] = useState([]);


    const fetchData = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/clients/data`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ startDate, endDate, client: selectedClient }),
            });
            const data = await response.json();

            setClientData(data.entries);
            setTotalHrsMins(data.totalHrsMins);
            setTotalDecimalHours(data.totalDecimalHours);

            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the default form submission action
        console.log('Submitting form...');
        const data = await fetchData(previewPdf);  // Triggers the API call
        return data;
    };

    const handleApplyFiltersAndPreview = async (e) => {
        await handleSubmit(e);
    };

    // Add this useEffect hook
    useEffect(() => {
        if (clientData && totalHrsMins && totalDecimalHours) {
            previewPdf();
        }
    }, [clientData, totalHrsMins, totalDecimalHours]);
        

    // Fetch clients for the first dropdown
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/clients`)
            .then(response => response.json())
            .then(data => setClients(data.map(client => ({ value: client.value, label: client.label }))))
            .catch(error => console.error('Error fetching clients:', error));
    }, []);

    const previewPdf = () => {
        const doc = generatePdfDocument(clientData, totalHrsMins, totalDecimalHours); // Replace 'yourData' with the actual data
        const dataUrl = doc.output('datauristring');
        setPdfDataUrl(dataUrl);
    };

    const downloadPdf = async () => {
        try {
            const confirmDownload = window.confirm('Download PDF?');
            if (!confirmDownload) {
                return;
            }
    
            const doc = generatePdfDocument(clientData, totalHrsMins, totalDecimalHours);
            const pdfData = doc.output('blob');
            const downloadUrl = window.URL.createObjectURL(pdfData);
            const link = document.createElement('a');
            link.href = downloadUrl;
            // console.log(clientData)
            const dateStr = clientData[0].end_time;  
            const date = new Date(dateStr);
            const year = date.getFullYear();
            let month = date.getMonth() + 1; // getMonth() is zero-based
            month = month < 10 ? '0' + month : month;
            const yearMonth = '' + year + month;

            const filename = `${clientData[0].client}_${yearMonth}.pdf`;
            link.download = filename;
            link.click();
        } catch (error) {
            window.alert('Error downloading PDF. Did you select all required filters?')
            console.error('Error downloading PDF:', error);
        }
    };


    return (
        <div>
            <header> DLC Reports </header>
            <div className='menu'>                    
                <ul className="nav justify-content-center">
                    <li className="nav-item">
                        <a className="nav-link" href="/">Time Entry</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link active" aria-current="page" href="/reporting">Reports</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#">Custom Reports</a>
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

const Reporting = () => {
    // State and logic will go here

    return (
        <div>
            <ParentComponent />
        </div>
    );
}

export default Reporting;
