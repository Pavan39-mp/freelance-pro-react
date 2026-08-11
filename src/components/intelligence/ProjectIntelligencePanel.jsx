import React, { useEffect, useState } from 'react';
import { CheckCircle2, Lightbulb } from 'lucide-react';
import { getProjectIntelligence } from '../../services/intelligenceService';
import ReliabilityScore from './ReliabilityScore';
import { useUser } from '../../context/UserContext';

const ProjectIntelligencePanel = ({ project }) => {
  const { user } = useUser();
  const projectId = project?._id || project?.id;
  const [state, setState] = useState({ loading: true, data: null, error: '' });
  useEffect(() => {
    let active = true;
    if (!projectId) return undefined;
    setState({ loading: true, data: null, error: '' });
    getProjectIntelligence(projectId)
      .then(response => active && setState({ loading: false, data: response.data, error: '' }))
      .catch(error => active && setState({ loading: false, data: null, error: error.message || 'Unable to load project intelligence' }));
    return () => { active = false; };
  }, [projectId]);

  if (state.loading) return <div className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4 text-body-sm text-on-surface-variant">Calculating project health…</div>;
  if (state.error) return <div className="rounded-2xl border border-error/20 bg-error/5 p-4 text-body-sm text-error">{state.error}</div>;
  const { health, insights, clientReliability } = state.data || {};
  if (!health) return null;
  const healthStyle = health.status === 'Healthy' ? 'text-tertiary bg-tertiary/10' : health.status === 'At Risk' ? 'text-error bg-error/10' : 'text-secondary bg-secondary/10';

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="font-label-caps text-label-caps tracking-widest text-on-surface-variant">Project Health</h3>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${healthStyle}`}>{health.status}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><p className="text-[10px] font-bold text-on-surface-variant">Progress</p><p className="font-body-md font-bold text-on-surface">{health.progress}%</p></div>
          <div><p className="text-[10px] font-bold text-on-surface-variant">Deadline Risk</p><p className="font-body-md font-bold text-on-surface">{health.deadlineRisk}</p></div>
          <div className="col-span-2"><p className="text-[10px] font-bold text-on-surface-variant">Tasks</p><p className="font-body-md font-bold text-on-surface">{health.completedTasks}/{health.totalTasks} completed</p></div>
        </div>
      </section>
      <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
        <h3 className="mb-3 flex items-center gap-2 font-label-caps text-label-caps tracking-widest text-on-surface-variant"><Lightbulb className="h-4 w-4 text-primary" />Project Insights</h3>
        <div className="space-y-2">
          {insights.map((insight, index) => <p key={`${insight}-${index}`} className="flex gap-2 text-body-sm text-on-surface"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{insight}</p>)}
        </div>
      </section>
      {clientReliability && (
        <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
          <h3 className="mb-3 font-label-caps text-label-caps tracking-widest text-on-surface-variant">Client Reliability</h3>
          <ReliabilityScore data={clientReliability} compact />
        </section>
      )}
      {user?.role === 'client' && project?.createdBy && typeof project.createdBy === 'object' && (
        <section className="rounded-2xl border border-outline-variant/10 bg-surface-container-low p-4">
          <h3 className="mb-3 font-label-caps text-label-caps tracking-widest text-on-surface-variant">Assigned Freelancer</h3>
          <p className="font-body-md font-bold text-on-surface">{project.createdBy.fullName}</p>
          {project.createdBy.title && <p className="mt-1 text-body-sm text-on-surface-variant">{project.createdBy.title}</p>}
          {project.createdBy.skills && <p className="mt-2 text-body-sm text-on-surface-variant break-words">{project.createdBy.skills}</p>}
        </section>
      )}
    </div>
  );
};

export default ProjectIntelligencePanel;
