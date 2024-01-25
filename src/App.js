// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimeEntryForm from './TimeEntryForm';
import Reporting from './Reporting';
import CustomReporting from './CustomReporting';



function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<TimeEntryForm />} />
                <Route path="/reporting" element={<Reporting />} />
                <Route path="/customreporting" element={<CustomReporting />} />
                {/* Other routes */}
            </Routes>
        </Router>
    );
}

export default App;


