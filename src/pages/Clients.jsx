import React, { useState, useMemo, useEffect } from 'react';
import ClientTable from '../components/tables/ClientTable';
import ClientDetails from '../components/drawers/ClientDetails';
import Card from '../components/ui/Card';
import { List, LayoutGrid, Download, RefreshCw, Users, Activity, Target } from 'lucide-react';
import { useClients } from '../context/ClientContext';
import { useProjects } from '../context/ProjectContext';
import * as XLSX from 'xlsx';
import { formatCurrency } from '../services/api';
import * as clientService from '../services/clientService';
import toast from 'react-hot-toast';

const Clients = () => {
  const [viewMode, setViewMode] = useState(window.innerWidth < 768 ? 'grid' : 'table'); // 'table' or 'grid'

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const {
    clients,
    page,
    setPage,
    search: filterText,
    setSearch: setFilterText,
    status: activeChip,
    setStatus: setActiveChip,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    totalPages,
    totalCount,
    refreshClients
  } = useClients();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [selectedClientForDrawer, setSelectedClientForDrawer] = useState(null);

  const { projects } = useProjects();

  const activeClients = clients.filter(c => c.status === 'Active').length;
  const activePercentage = clients.length > 0 ? Math.round((activeClients / clients.length) * 100) : 0;

  // Keep the selected client in sync with the global clients context
  const currentSelectedClient = useMemo(() => {
    if (!selectedClientForDrawer) return null;
    return clients.find(c => c.id === selectedClientForDrawer.id) || selectedClientForDrawer;
  }, [clients, selectedClientForDrawer]);

  const filteredClients = clients;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setFilterText('');
    setActiveChip('All');
    if (refreshClients) {
      await refreshClients();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getExportData = async () => {
    try {
      console.log('Fetching export data with parameters:', {
        search: filterText || '',
        status: activeChip === 'All' ? '' : activeChip,
        sortBy,
        sortOrder,
        paginate: 'false'
      });

      const res = await clientService.getClients({
        search: filterText || '',
        status: activeChip === 'All' ? '' : activeChip,
        sortBy,
        sortOrder,
        paginate: 'false'
      });

      console.log('Raw export response:', res);
      const allClientsRaw = Array.isArray(res) ? res : (res?.items || res?.data || []);
      console.log('Raw export clients:', allClientsRaw);

      const enrichedAll = allClientsRaw.map(c => {
        const id = c._id || c.id;
        const clientName = c.fullName || c.name || '';

        const clientProjects = projects.filter(p => {
          const linkedClient = p.platformClient || p.client;
          const pClientId = linkedClient && typeof linkedClient === 'object' ? linkedClient._id : linkedClient;
          return pClientId?.toString() === id?.toString();
        });

        const totalProjects = c.projectCount ?? clientProjects.length;

        let lifetimeBilling = 0;
        clientProjects.forEach(p => {
          if (p.hourlyRate > 0) {
            lifetimeBilling += (p.hourlyRate * (p.workedHours || 0));
          } else {
            lifetimeBilling += (p.budget || 0);
          }
        });

        return {
          name: clientName,
          company: c.company || '',
          industry: c.industry || 'Marketing Agency',
          status: c.status || '',
          totalProjects,
          lifetimeBilling
        };
      });

      return enrichedAll.map(c => ({
        Name: c.name || '',
        Company: c.company || '',
        Industry: c.industry || '',
        Status: c.status || '',
        Projects: c.totalProjects || 0,
        Revenue: formatCurrency(c.lifetimeBilling || 0),
        'Last Activity': 'Online Now'
      }));
    } catch (error) {
      console.error('Error preparing export data:', error);
      toast.error('Failed to prepare export data: ' + error.message);
      return [];
    }
  };

  const exportCSV = async () => {
    try {
      const data = await getExportData();
      if (data.length === 0) {
        toast.error("No data available to export");
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [];
      csvRows.push(headers.join(','));

      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          const valStr = (val === null || val === undefined) ? '' : String(val);
          const escaped = valStr.replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }

      const csvContent = csvRows.join('\n');
      console.log('CSV string generated, creating blob...');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'clients.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Delay revoking URL to ensure browser download starts
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);

      setIsExportMenuOpen(false);
      toast.success('Successfully exported clients to CSV');
    } catch (err) {
      console.error('Export CSV failed:', err);
      toast.error('Export CSV failed: ' + err.message);
    }
  };

  const exportJSON = async () => {
    try {
      const data = await getExportData();
      if (data.length === 0) {
        toast.error("No data available to export");
        return;
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'clients.json');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Delay revoking URL to ensure browser download starts
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 100);

      setIsExportMenuOpen(false);
      toast.success('Successfully exported clients to JSON');
    } catch (err) {
      console.error('Export JSON failed:', err);
      toast.error('Export JSON failed: ' + err.message);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = () => setIsExportMenuOpen(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <>
      <div className="relative mb-10 p-8 rounded-3xl border border-outline-variant/20 overflow-visible bg-surface-container-low/50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent opacity-60 rounded-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="font-display-lg text-display-lg text-on-surface mb-2">Client Portfolio</h2>
            <p className="text-on-surface-variant font-body-lg">Manage relationships and track financial performance across your workspace.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-xl border border-outline-variant/20 text-on-surface-variant hover:text-primary hover:bg-primary-container/10 transition-all active:scale-95 duration-200 bg-surface-container-high/50 shadow-sm hover:shadow"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin text-primary' : ''}`} />
            </button>

            <div className="relative">
              <button
                onClick={(e) => { e.stopPropagation(); setIsExportMenuOpen(!isExportMenuOpen); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/20 text-on-surface hover:bg-surface-variant/50 transition-all active:scale-95 duration-200 font-label-caps text-label-caps font-bold bg-surface-container-high/50 shadow-sm hover:shadow"
              >
                <Download className="w-[1.125rem] h-[1.125rem]" />
                Export
              </button>
              {isExportMenuOpen && (
                <div className="absolute right-0 top-12 w-40 bg-surface-container-high border border-outline-variant/20 rounded-2xl shadow-2xl z-[100] overflow-hidden py-1.5 animate-in fade-in zoom-in-95 duration-200">
                  <button onClick={exportCSV} className="w-full text-left px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-variant/50 transition-colors">Export CSV</button>
                  <button onClick={exportJSON} className="w-full text-left px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-variant/50 transition-colors">Export JSON</button>
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center bg-surface-container-high p-1 rounded-xl border border-outline-variant/20 ml-2 shadow-sm">
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 px-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${viewMode === 'table' ? 'bg-surface-variant text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <List className="w-[1.125rem] h-[1.125rem]" />
                <span className="font-label-caps text-[0.625rem] uppercase font-bold hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 px-3 rounded-lg flex items-center gap-2 transition-all duration-300 ${viewMode === 'grid' ? 'bg-surface-variant text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
              >
                <LayoutGrid className="w-[1.125rem] h-[1.125rem]" />
                <span className="font-label-caps text-[0.625rem] uppercase font-bold hidden sm:inline">Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1: Total Clients */}
        <Card className="rounded-[1.5rem] relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none scale-150 -translate-y-4 translate-x-4">
            <Users className="w-32 h-32 text-primary" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 shadow-inner">
                <Users className="w-6 h-6" />
              </div>
              <div className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-1.5 text-primary shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                <span className="font-label-caps text-[10px] font-bold tracking-wider">+12% Monthly Growth</span>
              </div>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Total Clients</p>
            <div className="flex items-end justify-between">
              <h3 className="font-display-sm text-display-sm text-on-surface leading-none">{clients.length}</h3>
              {/* Sparkline Mock */}
              <svg className="w-24 h-8 text-primary opacity-80" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0,25 L15,20 L30,22 L45,15 L60,18 L75,10 L90,12 L100,5" />
              </svg>
            </div>
          </div>
        </Card>

        {/* Card 2: Active Clients */}
        <Card className="rounded-[1.5rem] relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none scale-150 -translate-y-4 translate-x-4">
            <Activity className="w-32 h-32 text-tertiary" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/10 shadow-inner">
                <Activity className="w-6 h-6" />
              </div>
              <div className="px-3 py-1.5 bg-tertiary/10 border border-tertiary/20 rounded-full flex items-center gap-1.5 text-tertiary shadow-sm">
                <span className="font-label-caps text-[10px] font-bold tracking-wider">{activePercentage}% Active Rate</span>
              </div>
            </div>
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Active Clients</p>
            <div className="flex items-end justify-between">
              <h3 className="font-display-sm text-display-sm text-on-surface leading-none">{activeClients}</h3>
              {/* Mini Bar Chart Mock */}
              <div className="flex items-end gap-1.5 h-8">
                <div className="w-1.5 h-3 bg-tertiary/40 rounded-full"></div>
                <div className="w-1.5 h-4 bg-tertiary/40 rounded-full"></div>
                <div className="w-1.5 h-6 bg-tertiary/60 rounded-full"></div>
                <div className="w-1.5 h-5 bg-tertiary/60 rounded-full"></div>
                <div className="w-1.5 h-8 bg-tertiary rounded-full"></div>
                <div className="w-1.5 h-7 bg-tertiary rounded-full"></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Active Projects */}
        <Card className="rounded-[1.5rem] relative overflow-hidden shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0"></div>
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none scale-150 translate-y-4 translate-x-4 duration-500">
            <Target className="w-32 h-32 text-secondary" />
          </div>
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Active Projects</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="font-display-sm text-display-sm text-on-surface leading-none">{projects.length}</h3>
                  <span className="text-body-sm text-on-surface-variant font-medium">Across {clients.length} Clients</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full border-[3px] border-surface-container flex items-center justify-center relative shadow-sm bg-surface">
                <span className="text-[10px] font-black text-secondary">64%</span>
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-secondary drop-shadow-[0_0_3px_rgba(var(--color-secondary),0.5)]" strokeDasharray="64, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="2.5" />
                </svg>
              </div>
            </div>

            <div className="flex items-center justify-between mt-auto">
              <div className="flex -space-x-3">
                {clients.slice(0, 4).map((client) => (
                  <img key={client.id} src={client.avatar} alt={client.name} className="w-10 h-10 rounded-full border-2 border-surface-container-low object-cover shadow relative" />
                ))}
                {clients.length > 4 && (
                  <div className="w-10 h-10 rounded-full border-2 border-surface-container-low bg-surface-variant flex items-center justify-center text-[10px] font-bold shadow z-10">
                    +{clients.length - 4}
                  </div>
                )}
              </div>
              <p className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-wider">Team Velocity <span className="text-secondary ml-1">↑</span></p>
            </div>
          </div>
        </Card>
      </div>

      <ClientTable
        viewMode={viewMode}
        filterText={filterText}
        setFilterText={setFilterText}
        activeChip={activeChip}
        setActiveChip={setActiveChip}
        filteredClients={filteredClients}
        onViewClient={(client) => setSelectedClientForDrawer(client)}
        page={page}
        setPage={setPage}
        totalPages={totalPages}
        totalCount={totalCount}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />

      <ClientDetails
        client={currentSelectedClient}
        isOpen={!!selectedClientForDrawer}
        onClose={() => setSelectedClientForDrawer(null)}
      />
    </>
  );
};

export default Clients;
