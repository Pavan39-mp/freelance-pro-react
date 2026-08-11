import React from 'react';

const ReliabilityScore = ({ data, compact = false }) => {
  if (!data) return null;
  if (!data.hasSufficientData) {
    return <p className="text-body-sm text-on-surface-variant">{data.message || 'Building score from project activity'}</p>;
  }
  const metrics = [
    ['Payment History', data.breakdown.paymentHistory],
    ['Project Completion', data.breakdown.projectCompletion],
    ['Communication', data.breakdown.communication]
  ];
  return (
    <div className={compact ? 'space-y-3' : 'grid grid-cols-1 gap-3 sm:grid-cols-3'}>
      <p className="font-headline-sm text-headline-sm font-bold text-primary">{data.score}%</p>
      {metrics.map(([label, value]) => (
        <div key={label} className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
          <p className="text-body-sm font-bold text-on-surface">{value === null ? 'Not enough data' : `${value}%`}</p>
        </div>
      ))}
    </div>
  );
};

export default ReliabilityScore;
