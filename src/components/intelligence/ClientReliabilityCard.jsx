import React, { useEffect, useState } from 'react';
import { getClientReliability } from '../../services/intelligenceService';
import ReliabilityScore from './ReliabilityScore';

const ClientReliabilityCard = ({ clientId }) => {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    let active = true;
    if (!clientId) return undefined;
    getClientReliability(clientId)
      .then(response => active && setState({ loading: false, data: response.data, error: '' }))
      .catch(error => active && setState({ loading: false, data: null, error: error.message || 'Unable to load reliability score' }));
    return () => { active = false; };
  }, [clientId]);
  return (
    <section>
      <h3 className="mb-4 font-label-caps text-label-caps tracking-widest text-on-surface-variant">Client Reliability</h3>
      <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
        {state.loading ? <p className="text-body-sm text-on-surface-variant">Calculating reliability…</p> : state.error ? <p className="text-body-sm text-error">{state.error}</p> : <ReliabilityScore data={state.data} />}
      </div>
    </section>
  );
};

export default ClientReliabilityCard;
