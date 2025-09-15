import React from 'react';

export const GoalSelector = ({ onGoalSelect }) => {
  const goals = [
    {
      id: 'weight-loss',
      title: 'Weight Loss',
      description: 'I want to reduce weight and get leaner',
      icon: '⬇️'
    },
    {
      id: 'weight-gain',
      title: 'Weight Gain',
      description: 'I want to build muscle and gain weight',
      icon: '⬆️'
    },
    {
      id: 'maintain',
      title: 'Stay Fit',
      description: 'I want to maintain my current weight and improve fitness',
      icon: '⚖️'
    },
    {
      id: 'other',
      title: 'Other Goals',
      description: 'I have specific fitness or health goals',
      icon: '🎯'
    }
  ];

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        What's your primary fitness goal?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => onGoalSelect(goal.id)}
            className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm 
                     hover:shadow-md transition-shadow border-2 border-transparent 
                     hover:border-blue-500"
          >
            <span className="text-4xl mb-3">{goal.icon}</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {goal.title}
            </h3>
            <p className="text-sm text-gray-500 text-center">
              {goal.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};