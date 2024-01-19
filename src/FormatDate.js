import React from 'react';

const FormatDate = (dateString) => {
    // console.log('Date String:', dateString);

    const options = {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit',
        hour12: false,
        timeZone: 'Europe/Berlin' // or use 'Europe/Berlin' for Central European Time, including daylight saving
    };

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('de-DE', options).format(date) + ' h.';

    // const day = date.getDate().toString().padStart(2, '0');
    // const month = (date.getMonth() + 1).toString().padStart(2, '0'); // getMonth() is zero-based
    // const year = date.getFullYear();
    // const hours = date.getHours().toString().padStart(2, '0');
    // const minutes = date.getMinutes().toString().padStart(2, '0');

    // return `${day}.${month}.${year} ${hours}:${minutes} h.`;
};

export default FormatDate;