import React from 'react';
// import "./DropdownInput.css";


function DropdownInput({ label, options, value, onChange, name, defaultOption }) {
    return (
        <div className="form-group">
            {label && <label htmlFor={name} className="form-label">{label}</label>}
            <select 
                name={name} 
                value={value} 
                onChange={onChange}
                className="form-select"
            >
                {defaultOption && <option value="">{defaultOption}</option>}
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

export default DropdownInput;