const ValueSlider = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  disabled,
  note,
}) => {
  const formatValue = (v) => {
    if (typeof v !== "number") return "0";
    return v < 1 ? v.toFixed(2) : v.toFixed(0);
  };

  const handleSliderChange = (e) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue) && onChange) {
      onChange(newValue);
    }
  };

  const handleInputChange = (e) => {
    const newValue = Number(e.target.value);
    if (!isNaN(newValue) && onChange) {
      if (newValue >= min && newValue <= max) {
        onChange(newValue);
      }
    }
  };

  return (
    <div className="space-y-2 mb-4">
      <div className="flex justify-between items-center">
        <label className="text-xs font-medium text-gray-600">{label}</label>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          style={{
            MozAppearance: "textfield",
          }}
          onWheel={(e) => e.target.blur()}
          className="w-20 text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 text-right"
        />
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value || 0}
        onChange={handleSliderChange}
        disabled={disabled}
        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />

      <div className="flex justify-between text-xs text-gray-400">
        <span>{min}</span>
        <span>{max}</span>
      </div>

      {note && <p className="text-xs text-gray-500 mt-1">{note}</p>}
    </div>
  );
};

export default ValueSlider;
