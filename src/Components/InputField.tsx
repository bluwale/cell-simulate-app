import React from 'react';
import "./styles.css";

interface InputFieldProps {
    label: string;
    placeholder?: string;
    value: string;
    onChange: (value: string) => void;
}

const InputField: React.FC<InputFieldProps> = ({ 
    label, 
    onChange, 
    value, 
    placeholder = "" 
}) => {
    return (
        <div className="input-group">
            <label>{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

export default InputField;