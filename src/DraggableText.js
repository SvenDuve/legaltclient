import React from 'react';
import { useDrag } from 'react-dnd';

const DraggableText = ({ item, language }) => {
    // const draggableItem = useMemo(() => ({ text: item[language] }), [item, language]);
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TEXT',
        item: { text: item },
        // item: draggableItem,
        // begin: () => ({ text: item[language] }), // update the item when the drag begins
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));
    // Styling for the droppable area
    const draggableStyle = {
        // backgroundColor: 'yellow',
        padding: '5px',
        margin: '2px',
        opacity: isDragging ? 0.5 : 1
    };

    return (
        <div ref={drag} style={draggableStyle}>
            {item[language]}
        </div>
    );
};

export default DraggableText;
