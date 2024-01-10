// App.js
import React from 'react';
import TimeEntryForm from './TimeEntryForm';
// import { DndProvider } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import DraggableText from './DraggableText';
// import DroppableArea from './DroppableArea';



function App() {
    return (
        <div className="App">
            <TimeEntryForm />
        </div>
        // <DndProvider backend={HTML5Backend}>
        //     <DraggableText />
        //     <DroppableArea />
        // </DndProvider>
    );
}

export default App;


