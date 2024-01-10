// TimeEntryForm.js
import React, { useState, useEffect } from 'react';
// Add this import to your TimeEntryForm.js
import './TimeEntryForm.css';
import { DndProvider} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DraggableText from './DraggableText';
import DroppableArea from './DroppableArea';


import DropdownInput from './DropdownInput';
import DateTimeInput from './DateTimeInput';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';


// const API_BASE_URL = process.env.REACT_APP_API_URL;
// console.log('API URL:', API_BASE_URL);




function TimeEntryForm() {
    const [entry, setEntry] = useState({
        pid: '',
        client: '',
        department: '',
        project: '',
        counterparty: '',
        start_time: '',
        end_time: '',
        description: ''
    });

    const [language, setLanguage] = useState('en'); // default language is English
    const [loading, setLoading] = useState(false);
    // const [error, setError] = useState(null);

    const switchLanguage = () => {
        setLanguage(prevLang => prevLang === 'en' ? 'de' : 'en');
    };

    // Method to handle text drop
    const handleTextDrop = (text) => {

        setEntry(prevEntry => ({
            ...prevEntry,
            description: prevEntry.description + text + ' '
        }));
    };

    const [pidOptions, setPidOptions] = useState([{ value: 'MID', label: 'MID' }, { value: 'LUD', label: 'LUD' }]);
    const [clientOptions, setClientOptions] = useState([]);
    const [clientsMap, setClientsMap] = useState({});
    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [projectOptions, setProjectOptions] = useState([]);
    const [counterpartyOptions, setCounterpartyOptions] = useState([]);
    const [entries, setEntries] = useState([]);

    

    const handleChange = (e) => {
        setEntry({ ...entry, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const allFieldsFilled = Object.values(entry).every(field => field !== '');

        if (!allFieldsFilled) {
            console.log(entry);
            alert('Please fill all fields before submitting.');
            return;
        }


        if (entry.id) {
            updateEntry(entry); // Function to send PUT request
            alert('Entry updated successfully.')
        } else {
            addTimeEntry(entry); // Existing function to add a new entry
            alert('Entry added successfully.')
        }


        setEntry({
            pid: '',
            client: '',
            department: '',
            project: '',
            counterparty: '',
            start_time: '',
            end_time: '',
            description: ''
        });

    };


    useEffect(() => {

        fetch(`${API_BASE_URL}/api/clients`)
        .then(response => response.json())
        .then(data => {
            // Assuming data is an array of clients
            setClientOptions(data.map(client => ({ value: client.value, label: client.label })));

            let newClientsMap = {};
            data.forEach(client => {
                newClientsMap[client.label] = client.value;
            });
            setClientsMap(newClientsMap);
        })
        .catch(error => {
            console.error('Error fetching clients:', error);
        });
        
        if (entry.client) {

            fetch(`${API_BASE_URL}/api/departments/${entry.client}`)
            .then(response => response.json())
            .then(data => setDepartmentOptions(data.map(dept => ({ value: dept, label: dept }))))   

            fetch(`${API_BASE_URL}/api/projects/${entry.client}`)
            .then(response => response.json())
            .then(data => setProjectOptions(data.map(project => ({ value: project, label: project }))))   

            fetch(`${API_BASE_URL}/api/counterparties`)
            .then(response => response.json())
            .then(data => setCounterpartyOptions(data.map(cpty => ({ value: cpty.value, label: cpty.label }))))
                   
        } else {
            setDepartmentOptions([]);
            setProjectOptions([]);
            setCounterpartyOptions([]);
        }
    }, [entry.client]);


    useEffect(() => {
        setLoading(true);
        fetch(`${API_BASE_URL}/api/time-entries`)
            .then(response => response.json())
            // .then(data => setEntries(Object.values(data)[1]))
            .then(data => setEntries(data.entries))
    }, [entry.client]);
    
    useEffect(() => {
        // console.log(entries.map(entry => entry.start_time));
        console.log(entries);
    }, [entries]);

 

    const addTimeEntry = async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/add-entry`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            const result = await response.json();
            console.log('Entry added successfully:', result);
        } catch (error) {
            console.error('Error adding entry:', error);
        }
    };
    
    
    // const editEntry = (entry) => {
    //     setEntry(entry);
    //     // Scroll to the form or open a modal for editing
    // };

    const populateFormForEdit = (entry) => {

        entry.client = clientsMap[entry.client]
        setEntry(entry); // This assumes the structure of 'entry' matches your state
        // Optionally, scroll to the form or handle UI changes
    };

    const updateEntry = async (updatedEntry) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/time-entries/${updatedEntry.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedEntry)
            });
    
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
    
            // Handle the response, such as updating the 'entries' state to reflect changes
            // This might involve re-fetching entries or updating the specific entry in the state
        } catch (error) {
            console.error('Error updating entry:', error);
        }
    };
    

    const deleteEntry = async (id) => {
        // Call API to delete the entry
        // Remove the entry from the 'entries' state or refetch the entries
        try {
            const confirmDelete = window.confirm('Are you sure you want to delete this entry?');
            if (!confirmDelete) {
                return;
            }

            const response = await fetch(`${API_BASE_URL}/api/time-entries/${id}`, { method: 'DELETE' });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            // Remove the deleted entry from the state to update the UI
            setEntries(entries.filter(entry => entry.id !== id));
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };
    

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            console.error('Invalid date:', dateString);
            return 'Invalid Date';
        }
    
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
    
        return `${day}.${month}.${year} ${hours}:${minutes} h.`;
    };

    const formatDifference = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);

        if (isNaN(hours) || isNaN(minutes)) {
            console.error('Invalid time:', timeString);
            return 'Invalid Time';
        }
    
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} h.`;
        };
    


        const dragItems = [
            {en: 'review and mark-up of draft', de: 'Überprüfung und Überarbeitung des Entwurfs'},
            {en: 'mark-up draft incorporation of comments received by', de: 'Überarbeitung Entwurf Einarbeitung der Kommentare von'},
            {en: 'mark-up draft incorporation of instructions received by', de: 'Überarbeitung Entwurf Einarbeitung von Anweisungen von'},
            {en: 'incorporation of comments received by', de: 'Einarbeitung von Kommentaren von'},
            {en: 'incorporation of instructions received by', de: 'Einarbeitung von Anweisungen von'},
            {en: 'review of email communication by', de: 'Durchsicht der E-Mail-Kommunikation durch'},
            {en: 'drafting response to', de: 'Entwurf einer Antwort an'},
            {en: 'research regarding', de: 'Recherche bezüglich'},
            {en: 'research own files for additional information', de: 'Recherche in eigenen Akten nach zusätzlichen Informationen'},
            {en: 'taking notes', de: 'Anfertigung von Notizen'},
            {en: 'reviewing notes taken during meeting', de: 'Überprüfung der während der Sitzung gemachten Notizen'},
            {en: 'preparation for meeting', de: 'Vorbereitung auf die Sitzung'},
            {en: 'preparation for call', de: 'Vorbereitung auf das Gespräch'},
            {en: 'call by', de: 'Anruf durch'},
            {en: 'call to', de: 'Anruf an'},
            {en: 'drafting an email briefly outlining findings', de: 'Entwurf einer E-Mail, in der die Ergebnisse kurz dargelegt werden'},
            {en: 'distribution of revised document', de: 'Verteilung des überarbeiteten Dokuments'},
            {en: 'evaluation of differences between', de: 'Bewertung der Unterschiede zwischen'},
            {en: 'drafting supporting email', de: 'Entwurf einer begleitenden E-Mail'},
        ]; // Example draggable items


    return (
        <DndProvider backend={HTML5Backend}>
        <header> DLC Time Entry Table </header>
            <form className='mainForm' onSubmit={handleSubmit}>
                {/* <button type="button" onClick={switchLanguage}>Switch Language</button> */}
                <div className='user-input'>
                    <DropdownInput
                        label="PID"
                        name="pid"
                        value={entry.pid}
                        onChange={handleChange}
                        options={pidOptions}
                        defaultOption = "Select PID"
                    />
                    <DropdownInput
                        label="Client"
                        name="client"
                        value={entry.client}
                        onChange={handleChange}
                        options={clientOptions}
                        defaultOption = "Select Client"
                    />
                    <DropdownInput
                        label="Department"
                        name="department"
                        value={entry.department}
                        onChange={handleChange}
                        options={departmentOptions}
                        defaultOption = "Select Department"
                    />
                    <DropdownInput
                        label="Project"
                        name="project"
                        value={entry.project}
                        onChange={handleChange}
                        options={projectOptions}
                        defaultOption = "Select Project"
                    />
                    <DropdownInput
                        label="Counterparty"
                        name="counterparty"
                        value={entry.counterparty}
                        onChange={handleChange}
                        options={counterpartyOptions}
                        defaultOption = "Select Counterparty"
                    />
                    <DateTimeInput
                        label="Start Time"
                        name="start_time"
                        id="start_time"
                        value={entry.start_time}
                        onChange={handleChange}
                    />
                    {/* <label htmlFor="start_time">Start Time</label>
                    <input
                        id="start_time"
                        type="datetime-local"
                        name="start_time"
                        value={entry.start_time}
                        onChange={handleChange}
                    /> */}
                    <DateTimeInput
                        label="End Time"
                        name="end_time"
                        id="end_time"
                        value={entry.end_time}
                        onChange={handleChange}
                    />
                    {/* <label htmlFor="end_time">End Time</label>
                    <input
                        id="end_time"
                        type="datetime-local"
                        name="end_time"
                        value={entry.end_time}
                        onChange={handleChange}
                    /> */}
                </div>
                <div className='area'>                    
                    <div className="area-drag">
                        {dragItems.map((item, index) => (
                            <DraggableText key={index} item={item} language={language} />
                            ))}
                    </div>
                    <div className='area-drop'>
                        <DroppableArea onTextDrop={handleTextDrop} language={language} />
                    </div>
                </div>
                <div className='area'>
                    <div className='area-text'>
                        <textarea
                            name="description"
                            value={entry.description}
                            onChange={handleChange}
                            placeholder="Description of the work done"
                            />
                        </div>
                    <div className='area-button'>
                        <button className='btn btn-outline-secondary' type="submit">Submit</button>
                        <button className='btn btn-outline-secondary' type="button" onClick={switchLanguage}>Switch Language</button>
                    </div>
                </div>
            </form>
            <div className='table-responsive'>
                <table className='table table-striped table-hover'>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>PID</th>
                            <th>Client</th>
                            <th>Department</th>
                            <th>Project</th>
                            <th>Counterparty</th>
                            <th>Description</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Time Difference</th>
                            <th>Time Difference Decimal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map(entry => (
                            <tr key={entry.id}>
                                <td>{entry.id}</td>
                                <td>{entry.pid}</td>
                                <td>{entry.client}</td>
                                <td>{entry.department}</td>
                                <td>{entry.project}</td>
                                <td>{entry.counterparty}</td>
                                <td>{entry.description}</td>
                                <td>{formatDate(entry.start_time)}</td>
                                <td>{formatDate(entry.end_time)}</td>
                                <td>{formatDifference(entry.time_diff_hrs_mins)}</td>
                                <td>{entry.time_diff_decimal} h.</td>
                                <td>
                                    <button className='btn btn-outline-secondary btn-sm' onClick={() => populateFormForEdit(entry)}>Edit</button>
                                    <button className='btn btn-outline-danger btn-sm' onClick={() => deleteEntry(entry.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DndProvider>
    );
}

export default TimeEntryForm;
