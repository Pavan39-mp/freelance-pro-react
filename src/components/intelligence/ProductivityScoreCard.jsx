import React, { useEffect, useState } from 'react';
import Card from '../ui/Card';
import { getProductivity } from '../../services/intelligenceService';

const Metric = ({ label, value }) => (
  <div>
    <div className="mb-1 flex items-center justify-between gap-3 text-body-sm">
      <span className="text-on-surface-variant">{label}</span>
      <span className="font-bold text-on-surface">{value === null ? 'Building' : `${value}%`}</span>
    </div>
    <div className="h-1.5 overflow-hidden rounded-full bg-surface-container-highest">
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value ?? 0}%` }} />
    </div>
  </div>
);

const ProductivityScoreCard = () => {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    let active = true;
    getProductivity()
      .then(response => active && setState({ loading: false, data: response.data, error: '' }))
      .catch(error => active && setState({ loading: false, data: null, error: error.message || 'Unable to load productivity score' }));
    return () => { active = false; };
  }, []);

  return (
    <Card className="mb-6 p-6">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Productivity Score</h3>
          <p className="mt-1 text-body-sm text-on-surface-variant">Calculated from your current task, delivery, project, and feedback data.</p>
        </div>
        {!state.loading && state.data?.hasData && <p className="font-headline-md text-headline-md font-bold text-primary">{state.data.score}%</p>}
      </div>
      {state.loading ? (
        <p className="py-6 text-center text-body-sm text-on-surface-variant">Calculating productivity…</p>
      ) : state.error ? (
        <p className="py-4 text-body-sm text-error">{state.error}</p>
      ) : !state.data?.hasData ? (
        <p className="py-4 text-body-sm text-on-surface-variant">Complete tasks and projects to begin building your productivity score.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <Metric label="Task Completion" value={state.data.breakdown.taskCompletion} />
          <Metric label="Delivery Performance" value={state.data.breakdown.deliveryPerformance} />
          <Metric label="Project Success" value={state.data.breakdown.projectSuccess} />
        </div>
      )}
    </Card>
  );
};

export default ProductivityScoreCard;
