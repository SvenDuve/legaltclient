import React from 'react';

const FormatDifference = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);

    if (isNaN(hours) || isNaN(minutes)) {
        console.error('Invalid time:', timeString);
        return 'Invalid Time';
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} h.`;
};


export default FormatDifference;