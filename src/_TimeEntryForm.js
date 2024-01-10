// TimeEntryForm.js
import React, { useState } from 'react';
// Add this import to your TimeEntryForm.js
import './TimeEntryForm.css';
import { useDrag, useDrop, DndProvider} from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import './TimeEntryForm.css';
import DraggableText from './DraggableText';
import DroppableArea from './DroppableArea';



function TimeEntryForm() {
    const [entry, setEntry] = useState({
        pid: '',
        client: '',
        department: '',
        project: '',
        counterparty: '',
        startTime: '',
        endTime: '',
        description: ''
    });

    const [language, setLanguage] = useState('en'); // default language is English


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

    

    const handleChange = (e) => {
        setEntry({ ...entry, [e.target.name]: e.target.value });
    };
    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setEntry(prevEntry => ({ ...prevEntry, [name]: value }));
    // };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(entry);
        // Here you would typically send this data to the backend
        // and then clear the form fields
        setEntry({
            pid: '',
            client: '',
            department: '',
            project: '',
            counterparty: '',
            startTime: '',
            endTime: '',
            description: ''
        });
    };



    const dragItems = [
        {en: 'Review and Mark-up Draft from Client', de: 'Durchsicht und Überarbeitung des Vertragsentwurfs des Kunden'},
        {en: 'Review and Mark-up Draft received from Counterparty', de: 'Durchsicht und Überarbeitung des Vertragsentwurfs der Gegenpartei'},
        {en: 'Drafting Response to Client', de: 'Entwurf Antwort an Kunden'},
        {en: 'Drafting Response to Counterparty', de: 'Entwurf Antwort an Gegenpartei'},
    ]; // Example draggable items

    return (
        <DndProvider backend={HTML5Backend}>
        <header> DLC Time Entry Form </header>
            <form className='mainForm' onSubmit={handleSubmit}>
                <button type="button" onClick={switchLanguage}>Switch Language</button>
                    <div className='user-input'>
                    <input
                        type="text"
                        name="pid"
                        value={entry.pid}
                        onChange={handleChange}
                        placeholder="PId"
                    />
                    <input
                        type="text"
                        name="client"
                        value={entry.client}
                        onChange={handleChange}
                        placeholder="Client"
                    />
                    <input
                        type="text"
                        name="department"
                        value={entry.department}
                        onChange={handleChange}
                        placeholder="Department"
                    />
                    <input
                        type="text"
                        name="project"
                        value={entry.project}
                        onChange={handleChange}
                        placeholder="Project"
                    />
                    <input
                        type="text"
                        name="counterparty"
                        value={entry.counterparty}
                        onChange={handleChange}
                        placeholder="Counterparty"
                    />
                    <input
                        type="datetime-local"
                        name="startTime"
                        value={entry.startTime}
                        onChange={handleChange}
                    />
                    <input
                        type="datetime-local"
                        name="endTime"
                        value={entry.endTime}
                        onChange={handleChange}
                    />
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
                        <button className='submit-button' type="submit">Submit</button>
                    </div>
                </div>
            </form>
        </DndProvider>
    );
}

export default TimeEntryForm;
