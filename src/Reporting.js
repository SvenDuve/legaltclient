import React, { useState, useEffect } from 'react';
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import NavigationBar from './NavigationBar';
import DateInput from './DateInput';
import DropdownInput from './DropdownInput';
import FormatDate from './FormatDate';
import FormatDifference from './FormatDifference';
// Additional imports here (e.g., Bootstrap components)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


const generatePdfDocument = (data) => {
  const doc = new jsPDF();
  doc.setFontSize(8); // Set the font size to 12 points


  console.log(data.entries)
  if (!Array.isArray(data.entries)) {
    console.error("Invalid data format. Expected an array:", data);
    return doc;
  }
  // Example: Adding text to the PDF. You should replace this with your actual data formatting
  doc.text("Client Report", 20, 20);

  // Define the table columns and data
  const columns = ["Client", "Start Time", "End Time", "Time Difference", "Project", "Description", "DLC Staff"]; // Add more columns as needed
  // Add the table to the document
  const tableData = data.entries.map(item => [
    item.client, FormatDate(item.start_time), FormatDate(item.end_time), FormatDifference(item.time_diff_hrs_mins), item.project, item.description, item.pid // Map other fields as needed
  ]);

  doc.autoTable(columns, tableData, {
    startY: 30,
    margin: { horizontal: 10 },
    styles: { overflow: 'linebreak' },
    bodyStyles: { valign: 'top' },
    columnStyles: { id: { fontStyle: 'bold' } } // Example: making 'id' column bold
  });
  
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


    
    console.log('Clients:', clients);

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
            setClientData(data);
            console.log('Data received:', data);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevents the default form submission action
        console.log('Submitting form...');
        await fetchData();  // Triggers the API call
    };
    

    // Fetch clients for the first dropdown
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/clients`)
            .then(response => response.json())
            .then(data => setClients(data.map(client => ({ value: client.value, label: client.label }))))
            .catch(error => console.error('Error fetching clients:', error));
    }, []);

    const previewPdf = () => {
        const doc = generatePdfDocument(clientData); // Replace 'yourData' with the actual data
        const dataUrl = doc.output('datauristring');
        setPdfDataUrl(dataUrl);
    };


    return (
        <div>
            <NavigationBar page="/" pagename="Zeiterfassung"/>
            <h1>Reporting</h1>
            <form onSubmit={handleSubmit}>
                <label>Date Range</label>
                    <DateInput 
                        label="Start Time Range"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                    <DateInput 
                        label="End Time Range"
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
                <button type="submit" className="btn btn-primary">Apply Filters</button>
            </form>
            <div>
            <button onClick={previewPdf}>Preview Report</button>
                {pdfDataUrl && <iframe src={pdfDataUrl} style={{width: '100%', height: '500px'}}></iframe>}
        </div>
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
