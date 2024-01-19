import React from 'react';
// If using Bootstrap, uncomment the next line
// import 'bootstrap/dist/css/bootstrap.min.css';

function DateInput({ label, value, onChange, name, id }) {
    return (
        <div className="form-group">
            {label && <label htmlFor={id} className="form-label">{label}</label>}
            <input
                id={id}
                type="date"
                name={name}
                value={value}
                onChange={onChange}
                className="form-control"
            />
        </div>
    );
}

export default DateInput;