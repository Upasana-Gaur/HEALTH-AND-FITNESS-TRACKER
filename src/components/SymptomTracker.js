export default function SymptomTracker() {
  const symptoms = [
    'Fatigue',
    'Headache',
    'Muscle Soreness',
    'Joint Pain',
    'Digestive Issues',
    'Mood Changes',
    'Sleep Issues',
    'Appetite Changes'
  ];

  const severityLevels = [
    'None',
    'Mild',
    'Moderate',
    'Severe'
  ];

  return (
    <div className="grid gap-4">
      {symptoms.map(symptom => (
        <div key={symptom} className="p-4 bg-white rounded-lg shadow">
          <label className="font-medium">{symptom}</label>
          <select className="mt-2 w-full rounded-md border-gray-300">
            {severityLevels.map(level => (
              <option key={level} value={level.toLowerCase()}>
                {level}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}