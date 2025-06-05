const InputField: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, onChange, value, placeholder = "" }) => {
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
};

export default InputField;