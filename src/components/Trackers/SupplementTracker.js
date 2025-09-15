import React, { useState } from 'react';

export const SupplementTracker = ({ supplements, onChange }) => {
  const [newSupplement, setNewSupplement] = useState({ name: '', dosage: '', time: '' });

  const handleAdd = () => {
    if (!newSupplement.name || !newSupplement.dosage) return;
    
    onChange([...supplements, { ...newSupplement, taken: false }]);
    setNewSupplement({ name: '', dosage: '', time: '' });
  };

  const handleToggle = (index) => {
    const updated = supplements.map((supp, i) => 
      i === index ? { ...supp, taken: !supp.taken } : supp
    );
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <input
          type="text"
          placeholder="Supplement name"
          value={newSupplement.name}
          onChange={(e) => setNewSupplement(prev => ({ ...prev, name: e.target.value }))}
          className="rounded-md border-gray-300"
        />
        <input
          type="text"
          placeholder="Dosage"
          value={newSupplement.dosage}
          onChange={(e) => setNewSupplement(prev => ({ ...prev, dosage: e.target.value }))}
          className="rounded-md border-gray-300"
        />
        <input
          type="time"
          value={newSupplement.time}
          onChange={(e) => setNewSupplement(prev => ({ ...prev, time: e.target.value }))}
          className="rounded-md border-gray-300"
        />
      </div>
      
      <button
        onClick={handleAdd}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
      >
        Add Supplement
      </button>

      <div className="space-y-2">
        {supplements.map((supplement, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
          >
            <div>
              <span className="font-medium">{supplement.name}</span>
              <span className="text-sm text-gray-500 ml-2">
                {supplement.dosage} at {supplement.time}
              </span>
            </div>
            <button
              onClick={() => handleToggle(index)}
              className={`px-3 py-1 rounded-md ${
                supplement.taken 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {supplement.taken ? 'Taken' : 'Take'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};