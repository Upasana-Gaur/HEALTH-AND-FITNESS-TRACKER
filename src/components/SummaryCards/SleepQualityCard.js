export const SleepQualityCard = ({ sleep }) => {
  // Calculate duration and format it
  const formatDuration = (start, end) => {
    if (!start || !end) return '0h 0m';
    
    let startDate = new Date(`2000/01/01 ${start}`);
    let endDate = new Date(`2000/01/01 ${end}`);
    
    // Handle sleep past midnight
    if (endDate < startDate) {
      endDate.setDate(endDate.getDate() + 1);
    }
    
    const diff = (endDate - startDate) / (1000 * 60); // minutes
    const hours = Math.floor(diff / 60);
    const minutes = Math.round(diff % 60);
    return `${hours}h ${minutes}m`;
  };

  // Quality descriptions matching SleepQualityInput
  const getQualityDescription = (quality) => {
    const descriptions = {
      1: 'Poor - Frequent disruptions, didn\'t feel rested',
      2: 'Fair - Some disruptions, slightly rested',
      3: 'Good - Few disruptions, mostly rested',
      4: 'Very Good - Minimal disruptions, well rested',
      5: 'Excellent - Uninterrupted sleep, fully refreshed'
    };
    return descriptions[quality] || 'Not rated';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Sleep Quality</h3>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-500 text-sm">Duration</p>
            <p className="font-medium text-gray-800">
              {formatDuration(sleep.sleepStart, sleep.sleepEnd)}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Quality Rating</p>
            <p className="font-medium text-gray-800">{sleep.quality}/5</p>
          </div>
        </div>

        <div className="pt-4">
          <div className="bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-500 rounded-full h-2 transition-all duration-300" 
              style={{ width: `${(sleep.quality / 5) * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">{getQualityDescription(sleep.quality)}</p>
        </div>

        {sleep.factors && sleep.factors.length > 0 && (
          <div className="pt-2">
            <p className="text-gray-500 text-sm mb-2">Affecting Factors:</p>
            <div className="flex flex-wrap gap-2">
              {sleep.factors.map((factor, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                >
                  {factor}
                </span>
              ))}
            </div>
          </div>
        )}

        {sleep.notes && (
          <div className="pt-2">
            <p className="text-gray-500 text-sm">Notes:</p>
            <p className="text-sm text-gray-700 mt-1">{sleep.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};