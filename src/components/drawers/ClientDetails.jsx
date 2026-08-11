import React, { useState } from 'react';
import DetailsDrawer from '../ui/DetailsDrawer';
import { formatCurrency } from '../../services/api';
import ScheduleMeetingForm from '../forms/ScheduleMeetingForm';
import { useProjects } from '../../context/ProjectContext';
import { useMeetings } from '../../context/MeetingContext';
import { useInvoices } from '../../context/InvoiceContext';
import { X, Mail, Phone, MapPin, Building, Calendar, Video, CheckCircle2, ArrowLeft } from 'lucide-react';
import ClientReliabilityCard from '../intelligence/ClientReliabilityCard';

const ClientDetails = ({ client, isOpen, onClose }) => {
  const [currentView, setCurrentView] = useState('details');
  const { projects } = useProjects();
  const { meetings } = useMeetings();
  const { invoices } = useInvoices();

  if (!client) return null;

  const company = client.company || client.user?.company || client.industry || 'Not provided';
  const location = client.location || client.user?.location || client.country || 'Not provided';

  const clientInvoices = invoices.filter(inv => {
    const cId = inv.client && typeof inv.client === 'object' ? inv.client._id : inv.client;
    return cId === (client._id || client.id);
  });

  const billingData = clientInvoices.reduce((acc, inv) => {
    if (inv.status !== 'Draft' && inv.status !== 'Cancelled') {
      acc.totalBilled += inv.total;
      acc.totalPaid += (inv.paidAmount || 0);
      acc.outstanding += (inv.total - (inv.paidAmount || 0));
    }
    return acc;
  }, { totalBilled: 0, totalPaid: 0, outstanding: 0 });

  const clientProjects = projects.filter(p => {
    const linkedClient = p.platformClient || p.client;
    const pClientId = linkedClient && typeof linkedClient === 'object' ? linkedClient._id : linkedClient;
    const clientId = client._id || client.id;
    return pClientId?.toString() === clientId?.toString();
  });
  const activeProjects = clientProjects.filter(p => p.status === 'Active' || p.status === 'In Progress').length;
  const completedProjects = clientProjects.filter(p => p.status === 'Completed').length;

  const clientMeetings = meetings.filter(m => m.client === client.name)
    .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`));

  const handleClose = () => {
    setCurrentView('details'); // Reset on close
    onClose();
  };

  return (
    <DetailsDrawer isOpen={isOpen} onClose={handleClose}>

      {/* Dynamic Header */}
      {currentView !== 'details' ? (
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10 bg-surface-container-low shrink-0 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentView('details')} className="p-2 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-full transition-colors -ml-2">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Schedule Meeting
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 text-on-surface-variant hover:bg-surface-variant hover:text-error rounded-full transition-colors -mr-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-start justify-between p-6 border-b border-outline-variant/10 bg-surface-container-low shrink-0 animate-in fade-in slide-in-from-left-2 duration-300">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm shrink-0">
              {client.avatar ? (
                <img src={client.avatar} alt={client.name} className="w-full h-full object-cover" />
              ) : (
                <span className="font-display-sm text-primary">{client.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h2 className="font-display-sm text-on-surface leading-tight mb-1">{client.name}</h2>
              <div className="flex items-center gap-2">
                <span className="text-body-sm text-on-surface-variant font-medium">{company}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full tracking-wider font-bold ${client.status === 'Active' ? 'bg-primary/20 text-primary' : 'bg-surface-variant text-on-surface-variant'}`}>
                  {client.status}
                </span>
              </div>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 text-on-surface-variant hover:bg-surface-variant hover:text-error rounded-full transition-colors -mr-2 -mt-2">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Embedded Views */}
      {currentView === 'schedule' && (
        <div className="flex-1 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
          <ScheduleMeetingForm prefillClient={client} isEmbedded onClose={() => setCurrentView('details')} />
        </div>
      )}

      {/* Main Details View */}
      {currentView === 'details' && (
        <>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8 bg-surface animate-in fade-in slide-in-from-left-4 duration-300">

            <section>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mb-4">General Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex gap-3 items-center">
                  <Mail className="w-4 h-4 text-primary opacity-70 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">Email</p>
                    <p className="font-body-sm text-on-surface truncate">{client.email || '—'}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <Phone className="w-4 h-4 text-primary opacity-70 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">Phone</p>
                    <p className="font-body-sm text-on-surface truncate">{client.phone || '—'}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <Building className="w-4 h-4 text-secondary opacity-70 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">Company</p>
                    <p className="font-body-sm text-on-surface truncate">{company}</p>
                  </div>
                </div>
                <div className="flex gap-3 items-center">
                  <MapPin className="w-4 h-4 text-tertiary opacity-70 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-on-surface-variant font-bold tracking-widest">Location</p>
                    <p className="font-body-sm text-on-surface truncate">{location}</p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mb-4">Project Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl flex flex-col items-center text-center">
                  <p className="text-display-sm text-on-surface mb-1">{clientProjects.length}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant tracking-wider">Total Projects</p>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex flex-col items-center text-center">
                  <p className="text-display-sm text-primary mb-1">{activeProjects}</p>
                  <p className="text-[10px] font-bold text-primary/80 tracking-wider">Active</p>
                </div>
              </div>
            </section>

            <ClientReliabilityCard clientId={client._id || client.id} />

            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">Recent Projects</h3>
                <button className="text-[10px] text-primary font-bold hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {clientProjects.slice(0, 3).map(project => (
                  <div key={project.id} className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl hover:border-primary/30 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-body-md font-bold text-on-surface group-hover:text-primary transition-colors truncate pr-2">{project.title}</h4>
                      <span className="text-[9px] px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-full font-bold whitespace-nowrap">{project.status}</span>
                    </div>
                    <div className="w-full bg-surface-variant h-1.5 rounded-full overflow-hidden mb-2">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${project.progress || 0}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-on-surface-variant">
                      <span>{project.progress || 0}% Complete</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No deadline'}</span>
                    </div>
                  </div>
                ))}
                {clientProjects.length === 0 && (
                  <div className="text-center p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 border-dashed">
                    <p className="text-body-sm text-on-surface-variant">No projects yet.</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest">Meetings</h3>
                <button onClick={() => setCurrentView('schedule')} className="text-[10px] text-primary font-bold hover:underline">Schedule</button>
              </div>
              <div className="space-y-3">
                {clientMeetings.slice(0, 3).map(meeting => (
                  <div key={meeting.id} className="p-3 bg-surface-container-low border border-outline-variant/10 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${meeting.status === 'Completed' ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary/10 text-primary'}`}>
                        {meeting.type === 'Online' ? <Video className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-body-sm font-bold text-on-surface truncate mb-0.5">{meeting.title}</p>
                        <p className="text-[10px] text-on-surface-variant flex items-center gap-2">
                          <span>{new Date(meeting.date).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{meeting.time}</span>
                        </p>
                      </div>
                    </div>
                    {meeting.joinUrl && meeting.status !== 'Completed' && (
                      <a href={meeting.joinUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 p-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors">
                        <Video className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
                {clientMeetings.length === 0 && (
                  <div className="text-center p-6 bg-surface-container-low/50 rounded-2xl border border-outline-variant/10 border-dashed">
                    <p className="text-body-sm text-on-surface-variant">No meetings scheduled.</p>
                  </div>
                )}
              </div>
            </section>

            <section>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mb-4">Invoice & Billing</h3>
              <div className="p-4 bg-surface-container-low border border-outline-variant/10 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-b border-outline-variant/10 pb-4">
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant mb-1">Total Billed</p>
                    <p className="text-headline-sm font-bold text-on-surface">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(billingData?.totalBilled || client.lifetimeBilling || 0)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-on-surface-variant mb-1">Total Paid</p>
                    <p className="text-headline-sm font-bold text-tertiary">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(billingData?.totalPaid || 0)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant mb-1">Outstanding</p>
                    <p className="text-headline-sm font-bold text-error">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(billingData?.outstanding || 0)}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-on-surface-variant mb-2">Recent Invoices</p>
                  <div className="space-y-2">
                    {clientInvoices.slice(0, 3).map(inv => (
                      <div key={inv._id} className="flex justify-between items-center text-body-sm">
                        <span className="text-on-surface font-medium">{inv.invoiceNumber}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${inv.status === 'Paid' ? 'bg-tertiary/10 text-tertiary' :
                          inv.status === 'Overdue' ? 'bg-error/10 text-error' :
                            'bg-primary/10 text-primary'
                          }`}>{inv.status}</span>
                      </div>
                    ))}
                    {clientInvoices.length === 0 && <span className="text-on-surface-variant text-body-sm">No invoices found.</span>}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="font-label-caps text-label-caps text-on-surface-variant tracking-widest mb-4">Recent Activity</h3>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[19px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-outline-variant/20 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface bg-primary text-on-primary shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-2xl bg-surface-container-low border border-outline-variant/10 shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-[12px] text-on-surface">Client Created</h4>
                      <time className="text-[9px] font-bold text-on-surface-variant">2 days ago</time>
                    </div>
                    <p className="text-[11px] text-on-surface-variant leading-tight">Profile and initial data imported successfully.</p>
                  </div>
                </div>
              </div>
            </section>

          </div>

          <div className="p-4 border-t border-outline-variant/10 bg-surface-container-high shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <button onClick={() => setCurrentView('schedule')} className="py-2.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-label-caps text-[11px] font-bold transition-colors">
              Schedule Meeting
            </button>
          </div>
        </>
      )}
    </DetailsDrawer>
  );
};

export default ClientDetails;
