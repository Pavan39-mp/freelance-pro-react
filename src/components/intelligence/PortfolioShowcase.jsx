import React, { useEffect, useState } from 'react';
import Card from '../ui/Card';
import { getPortfolio } from '../../services/intelligenceService';

const PortfolioShowcase = () => {
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    let active = true;
    getPortfolio()
      .then(response => active && setState({ loading: false, data: response.data, error: '' }))
      .catch(error => active && setState({ loading: false, data: null, error: error.message || 'Unable to load portfolio' }));
    return () => { active = false; };
  }, []);
  return (
    <Card className="p-8">
      <h3 className="font-headline-sm text-headline-sm text-on-surface">Professional Portfolio</h3>
      {state.loading ? <p className="py-6 text-body-sm text-on-surface-variant">Loading portfolio…</p> : state.error ? <p className="py-4 text-body-sm text-error">{state.error}</p> : (
        <div className="mt-5 space-y-5">
          {state.data.skills?.length > 0 && <div><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Skills</p><div className="flex flex-wrap gap-2">{state.data.skills.map(skill => <span key={skill} className="rounded-lg border border-outline-variant/20 bg-surface-variant/50 px-3 py-1.5 text-body-sm text-on-surface">{skill}</span>)}</div></div>}
          {state.data.projects?.length > 0 ? state.data.projects.map(project => (
            <div key={project.id} className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between"><h4 className="font-body-md font-bold text-on-surface">{project.title}</h4>{project.role && <span className="text-body-sm text-on-surface-variant">{project.role}</span>}</div>
              {project.highlight && <p className="mt-2 whitespace-pre-wrap text-body-sm text-on-surface-variant">{project.highlight}</p>}
              {project.technologies?.length > 0 && <div className="mt-3"><p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Built using</p><div className="flex flex-wrap gap-2">{project.technologies.map(item => <span key={item} className="rounded-lg bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{item}</span>)}</div></div>}
            </div>
          )) : <p className="text-body-sm text-on-surface-variant">Completed projects will appear here as your professional portfolio grows.</p>}
        </div>
      )}
    </Card>
  );
};

export default PortfolioShowcase;
