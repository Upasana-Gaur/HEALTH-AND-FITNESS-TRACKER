import { useState, useRef, useEffect } from 'react';

export const FormField = ({ 
  field, 
  value, 
  editMode, 
  options, 
  measurementInfo, 
  onChange,
  multiSelectFields 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (selectedValue) => {
    if (multiSelectFields.includes(field)) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];
      onChange(field, newValues);
    } else {
      onChange(field, selectedValue);
      setIsOpen(false);
    }
  };

  if (multiSelectFields.includes(field)) {
    return (
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => editMode && setIsOpen(!isOpen)}
          className={`w-full px-4 py-2 rounded-lg border ${
            editMode 
              ? "border-gray-300 cursor-pointer hover:border-blue-500" 
              : "border-gray-200 bg-gray-50"
          } transition-colors duration-200`}
        >
          {Array.isArray(value) && value.length > 0 
            ? value.join(', ') 
            : 'Select options...'}
        </div>
        
        {isOpen && editMode && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {options.map(option => (
              <div key={option.value}>
                {option.subOptions ? (
                  // Render yoga styles
                  <div className="py-2">
                    <div className="px-4 py-1 font-medium text-gray-700">
                      {option.value}
                    </div>
                    {option.subOptions.map(subOption => (
                      <div
                        key={subOption.value}
                        onClick={() => {
                          const newValue = Array.isArray(value) ? value : [];
                          const updatedValue = newValue.includes(subOption.value)
                            ? newValue.filter(v => v !== subOption.value)
                            : [...newValue, subOption.value];
                          onChange(field, updatedValue);
                        }}
                        className="px-6 py-2 cursor-pointer hover:bg-blue-50"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={Array.isArray(value) && value.includes(subOption.value)}
                            onChange={() => {}}
                            className="mr-2"
                          />
                          <div>
                            <div className="text-sm">{subOption.value}</div>
                            <div className="text-xs text-gray-500">
                              {subOption.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Regular option rendering
                  <div
                    onClick={() => handleOptionClick(option.value)}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                      Array.isArray(value) && value.includes(option.value)
                        ? 'bg-blue-100'
                        : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={Array.isArray(value) && value.includes(option.value)}
                        onChange={() => {}}
                        className="mr-2"
                      />
                      <div>
                        <div>{option.value}</div>
                        {option.format && (
                          <div className="text-sm text-gray-500">{option.format}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (measurementInfo) {
    return (
      <div className="relative">
        <input
          type="text"
          name={field}
          value={value || ''}
          onChange={(e) => onChange(field, e.target.value)}
          disabled={!editMode}
          placeholder={measurementInfo.format}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        {measurementInfo.unit && (
          <span className="absolute right-3 top-2 text-gray-500">
            {measurementInfo.unit}
          </span>
        )}
        {editMode && (
          <small className="block mt-1 text-gray-500">
            Format: {measurementInfo.format}
          </small>
        )}
      </div>
    );
  }

  return (
    <input
      type="text"
      name={field}
      value={value || ''}
      onChange={(e) => onChange(field, e.target.value)}
      disabled={!editMode}
      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
    />
  );
};