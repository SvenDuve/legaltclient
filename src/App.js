// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimeEntryForm from './TimeEntryForm';
import Reporting from './Reporting';



function App() {
    return (
<<<<<<< HEAD
        <Router>
            <Routes>
                <Route path="/" element={<TimeEntryForm />} />
                <Route path="/reporting" element={<Reporting />} />
                {/* Other routes */}
            </Routes>
        </Router>
=======
        <div className="App">
            <TimeEntryForm />
        </div>
>>>>>>> main
    );
}

export default App;


