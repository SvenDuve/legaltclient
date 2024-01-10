import React from 'react';
// If using Bootstrap, uncomment the next line


function DateTimeInput({ label, value, onChange, name, id }) {
    return (
        <div className="form-group">
            {label && <label htmlFor={id} className="form-label">{label}</label>}
            <input
                id={id}
                type="datetime-local"
                name={name}
                value={value}
                onChange={onChange}
                className="form-control"
            />
        </div>
    );
}

export default DateTimeInput;