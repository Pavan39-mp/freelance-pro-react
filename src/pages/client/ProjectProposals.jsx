import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, IndianRupee, Star, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import TextPreview from '../../components/ui/TextPreview';
import { getClientProposalProjects, getProjectProposals, updateProposalStatus } from '../../services/projectProposalService';

const ProjectProposals = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingProposals, setLoadingProposals] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const loadProjects = async () => {
    const response = await getClientProposalProjects();
    setProjects(Array.isArray(response?.data) ? response.data : []);
  };

  useEffect(() => {
    loadProjects().catch(error => toast.error(error.message || 'Failed to load marketplace projects.')).finally(() => setLoading(false));
  }, []);

  const viewProposals = async project => {
    setSelectedRequest(project);
    setLoadingProposals(true);
    try {
      const response = await getProjectProposals(project._id);
      setProposals(response?.data?.proposals || []);
    } catch (error) {
      toast.error(error.message || 'Failed to load proposals.');
    } finally {
      setLoadingProposals(false);
    }
  };

  const changeStatus = async (proposalId, status) => {
    setProcessingId(proposalId);
    try {
      await updateProposalStatus(proposalId, status);
      toast.success(`Proposal ${status.toLowerCase()} successfully.`);
      await Promise.all([viewProposals(selectedRequest), loadProjects()]);
    } catch (error) {
      toast.error(error.message || `Failed to ${status.toLowerCase()} proposal.`);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-12 animate-fade-in">
      <div><h1 className="font-title-lg font-bold text-on-surface">My Marketplace Projects</h1><p className="mt-2 text-body-md text-on-surface-variant">Review and compare Freelancer proposals for your marketplace requests.</p></div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {projects.map(project => (
          <Card key={project._id} className={`space-y-4 p-6 ${selectedRequest?._id === project._id ? 'ring-2 ring-primary' : ''}`}>
            <div><h2 className="font-title-md font-bold text-on-surface">{project.title}</h2><p className="mt-1 text-body-sm text-on-surface-variant">{project.category} · {project.status}</p></div>
            <p className="font-bold text-primary">{project.proposalCount} {project.proposalCount === 1 ? 'Proposal' : 'Proposals'} Received</p>
            <Button onClick={() => viewProposals(project)}>View Proposals</Button>
          </Card>
        ))}
      </div>
      {projects.length === 0 && <Card className="p-12 text-center text-on-surface-variant">No marketplace project requests found.</Card>}

      {selectedRequest && (
        <div className="space-y-4">
          <h2 className="font-title-lg font-bold text-on-surface">Proposals for {selectedRequest.title}</h2>
          {loadingProposals ? <Card className="p-10 text-center text-on-surface-variant">Loading proposals…</Card> : proposals.length === 0 ? <Card className="p-10 text-center text-on-surface-variant">No proposals received yet.</Card> : proposals.map(proposal => {
            const freelancer = proposal.freelancer || {};
            const skills = String(freelancer.skills || '').split(',').map(skill => skill.trim()).filter(Boolean);
            return (
              <Card key={proposal._id} className="space-y-5 p-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div className="flex min-w-0 items-center gap-4">
                    {freelancer.profilePicture ? <img src={freelancer.profilePicture} alt={freelancer.name} className="h-14 w-14 rounded-xl object-cover" /> : <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><UserRound className="h-6 w-6" /></div>}
                    <div className="min-w-0"><button type="button" onClick={() => navigate(`/client/freelancer/${freelancer._id}`)} className="font-title-md font-bold text-on-surface hover:text-primary">{freelancer.name}</button><p className="text-body-sm text-on-surface-variant">{freelancer.title || `${freelancer.experienceYears || 0} years experience`}</p><p className="mt-1 flex items-center gap-1 text-body-sm text-primary"><Star className="h-4 w-4 fill-current" />{Number(freelancer.averageRating || 0).toFixed(1)} · {freelancer.totalReviews || 0} reviews</p></div>
                  </div>
                  <span className="rounded-full bg-surface-variant/50 px-3 py-1 text-label-sm font-bold text-on-surface">{proposal.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">{skills.map(skill => <span key={skill} className="rounded-lg border border-outline-variant/20 bg-surface-variant/40 px-3 py-1 text-label-sm text-on-surface">{skill}</span>)}</div>
                <div className="flex flex-wrap gap-5 border-y border-outline-variant/10 py-4 text-body-md text-on-surface"><span className="flex items-center gap-1"><IndianRupee className="h-4 w-4 text-primary" />{Number(proposal.proposedBudget).toLocaleString('en-IN')}</span><span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-tertiary" />{proposal.deliveryDays} days</span><span>{freelancer.completedProjects || 0} completed projects</span></div>
                <TextPreview lines={5} className="text-body-md text-on-surface-variant">{proposal.message}</TextPreview>
                {freelancer.previousWork?.length > 0 && <div><p className="mb-2 font-label-caps text-label-caps text-on-surface-variant">Previous Work</p><div className="flex flex-wrap gap-2">{freelancer.previousWork.slice(0, 3).map(work => <span key={work._id} className="rounded-lg bg-surface-container-high px-3 py-2 text-body-sm text-on-surface">{work.title} · {work.category}</span>)}</div></div>}
                {proposal.status === 'Pending' && <div className="flex flex-col justify-end gap-3 sm:flex-row"><Button variant="outline" disabled={processingId === proposal._id} onClick={() => changeStatus(proposal._id, 'Rejected')}>Reject Proposal</Button><Button disabled={processingId === proposal._id} onClick={() => changeStatus(proposal._id, 'Accepted')}>Accept Proposal</Button></div>}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectProposals;
