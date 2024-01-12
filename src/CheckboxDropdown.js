import React, { useState } from 'react';

const CheckboxDropdown = ({ options, onChange }) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState([]);

    const handleCheckboxChange = (event, option) => {
        const updatedSelectedOptions = event.target.checked
            ? [...selectedOptions, option]
            : selectedOptions.filter(o => o !== option);

        setSelectedOptions(updatedSelectedOptions);
        onChange(updatedSelectedOptions);
    };

    return (
        <div>
            <button onClick={() => setShowDropdown(!showDropdown)}>Select Options</button>
            {showDropdown && (
                <div>
                    {options.map((option, index) => (
                        <div key={index}>
                            <input
                                type="checkbox"
                                checked={selectedOptions.includes(option)}
                                onChange={e => handleCheckboxChange(e, option)}
                            />
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default CheckboxDropdown;
