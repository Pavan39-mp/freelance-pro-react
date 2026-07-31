import React, { useEffect, useState } from 'react';
import { Calendar, IndianRupee, Tag, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import TextPreview from '../../components/ui/TextPreview';
import { getMarketplaceProjectRequests } from '../../services/projectRequestService';

const AvailableProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await getMarketplaceProjectRequests();
        setProjects(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        toast.error(error.message || 'Failed to load available projects.');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, []);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-fade-in">
      <div>
        <h1 className="font-title-lg font-bold text-on-surface">Available Projects</h1>
        <p className="mt-2 text-body-md text-on-surface-variant">Open marketplace projects matched against your profile skills.</p>
      </div>

      {projects.length === 0 ? (
        <Card className="p-12 text-center text-on-surface-variant">No open marketplace projects are available.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {projects.map(project => {
            const deadline = new Date(project.deadline);
            const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 86400000));
            return (
              <Card key={project._id} className="space-y-5 p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h2 className="font-title-md font-bold text-on-surface break-words">{project.title}</h2>
                    <p className="mt-1 flex items-center gap-2 text-body-sm text-on-surface-variant"><UserRound className="h-4 w-4" />{project.client?.name || 'Client'}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-label-sm font-bold text-primary">Your Match: {project.matchPercentage || 0}%</span>
                </div>

                <TextPreview lines={3} className="text-body-md text-on-surface-variant">{project.description}</TextPreview>

                <div className="space-y-3">
                  <p className="flex items-center gap-2 text-body-sm text-on-surface"><Tag className="h-4 w-4 text-secondary" />{project.category}</p>
                  <div className="flex flex-wrap gap-2">
                    {(project.skills || []).map(skill => (
                      <span key={skill} className={`rounded-lg border px-3 py-1 text-label-sm ${project.matchedSkills?.includes(skill) ? 'border-primary/30 bg-primary/10 text-primary' : 'border-outline-variant/30 bg-surface-variant/40 text-on-surface'}`}>{skill}</span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-5 border-t border-outline-variant/10 pt-4 text-body-sm text-on-surface-variant">
                  <span className="flex items-center gap-1 font-semibold text-on-surface"><IndianRupee className="h-4 w-4 text-primary" />{Number(project.budget?.min || 0).toLocaleString('en-IN')} – ₹{Number(project.budget?.max || 0).toLocaleString('en-IN')}</span>
                  <span className="flex items-center gap-2"><Calendar className="h-4 w-4" />{deadline.toLocaleDateString()} · {daysRemaining} days remaining</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailableProjects;
