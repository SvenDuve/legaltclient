import React, { useState, useEffect } from 'react';
import NavigationBar from './NavigationBar';
import DateTimeInput from './DateTimeInput';
import CheckboxDropdown from './CheckboxDropdown';
// Additional imports here (e.g., Bootstrap components)

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const ParentComponent = () => {

    const [clients, setClients] = useState([]);
    const [firstSelection, setFirstSelection] = useState([]);
    const [secondOptions, setSecondOptions] = useState([]);


    // Fetch clients for the first dropdown
    useEffect(() => {
        fetch(`${API_BASE_URL}/api/clients`)
            .then(response => response.json())
            .then(data => setClients(data))
            .catch(error => console.error('Error fetching clients:', error));
    }, []);

    useEffect(() => {
        if (firstSelection.length > 0) {
            const query = firstSelection.join(',');
            fetch(`${API_BASE_URL}/api/options?selected=${query}`)
                .then(response => response.json())
                .then(data => setSecondOptions(data))
                .catch(error => console.error('Error fetching data:', error));
        }
    }, [firstSelection]);


    return (
        <div>
            <CheckboxDropdown 
                options={ clients.map(c => c.label)} 
                onChange={setFirstSelection} 
            />
            {/* {firstSelection.length > 0 && 
                <CheckboxDropdown 
                    options={secondOptions} 
                    onChange={(selected) => console.log('Selected in second dropdown:', selected)} 
                />
            } */}
        </div>
    );
}

const Reporting = () => {
    // State and logic will go here

    return (
        <div>
            <NavigationBar page="/" pagename="Zeiterfassung"/>
            <h1>Reporting</h1>
            <form>
                <label>Date Range</label>
                    <DateTimeInput 
                        label="Start Time Range"
                        />
                    <DateTimeInput 
                        label="End Time Range"
                        />
                {/* Other input elements */}
                <button type="submit" className="btn btn-primary">Apply Filters</button>
            </form>
            <ParentComponent />
            <div className="report-actions">
                <button className="btn btn-secondary">Preview Data</button>
                <button className="btn btn-success">Download PDF</button>
                <button className="btn btn-info">Download CSV</button>
            </div>
            {/* UI elements will be added here */}
        </div>
    );
}

export default Reporting;
